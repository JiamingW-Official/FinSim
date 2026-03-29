"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  Layers,
  Target,
  Shield,
  Zap,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Pill,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 151;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

type DrugStage = "Discovery" | "Phase I" | "Phase II" | "Phase III" | "NDA/BLA" | "Approved";
type Subsector = "Large Pharma" | "Biotech" | "CRO" | "Generic" | "Specialty Pharma";
type Designation = "Fast Track" | "Breakthrough" | "Accelerated" | "Priority Review" | "None";

interface PipelineDrug {
  name: string;
  stage: DrugStage;
  indication: string;
  nextReadout: string;
  poA: number; // probability of approval from current stage
  designation: Designation;
}

interface Company {
  ticker: string;
  name: string;
  marketCap: number; // $B
  cash: number; // $M
  quarterlyBurn: number; // $M/quarter
  subsector: Subsector;
  pipeline: PipelineDrug[];
}

interface BinaryEvent {
  date: string;
  ticker: string;
  eventType: "PDUFA" | "Phase III Readout" | "Phase II Readout" | "Conference" | "FDA Advisory";
  drug: string;
  impliedMove: number; // %
}

interface PatentCliff {
  drug: string;
  company: string;
  peakRevenue: number; // $B/yr
  expiryYear: number;
  revenueAtRisk: number; // $B total
}

// ── Static Data ───────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<DrugStage, string> = {
  Discovery: "#6b7280",
  "Phase I": "#3b82f6",
  "Phase II": "#a855f7",
  "Phase III": "#f59e0b",
  "NDA/BLA": "#10b981",
  Approved: "#22c55e",
};

const STAGE_POA: Record<DrugStage, number> = {
  Discovery: 0.05,
  "Phase I": 0.10,
  "Phase II": 0.22,
  "Phase III": 0.58,
  "NDA/BLA": 0.85,
  Approved: 1.0,
};

const STAGE_ORDER: DrugStage[] = ["Discovery", "Phase I", "Phase II", "Phase III", "NDA/BLA", "Approved"];

const COMPANIES: Company[] = [
  {
    ticker: "MRNA",
    name: "Moderna",
    marketCap: 14.2,
    cash: 6800,
    quarterlyBurn: 850,
    subsector: "Biotech",
    pipeline: [
      { name: "mRNA-1283", stage: "NDA/BLA", indication: "COVID-19", nextReadout: "Q2 2026", poA: 0.85, designation: "Breakthrough" },
      { name: "mRNA-1345", stage: "Phase III", indication: "RSV", nextReadout: "Q3 2026", poA: 0.58, designation: "Breakthrough" },
      { name: "mRNA-4157", stage: "Phase III", indication: "Melanoma (personalized)", nextReadout: "Q4 2026", poA: 0.52, designation: "Breakthrough" },
    ],
  },
  {
    ticker: "BIIB",
    name: "Biogen",
    marketCap: 22.1,
    cash: 5200,
    quarterlyBurn: 520,
    subsector: "Biotech",
    pipeline: [
      { name: "Lecanemab", stage: "Approved", indication: "Alzheimer's", nextReadout: "Launched", poA: 1.0, designation: "Accelerated" },
      { name: "Zuranolone", stage: "Approved", indication: "MDD/PPD", nextReadout: "Launched", poA: 1.0, designation: "Breakthrough" },
      { name: "BIIB080", stage: "Phase II", indication: "Alzheimer's (tau)", nextReadout: "Q1 2027", poA: 0.22, designation: "Fast Track" },
    ],
  },
  {
    ticker: "REGN",
    name: "Regeneron",
    marketCap: 78.4,
    cash: 11000,
    quarterlyBurn: 480,
    subsector: "Biotech",
    pipeline: [
      { name: "Dupixent", stage: "Approved", indication: "Atopic Dermatitis", nextReadout: "Launched", poA: 1.0, designation: "None" },
      { name: "Itepekimab", stage: "Phase III", indication: "COPD", nextReadout: "Q2 2026", poA: 0.60, designation: "Fast Track" },
      { name: "Linvoseltamab", stage: "Phase III", indication: "Multiple Myeloma", nextReadout: "Q3 2026", poA: 0.55, designation: "Breakthrough" },
    ],
  },
  {
    ticker: "VRTX",
    name: "Vertex Pharma",
    marketCap: 112.6,
    cash: 13200,
    quarterlyBurn: 310,
    subsector: "Biotech",
    pipeline: [
      { name: "Casgevy", stage: "Approved", indication: "Sickle Cell / Beta-Thal", nextReadout: "Launched", poA: 1.0, designation: "Breakthrough" },
      { name: "Inaxaplin", stage: "Phase III", indication: "APOL1 Kidney Disease", nextReadout: "Q4 2026", poA: 0.62, designation: "Breakthrough" },
      { name: "VX-548", stage: "NDA/BLA", indication: "Acute Pain (non-opioid)", nextReadout: "Q2 2026", poA: 0.88, designation: "None" },
    ],
  },
  {
    ticker: "RARE",
    name: "Ultragenyx",
    marketCap: 3.8,
    cash: 820,
    quarterlyBurn: 145,
    subsector: "Biotech",
    pipeline: [
      { name: "GTX-102", stage: "Phase III", indication: "Angelman Syndrome", nextReadout: "Q2 2026", poA: 0.50, designation: "Breakthrough" },
      { name: "UX143", stage: "Phase II", indication: "OI (Rare Bone)", nextReadout: "Q3 2026", poA: 0.25, designation: "Fast Track" },
    ],
  },
  {
    ticker: "ALNY",
    name: "Alnylam Pharma",
    marketCap: 32.1,
    cash: 3900,
    quarterlyBurn: 420,
    subsector: "Biotech",
    pipeline: [
      { name: "Vutrisiran", stage: "Approved", indication: "ATTR Amyloidosis", nextReadout: "Launched", poA: 1.0, designation: "None" },
      { name: "ALN-AGT", stage: "Phase III", indication: "Hypertension", nextReadout: "Q1 2027", poA: 0.58, designation: "None" },
      { name: "Zilebesiran", stage: "Phase III", indication: "Hypertension", nextReadout: "Q3 2026", poA: 0.60, designation: "Fast Track" },
    ],
  },
  {
    ticker: "RXRX",
    name: "Recursion Pharma",
    marketCap: 1.4,
    cash: 510,
    quarterlyBurn: 88,
    subsector: "Biotech",
    pipeline: [
      { name: "REC-994", stage: "Phase II", indication: "Cerebral Cavernous Malform.", nextReadout: "Q4 2026", poA: 0.18, designation: "None" },
      { name: "REC-2282", stage: "Phase I", indication: "NF2-related tumors", nextReadout: "Q2 2027", poA: 0.10, designation: "Fast Track" },
    ],
  },
  {
    ticker: "BEAM",
    name: "Beam Therapeutics",
    marketCap: 1.1,
    cash: 1010,
    quarterlyBurn: 102,
    subsector: "Biotech",
    pipeline: [
      { name: "BEAM-101", stage: "Phase I", indication: "Sickle Cell (base editing)", nextReadout: "Q3 2026", poA: 0.12, designation: "Fast Track" },
      { name: "BEAM-302", stage: "Phase I", indication: "Alpha-1 Antitrypsin Defic.", nextReadout: "Q1 2027", poA: 0.10, designation: "None" },
    ],
  },
  {
    ticker: "PTCT",
    name: "PTC Therapeutics",
    marketCap: 1.9,
    cash: 680,
    quarterlyBurn: 130,
    subsector: "Biotech",
    pipeline: [
      { name: "Translarna", stage: "Approved", indication: "Duchenne MD (EU)", nextReadout: "Launched", poA: 1.0, designation: "None" },
      { name: "Vatiquinone", stage: "Phase III", indication: "Friedreich Ataxia", nextReadout: "Q2 2026", poA: 0.48, designation: "Fast Track" },
    ],
  },
  {
    ticker: "ARQT",
    name: "Arcutis Biotherapeutics",
    marketCap: 0.9,
    cash: 310,
    quarterlyBurn: 72,
    subsector: "Specialty Pharma",
    pipeline: [
      { name: "Zoryve", stage: "Approved", indication: "Plaque Psoriasis", nextReadout: "Launched", poA: 1.0, designation: "None" },
      { name: "ARQ-234", stage: "Phase II", indication: "Seborrheic Dermatitis", nextReadout: "Q4 2026", poA: 0.22, designation: "None" },
    ],
  },
  {
    ticker: "HALO",
    name: "Halozyme Therapeutics",
    marketCap: 6.2,
    cash: 980,
    quarterlyBurn: 55,
    subsector: "Specialty Pharma",
    pipeline: [
      { name: "ENHANZE (platform)", stage: "Approved", indication: "Drug Delivery Tech", nextReadout: "Launched", poA: 1.0, designation: "None" },
      { name: "PEGPH20", stage: "Phase II", indication: "Pancreatic Cancer", nextReadout: "Q3 2026", poA: 0.15, designation: "None" },
    ],
  },
  {
    ticker: "IQVIA",
    name: "IQVIA Holdings",
    marketCap: 38.5,
    cash: 2100,
    quarterlyBurn: 0,
    subsector: "CRO",
    pipeline: [
      { name: "Real World Data Platform", stage: "Approved", indication: "Analytics/CRO Services", nextReadout: "Ongoing", poA: 1.0, designation: "None" },
    ],
  },
  {
    ticker: "CRL",
    name: "Charles River Labs",
    marketCap: 8.4,
    cash: 450,
    quarterlyBurn: 0,
    subsector: "CRO",
    pipeline: [
      { name: "Early Discovery Services", stage: "Discovery", indication: "Pre-clinical CRO", nextReadout: "Ongoing", poA: 1.0, designation: "None" },
    ],
  },
  {
    ticker: "TEVA",
    name: "Teva Pharmaceutical",
    marketCap: 19.8,
    cash: 3800,
    quarterlyBurn: 0,
    subsector: "Generic",
    pipeline: [
      { name: "Uzedy", stage: "Approved", indication: "Schizophrenia", nextReadout: "Launched", poA: 1.0, designation: "None" },
      { name: "TEV-749", stage: "Phase III", indication: "Tardive Dyskinesia", nextReadout: "Q1 2027", poA: 0.55, designation: "None" },
    ],
  },
  {
    ticker: "JAZZ",
    name: "Jazz Pharmaceuticals",
    marketCap: 5.1,
    cash: 1500,
    quarterlyBurn: 0,
    subsector: "Specialty Pharma",
    pipeline: [
      { name: "Xywav", stage: "Approved", indication: "Narcolepsy", nextReadout: "Launched", poA: 1.0, designation: "None" },
      { name: "Zanidatamab", stage: "Phase III", indication: "HER2+ Biliary Tract Cancer", nextReadout: "Q2 2026", poA: 0.55, designation: "Breakthrough" },
    ],
  },
];

