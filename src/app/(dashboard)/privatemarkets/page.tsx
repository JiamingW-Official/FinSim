"use client";

import { useState, useMemo, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Building2,
  Layers,
  Activity,
  BookOpen,
  Target,
  Percent,
  Info,
  Lock,
  Unlock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 77;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Reset seed helper
function resetSeed(seed: number = 77) {
  s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface PEFund {
  name: string;
  type: "Buyout" | "Growth" | "Venture" | "Distressed";
  vintage: number;
  irr: number;
  tvpi: number;
  dpi: number;
  rvpi: number;
  size: number; // $B
  status: "Harvesting" | "Investing" | "Closed";
}

interface HFStrategy {
  name: string;
  annualReturn: number;
  volatility: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  maxDD: number;
  aum: number; // $B
  corr: number; // corr to S&P 500
}

// ── Static Data ────────────────────────────────────────────────────────────────

const PE_FUNDS: PEFund[] = [
  {
    name: "Blackstone Capital IV",
    type: "Buyout",
    vintage: 2018,
    irr: 24.3,
    tvpi: 2.1,
    dpi: 1.4,
    rvpi: 0.7,
    size: 26,
    status: "Harvesting",
  },
  {
    name: "Vista Equity VII",
    type: "Buyout",
    vintage: 2019,
    irr: 19.8,
    tvpi: 1.8,
    dpi: 0.9,
    rvpi: 0.9,
    size: 16,
    status: "Investing",
  },
  {
    name: "General Atlantic XI",
    type: "Growth",
    vintage: 2020,
    irr: 28.1,
    tvpi: 1.9,
    dpi: 0.4,
    rvpi: 1.5,
    size: 7.8,
    status: "Investing",
  },
  {
    name: "Sequoia Global Growth III",
    type: "Growth",
    vintage: 2021,
    irr: 15.2,
    tvpi: 1.3,
    dpi: 0.1,
    rvpi: 1.2,
    size: 8.0,
    status: "Investing",
  },
  {
    name: "Andreessen Horowitz IX",
    type: "Venture",
    vintage: 2019,
    irr: 44.7,
    tvpi: 3.2,
    dpi: 0.8,
    rvpi: 2.4,
    size: 2.9,
    status: "Investing",
  },
  {
    name: "Lightspeed Venture XII",
    type: "Venture",
    vintage: 2020,
    irr: 31.5,
    tvpi: 2.1,
    dpi: 0.2,
    rvpi: 1.9,
    size: 4.0,
    status: "Investing",
  },
  {
    name: "Oaktree Opportunities XI",
    type: "Distressed",
    vintage: 2020,
    irr: 17.6,
    tvpi: 1.6,
    dpi: 1.1,
    rvpi: 0.5,
    size: 15.9,
    status: "Harvesting",
  },
  {
    name: "Apollo Hybrid Value II",
    type: "Distressed",
    vintage: 2021,
    irr: 14.2,
    tvpi: 1.3,
    dpi: 0.3,
    rvpi: 1.0,
    size: 5.5,
    status: "Investing",
  },
];

const HF_STRATEGIES: HFStrategy[] = [
  {
    name: "Long/Short Equity",
    annualReturn: 12.4,
    volatility: 9.8,
    sharpe: 1.27,
    sortino: 1.82,
    calmar: 0.94,
    maxDD: -13.2,
    aum: 890,
    corr: 0.62,
  },
  {
    name: "Global Macro",
    annualReturn: 9.1,
    volatility: 7.2,
    sharpe: 1.26,
    sortino: 1.71,
    calmar: 0.88,
    maxDD: -10.3,
    aum: 620,
    corr: 0.21,
  },
  {
    name: "Event Driven",
    annualReturn: 10.8,
    volatility: 8.1,
    sharpe: 1.33,
    sortino: 1.92,
    calmar: 1.02,
    maxDD: -10.6,
    aum: 340,
    corr: 0.55,
  },
  {
    name: "Relative Value",
    annualReturn: 8.3,
    volatility: 4.9,
    sharpe: 1.69,
    sortino: 2.31,
    calmar: 1.45,
    maxDD: -5.7,
    aum: 280,
    corr: 0.18,
  },
  {
    name: "Managed Futures",
    annualReturn: 7.6,
    volatility: 10.3,
    sharpe: 0.74,
    sortino: 1.12,
    calmar: 0.62,
    maxDD: -12.2,
    aum: 420,
    corr: -0.15,
  },
  {
    name: "Distressed Debt",
    annualReturn: 11.9,
    volatility: 8.7,
    sharpe: 1.37,
    sortino: 1.98,
    calmar: 1.09,
    maxDD: -10.9,
    aum: 190,
    corr: 0.47,
  },
  {
    name: "Merger Arbitrage",
    annualReturn: 6.2,
    volatility: 4.1,
    sharpe: 1.51,
    sortino: 2.08,
    calmar: 1.28,
    maxDD: -4.8,
    aum: 125,
    corr: 0.32,
  },
  {
    name: "Multi-Strategy",
    annualReturn: 11.3,
    volatility: 6.8,
    sharpe: 1.66,
    sortino: 2.24,
    calmar: 1.31,
    maxDD: -8.6,
    aum: 760,
    corr: 0.44,
  },
  {
    name: "Quant Equity",
    annualReturn: 13.7,
    volatility: 11.2,
    sharpe: 1.22,
    sortino: 1.76,
    calmar: 0.98,
    maxDD: -14.0,
    aum: 510,
    corr: 0.71,
  },
  {
    name: "Fixed Income RV",
    annualReturn: 7.4,
    volatility: 3.8,
    sharpe: 1.95,
    sortino: 2.67,
    calmar: 1.76,
    maxDD: -4.2,
    aum: 380,
    corr: 0.09,
  },
];

const VINTAGE_YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
const FUND_TYPES = ["Buyout", "Growth", "Venture", "Distressed"] as const;

// Vintage heatmap data: median IRR by vintage × fund type
const VINTAGE_IRR: Record<string, Record<string, number>> = {
  "2015": { Buyout: 22.4, Growth: 18.9, Venture: 31.2, Distressed: 15.6 },
  "2016": { Buyout: 19.8, Growth: 21.3, Venture: 27.8, Distressed: 13.2 },
  "2017": { Buyout: 18.1, Growth: 23.7, Venture: 35.4, Distressed: 12.8 },
  "2018": { Buyout: 21.5, Growth: 25.1, Venture: 42.1, Distressed: 16.9 },
  "2019": { Buyout: 17.3, Growth: 19.8, Venture: 38.7, Distressed: 18.4 },
  "2020": { Buyout: 24.8, Growth: 29.4, Venture: 51.3, Distressed: 22.1 },
  "2021": { Buyout: 12.9, Growth: 14.2, Venture: 18.6, Distressed: 11.3 },
  "2022": { Buyout: 9.4, Growth: 8.7, Venture: 6.2, Distressed: 14.8 },
  "2023": { Buyout: 11.2, Growth: 12.9, Venture: 9.8, Distressed: 13.1 },
};

const VC_SECTORS = [
  { name: "AI / ML", deals: 2847, medianVal: 28.4, yoyGrowth: 94.2 },
  { name: "Fintech", deals: 1923, medianVal: 18.6, yoyGrowth: 12.3 },
  { name: "HealthTech", deals: 1654, medianVal: 15.2, yoyGrowth: 28.7 },
  { name: "Climate Tech", deals: 1398, medianVal: 22.1, yoyGrowth: 41.8 },
  { name: "SaaS / B2B", deals: 3241, medianVal: 12.8, yoyGrowth: 8.4 },
  { name: "Cybersecurity", deals: 892, medianVal: 19.7, yoyGrowth: 33.1 },
];

const DD_CATEGORIES = [
  {
    category: "Team & Management",
    icon: "team",
    items: [
      "Track record of key principals (deal-by-deal analysis)",
      "Team stability — tenure, turnover, succession planning",
      "Investment committee composition and decision-making",
      "Key person risk: concentration in 1-2 individuals",
      "Compensation structure: alignment with LP interests",
    ],
    redFlags: [
      "High turnover of senior investment professionals",
      "First-time fund without institutional backing",
      "Undisclosed regulatory actions or litigation",
      "Founder-led with no succession plan",
    ],
  },
  {
    category: "Investment Strategy",
    icon: "strategy",
    items: [
      "Strategy consistency vs. historical deployment",
      "Target market size and competitive differentiation",
      "Deal sourcing: proprietary vs. auction — win rate data",
      "Portfolio concentration limits (sector, geography, stage)",
      "Exit strategy: IPO vs. M&A vs. secondary — historical DPI",
    ],
    redFlags: [
      "Style drift from stated mandate",
      "Over-reliance on one sector or geography",
      "No clear value-add beyond capital provision",
      "Weak exit track record or low DPI in mature funds",
    ],
  },
  {
    category: "Operational Infrastructure",
    icon: "ops",
    items: [
      "Back-office: fund administration, NAV calculation frequency",
      "Compliance: SEC registration, ADV filing, MNPI controls",
      "Technology stack: CRM, portfolio monitoring, reporting tools",
      "Cybersecurity: SOC 2 certification, data policies",
      "Third-party service providers: auditor, legal counsel, prime broker",
    ],
    redFlags: [
      "Self-administration with no independent NAV",
      "Auditor is small/local firm",
      "No formal compliance officer",
      "Weak cybersecurity controls",
    ],
  },
  {
    category: "Legal & Structural",
    icon: "legal",
    items: [
      "Fund domicile: Delaware LP, Cayman, Luxembourg SICAV",
      "LP protections: LPAC, removal rights, key-man provisions",
      "Fee terms: management fee base, carry %, hurdle rate, clawback",
      "Most Favored Nation (MFN) provisions",
      "Side letters: disclosure obligations to other LPs",
    ],
    redFlags: [
      "No LPAC or governance rights for LPs",
      "No clawback provision or escrow",
      "Offshore structures without clear tax pass-through",
      "Unusual or one-sided side letters",
    ],
  },
  {
    category: "ESG & Sustainability",
    icon: "esg",
    items: [
      "ESG policy: signatory to UNPRI, ILPA ESG framework",
      "Portfolio monitoring: carbon footprint, D&I metrics",
      "Exclusion list: weapons, tobacco, controversial sectors",
      "Reporting: TCFD, SASB, SFDR Article 8/9 classification",
      "Engagement: voting rights, board composition practices",
    ],
    redFlags: [
      "No formal ESG policy or reporting",
      "Investments in excluded sectors without waiver",
      "No board diversity requirements",
      "Greenwashing: ESG claims without verifiable data",
    ],
  },
];

const FUND_DOCS = [
  { name: "DDQ (Due Diligence Questionnaire)", required: true, received: true },
  { name: "PPM (Private Placement Memorandum)", required: true, received: true },
  { name: "LPA (Limited Partnership Agreement)", required: true, received: false },
  { name: "Subscription Agreement", required: true, received: false },
  { name: "Financial Audits (3 years)", required: true, received: true },
  { name: "ADV Part 2 / Form PF", required: true, received: true },
  { name: "Compliance Manual", required: false, received: false },
  { name: "Reference Letters", required: false, received: true },
  { name: "Investor Presentation / Pitchbook", required: true, received: true },
  { name: "Key Person Agreement", required: false, received: false },
];

// ── IRR Calculator (Newton's Method) ──────────────────────────────────────────

function computeIRR(cashFlows: number[]): number | null {
  if (cashFlows.length < 2) return null;
  let rate = 0.1;
  for (let iter = 0; iter < 100; iter++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denom;
      dnpv -= (t * cashFlows[t]) / ((1 + rate) * denom);
    }
    if (Math.abs(dnpv) < 1e-12) break;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < 1e-8) return newRate * 100;
    rate = newRate;
  }
  return rate * 100;
}

