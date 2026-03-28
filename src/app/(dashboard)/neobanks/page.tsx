"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Building2,
  TrendingUp,
  BarChart3,
  Globe,
  DollarSign,
  Users,
  Zap,
  Shield,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

let s = 855;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate random values
const randValues: number[] = [];
for (let i = 0; i < 200; i++) randValues.push(rand());
let ri = 0;
const r = () => randValues[ri++ % randValues.length];

// ── Data ────────────────────────────────────────────────────────────────────

const NEOBANKS = [
  {
    name: "Revolut",
    flag: "🇬🇧",
    customers: 45,
    revenue: 2.2,
    valuation: 33,
    revenuePerUser: 48.9,
    cac: 20,
    market: "Global",
    color: "#6366f1",
    profitable: true,
  },
  {
    name: "Chime",
    flag: "🇺🇸",
    customers: 22,
    revenue: 1.3,
    valuation: 25,
    revenuePerUser: 59.1,
    cac: 35,
    market: "USA",
    color: "#10b981",
    profitable: false,
  },
  {
    name: "Monzo",
    flag: "🇬🇧",
    customers: 9.7,
    revenue: 0.48,
    valuation: 5.2,
    revenuePerUser: 49.5,
    cac: 18,
    market: "UK",
    color: "#f59e0b",
    profitable: true,
  },
  {
    name: "N26",
    flag: "🇩🇪",
    customers: 8,
    revenue: 0.21,
    valuation: 9,
    revenuePerUser: 26.3,
    cac: 40,
    market: "Europe",
    color: "#3b82f6",
    profitable: false,
  },
  {
    name: "Nubank",
    flag: "🇧🇷",
    customers: 95,
    revenue: 2.4,
    valuation: 30,
    revenuePerUser: 25.3,
    cac: 5,
    market: "LatAm",
    color: "#8b5cf6",
    profitable: true,
  },
  {
    name: "Starling",
    flag: "🇬🇧",
    customers: 4.2,
    revenue: 0.31,
    valuation: 2.5,
    revenuePerUser: 73.8,
    cac: 22,
    market: "UK",
    color: "#06b6d4",
    profitable: true,
  },
];

const REVENUE_SEGMENTS = [
  { label: "Interchange", pct: 38, color: "#6366f1" },
  { label: "Interest Income", pct: 27, color: "#10b981" },
  { label: "Premium Subs", pct: 18, color: "#f59e0b" },
  { label: "FX & Transfers", pct: 11, color: "#3b82f6" },
  { label: "B2B / BaaS", pct: 6, color: "#ec4899" },
];

const ROADMAP_STAGES = [
  {
    year: "2015–17",
    features: ["Current account", "Debit card", "Mobile app", "Instant notifications"],
  },
  {
    year: "2018–19",
    features: ["Savings pots", "Stock trading", "Crypto", "Premium tiers"],
  },
  {
    year: "2020–21",
    features: ["Lending / credit", "Business accounts", "Insurance", "International expansion"],
  },
  {
    year: "2022–23",
    features: ["Mortgages", "Pension / wealth", "BaaS APIs", "Super-app bundles"],
  },
  {
    year: "2024+",
    features: ["AI financial coach", "Embedded B2B", "Cross-border payroll", "BNPL"],
  },
];

const COHORT_MONTHS = [0, 3, 6, 9, 12, 18, 24];
const COHORT_RETENTION: Record<string, number[]> = {
  "2020": [100, 72, 61, 55, 50, 43, 38],
  "2021": [100, 75, 65, 59, 54, 47, 42],
  "2022": [100, 78, 68, 62, 57, 51, 47],
  "2023": [100, 82, 73, 67, 62, 56, 52],
};
const COHORT_COLORS: Record<string, string> = {
  "2020": "#6366f1",
  "2021": "#10b981",
  "2022": "#f59e0b",
  "2023": "#ec4899",
};

const FUNNEL_STEPS = [
  { label: "Sign-ups", pct: 100, color: "#6366f1" },
  { label: "KYC Verified", pct: 71, color: "#8b5cf6" },
  { label: "First Transaction", pct: 52, color: "#10b981" },
  { label: "Active (30d)", pct: 38, color: "#f59e0b" },
  { label: "Premium Convert", pct: 14, color: "#3b82f6" },
  { label: "Unit Profitable", pct: 9, color: "#ec4899" },
];

const TRAD_BANKS = [
  { name: "JPMorgan", cir: 57, nim: 2.8, acqCost: 350, color: "#3b82f6" },
  { name: "HSBC", cir: 64, nim: 1.6, acqCost: 280, color: "#ef4444" },
  { name: "Barclays", cir: 61, nim: 2.1, acqCost: 310, color: "#6366f1" },
  { name: "BofA", cir: 55, nim: 2.5, acqCost: 320, color: "#10b981" },
];
const NEO_BANKS_CIR = [
  { name: "Revolut", cir: 78, nim: 1.1, acqCost: 20, color: "#6366f1" },
  { name: "Nubank", cir: 52, nim: 4.2, acqCost: 5, color: "#8b5cf6" },
  { name: "Monzo", cir: 85, nim: 0.8, acqCost: 18, color: "#f59e0b" },
  { name: "Starling", cir: 48, nim: 2.3, acqCost: 22, color: "#06b6d4" },
];

