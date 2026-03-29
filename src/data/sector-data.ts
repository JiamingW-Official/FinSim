// ---------------------------------------------------------------------------
// GICS Sector Data — 11 sectors with representative tickers and performance
// ---------------------------------------------------------------------------

export interface SectorInfo {
  name: string;
  shortName: string;
  tickers: string[]; // Representative tickers (may include ones not in our watchlist)
  watchlistTickers: string[]; // Tickers from our watchlist in this sector
  weight: number; // S&P 500 weight percentage (approx mid-2024)
}

export interface SectorPerformance {
  sector: string;
  "1D": number;
  "1W": number;
  "1M": number;
  "3M": number;
  YTD: number;
}

export type SectorPeriod = "1D" | "1W" | "1M" | "3M" | "YTD";

export const SECTORS: SectorInfo[] = [
  {
    name: "Information Technology",
    shortName: "Tech",
    tickers: ["AAPL", "MSFT", "NVDA", "AVGO", "CRM"],
    watchlistTickers: ["AAPL", "MSFT", "NVDA"],
    weight: 31.5,
  },
  {
    name: "Communication Services",
    shortName: "Comm",
    tickers: ["GOOG", "META", "NFLX", "DIS", "TMUS"],
    watchlistTickers: ["GOOG", "META"],
    weight: 9.2,
  },
  {
    name: "Consumer Discretionary",
    shortName: "Cons Disc",
    tickers: ["AMZN", "TSLA", "HD", "MCD", "NKE"],
    watchlistTickers: ["AMZN", "TSLA"],
    weight: 10.8,
  },
  {
    name: "Financials",
    shortName: "Financials",
    tickers: ["JPM", "BAC", "GS", "V", "MA"],
    watchlistTickers: ["JPM"],
    weight: 13.1,
  },
  {
    name: "Health Care",
    shortName: "Health",
    tickers: ["UNH", "JNJ", "LLY", "PFE", "MRK"],
    watchlistTickers: [],
    weight: 12.0,
  },
  {
    name: "Industrials",
    shortName: "Industrials",
    tickers: ["CAT", "GE", "UPS", "HON", "BA"],
    watchlistTickers: [],
    weight: 8.5,
  },
  {
    name: "Consumer Staples",
    shortName: "Staples",
    tickers: ["PG", "KO", "PEP", "COST", "WMT"],
    watchlistTickers: [],
    weight: 5.8,
  },
  {
    name: "Energy",
    shortName: "Energy",
    tickers: ["XOM", "CVX", "COP", "SLB", "EOG"],
    watchlistTickers: [],
    weight: 3.6,
  },
  {
    name: "Utilities",
    shortName: "Utilities",
    tickers: ["NEE", "SO", "DUK", "D", "AEP"],
    watchlistTickers: [],
    weight: 2.4,
  },
  {
    name: "Real Estate",
    shortName: "Real Est",
    tickers: ["PLD", "AMT", "EQIX", "PSA", "SPG"],
    watchlistTickers: [],
    weight: 2.3,
  },
  {
    name: "Materials",
    shortName: "Materials",
    tickers: ["LIN", "APD", "SHW", "FCX", "NEM"],
    watchlistTickers: [],
    weight: 2.2,
  },
];

