"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Package,
  BarChart3,
  Zap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  Calculator,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
  Globe,
  ArrowRight,
  Truck,
  Building2,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 652002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 652002;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Instrument {
  name: string;
  abbrev: string;
  riskLevel: "Low" | "Medium" | "High";
  costBps: number;
  tenor: string;
  description: string;
  bestFor: string;
}

interface CommodityRow {
  commodity: string;
  advanceRate: number;
  haircut: number;
  ltvMax: number;
  liquidity: "High" | "Medium" | "Low";
  priceVolatility: string;
}

interface IndustryBenchmark {
  industry: string;
  dio: number;
  dso: number;
  dpo: number;
  ccc: number;
}

interface FintechPlatform {
  name: string;
  model: string;
  volumeB: number;
  buyers: number;
  founded: number;
  blockchain: boolean;
  eInvoicing: boolean;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const INSTRUMENTS: Instrument[] = [
  {
    name: "Letter of Credit",
    abbrev: "LC",
    riskLevel: "Low",
    costBps: 75,
    tenor: "30–180 days",
    description:
      "Bank-issued guarantee that payment will be made once conditions in the LC are fulfilled. Eliminates counterparty credit risk for the exporter.",
    bestFor: "New trade relationships, high-value goods, emerging markets",
  },
  {
    name: "Documentary Collection",
    abbrev: "DC",
    riskLevel: "Medium",
    costBps: 25,
    tenor: "30–120 days",
    description:
      "Exporter's bank sends shipping documents to importer's bank. Payment released on document presentation (D/P) or acceptance (D/A).",
    bestFor: "Established relationships, lower-risk corridors",
  },
  {
    name: "Bank Guarantee",
    abbrev: "BG",
    riskLevel: "Low",
    costBps: 100,
    tenor: "1–5 years",
    description:
      "Unconditional bank commitment to pay if the applicant defaults on contractual obligations. Covers performance, advance payment, bid bonds.",
    bestFor: "Infrastructure projects, long-term supply contracts",
  },
  {
    name: "Supply Chain Finance",
    abbrev: "SCF",
    riskLevel: "Low",
    costBps: 60,
    tenor: "30–120 days",
    description:
      "Buyer-led program where approved suppliers can sell receivables at buyer credit rating. Extends buyer DPO while reducing supplier financing costs.",
    bestFor: "Large buyers with investment-grade ratings, multi-supplier chains",
  },
];

const COMMODITY_ROWS: CommodityRow[] = [
  { commodity: "Crude Oil", advanceRate: 80, haircut: 20, ltvMax: 75, liquidity: "High", priceVolatility: "High" },
  { commodity: "Refined Products", advanceRate: 75, haircut: 25, ltvMax: 70, liquidity: "High", priceVolatility: "High" },
  { commodity: "LNG / Natural Gas", advanceRate: 70, haircut: 30, ltvMax: 65, liquidity: "Medium", priceVolatility: "Very High" },
  { commodity: "Copper", advanceRate: 78, haircut: 22, ltvMax: 73, liquidity: "High", priceVolatility: "Medium" },
  { commodity: "Aluminium", advanceRate: 75, haircut: 25, ltvMax: 70, liquidity: "High", priceVolatility: "Medium" },
  { commodity: "Agricultural (Soy)", advanceRate: 65, haircut: 35, ltvMax: 60, liquidity: "Medium", priceVolatility: "High" },
  { commodity: "Coffee / Cocoa", advanceRate: 60, haircut: 40, ltvMax: 55, liquidity: "Medium", priceVolatility: "High" },
  { commodity: "Steel Coil", advanceRate: 55, haircut: 45, ltvMax: 50, liquidity: "Low", priceVolatility: "Medium" },
];

const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  { industry: "Retail (General)", dio: 42, dso: 12, dpo: 38, ccc: 16 },
  { industry: "Automotive OEM", dio: 28, dso: 35, dpo: 55, ccc: 8 },
  { industry: "Pharmaceuticals", dio: 95, dso: 55, dpo: 62, ccc: 88 },
  { industry: "Technology Hardware", dio: 52, dso: 48, dpo: 42, ccc: 58 },
  { industry: "Food & Beverage", dio: 35, dso: 22, dpo: 30, ccc: 27 },
  { industry: "Oil & Gas (E&P)", dio: 18, dso: 28, dpo: 45, ccc: 1 },
  { industry: "Construction", dio: 38, dso: 68, dpo: 52, ccc: 54 },
  { industry: "Fashion / Apparel", dio: 88, dso: 32, dpo: 44, ccc: 76 },
];

