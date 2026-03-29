"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Search,
  ChevronUp,
  ChevronDown,
  X,
  Check,
  Filter,
  Star,
  Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) & 0xffffffff;
  }
  return h >>> 0;
}

// ── ETF static data ───────────────────────────────────────────────────────────

type ETFCategory = "Equity" | "Bond" | "Commodity" | "Real Estate" | "Thematic";

interface ETFDef {
  symbol: string;
  name: string;
  category: ETFCategory;
  aumB: number;        // AUM in billions
  expenseRatio: number; // percentage
  dividendYield: number; // percentage
  beta: number;
  sharpe: number;
  holdingsCount: number;
  topSector: string;
  w52Low: number;
  w52High: number;
  basePrice: number;
  description: string;
  topHoldings: { name: string; ticker: string; weight: number }[];
  sectorBreakdown: { sector: string; pct: number; color: string }[];
  geoExposure: { region: string; pct: number }[];
  factors: { Value: number; Growth: number; Momentum: number; Quality: number; LowVol: number };
}

const ETF_DATA: ETFDef[] = [
  {
    symbol: "SPY", name: "SPDR S&P 500 ETF", category: "Equity",
    aumB: 520, expenseRatio: 0.0945, dividendYield: 1.32, beta: 1.00, sharpe: 0.87, holdingsCount: 503, topSector: "Technology",
    w52Low: 410, w52High: 545, basePrice: 528,
    description: "Tracks the S&P 500 Index, representing 500 of the largest US public companies.",
    topHoldings: [
      { name: "Apple Inc", ticker: "AAPL", weight: 7.2 },
      { name: "Microsoft Corp", ticker: "MSFT", weight: 6.8 },
      { name: "NVIDIA Corp", ticker: "NVDA", weight: 6.1 },
      { name: "Amazon.com Inc", ticker: "AMZN", weight: 3.9 },
      { name: "Meta Platforms", ticker: "META", weight: 2.6 },
      { name: "Alphabet Class A", ticker: "GOOGL", weight: 2.1 },
      { name: "Berkshire Hathaway", ticker: "BRK.B", weight: 1.8 },
      { name: "Eli Lilly", ticker: "LLY", weight: 1.7 },
      { name: "Broadcom Inc", ticker: "AVGO", weight: 1.6 },
      { name: "JPMorgan Chase", ticker: "JPM", weight: 1.5 },
    ],
    sectorBreakdown: [
      { sector: "Technology", pct: 31.4, color: "#6366f1" },
      { sector: "Healthcare", pct: 12.8, color: "#10b981" },
      { sector: "Financials", pct: 12.5, color: "#3b82f6" },
      { sector: "Consumer Disc", pct: 10.2, color: "#f59e0b" },
      { sector: "Industrials", pct: 8.9, color: "#8b5cf6" },
      { sector: "Other", pct: 24.2, color: "#6b7280" },
    ],
    geoExposure: [{ region: "US", pct: 100 }, { region: "Intl", pct: 0 }, { region: "EM", pct: 0 }],
    factors: { Value: 42, Growth: 78, Momentum: 65, Quality: 72, LowVol: 48 },
  },
  {
    symbol: "QQQ", name: "Invesco NASDAQ-100 ETF", category: "Equity",
    aumB: 248, expenseRatio: 0.20, dividendYield: 0.56, beta: 1.18, sharpe: 0.94, holdingsCount: 101, topSector: "Technology",
    w52Low: 350, w52High: 490, basePrice: 464,
    description: "Tracks the NASDAQ-100 Index, focusing on the largest non-financial companies on NASDAQ.",
    topHoldings: [
      { name: "Apple Inc", ticker: "AAPL", weight: 8.6 },
      { name: "Microsoft Corp", ticker: "MSFT", weight: 8.2 },
      { name: "NVIDIA Corp", ticker: "NVDA", weight: 7.8 },
      { name: "Amazon.com Inc", ticker: "AMZN", weight: 5.3 },
      { name: "Meta Platforms", ticker: "META", weight: 4.8 },
      { name: "Alphabet Class A", ticker: "GOOGL", weight: 2.9 },
      { name: "Tesla Inc", ticker: "TSLA", weight: 2.6 },
      { name: "Broadcom Inc", ticker: "AVGO", weight: 2.4 },
      { name: "Costco Wholesale", ticker: "COST", weight: 2.1 },
      { name: "Netflix Inc", ticker: "NFLX", weight: 1.9 },
    ],
    sectorBreakdown: [
      { sector: "Technology", pct: 51.3, color: "#6366f1" },
      { sector: "Consumer Disc", pct: 17.9, color: "#f59e0b" },
      { sector: "Healthcare", pct: 7.4, color: "#10b981" },
      { sector: "Industrials", pct: 5.2, color: "#8b5cf6" },
      { sector: "Utilities", pct: 1.6, color: "#14b8a6" },
      { sector: "Other", pct: 16.6, color: "#6b7280" },
    ],
    geoExposure: [{ region: "US", pct: 98 }, { region: "Intl", pct: 2 }, { region: "EM", pct: 0 }],
    factors: { Value: 28, Growth: 92, Momentum: 78, Quality: 68, LowVol: 32 },
  },
  {
    symbol: "IWM", name: "iShares Russell 2000 ETF", category: "Equity",
    aumB: 52, expenseRatio: 0.19, dividendYield: 1.18, beta: 1.22, sharpe: 0.61, holdingsCount: 2000, topSector: "Financials",
    w52Low: 165, w52High: 230, basePrice: 198,
    description: "Tracks the Russell 2000 Index of small-cap US stocks.",
    topHoldings: [
      { name: "Sprouts Farmers Mkt", ticker: "SFM", weight: 0.53 },
      { name: "Vaxcyte Inc", ticker: "PCVX", weight: 0.48 },
      { name: "Fabrinet", ticker: "FN", weight: 0.46 },
      { name: "Onto Innovation", ticker: "ONTO", weight: 0.42 },
      { name: "Chemed Corp", ticker: "CHE", weight: 0.40 },
      { name: "GATX Corp", ticker: "GATX", weight: 0.38 },
      { name: "Ensign Group", ticker: "ENSG", weight: 0.37 },
      { name: "Novanta Inc", ticker: "NOVT", weight: 0.35 },
      { name: "ICF International", ticker: "ICFI", weight: 0.34 },
      { name: "Clearfield Inc", ticker: "CLFD", weight: 0.33 },
    ],
    sectorBreakdown: [
      { sector: "Financials", pct: 22.5, color: "#3b82f6" },
      { sector: "Healthcare", pct: 17.8, color: "#10b981" },
      { sector: "Industrials", pct: 16.4, color: "#8b5cf6" },
      { sector: "Technology", pct: 13.1, color: "#6366f1" },
      { sector: "Consumer Disc", pct: 10.8, color: "#f59e0b" },
      { sector: "Other", pct: 19.4, color: "#6b7280" },
    ],
    geoExposure: [{ region: "US", pct: 100 }, { region: "Intl", pct: 0 }, { region: "EM", pct: 0 }],
    factors: { Value: 58, Growth: 55, Momentum: 48, Quality: 44, LowVol: 38 },
  },
  {
    symbol: "DIA", name: "SPDR Dow Jones Industrial ETF", category: "Equity",
    aumB: 35, expenseRatio: 0.16, dividendYield: 1.78, beta: 0.88, sharpe: 0.72, holdingsCount: 30, topSector: "Industrials",
    w52Low: 320, w52High: 435, basePrice: 418,
    description: "Tracks the Dow Jones Industrial Average, 30 blue-chip US large-cap stocks.",
    topHoldings: [
      { name: "Goldman Sachs", ticker: "GS", weight: 8.4 },
      { name: "UnitedHealth Group", ticker: "UNH", weight: 7.9 },
      { name: "Microsoft Corp", ticker: "MSFT", weight: 6.2 },
      { name: "Home Depot", ticker: "HD", weight: 5.8 },
      { name: "Caterpillar Inc", ticker: "CAT", weight: 5.2 },
      { name: "Salesforce Inc", ticker: "CRM", weight: 4.9 },
      { name: "Visa Inc", ticker: "V", weight: 4.7 },
      { name: "Amgen Inc", ticker: "AMGN", weight: 4.5 },
      { name: "McDonald's Corp", ticker: "MCD", weight: 4.2 },
      { name: "Boeing Co", ticker: "BA", weight: 3.8 },
    ],
    sectorBreakdown: [
      { sector: "Industrials", pct: 23.6, color: "#8b5cf6" },
      { sector: "Financials", pct: 18.2, color: "#3b82f6" },
      { sector: "Healthcare", pct: 16.5, color: "#10b981" },
      { sector: "Technology", pct: 14.8, color: "#6366f1" },
      { sector: "Consumer Disc", pct: 12.1, color: "#f59e0b" },
      { sector: "Other", pct: 14.8, color: "#6b7280" },
    ],
    geoExposure: [{ region: "US", pct: 100 }, { region: "Intl", pct: 0 }, { region: "EM", pct: 0 }],
    factors: { Value: 65, Growth: 52, Momentum: 58, Quality: 76, LowVol: 62 },
  },
  {
    symbol: "GLD", name: "SPDR Gold Shares", category: "Commodity",
    aumB: 58, expenseRatio: 0.40, dividendYield: 0, beta: 0.12, sharpe: 0.58, holdingsCount: 1, topSector: "N/A",
    w52Low: 172, w52High: 245, basePrice: 231,
    description: "Tracks the price of gold bullion. Physical gold backing, stored in secure vaults.",
    topHoldings: [{ name: "Gold Bullion", ticker: "XAU", weight: 100 }],
    sectorBreakdown: [{ sector: "Gold", pct: 100, color: "#f59e0b" }],
    geoExposure: [{ region: "US", pct: 100 }, { region: "Intl", pct: 0 }, { region: "EM", pct: 0 }],
    factors: { Value: 50, Growth: 20, Momentum: 72, Quality: 40, LowVol: 68 },
  },
  {
    symbol: "SLV", name: "iShares Silver Trust", category: "Commodity",
    aumB: 11, expenseRatio: 0.50, dividendYield: 0, beta: 0.18, sharpe: 0.42, holdingsCount: 1, topSector: "N/A",
    w52Low: 20, w52High: 32, basePrice: 27.5,
    description: "Tracks the price of silver bullion. Physical silver backing.",
    topHoldings: [{ name: "Silver Bullion", ticker: "XAG", weight: 100 }],
    sectorBreakdown: [{ sector: "Silver", pct: 100, color: "#94a3b8" }],
    geoExposure: [{ region: "US", pct: 100 }, { region: "Intl", pct: 0 }, { region: "EM", pct: 0 }],
    factors: { Value: 45, Growth: 18, Momentum: 58, Quality: 35, LowVol: 52 },
  },
  {
    symbol: "TLT", name: "iShares 20+ Year Treasury ETF", category: "Bond",
    aumB: 45, expenseRatio: 0.15, dividendYield: 3.92, beta: -0.32, sharpe: -0.18, holdingsCount: 39, topSector: "Government",
    w52Low: 82, w52High: 102, basePrice: 92,
    description: "Tracks long-duration US Treasury bonds (20+ years). Highly sensitive to interest rate changes.",
    topHoldings: [
      { name: "US Treasury 4.25% 2054", ticker: "T4.25", weight: 5.8 },
      { name: "US Treasury 4.5% 2052", ticker: "T4.5", weight: 5.2 },
      { name: "US Treasury 3.875% 2050", ticker: "T3.9", weight: 4.9 },
      { name: "US Treasury 4.0% 2051", ticker: "T4.0", weight: 4.7 },
      { name: "US Treasury 3.625% 2053", ticker: "T3.6", weight: 4.5 },
      { name: "US Treasury 4.75% 2053", ticker: "T4.75", weight: 4.3 },
      { name: "US Treasury 3.0% 2048", ticker: "T3.0", weight: 4.1 },
      { name: "US Treasury 4.125% 2054", ticker: "T4.1", weight: 3.9 },
      { name: "US Treasury 2.875% 2049", ticker: "T2.9", weight: 3.7 },
      { name: "US Treasury 3.25% 2047", ticker: "T3.3", weight: 3.5 },
    ],
    sectorBreakdown: [{ sector: "Government", pct: 100, color: "#3b82f6" }],
    geoExposure: [{ region: "US", pct: 100 }, { region: "Intl", pct: 0 }, { region: "EM", pct: 0 }],
    factors: { Value: 62, Growth: 15, Momentum: 35, Quality: 90, LowVol: 75 },
  },
  {
    symbol: "HYG", name: "iShares iBoxx $ High Yield Corp", category: "Bond",
    aumB: 18, expenseRatio: 0.48, dividendYield: 5.84, beta: 0.42, sharpe: 0.38, holdingsCount: 1218, topSector: "Corporate",
    w52Low: 72, w52High: 80, basePrice: 78,
    description: "Tracks high-yield (junk) corporate bonds. Higher yield, higher credit risk.",
    topHoldings: [
      { name: "Carnival Corp 6.0%", ticker: "CCL", weight: 1.2 },
      { name: "TransDigm 6.75%", ticker: "TDG", weight: 1.1 },
      { name: "Univision 6.625%", ticker: "UVN", weight: 0.9 },
      { name: "Energizer Holdings 6.5%", ticker: "ENR", weight: 0.8 },
      { name: "Bausch Health 9.0%", ticker: "BHC", weight: 0.7 },
      { name: "Dun & Bradstreet 5.0%", ticker: "DNB", weight: 0.7 },
      { name: "EquipmentShare 8.625%", ticker: "EQS", weight: 0.6 },
      { name: "Intelsat 6.5%", ticker: "I", weight: 0.6 },
      { name: "Centene Corp 4.625%", ticker: "CNC", weight: 0.6 },
      { name: "Post Holdings 5.5%", ticker: "POST", weight: 0.5 },
    ],
    sectorBreakdown: [
      { sector: "Corporate HY", pct: 82, color: "#ef4444" },
      { sector: "Corporate IG", pct: 10, color: "#3b82f6" },
      { sector: "Bank Loans", pct: 5, color: "#8b5cf6" },
      { sector: "Other", pct: 3, color: "#6b7280" },
    ],
    geoExposure: [{ region: "US", pct: 88 }, { region: "Intl", pct: 12 }, { region: "EM", pct: 0 }],
    factors: { Value: 72, Growth: 28, Momentum: 42, Quality: 30, LowVol: 58 },
  },
  {
    symbol: "XLE", name: "Energy Select Sector SPDR", category: "Equity",
    aumB: 38, expenseRatio: 0.09, dividendYield: 3.54, beta: 1.28, sharpe: 0.52, holdingsCount: 22, topSector: "Energy",
    w52Low: 78, w52High: 98, basePrice: 88,
    description: "Tracks the energy sector of the S&P 500, including oil, gas, and energy equipment companies.",
    topHoldings: [
      { name: "Exxon Mobil Corp", ticker: "XOM", weight: 23.8 },
      { name: "Chevron Corp", ticker: "CVX", weight: 16.2 },
      { name: "ConocoPhillips", ticker: "COP", weight: 8.1 },
      { name: "EOG Resources", ticker: "EOG", weight: 5.4 },
      { name: "Schlumberger NV", ticker: "SLB", weight: 4.8 },
      { name: "Pioneer Natural", ticker: "PXD", weight: 4.2 },
      { name: "Marathon Petroleum", ticker: "MPC", weight: 3.9 },
      { name: "Phillips 66", ticker: "PSX", weight: 3.7 },
      { name: "Valero Energy", ticker: "VLO", weight: 3.4 },
      { name: "Occidental Petroleum", ticker: "OXY", weight: 3.2 },
    ],
    sectorBreakdown: [
      { sector: "Oil & Gas", pct: 48, color: "#f59e0b" },
      { sector: "Integrated", pct: 31, color: "#ef4444" },
      { sector: "Refining", pct: 13, color: "#8b5cf6" },
      { sector: "Equipment", pct: 8, color: "#6b7280" },
    ],
    geoExposure: [{ region: "US", pct: 100 }, { region: "Intl", pct: 0 }, { region: "EM", pct: 0 }],
    factors: { Value: 82, Growth: 38, Momentum: 52, Quality: 55, LowVol: 40 },
  },
  {
    symbol: "XLF", name: "Financial Select Sector SPDR", category: "Equity",
    aumB: 41, expenseRatio: 0.09, dividendYield: 1.64, beta: 1.12, sharpe: 0.68, holdingsCount: 69, topSector: "Financials",
    w52Low: 36, w52High: 48, basePrice: 45,
    description: "Tracks the financial sector of the S&P 500: banks, insurance, and diversified financials.",
    topHoldings: [
      { name: "Berkshire Hathaway", ticker: "BRK.B", weight: 14.2 },
      { name: "JPMorgan Chase", ticker: "JPM", weight: 12.8 },
      { name: "Visa Inc", ticker: "V", weight: 8.4 },
      { name: "Mastercard Inc", ticker: "MA", weight: 6.9 },
      { name: "Bank of America", ticker: "BAC", weight: 6.2 },
      { name: "Wells Fargo", ticker: "WFC", weight: 5.1 },
      { name: "Goldman Sachs", ticker: "GS", weight: 4.8 },
      { name: "S&P Global", ticker: "SPGI", weight: 3.9 },
      { name: "Morgan Stanley", ticker: "MS", weight: 3.4 },
      { name: "Blackrock Inc", ticker: "BLK", weight: 2.8 },
    ],
    sectorBreakdown: [
      { sector: "Banks", pct: 36, color: "#3b82f6" },
      { sector: "Payments", pct: 22, color: "#6366f1" },
      { sector: "Insurance", pct: 20, color: "#10b981" },
      { sector: "Investment Mgmt", pct: 14, color: "#8b5cf6" },
      { sector: "Other", pct: 8, color: "#6b7280" },
    ],
    geoExposure: [{ region: "US", pct: 100 }, { region: "Intl", pct: 0 }, { region: "EM", pct: 0 }],
    factors: { Value: 74, Growth: 48, Momentum: 55, Quality: 68, LowVol: 52 },
  },
  {
    symbol: "XLK", name: "Technology Select Sector SPDR", category: "Equity",
    aumB: 68, expenseRatio: 0.09, dividendYield: 0.62, beta: 1.22, sharpe: 0.92, holdingsCount: 65, topSector: "Technology",
    w52Low: 155, w52High: 230, basePrice: 215,
    description: "Tracks the technology sector of the S&P 500. Concentrated in mega-cap tech.",
    topHoldings: [
      { name: "Apple Inc", ticker: "AAPL", weight: 22.4 },
      { name: "Microsoft Corp", ticker: "MSFT", weight: 21.8 },
      { name: "NVIDIA Corp", ticker: "NVDA", weight: 18.6 },
      { name: "Broadcom Inc", ticker: "AVGO", weight: 5.2 },
      { name: "Salesforce Inc", ticker: "CRM", weight: 3.8 },
      { name: "AMD Inc", ticker: "AMD", weight: 3.4 },
      { name: "Qualcomm Inc", ticker: "QCOM", weight: 2.9 },
      { name: "Adobe Inc", ticker: "ADBE", weight: 2.7 },
      { name: "Texas Instruments", ticker: "TXN", weight: 2.4 },
      { name: "Intuit Inc", ticker: "INTU", weight: 2.1 },
    ],
    sectorBreakdown: [
      { sector: "Software", pct: 32, color: "#6366f1" },
      { sector: "Semiconductors", pct: 36, color: "#8b5cf6" },
      { sector: "Hardware", pct: 26, color: "#3b82f6" },
      { sector: "IT Services", pct: 6, color: "#6b7280" },
    ],
    geoExposure: [{ region: "US", pct: 98 }, { region: "Intl", pct: 2 }, { region: "EM", pct: 0 }],
    factors: { Value: 30, Growth: 88, Momentum: 82, Quality: 76, LowVol: 35 },
  },
  {
    symbol: "XLV", name: "Health Care Select Sector SPDR", category: "Equity",
    aumB: 38, expenseRatio: 0.09, dividendYield: 1.52, beta: 0.62, sharpe: 0.74, holdingsCount: 63, topSector: "Healthcare",
    w52Low: 122, w52High: 160, basePrice: 148,
    description: "Tracks the healthcare sector of the S&P 500: pharma, biotech, and medical devices.",
    topHoldings: [
      { name: "Eli Lilly", ticker: "LLY", weight: 13.8 },
      { name: "UnitedHealth Group", ticker: "UNH", weight: 11.2 },
      { name: "Johnson & Johnson", ticker: "JNJ", weight: 6.4 },
      { name: "AbbVie Inc", ticker: "ABBV", weight: 6.1 },
      { name: "Merck & Co", ticker: "MRK", weight: 5.8 },
      { name: "Thermo Fisher", ticker: "TMO", weight: 4.2 },
      { name: "Pfizer Inc", ticker: "PFE", weight: 3.9 },
      { name: "Abbott Labs", ticker: "ABT", weight: 3.7 },
      { name: "Danaher Corp", ticker: "DHR", weight: 3.4 },
      { name: "Intuitive Surgical", ticker: "ISRG", weight: 3.1 },
    ],
    sectorBreakdown: [
      { sector: "Pharma", pct: 38, color: "#10b981" },
      { sector: "Managed Care", pct: 22, color: "#3b82f6" },
      { sector: "Biotech", pct: 18, color: "#8b5cf6" },
      { sector: "Med Devices", pct: 14, color: "#6366f1" },
      { sector: "Other", pct: 8, color: "#6b7280" },
    ],
    geoExposure: [{ region: "US", pct: 100 }, { region: "Intl", pct: 0 }, { region: "EM", pct: 0 }],
    factors: { Value: 56, Growth: 68, Momentum: 62, Quality: 80, LowVol: 70 },
  },
  {
    symbol: "ARKK", name: "ARK Innovation ETF", category: "Thematic",
    aumB: 6.8, expenseRatio: 0.75, dividendYield: 0, beta: 1.68, sharpe: -0.22, holdingsCount: 35, topSector: "Technology",
    w52Low: 38, w52High: 72, basePrice: 52,
    description: "Actively managed ETF targeting disruptive innovation: AI, genomics, robotics, fintech, space.",
    topHoldings: [
      { name: "Tesla Inc", ticker: "TSLA", weight: 10.2 },
      { name: "Coinbase Global", ticker: "COIN", weight: 9.8 },
      { name: "Roku Inc", ticker: "ROKU", weight: 7.4 },
      { name: "UiPath Inc", ticker: "PATH", weight: 6.8 },
      { name: "Exact Sciences", ticker: "EXAS", weight: 6.1 },
      { name: "Shopify Inc", ticker: "SHOP", weight: 5.9 },
      { name: "DraftKings Inc", ticker: "DKNG", weight: 5.2 },
      { name: "Palantir Technologies", ticker: "PLTR", weight: 4.8 },
      { name: "Block Inc", ticker: "SQ", weight: 4.4 },
      { name: "Zoom Video", ticker: "ZM", weight: 4.1 },
    ],
    sectorBreakdown: [
      { sector: "Tech/AI", pct: 35, color: "#6366f1" },
      { sector: "Fintech", pct: 22, color: "#8b5cf6" },
      { sector: "Healthcare Innovation", pct: 18, color: "#10b981" },
      { sector: "Mobility", pct: 15, color: "#f59e0b" },
      { sector: "Other", pct: 10, color: "#6b7280" },
    ],
    geoExposure: [{ region: "US", pct: 82 }, { region: "Intl", pct: 18 }, { region: "EM", pct: 0 }],
    factors: { Value: 18, Growth: 95, Momentum: 45, Quality: 32, LowVol: 15 },
  },
  {
    symbol: "VNQ", name: "Vanguard Real Estate ETF", category: "Real Estate",
    aumB: 32, expenseRatio: 0.12, dividendYield: 3.86, beta: 0.78, sharpe: 0.34, holdingsCount: 164, topSector: "Real Estate",
    w52Low: 76, w52High: 96, basePrice: 88,
    description: "Tracks REITs and real estate companies. High dividend yield, interest rate sensitive.",
    topHoldings: [
      { name: "Vanguard RE Index Fund", ticker: "VNQI", weight: 12.4 },
      { name: "Prologis Inc", ticker: "PLD", weight: 8.2 },
      { name: "American Tower Corp", ticker: "AMT", weight: 6.8 },
      { name: "Equinix Inc", ticker: "EQIX", weight: 5.9 },
      { name: "Welltower Inc", ticker: "WELL", weight: 5.2 },
      { name: "Public Storage", ticker: "PSA", weight: 4.8 },
      { name: "Crown Castle Inc", ticker: "CCI", weight: 4.2 },
      { name: "Simon Property Group", ticker: "SPG", weight: 3.9 },
      { name: "Realty Income Corp", ticker: "O", weight: 3.6 },
      { name: "Digital Realty Trust", ticker: "DLR", weight: 3.4 },
    ],
    sectorBreakdown: [
      { sector: "Industrial", pct: 28, color: "#8b5cf6" },
      { sector: "Data Centers", pct: 22, color: "#6366f1" },
      { sector: "Cell Towers", pct: 18, color: "#3b82f6" },
      { sector: "Healthcare RE", pct: 14, color: "#10b981" },
      { sector: "Retail RE", pct: 10, color: "#f59e0b" },
      { sector: "Other", pct: 8, color: "#6b7280" },
    ],
    geoExposure: [{ region: "US", pct: 100 }, { region: "Intl", pct: 0 }, { region: "EM", pct: 0 }],
    factors: { Value: 68, Growth: 42, Momentum: 38, Quality: 60, LowVol: 72 },
  },
  {
    symbol: "EEM", name: "iShares MSCI Emerging Markets ETF", category: "Equity",
    aumB: 22, expenseRatio: 0.70, dividendYield: 2.14, beta: 0.88, sharpe: 0.28, holdingsCount: 1247, topSector: "Technology",
    w52Low: 36, w52High: 50, basePrice: 44,
    description: "Tracks emerging market equities across 24 countries including China, India, Taiwan, and Brazil.",
    topHoldings: [
      { name: "Taiwan Semiconductor", ticker: "TSM", weight: 8.4 },
      { name: "Samsung Electronics", ticker: "005930", weight: 4.2 },
      { name: "Tencent Holdings", ticker: "700", weight: 4.1 },
      { name: "Alibaba Group", ticker: "BABA", weight: 3.2 },
      { name: "Meituan", ticker: "3690", weight: 2.1 },
      { name: "Reliance Industries", ticker: "RELIANCE", weight: 1.8 },
      { name: "Infosys Ltd", ticker: "INFY", weight: 1.6 },
      { name: "SK Hynix", ticker: "000660", weight: 1.5 },
      { name: "HDFC Bank", ticker: "HDFCBANK", weight: 1.4 },
      { name: "PDD Holdings", ticker: "PDD", weight: 1.3 },
    ],
    sectorBreakdown: [
      { sector: "Technology", pct: 32, color: "#6366f1" },
      { sector: "Financials", pct: 22, color: "#3b82f6" },
      { sector: "Consumer Disc", pct: 14, color: "#f59e0b" },
      { sector: "Consumer Staples", pct: 9, color: "#10b981" },
      { sector: "Materials", pct: 8, color: "#8b5cf6" },
      { sector: "Other", pct: 15, color: "#6b7280" },
    ],
    geoExposure: [{ region: "US", pct: 2 }, { region: "Intl", pct: 52 }, { region: "EM", pct: 46 }],
    factors: { Value: 64, Growth: 58, Momentum: 42, Quality: 50, LowVol: 48 },
  },
];

