"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building2,
  Activity,
  Target,
  Percent,
  Globe,
  Scale,
  Award,
  Users,
  FileText,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 97;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed = 97) {
  s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────

type DealType = "Acquisition" | "Merger" | "LBO" | "Spinoff";
type DealStatus = "Pending" | "Closed" | "Terminated";

interface MADeal {
  id: number;
  acquirer: string;
  target: string;
  value: number; // $B
  type: DealType;
  status: DealStatus;
  premium: number; // %
  industry: string;
  announced: string; // YYYY-MM
  regulatory: string; // YYYY-MM
  closed: string; // YYYY-MM
  origin: string;
  destination: string;
  crossBorder: boolean;
}

interface CompComp {
  name: string;
  evRevenue: number;
  evEbitda: number;
  peRatio: number;
  revenue: number; // $B
  ebitda: number; // $B
}

interface PrecedentTx {
  name: string;
  year: number;
  premium: number;
  evRevenue: number;
  evEbitda: number;
}

interface LBOTarget {
  name: string;
  revenue: number; // $B
  ebitda: number; // $B
  ebitdaMargin: number; // %
  netDebt: number; // $B
  industry: string;
}

interface LeagueEntry {
  rank: number;
  bank: string;
  deals: number;
  value: number; // $B
  share: number; // %
  fees: number; // $M
}

// ── Static Data ────────────────────────────────────────────────────────────────

const MA_DEALS: MADeal[] = [
  {
    id: 1,
    acquirer: "TechGiant Corp",
    target: "CloudVision AI",
    value: 28.4,
    type: "Acquisition",
    status: "Pending",
    premium: 38,
    industry: "Technology",
    announced: "2025-11",
    regulatory: "2026-02",
    closed: "2026-05",
    origin: "US",
    destination: "US",
    crossBorder: false,
  },
  {
    id: 2,
    acquirer: "MegaBank Holdings",
    target: "FinanceFirst",
    value: 14.7,
    type: "Merger",
    status: "Closed",
    premium: 22,
    industry: "Financial Services",
    announced: "2025-06",
    regulatory: "2025-09",
    closed: "2025-12",
    origin: "US",
    destination: "US",
    crossBorder: false,
  },
  {
    id: 3,
    acquirer: "Apollo Capital",
    target: "Retail Empire",
    value: 8.9,
    type: "LBO",
    status: "Closed",
    premium: 31,
    industry: "Retail",
    announced: "2025-04",
    regulatory: "2025-07",
    closed: "2025-09",
    origin: "US",
    destination: "US",
    crossBorder: false,
  },
  {
    id: 4,
    acquirer: "EuroPharm AG",
    target: "BioMedix Inc",
    value: 19.2,
    type: "Acquisition",
    status: "Pending",
    premium: 45,
    industry: "Healthcare",
    announced: "2025-12",
    regulatory: "2026-03",
    closed: "2026-06",
    origin: "DE",
    destination: "US",
    crossBorder: true,
  },
  {
    id: 5,
    acquirer: "EnergyMax Ltd",
    target: "GreenPower Co",
    value: 6.3,
    type: "Merger",
    status: "Terminated",
    premium: 18,
    industry: "Energy",
    announced: "2025-03",
    regulatory: "2025-07",
    closed: "—",
    origin: "UK",
    destination: "UK",
    crossBorder: false,
  },
  {
    id: 6,
    acquirer: "Blackrock Partners",
    target: "InfraAssets Corp",
    value: 12.1,
    type: "LBO",
    status: "Pending",
    premium: 27,
    industry: "Infrastructure",
    announced: "2026-01",
    regulatory: "2026-04",
    closed: "2026-07",
    origin: "US",
    destination: "US",
    crossBorder: false,
  },
  {
    id: 7,
    acquirer: "OmniMedia",
    target: "StreamVault",
    value: 5.8,
    type: "Acquisition",
    status: "Closed",
    premium: 33,
    industry: "Media",
    announced: "2025-05",
    regulatory: "2025-08",
    closed: "2025-10",
    origin: "US",
    destination: "US",
    crossBorder: false,
  },
  {
    id: 8,
    acquirer: "SingTech Holdings",
    target: "DataCenter Asia",
    value: 3.4,
    type: "Acquisition",
    status: "Closed",
    premium: 29,
    industry: "Technology",
    announced: "2025-07",
    regulatory: "2025-10",
    closed: "2025-12",
    origin: "SG",
    destination: "SG",
    crossBorder: false,
  },
  {
    id: 9,
    acquirer: "ChemCorp Global",
    target: "PolyMerge Inc",
    value: 22.6,
    type: "Merger",
    status: "Pending",
    premium: 25,
    industry: "Chemicals",
    announced: "2026-01",
    regulatory: "2026-05",
    closed: "2026-09",
    origin: "DE",
    destination: "US",
    crossBorder: true,
  },
  {
    id: 10,
    acquirer: "CongloCo Ltd",
    target: "IndusDiv Spinco",
    value: 4.2,
    type: "Spinoff",
    status: "Closed",
    premium: 0,
    industry: "Industrials",
    announced: "2025-08",
    regulatory: "2025-10",
    closed: "2025-12",
    origin: "US",
    destination: "US",
    crossBorder: false,
  },
  {
    id: 11,
    acquirer: "FoodBev Giant",
    target: "SnackBrand Co",
    value: 9.7,
    type: "Acquisition",
    status: "Pending",
    premium: 42,
    industry: "Consumer",
    announced: "2026-02",
    regulatory: "2026-06",
    closed: "2026-10",
    origin: "US",
    destination: "US",
    crossBorder: false,
  },
  {
    id: 12,
    acquirer: "JP Financiers",
    target: "CreditNow Corp",
    value: 7.1,
    type: "Acquisition",
    status: "Terminated",
    premium: 16,
    industry: "Financial Services",
    announced: "2025-09",
    regulatory: "2025-12",
    closed: "—",
    origin: "JP",
    destination: "US",
    crossBorder: true,
  },
  {
    id: 13,
    acquirer: "KKR Funds",
    target: "HealthSystems Ltd",
    value: 17.8,
    type: "LBO",
    status: "Closed",
    premium: 35,
    industry: "Healthcare",
    announced: "2025-02",
    regulatory: "2025-06",
    closed: "2025-08",
    origin: "US",
    destination: "US",
    crossBorder: false,
  },
  {
    id: 14,
    acquirer: "AutoFuture AG",
    target: "ElectroDrive Inc",
    value: 31.5,
    type: "Merger",
    status: "Pending",
    premium: 48,
    industry: "Automotive",
    announced: "2026-01",
    regulatory: "2026-05",
    closed: "2026-11",
    origin: "DE",
    destination: "US",
    crossBorder: true,
  },
  {
    id: 15,
    acquirer: "ReInsurance Group",
    target: "PropCasualty Ins",
    value: 11.4,
    type: "Acquisition",
    status: "Closed",
    premium: 21,
    industry: "Insurance",
    announced: "2025-05",
    regulatory: "2025-08",
    closed: "2025-11",
    origin: "US",
    destination: "US",
    crossBorder: false,
  },
];

const COMPS: CompComp[] = [
  { name: "TechPeer A", evRevenue: 8.2, evEbitda: 22.4, peRatio: 31.2, revenue: 4.1, ebitda: 1.5 },
  { name: "TechPeer B", evRevenue: 6.8, evEbitda: 19.7, peRatio: 27.4, revenue: 6.3, ebitda: 2.2 },
  { name: "TechPeer C", evRevenue: 9.4, evEbitda: 25.1, peRatio: 38.9, revenue: 3.2, ebitda: 1.2 },
  { name: "TechPeer D", evRevenue: 7.1, evEbitda: 21.3, peRatio: 29.8, revenue: 5.8, ebitda: 1.9 },
  { name: "TechPeer E", evRevenue: 11.2, evEbitda: 28.7, peRatio: 44.3, revenue: 2.7, ebitda: 1.1 },
  { name: "TechPeer F", evRevenue: 5.9, evEbitda: 17.8, peRatio: 24.1, revenue: 7.4, ebitda: 2.5 },
  { name: "TechPeer G", evRevenue: 8.8, evEbitda: 23.9, peRatio: 34.5, revenue: 3.9, ebitda: 1.4 },
  { name: "TechPeer H", evRevenue: 10.1, evEbitda: 26.4, peRatio: 41.7, revenue: 2.9, ebitda: 1.0 },
];

const PRECEDENTS: PrecedentTx[] = [
  { name: "TechCo / MegaSoft (2023)", year: 2023, premium: 42, evRevenue: 10.4, evEbitda: 26.8 },
  { name: "DataSys / CloudPeak (2022)", year: 2022, premium: 38, evRevenue: 9.2, evEbitda: 24.3 },
  { name: "AIVision / SearchCo (2024)", year: 2024, premium: 51, evRevenue: 13.1, evEbitda: 31.5 },
  { name: "PlatformX / MobileDev (2022)", year: 2022, premium: 33, evRevenue: 8.7, evEbitda: 22.9 },
  { name: "EnterpriseOS / CRM Corp (2023)", year: 2023, premium: 45, evRevenue: 11.3, evEbitda: 28.2 },
  { name: "NetCloud / StorageTech (2021)", year: 2021, premium: 29, evRevenue: 7.8, evEbitda: 20.7 },
  { name: "CyberSec / FirewallCo (2024)", year: 2024, premium: 48, evRevenue: 12.6, evEbitda: 29.8 },
  { name: "Analytics / InsightAI (2023)", year: 2023, premium: 37, evRevenue: 9.9, evEbitda: 25.6 },
];

const LBO_TARGETS: LBOTarget[] = [
  { name: "RetailChain Corp", revenue: 3.2, ebitda: 0.48, ebitdaMargin: 15, netDebt: 0.3, industry: "Retail" },
  { name: "HealthClinics Inc", revenue: 1.8, ebitda: 0.36, ebitdaMargin: 20, netDebt: 0.1, industry: "Healthcare" },
  { name: "InfraAssets Ltd", revenue: 2.5, ebitda: 0.63, ebitdaMargin: 25, netDebt: 0.5, industry: "Infrastructure" },
  { name: "FoodMfg Group", revenue: 4.1, ebitda: 0.74, ebitdaMargin: 18, netDebt: 0.8, industry: "Consumer" },
  { name: "SoftwareSub Co", revenue: 0.9, ebitda: 0.27, ebitdaMargin: 30, netDebt: 0.0, industry: "Technology" },
];

const MA_ADVISORY: LeagueEntry[] = [
  { rank: 1, bank: "Goldman Sachs", deals: 143, value: 892, share: 24.1, fees: 4460 },
  { rank: 2, bank: "Morgan Stanley", deals: 128, value: 743, share: 20.1, fees: 3715 },
  { rank: 3, bank: "JPMorgan", deals: 119, value: 698, share: 18.9, fees: 3490 },
  { rank: 4, bank: "Lazard", deals: 104, value: 512, share: 13.8, fees: 2560 },
  { rank: 5, bank: "Evercore", deals: 97, value: 447, share: 12.1, fees: 2235 },
  { rank: 6, bank: "Citi", deals: 88, value: 389, share: 10.5, fees: 1945 },
  { rank: 7, bank: "Bank of America", deals: 81, value: 342, share: 9.2, fees: 1710 },
  { rank: 8, bank: "Deutsche Bank", deals: 74, value: 298, share: 8.1, fees: 1490 },
  { rank: 9, bank: "Barclays", deals: 67, value: 261, share: 7.1, fees: 1305 },
  { rank: 10, bank: "UBS", deals: 58, value: 214, share: 5.8, fees: 1070 },
];

const ECM_LEAGUE: LeagueEntry[] = [
  { rank: 1, bank: "Goldman Sachs", deals: 89, value: 412, share: 21.3, fees: 2060 },
  { rank: 2, bank: "JPMorgan", deals: 82, value: 378, share: 19.5, fees: 1890 },
  { rank: 3, bank: "Morgan Stanley", deals: 76, value: 341, share: 17.6, fees: 1705 },
  { rank: 4, bank: "Bank of America", deals: 61, value: 274, share: 14.2, fees: 1370 },
  { rank: 5, bank: "Citi", deals: 54, value: 238, share: 12.3, fees: 1190 },
  { rank: 6, bank: "Barclays", deals: 47, value: 198, share: 10.2, fees: 990 },
  { rank: 7, bank: "UBS", deals: 41, value: 172, share: 8.9, fees: 860 },
  { rank: 8, bank: "Deutsche Bank", deals: 36, value: 148, share: 7.6, fees: 740 },
  { rank: 9, bank: "Credit Suisse", deals: 29, value: 119, share: 6.2, fees: 595 },
  { rank: 10, bank: "Jefferies", deals: 24, value: 94, share: 4.9, fees: 470 },
];

const DCM_LEAGUE: LeagueEntry[] = [
  { rank: 1, bank: "JPMorgan", deals: 312, value: 1842, share: 18.7, fees: 5526 },
  { rank: 2, bank: "Bank of America", deals: 287, value: 1678, share: 17.1, fees: 5034 },
  { rank: 3, bank: "Citi", deals: 264, value: 1534, share: 15.6, fees: 4602 },
  { rank: 4, bank: "Goldman Sachs", deals: 241, value: 1389, share: 14.1, fees: 4167 },
  { rank: 5, bank: "Morgan Stanley", deals: 218, value: 1245, share: 12.7, fees: 3735 },
  { rank: 6, bank: "Barclays", deals: 187, value: 1073, share: 10.9, fees: 3219 },
  { rank: 7, bank: "Deutsche Bank", deals: 162, value: 927, share: 9.4, fees: 2781 },
  { rank: 8, bank: "Wells Fargo", deals: 143, value: 812, share: 8.3, fees: 2436 },
  { rank: 9, bank: "UBS", deals: 124, value: 698, share: 7.1, fees: 2094 },
  { rank: 10, bank: "BNP Paribas", deals: 108, value: 601, share: 6.1, fees: 1803 },
];

const REGULATORY_OUTCOMES = [
  { deal: "Microsoft / Activision", year: 2023, regulator: "FTC / EU", outcome: "Cleared", hhi: 287, note: "Cleared after remedies (cloud gaming license)" },
  { deal: "Adobe / Figma", year: 2023, regulator: "EU CMA", outcome: "Blocked", hhi: 2840, note: "Blocked — design tools monopoly concern" },
  { deal: "NVIDIA / ARM", year: 2022, regulator: "FTC / EU / UK", outcome: "Abandoned", hhi: 1920, note: "Parties abandoned under regulatory pressure" },
  { deal: "Amazon / MGM", year: 2022, regulator: "FTC", outcome: "Cleared", hhi: 412, note: "Cleared after FTC investigation" },
  { deal: "Broadcom / VMware", year: 2023, regulator: "EU / US", outcome: "Cleared", hhi: 876, note: "Cleared with interoperability commitments" },
  { deal: "UnitedHealth / Change", year: 2022, regulator: "DOJ", outcome: "Cleared", hhi: 1340, note: "Cleared after DOJ review" },
  { deal: "Spirit / Frontier", year: 2023, regulator: "DOJ", outcome: "Blocked", hhi: 2210, note: "DOJ blocked — low-cost carrier competition" },
  { deal: "Kroger / Albertsons", year: 2024, regulator: "FTC", outcome: "Blocked", hhi: 2680, note: "FTC blocked grocery chain merger" },
];

const IB_COMPENSATION = [
  { title: "Analyst 1", base: 110000, bonus: 55000, total: 165000 },
  { title: "Analyst 2", base: 120000, bonus: 75000, total: 195000 },
  { title: "Analyst 3", base: 130000, bonus: 95000, total: 225000 },
  { title: "Associate 1", base: 175000, bonus: 120000, total: 295000 },
  { title: "Associate 2", base: 185000, bonus: 150000, total: 335000 },
  { title: "Associate 3", base: 195000, bonus: 185000, total: 380000 },
  { title: "VP", base: 225000, bonus: 300000, total: 525000 },
  { title: "Director / ED", base: 275000, bonus: 550000, total: 825000 },
  { title: "MD", base: 350000, bonus: 1200000, total: 1550000 },
];

// ── Utility ────────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

function fmtB(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}T`;
  if (n >= 1) return `$${n.toFixed(1)}B`;
  return `$${(n * 1000).toFixed(0)}M`;
}

function fmtM(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`;
  return `$${n.toFixed(0)}M`;
}

