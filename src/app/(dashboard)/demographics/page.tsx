"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Globe,
  Activity,
  AlertTriangle,
  BarChart2,
  Heart,
  DollarSign,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG (seed 732008) ─────────────────────────────────────────────────
let s = 732008;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate noise values at module load time
const _noise = Array.from({ length: 200 }, () => rand());
let _ni = 0;
const noise = () => _noise[_ni++ % _noise.length];

// ── Data Definitions ──────────────────────────────────────────────────────────

interface PyramidCountry {
  name: string;
  flag: string;
  medianAge: number;
  youngDep: number; // 0-14 as % of total
  workingAge: number; // 15-64
  oldDep: number; // 65+
  color: string;
}

const PYRAMID_COUNTRIES: PyramidCountry[] = [
  { name: "United States", flag: "🇺🇸", medianAge: 38.5, youngDep: 18.2, workingAge: 65.1, oldDep: 16.7, color: "#3b82f6" },
  { name: "Japan",         flag: "🇯🇵", medianAge: 48.7, youngDep: 11.9, workingAge: 58.5, oldDep: 29.6, color: "#ef4444" },
  { name: "China",         flag: "🇨🇳", medianAge: 38.4, youngDep: 16.8, workingAge: 68.4, oldDep: 14.8, color: "#f59e0b" },
  { name: "India",         flag: "🇮🇳", medianAge: 28.2, youngDep: 25.4, workingAge: 67.3, oldDep: 7.3,  color: "#22c55e" },
  { name: "Nigeria",       flag: "🇳🇬", medianAge: 17.9, youngDep: 42.8, workingAge: 54.1, oldDep: 3.1,  color: "#a855f7" },
];

interface MedianAgeRow {
  country: string;
  flag: string;
  medianAge: number;
  fertility: number;
  lifeExp: number;
  category: "aging" | "transitioning" | "young";
}

const MEDIAN_AGE_TABLE: MedianAgeRow[] = [
  { country: "Japan",         flag: "🇯🇵", medianAge: 48.7, fertility: 1.2, lifeExp: 84.3, category: "aging" },
  { country: "Germany",       flag: "🇩🇪", medianAge: 45.7, fertility: 1.5, lifeExp: 81.1, category: "aging" },
  { country: "Italy",         flag: "🇮🇹", medianAge: 46.2, fertility: 1.3, lifeExp: 83.4, category: "aging" },
  { country: "South Korea",   flag: "🇰🇷", medianAge: 43.9, fertility: 0.7, lifeExp: 83.7, category: "aging" },
  { country: "United States", flag: "🇺🇸", medianAge: 38.5, fertility: 1.7, lifeExp: 78.7, category: "transitioning" },
  { country: "China",         flag: "🇨🇳", medianAge: 38.4, fertility: 1.1, lifeExp: 78.2, category: "transitioning" },
  { country: "Brazil",        flag: "🇧🇷", medianAge: 33.5, fertility: 1.8, lifeExp: 75.9, category: "transitioning" },
  { country: "Mexico",        flag: "🇲🇽", medianAge: 29.3, fertility: 2.1, lifeExp: 75.1, category: "transitioning" },
  { country: "India",         flag: "🇮🇳", medianAge: 28.2, fertility: 2.0, lifeExp: 70.8, category: "young" },
  { country: "Indonesia",     flag: "🇮🇩", medianAge: 29.7, fertility: 2.3, lifeExp: 71.7, category: "young" },
  { country: "Nigeria",       flag: "🇳🇬", medianAge: 17.9, fertility: 5.3, lifeExp: 55.2, category: "young" },
  { country: "Ethiopia",      flag: "🇪🇹", medianAge: 19.5, fertility: 4.3, lifeExp: 66.2, category: "young" },
];

// ── Aging Trends Data ─────────────────────────────────────────────────────────

interface AgingRegion {
  name: string;
  color: string;
  // old-age dependency ratio (65+ per 100 working-age) by decade: 2000..2060
  ratios: number[];
}

const AGING_REGIONS: AgingRegion[] = [
  { name: "Japan",          color: "#ef4444", ratios: [27, 32, 38, 47, 54, 59, 64] },
  { name: "Europe",         color: "#f59e0b", ratios: [22, 24, 28, 32, 38, 43, 47] },
  { name: "United States",  color: "#3b82f6", ratios: [19, 20, 22, 26, 30, 33, 36] },
  { name: "China",          color: "#a855f7", ratios: [10, 12, 15, 20, 29, 37, 42] },
  { name: "South Asia",     color: "#22c55e", ratios: [8,  9,  10, 12, 16, 21, 26] },
  { name: "Sub-Saharan Afr",color: "#06b6d4", ratios: [6,  6,  7,  8,  9,  11, 14] },
];

const AGING_DECADES = [2000, 2010, 2020, 2030, 2040, 2050, 2060];

// ── Investment Implications Data ──────────────────────────────────────────────

interface SectorImpact {
  sector: string;
  impact: "strong_positive" | "positive" | "neutral" | "negative" | "strong_negative";
  rationale: string;
  examples: string[];
  tailwindBg: string;
  score: number; // -2 to +2
}

