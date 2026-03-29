"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Shield,
  AlertTriangle,
  Building2,
  Activity,
  Target,
  Percent,
  Award,
  Users,
  FileText,
  Briefcase,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Star,
  CheckCircle,
  Globe,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 975;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed = 975) {
  s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────

type DealType = "TLB" | "RCF" | "Bridge" | "TLA" | "TLC";
type SyndicationRole = "Bookrunning" | "Co-Lead" | "Participant";
type DealStatus = "Active" | "Pricing" | "Closed" | "Flex";
type LoanGrade = "BB+" | "BB" | "BB-" | "B+" | "B" | "B-" | "CCC+";

interface SyndicationDeal {
  id: number;
  borrower: string;
  sponsor: string;
  dealType: DealType;
  sizeM: number;
  pricingBps: number;
  oid: number; // OID pts
  status: DealStatus;
  role: SyndicationRole;
  sector: string;
  leverage: number; // x EBITDA
  rating: LoanGrade;
  maturity: string;
  purpose: string;
}

interface InvestorAllocation {
  name: string;
  type: string;
  commitM: number;
  allocM: number;
  scaled: boolean;
}

interface PricingGridTier {
  leverageLabel: string;
  leverageMax: number;
  spreadBps: number;
  floor: number;
}

interface SecondaryLoan {
  id: number;
  borrower: string;
  tranche: string;
  maturity: string;
  bid: number;
  offer: number;
  parSpread: number; // bps
  ytm: number;
  distressed: boolean;
  rating: LoanGrade;
  sector: string;
}

interface CovenantComparison {
  covenant: string;
  category: string;
  covLite: string;
  fullCov: string;
  riskLevel: "Low" | "Medium" | "High";
}

interface LeagueEntry {
  rank: number;
  bank: string;
  deals: number;
  volumeB: number;
  sharePercent: number;
  avgSize: number;
  yoyChange: number;
}

// ── Static Data ────────────────────────────────────────────────────────────────

resetSeed(975);

const SYNDICATION_DEALS: SyndicationDeal[] = [
  {
    id: 1,
    borrower: "Apex Industrial Holdings",
    sponsor: "Blackstone Capital",
    dealType: "TLB",
    sizeM: 2450,
    pricingBps: 325,
    oid: 99.0,
    status: "Active",
    role: "Bookrunning",
    sector: "Industrials",
    leverage: 4.8,
    rating: "B+",
    maturity: "2031-03",
    purpose: "LBO Financing",
  },
  {
    id: 2,
    borrower: "MedTech Solutions Corp",
    sponsor: "KKR",
    dealType: "RCF",
    sizeM: 750,
    pricingBps: 275,
    oid: 99.5,
    status: "Pricing",
    role: "Co-Lead",
    sector: "Healthcare",
    leverage: 3.6,
    rating: "BB-",
    maturity: "2030-06",
    purpose: "Acquisition Facility",
  },
  {
    id: 3,
    borrower: "Retail Dynamics LLC",
    sponsor: "Apollo Global",
    dealType: "Bridge",
    sizeM: 1200,
    pricingBps: 450,
    oid: 98.0,
    status: "Flex",
    role: "Participant",
    sector: "Consumer",
    leverage: 5.9,
    rating: "B-",
    maturity: "2027-12",
    purpose: "Acquisition Bridge",
  },
  {
    id: 4,
    borrower: "TechPlatform Inc",
    sponsor: "Vista Equity",
    dealType: "TLB",
    sizeM: 3100,
    pricingBps: 300,
    oid: 99.25,
    status: "Active",
    role: "Bookrunning",
    sector: "Technology",
    leverage: 4.2,
    rating: "BB-",
    maturity: "2032-01",
    purpose: "Take-Private",
  },
  {
    id: 5,
    borrower: "Energy Services Group",
    sponsor: "Warburg Pincus",
    dealType: "TLA",
    sizeM: 580,
    pricingBps: 250,
    oid: 99.75,
    status: "Closed",
    role: "Co-Lead",
    sector: "Energy",
    leverage: 2.9,
    rating: "BB",
    maturity: "2029-09",
    purpose: "Refinancing",
  },
];

const PRICING_GRID: PricingGridTier[] = [
  { leverageLabel: "< 3.0x", leverageMax: 3.0, spreadBps: 200, floor: 0.5 },
  { leverageLabel: "3.0–3.5x", leverageMax: 3.5, spreadBps: 225, floor: 0.75 },
  { leverageLabel: "3.5–4.0x", leverageMax: 4.0, spreadBps: 250, floor: 1.0 },
  { leverageLabel: "4.0–4.5x", leverageMax: 4.5, spreadBps: 300, floor: 1.0 },
  { leverageLabel: "4.5–5.0x", leverageMax: 5.0, spreadBps: 350, floor: 1.0 },
  { leverageLabel: "5.0–5.5x", leverageMax: 5.5, spreadBps: 400, floor: 1.25 },
  { leverageLabel: "> 5.5x", leverageMax: 99, spreadBps: 475, floor: 1.5 },
];

const SECONDARY_LOANS: SecondaryLoan[] = [
  {
    id: 1,
    borrower: "Apex Industrial Holdings",
    tranche: "TLB",
    maturity: "2031-03",
    bid: 97.25,
    offer: 97.75,
    parSpread: 355,
    ytm: 8.42,
    distressed: false,
    rating: "B+",
    sector: "Industrials",
  },
  {
    id: 2,
    borrower: "Sunrise Media Group",
    tranche: "TLB",
    maturity: "2029-07",
    bid: 85.5,
    offer: 86.5,
    parSpread: 650,
    ytm: 12.8,
    distressed: true,
    rating: "CCC+",
    sector: "Media",
  },
  {
    id: 3,
    borrower: "ClearPath Logistics",
    tranche: "TLC",
    maturity: "2030-11",
    bid: 98.75,
    offer: 99.0,
    parSpread: 275,
    ytm: 7.15,
    distressed: false,
    rating: "BB",
    sector: "Industrials",
  },
  {
    id: 4,
    borrower: "Digital Ventures Ltd",
    tranche: "TLB",
    maturity: "2028-05",
    bid: 72.0,
    offer: 74.0,
    parSpread: 1100,
    ytm: 18.9,
    distressed: true,
    rating: "CCC+",
    sector: "Technology",
  },
  {
    id: 5,
    borrower: "MedTech Solutions Corp",
    tranche: "RCF",
    maturity: "2030-06",
    bid: 99.25,
    offer: 99.5,
    parSpread: 285,
    ytm: 7.32,
    distressed: false,
    rating: "BB-",
    sector: "Healthcare",
  },
  {
    id: 6,
    borrower: "Retail Dynamics LLC",
    tranche: "Bridge",
    maturity: "2027-12",
    bid: 88.0,
    offer: 89.5,
    parSpread: 720,
    ytm: 14.1,
    distressed: true,
    rating: "B-",
    sector: "Consumer",
  },
];

const COVENANT_COMPARISONS: CovenantComparison[] = [
  {
    covenant: "Financial Maintenance",
    category: "Financial",
    covLite: "None — no maintenance tests",
    fullCov: "Quarterly leverage & coverage ratio tests",
    riskLevel: "High",
  },
  {
    covenant: "Leverage Cap",
    category: "Financial",
    covLite: "Incurrence-based only (if action taken)",
    fullCov: "Maintenance: max 5.0x Total Debt/EBITDA",
    riskLevel: "High",
  },
  {
    covenant: "Interest Coverage",
    category: "Financial",
    covLite: "Not tested unless new debt incurred",
    fullCov: "Min 2.0x EBITDA / Cash Interest quarterly",
    riskLevel: "High",
  },
  {
    covenant: "Restricted Payments",
    category: "Operational",
    covLite: "Builder basket with broad carve-outs",
    fullCov: "Tight basket; requires pro forma compliance",
    riskLevel: "Medium",
  },
  {
    covenant: "Asset Sales",
    category: "Operational",
    covLite: "Large permitted basket (~$200M typical)",
    fullCov: "Sweep proceeds to repay debt; small basket",
    riskLevel: "Medium",
  },
  {
    covenant: "EBITDA Add-Backs",
    category: "Definitions",
    covLite: "Uncapped; includes synergies & run-rate items",
    fullCov: "Capped at 15-20% of Adjusted EBITDA",
    riskLevel: "High",
  },
  {
    covenant: "J.Crew Blocker",
    category: "Structural",
    covLite: "Often absent — IP can be transferred",
    fullCov: "Explicit restriction on collateral leakage",
    riskLevel: "High",
  },
  {
    covenant: "Springing Maturity",
    category: "Structural",
    covLite: "Usually included for RCF",
    fullCov: "Included; accelerates if bonds remain",
    riskLevel: "Low",
  },
  {
    covenant: "Change of Control",
    category: "Structural",
    covLite: "101% put; limited to change of sponsor",
    fullCov: "101% put on any ownership change",
    riskLevel: "Medium",
  },
  {
    covenant: "Reporting Requirements",
    category: "Operational",
    covLite: "45-day quarterly / 90-day annual",
    fullCov: "30-day quarterly / 60-day annual",
    riskLevel: "Low",
  },
];

const LEAGUE_TABLE: LeagueEntry[] = [
  { rank: 1, bank: "JPMorgan Chase", deals: 312, volumeB: 487.3, sharePercent: 18.4, avgSize: 1562, yoyChange: 3.2 },
  { rank: 2, bank: "Bank of America", deals: 287, volumeB: 421.8, sharePercent: 15.9, avgSize: 1469, yoyChange: 1.7 },
  { rank: 3, bank: "Goldman Sachs", deals: 241, volumeB: 368.5, sharePercent: 13.9, avgSize: 1529, yoyChange: -0.8 },
  { rank: 4, bank: "Citigroup", deals: 198, volumeB: 294.1, sharePercent: 11.1, avgSize: 1485, yoyChange: 2.1 },
  { rank: 5, bank: "Morgan Stanley", deals: 167, volumeB: 241.7, sharePercent: 9.1, avgSize: 1447, yoyChange: -1.4 },
  { rank: 6, bank: "Barclays", deals: 143, volumeB: 198.4, sharePercent: 7.5, avgSize: 1387, yoyChange: 4.3 },
  { rank: 7, bank: "Deutsche Bank", deals: 118, volumeB: 162.6, sharePercent: 6.1, avgSize: 1378, yoyChange: -2.9 },
  { rank: 8, bank: "Credit Suisse", deals: 97, volumeB: 131.2, sharePercent: 4.9, avgSize: 1352, yoyChange: -5.1 },
];

// ── Generate Book Building Investors ──────────────────────────────────────────

function generateInvestors(dealSizeM: number): InvestorAllocation[] {
  resetSeed(975);
  const types = ["CLO Manager", "Hedge Fund", "Insurance Co", "Pension Fund", "Bank", "Direct Lender"];
  const names = [
    "Ares Management", "Carlyle Credit", "Blackstone Credit", "KKR Credit",
    "Owl Rock", "Blue Owl Capital", "Barings", "MassMutual",
    "TIAA-CREF", "Principal Financial", "Voya Financial", "Nuveen",
    "Octagon Credit", "Symphony Asset Mgmt", "Benefit Street", "Sound Point",
  ];

  const totalCommit = dealSizeM * (1.8 + rand() * 0.7); // 1.8x–2.5x oversubscribed
  const investorCount = 14 + Math.floor(rand() * 4);
  const investors: InvestorAllocation[] = [];

  for (let i = 0; i < investorCount && i < names.length; i++) {
    const commitFrac = 0.03 + rand() * 0.09;
    const commitM = Math.round(totalCommit * commitFrac / 5) * 5;
    investors.push({
      name: names[i],
      type: types[Math.floor(rand() * types.length)],
      commitM,
      allocM: 0,
      scaled: false,
    });
  }

  // Scale back to deal size
  const totalCommitActual = investors.reduce((a, b) => a + b.commitM, 0);
  const scaleFactor = dealSizeM / totalCommitActual;
  investors.forEach((inv) => {
    inv.allocM = Math.round(inv.commitM * scaleFactor / 5) * 5;
    inv.scaled = inv.allocM < inv.commitM;
  });

  return investors;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtM(val: number): string {
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}B`;
  return `$${val.toFixed(0)}M`;
}

function discountToPar(price: number): string {
  const disc = 100 - price;
  if (disc <= 0) return "At par";
  return `${disc.toFixed(2)} pts`;
}

// ── Color helpers ──────────────────────────────────────────────────────────────

function roleColor(role: SyndicationRole): string {
  if (role === "Bookrunning") return "bg-primary/20 text-primary border-border";
  if (role === "Co-Lead") return "bg-primary/20 text-primary border-border";
  return "bg-muted/40 text-muted-foreground border-border/30";
}

function statusColor(status: DealStatus): string {
  if (status === "Active") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (status === "Pricing") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (status === "Closed") return "bg-muted/40 text-muted-foreground border-border/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

function ratingColor(rating: LoanGrade): string {
  if (rating.startsWith("BB")) return "text-emerald-400";
  if (rating === "B+" || rating === "B") return "text-amber-400";
  return "text-red-400";
}

function riskColor(level: "Low" | "Medium" | "High"): string {
  if (level === "Low") return "text-emerald-400";
  if (level === "Medium") return "text-amber-400";
  return "text-red-400";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-foreground",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-lg font-semibold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Pipeline Tab ───────────────────────────────────────────────────────────────

function PipelineTab() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const totalPipeline = SYNDICATION_DEALS.reduce((a, d) => a + d.sizeM, 0);
  const bookrunningCount = SYNDICATION_DEALS.filter((d) => d.role === "Bookrunning").length;
  const activeDealCount = SYNDICATION_DEALS.filter((d) => d.status === "Active" || d.status === "Pricing").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Total Pipeline" value={fmtM(totalPipeline)} sub="across 5 deals" color="text-primary" />
        <StatCard icon={Star} label="Bookrunning" value={`${bookrunningCount} deals`} sub="lead arranger" color="text-primary" />
        <StatCard icon={Activity} label="Active / Pricing" value={`${activeDealCount} deals`} sub="in market" color="text-amber-400" />
        <StatCard icon={Percent} label="Avg Spread" value="L+320 bps" sub="blended pipeline" color="text-emerald-400" />
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Active Syndication Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SYNDICATION_DEALS.map((deal) => {
              const expanded = expandedId === deal.id;
              return (
                <div key={deal.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedId(expanded ? null : deal.id)}
                  >
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{deal.borrower}</p>
                          <p className="text-xs text-muted-foreground">{deal.purpose} · {deal.sector}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <span className="text-sm font-semibold text-foreground">{fmtM(deal.sizeM)}</span>
                        <Badge className={`text-xs px-2 py-0.5 border ${roleColor(deal.role)}`}>{deal.role}</Badge>
                        <Badge className={`text-xs px-2 py-0.5 border ${statusColor(deal.status)}`}>{deal.status}</Badge>
                        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </button>

                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-border bg-card/50"
                    >
                      <div className="px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Tranche</p>
                          <p className="text-sm font-medium text-foreground">{deal.dealType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pricing</p>
                          <p className="text-sm font-medium text-foreground">SOFR+{deal.pricingBps} bps</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">OID</p>
                          <p className="text-sm font-medium text-foreground">{deal.oid.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Leverage</p>
                          <p className={`text-sm font-medium ${deal.leverage > 5.0 ? "text-red-400" : deal.leverage > 4.0 ? "text-amber-400" : "text-emerald-400"}`}>
                            {deal.leverage.toFixed(1)}x
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <p className={`text-sm font-medium ${ratingColor(deal.rating)}`}>{deal.rating}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Maturity</p>
                          <p className="text-sm font-medium text-foreground">{deal.maturity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sponsor</p>
                          <p className="text-sm font-medium text-foreground">{deal.sponsor}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sector</p>
                          <p className="text-sm font-medium text-foreground">{deal.sector}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline SVG Bar */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Deal Size by Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg width="100%" height="120" viewBox="0 0 600 120">
            {SYNDICATION_DEALS.map((deal, i) => {
              const maxSize = Math.max(...SYNDICATION_DEALS.map((d) => d.sizeM));
              const barW = (deal.sizeM / maxSize) * 480;
              const y = i * 22 + 8;
              const fillColor =
                deal.role === "Bookrunning" ? "#3b82f6"
                  : deal.role === "Co-Lead" ? "#8b5cf6"
                  : "#6b7280";
              return (
                <g key={deal.id}>
                  <text x="0" y={y + 12} fontSize="10" fill="#a1a1aa" className="truncate">
                    {deal.borrower.split(" ").slice(0, 2).join(" ")}
                  </text>
                  <rect x="130" y={y} width={barW} height="16" rx="3" fill={fillColor} opacity="0.8" />
                  <text x={130 + barW + 6} y={y + 12} fontSize="10" fill="#d4d4d8">{fmtM(deal.sizeM)}</text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Book Building Tab ──────────────────────────────────────────────────────────

function BookBuildingTab() {
  const [selectedDealId, setSelectedDealId] = useState<number>(1);
  const selectedDeal = SYNDICATION_DEALS.find((d) => d.id === selectedDealId) ?? SYNDICATION_DEALS[0];

  const investors = useMemo(
    () => generateInvestors(selectedDeal.sizeM),
    [selectedDeal.sizeM]
  );

  const totalCommit = investors.reduce((a, b) => a + b.commitM, 0);
  const totalAlloc = investors.reduce((a, b) => a + b.allocM, 0);
  const oversubRatio = totalCommit / selectedDeal.sizeM;
  const scaledCount = investors.filter((i) => i.scaled).length;

  return (
    <div className="space-y-6">
      {/* Deal Selector */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            {SYNDICATION_DEALS.map((d) => (
              <Button
                key={d.id}
                variant={selectedDealId === d.id ? "default" : "outline"}
                size="sm"
                className={selectedDealId === d.id
                  ? "bg-primary hover:bg-primary/80 text-white border-0"
                  : "bg-muted border-border text-muted-foreground hover:bg-muted"}
                onClick={() => setSelectedDealId(d.id)}
              >
                {d.borrower.split(" ").slice(0, 2).join(" ")} · {d.dealType}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Deal Size" value={fmtM(selectedDeal.sizeM)} sub="total tranche" color="text-primary" />
        <StatCard icon={TrendingUp} label="Total Commitments" value={fmtM(totalCommit)} sub="from all investors" color="text-primary" />
        <StatCard
          icon={Activity}
          label="Oversubscription"
          value={`${oversubRatio.toFixed(2)}x`}
          sub="demand / deal size"
          color={oversubRatio >= 2 ? "text-emerald-400" : "text-amber-400"}
        />
        <StatCard icon={Users} label="Investors Scaled" value={`${scaledCount} / ${investors.length}`} sub="received less than ask" color="text-amber-400" />
      </div>

      {/* Book visual */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Demand Book — {selectedDeal.borrower}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Oversubscription visual */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Deal Size ({fmtM(selectedDeal.sizeM)})</span>
              <span>Total Demand ({fmtM(totalCommit)})</span>
            </div>
            <div className="h-5 bg-muted rounded-full overflow-hidden relative">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min((selectedDeal.sizeM / totalCommit) * 100, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                {oversubRatio.toFixed(2)}x oversubscribed
              </div>
            </div>
          </div>

          {/* Investor table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground py-2 pr-4">Investor</th>
                  <th className="text-left text-xs text-muted-foreground py-2 pr-4">Type</th>
                  <th className="text-right text-xs text-muted-foreground py-2 pr-4">Committed</th>
                  <th className="text-right text-xs text-muted-foreground py-2 pr-4">Allocated</th>
                  <th className="text-right text-xs text-muted-foreground py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((inv, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2 pr-4 font-medium text-foreground">{inv.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground text-xs">{inv.type}</td>
                    <td className="py-2 pr-4 text-right text-muted-foreground">{fmtM(inv.commitM)}</td>
                    <td className="py-2 pr-4 text-right text-foreground">{fmtM(inv.allocM)}</td>
                    <td className="py-2 text-right">
                      {inv.scaled ? (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs border">Scaled</Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs border">Full</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td className="py-2 pr-4 font-semibold text-foreground" colSpan={2}>Total</td>
                  <td className="py-2 pr-4 text-right font-semibold text-foreground">{fmtM(totalCommit)}</td>
                  <td className="py-2 pr-4 text-right font-semibold text-foreground">{fmtM(totalAlloc)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Pricing Grid Tab ───────────────────────────────────────────────────────────

function PricingGridTab() {
  const [leverageInput, setLeverageInput] = useState<number>(4.2);

  const activeTier = useMemo(() => {
    return PRICING_GRID.find((t) => leverageInput <= t.leverageMax) ?? PRICING_GRID[PRICING_GRID.length - 1];
  }, [leverageInput]);

  const maxSpread = Math.max(...PRICING_GRID.map((t) => t.spreadBps));

  return (
    <div className="space-y-6">
      {/* Interactive selector */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            Pricing Grid Simulator — TechPlatform Inc TLB
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-2">
                Leverage (x EBITDA): <span className="text-foreground font-semibold">{leverageInput.toFixed(1)}x</span>
              </p>
              <input
                type="range"
                min="1.0"
                max="7.0"
                step="0.1"
                value={leverageInput}
                onChange={(e) => setLeverageInput(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1.0x</span>
                <span>7.0x</span>
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg min-w-[130px]">
              <p className="text-xs text-muted-foreground">Applicable Spread</p>
              <p className="text-2xl font-bold text-primary">+{activeTier.spreadBps}</p>
              <p className="text-xs text-muted-foreground">bps over SOFR</p>
              <p className="text-xs text-muted-foreground mt-1">Floor: {activeTier.floor}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Full Pricing Grid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PRICING_GRID.map((tier, i) => {
              const isActive = tier === activeTier;
              const barWidth = (tier.spreadBps / maxSpread) * 100;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive ? "bg-primary/10 border border-border" : "bg-muted/50"
                  }`}
                >
                  <div className="w-24 shrink-0">
                    <p className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {tier.leverageLabel}
                    </p>
                  </div>
                  <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all ${isActive ? "bg-primary" : "bg-muted"}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="w-24 text-right shrink-0">
                    <span className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                      SOFR+{tier.spreadBps}
                    </span>
                  </div>
                  <div className="w-20 text-right shrink-0">
                    <span className="text-xs text-muted-foreground">Floor {tier.floor}%</span>
                  </div>
                  {isActive && (
                    <Badge className="bg-primary/20 text-primary border-border border text-xs shrink-0">Active</Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* SVG Visualization */}
          <div className="mt-6">
            <p className="text-xs text-muted-foreground mb-3">Spread Staircase (bps)</p>
            <svg width="100%" height="160" viewBox="0 0 600 160">
              {PRICING_GRID.map((tier, i) => {
                const x = i * (600 / PRICING_GRID.length);
                const w = 600 / PRICING_GRID.length - 4;
                const h = (tier.spreadBps / maxSpread) * 130;
                const y = 140 - h;
                const isAct = tier === activeTier;
                return (
                  <g key={i}>
                    <rect
                      x={x + 2}
                      y={y}
                      width={w}
                      height={h}
                      rx="3"
                      fill={isAct ? "#3b82f6" : "#3f3f46"}
                      opacity={isAct ? 1 : 0.7}
                    />
                    <text
                      x={x + w / 2 + 2}
                      y={y - 4}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isAct ? "#93c5fd" : "#a1a1aa"}
                    >
                      {tier.spreadBps}
                    </text>
                    <text
                      x={x + w / 2 + 2}
                      y={152}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#71717a"
                    >
                      {tier.leverageLabel.split("–")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Secondary Market Tab ───────────────────────────────────────────────────────

function SecondaryMarketTab() {
  const [sortBy, setSortBy] = useState<"bid" | "ytm" | "parSpread">("bid");

  const sorted = useMemo(() => {
    return [...SECONDARY_LOANS].sort((a, b) => {
      if (sortBy === "bid") return b.bid - a.bid;
      if (sortBy === "ytm") return b.ytm - a.ytm;
      return b.parSpread - a.parSpread;
    });
  }, [sortBy]);

  const distressedCount = SECONDARY_LOANS.filter((l) => l.distressed).length;
  const avgBid = SECONDARY_LOANS.reduce((a, l) => a + l.bid, 0) / SECONDARY_LOANS.length;
  const avgYtm = SECONDARY_LOANS.reduce((a, l) => a + l.ytm, 0) / SECONDARY_LOANS.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label="Loans Tracked" value="6" sub="secondary trades" color="text-primary" />
        <StatCard icon={AlertTriangle} label="Distressed" value={`${distressedCount} loans`} sub="< 90 pts" color="text-red-400" />
        <StatCard icon={Percent} label="Avg Bid" value={`${avgBid.toFixed(1)}`} sub="cents on dollar" color="text-amber-400" />
        <StatCard icon={TrendingUp} label="Avg YTM" value={`${avgYtm.toFixed(1)}%`} sub="yield to maturity" color="text-emerald-400" />
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Secondary Loan Prices
            </CardTitle>
            <div className="flex gap-1">
              {(["bid", "ytm", "parSpread"] as const).map((s) => (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  className={`text-xs h-7 ${sortBy === s ? "bg-muted border-border text-foreground" : "bg-muted border-border text-muted-foreground"}`}
                  onClick={() => setSortBy(s)}
                >
                  {s === "bid" ? "Price" : s === "ytm" ? "YTM" : "Spread"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sorted.map((loan) => {
              const midPrice = (loan.bid + loan.offer) / 2;
              return (
                <div
                  key={loan.id}
                  className={`p-4 rounded-lg border ${
                    loan.distressed
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{loan.borrower}</p>
                        <Badge className="text-xs px-1.5 py-0 bg-muted/50 text-muted-foreground border-border border">{loan.tranche}</Badge>
                        {loan.distressed && (
                          <Badge className="text-xs px-1.5 py-0 bg-red-500/20 text-red-400 border-red-500/30 border flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Distressed
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{loan.sector} · Matures {loan.maturity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-lg font-bold ${loan.distressed ? "text-red-400" : "text-foreground"}`}>
                        {loan.bid.toFixed(2)} / {loan.offer.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{discountToPar(midPrice)} to par</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className={`text-sm font-medium ${ratingColor(loan.rating)}`}>{loan.rating}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Par Spread</p>
                      <p className="text-sm font-medium text-foreground">+{loan.parSpread} bps</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">YTM</p>
                      <p className={`text-sm font-medium ${loan.ytm > 12 ? "text-red-400" : loan.ytm > 9 ? "text-amber-400" : "text-emerald-400"}`}>
                        {loan.ytm.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  {/* Bid/ask bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${loan.distressed ? "bg-red-500" : "bg-primary"}`}
                        style={{ width: `${(loan.bid / 100) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                      <span>0</span>
                      <span>Par (100)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Covenant Analysis Tab ──────────────────────────────────────────────────────

function CovenantTab() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const categories = [...new Set(COVENANT_COMPARISONS.map((c) => c.category))];

  const riskCounts = {
    High: COVENANT_COMPARISONS.filter((c) => c.riskLevel === "High").length,
    Medium: COVENANT_COMPARISONS.filter((c) => c.riskLevel === "Medium").length,
    Low: COVENANT_COMPARISONS.filter((c) => c.riskLevel === "Low").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={AlertTriangle} label="High Risk Gaps" value={`${riskCounts.High}`} sub="cov-lite vs full" color="text-red-400" />
        <StatCard icon={Shield} label="Medium Risk" value={`${riskCounts.Medium}`} sub="partial protections" color="text-amber-400" />
        <StatCard icon={CheckCircle} label="Low Differential" value={`${riskCounts.Low}`} sub="minimal difference" color="text-emerald-400" />
      </div>

      {/* Education card */}
      <Card className="bg-card border-border border-l-4 border-l-blue-500">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">What is Cov-Lite?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Covenant-lite loans lack <strong className="text-muted-foreground">financial maintenance covenants</strong> — borrowers only
                trigger tests if they take specific actions (incurrence-based). Full covenant packages
                require quarterly compliance tests. Cov-lite loans offer borrowers more flexibility but
                reduce lender early-warning protections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {categories.map((category) => (
        <Card key={category} className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {category} Covenants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {COVENANT_COMPARISONS.filter((c) => c.category === category).map((cov, i) => {
                const key = `${category}-${i}`;
                const isExpanded = expandedRow === (COVENANT_COMPARISONS.indexOf(cov));
                return (
                  <div key={key} className="border border-border rounded-lg overflow-hidden">
                    <button
                      className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedRow(isExpanded ? null : COVENANT_COMPARISONS.indexOf(cov))}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          cov.riskLevel === "High" ? "bg-red-500/20 text-red-400"
                            : cov.riskLevel === "Medium" ? "bg-amber-500/20 text-amber-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}>{cov.riskLevel}</span>
                        <span className="text-sm font-medium text-foreground">{cov.covenant}</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="border-t border-border grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border"
                      >
                        <div className="p-4 bg-red-500/5">
                          <p className="text-xs font-semibold text-red-400 mb-1">Cov-Lite</p>
                          <p className="text-sm text-muted-foreground">{cov.covLite}</p>
                        </div>
                        <div className="p-4 bg-emerald-500/5">
                          <p className="text-xs font-semibold text-emerald-400 mb-1">Full Covenant</p>
                          <p className="text-sm text-muted-foreground">{cov.fullCov}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── League Table Tab ───────────────────────────────────────────────────────────

function LeagueTableTab() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? LEAGUE_TABLE : LEAGUE_TABLE.slice(0, 5);
  const maxVol = Math.max(...LEAGUE_TABLE.map((e) => e.volumeB));

  const totalVol = LEAGUE_TABLE.reduce((a, e) => a + e.volumeB, 0);
  const totalDeals = LEAGUE_TABLE.reduce((a, e) => a + e.deals, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Building2} label="Top 8 Arrangers" value="$2.31T" sub="combined volume" color="text-primary" />
        <StatCard icon={Award} label="Total Deals" value={`${totalDeals.toLocaleString()}`} sub="LTM syndicated" color="text-primary" />
        <StatCard icon={Globe} label="Market Total" value={`$${(totalVol / 0.875).toFixed(0)}B`} sub="est. total mkt" color="text-amber-400" />
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Lead Arranger League Table — LTM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground py-2 pr-3 w-8">#</th>
                  <th className="text-left text-xs text-muted-foreground py-2 pr-4">Bank</th>
                  <th className="text-right text-xs text-muted-foreground py-2 pr-4">Deals</th>
                  <th className="text-left text-xs text-muted-foreground py-2 pr-4 hidden md:table-cell">Volume Share</th>
                  <th className="text-right text-xs text-muted-foreground py-2 pr-4">Volume ($B)</th>
                  <th className="text-right text-xs text-muted-foreground py-2 pr-4">Mkt Share</th>
                  <th className="text-right text-xs text-muted-foreground py-2">YoY</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((entry) => (
                  <tr key={entry.rank} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-3">
                      <span className={`text-sm font-bold ${
                        entry.rank === 1 ? "text-amber-400"
                          : entry.rank === 2 ? "text-muted-foreground"
                          : entry.rank === 3 ? "text-orange-400"
                          : "text-muted-foreground"
                      }`}>{entry.rank}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium text-foreground">{entry.bank}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">{entry.deals}</td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-muted rounded overflow-hidden max-w-[120px]">
                          <div
                            className={`h-full rounded ${entry.rank <= 2 ? "bg-primary" : "bg-muted"}`}
                            style={{ width: `${(entry.volumeB / maxVol) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-12">{entry.sharePercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-foreground">{entry.volumeB.toFixed(1)}</td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">{entry.sharePercent}%</td>
                    <td className="py-3 text-right">
                      <span className={`text-xs font-medium flex items-center justify-end gap-0.5 ${
                        entry.yoyChange >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {entry.yoyChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(entry.yoyChange).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!showAll && LEAGUE_TABLE.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-muted-foreground hover:text-muted-foreground text-xs"
              onClick={() => setShowAll(true)}
            >
              Show all {LEAGUE_TABLE.length} entries <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          )}

          {/* SVG donut-style market share visualization */}
          <div className="mt-6 flex items-center gap-6">
            <div className="shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120">
                {(() => {
                  const cx = 60, cy = 60, r = 48, innerR = 32;
                  let angle = -Math.PI / 2;
                  const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#6366f1", "#ec4899", "#14b8a6", "#f97316"];
                  return LEAGUE_TABLE.map((entry, i) => {
                    const slice = (entry.sharePercent / 100) * 2 * Math.PI;
                    const x1 = cx + r * Math.cos(angle);
                    const y1 = cy + r * Math.sin(angle);
                    const x2 = cx + r * Math.cos(angle + slice);
                    const y2 = cy + r * Math.sin(angle + slice);
                    const xi1 = cx + innerR * Math.cos(angle);
                    const yi1 = cy + innerR * Math.sin(angle);
                    const xi2 = cx + innerR * Math.cos(angle + slice);
                    const yi2 = cy + innerR * Math.sin(angle + slice);
                    const large = slice > Math.PI ? 1 : 0;
                    const d = `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 ${large} 0 ${xi1} ${yi1} Z`;
                    angle += slice;
                    return <path key={i} d={d} fill={colors[i]} opacity="0.85" />;
                  });
                })()}
                <text x="60" y="56" textAnchor="middle" fontSize="11" fill="#d4d4d8" fontWeight="bold">Top 8</text>
                <text x="60" y="68" textAnchor="middle" fontSize="9" fill="#a1a1aa">Share</text>
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {LEAGUE_TABLE.map((entry, i) => {
                const colors = ["bg-primary", "bg-primary", "bg-amber-500", "bg-emerald-500", "bg-indigo-500", "bg-pink-500", "bg-teal-500", "bg-orange-500"];
                return (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${colors[i]}`} />
                    <span className="text-xs text-muted-foreground">{entry.bank.split(" ")[0]}</span>
                    <span className="text-xs text-muted-foreground">{entry.sharePercent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function LoanSyndicationPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground p-4 md:p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Loan Syndication & Leveraged Finance</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          Primary syndication pipeline, book building, pricing grids, secondary trading and covenant analysis.
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign} label="Pipeline Value" value="$8.1B" sub="5 active deals" color="text-primary" />
        <StatCard icon={TrendingUp} label="Avg Leverage" value="4.3x" sub="blended portfolio" color="text-amber-400" />
        <StatCard icon={RefreshCw} label="Book Coverage" value="2.1x" sub="avg oversubscription" color="text-emerald-400" />
        <StatCard icon={Shield} label="Cov-Lite %" value="78%" sub="of new issuance" color="text-primary" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pipeline">
        <TabsList className="bg-card border border-border h-auto flex-wrap gap-1 p-1 mb-6">
          <TabsTrigger value="pipeline" className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs px-3 py-1.5">
            <Briefcase className="w-3.5 h-3.5 mr-1.5" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="bookbuilding" className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs px-3 py-1.5">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Book Building
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs px-3 py-1.5">
            <Target className="w-3.5 h-3.5 mr-1.5" />
            Pricing Grid
          </TabsTrigger>
          <TabsTrigger value="secondary" className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs px-3 py-1.5">
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Secondary
          </TabsTrigger>
          <TabsTrigger value="covenants" className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs px-3 py-1.5">
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            Covenants
          </TabsTrigger>
          <TabsTrigger value="league" className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs px-3 py-1.5">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            League Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="data-[state=inactive]:hidden">
          <PipelineTab />
        </TabsContent>

        <TabsContent value="bookbuilding" className="data-[state=inactive]:hidden">
          <BookBuildingTab />
        </TabsContent>

        <TabsContent value="pricing" className="data-[state=inactive]:hidden">
          <PricingGridTab />
        </TabsContent>

        <TabsContent value="secondary" className="data-[state=inactive]:hidden">
          <SecondaryMarketTab />
        </TabsContent>

        <TabsContent value="covenants" className="data-[state=inactive]:hidden">
          <CovenantTab />
        </TabsContent>

        <TabsContent value="league" className="data-[state=inactive]:hidden">
          <LeagueTableTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
