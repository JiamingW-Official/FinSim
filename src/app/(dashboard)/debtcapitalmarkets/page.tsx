"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  BookOpen,
  Users,
  ChevronRight,
  Building2,
  Layers,
  ArrowUpDown,
  Award,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Percent,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 791;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface MonthlyIssuance {
  month: string;
  ig: number;
  hy: number;
}

interface BondDeal {
  id: string;
  issuer: string;
  rating: string;
  size: number;
  tenor: string;
  spread: number;
  nic: number;
  sector: string;
  status: "priced" | "roadshow" | "settled";
}

interface DemandPoint {
  spread: number;
  demand: number;
}

// ── Static Data (generated with seeded PRNG) ─────────────────────────────────

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

function generateIssuanceData(): MonthlyIssuance[] {
  return MONTHS.map((month) => ({
    month,
    ig: Math.round(60 + rand() * 80),
    hy: Math.round(15 + rand() * 35),
  }));
}

const ISSUERS = [
  "Apple Inc.", "JPMorgan Chase", "Microsoft Corp.", "Goldman Sachs",
  "Johnson & Johnson", "Exxon Mobil", "Amazon.com", "Bank of America",
  "Pfizer Inc.", "Ford Motor Co.",
];
const RATINGS = ["Aaa/AAA", "Aa2/AA", "A1/A+", "A3/A-", "Baa1/BBB+", "Baa3/BBB-", "Ba1/BB+", "B1/B+"];
const TENORS = ["2Y", "3Y", "5Y", "7Y", "10Y", "20Y", "30Y"];
const SECTORS = ["Technology", "Financials", "Healthcare", "Energy", "Consumer", "Industrials"];

function generateDeals(): BondDeal[] {
  const statuses: BondDeal["status"][] = ["priced", "settled", "roadshow"];
  return ISSUERS.map((issuer, i) => {
    const ratingIdx = Math.floor(rand() * RATINGS.length);
    const isIG = ratingIdx <= 5;
    const baseSpread = isIG ? 40 + rand() * 120 : 200 + rand() * 350;
    return {
      id: `DCM-${2024100 + i}`,
      issuer,
      rating: RATINGS[ratingIdx],
      size: Math.round((0.5 + rand() * 4) * 10) / 10,
      tenor: TENORS[Math.floor(rand() * TENORS.length)],
      spread: Math.round(baseSpread),
      nic: Math.round((rand() * 10 - 2) * 10) / 10,
      sector: SECTORS[Math.floor(rand() * SECTORS.length)],
      status: statuses[Math.floor(rand() * statuses.length)],
    };
  });
}

function generateDemandCurve(): DemandPoint[] {
  const offerSpread = 165;
  const points: DemandPoint[] = [];
  for (let spread = 140; spread <= 200; spread += 5) {
    const distFromOffer = spread - offerSpread;
    const baseDemand = 8.5 - distFromOffer * 0.18 + rand() * 0.6 - 0.3;
    points.push({ spread, demand: Math.max(0.5, Math.round(baseDemand * 10) / 10) });
  }
  return points;
}

// ── Pre-generate all data at module level ─────────────────────────────────────
const ISSUANCE_DATA = generateIssuanceData();
const DEALS = generateDeals();
const DEMAND_CURVE = generateDemandCurve();

// ── SVG: Issuance Bar Chart ───────────────────────────────────────────────────

function IssuanceBarChart({ data }: { data: MonthlyIssuance[] }) {
  const W = 640;
  const H = 220;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...data.map((d) => d.ig + d.hy));
  const barGroupW = chartW / data.length;
  const barW = (barGroupW * 0.7) / 2;
  const yTicks = [0, 50, 100, 150, 200];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }}>
      {/* Y gridlines + labels */}
      {yTicks.map((v) => {
        const y = padT + chartH - (v / maxVal) * chartH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity={0.1} strokeDasharray="4,4" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.5}>
              {v}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const groupX = padL + i * barGroupW + barGroupW * 0.15;
        const igH = (d.ig / maxVal) * chartH;
        const hyH = (d.hy / maxVal) * chartH;
        const igY = padT + chartH - igH;
        const hyY = padT + chartH - hyH;
        return (
          <g key={d.month}>
            <rect x={groupX} y={igY} width={barW} height={igH} fill="#3b82f6" fillOpacity={0.85} rx={2} />
            <rect x={groupX + barW + 2} y={hyY} width={barW} height={hyH} fill="#f59e0b" fillOpacity={0.85} rx={2} />
            <text x={groupX + barW} y={padT + chartH + 16} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.5}>
              {d.month}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={padL} y={H - 10} width={10} height={8} fill="#3b82f6" fillOpacity={0.85} rx={1} />
      <text x={padL + 14} y={H - 3} fontSize={10} fill="currentColor" fillOpacity={0.6}>IG</text>
      <rect x={padL + 44} y={H - 10} width={10} height={8} fill="#f59e0b" fillOpacity={0.85} rx={1} />
      <text x={padL + 58} y={H - 3} fontSize={10} fill="currentColor" fillOpacity={0.6}>HY</text>
      <text x={W / 2} y={H - 3} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.4}>Monthly Issuance ($B)</text>
    </svg>
  );
}

