"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Satellite,
  CreditCard,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  DollarSign,
  Eye,
  Layers,
  Search,
  FileText,
  BarChart2,
  Shield,
  MapPin,
  Cpu,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 942;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const _sv = () => _vals[_vi++ % _vals.length];
void _sv;

// ── Alt Data Market Size Chart ─────────────────────────────────────────────────
const MARKET_SIZE_DATA: { year: string; size: number }[] = [
  { year: "2019", size: 2.0 },
  { year: "2020", size: 3.0 },
  { year: "2021", size: 4.5 },
  { year: "2022", size: 6.0 },
  { year: "2023", size: 7.0 },
  { year: "2024", size: 10.0 },
  { year: "2025", size: 13.5 },
  { year: "2027", size: 17.0 },
];

function MarketSizeChart() {
  const W = 480;
  const H = 160;
  const PAD = { l: 44, r: 16, t: 16, b: 32 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxV = 18;
  const toX = (i: number) => PAD.l + (i / (MARKET_SIZE_DATA.length - 1)) * chartW;
  const toY = (v: number) => PAD.t + chartH - (v / maxV) * chartH;
  const pts = MARKET_SIZE_DATA.map((d, i) => `${toX(i)},${toY(d.size)}`).join(" ");
  const area = [
    `${toX(0)},${PAD.t + chartH}`,
    ...MARKET_SIZE_DATA.map((d, i) => `${toX(i)},${toY(d.size)}`),
    `${toX(MARKET_SIZE_DATA.length - 1)},${PAD.t + chartH}`,
  ].join(" ");
  const gridVals = [0, 5, 10, 15, 18];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <defs>
        <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridVals.map((v) => (
        <line key={`gl-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {gridVals.map((v) => (
        <text key={`gy-${v}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">
          {`$${v}B`}
        </text>
      ))}
      <polygon points={area} fill="url(#altGrad)" />
      <polyline points={pts} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinejoin="round" />
      {MARKET_SIZE_DATA.map((d, i) => (
        <circle key={`dot-${i}`} cx={toX(i)} cy={toY(d.size)} r="3" fill="#818cf8" />
      ))}
      {MARKET_SIZE_DATA.map((d, i) => (
        <text key={`xl-${i}`} x={toX(i)} y={H - 4} fill="#71717a" fontSize="9" textAnchor="middle">
          {d.year}
        </text>
      ))}
      {MARKET_SIZE_DATA.map((d, i) => (
        <text key={`pl-${i}`} x={toX(i)} y={toY(d.size) - 6} fill="#a1a1aa" fontSize="8" textAnchor="middle">
          {`$${d.size}B`}
        </text>
      ))}
    </svg>
  );
}

// ── Alpha Decay Chart ─────────────────────────────────────────────────────────
function AlphaDecayChart() {
  const W = 480;
  const H = 160;
  const PAD = { l: 44, r: 16, t: 16, b: 32 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const halfLife = 12;
  const months = Array.from({ length: 25 }, (_, i) => i);
  const decay = (m: number) => 100 * Math.pow(0.5, m / halfLife);
  const toX = (m: number) => PAD.l + (m / 24) * chartW;
  const toY = (v: number) => PAD.t + chartH - (v / 100) * chartH;
  const pts = months.map((m) => `${toX(m)},${toY(decay(m))}`).join(" ");
  const area = [
    `${toX(0)},${PAD.t + chartH}`,
    ...months.map((m) => `${toX(m)},${toY(decay(m))}`),
    `${toX(24)},${PAD.t + chartH}`,
  ].join(" ");
  const gridY = [0, 25, 50, 75, 100];
  const gridX = [0, 6, 12, 18, 24];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <defs>
        <linearGradient id="decayGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f87171" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridY.map((v) => (
        <line key={`dgl-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {gridY.map((v) => (
        <text key={`dgy-${v}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">
          {v}%
        </text>
      ))}
      {gridX.map((m) => (
        <text key={`dgx-${m}`} x={toX(m)} y={H - 4} fill="#71717a" fontSize="9" textAnchor="middle">
          {m}m
        </text>
      ))}
      <polygon points={area} fill="url(#decayGrad)" />
      <polyline points={pts} fill="none" stroke="#f87171" strokeWidth="2" strokeLinejoin="round" />
      <line
        x1={toX(12)}
        x2={toX(12)}
        y1={toY(0)}
        y2={toY(100)}
        stroke="#f59e0b"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <text x={toX(12) + 4} y={toY(55)} fill="#f59e0b" fontSize="9">
        50% at 12m
      </text>
    </svg>
  );
}