// ---------------------------------------------------------------------------
// Static fallback sector performance (realistic mid-2024 values)
// Used when not enough simulation data is available
// ---------------------------------------------------------------------------
export const DEFAULT_SECTOR_PERFORMANCE: SectorPerformance[] = [
  { sector: "Information Technology", "1D": 0.82, "1W": 2.45, "1M": 5.12, "3M": 12.30, YTD: 18.50 },
  { sector: "Communication Services", "1D": 0.45, "1W": 1.80, "1M": 3.90, "3M": 10.20, YTD: 15.80 },
  { sector: "Consumer Discretionary", "1D": -0.32, "1W": 0.95, "1M": 2.10, "3M": 6.50, YTD: 8.90 },
  { sector: "Financials", "1D": 0.55, "1W": 1.20, "1M": 3.45, "3M": 8.80, YTD: 12.40 },
  { sector: "Health Care", "1D": -0.18, "1W": -0.45, "1M": 1.20, "3M": 3.50, YTD: 5.20 },
  { sector: "Industrials", "1D": 0.28, "1W": 0.85, "1M": 2.80, "3M": 7.20, YTD: 10.50 },
  { sector: "Consumer Staples", "1D": -0.12, "1W": -0.30, "1M": 0.65, "3M": 2.10, YTD: 3.80 },
  { sector: "Energy", "1D": -0.75, "1W": -1.50, "1M": -2.80, "3M": -4.20, YTD: -1.50 },
  { sector: "Utilities", "1D": 0.15, "1W": 0.42, "1M": 1.30, "3M": 4.80, YTD: 8.20 },
  { sector: "Real Estate", "1D": -0.28, "1W": -0.65, "1M": -0.90, "3M": 1.20, YTD: 2.50 },
  { sector: "Materials", "1D": 0.35, "1W": 0.70, "1M": 1.80, "3M": 5.40, YTD: 7.60 },
];

// ---------------------------------------------------------------------------
// Extended Sector Data — detailed sector-level fundamentals for education
// ---------------------------------------------------------------------------

export interface SectorData {
  name: string;
  tickers: string[]; // tickers in our universe that belong
  performance1d: number; // %
  performance1w: number;
  performance1m: number;
  performance3m: number;
  performanceYTD: number;
  avgPE: number;
  avgGrowth: number; // revenue growth %
  description: string;
}

/**
 * 11 GICS sectors with realistic mid-2024 performance data.
 * Tickers array only includes stocks from Alpha Deck's 10-ticker universe.
 * Performance figures approximate actual S&P 500 sector returns through mid-July 2024.
 */
