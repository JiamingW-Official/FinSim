"use client";

import { useState, useMemo } from "react";
import {
  Leaf,
  TreePine,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingDown,
  TrendingUp,
  Wind,
  Shield,
  FileText,
  Target,
  Users,
  BarChart2,
  Info,
  Layers,
  Sprout,
  Fish,
  Sun,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 915;
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

// ── Types ──────────────────────────────────────────────────────────────────────

interface EcosystemCategory {
  id: string;
  name: string;
  description: string;
  value: number; // $ trillion/yr
  examples: string[];
  color: string;
  icon: React.ReactNode;
}

interface SectorDependency {
  sector: string;
  dependencyScore: number; // 0-100
  primaryServices: string[];
  riskLevel: "Low" | "Medium" | "High" | "Critical";
}

interface PlanetaryBoundary {
  name: string;
  shortName: string;
  status: "Safe" | "Increasing Risk" | "Exceeded";
  currentValue: number; // % of boundary
  boundaryValue: number;
  color: string;
}

interface BioIntactnessPoint {
  year: number;
  bii: number; // Biodiversity Intactness Index 0-100
}

interface TNFDPillar {
  name: string;
  description: string;
  keyElements: string[];
  color: string;
}

interface NatureRisk {
  type: string;
  category: "Physical" | "Transition" | "Systemic";
  description: string;
  affectedSectors: string[];
  severity: "Low" | "Medium" | "High";
}

interface SectorMateriality {
  sector: string;
  physicalRisk: number;
  transitionRisk: number;
  systemicRisk: number;
  tnfdPriority: "Mandatory" | "High" | "Medium" | "Low";
}

interface BiodiversityCredit {
  type: string;
  description: string;
  priceMin: number;
  priceMax: number;
  standard: string;
  unit: string;
  color: string;
}

interface NbSSolution {
  name: string;
  type: string;
  carbonPotential: number; // Gt CO2/yr
  biodiversityBenefit: "Low" | "Medium" | "High" | "Very High";
  costPerHa: number;
  challenges: string[];
  color: string;
}

interface DeforestationCompany {
  name: string;
  sector: string;
  exposure: number; // $ billions
  deforestationRisk: "Low" | "Medium" | "High" | "Critical";
  eudrCompliance: "Compliant" | "Partial" | "Non-compliant" | "Unknown";
  strandedAssetRisk: number; // % of asset base
}

interface ForestCommodity {
  commodity: string;
  annualDeforestation: number; // Mha/yr
  mainRegions: string[];
  financialExposure: number; // $ billions
  eudrCovered: boolean;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const ECOSYSTEM_CATEGORIES: EcosystemCategory[] = [
  {
    id: "provisioning",
    name: "Provisioning Services",
    description: "Direct material outputs from ecosystems used by humans",
    value: 24.2,
    examples: ["Fresh water", "Food & crops", "Timber", "Medicinal plants", "Genetic resources"],
    color: "#22c55e",
    icon: <Sprout className="w-4 h-4" />,
  },
  {
    id: "regulating",
    name: "Regulating Services",
    description: "Benefits from ecosystem processes that regulate the environment",
    value: 47.3,
    examples: ["Climate regulation", "Carbon sequestration", "Flood control", "Pollination", "Water purification"],
    color: "#3b82f6",
    icon: <Wind className="w-4 h-4" />,
  },
  {
    id: "cultural",
    name: "Cultural Services",
    description: "Non-material benefits from ecosystems for human wellbeing",
    value: 11.8,
    examples: ["Recreation & tourism", "Spiritual value", "Scientific knowledge", "Cultural heritage", "Aesthetic value"],
    color: "#a855f7",
    icon: <Sun className="w-4 h-4" />,
  },
  {
    id: "supporting",
    name: "Supporting Services",
    description: "Foundational services that enable all other ecosystem functions",
    value: 41.7,
    examples: ["Soil formation", "Nutrient cycling", "Primary production", "Habitat provision", "Oxygen production"],
    color: "#f97316",
    icon: <Layers className="w-4 h-4" />,
  },
];

const SECTOR_DEPENDENCIES: SectorDependency[] = [
  { sector: "Agriculture & Food", dependencyScore: 94, primaryServices: ["Pollination", "Water", "Soil health"], riskLevel: "Critical" },
  { sector: "Pharmaceuticals", dependencyScore: 78, primaryServices: ["Genetic resources", "Medicinal plants"], riskLevel: "High" },
  { sector: "Construction", dependencyScore: 71, primaryServices: ["Timber", "Sand & gravel", "Fresh water"], riskLevel: "High" },
  { sector: "Utilities / Water", dependencyScore: 85, primaryServices: ["Freshwater", "Flood regulation", "Water purification"], riskLevel: "Critical" },
  { sector: "Mining & Metals", dependencyScore: 62, primaryServices: ["Land", "Water", "Waste absorption"], riskLevel: "High" },
  { sector: "Tourism & Recreation", dependencyScore: 68, primaryServices: ["Biodiversity", "Landscapes", "Clean water"], riskLevel: "High" },
  { sector: "Forestry & Paper", dependencyScore: 89, primaryServices: ["Timber", "Carbon sinks", "Biodiversity"], riskLevel: "Critical" },
  { sector: "Financial Services", dependencyScore: 38, primaryServices: ["Via lending/investment exposure"], riskLevel: "Medium" },
];

const PLANETARY_BOUNDARIES: PlanetaryBoundary[] = [
  { name: "Biosphere Integrity", shortName: "Biosphere", status: "Exceeded", currentValue: 840, boundaryValue: 100, color: "#ef4444" },
  { name: "Land-System Change", shortName: "Land Use", status: "Exceeded", currentValue: 165, boundaryValue: 100, color: "#ef4444" },
  { name: "Freshwater Use", shortName: "Freshwater", status: "Exceeded", currentValue: 118, boundaryValue: 100, color: "#ef4444" },
  { name: "Biogeochemical Flows", shortName: "Nutrients", status: "Exceeded", currentValue: 340, boundaryValue: 100, color: "#ef4444" },
  { name: "Climate Change", shortName: "Climate", status: "Exceeded", currentValue: 152, boundaryValue: 100, color: "#ef4444" },
  { name: "Novel Entities", shortName: "Chemicals", status: "Exceeded", currentValue: 220, boundaryValue: 100, color: "#ef4444" },
  { name: "Stratospheric Ozone", shortName: "Ozone", status: "Increasing Risk", currentValue: 85, boundaryValue: 100, color: "#f97316" },
  { name: "Ocean Acidification", shortName: "Ocean pH", status: "Increasing Risk", currentValue: 78, boundaryValue: 100, color: "#f97316" },
  { name: "Atmospheric Aerosols", shortName: "Aerosols", status: "Safe", currentValue: 42, boundaryValue: 100, color: "#22c55e" },
];

const BIO_INTACTNESS: BioIntactnessPoint[] = [
  { year: 1970, bii: 82.4 },
  { year: 1980, bii: 79.1 },
  { year: 1990, bii: 75.8 },
  { year: 2000, bii: 72.1 },
  { year: 2010, bii: 68.9 },
  { year: 2020, bii: 65.3 },
  { year: 2024, bii: 63.1 },
];

const TNFD_PILLARS: TNFDPillar[] = [
  {
    name: "Governance",
    description: "Board and management oversight of nature-related dependencies, impacts, risks and opportunities",
    keyElements: ["Board oversight structure", "Management roles & responsibilities", "Nature policy commitments", "Stakeholder engagement"],
    color: "#3b82f6",
  },
  {
    name: "Strategy",
    description: "How nature-related risks and opportunities affect business model, strategy, and financial planning",
    keyElements: ["Nature dependencies & impacts", "Scenario analysis", "Financial planning implications", "Transition plans"],
    color: "#22c55e",
  },
  {
    name: "Risk & Impact Management",
    description: "Processes to identify, assess, prioritize and monitor nature-related risks and impacts",
    keyElements: ["Risk identification process", "Impact assessment", "Mitigation hierarchy", "Monitoring framework"],
    color: "#f97316",
  },
  {
    name: "Metrics & Targets",
    description: "Metrics and targets used to assess and manage nature-related risks, dependencies, and impacts",
    keyElements: ["Biodiversity metrics", "Nature dependency KPIs", "Science-based targets", "Progress tracking"],
    color: "#a855f7",
  },
];

const NATURE_RISKS: NatureRisk[] = [
  {
    type: "Ecosystem Degradation",
    category: "Physical",
    description: "Loss of natural capital reducing availability of ecosystem services critical to operations",
    affectedSectors: ["Agriculture", "Utilities", "Tourism"],
    severity: "High",
  },
  {
    type: "Water Scarcity",
    category: "Physical",
    description: "Freshwater depletion from over-extraction and ecosystem degradation affecting production",
    affectedSectors: ["Agriculture", "Mining", "Food & Beverage"],
    severity: "High",
  },
  {
    type: "Regulatory Change",
    category: "Transition",
    description: "New biodiversity regulations, land-use restrictions, and nature-related disclosure mandates",
    affectedSectors: ["Real Estate", "Construction", "Mining"],
    severity: "High",
  },
  {
    type: "Market Shifts",
    category: "Transition",
    description: "Consumer and investor preference changes away from nature-harmful products and practices",
    affectedSectors: ["FMCG", "Retail", "Finance"],
    severity: "Medium",
  },
  {
    type: "Supply Chain Disruption",
    category: "Systemic",
    description: "Cascading failures from biodiversity loss disrupting global commodity supply chains",
    affectedSectors: ["Manufacturing", "Food Production", "Pharma"],
    severity: "High",
  },
  {
    type: "Financial Contagion",
    category: "Systemic",
    description: "Correlated nature-linked losses across portfolios causing systemic financial instability",
    affectedSectors: ["Banking", "Insurance", "Asset Management"],
    severity: "Medium",
  },
];

const SECTOR_MATERIALITY: SectorMateriality[] = [
  { sector: "Agriculture & Food", physicalRisk: 92, transitionRisk: 78, systemicRisk: 85, tnfdPriority: "Mandatory" },
  { sector: "Pharmaceuticals", physicalRisk: 74, transitionRisk: 65, systemicRisk: 55, tnfdPriority: "High" },
  { sector: "Construction", physicalRisk: 68, transitionRisk: 72, systemicRisk: 48, tnfdPriority: "High" },
  { sector: "Utilities", physicalRisk: 82, transitionRisk: 70, systemicRisk: 75, tnfdPriority: "Mandatory" },
  { sector: "Mining", physicalRisk: 76, transitionRisk: 80, systemicRisk: 52, tnfdPriority: "High" },
  { sector: "Banking & Finance", physicalRisk: 42, transitionRisk: 68, systemicRisk: 78, tnfdPriority: "High" },
];

const BIODIVERSITY_CREDITS: BiodiversityCredit[] = [
  {
    type: "Species Credit",
    description: "Represents conservation benefit for one species-area unit. Tied to habitat quality and species recovery targets.",
    priceMin: 8,
    priceMax: 45,
    standard: "BioBank / Species Offsets",
    unit: "species-area unit",
    color: "#22c55e",
  },
  {
    type: "Habitat Credit",
    description: "Broad-based credit tied to hectares of high-quality habitat restored or protected.",
    priceMin: 5,
    priceMax: 25,
    standard: "Biodiversity Net Gain (BNG)",
    unit: "biodiversity unit (ha)",
    color: "#3b82f6",
  },
  {
    type: "Ecosystem Credit",
    description: "Holistic credit capturing full ecosystem service delivery including carbon, water, and biodiversity co-benefits.",
    priceMin: 12,
    priceMax: 50,
    standard: "ICROA / Plan Vivo",
    unit: "ecosystem service unit",
    color: "#a855f7",
  },
  {
    type: "Marine / Blue Carbon",
    description: "Credits from coastal blue carbon ecosystems: mangroves, seagrass, salt marshes with biodiversity co-benefits.",
    priceMin: 15,
    priceMax: 40,
    standard: "Verra VCS + CCB",
    unit: "tCO2e + biodiversity",
    color: "#06b6d4",
  },
];

const NBS_SOLUTIONS: NbSSolution[] = [
  {
    name: "Afforestation & Reforestation",
    type: "Terrestrial",
    carbonPotential: 1.4,
    biodiversityBenefit: "High",
    costPerHa: 850,
    challenges: ["Land tenure", "Monoculture risk", "Long time horizon", "Permanence"],
    color: "#22c55e",
  },
  {
    name: "Mangrove Restoration",
    type: "Coastal",
    carbonPotential: 0.3,
    biodiversityBenefit: "Very High",
    costPerHa: 2400,
    challenges: ["Coastal development pressure", "Sea level rise", "Community engagement"],
    color: "#06b6d4",
  },
  {
    name: "Peatland Rewetting",
    type: "Wetland",
    carbonPotential: 0.9,
    biodiversityBenefit: "Very High",
    costPerHa: 1100,
    challenges: ["Drainage infrastructure", "Agricultural land competition", "Water management"],
    color: "#8b5cf6",
  },
  {
    name: "Blue Carbon (Seagrass)",
    type: "Marine",
    carbonPotential: 0.2,
    biodiversityBenefit: "Very High",
    costPerHa: 3200,
    challenges: ["Water quality", "Transplantation success rates", "Monitoring difficulty"],
    color: "#0ea5e9",
  },
  {
    name: "Savanna Fire Management",
    type: "Terrestrial",
    carbonPotential: 0.5,
    biodiversityBenefit: "High",
    costPerHa: 420,
    challenges: ["Additionality proof", "Indigenous land rights", "Monitoring"],
    color: "#f97316",
  },
];

const DEFORESTATION_COMPANIES: DeforestationCompany[] = [
  { name: "AgriCorp International", sector: "Agriculture", exposure: 8.4, deforestationRisk: "Critical", eudrCompliance: "Partial", strandedAssetRisk: 34 },
  { name: "PalmOil Holdings", sector: "Palm Oil", exposure: 5.7, deforestationRisk: "Critical", eudrCompliance: "Non-compliant", strandedAssetRisk: 48 },
  { name: "Timber Resources Ltd", sector: "Forestry", exposure: 3.2, deforestationRisk: "High", eudrCompliance: "Partial", strandedAssetRisk: 29 },
  { name: "BrazilBeef Co.", sector: "Livestock", exposure: 6.1, deforestationRisk: "Critical", eudrCompliance: "Non-compliant", strandedAssetRisk: 41 },
  { name: "SoyGlobal Inc.", sector: "Agriculture", exposure: 4.8, deforestationRisk: "High", eudrCompliance: "Partial", strandedAssetRisk: 22 },
  { name: "GreenForest REIT", sector: "Real Estate", exposure: 1.9, deforestationRisk: "Medium", eudrCompliance: "Compliant", strandedAssetRisk: 8 },
  { name: "ResourceBank AG", sector: "Finance", exposure: 12.3, deforestationRisk: "High", eudrCompliance: "Unknown", strandedAssetRisk: 15 },
  { name: "EcoPackaging Ltd", sector: "Manufacturing", exposure: 0.8, deforestationRisk: "Low", eudrCompliance: "Compliant", strandedAssetRisk: 3 },
];

const FOREST_COMMODITIES: ForestCommodity[] = [
  { commodity: "Soy", annualDeforestation: 4.8, mainRegions: ["Amazon", "Cerrado", "Gran Chaco"], financialExposure: 85, eudrCovered: true },
  { commodity: "Palm Oil", annualDeforestation: 3.1, mainRegions: ["Indonesia", "Malaysia", "West Africa"], financialExposure: 62, eudrCovered: true },
  { commodity: "Beef / Cattle", annualDeforestation: 6.2, mainRegions: ["Amazon", "Central America", "Cerrado"], financialExposure: 120, eudrCovered: true },
  { commodity: "Timber", annualDeforestation: 2.9, mainRegions: ["Congo Basin", "Amazon", "SE Asia"], financialExposure: 45, eudrCovered: true },
  { commodity: "Cocoa", annualDeforestation: 1.4, mainRegions: ["West Africa", "Indonesia"], financialExposure: 28, eudrCovered: true },
  { commodity: "Coffee", annualDeforestation: 0.6, mainRegions: ["Ethiopia", "Central America"], financialExposure: 18, eudrCovered: true },
];

// ── Helper components ──────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function RiskBadge({ level }: { level: "Low" | "Medium" | "High" | "Critical" }) {
  const map: Record<string, string> = {
    Low: "bg-green-900/40 text-green-300 border-green-700",
    Medium: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
    High: "bg-orange-900/40 text-orange-300 border-orange-700",
    Critical: "bg-red-900/40 text-red-300 border-red-700",
  };
  return (
    <span className={`text-xs text-muted-foreground px-2 py-0.5 rounded border font-medium ${map[level]}`}>
      {level}
    </span>
  );
}

function ComplianceBadge({ status }: { status: DeforestationCompany["eudrCompliance"] }) {
  const map: Record<string, string> = {
    Compliant: "bg-green-900/40 text-green-300 border-green-700",
    Partial: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
    "Non-compliant": "bg-red-900/40 text-red-300 border-red-700",
    Unknown: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`text-xs text-muted-foreground px-2 py-0.5 rounded border font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

function SeverityBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const map: Record<string, string> = {
    Low: "bg-green-900/40 text-green-300",
    Medium: "bg-yellow-900/40 text-yellow-300",
    High: "bg-red-900/40 text-red-300",
  };
  return (
    <span className={`text-xs text-muted-foreground px-2 py-0.5 rounded font-medium ${map[level]}`}>
      {level}
    </span>
  );
}

function BenefitBadge({ level }: { level: "Low" | "Medium" | "High" | "Very High" }) {
  const map: Record<string, string> = {
    Low: "bg-muted text-muted-foreground",
    Medium: "bg-muted/60 text-primary",
    High: "bg-green-900/40 text-green-300",
    "Very High": "bg-emerald-900/40 text-emerald-300",
  };
  return (
    <span className={`text-xs text-muted-foreground px-2 py-0.5 rounded font-medium ${map[level]}`}>
      {level}
    </span>
  );
}

// ── Tab 1: Ecosystem Services Value ───────────────────────────────────────────

function EcosystemTab() {
  const [selected, setSelected] = useState<string | null>(null);

  // SVG dimensions for dependency chart
  const dWidth = 480;
  const dHeight = 280;
  const barH = 26;
  const barGap = 8;

  // Biodiversity Intactness SVG
  const bWidth = 460;
  const bHeight = 160;
  const bPad = { top: 16, right: 20, bottom: 30, left: 44 };
  const bInnerW = bWidth - bPad.left - bPad.right;
  const bInnerH = bHeight - bPad.top - bPad.bottom;
  const bYMin = 55;
  const bYMax = 90;

  function bX(year: number) {
    return bPad.left + ((year - 1970) / (2024 - 1970)) * bInnerW;
  }
  function bY(val: number) {
    return bPad.top + (1 - (val - bYMin) / (bYMax - bYMin)) * bInnerH;
  }

  const bPath = BIO_INTACTNESS.map((p, i) => `${i === 0 ? "M" : "L"} ${bX(p.year)} ${bY(p.bii)}`).join(" ");

  // Planetary boundaries radar-ish: radial bar chart (polar bar)
  const pbCx = 170;
  const pbCy = 170;
  const pbR = 130;
  const pbN = PLANETARY_BOUNDARIES.length;
  const pbAngle = (2 * Math.PI) / pbN;

  function pbBarPath(index: number, pct: number, isExceeded: boolean): string {
    const angle = index * pbAngle - Math.PI / 2;
    const innerR = 28;
    const outerR = Math.min(innerR + (pct / 100) * (pbR - innerR) * (isExceeded ? 1.0 : 1.0), pbR * 1.1);
    const halfW = pbAngle * 0.38;
    const a1 = angle - halfW;
    const a2 = angle + halfW;
    const x1 = pbCx + Math.cos(a1) * innerR;
    const y1 = pbCy + Math.sin(a1) * innerR;
    const x2 = pbCx + Math.cos(a2) * innerR;
    const y2 = pbCy + Math.sin(a2) * innerR;
    const x3 = pbCx + Math.cos(a2) * outerR;
    const y3 = pbCy + Math.sin(a2) * outerR;
    const x4 = pbCx + Math.cos(a1) * outerR;
    const y4 = pbCy + Math.sin(a1) * outerR;
    return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`;
  }

  function pbLabel(index: number): { x: number; y: number } {
    const angle = index * pbAngle - Math.PI / 2;
    const labelR = pbR + 22;
    return {
      x: pbCx + Math.cos(angle) * labelR,
      y: pbCy + Math.sin(angle) * labelR,
    };
  }

  const totalValue = ECOSYSTEM_CATEGORIES.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-4">
      {/* Hero stat */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <p className="text-lg font-semibold text-muted-foreground mb-1">Total Natural Capital Value</p>
                <div className="text-2xl font-bold text-emerald-400">$125T</div>
                <p className="text-muted-foreground text-sm mt-1">estimated annual ecosystem services value</p>
                <p className="text-xs text-muted-foreground mt-2">
                  The Dasgupta Review (2021) estimates biodiversity loss costs 3–10% of global GDP annually.
                  Over 50% of global GDP — $44 trillion — is moderately or highly dependent on nature.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                {ECOSYSTEM_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelected(selected === cat.id ? null : cat.id)}
                    className={`text-left p-3 rounded-lg border transition-all ${selected === cat.id ? "border-opacity-100 bg-muted" : "border-border bg-card/60 hover:bg-muted/60"}`}
                    style={{ borderColor: selected === cat.id ? cat.color : undefined }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: cat.color }}>{cat.icon}</span>
                      <span className="text-xs font-medium text-muted-foreground truncate">{cat.name.split(" ")[0]}</span>
                    </div>
                    <div className="text-xl font-bold" style={{ color: cat.color }}>${cat.value}T</div>
                    <div className="text-xs text-muted-foreground">{((cat.value / totalValue) * 100).toFixed(0)}% of total</div>
                  </button>
                ))}
              </div>
            </div>
            {selected && (() => {
              const cat = ECOSYSTEM_CATEGORIES.find(c => c.id === selected)!;
              return (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-4 rounded-lg bg-muted/60 border"
                  style={{ borderColor: cat.color + "55" }}
                >
                  <p className="text-sm text-muted-foreground mb-2">{cat.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.examples.map(ex => (
                      <span key={ex} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">{ex}</span>
                    ))}
                  </div>
                </motion.div>
              );
            })()}
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Sector Dependency */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />
                Nature Dependency by Sector
              </CardTitle>
              <p className="text-xs text-muted-foreground">Score 0–100: extent of direct reliance on ecosystem services</p>
            </CardHeader>
            <CardContent>
              <svg viewBox={`0 0 ${dWidth} ${dHeight}`} className="w-full">
                {SECTOR_DEPENDENCIES.map((dep, i) => {
                  const y = i * (barH + barGap) + 8;
                  const maxW = dWidth - 190;
                  const barW = (dep.dependencyScore / 100) * maxW;
                  const riskColor = dep.riskLevel === "Critical" ? "#ef4444" : dep.riskLevel === "High" ? "#f97316" : dep.riskLevel === "Medium" ? "#eab308" : "#22c55e";
                  return (
                    <g key={dep.sector}>
                      <text x={0} y={y + 17} fontSize={10} fill="#a1a1aa" textAnchor="start">
                        {dep.sector.length > 22 ? dep.sector.slice(0, 21) + "…" : dep.sector}
                      </text>
                      <rect x={158} y={y + 5} width={maxW} height={barH - 6} rx={3} fill="#27272a" />
                      <rect x={158} y={y + 5} width={barW} height={barH - 6} rx={3} fill={riskColor} opacity={0.75} />
                      <text x={158 + barW + 6} y={y + 17} fontSize={10} fill={riskColor} fontWeight="600">
                        {dep.dependencyScore}
                      </text>
                    </g>
                  );
                })}
                <text x={0} y={dHeight - 4} fontSize={9} fill="#52525b">
                  Red = Critical | Orange = High | Yellow = Medium | Green = Low
                </text>
              </svg>
            </CardContent>
          </Card>
        </motion.div>

        {/* Biodiversity Intactness Index */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                Biodiversity Intactness Index (BII)
              </CardTitle>
              <p className="text-xs text-muted-foreground">Global average — 100 = pristine pre-industrial baseline</p>
            </CardHeader>
            <CardContent>
              <svg viewBox={`0 0 ${bWidth} ${bHeight}`} className="w-full">
                {/* Safe zone */}
                <rect
                  x={bPad.left}
                  y={bPad.top}
                  width={bInnerW}
                  height={bY(90) - bPad.top}
                  fill="#22c55e"
                  opacity={0.06}
                />
                {/* Boundary line at 90 */}
                <line
                  x1={bPad.left} y1={bY(90)}
                  x2={bPad.left + bInnerW} y2={bY(90)}
                  stroke="#22c55e" strokeDasharray="4,3" strokeWidth={1} opacity={0.5}
                />
                <text x={bPad.left + 4} y={bY(90) - 3} fontSize={9} fill="#22c55e" opacity={0.7}>
                  Safety boundary (90)
                </text>
                {/* Y axis ticks */}
                {[60, 65, 70, 75, 80, 85].map(v => (
                  <g key={v}>
                    <line x1={bPad.left - 4} y1={bY(v)} x2={bPad.left} y2={bY(v)} stroke="#52525b" strokeWidth={1} />
                    <text x={bPad.left - 6} y={bY(v) + 3} fontSize={9} fill="#71717a" textAnchor="end">{v}</text>
                  </g>
                ))}
                {/* X axis */}
                <line x1={bPad.left} y1={bPad.top + bInnerH} x2={bPad.left + bInnerW} y2={bPad.top + bInnerH} stroke="#52525b" strokeWidth={1} />
                {BIO_INTACTNESS.map(p => (
                  <text key={p.year} x={bX(p.year)} y={bPad.top + bInnerH + 14} fontSize={9} fill="#71717a" textAnchor="middle">{p.year}</text>
                ))}
                {/* Area fill */}
                <path
                  d={`${bPath} L ${bX(2024)} ${bPad.top + bInnerH} L ${bX(1970)} ${bPad.top + bInnerH} Z`}
                  fill="#ef4444"
                  opacity={0.15}
                />
                {/* Line */}
                <path d={bPath} fill="none" stroke="#ef4444" strokeWidth={2} strokeLinejoin="round" />
                {/* Points */}
                {BIO_INTACTNESS.map(p => (
                  <circle key={p.year} cx={bX(p.year)} cy={bY(p.bii)} r={3} fill="#ef4444" />
                ))}
                {/* Current value label */}
                <text x={bX(2024) + 6} y={bY(63.1) + 4} fontSize={10} fill="#ef4444" fontWeight="600">
                  63.1
                </text>
              </svg>
              <p className="text-xs text-muted-foreground mt-2">
                Current BII of 63.1 is 27 points below the safe operating space of 90. Species populations have declined by 69% since 1970 (WWF Living Planet Report).
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Planetary Boundaries */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-400" />
              Planetary Boundaries Framework (Rockstrom et al.)
            </CardTitle>
            <p className="text-xs text-muted-foreground">9 Earth system processes — 6 of 9 boundaries now exceeded (as of 2023)</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-3 items-center">
              <svg viewBox="0 0 340 340" className="w-full max-w-[340px] flex-shrink-0">
                {/* Safe zone circle */}
                <circle cx={pbCx} cy={pbCy} r={pbR} fill="none" stroke="#22c55e" strokeDasharray="3,3" strokeWidth={1} opacity={0.3} />
                {/* Inner circle */}
                <circle cx={pbCx} cy={pbCy} r={28} fill="#18181b" stroke="#3f3f46" strokeWidth={1} />
                <text x={pbCx} y={pbCy + 4} fontSize={9} fill="#71717a" textAnchor="middle">Earth</text>
                {/* Bars */}
                {PLANETARY_BOUNDARIES.map((pb, i) => {
                  const pct = Math.min((pb.currentValue / 400) * 100, 100);
                  const color = pb.status === "Exceeded" ? "#ef4444" : pb.status === "Increasing Risk" ? "#f97316" : "#22c55e";
                  const lp = pbLabel(i);
                  return (
                    <g key={pb.shortName}>
                      <path d={pbBarPath(i, pct, pb.status === "Exceeded")} fill={color} opacity={0.75} />
                      <text
                        x={lp.x}
                        y={lp.y}
                        fontSize={8}
                        fill="#a1a1aa"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {pb.shortName}
                      </text>
                    </g>
                  );
                })}
                {/* Boundary ring */}
                <circle cx={pbCx} cy={pbCy} r={pbR * 0.45} fill="none" stroke="#52525b" strokeDasharray="2,2" strokeWidth={1} opacity={0.5} />
              </svg>
              <div className="flex-1 space-y-2">
                {PLANETARY_BOUNDARIES.map(pb => (
                  <div key={pb.shortName} className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pb.color }}
                    />
                    <span className="text-xs text-muted-foreground w-44">{pb.name}</span>
                    <span
                      className="text-xs text-muted-foreground px-2 py-0.5 rounded font-medium flex-shrink-0"
                      style={{
                        backgroundColor: pb.color + "22",
                        color: pb.color,
                      }}
                    >
                      {pb.status}
                    </span>
                    {pb.status === "Exceeded" && (
                      <span className="text-xs text-red-400">
                        {((pb.currentValue / pb.boundaryValue - 1) * 100).toFixed(0)}% over
                      </span>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-3">
                  Biosphere integrity is most severely exceeded — current extinction rates are 100–1,000x higher than the background rate.
                  The economic cost of crossing these tipping points could reach $23T/year by 2100.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Collapse Cost */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Economic Cost of Ecosystem Collapse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Annual GDP at risk from nature loss", value: "$44T", sub: ">50% of global GDP", color: "text-red-400" },
                { label: "Estimated cost of biodiversity overshoot", value: "$23T/yr", sub: "by 2100 under BAU", color: "text-orange-400" },
                { label: "Pollination services value at risk", value: "$577B/yr", sub: "if pollinators collapse", color: "text-yellow-400" },
                { label: "Ocean services at risk", value: "$2.5T/yr", sub: "fisheries + coastal protection", color: "text-primary" },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className={`text-lg font-medium mb-1 ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-muted-foreground leading-snug mb-1">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ── Tab 2: TNFD & Disclosure ───────────────────────────────────────────────────

function TNFDTab() {
  const [activeLeap, setActiveLeap] = useState(0);

  const leapSteps = [
    {
      letter: "L",
      name: "Locate",
      color: "#3b82f6",
      description: "Identify where the business interfaces with nature across its value chain. Screen for high-priority locations against biodiversity databases.",
      actions: ["Map asset/operation footprints", "Overlay with biodiversity sensitivity maps", "Identify areas of high ecological importance", "Use IBAT, GEO BON, or ENCORE tools"],
    },
    {
      letter: "E",
      name: "Evaluate",
      color: "#22c55e",
      description: "Evaluate nature-related dependencies and impacts at priority locations. Assess materiality for disclosure purposes.",
      actions: ["Assess ecosystem service dependencies", "Evaluate direct/indirect impacts", "Prioritize by materiality and significance", "Apply ENCORE or STAR methodologies"],
    },
    {
      letter: "A",
      name: "Assess",
      color: "#f97316",
      description: "Assess risks and opportunities arising from nature-related dependencies and impacts, including under different scenarios.",
      actions: ["Apply nature risk taxonomy", "Scenario analysis (2°C, 3°C nature pathways)", "Quantify financial exposure", "Identify business opportunities"],
    },
    {
      letter: "P",
      name: "Prepare",
      color: "#a855f7",
      description: "Integrate findings into governance, strategy, risk management, metrics, and targets. Prepare TNFD-aligned disclosure.",
      actions: ["Set science-based nature targets", "Update risk management processes", "Draft TNFD disclosure report", "Engage board and investors"],
    },
  ];

  // TCFD vs TNFD comparison bars
  const comparisons = [
    { dimension: "Voluntary / Mandatory", tcfd: "Originally voluntary, now mandatory UK/EU", tnfd: "Voluntary (mandatory expected 2026+)" },
    { dimension: "Primary Focus", tcfd: "Climate change (physical + transition)", tnfd: "All nature: biodiversity, land, water, ocean" },
    { dimension: "Data Infrastructure", tcfd: "Mature (CDP, GHG Protocol)", tnfd: "Developing (ENCORE, IBAT, GEO BON)" },
    { dimension: "Metrics Standard", tcfd: "Scope 1/2/3 emissions", tnfd: "TNFD core metrics + sector specifics" },
    { dimension: "Spatial Precision", tcfd: "Not required", tnfd: "Location-specific (critical differentiator)" },
    { dimension: "Time Horizon", tcfd: "Short/medium/long", tnfd: "Same + ecological tipping points" },
    { dimension: "Scenario Pathways", tcfd: "IEA/NGFS climate scenarios", tnfd: "IPBES/GBF-aligned nature scenarios" },
  ];

  return (
    <div className="space-y-4">
      {/* TNFD Overview */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground/50" />
              TNFD Framework — Four Pillars
            </CardTitle>
            <p className="text-xs text-muted-foreground">Taskforce on Nature-related Financial Disclosures — 14 disclosure recommendations published September 2023</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TNFD_PILLARS.map((pillar, i) => (
                <motion.div
                  key={pillar.name}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-lg bg-muted/50 border"
                  style={{ borderColor: pillar.color + "44" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-muted-foreground font-medium flex-shrink-0"
                      style={{ backgroundColor: pillar.color + "22", color: pillar.color }}
                    >
                      {i + 1}
                    </div>
                    <span className="font-semibold text-foreground text-sm">{pillar.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{pillar.description}</p>
                  <ul className="space-y-1">
                    {pillar.keyElements.map(el => (
                      <li key={el} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: pillar.color }} />
                        {el}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* LEAP Approach */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              LEAP Approach — Nature Assessment Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {leapSteps.map((step, i) => (
                <button
                  key={step.letter}
                  onClick={() => setActiveLeap(i)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${activeLeap === i ? "text-foreground" : "text-muted-foreground border-border bg-muted/50 hover:bg-muted/50"}`}
                  style={activeLeap === i ? { backgroundColor: step.color + "33", borderColor: step.color, color: step.color } : {}}
                >
                  {step.letter}
                </button>
              ))}
            </div>
            <div
              className="p-4 rounded-lg border bg-muted/40"
              style={{ borderColor: leapSteps[activeLeap].color + "44" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-medium"
                  style={{ backgroundColor: leapSteps[activeLeap].color + "22", color: leapSteps[activeLeap].color }}
                >
                  {leapSteps[activeLeap].letter}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{leapSteps[activeLeap].name}</div>
                  <div className="text-xs text-muted-foreground">Step {activeLeap + 1} of 4</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{leapSteps[activeLeap].description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {leapSteps[activeLeap].actions.map(action => (
                  <div key={action} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: leapSteps[activeLeap].color }}
                    />
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* TNFD vs TCFD */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
              TNFD vs TCFD Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Dimension</th>
                  <th className="text-left py-2 px-3 text-primary font-medium">TCFD (Climate)</th>
                  <th className="text-left py-2 pl-3 text-green-400 font-medium">TNFD (Nature)</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={row.dimension} className={`border-b border-border ${i % 2 === 0 ? "bg-muted/20" : ""}`}>
                    <td className="py-2 pr-4 text-muted-foreground font-medium">{row.dimension}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.tcfd}</td>
                    <td className="py-2 pl-3 text-muted-foreground">{row.tnfd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Nature Risk Taxonomy + Sector Materiality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Nature-Related Risk Taxonomy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {NATURE_RISKS.map(risk => {
                const catColor = risk.category === "Physical" ? "#ef4444" : risk.category === "Transition" ? "#f97316" : "#8b5cf6";
                return (
                  <div key={risk.type} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{risk.type}</span>
                      <div className="flex gap-2">
                        <span
                          className="text-xs text-muted-foreground px-2 py-0.5 rounded font-medium"
                          style={{ backgroundColor: catColor + "22", color: catColor }}
                        >
                          {risk.category}
                        </span>
                        <SeverityBadge level={risk.severity} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{risk.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {risk.affectedSectors.map(sec => (
                        <span key={sec} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{sec}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                Sector-Specific Materiality Matrix
              </CardTitle>
              <p className="text-xs text-muted-foreground">Risk scores 0–100. TNFD disclosure priority per TNFD sector guidance.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SECTOR_MATERIALITY.map(sm => (
                  <div key={sm.sector} className="p-3 rounded-lg bg-muted/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground font-medium">{sm.sector}</span>
                      <span className={`text-xs text-muted-foreground px-2 py-0.5 rounded font-medium ${
                        sm.tnfdPriority === "Mandatory" ? "bg-red-900/40 text-red-300" :
                        sm.tnfdPriority === "High" ? "bg-orange-900/40 text-orange-300" :
                        sm.tnfdPriority === "Medium" ? "bg-yellow-900/40 text-yellow-300" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {sm.tnfdPriority}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: "Physical Risk", value: sm.physicalRisk, color: "#ef4444" },
                        { label: "Transition Risk", value: sm.transitionRisk, color: "#f97316" },
                        { label: "Systemic Risk", value: sm.systemicRisk, color: "#8b5cf6" },
                      ].map(r => (
                        <div key={r.label} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-28">{r.label}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full">
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${r.value}%`, backgroundColor: r.color, opacity: 0.75 }}
                            />
                          </div>
                          <span className="text-xs w-6 text-right" style={{ color: r.color }}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Implementation Timeline */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              TNFD Adoption Timeline & Early Adopters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Adoption Milestones</p>
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-muted" />
                  {[
                    { year: "Sep 2023", event: "TNFD final framework published — 14 disclosure recommendations", color: "#22c55e" },
                    { year: "Jan 2024", event: "320+ early adopters commit to TNFD-aligned reporting by FY2024", color: "#3b82f6" },
                    { year: "2025", event: "Expected G7/ISSB endorsement; EU CSRD nature disclosures align with TNFD", color: "#f97316" },
                    { year: "2026+", event: "Mandatory nature disclosure expected in UK, EU, and potentially SEC", color: "#a855f7" },
                    { year: "2030", event: "GBF Target 15: all large companies disclose nature risks", color: "#ef4444" },
                  ].map(item => (
                    <div key={item.year} className="flex gap-4 pb-4 pl-8 relative">
                      <div
                        className="absolute left-2 top-1 w-2.5 h-2.5 rounded-full -translate-x-1/2"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <span className="text-xs font-medium" style={{ color: item.color }}>{item.year}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Notable Early Adopters (320+)</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "HSBC", region: "UK", sector: "Banking" },
                    { name: "Nestlé", region: "Switzerland", sector: "Food & Bev" },
                    { name: "AXA", region: "France", sector: "Insurance" },
                    { name: "Unilever", region: "UK/NL", sector: "FMCG" },
                    { name: "BNP Paribas", region: "France", sector: "Banking" },
                    { name: "Kering", region: "France", sector: "Luxury" },
                    { name: "GSK", region: "UK", sector: "Pharma" },
                    { name: "LafargeHolcim", region: "Switzerland", sector: "Materials" },
                  ].map(company => (
                    <div key={company.name} className="p-2 rounded bg-muted/50 border border-border">
                      <div className="text-xs font-semibold text-foreground">{company.name}</div>
                      <div className="text-xs text-muted-foreground">{company.sector} · {company.region}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ── Tab 3: Biodiversity Credits & NbS ─────────────────────────────────────────

function BiodiversityCreditsTab() {
  const [selectedCredit, setSelectedCredit] = useState<number>(0);

  // Price range SVG
  const priceWidth = 460;
  const priceHeight = 180;
  const pPad = { top: 20, right: 20, bottom: 40, left: 120 };
  const pInnerW = priceWidth - pPad.left - pPad.right;
  const pInnerH = priceHeight - pPad.top - pPad.bottom;
  const maxPrice = 55;

  function pBarY(i: number) {
    return pPad.top + i * (pInnerH / BIODIVERSITY_CREDITS.length) + 6;
  }
  function pBarH() {
    return pInnerH / BIODIVERSITY_CREDITS.length - 12;
  }
  function pX(val: number) {
    return pPad.left + (val / maxPrice) * pInnerW;
  }

  return (
    <div className="space-y-4">
      {/* Credit types */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-400" />
              Voluntary Biodiversity Credit Market
            </CardTitle>
            <p className="text-xs text-muted-foreground">Emerging market for tradeable units representing measurable biodiversity conservation outcomes</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4 flex-wrap">
              {BIODIVERSITY_CREDITS.map((credit, i) => (
                <button
                  key={credit.type}
                  onClick={() => setSelectedCredit(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedCredit === i ? "text-foreground" : "border-border text-muted-foreground bg-muted/50 hover:bg-muted/50"}`}
                  style={selectedCredit === i ? { backgroundColor: credit.color + "33", borderColor: credit.color, color: credit.color } : {}}
                >
                  {credit.type}
                </button>
              ))}
            </div>
            <div
              className="p-4 rounded-lg border bg-muted/40"
              style={{ borderColor: BIODIVERSITY_CREDITS[selectedCredit].color + "44" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-3">{BIODIVERSITY_CREDITS[selectedCredit].description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 rounded bg-muted border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Standard</div>
                      <div className="text-xs font-medium text-foreground">{BIODIVERSITY_CREDITS[selectedCredit].standard}</div>
                    </div>
                    <div className="p-2 rounded bg-muted border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Unit</div>
                      <div className="text-xs font-medium text-foreground">{BIODIVERSITY_CREDITS[selectedCredit].unit}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center p-4 rounded-lg bg-card border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Price Range</div>
                  <div className="text-lg font-medium" style={{ color: BIODIVERSITY_CREDITS[selectedCredit].color }}>
                    ${BIODIVERSITY_CREDITS[selectedCredit].priceMin}–{BIODIVERSITY_CREDITS[selectedCredit].priceMax}
                  </div>
                  <div className="text-xs text-muted-foreground">per credit</div>
                </div>
              </div>
            </div>

            {/* Price range chart */}
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Credit price ranges by type ($/credit)</p>
              <svg viewBox={`0 0 ${priceWidth} ${priceHeight}`} className="w-full">
                {/* X axis ticks */}
                {[0, 10, 20, 30, 40, 50].map(v => (
                  <g key={v}>
                    <line x1={pX(v)} y1={pPad.top} x2={pX(v)} y2={pPad.top + pInnerH} stroke="#3f3f46" strokeWidth={1} />
                    <text x={pX(v)} y={pPad.top + pInnerH + 14} fontSize={9} fill="#71717a" textAnchor="middle">${v}</text>
                  </g>
                ))}
                {/* Bars */}
                {BIODIVERSITY_CREDITS.map((credit, i) => (
                  <g key={credit.type}>
                    <text x={pPad.left - 6} y={pBarY(i) + pBarH() / 2 + 3} fontSize={9} fill="#a1a1aa" textAnchor="end">
                      {credit.type.length > 16 ? credit.type.slice(0, 15) + "…" : credit.type}
                    </text>
                    {/* Range bar */}
                    <rect
                      x={pX(credit.priceMin)}
                      y={pBarY(i)}
                      width={pX(credit.priceMax) - pX(credit.priceMin)}
                      height={pBarH()}
                      rx={3}
                      fill={credit.color}
                      opacity={selectedCredit === i ? 0.9 : 0.45}
                    />
                    {/* Min/max labels */}
                    <text x={pX(credit.priceMin) - 3} y={pBarY(i) + pBarH() / 2 + 3} fontSize={8} fill={credit.color} textAnchor="end">
                      ${credit.priceMin}
                    </text>
                    <text x={pX(credit.priceMax) + 3} y={pBarY(i) + pBarH() / 2 + 3} fontSize={8} fill={credit.color}>
                      ${credit.priceMax}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Nature-based Solutions */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <TreePine className="w-4 h-4 text-green-400" />
              Nature-Based Solutions (NbS) Taxonomy
            </CardTitle>
            <p className="text-xs text-muted-foreground">NbS could provide 30% of the mitigation needed to limit warming to 1.5°C while delivering biodiversity co-benefits</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {NBS_SOLUTIONS.map((nbs, i) => (
                <motion.div
                  key={nbs.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-lg bg-muted/40 border border-border"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="font-medium text-foreground text-sm">{nbs.name}</span>
                      <span
                        className="ml-2 text-xs text-muted-foreground px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: nbs.color + "22", color: nbs.color }}
                      >
                        {nbs.type}
                      </span>
                    </div>
                    <BenefitBadge level={nbs.biodiversityBenefit} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <div className="text-center p-2 rounded bg-card border border-border">
                      <div className="text-sm font-medium" style={{ color: nbs.color }}>{nbs.carbonPotential}</div>
                      <div className="text-xs text-muted-foreground">Gt CO₂/yr potential</div>
                    </div>
                    <div className="text-center p-2 rounded bg-card border border-border">
                      <div className="text-sm font-medium text-primary">${nbs.costPerHa.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">cost/hectare</div>
                    </div>
                    <div className="text-center p-2 rounded bg-card border border-border">
                      <div className="text-sm font-medium text-primary">{nbs.biodiversityBenefit}</div>
                      <div className="text-xs text-muted-foreground">biodiversity benefit</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {nbs.challenges.map(c => (
                      <span key={c} className="text-xs px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">{c}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Standards & Integrity */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-muted-foreground/50" />
              High-Integrity Credit Standards & Additionality Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                {
                  name: "Verra VCS + CCB",
                  type: "Carbon + Biodiversity",
                  description: "Most widely used. Climate, Community and Biodiversity Standards (CCB) add biodiversity and social co-benefit validation.",
                  strengths: ["Largest registry", "CC&B co-benefits", "Widely accepted"],
                  color: "#22c55e",
                },
                {
                  name: "Plan Vivo",
                  type: "Smallholder Focus",
                  description: "Community-based land stewardship. Emphasizes smallholder and indigenous community benefits with robust local governance.",
                  strengths: ["Community focus", "Indigenous rights", "Long-term monitoring"],
                  color: "#3b82f6",
                },
                {
                  name: "ICROA Endorsed",
                  type: "Meta-Standard",
                  description: "International Carbon Reduction and Offset Alliance endorsement covers multiple standards. Sets minimum quality bars.",
                  strengths: ["Meta-standard", "Retirements tracking", "Quality assurance"],
                  color: "#a855f7",
                },
              ].map(std => (
                <div key={std.name} className="p-4 rounded-lg border bg-muted/40" style={{ borderColor: std.color + "44" }}>
                  <div className="font-medium text-sm mb-1" style={{ color: std.color }}>{std.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">{std.type}</div>
                  <p className="text-xs text-muted-foreground mb-3">{std.description}</p>
                  <ul className="space-y-1">
                    {std.strengths.map(s => (
                      <li key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: std.color }} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Key Integrity Requirements</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { req: "Additionality", desc: "Conservation would not have occurred without credit finance" },
                  { req: "Permanence", desc: "Biodiversity benefit must persist for 30–100 years with buffer pools" },
                  { req: "Measurability", desc: "Scientifically quantifiable metrics; remote sensing verification" },
                  { req: "No Net Harm", desc: "Must not displace harm elsewhere (leakage prevention required)" },
                ].map(item => (
                  <div key={item.req} className="p-2 rounded bg-card border border-border">
                    <div className="text-xs font-medium text-foreground mb-1">{item.req}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ── Tab 4: Deforestation Finance Risk ─────────────────────────────────────────

function DeforestationTab() {
  const [sortBy, setSortBy] = useState<"exposure" | "stranded">("exposure");

  const sorted = useMemo(() => {
    return [...DEFORESTATION_COMPANIES].sort((a, b) =>
      sortBy === "exposure" ? b.exposure - a.exposure : b.strandedAssetRisk - a.strandedAssetRisk
    );
  }, [sortBy]);

  // Bubble chart SVG: x = deforestation risk (0-4), y = stranded asset risk, size = exposure
  const bWidth = 460;
  const bHeight = 220;
  const bPad2 = { top: 16, right: 20, bottom: 30, left: 44 };
  const bInnerW2 = bWidth - bPad2.left - bPad2.right;
  const bInnerH2 = bHeight - bPad2.top - bPad2.bottom;

  const riskOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };

  function bubbleX(company: DeforestationCompany) {
    return bPad2.left + ((riskOrder[company.deforestationRisk] + 0.5) / 4) * bInnerW2;
  }
  function bubbleY(company: DeforestationCompany) {
    return bPad2.top + (1 - company.strandedAssetRisk / 55) * bInnerH2;
  }
  function bubbleR(company: DeforestationCompany) {
    return 5 + (company.exposure / 14) * 18;
  }

  const riskColor: Record<string, string> = {
    Low: "#22c55e",
    Medium: "#eab308",
    High: "#f97316",
    Critical: "#ef4444",
  };

  // Commodity deforestation bar chart
  const maxDef = Math.max(...FOREST_COMMODITIES.map(c => c.annualDeforestation));

  return (
    <div className="space-y-4">
      {/* EUDR + framework explainer */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-400" />
              EU Deforestation Regulation (EUDR) & Finance for Biodiversity Pledge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/40 border border-red-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-300">EU Deforestation Regulation</span>
                  <Badge className="bg-red-900/40 text-red-300 text-xs border-red-700">In Force 2025</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Requires companies placing 7 key commodities (soy, palm oil, beef, timber, cocoa, coffee, rubber)
                  on the EU market to prove they are not sourced from deforested land (post-December 2020 cutoff).
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {[
                    "Mandatory due diligence statements",
                    "Geolocation data for all sourcing locations",
                    "Third-party audit and verification",
                    "Penalties up to 4% of EU turnover for non-compliance",
                    "Large companies: Dec 2024; SMEs: Jun 2025",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-muted/40 border border-green-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">Finance for Biodiversity Pledge</span>
                  <Badge className="bg-green-900/40 text-green-300 text-xs border-green-700">150+ Signatories</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Coalition of financial institutions committing to protect and restore biodiversity through their
                  activities and investments. $24 trillion AUM represented.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[
                    { label: "Signatories", value: "150+" },
                    { label: "AUM represented", value: "$24T" },
                    { label: "Countries", value: "30+" },
                    { label: "By-2030 target", value: "No net loss" },
                  ].map(item => (
                    <div key={item.label} className="text-center p-2 rounded bg-card border border-border">
                      <div className="text-sm font-medium text-green-400">{item.value}</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Members commit to assess, set targets, engage companies, and report publicly on biodiversity by 2025.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commodity deforestation drivers */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Fish className="w-4 h-4 text-orange-400" />
              Commodity-Driven Deforestation & Financial Exposure
            </CardTitle>
            <p className="text-xs text-muted-foreground">All 6 commodities covered under EUDR. Mha = million hectares of annual tropical forest loss attributable.</p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 text-muted-foreground">Commodity</th>
                  <th className="text-left py-2 px-3 text-muted-foreground">Annual Deforestation</th>
                  <th className="text-left py-2 px-3 text-muted-foreground">Main Regions</th>
                  <th className="text-left py-2 px-3 text-muted-foreground">Financial Exposure</th>
                  <th className="text-left py-2 pl-3 text-muted-foreground">EUDR</th>
                </tr>
              </thead>
              <tbody>
                {FOREST_COMMODITIES.map((fc, i) => (
                  <tr key={fc.commodity} className={`border-b border-border ${i % 2 === 0 ? "bg-muted/20" : ""}`}>
                    <td className="py-2 pr-3 font-medium text-foreground">{fc.commodity}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full">
                          <div
                            className="h-2 rounded-full bg-orange-500"
                            style={{ width: `${(fc.annualDeforestation / maxDef) * 100}%`, opacity: 0.8 }}
                          />
                        </div>
                        <span className="text-muted-foreground">{fc.annualDeforestation} Mha/yr</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{fc.mainRegions.join(", ")}</td>
                    <td className="py-2 px-3">
                      <span className="font-medium text-yellow-400">${fc.financialExposure}B</span>
                    </td>
                    <td className="py-2 pl-3">
                      {fc.eudrCovered ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Company exposure bubble chart */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              Deforestation Exposure vs. Stranded Asset Risk
            </CardTitle>
            <p className="text-xs text-muted-foreground">Bubble size = financial exposure ($B). Y-axis = stranded asset risk (% of asset base).</p>
          </CardHeader>
          <CardContent>
            <svg viewBox={`0 0 ${bWidth} ${bHeight}`} className="w-full mb-3">
              {/* Grid */}
              {[0, 25, 50].map(v => (
                <g key={v}>
                  <line
                    x1={bPad2.left} y1={bPad2.top + (1 - v / 55) * bInnerH2}
                    x2={bPad2.left + bInnerW2} y2={bPad2.top + (1 - v / 55) * bInnerH2}
                    stroke="#3f3f46" strokeWidth={1}
                  />
                  <text x={bPad2.left - 4} y={bPad2.top + (1 - v / 55) * bInnerH2 + 3} fontSize={9} fill="#71717a" textAnchor="end">{v}%</text>
                </g>
              ))}
              {/* X axis labels */}
              {["Low", "Medium", "High", "Critical"].map((label, i) => (
                <text
                  key={label}
                  x={bPad2.left + ((i + 0.5) / 4) * bInnerW2}
                  y={bPad2.top + bInnerH2 + 16}
                  fontSize={9}
                  fill="#71717a"
                  textAnchor="middle"
                >
                  {label}
                </text>
              ))}
              {/* X axis label */}
              <text x={bPad2.left + bInnerW2 / 2} y={bHeight - 2} fontSize={9} fill="#52525b" textAnchor="middle">
                Deforestation Risk Level
              </text>
              {/* Y axis label */}
              <text
                transform={`rotate(-90, 10, ${bPad2.top + bInnerH2 / 2})`}
                x={10} y={bPad2.top + bInnerH2 / 2}
                fontSize={9} fill="#52525b" textAnchor="middle"
              >
                Stranded Asset Risk
              </text>
              {/* Bubbles */}
              {DEFORESTATION_COMPANIES.map(company => (
                <g key={company.name}>
                  <circle
                    cx={bubbleX(company)}
                    cy={bubbleY(company)}
                    r={bubbleR(company)}
                    fill={riskColor[company.deforestationRisk]}
                    opacity={0.6}
                    stroke={riskColor[company.deforestationRisk]}
                    strokeWidth={1}
                  />
                  <text
                    x={bubbleX(company)}
                    y={bubbleY(company) + 3}
                    fontSize={7}
                    fill="white"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {company.name.split(" ")[0]}
                  </text>
                </g>
              ))}
            </svg>
          </CardContent>
        </Card>
      </motion.div>

      {/* Company table */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-yellow-400" />
                Financial Exposure by Company
              </CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("exposure")}
                  className={`px-2 py-1 text-xs rounded border transition-all ${sortBy === "exposure" ? "bg-yellow-900/30 border-yellow-600 text-yellow-300" : "border-border text-muted-foreground"}`}
                >
                  By Exposure
                </button>
                <button
                  onClick={() => setSortBy("stranded")}
                  className={`px-2 py-1 text-xs rounded border transition-all ${sortBy === "stranded" ? "bg-orange-900/30 border-orange-600 text-orange-300" : "border-border text-muted-foreground"}`}
                >
                  By Stranded Risk
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 text-muted-foreground">Company</th>
                  <th className="text-left py-2 px-2 text-muted-foreground">Sector</th>
                  <th className="text-left py-2 px-2 text-muted-foreground">Exposure</th>
                  <th className="text-left py-2 px-2 text-muted-foreground">Deforestation Risk</th>
                  <th className="text-left py-2 px-2 text-muted-foreground">EUDR Compliance</th>
                  <th className="text-left py-2 pl-2 text-muted-foreground">Stranded Asset Risk</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((company, i) => (
                  <tr key={company.name} className={`border-b border-border ${i % 2 === 0 ? "bg-muted/20" : ""}`}>
                    <td className="py-2 pr-3 font-medium text-foreground">{company.name}</td>
                    <td className="py-2 px-2 text-muted-foreground">{company.sector}</td>
                    <td className="py-2 px-2 font-medium text-yellow-400">${company.exposure}B</td>
                    <td className="py-2 px-2">
                      <RiskBadge level={company.deforestationRisk} />
                    </td>
                    <td className="py-2 px-2">
                      <ComplianceBadge status={company.eudrCompliance} />
                    </td>
                    <td className="py-2 pl-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(company.strandedAssetRisk * 2, 100)}%`,
                              backgroundColor: company.strandedAssetRisk > 30 ? "#ef4444" : company.strandedAssetRisk > 15 ? "#f97316" : "#22c55e",
                              opacity: 0.8,
                            }}
                          />
                        </div>
                        <span className={`font-medium ${company.strandedAssetRisk > 30 ? "text-red-400" : company.strandedAssetRisk > 15 ? "text-orange-400" : "text-green-400"}`}>
                          {company.strandedAssetRisk}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>

      {/* SBTN Framework */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              Science Based Targets for Nature (SBTN)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  SBTN provides a method for companies to set science-based targets for nature, aligned with
                  the Global Biodiversity Framework (GBF) 30x30 target and the ambition of a nature-positive
                  world by 2030. Complements SBTi climate targets.
                </p>
                <div className="space-y-2">
                  {[
                    { step: "Assess", desc: "Identify and prioritize nature impacts and dependencies across value chain using AR3T methodology" },
                    { step: "Interpret & Prioritize", desc: "Translate science into business context; set priority locations and value chain tiers" },
                    { step: "Measure", desc: "Baseline measurement against SBTN freshwater, land, and ocean metrics" },
                    { step: "Set Targets", desc: "Establish company-level targets linked to global biodiversity goals and 2030 milestones" },
                    { step: "Act", desc: "Implement mitigation hierarchy: avoid → reduce → restore → transform" },
                    { step: "Track & Disclose", desc: "Annual progress reporting aligned with TNFD and GRI biodiversity standards" },
                  ].map((item, i) => (
                    <div key={item.step} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-900/40 text-green-400 text-xs flex items-center justify-center font-medium border border-green-800">
                        {i + 1}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-300">{item.step}: </span>
                        <span className="text-xs text-muted-foreground">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Global Biodiversity Framework Alignment</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { target: "30x30", desc: "30% land & ocean protected by 2030" },
                      { target: "Target 15", desc: "All large co.s assess & disclose nature risks" },
                      { target: "No Net Loss", desc: "Halt human-induced extinction by 2030" },
                      { target: "$200B/yr", desc: "Biodiversity finance gap to close by 2030" },
                    ].map(item => (
                      <div key={item.target} className="p-2 rounded bg-card border border-border">
                        <div className="text-xs font-medium text-green-400">{item.target}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-yellow-900/30">
                  <p className="text-xs font-medium text-yellow-300 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Investor Engagement Watchlist
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Finance for Biodiversity Pledge members are actively engaging companies in high-risk sectors.
                    Companies with Critical deforestation risk and no EUDR pathway face:
                  </p>
                  <ul className="space-y-1">
                    {[
                      "Exclusion from ESG indices (MSCI, FTSE4Good)",
                      "Divestment pressure from EU pension funds",
                      "Higher cost of capital from green bond ineligibility",
                      "Supply chain disruptions from EU market access loss",
                    ].map(item => (
                      <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function NaturalCapitalPage() {
  // Consume some random values during module init for seeding variety across components
  const _seed = useMemo(() => { void ri(0, 0); return null; }, []);
  void _seed;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-900/40 border border-emerald-800/50">
                  <Leaf className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-lg font-medium text-foreground">Natural Capital & Biodiversity Finance</h1>
                  <p className="text-sm text-muted-foreground">Ecosystem services valuation, TNFD, biodiversity credits, and deforestation-linked finance risk</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <div className="text-center p-2 rounded-lg bg-card border border-border">
                <div className="text-lg font-medium text-emerald-400">$125T</div>
                <div className="text-xs text-muted-foreground">Nature value/yr</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-card border border-border">
                <div className="text-lg font-medium text-red-400">6/9</div>
                <div className="text-xs text-muted-foreground">Boundaries exceeded</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-card border border-border">
                <div className="text-lg font-medium text-primary">150+</div>
                <div className="text-xs text-muted-foreground">FfBP signatories</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="ecosystem">
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="ecosystem" className="data-[state=active]:bg-emerald-900/50 data-[state=active]:text-emerald-300 text-xs">
              Ecosystem Services
            </TabsTrigger>
            <TabsTrigger value="tnfd" className="data-[state=active]:bg-muted/70 data-[state=active]:text-primary text-xs">
              TNFD & Disclosure
            </TabsTrigger>
            <TabsTrigger value="credits" className="data-[state=active]:bg-muted/70 data-[state=active]:text-primary text-xs">
              Biodiversity Credits & NbS
            </TabsTrigger>
            <TabsTrigger value="deforestation" className="data-[state=active]:bg-red-900/50 data-[state=active]:text-red-300 text-xs">
              Deforestation Finance Risk
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ecosystem" className="mt-4 data-[state=inactive]:hidden">
            <EcosystemTab />
          </TabsContent>

          <TabsContent value="tnfd" className="mt-4 data-[state=inactive]:hidden">
            <TNFDTab />
          </TabsContent>

          <TabsContent value="credits" className="mt-4 data-[state=inactive]:hidden">
            <BiodiversityCreditsTab />
          </TabsContent>

          <TabsContent value="deforestation" className="mt-4 data-[state=inactive]:hidden">
            <DeforestationTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
