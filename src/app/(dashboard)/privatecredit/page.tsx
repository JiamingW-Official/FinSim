"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Building2,
  Shield,
  Layers,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Percent,
  FileText,
  Activity,
  Lock,
  Unlock,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 742001;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const RAND_POOL: number[] = [];
for (let i = 0; i < 300; i++) RAND_POOL.push(rand());
let ri = 0;
const r = () => RAND_POOL[ri++ % RAND_POOL.length];

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtT(n: number): string {
  if (n >= 1) return `$${n.toFixed(1)}T`;
  return `$${(n * 1000).toFixed(0)}B`;
}

function fmtB(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}T`;
  return `$${n.toFixed(0)}B`;
}

function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

// ── Shared components ─────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral";
  icon?: React.ElementType;
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      {Icon && (
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <Icon className="h-4 w-4 text-white/60" />
        </div>
      )}
      <p className="text-xs text-white/50">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold tabular-nums", valClass)}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-white/40">{sub}</p>}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-white/50">{subtitle}</p>}
    </div>
  );
}

function InfoBox({
  text,
  variant = "info",
}: {
  text: string;
  variant?: "info" | "warn" | "success";
}) {
  const styles = {
    info: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  };
  const Icon = variant === "warn" ? AlertTriangle : variant === "success" ? CheckCircle : Info;
  return (
    <div className={cn("flex items-start gap-2 rounded-lg border p-3 text-xs", styles[variant])}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

// ── Tab 1: Market Overview ────────────────────────────────────────────────────

const AUM_DATA = [
  { year: "2015", aum: 0.5 },
  { year: "2016", aum: 0.62 },
  { year: "2017", aum: 0.75 },
  { year: "2018", aum: 0.88 },
  { year: "2019", aum: 1.0 },
  { year: "2020", aum: 1.1 },
  { year: "2021", aum: 1.3 },
  { year: "2022", aum: 1.5 },
  { year: "2023", aum: 1.7 },
  { year: "2024", aum: 2.1 },
];

const TOP_MANAGERS = [
  { name: "Ares Management", aum: 420, strategy: "Direct Lending / Mezz", rating: "A" },
  { name: "Blue Owl Capital", aum: 235, strategy: "Direct Lending / GP Finance", rating: "A" },
  { name: "HPS Investment Partners", aum: 120, strategy: "Performing / Distressed", rating: "B+" },
  { name: "Golub Capital", aum: 65, strategy: "Middle Market Lending", rating: "B+" },
  { name: "Owl Rock / OBDC", aum: 54, strategy: "Corporate Direct Lending", rating: "B" },
  { name: "Blackstone Credit", aum: 310, strategy: "Diversified Private Credit", rating: "A" },
];

function AUMChart() {
  const maxAUM = Math.max(...AUM_DATA.map((d) => d.aum));
  const W = 520;
  const H = 180;
  const PAD = { top: 20, right: 20, bottom: 30, left: 50 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xStep = innerW / (AUM_DATA.length - 1);
  const yScale = (v: number) => innerH - (v / (maxAUM * 1.1)) * innerH;

  const linePath = AUM_DATA.map((d, i) => {
    const x = i * xStep;
    const y = yScale(d.aum);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  const areaPath =
    `${linePath} L ${((AUM_DATA.length - 1) * xStep).toFixed(1)} ${innerH} L 0 ${innerH} Z`;

  const yTicks = [0, 0.5, 1.0, 1.5, 2.0];

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl" style={{ minWidth: 320 }}>
        <defs>
          <linearGradient id="pcAumGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick) => {
            const y = yScale(tick);
            return (
              <g key={tick}>
                <line x1={0} y1={y} x2={innerW} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <text x={-8} y={y + 4} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.4)">
                  {tick === 0 ? "$0" : `$${tick}T`}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#pcAumGrad)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#818cf8" strokeWidth={2} strokeLinejoin="round" />

          {/* Data points */}
          {AUM_DATA.map((d, i) => (
            <circle
              key={d.year}
              cx={i * xStep}
              cy={yScale(d.aum)}
              r={3}
              fill="#818cf8"
              stroke="#1e1b4b"
              strokeWidth={1.5}
            />
          ))}

          {/* X axis labels */}
          {AUM_DATA.map((d, i) => (
            <text
              key={d.year}
              x={i * xStep}
              y={innerH + 18}
              textAnchor="middle"
              fontSize={9}
              fill="rgba(255,255,255,0.4)"
            >
              {d.year}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}

function MarketOverviewTab() {
  return (
    <div className="space-y-6">
      {/* Hero stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Global AUM" value="$2.1T" sub="+24% YoY" highlight="pos" icon={DollarSign} />
        <StatCard label="Middle Market Share" value="~65%" sub="$10M–$500M EBITDA" highlight="neutral" icon={Building2} />
        <StatCard label="Avg. Yield Spread" value="+550bps" sub="over SOFR" highlight="pos" icon={Percent} />
        <StatCard label="5-Year CAGR" value="17.2%" sub="vs. 4.8% bank lending" highlight="pos" icon={TrendingUp} />
      </div>

      <InfoBox
        text="Private credit has grown from a niche asset class to a $2T+ market, largely displacing banks in middle-market lending following the 2008 financial crisis and subsequent bank regulatory tightening (Basel III/IV)."
        variant="info"
      />

      {/* AUM Growth Chart */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader
          title="Private Credit AUM Growth"
          subtitle="Global assets under management ($T), 2015–2024"
        />
        <AUMChart />
      </div>

      {/* vs Bank Lending */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader title="Private Credit vs. Bank Lending" subtitle="Key structural differences" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-2 text-left text-xs font-medium text-white/50">Factor</th>
                <th className="pb-2 text-left text-xs font-medium text-indigo-400">Private Credit</th>
                <th className="pb-2 text-left text-xs font-medium text-white/50">Bank Lending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ["Borrower Size", "$10M–$500M EBITDA", ">$1B EBITDA (syndicated)"],
                ["Speed to Close", "4–8 weeks", "12–20 weeks"],
                ["Covenant Package", "Maintenance covenants", "Incurrence-only (cov-lite)"],
                ["Hold-to-Maturity", "Yes (illiquid)", "Distribute/sell"],
                ["Pricing", "SOFR + 500–700bps", "SOFR + 150–300bps"],
                ["Flexibility", "Bespoke terms", "Standardized templates"],
                ["Relationship", "Direct lender/borrower", "Agent bank intermediary"],
              ].map(([f, pc, bank]) => (
                <tr key={f}>
                  <td className="py-2 text-xs text-white/60">{f}</td>
                  <td className="py-2 text-xs font-medium text-indigo-300">{pc}</td>
                  <td className="py-2 text-xs text-white/50">{bank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Managers */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader title="Top Private Credit Managers" subtitle="Leading platforms by AUM" />
        <div className="space-y-2">
          {TOP_MANAGERS.map((m) => {
            const pct = (m.aum / 420) * 100;
            return (
              <div key={m.name} className="flex items-center gap-3">
                <div className="w-36 shrink-0 text-xs text-white/80">{m.name}</div>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    />
                  </div>
                </div>
                <div className="w-16 shrink-0 text-right text-xs text-white/60">
                  {fmtB(m.aum)}
                </div>
                <Badge
                  className={cn(
                    "w-10 shrink-0 justify-center text-xs",
                    m.rating === "A"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-blue-500/20 text-blue-400"
                  )}
                >
                  {m.rating}
                </Badge>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-white/40">
          Rating reflects platform scale, diversification, and track record (FS internal scoring)
        </p>
      </div>

      {/* Middle Market focus */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "Middle Market Definition",
            items: [
              "EBITDA: $10M – $500M",
              "Revenue: $50M – $2B",
              "~200,000 US companies",
              "Accounts for ~⅓ of US GDP",
            ],
            icon: Building2,
            color: "text-indigo-400",
          },
          {
            title: "Why Private Credit Wins",
            items: [
              "Too large for community banks",
              "Too small for syndicated markets",
              "Need speed and certainty",
              "Want relationship-based terms",
            ],
            icon: Star,
            color: "text-amber-400",
          },
          {
            title: "Macro Tailwinds",
            items: [
              "Basel III capital constraints",
              "Bank M&A reducing competitors",
              "PE buyout activity growth",
              "Floating rate in rising environment",
            ],
            icon: TrendingUp,
            color: "text-emerald-400",
          },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <card.icon className={cn("h-4 w-4", card.color)} />
              <h3 className="text-sm font-semibold text-white">{card.title}</h3>
            </div>
            <ul className="space-y-1.5">
              {card.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-white/60">
                  <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-white/30" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Direct Lending ─────────────────────────────────────────────────────

const LOAN_TYPES = [
  {
    name: "First Lien Senior Secured",
    priority: 1,
    spread: "450–550bps",
    ltv: "35–45%",
    recovery: "70–90%",
    risk: "Low",
    color: "emerald",
    desc: "First claim on borrower assets; lowest risk in capital stack. Typically fully secured against hard assets and cash flows.",
  },
  {
    name: "Second Lien",
    priority: 2,
    spread: "650–800bps",
    ltv: "45–60%",
    recovery: "40–65%",
    risk: "Moderate",
    color: "blue",
    desc: "Subordinate to first lien; higher yield premium for incremental risk. Usually used to bridge equity gap in PE buyouts.",
  },
  {
    name: "Unitranche",
    priority: 3,
    spread: "550–700bps",
    ltv: "50–65%",
    recovery: "55–75%",
    risk: "Moderate",
    color: "indigo",
    desc: "Blended first/second lien in single instrument. Simplifies borrower's cap structure; uses Agreement Among Lenders (AAL).",
  },
  {
    name: "Mezzanine",
    priority: 4,
    spread: "800–1100bps",
    ltv: "60–75%",
    recovery: "25–50%",
    risk: "High",
    color: "amber",
    desc: "Subordinated debt with equity kicker (warrants). Hybrid risk/return; often PIK-able. Junior to all senior secured.",
  },
];

function TermSheet() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <SectionHeader title="Illustrative Term Sheet" subtitle="Middle market senior secured loan" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-white/5">
            {[
              ["Borrower", "Acme Industrial Holdings LLC"],
              ["Facility Type", "Senior Secured First Lien Term Loan"],
              ["Facility Size", "$125,000,000"],
              ["Arranger / Lender", "Single-Lender (Club / Bilateral)"],
              ["Maturity", "5 years from close (2024–2029)"],
              ["Interest Rate", "SOFR + 550bps (floor: 100bps)"],
              ["OID (Original Issue Discount)", "98.5 cents on dollar (150bps upfront)"],
              ["Amortization", "1% per annum (quarterly)"],
              ["PIK Toggle", "Available; SOFR + 625bps if elected"],
              ["Call Protection", "102 (Y1), 101 (Y2), Par thereafter"],
              ["Financial Covenants", "Total Net Leverage ≤ 5.5x; Fixed Charge Coverage ≥ 1.1x"],
              ["Collateral", "All assets, equity pledge, IP, material subsidiaries"],
              ["Reporting", "Monthly mgmt accounts; quarterly lender call"],
              ["DSCR (Underwrite)", "1.35x (base case); 1.10x (downside)"],
              ["Leverage (Underwrite)", "4.8x Total Net / 3.9x Senior Secured"],
              ["Closing Fee", "100bps all-in to lender"],
            ].map(([key, val]) => (
              <tr key={key}>
                <td className="py-2 pr-4 text-xs font-medium text-white/50 align-top">{key}</td>
                <td className="py-2 text-xs text-white/80">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DirectLendingTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Typical EBITDA Range" value="$10–300M" sub="middle market focus" icon={Building2} />
        <StatCard label="Avg All-in Yield" value="10–13%" sub="SOFR + 500–700bps" highlight="pos" icon={Percent} />
        <StatCard label="Typical Leverage" value="4–6x" sub="Total Net Debt/EBITDA" icon={BarChart3} />
        <StatCard label="DSCR Hurdle" value="≥ 1.2x" sub="debt service coverage" highlight="pos" icon={Shield} />
      </div>

      {/* Loan types capital stack */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader title="Loan Types & Capital Stack Position" subtitle="Click a tranche for details" />
        <div className="space-y-3">
          {LOAN_TYPES.map((lt) => {
            const isOpen = expanded === lt.name;
            const colorMap: Record<string, string> = {
              emerald: "border-emerald-500/40 bg-emerald-500/10",
              blue: "border-blue-500/40 bg-blue-500/10",
              indigo: "border-indigo-500/40 bg-indigo-500/10",
              amber: "border-amber-500/40 bg-amber-500/10",
            };
            const textMap: Record<string, string> = {
              emerald: "text-emerald-400",
              blue: "text-blue-400",
              indigo: "text-indigo-400",
              amber: "text-amber-400",
            };
            return (
              <div
                key={lt.name}
                className={cn("rounded-lg border p-3 cursor-pointer transition-all", colorMap[lt.color])}
                onClick={() => setExpanded(isOpen ? null : lt.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn("text-xs font-bold", textMap[lt.color])}>#{lt.priority}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{lt.name}</p>
                      <p className="text-xs text-white/50">Spread: {lt.spread} | LTV: {lt.ltv} | Recovery: {lt.recovery}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-xs",
                        lt.risk === "Low" ? "bg-emerald-500/20 text-emerald-400" :
                        lt.risk === "Moderate" ? "bg-blue-500/20 text-blue-400" :
                        "bg-amber-500/20 text-amber-400"
                      )}
                    >
                      {lt.risk}
                    </Badge>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
                  </div>
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-xs text-white/60 border-t border-white/10 pt-3">{lt.desc}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key metrics explained */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Key Underwriting Metrics</h3>
          </div>
          <div className="space-y-3">
            {[
              { metric: "Leverage Ratio", formula: "Total Net Debt / EBITDA", typical: "4.0–6.0x", warn: ">6.5x high risk" },
              { metric: "DSCR", formula: "(EBITDA – CapEx) / Debt Service", typical: "≥ 1.20x", warn: "<1.05x breach risk" },
              { metric: "Interest Coverage", formula: "EBITDA / Interest Expense", typical: "≥ 2.5x", warn: "<1.5x distress" },
              { metric: "LTV", formula: "Loan Amount / Enterprise Value", typical: "35–55%", warn: ">65% senior secured" },
            ].map((m) => (
              <div key={m.metric} className="rounded-lg bg-white/5 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-white">{m.metric}</p>
                    <p className="text-xs text-white/40 font-mono mt-0.5">{m.formula}</p>
                  </div>
                  <span className="text-xs text-emerald-400 shrink-0">{m.typical}</span>
                </div>
                <p className="mt-1 text-xs text-rose-400/80">{m.warn}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">PIK Interest Explained</h3>
          </div>
          <p className="text-xs text-white/60 mb-3">
            Payment-in-Kind (PIK) allows borrowers to accrue interest as additional principal rather than paying cash. Favored in LBOs to preserve cash for growth/operations.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between rounded bg-white/5 p-2">
              <span className="text-white/50">Cash pay component</span>
              <span className="text-white/80">SOFR + 400bps</span>
            </div>
            <div className="flex justify-between rounded bg-white/5 p-2">
              <span className="text-white/50">PIK component</span>
              <span className="text-amber-400">+ 150bps (accrues)</span>
            </div>
            <div className="flex justify-between rounded bg-white/5 p-2">
              <span className="text-white/50">All-in (if PIK elected)</span>
              <span className="text-indigo-300">SOFR + 550bps</span>
            </div>
            <div className="flex justify-between rounded bg-white/5 p-2">
              <span className="text-white/50">Lender risk</span>
              <span className="text-rose-400">Rising principal balance</span>
            </div>
            <div className="flex justify-between rounded bg-white/5 p-2">
              <span className="text-white/50">Borrower benefit</span>
              <span className="text-emerald-400">Cash flow preservation</span>
            </div>
          </div>
          <InfoBox text="PIK interest typically triggers if leverage exceeds a threshold (e.g., >5.5x Net Leverage), acting as an automatic circuit-breaker before technical default." variant="warn" />
        </div>
      </div>

      {/* Term sheet */}
      <TermSheet />
    </div>
  );
}

// ── Tab 3: BDC Analysis ───────────────────────────────────────────────────────

const BDC_DATA = [
  {
    ticker: "ARCC",
    name: "Ares Capital Corporation",
    nav: 19.24,
    price: 21.10,
    dividendYield: 9.4,
    leverage: 1.15,
    totalAssets: 21800,
    nonAccrual: 1.2,
    focus: "Broadly diversified",
    rating: "A",
    description: "Largest BDC; diversified across 500+ portfolio companies, all industries.",
  },
  {
    ticker: "OBDC",
    name: "Blue Owl Capital Corp",
    nav: 15.38,
    price: 15.70,
    dividendYield: 10.2,
    leverage: 1.20,
    totalAssets: 13400,
    nonAccrual: 0.8,
    focus: "Large/upper middle market",
    rating: "B+",
    description: "Focuses on upper middle market; strong underwriting with defensive positioning.",
  },
  {
    ticker: "FSCO",
    name: "FS KKR Capital Corp",
    nav: 23.80,
    price: 21.50,
    dividendYield: 13.8,
    leverage: 1.18,
    totalAssets: 15200,
    nonAccrual: 2.1,
    focus: "Opportunistic / middle market",
    rating: "B",
    description: "Larger non-accrual but higher yield; pursues opportunistic credit situations.",
  },
];

function NavPriceChart({ nav, price, ticker }: { nav: number; price: number; ticker: string }) {
  const premium = ((price - nav) / nav) * 100;
  const isDiscount = premium < 0;
  const W = 160;
  const H = 60;
  const maxVal = Math.max(nav, price) * 1.1;

  const navX = (nav / maxVal) * (W - 20) + 10;
  const priceX = (price / maxVal) * (W - 20) + 10;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* NAV bar */}
        <rect x={10} y={10} width={(nav / maxVal) * (W - 20)} height={16} rx={3} fill="rgba(99,102,241,0.3)" />
        <text x={navX - 4} y={22} textAnchor="end" fontSize={8} fill="rgba(99,102,241,0.8)">
          NAV ${nav.toFixed(2)}
        </text>

        {/* Price bar */}
        <rect x={10} y={32} width={(price / maxVal) * (W - 20)} height={16} rx={3} fill={isDiscount ? "rgba(244,63,94,0.3)" : "rgba(16,185,129,0.3)"} />
        <text x={priceX - 4} y={44} textAnchor="end" fontSize={8} fill={isDiscount ? "rgb(251,113,133)" : "rgb(52,211,153)"}>
          ${price.toFixed(2)}
        </text>

        <text x={W / 2} y={58} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.4)">
          {isDiscount ? `${Math.abs(premium).toFixed(1)}% discount to NAV` : `${premium.toFixed(1)}% premium to NAV`}
        </text>
      </svg>
      <p className={cn("text-xs text-center mt-1 font-semibold", isDiscount ? "text-rose-400" : "text-emerald-400")}>
        {ticker}: {isDiscount ? "Discount" : "Premium"}
      </p>
    </div>
  );
}

function BDCAnalysisTab() {
  const [selectedBDC, setSelectedBDC] = useState<string>("ARCC");
  const detail = BDC_DATA.find((b) => b.ticker === selectedBDC)!;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="BDCs in US" value="~50" sub="Registered Investment Companies" icon={Briefcase} />
        <StatCard label="Max Leverage" value="2:1" sub="Debt-to-equity cap (regulatory)" icon={Shield} />
        <StatCard label="Avg Dividend Yield" value="9–14%" sub="Qualifying income distributions" highlight="pos" icon={Percent} />
        <StatCard label="90% Distribution" value="Required" sub="To qualify as RIC (pass-through)" icon={CheckCircle} />
      </div>

      <InfoBox
        text="BDCs are closed-end funds regulated under the Investment Company Act of 1940 that provide financing to small/mid-size companies. They must distribute 90%+ of taxable income to shareholders and maintain asset coverage ratio ≥ 150% (post-2018 Small Business Credit Availability Act)."
        variant="info"
      />

      {/* BDC Structure */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader title="BDC Structure Overview" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 text-xs text-white/70">
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span>Publicly traded — retail investor access to private credit</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span>Regulated Investment Company (RIC) structure — no corporate tax at fund level</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span>Floating rate portfolios — natural hedge in rising rate environment</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>Leverage amplifies losses; asset coverage ratio must stay ≥ 150%</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>NAV erosion risk in credit downturns — common with poorly underwritten BDCs</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>Management fees (1.5–2%) + incentive fees (15–20% over hurdle) compress net returns</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Asset Coverage Ratio</p>
            <div className="rounded-lg bg-white/5 p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-white/50">Formula</span>
                <span className="font-mono text-white/80">Assets / (Debt + Pref)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Minimum (post-2018)</span>
                <span className="text-emerald-400">150% (1.5:1 D/E)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Prior standard</span>
                <span className="text-white/60">200% (1:1 D/E)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Breach consequence</span>
                <span className="text-rose-400">No new borrowings</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Dividend restriction</span>
                <span className="text-rose-400">If &lt;110% coverage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BDC Comparison */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader title="BDC Comparison Table" subtitle="Select a BDC for detailed NAV analysis" />
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-2 text-left text-xs font-medium text-white/50">Ticker</th>
                <th className="pb-2 text-right text-xs font-medium text-white/50">NAV/Share</th>
                <th className="pb-2 text-right text-xs font-medium text-white/50">Price</th>
                <th className="pb-2 text-right text-xs font-medium text-white/50">P/NAV</th>
                <th className="pb-2 text-right text-xs font-medium text-white/50">Yield</th>
                <th className="pb-2 text-right text-xs font-medium text-white/50">Leverage</th>
                <th className="pb-2 text-right text-xs font-medium text-white/50">Non-Accrual</th>
                <th className="pb-2 text-right text-xs font-medium text-white/50">Assets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {BDC_DATA.map((bdc) => {
                const pNav = bdc.price / bdc.nav;
                const isSelected = selectedBDC === bdc.ticker;
                return (
                  <tr
                    key={bdc.ticker}
                    className={cn("cursor-pointer transition-colors", isSelected ? "bg-indigo-500/10" : "hover:bg-white/5")}
                    onClick={() => setSelectedBDC(bdc.ticker)}
                  >
                    <td className="py-2 font-mono text-xs font-bold text-indigo-400">{bdc.ticker}</td>
                    <td className="py-2 text-right text-xs text-white/80">${bdc.nav.toFixed(2)}</td>
                    <td className="py-2 text-right text-xs text-white/80">${bdc.price.toFixed(2)}</td>
                    <td className={cn("py-2 text-right text-xs font-semibold", pNav > 1 ? "text-emerald-400" : "text-rose-400")}>
                      {pNav.toFixed(2)}x
                    </td>
                    <td className="py-2 text-right text-xs text-amber-400">{bdc.dividendYield.toFixed(1)}%</td>
                    <td className="py-2 text-right text-xs text-white/70">{bdc.leverage.toFixed(2)}x</td>
                    <td className={cn("py-2 text-right text-xs", bdc.nonAccrual > 1.5 ? "text-rose-400" : "text-emerald-400")}>
                      {bdc.nonAccrual.toFixed(1)}%
                    </td>
                    <td className="py-2 text-right text-xs text-white/60">{fmtB(bdc.totalAssets / 1000)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedBDC}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-indigo-300">{detail.ticker}</p>
                <p className="text-xs text-white/60">{detail.name}</p>
              </div>
              <Badge className="bg-indigo-500/20 text-indigo-300 text-xs">{detail.focus}</Badge>
            </div>
            <p className="text-xs text-white/60 mb-4">{detail.description}</p>
            <NavPriceChart nav={detail.nav} price={detail.price} ticker={detail.ticker} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Tab 4: Risk & Returns ─────────────────────────────────────────────────────

const VINTAGE_DATA = [
  { year: "2015", irr: 8.2, defaultRate: 1.8 },
  { year: "2016", irr: 9.1, defaultRate: 2.1 },
  { year: "2017", irr: 9.8, defaultRate: 1.5 },
  { year: "2018", irr: 10.5, defaultRate: 2.4 },
  { year: "2019", irr: 11.2, defaultRate: 2.9 },
  { year: "2020", irr: 7.4, defaultRate: 4.8 },
  { year: "2021", irr: 12.3, defaultRate: 1.1 },
  { year: "2022", irr: 13.8, defaultRate: 1.6 },
  { year: "2023", irr: 12.1, defaultRate: 2.0 },
];

const SCATTER_DATA = [
  { label: "IG Corp Bonds", risk: 3.2, ret: 5.1, color: "#818cf8" },
  { label: "HY Corp Bonds", risk: 7.8, ret: 7.9, color: "#f472b6" },
  { label: "Leveraged Loans", risk: 6.5, ret: 8.4, color: "#34d399" },
  { label: "Private Credit (1L)", risk: 6.2, ret: 10.8, color: "#6366f1" },
  { label: "Private Credit (Unitr.)", risk: 7.5, ret: 12.1, color: "#a855f7" },
  { label: "Mezzanine", risk: 11.0, ret: 14.5, color: "#f59e0b" },
  { label: "PE Equity", risk: 18.5, ret: 18.2, color: "#ef4444" },
];

function VintageChart() {
  const W = 480;
  const H = 160;
  const PAD = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const step = innerW / (VINTAGE_DATA.length - 1);

  const irrMax = 16;
  const defaultMax = 6;

  const irrPath = VINTAGE_DATA.map((d, i) => {
    const x = i * step;
    const y = innerH - (d.irr / irrMax) * innerH;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  const defPath = VINTAGE_DATA.map((d, i) => {
    const x = i * step;
    const y = innerH - (d.defaultRate / defaultMax) * innerH;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl" style={{ minWidth: 300 }}>
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {[0, 4, 8, 12, 16].map((tick) => (
            <g key={tick}>
              <line x1={0} y1={innerH - (tick / irrMax) * innerH} x2={innerW} y2={innerH - (tick / irrMax) * innerH} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              <text x={-6} y={innerH - (tick / irrMax) * innerH + 4} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.35)">{tick}%</text>
            </g>
          ))}
          <path d={irrPath} fill="none" stroke="#818cf8" strokeWidth={2} strokeLinejoin="round" />
          <path d={defPath} fill="none" stroke="#f87171" strokeWidth={1.5} strokeLinejoin="round" strokeDasharray="4 3" />
          {VINTAGE_DATA.map((d, i) => (
            <g key={d.year}>
              <circle cx={i * step} cy={innerH - (d.irr / irrMax) * innerH} r={3} fill="#818cf8" />
              <text x={i * step} y={innerH + 18} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.4)">{d.year}</text>
            </g>
          ))}
        </g>
      </svg>
      <div className="mt-2 flex items-center gap-4 text-xs text-white/50">
        <div className="flex items-center gap-1"><div className="h-1.5 w-4 rounded bg-indigo-400" /> IRR (left)</div>
        <div className="flex items-center gap-1"><div className="h-px w-4 border-t border-dashed border-rose-400" /> Default Rate (scaled)</div>
      </div>
    </div>
  );
}

function RiskReturnScatter() {
  const W = 420;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 35, left: 45 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxRisk = 22;
  const maxRet = 22;

  const xScale = (v: number) => (v / maxRisk) * innerW;
  const yScale = (v: number) => innerH - (v / maxRet) * innerH;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl" style={{ minWidth: 280 }}>
        <defs>
          <marker id="arrowTip" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.2)" />
          </marker>
        </defs>
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {/* Efficient frontier region */}
          <path d={`M ${xScale(3)} ${yScale(5)} Q ${xScale(9)} ${yScale(11)} ${xScale(11)} ${yScale(14.5)} T ${xScale(18)} ${yScale(18)}`}
            fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth={12} strokeLinecap="round" />

          {[0, 5, 10, 15, 20].map((tick) => (
            <g key={tick}>
              <line x1={xScale(tick)} y1={0} x2={xScale(tick)} y2={innerH} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              <text x={xScale(tick)} y={innerH + 16} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.3)">{tick}%</text>
            </g>
          ))}
          {[0, 5, 10, 15, 20].map((tick) => (
            <g key={tick}>
              <line x1={0} y1={yScale(tick)} x2={innerW} y2={yScale(tick)} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              <text x={-6} y={yScale(tick) + 4} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.3)">{tick}%</text>
            </g>
          ))}

          <text x={innerW / 2} y={innerH + 30} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.3)">Volatility / Risk</text>
          <text x={-innerH / 2} y={-32} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.3)" transform="rotate(-90)">Return</text>

          {SCATTER_DATA.map((pt) => (
            <g key={pt.label}>
              <circle
                cx={xScale(pt.risk)}
                cy={yScale(pt.ret)}
                r={5}
                fill={pt.color}
                fillOpacity={0.8}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={1}
              />
              <text
                x={xScale(pt.risk) + 7}
                y={yScale(pt.ret) + 4}
                fontSize={7}
                fill="rgba(255,255,255,0.6)"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

function RiskReturnsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Illiquidity Premium" value="+200–400bps" sub="vs public credit" highlight="pos" icon={Lock} />
        <StatCard label="Avg Default Rate" value="~2.0%" sub="5-yr rolling (direct lending)" highlight="neutral" icon={TrendingDown} />
        <StatCard label="Recovery Rate" value="65–75%" sub="senior secured (1L)" highlight="pos" icon={TrendingUp} />
        <StatCard label="Floating Rate" value="~95%+" sub="of direct lending portfolio" highlight="pos" icon={Activity} />
      </div>

      {/* Floating rate advantage */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader title="Floating Rate Advantage" subtitle="How rising rates benefit private credit lenders" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs">
              <p className="font-semibold text-emerald-400 mb-2">When SOFR rises +100bps:</p>
              <div className="space-y-1 text-white/70">
                <div className="flex justify-between"><span>Current yield (SOFR 5.25% + 550bps)</span><span className="text-emerald-400">10.75%</span></div>
                <div className="flex justify-between"><span>New yield (SOFR 6.25% + 550bps)</span><span className="text-emerald-400">11.75%</span></div>
                <div className="flex justify-between"><span>Incremental income</span><span className="text-white/80">+100bps per $1B</span></div>
              </div>
            </div>
            <InfoBox text="Unlike fixed-rate bonds that lose value when rates rise, private credit loans reprice immediately. This makes them a natural inflation/rate hedge." variant="success" />
          </div>
          <div className="space-y-2 text-xs">
            <p className="text-white/50 font-semibold uppercase tracking-wider text-xs">Rate Floors</p>
            <p className="text-white/60">Most direct lending loans include SOFR floors (typically 75–100bps). This protects lender yield if rates fall below floor, while passing through upside if rates rise above.</p>
            <div className="rounded-lg bg-white/5 p-2.5 space-y-1">
              <div className="flex justify-between">
                <span className="text-white/50">SOFR Floor</span>
                <span className="text-indigo-300">100bps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">If SOFR = 0.50%</span>
                <span className="text-white/80">Treated as 1.00%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Effective min yield</span>
                <span className="text-emerald-400">Floor + spread</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vintage Analysis */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader title="Vintage Year Analysis" subtitle="Gross IRR and default rate by vintage (2015–2023)" />
        <VintageChart />
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg bg-white/5 p-2.5 text-center">
            <p className="text-white/40">Best Vintage</p>
            <p className="text-lg font-bold text-emerald-400">2022</p>
            <p className="text-white/60">13.8% IRR</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2.5 text-center">
            <p className="text-white/40">Worst Vintage</p>
            <p className="text-lg font-bold text-rose-400">2020</p>
            <p className="text-white/60">7.4% IRR, 4.8% default</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2.5 text-center">
            <p className="text-white/40">Average IRR</p>
            <p className="text-lg font-bold text-indigo-400">10.7%</p>
            <p className="text-white/60">2015–2023</p>
          </div>
        </div>
      </div>

      {/* Risk/Return scatter */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader title="Risk/Return vs. Public Credit" subtitle="Private credit offers superior risk-adjusted returns" />
        <RiskReturnScatter />
        <InfoBox
          text="Private credit occupies an attractive position on the efficient frontier — higher returns than public high-yield and leveraged loans with comparable or lower volatility due to hold-to-maturity nature and covenant protections."
          variant="info"
        />
      </div>

      {/* J-Curve explanation */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader title="J-Curve Effect" subtitle="Why early returns look negative in closed-end private credit funds" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 text-xs text-white/60">
            <p>Closed-end private credit funds exhibit a J-curve because:</p>
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 font-mono">1.</span>
              Management fees and setup costs drag returns early
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 font-mono">2.</span>
              Capital is deployed gradually (12–24 months), meaning early years earn on only partial capital
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 font-mono">3.</span>
              Investments must be marked conservatively at cost initially
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 font-mono">4.</span>
              Cash flows accelerate in years 3–7 as loans mature and PIK income is realized
            </div>
          </div>
          <div>
            <svg viewBox="0 0 200 100" className="w-full">
              <defs>
                <linearGradient id="jcurveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="45%" stopColor="#f87171" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <line x1={20} y1={10} x2={20} y2={80} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
              <line x1={20} y1={50} x2={190} y2={50} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
              <path d="M 25 48 Q 40 75 60 70 Q 80 65 90 52 Q 120 35 150 20 Q 170 12 185 10"
                fill="none" stroke="url(#jcurveGrad)" strokeWidth={2.5} strokeLinejoin="round" />
              <text x={50} y={90} textAnchor="middle" fontSize={7} fill="rgba(244,63,94,0.8)">Deploy phase</text>
              <text x={140} y={90} textAnchor="middle" fontSize={7} fill="rgba(52,211,153,0.8)">Harvest phase</text>
              <text x={18} y={7} fontSize={7} fill="rgba(255,255,255,0.4)" textAnchor="end">+%</text>
              <text x={18} y={55} fontSize={7} fill="rgba(255,255,255,0.4)" textAnchor="end">0</text>
            </svg>
            <p className="text-xs text-white/40 text-center">Illustrative IRR profile over fund life</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: Special Situations ─────────────────────────────────────────────────

const SPECIAL_INSTRUMENTS = [
  {
    name: "Mezzanine Debt",
    yield: "12–18%",
    structure: "Subordinated debt + warrants",
    security: "Unsecured / 2nd lien",
    typical: "LBOs, growth capex",
    color: "amber",
    desc: "Hybrid between debt and equity. Typically unsecured or junior secured with warrant coverage (equity kicker). Receives coupon + PIK + equity upside at exit.",
    pros: ["Higher yield than senior debt", "Equity upside via warrants", "Priority over equity in liquidation"],
    cons: ["Unsecured — high loss given default", "Complex structures require legal expertise", "Illiquid — few secondary buyers"],
  },
  {
    name: "Preferred Equity",
    yield: "10–15%",
    structure: "Preferred shares + dividend",
    security: "Senior to common equity",
    typical: "Real estate, growth equity",
    color: "purple",
    desc: "Equity instrument with debt-like features. Fixed dividend (cumulative or non-cumulative), conversion rights, and liquidation preference. Common in real estate JVs and growth companies.",
    pros: ["Cumulative dividends (accrues if missed)", "Liquidation preference over common", "Conversion option for upside"],
    cons: ["Junior to all debt — last before common", "Dividend not tax-deductible for issuer", "Returns capped without participation feature"],
  },
  {
    name: "Royalty Financing",
    yield: "8–15%",
    structure: "Revenue royalty stream",
    security: "Revenue lien",
    typical: "Mining, pharmaceuticals, music",
    color: "blue",
    desc: "Lender receives a percentage of gross revenue in perpetuity or until a cap (e.g., 2–3x invested capital). No dilution, no fixed payments — self-regulating with business performance.",
    pros: ["No dilution for founders", "Self-scaling with revenue growth", "Non-correlated to market cycles"],
    cons: ["Complex valuation of royalty stream", "Upside capped at royalty multiple", "Depends heavily on revenue trajectory"],
  },
  {
    name: "Revenue-Based Financing",
    yield: "6–25%",
    structure: "Fixed repayment cap (1.3–2.0x)",
    security: "Revenue assignment",
    typical: "SaaS, e-commerce, DTC brands",
    color: "emerald",
    desc: "Company receives capital and repays via a fixed % of monthly revenue until a cap is reached. Popular with venture-backed SaaS companies that prefer non-dilutive growth capital.",
    pros: ["Non-dilutive — no equity given up", "Repayment scales with performance", "Quick close (days vs months)"],
    cons: ["Expensive if company grows fast (high effective IRR)", "Recourse may include IP/brand assignment", "Lender has limited upside vs equity"],
  },
];

function CapitalStructureSVG() {
  const W = 380;
  const H = 280;

  const layers = [
    { label: "Senior Secured (1st Lien)", y: 30, h: 42, fill: "rgba(16,185,129,0.5)", stroke: "#10b981", pct: "35–50%", yield: "8–11%", priority: "Highest" },
    { label: "Senior Secured (2nd Lien)", y: 78, h: 36, fill: "rgba(59,130,246,0.4)", stroke: "#3b82f6", pct: "45–60%", yield: "10–13%", priority: "2nd" },
    { label: "Unitranche", y: 120, h: 36, fill: "rgba(99,102,241,0.4)", stroke: "#6366f1", pct: "50–65%", yield: "10–13%", priority: "Blended" },
    { label: "Mezzanine / Sub. Debt", y: 162, h: 36, fill: "rgba(245,158,11,0.4)", stroke: "#f59e0b", pct: "60–75%", yield: "14–18%", priority: "3rd" },
    { label: "Preferred Equity", y: 204, h: 30, fill: "rgba(168,85,247,0.4)", stroke: "#a855f7", pct: "75–90%", yield: "10–15%", priority: "4th" },
    { label: "Common Equity", y: 240, h: 30, fill: "rgba(239,68,68,0.3)", stroke: "#ef4444", pct: "90–100%", yield: "Residual", priority: "Last" },
  ];

  const wBase = 320;
  const wStep = (wBase - 200) / (layers.length - 1);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl" style={{ minWidth: 300 }}>
        <text x={W / 2} y={16} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)" fontWeight="bold">
          CAPITAL STRUCTURE — LIQUIDATION PRIORITY (TOP = FIRST PAID)
        </text>
        {layers.map((layer, i) => {
          const w = wBase - i * wStep;
          const x = (W - w) / 2;
          return (
            <g key={layer.label}>
              <rect x={x} y={layer.y} width={w} height={layer.h - 2} rx={4} fill={layer.fill} stroke={layer.stroke} strokeWidth={1} />
              <text x={W / 2} y={layer.y + layer.h / 2 + 1} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.9)" fontWeight="600">
                {layer.label}
              </text>
              <text x={W / 2} y={layer.y + layer.h / 2 + 10} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.5)">
                LTV: {layer.pct} · Yield: {layer.yield}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SpecialSituationsTab() {
  const [selected, setSelected] = useState<string>("Mezzanine Debt");
  const detail = SPECIAL_INSTRUMENTS.find((s) => s.name === selected)!;

  const colorMap: Record<string, string> = {
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    purple: "border-purple-500/40 bg-purple-500/10 text-purple-400",
    blue: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Mezz Yield Range" value="12–18%" sub="+ equity kicker upside" highlight="pos" icon={Percent} />
        <StatCard label="Preferred Equity" value="10–15%" sub="cumulative dividend" highlight="pos" icon={Star} />
        <StatCard label="Royalty Financing" value="8–15%" sub="revenue royalty stream" highlight="neutral" icon={Activity} />
        <StatCard label="RBF Repayment Cap" value="1.3–2.0x" sub="of invested principal" highlight="neutral" icon={BarChart3} />
      </div>

      {/* Instrument selector */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader title="Special Situations Instruments" subtitle="Click an instrument to explore" />
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SPECIAL_INSTRUMENTS.map((inst) => (
            <button
              key={inst.name}
              onClick={() => setSelected(inst.name)}
              className={cn(
                "rounded-lg border p-2.5 text-left transition-all text-xs",
                selected === inst.name
                  ? colorMap[inst.color]
                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              <p className="font-semibold text-xs mb-0.5">{inst.name}</p>
              <p className="text-xs opacity-70">{inst.yield}</p>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="space-y-3">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-white/50 mb-1">Structure</p>
                <p className="text-sm text-white font-semibold">{detail.structure}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-white/50 mb-1">Security</p>
                <p className="text-sm text-white">{detail.security}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-white/50 mb-1">Typical Use Case</p>
                <p className="text-sm text-white">{detail.typical}</p>
              </div>
              <p className="text-xs text-white/60 rounded-lg bg-white/5 p-3">{detail.desc}</p>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
                <p className="text-xs font-semibold text-emerald-400 mb-2">Advantages</p>
                <ul className="space-y-1.5">
                  {detail.pros.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs text-white/70">
                      <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3">
                <p className="text-xs font-semibold text-rose-400 mb-2">Risks</p>
                <ul className="space-y-1.5">
                  {detail.cons.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-xs text-white/70">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-rose-400" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Capital structure SVG */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader title="Capital Structure Positioning" subtitle="Where each instrument sits in the stack" />
        <CapitalStructureSVG />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 text-xs text-white/60">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5">
            <span className="font-semibold text-emerald-400">Senior Secured:</span> First priority lien on all assets. Lowest default loss.
          </div>
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5">
            <span className="font-semibold text-amber-400">Mezzanine:</span> Subordinated; earns equity-like returns with debt protections.
          </div>
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5">
            <span className="font-semibold text-rose-400">Common Equity:</span> Last in line; unlimited upside but all losses absorbed first.
          </div>
        </div>
      </div>

      {/* Comparison matrix */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionHeader title="Special Situations Comparison Matrix" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-2 text-left text-xs font-medium text-white/50">Instrument</th>
                <th className="pb-2 text-right text-xs font-medium text-white/50">Yield</th>
                <th className="pb-2 text-right text-xs font-medium text-white/50">Equity Upside</th>
                <th className="pb-2 text-right text-xs font-medium text-white/50">Liquidity</th>
                <th className="pb-2 text-right text-xs font-medium text-white/50">Typical Term</th>
                <th className="pb-2 text-right text-xs font-medium text-white/50">Dilutive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ["Mezzanine Debt", "12–18%", "Yes (warrants)", "Low", "5–7 yrs", "Partial"],
                ["Preferred Equity", "10–15%", "Sometimes", "Low", "3–7 yrs", "Yes"],
                ["Royalty Financing", "8–15%", "No", "Very Low", "Perpetual/cap", "No"],
                ["Rev-Based Financing", "Var. 6–25%", "No", "None", "12–36 mos", "No"],
                ["Convertible Note", "4–8%", "Yes (conversion)", "Moderate", "2–5 yrs", "Yes (at conv)"],
              ].map(([inst, yld, eq, liq, term, dil]) => (
                <tr key={inst} className="hover:bg-white/5">
                  <td className="py-2 text-white/80 font-medium">{inst}</td>
                  <td className="py-2 text-right text-amber-400">{yld}</td>
                  <td className="py-2 text-right text-white/60">{eq}</td>
                  <td className="py-2 text-right text-white/60">{liq}</td>
                  <td className="py-2 text-right text-white/60">{term}</td>
                  <td className={cn("py-2 text-right", dil === "No" ? "text-emerald-400" : "text-rose-400")}>{dil}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InfoBox
        text="Special situations investing requires deep credit and legal expertise. Structures like mezzanine and revenue-based financing often involve complex intercreditor arrangements, subordination agreements, and bespoke covenants tailored to each borrower's cashflow profile."
        variant="warn"
      />
    </div>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────

export default function PrivateCreditPage() {
  // Consume rand pool to ensure deterministic page renders
  void useMemo(() => {
    const _vals: number[] = [];
    for (let i = 0; i < 20; i++) _vals.push(r());
    return _vals;
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <Briefcase className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Private Credit</h1>
            <p className="text-sm text-white/50">Direct Lending · BDCs · Special Situations</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/50">
          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">$2.1T Market</Badge>
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Floating Rate</Badge>
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">10–14% Yield</Badge>
          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20">Illiquid Premium</Badge>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-6 flex h-auto flex-wrap gap-1 bg-white/5 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg px-3 py-1.5 text-xs data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/60">
            Market Overview
          </TabsTrigger>
          <TabsTrigger value="direct" className="rounded-lg px-3 py-1.5 text-xs data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/60">
            Direct Lending
          </TabsTrigger>
          <TabsTrigger value="bdc" className="rounded-lg px-3 py-1.5 text-xs data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/60">
            BDC Analysis
          </TabsTrigger>
          <TabsTrigger value="risk" className="rounded-lg px-3 py-1.5 text-xs data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/60">
            Risk &amp; Returns
          </TabsTrigger>
          <TabsTrigger value="special" className="rounded-lg px-3 py-1.5 text-xs data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/60">
            Special Situations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="data-[state=inactive]:hidden">
          <MarketOverviewTab />
        </TabsContent>
        <TabsContent value="direct" className="data-[state=inactive]:hidden">
          <DirectLendingTab />
        </TabsContent>
        <TabsContent value="bdc" className="data-[state=inactive]:hidden">
          <BDCAnalysisTab />
        </TabsContent>
        <TabsContent value="risk" className="data-[state=inactive]:hidden">
          <RiskReturnsTab />
        </TabsContent>
        <TabsContent value="special" className="data-[state=inactive]:hidden">
          <SpecialSituationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
