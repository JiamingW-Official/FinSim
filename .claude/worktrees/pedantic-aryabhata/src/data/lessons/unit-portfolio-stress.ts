import type { Unit } from "./types";

export const UNIT_PORTFOLIO_STRESS: Unit = {
 id: "portfolio-stress",
 title: "Portfolio Stress Testing",
 description:
 "Design and run portfolio stress tests, scenario analyses, tail risk simulations, and crisis preparation frameworks",
 icon: "Zap",
 color: "#dc2626",
 lessons: [
 // Lesson 1: Historical Crisis Analysis 
 {
 id: "portfolio-stress-1",
 title: "Historical Crisis Analysis",
 description:
 "Study the 2008 GFC, 2020 COVID crash, 2022 rate shock, 1970s stagflation, and EM crises to understand which assets protect and which fail",
 icon: "History",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "The 2008 Global Financial Crisis",
 content:
 "The 2008 GFC remains the defining stress event for modern portfolio risk management.\n\n**Market impacts**:\n- **Equities**: S&P 500 fell ~55% peak-to-trough (October 2007 to March 2009)\n- **Credit spreads**: Investment grade spreads widened +300bps; high-yield spreads blew out +600bps — the cost of borrowing for companies exploded\n- **VIX**: Spiked to 80 in October 2008 — more than 4× its long-run average of ~18\n- **Liquidity freeze**: Interbank lending seized up. LIBOR-OIS spread — a measure of bank stress — hit 365bps (normal: ~10bps)\n\n**What failed**:\n- Diversified equity portfolios (all sectors fell)\n- Structured credit (CDOs, CMBS) — losses far exceeded model predictions\n- Leveraged strategies — margin calls forced selling at the worst prices\n- \"Safe\" money market funds (Reserve Primary Fund broke the buck)\n\n**What worked**:\n- US Treasuries: 10-year yields fell as investors fled to safety (prices up ~20%)\n- Gold: held value and rallied modestly in late 2008\n- Short volatility unwind: those who were long volatility (long VIX calls) profited enormously\n- Cash: preserved capital but missed the 2009–2019 bull market",
 highlight: [
 "GFC",
 "credit spreads",
 "VIX",
 "liquidity freeze",
 "LIBOR-OIS",
 "CDOs",
 "margin calls",
 "money market funds",
 "Treasuries",
 ],
 },
 {
 type: "teach",
 title: "2020 COVID Crash and the 2022 Rate Shock",
 content:
 "Two very different crises — one a demand shock, one a policy shock — with very different portfolio implications.\n\n**2020 COVID crash**:\n- **Speed**: -34% in the S&P 500 in just 23 trading days (Feb 19 to Mar 23, 2020) — the fastest bear market in history\n- **V-shaped recovery**: Unprecedented fiscal and monetary stimulus drove a full recovery within 5 months\n- **What worked**: Treasuries (10-year fell from 1.9% to 0.5%), gold, tech stocks (digital acceleration), cash briefly\n- **What failed**: Airlines, hotels, energy, small-cap value\n\n**2022 rate shock**:\n- The Fed raised rates 425bps in a single year — the fastest tightening cycle since the 1980s\n- **The 60/40 portfolio recorded its worst year since 1970** — both stocks AND bonds fell simultaneously\n- S&P 500: -18%; US Aggregate Bond Index: -13%. A 60/40 portfolio lost ~16%\n- **Why bonds failed**: Duration risk. When rates rise sharply, existing bond prices fall. The bonds that were supposed to cushion equity losses became a second source of losses\n- **What worked**: Commodities (energy +65%), trend-following (managed futures), short-duration bonds, TIPS\n\n**Key insight**: The bond-equity diversification benefit relies on central banks cutting rates in recessions. When inflation forces rates UP during an equity decline, the traditional hedge breaks down.",
 highlight: [
 "COVID crash",
 "23 trading days",
 "V-shaped recovery",
 "60/40 portfolio",
 "duration risk",
 "rate shock",
 "managed futures",
 "TIPS",
 "tightening cycle",
 ],
 },
 {
 type: "teach",
 title: "Stagflation, EM Crises, and Crisis Lessons",
 content:
 "**1970s stagflation**:\n- CPI exceeded 10% multiple times; oil embargo (1973 Arab oil embargo, 1979 Iranian Revolution) created supply shocks\n- Real equity returns were deeply negative across the decade — nominal gains were wiped out by inflation\n- Bonds also suffered as yields rose to combat inflation (10-year peaked at 15.8% in 1981)\n- **What worked**: Commodities (oil, gold), TIPS-equivalent instruments, real assets\n- **Lesson**: Inflation is the silent portfolio killer — assets that appear to hold nominal value may lose real purchasing power\n\n**Emerging market crises — a pattern**:\n- **Asia 1997**: Pegged currencies broke (Thai baht, Indonesian rupiah, Korean won); equity markets fell 40–80%; contagion spread globally\n- **Russia 1998**: Oil price collapse + overvalued ruble + fiscal deficit default on domestic debt; LTCM nearly collapsed the global financial system\n- **Turkey 2018/2021**: Currency crisis as lira lost 40–50% against the dollar; local equity returns looked positive in lira but catastrophic in USD\n- **EM crisis pattern**: currency collapse + equity crash + credit spread blowout tend to happen simultaneously — correlation spikes to near 1\n\n**Universal crisis lessons**:\n1. Correlations spike in crises — diversification fails when you need it most\n2. Liquidity disappears — bid-ask spreads widen 10–50× in stressed markets\n3. Crisis events are underestimated in frequency by historical models\n4. What worked in the last crisis often fails in the next one",
 highlight: [
 "stagflation",
 "oil embargo",
 "inflation",
 "real returns",
 "Asian crisis",
 "LTCM",
 "currency crisis",
 "contagion",
 "correlation spike",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A 60/40 portfolio (60% equities, 40% bonds) experienced its worst year since 1970 in 2022. What was the primary reason bonds failed to protect the portfolio that year?",
 options: [
 "Bond issuers defaulted at record rates, causing credit losses across the portfolio",
 "The Fed rapidly raised interest rates to fight inflation, causing existing bond prices to fall simultaneously with equities",
 "Bond liquidity dried up completely, forcing investors to sell at steep discounts",
 "Foreign central banks dumped US Treasuries, creating a supply glut that depressed prices",
 ],
 correctIndex: 1,
 explanation:
 "The 60/40 portfolio's diversification benefit depends on a flight-to-safety dynamic where bonds rally when equities fall. This works when rate cuts accompany recessions. In 2022, the Fed was forced to raise rates aggressively (425bps) to combat 40-year-high inflation, which caused bond prices to fall sharply (bonds have inverse price-to-yield relationship). For the first time in decades, bonds and equities fell simultaneously — the US Aggregate Bond Index fell ~13% and equities fell ~18%, producing one of the worst years for balanced portfolios in history.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "During the 2020 COVID crash, US Treasuries fell sharply along with equities, making them an ineffective hedge during that crisis.",
 correct: false,
 explanation:
 "FALSE. In the 2020 COVID crash, US Treasuries behaved as a traditional safe-haven asset — they rallied as investors fled to safety. The 10-year Treasury yield fell from approximately 1.9% to 0.5%, meaning bond prices rose significantly, partially offsetting equity losses. This is a contrast with 2022, when the Fed's rate-hiking cycle caused bonds to fall alongside equities. The COVID crash was a demand shock met with extraordinary monetary easing, which supported Treasuries. The 2022 rate shock was a supply-side inflation event where the Fed had to tighten, which was the unusual scenario that broke the bond-equity negative correlation.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Scenario Construction 
 {
 id: "portfolio-stress-2",
 title: "Scenario Construction",
 description:
 "Build plausible macro narratives, translate economic shocks to asset returns, and model regulatory, geopolitical, and climate scenarios",
 icon: "Map",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Narrative Scenarios and Factor Shocks",
 content:
 "Scenario construction transforms a qualitative macro narrative into quantitative portfolio impacts.\n\n**Step 1 — The narrative**: Write a plausible, internally consistent economic story. Example: \"A US-China trade war escalates sharply. Tariffs rise to 60% on all goods. Supply chain disruption causes a stagflationary shock — inflation rises to 6%, GDP growth falls to -1%, and the Fed faces an impossible choice.\"\n\n**Step 2 — Identify the key macro variables**:\n- GDP growth rate, inflation, unemployment\n- Fed funds rate path\n- USD strength (safe haven or not?)\n- Corporate earnings revision\n\n**Step 3 — Factor shocks** translate economic changes to asset returns:\n- Equity markets: historical sensitivity to earnings growth changes, P/E multiple compression, macro surprises\n- Fixed income: duration sensitivity to rate changes (modified duration × Δrate × -1 = approximate price impact)\n- Commodities: supply/demand disruption, inflation linkage\n- FX: current account, capital flows, safe-haven status\n\n**Example factor shock**:\nIf scenario implies Fed raises rates 200bps and equities see a 20% earnings decline:\n- A 7-year duration bond falls approximately 14% (7 × 2%)\n- Equities fall ~25% (20% earnings decline + 10% multiple compression from higher discount rate)\n- USD may strengthen (higher rates attract capital) or weaken (recession fears)\n\n**Sensitivity tables** show portfolio P&L for a matrix of shocked variables — e.g., equity 20% × rates +200bps.",
 highlight: [
 "narrative scenario",
 "factor shocks",
 "macro variables",
 "modified duration",
 "P/E multiple compression",
 "sensitivity table",
 "stagflationary",
 "earnings revision",
 ],
 },
 {
 type: "teach",
 title: "Correlation Shifts and Regulatory Scenarios",
 content:
 "**Correlation matrix shifts in crises**:\n- In normal markets, asset correlations are moderate and diversification works as expected\n- In crises, correlations converge toward 1 — everything falls together\n- **Empirical finding**: The average pairwise correlation among equity sectors rises from ~0.3 in bull markets to ~0.8 in bear markets\n- **Why**: Forced selling (margin calls, redemptions) hits all assets simultaneously. Fear is not asset-specific\n- **Implication**: Portfolio risk calculated using normal-market correlations severely underestimates crisis risk. A portfolio with 20% estimated standard deviation in normal markets may have 35%+ effective vol in a crisis\n\n**Stressed correlation matrix**: Replace normal correlations with crisis-era correlations (e.g., from 2008) to get a realistic stress estimate. Many risk models do this automatically.\n\n**Regulatory stress scenarios — DFAST (Dodd-Frank Act Stress Test)**:\nUS bank regulators require large banks to demonstrate they can survive a \"severely adverse\" scenario:\n- Unemployment rises to 10% (from current ~4%)\n- GDP contracts 4–5%\n- Equities fall ~50%\n- House prices fall 25%\n- Commercial real estate falls 35%\n\nThese are not predictions — they are standardized worst-case benchmarks that allow consistent comparison across institutions. Portfolio managers at large institutions use these as reference points for their own stress testing.",
 highlight: [
 "correlation matrix",
 "correlations converge",
 "forced selling",
 "stressed correlation",
 "DFAST",
 "severely adverse scenario",
 "margin calls",
 "pairwise correlation",
 ],
 },
 {
 type: "teach",
 title: "Geopolitical and Climate Scenarios",
 content:
 "**Geopolitical scenarios** have become a central pillar of institutional risk management:\n\n**Taiwan conflict scenario**:\n- Key inputs: Semiconductor supply disruption (Taiwan produces ~90% of leading-edge chips), China trade embargo, US military response\n- Asset impacts: Tech sector -40% to -60% (Apple, NVIDIA heavily exposed), energy prices spike, supply chain collapse, USD spikes as safe haven, EM Asia equities collapse\n- Duration: Short (weeks) if deterrence holds; sustained disruption (6–24 months) if conflict occurs\n\n**Cyber attack on financial infrastructure**:\n- Settlement systems (SWIFT, DTCC) disrupted\n- Trading halts, liquidity withdrawal, bank run dynamics\n- Asset impacts: Broad risk-off, gold rally, crypto (unpredictable — could rally as alternative or collapse due to exchange outages)\n\n**Climate scenarios — two distinct risk types**:\n- **Physical risk**: Extreme weather events — hurricanes, floods, wildfires — destroy assets, disrupt supply chains, raise insurance costs. Coastal real estate, agriculture, energy infrastructure at risk\n- **Transition risk**: Policy response to climate change — carbon taxes, stranded fossil fuel assets. A $100/tonne carbon price would shave 30–50% from earnings of carbon-intensive companies\n\n**Network for Greening the Financial System (NGFS)** publishes climate scenarios (Orderly, Disorderly, Hot House World) that regulators increasingly require financial institutions to assess.",
 highlight: [
 "Taiwan conflict",
 "semiconductor supply",
 "cyber attack",
 "physical risk",
 "transition risk",
 "carbon pricing",
 "stranded assets",
 "NGFS",
 "geopolitical scenario",
 ],
 },
 {
 type: "quiz-scenario",
 scenario:
 "A risk manager at a major investment bank is asked to design a scenario for a sudden Middle East oil supply disruption — specifically, a conflict that takes 3 million barrels per day offline (roughly 3% of global supply) for 6–12 months.",
 question:
 "Which set of key scenario inputs most completely captures the first- and second-order effects of this disruption?",
 options: [
 "Oil price +50%, US equity markets -10%, gold +5%, all other assets unchanged",
 "Oil price +40-60%, inflation +2-3%, central bank policy dilemma (hike to fight inflation vs. cut for recession), energy sector +30%, transport/airline sector -20%, USD mixed, EM oil importers hit hardest",
 "Energy stocks +25%, consumer discretionary -15%, bonds unchanged, gold unchanged",
 "Oil price +30%, GDP growth -0.5%, all equity sectors fall equally by 5%, bonds rally 10%",
 ],
 correctIndex: 1,
 explanation:
 "A complete oil shock scenario requires capturing both direct and indirect effects. The direct effect is oil price — historical oil supply shocks of similar magnitude have caused 40–80% price increases. But the key second-order effects are: (1) inflation — oil price feeds into CPI directly and through transportation/manufacturing costs; (2) the central bank dilemma — stagflationary shocks put central banks in an impossible position (fighting inflation requires rate hikes that slow growth); (3) sector winners/losers — energy producers benefit massively while airlines, petrochemical users, and consumer spending suffer; (4) geographic effects — EM oil importers (India, Turkey) face double pressure from higher oil bills and USD strength. A simplistic scenario that assumes only oil moves and equities fall uniformly misses the complex cross-asset dynamics.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Tail Risk Measurement 
 {
 id: "portfolio-stress-3",
 title: "Tail Risk Measurement",
 description:
 "Understand fat tails, Extreme Value Theory, Expected Shortfall, stress correlations, and liquidity-adjusted risk measures",
 icon: "AlertTriangle",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Fat Tails and the Limits of Normal Distribution",
 content:
 "Modern portfolio theory and most standard risk models assume financial returns follow a **normal (Gaussian) distribution**. This assumption is dangerously wrong for tail events.\n\n**Fat tails** (leptokurtosis) means financial returns have:\n- **Higher kurtosis** than a normal distribution. Normal kurtosis = 3. Daily S&P 500 returns have kurtosis of ~7–10\n- **Much more frequent extreme moves** than a normal distribution predicts\n- Example: A 5-standard-deviation daily move should occur once every 13,932 years under normality. In practice, markets experience 5-sigma days roughly every few years\n\n**Power law tails**: Research by Mandelbrot and others found equity return tails follow a power law rather than exponential decay:\n- P(return > x) x^(-α) where α 3 for equities\n- This means large moves occur far more frequently than log-normal models imply\n- A \"100-year flood\" under normality may be a \"10-year flood\" under power law tails\n\n**Why this matters for risk management**:\n- VaR models calibrated to normal distribution grossly underestimate tail losses\n- An institution that believes its 99% daily VaR is $1M may be shocked to lose $3–5M on a bad day\n- Risk models that assume normality systematically undercharge for tail risk, encouraging excessive leverage",
 highlight: [
 "fat tails",
 "kurtosis",
 "normal distribution",
 "power law",
 "leptokurtosis",
 "5-sigma",
 "tail risk",
 "Mandelbrot",
 "VaR",
 ],
 },
 {
 type: "teach",
 title: "Extreme Value Theory and Expected Shortfall",
 content:
 "**Extreme Value Theory (EVT)** is a statistical framework specifically designed to model tail distributions. Rather than fitting a single distribution to all the data, EVT focuses exclusively on the extreme observations.\n\n**Peaks Over Threshold (POT) method**: Select all returns beyond a high threshold (e.g., worst 5% of days) and fit a Generalized Pareto Distribution to just those observations. This allows precise estimation of probabilities for extreme losses beyond the observed data range.\n\n**Generalized Extreme Value (GEV) distribution**: Models the distribution of block maxima (e.g., worst return each month). Key parameter is the tail index ξ — higher ξ means heavier tails.\n\n**Expected Shortfall (ES), also called CVaR or ETL**:\n- VaR at 99% answers: \"What is the minimum loss in the worst 1% of cases?\"\n- Expected Shortfall answers: \"What is the **average** loss in the worst 1% of cases?\"\n- ES captures the shape of the tail beyond VaR; VaR ignores it\n- Regulatory frameworks (Basel III, FRTB) have shifted from VaR to ES (at 97.5%) precisely because ES better captures tail risk\n\n**Example**: If 99% VaR = $1M and 1% of trading days produce losses of: $1.0M, $1.2M, $2.5M, $4.0M, $8.0M (5 days), then:\n- ES = ($1.0 + $1.2 + $2.5 + $4.0 + $8.0) / 5 = $3.34M — far more than the VaR suggests",
 highlight: [
 "Extreme Value Theory",
 "EVT",
 "Generalized Pareto Distribution",
 "Expected Shortfall",
 "CVaR",
 "Value at Risk",
 "tail index",
 "Basel III",
 "FRTB",
 "Peaks Over Threshold",
 ],
 },
 {
 type: "teach",
 title: "Stress Correlations and Liquidity-Adjusted VaR",
 content:
 "**Stress correlations — the diversification illusion**:\n- In normal markets, a portfolio of 20 uncorrelated assets achieves meaningful risk reduction\n- In crises, pairwise correlations converge toward 1. Assets that provided diversification in benign markets become highly correlated sources of simultaneous loss\n- **Empirical example**: In September–October 2008, the correlation between the S&P 500 and previously uncorrelated assets (EM equities, corporate bonds, commodities, REITs) all spiked above 0.8\n- **Practical implication**: True diversification in a crisis requires assets with fundamentally different payoff structures (e.g., long volatility, trend-following, government bonds at low initial yields) — not merely different sectors or geographies\n\n**Liquidity-adjusted VaR (LVaR)**:\nStandard VaR assumes positions can be liquidated at the current market price. In reality, large positions face:\n- **Market impact**: Selling a large position moves the price against you. A $500M equity position in a mid-cap stock may take 2 weeks to exit without significant price impact\n- **Bid-ask spread widening**: In 2008, bid-ask spreads on mortgage-backed securities widened from ~0.25% to 5%+\n- **Funding risk**: If a prime broker withdraws margin credit, forced liquidation at distressed prices can crystallize losses\n\n**LVaR = Standard VaR + Liquidity Cost**\nLiquidity cost = 0.5 × (bid-ask spread) × position size, often multiplied by a stress factor. For illiquid positions, this can double or triple the effective VaR.",
 highlight: [
 "stress correlations",
 "diversification illusion",
 "liquidity-adjusted VaR",
 "market impact",
 "bid-ask spread",
 "funding risk",
 "prime broker",
 "forced liquidation",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A portfolio's 99% daily VaR model shows a maximum expected daily loss of $1M. During the 2008 financial crisis, the portfolio lost $3M in a single day. What is the most likely explanation?",
 options: [
 "The risk model made a calculation error — a correctly built VaR model would have predicted the $3M loss",
 "VaR only predicts losses with certainty, not the size of losses beyond that threshold — fat tails mean the actual loss in the worst 1% of days can greatly exceed the VaR level",
 "The portfolio manager must have added additional risk positions without updating the model",
 "A $3M loss on a $1M VaR portfolio is statistically impossible and indicates fraud",
 ],
 correctIndex: 1,
 explanation:
 "VaR at 99% confidence only tells you the loss you will NOT exceed 99% of the time. It says nothing about how large losses can be in the worst 1% of scenarios. Financial returns have fat tails — the distribution of extreme losses is much heavier than a normal distribution assumes. In the worst 1% of days, losses can be 2×, 3×, or even 10× the VaR level. This is why regulators have moved toward Expected Shortfall (ES), which measures the average loss in the worst X% of cases rather than just the threshold. A portfolio with $1M 99% VaR losing $3M in 2008 is not surprising — 2008 was a multi-standard-deviation event that exposed the fat-tail limitation of standard VaR models.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Expected Shortfall (ES) is a better risk measure than VaR because it captures what happens inside the tail, not just where the tail begins.",
 correct: true,
 explanation:
 "TRUE. Value at Risk (VaR) at 99% confidence answers: 'What is the loss level that I will not exceed 99% of the time?' It identifies the threshold but ignores the distribution of losses beyond that threshold. Expected Shortfall (also called CVaR or Conditional VaR) answers: 'Given that I am in the worst 1% of outcomes, what is my average loss?' This captures tail shape — the difference between a tail that drops off steeply versus one that extends to catastrophic levels. ES is mathematically coherent (it satisfies subadditivity, meaning a diversified portfolio always has lower ES than the sum of its parts), while VaR is not. Basel III and the FRTB regulatory framework have moved to ES precisely because it better reflects the actual risk of extreme events.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Hedging Strategies 
 {
 id: "portfolio-stress-4",
 title: "Hedging Strategies",
 description:
 "Evaluate put options, VIX calls, trend-following overlays, gold, short credit, and cash as portfolio hedges across different crisis types",
 icon: "Shield",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Options-Based Hedges: Puts and VIX Calls",
 content:
 "**Put options — direct downside protection**:\n- Buying put options on an equity index (e.g., SPY puts) provides direct protection: as equities fall, put options gain value\n- **Cost challenge**: Put options have a **negative carry** — they cost money every day through time decay (theta). Buying 3-month 5% OTM puts on SPY costs roughly 1.5–2.5% of notional per year in a low-vol environment\n- **Timing challenge**: Puts expire. If the market does not fall during the option's life, the premium is lost entirely. Maintaining continuous put protection costs 2–4% of portfolio per year — a significant drag on returns\n- **Rolling strategy**: Many institutions roll 3-month puts monthly, continuously paying premium. The hedge works when crises occur but erodes returns substantially over time\n\n**VIX calls — positive convexity in crashes**:\n- VIX measures market fear. In crashes, VIX spikes dramatically: from ~12 pre-COVID to ~82 in March 2020\n- **VIX call options** provide leveraged exposure to this spike. A VIX call struck at 20 bought when VIX = 12 costs very little but pays off enormously when VIX reaches 60–80\n- **Key property**: VIX calls are cheapest when VIX is low (markets are complacent) — exactly when tail risk is most underpriced\n- **Limitation**: VIX calls are based on VIX futures, not spot VIX. The futures term structure (usually in contango) means the roll cost is negative — you are persistently paying to maintain the position\n- **Cost vs. payoff**: A 1% annual premium on VIX calls might return 10–15% of portfolio in a major crash, providing excellent positive convexity",
 highlight: [
 "put options",
 "negative carry",
 "time decay",
 "theta",
 "VIX calls",
 "positive convexity",
 "rolling strategy",
 "contango",
 "tail risk",
 ],
 },
 {
 type: "teach",
 title: "Trend Following, Gold, and Short Credit",
 content:
 "**Trend following overlay (managed futures)**:\n- Managed futures strategies go long assets in uptrends and short assets in downtrends across all asset classes (equities, bonds, currencies, commodities)\n- **Crisis performance**: Research shows managed futures have historically had a **-0.5 correlation with equities in bear markets** — they tend to profit from the trends that develop in crises (short equities, long bonds, short credit, etc.)\n- **2008**: Managed futures +18% while S&P 500 fell -38%\n- **2022**: Managed futures +25% while 60/40 fell ~16% — one of the only hedges that worked that year\n- **Cost**: Low fees (systematic execution), but strategy requires sustained trends — choppy reversing markets produce drawdowns\n\n**Gold allocation (5–10%)**:\n- Gold is a monetary asset that tends to hold value in systemic crises, currency debasement, and high inflation\n- **Works well**: 2008 financial crisis, 2020 COVID (eventually), 1970s stagflation\n- **Works poorly**: 2022 rate shock (dollar strength and rising real yields hurt gold)\n- 5–10% allocation historically reduces maximum portfolio drawdown by 2–5% at a modest cost to long-run returns\n\n**Short credit positions (CDS)**:\n- Credit Default Swaps (CDS) on the CDX HY Index (high-yield corporate bond index) pay off when credit spreads widen\n- **2008**: CDX HY widened from ~250bps to ~1,800bps — massively profitable for short credit positions\n- **Cost**: Buying CDS protection costs carry (the premium paid); in tight credit markets this is 200–400bps per year\n- Best for portfolios with significant credit exposure (corporate bonds, leveraged loans)",
 highlight: [
 "trend following",
 "managed futures",
 "CTA",
 "gold",
 "CDS",
 "credit default swaps",
 "CDX HY",
 "bear market correlation",
 "credit spreads",
 ],
 },
 {
 type: "teach",
 title: "Cash Buffer and Hedge Selection Framework",
 content:
 "**Cash buffer — the simplest hedge**:\n- Holding cash (10–30% of portfolio) reduces overall portfolio volatility proportionally\n- In a 30% equity drawdown, a portfolio with 20% cash only loses 24% on the equity portion (still a -24% total loss)\n- **Opportunity cost**: Cash earns near zero (in low-rate environments) or short-term rates, while being a drag on returns in bull markets\n- **Real option value**: Cash provides the ability to buy assets cheaply during crashes — Buffett's \"dry powder\" concept\n- **Simple and flexible**: Unlike options or CDS, cash has no expiry, no counterparty risk, and can be deployed instantly\n\n**Hedge selection matrix — which crisis type?**\n\n| Hedge | 2008 Crash | 2020 COVID | 2022 Rate Shock |\n|---|---|---|---|\n| Treasuries | | | (fell 13%) |\n| Put options | | | (if delta-hedged) |\n| VIX calls | | | Partial |\n| Trend following | | | |\n| Gold | | | (USD strength) |\n| Short credit (CDS) | | | Partial |\n| Cash | | | |\n\n**Key insight**: No single hedge works in all crises. A diversified hedging program combining 2–3 instruments is more robust than relying on one.",
 highlight: [
 "cash buffer",
 "dry powder",
 "opportunity cost",
 "hedge selection",
 "rate shock",
 "diversified hedging",
 "Treasuries",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Which hedge would have worked BOTH during the 2022 rate shock (simultaneous equity and bond decline) AND during the 2020 pandemic crash?",
 options: [
 "Long US Treasuries — flight to safety works in both crisis types",
 "Trend-following (managed futures) — captured the sustained downtrends in both crises",
 "Gold — held its value as a monetary safe-haven in both episodes",
 "Long investment-grade corporate bonds — lower credit risk than equities in both crises",
 ],
 correctIndex: 1,
 explanation:
 "Trend-following managed futures strategies worked in both crises. In 2020, they caught the rapid equity downtrend (going short equities) and the bond rally (going long bonds). In 2022, they caught the equity downtrend (short equities) AND the bond downtrend (short bonds/long rates) — this was the crucial advantage in 2022 when Treasuries failed as a hedge. Managed futures indices were up approximately 18–25% in 2022 while virtually all long-only asset classes declined. Long Treasuries worked in 2020 but failed spectacularly in 2022 (-13%). Gold was mixed in 2020 (positive overall but volatile) and negative in 2022 as dollar strength and rising real yields weighed on it. Corporate bonds also fell in both crises.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Building Resilient Portfolios 
 {
 id: "portfolio-stress-5",
 title: "Building Resilient Portfolios",
 description:
 "Apply all-weather frameworks, risk parity, pre-mortem analysis, liquidity stress testing, and crisis playbooks to build crisis-resistant portfolios",
 icon: "Building2",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "All-Weather Frameworks",
 content:
 "Resilient portfolio construction starts with acknowledging that no one can reliably predict which macro environment lies ahead.\n\n**Bridgewater All-Weather framework** (Ray Dalio):\n- The economy can be in one of four environments: Rising Growth, Falling Growth, Rising Inflation, Falling Inflation\n- Each environment is favorable for certain assets:\n - Rising Growth Equities, corporate bonds, commodities\n - Falling Growth Treasuries, TIPS, gold\n - Rising Inflation Commodities, TIPS, gold\n - Falling Inflation Equities, nominal Treasuries\n- Allocate capital so that each environment is roughly equally \"covered\" — no single scenario destroys the portfolio\n\n**Harry Browne Permanent Portfolio**:\n- 25% stocks (growth), 25% long-term bonds (deflation), 25% gold (inflation/crisis), 25% cash (stability/recession)\n- Mechanically simple, remarkably robust: worst drawdown in history ~15%; annualized return ~5–7% real\n- **Criticism**: Low long-run return vs. 100% equities. The cost of all-weather is upside sacrifice in prolonged bull markets\n\n**Risk parity**:\n- Instead of allocating 60% capital to equities, allocate by **equal risk contribution**\n- Equities are ~3× more volatile than bonds, so in a 60/40 portfolio, equities contribute ~90% of risk\n- Risk parity solution: leverage bonds (or other low-vol assets) until each asset class contributes ~equal risk\n- Result: much lower equity concentration; more balanced exposure to different economic scenarios",
 highlight: [
 "All-Weather",
 "Bridgewater",
 "Permanent Portfolio",
 "Harry Browne",
 "risk parity",
 "equal risk contribution",
 "four economic environments",
 "TIPS",
 "leverage bonds",
 ],
 },
 {
 type: "teach",
 title: "Pre-Mortem Analysis and Liquidity Cascade",
 content:
 "**Pre-mortem analysis** — imagining failure before it happens:\n- Popularized by psychologist Gary Klein; used by leading investment firms as a risk discipline\n- Process: Assume it is 12 months from now and the portfolio has suffered a catastrophic loss. Work backward: what caused it?\n- Forces identification of tail risks that are invisible in normal scenario analysis\n- Example pre-mortem findings:\n - \"Our 40% emerging market allocation is concentrated in 3 countries with current account deficits — a dollar rally would crush all three simultaneously\"\n - \"We are short volatility in 5 different ways — a VIX spike to 40+ would hit all positions at once\"\n - \"We assumed we could exit the small-cap positions in 2 days — in a crisis it would take 3 weeks at steep discounts\"\n\n**Liquidity cascade stress test**:\n- Map the portfolio's liquidity profile: what percentage of the portfolio can be liquidated in 1 day, 1 week, 1 month, 1 year without significant market impact?\n- Identify liquidity triggers: margin calls (when does the broker demand cash?), redemption gates (when do fund investors pull money?), covenant violations\n- **Worst case scenario**: Forced selling in illiquid markets generates a cascade — selling drives prices down, which triggers more margin calls, which forces more selling\n- **Liquidity buffer rule of thumb**: Maintain at least 10–15% in highly liquid assets (Treasuries, cash) specifically for margin requirements and opportunistic buying in stress events",
 highlight: [
 "pre-mortem",
 "Gary Klein",
 "liquidity cascade",
 "liquidity profile",
 "margin calls",
 "redemption gates",
 "forced selling",
 "liquidity buffer",
 ],
 },
 {
 type: "teach",
 title: "Crisis Playbook and Behavioral Preparation",
 content:
 "**The crisis playbook** — pre-defined rules for extreme drawdowns:\n\nThe biggest mistake investors make in crises is making emotional decisions under extreme stress. A **written crisis playbook** removes decision-making from the heat of the moment.\n\n**Standard playbook structure — drawdown triggers**:\n- **Portfolio -10%**: Review but do not act. Rebalance if any position is >10% overweight.\n- **Portfolio -20%**: Implement pre-defined hedge activations. Review margin capacity. Communicate with stakeholders. Do NOT chase performance — do not panic sell.\n- **Portfolio -30%**: Activate full defensive posture. Sell illiquid positions first while you still can. Move to maximum cash target. If leverage is used, consider reducing to zero regardless of cost.\n- **Position -50%**: Individual position review protocol — is the thesis broken or is this market noise?\n\n**Behavioral principles for crises**:\n- **Mean-reversion vs. momentum**: Crises often have momentum — do not catch a falling knife. But the sharpest recoveries follow the deepest crashes\n- **Separate facts from fear**: Is the fundamental thesis broken, or is this a liquidity-driven drawdown?\n- **Asymmetric opportunity**: Crises create the best long-term entry points. The investor who deployed cash at S&P 500 = 666 in March 2009 made 6× in 10 years\n- **Pre-commit to rules**: Write the playbook when you are calm. Follow it when you are not.",
 highlight: [
 "crisis playbook",
 "drawdown triggers",
 "behavioral preparation",
 "pre-defined rules",
 "mean-reversion",
 "asymmetric opportunity",
 "panic selling",
 "rebalancing",
 ],
 },
 {
 type: "quiz-scenario",
 scenario:
 "You manage an equity-heavy portfolio (85% equities, 10% corporate bonds, 5% cash) with $2M in assets. Over 2 weeks, markets have fallen sharply and your portfolio is down 30% ($600K loss). Your cash position is now $100K (5% of original value). Your broker has just issued a margin call notice — you have 48 hours to add $150K in equity or liquidate positions.",
 question:
 "What is the most prudent course of action, consistent with crisis management best practices?",
 options: [
 "Add $150K of your personal savings immediately to meet the margin call and hold all positions — the market always recovers eventually",
 "Sell your most illiquid equity positions first to raise cash, meet the margin call, and review the playbook to determine if further de-risking is warranted — do not make permanent capital commitments under duress",
 "Ignore the margin call — your broker is legally obligated to give you 30 days and they are just being aggressive",
 "Sell all equity positions immediately and move entirely to cash — preservation of capital is paramount in any crisis",
 ],
 correctIndex: 1,
 explanation:
 "The correct priority in this scenario follows the crisis playbook framework: (1) Meet the margin call — failing to do so results in forced liquidation by the broker at the worst possible moment. (2) Liquidate your most illiquid positions first while you still have agency — if the crisis deepens, illiquid positions become impossible to exit without catastrophic discounts. (3) Do NOT commit additional personal savings under duress without carefully reviewing whether your fundamental investment thesis is intact. (4) The playbook for a -30% drawdown typically involves de-risking to maximum defensive posture, not holding all positions or going all-cash. Selling everything eliminates any upside from a recovery. Adding personal savings to a margin call is risky and emotional — the margin call is a signal from the market that your risk-taking was excessive. Addressing structural leverage is the right response.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Risk parity portfolios typically hold a larger allocation to equities than a traditional 60/40 portfolio, since equities provide the highest long-term returns.",
 correct: false,
 explanation:
 "FALSE. Risk parity portfolios typically hold a SMALLER allocation to equities by capital weight than a traditional 60/40 portfolio. The insight behind risk parity is that equities are far more volatile than bonds — approximately 3× — meaning that in a 60/40 portfolio, equities contribute roughly 85–90% of total portfolio risk even though they represent only 60% of capital. Risk parity corrects this imbalance by allocating capital so that each asset class contributes roughly equal amounts of risk. Because bonds have lower volatility, they receive a much higher capital allocation (often 50–60% or more), and bonds are sometimes leveraged (via futures or other instruments) to match the risk contribution of equities. The result is a more balanced portfolio with less equity concentration, at the cost of needing leverage in the bond sleeve to achieve adequate total returns.",
 difficulty: 2,
 },
 ],
 },
 ],
};