function statusColor(s: DealStatus): string {
  return s === "Closed"
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : s === "Pending"
    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
    : "bg-red-500/20 text-red-400 border-red-500/30";
}

function typeColor(t: DealType): string {
  const m: Record<DealType, string> = {
    Acquisition: "bg-primary/20 text-primary border-border",
    Merger: "bg-primary/20 text-primary border-border",
    LBO: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Spinoff: "bg-teal-500/20 text-emerald-400 border-teal-500/30",
  };
  return m[t];
}

function outcomeColor(o: string): string {
  if (o === "Cleared") return "bg-emerald-500/20 text-emerald-400";
  if (o === "Blocked") return "bg-red-500/20 text-red-400";
  return "bg-amber-500/20 text-amber-400";
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function IBDealsPage() {
  // Tab 1 filters
  const [filterType, setFilterType] = useState<DealType | "All">("All");
  const [filterStatus, setFilterStatus] = useState<DealStatus | "All">("All");
  const [filterSize, setFilterSize] = useState<"All" | ">1B" | ">5B" | ">10B">("All");

  // Tab 2 deal builder
  const [selectedTarget, setSelectedTarget] = useState<string>("TechPeer A");
  const [offerPremium, setOfferPremium] = useState<number>(30);
  const [cashMix, setCashMix] = useState<number>(60); // % cash
  const [acquirerShares, setAcquirerShares] = useState<number>(500); // M shares
  const [acquirerEPS, setAcquirerEPS] = useState<number>(8.5);
  const [synergiesInput, setSynergiesInput] = useState<number>(200); // $M

  // Tab 5 LBO
  const [lboTarget, setLboTarget] = useState<string>("RetailChain Corp");
  const [entryMultiple, setEntryMultiple] = useState<number>(10);
  const [leverage, setLeverage] = useState<number>(5.5);
  const [exitMultiple, setExitMultiple] = useState<number>(11);
  const [holdPeriod, setHoldPeriod] = useState<number>(5);
  const [interestRate, setInterestRate] = useState<number>(7.5);

  // Tab 6 league table tab
  const [leagueTab, setLeagueTab] = useState<"advisory" | "ecm" | "dcm">("advisory");

  // ── Tab 1: Filtered deals ──────────────────────────────────────────────────
  const filteredDeals = useMemo(() => {
    return MA_DEALS.filter((d) => {
      if (filterType !== "All" && d.type !== filterType) return false;
      if (filterStatus !== "All" && d.status !== filterStatus) return false;
      if (filterSize === ">1B" && d.value < 1) return false;
      if (filterSize === ">5B" && d.value < 5) return false;
      if (filterSize === ">10B" && d.value < 10) return false;
      return true;
    });
  }, [filterType, filterStatus, filterSize]);

  // ── Tab 1: YTD volume by quarter (simulated) ───────────────────────────────
  const quarterlyVolume = useMemo(() => {
    resetSeed(97);
    return [
      { q: "Q1 2025", vol: 420 + rand() * 80 },
      { q: "Q2 2025", vol: 510 + rand() * 90 },
      { q: "Q3 2025", vol: 380 + rand() * 70 },
      { q: "Q4 2025", vol: 620 + rand() * 100 },
      { q: "Q1 2026", vol: 290 + rand() * 60 },
    ];
  }, []);

  // ── Tab 2: Deal structuring calcs ─────────────────────────────────────────
  const dealCalcs = useMemo(() => {
    const comp = COMPS.find((c) => c.name === selectedTarget);
    if (!comp) return null;
    const targetEV = comp.evEbitda * comp.ebitda; // base EV ($B)
    const impliedEquity = targetEV - comp.ebitda * 0.5; // rough equity = EV - net debt proxy
    const offeredEquity = impliedEquity * (1 + offerPremium / 100);
    const offeredEV = offeredEquity + comp.ebitda * 0.5;
    const impliedEvEbitda = offeredEV / comp.ebitda;
    const impliedEvRevenue = offeredEV / comp.revenue;
    const impliedPE = offeredEquity / (comp.ebitda * 0.6); // net income proxy

    // Accretion/dilution
    const cashPortion = offeredEquity * (cashMix / 100); // $B
    const stockPortion = offeredEquity * ((100 - cashMix) / 100); // $B
    const newSharesIssued = (stockPortion * 1000) / (acquirerShares * acquirerEPS * 0.015); // M
    const targetNetIncome = comp.ebitda * 0.6; // $B proxy
    const combinedNetIncome = acquirerShares * acquirerEPS * 1e-3 + targetNetIncome; // $B
    const combinedShares = acquirerShares + newSharesIssued; // M
    const combinedEPS = (combinedNetIncome * 1000) / combinedShares;
    const epsChange = ((combinedEPS - acquirerEPS) / acquirerEPS) * 100;
    const accretive = epsChange > 0;

    // Required synergies for breakeven
    const purchasePriceExcess = (offeredEquity - impliedEquity) * 1000; // $M
    const requiredSynergies = purchasePriceExcess * 0.4; // rough after-tax

    // Debt capacity
    const targetDebtCapacity = comp.ebitda * leverage * 1000; // $M (reuse leverage from LBO tab here is conceptual)
    const debtFinancing = Math.min(cashPortion * 1000, comp.ebitda * 4 * 1000); // $M
    const equityFinancing = cashPortion * 1000 - debtFinancing; // $M

    return {
      offeredEquity,
      offeredEV,
      impliedEvEbitda,
      impliedEvRevenue,
      impliedPE,
      newSharesIssued,
      combinedEPS,
      epsChange,
      accretive,
      requiredSynergies,
      targetDebtCapacity,
      debtFinancing,
      equityFinancing,
      comp,
    };
  }, [selectedTarget, offerPremium, cashMix, acquirerShares, acquirerEPS, leverage]);

  // ── Tab 3: Valuation ranges ────────────────────────────────────────────────
  const valuationRanges = useMemo(() => {
    const comp = COMPS.find((c) => c.name === selectedTarget);
    if (!comp) return null;
    const targetEbitda = comp.ebitda;
    const targetRevenue = comp.revenue;

    // Comps range
    const evEbitdaValues = COMPS.map((c) => c.evEbitda).sort((a, b) => a - b);
    const compsLow = (evEbitdaValues[1] * targetEbitda).toFixed(1);
    const compsHigh = (evEbitdaValues[6] * targetEbitda).toFixed(1);

    // Precedents range
    const precEvEbitda = PRECEDENTS.map((p) => p.evEbitda).sort((a, b) => a - b);
    const precLow = (precEvEbitda[1] * targetEbitda).toFixed(1);
    const precHigh = (precEvEbitda[6] * targetEbitda).toFixed(1);

    // DCF range (simplified)
    const fcf = targetEbitda * 0.55;
    const waccLow = 0.08;
    const waccHigh = 0.12;
    const tgLow = 0.02;
    const tgHigh = 0.04;
    const dcfLow = ((fcf * 1.03 * (1 - Math.pow(1 + waccHigh, -5))) / (waccHigh - 0.03) +
      (fcf * Math.pow(1.03, 5) * (1 + tgLow)) / ((waccHigh - tgLow) * Math.pow(1 + waccHigh, 5))).toFixed(1);
    const dcfHigh = ((fcf * 1.03 * (1 - Math.pow(1 + waccLow, -5))) / (waccLow - 0.03) +
      (fcf * Math.pow(1.03, 5) * (1 + tgHigh)) / ((waccLow - tgHigh) * Math.pow(1 + waccLow, 5))).toFixed(1);

    const offeredEV = dealCalcs?.offeredEV ?? 0;
    const allLow = Math.min(parseFloat(compsLow), parseFloat(precLow), parseFloat(dcfLow));
    const allHigh = Math.max(parseFloat(compsHigh), parseFloat(precHigh), parseFloat(dcfHigh));
    const inRange = offeredEV >= allLow * 0.95 && offeredEV <= allHigh * 1.05;

    return {
      compsLow: parseFloat(compsLow),
      compsHigh: parseFloat(compsHigh),
      precLow: parseFloat(precLow),
      precHigh: parseFloat(precHigh),
      dcfLow: parseFloat(dcfLow),
      dcfHigh: parseFloat(dcfHigh),
      allLow,
      allHigh,
      offeredEV,
      inRange,
      targetRevenue,
    };
  }, [selectedTarget, dealCalcs]);

  // ── Tab 5: LBO model ───────────────────────────────────────────────────────
  const lboCalcs = useMemo(() => {
    const target = LBO_TARGETS.find((t) => t.name === lboTarget);
    if (!target) return null;

    const entryEV = target.ebitda * entryMultiple; // $B
    const totalDebt = target.ebitda * leverage; // $B
    const equityContribution = entryEV - totalDebt; // $B
    const annualInterest = totalDebt * (interestRate / 100); // $B

    // Debt paydown schedule (simple: free cash flow goes to debt)
    const fcf = target.ebitda * 0.55; // $B annual FCF
    const debtSchedule: { year: number; debt: number; equity: number }[] = [];
    let currentDebt = totalDebt;
    for (let y = 0; y <= holdPeriod; y++) {
      debtSchedule.push({ year: y, debt: currentDebt, equity: entryEV - currentDebt });
      if (y < holdPeriod) currentDebt = Math.max(0, currentDebt - fcf + annualInterest * 0.3);
    }

    // Exit scenarios
    const exitMultiples = [exitMultiple - 2, exitMultiple - 1, exitMultiple, exitMultiple + 1, exitMultiple + 2];
    const exitScenarios = exitMultiples.map((em) => {
      const exitEV = target.ebitda * em;
      const exitDebt = debtSchedule[holdPeriod].debt;
      const exitEquity = exitEV - exitDebt;
      const moic = exitEquity / equityContribution;
      const irr = Math.pow(moic, 1 / holdPeriod) - 1;
      return { multiple: em, exitEV, exitEquity, moic, irr: irr * 100 };
    });

    // Returns waterfall
    const baseExit = exitScenarios[2];
    const mgmtEquity = baseExit.exitEquity * 0.05;
    const peSponsor = baseExit.exitEquity * 0.8;
    const lpReturns = baseExit.exitEquity * 0.15;

    return {
      target,
      entryEV,
      totalDebt,
      equityContribution,
      annualInterest,
      fcf,
      debtSchedule,
      exitScenarios,
      mgmtEquity,
      peSponsor,
      lpReturns,
      baseExit,
    };
  }, [lboTarget, entryMultiple, leverage, exitMultiple, holdPeriod, interestRate]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <Briefcase className="text-primary" size={28} />
          <h1 className="text-2xl font-bold tracking-tight">Investment Banking Deal Simulator</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Live M&A tracker, deal structuring, fairness opinions, regulatory review, LBO models, and league tables.
        </p>
      </motion.div>

      <Tabs defaultValue="tracker" className="w-full">
        <TabsList className="bg-card border border-border flex flex-wrap gap-1 h-auto p-1 mb-6">
          {[
            { value: "tracker", label: "Live Deal Tracker" },
            { value: "structure", label: "Deal Structuring" },
            { value: "fairness", label: "Fairness Opinion" },
            { value: "regulatory", label: "Regulatory Review" },
            { value: "lbo", label: "LBO Analysis" },
            { value: "league", label: "League Tables" },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-foreground"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1: Live Deal Tracker ────────────────────────────────────────── */}
        <TabsContent value="tracker" className="data-[state=inactive]:hidden space-y-6">
          {/* Filters */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Deal Type</span>
                <div className="flex gap-1">
                  {(["All", "Acquisition", "Merger", "LBO", "Spinoff"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-colors",
                        filterType === t
                          ? "bg-primary border-primary text-foreground"
                          : "bg-muted border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <div className="flex gap-1">
                  {(["All", "Pending", "Closed", "Terminated"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterStatus(t)}
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-colors",
                        filterStatus === t
                          ? "bg-primary border-primary text-foreground"
                          : "bg-muted border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Deal Size</span>
                <div className="flex gap-1">
                  {(["All", ">1B", ">5B", ">10B"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterSize(t)}
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-colors",
                        filterSize === t
                          ? "bg-primary border-primary text-foreground"
                          : "bg-muted border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">
                {filteredDeals.length} deal{filteredDeals.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Deals table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                Announced M&A Deals
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr className="text-muted-foreground">
                    <th className="text-left px-4 py-2">Acquirer</th>
                    <th className="text-left px-4 py-2">Target</th>
                    <th className="text-right px-4 py-2">Value</th>
                    <th className="text-center px-4 py-2">Type</th>
                    <th className="text-center px-4 py-2">Status</th>
                    <th className="text-right px-4 py-2">Premium</th>
                    <th className="text-left px-4 py-2">Industry</th>
                    <th className="text-center px-4 py-2">Cross-Border</th>
                    <th className="text-left px-4 py-2">Announced</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((d, i) => (
                    <motion.tr
                      key={d.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-2 font-medium text-foreground">{d.acquirer}</td>
                      <td className="px-4 py-2 text-muted-foreground">{d.target}</td>
                      <td className="px-4 py-2 text-right font-semibold text-emerald-400">{fmtB(d.value)}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={cn("px-2 py-0.5 rounded text-xs border", typeColor(d.type))}>
                          {d.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={cn("px-2 py-0.5 rounded text-xs border", statusColor(d.status))}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-amber-400">
                        {d.premium > 0 ? `+${d.premium}%` : "—"}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{d.industry}</td>
                      <td className="px-4 py-2 text-center">
                        {d.crossBorder ? (
                          <span className="text-primary font-medium">{d.origin} → {d.destination}</span>
                        ) : (
                          <span className="text-muted-foreground">Domestic</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{d.announced}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Deal timelines */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-primary" />
              Deal Timeline: Announce → Regulatory → Close
            </h2>
            <svg width="100%" height={filteredDeals.slice(0, 8).length * 36 + 40} className="overflow-visible">
              {/* Axis labels */}
              {["Announce", "Regulatory", "Close"].map((label, li) => (
                <text key={label} x={li === 0 ? 160 : li === 1 ? 380 : 560} y={18} fill="#71717a" fontSize={10} textAnchor="middle">
                  {label}
                </text>
              ))}
              {filteredDeals.slice(0, 8).map((d, i) => {
                const y = i * 36 + 36;
                const stages: { label: string; x: number; color: string }[] = [
                  { label: d.announced, x: 160, color: "#60a5fa" },
                  { label: d.regulatory, x: 380, color: "#f59e0b" },
                  { label: d.closed, x: 560, color: d.status === "Closed" ? "#34d399" : d.status === "Terminated" ? "#f87171" : "#a78bfa" },
                ];
                return (
                  <g key={d.id}>
                    <text x={0} y={y + 5} fill="#a1a1aa" fontSize={9} dominantBaseline="middle">
                      {d.target.slice(0, 16)}
                    </text>
                    <line x1={140} y1={y + 5} x2={580} y2={y + 5} stroke="#27272a" strokeWidth={2} />
                    {stages.map((st, si) => (
                      <g key={si}>
                        <circle cx={st.x} cy={y + 5} r={5} fill={st.color} />
                        <text x={st.x} y={y + 16} fill="#71717a" fontSize={8} textAnchor="middle">
                          {st.label}
                        </text>
                      </g>
                    ))}
                    {d.status !== "Terminated" && (
                      <line x1={160} y1={y + 5} x2={d.status === "Closed" ? 560 : 380} y2={y + 5} stroke="#3f3f46" strokeWidth={2} />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* YTD bar chart + cross-border */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <DollarSign size={14} className="text-emerald-400" />
                Global M&A Volume YTD ($B)
              </h2>
              <svg width="100%" height={180} viewBox="0 0 300 180">
                {quarterlyVolume.map((q, i) => {
                  const maxVol = Math.max(...quarterlyVolume.map((x) => x.vol));
                  const barH = (q.vol / maxVol) * 130;
                  const x = 30 + i * 52;
                  return (
                    <g key={q.q}>
                      <rect
                        x={x}
                        y={160 - barH}
                        width={36}
                        height={barH}
                        fill="#3b82f6"
                        fillOpacity={0.7}
                        rx={2}
                      />
                      <text x={x + 18} y={175} fill="#71717a" fontSize={9} textAnchor="middle">
                        {q.q.split(" ")[0]}
                      </text>
                      <text x={x + 18} y={155 - barH} fill="#a1a1aa" fontSize={8} textAnchor="middle">
                        ${q.vol.toFixed(0)}B
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Globe size={14} className="text-primary" />
                Cross-Border Deal Origins
              </h2>
              {(() => {
                const crossBorderDeals = MA_DEALS.filter((d) => d.crossBorder);
                const byOrigin: Record<string, number> = {};
                crossBorderDeals.forEach((d) => {
                  byOrigin[d.origin] = (byOrigin[d.origin] ?? 0) + d.value;
                });
                const maxVal = Math.max(...Object.values(byOrigin));
                return (
                  <div className="space-y-2">
                    {Object.entries(byOrigin)
                      .sort(([, a], [, b]) => b - a)
                      .map(([country, vol]) => (
                        <div key={country} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-8">{country}</span>
                          <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(vol / maxVal) * 100}%` }}
                              transition={{ duration: 0.6 }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">{fmtB(vol)}</span>
                        </div>
                      ))}
                    <p className="text-xs text-muted-foreground mt-2">
                      {crossBorderDeals.length} cross-border deals of {MA_DEALS.length} total
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Deal Structuring ─────────────────────────────────────────── */}
        <TabsContent value="structure" className="data-[state=inactive]:hidden space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Target size={14} className="text-primary" />
                Deal Builder
              </h2>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Target Company</label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full bg-muted border border-border text-sm rounded px-2 py-1.5 text-foreground"
                >
                  {COMPS.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {dealCalcs && (
                <div className="bg-muted/50 rounded p-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="text-foreground">{fmtB(dealCalcs.comp.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EBITDA</span>
                    <span className="text-foreground">{fmtB(dealCalcs.comp.ebitda)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EV/EBITDA (market)</span>
                    <span className="text-foreground">{dealCalcs.comp.evEbitda}×</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Offer Premium: <span className="text-foreground">{offerPremium}%</span>
                </label>
                <Slider
                  min={0} max={50} step={1}
                  value={[offerPremium]}
                  onValueChange={([v]) => setOfferPremium(v)}
                  className="my-2"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Cash Mix: <span className="text-foreground">{cashMix}% Cash / {100 - cashMix}% Stock</span>
                </label>
                <Slider
                  min={0} max={100} step={5}
                  value={[cashMix]}
                  onValueChange={([v]) => setCashMix(v)}
                  className="my-2"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Acquirer Shares Outstanding: <span className="text-foreground">{acquirerShares}M</span>
                </label>
                <Slider
                  min={100} max={2000} step={50}
                  value={[acquirerShares]}
                  onValueChange={([v]) => setAcquirerShares(v)}
                  className="my-2"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Acquirer EPS: <span className="text-foreground">${acquirerEPS.toFixed(2)}</span>
                </label>
                <Slider
                  min={1} max={20} step={0.5}
                  value={[acquirerEPS]}
                  onValueChange={([v]) => setAcquirerEPS(v)}
                  className="my-2"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Annual Synergies Input: <span className="text-foreground">${synergiesInput}M</span>
                </label>
                <Slider
                  min={0} max={1000} step={25}
                  value={[synergiesInput]}
                  onValueChange={([v]) => setSynergiesInput(v)}
                  className="my-2"
                />
              </div>
            </div>

            {/* Output metrics */}
            {dealCalcs && (
              <div className="lg:col-span-2 space-y-4">
                {/* Key metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Offer EV", value: fmtB(dealCalcs.offeredEV), color: "text-primary" },
                    { label: "Offer Equity", value: fmtB(dealCalcs.offeredEquity), color: "text-emerald-400" },
                    { label: "EV/EBITDA (offer)", value: `${fmt(dealCalcs.impliedEvEbitda)}×`, color: "text-amber-400" },
                    { label: "EV/Revenue (offer)", value: `${fmt(dealCalcs.impliedEvRevenue)}×`, color: "text-primary" },
                    { label: "P/E (offer)", value: `${fmt(dealCalcs.impliedPE)}×`, color: "text-muted-foreground" },
                    { label: "New Shares Issued", value: `${fmt(dealCalcs.newSharesIssued, 0)}M`, color: "text-muted-foreground" },
                  ].map((m) => (
                    <div key={m.label} className="bg-card border border-border rounded-xl p-3">
                      <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                      <div className={cn("text-lg font-bold", m.color)}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Accretion/Dilution */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    {dealCalcs.accretive ? (
                      <TrendingUp size={14} className="text-emerald-400" />
                    ) : (
                      <TrendingDown size={14} className="text-red-400" />
                    )}
                    Accretion / Dilution Analysis
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Standalone EPS</div>
                      <div className="text-sm font-semibold text-foreground">${fmt(acquirerEPS, 2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Combined EPS</div>
                      <div className="text-sm font-semibold text-foreground">${fmt(dealCalcs.combinedEPS, 2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">EPS Change</div>
                      <div className={cn("text-sm font-bold", dealCalcs.accretive ? "text-emerald-400" : "text-red-400")}>
                        {dealCalcs.epsChange > 0 ? "+" : ""}{fmt(dealCalcs.epsChange, 2)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Verdict</div>
                      <span className={cn("px-2 py-0.5 rounded text-xs font-bold", dealCalcs.accretive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                        {dealCalcs.accretive ? "ACCRETIVE" : "DILUTIVE"}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground">
                      Required synergies to break even:{" "}
                      <span className="text-amber-400 font-semibold">${fmt(dealCalcs.requiredSynergies, 0)}M</span>
                      {" "}vs. your synergy input of{" "}
                      <span className={cn("font-semibold", synergiesInput >= dealCalcs.requiredSynergies ? "text-emerald-400" : "text-red-400")}>
                        ${synergiesInput}M
                      </span>
                      {" "}— {synergiesInput >= dealCalcs.requiredSynergies ? "Deal justified by synergies" : "Insufficient synergies to justify premium"}
                    </p>
                  </div>
                </div>

                {/* Financing structure */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <DollarSign size={14} className="text-primary" />
                    Financing Structure
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="bg-muted/50 rounded p-2">
                      <div className="text-xs text-muted-foreground">Cash Consideration</div>
                      <div className="text-sm font-semibold text-foreground">{fmtB(dealCalcs.offeredEquity * cashMix / 100)}</div>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <div className="text-xs text-muted-foreground">Stock Consideration</div>
                      <div className="text-sm font-semibold text-foreground">{fmtB(dealCalcs.offeredEquity * (100 - cashMix) / 100)}</div>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <div className="text-xs text-muted-foreground">Debt Financing</div>
                      <div className="text-sm font-semibold text-primary">{fmtM(dealCalcs.debtFinancing)}</div>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <div className="text-xs text-muted-foreground">Equity Financing</div>
                      <div className="text-sm font-semibold text-primary">{fmtM(Math.max(0, dealCalcs.equityFinancing))}</div>
                    </div>
                  </div>
                  {/* Financing bar */}
                  <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                    <div
                      style={{ width: `${cashMix}%` }}
                      className="bg-primary transition-all duration-300"
                      title={`Cash: ${cashMix}%`}
                    />
                    <div
                      style={{ width: `${100 - cashMix}%` }}
                      className="bg-primary transition-all duration-300"
                      title={`Stock: ${100 - cashMix}%`}
                    />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span><span className="inline-block w-2 h-2 rounded-full bg-primary mr-1" />Cash {cashMix}%</span>
                    <span><span className="inline-block w-2 h-2 rounded-full bg-primary mr-1" />Stock {100 - cashMix}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab 3: Fairness Opinion ─────────────────────────────────────────── */}
        <TabsContent value="fairness" className="data-[state=inactive]:hidden space-y-6">
          {/* Comps */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Scale size={14} className="text-primary" />
              Comparable Company Analysis
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr className="text-muted-foreground">
                    <th className="text-left px-3 py-2">Company</th>
                    <th className="text-right px-3 py-2">Revenue ($B)</th>
                    <th className="text-right px-3 py-2">EBITDA ($B)</th>
                    <th className="text-right px-3 py-2">EV/Revenue</th>
                    <th className="text-right px-3 py-2">EV/EBITDA</th>
                    <th className="text-right px-3 py-2">P/E</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPS.map((c, i) => (
                    <tr key={c.name} className={cn("border-t border-border", c.name === selectedTarget ? "bg-muted/40" : "")}>
                      <td className="px-3 py-2 font-medium text-foreground flex items-center gap-1">
                        {c.name === selectedTarget && <span className="text-primary text-[11px]">TARGET</span>}
                        {c.name}
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{fmtB(c.revenue)}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{fmtB(c.ebitda)}</td>
                      <td className="px-3 py-2 text-right text-primary">{fmt(c.evRevenue)}×</td>
                      <td className="px-3 py-2 text-right text-emerald-400">{fmt(c.evEbitda)}×</td>
                      <td className="px-3 py-2 text-right text-amber-400">{fmt(c.peRatio)}×</td>
                    </tr>
                  ))}
                  {/* Median row */}
                  <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                    <td className="px-3 py-2 text-muted-foreground">Median</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">—</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">—</td>
                    <td className="px-3 py-2 text-right text-primary">
                      {fmt([...COMPS].sort((a, b) => a.evRevenue - b.evRevenue)[3].evRevenue)}×
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-400">
                      {fmt([...COMPS].sort((a, b) => a.evEbitda - b.evEbitda)[3].evEbitda)}×
                    </td>
                    <td className="px-3 py-2 text-right text-amber-400">
                      {fmt([...COMPS].sort((a, b) => a.peRatio - b.peRatio)[3].peRatio)}×
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Precedents */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <FileText size={14} className="text-primary" />
              Precedent Transaction Analysis
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr className="text-muted-foreground">
                    <th className="text-left px-3 py-2">Transaction</th>
                    <th className="text-right px-3 py-2">Year</th>
                    <th className="text-right px-3 py-2">Premium Paid</th>
                    <th className="text-right px-3 py-2">EV/Revenue</th>
                    <th className="text-right px-3 py-2">EV/EBITDA</th>
                  </tr>
                </thead>
                <tbody>
                  {PRECEDENTS.map((p) => (
                    <tr key={p.name} className="border-t border-border hover:bg-muted/20">
                      <td className="px-3 py-2 text-muted-foreground">{p.name}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{p.year}</td>
                      <td className="px-3 py-2 text-right text-amber-400">+{p.premium}%</td>
                      <td className="px-3 py-2 text-right text-primary">{fmt(p.evRevenue)}×</td>
                      <td className="px-3 py-2 text-right text-emerald-400">{fmt(p.evEbitda)}×</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Football Field SVG */}
          {valuationRanges && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <BarChart3 size={14} className="text-emerald-400" />
                Football Field — Implied Valuation Range ($B EV)
              </h2>
              <svg width="100%" height={160} viewBox="0 0 600 160">
                {(() => {
                  const { compsLow, compsHigh, precLow, precHigh, dcfLow, dcfHigh, offeredEV, allLow, allHigh } = valuationRanges;
                  const padding = (allHigh - allLow) * 0.15;
                  const lo = allLow - padding;
                  const hi = allHigh + padding;
                  const scale = (v: number) => 40 + ((v - lo) / (hi - lo)) * 520;

                  const rows = [
                    { label: "Comps Analysis", low: compsLow, high: compsHigh, color: "#3b82f6" },
                    { label: "Precedent Txns", low: precLow, high: precHigh, color: "#8b5cf6" },
                    { label: "DCF Analysis", low: dcfLow, high: dcfHigh, color: "#10b981" },
                  ];

                  return (
                    <>
                      {/* Grid lines */}
                      {[lo, (lo + hi) / 2, hi].map((v, i) => (
                        <g key={i}>
                          <line x1={scale(v)} y1={10} x2={scale(v)} y2={130} stroke="#27272a" strokeWidth={1} />
                          <text x={scale(v)} y={145} fill="#52525b" fontSize={9} textAnchor="middle">
                            ${v.toFixed(1)}B
                          </text>
                        </g>
                      ))}
                      {/* Bars */}
                      {rows.map((row, i) => {
                        const y = 20 + i * 35;
                        return (
                          <g key={row.label}>
                            <text x={35} y={y + 12} fill="#a1a1aa" fontSize={9} textAnchor="end">
                              {row.label}
                            </text>
                            <rect
                              x={scale(row.low)}
                              y={y}
                              width={scale(row.high) - scale(row.low)}
                              height={20}
                              fill={row.color}
                              fillOpacity={0.35}
                              rx={2}
                            />
                            <rect
                              x={scale(row.low)}
                              y={y}
                              width={2}
                              height={20}
                              fill={row.color}
                            />
                            <rect
                              x={scale(row.high) - 2}
                              y={y}
                              width={2}
                              height={20}
                              fill={row.color}
                            />
                            <text x={scale(row.low) - 2} y={y + 13} fill={row.color} fontSize={8} textAnchor="end">
                              ${row.low.toFixed(1)}B
                            </text>
                            <text x={scale(row.high) + 2} y={y + 13} fill={row.color} fontSize={8} textAnchor="start">
                              ${row.high.toFixed(1)}B
                            </text>
                          </g>
                        );
                      })}
                      {/* Offer price line */}
                      {offeredEV > lo && offeredEV < hi && (
                        <>
                          <line
                            x1={scale(offeredEV)}
                            y1={10}
                            x2={scale(offeredEV)}
                            y2={130}
                            stroke="#f59e0b"
                            strokeWidth={2}
                            strokeDasharray="4 2"
                          />
                          <text x={scale(offeredEV)} y={8} fill="#f59e0b" fontSize={8} textAnchor="middle">
                            Offer ${offeredEV.toFixed(1)}B
                          </text>
                        </>
                      )}
                    </>
                  );
                })()}
              </svg>

              {/* Board recommendation */}
              <div className={cn(
                "mt-4 p-3 rounded-lg border text-sm",
                valuationRanges.inRange
                  ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-300"
                  : "bg-red-900/20 border-red-500/30 text-red-300"
              )}>
                <div className="flex items-center gap-2 font-semibold mb-1">
                  {valuationRanges.inRange ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                  Board Recommendation
                </div>
                <p className="text-xs opacity-90">
                  {valuationRanges.inRange
                    ? `The offered EV of $${valuationRanges.offeredEV.toFixed(1)}B falls within or near the combined valuation range of $${valuationRanges.allLow.toFixed(1)}B–$${valuationRanges.allHigh.toFixed(1)}B. The board can issue a FAIRNESS OPINION supporting the transaction.`
                    : `The offered EV of $${valuationRanges.offeredEV.toFixed(1)}B falls outside the combined valuation range of $${valuationRanges.allLow.toFixed(1)}B–$${valuationRanges.allHigh.toFixed(1)}B. The board should seek a HIGHER OFFER or special committee review.`}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Tab 4: Regulatory Review ────────────────────────────────────────── */}
        <TabsContent value="regulatory" className="data-[state=inactive]:hidden space-y-6">
          {/* Timeline */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Shield size={14} className="text-amber-400" />
              Regulatory Review Timeline
            </h2>
            <div className="space-y-4">
              {[
                { regulator: "US DOJ / FTC (HSR Filing)", phase1: "30 days", phase2: "Additional 30-60 days", color: "#3b82f6" },
                { regulator: "EU European Commission", phase1: "25 working days (Phase I)", phase2: "90 working days (Phase II)", color: "#8b5cf6" },
                { regulator: "China SAMR", phase1: "30 days (Phase I)", phase2: "90 days (Phase II) + 60 ext", color: "#f59e0b" },
                { regulator: "UK CMA", phase1: "40 working days (Phase 1)", phase2: "24 weeks (Phase 2)", color: "#10b981" },
              ].map((reg, i) => (
                <div key={reg.regulator}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">{reg.regulator}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-muted rounded p-2">
                      <div className="text-[11px] text-muted-foreground mb-1">Phase 1</div>
                      <div className="text-xs text-foreground">{reg.phase1}</div>
                      <div
                        className="mt-1 h-1 rounded-full"
                        style={{ backgroundColor: reg.color, opacity: 0.7, width: "40%" }}
                      />
                    </div>
                    <div className="flex-1 bg-muted rounded p-2">
                      <div className="text-[11px] text-muted-foreground mb-1">Phase 2 (if triggered)</div>
                      <div className="text-xs text-foreground">{reg.phase2}</div>
                      <div
                        className="mt-1 h-1 rounded-full"
                        style={{ backgroundColor: reg.color, opacity: 0.4, width: "80%" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HHI Calculator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Percent size={14} className="text-red-400" />
                HHI Calculator (Herfindahl-Hirschman Index)
              </h2>
              {(() => {
                // Simulated market shares
                const companies = [
                  { name: "Acquirer", share: 18 },
                  { name: "Target", share: 14 },
                  { name: "Competitor A", share: 22 },
                  { name: "Competitor B", share: 16 },
                  { name: "Competitor C", share: 12 },
                  { name: "Others", share: 18 },
                ];
                const preHHI = companies.reduce((sum, c) => sum + c.share * c.share, 0);
                const postCompanies = [
                  { name: "Combined Entity", share: 32 },
                  { name: "Competitor A", share: 22 },
                  { name: "Competitor B", share: 16 },
                  { name: "Competitor C", share: 12 },
                  { name: "Others", share: 18 },
                ];
                const postHHI = postCompanies.reduce((sum, c) => sum + c.share * c.share, 0);
                const delta = postHHI - preHHI;
                const concern = postHHI > 2500 || (postHHI > 1500 && delta > 200);
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center bg-muted/50 rounded p-2">
                        <div className="text-xs text-muted-foreground">Pre-HHI</div>
                        <div className="text-lg font-bold text-foreground">{preHHI}</div>
                      </div>
                      <div className="text-center bg-muted/50 rounded p-2">
                        <div className="text-xs text-muted-foreground">Post-HHI</div>
                        <div className="text-lg font-bold text-red-400">{postHHI}</div>
                      </div>
                      <div className="text-center bg-muted/50 rounded p-2">
                        <div className="text-xs text-muted-foreground">Delta</div>
                        <div className="text-lg font-bold text-amber-400">+{delta}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Unconcentrated</span><span>Moderately</span><span>Highly</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{ width: `${(1500 / 10000) * 100}%` }} />
                        <div className="h-full bg-amber-500" style={{ width: `${((2500 - 1500) / 10000) * 100}%` }} />
                        <div className="h-full bg-red-500" style={{ width: `${((10000 - 2500) / 10000) * 100}%` }} />
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span><span className="text-emerald-400">■</span> &lt;1500: Safe</span>
                        <span><span className="text-amber-400">■</span> 1500-2500: Scrutiny</span>
                        <span><span className="text-red-400">■</span> &gt;2500: Concern</span>
                      </div>
                    </div>
                    <div className={cn("p-2 rounded text-xs", concern ? "bg-red-900/20 text-red-300" : "bg-emerald-900/20 text-emerald-300")}>
                      {concern
                        ? `Post-merger HHI of ${postHHI} (+${delta}) exceeds DOJ thresholds — antitrust review likely.`
                        : `HHI levels suggest limited antitrust concern. Deal likely to receive clearance.`}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Remedies */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Scale size={14} className="text-primary" />
                Potential Remedies
              </h2>
              <div className="space-y-2">
                {[
                  { remedy: "Divest overlapping product lines", type: "Structural", likelihood: "High" },
                  { remedy: "License key IP to competitors", type: "Behavioral", likelihood: "Medium" },
                  { remedy: "Firewall between combined entities", type: "Behavioral", likelihood: "Medium" },
                  { remedy: "Spin off a business segment", type: "Structural", likelihood: "High" },
                  { remedy: "Commit to supply agreements", type: "Behavioral", likelihood: "Low" },
                  { remedy: "Cap pricing for 5 years", type: "Behavioral", likelihood: "Low" },
                ].map((r, i) => (
                  <div key={i} className="flex items-start justify-between bg-muted/40 rounded p-2 gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-foreground">{r.remedy}</p>
                      <span className="text-[11px] text-muted-foreground">{r.type}</span>
                    </div>
                    <span className={cn("text-[11px] px-1.5 py-0.5 rounded",
                      r.likelihood === "High" ? "bg-red-500/20 text-red-400" :
                      r.likelihood === "Medium" ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground"
                    )}>
                      {r.likelihood}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Historical outcomes */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <FileText size={14} className="text-primary" />
              Historical Regulatory Outcomes
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr className="text-muted-foreground">
                    <th className="text-left px-3 py-2">Deal</th>
                    <th className="text-right px-3 py-2">Year</th>
                    <th className="text-left px-3 py-2">Regulator</th>
                    <th className="text-center px-3 py-2">Outcome</th>
                    <th className="text-right px-3 py-2">Post-HHI</th>
                    <th className="text-left px-3 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {REGULATORY_OUTCOMES.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 font-medium text-foreground">{r.deal}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{r.year}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.regulator}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={cn("px-2 py-0.5 rounded text-xs", outcomeColor(r.outcome))}>
                          {r.outcome}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{r.hhi}</td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 5: LBO Analysis ─────────────────────────────────────────────── */}
        <TabsContent value="lbo" className="data-[state=inactive]:hidden space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* LBO controls */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Building2 size={14} className="text-orange-400" />
                LBO Model Inputs
              </h2>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Target Company</label>
                <select
                  value={lboTarget}
                  onChange={(e) => setLboTarget(e.target.value)}
                  className="w-full bg-muted border border-border text-sm rounded px-2 py-1.5 text-foreground"
                >
                  {LBO_TARGETS.map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              {lboCalcs && (
                <div className="bg-muted/50 rounded p-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="text-foreground">{fmtB(lboCalcs.target.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EBITDA</span>
                    <span className="text-foreground">{fmtB(lboCalcs.target.ebitda)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EBITDA Margin</span>
                    <span className="text-foreground">{lboCalcs.target.ebitdaMargin}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="text-foreground">{lboCalcs.target.industry}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Entry Multiple: <span className="text-foreground">{entryMultiple}× EBITDA</span>
                </label>
                <Slider min={6} max={16} step={0.5} value={[entryMultiple]} onValueChange={([v]) => setEntryMultiple(v)} className="my-2" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Leverage: <span className="text-foreground">{leverage}× EBITDA</span>
                </label>
                <Slider min={3} max={8} step={0.25} value={[leverage]} onValueChange={([v]) => setLeverage(v)} className="my-2" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Exit Multiple: <span className="text-foreground">{exitMultiple}× EBITDA</span>
                </label>
                <Slider min={6} max={18} step={0.5} value={[exitMultiple]} onValueChange={([v]) => setExitMultiple(v)} className="my-2" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Hold Period: <span className="text-foreground">{holdPeriod} years</span>
                </label>
                <Slider min={3} max={8} step={1} value={[holdPeriod]} onValueChange={([v]) => setHoldPeriod(v)} className="my-2" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Interest Rate: <span className="text-foreground">{interestRate}%</span>
                </label>
                <Slider min={4} max={14} step={0.25} value={[interestRate]} onValueChange={([v]) => setInterestRate(v)} className="my-2" />
              </div>
            </div>

            {/* LBO output */}
            {lboCalcs && (
              <div className="lg:col-span-2 space-y-4">
                {/* Summary metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Entry EV", value: fmtB(lboCalcs.entryEV), color: "text-primary" },
                    { label: "Total Debt", value: fmtB(lboCalcs.totalDebt), color: "text-red-400" },
                    { label: "Equity Contribution", value: fmtB(lboCalcs.equityContribution), color: "text-emerald-400" },
                    { label: "Annual FCF", value: fmtB(lboCalcs.fcf), color: "text-amber-400" },
                  ].map((m) => (
                    <div key={m.label} className="bg-card border border-border rounded-xl p-3">
                      <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                      <div className={cn("text-lg font-bold", m.color)}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Exit scenarios table */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    Returns at Different Exit Scenarios
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr className="text-muted-foreground">
                          <th className="text-center px-3 py-2">Exit Multiple</th>
                          <th className="text-right px-3 py-2">Exit EV</th>
                          <th className="text-right px-3 py-2">Exit Equity</th>
                          <th className="text-right px-3 py-2">MOIC</th>
                          <th className="text-right px-3 py-2">IRR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lboCalcs.exitScenarios.map((sc, i) => (
                          <tr key={i} className={cn("border-t border-border", i === 2 ? "bg-emerald-900/10 font-semibold" : "")}>
                            <td className="px-3 py-2 text-center text-foreground">
                              {sc.multiple}×{i === 2 && <span className="text-emerald-400 ml-1 text-[11px]">BASE</span>}
                            </td>
                            <td className="px-3 py-2 text-right text-muted-foreground">{fmtB(sc.exitEV)}</td>
                            <td className="px-3 py-2 text-right text-muted-foreground">{fmtB(sc.exitEquity)}</td>
                            <td className={cn("px-3 py-2 text-right font-semibold", sc.moic >= 2 ? "text-emerald-400" : sc.moic >= 1.5 ? "text-amber-400" : "text-red-400")}>
                              {fmt(sc.moic, 2)}×
                            </td>
                            <td className={cn("px-3 py-2 text-right font-semibold", sc.irr >= 20 ? "text-emerald-400" : sc.irr >= 15 ? "text-amber-400" : "text-red-400")}>
                              {fmt(sc.irr, 1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Debt schedule SVG */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 size={14} className="text-primary" />
                    Debt Paydown Schedule ($B)
                  </h3>
                  <svg width="100%" height={150} viewBox="0 0 360 150">
                    {lboCalcs.debtSchedule.map((pt, i) => {
                      const maxEV = lboCalcs.entryEV;
                      const barH = (pt.debt / maxEV) * 110;
                      const eqH = ((maxEV - pt.debt) / maxEV) * 110;
                      const x = 20 + i * (300 / (holdPeriod + 1));
                      const barW = 30;
                      return (
                        <g key={pt.year}>
                          <rect x={x} y={120 - barH} width={barW} height={barH} fill="#ef4444" fillOpacity={0.6} rx={2} />
                          <rect x={x} y={120 - barH - eqH} width={barW} height={eqH} fill="#10b981" fillOpacity={0.6} rx={2} />
                          <text x={x + barW / 2} y={135} fill="#71717a" fontSize={9} textAnchor="middle">Yr {pt.year}</text>
                          <text x={x + barW / 2} y={115 - barH} fill="#a1a1aa" fontSize={7} textAnchor="middle">
                            ${pt.debt.toFixed(1)}B
                          </text>
                        </g>
                      );
                    })}
                    <line x1={10} y1={120} x2={350} y2={120} stroke="#3f3f46" strokeWidth={1} />
                    <g>
                      <rect x={10} y={5} width={8} height={8} fill="#ef4444" fillOpacity={0.6} />
                      <text x={22} y={13} fill="#a1a1aa" fontSize={8}>Debt</text>
                      <rect x={60} y={5} width={8} height={8} fill="#10b981" fillOpacity={0.6} />
                      <text x={72} y={13} fill="#a1a1aa" fontSize={8}>Equity</text>
                    </g>
                  </svg>
                </div>

                {/* Returns waterfall */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Award size={14} className="text-amber-400" />
                    Sponsor Returns Waterfall (Base Case)
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: "Management Equity (5%)", value: lboCalcs.mgmtEquity, color: "bg-amber-500" },
                      { label: "PE Sponsor (80%)", value: lboCalcs.peSponsor, color: "bg-primary" },
                      { label: "LP Returns (15%)", value: lboCalcs.lpReturns, color: "bg-primary" },
                    ].map((item) => {
                      const total = lboCalcs.baseExit.exitEquity;
                      const pct = (item.value / total) * 100;
                      return (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-48">{item.label}</span>
                          <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6 }}
                              className={cn("h-full rounded-full", item.color)}
                            />
                          </div>
                          <span className="text-xs font-semibold text-foreground w-20 text-right">{fmtB(item.value)}</span>
                        </div>
                      );
                    })}
                    <div className="border-t border-border pt-2 flex justify-between text-xs text-muted-foreground">
                      <span>Total Exit Equity</span>
                      <span className="text-foreground font-semibold">{fmtB(lboCalcs.baseExit.exitEquity)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Base Case MOIC / IRR</span>
                      <span className="text-emerald-400 font-semibold">
                        {fmt(lboCalcs.baseExit.moic, 2)}× MOIC / {fmt(lboCalcs.baseExit.irr, 1)}% IRR
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab 6: League Tables ────────────────────────────────────────────── */}
        <TabsContent value="league" className="data-[state=inactive]:hidden space-y-6">
          {/* Sub-tabs for league type */}
          <div className="flex gap-2">
            {[
              { key: "advisory" as const, label: "M&A Advisory" },
              { key: "ecm" as const, label: "ECM" },
              { key: "dcm" as const, label: "DCM" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setLeagueTab(t.key)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded border transition-colors",
                  leagueTab === t.key
                    ? "bg-primary border-primary text-foreground"
                    : "bg-muted border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* League table */}
          <AnimatePresence mode="wait">
            <motion.div
              key={leagueTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center gap-2">
                <Award size={14} className="text-amber-400" />
                <h2 className="font-semibold text-sm">
                  {leagueTab === "advisory" ? "M&A Advisory" : leagueTab === "ecm" ? "Equity Capital Markets" : "Debt Capital Markets"} — Top 10 Banks (2025 YTD)
                </h2>
              </div>
              {(() => {
                const data = leagueTab === "advisory" ? MA_ADVISORY : leagueTab === "ecm" ? ECM_LEAGUE : DCM_LEAGUE;
                const maxValue = Math.max(...data.map((d) => d.value));
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr className="text-muted-foreground">
                          <th className="text-center px-4 py-2 w-10">Rank</th>
                          <th className="text-left px-4 py-2">Bank</th>
                          <th className="text-right px-4 py-2">Deals</th>
                          <th className="text-right px-4 py-2">Volume ($B)</th>
                          <th className="text-left px-4 py-4 w-40">Share</th>
                          <th className="text-right px-4 py-2">Est. Fees</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((entry, i) => (
                          <motion.tr
                            key={entry.bank}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="border-t border-border hover:bg-muted/20"
                          >
                            <td className="px-4 py-2 text-center">
                              <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto",
                                i === 0 ? "bg-amber-500/20 text-amber-400" :
                                i === 1 ? "bg-muted-foreground/20 text-muted-foreground" :
                                i === 2 ? "bg-orange-600/20 text-orange-400" :
                                "bg-muted text-muted-foreground"
                              )}>
                                {entry.rank}
                              </span>
                            </td>
                            <td className="px-4 py-2 font-medium text-foreground">{entry.bank}</td>
                            <td className="px-4 py-2 text-right text-muted-foreground">{entry.deals}</td>
                            <td className="px-4 py-2 text-right text-emerald-400 font-semibold">{fmtB(entry.value)}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-28 bg-muted rounded-full h-2 overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${(entry.value / maxValue) * 100}%` }}
                                  />
                                </div>
                                <span className="text-muted-foreground text-xs">{fmt(entry.share, 1)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right text-amber-400">{fmtM(entry.fees)}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>

          {/* Fee wallet */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <DollarSign size={14} className="text-emerald-400" />
              Investment Bank Fee Wallet Estimator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: "M&A Advisory", rate: "0.5–1.0%", typical: "$50–500M on $10B deal", note: "Success fee paid at close; minimum retainer $1–5M" },
                { type: "ECM (IPO)", rate: "5–7% gross spread", typical: "7% on $1B IPO = $70M", note: "Split: lead 20%, syndicate 60%, selling 20%" },
                { type: "DCM (Bond)", rate: "0.3–1.5%", typical: "0.5% on $2B issuance = $10M", note: "Higher for HY bonds; lower for IG; management fee + selling concession" },
              ].map((f) => (
                <div key={f.type} className="bg-muted/50 rounded-lg p-3">
                  <div className="font-semibold text-xs text-primary mb-1">{f.type}</div>
                  <div className="text-xs text-foreground mb-1">Rate: {f.rate}</div>
                  <div className="text-xs text-emerald-400 mb-2">Typical: {f.typical}</div>
                  <div className="text-xs text-muted-foreground">{f.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* IB compensation */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Users size={14} className="text-primary" />
              IB Analyst / Associate Compensation (Top Banks, 2025)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr className="text-muted-foreground">
                    <th className="text-left px-3 py-2">Title</th>
                    <th className="text-right px-3 py-2">Base Salary</th>
                    <th className="text-right px-3 py-2">Bonus</th>
                    <th className="text-right px-3 py-2">Total Comp</th>
                    <th className="text-left px-3 py-2">Total (Visual)</th>
                  </tr>
                </thead>
                <tbody>
                  {IB_COMPENSATION.map((row, i) => {
                    const maxTotal = IB_COMPENSATION[IB_COMPENSATION.length - 1].total;
                    return (
                      <tr key={i} className="border-t border-border hover:bg-muted/20">
                        <td className="px-3 py-2 font-medium text-foreground">{row.title}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">${(row.base / 1000).toFixed(0)}K</td>
                        <td className="px-3 py-2 text-right text-amber-400">${(row.bonus / 1000).toFixed(0)}K</td>
                        <td className="px-3 py-2 text-right font-semibold text-emerald-400">
                          {row.total >= 1000000 ? `$${(row.total / 1000000).toFixed(2)}M` : `$${(row.total / 1000).toFixed(0)}K`}
                        </td>
                        <td className="px-3 py-2">
                          <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(row.total / maxTotal) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * Compensation figures are representative estimates for bulge bracket / elite boutique banks (Goldman, Morgan Stanley, JPMorgan, Lazard, Evercore). Actual figures vary by bank, group, and performance.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