export const SECTOR_DATA: SectorData[] = [
  {
    name: "Information Technology",
    tickers: ["AAPL", "MSFT", "NVDA"],
    performance1d: 0.42,
    performance1w: 2.18,
    performance1m: 6.84,
    performance3m: 12.35,
    performanceYTD: 28.2,
    avgPE: 32.5,
    avgGrowth: 11.5,
    description:
      "The largest S&P 500 sector (~32% weight). Includes hardware, software, semiconductors, and IT services. Dominated by mega-cap AI beneficiaries (NVDA, MSFT, AAPL). Highly sensitive to interest rate changes due to long-duration growth valuations. The AI infrastructure buildout is the primary growth driver in 2024.",
  },
  {
    name: "Communication Services",
    tickers: ["GOOG", "META"],
    performance1d: -0.31,
    performance1w: 1.45,
    performance1m: 5.22,
    performance3m: 9.18,
    performanceYTD: 26.8,
    avgPE: 22.4,
    avgGrowth: 12.8,
    description:
      "Includes media, entertainment, telecom, and interactive services. Dominated by Alphabet and Meta (~60% of sector weight). Digital advertising recovery and AI-driven ad targeting improvements have driven sector outperformance. Legacy telecom names (AT&T, Verizon) are a drag on sector averages.",
  },
  {
    name: "Consumer Discretionary",
    tickers: ["AMZN", "TSLA"],
    performance1d: 0.15,
    performance1w: -0.82,
    performance1m: 3.41,
    performance3m: 5.62,
    performanceYTD: 11.4,
    avgPE: 26.8,
    avgGrowth: 6.8,
    description:
      "Non-essential goods and services: retail, auto, housing, leisure. Amazon (~25% of sector weight) skews metrics significantly. Consumer spending has been resilient despite high rates but is showing signs of fatigue in lower-income segments. Rate cuts would be a strong catalyst for housing and auto stocks.",
  },
  {
    name: "Health Care",
    tickers: [],
    performance1d: 0.28,
    performance1w: 0.95,
    performance1m: 1.82,
    performance3m: 3.14,
    performanceYTD: 8.6,
    avgPE: 18.2,
    avgGrowth: 5.4,
    description:
      "Pharma, biotech, medical devices, health insurance, and services. Traditionally defensive with steady earnings growth. GLP-1 drugs (Eli Lilly, Novo Nordisk) are reshaping the sector. Biotech M&A activity is picking up as big pharma faces patent cliffs and needs to replenish pipelines.",
  },
  {
    name: "Financials",
    tickers: ["JPM"],
    performance1d: 0.52,
    performance1w: 1.28,
    performance1m: 4.15,
    performance3m: 7.82,
    performanceYTD: 14.2,
    avgPE: 14.8,
    avgGrowth: 5.2,
    description:
      "Banks, insurance, asset management, and fintech. Banks benefit from higher net interest margins when rates are elevated. Investment banking recovery (M&A, IPOs) is a 2024 catalyst. Regional bank stress from CRE exposure remains a risk. JPMorgan, as the largest US bank, is the sector bellwether.",
  },
  {
    name: "Industrials",
    tickers: [],
    performance1d: 0.38,
    performance1w: 0.72,
    performance1m: 2.55,
    performance3m: 4.91,
    performanceYTD: 10.8,
    avgPE: 22.1,
    avgGrowth: 4.2,
    description:
      "Aerospace & defense, machinery, construction, transportation, and professional services. Benefits from infrastructure spending (CHIPS Act, IRA) and reshoring trends. Airlines and railroads are economically sensitive. Defense spending remains elevated due to geopolitical conflicts in Europe and Middle East.",
  },
  {
    name: "Consumer Staples",
    tickers: [],
    performance1d: 0.12,
    performance1w: 0.35,
    performance1m: 0.88,
    performance3m: 1.45,
    performanceYTD: 5.2,
    avgPE: 20.5,
    avgGrowth: 2.8,
    description:
      "Essential goods: food, beverages, tobacco, household products. Classic defensive sector with stable dividends. Underperforming in 2024 as investors favor growth over safety. Pricing power exhausted after two years of inflation-driven price increases — volume growth is now the challenge.",
  },
  {
    name: "Energy",
    tickers: [],
    performance1d: -0.45,
    performance1w: -1.12,
    performance1m: 0.62,
    performance3m: -2.18,
    performanceYTD: 8.4,
    avgPE: 12.2,
    avgGrowth: -3.5,
    description:
      "Oil & gas exploration, production, refining, and energy equipment. Performance closely tracks crude oil prices ($78-85 WTI range in mid-2024). OPEC+ production cuts support prices but weak China demand is a headwind. Sector has shifted to capital discipline and shareholder returns over growth spending.",
  },
  {
    name: "Utilities",
    tickers: [],
    performance1d: 0.68,
    performance1w: 1.85,
    performance1m: 5.42,
    performance3m: 8.95,
    performanceYTD: 12.5,
    avgPE: 17.8,
    avgGrowth: 3.8,
    description:
      "Electric, gas, water utilities and independent power producers. Traditionally a boring bond proxy, but AI data center power demand has made utilities an unexpected AI play in 2024. Data centers require massive electricity — utilities near AI hubs are seeing demand growth not seen in decades.",
  },
  {
    name: "Real Estate",
    tickers: [],
    performance1d: 0.22,
    performance1w: 0.48,
    performance1m: 1.24,
    performance3m: -0.85,
    performanceYTD: -2.1,
    avgPE: 35.2,
    avgGrowth: 2.1,
    description:
      "REITs (Real Estate Investment Trusts) and real estate services. The worst-performing sector in 2024 due to high interest rates increasing borrowing costs. Office REITs face structural challenges from remote work. Data center REITs (Equinix, Digital Realty) are the bright spot, benefiting from AI infrastructure demand.",
  },
  {
    name: "Materials",
    tickers: [],
    performance1d: -0.18,
    performance1w: -0.55,
    performance1m: 0.42,
    performance3m: 1.28,
    performanceYTD: 4.8,
    avgPE: 16.5,
    avgGrowth: 1.5,
    description:
      "Chemicals, metals & mining, construction materials, packaging. Performance tied to global manufacturing activity and commodity prices. China's property downturn weighs on metals demand. Copper is a bright spot due to electrification and EV demand. Gold miners benefit from record gold prices driven by central bank buying.",
  },
];

export const SECTOR_DATA_BY_NAME: Record<string, SectorData> =
  Object.fromEntries(SECTOR_DATA.map((s) => [s.name, s]));
