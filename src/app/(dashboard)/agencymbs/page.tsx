"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  BarChart3,
  DollarSign,
  Percent,
  Activity,
  Shield,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Target,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 854;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const RAND_VALS: number[] = [];
for (let i = 0; i < 3000; i++) RAND_VALS.push(rand());
let ri = 0;
const r = () => RAND_VALS[ri++ % RAND_VALS.length];

// ── Agency comparison data ────────────────────────────────────────────────────

interface Agency {
  name: string;
  fullName: string;
  type: "GSE" | "Government";
  guarantee: "Implicit" | "Explicit";
  loanTypes: string[];
  marketShare: number;
  founded: number;
  backstop: string;
  color: string;
}

const AGENCIES: Agency[] = [
  {
    name: "Fannie Mae",
    fullName: "Federal National Mortgage Association",
    type: "GSE",
    guarantee: "Implicit",
    loanTypes: ["Conventional", "Conforming", "Fixed & ARM"],
    marketShare: 37,
    founded: 1938,
    backstop: "U.S. Treasury line of credit; conservatorship since 2008",
    color: "#3b82f6",
  },
  {
    name: "Freddie Mac",
    fullName: "Federal Home Loan Mortgage Corporation",
    type: "GSE",
    guarantee: "Implicit",
    loanTypes: ["Conventional", "Conforming", "PC securities"],
    marketShare: 22,
    founded: 1970,
    backstop: "U.S. Treasury line of credit; conservatorship since 2008",
    color: "#8b5cf6",
  },
  {
    name: "Ginnie Mae",
    fullName: "Government National Mortgage Association",
    type: "Government",
    guarantee: "Explicit",
    loanTypes: ["FHA", "VA", "USDA", "HUD Section 184"],
    marketShare: 18,
    founded: 1968,
    backstop: "Full faith and credit of the U.S. Government",
    color: "#10b981",
  },
];

// ── Pool characteristics ──────────────────────────────────────────────────────

interface PoolChar {
  label: string;
  fannie: string;
  freddie: string;
  ginnie: string;
  desc: string;
}

const POOL_CHARS: PoolChar[] = [
  {
    label: "Coupon Range",
    fannie: "2.0% – 7.5%",
    freddie: "2.0% – 7.5%",
    ginnie: "2.5% – 8.0%",
    desc: "Pass-through rate paid to MBS holders; WAC typically 25–75 bps above coupon",
  },
  {
    label: "Typical WAC",
    fannie: "Coupon + 0.4%",
    freddie: "Coupon + 0.4%",
    ginnie: "Coupon + 0.5%",
    desc: "Weighted Average Coupon of underlying mortgages; spread over pass-through covers servicing & guarantee fees",
  },
  {
    label: "Typical WALA",
    fannie: "6–24 months",
    freddie: "6–24 months",
    ginnie: "3–18 months",
    desc: "Weighted Average Loan Age; seasoned pools exhibit burnout and lower refinancing sensitivity",
  },
  {
    label: "Typical WAM",
    fannie: "270–354 months",
    freddie: "270–354 months",
    ginnie: "270–354 months",
    desc: "Weighted Average Maturity remaining; drives effective duration before prepayment adjustment",
  },
  {
    label: "Min Pool Size",
    fannie: "$1M",
    freddie: "$1M",
    ginnie: "$25K",
    desc: "Minimum original pool balance; smaller pools show higher idiosyncratic prepayment variance",
  },
  {
    label: "Settlement",
    fannie: "TBA / Specified",
    freddie: "TBA / Specified",
    ginnie: "TBA / Specified",
    desc: "TBA (To Be Announced) is the most liquid MBS market; pools delivered 48h before settlement",
  },
];

// ── Dollar roll data ──────────────────────────────────────────────────────────

interface RollScenario {
  coupon: number;
  spotPrice: number;
  forwardPrice: number;
  drop: number;
  impliedRepo: number;
  breakeven: number;
}

const ROLL_SCENARIOS: RollScenario[] = [
  { coupon: 3.0, spotPrice: 96.125, forwardPrice: 95.875, drop: 0.25, impliedRepo: 5.12, breakeven: 4.95 },
  { coupon: 3.5, spotPrice: 97.500, forwardPrice: 97.219, drop: 0.281, impliedRepo: 5.23, breakeven: 5.05 },
  { coupon: 4.0, spotPrice: 98.875, forwardPrice: 98.563, drop: 0.312, impliedRepo: 5.31, breakeven: 5.12 },
  { coupon: 4.5, spotPrice: 100.125, forwardPrice: 99.781, drop: 0.344, impliedRepo: 5.18, breakeven: 5.00 },
  { coupon: 5.0, spotPrice: 101.250, forwardPrice: 100.875, drop: 0.375, impliedRepo: 5.08, breakeven: 4.90 },
  { coupon: 5.5, spotPrice: 102.313, forwardPrice: 101.906, drop: 0.407, impliedRepo: 4.97, breakeven: 4.78 },
  { coupon: 6.0, spotPrice: 103.375, forwardPrice: 102.938, drop: 0.437, impliedRepo: 4.88, breakeven: 4.68 },
];

// ── CPR history data (36 months, seeded) ─────────────────────────────────────

const CPR_MONTHS = Array.from({ length: 36 }, (_, i) => {
  const monthIdx = i % 12;
  const seasonality = [0.7, 0.65, 0.8, 0.95, 1.1, 1.2, 1.25, 1.2, 1.1, 0.95, 0.8, 0.75][monthIdx];
  const base = 12 + (r() - 0.5) * 4;
  return Math.max(4, Math.min(40, base * seasonality));
});

// ── Refi incentive data ───────────────────────────────────────────────────────

const REFI_RATE_DIFF = [-2.0, -1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5, 2.0, 2.5];
const REFI_CPR = REFI_RATE_DIFF.map((d) => {
  // S-curve: low CPR when WAC < market, accelerates as incentive grows
  const base = 35 / (1 + Math.exp(-2.5 * d));
  return Math.max(2, Math.min(40, base + (r() - 0.5) * 1.5));
});

// ── Seasonality data ─────────────────────────────────────────────────────────

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SEASONAL_FACTORS = [0.70, 0.65, 0.80, 0.95, 1.10, 1.20, 1.25, 1.20, 1.10, 0.95, 0.80, 0.75];

// ── PSA speed table ───────────────────────────────────────────────────────────

interface PSARow {
  psa: number;
  month1CPR: number;
  month30CPR: number;
  avgLifeYrs: number;
  dollarPrice: number;
  yield: number;
}

const PSA_TABLE: PSARow[] = [
  { psa: 50, month1CPR: 0.3, month30CPR: 3.0, avgLifeYrs: 19.2, dollarPrice: 96.50, yield: 4.82 },
  { psa: 100, month1CPR: 0.6, month30CPR: 6.0, avgLifeYrs: 14.1, dollarPrice: 97.25, yield: 4.71 },
  { psa: 150, month1CPR: 0.9, month30CPR: 9.0, avgLifeYrs: 10.8, dollarPrice: 97.88, yield: 4.62 },
  { psa: 200, month1CPR: 1.2, month30CPR: 12.0, avgLifeYrs: 8.7, dollarPrice: 98.25, yield: 4.57 },
  { psa: 300, month1CPR: 1.8, month30CPR: 18.0, avgLifeYrs: 6.2, dollarPrice: 97.50, yield: 4.65 },
  { psa: 400, month1CPR: 2.4, month30CPR: 24.0, avgLifeYrs: 4.9, dollarPrice: 95.88, yield: 4.89 },
];

// ── CMO tranche data ──────────────────────────────────────────────────────────

interface CMOTranche {
  name: string;
  type: "PAC" | "TAC" | "Sequential" | "Z-Bond" | "IO" | "PO" | "Support";
  description: string;
  avgLife: string;
  coupon: string;
  protection: string;
  risk: "Low" | "Medium" | "High" | "Very High";
  color: string;
}

