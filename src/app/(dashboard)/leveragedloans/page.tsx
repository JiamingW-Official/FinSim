"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  TrendingUp,
  BarChart3,
  Shield,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Building2,
  DollarSign,
  Percent,
  Activity,
  PieChart,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 921;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Generate data with seed reset helper
function withSeed<T>(seed: number, fn: () => T): T {
  s = seed;
  return fn();
}

// ── Data generation ───────────────────────────────────────────────────────────

interface MarketSizePoint {
  year: number;
  size: number; // $T
}

interface CovLitePoint {
  year: number;
  pct: number;
}

interface DefaultRatePoint {
  year: number;
  rate: number;
}

interface RecoveryBar {
  label: string;
  recovery: number;
  color: string;
}

interface SpreadPoint {
  year: number;
  loanSpread: number;
  hySpread: number;
}

const marketSizeData: MarketSizePoint[] = withSeed(921, () => {
  const baseYears = [
    2000, 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024,
  ];
  const baseSizes = [0.26, 0.30, 0.38, 0.55, 0.48, 0.52, 0.60, 0.78, 0.90, 1.10, 1.00, 1.25, 1.40];
  return baseYears.map((year, i) => ({
    year,
    size: baseSizes[i] + (rand() * 0.03 - 0.015),
  }));
});

const covLiteData: CovLitePoint[] = withSeed(922, () => {
  const pts: { year: number; base: number }[] = [
    { year: 2012, base: 20 },
    { year: 2013, base: 30 },
    { year: 2014, base: 45 },
    { year: 2015, base: 55 },
    { year: 2016, base: 62 },
    { year: 2017, base: 70 },
    { year: 2018, base: 75 },
    { year: 2019, base: 80 },
    { year: 2020, base: 82 },
    { year: 2021, base: 87 },
    { year: 2022, base: 85 },
    { year: 2023, base: 88 },
    { year: 2024, base: 90 },
  ];
  return pts.map((p) => ({ year: p.year, pct: p.base + (rand() * 2 - 1) }));
});

const defaultRateData: DefaultRatePoint[] = withSeed(923, () => {
  const pts: { year: number; base: number }[] = [
    { year: 1998, base: 2.1 },
    { year: 1999, base: 3.2 },
    { year: 2000, base: 4.5 },
    { year: 2001, base: 8.2 },
    { year: 2002, base: 7.8 },
    { year: 2003, base: 5.1 },
    { year: 2004, base: 2.4 },
    { year: 2005, base: 1.4 },
    { year: 2006, base: 0.8 },
    { year: 2007, base: 1.1 },
    { year: 2008, base: 4.2 },
    { year: 2009, base: 10.8 },
    { year: 2010, base: 5.3 },
    { year: 2011, base: 2.1 },
    { year: 2012, base: 1.5 },
    { year: 2013, base: 1.2 },
    { year: 2014, base: 1.0 },
    { year: 2015, base: 1.6 },
    { year: 2016, base: 2.4 },
    { year: 2017, base: 1.5 },
    { year: 2018, base: 1.2 },
    { year: 2019, base: 1.8 },
    { year: 2020, base: 4.4 },
    { year: 2021, base: 1.6 },
    { year: 2022, base: 1.1 },
    { year: 2023, base: 2.2 },
    { year: 2024, base: 2.8 },
  ];
  return pts.map((p) => ({ year: p.year, rate: p.base + (rand() * 0.3 - 0.15) }));
});

const recoveryData: RecoveryBar[] = [
  { label: "1st Lien TL", recovery: 72, color: "#22c55e" },
  { label: "2nd Lien TL", recovery: 43, color: "#f59e0b" },
  { label: "Sr. Unsecured", recovery: 32, color: "#f97316" },
  { label: "Sub. Debt", recovery: 18, color: "#ef4444" },
  { label: "Equity", recovery: 5, color: "#7f1d1d" },
];

const spreadData: SpreadPoint[] = withSeed(924, () => {
  const pts: { year: number; loan: number; hy: number }[] = [
    { year: 2018, loan: 340, hy: 360 },
    { year: 2019, loan: 380, hy: 400 },
    { year: 2020, loan: 520, hy: 600 },
    { year: 2021, loan: 380, hy: 420 },
    { year: 2022, loan: 490, hy: 540 },
    { year: 2023, loan: 430, hy: 470 },
    { year: 2024, loan: 400, hy: 440 },
  ];
  return pts.map((p) => ({
    year: p.year,
    loanSpread: p.loan + (rand() * 20 - 10),
    hySpread: p.hy + (rand() * 20 - 10),
  }));
});

