"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Shield,
  FileText,
  Layers,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Building2,
  Briefcase,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 863;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Data ─────────────────────────────────────────────────────────────────────

interface ECA {
  name: string;
  country: string;
  shortName: string;
  ownership: string;
  annualExposure: number; // USD bn
  products: string[];
  keySectors: string[];
  founded: number;
  color: string;
}

const ECAS: ECA[] = [
  {
    name: "Export-Import Bank of the United States",
    country: "United States",
    shortName: "US Ex-Im",
    ownership: "100% Government",
    annualExposure: 27,
    products: ["Direct Loans", "Loan Guarantees", "Working Capital", "Credit Insurance"],
    keySectors: ["Aerospace", "Energy", "Infrastructure", "Manufacturing"],
    founded: 1934,
    color: "#3b82f6",
  },
  {
    name: "UK Export Finance",
    country: "United Kingdom",
    shortName: "UKEF",
    ownership: "100% Government",
    annualExposure: 18,
    products: ["Buyer Credit", "Supplier Credit", "Bond Support", "Export Insurance"],
    keySectors: ["Defense", "Aerospace", "Oil & Gas", "Infrastructure"],
    founded: 1919,
    color: "#ef4444",
  },
  {
    name: "Euler Hermes / AGA",
    country: "Germany",
    shortName: "Euler Hermes",
    ownership: "Government-backed (Allianz)",
    annualExposure: 35,
    products: ["Untied Loans", "Supplier Credits", "Guarantees", "Investment Guarantees"],
    keySectors: ["Automotive", "Machinery", "Chemicals", "Renewables"],
    founded: 1949,
    color: "#f59e0b",
  },
  {
    name: "BpiFrance Assurance Export",
    country: "France",
    shortName: "BpiFrance",
    ownership: "51% Government",
    annualExposure: 16,
    products: ["Credit Insurance", "Buyer Credit", "Investment Insurance", "Bonds"],
    keySectors: ["Aerospace", "Nuclear", "Agriculture", "Luxury Goods"],
    founded: 2013,
    color: "#8b5cf6",
  },
  {
    name: "Sinosure",
    country: "China",
    shortName: "Sinosure",
    ownership: "100% State-owned",
    annualExposure: 68,
    products: ["Short-term Credit", "MLT Credit", "Investment Insurance", "Bonds"],
    keySectors: ["Infrastructure", "Energy", "Telecoms", "Manufacturing"],
    founded: 2001,
    color: "#ec4899",
  },
  {
    name: "Nippon Export & Investment Insurance",
    country: "Japan",
    shortName: "NEXI",
    ownership: "100% Government",
    annualExposure: 22,
    products: ["Trade Insurance", "Overseas Investment", "Untied Loan", "Energy Security"],
    keySectors: ["Automotive", "Electronics", "LNG", "Infrastructure"],
    founded: 2001,
    color: "#06b6d4",
  },
  {
    name: "Export Development Canada",
    country: "Canada",
    shortName: "EDC",
    ownership: "Crown Corporation",
    annualExposure: 14,
    products: ["Loans", "Guarantees", "Insurance", "Bonding"],
    keySectors: ["Natural Resources", "Agri-food", "Cleantech", "Infrastructure"],
    founded: 1944,
    color: "#10b981",
  },
  {
    name: "SACE S.p.A.",
    country: "Italy",
    shortName: "SACE",
    ownership: "CDP Group (State)",
    annualExposure: 11,
    products: ["Export Credit", "Investment Protection", "Financial Guarantees", "Surety"],
    keySectors: ["Energy", "Aerospace", "Infrastructure", "Defense"],
    founded: 1977,
    color: "#f97316",
  },
];

interface CIRRRate {
  currency: string;
  rate: number;
  maturity: string;
}

const CIRR_RATES: CIRRRate[] = [
  { currency: "USD", rate: 5.42, maturity: "Up to 5 years" },
  { currency: "USD", rate: 5.67, maturity: "5-8.5 years" },
  { currency: "USD", rate: 5.89, maturity: "Over 8.5 years" },
  { currency: "EUR", rate: 4.21, maturity: "Up to 5 years" },
  { currency: "EUR", rate: 4.46, maturity: "5-8.5 years" },
  { currency: "EUR", rate: 4.68, maturity: "Over 8.5 years" },
  { currency: "GBP", rate: 5.18, maturity: "Up to 5 years" },
  { currency: "GBP", rate: 5.43, maturity: "5-8.5 years" },
  { currency: "GBP", rate: 5.65, maturity: "Over 8.5 years" },
  { currency: "JPY", rate: 1.92, maturity: "Up to 5 years" },
  { currency: "JPY", rate: 2.17, maturity: "5-8.5 years" },
  { currency: "JPY", rate: 2.39, maturity: "Over 8.5 years" },
  { currency: "CAD", rate: 5.11, maturity: "Up to 5 years" },
  { currency: "CAD", rate: 5.36, maturity: "5-8.5 years" },
  { currency: "CAD", rate: 5.58, maturity: "Over 8.5 years" },
];

interface SectorTerms {
  sector: string;
  maxRepayment: number; // years
  maxLocal: number; // % of contract
  tied: boolean;
  note: string;
}