// ── SVG: Demand Curve ─────────────────────────────────────────────────────────

function DemandCurveSVG({ data }: { data: DemandPoint[] }) {
  const W = 480;
  const H = 220;
  const padL = 52;
  const padR = 24;
  const padT = 20;
  const padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const spreads = data.map((d) => d.spread);
  const demands = data.map((d) => d.demand);
  const minSpread = Math.min(...spreads);
  const maxSpread = Math.max(...spreads);
  const maxDemand = Math.ceil(Math.max(...demands));
  const offerSpread = 165;
  const dealSize = 3.0;

  const xScale = (v: number) => padL + ((v - minSpread) / (maxSpread - minSpread)) * chartW;
  const yScale = (v: number) => padT + chartH - (v / maxDemand) * chartH;

  const pathD = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(d.spread).toFixed(1)},${yScale(d.demand).toFixed(1)}`)
    .join(" ");

  const offerX = xScale(offerSpread);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }}>
      {/* Y gridlines */}
      {[0, 2, 4, 6, 8].map((v) => {
        const y = yScale(v);
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity={0.1} strokeDasharray="4,4" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.5}>
              {v}x
            </text>
          </g>
        );
      })}

      {/* Fill under curve */}
      <path
        d={`${pathD} L ${xScale(maxSpread).toFixed(1)},${(padT + chartH).toFixed(1)} L ${padL.toFixed(1)},${(padT + chartH).toFixed(1)} Z`}
        fill="#3b82f6"
        fillOpacity={0.1}
      />

      {/* Curve */}
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Offer spread line */}
      <line x1={offerX} y1={padT} x2={offerX} y2={padT + chartH} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5,3" />
      <text x={offerX + 4} y={padT + 12} fontSize={9} fill="#f59e0b">
        Offer: T+165
      </text>

      {/* Deal size line */}
      <line x1={padL} y1={yScale(dealSize)} x2={W - padR} y2={yScale(dealSize)} stroke="#10b981" strokeWidth={1.5} strokeDasharray="5,3" />
      <text x={padL + 4} y={yScale(dealSize) - 4} fontSize={9} fill="#10b981">
        Deal: $3B
      </text>

      {/* X axis labels */}
      {data
        .filter((_, i) => i % 2 === 0)
        .map((d) => (
          <text key={d.spread} x={xScale(d.spread)} y={padT + chartH + 16} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.5}>
            T+{d.spread}
          </text>
        ))}

      {/* Axis labels */}
      <text x={W / 2} y={H - 3} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.4}>
        Spread (bps)
      </text>
      <text x={12} y={H / 2} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.4} transform={`rotate(-90,12,${H / 2})`}>
        Demand ($B)
      </text>
    </svg>
  );
}

// ── Metric Chip ───────────────────────────────────────────────────────────────

function MetricChip({
  label,
  value,
  sub,
  trend,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-1 truncate">{label}</p>
            <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            {trend && (
              <div className={trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}>
                {trend === "up" ? <TrendingUp size={16} /> : trend === "down" ? <TrendingDown size={16} /> : null}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Pricing Timeline ──────────────────────────────────────────────────────────

const PRICING_STEPS = [
  {
    id: 1,
    label: "Mandate",
    duration: "Day 1",
    description: "Issuer selects lead bookrunner(s). Engagement letter signed. NDA with syndicate team.",
    icon: <FileText size={18} />,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 2,
    label: "Roadshow",
    duration: "Days 2–5",
    description: "Management meets institutional investors. One-on-ones and group calls. IOIs (Indications of Interest) collected.",
    icon: <Globe size={18} />,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 3,
    label: "Book-Build",
    duration: "Day 5–6",
    description: "Books open. Investors submit orders at various spread levels. Book typically opens 3× oversubscribed.",
    icon: <BookOpen size={18} />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    id: 4,
    label: "Pricing",
    duration: "Day 6",
    description: "Final spread and size set. NIC (New Issue Concession) established vs. secondary market. Allocations made.",
    icon: <Percent size={18} />,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  {
    id: 5,
    label: "Settlement",
    duration: "Day 8 (T+2)",
    description: "Bonds delivered vs. payment. CUSIP/ISIN assigned. Bonds begin secondary market trading.",
    icon: <CheckCircle2 size={18} />,
    color: "text-emerald-400",
    bgColor: "bg-teal-500/10",
  },
];

// ── Syndicate Roles ───────────────────────────────────────────────────────────

const SYNDICATE_ROLES = [
  {
    role: "Bookrunner",
    aka: "Lead Manager",
    description: "Primary bank coordinating the transaction. Runs the book of investor orders, sets pricing, and allocates bonds. Highest economics (~60% of fees).",
    responsibilities: ["Manages investor outreach", "Sets initial price guidance", "Allocates bonds to investors", "Stabilizes aftermarket trading"],
    icon: <Award size={20} />,
    color: "text-primary",
    bgColor: "bg-primary/10 border-border",
  },
  {
    role: "Co-Manager",
    aka: "Joint Bookrunner",
    description: "Shares bookrunning duties and economics. Typically 2–4 co-managers on large deals. Share economics (~30% total).",
    responsibilities: ["Supplements investor coverage", "Joint pricing rights", "Shared underwriting risk", "Regional distribution"],
    icon: <Users size={20} />,
    color: "text-primary",
    bgColor: "bg-primary/10 border-border",
  },
  {
    role: "Selling Group",
    aka: "Passive Bookrunner",
    description: "Distributes bonds to their client base but does not participate in pricing decisions. Earns selling concession (~0.1% of face value).",
    responsibilities: ["Distributes to retail/HNW", "No pricing input", "Selling concession only", "Expands investor reach"],
    icon: <Layers size={20} />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
];

// ── League Table Data ─────────────────────────────────────────────────────────

const LEAGUE_TABLE = [
  { rank: 1, bank: "JPMorgan", igVol: 284, hyVol: 112, totalVol: 396, share: 18.4, deals: 142 },
  { rank: 2, bank: "Goldman Sachs", igVol: 241, hyVol: 98, totalVol: 339, share: 15.7, deals: 121 },
  { rank: 3, bank: "Bank of America", igVol: 218, hyVol: 87, totalVol: 305, share: 14.1, deals: 118 },
  { rank: 4, bank: "Citi", igVol: 196, hyVol: 76, totalVol: 272, share: 12.6, deals: 109 },
  { rank: 5, bank: "Morgan Stanley", igVol: 174, hyVol: 65, totalVol: 239, share: 11.1, deals: 97 },
  { rank: 6, bank: "Barclays", igVol: 142, hyVol: 54, totalVol: 196, share: 9.1, deals: 84 },
  { rank: 7, bank: "Deutsche Bank", igVol: 118, hyVol: 43, totalVol: 161, share: 7.5, deals: 72 },
  { rank: 8, bank: "Wells Fargo", igVol: 98, hyVol: 31, totalVol: 129, share: 6.0, deals: 61 },
];

// ── Rating badge color ────────────────────────────────────────────────────────

function ratingColor(rating: string): string {
  if (rating.startsWith("Aaa") || rating.startsWith("Aa")) return "bg-primary/10 text-primary border-border";
  if (rating.startsWith("A")) return "bg-green-500/10 text-green-400 border-green-500/20";
  if (rating.startsWith("Baa")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-red-500/10 text-red-400 border-red-500/20";
}

function statusColor(status: BondDeal["status"]): string {
  if (status === "settled") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (status === "priced") return "bg-primary/10 text-primary border-border";
  return "bg-amber-500/10 text-amber-400 border-amber-500/20";
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DebtCapitalMarketsPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [activeRole, setActiveRole] = useState<number | null>(null);

  const metrics = useMemo(() => ({
    igSpread: 112,
    hySpread: 368,
    nic: 7.5,
    pipeline: 48.2,
    igSpreadChg: -3,
    hySpreadChg: +12,
  }), []);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div {...fadeUp}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 size={24} className="text-primary" />
              Debt Capital Markets
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Corporate bond issuance, syndicate mechanics, pricing dynamics & league tables
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              Live Market
            </Badge>
            <Badge variant="outline" className="text-xs border-border">
              YTD 2026
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics — Hero */}
      <motion.div {...fadeUp} transition={{ delay: 0.05, duration: 0.4 }}>
        <div className="border-l-4 border-l-primary rounded-lg bg-card p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricChip
            label="IG Credit Spread (bps)"
            value={`${metrics.igSpread}`}
            sub={`${metrics.igSpreadChg > 0 ? "+" : ""}${metrics.igSpreadChg}bps WoW`}
            trend={metrics.igSpreadChg > 0 ? "up" : "down"}
            icon={<ArrowUpDown size={16} />}
          />
          <MetricChip
            label="HY Spread (bps)"
            value={`${metrics.hySpread}`}
            sub={`${metrics.hySpreadChg > 0 ? "+" : ""}${metrics.hySpreadChg}bps WoW`}
            trend={metrics.hySpreadChg > 0 ? "up" : "down"}
            icon={<TrendingUp size={16} />}
          />
          <MetricChip
            label="New Issue Concession"
            value={`${metrics.nic}bps`}
            sub="Avg vs. secondary"
            trend="neutral"
            icon={<Percent size={16} />}
          />
          <MetricChip
            label="Deal Pipeline"
            value={`$${metrics.pipeline}B`}
            sub="Active mandates"
            trend="up"
            icon={<DollarSign size={16} />}
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.4 }} className="mt-8">
        <Tabs defaultValue="issuance" className="space-y-4">
          <TabsList className="bg-card border border-border h-auto flex-wrap gap-1 p-1">
            <TabsTrigger value="issuance" className="text-xs gap-1.5">
              <BarChart3 size={13} /> New Issuance
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs gap-1.5">
              <Clock size={13} /> Pricing Process
            </TabsTrigger>
            <TabsTrigger value="bookbuild" className="text-xs gap-1.5">
              <BookOpen size={13} /> Book Building
            </TabsTrigger>
            <TabsTrigger value="leagues" className="text-xs gap-1.5">
              <Award size={13} /> League Tables
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: New Issuance ─────────────────────────────────────────────── */}
          <TabsContent value="issuance" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 size={15} className="text-primary" />
                    Monthly Issuance Volume ($B)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Past 12 months — IG vs. HY</p>
                </CardHeader>
                <CardContent>
                  <IssuanceBarChart data={ISSUANCE_DATA} />
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { label: "YTD IG", value: `$${ISSUANCE_DATA.reduce((s, d) => s + d.ig, 0)}B` },
                      { label: "YTD HY", value: `$${ISSUANCE_DATA.reduce((s, d) => s + d.hy, 0)}B` },
                      { label: "IG/HY Ratio", value: `${(ISSUANCE_DATA.reduce((s, d) => s + d.ig, 0) / ISSUANCE_DATA.reduce((s, d) => s + d.hy, 0)).toFixed(1)}×` },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-muted/30 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText size={15} className="text-amber-400" />
                    Recent Deals
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Corporate bond transactions</p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/20">
                          {["Issuer", "Rating", "Size", "Tenor", "Spd", "NIC"].map((h) => (
                            <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DEALS.map((deal) => (
                          <tr key={deal.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                            <td className="px-3 py-2">
                              <div>
                                <p className="font-medium text-foreground truncate max-w-[100px]">{deal.issuer}</p>
                                <p className="text-muted-foreground text-xs">{deal.sector}</p>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <Badge variant="outline" className={`text-xs px-1.5 py-0 ${ratingColor(deal.rating)}`}>
                                {deal.rating.split("/")[1]}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 font-medium">${deal.size}B</td>
                            <td className="px-3 py-2 text-muted-foreground">{deal.tenor}</td>
                            <td className="px-3 py-2">T+{deal.spread}</td>
                            <td className="px-3 py-2">
                              <span className={deal.nic >= 0 ? "text-green-400" : "text-red-400"}>
                                {deal.nic >= 0 ? "+" : ""}{deal.nic}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab: Pricing Process ──────────────────────────────────────────── */}
          <TabsContent value="pricing" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock size={15} className="text-primary" />
                  Bond Issuance Process
                </CardTitle>
                <p className="text-xs text-muted-foreground">From mandate to settlement — click any step for details</p>
              </CardHeader>
              <CardContent>
                {/* Timeline */}
                <div className="relative">
                  {/* Connector line */}
                  <div className="absolute top-7 left-7 right-7 h-0.5 bg-border hidden md:block" />

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                    {PRICING_STEPS.map((step, i) => (
                      <button
                        key={step.id}
                        className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                          activeStep === i
                            ? `${step.bgColor} border-current`
                            : "bg-muted/20 border-border hover:border-border/80 hover:bg-muted/30"
                        }`}
                        onClick={() => setActiveStep(activeStep === i ? null : i)}
                      >
                        <div className={`${step.color} mb-2`}>{step.icon}</div>
                        <p className={`text-xs font-medium ${activeStep === i ? step.color : "text-foreground"}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.duration}</p>
                        {i < PRICING_STEPS.length - 1 && (
                          <ChevronRight size={12} className="text-muted-foreground absolute top-1/2 -right-2 -translate-y-1/2 hidden md:block" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step Detail */}
                {activeStep !== null && (
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`mt-4 p-4 rounded-xl border ${PRICING_STEPS[activeStep].bgColor} border-current`}
                  >
                    <h3 className={`text-sm font-medium ${PRICING_STEPS[activeStep].color} mb-1`}>
                      {PRICING_STEPS[activeStep].label} — {PRICING_STEPS[activeStep].duration}
                    </h3>
                    <p className="text-sm text-foreground/80">{PRICING_STEPS[activeStep].description}</p>
                  </motion.div>
                )}

                {/* Key Concepts */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      title: "Price Guidance (IPT)",
                      desc: "Initial Price Thoughts set 20–30bps wide of expected. Allows for book-build price discovery.",
                      icon: <AlertTriangle size={14} className="text-amber-400" />,
                    },
                    {
                      title: "New Issue Concession",
                      desc: "Premium paid vs. secondary market to attract investors. Typically 5–15bps for IG issuers.",
                      icon: <Percent size={14} className="text-primary" />,
                    },
                    {
                      title: "Oversubscription",
                      desc: "Books 3–8× covered signals strong demand. Issuer can tighten spread or upsize the deal.",
                      icon: <TrendingUp size={14} className="text-green-400" />,
                    },
                  ].map((c) => (
                    <div key={c.title} className="bg-muted/20 rounded-lg p-3 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        {c.icon}
                        <p className="text-xs font-medium text-foreground">{c.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Book Building ────────────────────────────────────────────── */}
          <TabsContent value="bookbuild" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BookOpen size={15} className="text-primary" />
                    Demand Curve — $3B IG Deal
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Investor demand at various spread levels (T+X bps)</p>
                </CardHeader>
                <CardContent>
                  <DemandCurveSVG data={DEMAND_CURVE} />
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { label: "Peak Demand", value: `$${Math.max(...DEMAND_CURVE.map((d) => d.demand)).toFixed(1)}B` },
                      { label: "Cover Ratio", value: `${(Math.max(...DEMAND_CURVE.map((d) => d.demand)) / 3).toFixed(1)}×` },
                      { label: "Offer Spread", value: "T+165bps" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-muted/30 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-sm font-medium text-foreground mt-0.5">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users size={15} className="text-primary" />
                    Syndicate Desk Roles
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Click a role to expand</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {SYNDICATE_ROLES.map((role, i) => (
                    <button
                      key={role.role}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                        activeRole === i ? `${role.bgColor}` : "bg-muted/20 border-border hover:bg-muted/30"
                      }`}
                      onClick={() => setActiveRole(activeRole === i ? null : i)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={role.color}>{role.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{role.role}</p>
                            <p className="text-xs text-muted-foreground">{role.aka}</p>
                          </div>
                        </div>
                        <ChevronRight
                          size={14}
                          className={`text-muted-foreground transition-transform duration-200 ${activeRole === i ? "rotate-90" : ""}`}
                        />
                      </div>
                      {activeRole === i && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 pt-2 border-t border-border/50"
                        >
                          <p className="text-xs text-foreground/80 mb-2">{role.description}</p>
                          <ul className="space-y-0.5">
                            {role.responsibilities.map((r) => (
                              <li key={r} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <div className={`w-1 h-1 rounded-full ${role.color.replace("text-", "bg-")}`} />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Allocation explainer */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Layers size={15} className="text-amber-400" />
                  Allocation Principles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { pct: "40–50%", bucket: "Institutional (Funds)", note: "Pension, insurance, asset managers" },
                    { pct: "25–35%", bucket: "Banks/Treasury", note: "Buy-and-hold & liquidity management" },
                    { pct: "10–20%", bucket: "Hedge Funds", note: "Higher volatility, relative-value" },
                    { pct: "5–15%", bucket: "Retail / Private Bank", note: "Via selling group concession" },
                  ].map((b) => (
                    <div key={b.bucket} className="bg-muted/20 rounded-lg p-3 border border-border text-center">
                      <p className="text-lg font-medium text-primary">{b.pct}</p>
                      <p className="text-xs font-medium text-foreground mt-1">{b.bucket}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: League Tables ────────────────────────────────────────────── */}
          <TabsContent value="leagues" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award size={15} className="text-amber-400" />
                  DCM League Tables — YTD 2026
                </CardTitle>
                <p className="text-xs text-muted-foreground">Ranked by total issuance volume underwritten ($B)</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        {["#", "Bank", "IG ($B)", "HY ($B)", "Total ($B)", "Share", "Deals"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {LEAGUE_TABLE.map((row) => (
                        <tr key={row.rank} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-2.5">
                            {row.rank <= 3 ? (
                              <span className={`font-medium text-xs ${row.rank === 1 ? "text-amber-400" : row.rank === 2 ? "text-muted-foreground" : "text-amber-700"}`}>
                                {row.rank}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">{row.rank}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-foreground">{row.bank}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{row.igVol}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{row.hyVol}</td>
                          <td className="px-4 py-2.5 font-medium text-foreground">{row.totalVol}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted/30 rounded-full h-1.5 min-w-[60px]">
                                <div
                                  className="bg-primary h-1.5 rounded-full"
                                  style={{ width: `${(row.share / 20) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{row.share}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{row.deals}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Credit Spread Context */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp size={15} className="text-green-400" />
                    Spread Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "IG (Baa) spread", value: 112, min: 80, max: 200, color: "bg-primary" },
                      { label: "HY (Ba) spread", value: 368, min: 200, max: 800, color: "bg-amber-500" },
                      { label: "CCC spread", value: 820, min: 500, max: 1800, color: "bg-red-500" },
                    ].map((item) => {
                      const pct = ((item.value - item.min) / (item.max - item.min)) * 100;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-medium text-foreground">{item.value}bps</span>
                          </div>
                          <div className="bg-muted/30 rounded-full h-2">
                            <div className={`${item.color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                            <span>Tight ({item.min})</span>
                            <span>Wide ({item.max})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Globe size={15} className="text-primary" />
                    Key DCM Concepts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { term: "Yield to Maturity", def: "Total return if bond held to maturity; includes coupon + price appreciation/depreciation" },
                      { term: "Duration", def: "Price sensitivity to rate changes; 10Y bond ≈ 9× duration" },
                      { term: "Call Protection", def: "Period issuer cannot redeem bonds early; typical 3–5Y for HY" },
                      { term: "Make-Whole Call", def: "IG bonds can be redeemed at PV of future cash flows vs. Treasury + spread" },
                      { term: "Change of Control Put", def: "Investor can put bonds back at 101 if M&A changes issuer's credit profile" },
                    ].map((item) => (
                      <div key={item.term} className="border-b border-border/40 pb-2 last:border-0 last:pb-0">
                        <p className="text-xs font-medium text-foreground">{item.term}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.def}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Footer note */}
      <motion.div {...fadeUp} transition={{ delay: 0.15, duration: 0.4 }}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 border border-border rounded-lg px-3 py-2">
          <AlertTriangle size={12} className="shrink-0" />
          Simulated data for educational purposes only. Spreads, volumes, and deal details are illustrative.
        </div>
      </motion.div>
    </div>
  );
}
