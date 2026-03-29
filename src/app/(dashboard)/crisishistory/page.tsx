"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Activity,
  DollarSign,
  Landmark,
  Globe,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 692002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() { s = 692002; }

// ── Types ─────────────────────────────────────────────────────────────────────
interface Crisis {
  id: string;
  year: number;
  name: string;
  shortName: string;
  severity: "extreme" | "severe" | "moderate";
  peak_loss: string;
  duration: string;
  cause: string;
  description: string;
  triggers: string[];
  lessons: string[];
  gdpImpact: string;
  color: string;
}

interface AssetPerformance {
  crisis: string;
  stocks: number;
  bonds: number;
  gold: number;
  usd: number;
  commodities: number;
  realEstate: number;
}

interface PolicyAction {
  year: number;
  tool: string;
  detail: string;
  impact: string;
  color: string;
}

// ── Crisis Data ───────────────────────────────────────────────────────────────
const CRISES: Crisis[] = [
  {
    id: "1929",
    year: 1929,
    name: "Great Depression",
    shortName: "1929",
    severity: "extreme",
    peak_loss: "-89%",
    duration: "34 months",
    cause: "Bank runs, deflation, protectionism",
    description:
      "The most severe economic contraction in modern history. The Dow Jones fell 89% from peak to trough over three years. Bank failures cascaded as depositors panicked, credit froze, and unemployment reached 25%.",
    triggers: ["Margin debt bubble", "Bank panics", "Smoot-Hawley tariffs", "Federal Reserve tightening"],
    lessons: [
      "Deposit insurance prevents bank runs",
      "Fiscal austerity worsens downturns",
      "Trade barriers amplify contractions",
      "Money supply collapse is catastrophic",
    ],
    gdpImpact: "-27%",
    color: "#ef4444",
  },
  {
    id: "1987",
    year: 1987,
    name: "Black Monday",
    shortName: "1987",
    severity: "moderate",
    peak_loss: "-22.6%",
    duration: "1 day",
    cause: "Portfolio insurance, program trading",
    description:
      "On October 19, 1987 the Dow Jones fell 22.6% in a single day — the largest one-day percentage drop in history. Portfolio insurance strategies triggered a feedback loop of forced selling that overwhelmed market makers.",
    triggers: ["Portfolio insurance sell programs", "Rising interest rates", "Trade deficit fears", "Overvalued equity markets"],
    lessons: [
      "Circuit breakers prevent cascading sell-offs",
      "Correlated hedging strategies amplify crashes",
      "Liquidity can evaporate rapidly",
      "Fast Fed response limits damage",
    ],
    gdpImpact: "-0.2%",
    color: "#f97316",
  },
  {
    id: "1997",
    year: 1997,
    name: "Asian Financial Crisis",
    shortName: "1997",
    severity: "severe",
    peak_loss: "-60%",
    duration: "18 months",
    cause: "Currency pegs, current account deficits",
    description:
      "Currency pegs in Thailand, Indonesia, and South Korea collapsed under speculative pressure. As baht fell, dollar-denominated debt became unpayable, banks failed, and contagion spread across emerging markets.",
    triggers: ["USD-pegged currencies", "Current account deficits", "Short-term USD borrowing", "Speculative attacks"],
    lessons: [
      "Fixed exchange rates create fragility",
      "FX reserve buffers matter",
      "IMF conditionality can worsen downturns",
      "Emerging markets need capital flow management",
    ],
    gdpImpact: "-13% (Thailand)",
    color: "#eab308",
  },
  {
    id: "2000",
    year: 2000,
    name: "Dot-Com Bust",
    shortName: "2000",
    severity: "severe",
    peak_loss: "-78%",
    duration: "30 months",
    cause: "Valuation bubble, speculative excess",
    description:
      "The NASDAQ fell 78% as internet companies with no earnings and astronomical valuations collapsed. The bubble was inflated by low IPO standards, media hype, and cheap money following the Long-Term Capital Management bailout.",
    triggers: ["No-earnings IPOs", "Y2K tech spending surge", "Fed tightening 1999–2000", "9/11 shock"],
    lessons: [
      "Revenue matters; eyeballs do not",
      "Cheap money inflates asset bubbles",
      "New paradigm narratives are warning signs",
      "Diversification protects non-bubble assets",
    ],
    gdpImpact: "-0.3%",
    color: "#a855f7",
  },
  {
    id: "2008",
    year: 2008,
    name: "Global Financial Crisis",
    shortName: "2008",
    severity: "extreme",
    peak_loss: "-57%",
    duration: "17 months",
    cause: "MBS/CDO fraud, excess leverage, shadow banking",
    description:
      "The worst financial crisis since 1929. Subprime mortgages were bundled into CDOs rated AAA by complicit agencies. When housing prices fell, the entire edifice of structured credit collapsed, freezing global interbank lending.",
    triggers: ["Subprime mortgage origination", "CDO/MBS securitization", "AIG credit default swaps", "Lehman Brothers failure"],
    lessons: [
      "Ratings agencies have conflicts of interest",
      "Leverage amplifies both gains and losses",
      "Systemic risk requires macroprudential regulation",
      "Too-big-to-fail creates moral hazard",
    ],
    gdpImpact: "-4.3%",
    color: "#ef4444",
  },
  {
    id: "2010",
    year: 2010,
    name: "European Debt Crisis",
    shortName: "2010",
    severity: "severe",
    peak_loss: "-38%",
    duration: "24 months",
    cause: "Sovereign debt, austerity, currency union stress",
    description:
      "Greece, Ireland, Portugal, Spain, and Italy faced sovereign debt crises as markets questioned their ability to repay. The eurozone's single currency prevented currency devaluation as a safety valve, forcing brutal internal devaluations.",
    triggers: ["Greek debt revision", "No eurozone exit mechanism", "Bank-sovereign doom loop", "ECB bond purchase limits"],
    lessons: [
      "Monetary union without fiscal union is fragile",
      "Austerity in a recession deepens the hole",
      "Central bank credibility is critical",
      "\"Whatever it takes\" can end a crisis",
    ],
    gdpImpact: "-6% (Greece)",
    color: "#3b82f6",
  },
  {
    id: "2020",
    year: 2020,
    name: "COVID-19 Crash",
    shortName: "2020",
    severity: "severe",
    peak_loss: "-34%",
    duration: "33 days",
    cause: "Pandemic demand shock, supply disruption",
    description:
      "The fastest 30%+ decline in S&P 500 history — just 33 days from peak to trough. Global lockdowns halted economic activity simultaneously. Unprecedented fiscal and monetary response triggered an equally rapid recovery.",
    triggers: ["Global pandemic lockdowns", "Oil price collapse", "USD liquidity freeze", "Travel and services collapse"],
    lessons: [
      "Exogenous shocks are unpredictable",
      "Speed of policy response matters enormously",
      "Supply chain diversification reduces fragility",
      "Market recovers faster than economy",
    ],
    gdpImpact: "-3.5%",
    color: "#06b6d4",
  },
  {
    id: "2022",
    year: 2022,
    name: "Inflation & Rate Shock",
    shortName: "2022",
    severity: "moderate",
    peak_loss: "-25%",
    duration: "12 months",
    cause: "Post-COVID inflation, Fed tightening cycle",
    description:
      "Post-pandemic supply chain disruptions combined with massive fiscal stimulus produced the highest inflation in 40 years. The Fed raised rates from 0% to 5.25% at the fastest pace since 1980, repricing all duration assets sharply.",
    triggers: ["Supply chain inflation", "Russian energy shock", "Fed 75bps hikes", "Duration risk repricing"],
    lessons: [
      "Bonds are NOT always safe in inflation",
      "60/40 portfolios fail in inflationary regimes",
      "Rate sensitivity matters at every level",
      "TINA (There Is No Alternative) ends with rates",
    ],
    gdpImpact: "-0.1%",
    color: "#f59e0b",
  },
];