const SECTOR_IMPACTS: SectorImpact[] = [
  {
    sector: "Healthcare & Pharma",
    impact: "strong_positive",
    rationale: "Elderly spend 3-5x more on healthcare. Chronic disease management, oncology, and orthopedics see structural demand growth.",
    examples: ["JNJ", "NVO", "UNH", "MDT"],
    tailwindBg: "bg-emerald-500/20 border-emerald-500/40",
    score: 2,
  },
  {
    sector: "Assisted Living / REIT",
    impact: "strong_positive",
    rationale: "Senior housing demand to surge 40% by 2030. Occupancy rates recovering post-COVID with supply constraints.",
    examples: ["VTR", "WELL", "NHI"],
    tailwindBg: "bg-emerald-500/20 border-emerald-500/40",
    score: 2,
  },
  {
    sector: "Financial Services",
    impact: "positive",
    rationale: "Retirement savings, annuities, wealth management see inflows as Boomers decumulate $70T in assets.",
    examples: ["BLK", "BEN", "TROW"],
    tailwindBg: "bg-green-500/20 border-green-500/40",
    score: 1,
  },
  {
    sector: "Pharmaceuticals",
    impact: "positive",
    rationale: "Alzheimer's, osteoporosis, cardiovascular drugs face long structural tailwind from aging demographics.",
    examples: ["PFE", "MRK", "LLY"],
    tailwindBg: "bg-green-500/20 border-green-500/40",
    score: 1,
  },
  {
    sector: "Consumer Staples",
    impact: "neutral",
    rationale: "Older consumers shift spend toward necessities but total consumption growth slows as population ages.",
    examples: ["PG", "KO", "WMT"],
    tailwindBg: "bg-muted-foreground/20 border-muted-foreground/40",
    score: 0,
  },
  {
    sector: "Technology",
    impact: "neutral",
    rationale: "Mixed: elder-care tech (telehealth, wearables) grows; consumer electronics face headwinds as young cohorts shrink.",
    examples: ["AAPL", "GOOGL", "MSFT"],
    tailwindBg: "bg-muted-foreground/20 border-muted-foreground/40",
    score: 0,
  },
  {
    sector: "Fast Food / QSR",
    impact: "negative",
    rationale: "Core 18-34 age cohort shrinks in developed markets. Elderly dine out less frequently on average.",
    examples: ["MCD", "YUM", "QSR"],
    tailwindBg: "bg-red-500/20 border-red-500/40",
    score: -1,
  },
  {
    sector: "Entertainment / Media",
    impact: "negative",
    rationale: "Youth-skewed ad markets contract; gaming, streaming face demographic headwinds in aging DM economies.",
    examples: ["DIS", "PARA", "NFLX"],
    tailwindBg: "bg-red-500/20 border-red-500/40",
    score: -1,
  },
  {
    sector: "Homebuilders",
    impact: "strong_negative",
    rationale: "Household formation collapses as fertility drops. Japan lost 10% of housing demand in a decade; Europe follows.",
    examples: ["DHI", "LEN", "PHM"],
    tailwindBg: "bg-rose-500/20 border-rose-500/40",
    score: -2,
  },
];

// ── Japan Case Study Data ──────────────────────────────────────────────────────

interface JapanDataPoint {
  year: number;
  elderlyPct: number; // 65+ % of population
  nikkei: number;     // Nikkei index level (in thousands)
  gdpGrowth: number;
}

const JAPAN_DATA: JapanDataPoint[] = [
  { year: 1990, elderlyPct: 12.0, nikkei: 38.9, gdpGrowth: 5.6 },
  { year: 1993, elderlyPct: 13.5, nikkei: 17.4, gdpGrowth: 0.2 },
  { year: 1996, elderlyPct: 15.1, nikkei: 19.4, gdpGrowth: 2.6 },
  { year: 1999, elderlyPct: 16.7, nikkei: 18.9, gdpGrowth: -0.3 },
  { year: 2002, elderlyPct: 18.5, nikkei: 9.1,  gdpGrowth: 0.1 },
  { year: 2005, elderlyPct: 20.0, nikkei: 16.1, gdpGrowth: 1.7 },
  { year: 2008, elderlyPct: 21.5, nikkei: 8.9,  gdpGrowth: -0.7 },
  { year: 2011, elderlyPct: 23.1, nikkei: 8.5,  gdpGrowth: -0.1 },
  { year: 2013, elderlyPct: 25.0, nikkei: 16.3, gdpGrowth: 2.0 },
  { year: 2016, elderlyPct: 27.1, nikkei: 19.1, gdpGrowth: 0.8 },
  { year: 2019, elderlyPct: 28.4, nikkei: 23.7, gdpGrowth: -0.4 },
  { year: 2021, elderlyPct: 28.9, nikkei: 28.8, gdpGrowth: 2.1 },
  { year: 2023, elderlyPct: 29.6, nikkei: 33.5, gdpGrowth: 1.9 },
  { year: 2025, elderlyPct: 30.2, nikkei: 38.2, gdpGrowth: 0.9 },
];

// ── Emerging Market Dividend Data ─────────────────────────────────────────────

interface EmMarketData {
  name: string;
  flag: string;
  color: string;
  // Working-age population growth (%) by year: 2020..2060 every 5 yrs
  waGrowth: number[];
}

const EM_MARKETS: EmMarketData[] = [
  { name: "Nigeria",     flag: "🇳🇬", color: "#a855f7", waGrowth: [3.1, 3.3, 3.2, 3.0, 2.8, 2.5, 2.2, 1.9, 1.7] },
  { name: "India",       flag: "🇮🇳", color: "#22c55e", waGrowth: [1.6, 1.5, 1.3, 1.1, 0.8, 0.5, 0.2, -0.1, -0.3] },
  { name: "Indonesia",   flag: "🇮🇩", color: "#f59e0b", waGrowth: [1.4, 1.2, 1.1, 0.9, 0.6, 0.3, 0.1, -0.2, -0.4] },
  { name: "Vietnam",     flag: "🇻🇳", color: "#06b6d4", waGrowth: [1.2, 1.1, 0.9, 0.6, 0.3, 0.0, -0.3, -0.6, -0.8] },
  { name: "Philippines", flag: "🇵🇭", color: "#ec4899", waGrowth: [1.9, 1.8, 1.6, 1.4, 1.1, 0.8, 0.5, 0.2, 0.0] },
  { name: "Japan",       flag: "🇯🇵", color: "#ef4444", waGrowth: [-0.8,-0.9,-1.0,-1.1,-1.2,-1.1,-1.0,-0.9,-0.8] },
  { name: "China",       flag: "🇨🇳", color: "#f97316", waGrowth: [-0.2,-0.5,-0.7,-0.9,-1.0,-1.1,-1.0,-0.9,-0.8] },
];