const SECTOR_TERMS: SectorTerms[] = [
  { sector: "Civil Aircraft", maxRepayment: 12, maxLocal: 30, tied: true, note: "ASU guidelines apply; separate Aircraft Sector Understanding" },
  { sector: "Nuclear Power Plants", maxRepayment: 18, maxLocal: 30, tied: true, note: "Special terms for complete nuclear plants" },
  { sector: "Ships", maxRepayment: 12, maxLocal: 20, tied: true, note: "OECD Shipbuilding Understanding" },
  { sector: "Renewable Energy", maxRepayment: 18, maxLocal: 40, tied: false, note: "Climate-related projects get enhanced terms" },
  { sector: "Rail Infrastructure", maxRepayment: 18, maxLocal: 30, tied: false, note: "Treated as infrastructure sector" },
  { sector: "Water & Sanitation", maxRepayment: 18, maxLocal: 50, tied: false, note: "Social infrastructure; higher local cost allowed" },
  { sector: "General Industrial", maxRepayment: 10, maxLocal: 15, tied: true, note: "Standard OECD Consensus terms" },
  { sector: "Satellites / Space", maxRepayment: 12, maxLocal: 15, tied: true, note: "Treated under high-tech category" },
];

// Country risk categories 1-7 premium matrix
// rows = country category (1-7), cols = repayment horizon (2, 5, 10, 15 years)
const RISK_PREMIUMS: number[][] = [
  [0.22, 0.33, 0.54, 0.72],
  [0.45, 0.68, 1.10, 1.47],
  [0.78, 1.18, 1.90, 2.54],
  [1.22, 1.84, 2.97, 3.96],
  [2.01, 3.03, 4.88, 6.51],
  [3.32, 5.01, 8.08, 10.77],
  [5.49, 8.28, 13.35, 17.80],
];

// ── Reusable UI ───────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function InfoCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-base font-semibold" style={color ? { color } : undefined}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Tab 1: ECA Overview ───────────────────────────────────────────────────────