// ── Asset Performance Data ────────────────────────────────────────────────────
const ASSET_PERFORMANCE: AssetPerformance[] = [
  { crisis: "1929",  stocks: -89, bonds: 12,  gold: 5,   usd: 15,  commodities: -60, realEstate: -25 },
  { crisis: "1987",  stocks: -34, bonds: 8,   gold: 3,   usd: -4,  commodities: -5,  realEstate: 2   },
  { crisis: "1997",  stocks: -50, bonds: 5,   gold: -8,  usd: 18,  commodities: -25, realEstate: -30 },
  { crisis: "2000",  stocks: -49, bonds: 22,  gold: 15,  usd: 8,   commodities: -10, realEstate: 10  },
  { crisis: "2008",  stocks: -57, bonds: 18,  gold: 25,  usd: 12,  commodities: -55, realEstate: -30 },
  { crisis: "2010",  stocks: -38, bonds: 10,  gold: 30,  usd: 5,   commodities: -15, realEstate: -10 },
  { crisis: "2020",  stocks: -34, bonds: 9,   gold: 28,  usd: 6,   commodities: -42, realEstate: 5   },
  { crisis: "2022",  stocks: -25, bonds: -18, gold: -2,  usd: 15,  commodities: 35,  realEstate: -15 },
];

