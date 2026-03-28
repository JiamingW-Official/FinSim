"use client";

import { useState, useMemo } from "react";
import {
  Satellite,
  CreditCard,
  Globe,
  MapPin,
  MessageSquare,
  Leaf,
  Cpu,
  Mail,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Info,
  Building2,
  Truck,
  Users,
  Briefcase,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── seeded PRNG (seed 873) ────────────────────────────────────────────────────
let s = 873;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface AltDataCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  dataVolume: string;
  signalDecay: string;
  costTier: "Low" | "Medium" | "High" | "Very High";
  legalRisk: "Low" | "Medium" | "High";
  users: string[];
  color: string;
}

interface VendorRow {
  name: string;
  category: string;
  founded: number;
  clients: string;
  specialty: string;
  priceRange: string;
}

interface SECCase {
  year: number;
  entity: string;
  allegation: string;
  outcome: string;
  fine: string;
}

// ── Static data ───────────────────────────────────────────────────────────────

const ALT_DATA_CATEGORIES: AltDataCategory[] = [
  {
    id: "satellite",
    name: "Satellite Imagery",
    icon: <Satellite className="w-5 h-5" />,
    description:
      "High-resolution images of parking lots, oil tank shadows, crop fields, and construction sites to measure real-world activity before official reports.",
    dataVolume: "Petabytes/day",
    signalDecay: "3–6 months",
    costTier: "Very High",
    legalRisk: "Low",
    users: ["Quant Hedge Funds", "Commodity Traders", "Long/Short Equity"],
    color: "#6366f1",
  },
  {
    id: "creditcard",
    name: "Credit Card Transactions",
    icon: <CreditCard className="w-5 h-5" />,
    description:
      "Anonymized spending panels from millions of cardholders revealing merchant-level revenue trends weeks before earnings announcements.",
    dataVolume: "Billions of txns/month",
    signalDecay: "6–12 months",
    costTier: "High",
    legalRisk: "Medium",
    users: ["Fundamental L/S", "Consumer Sector Funds", "Macro Traders"],
    color: "#22c55e",
  },
  {
    id: "webscraping",
    name: "Web Scraping",
    icon: <Globe className="w-5 h-5" />,
    description:
      "Automated extraction of pricing, product listings, job postings, reviews, and app ratings from public websites at scale.",
    dataVolume: "Terabytes/day",
    signalDecay: "1–3 months",
    costTier: "Low",
    legalRisk: "Medium",
    users: ["Quant Funds", "Retail Prop Desks", "Family Offices"],
    color: "#f59e0b",
  },
  {
    id: "geolocation",
    name: "Geolocation / Foot Traffic",
    icon: <MapPin className="w-5 h-5" />,
    description:
      "Aggregated mobile GPS pings tracking visits to stores, restaurants, factories, and shipping hubs to gauge operational activity.",
    dataVolume: "Trillions of pings/month",
    signalDecay: "4–8 months",
    costTier: "High",
    legalRisk: "High",
    users: ["Retail Sector Funds", "REITs Analytics", "Activist Investors"],
    color: "#ec4899",
  },
  {
    id: "social",
    name: "Social Media Sentiment",
    icon: <MessageSquare className="w-5 h-5" />,
    description:
      "NLP-processed signals from Twitter/X, Reddit, StockTwits, and news feeds measuring crowd sentiment and momentum shifts.",
    dataVolume: "500M+ posts/day",
    signalDecay: "Days to 2 weeks",
    costTier: "Medium",
    legalRisk: "Low",
    users: ["Momentum Quants", "Event-Driven Funds", "Retail Algos"],
    color: "#3b82f6",
  },
  {
    id: "esg",
    name: "ESG / Non-financial Data",
    icon: <Leaf className="w-5 h-5" />,
    description:
      "Carbon emissions, supply chain audits, governance scores, and employee satisfaction data used for risk screening and impact investing.",
    dataVolume: "Gigabytes/day",
    signalDecay: "12–24 months",
    costTier: "Medium",
    legalRisk: "Low",
    users: ["ESG Funds", "Institutional LPs", "Pension Funds"],
    color: "#10b981",
  },
  {
    id: "iot",
    name: "IoT / Sensor Data",
    icon: <Cpu className="w-5 h-5" />,
    description:
      "Power consumption readings, industrial sensors, weather stations, and AIS ship-tracking data revealing production and logistics in near real-time.",
    dataVolume: "Exabytes/year",
    signalDecay: "2–5 months",
    costTier: "Very High",
    legalRisk: "Low",
    users: ["Energy Traders", "Commodity Quants", "Macro Desks"],
    color: "#8b5cf6",
  },
  {
    id: "emailreceipts",
    name: "Email Receipts",
    icon: <Mail className="w-5 h-5" />,
    description:
      "Opt-in purchase receipt panels revealing e-commerce order volumes, return rates, and subscription churn ahead of public disclosures.",
    dataVolume: "Millions of receipts/day",
    signalDecay: "6–9 months",
    costTier: "High",
    legalRisk: "Medium",
    users: ["E-commerce Analysts", "Consumer Quants", "Earnings Traders"],
    color: "#f97316",
  },
];

