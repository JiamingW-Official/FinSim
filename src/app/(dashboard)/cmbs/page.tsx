"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Layers,
  Shield,
  Activity,
  Info,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Percent,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ──────────────────────────────────────────────────────────────
let s = 851;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 851;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface Tranche {
  rating: string;
  name: string;
  size: number; // % of deal
  spread: number; // bps over benchmark
  color: string;
  description: string;
}

interface LoanRecord {
  id: string;
  propertyType: string;
  city: string;
  dscr: number;
  ltv: number;
  coupon: number;
  balance: number; // $M
  maturity: string;
  ioMonths: number;
  watchlist: boolean;
}

interface DelinquencyMonth {
  month: string;
  rate: number;
}

interface CMBXSeries {
  label: string;
  ig: number;
  hy: number;
}

// ── Static Data ──────────────────────────────────────────────────────────────
const TRANCHES: Tranche[] = [
  { rating: "AAA", name: "A-1", size: 18, spread: 52, color: "#22c55e", description: "Senior-most short-tenor class; ultra-low extension risk" },
  { rating: "AAA", name: "A-2", size: 26, spread: 68, color: "#4ade80", description: "Long-tenor super-senior; benchmark for CMBS market" },
  { rating: "AAA", name: "A-SB", size: 4, spread: 58, color: "#86efac", description: "Amortizing balloon class; rapid paydown schedule" },
  { rating: "AA", name: "AS", size: 9, spread: 115, color: "#a3e635", description: "A-S (junior AAA): adds credit enhancement buffer" },
  { rating: "A", name: "B", size: 7, spread: 145, color: "#facc15", description: "Mezzanine class; first losses below investment grade" },
  { rating: "BBB-", name: "C", size: 6, spread: 265, color: "#fb923c", description: "Below investment-grade entry; significant default exposure" },
  { rating: "BB", name: "D", size: 5, spread: 450, color: "#f87171", description: "B-piece tier; purchased by conduit deal sponsors" },
  { rating: "NR/Equity", name: "E/F", size: 25, spread: 900, color: "#ef4444", description: "Equity/first-loss; B-piece buyers hold; deepest subordination" },
];

const LOANS: LoanRecord[] = [
  { id: "L-001", propertyType: "Multifamily", city: "Austin, TX", dscr: 1.42, ltv: 62, coupon: 6.45, balance: 85, maturity: "2031-06", ioMonths: 24, watchlist: false },
  { id: "L-002", propertyType: "Industrial", city: "Chicago, IL", dscr: 1.65, ltv: 55, coupon: 5.90, balance: 120, maturity: "2030-09", ioMonths: 0, watchlist: false },
  { id: "L-003", propertyType: "Office", city: "San Francisco, CA", dscr: 0.89, ltv: 78, coupon: 7.20, balance: 210, maturity: "2029-03", ioMonths: 60, watchlist: true },
  { id: "L-004", propertyType: "Retail", city: "Phoenix, AZ", dscr: 1.12, ltv: 71, coupon: 6.80, balance: 65, maturity: "2032-01", ioMonths: 12, watchlist: true },
  { id: "L-005", propertyType: "Hotel", city: "Miami, FL", dscr: 1.28, ltv: 67, coupon: 7.50, balance: 95, maturity: "2030-12", ioMonths: 36, watchlist: false },
  { id: "L-006", propertyType: "Multifamily", city: "Denver, CO", dscr: 1.55, ltv: 58, coupon: 6.10, balance: 145, maturity: "2031-09", ioMonths: 0, watchlist: false },
  { id: "L-007", propertyType: "Office", city: "New York, NY", dscr: 0.95, ltv: 80, coupon: 7.80, balance: 380, maturity: "2028-07", ioMonths: 60, watchlist: true },
  { id: "L-008", propertyType: "Industrial", city: "Dallas, TX", dscr: 1.72, ltv: 50, coupon: 5.75, balance: 98, maturity: "2033-04", ioMonths: 0, watchlist: false },
];

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const PROPERTY_SECTORS = [
  { name: "Industrial", weight: 28, trend: "bullish", noigrowth: 8.2, vacancyRate: 4.1 },
  { name: "Multifamily", weight: 32, trend: "bullish", noigrowth: 5.4, vacancyRate: 5.8 },
  { name: "Hotel", weight: 10, trend: "neutral", noigrowth: 2.1, vacancyRate: 18.2 },
  { name: "Retail", weight: 12, trend: "bearish", noigrowth: -1.2, vacancyRate: 11.4 },
  { name: "Office", weight: 18, trend: "bearish", noigrowth: -4.8, vacancyRate: 21.6 },
];

// ── Derived / computed ───────────────────────────────────────────────────────
function generateDelinquency(): DelinquencyMonth[] {
  resetSeed();
  let base = 2.8;
  return MONTHS.map((month, i) => {
    base += (rand() - 0.48) * 0.4;
    if (i >= 8) base += 0.15; // spike in early year
    base = Math.max(1.5, Math.min(6.5, base));
    return { month, rate: parseFloat(base.toFixed(2)) };
  });
}