// ── Overlap data (symbol pairs → shared %) ────────────────────────────────────

const OVERLAP_MAP: Record<string, number> = {
  "SPY-QQQ": 42, "SPY-XLK": 31, "SPY-XLF": 13, "SPY-XLV": 13, "SPY-XLE": 5,
  "QQQ-XLK": 68, "QQQ-ARKK": 22, "XLK-ARKK": 18,
  "SPY-DIA": 28, "QQQ-DIA": 15, "SPY-IWM": 0, "QQQ-IWM": 0,
  "TLT-HYG": 0, "GLD-SLV": 0, "VNQ-EEM": 0,
};

function getOverlap(a: string, b: string): number {
  const key = [a, b].sort().join("-");
  return OVERLAP_MAP[key] ?? Math.floor(hashStr(key) % 15);
}

// ── Seeded return generation ───────────────────────────────────────────────────

function generateETFReturns(etf: ETFDef) {
  const rand = mulberry32(hashStr(etf.symbol + "returns2026"));
  const ytd = (rand() * 40 - 12) * (etf.category === "Thematic" ? 1.5 : 1);
  const y1 = ytd + (rand() * 20 - 6);
  return { ytd: +ytd.toFixed(2), y1: +y1.toFixed(2) };
}

interface ETFRow extends ETFDef {
  price: number;
  ytdReturn: number;
  y1Return: number;
}