// ── Policy Actions ────────────────────────────────────────────────────────────
const POLICY_ACTIONS: PolicyAction[] = [
  { year: 1933, tool: "FDIC Created",        detail: "Federal deposit insurance up to $2,500 (now $250k)", impact: "Ended bank run contagion",     color: "#3b82f6" },
  { year: 1987, tool: "Fed Liquidity Flood", detail: "Greenspan pledges open-ended repo operations",       impact: "Markets stabilized in days",  color: "#06b6d4" },
  { year: 1998, tool: "LTCM Bailout",        detail: "Fed orchestrated $3.6B private sector rescue",      impact: "Contained systemic contagion", color: "#8b5cf6" },
  { year: 2001, tool: "Rate Cuts to 1%",     detail: "Fed cut from 6.5% to 1.75% post 9/11",              impact: "Reflated economy, seeded bubble",color: "#f59e0b" },
  { year: 2008, tool: "TARP $700B",          detail: "Treasury capital injection into banks",              impact: "Recapitalized banking system",  color: "#ef4444" },
  { year: 2008, tool: "ZIRP Begins",         detail: "Fed funds rate cut to 0–0.25%",                     impact: "Decade of near-zero rates",    color: "#ef4444" },
  { year: 2009, tool: "QE1 $1.75T",          detail: "First large-scale asset purchase program",          impact: "Lowered mortgage rates",       color: "#ec4899" },
  { year: 2012, tool: "ECB \"Whatever It Takes\"", detail: "Draghi pledges unlimited bond purchases",    impact: "Ended eurozone sovereign crisis", color: "#6366f1" },
  { year: 2020, tool: "QE Unlimited",        detail: "Fed buys Treasuries, MBS, corp bonds, ETFs",        impact: "Credit markets thawed in days", color: "#06b6d4" },
  { year: 2020, tool: "CARES Act $2.2T",     detail: "Largest US fiscal stimulus in history",             impact: "Prevented demand collapse",    color: "#10b981" },
  { year: 2022, tool: "Rate Hikes 425bps",   detail: "Fastest tightening cycle since 1980",               impact: "Reduced inflation, crushed duration", color: "#f97316" },
  { year: 2023, tool: "BTFP $180B",          detail: "Bank Term Funding Program after SVB failure",       impact: "Prevented regional bank contagion", color: "#84cc16" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function severityColor(s: Crisis["severity"]) {
  return s === "extreme" ? "bg-red-500/20 text-red-400 border-red-500/30"
       : s === "severe"  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                         : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
}

function perfColor(v: number): string {
  if (v >= 20) return "#10b981";
  if (v >= 5)  return "#34d399";
  if (v >= 0)  return "#6ee7b7";
  if (v >= -10) return "#fbbf24";
  if (v >= -25) return "#f97316";
  if (v >= -50) return "#ef4444";
  return "#b91c1c";
}

function perfTextColor(v: number): string {
  if (v >= 0) return "text-emerald-400";
  if (v >= -15) return "text-yellow-400";
  if (v >= -35) return "text-orange-400";
  return "text-red-400";
}

resetSeed();

// ── Sub-components ────────────────────────────────────────────────────────────

// Timeline SVG
function CrisisTimelineSVG({
  crises,
  selectedId,
  onSelect,
}: {
  crises: Crisis[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const W = 760;
  const H = 120;
  const PAD = 40;
  const minYear = 1925;
  const maxYear = 2026;
  const yearToX = (y: number) => PAD + ((y - minYear) / (maxYear - minYear)) * (W - PAD * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* baseline */}
      <line x1={PAD} y1={60} x2={W - PAD} y2={60} stroke="#334155" strokeWidth={2} />
      {/* decade ticks */}
      {[1930,1940,1950,1960,1970,1980,1990,2000,2010,2020].map((yr) => (
        <g key={yr}>
          <line x1={yearToX(yr)} y1={55} x2={yearToX(yr)} y2={65} stroke="#475569" strokeWidth={1} />
          <text x={yearToX(yr)} y={78} textAnchor="middle" fill="#64748b" fontSize={9}>{yr}</text>
        </g>
      ))}
      {/* crisis nodes */}
      {crises.map((c) => {
        const cx = yearToX(c.year);
        const isSelected = c.id === selectedId;
        const r = isSelected ? 12 : 9;
        return (
          <g key={c.id} style={{ cursor: "pointer" }} onClick={() => onSelect(c.id)}>
            <circle cx={cx} cy={60} r={r + 4} fill={c.color} opacity={0.15} />
            <circle cx={cx} cy={60} r={r} fill={c.color} opacity={isSelected ? 1 : 0.7} stroke={isSelected ? "#fff" : "none"} strokeWidth={2} />
            <text x={cx} y={c.year % 2 === 0 ? 42 : 100} textAnchor="middle" fill={isSelected ? "#fff" : "#94a3b8"} fontSize={9} fontWeight={isSelected ? "bold" : "normal"}>
              {c.shortName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Heatmap SVG
function AssetHeatmapSVG({ data, crises }: { data: AssetPerformance[]; crises: Crisis[] }) {
  const assets = ["stocks", "bonds", "gold", "usd", "commodities", "realEstate"] as const;
  const assetLabels: Record<typeof assets[number], string> = {
    stocks: "Stocks",
    bonds: "Bonds",
    gold: "Gold",
    usd: "USD",
    commodities: "Commodities",
    realEstate: "Real Estate",
  };

  const cellW = 82;
  const cellH = 36;
  const labelW = 90;
  const headerH = 40;
  const W = labelW + assets.length * cellW + 10;
  const H = headerH + crises.length * cellH + 10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ minHeight: H }}>
      {/* col headers */}
      {assets.map((a, ai) => (
        <text key={a} x={labelW + ai * cellW + cellW / 2} y={28} textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="bold">
          {assetLabels[a]}
        </text>
      ))}
      {/* rows */}
      {data.map((row, ri) => {
        const crisis = crises.find((c) => c.id === row.crisis);
        return (
          <g key={row.crisis}>
            {/* year label */}
            <text x={labelW - 6} y={headerH + ri * cellH + cellH / 2 + 4} textAnchor="end" fill="#94a3b8" fontSize={10}>
              {crisis?.shortName ?? row.crisis}
            </text>
            {/* cells */}
            {assets.map((a, ai) => {
              const val = row[a];
              const bg = perfColor(val);
              return (
                <g key={a}>
                  <rect
                    x={labelW + ai * cellW + 2}
                    y={headerH + ri * cellH + 2}
                    width={cellW - 4}
                    height={cellH - 4}
                    rx={4}
                    fill={bg}
                    opacity={0.25}
                  />
                  <rect
                    x={labelW + ai * cellW + 2}
                    y={headerH + ri * cellH + 2}
                    width={cellW - 4}
                    height={cellH - 4}
                    rx={4}
                    fill={bg}
                    opacity={0.1}
                    stroke={bg}
                    strokeWidth={1}
                    strokeOpacity={0.4}
                  />
                  <text
                    x={labelW + ai * cellW + cellW / 2}
                    y={headerH + ri * cellH + cellH / 2 + 4}
                    textAnchor="middle"
                    fill={val >= 0 ? "#34d399" : "#f87171"}
                    fontSize={11}
                    fontWeight="bold"
                  >
                    {val > 0 ? "+" : ""}{val}%
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

// Minsky Cycle SVG
function MinskyCycleSVG() {
  const W = 600;
  const H = 260;
  const phases = [
    { label: "Displacement",  x: 60,  y: 160, desc: "New innovation or shock" },
    { label: "Boom",          x: 170, y: 110, desc: "Credit & investment surge" },
    { label: "Euphoria",      x: 300, y: 50,  desc: "Speculation, FOMO peaks" },
    { label: "Distress",      x: 430, y: 110, desc: "Insiders sell, doubts rise" },
    { label: "Revulsion",     x: 540, y: 200, desc: "Panic, fire sales, collapse" },
  ];

  // curve path through phases
  const pts = phases.map((p) => [p.x, p.y]);
  let path = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    path += ` Q ${mx} ${pts[i][1]} ${pts[i + 1][0]} ${pts[i + 1][1]}`;
  }

  const colors = ["#3b82f6","#10b981","#f59e0b","#f97316","#ef4444"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* grid lines */}
      {[50,100,150,200].map((y) => (
        <line key={y} x1={30} y1={y} x2={W - 10} y2={y} stroke="#1e293b" strokeWidth={1} />
      ))}
      {/* curve */}
      <path d={path} fill="none" stroke="#334155" strokeWidth={2} strokeDasharray="6 3" />
      {/* nodes */}
      {phases.map((p, i) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r={20} fill={colors[i]} opacity={0.2} />
          <circle cx={p.x} cy={p.y} r={10} fill={colors[i]} opacity={0.8} />
          <text x={p.x} y={p.y - 26} textAnchor="middle" fill={colors[i]} fontSize={11} fontWeight="bold">
            {p.label}
          </text>
          <text x={p.x} y={p.y + 36} textAnchor="middle" fill="#64748b" fontSize={9}>
            {p.desc}
          </text>
        </g>
      ))}
      {/* arrows */}
      {phases.slice(0, -1).map((p, i) => {
        const np = phases[i + 1];
        const dx = np.x - p.x;
        const dy = np.y - p.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = (dx / len) * 12;
        const uy = (dy / len) * 12;
        const ax = p.x + (dx / len) * (len - 14);
        const ay = p.y + (dy / len) * (len - 14);
        return (
          <line key={i} x1={p.x + ux} y1={p.y + uy} x2={ax} y2={ay} stroke="#475569" strokeWidth={1.5} markerEnd="url(#arrow)" />
        );
      })}
      <defs>
        <marker id="arrow" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
          <path d="M0,0 L0,8 L8,4 z" fill="#475569" />
        </marker>
      </defs>
    </svg>
  );
}

// GFC Transmission Diagram
function GFCDiagramSVG() {
  const W = 700;
  const H = 320;

  const nodes = [
    { id: "mortgage", x: 80,  y: 80,  label: "Subprime\nMortgages", color: "#3b82f6" },
    { id: "mbs",      x: 240, y: 80,  label: "MBS\nPackaging",      color: "#8b5cf6" },
    { id: "cdo",      x: 400, y: 80,  label: "CDO\n(AAA-Rated)",    color: "#a855f7" },
    { id: "aig",      x: 560, y: 80,  label: "AIG\nCDS Protection", color: "#ec4899" },
    { id: "housing",  x: 80,  y: 210, label: "Housing\nPrice Drop", color: "#ef4444" },
    { id: "default",  x: 240, y: 210, label: "Mortgage\nDefaults",  color: "#f97316" },
    { id: "freeze",   x: 400, y: 210, label: "Credit\nMarket Freeze",color: "#f59e0b" },
    { id: "lehman",   x: 560, y: 210, label: "Lehman\nFailure",     color: "#ef4444" },
  ];

  const edges = [
    ["mortgage","mbs"], ["mbs","cdo"], ["cdo","aig"],
    ["housing","default"], ["default","freeze"], ["freeze","lehman"],
    ["mortgage","housing"], ["mbs","default"], ["cdo","freeze"], ["aig","lehman"],
  ];

  function nodeCenter(id: string) {
    const n = nodes.find((x) => x.id === id);
    return n ? [n.x + 50, n.y + 28] : [0, 0];
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* edges */}
      {edges.map(([a, b], i) => {
        const [x1, y1] = nodeCenter(a);
        const [x2, y2] = nodeCenter(b);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth={1.5} strokeDasharray={y1 === y2 ? "none" : "4 3"} opacity={0.7} />
        );
      })}
      {/* nodes */}
      {nodes.map((n) => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width={100} height={56} rx={8} fill={n.color} opacity={0.15} stroke={n.color} strokeWidth={1} strokeOpacity={0.4} />
          {n.label.split("\n").map((line, li) => (
            <text key={li} x={n.x + 50} y={n.y + 20 + li * 16} textAnchor="middle" fill="#e2e8f0" fontSize={10} fontWeight="bold">
              {line}
            </text>
          ))}
        </g>
      ))}
      {/* row labels */}
      <text x={10} y={110} fill="#64748b" fontSize={10} transform="rotate(-90,10,110)">ORIGINATION</text>
      <text x={10} y={240} fill="#64748b" fontSize={10} transform="rotate(-90,10,240)">COLLAPSE</text>
    </svg>
  );
}

// Policy Timeline SVG
function PolicyTimelineSVG({ actions }: { actions: PolicyAction[] }) {
  const W = 740;
  const H = 260;
  const PAD = 40;
  const minY = 1930;
  const maxY = 2025;
  const yearToX = (y: number) => PAD + ((y - minY) / (maxY - minY)) * (W - PAD * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <line x1={PAD} y1={130} x2={W - PAD} y2={130} stroke="#334155" strokeWidth={2} />
      {[1940,1960,1980,2000,2020].map((yr) => (
        <g key={yr}>
          <line x1={yearToX(yr)} y1={124} x2={yearToX(yr)} y2={136} stroke="#475569" strokeWidth={1} />
          <text x={yearToX(yr)} y={148} textAnchor="middle" fill="#64748b" fontSize={9}>{yr}</text>
        </g>
      ))}
      {actions.map((a, i) => {
        const cx = yearToX(a.year);
        const above = i % 2 === 0;
        const baseY = above ? 90 : 170;
        return (
          <g key={i}>
            <line x1={cx} y1={130} x2={cx} y2={above ? 108 : 152} stroke={a.color} strokeWidth={1.5} strokeDasharray="3 2" />
            <circle cx={cx} cy={130} r={5} fill={a.color} opacity={0.8} />
            <rect x={cx - 38} y={above ? baseY - 20 : baseY} width={76} height={22} rx={4} fill={a.color} opacity={0.15} stroke={a.color} strokeWidth={0.5} strokeOpacity={0.5} />
            <text x={cx} y={above ? baseY - 5 : baseY + 14} textAnchor="middle" fill="#e2e8f0" fontSize={8} fontWeight="bold">
              {a.tool.length > 16 ? a.tool.slice(0, 14) + "…" : a.tool}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Credit Cycle Indicator chart
function CreditCycleChartSVG() {
  resetSeed();
  const W = 600;
  const H = 180;
  const PAD_L = 40;
  const PAD_R = 10;
  const PAD_T = 20;
  const PAD_B = 30;
  const pts = 80;

  // simulate a credit cycle
  const values: number[] = [];
  let phase = 0;
  for (let i = 0; i < pts; i++) {
    phase += 0.08 + rand() * 0.02;
    values.push(50 + 40 * Math.sin(phase) + (rand() - 0.5) * 8);
  }

  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const xScale = (i: number) => PAD_L + (i / (pts - 1)) * chartW;
  const yScale = (v: number) => PAD_T + chartH - ((v - 0) / 100) * chartH;

  const linePath = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`)
    .join(" ");

  const fillPath = linePath + ` L ${xScale(pts - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;

  // highlight danger zone (>80)
  const dangerPts = values
    .map((v, i) => ({ v, i }))
    .filter((p) => p.v > 75);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* grid */}
      {[25, 50, 75].map((v) => (
        <g key={v}>
          <line x1={PAD_L} y1={yScale(v)} x2={W - PAD_R} y2={yScale(v)} stroke="#1e293b" strokeWidth={1} />
          <text x={PAD_L - 6} y={yScale(v) + 4} textAnchor="end" fill="#475569" fontSize={9}>{v}</text>
        </g>
      ))}
      {/* danger zone */}
      <rect x={PAD_L} y={PAD_T} width={chartW} height={(chartH * 25) / 100} fill="#ef4444" opacity={0.05} />
      <text x={W - PAD_R - 4} y={PAD_T + 12} textAnchor="end" fill="#ef4444" fontSize={9} opacity={0.6}>Euphoria zone</text>
      {/* fill */}
      <path d={fillPath} fill="#3b82f6" opacity={0.08} />
      {/* line */}
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2} />
      {/* danger highlight dots */}
      {dangerPts.slice(0, 5).map((p) => (
        <circle key={p.i} cx={xScale(p.i)} cy={yScale(p.v)} r={3} fill="#ef4444" opacity={0.6} />
      ))}
      {/* x-axis label */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fill="#64748b" fontSize={9}>Credit Expansion Index (simulated)</text>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CrisisHistoryPage() {
  const [selectedCrisis, setSelectedCrisis] = useState<string | null>("2008");
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

  const selected = useMemo(
    () => CRISES.find((c) => c.id === selectedCrisis) ?? null,
    [selectedCrisis]
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* HERO Header */}
      <div className="mb-8 border-l-4 border-l-primary rounded-md bg-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Financial Crises: History &amp; Anatomy</h1>
            <p className="text-sm text-muted-foreground">Study the crashes, understand the patterns, avoid repeating history</p>
          </div>
        </div>
        {/* quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Crises Covered", value: "8", icon: <BookOpen className="w-3.5 h-3.5 text-muted-foreground/50" /> },
            { label: "Worst Peak Loss", value: "-89%", icon: <TrendingDown className="w-4 h-4 text-red-400" /> },
            { label: "Asset Classes", value: "6", icon: <Activity className="w-4 h-4 text-emerald-400" /> },
            { label: "Policy Tools", value: "12+", icon: <Landmark className="w-3.5 h-3.5 text-muted-foreground/50" /> },
          ].map((s) => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">{s.icon}</div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-semibold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto">
          <TabsTrigger value="timeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
            Crisis Timeline
          </TabsTrigger>
          <TabsTrigger value="gfc" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
            2008 GFC Deep Dive
          </TabsTrigger>
          <TabsTrigger value="patterns" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
            Common Patterns
          </TabsTrigger>
          <TabsTrigger value="assets" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
            Asset Behavior
          </TabsTrigger>
          <TabsTrigger value="policy" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
            Policy Response
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Crisis Timeline ─────────────────────────────────────────── */}
        <TabsContent value="timeline" className="data-[state=inactive]:hidden">
          <Card className="bg-card border-border mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
                Interactive Crisis Timeline — Click a crisis to explore
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CrisisTimelineSVG crises={CRISES} selectedId={selectedCrisis} onSelect={setSelectedCrisis} />
            </CardContent>
          </Card>

          {/* Crisis grid cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {CRISES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCrisis(c.id === selectedCrisis ? null : c.id)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  c.id === selectedCrisis
                    ? "border-muted-foreground bg-muted"
                    : "border-border bg-card hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{c.year}</span>
                  <Badge className={`text-xs text-muted-foreground px-1.5 py-0 border ${severityColor(c.severity)}`}>
                    {c.severity}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-foreground leading-tight mb-1">{c.shortName !== String(c.year) ? c.name : c.name}</p>
                <p className="text-xs text-red-400 font-medium">{c.peak_loss}</p>
                <p className="text-xs text-muted-foreground">{c.duration}</p>
              </button>
            ))}
          </div>

          {/* Expanded crisis detail */}
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-foreground">{selected.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{selected.cause}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-red-400">{selected.peak_loss}</p>
                        <p className="text-xs text-muted-foreground">peak decline</p>
                        <p className="text-xs text-muted-foreground mt-1">GDP: {selected.gdpImpact}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{selected.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-orange-400" /> Key Triggers
                        </h4>
                        <ul className="space-y-1">
                          {selected.triggers.map((t, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-orange-400 mt-0.5">•</span> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-emerald-400" /> Lessons Learned
                        </h4>
                        <ul className="space-y-1">
                          {selected.lessons.map((l, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-emerald-400 mt-0.5">•</span> {l}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ── Tab 2: 2008 GFC Deep Dive ─────────────────────────────────────── */}
        <TabsContent value="gfc" className="data-[state=inactive]:hidden space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-red-400" />
                Crisis Transmission Mechanism
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GFCDiagramSVG />
              <p className="text-xs text-muted-foreground mt-2">Top row: origination and securitization chain. Bottom row: how collapse propagated. Vertical connections show causal links.</p>
            </CardContent>
          </Card>

          {/* MBS/CDO chain explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "The MBS/CDO Machine",
                color: "text-primary",
                icon: <DollarSign className="w-3.5 h-3.5 text-muted-foreground/50" />,
                points: [
                  "Banks originated subprime loans they didn't intend to hold",
                  "Loans were pooled into Mortgage-Backed Securities (MBS)",
                  "MBS were re-sliced into Collateralized Debt Obligations (CDOs)",
                  "CDO tranches received AAA ratings despite junk underlying",
                  "AIG sold CDS protection on CDOs — unhedged $440B exposure",
                ],
              },
              {
                title: "Leverage & Shadow Banking",
                color: "text-primary",
                icon: <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/50" />,
                points: [
                  "Investment banks ran 30–40x leverage by 2007",
                  "SIVs (off-balance-sheet) held $400B in toxic assets",
                  "Money market funds held commercial paper from banks",
                  "Repo market provided overnight funding — fragile",
                  "Reserve Primary Fund 'broke the buck' Sept 2008",
                ],
              },
              {
                title: "The Lehman Moment",
                color: "text-red-400",
                icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
                points: [
                  "Lehman Brothers filed Chapter 11 on September 15, 2008",
                  "$639B in assets — largest bankruptcy in US history",
                  "Interbank lending froze within 24 hours globally",
                  "LIBOR-OIS spread spiked to 365bps (from ~10bps)",
                  "Stock markets fell 4.5% that day, then continued",
                ],
              },
              {
                title: "Policy Response",
                color: "text-emerald-400",
                icon: <Landmark className="w-4 h-4 text-emerald-400" />,
                points: [
                  "TARP: $700B bank recapitalization (Congress passed Oct 3)",
                  "Fed cut rates to 0% and launched QE1 in Nov 2008",
                  "Fannie/Freddie placed into conservatorship ($187B)",
                  "FDIC temporarily guaranteed all bank deposits",
                  "G20 coordinated global fiscal stimulus of ~$5T",
                ],
              },
            ].map((section) => (
              <Card key={section.title} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {section.icon}
                    <span className={section.color}>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {section.points.map((p, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-muted-foreground mt-0.5 shrink-0">{i + 1}.</span> {p}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Key metrics */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Crisis by the Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "S&P Peak-to-Trough", value: "-56.8%", color: "text-red-400" },
                  { label: "Jobs Lost", value: "8.7M", color: "text-orange-400" },
                  { label: "Homes Foreclosed", value: "3.8M", color: "text-yellow-400" },
                  { label: "Global Wealth Destroyed", value: "$11T", color: "text-red-400" },
                  { label: "US Fiscal Deficit Peak", value: "-10% GDP", color: "text-orange-400" },
                  { label: "LIBOR-OIS Spread", value: "365bps", color: "text-red-400" },
                  { label: "Fed Balance Sheet 2009", value: "$2.2T", color: "text-primary" },
                  { label: "Recovery to Prior Peak", value: "5.5 years", color: "text-emerald-400" },
                ].map((m) => (
                  <div key={m.label} className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                    <p className={`text-lg font-medium ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Common Patterns ─────────────────────────────────────────── */}
        <TabsContent value="patterns" className="data-[state=inactive]:hidden space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
                Kindleberger–Minsky Anatomy of a Financial Crisis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MinskyCycleSVG />
              <p className="text-xs text-muted-foreground mt-2">Every speculative boom follows this five-phase pattern. The Minsky Moment is the sudden transition from Euphoria to Distress when leveraged positions cannot be rolled.</p>
            </CardContent>
          </Card>

          {/* Phase detail cards */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { phase: "1. Displacement", color: "border-primary/40 bg-muted/5", tc: "text-primary",
                desc: "An exogenous shock creates new profit opportunities: a new technology, deregulation, war, or policy shift.",
                examples: ["Internet (1995)", "Low rates (2001)", "Financial innovation (2004)", "COVID stimulus (2020)"] },
              { phase: "2. Boom", color: "border-emerald-500/40 bg-emerald-500/5", tc: "text-emerald-400",
                desc: "Credit expands to finance new investments. Asset prices rise. Early entrants profit, attracting imitators.",
                examples: ["Mortgage origination ↑", "IPO volumes surge", "Commodity supercycles", "Crypto mining farms"] },
              { phase: "3. Euphoria", color: "border-yellow-500/40 bg-yellow-500/5", tc: "text-yellow-400",
                desc: "\"This time is different.\" Valuations detach from fundamentals. Leverage peaks. Fraud increases. Media coverage maximizes.",
                examples: ["P/E > 40×", "Zero-earnings IPOs", "NINJA loans", "NFT PFPs at $500k"] },
              { phase: "4. Distress", color: "border-orange-500/40 bg-orange-500/5", tc: "text-orange-400",
                desc: "Insiders sell. A prominent firm fails. Credit conditions tighten. Refinancing becomes difficult. Doubt spreads.",
                examples: ["Bear Stearns 2007", "Enron 2001", "Thai baht 1997", "Celsius Network 2022"] },
              { phase: "5. Revulsion", color: "border-red-500/40 bg-red-500/5", tc: "text-red-400",
                desc: "Panic selling. Liquidity evaporates. Fire sales. Contagion spreads to unrelated assets. Margin calls cascade.",
                examples: ["Lehman 2008", "LTCM 1998", "SVB 2023", "March 2020"] },
            ].map((p) => (
              <div key={p.phase} className={`rounded-lg border p-3 ${p.color}`}>
                <p className={`text-xs text-muted-foreground font-medium mb-2 ${p.tc}`}>{p.phase}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{p.desc}</p>
                <div className="space-y-1">
                  {p.examples.map((ex, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {ex}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Credit cycle */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Credit Expansion Index — Simulated Cycle</CardTitle>
            </CardHeader>
            <CardContent>
              <CreditCycleChartSVG />
            </CardContent>
          </Card>

          {/* Warning indicators */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Early Warning Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { category: "Credit Signals", color: "text-red-400", items: [
                    "Rapid credit growth (>15% YoY)",
                    "Loan-to-income ratios at highs",
                    "Credit spreads near cycle lows",
                    "Covenant-lite loan share rising",
                    "CDS on banks tightening → then widening",
                  ]},
                  { category: "Market Signals", color: "text-orange-400", items: [
                    "P/E ratios > 2 SD above mean",
                    "Low VIX + high margin debt",
                    "IPO volume at multi-year highs",
                    "Investor surveys at extreme bullish",
                    "Yield curve inversion",
                  ]},
                  { category: "Macro Signals", color: "text-yellow-400", items: [
                    "Real estate prices > 30% above trend",
                    "Current account deficit widening",
                    "FX reserves falling rapidly",
                    "Core inflation persistently above target",
                    "M2 growth far above nominal GDP",
                  ]},
                ].map((cat) => (
                  <div key={cat.category}>
                    <p className={`text-xs text-muted-foreground font-medium mb-2 ${cat.color}`}>{cat.category}</p>
                    <ul className="space-y-1">
                      {cat.items.map((item, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-muted-foreground mt-0.5">▸</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Asset Behavior ──────────────────────────────────────────── */}
        <TabsContent value="assets" className="data-[state=inactive]:hidden space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-3.5 h-3.5 text-muted-foreground/50" />
                Asset Class Performance During Crises — Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <AssetHeatmapSVG data={ASSET_PERFORMANCE} crises={CRISES} />
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {[
                  { label: "+20%+",  color: "#10b981" },
                  { label: "+5–20%", color: "#34d399" },
                  { label: "0–5%",   color: "#6ee7b7" },
                  { label: "-10–0%", color: "#fbbf24" },
                  { label: "-25–-10%", color: "#f97316" },
                  { label: "-50–-25%", color: "#ef4444" },
                  { label: "<-50%",  color: "#b91c1c" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: l.color, opacity: 0.6 }} />
                    <span className="text-xs text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Asset class behavior explanations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { asset: "Equities", icon: <TrendingDown className="w-4 h-4 text-red-400" />, tc: "text-red-400",
                summary: "Perform worst in almost every crisis. High beta to economic growth and risk sentiment.",
                exception: "2022: fell ~25% but not catastrophic due to strong earnings backdrop.",
                rule: "Buy equities when fear peaks (VIX > 40), not when complacency is high (VIX < 12)." },
              { asset: "Government Bonds", icon: <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />, tc: "text-primary",
                summary: "Usually a flight-to-safety asset. Perform well in deflationary crises as yields fall.",
                exception: "2022: bonds fell 18% — worst year since 1788 — as inflation forced rate hikes.",
                rule: "Bonds provide crisis diversification ONLY in deflationary, not inflationary, crises." },
              { asset: "Gold", icon: <DollarSign className="w-4 h-4 text-yellow-400" />, tc: "text-yellow-400",
                summary: "Reliable store of value in financial system stress. Outperforms in prolonged downturns.",
                exception: "1997 Asian crisis: gold fell slightly as USD strengthened and EM demand dropped.",
                rule: "Gold shines most when real interest rates are negative and central banks expand balance sheets." },
              { asset: "USD", icon: <Globe className="w-4 h-4 text-emerald-400" />, tc: "text-emerald-400",
                summary: "World reserve currency gains in risk-off episodes as global USD funding demand spikes.",
                exception: "1987 crash: USD actually weakened due to Plaza Accord trade imbalance concerns.",
                rule: "USD strength in crises can worsen emerging market debt burdens (USD-denominated liabilities)." },
              { asset: "Commodities", icon: <TrendingDown className="w-4 h-4 text-orange-400" />, tc: "text-orange-400",
                summary: "Highly cyclical, tend to fall sharply in demand downturns (recession fears).",
                exception: "2022: commodities surged +35% due to Russia–Ukraine supply shock — unique macro regime.",
                rule: "In supply-shock-driven crises, commodities can be inflationary even as financial assets crash." },
              { asset: "Real Estate", icon: <Landmark className="w-3.5 h-3.5 text-muted-foreground/50" />, tc: "text-primary",
                summary: "Highly leveraged, illiquid, and slow to reprice — often the cause or victim of crises.",
                exception: "2020: residential real estate rose due to stimulus and work-from-home demand shift.",
                rule: "Watch price-to-rent ratios and mortgage credit conditions as leading indicators." },
            ].map((a) => (
              <Card key={a.asset} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {a.icon}
                    <span className={a.tc}>{a.asset}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{a.summary}</p>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2">
                    <p className="text-xs text-amber-400 font-semibold mb-0.5">Notable Exception</p>
                    <p className="text-xs text-muted-foreground">{a.exception}</p>
                  </div>
                  <div className="bg-muted/10 border border-border rounded p-2">
                    <p className="text-xs text-primary font-semibold mb-0.5">Investor Rule</p>
                    <p className="text-xs text-muted-foreground">{a.rule}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Portfolio lesson */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Portfolio Construction for Crisis Resilience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { strategy: "All-Weather Portfolio", desc: "Ray Dalio's approach: 30% stocks, 40% LT bonds, 15% IT bonds, 7.5% gold, 7.5% commodities. Designed to perform in all economic regimes (growth/inflation combos).", drawdown: "~12% in 2008" },
                  { strategy: "Crisis Alpha", desc: "Long volatility strategies (VIX calls, tail-risk hedges) and trend-following CTAs that go short during trending downturns. Expensive in calm markets but invaluable in crashes.", drawdown: "+40–80% in 2008" },
                  { strategy: "Barbell Approach", desc: "Taleb's approach: 90% ultra-safe assets (T-bills, gold) + 10% high-risk/reward bets. Limits downside to 10% while retaining large upside from convex positions.", drawdown: "Capped ~10%" },
                ].map((s) => (
                  <div key={s.strategy} className="bg-muted rounded-lg p-3">
                    <p className="text-xs font-medium text-foreground mb-1">{s.strategy}</p>
                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{s.desc}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">2008 drawdown:</span>
                      <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-1.5 py-0 border">{s.drawdown}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 5: Policy Response ─────────────────────────────────────────── */}
        <TabsContent value="policy" className="data-[state=inactive]:hidden space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5 text-muted-foreground/50" />
                Fed Policy Tools — Historical Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PolicyTimelineSVG actions={POLICY_ACTIONS} />
            </CardContent>
          </Card>

          {/* Fed tools evolution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Federal Reserve Toolkit Evolution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { era: "Pre-2008 (Traditional)", color: "text-primary", tools: [
                      "Federal funds rate target",
                      "Discount window lending",
                      "Reserve requirements",
                      "Open market operations (OMO)",
                    ]},
                    { era: "2008–2015 (GFC Innovation)", color: "text-primary", tools: [
                      "Zero Interest Rate Policy (ZIRP)",
                      "Quantitative Easing (QE1–QE3) — $3.5T",
                      "Forward guidance on rates",
                      "Emergency facilities (CPFF, MMIFF, PDCF)",
                    ]},
                    { era: "2020+ (COVID/SVB Era)", color: "text-emerald-400", tools: [
                      "Unlimited QE pledges",
                      "Main Street Lending Program",
                      "Corporate bond ETF purchases",
                      "Bank Term Funding Program (BTFP)",
                    ]},
                  ].map((era) => (
                    <div key={era.era} className="bg-muted rounded-lg p-3">
                      <p className={`text-xs text-muted-foreground font-medium mb-2 ${era.color}`}>{era.era}</p>
                      <ul className="space-y-1">
                        {era.tools.map((t, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-muted-foreground">▸</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Fiscal Stimulus Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { crisis: "1929 Great Depression", response: "Hoover: fiscal austerity, raised taxes. FDR: New Deal $50B (6% GDP). Result: prolonged depression, recovery only post-WWII.", outcome: "Poor", color: "text-red-400" },
                    { crisis: "2008 GFC", response: "TARP $700B + ARRA stimulus $787B + Fed QE $1.75T. Coordinated G20 stimulus ~$5T globally. Result: recession ended after 18 months.", outcome: "Moderate", color: "text-yellow-400" },
                    { crisis: "2020 COVID", response: "CARES Act $2.2T + ARPA $1.9T + PPP $800B. Total US fiscal ~$6T. Fed balance sheet: $4T → $9T. Result: fastest recovery on record.", outcome: "Strong", color: "text-emerald-400" },
                    { crisis: "2022 Inflation", response: "Rapid Fed rate hikes: 0% → 5.25% in 16 months. Simultaneous QT. IRA/CHIPS Acts as supply-side response. Result: inflation down without recession.", outcome: "Effective", color: "text-primary" },
                  ].map((row) => (
                    <div key={row.crisis} className="bg-muted rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-muted-foreground">{row.crisis}</p>
                        <Badge className={`text-xs text-muted-foreground px-1.5 py-0 border border-border bg-muted/50 ${row.color}`}>{row.outcome}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{row.response}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Policy lessons & debates */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Key Policy Debates &amp; Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { q: "Does QE cause inflation?", a: "QE 2009–2019 did NOT cause consumer inflation — banks hoarded reserves. QE 2020 combined with fiscal transfers DID inflate, proving the transmission mechanism matters as much as the size." },
                  { q: "Is Too-Big-To-Fail still a problem?", a: "Post-Dodd-Frank capital ratios improved, but systemically important banks are larger than in 2008. The implicit government guarantee persists, creating moral hazard in risk-taking." },
                  { q: "Can central banks fight every crisis?", a: "Monetary policy is effective against liquidity crises (1987, 2020). It is less effective against solvency crises (1929, 2008) where fiscal backstops are required. The ZLB limits conventional tools." },
                  { q: "Is austerity ever the right answer?", a: "The IMF's own research (2010–2013) found that fiscal multipliers during recessions are >1, meaning austerity worsens downturns. Exception: countries facing currency crises (Greece 2010) where credibility requires demonstration of fiscal discipline." },
                  { q: "What causes the next crisis?", a: "By definition, systemic risk builds in the least regulated sector (shadow banking 2008, crypto 2022, AI finance possibly next). Watch wherever leverage is highest and regulation lowest." },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setExpandedLesson(expandedLesson === i ? null : i)}
                    className="w-full text-left bg-muted rounded-lg p-3 hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">{item.q}</p>
                      {expandedLesson === i
                        ? <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                        : <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                      }
                    </div>
                    <AnimatePresence>
                      {expandedLesson === i && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="text-xs text-muted-foreground mt-2 leading-relaxed overflow-hidden"
                        >
                          {item.a}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Central bank balance sheet comparison */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Central Bank Balance Sheet Expansion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { cb: "Federal Reserve", pre: "~$900B (2008)", post: "~$9T (2022 peak)", ratio: 10, color: "#3b82f6" },
                  { cb: "European Central Bank", pre: "~€1.5T (2008)", post: "~€9T (2022 peak)", ratio: 6, color: "#6366f1" },
                  { cb: "Bank of Japan", pre: "~¥115T (2012)", post: "~¥740T (2023)", ratio: 6.4, color: "#ec4899" },
                  { cb: "Bank of England", pre: "~£90B (2008)", post: "~£960B (2022 peak)", ratio: 10.7, color: "#8b5cf6" },
                ].map((row) => (
                  <div key={row.cb}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{row.cb}</span>
                      <span className="text-xs text-muted-foreground">{row.pre} → {row.post}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((row.ratio / 12) * 100, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: row.color, opacity: 0.7 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{row.ratio}× expansion</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
