import type { Unit } from "./types";

export const UNIT_MARKET_INTELLIGENCE: Unit = {
 id: "market-intelligence",
 title: "Market Intelligence",
 description:
 "Master options flow reading, dark pool analysis, sentiment data, alternative data sources, and insider activity",
 icon: "Radar",
 color: "#0ea5e9",
 lessons: [
 // Lesson 1: Options Flow Intelligence 
 {
 id: "mi-1",
 title: "Options Flow Intelligence",
 description:
 "Reading unusual options activity, sweeps, blocks, and using flow as a directional signal",
 icon: "TrendingUp",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Reading Options Flow — Unusual Activity",
 content:
 "Options flow analysis is the practice of monitoring large and unusual options transactions to infer institutional intent.\n\n**What makes activity 'unusual'?**\nThe primary threshold: volume > 3× open interest (OI). When far more contracts trade than currently exist as open positions, new money is entering with a directional bet.\n\n**Three core trade types:**\n\n**Sweeps** — An aggressive, immediate-fill order routed across multiple exchanges simultaneously to fill the entire order at once, regardless of price. Key characteristics:\n- Executes in seconds across NYSE Arca, CBOE, Nasdaq ISE, and others\n- Urgency signals directional conviction — the buyer wants in NOW, not wanting to tip off the market with a single-exchange print\n- Typically at or above the ask (buyer is aggressive)\n- Bearish sweeps hit multiple exchanges on puts\n\n**Blocks** — A single large negotiated trade (usually >1,000 contracts) executed off-exchange at a single price between two counterparties.\n- Slower execution — the two parties negotiate price\n- May represent a hedge (less directional signal) or a long-term institutional position\n- Often done at the mid-price or between bid/ask\n\n**Splits** — The same underlying directional trade broken into smaller pieces across multiple exchanges over minutes or hours.\n- Indicates an institution trying to disguise order size\n- Detection: same strike/expiry, same side (all calls or all puts), multiple prints within a short window\n- Aggregated size can be extremely large",
 highlight: ["unusual activity", "sweep", "block", "split", "open interest"],
 },
 {
 type: "teach",
 title: "Flow Analysis Framework",
 content:
 "Once you identify unusual flow, a structured framework helps determine its significance.\n\n**Strike vs ATM (at-the-money):**\n- **Far OTM (>10% from current price):** Lottery tickets or speculation — the payout requires a very large move. Often seen before binary events (earnings, FDA, M&A). Low premium, high leverage.\n- **Near ATM (within 3–5%):** Directional conviction — the trader expects a meaningful move in the near term. Higher probability of profit; more premium at stake.\n- **Deep ITM:** May be a synthetic stock replacement (less leverage, more capital) or a hedge on an existing short position.\n\n**Expiry horizon:**\n- **Weekly options (0–7 DTE):** High-urgency, short-term trade — often an earnings play, catalyst event, or short-term momentum bet.\n- **Monthly options (30–60 DTE):** Swing trade positioning, medium-term thesis.\n- **LEAPS (>6 months):** Long-term institutional conviction. A $5M LEAPS position signals multi-quarter directional thesis.\n\n**Size thresholds (notional premium paid):**\n- $100K–$1M: Significant retail or small fund activity\n- $1M+: Whale activity — worth watching\n- $5M+: Smart money — institutional desk or well-capitalized hedge fund\n\n**Open interest changes:**\nAfter flow prints, watch if OI increases the next morning. Rising OI confirms the trade opened new positions (not a close). Flat or falling OI suggests the flow was closing existing positions — opposite directional signal.",
 highlight: ["ATM", "OTM", "LEAPS", "DTE", "open interest"],
 },
 {
 type: "teach",
 title: "Contrarian Signals & Dealer Gamma",
 content:
 "Options flow is not always a straightforward directional signal. Context matters.\n\n**Consensus bullish flow as a top signal:**\nWhen options flow is overwhelmingly one-sided (e.g., 90% calls, massive call sweeps on every rally), this can paradoxically signal an imminent reversal. If everyone who wants to be long is already long, the marginal buyer disappears. This is especially true when put/call ratios drop to multi-year lows — retail euphoria historically precedes corrections.\n\n**VIX call buying — hedge vs. speculation:**\n- Institutions routinely buy VIX calls as portfolio insurance (tail-risk hedges). This shows up as massive 'bullish' VIX flow but is actually a hedge — it signals fear, not directional bullishness on volatility itself.\n- Speculative VIX call buying occurs when traders expect an imminent spike in volatility — reading context (does the institution also hold equities?) matters.\n\n**Dealer gamma positioning:**\nOptions dealers (market makers who write options) hedge their books dynamically. Their net gamma exposure affects price stability:\n- **Dealers short gamma** (net long options): Must buy rallies and sell dips to hedge — this **amplifies** price moves. Markets become more volatile.\n- **Dealers long gamma** (net short options): Must sell rallies and buy dips to hedge — this **dampens** price moves. Markets become mean-reverting, tighter ranges.\n\nWhen dealers flip from long to short gamma at a key strike (the 'gamma flip' level), market behavior can change abruptly — watch options market maker gamma exposure data (SpotGamma, GEX charts).",
 highlight: ["put/call ratio", "VIX", "dealer gamma", "gamma flip", "hedge"],
 },
 {
 type: "quiz-mc",
 question:
 "A trader observes large call options buying that 'sweeps' across multiple exchanges simultaneously within seconds, filling at or above the ask price. What does this most likely indicate?",
 options: [
 "Strong bullish directional conviction — the buyer is aggressively prioritizing immediate fill over price, signaling urgency",
 "A risk-off hedge by an institution that is long the underlying stock",
 "A market maker balancing their book by buying calls to offset existing put exposure",
 "A retail trader placing multiple small orders that happened to fill simultaneously",
 ],
 correctIndex: 0,
 explanation:
 "A sweep is executed aggressively across multiple exchanges to fill immediately at the ask, signaling the buyer wants the position NOW and is willing to pay up for it. This urgency typically indicates strong directional conviction — a bullish bet in the case of call sweeps. Hedges are usually placed as blocks (negotiated, single-price) and market maker activity does not appear as directional sweeps.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A high put/call ratio (more puts trading than calls) is always a bearish signal for the underlying stock.",
 correct: false,
 explanation:
 "False. A high put/call ratio can actually be a contrarian bullish signal when the put buying is driven by hedging rather than outright speculation. Institutions routinely buy puts to protect long portfolios. When the ratio is driven by hedging activity, excessive pessimism can mark a sentiment extreme and a potential bottom. Context — who is buying and why — is critical to interpretation.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You notice the following options flow on a $50 stock: 5,000 call contracts at the $55 strike expiring in 3 weeks, executed as a sweep at the ask ($0.80 per contract = $400,000 notional), volume is 12× the open interest at that strike.",
 question:
 "What is the most accurate interpretation of this unusual activity?",
 options: [
 "Bullish — large sweep at the ask with volume 12× OI suggests new directional money entering with conviction; 3-week ATM-adjacent calls imply expectation of a near-term move above $55",
 "Bearish — large call buying often hedges a short position in the stock",
 "Neutral — the position is too far OTM at $55 to have directional significance",
 "Bearish — call sweeps signal dealers will short gamma and push the price down",
 ],
 correctIndex: 0,
 explanation:
 "Volume at 12× open interest confirms this is new money entering, not a close. The sweep execution (aggressive, multi-exchange, at the ask) shows urgency and directional conviction. The $55 strike is 10% OTM — meaningful but not a lottery ticket. $400,000 notional in 3-week calls is a whale-sized bet on a move above $55 within three weeks. All signs point to a bullish directional thesis.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Dark Pool & Institutional Activity 
 {
 id: "mi-2",
 title: "Dark Pool & Institutional Activity",
 description:
 "How dark pools work, FINRA reporting, 13F filings, and detecting institutional footprints",
 icon: "Eye",
 xpReward: 80,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Dark Pools Explained",
 content:
 "Dark pools are private alternative trading systems (ATS) that allow participants to trade large blocks of stock without revealing their orders to the public market before execution.\n\n**Who operates them?**\nMajor dark pools are operated by broker-dealers and independent operators:\n- Goldman Sachs (Sigma X), Morgan Stanley (MS POOL), Credit Suisse (CrossFinder)\n- Independent operators: IEX, Virtu MatchIt\n- Broker internalizers: Citadel Securities, Virtu Financial internalize retail order flow internally before any exchange exposure\n\n**Scale:**\nOff-exchange trading (dark pools + internalizers) now accounts for approximately **38% of total US equity volume** — roughly equal to all lit exchange volume combined.\n\n**Why use dark pools?**\n- **Minimize market impact:** A fund selling 2 million shares of a mid-cap stock in a dark pool avoids tipping off lit-market HFT algorithms that would front-run the order\n- **Anonymity:** Counterparty identity is not disclosed pre-trade\n- **Price improvement:** Large trades can often execute at or near the midpoint, better than the bid-ask spread\n\n**Regulation:**\nDark pools are legal and regulated under SEC **Regulation ATS** (Alternative Trading System). They must:\n- Register with the SEC\n- Report all transactions to FINRA's trade reporting facilities within 10 seconds\n- Maintain audit trails under the Consolidated Audit Trail (CAT) system",
 highlight: ["dark pool", "ATS", "off-exchange", "market impact", "Reg ATS"],
 },
 {
 type: "teach",
 title: "FINRA Dark Pool Reporting & Print Detection",
 content:
 "While dark pool orders are hidden before execution, post-trade data is publicly available and can be mined for institutional signals.\n\n**FINRA TRF (Trade Reporting Facility):**\nAll off-exchange trades are reported to FINRA's TRF. Services like FINRA's ATS Transparency data and third-party platforms (Unusual Whales, FlowAlgo) publish:\n- Off-exchange volume % per ticker (e.g., AAPL showing 45% dark pool volume is above average)\n- Daily aggregate dark pool prints by venue\n- Historical dark pool % to identify unusual spikes\n\n**Dark pool print detection signals:**\n\n1. **Large print at a specific price:** A single large off-exchange trade at $49.50 (for example) may signal institutional accumulation. If the stock repeatedly bounces from $49.50 on subsequent days, the dark pool print has identified an institutional support level.\n\n2. **Dark pool reversal pattern:** Large dark pool buy print followed shortly by a price reversal higher — the institution absorbed all available supply at that level. This is a bullish setup.\n\n3. **Abnormal dark pool % spike:** When a stock's off-exchange percentage jumps from a normal 30% to 55%+ on a given day, institutions may be accumulating or distributing in size.\n\n**Consolidated Audit Trail (CAT):**\nThe SEC's CAT system (fully operational 2023) creates a complete record of every order, quote, and trade across all US markets. While not public, it enables regulators to reconstruct any market event and prosecute manipulation.",
 highlight: ["FINRA TRF", "off-exchange volume", "dark pool print", "CAT", "institutional"],
 },
 {
 type: "teach",
 title: "13F Filings — Tracking Smart Money",
 content:
 "SEC Form 13F is one of the most widely used tools for tracking institutional equity positioning.\n\n**What is a 13F?**\nAny institutional investment manager with discretion over $100M or more in Section 13(f) securities (US-listed equities, certain ETFs, convertible bonds) must file Form 13F with the SEC.\n\n**Filing schedule:**\n- Filed **45 days after the end of each calendar quarter**\n- Q1 (Jan–Mar) due May 15th\n- Q2 (Apr–Jun) due August 14th\n- Q3 (Jul–Sep) due November 14th\n- Q4 (Oct–Dec) due February 14th\n\n**What 13Fs reveal:**\n- All long equity holdings (name, CUSIP, share count, market value)\n- New positions (first appearance = new buy)\n- Exited positions (disappearance = full sell)\n- Increased or decreased positions (share count changes)\n\n**What 13Fs do NOT show:**\n- **Short positions** — only longs are required\n- **Options positions** (unless settled into shares)\n- **Non-US securities** (ADRs excepted)\n- **Bonds and derivatives**\n\n**Critical limitation — data staleness:**\nBy the time a 13F is public, the data is 45–105 days old. Positions may have been completely changed. Use 13Fs to identify long-term thematic conviction (a fund that has held a position for 4+ quarters) rather than for timing entries.",
 highlight: ["13F", "institutional holdings", "filing deadline", "long positions", "staleness"],
 },
 {
 type: "quiz-mc",
 question:
 "When must an institutional investment manager with over $100M in qualifying assets file their Form 13F with the SEC?",
 options: [
 "Within 45 days after the end of each calendar quarter",
 "Within 10 business days after any position change exceeding 1% of the portfolio",
 "Annually, within 60 days of the fiscal year end",
 "Within 2 business days of any transaction, same as Form 4",
 ],
 correctIndex: 0,
 explanation:
 "Form 13F must be filed within 45 days after the end of each calendar quarter (March 31, June 30, September 30, December 31). This means the data is already 45–135 days old by the time it is publicly available. This significant lag is the primary limitation of 13F analysis for trading — positions may have already been reversed.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Dark pools are illegal shadow markets that operate outside SEC oversight and allow institutions to evade securities regulations.",
 correct: false,
 explanation:
 "False. Dark pools are fully legal and regulated by the SEC under Regulation ATS (Alternative Trading System). They must register with the SEC, report all transactions to FINRA's Trade Reporting Facilities within 10 seconds of execution, and maintain complete audit trails under the Consolidated Audit Trail (CAT) system. They are a regulated, legitimate segment of US equity market structure.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A mid-cap stock is trading at $32. FINRA TRF data shows an unusually large dark pool print of 800,000 shares at $31.75 — well above typical daily dark pool volume. That same morning, the options flow shows large call sweeps at the $35 strike expiring in 6 weeks.",
 question:
 "What is the most complete interpretation of this combined institutional signal?",
 options: [
 "Strongly bullish — the dark pool print at $31.75 suggests institutional accumulation at that level, and the call sweeps indicate the same or related parties expect a move to $35+ within 6 weeks",
 "Bearish — institutions selling 800,000 shares in a dark pool are distributing into strength",
 "Neutral — dark pool prints and options flow often conflict and should be ignored together",
 "Slightly bullish, but the $35 strike is too far OTM to be meaningful on a $32 stock",
 ],
 correctIndex: 0,
 explanation:
 "The combination of a large dark pool buy print (institutional accumulation at $31.75) and aggressive call sweep buying at $35 (6-week target) creates a high-conviction bullish signal. The dark pool print establishes support and suggests the institution absorbed shares without moving the price, while the call sweeps confirm upside directional intent. When dark pool accumulation and options flow align, the confluence raises signal quality.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Sentiment & Social Data 
 {
 id: "mi-3",
 title: "Sentiment & Social Data",
 description:
 "AAII/II surveys, social media alpha decay, short interest, and squeeze mechanics",
 icon: "MessageSquare",
 xpReward: 75,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "AAII & II Sentiment Surveys — Contrarian Indicators",
 content:
 "Sentiment surveys measure the mood of investors and are among the oldest contrarian indicators in market analysis.\n\n**AAII Sentiment Survey (American Association of Individual Investors):**\n- Weekly survey of retail investors: Bullish / Neutral / Bearish\n- Published every Thursday morning\n- The **Bull-Bear Spread** = % Bullish minus % Bearish\n- Historical average: ~38% bullish, ~30% bearish\n\n**Contrarian signals:**\n- Bullish % > 60%: Historically precedes below-average 6-month returns (crowded long)\n- Bearish % > 50%: Historically precedes above-average 6-month returns (extreme fear = buying opportunity)\n- The survey was most predictive as a contrarian indicator during the 2008–2009 bear market and 2020 COVID crash\n\n**Investors Intelligence (II) Newsletter Survey:**\n- Weekly survey of financial newsletter writers (perceived as more sophisticated than retail)\n- Tracks Bull%, Bear%, and Correction% categories\n- Bull/Bear ratio > 3.0 historically associated with market tops\n- Bull/Bear ratio < 1.0 associated with major market bottoms\n\n**Key limitations:**\n- Sentiment can remain at extremes for months during strong trends\n- Most useful at turning points, not for timing individual trades\n- Best combined with price action (e.g., price making new highs while sentiment is already euphoric = watch out)",
 highlight: ["AAII", "bull-bear spread", "contrarian", "Investors Intelligence", "sentiment"],
 },
 {
 type: "teach",
 title: "Social Media Alpha Decay",
 content:
 "Social media became a significant market force in 2021, but the tradeable edge has since compressed significantly.\n\n**The WallStreetBets era (2021):**\nThe GameStop (GME) squeeze of January 2021 demonstrated that coordinated retail sentiment on Reddit could materially move markets, even stocks with massive institutional short positions. AMC, BlackBerry, and dozens of other heavily-shorted stocks surged as retail buyers coordinated via r/WallStreetBets (now 15M+ members).\n\nThe returns to early social media signal readers in 2019–2021 were extraordinary — systematic funds monitoring Reddit/Twitter before others had real alpha.\n\n**Alpha decay since 2021:**\nAs awareness grew, hundreds of quantitative funds built systems to monitor social sentiment in real-time:\n- Social sentiment data vendors (StockTwits API, Bloomberg's social sentiment, Refinitiv Sentiment) now sell real-time feeds\n- When everyone monitors the same signal, the edge disappears — prices react within minutes of a viral post\n- First movers still profit; late arrivals get squeezed\n\n**Where social data still has edge (2024–2026):**\n- **Short squeeze identification:** Tracking stocks with >20% short float + rising social volume can front-run squeezes\n- **Earnings sentiment analysis:** Aggregating product reviews, app ratings, and social buzz before earnings can predict revenue surprise direction\n- **Niche communities:** Highly specialized forums (biotech Reddit, crypto Twitter) occasionally contain early fundamental insights before mainstream coverage\n\n**The signal-to-noise problem:**\nMost social media activity is noise. Separating genuine early information from manipulation, pumping, and coordination requires sophisticated NLP filtering — not feasible for most retail traders.",
 highlight: ["WallStreetBets", "alpha decay", "short squeeze", "social sentiment", "NLP"],
 },
 {
 type: "teach",
 title: "Short Interest Data & Squeeze Mechanics",
 content:
 "Short interest measures the total number of shares sold short that have not yet been covered, expressed as a percentage of float.\n\n**Key metrics:**\n- **Short Interest % of Float:** (Shares Short / Float) × 100. Above 20% is high; above 30% is extreme and increases squeeze risk.\n- **Days to Cover (Short Interest Ratio):** Shares Short ÷ Average Daily Volume. A 10-day DTC means it would take 10 days of full average volume for all shorts to cover. High DTC = potential fuel for extended squeeze.\n- **Cost to Borrow:** Annual rate shorts pay to borrow shares. Easy-to-borrow: ~0.25%/yr. Hard-to-borrow: 20–150%+/yr. Rising borrow costs signal increasing short conviction — or short supply of borrows.\n\n**FINRA short interest reporting:**\nFINRA publishes short interest data twice monthly (mid-month and end-of-month), with a 2-week lag. This staleness means the data is useful for identifying structural setups but not for real-time squeeze confirmation.\n\n**Short squeeze mechanics:**\nA squeeze occurs when:\n1. Stock with high short interest begins rising\n2. Rising price triggers stop-losses on shorts (short stop = buy to cover)\n3. Covering buys push price higher\n4. Higher price forces more shorts to cover feedback loop\n5. Hard-to-borrow cost spikes, forcing marginal short holders to exit\n\n**Classic short squeeze signals:**\n- Float <20M shares (thin float = easy to move)\n- Short interest >25% of float\n- Days to cover >10\n- Rising borrow cost\n- Positive catalyst (earnings beat, FDA approval, contract win)\n- Options call buying increasing",
 highlight: ["short interest", "days to cover", "float", "borrow cost", "short squeeze"],
 },
 {
 type: "quiz-mc",
 question:
 "A stock has 10 million shares sold short and average daily trading volume of 2 million shares. What is the 'days to cover' metric?",
 options: [
 "5 days — short interest (10M) divided by average daily volume (2M) = 5 days to cover",
 "20% — short interest as a percentage of the 50M share float",
 "2 days — volume divided by short interest gives the daily coverage rate",
 "10 days — the metric is calculated as short interest × volume / 100",
 ],
 correctIndex: 0,
 explanation:
 "Days to Cover = Short Interest ÷ Average Daily Volume = 10,000,000 ÷ 2,000,000 = 5 days. This means if every share traded in the average session was a short covering, it would take 5 full days to close all short positions. Higher days to cover generally increases squeeze potential — if a catalyst forces rapid covering, it takes many days, amplifying the price move.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "A stock with very high short interest (e.g., 40% of float sold short) is always a bearish signal and should be avoided by bullish investors.",
 correct: false,
 explanation:
 "False. High short interest can actually be the fuel for a short squeeze — a powerful bullish move. When a positive catalyst hits a stock with 40% of float short, the forced covering of millions of shares creates enormous buying pressure that can drive prices far higher than fundamentals alone would justify. Many traders specifically seek out high short interest stocks as potential squeeze candidates when a catalyst is expected.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A small-cap biotech has: 15M share float, 4.5M shares sold short (30% of float), days to cover = 12, borrow rate recently jumped from 5% to 45% annually. The company announces positive Phase 2 trial results before market open.",
 question:
 "What market dynamic is most likely to unfold at market open?",
 options: [
 "A short squeeze — the positive catalyst forces shorts to cover simultaneously; with 12 days to cover and 30% short float, covering pressure on a thin float could send the stock dramatically higher",
 "A sell-the-news reaction — biotech stocks always decline after Phase 2 results as uncertainty resolves",
 "Minimal price movement — short interest data is always stale and doesn't affect actual trading",
 "Institutional selling — large funds always distribute into positive news events",
 ],
 correctIndex: 0,
 explanation:
 "All squeeze conditions are present: high short interest (30%), high days to cover (12), a thin float (15M shares), and a rising borrow rate (shorts already paying 45% annual cost). The positive Phase 2 results are a hard catalyst that forces shorts to reassess their thesis. Combined with the mechanical pressure of forced covering on a thin float, a significant short squeeze is the most likely outcome at open.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Alternative Data Sources 
 {
 id: "mi-4",
 title: "Alternative Data Sources",
 description:
 "Satellite imagery, credit card data, web scraping, and digital signals as investment alpha",
 icon: "Database",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Satellite Imagery as Investment Alpha",
 content:
 "Satellite data has become one of the most technically sophisticated alternative data sources, providing physically observable proxies for economic activity before official data or company disclosures are available.\n\n**Parking lot density analysis:**\nRetail chain parking lots, counted from satellite images with computer vision, serve as a foot traffic proxy:\n- Walmart, Target, Home Depot parking lot counts correlate with quarterly same-store sales\n- Counts are taken weekly; investors get a leading indicator ~45 days before the earnings report\n- Vendors: Orbital Insight (acquired by Alteryx), SpaceKnow, Placer.ai\n\n**Oil storage tank levels:**\nFloating roof oil storage tanks have a unique physical property — when viewed from space, the angle of shadow cast by the floating roof reveals how full the tank is:\n- Full tanks: roof is at top, minimal shadow gap\n- Empty tanks: roof at bottom, large shadow visible\n- This technique allows satellite analysts to estimate global oil inventory levels in near-real-time\n- Crude oil traders use satellite tank data to anticipate EIA weekly inventory reports\n\n**Shipping lane monitoring:**\nAIS (Automatic Identification System) transponder data from commercial vessels can be combined with satellite imagery to track:\n- Container ship traffic density at major ports (proxy for trade volumes)\n- Tanker congestion at oil terminals\n- Construction material imports to specific countries\n\n**Construction progress tracking:**\nHigh-resolution imagery monitors construction progress at factories, data centers, and mines — providing leading indicators for capex spending and future production capacity.",
 highlight: ["satellite imagery", "parking lot", "oil storage", "AIS", "Orbital Insight"],
 },
 {
 type: "teach",
 title: "Credit Card Data & Consumer Spending Intelligence",
 content:
 "Anonymized and aggregated credit/debit card transaction data provides a powerful, near-real-time window into consumer spending — a direct leading indicator for retail and restaurant sector earnings.\n\n**How it works:**\nCard networks (Visa, Mastercard) and banks license aggregated, anonymized spending data to financial data vendors. The vendors normalize and structure the data by merchant, category, and geography.\n\n**Major vendors:**\n- **Second Measure** (acquired by Bloomberg): Normalizes card data across multiple sources; covers ~50M US consumers\n- **YipitData (now Yipit/Bloomberg):** Combines card + web data; strong restaurant and subscription coverage\n- **Earnest Analytics (formerly Earnest Research):** Focused on consumer spending trends\n- **Bloomberg Second Measure:** Integrated into Bloomberg terminal\n\n**Typical use cases:**\n- Estimate a restaurant chain's same-store sales before earnings (accuracy within 1–3%)\n- Track market share shifts (Is SBUX losing wallet share to Dutch Bros?)\n- Monitor subscription renewal rates for SaaS companies with card payments\n- Identify early turnaround signals (spending recovering before street estimates update)\n\n**Limitations and biases:**\n- **Selection bias:** Card users all consumers. Cash transactions, checks, and ACH payments are invisible. Lower-income demographics are underrepresented.\n- **Privacy concerns:** Despite anonymization, the granularity of card data raises ongoing regulatory scrutiny (CFPB)\n- **Coverage gaps:** B2B transactions, international revenue, and certain categories (healthcare, government) are poorly covered\n- **Alpha compression:** As more funds subscribe, the advantage shrinks — most large-cap retail names are now heavily covered",
 highlight: ["credit card data", "Second Measure", "YipitData", "selection bias", "same-store sales"],
 },
 {
 type: "teach",
 title: "Web Scraping & Digital Signals",
 content:
 "The internet leaves a rich trail of economic signals that can be harvested systematically.\n\n**Web traffic data:**\n- **SimilarWeb:** Estimates monthly website visits, session duration, traffic sources, and geographic breakdown\n- Use case: Track visits to an e-commerce site to estimate revenue growth quarter-over-quarter\n- Limitation: Panel-based estimates can have significant error bars for smaller sites\n\n**App download rankings:**\n- **Sensor Tower, data.ai (formerly App Annie):** Track iOS App Store and Google Play download rankings, revenue estimates, and active user trends\n- Use case: A FinTech app jumping from #50 to #5 in the Finance category is a strong revenue signal\n- Limitation: Download counts alone don't measure retention or monetization\n\n**Job posting trends:**\n- **Burning Glass (now Lightcast), LinkUp, Indeed Data:** Aggregate millions of job postings to identify where companies are investing\n- A company posting 200 ML engineer jobs signals AI infrastructure buildout before capex shows in financials\n- Headcount reduction via fewer job postings can signal margin improvement before earnings\n\n**Online reviews and pricing data:**\n- App store rating trends, Glassdoor employee satisfaction, Google Maps review counts (proxy for foot traffic)\n- Price scraping of competitor websites signals margin pressure or market share strategy\n\n**Alpha compression in digital signals:**\nMost of these data sources are now well-known and widely subscribed. The alpha from web data has compressed dramatically from its peak in 2015–2020. Today, the edge comes from:\n- Proprietary data processing (better models, faster normalization)\n- Combinations (web traffic + card data + job postings = stronger signal than any alone)\n- Niche applications in underfollowed small/mid-cap names",
 highlight: ["SimilarWeb", "Sensor Tower", "job postings", "Burning Glass", "alpha compression"],
 },
 {
 type: "quiz-mc",
 question:
 "How do satellite analysts estimate the volume of crude oil stored in floating roof storage tanks?",
 options: [
 "By analyzing the shadow cast by the floating roof — the angle and size of the shadow gap reveals how high the roof is, which indicates how full the tank is",
 "By measuring the tank's diameter from space and multiplying by a standard fill ratio",
 "By counting tanker trucks arriving and departing the facility using vehicle recognition AI",
 "By monitoring heat signatures from the stored oil using infrared satellite imaging",
 ],
 correctIndex: 0,
 explanation:
 "Floating roof oil tanks have roofs that sit directly on the oil surface and rise or fall with the oil level. When viewed from space at an angle, the shadow gap between the roof edge and the tank wall reveals the roof's height — and therefore the fill level. Full tanks show a minimal shadow gap; empty tanks show a large gap. This technique allows near-real-time inventory estimation without any company disclosure.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Alternative data sources like satellite imagery and credit card data provide the same level of investment alpha today as they did when first introduced to the market.",
 correct: false,
 explanation:
 "False. Alpha from alternative data compresses as more participants adopt it. When satellite parking lot data was first available to a handful of hedge funds in 2012–2015, the edge was substantial. Today, dozens of funds and even some quant retail platforms subscribe to the same feeds. Once a signal is widely known and acted upon, its price impact is front-run and the excess returns diminish. The edge now favors those with better processing, faster normalization, and combinations of multiple data sources.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are analyzing a mid-cap e-commerce company ahead of their quarterly earnings. You have access to three alt-data sources: (A) SimilarWeb web traffic data showing 22% YoY website visit growth, (B) credit card data showing 18% spending growth at their platform, (C) job postings showing 40% more fulfillment center job listings vs. last quarter.",
 question:
 "Which interpretation best leverages all three alternative data signals?",
 options: [
 "All three signals are bullish and corroborating — web traffic growth (demand), card spend growth (revenue realization), and fulfillment hiring (management expecting higher volume) collectively point to an earnings beat",
 "Only the credit card data is reliable; web traffic and job postings have too much noise to be useful",
 "The 40% increase in fulfillment job postings is bearish — it signals rising labor costs that will compress margins",
 "Web traffic growth of 22% vs card spend growth of 18% indicates a conversion decline — bearish signal",
 ],
 correctIndex: 0,
 explanation:
 "The confluence of three independent data sources all pointing the same direction significantly increases signal confidence. Web traffic growth indicates increasing consumer demand for the platform. Credit card spend growth confirms that demand is converting to actual revenue. Fulfillment center hiring indicates management is operationally preparing for higher order volumes — an independent confirmation that insiders expect growth. Triangulation across multiple independent datasets is the strongest form of alt-data analysis.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Insider & Congressional Activity 
 {
 id: "mi-5",
 title: "Insider & Congressional Activity",
 description:
 "Form 4 filings, STOCK Act disclosures, earnings timing signals, and tracking smart money",
 icon: "UserCheck",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "SEC Form 4 — Insider Transaction Reporting",
 content:
 "Corporate insiders — officers, directors, and 10%+ shareholders — must disclose their transactions in company stock to the SEC, creating a publicly accessible record of smart money activity.\n\n**The three insider reporting forms:**\n\n**Form 3 (Initial Ownership Statement):**\nFiled when an individual first becomes an insider. Reports current holdings. Due within 10 days of becoming an insider.\n\n**Form 4 (Statement of Changes in Beneficial Ownership):**\nThe most actionable form. Filed within **2 business days** of any transaction. Reports open market purchases, sales, options exercises, and gift transfers.\n\n**Form 5 (Annual Statement):**\nCovers exempt transactions not reported during the year. Less commonly monitored.\n\n**What Form 4 data reveals:**\n- Transaction date, price, and number of shares\n- Whether shares were acquired on the open market vs. option exercise\n- Post-transaction total holdings\n- Transaction type code (P = purchase, S = sale, A = award, etc.)\n\n**Cluster buying — the highest signal:**\nWhen multiple insiders buy on the open market within a short window (same week or month), this is one of the most reliable bullish signals in insider data. Multiple independent insiders rarely spend personal capital on their own stock unless they have high conviction.\n\n**Why selling is less informative:**\nInsiders sell for many reasons: diversification, estate planning, home purchase, tax obligations, RSU/option vesting schedules. A single sale should be discounted heavily. Only coordinated, large-scale selling by multiple insiders simultaneously carries meaningful signal.",
 highlight: ["Form 4", "Form 3", "Form 5", "cluster buying", "2 business days"],
 },
 {
 type: "teach",
 title: "STOCK Act & Congressional Trading",
 content:
 "The Stop Trading on Congressional Knowledge (STOCK) Act (2012) requires members of Congress, their staff, and executive branch officials to disclose securities trades publicly.\n\n**Disclosure requirements:**\n- Trades must be reported within **45 days** of the transaction\n- Minimum transaction threshold: $1,000\n- Reports filed with the House or Senate financial disclosure office and available on efts.house.gov and efts.senate.gov\n\n**The performance controversy:**\nMultiple academic studies (2004–2023) documented that Congressional portfolios — particularly Senate portfolios pre-STOCK Act — substantially outperformed the market. The Ziobrowski et al. (2004) study found senators outperformed the market by approximately 12% annually during 1993–1998.\n\nPost-STOCK Act outperformance has declined but studies continue to find significant edge, particularly in industries subject to Congressional oversight (defense, healthcare, tech regulation).\n\n**High-profile examples:**\n- Nancy Pelosi's trades in semiconductor and technology companies have been widely tracked, particularly ahead of legislation like the CHIPS Act\n- Multiple members on Armed Services Committee committees held defense contractor positions ahead of major procurement announcements\n\n**Congressional tracking products:**\n- **NANC ETF** (Subversive Unusual Whales Democratic ETF): Tracks House Democrat portfolios\n- **KRUZ ETF** (Subversive Unusual Whales Republican ETF): Tracks House Republican portfolios\n- **Quiver Quantitative, Capitol Trades:** Free web tools for individual Congressional trade lookup\n\n**Practical edge limitations:**\n- 45-day reporting lag means disclosed trades are stale\n- Many positions are in ETFs, index funds, or blind trusts\n- Correlation does not prove information advantage",
 highlight: ["STOCK Act", "45 days", "Congressional trading", "NANC", "KRUZ"],
 },
 {
 type: "teach",
 title: "Earnings Timing & Guidance Intelligence",
 content:
 "How and when companies release earnings contains information beyond the numbers themselves.\n\n**Earnings announcement timing:**\nCompanies choose their earnings release date and time. Studies show timing correlates with results:\n- **Pre-market releases** on Mondays or Tuesdays are often associated with better-than-expected results (company wants maximum visibility)\n- **After-hours Friday releases** are associated with weaker results (bury bad news in low-attention windows)\n- **Delayed releases** (filing extensions, last-minute schedule changes) are often bearish signals\n\n**The 'confession quarter' pattern:**\nBefore a quarter with dramatically bad results, management frequently issues a pre-announcement warning (guidance cut) weeks before the actual report. Academic literature calls this the 'confession quarter.'\n- Watch for sudden analyst meetings, investor day cancellations, or CFO departures as early warning signs\n- The stock often drops significantly on the pre-announcement, then drops further on the actual release\n\n**Guidance quality and sandbagging:**\nManagement teams develop reputations for guidance accuracy:\n- **Sandbaggers:** Consistently guide low, beat by large margins (positive surprise culture). Stocks often trade at premium valuations.\n- **Optimists:** Guide high, frequently miss. Stocks often trade at discounts or with high short interest.\n- **Consistent messers:** Pattern of guide-cuts actual misses. Red flag.\n\n**Analyst price target dynamics:**\nAfter earnings, watch analyst revisions:\n- Estimates raising price target AND raising EPS estimates = conviction upgrade (bullish)\n- Raising price target with unchanged estimates = multiple expansion argument (less bullish)\n- Target cut with unchanged estimates = valuation concern (mildly bearish)\n- Estimates cut AND target cut = capitulation (potentially oversold contrarian signal)",
 highlight: ["earnings timing", "confession quarter", "sandbagging", "guidance", "analyst revision"],
 },
 {
 type: "quiz-mc",
 question:
 "Within how many business days must a corporate insider (officer, director, or 10%+ shareholder) file a Form 4 with the SEC after a transaction in the company's stock?",
 options: [
 "2 business days",
 "10 business days",
 "45 calendar days",
 "30 calendar days",
 ],
 correctIndex: 0,
 explanation:
 "Form 4 must be filed within 2 business days of the transaction date. This rapid disclosure requirement (tightened from 10 days in 2002 under Sarbanes-Oxley) means that meaningful insider transaction data is publicly available very quickly, allowing market participants to observe large open-market purchases or sales almost in real time. The quick disclosure was specifically designed to prevent insiders from delaying disclosure until after a price move.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "An insider selling a large block of company stock is always a reliable bearish signal that the stock price will decline.",
 correct: false,
 explanation:
 "False. Insider selling is far less informative than insider buying because there are many legitimate, non-bearish reasons to sell: portfolio diversification (most CEOs are highly concentrated in their company stock), estate planning, tax obligations, funding a home purchase, RSU/option vesting schedules, or pre-planned 10b5-1 trading plans. Coordinated selling by multiple insiders simultaneously is more concerning than a single executive sale. In contrast, open-market buying is almost always voluntary and signals personal conviction.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Over a 3-week period, you observe the following Form 4 filings for a small-cap industrial company: the CEO buys 50,000 shares at $12.40, the CFO buys 30,000 shares at $12.50, and two independent directors each buy 10,000 shares at prices near $12.45. The stock has been declining for 6 months and currently sits 45% below its 52-week high.",
 question:
 "How should you interpret this cluster of insider buying?",
 options: [
 "Strongly bullish — four independent insiders spending personal capital to buy near the current price after a 45% decline signals high collective conviction that the stock is undervalued",
 "Bearish — insiders buying after a large decline often signals they are trying to artificially support the stock price to prevent further decline",
 "Neutral — insider purchases below $1M total are too small to be significant regardless of the number of participants",
 "Slightly bullish but offset by the 6-month downtrend — momentum is more reliable than insider data",
 ],
 correctIndex: 0,
 explanation:
 "Cluster insider buying — multiple insiders independently spending personal capital at similar price levels — is one of the highest-quality signals in insider data. Each insider has independent reasons to NOT buy (concentration risk, liquidity needs, uncertainty). When four insiders including the CEO and CFO all choose to buy in the same 3-week window near a multi-year low, the collective conviction signal is unusually strong. This does not guarantee a bottom, but historically cluster buying after significant declines has been a reliable predictor of eventual price recovery.",
 difficulty: 2,
 },
 ],
 },
 ],
};