const EM_YEARS = [2020, 2025, 2030, 2035, 2040, 2045, 2050, 2055, 2060];

// ── Helper: Polyline path from data ──────────────────────────────────────────

function makePath(
  data: number[],
  width: number,
  height: number,
  minVal: number,
  maxVal: number,
): string {
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - minVal) / (maxVal - minVal)) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InsightCard({ icon: Icon, title, body, accent }: {
  icon: React.ElementType;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className={cn("rounded-lg border p-4 flex gap-3", accent)}>
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold mb-1">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ── Tab 1: Global Demographics ────────────────────────────────────────────────

function PopulationPyramid({ country }: { country: PyramidCountry }) {
  const total = country.youngDep + country.workingAge + country.oldDep;
  const youngPct  = (country.youngDep  / total) * 100;
  const workPct   = (country.workingAge / total) * 100;
  const oldPct    = (country.oldDep    / total) * 100;

  const barWidth = 160;
  const segH = 28;
  const gap = 4;
  const chartH = segH * 3 + gap * 2;

  const bars: { label: string; pct: number; color: string }[] = [
    { label: "65+",   pct: oldPct,   color: "#ef4444" },
    { label: "15–64", pct: workPct,  color: country.color },
    { label: "0–14",  pct: youngPct, color: "#f59e0b" },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-semibold">{country.flag} {country.name}</div>
      <svg width={barWidth + 56} height={chartH} className="overflow-visible">
        {bars.map((b, i) => {
          const y = i * (segH + gap);
          const w = (b.pct / 100) * barWidth;
          return (
            <g key={b.label}>
              <text x={0} y={y + segH / 2 + 5} fontSize={10} fill="#a1a1aa" textAnchor="start">{b.label}</text>
              <rect x={36} y={y} width={w} height={segH} rx={3} fill={b.color} opacity={0.85} />
              <text x={36 + w + 4} y={y + segH / 2 + 5} fontSize={10} fill="#d4d4d8">{b.pct.toFixed(1)}%</text>
            </g>
          );
        })}
      </svg>
      <div className="text-xs text-muted-foreground">Median age: <span className="text-muted-foreground font-medium">{country.medianAge}</span></div>
    </div>
  );
}

function GlobalDemographicsTab() {
  const [selectedCountry, setSelectedCountry] = useState<string>("Japan");
  const country = PYRAMID_COUNTRIES.find((c) => c.name === selectedCountry) ?? PYRAMID_COUNTRIES[0];

  // Demographic dividend explainer bar chart
  const dividendData = [
    { stage: "Pre-dividend", young: 45, working: 52, old: 3, label: "High birth rate" },
    { stage: "Early dividend", young: 35, working: 60, old: 5, label: "Fertility falling" },
    { stage: "Peak dividend", young: 22, working: 67, old: 11, label: "Max workers/dependent" },
    { stage: "Late dividend", young: 16, working: 62, old: 22, label: "Aging accelerates" },
    { stage: "Post-dividend", young: 12, working: 59, old: 29, label: "Pension crisis risk" },
  ];

  const catWidth = 96;
  const dChartW = dividendData.length * (catWidth + 12);
  const dChartH = 140;

  return (
    <div className="space-y-6">
      {/* Population pyramids */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Population Age Structure by Country
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap mb-4">
            {PYRAMID_COUNTRIES.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedCountry(c.name)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium border transition-colors",
                  selectedCountry === c.name
                    ? "bg-primary border-primary text-white"
                    : "bg-muted border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {c.flag} {c.name}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={country.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col md:flex-row gap-8 items-center"
            >
              <PopulationPyramid country={country} />
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Youth (0–14)", value: `${country.youngDep.toFixed(1)}%`, color: "text-amber-400" },
                    { label: "Working Age", value: `${country.workingAge.toFixed(1)}%`, color: "text-primary" },
                    { label: "Elderly (65+)", value: `${country.oldDep.toFixed(1)}%`, color: "text-red-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-muted rounded-lg p-3 text-center">
                      <div className={cn("text-xl font-bold", stat.color)}>{stat.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-2">Support Ratio (workers per dependent)</div>
                  <div className="text-2xl font-bold text-white">
                    {(country.workingAge / (country.youngDep + country.oldDep)).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {country.workingAge / (country.youngDep + country.oldDep) > 2
                      ? "Favorable — economic tailwind"
                      : country.workingAge / (country.youngDep + country.oldDep) > 1.5
                      ? "Moderate — transitioning economy"
                      : "Stressed — pension/fiscal pressure"}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Demographic Dividend */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            The Demographic Dividend Concept
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            When fertility falls and more adults enter the workforce relative to dependents, economies enjoy a
            &ldquo;demographic dividend&rdquo; — higher savings rates, faster capital formation, and GDP acceleration.
            This window typically lasts 20–30 years before aging reverses the advantage.
          </p>
          <div className="overflow-x-auto">
            <svg width={dChartW} height={dChartH + 60} className="overflow-visible">
              {dividendData.map((d, i) => {
                const x = i * (catWidth + 12);
                const sections = [
                  { pct: d.young, color: "#f59e0b" },
                  { pct: d.working, color: "#3b82f6" },
                  { pct: d.old, color: "#ef4444" },
                ];
                let yOffset = 0;
                return (
                  <g key={d.stage}>
                    {sections.map((sec, j) => {
                      const barH = (sec.pct / 100) * dChartH;
                      const y = dChartH - yOffset - barH;
                      yOffset += barH;
                      return (
                        <rect
                          key={j}
                          x={x}
                          y={y}
                          width={catWidth}
                          height={barH}
                          fill={sec.color}
                          opacity={0.8}
                        />
                      );
                    })}
                    <text x={x + catWidth / 2} y={dChartH + 16} fontSize={9} fill="#a1a1aa" textAnchor="middle">{d.stage}</text>
                    <text x={x + catWidth / 2} y={dChartH + 28} fontSize={8} fill="#71717a" textAnchor="middle">{d.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex gap-4 mt-2">
            {[
              { color: "bg-amber-500", label: "Youth 0–14" },
              { color: "bg-primary",  label: "Working 15–64" },
              { color: "bg-red-500",   label: "Elderly 65+" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={cn("w-2.5 h-2.5 rounded-sm", l.color)} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Median Age Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Median Age by Country
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left py-2 pr-4">Country</th>
                  <th className="text-right py-2 pr-4">Median Age</th>
                  <th className="text-right py-2 pr-4">Fertility</th>
                  <th className="text-right py-2 pr-4">Life Exp.</th>
                  <th className="text-right py-2">Category</th>
                </tr>
              </thead>
              <tbody>
                {MEDIAN_AGE_TABLE.map((row) => (
                  <tr key={row.country} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2 pr-4">
                      <span className="mr-1.5">{row.flag}</span>
                      <span className="text-foreground">{row.country}</span>
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-muted rounded h-1.5">
                          <div
                            className="h-1.5 rounded bg-primary"
                            style={{ width: `${(row.medianAge / 55) * 100}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground font-medium w-8 text-right">{row.medianAge}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-right text-muted-foreground">{row.fertility.toFixed(1)}</td>
                    <td className="py-2 pr-4 text-right text-muted-foreground">{row.lifeExp}</td>
                    <td className="py-2 text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          row.category === "aging" && "border-red-500/50 text-red-400",
                          row.category === "transitioning" && "border-amber-500/50 text-amber-400",
                          row.category === "young" && "border-green-500/50 text-green-400",
                        )}
                      >
                        {row.category}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 2: Aging Trends ───────────────────────────────────────────────────────

function AgingTrendsTab() {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const chartW = 560;
  const chartH = 240;
  const padL = 44;
  const padB = 36;
  const padR = 12;
  const padT = 12;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const maxRatio = 70;
  const minRatio = 0;
  const years = AGING_DECADES;

  function regionPath(r: AgingRegion) {
    return r.ratios
      .map((v, i) => {
        const x = padL + (i / (years.length - 1)) * innerW;
        const y = padT + innerH - ((v - minRatio) / (maxRatio - minRatio)) * innerH;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  const yTicks = [0, 10, 20, 30, 40, 50, 60, 70];

  // Healthcare cost projection data
  const hcData = [
    { year: 2020, us: 18.8, jp: 11.1, eu: 9.4 },
    { year: 2025, us: 20.1, jp: 12.0, eu: 10.1 },
    { year: 2030, us: 22.0, jp: 13.5, eu: 11.2 },
    { year: 2035, us: 24.1, jp: 15.0, eu: 12.3 },
    { year: 2040, us: 26.5, jp: 16.8, eu: 13.6 },
  ];

  return (
    <div className="space-y-6">
      {/* Old-age dependency ratio chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            Old-Age Dependency Ratio Projections (65+ per 100 working-age)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={chartW} height={chartH} className="overflow-visible">
              {/* Grid lines */}
              {yTicks.map((t) => {
                const y = padT + innerH - ((t - minRatio) / (maxRatio - minRatio)) * innerH;
                return (
                  <g key={t}>
                    <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#27272a" strokeWidth={1} />
                    <text x={padL - 6} y={y + 4} fontSize={9} fill="#71717a" textAnchor="end">{t}</text>
                  </g>
                );
              })}
              {/* Year labels */}
              {years.map((yr, i) => {
                const x = padL + (i / (years.length - 1)) * innerW;
                return (
                  <text key={yr} x={x} y={chartH - 4} fontSize={9} fill="#71717a" textAnchor="middle">{yr}</text>
                );
              })}
              {/* Region lines */}
              {AGING_REGIONS.map((r) => (
                <g key={r.name}>
                  <path
                    d={regionPath(r)}
                    fill="none"
                    stroke={r.color}
                    strokeWidth={hoveredRegion === r.name ? 3 : 1.5}
                    opacity={hoveredRegion && hoveredRegion !== r.name ? 0.3 : 1}
                    strokeDasharray={r.ratios[0] < 10 ? "4 2" : undefined}
                  />
                  {/* End label */}
                  {(() => {
                    const x = padL + innerW;
                    const lastVal = r.ratios[r.ratios.length - 1];
                    const y = padT + innerH - ((lastVal - minRatio) / (maxRatio - minRatio)) * innerH;
                    return (
                      <text
                        key={`lbl-${r.name}`}
                        x={x + 4}
                        y={y + 4}
                        fontSize={8}
                        fill={r.color}
                        opacity={hoveredRegion && hoveredRegion !== r.name ? 0.3 : 1}
                      >
                        {r.name.slice(0, 6)}
                      </text>
                    );
                  })()}
                </g>
              ))}
              {/* 2026 dashed line */}
              {(() => {
                const x = padL + ((2026 - 2000) / 60) * innerW;
                return (
                  <line key="now" x1={x} y1={padT} x2={x} y2={padT + innerH} stroke="#52525b" strokeWidth={1} strokeDasharray="4 2" />
                );
              })()}
            </svg>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {AGING_REGIONS.map((r) => (
              <button
                key={r.name}
                onMouseEnter={() => setHoveredRegion(r.name)}
                onMouseLeave={() => setHoveredRegion(null)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-6 h-0.5 rounded" style={{ backgroundColor: r.color }} />
                {r.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Dashed vertical = 2026 (now). Projections from UN World Population Prospects.
          </p>
        </CardContent>
      </Card>

      {/* Healthcare costs */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            Healthcare Spending as % of GDP — Aging Pressure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={420} height={180} className="overflow-visible">
              {[9, 12, 15, 18, 21, 24, 27].map((t) => {
                const y = 16 + 140 - ((t - 9) / 18) * 140;
                return (
                  <g key={t}>
                    <line x1={44} y1={y} x2={410} y2={y} stroke="#27272a" strokeWidth={1} />
                    <text x={40} y={y + 4} fontSize={9} fill="#71717a" textAnchor="end">{t}%</text>
                  </g>
                );
              })}
              {hcData.map((d, i) => {
                const x = 44 + (i / (hcData.length - 1)) * 366;
                return (
                  <text key={d.year} x={x} y={172} fontSize={9} fill="#71717a" textAnchor="middle">{d.year}</text>
                );
              })}
              {(["us", "jp", "eu"] as const).map((key, ki) => {
                const colors = ["#3b82f6", "#ef4444", "#f59e0b"];
                const names = ["US", "Japan", "Europe"];
                const path = hcData
                  .map((d, i) => {
                    const x = 44 + (i / (hcData.length - 1)) * 366;
                    const v = d[key];
                    const y = 16 + 140 - ((v - 9) / 18) * 140;
                    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(" ");
                const lastD = hcData[hcData.length - 1];
                const lastV = lastD[key];
                const lastY = 16 + 140 - ((lastV - 9) / 18) * 140;
                return (
                  <g key={key}>
                    <path d={path} fill="none" stroke={colors[ki]} strokeWidth={2} />
                    <text x={410 + 4} y={lastY + 4} fontSize={8} fill={colors[ki]}>{names[ki]}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            The US already spends 20%+ of GDP on healthcare. Japan and Europe face similar trajectories. By 2040,
            the fiscal gap between healthcare obligations and tax revenues may reach $50T+ globally.
          </p>
        </CardContent>
      </Card>

      {/* Pension crisis */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Pension Funding Crisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {[
              { country: "🇺🇸 United States", unfunded: "$22T", status: "Partially funded", color: "text-amber-400" },
              { country: "🇯🇵 Japan",          unfunded: "$7.7T", status: "Aging pressure",  color: "text-red-400" },
              { country: "🇩🇪 Germany",        unfunded: "$4.1T", status: "Pay-as-you-go",   color: "text-orange-400" },
            ].map((p) => (
              <div key={p.country} className="bg-muted rounded-lg p-4">
                <div className="text-sm font-medium mb-1">{p.country}</div>
                <div className={cn("text-2xl font-bold", p.color)}>{p.unfunded}</div>
                <div className="text-xs text-muted-foreground mt-1">Unfunded liability — {p.status}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InsightCard
              icon={AlertTriangle}
              title="Workers-per-Retiree Collapse"
              body="US had 16 workers per retiree in 1950; today 2.7. By 2035: 2.3. Each worker bears an increasingly unsustainable pension burden."
              accent="bg-amber-500/10 border border-amber-500/30 text-amber-300"
            />
            <InsightCard
              icon={TrendingDown}
              title="Sovereign Bond Implication"
              body="Countries with large unfunded pension liabilities face long-term fiscal pressure, potentially leading to monetization (inflation) or benefit cuts. Watch spreads carefully."
              accent="bg-red-500/10 border border-red-500/30 text-red-300"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: Investment Implications ────────────────────────────────────────────

const IMPACT_LABEL: Record<string, string> = {
  strong_positive: "Strong Tailwind",
  positive: "Tailwind",
  neutral: "Neutral",
  negative: "Headwind",
  strong_negative: "Strong Headwind",
};

const IMPACT_DOT: Record<string, string> = {
  strong_positive: "bg-emerald-500",
  positive: "bg-green-500",
  neutral: "bg-muted-foreground",
  negative: "bg-red-400",
  strong_negative: "bg-rose-600",
};

function InvestmentImplicationsTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedSector = SECTOR_IMPACTS.find((s) => s.sector === selected);

  // SVG sector impact matrix
  const matrixW = 560;
  const matrixH = 180;
  const colW = matrixW / SECTOR_IMPACTS.length;

  return (
    <div className="space-y-6">
      {/* Visual impact matrix */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Sector Impact Matrix — Demographic Aging
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Click a sector bar to see details</p>
          <div className="overflow-x-auto">
            <svg width={matrixW} height={matrixH + 60} className="overflow-visible">
              {/* Zero line */}
              <line x1={0} y1={matrixH / 2} x2={matrixW} y2={matrixH / 2} stroke="#3f3f46" strokeWidth={1} />
              {/* Y axis labels */}
              {[-2, -1, 0, 1, 2].map((v) => {
                const y = matrixH / 2 - (v / 2) * (matrixH / 2 - 10);
                const labels = ["Strong −", "−", "0", "+", "Strong +"];
                const idx = v + 2;
                return (
                  <text key={v} x={-4} y={y + 4} fontSize={8} fill="#52525b" textAnchor="end">{labels[idx]}</text>
                );
              })}
              {SECTOR_IMPACTS.map((s, i) => {
                const x = i * colW + colW * 0.1;
                const barW = colW * 0.8;
                const barH = Math.abs((s.score / 2) * (matrixH / 2 - 10));
                const isPos = s.score >= 0;
                const y = isPos
                  ? matrixH / 2 - barH
                  : matrixH / 2;
                const color =
                  s.score >= 2 ? "#10b981" :
                  s.score === 1 ? "#22c55e" :
                  s.score === 0 ? "#52525b" :
                  s.score === -1 ? "#f87171" : "#e11d48";
                const isSelected = selected === s.sector;
                return (
                  <g key={s.sector} style={{ cursor: "pointer" }} onClick={() => setSelected(selected === s.sector ? null : s.sector)}>
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={barH || 2}
                      rx={2}
                      fill={color}
                      opacity={isSelected ? 1 : 0.7}
                      stroke={isSelected ? "#ffffff" : "none"}
                      strokeWidth={isSelected ? 1.5 : 0}
                    />
                    <text
                      x={x + barW / 2}
                      y={matrixH + 16}
                      fontSize={7.5}
                      fill={isSelected ? "#ffffff" : "#a1a1aa"}
                      textAnchor="middle"
                    >
                      {s.sector.split(" ")[0]}
                    </text>
                    <text
                      x={x + barW / 2}
                      y={matrixH + 27}
                      fontSize={7}
                      fill="#71717a"
                      textAnchor="middle"
                    >
                      {s.sector.split(" ").slice(1, 2).join(" ")}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Selected sector detail */}
          <AnimatePresence>
            {selectedSector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={cn("rounded-lg border p-4 mt-4", selectedSector.tailwindBg)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{selectedSector.sector}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-2 h-2 rounded-full", IMPACT_DOT[selectedSector.impact])} />
                      <span className="text-xs">{IMPACT_LABEL[selectedSector.impact]}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{selectedSector.rationale}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedSector.examples.map((ex) => (
                      <span key={ex} className="text-xs px-2 py-0.5 bg-muted rounded font-mono">{ex}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Sector cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTOR_IMPACTS.map((s) => (
          <motion.div
            key={s.sector}
            whileHover={{ scale: 1.01 }}
            className={cn("rounded-lg border p-4 cursor-pointer", s.tailwindBg)}
            onClick={() => setSelected(selected === s.sector ? null : s.sector)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">{s.sector}</span>
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", IMPACT_DOT[s.impact])} />
                <span className="text-xs">{IMPACT_LABEL[s.impact]}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.rationale}</p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {s.examples.map((ex) => (
                <span key={ex} className="text-xs px-1.5 py-0.5 bg-card/70 rounded font-mono">{ex}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 4: Japan Case Study ───────────────────────────────────────────────────

function JapanCaseStudyTab() {
  const chartW = 560;
  const chartH = 220;
  const padL = 48;
  const padR = 56;
  const padT = 16;
  const padB = 36;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const years = JAPAN_DATA.map((d) => d.year);
  const minYear = years[0];
  const maxYear = years[years.length - 1];

  const elderlyVals = JAPAN_DATA.map((d) => d.elderlyPct);
  const nikkeiVals  = JAPAN_DATA.map((d) => d.nikkei);

  const minElderly = 10; const maxElderly = 35;
  const minNikkei  = 0;  const maxNikkei  = 42;

  function xPos(year: number) {
    return padL + ((year - minYear) / (maxYear - minYear)) * innerW;
  }
  function yElderly(v: number) {
    return padT + innerH - ((v - minElderly) / (maxElderly - minElderly)) * innerH;
  }
  function yNikkei(v: number) {
    return padT + innerH - ((v - minNikkei) / (maxNikkei - minNikkei)) * innerH;
  }

  const elderlyPath = JAPAN_DATA
    .map((d, i) => `${i === 0 ? "M" : "L"}${xPos(d.year).toFixed(1)},${yElderly(d.elderlyPct).toFixed(1)}`)
    .join(" ");
  const nikkeiPath = JAPAN_DATA
    .map((d, i) => `${i === 0 ? "M" : "L"}${xPos(d.year).toFixed(1)},${yNikkei(d.nikkei).toFixed(1)}`)
    .join(" ");

  const events = [
    { year: 1990, label: "Bubble peak", color: "#ef4444" },
    { year: 2013, label: "Abenomics",   color: "#22c55e" },
    { year: 2016, label: "YCC starts",  color: "#3b82f6" },
    { year: 2023, label: "YCC ends",    color: "#a855f7" },
  ];

  return (
    <div className="space-y-6">
      {/* Correlation chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-red-400" />
            Japan: Elderly Population % vs. Nikkei Index (1990–2025)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={chartW} height={chartH} className="overflow-visible">
              {/* Y-axis left (elderly %) */}
              {[10, 15, 20, 25, 30, 35].map((t) => {
                const y = yElderly(t);
                return (
                  <g key={t}>
                    <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#27272a" strokeWidth={1} />
                    <text x={padL - 6} y={y + 4} fontSize={9} fill="#ef4444" textAnchor="end">{t}%</text>
                  </g>
                );
              })}
              {/* Y-axis right (Nikkei) */}
              {[0, 10, 20, 30, 40].map((t) => {
                const y = yNikkei(t);
                return (
                  <text key={t} x={chartW - padR + 6} y={y + 4} fontSize={9} fill="#3b82f6" textAnchor="start">{t}k</text>
                );
              })}
              {/* Event lines */}
              {events.map((ev) => {
                const x = xPos(ev.year);
                return (
                  <g key={ev.year}>
                    <line x1={x} y1={padT} x2={x} y2={padT + innerH} stroke={ev.color} strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />
                    <text x={x} y={padT - 4} fontSize={8} fill={ev.color} textAnchor="middle">{ev.label}</text>
                  </g>
                );
              })}
              {/* Year labels */}
              {[1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025].map((yr) => {
                const x = xPos(yr);
                return (
                  <text key={yr} x={x} y={chartH - 4} fontSize={9} fill="#71717a" textAnchor="middle">{yr}</text>
                );
              })}
              {/* Lines */}
              <path d={elderlyPath} fill="none" stroke="#ef4444" strokeWidth={2} />
              <path d={nikkeiPath} fill="none" stroke="#3b82f6" strokeWidth={2} />
            </svg>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-red-500 rounded" />
              <span className="text-xs text-muted-foreground">Elderly % (left axis)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-primary rounded" />
              <span className="text-xs text-muted-foreground">Nikkei (right axis)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key lessons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "Lost Decades (1990–2012)",
            body: "Japan's Nikkei fell 80% from its 1989 peak. Demographics were not the only cause, but an aging society suppressed consumer spending, real estate, and long-term growth expectations for 20+ years.",
            icon: TrendingDown,
            accent: "bg-red-500/10 border border-red-500/30 text-red-300",
          },
          {
            title: "Abenomics (2013–2019)",
            body: "PM Abe's 3 arrows — fiscal stimulus, monetary easing, structural reforms — reflated the Nikkei from 8,500 to 24,000. Showed that policy intervention CAN counteract demographic drag, at least temporarily.",
            icon: TrendingUp,
            accent: "bg-green-500/10 border border-green-500/30 text-green-300",
          },
          {
            title: "BOJ Yield Curve Control",
            body: "BOJ capped 10-year JGB yields at 0% (then 0.5%, 1%) to prevent deflation. The world's most aggressive monetary experiment — and a cautionary tale for other aging economies approaching similar conditions.",
            icon: Activity,
            accent: "bg-primary/10 border border-border text-primary",
          },
          {
            title: "Investment Lesson",
            body: "Despite terrible demographics, the Nikkei hit all-time highs in 2024. Demographics create secular headwinds but policy, corporate governance reform, and foreign flows can still drive equity returns. Invest in the policy response, not just the trend.",
            icon: DollarSign,
            accent: "bg-primary/10 border border-border text-primary",
          },
        ].map((item) => (
          <InsightCard key={item.title} icon={item.icon} title={item.title} body={item.body} accent={item.accent} />
        ))}
      </div>

      {/* Japan demographic snapshot */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            Japan at a Glance — 2026
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Median Age",        value: "48.7 yrs",  sub: "World's oldest major nation" },
              { label: "Elderly %",          value: "30.2%",    sub: "65+ share of population" },
              { label: "Fertility Rate",     value: "1.20",     sub: "Far below replacement (2.1)" },
              { label: "Population Decline", value: "−600k/yr", sub: "Net loss since 2010 peak" },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 5: Emerging Market Dividend ───────────────────────────────────────────

function EmergingMarketTab() {
  const [focusMarket, setFocusMarket] = useState<string | null>(null);

  const chartW = 560;
  const chartH = 220;
  const padL = 44;
  const padR = 80;
  const padT = 16;
  const padB = 32;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const minY = -2; const maxY = 4;

  function xPos(i: number) {
    return padL + (i / (EM_YEARS.length - 1)) * innerW;
  }
  function yPos(v: number) {
    return padT + innerH - ((v - minY) / (maxY - minY)) * innerH;
  }

  // Compute working-age population levels (index to 100 in 2020)
  const waLevels = useMemo(() => {
    return EM_MARKETS.map((m) => {
      let level = 100;
      return m.waGrowth.map((g) => {
        const val = level;
        level *= (1 + g / 100);
        return val;
      });
    });
  }, []);

  const maxLevel = Math.max(...waLevels.flat());
  const minLevel = Math.min(...waLevels.flat());

  function levelPath(levels: number[]) {
    return levels
      .map((v, i) => {
        const x = xPos(i);
        const y = padT + innerH - ((v - minLevel) / (maxLevel - minLevel)) * innerH;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  return (
    <div className="space-y-6">
      {/* Working-age population growth rate chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Working-Age Population Growth Rate (% per year) — Projected 2020–2060
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={chartW} height={chartH} className="overflow-visible">
              {/* Grid */}
              {[-2, -1, 0, 1, 2, 3, 4].map((t) => {
                const y = yPos(t);
                return (
                  <g key={t}>
                    <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke={t === 0 ? "#52525b" : "#27272a"} strokeWidth={t === 0 ? 1.5 : 1} />
                    <text x={padL - 6} y={y + 4} fontSize={9} fill="#71717a" textAnchor="end">{t}%</text>
                  </g>
                );
              })}
              {/* Year labels */}
              {EM_YEARS.map((yr, i) => (
                <text key={yr} x={xPos(i)} y={chartH - 4} fontSize={9} fill="#71717a" textAnchor="middle">{yr}</text>
              ))}
              {/* Lines */}
              {EM_MARKETS.map((m) => {
                const path = m.waGrowth
                  .map((v, i) => `${i === 0 ? "M" : "L"}${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`)
                  .join(" ");
                const lastV = m.waGrowth[m.waGrowth.length - 1];
                const isFocused = focusMarket === m.name;
                const isBlurred = focusMarket && !isFocused;
                return (
                  <g key={m.name}>
                    <path
                      d={path}
                      fill="none"
                      stroke={m.color}
                      strokeWidth={isFocused ? 2.5 : 1.5}
                      opacity={isBlurred ? 0.2 : 1}
                    />
                    <text
                      x={xPos(EM_YEARS.length - 1) + 6}
                      y={yPos(lastV) + 4}
                      fontSize={8}
                      fill={m.color}
                      opacity={isBlurred ? 0.2 : 1}
                    >
                      {m.flag} {m.name.slice(0, 5)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {EM_MARKETS.map((m) => (
              <button
                key={m.name}
                onMouseEnter={() => setFocusMarket(m.name)}
                onMouseLeave={() => setFocusMarket(null)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-4 h-0.5 rounded" style={{ backgroundColor: m.color }} />
                {m.flag} {m.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Working-age index level chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Working-Age Population Index (2020 = 100)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={chartW} height={chartH} className="overflow-visible">
              {[60, 80, 100, 120, 140, 160, 180].map((t) => {
                const y = padT + innerH - ((t - minLevel) / (maxLevel - minLevel)) * innerH;
                return (
                  <g key={t}>
                    <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke={t === 100 ? "#52525b" : "#27272a"} strokeWidth={t === 100 ? 1.5 : 1} />
                    <text x={padL - 6} y={y + 4} fontSize={9} fill="#71717a" textAnchor="end">{t}</text>
                  </g>
                );
              })}
              {EM_YEARS.map((yr, i) => (
                <text key={yr} x={xPos(i)} y={chartH - 4} fontSize={9} fill="#71717a" textAnchor="middle">{yr}</text>
              ))}
              {EM_MARKETS.map((m, mi) => {
                const isFocused = focusMarket === m.name;
                const isBlurred = focusMarket && !isFocused;
                const lastLevel = waLevels[mi][waLevels[mi].length - 1];
                return (
                  <g key={m.name}>
                    <path
                      d={levelPath(waLevels[mi])}
                      fill="none"
                      stroke={m.color}
                      strokeWidth={isFocused ? 2.5 : 1.5}
                      opacity={isBlurred ? 0.2 : 1}
                    />
                    <text
                      x={xPos(EM_YEARS.length - 1) + 6}
                      y={padT + innerH - ((lastLevel - minLevel) / (maxLevel - minLevel)) * innerH + 4}
                      fontSize={8}
                      fill={m.color}
                      opacity={isBlurred ? 0.2 : 1}
                    >
                      {m.flag} {m.name.slice(0, 5)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Nigeria, India, and the Philippines are projected to add the most working-age people through 2060.
            Japan and China see absolute decline — a structural drag on potential GDP growth.
          </p>
        </CardContent>
      </Card>

      {/* Country highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            flag: "🇳🇬",
            name: "Nigeria",
            color: "border-primary/40",
            stats: [
              { label: "Population 2026",     value: "230M" },
              { label: "Median Age",           value: "17.9 yrs" },
              { label: "Fertility Rate",       value: "5.3" },
              { label: "Working-Age Growth",   value: "+3.1%/yr" },
            ],
            insight: "Africa's largest economy. A 20-year demographic window opening now — if governance, education, and infrastructure can keep pace with the youth bulge.",
          },
          {
            flag: "🇮🇳",
            name: "India",
            color: "border-green-500/40",
            stats: [
              { label: "Population 2026",     value: "1.44B" },
              { label: "Median Age",           value: "28.2 yrs" },
              { label: "Fertility Rate",       value: "2.0" },
              { label: "Working-Age Growth",   value: "+1.6%/yr" },
            ],
            insight: "India's demographic dividend peaks ~2030. With 65% of population under 35, India adds 12M workers/year. Manufacturing FDI surge and tech exports are tailwinds.",
          },
          {
            flag: "🇮🇩",
            name: "Indonesia",
            color: "border-amber-500/40",
            stats: [
              { label: "Population 2026",     value: "278M" },
              { label: "Median Age",           value: "29.7 yrs" },
              { label: "Fertility Rate",       value: "2.3" },
              { label: "Working-Age Growth",   value: "+1.4%/yr" },
            ],
            insight: "Southeast Asia's largest economy. Nickel-to-EV battery pipeline, growing middle class (60M by 2030), and digitization of 17,000 islands creates multi-decade growth story.",
          },
        ].map((c) => (
          <Card key={c.name} className={cn("bg-card border", c.color)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-xl">{c.flag}</span> {c.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 mb-3">
                {c.stats.map((stat) => (
                  <div key={stat.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="text-muted-foreground font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.insight}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Southeast Asia growth story */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Southeast Asia: Demographic vs. Structural Catalysts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InsightCard
              icon={TrendingUp}
              title="China+1 Manufacturing Shift"
              body="Vietnam, Thailand, Indonesia benefit as multinationals diversify supply chains out of China. Young workforces + lower wages = structural FDI magnet for the next decade."
              accent="bg-cyan-500/10 border border-cyan-500/30 text-muted-foreground"
            />
            <InsightCard
              icon={Users}
              title="Digital Economy Leapfrog"
              body="650M internet users across ASEAN, median age 29. Mobile-first economy driving fintech, e-commerce, and digital payments at rates exceeding developed-market teens in the 2010s."
              accent="bg-green-500/10 border border-green-500/30 text-green-300"
            />
            <InsightCard
              icon={DollarSign}
              title="Middle-Class Expansion"
              body="ASEAN middle class expected to reach 400M by 2030. Consumer spending on healthcare, education, travel, and financial services will drive multiple sectors for decades."
              accent="bg-amber-500/10 border border-amber-500/30 text-amber-300"
            />
            <InsightCard
              icon={AlertTriangle}
              title="Key Risks to Monitor"
              body="Political stability (Thailand, Myanmar), climate vulnerability (Vietnam delta), commodity dependence, and the risk of aging before reaching high-income status (Malaysia, Thailand) are the primary investment risks."
              accent="bg-red-500/10 border border-red-500/30 text-red-300"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DemographicsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg border border-border">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Global Demographics</h1>
            <p className="text-sm text-muted-foreground">
              Population trends, aging dynamics, and long-term investment implications
            </p>
          </div>
          <div className="ml-auto flex gap-2 flex-wrap">
            <Badge variant="outline" className="border-border text-primary text-xs">
              UN Projections 2026
            </Badge>
            <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
              Thematic Macro
            </Badge>
          </div>
        </div>

        {/* Key stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "World Population",   value: "8.2B",  sub: "+70M/yr net",   color: "text-primary" },
            { label: "Median World Age",   value: "30.9",  sub: "+2.5 yrs/decade", color: "text-amber-400" },
            { label: "Share Aged 65+",     value: "10.3%", sub: "vs 5% in 1960",  color: "text-red-400" },
            { label: "Fertility (Global)", value: "2.3",   sub: "vs 5.0 in 1960", color: "text-green-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="global" className="space-y-4">
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="global"   className="text-xs data-[state=active]:bg-muted">Global Demographics</TabsTrigger>
            <TabsTrigger value="aging"    className="text-xs data-[state=active]:bg-muted">Aging Trends</TabsTrigger>
            <TabsTrigger value="invest"   className="text-xs data-[state=active]:bg-muted">Investment Implications</TabsTrigger>
            <TabsTrigger value="japan"    className="text-xs data-[state=active]:bg-muted">Japan Case Study</TabsTrigger>
            <TabsTrigger value="emerging" className="text-xs data-[state=active]:bg-muted">Emerging Market Dividend</TabsTrigger>
          </TabsList>

          <TabsContent value="global"   className="data-[state=inactive]:hidden"><GlobalDemographicsTab /></TabsContent>
          <TabsContent value="aging"    className="data-[state=inactive]:hidden"><AgingTrendsTab /></TabsContent>
          <TabsContent value="invest"   className="data-[state=inactive]:hidden"><InvestmentImplicationsTab /></TabsContent>
          <TabsContent value="japan"    className="data-[state=inactive]:hidden"><JapanCaseStudyTab /></TabsContent>
          <TabsContent value="emerging" className="data-[state=inactive]:hidden"><EmergingMarketTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