// ── Signal Pipeline SVG ────────────────────────────────────────────────────────
function SignalPipelineSVG() {
  const steps: { label: string; color: string }[] = [
    { label: "Raw Data", color: "#818cf8" },
    { label: "Cleaning", color: "#60a5fa" },
    { label: "Features", color: "#34d399" },
    { label: "Backtest", color: "#f59e0b" },
    { label: "Paper", color: "#fb923c" },
    { label: "Live", color: "#f87171" },
  ];
  const W = 480;
  const H = 80;
  const boxW = 64;
  const boxH = 36;
  const gap = (W - steps.length * boxW) / (steps.length + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#3f3f46" />
        </marker>
      </defs>
      {steps.map((step, i) => {
        const x = gap + i * (boxW + gap);
        const cy = H / 2;
        return (
          <g key={`step-${i}`}>
            {i > 0 && (
              <line
                x1={x - gap + 2}
                x2={x - 4}
                y1={cy}
                y2={cy}
                stroke="#3f3f46"
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />
            )}
            <rect
              x={x}
              y={cy - boxH / 2}
              width={boxW}
              height={boxH}
              rx="6"
              fill={step.color + "22"}
              stroke={step.color}
              strokeWidth="1.5"
            />
            <text
              x={x + boxW / 2}
              y={cy + 5}
              fill={step.color}
              fontSize="10"
              textAnchor="middle"
              fontWeight="600"
            >
              {step.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Alt Data Taxonomy SVG ──────────────────────────────────────────────────────
function TaxonomySVG() {
  const W = 480;
  const H = 200;
  const cx = W / 2;
  const cy = H / 2;
  const r1 = 36;
  const r2 = 70;
  const categories: { label: string; color: string; angle: number; examples: string[] }[] = [
    { label: "People", color: "#818cf8", angle: -90, examples: ["Social media", "Job postings", "Reviews"] },
    { label: "Processes", color: "#34d399", angle: 0, examples: ["Transactions", "Shipping", "Patents"] },
    { label: "Sensors", color: "#f59e0b", angle: 90, examples: ["Satellite", "Weather", "AIS"] },
    { label: "Other", color: "#f87171", angle: 180, examples: ["NLP filings", "Web scrape", "Geoloc."] },
  ];
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
      <circle cx={cx} cy={cy} r={r1} fill="#1c1c22" stroke="#3f3f46" strokeWidth="1.5" />
      <text x={cx} y={cy - 5} fill="#e4e4e7" fontSize="10" textAnchor="middle" fontWeight="700">Alt</text>
      <text x={cx} y={cy + 8} fill="#e4e4e7" fontSize="10" textAnchor="middle" fontWeight="700">Data</text>
      {categories.map((cat, i) => {
        const rad = toRad(cat.angle);
        const tx = cx + Math.cos(rad) * r2;
        const ty = cy + Math.sin(rad) * r2;
        const lx = cx + Math.cos(rad) * (r2 + 44);
        const ly = cy + Math.sin(rad) * (r2 + 44);
        const anchor =
          cat.angle === 0 ? "start" : cat.angle === 180 ? "end" : "middle";
        return (
          <g key={`cat-${i}`}>
            <line
              x1={cx + Math.cos(rad) * r1}
              y1={cy + Math.sin(rad) * r1}
              x2={tx - Math.cos(rad) * 20}
              y2={ty - Math.sin(rad) * 20}
              stroke={cat.color}
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <circle cx={tx} cy={ty} r="20" fill={cat.color + "22"} stroke={cat.color} strokeWidth="1.5" />
            <text x={tx} y={ty + 4} fill={cat.color} fontSize="9" textAnchor="middle" fontWeight="700">
              {cat.label}
            </text>
            {cat.examples.map((ex, j) => (
              <text
                key={`ex-${i}-${j}`}
                x={lx}
                y={ly - 12 + j * 12}
                fill="#71717a"
                fontSize="8"
                textAnchor={anchor}
              >
                {ex}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface AltDataCategory {
  icon: React.ReactNode;
  name: string;
  color: string;
  examples: string[];
  leadTime: string;
  costRange: string;
  exclusivity: "High" | "Medium" | "Low";
}

interface SatelliteSignal {
  name: string;
  asset: string;
  signal: string;
  strength: number;
  latency: string;
}

interface ConsumerSignal {
  source: string;
  metric: string;
  investmentImplication: string;
  reliability: "High" | "Medium" | "Low";
  coverage: string;
}

interface PipelineStage {
  stage: string;
  description: string;
  tools: string[];
  pitfall: string;
}

// ── Data ───────────────────────────────────────────────────────────────────────
const ALT_DATA_CATEGORIES: AltDataCategory[] = [
  {
    icon: <Satellite className="w-4 h-4" />,
    name: "Satellite Imagery",
    color: "#818cf8",
    examples: ["Retail parking lot counts", "Oil storage tank levels", "Crop yield estimates", "Construction activity"],
    leadTime: "2–6 weeks ahead",
    costRange: "$200K–$2M/yr",
    exclusivity: "High",
  },
  {
    icon: <CreditCard className="w-4 h-4" />,
    name: "Credit Card Data",
    color: "#34d399",
    examples: ["Consumer spending by merchant", "Category spend trends", "Wallet share shifts", "Geographic breakdowns"],
    leadTime: "1–4 weeks ahead",
    costRange: "$150K–$800K/yr",
    exclusivity: "Medium",
  },
  {
    icon: <Globe className="w-4 h-4" />,
    name: "Web Scraping",
    color: "#60a5fa",
    examples: ["Price tracking", "Product inventory", "Job posting counts", "Review sentiment"],
    leadTime: "Real-time to 2 weeks",
    costRange: "$50K–$300K/yr",
    exclusivity: "Low",
  },
  {
    icon: <Search className="w-4 h-4" />,
    name: "Job Postings",
    color: "#f59e0b",
    examples: ["Hiring velocity by role", "Tech stack signals", "Layoff signals (closures)", "Geographic expansion"],
    leadTime: "1–3 months ahead",
    costRange: "$100K–$500K/yr",
    exclusivity: "Low",
  },
  {
    icon: <Activity className="w-4 h-4" />,
    name: "Shipping & Trade",
    color: "#fb923c",
    examples: ["Container port volumes", "AIS ship tracking", "Air cargo manifests", "Supply chain bottlenecks"],
    leadTime: "3–8 weeks ahead",
    costRange: "$100K–$600K/yr",
    exclusivity: "Medium",
  },
  {
    icon: <BarChart2 className="w-4 h-4" />,
    name: "NLP Sentiment",
    color: "#f472b6",
    examples: ["Earnings call tone", "10-K readability", "Twitter sentiment", "Reddit discussion volume"],
    leadTime: "Real-time to 1 week",
    costRange: "$50K–$400K/yr",
    exclusivity: "Low",
  },
  {
    icon: <MapPin className="w-4 h-4" />,
    name: "Geolocation",
    color: "#a78bfa",
    examples: ["Foot traffic to stores", "Office occupancy rates", "Cross-shopping patterns", "Restaurant visits"],
    leadTime: "1–4 weeks ahead",
    costRange: "$100K–$700K/yr",
    exclusivity: "Medium",
  },
  {
    icon: <Layers className="w-4 h-4" />,
    name: "Supply Chain",
    color: "#2dd4bf",
    examples: ["Supplier relationships", "Component lead times", "Factory output proxies", "Port dwell times"],
    leadTime: "1–6 months ahead",
    costRange: "$150K–$1M/yr",
    exclusivity: "High",
  },
];

const SATELLITE_SIGNALS: SatelliteSignal[] = [
  { name: "Retail Parking Lot Cars", asset: "WMT, TGT, COST", signal: "Consumer demand proxy", strength: 84, latency: "Weekly" },
  { name: "Crude Oil Tank Shadow", asset: "XOM, CVX, OIL", signal: "Inventory estimation", strength: 91, latency: "Daily" },
  { name: "Shipping Container Count", asset: "FDX, UPS, DAL", signal: "Trade volume leading indicator", strength: 76, latency: "Weekly" },
  { name: "Crop Field NDVI Index", asset: "ADM, BG, MON", signal: "Yield forecast 2–3mo ahead", strength: 88, latency: "Bi-weekly" },
  { name: "Night Lights Intensity", asset: "Country ETFs", signal: "GDP activity proxy", strength: 72, latency: "Monthly" },
  { name: "Industrial Site Activity", asset: "Steel/Mining ETFs", signal: "Capex & output signals", strength: 80, latency: "Weekly" },
  { name: "Forest Cover Loss (SAR)", asset: "Paper/Ag ETFs", signal: "ESG risk early warning", strength: 68, latency: "Monthly" },
  { name: "Maritime AIS Vessel Flows", asset: "Tanker stocks, LNG", signal: "Energy/oil flow volumes", strength: 87, latency: "Real-time" },
];

const CONSUMER_SIGNALS: ConsumerSignal[] = [
  {
    source: "Credit Card Transactions",
    metric: "Same-store spending growth",
    investmentImplication: "Beats earnings estimate probability",
    reliability: "High",
    coverage: "~30% US consumers",
  },
  {
    source: "App Download Data",
    metric: "Weekly installs + DAU",
    investmentImplication: "User growth ahead of revenue report",
    reliability: "High",
    coverage: "iOS + Android tracked",
  },
  {
    source: "Web Traffic (SimilarWeb)",
    metric: "Visits, bounce rate, session duration",
    investmentImplication: "Competitive share shifts",
    reliability: "Medium",
    coverage: "Desktop + mobile",
  },
  {
    source: "Job Postings (LinkedIn/Indeed)",
    metric: "Open roles by function",
    investmentImplication: "Growth: hiring up; stress: hiring freeze",
    reliability: "High",
    coverage: "100M+ postings/yr",
  },
  {
    source: "Reddit/StockTwits NLP",
    metric: "Mention volume + sentiment score",
    investmentImplication: "Short-term momentum / meme stock risk",
    reliability: "Low",
    coverage: "Retail focused",
  },
  {
    source: "Earnings Call NLP",
    metric: "Positive/negative tone shift, hedge words",
    investmentImplication: "Guidance credibility signal",
    reliability: "Medium",
    coverage: "All public cos",
  },
  {
    source: "10-K Readability (Fog Index)",
    metric: "Change in reading complexity YoY",
    investmentImplication: "Complexity increase = hidden bad news",
    reliability: "Medium",
    coverage: "SEC EDGAR",
  },
  {
    source: "Amazon Review Sentiment",
    metric: "Star rating trend + keyword NLP",
    investmentImplication: "Product quality signal before earnings",
    reliability: "Medium",
    coverage: "Product-level",
  },
  {
    source: "Glassdoor Culture Score",
    metric: "CEO approval + morale rating",
    investmentImplication: "Talent retention & exec credibility",
    reliability: "Low",
    coverage: "Employee-reported",
  },
  {
    source: "Patent Filings (USPTO)",
    metric: "Innovation velocity by category",
    investmentImplication: "R&D pipeline depth, future moat",
    reliability: "High",
    coverage: "All US patents",
  },
];

const PIPELINE_STAGES: PipelineStage[] = [
  {
    stage: "Raw Data Ingestion",
    description: "Acquire data from vendor APIs, SFTP drops, or web feeds. Establish SLA for delivery.",
    tools: ["Python requests", "AWS S3", "Airflow DAGs"],
    pitfall: "Vendor data gaps and delivery delays cause silent NA injection",
  },
  {
    stage: "Cleaning & Normalization",
    description: "Handle missing values, outlier winsorization, timezone alignment, corporate actions.",
    tools: ["pandas", "dbt", "Great Expectations"],
    pitfall: "Look-ahead bias — using revised data available only after the fact",
  },
  {
    stage: "Feature Engineering",
    description: "Construct signals: z-scores, rank transforms, cross-sectional standardization.",
    tools: ["polars", "NumPy", "scikit-learn"],
    pitfall: "Overfitting in feature selection; use walk-forward CV only",
  },
  {
    stage: "Backtesting",
    description: "Transaction costs, slippage, capacity constraints, realistic fill assumptions.",
    tools: ["Backtrader", "Zipline-reloaded", "custom event-driven"],
    pitfall: "Survivorship bias in universe; use point-in-time constituents",
  },
  {
    stage: "Paper Trading",
    description: "Live signal generation without real capital. Monitor IC vs backtest predictions.",
    tools: ["Alpaca sandbox", "custom OMS", "monitoring dashboards"],
    pitfall: "IC decay faster than expected — crowding or data deterioration",
  },
  {
    stage: "Live Deployment",
    description: "Risk-sized positions, continuous monitoring, circuit breakers for signal anomalies.",
    tools: ["Snowflake", "Databricks", "live risk system"],
    pitfall: "Regime change invalidates model — requires ongoing retraining cadence",
  },
];

// ── Tab 1: Alt Data Categories ─────────────────────────────────────────────────
function AltDataCategoriesTab() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const compliancePoints: { label: string; text: string }[] = [
    {
      label: "GDPR Article 6",
      text: "Legitimate basis required for EU resident data — anonymization mandatory",
    },
    {
      label: "CCPA",
      text: "California consumers can opt out of data sale; scrapers must honor robots.txt",
    },
    {
      label: "SEC Reg FD",
      text: "Material non-public information from data must not constitute insider trading",
    },
    {
      label: "Data Provenance",
      text: "Full chain of custody: collection → processing → licensing → use must be documented",
    },
    {
      label: "Selection Bias",
      text: "Credit card panels skew to card users; foot traffic skews to smartphone owners",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Alt Data Taxonomy — Four Source Pillars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaxonomySVG />
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Alt Data Market Size — $7B (2023) to $17B (2027E)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MarketSizeChart />
          <p className="text-xs text-muted-foreground mt-1">
            Source: FactSet, Opimas Research estimates. CAGR ~24%.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ALT_DATA_CATEGORIES.map((cat, i) => (
          <motion.div
            key={`cat-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="bg-card/60 border-border cursor-pointer hover:border-border transition-colors"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ color: cat.color }}>{cat.icon}</span>
                    <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: cat.color + "66", color: cat.color }}
                    >
                      {cat.exclusivity} excl.
                    </Badge>
                    {expanded === i ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>
                            Lead time:{" "}
                            <span className="text-foreground">{cat.leadTime}</span>
                          </span>
                          <span>
                            Cost:{" "}
                            <span className="text-foreground">{cat.costRange}</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cat.examples.map((ex, j) => (
                            <Badge
                              key={`ex-${i}-${j}`}
                              variant="secondary"
                              className="text-xs bg-muted text-muted-foreground"
                            >
                              {ex}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Compliance, GDPR/CCPA & Data Provenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {compliancePoints.map((pt, i) => (
            <div key={`cp-${i}`} className="flex gap-3 items-start">
              <Badge
                variant="outline"
                className="text-xs border-amber-500/40 text-amber-400 shrink-0 mt-0.5"
              >
                {pt.label}
              </Badge>
              <p className="text-xs text-muted-foreground">{pt.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 2: Satellite & Physical Data ──────────────────────────────────────────
function SatelliteTab() {
  const sarVsOptical: { aspect: string; sar: boolean; optical: boolean }[] = [
    { aspect: "Works in clouds", sar: true, optical: false },
    { aspect: "Night-time imaging", sar: true, optical: false },
    { aspect: "Natural color view", sar: false, optical: true },
    { aspect: "Change detection", sar: true, optical: true },
    { aspect: "Flood/disaster mapping", sar: true, optical: false },
    { aspect: "Vegetation indices", sar: false, optical: true },
    { aspect: "Oil spill detection", sar: true, optical: true },
    { aspect: "Building footprints", sar: false, optical: true },
  ];

  const esgUseCases: { icon: string; title: string; desc: string }[] = [
    {
      icon: "tree",
      title: "Deforestation",
      desc: "Amazon/SE Asia deforestation rate from SAR + optical fusion",
    },
    {
      icon: "wind",
      title: "GHG Emissions",
      desc: "Methane plume detection from oil fields via hyperspectral",
    },
    {
      icon: "factory",
      title: "Factory Output",
      desc: "Industrial smoke stack activity as production proxy",
    },
    {
      icon: "waves",
      title: "Flood Resilience",
      desc: "Physical risk assessment for real estate/infra portfolios",
    },
  ];

  const statChips: { icon: React.ReactNode; label: string; value: string; color: string }[] = [
    { icon: <Eye className="w-5 h-5" />, label: "Satellite revisit", value: "Daily", color: "#818cf8" },
    { icon: <Activity className="w-5 h-5" />, label: "AIS tracking", value: "Real-time", color: "#34d399" },
    { icon: <Globe className="w-5 h-5" />, label: "Active satellites", value: "700+", color: "#60a5fa" },
    { icon: <TrendingUp className="w-5 h-5" />, label: "IC vs earnings", value: "0.08–0.15", color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statChips.map((stat, i) => (
          <Card key={`ss-${i}`} className="bg-card/60 border-border">
            <CardContent className="pt-3 pb-3 text-center">
              <span style={{ color: stat.color }} className="inline-flex justify-center mb-1">
                {stat.icon}
              </span>
              <div className="text-lg font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Satellite Investment Signals — Strength & Latency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SATELLITE_SIGNALS.map((sig, i) => (
            <div key={`satsig-${i}`} className="flex items-center gap-3">
              <div className="w-44 shrink-0">
                <div className="text-xs text-muted-foreground font-medium">{sig.name}</div>
                <div className="text-xs text-muted-foreground">{sig.asset}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor:
                          sig.strength >= 85
                            ? "#34d399"
                            : sig.strength >= 75
                            ? "#f59e0b"
                            : "#818cf8",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${sig.strength}%` }}
                      transition={{ delay: i * 0.06, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-7 shrink-0">{sig.strength}</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-xs border-border text-muted-foreground shrink-0 w-20 justify-center"
              >
                {sig.latency}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">SAR vs Optical Imagery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Capability</th>
                  <th className="text-center py-2 text-indigo-400 font-medium">SAR (Radar)</th>
                  <th className="text-center py-2 text-amber-400 font-medium">Optical</th>
                </tr>
              </thead>
              <tbody>
                {sarVsOptical.map((row, i) => (
                  <tr key={`sar-${i}`} className="border-b border-border/50">
                    <td className="py-1.5 text-muted-foreground">{row.aspect}</td>
                    <td className="py-1.5 text-center">
                      {row.sar ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 inline" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-1.5 text-center">
                      {row.optical ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 inline" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            ESG Monitoring via Satellite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {esgUseCases.map((uc, i) => (
              <div key={`esg-${i}`} className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs font-semibold text-foreground mb-1">{uc.title}</div>
                <div className="text-xs text-muted-foreground">{uc.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Providers: Planet Labs (daily 3m imagery), Orbital Insight (AI analysis), Maxar
            (high-resolution), Satellogic (hyperspectral).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: Consumer & Web Data ─────────────────────────────────────────────────
function ConsumerWebTab() {
  const reliabilityColor = (r: ConsumerSignal["reliability"]) =>
    r === "High"
      ? "text-emerald-400 border-emerald-500/40"
      : r === "Medium"
      ? "text-amber-400 border-amber-500/40"
      : "text-red-400 border-red-500/40";

  const nlpConcepts: { term: string; desc: string }[] = [
    {
      term: "Tone Analysis",
      desc: "CFO uses more hedging words ('may', 'could') — negative signal detected by NLP sentiment models",
    },
    {
      term: "Key Phrase Extraction",
      desc: "Emerging term frequency ('tariff', 'inventory build') signals to watch before earnings",
    },
    {
      term: "Gunning Fog Index",
      desc: "10-K readability score increase YoY historically correlates with upcoming earnings miss",
    },
    {
      term: "Named Entity Recognition",
      desc: "Identify customer/partner references in transcripts to map supply chain dependencies",
    },
    {
      term: "Similarity Distance",
      desc: "Cosine similarity between consecutive 10-Ks detects boilerplate swaps that hide material changes",
    },
  ];

  const statChips: { label: string; value: string; color: string }[] = [
    { label: "CC transaction panels", value: "~$8T/yr", color: "#34d399" },
    { label: "NLP docs processed/day", value: "50K+", color: "#818cf8" },
    { label: "Avg signal IC (NLP)", value: "0.04–0.08", color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {statChips.map((stat, i) => (
          <Card key={`cs-${i}`} className="bg-card/60 border-border">
            <CardContent className="pt-3 pb-3 text-center">
              <div className="text-lg font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Consumer & Web Signal Taxonomy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {CONSUMER_SIGNALS.map((sig, i) => (
            <div key={`csig-${i}`} className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-foreground">{sig.source}</span>
                <Badge
                  variant="outline"
                  className={cn("text-xs", reliabilityColor(sig.reliability))}
                >
                  {sig.reliability}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                <span className="text-muted-foreground">Metric: </span>
                {sig.metric}
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                <span className="text-muted-foreground">Edge: </span>
                {sig.investmentImplication}
              </div>
              <div className="text-xs text-muted-foreground">Coverage: {sig.coverage}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            NLP on SEC Filings & Earnings Calls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {nlpConcepts.map((concept, i) => (
            <div key={`nlp-${i}`} className="flex gap-3 items-start">
              <Badge
                variant="outline"
                className="text-xs border-indigo-500/40 text-indigo-400 shrink-0 mt-0.5"
              >
                {concept.term}
              </Badge>
              <p className="text-xs text-muted-foreground">{concept.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 4: Building Alt Data Edge ──────────────────────────────────────────────
function BuildingEdgeTab() {
  const [openStage, setOpenStage] = useState<number | null>(null);

  const buyVsBuild: { factor: string; buy: string; build: string }[] = [
    { factor: "Speed to alpha", buy: "Faster — data ready", build: "Slower — infra + scraping" },
    { factor: "Differentiation", buy: "Lower — shared dataset", build: "Higher — unique signal" },
    { factor: "Cost (Year 1)", buy: "$50K–$2M licensing", build: "$100K–$500K eng cost" },
    { factor: "Data quality", buy: "Vendor-managed", build: "Self-managed QA" },
    { factor: "IP ownership", buy: "Vendor retains", build: "Firm owns fully" },
    { factor: "Compliance risk", buy: "Vendor handles", build: "Firm liability" },
  ];

  const riskWarnings: { icon: React.ReactNode; text: string }[] = [
    {
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
      text: "Crowding Risk: When >50 hedge funds use the same credit card dataset, alpha decays to near-zero within 6 months of widespread adoption.",
    },
    {
      icon: <Shield className="w-4 h-4 text-red-400 shrink-0" />,
      text: "Regulatory Risk: SEC has prosecuted alt data misuse when data constitutes MNPI — e.g., prescriptions data case vs. research firm in 2021.",
    },
    {
      icon: <Activity className="w-4 h-4 text-amber-400 shrink-0" />,
      text: "IC Decay: Average alt data IC decays 50% within 12 months as market microstructure adapts. Continuous refresh needed.",
    },
    {
      icon: <Users className="w-4 h-4 text-primary shrink-0" />,
      text: "Academic-to-Production Gap: Academic papers use survivorship-free data; production pipelines face universe changes, revised data, and capacity constraints.",
    },
  ];

  const icMetrics: { metric: string; value: string; label: string }[] = [
    { metric: "IC (single signal)", value: "0.04–0.12", label: "Information Coefficient; >0.05 considered good" },
    { metric: "IC after crowding", value: "0.01–0.03", label: "Decays sharply as adoption spreads" },
    { metric: "Ensemble IC boost", value: "+30–50%", label: "Combining 3+ uncorrelated signals" },
    { metric: "Typical backtest SR", value: "1.2–2.5", label: "Sharpe Ratio before real-world costs" },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Signal Extraction Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <SignalPipelineSVG />
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Alpha Decay Curve — 12-Month Half-Life
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlphaDecayChart />
          <p className="text-xs text-muted-foreground mt-1">
            Alpha from alt data signals decays exponentially as crowding and market adaptation erodes
            edge. Typical half-life: 6–18 months.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Pipeline Stages — Click to Expand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PIPELINE_STAGES.map((stage, i) => (
            <div
              key={`ps-${i}`}
              className="border border-border rounded-lg overflow-hidden cursor-pointer hover:border-border transition-colors"
              onClick={() => setOpenStage(openStage === i ? null : i)}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{stage.stage}</span>
                </div>
                {openStage === i ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <AnimatePresence>
                {openStage === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mt-2">{stage.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {stage.tools.map((tool, j) => (
                          <Badge
                            key={`tool-${i}-${j}`}
                            variant="secondary"
                            className="text-xs bg-muted text-muted-foreground"
                          >
                            {tool}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-start gap-2 bg-amber-500/10 rounded p-2">
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-amber-300">{stage.pitfall}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Buy vs Build — Vendor Decision Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Factor</th>
                  <th className="text-center py-2 text-emerald-400 font-medium">Buy Vendor</th>
                  <th className="text-center py-2 text-indigo-400 font-medium">Build In-House</th>
                </tr>
              </thead>
              <tbody>
                {buyVsBuild.map((row, i) => (
                  <tr key={`bvb-${i}`} className="border-b border-border/50">
                    <td className="py-1.5 text-muted-foreground">{row.factor}</td>
                    <td className="py-1.5 text-center text-muted-foreground">{row.buy}</td>
                    <td className="py-1.5 text-center text-muted-foreground">{row.build}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Data ops stack: Snowflake (storage/query), dbt (transformation), Airflow
            (orchestration), Databricks (ML workloads).
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            IC, Crowding, and Ensemble Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {icMetrics.map((m, i) => (
              <div key={`icm-${i}`} className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">{m.metric}</div>
                <div className="text-sm font-medium text-primary">{m.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border border-amber-900/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Key Risk Warnings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {riskWarnings.map((w, i) => (
            <div key={`rw-${i}`} className="flex items-start gap-3">
              {w.icon}
              <p className="text-xs text-muted-foreground">{w.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AltDataPage() {
  const headerChips: { label: string; value: string; color: string }[] = [
    { label: "Market Size 2027E", value: "$17B", color: "bg-indigo-500/20 text-indigo-400" },
    { label: "Avg Data Cost", value: "$50K–$2M/yr", color: "bg-emerald-500/20 text-emerald-400" },
    { label: "Lead Time Edge", value: "Weeks–Months", color: "bg-amber-500/20 text-amber-400" },
    { label: "IC Half-Life", value: "~12 months", color: "bg-red-500/20 text-red-400" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HERO Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border-l-4 border-l-primary rounded-md bg-card p-6"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Database className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Alternative Data in Investing</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Satellite imagery, credit card transactions, NLP on filings, geolocation, and the
                full alt data ecosystem.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {headerChips.map((chip, i) => (
              <div
                key={`chip-${i}`}
                className={cn("px-3 py-1 rounded-full text-xs font-medium", chip.color)}
              >
                {chip.label}: <span className="font-medium">{chip.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="mt-8" />

        {/* Tabs */}
        <Tabs defaultValue="categories">
          <TabsList className="grid grid-cols-4 bg-card border border-border w-full">
            <TabsTrigger
              value="categories"
              className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              Alt Data Categories
            </TabsTrigger>
            <TabsTrigger
              value="satellite"
              className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              Satellite & Physical
            </TabsTrigger>
            <TabsTrigger
              value="consumer"
              className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              Consumer & Web
            </TabsTrigger>
            <TabsTrigger
              value="edge"
              className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              Building Edge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-4 data-[state=inactive]:hidden">
            <AltDataCategoriesTab />
          </TabsContent>
          <TabsContent value="satellite" className="mt-4 data-[state=inactive]:hidden">
            <SatelliteTab />
          </TabsContent>
          <TabsContent value="consumer" className="mt-4 data-[state=inactive]:hidden">
            <ConsumerWebTab />
          </TabsContent>
          <TabsContent value="edge" className="mt-4 data-[state=inactive]:hidden">
            <BuildingEdgeTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
