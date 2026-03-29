"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  TrendingDown,
  Globe,
  DollarSign,
  BarChart2,
  ShieldAlert,
  Zap,
  Activity,
  FileWarning,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Target,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 923;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate noise values
const noiseValues = Array.from({ length: 200 }, () => rand());

// ── Data Definitions ──────────────────────────────────────────────────────────

interface CrisisEvent {
  year: number;
  name: string;
  duration: number; // months
  magnitude: number; // % peak-to-trough
  color: string;
}

const CRISIS_EVENTS: CrisisEvent[] = [
  { year: 1929, name: "Great Depression", duration: 43, magnitude: 89, color: "#ef4444" },
  { year: 1973, name: "Oil Shock", duration: 21, magnitude: 48, color: "#f97316" },
  { year: 1987, name: "Black Monday", duration: 3, magnitude: 34, color: "#eab308" },
  { year: 1997, name: "Asian Crisis", duration: 18, magnitude: 60, color: "#ef4444" },
  { year: 2000, name: "Dot-com Bust", duration: 30, magnitude: 78, color: "#f97316" },
  { year: 2008, name: "GFC", duration: 17, magnitude: 57, color: "#ef4444" },
  { year: 2020, name: "COVID Crash", duration: 2, magnitude: 34, color: "#a855f7" },
  { year: 2022, name: "Rate Shock", duration: 12, magnitude: 27, color: "#06b6d4" },
];

interface CurrencyCrisis {
  country: string;
  year: number;
  trigger: string;
  response: string;
  outcome: string;
  severity: "severe" | "moderate" | "high";
  depreciationPct: number;
}

const CURRENCY_CRISES: CurrencyCrisis[] = [
  {
    country: "Mexico",
    year: 1994,
    trigger: "Current account deficit, political instability, peso overvaluation",
    response: "USD credit line, emergency IMF package $50B, rate hikes to 80%",
    outcome: "Peso -50%, recession -6% GDP, recovery by 1996",
    severity: "severe",
    depreciationPct: 50,
  },
  {
    country: "Asia (Thailand/Korea/Indonesia)",
    year: 1997,
    trigger: "Fixed pegs, short-term USD debt, current account deficits",
    response: "IMF programs $118B, capital controls (Malaysia), rate hikes",
    outcome: "Currencies -30–80%, GDP -5–13%, structural reform",
    severity: "severe",
    depreciationPct: 55,
  },
  {
    country: "Russia",
    year: 1998,
    trigger: "Oil price collapse, twin deficits, GKO pyramid unraveling",
    response: "IMF $22.6B insufficient; ruble devalued, domestic debt moratorium",
    outcome: "Ruble -75%, GDP -5.3%, LTCM collapse contagion",
    severity: "severe",
    depreciationPct: 75,
  },
  {
    country: "Argentina",
    year: 2001,
    trigger: "Dollar peg unsustainable, $132B debt, fiscal austerity failure",
    response: "Convertibility abandoned, corralito bank freeze, IMF talks failed",
    outcome: "ARS -70%, largest default $95B at time, GDP -11%",
    severity: "severe",
    depreciationPct: 70,
  },
  {
    country: "Turkey",
    year: 2018,
    trigger: "Current account deficit, USD corporate debt, political pressure on CB",
    response: "CBRT rate hike to 24%, FX swaps with Qatar, capital restrictions",
    outcome: "TRY -40%, inflation 25%, recession in Q3-Q4 2018",
    severity: "moderate",
    depreciationPct: 40,
  },
  {
    country: "Sri Lanka",
    year: 2022,
    trigger: "Tourism collapse (COVID), forex reserve depletion, debt-financed projects",
    response: "IMF bailout $2.9B, default on $51B external debt, political crisis",
    outcome: "LKR -80%, inflation 70%, president ousted, restructuring ongoing",
    severity: "high",
    depreciationPct: 80,
  },
];

interface SovereignDefault {
  country: string;
  year: number;
  gdpPct: number; // % of world GDP at time (scaled 0-100 for display)
  defaultSize: number; // $B
  haircut: number; // %
}

const SOVEREIGN_DEFAULTS: SovereignDefault[] = [
  { country: "Mexico", year: 1827, gdpPct: 12, defaultSize: 0.1, haircut: 45 },
  { country: "Greece", year: 1826, gdpPct: 8, defaultSize: 0.05, haircut: 60 },
  { country: "Argentina", year: 1890, gdpPct: 20, defaultSize: 0.5, haircut: 50 },
  { country: "Russia", year: 1918, gdpPct: 35, defaultSize: 8, haircut: 100 },
  { country: "Germany", year: 1932, gdpPct: 65, defaultSize: 15, haircut: 35 },
  { country: "Argentina", year: 2001, gdpPct: 42, defaultSize: 95, haircut: 70 },
  { country: "Greece", year: 2012, gdpPct: 55, defaultSize: 206, haircut: 53 },
  { country: "Ukraine", year: 2015, gdpPct: 25, defaultSize: 18, haircut: 20 },
  { country: "Venezuela", year: 2017, gdpPct: 30, defaultSize: 65, haircut: 80 },
  { country: "Ecuador", year: 2020, gdpPct: 18, defaultSize: 17, haircut: 18 },
  { country: "Sri Lanka", year: 2022, gdpPct: 15, defaultSize: 51, haircut: 30 },
  { country: "Zambia", year: 2020, gdpPct: 8, defaultSize: 13, haircut: 25 },
];

interface InvestmentTheme {
  title: string;
  description: string;
  examples: string;
  entry: string;
  timing: string;
  riskLevel: "high" | "very-high" | "extreme";
}