function generateCMBXSeries(): CMBXSeries[] {
  resetSeed();
  const base_ig = 110;
  const base_hy = 550;
  return Array.from({ length: 12 }, (_, i) => {
    const igDrift = (rand() - 0.45) * 15;
    const hyDrift = (rand() - 0.45) * 45;
    return {
      label: MONTHS[i],
      ig: Math.round(base_ig + igDrift * (i + 1) * 0.15),
      hy: Math.round(base_hy + hyDrift * (i + 1) * 0.12),
    };
  });
}

// ── Small helper components ──────────────────────────────────────────────────
function InfoBadge({ text, color = "blue" }: { text: string; color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-primary/15 text-primary border-border",
    green: "bg-green-500/15 text-green-300 border-green-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    red: "bg-red-500/15 text-red-300 border-red-500/30",
    purple: "bg-primary/15 text-primary border-border",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", colors[color] ?? colors.blue)}>
      {text}
    </span>
  );
}

function MetricCard({ label, value, sub, icon: Icon, trend }: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  const trendColor = trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-muted-foreground";
  return (
    <div className="bg-muted/60 border border-border/50 rounded-md p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <div className={cn("text-xl font-bold", trendColor)}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ── Tab 1: CMBS Structure ────────────────────────────────────────────────────
function StructureTab() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const totalHeight = 360;
  const totalSize = TRANCHES.reduce((a, t) => a + t.size, 0);

  let yOffset = 0;
  const trancheRects = TRANCHES.map((t) => {
    const h = (t.size / totalSize) * totalHeight;
    const rect = { ...t, y: yOffset, h };
    yOffset += h;
    return rect;
  });

  return (
    <div className="space-y-6">
      {/* Conduit vs SASB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/60 border border-border rounded-md p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="font-semibold text-primary text-sm">Conduit CMBS</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pool of <strong className="text-muted-foreground">50–100+ loans</strong> from multiple originators across property types. Diversification reduces single-asset risk. Standard deal size $0.5B–$2B.
          </p>
          <ul className="space-y-1">
            {["Loan granularity 30–100 loans", "Mix of property types & geographies", "10-year IO common on top loans", "Sequential/pro-rata pay structures", "B-piece buyers perform loan diligence"].map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-muted/60 border border-border rounded-md p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="font-semibold text-primary text-sm">Single-Asset / Single-Borrower (SASB)</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-muted-foreground">One loan on one asset</strong> (or portfolio of same borrower). Higher concentration risk but deeper asset-specific diligence. Trophy assets command premium pricing.
          </p>
          <ul className="space-y-1">
            {["One borrower / one property", "$500M–$3B+ deal sizes", "Full IO common during loan term", "Asset-specific risk dominant", "Investor-specific call protection"].map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Trust Flow Diagram */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-primary" />
          CMBS Trust Structure
        </h3>
        <svg viewBox="0 0 680 120" className="w-full h-auto" aria-label="CMBS trust structure flow">
          {/* Loans box */}
          <rect x="10" y="30" width="110" height="60" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="65" y="56" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="600">Mortgage</text>
          <text x="65" y="72" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="600">Loans</text>
          <text x="65" y="86" textAnchor="middle" fill="#64748b" fontSize="9">50–100 CRE</text>
          {/* Arrow */}
          <path d="M122 60 L168 60" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="145" y="52" textAnchor="middle" fill="#64748b" fontSize="8">True Sale</text>
          {/* Trust box */}
          <rect x="170" y="25" width="130" height="70" rx="8" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1.5" />
          <text x="235" y="52" textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="600">REMIC Trust</text>
          <text x="235" y="67" textAnchor="middle" fill="#94a3b8" fontSize="9">Master Servicer</text>
          <text x="235" y="79" textAnchor="middle" fill="#94a3b8" fontSize="9">Special Servicer</text>
          <text x="235" y="88" textAnchor="middle" fill="#64748b" fontSize="8">Trustee / Cert. Admin</text>
          {/* Arrow */}
          <path d="M302 60 L345 60" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="323" y="52" textAnchor="middle" fill="#64748b" fontSize="8">Issues</text>
          {/* Certificates */}
          <rect x="347" y="10" width="320" height="100" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <text x="507" y="28" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Certificates (Tranches)</text>
          {TRANCHES.slice(0, 5).map((t, i) => (
            <g key={t.name}>
              <rect x={357 + i * 58} y="36" width="50" height="62" rx="4" fill={t.color + "22"} stroke={t.color} strokeWidth="1" />
              <text x={382 + i * 58} y="55" textAnchor="middle" fill={t.color} fontSize="9" fontWeight="700">{t.name}</text>
              <text x={382 + i * 58} y="68" textAnchor="middle" fill="#94a3b8" fontSize="8">{t.rating}</text>
              <text x={382 + i * 58} y="82" textAnchor="middle" fill="#64748b" fontSize="8">{t.size}%</text>
              <text x={382 + i * 58} y="93" textAnchor="middle" fill="#64748b" fontSize="8">+{t.spread}</text>
            </g>
          ))}
          <text x="645" y="68" textAnchor="middle" fill="#64748b" fontSize="9">+ more…</text>
          {/* Arrow def */}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#475569" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Capital Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="bg-muted/60 border border-border/50 rounded-md p-5">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Capital Stack (8 Tranches)
          </h3>
          <svg viewBox="0 0 200 370" className="w-full max-w-[200px] mx-auto" aria-label="Capital stack">
            {trancheRects.map((t) => (
              <g key={t.name} onClick={() => setExpanded(expanded === t.name ? null : t.name)} className="cursor-pointer">
                <rect x="0" y={t.y} width="200" height={t.h} fill={t.color + "33"} stroke={t.color} strokeWidth="1" />
                <text x="100" y={t.y + t.h / 2 - 4} textAnchor="middle" fill={t.color} fontSize="11" fontWeight="700">{t.name}</text>
                <text x="100" y={t.y + t.h / 2 + 8} textAnchor="middle" fill="#94a3b8" fontSize="9">{t.rating} | +{t.spread}bps | {t.size}%</text>
              </g>
            ))}
          </svg>
          <p className="text-xs text-muted-foreground text-center mt-2">Click a tranche to learn more</p>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {expanded && (() => {
              const t = TRANCHES.find((x) => x.name === expanded);
              if (!t) return null;
              return (
                <motion.div key={expanded} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-card/80 border rounded-md p-4 space-y-2" style={{ borderColor: t.color + "66" }}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm" style={{ color: t.color }}>{t.name} — {t.rating}</span>
                    <button onClick={() => setExpanded(null)} className="text-muted-foreground hover:text-muted-foreground text-xs">✕</button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted rounded p-2">
                      <div className="text-muted-foreground">Size</div>
                      <div className="font-medium text-foreground">{t.size}% of deal</div>
                    </div>
                    <div className="bg-muted rounded p-2">
                      <div className="text-muted-foreground">Spread</div>
                      <div className="font-medium text-foreground">+{t.spread} bps</div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          <div className="bg-muted/60 border border-border/50 rounded-md p-4 space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Servicer Roles</h4>
            {[
              { role: "Master Servicer", desc: "Collects P&I from all performing loans; advances scheduled payments to certificate holders when borrowers are current.", color: "text-primary" },
              { role: "Special Servicer", desc: "Takes over when loan becomes 60+ days delinquent. Negotiates workouts, foreclosures, REO sales. Compensated via workout fees.", color: "text-amber-400" },
              { role: "Trustee / Cert. Admin", desc: "Holds mortgage files, distributes principal & interest per waterfall. Maintains transaction registers and tax reporting.", color: "text-primary" },
              { role: "Operating Advisor", desc: "Post-Dodd-Frank oversight of special servicer decisions when B-piece buyer accumulates conflicts.", color: "text-green-400" },
            ].map((item) => (
              <div key={item.role} className="flex gap-3">
                <div className={cn("text-xs font-medium w-32 shrink-0 pt-0.5", item.color)}>{item.role}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Loan Analysis ─────────────────────────────────────────────────────
function LoanAnalysisTab() {
  const [occupancy, setOccupancy] = useState(90);

  const stressedLoans = useMemo(() =>
    LOANS.map((loan) => {
      const stressFactor = occupancy / 100;
      const baseNOI = loan.balance * 1e6 * (loan.coupon / 100) * loan.dscr;
      const stressedNOI = baseNOI * stressFactor;
      const annualDebt = loan.balance * 1e6 * (loan.coupon / 100);
      const stressedDSCR = annualDebt > 0 ? stressedNOI / annualDebt : 0;
      const debtYield = (baseNOI / (loan.balance * 1e6)) * 100;
      return { ...loan, stressedDSCR: parseFloat(stressedDSCR.toFixed(2)), debtYield: parseFloat(debtYield.toFixed(1)) };
    }),
    [occupancy]
  );

  // Scatter plot dimensions
  const scatterW = 340;
  const scatterH = 200;
  const padL = 40;
  const padB = 30;
  const padT = 10;
  const padR = 10;
  const ltvMin = 40, ltvMax = 90;
  const dscrMin = 0.7, dscrMax = 2.0;

  const toX = (ltv: number) => padL + ((ltv - ltvMin) / (ltvMax - ltvMin)) * (scatterW - padL - padR);
  const toY = (dscr: number) => scatterH - padB - ((dscr - dscrMin) / (dscrMax - dscrMin)) * (scatterH - padB - padT);

  const sectorColors: Record<string, string> = {
    Multifamily: "#4ade80",
    Industrial: "#60a5fa",
    Office: "#f87171",
    Retail: "#fb923c",
    Hotel: "#c084fc",
  };

  return (
    <div className="space-y-6">
      {/* Loans table */}
      <div className="bg-muted/60 border border-border/50 rounded-md overflow-hidden">
        <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Sample Loan Pool (8 Loans)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50">
                {["ID", "Property Type", "City", "DSCR", "LTV%", "Coupon%", "Bal($M)", "Maturity", "IO Mo.", "Status"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOANS.map((loan, i) => (
                <tr key={loan.id} className={cn("border-b border-border/30 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "" : "bg-muted/30")}>
                  <td className="px-3 py-2 font-mono text-muted-foreground">{loan.id}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sectorColors[loan.propertyType] }} />
                      <span className="text-muted-foreground">{loan.propertyType}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{loan.city}</td>
                  <td className="px-3 py-2">
                    <span className={cn("font-medium", loan.dscr >= 1.25 ? "text-green-400" : loan.dscr >= 1.0 ? "text-amber-400" : "text-red-400")}>
                      {loan.dscr.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn("font-medium", loan.ltv <= 65 ? "text-green-400" : loan.ltv <= 75 ? "text-amber-400" : "text-red-400")}>
                      {loan.ltv}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{loan.coupon.toFixed(2)}%</td>
                  <td className="px-3 py-2 text-muted-foreground font-mono">${loan.balance}M</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{loan.maturity}</td>
                  <td className="px-3 py-2 text-muted-foreground">{loan.ioMonths > 0 ? `${loan.ioMonths}mo` : "—"}</td>
                  <td className="px-3 py-2">
                    {loan.watchlist
                      ? <InfoBadge text="Watchlist" color="amber" />
                      : <InfoBadge text="Performing" color="green" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scatter + NOI stress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DSCR vs LTV Scatter */}
        <div className="bg-muted/60 border border-border/50 rounded-md p-5">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            DSCR vs LTV Scatter
          </h3>
          <svg viewBox={`0 0 ${scatterW} ${scatterH}`} className="w-full h-auto" aria-label="DSCR vs LTV scatter">
            {/* Grid lines */}
            {[0.8, 1.0, 1.25, 1.5, 1.75].map((d) => (
              <line key={d} x1={padL} x2={scatterW - padR} y1={toY(d)} y2={toY(d)} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />
            ))}
            {[50, 60, 70, 80].map((l) => (
              <line key={l} x1={toX(l)} x2={toX(l)} y1={padT} y2={scatterH - padB} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />
            ))}
            {/* Danger zone (high LTV + low DSCR) */}
            <rect x={toX(70)} y={padT} width={toX(90) - toX(70)} height={toY(1.0) - padT} fill="#ef444418" />
            <text x={toX(80)} y={padT + 12} textAnchor="middle" fill="#f87171" fontSize="8">High Risk Zone</text>
            {/* DSCR = 1.0 line */}
            <line x1={padL} x2={scatterW - padR} y1={toY(1.0)} y2={toY(1.0)} stroke="#f8717155" strokeWidth="1.5" strokeDasharray="6,3" />
            <text x={padL + 4} y={toY(1.0) - 3} fill="#f87171" fontSize="8">DSCR 1.0x</text>
            {/* Axes */}
            <line x1={padL} x2={padL} y1={padT} y2={scatterH - padB} stroke="#475569" strokeWidth="1" />
            <line x1={padL} x2={scatterW - padR} y1={scatterH - padB} y2={scatterH - padB} stroke="#475569" strokeWidth="1" />
            {/* X labels */}
            {[50, 60, 70, 80].map((l) => (
              <text key={l} x={toX(l)} y={scatterH - 8} textAnchor="middle" fill="#64748b" fontSize="8">{l}%</text>
            ))}
            <text x={(scatterW + padL) / 2} y={scatterH - 2} textAnchor="middle" fill="#64748b" fontSize="8">LTV →</text>
            {/* Y labels */}
            {[0.8, 1.0, 1.25, 1.5, 1.75].map((d) => (
              <text key={d} x={padL - 4} y={toY(d) + 3} textAnchor="end" fill="#64748b" fontSize="8">{d.toFixed(2)}</text>
            ))}
            <text x={12} y={(scatterH - padB + padT) / 2} textAnchor="middle" fill="#64748b" fontSize="8" transform={`rotate(-90, 12, ${(scatterH - padB + padT) / 2})`}>DSCR →</text>
            {/* Points */}
            {LOANS.map((loan) => (
              <g key={loan.id}>
                <circle cx={toX(loan.ltv)} cy={toY(loan.dscr)} r="6" fill={sectorColors[loan.propertyType] + "cc"} stroke={loan.watchlist ? "#fbbf24" : "transparent"} strokeWidth="1.5" />
                <text x={toX(loan.ltv) + 8} y={toY(loan.dscr) + 3} fill="#94a3b8" fontSize="7">{loan.id}</text>
              </g>
            ))}
            {/* Legend */}
            {Object.entries(sectorColors).map(([name, color], i) => (
              <g key={name} transform={`translate(${padL + i * 60}, ${scatterH - padB + 12})`}>
                <circle cx="4" cy="4" r="4" fill={color} />
                <text x="10" y="7" fill="#94a3b8" fontSize="7">{name}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* NOI Stress Test */}
        <div className="bg-muted/60 border border-border/50 rounded-md p-5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            NOI Stress Testing — Occupancy
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Occupancy Rate</span>
              <span className="font-medium text-amber-300 text-sm">{occupancy}%</span>
            </div>
            <input
              type="range" min={50} max={100} value={occupancy}
              onChange={(e) => setOccupancy(parseInt(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50% (Severe Stress)</span>
              <span>100% (Full)</span>
            </div>
          </div>
          <div className="space-y-2">
            {stressedLoans.map((loan) => (
              <div key={loan.id} className="flex items-center gap-2 text-xs">
                <span className="font-mono text-muted-foreground w-12">{loan.id}</span>
                <span className="w-20 text-muted-foreground truncate">{loan.propertyType}</span>
                <div className="flex-1 bg-muted rounded-full h-1.5 relative">
                  <div
                    className={cn("h-1.5 rounded-full transition-all duration-300", loan.stressedDSCR >= 1.25 ? "bg-green-500" : loan.stressedDSCR >= 1.0 ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${Math.min(100, (loan.stressedDSCR / 2.0) * 100)}%` }}
                  />
                  <div className="absolute top-0 left-[62.5%] h-full w-px bg-muted-foreground opacity-50" />
                </div>
                <span className={cn("font-medium w-10 text-right", loan.stressedDSCR >= 1.25 ? "text-green-400" : loan.stressedDSCR >= 1.0 ? "text-amber-400" : "text-red-400")}>
                  {loan.stressedDSCR.toFixed(2)}x
                </span>
                <span className="text-muted-foreground w-12 text-right">{loan.debtYield.toFixed(1)}%DY</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">DY = Debt Yield = NOI / Loan Balance. Target: &gt;8% for AAA underwriting.</p>
        </div>
      </div>

      {/* Property Sector Heatmap */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-green-400" />
          Property Sector Heatmap
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PROPERTY_SECTORS.map((sector) => {
            const heatColor =
              sector.trend === "bullish"
                ? "border-green-500/40 bg-green-500/10"
                : sector.trend === "neutral"
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-red-500/40 bg-red-500/10";
            const trendColor =
              sector.trend === "bullish" ? "text-green-400" : sector.trend === "neutral" ? "text-amber-400" : "text-red-400";
            return (
              <div key={sector.name} className={cn("border rounded-md p-4 space-y-2", heatColor)}>
                <div className="font-medium text-sm text-foreground">{sector.name}</div>
                <div className="text-xs text-muted-foreground">Weight: <span className="text-foreground font-medium">{sector.weight}%</span></div>
                <div className={cn("text-xs font-medium", trendColor)}>
                  {sector.trend === "bullish" ? "▲" : sector.trend === "neutral" ? "—" : "▼"} NOI {sector.noigrowth > 0 ? "+" : ""}{sector.noigrowth}% YoY
                </div>
                <div className="text-xs text-muted-foreground">Vacancy: <span className={sector.vacancyRate > 15 ? "text-red-400" : "text-muted-foreground"}>{sector.vacancyRate}%</span></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Performance Metrics ───────────────────────────────────────────────
function PerformanceTab() {
  const delinquency = useMemo(() => generateDelinquency(), []);
  const maxRate = Math.max(...delinquency.map((d) => d.rate));
  const chartH = 140;
  const chartW = 520;
  const barPad = 6;
  const barW = (chartW - 40) / delinquency.length - barPad;

  const vintageData = [
    { vintage: "2018", lossRate: 0.8, prepay: 12.4 },
    { vintage: "2019", lossRate: 1.1, prepay: 10.2 },
    { vintage: "2020", lossRate: 3.4, prepay: 8.8 },
    { vintage: "2021", lossRate: 1.8, prepay: 14.1 },
    { vintage: "2022", lossRate: 2.2, prepay: 9.3 },
    { vintage: "2023", lossRate: 1.5, prepay: 7.6 },
    { vintage: "2024", lossRate: 1.0, prepay: 6.2 },
  ];

  const prepayBySector = [
    { sector: "Industrial", cpr: 18.2 },
    { sector: "Multifamily", cpr: 14.8 },
    { sector: "Hotel", cpr: 9.1 },
    { sector: "Retail", cpr: 6.4 },
    { sector: "Office", cpr: 3.2 },
  ];

  const specialServicingRate = 4.8;
  const watchlistCount = LOANS.filter((l) => l.watchlist).length;
  const currentDelinq = delinquency[delinquency.length - 1].rate;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Delinquency Rate" value={`${currentDelinq}%`} sub="30+ day past due" icon={AlertTriangle} trend="down" />
        <MetricCard label="Special Servicing" value={`${specialServicingRate}%`} sub="% of pool balance" icon={Shield} trend="neutral" />
        <MetricCard label="Watchlist Loans" value={`${watchlistCount} / ${LOANS.length}`} sub="Elevated monitoring" icon={Activity} trend="neutral" />
        <MetricCard label="Avg Debt Yield" value="8.4%" sub="vs 8% underwriting min" icon={Percent} trend="up" />
      </div>

      {/* Delinquency bar chart */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-red-400" />
          12-Month Delinquency Rate (30+ Days)
        </h3>
        <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full h-auto" aria-label="Delinquency bar chart">
          {/* Y gridlines */}
          {[1, 2, 3, 4, 5, 6].map((y) => {
            const yPos = chartH - (y / 7) * chartH;
            return (
              <g key={y}>
                <line x1="30" x2={chartW} y1={yPos} y2={yPos} stroke="#1e293b" strokeWidth="1" />
                <text x="26" y={yPos + 3} textAnchor="end" fill="#475569" fontSize="8">{y}%</text>
              </g>
            );
          })}
          {/* Bars */}
          {delinquency.map((d, i) => {
            const x = 30 + i * (barW + barPad) + barPad / 2;
            const h = (d.rate / 7) * chartH;
            const y = chartH - h;
            const isHigh = d.rate > maxRate * 0.85;
            return (
              <g key={d.month}>
                <rect x={x} y={y} width={barW} height={h} rx="2"
                  fill={isHigh ? "#ef4444cc" : "#3b82f6cc"} />
                <text x={x + barW / 2} y={chartH + 12} textAnchor="middle" fill="#64748b" fontSize="8">{d.month}</text>
                <text x={x + barW / 2} y={y - 2} textAnchor="middle" fill="#94a3b8" fontSize="7.5">{d.rate}%</text>
              </g>
            );
          })}
          {/* Baseline reference */}
          <line x1="30" x2={chartW} y1={chartH - (2.8 / 7) * chartH} y2={chartH - (2.8 / 7) * chartH}
            stroke="#22c55e66" strokeWidth="1" strokeDasharray="4,3" />
          <text x={chartW - 2} y={chartH - (2.8 / 7) * chartH - 3} textAnchor="end" fill="#22c55e" fontSize="8">Baseline 2.8%</text>
        </svg>
      </div>

      {/* Vintage loss rates + Prepayment speeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/60 border border-border/50 rounded-md p-5">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            Realized Loss Rate by Vintage
          </h3>
          <div className="space-y-2.5">
            {vintageData.map((v) => (
              <div key={v.vintage} className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground w-10 font-mono">{v.vintage}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full transition-all", v.lossRate > 3 ? "bg-red-500" : v.lossRate > 1.5 ? "bg-amber-500" : "bg-green-500")}
                    style={{ width: `${(v.lossRate / 4) * 100}%` }}
                  />
                </div>
                <span className={cn("w-10 text-right font-medium", v.lossRate > 3 ? "text-red-400" : v.lossRate > 1.5 ? "text-amber-400" : "text-green-400")}>
                  {v.lossRate}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">2020 vintage elevated due to pandemic hotel/retail stress.</p>
        </div>

        <div className="bg-muted/60 border border-border/50 rounded-md p-5">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Prepayment Speeds by Property Type (CPR%)
          </h3>
          <div className="space-y-2.5">
            {prepayBySector.map((p) => {
              const color = sectorColors[p.sector] ?? "#64748b";
              return (
                <div key={p.sector} className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground w-20">{p.sector}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${(p.cpr / 25) * 100}%`, backgroundColor: color }} />
                  </div>
                  <span className="w-12 text-right font-medium text-muted-foreground">{p.cpr}% CPR</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Industrial/multifamily high CPR driven by refi activity. Office low CPR = extension risk.</p>
        </div>
      </div>
    </div>
  );
}

const sectorColors: Record<string, string> = {
  Multifamily: "#4ade80",
  Industrial: "#60a5fa",
  Office: "#f87171",
  Retail: "#fb923c",
  Hotel: "#c084fc",
};

// ── Tab 4: Trading & Spreads ─────────────────────────────────────────────────
function TradingTab() {
  const cmbxData = useMemo(() => generateCMBXSeries(), []);
  const [showWorkflow, setShowWorkflow] = useState(false);

  const chartH = 160;
  const chartW = 500;
  const padL = 50;
  const padB = 24;
  const padT = 10;
  const padR = 10;

  const igMin = Math.min(...cmbxData.map((d) => d.ig)) - 10;
  const igMax = Math.max(...cmbxData.map((d) => d.ig)) + 10;
  const hyMin = Math.min(...cmbxData.map((d) => d.hy)) - 30;
  const hyMax = Math.max(...cmbxData.map((d) => d.hy)) + 30;

  const igToY = (v: number) => padT + (1 - (v - igMin) / (igMax - igMin)) * (chartH - padB - padT);
  const hyToY = (v: number) => padT + (1 - (v - hyMin) / (hyMax - hyMin)) * (chartH - padB - padT);
  const toX = (i: number) => padL + (i / (cmbxData.length - 1)) * (chartW - padL - padR);

  const igPath = cmbxData.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${igToY(d.ig).toFixed(1)}`).join(" ");
  const hyPath = cmbxData.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${hyToY(d.hy).toFixed(1)}`).join(" ");

  const liquidity = [
    { tranche: "A-1 / A-2 (AAA)", bid: 112, ask: 115, depth: "High" },
    { tranche: "A-SB (AAA)", bid: 106, ask: 110, depth: "Medium" },
    { tranche: "AS (AA)", bid: 145, ask: 155, depth: "Medium" },
    { tranche: "B / C (A–BBB-)", bid: 185, ask: 210, depth: "Low" },
    { tranche: "D / E (BB–NR)", bid: 380, ask: 490, depth: "Very Low" },
  ];

  const depthColor: Record<string, string> = {
    High: "text-green-400",
    Medium: "text-amber-400",
    Low: "text-orange-400",
    "Very Low": "text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="CMBX IG Spread" value={`+${cmbxData[cmbxData.length - 1].ig}bps`} sub="vs Treasuries" icon={TrendingUp} trend="neutral" />
        <MetricCard label="CMBX HY Spread" value={`+${cmbxData[cmbxData.length - 1].hy}bps`} sub="vs Treasuries" icon={TrendingDown} trend="down" />
        <MetricCard label="Cash/Synth Basis" value="-18bps" sub="Cash tighter than CDS" icon={ArrowRight} trend="neutral" />
        <MetricCard label="Office Extension" value="62%" sub="% loans expected to extend" icon={Clock} trend="down" />
      </div>

      {/* CMBX Spread Chart */}
      <div className="bg-muted/60 border border-border/50 rounded-md p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          CMBX Index Spreads — 12 Month (IG vs HY)
        </h3>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" aria-label="CMBX spread chart">
          {/* IG Y gridlines (left axis) */}
          {[igMin, igMin + (igMax - igMin) / 2, igMax].map((v) => (
            <g key={v}>
              <line x1={padL} x2={chartW - padR} y1={igToY(v)} y2={igToY(v)} stroke="#1e293b" strokeWidth="1" />
              <text x={padL - 4} y={igToY(v) + 3} textAnchor="end" fill="#60a5fa" fontSize="8">{Math.round(v)}</text>
            </g>
          ))}
          {/* HY Y labels (right axis) */}
          {[hyMin, hyMin + (hyMax - hyMin) / 2, hyMax].map((v) => (
            <text key={`hy-${v}`} x={chartW - padR + 2} y={hyToY(v) + 3} textAnchor="start" fill="#f87171" fontSize="8">{Math.round(v)}</text>
          ))}
          {/* X labels */}
          {cmbxData.map((d, i) => (
            i % 3 === 0 && <text key={d.label} x={toX(i)} y={chartH - 4} textAnchor="middle" fill="#475569" fontSize="8">{d.label}</text>
          ))}
          {/* Axis labels */}
          <text x={12} y={chartH / 2} textAnchor="middle" fill="#60a5fa" fontSize="8" transform={`rotate(-90,12,${chartH / 2})`}>IG (bps)</text>
          <text x={chartW - 4} y={chartH / 2} textAnchor="middle" fill="#f87171" fontSize="8" transform={`rotate(90,${chartW - 4},${chartH / 2})`}>HY (bps)</text>
          {/* IG line */}
          <path d={igPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
          {/* HY line */}
          <path d={hyPath} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3" />
          {/* Legend */}
          <line x1={padL} y1={padT + 2} x2={padL + 20} y2={padT + 2} stroke="#3b82f6" strokeWidth="2" />
          <text x={padL + 24} y={padT + 5} fill="#60a5fa" fontSize="8">IG CMBX</text>
          <line x1={padL + 80} y1={padT + 2} x2={padL + 100} y2={padT + 2} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,3" />
          <text x={padL + 104} y={padT + 5} fill="#f87171" fontSize="8">HY CMBX</text>
        </svg>
      </div>

      {/* Bid/Ask liquidity table + Extension risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/60 border border-border/50 rounded-md p-5">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            Bid/Ask Liquidity by Tranche
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50">
                <th className="py-2 text-left text-muted-foreground">Tranche</th>
                <th className="py-2 text-right text-muted-foreground">Bid (bps)</th>
                <th className="py-2 text-right text-muted-foreground">Ask (bps)</th>
                <th className="py-2 text-right text-muted-foreground">Width</th>
                <th className="py-2 text-right text-muted-foreground">Depth</th>
              </tr>
            </thead>
            <tbody>
              {liquidity.map((l) => (
                <tr key={l.tranche} className="border-b border-border/30">
                  <td className="py-2 text-muted-foreground font-medium">{l.tranche}</td>
                  <td className="py-2 text-right text-green-400 font-mono">+{l.bid}</td>
                  <td className="py-2 text-right text-red-400 font-mono">+{l.ask}</td>
                  <td className="py-2 text-right text-amber-400 font-mono">{l.ask - l.bid}</td>
                  <td className={cn("py-2 text-right font-medium", depthColor[l.depth])}>{l.depth}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-3">Wider bid/ask in mezzanine tranches reflects reduced dealer appetite for credit risk.</p>
        </div>

        <div className="bg-muted/60 border border-border/50 rounded-md p-5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            Extension Risk Analysis — Office Sector
          </h3>
          <div className="space-y-3">
            {[
              { label: "Loans maturing 2025–2026", value: "$38B", note: "At risk of non-payoff" },
              { label: "Expected extensions", value: "62%", note: "Per CRE analytics firms" },
              { label: "Avg extension period", value: "18 mo", note: "Weighted average" },
              { label: "Discount to par (SASB)", value: "-22%", note: "Trophy NYC office" },
              { label: "B-piece implied loss", value: "35–65%", note: "Scenario analysis" },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3 border-b border-border/30 pb-2">
                <div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.note}</div>
                </div>
                <div className="text-sm font-medium text-orange-300 whitespace-nowrap">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <p className="text-xs text-orange-300 leading-relaxed">
              Office loans face secular headwinds from remote work adoption. Special servicers increasingly pursuing discounted payoffs (DPOs) vs. extended workout periods.
            </p>
          </div>
        </div>
      </div>

      {/* Trading desk workflow */}
      <div className="bg-muted/60 border border-border/50 rounded-md overflow-hidden">
        <button
          onClick={() => setShowWorkflow(!showWorkflow)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            CMBS Trading Desk Workflow
          </span>
          {showWorkflow ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {showWorkflow && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { step: "1. Pre-Trade", items: ["Pull Bloomberg CMBX screens", "Check TREPP watchlist updates", "Review S&P/Fitch servicer reports", "Size position vs. risk limits"], color: "border-border text-primary" },
                  { step: "2. Price Discovery", items: ["Request dealer runs (Goldman, Citi, JPM)", "Compare cash vs. synthetic basis", "Check last trade tape (TRACE)", "Confirm ratings/factor sheets"], color: "border-green-500/30 text-green-300" },
                  { step: "3. Execution", items: ["Submit BWIC (Bid Wanted in Comp)", "Negotiate bilateral with dealer", "Confirm settlement T+3 (DTC/FAST)", "Book trade in OMS (Aladdin/SS&C)"], color: "border-amber-500/30 text-amber-300" },
                  { step: "4. Post-Trade", items: ["Update position risk systems", "Monitor servicer advances", "Watch delinquency triggers", "Report to PM & risk committee"], color: "border-border text-primary" },
                ].map((phase) => (
                  <div key={phase.step} className={cn("border rounded-md p-4 space-y-2", phase.color.split(" ")[0])}>
                    <div className={cn("text-xs font-medium", phase.color.split(" ")[1])}>{phase.step}</div>
                    <ul className="space-y-1">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <span className="mt-0.5 shrink-0" style={{ color: phase.color.split(" ")[1].replace("text-", "") }}>›</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CMBSPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      {/* HERO Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8 border-l-4 border-l-primary rounded-md bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-md bg-primary/15 border border-border">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Commercial Mortgage-Backed Securities</h1>
            <p className="text-sm text-muted-foreground mt-1">
              CMBS structure, DSCR/LTV analysis, property sectors, IO periods, and CMBS trading mechanics
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <InfoBadge text="Structured Credit" color="blue" />
              <InfoBadge text="CRE Finance" color="purple" />
              <InfoBadge text="Fixed Income" color="green" />
              <InfoBadge text="CMBX Index" color="amber" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="structure">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 bg-muted/60 border border-border/50 rounded-md p-1 mb-6 h-auto gap-1">
          {[
            { value: "structure", label: "CMBS Structure", icon: Layers },
            { value: "loans", label: "Loan Analysis", icon: Building2 },
            { value: "performance", label: "Performance", icon: BarChart3 },
            { value: "trading", label: "Trading & Spreads", icon: TrendingUp },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-1.5 text-xs py-2 data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground rounded-lg transition-all"
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="structure" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <StructureTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="loans" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <LoanAnalysisTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="performance" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <PerformanceTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="trading" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <TradingTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
