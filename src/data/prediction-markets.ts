export type MarketCategory = "macro" | "equities" | "crypto" | "fed" | "earnings" | "geopolitics";
export type MarketStatus = "open" | "resolved_yes" | "resolved_no" | "expired";

export interface PredictionMarket {
 id: string;
 question: string;
 category: MarketCategory;
 description: string;
 initialProbability: number;
 resolutionCriteria: string;
 expiresInDays: number;
 difficulty: 1 | 2 | 3;
 educationalNote: string;
 relatedConcepts: string[];
}

export const PREDICTION_MARKETS: PredictionMarket[] = [
 // ─── Macro ───────────────────────────────────────────────
 {
 id: "fed-rate-cut",
 question: "Will the Fed cut rates at the next FOMC meeting?",
 category: "macro",
 description:
 "The Federal Reserve's interest rate decisions are the single most impactful event for financial markets. Rate cuts make borrowing cheaper and typically boost stock prices.",
 initialProbability: 65,
 resolutionCriteria:
 "Resolves YES if the Federal Reserve announces a 25bp or larger rate cut at the next scheduled FOMC meeting.",
 expiresInDays: 30,
 difficulty: 2,
 educationalNote:
 "The Fed Funds Rate affects everything from mortgage rates to corporate earnings. When the Fed cuts, it signals concern about economic slowdown but also cheaper money flowing into markets. Watch the CME FedWatch tool for market-implied probabilities.",
 relatedConcepts: ["Interest Rate", "Federal Reserve", "Monetary Policy"],
 },
 {
 id: "cpi-above-3",
 question: "Will US CPI come in above 3.0% this month?",
 category: "macro",
 description:
 "The Consumer Price Index measures inflation. A reading above 3% would suggest persistent inflation, potentially delaying rate cuts.",
 initialProbability: 40,
 resolutionCriteria:
 "Resolves YES if the Bureau of Labor Statistics reports year-over-year CPI above 3.0% for the reference month.",
 expiresInDays: 21,
 difficulty: 2,
 educationalNote:
 "CPI is the most-watched inflation indicator. Higher-than-expected CPI usually hurts both stocks and bonds because it means the Fed must keep rates higher for longer. Core CPI (excluding food and energy) is often more important than headline CPI.",
 relatedConcepts: ["Inflation", "Federal Reserve", "Interest Rate"],
 },
 {
 id: "10y-yield-5pct",
 question: "Will the 10-year Treasury yield exceed 5% this quarter?",
 category: "macro",
 description:
 "The 10-year yield is the benchmark rate for all long-term lending. Crossing 5% would be the highest since 2007 and could trigger major equity selling.",
 initialProbability: 25,
 resolutionCriteria:
 "Resolves YES if the US 10-year Treasury yield closes above 5.00% on any trading day this quarter.",
 expiresInDays: 60,
 difficulty: 3,
 educationalNote:
 "The 10-year yield competes with stocks for investor capital. When yields rise, the 'risk-free' return improves, making stocks less attractive on a relative basis. This is why growth stocks (valued on future earnings) are especially sensitive to rising yields.",
 relatedConcepts: ["Bond", "Yield", "Risk-Free Rate"],
 },
 {
 id: "gdp-above-2pct",
 question: "Will US GDP growth exceed 2% this quarter?",
 category: "macro",
 description:
 "GDP measures the total economic output of the country. Growth above 2% is generally considered healthy and supportive of corporate earnings.",
 initialProbability: 55,
 resolutionCriteria:
 "Resolves YES if the first BEA estimate of quarterly real GDP growth (annualized) exceeds 2.0%.",
 expiresInDays: 45,
 difficulty: 2,
 educationalNote:
 "GDP growth drives corporate revenue. But markets are forward-looking: if GDP is strong, the Fed may keep rates higher, which can actually be bad for stock prices. This tension between 'good economy' and 'higher rates' is key to macro trading.",
 relatedConcepts: ["GDP", "Economic Growth", "Federal Reserve"],
 },

 // ─── Equities ────────────────────────────────────────────
 {
 id: "aapl-above-200",
 question: "Will AAPL close above $200 by end of quarter?",
 category: "equities",
 description:
 "Apple is the world's largest company by market cap. Its stock price reflects both iPhone demand and broader tech sentiment.",
 initialProbability: 52,
 resolutionCriteria:
 "Resolves YES if AAPL closes at or above $200.00 on the last trading day of the current quarter.",
 expiresInDays: 60,
 difficulty: 1,
 educationalNote:
 "Stock price targets require understanding of both fundamentals (P/E ratio, revenue growth) and technicals (support/resistance levels). A round number like $200 often acts as psychological resistance where sellers cluster.",
 relatedConcepts: ["Price Target", "P/E Ratio", "Market Cap"],
 },
 {
 id: "nvda-beat-10pct",
 question: "Will NVDA beat earnings estimates by more than 10%?",
 category: "equities",
 description:
 "NVIDIA has consistently beaten analyst estimates due to surging AI chip demand. The question is whether this pattern continues.",
 initialProbability: 60,
 resolutionCriteria:
 "Resolves YES if NVIDIA reports actual EPS more than 10% above the consensus analyst estimate at the time of earnings release.",
 expiresInDays: 45,
 difficulty: 2,
 educationalNote:
 "Earnings 'beats' are relative to analyst expectations, not absolute performance. A company can report record revenue and still see its stock drop if the results were below expectations. This is why the 'whisper number' (what the market really expects) matters more than the official consensus.",
 relatedConcepts: ["Earnings Surprise", "EPS Growth", "Analyst Rating"],
 },
 {
 id: "tsla-500k-deliveries",
 question: "Will TSLA deliver more than 500K vehicles this quarter?",
 category: "equities",
 description:
 "Tesla's delivery numbers are the most closely watched operational metric. They directly impact revenue and margins.",
 initialProbability: 45,
 resolutionCriteria:
 "Resolves YES if Tesla's official quarterly delivery report shows more than 500,000 vehicles delivered.",
 expiresInDays: 60,
 difficulty: 2,
 educationalNote:
 "For growth companies, operational metrics (like deliveries) often matter more than financial results. A delivery miss signals demand problems, while a beat suggests pricing power. Watch for the distinction between production and deliveries: produced but unsold inventory is a bearish signal.",
 relatedConcepts: ["Revenue Growth YoY", "Forward P/E", "Growth"],
 },
 {
 id: "sp500-new-ath",
 question: "Will the S&P 500 hit a new all-time high this month?",
 category: "equities",
 description:
 "The S&P 500 reaching new highs is a key market breadth signal. It indicates broad-based confidence across the economy's largest companies.",
 initialProbability: 38,
 resolutionCriteria:
 "Resolves YES if the S&P 500 index closes at a new all-time high on any trading day this month.",
 expiresInDays: 21,
 difficulty: 1,
 educationalNote:
 "New all-time highs can seem scary to buy, but historically, stocks that make new highs tend to continue higher. The fear of buying at the top (known as 'acrophobia') causes many investors to miss rallies. However, momentum can also be a sign of market frothiness.",
 relatedConcepts: ["Bull Market", "Market Breadth", "All-Time High"],
 },

 // ─── Crypto ──────────────────────────────────────────────
 {
 id: "btc-100k",
 question: "Will Bitcoin exceed $100,000 this quarter?",
 category: "crypto",
 description:
 "Bitcoin's journey to $100K is a milestone that would validate crypto as a mainstream asset class and attract institutional capital.",
 initialProbability: 30,
 resolutionCriteria:
 "Resolves YES if Bitcoin (BTC/USD) trades above $100,000 on any major exchange at any point during the quarter.",
 expiresInDays: 60,
 difficulty: 3,
 educationalNote:
 "Crypto markets are driven by narratives (halving cycles, ETF flows, regulation) more than fundamentals. Unlike stocks, Bitcoin has no earnings or cash flow. This makes pricing a pure supply-and-demand exercise, which teaches you about speculation vs. investing.",
 relatedConcepts: ["Speculation", "Supply and Demand", "Volatility"],
 },
 {
 id: "eth-etf-inflows",
 question: "Will Ethereum ETF net inflows exceed $1B this month?",
 category: "crypto",
 description:
 "Ethereum ETF flows measure institutional appetite for crypto exposure. Strong inflows signal growing mainstream adoption.",
 initialProbability: 42,
 resolutionCriteria:
 "Resolves YES if total cumulative net inflows across all spot Ethereum ETFs exceed $1 billion within the calendar month.",
 expiresInDays: 21,
 difficulty: 2,
 educationalNote:
 "ETF inflows and outflows are a real-time measure of investor sentiment. When money flows into an ETF, the ETF must buy the underlying asset, creating buying pressure. This is why ETF approval events are so important for crypto — they open the floodgates for institutional capital.",
 relatedConcepts: ["ETF", "Institutional Investing", "Net Flows"],
 },

 // ─── Earnings ────────────────────────────────────────────
 {
 id: "meta-revenue-20pct",
 question: "Will META report revenue growth above 20% YoY?",
 category: "earnings",
 description:
 "Meta's ad revenue growth has reaccelerated thanks to AI-driven targeting and Reels monetization. 20% growth would confirm the turnaround.",
 initialProbability: 58,
 resolutionCriteria:
 "Resolves YES if Meta Platforms reports year-over-year total revenue growth exceeding 20% in the upcoming quarterly earnings.",
 expiresInDays: 45,
 difficulty: 2,
 educationalNote:
 "Revenue growth rate is the most important metric for mega-cap tech. A company growing revenue at 20%+ commands a premium valuation. Watch for the distinction between advertising revenue (core business) and Reality Labs (metaverse) which is still unprofitable.",
 relatedConcepts: ["Revenue Growth YoY", "Valuation Premium", "Operating Margin"],
 },
 {
 id: "amzn-aws-15pct",
 question: "Will AMZN's AWS growth exceed 15% YoY?",
 category: "earnings",
 description:
 "Amazon Web Services is the profit engine of Amazon. Its growth rate signals the health of enterprise cloud spending and AI workload demand.",
 initialProbability: 65,
 resolutionCriteria:
 "Resolves YES if Amazon reports AWS segment revenue growth above 15% year-over-year in the next quarterly earnings.",
 expiresInDays: 45,
 difficulty: 2,
 educationalNote:
 "Segment-level analysis is crucial for conglomerates. AWS generates most of Amazon's operating profit despite being a fraction of total revenue. This teaches the concept of 'sum-of-the-parts' valuation: sometimes a division is worth more than the whole company's market cap implies.",
 relatedConcepts: ["Operating Margin", "Revenue Growth YoY", "Valuation Premium"],
 },
 {
 id: "jpm-beat-eps",
 question: "Will JPM beat EPS estimates?",
 category: "earnings",
 description:
 "JPMorgan Chase typically reports first among big banks, setting the tone for the entire financial sector's earnings season.",
 initialProbability: 70,
 resolutionCriteria:
 "Resolves YES if JPMorgan Chase reports actual earnings per share above the consensus analyst estimate.",
 expiresInDays: 30,
 difficulty: 1,
 educationalNote:
 "Banks are bellwethers for the economy because they profit from lending, trading, and investment banking. JPM beating estimates is historically common (banks beat about 70% of the time) but what matters more is the guidance for future quarters and commentary on loan losses.",
 relatedConcepts: ["EPS Growth", "Earnings Surprise", "Analyst Rating"],
 },
 {
 id: "googl-cloud-profit",
 question: "Will Google Cloud report positive operating income?",
 category: "earnings",
 description:
 "Google Cloud has been narrowing losses and recently turned profitable. Sustaining profitability would validate Alphabet's cloud strategy.",
 initialProbability: 75,
 resolutionCriteria:
 "Resolves YES if Alphabet reports positive operating income for the Google Cloud segment in the next quarterly earnings.",
 expiresInDays: 45,
 difficulty: 1,
 educationalNote:
 "Segment profitability inflection points are major catalysts. When a money-losing division turns profitable, it changes the entire earnings trajectory. Analysts often model each segment separately, so a Google Cloud profit means the stock's fair value estimate jumps significantly.",
 relatedConcepts: ["Operating Margin", "EPS Growth", "Revenue Growth YoY"],
 },

 // ─── Fed / Policy ────────────────────────────────────────
 {
 id: "fed-signal-2-cuts",
 question: "Will the Fed signal more than 2 rate cuts this year?",
 category: "fed",
 description:
 "The Fed's dot plot projections reveal how many rate cuts officials expect. More than 2 cuts would be dovish and boost risk assets.",
 initialProbability: 35,
 resolutionCriteria:
 "Resolves YES if the median dot in the Fed's Summary of Economic Projections implies more than 2 rate cuts (50bp+ of total cuts) for the current calendar year.",
 expiresInDays: 45,
 difficulty: 3,
 educationalNote:
 "The dot plot is a chart of each Fed official's rate forecast. The median dot drives market expectations. Markets often overreact to dot plot changes, creating trading opportunities. Understanding the difference between what the Fed signals and what the market prices in is a key skill.",
 relatedConcepts: ["Federal Reserve", "Interest Rate", "Monetary Policy"],
 },
 {
 id: "unemployment-above-4-5",
 question: "Will the unemployment rate exceed 4.5%?",
 category: "fed",
 description:
 "Rising unemployment signals economic weakness and typically triggers Fed rate cuts, but also warns of falling corporate earnings.",
 initialProbability: 20,
 resolutionCriteria:
 "Resolves YES if the BLS reports a monthly unemployment rate at or above 4.5% at any point this quarter.",
 expiresInDays: 60,
 difficulty: 2,
 educationalNote:
 "The unemployment rate is a lagging indicator, meaning it rises after the economy has already slowed. By the time unemployment spikes, stocks have usually already fallen. This is why leading indicators (jobless claims, PMI) are more useful for trading.",
 relatedConcepts: ["Unemployment", "Economic Growth", "Leading Indicators"],
 },
 {
 id: "fed-pause-next-2",
 question: "Will the Fed hold rates steady at both of the next 2 meetings?",
 category: "fed",
 description:
 "A double pause would signal the Fed is comfortable with current rates, suggesting a longer 'higher for longer' regime.",
 initialProbability: 48,
 resolutionCriteria:
 "Resolves YES if the Federal Reserve keeps the target rate unchanged at each of the next two scheduled FOMC meetings.",
 expiresInDays: 90,
 difficulty: 2,
 educationalNote:
 "A 'hold' is not neutral. When the market expects a cut and gets a hold, that is effectively hawkish. When the market expects a hike and gets a hold, that is dovish. Context and expectations matter more than the absolute decision. This is a core lesson in market efficiency.",
 relatedConcepts: ["Federal Reserve", "Interest Rate", "Market Efficiency"],
 },

 // ─── Geopolitics ─────────────────────────────────────────
 {
 id: "oil-above-90",
 question: "Will oil prices exceed $90/barrel this quarter?",
 category: "geopolitics",
 description:
 "Oil prices above $90 would squeeze consumers and corporations, acting as a tax on economic growth and potentially reigniting inflation.",
 initialProbability: 28,
 resolutionCriteria:
 "Resolves YES if WTI crude oil futures close above $90/barrel on any trading day this quarter.",
 expiresInDays: 60,
 difficulty: 2,
 educationalNote:
 "Oil is the most important commodity because it feeds into everything: transportation, manufacturing, and even food production. High oil prices act as an inflation accelerant and can tip economies into recession. OPEC production decisions and geopolitical conflicts are the primary drivers.",
 relatedConcepts: ["Inflation", "Commodities", "Geopolitical Risk"],
 },
 {
 id: "dxy-above-105",
 question: "Will the US Dollar Index (DXY) stay above 105?",
 category: "geopolitics",
 description:
 "A strong dollar hurts US exporters and emerging markets. DXY above 105 reflects higher US rates relative to other countries.",
 initialProbability: 50,
 resolutionCriteria:
 "Resolves YES if the DXY closes above 105.00 on the last trading day of the current month.",
 expiresInDays: 21,
 difficulty: 2,
 educationalNote:
 "The Dollar Index measures USD against a basket of major currencies. A strong dollar means US goods are more expensive abroad (bad for exporters like AAPL, MSFT) but makes imports cheaper. The DXY typically strengthens when the Fed is hawkish relative to other central banks.",
 relatedConcepts: ["Currency", "Interest Rate", "Export"],
 },
 {
 id: "vix-spike-above-30",
 question: "Will the VIX spike above 30 this month?",
 category: "geopolitics",
 description:
 "The VIX 'fear index' measures expected S&P 500 volatility. A reading above 30 signals significant market stress and panic.",
 initialProbability: 15,
 resolutionCriteria:
 "Resolves YES if the CBOE VIX index closes above 30.00 on any trading day this month.",
 expiresInDays: 21,
 difficulty: 1,
 educationalNote:
 "The VIX is derived from S&P 500 option prices. When investors are scared, they buy put options for protection, driving up the VIX. Historically, VIX spikes above 30 mark excellent buying opportunities for long-term investors, because panic selling creates undervalued assets.",
 relatedConcepts: ["Volatility", "Options", "Fear and Greed"],
 },
 {
 id: "gold-above-2500",
 question: "Will gold prices exceed $2,500/oz this quarter?",
 category: "geopolitics",
 description:
 "Gold is the traditional safe-haven asset. New highs would reflect inflation fears, central bank buying, or geopolitical uncertainty.",
 initialProbability: 45,
 resolutionCriteria:
 "Resolves YES if spot gold (XAU/USD) trades above $2,500 per ounce at any point during the quarter.",
 expiresInDays: 60,
 difficulty: 1,
 educationalNote:
 "Gold has no yield and no earnings, so its price is driven by opportunity cost (real interest rates) and fear. When real rates fall or uncertainty rises, gold shines. Central banks have been buying gold at record rates to diversify reserves away from USD, adding structural demand.",
 relatedConcepts: ["Safe Haven", "Inflation", "Real Interest Rate"],
 },

 // ─── Additional Markets (Expanded) ──────────────────────────

 {
 id: "sp500-correction",
 question: "Will the S&P 500 experience a 10%+ correction this quarter?",
 category: "equities",
 description: "A correction is a 10%+ decline from a recent high. They happen about once every 1-2 years on average.",
 initialProbability: 18,
 resolutionCriteria: "Resolves YES if S&P 500 declines 10% or more from its quarterly high at any point during the quarter.",
 expiresInDays: 90,
 difficulty: 2,
 educationalNote: "Corrections are normal — the S&P 500 averages a 10%+ pullback every 16 months. They feel terrible but are usually buying opportunities. Since 1950, the market has recovered from every correction. The key distinction: corrections are temporary price declines, while bear markets (20%+) reflect fundamental deterioration.",
 relatedConcepts: ["Drawdown", "Bear Market", "Volatility"],
 },
 {
 id: "vix-spike",
 question: "Will the VIX spike above 25 this month?",
 category: "macro",
 description: "VIX is the 'fear gauge' — implied volatility of S&P 500 options. Above 25 signals elevated fear.",
 initialProbability: 22,
 resolutionCriteria: "Resolves YES if the CBOE VIX index closes above 25.00 on any trading day this month.",
 expiresInDays: 30,
 difficulty: 2,
 educationalNote: "The VIX typically sits between 12-20 in calm markets. Spikes above 25 occur during market stress (corrections, geopolitical events). VIX above 30 is 'high fear' and historically correlates with market bottoms — when everyone is scared, contrarians start buying.",
 relatedConcepts: ["Implied Volatility", "Options", "Market Sentiment"],
 },
 {
 id: "btc-etf-flows",
 question: "Will Bitcoin spot ETFs see net inflows this week?",
 category: "crypto",
 description: "Bitcoin ETF flows indicate institutional demand. Net inflows = institutions buying, outflows = selling.",
 initialProbability: 72,
 resolutionCriteria: "Resolves YES if total net flows across all US spot Bitcoin ETFs are positive for the calendar week.",
 expiresInDays: 7,
 difficulty: 1,
 educationalNote: "ETF flows are one of the clearest signals of institutional participation. BlackRock's IBIT and Fidelity's FBTC have attracted tens of billions. Sustained inflows suggest long-term institutional adoption, not just retail speculation.",
 relatedConcepts: ["ETF", "Institutional Ownership", "Bitcoin"],
 },
 {
 id: "msft-ai-revenue",
 question: "Will Microsoft report AI revenue exceeding $10B annually (run rate)?",
 category: "earnings",
 description: "Microsoft's AI revenue through Azure OpenAI, Copilot, and GitHub Copilot is a key growth metric.",
 initialProbability: 55,
 resolutionCriteria: "Resolves YES if Microsoft reports or guides to annual AI-related revenue run rate exceeding $10B.",
 expiresInDays: 45,
 difficulty: 3,
 educationalNote: "AI monetization is the most important growth narrative in tech. Microsoft is uniquely positioned with Azure hosting OpenAI models, plus enterprise Copilot products. The question is whether AI spending translates to real revenue or remains in 'investment phase'.",
 relatedConcepts: ["Revenue Growth", "AI", "Cloud Computing"],
 },
 {
 id: "housing-prices",
 question: "Will US home prices rise more than 4% YoY this quarter?",
 category: "macro",
 description: "The Case-Shiller Home Price Index tracks residential real estate values across 20 major US cities.",
 initialProbability: 50,
 resolutionCriteria: "Resolves YES if the S&P Case-Shiller 20-City Composite shows YoY appreciation above 4.0%.",
 expiresInDays: 60,
 difficulty: 2,
 educationalNote: "Housing is the largest asset for most Americans. Prices are driven by supply (new construction, inventory) and demand (mortgage rates, employment, demographics). High mortgage rates reduce affordability but also reduce supply (owners won't sell and give up their low-rate mortgage).",
 relatedConcepts: ["Interest Rates", "Inflation", "Real Estate"],
 },
 {
 id: "aapl-services-40",
 question: "Will Apple Services revenue exceed 40% of total revenue?",
 category: "earnings",
 description: "Apple's high-margin Services segment (App Store, iCloud, Apple Music, TV+) is key to valuation.",
 initialProbability: 32,
 resolutionCriteria: "Resolves YES if Apple reports Services as 40%+ of total quarterly revenue.",
 expiresInDays: 60,
 difficulty: 3,
 educationalNote: "Services revenue matters because margins are ~70% vs ~35% for hardware. The shift from hardware to services transforms Apple from a cyclical hardware company into a recurring-revenue platform. This is why Apple's P/E expanded from 15 to 30 over the past decade.",
 relatedConcepts: ["Gross Margin", "Revenue Mix", "Recurring Revenue"],
 },
 {
 id: "oil-opec-cut",
 question: "Will OPEC+ announce additional production cuts?",
 category: "geopolitics",
 description: "OPEC+ controls ~40% of global oil production and uses supply management to influence prices.",
 initialProbability: 35,
 resolutionCriteria: "Resolves YES if OPEC+ announces new production cuts at their next scheduled meeting.",
 expiresInDays: 45,
 difficulty: 2,
 educationalNote: "Oil prices affect everything — transportation, manufacturing, inflation expectations, and central bank policy. OPEC+ (led by Saudi Arabia and Russia) coordinates production to stabilize prices. Cuts reduce supply and push prices up; increases do the opposite. Saudi Arabia needs ~$80/barrel to balance its budget.",
 relatedConcepts: ["Commodity", "Inflation", "Geopolitical Risk"],
 },
 {
 id: "recession-2025",
 question: "Will the US enter a recession within the next 12 months?",
 category: "macro",
 description: "Recession = two consecutive quarters of negative GDP growth (simplified). Major implications for stocks and employment.",
 initialProbability: 20,
 resolutionCriteria: "Resolves YES if the NBER officially declares a US recession that began within 12 months of this market opening.",
 expiresInDays: 365,
 difficulty: 3,
 educationalNote: "The yield curve (2s10s spread) inverted in 2022, which has preceded every recession since 1970. However, the lag between inversion and recession ranges from 6-24 months. Other indicators: rising unemployment claims, falling ISM, declining consumer confidence. No single indicator is reliable alone.",
 relatedConcepts: ["GDP", "Yield Curve", "Unemployment"],
 },
 {
 id: "tsla-fsd",
 question: "Will Tesla achieve unsupervised FSD approval in any US state?",
 category: "equities",
 description: "Tesla's Full Self-Driving (FSD) technology is critical to its robotaxi and software narrative.",
 initialProbability: 12,
 resolutionCriteria: "Resolves YES if any US state grants Tesla regulatory approval for fully unsupervised autonomous driving.",
 expiresInDays: 180,
 difficulty: 3,
 educationalNote: "Tesla's valuation premium vs other automakers rests heavily on FSD/robotaxi potential. A $50K car company trades at 10x earnings; a software/robotaxi company could trade at 50x. Regulatory approval is the key unlock, but safety data, liability frameworks, and insurance models must all align.",
 relatedConcepts: ["Growth Premium", "Regulatory Risk", "Technology"],
 },
 {
 id: "china-stimulus",
 question: "Will China announce a major fiscal stimulus package (>2% of GDP)?",
 category: "geopolitics",
 description: "China's economic slowdown and property crisis may force large-scale government intervention.",
 initialProbability: 28,
 resolutionCriteria: "Resolves YES if China's State Council announces fiscal stimulus measures totaling >2% of GDP within 60 days.",
 expiresInDays: 60,
 difficulty: 3,
 educationalNote: "China is the world's second-largest economy and largest commodity consumer. Major stimulus would boost global growth expectations, commodity prices (copper, iron ore), and emerging market stocks. However, China faces a deleveraging dilemma — stimulus could worsen the property bubble that caused the problem.",
 relatedConcepts: ["Fiscal Policy", "Emerging Markets", "Commodities"],
 },
 {
 id: "jpm-dividend-hike",
 question: "Will JPMorgan raise its dividend by more than 5%?",
 category: "earnings",
 description: "Banks distribute profits through dividends and buybacks after passing Federal Reserve stress tests.",
 initialProbability: 62,
 resolutionCriteria: "Resolves YES if JPMorgan announces a quarterly dividend increase of more than 5% at the next declaration.",
 expiresInDays: 45,
 difficulty: 1,
 educationalNote: "Bank dividends are regulated — the Fed must approve payouts through annual stress tests (CCAR). A dividend hike signals management confidence in future earnings and capital adequacy. JPM has raised its dividend consistently, reflecting its position as the strongest US bank by assets.",
 relatedConcepts: ["Dividend Yield", "Stress Test", "Capital Allocation"],
 },
 {
 id: "nvda-trillion-revenue",
 question: "Will NVDA achieve $100B+ annual revenue run rate?",
 category: "earnings",
 description: "NVIDIA's data center GPU demand from AI training has driven unprecedented revenue growth.",
 initialProbability: 70,
 resolutionCriteria: "Resolves YES if NVIDIA reports quarterly revenue of $25B+ (implying $100B+ annual run rate).",
 expiresInDays: 60,
 difficulty: 2,
 educationalNote: "NVIDIA went from $27B revenue in FY2023 to $60B+ in FY2024, driven entirely by AI chip demand. The question is sustainability: is this a structural shift or a one-time buildout? Cloud hyperscalers (MSFT, GOOG, AMZN, META) are NVIDIA's main customers and are all increasing AI capex.",
 relatedConcepts: ["Revenue Growth", "AI", "Semiconductor"],
 },
 {
 id: "eth-staking-yield",
 question: "Will Ethereum staking yield drop below 3%?",
 category: "crypto",
 description: "Ethereum staking rewards are generated from network validation and transaction fees.",
 initialProbability: 35,
 resolutionCriteria: "Resolves YES if the average Ethereum staking APY drops below 3.0% for a full week.",
 expiresInDays: 60,
 difficulty: 2,
 educationalNote: "Ethereum staking yield is driven by network activity (more transactions = more fees) and total ETH staked (more validators = lower per-validator reward). Falling yields suggest either reduced network usage or increased validator competition. Compare to risk-free Treasury yield (~5%) to assess opportunity cost.",
 relatedConcepts: ["Yield", "Staking", "Opportunity Cost"],
 },
 {
 id: "ai-bubble",
 question: "Will AI-related stocks underperform the S&P 500 this quarter?",
 category: "equities",
 description: "The 'Magnificent 7' (AAPL, MSFT, GOOG, AMZN, NVDA, META, TSLA) have driven most of the S&P 500's gains.",
 initialProbability: 30,
 resolutionCriteria: "Resolves YES if an equal-weighted basket of Magnificent 7 stocks underperforms the equal-weighted S&P 500 for the quarter.",
 expiresInDays: 90,
 difficulty: 2,
 educationalNote: "Market concentration is at historic levels — the top 7 stocks represent ~30% of S&P 500 market cap. This concentration creates fragility: when leadership narrows, eventual rotation is painful. The dot-com bubble saw similar concentration before a dramatic reversal into value stocks.",
 relatedConcepts: ["Market Cap Weighting", "Sector Rotation", "Bubble"],
 },
];

export const CATEGORY_LABELS: Record<MarketCategory, string> = {
 macro: "Macro",
 equities: "Equities",
 crypto: "Crypto",
 fed: "Fed / Policy",
 earnings: "Earnings",
 geopolitics: "Geopolitics",
};

export const CATEGORY_COLORS: Record<MarketCategory, string> = {
 macro: "text-primary bg-primary/10",
 equities: "text-primary bg-primary/10",
 crypto: "text-amber-400 bg-amber-400/10",
 fed: "text-rose-400 bg-rose-400/10",
 earnings: "text-muted-foreground bg-muted/30",
 geopolitics: "text-orange-400 bg-orange-400/10",
};