const INVESTMENT_THEMES: InvestmentTheme[] = [
  {
    title: "Bank Recapitalizations",
    description:
      "Governments inject capital into insolvent banks at distressed valuations. Post-recap, banks trade at deep discounts to book value.",
    examples: "Citigroup 2009 (~$1/share), RBS 2008, Greek banks 2012",
    entry: "Price-to-book < 0.2x, government backstop announced",
    timing: "6–18 months after crisis onset",
    riskLevel: "very-high",
  },
  {
    title: "Privatizations",
    description:
      "Crisis-hit governments sell state assets to raise cash. Often priced at significant discounts to fundamental value.",
    examples: "Greek state assets 2012–2015, Argentine utilities 1990s",
    entry: "Government fiscal stress, IMF conditionality requiring asset sales",
    timing: "12–36 months post-crisis",
    riskLevel: "high",
  },
  {
    title: "Currency Normalization",
    description:
      "After severe devaluation, structurally sound economies see FX recovery. Long the devalued currency once reserves stabilize.",
    examples: "Russian ruble 1998–2000, Korean won 1997–1999",
    entry: "Reserves stop falling, current account improving, IMF program on track",
    timing: "6–24 months post-devaluation",
    riskLevel: "high",
  },
  {
    title: "Real Asset Distress",
    description:
      "Property and infrastructure trade at fire-sale prices when credit markets freeze. Long-duration assets with pricing power.",
    examples: "Irish property 2010–2012, Spanish REITs 2013",
    entry: "Real estate -50%+ from peak, forced selling by levered funds",
    timing: "18–48 months post-crisis",
    riskLevel: "high",
  },
  {
    title: "Restructured Sovereign Debt",
    description:
      "Post-haircut bonds trade at steep discounts but can deliver 30–100% returns as the country recovers and regains market access.",
    examples: "Argentine bonds 2005, Greek PDI bonds 2015, Ecuadorian bonds 2021",
    entry: "Spread >1500bps, restructuring complete, primary balance improving",
    timing: "Post-completion of restructuring",
    riskLevel: "extreme",
  },
];

// ── Tab 1: Crisis Anatomy ─────────────────────────────────────────────────────