const CMO_TRANCHES: CMOTranche[] = [
  {
    name: "PAC A",
    type: "PAC",
    description: "Planned Amortization Class — principal payments stay within defined collar bands (100–300 PSA typical). Support tranches absorb prepayment variability.",
    avgLife: "5.0 yrs",
    coupon: "4.25%",
    protection: "100–300 PSA band",
    risk: "Low",
    color: "#10b981",
  },
  {
    name: "TAC A",
    type: "TAC",
    description: "Targeted Amortization Class — one-sided protection. Shielded from prepayment speeds above target PSA but exposed to extension when speeds slow.",
    avgLife: "7.2 yrs",
    coupon: "4.50%",
    protection: "Above 200 PSA",
    risk: "Medium",
    color: "#3b82f6",
  },
  {
    name: "Seq A",
    type: "Sequential",
    description: "Sequential Pay — receives all principal (scheduled + prepaid) first until retired. Simple structure; earlier tranches have shorter, more certain avg lives.",
    avgLife: "3.8 yrs",
    coupon: "4.10%",
    protection: "Priority principal",
    risk: "Low",
    color: "#6366f1",
  },
  {
    name: "Z-Bond",
    type: "Z-Bond",
    description: "Accrual Bond — coupon accretes to balance (zero-coupon style) while earlier tranches are outstanding. Receives cash flows only after prior tranches retire.",
    avgLife: "22.5 yrs",
    coupon: "5.00% (accrual)",
    protection: "None",
    risk: "High",
    color: "#f59e0b",
  },
  {
    name: "IO Strip",
    type: "IO",
    description: "Interest Only — receives only the interest cash flows from the underlying pool. Value falls as prepayments accelerate (less interest paid over shorter life).",
    avgLife: "Notional only",
    coupon: "Interest strip",
    protection: "None",
    risk: "Very High",
    color: "#ef4444",
  },
  {
    name: "PO Strip",
    type: "PO",
    description: "Principal Only — receives only principal cash flows, bought at discount to face. Value rises sharply when prepayments accelerate (faster return of principal).",
    avgLife: "Speed-dependent",
    coupon: "None (discount)",
    protection: "None",
    risk: "Very High",
    color: "#ec4899",
  },
  {
    name: "Support",
    type: "Support",
    description: "Companion/Support tranche — provides prepayment buffering for PAC/TAC tranches. Absorbs all excess or deficit prepayments; very volatile avg life.",
    avgLife: "3–25 yrs",
    coupon: "5.25%",
    protection: "None (absorber)",
    risk: "Very High",
    color: "#94a3b8",
  },
];

// ── Convexity & scenario data ─────────────────────────────────────────────────

interface PrepayScenario {
  name: string;
  psa: number;
  cpr: number;
  price: number;
  duration: number;
  oas: number;
  zSpread: number;
  color: string;
}

const PREPAY_SCENARIOS: PrepayScenario[] = [
  { name: "Fast (400 PSA)", psa: 400, cpr: 28, price: 95.50, duration: 2.8, oas: 65, zSpread: 88, color: "#ef4444" },
  { name: "Base (200 PSA)", psa: 200, cpr: 14, price: 98.25, duration: 5.4, oas: 42, zSpread: 62, color: "#3b82f6" },
  { name: "Slow (75 PSA)", psa: 75, cpr: 5, price: 96.75, duration: 9.2, oas: 58, zSpread: 79, color: "#f59e0b" },
  { name: "Shock (+300bps)", psa: 50, cpr: 3, price: 92.13, duration: 12.8, oas: 95, zSpread: 142, color: "#ef4444" },
];

// ── Price/yield curve points for convexity chart ──────────────────────────────

function bulletBondPrice(ytm: number): number {
  // 5% 10yr bullet bond, price as % of par
  const c = 0.05 / 2;
  const n = 20;
  const r2 = ytm / 2;
  if (r2 === 0) return (1 + c * n) * 100;
  return ((c * (1 - Math.pow(1 + r2, -n))) / r2 + Math.pow(1 + r2, -n)) * 100;
}

function mbsPrice(ytm: number): number {
  // MBS exhibits negative convexity — price appreciation capped above par
  const bullet = bulletBondPrice(ytm);
  // Add negative convexity compression above par region
  const par = 100;
  if (bullet > par) {
    const excess = bullet - par;
    return par + excess * 0.45; // compression due to prepayments
  }
  // Extension risk compresses price below par too
  const deficit = par - bullet;
  return par - deficit * 1.12; // extension amplifies losses
}

const YIELD_RANGE = Array.from({ length: 21 }, (_, i) => 0.01 + i * 0.004);

// ── Duration extension chart ──────────────────────────────────────────────────

const RATE_SHOCK_BPS = [-200, -150, -100, -50, 0, 50, 100, 150, 200, 250, 300];
const MBS_DURATION = RATE_SHOCK_BPS.map((bps) => {
  // MBS duration lengthens dramatically in rising rate scenarios
  const base = 5.4;
  if (bps > 0) return base + bps * 0.028 + Math.pow(bps / 100, 1.8) * 0.4;
  return Math.max(1.8, base + bps * 0.012);
});
const TREASURY_DURATION = RATE_SHOCK_BPS.map(() => 7.2); // constant duration for comparison

// ── Hedge ratios ──────────────────────────────────────────────────────────────

interface HedgeRow {
  instrument: string;
  pros: string;
  cons: string;
  typicalRatio: string;
  bestFor: string;
}

const HEDGE_ROWS: HedgeRow[] = [
  {
    instrument: "10Y Treasury Futures",
    pros: "Highly liquid, low cost, daily settlement",
    cons: "Only parallel shift hedge; misses convexity & prepayment optionality",
    typicalRatio: "0.85–1.15 DV01",
    bestFor: "Rate duration hedge for smaller portfolios",
  },
  {
    instrument: "Interest Rate Swaps",
    pros: "Precise maturity matching, OTC flexibility, large size",
    cons: "Counterparty credit risk, margin requirements, SOFR complexity",
    typicalRatio: "Pay-fixed at matched maturity",
    bestFor: "Large institutional portfolios seeking cash-flow matching",
  },
  {
    instrument: "Receiver Swaptions",
    pros: "Hedges extension risk optionality; positive convexity profile",
    cons: "Premium cost, complex vol modeling, liquidity drops fast",
    typicalRatio: "20–40% of MBS notional",
    bestFor: "Protecting against sharp rate rises (extension event)",
  },
  {
    instrument: "MBS Short Sales (TBA)",
    pros: "Direct sector hedge; same prepayment model dynamics",
    cons: "Negative carry, basis risk between pools",
    typicalRatio: "1:1 or duration-adjusted",
    bestFor: "Hedging specific coupon stack exposure",
  },
];

// ── Helper: SVG viewport math ─────────────────────────────────────────────────

function toSvgX(val: number, min: number, max: number, width: number, pad: number): number {
  return pad + ((val - min) / (max - min)) * (width - 2 * pad);
}

function toSvgY(val: number, min: number, max: number, height: number, pad: number): number {
  return height - pad - ((val - min) / (max - min)) * (height - 2 * pad);
}