const VENDORS: VendorRow[] = [
  {
    name: "Eagle Alpha",
    category: "Marketplace",
    founded: 2012,
    clients: "300+ buy-side firms",
    specialty: "Alt-data discovery & due diligence platform",
    priceRange: "$50k–$200k/yr",
  },
  {
    name: "Quandl (Nasdaq)",
    category: "Financial Data",
    founded: 2012,
    clients: "400,000+ users",
    specialty: "Structured financial & economic datasets",
    priceRange: "$10k–$500k/yr",
  },
  {
    name: "Yipit Data",
    category: "Consumer Transactions",
    founded: 2009,
    clients: "Top 50 hedge funds",
    specialty: "Credit card & email receipt panels",
    priceRange: "$100k–$1M/yr",
  },
  {
    name: "SpaceKnow",
    category: "Satellite",
    founded: 2013,
    clients: "Sovereign funds, banks",
    specialty: "Factory/construction satellite analytics",
    priceRange: "$200k–$2M/yr",
  },
  {
    name: "Placer.ai",
    category: "Foot Traffic",
    founded: 2018,
    clients: "Retail chains, hedge funds",
    specialty: "Mobile GPS foot traffic analytics",
    priceRange: "$30k–$300k/yr",
  },
  {
    name: "Thinknum",
    category: "Web Scraping",
    founded: 2014,
    clients: "500+ institutions",
    specialty: "Job listings, social data, web metrics",
    priceRange: "$20k–$150k/yr",
  },
  {
    name: "Orbital Insight",
    category: "Satellite + Geo",
    founded: 2013,
    clients: "US Gov, hedge funds",
    specialty: "Geospatial AI — vehicles, buildings, crops",
    priceRange: "$250k–$3M/yr",
  },
  {
    name: "M Science",
    category: "Transaction Data",
    founded: 2015,
    clients: "Tier-1 hedge funds",
    specialty: "Credit card & banking transaction panels",
    priceRange: "$200k–$2M/yr",
  },
];

const SEC_CASES: SECCase[] = [
  {
    year: 2018,
    entity: "Research Firm A",
    allegation: "Selling MNPI from corporate insiders via expert network",
    outcome: "Civil charges filed",
    fine: "$5M",
  },
  {
    year: 2019,
    entity: "Hedge Fund B",
    allegation: "Trading on satellite data before official inventory reports",
    outcome: "Investigation dropped (legal data)",
    fine: "$0",
  },
  {
    year: 2020,
    entity: "Alt-Data Vendor C",
    allegation: "Reselling private healthcare claims without HIPAA compliance",
    outcome: "Consent order + policy change",
    fine: "$2.5M",
  },
  {
    year: 2021,
    entity: "Quant Fund D",
    allegation: "Using employee geolocation data without consent",
    outcome: "Settled — GDPR violation",
    fine: "$8M",
  },
  {
    year: 2022,
    entity: "Data Broker E",
    allegation: "Selling app data linked to identifiable users",
    outcome: "FTC investigation + CCPA fine",
    fine: "$15M",
  },
];

const DUE_DILIGENCE_CHECKLIST = [
  { item: "Data sourcing transparency — can vendor explain collection method?", category: "Legal" },
  { item: "MNPI firewall — is any data derived from company insiders?", category: "Legal" },
  { item: "PII handling — are individuals identifiable in the dataset?", category: "Privacy" },
  { item: "GDPR/CCPA consent mechanisms documented?", category: "Privacy" },
  { item: "Exclusivity period — how many other funds have the same data?", category: "Alpha" },
  { item: "Backtest availability — at least 3 years of history?", category: "Quality" },
  { item: "Refresh cadence matches investment horizon?", category: "Quality" },
  { item: "Independent legal opinion on use permissibility?", category: "Legal" },
  { item: "Data SLA — uptime guarantees and latency commitments?", category: "Ops" },
  { item: "Exit clauses and data deletion rights on termination?", category: "Legal" },
];

const MARKET_SIZE = [
  { year: "2018", value: 1.1 },
  { year: "2019", value: 1.7 },
  { year: "2020", value: 2.1 },
  { year: "2021", value: 3.0 },
  { year: "2022", value: 4.3 },
  { year: "2023", value: 6.0 },
  { year: "2024", value: 8.5 },
];