function ECAOverviewTab() {
  const [selected, setSelected] = useState<ECA | null>(null);
  const maxExposure = Math.max(...ECAS.map((e) => e.annualExposure));

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Globe}
        title="Major Export Credit Agencies"
        subtitle="Government-backed institutions that support domestic exports through financing, guarantees, and insurance"
      />

      {/* Role summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Combined Annual Exposure", value: `$${ECAS.reduce((a, e) => a + e.annualExposure, 0)}bn+`, sub: "8 major ECAs" },
          { label: "Global ECA Market", value: "$800bn+", sub: "Annual new commitments" },
          { label: "Typical Coverage", value: "85–95%", sub: "Of eligible contract value" },
        ].map((c) => (
          <InfoCard key={c.label} label={c.label} value={c.value} sub={c.sub} />
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Annual New Business Exposure (USD bn)</h3>
        <svg viewBox="0 0 700 260" className="w-full" aria-label="ECA exposure bar chart">
          {ECAS.map((eca, i) => {
            const barW = 64;
            const gap = 22;
            const x = i * (barW + gap) + 30;
            const barH = (eca.annualExposure / maxExposure) * 180;
            const y = 200 - barH;
            return (
              <g key={eca.shortName} onClick={() => setSelected(selected?.shortName === eca.shortName ? null : eca)} className="cursor-pointer">
                <rect
                  x={x} y={y} width={barW} height={barH}
                  fill={eca.color}
                  opacity={selected && selected.shortName !== eca.shortName ? 0.35 : 0.85}
                  rx={4}
                />
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={11} fill="currentColor" className="fill-foreground font-medium">
                  ${eca.annualExposure}
                </text>
                <text x={x + barW / 2} y={218} textAnchor="middle" fontSize={10} fill="currentColor" className="fill-muted-foreground">
                  {eca.shortName.split(" ").slice(0, 1).join("")}
                </text>
                <text x={x + barW / 2} y={230} textAnchor="middle" fontSize={10} fill="currentColor" className="fill-muted-foreground">
                  {eca.shortName.split(" ").slice(1).join(" ").slice(0, 8)}
                </text>
              </g>
            );
          })}
          {/* Y-axis gridlines */}
          {[0, 25, 50, 75].map((pct) => {
            const y = 200 - (pct / maxExposure) * 180;
            return (
              <g key={`grid-${pct}`}>
                <line x1={20} y1={y} x2={680} y2={y} stroke="currentColor" strokeOpacity={0.1} strokeDasharray="4 4" />
                <text x={16} y={y + 4} textAnchor="end" fontSize={9} fill="currentColor" className="fill-muted-foreground">{pct}</text>
              </g>
            );
          })}
        </svg>
        <p className="text-xs text-muted-foreground mt-2 text-center">Click a bar to see ECA details below</p>
      </div>

      {/* Comparison table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-semibold text-foreground">ECA</th>
                <th className="text-left p-3 font-semibold text-foreground">Country</th>
                <th className="text-left p-3 font-semibold text-foreground">Ownership</th>
                <th className="text-right p-3 font-semibold text-foreground">Exposure (bn)</th>
                <th className="text-left p-3 font-semibold text-foreground">Key Sectors</th>
              </tr>
            </thead>
            <tbody>
              {ECAS.map((eca) => (
                <tr
                  key={eca.shortName}
                  className={cn(
                    "border-b border-border/50 cursor-pointer transition-colors",
                    selected?.shortName === eca.shortName ? "bg-primary/5" : "hover:bg-muted/20"
                  )}
                  onClick={() => setSelected(selected?.shortName === eca.shortName ? null : eca)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: eca.color }} />
                      <span className="font-medium text-foreground">{eca.shortName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{eca.country}</td>
                  <td className="p-3 text-muted-foreground text-xs">{eca.ownership}</td>
                  <td className="p-3 text-right font-semibold text-foreground">${eca.annualExposure}bn</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {eca.keySectors.slice(0, 3).map((sec) => (
                        <span key={sec} className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">{sec}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.shortName}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-card border rounded-xl p-5"
            style={{ borderColor: selected.color + "66" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ background: selected.color }} />
              <h3 className="font-semibold text-foreground">{selected.name}</h3>
              <span className="text-xs text-muted-foreground ml-auto">Est. {selected.founded}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <InfoCard label="Country" value={selected.country} />
              <InfoCard label="Ownership" value={selected.ownership} />
              <InfoCard label="Annual Exposure" value={`$${selected.annualExposure}bn`} />
              <InfoCard label="Products" value={`${selected.products.length} types`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Product Range</div>
              <div className="flex flex-wrap gap-2">
                {selected.products.map((p) => (
                  <span key={p} className="px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">{p}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role in exports */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">How ECAs Support Exports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Bridging the Finance Gap",
              desc: "ECAs step in when commercial banks refuse to lend due to political or commercial risk in the buyer's country, enabling deals that would otherwise be impossible.",
            },
            {
              title: "Leveling the Playing Field",
              desc: "ECAs allow domestic exporters to compete with foreign rivals backed by their own government financing, ensuring no country's exporters are disadvantaged.",
            },
            {
              title: "Supporting National Policy",
              desc: "ECAs channel financing toward strategic sectors such as defense, aerospace, energy infrastructure, and green technology aligned with national priorities.",
            },
            {
              title: "Risk Mitigation",
              desc: "By insuring against buyer default, expropriation, currency inconvertibility, and political violence, ECAs let exporters confidently enter high-risk markets.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: OECD Consensus ─────────────────────────────────────────────────────

function OECDConsensusTab() {
  const horizons = ["2 yr", "5 yr", "10 yr", "15 yr"];
  const categories = ["Cat 1", "Cat 2", "Cat 3", "Cat 4", "Cat 5", "Cat 6", "Cat 7"];

  // Color scale for heatmap: green (low) → red (high)
  function premiumColor(val: number): string {
    const minV = 0.2;
    const maxV = 18;
    const t = Math.min(1, Math.max(0, (val - minV) / (maxV - minV)));
    const r = Math.round(30 + t * 220);
    const g = Math.round(210 - t * 175);
    const b = Math.round(30);
    return `rgb(${r},${g},${b})`;
  }

  const cirrByCurrency: { [key: string]: CIRRRate[] } = {};
  for (const r of CIRR_RATES) {
    if (!cirrByCurrency[r.currency]) cirrByCurrency[r.currency] = [];
    cirrByCurrency[r.currency].push(r);
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={FileText}
        title="OECD Arrangement on Officially Supported Export Credits"
        subtitle="The Consensus sets minimum interest rates, maximum repayment terms, and premium floors for OECD member ECAs"
      />

      {/* Key principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "CIRR (Commercial Interest Reference Rate)",
            desc: "Minimum fixed interest rate ECAs can offer on direct loans, reset monthly based on government bond yields + 100bps spread.",
          },
          {
            title: "Maximum Repayment Terms",
            desc: "Generally 10 years for rich countries, 18 years for least-developed. Sector-specific rules for aircraft, nuclear, ships.",
          },
          {
            title: "Minimum Premium (MPR)",
            desc: "Risk-based premium floor set by country category (1-7). ECAs cannot undercut these levels to avoid a 'race to the bottom'.",
          },
          {
            title: "Local Cost Support",
            desc: "ECA can cover local costs (in-country expenditure) up to a defined % of the contract, preventing full bypass of domestic competition.",
          },
        ].map((item) => (
          <div key={item.title} className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm font-semibold text-foreground mb-1">{item.title}</div>
            <div className="text-xs text-muted-foreground">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* CIRR rates table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">CIRR Rates by Currency (Indicative, % p.a.)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-semibold text-muted-foreground">Currency</th>
                <th className="text-center p-2 font-semibold text-muted-foreground">Up to 5 yrs</th>
                <th className="text-center p-2 font-semibold text-muted-foreground">5–8.5 yrs</th>
                <th className="text-center p-2 font-semibold text-muted-foreground">Over 8.5 yrs</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(cirrByCurrency).map(([ccy, rates]) => (
                <tr key={ccy} className="border-b border-border/40">
                  <td className="p-2 font-semibold text-foreground">{ccy}</td>
                  {rates.map((r) => (
                    <td key={r.maturity} className="p-2 text-center text-primary font-mono">{r.rate.toFixed(2)}%</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">CIRR = relevant government bond yield (5yr, 7yr, or 10yr) + 100bps. Published monthly by OECD.</p>
      </div>

      {/* Sector maximum repayment terms */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Maximum Repayment Terms by Sector</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-semibold text-muted-foreground">Sector</th>
                <th className="text-center p-2 font-semibold text-muted-foreground">Max Repayment</th>
                <th className="text-center p-2 font-semibold text-muted-foreground">Max Local Cost</th>
                <th className="text-center p-2 font-semibold text-muted-foreground">Tied Aid</th>
                <th className="text-left p-2 font-semibold text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {SECTOR_TERMS.map((sec) => (
                <tr key={sec.sector} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="p-2 font-medium text-foreground">{sec.sector}</td>
                  <td className="p-2 text-center font-mono text-primary">{sec.maxRepayment} yrs</td>
                  <td className="p-2 text-center font-mono text-amber-400">{sec.maxLocal}%</td>
                  <td className="p-2 text-center">
                    {sec.tied ? (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">Tied</span>
                    ) : (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Untied</span>
                    )}
                  </td>
                  <td className="p-2 text-xs text-muted-foreground">{sec.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Country risk heatmap */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Minimum Premium Rate (MPR) Heatmap</h3>
        <p className="text-xs text-muted-foreground mb-4">Annual premium % by country risk category (1 = lowest risk) and repayment horizon</p>
        <svg viewBox="0 0 560 300" className="w-full" aria-label="Country risk premium heatmap">
          {/* Column headers */}
          {horizons.map((h, j) => (
            <text key={h} x={130 + j * 100 + 40} y={24} textAnchor="middle" fontSize={11} fill="currentColor" className="fill-muted-foreground font-medium">
              {h}
            </text>
          ))}
          {/* Row headers + cells */}
          {RISK_PREMIUMS.map((row, i) => {
            const y = 38 + i * 36;
            return (
              <g key={`row-${i}`}>
                <text x={118} y={y + 18} textAnchor="end" fontSize={11} fill="currentColor" className="fill-foreground font-semibold">
                  {categories[i]}
                </text>
                {row.map((val, j) => {
                  const x = 130 + j * 100;
                  const bg = premiumColor(val);
                  return (
                    <g key={`cell-${i}-${j}`}>
                      <rect x={x + 4} y={y + 2} width={88} height={30} rx={4} fill={bg} opacity={0.75} />
                      <text x={x + 48} y={y + 21} textAnchor="middle" fontSize={11} fill="white" fontWeight="600">
                        {val.toFixed(2)}%
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
          {/* Legend */}
          <defs>
            <linearGradient id="legendGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgb(30,210,30)" stopOpacity={0.75} />
              <stop offset="100%" stopColor="rgb(250,35,30)" stopOpacity={0.75} />
            </linearGradient>
          </defs>
          <rect x={130} y={290} width={300} height={8} rx={4} fill="url(#legendGrad)" />
          <text x={130} y={288} fontSize={9} fill="currentColor" className="fill-muted-foreground">Low risk</text>
          <text x={430} y={288} textAnchor="end" fontSize={9} fill="currentColor" className="fill-muted-foreground">High risk</text>
        </svg>

        {/* Country examples by category */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { cat: "Cat 1-2", examples: "USA, Germany, Japan, Australia", color: "text-emerald-400" },
            { cat: "Cat 3-4", examples: "Brazil, Mexico, China, Malaysia", color: "text-amber-400" },
            { cat: "Cat 5-6", examples: "India, Nigeria, Egypt, Pakistan", color: "text-orange-400" },
            { cat: "Cat 7", examples: "Sudan, Zimbabwe, Syria, Venezuela", color: "text-red-400" },
          ].map((item) => (
            <div key={item.cat} className="bg-muted/20 rounded-lg p-2">
              <div className={cn("text-xs font-semibold mb-1", item.color)}>{item.cat}</div>
              <div className="text-xs text-muted-foreground">{item.examples}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Products ───────────────────────────────────────────────────────────

function ProductsTab() {
  const [activeProduct, setActiveProduct] = useState<string>("buyer-credit");

  const products = [
    { id: "buyer-credit", label: "Buyer Credit" },
    { id: "supplier-credit", label: "Supplier Credit" },
    { id: "political-risk", label: "Political Risk Insurance" },
    { id: "guarantees", label: "Guarantees & Bonds" },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Layers}
        title="ECA Product Suite"
        subtitle="From direct loans to insurance policies, ECAs offer a range of instruments to de-risk international trade"
      />

      {/* Product selector */}
      <div className="flex flex-wrap gap-2">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveProduct(p.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
              activeProduct === p.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeProduct === "buyer-credit" && (
          <motion.div key="buyer-credit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BuyerCreditFlow />
          </motion.div>
        )}
        {activeProduct === "supplier-credit" && (
          <motion.div key="supplier-credit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SupplierCreditFlow />
          </motion.div>
        )}
        {activeProduct === "political-risk" && (
          <motion.div key="political-risk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PoliticalRiskPanel />
          </motion.div>
        )}
        {activeProduct === "guarantees" && (
          <motion.div key="guarantees" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GuaranteesPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BuyerCreditFlow() {
  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">Buyer Credit Structure</h3>
        <p className="text-xs text-muted-foreground mb-5">
          In a buyer credit arrangement, the ECA-backed bank lends directly to the foreign buyer, who uses the loan proceeds to pay the exporter upfront.
          The exporter receives full payment; the credit risk sits with the bank (covered by ECA guarantee/insurance).
        </p>
        {/* Flow diagram */}
        <svg viewBox="0 0 700 220" className="w-full" aria-label="Buyer credit flow diagram">
          {/* Boxes */}
          {[
            { x: 10, y: 80, w: 120, h: 60, label: "Exporter", sub: "(Supplier Country)", fill: "#3b82f6" },
            { x: 190, y: 80, w: 120, h: 60, label: "Lending Bank", sub: "(ECA-backed)", fill: "#8b5cf6" },
            { x: 370, y: 80, w: 120, h: 60, label: "Foreign Buyer", sub: "(Borrower)", fill: "#f59e0b" },
            { x: 550, y: 80, w: 120, h: 60, label: "ECA", sub: "(Guarantor)", fill: "#10b981" },
          ].map((box) => (
            <g key={box.label}>
              <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={8} fill={box.fill} fillOpacity={0.2} stroke={box.fill} strokeOpacity={0.6} />
              <text x={box.x + box.w / 2} y={box.y + 26} textAnchor="middle" fontSize={12} fill="currentColor" className="fill-foreground font-semibold">
                {box.label}
              </text>
              <text x={box.x + box.w / 2} y={box.y + 42} textAnchor="middle" fontSize={9} fill="currentColor" className="fill-muted-foreground">
                {box.sub}
              </text>
            </g>
          ))}
          {/* Arrows */}
          {/* Loan: Bank → Buyer */}
          <line x1={310} y1={100} x2={368} y2={100} stroke="#8b5cf6" strokeWidth={2} />
          <polygon points="368,96 378,100 368,104" fill="#8b5cf6" />
          <text x={339} y={92} textAnchor="middle" fontSize={9} fill="#8b5cf6">Loan</text>
          {/* Payment: Buyer → Exporter (via bank) shown as dashed */}
          <line x1={368} y1={128} x2={132} y2={128} stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" />
          <polygon points="132,124 122,128 132,132" fill="#f59e0b" />
          <text x={250} y={145} textAnchor="middle" fontSize={9} fill="#f59e0b">Payment (via bank)</text>
          {/* Goods: Exporter → Buyer */}
          <line x1={132} y1={90} x2={368} y2={90} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 2" />
          <polygon points="368,86 378,90 368,94" fill="#3b82f6" />
          <text x={250} y={82} textAnchor="middle" fontSize={9} fill="#3b82f6">Goods / Services</text>
          {/* Guarantee: ECA ↔ Bank */}
          <line x1={548} y1={110} x2={312} y2={110} stroke="#10b981" strokeWidth={1.5} />
          <polygon points="312,106 302,110 312,114" fill="#10b981" />
          <text x={430} y={102} textAnchor="middle" fontSize={9} fill="#10b981">Guarantee / Insurance</text>
          {/* Premium: Bank → ECA */}
          <text x={430} y={126} textAnchor="middle" fontSize={9} fill="#10b981">Premium</text>
          {/* Repayment: Buyer → Bank */}
          <path d="M 430 145 Q 250 175 250 175 Q 230 175 230 155" stroke="#f59e0b" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
          <text x={310} y={185} textAnchor="middle" fontSize={9} fill="#f59e0b">Repayments (semi-annual)</text>
        </svg>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Typical Loan Size", value: "$10m – $2bn+" },
          { label: "ECA Coverage", value: "85–100% of loan" },
          { label: "Repayment", value: "Semi-annual, 5–18 yrs" },
        ].map((c) => (
          <InfoCard key={c.label} label={c.label} value={c.value} />
        ))}
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Features</div>
        <ul className="space-y-1">
          {[
            "Exporter receives payment immediately upon shipment/delivery",
            "No contingent liability on exporter's balance sheet",
            "OECD Consensus sets minimum terms (CIRR, max repayment, local cost cap)",
            "Bank retains ~15% uncovered portion as 'skin in the game'",
            "Eligible for Project Finance and structured transactions",
          ].map((feat) => (
            <li key={feat} className="flex gap-2 text-xs text-muted-foreground">
              <ArrowRight size={12} className="text-primary mt-0.5 shrink-0" />
              {feat}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SupplierCreditFlow() {
  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">Supplier Credit Structure</h3>
        <p className="text-xs text-muted-foreground mb-5">
          In a supplier credit, the exporter extends credit directly to the foreign buyer and later discounts (sells) the resulting receivables to a bank,
          which is guaranteed by the ECA. The exporter retains credit risk until the receivables are sold.
        </p>
        <svg viewBox="0 0 700 220" className="w-full" aria-label="Supplier credit flow diagram">
          {[
            { x: 10, y: 80, w: 130, h: 60, label: "Exporter", sub: "(Extends Credit)", fill: "#3b82f6" },
            { x: 200, y: 80, w: 130, h: 60, label: "Forfaiting Bank", sub: "(Discounts Receivables)", fill: "#8b5cf6" },
            { x: 390, y: 80, w: 130, h: 60, label: "Foreign Buyer", sub: "(Buyer Country)", fill: "#f59e0b" },
            { x: 565, y: 80, w: 110, h: 60, label: "ECA", sub: "(Insures Bank)", fill: "#10b981" },
          ].map((box) => (
            <g key={box.label}>
              <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={8} fill={box.fill} fillOpacity={0.2} stroke={box.fill} strokeOpacity={0.6} />
              <text x={box.x + box.w / 2} y={box.y + 26} textAnchor="middle" fontSize={12} fill="currentColor" className="fill-foreground font-semibold">{box.label}</text>
              <text x={box.x + box.w / 2} y={box.y + 42} textAnchor="middle" fontSize={9} fill="currentColor" className="fill-muted-foreground">{box.sub}</text>
            </g>
          ))}
          {/* Goods: Exporter → Buyer */}
          <line x1={142} y1={88} x2={388} y2={88} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 2" />
          <polygon points="388,84 398,88 388,92" fill="#3b82f6" />
          <text x={265} y={80} textAnchor="middle" fontSize={9} fill="#3b82f6">Goods + Deferred Payment Terms</text>
          {/* Promissory note: Buyer → Exporter */}
          <line x1={388} y1={128} x2={142} y2={128} stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" />
          <polygon points="142,124 132,128 142,132" fill="#f59e0b" />
          <text x={265} y={143} textAnchor="middle" fontSize={9} fill="#f59e0b">Promissory Notes / Bills</text>
          {/* Discount: Exporter → Bank */}
          <line x1={142} y1={108} x2={198} y2={108} stroke="#3b82f6" strokeWidth={2} />
          <polygon points="198,104 208,108 198,112" fill="#3b82f6" />
          <text x={170} y={100} textAnchor="middle" fontSize={9} fill="#3b82f6">Sell notes</text>
          {/* Proceeds: Bank → Exporter */}
          <text x={170} y={122} textAnchor="middle" fontSize={9} fill="#8b5cf6">Proceeds (discounted)</text>
          {/* ECA insurance: ECA → Bank */}
          <line x1={563} y1={108} x2={332} y2={108} stroke="#10b981" strokeWidth={1.5} />
          <polygon points="332,104 322,108 332,112" fill="#10b981" />
          <text x={448} y={100} textAnchor="middle" fontSize={9} fill="#10b981">Credit Insurance</text>
        </svg>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Typical Deal Size", value: "$500k – $50m" },
          { label: "Discount Rate", value: "SOFR + ECA prem + margin" },
          { label: "Instruments", value: "Promissory notes, BoE" },
        ].map((c) => (
          <InfoCard key={c.label} label={c.label} value={c.value} />
        ))}
      </div>
    </div>
  );
}

function PoliticalRiskPanel() {
  const risks = [
    {
      name: "Expropriation",
      icon: Building2,
      severity: 85,
      desc: "Host government seizes or nationalizes the investor's assets without adequate compensation.",
      coverage: "Covers direct, creeping, and indirect expropriation; net book value of assets.",
      color: "#ef4444",
    },
    {
      name: "Political Violence / War",
      icon: AlertTriangle,
      severity: 70,
      desc: "Damage or destruction of assets or loss of business income due to war, revolution, insurrection, or terrorism.",
      coverage: "Physical asset damage, business interruption, civil disturbance.",
      color: "#f97316",
    },
    {
      name: "Transfer & Convertibility Restriction",
      icon: ArrowRight,
      severity: 60,
      desc: "Government prohibits conversion of local currency into hard currency or blocks transfer abroad.",
      coverage: "Covers inability to repatriate dividends, loan repayments, or export proceeds.",
      color: "#f59e0b",
    },
    {
      name: "Breach of Contract",
      icon: FileText,
      severity: 50,
      desc: "Host government or state entity breaches a contract with the foreign investor and arbitration is blocked or denied.",
      coverage: "Losses arising from state breach after arbitral award not honored.",
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Political Risk Insurance Coverage Types</h3>
        <p className="text-xs text-muted-foreground mb-5">
          PRI is offered by ECAs (and multilaterals like MIGA) to protect foreign direct investment and trade receivables against sovereign / quasi-sovereign risks
          that are beyond commercial credit analysis.
        </p>
        <div className="space-y-4">
          {risks.map((risk) => (
            <div key={risk.name} className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <risk.icon size={16} style={{ color: risk.color }} />
                <span className="font-semibold text-sm text-foreground">{risk.name}</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Severity:</span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${risk.severity}%`, background: risk.color }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{risk.desc}</p>
              <p className="text-xs text-primary">Coverage: {risk.coverage}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Typical Premium", value: "0.5–3.0% p.a.", sub: "of insured amount" },
          { label: "Coverage Ratio", value: "90–95%", sub: "of loss" },
          { label: "Max Tenor", value: "15–20 years", sub: "investment insurance" },
          { label: "Waiting Period", value: "6–12 months", sub: "before claim" },
        ].map((c) => (
          <InfoCard key={c.label} label={c.label} value={c.value} sub={c.sub} />
        ))}
      </div>
    </div>
  );
}

function GuaranteesPanel() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "Unfunded Guarantee",
            desc: "ECA guarantees repayment to the lending bank if the borrower defaults. No upfront disbursement by ECA; claim triggered on default.",
            pros: ["Off-balance sheet for ECA", "Reduces bank capital charge", "Flexible for syndicated loans"],
            color: "#3b82f6",
          },
          {
            title: "Funded Guarantee (Direct Loan)",
            desc: "ECA disburses funds directly to the borrower or lending bank. ECA carries the full exposure on its balance sheet.",
            pros: ["Lower all-in cost to borrower", "No dependency on private bank appetite", "Used for concessional finance"],
            color: "#8b5cf6",
          },
          {
            title: "Performance Bond",
            desc: "Guarantees the exporter's performance obligations (delivery, quality, completion). Called if exporter fails to perform under contract.",
            pros: ["Replaces cash retention", "Issued by bank, counter-guaranteed by ECA", "Bid bonds, advance payment bonds"],
            color: "#f59e0b",
          },
          {
            title: "Export Working Capital",
            desc: "Short-term facility (up to 18 months) backed by ECA guarantee enabling exporters to finance production costs before receiving export proceeds.",
            pros: ["Covers raw materials, labor, overhead", "Revolving or transactional", "Unlocks SME export capacity"],
            color: "#10b981",
          },
        ].map((item) => (
          <div key={item.title} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="font-semibold text-sm text-foreground">{item.title}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{item.desc}</p>
            <ul className="space-y-1">
              {item.pros.map((p) => (
                <li key={p} className="flex gap-2 text-xs" style={{ color: item.color }}>
                  <CheckCircle size={11} className="mt-0.5 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Letter of credit confirmation */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">Letter of Credit Confirmation</h3>
        <p className="text-xs text-muted-foreground mb-3">
          When a foreign buyer's bank issues an LC but is located in a high-risk country, a confirming bank (backed by ECA) adds its irrevocable undertaking
          to pay the exporter upon compliant document presentation, regardless of the issuing bank's ability to pay.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Issuing Bank Risk", value: "Eliminated", sub: "for exporter" },
            { label: "Country Risk", value: "Transferred", sub: "to ECA/confirming bank" },
            { label: "Payment Certainty", value: "Documents only", sub: "strict compliance" },
          ].map((c) => (
            <InfoCard key={c.label} label={c.label} value={c.value} sub={c.sub} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Deal Structuring ───────────────────────────────────────────────────

function DealStructuringTab() {
  const [showCaseStudy, setShowCaseStudy] = useState(false);

  // Pricing formula breakdown
  const baseRate = 5.42;
  const ecaPremium = 1.18;
  const bankMargin = 1.50;
  const allIn = baseRate + ecaPremium + bankMargin;

  // Timeline steps
  const timeline = [
    { phase: "Mandate", duration: "Wk 1–2", desc: "ECA mandate letter; appoint legal counsel; term sheet to borrower", color: "#3b82f6" },
    { phase: "Due Diligence", duration: "Wk 3–8", desc: "Technical, legal, E&S, financial DD; country risk assessment", color: "#8b5cf6" },
    { phase: "ECA Application", duration: "Wk 6–12", desc: "Formal ECA application; OECD notification; inter-agency clearance", color: "#f59e0b" },
    { phase: "Credit Approval", duration: "Wk 10–16", desc: "ECA credit committee; bank credit committee; syndication (if needed)", color: "#f97316" },
    { phase: "Documentation", duration: "Wk 14–20", desc: "Loan agreement, guarantee agreement, insurance policy, conditions precedent", color: "#ef4444" },
    { phase: "Signing / FC", duration: "Wk 18–24", desc: "Signing ceremony; financial close; first drawdown upon CP satisfaction", color: "#10b981" },
    { phase: "Disbursement", duration: "Ongoing", desc: "Progress draws tied to contract milestones; ECA monitoring", color: "#06b6d4" },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Briefcase}
        title="ECA Deal Structuring"
        subtitle="From pricing to documentation, environmental standards, and restructuring mechanisms"
      />

      {/* Pricing formula */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">ECA-Covered Loan Pricing Formula</h3>
        <div className="flex flex-wrap items-center gap-2 mb-5 text-sm">
          <div className="bg-blue-500/15 border border-blue-500/30 rounded-lg px-3 py-2 text-center">
            <div className="text-xs text-muted-foreground">Base Rate</div>
            <div className="font-semibold text-blue-400">CIRR / SOFR</div>
            <div className="text-xs text-blue-400">{baseRate.toFixed(2)}%</div>
          </div>
          <span className="text-muted-foreground font-bold text-lg">+</span>
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-lg px-3 py-2 text-center">
            <div className="text-xs text-muted-foreground">ECA Premium</div>
            <div className="font-semibold text-amber-400">MPR (risk cat)</div>
            <div className="text-xs text-amber-400">{ecaPremium.toFixed(2)}%</div>
          </div>
          <span className="text-muted-foreground font-bold text-lg">+</span>
          <div className="bg-purple-500/15 border border-purple-500/30 rounded-lg px-3 py-2 text-center">
            <div className="text-xs text-muted-foreground">Bank Margin</div>
            <div className="font-semibold text-purple-400">Credit spread</div>
            <div className="text-xs text-purple-400">{bankMargin.toFixed(2)}%</div>
          </div>
          <span className="text-muted-foreground font-bold text-lg">=</span>
          <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-lg px-3 py-2 text-center">
            <div className="text-xs text-muted-foreground">All-In Rate</div>
            <div className="font-semibold text-emerald-400">Borrower pays</div>
            <div className="text-xs text-emerald-400">{allIn.toFixed(2)}%</div>
          </div>
        </div>
        {/* Visual bar */}
        <svg viewBox="0 0 600 60" className="w-full" aria-label="Pricing stack bar">
          {[
            { label: "CIRR", val: baseRate, color: "#3b82f6" },
            { label: "ECA Prem", val: ecaPremium, color: "#f59e0b" },
            { label: "Bank Margin", val: bankMargin, color: "#8b5cf6" },
          ].reduce<{ x: number; segments: Array<{ x: number; w: number; label: string; val: number; color: string }> }>(
            (acc, seg) => {
              const w = (seg.val / allIn) * 580;
              acc.segments.push({ x: acc.x + 10, w, label: seg.label, val: seg.val, color: seg.color });
              acc.x += w;
              return acc;
            },
            { x: 0, segments: [] }
          ).segments.map((seg) => (
            <g key={seg.label}>
              <rect x={seg.x} y={10} width={seg.w} height={32} fill={seg.color} fillOpacity={0.7} />
              {seg.w > 60 && (
                <>
                  <text x={seg.x + seg.w / 2} y={28} textAnchor="middle" fontSize={11} fill="white" fontWeight="600">{seg.label}</text>
                  <text x={seg.x + seg.w / 2} y={42} textAnchor="middle" fontSize={10} fill="white">{seg.val.toFixed(2)}%</text>
                </>
              )}
            </g>
          ))}
        </svg>
        <p className="text-xs text-muted-foreground mt-3">
          Note: ECA premium is paid by borrower and remitted to ECA. On tied-aid deals, CIRR is the floor rate below which ECA cannot subsidize.
          For floating-rate deals, base rate is typically SOFR or EURIBOR.
        </p>
      </div>

      {/* Content requirements */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Content Requirements</h3>
        <p className="text-xs text-muted-foreground mb-4">
          ECAs require a minimum percentage of the export contract value to originate from the ECA's home country.
          This "domestic content" requirement ensures the transaction genuinely supports home-country exports.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "US Ex-Im Threshold", value: "≥ 50%", sub: "US content required" },
            { label: "UKEF Threshold", value: "≥ 20%", sub: "UK content required" },
            { label: "Euler Hermes", value: "≥ 50%", sub: "German content" },
            { label: "OECD General Rule", value: "85% cap", sub: "Max ECA cover of contract" },
          ].map((c) => (
            <InfoCard key={c.label} label={c.label} value={c.value} sub={c.sub} />
          ))}
        </div>
      </div>

      {/* Deal timeline */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Typical Deal Timeline (Medium-Large Transaction)</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[100px] top-0 bottom-0 w-px bg-border" />
          <div className="space-y-3">
            {timeline.map((step) => (
              <div key={step.phase} className="flex gap-4 items-start">
                <div className="w-[90px] text-right shrink-0">
                  <span className="text-xs font-medium text-muted-foreground">{step.duration}</span>
                </div>
                <div className="relative pl-4 shrink-0">
                  <div className="w-3 h-3 rounded-full border-2 mt-0.5" style={{ background: step.color, borderColor: step.color }} />
                </div>
                <div className="flex-1 pb-2">
                  <div className="text-sm font-semibold text-foreground">{step.phase}</div>
                  <div className="text-xs text-muted-foreground">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* E&S Standards */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Environmental & Social Standards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Equator Principles (EP4)",
              desc: "Framework for determining, assessing, and managing environmental and social risk. Mandatory for projects >$10m. Categorizes projects A (high risk) / B / C (low risk).",
              color: "#10b981",
            },
            {
              title: "OECD Common Approaches",
              desc: "OECD members apply environmental review to ECA-backed transactions. Benchmarks against IFC Performance Standards and World Bank Group guidelines.",
              color: "#3b82f6",
            },
            {
              title: "Paris Agreement Alignment",
              desc: "ECAs increasingly required to align portfolios with 1.5°C pathway. OECD export credit group working on common framework for climate accounting.",
              color: "#f59e0b",
            },
            {
              title: "IFC Performance Standards",
              desc: "8 performance standards on labor, community health, indigenous peoples, biodiversity, cultural heritage. Applied as benchmark for emerging market projects.",
              color: "#8b5cf6",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className="w-1 rounded-full shrink-0 mt-1" style={{ background: item.color, minHeight: "40px" }} />
              <div>
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paris Club */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Debt Restructuring: Paris Club</h3>
        <p className="text-xs text-muted-foreground mb-4">
          When a sovereign borrower cannot service ECA-backed loans, the Paris Club (informal group of 22 creditor nations)
          provides coordinated debt relief, ensuring comparable treatment across all bilateral creditors.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Rescheduling", value: "Extension of maturities", sub: "Most common treatment" },
            { label: "Debt Swap", value: "Equity / nature swaps", sub: "Debt-for-development" },
            { label: "HIPC Initiative", value: "Debt cancellation", sub: "Heavily indebted poor countries" },
          ].map((c) => (
            <InfoCard key={c.label} label={c.label} value={c.value} sub={c.sub} />
          ))}
        </div>
      </div>

      {/* Case study toggle */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors"
          onClick={() => setShowCaseStudy((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <Info size={16} className="text-primary" />
            <span className="font-semibold text-sm text-foreground">Case Study: Large Infrastructure Deal</span>
          </div>
          {showCaseStudy ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {showCaseStudy && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-4 border-t border-border">
                <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm font-semibold text-foreground mb-1">Hypothetical: $800m Power Plant in Sub-Saharan Africa</div>
                  <div className="text-xs text-muted-foreground mb-3">Illustrative deal combining multiple ECA products</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                      { k: "Exporter", v: "German turbine manufacturer (Euler Hermes backed)" },
                      { k: "Borrower", v: "State power utility, Cat 6 country" },
                      { k: "Total Project Cost", v: "$800m" },
                      { k: "ECA-covered portion", v: "$500m (German content: 65%)" },
                      { k: "Commercial tranche", v: "$200m (2 international banks, unguaranteed)" },
                      { k: "Equity / grants", v: "$100m (development bank + project sponsor)" },
                      { k: "Tenor", v: "14 years incl. 2yr grace" },
                      { k: "CIRR (EUR, 8.5yr+)", v: "4.68%" },
                      { k: "ECA Premium (Cat 6)", v: "8.08% (10yr horizon)" },
                      { k: "Bank Margin", v: "2.25% (elevated for Cat 6)" },
                      { k: "All-In Cost", v: "~15.01% p.a. (borrower)" },
                      { k: "E&S Category", v: "Category A — full ESIA required" },
                      { k: "Paris Club exposure?", v: "Yes — filed with OECD for reporting" },
                      { k: "Repayment source", v: "Power purchase agreement (USD-denominated)" },
                    ].map((row) => (
                      <div key={row.k} className="flex gap-2">
                        <span className="text-muted-foreground shrink-0 w-36">{row.k}:</span>
                        <span className="text-foreground font-medium">{row.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    At Cat 6, the ECA premium alone (8.08%) makes the all-in borrowing cost prohibitive without concessional blended finance.
                    In practice, a development finance institution (e.g., IFC, AfDB) would provide a first-loss tranche to bring down blended cost.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExportCreditPage() {
  // Consume PRNG to initialize any randomized display state
  useMemo(() => {
    // Prime PRNG for any future random use
    for (let i = 0; i < 10; i++) rand();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Globe size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Export Credit Agencies & Trade Finance</h1>
              <p className="text-sm text-muted-foreground">
                ECA-backed financing, OECD Consensus, political risk insurance, and deal structuring
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: "8 Major ECAs", icon: Globe },
              { label: "OECD Consensus", icon: FileText },
              { label: "PRI Coverage", icon: Shield },
              { label: "Deal Structuring", icon: Layers },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 border border-border text-xs text-muted-foreground">
                <Icon size={12} />
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap gap-1 h-auto mb-6 bg-muted/30 p-1 rounded-lg">
            <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs">
              <Globe size={13} /> ECA Overview
            </TabsTrigger>
            <TabsTrigger value="consensus" className="flex items-center gap-1.5 text-xs">
              <FileText size={13} /> OECD Consensus
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1.5 text-xs">
              <Layers size={13} /> Products
            </TabsTrigger>
            <TabsTrigger value="structuring" className="flex items-center gap-1.5 text-xs">
              <Briefcase size={13} /> Deal Structuring
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <ECAOverviewTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="consensus" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <OECDConsensusTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="products" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <ProductsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="structuring" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <DealStructuringTab />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