const BINARY_EVENTS: BinaryEvent[] = [
  { date: "2026-04-08", ticker: "VRTX", eventType: "PDUFA", drug: "VX-548", impliedMove: 22 },
  { date: "2026-04-15", ticker: "JAZZ", eventType: "Phase III Readout", drug: "Zanidatamab", impliedMove: 38 },
  { date: "2026-05-02", ticker: "RARE", eventType: "Phase III Readout", drug: "GTX-102", impliedMove: 55 },
  { date: "2026-05-15", ticker: "ASCO", eventType: "Conference", drug: "Multiple presentations", impliedMove: 12 },
  { date: "2026-05-22", ticker: "REGN", eventType: "Phase III Readout", drug: "Itepekimab", impliedMove: 18 },
  { date: "2026-06-10", ticker: "MRNA", eventType: "PDUFA", drug: "mRNA-1283", impliedMove: 28 },
  { date: "2026-07-01", ticker: "PTCT", eventType: "Phase III Readout", drug: "Vatiquinone", impliedMove: 48 },
  { date: "2026-07-18", ticker: "ALNY", eventType: "Phase III Readout", drug: "Zilebesiran", impliedMove: 25 },
  { date: "2026-08-05", ticker: "BEAM", eventType: "Phase II Readout", drug: "BEAM-101", impliedMove: 42 },
  { date: "2026-09-12", ticker: "ASH", eventType: "Conference", drug: "Hematology presentations", impliedMove: 10 },
  { date: "2026-10-01", ticker: "MRNA", eventType: "Phase III Readout", drug: "mRNA-4157", impliedMove: 32 },
  { date: "2026-10-20", ticker: "REGN", eventType: "Phase III Readout", drug: "Linvoseltamab", impliedMove: 22 },
];

const PATENT_CLIFFS: PatentCliff[] = [
  { drug: "Humira (adalimumab)", company: "AbbVie", peakRevenue: 21.2, expiryYear: 2023, revenueAtRisk: 18.5 },
  { drug: "Revlimid (lenalidomide)", company: "BMS", peakRevenue: 12.8, expiryYear: 2026, revenueAtRisk: 10.2 },
  { drug: "Keytruda (pembrolizumab)", company: "Merck", peakRevenue: 25.0, expiryYear: 2028, revenueAtRisk: 22.0 },
  { drug: "Opdivo (nivolumab)", company: "BMS", peakRevenue: 9.1, expiryYear: 2028, revenueAtRisk: 7.8 },
  { drug: "Eliquis (apixaban)", company: "BMS/Pfizer", peakRevenue: 13.1, expiryYear: 2026, revenueAtRisk: 11.4 },
  { drug: "Dupixent (dupilumab)", company: "Sanofi/Regeneron", peakRevenue: 14.0, expiryYear: 2031, revenueAtRisk: 12.5 },
  { drug: "Stelara (ustekinumab)", company: "J&J", peakRevenue: 10.8, expiryYear: 2025, revenueAtRisk: 9.2 },
  { drug: "Entresto (sacubitril)", company: "Novartis", peakRevenue: 7.5, expiryYear: 2026, revenueAtRisk: 6.5 },
  { drug: "Ozempic/Wegovy (semaglutide)", company: "Novo Nordisk", peakRevenue: 28.0, expiryYear: 2032, revenueAtRisk: 25.0 },
  { drug: "Ibrance (palbociclib)", company: "Pfizer", peakRevenue: 5.8, expiryYear: 2027, revenueAtRisk: 5.0 },
];

// ── Formatting ─────────────────────────────────────────────────────────────────

