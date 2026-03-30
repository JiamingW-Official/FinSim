export interface EarningsEvent {
 ticker: string;
 companyName: string;
 date: string; // "2024-07-25"
 time: string; // "AMC" | "BMO"
 quarter: string; // "Q2 2024"
 epsEstimate: number;
 revenueEstimate: number; // billions
 previousEPS: number;
 previousRevenue: number; // billions
 surpriseHistory: {
 quarter: string;
 epsSurprise: number; // % surprise vs estimate
 revenueSurprise: number; // % surprise vs estimate
 }[];
 educationalNote: string;
}

export const EARNINGS_CALENDAR: EarningsEvent[] = [
 // ─── JPMorgan Chase ─────────────────────────────────────────
 {
 ticker: "JPM",
 companyName: "JPMorgan Chase & Co.",
 date: "2024-07-12",
 time: "BMO",
 quarter: "Q2 2024",
 epsEstimate: 4.19,
 revenueEstimate: 42.2,
 previousEPS: 4.44,
 previousRevenue: 41.93,
 surpriseHistory: [
 { quarter: "Q1 2024", epsSurprise: 12.4, revenueSurprise: 2.8 },
 { quarter: "Q4 2023", epsSurprise: 8.2, revenueSurprise: 4.1 },
 { quarter: "Q3 2023", epsSurprise: 15.6, revenueSurprise: 3.5 },
 { quarter: "Q2 2023", epsSurprise: 18.3, revenueSurprise: 5.2 },
 ],
 educationalNote:
 "JPMorgan reports first among big banks, setting the tone for the entire financial sector. Key metrics: Net Interest Income (NII), provision for credit losses (rising = bearish), and investment banking fees. Jamie Dimon's commentary on the economy is closely followed by all investors.",
 },

 // ─── Microsoft ──────────────────────────────────────────────
 {
 ticker: "MSFT",
 companyName: "Microsoft Corporation",
 date: "2024-07-23",
 time: "AMC",
 quarter: "FQ4 2024",
 epsEstimate: 2.94,
 revenueEstimate: 64.4,
 previousEPS: 2.94,
 previousRevenue: 61.86,
 surpriseHistory: [
 { quarter: "FQ3 2024", epsSurprise: 4.1, revenueSurprise: 1.6 },
 { quarter: "FQ2 2024", epsSurprise: 6.8, revenueSurprise: 2.3 },
 { quarter: "FQ1 2024", epsSurprise: 5.5, revenueSurprise: 1.8 },
 { quarter: "FQ4 2023", epsSurprise: 9.2, revenueSurprise: 3.1 },
 ],
 educationalNote:
 "Microsoft uses a fiscal year ending June 30 (FQ4 = April-June). The key metric is Azure cloud growth rate — anything above 30% is seen as strong. Copilot revenue contribution and AI capital expenditure plans are the hottest topics on the earnings call.",
 },

 // ─── Alphabet (Google) ──────────────────────────────────────
 {
 ticker: "GOOG",
 companyName: "Alphabet Inc.",
 date: "2024-07-23",
 time: "AMC",
 quarter: "Q2 2024",
 epsEstimate: 1.85,
 revenueEstimate: 86.3,
 previousEPS: 1.89,
 previousRevenue: 80.54,
 surpriseHistory: [
 { quarter: "Q1 2024", epsSurprise: 27.2, revenueSurprise: 2.1 },
 { quarter: "Q4 2023", epsSurprise: 9.5, revenueSurprise: 0.5 },
 { quarter: "Q3 2023", epsSurprise: 11.4, revenueSurprise: 1.8 },
 { quarter: "Q2 2023", epsSurprise: 13.8, revenueSurprise: 2.4 },
 ],
 educationalNote:
 "Alphabet reports Search, YouTube, Cloud, and Other Bets as separate segments. Watch Google Cloud growth rate and profitability — the segment just turned profitable in Q3 2023. YouTube ad revenue indicates the health of the broader digital advertising market.",
 },

 // ─── Tesla ──────────────────────────────────────────────────
 {
 ticker: "TSLA",
 companyName: "Tesla, Inc.",
 date: "2024-07-23",
 time: "AMC",
 quarter: "Q2 2024",
 epsEstimate: 0.62,
 revenueEstimate: 24.8,
 previousEPS: 0.45,
 previousRevenue: 21.3,
 surpriseHistory: [
 { quarter: "Q1 2024", epsSurprise: -13.8, revenueSurprise: -3.6 },
 { quarter: "Q4 2023", epsSurprise: -8.4, revenueSurprise: -1.2 },
 { quarter: "Q3 2023", epsSurprise: -10.2, revenueSurprise: -1.8 },
 { quarter: "Q2 2023", epsSurprise: 5.4, revenueSurprise: 0.8 },
 ],
 educationalNote:
 "Tesla's earnings are among the most volatile in mega-cap tech. Gross margin (currently ~18%, down from ~29%) is the key metric as price cuts have pressured profitability. Delivery numbers (reported separately before earnings) often set the tone. Energy storage revenue is a growing bright spot.",
 },

 // ─── Meta Platforms ─────────────────────────────────────────
 {
 ticker: "META",
 companyName: "Meta Platforms, Inc.",
 date: "2024-07-31",
 time: "AMC",
 quarter: "Q2 2024",
 epsEstimate: 4.72,
 revenueEstimate: 39.2,
 previousEPS: 4.71,
 previousRevenue: 36.46,
 surpriseHistory: [
 { quarter: "Q1 2024", epsSurprise: 14.3, revenueSurprise: 2.2 },
 { quarter: "Q4 2023", epsSurprise: 18.5, revenueSurprise: 0.8 },
 { quarter: "Q3 2023", epsSurprise: 19.2, revenueSurprise: 1.5 },
 { quarter: "Q2 2023", epsSurprise: 21.6, revenueSurprise: 3.4 },
 ],
 educationalNote:
 "Meta has been on a massive earnings beat streak since the 'Year of Efficiency' in 2023. Watch: ad revenue growth rate (20%+ is strong), Reality Labs losses (improving or worsening?), and daily active people (DAP) across the Family of Apps. Capital expenditure guidance signals AI investment scale.",
 },

 // ─── Apple ──────────────────────────────────────────────────
 {
 ticker: "AAPL",
 companyName: "Apple Inc.",
 date: "2024-08-01",
 time: "AMC",
 quarter: "FQ3 2024",
 epsEstimate: 1.35,
 revenueEstimate: 84.4,
 previousEPS: 1.53,
 previousRevenue: 90.75,
 surpriseHistory: [
 { quarter: "FQ2 2024", epsSurprise: 4.2, revenueSurprise: 0.5 },
 { quarter: "FQ1 2024", epsSurprise: 3.8, revenueSurprise: 1.2 },
 { quarter: "FQ4 2023", epsSurprise: 2.1, revenueSurprise: 0.3 },
 { quarter: "FQ3 2023", epsSurprise: 5.5, revenueSurprise: 1.8 },
 ],
 educationalNote:
 "Apple uses a fiscal year ending September (FQ3 = April-June). iPhone revenue is the top line driver (~52% of total), but Services margin (~70% gross margin) is the quality driver. China revenue and the iPhone upgrade cycle are the two most debated topics. Apple Intelligence (AI features) is a key catalyst for iPhone 16 demand.",
 },

 // ─── Amazon ─────────────────────────────────────────────────
 {
 ticker: "AMZN",
 companyName: "Amazon.com, Inc.",
 date: "2024-08-01",
 time: "AMC",
 quarter: "Q2 2024",
 epsEstimate: 1.03,
 revenueEstimate: 158.9,
 previousEPS: 0.98,
 previousRevenue: 143.31,
 surpriseHistory: [
 { quarter: "Q1 2024", epsSurprise: 11.2, revenueSurprise: 1.4 },
 { quarter: "Q4 2023", epsSurprise: 22.5, revenueSurprise: 1.8 },
 { quarter: "Q3 2023", epsSurprise: 36.4, revenueSurprise: 2.1 },
 { quarter: "Q2 2023", epsSurprise: 52.8, revenueSurprise: 2.6 },
 ],
 educationalNote:
 "Amazon's earnings surprises have been enormous because profitability improved far faster than analysts expected after the post-COVID cost rationalization. Watch AWS growth rate (leading cloud indicator), operating margin trend (expanding or contracting?), and advertising revenue (the hidden gem growing at 20%+).",
 },

 // ─── NVIDIA ─────────────────────────────────────────────────
 {
 ticker: "NVDA",
 companyName: "NVIDIA Corporation",
 date: "2024-08-28",
 time: "AMC",
 quarter: "FQ2 2025",
 epsEstimate: 0.64,
 revenueEstimate: 28.7,
 previousEPS: 0.61,
 previousRevenue: 26.04,
 surpriseHistory: [
 { quarter: "FQ1 2025", epsSurprise: 21.6, revenueSurprise: 9.1 },
 { quarter: "FQ4 2024", epsSurprise: 15.8, revenueSurprise: 8.5 },
 { quarter: "FQ3 2024", epsSurprise: 18.2, revenueSurprise: 11.4 },
 { quarter: "FQ2 2024", epsSurprise: 29.4, revenueSurprise: 22.1 },
 ],
 educationalNote:
 "NVIDIA uses a fiscal year ending January (FQ2 2025 = May-July 2024). This is the most anticipated earnings report in the market. Watch: Data Center revenue (87% of total), gross margin (above or below 75%?), and Blackwell GPU production timeline. NVDA has beaten estimates by double digits for four consecutive quarters.",
 },
];

export const EARNINGS_CALENDAR_BY_TICKER: Record<string, EarningsEvent> =
 Object.fromEntries(EARNINGS_CALENDAR.map((e) => [e.ticker, e]));