// ── Info tooltip component ────────────────────────────────────────────────────
function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card/60 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatChip({
  label,
  value,
  color = "blue",
}: {
  label: string;
  value: string;
  color?: "blue" | "green" | "amber" | "red" | "purple";
}) {
  const colors = {
    blue: "bg-muted/60 text-primary border-border",
    green: "bg-green-900/40 text-green-300 border-green-800",
    amber: "bg-amber-900/40 text-amber-300 border-amber-800",
    red: "bg-red-900/40 text-red-300 border-red-800",
    purple: "bg-muted/60 text-primary border-border",
  };
  return (
    <div className={cn("rounded-md border px-3 py-2 text-center", colors[color])}>
      <div className="text-xs opacity-70 mb-0.5">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

// ── Tab 1: Loan Structure ─────────────────────────────────────────────────────

function LoanStructureTab() {
  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="Market Size" value="$1.4T" color="blue" />
        <StatChip label="Typical Spread" value="SOFR+350-500" color="green" />
        <StatChip label="Min. Rating" value="BB/Ba2 or below" color="amber" />
        <StatChip label="Avg. Maturity" value="5–7 years" color="purple" />
      </div>

      {/* Definition */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">What is a Leveraged Loan?</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A leveraged loan is a syndicated credit facility extended to below-investment-grade borrowers
          (rated BB+/Ba1 or lower, or unrated) or borrowers with a debt-to-EBITDA ratio above 4–5×.
          Priced as a floating-rate instrument — historically LIBOR + spread, now <span className="text-primary font-medium">SOFR + credit spread</span> —
          they provide inflation-linked income to lenders and flexibility to leveraged buyout (LBO)
          borrowers. The market is dominated by Term Loan B (TLB) structures favored by institutional investors.
        </p>
      </div>

      {/* Term Loan types table */}
      <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Facility Type Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Feature", "Revolver", "Term Loan A (TLA)", "Term Loan B (TLB)", "Term Loan C (TLC)"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Investor Base", "Banks", "Banks / BDCs", "CLOs / Inst. Investors", "Mezz / Hedge Funds"],
                ["Amortization", "Revolving", "~20% / year", "~1% / year", "~1% / year"],
                ["Maturity", "5 years", "5 years", "6–7 years", "7–8 years"],
                ["Spread Range", "SOFR+150-300", "SOFR+175-325", "SOFR+300-500", "SOFR+450-650"],
                ["Purpose", "Working capital", "Acquisition / capex", "LBO / refinancing", "Subordinated gap"],
                ["Maintenance Covenants", "Yes (springing)", "Yes", "Rarely (cov-lite)", "Rarely"],
              ].map((row, i) => (
                <tr key={i} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-card/30" : "")}>
                  {row.map((cell, j) => (
                    <td key={j} className={cn("px-4 py-2 text-muted-foreground", j === 0 ? "font-medium text-foreground" : "")}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capital structure SVG */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Typical LBO Capital Structure</h3>
        <svg viewBox="0 0 480 220" className="w-full max-w-lg mx-auto">
          {/* First lien */}
          <rect x="40" y="10" width="400" height="44" rx="4" fill="#1d4ed8" opacity="0.8" />
          <text x="240" y="27" textAnchor="middle" fill="#bfdbfe" fontSize="11" fontWeight="600">1st Lien Term Loan B</text>
          <text x="240" y="44" textAnchor="middle" fill="#93c5fd" fontSize="10">SOFR + 375–450 bps | 45–55% of cap structure</text>
          {/* Revolver badge */}
          <rect x="380" y="14" width="50" height="16" rx="3" fill="#1e40af" />
          <text x="405" y="25" textAnchor="middle" fill="#bfdbfe" fontSize="8">+ RCF</text>

          {/* Second lien */}
          <rect x="40" y="62" width="400" height="40" rx="4" fill="#7c3aed" opacity="0.8" />
          <text x="240" y="78" textAnchor="middle" fill="#ede9fe" fontSize="11" fontWeight="600">2nd Lien Term Loan</text>
          <text x="240" y="94" textAnchor="middle" fill="#c4b5fd" fontSize="10">SOFR + 650–850 bps | 5–15% of cap structure</text>

          {/* Unsecured notes */}
          <rect x="40" y="110" width="400" height="40" rx="4" fill="#b45309" opacity="0.8" />
          <text x="240" y="126" textAnchor="middle" fill="#fef3c7" fontSize="11" fontWeight="600">Senior Unsecured Notes (High Yield)</text>
          <text x="240" y="142" textAnchor="middle" fill="#fde68a" fontSize="10">Fixed rate 6–9% | 10–20% of cap structure</text>

          {/* Equity */}
          <rect x="40" y="158" width="400" height="40" rx="4" fill="#166534" opacity="0.8" />
          <text x="240" y="174" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">Sponsor Equity</text>
          <text x="240" y="190" textAnchor="middle" fill="#a7f3d0" fontSize="10">30–40% of cap structure | junior to all debt</text>

          {/* Arrows / labels */}
          <text x="10" y="55" textAnchor="middle" fill="#ef4444" fontSize="9" transform="rotate(-90,10,100)">SENIOR →</text>
          <text x="10" y="195" textAnchor="middle" fill="#22c55e" fontSize="9" transform="rotate(-90,10,170)">JUNIOR</text>
        </svg>
      </div>

      {/* LIBOR to SOFR transition */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">LIBOR → SOFR Transition Timeline</h3>
        <div className="relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
          <div className="flex justify-between relative z-10">
            {[
              { year: "2017", event: "FCA announces LIBOR end", color: "bg-muted" },
              { year: "2021", event: "CME SOFR futures launch", color: "bg-primary" },
              { year: "Jun 2023", event: "USD LIBOR cessation", color: "bg-amber-600" },
              { year: "2024", event: "Market fully SOFR-based", color: "bg-green-600" },
            ].map((pt, i) => (
              <div key={i} className="flex flex-col items-center max-w-[90px]">
                <div className={cn("w-3 h-3 rounded-full border-2 border-border", pt.color)} />
                <div className="text-xs text-muted-foreground mt-1 font-medium text-center">{pt.year}</div>
                <div className="text-xs text-muted-foreground text-center mt-0.5 leading-tight">{pt.event}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/60 p-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">Credit Spread Adjustment (CSA)</div>
            <div className="text-xs text-muted-foreground">ARRC recommended a 26.161 bps CSA for 3-month LIBOR fallbacks to SOFR. Legacy loans used ISDA fallback protocol or hardwired amendment approach. New originations are pure SOFR + margin.</div>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">Floor Mechanics</div>
            <div className="text-xs text-muted-foreground">Most leveraged loans include a SOFR floor of 0–50 bps (typically 0 bps post-2022 rate hikes). Floor protects lenders from near-zero SOFR environments; borrowers negotiate floor levels at origination.</div>
          </div>
        </div>
      </div>

      {/* Covenant types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-amber-800/50 bg-amber-900/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Maintenance Covenants</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Tested every quarter regardless of events</li>
            <li>• Typical: Max Net Leverage (e.g., 6.5×), Min Interest Coverage (e.g., 2.0×)</li>
            <li>• Breach triggers acceleration / remediation right</li>
            <li>• More common in TLA, revolver, and European loans</li>
            <li>• Equity cure right: sponsor can inject equity to cure breach</li>
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Incurrence Covenants (Cov-Lite)</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Tested only when a specific action is taken (e.g., new debt, dividends)</li>
            <li>• No ongoing compliance testing — common in TLB post-2013</li>
            <li>• Basket-based: general debt basket, free-and-clear basket, ratio basket</li>
            <li>• EBITDA add-backs have grown aggressively (50–100% in sponsor loans)</li>
            <li>• Portability: debt can remain outstanding in an acquisition if conditions met</li>
          </ul>
        </div>
      </div>

      {/* Key doc terms */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">Key Documentation Terms</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { term: "MFN (Most Favored Nation)", desc: "If new TLB is issued at a spread 50+ bps wider than existing TLB, existing holders get the higher spread. Typically 6–12 month sunset." },
            { term: "AHYDO", desc: "Applicable High Yield Discount Obligation rules under IRS §163(e)(5). PIK features in debt instruments can trigger AHYDO and cause non-deductibility of certain accruals." },
            { term: "Portability", desc: "Allows the credit agreement to be assumed by an acquirer without triggering change-of-control, subject to leverage and other conditions. Valuable in sponsor M&A." },
            { term: "Accordion Feature", desc: "Uncommitted incremental capacity allowing the borrower to add more debt under the same credit agreement, subject to leverage test (often MFN-protected)." },
            { term: "ECF Sweep", desc: "Excess Cash Flow sweep (25–50% declining to 0% as leverage falls) mandates partial prepayment annually, reducing lender duration risk." },
            { term: "Call Premium / Make-Whole", desc: "Term loans typically have 101 soft-call protection for 6 months (vs 3yr NC+calls in HY bonds). Call premiums protect lenders from quick refinancing." },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-muted/50 p-3">
              <div className="text-xs font-medium text-foreground mb-1">{item.term}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Amortization schedule */}
      <InfoCard title="Amortization Schedule: TLA vs TLB">
        <div className="space-y-2">
          <p><span className="text-foreground font-medium">Term Loan A:</span> Amortizes ~20% of principal per year. A $500M TLA would require $100M/year in scheduled principal payments, with the remainder at maturity. Banks prefer TLA structures due to faster capital return.</p>
          <p><span className="text-foreground font-medium">Term Loan B:</span> Nominal 1% per annum amortization (~$1.25M/quarter on $500M). Effectively bullet maturity at year 6–7. Suits CLO managers who want stable asset base. Prepayable at par (after soft-call period).</p>
          <p><span className="text-foreground font-medium">Voluntary Prepayment:</span> Permitted at any time (subject to 101 soft call in first 6 months). No make-whole premium unlike HY bonds. Borrowers refinance opportunistically when spreads tighten.</p>
        </div>
      </InfoCard>
    </div>
  );
}

// ── Tab 2: Syndication Process ────────────────────────────────────────────────

function SyndicationTab() {
  const pieSlices = useMemo(() => {
    const data = [
      { label: "CLOs", pct: 65, color: "#3b82f6" },
      { label: "Mutual Funds / ETFs", pct: 20, color: "#22c55e" },
      { label: "Hedge Funds", pct: 15, color: "#f59e0b" },
    ];
    let cumulative = 0;
    const cx = 80;
    const cy = 80;
    const r = 65;
    return data.map((d) => {
      const startAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
      cumulative += d.pct;
      const endAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = d.pct > 50 ? 1 : 0;
      const midAngle = startAngle + (endAngle - startAngle) / 2;
      const lx = cx + (r + 18) * Math.cos(midAngle);
      const ly = cy + (r + 18) * Math.sin(midAngle);
      return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, lx, ly };
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="Lead Arranger Fee" value="1–2.5% OID" color="blue" />
        <StatChip label="Syndication Period" value="4–8 weeks" color="green" />
        <StatChip label="Typical Investors" value="200–400 per deal" color="amber" />
        <StatChip label="Min. Ticket Size" value="$5M–$25M" color="purple" />
      </div>

      {/* Role SVG */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Key Participants & Roles</h3>
        <svg viewBox="0 0 500 130" className="w-full">
          {/* Boxes */}
          {[
            { x: 10, label: "Borrower / Sponsor", sub: "(PE-backed co.)", color: "#1d4ed8" },
            { x: 130, label: "Lead Arranger / Bookrunner", sub: "(Bulge bracket bank)", color: "#7c3aed" },
            { x: 270, label: "Syndicate Members", sub: "(Co-arrangers)", color: "#0f766e" },
            { x: 390, label: "Agent Bank", sub: "(Admin / collateral)", color: "#b45309" },
          ].map((b, i) => (
            <g key={i}>
              <rect x={b.x} y="10" width="110" height="50" rx="6" fill={b.color} opacity="0.25" stroke={b.color} strokeWidth="1" />
              <text x={b.x + 55} y="31" textAnchor="middle" fill="#e4e4e7" fontSize="9.5" fontWeight="600">{b.label}</text>
              <text x={b.x + 55} y="46" textAnchor="middle" fill="#a1a1aa" fontSize="8">{b.sub}</text>
            </g>
          ))}
          {/* Arrows */}
          <line x1="120" y1="35" x2="130" y2="35" stroke="#6b7280" strokeWidth="1.5" markerEnd="url(#arr)" />
          <line x1="240" y1="35" x2="270" y2="35" stroke="#6b7280" strokeWidth="1.5" markerEnd="url(#arr)" />
          <line x1="380" y1="35" x2="390" y2="35" stroke="#6b7280" strokeWidth="1.5" markerEnd="url(#arr)" />
          {/* Investors */}
          {[{ x: 180, label: "CLOs" }, { x: 255, label: "Mutual Funds" }, { x: 335, label: "Hedge Funds" }].map((inv, i) => (
            <g key={i}>
              <rect x={inv.x} y="88" width="64" height="28" rx="4" fill="#1f2937" stroke="#374151" strokeWidth="1" />
              <text x={inv.x + 32} y="105" textAnchor="middle" fill="#9ca3af" fontSize="9">{inv.label}</text>
              <line x1={inv.x + 32} y1="88" x2={inv.x + 32} y2="60" stroke="#374151" strokeWidth="1" strokeDasharray="3,2" />
            </g>
          ))}
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#6b7280" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Syndication timeline */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Syndication Timeline</h3>
        <div className="space-y-2">
          {[
            { phase: "Commitment Letter", days: "Day 0", desc: "Lead arranger commits to provide the full loan amount (underwritten) or best efforts. Mandated lead arranger (MLA) role secured. Fee letter executed.", color: "bg-primary" },
            { phase: "Due Diligence & Documentation", days: "Day 1–14", desc: "Credit agreement, collateral/security docs, lender call, confidential information memorandum (CIM) prepared. Rating agency process initiated.", color: "bg-primary" },
            { phase: "Launch / Marketing", days: "Day 14–28", desc: "Investor roadshow, bank meeting, online distribution. Price talk (spread + OID guidance) released. Flex language invoked if demand weak/strong.", color: "bg-teal-600" },
            { phase: "Allocation", days: "Day 28–35", desc: "Book closes. Oversubscribed books tightened (OID removed, spread lowered). Undersubscribed books flex wider or structure changes. Allocations communicated.", color: "bg-amber-600" },
            { phase: "Closing & Funding", days: "Day 35–42", desc: "Conditions precedent met (legal, regulatory). Commitments fund. Collateral agent takes security interest. Loan transfers to par desk.", color: "bg-green-600" },
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn("w-3 h-3 rounded-full mt-1 flex-shrink-0", step.color)} />
                {i < 4 && <div className="w-px flex-1 bg-muted mt-1" />}
              </div>
              <div className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-foreground">{step.phase}</span>
                  <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">{step.days}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flex mechanics */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">Flex Language Mechanics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { type: "Rate Flex", color: "border-border bg-muted/40", icon: "↕", desc: "Arranger can adjust the credit spread (typically ±50–100 bps) from price talk based on book quality. Positive flex = spread increases (book weak). Negative flex = spread decreases (oversubscribed)." },
            { type: "OID Flex", color: "border-border bg-muted/40", icon: "💲", desc: "Original Issue Discount can be adjusted (e.g., 99.0 → 98.5 floor) to increase effective yield for investors without changing stated spread. OID amortizes into income over loan life." },
            { type: "Structure Flex", color: "border-amber-700 bg-amber-900/20", icon: "⚙", desc: "More extreme: change amortization, maturity, or tranche sizing. E.g., increase TLB amount and reduce HY bonds; add 2nd lien. Requires borrower consent and re-documentation." },
          ].map((f, i) => (
            <div key={i} className={cn("rounded-lg border p-3", f.color)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{f.icon}</span>
                <span className="text-xs font-medium text-foreground">{f.type}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Investor pie chart */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Investor Base Composition</h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <svg viewBox="0 0 160 160" className="w-40 h-40 flex-shrink-0">
            {pieSlices.map((slice, i) => (
              <path key={i} d={slice.path} fill={slice.color} opacity="0.85" />
            ))}
            <circle cx="80" cy="80" r="30" fill="#18181b" />
            <text x="80" y="77" textAnchor="middle" fill="#e4e4e7" fontSize="9" fontWeight="600">$1.4T</text>
            <text x="80" y="90" textAnchor="middle" fill="#a1a1aa" fontSize="8">Market</text>
          </svg>
          <div className="flex flex-col gap-2 flex-1">
            {[
              { label: "CLOs (Collateralized Loan Obligations)", pct: 65, color: "#3b82f6", note: "Largest buyer; structural demand driven by CLO issuance cycle" },
              { label: "Loan Mutual Funds & ETFs", pct: 20, color: "#22c55e", note: "Retail-accessible; BKLN ETF, floating-rate fund flows key indicator" },
              { label: "Hedge Funds / Credit Opps", pct: 15, color: "#f59e0b", note: "Opportunistic; active in distressed, secondary market" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-sm mt-0.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <div className="text-xs font-medium text-muted-foreground">{item.label} <span className="text-muted-foreground">— {item.pct}%</span></div>
                  <div className="text-xs text-muted-foreground">{item.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary market */}
      <InfoCard title="Secondary Market Trading Conventions">
        <div className="space-y-2">
          <p><span className="text-foreground font-medium">Settlement:</span> T+7 for par loans (LSTA convention), T+20 for distressed. Accrued interest calculated on actual/360 basis. Transfer agreements governed by LSTA or LMA (Europe) standard form.</p>
          <p><span className="text-foreground font-medium">Par vs Distressed Desk:</span> Loans trading above 80 cents handled by par desk; below 80 cents by distressed desk with different documentation, due diligence (lien review, UCC searches), and pricing conventions.</p>
          <p><span className="text-foreground font-medium">LSTA Mark-to-Market:</span> Monthly LSTA consensus pricing; dealers provide bid/ask quotes. Bid-ask spreads: 25–50 bps for liquid par loans, 2–5 pts for distressed credits.</p>
          <p><span className="text-foreground font-medium">Trade Finance:</span> Buyers receive assignment (full rights) or participation (economic only, no voting rights). Majority of institutional trades are full assignments.</p>
        </div>
      </InfoCard>
    </div>
  );
}

// ── Tab 3: CLO Structure ──────────────────────────────────────────────────────

function CLOStructureTab() {
  const trancheData = [
    { label: "AAA (Class A)", pct: 62, spread: "S+130–160", color: "#1d4ed8", rating: "AAA" },
    { label: "AA (Class B)", pct: 9, spread: "S+185–220", color: "#2563eb", rating: "AA" },
    { label: "A (Class C)", pct: 6, spread: "S+245–280", color: "#7c3aed", rating: "A" },
    { label: "BBB (Class D)", pct: 5, spread: "S+320–380", color: "#9333ea", rating: "BBB" },
    { label: "BB (Class E)", pct: 4, spread: "S+550–650", color: "#d97706", rating: "BB" },
    { label: "Equity (Sub Notes)", pct: 8, spread: "15–20% IRR", color: "#dc2626", rating: "NR" },
  ];

  let cumY = 10;
  const svgTranches = trancheData.map((t) => {
    const h = Math.max(t.pct * 2.5, 22);
    const rect = { y: cumY, h };
    cumY += h + 3;
    return { ...t, ...rect };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="CLO Market (US)" value="~$1T+ AUM" color="blue" />
        <StatChip label="Typical CLO Size" value="$400M–$700M" color="green" />
        <StatChip label="Reinvestment Period" value="4 years" color="amber" />
        <StatChip label="Equity IRR Target" value="15–20%" color="purple" />
      </div>

      {/* CLO anatomy SVG */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">CLO Anatomy</h3>
        <svg viewBox="0 0 500 240" className="w-full">
          {/* Asset side */}
          <rect x="10" y="10" width="140" height="220" rx="6" fill="#1c1917" stroke="#44403c" strokeWidth="1" />
          <text x="80" y="28" textAnchor="middle" fill="#a8a29e" fontSize="10" fontWeight="600">ASSETS (Loans)</text>
          {[
            { label: "200–250 leveraged loans", y: 48 },
            { label: "Avg. BB-/B+ rating", y: 65 },
            { label: "Avg. spread: SOFR+380", y: 82 },
            { label: "Diversified by issuer (≤3%)", y: 99 },
            { label: "Industry limits (≤15%)", y: 116 },
            { label: "Min. 90% senior secured", y: 133 },
            { label: "CCC max 7.5%", y: 150 },
            { label: "WARF / WAD tests", y: 167 },
          ].map((item, i) => (
            <text key={i} x="20" y={item.y} fill="#78716c" fontSize="8.5">{item.label}</text>
          ))}
          <text x="80" y="210" textAnchor="middle" fill="#57534e" fontSize="8">~$500M notional</text>

          {/* Arrow */}
          <line x1="150" y1="120" x2="180" y2="120" stroke="#6b7280" strokeWidth="1.5" />
          <polygon points="178,116 186,120 178,124" fill="#6b7280" />
          <text x="165" y="113" textAnchor="middle" fill="#6b7280" fontSize="8">SPV</text>

          {/* Tranche side */}
          <text x="340" y="12" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontWeight="600">LIABILITIES (Tranches)</text>
          {svgTranches.map((t, i) => (
            <g key={i}>
              <rect x="185" y={t.y + 18} width="310" height={t.h} rx="3" fill={t.color} opacity="0.3" stroke={t.color} strokeWidth="0.5" />
              <text x="200" y={t.y + 18 + t.h / 2 + 4} fill="#e4e4e7" fontSize="9" fontWeight="500">{t.label}</text>
              <text x="460" y={t.y + 18 + t.h / 2 + 4} textAnchor="end" fill="#a1a1aa" fontSize="8">{t.pct}% | {t.spread}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Tranche stack detail */}
      <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Tranche Stack Detail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Tranche", "% of Cap", "Rating", "Typical Spread", "Buyers", "Credit Enhancement"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Class A (AAA)", "62%", "AAA / Aaa", "S+130–160", "Banks, insurers, SWFs", "38% subordination"],
                ["Class B (AA)", "9%", "AA / Aa2", "S+185–220", "Banks, insurers", "29% subordination"],
                ["Class C (A)", "6%", "A / A2", "S+245–280", "Credit funds, banks", "23% subordination"],
                ["Class D (BBB)", "5%", "BBB / Baa2", "S+320–380", "HY credit funds", "18% subordination"],
                ["Class E (BB)", "4%", "BB / Ba2", "S+550–650", "Hedge funds, CLO mgrs", "14% subordination"],
                ["Equity (Sub Notes)", "8%", "NR", "15–20% IRR", "CLO managers, family offices", "First loss"],
              ].map((row, i) => (
                <tr key={i} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-card/30" : "")}>
                  {row.map((cell, j) => (
                    <td key={j} className={cn("px-4 py-2 text-muted-foreground", j === 0 ? "font-medium" : "")}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OC / IC tests */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">OC (Overcollateralization) Test</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">OC Ratio = Par Value of Assets / Par Value of Rated Notes</p>
          <p className="text-xs text-muted-foreground mb-2">Example Class A OC: $500M assets / $310M Class A = 161% (min. trigger ~120%)</p>
          <p className="text-xs text-muted-foreground">Breach: cash diverted from equity to pay down notes sequentially until test cured. Effectively de-levers the CLO structure.</p>
        </div>
        <div className="rounded-xl border border-green-800/50 bg-green-900/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">IC (Interest Coverage) Test</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">IC Ratio = Interest Income from Assets / Interest Due on Rated Notes</p>
          <p className="text-xs text-muted-foreground mb-2">Example Class A IC: $32M income / $18M interest = 178% (min. ~120%)</p>
          <p className="text-xs text-muted-foreground">Breach: interest proceeds redirected to redeem notes rather than flowing to equity. Critical during rising default / falling SOFR environments.</p>
        </div>
      </div>

      {/* CLO evolution */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">CLO Generation Evolution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              gen: "CLO 1.0 (Pre-2008)",
              color: "border-border bg-muted/40",
              items: [
                "Higher equity leverage ratios",
                "Less stringent diversity tests",
                "Some exposure to ABS/RMBS",
                "Manager discretion on CCC buckets",
                "Decimated in 2008–09 crisis",
              ],
            },
            {
              gen: "CLO 2.0 (2010–2013)",
              color: "border-border bg-muted/30",
              items: [
                "Pure senior secured loan collateral",
                "Risk retention requirements (US: 5%)",
                "Tighter diversity / CCC limits",
                "Shorter reinvestment periods (3–4yr)",
                "Better aligned incentives (equity retained)",
              ],
            },
            {
              gen: "CLO 3.0 (2014–Present)",
              color: "border-green-800 bg-green-900/10",
              items: [
                "US courts voided risk retention for open-market CLOs",
                "Longer reinvestment periods (5yr)",
                "ESG overlay (some managers)",
                "Static CLO variants for HY bonds",
                "CLO ETF products launched (CLO tranches as fund assets)",
              ],
            },
          ].map((gen, i) => (
            <div key={i} className={cn("rounded-lg border p-3", gen.color)}>
              <div className="text-xs font-medium text-foreground mb-2">{gen.gen}</div>
              <ul className="space-y-1">
                {gen.items.map((item, j) => (
                  <li key={j} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CLO Arbitrage */}
      <InfoCard title="CLO Arbitrage: Asset Spread vs. Liability Cost">
        <div className="space-y-2">
          <p><span className="text-foreground font-medium">The Arb:</span> CLO equity profits from the spread difference between loan asset yield (SOFR + ~380 bps) and weighted-average cost of liabilities (SOFR + ~185 bps on ~92% rated notes). Net arb ~200 bps on $500M = ~$10M/year before manager fees and defaults.</p>
          <p><span className="text-foreground font-medium">Equity IRR Drivers:</span> (1) Loan spread at ramp-up, (2) Default rate during reinvestment, (3) Recovery rates, (4) SOFR level (higher SOFR widens arb on floating liabilities but increases borrower stress), (5) Reprice/refi activity (tightens asset spread).</p>
          <p><span className="text-foreground font-medium">Manager Compensation:</span> Senior management fee ~0.15–0.20% + subordinated fee ~0.20–0.30% (paid after equity distributions meet a hurdle, ~12% IRR). Performance alignment critical for equity investors.</p>
        </div>
      </InfoCard>
    </div>
  );
}

// ── Tab 4: Market Dynamics ────────────────────────────────────────────────────

function MarketDynamicsTab() {
  const marketW = 500;
  const marketH = 120;
  const mMinY = Math.min(...marketSizeData.map((d) => d.size));
  const mMaxY = Math.max(...marketSizeData.map((d) => d.size));
  const mMinX = marketSizeData[0].year;
  const mMaxX = marketSizeData[marketSizeData.length - 1].year;
  const mx = (v: number) => ((v - mMinX) / (mMaxX - mMinX)) * (marketW - 60) + 30;
  const my = (v: number) => marketH - 15 - ((v - mMinY) / (mMaxY - mMinY)) * (marketH - 30);
  const marketPath = marketSizeData.map((d, i) => `${i === 0 ? "M" : "L"} ${mx(d.year)} ${my(d.size)}`).join(" ");
  const marketArea = `${marketPath} L ${mx(mMaxX)} ${marketH - 15} L ${mx(mMinX)} ${marketH - 15} Z`;

  // Cov-lite area chart
  const clW = 500;
  const clH = 110;
  const clMinX = covLiteData[0].year;
  const clMaxX = covLiteData[covLiteData.length - 1].year;
  const clx = (v: number) => ((v - clMinX) / (clMaxX - clMinX)) * (clW - 60) + 30;
  const cly = (v: number) => clH - 15 - (v / 100) * (clH - 30);
  const clPath = covLiteData.map((d, i) => `${i === 0 ? "M" : "L"} ${clx(d.year)} ${cly(d.pct)}`).join(" ");
  const clArea = `${clPath} L ${clx(clMaxX)} ${clH - 15} L ${clx(clMinX)} ${clH - 15} Z`;

  // Default rate line
  const drW = 500;
  const drH = 130;
  const drMinX = defaultRateData[0].year;
  const drMaxX = defaultRateData[defaultRateData.length - 1].year;
  const drMinY = 0;
  const drMaxY = 12;
  const drx = (v: number) => ((v - drMinX) / (drMaxX - drMinX)) * (drW - 60) + 30;
  const dry = (v: number) => drH - 15 - ((v - drMinY) / (drMaxY - drMinY)) * (drH - 30);
  const drPath = defaultRateData.map((d, i) => `${i === 0 ? "M" : "L"} ${drx(d.year)} ${dry(d.rate)}`).join(" ");

  // Spread comparison
  const spW = 500;
  const spH = 120;
  const spMinX = spreadData[0].year;
  const spMaxX = spreadData[spreadData.length - 1].year;
  const spMinY = 250;
  const spMaxY = 650;
  const spx = (v: number) => ((v - spMinX) / (spMaxX - spMinX)) * (spW - 60) + 30;
  const spy = (v: number) => spH - 15 - ((v - spMinY) / (spMaxY - spMinY)) * (spH - 30);
  const loanPath = spreadData.map((d, i) => `${i === 0 ? "M" : "L"} ${spx(d.year)} ${spy(d.loanSpread)}`).join(" ");
  const hyPath = spreadData.map((d, i) => `${i === 0 ? "M" : "L"} ${spx(d.year)} ${spy(d.hySpread)}`).join(" ");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="US LL Market (2024)" value="$1.4T" color="blue" />
        <StatChip label="Cov-Lite Share (2024)" value="~90%" color="amber" />
        <StatChip label="2024 Default Rate" value="~2.8%" color="red" />
        <StatChip label="Avg 1st Lien Recovery" value="~72 cts/$" color="green" />
      </div>

      {/* Market size evolution */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-1">US Leveraged Loan Market Size ($T)</h3>
        <p className="text-xs text-muted-foreground mb-3">Outstanding volume 2000–2024</p>
        <svg viewBox={`0 0 ${marketW} ${marketH}`} className="w-full">
          <defs>
            <linearGradient id="mktGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={marketArea} fill="url(#mktGrad)" />
          <path d={marketPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
          {marketSizeData.filter((_, i) => i % 3 === 0).map((d, i) => (
            <text key={i} x={mx(d.year)} y={marketH - 2} textAnchor="middle" fill="#6b7280" fontSize="8">{d.year}</text>
          ))}
          {[0.3, 0.6, 0.9, 1.2].map((v, i) => (
            <g key={i}>
              <line x1="28" y1={my(v)} x2={marketW - 10} y2={my(v)} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x="24" y={my(v) + 3} textAnchor="end" fill="#52525b" fontSize="7">${v.toFixed(1)}T</text>
            </g>
          ))}
          {/* GFC annotation */}
          <line x1={mx(2008)} y1="5" x2={mx(2008)} y2={marketH - 15} stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.6" />
          <text x={mx(2008) + 3} y="14" fill="#ef4444" fontSize="7.5">GFC</text>
          {/* COVID annotation */}
          <line x1={mx(2020)} y1="5" x2={mx(2020)} y2={marketH - 15} stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.6" />
          <text x={mx(2020) + 3} y="14" fill="#f59e0b" fontSize="7.5">COVID</text>
        </svg>
      </div>

      {/* Cov-lite trend */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-1">Cov-Lite Percentage of New Issuance</h3>
        <p className="text-xs text-muted-foreground mb-3">Rise of covenant-lite: 2012–2024</p>
        <svg viewBox={`0 0 ${clW} ${clH}`} className="w-full">
          <defs>
            <linearGradient id="clGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={clArea} fill="url(#clGrad)" />
          <path d={clPath} fill="none" stroke="#f59e0b" strokeWidth="2" />
          {covLiteData.filter((_, i) => i % 3 === 0).map((d, i) => (
            <text key={i} x={clx(d.year)} y={clH - 2} textAnchor="middle" fill="#6b7280" fontSize="8">{d.year}</text>
          ))}
          {[20, 40, 60, 80].map((v, i) => (
            <g key={i}>
              <line x1="28" y1={cly(v)} x2={clW - 10} y2={cly(v)} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x="24" y={cly(v) + 3} textAnchor="end" fill="#52525b" fontSize="7">{v}%</text>
            </g>
          ))}
          {/* 90% label */}
          <text x={clx(2024) - 5} y={cly(90) - 5} textAnchor="end" fill="#f59e0b" fontSize="8.5" fontWeight="600">~90%</text>
        </svg>
      </div>

      {/* Default rate chart */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-1">Leveraged Loan Default Rate (%)</h3>
        <p className="text-xs text-muted-foreground mb-3">1998–2024 with recession peaks</p>
        <svg viewBox={`0 0 ${drW} ${drH}`} className="w-full">
          <defs>
            <linearGradient id="drGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Recession bands */}
          <rect x={drx(2001)} y="5" width={drx(2002) - drx(2001)} height={drH - 20} fill="#ef4444" opacity="0.06" />
          <rect x={drx(2008)} y="5" width={drx(2009.5) - drx(2008)} height={drH - 20} fill="#ef4444" opacity="0.06" />
          <rect x={drx(2020)} y="5" width={drx(2020.7) - drx(2020)} height={drH - 20} fill="#f59e0b" opacity="0.08" />
          {/* Area */}
          <path d={`${drPath} L ${drx(drMaxX)} ${dry(0)} L ${drx(drMinX)} ${dry(0)} Z`} fill="url(#drGrad)" />
          <path d={drPath} fill="none" stroke="#ef4444" strokeWidth="2" />
          {/* Labels */}
          {defaultRateData.filter((_, i) => i % 5 === 0).map((d, i) => (
            <text key={i} x={drx(d.year)} y={drH - 2} textAnchor="middle" fill="#6b7280" fontSize="8">{d.year}</text>
          ))}
          {[2, 4, 6, 8, 10].map((v, i) => (
            <g key={i}>
              <line x1="28" y1={dry(v)} x2={drW - 10} y2={dry(v)} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x="24" y={dry(v) + 3} textAnchor="end" fill="#52525b" fontSize="7">{v}%</text>
            </g>
          ))}
          {/* Peak annotations */}
          <text x={drx(2001)} y={dry(8.2) - 5} textAnchor="middle" fill="#ef4444" fontSize="7.5">8.2% (2001)</text>
          <text x={drx(2009)} y={dry(10.8) - 5} textAnchor="middle" fill="#ef4444" fontSize="7.5">10.8% (2009)</text>
          <text x={drx(2020)} y={dry(4.4) - 5} textAnchor="middle" fill="#f59e0b" fontSize="7.5">4.4% (2020)</text>
        </svg>
      </div>

      {/* Recovery rate bar chart */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Recovery Rate by Lien Priority (historical avg.)</h3>
        <div className="space-y-3">
          {recoveryData.map((bar, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground w-28 text-right flex-shrink-0">{bar.label}</div>
              <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.recovery}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: bar.color }}
                />
              </div>
              <div className="text-xs font-medium w-12 flex-shrink-0" style={{ color: bar.color }}>
                {bar.recovery}¢
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Recovery rates measured as cents on the dollar at emergence from bankruptcy. First lien loans benefit from security interest in substantially all assets.</p>
      </div>

      {/* Loan vs HY spread */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-1">Leveraged Loan vs HY Bond Spread (bps)</h3>
        <p className="text-xs text-muted-foreground mb-3">Relative value comparison 2018–2024</p>
        <svg viewBox={`0 0 ${spW} ${spH}`} className="w-full">
          <path d={loanPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
          <path d={hyPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,3" />
          {spreadData.map((d, i) => (
            <text key={i} x={spx(d.year)} y={spH - 2} textAnchor="middle" fill="#6b7280" fontSize="8">{d.year}</text>
          ))}
          {[300, 400, 500, 600].map((v, i) => (
            <g key={i}>
              <line x1="28" y1={spy(v)} x2={spW - 10} y2={spy(v)} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x="24" y={spy(v) + 3} textAnchor="end" fill="#52525b" fontSize="7">{v}</text>
            </g>
          ))}
          {/* Legend */}
          <line x1="50" y1="12" x2="68" y2="12" stroke="#3b82f6" strokeWidth="2" />
          <text x="72" y="15.5" fill="#93c5fd" fontSize="8">LL Spread</text>
          <line x1="140" y1="12" x2="158" y2="12" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,2" />
          <text x="162" y="15.5" fill="#fde68a" fontSize="8">HY Spread</text>
        </svg>
      </div>

      {/* Technical bid drivers */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">Technical Bid Drivers & Market Indicators</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              title: "CLO Formation Rate",
              icon: "🏗",
              color: "border-border bg-muted/30",
              desc: "Primary demand driver. Peak CLO issuance years (2018, 2021, 2024: $175B+) compress spreads; CLO reset/refi activity can maintain technical bid even during stress.",
            },
            {
              title: "Retail Fund Flows",
              icon: "📊",
              color: "border-green-800 bg-green-900/10",
              desc: "Loan mutual funds / ETFs (BKLN) provide secondary demand. Rate-hike cycles drive inflows (floating rate appeal); credit fear drives outflows creating supply/demand imbalances.",
            },
            {
              title: "Distressed Ratio",
              icon: "⚠️",
              color: "border-red-800 bg-red-900/10",
              desc: "Percent of loans trading below 80 cents. Leading indicator of default wave. Spiked to 40%+ in March 2020, 25%+ in 2022. Current ratio signals near-term default cycle risk.",
            },
            {
              title: "2022 New Issue Drought",
              icon: "🏜",
              color: "border-amber-800 bg-amber-900/10",
              desc: "Rapid Fed rate hikes caused CLO AAA spreads to widen 60+ bps, making arb economics negative. New CLO formation fell 40%, secondary market bid weakened, spreads widened 150 bps peak-to-trough.",
            },
          ].map((item, i) => (
            <div key={i} className={cn("rounded-lg border p-3", item.color)}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs font-medium text-foreground">{item.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key risk factors */}
      <div className="rounded-xl border border-red-900/40 bg-red-950/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-medium text-red-300">Key Credit Risk Factors</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { risk: "EBITDA Add-back Inflation", desc: "Aggressive pro-forma adjustments can overstate leverage by 1–2× turns. Credit agreement EBITDA vs actual EBITDA gap widened post-2015." },
            { risk: "Liability Management (LME)", desc: "Distressed borrowers use drop-down transactions, J.Crew maneuvers (IP migration), or uptier exchanges to disadvantage existing lenders without court process." },
            { risk: "Rising Rate Stress", desc: "Floating rate debt means rising SOFR directly increases borrower interest burden. Coverage ratios compress as rates rise; some borrowers hedged but many not." },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-red-950/20 p-3 border border-red-900/30">
              <div className="text-xs font-medium text-red-300 mb-1">{item.risk}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LeveragedLoansPage() {
  const [activeTab, setActiveTab] = useState("structure");

  const tabItems = [
    { value: "structure", label: "Loan Structure", icon: Layers },
    { value: "syndication", label: "Syndication", icon: Building2 },
    { value: "clo", label: "CLO Structure", icon: PieChart },
    { value: "dynamics", label: "Market Dynamics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-muted/60 border border-border">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Leveraged Loans &amp; CLOs</h1>
              <p className="text-sm text-muted-foreground">Syndicated lending, loan structures, CLO mechanics, and credit market dynamics</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { icon: DollarSign, label: "$1.4T US Market", color: "text-primary" },
              { icon: TrendingUp, label: "SOFR + Spread", color: "text-green-400" },
              { icon: Shield, label: "Senior Secured", color: "text-amber-400" },
              { icon: Activity, label: "Floating Rate", color: "text-primary" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs bg-card border border-border rounded-full px-3 py-1">
                <badge.icon className={cn("w-3 h-3", badge.color)} />
                <span className="text-muted-foreground">{badge.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero */}
        <div className="rounded-xl border border-border bg-card border-l-4 border-l-primary p-6">
          <h2 className="text-lg font-medium text-foreground mb-1">Leveraged Loan &amp; CLO Analytics</h2>
          <p className="text-sm text-muted-foreground">Loan structure, syndication mechanics, CLO waterfall analysis, and credit market dynamics.</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid grid-cols-4 mb-6 bg-card border border-border h-auto p-1 gap-1">
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex items-center gap-1.5 text-xs py-2 px-2 rounded-md data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground",
                )}
              >
                <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="structure" className="data-[state=inactive]:hidden">
                <LoanStructureTab />
              </TabsContent>
              <TabsContent value="syndication" className="data-[state=inactive]:hidden">
                <SyndicationTab />
              </TabsContent>
              <TabsContent value="clo" className="data-[state=inactive]:hidden">
                <CLOStructureTab />
              </TabsContent>
              <TabsContent value="dynamics" className="data-[state=inactive]:hidden">
                <MarketDynamicsTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