// ── Color Helpers ─────────────────────────────────────────────────────────────

function irrColor(irr: number): string {
  if (irr >= 30) return "#22c55e";
  if (irr >= 20) return "#84cc16";
  if (irr >= 15) return "#eab308";
  if (irr >= 10) return "#f97316";
  return "#ef4444";
}

function irrBg(irr: number): string {
  if (irr >= 30) return "rgba(34,197,94,0.25)";
  if (irr >= 20) return "rgba(132,204,22,0.2)";
  if (irr >= 15) return "rgba(234,179,8,0.18)";
  if (irr >= 10) return "rgba(249,115,22,0.18)";
  return "rgba(239,68,68,0.18)";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  color = "default",
}: {
  label: string;
  value: string;
  color?: "green" | "red" | "amber" | "blue" | "default";
}) {
  const cls = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    default: "bg-muted text-muted-foreground border-border",
  }[color];
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-center", cls)}>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

// ── Section 1: Private Equity ─────────────────────────────────────────────────

function JCurveSVG() {
  const W = 560;
  const H = 200;
  const PAD = { t: 16, r: 16, b: 36, l: 50 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  // J-curve points: years 0-10, value in $M
  const points: [number, number][] = [
    [0, 0],
    [1, -8],
    [2, -14],
    [3, -18],
    [4, -10],
    [5, 0],
    [6, 18],
    [7, 42],
    [8, 68],
    [9, 95],
    [10, 128],
  ];

  const minY = -20;
  const maxY = 135;
  const rangeY = maxY - minY;
  const maxX = 10;

  const toSvg = (x: number, y: number) => ({
    sx: PAD.l + (x / maxX) * iW,
    sy: PAD.t + ((maxY - y) / rangeY) * iH,
  });

  const pathD = points
    .map(([x, y], i) => {
      const { sx, sy } = toSvg(x, y);
      return i === 0 ? `M ${sx} ${sy}` : `L ${sx} ${sy}`;
    })
    .join(" ");

  const zeroY = toSvg(0, 0).sy;

  // Area above zero (positive)
  const abovePoints = points.filter(([, y]) => y >= 0);
  const belowPoints = points.filter(([, y]) => y <= 0);

  // Build fill paths
  const posFill = (() => {
    const pts = points;
    let d = "";
    let started = false;
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      const { sx, sy } = toSvg(x, y);
      if (y >= 0) {
        if (!started) {
          d += `M ${sx} ${zeroY} L ${sx} ${sy}`;
          started = true;
        } else {
          d += ` L ${sx} ${sy}`;
        }
      } else if (started) {
        d += ` L ${sx} ${zeroY} Z`;
        started = false;
      }
    }
    if (started) {
      const { sx } = toSvg(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      d += ` L ${sx} ${zeroY} Z`;
    }
    return d;
  })();

  const negFill = (() => {
    let d = "";
    let started = false;
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];
      const { sx, sy } = toSvg(x, y);
      if (y <= 0) {
        if (!started) {
          d += `M ${sx} ${zeroY} L ${sx} ${sy}`;
          started = true;
        } else {
          d += ` L ${sx} ${sy}`;
        }
      } else if (started) {
        d += ` L ${sx} ${zeroY} Z`;
        started = false;
      }
    }
    if (started) {
      const { sx } = toSvg(points[points.length - 1][0], 0);
      d += ` L ${sx} ${zeroY} Z`;
    }
    return d;
  })();

  // Y axis labels
  const yTicks = [-15, 0, 30, 60, 90, 120];
  // X axis labels
  const xTicks = [0, 2, 4, 6, 8, 10];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      <defs>
        <linearGradient id="jcurve-pos" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="jcurve-neg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((y) => {
        const sy = toSvg(0, y).sy;
        return (
          <g key={y}>
            <line
              x1={PAD.l}
              y1={sy}
              x2={W - PAD.r}
              y2={sy}
              stroke={y === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.06)"}
              strokeWidth={y === 0 ? 1.5 : 1}
              strokeDasharray={y === 0 ? "none" : "3,3"}
            />
            <text
              x={PAD.l - 6}
              y={sy + 4}
              textAnchor="end"
              fontSize={9}
              fill="rgba(255,255,255,0.4)"
            >
              {y >= 0 ? `$${y}M` : `-$${Math.abs(y)}M`}
            </text>
          </g>
        );
      })}

      {/* Fill areas */}
      <path d={posFill} fill="url(#jcurve-pos)" />
      <path d={negFill} fill="url(#jcurve-neg)" />

      {/* Main curve */}
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" />

      {/* Data points */}
      {points.map(([x, y]) => {
        const { sx, sy } = toSvg(x, y);
        return (
          <circle
            key={x}
            cx={sx}
            cy={sy}
            r={3}
            fill={y >= 0 ? "#22c55e" : "#ef4444"}
            stroke="#1a1a2e"
            strokeWidth={1.5}
          />
        );
      })}

      {/* X axis labels */}
      {xTicks.map((x) => {
        const { sx } = toSvg(x, 0);
        return (
          <text key={x} x={sx} y={H - 6} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">
            Yr {x}
          </text>
        );
      })}

      {/* Annotations */}
      <text x={toSvg(2, -18).sx} y={toSvg(2, -18).sy - 6} textAnchor="middle" fontSize={8} fill="#ef4444">
        Capital Calls
      </text>
      <text x={toSvg(7, 42).sx} y={toSvg(7, 42).sy - 6} textAnchor="middle" fontSize={8} fill="#22c55e">
        Distributions
      </text>
    </svg>
  );
}