const FEATURE_CADENCE = [
  { bank: "JPMorgan", releases: 4, color: "#3b82f6" },
  { bank: "HSBC", releases: 3, color: "#ef4444" },
  { bank: "Barclays", releases: 5, color: "#6366f1" },
  { bank: "Revolut", releases: 52, color: "#10b981" },
  { bank: "Monzo", releases: 36, color: "#f59e0b" },
  { bank: "Nubank", releases: 48, color: "#8b5cf6" },
];

const GLOBAL_USERS = [
  { year: "2018", users: 23 },
  { year: "2019", users: 58 },
  { year: "2020", users: 98 },
  { year: "2021", users: 145 },
  { year: "2022", users: 198 },
  { year: "2023", users: 264 },
  { year: "2024", users: 340 },
];

const REGION_PENETRATION = [
  { region: "Europe", pct: 28, color: "#6366f1" },
  { region: "North America", pct: 22, color: "#10b981" },
  { region: "Latin America", pct: 35, color: "#8b5cf6" },
  { region: "Asia-Pacific", pct: 18, color: "#f59e0b" },
  { region: "Africa/ME", pct: 12, color: "#3b82f6" },
  { region: "Rest of World", pct: 8, color: "#ec4899" },
];

const PROFIT_TIMELINE = [
  { name: "Nubank", year: 2023, color: "#8b5cf6" },
  { name: "Revolut", year: 2023, color: "#6366f1" },
  { name: "Monzo", year: 2024, color: "#f59e0b" },
  { name: "Starling", year: 2022, color: "#06b6d4" },
  { name: "Chime", year: 2026, color: "#10b981" },
  { name: "N26", year: 2027, color: "#3b82f6" },
];

// ── SVG Components ──────────────────────────────────────────────────────────

