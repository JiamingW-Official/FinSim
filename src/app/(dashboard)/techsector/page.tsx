"use client";

import { useState, useMemo } from "react";
import {
 Cpu,
 Cloud,
 BarChart3,
 TrendingUp,
 TrendingDown,
 Globe,
 Layers,
 DollarSign,
 Zap,
 AlertTriangle,
 CheckCircle,
 Info,
 ArrowUp,
 ArrowDown,
 Activity,
 Server,
 Shield,
 Target,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 163;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtPct(n: number, d = 1): string {
 return `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;
}

function fmtB(n: number): string {
 if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}T`;
 if (Math.abs(n) >= 1) return `$${n.toFixed(1)}B`;
 return `$${(n * 1000).toFixed(0)}M`;
}

function fmtX(n: number): string {
 return `${n.toFixed(1)}x`;
}

function posNegClass(v: number): string {
 return v >= 0 ? "text-emerald-400" : "text-rose-400";
}

// ── Shared UI components ──────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
 return (
 <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
 {children}
 </h3>
 );
}

function StatCard({
 label,
 value,
 sub,
 highlight,
}: {
 label: string;
 value: string;
 sub?: string;
 highlight?: "pos" | "neg" | "neutral";
}) {
 const valClass =
 highlight === "pos"
 ? "text-emerald-400"
 : highlight === "neg"
 ? "text-rose-400"
 : "text-foreground";
 return (
 <div className="rounded-md border border-border bg-foreground/5 p-4 flex flex-col gap-1">
 <span className="text-xs text-muted-foreground">{label}</span>
 <span className={cn("text-xl font-semibold", valClass)}>{value}</span>
 {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
 </div>
 );
}

function InfoBox({
 children,
 variant = "blue",
}: {
 children: React.ReactNode;
 variant?: "blue" | "amber" | "emerald" | "violet";
}) {
 const colors = {
 blue: "bg-muted/10 border-primary/30 text-primary",
 amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
 emerald: "bg-emerald-500/5 border-emerald-500/30 text-emerald-200",
 violet: "bg-orange-500/10 border-orange-500/30 text-orange-200",
 };
 return (
 <div className={cn("rounded-lg border p-3 text-xs text-muted-foreground leading-relaxed", colors[variant])}>
 {children}
 </div>
 );
}

function MiniBar({
 value,
 max,
 color = "bg-primary",
 label,
 suffix = "%",
}: {
 value: number;
 max: number;
 color?: string;
 label?: string;
 suffix?: string;
}) {
 const pct = Math.min(100, (value / max) * 100);
 return (
 <div className="flex items-center gap-2">
 {label && <span className="text-xs text-muted-foreground w-20 shrink-0 truncate">{label}</span>}
 <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
 <div
 className={cn("h-full rounded-full", color)}
 style={{ width: `${pct}%` }}
 />
 </div>
 <span className="text-xs text-muted-foreground w-12 text-right shrink-0">
 {value.toFixed(1)}{suffix}
 </span>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════════════════════════

interface SaasCompany {
 ticker: string;
 name: string;
 arrGrowth: number;
 nrr: number;
 cac: number;
 ltv: number;
 ltvCacRatio: number;
 grossMargin: number;
 fcfMargin: number;
 rule40: number;
 magicNumber: number;
 smSpend: number;
}

const SAAS_COMPANIES: SaasCompany[] = [
 { ticker: "CRM", name: "Salesforce", arrGrowth: 11, nrr: 108, cac: 18000, ltv: 144000, ltvCacRatio: 8.0, grossMargin: 76, fcfMargin: 31, rule40: 42, magicNumber: 0.72, smSpend: 6.2 },
 { ticker: "NOW", name: "ServiceNow", arrGrowth: 22, nrr: 125, cac: 24000, ltv: 264000, ltvCacRatio: 11.0, grossMargin: 79, fcfMargin: 28, rule40: 50, magicNumber: 1.18, smSpend: 3.1 },
 { ticker: "SNOW", name: "Snowflake", arrGrowth: 30, nrr: 131, cac: 32000, ltv: 288000, ltvCacRatio: 9.0, grossMargin: 67, fcfMargin: 4, rule40: 34, magicNumber: 0.85, smSpend: 1.8 },
 { ticker: "DDOG", name: "Datadog", arrGrowth: 26, nrr: 119, cac: 22000, ltv: 198000, ltvCacRatio: 9.0, grossMargin: 82, fcfMargin: 20, rule40: 46, magicNumber: 1.02, smSpend: 1.4 },
 { ticker: "HUBS", name: "HubSpot", arrGrowth: 21, nrr: 104, cac: 9000, ltv: 54000, ltvCacRatio: 6.0, grossMargin: 85, fcfMargin: 14, rule40: 35, magicNumber: 0.68, smSpend: 1.2 },
 { ticker: "ZS", name: "Zscaler", arrGrowth: 35, nrr: 122, cac: 28000, ltv: 280000, ltvCacRatio: 10.0, grossMargin: 78, fcfMargin: 22, rule40: 57, magicNumber: 1.15, smSpend: 1.7 },
 { ticker: "CRWD", name: "CrowdStrike", arrGrowth: 33, nrr: 124, cac: 25000, ltv: 275000, ltvCacRatio: 11.0, grossMargin: 77, fcfMargin: 30, rule40: 63, magicNumber: 1.22, smSpend: 2.1 },
 { ticker: "MDB", name: "MongoDB", arrGrowth: 19, nrr: 118, cac: 20000, ltv: 180000, ltvCacRatio: 9.0, grossMargin: 70, fcfMargin: 12, rule40: 31, magicNumber: 0.76, smSpend: 0.8 },
 { ticker: "BILL", name: "Bill.com", arrGrowth: 17, nrr: 108, cac: 8000, ltv: 64000, ltvCacRatio: 8.0, grossMargin: 86, fcfMargin: 10, rule40: 27, magicNumber: 0.62, smSpend: 0.6 },
 { ticker: "VEEV", name: "Veeva", arrGrowth: 14, nrr: 111, cac: 30000, ltv: 330000, ltvCacRatio: 11.0, grossMargin: 73, fcfMargin: 35, rule40: 49, magicNumber: 0.93, smSpend: 0.9 },
 { ticker: "WDAY", name: "Workday", arrGrowth: 17, nrr: 106, cac: 35000, ltv: 280000, ltvCacRatio: 8.0, grossMargin: 77, fcfMargin: 26, rule40: 43, magicNumber: 0.79, smSpend: 2.8 },
 { ticker: "TEAM", name: "Atlassian", arrGrowth: 23, nrr: 121, cac: 1200, ltv: 16800, ltvCacRatio: 14.0, grossMargin: 84, fcfMargin: 32, rule40: 55, magicNumber: 1.45, smSpend: 0.7 },
];

interface AiHyperscaler {
 name: string;
 ticker: string;
 aiRevenue: number;
 totalRevenue: number;
 capexBn: number;
 operatingMargin: number;
 aiGrowth: number;
 cloudShare: number;
}

const AI_HYPERSCALERS: AiHyperscaler[] = [
 { name: "NVIDIA", ticker: "NVDA", aiRevenue: 96, totalRevenue: 130, capexBn: 4, operatingMargin: 62, aiGrowth: 114, cloudShare: 0 },
 { name: "Microsoft/Azure", ticker: "MSFT", aiRevenue: 38, totalRevenue: 245, capexBn: 67, operatingMargin: 45, aiGrowth: 52, cloudShare: 23 },
 { name: "Google/GCP", ticker: "GOOGL", aiRevenue: 24, totalRevenue: 350, capexBn: 75, operatingMargin: 32, aiGrowth: 48, cloudShare: 12 },
 { name: "Amazon/AWS", ticker: "AMZN", aiRevenue: 42, totalRevenue: 621, capexBn: 83, operatingMargin: 28, aiGrowth: 61, cloudShare: 32 },
 { name: "Meta AI", ticker: "META", aiRevenue: 12, totalRevenue: 164, capexBn: 65, operatingMargin: 41, aiGrowth: 80, cloudShare: 0 },
];

interface SemiCompany {
 name: string;
 ticker: string;
 segment: string;
 revGrowth: number;
 grossMargin: number;
 inventory: number;
 bookToBill: number;
 aiExposure: number;
}

const SEMI_COMPANIES: SemiCompany[] = [
 { name: "TSMC", ticker: "TSM", segment: "Foundry", revGrowth: 39, grossMargin: 57, inventory: 2.1, bookToBill: 1.32, aiExposure: 45 },
 { name: "NVIDIA", ticker: "NVDA", segment: "Logic/GPU", revGrowth: 114, grossMargin: 76, inventory: 1.4, bookToBill: 1.85, aiExposure: 90 },
 { name: "AMD", ticker: "AMD", segment: "Logic/GPU", revGrowth: 14, grossMargin: 50, inventory: 2.8, bookToBill: 1.10, aiExposure: 35 },
 { name: "Intel", ticker: "INTC", segment: "Logic/CPU", revGrowth: -8, grossMargin: 33, inventory: 3.9, bookToBill: 0.82, aiExposure: 15 },
 { name: "Samsung", ticker: "SSNLF", segment: "Memory/Logic", revGrowth: 22, grossMargin: 38, inventory: 4.2, bookToBill: 0.95, aiExposure: 28 },
 { name: "SK Hynix", ticker: "HXSCL", segment: "Memory/HBM", revGrowth: 68, grossMargin: 56, inventory: 1.8, bookToBill: 1.45, aiExposure: 55 },
 { name: "Micron", ticker: "MU", segment: "Memory", revGrowth: 84, grossMargin: 39, inventory: 2.3, bookToBill: 1.28, aiExposure: 42 },
 { name: "TI", ticker: "TXN", segment: "Analog", revGrowth: -5, grossMargin: 62, inventory: 5.1, bookToBill: 0.78, aiExposure: 8 },
 { name: "ASML", ticker: "ASML", segment: "Equipment/EUV", revGrowth: 10, grossMargin: 51, inventory: 1.6, bookToBill: 1.05, aiExposure: 60 },
 { name: "Broadcom", ticker: "AVGO", segment: "Custom Silicon", revGrowth: 44, grossMargin: 68, inventory: 1.2, bookToBill: 1.38, aiExposure: 65 },
];

interface MegaCap {
 ticker: string;
 name: string;
 marketCapT: number;
 revenueB: number;
 revGrowth: number;
 operatingMargin: number;
 pe: number;
 pFcf: number;
 evEbitda: number;
 buybackYield: number;
 netCashB: number;
 mainRisk: string;
 segments: { name: string; pct: number; color: string }[];
}

const MEGA_CAPS: MegaCap[] = [
 {
 ticker: "AAPL", name: "Apple", marketCapT: 3.2, revenueB: 391, revGrowth: 4,
 operatingMargin: 30, pe: 28, pFcf: 24, evEbitda: 20, buybackYield: 3.4, netCashB: -46,
 mainRisk: "Hardware upgrade cycle slowdown; China revenue exposure",
 segments: [
 { name: "iPhone", pct: 52, color: "#3b82f6" },
 { name: "Services", pct: 22, color: "#10b981" },
 { name: "Mac", pct: 8, color: "#8b5cf6" },
 { name: "iPad", pct: 7, color: "#f59e0b" },
 { name: "Wearables", pct: 7, color: "#ef4444" },
 { name: "Other", pct: 4, color: "#6b7280" },
 ],
 },
 {
 ticker: "MSFT", name: "Microsoft", marketCapT: 2.9, revenueB: 245, revGrowth: 15,
 operatingMargin: 45, pe: 32, pFcf: 30, evEbitda: 22, buybackYield: 1.0, netCashB: 31,
 mainRisk: "Enterprise spending slowdown; Azure growth deceleration",
 segments: [
 { name: "Intelligent Cloud", pct: 41, color: "#3b82f6" },
 { name: "Productivity/Office", pct: 33, color: "#10b981" },
 { name: "Personal Computing", pct: 26, color: "#8b5cf6" },
 ],
 },
 {
 ticker: "GOOGL", name: "Alphabet", marketCapT: 2.1, revenueB: 350, revGrowth: 12,
 operatingMargin: 32, pe: 21, pFcf: 20, evEbitda: 14, buybackYield: 1.8, netCashB: 93,
 mainRisk: "Search disruption by AI chatbots; DoJ antitrust ruling",
 segments: [
 { name: "Google Search", pct: 57, color: "#3b82f6" },
 { name: "YouTube", pct: 10, color: "#ef4444" },
 { name: "Google Cloud", pct: 12, color: "#10b981" },
 { name: "Other Bets", pct: 3, color: "#f59e0b" },
 { name: "Other Google", pct: 18, color: "#6b7280" },
 ],
 },
 {
 ticker: "AMZN", name: "Amazon", marketCapT: 2.0, revenueB: 621, revGrowth: 10,
 operatingMargin: 10, pe: 36, pFcf: 32, evEbitda: 18, buybackYield: 0.0, netCashB: -56,
 mainRisk: "AWS growth deceleration; e-commerce margin pressure",
 segments: [
 { name: "North America Retail", pct: 46, color: "#f59e0b" },
 { name: "International Retail", pct: 23, color: "#fb923c" },
 { name: "AWS", pct: 16, color: "#3b82f6" },
 { name: "Advertising", pct: 8, color: "#10b981" },
 { name: "Other", pct: 7, color: "#6b7280" },
 ],
 },
 {
 ticker: "META", name: "Meta", marketCapT: 1.4, revenueB: 164, revGrowth: 19,
 operatingMargin: 41, pe: 25, pFcf: 22, evEbitda: 15, buybackYield: 2.1, netCashB: 52,
 mainRisk: "Ad market cyclicality; Reality Labs losses; regulation",
 segments: [
 { name: "Family of Apps", pct: 98, color: "#3b82f6" },
 { name: "Reality Labs", pct: 2, color: "#8b5cf6" },
 ],
 },
 {
 ticker: "NVDA", name: "NVIDIA", marketCapT: 2.7, revenueB: 130, revGrowth: 114,
 operatingMargin: 62, pe: 38, pFcf: 35, evEbitda: 28, buybackYield: 0.8, netCashB: 38,
 mainRisk: "AI capex cycle pause; export controls; AMD/custom silicon competition",
 segments: [
 { name: "Data Center", pct: 87, color: "#10b981" },
 { name: "Gaming", pct: 9, color: "#3b82f6" },
 { name: "Professional Visualization", pct: 2, color: "#8b5cf6" },
 { name: "Auto & Other", pct: 2, color: "#f59e0b" },
 ],
 },
];

interface FintechRow {
 ticker: string;
 name: string;
 category: string;
 revGrowth: number;
 operatingMargin: number;
 keyMetric: string;
 keyValue: string;
 pe: number;
}

const FINTECH_DATA: FintechRow[] = [
 { ticker: "V", name: "Visa", category: "Payments", revGrowth: 9, operatingMargin: 67, keyMetric: "Volume Growth", keyValue: "+8% YoY", pe: 29 },
 { ticker: "MA", name: "Mastercard", category: "Payments", revGrowth: 11, operatingMargin: 60, keyMetric: "Volume Growth", keyValue: "+10% YoY", pe: 31 },
 { ticker: "PYPL", name: "PayPal", category: "Payments", revGrowth: 6, operatingMargin: 18, keyMetric: "TPV Growth", keyValue: "+7% YoY", pe: 14 },
 { ticker: "SQ", name: "Block (SQ)", category: "Payments", revGrowth: 11, operatingMargin: 8, keyMetric: "GPV Growth", keyValue: "+10% YoY", pe: 20 },
 { ticker: "ADYEN", name: "Adyen", category: "Payments", revGrowth: 22, operatingMargin: 42, keyMetric: "Processed Vol", keyValue: "+26% YoY", pe: 48 },
 { ticker: "SHOP", name: "Shopify", category: "E-commerce", revGrowth: 26, operatingMargin: 14, keyMetric: "GMV Growth", keyValue: "+24% YoY", pe: 55 },
 { ticker: "META", name: "Meta", category: "Social", revGrowth: 19, operatingMargin: 41, keyMetric: "ARPU", keyValue: "$14.25 Q4", pe: 25 },
 { ticker: "SNAP", name: "Snap", category: "Social", revGrowth: 14, operatingMargin: -15, keyMetric: "DAU Growth", keyValue: "+9% YoY", pe: -1 },
 { ticker: "PINS", name: "Pinterest", category: "Social", revGrowth: 18, operatingMargin: 12, keyMetric: "MAU Growth", keyValue: "+11% YoY", pe: 28 },
 { ticker: "UBER", name: "Uber", category: "Gig Economy", revGrowth: 20, operatingMargin: 8, keyMetric: "Bookings Growth", keyValue: "+21% YoY", pe: 18 },
 { ticker: "DASH", name: "DoorDash", category: "Gig Economy", revGrowth: 19, operatingMargin: -2, keyMetric: "GOV Growth", keyValue: "+18% YoY", pe: -1 },
 { ticker: "EA", name: "Elec. Arts", category: "Gaming", revGrowth: 3, operatingMargin: 24, keyMetric: "Live Services", keyValue: "74% of Rev", pe: 22 },
 { ticker: "RBLX", name: "Roblox", category: "Gaming", revGrowth: 22, operatingMargin: -25, keyMetric: "DAU Growth", keyValue: "+19% YoY", pe: -1 },
 { ticker: "NET", name: "Cloudflare", category: "Infra", revGrowth: 28, operatingMargin: 7, keyMetric: "Paying Customers", keyValue: "+13% YoY", pe: 65 },
 { ticker: "AKAM", name: "Akamai", category: "Infra", revGrowth: 6, operatingMargin: 20, keyMetric: "Security Rev", keyValue: "+16% YoY", pe: 18 },
];

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — SaaS Metrics Dashboard
// ══════════════════════════════════════════════════════════════════════════════

function SaasTab() {
 const [selected, setSelected] = useState<string | null>(null);
 const selectedCompany = selected ? SAAS_COMPANIES.find((c) => c.ticker === selected) : null;

 // Cohort data: 2021 cohort revenue growing via expansion
 const cohortYears = [2021, 2022, 2023, 2024, 2025, 2026];
 const cohortRevenue = [100, 118, 141, 168, 198, 231];

 const maxArr = Math.max(...SAAS_COMPANIES.map((c) => c.arrGrowth));
 const maxNrr = Math.max(...SAAS_COMPANIES.map((c) => c.nrr));
 const maxRule40 = Math.max(...SAAS_COMPANIES.map((c) => c.rule40));

 const sorted = [...SAAS_COMPANIES].sort((a, b) => b.nrr - a.nrr);

 return (
 <div className="space-y-4">
 {/* Page header */}
 <div className="flex items-start justify-between">
 <div>
 <h2 className="text-lg font-semibold text-foreground">SaaS Metrics Dashboard</h2>
 <p className="text-sm text-muted-foreground mt-0.5">
 Key operating metrics for cloud software companies
 </p>
 </div>
 <div className="flex gap-2">
 <Badge variant="outline" className="text-primary border-primary/40">
 12 Companies
 </Badge>
 <Badge variant="outline" className="text-emerald-300 border-emerald-500/40">
 Rule of 40
 </Badge>
 </div>
 </div>

 {/* Key concept boxes */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <InfoBox variant="blue">
 <strong>Rule of 40</strong> — Revenue growth % + FCF margin % &gt; 40 indicates a healthy SaaS business balancing growth and profitability. Elite SaaS often scores 50+.
 </InfoBox>
 <InfoBox variant="emerald">
 <strong>Net Revenue Retention (NRR)</strong> — &gt;100% means existing customers spend more than new ones churn. NRR &gt;120% is best-in-class, showing strong upsell/expansion.
 </InfoBox>
 <InfoBox variant="violet">
 <strong>Magic Number</strong> — (ΔRevenue × Gross Margin) / S&amp;M Spend. &gt;0.75 is healthy, &gt;1.0 is excellent. Measures go-to-market efficiency.
 </InfoBox>
 </div>

 {/* Summary stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatCard
 label="Avg Rule of 40"
 value={`${(SAAS_COMPANIES.reduce((a, c) => a + c.rule40, 0) / SAAS_COMPANIES.length).toFixed(0)}`}
 sub="Median: 44"
 highlight="pos"
 />
 <StatCard
 label="Avg NRR"
 value={`${(SAAS_COMPANIES.reduce((a, c) => a + c.nrr, 0) / SAAS_COMPANIES.length).toFixed(0)}%`}
 sub="Best-in-class >120%"
 highlight="pos"
 />
 <StatCard
 label="Avg Gross Margin"
 value={`${(SAAS_COMPANIES.reduce((a, c) => a + c.grossMargin, 0) / SAAS_COMPANIES.length).toFixed(0)}%`}
 sub="SaaS median ~76%"
 highlight="neutral"
 />
 <StatCard
 label="Avg LTV/CAC"
 value={`${(SAAS_COMPANIES.reduce((a, c) => a + c.ltvCacRatio, 0) / SAAS_COMPANIES.length).toFixed(1)}x`}
 sub=">3x is healthy"
 highlight="pos"
 />
 </div>

 {/* Company table */}
 <div>
 <SectionTitle>
 <BarChart3 className="w-4 h-4" /> SaaS Company Metrics
 </SectionTitle>
 <div className="overflow-x-auto rounded-md border border-border">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border bg-foreground/5">
 <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">Ticker</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">ARR Growth</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">NRR</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">LTV/CAC</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Gross Margin</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">FCF Margin</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Rule of 40</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Magic #</th>
 </tr>
 </thead>
 <tbody>
 {SAAS_COMPANIES.map((c) => (
 <tr
 key={c.ticker}
 onClick={() => setSelected(selected === c.ticker ? null : c.ticker)}
 className={cn(
 "border-b border-border cursor-pointer transition-colors",
 selected === c.ticker
 ? "bg-muted/10"
 : "hover:bg-muted/30"
 )}
 >
 <td className="px-3 py-2.5">
 <span className="font-mono font-medium text-foreground">{c.ticker}</span>
 <span className="text-muted-foreground ml-1.5">{c.name}</span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className={posNegClass(c.arrGrowth)}>{fmtPct(c.arrGrowth, 0)}</span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className={c.nrr >= 120 ? "text-emerald-400 font-medium" : c.nrr >= 110 ? "text-primary" : "text-muted-foreground"}>
 {c.nrr}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-right text-foreground">{fmtX(c.ltvCacRatio)}</td>
 <td className="px-3 py-2.5 text-right text-foreground">{c.grossMargin}%</td>
 <td className="px-3 py-2.5 text-right">
 <span className={posNegClass(c.fcfMargin)}>{c.fcfMargin}%</span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className={c.rule40 >= 40 ? "text-emerald-400 font-medium" : "text-amber-400"}>
 {c.rule40}
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className={c.magicNumber >= 1.0 ? "text-emerald-400" : c.magicNumber >= 0.75 ? "text-primary" : "text-amber-400"}>
 {c.magicNumber.toFixed(2)}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Selected company detail */}
 
 {selectedCompany && (
 <div
 className="rounded-md border border-primary/30 bg-muted/5 p-4"
 >
 <div className="flex items-center justify-between mb-4">
 <h4 className="font-medium text-foreground text-sm">
 {selectedCompany.ticker} — {selectedCompany.name} Detail
 </h4>
 <Badge
 variant="outline"
 className={
 selectedCompany.rule40 >= 40
 ? "text-emerald-300 border-emerald-500/40"
 : "text-amber-300 border-amber-500/40"
 }
 >
 Rule of 40: {selectedCompany.rule40}
 </Badge>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
 <StatCard label="ARR Growth" value={fmtPct(selectedCompany.arrGrowth, 0)} highlight="pos" />
 <StatCard label="NRR" value={`${selectedCompany.nrr}%`} highlight={selectedCompany.nrr >= 120 ? "pos" : "neutral"} />
 <StatCard label="CAC" value={`$${(selectedCompany.cac / 1000).toFixed(0)}K`} />
 <StatCard label="LTV/CAC" value={fmtX(selectedCompany.ltvCacRatio)} highlight="pos" />
 </div>
 <div className="space-y-2">
 <MiniBar label="ARR Growth" value={selectedCompany.arrGrowth} max={maxArr} color="bg-primary" />
 <MiniBar label="NRR" value={selectedCompany.nrr - 100} max={maxNrr - 100} color="bg-emerald-500" suffix="% above 100" />
 <MiniBar label="Gross Margin" value={selectedCompany.grossMargin} max={100} color="bg-orange-500" />
 <MiniBar label="Rule of 40" value={selectedCompany.rule40} max={maxRule40} color={selectedCompany.rule40 >= 40 ? "bg-emerald-500" : "bg-amber-500"} suffix="" />
 </div>
 </div>
 )}
 

 {/* NRR Leaderboard */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <div>
 <SectionTitle>
 <TrendingUp className="w-4 h-4 text-emerald-400" /> NRR Leaderboard (Top Expansion)
 </SectionTitle>
 <div className="space-y-2">
 {sorted.map((c, i) => (
 <div key={c.ticker} className="flex items-center gap-3 rounded-lg bg-foreground/5 px-3 py-2">
 <span className="text-muted-foreground text-xs w-4">{i + 1}</span>
 <span className="font-mono text-xs font-medium text-foreground w-12">{c.ticker}</span>
 <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
 <div
 className={cn("h-full rounded-full", c.nrr >= 120 ? "bg-emerald-500" : c.nrr >= 110 ? "bg-primary" : "bg-muted-foreground")}
 style={{ width: `${Math.min(100, ((c.nrr - 100) / 35) * 100)}%` }}
 />
 </div>
 <span className={cn("text-xs font-medium w-10 text-right", c.nrr >= 120 ? "text-emerald-400" : "text-muted-foreground")}>
 {c.nrr}%
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Cohort Analysis */}
 <div>
 <SectionTitle>
 <Activity className="w-3.5 h-3.5 text-muted-foreground/50" /> 2021 Cohort Revenue (Indexed to 100)
 </SectionTitle>
 <div className="rounded-md bg-foreground/5 border border-border p-3">
 <svg viewBox="0 0 360 180" className="w-full">
 {/* Grid */}
 {[0, 50, 100, 150, 200, 250].map((v) => {
 const y = 160 - (v / 250) * 140;
 return (
 <g key={v}>
 <line x1="40" y1={y} x2="340" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
 <text x="35" y={y + 4} fill="#71717a" fontSize="9" textAnchor="end">{v}</text>
 </g>
 );
 })}
 {/* X axis labels */}
 {cohortYears.map((yr, i) => {
 const x = 40 + i * (300 / 5);
 return <text key={yr} x={x} y="175" fill="#71717a" fontSize="9" textAnchor="middle">{yr}</text>;
 })}
 {/* Area fill */}
 <defs>
 <linearGradient id="cohortGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
 <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
 </linearGradient>
 </defs>
 <path
 d={
 cohortRevenue
 .map((v, i) => {
 const x = 40 + i * (300 / 5);
 const y = 160 - (v / 250) * 140;
 return `${i === 0 ? "M" : "L"} ${x} ${y}`;
 })
 .join(" ") +
 ` L ${40 + 5 * (300 / 5)} 160 L 40 160 Z`
 }
 fill="url(#cohortGrad)"
 />
 {/* Line */}
 <polyline
 points={cohortRevenue
 .map((v, i) => `${40 + i * (300 / 5)},${160 - (v / 250) * 140}`)
 .join(" ")}
 fill="none"
 stroke="#3b82f6"
 strokeWidth="2"
 />
 {/* Dots */}
 {cohortRevenue.map((v, i) => (
 <circle
 key={i}
 cx={40 + i * (300 / 5)}
 cy={160 - (v / 250) * 140}
 r="3"
 fill="#3b82f6"
 />
 ))}
 </svg>
 <p className="text-xs text-muted-foreground text-center mt-1">
 Revenue indexed to 100 at cohort inception — expansion + upsell drives 131% growth by 2026
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — AI & Infrastructure
// ══════════════════════════════════════════════════════════════════════════════

const AI_CHIP_SHARES = [
 { name: "NVIDIA H100/H200", pct: 80, color: "#10b981" },
 { name: "AMD MI300X", pct: 10, color: "#3b82f6" },
 { name: "Google TPU v5", pct: 5, color: "#f59e0b" },
 { name: "Amazon Trainium", pct: 3, color: "#fb923c" },
 { name: "Other Custom", pct: 2, color: "#8b5cf6" },
];

const CLOUD_SHARE = [
 { name: "AWS", pct: 32, color: "#f59e0b" },
 { name: "Azure", pct: 23, color: "#3b82f6" },
 { name: "GCP", pct: 12, color: "#10b981" },
 { name: "Other", pct: 33, color: "#6b7280" },
];

const AI_ADOPTION_STAGES = [
 { stage: "Experimentation", pct: 15, description: "Pilots and POCs, limited production deployment" },
 { stage: "Early Production", pct: 35, description: "1-5 use cases in production, siloed adoption" },
 { stage: "Scaling", pct: 30, description: "AI integrated into core workflows, platform approach" },
 { stage: "AI-Native", pct: 12, description: "AI-first product strategy, autonomous agents in prod" },
 { stage: "Not Started", pct: 8, description: "Evaluating or waiting for maturity" },
];

function AiInfraTab() {
 const [activeHyperscaler, setActiveHyperscaler] = useState<string | null>(null);

 return (
 <div className="space-y-4">
 <div className="flex items-start justify-between">
 <div>
 <h2 className="text-lg font-medium text-foreground">AI & Infrastructure</h2>
 <p className="text-sm text-muted-foreground mt-0.5">
 AI hyperscalers, chip markets, cloud dynamics, and monetization
 </p>
 </div>
 </div>

 {/* Key stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatCard label="Global AI Capex 2025" value="~$320B" sub="AWS+Azure+GCP+Meta" highlight="neutral" />
 <StatCard label="NVDA Data Center Rev" value="$96B" sub="+114% YoY" highlight="pos" />
 <StatCard label="AI Adoption (Enterprise)" value="85%" sub="Experimenting or in production" highlight="neutral" />
 <StatCard label="Cloud Market Growth" value="+21%" sub="IaaS/PaaS YoY" highlight="pos" />
 </div>

 {/* AI Hyperscaler comparison */}
 <div>
 <SectionTitle>
 <Zap className="w-4 h-4 text-yellow-400" /> AI Hyperscaler Comparison
 </SectionTitle>
 <div className="overflow-x-auto rounded-md border border-border">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border bg-foreground/5">
 <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">Company</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">AI Revenue</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">AI Growth</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Capex (Bn)</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Op. Margin</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Cloud Share</th>
 </tr>
 </thead>
 <tbody>
 {AI_HYPERSCALERS.map((h) => (
 <tr
 key={h.ticker}
 onClick={() => setActiveHyperscaler(activeHyperscaler === h.ticker ? null : h.ticker)}
 className={cn(
 "border-b border-border cursor-pointer transition-colors",
 activeHyperscaler === h.ticker ? "bg-orange-500/10" : "hover:bg-muted/30"
 )}
 >
 <td className="px-3 py-2.5">
 <span className="font-mono font-medium text-foreground">{h.ticker}</span>
 <span className="text-muted-foreground ml-1.5">{h.name}</span>
 </td>
 <td className="px-3 py-2.5 text-right text-foreground">{fmtB(h.aiRevenue)}</td>
 <td className="px-3 py-2.5 text-right">
 <span className={posNegClass(h.aiGrowth)}>{fmtPct(h.aiGrowth, 0)}</span>
 </td>
 <td className="px-3 py-2.5 text-right text-foreground">${h.capexBn}B</td>
 <td className="px-3 py-2.5 text-right">
 <span className={h.operatingMargin >= 40 ? "text-emerald-400" : "text-muted-foreground"}>
 {h.operatingMargin}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-right text-muted-foreground">
 {h.cloudShare > 0 ? `${h.cloudShare}%` : "—"}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Two-column section: AI chip market + Cloud share */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {/* AI Chip market share */}
 <div>
 <SectionTitle>
 <Cpu className="w-3.5 h-3.5 text-muted-foreground/50" /> AI Chip Market Share
 </SectionTitle>
 <div className="rounded-md bg-foreground/5 border border-border p-4">
 {/* Donut */}
 <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto">
 {(() => {
 let cumAngle = -90;
 return AI_CHIP_SHARES.map((seg) => {
 const angle = (seg.pct / 100) * 360;
 const startRad = (cumAngle * Math.PI) / 180;
 const endRad = ((cumAngle + angle) * Math.PI) / 180;
 const cx = 100, cy = 100, r = 70, innerR = 42;
 const x1 = cx + r * Math.cos(startRad);
 const y1 = cy + r * Math.sin(startRad);
 const x2 = cx + r * Math.cos(endRad);
 const y2 = cy + r * Math.sin(endRad);
 const xi1 = cx + innerR * Math.cos(endRad);
 const yi1 = cy + innerR * Math.sin(endRad);
 const xi2 = cx + innerR * Math.cos(startRad);
 const yi2 = cy + innerR * Math.sin(startRad);
 const large = angle > 180 ? 1 : 0;
 const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${innerR} ${innerR} 0 ${large} 0 ${xi2} ${yi2} Z`;
 cumAngle += angle;
 return <path key={seg.name} d={d} fill={seg.color} opacity="0.85" />;
 });
 })()}
 <text x="100" y="96" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">80%</text>
 <text x="100" y="112" textAnchor="middle" fill="#a1a1aa" fontSize="9">NVIDIA</text>
 </svg>
 <div className="space-y-1.5 mt-2">
 {AI_CHIP_SHARES.map((seg) => (
 <div key={seg.name} className="flex items-center gap-2">
 <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: seg.color }} />
 <span className="text-xs text-muted-foreground flex-1">{seg.name}</span>
 <span className="text-xs font-medium text-foreground">{seg.pct}%</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Cloud market share */}
 <div>
 <SectionTitle>
 <Cloud className="w-3.5 h-3.5 text-muted-foreground/50" /> Cloud Market Share (IaaS/PaaS)
 </SectionTitle>
 <div className="rounded-md bg-foreground/5 border border-border p-4">
 <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto">
 {(() => {
 let cumAngle = -90;
 return CLOUD_SHARE.map((seg) => {
 const angle = (seg.pct / 100) * 360;
 const startRad = (cumAngle * Math.PI) / 180;
 const endRad = ((cumAngle + angle) * Math.PI) / 180;
 const cx = 100, cy = 100, r = 70, innerR = 42;
 const x1 = cx + r * Math.cos(startRad);
 const y1 = cy + r * Math.sin(startRad);
 const x2 = cx + r * Math.cos(endRad);
 const y2 = cy + r * Math.sin(endRad);
 const xi1 = cx + innerR * Math.cos(endRad);
 const yi1 = cy + innerR * Math.sin(endRad);
 const xi2 = cx + innerR * Math.cos(startRad);
 const yi2 = cy + innerR * Math.sin(startRad);
 const large = angle > 180 ? 1 : 0;
 const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${innerR} ${innerR} 0 ${large} 0 ${xi2} ${yi2} Z`;
 cumAngle += angle;
 return <path key={seg.name} d={d} fill={seg.color} opacity="0.85" />;
 });
 })()}
 <text x="100" y="96" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Cloud</text>
 <text x="100" y="112" textAnchor="middle" fill="#a1a1aa" fontSize="9">Market Share</text>
 </svg>
 <div className="space-y-1.5 mt-2">
 {CLOUD_SHARE.map((seg) => (
 <div key={seg.name} className="flex items-center gap-2">
 <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: seg.color }} />
 <span className="text-xs text-muted-foreground flex-1">{seg.name}</span>
 <span className="text-xs font-medium text-foreground">{seg.pct}%</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 {/* AI adoption curve */}
 <div>
 <SectionTitle>
 <TrendingUp className="w-4 h-4 text-emerald-400" /> Enterprise AI Adoption Stages
 </SectionTitle>
 <div className="space-y-2">
 {AI_ADOPTION_STAGES.map((stage) => (
 <div key={stage.stage} className="flex items-center gap-3 rounded-lg bg-foreground/5 px-3 py-2.5">
 <span className="text-xs font-semibold text-foreground w-32 shrink-0">{stage.stage}</span>
 <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
 <div
 className="h-full bg-primary rounded-full"
 style={{ width: `${stage.pct}%` }}
 />
 </div>
 <span className="text-xs font-medium text-muted-foreground w-8 text-right">{stage.pct}%</span>
 <span className="text-xs text-muted-foreground hidden md:block max-w-xs">{stage.description}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Data center costs */}
 <div>
 <SectionTitle>
 <Server className="w-4 h-4 text-amber-400" /> Data Center Cost Pressures
 </SectionTitle>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <InfoBox variant="amber">
 <strong>Power Consumption</strong> — A single H100 cluster (8 GPUs) consumes ~6.4kW. A 100K GPU data center needs ~80 MW — equivalent to a small city. Power costs now 25-40% of AI inference cost.
 </InfoBox>
 <InfoBox variant="amber">
 <strong>GPU Cost</strong> — NVIDIA H100 server: ~$200K-250K. H200: ~$350K. Hyperscalers are paying billions per quarter. Custom silicon (TPU, Trainium) costs 30-60% less per FLOP at scale.
 </InfoBox>
 <InfoBox variant="amber">
 <strong>Cooling Innovation</strong> — Traditional air cooling fails above 40kW/rack. Liquid cooling adoption accelerating. Meta and Microsoft deploying immersion cooling for AI pods.
 </InfoBox>
 </div>
 </div>

 {/* AI monetization */}
 <div>
 <SectionTitle>
 <DollarSign className="w-4 h-4 text-emerald-400" /> AI Monetization: Who Is Capturing Revenue?
 </SectionTitle>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {[
 { name: "NVIDIA", score: 95, status: "Direct hardware revenue. $96B AI data center annually. Clear monetization.", color: "emerald" },
 { name: "Microsoft/Azure", score: 78, status: "Copilot $30/seat/mo. Azure OpenAI API. GitHub Copilot 1.8M+ paid users.", color: "emerald" },
 { name: "Google/GCP", score: 71, status: "Gemini in Workspace, Search AI Overviews, GCP AI services. Monetization still maturing.", color: "blue" },
 { name: "Amazon/AWS", score: 74, status: "Bedrock, CodeWhisperer, Q Business. Inferentia for cost advantage. Growing fast.", color: "blue" },
 { name: "Meta", score: 52, status: "AI ad targeting lifting CPMs +15-20%. Llama open-source strategy for ecosystem play.", color: "amber" },
 { name: "Salesforce", score: 60, status: "Agentforce platform. AI SKUs at 2-3x premium. Early traction but proving ROI.", color: "amber" },
 ].map((item) => (
 <div key={item.name} className={cn(
 "rounded-md border p-3",
 item.color === "emerald" ? "border-emerald-500/30 bg-emerald-500/5"
 : item.color === "blue" ? "border-primary/30 bg-muted/5"
 : "border-amber-500/30 bg-amber-500/5"
 )}>
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-medium text-foreground">{item.name}</span>
 <Badge
 variant="outline"
 className={cn(
 "text-xs text-muted-foreground",
 item.color === "emerald" ? "text-emerald-300 border-emerald-500/40"
 : item.color === "blue" ? "text-primary border-primary/40"
 : "text-amber-300 border-amber-500/40"
 )}
 >
 Score: {item.score}/100
 </Badge>
 </div>
 <div className="h-1.5 bg-foreground/10 rounded-full mb-2">
 <div
 className={cn("h-full rounded-full", item.color === "emerald" ? "bg-emerald-500" : item.color === "blue" ? "bg-primary" : "bg-amber-500")}
 style={{ width: `${item.score}%` }}
 />
 </div>
 <p className="text-xs text-muted-foreground">{item.status}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Semiconductor Cycle
// ══════════════════════════════════════════════════════════════════════════════

const SEMI_CYCLE_PHASES = [
 { phase: "Shortage", year: "2020-21", description: "COVID-driven demand surge. Lead times >52 weeks. Panic ordering doubles." },
 { phase: "Accumulation", year: "2022", description: "Supply catches up. Customers hold excess inventory. Capex at peak." },
 { phase: "Correction", year: "2022-23", description: "Demand softens. OEMs work down inventory. ASPs fall. Revenue -20 to -40%." },
 { phase: "Recovery", year: "2023-24", description: "Inventory normalized. Orders recovering. AI demand creates new shortage dynamic." },
 { phase: "AI Upcycle", year: "2024-26", description: "AI-driven HBM and advanced logic in short supply. New shortage forming." },
];

function SemiCycleTab() {
 const [selectedSemi, setSelectedSemi] = useState<string | null>(null);

 const maxBookBill = Math.max(...SEMI_COMPANIES.map((c) => c.bookToBill));

 return (
 <div className="space-y-4">
 <div className="flex items-start justify-between">
 <div>
 <h2 className="text-lg font-medium text-foreground">Semiconductor Cycle</h2>
 <p className="text-sm text-muted-foreground mt-0.5">
 Inventory cycles, AI-driven demand, geopolitical risk, and market structure
 </p>
 </div>
 </div>

 {/* Summary stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatCard label="Avg Book-to-Bill" value={`${(SEMI_COMPANIES.reduce((a, c) => a + c.bookToBill, 0) / SEMI_COMPANIES.length).toFixed(2)}x`} sub=">1.0 is demand positive" highlight="pos" />
 <StatCard label="TSMC Advanced Node" value="N3/N2" sub="Most advanced logic globally" highlight="neutral" />
 <StatCard label="HBM Supply Shortage" value="Tight" sub="SK Hynix allocated through 2026" highlight="neg" />
 <StatCard label="Memory Upcycle" value="+84% MU" sub="AI HBM demand driving recovery" highlight="pos" />
 </div>

 {/* Semiconductor cycle phases */}
 <div>
 <SectionTitle>
 <Activity className="w-3.5 h-3.5 text-muted-foreground/50" /> Semiconductor Cycle Phases
 </SectionTitle>
 <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
 {SEMI_CYCLE_PHASES.map((phase, i) => (
 <div
 key={phase.phase}
 className={cn(
 "rounded-md border p-3 flex flex-col gap-1",
 i === 4
 ? "border-emerald-500/40 bg-emerald-500/5"
 : i === 2
 ? "border-rose-500/40 bg-rose-500/10"
 : "border-border bg-foreground/5"
 )}
 >
 <div className="flex items-center gap-1.5 mb-1">
 <div
 className={cn(
 "w-2 h-2 rounded-full",
 i === 4 ? "bg-emerald-500" : i === 2 ? "bg-rose-500" : i === 3 ? "bg-primary" : "bg-muted-foreground"
 )}
 />
 <span className="text-xs font-medium text-foreground">{phase.phase}</span>
 </div>
 <span className="text-xs text-muted-foreground font-mono">{phase.year}</span>
 <p className="text-xs text-muted-foreground leading-relaxed">{phase.description}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Company table */}
 <div>
 <SectionTitle>
 <BarChart3 className="w-4 h-4" /> Key Semiconductor Companies
 </SectionTitle>
 <div className="overflow-x-auto rounded-md border border-border">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border bg-foreground/5">
 <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">Company</th>
 <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">Segment</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Rev Growth</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Gross Margin</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Inventory (mo)</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Book/Bill</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">AI Exposure</th>
 </tr>
 </thead>
 <tbody>
 {SEMI_COMPANIES.map((c) => (
 <tr
 key={c.ticker}
 onClick={() => setSelectedSemi(selectedSemi === c.ticker ? null : c.ticker)}
 className={cn(
 "border-b border-border cursor-pointer transition-colors",
 selectedSemi === c.ticker ? "bg-muted/10" : "hover:bg-muted/30"
 )}
 >
 <td className="px-3 py-2.5">
 <span className="font-mono font-medium text-foreground">{c.ticker}</span>
 <span className="text-muted-foreground ml-1.5">{c.name}</span>
 </td>
 <td className="px-3 py-2.5">
 <Badge variant="outline" className="text-muted-foreground border-border text-xs">
 {c.segment}
 </Badge>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className={posNegClass(c.revGrowth)}>{fmtPct(c.revGrowth, 0)}</span>
 </td>
 <td className="px-3 py-2.5 text-right text-foreground">{c.grossMargin}%</td>
 <td className="px-3 py-2.5 text-right">
 <span className={c.inventory > 3.5 ? "text-rose-400" : c.inventory > 2.5 ? "text-amber-400" : "text-emerald-400"}>
 {c.inventory.toFixed(1)} mo
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className={c.bookToBill >= 1.0 ? "text-emerald-400 font-medium" : "text-rose-400"}>
 {c.bookToBill.toFixed(2)}x
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className={c.aiExposure >= 50 ? "text-emerald-400" : c.aiExposure >= 30 ? "text-primary" : "text-muted-foreground"}>
 {c.aiExposure}%
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Book-to-bill chart */}
 <div>
 <SectionTitle>
 <BarChart3 className="w-4 h-4 text-emerald-400" /> Book-to-Bill Ratio
 </SectionTitle>
 <div className="rounded-md bg-foreground/5 border border-border p-4">
 <svg viewBox="0 0 520 180" className="w-full">
 {/* Reference line at 1.0 */}
 {(() => {
 const baseline = 160 - (1.0 / 2.0) * 140;
 return (
 <line x1="40" y1={baseline} x2="510" y2={baseline} stroke="#ef4444" strokeDasharray="4,3" strokeWidth="1" />
 );
 })()}
 <text x="512" y={160 - (1.0 / 2.0) * 140 + 4} fill="#ef4444" fontSize="8" textAnchor="end">1.0x neutral</text>

 {/* Y axis labels */}
 {[0, 0.5, 1.0, 1.5, 2.0].map((v) => {
 const y = 160 - (v / 2.0) * 140;
 return (
 <text key={v} x="35" y={y + 4} fill="#71717a" fontSize="8" textAnchor="end">{v.toFixed(1)}</text>
 );
 })}

 {/* Bars */}
 {SEMI_COMPANIES.map((c, i) => {
 const barW = 38;
 const gap = 12;
 const x = 44 + i * (barW + gap);
 const barH = (c.bookToBill / 2.0) * 140;
 const y = 160 - barH;
 const color = c.bookToBill >= 1.0 ? "#10b981" : "#ef4444";
 return (
 <g key={c.ticker}>
 <rect x={x} y={y} width={barW} height={barH} fill={color} opacity="0.7" rx="2" />
 <text x={x + barW / 2} y={y - 3} fill={color} fontSize="7.5" textAnchor="middle" fontWeight="bold">
 {c.bookToBill.toFixed(2)}
 </text>
 <text x={x + barW / 2} y="175" fill="#71717a" fontSize="7" textAnchor="middle">
 {c.ticker}
 </text>
 </g>
 );
 })}
 </svg>
 </div>
 </div>

 {/* AI-specific demand */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <InfoBox variant="emerald">
 <strong>HBM Memory (AI-critical)</strong> — High-Bandwidth Memory is essential for AI accelerators. SK Hynix leads with HBM3e (280GB/s bandwidth). Entire 2025-26 HBM supply is allocated to NVIDIA, AMD, and custom silicon customers. Samsung ramping yield.
 </InfoBox>
 <InfoBox variant="violet">
 <strong>CoWoS Packaging &amp; TSMC Centrality</strong> — Chip-on-Wafer-on-Substrate (CoWoS) is TSMC&apos;s advanced packaging needed for HBM+GPU stacking. TSMC controls N3/N2 logic AND CoWoS — making it the single most critical chokepoint in AI hardware. Taiwan geopolitical risk is the key tail risk.
 </InfoBox>
 </div>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Mega-Cap Tech
// ══════════════════════════════════════════════════════════════════════════════

function MegaCapTab() {
 const [selected, setSelected] = useState<string>("NVDA");
 const company = MEGA_CAPS.find((c) => c.ticker === selected)!;

 return (
 <div className="space-y-4">
 <div className="flex items-start justify-between">
 <div>
 <h2 className="text-lg font-medium text-foreground">Mega-Cap Tech Comparison</h2>
 <p className="text-sm text-muted-foreground mt-0.5">
 FAANGM deep dive: revenue mix, valuation, capital return, risks
 </p>
 </div>
 </div>

 {/* Summary stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatCard
 label="Combined Market Cap"
 value="~$14.3T"
 sub="~25% of S&P 500"
 highlight="neutral"
 />
 <StatCard label="Avg Rev Growth" value="+29%" sub="NVDA massively skewed" highlight="pos" />
 <StatCard label="Avg Op Margin" value="40%" sub="vs S&P 500 ~12%" highlight="pos" />
 <StatCard label="Total Capex 2025" value="~$294B" sub="AI-driven surge" highlight="neutral" />
 </div>

 {/* Selector */}
 <div className="flex gap-2 flex-wrap">
 {MEGA_CAPS.map((c) => (
 <button
 key={c.ticker}
 onClick={() => setSelected(c.ticker)}
 className={cn(
 "px-3 py-1.5 rounded-lg text-xs text-muted-foreground font-mono font-medium transition-colors",
 selected === c.ticker
 ? "bg-primary text-foreground"
 : "bg-foreground/5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
 )}
 >
 {c.ticker}
 </button>
 ))}
 </div>

 {/* Selected company detail */}
 
 <div
 key={company.ticker}
 className="grid grid-cols-1 md:grid-cols-2 gap-3"
 >
 {/* Left: metrics */}
 <div className="space-y-4">
 <div className="rounded-md border border-border bg-foreground/5 p-4">
 <h4 className="font-medium text-foreground text-sm mb-3">{company.name} ({company.ticker})</h4>
 <div className="grid grid-cols-2 gap-2">
 {[
 { label: "Market Cap", value: fmtB(company.marketCapT * 1000) },
 { label: "Revenue", value: fmtB(company.revenueB) },
 { label: "Rev Growth", value: fmtPct(company.revGrowth, 0), cls: posNegClass(company.revGrowth) },
 { label: "Op Margin", value: `${company.operatingMargin}%`, cls: company.operatingMargin >= 40 ? "text-emerald-400" : "text-foreground" },
 { label: "P/E", value: `${company.pe}x` },
 { label: "P/FCF", value: `${company.pFcf}x` },
 { label: "EV/EBITDA", value: `${company.evEbitda}x` },
 { label: "Buyback Yield", value: `${company.buybackYield}%`, cls: company.buybackYield > 1 ? "text-emerald-400" : "text-muted-foreground" },
 { label: "Net Cash", value: fmtB(Math.abs(company.netCashB)), cls: company.netCashB >= 0 ? "text-emerald-400" : "text-rose-400" },
 ].map((m) => (
 <div key={m.label} className="flex justify-between text-xs text-muted-foreground border-b border-border py-1.5">
 <span className="text-muted-foreground">{m.label}</span>
 <span className={cn("font-mono font-medium", m.cls ?? "text-foreground")}>{m.value}</span>
 </div>
 ))}
 </div>
 </div>
 <InfoBox variant="amber">
 <strong>Key Risk:</strong> {company.mainRisk}
 </InfoBox>
 </div>

 {/* Right: revenue mix donut + antitrust */}
 <div className="space-y-4">
 <div>
 <SectionTitle>Revenue Mix</SectionTitle>
 <div className="rounded-md bg-foreground/5 border border-border p-4">
 <svg viewBox="0 0 200 200" className="w-36 h-36 mx-auto">
 {(() => {
 let cumAngle = -90;
 return company.segments.map((seg) => {
 const angle = (seg.pct / 100) * 360;
 const startRad = (cumAngle * Math.PI) / 180;
 const endRad = ((cumAngle + angle) * Math.PI) / 180;
 const cx = 100, cy = 100, r = 70, innerR = 40;
 const x1 = cx + r * Math.cos(startRad);
 const y1 = cy + r * Math.sin(startRad);
 const x2 = cx + r * Math.cos(endRad);
 const y2 = cy + r * Math.sin(endRad);
 const xi1 = cx + innerR * Math.cos(endRad);
 const yi1 = cy + innerR * Math.sin(endRad);
 const xi2 = cx + innerR * Math.cos(startRad);
 const yi2 = cy + innerR * Math.sin(startRad);
 const large = angle > 180 ? 1 : 0;
 const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${innerR} ${innerR} 0 ${large} 0 ${xi2} ${yi2} Z`;
 cumAngle += angle;
 return <path key={seg.name} d={d} fill={seg.color} opacity="0.85" />;
 });
 })()}
 <text x="100" y="96" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{company.ticker}</text>
 <text x="100" y="110" textAnchor="middle" fill="#a1a1aa" fontSize="8">Revenue</text>
 </svg>
 <div className="space-y-1 mt-2">
 {company.segments.map((seg) => (
 <div key={seg.name} className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: seg.color }} />
 <span className="text-xs text-muted-foreground flex-1">{seg.name}</span>
 <span className="text-xs font-medium text-foreground">{seg.pct}%</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 

 {/* Comparison table */}
 <div>
 <SectionTitle>
 <BarChart3 className="w-4 h-4" /> Valuation Comparison
 </SectionTitle>
 <div className="overflow-x-auto rounded-md border border-border">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border bg-foreground/5">
 <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">Ticker</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Market Cap</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Rev Growth</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Op Margin</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">P/E</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">P/FCF</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">EV/EBITDA</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Buyback %</th>
 </tr>
 </thead>
 <tbody>
 {MEGA_CAPS.map((c) => (
 <tr
 key={c.ticker}
 onClick={() => setSelected(c.ticker)}
 className={cn(
 "border-b border-border cursor-pointer transition-colors",
 selected === c.ticker ? "bg-muted/10" : "hover:bg-muted/30"
 )}
 >
 <td className="px-3 py-2.5 font-mono font-medium text-foreground">{c.ticker}</td>
 <td className="px-3 py-2.5 text-right text-foreground">{fmtB(c.marketCapT * 1000)}</td>
 <td className="px-3 py-2.5 text-right">
 <span className={posNegClass(c.revGrowth)}>{fmtPct(c.revGrowth, 0)}</span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className={c.operatingMargin >= 40 ? "text-emerald-400" : "text-muted-foreground"}>
 {c.operatingMargin}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-right text-foreground">{c.pe}x</td>
 <td className="px-3 py-2.5 text-right text-foreground">{c.pFcf}x</td>
 <td className="px-3 py-2.5 text-right text-foreground">{c.evEbitda}x</td>
 <td className="px-3 py-2.5 text-right">
 <span className={c.buybackYield > 1 ? "text-emerald-400" : "text-muted-foreground"}>
 {c.buybackYield}%
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Antitrust section */}
 <div>
 <SectionTitle>
 <Shield className="w-4 h-4 text-rose-400" /> Antitrust &amp; Regulatory Landscape
 </SectionTitle>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {[
 { company: "GOOGL", risk: "High", desc: "DOJ ruling: Google illegally monopolized search. Potential remedies include forced sale of Chrome, default search contracts prohibited. Could fragment search ad revenue stream." },
 { company: "AAPL", risk: "Medium", desc: "DOJ antitrust suit on App Store practices. EU DMA forces app sideloading and alternative browser engines. Could reduce services revenue 10-20%." },
 { company: "META", risk: "Medium", desc: "FTC suit seeking to unwind Instagram/WhatsApp acquisitions. Congress examining social media harm to minors. EU DSA compliance costs rising." },
 { company: "AMZN", risk: "Medium", desc: "FTC targeting marketplace seller practices and Alexa AI. AWS dominance scrutiny from EU. Potential forced separation of marketplace from logistics." },
 { company: "MSFT", risk: "Low-Medium", desc: "Activision acquisition approved after remedies. CMA monitoring. GitHub Copilot IP litigation ongoing. EU probing Teams bundling." },
 { company: "NVDA", risk: "Low", desc: "Export controls on H100/H200/B100 to China, Russia, and certain other markets. AI chip export restrictions limiting 10-20% of addressable market." },
 ].map((item) => (
 <div
 key={item.company}
 className={cn(
 "rounded-md border p-3",
 item.risk === "High" ? "border-rose-500/30 bg-rose-500/5"
 : item.risk === "Medium" ? "border-amber-500/30 bg-amber-500/5"
 : "border-muted-foreground/30 bg-foreground/5"
 )}
 >
 <div className="flex items-center justify-between mb-1.5">
 <span className="font-mono font-medium text-foreground text-sm">{item.company}</span>
 <Badge
 variant="outline"
 className={cn(
 "text-xs text-muted-foreground",
 item.risk === "High" ? "text-rose-300 border-rose-500/40"
 : item.risk === "Medium" ? "text-amber-300 border-amber-500/40"
 : "text-muted-foreground border-muted-foreground/40"
 )}
 >
 {item.risk} Risk
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — Fintech & Internet
// ══════════════════════════════════════════════════════════════════════════════

const CATEGORY_COLORS: Record<string, string> = {
 Payments: "bg-muted/10 text-primary border-primary/30",
 "E-commerce": "bg-amber-500/20 text-amber-300 border-amber-500/30",
 Social: "bg-orange-500/20 text-orange-300 border-orange-500/30",
 "Gig Economy": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
 Gaming: "bg-rose-500/20 text-rose-300 border-rose-500/30",
 Infra: "bg-muted text-muted-foreground border-border",
};

const PAYMENT_TAKE_RATES = [
 { name: "Visa", rate: 0.10, color: "#3b82f6" },
 { name: "Mastercard", rate: 0.11, color: "#6366f1" },
 { name: "Adyen", rate: 0.18, color: "#8b5cf6" },
 { name: "PayPal", rate: 1.85, color: "#0ea5e9" },
 { name: "Block/SQ", rate: 1.40, color: "#06b6d4" },
 { name: "Stripe", rate: 2.90, color: "#10b981" },
];

function FintechTab() {
 const [activeCategory, setActiveCategory] = useState<string>("All");
 const categories = ["All", "Payments", "E-commerce", "Social", "Gig Economy", "Gaming", "Infra"];

 const filtered = activeCategory === "All"
 ? FINTECH_DATA
 : FINTECH_DATA.filter((c) => c.category === activeCategory);

 return (
 <div className="space-y-4">
 <div className="flex items-start justify-between">
 <div>
 <h2 className="text-lg font-medium text-foreground">Fintech &amp; Internet</h2>
 <p className="text-sm text-muted-foreground mt-0.5">
 Payments, e-commerce, social media, gig economy, gaming, and infrastructure
 </p>
 </div>
 </div>

 {/* Summary stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatCard label="Visa + MA Volume" value="$18T+" sub="Annual card volume" highlight="neutral" />
 <StatCard label="Global e-commerce" value="$6.3T" sub="+9% YoY, 22% of retail" highlight="pos" />
 <StatCard label="Meta DAU" value="3.35B" sub="Family of Apps" highlight="pos" />
 <StatCard label="Uber Bookings" value="$182B+" sub="Gross Bookings 2025E" highlight="pos" />
 </div>

 {/* Category filter */}
 <div className="flex gap-2 flex-wrap">
 {categories.map((cat) => (
 <button
 key={cat}
 onClick={() => setActiveCategory(cat)}
 className={cn(
 "px-3 py-1.5 rounded-lg text-xs text-muted-foreground font-medium transition-colors border",
 activeCategory === cat
 ? "bg-primary text-foreground border-primary"
 : "bg-foreground/5 text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
 )}
 >
 {cat}
 </button>
 ))}
 </div>

 {/* Company table */}
 <div className="overflow-x-auto rounded-md border border-border">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border bg-foreground/5">
 <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">Ticker</th>
 <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">Category</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Rev Growth</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Op Margin</th>
 <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">Key Metric</th>
 <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">P/E</th>
 </tr>
 </thead>
 <tbody>
 
 {filtered.map((c) => (
 <tr
 key={c.ticker}
 className="border-b border-border hover:bg-muted/30 transition-colors"
 >
 <td className="px-3 py-2.5">
 <span className="font-mono font-medium text-foreground">{c.ticker}</span>
 <span className="text-muted-foreground ml-1.5">{c.name}</span>
 </td>
 <td className="px-3 py-2.5">
 <span className={cn("text-xs px-1.5 py-0.5 rounded border", CATEGORY_COLORS[c.category] ?? "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30")}>
 {c.category}
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className={posNegClass(c.revGrowth)}>{fmtPct(c.revGrowth, 0)}</span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className={c.operatingMargin >= 0 ? (c.operatingMargin >= 20 ? "text-emerald-400" : "text-muted-foreground") : "text-rose-400"}>
 {c.operatingMargin > 0 ? "+" : ""}{c.operatingMargin}%
 </span>
 </td>
 <td className="px-3 py-2.5">
 <span className="text-muted-foreground">{c.keyMetric}: </span>
 <span className="text-foreground">{c.keyValue}</span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className={c.pe > 0 ? "text-foreground" : "text-muted-foreground"}>
 {c.pe > 0 ? `${c.pe}x` : "N/M"}
 </span>
 </td>
 </tr>
 ))}
 
 </tbody>
 </table>
 </div>

 {/* Payment take rates */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <div>
 <SectionTitle>
 <DollarSign className="w-3.5 h-3.5 text-muted-foreground/50" /> Payment Take Rates (% of GMV)
 </SectionTitle>
 <div className="rounded-md bg-foreground/5 border border-border p-4">
 <div className="space-y-3">
 {PAYMENT_TAKE_RATES.map((p) => (
 <div key={p.name} className="flex items-center gap-3">
 <span className="text-xs text-muted-foreground w-24 shrink-0">{p.name}</span>
 <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
 <div
 className="h-full rounded-full"
 style={{ width: `${Math.min(100, (p.rate / 3) * 100)}%`, background: p.color }}
 />
 </div>
 <span className="text-xs font-medium text-foreground w-12 text-right">{p.rate.toFixed(2)}%</span>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 V/MA are network fees; PayPal/Block/Stripe are merchant-facing all-in rates. Higher take rate = more value-add services but more competitive pressure from alternatives.
 </p>
 </div>
 </div>

 {/* Social media ARPU */}
 <div>
 <SectionTitle>
 <Globe className="w-4 h-4 text-orange-400" /> Social Media ARPU (Annual, USD)
 </SectionTitle>
 <div className="rounded-md bg-foreground/5 border border-border p-4">
 <svg viewBox="0 0 300 160" className="w-full">
 {[
 { name: "Meta US/CA", arpu: 233, color: "#3b82f6" },
 { name: "Meta Europe", arpu: 79, color: "#6366f1" },
 { name: "Meta Global", arpu: 57, color: "#8b5cf6" },
 { name: "Snap", arpu: 14, color: "#f59e0b" },
 { name: "Pinterest", arpu: 9, color: "#ef4444" },
 { name: "X (est)", arpu: 22, color: "#6b7280" },
 ].map((item, i) => {
 const maxArpu = 233;
 const barH = 20;
 const y = 10 + i * 24;
 const barW = (item.arpu / maxArpu) * 200;
 return (
 <g key={item.name}>
 <text x="0" y={y + 14} fill="#a1a1aa" fontSize="8">{item.name}</text>
 <rect x="85" y={y + 2} width={barW} height={barH - 6} fill={item.color} opacity="0.7" rx="2" />
 <text x={85 + barW + 4} y={y + 13} fill={item.color} fontSize="8" fontWeight="bold">${item.arpu}</text>
 </g>
 );
 })}
 </svg>
 <p className="text-xs text-muted-foreground">Meta&apos;s US/Canada ARPU is 4x its global average — shows massive monetization gap across regions</p>
 </div>
 </div>
 </div>

 {/* Gig economy / Gaming insights */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <InfoBox variant="emerald">
 <strong>Gig Economy Path to Profitability</strong> — Uber reached GAAP profitability in 2023 ($1.9B net income). DoorDash still GAAP-unprofitable but FCF positive. Key is take rate discipline (15-30% of order value) and reducing driver incentives as supply/demand normalizes. Advertising within apps is new high-margin revenue lever.
 </InfoBox>
 <InfoBox variant="violet">
 <strong>Gaming Monetization Evolution</strong> — Industry shifted from one-time purchases ($60) to live services (recurring MTX, Battle Passes, DLC). MSFT Xbox Game Pass + Activision creates bundled subscription moat. Roblox user-generated content model with Robux economy — creator monetization at scale. Mobile gaming (not shown) is 50% of gaming revenue globally.
 </InfoBox>
 </div>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function TechSectorPage() {
 return (
 <div className="min-h-screen bg-background text-foreground">
 <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
 {/* Page header */}
 <div
 className="flex items-center justify-between"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-md bg-muted/10 border border-primary/30 flex items-center justify-center">
 <Cpu className="w-3.5 h-3.5 text-muted-foreground/50" />
 </div>
 <div>
 <h1 className="text-xl font-medium text-foreground">Technology Sector</h1>
 <p className="text-sm text-muted-foreground">SaaS · AI/Infra · Semiconductors · Mega-Cap · Fintech</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="text-primary border-primary/40">
 2026 Data
 </Badge>
 <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Educational</span>
 </div>
 </div>

 {/* Top-level overview strip */}
 <div
 className="grid grid-cols-2 md:grid-cols-5 gap-3 border-l-4 border-l-primary p-6 rounded-lg bg-card/40"
 >
 {[
 { label: "S&P 500 Tech Weight", value: "32%", sub: "Historically high concentration", icon: <Target className="w-3.5 h-3.5 text-primary" /> },
 { label: "Nasdaq YTD", value: "+8.2%", sub: "AI enthusiasm resilient", icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> },
 { label: "NVDA Dominance", value: "80%", sub: "AI chip market share", icon: <Cpu className="w-3.5 h-3.5 text-orange-400" /> },
 { label: "Cloud Growth", value: "+21%", sub: "IaaS/PaaS market", icon: <Cloud className="w-3.5 h-3.5 text-muted-foreground" /> },
 { label: "AI Capex 2025E", value: "$320B+", sub: "Hyperscaler spend", icon: <Zap className="w-3.5 h-3.5 text-yellow-400" /> },
 ].map((item) => (
 <div key={item.label} className="rounded-md border border-border bg-foreground/5 p-3 flex gap-2.5 items-start">
 <div className="mt-0.5">{item.icon}</div>
 <div>
 <div className="text-xs text-muted-foreground">{item.label}</div>
 <div className="text-sm font-medium text-foreground">{item.value}</div>
 <div className="text-xs text-muted-foreground">{item.sub}</div>
 </div>
 </div>
 ))}
 </div>

 {/* Tabs */}
 <div
 >
 <Tabs defaultValue="saas" className="space-y-4">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="saas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 SaaS Metrics
 </TabsTrigger>
 <TabsTrigger value="ai" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 AI &amp; Infrastructure
 </TabsTrigger>
 <TabsTrigger value="semi" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Semiconductor Cycle
 </TabsTrigger>
 <TabsTrigger value="megacap" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Mega-Cap Tech
 </TabsTrigger>
 <TabsTrigger value="fintech" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Fintech &amp; Internet
 </TabsTrigger>
 </TabsList>

 <TabsContent value="saas" className="data-[state=inactive]:hidden mt-0">
 <SaasTab />
 </TabsContent>
 <TabsContent value="ai" className="data-[state=inactive]:hidden mt-0">
 <AiInfraTab />
 </TabsContent>
 <TabsContent value="semi" className="data-[state=inactive]:hidden mt-0">
 <SemiCycleTab />
 </TabsContent>
 <TabsContent value="megacap" className="data-[state=inactive]:hidden mt-0">
 <MegaCapTab />
 </TabsContent>
 <TabsContent value="fintech" className="data-[state=inactive]:hidden mt-0">
 <FintechTab />
 </TabsContent>
 </Tabs>
 </div>
 </div>
 </div>
 );
}