function fmtB(n: number, d = 1): string {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}T`;
  return `$${n.toFixed(d)}B`;
}
function fmtM(n: number): string { return `$${n.toFixed(0)}M`; }
function fmtPct(n: number, d = 0): string { return `${(n * 100).toFixed(d)}%`; }

// ── Tab 1: Pipeline Tracker ───────────────────────────────────────────────────

function PipelineTracker() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [sortBy, setSortBy] = useState<"runway" | "marketCap" | "ticker">("runway");

  const sorted = useMemo(() => {
    return [...COMPANIES].sort((a, b) => {
      if (sortBy === "runway") {
        const ra = a.quarterlyBurn > 0 ? (a.cash / a.quarterlyBurn) * 3 : 999;
        const rb = b.quarterlyBurn > 0 ? (b.cash / b.quarterlyBurn) * 3 : 999;
        return ra - rb;
      }
      if (sortBy === "marketCap") return b.marketCap - a.marketCap;
      return a.ticker.localeCompare(b.ticker);
    });
  }, [sortBy]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-zinc-400">Sort by:</span>
        {(["runway", "marketCap", "ticker"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-colors",
              sortBy === opt
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {opt === "runway" ? "Cash Runway" : opt === "marketCap" ? "Market Cap" : "Ticker"}
          </button>
        ))}
      </div>

      {/* Company Pipeline Cards */}
      <div className="space-y-3">
        {sorted.map((co) => {
          const runwayMonths = co.quarterlyBurn > 0
            ? Math.round((co.cash / co.quarterlyBurn) * 3)
            : null;
          const runwayColor = runwayMonths === null ? "text-zinc-400"
            : runwayMonths < 12 ? "text-rose-400"
            : runwayMonths < 24 ? "text-amber-400"
            : "text-emerald-400";
          const isSelected = selectedCompany?.ticker === co.ticker;

          return (
            <motion.div
              key={co.ticker}
              layout
              className={cn(
                "rounded-lg border transition-colors cursor-pointer",
                isSelected
                  ? "border-blue-500 bg-blue-950/20"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"
              )}
              onClick={() => setSelectedCompany(isSelected ? null : co)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white font-mono bg-zinc-800 px-2 py-0.5 rounded">
                      {co.ticker}
                    </span>
                    <span className="text-sm text-zinc-300">{co.name}</span>
                    <Badge
                      variant="outline"
                      className="text-xs border-zinc-700 text-zinc-400"
                    >
                      {co.subsector}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-zinc-400">
                      MCap: <span className="text-zinc-200">{fmtB(co.marketCap)}</span>
                    </span>
                    {runwayMonths !== null && (
                      <span className="text-zinc-400">
                        Runway: <span className={runwayColor}>{runwayMonths}mo</span>
                      </span>
                    )}
                    {isSelected ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Pipeline SVG bar chart */}
                <PipelineSVG pipeline={co.pipeline} />
              </div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-zinc-800 pt-4">
                      <div className="grid grid-cols-1 gap-2">
                        {co.pipeline.map((drug, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between bg-zinc-800/60 rounded p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: STAGE_COLORS[drug.stage] }}
                              />
                              <div>
                                <span className="text-sm font-medium text-white">{drug.name}</span>
                                <span className="text-xs text-zinc-400 ml-2">— {drug.indication}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              {drug.designation !== "None" && (
                                <Badge
                                  className="text-xs bg-amber-900/40 text-amber-300 border-amber-700"
                                  variant="outline"
                                >
                                  {drug.designation}
                                </Badge>
                              )}
                              <span className="text-zinc-400">
                                PoA: <span className="text-white font-medium">{fmtPct(drug.poA)}</span>
                              </span>
                              <span className="text-zinc-400">
                                Readout: <span className="text-blue-300">{drug.nextReadout}</span>
                              </span>
                              <span
                                className="font-medium px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: STAGE_COLORS[drug.stage] + "33",
                                  color: STAGE_COLORS[drug.stage],
                                }}
                              >
                                {drug.stage}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Cash burn analysis */}
                      {co.quarterlyBurn > 0 && (
                        <div className="mt-3 p-3 bg-zinc-900 rounded flex items-center gap-6 text-xs">
                          <div>
                            <span className="text-zinc-400">Cash: </span>
                            <span className="text-white font-medium">{fmtM(co.cash)}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Quarterly Burn: </span>
                            <span className="text-rose-400 font-medium">{fmtM(co.quarterlyBurn)}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Annual Burn Rate: </span>
                            <span className="text-rose-400 font-medium">{fmtM(co.quarterlyBurn * 4)}</span>
                          </div>
                          {runwayMonths !== null && (
                            <div>
                              <span className="text-zinc-400">Runway: </span>
                              <span className={cn("font-bold", runwayColor)}>{runwayMonths} months</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Binary Event Calendar */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          Binary Event Calendar
        </h3>
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800">
                <th className="text-left p-3 text-zinc-400 font-medium">Date</th>
                <th className="text-left p-3 text-zinc-400 font-medium">Ticker</th>
                <th className="text-left p-3 text-zinc-400 font-medium">Event</th>
                <th className="text-left p-3 text-zinc-400 font-medium">Drug/Notes</th>
                <th className="text-right p-3 text-zinc-400 font-medium">Implied Move</th>
              </tr>
            </thead>
            <tbody>
              {BINARY_EVENTS.map((ev, i) => {
                const eventColor =
                  ev.eventType === "PDUFA"
                    ? "text-emerald-400"
                    : ev.eventType === "Conference"
                    ? "text-blue-400"
                    : ev.eventType === "Phase III Readout"
                    ? "text-amber-400"
                    : "text-purple-400";
                return (
                  <tr
                    key={i}
                    className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="p-3 text-zinc-300 font-mono">{ev.date}</td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-white bg-zinc-800 px-1.5 py-0.5 rounded">
                        {ev.ticker}
                      </span>
                    </td>
                    <td className={cn("p-3 font-medium", eventColor)}>{ev.eventType}</td>
                    <td className="p-3 text-zinc-400">{ev.drug}</td>
                    <td className="p-3 text-right">
                      <span
                        className={cn(
                          "font-bold",
                          ev.impliedMove > 40
                            ? "text-rose-400"
                            : ev.impliedMove > 20
                            ? "text-amber-400"
                            : "text-zinc-300"
                        )}
                      >
                        ±{ev.impliedMove}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk matrix */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          Phase Approval Probability Matrix
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAGE_ORDER.map((stage) => (
            <div key={stage} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
              <div
                className="text-xl font-bold mb-1"
                style={{ color: STAGE_COLORS[stage] }}
              >
                {fmtPct(STAGE_POA[stage])}
              </div>
              <div className="text-xs text-zinc-400">{stage}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PipelineSVG({ pipeline }: { pipeline: PipelineDrug[] }) {
  const W = 600;
  const H = 28;
  const stageCount = STAGE_ORDER.length;
  const segW = W / stageCount;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 28 }}>
      {/* Track */}
      {STAGE_ORDER.map((stage, i) => (
        <rect
          key={stage}
          x={i * segW}
          y={H / 2 - 4}
          width={segW - 2}
          height={8}
          rx={2}
          fill="#27272a"
        />
      ))}
      {/* Drug markers */}
      {pipeline.map((drug, di) => {
        const stageIdx = STAGE_ORDER.indexOf(drug.stage);
        const cx = stageIdx * segW + segW / 2;
        const cy = H / 2;
        return (
          <g key={di}>
            <circle
              cx={cx}
              cy={cy}
              r={7}
              fill={STAGE_COLORS[drug.stage]}
              opacity={0.9}
            />
            <title>{drug.name} — {drug.stage}: {drug.indication}</title>
          </g>
        );
      })}
      {/* Stage labels */}
      {STAGE_ORDER.map((stage, i) => (
        <text
          key={stage}
          x={i * segW + segW / 2}
          y={H - 2}
          textAnchor="middle"
          fontSize={6}
          fill="#52525b"
        >
          {stage === "NDA/BLA" ? "NDA" : stage === "Discovery" ? "Disc." : stage}
        </text>
      ))}
    </svg>
  );
}

// ── Tab 2: Drug Development Economics ────────────────────────────────────────

function DrugEconomics() {
  const waterfall = [
    { label: "10,000\nCompounds", value: 10000, color: "#6b7280" },
    { label: "250 Enter\nPre-clinical", value: 250, color: "#3b82f6" },
    { label: "10 Enter\nPhase I", value: 10, color: "#a855f7" },
    { label: "5 Enter\nPhase II", value: 5, color: "#f59e0b" },
    { label: "2 Enter\nPhase III", value: 2, color: "#f97316" },
    { label: "1\nApproved", value: 1, color: "#22c55e" },
  ];

  const maxVal = waterfall[0].value;
  const W = 560;
  const H = 200;
  const barW = 70;
  const gap = (W - waterfall.length * barW) / (waterfall.length + 1);

  // NPV model parameters
  const [peakSales, setPeakSales] = useState(3000); // $M/yr
  const [marketShare, setMarketShare] = useState(15); // %
  const [launchYear, setLaunchYear] = useState(10);
  const [discountRate, setDiscountRate] = useState(10);
  const [poA, setPoA] = useState(58); // %

  const npv = useMemo(() => {
    const r = discountRate / 100;
    let pv = 0;
    // Drug lifecycle: ramp 3 years, peak 5 years, decline 2 years
    const cashFlows = [
      peakSales * 0.2,
      peakSales * 0.5,
      peakSales * 0.8,
      peakSales * 1.0,
      peakSales * 1.0,
      peakSales * 1.0,
      peakSales * 1.0,
      peakSales * 1.0,
      peakSales * 0.5,
      peakSales * 0.2,
    ];
    cashFlows.forEach((cf, t) => {
      pv += (cf * 0.3) / Math.pow(1 + r, launchYear + t); // 30% margin
    });
    return pv * (poA / 100);
  }, [peakSales, marketShare, launchYear, discountRate, poA]);

  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg. All-in Cost", value: "$2.6B", sub: "Including failures", color: "text-rose-400" },
          { label: "Development Timeline", value: "10–15 yrs", sub: "Discovery to launch", color: "text-amber-400" },
          { label: "Success Rate", value: "0.01%", sub: "Compound → Approval", color: "text-blue-400" },
          { label: "Phase III Success", value: "58%", sub: "FDA NDA approval", color: "text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
            <div className="text-xs font-medium text-zinc-300 mt-1">{stat.label}</div>
            <div className="text-xs text-zinc-500">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Success Probability Waterfall */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">
          Success Probability Waterfall: 10,000 Compounds → 1 Approved Drug
        </h3>
        <svg viewBox={`0 0 ${W} ${H + 60}`} className="w-full">
          {waterfall.map((bar, i) => {
            const x = gap + i * (barW + gap);
            const barHeight = Math.max(4, (bar.value / maxVal) * H * 0.7 + (i === waterfall.length - 1 ? 20 : 0));
            const y = H - barHeight + 10;
            const labelLines = bar.label.split("\n");
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barHeight}
                  rx={4}
                  fill={bar.color}
                  opacity={0.85}
                />
                <text
                  x={x + barW / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight="bold"
                  fill={bar.color}
                >
                  {bar.value.toLocaleString()}
                </text>
                {labelLines.map((line, li) => (
                  <text
                    key={li}
                    x={x + barW / 2}
                    y={H + 22 + li * 12}
                    textAnchor="middle"
                    fontSize={8}
                    fill="#a1a1aa"
                  >
                    {line}
                  </text>
                ))}
                {i < waterfall.length - 1 && (
                  <line
                    x1={x + barW + 2}
                    y1={H / 2 + 10}
                    x2={x + barW + gap - 2}
                    y2={H / 2 + 10}
                    stroke="#3f3f46"
                    strokeWidth={1}
                    strokeDasharray="3,2"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Development Timeline */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Drug Development Timeline</h3>
        <TimelineSVG />
      </div>

      {/* NPV Calculator */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Risk-Adjusted NPV Calculator
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
          {[
            { label: "Peak Sales ($M/yr)", value: peakSales, min: 500, max: 15000, step: 100, setter: setPeakSales },
            { label: "Market Share (%)", value: marketShare, min: 1, max: 60, step: 1, setter: setMarketShare },
            { label: "Years to Launch", value: launchYear, min: 5, max: 15, step: 1, setter: setLaunchYear },
            { label: "Discount Rate (%)", value: discountRate, min: 5, max: 20, step: 1, setter: setDiscountRate },
            { label: "Prob. of Approval (%)", value: poA, min: 5, max: 95, step: 1, setter: setPoA },
          ].map((param) => (
            <div key={param.label}>
              <label className="text-xs text-zinc-400 mb-1 block">{param.label}</label>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={param.value}
                onChange={(e) => param.setter(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="text-xs text-white font-medium mt-0.5">
                {param.label.includes("$") ? fmtM(param.value) : `${param.value}${param.label.includes("%") ? "%" : ""}`}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-zinc-800/60 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Risk-Adjusted NPV (rNPV)</div>
            <div className="text-2xl font-bold text-emerald-400">{fmtM(Math.round(npv))}</div>
          </div>
          <div className="text-xs text-zinc-500 max-w-xs">
            Based on {poA}% PoA × 10-year discounted cash flows at {discountRate}% discount rate.
            Peak sales of {fmtM(peakSales)}/yr at 30% net margin.
          </div>
        </div>
      </div>

      {/* Patent Cliff */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Top Patent Cliffs (2023–2032)
        </h3>
        <PatentCliffSVG />
      </div>
    </div>
  );
}

function TimelineSVG() {
  const W = 600;
  const H = 80;
  const phases = [
    { label: "Discovery", years: "0–4 yrs", color: "#6b7280", w: 0.20 },
    { label: "Pre-clinical", years: "2–3 yrs", color: "#3b82f6", w: 0.15 },
    { label: "Phase I", years: "1–2 yrs", color: "#a855f7", w: 0.13 },
    { label: "Phase II", years: "2–3 yrs", color: "#f59e0b", w: 0.17 },
    { label: "Phase III", years: "3–4 yrs", color: "#f97316", w: 0.20 },
    { label: "FDA Review", years: "1–2 yrs", color: "#22c55e", w: 0.15 },
  ];
  let xCursor = 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
      {phases.map((ph, i) => {
        const x = xCursor * W;
        const w = ph.w * W - 2;
        xCursor += ph.w;
        return (
          <g key={i}>
            <rect x={x} y={10} width={w} height={30} rx={3} fill={ph.color} opacity={0.8} />
            <text x={x + w / 2} y={29} textAnchor="middle" fontSize={9} fill="white" fontWeight="bold">
              {ph.label}
            </text>
            <text x={x + w / 2} y={55} textAnchor="middle" fontSize={8} fill="#a1a1aa">
              {ph.years}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PatentCliffSVG() {
  const W = 600;
  const H = 160;
  const maxRev = Math.max(...PATENT_CLIFFS.map((p) => p.peakRevenue));
  const barW = W / PATENT_CLIFFS.length - 4;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 50}`} className="w-full" style={{ minWidth: 500 }}>
        {PATENT_CLIFFS.map((cliff, i) => {
          const x = i * (W / PATENT_CLIFFS.length) + 2;
          const bH = (cliff.peakRevenue / maxRev) * H;
          const y = H - bH;
          const isExpired = cliff.expiryYear <= 2026;
          const fill = isExpired ? "#ef4444" : cliff.expiryYear <= 2028 ? "#f59e0b" : "#3b82f6";
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bH} rx={2} fill={fill} opacity={0.75} />
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={8} fill={fill}>
                ${cliff.peakRevenue}B
              </text>
              <text x={x + barW / 2} y={H + 12} textAnchor="middle" fontSize={7} fill="#71717a">
                {cliff.drug.split(" ")[0]}
              </text>
              <text x={x + barW / 2} y={H + 22} textAnchor="middle" fontSize={7} fill="#52525b">
                {cliff.company.split("/")[0]}
              </text>
              <text
                x={x + barW / 2}
                y={H + 35}
                textAnchor="middle"
                fontSize={7}
                fill={isExpired ? "#ef4444" : "#a1a1aa"}
              >
                {cliff.expiryYear}
              </text>
            </g>
          );
        })}
        {/* Legend */}
        {[
          { color: "#ef4444", label: "Expired/2026" },
          { color: "#f59e0b", label: "2027–2028" },
          { color: "#3b82f6", label: "2029+" },
        ].map((l, i) => (
          <g key={i}>
            <rect x={10 + i * 110} y={H + 42} width={10} height={6} fill={l.color} opacity={0.8} />
            <text x={24 + i * 110} y={H + 48} fontSize={7} fill="#a1a1aa">{l.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Tab 3: Valuation Framework ────────────────────────────────────────────────

function ValuationFramework() {
  const [selectedTicker, setSelectedTicker] = useState<string>("VRTX");

  const co = COMPANIES.find((c) => c.ticker === selectedTicker)!;

  // Sum-of-parts rNPV
  const rnpv = useMemo(() => {
    return co.pipeline.reduce((sum, drug) => {
      const stagePoA = STAGE_POA[drug.stage];
      // Simplified NPV per drug: synthetic peak sales based on stage
      const syntheticPeakSales = drug.stage === "Approved" ? 3000 + rand() * 8000
        : drug.stage === "NDA/BLA" ? 2000 + rand() * 5000
        : drug.stage === "Phase III" ? 1500 + rand() * 4000
        : drug.stage === "Phase II" ? 800 + rand() * 2000
        : 200 + rand() * 500;
      const npvEstimate = syntheticPeakSales * 0.3 * 4; // 30% margin × 4 yr avg peak
      return sum + npvEstimate * stagePoA;
    }, 0);
  }, [co]);

  const comparables = [
    { name: "Large Pharma (commercial)", metric: "EV/EBITDA", typical: "12–18x", current: "14.2x" },
    { name: "Growth Biotech (commercial)", metric: "EV/Revenue", typical: "8–20x", current: "11.5x" },
    { name: "Pre-revenue Biotech", metric: "EV/Pipeline", typical: "rNPV − 20%", current: "rNPV × 0.8" },
    { name: "CRO Services", metric: "EV/EBITDA", typical: "20–30x", current: "22.1x" },
    { name: "Generic Pharma", metric: "EV/EBITDA", typical: "8–12x", current: "9.4x" },
    { name: "Specialty Pharma", metric: "EV/EBITDA", typical: "10–16x", current: "12.8x" },
  ];

  const maDeals = [
    { acquirer: "AbbVie", target: "Allergan", value: "$63B", year: "2020", premium: "45%", rationale: "Replace Humira cliff with Botox diversification" },
    { acquirer: "AbbVie", target: "ImmunoGen", value: "$10.1B", year: "2024", premium: "94%", rationale: "Elahere ADC oncology to fill post-Humira gap" },
    { acquirer: "Pfizer", target: "Seagen", value: "$43B", year: "2023", premium: "33%", rationale: "ADC oncology platform, 4 approved products" },
    { acquirer: "Merck", target: "Prometheus Bio", value: "$10.8B", year: "2023", premium: "75%", rationale: "IBD/autoimmune precision medicine pipeline" },
    { acquirer: "Bristol-Myers", target: "Karuna Therapeutics", value: "$14B", year: "2024", premium: "53%", rationale: "KarXT (schizophrenia) Phase III asset" },
    { acquirer: "Novo Nordisk", target: "Catalent", value: "$16.5B", year: "2024", premium: "N/A", rationale: "Manufacturing capacity for GLP-1 demand" },
  ];

  return (
    <div className="space-y-6">
      {/* Company selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-zinc-400">Select company:</span>
        {COMPANIES.slice(0, 8).map((c) => (
          <button
            key={c.ticker}
            onClick={() => setSelectedTicker(c.ticker)}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors",
              selectedTicker === c.ticker
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {c.ticker}
          </button>
        ))}
      </div>

      {/* Sum-of-parts panel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-1">
          {co.name} ({co.ticker}) — Sum-of-Parts rNPV
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Each pipeline asset valued at probability-adjusted NPV using phase success rates
        </p>
        <div className="space-y-3">
          {co.pipeline.map((drug, i) => {
            s = 151 + i * 17 + co.ticker.charCodeAt(0);
            const syntheticPeakSales =
              drug.stage === "Approved"
                ? 2000 + ((s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff * 8000
                : drug.stage === "NDA/BLA"
                ? 1500 + ((s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff * 4000
                : drug.stage === "Phase III"
                ? 1000 + ((s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff * 3000
                : 400 + ((s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff * 1000;
            const grossNPV = syntheticPeakSales * 0.3 * 4;
            const riskAdjNPV = grossNPV * STAGE_POA[drug.stage];
            const pctOfTotal = rnpv > 0 ? riskAdjNPV / rnpv : 0;
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: STAGE_COLORS[drug.stage] }}
                    />
                    <span className="text-white font-medium">{drug.name}</span>
                    <span className="text-zinc-500">({drug.indication})</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: STAGE_COLORS[drug.stage] + "33",
                        color: STAGE_COLORS[drug.stage],
                      }}
                    >
                      {drug.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400">Gross NPV: <span className="text-zinc-300">{fmtM(Math.round(grossNPV))}</span></span>
                    <span className="text-zinc-400">PoA: <span className="text-zinc-300">{fmtPct(STAGE_POA[drug.stage])}</span></span>
                    <span className="text-emerald-400 font-bold">{fmtM(Math.round(riskAdjNPV))}</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${pctOfTotal * 100}%`,
                      backgroundColor: STAGE_COLORS[drug.stage],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-sm text-zinc-400">Total rNPV (pipeline)</span>
          <span className="text-lg font-bold text-emerald-400">{fmtM(Math.round(rnpv))}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-zinc-500">Market Cap</span>
          <span className="text-sm text-zinc-300">{fmtB(co.marketCap)}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-zinc-500">rNPV Premium / (Discount)</span>
          <span
            className={cn(
              "text-sm font-medium",
              rnpv / 1000 > co.marketCap ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {((rnpv / 1000 / co.marketCap - 1) * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Comparables */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Valuation Multiples by Subsector</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-2 text-zinc-400">Subsector</th>
                <th className="text-left p-2 text-zinc-400">Primary Metric</th>
                <th className="text-left p-2 text-zinc-400">Typical Range</th>
                <th className="text-right p-2 text-zinc-400">Current Avg.</th>
              </tr>
            </thead>
            <tbody>
              {comparables.map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="p-2 text-zinc-300">{row.name}</td>
                  <td className="p-2 text-blue-300 font-mono">{row.metric}</td>
                  <td className="p-2 text-zinc-400">{row.typical}</td>
                  <td className="p-2 text-right text-white font-medium">{row.current}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* M&A Case Studies */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
          <Target className="w-4 h-4 text-rose-400" />
          M&A Premium Examples — Big Pharma Pipeline Replacement
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Big pharma acquires at 50–100%+ premiums to replenish pipelines facing patent cliffs
        </p>
        <div className="space-y-2">
          {maDeals.map((deal, i) => (
            <div key={i} className="flex items-start gap-3 bg-zinc-800/40 rounded p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-white">{deal.acquirer}</span>
                  <span className="text-xs text-zinc-500">acquires</span>
                  <span className="text-xs font-bold text-blue-300">{deal.target}</span>
                  <span className="text-xs text-zinc-400">({deal.year})</span>
                </div>
                <p className="text-xs text-zinc-500">{deal.rationale}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-white">{deal.value}</div>
                {deal.premium !== "N/A" && (
                  <div className="text-xs text-amber-400">+{deal.premium} premium</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Sector Analysis ────────────────────────────────────────────────────

function SectorAnalysis() {
  const subsectorData = [
    { name: "Large Pharma", revenue: 580, rd: 18, margin: 28, growth: 4, examples: "JNJ, PFE, MRK" },
    { name: "Biotech", revenue: 120, rd: 42, margin: 15, growth: 18, examples: "BIIB, REGN, VRTX" },
    { name: "CRO", revenue: 45, rd: 5, margin: 22, growth: 12, examples: "IQVIA, CRL, ICLR" },
    { name: "Generic Pharma", revenue: 85, rd: 8, margin: 18, growth: 2, examples: "TEVA, MYL, AMRX" },
    { name: "Specialty Pharma", revenue: 35, rd: 15, margin: 32, growth: 8, examples: "JAZZ, HALO, ARQT" },
  ];

  const drugCategories = [
    { category: "Oncology", marketSize: 220, growth: 12, biosimilarRisk: "Low–Mod", pricingPower: "Very High" },
    { category: "Rare Disease (Orphan)", marketSize: 95, growth: 15, biosimilarRisk: "Low", pricingPower: "Extreme" },
    { category: "CNS / Neurology", marketSize: 110, growth: 8, biosimilarRisk: "Moderate", pricingPower: "High" },
    { category: "Metabolic (GLP-1, Diabetes)", marketSize: 185, growth: 22, biosimilarRisk: "Low", pricingPower: "Very High" },
    { category: "Immunology / Autoimmune", marketSize: 160, growth: 9, biosimilarRisk: "High", pricingPower: "High" },
    { category: "Infectious Disease", marketSize: 80, growth: 6, biosimilarRisk: "High (generics)", pricingPower: "Moderate" },
    { category: "Cardiovascular", marketSize: 75, growth: 5, biosimilarRisk: "High", pricingPower: "Moderate" },
    { category: "Respiratory", marketSize: 55, growth: 7, biosimilarRisk: "Moderate", pricingPower: "High" },
  ];

  const fdaApprovals = [
    { year: 2019, nda: 35, bla: 13, accelerated: 8 },
    { year: 2020, nda: 30, bla: 23, accelerated: 11 },
    { year: 2021, nda: 36, bla: 14, accelerated: 9 },
    { year: 2022, nda: 26, bla: 11, accelerated: 7 },
    { year: 2023, nda: 33, bla: 22, accelerated: 12 },
    { year: 2024, nda: 31, bla: 19, accelerated: 10 },
    { year: 2025, nda: 34, bla: 21, accelerated: 13 },
  ];

  const maxApproval = Math.max(...fdaApprovals.map((a) => a.nda + a.bla));
  const W = 500;
  const H = 140;
  const barW = (W / fdaApprovals.length) * 0.6;
  const groupGap = W / fdaApprovals.length;

  return (
    <div className="space-y-6">
      {/* Subsector Comparison */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Subsector Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-2 text-zinc-400">Subsector</th>
                <th className="text-right p-2 text-zinc-400">Revenue ($B)</th>
                <th className="text-right p-2 text-zinc-400">R&D% Rev</th>
                <th className="text-right p-2 text-zinc-400">Net Margin</th>
                <th className="text-right p-2 text-zinc-400">Growth YoY</th>
                <th className="text-left p-2 text-zinc-400">Examples</th>
              </tr>
            </thead>
            <tbody>
              {subsectorData.map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="p-2 text-zinc-300 font-medium">{row.name}</td>
                  <td className="p-2 text-right text-zinc-200">${row.revenue}B</td>
                  <td className="p-2 text-right">
                    <span
                      className={cn(
                        "font-medium",
                        row.rd > 30 ? "text-blue-400" : row.rd > 15 ? "text-amber-400" : "text-zinc-400"
                      )}
                    >
                      {row.rd}%
                    </span>
                  </td>
                  <td className="p-2 text-right text-emerald-400">{row.margin}%</td>
                  <td className="p-2 text-right">
                    <span className={row.growth > 10 ? "text-emerald-400" : "text-zinc-300"}>
                      +{row.growth}%
                    </span>
                  </td>
                  <td className="p-2 text-zinc-500 font-mono">{row.examples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drug Categories */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Drug Categories by Indication</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {drugCategories.map((cat, i) => (
            <div key={i} className="bg-zinc-800/40 rounded p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">{cat.category}</div>
                <div className="text-xs text-zinc-500 mt-0.5">Market: ${cat.marketSize}B | Growth: +{cat.growth}%/yr</div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "text-xs font-medium",
                    cat.pricingPower === "Extreme" || cat.pricingPower === "Very High"
                      ? "text-emerald-400"
                      : cat.pricingPower === "High"
                      ? "text-blue-400"
                      : "text-amber-400"
                  )}
                >
                  {cat.pricingPower}
                </div>
                <div
                  className={cn(
                    "text-xs",
                    cat.biosimilarRisk === "High" || cat.biosimilarRisk === "High (generics)"
                      ? "text-rose-400"
                      : cat.biosimilarRisk === "Moderate"
                      ? "text-amber-400"
                      : "text-zinc-500"
                  )}
                >
                  Biosimilar: {cat.biosimilarRisk}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Power: US vs International */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-400" />
          US vs International Drug Pricing
        </h3>
        <USDrugPricingSVG />
      </div>

      {/* FDA Approvals */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">FDA Approval Trends (NDA + BLA per Year)</h3>
        <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" style={{ height: H + 30 }}>
          {fdaApprovals.map((yr, i) => {
            const x = i * groupGap + groupGap / 2 - barW / 2;
            const totalH = ((yr.nda + yr.bla) / maxApproval) * H;
            const ndaH = (yr.nda / maxApproval) * H;
            const blaH = (yr.bla / maxApproval) * H;
            return (
              <g key={i}>
                <rect x={x} y={H - ndaH} width={barW} height={ndaH} rx={2} fill="#3b82f6" opacity={0.8} />
                <rect x={x} y={H - ndaH - blaH} width={barW} height={blaH} rx={2} fill="#a855f7" opacity={0.8} />
                <text x={x + barW / 2} y={H - totalH - 4} textAnchor="middle" fontSize={8} fill="#a1a1aa">
                  {yr.nda + yr.bla}
                </text>
                <text x={x + barW / 2} y={H + 12} textAnchor="middle" fontSize={8} fill="#71717a">
                  {yr.year}
                </text>
              </g>
            );
          })}
          {/* Legend */}
          <rect x={W - 130} y={5} width={8} height={8} fill="#3b82f6" opacity={0.8} />
          <text x={W - 118} y={12} fontSize={8} fill="#a1a1aa">NDA (small molecule)</text>
          <rect x={W - 130} y={18} width={8} height={8} fill="#a855f7" opacity={0.8} />
          <text x={W - 118} y={25} fontSize={8} fill="#a1a1aa">BLA (biologic)</text>
        </svg>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { label: "Fast Track", desc: "Accelerate review for serious conditions with unmet need", color: "text-blue-400" },
            { label: "Breakthrough Therapy", desc: "Preliminary evidence of substantial improvement over SOC", color: "text-purple-400" },
            { label: "Accelerated Approval", desc: "Based on surrogate endpoint; post-market confirmation required", color: "text-emerald-400" },
          ].map((d) => (
            <div key={d.label} className="bg-zinc-800/40 rounded p-3">
              <div className={cn("text-xs font-semibold mb-1", d.color)}>{d.label}</div>
              <div className="text-xs text-zinc-500">{d.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function USDrugPricingSVG() {
  const drugs = [
    { name: "Humira", us: 84000, de: 19200, uk: 9800 },
    { name: "Keytruda", us: 189000, de: 95000, uk: 72000 },
    { name: "Ozempic", us: 15600, de: 1200, uk: 890 },
    { name: "Eliquis", us: 8400, de: 920, uk: 650 },
    { name: "Dupixent", us: 48000, de: 18000, uk: 12000 },
  ];
  const maxPrice = Math.max(...drugs.map((d) => d.us));
  const W = 560;
  const H = 140;
  const rowH = H / drugs.length;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" style={{ minWidth: 400 }}>
        {drugs.map((drug, i) => {
          const y = i * rowH + rowH * 0.1;
          const barH = rowH * 0.25;
          const usW = (drug.us / maxPrice) * (W - 120);
          const deW = (drug.de / maxPrice) * (W - 120);
          const ukW = (drug.uk / maxPrice) * (W - 120);
          return (
            <g key={i}>
              <text x={0} y={y + barH * 1.5} fontSize={9} fill="#a1a1aa">{drug.name}</text>
              <rect x={100} y={y} width={usW} height={barH} rx={2} fill="#ef4444" opacity={0.8} />
              <text x={100 + usW + 3} y={y + barH - 1} fontSize={8} fill="#ef4444">${(drug.us / 1000).toFixed(0)}k</text>
              <rect x={100} y={y + barH + 2} width={deW} height={barH * 0.7} rx={2} fill="#3b82f6" opacity={0.8} />
              <text x={100 + deW + 3} y={y + barH * 1.7 + 1} fontSize={7} fill="#3b82f6">${(drug.de / 1000).toFixed(0)}k</text>
              <rect x={100} y={y + barH * 1.7 + 4} width={ukW} height={barH * 0.6} rx={2} fill="#22c55e" opacity={0.8} />
              <text x={100 + ukW + 3} y={y + barH * 2.3 + 3} fontSize={7} fill="#22c55e">${(drug.uk / 1000).toFixed(0)}k</text>
            </g>
          );
        })}
        {/* Legend */}
        <rect x={0} y={H + 5} width={8} height={6} fill="#ef4444" opacity={0.8} />
        <text x={12} y={H + 11} fontSize={8} fill="#a1a1aa">US (annual list price)</text>
        <rect x={100} y={H + 5} width={8} height={6} fill="#3b82f6" opacity={0.8} />
        <text x={112} y={H + 11} fontSize={8} fill="#a1a1aa">Germany</text>
        <rect x={175} y={H + 5} width={8} height={6} fill="#22c55e" opacity={0.8} />
        <text x={187} y={H + 11} fontSize={8} fill="#a1a1aa">UK (NHS)</text>
      </svg>
    </div>
  );
}

// ── Tab 5: Binary Event Trading ───────────────────────────────────────────────

function BinaryEventTrading() {
  const [straddleUnderlying, setStraddleUnderlying] = useState(50);
  const [impliedVol, setImpliedVol] = useState(80);
  const [daysToEvent, setDaysToEvent] = useState(30);

  // Straddle ATM cost estimate
  const straddleCost = useMemo(() => {
    // ATM straddle ≈ 0.8 × σ × √(T/252) × S
    const T = daysToEvent / 252;
    return 0.8 * (impliedVol / 100) * Math.sqrt(T) * straddleUnderlying;
  }, [straddleUnderlying, impliedVol, daysToEvent]);

  const breakeven = straddleCost / straddleUnderlying * 100;

  const historicalReactions = [
    { event: "Phase III Success", avgReturn: 42, range: "+15% to +180%", n: 45, positive: 100 },
    { event: "Phase III Failure", avgReturn: -55, range: "-30% to -95%", n: 45, positive: 0 },
    { event: "FDA Approval (PDUFA)", avgReturn: 5, range: "-25% to +40%", n: 120, positive: 68 },
    { event: "FDA Complete Response Letter", avgReturn: -32, range: "-10% to -75%", n: 30, positive: 0 },
    { event: "Phase II Positive", avgReturn: 28, range: "+5% to +120%", n: 80, positive: 85 },
    { event: "Phase II Failure", avgReturn: -42, range: "-15% to -90%", n: 80, positive: 0 },
  ];

  const basketCatalysts = useMemo(() => {
    const companies = BINARY_EVENTS.slice(0, 10).map((ev, i) => {
      s = 151 + i * 31;
      const positionPct = 1 + rand() * 3; // 1–4% per name
      const result = rand() > 0.40 ? "success" : rand() > 0.5 ? "failure" : "pending";
      const move = result === "success" ? 20 + rand() * 60 : result === "failure" ? -(20 + rand() * 50) : 0;
      return { ...ev, positionPct, result, move };
    });
    return companies;
  }, []);

  const basketReturn = basketCatalysts.reduce((sum, c) => {
    if (c.result === "pending") return sum;
    return sum + (c.positionPct / 100) * (c.move / 100) * 100000;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Straddle Calculator */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          ATM Straddle Calculator for Binary Events
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Buy ATM call + ATM put before catalysts to profit from large moves in either direction.
          Breakeven = ±straddle cost.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: "Underlying Price ($)", value: straddleUnderlying, min: 5, max: 200, step: 1, setter: setStraddleUnderlying },
            { label: "Implied Volatility (%)", value: impliedVol, min: 20, max: 300, step: 5, setter: setImpliedVol },
            { label: "Days to Event", value: daysToEvent, min: 5, max: 60, step: 1, setter: setDaysToEvent },
          ].map((p) => (
            <div key={p.label}>
              <label className="text-xs text-zinc-400 mb-1 block">{p.label}</label>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={p.value}
                onChange={(e) => p.setter(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="text-xs text-white font-medium mt-0.5">{p.value}{p.label.includes("%") || p.label.includes("Volatility") ? "%" : p.label.includes("Days") ? " days" : ""}</div>
            </div>
          ))}
        </div>

        {/* Straddle Payoff SVG */}
        <StraddlePayoffSVG
          underlying={straddleUnderlying}
          straddleCost={straddleCost}
          breakeven={breakeven}
        />

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-zinc-800/60 rounded p-3">
            <div className="text-xs text-zinc-400">Straddle Cost</div>
            <div className="text-lg font-bold text-white">${straddleCost.toFixed(2)}</div>
            <div className="text-xs text-zinc-500">per share</div>
          </div>
          <div className="bg-zinc-800/60 rounded p-3">
            <div className="text-xs text-zinc-400">Breakeven Range</div>
            <div className="text-lg font-bold text-amber-400">±{breakeven.toFixed(1)}%</div>
            <div className="text-xs text-zinc-500">
              ${(straddleUnderlying - straddleCost).toFixed(1)} – ${(straddleUnderlying + straddleCost).toFixed(1)}
            </div>
          </div>
          <div className="bg-zinc-800/60 rounded p-3">
            <div className="text-xs text-zinc-400">Max Loss</div>
            <div className="text-lg font-bold text-rose-400">${straddleCost.toFixed(2)}</div>
            <div className="text-xs text-zinc-500">if stock stays flat</div>
          </div>
        </div>
      </div>

      {/* Historical Reactions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Historical Stock Reactions to Binary Events</h3>
        <div className="space-y-2">
          {historicalReactions.map((ev, i) => (
            <div key={i} className="flex items-center justify-between bg-zinc-800/40 rounded p-3">
              <div className="flex-1">
                <div className="text-xs font-medium text-white">{ev.event}</div>
                <div className="text-xs text-zinc-500">n={ev.n} events • Range: {ev.range}</div>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "text-sm font-bold",
                    ev.avgReturn >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {ev.avgReturn >= 0 ? "+" : ""}{ev.avgReturn}%
                </div>
                <div className="text-xs text-zinc-400">avg return</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Position Sizing */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          Position Sizing for Binary Events
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Binary Event", maxSize: "1–3%", why: "High variance, binary outcome", color: "text-rose-400" },
            { label: "Catalyst + Trend", maxSize: "3–5%", why: "Directional bias + catalyst", color: "text-amber-400" },
            { label: "FDA Blue Chip", maxSize: "3–7%", why: "Large pharma, lower volatility", color: "text-blue-400" },
            { label: "Basket (10 names)", maxSize: "1–2% each", why: "Diversified across catalysts", color: "text-emerald-400" },
          ].map((ps) => (
            <div key={ps.label} className="bg-zinc-800/40 rounded p-3">
              <div className="text-xs font-medium text-zinc-300">{ps.label}</div>
              <div className={cn("text-lg font-bold mt-1", ps.color)}>{ps.maxSize}</div>
              <div className="text-xs text-zinc-500 mt-1">{ps.why}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Basket Approach */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Catalyst Basket Simulation ($100K Portfolio)
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Spreading small positions across 10 upcoming catalysts reduces variance vs concentrating in one.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-2 text-zinc-400">Ticker</th>
                <th className="text-left p-2 text-zinc-400">Event</th>
                <th className="text-left p-2 text-zinc-400">Date</th>
                <th className="text-right p-2 text-zinc-400">Position</th>
                <th className="text-right p-2 text-zinc-400">Result</th>
                <th className="text-right p-2 text-zinc-400">P&L</th>
              </tr>
            </thead>
            <tbody>
              {basketCatalysts.map((c, i) => {
                const pnl = c.result !== "pending"
                  ? (c.positionPct / 100) * (c.move / 100) * 100000
                  : null;
                return (
                  <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="p-2 font-mono font-bold text-white">{c.ticker}</td>
                    <td className="p-2 text-zinc-400">{c.eventType}</td>
                    <td className="p-2 text-zinc-500">{c.date}</td>
                    <td className="p-2 text-right text-blue-300">{c.positionPct.toFixed(1)}%</td>
                    <td className="p-2 text-right">
                      {c.result === "pending" ? (
                        <span className="text-zinc-500">—</span>
                      ) : (
                        <span
                          className={cn(
                            "font-medium",
                            c.result === "success" ? "text-emerald-400" : "text-rose-400"
                          )}
                        >
                          {c.move >= 0 ? "+" : ""}{c.move.toFixed(0)}%
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      {pnl !== null ? (
                        <span className={pnl >= 0 ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(0)}
                        </span>
                      ) : (
                        <span className="text-zinc-500">Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-700">
                <td colSpan={5} className="p-2 text-right text-zinc-400 font-medium">
                  Basket P&L:
                </td>
                <td className="p-2 text-right">
                  <span
                    className={cn(
                      "font-bold text-sm",
                      basketReturn >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    {basketReturn >= 0 ? "+" : ""}${basketReturn.toFixed(0)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* FDA Designations */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          FDA Expedited Designations — Trading Implications
        </h3>
        <div className="space-y-2">
          {[
            {
              name: "Fast Track",
              granted: "Rolling review, more FDA meetings",
              impliedMove: "±5–10% on grant",
              frequency: "~200/yr",
              color: "border-blue-700 bg-blue-950/20",
              textColor: "text-blue-400",
            },
            {
              name: "Breakthrough Therapy",
              granted: "Intensive guidance; Priority Review eligible",
              impliedMove: "±15–25% on grant",
              frequency: "~50/yr",
              color: "border-purple-700 bg-purple-950/20",
              textColor: "text-purple-400",
            },
            {
              name: "Accelerated Approval",
              granted: "Approval on surrogate endpoint; post-market study required",
              impliedMove: "±20–50% event",
              frequency: "~15/yr",
              color: "border-amber-700 bg-amber-950/20",
              textColor: "text-amber-400",
            },
            {
              name: "Priority Review",
              granted: "6-month review vs 10-month standard",
              impliedMove: "±10–20% on PDUFA date",
              frequency: "~30/yr",
              color: "border-emerald-700 bg-emerald-950/20",
              textColor: "text-emerald-400",
            },
          ].map((des) => (
            <div key={des.name} className={cn("border rounded-lg p-3 flex items-center justify-between", des.color)}>
              <div>
                <div className={cn("text-xs font-bold", des.textColor)}>{des.name}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{des.granted}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white font-medium">{des.impliedMove}</div>
                <div className="text-xs text-zinc-500">{des.frequency} granted</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StraddlePayoffSVG({
  underlying,
  straddleCost,
  breakeven,
}: {
  underlying: number;
  straddleCost: number;
  breakeven: number;
}) {
  const W = 500;
  const H = 120;
  const minPrice = underlying * 0.5;
  const maxPrice = underlying * 1.5;
  const range = maxPrice - minPrice;
  const steps = 50;

  const toX = (p: number) => ((p - minPrice) / range) * W;
  const maxPnl = underlying * 0.5 - straddleCost;
  const minPnl = -straddleCost;
  const pnlRange = maxPnl - minPnl;

  const toY = (pnl: number) => {
    return H - ((pnl - minPnl) / pnlRange) * H;
  };

  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const price = minPrice + (i / steps) * range;
    const callPayoff = Math.max(0, price - underlying);
    const putPayoff = Math.max(0, underlying - price);
    const pnl = callPayoff + putPayoff - straddleCost;
    points.push(`${toX(price).toFixed(1)},${toY(pnl).toFixed(1)}`);
  }

  const zeroY = toY(0);
  const centerX = toX(underlying);
  const beLowX = toX(underlying - straddleCost);
  const beHighX = toX(underlying + straddleCost);

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" style={{ height: H + 20 }}>
      {/* Zero line */}
      <line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke="#3f3f46" strokeWidth={1} strokeDasharray="4,2" />

      {/* Profit zone fill */}
      <clipPath id="above-zero">
        <rect x={0} y={0} width={W} height={zeroY} />
      </clipPath>
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="#22c55e"
        strokeWidth={2}
        clipPath="url(#above-zero)"
      />
      <clipPath id="below-zero">
        <rect x={0} y={zeroY} width={W} height={H - zeroY} />
      </clipPath>
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="#ef4444"
        strokeWidth={2}
        clipPath="url(#below-zero)"
      />

      {/* Underlying line */}
      <line x1={centerX} y1={0} x2={centerX} y2={H} stroke="#a1a1aa" strokeWidth={1} strokeDasharray="2,2" />
      <text x={centerX} y={H + 14} textAnchor="middle" fontSize={8} fill="#a1a1aa">
        ${underlying}
      </text>

      {/* Breakeven lines */}
      {beLowX > 0 && beLowX < W && (
        <>
          <line x1={beLowX} y1={0} x2={beLowX} y2={H} stroke="#f59e0b" strokeWidth={1} strokeDasharray="2,2" />
          <text x={beLowX} y={H + 14} textAnchor="middle" fontSize={7} fill="#f59e0b">
            ${(underlying - straddleCost).toFixed(1)}
          </text>
        </>
      )}
      {beHighX > 0 && beHighX < W && (
        <>
          <line x1={beHighX} y1={0} x2={beHighX} y2={H} stroke="#f59e0b" strokeWidth={1} strokeDasharray="2,2" />
          <text x={beHighX} y={H + 14} textAnchor="middle" fontSize={7} fill="#f59e0b">
            ${(underlying + straddleCost).toFixed(1)}
          </text>
        </>
      )}

      {/* Labels */}
      <text x={4} y={12} fontSize={8} fill="#22c55e">Profit</text>
      <text x={4} y={zeroY + 12} fontSize={8} fill="#ef4444">Loss</text>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BiotechPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-emerald-900/50 border border-emerald-700 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Biotech & Pharma Investing</h1>
              <p className="text-xs text-zinc-400">
                Clinical pipeline tracker · Drug economics · Valuation · Binary events
              </p>
            </div>
          </div>

          {/* Top KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {[
              { label: "Companies Tracked", value: "15", sub: "Across all subsectors", color: "text-blue-400" },
              { label: "Upcoming Catalysts", value: "12", sub: "Next 12 months", color: "text-amber-400" },
              { label: "Phase III PoA", value: "58%", sub: "Historical approval rate", color: "text-emerald-400" },
              { label: "Avg Dev Cost", value: "$2.6B", sub: "All-in incl. failures", color: "text-rose-400" },
              { label: "M&A Premium", value: "50–100%", sub: "Big pharma acquisitions", color: "text-purple-400" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <div className={cn("text-lg font-bold", kpi.color)}>{kpi.value}</div>
                <div className="text-xs text-zinc-300 font-medium">{kpi.label}</div>
                <div className="text-xs text-zinc-500">{kpi.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="pipeline">
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 flex-wrap h-auto gap-1 p-1">
            {[
              { value: "pipeline", label: "Pipeline Tracker", icon: <Pill className="w-3.5 h-3.5" /> },
              { value: "economics", label: "Drug Economics", icon: <DollarSign className="w-3.5 h-3.5" /> },
              { value: "valuation", label: "Valuation", icon: <BarChart3 className="w-3.5 h-3.5" /> },
              { value: "sector", label: "Sector Analysis", icon: <Layers className="w-3.5 h-3.5" /> },
              { value: "binary", label: "Binary Events", icon: <Zap className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="pipeline" className="data-[state=inactive]:hidden">
            <PipelineTracker />
          </TabsContent>

          <TabsContent value="economics" className="data-[state=inactive]:hidden">
            <DrugEconomics />
          </TabsContent>

          <TabsContent value="valuation" className="data-[state=inactive]:hidden">
            <ValuationFramework />
          </TabsContent>

          <TabsContent value="sector" className="data-[state=inactive]:hidden">
            <SectorAnalysis />
          </TabsContent>

          <TabsContent value="binary" className="data-[state=inactive]:hidden">
            <BinaryEventTrading />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
