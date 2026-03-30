export interface AllocationSlice {
  label: string;
  pct: number;
  color: string;
  examples?: string[];
}

export interface PortfolioModel {
  name: string;
  description: string;
  riskLevel: number;
  allocation: AllocationSlice[];
  expectedReturn: number;
  volatility: number;
  maxDrawdown: number;
  suitableFor: string;
  sparkline: number[];
  historicalPerformance: { year: number; return: number }[];
}

export const PORTFOLIO_MODELS: PortfolioModel[] = [
  {
    name: "Conservative Income",
    description:
      "A capital-preservation-first portfolio focused on generating steady income through high-quality bonds and dividend-paying equities. Minimizes volatility at the cost of lower long-term growth.",
    riskLevel: 1,
    allocation: [
      { label: "US Bonds", pct: 50, color: "#60a5fa", examples: ["BND", "AGG", "VBTLX"] },
      { label: "TIPS", pct: 15, color: "#34d399", examples: ["TIP", "VTIP", "SCHP"] },
      { label: "Large Cap", pct: 20, color: "#a78bfa", examples: ["VTI", "SPY", "IVV"] },
      { label: "Cash", pct: 10, color: "#94a3b8", examples: ["Money Market", "T-Bills", "SGOV"] },
      { label: "REITs", pct: 5, color: "#fbbf24", examples: ["VNQ", "SCHH", "IYR"] },
    ],
    expectedReturn: 4.5,
    volatility: 6.2,
    maxDrawdown: -12,
    suitableFor:
      "Retirees or near-retirees prioritizing capital preservation and steady income over growth. Low tolerance for portfolio fluctuations.",
    sparkline: [100, 101, 102, 100, 103, 105, 104, 106, 107, 108, 107, 109, 110, 112, 111, 113, 115, 114, 116, 118, 117, 119, 121, 123, 122, 124, 126, 128, 130, 132, 131, 134, 136, 138, 140, 139, 141, 143, 145, 147],
    historicalPerformance: [
      { year: 2015, return: 1.8 },
      { year: 2016, return: 4.2 },
      { year: 2017, return: 5.1 },
      { year: 2018, return: -1.2 },
      { year: 2019, return: 8.9 },
      { year: 2020, return: 7.2 },
      { year: 2021, return: 3.8 },
      { year: 2022, return: -11.5 },
      { year: 2023, return: 7.1 },
      { year: 2024, return: 5.3 },
    ],
  },
  {
    name: "Balanced 60/40",
    description:
      "The classic institutional allocation: 60% stocks for growth and 40% bonds for stability. Has been the default benchmark portfolio for decades. Simple, effective, and widely studied.",
    riskLevel: 3,
    allocation: [
      { label: "US Stocks", pct: 40, color: "#60a5fa", examples: ["VTI", "VTSAX", "SPTM"] },
      { label: "Intl Stocks", pct: 20, color: "#a78bfa", examples: ["VXUS", "IXUS", "EFA"] },
      { label: "US Bonds", pct: 30, color: "#34d399", examples: ["BND", "AGG", "VBTLX"] },
      { label: "REITs", pct: 5, color: "#fbbf24", examples: ["VNQ", "SCHH"] },
      { label: "Cash", pct: 5, color: "#94a3b8", examples: ["SGOV", "BIL"] },
    ],
    expectedReturn: 7.2,
    volatility: 10.5,
    maxDrawdown: -28,
    suitableFor:
      "Mid-career investors seeking moderate growth with some downside protection. Comfortable with temporary drawdowns in exchange for higher long-term returns.",
    sparkline: [100, 103, 106, 102, 108, 112, 109, 114, 118, 115, 120, 125, 121, 126, 130, 127, 132, 136, 131, 138, 143, 140, 146, 150, 145, 152, 157, 153, 160, 165, 160, 168, 173, 169, 176, 181, 177, 184, 190, 195],
    historicalPerformance: [
      { year: 2015, return: 1.3 },
      { year: 2016, return: 8.3 },
      { year: 2017, return: 14.2 },
      { year: 2018, return: -4.8 },
      { year: 2019, return: 19.8 },
      { year: 2020, return: 14.1 },
      { year: 2021, return: 12.5 },
      { year: 2022, return: -16.9 },
      { year: 2023, return: 15.2 },
      { year: 2024, return: 12.8 },
    ],
  },
  {
    name: "Growth",
    description:
      "A stock-heavy portfolio designed for maximum long-term capital appreciation. Includes international diversification and small-cap exposure for enhanced growth potential at the cost of higher volatility.",
    riskLevel: 4,
    allocation: [
      { label: "US Stocks", pct: 50, color: "#60a5fa", examples: ["VTI", "VTSAX", "ITOT"] },
      { label: "Intl Stocks", pct: 25, color: "#a78bfa", examples: ["VXUS", "IXUS", "VEA"] },
      { label: "Small Cap", pct: 10, color: "#f472b6", examples: ["VB", "IJR", "SCHA"] },
      { label: "Emerging Mkts", pct: 10, color: "#fbbf24", examples: ["VWO", "IEMG", "EEM"] },
      { label: "Bonds", pct: 5, color: "#34d399", examples: ["BND", "AGG"] },
    ],
    expectedReturn: 9.1,
    volatility: 14.8,
    maxDrawdown: -42,
    suitableFor:
      "Young investors with a 15+ year horizon who can tolerate significant volatility. Prioritizes long-term wealth accumulation over short-term stability.",
    sparkline: [100, 105, 110, 103, 112, 120, 114, 124, 132, 125, 135, 144, 136, 148, 156, 148, 160, 170, 158, 172, 184, 175, 190, 200, 188, 205, 218, 208, 225, 240, 228, 248, 260, 250, 270, 285, 272, 295, 310, 330],
    historicalPerformance: [
      { year: 2015, return: -0.5 },
      { year: 2016, return: 10.1 },
      { year: 2017, return: 20.8 },
      { year: 2018, return: -9.2 },
      { year: 2019, return: 26.1 },
      { year: 2020, return: 17.5 },
      { year: 2021, return: 18.3 },
      { year: 2022, return: -20.5 },
      { year: 2023, return: 20.1 },
      { year: 2024, return: 18.7 },
    ],
  },
  {
    name: "Aggressive Growth",
    description:
      "A high-octane portfolio allocated entirely to equities and alternative assets including emerging markets and cryptocurrency. Designed for maximum long-term returns with the highest volatility.",
    riskLevel: 5,
    allocation: [
      { label: "US Stocks", pct: 45, color: "#60a5fa", examples: ["VTI", "QQQ", "VTSAX"] },
      { label: "Intl Stocks", pct: 20, color: "#a78bfa", examples: ["VXUS", "EFA", "VEA"] },
      { label: "Small Cap", pct: 15, color: "#f472b6", examples: ["VB", "IJR", "IWM"] },
      { label: "Emerging Mkts", pct: 15, color: "#fbbf24", examples: ["VWO", "IEMG", "EEM"] },
      { label: "Crypto", pct: 5, color: "#fb923c", examples: ["BTC", "ETH"] },
    ],
    expectedReturn: 11.3,
    volatility: 19.2,
    maxDrawdown: -55,
    suitableFor:
      "Young, risk-tolerant investors with a very long horizon (20+ years) and high emotional resilience. Can watch their portfolio drop 50% without panic-selling.",
    sparkline: [100, 108, 118, 98, 120, 135, 118, 140, 158, 138, 162, 180, 155, 185, 205, 180, 212, 240, 200, 250, 280, 248, 300, 330, 290, 350, 390, 350, 400, 450, 400, 470, 520, 480, 550, 600, 540, 620, 680, 750],
    historicalPerformance: [
      { year: 2015, return: -2.1 },
      { year: 2016, return: 12.5 },
      { year: 2017, return: 28.4 },
      { year: 2018, return: -14.8 },
      { year: 2019, return: 30.2 },
      { year: 2020, return: 22.8 },
      { year: 2021, return: 24.1 },
      { year: 2022, return: -30.2 },
      { year: 2023, return: 26.5 },
      { year: 2024, return: 24.3 },
    ],
  },
  {
    name: "All-Weather",
    description:
      "Inspired by Ray Dalio's Bridgewater fund. Designed to perform reasonably well across all economic environments: growth, recession, inflation, and deflation. Balances risk parity across asset classes.",
    riskLevel: 2,
    allocation: [
      { label: "US Stocks", pct: 30, color: "#60a5fa", examples: ["VTI", "SPY", "VTSAX"] },
      { label: "Long Bonds", pct: 40, color: "#34d399", examples: ["TLT", "VGLT", "EDV"] },
      { label: "Gold", pct: 15, color: "#fbbf24", examples: ["GLD", "IAU", "GLDM"] },
      { label: "Commodities", pct: 7.5, color: "#fb923c", examples: ["DBC", "GSG", "PDBC"] },
      { label: "TIPS", pct: 7.5, color: "#94a3b8", examples: ["TIP", "VTIP", "SCHP"] },
    ],
    expectedReturn: 6.0,
    volatility: 7.8,
    maxDrawdown: -18,
    suitableFor:
      "Investors seeking consistent performance across all economic environments: growth, recession, inflation, and deflation. Values stability over maximum returns.",
    sparkline: [100, 102, 104, 102, 105, 107, 106, 108, 110, 109, 111, 113, 112, 114, 116, 115, 117, 119, 117, 120, 122, 121, 123, 126, 124, 127, 130, 128, 131, 134, 132, 136, 139, 137, 140, 143, 141, 145, 148, 152],
    historicalPerformance: [
      { year: 2015, return: -1.5 },
      { year: 2016, return: 8.1 },
      { year: 2017, return: 11.2 },
      { year: 2018, return: -3.2 },
      { year: 2019, return: 16.5 },
      { year: 2020, return: 14.8 },
      { year: 2021, return: 5.2 },
      { year: 2022, return: -20.1 },
      { year: 2023, return: 10.8 },
      { year: 2024, return: 7.5 },
    ],
  },
  {
    name: "Dividend Focus",
    description:
      "An income-oriented portfolio built around high-quality dividend-paying stocks, REITs, and corporate bonds. Aims to generate consistent cash flow while providing moderate capital appreciation.",
    riskLevel: 2,
    allocation: [
      { label: "Dividend Stocks", pct: 40, color: "#60a5fa", examples: ["VYM", "SCHD", "DVY"] },
      { label: "REITs", pct: 15, color: "#f472b6", examples: ["VNQ", "SCHH", "IYR"] },
      { label: "Preferred Stock", pct: 10, color: "#a78bfa", examples: ["PFF", "PGX", "PFFD"] },
      { label: "Corp Bonds", pct: 25, color: "#34d399", examples: ["LQD", "VCIT", "IGIB"] },
      { label: "Intl Dividend", pct: 10, color: "#fbbf24", examples: ["VYMI", "IDV", "EFAV"] },
    ],
    expectedReturn: 5.8,
    volatility: 9.0,
    maxDrawdown: -22,
    suitableFor:
      "Income-focused investors who want regular cash flow from their portfolio. Suitable for those who prefer dividend payments over capital appreciation.",
    sparkline: [100, 102, 104, 101, 106, 109, 107, 111, 114, 112, 115, 118, 116, 120, 123, 121, 125, 128, 125, 130, 133, 131, 135, 138, 136, 140, 144, 141, 146, 150, 147, 153, 157, 154, 159, 163, 160, 166, 170, 175],
    historicalPerformance: [
      { year: 2015, return: -0.3 },
      { year: 2016, return: 10.5 },
      { year: 2017, return: 10.8 },
      { year: 2018, return: -5.1 },
      { year: 2019, return: 17.2 },
      { year: 2020, return: 5.8 },
      { year: 2021, return: 18.9 },
      { year: 2022, return: -8.3 },
      { year: 2023, return: 8.5 },
      { year: 2024, return: 11.2 },
    ],
  },
  {
    name: "Permanent Portfolio",
    description:
      "Harry Browne's 4x25% allocation designed for simplicity and all-weather resilience. Equal parts stocks, bonds, gold, and cash ensure something always works regardless of the economic environment.",
    riskLevel: 2,
    allocation: [
      { label: "US Stocks", pct: 25, color: "#60a5fa", examples: ["VTI", "SPY", "VTSAX"] },
      { label: "Long Bonds", pct: 25, color: "#34d399", examples: ["TLT", "VGLT", "EDV"] },
      { label: "Gold", pct: 25, color: "#fbbf24", examples: ["GLD", "IAU", "GLDM"] },
      { label: "Cash/T-Bills", pct: 25, color: "#94a3b8", examples: ["SGOV", "BIL", "SHV"] },
    ],
    expectedReturn: 5.5,
    volatility: 6.5,
    maxDrawdown: -15,
    suitableFor:
      "Investors who value simplicity, minimal maintenance, and all-weather resilience. Willing to accept lower returns in exchange for consistent performance and peace of mind.",
    sparkline: [100, 101, 103, 101, 104, 106, 105, 107, 109, 108, 110, 112, 111, 113, 114, 113, 115, 117, 116, 118, 120, 119, 121, 123, 122, 124, 126, 125, 127, 130, 129, 131, 133, 132, 134, 137, 136, 138, 141, 144],
    historicalPerformance: [
      { year: 2015, return: -1.8 },
      { year: 2016, return: 5.9 },
      { year: 2017, return: 9.5 },
      { year: 2018, return: -2.5 },
      { year: 2019, return: 15.8 },
      { year: 2020, return: 16.2 },
      { year: 2021, return: 2.1 },
      { year: 2022, return: -11.8 },
      { year: 2023, return: 9.5 },
      { year: 2024, return: 8.8 },
    ],
  },
  {
    name: "Bogle 3-Fund",
    description:
      "John Bogle's (Vanguard founder) elegantly simple approach: total US stock market, total international stock market, and total bond market. Maximum diversification with minimum complexity and cost.",
    riskLevel: 3,
    allocation: [
      { label: "US Total Market", pct: 50, color: "#60a5fa", examples: ["VTI", "VTSAX", "ITOT"] },
      { label: "Intl Total Market", pct: 30, color: "#a78bfa", examples: ["VXUS", "VTIAX", "IXUS"] },
      { label: "US Total Bond", pct: 20, color: "#34d399", examples: ["BND", "VBTLX", "AGG"] },
    ],
    expectedReturn: 7.8,
    volatility: 11.5,
    maxDrawdown: -32,
    suitableFor:
      "Cost-conscious investors of any experience level who want broad market exposure with minimal fees. Ideal for those who prefer a set-it-and-forget-it approach with annual rebalancing.",
    sparkline: [100, 103, 107, 102, 109, 114, 110, 116, 121, 117, 123, 128, 124, 130, 135, 130, 136, 142, 137, 144, 150, 146, 153, 158, 153, 160, 166, 161, 169, 175, 170, 178, 185, 180, 188, 195, 190, 198, 205, 213],
    historicalPerformance: [
      { year: 2015, return: 0.5 },
      { year: 2016, return: 8.8 },
      { year: 2017, return: 16.5 },
      { year: 2018, return: -6.8 },
      { year: 2019, return: 22.1 },
      { year: 2020, return: 15.3 },
      { year: 2021, return: 14.8 },
      { year: 2022, return: -18.2 },
      { year: 2023, return: 17.5 },
      { year: 2024, return: 14.2 },
    ],
  },
  {
    name: "Golden Butterfly",
    description:
      "A variation of the Permanent Portfolio that overweights stocks and adds small-cap value for enhanced returns while maintaining the all-weather philosophy. Named for the butterfly-like allocation symmetry.",
    riskLevel: 3,
    allocation: [
      { label: "US Large Cap", pct: 20, color: "#60a5fa", examples: ["VTI", "SPY", "VOO"] },
      { label: "Small Cap Value", pct: 20, color: "#f472b6", examples: ["VBR", "IJS", "AVUV"] },
      { label: "Long Bonds", pct: 20, color: "#34d399", examples: ["TLT", "VGLT", "EDV"] },
      { label: "Short Bonds", pct: 20, color: "#a78bfa", examples: ["SHY", "VGSH", "BSV"] },
      { label: "Gold", pct: 20, color: "#fbbf24", examples: ["GLD", "IAU", "GLDM"] },
    ],
    expectedReturn: 6.8,
    volatility: 8.5,
    maxDrawdown: -20,
    suitableFor:
      "Investors who like the Permanent Portfolio concept but want slightly higher equity exposure through the small-cap value factor premium. Moderate risk tolerance with all-weather aspirations.",
    sparkline: [100, 102, 105, 102, 107, 110, 108, 112, 115, 113, 116, 120, 118, 121, 124, 122, 126, 129, 126, 131, 134, 132, 136, 140, 137, 142, 146, 143, 148, 153, 150, 155, 160, 157, 162, 167, 164, 169, 175, 180],
    historicalPerformance: [
      { year: 2015, return: -0.8 },
      { year: 2016, return: 9.2 },
      { year: 2017, return: 11.5 },
      { year: 2018, return: -3.8 },
      { year: 2019, return: 17.8 },
      { year: 2020, return: 15.5 },
      { year: 2021, return: 10.2 },
      { year: 2022, return: -12.5 },
      { year: 2023, return: 11.8 },
      { year: 2024, return: 10.5 },
    ],
  },
  {
    name: "Risk Parity",
    description:
      "An institutional approach that allocates based on risk contribution rather than capital. Each asset class contributes equally to total portfolio risk, which typically means leveraging bonds to match equity volatility.",
    riskLevel: 3,
    allocation: [
      { label: "US Stocks", pct: 20, color: "#60a5fa", examples: ["VTI", "SPY"] },
      { label: "Intl Stocks", pct: 10, color: "#a78bfa", examples: ["VXUS", "EFA"] },
      { label: "Long Bonds", pct: 35, color: "#34d399", examples: ["TLT", "VGLT"] },
      { label: "TIPS", pct: 15, color: "#fb923c", examples: ["TIP", "VTIP"] },
      { label: "Commodities", pct: 10, color: "#fbbf24", examples: ["DBC", "GSG"] },
      { label: "Gold", pct: 10, color: "#94a3b8", examples: ["GLD", "IAU"] },
    ],
    expectedReturn: 6.5,
    volatility: 7.2,
    maxDrawdown: -16,
    suitableFor:
      "Sophisticated investors who understand risk-based allocation. Suitable for those who want institutional-grade diversification with lower drawdowns than traditional equity-heavy portfolios.",
    sparkline: [100, 102, 104, 102, 106, 108, 107, 109, 112, 110, 113, 116, 114, 117, 119, 118, 120, 123, 121, 124, 127, 125, 128, 131, 129, 132, 136, 134, 137, 140, 138, 142, 145, 143, 147, 150, 148, 152, 156, 160],
    historicalPerformance: [
      { year: 2015, return: -2.1 },
      { year: 2016, return: 7.8 },
      { year: 2017, return: 12.1 },
      { year: 2018, return: -3.5 },
      { year: 2019, return: 18.2 },
      { year: 2020, return: 16.5 },
      { year: 2021, return: 4.8 },
      { year: 2022, return: -18.5 },
      { year: 2023, return: 12.2 },
      { year: 2024, return: 9.1 },
    ],
  },
];