function svgLinePath(points: [number, number][]): string {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children, className }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-card border border-border rounded-md p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary">{icon}</span>
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoChip({ label, value, color = "blue" }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-primary/10 text-primary border-border",
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    red: "bg-red-500/10 text-red-300 border-red-500/20",
    purple: "bg-primary/10 text-primary border-border",
  };
  return (
    <div className={cn("border rounded-lg px-3 py-2 text-center", colors[color] ?? colors.blue)}>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function RiskBadge({ level }: { level: CMOTranche["risk"] }) {
  const map: Record<CMOTranche["risk"], string> = {
    Low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    Medium: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    High: "bg-orange-500/15 text-orange-300 border-orange-500/25",
    "Very High": "bg-red-500/15 text-red-300 border-red-500/25",
  };
  return (
    <span className={cn("text-xs text-muted-foreground px-2 py-0.5 rounded border font-medium", map[level])}>
      {level}
    </span>
  );
}

// ── Tab 1: Agency Market ──────────────────────────────────────────────────────

function AgencyMarketTab() {
  const [selectedAgency, setSelectedAgency] = useState<Agency>(AGENCIES[0]);
  const [expandedPool, setExpandedPool] = useState<string | null>(null);

  const totalMarket = AGENCIES.reduce((a, b) => a + b.marketShare, 0);

  return (
    <div className="space-y-4">
      {/* Agency comparison cards */}
      <SectionCard title="Agency Comparison: Fannie / Freddie / Ginnie" icon={<Building2 size={16} />}>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {AGENCIES.map((ag) => (
            <button
              key={ag.name}
              onClick={() => setSelectedAgency(ag)}
              className={cn(
                "rounded-md border p-4 text-left transition-all",
                selectedAgency.name === ag.name
                  ? "border-primary/60 bg-primary/8"
                  : "border-border bg-muted/50 hover:border-border"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-semibold text-foreground text-sm">{ag.name}</span>
                <span
                  className={cn(
                    "text-xs text-muted-foreground px-2 py-0.5 rounded border font-medium",
                    ag.guarantee === "Explicit"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/25"
                  )}
                >
                  {ag.guarantee}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-1">{ag.type}</div>
              <div className="text-xs text-muted-foreground mb-3">Est. {ag.founded}</div>
              {/* Market share bar */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(ag.marketShare / 45) * 100}%`, backgroundColor: ag.color }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{ag.marketShare}% market share</div>
            </button>
          ))}
        </div>

        {/* Selected agency detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAgency.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-muted/60 rounded-md p-4 border border-border"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedAgency.color }} />
              <span className="font-medium text-foreground text-sm">{selectedAgency.fullName}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Guarantee Type</div>
                <div className="text-sm text-foreground">{selectedAgency.guarantee}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Loan Types</div>
                <div className="flex flex-wrap gap-1">
                  {selectedAgency.loanTypes.map((lt) => (
                    <span key={lt} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                      {lt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Government Backstop</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{selectedAgency.backstop}</div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Market share pie representation as stacked bar */}
        <div className="mt-4">
          <div className="text-xs text-muted-foreground mb-2">Agency MBS Outstanding — Market Share</div>
          <div className="flex h-6 rounded-lg overflow-hidden">
            {AGENCIES.map((ag) => (
              <div
                key={ag.name}
                style={{ width: `${(ag.marketShare / totalMarket) * 100}%`, backgroundColor: ag.color }}
                className="transition-all relative group"
                title={`${ag.name}: ${ag.marketShare}%`}
              />
            ))}
            {/* Other */}
            <div
              className="bg-muted"
              style={{ width: `${((100 - totalMarket) / 100) * 100}%` }}
              title="Bank portfolio / Private label: ~23%"
            />
          </div>
          <div className="flex gap-4 mt-2">
            {AGENCIES.map((ag) => (
              <div key={ag.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ag.color }} />
                {ag.name} {ag.marketShare}%
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-muted" />
              Other ~{100 - totalMarket}%
            </div>
          </div>
        </div>
      </SectionCard>

      {/* TBA mechanics */}
      <SectionCard title="TBA Market Mechanics" icon={<Activity size={16} />}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The <strong className="text-primary">To-Be-Announced (TBA)</strong> market is the most liquid
              segment of the mortgage-backed securities universe, with ~$300B in daily trading volume. In TBA
              trading, the buyer agrees to purchase an MBS at a future settlement date without knowing the
              exact pools — only coupon, agency, maturity, and face value are specified.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pool details are announced 48 hours before settlement (&quot;48-hour notice&quot;). Sellers deliver
              the &quot;cheapest to deliver&quot; eligible pools, creating a deliverable bond profile that investors
              must model.
            </p>
          </div>
          <div className="space-y-2">
            {[
              { label: "Daily Volume", value: "~$300B", color: "blue" },
              { label: "Settlement Cycle", value: "Monthly", color: "green" },
              { label: "Announcement", value: "T-48 hours", color: "amber" },
              { label: "Min Trade Size", value: "$1M face", color: "purple" },
              { label: "Eligible Coupons", value: "0.5% increments", color: "blue" },
              { label: "Good Delivery", value: "±2.5% tolerance", color: "green" },
            ].map((item) => (
              <InfoChip key={item.label} label={item.label} value={item.value} color={item.color} />
            ))}
          </div>
        </div>

        {/* Fed holdings note */}
        <div className="mt-4 bg-amber-500/8 border border-amber-500/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-medium text-amber-300 mb-1">Federal Reserve MBS Holdings Impact</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                At its 2022 peak, the Fed held ~$2.7 trillion in Agency MBS (~25% of total outstanding) accumulated
                through QE programs. QT (Quantitative Tightening) passively reduces holdings as prepayments return
                principal. The Fed&apos;s dominant ownership suppresses spreads and distorts the normal credit cycle,
                creating systemic basis risk if rapid portfolio reduction is needed.
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Pool characteristics table */}
      <SectionCard title="Pool Characteristics (WAC / WALA / WAM)" icon={<BarChart3 size={16} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Characteristic</th>
                <th className="text-center py-2 text-primary font-medium">Fannie Mae</th>
                <th className="text-center py-2 text-primary font-medium">Freddie Mac</th>
                <th className="text-center py-2 text-emerald-400 font-medium">Ginnie Mae</th>
                <th className="text-left py-2 text-muted-foreground font-medium w-48">Description</th>
              </tr>
            </thead>
            <tbody>
              {POOL_CHARS.map((row, i) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-border cursor-pointer hover:bg-muted/40 transition-colors",
                    i % 2 === 0 ? "bg-card" : "bg-muted/20"
                  )}
                  onClick={() => setExpandedPool(expandedPool === row.label ? null : row.label)}
                >
                  <td className="py-2.5 font-medium text-foreground">{row.label}</td>
                  <td className="py-2.5 text-center text-primary">{row.fannie}</td>
                  <td className="py-2.5 text-center text-primary">{row.freddie}</td>
                  <td className="py-2.5 text-center text-emerald-300">{row.ginnie}</td>
                  <td className="py-2.5 text-muted-foreground truncate max-w-0 w-48 pr-2">
                    <span className="text-muted-foreground">{expandedPool === row.label ? "▲" : "▼"} details</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AnimatePresence>
          {expandedPool && (
            <motion.div
              key={expandedPool}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 bg-muted/60 rounded-lg p-3 border border-border text-xs text-muted-foreground leading-relaxed">
                {POOL_CHARS.find((p) => p.label === expandedPool)?.desc}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Dollar roll economics */}
      <SectionCard title="Dollar Roll Economics" icon={<RefreshCw size={16} />}>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          A <strong className="text-primary">dollar roll</strong> is a repurchase agreement where an investor
          sells TBA MBS for spot settlement and simultaneously buys back the same coupon for the following month.
          The forward purchase price is lower (the &quot;drop&quot;), effectively financing the position. When
          the implied repo rate exceeds financing costs, rolling is advantageous.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="text-center py-2 text-muted-foreground">Coupon</th>
                <th className="text-center py-2 text-muted-foreground">Spot</th>
                <th className="text-center py-2 text-muted-foreground">Forward</th>
                <th className="text-center py-2 text-muted-foreground">Drop (32nds)</th>
                <th className="text-center py-2 text-muted-foreground">Implied Repo</th>
                <th className="text-center py-2 text-muted-foreground">Breakeven</th>
                <th className="text-center py-2 text-muted-foreground">Roll Special?</th>
              </tr>
            </thead>
            <tbody>
              {ROLL_SCENARIOS.map((row, i) => {
                const special = row.impliedRepo > row.breakeven;
                return (
                  <tr
                    key={row.coupon}
                    className={cn(
                      "border-b border-border",
                      i % 2 === 0 ? "bg-card" : "bg-muted/20"
                    )}
                  >
                    <td className="py-2.5 text-center font-medium text-foreground">{row.coupon.toFixed(1)}%</td>
                    <td className="py-2.5 text-center text-muted-foreground">{row.spotPrice.toFixed(3)}</td>
                    <td className="py-2.5 text-center text-muted-foreground">{row.forwardPrice.toFixed(3)}</td>
                    <td className="py-2.5 text-center text-primary">{Math.round(row.drop * 32)}</td>
                    <td className="py-2.5 text-center text-foreground">{row.impliedRepo.toFixed(2)}%</td>
                    <td className="py-2.5 text-center text-muted-foreground">{row.breakeven.toFixed(2)}%</td>
                    <td className="py-2.5 text-center">
                      <span
                        className={cn(
                          "text-xs text-muted-foreground px-2 py-0.5 rounded border",
                          special
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {special ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 2: Prepayment Analysis ────────────────────────────────────────────────

function PrepaymentAnalysisTab() {
  const W = 560;
  const H = 180;
  const PAD = 36;

  // CPR history chart
  const cprMin = 0;
  const cprMax = 45;
  const cprPoints: [number, number][] = CPR_MONTHS.map((v, i) => [
    toSvgX(i, 0, 35, W, PAD),
    toSvgY(v, cprMin, cprMax, H, PAD),
  ]);

  // S-curve: rate differential vs CPR
  const sMin = 0;
  const sMax = 45;
  const sCurvePoints: [number, number][] = REFI_RATE_DIFF.map((d, i) => [
    toSvgX(d, -2, 2.5, W, PAD),
    toSvgY(REFI_CPR[i], sMin, sMax, H, PAD),
  ]);

  // Seasonality chart
  const seasonW = 560;
  const seasonH = 160;
  const seasonPad = 32;
  const barW = (seasonW - seasonPad * 2) / 12 - 2;

  // PSA speed chart
  const psaW = 560;
  const psaH = 160;
  const psaPad = 36;
  const psaMonths = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      {/* CPR history */}
      <SectionCard title="CPR History — 36 Months (Fannie 4.5% Coupon)" icon={<TrendingUp size={16} />}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* Grid */}
          {[0, 10, 20, 30, 40].map((v) => {
            const y = toSvgY(v, cprMin, cprMax, H, PAD);
            return (
              <g key={v}>
                <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#262626" strokeWidth="1" />
                <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">{v}</text>
              </g>
            );
          })}
          {/* X axis ticks */}
          {[0, 6, 12, 18, 24, 30, 35].map((i) => {
            const x = toSvgX(i, 0, 35, W, PAD);
            const label = i === 0 ? "M1" : i === 35 ? "M36" : `M${i + 1}`;
            return (
              <text key={i} x={x} y={H - PAD + 14} textAnchor="middle" fontSize="9" fill="#6b7280">{label}</text>
            );
          })}
          {/* Area fill */}
          <defs>
            <linearGradient id="cprGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path
            d={`${svgLinePath(cprPoints)} L${toSvgX(35, 0, 35, W, PAD)},${H - PAD} L${PAD},${H - PAD} Z`}
            fill="url(#cprGrad)"
          />
          <path d={svgLinePath(cprPoints)} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
          {/* Avg line */}
          {(() => {
            const avg = CPR_MONTHS.reduce((a, b) => a + b, 0) / CPR_MONTHS.length;
            const avgY = toSvgY(avg, cprMin, cprMax, H, PAD);
            return (
              <g>
                <line x1={PAD} y1={avgY} x2={W - PAD} y2={avgY} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3" />
                <text x={W - PAD + 4} y={avgY + 4} fontSize="9" fill="#f59e0b">Avg {avg.toFixed(1)}</text>
              </g>
            );
          })()}
          <text x={PAD} y={14} fontSize="10" fill="#9ca3af">CPR (%)</text>
        </svg>
        <div className="mt-2 text-xs text-muted-foreground">
          CPR = Conditional Prepayment Rate (annualized). Higher values mean faster principal return to investors.
        </div>
      </SectionCard>

      {/* Refinancing S-curve */}
      <SectionCard title="Refinancing S-Curve (WAC vs Market Rate)" icon={<Activity size={16} />}>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              {[0, 10, 20, 30, 40].map((v) => {
                const y = toSvgY(v, sMin, sMax, H, PAD);
                return (
                  <g key={v}>
                    <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#262626" strokeWidth="1" />
                    <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">{v}</text>
                  </g>
                );
              })}
              {/* Zero line */}
              {(() => {
                const zeroX = toSvgX(0, -2, 2.5, W, PAD);
                return (
                  <line x1={zeroX} y1={PAD} x2={zeroX} y2={H - PAD} stroke="#374151" strokeWidth="1" strokeDasharray="3,3" />
                );
              })()}
              {[-2, -1, 0, 1, 2].map((v) => {
                const x = toSvgX(v, -2, 2.5, W, PAD);
                return (
                  <text key={v} x={x} y={H - PAD + 14} textAnchor="middle" fontSize="9" fill="#6b7280">
                    {v > 0 ? `+${v}%` : `${v}%`}
                  </text>
                );
              })}
              <defs>
                <linearGradient id="sCurveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d={`${svgLinePath(sCurvePoints)} L${toSvgX(2.5, -2, 2.5, W, PAD)},${H - PAD} L${PAD},${H - PAD} Z`}
                fill="url(#sCurveGrad)"
              />
              <path d={svgLinePath(sCurvePoints)} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" />
              <text x={PAD} y={14} fontSize="10" fill="#9ca3af">CPR (%)</text>
              <text x={(W) / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
                WAC − Market Rate (positive = in-the-money to refi)
              </text>
            </svg>
          </div>
          <div className="col-span-2 space-y-3 text-xs text-muted-foreground">
            <p className="leading-relaxed">
              The <strong className="text-emerald-300">S-curve</strong> maps refinancing incentive to CPR.
              When WAC significantly exceeds market rates (right side), borrowers refinance aggressively.
            </p>
            <p className="leading-relaxed">
              <strong className="text-amber-300">Burnout</strong>: After prolonged low rates, the pool
              loses its most refinancing-sensitive borrowers. Remaining borrowers have lower mobility,
              flattening the top of the S-curve.
            </p>
            <div className="bg-muted rounded-lg p-3 border border-border">
              <div className="font-medium text-foreground mb-1">Key Refi Drivers</div>
              {["Rate incentive (WAC vs market)", "Home equity / LTV", "Borrower credit profile", "Seasonality (summer peak)", "Media/broker activity", "Burnout from prior refinancings"].map((d) => (
                <div key={d} className="flex items-center gap-1.5 text-muted-foreground mt-1">
                  <ArrowRight size={10} className="text-emerald-400 shrink-0" />
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Seasonality */}
      <SectionCard title="Monthly Seasonality Factor" icon={<BarChart3 size={16} />}>
        <svg viewBox={`0 0 ${seasonW} ${seasonH}`} className="w-full">
          {[0.5, 0.75, 1.0, 1.25].map((v) => {
            const y = toSvgY(v, 0.4, 1.4, seasonH, seasonPad);
            return (
              <g key={v}>
                <line x1={seasonPad} y1={y} x2={seasonW - seasonPad} y2={y} stroke="#262626" strokeWidth="1" />
                <text x={seasonPad - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">{v.toFixed(2)}</text>
              </g>
            );
          })}
          {/* 1.0 baseline */}
          {(() => {
            const baseY = toSvgY(1.0, 0.4, 1.4, seasonH, seasonPad);
            return (
              <line x1={seasonPad} y1={baseY} x2={seasonW - seasonPad} y2={baseY} stroke="#374151" strokeWidth="1" strokeDasharray="4,3" />
            );
          })()}
          {SEASONAL_FACTORS.map((sf, i) => {
            const x = toSvgX(i, 0, 11, seasonW - barW, seasonPad);
            const barH2 = Math.abs(toSvgY(sf, 0.4, 1.4, seasonH, seasonPad) - toSvgY(1.0, 0.4, 1.4, seasonH, seasonPad));
            const isAbove = sf >= 1.0;
            const barY = isAbove ? toSvgY(sf, 0.4, 1.4, seasonH, seasonPad) : toSvgY(1.0, 0.4, 1.4, seasonH, seasonPad);
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={barY}
                  width={barW}
                  height={barH2}
                  fill={isAbove ? "#3b82f6" : "#ef4444"}
                  opacity={0.7}
                  rx="2"
                />
                <text x={x + barW / 2} y={seasonH - seasonPad + 14} textAnchor="middle" fontSize="8" fill="#6b7280">
                  {MONTH_LABELS[i]}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-primary opacity-70" /> Above baseline (summer surge)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-red-500 opacity-70" /> Below baseline (winter slowdown)</span>
        </div>
      </SectionCard>

      {/* PSA speed table */}
      <SectionCard title="PSA Speed Table (Public Securities Association Model)" icon={<Target size={16} />}>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          The PSA benchmark assumes CPR ramps up 0.2% per month for the first 30 months (reaching 6% CPR at 100 PSA),
          then remains constant. 100 PSA is the convention baseline; actual pools trade at multiples above or below.
        </p>

        {/* PSA ramp chart */}
        {(() => {
          const speeds = [50, 100, 200, 400];
          const colors = ["#6366f1", "#3b82f6", "#10b981", "#ef4444"];
          const allCprs = speeds.flatMap((psa) =>
            psaMonths.map((m) => (m <= 30 ? Math.min((psa / 100) * 6, (psa / 100) * m * 0.2) : (psa / 100) * 6))
          );
          const maxCpr = Math.max(...allCprs);
          return (
            <svg viewBox={`0 0 ${psaW} ${psaH}`} className="w-full mb-4">
              {[0, 5, 10, 15, 20, 25].map((v) => {
                if (v > maxCpr + 1) return null;
                const y = toSvgY(v, 0, maxCpr + 1, psaH, psaPad);
                return (
                  <g key={v}>
                    <line x1={psaPad} y1={y} x2={psaW - psaPad} y2={y} stroke="#262626" strokeWidth="1" />
                    <text x={psaPad - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">{v}</text>
                  </g>
                );
              })}
              {[1, 6, 12, 18, 24, 30].map((m) => {
                const x = toSvgX(m - 1, 0, 29, psaW, psaPad);
                return (
                  <text key={m} x={x} y={psaH - psaPad + 14} textAnchor="middle" fontSize="9" fill="#6b7280">
                    M{m}
                  </text>
                );
              })}
              {speeds.map((psa, si) => {
                const pts: [number, number][] = psaMonths.map((m, mi) => {
                  const cpr = m <= 30 ? (psa / 100) * m * 0.2 : (psa / 100) * 6;
                  return [
                    toSvgX(mi, 0, 29, psaW, psaPad),
                    toSvgY(cpr, 0, maxCpr + 1, psaH, psaPad),
                  ];
                });
                return (
                  <path
                    key={psa}
                    d={svgLinePath(pts)}
                    fill="none"
                    stroke={colors[si]}
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                );
              })}
              {speeds.map((psa, si) => {
                const finalCpr = (psa / 100) * 6;
                const y = toSvgY(finalCpr, 0, maxCpr + 1, psaH, psaPad);
                return (
                  <text key={psa} x={psaW - psaPad + 4} y={y + 4} fontSize="9" fill={colors[si]}>
                    {psa} PSA
                  </text>
                );
              })}
              <text x={psaPad} y={14} fontSize="10" fill="#9ca3af">CPR (%)</text>
            </svg>
          );
        })()}

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                {["PSA Speed", "Month 1 CPR", "Month 30+ CPR", "Avg Life", "Dollar Price", "Yield"].map((h) => (
                  <th key={h} className="py-2 text-center text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PSA_TABLE.map((row, i) => {
                const isBase = row.psa === 200;
                return (
                  <tr
                    key={row.psa}
                    className={cn(
                      "border-b border-border",
                      isBase ? "bg-primary/5 border-border" : i % 2 === 0 ? "bg-card" : "bg-muted/20"
                    )}
                  >
                    <td className="py-2.5 text-center font-medium text-foreground">
                      {row.psa} PSA {isBase && <span className="text-primary ml-1">(base)</span>}
                    </td>
                    <td className="py-2.5 text-center text-muted-foreground">{row.month1CPR.toFixed(1)}%</td>
                    <td className="py-2.5 text-center text-muted-foreground">{row.month30CPR.toFixed(1)}%</td>
                    <td className="py-2.5 text-center text-foreground">{row.avgLifeYrs.toFixed(1)} yrs</td>
                    <td className="py-2.5 text-center text-foreground">{row.dollarPrice.toFixed(2)}</td>
                    <td className="py-2.5 text-center text-foreground">{row.yield.toFixed(2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 3: CMO Structures ─────────────────────────────────────────────────────

function CMOStructuresTab() {
  const [expanded, setExpanded] = useState<string | null>("PAC A");
  const W = 560;
  const H = 180;
  const PAD = 40;

  // PAC band chart
  const psaSpeeds = Array.from({ length: 9 }, (_, i) => 50 + i * 50);
  const pacMonths = Array.from({ length: 30 }, (_, i) => i + 1);

  // IO/PO payoff chart: price vs CPR
  const cprs = Array.from({ length: 11 }, (_, i) => i * 4);
  const ioPrice = cprs.map((cpr) => Math.max(2, 40 * Math.exp(-cpr * 0.09)));
  const poPrice = cprs.map((cpr) => Math.max(10, 100 - 60 * Math.exp(-cpr * 0.09)));

  // Z-bond accrual diagram: balance over time
  const zMonths = Array.from({ length: 25 }, (_, i) => i + 1);
  const zBalance = zMonths.map((m) => {
    const priorRetireMonth = 12;
    if (m <= priorRetireMonth) return 100 * Math.pow(1.005, m);
    return 100 * Math.pow(1.005, priorRetireMonth) * Math.max(0, 1 - (m - priorRetireMonth) / 13);
  });

  return (
    <div className="space-y-4">
      {/* CMO tranche cards */}
      <SectionCard title="CMO Tranche Types" icon={<Layers size={16} />}>
        <div className="space-y-2">
          {CMO_TRANCHES.map((tranche) => {
            const isOpen = expanded === tranche.name;
            return (
              <div
                key={tranche.name}
                className={cn(
                  "border rounded-md overflow-hidden transition-all",
                  isOpen ? "border-border" : "border-border"
                )}
              >
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : tranche.name)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tranche.color }} />
                    <span className="font-medium text-foreground text-sm">{tranche.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{tranche.type}</span>
                    <RiskBadge level={tranche.risk} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Avg Life: {tranche.avgLife}</span>
                    {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 border-t border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{tranche.description}</p>
                        <div className="flex gap-3 flex-wrap">
                          <InfoChip label="Coupon" value={tranche.coupon} color="blue" />
                          <InfoChip label="Protection" value={tranche.protection} color="green" />
                          <InfoChip label="Avg Life" value={tranche.avgLife} color="purple" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* PAC band chart */}
      <SectionCard title="PAC Band — Planned Amortization Corridor (100–300 PSA)" icon={<Shield size={16} />}>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            {(() => {
              // Principal balance decay for different PSA speeds
              const bandLow = 100;
              const bandHigh = 300;
              type BalPoint = { psa: number; pts: [number, number][] };
              const curves: BalPoint[] = psaSpeeds.map((psa) => {
                let bal = 100;
                const pts: [number, number][] = pacMonths.map((m, mi) => {
                  const cpr = m <= 30 ? (psa / 100) * m * 0.2 : (psa / 100) * 6;
                  const smm = 1 - Math.pow(1 - cpr / 100, 1 / 12);
                  bal = Math.max(0, bal * (1 - smm));
                  return [toSvgX(mi, 0, 29, W, PAD), toSvgY(bal, 0, 105, H, PAD)];
                });
                return { psa, pts };
              });

              // Find PAC scheduled balance (stays within band)
              const pacBalance: [number, number][] = pacMonths.map((m, mi) => {
                const lowCpr = m <= 30 ? (bandLow / 100) * m * 0.2 : (bandLow / 100) * 6;
                const highCpr = m <= 30 ? (bandHigh / 100) * m * 0.2 : (bandHigh / 100) * 6;
                const midCpr = (lowCpr + highCpr) / 2;
                const smm = 1 - Math.pow(1 - midCpr / 100, 1 / 12);
                const bal = Math.max(0, 100 * Math.pow(1 - smm, m));
                return [toSvgX(mi, 0, 29, W, PAD), toSvgY(bal, 0, 105, H, PAD)];
              });

              return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                  {[0, 25, 50, 75, 100].map((v) => {
                    const y = toSvgY(v, 0, 105, H, PAD);
                    return (
                      <g key={v}>
                        <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#1f2937" strokeWidth="1" />
                        <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">{v}</text>
                      </g>
                    );
                  })}
                  {[1, 6, 12, 18, 24, 30].map((m) => (
                    <text key={m} x={toSvgX(m - 1, 0, 29, W, PAD)} y={H - PAD + 14} textAnchor="middle" fontSize="9" fill="#6b7280">
                      M{m}
                    </text>
                  ))}
                  {/* Support band area */}
                  {curves.map(({ psa, pts }) => {
                    const isInBand = psa >= bandLow && psa <= bandHigh;
                    return (
                      <path
                        key={psa}
                        d={svgLinePath(pts)}
                        fill="none"
                        stroke={isInBand ? "#10b981" : "#ef4444"}
                        strokeWidth={isInBand ? "1.5" : "1"}
                        strokeOpacity={isInBand ? "0.8" : "0.3"}
                        strokeDasharray={isInBand ? undefined : "3,3"}
                      />
                    );
                  })}
                  {/* PAC scheduled */}
                  <path d={svgLinePath(pacBalance)} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" />
                  <text x={PAD} y={14} fontSize="10" fill="#9ca3af">Balance (%)</text>
                  <text x={W - PAD - 2} y={toSvgY(pacBalance[29][1], 0, 105, H, PAD) - 6} fontSize="9" fill="#f59e0b" textAnchor="end">PAC schedule</text>
                </svg>
              );
            })()}
            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-emerald-500 inline-block" /> Within band (100–300 PSA)</span>
              <span className="flex items-center gap-1.5"><span className="w-4 border-t border-red-500 border-dashed inline-block" /> Outside band</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-amber-400 inline-block" /> PAC schedule</span>
            </div>
          </div>
          <div className="col-span-2 space-y-3 text-xs text-muted-foreground">
            <p className="leading-relaxed">
              PAC bonds receive principal cash flows in a <strong className="text-emerald-300">planned schedule</strong> as
              long as prepayment speeds remain within the protection band.
            </p>
            <p className="leading-relaxed">
              Outside the band, support tranches can no longer buffer all variability and the PAC begins to
              &quot;bust&quot; — receiving principal ahead of or behind schedule.
            </p>
            <div className="bg-muted rounded-lg p-3 border border-border">
              <div className="font-medium text-foreground mb-2">Band Erosion</div>
              <p className="text-muted-foreground leading-relaxed">
                Support tranches erode with each prepayment event outside the band. A previously 100–300 PSA
                band may narrow to 150–250 PSA over time, reducing PAC protection.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* IO/PO strip payoff */}
      <SectionCard title="IO / PO Strip Payoff Characteristics" icon={<Percent size={16} />}>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            {(() => {
              const ioMin = 0;
              const ioMax = 45;
              const ioPts: [number, number][] = cprs.map((cpr, i) => [
                toSvgX(cpr, 0, 40, W, PAD),
                toSvgY(ioPrice[i], ioMin, ioMax, H, PAD),
              ]);
              const poPts: [number, number][] = cprs.map((cpr, i) => [
                toSvgX(cpr, 0, 40, W, PAD),
                toSvgY(poPrice[i] / 3, ioMin, ioMax, H, PAD),
              ]);
              return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                  {[0, 10, 20, 30, 40].map((v) => {
                    const y = toSvgY(v, ioMin, ioMax, H, PAD);
                    return (
                      <g key={v}>
                        <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#1f2937" strokeWidth="1" />
                        <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">{v}</text>
                      </g>
                    );
                  })}
                  {[0, 10, 20, 30, 40].map((v) => (
                    <text key={v} x={toSvgX(v, 0, 40, W, PAD)} y={H - PAD + 14} textAnchor="middle" fontSize="9" fill="#6b7280">
                      {v}%
                    </text>
                  ))}
                  {/* IO line */}
                  <path d={svgLinePath(ioPts)} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" />
                  {/* PO line (scaled) */}
                  <path d={svgLinePath(poPts)} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" />
                  <text x={W - PAD - 10} y={toSvgY(ioPrice[10], ioMin, ioMax, H, PAD) + 4} fontSize="9" fill="#ef4444">IO (price)</text>
                  <text x={W - PAD - 10} y={toSvgY(poPrice[10] / 3, ioMin, ioMax, H, PAD) - 6} fontSize="9" fill="#10b981">PO (scaled)</text>
                  <text x={PAD} y={14} fontSize="10" fill="#9ca3af">Price (notional index)</text>
                  <text x={(W) / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">CPR (%)</text>
                </svg>
              );
            })()}
          </div>
          <div className="col-span-2 space-y-3 text-xs text-muted-foreground">
            <div className="bg-red-500/8 border border-red-500/20 rounded-lg p-3">
              <div className="font-medium text-red-300 mb-1">IO Strip</div>
              <p className="text-muted-foreground leading-relaxed">
                Value <strong className="text-red-300">falls</strong> as CPR rises — faster prepayments
                reduce the outstanding balance and therefore the interest paid. Effective duration is
                <em> negative</em>: IO prices rise when rates rise (slower prepayments).
              </p>
            </div>
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-lg p-3">
              <div className="font-medium text-emerald-300 mb-1">PO Strip</div>
              <p className="text-muted-foreground leading-relaxed">
                Value <strong className="text-emerald-300">rises</strong> as CPR rises — faster principal
                return on a discounted purchase produces greater IRR. Extreme positive convexity; worst
                outcome is extension at a slow prepayment speed.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Z-bond accrual */}
      <SectionCard title="Z-Bond Accrual Mechanics" icon={<Zap size={16} />}>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            {(() => {
              const zMin = 0;
              const zMax = 130;
              const zPts: [number, number][] = zMonths.map((m, mi) => [
                toSvgX(mi, 0, 24, W, PAD),
                toSvgY(zBalance[mi], zMin, zMax, H, PAD),
              ]);
              const peakBal = Math.max(...zBalance);
              const peakIdx = zBalance.indexOf(peakBal);
              return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                  {[0, 25, 50, 75, 100, 125].map((v) => {
                    const y = toSvgY(v, zMin, zMax, H, PAD);
                    return (
                      <g key={v}>
                        <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#1f2937" strokeWidth="1" />
                        <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">{v}</text>
                      </g>
                    );
                  })}
                  {[1, 6, 12, 18, 24].map((m) => (
                    <text key={m} x={toSvgX(m - 1, 0, 24, W, PAD)} y={H - PAD + 14} textAnchor="middle" fontSize="9" fill="#6b7280">
                      Y{Math.ceil(m / 12)}
                    </text>
                  ))}
                  {/* Accrual phase */}
                  <defs>
                    <linearGradient id="zGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${svgLinePath(zPts)} L${toSvgX(24, 0, 24, W, PAD)},${H - PAD} L${PAD},${H - PAD} Z`}
                    fill="url(#zGrad)"
                  />
                  <path d={svgLinePath(zPts)} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" />
                  {/* Peak annotation */}
                  <circle
                    cx={toSvgX(peakIdx, 0, 24, W, PAD)}
                    cy={toSvgY(peakBal, zMin, zMax, H, PAD)}
                    r="4"
                    fill="#f59e0b"
                  />
                  <text
                    x={toSvgX(peakIdx, 0, 24, W, PAD) + 6}
                    y={toSvgY(peakBal, zMin, zMax, H, PAD) - 6}
                    fontSize="9"
                    fill="#f59e0b"
                  >
                    Prior tranches retire — cash flow begins
                  </text>
                  <text x={PAD} y={14} fontSize="10" fill="#9ca3af">Z-Bond Balance (%)</text>
                </svg>
              );
            })()}
          </div>
          <div className="col-span-2 space-y-3 text-xs text-muted-foreground">
            <p className="leading-relaxed">
              The Z-bond receives <strong className="text-amber-300">no cash payments</strong> while prior
              tranches are outstanding. Interest accretes to principal balance (compound interest effect).
            </p>
            <p className="leading-relaxed">
              Once prior tranches retire, the Z-bond begins receiving accelerated principal + interest payments
              — creating a long, volatile cash flow profile.
            </p>
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-lg p-3">
              <div className="font-medium text-amber-300 mb-1">Key Risks</div>
              <ul className="text-muted-foreground space-y-1 mt-1">
                <li className="flex items-start gap-1.5"><ArrowRight size={10} className="mt-0.5 shrink-0 text-amber-400" />Extreme duration extension if prior tranches don&apos;t retire early</li>
                <li className="flex items-start gap-1.5"><ArrowRight size={10} className="mt-0.5 shrink-0 text-amber-400" />High volatility to prepayment model assumptions</li>
                <li className="flex items-start gap-1.5"><ArrowRight size={10} className="mt-0.5 shrink-0 text-amber-400" />Negative carry during accrual phase</li>
              </ul>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 4: Convexity & Risk ───────────────────────────────────────────────────

function ConvexityRiskTab() {
  const W = 560;
  const H = 200;
  const PAD = 40;

  // Price/yield curves
  const bulletPrices = YIELD_RANGE.map(bulletBondPrice);
  const mbsPrices = YIELD_RANGE.map(mbsPrice);
  const yMin = Math.min(...mbsPrices) - 1;
  const yMax = Math.max(...bulletPrices) + 2;

  const bulletPts: [number, number][] = YIELD_RANGE.map((y, i) => [
    toSvgX(y, YIELD_RANGE[0], YIELD_RANGE[YIELD_RANGE.length - 1], W, PAD),
    toSvgY(bulletPrices[i], yMin, yMax, H, PAD),
  ]);
  const mbsPts: [number, number][] = YIELD_RANGE.map((y, i) => [
    toSvgX(y, YIELD_RANGE[0], YIELD_RANGE[YIELD_RANGE.length - 1], W, PAD),
    toSvgY(mbsPrices[i], yMin, yMax, H, PAD),
  ]);

  // Duration extension chart
  const durMin = 0;
  const durMax = 16;
  const rateBpsMin = RATE_SHOCK_BPS[0];
  const rateBpsMax = RATE_SHOCK_BPS[RATE_SHOCK_BPS.length - 1];

  const mbsDurPts: [number, number][] = RATE_SHOCK_BPS.map((bps, i) => [
    toSvgX(bps, rateBpsMin, rateBpsMax, W, PAD),
    toSvgY(MBS_DURATION[i], durMin, durMax, H, PAD),
  ]);
  const tsDurPts: [number, number][] = RATE_SHOCK_BPS.map((bps) => [
    toSvgX(bps, rateBpsMin, rateBpsMax, W, PAD),
    toSvgY(TREASURY_DURATION[0], durMin, durMax, H, PAD),
  ]);

  return (
    <div className="space-y-4">
      {/* Negative convexity explainer */}
      <SectionCard title="Negative Convexity: Price / Yield Curve" icon={<Activity size={16} />}>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              {[90, 95, 100, 105, 110].map((v) => {
                if (v < yMin || v > yMax) return null;
                const y = toSvgY(v, yMin, yMax, H, PAD);
                return (
                  <g key={v}>
                    <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#1f2937" strokeWidth="1" />
                    <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">{v}</text>
                  </g>
                );
              })}
              {YIELD_RANGE.filter((_, i) => i % 4 === 0).map((y) => (
                <text
                  key={y}
                  x={toSvgX(y, YIELD_RANGE[0], YIELD_RANGE[YIELD_RANGE.length - 1], W, PAD)}
                  y={H - PAD + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#6b7280"
                >
                  {(y * 100).toFixed(0)}%
                </text>
              ))}
              {/* Bullet bond (positive convexity) */}
              <path d={svgLinePath(bulletPts)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" />
              {/* MBS (negative convexity) */}
              <path d={svgLinePath(mbsPts)} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="6,3" />
              {/* Par line */}
              {(() => {
                const parY = toSvgY(100, yMin, yMax, H, PAD);
                return (
                  <line x1={PAD} y1={parY} x2={W - PAD} y2={parY} stroke="#374151" strokeWidth="1" strokeDasharray="3,3" />
                );
              })()}
              <text x={PAD + 80} y={toSvgY(bulletPts[bulletPts.length - 1][1], yMin, yMax, H, PAD) - 8} fontSize="9" fill="#3b82f6">
                Bullet Bond (positive convexity)
              </text>
              <text x={PAD + 4} y={toSvgY(mbsPts[0][1], yMin, yMax, H, PAD) - 8} fontSize="9" fill="#ef4444">
                MBS (negative convexity)
              </text>
              <text x={PAD} y={14} fontSize="10" fill="#9ca3af">Price</text>
              <text x={(W) / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">Yield</text>
            </svg>
          </div>
          <div className="col-span-2 space-y-3 text-xs text-muted-foreground">
            <p className="leading-relaxed">
              <strong className="text-red-300">Negative convexity</strong> means the MBS price appreciation
              is capped when rates fall: borrowers refinance, returning principal at par just when the bond
              would otherwise trade above par.
            </p>
            <p className="leading-relaxed">
              Conversely, when rates rise, extension risk causes the MBS to lengthen in duration, <em>amplifying
              price losses</em> beyond a normal bullet bond.
            </p>
            <div className="bg-muted rounded-lg p-3 border border-border">
              <div className="font-medium text-foreground mb-2">Negative Convexity Formula</div>
              <div className="font-mono text-xs bg-card rounded px-3 py-2 text-emerald-300">
                ΔP ≈ −D × Δy + ½ × C × (Δy)²
              </div>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                For MBS, convexity (C) is <em>negative</em> — the ½C(Δy)² term works against the investor
                in both rising and falling rate environments.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Duration extension */}
      <SectionCard title="Duration Extension in Rising Rates" icon={<TrendingUp size={16} />}>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              {[0, 4, 8, 12, 16].map((v) => {
                const y = toSvgY(v, durMin, durMax, H, PAD);
                return (
                  <g key={v}>
                    <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#1f2937" strokeWidth="1" />
                    <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#6b7280">{v} yr</text>
                  </g>
                );
              })}
              {RATE_SHOCK_BPS.filter((_, i) => i % 2 === 0).map((bps) => (
                <text
                  key={bps}
                  x={toSvgX(bps, rateBpsMin, rateBpsMax, W, PAD)}
                  y={H - PAD + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#6b7280"
                >
                  {bps > 0 ? `+${bps}` : bps}bp
                </text>
              ))}
              {/* Zero line */}
              {(() => {
                const zeroX = toSvgX(0, rateBpsMin, rateBpsMax, W, PAD);
                return (
                  <line x1={zeroX} y1={PAD} x2={zeroX} y2={H - PAD} stroke="#374151" strokeWidth="1" strokeDasharray="3,3" />
                );
              })()}
              {/* Treasury (flat) */}
              <path d={svgLinePath(tsDurPts)} fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeDasharray="5,3" />
              {/* MBS (extends) */}
              <defs>
                <linearGradient id="durGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <path d={svgLinePath(mbsDurPts)} fill="none" stroke="url(#durGrad)" strokeWidth="2.5" strokeLinejoin="round" />
              <text x={W - PAD - 4} y={toSvgY(TREASURY_DURATION[0], durMin, durMax, H, PAD) - 6} textAnchor="end" fontSize="9" fill="#3b82f6">
                Treasury (fixed duration)
              </text>
              <text x={W - PAD - 4} y={toSvgY(MBS_DURATION[MBS_DURATION.length - 1], durMin, durMax, H, PAD) - 6} textAnchor="end" fontSize="9" fill="#ef4444">
                MBS (extends in rising rates)
              </text>
              <text x={PAD} y={14} fontSize="10" fill="#9ca3af">Duration (yrs)</text>
            </svg>
          </div>
          <div className="col-span-2 space-y-3 text-xs text-muted-foreground">
            <p className="leading-relaxed">
              <strong className="text-amber-300">Duration extension</strong> is the key asymmetric risk in MBS.
              A 300bps rate shock can extend MBS duration from ~5 years to over 12 years — doubling price
              sensitivity at exactly the worst moment.
            </p>
            <div className="space-y-2">
              {[
                { shock: "+100bps", dur: "~7.1 yrs", color: "text-amber-300" },
                { shock: "+200bps", dur: "~9.6 yrs", color: "text-orange-300" },
                { shock: "+300bps", dur: "~12.8 yrs", color: "text-red-300" },
              ].map((row) => (
                <div key={row.shock} className="flex justify-between bg-muted rounded-lg px-3 py-2 border border-border">
                  <span className="text-muted-foreground">{row.shock} rate shock</span>
                  <span className={cn("font-medium", row.color)}>{row.dur}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* OAS vs Z-Spread */}
      <SectionCard title="OAS vs Z-Spread: Prepayment-Adjusted Spread" icon={<Info size={16} />}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="bg-muted rounded-md p-4 border border-border">
              <div className="font-medium text-primary mb-2">Z-Spread</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The constant spread over the <strong className="text-primary">spot rate curve</strong> that
                equates the present value of cash flows to the market price. Does not adjust for the embedded
                prepayment option — overstates value for callable/prepayable instruments.
              </p>
            </div>
            <div className="bg-muted rounded-md p-4 border border-border">
              <div className="font-medium text-emerald-300 mb-2">OAS (Option-Adjusted Spread)</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The spread after removing the value of the embedded prepayment option via Monte Carlo
                interest rate simulation. <strong className="text-emerald-200">OAS = Z-Spread − Option Cost</strong>.
                OAS is the &quot;true&quot; credit/liquidity spread for comparison across mortgage instruments.
              </p>
            </div>
          </div>
          <div>
            {/* OAS vs Z-spread per scenario */}
            <div className="space-y-3">
              {PREPAY_SCENARIOS.map((sc) => {
                const optionCost = sc.zSpread - sc.oas;
                return (
                  <div key={sc.name} className="bg-muted/60 rounded-lg p-3 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-foreground">{sc.name}</span>
                      <span className="text-xs text-muted-foreground">Option Cost: {optionCost}bps</span>
                    </div>
                    <div className="flex gap-1 items-center mb-1">
                      <div className="text-xs text-muted-foreground w-20 shrink-0">Z-Spread</div>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, (sc.zSpread / 160) * 100)}%`, backgroundColor: sc.color }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground w-12 text-right">{sc.zSpread}bps</div>
                    </div>
                    <div className="flex gap-1 items-center">
                      <div className="text-xs text-muted-foreground w-20 shrink-0">OAS</div>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(100, (sc.oas / 160) * 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground w-12 text-right">{sc.oas}bps</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Prepayment scenario analysis */}
      <SectionCard title="Prepayment Scenario Analysis" icon={<BarChart3 size={16} />}>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                {["Scenario", "PSA Speed", "CPR", "Dollar Price", "Eff. Duration", "OAS", "Z-Spread"].map((h) => (
                  <th key={h} className="py-2 text-center text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PREPAY_SCENARIOS.map((sc, i) => (
                <tr
                  key={sc.name}
                  className={cn(
                    "border-b border-border",
                    i % 2 === 0 ? "bg-card" : "bg-muted/20"
                  )}
                >
                  <td className="py-2.5 text-center">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.color }} />
                      <span className="font-medium text-foreground">{sc.name}</span>
                    </span>
                  </td>
                  <td className="py-2.5 text-center text-muted-foreground">{sc.psa}</td>
                  <td className="py-2.5 text-center text-muted-foreground">{sc.cpr}%</td>
                  <td className="py-2.5 text-center text-foreground">{sc.price.toFixed(2)}</td>
                  <td className="py-2.5 text-center text-foreground">{sc.duration.toFixed(1)} yrs</td>
                  <td className="py-2.5 text-center text-emerald-300">{sc.oas}bps</td>
                  <td className="py-2.5 text-center text-primary">{sc.zSpread}bps</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-red-500/8 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-red-300">Shock scenario (+300bps):</strong> Duration extends from 5.4 to 12.8 years,
              price falls from 98.25 to 92.13 — a loss of ~6.2 points. Equivalent-duration Treasury position would lose
              only ~3.8 points. The extra ~2.4pt loss is the &quot;negative convexity tax&quot;.
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Hedge ratios */}
      <SectionCard title="Hedging Agency MBS: Instruments & Ratios" icon={<Shield size={16} />}>
        <div className="space-y-3">
          {HEDGE_ROWS.map((row) => (
            <div key={row.instrument} className="bg-muted/60 rounded-md p-4 border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-medium text-foreground text-sm mb-1">{row.instrument}</div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div>
                      <div className="text-emerald-400 font-medium mb-0.5">Pros</div>
                      <div className="text-muted-foreground">{row.pros}</div>
                    </div>
                    <div>
                      <div className="text-red-400 font-medium mb-0.5">Cons</div>
                      <div className="text-muted-foreground">{row.cons}</div>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-muted-foreground mb-1">Typical Ratio</div>
                  <div className="text-xs font-mono bg-muted text-foreground px-2.5 py-1 rounded-lg whitespace-nowrap">
                    {row.typicalRatio}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-32">{row.bestFor}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Swaption note */}
        <div className="mt-4 bg-primary/8 border border-border rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-primary mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-primary">Swaption straddle overlay:</strong> Sophisticated MBS managers
              often hold receiver swaptions (to hedge extension) AND payer swaptions (to hedge prepayment/contraction)
              simultaneously — creating a &quot;vega long&quot; position that profits from realized rate volatility exceeding
              the implied vol paid in premiums.
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AgencyMBSPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-md bg-primary/15 border border-border flex items-center justify-center">
            <Building2 size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Agency MBS</h1>
            <p className="text-sm text-muted-foreground">
              Fannie / Freddie / Ginnie pass-throughs, CMOs, IO/PO strips, prepayment modeling &amp; convexity risk
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Badge className="bg-primary/15 text-primary border-border text-xs">Agency Guaranteed</Badge>
            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-xs">~$9T Market</Badge>
            <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/25 text-xs">Prepayment Risk</Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="agency" className="w-full">
        <TabsList className="bg-card border border-border mb-6 flex gap-1 p-1 rounded-md h-auto flex-wrap">
          {[
            { value: "agency", label: "Agency Market", icon: <Building2 size={13} /> },
            { value: "prepayment", label: "Prepayment Analysis", icon: <TrendingDown size={13} /> },
            { value: "cmo", label: "CMO Structures", icon: <Layers size={13} /> },
            { value: "convexity", label: "Convexity & Risk", icon: <Activity size={13} /> },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="agency" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <AgencyMarketTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="prepayment" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <PrepaymentAnalysisTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="cmo" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <CMOStructuresTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="convexity" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <ConvexityRiskTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