// ── Use cases ─────────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    id: "foottraffic",
    title: "Foot Traffic → Retail Sales",
    icon: <ShoppingCart className="w-5 h-5" />,
    color: "#22c55e",
    source: "Mobile GPS pings aggregated by Placer.ai",
    signal: "Weekly visit count vs prior year at 500 store locations",
    trade: "Long/short retail ETF before quarterly earnings",
    detail:
      "Foot traffic data from 15M+ opt-in mobile devices is aggregated and normalized. A 15%+ YoY visit increase 4 weeks before earnings historically predicts a beat with 62% accuracy. Managers short when visits decline 10%+ YoY, particularly for department stores.",
    accuracy: 62,
    leadDays: 28,
  },
  {
    id: "parking",
    title: "Parking Lot Density → Store Performance",
    icon: <Building2 className="w-5 h-5" />,
    color: "#6366f1",
    source: "Satellite imagery (Planet Labs, Maxar)",
    signal: "Pixel-counted vehicles vs baseline per-store, daily",
    trade: "Earnings surprise prediction for big-box retailers",
    detail:
      "High-res satellite passes over 2,000 retail parking lots daily. Computer vision counts vehicles against a seasonal baseline model. Excess capacity above 120% of prior-year average in final 2 weeks of a quarter correlates with revenue beats in 58% of cases.",
    accuracy: 58,
    leadDays: 14,
  },
  {
    id: "creditcard",
    title: "Credit Card Spend → Consumer Revenue",
    icon: <CreditCard className="w-5 h-5" />,
    color: "#f59e0b",
    source: "Yipit / M Science transaction panels",
    signal: "Merchant-level revenue run-rate vs analyst consensus",
    trade: "Pre-earnings long/short single-name consumer stocks",
    detail:
      "Panels of 5–10M debit and credit cards are aggregated at merchant level. The panel is scaled to total-market estimates using census data. When panel revenue runs ≥5% above sell-side consensus in month 3 of a quarter, the probability of a positive earnings surprise exceeds 70%.",
    accuracy: 70,
    leadDays: 21,
  },
  {
    id: "ais",
    title: "AIS Ship Tracking → Supply Chain",
    icon: <Truck className="w-5 h-5" />,
    color: "#8b5cf6",
    source: "Marine Traffic AIS transponder data",
    signal: "Port dwell times and vessel count at major export hubs",
    trade: "Energy and commodity futures; shipping equities",
    detail:
      "Automatic Identification System (AIS) data from 400,000 vessels is scraped globally. Rising dwell times at Chinese ports signal congestion / demand surge, leading commodity futures by 2–3 weeks. In 2021, AIS data flagged the supply chain crunch 6 weeks before CPI reflected it.",
    accuracy: 65,
    leadDays: 18,
  },
  {
    id: "jobpostings",
    title: "Job Postings → Hiring / Firing Trends",
    icon: <Briefcase className="w-5 h-5" />,
    color: "#ec4899",
    source: "Thinknum / Burning Glass job listing scrapes",
    signal: "Net new postings by department, role, and seniority",
    trade: "R&D hiring surge → technology sector expansion; mass layoffs → margin expansion",
    detail:
      "Millions of job postings scraped daily across LinkedIn, Indeed, and company career sites. A spike in ML engineering postings 6 months before a product launch predicted revenue acceleration for tech names. Conversely, rapid deletion of open roles preceded cost-cut announcements with 3–4 week lead time.",
    accuracy: 55,
    leadDays: 45,
  },
];

// ── Helper: color for cost/risk tiers ─────────────────────────────────────────

function costColor(tier: string) {
  if (tier === "Low") return "text-green-400";
  if (tier === "Medium") return "text-yellow-400";
  if (tier === "High") return "text-orange-400";
  return "text-red-400";
}

function riskColor(tier: string) {
  if (tier === "Low") return "text-green-400";
  if (tier === "Medium") return "text-yellow-400";
  return "text-red-400";
}

function riskBg(tier: string) {
  if (tier === "Low") return "bg-green-500/20 text-green-300";
  if (tier === "Medium") return "bg-yellow-500/20 text-yellow-300";
  return "bg-red-500/20 text-red-300";
}

// ── Tab 1: Data Categories ────────────────────────────────────────────────────

