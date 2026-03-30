export interface FundamentalsData {
 // Identity
 sector: string;
 industry: string;

 // Valuation
 marketCap: string;
 marketCapNum: number; // raw billions for comparison
 peRatio: number;
 forwardPE: number; // forward 12-month P/E
 pbRatio: number; // price-to-book
 psRatio: number; // price-to-sales
 evEbitda: number; // EV/EBITDA multiple (0 for ETFs)
 sectorAvgPE: number; // peer average for context

 // Valuation (expanded)
 enterpriseValue: number; // billions
 evToRevenue: number; // EV/Revenue
 evToFCF: number; // EV/FCF
 priceToFCF: number; // P/FCF
 pegRatio: number; // PEG

 // Growth
 revenue: string; // formatted e.g. "$391B"
 revenueGrowthYoY: number; // % YoY (0 for ETFs)
 eps: number;
 epsGrowthYoY: number; // % YoY

 // Growth (expanded)
 revenueGrowth3Y: number; // 3-year CAGR %
 epsGrowth3Y: number; // 3-year CAGR %
 fcfGrowth: number; // YoY %
 bookValueGrowth: number; // YoY %

 // Profitability / Health
 grossMargin: number; // % (0 for ETFs)
 operatingMargin: number; // % (0 for ETFs)
 netMargin: number; // % (0 for ETFs)
 roe: number; // Return on equity % (0 for ETFs)
 debtToEquity: number; // (0 for ETFs/banks)
 currentRatio: number; // (0 for ETFs/banks)
 freeCashFlow: string; // formatted e.g. "$108B" (N/A for ETFs)

 // Profitability (expanded)
 ebitdaMargin: number; // %
 fcfMargin: number; // %
 returnOnAssets: number; // %
 returnOnCapital: number; // ROIC %

 // Balance Sheet (expanded)
 totalDebt: number; // billions
 netCash: number; // billions (cash - debt, can be negative)
 interestCoverage: number; // EBIT / interest expense
 quickRatio: number; // (current assets - inventory) / current liabilities

 // Efficiency
 assetTurnover: number; // revenue / total assets
 inventoryTurnover: number; // COGS / avg inventory (0 for tech/services)
 daysSalesOutstanding: number; // receivables / (revenue/365)

 // Shareholder
 sharesOutstanding: number; // billions
 buybackYield: number; // % of market cap bought back annually
 totalYield: number; // dividend yield + buyback yield

 // Institutional
 institutionalOwnership: number; // %
 insiderTransactions: "Net Buying" | "Net Selling" | "Neutral";

 // Technical Context
 fiftyDayMA: number;
 twoHundredDayMA: number;
 avgVolume30d: number; // millions
 relativeVolume: number; // current vol / avg vol

 // Income
 dividendYield: number;
 dividendPayoutRatio: number; // % (0 if no dividend)

 // Market data
 beta: number;
 week52High: number;
 week52Low: number;
 avgVolume: string;
 shortFloat: number; // % short interest

 // Analyst
 analystRating: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell" | "N/A";
 priceTarget: number; // consensus price target (0 for ETFs)
 priceTargetHigh: number;
 priceTargetLow: number;
 analystCount: number; // 0 for ETFs

 // Earnings
 nextEarningsDate: string; // e.g. "2024-07-25" or "N/A"
 lastEarningsResult: "beat" | "miss" | "in-line" | "N/A";
 earningsSurprisePct: number; // positive = beat, negative = miss

 // Earnings Detail (expanded)
 earningsCallTime: string; // "AMC" | "BMO" | "N/A"
 revenueEstimate: number; // billions, next quarter
 epsEstimate: number; // next quarter

 // Sector Context
 sectorPE: number; // sector average P/E
 sectorGrowth: number; // sector average revenue growth %

 // Narrative
 description: string;
 risks: string[]; // 3 key risks
 catalysts: string[]; // 3 key catalysts
}