const FINTECH_PLATFORMS: FintechPlatform[] = [
  { name: "Taulia", model: "Dynamic Discounting / SCF", volumeB: 500, buyers: 180, founded: 2009, blockchain: false, eInvoicing: true },
  { name: "C2FO", model: "Early Pay / Reverse Factoring", volumeB: 250, buyers: 1200, founded: 2008, blockchain: false, eInvoicing: true },
  { name: "Tradeshift", model: "E-Invoicing + SCF", volumeB: 150, buyers: 750, founded: 2010, blockchain: true, eInvoicing: true },
  { name: "Marco Polo (R3)", model: "Blockchain Trade Finance", volumeB: 60, buyers: 40, founded: 2017, blockchain: true, eInvoicing: true },
  { name: "we.trade (IBM)", model: "DLT Open Account Trade", volumeB: 30, buyers: 15, founded: 2018, blockchain: true, eInvoicing: false },
  { name: "Greensill (legacy)", model: "Supply Chain Finance", volumeB: 150, buyers: 400, founded: 2011, blockchain: false, eInvoicing: false },
  { name: "Kyriba", model: "Treasury + SCF Platform", volumeB: 80, buyers: 95, founded: 2000, blockchain: false, eInvoicing: true },
  { name: "Previse", model: "AI Instant Payment", volumeB: 12, buyers: 22, founded: 2016, blockchain: false, eInvoicing: true },
];

// ── Helper components ─────────────────────────────────────────────────────────

function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function InfoCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      {children}
    </div>
  );
}

function RiskBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const colors = {
    Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    High: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", colors[level])}>{level}</span>
  );
}

// ── Tab 1: Trade Finance Instruments ─────────────────────────────────────────

