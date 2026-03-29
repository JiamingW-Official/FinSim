"use client";

import { useState, useMemo } from "react";
import {
  Leaf,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  BarChart2,
  Info,
  FileText,
  Search,
  TrendingUp,
  Users,
  Award,
  Eye,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 925;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function rb(lo: number, hi: number) {
  return lo + rand() * (hi - lo);
}
function ri(lo: number, hi: number) {
  return Math.floor(rb(lo, hi + 1));
}

// ── Static Data ────────────────────────────────────────────────────────────────

interface RatingProvider {
  name: string;
  abbr: string;
  owner: string;
  methodology: string;
  scale: string;
  coverage: string;
  updateFreq: string;
  primarySource: string;
  eWeight: number;
  sWeight: number;
  gWeight: number;
  controversialSectors: string;
  color: string;
}

const PROVIDERS: RatingProvider[] = [
  {
    name: "MSCI ESG Ratings",
    abbr: "MSCI",
    owner: "MSCI Inc.",
    methodology: "Industry-adjusted, key issue model",
    scale: "AAA–CCC (7 levels)",
    coverage: "8,500+ companies",
    updateFreq: "Continuous / annual review",
    primarySource: "Company disclosures + media",
    eWeight: 33,
    sWeight: 33,
    gWeight: 34,
    controversialSectors: "Excluded from all funds; red-flag overlay",
    color: "#3b82f6",
  },
  {
    name: "Sustainalytics",
    abbr: "SUS",
    owner: "Morningstar",
    methodology: "ESG Risk Rating (unmanaged risk score)",
    scale: "0–100 (lower = better)",
    coverage: "14,000+ companies",
    updateFreq: "Annual + event-driven",
    primarySource: "Public disclosures + controversy research",
    eWeight: 35,
    sWeight: 30,
    gWeight: 35,
    controversialSectors: "Product involvement flag; no automatic exclusion",
    color: "#f59e0b",
  },
  {
    name: "S&P Global ESG",
    abbr: "S&P",
    owner: "S&P Global",
    methodology: "Corporate Sustainability Assessment (CSA)",
    scale: "0–100",
    coverage: "11,000+ companies",
    updateFreq: "Annual questionnaire cycle",
    primarySource: "Annual CSA questionnaire (70%) + public data",
    eWeight: 40,
    sWeight: 30,
    gWeight: 30,
    controversialSectors: "Sector-specific questions; disclosed exposure scoring",
    color: "#10b981",
  },
  {
    name: "Refinitiv ESG",
    abbr: "REF",
    owner: "London Stock Exchange Group",
    methodology: "Pillar + controversy overlay",
    scale: "0–100 + controversy deduction",
    coverage: "12,000+ companies",
    updateFreq: "Annual + real-time controversy",
    primarySource: "Public disclosures 100%",
    eWeight: 34,
    sWeight: 35,
    gWeight: 31,
    controversialSectors: "Controversy score reduces combined ESG score",
    color: "#8b5cf6",
  },
  {
    name: "Bloomberg ESG",
    abbr: "BBG",
    owner: "Bloomberg LP",
    methodology: "Disclosure-based scoring",
    scale: "0–100",
    coverage: "15,000+ companies",
    updateFreq: "Annual",
    primarySource: "Company disclosures exclusively",
    eWeight: 30,
    sWeight: 35,
    gWeight: 35,
    controversialSectors: "Separate weapons / tobacco flags",
    color: "#06b6d4",
  },
  {
    name: "ISS ESG",
    abbr: "ISS",
    owner: "Deutsche Börse Group",
    methodology: "Absolute performance + governance quality",
    scale: "A+ to D– (12 levels)",
    coverage: "10,000+ companies",
    updateFreq: "Annual + controversy alerts",
    primarySource: "Public data + engagement",
    eWeight: 38,
    sWeight: 28,
    gWeight: 34,
    controversialSectors: "Prime/Not Prime designation; norms screening",
    color: "#f97316",
  },
];

interface DisclosureFramework {
  name: string;
  abbr: string;
  focus: string;
  mandatory: boolean;
  geography: string;
  topics: string[];
  color: string;
}

const FRAMEWORKS: DisclosureFramework[] = [
  {
    name: "Global Reporting Initiative",
    abbr: "GRI",
    focus: "Impact materiality — effects on economy, environment, people",
    mandatory: false,
    geography: "Global",
    topics: ["Economic", "Environmental", "Social", "Governance"],
    color: "#10b981",
  },
  {
    name: "SASB Standards",
    abbr: "SASB",
    focus: "Financial materiality — issues affecting enterprise value",
    mandatory: false,
    geography: "US-centric (77 industries)",
    topics: ["Environment", "Social Capital", "Human Capital", "Business Model", "Leadership"],
    color: "#3b82f6",
  },
  {
    name: "TCFD",
    abbr: "TCFD",
    focus: "Climate-related financial disclosures",
    mandatory: true,
    geography: "UK, NZ, Japan mandatory; others voluntary",
    topics: ["Governance", "Strategy", "Risk Management", "Metrics & Targets"],
    color: "#f59e0b",
  },
  {
    name: "TNFD",
    abbr: "TNFD",
    focus: "Nature & biodiversity financial disclosures",
    mandatory: false,
    geography: "Voluntary globally (2023 launch)",
    topics: ["Governance", "Strategy", "Risk & Impact Mgmt", "Metrics & Targets"],
    color: "#84cc16",
  },
  {
    name: "ISSB / IFRS S1&S2",
    abbr: "ISSB",
    focus: "Global baseline for sustainability disclosure",
    mandatory: true,
    geography: "Australia, Canada, HK, Singapore adopting",
    topics: ["General Sustainability", "Climate", "Forward-looking", "Comparability"],
    color: "#8b5cf6",
  },
];

interface GreenwashCase {
  company: string;
  year: number;
  regulator: string;
  allegation: string;
  outcome: string;
  fine: string;
  severity: "High" | "Medium" | "Critical";
}

const GREENWASH_CASES: GreenwashCase[] = [
  {
    company: "DWS / Deutsche Bank Asset Management",
    year: 2022,
    regulator: "SEC / BaFin",
    allegation: "Overstated ESG integration across AUM; claimed ESG screening on funds that had none",
    outcome: "SEC charged; $19M settlement; CEO resigned",
    fine: "$19M",
    severity: "Critical",
  },
  {
    company: "Goldman Sachs Asset Management",
    year: 2022,
    regulator: "SEC",
    allegation: "ESG research process not followed as described in fund marketing materials",
    outcome: "$4M SEC penalty; revised prospectus",
    fine: "$4M",
    severity: "High",
  },
  {
    company: "HSBC Asset Management",
    year: 2022,
    regulator: "UK FCA / ASA",
    allegation: "Misleading ads claiming HSBC was 'helping transition to net zero' while financing fossil fuels",
    outcome: "Ads banned; ASA ruling upheld; formal warning",
    fine: "N/A",
    severity: "High",
  },
  {
    company: "Targobank (DE)",
    year: 2021,
    regulator: "BaFin",
    allegation: "Green savings products linked to non-green assets in reality",
    outcome: "Product withdrawn; regulatory review",
    fine: "Undisclosed",
    severity: "Medium",
  },
  {
    company: "Volkswagen (VW)",
    year: 2015,
    regulator: "EPA / EC",
    allegation: "Dieselgate — falsified emissions data used in ESG and regulatory filings",
    outcome: "$33B total fines; ESG scores collapsed",
    fine: "$33B+",
    severity: "Critical",
  },
  {
    company: "H&M",
    year: 2023,
    regulator: "Netherlands ACM",
    allegation: "Conscious Collection sustainability claims unsubstantiated; misleading scoring methodology",
    outcome: "Ceased Higg Index labeling; pending litigation",
    fine: "N/A",
    severity: "High",
  },
  {
    company: "Repsol",
    year: 2021,
    regulator: "Climate Bonds Initiative",
    allegation: "Green bond proceeds financed projects not meeting transition criteria",
    outcome: "Excluded from CBI-certified universe",
    fine: "N/A",
    severity: "Medium",
  },
  {
    company: "Vale S.A.",
    year: 2019,
    regulator: "Brazilian courts / SEC",
    allegation: "Dam safety certifications misrepresented; Brumadinho collapse killed 270",
    outcome: "$7B settlement; ESG disqualification across major indices",
    fine: "$7B",
    severity: "Critical",
  },
];

interface SectorMateriality {
  sector: string;
  eScore: number;
  sScore: number;
  gScore: number;
  topIssue: string;
}

const SECTOR_MATERIALITY: SectorMateriality[] = [
  { sector: "Energy (O&G)", eScore: 95, sScore: 60, gScore: 70, topIssue: "GHG Emissions" },
  { sector: "Utilities", eScore: 90, sScore: 55, gScore: 65, topIssue: "Carbon Intensity" },
  { sector: "Materials", eScore: 85, sScore: 70, gScore: 60, topIssue: "Water Usage" },
  { sector: "Industrials", eScore: 75, sScore: 65, gScore: 60, topIssue: "Supply Chain Emissions" },
  { sector: "Consumer Staples", eScore: 60, sScore: 80, gScore: 65, topIssue: "Labor Practices" },
  { sector: "Health Care", eScore: 45, sScore: 85, gScore: 75, topIssue: "Product Safety" },
  { sector: "Financials", eScore: 50, sScore: 65, gScore: 90, topIssue: "Corporate Governance" },
  { sector: "Technology", eScore: 55, sScore: 75, gScore: 80, topIssue: "Data Privacy" },
  { sector: "Communication", eScore: 40, sScore: 80, gScore: 75, topIssue: "Content Governance" },
  { sector: "Real Estate", eScore: 80, sScore: 55, gScore: 65, topIssue: "Energy Efficiency" },
];

// ── Pre-generate scatter data for provider correlation chart ────────────────
const SCATTER_POINTS = Array.from({ length: 40 }, (_, i) => {
  const base = 0.3 + rand() * 0.7;
  const noise = (rand() - 0.5) * 0.4;
  return {
    x: Math.min(1, Math.max(0, base)),
    y: Math.min(1, Math.max(0, base + noise)),
    id: i,
  };
});

// UN PRI growth data
const PRI_GROWTH = [
  { year: "2006", signatories: 100, aum: 6.5 },
  { year: "2008", signatories: 360, aum: 15 },
  { year: "2010", signatories: 800, aum: 25 },
  { year: "2012", signatories: 1180, aum: 32 },
  { year: "2014", signatories: 1260, aum: 45 },
  { year: "2016", signatories: 1750, aum: 62 },
  { year: "2018", signatories: 2370, aum: 82 },
  { year: "2020", signatories: 3038, aum: 103 },
  { year: "2022", signatories: 5300, aum: 121 },
  { year: "2024", signatories: 7000, aum: 120 },
];

// ── Tab 1: ESG Rating Providers ───────────────────────────────────────────────

function ProviderComparisonTable() {
  const [selected, setSelected] = useState<string | null>(null);
  const sel = PROVIDERS.find((p) => p.abbr === selected) ?? null;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-foreground/5">
              {["Provider", "Methodology", "Scale", "Coverage", "Update Freq", "E%", "S%", "G%"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROVIDERS.map((p) => (
              <tr
                key={p.abbr}
                onClick={() => setSelected(selected === p.abbr ? null : p.abbr)}
                className={`border-b border-border/50 cursor-pointer transition-colors ${
                  selected === p.abbr ? "bg-foreground/10" : "hover:bg-muted/30"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <div>
                      <div className="font-semibold text-foreground">{p.abbr}</div>
                      <div className="text-xs text-muted-foreground">{p.owner}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-[180px]">
                  <span className="line-clamp-2 text-xs text-muted-foreground">{p.methodology}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{p.scale}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{p.coverage}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{p.updateFreq}</td>
                <td className="px-4 py-3">
                  <span className="text-green-400 font-semibold">{p.eWeight}%</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-primary font-medium">{p.sWeight}%</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-amber-400 font-medium">{p.gWeight}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {sel && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-md border border-border bg-foreground/5 p-4 space-y-2"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full" style={{ background: sel.color }} />
              <span className="font-medium text-foreground">{sel.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Primary Source:</span>
                <span className="ml-2 text-foreground">{sel.primarySource}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Controversial Sectors:</span>
                <span className="ml-2 text-foreground">{sel.controversialSectors}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProviderCorrelationScatter() {
  const W = 340;
  const H = 240;
  const PAD = 40;

  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />
          Provider Rating Disagreement (Avg Correlation: 0.61)
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Credit rating agencies average 0.92 correlation — ESG providers disagree far more
        </p>
      </CardHeader>
      <CardContent>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* axes */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#52525b" strokeWidth={1} />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#52525b" strokeWidth={1} />
          {/* axis labels */}
          <text x={W / 2} y={H - 4} textAnchor="middle" fill="#71717a" fontSize={10}>
            Provider A Score (normalized)
          </text>
          <text
            x={10}
            y={H / 2}
            textAnchor="middle"
            fill="#71717a"
            fontSize={10}
            transform={`rotate(-90, 10, ${H / 2})`}
          >
            Provider B Score
          </text>
          {/* diagonal reference */}
          <line
            x1={PAD}
            y1={H - PAD}
            x2={W - PAD}
            y2={PAD}
            stroke="#3f3f46"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          {/* scatter points */}
          {SCATTER_POINTS.map((pt) => {
            const cx = PAD + pt.x * (W - PAD * 2);
            const cy = H - PAD - pt.y * (H - PAD * 2);
            return (
              <circle key={pt.id} cx={cx} cy={cy} r={4} fill="#3b82f6" fillOpacity={0.7} />
            );
          })}
          {/* correlation labels */}
          <rect x={W - 130} y={PAD} width={120} height={50} rx={4} fill="#18181b" stroke="#3f3f46" />
          <text x={W - 120} y={PAD + 16} fill="#a1a1aa" fontSize={9}>
            ESG Avg Correlation
          </text>
          <text x={W - 120} y={PAD + 30} fill="#f59e0b" fontSize={14} fontWeight="bold">
            0.61
          </text>
          <text x={W - 120} y={PAD + 44} fill="#a1a1aa" fontSize={9}>
            Credit Ratings: 0.92
          </text>
        </svg>
      </CardContent>
    </Card>
  );
}

function SourceDataBreakdown() {
  const segments = [
    { label: "Company Disclosures", pct: 60, color: "#10b981" },
    { label: "Third-Party Data", pct: 25, color: "#3b82f6" },
    { label: "Proprietary Research", pct: 15, color: "#f59e0b" },
  ];
  const CX = 80;
  const CY = 80;
  const R = 60;
  let cumAngle = -Math.PI / 2;

  const slices = segments.map((seg) => {
    const startAngle = cumAngle;
    const sweep = (seg.pct / 100) * 2 * Math.PI;
    cumAngle += sweep;
    const endAngle = cumAngle;
    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle);
    const y2 = CY + R * Math.sin(endAngle);
    const midAngle = startAngle + sweep / 2;
    const lx = CX + (R + 18) * Math.cos(midAngle);
    const ly = CY + (R + 18) * Math.sin(midAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    return { ...seg, path: `M${CX},${CY} L${x1},${y1} A${R},${R},0,${largeArc},1,${x2},${y2} Z`, lx, ly };
  });

  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground">Source Data Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <svg width={160} height={160} viewBox="0 0 160 160">
            {slices.map((sl) => (
              <g key={sl.label}>
                <path d={sl.path} fill={sl.color} fillOpacity={0.85} />
                <text x={sl.lx} y={sl.ly} textAnchor="middle" fill={sl.color} fontSize={9} fontWeight="bold">
                  {sl.pct}%
                </text>
              </g>
            ))}
          </svg>
          <div className="space-y-3">
            {segments.map((seg) => (
              <div key={seg.label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: seg.color }} />
                <div>
                  <div className="text-sm text-foreground font-medium">{seg.label}</div>
                  <div className="text-xs text-muted-foreground">{seg.pct}% of total input</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ESGWeightBarChart() {
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground">E / S / G Weight Differences Across Providers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {PROVIDERS.map((p) => (
            <div key={p.abbr} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-muted-foreground w-10 font-mono">{p.abbr}</span>
                <span className="text-muted-foreground text-xs">E·S·G</span>
              </div>
              <div className="flex h-5 rounded overflow-hidden">
                <div style={{ width: `${p.eWeight}%`, background: "#10b981" }} className="flex items-center justify-center text-[11px] text-foreground font-bold">
                  {p.eWeight}
                </div>
                <div style={{ width: `${p.sWeight}%`, background: "#3b82f6" }} className="flex items-center justify-center text-[11px] text-foreground font-bold">
                  {p.sWeight}
                </div>
                <div style={{ width: `${p.gWeight}%`, background: "#f59e0b" }} className="flex items-center justify-center text-[11px] text-foreground font-medium">
                  {p.gWeight}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" />Environmental</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary" />Social</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" />Governance</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Tab 2: Disclosure Frameworks ──────────────────────────────────────────────

function FrameworkMatrix() {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-foreground/5">
            {["Framework", "Focus", "Mandatory?", "Geography", "Key Topics"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FRAMEWORKS.map((f) => (
            <tr key={f.abbr} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                  <div>
                    <div className="font-medium text-foreground">{f.abbr}</div>
                    <div className="text-xs text-muted-foreground">{f.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs max-w-[180px]">{f.focus}</td>
              <td className="px-4 py-3">
                {f.mandatory ? (
                  <Badge className="bg-red-500/20 text-red-300 text-xs">Mandatory</Badge>
                ) : (
                  <Badge className="bg-muted text-muted-foreground text-xs">Voluntary</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{f.geography}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {f.topics.map((t) => (
                    <span key={t} className="text-[11px] bg-foreground/5 text-muted-foreground rounded px-1.5 py-0.5 border border-border">
                      {t}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Scope123Diagram() {
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Scope 1 / 2 / 3 Emissions Boundary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox="0 0 480 220" className="w-full" style={{ maxHeight: 220 }}>
          {/* Scope 3 upstream */}
          <rect x={2} y={20} width={130} height={140} rx={8} fill="#3f3f46" stroke="#52525b" />
          <text x={67} y={40} textAnchor="middle" fill="#a1a1aa" fontSize={10} fontWeight="bold">Scope 3 Upstream</text>
          {["Raw materials", "Supplier energy", "Business travel", "Employee commuting"].map((t, i) => (
            <text key={t} x={10} y={60 + i * 18} fill="#71717a" fontSize={9}>{`• ${t}`}</text>
          ))}

          {/* Company box */}
          <rect x={150} y={10} width={180} height={200} rx={10} fill="#1c1c1e" stroke="#3b82f6" strokeWidth={2} />
          <text x={240} y={35} textAnchor="middle" fill="#3b82f6" fontSize={11} fontWeight="bold">COMPANY</text>
          {/* Scope 1 */}
          <rect x={160} y={45} width={160} height={60} rx={6} fill="#10b981" fillOpacity={0.2} stroke="#10b981" />
          <text x={240} y={65} textAnchor="middle" fill="#10b981" fontSize={10} fontWeight="bold">Scope 1</text>
          <text x={240} y={80} textAnchor="middle" fill="#6ee7b7" fontSize={9}>Direct emissions</text>
          <text x={240} y={95} textAnchor="middle" fill="#6ee7b7" fontSize={9}>Owned vehicles, facilities</text>
          {/* Scope 2 */}
          <rect x={160} y={120} width={160} height={70} rx={6} fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" />
          <text x={240} y={140} textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight="bold">Scope 2</text>
          <text x={240} y={155} textAnchor="middle" fill="#fcd34d" fontSize={9}>Purchased electricity</text>
          <text x={240} y={170} textAnchor="middle" fill="#fcd34d" fontSize={9}>Heat, steam, cooling</text>

          {/* Scope 3 downstream */}
          <rect x={348} y={20} width={130} height={140} rx={8} fill="#3f3f46" stroke="#52525b" />
          <text x={413} y={40} textAnchor="middle" fill="#a1a1aa" fontSize={10} fontWeight="bold">Scope 3 Downstream</text>
          {["Use of sold products", "End-of-life treatment", "Distribution", "Investments"].map((t, i) => (
            <text key={t} x={356} y={60 + i * 18} fill="#71717a" fontSize={9}>{`• ${t}`}</text>
          ))}

          {/* arrows */}
          <line x1={132} y1={85} x2={150} y2={85} stroke="#52525b" strokeWidth={1.5} markerEnd="url(#arr)" />
          <line x1={330} y1={85} x2={348} y2={85} stroke="#52525b" strokeWidth={1.5} markerEnd="url(#arr)" />
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#52525b" />
            </marker>
          </defs>
          <text x={240} y={210} textAnchor="middle" fill="#52525b" fontSize={9}>
            Scope 3 typically 70–90% of total footprint
          </text>
        </svg>
      </CardContent>
    </Card>
  );
}

function DoubleMaterialityCard() {
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground">Double Materiality Concept (EU CSRD)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1 rounded-lg bg-primary/10 border border-border p-3">
            <div className="text-xs font-medium text-primary mb-1">Financial Materiality</div>
            <p className="text-xs text-muted-foreground">
              How sustainability risks & opportunities affect the company's financial position,
              performance, cash flows, and enterprise value. Used by TCFD, SASB, ISSB.
            </p>
          </div>
          <div className="flex-1 rounded-lg bg-emerald-500/5 border border-emerald-500/30 p-3">
            <div className="text-xs font-medium text-emerald-300 mb-1">Impact Materiality</div>
            <p className="text-xs text-muted-foreground">
              How the company's activities impact people, the environment, and society — regardless
              of financial effect. Used by GRI, mandated under CSRD Article 29.
            </p>
          </div>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-foreground/5 border border-border text-xs text-muted-foreground">
          <span className="text-foreground font-medium">CSRD scope:</span> ~50,000 EU companies from 2025–2028 phased rollout.
          Requires assurance (limited initially, reasonable by 2028) by an approved auditor.
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          {[
            { label: "SFDR Art. 6", desc: "No ESG integration claim", color: "bg-muted text-muted-foreground" },
            { label: "SFDR Art. 8", desc: "Promotes E/S characteristics", color: "bg-primary/20 text-primary" },
            { label: "SFDR Art. 9", desc: "Sustainable investment objective", color: "bg-emerald-500/20 text-emerald-300" },
          ].map((item) => (
            <div key={item.label} className={`rounded p-2 ${item.color} border border-border`}>
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground opacity-80 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CDPScoringCard() {
  const grades = [
    { grade: "A", label: "Leadership", desc: "Best-in-class; implementing solutions", color: "#10b981" },
    { grade: "A–", label: "Leadership", desc: "Strong performance with minor gaps", color: "#34d399" },
    { grade: "B", label: "Management", desc: "Taking coordinated action", color: "#3b82f6" },
    { grade: "C", label: "Awareness", desc: "Aware but limited action", color: "#f59e0b" },
    { grade: "D", label: "Disclosure", desc: "Disclosed but minimal engagement", color: "#f97316" },
    { grade: "F", label: "No Response", desc: "Failed to respond to CDP", color: "#ef4444" },
  ];
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          CDP Questionnaire Scoring (A–D Scale)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {grades.map((g) => (
            <div key={g.grade} className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shrink-0"
                style={{ background: g.color + "33", color: g.color, border: `1px solid ${g.color}55` }}
              >
                {g.grade}
              </span>
              <div className="flex-1">
                <div className="text-xs font-medium text-foreground">{g.label}</div>
                <div className="text-xs text-muted-foreground">{g.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Tab 3: Greenwashing & Quality ─────────────────────────────────────────────

function GreenwashTaxonomyCard() {
  const types = [
    {
      type: "Misleading Claims",
      icon: "⚠",
      color: "#ef4444",
      examples: ["Net zero by 2050 without credible plan", "'Carbon neutral' products via cheap offsets", "100% renewable energy (only purchased RECs)"],
    },
    {
      type: "Selective Omission",
      icon: "🔍",
      color: "#f59e0b",
      examples: ["Highlighting recycling while ignoring Scope 3", "Touting EV models while 95% ICE sales", "ESG fund excludes weapons but includes tar sands"],
    },
    {
      type: "False Impression",
      icon: "🎭",
      color: "#8b5cf6",
      examples: ["Green imagery on fossil fuel ads (HSBC)", "Sustainable Collection label on fast fashion", "ESG fund name on non-integrated portfolio"],
    },
  ];
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <Eye className="w-4 h-4 text-red-400" />
          Greenwashing Taxonomy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {types.map((t) => (
            <div
              key={t.type}
              className="rounded-lg p-3 border"
              style={{ borderColor: t.color + "44", background: t.color + "11" }}
            >
              <div className="text-lg mb-1">{t.icon}</div>
              <div className="text-xs font-medium mb-2" style={{ color: t.color }}>
                {t.type}
              </div>
              <ul className="space-y-1">
                {t.examples.map((e) => (
                  <li key={e} className="text-xs text-muted-foreground flex gap-1">
                    <span style={{ color: t.color }}>•</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GreenwashCasesTable() {
  const sevColor = (s: GreenwashCase["severity"]) =>
    s === "Critical" ? "bg-red-500/20 text-red-300" : s === "High" ? "bg-orange-500/20 text-orange-300" : "bg-yellow-500/20 text-yellow-300";

  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground">High-Profile Greenwashing Cases</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border bg-foreground/5">
                {["Company", "Year", "Regulator", "Allegation", "Fine/Outcome", "Severity"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-muted-foreground font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GREENWASH_CASES.map((c) => (
                <tr key={c.company} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium text-foreground max-w-[120px]">{c.company}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.year}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.regulator}</td>
                  <td className="px-3 py-2 text-muted-foreground max-w-[200px] line-clamp-2">{c.allegation}</td>
                  <td className="px-3 py-2">
                    <span className="font-medium text-red-400">{c.fine}</span>
                  </td>
                  <td className="px-3 py-2">
                    <Badge className={`text-xs text-muted-foreground ${sevColor(c.severity)}`}>{c.severity}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function GreenwashSignalChecklist() {
  const signals = [
    { signal: "No third-party verification or assurance on ESG claims", risk: "High" },
    { signal: "ESG fund uses aspirational language without binding commitments", risk: "High" },
    { signal: "Net-zero target without interim milestones or credible pathway", risk: "High" },
    { signal: "Carbon offset reliance >50% of reduction strategy", risk: "High" },
    { signal: "ESG rating score improved but underlying metrics unchanged", risk: "Medium" },
    { signal: "Scope 3 emissions excluded from climate reporting", risk: "Medium" },
    { signal: "ESG fund name inconsistent with holdings (SEC 80% rule)", risk: "High" },
    { signal: "'Science-based' targets not validated by SBTi", risk: "Medium" },
    { signal: "Disclosure limited to positive metrics only", risk: "Medium" },
    { signal: "Supply chain ESG assessment covers <30% of Tier 1 suppliers", risk: "Medium" },
  ];
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-400" />
          Greenwashing Risk Signal Checklist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {signals.map((sig) => (
            <div key={sig.signal} className="flex items-start gap-2 text-xs text-muted-foreground">
              <XCircle
                className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${sig.risk === "High" ? "text-red-400" : "text-amber-400"}`}
              />
              <span className="text-muted-foreground flex-1">{sig.signal}</span>
              <Badge className={`text-[11px] shrink-0 ${sig.risk === "High" ? "bg-red-500/20 text-red-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                {sig.risk}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ImpactVsESGWashing() {
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground">Impact Washing vs ESG Washing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-primary/10 border border-border p-3">
            <div className="text-xs font-medium text-primary mb-2">ESG Washing</div>
            <p className="text-xs text-muted-foreground mb-2">
              Overstating the integration of E/S/G factors in investment process or company operations.
            </p>
            <div className="text-xs text-muted-foreground">Examples: DWS, Goldman ESG fund allegations</div>
          </div>
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/30 p-3">
            <div className="text-xs font-medium text-emerald-300 mb-2">Impact Washing</div>
            <p className="text-xs text-muted-foreground mb-2">
              Claiming measurable positive real-world outcomes (additionality) that cannot be evidenced or attributed.
            </p>
            <div className="text-xs text-muted-foreground">Examples: Green bonds without use-of-proceeds tracking</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="rounded bg-foreground/5 p-2 border border-border">
            <div className="text-muted-foreground font-medium mb-1">Science-Based vs Aspiration</div>
            <p className="text-muted-foreground text-xs">SBTi validates targets consistent with 1.5°C or well-below 2°C scenarios. Aspirational targets lack this rigor.</p>
          </div>
          <div className="rounded bg-foreground/5 p-2 border border-border">
            <div className="text-muted-foreground font-medium mb-1">AI Greenwashing Detection</div>
            <p className="text-muted-foreground text-xs">NLP tools (ESG Book, Clarity AI) scan filings and news for greenwashing signals via sentiment and consistency analysis.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Tab 4: ESG Integration ────────────────────────────────────────────────────

function IntegrationSpectrum() {
  const steps = [
    { label: "Negative Screening", desc: "Exclude sectors (weapons, tobacco, fossil fuels)", color: "#ef4444" },
    { label: "Norms-Based", desc: "Exclude UN Global Compact violators", color: "#f97316" },
    { label: "Best-in-Class", desc: "Top ESG scorers within each sector", color: "#f59e0b" },
    { label: "ESG Integration", desc: "ESG as financial risk factor in DCF/models", color: "#10b981" },
    { label: "Thematic", desc: "Clean energy, water, social bond funds", color: "#3b82f6" },
    { label: "Impact Investing", desc: "Intentional, measurable positive outcomes", color: "#8b5cf6" },
  ];
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          ESG Integration Spectrum
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex items-center gap-1 mb-4">
            {steps.map((step, i) => (
              <div key={step.label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full h-8 rounded flex items-center justify-center text-[11px] font-medium text-foreground text-center leading-tight px-1"
                  style={{ background: step.color + "44", border: `1px solid ${step.color}66` }}
                >
                  {step.label}
                </div>
                <div className="text-[11px] text-muted-foreground text-center leading-tight">{step.desc}</div>
                {i < steps.length - 1 && (
                  <div className="absolute" style={{ left: `${((i + 1) / steps.length) * 100}%`, top: "12px" }}>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
            <span>← Pure exclusion</span>
            <span>Deeper integration →</span>
            <span>Impact focus →</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectorMaterialityMatrix() {
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />
          ESG Materiality by Sector (SASB Matrix)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox="0 0 480 280" className="w-full">
          {/* grid */}
          {SECTOR_MATERIALITY.map((sec, i) => {
            const y = 30 + i * 24;
            const eW = (sec.eScore / 100) * 100;
            const sW = (sec.sScore / 100) * 100;
            const gW = (sec.gScore / 100) * 100;
            return (
              <g key={sec.sector}>
                <text x={2} y={y + 9} fill="#a1a1aa" fontSize={8} dominantBaseline="middle">
                  {sec.sector}
                </text>
                <rect x={130} y={y} width={eW} height={10} rx={2} fill="#10b981" fillOpacity={0.7} />
                <rect x={240} y={y} width={sW} height={10} rx={2} fill="#3b82f6" fillOpacity={0.7} />
                <rect x={350} y={y} width={gW} height={10} rx={2} fill="#f59e0b" fillOpacity={0.7} />
                <text x={472} y={y + 9} fill="#52525b" fontSize={7} dominantBaseline="middle" textAnchor="end">
                  {sec.topIssue}
                </text>
              </g>
            );
          })}
          {/* column headers */}
          <text x={180} y={15} textAnchor="middle" fill="#10b981" fontSize={8} fontWeight="bold">E (0–100)</text>
          <text x={290} y={15} textAnchor="middle" fill="#3b82f6" fontSize={8} fontWeight="bold">S (0–100)</text>
          <text x={400} y={15} textAnchor="middle" fill="#f59e0b" fontSize={8} fontWeight="bold">G (0–100)</text>
          <text x={472} y={15} textAnchor="end" fill="#52525b" fontSize={7}>Top Issue</text>
        </svg>
      </CardContent>
    </Card>
  );
}

function PRIGrowthChart() {
  const W = 460;
  const H = 200;
  const PAD = { t: 20, r: 20, b: 40, l: 50 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;
  const maxSig = 7000;

  const pts = PRI_GROWTH.map((d, i) => ({
    x: PAD.l + (i / (PRI_GROWTH.length - 1)) * iW,
    y: PAD.t + iH - (d.signatories / maxSig) * iH,
    ...d,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${PAD.t + iH} L${pts[0].x},${PAD.t + iH} Z`;

  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
          UN PRI Signatory Growth (2006–2024)
        </CardTitle>
        <p className="text-xs text-muted-foreground">100 signatories / $6.5T AUM → 7,000 signatories / $120T AUM</p>
      </CardHeader>
      <CardContent>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
          <defs>
            <linearGradient id="priGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* area */}
          <path d={area} fill="url(#priGrad)" />
          {/* line */}
          <path d={line} fill="none" stroke="#3b82f6" strokeWidth={2} />
          {/* points */}
          {pts.map((p) => (
            <g key={p.year}>
              <circle cx={p.x} cy={p.y} r={3} fill="#3b82f6" />
              <text x={p.x} y={H - PAD.b + 14} textAnchor="middle" fill="#52525b" fontSize={8}>
                {p.year}
              </text>
            </g>
          ))}
          {/* y axis */}
          {[0, 2000, 4000, 6000, 7000].map((v) => {
            const y = PAD.t + iH - (v / maxSig) * iH;
            return (
              <g key={v}>
                <line x1={PAD.l - 3} y1={y} x2={W - PAD.r} y2={y} stroke="#27272a" strokeWidth={1} />
                <text x={PAD.l - 6} y={y + 3} textAnchor="end" fill="#52525b" fontSize={8}>
                  {v === 0 ? "0" : `${v / 1000}k`}
                </text>
              </g>
            );
          })}
          {/* label */}
          <text x={PAD.l} y={PAD.t - 4} fill="#52525b" fontSize={8}>
            Signatories
          </text>
        </svg>
      </CardContent>
    </Card>
  );
}

function ActiveOwnershipCard() {
  const stats = [
    { label: "Engagement Success Rate", value: "34%", sub: "Dialogue → policy change", color: "#10b981" },
    { label: "Proxy Resolution Pass Rate", value: "28%", sub: "2023 AGM season", color: "#3b82f6" },
    { label: "Say-on-Climate Votes", value: "67%", sub: "Average support at top-100", color: "#f59e0b" },
    { label: "Board ESG Oversight", value: "82%", sub: "S&P 500 companies", color: "#8b5cf6" },
  ];
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-muted-foreground/50" />
          Active Ownership: Engagement & Proxy Voting
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((st) => (
            <div key={st.label} className="rounded-lg bg-foreground/5 border border-border p-3">
              <div className="text-2xl font-bold" style={{ color: st.color }}>
                {st.value}
              </div>
              <div className="text-xs font-medium text-foreground mt-0.5">{st.label}</div>
              <div className="text-xs text-muted-foreground">{st.sub}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex gap-2 items-start">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-muted-foreground"><span className="text-foreground font-medium">Engagement</span> — direct dialogue with company management; climate commitments, diversity targets, executive pay</span>
          </div>
          <div className="flex gap-2 items-start">
            <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground"><span className="text-foreground font-medium">Proxy Voting</span> — shareholder resolutions at AGMs; co-filing with activist groups; withhold votes on directors</span>
          </div>
          <div className="flex gap-2 items-start">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span className="text-muted-foreground"><span className="text-foreground font-medium">Factor Contamination</span> — ESG portfolios overweight quality/low-vol factors; alpha may be factor beta, not genuine ESG premium</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ESGDataPage() {
  const [activeTab, setActiveTab] = useState("providers");

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 border-l-4 border-l-primary rounded-lg bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-md bg-emerald-500/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-foreground">ESG Data & Ratings</h1>
            <p className="text-sm text-muted-foreground">
              Rating methodologies, disclosure frameworks, greenwashing, and ESG integration in investment
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { icon: <BarChart2 className="w-3 h-3" />, label: "6 Major Providers", color: "text-primary" },
            { icon: <FileText className="w-3 h-3" />, label: "5 Disclosure Frameworks", color: "text-amber-400" },
            { icon: <Shield className="w-3 h-3" />, label: "8 Greenwashing Cases", color: "text-red-400" },
            { icon: <Globe className="w-3 h-3" />, label: "$120T PRI AUM", color: "text-emerald-400" },
          ].map((chip) => (
            <span
              key={chip.label}
              className={`flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-foreground/5 border border-border ${chip.color}`}
            >
              {chip.icon}
              {chip.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="bg-foreground/5 border border-border mb-6 flex-wrap h-auto gap-1 p-1">
          {[
            { value: "providers", label: "ESG Rating Providers", icon: <BarChart2 className="w-3.5 h-3.5" /> },
            { value: "frameworks", label: "Disclosure Frameworks", icon: <FileText className="w-3.5 h-3.5" /> },
            { value: "greenwashing", label: "Greenwashing & Quality", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
            { value: "integration", label: "ESG Integration", icon: <TrendingUp className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 text-xs data-[state=active]:bg-foreground/15 data-[state=active]:text-foreground text-muted-foreground"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1 ── */}
        <TabsContent value="providers" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="mb-4">
              <h2 className="text-base font-medium text-foreground mb-1">Provider Comparison</h2>
              <p className="text-xs text-muted-foreground">Click any row to see additional details. ESG ratings correlate at ~0.61 vs 0.92 for credit ratings.</p>
            </div>
            <ProviderComparisonTable />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProviderCorrelationScatter />
            <SourceDataBreakdown />
          </div>

          <ESGWeightBarChart />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Rating Revision Frequency & Lag
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                {[
                  { provider: "MSCI", freq: "Continuous (event-driven) + annual review", lag: "30–90 days after disclosure" },
                  { provider: "Sustainalytics", freq: "Annual (+ controversy alerts real-time)", lag: "60–120 days" },
                  { provider: "S&P / CSA", freq: "Annual CSA cycle", lag: "4–6 months after questionnaire" },
                  { provider: "Refinitiv", freq: "Annual + real-time controversy deduction", lag: "30–45 days (controversy), 90 (fundamental)" },
                  { provider: "Bloomberg", freq: "Annual disclosure cycle", lag: "Aligned with company fiscal year end" },
                  { provider: "ISS ESG", freq: "Annual + controversy alerts", lag: "60 days post-disclosure" },
                ].map((r) => (
                  <div key={r.provider} className="flex gap-2 border-b border-border/50 pb-1 last:border-0">
                    <span className="text-muted-foreground font-medium w-24 shrink-0">{r.provider}</span>
                    <span className="text-muted-foreground flex-1">{r.freq}</span>
                    <span className="text-muted-foreground shrink-0 text-xs">{r.lag}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  Controversial Sectors Treatment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                {[
                  { sector: "Tobacco", msci: "Flag; no auto-exclude", sus: "Product involvement", sp: "Sector-specific score" },
                  { sector: "Weapons (cluster/AP)", msci: "Excluded fund flag", sus: "Controversy + product", sp: "Threshold exposure" },
                  { sector: "Fossil Fuels", msci: "Transition risk scored", sus: "Carbon risk rating", sp: "Stranded asset model" },
                  { sector: "Gambling", msci: "Controversy overlay", sus: "Product flag", sp: "Indirect exposure" },
                  { sector: "Nuclear", msci: "Separate flag", sus: "Country/capacity flag", sp: "Social acceptance scored" },
                ].map((r) => (
                  <div key={r.sector} className="flex gap-2 border-b border-border/50 pb-1 last:border-0">
                    <span className="text-red-300 font-medium w-20 shrink-0">{r.sector}</span>
                    <span className="text-muted-foreground flex-1 text-xs">{r.msci} | {r.sus} | {r.sp}</span>
                  </div>
                ))}
                <p className="text-muted-foreground text-xs">Columns: MSCI | Sustainalytics | S&P</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2 ── */}
        <TabsContent value="frameworks" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="mb-4">
              <h2 className="text-base font-medium text-foreground mb-1">Global Disclosure Frameworks</h2>
              <p className="text-xs text-muted-foreground">GRI, SASB, TCFD, TNFD, ISSB — different scopes, different audiences, increasing mandatory adoption.</p>
            </div>
            <FrameworkMatrix />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Scope123Diagram />
            <CDPScoringCard />
          </div>

          <DoubleMaterialityCard />

          <Card className="bg-card/60 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                SEC Climate Disclosure Rule Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-foreground/10" />
                {[
                  { date: "Mar 2022", event: "SEC proposes climate disclosure rule", status: "done" },
                  { date: "Mar 2024", event: "Final rule adopted — Scope 1, 2 mandatory; Scope 3 dropped", status: "done" },
                  { date: "Jun 2024", event: "Rule challenged in 8th Circuit; SEC voluntarily stayed enforcement", status: "done" },
                  { date: "Apr 2025", event: "SEC under new chair (Atkins) reopens rule for reconsideration", status: "current" },
                  { date: "2026+", event: "Revised or rescinded rule expected; state-level (CA SB 253) remains", status: "future" },
                ].map((item) => (
                  <div key={item.date} className="relative pl-10 pb-4 last:pb-0">
                    <div
                      className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 ${
                        item.status === "done"
                          ? "bg-emerald-500 border-emerald-500"
                          : item.status === "current"
                          ? "bg-amber-400 border-amber-400"
                          : "bg-muted border-border"
                      }`}
                    />
                    <div className="text-xs text-muted-foreground mb-0.5">{item.date}</div>
                    <div className="text-xs text-muted-foreground">{item.event}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground">EU Taxonomy: 6 Environmental Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {[
                    "Climate change mitigation",
                    "Climate change adaptation",
                    "Sustainable use & protection of water",
                    "Transition to a circular economy",
                    "Pollution prevention and control",
                    "Protection and restoration of biodiversity",
                  ].map((obj, i) => (
                    <div key={obj} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-medium shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{obj}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Activities must substantially contribute to ≥1 objective and do no significant harm (DNSH) to the others.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground">Assurance Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <div className="rounded-lg bg-primary/10 border border-border p-3">
                  <div className="font-medium text-primary mb-1">Limited Assurance</div>
                  <p className="text-muted-foreground">Negative assurance — nothing came to attention indicating material error. Lower cost; required initially under CSRD (2025–2027).</p>
                </div>
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/30 p-3">
                  <div className="font-medium text-emerald-300 mb-1">Reasonable Assurance</div>
                  <p className="text-muted-foreground">Positive assurance — auditor concludes information is free from material misstatement. Equivalent to financial audit standard. Required under CSRD by 2028.</p>
                </div>
                <p className="text-muted-foreground text-xs">
                  Third-party verifiers: Big 4 accounting firms, Bureau Veritas, SGS, ERM Group
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 3 ── */}
        <TabsContent value="greenwashing" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="mb-4">
              <h2 className="text-base font-medium text-foreground mb-1">Greenwashing & Data Quality</h2>
              <p className="text-xs text-muted-foreground">Identifying misleading ESG claims, regulatory enforcement, and quality assessment frameworks.</p>
            </div>
            <GreenwashTaxonomyCard />
          </motion.div>

          <GreenwashCasesTable />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GreenwashSignalChecklist />
            <ImpactVsESGWashing />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground/50" />
                  SEC ESG Fund Naming Rules (2023)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="rounded bg-primary/10 border border-border p-2">
                  <span className="font-medium text-primary">80% Rule:</span>
                  <span className="text-muted-foreground ml-1">Funds must invest ≥80% of assets in instruments consistent with the fund name (ESG, sustainable, green, climate, etc.)</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    "Integration funds using ESG label must describe how ESG affects security selection",
                    "Exclusionary screens must match the fund name theme",
                    "Funds using 'impact' must demonstrate additionality (measurable real-world outcomes)",
                    "Website disclosure of ESG scoring methodology within 60 days of naming",
                    "Annual fund name review against holdings required",
                  ].map((rule) => (
                    <div key={rule} className="flex gap-2">
                      <CheckCircle className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{rule}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Third-Party Verification Market
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                {[
                  { org: "SBTi (Science Based Targets)", role: "Validates corporate net-zero and 1.5°C targets", cost: "Free–$10K" },
                  { org: "CDP (Carbon Disclosure Project)", role: "Questionnaire-based scoring; data aggregator", cost: "Voluntary" },
                  { org: "Gold Standard / VCS", role: "Offset project registry and verification", cost: "$0.5–5/tCO2e" },
                  { org: "Climate Bonds Initiative", role: "Green bond standard certification", cost: "0.1% of issuance" },
                  { org: "GRESB", role: "Real estate and infrastructure ESG benchmarking", cost: "$1.5K–$5K" },
                  { org: "B Lab", role: "B Corp certification (governance + impact)", cost: "$1K–$50K" },
                ].map((v) => (
                  <div key={v.org} className="flex gap-2 border-b border-border/50 pb-1.5 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{v.org}</div>
                      <div className="text-muted-foreground text-xs">{v.role}</div>
                    </div>
                    <span className="text-emerald-400 text-xs shrink-0">{v.cost}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 4 ── */}
        <TabsContent value="integration" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="mb-4">
              <h2 className="text-base font-medium text-foreground mb-1">ESG Integration in Investment Process</h2>
              <p className="text-xs text-muted-foreground">From exclusionary screening to impact investing — and the evidence on ESG alpha generation.</p>
            </div>
            <IntegrationSpectrum />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectorMaterialityMatrix />
            <ActiveOwnershipCard />
          </div>

          <PRIGrowthChart />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ESG Performance Attribution Debate
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-3">
                <div className="rounded bg-emerald-500/5 border border-emerald-500/30 p-2">
                  <span className="font-medium text-emerald-300">Bull case:</span>
                  <span className="text-muted-foreground ml-1">Lower tail risk, fewer regulatory/litigation surprises, better governance improves capital allocation → superior risk-adjusted returns</span>
                </div>
                <div className="rounded bg-red-500/5 border border-red-500/30 p-2">
                  <span className="font-medium text-red-300">Bear case:</span>
                  <span className="text-muted-foreground ml-1">High-ESG stocks re-rate as demand grows, front-running effect diminishes. Returns = quality + low-vol factor beta, not ESG alpha</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    "Meta-analysis (Friede et al. 2015): 63% of studies show positive ESG-financial link",
                    "MSCI: High ESG firms had 10.2% lower cost of capital 2010–2019",
                    "Factor-adjusted: ~50% of ESG alpha explained by quality/low-vol tilt",
                    "Emerging markets: stronger ESG-performance link than developed markets",
                    "2022 energy shock: High-ESG underperformed by ~5% due to energy exclusions",
                  ].map((pt) => (
                    <div key={pt} className="flex gap-2">
                      <Info className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{pt}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-amber-400" />
                  Factor Exposure Contamination
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-3">
                <p className="text-muted-foreground">
                  High-ESG portfolios systematically overweight Quality and Low-Volatility factors, making attribution difficult.
                </p>
                <div className="space-y-2">
                  {[
                    { factor: "Quality (Profitability)", correlation: 0.72, explanation: "High-scoring governance → well-run firms → high ROE/ROIC" },
                    { factor: "Low Volatility", correlation: 0.64, explanation: "ESG risk management reduces operational variance" },
                    { factor: "Momentum", correlation: 0.31, explanation: "ESG rating upgrades drive price momentum" },
                    { factor: "Size (Large Cap)", correlation: 0.58, explanation: "Disclosure requirements favor large caps with more resources" },
                    { factor: "Value", correlation: -0.45, explanation: "ESG excludes cheap sectors (energy, utilities, tobacco)" },
                  ].map((f) => (
                    <div key={f.factor}>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-muted-foreground font-medium">{f.factor}</span>
                        <span className={`font-medium ${f.correlation > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {f.correlation > 0 ? "+" : ""}{f.correlation.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.abs(f.correlation) * 100}%`,
                            background: f.correlation > 0 ? "#10b981" : "#ef4444",
                          }}
                        />
                      </div>
                      <div className="text-muted-foreground text-[11px]">{f.explanation}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