function VintageHeatmap() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left text-muted-foreground py-1.5 pr-3 font-medium whitespace-nowrap">
              Vintage
            </th>
            {FUND_TYPES.map((t) => (
              <th
                key={t}
                className="text-center text-muted-foreground py-1.5 px-2 font-medium whitespace-nowrap"
              >
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {VINTAGE_YEARS.map((yr) => (
            <tr key={yr}>
              <td className="text-muted-foreground py-1 pr-3 font-mono">{yr}</td>
              {FUND_TYPES.map((type) => {
                const irr = VINTAGE_IRR[String(yr)]?.[type] ?? 0;
                return (
                  <td key={type} className="px-1 py-1">
                    <div
                      className="rounded text-center py-1 px-2 font-semibold tabular-nums"
                      style={{
                        backgroundColor: irrBg(irr),
                        color: irrColor(irr),
                        fontSize: 11,
                      }}
                    >
                      {irr.toFixed(1)}%
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="font-medium">Legend:</span>
        {[
          { label: "≥30%", color: "#22c55e" },
          { label: "20-30%", color: "#84cc16" },
          { label: "15-20%", color: "#eab308" },
          { label: "10-15%", color: "#f97316" },
          { label: "<10%", color: "#ef4444" },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: color + "55" }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function CapitalCallsTimeline() {
  const W = 540;
  const H = 80;
  const PAD = { l: 50, r: 16, t: 12, b: 28 };
  const iW = W - PAD.l - PAD.r;
  const calls = [
    { q: "Q1 '24", pct: 18, cumPct: 18, type: "call" },
    { q: "Q2 '24", pct: 22, cumPct: 40, type: "call" },
    { q: "Q3 '24", pct: 15, cumPct: 55, type: "call" },
    { q: "Q4 '24", pct: 20, cumPct: 75, type: "call" },
    { q: "Q1 '25", pct: 12, cumPct: 87, type: "distribution" },
    { q: "Q2 '25", pct: 8, cumPct: 95, type: "distribution" },
    { q: "Q3 '25", pct: 5, cumPct: 100, type: "distribution" },
  ];
  const maxPct = 25;
  const barW = iW / calls.length - 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 80 }}>
      {calls.map((c, i) => {
        const x = PAD.l + i * (iW / calls.length);
        const barH = (c.pct / maxPct) * (H - PAD.t - PAD.b);
        const y = H - PAD.b - barH;
        const color = c.type === "call" ? "#6366f1" : "#22c55e";
        return (
          <g key={c.q}>
            <rect x={x + 2} y={y} width={barW} height={barH} fill={color} fillOpacity={0.7} rx={2} />
            <text
              x={x + 2 + barW / 2}
              y={H - PAD.b + 12}
              textAnchor="middle"
              fontSize={7.5}
              fill="rgba(255,255,255,0.45)"
            >
              {c.q}
            </text>
            <text
              x={x + 2 + barW / 2}
              y={y - 3}
              textAnchor="middle"
              fontSize={7.5}
              fill="rgba(255,255,255,0.6)"
            >
              {c.pct}%
            </text>
          </g>
        );
      })}
      <text x={PAD.l - 4} y={PAD.t + 4} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.4)">
        25%
      </text>
      <text x={PAD.l - 4} y={H - PAD.b} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.4)">
        0%
      </text>
    </svg>
  );
}

function IRRCalculator() {
  const [investment, setInvestment] = useState("1000000");
  const [cashFlowsText, setCashFlowsText] = useState(
    "0, 0, 0, 150000, 200000, 350000, 500000, 800000"
  );

  const result = useMemo(() => {
    const inv = parseFloat(investment);
    if (isNaN(inv) || inv <= 0) return null;
    const flows = cashFlowsText
      .split(",")
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
    if (flows.length === 0) return null;
    const cf = [-inv, ...flows];
    const irr = computeIRR(cf);
    if (irr === null || !isFinite(irr)) return null;
    const totalReturned = flows.reduce((a, b) => a + b, 0);
    const moic = totalReturned / inv;
    return { irr, moic, totalReturned };
  }, [investment, cashFlowsText]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">IRR Calculator</h3>
      <div className="grid grid-cols-1 gap-3 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Initial Investment ($)
          </label>
          <input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Cash Flows by Year (comma-separated, $ received each year)
          </label>
          <input
            type="text"
            value={cashFlowsText}
            onChange={(e) => setCashFlowsText(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
          />
        </div>
      </div>
      {result ? (
        <div className="grid grid-cols-3 gap-3">
          <StatChip
            label="IRR"
            value={`${result.irr.toFixed(1)}%`}
            color={result.irr >= 20 ? "green" : result.irr >= 10 ? "amber" : "red"}
          />
          <StatChip
            label="MOIC"
            value={`${result.moic.toFixed(2)}x`}
            color={result.moic >= 2 ? "green" : result.moic >= 1.5 ? "amber" : "red"}
          />
          <StatChip
            label="Total Returned"
            value={`$${(result.totalReturned / 1e6).toFixed(2)}M`}
            color="blue"
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">Enter valid inputs to compute IRR.</p>
      )}
    </div>
  );
}

function PEFundTable() {
  const typeColor: Record<string, string> = {
    Buyout: "text-blue-400",
    Growth: "text-green-400",
    Venture: "text-purple-400",
    Distressed: "text-amber-400",
  };
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {["Fund", "Type", "Vintage", "IRR", "TVPI", "DPI", "RVPI", "Size ($B)", "Status"].map(
              (h) => (
                <th key={h} className="text-left text-muted-foreground py-2.5 px-3 font-medium whitespace-nowrap">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {PE_FUNDS.map((f, i) => (
            <tr
              key={f.name}
              className={cn(
                "border-b border-border/50 hover:bg-muted/20 transition-colors",
                i % 2 === 0 ? "" : "bg-muted/10"
              )}
            >
              <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">{f.name}</td>
              <td className={cn("py-2.5 px-3 font-medium whitespace-nowrap", typeColor[f.type])}>
                {f.type}
              </td>
              <td className="py-2.5 px-3 text-muted-foreground">{f.vintage}</td>
              <td className="py-2.5 px-3" style={{ color: irrColor(f.irr) }}>
                {f.irr.toFixed(1)}%
              </td>
              <td className="py-2.5 px-3 text-foreground">{f.tvpi.toFixed(1)}x</td>
              <td className="py-2.5 px-3 text-green-400">{f.dpi.toFixed(1)}x</td>
              <td className="py-2.5 px-3 text-blue-400">{f.rvpi.toFixed(1)}x</td>
              <td className="py-2.5 px-3 text-muted-foreground">${f.size}B</td>
              <td className="py-2.5 px-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    f.status === "Harvesting"
                      ? "border-green-500/30 text-green-400"
                      : f.status === "Investing"
                      ? "border-blue-500/30 text-blue-400"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {f.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Section 2: Venture Capital ────────────────────────────────────────────────

function PowerLawSVG() {
  const W = 520;
  const H = 180;
  const PAD = { l: 48, r: 16, t: 16, b: 36 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  // 20 portfolio companies with outcomes
  const companies = [
    { name: "Failure", count: 10, mult: 0, color: "#ef4444" },
    { name: "0.5x", count: 3, mult: 0.5, color: "#f97316" },
    { name: "1x", count: 2, mult: 1, color: "#eab308" },
    { name: "2x", count: 2, mult: 2, color: "#84cc16" },
    { name: "3-5x", count: 2, mult: 4, color: "#22c55e" },
    { name: "10x+", count: 1, mult: 12, color: "#6366f1" },
  ];

  // Log scale: display log2(mult+1) for width proportional to return
  const maxLog = Math.log2(12 + 1);
  const totalCount = companies.reduce((a, c) => a + c.count, 0);
  const barH = iH / companies.length - 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
      {companies.map((c, i) => {
        const y = PAD.t + i * (iH / companies.length) + 2;
        const logW = c.mult > 0 ? (Math.log2(c.mult + 1) / maxLog) * iW * 0.9 : iW * 0.04;
        return (
          <g key={c.name}>
            <rect x={PAD.l} y={y} width={logW} height={barH} fill={c.color} fillOpacity={0.7} rx={2} />
            <text x={PAD.l - 4} y={y + barH / 2 + 4} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.5)">
              {c.name}
            </text>
            <text
              x={PAD.l + logW + 6}
              y={y + barH / 2 + 4}
              textAnchor="start"
              fontSize={9}
              fill="rgba(255,255,255,0.5)"
            >
              {c.count} co.
            </text>
          </g>
        );
      })}
      <text x={PAD.l + iW / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.35)">
        Return Multiple (log scale)
      </text>
    </svg>
  );
}

function VCStages() {
  const stages = [
    {
      name: "Pre-Seed",
      checkMin: 0.1,
      checkMax: 0.5,
      valMin: 1,
      valMax: 5,
      equity: "10-20%",
      color: "#a855f7",
    },
    {
      name: "Seed",
      checkMin: 0.5,
      checkMax: 3,
      valMin: 5,
      valMax: 20,
      equity: "15-25%",
      color: "#6366f1",
    },
    {
      name: "Series A",
      checkMin: 3,
      checkMax: 15,
      valMin: 20,
      valMax: 80,
      equity: "20-30%",
      color: "#3b82f6",
    },
    {
      name: "Series B",
      checkMin: 15,
      checkMax: 50,
      valMin: 80,
      valMax: 300,
      equity: "15-25%",
      color: "#0ea5e9",
    },
    {
      name: "Series C",
      checkMin: 50,
      checkMax: 150,
      valMin: 300,
      valMax: 1000,
      equity: "10-20%",
      color: "#22c55e",
    },
    {
      name: "Growth",
      checkMin: 150,
      checkMax: 500,
      valMin: 1000,
      valMax: 10000,
      equity: "5-15%",
      color: "#84cc16",
    },
  ];

  return (
    <div className="space-y-2">
      {stages.map((st) => (
        <div key={st.name} className="flex items-center gap-3">
          <div className="w-20 text-xs font-medium" style={{ color: st.color }}>
            {st.name}
          </div>
          <div className="flex-1 rounded-lg border border-border bg-muted/20 px-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Check: ${st.checkMin}M – ${st.checkMax}M
              </span>
              <span className="text-muted-foreground">Val: ${st.valMin}M – ${st.valMax}M</span>
              <span className="text-foreground font-medium">Equity: {st.equity}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VCEconomics() {
  const [committed, setCommitted] = useState(100); // $M
  const [grossReturn, setGrossReturn] = useState(250); // $M total portfolio value
  const mgmtFee = committed * 0.02 * 10; // 2% × 10 years
  const totalFees = mgmtFee;
  const investable = committed - mgmtFee;
  const hurdle = investable * 1.08; // 8% hurdle
  const profits = Math.max(0, grossReturn - investable);
  const lpPreferred = Math.min(grossReturn - investable, hurdle - investable);
  const carryPool = Math.max(0, grossReturn - hurdle);
  const gpCarry = carryPool * 0.2;
  const lpCarry = carryPool * 0.8;
  const lpTotal = investable + lpPreferred + lpCarry;
  const gpTotal = mgmtFee + gpCarry;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">VC Fund Economics (2%/20%)</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Fund Committed Capital ($M)
          </label>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={committed}
            onChange={(e) => setCommitted(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="text-sm font-semibold text-foreground mt-1">${committed}M</div>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Portfolio Value at Exit ($M)
          </label>
          <input
            type="range"
            min={committed * 0.5}
            max={committed * 8}
            step={10}
            value={grossReturn}
            onChange={(e) => setGrossReturn(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="text-sm font-semibold text-foreground mt-1">${grossReturn}M</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-muted/20 p-3 space-y-1.5">
          <div className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px] mb-2">
            LP Waterfall
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Return of Capital</span>
            <span className="text-foreground font-medium">${investable.toFixed(1)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Preferred Return (8%)</span>
            <span className="text-foreground font-medium">${Math.max(0, lpPreferred).toFixed(1)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">LP Share of Carry (80%)</span>
            <span className="text-green-400 font-medium">${lpCarry.toFixed(1)}M</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1 mt-1">
            <span className="font-semibold text-foreground">LP Total</span>
            <span className="font-semibold text-green-400">${lpTotal.toFixed(1)}M</span>
          </div>
        </div>
        <div className="rounded-lg bg-muted/20 p-3 space-y-1.5">
          <div className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px] mb-2">
            GP Economics
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Management Fees (10yr)</span>
            <span className="text-foreground font-medium">${mgmtFee.toFixed(1)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Carry Pool (20%)</span>
            <span className="text-foreground font-medium">${carryPool.toFixed(1)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GP Carry</span>
            <span className="text-purple-400 font-medium">${gpCarry.toFixed(1)}M</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1 mt-1">
            <span className="font-semibold text-foreground">GP Total</span>
            <span className="font-semibold text-purple-400">${gpTotal.toFixed(1)}M</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section 3: Real Assets ────────────────────────────────────────────────────

function RadarChartSVG() {
  // Pentagon radar: Infrastructure, REITs, Bonds, Equities, Private Credit
  // Axes: Yield, Inflation Link, Volatility (inv), Liquidity (inv), Growth
  const W = 300;
  const H = 260;
  const cx = W / 2;
  const cy = H / 2 + 10;
  const R = 95;
  const axes = ["Yield", "Inflation\nLink", "Stability", "Liquidity", "Growth"];
  const n = axes.length;

  const datasets = [
    {
      label: "Infrastructure",
      color: "#6366f1",
      scores: [0.82, 0.9, 0.88, 0.3, 0.55],
    },
    {
      label: "REITs",
      color: "#22c55e",
      scores: [0.72, 0.68, 0.62, 0.85, 0.7],
    },
    {
      label: "Bonds",
      color: "#3b82f6",
      scores: [0.55, 0.3, 0.92, 0.95, 0.2],
    },
    {
      label: "Equities",
      color: "#f97316",
      scores: [0.35, 0.48, 0.45, 0.92, 0.95],
    },
  ];

  const getPoint = (axisIdx: number, score: number) => {
    const angle = (axisIdx / n) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * R * score,
      y: cy + Math.sin(angle) * R * score,
    };
  };

  const axisPoints = axes.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + Math.cos(angle) * R, y: cy + Math.sin(angle) * R };
  });

  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
        {/* Grid rings */}
        {rings.map((r) => {
          const pts = axes.map((_, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            return `${cx + Math.cos(angle) * R * r},${cy + Math.sin(angle) * R * r}`;
          });
          return (
            <polygon
              key={r}
              points={pts.join(" ")}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {axisPoints.map((pt, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={pt.x}
            y2={pt.y}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
          />
        ))}

        {/* Dataset polygons */}
        {datasets.map((ds) => {
          const pts = ds.scores.map((sc, i) => {
            const p = getPoint(i, sc);
            return `${p.x},${p.y}`;
          });
          return (
            <g key={ds.label}>
              <polygon
                points={pts.join(" ")}
                fill={ds.color}
                fillOpacity={0.12}
                stroke={ds.color}
                strokeWidth={1.5}
                strokeOpacity={0.8}
              />
            </g>
          );
        })}

        {/* Axis labels */}
        {axes.map((ax, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          const lx = cx + Math.cos(angle) * (R + 18);
          const ly = cy + Math.sin(angle) * (R + 18);
          const lines = ax.split("\n");
          return (
            <text key={i} x={lx} y={ly} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.55)">
              {lines.map((line, li) => (
                <tspan key={li} x={lx} dy={li === 0 ? 0 : 11}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
        {datasets.map((ds) => (
          <div key={ds.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ds.color }} />
            {ds.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function CLOWaterfallSVG() {
  const tranches = [
    { name: "AAA", rating: "AAA", spread: 130, size: 65, color: "#22c55e" },
    { name: "AA", rating: "AA", spread: 175, size: 10, color: "#84cc16" },
    { name: "A", rating: "A", spread: 240, size: 8, color: "#eab308" },
    { name: "BBB", rating: "BBB", spread: 380, size: 6, color: "#f97316" },
    { name: "BB", rating: "BB", spread: 680, size: 5, color: "#ef4444" },
    { name: "Equity", rating: "NR", spread: null, size: 6, color: "#8b5cf6" },
  ];

  const W = 400;
  const H = 180;
  const PAD = { l: 55, r: 16, t: 12, b: 32 };
  const iW = W - PAD.l - PAD.r;
  const maxSpread = 750;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
      {tranches.map((t, i) => {
        const barH = (iW * t.size) / 100;
        const y = PAD.t + i * ((H - PAD.t - PAD.b) / tranches.length);
        const rowH = (H - PAD.t - PAD.b) / tranches.length - 3;
        const spreadW = t.spread ? (t.spread / maxSpread) * (iW - 80) : 0;

        return (
          <g key={t.name}>
            {/* Tranche label */}
            <text x={PAD.l - 5} y={y + rowH / 2 + 4} textAnchor="end" fontSize={9} fill={t.color} fontWeight="600">
              {t.name}
            </text>
            {/* Size bar */}
            <rect
              x={PAD.l}
              y={y + 2}
              width={iW * (t.size / 100)}
              height={rowH - 2}
              fill={t.color}
              fillOpacity={0.15}
              rx={2}
            />
            <rect
              x={PAD.l}
              y={y + 2}
              width={iW * (t.size / 100)}
              height={rowH - 2}
              fill="none"
              stroke={t.color}
              strokeOpacity={0.4}
              strokeWidth={1}
              rx={2}
            />
            <text
              x={PAD.l + iW * (t.size / 100) + 5}
              y={y + rowH / 2 + 4}
              fontSize={8.5}
              fill="rgba(255,255,255,0.45)"
            >
              {t.size}%{t.spread ? ` | +${t.spread}bps` : " | Residual"}
            </text>
          </g>
        );
      })}
      <text x={PAD.l + iW / 3} y={H - 4} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.3)">
        Tranche Size (% of CLO)
      </text>
    </svg>
  );
}

function InfraAssets() {
  const assets = [
    {
      type: "Utilities",
      examples: "Water, Gas Pipelines, Electricity Grids",
      yieldRange: "5-7%",
      inflLink: "High",
      lockup: "15-25yr",
      risk: "Low",
    },
    {
      type: "Transport",
      examples: "Airports, Toll Roads, Ports, Rail",
      yieldRange: "6-9%",
      inflLink: "Medium",
      lockup: "10-20yr",
      risk: "Medium",
    },
    {
      type: "Energy",
      examples: "Renewables, LNG Terminals, Storage",
      yieldRange: "7-12%",
      inflLink: "Medium",
      lockup: "10-20yr",
      risk: "Medium",
    },
    {
      type: "Social",
      examples: "Schools, Hospitals, Courts, Prisons",
      yieldRange: "4-6%",
      inflLink: "High",
      lockup: "20-30yr",
      risk: "Very Low",
    },
  ];

  const riskColor: Record<string, string> = {
    Low: "text-green-400",
    "Very Low": "text-emerald-400",
    Medium: "text-amber-400",
    High: "text-red-400",
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {["Asset Class", "Examples", "Yield Range", "Inflation Link", "Typical Lockup", "Risk"].map(
              (h) => (
                <th key={h} className="text-left text-muted-foreground py-2.5 px-3 font-medium whitespace-nowrap">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {assets.map((a, i) => (
            <tr key={a.type} className={cn("border-b border-border/50", i % 2 === 0 ? "" : "bg-muted/10")}>
              <td className="py-2.5 px-3 font-semibold text-primary">{a.type}</td>
              <td className="py-2.5 px-3 text-muted-foreground">{a.examples}</td>
              <td className="py-2.5 px-3 text-green-400 font-medium">{a.yieldRange}</td>
              <td className="py-2.5 px-3 text-foreground">{a.inflLink}</td>
              <td className="py-2.5 px-3 text-muted-foreground">{a.lockup}</td>
              <td className={cn("py-2.5 px-3 font-medium", riskColor[a.risk] ?? "text-foreground")}>
                {a.risk}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Section 4: Hedge Funds ────────────────────────────────────────────────────

function RiskReturnBubbleSVG() {
  const W = 560;
  const H = 220;
  const PAD = { l: 48, r: 16, t: 16, b: 36 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const minRet = 5;
  const maxRet = 16;
  const minVol = 3;
  const maxVol = 12;
  const maxAUM = 890;

  const toSvg = (ret: number, vol: number) => ({
    sx: PAD.l + ((vol - minVol) / (maxVol - minVol)) * iW,
    sy: PAD.t + ((maxRet - ret) / (maxRet - minRet)) * iH,
  });

  // Axis ticks
  const retTicks = [6, 8, 10, 12, 14];
  const volTicks = [4, 6, 8, 10, 12];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      {/* Grid */}
      {retTicks.map((r) => {
        const sy = PAD.t + ((maxRet - r) / (maxRet - minRet)) * iH;
        return (
          <g key={r}>
            <line
              x1={PAD.l}
              y1={sy}
              x2={W - PAD.r}
              y2={sy}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <text x={PAD.l - 4} y={sy + 4} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.35)">
              {r}%
            </text>
          </g>
        );
      })}
      {volTicks.map((v) => {
        const sx = PAD.l + ((v - minVol) / (maxVol - minVol)) * iW;
        return (
          <g key={v}>
            <line
              x1={sx}
              y1={PAD.t}
              x2={sx}
              y2={H - PAD.b}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <text x={sx} y={H - PAD.b + 12} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.35)">
              {v}%σ
            </text>
          </g>
        );
      })}

      {/* Axis labels */}
      <text
        x={PAD.l - 28}
        y={PAD.t + iH / 2}
        textAnchor="middle"
        fontSize={9}
        fill="rgba(255,255,255,0.4)"
        transform={`rotate(-90 ${PAD.l - 28} ${PAD.t + iH / 2})`}
      >
        Annual Return
      </text>
      <text x={PAD.l + iW / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">
        Volatility
      </text>

      {/* Bubbles */}
      {HF_STRATEGIES.map((st) => {
        const { sx, sy } = toSvg(st.annualReturn, st.volatility);
        const r = 6 + (st.aum / maxAUM) * 16;
        const colors = [
          "#6366f1", "#22c55e", "#3b82f6", "#f97316", "#a855f7",
          "#ef4444", "#eab308", "#0ea5e9", "#84cc16", "#14b8a6",
        ];
        const color = colors[HF_STRATEGIES.indexOf(st) % colors.length];
        return (
          <g key={st.name}>
            <circle cx={sx} cy={sy} r={r} fill={color} fillOpacity={0.35} stroke={color} strokeWidth={1.5} strokeOpacity={0.7} />
            <text x={sx} y={sy - r - 4} textAnchor="middle" fontSize={7.5} fill="rgba(255,255,255,0.55)">
              {st.name.split(" ").slice(0, 2).join(" ")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HFStrategyTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {["Strategy", "Ann. Return", "Volatility", "Sharpe", "Sortino", "Calmar", "Max DD", "AUM ($B)", "S&P Corr"].map(
              (h) => (
                <th key={h} className="text-left text-muted-foreground py-2.5 px-3 font-medium whitespace-nowrap">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {HF_STRATEGIES.map((st, i) => (
            <tr
              key={st.name}
              className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "" : "bg-muted/10")}
            >
              <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">{st.name}</td>
              <td className="py-2.5 px-3 text-green-400 font-medium">{st.annualReturn.toFixed(1)}%</td>
              <td className="py-2.5 px-3 text-muted-foreground">{st.volatility.toFixed(1)}%</td>
              <td className="py-2.5 px-3">
                <span
                  className={cn(
                    "font-semibold",
                    st.sharpe >= 1.5 ? "text-green-400" : st.sharpe >= 1.0 ? "text-amber-400" : "text-red-400"
                  )}
                >
                  {st.sharpe.toFixed(2)}
                </span>
              </td>
              <td className="py-2.5 px-3 text-foreground">{st.sortino.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-foreground">{st.calmar.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-red-400">{st.maxDD.toFixed(1)}%</td>
              <td className="py-2.5 px-3 text-muted-foreground">${st.aum}B</td>
              <td className="py-2.5 px-3">
                <span
                  className={cn(
                    "font-medium",
                    Math.abs(st.corr) < 0.2 ? "text-green-400" : Math.abs(st.corr) < 0.5 ? "text-amber-400" : "text-red-400"
                  )}
                >
                  {st.corr.toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeeBreakevenCalc() {
  const [grossRet, setGrossRet] = useState(15);

  const calc = (mgmt: number, carry: number) => {
    // Net return after fees: (gross - mgmt) * (1 - carry%) if above hurdle
    const hurdle = 8;
    const afterMgmt = grossRet - mgmt;
    const profits = Math.max(0, afterMgmt - hurdle);
    const net = afterMgmt - profits * carry;
    return net;
  };

  const net220 = calc(2, 0.2);
  const net1515 = calc(1.5, 0.15);
  const netDiff = net1515 - net220;

  const breakeven220 = () => {
    // Find gross where LP gets same net as 1.5/15 at current gross
    // Approximate: solve (g - 2) - (g - 2 - 8) * 0.2 = net1515
    return null; // display delta instead
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Fee Structure Comparison</h3>
      <div className="mb-4">
        <label className="block text-xs text-muted-foreground mb-1">
          Gross Strategy Return: {grossRet}%
        </label>
        <input
          type="range"
          min={5}
          max={40}
          step={0.5}
          value={grossRet}
          onChange={(e) => setGrossRet(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">2% Mgmt + 20% Carry</div>
          <div className="text-xl font-bold text-blue-400">{net220.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground mt-0.5">Net to LP</div>
        </div>
        <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">1.5% Mgmt + 15% Carry</div>
          <div className="text-xl font-bold text-purple-400">{net1515.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground mt-0.5">Net to LP</div>
        </div>
      </div>
      <div className="mt-3 text-center text-xs text-muted-foreground">
        1.5%/15% saves LP{" "}
        <span className={netDiff > 0 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
          {netDiff.toFixed(2)}%
        </span>{" "}
        per year at {grossRet}% gross return (assumes 8% hurdle)
      </div>
    </div>
  );
}

// ── Section 5: Portfolio Allocator ────────────────────────────────────────────

function EfficientFrontierSVG({
  altWeight,
}: {
  altWeight: number;
}) {
  const W = 560;
  const H = 200;
  const PAD = { l: 50, r: 24, t: 16, b: 36 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  // Traditional frontier: risk 6-18%, return 5-14%
  // With alts frontier: risk 5-16%, return 5.5-15.5%
  const tradFrontier: [number, number][] = [
    [6, 5], [7, 6.5], [8.5, 8], [10, 9.5], [12, 11], [14.5, 12.5], [17, 13.5], [18, 14],
  ];
  const altFrontier: [number, number][] = [
    [5, 5.5], [6, 7], [7.5, 8.8], [9, 10.5], [11, 12.2], [13, 13.8], [15, 15], [16, 15.5],
  ];

  const minRisk = 4;
  const maxRisk = 20;
  const minRet = 4;
  const maxRet = 17;

  const toSvg = (risk: number, ret: number) => ({
    sx: PAD.l + ((risk - minRisk) / (maxRisk - minRisk)) * iW,
    sy: PAD.t + ((maxRet - ret) / (maxRet - minRet)) * iH,
  });

  const frontierPath = (pts: [number, number][]) =>
    pts.map(([r, ret], i) => {
      const { sx, sy } = toSvg(r, ret);
      return i === 0 ? `M ${sx} ${sy}` : `L ${sx} ${sy}`;
    }).join(" ");

  // Current portfolio point
  const tradRisk = 6 + (1 - altWeight) * 12;
  const tradRet = 5 + (1 - altWeight) * 9;
  const altRisk = 5 + (1 - altWeight) * 11;
  const altRet = 5.5 + (1 - altWeight) * 10;

  const tradPt = toSvg(tradRisk, tradRet);
  const altPt = toSvg(altRisk, altRet);

  // Risk ticks
  const riskTicks = [6, 8, 10, 12, 14, 16, 18];
  const retTicks = [6, 8, 10, 12, 14, 16];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      {/* Grid */}
      {retTicks.map((r) => {
        const sy = PAD.t + ((maxRet - r) / (maxRet - minRet)) * iH;
        return (
          <g key={r}>
            <line x1={PAD.l} y1={sy} x2={W - PAD.r} y2={sy} stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="3,3" />
            <text x={PAD.l - 4} y={sy + 4} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.35)">{r}%</text>
          </g>
        );
      })}
      {riskTicks.map((r) => {
        const sx = PAD.l + ((r - minRisk) / (maxRisk - minRisk)) * iW;
        return (
          <g key={r}>
            <line x1={sx} y1={PAD.t} x2={sx} y2={H - PAD.b} stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="3,3" />
            <text x={sx} y={H - PAD.b + 12} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.35)">{r}%σ</text>
          </g>
        );
      })}

      {/* Frontiers */}
      <path d={frontierPath(tradFrontier)} fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5,3" strokeOpacity={0.6} />
      <path d={frontierPath(altFrontier)} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeOpacity={0.85} />

      {/* Portfolio points */}
      <circle cx={tradPt.sx} cy={tradPt.sy} r={7} fill="#3b82f6" fillOpacity={0.25} stroke="#3b82f6" strokeWidth={2} />
      <text x={tradPt.sx} y={tradPt.sy - 11} textAnchor="middle" fontSize={8.5} fill="#3b82f6">
        Traditional
      </text>
      <circle cx={altPt.sx} cy={altPt.sy} r={7} fill="#22c55e" fillOpacity={0.25} stroke="#22c55e" strokeWidth={2} />
      <text x={altPt.sx} y={altPt.sy - 11} textAnchor="middle" fontSize={8.5} fill="#22c55e">
        With Alts
      </text>

      {/* Axis labels */}
      <text x={PAD.l - 36} y={PAD.t + iH / 2} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)" transform={`rotate(-90 ${PAD.l - 36} ${PAD.t + iH / 2})`}>
        Return
      </text>
      <text x={PAD.l + iW / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">
        Volatility (Risk)
      </text>

      {/* Legend */}
      <g>
        <line x1={W - 130} y1={PAD.t + 6} x2={W - 110} y2={PAD.t + 6} stroke="#3b82f6" strokeWidth={2} strokeDasharray="5,3" />
        <text x={W - 106} y={PAD.t + 10} fontSize={8.5} fill="rgba(255,255,255,0.5)">60/40 Traditional</text>
        <line x1={W - 130} y1={PAD.t + 20} x2={W - 110} y2={PAD.t + 20} stroke="#22c55e" strokeWidth={2} />
        <text x={W - 106} y={PAD.t + 24} fontSize={8.5} fill="rgba(255,255,255,0.5)">With Alternatives</text>
      </g>
    </svg>
  );
}

function PortfolioOptimizer() {
  const [altPct, setAltPct] = useState(20);

  // Portfolio components: equity, bonds, PE, hedge funds, RE
  const equityPct = Math.round((100 - altPct) * 0.6);
  const bondPct = 100 - altPct - equityPct;
  const pePct = Math.round(altPct * 0.35);
  const hfPct = Math.round(altPct * 0.3);
  const rePct = altPct - pePct - hfPct;

  // Expected metrics (simplified linear blend)
  const baseRet = 7.2; // 60/40 traditional
  const baseVol = 10.1;
  const baseSharpe = 0.71;
  const altBenefit = altPct / 100;
  const expReturn = baseRet + altBenefit * 3.2;
  const expVol = baseVol - altBenefit * 1.8;
  const expSharpe = expReturn / expVol;

  const liquPremiums = [
    { lockup: "1 Year", premium: 0.5 },
    { lockup: "3 Years", premium: 1.2 },
    { lockup: "7 Years", premium: 2.8 },
    { lockup: "10+ Years", premium: 4.0 },
  ];

  const alloc = [
    { name: "Global Equities", pct: equityPct, color: "#3b82f6" },
    { name: "Fixed Income", pct: bondPct, color: "#6366f1" },
    { name: "Private Equity", pct: pePct, color: "#a855f7" },
    { name: "Hedge Funds", pct: hfPct, color: "#22c55e" },
    { name: "Real Assets", pct: rePct, color: "#eab308" },
  ];

  return (
    <div className="space-y-6">
      {/* Slider */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Alternatives Allocation</h3>
          <span className="text-lg font-bold text-primary">{altPct}%</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <span>0% Alts (Pure 60/40)</span>
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={altPct}
              onChange={(e) => setAltPct(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <span>50% Alts</span>
        </div>

        {/* Allocation bar */}
        <div className="flex h-6 rounded-lg overflow-hidden mt-3 gap-0.5">
          {alloc.map((a) => (
            <motion.div
              key={a.name}
              layout
              className="flex items-center justify-center text-[10px] font-semibold text-white/80 overflow-hidden"
              style={{
                width: `${a.pct}%`,
                backgroundColor: a.color,
                opacity: 0.75,
              }}
            >
              {a.pct >= 5 ? `${a.pct}%` : ""}
            </motion.div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {alloc.map((a) => (
            <div key={a.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
              {a.name} ({a.pct}%)
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <StatChip
          label="Expected Return"
          value={`${expReturn.toFixed(1)}%`}
          color="green"
        />
        <StatChip
          label="Expected Volatility"
          value={`${expVol.toFixed(1)}%`}
          color={expVol < 9 ? "green" : expVol < 10.5 ? "amber" : "red"}
        />
        <StatChip
          label="Sharpe Ratio"
          value={expSharpe.toFixed(2)}
          color={expSharpe >= 0.9 ? "green" : expSharpe >= 0.7 ? "amber" : "red"}
        />
      </div>

      {/* Efficient Frontier */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Efficient Frontier</h3>
        <EfficientFrontierSVG altWeight={altPct / 50} />
      </div>

      {/* Liquidity premiums */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Illiquidity Premium</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Estimated additional annualized return for accepting lock-up periods vs. liquid alternatives.
        </p>
        <div className="space-y-2">
          {liquPremiums.map((lp) => (
            <div key={lp.lockup} className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 w-24">
                <Lock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{lp.lockup}</span>
              </div>
              <div className="flex-1 h-5 bg-muted/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${(lp.premium / 4.0) * 100}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <span className="text-xs font-semibold text-primary w-14 text-right">
                +{lp.premium.toFixed(1)}% p.a.
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section 6: Due Diligence ──────────────────────────────────────────────────

function DDAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [showRedFlags, setShowRedFlags] = useState(false);

  const iconMap: Record<string, React.ReactNode> = {
    team: <Activity className="w-4 h-4" />,
    strategy: <Target className="w-4 h-4" />,
    ops: <Layers className="w-4 h-4" />,
    legal: <Shield className="w-4 h-4" />,
    esg: <BookOpen className="w-4 h-4" />,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setShowRedFlags(false)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-lg border transition-colors",
            !showRedFlags
              ? "bg-primary/10 border-primary/30 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Checklist Items
        </button>
        <button
          onClick={() => setShowRedFlags(true)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-lg border transition-colors",
            showRedFlags
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Red Flags
        </button>
      </div>

      {DD_CATEGORIES.map((cat, i) => (
        <div key={cat.category} className="rounded-xl border border-border overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors text-left"
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-primary">{iconMap[cat.icon]}</span>
              <span className="text-sm font-medium text-foreground">{cat.category}</span>
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                {(showRedFlags ? cat.redFlags : cat.items).length} items
              </Badge>
            </div>
            {openIdx === i ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {openIdx === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: "hidden" }}
              >
                <div className="px-4 pb-4 pt-1 border-t border-border/50">
                  {showRedFlags ? (
                    <ul className="space-y-2 mt-2">
                      {cat.redFlags.map((flag) => (
                        <li key={flag} className="flex items-start gap-2 text-xs text-red-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="space-y-2 mt-2">
                      {cat.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function FundDocChecklist() {
  const required = FUND_DOCS.filter((d) => d.required);
  const optional = FUND_DOCS.filter((d) => !d.required);
  const receivedReq = required.filter((d) => d.received).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Fund Documents Checklist</h3>
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            receivedReq === required.length
              ? "border-green-500/30 text-green-400"
              : "border-amber-500/30 text-amber-400"
          )}
        >
          {receivedReq}/{required.length} Required
        </Badge>
      </div>

      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Required Documents
        </div>
        {required.map((doc) => (
          <div key={doc.name} className="flex items-center gap-2.5 text-xs">
            {doc.received ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            )}
            <span className={doc.received ? "text-foreground" : "text-muted-foreground"}>{doc.name}</span>
            {!doc.received && (
              <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400 ml-auto">
                Pending
              </Badge>
            )}
          </div>
        ))}

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-4">
          Optional / Best Practice
        </div>
        {optional.map((doc) => (
          <div key={doc.name} className="flex items-center gap-2.5 text-xs">
            {doc.received ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500/70 shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
            )}
            <span className={doc.received ? "text-foreground/70" : "text-muted-foreground/70"}>{doc.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GPLPAlignment() {
  const metrics = [
    { label: "GP Co-Investment", value: "2-5%", note: "of fund size", good: true },
    { label: "Management Fee Offset", value: "100%", note: "deal fees reduce mgmt", good: true },
    { label: "Hurdle Rate", value: "8%", note: "preferred return to LPs", good: true },
    { label: "Clawback Provision", value: "Yes", note: "100% with escrow", good: true },
    { label: "Key Person Clause", value: "2 of 3", note: "triggers wind-down vote", good: true },
    { label: "Removal Rights", value: "75% vote", note: "for cause", good: false },
    { label: "No-Fault Termination", value: "66.7%", note: "vote required", good: false },
    { label: "LPAC Seats", value: "8", note: "largest LPs + 2 rotating", good: true },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">GP/LP Alignment Metrics</h3>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg bg-muted/20 p-2.5">
            <div className="flex items-start justify-between gap-1">
              <span className="text-xs text-muted-foreground leading-tight">{m.label}</span>
              <span
                className={cn(
                  "text-xs font-semibold shrink-0 ml-1",
                  m.good ? "text-green-400" : "text-amber-400"
                )}
              >
                {m.value}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">{m.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PrivateMarketsPage() {
  const tabs = [
    { value: "pe", label: "Private Equity" },
    { value: "vc", label: "Venture Capital" },
    { value: "realassets", label: "Real Assets" },
    { value: "hedgefunds", label: "Hedge Funds" },
    { value: "optimizer", label: "Portfolio Optimizer" },
    { value: "dd", label: "Due Diligence" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-primary/10">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Private Markets & Alternatives</h1>
            <p className="text-sm text-muted-foreground">
              Private equity, venture capital, real assets, and hedge fund strategies
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap gap-3 mt-4">
          <StatChip label="Global PE AUM" value="$5.8T" color="blue" />
          <StatChip label="Global VC AUM" value="$1.1T" color="blue" />
          <StatChip label="Hedge Fund AUM" value="$4.2T" color="green" />
          <StatChip label="PE Median IRR" value="18.4%" color="green" />
          <StatChip label="Avg Lockup" value="7-10yr" color="amber" />
          <StatChip label="Min Investment" value="$1M+" color="default" />
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="pe">
        <TabsList className="flex flex-wrap gap-1 h-auto bg-muted/30 p-1 rounded-xl mb-6">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-3 py-1.5"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1: Private Equity ── */}
        <TabsContent value="pe" className="data-[state=inactive]:hidden space-y-6">
          <SectionHeader
            icon={<DollarSign className="w-5 h-5" />}
            title="Private Equity"
            subtitle="Buyout, growth equity, and distressed investing — long-term capital with illiquidity premium"
          />

          {/* J-Curve */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">J-Curve: Fund Value Over Time</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Capital is called during years 1-4 (negative NAV vs. committed), then value creation drives returns in years 5-10.
            </p>
            <JCurveSVG />
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 inline-block bg-red-400" /> Negative period: fees, drawdowns, early losses
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 inline-block bg-green-400" /> Value creation: exits, dividends, write-ups
              </span>
            </div>
          </div>

          {/* IRR Calculator */}
          <IRRCalculator />

          {/* PE Fund Universe */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">PE Fund Universe</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <StatChip label="TVPI" value="Invested capital multiple" color="default" />
              <StatChip label="DPI" value="Distributions / Paid-In" color="green" />
              <StatChip label="RVPI" value="Residual Value / Paid-In" color="blue" />
            </div>
            <PEFundTable />
          </div>

          {/* Vintage Heatmap */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Vintage Year IRR Heatmap
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Median net IRR by fund type and vintage year. 2020 vintage benefited from COVID-recovery tailwinds.
            </p>
            <VintageHeatmap />
          </div>

          {/* Capital Calls Timeline */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Capital Calls & Distribution Timeline</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Typical drawdown schedule for a 7-year PE fund. Early quarters are dominated by capital calls; later quarters shift to distributions.
            </p>
            <div className="flex gap-4 mb-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block bg-indigo-500/70" /> Capital Calls
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block bg-green-500/70" /> Distributions
              </span>
            </div>
            <CapitalCallsTimeline />
          </div>
        </TabsContent>

        {/* ── Tab 2: Venture Capital ── */}
        <TabsContent value="vc" className="data-[state=inactive]:hidden space-y-6">
          <SectionHeader
            icon={<TrendingUp className="w-5 h-5" />}
            title="Venture Capital"
            subtitle="Power law returns: a small number of outliers drive the entire fund's performance"
          />

          {/* Power Law */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Power Law Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">
              In a typical 20-company portfolio: 10 fail (0x), 5 return capital or less, 4 return 2-5x, and 1 drives most of the fund&apos;s value at 10x+.
            </p>
            <PowerLawSVG />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <StatChip label="Survival Rate" value="~5%" color="amber" />
              <StatChip label="Unicorn Rate" value="~1 in 100" color="blue" />
              <StatChip label="Top 10% deals" value="90% of returns" color="blue" />
            </div>
          </div>

          {/* Stage Breakdown */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Funding Stage Breakdown</h3>
            <VCStages />
          </div>

          {/* VC Economics */}
          <VCEconomics />

          {/* Top Sectors */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Top VC Sectors (2025 YTD)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Sector", "# Deals", "Median Val ($B)", "YoY Deal Growth"].map((h) => (
                      <th key={h} className="text-left text-muted-foreground py-2 px-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {VC_SECTORS.map((s, i) => (
                    <tr key={s.name} className={cn("border-b border-border/50", i % 2 === 0 ? "" : "bg-muted/10")}>
                      <td className="py-2.5 px-3 font-semibold text-foreground">{s.name}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{s.deals.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-foreground">${s.medianVal}B</td>
                      <td className="py-2.5 px-3">
                        <span className={s.yoyGrowth >= 0 ? "text-green-400" : "text-red-400"}>
                          {s.yoyGrowth >= 0 ? "+" : ""}{s.yoyGrowth.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Real Assets ── */}
        <TabsContent value="realassets" className="data-[state=inactive]:hidden space-y-6">
          <SectionHeader
            icon={<Building2 className="w-5 h-5" />}
            title="Real Assets"
            subtitle="Infrastructure, real estate, private credit — inflation-linked, yield-generating assets"
          />

          {/* Infrastructure Assets */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Infrastructure Asset Classes</h3>
            <InfraAssets />
          </div>

          {/* Radar Chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Asset Class Comparison</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Relative scores (0–1) across yield, inflation linkage, stability, liquidity, and growth potential.
            </p>
            <RadarChartSVG />
          </div>

          {/* CLO Waterfall */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">CLO Capital Structure</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Collateralized Loan Obligation: senior tranches absorb losses last, equity tranche takes first loss but earns residual upside.
            </p>
            <CLOWaterfallSVG />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg bg-muted/20 p-3">
                <div className="text-xs font-semibold text-foreground mb-2">Direct Lending</div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Senior Secured</span>
                    <span className="text-green-400">S+300-450bps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unitranche</span>
                    <span className="text-amber-400">S+500-650bps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mezzanine</span>
                    <span className="text-red-400">12-15% PIK</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-muted/20 p-3">
                <div className="text-xs font-semibold text-foreground mb-2">vs. Leveraged Loans</div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>LL Avg Spread</span>
                    <span>S+250-350bps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Direct Lending Premium</span>
                    <span className="text-green-400">+50-150bps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Illiquidity Premium</span>
                    <span className="text-blue-400">+75-175bps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CPI vs Infra scatter */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Inflation Linkage</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Many infrastructure contracts have explicit CPI escalators — revenues grow with inflation, protecting real returns.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { asset: "Regulated Utilities", cpi: "100%", mechanism: "Rate reviews with full CPI pass-through" },
                { asset: "Toll Roads", cpi: "80-100%", mechanism: "Concession agreements with CPI step-ups" },
                { asset: "Airports", cpi: "60-80%", mechanism: "Aeronautical charges + retail CPI link" },
                { asset: "Social Infrastructure", cpi: "100%", mechanism: "Government availability payments, CPI-indexed" },
              ].map((item) => (
                <div key={item.asset} className="rounded-lg bg-muted/20 p-3">
                  <div className="text-xs font-semibold text-foreground mb-1">{item.asset}</div>
                  <div className="text-sm font-bold text-primary mb-1">CPI Link: {item.cpi}</div>
                  <div className="text-[10px] text-muted-foreground">{item.mechanism}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 4: Hedge Funds ── */}
        <TabsContent value="hedgefunds" className="data-[state=inactive]:hidden space-y-6">
          <SectionHeader
            icon={<BarChart3 className="w-5 h-5" />}
            title="Hedge Fund Strategies"
            subtitle="10 core strategies: risk-return profiles, correlation, and fee economics"
          />

          {/* Bubble Chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Risk-Return Bubble Chart</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Bubble size = strategy AUM. X-axis = volatility, Y-axis = annualized return.
            </p>
            <RiskReturnBubbleSVG />
          </div>

          {/* Strategy Table */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Strategy Performance Metrics</h3>
            <HFStrategyTable />
          </div>

          {/* Fee Calculator */}
          <FeeBreakevenCalc />

          {/* Correlation Matrix */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              S&amp;P 500 Correlation by Strategy
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Low or negative correlation provides diversification benefits in a portfolio context.
            </p>
            <div className="space-y-1.5">
              {[...HF_STRATEGIES]
                .sort((a, b) => a.corr - b.corr)
                .map((st) => {
                  const pct = ((st.corr + 0.2) / 1.0) * 100;
                  const color =
                    st.corr < 0
                      ? "#22c55e"
                      : st.corr < 0.3
                      ? "#84cc16"
                      : st.corr < 0.55
                      ? "#eab308"
                      : "#ef4444";
                  return (
                    <div key={st.name} className="flex items-center gap-3">
                      <div className="w-32 text-xs text-muted-foreground text-right shrink-0">{st.name}</div>
                      <div className="flex-1 h-4 bg-muted/20 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(4, pct)}%`,
                            backgroundColor: color,
                            opacity: 0.7,
                          }}
                        />
                      </div>
                      <div
                        className="text-xs font-semibold w-12 text-right"
                        style={{ color }}
                      >
                        {st.corr.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 5: Optimizer ── */}
        <TabsContent value="optimizer" className="data-[state=inactive]:hidden space-y-6">
          <SectionHeader
            icon={<Target className="w-5 h-5" />}
            title="Portfolio Allocation Optimizer"
            subtitle="Blend traditional and alternative assets to improve risk-adjusted returns"
          />
          <PortfolioOptimizer />
        </TabsContent>

        {/* ── Tab 6: Due Diligence ── */}
        <TabsContent value="dd" className="data-[state=inactive]:hidden space-y-6">
          <SectionHeader
            icon={<Shield className="w-5 h-5" />}
            title="Due Diligence Framework"
            subtitle="Institutional LP checklist: 5 categories, red flags, GP/LP alignment, and fund documents"
          />

          {/* DD Accordion */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Investment Checklist</h3>
            <DDAccordion />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FundDocChecklist />
            <GPLPAlignment />
          </div>

          {/* Glossary */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Key Private Markets Terms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { term: "IRR", def: "Internal Rate of Return — discount rate making NPV of all cash flows = 0" },
                { term: "TVPI", def: "Total Value to Paid-In — (DPI + RVPI). Overall fund performance multiple" },
                { term: "DPI", def: "Distributed to Paid-In — actual cash returned to LPs relative to capital invested" },
                { term: "RVPI", def: "Residual Value to Paid-In — unrealized NAV as a multiple of invested capital" },
                { term: "Vintage Year", def: "Year of first capital call — determines benchmark peer group" },
                { term: "J-Curve", def: "Negative early returns as capital is drawn and fees paid, turning positive as exits occur" },
                { term: "Carry / Carried Interest", def: "GP's share of profits (typically 20%) above hurdle rate — key alignment mechanism" },
                { term: "Clawback", def: "Provision requiring GP to return excess carry if early gains are later reversed" },
                { term: "LPAC", def: "Limited Partner Advisory Committee — governance body with consent rights on conflicts" },
                { term: "PPM", def: "Private Placement Memorandum — offering document with strategy, terms, risk factors" },
                { term: "LPA", def: "Limited Partnership Agreement — binding legal contract governing fund operations" },
                { term: "Dry Powder", def: "Committed but uncalled capital — measure of PE industry's investment capacity" },
              ].map((g) => (
                <div key={g.term} className="rounded-lg bg-muted/20 p-3">
                  <div className="text-xs font-bold text-primary mb-0.5">{g.term}</div>
                  <div className="text-[11px] text-muted-foreground">{g.def}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
