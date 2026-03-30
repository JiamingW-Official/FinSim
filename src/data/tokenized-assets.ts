export type AssetCategory =
  | "Real Estate"
  | "Treasuries"
  | "Commodities"
  | "Alternative";

export type LiquidityLevel = "Instant" | "T+1" | "Weekly";
export type RiskLevel = "Low" | "Medium" | "Medium-High" | "High";

export interface TokenizedAsset {
  id: string;
  name: string;
  category: AssetCategory;
  currentPrice: number;
  minimumInvestment: number;
  /** Annual yield expressed as percentage, e.g. 4.2 means 4.2% */
  yield: number;
  liquidity: LiquidityLevel;
  /** Blockchain / smart-contract settlement time label */
  settlementTime: string;
  description: string;
  riskLevel: RiskLevel;
  /** Pearson correlation with S&P 500, range -1 to +1 */
  correlationWithSP500: number;
  educationalNote: string;
}

export const TOKENIZED_ASSETS: TokenizedAsset[] = [
  // ─── Real Estate ───────────────────────────────────────────────────────────
  {
    id: "re-nyc-commercial",
    name: "Manhattan Commercial",
    category: "Real Estate",
    currentPrice: 1000.00,
    minimumInvestment: 10,
    yield: 4.2,
    liquidity: "Weekly",
    settlementTime: "7 days",
    description:
      "Fractional ownership in a Class-A office and retail portfolio located in Midtown Manhattan. Income distributed quarterly from net operating income.",
    riskLevel: "Medium-High",
    correlationWithSP500: 0.42,
    educationalNote:
      "Tokenized real estate converts illiquid property into on-chain tokens. Each token represents a proportional claim on rental income and asset appreciation, removing the traditional $500K+ entry barrier.",
  },
  {
    id: "re-bklyn-residential",
    name: "Brooklyn Residential",
    category: "Real Estate",
    currentPrice: 250.00,
    minimumInvestment: 10,
    yield: 5.1,
    liquidity: "Weekly",
    settlementTime: "7 days",
    description:
      "Multi-family residential portfolio across Brooklyn brownstones and new-construction units. Higher yield driven by strong rental demand and low vacancy.",
    riskLevel: "Medium",
    correlationWithSP500: 0.31,
    educationalNote:
      "Residential real estate historically shows lower volatility than commercial. The tokenized structure enables daily NAV tracking and fractional secondary-market trades.",
  },
  {
    id: "re-miami-mixed",
    name: "Miami Mixed-Use",
    category: "Real Estate",
    currentPrice: 180.00,
    minimumInvestment: 10,
    yield: 5.8,
    liquidity: "Weekly",
    settlementTime: "7 days",
    description:
      "Sun Belt mixed-use development combining retail ground floor and luxury condominiums. Benefits from Florida's population growth and zero state income tax.",
    riskLevel: "Medium-High",
    correlationWithSP500: 0.38,
    educationalNote:
      "Mixed-use properties diversify income streams. Sun Belt exposure offers growth potential but also higher climate and regulatory risk compared to established gateway markets.",
  },

  // ─── Treasuries ────────────────────────────────────────────────────────────
  {
    id: "tbill-3m",
    name: "3-Month T-Bill",
    category: "Treasuries",
    currentPrice: 100.00,
    minimumInvestment: 10,
    yield: 4.85,
    liquidity: "Instant",
    settlementTime: "3 seconds",
    description:
      "On-chain representation of the 3-month US Treasury bill. Yield reflects the current Fed Funds corridor. Near-zero credit risk backed by the full faith and credit of the US government.",
    riskLevel: "Low",
    correlationWithSP500: -0.18,
    educationalNote:
      "The T-bill rate is the bedrock 'risk-free rate' used in Black-Scholes pricing and the Sharpe ratio. Tokenized T-bills let retail investors earn money-market yields with T+0 settlement instead of the traditional T+2.",
  },
  {
    id: "tbond-10y",
    name: "10-Year Treasury",
    category: "Treasuries",
    currentPrice: 95.40,
    minimumInvestment: 10,
    yield: 4.32,
    liquidity: "T+1",
    settlementTime: "24 hours",
    description:
      "Tokenized 10-year US Treasury note. Price sensitive to interest rate changes (duration ~8.5 years). Benchmark for mortgage rates and corporate credit spreads.",
    riskLevel: "Low",
    correlationWithSP500: -0.25,
    educationalNote:
      "Duration measures price sensitivity to rate changes. A 1% rate rise drops a 10-year bond ~8.5%. Understanding duration is essential for fixed-income portfolio management.",
  },
  {
    id: "tips-10y",
    name: "TIPS (10-Year)",
    category: "Treasuries",
    currentPrice: 97.20,
    minimumInvestment: 10,
    yield: 1.95,
    liquidity: "T+1",
    settlementTime: "24 hours",
    description:
      "Treasury Inflation-Protected Securities. Principal adjusts daily with CPI-U. Nominal yield is lower, but real yield is protected against inflation erosion.",
    riskLevel: "Low",
    correlationWithSP500: -0.12,
    educationalNote:
      "TIPS real yield = nominal yield - breakeven inflation rate. When breakeven inflation > your expectation, nominal Treasuries are cheaper. When below, TIPS offer better value.",
  },

  // ─── Commodities ───────────────────────────────────────────────────────────
  {
    id: "cmdt-gold",
    name: "Gold (Spot)",
    category: "Commodities",
    currentPrice: 2342.50,
    minimumInvestment: 10,
    yield: 0.0,
    liquidity: "Instant",
    settlementTime: "3 seconds",
    description:
      "Each token represents one troy ounce of LBMA-vaulted gold. No counterparty credit risk. Functions as a macro hedge and safe-haven allocation.",
    riskLevel: "Medium",
    correlationWithSP500: 0.05,
    educationalNote:
      "Gold pays no yield, so its opportunity cost rises with interest rates. The gold-to-treasury trade-off is a classic macro signal: falling real yields are bullish for gold.",
  },
  {
    id: "cmdt-silver",
    name: "Silver (Spot)",
    category: "Commodities",
    currentPrice: 29.18,
    minimumInvestment: 10,
    yield: 0.0,
    liquidity: "Instant",
    settlementTime: "3 seconds",
    description:
      "Fractional silver backed by allocated physical metal. Dual demand from both monetary safe-haven buyers and industrial users (solar panels, electronics).",
    riskLevel: "Medium-High",
    correlationWithSP500: 0.28,
    educationalNote:
      "Silver has higher beta than gold due to its industrial demand component. The gold-to-silver ratio (GSR) is a classic relative-value indicator: GSR above 80 historically favors silver.",
  },
  {
    id: "cmdt-oil-wti",
    name: "Oil (WTI)",
    category: "Commodities",
    currentPrice: 78.40,
    minimumInvestment: 10,
    yield: 0.0,
    liquidity: "T+1",
    settlementTime: "24 hours",
    description:
      "Tokenized exposure to West Texas Intermediate crude oil spot price, settled against NYMEX front-month. No physical delivery; cash-settled roll-adjusted exposure.",
    riskLevel: "High",
    correlationWithSP500: 0.35,
    educationalNote:
      "Oil is one of the most volatile commodities due to geopolitical risk and OPEC supply decisions. Contango (futures > spot) creates a negative roll yield for long holders — important to understand before allocating.",
  },

  // ─── Alternative / Private ─────────────────────────────────────────────────
  {
    id: "alt-tech-fund",
    name: "Tech Growth Fund",
    category: "Alternative",
    currentPrice: 142.60,
    minimumInvestment: 100,
    yield: 0.0,
    liquidity: "Weekly",
    settlementTime: "7 days",
    description:
      "Tokenized shares in a late-stage venture fund focused on AI infrastructure and fintech. NAV updated quarterly based on the latest funding rounds.",
    riskLevel: "High",
    correlationWithSP500: 0.71,
    educationalNote:
      "Private equity is illiquid by design — the illiquidity premium is the return bonus investors demand for locking up capital. Tokenization creates a secondary market but does not eliminate fundamental illiquidity risk.",
  },
  {
    id: "alt-art-index",
    name: "Art Index",
    category: "Alternative",
    currentPrice: 310.00,
    minimumInvestment: 50,
    yield: 0.0,
    liquidity: "Weekly",
    settlementTime: "7 days",
    description:
      "Basket of tokenized fractional ownership in blue-chip contemporary artworks appraised by major auction houses. Low correlation provides genuine portfolio diversification.",
    riskLevel: "High",
    correlationWithSP500: 0.08,
    educationalNote:
      "Fine art has historically delivered ~8% annual returns with low equity correlation, but suffers from high transaction costs, appraisal opacity, and authenticity risk. Tokenization reduces barriers but does not eliminate these fundamentals.",
  },
  {
    id: "alt-infra-bond",
    name: "Infrastructure Bond",
    category: "Alternative",
    currentPrice: 103.50,
    minimumInvestment: 10,
    yield: 6.2,
    liquidity: "Weekly",
    settlementTime: "7 days",
    description:
      "Senior secured bond issued against a diversified portfolio of toll roads, data centers, and renewable energy assets. Long-duration income stream backed by essential infrastructure.",
    riskLevel: "Medium",
    correlationWithSP500: 0.22,
    educationalNote:
      "Infrastructure assets derive value from monopoly-like characteristics and inflation-linked revenue contracts. They occupy a middle ground between bonds (stable income) and equities (real asset appreciation).",
  },
];

export const ASSET_CATEGORIES: AssetCategory[] = [
  "Real Estate",
  "Treasuries",
  "Commodities",
  "Alternative",
];

export const LIQUIDITY_COLORS: Record<LiquidityLevel, string> = {
  Instant: "text-[#2d9cdb]",
  "T+1": "text-amber-400",
  Weekly: "text-amber-500",
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  Low: "text-green-400",
  Medium: "text-green-500",
  "Medium-High": "text-amber-400",
  High: "text-red-400",
};