export const FUNDAMENTALS: Record<string, FundamentalsData> = {
 AAPL: {
 sector: "Technology",
 industry: "Consumer Electronics",
 marketCap: "$3.4T",
 marketCapNum: 3400,
 peRatio: 33.2,
 forwardPE: 29.4,
 pbRatio: 48.6,
 psRatio: 8.9,
 evEbitda: 25.1,
 sectorAvgPE: 28.1,

 // Valuation (expanded)
 enterpriseValue: 3320,
 evToRevenue: 8.5,
 evToFCF: 30.7,
 priceToFCF: 31.5,
 pegRatio: 2.7,

 // Growth
 revenue: "$391B",
 revenueGrowthYoY: 2.1,
 eps: 6.42,
 epsGrowthYoY: 10.8,

 // Growth (expanded)
 revenueGrowth3Y: 7.8,
 epsGrowth3Y: 12.4,
 fcfGrowth: 5.2,
 bookValueGrowth: -5.8, // negative due to massive buybacks

 // Profitability
 grossMargin: 46.2,
 operatingMargin: 31.5,
 netMargin: 25.3,
 roe: 147.5,
 debtToEquity: 1.87,
 currentRatio: 0.87,
 freeCashFlow: "$108B",

 // Profitability (expanded)
 ebitdaMargin: 33.4,
 fcfMargin: 27.6,
 returnOnAssets: 28.3,
 returnOnCapital: 56.7,

 // Balance Sheet (expanded)
 totalDebt: 111,
 netCash: -49, // more debt than cash after buybacks
 interestCoverage: 29.1,
 quickRatio: 0.84,

 // Efficiency
 assetTurnover: 1.12,
 inventoryTurnover: 34.2,
 daysSalesOutstanding: 58,

 // Shareholder
 sharesOutstanding: 15.33,
 buybackYield: 2.6,
 totalYield: 3.04,

 // Institutional
 institutionalOwnership: 60.2,
 insiderTransactions: "Neutral",

 // Technical Context
 fiftyDayMA: 228.5,
 twoHundredDayMA: 210.3,
 avgVolume30d: 54.2,
 relativeVolume: 0.92,

 // Income
 dividendYield: 0.44,
 dividendPayoutRatio: 14.8,

 // Market data
 beta: 1.24,
 week52High: 260.1,
 week52Low: 164.08,
 avgVolume: "54.2M",
 shortFloat: 0.7,

 // Analyst
 analystRating: "Buy",
 priceTarget: 245,
 priceTargetHigh: 300,
 priceTargetLow: 195,
 analystCount: 42,

 // Earnings
 nextEarningsDate: "2024-08-01",
 lastEarningsResult: "beat",
 earningsSurprisePct: 4.2,

 // Earnings Detail
 earningsCallTime: "AMC",
 revenueEstimate: 84.4,
 epsEstimate: 1.35,

 // Sector Context
 sectorPE: 28.1,
 sectorGrowth: 11.5,

 // Narrative
 description:
 "Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories. The company also sells services including advertising, AppleCare, cloud, digital content, and payment services. iPhone generates ~52% of revenue; Services (~25%) is the fastest-growing, highest-margin segment.",
 risks: [
 "iPhone revenue concentration — a single product represents over half of sales",
 "China exposure (~18% of revenue) creates geopolitical and regulatory risk",
 "Premium valuation at 33x PE leaves little tolerance for earnings misses",
 ],
 catalysts: [
 "AI integration into iOS, Siri, and native apps (Apple Intelligence)",
 "Services segment margin expansion — currently 70%+ gross margin and growing",
 "Vision Pro ecosystem buildout and long-term spatial computing positioning",
 ],
 },

 MSFT: {
 sector: "Technology",
 industry: "Enterprise Software & Cloud",
 marketCap: "$3.1T",
 marketCapNum: 3100,
 peRatio: 35.8,
 forwardPE: 31.2,
 pbRatio: 13.1,
 psRatio: 13.2,
 evEbitda: 27.4,
 sectorAvgPE: 28.1,

 enterpriseValue: 3050,
 evToRevenue: 12.4,
 evToFCF: 41.2,
 priceToFCF: 41.9,
 pegRatio: 1.8,

 revenue: "$245B",
 revenueGrowthYoY: 16.0,
 eps: 11.86,
 epsGrowthYoY: 20.4,

 revenueGrowth3Y: 13.5,
 epsGrowth3Y: 18.2,
 fcfGrowth: 22.1,
 bookValueGrowth: 14.8,

 grossMargin: 71.2,
 operatingMargin: 45.5,
 netMargin: 36.0,
 roe: 35.8,
 debtToEquity: 0.91,
 currentRatio: 1.77,
 freeCashFlow: "$74B",

 ebitdaMargin: 52.8,
 fcfMargin: 30.2,
 returnOnAssets: 19.2,
 returnOnCapital: 28.5,

 totalDebt: 79,
 netCash: 5, // ~$84B cash minus $79B debt
 interestCoverage: 46.2,
 quickRatio: 1.72,

 assetTurnover: 0.53,
 inventoryTurnover: 14.8,
 daysSalesOutstanding: 82,

 sharesOutstanding: 7.43,
 buybackYield: 0.8,
 totalYield: 1.52,

 institutionalOwnership: 72.8,
 insiderTransactions: "Net Selling",

 fiftyDayMA: 440.2,
 twoHundredDayMA: 418.7,
 avgVolume30d: 19.8,
 relativeVolume: 1.05,

 dividendYield: 0.72,
 dividendPayoutRatio: 26.4,

 beta: 0.89,
 week52High: 468.35,
 week52Low: 385.58,
 avgVolume: "19.8M",
 shortFloat: 0.5,

 analystRating: "Strong Buy",
 priceTarget: 500,
 priceTargetHigh: 550,
 priceTargetLow: 420,
 analystCount: 48,

 nextEarningsDate: "2024-07-23",
 lastEarningsResult: "beat",
 earningsSurprisePct: 6.8,

 earningsCallTime: "AMC",
 revenueEstimate: 64.4,
 epsEstimate: 2.94,

 sectorPE: 28.1,
 sectorGrowth: 11.5,

 description:
 "Microsoft develops and licenses software, services, devices, and solutions. Its three segments are Productivity & Business Processes (Office 365, LinkedIn), Intelligent Cloud (Azure, Server), and More Personal Computing (Windows, Xbox, Surface). Azure cloud growth is the primary earnings driver.",
 risks: [
 "Azure growth deceleration risk — competition from AWS and Google Cloud intensifying",
 "AI investment outpacing monetization timeline could pressure margins near-term",
 "Activision integration costs and gaming market softness weigh on PC segment",
 ],
 catalysts: [
 "Azure AI services (OpenAI partnership) driving enterprise AI adoption",
 "Copilot monetization across Office 365 — adding $30/user/month revenue layer",
 "Enterprise digital transformation secular tailwind — multi-year cloud migration cycle",
 ],
 },

 GOOG: {
 sector: "Technology",
 industry: "Digital Advertising & Cloud",
 marketCap: "$2.2T",
 marketCapNum: 2200,
 peRatio: 24.5,
 forwardPE: 21.8,
 pbRatio: 7.2,
 psRatio: 6.1,
 evEbitda: 17.2,
 sectorAvgPE: 28.1,

 enterpriseValue: 2090,
 evToRevenue: 6.1,
 evToFCF: 30.3,
 priceToFCF: 31.9,
 pegRatio: 0.9,

 revenue: "$340B",
 revenueGrowthYoY: 13.8,
 eps: 7.54,
 epsGrowthYoY: 26.5,

 revenueGrowth3Y: 14.2,
 epsGrowth3Y: 24.8,
 fcfGrowth: 18.4,
 bookValueGrowth: 19.2,

 grossMargin: 57.8,
 operatingMargin: 27.4,
 netMargin: 24.0,
 roe: 32.4,
 debtToEquity: 0.11,
 currentRatio: 1.95,
 freeCashFlow: "$69B",

 ebitdaMargin: 35.1,
 fcfMargin: 20.3,
 returnOnAssets: 16.8,
 returnOnCapital: 24.5,

 totalDebt: 29,
 netCash: 81, // fortress balance sheet
 interestCoverage: 112.5,
 quickRatio: 1.88,

 assetTurnover: 0.70,
 inventoryTurnover: 0,
 daysSalesOutstanding: 56,

 sharesOutstanding: 12.34,
 buybackYield: 1.5,
 totalYield: 1.95,

 institutionalOwnership: 65.4,
 insiderTransactions: "Net Selling",

 fiftyDayMA: 176.8,
 twoHundredDayMA: 162.4,
 avgVolume30d: 22.1,
 relativeVolume: 0.88,

 dividendYield: 0.45,
 dividendPayoutRatio: 9.1,

 beta: 1.06,
 week52High: 201.42,
 week52Low: 150.22,
 avgVolume: "22.1M",
 shortFloat: 1.2,

 analystRating: "Buy",
 priceTarget: 210,
 priceTargetHigh: 240,
 priceTargetLow: 175,
 analystCount: 55,

 nextEarningsDate: "2024-07-23",
 lastEarningsResult: "beat",
 earningsSurprisePct: 8.1,

 earningsCallTime: "AMC",
 revenueEstimate: 86.3,
 epsEstimate: 1.85,

 sectorPE: 28.1,
 sectorGrowth: 11.5,

 description:
 "Alphabet is the parent company of Google. Search advertising (~57% of revenue) remains dominant but faces AI-driven disruption risk. YouTube and Google Cloud are the fastest-growing segments. The company holds $110B+ in cash with minimal debt — one of the strongest balance sheets in the market.",
 risks: [
 "AI search disruption — ChatGPT and Perplexity threaten Google's search monopoly",
 "DOJ antitrust ruling could force structural changes or restrict advertising practices",
 "Regulatory pressure across EU on data privacy, search, and ad tech dominance",
 ],
 catalysts: [
 "Gemini AI integration into Search creating new monetization opportunities",
 "Google Cloud accelerating to $40B+ annual run rate, approaching profitability inflection",
 "YouTube Shorts and Connected TV growing as streaming advertising shifts from linear TV",
 ],
 },

 AMZN: {
 sector: "Consumer Cyclical",
 industry: "E-Commerce & Cloud Computing",
 marketCap: "$2.1T",
 marketCapNum: 2100,
 peRatio: 42.6,
 forwardPE: 34.2,
 pbRatio: 8.9,
 psRatio: 3.9,
 evEbitda: 19.8,
 sectorAvgPE: 22.4,

 enterpriseValue: 2080,
 evToRevenue: 3.3,
 evToFCF: 40.0,
 priceToFCF: 40.4,
 pegRatio: 1.5,

 revenue: "$638B",
 revenueGrowthYoY: 10.9,
 eps: 4.67,
 epsGrowthYoY: 87.0,

 revenueGrowth3Y: 12.1,
 epsGrowth3Y: 45.8,
 fcfGrowth: 320.0, // FCF rebounded massively from near-zero
 bookValueGrowth: 18.5,

 grossMargin: 49.0,
 operatingMargin: 10.8,
 netMargin: 8.0,
 roe: 21.7,
 debtToEquity: 0.82,
 currentRatio: 1.07,
 freeCashFlow: "$52B",

 ebitdaMargin: 15.2,
 fcfMargin: 8.1,
 returnOnAssets: 6.8,
 returnOnCapital: 12.4,

 totalDebt: 164,
 netCash: -91, // heavy capex and leases
 interestCoverage: 8.4,
 quickRatio: 0.86,

 assetTurnover: 1.06,
 inventoryTurnover: 9.8,
 daysSalesOutstanding: 24,

 sharesOutstanding: 10.38,
 buybackYield: 0.0,
 totalYield: 0.0,

 institutionalOwnership: 64.1,
 insiderTransactions: "Net Selling",

 fiftyDayMA: 196.4,
 twoHundredDayMA: 182.7,
 avgVolume30d: 41.3,
 relativeVolume: 1.12,

 dividendYield: 0,
 dividendPayoutRatio: 0,

 beta: 1.15,
 week52High: 232.57,
 week52Low: 151.61,
 avgVolume: "41.3M",
 shortFloat: 1.0,

 analystRating: "Strong Buy",
 priceTarget: 260,
 priceTargetHigh: 300,
 priceTargetLow: 200,
 analystCount: 52,

 nextEarningsDate: "2024-08-01",
 lastEarningsResult: "beat",
 earningsSurprisePct: 11.2,

 earningsCallTime: "AMC",
 revenueEstimate: 158.9,
 epsEstimate: 1.03,

 sectorPE: 22.4,
 sectorGrowth: 6.8,

 description:
 "Amazon operates the world's largest e-commerce platform and cloud computing service (AWS). AWS generates only ~17% of revenue but ~70% of operating income — it's the engine. Advertising (~$60B/yr) is the fastest-growing, highest-margin segment. Retail margins are thin but improving as fulfillment costs decline.",
 risks: [
 "AWS faces intensifying competition from Microsoft Azure and Google Cloud",
 "Retail segment thin margins mean any macro slowdown hits revenue hard",
 "Regulatory risk around third-party seller fees, antitrust, and labor practices",
 ],
 catalysts: [
 "AWS AI infrastructure buildout — Trainium and Inferentia chips create proprietary AI moat",
 "Advertising revenue scaling to $100B+ with Prime Video ad tier integration",
 "Robotics and automation driving 2%+ improvement in fulfillment cost structure annually",
 ],
 },

 NVDA: {
 sector: "Technology",
 industry: "Semiconductors & AI Hardware",
 marketCap: "$3.3T",
 marketCapNum: 3300,
 peRatio: 55.4,
 forwardPE: 35.8,
 pbRatio: 40.5,
 psRatio: 20.1,
 evEbitda: 45.2,
 sectorAvgPE: 28.1,

 enterpriseValue: 3260,
 evToRevenue: 25.1,
 evToFCF: 54.3,
 priceToFCF: 55.0,
 pegRatio: 0.7, // low PEG due to extreme growth

 revenue: "$130B",
 revenueGrowthYoY: 122.4,
 eps: 2.53,
 epsGrowthYoY: 288.0,

 revenueGrowth3Y: 78.4,
 epsGrowth3Y: 110.5,
 fcfGrowth: 450.0, // explosive FCF growth
 bookValueGrowth: 82.6,

 grossMargin: 76.0,
 operatingMargin: 62.0,
 netMargin: 53.4,
 roe: 123.5,
 debtToEquity: 0.42,
 currentRatio: 4.17,
 freeCashFlow: "$60B",

 ebitdaMargin: 64.8,
 fcfMargin: 46.2,
 returnOnAssets: 55.2,
 returnOnCapital: 92.3,

 totalDebt: 11.7,
 netCash: 14.8, // net cash positive
 interestCoverage: 132.0,
 quickRatio: 3.92,

 assetTurnover: 1.03,
 inventoryTurnover: 3.62,
 daysSalesOutstanding: 52,

 sharesOutstanding: 24.49,
 buybackYield: 0.3,
 totalYield: 0.33,

 institutionalOwnership: 67.8,
 insiderTransactions: "Net Selling",

 fiftyDayMA: 128.6,
 twoHundredDayMA: 105.4,
 avgVolume30d: 248.5,
 relativeVolume: 1.35,

 dividendYield: 0.03,
 dividendPayoutRatio: 1.8,

 beta: 1.68,
 week52High: 153.13,
 week52Low: 75.61,
 avgVolume: "248.5M",
 shortFloat: 1.1,

 analystRating: "Strong Buy",
 priceTarget: 165,
 priceTargetHigh: 220,
 priceTargetLow: 120,
 analystCount: 60,

 nextEarningsDate: "2024-08-28",
 lastEarningsResult: "beat",
 earningsSurprisePct: 21.6,

 earningsCallTime: "AMC",
 revenueEstimate: 28.7,
 epsEstimate: 0.64,

 sectorPE: 28.1,
 sectorGrowth: 11.5,

 description:
 "NVIDIA designs GPUs and AI accelerators that power machine learning training and inference worldwide. The Hopper (H100) and Blackwell architectures dominate the data center AI market. CUDA software ecosystem creates a powerful lock-in moat. Data Center now represents ~87% of revenue, gaming ~10%.",
 risks: [
 "US export restrictions on advanced AI chips to China limiting a major growth market",
 "Customer concentration — Microsoft, Google, Meta, and Amazon each >10% of revenue",
 "Cyclical AI capex spending could slow if ROI from LLMs disappoints enterprises",
 ],
 catalysts: [
 "Blackwell GPU architecture ramp — next generation at higher margins and ASPs",
 "Inference compute demand scaling rapidly as AI models deploy to billions of users",
 "NVIDIA software (CUDA, NIM, Omniverse) creating recurring revenue beyond hardware",
 ],
 },

 TSLA: {
 sector: "Consumer Cyclical",
 industry: "Electric Vehicles & Energy",
 marketCap: "$1.1T",
 marketCapNum: 1100,
 peRatio: 96.2,
 forwardPE: 74.5,
 pbRatio: 14.2,
 psRatio: 8.4,
 evEbitda: 58.0,
 sectorAvgPE: 22.4,

 enterpriseValue: 1080,
 evToRevenue: 11.1,
 evToFCF: 360.0,
 priceToFCF: 366.7,
 pegRatio: 5.2, // very high — growth not keeping up with valuation

 revenue: "$97B",
 revenueGrowthYoY: -1.1,
 eps: 3.65,
 epsGrowthYoY: -52.5,

 revenueGrowth3Y: 28.4,
 epsGrowth3Y: -12.8,
 fcfGrowth: -55.0,
 bookValueGrowth: 12.2,

 grossMargin: 17.9,
 operatingMargin: 8.2,
 netMargin: 6.7,
 roe: 14.3,
 debtToEquity: 0.18,
 currentRatio: 1.84,
 freeCashFlow: "$3B",

 ebitdaMargin: 12.8,
 fcfMargin: 3.1,
 returnOnAssets: 5.8,
 returnOnCapital: 9.6,

 totalDebt: 7.5,
 netCash: 22.4, // strong cash position
 interestCoverage: 14.2,
 quickRatio: 1.52,

 assetTurnover: 0.72,
 inventoryTurnover: 5.9,
 daysSalesOutstanding: 18,

 sharesOutstanding: 3.19,
 buybackYield: 0.0,
 totalYield: 0.0,

 institutionalOwnership: 46.2,
 insiderTransactions: "Neutral",

 fiftyDayMA: 345.0,
 twoHundredDayMA: 285.4,
 avgVolume30d: 98.7,
 relativeVolume: 1.22,

 dividendYield: 0,
 dividendPayoutRatio: 0,

 beta: 2.05,
 week52High: 488.54,
 week52Low: 138.8,
 avgVolume: "98.7M",
 shortFloat: 3.2,

 analystRating: "Hold",
 priceTarget: 400,
 priceTargetHigh: 600,
 priceTargetLow: 200,
 analystCount: 38,

 nextEarningsDate: "2024-07-23",
 lastEarningsResult: "miss",
 earningsSurprisePct: -8.4,

 earningsCallTime: "AMC",
 revenueEstimate: 24.8,
 epsEstimate: 0.62,

 sectorPE: 22.4,
 sectorGrowth: 6.8,

 description:
 "Tesla designs, manufactures, and sells electric vehicles, energy storage systems, and solar products. Automotive revenue (90%+ of total) has faced margin pressure from aggressive price cuts. Gross margin compressed from 29% to 18% in 2 years. The bull case rests on Full Self-Driving (FSD) achieving autonomy and robotaxi economics.",
 risks: [
 "Gross margin compression — price cuts to defend volume crushed profitability",
 "EV competition intensifying — BYD, Hyundai, GM undercutting on price in key markets",
 "CEO distraction and brand damage risk from Musk's political activities affecting demand",
 ],
 catalysts: [
 "Cybercab/Robotaxi launch — FSD monetization at scale changes the business model entirely",
 "Optimus humanoid robot — $10T+ TAM if achieved; currently a speculative option",
 "Energy storage segment (Megapack) growing 70%+ YoY with high margins",
 ],
 },

 JPM: {
 sector: "Financial Services",
 industry: "Diversified Banking",
 marketCap: "$680B",
 marketCapNum: 680,
 peRatio: 12.8,
 forwardPE: 11.5,
 pbRatio: 2.1,
 psRatio: 4.1,
 evEbitda: 0, // not meaningful for banks
 sectorAvgPE: 12.5,

 enterpriseValue: 0, // EV not meaningful for banks
 evToRevenue: 0,
 evToFCF: 0,
 priceToFCF: 30.9,
 pegRatio: 1.5,

 revenue: "$158B",
 revenueGrowthYoY: 9.5,
 eps: 18.22,
 epsGrowthYoY: 8.5,

 revenueGrowth3Y: 12.8,
 epsGrowth3Y: 7.4,
 fcfGrowth: 15.2,
 bookValueGrowth: 8.8,

 grossMargin: 61.2,
 operatingMargin: 35.4,
 netMargin: 27.8,
 roe: 17.2,
 debtToEquity: 0, // D/E not standard for banks
 currentRatio: 0, // not meaningful for banks
 freeCashFlow: "$22B",

 ebitdaMargin: 0, // not meaningful for banks
 fcfMargin: 13.9,
 returnOnAssets: 1.28,
 returnOnCapital: 15.8,

 totalDebt: 0, // bank deposits not classified same way
 netCash: 0,
 interestCoverage: 0,
 quickRatio: 0,

 assetTurnover: 0.04, // banks have massive balance sheets
 inventoryTurnover: 0,
 daysSalesOutstanding: 0,

 sharesOutstanding: 2.86,
 buybackYield: 2.8,
 totalYield: 4.85,

 institutionalOwnership: 71.5,
 insiderTransactions: "Net Buying",

 fiftyDayMA: 252.4,
 twoHundredDayMA: 235.8,
 avgVolume30d: 8.9,
 relativeVolume: 0.95,

 dividendYield: 2.05,
 dividendPayoutRatio: 28.5,

 beta: 1.12,
 week52High: 280.25,
 week52Low: 194.5,
 avgVolume: "8.9M",
 shortFloat: 0.6,

 analystRating: "Buy",
 priceTarget: 265,
 priceTargetHigh: 300,
 priceTargetLow: 220,
 analystCount: 28,

 nextEarningsDate: "2024-07-12",
 lastEarningsResult: "beat",
 earningsSurprisePct: 5.5,

 earningsCallTime: "BMO",
 revenueEstimate: 42.2,
 epsEstimate: 4.19,

 sectorPE: 12.5,
 sectorGrowth: 5.2,

 description:
 "JPMorgan Chase is the largest US bank by assets ($3.9T). It operates in investment banking, consumer & commercial banking, asset & wealth management. Net interest income (the spread between lending rates and deposit costs) drives earnings. Higher rates = more NII; rate cuts = NII headwind.",
 risks: [
 "Net Interest Income pressure — rate cuts compress the spread between loan yields and deposit costs",
 "Commercial real estate loan defaults rising as office vacancy rates remain elevated",
 "Increased capital requirements under Basel III endgame could constrain buybacks and dividends",
 ],
 catalysts: [
 "Investment banking fee recovery — M&A and IPO activity rebounding from 2022-2023 drought",
 "Deposit repricing tailwind as lower-cost CDs roll off, maintaining NIM",
 "Asset management AUM growth from market appreciation and net inflows",
 ],
 },

 SPY: {
 sector: "ETF",
 industry: "Broad Market Index",
 marketCap: "$570B",
 marketCapNum: 570,
 peRatio: 23.1,
 forwardPE: 21.4,
 pbRatio: 4.8,
 psRatio: 2.8,
 evEbitda: 15.0,
 sectorAvgPE: 23.1,

 enterpriseValue: 0,
 evToRevenue: 0,
 evToFCF: 0,
 priceToFCF: 0,
 pegRatio: 0,

 revenue: "N/A",
 revenueGrowthYoY: 0,
 eps: 24.52,
 epsGrowthYoY: 12.5,

 revenueGrowth3Y: 0,
 epsGrowth3Y: 0,
 fcfGrowth: 0,
 bookValueGrowth: 0,

 grossMargin: 0,
 operatingMargin: 0,
 netMargin: 0,
 roe: 0,
 debtToEquity: 0,
 currentRatio: 0,
 freeCashFlow: "N/A",

 ebitdaMargin: 0,
 fcfMargin: 0,
 returnOnAssets: 0,
 returnOnCapital: 0,

 totalDebt: 0,
 netCash: 0,
 interestCoverage: 0,
 quickRatio: 0,

 assetTurnover: 0,
 inventoryTurnover: 0,
 daysSalesOutstanding: 0,

 sharesOutstanding: 0,
 buybackYield: 0,
 totalYield: 1.22,

 institutionalOwnership: 0,
 insiderTransactions: "Neutral",

 fiftyDayMA: 548.2,
 twoHundredDayMA: 525.6,
 avgVolume30d: 72.5,
 relativeVolume: 1.0,

 dividendYield: 1.22,
 dividendPayoutRatio: 0,

 beta: 1.0,
 week52High: 609.07,
 week52Low: 493.86,
 avgVolume: "72.5M",
 shortFloat: 0,

 analystRating: "N/A",
 priceTarget: 550,
 priceTargetHigh: 620,
 priceTargetLow: 470,
 analystCount: 0,

 nextEarningsDate: "N/A",
 lastEarningsResult: "N/A",
 earningsSurprisePct: 0,

 earningsCallTime: "N/A",
 revenueEstimate: 0,
 epsEstimate: 0,

 sectorPE: 23.1,
 sectorGrowth: 0,

 description:
 "The SPDR S&P 500 ETF (SPY) tracks the S&P 500 index — 500 of the largest US companies weighted by market cap. Top 10 holdings (~35% of index): Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Berkshire, Eli Lilly, Broadcom, JPMorgan. Expense ratio: 0.0945%. The most liquid ETF in the world with $570B AUM.",
 risks: [
 "Concentration risk — top 10 holdings represent ~35% of the index",
 "Macro sensitivity — Fed rate policy, recession fears, and geopolitics drive broad moves",
 "Overvaluation risk — S&P 500 forward P/E near 21x above historical 16x average",
 ],
 catalysts: [
 "Fed rate cuts improving risk asset multiples and reducing discount rates",
 "AI productivity boom driving corporate earnings growth above historical averages",
 "Passive investment flows — $1T+ annually flows into index funds, creating structural demand",
 ],
 },

 QQQ: {
 sector: "ETF",
 industry: "Nasdaq-100 Index",
 marketCap: "$300B",
 marketCapNum: 300,
 peRatio: 31.5,
 forwardPE: 28.7,
 pbRatio: 7.2,
 psRatio: 5.1,
 evEbitda: 20.0,
 sectorAvgPE: 31.5,

 enterpriseValue: 0,
 evToRevenue: 0,
 evToFCF: 0,
 priceToFCF: 0,
 pegRatio: 0,

 revenue: "N/A",
 revenueGrowthYoY: 0,
 eps: 16.18,
 epsGrowthYoY: 14.5,

 revenueGrowth3Y: 0,
 epsGrowth3Y: 0,
 fcfGrowth: 0,
 bookValueGrowth: 0,

 grossMargin: 0,
 operatingMargin: 0,
 netMargin: 0,
 roe: 0,
 debtToEquity: 0,
 currentRatio: 0,
 freeCashFlow: "N/A",

 ebitdaMargin: 0,
 fcfMargin: 0,
 returnOnAssets: 0,
 returnOnCapital: 0,

 totalDebt: 0,
 netCash: 0,
 interestCoverage: 0,
 quickRatio: 0,

 assetTurnover: 0,
 inventoryTurnover: 0,
 daysSalesOutstanding: 0,

 sharesOutstanding: 0,
 buybackYield: 0,
 totalYield: 0.55,

 institutionalOwnership: 0,
 insiderTransactions: "Neutral",

 fiftyDayMA: 498.6,
 twoHundredDayMA: 472.3,
 avgVolume30d: 38.2,
 relativeVolume: 1.0,

 dividendYield: 0.55,
 dividendPayoutRatio: 0,

 beta: 1.18,
 week52High: 540.81,
 week52Low: 411.34,
 avgVolume: "38.2M",
 shortFloat: 0,

 analystRating: "N/A",
 priceTarget: 510,
 priceTargetHigh: 600,
 priceTargetLow: 420,
 analystCount: 0,

 nextEarningsDate: "N/A",
 lastEarningsResult: "N/A",
 earningsSurprisePct: 0,

 earningsCallTime: "N/A",
 revenueEstimate: 0,
 epsEstimate: 0,

 sectorPE: 31.5,
 sectorGrowth: 0,

 description:
 "The Invesco QQQ ETF tracks the Nasdaq-100 index — 100 of the largest non-financial Nasdaq companies. ~50% technology weighting. Top holdings: Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla, Broadcom. Expense ratio: 0.20%. Highly sensitive to interest rate changes due to long-duration tech growth stock weighting.",
 risks: [
 "Heavy tech concentration — rate hikes disproportionately hurt long-duration growth stocks",
 "Higher volatility than SPY — beta of 1.18 amplifies both up and down moves",
 "NVDA and mega-cap dominance creates significant single-stock risk within the index",
 ],
 catalysts: [
 "AI infrastructure buildout benefiting large Nasdaq tech names disproportionately",
 "Rate cut cycle improving growth stock multiples — QQQ outperforms in falling rate environments",
 "Innovation sector leadership — biotech, EV, and clean energy companies growing within Nasdaq-100",
 ],
 },

 META: {
 sector: "Technology",
 industry: "Social Media & Digital Advertising",
 marketCap: "$1.6T",
 marketCapNum: 1600,
 peRatio: 27.3,
 forwardPE: 23.8,
 pbRatio: 9.4,
 psRatio: 9.2,
 evEbitda: 19.4,
 sectorAvgPE: 28.1,

 enterpriseValue: 1560,
 evToRevenue: 9.5,
 evToFCF: 30.0,
 priceToFCF: 30.8,
 pegRatio: 0.7,

 revenue: "$164B",
 revenueGrowthYoY: 20.6,
 eps: 22.08,
 epsGrowthYoY: 72.5,

 revenueGrowth3Y: 14.8,
 epsGrowth3Y: 38.2,
 fcfGrowth: 68.4,
 bookValueGrowth: 22.5,

 grossMargin: 82.0,
 operatingMargin: 41.6,
 netMargin: 33.9,
 roe: 35.8,
 debtToEquity: 0.42,
 currentRatio: 2.65,
 freeCashFlow: "$52B",

 ebitdaMargin: 50.2,
 fcfMargin: 31.7,
 returnOnAssets: 18.4,
 returnOnCapital: 28.2,

 totalDebt: 37,
 netCash: 21, // healthy cash position
 interestCoverage: 64.5,
 quickRatio: 2.58,

 assetTurnover: 0.54,
 inventoryTurnover: 0,
 daysSalesOutstanding: 42,

 sharesOutstanding: 2.53,
 buybackYield: 3.2,
 totalYield: 3.52,

 institutionalOwnership: 78.4,
 insiderTransactions: "Net Selling",

 fiftyDayMA: 518.2,
 twoHundredDayMA: 475.6,
 avgVolume30d: 15.4,
 relativeVolume: 0.98,

 dividendYield: 0.32,
 dividendPayoutRatio: 6.1,

 beta: 1.23,
 week52High: 736.67,
 week52Low: 414.5,
 avgVolume: "15.4M",
 shortFloat: 0.8,

 analystRating: "Buy",
 priceTarget: 750,
 priceTargetHigh: 850,
 priceTargetLow: 580,
 analystCount: 44,

 nextEarningsDate: "2024-07-31",
 lastEarningsResult: "beat",
 earningsSurprisePct: 14.3,

 earningsCallTime: "AMC",
 revenueEstimate: 39.2,
 epsEstimate: 4.72,

 sectorPE: 28.1,
 sectorGrowth: 11.5,

 description:
 "Meta Platforms operates Facebook, Instagram, WhatsApp, and Messenger — reaching 3.2B daily active users. AI-powered Advantage+ advertising significantly improved ad targeting ROI, driving a major revenue re-acceleration. Reality Labs (VR/AR) loses ~$15B/year but positions Meta for long-term spatial computing leadership.",
 risks: [
 "Reality Labs metaverse investments burning $15B+/year with uncertain payback timeline",
 "Regulatory risk — EU DMA compliance forcing changes to ad targeting and data practices",
 "Youth engagement declining on Facebook/Instagram; TikTok competing aggressively for attention",
 ],
 catalysts: [
 "AI-driven Advantage+ advertising delivering 30%+ ROAS improvements for advertisers",
 "Llama open-source AI models driving developer ecosystem and enterprise adoption",
 "Threads growing to 300M+ users — potential second large social platform monetization",
 ],
 },
};
