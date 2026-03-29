"use client";

import { useState, useMemo } from "react";
import {
  Scissors,
  TrendingUp,
  TrendingDown,
  Calculator,
  BarChart2,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  DollarSign,
  Clock,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 864;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Reset seed for deterministic generation
function resetSeed() {
  s = 864;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface SpinoffRecord {
  parent: string;
  parentTicker: string;
  spinoff: string;
  spinoffTicker: string;
  year: number;
  reason: string;
  parent1Y: number;
  spinoff1Y: number;
  parent3Y: number;
  spinoff3Y: number;
  sp500_1Y: number;
  sp500_3Y: number;
}

interface Segment {
  name: string;
  revenue: number;
  ebitdaMargin: number;
  evMultiple: number;
}

// ── Historical Spinoffs Data ───────────────────────────────────────────────────

const HISTORICAL_SPINOFFS: SpinoffRecord[] = [
  {
    parent: "eBay",
    parentTicker: "EBAY",
    spinoff: "PayPal",
    spinoffTicker: "PYPL",
    year: 2015,
    reason: "Payment tech deserved independent valuation",
    parent1Y: 12.4,
    spinoff1Y: 38.2,
    parent3Y: 22.1,
    spinoff3Y: 141.5,
    sp500_1Y: 14.3,
    sp500_3Y: 38.7,
  },
  {
    parent: "Abbott Labs",
    parentTicker: "ABT",
    spinoff: "AbbVie",
    spinoffTicker: "ABBV",
    year: 2013,
    reason: "Separate pharma R&D from medical devices",
    parent1Y: 18.2,
    spinoff1Y: 51.6,
    parent3Y: 44.3,
    spinoff3Y: 88.2,
    sp500_1Y: 32.1,
    sp500_3Y: 57.4,
  },
  {
    parent: "Pfizer",
    parentTicker: "PFE",
    spinoff: "Zoetis",
    spinoffTicker: "ZTS",
    year: 2013,
    reason: "Animal health unit had distinct growth profile",
    parent1Y: 26.3,
    spinoff1Y: 44.8,
    parent3Y: 31.2,
    spinoff3Y: 119.7,
    sp500_1Y: 32.1,
    sp500_3Y: 57.4,
  },
  {
    parent: "Hewlett-Packard",
    parentTicker: "HPQ",
    spinoff: "HP Enterprise",
    spinoffTicker: "HPE",
    year: 2015,
    reason: "PC/printing vs enterprise services split",
    parent1Y: -19.4,
    spinoff1Y: -26.1,
    parent3Y: 48.2,
    spinoff3Y: 12.4,
    sp500_1Y: 14.3,
    sp500_3Y: 38.7,
  },
  {
    parent: "Baxter Int'l",
    parentTicker: "BAX",
    spinoff: "Baxalta",
    spinoffTicker: "BXLT",
    year: 2015,
    reason: "Bioscience separation to unlock value",
    parent1Y: 8.7,
    spinoff1Y: 42.3,
    parent3Y: 28.4,
    spinoff3Y: 52.1,
    sp500_1Y: 14.3,
    sp500_3Y: 38.7,
  },
  {
    parent: "Marathon Oil",
    parentTicker: "MRO",
    spinoff: "Marathon Petroleum",
    spinoffTicker: "MPC",
    year: 2011,
    reason: "Upstream E&P vs downstream refining",
    parent1Y: 14.2,
    spinoff1Y: 62.8,
    parent3Y: -8.3,
    spinoff3Y: 114.6,
    sp500_1Y: 2.1,
    sp500_3Y: 36.2,
  },
  {
    parent: "ConocoPhillips",
    parentTicker: "COP",
    spinoff: "Phillips 66",
    spinoffTicker: "PSX",
    year: 2012,
    reason: "E&P focus; refining/chemicals independent",
    parent1Y: 21.3,
    spinoff1Y: 78.4,
    parent3Y: 12.6,
    spinoff3Y: 131.2,
    sp500_1Y: 16.0,
    sp500_3Y: 52.4,
  },
  {
    parent: "Motorola Solutions",
    parentTicker: "MSI",
    spinoff: "Motorola Mobility",
    spinoffTicker: "MMI",
    year: 2011,
    reason: "Enterprise tech vs consumer devices",
    parent1Y: 33.8,
    spinoff1Y: 24.1,
    parent3Y: 88.4,
    spinoff3Y: 18.3,
    sp500_1Y: 2.1,
    sp500_3Y: 36.2,
  },
  {
    parent: "Tyco Int'l",
    parentTicker: "TYC",
    spinoff: "ADT Inc.",
    spinoffTicker: "ADT",
    year: 2012,
    reason: "Security services standalone growth story",
    parent1Y: 15.4,
    spinoff1Y: 28.7,
    parent3Y: 42.1,
    spinoff3Y: -12.4,
    sp500_1Y: 16.0,
    sp500_3Y: 52.4,
  },
  {
    parent: "Time Warner",
    parentTicker: "TWX",
    spinoff: "Time Inc.",
    spinoffTicker: "TIME",
    year: 2014,
    reason: "Print media separated from content/cable",
    parent1Y: 18.3,
    spinoff1Y: -14.6,
    parent3Y: 44.8,
    spinoff3Y: -38.2,
    sp500_1Y: 13.7,
    sp500_3Y: 35.6,
  },
];

// ── Default Segments ──────────────────────────────────────────────────────────

const DEFAULT_SEGMENTS: Segment[] = [
  { name: "Consumer Products", revenue: 4200, ebitdaMargin: 22, evMultiple: 14 },
  { name: "Industrial", revenue: 2800, ebitdaMargin: 18, evMultiple: 11 },
  { name: "Healthcare", revenue: 1900, ebitdaMargin: 31, evMultiple: 18 },
  { name: "Technology", revenue: 1100, ebitdaMargin: 28, evMultiple: 22 },
];

const CONGLOMERATE_DISCOUNT = 0.15; // 15% typical discount

// ── Tab 1: Spinoff Mechanics ──────────────────────────────────────────────────

function SpinoffMechanicsTab() {
  const [expandedType, setExpandedType] = useState<string | null>("pure");

  const txTypes = [
    {
      id: "pure",
      label: "Pure Spinoff",
      icon: <Scissors className="w-4 h-4" />,
      color: "text-primary",
      borderColor: "border-primary/40",
      bgColor: "bg-primary/10",
      description:
        "Parent distributes 100% of subsidiary shares to existing shareholders as a dividend. No cash changes hands. Subsidiary becomes fully independent.",
      taxTreatment: "Tax-free under IRC Section 355 if requirements met",
      pros: [
        "Complete separation — full management independence",
        "Tax-free to shareholders under Sec. 355",
        "Removes conglomerate discount immediately",
        "Aligns management incentives (separate equity comp)",
      ],
      cons: [
        "Parent receives no cash proceeds",
        "Subsidiary must be self-funding from day one",
        "Complex legal/compliance requirements",
        "IRS scrutiny if not structured correctly",
      ],
      when: "Largest, most mature units with own cash flow",
      svgColor: "#60a5fa",
    },
    {
      id: "carveout",
      label: "Carve-Out IPO",
      icon: <DollarSign className="w-4 h-4" />,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/40",
      bgColor: "bg-emerald-500/10",
      description:
        "Parent sells a minority stake (typically 15–25%) in subsidiary via IPO. Parent retains majority control. Often precedes a full spinoff.",
      taxTreatment: "Taxable event — IPO proceeds taxed as capital gain",
      pros: [
        "Parent raises cash from IPO proceeds",
        "Creates public market price discovery",
        "Subsidiary gets acquisition currency (stock)",
        "Often first step toward full separation",
      ],
      cons: [
        "Taxable to parent (not Sec. 355 eligible)",
        "Minority shareholders have limited rights",
        "Dual reporting requirements increase overhead",
        "Potential conflicts of interest with parent",
      ],
      when: "When parent needs capital but wants to retain control",
      svgColor: "#34d399",
    },
    {
      id: "tracking",
      label: "Tracking Stock",
      icon: <BarChart2 className="w-4 h-4" />,
      color: "text-amber-400",
      borderColor: "border-amber-500/40",
      bgColor: "bg-amber-500/10",
      description:
        "Parent issues a new class of stock that 'tracks' the performance of a specific business unit. Legal entity remains one company.",
      taxTreatment: "Generally taxable — not a true separation",
      pros: [
        "No legal separation required — simpler structure",
        "Highlights value of underappreciated unit",
        "Parent retains operational control",
        "Lower transaction costs than true spinoff",
      ],
      cons: [
        "No true independence — parent retains control",
        "Complex capital structure confuses investors",
        "Rarely achieves full valuation uplift",
        "Most tracking stocks eventually eliminated",
      ],
      when: "Temporary measure; high-growth unit in slow parent",
      svgColor: "#fbbf24",
    },
  ];

  const section355 = [
    { req: "5-year active business rule", desc: "Both parent and spinoff must have operated active businesses for ≥5 years" },
    { req: "Control immediately before", desc: "Parent must control subsidiary (80%+ vote & value) just before the distribution" },
    { req: "Not a device for dividend", desc: "Transaction cannot be principally to distribute earnings & profits" },
    { req: "Business purpose", desc: "Must have valid corporate business purpose (focus, capital access, etc.)" },
    { req: "Continuity of interest", desc: "Shareholders must continue to hold spinoff shares (no preplanned sale)" },
  ];

  const spinoffReasons = [
    {
      icon: <Target className="w-4 h-4 text-primary" />,
      title: "Conglomerate Discount",
      desc: "Diversified conglomerates often trade at 10–20% below sum-of-parts value. Separating units unlocks this trapped value.",
    },
    {
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      title: "Strategic Focus",
      desc: "Management can fully commit to core competency. Capital allocation improves when not shared across unrelated businesses.",
    },
    {
      icon: <DollarSign className="w-4 h-4 text-amber-400" />,
      title: "Regulatory Pressure",
      desc: "Antitrust regulators may require divestiture. Spinoffs are often cleaner than asset sales from a tax and continuity perspective.",
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
      title: "Valuation Arbitrage",
      desc: "High-growth unit trapped in low-multiple conglomerate. Independent listing attracts sector-specific investors and analysts.",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <h2 className="text-lg font-semibold text-foreground mb-1">Corporate Restructuring Methods</h2>
        <p className="text-sm text-foreground/50">
          Companies separate business units through three primary mechanisms, each with distinct tax, legal, and financial implications.
        </p>
      </div>

      {/* Transaction Types */}
      <div className="space-y-3">
        {txTypes.map((tx) => (
          <div
            key={tx.id}
            className={cn("rounded-md border bg-foreground/5 overflow-hidden", tx.borderColor)}
          >
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setExpandedType(expandedType === tx.id ? null : tx.id)}
            >
              <div className="flex items-center gap-3">
                <span className={tx.color}>{tx.icon}</span>
                <span className="font-semibold text-foreground">{tx.label}</span>
                <span className={cn("text-xs text-muted-foreground px-2 py-0.5 rounded-full border", tx.bgColor, tx.borderColor, tx.color)}>
                  {tx.taxTreatment.split("—")[0].trim()}
                </span>
              </div>
              {expandedType === tx.id ? (
                <ChevronUp className="w-4 h-4 text-foreground/40" />
              ) : (
                <ChevronDown className="w-4 h-4 text-foreground/40" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {expandedType === tx.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-4">
                    {/* SVG Structure Diagram */}
                    <StructureDiagram type={tx.id} color={tx.svgColor} />

                    <p className="text-sm text-foreground/70">{tx.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pros */}
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">Advantages</div>
                        <ul className="space-y-1.5">
                          {tx.pros.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Cons */}
                      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                        <div className="text-xs font-medium text-red-400 uppercase tracking-wide mb-2">Disadvantages</div>
                        <ul className="space-y-1.5">
                          {tx.cons.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-foreground/50">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400 font-medium">Best for:</span>
                      {tx.when}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-foreground/50">
                      <Info className="w-3.5 h-3.5 text-primary" />
                      <span className="text-primary font-medium">Tax:</span>
                      {tx.taxTreatment}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Section 355 Requirements */}
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <h3 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          IRC Section 355 — Tax-Free Spinoff Requirements
        </h3>
        <p className="text-xs text-foreground/50 mb-3">All 5 conditions must be met for shareholders to receive spinoff shares tax-free.</p>
        <div className="space-y-2">
          {section355.map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-foreground/5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs text-emerald-400 shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <div className="text-xs font-medium text-foreground/80">{r.req}</div>
                <div className="text-xs text-foreground/50">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Companies Spin Off */}
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">Why Companies Spin Off Units</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {spinoffReasons.map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-foreground/5 border border-border/50">
              <div className="mt-0.5 shrink-0">{r.icon}</div>
              <div>
                <div className="text-xs font-medium text-foreground/90 mb-0.5">{r.title}</div>
                <div className="text-xs text-foreground/50">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shareholder Distribution */}
      <ShareholderDistributionSVG />
    </div>
  );
}

function StructureDiagram({ type, color }: { type: string; color: string }) {
  const W = 420;
  const H = 110;

  if (type === "pure") {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md" style={{ height: 110 }}>
        {/* Parent */}
        <rect x={10} y={10} width={110} height={40} rx={6} fill={`${color}22`} stroke={color} strokeWidth={1.5} />
        <text x={65} y={25} textAnchor="middle" fill={color} fontSize={10} fontWeight="600">Parent Corp</text>
        <text x={65} y={39} textAnchor="middle" fill={`${color}88`} fontSize={8}>Before Spinoff</text>
        {/* Sub */}
        <rect x={10} y={60} width={110} height={40} rx={6} fill={`${color}22`} stroke={color} strokeWidth={1.5} strokeDasharray="4,3" />
        <text x={65} y={75} textAnchor="middle" fill={color} fontSize={10} fontWeight="600">Subsidiary</text>
        <text x={65} y={89} textAnchor="middle" fill={`${color}88`} fontSize={8}>(100% owned)</text>
        {/* Arrow parent→sub */}
        <line x1={65} y1={50} x2={65} y2={59} stroke={`${color}80`} strokeWidth={1.5} markerEnd={`url(#arr-${type})`} />
        {/* Arrow */}
        <defs>
          <marker id={`arr-${type}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={`${color}80`} />
          </marker>
        </defs>
        {/* Distribution arrow */}
        <line x1={120} y1={80} x2={190} y2={80} stroke={`${color}80`} strokeWidth={1.5} />
        <text x={210} y={74} fill={`${color}cc`} fontSize={9} fontWeight="600">Shares Distributed</text>
        <text x={210} y={86} fill={`${color}88`} fontSize={8}>to existing shareholders</text>
        {/* New independent */}
        <rect x={300} y={60} width={112} height={40} rx={6} fill={`${color}33`} stroke={color} strokeWidth={2} />
        <text x={356} y={75} textAnchor="middle" fill={color} fontSize={10} fontWeight="600">New SpinCo</text>
        <text x={356} y={89} textAnchor="middle" fill={`${color}88`} fontSize={8}>Fully Independent</text>
      </svg>
    );
  }

  if (type === "carveout") {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md" style={{ height: 110 }}>
        <defs>
          <marker id={`arr-${type}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={`${color}80`} />
          </marker>
        </defs>
        <rect x={10} y={35} width={110} height={40} rx={6} fill={`${color}22`} stroke={color} strokeWidth={1.5} />
        <text x={65} y={50} textAnchor="middle" fill={color} fontSize={10} fontWeight="600">Parent Corp</text>
        <text x={65} y={64} textAnchor="middle" fill={`${color}88`} fontSize={8}>Retains 75–85%</text>
        <line x1={120} y1={55} x2={180} y2={55} stroke={`${color}80`} strokeWidth={1.5} markerEnd={`url(#arr-${type})`} />
        <rect x={180} y={35} width={110} height={40} rx={6} fill={`${color}22`} stroke={color} strokeWidth={1.5} strokeDasharray="4,3" />
        <text x={235} y={50} textAnchor="middle" fill={color} fontSize={10} fontWeight="600">Sub IPO</text>
        <text x={235} y={64} textAnchor="middle" fill={`${color}88`} fontSize={8}>15–25% Public Float</text>
        <line x1={290} y1={55} x2={350} y2={55} stroke={`${color}80`} strokeWidth={1.5} markerEnd={`url(#arr-${type})`} />
        <rect x={350} y={35} width={62} height={40} rx={6} fill={`${color}33`} stroke={color} strokeWidth={1.5} />
        <text x={381} y={50} textAnchor="middle" fill={color} fontSize={10} fontWeight="600">Cash</text>
        <text x={381} y={64} textAnchor="middle" fill={`${color}88`} fontSize={8}>to Parent</text>
      </svg>
    );
  }

  // tracking stock
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md" style={{ height: 110 }}>
      <defs>
        <marker id={`arr-${type}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={`${color}80`} />
        </marker>
      </defs>
      <rect x={10} y={20} width={130} height={70} rx={8} fill={`${color}11`} stroke={color} strokeWidth={1.5} />
      <text x={75} y={38} textAnchor="middle" fill={color} fontSize={10} fontWeight="600">Single Legal Entity</text>
      <rect x={20} y={45} width={50} height={36} rx={4} fill={`${color}22`} stroke={color} strokeWidth={1} />
      <text x={45} y={59} textAnchor="middle" fill={`${color}cc`} fontSize={8}>Core Biz</text>
      <text x={45} y={71} textAnchor="middle" fill={`${color}88`} fontSize={7}>Class A</text>
      <rect x={80} y={45} width={50} height={36} rx={4} fill={`${color}33`} stroke={color} strokeWidth={1.5} strokeDasharray="3,2" />
      <text x={105} y={59} textAnchor="middle" fill={`${color}cc`} fontSize={8}>Tracked</text>
      <text x={105} y={71} textAnchor="middle" fill={`${color}88`} fontSize={7}>Class B</text>
      <line x1={145} y1={55} x2={200} y2={55} stroke={`${color}80`} strokeWidth={1.5} markerEnd={`url(#arr-${type})`} />
      <text x={205} y={45} fill={`${color}cc`} fontSize={9}>Tracking Stock</text>
      <text x={205} y={58} fill={`${color}88`} fontSize={8}>Mirrors sub performance</text>
      <text x={205} y={70} fill={`${color}66`} fontSize={8}>No true independence</text>
    </svg>
  );
}

function ShareholderDistributionSVG() {
  const W = 500;
  const H = 120;
  const steps = [
    { label: "Board Approves", sub: "Spinoff Plan", x: 30 },
    { label: "IRS Ruling", sub: "Sec. 355 Letter", x: 130 },
    { label: "Record Date", sub: "Holder Registry", x: 230 },
    { label: "Distribution", sub: "1 SpinCo per N", x: 330 },
    { label: "When-Issued", sub: "Trading Begins", x: 430 },
  ];
  return (
    <div className="rounded-md border border-border bg-foreground/5 p-5">
      <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
        <Info className="w-4 h-4 text-primary" />
        Shareholder Distribution Timeline
      </h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 100 }}>
        <line x1={30} y1={45} x2={470} y2={45} stroke="#ffffff22" strokeWidth={2} />
        {steps.map((st, i) => (
          <g key={i}>
            <circle cx={st.x + 30} cy={45} r={8} fill="#3b82f620" stroke="#3b82f6" strokeWidth={1.5} />
            <text x={st.x + 30} y={49} textAnchor="middle" fill="#93c5fd" fontSize={9} fontWeight="600">{i + 1}</text>
            <text x={st.x + 30} y={70} textAnchor="middle" fill="#e2e8f0" fontSize={8} fontWeight="600">{st.label}</text>
            <text x={st.x + 30} y={82} textAnchor="middle" fill="#94a3b8" fontSize={7}>{st.sub}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Tab 2: SOTP Valuation ─────────────────────────────────────────────────────

function SOTPTab() {
  const [segments, setSegments] = useState<Segment[]>(DEFAULT_SEGMENTS);
  const [netDebt, setNetDebt] = useState(3200);
  const [sharesOut, setSharesOut] = useState(450);

  const sotp = useMemo(() => {
    return segments.map((seg) => {
      const ebitda = (seg.revenue * seg.ebitdaMargin) / 100;
      const ev = ebitda * seg.evMultiple;
      return { ...seg, ebitda, ev };
    });
  }, [segments]);

  const totalSotpEV = sotp.reduce((sum, s) => sum + s.ev, 0);
  const sotpEquity = totalSotpEV - netDebt;
  const sotpPerShare = sotpEquity / sharesOut;
  const conglomerateDiscountEV = totalSotpEV * CONGLOMERATE_DISCOUNT;
  const marketCapAssumed = totalSotpEV - conglomerateDiscountEV - netDebt;
  const marketPricePerShare = marketCapAssumed / sharesOut;
  const upliftPct = ((sotpPerShare - marketPricePerShare) / marketPricePerShare) * 100;

  const colors = ["#60a5fa", "#34d399", "#a78bfa", "#fbbf24"];
  const totalRev = segments.reduce((s, seg) => s + seg.revenue, 0);

  function updateSegment(i: number, field: keyof Segment, value: number | string) {
    setSegments((prev) =>
      prev.map((seg, idx) => (idx === i ? { ...seg, [field]: value } : seg))
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <h2 className="text-lg font-medium text-foreground mb-1">Sum-of-Parts (SOTP) Calculator</h2>
        <p className="text-sm text-foreground/50">
          Value each business unit independently using EV/EBITDA multiples. Compare to conglomerate market cap.
        </p>
      </div>

      {/* Segment Sliders */}
      <div className="space-y-3">
        {segments.map((seg, i) => {
          const ebitda = (seg.revenue * seg.ebitdaMargin) / 100;
          const ev = ebitda * seg.evMultiple;
          const revShare = (seg.revenue / totalRev) * 100;
          return (
            <div key={i} className="rounded-md border border-border bg-foreground/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i] }} />
                  <span className="text-sm font-medium text-foreground">{seg.name}</span>
                  <span className="text-xs text-foreground/40">{revShare.toFixed(0)}% of revenue</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: colors[i] }}>
                    ${(ev / 1000).toFixed(1)}B EV
                  </div>
                  <div className="text-xs text-foreground/40">{seg.evMultiple}x EV/EBITDA</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-foreground/40 mb-1 block">Revenue ($M)</label>
                  <input
                    type="range"
                    min={500}
                    max={8000}
                    step={100}
                    value={seg.revenue}
                    onChange={(e) => updateSegment(i, "revenue", Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="text-xs text-foreground/70 mt-0.5">${seg.revenue.toLocaleString()}M</div>
                </div>
                <div>
                  <label className="text-xs text-foreground/40 mb-1 block">EBITDA Margin (%)</label>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={1}
                    value={seg.ebitdaMargin}
                    onChange={(e) => updateSegment(i, "ebitdaMargin", Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="text-xs text-foreground/70 mt-0.5">{seg.ebitdaMargin}% → ${(ebitda).toFixed(0)}M EBITDA</div>
                </div>
                <div>
                  <label className="text-xs text-foreground/40 mb-1 block">EV/EBITDA Multiple</label>
                  <input
                    type="range"
                    min={4}
                    max={35}
                    step={0.5}
                    value={seg.evMultiple}
                    onChange={(e) => updateSegment(i, "evMultiple", Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <div className="text-xs text-foreground/70 mt-0.5">{seg.evMultiple}x</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Corp Adjustments */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <h3 className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-3">Corporate Adjustments</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-foreground/40 mb-1 block">Net Debt ($M)</label>
            <input
              type="range"
              min={0}
              max={10000}
              step={100}
              value={netDebt}
              onChange={(e) => setNetDebt(Number(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="text-xs text-foreground/70 mt-0.5">${netDebt.toLocaleString()}M</div>
          </div>
          <div>
            <label className="text-xs text-foreground/40 mb-1 block">Shares Outstanding (M)</label>
            <input
              type="range"
              min={100}
              max={2000}
              step={10}
              value={sharesOut}
              onChange={(e) => setSharesOut(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="text-xs text-foreground/70 mt-0.5">{sharesOut}M shares</div>
          </div>
        </div>
      </div>

      {/* SOTP Summary */}
      <SOTPSummaryChart
        sotp={sotp}
        colors={colors}
        totalSotpEV={totalSotpEV}
        conglomerateDiscountEV={conglomerateDiscountEV}
        netDebt={netDebt}
        sotpPerShare={sotpPerShare}
        marketPricePerShare={marketPricePerShare}
        upliftPct={upliftPct}
      />

      {/* Holding Co Discount */}
      <HoldingCoDiscountSVG
        totalSotpEV={totalSotpEV}
        conglomerateDiscountEV={conglomerateDiscountEV}
        netDebt={netDebt}
        sotpEquity={sotpEquity}
        marketCapAssumed={marketCapAssumed}
      />
    </div>
  );
}

interface SOTPSummaryProps {
  sotp: Array<Segment & { ebitda: number; ev: number }>;
  colors: string[];
  totalSotpEV: number;
  conglomerateDiscountEV: number;
  netDebt: number;
  sotpPerShare: number;
  marketPricePerShare: number;
  upliftPct: number;
}

function SOTPSummaryChart({
  sotp,
  colors,
  totalSotpEV,
  conglomerateDiscountEV,
  netDebt,
  sotpPerShare,
  marketPricePerShare,
  upliftPct,
}: SOTPSummaryProps) {
  const W = 500;
  const H = 160;
  const maxEV = Math.max(...sotp.map((s) => s.ev));
  const barH = 22;
  const barGap = 8;
  const labelW = 130;

  return (
    <div className="rounded-md border border-border bg-foreground/5 p-5">
      <h3 className="text-sm font-medium text-foreground mb-3">Segment EV Breakdown</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {sotp.map((seg, i) => {
          const barW = ((seg.ev / maxEV) * (W - labelW - 100)) | 0;
          const y = i * (barH + barGap) + 10;
          return (
            <g key={i}>
              <text x={labelW - 6} y={y + barH / 2 + 4} textAnchor="end" fill="#cbd5e1" fontSize={10}>{seg.name}</text>
              <rect x={labelW} y={y} width={barW} height={barH} rx={4} fill={`${colors[i]}33`} stroke={colors[i]} strokeWidth={1} />
              <rect x={labelW} y={y} width={barW * 0.7} height={barH} rx={4} fill={`${colors[i]}55`} />
              <text x={labelW + barW + 6} y={y + barH / 2 + 4} fill={colors[i]} fontSize={10} fontWeight="600">
                ${(seg.ev / 1000).toFixed(1)}B
              </text>
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <div className="rounded-lg bg-foreground/5 p-3 text-center">
          <div className="text-xs text-foreground/40 mb-1">SOTP EV</div>
          <div className="text-base font-bold text-foreground">${(totalSotpEV / 1000).toFixed(1)}B</div>
        </div>
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
          <div className="text-xs text-red-400 mb-1">Cong. Discount (15%)</div>
          <div className="text-base font-medium text-red-400">−${(conglomerateDiscountEV / 1000).toFixed(1)}B</div>
        </div>
        <div className="rounded-lg bg-foreground/5 p-3 text-center">
          <div className="text-xs text-foreground/40 mb-1">SOTP / Share</div>
          <div className="text-base font-medium text-emerald-400">${sotpPerShare.toFixed(2)}</div>
        </div>
        <div className={cn("rounded-lg p-3 text-center border", upliftPct > 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20")}>
          <div className={cn("text-xs mb-1", upliftPct > 0 ? "text-emerald-400" : "text-red-400")}>Uplift Potential</div>
          <div className={cn("text-base font-medium", upliftPct > 0 ? "text-emerald-400" : "text-red-400")}>
            {upliftPct > 0 ? "+" : ""}{upliftPct.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

interface HoldingCoProps {
  totalSotpEV: number;
  conglomerateDiscountEV: number;
  netDebt: number;
  sotpEquity: number;
  marketCapAssumed: number;
}

function HoldingCoDiscountSVG({ totalSotpEV, conglomerateDiscountEV, netDebt, sotpEquity, marketCapAssumed }: HoldingCoProps) {
  const W = 460;
  const H = 90;
  const navW = 200;
  const mktW = Math.max(20, (marketCapAssumed / sotpEquity) * navW) | 0;

  return (
    <div className="rounded-md border border-border bg-foreground/5 p-5">
      <h3 className="text-sm font-medium text-foreground mb-1">NAV vs Market Cap — Holding Company Analysis</h3>
      <p className="text-xs text-foreground/40 mb-3">Conglomerates typically trade at 10–20% discount to intrinsic NAV.</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {/* NAV bar */}
        <rect x={10} y={15} width={navW} height={28} rx={4} fill="#3b82f622" stroke="#3b82f6" strokeWidth={1.5} />
        <text x={10 + navW / 2} y={34} textAnchor="middle" fill="#93c5fd" fontSize={10} fontWeight="600">
          NAV ${(sotpEquity / 1000).toFixed(1)}B
        </text>
        {/* Market cap bar */}
        <rect x={10} y={53} width={mktW} height={28} rx={4} fill="#f59e0b22" stroke="#f59e0b" strokeWidth={1.5} />
        <text x={10 + mktW / 2} y={72} textAnchor="middle" fill="#fbbf24" fontSize={10} fontWeight="600">
          Mkt ${(marketCapAssumed / 1000).toFixed(1)}B
        </text>
        {/* Labels */}
        <text x={220} y={34} fill="#94a3b8" fontSize={9}>= SOTP EV − Net Debt</text>
        <text x={220} y={72} fill="#94a3b8" fontSize={9}>= NAV × (1 − 15% discount)</text>
        {/* Discount brace */}
        <line x1={mktW + 10} y1={56} x2={navW + 10} y2={56} stroke="#ef444488" strokeWidth={1.5} strokeDasharray="3,2" />
        <text x={(mktW + navW) / 2 + 10} y={52} textAnchor="middle" fill="#f87171" fontSize={8}>Discount</text>
      </svg>
    </div>
  );
}

// ── Tab 3: Historical Performance ─────────────────────────────────────────────

function HistoricalPerformanceTab() {
  const [sortKey, setSortKey] = useState<"spinoff1Y" | "spinoff3Y" | "year">("spinoff1Y");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sorted = useMemo(
    () =>
      [...HISTORICAL_SPINOFFS].sort((a, b) =>
        sortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]
      ),
    [sortKey, sortDir]
  );

  const avgSpinoff1Y = HISTORICAL_SPINOFFS.reduce((s, r) => s + r.spinoff1Y, 0) / HISTORICAL_SPINOFFS.length;
  const avgParent1Y = HISTORICAL_SPINOFFS.reduce((s, r) => s + r.parent1Y, 0) / HISTORICAL_SPINOFFS.length;
  const avgSP1Y = HISTORICAL_SPINOFFS.reduce((s, r) => s + r.sp500_1Y, 0) / HISTORICAL_SPINOFFS.length;

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <h2 className="text-lg font-medium text-foreground mb-1">Famous Spinoff Performance</h2>
        <p className="text-sm text-foreground/50">1-year and 3-year returns post-spinoff vs S&P 500. Data reflects historical records.</p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <div className="text-xs text-emerald-400 mb-1">Avg SpinCo 1Y Return</div>
          <div className="text-2xl font-bold text-emerald-400">+{avgSpinoff1Y.toFixed(1)}%</div>
        </div>
        <div className="rounded-md border border-border bg-primary/10 p-4 text-center">
          <div className="text-xs text-primary mb-1">Avg Parent 1Y Return</div>
          <div className="text-lg font-medium text-primary">+{avgParent1Y.toFixed(1)}%</div>
        </div>
        <div className="rounded-md border border-border bg-foreground/5 p-4 text-center">
          <div className="text-xs text-foreground/40 mb-1">Avg S&P 500 1Y</div>
          <div className="text-lg font-medium text-foreground">+{avgSP1Y.toFixed(1)}%</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-foreground/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border bg-foreground/5">
                <th className="text-left px-4 py-3 text-foreground/40 font-medium">Parent → SpinCo</th>
                <th className="text-center px-3 py-3 text-foreground/40 font-medium cursor-pointer hover:text-foreground/70" onClick={() => toggleSort("year")}>
                  Year {sortKey === "year" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </th>
                <th className="text-center px-3 py-3 text-foreground/40 font-medium">Reason</th>
                <th className="text-center px-3 py-3 text-foreground/40 font-medium cursor-pointer hover:text-foreground/70" onClick={() => toggleSort("spinoff1Y")}>
                  SpinCo 1Y {sortKey === "spinoff1Y" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </th>
                <th className="text-center px-3 py-3 text-foreground/40 font-medium">Parent 1Y</th>
                <th className="text-center px-3 py-3 text-foreground/40 font-medium cursor-pointer hover:text-foreground/70" onClick={() => toggleSort("spinoff3Y")}>
                  SpinCo 3Y {sortKey === "spinoff3Y" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </th>
                <th className="text-center px-3 py-3 text-foreground/40 font-medium">vs S&P 1Y</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const vssp = row.spinoff1Y - row.sp500_1Y;
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-foreground/90 font-medium">{row.parent} → <span className="text-primary">{row.spinoff}</span></div>
                      <div className="text-foreground/30 mt-0.5">{row.parentTicker} → {row.spinoffTicker}</div>
                    </td>
                    <td className="text-center px-3 py-3 text-foreground/60">{row.year}</td>
                    <td className="px-3 py-3 max-w-[140px]">
                      <span className="text-foreground/50 text-xs leading-tight">{row.reason}</span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className={cn("font-medium", row.spinoff1Y >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {row.spinoff1Y >= 0 ? "+" : ""}{row.spinoff1Y.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className={cn("text-foreground/60", row.parent1Y >= 0 ? "text-primary" : "text-red-300")}>
                        {row.parent1Y >= 0 ? "+" : ""}{row.parent1Y.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className={cn("font-medium", row.spinoff3Y >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {row.spinoff3Y >= 0 ? "+" : ""}{row.spinoff3Y.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs", vssp >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                        {vssp >= 0 ? "+" : ""}{vssp.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scatter: Parent vs SpinCo performance */}
      <PerformanceScatter data={HISTORICAL_SPINOFFS} />
    </div>
  );
}

function PerformanceScatter({ data }: { data: SpinoffRecord[] }) {
  const W = 400;
  const H = 240;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const allVals = data.flatMap((d) => [d.parent1Y, d.spinoff1Y]);
  const minV = Math.min(...allVals) - 5;
  const maxV = Math.max(...allVals) + 5;

  function xScale(v: number) {
    return pad.left + ((v - minV) / (maxV - minV)) * chartW;
  }
  function yScale(v: number) {
    return pad.top + chartH - ((v - minV) / (maxV - minV)) * chartH;
  }

  const ticks = [-30, -10, 10, 30, 50, 70, 90, 120, 150];

  return (
    <div className="rounded-md border border-border bg-foreground/5 p-5">
      <h3 className="text-sm font-medium text-foreground mb-1">Parent vs SpinCo 1Y Returns (Scatter)</h3>
      <p className="text-xs text-foreground/40 mb-3">Points above diagonal = SpinCo outperformed parent.</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {/* Grid */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={xScale(t)} y1={pad.top} x2={xScale(t)} y2={pad.top + chartH} stroke="#ffffff10" strokeWidth={1} />
            <text x={xScale(t)} y={pad.top + chartH + 14} textAnchor="middle" fill="#94a3b8" fontSize={8}>{t}%</text>
            <line x1={pad.left} y1={yScale(t)} x2={pad.left + chartW} y2={yScale(t)} stroke="#ffffff10" strokeWidth={1} />
            <text x={pad.left - 4} y={yScale(t) + 3} textAnchor="end" fill="#94a3b8" fontSize={8}>{t}%</text>
          </g>
        ))}
        {/* Diagonal line (y=x) */}
        <line x1={xScale(minV)} y1={yScale(minV)} x2={xScale(maxV)} y2={yScale(maxV)} stroke="#ffffff25" strokeWidth={1} strokeDasharray="4,3" />
        {/* Points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xScale(d.parent1Y)} cy={yScale(d.spinoff1Y)} r={5} fill="#3b82f655" stroke="#3b82f6" strokeWidth={1.5} />
            <text x={xScale(d.parent1Y) + 7} y={yScale(d.spinoff1Y) + 3} fill="#93c5fd" fontSize={7}>{d.spinoffTicker}</text>
          </g>
        ))}
        {/* Axes labels */}
        <text x={W / 2} y={H - 2} textAnchor="middle" fill="#64748b" fontSize={9}>Parent 1Y Return (%)</text>
        <text x={10} y={H / 2} textAnchor="middle" fill="#64748b" fontSize={9} transform={`rotate(-90, 10, ${H / 2})`}>SpinCo 1Y Return (%)</text>
      </svg>
    </div>
  );
}

// ── Tab 4: Investing Strategy ─────────────────────────────────────────────────

function InvestingStrategyTab() {
  // Generate spinoff index vs S&P 10-year data
  resetSeed();
  const years = Array.from({ length: 11 }, (_, i) => 2014 + i);
  let spIndex = 100;
  let spinIndex = 100;
  const chartData = years.map((yr) => {
    const spReturn = 0.10 + (rand() - 0.5) * 0.20;
    const spinReturn = 0.14 + (rand() - 0.5) * 0.25;
    spIndex *= 1 + spReturn;
    spinIndex *= 1 + spinReturn;
    return { yr, sp: spIndex, spin: spinIndex };
  });

  const outperformance = (((chartData[10].spin - chartData[10].sp) / chartData[10].sp) * 100).toFixed(1);

  const whyOutperform = [
    {
      icon: <TrendingDown className="w-4 h-4 text-red-400" />,
      title: "Forced Selling",
      desc: "Index funds and ETFs that held the parent must sell spinoff shares if it does not qualify for their mandate. This creates artificial selling pressure — a buying opportunity for active investors.",
    },
    {
      icon: <BarChart2 className="w-4 h-4 text-primary" />,
      title: "Complexity Discount",
      desc: "Analysts covering the parent rarely follow the spinoff initially. Low coverage means mispricing. As dedicated analysts initiate, the information gap closes and valuation re-rates.",
    },
    {
      icon: <Target className="w-4 h-4 text-emerald-400" />,
      title: "Management Focus",
      desc: "Leadership teams freed from corporate politics can allocate capital optimally. Management typically receives spinoff equity compensation, aligning incentives sharply.",
    },
    {
      icon: <Scissors className="w-4 h-4 text-primary" />,
      title: "Hidden Jewels",
      desc: "Small units buried in large conglomerates may have best-in-class economics invisible to investors. Separation unlocks sector-specific multiple expansion.",
    },
  ];

  const timingStrategies = [
    {
      title: "Day 1 — Immediately Post-Spin",
      pros: ["Catch maximum forced-selling discount", "Best price on orphaned shares", "Insider buying signals often visible"],
      cons: ["High volatility, illiquid early days", "May gap down further on index exclusion", "No track record as standalone"],
      verdict: "Aggressive value approach — highest risk/reward",
      color: "emerald",
    },
    {
      title: "6-Month Seasoning Period",
      pros: ["Management credibility established", "First earnings report as standalone", "Analyst coverage initiated", "Selling pressure fully absorbed"],
      cons: ["Miss the biggest initial discount", "Stock may have already re-rated", "Requires patience and monitoring"],
      verdict: "Preferred approach for most investors",
      color: "blue",
    },
    {
      title: "Announcement Arbitrage",
      pros: ["Parent discount opens at announcement", "Risk/reward asymmetric to upside", "Event-driven catalyst is known"],
      cons: ["Deal risk — IRS ruling may not come", "Long timeline (12–18 months typical)", "Board may cancel transaction"],
      verdict: "For event-driven specialists",
      color: "amber",
    },
  ];

  const risks = [
    { label: "Debt Allocation", desc: "Parent may saddle spinoff with disproportionate debt to improve its own balance sheet. Review pro-forma capital structure carefully." },
    { label: "Pension Obligations", desc: "Legacy defined-benefit pension liabilities can be transferred to spinoff. Underfunded pensions constrain capex and growth." },
    { label: "Transition Costs", desc: "Shared service agreements (TSAs) create temporary dependencies and costs. Typically 12–24 months to fully separate IT, HR, and finance." },
    { label: "Management Quality", desc: "Spinoff leadership may be second-tier talent from parent. Assess track record and equity grant structure before investing." },
    { label: "Customer Concentration", desc: "Parent may have been primary customer. Intercompany revenue disappears post-spin — check pro-forma revenue without related-party sales." },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <h2 className="text-lg font-medium text-foreground mb-1">Spinoff Investing Strategy</h2>
        <p className="text-sm text-foreground/50">Spinoffs have historically outperformed broad market indices. Here is why and how to capitalize.</p>
      </div>

      {/* Spinoff Index vs S&P Chart */}
      <SpinoffIndexChart data={chartData} outperformance={outperformance} />

      {/* Why Outperform */}
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">Why Spinoffs Outperform</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {whyOutperform.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-foreground/5 border border-border/50">
              <div className="mt-0.5 shrink-0">{item.icon}</div>
              <div>
                <div className="text-xs font-medium text-foreground/90 mb-1">{item.title}</div>
                <div className="text-xs text-foreground/50 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timing Strategies */}
      <div className="rounded-md border border-border bg-foreground/5 p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">When to Buy</h3>
        <div className="space-y-3">
          {timingStrategies.map((strat, i) => {
            const colorMap: Record<string, string> = {
              emerald: "border-emerald-500/30 bg-emerald-500/5",
              blue: "border-border bg-primary/5",
              amber: "border-amber-500/30 bg-amber-500/5",
            };
            const labelMap: Record<string, string> = {
              emerald: "text-emerald-400",
              blue: "text-primary",
              amber: "text-amber-400",
            };
            return (
              <div key={i} className={cn("rounded-lg border p-4", colorMap[strat.color])}>
                <div className={cn("text-sm font-medium mb-2", labelMap[strat.color])}>{strat.title}</div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <div className="text-xs text-emerald-400 font-medium mb-1">Pros</div>
                    <ul className="space-y-1">
                      {strat.pros.map((p, pi) => (
                        <li key={pi} className="flex items-start gap-1.5 text-xs text-foreground/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-red-400 font-medium mb-1">Cons</div>
                    <ul className="space-y-1">
                      {strat.cons.map((c, ci) => (
                        <li key={ci} className="flex items-start gap-1.5 text-xs text-foreground/60">
                          <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className={cn("text-xs text-muted-foreground font-medium px-2 py-1 rounded-md inline-block", colorMap[strat.color], labelMap[strat.color])}>
                  Verdict: {strat.verdict}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risks */}
      <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-5">
        <h3 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Key Spinoff Investment Risks
        </h3>
        <div className="space-y-2.5">
          {risks.map((r, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <div>
                <span className="text-xs font-medium text-amber-300">{r.label}: </span>
                <span className="text-xs text-foreground/55">{r.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ChartPoint { yr: number; sp: number; spin: number }

function SpinoffIndexChart({ data, outperformance }: { data: ChartPoint[]; outperformance: string }) {
  const W = 500;
  const H = 220;
  const pad = { top: 20, right: 20, bottom: 35, left: 55 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const allVals = data.flatMap((d) => [d.sp, d.spin]);
  const minV = Math.min(...allVals) * 0.95;
  const maxV = Math.max(...allVals) * 1.02;

  function xScale(i: number) {
    return pad.left + (i / (data.length - 1)) * chartW;
  }
  function yScale(v: number) {
    return pad.top + chartH - ((v - minV) / (maxV - minV)) * chartH;
  }

  const spPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.sp)}`).join(" ");
  const spinPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.spin)}`).join(" ");
  const spinFill = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.spin)}`).join(" ") +
    ` L${xScale(data.length - 1)},${pad.top + chartH} L${xScale(0)},${pad.top + chartH} Z`;

  const yTicks = [100, 150, 200, 250, 300, 350];

  return (
    <div className="rounded-md border border-border bg-foreground/5 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">Spinoff Index vs S&P 500 (10 Years)</h3>
          <p className="text-xs text-foreground/40">Simulated — based on historical outperformance patterns. Base = 100.</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-foreground/40">Cumulative outperformance</div>
          <div className="text-lg font-medium text-emerald-400">+{outperformance}%</div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {/* Grid */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.left} y1={yScale(t)} x2={pad.left + chartW} y2={yScale(t)} stroke="#ffffff10" strokeWidth={1} />
            <text x={pad.left - 6} y={yScale(t) + 3} textAnchor="end" fill="#64748b" fontSize={8}>{t}</text>
          </g>
        ))}
        {/* Year labels */}
        {data.map((d, i) => (
          i % 2 === 0 && (
            <text key={i} x={xScale(i)} y={H - 8} textAnchor="middle" fill="#64748b" fontSize={8}>{d.yr}</text>
          )
        ))}
        {/* Fill area under spinoff line */}
        <path d={spinFill} fill="#10b98115" />
        {/* S&P line */}
        <path d={spPath} fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5,3" />
        {/* Spinoff line */}
        <path d={spinPath} fill="none" stroke="#10b981" strokeWidth={2.5} />
        {/* Legend */}
        <line x1={pad.left} y1={pad.top - 8} x2={pad.left + 20} y2={pad.top - 8} stroke="#10b981" strokeWidth={2.5} />
        <text x={pad.left + 25} y={pad.top - 5} fill="#10b981" fontSize={9} fontWeight="600">Spinoff Index</text>
        <line x1={pad.left + 110} y1={pad.top - 8} x2={pad.left + 130} y2={pad.top - 8} stroke="#94a3b8" strokeWidth={2} strokeDasharray="5,3" />
        <text x={pad.left + 135} y={pad.top - 5} fill="#94a3b8" fontSize={9}>S&P 500</text>
        {/* End labels */}
        <circle cx={xScale(data.length - 1)} cy={yScale(data[data.length - 1].spin)} r={4} fill="#10b981" />
        <text x={xScale(data.length - 1) - 6} y={yScale(data[data.length - 1].spin) - 8} textAnchor="end" fill="#10b981" fontSize={9} fontWeight="600">
          {data[data.length - 1].spin.toFixed(0)}
        </text>
        <circle cx={xScale(data.length - 1)} cy={yScale(data[data.length - 1].sp)} r={4} fill="#94a3b8" />
        <text x={xScale(data.length - 1) - 6} y={yScale(data[data.length - 1].sp) - 8} textAnchor="end" fill="#94a3b8" fontSize={9}>
          {data[data.length - 1].sp.toFixed(0)}
        </text>
      </svg>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SpinoffsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 border-l-4 border-l-primary p-6 rounded-lg bg-card/40">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-md bg-primary/20 border border-border flex items-center justify-center">
              <Scissors className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Corporate Spinoffs & Restructuring</h1>
              <p className="text-sm text-foreground/40">Mechanics, valuation, historical performance, and investment strategies</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="mechanics" className="mt-8 space-y-5">
          <TabsList className="bg-foreground/5 border border-border p-1 rounded-md h-auto flex flex-wrap gap-1">
            <TabsTrigger value="mechanics" className="rounded-lg text-xs px-4 py-2 data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground text-foreground/50">
              Spinoff Mechanics
            </TabsTrigger>
            <TabsTrigger value="sotp" className="rounded-lg text-xs px-4 py-2 data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground text-foreground/50">
              SOTP Valuation
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg text-xs px-4 py-2 data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground text-foreground/50">
              Historical Performance
            </TabsTrigger>
            <TabsTrigger value="strategy" className="rounded-lg text-xs px-4 py-2 data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground text-foreground/50">
              Investing Strategy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mechanics" className="data-[state=inactive]:hidden">
            <SpinoffMechanicsTab />
          </TabsContent>
          <TabsContent value="sotp" className="data-[state=inactive]:hidden">
            <SOTPTab />
          </TabsContent>
          <TabsContent value="history" className="data-[state=inactive]:hidden">
            <HistoricalPerformanceTab />
          </TabsContent>
          <TabsContent value="strategy" className="data-[state=inactive]:hidden">
            <InvestingStrategyTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
