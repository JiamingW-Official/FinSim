"use client";

import { useState, useMemo } from "react";
import {
  Leaf,
  Users,
  Shield,
  Globe,
  Droplets,
  Wind,
  BarChart2,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Award,
  BookOpen,
  Target,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 810;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function rn(lo: number, hi: number) {
  return lo + rand() * (hi - lo);
}
function ri(lo: number, hi: number) {
  return Math.floor(rn(lo, hi + 1));
}
function rf(lo: number, hi: number, dec = 1) {
  return parseFloat(rn(lo, hi).toFixed(dec));
}

// ── Interfaces ─────────────────────────────────────────────────────────────────

interface ESGCompany {
  ticker: string;
  name: string;
  sector: string;
  eScore: number;
  sScore: number;
  gScore: number;
  total: number;
  rating: "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC";
  carbonFootprint: number; // tCO2e per $M revenue
  waterUsage: number; // cubic meters per $M revenue
  genderDiversityPct: number;
  boardIndependencePct: number;
  controversyFlag: boolean;
  excluded: boolean; // passes negative screening
}

interface ScreeningCriteria {
  id: string;
  label: string;
  category: "negative" | "positive";
  enabled: boolean;
}

interface ImpactMetric {
  company: string;
  carbon: number;
  water: number;
  genderDiv: number;
  boardInd: number;
  renewableEnergy: number;
  supplierAudit: number;
}

interface SDGItem {
  id: number;
  title: string;
  color: string;
  aligned: boolean;
}

// ── Static seed-generated data ─────────────────────────────────────────────────

const TICKERS: { ticker: string; name: string; sector: string }[] = [
  { ticker: "MSFT", name: "Microsoft", sector: "Technology" },
  { ticker: "TSLA", name: "Tesla", sector: "Automotive" },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Financials" },
  { ticker: "XOM", name: "ExxonMobil", sector: "Energy" },
  { ticker: "PG", name: "Procter & Gamble", sector: "Consumer Staples" },
];

const RATING_THRESHOLDS: { min: number; rating: ESGCompany["rating"]; color: string }[] = [
  { min: 85, rating: "AAA", color: "text-emerald-400" },
  { min: 75, rating: "AA", color: "text-green-400" },
  { min: 65, rating: "A", color: "text-lime-400" },
  { min: 55, rating: "BBB", color: "text-yellow-400" },
  { min: 45, rating: "BB", color: "text-orange-400" },
  { min: 35, rating: "B", color: "text-red-400" },
  { min: 0, rating: "CCC", color: "text-red-600" },
];

function getRating(score: number): { rating: ESGCompany["rating"]; color: string } {
  for (const t of RATING_THRESHOLDS) {
    if (score >= t.min) return { rating: t.rating, color: t.color };
  }
  return { rating: "CCC", color: "text-red-600" };
}

function buildCompanies(): ESGCompany[] {
  return TICKERS.map((t) => {
    const eScore = rf(30, 95);
    const sScore = rf(30, 95);
    const gScore = rf(30, 95);
    const total = parseFloat(((eScore + sScore + gScore) / 3).toFixed(1));
    const { rating } = getRating(total);
    return {
      ...t,
      eScore,
      sScore,
      gScore,
      total,
      rating,
      carbonFootprint: rf(5, 180),
      waterUsage: rf(10, 500),
      genderDiversityPct: rf(20, 55),
      boardIndependencePct: rf(40, 90),
      controversyFlag: rand() > 0.65,
      excluded: rand() > 0.7,
    };
  });
}

const COMPANIES: ESGCompany[] = buildCompanies();

const SCREENING_CRITERIA: ScreeningCriteria[] = [
  { id: "tobacco", label: "Tobacco", category: "negative", enabled: true },
  { id: "weapons", label: "Controversial Weapons", category: "negative", enabled: true },
  { id: "fossil", label: "Fossil Fuels (>5% rev)", category: "negative", enabled: false },
  { id: "gambling", label: "Gambling", category: "negative", enabled: false },
  { id: "alcohol", label: "Alcohol", category: "negative", enabled: false },
  { id: "adult", label: "Adult Content", category: "negative", enabled: true },
  { id: "cleantech", label: "Clean Technology", category: "positive", enabled: true },
  { id: "renewable", label: "Renewable Energy", category: "positive", enabled: true },
  { id: "healthcare", label: "Healthcare Access", category: "positive", enabled: false },
  { id: "education", label: "Education / Inclusion", category: "positive", enabled: false },
];

function buildImpactMetrics(): ImpactMetric[] {
  return TICKERS.map((t) => ({
    company: t.ticker,
    carbon: rf(10, 200),
    water: rf(20, 600),
    genderDiv: rf(22, 58),
    boardInd: rf(45, 92),
    renewableEnergy: rf(10, 100),
    supplierAudit: rf(30, 100),
  }));
}

const IMPACT_DATA: ImpactMetric[] = buildImpactMetrics();

const UN_SDGS: SDGItem[] = [
  { id: 1, title: "No Poverty", color: "#E5243B", aligned: rand() > 0.5 },
  { id: 2, title: "Zero Hunger", color: "#DDA63A", aligned: rand() > 0.5 },
  { id: 3, title: "Good Health", color: "#4C9F38", aligned: rand() > 0.4 },
  { id: 4, title: "Quality Education", color: "#C5192D", aligned: rand() > 0.4 },
  { id: 5, title: "Gender Equality", color: "#FF3A21", aligned: rand() > 0.3 },
  { id: 6, title: "Clean Water", color: "#26BDE2", aligned: rand() > 0.4 },
  { id: 7, title: "Clean Energy", color: "#FCC30B", aligned: rand() > 0.3 },
  { id: 8, title: "Decent Work", color: "#A21942", aligned: rand() > 0.4 },
  { id: 9, title: "Industry & Innovation", color: "#FD6925", aligned: rand() > 0.4 },
  { id: 10, title: "Reduced Inequalities", color: "#DD1367", aligned: rand() > 0.5 },
  { id: 11, title: "Sustainable Cities", color: "#FD9D24", aligned: rand() > 0.4 },
  { id: 12, title: "Responsible Consumption", color: "#BF8B2E", aligned: rand() > 0.3 },
  { id: 13, title: "Climate Action", color: "#3F7E44", aligned: rand() > 0.2 },
  { id: 14, title: "Life Below Water", color: "#0A97D9", aligned: rand() > 0.5 },
  { id: 15, title: "Life on Land", color: "#56C02B", aligned: rand() > 0.5 },
  { id: 16, title: "Peace & Justice", color: "#00689D", aligned: rand() > 0.5 },
  { id: 17, title: "Partnerships", color: "#19486A", aligned: rand() > 0.3 },
];

// ── Helper components ──────────────────────────────────────────────────────────

function RadarChart({ company }: { company: ESGCompany }) {
  const cx = 90;
  const cy = 90;
  const r = 70;
  const axes = [
    { label: "E", value: company.eScore, angle: -90 },
    { label: "S", value: company.sScore, angle: 30 },
    { label: "G", value: company.gScore, angle: 150 },
  ];

  const toXY = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const rings = [20, 40, 60, 80, 100];

  const dataPoints = axes.map((a) => {
    const scaled = (a.value / 100) * r;
    return toXY(a.angle, scaled);
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 180 180" className="w-full h-full">
      {/* Grid rings */}
      {rings.map((ring) => {
        const ringPts = axes.map((a) => {
          const scaled = (ring / 100) * r;
          return toXY(a.angle, scaled);
        });
        const ringPath = ringPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return <path key={ring} d={ringPath} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.6" />;
      })}

      {/* Axis lines */}
      {axes.map((a) => {
        const tip = toXY(a.angle, r);
        return <line key={a.label} x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.6" />;
      })}

      {/* Data polygon */}
      <path d={dataPath} fill="hsl(var(--primary)/0.25)" stroke="hsl(var(--primary))" strokeWidth="1.5" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary))" />
      ))}

      {/* Labels */}
      {axes.map((a) => {
        const labelPos = toXY(a.angle, r + 14);
        return (
          <text key={a.label} x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="hsl(var(--foreground))" fontWeight="600">
            {a.label}
          </text>
        );
      })}

      {/* Score values */}
      {axes.map((a) => {
        const valPos = toXY(a.angle, (a.value / 100) * r - 10);
        return (
          <text key={`v-${a.label}`} x={valPos.x} y={valPos.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="hsl(var(--muted-foreground))">
            {a.value.toFixed(0)}
          </text>
        );
      })}
    </svg>
  );
}

function HorizontalBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-12 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

function BarChartSVG({
  data,
  label,
  color,
  unit,
}: {
  data: { label: string; value: number }[];
  label: string;
  color: string;
  unit: string;
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const W = 320;
  const H = 140;
  const padL = 36;
  const padB = 24;
  const padT = 10;
  const padR = 10;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;
  const barW = (chartW / data.length) * 0.6;
  const gap = chartW / data.length;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Y grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padT + chartH * (1 - t);
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" />
              <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="7" fill="hsl(var(--muted-foreground))">
                {(maxVal * t).toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * chartH;
          const x = padL + gap * i + (gap - barW) / 2;
          const y = padT + chartH - barH;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={barW} height={barH} fill={color} rx="2" opacity="0.85" />
              <text x={x + barW / 2} y={H - padB + 10} textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Unit label */}
        <text x={padL} y={padT - 2} fontSize="7" fill="hsl(var(--muted-foreground))">
          {unit}
        </text>
      </svg>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ESGIntegrationPage() {
  const [criteria, setCriteria] = useState<ScreeningCriteria[]>(SCREENING_CRITERIA);
  const [scoreThreshold, setScoreThreshold] = useState(50);
  const [selectedCompany, setSelectedCompany] = useState<ESGCompany>(COMPANIES[0]);
  const [priChecks, setPriChecks] = useState<Record<number, boolean>>({});

  const toggleCriteria = (id: string) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  };

  const togglePri = (idx: number) => {
    setPriChecks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredCompanies = useMemo(() => {
    const negActive = criteria.filter((c) => c.category === "negative" && c.enabled).map((c) => c.id);
    const hasNegFossil = negActive.includes("fossil");
    return COMPANIES.filter((co) => {
      if (co.total < scoreThreshold) return false;
      if (hasNegFossil && co.sector === "Energy") return false;
      return true;
    });
  }, [criteria, scoreThreshold]);

  const ratingBadgeColor = (rating: ESGCompany["rating"]) => {
    const map: Record<string, string> = {
      AAA: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      AA: "bg-green-500/20 text-green-400 border-green-500/30",
      A: "bg-lime-500/20 text-lime-400 border-lime-500/30",
      BBB: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      BB: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      B: "bg-red-500/20 text-red-400 border-red-500/30",
      CCC: "bg-red-700/20 text-red-600 border-red-700/30",
    };
    return map[rating] ?? map["BBB"];
  };

  const priPrinciples = [
    "We will incorporate ESG issues into investment analysis and decision-making processes.",
    "We will be active owners and incorporate ESG issues into our ownership policies and practices.",
    "We will seek appropriate disclosure on ESG issues by the entities in which we invest.",
    "We will promote acceptance and implementation of the Principles within the investment industry.",
    "We will work together to enhance our effectiveness in implementing the Principles.",
    "We will each report on our activities and progress towards implementing the Principles.",
  ];

  const sfdArticles = [
    {
      id: "Art. 6",
      label: "Article 6",
      desc: "No sustainability claim. Standard fund with ESG risk integration only.",
      color: "text-muted-foreground",
      border: "border-muted",
    },
    {
      id: "Art. 8",
      label: "Article 8",
      desc: "Light green. Promotes environmental or social characteristics alongside financial objectives.",
      color: "text-green-400",
      border: "border-green-500/30",
    },
    {
      id: "Art. 9",
      label: "Article 9",
      desc: "Dark green. Sustainable investment objective. Explicit do-no-significant-harm (DNSH) test.",
      color: "text-emerald-400",
      border: "border-emerald-500/40",
    },
  ];

  const tcfdPillars = [
    {
      title: "Governance",
      icon: Shield,
      items: ["Board oversight of climate risks", "Management roles in assessing climate", "Integration in risk frameworks"],
    },
    {
      title: "Strategy",
      icon: Target,
      items: ["Short/medium/long-term climate risks", "Impact on business & financials", "Resilience under 2°C scenarios"],
    },
    {
      title: "Risk Management",
      icon: AlertTriangle,
      items: ["Processes to identify climate risks", "How risks are managed", "Integration into overall risk process"],
    },
    {
      title: "Metrics & Targets",
      icon: BarChart2,
      items: ["Scope 1, 2, 3 emissions disclosed", "Climate-related targets set", "Progress against targets reported"],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="border-l-4 border-l-primary rounded-lg bg-card p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <Leaf className="w-6 h-6 text-emerald-400" />
                ESG Portfolio Integration
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Environmental, Social &amp; Governance scoring · Impact measurement · Sustainable frameworks
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">TCFD</Badge>
              <Badge variant="outline" className="border-green-500/40 text-green-400">SFDR</Badge>
              <Badge variant="outline" className="border-lime-500/40 text-lime-400">PRI</Badge>
              <Badge variant="outline" className="border-yellow-500/40 text-yellow-400">UN SDGs</Badge>
            </div>
          </div>
        </motion.div>

        {/* Summary stats */}
        <motion.div className="mt-8" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Portfolio ESG Score", value: (COMPANIES.reduce((s, c) => s + c.total, 0) / COMPANIES.length).toFixed(1), icon: Award, color: "text-emerald-400" },
              { label: "Avg Carbon Intensity", value: (COMPANIES.reduce((s, c) => s + c.carbonFootprint, 0) / COMPANIES.length).toFixed(1) + " tCO2e", icon: Wind, color: "text-primary" },
              { label: "Avg Gender Diversity", value: (COMPANIES.reduce((s, c) => s + c.genderDiversityPct, 0) / COMPANIES.length).toFixed(1) + "%", icon: Users, color: "text-primary" },
              { label: "Avg Board Independence", value: (COMPANIES.reduce((s, c) => s + c.boardIndependencePct, 0) / COMPANIES.length).toFixed(1) + "%", icon: Shield, color: "text-orange-400" },
            ].map((stat) => (
              <Card key={stat.label} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="scores">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="scores">ESG Scores</TabsTrigger>
            <TabsTrigger value="screening">Screening</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          </TabsList>

          {/* ── TAB 1: ESG SCORES ─────────────────────────────────────────────── */}
          <TabsContent value="scores" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Company list */}
              <div className="lg:col-span-1 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Select Company</p>
                {COMPANIES.map((co) => (
                  <motion.div key={co.ticker} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Card
                      className={`border cursor-pointer transition-colors ${selectedCompany.ticker === co.ticker ? "border-primary/50 bg-primary/5" : "border-border hover:border-border/80"}`}
                      onClick={() => setSelectedCompany(co)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{co.ticker}</p>
                            <p className="text-xs text-muted-foreground">{co.sector}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs text-muted-foreground border ${ratingBadgeColor(co.rating)}`}>{co.rating}</Badge>
                            {co.controversyFlag && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {[
                            { label: "E", value: co.eScore, color: "bg-emerald-500" },
                            { label: "S", value: co.sScore, color: "bg-primary" },
                            { label: "G", value: co.gScore, color: "bg-primary" },
                          ].map((dim) => (
                            <div key={dim.label} className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-4">{dim.label}</span>
                              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className={`h-full rounded-full ${dim.color}`} style={{ width: `${dim.value}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">{dim.value.toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Total ESG</span>
                          <span className="text-sm font-semibold">{co.total.toFixed(1)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Radar + detail */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      {selectedCompany.name} — ESG Radar
                      <Badge className={`ml-auto text-xs text-muted-foreground border ${ratingBadgeColor(selectedCompany.rating)}`}>{selectedCompany.rating}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                      <div className="w-48 h-48 flex-shrink-0">
                        <RadarChart company={selectedCompany} />
                      </div>
                      <div className="flex-1 space-y-3 w-full">
                        <div className="grid grid-cols-3 gap-3 text-center">
                          {[
                            { label: "Environmental", value: selectedCompany.eScore, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                            { label: "Social", value: selectedCompany.sScore, color: "text-primary", bg: "bg-primary/10" },
                            { label: "Governance", value: selectedCompany.gScore, color: "text-primary", bg: "bg-primary/10" },
                          ].map((dim) => (
                            <div key={dim.label} className={`rounded-lg p-3 ${dim.bg}`}>
                              <p className={`text-2xl font-bold ${dim.color}`}>{dim.value.toFixed(0)}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{dim.label}</p>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between items-center border border-border rounded px-3 py-2">
                            <span className="text-muted-foreground text-xs">Carbon Intensity</span>
                            <span className="font-medium text-xs text-muted-foreground">{selectedCompany.carbonFootprint.toFixed(1)} tCO2e</span>
                          </div>
                          <div className="flex justify-between items-center border border-border rounded px-3 py-2">
                            <span className="text-muted-foreground text-xs">Water Usage</span>
                            <span className="font-medium text-xs text-muted-foreground">{selectedCompany.waterUsage.toFixed(0)} m³</span>
                          </div>
                          <div className="flex justify-between items-center border border-border rounded px-3 py-2">
                            <span className="text-muted-foreground text-xs">Gender Diversity</span>
                            <span className="font-medium text-xs text-muted-foreground">{selectedCompany.genderDiversityPct.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center border border-border rounded px-3 py-2">
                            <span className="text-muted-foreground text-xs">Board Independence</span>
                            <span className="font-medium text-xs text-muted-foreground">{selectedCompany.boardIndependencePct.toFixed(1)}%</span>
                          </div>
                        </div>

                        {selectedCompany.controversyFlag && (
                          <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded p-2 text-xs text-yellow-400">
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>Active controversy flag — requires enhanced due diligence before inclusion.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* All-company overview table */}
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Portfolio ESG Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-muted-foreground">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-3 text-muted-foreground font-medium">Company</th>
                            <th className="text-right p-3 text-muted-foreground font-medium">E</th>
                            <th className="text-right p-3 text-muted-foreground font-medium">S</th>
                            <th className="text-right p-3 text-muted-foreground font-medium">G</th>
                            <th className="text-right p-3 text-muted-foreground font-medium">Total</th>
                            <th className="text-right p-3 text-muted-foreground font-medium">Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {COMPANIES.map((co) => (
                            <tr key={co.ticker} className="border-b border-border/50 hover:bg-muted/20 cursor-pointer" onClick={() => setSelectedCompany(co)}>
                              <td className="p-3">
                                <p className="font-medium">{co.ticker}</p>
                                <p className="text-muted-foreground">{co.sector}</p>
                              </td>
                              <td className="text-right p-3 text-emerald-400">{co.eScore.toFixed(0)}</td>
                              <td className="text-right p-3 text-primary">{co.sScore.toFixed(0)}</td>
                              <td className="text-right p-3 text-primary">{co.gScore.toFixed(0)}</td>
                              <td className="text-right p-3 font-semibold">{co.total.toFixed(1)}</td>
                              <td className="text-right p-3">
                                <Badge className={`text-xs text-muted-foreground border ${ratingBadgeColor(co.rating)}`}>{co.rating}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB 2: SCREENING ──────────────────────────────────────────────── */}
          <TabsContent value="screening" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Controls */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Filter className="w-4 h-4 text-primary" />
                      Negative Screening
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">Exclude companies with material exposure to:</p>
                    {criteria.filter((c) => c.category === "negative").map((c) => (
                      <div key={c.id} className="flex items-center justify-between">
                        <span className="text-sm">{c.label}</span>
                        <Button
                          size="sm"
                          variant={c.enabled ? "destructive" : "outline"}
                          className="h-6 text-xs text-muted-foreground px-2"
                          onClick={() => toggleCriteria(c.id)}
                        >
                          {c.enabled ? "Excluded" : "Include"}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Positive Screening
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">Prefer companies active in:</p>
                    {criteria.filter((c) => c.category === "positive").map((c) => (
                      <div key={c.id} className="flex items-center justify-between">
                        <span className="text-sm">{c.label}</span>
                        <Button
                          size="sm"
                          variant={c.enabled ? "default" : "outline"}
                          className="h-6 text-xs text-muted-foreground px-2"
                          onClick={() => toggleCriteria(c.id)}
                        >
                          {c.enabled ? "Active" : "Off"}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      Best-in-Class Filter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">Minimum ESG score threshold</p>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={scoreThreshold}
                      onChange={(e) => setScoreThreshold(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span className="font-medium text-foreground">{scoreThreshold}</span>
                      <span>100</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      Screening Results
                      <Badge variant="outline" className="ml-auto">{filteredCompanies.length} / {COMPANIES.length} pass</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {COMPANIES.map((co) => {
                      const passes = filteredCompanies.some((f) => f.ticker === co.ticker);
                      return (
                        <motion.div key={co.ticker} layout className={`flex items-center justify-between p-3 rounded-lg border ${passes ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                          <div className="flex items-center gap-3">
                            {passes ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                            <div>
                              <p className="font-medium text-sm">{co.ticker} — {co.name}</p>
                              <p className="text-xs text-muted-foreground">{co.sector} · ESG {co.total.toFixed(1)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs text-muted-foreground border ${ratingBadgeColor(co.rating)}`}>{co.rating}</Badge>
                            {co.controversyFlag && <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />}
                            <Badge variant="outline" className={`text-xs ${passes ? "border-emerald-500/30 text-emerald-400" : "border-red-500/30 text-red-400"}`}>
                              {passes ? "PASS" : "FAIL"}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Exclusion List Reference</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { label: "Tobacco", desc: "Producers with >5% revenue from tobacco manufacturing.", icon: XCircle, color: "text-red-400" },
                        { label: "Controversial Weapons", desc: "Cluster munitions, anti-personnel mines, biological and chemical weapons.", icon: XCircle, color: "text-red-400" },
                        { label: "Thermal Coal", desc: "Companies deriving >10% revenue from thermal coal extraction or power.", icon: XCircle, color: "text-orange-400" },
                      ].map((item) => (
                        <div key={item.label} className="p-3 rounded-lg bg-muted/30 border border-border">
                          <div className="flex items-center gap-2 mb-1">
                            <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                            <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB 3: IMPACT ─────────────────────────────────────────────────── */}
          <TabsContent value="impact" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Carbon */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wind className="w-4 h-4 text-primary" />
                    Carbon Footprint (tCO2e / $M revenue)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChartSVG
                    data={IMPACT_DATA.map((d) => ({ label: d.company, value: d.carbon }))}
                    label="Scope 1 + 2 Emissions Intensity"
                    color="hsl(210 100% 56%)"
                    unit="tCO2e"
                  />
                  <div className="mt-3 space-y-2">
                    {IMPACT_DATA.map((d) => (
                      <div key={d.company} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-10">{d.company}</span>
                        <HorizontalBar value={d.carbon} max={200} color="bg-primary" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Water */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-muted-foreground" />
                    Water Usage (m³ / $M revenue)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChartSVG
                    data={IMPACT_DATA.map((d) => ({ label: d.company, value: d.water }))}
                    label="Water Withdrawal Intensity"
                    color="hsl(185 100% 45%)"
                    unit="m³"
                  />
                  <div className="mt-3 space-y-2">
                    {IMPACT_DATA.map((d) => (
                      <div key={d.company} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-10">{d.company}</span>
                        <HorizontalBar value={d.water} max={600} color="bg-cyan-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gender diversity */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Gender Diversity (% women in workforce)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChartSVG
                    data={IMPACT_DATA.map((d) => ({ label: d.company, value: d.genderDiv }))}
                    label="% Female Employees"
                    color="hsl(270 60% 60%)"
                    unit="%"
                  />
                  <div className="mt-3 space-y-2">
                    {IMPACT_DATA.map((d) => (
                      <div key={d.company} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-10">{d.company}</span>
                        <HorizontalBar value={d.genderDiv} max={100} color="bg-primary" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Board independence */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-400" />
                    Board Independence (%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChartSVG
                    data={IMPACT_DATA.map((d) => ({ label: d.company, value: d.boardInd }))}
                    label="% Independent Board Members"
                    color="hsl(30 100% 56%)"
                    unit="%"
                  />
                  <div className="mt-3 space-y-2">
                    {IMPACT_DATA.map((d) => (
                      <div key={d.company} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-10">{d.company}</span>
                        <HorizontalBar value={d.boardInd} max={100} color="bg-orange-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Renewable energy + supplier audit */}
              <Card className="border-border md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    Renewable Energy &amp; Supply Chain Audit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Renewable Energy Share (%)</p>
                      <div className="space-y-2">
                        {IMPACT_DATA.map((d) => (
                          <div key={d.company} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-10">{d.company}</span>
                            <HorizontalBar value={d.renewableEnergy} max={100} color="bg-emerald-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Supplier ESG Audit Coverage (%)</p>
                      <div className="space-y-2">
                        {IMPACT_DATA.map((d) => (
                          <div key={d.company} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-10">{d.company}</span>
                            <HorizontalBar value={d.supplierAudit} max={100} color="bg-teal-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB 4: FRAMEWORKS ─────────────────────────────────────────────── */}
          <TabsContent value="frameworks" className="space-y-4 mt-4">
            {/* TCFD */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  TCFD — Task Force on Climate-Related Financial Disclosures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  The TCFD framework recommends disclosures across four interconnected pillars, helping investors understand climate-related risks and opportunities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {tcfdPillars.map((pillar) => (
                    <div key={pillar.title} className="p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <pillar.icon className="w-4 h-4 text-primary" />
                        <p className="font-medium text-sm">{pillar.title}</p>
                      </div>
                      <ul className="space-y-1">
                        {pillar.items.map((item) => (
                          <li key={item} className="flex items-start gap-1.5">
                            <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SFDR */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-400" />
                  SFDR — Sustainable Finance Disclosure Regulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  EU regulation requiring financial market participants to classify and disclose how sustainability risks and factors are integrated.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {sfdArticles.map((art) => (
                    <div key={art.id} className={`p-4 rounded-lg bg-muted/20 border ${art.border}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-xs text-muted-foreground border ${art.border} ${art.color}`}>{art.label}</Badge>
                      </div>
                      <p className={`text-sm font-medium ${art.color}`}>{art.id}</p>
                      <p className="text-xs text-muted-foreground mt-1">{art.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-border">
                  <p className="text-xs text-primary flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    Principal Adverse Impacts (PAI) — Article 8 and 9 products must consider 18 mandatory PAI indicators including GHG emissions, biodiversity, water, waste, and social violations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* PRI */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  PRI — Principles for Responsible Investment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  UN-supported network of investors committed to incorporating ESG into investment practice. Check off the principles your portfolio process adheres to.
                </p>
                <div className="space-y-3">
                  {priPrinciples.map((principle, idx) => (
                    <motion.div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${priChecks[idx] ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/10 border-border"}`}
                      onClick={() => togglePri(idx)}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${priChecks[idx] ? "border-emerald-400 bg-emerald-400" : "border-muted-foreground"}`}>
                        {priChecks[idx] && <CheckCircle className="w-3 h-3 text-background" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Principle {idx + 1}</p>
                        <p className="text-sm">{principle}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${(Object.values(priChecks).filter(Boolean).length / priPrinciples.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Object.values(priChecks).filter(Boolean).length} / {priPrinciples.length} adopted
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* UN SDGs */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  UN Sustainable Development Goals — Portfolio Alignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Map portfolio holdings against the 17 UN SDGs. Shaded goals indicate alignment based on sector activity and ESG data.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {UN_SDGS.map((sdg) => (
                    <div
                      key={sdg.id}
                      className={`relative rounded-lg p-2 text-center border transition-all ${sdg.aligned ? "border-transparent opacity-100" : "opacity-30 border-border"}`}
                      style={{ backgroundColor: sdg.aligned ? `${sdg.color}22` : undefined, borderColor: sdg.aligned ? `${sdg.color}55` : undefined }}
                    >
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center mx-auto mb-1 text-foreground text-xs font-bold"
                        style={{ backgroundColor: sdg.color }}
                      >
                        {sdg.id}
                      </div>
                      <p className="text-xs leading-tight" style={{ color: sdg.aligned ? sdg.color : "hsl(var(--muted-foreground))" }}>
                        {sdg.title}
                      </p>
                      {sdg.aligned && (
                        <CheckCircle className="w-3 h-3 absolute top-1 right-1" style={{ color: sdg.color }} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Badge variant="outline" className="text-xs border-teal-500/40 text-emerald-400">
                    {UN_SDGS.filter((s) => s.aligned).length} / 17 SDGs aligned
                  </Badge>
                  <span className="text-xs text-muted-foreground">Based on portfolio sector exposure and ESG activity data</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