function LCFlowDiagram() {
  const steps = [
    { label: "Importer", sub: "Buyer / Applicant", x: 60, y: 120, color: "#3b82f6" },
    { label: "Issuing Bank", sub: "Importer's Bank", x: 220, y: 50, color: "#8b5cf6" },
    { label: "Advising Bank", sub: "Exporter's Bank", x: 380, y: 50, color: "#8b5cf6" },
    { label: "Exporter", sub: "Seller / Beneficiary", x: 540, y: 120, color: "#10b981" },
  ];

  const arrows: { x1: number; y1: number; x2: number; y2: number; label: string; color: string }[] = [
    { x1: 95, y1: 110, x2: 205, y2: 75, label: "① LC Application", color: "#3b82f6" },
    { x1: 235, y1: 50, x2: 365, y2: 50, label: "② LC Issuance", color: "#8b5cf6" },
    { x1: 395, y1: 65, x2: 540, y2: 110, label: "③ LC Advise", color: "#10b981" },
    { x1: 525, y1: 135, x2: 395, y2: 75, label: "④ Ship + Docs", color: "#f59e0b" },
    { x1: 365, y1: 65, x2: 235, y2: 65, label: "⑤ Doc Presentation", color: "#f59e0b" },
    { x1: 205, y1: 95, x2: 95, y2: 125, label: "⑥ Payment", color: "#10b981" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Globe className="w-4 h-4 text-primary" /> Letter of Credit — Process Flow
      </h3>
      <svg viewBox="0 0 630 200" className="w-full" style={{ height: 200 }}>
        {/* Arrows */}
        {arrows.map((a, i) => {
          const mx = (a.x1 + a.x2) / 2;
          const my = (a.y1 + a.y2) / 2;
          const dx = a.x2 - a.x1;
          const dy = a.y2 - a.y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = -dy / len;
          const ny = dx / len;
          const lx = mx + nx * 14;
          const ly = my + ny * 14;
          return (
            <g key={i}>
              <defs>
                <marker
                  id={`arr-${i}`}
                  markerWidth="6"
                  markerHeight="6"
                  refX="3"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill={a.color} />
                </marker>
              </defs>
              <line
                x1={a.x1}
                y1={a.y1}
                x2={a.x2}
                y2={a.y2}
                stroke={a.color}
                strokeWidth={1.5}
                strokeDasharray={i >= 3 ? "4 3" : "none"}
                markerEnd={`url(#arr-${i})`}
                opacity={0.85}
              />
              <text x={lx} y={ly} fontSize={8} fill={a.color} textAnchor="middle" dominantBaseline="middle" fontWeight="500">
                {a.label}
              </text>
            </g>
          );
        })}
        {/* Nodes */}
        {steps.map((st, i) => (
          <g key={i}>
            <circle cx={st.x} cy={st.y} r={28} fill={st.color + "22"} stroke={st.color} strokeWidth={1.5} />
            <text x={st.x} y={st.y - 5} fontSize={9} fill={st.color} textAnchor="middle" fontWeight="700">
              {st.label}
            </text>
            <text x={st.x} y={st.y + 9} fontSize={7.5} fill="#94a3b8" textAnchor="middle">
              {st.sub}
            </text>
          </g>
        ))}
        {/* Timeline baseline */}
        <line x1={30} y1={185} x2={600} y2={185} stroke="#334155" strokeWidth={1} />
        <text x={315} y={197} fontSize={8} fill="#64748b" textAnchor="middle">
          Typical timeline: 30–180 days from LC issuance to payment
        </text>
      </svg>
    </div>
  );
}

function InstrumentsTab() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<FileText className="w-4 h-4" />}
        title="Trade Finance Instruments"
        sub="Core products that mitigate payment risk and finance international trade flows"
      />

      <LCFlowDiagram />

      <div className="grid grid-cols-1 gap-3">
        {INSTRUMENTS.map((inst, i) => (
          <motion.div
            key={i}
            className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer"
            onClick={() => setExpanded(expanded === i ? null : i)}
            whileHover={{ scale: 1.005 }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                  {inst.abbrev}
                </span>
                <div>
                  <span className="font-semibold text-foreground text-sm">{inst.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RiskBadge level={inst.riskLevel} />
                    <span className="text-xs text-muted-foreground">{inst.tenor}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-primary">{inst.costBps} bps</span>
                  </div>
                </div>
              </div>
              {expanded === i ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
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
                  <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-2">
                    <p className="text-sm text-muted-foreground">{inst.description}</p>
                    <div className="flex items-start gap-2 mt-2">
                      <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Best for: </span>
                        {inst.bestFor}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Comparison table */}
      <InfoCard>
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-2 text-muted-foreground font-medium">Instrument</th>
                <th className="text-right pb-2 text-muted-foreground font-medium">Cost (bps)</th>
                <th className="text-right pb-2 text-muted-foreground font-medium">Risk Transfer</th>
                <th className="text-right pb-2 text-muted-foreground font-medium">Balance Sheet</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Letter of Credit", cost: "50–125", risk: "Full", bs: "Off (exporter)" },
                { name: "Documentary Collection", cost: "15–40", risk: "Partial", bs: "None" },
                { name: "Bank Guarantee", cost: "75–150", risk: "Full", bs: "Off (beneficiary)" },
                { name: "Supply Chain Finance", cost: "40–80", risk: "Buyer-rated", bs: "Off (supplier)" },
              ].map((r, i) => (
                <tr key={i} className="border-b border-border/40 last:border-0">
                  <td className="py-2 text-foreground font-medium">{r.name}</td>
                  <td className="py-2 text-right text-primary">{r.cost}</td>
                  <td className="py-2 text-right text-muted-foreground">{r.risk}</td>
                  <td className="py-2 text-right text-emerald-400">{r.bs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoCard>
    </div>
  );
}

// ── Tab 2: Receivables Financing ──────────────────────────────────────────────

function CashFlowTimeline({
  advanceRate,
  discountRate,
  faceValue,
  termDays,
}: {
  advanceRate: number;
  discountRate: number;
  faceValue: number;
  termDays: number;
}) {
  const advanceAmt = faceValue * (advanceRate / 100);
  const discountCost = faceValue * (discountRate / 100) * (termDays / 360);
  const residualAmt = faceValue - advanceAmt - discountCost;

  const W = 580;
  const termX = Math.round((termDays / 120) * W * 0.8) + 60;
  const scaleY = (v: number) => 80 - (v / faceValue) * 65;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-emerald-400" /> Cash Flow Timeline
      </h3>
      <svg viewBox="0 0 620 160" className="w-full" style={{ height: 160 }}>
        {/* Timeline baseline */}
        <line x1={40} y1={100} x2={580} y2={100} stroke="#334155" strokeWidth={1.5} />
        {/* Day 0 arrow — advance */}
        <line x1={60} y1={100} x2={60} y2={scaleY(advanceAmt)} stroke="#10b981" strokeWidth={2} />
        <polygon points={`55,${scaleY(advanceAmt) - 2} 65,${scaleY(advanceAmt) - 2} 60,${scaleY(advanceAmt) - 8}`} fill="#10b981" />
        <text x={60} y={scaleY(advanceAmt) - 12} fontSize={9} fill="#10b981" textAnchor="middle" fontWeight="700">
          +${advanceAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </text>
        <text x={60} y={115} fontSize={8} fill="#94a3b8" textAnchor="middle">Day 0</text>
        <text x={60} y={125} fontSize={8} fill="#94a3b8" textAnchor="middle">Advance</text>
        {/* Discount cost arrow */}
        <line x1={160} y1={100} x2={160} y2={100 + 30} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" />
        <polygon points={`155,${130 + 2} 165,${130 + 2} 160,${130 + 8}`} fill="#f59e0b" />
        <text x={160} y={150} fontSize={8} fill="#f59e0b" textAnchor="middle">Fee: ${discountCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</text>
        {/* Maturity arrow */}
        <line x1={termX} y1={100} x2={termX} y2={scaleY(residualAmt)} stroke="#3b82f6" strokeWidth={2} />
        <polygon points={`${termX - 5},${scaleY(residualAmt) - 2} ${termX + 5},${scaleY(residualAmt) - 2} ${termX},${scaleY(residualAmt) - 8}`} fill="#3b82f6" />
        <text x={termX} y={scaleY(residualAmt) - 12} fontSize={9} fill="#3b82f6" textAnchor="middle" fontWeight="700">
          +${residualAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </text>
        <text x={termX} y={115} fontSize={8} fill="#94a3b8" textAnchor="middle">Day {termDays}</text>
        <text x={termX} y={125} fontSize={8} fill="#94a3b8" textAnchor="middle">Residual</text>
        {/* Labels */}
        <text x={310} y={15} fontSize={9} fill="#64748b" textAnchor="middle">
          Face Value: ${faceValue.toLocaleString()}  |  Effective Cost: {((discountCost / faceValue) * 100).toFixed(2)}%
        </text>
        <text x={40} y={100} fontSize={10} fill="#475569" textAnchor="middle">$0</text>
      </svg>
    </div>
  );
}

function ReceivablesTab() {
  const [faceValue, setFaceValue] = useState(1000000);
  const [advanceRate, setAdvanceRate] = useState(85);
  const [discountRate, setDiscountRate] = useState(3.5);
  const [termDays, setTermDays] = useState(90);
  const [mode, setMode] = useState<"factoring" | "discounting">("factoring");

  const advanceAmt = faceValue * (advanceRate / 100);
  const discountCost = faceValue * (discountRate / 100) * (termDays / 360);
  const residualAmt = faceValue - advanceAmt - discountCost;
  const effectiveRate = ((discountCost / advanceAmt) * (360 / termDays) * 100).toFixed(2);

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<DollarSign className="w-4 h-4" />}
        title="Receivables Financing"
        sub="Unlock working capital from outstanding invoices through factoring or invoice discounting"
      />

      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["factoring", "discounting"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
              mode === m
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {m === "factoring" ? "Factoring" : "Invoice Discounting"}
          </button>
        ))}
      </div>

      {/* Mode description */}
      <InfoCard className="bg-primary/5 border-primary/20">
        {mode === "factoring" ? (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Factoring</p>
            <p className="text-xs text-muted-foreground">
              The factor purchases receivables outright and takes ownership. Includes credit management and collection services. Debtor is notified (disclosed). Risk is transferred to the factor (non-recourse) or retained by the seller (recourse).
            </p>
            <div className="flex gap-4 mt-2">
              <span className="text-xs text-emerald-400">✓ Credit protection available</span>
              <span className="text-xs text-emerald-400">✓ Outsourced collections</span>
              <span className="text-xs text-amber-400">⚠ Debtor notified</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Invoice Discounting</p>
            <p className="text-xs text-muted-foreground">
              The lender advances funds against receivables while the seller retains ownership and manages collections. Typically confidential — debtor is not notified. Seller bears credit risk. Lower cost but higher operational burden.
            </p>
            <div className="flex gap-4 mt-2">
              <span className="text-xs text-emerald-400">✓ Confidential / undisclosed</span>
              <span className="text-xs text-emerald-400">✓ Lower cost</span>
              <span className="text-xs text-amber-400">⚠ Seller retains credit risk</span>
            </div>
          </div>
        )}
      </InfoCard>

      {/* Calculator */}
      <InfoCard>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" /> Calculator
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Invoice Face Value: ${(faceValue / 1000).toFixed(0)}K
            </label>
            <input
              type="range"
              min={100000}
              max={10000000}
              step={100000}
              value={faceValue}
              onChange={(e) => setFaceValue(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Advance Rate: {advanceRate}%
            </label>
            <input
              type="range"
              min={60}
              max={95}
              step={1}
              value={advanceRate}
              onChange={(e) => setAdvanceRate(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Discount Rate (p.a.): {discountRate.toFixed(1)}%
            </label>
            <input
              type="range"
              min={1.0}
              max={8.0}
              step={0.1}
              value={discountRate}
              onChange={(e) => setDiscountRate(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Invoice Term: {termDays} days
            </label>
            <input
              type="range"
              min={30}
              max={120}
              step={5}
              value={termDays}
              onChange={(e) => setTermDays(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: "Advance Amount", value: `$${(advanceAmt / 1000).toFixed(0)}K`, color: "text-emerald-400" },
            { label: "Discount Fee", value: `$${(discountCost / 1000).toFixed(1)}K`, color: "text-amber-400" },
            { label: "Residual Payment", value: `$${(residualAmt / 1000).toFixed(1)}K`, color: "text-blue-400" },
            { label: "Effective Rate (p.a.)", value: `${effectiveRate}%`, color: "text-rose-400" },
          ].map((m, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-3 text-center">
              <p className={cn("text-base font-bold", m.color)}>{m.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </InfoCard>

      <CashFlowTimeline
        advanceRate={advanceRate}
        discountRate={discountRate}
        faceValue={faceValue}
        termDays={termDays}
      />
    </div>
  );
}

// ── Tab 3: Commodity Finance ──────────────────────────────────────────────────

function BorrowingBaseDiagram({ ltv }: { ltv: number }) {
  const inventoryValue = 100;
  const eligibleValue = 90;
  const borrowingBase = eligibleValue * (ltv / 100);

  return (
    <svg viewBox="0 0 400 140" className="w-full" style={{ height: 140 }}>
      {/* Inventory value bar */}
      <rect x={20} y={20} width={360} height={28} rx={4} fill="#1e293b" />
      <rect x={20} y={20} width={360} height={28} rx={4} fill="#3b82f6" opacity={0.15} />
      <text x={200} y={38} fontSize={10} fill="#94a3b8" textAnchor="middle">Gross Inventory Value: $10M</text>

      {/* Eligible */}
      <rect x={20} y={60} width={eligibleValue * 3.6} height={24} rx={4} fill="#8b5cf6" opacity={0.25} />
      <rect x={20} y={60} width={eligibleValue * 3.6} height={24} rx={4} fill="none" stroke="#8b5cf6" strokeWidth={1} />
      <text x={20 + (eligibleValue * 3.6) / 2} y={76} fontSize={9} fill="#a78bfa" textAnchor="middle">Eligible: $9M (90%)</text>

      {/* Borrowing base */}
      <rect x={20} y={96} width={borrowingBase * 3.6} height={24} rx={4} fill="#10b981" opacity={0.25} />
      <rect x={20} y={96} width={borrowingBase * 3.6} height={24} rx={4} fill="none" stroke="#10b981" strokeWidth={1.5} />
      <text x={20 + (borrowingBase * 3.6) / 2} y={112} fontSize={9} fill="#34d399" textAnchor="middle" fontWeight="700">
        Borrowing Base: ${(borrowingBase * 0.1).toFixed(1)}M (LTV {ltv}%)
      </text>

      {/* Labels on right */}
      <text x={385} y={38} fontSize={9} fill="#64748b" textAnchor="end">Total</text>
      <text x={385} y={76} fontSize={9} fill="#64748b" textAnchor="end">Eligible</text>
      <text x={385} y={112} fontSize={9} fill="#64748b" textAnchor="end">Borrowing Base</text>
    </svg>
  );
}

function CommodityTab() {
  const [selectedLTV, setSelectedLTV] = useState(70);

  const liqColor = (l: "High" | "Medium" | "Low") => {
    if (l === "High") return "text-emerald-400";
    if (l === "Medium") return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<Package className="w-4 h-4" />}
        title="Commodity Finance"
        sub="Asset-backed financing structures against physical commodity inventory and future production"
      />

      {/* Structure cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            title: "Inventory Finance",
            desc: "Short-term lending secured against physical commodity stocks held in approved warehouses. Borrowing base updated weekly.",
            icon: <Package className="w-4 h-4" />,
          },
          {
            title: "Pre-Export Finance",
            desc: "Financing extended before shipment, secured against future export receivables and offtake agreements with investment-grade buyers.",
            icon: <Truck className="w-4 h-4" />,
          },
          {
            title: "Warehouse Receipts",
            desc: "Negotiable documents representing ownership of goods stored in licensed warehouses. Used as collateral for bank lending.",
            icon: <FileText className="w-4 h-4" />,
          },
          {
            title: "Tolling / Processing",
            desc: "Financing raw materials through the processing cycle. Lender holds security over both feedstock and finished product.",
            icon: <RefreshCw className="w-4 h-4" />,
          },
        ].map((c, i) => (
          <InfoCard key={i} className="flex gap-3 items-start">
            <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0 mt-0.5">{c.icon}</div>
            <div>
              <p className="text-sm font-semibold text-foreground">{c.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
            </div>
          </InfoCard>
        ))}
      </div>

      {/* Borrowing Base Interactive */}
      <InfoCard>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" /> Borrowing Base Calculator
        </h3>
        <div className="mb-3">
          <label className="text-xs text-muted-foreground block mb-1">LTV Advance Rate: {selectedLTV}%</label>
          <input
            type="range"
            min={50}
            max={85}
            step={1}
            value={selectedLTV}
            onChange={(e) => setSelectedLTV(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <BorrowingBaseDiagram ltv={selectedLTV} />
      </InfoCard>

      {/* Commodity Collateral Table */}
      <InfoCard>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" /> Commodity Collateral Parameters
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-2 text-muted-foreground font-medium">Commodity</th>
                <th className="text-right pb-2 text-muted-foreground font-medium">Advance Rate</th>
                <th className="text-right pb-2 text-muted-foreground font-medium">Haircut</th>
                <th className="text-right pb-2 text-muted-foreground font-medium">Max LTV</th>
                <th className="text-right pb-2 text-muted-foreground font-medium">Liquidity</th>
                <th className="text-right pb-2 text-muted-foreground font-medium">Price Vol</th>
              </tr>
            </thead>
            <tbody>
              {COMMODITY_ROWS.map((r, i) => (
                <tr key={i} className="border-b border-border/40 last:border-0">
                  <td className="py-2 text-foreground font-medium">{r.commodity}</td>
                  <td className="py-2 text-right text-primary">{r.advanceRate}%</td>
                  <td className="py-2 text-right text-amber-400">{r.haircut}%</td>
                  <td className="py-2 text-right text-emerald-400">{r.ltvMax}%</td>
                  <td className={cn("py-2 text-right font-medium", liqColor(r.liquidity))}>{r.liquidity}</td>
                  <td className="py-2 text-right text-muted-foreground">{r.priceVolatility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoCard>
    </div>
  );
}

// ── Tab 4: Working Capital Metrics ────────────────────────────────────────────

function CCCDiagram({ dio, dso, dpo }: { dio: number; dso: number; dpo: number }) {
  const ccc = dio + dso - dpo;
  const totalSpan = Math.max(dio + dso + 20, dpo + 30);
  const W = 560;
  const scale = W / totalSpan;
  const dioW = dio * scale;
  const dsoW = dso * scale;
  const dpoW = dpo * scale;

  const cccStart = dpoW;
  const cccEnd = dioW + dsoW;
  const cccW = cccEnd - cccStart;

  return (
    <svg viewBox="0 0 600 160" className="w-full" style={{ height: 160 }}>
      {/* DIO bar */}
      <rect x={20} y={25} width={dioW} height={22} rx={3} fill="#8b5cf6" opacity={0.6} />
      <text x={20 + dioW / 2} y={40} fontSize={9} fill="white" textAnchor="middle" fontWeight="600">DIO: {dio}d</text>

      {/* DSO bar (after DIO) */}
      <rect x={20 + dioW} y={25} width={dsoW} height={22} rx={3} fill="#3b82f6" opacity={0.6} />
      <text x={20 + dioW + dsoW / 2} y={40} fontSize={9} fill="white" textAnchor="middle" fontWeight="600">DSO: {dso}d</text>

      {/* DPO bar */}
      <rect x={20} y={60} width={dpoW} height={22} rx={3} fill="#10b981" opacity={0.6} />
      <text x={20 + dpoW / 2} y={75} fontSize={9} fill="white" textAnchor="middle" fontWeight="600">DPO: {dpo}d</text>

      {/* CCC bracket */}
      {cccW > 0 ? (
        <>
          <rect x={20 + cccStart} y={95} width={cccW} height={18} rx={3} fill={ccc > 0 ? "#f59e0b" : "#10b981"} opacity={0.3} />
          <rect x={20 + cccStart} y={95} width={cccW} height={18} rx={3} fill="none" stroke={ccc > 0 ? "#f59e0b" : "#10b981"} strokeWidth={1.5} />
          <text x={20 + cccStart + cccW / 2} y={108} fontSize={9} fill={ccc > 0 ? "#fbbf24" : "#34d399"} textAnchor="middle" fontWeight="700">
            CCC: {ccc}d {ccc < 0 ? "(funded by suppliers)" : ""}
          </text>
        </>
      ) : (
        <text x={20} y={108} fontSize={9} fill="#34d399" fontWeight="700">
          CCC: {ccc}d (suppliers fund operations)
        </text>
      )}

      {/* Axis */}
      <line x1={20} y1={130} x2={580} y2={130} stroke="#334155" strokeWidth={1} />
      <text x={20} y={145} fontSize={8} fill="#64748b">Day 0 (Purchase)</text>
      <text x={20 + dioW} y={145} fontSize={8} fill="#64748b" textAnchor="middle">Day {dio}</text>
      <text x={20 + dioW + dsoW} y={145} fontSize={8} fill="#64748b" textAnchor="end">Day {dio + dso}</text>
    </svg>
  );
}

function WorkingCapitalTab() {
  const [dio, setDio] = useState(45);
  const [dso, setDso] = useState(35);
  const [dpo, setDpo] = useState(30);

  const ccc = dio + dso - dpo;
  const [selectedIndustry, setSelectedIndustry] = useState<number | null>(null);

  const applyBenchmark = (bm: IndustryBenchmark) => {
    setDio(bm.dio);
    setDso(bm.dso);
    setDpo(bm.dpo);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<BarChart3 className="w-4 h-4" />}
        title="Working Capital Metrics"
        sub="Measure and optimize the cash conversion cycle — how fast cash flows through your business"
      />

      {/* Metric definitions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { abbrev: "DIO", name: "Days Inventory Outstanding", color: "#8b5cf6", desc: "Average days inventory is held before sale. Lower = faster stock turnover." },
          { abbrev: "DSO", name: "Days Sales Outstanding", color: "#3b82f6", desc: "Average days to collect payment after sale. Lower = faster collections." },
          { abbrev: "DPO", name: "Days Payable Outstanding", color: "#10b981", desc: "Average days to pay suppliers. Higher = better use of supplier financing." },
          { abbrev: "CCC", name: "Cash Conversion Cycle", color: "#f59e0b", desc: "DIO + DSO − DPO. Negative CCC = suppliers finance operations (ideal)." },
        ].map((m, i) => (
          <InfoCard key={i} className="flex gap-3 items-start">
            <span className="text-xs font-bold px-2 py-1 rounded font-mono" style={{ background: m.color + "22", color: m.color }}>
              {m.abbrev}
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">{m.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
            </div>
          </InfoCard>
        ))}
      </div>

      {/* Interactive calculator */}
      <InfoCard>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" /> Interactive Calculator
        </h3>
        <div className="space-y-3">
          {[
            { label: "DIO (Days Inventory Outstanding)", value: dio, setter: setDio, min: 5, max: 180, color: "#8b5cf6" },
            { label: "DSO (Days Sales Outstanding)", value: dso, setter: setDso, min: 5, max: 120, color: "#3b82f6" },
            { label: "DPO (Days Payable Outstanding)", value: dpo, setter: setDpo, min: 5, max: 120, color: "#10b981" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-52 flex-shrink-0">{s.label}</span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={1}
                value={s.value}
                onChange={(e) => s.setter(Number(e.target.value))}
                className="flex-1 accent-primary"
                style={{ accentColor: s.color }}
              />
              <span className="text-sm font-mono font-bold w-12 text-right" style={{ color: s.color }}>
                {s.value}d
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg border border-border bg-muted/20 text-center">
          <span className="text-2xl font-bold" style={{ color: ccc < 0 ? "#10b981" : ccc < 30 ? "#f59e0b" : "#f87171" }}>
            CCC = {ccc} days
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            {ccc < 0
              ? "Excellent: Suppliers are financing your operations."
              : ccc < 30
              ? "Good: Tight working capital cycle."
              : ccc < 60
              ? "Average: Room for improvement."
              : "High: Consider supply chain finance or factoring."}
          </p>
        </div>
      </InfoCard>

      {/* SVG Diagram */}
      <InfoCard>
        <h3 className="text-sm font-semibold text-foreground mb-3">Cash Conversion Cycle Diagram</h3>
        <CCCDiagram dio={dio} dso={dso} dpo={dpo} />
      </InfoCard>

      {/* Industry benchmarks */}
      <InfoCard>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> Industry Benchmarks
          <span className="text-xs text-muted-foreground ml-1">(click to apply)</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-2 text-muted-foreground font-medium">Industry</th>
                <th className="text-right pb-2" style={{ color: "#8b5cf6" }}>DIO</th>
                <th className="text-right pb-2" style={{ color: "#3b82f6" }}>DSO</th>
                <th className="text-right pb-2" style={{ color: "#10b981" }}>DPO</th>
                <th className="text-right pb-2" style={{ color: "#f59e0b" }}>CCC</th>
              </tr>
            </thead>
            <tbody>
              {INDUSTRY_BENCHMARKS.map((bm, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-border/40 last:border-0 cursor-pointer transition-colors",
                    selectedIndustry === i ? "bg-primary/10" : "hover:bg-muted/30"
                  )}
                  onClick={() => { setSelectedIndustry(i); applyBenchmark(bm); }}
                >
                  <td className="py-2 text-foreground">{bm.industry}</td>
                  <td className="py-2 text-right" style={{ color: "#8b5cf6" }}>{bm.dio}d</td>
                  <td className="py-2 text-right" style={{ color: "#3b82f6" }}>{bm.dso}d</td>
                  <td className="py-2 text-right" style={{ color: "#10b981" }}>{bm.dpo}d</td>
                  <td className="py-2 text-right font-bold" style={{ color: bm.ccc < 20 ? "#10b981" : bm.ccc < 50 ? "#f59e0b" : "#f87171" }}>
                    {bm.ccc}d
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoCard>
    </div>
  );
}

// ── Tab 5: Fintech Disruption ─────────────────────────────────────────────────

function VolumeBarsChart() {
  resetSeed();
  const maxVol = Math.max(...FINTECH_PLATFORMS.map((p) => p.volumeB));
  const W = 560;
  const BAR_H = 20;
  const GAP = 8;

  return (
    <svg viewBox={`0 0 600 ${FINTECH_PLATFORMS.length * (BAR_H + GAP) + 30}`} className="w-full">
      {FINTECH_PLATFORMS.map((p, i) => {
        const barW = (p.volumeB / maxVol) * W;
        const y = i * (BAR_H + GAP) + 15;
        const hue = 210 + i * 18;
        const color = `hsl(${hue}, 70%, 55%)`;
        return (
          <g key={i}>
            <rect x={0} y={y} width={barW} height={BAR_H} rx={3} fill={color} opacity={0.7} />
            <text x={barW + 6} y={y + BAR_H / 2 + 4} fontSize={9} fill="#94a3b8">
              ${p.volumeB}B
            </text>
            <text x={barW - 6} y={y + BAR_H / 2 + 4} fontSize={9} fill="white" textAnchor="end" fontWeight="600">
              {p.name}
            </text>
          </g>
        );
      })}
      <text x={0} y={10} fontSize={8} fill="#64748b">Annual Volume Processed ($B)</text>
    </svg>
  );
}

function FintechTab() {
  const [view, setView] = useState<"table" | "chart">("table");

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<Zap className="w-4 h-4" />}
        title="Fintech Disruption in Trade Finance"
        sub="Platforms reshaping supply chain finance, e-invoicing, and blockchain-based trade settlement"
      />

      {/* Trend cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            title: "Dynamic Discounting",
            icon: <TrendingDown className="w-4 h-4" />,
            color: "text-emerald-400",
            desc: "Buyers offer early payment to suppliers at a sliding discount rate inversely proportional to days remaining. No bank intermediary required.",
          },
          {
            title: "E-Invoicing",
            icon: <FileText className="w-4 h-4" />,
            color: "text-blue-400",
            desc: "Structured digital invoices (Peppol, UBL) enable straight-through processing, automatic financing triggers, and real-time VAT reporting.",
          },
          {
            title: "Blockchain Trade Finance",
            icon: <Layers className="w-4 h-4" />,
            color: "text-purple-400",
            desc: "Distributed ledgers (R3 Corda, Hyperledger) digitize Bills of Lading, Letters of Credit, and warehouse receipts, reducing fraud and processing time.",
          },
          {
            title: "AI Underwriting",
            icon: <Zap className="w-4 h-4" />,
            color: "text-amber-400",
            desc: "Machine learning models assess supplier credit risk from ERP data, payment histories, and alternative data to enable instant financing decisions.",
          },
        ].map((c, i) => (
          <InfoCard key={i} className="flex gap-3 items-start">
            <div className={cn("p-2 rounded-lg bg-muted/50 flex-shrink-0 mt-0.5", c.color)}>{c.icon}</div>
            <div>
              <p className="text-sm font-semibold text-foreground">{c.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
            </div>
          </InfoCard>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        {(["table", "chart"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
              view === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {v === "table" ? "Platform Comparison" : "Volume Chart"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === "table" ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <InfoCard>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left pb-2 text-muted-foreground font-medium">Platform</th>
                      <th className="text-left pb-2 text-muted-foreground font-medium">Model</th>
                      <th className="text-right pb-2 text-muted-foreground font-medium">Volume ($B)</th>
                      <th className="text-right pb-2 text-muted-foreground font-medium">Buyers</th>
                      <th className="text-right pb-2 text-muted-foreground font-medium">Founded</th>
                      <th className="text-right pb-2 text-muted-foreground font-medium">Blockchain</th>
                      <th className="text-right pb-2 text-muted-foreground font-medium">E-Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FINTECH_PLATFORMS.map((p, i) => (
                      <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="py-2 text-foreground font-semibold">{p.name}</td>
                        <td className="py-2 text-muted-foreground">{p.model}</td>
                        <td className="py-2 text-right text-primary font-mono">${p.volumeB}B</td>
                        <td className="py-2 text-right text-foreground">{p.buyers.toLocaleString()}</td>
                        <td className="py-2 text-right text-muted-foreground">{p.founded}</td>
                        <td className="py-2 text-right">
                          <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", p.blockchain ? "bg-purple-500/20 text-purple-400" : "bg-muted text-muted-foreground")}>
                            {p.blockchain ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", p.eInvoicing ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground")}>
                            {p.eInvoicing ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </InfoCard>
          </motion.div>
        ) : (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <InfoCard>
              <h3 className="text-sm font-semibold text-foreground mb-3">Platform Volume Comparison ($B processed annually)</h3>
              <VolumeBarsChart />
            </InfoCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Market size callout */}
      <InfoCard className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Global Trade Finance Market</p>
            <p className="text-xs text-muted-foreground mt-1">
              The global trade finance market is estimated at <span className="text-primary font-semibold">$10–12 trillion</span> annually.
              An estimated <span className="text-amber-400 font-semibold">$1.7 trillion trade finance gap</span> exists globally (ADB, 2023),
              primarily affecting SMEs in emerging markets. Fintech platforms are estimated to address less than 5% of this gap today,
              representing a significant growth runway for digital supply chain finance solutions.
            </p>
            <div className="flex gap-4 mt-3">
              {[
                { label: "Global Trade Vol.", value: "$32T/yr" },
                { label: "Finance Gap", value: "$1.7T" },
                { label: "Digitization Rate", value: "~15%" },
                { label: "CAGR (SCF tech)", value: "~12%" },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <p className="text-sm font-bold text-primary">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InfoCard>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TradefinancePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Trade Finance &amp; Supply Chain Capital Markets</h1>
            <p className="text-sm text-muted-foreground">
              Instruments, metrics, and fintech innovation powering global trade flows
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: "Global Trade Vol.", value: "$32T/yr", icon: <Globe className="w-3.5 h-3.5" />, color: "text-blue-400" },
            { label: "Finance Gap", value: "$1.7T", icon: <TrendingDown className="w-3.5 h-3.5" />, color: "text-rose-400" },
            { label: "Avg LC Cost", value: "75 bps", icon: <Shield className="w-3.5 h-3.5" />, color: "text-emerald-400" },
            { label: "SCF Market CAGR", value: "~12%", icon: <TrendingUp className="w-3.5 h-3.5" />, color: "text-amber-400" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3 flex items-center gap-2">
              <span className={cn("flex-shrink-0", s.color)}>{s.icon}</span>
              <div>
                <p className={cn("text-base font-bold leading-none", s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="instruments">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="instruments" className="text-xs">Trade Finance Instruments</TabsTrigger>
          <TabsTrigger value="receivables" className="text-xs">Receivables Financing</TabsTrigger>
          <TabsTrigger value="commodity" className="text-xs">Commodity Finance</TabsTrigger>
          <TabsTrigger value="workingcapital" className="text-xs">Working Capital Metrics</TabsTrigger>
          <TabsTrigger value="fintech" className="text-xs">Fintech Disruption</TabsTrigger>
        </TabsList>

        <TabsContent value="instruments" className="data-[state=inactive]:hidden">
          <InstrumentsTab />
        </TabsContent>
        <TabsContent value="receivables" className="data-[state=inactive]:hidden">
          <ReceivablesTab />
        </TabsContent>
        <TabsContent value="commodity" className="data-[state=inactive]:hidden">
          <CommodityTab />
        </TabsContent>
        <TabsContent value="workingcapital" className="data-[state=inactive]:hidden">
          <WorkingCapitalTab />
        </TabsContent>
        <TabsContent value="fintech" className="data-[state=inactive]:hidden">
          <FintechTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