// ── Normalized performance chart data ────────────────────────────────────────

function generatePerfSeries(etf: ETFDef, points = 52): number[] {
  const rand = mulberry32(hashStr(etf.symbol + "perf52w"));
  const vals = [100];
  for (let i = 1; i < points; i++) {
    const drift = (rand() - 0.46) * 0.04;
    vals.push(+(vals[i - 1] * (1 + drift)).toFixed(3));
  }
  return vals;
}

// ── Sparkline component ───────────────────────────────────────────────────────

function Sparkline({ etf, width = 80, height = 28 }: { etf: ETFDef; width?: number; height?: number }) {
  const vals = useMemo(() => generatePerfSeries(etf, 20), [etf]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const isUp = vals[vals.length - 1] >= vals[0];
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={isUp ? "#10b981" : "#ef4444"}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── 52W range bar ─────────────────────────────────────────────────────────────

function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const pct = Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
  return (
    <div className="flex items-center gap-1.5 w-full min-w-[100px]">
      <span className="text-[11px] text-muted-foreground tabular-nums">{low.toFixed(0)}</span>
      <div className="relative flex-1 h-1.5 rounded-full bg-muted/50">
        <div
          className="absolute top-0 h-full rounded-l-full bg-primary/30"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-1 rounded-sm bg-primary"
          style={{ left: `calc(${pct}% - 2px)` }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground tabular-nums">{high.toFixed(0)}</span>
    </div>
  );
}

// ── Build ETF rows ─────────────────────────────────────────────────────────────

const ETF_ROWS: ETFRow[] = ETF_DATA.map((etf) => {
  const { ytd, y1 } = generateETFReturns(etf);
  const rand = mulberry32(hashStr(etf.symbol + "price"));
  const noise = 1 + (rand() - 0.5) * 0.02;
  return { ...etf, price: +(etf.basePrice * noise).toFixed(2), ytdReturn: ytd, y1Return: y1 };
});

// ── Return chip ───────────────────────────────────────────────────────────────

function ReturnChip({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        pos ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
      )}
    >
      {pos ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {pos ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}

// ── Category badge ────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<ETFCategory, string> = {
  Equity: "bg-primary/10 text-primary",
  Bond: "bg-amber-500/10 text-amber-400",
  Commodity: "bg-yellow-500/10 text-yellow-400",
  "Real Estate": "bg-primary/10 text-primary",
  Thematic: "bg-pink-500/10 text-pink-400",
};

function CategoryBadge({ cat }: { cat: ETFCategory }) {
  return (
    <span className={cn("rounded-full px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", CATEGORY_COLORS[cat])}>
      {cat}
    </span>
  );
}

// ── ETF Detail Panel ──────────────────────────────────────────────────────────

function ETFDetailPanel({ etf, onClose }: { etf: ETFRow; onClose: () => void }) {
  return (
    <div className="flex h-full w-80 shrink-0 flex-col overflow-y-auto border-l border-border/50 bg-card">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border/50 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">{etf.symbol}</span>
            <CategoryBadge cat={etf.category} />
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">{etf.name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 px-4 py-3 border-b border-border/50">
        <span className="text-2xl font-bold tabular-nums">${etf.price.toFixed(2)}</span>
        <ReturnChip value={etf.ytdReturn} />
        <span className="text-xs text-muted-foreground">YTD</span>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-px border-b border-border/50 bg-border/30">
        {[
          { label: "AUM", value: `$${etf.aumB.toFixed(1)}B` },
          { label: "Expense Ratio", value: `${etf.expenseRatio.toFixed(3)}%` },
          { label: "Div Yield", value: etf.dividendYield > 0 ? `${etf.dividendYield.toFixed(2)}%` : "N/A" },
          { label: "Beta", value: etf.beta.toFixed(2) },
          { label: "Sharpe", value: etf.sharpe.toFixed(2) },
          { label: "Holdings", value: etf.holdingsCount.toLocaleString() },
          { label: "1Y Return", value: `${etf.y1Return > 0 ? "+" : ""}${etf.y1Return.toFixed(2)}%` },
          { label: "Top Sector", value: etf.topSector },
        ].map((s) => (
          <div key={s.label} className="bg-card px-3 py-2">
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
            <div className="mt-0.5 text-xs font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* 52W range */}
      <div className="px-4 py-3 border-b border-border/50">
        <div className="mb-2 text-xs text-muted-foreground">52-Week Range</div>
        <RangeBar low={etf.w52Low} high={etf.w52High} current={etf.price} />
      </div>

      {/* Description */}
      <div className="px-4 py-3 border-b border-border/50">
        <div className="mb-1.5 text-xs text-muted-foreground">About</div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{etf.description}</p>
      </div>

      {/* Sparkline */}
      <div className="px-4 py-3 border-b border-border/50">
        <div className="mb-2 text-xs text-muted-foreground">52W Performance</div>
        <Sparkline etf={etf} width={248} height={48} />
      </div>
    </div>
  );
}

// ── Tab 1: ETF Explorer ───────────────────────────────────────────────────────

function ETFExplorer() {
  const [selectedETF, setSelectedETF] = useState<ETFRow | null>(null);
  const [sortKey, setSortKey] = useState<keyof ETFRow>("aumB");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    let r = ETF_ROWS.filter(
      (e) =>
        e.symbol.toLowerCase().includes(search.toLowerCase()) ||
        e.name.toLowerCase().includes(search.toLowerCase()),
    );
    r = [...r].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return r;
  }, [search, sortKey, sortDir]);

  function toggleSort(key: keyof ETFRow) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortIcon({ k }: { k: keyof ETFRow }) {
    if (k !== sortKey) return null;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  }

  function Th({ k, children }: { k: keyof ETFRow; children: React.ReactNode }) {
    return (
      <th
        className="cursor-pointer select-none whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-muted-foreground hover:text-foreground"
        onClick={() => toggleSort(k)}
      >
        <div className="flex items-center gap-0.5">
          {children}
          <SortIcon k={k} />
        </div>
      </th>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Search */}
        <div className="shrink-0 px-4 py-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full max-w-xs rounded-md border border-border/50 bg-muted/30 py-1.5 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search ETFs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card z-10 border-b border-border/50">
              <tr>
                <Th k="symbol">Symbol</Th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Name</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Category</th>
                <Th k="aumB">AUM ($B)</Th>
                <Th k="expenseRatio">Exp Ratio</Th>
                <Th k="ytdReturn">YTD</Th>
                <Th k="y1Return">1Y</Th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">52W Range</th>
                <Th k="dividendYield">Div Yield</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {rows.map((etf) => (
                <tr
                  key={etf.symbol}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-accent/40",
                    selectedETF?.symbol === etf.symbol && "bg-accent/60",
                  )}
                  onClick={() => setSelectedETF((prev) => prev?.symbol === etf.symbol ? null : etf)}
                >
                  <td className="px-3 py-2.5 font-bold text-primary">{etf.symbol}</td>
                  <td className="px-3 py-2.5 max-w-[160px] truncate text-muted-foreground">{etf.name}</td>
                  <td className="px-3 py-2.5">
                    <CategoryBadge cat={etf.category} />
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">${etf.aumB.toFixed(1)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{etf.expenseRatio.toFixed(3)}%</td>
                  <td className="px-3 py-2.5">
                    <ReturnChip value={etf.ytdReturn} />
                  </td>
                  <td className="px-3 py-2.5">
                    <ReturnChip value={etf.y1Return} />
                  </td>
                  <td className="px-3 py-2.5">
                    <RangeBar low={etf.w52Low} high={etf.w52High} current={etf.price} />
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {etf.dividendYield > 0 ? `${etf.dividendYield.toFixed(2)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selectedETF && (
        <ETFDetailPanel etf={selectedETF} onClose={() => setSelectedETF(null)} />
      )}
    </div>
  );
}

// ── Tab 2: Fund Comparison ────────────────────────────────────────────────────

const COMPARE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

function FundComparison() {
  const [selected, setSelected] = useState<string[]>(["SPY", "QQQ"]);

  function toggleETF(sym: string) {
    setSelected((prev) => {
      if (prev.includes(sym)) return prev.filter((s) => s !== sym);
      if (prev.length >= 4) return prev;
      return [...prev, sym];
    });
  }

  const selectedRows = ETF_ROWS.filter((e) => selected.includes(e.symbol));
  const perfSeries = useMemo(
    () => selectedRows.map((e) => ({ etf: e, data: generatePerfSeries(e, 52) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected.join(",")],
  );

  // SVG performance chart
  const W = 560, H = 200, PAD_L = 40, PAD_B = 24, PAD_T = 12, PAD_R = 12;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;

  const allVals = perfSeries.flatMap((s) => s.data);
  const minV = allVals.length ? Math.min(...allVals) : 80;
  const maxV = allVals.length ? Math.max(...allVals) : 130;
  const vRange = maxV - minV || 1;

  function toX(i: number) { return PAD_L + (i / 51) * chartW; }
  function toY(v: number) { return PAD_T + chartH - ((v - minV) / vRange) * chartH; }

  // Overlap pairs
  const overlapPairs: { a: string; b: string; pct: number }[] = [];
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      overlapPairs.push({ a: selected[i], b: selected[j], pct: getOverlap(selected[i], selected[j]) });
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 py-4 gap-5">
      {/* ETF selector */}
      <div>
        <div className="mb-2 text-xs font-semibold text-muted-foreground">
          Select up to 4 ETFs
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ETF_ROWS.map((etf, idx) => {
            const selIdx = selected.indexOf(etf.symbol);
            const isSel = selIdx >= 0;
            return (
              <button
                key={etf.symbol}
                type="button"
                onClick={() => toggleETF(etf.symbol)}
                className={cn(
                  "flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  isSel
                    ? "border-transparent text-white"
                    : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
                style={isSel ? { backgroundColor: COMPARE_COLORS[selIdx] } : {}}
              >
                {isSel && <Check className="h-3 w-3" />}
                {etf.symbol}
              </button>
            );
          })}
        </div>
      </div>

      {selectedRows.length >= 2 && (
        <>
          {/* Performance chart */}
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Normalized Performance (52W, base 100)
              </span>
              <div className="flex gap-3">
                {selectedRows.map((e, i) => (
                  <div key={e.symbol} className="flex items-center gap-1.5">
                    <div className="h-2 w-4 rounded-full" style={{ backgroundColor: COMPARE_COLORS[i] }} />
                    <span className="text-xs font-medium">{e.symbol}</span>
                  </div>
                ))}
              </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
              {/* Y grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = PAD_T + chartH - t * chartH;
                const v = minV + t * vRange;
                return (
                  <g key={t}>
                    <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="currentColor" strokeOpacity={0.08} />
                    <text x={PAD_L - 4} y={y + 3} textAnchor="end" fontSize={7} fill="currentColor" fillOpacity={0.4}>
                      {v.toFixed(0)}
                    </text>
                  </g>
                );
              })}
              {/* Baseline 100 */}
              {minV < 100 && maxV > 100 && (
                <line
                  x1={PAD_L} y1={toY(100)} x2={W - PAD_R} y2={toY(100)}
                  stroke="#6b7280" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.4}
                />
              )}
              {/* Series */}
              {perfSeries.map(({ etf, data }, ci) => {
                const pts = data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
                return (
                  <polyline
                    key={etf.symbol}
                    points={pts}
                    fill="none"
                    stroke={COMPARE_COLORS[ci]}
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                );
              })}
              {/* Final value labels */}
              {perfSeries.map(({ etf, data }, ci) => {
                const last = data[data.length - 1];
                const x = toX(51);
                const y = toY(last);
                return (
                  <text key={etf.symbol} x={x + 3} y={y + 3} fontSize={8} fill={COMPARE_COLORS[ci]} fontWeight="600">
                    {last.toFixed(1)}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Side-by-side stats */}
          <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Metric</th>
                  {selectedRows.map((e, i) => (
                    <th key={e.symbol} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: COMPARE_COLORS[i] }}>
                      {e.symbol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {[
                  { label: "Expense Ratio", fn: (e: ETFRow) => `${e.expenseRatio.toFixed(3)}%`, best: "min" },
                  { label: "AUM ($B)", fn: (e: ETFRow) => `$${e.aumB.toFixed(1)}B`, best: "max" },
                  { label: "Holdings", fn: (e: ETFRow) => e.holdingsCount.toLocaleString(), best: "none" },
                  { label: "Top Sector", fn: (e: ETFRow) => e.topSector, best: "none" },
                  { label: "Beta", fn: (e: ETFRow) => e.beta.toFixed(2), best: "none" },
                  { label: "Sharpe Ratio", fn: (e: ETFRow) => e.sharpe.toFixed(2), best: "max" },
                  { label: "Dividend Yield", fn: (e: ETFRow) => e.dividendYield > 0 ? `${e.dividendYield.toFixed(2)}%` : "N/A", best: "none" },
                  { label: "YTD Return", fn: (e: ETFRow) => `${e.ytdReturn > 0 ? "+" : ""}${e.ytdReturn.toFixed(2)}%`, best: "max" },
                  { label: "1Y Return", fn: (e: ETFRow) => `${e.y1Return > 0 ? "+" : ""}${e.y1Return.toFixed(2)}%`, best: "max" },
                ].map((row) => {
                  // Determine best value for highlighting
                  let bestIdx = -1;
                  if (row.best === "max" || row.best === "min") {
                    const nums = selectedRows.map((e) => parseFloat(row.fn(e).replace(/[^0-9.-]/g, "")));
                    const target = row.best === "max" ? Math.max(...nums) : Math.min(...nums);
                    bestIdx = nums.findIndex((n) => n === target);
                  }
                  return (
                    <tr key={row.label} className="hover:bg-accent/20">
                      <td className="px-4 py-2 text-muted-foreground">{row.label}</td>
                      {selectedRows.map((e, i) => (
                        <td
                          key={e.symbol}
                          className={cn(
                            "px-4 py-2 font-medium tabular-nums",
                            i === bestIdx && "text-emerald-400",
                          )}
                        >
                          {row.fn(e)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Overlap analysis */}
          <div className="rounded-lg border border-border/50 bg-card px-4 py-3">
            <div className="mb-2 text-xs font-semibold text-muted-foreground">Holdings Overlap</div>
            <div className="flex flex-wrap gap-3">
              {overlapPairs.length === 0 ? (
                <span className="text-xs text-muted-foreground">No pairs to compare.</span>
              ) : overlapPairs.map((p) => (
                <div key={`${p.a}-${p.b}`} className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/20 px-3 py-1.5">
                  <span className="text-xs font-semibold">{p.a} + {p.b}</span>
                  <span className="text-xs text-muted-foreground">share</span>
                  <span className={cn("text-xs font-bold", p.pct > 30 ? "text-amber-400" : "text-emerald-400")}>
                    {p.pct}%
                  </span>
                  <span className="text-xs text-muted-foreground">of holdings</span>
                  {p.pct > 30 && <Info className="h-3 w-3 text-amber-400" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedRows.length < 2 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <PieChart className="h-12 w-12 mb-3 opacity-20" />
          <p className="text-sm">Select at least 2 ETFs to compare</p>
        </div>
      )}
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: { sector: string; pct: number; color: string }[] }) {
  const CX = 80, CY = 80, R = 60, INNER = 38;
  let cumPct = 0;
  const slices = data.map((d) => {
    const start = cumPct;
    cumPct += d.pct;
    return { ...d, start, end: cumPct };
  });

  function polarToXY(pct: number, r: number) {
    const angle = (pct / 100) * 2 * Math.PI - Math.PI / 2;
    return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
  }

  function arcPath(start: number, end: number) {
    const s = polarToXY(start, R);
    const e = polarToXY(end, R);
    const si = polarToXY(start, INNER);
    const ei = polarToXY(end, INNER);
    const lg = end - start > 50 ? 1 : 0;
    return `M ${si.x} ${si.y} L ${s.x} ${s.y} A ${R} ${R} 0 ${lg} 1 ${e.x} ${e.y} L ${ei.x} ${ei.y} A ${INNER} ${INNER} 0 ${lg} 0 ${si.x} ${si.y} Z`;
  }

  return (
    <svg viewBox="0 0 160 160" className="w-full max-w-[160px]">
      {slices.map((s, i) => (
        <path key={i} d={arcPath(s.start, s.end)} fill={s.color} stroke="none" className="transition-opacity hover:opacity-80" />
      ))}
    </svg>
  );
}

// ── Radar chart (hexagon) ────────────────────────────────────────────────────

function RadarChart({ factors }: { factors: { Value: number; Growth: number; Momentum: number; Quality: number; LowVol: number } }) {
  const CX = 90, CY = 90, R = 72;
  const keys = ["Value", "Growth", "Momentum", "Quality", "LowVol"] as const;
  const labels = { Value: "Value", Growth: "Growth", Momentum: "Momentum", Quality: "Quality", LowVol: "Low Vol" };
  const n = keys.length;

  function angle(i: number) { return (i / n) * 2 * Math.PI - Math.PI / 2; }
  function pt(i: number, r: number) {
    const a = angle(i);
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPoints = keys.map((k, i) => {
    const val = (factors[k] ?? 50) / 100;
    return pt(i, val * R);
  });

  return (
    <svg viewBox="0 0 180 180" className="w-full max-w-[180px]">
      {/* Grid */}
      {gridLevels.map((lvl) => {
        const pts = keys.map((_, i) => { const p = pt(i, lvl * R); return `${p.x},${p.y}`; });
        return <polygon key={lvl} points={pts.join(" ")} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} />;
      })}
      {/* Spokes */}
      {keys.map((_, i) => {
        const p = pt(i, R);
        return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="currentColor" strokeOpacity={0.1} strokeWidth={1} />;
      })}
      {/* Data polygon */}
      <polygon
        points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="#6366f1"
        fillOpacity={0.18}
        stroke="#6366f1"
        strokeWidth={1.5}
      />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#6366f1" />
      ))}
      {/* Labels */}
      {keys.map((k, i) => {
        const p = pt(i, R + 14);
        return (
          <text key={k} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="currentColor" fillOpacity={0.6}>
            {labels[k]}
          </text>
        );
      })}
    </svg>
  );
}

// ── Tab 3: Holdings X-Ray ─────────────────────────────────────────────────────

function HoldingsXRay() {
  const [selectedSym, setSelectedSym] = useState("SPY");
  const etf = ETF_ROWS.find((e) => e.symbol === selectedSym) ?? ETF_ROWS[0];
  const maxWeight = Math.max(...etf.topHoldings.map((h) => h.weight));

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 py-4 gap-5">
      {/* ETF picker */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-muted-foreground">Select ETF</span>
        <select
          value={selectedSym}
          onChange={(e) => setSelectedSym(e.target.value)}
          className="rounded-md border border-border/50 bg-muted/30 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {ETF_ROWS.map((e) => (
            <option key={e.symbol} value={e.symbol}>{e.symbol} — {e.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Top 10 holdings */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="mb-3 text-xs font-semibold text-muted-foreground">
            Top 10 Holdings
          </div>
          <div className="space-y-2">
            {etf.topHoldings.map((h, i) => (
              <div key={h.ticker} className="flex items-center gap-2">
                <span className="w-4 text-[11px] text-muted-foreground text-right">{i + 1}</span>
                <span className="w-10 shrink-0 text-xs font-bold text-primary">{h.ticker}</span>
                <div className="flex-1 relative h-4 rounded bg-muted/30">
                  <div
                    className="h-full rounded bg-primary/25 transition-all"
                    style={{ width: `${(h.weight / maxWeight) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-1.5 text-[11px] font-medium">
                    {h.name.length > 22 ? h.name.slice(0, 22) + "…" : h.name}
                  </span>
                </div>
                <span className="w-10 text-right text-xs tabular-nums font-semibold">{h.weight.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector breakdown */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="mb-3 text-xs font-semibold text-muted-foreground">
            Sector Breakdown
          </div>
          <div className="flex items-center gap-4">
            <DonutChart data={etf.sectorBreakdown} />
            <div className="flex-1 space-y-1.5">
              {etf.sectorBreakdown.map((s) => (
                <div key={s.sector} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="flex-1 text-xs text-muted-foreground">{s.sector}</span>
                  <span className="text-xs font-semibold tabular-nums">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic exposure */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="mb-3 text-xs font-semibold text-muted-foreground">
            Geographic Exposure
          </div>
          <div className="space-y-3">
            {etf.geoExposure.map((g) => (
              <div key={g.region} className="flex items-center gap-3">
                <span className="w-12 text-xs font-medium">{g.region}</span>
                <div className="flex-1 h-2 rounded-full bg-muted/30">
                  <div
                    className="h-full rounded-full bg-primary/50 transition-all"
                    style={{ width: `${g.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-semibold tabular-nums">{g.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Factor exposures radar */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="mb-3 text-xs font-semibold text-muted-foreground">
            Factor Exposures
          </div>
          <div className="flex items-center gap-4">
            <RadarChart factors={etf.factors} />
            <div className="flex-1 space-y-1.5">
              {(Object.entries(etf.factors) as [string, number][]).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="flex-1 text-xs text-muted-foreground">{k === "LowVol" ? "Low Vol" : k}</span>
                  <div className="w-16 h-1.5 rounded-full bg-muted/30">
                    <div className="h-full rounded-full bg-indigo-500/60" style={{ width: `${v}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold tabular-nums">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: ETF Screener ───────────────────────────────────────────────────────

type CategoryFilter = "All" | ETFCategory;
type ExpenseFilter = "All" | "<0.1%" | "<0.5%" | "<1%";
type AUMFilter = "All" | ">$1B" | ">$10B";
type YieldFilter = "All" | ">2%" | ">4%";

interface Recommendation {
  goal: string;
  etf: string;
  reason: string;
  icon: string;
}

const RECOMMENDATIONS: Recommendation[] = [
  { goal: "Long-term Growth", etf: "QQQ", reason: "High-growth tech exposure with 20Y avg of ~15% annual return. Slightly higher fees but worth it for growth tilt.", icon: "TrendingUp" },
  { goal: "Income", etf: "HYG", reason: "5.8% dividend yield with monthly distributions. Best for income-focused investors comfortable with credit risk.", icon: "DollarSign" },
  { goal: "Inflation Hedge", etf: "GLD", reason: "Physical gold historically preserves purchasing power. Zero correlation to equities during inflationary periods.", icon: "Shield" },
  { goal: "International Exposure", etf: "EEM", reason: "Broad emerging market exposure across 24 countries. Diversifies US-centric portfolios with EM growth potential.", icon: "Globe" },
];

function ETFScreener() {
  const [catFilter, setCatFilter] = useState<CategoryFilter>("All");
  const [expFilter, setExpFilter] = useState<ExpenseFilter>("All");
  const [aumFilter, setAUMFilter] = useState<AUMFilter>("All");
  const [yieldFilter, setYieldFilter] = useState<YieldFilter>("All");

  const filtered = useMemo(() => {
    return ETF_ROWS.filter((e) => {
      if (catFilter !== "All" && e.category !== catFilter) return false;
      if (expFilter === "<0.1%" && e.expenseRatio >= 0.1) return false;
      if (expFilter === "<0.5%" && e.expenseRatio >= 0.5) return false;
      if (expFilter === "<1%" && e.expenseRatio >= 1) return false;
      if (aumFilter === ">$1B" && e.aumB < 1) return false;
      if (aumFilter === ">$10B" && e.aumB < 10) return false;
      if (yieldFilter === ">2%" && e.dividendYield < 2) return false;
      if (yieldFilter === ">4%" && e.dividendYield < 4) return false;
      return true;
    });
  }, [catFilter, expFilter, aumFilter, yieldFilter]);

  function FilterGroup<T extends string>({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: T[];
    value: T;
    onChange: (v: T) => void;
  }) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground shrink-0">{label}:</span>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
              value === opt
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/50 text-muted-foreground hover:border-primary/40",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 py-4 gap-5">
      {/* Filters */}
      <div className="rounded-lg border border-border/50 bg-card px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Filters</span>
        </div>
        <FilterGroup
          label="Category"
          options={["All", "Equity", "Bond", "Commodity", "Real Estate", "Thematic"] as CategoryFilter[]}
          value={catFilter}
          onChange={setCatFilter}
        />
        <FilterGroup
          label="Expense Ratio"
          options={["All", "<0.1%", "<0.5%", "<1%"] as ExpenseFilter[]}
          value={expFilter}
          onChange={setExpFilter}
        />
        <FilterGroup
          label="AUM"
          options={["All", ">$1B", ">$10B"] as AUMFilter[]}
          value={aumFilter}
          onChange={setAUMFilter}
        />
        <FilterGroup
          label="Div Yield"
          options={["All", ">2%", ">4%"] as YieldFilter[]}
          value={yieldFilter}
          onChange={setYieldFilter}
        />
      </div>

      {/* Results */}
      <div>
        <div className="mb-2 text-xs font-semibold text-muted-foreground">
          {filtered.length} ETF{filtered.length !== 1 ? "s" : ""} match your criteria
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm">No ETFs match the current filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((etf) => (
              <div key={etf.symbol} className="rounded-lg border border-border/50 bg-card p-3 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{etf.symbol}</span>
                      <CategoryBadge cat={etf.category} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{etf.name}</p>
                  </div>
                  <Sparkline etf={etf} width={60} height={24} />
                </div>
                <div className="grid grid-cols-3 gap-1 mt-2">
                  {[
                    { label: "Exp", value: `${etf.expenseRatio.toFixed(2)}%` },
                    { label: "AUM", value: `$${etf.aumB >= 10 ? etf.aumB.toFixed(0) : etf.aumB.toFixed(1)}B` },
                    { label: "Yield", value: etf.dividendYield > 0 ? `${etf.dividendYield.toFixed(1)}%` : "—" },
                  ].map((s) => (
                    <div key={s.label} className="rounded bg-muted/20 px-1.5 py-1 text-center">
                      <div className="text-[8px] text-muted-foreground">{s.label}</div>
                      <div className="text-xs font-semibold tabular-nums">{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <ReturnChip value={etf.ytdReturn} />
                  <span className="text-xs text-muted-foreground tabular-nums">${etf.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Star className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-muted-foreground">Best ETF for Your Goal</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RECOMMENDATIONS.map((rec) => {
            const etf = ETF_ROWS.find((e) => e.symbol === rec.etf);
            if (!etf) return null;
            return (
              <div key={rec.goal} className="rounded-lg border border-border/50 bg-card p-4 hover:border-amber-400/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-xs font-semibold text-amber-400 mb-1">{rec.goal}</div>
                    <div className="text-sm font-bold">{etf.symbol}</div>
                    <div className="text-xs text-muted-foreground">{etf.name}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <ReturnChip value={etf.ytdReturn} />
                    <span className="text-[11px] text-muted-foreground">{etf.expenseRatio.toFixed(3)}% fee</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ETFPage() {
  const [activeTab, setActiveTab] = useState("explorer");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 px-6 py-4">
        <PieChart className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-base font-semibold leading-none">ETF Analysis</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Explore, compare, and screen 15 major ETFs across all asset classes
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col min-h-0">
        <TabsList className="shrink-0 mx-6 mt-3 w-fit">
          <TabsTrigger value="explorer" className="text-xs gap-1.5">
            <Search className="h-3.5 w-3.5" />
            ETF Explorer
          </TabsTrigger>
          <TabsTrigger value="comparison" className="text-xs gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Fund Comparison
          </TabsTrigger>
          <TabsTrigger value="xray" className="text-xs gap-1.5">
            <PieChart className="h-3.5 w-3.5" />
            Holdings X-Ray
          </TabsTrigger>
          <TabsTrigger value="screener" className="text-xs gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            ETF Screener
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explorer" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
          <ETFExplorer />
        </TabsContent>

        <TabsContent value="comparison" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
          <FundComparison />
        </TabsContent>

        <TabsContent value="xray" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
          <HoldingsXRay />
        </TabsContent>

        <TabsContent value="screener" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
          <ETFScreener />
        </TabsContent>
      </Tabs>
    </div>
  );
}
