export interface SectorBenchmark {
  sector: string;
  pe: number;
  forwardPE: number;
  pb: number;
  ps: number;
  evEbitda: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roe: number;
  roa: number;
  debtToEquity: number;
  currentRatio: number;
  dividendYield: number;
  revenueGrowth: number;
  epsGrowth: number;
  fcfYield: number;
}

// Realistic 2024 median values by GICS sector
export const SECTOR_BENCHMARKS: Record<string, SectorBenchmark> = {
  "Information Technology": {
    sector: "Information Technology", pe: 32.5, forwardPE: 28.1, pb: 9.8, ps: 7.2, evEbitda: 22.4,
    grossMargin: 0.58, operatingMargin: 0.25, netMargin: 0.21, roe: 0.32, roa: 0.12,
    debtToEquity: 0.62, currentRatio: 2.1, dividendYield: 0.008, revenueGrowth: 0.12, epsGrowth: 0.18, fcfYield: 0.032,
  },
  "Healthcare": {
    sector: "Healthcare", pe: 22.8, forwardPE: 18.5, pb: 4.2, ps: 3.1, evEbitda: 15.6,
    grossMargin: 0.55, operatingMargin: 0.15, netMargin: 0.10, roe: 0.18, roa: 0.07,
    debtToEquity: 0.85, currentRatio: 1.6, dividendYield: 0.016, revenueGrowth: 0.08, epsGrowth: 0.10, fcfYield: 0.042,
  },
  "Financials": {
    sector: "Financials", pe: 13.2, forwardPE: 11.8, pb: 1.4, ps: 2.8, evEbitda: 0,
    grossMargin: 0, operatingMargin: 0.30, netMargin: 0.22, roe: 0.12, roa: 0.01,
    debtToEquity: 2.5, currentRatio: 0, dividendYield: 0.025, revenueGrowth: 0.06, epsGrowth: 0.08, fcfYield: 0.065,
  },
  "Consumer Discretionary": {
    sector: "Consumer Discretionary", pe: 25.4, forwardPE: 21.2, pb: 6.5, ps: 2.3, evEbitda: 16.8,
    grossMargin: 0.38, operatingMargin: 0.12, netMargin: 0.08, roe: 0.25, roa: 0.08,
    debtToEquity: 1.2, currentRatio: 1.3, dividendYield: 0.012, revenueGrowth: 0.09, epsGrowth: 0.14, fcfYield: 0.038,
  },
  "Communication Services": {
    sector: "Communication Services", pe: 19.6, forwardPE: 17.1, pb: 3.8, ps: 3.5, evEbitda: 12.4,
    grossMargin: 0.52, operatingMargin: 0.22, netMargin: 0.18, roe: 0.20, roa: 0.09,
    debtToEquity: 0.95, currentRatio: 1.5, dividendYield: 0.010, revenueGrowth: 0.07, epsGrowth: 0.15, fcfYield: 0.048,
  },
  "Industrials": {
    sector: "Industrials", pe: 21.3, forwardPE: 18.7, pb: 4.5, ps: 2.1, evEbitda: 14.2,
    grossMargin: 0.33, operatingMargin: 0.13, netMargin: 0.09, roe: 0.22, roa: 0.06,
    debtToEquity: 1.1, currentRatio: 1.4, dividendYield: 0.018, revenueGrowth: 0.05, epsGrowth: 0.09, fcfYield: 0.040,
  },
  "Consumer Staples": {
    sector: "Consumer Staples", pe: 22.1, forwardPE: 19.8, pb: 5.8, ps: 2.0, evEbitda: 15.1,
    grossMargin: 0.35, operatingMargin: 0.14, netMargin: 0.08, roe: 0.28, roa: 0.07,
    debtToEquity: 1.4, currentRatio: 0.9, dividendYield: 0.028, revenueGrowth: 0.03, epsGrowth: 0.06, fcfYield: 0.042,
  },
  "Energy": {
    sector: "Energy", pe: 11.8, forwardPE: 10.5, pb: 1.9, ps: 1.2, evEbitda: 5.8,
    grossMargin: 0.42, operatingMargin: 0.18, netMargin: 0.12, roe: 0.16, roa: 0.08,
    debtToEquity: 0.45, currentRatio: 1.2, dividendYield: 0.035, revenueGrowth: -0.02, epsGrowth: -0.08, fcfYield: 0.075,
  },
  "Utilities": {
    sector: "Utilities", pe: 17.5, forwardPE: 16.2, pb: 1.8, ps: 2.5, evEbitda: 12.8,
    grossMargin: 0.40, operatingMargin: 0.22, netMargin: 0.12, roe: 0.10, roa: 0.03,
    debtToEquity: 1.6, currentRatio: 0.7, dividendYield: 0.038, revenueGrowth: 0.04, epsGrowth: 0.05, fcfYield: 0.045,
  },
  "Real Estate": {
    sector: "Real Estate", pe: 35.2, forwardPE: 30.5, pb: 2.2, ps: 6.5, evEbitda: 22.1,
    grossMargin: 0.55, operatingMargin: 0.28, netMargin: 0.15, roe: 0.06, roa: 0.03,
    debtToEquity: 1.3, currentRatio: 0, dividendYield: 0.042, revenueGrowth: 0.05, epsGrowth: 0.03, fcfYield: 0.052,
  },
  "Materials": {
    sector: "Materials", pe: 16.8, forwardPE: 14.5, pb: 2.5, ps: 1.8, evEbitda: 10.2,
    grossMargin: 0.30, operatingMargin: 0.14, netMargin: 0.09, roe: 0.15, roa: 0.06,
    debtToEquity: 0.65, currentRatio: 1.8, dividendYield: 0.022, revenueGrowth: 0.02, epsGrowth: 0.04, fcfYield: 0.050,
  },
};

export const SECTOR_LIST = Object.keys(SECTOR_BENCHMARKS);

export function getSectorBenchmark(sector: string): SectorBenchmark | undefined {
  return SECTOR_BENCHMARKS[sector];
}

export function compareToSector(metric: keyof SectorBenchmark, value: number, sector: string): "above" | "below" | "inline" {
  const benchmark = SECTOR_BENCHMARKS[sector];
  if (!benchmark) return "inline";
  const benchValue = benchmark[metric] as number;
  if (typeof benchValue !== "number" || benchValue === 0) return "inline";
  const diff = (value - benchValue) / benchValue;
  if (diff > 0.15) return "above";
  if (diff < -0.15) return "below";
  return "inline";
}