function DonutChart() {
  const cx = 100;
  const cy = 100;
  const r = 65;
  const innerR = 40;
  const total = REVENUE_SEGMENTS.reduce((a, b) => a + b.pct, 0);
  let startAngle = -Math.PI / 2;

  const slices = REVENUE_SEGMENTS.map((seg) => {
    const angle = (seg.pct / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;
    const midAngle = startAngle + angle / 2;
    const lx = cx + (r + 12) * Math.cos(midAngle);
    const ly = cy + (r + 12) * Math.sin(midAngle);
    startAngle = endAngle;
    return { ...seg, d, lx, ly };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 200" className="w-48 h-48">
        {slices.map((s) => (
          <path key={s.label} d={s.d} fill={s.color} opacity={0.9} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#e2e8f0" fontSize={10} fontWeight="600">
          Revenue
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#94a3b8" fontSize={8}>
          Mix
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        {REVENUE_SEGMENTS.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            {s.label} <span className="text-slate-500">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CohortRetentionChart() {
  const W = 520;
  const H = 220;
  const pad = { top: 16, right: 20, bottom: 40, left: 40 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const xScale = (i: number) => pad.left + (i / (COHORT_MONTHS.length - 1)) * iW;
  const yScale = (v: number) => pad.top + iH - (v / 100) * iH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Grid */}
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={pad.left} x2={W - pad.right} y1={yScale(v)} y2={yScale(v)} stroke="#1e293b" strokeWidth={1} />
          <text x={pad.left - 6} y={yScale(v) + 4} textAnchor="end" fill="#64748b" fontSize={9}>
            {v}%
          </text>
        </g>
      ))}
      {/* X axis labels */}
      {COHORT_MONTHS.map((m, i) => (
        <text key={m} x={xScale(i)} y={H - pad.bottom + 14} textAnchor="middle" fill="#64748b" fontSize={9}>
          M{m}
        </text>
      ))}
      {/* Lines */}
      {Object.entries(COHORT_RETENTION).map(([year, values]) => {
        const pts = values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
        return (
          <g key={year}>
            <polyline points={pts} fill="none" stroke={COHORT_COLORS[year]} strokeWidth={2} strokeLinejoin="round" />
            {values.map((v, i) => (
              <circle key={i} cx={xScale(i)} cy={yScale(v)} r={3} fill={COHORT_COLORS[year]} />
            ))}
          </g>
        );
      })}
      {/* Legend */}
      {Object.entries(COHORT_COLORS).map(([year, color], i) => (
        <g key={year} transform={`translate(${pad.left + i * 70}, ${H - 10})`}>
          <rect width={8} height={8} rx={2} fill={color} y={-6} />
          <text x={11} y={2} fill="#94a3b8" fontSize={9}>
            {year} cohort
          </text>
        </g>
      ))}
    </svg>
  );
}

function FunnelChart() {
  const W = 460;
  const H = 260;
  const steps = FUNNEL_STEPS.length;
  const rowH = H / steps;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {FUNNEL_STEPS.map((step, i) => {
        const topW = W * 0.9 * (step.pct / 100);
        const nextPct = FUNNEL_STEPS[i + 1]?.pct ?? step.pct;
        const botW = W * 0.9 * (nextPct / 100);
        const cx = W / 2;
        const y = i * rowH;
        const x1 = cx - topW / 2;
        const x2 = cx + topW / 2;
        const x3 = cx + botW / 2;
        const x4 = cx - botW / 2;
        const path = `M ${x1} ${y} L ${x2} ${y} L ${x3} ${y + rowH - 2} L ${x4} ${y + rowH - 2} Z`;
        return (
          <g key={step.label}>
            <path d={path} fill={step.color} opacity={0.8} />
            <text x={cx} y={y + rowH / 2 + 1} textAnchor="middle" fill="#fff" fontSize={10} fontWeight="600">
              {step.label}
            </text>
            <text x={cx + topW / 2 + 8} y={y + rowH / 2 + 1} fill="#94a3b8" fontSize={9}>
              {step.pct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface CACPaybackProps {
  cac: number;
  monthlyRevPerUser: number;
}
function CACPaybackChart({ cac, monthlyRevPerUser }: CACPaybackProps) {
  const W = 480;
  const H = 200;
  const pad = { top: 16, right: 20, bottom: 36, left: 48 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const months = 36;
  const grossMargin = 0.65;
  const monthlyGP = monthlyRevPerUser * grossMargin;
  const paybackMonth = monthlyGP > 0 ? Math.ceil(cac / monthlyGP) : months + 1;

  const xScale = (m: number) => pad.left + (m / months) * iW;
  const maxVal = Math.max(cac * 1.1, monthlyGP * months * 0.5);
  const yScale = (v: number) => pad.top + iH - (v / maxVal) * iH;

  const cumulativeGP = Array.from({ length: months + 1 }, (_, m) => m * monthlyGP);
  const gpPts = cumulativeGP.map((v, m) => `${xScale(m)},${yScale(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const v = maxVal * f;
        return (
          <g key={f}>
            <line x1={pad.left} x2={W - pad.right} y1={yScale(v)} y2={yScale(v)} stroke="#1e293b" strokeWidth={1} />
            <text x={pad.left - 6} y={yScale(v) + 4} textAnchor="end" fill="#64748b" fontSize={9}>
              ${Math.round(v)}
            </text>
          </g>
        );
      })}
      {/* Cumulative GP line */}
      <polyline points={gpPts} fill="none" stroke="#10b981" strokeWidth={2} />
      {/* CAC line */}
      <line x1={pad.left} x2={W - pad.right} y1={yScale(cac)} y2={yScale(cac)} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={W - pad.right + 3} y={yScale(cac) + 4} fill="#ef4444" fontSize={9}>
        CAC
      </text>
      {/* Payback marker */}
      {paybackMonth <= months && (
        <>
          <line x1={xScale(paybackMonth)} x2={xScale(paybackMonth)} y1={pad.top} y2={pad.top + iH} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />
          <text x={xScale(paybackMonth) + 4} y={pad.top + 14} fill="#f59e0b" fontSize={9}>
            Payback M{paybackMonth}
          </text>
        </>
      )}
      {/* X axis */}
      {[0, 6, 12, 18, 24, 30, 36].map((m) => (
        <text key={m} x={xScale(m)} y={H - pad.bottom + 14} textAnchor="middle" fill="#64748b" fontSize={9}>
          M{m}
        </text>
      ))}
      {/* Legend */}
      <g transform={`translate(${pad.left}, ${H - 10})`}>
        <rect width={8} height={8} rx={2} fill="#10b981" y={-6} />
        <text x={11} y={2} fill="#94a3b8" fontSize={9}>
          Cumulative Gross Profit
        </text>
      </g>
    </svg>
  );
}

function CIRChart() {
  const allBanks = [...TRAD_BANKS, ...NEO_BANKS_CIR];
  const W = 520;
  const H = 220;
  const pad = { top: 16, right: 20, bottom: 60, left: 20 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const barW = (iW / allBanks.length) * 0.6;
  const gap = iW / allBanks.length;
  const maxCIR = 100;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 25, 50, 75, 100].map((v) => {
        const y = pad.top + iH - (v / maxCIR) * iH;
        return (
          <g key={v}>
            <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#1e293b" strokeWidth={1} />
            <text x={pad.left - 2} y={y + 4} textAnchor="end" fill="#64748b" fontSize={8}>
              {v}%
            </text>
          </g>
        );
      })}
      {allBanks.map((bank, i) => {
        const bH = (bank.cir / maxCIR) * iH;
        const x = pad.left + gap * i + gap / 2 - barW / 2;
        const y = pad.top + iH - bH;
        const isNeo = NEO_BANKS_CIR.some((n) => n.name === bank.name);
        return (
          <g key={bank.name}>
            <rect x={x} y={y} width={barW} height={bH} rx={3} fill={bank.color} opacity={0.85} />
            {isNeo && (
              <rect x={x} y={pad.top} width={barW} height={iH} rx={3} fill={bank.color} opacity={0.07} />
            )}
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="#e2e8f0" fontSize={9} fontWeight="600">
              {bank.cir}%
            </text>
            <text
              x={x + barW / 2}
              y={H - pad.bottom + 14}
              textAnchor="middle"
              fill={isNeo ? "#a5b4fc" : "#94a3b8"}
              fontSize={9}
              transform={`rotate(-30, ${x + barW / 2}, ${H - pad.bottom + 14})`}
            >
              {bank.name}
            </text>
          </g>
        );
      })}
      {/* Divider between trad and neo */}
      <line
        x1={pad.left + gap * TRAD_BANKS.length - 6}
        x2={pad.left + gap * TRAD_BANKS.length - 6}
        y1={pad.top}
        y2={pad.top + iH}
        stroke="#334155"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <text x={pad.left + gap * TRAD_BANKS.length - 8} y={pad.top + 10} textAnchor="end" fill="#64748b" fontSize={8}>
        Traditional
      </text>
      <text x={pad.left + gap * TRAD_BANKS.length} y={pad.top + 10} fill="#6366f1" fontSize={8}>
        Neobanks ↓
      </text>
    </svg>
  );
}

function FeatureCadenceChart() {
  const W = 480;
  const H = 200;
  const pad = { top: 16, right: 20, bottom: 50, left: 20 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const maxR = Math.max(...FEATURE_CADENCE.map((f) => f.releases));
  const barW = (iW / FEATURE_CADENCE.length) * 0.55;
  const gap = iW / FEATURE_CADENCE.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 10, 20, 30, 40, 52].map((v) => {
        const y = pad.top + iH - (v / maxR) * iH;
        return (
          <g key={v}>
            <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#1e293b" strokeWidth={1} />
            <text x={pad.left - 2} y={y + 4} textAnchor="end" fill="#64748b" fontSize={8}>
              {v}
            </text>
          </g>
        );
      })}
      {FEATURE_CADENCE.map((f, i) => {
        const bH = (f.releases / maxR) * iH;
        const x = pad.left + gap * i + gap / 2 - barW / 2;
        const y = pad.top + iH - bH;
        const isNeo = i >= 3;
        return (
          <g key={f.bank}>
            <rect x={x} y={y} width={barW} height={bH} rx={3} fill={f.color} opacity={0.85} />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="#e2e8f0" fontSize={9} fontWeight="600">
              {f.releases}
            </text>
            <text
              x={x + barW / 2}
              y={H - pad.bottom + 14}
              textAnchor="middle"
              fill={isNeo ? "#a5b4fc" : "#94a3b8"}
              fontSize={9}
              transform={`rotate(-25, ${x + barW / 2}, ${H - pad.bottom + 14})`}
            >
              {f.bank}
            </text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 4} textAnchor="middle" fill="#64748b" fontSize={9}>
        Major feature releases per year
      </text>
    </svg>
  );
}

function GlobalUsersChart() {
  const W = 520;
  const H = 220;
  const pad = { top: 16, right: 20, bottom: 40, left: 48 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const maxUsers = 360;
  const barW = (iW / GLOBAL_USERS.length) * 0.6;
  const gap = iW / GLOBAL_USERS.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 100, 200, 300].map((v) => {
        const y = pad.top + iH - (v / maxUsers) * iH;
        return (
          <g key={v}>
            <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#1e293b" strokeWidth={1} />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fill="#64748b" fontSize={9}>
              {v}M
            </text>
          </g>
        );
      })}
      {GLOBAL_USERS.map((d, i) => {
        const bH = (d.users / maxUsers) * iH;
        const x = pad.left + gap * i + gap / 2 - barW / 2;
        const y = pad.top + iH - bH;
        const grad = `#6366f1`;
        return (
          <g key={d.year}>
            <rect x={x} y={y} width={barW} height={bH} rx={3} fill={grad} opacity={0.7 + i * 0.04} />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="#e2e8f0" fontSize={9} fontWeight="600">
              {d.users}M
            </text>
            <text x={x + barW / 2} y={H - pad.bottom + 14} textAnchor="middle" fill="#94a3b8" fontSize={10}>
              {d.year}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RegionPenetrationChart() {
  const W = 400;
  const H = 220;
  const pad = { top: 16, right: 20, bottom: 40, left: 80 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const rowH = iH / REGION_PENETRATION.length;
  const maxPct = 40;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {REGION_PENETRATION.map((d, i) => {
        const bW = (d.pct / maxPct) * iW;
        const y = pad.top + i * rowH + rowH * 0.15;
        const bH = rowH * 0.7;
        return (
          <g key={d.region}>
            <text x={pad.left - 6} y={y + bH / 2 + 4} textAnchor="end" fill="#94a3b8" fontSize={9}>
              {d.region}
            </text>
            <rect x={pad.left} y={y} width={bW} height={bH} rx={3} fill={d.color} opacity={0.85} />
            <text x={pad.left + bW + 4} y={y + bH / 2 + 4} fill="#e2e8f0" fontSize={9} fontWeight="600">
              {d.pct}%
            </text>
          </g>
        );
      })}
      <text x={pad.left + iW / 2} y={H - 8} textAnchor="middle" fill="#64748b" fontSize={9}>
        % of adult population using a neobank
      </text>
    </svg>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function NeobanksPage() {
  const [cac, setCAC] = useState(25);
  const [monthlyRevPerUser, setMonthlyRevPerUser] = useState(8);

  const ltv = monthlyRevPerUser * 0.65 * 24; // 24-month horizon, 65% margin
  const ltvCacRatio = cac > 0 ? (ltv / cac).toFixed(2) : "—";
  const paybackMonths = monthlyRevPerUser * 0.65 > 0 ? Math.ceil(cac / (monthlyRevPerUser * 0.65)) : 99;

  const handleCACChange = useCallback((v: number[]) => setCAC(v[0]), []);
  const handleRevChange = useCallback((v: number[]) => setMonthlyRevPerUser(v[0]), []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-400" />
              Neobank & Challenger Bank Economics
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Unit economics, revenue models, regulatory dynamics, and competitive landscape vs traditional banks
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 text-xs">
              340M+ Users Globally
            </Badge>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 text-xs">
              $500B+ Combined Valuation
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="business-model" className="w-full">
          <TabsList className="bg-slate-900 border border-slate-800 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="business-model" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs sm:text-sm">
              <DollarSign className="w-3.5 h-3.5 mr-1" /> Business Model
            </TabsTrigger>
            <TabsTrigger value="unit-economics" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs sm:text-sm">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Unit Economics
            </TabsTrigger>
            <TabsTrigger value="vs-traditional" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs sm:text-sm">
              <BarChart3 className="w-3.5 h-3.5 mr-1" /> vs Traditional Banks
            </TabsTrigger>
            <TabsTrigger value="market-dynamics" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs sm:text-sm">
              <Globe className="w-3.5 h-3.5 mr-1" /> Market Dynamics
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: Business Model ─────────────────────────────────────── */}
          <TabsContent value="business-model" className="mt-4 space-y-6 data-[state=inactive]:hidden">
            <AnimatePresence mode="wait">
              <motion.div key="bm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                {/* Comparison Table */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" /> Neobank Profiles — Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-800">
                            {["Bank", "Customers", "Revenue", "Valuation", "Rev/User", "CAC", "Market", "Profitable"].map((h) => (
                              <th key={h} className="text-left py-2 px-3 text-slate-400 font-medium whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {NEOBANKS.map((nb) => (
                            <tr key={nb.name} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ background: nb.color }}
                                  />
                                  <span className="font-medium text-slate-200">
                                    {nb.flag} {nb.name}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-300">{nb.customers}M</td>
                              <td className="py-2.5 px-3 text-slate-300">${nb.revenue}B</td>
                              <td className="py-2.5 px-3 text-slate-300">${nb.valuation}B</td>
                              <td className="py-2.5 px-3 text-slate-300">${nb.revenuePerUser}</td>
                              <td className="py-2.5 px-3 text-slate-300">${nb.cac}</td>
                              <td className="py-2.5 px-3 text-slate-400">{nb.market}</td>
                              <td className="py-2.5 px-3">
                                <Badge
                                  variant="outline"
                                  className={nb.profitable ? "border-emerald-500/40 text-emerald-400 text-[10px]" : "border-red-500/40 text-red-400 text-[10px]"}
                                >
                                  {nb.profitable ? "Yes" : "No"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      * Revenue/User = annual revenue ÷ active customers. CAC = blended customer acquisition cost (USD). Data as of 2024.
                    </p>
                  </CardContent>
                </Card>

                {/* Revenue Breakdown + Product Roadmap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-200">
                        Revenue Mix (Industry Average)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DonutChart />
                      <div className="mt-4 space-y-2 text-xs text-slate-400">
                        <p>
                          <span className="text-slate-200 font-medium">Interchange:</span> Card swipe fees (~1.5–2%) split between card network and issuer.
                        </p>
                        <p>
                          <span className="text-slate-200 font-medium">Interest Income:</span> Rapidly growing as neobanks expand lending books.
                        </p>
                        <p>
                          <span className="text-slate-200 font-medium">Premium Subs:</span> Metal/Plus tiers — Revolut Metal ($16.99/mo), Monzo Premium (£15/mo).
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" /> Product Evolution Roadmap
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {ROADMAP_STAGES.map((stage, i) => (
                          <div key={stage.year} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                                style={{ background: `hsl(${220 + i * 20}, 70%, 55%)` }}
                              >
                                {i + 1}
                              </div>
                              {i < ROADMAP_STAGES.length - 1 && (
                                <div className="w-px flex-1 bg-slate-700 mt-1" />
                              )}
                            </div>
                            <div className="pb-3">
                              <p className="text-xs font-semibold text-slate-300 mb-1">{stage.year}</p>
                              <div className="flex flex-wrap gap-1">
                                {stage.features.map((f) => (
                                  <Badge
                                    key={f}
                                    variant="outline"
                                    className="text-[10px] border-slate-700 text-slate-400 py-0"
                                  >
                                    {f}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── TAB 2: Unit Economics ─────────────────────────────────────── */}
          <TabsContent value="unit-economics" className="mt-4 space-y-6 data-[state=inactive]:hidden">
            <AnimatePresence mode="wait">
              <motion.div key="ue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                {/* CAC Calculator */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" /> CAC Payback Period Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-400">Customer Acquisition Cost (CAC)</span>
                          <span className="text-slate-200 font-semibold">${cac}</span>
                        </div>
                        <Slider
                          min={5}
                          max={150}
                          step={5}
                          value={[cac]}
                          onValueChange={handleCACChange}
                          className="w-full"
                        />
                        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                          <span>$5 (Nubank)</span>
                          <span>$150 (legacy neobank)</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-400">Monthly Revenue per Active User</span>
                          <span className="text-slate-200 font-semibold">${monthlyRevPerUser}</span>
                        </div>
                        <Slider
                          min={1}
                          max={25}
                          step={1}
                          value={[monthlyRevPerUser]}
                          onValueChange={handleRevChange}
                          className="w-full"
                        />
                        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                          <span>$1 (early stage)</span>
                          <span>$25 (mature)</span>
                        </div>
                      </div>
                    </div>

                    {/* KPI chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {[
                        { label: "CAC", value: `$${cac}`, color: "text-red-400" },
                        { label: "LTV (24mo)", value: `$${ltv.toFixed(0)}`, color: "text-emerald-400" },
                        { label: "LTV / CAC", value: ltvCacRatio, color: parseFloat(ltvCacRatio as string) >= 3 ? "text-emerald-400" : "text-amber-400" },
                        { label: "Payback", value: paybackMonths <= 36 ? `${paybackMonths}mo` : ">36mo", color: paybackMonths <= 18 ? "text-emerald-400" : paybackMonths <= 30 ? "text-amber-400" : "text-red-400" },
                      ].map((kpi) => (
                        <div key={kpi.label} className="bg-slate-800 rounded-lg p-3 text-center">
                          <p className="text-xs text-slate-400">{kpi.label}</p>
                          <p className={`text-xl font-bold ${kpi.color} mt-1`}>{kpi.value}</p>
                        </div>
                      ))}
                    </div>

                    <CACPaybackChart cac={cac} monthlyRevPerUser={monthlyRevPerUser} />
                    <p className="text-xs text-slate-500 mt-2">
                      Assumes 65% gross margin. LTV = monthly GP × 24 months horizon. Industry benchmark: LTV/CAC &gt; 3× considered healthy.
                    </p>
                  </CardContent>
                </Card>

                {/* Cohort Retention + Funnel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-200">
                        Cohort Retention by Year
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CohortRetentionChart />
                      <p className="text-xs text-slate-500 mt-2">
                        Retention improving YoY as neobanks deepen product stickiness. 2023 cohort 52% better than 2020 at M24.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-200">
                        Engagement Funnel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FunnelChart />
                      <p className="text-xs text-slate-500 mt-3">
                        Only ~9% of sign-ups become unit-profitable. Key lever: converting actives to premium tiers (14%).
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Breakeven insight */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" /> Breakeven Analysis — Key Levers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          lever: "Reduce CAC",
                          desc: "Viral referral loops, social media-first growth vs paid acquisition. Nubank achieved $5 CAC via WhatsApp referrals in Brazil.",
                          impact: "High",
                          color: "emerald",
                        },
                        {
                          lever: "Increase ARPU",
                          desc: "Cross-sell lending, premium tiers, insurance, and investment products. Revolut ARPU 3× higher for Metal subscribers.",
                          impact: "High",
                          color: "indigo",
                        },
                        {
                          lever: "Improve Retention",
                          desc: "Each 10% improvement in M12 retention improves LTV by ~$15–25. Direct deposits and salary accounts are key anchors.",
                          impact: "Medium",
                          color: "amber",
                        },
                      ].map((item) => (
                        <div key={item.lever} className="bg-slate-800 rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-200">{item.lever}</p>
                            <Badge
                              variant="outline"
                              className={`text-[10px] border-${item.color}-500/40 text-${item.color}-400`}
                            >
                              {item.impact} Impact
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── TAB 3: vs Traditional Banks ──────────────────────────────── */}
          <TabsContent value="vs-traditional" className="mt-4 space-y-6 data-[state=inactive]:hidden">
            <AnimatePresence mode="wait">
              <motion.div key="vt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                {/* Cost-to-Income Ratio */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-400" /> Cost-to-Income Ratio (CIR) — Traditional vs Neobank
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CIRChart />
                    <p className="text-xs text-slate-500 mt-2">
                      Lower CIR = more efficient. Note: Mature neobanks (Nubank 52%, Starling 48%) already beat traditional banks. High-growth neobanks (Monzo 85%) still invest heavily in growth.
                    </p>
                  </CardContent>
                </Card>

                {/* NIM + Acquisition Cost comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-200">
                        Net Interest Margin (NIM) Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[...TRAD_BANKS, ...NEO_BANKS_CIR].map((b) => {
                          const isNeo = NEO_BANKS_CIR.some((n) => n.name === b.name);
                          const maxNIM = 4.5;
                          return (
                            <div key={b.name} className="flex items-center gap-3">
                              <span className={`text-xs w-20 flex-shrink-0 ${isNeo ? "text-indigo-300" : "text-slate-400"}`}>
                                {b.name}
                              </span>
                              <div className="flex-1 bg-slate-800 rounded-full h-5 overflow-hidden">
                                <div
                                  className="h-full rounded-full flex items-center justify-end pr-2 text-[10px] text-white font-medium"
                                  style={{
                                    width: `${(b.nim / maxNIM) * 100}%`,
                                    background: b.color,
                                    opacity: 0.85,
                                  }}
                                >
                                  {b.nim}%
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] flex-shrink-0 ${isNeo ? "border-indigo-500/40 text-indigo-400" : "border-slate-600 text-slate-500"}`}
                              >
                                {isNeo ? "Neo" : "Trad"}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-500 mt-3">
                        Nubank's 4.2% NIM exceeds major US banks due to high-rate Brazilian credit cards. Most neobanks still have low NIM as lending books mature.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-200">
                        Digital vs Branch Acquisition Cost
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { channel: "Branch walk-in", cost: 350, type: "traditional" },
                          { channel: "Direct mail / ATM", cost: 285, type: "traditional" },
                          { channel: "TV / Radio ads", cost: 175, type: "traditional" },
                          { channel: "Digital (trad bank)", cost: 120, type: "traditional" },
                          { channel: "Social media (neo)", cost: 28, type: "neobank" },
                          { channel: "Referral viral (neo)", cost: 12, type: "neobank" },
                        ].map((item) => {
                          const maxCost = 380;
                          return (
                            <div key={item.channel} className="flex items-center gap-3">
                              <span className={`text-xs w-36 flex-shrink-0 ${item.type === "neobank" ? "text-indigo-300" : "text-slate-400"}`}>
                                {item.channel}
                              </span>
                              <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${(item.cost / maxCost) * 100}%`,
                                    background: item.type === "neobank" ? "#10b981" : "#6366f1",
                                    opacity: 0.8,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-300 w-10 text-right">${item.cost}</span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-500 mt-3">
                        Digital-native distribution: neobanks spend 10–30× less per acquired customer vs traditional branch networks.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Feature Cadence */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" /> Speed of Innovation — Feature Releases per Year
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FeatureCadenceChart />
                    <p className="text-xs text-slate-500 mt-2">
                      Neobanks ship weekly (Revolut: 52 major releases/yr) vs traditional banks on quarterly or annual release cycles constrained by legacy core banking systems.
                    </p>
                  </CardContent>
                </Card>

                {/* Regulatory + Embedded Finance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-400" /> Regulatory Capital Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      {[
                        { item: "Full banking license (UK)", req: "Min £5M capital + CET1 ≥ 8%", color: "text-red-400" },
                        { item: "E-money institution (EU)", req: "Min €350K capital, no lending", color: "text-amber-400" },
                        { item: "US bank charter (OCC)", req: "Risk-based capital >10% 'well-capitalized'", color: "text-red-400" },
                        { item: "US fintech ILC charter", req: "Lighter oversight, FDI insured", color: "text-emerald-400" },
                        { item: "BaaS / sponsor bank model", req: "Partner bank holds charter, neobank is frontend", color: "text-indigo-400" },
                        { item: "Brazil (BCB open finance)", req: "Payment Initiation License — lower barrier", color: "text-emerald-400" },
                      ].map((r) => (
                        <div key={r.item} className="flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className={`font-medium ${r.color}`}>{r.item}: </span>
                            <span className="text-slate-400">{r.req}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-emerald-400" /> Embedded Finance Advantage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs text-slate-400">
                      {[
                        {
                          title: "Open Banking APIs",
                          desc: "PSD2 (EU) and CDR (AU) mandate banks to share customer data via APIs — giving neobanks aggregation power traditional banks lack.",
                        },
                        {
                          title: "BaaS Revenue Stream",
                          desc: "Starling Bank earns £50M+ annually licensing its banking-as-a-service platform to fintech startups — pure high-margin SaaS revenue.",
                        },
                        {
                          title: "No Core Banking Legacy",
                          desc: "Cloud-native core (Thought Machine, Mambu) cuts infrastructure cost by ~60% vs legacy mainframe systems still running most large banks.",
                        },
                        {
                          title: "Real-Time Data Moat",
                          desc: "Transaction-level data on millions of users enables superior credit underwriting — Nubank's loss rate is 50% lower than peer Brazilian lenders.",
                        },
                      ].map((item) => (
                        <div key={item.title} className="bg-slate-800 rounded-lg p-3">
                          <p className="font-medium text-slate-200 mb-1">{item.title}</p>
                          <p className="leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── TAB 4: Market Dynamics ────────────────────────────────────── */}
          <TabsContent value="market-dynamics" className="mt-4 space-y-6 data-[state=inactive]:hidden">
            <AnimatePresence mode="wait">
              <motion.div key="md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                {/* Global Users Chart */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-400" /> Global Neobank Users (Millions, 2018–2024)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GlobalUsersChart />
                    <p className="text-xs text-slate-500 mt-2">
                      CAGR of ~57% 2018–2024. Forecast 500M+ by 2026. Emerging markets (LatAm, Africa) growing fastest.
                    </p>
                  </CardContent>
                </Card>

                {/* Penetration + Profitability */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-200">
                        Market Penetration by Region
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RegionPenetrationChart />
                      <p className="text-xs text-slate-500 mt-2">
                        Latin America leads globally driven by Nubank's 95M+ customers in Brazil, Mexico, and Colombia.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" /> Profitability Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mt-2">
                        {PROFIT_TIMELINE.sort((a, b) => a.year - b.year).map((p) => {
                          const isFuture = p.year > 2025;
                          return (
                            <div key={p.name} className="flex items-center gap-3">
                              <span className="text-xs text-slate-400 w-16 flex-shrink-0">{p.name}</span>
                              <div className="flex-1 flex items-center gap-2">
                                <div
                                  className="h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold text-white px-3"
                                  style={{
                                    background: isFuture ? "#334155" : p.color,
                                    minWidth: 80,
                                    opacity: isFuture ? 0.7 : 1,
                                    border: isFuture ? "1px dashed #475569" : "none",
                                  }}
                                >
                                  {isFuture ? `Est. ${p.year}` : `Profitable ${p.year}`}
                                </div>
                                {isFuture && (
                                  <span className="text-[10px] text-slate-500 italic">forecast</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-500 mt-3">
                        4 of 6 major neobanks now profitable (2024). Starling first to profitability (2022). N26 targeting 2027 after costly US exit.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Consolidation + BNPL + BaaS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-amber-400" /> Consolidation Predictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-400 space-y-2">
                      <p>The neobank space will consolidate from ~400 globally to ~50–80 by 2028. Key drivers:</p>
                      <ul className="space-y-1.5 mt-2">
                        {[
                          "Rising regulatory costs make sub-1M customer bases unviable",
                          "VC funding dried up post-2022; profitability now required",
                          "M&A by traditional banks (BBVA → Simple, Goldman → GreenSky)",
                          "Super-apps (Revolut, Nubank) absorbing smaller players",
                        ].map((pt) => (
                          <li key={pt} className="flex gap-1.5">
                            <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-400" /> BNPL Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-400 space-y-2">
                      <p>Buy-Now-Pay-Later embedded in neobank apps is a major ARPU driver:</p>
                      <ul className="space-y-1.5 mt-2">
                        {[
                          "Revolut Pay Later — 0% 3-month installments, merchant fee model",
                          "Nubank Pix Credit — instant BNPL integrated with Brazil's national payments",
                          "Monzo Flex — 3/6/12 month splits, ~3% merchant fee + interchange",
                          "Conversion: BNPL users have 2.4× higher monthly transaction volume",
                        ].map((pt) => (
                          <li key={pt} className="flex gap-1.5">
                            <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-purple-400" /> Banking-as-a-Service (BaaS)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-400 space-y-2">
                      <p>Leading neobanks monetizing infrastructure as a platform business:</p>
                      <ul className="space-y-1.5 mt-2">
                        {[
                          "Starling Engine: 30+ fintech clients on its core banking stack",
                          "Solaris Bank (Germany): BaaS-pure-play, €1.6B valuation",
                          "Railsr / Modulr: card-issuing APIs powering 200+ B2B clients",
                          "BaaS TAM forecast $22B by 2028 — higher margin than retail banking",
                        ].map((pt) => (
                          <li key={pt} className="flex gap-1.5">
                            <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Key takeaways */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-200">Key Takeaways</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {[
                        {
                          title: "Profitability is achievable",
                          desc: "Nubank, Revolut, Monzo, and Starling have all demonstrated sustainable unit economics. The 'neobanks can't make money' narrative is outdated.",
                          color: "border-l-emerald-500",
                        },
                        {
                          title: "LTV/CAC is the north star",
                          desc: "Healthy neobanks target LTV/CAC > 3×. Viral growth (referrals, social) is the key differentiator, keeping CAC 10–30× below incumbents.",
                          color: "border-l-indigo-500",
                        },
                        {
                          title: "Geography matters enormously",
                          desc: "Emerging markets (Brazil, India, Nigeria) offer largest TAMs with underbanked populations, lower competition, and high mobile penetration.",
                          color: "border-l-amber-500",
                        },
                        {
                          title: "Super-app is the endgame",
                          desc: "The winner will be the financial super-app bundling banking, investing, insurance, and payments. Revolut (45M users) is closest in the West.",
                          color: "border-l-purple-500",
                        },
                      ].map((item) => (
                        <div key={item.title} className={`border-l-2 pl-3 ${item.color}`}>
                          <p className="font-semibold text-slate-200 mb-1">{item.title}</p>
                          <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