function MinkyCycleChart() {
  const phases = [
    { label: "Displacement", color: "#22c55e", desc: "New opportunity: tech, policy, or asset class shift attracts capital" },
    { label: "Boom", color: "#84cc16", desc: "Credit expands, prices rise, leverage builds, optimism spreads" },
    { label: "Euphoria", color: "#eab308", desc: "Valuations extreme, speculation dominates, prudence abandoned" },
    { label: "Distress", color: "#f97316", desc: "Insiders sell, cracks appear, liquidity tightens" },
    { label: "Revulsion", color: "#ef4444", desc: "Panic selling, credit freeze, forced liquidations, contagion" },
  ];

  const W = 560;
  const H = 160;
  const padX = 60;
  const padY = 20;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  // Minsky cycle curve points (normalized 0–1)
  const curvePoints: [number, number][] = [
    [0, 0.5],
    [0.1, 0.45],
    [0.25, 0.3],
    [0.4, 0.15],
    [0.5, 0.08],
    [0.6, 0.18],
    [0.7, 0.45],
    [0.8, 0.7],
    [0.9, 0.85],
    [1.0, 0.95],
  ];

  // Build boom-bust path
  const boomPath: [number, number][] = [
    [0, 0.6],
    [0.05, 0.55],
    [0.12, 0.48],
    [0.2, 0.38],
    [0.28, 0.28],
    [0.36, 0.2],
    [0.45, 0.15],
    [0.52, 0.1],
    [0.58, 0.15],
    [0.62, 0.3],
    [0.67, 0.5],
    [0.72, 0.68],
    [0.78, 0.82],
    [0.85, 0.88],
    [0.9, 0.82],
    [0.95, 0.7],
    [1.0, 0.65],
  ];

  const toSVG = ([nx, ny]: [number, number]): [number, number] => [
    padX + nx * innerW,
    padY + ny * innerH,
  ];

  const pts = boomPath.map(toSVG);
  const d = pts
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(" ");

  // Phase vertical boundaries (x ratio)
  const phaseBounds = [0, 0.2, 0.45, 0.62, 0.78, 1.0];

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36">
        {/* Phase background strips */}
        {phases.map((ph, i) => {
          const x1 = padX + phaseBounds[i] * innerW;
          const x2 = padX + phaseBounds[i + 1] * innerW;
          return (
            <rect
              key={ph.label}
              x={x1}
              y={padY}
              width={x2 - x1}
              height={innerH}
              fill={ph.color}
              opacity={0.07}
            />
          );
        })}
        {/* Phase dividers */}
        {phaseBounds.slice(1, -1).map((bx, i) => (
          <line
            key={i}
            x1={padX + bx * innerW}
            y1={padY}
            x2={padX + bx * innerW}
            y2={padY + innerH}
            stroke="#374151"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        ))}
        {/* Curve */}
        <path d={d} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* Phase labels */}
        {phases.map((ph, i) => {
          const cx = padX + ((phaseBounds[i] + phaseBounds[i + 1]) / 2) * innerW;
          return (
            <text
              key={ph.label}
              x={cx}
              y={padY + innerH + 14}
              textAnchor="middle"
              fill={ph.color}
              fontSize={9}
              fontWeight="600"
            >
              {ph.label}
            </text>
          );
        })}
        {/* Y-axis label */}
        <text x={10} y={H / 2} fill="#6b7280" fontSize={8} textAnchor="middle" transform={`rotate(-90, 10, ${H / 2})`}>
          Asset Price
        </text>
      </svg>
      <div className="grid grid-cols-5 gap-1">
        {phases.map((ph) => (
          <div key={ph.label} className="bg-muted/50 rounded p-2">
            <div className="text-xs font-semibold mb-0.5" style={{ color: ph.color }}>
              {ph.label}
            </div>
            <div className="text-[11px] text-muted-foreground leading-tight">{ph.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrisisTimelineChart() {
  const W = 560;
  const H = 200;
  const padLeft = 120;
  const padRight = 20;
  const padTop = 16;
  const padBot = 20;
  const innerW = W - padLeft - padRight;
  const innerH = H - padTop - padBot;
  const barHeight = innerH / CRISIS_EVENTS.length - 3;
  const maxMagnitude = 90;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52">
      {/* X grid lines */}
      {[0, 25, 50, 75, 100].map((v) => {
        const x = padLeft + (v / maxMagnitude) * innerW;
        return (
          <g key={v}>
            <line x1={x} y1={padTop} x2={x} y2={padTop + innerH} stroke="#374151" strokeWidth={0.5} />
            <text x={x} y={padTop + innerH + 12} textAnchor="middle" fill="#6b7280" fontSize={8}>
              {v}%
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {CRISIS_EVENTS.map((ev, i) => {
        const y = padTop + i * (innerH / CRISIS_EVENTS.length) + 1;
        const barW = (ev.magnitude / maxMagnitude) * innerW;
        return (
          <g key={ev.name}>
            <text x={padLeft - 6} y={y + barHeight / 2 + 3} textAnchor="end" fill="#d1d5db" fontSize={9} fontWeight="600">
              {ev.year} {ev.name}
            </text>
            <rect x={padLeft} y={y} width={barW} height={barHeight} fill={ev.color} opacity={0.8} rx={2} />
            <text x={padLeft + barW + 4} y={y + barHeight / 2 + 3} fill={ev.color} fontSize={8}>
              -{ev.magnitude}% / {ev.duration}mo
            </text>
          </g>
        );
      })}
      <text x={padLeft + innerW / 2} y={padTop + innerH + 20} textAnchor="middle" fill="#6b7280" fontSize={8}>
        Peak-to-Trough Decline (%)
      </text>
    </svg>
  );
}

function CreditCycleChart() {
  const W = 500;
  const H = 120;
  const padX = 40;
  const padY = 16;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  // Credit cycle sine-ish path
  const nPts = 100;
  const creditPts: [number, number][] = Array.from({ length: nPts }, (_, i) => {
    const t = i / (nPts - 1);
    const y =
      0.5 -
      0.35 * Math.sin(t * Math.PI * 2) +
      (noiseValues[i] - 0.5) * 0.04;
    return [t, Math.max(0.05, Math.min(0.95, y))];
  });

  const toXY = ([t, y]: [number, number]): [number, number] => [
    padX + t * innerW,
    padY + y * innerH,
  ];

  const pts = creditPts.map(toXY);
  const d = pts.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(" ");

  // Area fill
  const areaD = `${d} L ${padX + innerW} ${padY + innerH} L ${padX} ${padY + innerH} Z`;

  const labels = [
    { t: 0.12, label: "Credit Boom", y: 0.15 },
    { t: 0.32, label: "Peak Lending", y: 0.05 },
    { t: 0.55, label: "Tightening", y: 0.55 },
    { t: 0.75, label: "Credit Crunch", y: 0.85 },
    { t: 0.92, label: "Recovery", y: 0.5 },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28">
      <defs>
        <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#creditGrad)" />
      <path d={d} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" />
      {labels.map((lb) => (
        <text
          key={lb.label}
          x={padX + lb.t * innerW}
          y={padY + lb.y * innerH}
          textAnchor="middle"
          fill="#a5b4fc"
          fontSize={8}
          fontWeight="600"
        >
          {lb.label}
        </text>
      ))}
      <text x={10} y={H / 2 + 3} fill="#6b7280" fontSize={7} textAnchor="middle" transform={`rotate(-90,10,${H / 2})`}>
        Credit Volume
      </text>
    </svg>
  );
}

function EarlyWarningDashboard() {
  const indicators = [
    { label: "Debt / GDP", value: 118, threshold: 100, unit: "%", status: "danger" as const },
    { label: "Current Account Balance", value: -4.2, threshold: -3, unit: "% GDP", status: "warning" as const },
    { label: "FX Reserves (Import Cover)", value: 2.1, threshold: 3, unit: "months", status: "danger" as const },
    { label: "Private Credit Growth", value: 14.5, threshold: 10, unit: "% YoY", status: "warning" as const },
    { label: "Real Estate Price / Income", value: 9.2, threshold: 7, unit: "x", status: "warning" as const },
    { label: "Short-Term External Debt / Reserves", value: 142, threshold: 100, unit: "%", status: "danger" as const },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {indicators.map((ind) => {
        const isDanger = ind.status === "danger";
        const isWarning = ind.status === "warning";
        return (
          <div
            key={ind.label}
            className={cn(
              "rounded-lg p-3 border",
              isDanger ? "border-red-500/40 bg-red-950/20" : "border-yellow-500/40 bg-yellow-950/20"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-muted-foreground font-medium">{ind.label}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] px-1.5 py-0",
                  isDanger ? "border-red-500 text-red-400" : "border-yellow-500 text-yellow-400"
                )}
              >
                {isDanger ? "ALERT" : "WATCH"}
              </Badge>
            </div>
            <div className={cn("text-lg font-bold", isDanger ? "text-red-400" : "text-yellow-400")}>
              {ind.value}
              <span className="text-xs text-muted-foreground ml-1">{ind.unit}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Threshold: {ind.threshold} {ind.unit}</div>
          </div>
        );
      })}
    </div>
  );
}

function CrisisAnatomyTab() {
  const precursors = [
    { label: "Rapid leverage buildup (household, corporate, or sovereign)", checked: true },
    { label: "Asset price inflation disconnected from fundamentals", checked: true },
    { label: "Deteriorating current account balance", checked: true },
    { label: "Banking sector fragility (NPL growth, thin capital buffers)", checked: true },
    { label: "FX reserve depletion under fixed exchange rate", checked: false },
    { label: "Maturity mismatch (short-term funding, long-term assets)", checked: true },
    { label: "Regulatory forbearance and moral hazard", checked: false },
    { label: "External shock vulnerability (commodity, rates, trade)", checked: true },
  ];

  return (
    <div className="space-y-5">
      {/* Minsky Cycle */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Minsky Cycle — 5 Phases of Financial Instability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MinkyCycleChart />
        </CardContent>
      </Card>

      {/* Crisis Timeline */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-orange-400" />
            8 Major Crises — Duration & Magnitude
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CrisisTimelineChart />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Precursors */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-yellow-400" />
              Common Crisis Precursors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {precursors.map((p) => (
                <li key={p.label} className="flex items-start gap-2">
                  <CheckCircle
                    className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", p.checked ? "text-red-400" : "text-muted-foreground")}
                  />
                  <span className="text-[11px] text-muted-foreground leading-tight">{p.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Early Warning Dashboard */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Early Warning Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EarlyWarningDashboard />
          </CardContent>
        </Card>
      </div>

      {/* Credit Cycle */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            Credit Boom-to-Bust Cycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CreditCycleChart />
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="bg-muted/50 rounded p-2">
              <div className="text-indigo-400 font-semibold mb-1">Fire Sale Dynamics</div>
              <div className="text-muted-foreground leading-tight">
                Forced selling → price drops → margin calls → more selling. Bid-ask spreads widen 10–50×. Illiquid assets repriced instantly.
              </div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-primary font-semibold mb-1">Liquidity Spiral</div>
              <div className="text-muted-foreground leading-tight">
                Asset prices fall → haircuts rise → funding shrinks → more selling → prices fall further. Amplified by leverage.
              </div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-orange-400 font-semibold mb-1">Contagion Channels</div>
              <div className="text-muted-foreground leading-tight">
                Trade links, bank balance sheets, portfolio rebalancing, FX reserves, sentiment. EM more susceptible via capital flows.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 2: Currency Crises ────────────────────────────────────────────────────

function CrisisGenerationModels() {
  const models = [
    {
      gen: "1st Generation",
      icon: "I",
      color: "#ef4444",
      title: "Fundamentals-Driven",
      economists: "Krugman (1979), Flood & Garber (1984)",
      mechanism:
        "Fiscal deficits financed by money creation erode FX reserves. Rational speculators launch a speculative attack at a predictable threshold.",
      examples: "Mexico 1973–76, Argentina 1981",
      keyInsight: "Attack timing is endogenous — speculators act just before reserves hit zero to avoid capital loss.",
    },
    {
      gen: "2nd Generation",
      icon: "II",
      color: "#f97316",
      title: "Self-Fulfilling Expectations",
      economists: "Obstfeld (1994), Eichengreen & Wyplosz",
      mechanism:
        "Multiple equilibria: a peg can survive if believed in, but collapse if not. Government weighs peg costs (unemployment) vs. benefits (credibility).",
      examples: "ERM crisis 1992, Sweden/Finland 1992",
      keyInsight: "No fundamental imbalance required. Coordination of beliefs determines outcome — Soros bet on this.",
    },
    {
      gen: "3rd Generation",
      icon: "III",
      color: "#a855f7",
      title: "Balance Sheet & Contagion",
      economists: "Krugman (1999), Chang & Velasco",
      mechanism:
        "Moral hazard in banking sector + implicit government guarantees → over-borrowing in USD. Balance sheet mismatch causes solvency crisis under devaluation.",
      examples: "Asia 1997–98, Russia 1998",
      keyInsight: "Microstructure of banking system and corporate balance sheets matter as much as macro fundamentals.",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {models.map((m) => (
        <Card key={m.gen} className="bg-card border-border">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: m.color }}
              >
                {m.icon}
              </div>
              <div>
                <div className="text-[11px] font-bold text-foreground">{m.gen}: {m.title}</div>
                <div className="text-[11px] text-muted-foreground">{m.economists}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{m.mechanism}</p>
            <div className="bg-muted rounded p-2">
              <div className="text-[11px] text-muted-foreground mb-0.5">Examples</div>
              <div className="text-xs text-muted-foreground">{m.examples}</div>
            </div>
            <div className="bg-muted/60 rounded p-2 border-l-2" style={{ borderColor: m.color }}>
              <div className="text-[11px] text-muted-foreground mb-0.5">Key Insight</div>
              <div className="text-xs text-muted-foreground leading-snug">{m.keyInsight}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CurrencyCrisisAnatomy() {
  const W = 560;
  const H = 80;
  const stages = [
    { label: "Peg Defense", sub: "Rate hikes\ninterventions", color: "#22c55e" },
    { label: "Reserve\nDepletion", sub: "Reserves fall\n<3 months cover", color: "#eab308" },
    { label: "Devaluation", sub: "Peg abandoned\ncurrency falls", color: "#f97316" },
    { label: "Contagion", sub: "Spreads to\nneighbors/EM", color: "#ef4444" },
  ];
  const stageW = (W - 40) / stages.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
      {stages.map((st, i) => {
        const x = 20 + i * stageW;
        const isLast = i === stages.length - 1;
        return (
          <g key={st.label}>
            <rect x={x} y={10} width={stageW - 8} height={50} rx={4} fill={st.color} opacity={0.15} stroke={st.color} strokeWidth={1} strokeOpacity={0.5} />
            <text x={x + (stageW - 8) / 2} y={28} textAnchor="middle" fill={st.color} fontSize={9} fontWeight="700">
              {st.label.split("\n")[0]}
            </text>
            {st.label.includes("\n") && (
              <text x={x + (stageW - 8) / 2} y={39} textAnchor="middle" fill={st.color} fontSize={9} fontWeight="700">
                {st.label.split("\n")[1]}
              </text>
            )}
            <text x={x + (stageW - 8) / 2} y={51} textAnchor="middle" fill="#9ca3af" fontSize={7.5}>
              {st.sub.split("\n")[0]}
            </text>
            <text x={x + (stageW - 8) / 2} y={61} textAnchor="middle" fill="#9ca3af" fontSize={7.5}>
              {st.sub.split("\n")[1]}
            </text>
            {!isLast && (
              <text x={x + stageW - 2} y={38} fill="#6b7280" fontSize={14}>
                →
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function FXReserveMetrics() {
  const metrics = [
    {
      rule: "Guidotti Rule",
      desc: "FX reserves ≥ total short-term external debt (1-year maturity)",
      threshold: "100% coverage",
      rationale: "Ensures economy can service all maturing external debt without rollover for 12 months",
    },
    {
      rule: "Import Cover",
      desc: "Months of imports that reserves can finance without new inflows",
      threshold: "3+ months",
      rationale: "Adequate buffer for current account imbalances; below 2 months → crisis risk",
    },
    {
      rule: "M2 Coverage",
      desc: "Reserves as % of broad money supply — limits domestic capital flight risk",
      threshold: "20–30% M2",
      rationale: "Relevant under capital controls; higher domestic savings = higher threshold needed",
    },
  ];

  return (
    <div className="space-y-2">
      {metrics.map((m) => (
        <div key={m.rule} className="bg-muted/50 rounded-lg p-3 border border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-bold text-foreground">{m.rule}</span>
            <Badge variant="outline" className="text-[11px] border-cyan-500 text-muted-foreground">{m.threshold}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-1">{m.desc}</p>
          <p className="text-xs text-muted-foreground italic">{m.rationale}</p>
        </div>
      ))}
    </div>
  );
}

function CarryUnwindExplainer() {
  const steps = [
    { step: "1", text: "Investors borrow cheap (JPY/CHF), invest in high-yield EM currencies", color: "#22c55e" },
    { step: "2", text: "Risk-off event triggers position unwind globally (simultaneous)", color: "#eab308" },
    { step: "3", text: "EM currencies sold en masse; funding currencies (JPY) soar", color: "#f97316" },
    { step: "4", text: "Margin calls force more EM selling regardless of fundamentals", color: "#ef4444" },
    { step: "5", text: "Contagion: even sound EM economies affected by positioning", color: "#a855f7" },
  ];
  return (
    <div className="space-y-1.5">
      {steps.map((s) => (
        <div key={s.step} className="flex items-start gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-black shrink-0"
            style={{ backgroundColor: s.color }}
          >
            {s.step}
          </div>
          <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">{s.text}</span>
        </div>
      ))}
    </div>
  );
}

function CurrencyCrisesTab() {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      {/* Generation Models */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            Currency Crisis Generation Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CrisisGenerationModels />
        </CardContent>
      </Card>

      {/* Anatomy SVG */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-red-400" />
            Crisis Anatomy: Peg Defense to Contagion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencyCrisisAnatomy />
        </CardContent>
      </Card>

      {/* Case Studies */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            6 Historical Case Studies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {CURRENCY_CRISES.map((cs, i) => (
              <button
                key={i}
                onClick={() => setSelectedCase(selectedCase === i ? null : i)}
                className={cn(
                  "rounded-lg p-3 border text-left transition-colors",
                  selectedCase === i
                    ? "border-indigo-500 bg-indigo-950/40"
                    : "border-border bg-muted/50 hover:border-muted-foreground"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-bold text-foreground">{cs.country}</span>
                  <span className="text-xs text-muted-foreground">{cs.year}</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <ArrowDownRight className="w-3 h-3 text-red-400" />
                  <span className="text-red-400 text-[11px] font-semibold">-{cs.depreciationPct}%</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[8px] px-1 py-0 ml-auto",
                      cs.severity === "severe" ? "border-red-500 text-red-400" :
                      cs.severity === "high" ? "border-orange-500 text-orange-400" :
                      "border-yellow-500 text-yellow-400"
                    )}
                  >
                    {cs.severity.toUpperCase()}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
          <AnimatePresence>
            {selectedCase !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="text-sm font-bold text-foreground">
                    {CURRENCY_CRISES[selectedCase].country} {CURRENCY_CRISES[selectedCase].year}
                  </div>
                  <div>
                    <span className="text-xs text-red-400 font-semibold uppercase tracking-wide">Trigger: </span>
                    <span className="text-[11px] text-muted-foreground">{CURRENCY_CRISES[selectedCase].trigger}</span>
                  </div>
                  <div>
                    <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">Response: </span>
                    <span className="text-[11px] text-muted-foreground">{CURRENCY_CRISES[selectedCase].response}</span>
                  </div>
                  <div>
                    <span className="text-xs text-green-400 font-semibold uppercase tracking-wide">Outcome: </span>
                    <span className="text-[11px] text-muted-foreground">{CURRENCY_CRISES[selectedCase].outcome}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* FX Reserve Metrics */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              FX Reserve Adequacy Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FXReserveMetrics />
          </CardContent>
        </Card>

        {/* Carry Unwind */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Carry Trade Unwind Mechanics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CarryUnwindExplainer />
            <div className="mt-3 bg-muted/50 rounded p-2">
              <div className="text-[11px] text-muted-foreground mb-1">IMF Conditionality (typical program)</div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  "Fiscal consolidation (-3–5% GDP)",
                  "Rate hikes to defend currency",
                  "State enterprise privatization",
                  "Banking sector restructuring",
                  "Capital account liberalization",
                  "Structural reforms (labor/trade)",
                ].map((c) => (
                  <div key={c} className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
                    <span className="text-[11px] text-muted-foreground">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 3: Sovereign Debt ─────────────────────────────────────────────────────

function SovereignDefaultScatter() {
  const W = 560;
  const H = 180;
  const padX = 60;
  const padY = 20;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const yearMin = 1800;
  const yearMax = 2024;
  const sizeMax = 206;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      {/* Grid */}
      {[1825, 1875, 1925, 1975, 2000, 2024].map((yr) => {
        const x = padX + ((yr - yearMin) / (yearMax - yearMin)) * innerW;
        return (
          <g key={yr}>
            <line x1={x} y1={padY} x2={x} y2={padY + innerH} stroke="#374151" strokeWidth={0.5} />
            <text x={x} y={padY + innerH + 12} textAnchor="middle" fill="#6b7280" fontSize={8}>{yr}</text>
          </g>
        );
      })}
      {/* Haircut guide lines */}
      {[0, 25, 50, 75, 100].map((h) => {
        const y = padY + (1 - h / 100) * innerH;
        return (
          <g key={h}>
            <line x1={padX} y1={y} x2={padX + innerW} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={padX - 4} y={y + 3} textAnchor="end" fill="#6b7280" fontSize={7}>{h}%</text>
          </g>
        );
      })}
      {/* Dots */}
      {SOVEREIGN_DEFAULTS.map((d, i) => {
        const x = padX + ((d.year - yearMin) / (yearMax - yearMin)) * innerW;
        const y = padY + (1 - d.haircut / 100) * innerH;
        const r = 3 + (d.defaultSize / sizeMax) * 10;
        return (
          <g key={`${d.country}-${d.year}`}>
            <circle cx={x} cy={y} r={r} fill="#ef4444" opacity={0.6} stroke="#ef4444" strokeWidth={1} />
            <text x={x} y={y - r - 2} textAnchor="middle" fill="#f87171" fontSize={7}>
              {d.country.split(" ")[0]} {d.year}
            </text>
          </g>
        );
      })}
      {/* Axis labels */}
      <text x={padX + innerW / 2} y={padY + innerH + 22} textAnchor="middle" fill="#6b7280" fontSize={8}>Year</text>
      <text x={10} y={H / 2 + 3} fill="#6b7280" fontSize={8} textAnchor="middle" transform={`rotate(-90,10,${H / 2})`}>Haircut %</text>
    </svg>
  );
}

function DebtRestructuringProcess() {
  const W = 560;
  const H = 80;
  const stages = [
    { label: "Missed Payment", color: "#ef4444" },
    { label: "Arrears Build", color: "#f97316" },
    { label: "Negotiation", color: "#eab308" },
    { label: "Haircut/Exchange", color: "#a855f7" },
    { label: "Exit Yield", color: "#22c55e" },
  ];
  const stageW = (W - 40) / stages.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
      {stages.map((st, i) => {
        const x = 20 + i * stageW;
        const isLast = i === stages.length - 1;
        return (
          <g key={st.label}>
            <rect x={x} y={10} width={stageW - 8} height={50} rx={4} fill={st.color} opacity={0.15} stroke={st.color} strokeWidth={1} strokeOpacity={0.5} />
            <text x={x + (stageW - 8) / 2} y={38} textAnchor="middle" fill={st.color} fontSize={9} fontWeight="700">
              {st.label.split(" ")[0]}
            </text>
            <text x={x + (stageW - 8) / 2} y={50} textAnchor="middle" fill={st.color} fontSize={9} fontWeight="700">
              {st.label.split(" ").slice(1).join(" ")}
            </text>
            {!isLast && (
              <text x={x + stageW - 2} y={38} fill="#6b7280" fontSize={14}>→</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function CreditorHierarchy() {
  const tiers = [
    {
      rank: "1",
      creditor: "IMF",
      type: "Preferred",
      status: "Senior — always repaid first, never takes haircuts",
      color: "#22c55e",
    },
    {
      rank: "2",
      creditor: "Paris Club (Bilateral)",
      type: "Official",
      status: "Official bilateral creditors, restructure via comparability of treatment",
      color: "#84cc16",
    },
    {
      rank: "3",
      creditor: "World Bank / MDBs",
      type: "Preferred",
      status: "Preferred creditor status, usually exempt from restructuring",
      color: "#eab308",
    },
    {
      rank: "4",
      creditor: "Private Bondholders",
      type: "Commercial",
      status: "CAC clauses bind minority holdouts after supermajority agreement",
      color: "#f97316",
    },
    {
      rank: "5",
      creditor: "Holdout Creditors",
      type: "Litigation",
      status: "Sue in NY courts (NML v Argentina). RUFO clause complicates settlement",
      color: "#ef4444",
    },
  ];

  return (
    <div className="space-y-1.5">
      {tiers.map((t) => (
        <div key={t.rank} className="flex items-start gap-3 bg-muted/40 rounded p-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
            style={{ backgroundColor: t.color }}
          >
            {t.rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-foreground">{t.creditor}</span>
              <Badge variant="outline" className="text-[8px] px-1 py-0" style={{ borderColor: t.color, color: t.color }}>
                {t.type}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{t.status}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PostDefaultRecovery() {
  const cases = [
    {
      country: "Argentina",
      year: "2001–2005",
      haircut: 70,
      recoveryYears: 4,
      gdpRecovery: 8,
      color: "#f97316",
    },
    {
      country: "Greece",
      year: "2012–2018",
      haircut: 53,
      recoveryYears: 6,
      gdpRecovery: 2,
      color: "#eab308",
    },
    {
      country: "Ecuador",
      year: "2008–2009",
      haircut: 35,
      recoveryYears: 1,
      gdpRecovery: 5,
      color: "#22c55e",
    },
  ];

  return (
    <div className="space-y-2">
      {cases.map((c) => (
        <div key={c.country} className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold text-foreground">{c.country} ({c.year})</span>
            <Badge variant="outline" className="text-[11px]" style={{ borderColor: c.color, color: c.color }}>
              {c.haircut}% haircut
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[11px] text-muted-foreground mb-1">Market Access Recovery</div>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1.5 bg-muted rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(c.recoveryYears / 8) * 100}%`, backgroundColor: c.color }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{c.recoveryYears}y</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground mb-1">Avg GDP Growth Post-Restructuring</div>
              <span className="text-[11px] font-semibold" style={{ color: c.color }}>+{c.gdpRecovery}% p.a.</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SovereignDebtTab() {
  return (
    <div className="space-y-5">
      {/* Scatter */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-red-400" />
            Sovereign Default History (1800–2024) — Bubble Size = Default Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SovereignDefaultScatter />
        </CardContent>
      </Card>

      {/* Restructuring Process */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Debt Restructuring Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DebtRestructuringProcess />
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-muted/50 rounded p-2">
              <div className="text-yellow-400 font-semibold mb-1">Brady Bonds (1989)</div>
              <div className="text-muted-foreground leading-tight">
                US Treasury-collateralized bonds exchanged for defaulted bank debt. Created liquid EM debt market. Mexico, Argentina, Brazil benefited.
              </div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-muted-foreground font-semibold mb-1">CDS as Distress Signal</div>
              <div className="text-muted-foreground leading-tight">
                Sovereign CDS spreads &gt;300bps = elevated risk. &gt;500bps = distress. &gt;1000bps = near-default. CDS basis trade: buy bonds, buy CDS for arb.
              </div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-primary font-semibold mb-1">Debt Sustainability (DSA)</div>
              <div className="text-muted-foreground leading-tight">
                IMF framework: project debt/GDP under baseline + stress scenarios. Debt sustainable if converges to benchmark without extraordinary measures.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Creditor Hierarchy */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" />
              Creditor Hierarchy & Holdouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreditorHierarchy />
            <div className="mt-2 bg-red-950/20 border border-red-500/30 rounded p-2">
              <div className="text-[11px] text-red-400 font-semibold mb-1">NML Capital vs Argentina (2012)</div>
              <div className="text-[11px] text-muted-foreground">
                Hedge fund bought defaulted bonds at 20 cents, refused 2001 restructuring. Won NY court judgment blocking all payments to other creditors until holdouts paid in full (pari passu). Argentina locked out of markets until 2016.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post-default recovery */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-green-400" />
              Post-Default Recovery Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PostDefaultRecovery />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 4: Crisis Investing ───────────────────────────────────────────────────

function CrisisBottomChart() {
  const W = 500;
  const H = 130;
  const padX = 50;
  const padY = 16;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  // Stylized crisis bottom: sharp drop then recovery
  const nPts = 80;
  const pathPts: [number, number][] = Array.from({ length: nPts }, (_, i) => {
    const t = i / (nPts - 1);
    let y: number;
    if (t < 0.35) {
      // Decline phase with noise
      y = 0.05 + t * (0.75 / 0.35) + (noiseValues[i + 20] - 0.5) * 0.05;
    } else if (t < 0.45) {
      // Bottom formation
      y = 0.78 + (noiseValues[i + 40] - 0.5) * 0.06;
    } else {
      // Recovery
      y = 0.82 - (t - 0.45) * (0.65 / 0.55) + (noiseValues[i + 60] - 0.5) * 0.04;
    }
    return [t, Math.max(0.05, Math.min(0.95, y))];
  });

  const toXY = ([t, y]: [number, number]): [number, number] => [
    padX + t * innerW,
    padY + y * innerH,
  ];

  const pts = pathPts.map(toXY);
  const d = pts.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(" ");

  // Key annotations
  const peakX = padX;
  const peakY = padY + 0.05 * innerH;
  const bottomX = padX + 0.4 * innerW;
  const bottomY = padY + 0.8 * innerH;
  const recovX = padX + innerW;
  const recovY = padY + 0.2 * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36">
      {/* Decline zone */}
      <rect x={padX} y={padY} width={0.4 * innerW} height={innerH} fill="#ef4444" opacity={0.04} />
      {/* Recovery zone */}
      <rect x={padX + 0.45 * innerW} y={padY} width={0.55 * innerW} height={innerH} fill="#22c55e" opacity={0.04} />

      {/* Path */}
      <path d={d} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" />

      {/* Annotations */}
      <circle cx={peakX} cy={peakY} r={3} fill="#22c55e" />
      <text x={peakX + 4} y={peakY - 4} fill="#22c55e" fontSize={8}>Peak</text>

      <circle cx={bottomX} cy={bottomY} r={4} fill="#ef4444" />
      <text x={bottomX} y={bottomY + 14} textAnchor="middle" fill="#ef4444" fontSize={8}>Bottom (avg -52%)</text>

      <circle cx={recovX} cy={recovY} r={3} fill="#22c55e" />
      <text x={recovX - 4} y={recovY - 4} textAnchor="end" fill="#22c55e" fontSize={8}>Recovery</text>

      {/* Avg recovery annotation */}
      <line x1={bottomX} y1={bottomY - 4} x2={recovX} y2={recovY + 4} stroke="#6b7280" strokeWidth={0.5} strokeDasharray="3 2" />
      <text x={(bottomX + recovX) / 2} y={(bottomY + recovY) / 2 - 6} textAnchor="middle" fill="#9ca3af" fontSize={7.5}>
        avg 18 months
      </text>

      {/* X axis labels */}
      <text x={padX} y={padY + innerH + 12} fill="#6b7280" fontSize={7.5}>Crisis onset</text>
      <text x={bottomX} y={padY + innerH + 12} textAnchor="middle" fill="#6b7280" fontSize={7.5}>Trough</text>
      <text x={recovX} y={padY + innerH + 12} textAnchor="end" fill="#6b7280" fontSize={7.5}>Recovery</text>

      {/* Y axis */}
      <text x={10} y={H / 2 + 3} fill="#6b7280" fontSize={8} textAnchor="middle" transform={`rotate(-90,10,${H / 2})`}>
        Index Level
      </text>
    </svg>
  );
}

function SorosCaseStudy() {
  const timeline = [
    { date: "Sep 1992", event: "Soros identifies ERM imbalance; UK unemployment high, rates can't rise to defend peg vs Germany" },
    { date: "Builds Position", event: "Quantum Fund borrows £10B in sterling, converts to DM and other European currencies" },
    { date: "Black Wednesday", event: "UK raises rates to 12% then 15% — fails to attract buyers. Markets overwhelm BoE intervention" },
    { date: "Peg Abandoned", event: "UK exits ERM, GBP falls 15%. Soros profits ~$1B on the trade in one day" },
    { date: "Legacy", event: "Demonstrated 2nd gen model: self-fulfilling attack when government commitment not credible" },
  ];

  return (
    <div className="space-y-2">
      {timeline.map((t, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-24 shrink-0">
            <span className="text-[11px] text-yellow-400 font-semibold">{t.date}</span>
          </div>
          <div className="flex-1">
            <span className="text-xs text-muted-foreground leading-snug">{t.event}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PositioningChecklist() {
  const items = [
    { action: "LONG", asset: "USD / USD cash", rationale: "Safe haven; flight to quality", color: "#22c55e" },
    { action: "SHORT", asset: "EM FX basket", rationale: "Capital outflows, reserve depletion", color: "#ef4444" },
    { action: "LONG", asset: "Gold", rationale: "Store of value, monetary chaos hedge", color: "#22c55e" },
    { action: "LONG", asset: "US Treasuries", rationale: "Risk-off rally; duration bid", color: "#22c55e" },
    { action: "SHORT", asset: "EM bank equities", rationale: "NPL surge, recapitalization risk", color: "#ef4444" },
    { action: "LONG", asset: "VIX calls / vol", rationale: "Volatility spike in early crisis", color: "#22c55e" },
    { action: "FLAT", asset: "Commodities", rationale: "Mixed — demand collapse vs supply shock", color: "#6b7280" },
    { action: "SHORT", asset: "EM sovereign spreads", rationale: "Spread widening as risk premium rises", color: "#ef4444" },
  ];

  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div key={item.asset} className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-[11px] w-12 justify-center shrink-0"
            style={{ borderColor: item.color, color: item.color }}
          >
            {item.action}
          </Badge>
          <span className="text-[11px] font-medium text-foreground w-40 shrink-0">{item.asset}</span>
          <span className="text-xs text-muted-foreground">{item.rationale}</span>
        </div>
      ))}
    </div>
  );
}

function PostCrisisSignals() {
  const signals = [
    "IMF program on track — quarterly reviews passed",
    "Current account swings to surplus (export recovery / import compression)",
    "FX reserves stabilizing and rebuilding",
    "Primary budget balance turns positive",
    "Banking sector NPLs peak and begin declining",
    "Private credit growth resumes from low base",
    "Sovereign bond spreads tighten below 400bps",
    "First Eurobond issue post-default successfully placed",
  ];

  return (
    <ul className="space-y-1.5">
      {signals.map((sig, i) => (
        <li key={i} className="flex items-start gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
          <span className="text-[11px] text-muted-foreground leading-tight">{sig}</span>
        </li>
      ))}
    </ul>
  );
}

function CrisisInvestingTab() {
  const [selectedTheme, setSelectedTheme] = useState<number | null>(null);

  const entryTriggers = [
    { metric: "Sovereign Spread", threshold: "> 1,000 bps", meaning: "Pricing in near-term default", color: "#ef4444" },
    { metric: "FX Reserves", threshold: "< 3 months imports", meaning: "BOP crisis imminent", color: "#f97316" },
    { metric: "Primary Deficit", threshold: "Worsening trend", meaning: "Fiscal unsustainability", color: "#eab308" },
    { metric: "IMF Engagement", threshold: "Article IV consultations begin", meaning: "Last resort lender engaged", color: "#a855f7" },
  ];

  return (
    <div className="space-y-5">
      {/* Bottom Timing Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            Historical Crisis Bottom Timing — Avg -52% Peak-to-Trough, 18-Month Recovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CrisisBottomChart />
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="bg-muted/50 rounded p-2 text-center">
              <div className="text-xs text-muted-foreground">Avg Decline</div>
              <div className="text-xl font-bold text-red-400">-52%</div>
            </div>
            <div className="bg-muted/50 rounded p-2 text-center">
              <div className="text-xs text-muted-foreground">Avg Recovery</div>
              <div className="text-xl font-bold text-green-400">18mo</div>
            </div>
            <div className="bg-muted/50 rounded p-2 text-center">
              <div className="text-xs text-muted-foreground">Best Entry Window</div>
              <div className="text-xl font-bold text-yellow-400">±6mo</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entry Triggers */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-yellow-400" />
            Distressed Sovereign Entry Triggers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {entryTriggers.map((t) => (
              <div key={t.metric} className="bg-muted/50 rounded-lg p-3 border border-border">
                <div className="text-xs text-muted-foreground mb-1">{t.metric}</div>
                <div className="text-[12px] font-bold mb-1" style={{ color: t.color }}>{t.threshold}</div>
                <div className="text-[11px] text-muted-foreground">{t.meaning}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Themes */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            5 Major Crisis Investment Themes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {INVESTMENT_THEMES.map((theme, i) => (
              <div key={i}>
                <button
                  onClick={() => setSelectedTheme(selectedTheme === i ? null : i)}
                  className={cn(
                    "w-full rounded-lg p-3 border text-left transition-colors",
                    selectedTheme === i
                      ? "border-indigo-500 bg-indigo-950/30"
                      : "border-border bg-muted/50 hover:border-muted-foreground"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-foreground">{theme.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px] px-1.5",
                          theme.riskLevel === "extreme"
                            ? "border-red-500 text-red-400"
                            : theme.riskLevel === "very-high"
                            ? "border-orange-500 text-orange-400"
                            : "border-yellow-500 text-yellow-400"
                        )}
                      >
                        {theme.riskLevel.toUpperCase()}
                      </Badge>
                      <span className="text-muted-foreground text-xs">{selectedTheme === i ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{theme.description}</p>
                </button>
                <AnimatePresence>
                  {selectedTheme === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-muted rounded-b-lg p-3 border-x border-b border-indigo-500/50 space-y-1.5">
                        <div>
                          <span className="text-[11px] text-primary font-semibold uppercase">Examples: </span>
                          <span className="text-xs text-muted-foreground">{theme.examples}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-green-400 font-semibold uppercase">Entry: </span>
                          <span className="text-xs text-muted-foreground">{theme.entry}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-yellow-400 font-semibold uppercase">Timing: </span>
                          <span className="text-xs text-muted-foreground">{theme.timing}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Soros Case Study */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              Soros 1992 Sterling Trade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SorosCaseStudy />
            <div className="mt-3 bg-yellow-950/20 border border-yellow-500/30 rounded p-2">
              <div className="text-[11px] text-yellow-400 font-semibold mb-1">Key Lesson</div>
              <div className="text-[11px] text-muted-foreground">
                A government commitment to a fixed rate is only credible if the underlying macro supports it.
                When unemployment was rising, the political cost of defending the peg exceeded its benefit — Soros bet on this asymmetry.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positioning Checklist */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Crisis Positioning Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <PositioningChecklist />
          </CardContent>
        </Card>
      </div>

      {/* Post-crisis recovery signals */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-green-400" />
            Post-Crisis Structural Reform Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <PostCrisisSignals />
            <div className="space-y-2">
              <div className="text-[11px] text-muted-foreground font-semibold mb-2">Recovery Framework</div>
              {[
                { phase: "Stabilization (0–6mo)", desc: "Stop the bleeding: IMF, rate hikes, austerity" },
                { phase: "Adjustment (6–18mo)", desc: "Current account improves, FX stabilizes" },
                { phase: "Reform (12–36mo)", desc: "Structural changes: banking reform, privatization" },
                { phase: "Rebound (18–48mo)", desc: "Growth returns, spreads tighten, re-rating" },
              ].map((p) => (
                <div key={p.phase} className="bg-muted/50 rounded p-2">
                  <div className="text-xs font-semibold text-indigo-400 mb-0.5">{p.phase}</div>
                  <div className="text-[11px] text-muted-foreground">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page Root ─────────────────────────────────────────────────────────────────

export default function MacroCrisisPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-950 border border-red-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Global Macro Crises</h1>
              <p className="text-[12px] text-muted-foreground">
                Anatomy of financial crises, currency crises, sovereign defaults, and crisis investing
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="anatomy">
          <TabsList className="bg-card border border-border grid grid-cols-4 w-full">
            <TabsTrigger value="anatomy" className="text-[11px] data-[state=active]:bg-muted">
              Crisis Anatomy
            </TabsTrigger>
            <TabsTrigger value="currency" className="text-[11px] data-[state=active]:bg-muted">
              Currency Crises
            </TabsTrigger>
            <TabsTrigger value="sovereign" className="text-[11px] data-[state=active]:bg-muted">
              Sovereign Debt
            </TabsTrigger>
            <TabsTrigger value="investing" className="text-[11px] data-[state=active]:bg-muted">
              Crisis Investing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anatomy" className="mt-4 data-[state=inactive]:hidden">
            <CrisisAnatomyTab />
          </TabsContent>

          <TabsContent value="currency" className="mt-4 data-[state=inactive]:hidden">
            <CurrencyCrisesTab />
          </TabsContent>

          <TabsContent value="sovereign" className="mt-4 data-[state=inactive]:hidden">
            <SovereignDebtTab />
          </TabsContent>

          <TabsContent value="investing" className="mt-4 data-[state=inactive]:hidden">
            <CrisisInvestingTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