function DataCategoriesTab() {
  const [selected, setSelected] = useState<string | null>(null);

  const maxVal = Math.max(...MARKET_SIZE.map((d) => d.value));
  const W = 520;
  const H = 160;
  const barW = 52;
  const gap = 22;
  const pad = 32;

  return (
    <div className="space-y-6">
      {/* Market Size chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            Alt-Data Market Size 2018–2024 (USD Billions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={W} height={H + 30} viewBox={`0 0 ${W} ${H + 30}`} className="text-xs">
              {/* Gridlines */}
              {[0, 2, 4, 6, 8].map((v) => {
                const y = H - (v / maxVal) * (H - pad);
                return (
                  <g key={v}>
                    <line x1={30} y1={y} x2={W - 10} y2={y} stroke="#3f3f46" strokeDasharray="3 3" />
                    <text x={26} y={y + 4} textAnchor="end" fill="#71717a" fontSize={10}>
                      {v}B
                    </text>
                  </g>
                );
              })}
              {/* Bars */}
              {MARKET_SIZE.map((d, i) => {
                const bh = ((d.value / maxVal) * (H - pad));
                const x = 36 + i * (barW + gap);
                const y = H - bh;
                return (
                  <g key={d.year}>
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={bh}
                      rx={3}
                      fill="#6366f1"
                      opacity={0.85}
                    />
                    <text x={x + barW / 2} y={y - 5} textAnchor="middle" fill="#a5b4fc" fontSize={10}>
                      ${d.value}B
                    </text>
                    <text x={x + barW / 2} y={H + 14} textAnchor="middle" fill="#71717a" fontSize={10}>
                      {d.year}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Category cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ALT_DATA_CATEGORIES.map((cat) => (
          <motion.div
            key={cat.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => setSelected(selected === cat.id ? null : cat.id)}
            className="cursor-pointer"
          >
            <Card
              className={cn(
                "bg-zinc-900 border-zinc-800 transition-all duration-200",
                selected === cat.id && "border-indigo-500/60"
              )}
            >
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span style={{ color: cat.color }}>{cat.icon}</span>
                  <span className="font-semibold text-zinc-200 text-sm">{cat.name}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{cat.description}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="text-zinc-500">
                    Volume: <span className="text-zinc-300">{cat.dataVolume}</span>
                  </div>
                  <div className="text-zinc-500">
                    Signal Decay: <span className="text-zinc-300">{cat.signalDecay}</span>
                  </div>
                  <div className="text-zinc-500">
                    Cost:{" "}
                    <span className={costColor(cat.costTier)}>{cat.costTier}</span>
                  </div>
                  <div className="text-zinc-500">
                    Legal Risk:{" "}
                    <span className={riskColor(cat.legalRisk)}>{cat.legalRisk}</span>
                  </div>
                </div>
                {selected === cat.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 border-t border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-1">Primary Users:</p>
                      <div className="flex flex-wrap gap-1">
                        {cat.users.map((u) => (
                          <span
                            key={u}
                            className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300"
                          >
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Signal Analysis ────────────────────────────────────────────────────

function SignalAnalysisTab() {
  // Scatter data: correlation to earnings surprise by data type
  const scatterData = useMemo(() => {
    // Use seeded randomness for deterministic scatter
    // Reset seed for determinism in useMemo
    let localS = 9001;
    const localRand = () => {
      localS = (localS * 1103515245 + 12345) & 0x7fffffff;
      return localS / 0x7fffffff;
    };
    const types = [
      { name: "Credit Card", color: "#22c55e" },
      { name: "Satellite", color: "#6366f1" },
      { name: "Social Media", color: "#3b82f6" },
      { name: "Job Postings", color: "#ec4899" },
    ];
    return types.map((t) => ({
      ...t,
      points: Array.from({ length: 18 }, () => ({
        x: (localRand() - 0.05) * 40 - 15, // signal z-score
        y: (localRand() - 0.1) * 30 - 10, // earnings surprise %
      })),
    }));
  }, []);

  // Signal decay: alpha erosion over months
  const decayMonths = [0, 3, 6, 9, 12, 18, 24, 36];
  const decayCurves = useMemo(() => {
    const types = [
      { name: "Satellite", color: "#6366f1", halflife: 6 },
      { name: "Credit Card", color: "#22c55e", halflife: 9 },
      { name: "Social Media", color: "#3b82f6", halflife: 2 },
      { name: "Job Postings", color: "#ec4899", halflife: 14 },
    ];
    return types.map((t) => ({
      ...t,
      values: decayMonths.map((m) => ({
        m,
        alpha: 100 * Math.exp(-0.693 * (m / t.halflife)),
      })),
    }));
  }, []);

  // IC bar chart
  const icData = [
    { name: "Credit Card", ic: 0.08, color: "#22c55e" },
    { name: "Satellite", ic: 0.065, color: "#6366f1" },
    { name: "Job Postings", ic: 0.055, color: "#ec4899" },
    { name: "Web Scraping", ic: 0.047, color: "#f59e0b" },
    { name: "Social Media", ic: 0.038, color: "#3b82f6" },
    { name: "ESG", ic: 0.022, color: "#10b981" },
    { name: "Email Receipts", ic: 0.07, color: "#f97316" },
    { name: "IoT / Sensor", ic: 0.06, color: "#8b5cf6" },
  ];

  // SVG dimensions
  const SW = 460;
  const SH = 200;
  const scatterPad = 40;

  // scatter to SVG coordinates
  const toSvgX = (x: number) =>
    scatterPad + ((x + 20) / 40) * (SW - scatterPad * 2);
  const toSvgY = (y: number) =>
    SH - scatterPad - ((y + 15) / 35) * (SH - scatterPad * 2);

  // Decay SVG
  const DW = 460;
  const DH = 180;
  const dPad = 40;
  const dToX = (m: number) => dPad + (m / 36) * (DW - dPad * 2);
  const dToY = (v: number) => DH - dPad - (v / 100) * (DH - dPad * 2);

  // IC bar
  const maxIC = 0.1;
  const IBH = 160;
  const IBW = 460;
  const ibBarH = 16;
  const ibPad = 12;

  return (
    <div className="space-y-6">
      {/* Scatter: signal vs earnings surprise */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">
            Signal Strength vs Earnings Surprise (by Alt-Data Type)
          </CardTitle>
          <p className="text-xs text-zinc-500">
            X = signal z-score 4 weeks before earnings; Y = actual EPS surprise %
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`}>
              {/* Axes */}
              <line x1={scatterPad} y1={SH - scatterPad} x2={SW - 10} y2={SH - scatterPad} stroke="#52525b" />
              <line x1={scatterPad} y1={10} x2={scatterPad} y2={SH - scatterPad} stroke="#52525b" />
              {/* Zero lines */}
              <line x1={toSvgX(0)} y1={10} x2={toSvgX(0)} y2={SH - scatterPad} stroke="#3f3f46" strokeDasharray="4 3" />
              <line x1={scatterPad} y1={toSvgY(0)} x2={SW - 10} y2={toSvgY(0)} stroke="#3f3f46" strokeDasharray="4 3" />
              {/* Labels */}
              <text x={SW / 2} y={SH - 4} textAnchor="middle" fill="#71717a" fontSize={10}>Signal Z-Score</text>
              <text x={10} y={SH / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90, 10, ${SH / 2})`}>EPS Surprise %</text>
              {/* Points */}
              {scatterData.map((type) =>
                type.points.map((pt, i) => (
                  <circle
                    key={`${type.name}-${i}`}
                    cx={toSvgX(pt.x)}
                    cy={toSvgY(pt.y)}
                    r={4}
                    fill={type.color}
                    opacity={0.7}
                  />
                ))
              )}
              {/* Legend */}
              {scatterData.map((t, i) => (
                <g key={t.name}>
                  <circle cx={scatterPad + 8} cy={14 + i * 16} r={4} fill={t.color} />
                  <text x={scatterPad + 16} y={18 + i * 16} fill="#a1a1aa" fontSize={10}>{t.name}</text>
                </g>
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Decay chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">
            Alpha Erosion Over Time (signal decay as crowding increases)
          </CardTitle>
          <p className="text-xs text-zinc-500">
            Estimated remaining edge (%) as more funds adopt the same data source
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={DW} height={DH} viewBox={`0 0 ${DW} ${DH}`}>
              {/* Grid */}
              {[0, 25, 50, 75, 100].map((v) => (
                <g key={v}>
                  <line x1={dPad} y1={dToY(v)} x2={DW - 10} y2={dToY(v)} stroke="#3f3f46" strokeDasharray="3 3" />
                  <text x={dPad - 4} y={dToY(v) + 4} textAnchor="end" fill="#71717a" fontSize={9}>{v}%</text>
                </g>
              ))}
              {[0, 12, 24, 36].map((m) => (
                <text key={m} x={dToX(m)} y={DH - 4} textAnchor="middle" fill="#71717a" fontSize={9}>{m}mo</text>
              ))}
              {/* Curves */}
              {decayCurves.map((c) => {
                const pts = c.values.map((v) => `${dToX(v.m)},${dToY(v.alpha)}`).join(" ");
                return (
                  <polyline
                    key={c.name}
                    points={pts}
                    fill="none"
                    stroke={c.color}
                    strokeWidth={2}
                  />
                );
              })}
              {/* Legend */}
              {decayCurves.map((c, i) => (
                <g key={c.name}>
                  <line x1={DW - 100} y1={16 + i * 16} x2={DW - 86} y2={16 + i * 16} stroke={c.color} strokeWidth={2} />
                  <text x={DW - 82} y={20 + i * 16} fill="#a1a1aa" fontSize={9}>{c.name}</text>
                </g>
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* IC bar chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">
            Information Coefficient (IC) by Data Type
          </CardTitle>
          <p className="text-xs text-zinc-500">
            IC measures predictive correlation (0 = no edge, 0.10 = excellent). IC above 0.05 is considered actionable.
          </p>
        </CardHeader>
        <CardContent>
          <svg width={IBW} height={IBH} viewBox={`0 0 ${IBW} ${IBH}`}>
            {/* Threshold line */}
            <line
              x1={120 + (0.05 / maxIC) * (IBW - 130)}
              y1={0}
              x2={120 + (0.05 / maxIC) * (IBW - 130)}
              y2={IBH - 10}
              stroke="#6366f1"
              strokeDasharray="4 3"
              strokeWidth={1.5}
            />
            <text
              x={120 + (0.05 / maxIC) * (IBW - 130) + 4}
              y={12}
              fill="#a5b4fc"
              fontSize={9}
            >
              0.05 threshold
            </text>
            {icData.map((d, i) => {
              const bw = (d.ic / maxIC) * (IBW - 130);
              const y = 8 + i * (ibBarH + ibPad);
              return (
                <g key={d.name}>
                  <text x={115} y={y + ibBarH - 3} textAnchor="end" fill="#a1a1aa" fontSize={10}>
                    {d.name}
                  </text>
                  <rect x={120} y={y} width={bw} height={ibBarH} rx={3} fill={d.color} opacity={0.85} />
                  <text x={124 + bw} y={y + ibBarH - 3} fill={d.color} fontSize={10}>
                    {d.ic.toFixed(3)}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Overfitting warning */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-200">Overfitting Risk in Alt-Data Strategies</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Alt-data backtests are prone to severe overfitting. With thousands of data fields and limited history (2–5 years), practitioners can inadvertently torture data until it produces attractive returns. Best practices include: (1) out-of-sample testing on data never used in model fitting, (2) Bonferroni correction when testing hundreds of signals, (3) paper-trading validation for at least 6 months before live capital commitment, and (4) stress-testing the signal during bear markets and high-volatility regimes where correlations often break down.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: Use Cases ──────────────────────────────────────────────────────────

function UseCasesTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Flow diagram: 3 nodes with arrows
  function FlowDiagram({
    source,
    signal,
    trade,
    color,
  }: {
    source: string;
    signal: string;
    trade: string;
    color: string;
  }) {
    const nodeW = 130;
    const nodeH = 44;
    const totalW = nodeW * 3 + 50 * 2;

    return (
      <svg width={totalW} height={nodeH + 8} viewBox={`0 0 ${totalW} ${nodeH + 8}`} className="w-full max-w-[480px]">
        {[
          { label: source, x: 0 },
          { label: signal, x: nodeW + 50 },
          { label: trade, x: (nodeW + 50) * 2 },
        ].map(({ label, x }, i) => (
          <g key={i}>
            <rect x={x} y={4} width={nodeW} height={nodeH} rx={6} fill={`${color}22`} stroke={color} strokeWidth={1} />
            <foreignObject x={x + 4} y={6} width={nodeW - 8} height={nodeH - 4}>
              <div
                style={{ fontSize: 9, color: "#d4d4d8", lineHeight: "1.3" }}
                className="overflow-hidden h-full flex items-center justify-center text-center"
              >
                {label}
              </div>
            </foreignObject>
            {i < 2 && (
              <g>
                <line
                  x1={x + nodeW}
                  y1={4 + nodeH / 2}
                  x2={x + nodeW + 44}
                  y2={4 + nodeH / 2}
                  stroke={color}
                  strokeWidth={1.5}
                />
                <polygon
                  points={`${x + nodeW + 44},${4 + nodeH / 2 - 4} ${x + nodeW + 50},${4 + nodeH / 2} ${x + nodeW + 44},${4 + nodeH / 2 + 4}`}
                  fill={color}
                />
              </g>
            )}
          </g>
        ))}
      </svg>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-zinc-500 flex items-center gap-2 mb-2">
        <Info className="w-4 h-4" />
        Click any use case to expand the full methodology.
      </div>
      {USE_CASES.map((uc) => (
        <motion.div key={uc.id} layout>
          <Card
            className={cn(
              "bg-zinc-900 border-zinc-800 cursor-pointer transition-all",
              expanded === uc.id && "border-indigo-500/50"
            )}
            onClick={() => setExpanded(expanded === uc.id ? null : uc.id)}
          >
            <CardContent className="pt-4 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ color: uc.color }}>{uc.icon}</span>
                  <span className="font-semibold text-zinc-200 text-sm">{uc.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-zinc-500">
                    Lead:{" "}
                    <span className="text-zinc-300 font-medium">{uc.leadDays}d</span>
                  </div>
                  <div className="text-xs">
                    Accuracy:{" "}
                    <span
                      className={cn(
                        "font-semibold",
                        uc.accuracy >= 65 ? "text-green-400" : "text-yellow-400"
                      )}
                    >
                      {uc.accuracy}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <FlowDiagram
                  source={uc.source}
                  signal={uc.signal}
                  trade={uc.trade}
                  color={uc.color}
                />
              </div>
              {expanded === uc.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-2 border-t border-zinc-800"
                >
                  <p className="text-xs text-zinc-400 leading-relaxed">{uc.detail}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ── Tab 4: Ecosystem & Compliance ─────────────────────────────────────────────

function EcosystemTab() {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const categoryColors: Record<string, string> = {
    Legal: "bg-red-500/20 text-red-300",
    Privacy: "bg-purple-500/20 text-purple-300",
    Alpha: "bg-blue-500/20 text-blue-300",
    Quality: "bg-green-500/20 text-green-300",
    Ops: "bg-amber-500/20 text-amber-300",
  };

  return (
    <div className="space-y-6">
      {/* Vendor table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">Top Alt-Data Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 pr-3 text-zinc-400 font-medium">Vendor</th>
                  <th className="text-left py-2 pr-3 text-zinc-400 font-medium">Category</th>
                  <th className="text-left py-2 pr-3 text-zinc-400 font-medium">Founded</th>
                  <th className="text-left py-2 pr-3 text-zinc-400 font-medium">Clients</th>
                  <th className="text-left py-2 pr-3 text-zinc-400 font-medium">Specialty</th>
                  <th className="text-left py-2 text-zinc-400 font-medium">Price Range</th>
                </tr>
              </thead>
              <tbody>
                {VENDORS.map((v, i) => (
                  <tr
                    key={v.name}
                    className={cn(
                      "border-b border-zinc-800/50",
                      i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/30"
                    )}
                  >
                    <td className="py-2 pr-3 font-semibold text-zinc-200">{v.name}</td>
                    <td className="py-2 pr-3">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                        {v.category}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-zinc-400">{v.founded}</td>
                    <td className="py-2 pr-3 text-zinc-400">{v.clients}</td>
                    <td className="py-2 pr-3 text-zinc-400">{v.specialty}</td>
                    <td className="py-2 text-zinc-300">{v.priceRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MNPI risk */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            MNPI Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Material Non-Public Information (MNPI) is the central legal risk in alt-data investing. Under SEC Rule 10b-5, trading on information that: (1) is not publicly available, (2) is material to an investor's decision, and (3) was obtained through a breach of fiduciary duty is prohibited. Critically, the data need not come directly from the company — if a third party (e.g. a vendor) misappropriates private information, downstream traders can be liable.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: "Generally Safe",
                icon: <CheckCircle className="w-4 h-4 text-green-400" />,
                color: "border-green-500/30",
                items: [
                  "Aggregated satellite imagery (public space)",
                  "Anonymized, panel-based transaction data",
                  "Publicly scraped website data",
                  "AIS vessel tracking (public broadcasts)",
                ],
              },
              {
                title: "Requires Legal Review",
                icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
                color: "border-amber-500/30",
                items: [
                  "Opt-in consumer surveys (consent sufficiency)",
                  "Healthcare claims data (HIPAA overlap)",
                  "Employee location data (consent scope)",
                  "App usage data (CCPA identifiability)",
                ],
              },
              {
                title: "High Risk / Avoid",
                icon: <XCircle className="w-4 h-4 text-red-400" />,
                color: "border-red-500/30",
                items: [
                  "Undisclosed corporate earnings previews",
                  "Supply chain data from company employees",
                  "Expert network calls with active employees",
                  "Non-anonymized personal financial records",
                ],
              },
            ].map((tier) => (
              <div
                key={tier.title}
                className={cn("rounded-lg border p-3 bg-zinc-800/40 space-y-2", tier.color)}
              >
                <div className="flex items-center gap-1.5">
                  {tier.icon}
                  <span className="text-xs font-semibold text-zinc-200">{tier.title}</span>
                </div>
                <ul className="space-y-1">
                  {tier.items.map((item) => (
                    <li key={item} className="text-xs text-zinc-400 flex items-start gap-1.5">
                      <span className="text-zinc-600 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEC enforcement cases */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            SEC Enforcement Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {SEC_CASES.map((c) => (
              <div
                key={`${c.year}-${c.entity}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/40 border border-zinc-800"
              >
                <span className="text-xs font-bold text-zinc-500 w-10 shrink-0">{c.year}</span>
                <div className="space-y-0.5 flex-1">
                  <p className="text-xs font-semibold text-zinc-300">{c.entity}</p>
                  <p className="text-xs text-zinc-500">{c.allegation}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", riskBg(c.fine === "$0" ? "Low" : c.fine.startsWith("$1") ? "High" : "Medium"))}>
                      {c.outcome}
                    </span>
                    {c.fine !== "$0" && (
                      <span className="text-xs text-red-400 font-semibold">Fine: {c.fine}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* GDPR/CCPA summary */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">
            GDPR / CCPA Data Privacy Constraints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                law: "GDPR (EU)",
                color: "#3b82f6",
                points: [
                  "Lawful basis required for all personal data processing",
                  "Right to erasure ('be forgotten') — must delete on request",
                  "Data minimization — collect only what is necessary",
                  "Fines up to 4% of global annual turnover",
                  "Processing of EU citizens' data regardless of firm location",
                ],
              },
              {
                law: "CCPA (California)",
                color: "#f97316",
                points: [
                  "California consumers can opt out of data sale",
                  "Right to know what personal data is collected",
                  "Applies to firms processing 100k+ consumers' data",
                  "Fines $100–$750 per consumer per incident",
                  "Covers any business serving California residents",
                ],
              },
            ].map((law) => (
              <div key={law.law} className="rounded-lg border border-zinc-800 p-3 space-y-2">
                <span className="text-xs font-bold" style={{ color: law.color }}>
                  {law.law}
                </span>
                <ul className="space-y-1">
                  {law.points.map((pt) => (
                    <li key={pt} className="text-xs text-zinc-400 flex items-start gap-1.5">
                      <span className="text-zinc-600 mt-0.5">•</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendor due diligence checklist */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">
            Vendor Due Diligence Checklist
          </CardTitle>
          <p className="text-xs text-zinc-500">Click items to mark complete.</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {DUE_DILIGENCE_CHECKLIST.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all",
                checkedItems.has(i)
                  ? "border-green-600/40 bg-green-900/10"
                  : "border-zinc-800 hover:border-zinc-600"
              )}
              onClick={() => toggle(i)}
            >
              {checkedItems.has(i) ? (
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-zinc-600 shrink-0" />
              )}
              <span
                className={cn(
                  "text-xs flex-1",
                  checkedItems.has(i) ? "text-zinc-500 line-through" : "text-zinc-300"
                )}
              >
                {item.item}
              </span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full shrink-0", categoryColors[item.category])}>
                {item.category}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <span className="text-xs text-zinc-500">
              {checkedItems.size} / {DUE_DILIGENCE_CHECKLIST.length} complete
            </span>
            {checkedItems.size === DUE_DILIGENCE_CHECKLIST.length && (
              <Badge className="bg-green-600 text-white text-xs">Due Diligence Complete</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Buy vs Build */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">
            Buy vs Build Decision Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-blue-500/30 bg-blue-900/10 p-3 space-y-2">
              <span className="text-xs font-bold text-blue-300">Buy from Vendor</span>
              <ul className="space-y-1">
                {[
                  "Faster time-to-signal (weeks not months)",
                  "Vendor handles legal/compliance vetting",
                  "Historical data depth often 3–10 years",
                  "Suitable when data collection is hard or exclusive",
                  "Cost: $50k–$2M/yr but no infra overhead",
                ].map((pt) => (
                  <li key={pt} className="text-xs text-zinc-400 flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-purple-500/30 bg-purple-900/10 p-3 space-y-2">
              <span className="text-xs font-bold text-purple-300">Build In-House</span>
              <ul className="space-y-1">
                {[
                  "Proprietary edge — vendor can't sell to competitors",
                  "Full control over data quality and latency",
                  "Suitable for publicly available but uncurated data",
                  "Web scraping, NLP pipelines, satellite processing",
                  "Cost: $500k–$5M in engineering + infrastructure",
                ].map((pt) => (
                  <li key={pt} className="text-xs text-zinc-400 flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AltDataPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-indigo-500/15">
            <Satellite className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100">Alternative Data</h1>
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
            Alpha Generation
          </Badge>
        </div>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Satellite imagery, credit card transactions, geolocation, and web data — the non-traditional signals professional investors use to gain an edge before public disclosures.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Global Alt-Data Market", value: "$8.5B", sub: "2024 estimate", color: "text-indigo-400" },
          { label: "Hedge Funds Using Alt-Data", value: "68%", sub: "of surveyed funds", color: "text-green-400" },
          { label: "Avg Signal Lead Time", value: "2–6 wks", sub: "vs earnings release", color: "text-blue-400" },
          { label: "Best-in-Class IC", value: "0.08–0.12", sub: "credit card data", color: "text-amber-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-zinc-500">{s.label}</p>
              <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-zinc-600">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="categories">
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-4 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="categories" className="text-xs data-[state=active]:bg-zinc-700">
            Data Categories
          </TabsTrigger>
          <TabsTrigger value="signals" className="text-xs data-[state=active]:bg-zinc-700">
            Signal Analysis
          </TabsTrigger>
          <TabsTrigger value="usecases" className="text-xs data-[state=active]:bg-zinc-700">
            Use Cases
          </TabsTrigger>
          <TabsTrigger value="ecosystem" className="text-xs data-[state=active]:bg-zinc-700">
            Ecosystem & Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="data-[state=inactive]:hidden">
          <DataCategoriesTab />
        </TabsContent>
        <TabsContent value="signals" className="data-[state=inactive]:hidden">
          <SignalAnalysisTab />
        </TabsContent>
        <TabsContent value="usecases" className="data-[state=inactive]:hidden">
          <UseCasesTab />
        </TabsContent>
        <TabsContent value="ecosystem" className="data-[state=inactive]:hidden">
          <EcosystemTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
