"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Layers,
  Info,
  Wind,
  Zap,
  Droplets,
  Flame,
  Globe,
  DollarSign,
  PieChart,
  Activity,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 722006;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 722006;
}

// ── Shared UI helpers ──────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
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
  color?: "green" | "red" | "amber" | "blue" | "purple" | "default";
}) {
  const cls = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    blue: "bg-primary/10 text-primary border-border",
    purple: "bg-primary/10 text-primary border-border",
    default: "bg-muted text-muted-foreground border-border",
  }[color];
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-center", cls)}>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function InfoBox({
  title,
  children,
  variant = "default",
}: {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "green" | "amber" | "blue" | "purple";
}) {
  const cls = {
    default: "border-border bg-muted/30",
    green: "border-green-500/20 bg-green-500/5",
    amber: "border-amber-500/20 bg-amber-500/5",
    blue: "border-border bg-primary/5",
    purple: "border-border bg-primary/5",
  }[variant];
  return (
    <div className={cn("rounded-lg border p-4", cls)}>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</div>
      <div className="text-sm text-foreground/80 space-y-1">{children}</div>
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────

interface IssuanceYear {
  year: number;
  issued: number; // $B
  outstanding: number; // $B
}

const ISSUANCE_DATA: IssuanceYear[] = [
  { year: 2015, issued: 6.8, outstanding: 23.4 },
  { year: 2016, issued: 5.9, outstanding: 24.2 },
  { year: 2017, issued: 10.2, outstanding: 30.1 },
  { year: 2018, issued: 13.8, outstanding: 35.4 },
  { year: 2019, issued: 11.7, outstanding: 38.2 },
  { year: 2020, issued: 9.4, outstanding: 39.8 },
  { year: 2021, issued: 12.6, outstanding: 42.1 },
  { year: 2022, issued: 8.9, outstanding: 40.3 },
  { year: 2023, issued: 15.1, outstanding: 45.6 },
  { year: 2024, issued: 17.4, outstanding: 48.2 },
];

interface PerilData {
  peril: string;
  share: number; // %
  icon: React.ReactNode;
  color: string;
  colorClass: string;
}

const PERILS: PerilData[] = [
  { peril: "US Hurricane", share: 38, icon: <Wind size={14} />, color: "#3b82f6", colorClass: "text-primary" },
  { peril: "US Earthquake", share: 20, icon: <Activity size={14} />, color: "#8b5cf6", colorClass: "text-primary" },
  { peril: "Japan Earthquake", share: 10, icon: <Activity size={14} />, color: "#a855f7", colorClass: "text-primary" },
  { peril: "Europe Windstorm", share: 12, icon: <Wind size={14} />, color: "#60a5fa", colorClass: "text-primary" },
  { peril: "Wildfire", share: 8, icon: <Flame size={14} />, color: "#f97316", colorClass: "text-orange-400" },
  { peril: "Flood", share: 7, icon: <Droplets size={14} />, color: "#06b6d4", colorClass: "text-muted-foreground" },
  { peril: "Multi-Peril", share: 5, icon: <Globe size={14} />, color: "#6b7280", colorClass: "text-muted-foreground" },
];

interface CatBond {
  name: string;
  peril: string;
  notional: number; // $M
  attachment: number; // $B
  exhaustion: number; // $B
  expectedLoss: number; // %
  spread: number; // bps over SOFR
  trigger: "indemnity" | "industry index" | "parametric" | "modeled loss";
  rating: string;
  maturity: string;
}

const CAT_BONDS: CatBond[] = [
  {
    name: "Kilimanjaro Re 2024-1",
    peril: "US Hurricane",
    notional: 425,
    attachment: 80,
    exhaustion: 120,
    expectedLoss: 1.8,
    spread: 620,
    trigger: "indemnity",
    rating: "B+",
    maturity: "2027-01",
  },
  {
    name: "Matterhorn Re 2024-2",
    peril: "US Earthquake",
    notional: 300,
    attachment: 60,
    exhaustion: 90,
    expectedLoss: 2.1,
    spread: 710,
    trigger: "parametric",
    rating: "B",
    maturity: "2026-12",
  },
  {
    name: "Calypso Capital 2024-1",
    peril: "Europe Windstorm",
    notional: 200,
    attachment: 18,
    exhaustion: 28,
    expectedLoss: 0.8,
    spread: 380,
    trigger: "industry index",
    rating: "BB-",
    maturity: "2027-06",
  },
  {
    name: "Atlas Capital 2024-3",
    peril: "Japan Earthquake",
    notional: 275,
    attachment: 35,
    exhaustion: 55,
    expectedLoss: 1.4,
    spread: 490,
    trigger: "modeled loss",
    rating: "B+",
    maturity: "2028-03",
  },
  {
    name: "Wildfire Re 2024-1",
    peril: "Wildfire",
    notional: 150,
    attachment: 12,
    exhaustion: 20,
    expectedLoss: 3.2,
    spread: 980,
    trigger: "parametric",
    rating: "B-",
    maturity: "2026-09",
  },
  {
    name: "Everglades Capital 2024-2",
    peril: "US Hurricane",
    notional: 500,
    attachment: 100,
    exhaustion: 150,
    expectedLoss: 1.2,
    spread: 520,
    trigger: "industry index",
    rating: "BB",
    maturity: "2027-04",
  },
];

interface ReturnYear {
  year: number;
  catBond: number;
  corpBond: number;
  equity: number;
}

const RETURN_DATA: ReturnYear[] = [
  { year: 2015, catBond: 5.8, corpBond: 2.1, equity: 1.4 },
  { year: 2016, catBond: 6.2, corpBond: 4.3, equity: 12.0 },
  { year: 2017, catBond: -5.4, corpBond: 4.8, equity: 21.8 }, // Irma/Maria
  { year: 2018, catBond: 1.3, corpBond: -2.2, equity: -4.4 },
  { year: 2019, catBond: 7.4, corpBond: 12.3, equity: 31.5 },
  { year: 2020, catBond: 1.9, corpBond: 9.7, equity: 18.4 },
  { year: 2021, catBond: 3.7, corpBond: -1.0, equity: 28.7 },
  { year: 2022, catBond: -3.2, corpBond: -15.8, equity: -18.1 },
  { year: 2023, catBond: 19.6, corpBond: 5.4, equity: 26.3 },
  { year: 2024, catBond: 14.1, corpBond: 3.2, equity: 9.8 },
];

interface PerilEventData {
  returnPeriod: number; // years
  probability: number; // %/year
  usHurricane: number; // $B loss
  usEarthquake: number; // $B loss
  europeWind: number; // $B loss
}

const PERIL_EVENTS: PerilEventData[] = [
  { returnPeriod: 10, probability: 10.0, usHurricane: 45, usEarthquake: 20, europeWind: 15 },
  { returnPeriod: 25, probability: 4.0, usHurricane: 90, usEarthquake: 55, europeWind: 32 },
  { returnPeriod: 50, probability: 2.0, usHurricane: 145, usEarthquake: 110, europeWind: 58 },
  { returnPeriod: 100, probability: 1.0, usHurricane: 220, usEarthquake: 195, europeWind: 95 },
  { returnPeriod: 200, probability: 0.5, usHurricane: 310, usEarthquake: 310, europeWind: 145 },
  { returnPeriod: 500, probability: 0.2, usHurricane: 480, usEarthquake: 520, europeWind: 225 },
];

interface PortfolioAllocation {
  asset: string;
  weight: number;
  expReturn: number;
  stdDev: number;
  sharpe: number;
}

const PORTFOLIO_ALLOCS: PortfolioAllocation[] = [
  { asset: "Cat Bonds", weight: 10, expReturn: 8.5, stdDev: 6.2, sharpe: 1.05 },
  { asset: "Corp Bonds IG", weight: 30, expReturn: 4.2, stdDev: 5.8, sharpe: 0.52 },
  { asset: "Corp Bonds HY", weight: 10, expReturn: 6.8, stdDev: 11.4, sharpe: 0.44 },
  { asset: "Equities", weight: 40, expReturn: 10.2, stdDev: 16.5, sharpe: 0.50 },
  { asset: "Alternatives", weight: 10, expReturn: 7.4, stdDev: 8.9, sharpe: 0.62 },
];

const CORRELATION_MATRIX = [
  // Cat  Corp IG  Corp HY  Equities  Alts
  [1.0, 0.06, 0.08, 0.03, 0.12], // Cat Bonds
  [0.06, 1.0, 0.72, 0.43, 0.35], // Corp IG
  [0.08, 0.72, 1.0, 0.68, 0.52], // Corp HY
  [0.03, 0.43, 0.68, 1.0, 0.61], // Equities
  [0.12, 0.35, 0.52, 0.61, 1.0], // Alternatives
];

const CORR_LABELS = ["Cat Bonds", "Corp IG", "Corp HY", "Equities", "Alts"];

// ── Trigger type descriptions ─────────────────────────────────────────────────

const TRIGGER_DESCRIPTIONS: Record<CatBond["trigger"], { pros: string[]; cons: string[] }> = {
  indemnity: {
    pros: ["Best match to sponsor's actual losses", "No basis risk for sponsor"],
    cons: ["Longer settlement time (loss development)", "Requires detailed loss data disclosure"],
  },
  "industry index": {
    pros: ["Faster settlement", "Transparent and objective"],
    cons: ["Basis risk — sponsor loss may differ from industry", "Requires industry-level data vendor"],
  },
  parametric: {
    pros: ["Fastest payout — triggered by physical measurement", "Minimal moral hazard"],
    cons: ["High basis risk potential", "May trigger without sponsor loss"],
  },
  "modeled loss": {
    pros: ["Model-based objectivity", "Moderate settlement speed"],
    cons: ["Model uncertainty", "Basis risk from model error"],
  },
};

// ── Tab 1: ILS Market Overview ─────────────────────────────────────────────────

function IssuanceChart() {
  const W = 560;
  const H = 200;
  const PAD = { t: 16, r: 12, b: 36, l: 46 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const maxOut = Math.max(...ISSUANCE_DATA.map((d) => d.outstanding));
  const maxIss = Math.max(...ISSUANCE_DATA.map((d) => d.issued));
  const barW = chartW / ISSUANCE_DATA.length - 4;

  const yScale = (v: number, max: number) => chartH - (v / max) * chartH;
  const xPos = (i: number) => (i / ISSUANCE_DATA.length) * chartW + barW / 2;

  // outstanding line
  const linePoints = ISSUANCE_DATA.map((d, i) => ({
    x: PAD.l + xPos(i),
    y: PAD.t + yScale(d.outstanding, maxOut),
  }));
  const linePath = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl">
      {/* Y-axis gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = PAD.t + t * chartH;
        const label = ((1 - t) * maxOut).toFixed(0);
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#6b7280">
              ${label}B
            </text>
          </g>
        );
      })}

      {/* Bars = annual issuance */}
      {ISSUANCE_DATA.map((d, i) => {
        const barH = (d.issued / maxIss) * chartH;
        const x = PAD.l + (i / ISSUANCE_DATA.length) * chartW + 2;
        return (
          <rect
            key={d.year}
            x={x}
            y={PAD.t + chartH - barH}
            width={barW}
            height={barH}
            fill="#3b82f6"
            fillOpacity={0.55}
            rx={2}
          />
        );
      })}

      {/* Outstanding line */}
      <path d={linePath} fill="none" stroke="#22d3ee" strokeWidth={2} />
      {linePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#22d3ee" />
      ))}

      {/* X-axis labels */}
      {ISSUANCE_DATA.map((d, i) => (
        <text
          key={d.year}
          x={PAD.l + xPos(i)}
          y={H - 6}
          textAnchor="middle"
          fontSize={9}
          fill="#9ca3af"
        >
          {d.year}
        </text>
      ))}

      {/* Legend */}
      <rect x={PAD.l} y={PAD.t - 2} width={10} height={10} fill="#3b82f6" fillOpacity={0.55} rx={2} />
      <text x={PAD.l + 14} y={PAD.t + 8} fontSize={9} fill="#9ca3af">Annual Issuance ($B)</text>
      <circle cx={PAD.l + 130} cy={PAD.t + 3} r={3} fill="#22d3ee" />
      <text x={PAD.l + 136} y={PAD.t + 8} fontSize={9} fill="#9ca3af">Outstanding ($B)</text>
    </svg>
  );
}

function PerilPieChart() {
  const cx = 90;
  const cy = 90;
  const r = 72;
  let startAngle = -Math.PI / 2;

  const slices = PERILS.map((p) => {
    const angle = (p.share / 100) * 2 * Math.PI;
    const midAngle = startAngle + angle / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const endAngle = startAngle + angle;
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const lx = cx + (r + 18) * Math.cos(midAngle);
    const ly = cy + (r + 18) * Math.sin(midAngle);
    startAngle = endAngle;
    return { ...p, path, lx, ly, midAngle };
  });

  return (
    <svg viewBox="0 0 180 180" className="w-44 h-44">
      {slices.map((sl) => (
        <path key={sl.peril} d={sl.path} fill={sl.color} opacity={0.85} stroke="#0f172a" strokeWidth={1} />
      ))}
      {/* center text */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={11} fontWeight="600" fill="#f1f5f9">ILS</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize={9} fill="#94a3b8">Market</text>
    </svg>
  );
}

function MarketOverviewTab() {
  const totalOutstanding = ISSUANCE_DATA[ISSUANCE_DATA.length - 1].outstanding;
  const totalIssued2024 = ISSUANCE_DATA[ISSUANCE_DATA.length - 1].issued;
  const avgSpread = CAT_BONDS.reduce((s, b) => s + b.spread, 0) / CAT_BONDS.length;

  return (
    <div className="space-y-6">
      <div>
        <SectionHeader
          title="ILS Market Overview"
          subtitle="Insurance-linked securities transfer catastrophe risk from insurers to capital markets"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatChip label="Market Outstanding" value={`$${totalOutstanding.toFixed(1)}B`} color="blue" />
          <StatChip label="2024 Issuance" value={`$${totalIssued2024.toFixed(1)}B`} color="green" />
          <StatChip label="Avg Spread" value={`${avgSpread.toFixed(0)} bps`} color="purple" />
          <StatChip label="Active Perils" value="7 Categories" color="amber" />
        </div>
      </div>

      {/* Issuance Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-medium text-foreground mb-3">Annual Issuance vs Outstanding ($B)</div>
        <IssuanceChart />
        <p className="text-xs text-muted-foreground mt-2">
          Annual issuance (blue bars) and total outstanding (teal line). 2023-2024 saw record issuance as reinsurance
          capacity tightened post-Ian.
        </p>
      </div>

      {/* Perils breakdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-medium text-foreground mb-3">Peril Exposure Breakdown</div>
        <div className="flex gap-6 items-start">
          <PerilPieChart />
          <div className="flex-1 grid grid-cols-1 gap-2">
            {PERILS.map((p) => (
              <div key={p.peril} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-xs text-muted-foreground flex-1">{p.peril}</span>
                <span className="text-xs font-medium text-foreground">{p.share}%</span>
                <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${p.share}%`, backgroundColor: p.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key facts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="What are Cat Bonds?" variant="blue">
          <p>Catastrophe bonds (cat bonds) are high-yield debt instruments that allow insurers and reinsurers to
            transfer specific insurance risks — such as hurricane, earthquake, or wildfire — to capital markets investors.</p>
          <p className="mt-1.5">If a defined triggering event occurs, investors can lose part or all of their principal,
            which compensates the issuer for catastrophe losses.</p>
        </InfoBox>
        <InfoBox title="ILS Market Growth Drivers" variant="green">
          <ul className="list-disc list-inside space-y-1">
            <li>Rising insured losses from climate-linked events</li>
            <li>Traditional reinsurance capacity constraints</li>
            <li>Near-zero correlation to financial markets</li>
            <li>Record spreads post-Hurricane Ian (2022)</li>
            <li>Growing pension/endowment interest in uncorrelated assets</li>
            <li>Regulatory Solvency II treatment as risk mitigation</li>
          </ul>
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 2: Cat Bond Mechanics ─────────────────────────────────────────────────

function SPVDiagram() {
  const W = 520;
  const H = 220;

  // Box definitions
  const boxes: { x: number; y: number; w: number; h: number; label: string; sublabel: string; color: string }[] = [
    { x: 20, y: 80, w: 110, h: 50, label: "Sponsor", sublabel: "(Cedant)", color: "#3b82f6" },
    { x: 195, y: 60, w: 130, h: 90, label: "SPV", sublabel: "Special Purpose Vehicle", color: "#8b5cf6" },
    { x: 390, y: 80, w: 110, h: 50, label: "Investors", sublabel: "(Cat Bond)", color: "#22d3ee" },
    { x: 195, y: 165, w: 130, h: 40, label: "Collateral Trust", sublabel: "US T-Bills / MMF", color: "#6b7280" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-lg">
      {/* Sponsor → SPV: premium */}
      <line x1={130} y1={105} x2={195} y2={105} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowBlue)" />
      <text x={158} y={96} textAnchor="middle" fontSize={8.5} fill="#60a5fa">Premium</text>

      {/* SPV → Sponsor: protection */}
      <line x1={195} y1={118} x2={130} y2={118} stroke="#22d3ee" strokeWidth={1.5} markerEnd="url(#arrowCyan)" strokeDasharray="4 2" />
      <text x={158} y={132} textAnchor="middle" fontSize={8.5} fill="#67e8f9">Protection</text>

      {/* Investors → SPV: principal */}
      <line x1={390} y1={105} x2={325} y2={105} stroke="#22d3ee" strokeWidth={1.5} markerEnd="url(#arrowCyan)" />
      <text x={360} y={96} textAnchor="middle" fontSize={8.5} fill="#67e8f9">Principal</text>

      {/* SPV → Investors: coupon / repayment */}
      <line x1={325} y1={118} x2={390} y2={118} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowBlue)" strokeDasharray="4 2" />
      <text x={360} y={132} textAnchor="middle" fontSize={8.5} fill="#60a5fa">Coupon / Repay</text>

      {/* SPV ↔ Collateral */}
      <line x1={260} y1={150} x2={260} y2={165} stroke="#9ca3af" strokeWidth={1.5} />
      <text x={260} y={162} textAnchor="middle" fontSize={8} fill="#9ca3af" />

      {/* Boxes */}
      {boxes.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6} fill={b.color} fillOpacity={0.15} stroke={b.color} strokeOpacity={0.5} strokeWidth={1} />
          <text x={b.x + b.w / 2} y={b.y + b.h / 2 - 4} textAnchor="middle" fontSize={10} fontWeight="600" fill={b.color}>{b.label}</text>
          <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 9} textAnchor="middle" fontSize={8} fill="#9ca3af">{b.sublabel}</text>
        </g>
      ))}

      {/* Arrow markers */}
      <defs>
        <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#3b82f6" />
        </marker>
        <marker id="arrowCyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#22d3ee" />
        </marker>
      </defs>

      {/* No-event / Event labels */}
      <text x={W / 2} y={14} textAnchor="middle" fontSize={9} fill="#6b7280">Structure Flow: Premium + Principal Flows</text>
    </svg>
  );
}

function AttachmentDiagram({ bond }: { bond: CatBond }) {
  const W = 360;
  const H = 70;
  const maxLoss = bond.exhaustion * 1.5;
  const attPct = bond.attachment / maxLoss;
  const exhPct = bond.exhaustion / maxLoss;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Track */}
      <rect x={20} y={28} width={W - 40} height={14} rx={4} fill="#1e293b" />
      {/* Cat bond zone */}
      <rect
        x={20 + attPct * (W - 40)}
        y={28}
        width={(exhPct - attPct) * (W - 40)}
        height={14}
        rx={2}
        fill="#8b5cf6"
        fillOpacity={0.7}
      />
      {/* Sponsor retention */}
      <rect x={20} y={28} width={attPct * (W - 40)} height={14} rx={2} fill="#3b82f6" fillOpacity={0.4} />
      {/* Above exhaustion */}
      <rect
        x={20 + exhPct * (W - 40)}
        y={28}
        width={(1 - exhPct) * (W - 40)}
        height={14}
        rx={2}
        fill="#6b7280"
        fillOpacity={0.3}
      />

      {/* Attachment marker */}
      <line x1={20 + attPct * (W - 40)} y1={20} x2={20 + attPct * (W - 40)} y2={50} stroke="#f59e0b" strokeWidth={1.5} />
      <text x={20 + attPct * (W - 40)} y={15} textAnchor="middle" fontSize={8.5} fill="#fbbf24">Attach ${bond.attachment}B</text>

      {/* Exhaustion marker */}
      <line x1={20 + exhPct * (W - 40)} y1={20} x2={20 + exhPct * (W - 40)} y2={50} stroke="#f87171" strokeWidth={1.5} />
      <text x={20 + exhPct * (W - 40)} y={15} textAnchor="middle" fontSize={8.5} fill="#fca5a5">Exhaust ${bond.exhaustion}B</text>

      {/* Zone labels */}
      <text x={20 + (attPct / 2) * (W - 40)} y={62} textAnchor="middle" fontSize={7.5} fill="#60a5fa">Sponsor retained</text>
      <text x={20 + ((attPct + exhPct) / 2) * (W - 40)} y={62} textAnchor="middle" fontSize={7.5} fill="#c4b5fd">Cat Bond at risk</text>
      <text x={20 + ((exhPct + 1) / 2) * (W - 40)} y={62} textAnchor="middle" fontSize={7.5} fill="#9ca3af">Senior coverage</text>
    </svg>
  );
}

function CatBondMechanicsTab() {
  const [selectedTrigger, setSelectedTrigger] = useState<CatBond["trigger"]>("indemnity");
  const [selectedBond, setSelectedBond] = useState<CatBond>(CAT_BONDS[0]);

  const triggers: CatBond["trigger"][] = ["indemnity", "industry index", "parametric", "modeled loss"];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Cat Bond Mechanics"
        subtitle="How catastrophe bonds are structured, triggered, and settled"
      />

      {/* SPV Structure */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-medium text-foreground mb-3">SPV Deal Structure</div>
        <SPVDiagram />
        <div className="grid grid-cols-3 gap-3 mt-4 text-xs text-muted-foreground">
          <div className="bg-primary/5 border border-border rounded-lg p-2">
            <span className="font-medium text-primary block mb-0.5">1. Setup</span>
            Sponsor establishes an offshore SPV (Cayman Islands / Bermuda) and pays an annual premium for catastrophe protection.
          </div>
          <div className="bg-primary/5 border border-border rounded-lg p-2">
            <span className="font-medium text-primary block mb-0.5">2. Issuance</span>
            SPV issues cat bond notes to capital market investors. Principal is held in a collateral trust (US T-Bills or money market funds).
          </div>
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-2">
            <span className="font-medium text-muted-foreground block mb-0.5">3. Settlement</span>
            If trigger activates, collateral is released to the sponsor. Otherwise, investors receive principal + SOFR + spread at maturity.
          </div>
        </div>
      </div>

      {/* Trigger types */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-medium text-foreground mb-3">Trigger Types</div>
        <div className="flex gap-2 flex-wrap mb-4">
          {triggers.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTrigger(t)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md border transition-colors capitalize",
                selectedTrigger === t
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs font-medium text-green-400 mb-1.5">Advantages</div>
            <ul className="space-y-1">
              {TRIGGER_DESCRIPTIONS[selectedTrigger].pros.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="text-green-400 mt-0.5">+</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-medium text-red-400 mb-1.5">Disadvantages</div>
            <ul className="space-y-1">
              {TRIGGER_DESCRIPTIONS[selectedTrigger].cons.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="text-red-400 mt-0.5">–</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
          <span className="font-medium text-amber-400">Basis Risk:</span> The difference between sponsor actual losses and trigger value. Parametric triggers have the highest basis risk but fastest settlement; indemnity has zero basis risk but slowest settlement.
        </div>
      </div>

      {/* Attachment / Exhaustion for selected bond */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-medium text-foreground mb-1">Attachment & Exhaustion Points</div>
        <p className="text-xs text-muted-foreground mb-3">
          The attachment point defines when losses start affecting investors; the exhaustion point is where 100% of principal is lost.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {CAT_BONDS.map((b) => (
            <button
              key={b.name}
              onClick={() => setSelectedBond(b)}
              className={cn(
                "text-xs px-2 py-1 rounded border transition-colors",
                selectedBond.name === b.name
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              )}
            >
              {b.name.split(" ")[0]}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          <span className="font-medium text-foreground">{selectedBond.name}</span> — {selectedBond.peril} |{" "}
          Trigger: {selectedBond.trigger} | Notional: ${selectedBond.notional}M
        </div>
        <AttachmentDiagram bond={selectedBond} />
        <div className="grid grid-cols-3 gap-2 mt-3">
          <StatChip label="Attachment" value={`$${selectedBond.attachment}B`} color="amber" />
          <StatChip label="Exhaustion" value={`$${selectedBond.exhaustion}B`} color="red" />
          <StatChip label="Width" value={`$${selectedBond.exhaustion - selectedBond.attachment}B`} color="purple" />
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Pricing & Returns ───────────────────────────────────────────────────

function ReturnComparisonChart() {
  const W = 560;
  const H = 200;
  const PAD = { t: 16, r: 12, b: 36, l: 40 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const allVals = RETURN_DATA.flatMap((d) => [d.catBond, d.corpBond, d.equity]);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV;

  const yScale = (v: number) => PAD.t + ((maxV - v) / range) * chartH;
  const xPos = (i: number) => PAD.l + (i / (RETURN_DATA.length - 1)) * chartW;

  const mkPath = (key: keyof ReturnYear) =>
    RETURN_DATA.map((d, i) => `${i === 0 ? "M" : "L"} ${xPos(i)} ${yScale(d[key] as number)}`).join(" ");

  const zeroY = yScale(0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl">
      {/* Gridlines */}
      {[-20, -10, 0, 10, 20, 30].map((v, i) => {
        if (v < minV - 2 || v > maxV + 2) return null;
        const y = yScale(v);
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke={v === 0 ? "#4b5563" : "#1f2937"} strokeWidth={v === 0 ? 1 : 0.5} />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fontSize={8} fill="#6b7280">{v}%</text>
          </g>
        );
      })}

      {/* Zero line */}
      <line x1={PAD.l} y1={zeroY} x2={W - PAD.r} y2={zeroY} stroke="#374151" strokeWidth={1} />

      {/* Lines */}
      <path d={mkPath("equity")} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3" />
      <path d={mkPath("corpBond")} fill="none" stroke="#22d3ee" strokeWidth={1.5} />
      <path d={mkPath("catBond")} fill="none" stroke="#10b981" strokeWidth={2} />

      {/* X labels */}
      {RETURN_DATA.map((d, i) => (
        <text key={d.year} x={xPos(i)} y={H - 6} textAnchor="middle" fontSize={8.5} fill="#9ca3af">
          {d.year}
        </text>
      ))}

      {/* Legend */}
      <line x1={PAD.l} y1={8} x2={PAD.l + 16} y2={8} stroke="#10b981" strokeWidth={2} />
      <text x={PAD.l + 20} y={12} fontSize={8.5} fill="#9ca3af">Cat Bond</text>
      <line x1={PAD.l + 80} y1={8} x2={PAD.l + 96} y2={8} stroke="#22d3ee" strokeWidth={1.5} />
      <text x={PAD.l + 100} y={12} fontSize={8.5} fill="#9ca3af">Corp Bond</text>
      <line x1={PAD.l + 168} y1={8} x2={PAD.l + 184} y2={8} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3" />
      <text x={PAD.l + 188} y={12} fontSize={8.5} fill="#9ca3af">Equity (S&P 500)</text>
    </svg>
  );
}

function PricingReturnsTab() {
  resetSeed();

  const avgEL = CAT_BONDS.reduce((s, b) => s + b.expectedLoss, 0) / CAT_BONDS.length;
  const avgSpread = CAT_BONDS.reduce((s, b) => s + b.spread, 0) / CAT_BONDS.length;
  const sofr = 5.3;
  const catBondTotalReturn = sofr + avgSpread / 100;
  const catBondSharpe = 1.05;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pricing & Returns"
        subtitle="Cat bond pricing is driven by expected loss, risk premium, and prevailing interest rates"
      />

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="Avg Expected Loss" value={`${avgEL.toFixed(2)}%`} color="red" />
        <StatChip label="Avg Spread vs SOFR" value={`${avgSpread.toFixed(0)} bps`} color="purple" />
        <StatChip label="Total Return (est)" value={`${catBondTotalReturn.toFixed(1)}%`} color="green" />
        <StatChip label="Sharpe Ratio" value={catBondSharpe.toFixed(2)} color="blue" />
      </div>

      {/* Bond-level pricing table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="text-sm font-medium text-foreground p-4 pb-2">Current Cat Bond Universe — Pricing Matrix</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2">Instrument</th>
                <th className="text-right px-3 py-2">Peril</th>
                <th className="text-right px-3 py-2">EL%</th>
                <th className="text-right px-3 py-2">Spread (bps)</th>
                <th className="text-right px-3 py-2">Multiple</th>
                <th className="text-right px-3 py-2">Total Yield</th>
                <th className="text-right px-3 py-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {CAT_BONDS.map((b, i) => {
                const multiple = b.spread / 100 / b.expectedLoss;
                const totalYield = sofr + b.spread / 100;
                return (
                  <tr key={b.name} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-muted/10" : "")}>
                    <td className="px-4 py-2 font-medium text-foreground">{b.name}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{b.peril}</td>
                    <td className="px-3 py-2 text-right text-red-400">{b.expectedLoss.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right text-primary">{b.spread} bps</td>
                    <td className="px-3 py-2 text-right">
                      <span className={cn("font-medium", multiple >= 3 ? "text-green-400" : multiple >= 2 ? "text-amber-400" : "text-red-400")}>
                        {multiple.toFixed(1)}x
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-green-400">{totalYield.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right">
                      <Badge variant="outline" className="text-xs">{b.rating}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-3 pt-1 text-xs text-muted-foreground">
          Multiple = Spread / Expected Loss. A multiple &gt; 2.5x is generally considered attractive compensation for the risk assumed.
        </div>
      </div>

      {/* Historical returns chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-medium text-foreground mb-3">Annual Returns: Cat Bonds vs Corp Bonds vs Equities</div>
        <ReturnComparisonChart />
        <p className="text-xs text-muted-foreground mt-2">
          2017 shows negative cat bond returns due to Hurricanes Harvey, Irma, and Maria. 2022 shows cat bonds outperforming as
          traditional fixed income fell sharply with rate hikes. 2023 returned ~19% as spreads widened post-Ian.
        </p>
      </div>

      {/* Pricing formula */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-amber-400 mb-2">Pricing Framework</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <p className="text-foreground/90 font-medium mb-1">Cat Bond Yield = SOFR + Spread</p>
            <p>Spread must compensate investors for: (1) expected annual loss, (2) risk premium above EL, and (3) liquidity premium.</p>
            <p className="mt-2 text-foreground/90 font-medium">Spread ≈ EL × Multiple (2.5x–4x typical)</p>
            <p>Historical averages: ~3.0x multiple over expected loss. Post-Ian multiples spiked to 5x+ before normalizing.</p>
          </div>
          <div>
            <p className="text-foreground/90 font-medium mb-1">Key Pricing Inputs</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Exceedance probability (EP) curve from cat model</li>
              <li>Expected loss (EL) — annual average loss probability</li>
              <li>Layer attachment / exhaustion points</li>
              <li>Trigger type premium (indemnity typically tighter)</li>
              <li>Peril, region, model uncertainty loading</li>
              <li>Current reinsurance market cycle</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Peril Analysis ─────────────────────────────────────────────────────

function ExceedanceCurveChart() {
  const W = 500;
  const H = 200;
  const PAD = { t: 16, r: 16, b: 36, l: 48 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const maxLoss = 600;
  const xScale = (loss: number) => PAD.l + (loss / maxLoss) * chartW;
  const yScale = (prob: number) => PAD.t + ((10 - prob) / 10) * chartH;

  // Smooth curve via log interpolation for US Hurricane
  const hurPoints: [number, number][] = PERIL_EVENTS.map((e) => [e.usHurricane, e.probability]);
  hurPoints.unshift([5, 10]);
  hurPoints.push([550, 0.12]);

  const mkPath = (pts: [number, number][]) =>
    pts.map(([l, p], i) => `${i === 0 ? "M" : "L"} ${xScale(l)} ${yScale(p)}`).join(" ");

  const eqPts: [number, number][] = PERIL_EVENTS.map((e) => [e.usEarthquake, e.probability]);
  eqPts.unshift([5, 10]);
  eqPts.push([580, 0.12]);

  const windPts: [number, number][] = PERIL_EVENTS.map((e) => [e.europeWind, e.probability]);
  windPts.unshift([5, 10]);
  windPts.push([260, 0.12]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-lg">
      {/* Grid */}
      {[0, 2, 4, 6, 8, 10].map((v, i) => {
        const y = yScale(v);
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#1f2937" strokeWidth={0.5} />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fontSize={8} fill="#6b7280">{v}%</text>
          </g>
        );
      })}
      {[0, 100, 200, 300, 400, 500].map((v, i) => {
        const x = xScale(v);
        return (
          <g key={i}>
            <line x1={x} y1={PAD.t} x2={x} y2={PAD.t + chartH} stroke="#1f2937" strokeWidth={0.5} />
            <text x={x} y={H - 6} textAnchor="middle" fontSize={8} fill="#6b7280">${v}B</text>
          </g>
        );
      })}

      <path d={mkPath(hurPoints)} fill="none" stroke="#3b82f6" strokeWidth={2} />
      <path d={mkPath(eqPts)} fill="none" stroke="#8b5cf6" strokeWidth={2} />
      <path d={mkPath(windPts)} fill="none" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="5 3" />

      {/* Return period labels */}
      {PERIL_EVENTS.map((e) => (
        <g key={e.returnPeriod}>
          <line x1={xScale(e.usHurricane)} y1={yScale(e.probability) - 4} x2={xScale(e.usHurricane)} y2={yScale(e.probability) + 4} stroke="#3b82f6" strokeWidth={1} />
        </g>
      ))}

      {/* Legend */}
      <line x1={PAD.l} y1={8} x2={PAD.l + 16} y2={8} stroke="#3b82f6" strokeWidth={2} />
      <text x={PAD.l + 20} y={12} fontSize={8} fill="#9ca3af">US Hurricane</text>
      <line x1={PAD.l + 90} y1={8} x2={PAD.l + 106} y2={8} stroke="#8b5cf6" strokeWidth={2} />
      <text x={PAD.l + 110} y={12} fontSize={8} fill="#9ca3af">US Earthquake</text>
      <line x1={PAD.l + 190} y1={8} x2={PAD.l + 206} y2={8} stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="5 3" />
      <text x={PAD.l + 210} y={12} fontSize={8} fill="#9ca3af">Europe Wind</text>

      <text x={PAD.l + chartW / 2} y={H - 1} textAnchor="middle" fontSize={8.5} fill="#6b7280">Insured Industry Loss ($B)</text>
      <text x={8} y={PAD.t + chartH / 2} fontSize={8} fill="#6b7280" transform={`rotate(-90 8 ${PAD.t + chartH / 2})`}>Exceedance Prob. (%/yr)</text>
    </svg>
  );
}

function PerilAnalysisTab() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Peril Analysis"
        subtitle="Understanding catastrophe modelling, return periods, and diversification across perils"
      />

      {/* Peril event table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="text-sm font-medium text-foreground p-4 pb-2">Industry Loss Scenarios by Return Period</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2">Return Period</th>
                <th className="text-right px-3 py-2">Annual Prob.</th>
                <th className="text-right px-3 py-2">US Hurricane ($B)</th>
                <th className="text-right px-3 py-2">US Earthquake ($B)</th>
                <th className="text-right px-3 py-2">Europe Wind ($B)</th>
              </tr>
            </thead>
            <tbody>
              {PERIL_EVENTS.map((e, i) => (
                <tr key={e.returnPeriod} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-muted/10" : "")}>
                  <td className="px-4 py-2 font-medium text-foreground">{e.returnPeriod}-year</td>
                  <td className="px-3 py-2 text-right text-amber-400">{e.probability.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right text-primary">${e.usHurricane}B</td>
                  <td className="px-3 py-2 text-right text-primary">${e.usEarthquake}B</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">${e.europeWind}B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exceedance probability chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-medium text-foreground mb-3">Exceedance Probability Curve (EP Curve)</div>
        <ExceedanceCurveChart />
        <p className="text-xs text-muted-foreground mt-2">
          EP curve shows the annual probability of exceeding a given industry loss level. Cat bond attachment points are set
          at low exceedance probabilities (typically 0.5%–3% / year), keeping expected losses low.
        </p>
      </div>

      {/* Cat model basics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Catastrophe Modelling" variant="blue">
          <p className="mb-1.5">Cat models simulate thousands of virtual events to estimate the loss distribution. Key components:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><span className="text-foreground/90">Hazard module:</span> event frequency, intensity, footprint</li>
            <li><span className="text-foreground/90">Exposure module:</span> insured values, locations</li>
            <li><span className="text-foreground/90">Vulnerability module:</span> damage functions</li>
            <li><span className="text-foreground/90">Financial module:</span> insurance structures, limits</li>
          </ul>
          <p className="mt-1.5 text-xs">Major vendors: AIR Worldwide, RMS (Moody's), Verisk.</p>
        </InfoBox>
        <InfoBox title="PML & Return Period" variant="purple">
          <p className="mb-1.5">Probable Maximum Loss (PML) is the maximum expected loss at a given confidence level/return period:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><span className="text-foreground/90">1-in-100 PML:</span> 99th percentile annual loss</li>
            <li><span className="text-foreground/90">1-in-250 PML:</span> used by many reinsurers as capital reference</li>
            <li><span className="text-foreground/90">Tail Value at Risk (TVaR):</span> expected loss beyond threshold</li>
          </ul>
          <p className="mt-1.5 text-xs">Cat bonds are often placed to cover losses between the 1-in-50 and 1-in-150 return period levels.</p>
        </InfoBox>
      </div>

      {/* Diversification insight */}
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe size={14} className="text-green-400" />
          <span className="text-xs font-medium uppercase tracking-wide text-green-400">Peril Diversification</span>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Different perils are largely uncorrelated with each other: a US hurricane does not cause a Japanese earthquake.
          Multi-peril cat bonds explicitly combine exposures to different events, spreading risk. However, climate change
          is increasing correlation within similar peril types (e.g., two major US hurricane seasons back-to-back).
        </p>
        <div className="grid grid-cols-3 gap-2">
          <StatChip label="US Hurricane vs EQ" value="~0.05 corr." color="green" />
          <StatChip label="US vs Japan EQ" value="~0.02 corr." color="green" />
          <StatChip label="Hurricane vs Wildfire" value="~0.08 corr." color="green" />
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: Portfolio Construction ─────────────────────────────────────────────

function CorrMatrixHeatmap() {
  const n = CORR_LABELS.length;
  const cellSize = 56;
  const labelW = 70;
  const W = labelW + n * cellSize + 10;
  const H = labelW + n * cellSize + 10;

  const colorForCorr = (c: number, i: number, j: number) => {
    if (i === j) return "#3b82f6";
    if (Math.abs(c) < 0.15) return "#064e3b";
    if (Math.abs(c) < 0.35) return "#065f46";
    if (Math.abs(c) < 0.55) return "#0d4a3a";
    return c > 0 ? "#7f1d1d" : "#1e3a5f";
  };

  const textColor = (c: number, i: number, j: number) => {
    if (i === j) return "#fff";
    if (Math.abs(c) < 0.15) return "#34d399";
    if (Math.abs(c) < 0.35) return "#6ee7b7";
    return "#fca5a5";
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm">
      {/* Column headers */}
      {CORR_LABELS.map((lbl, j) => (
        <text
          key={`ch-${j}`}
          x={labelW + j * cellSize + cellSize / 2}
          y={labelW - 6}
          textAnchor="middle"
          fontSize={8.5}
          fill="#9ca3af"
        >
          {lbl}
        </text>
      ))}
      {/* Row headers */}
      {CORR_LABELS.map((lbl, i) => (
        <text
          key={`rh-${i}`}
          x={labelW - 4}
          y={labelW + i * cellSize + cellSize / 2 + 4}
          textAnchor="end"
          fontSize={8.5}
          fill="#9ca3af"
        >
          {lbl}
        </text>
      ))}
      {/* Cells */}
      {CORRELATION_MATRIX.map((row, i) =>
        row.map((c, j) => (
          <g key={`${i}-${j}`}>
            <rect
              x={labelW + j * cellSize + 1}
              y={labelW + i * cellSize + 1}
              width={cellSize - 2}
              height={cellSize - 2}
              rx={3}
              fill={colorForCorr(c, i, j)}
            />
            <text
              x={labelW + j * cellSize + cellSize / 2}
              y={labelW + i * cellSize + cellSize / 2 + 4}
              textAnchor="middle"
              fontSize={9}
              fontWeight="600"
              fill={textColor(c, i, j)}
            >
              {c.toFixed(2)}
            </text>
          </g>
        ))
      )}
    </svg>
  );
}

function PortfolioEfficiencyChart() {
  const W = 400;
  const H = 180;
  const PAD = { t: 16, r: 20, b: 36, l: 44 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  // Efficient frontier without / with cat bonds
  const frontier = [
    { std: 5, retBase: 4.0, retCat: 4.6 },
    { std: 7, retBase: 5.2, retCat: 6.1 },
    { std: 9, retBase: 6.4, retCat: 7.5 },
    { std: 11, retBase: 7.6, retCat: 8.7 },
    { std: 13, retBase: 8.7, retCat: 9.6 },
    { std: 15, retBase: 9.5, retCat: 10.3 },
  ];

  const xScale = (v: number) => PAD.l + ((v - 4) / 13) * chartW;
  const yScale = (v: number) => PAD.t + ((11 - v) / 8) * chartH;

  const mkPath = (key: "retBase" | "retCat") =>
    frontier.map((f, i) => `${i === 0 ? "M" : "L"} ${xScale(f.std)} ${yScale(f[key])}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm">
      {/* Gridlines */}
      {[4, 6, 8, 10].map((v, i) => {
        const y = yScale(v);
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#1f2937" strokeWidth={0.5} />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fontSize={8} fill="#6b7280">{v}%</text>
          </g>
        );
      })}
      {[5, 7, 9, 11, 13, 15].map((v, i) => {
        const x = xScale(v);
        return (
          <g key={i}>
            <line x1={x} y1={PAD.t} x2={x} y2={PAD.t + chartH} stroke="#1f2937" strokeWidth={0.5} />
            <text x={x} y={H - 6} textAnchor="middle" fontSize={8} fill="#6b7280">{v}%</text>
          </g>
        );
      })}

      <path d={mkPath("retBase")} fill="none" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="5 3" />
      <path d={mkPath("retCat")} fill="none" stroke="#10b981" strokeWidth={2} />

      {/* Legend */}
      <line x1={PAD.l} y1={8} x2={PAD.l + 16} y2={8} stroke="#10b981" strokeWidth={2} />
      <text x={PAD.l + 20} y={12} fontSize={8} fill="#9ca3af">With Cat Bonds</text>
      <line x1={PAD.l + 106} y1={8} x2={PAD.l + 122} y2={8} stroke="#6b7280" strokeWidth={1.5} strokeDasharray="5 3" />
      <text x={PAD.l + 126} y={12} fontSize={8} fill="#9ca3af">Without Cat Bonds</text>

      <text x={PAD.l + chartW / 2} y={H - 1} textAnchor="middle" fontSize={7.5} fill="#6b7280">Portfolio Std Dev (%)</text>
      <text x={6} y={PAD.t + chartH / 2} fontSize={7.5} fill="#6b7280" transform={`rotate(-90 6 ${PAD.t + chartH / 2})`}>Return (%)</text>
    </svg>
  );
}

function PortfolioConstructionTab() {
  const [catWeight, setCatWeight] = useState(10);

  const adjustedAllocs = useMemo(() => {
    const diff = catWeight - 10;
    return PORTFOLIO_ALLOCS.map((a) => {
      if (a.asset === "Cat Bonds") return { ...a, weight: catWeight };
      if (a.asset === "Corp Bonds IG") return { ...a, weight: Math.max(0, a.weight - diff * 0.5) };
      if (a.asset === "Equities") return { ...a, weight: Math.max(0, a.weight - diff * 0.5) };
      return a;
    });
  }, [catWeight]);

  const portReturn = adjustedAllocs.reduce((s, a) => s + (a.weight / 100) * a.expReturn, 0);
  const portVolApprox =
    Math.sqrt(
      adjustedAllocs.reduce(
        (s, a) => s + Math.pow((a.weight / 100) * a.stdDev, 2),
        0
      )
    ) * 0.8;
  const portSharpe = (portReturn - 5.3) / portVolApprox;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Portfolio Construction"
        subtitle="Cat bonds as a diversifier — near-zero correlation to financial markets enables unique portfolio benefits"
      />

      {/* Correlation matrix */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-medium text-foreground mb-3">Asset Correlation Matrix</div>
        <div className="flex gap-6 items-start">
          <CorrMatrixHeatmap />
          <div className="flex-1 space-y-3">
            <InfoBox title="Why Correlations Matter" variant="blue">
              <p>Cat bonds exhibit near-zero correlation (~0.03–0.08) to stocks, corporate bonds, and most alternative
                assets. Catastrophe events are physically independent of financial market cycles.</p>
              <p className="mt-1.5">During the 2022 equity and bond selloff (rate hikes), cat bonds returned -3.2%
                — driven by weather events, NOT interest rate risk — while equities fell 18% and IG bonds fell 16%.</p>
            </InfoBox>
            <div className="text-xs text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded bg-green-900/80 mr-1.5 align-middle" />
              Near-zero (&lt;0.15) = strong diversifier
              <br />
              <span className="inline-block w-3 h-3 rounded bg-red-900/80 mr-1.5 mt-1 align-middle" />
              High (&gt;0.55) = limited diversification benefit
            </div>
          </div>
        </div>
      </div>

      {/* Interactive allocation slider */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-medium text-foreground mb-3">Portfolio Optimizer — Cat Bond Allocation</div>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Cat Bond Weight</span>
            <span className="font-medium text-foreground">{catWeight}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            value={catWeight}
            onChange={(e) => setCatWeight(Number(e.target.value))}
            className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
            <span>0%</span>
            <span>25%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatChip label="Portfolio Return" value={`${portReturn.toFixed(2)}%`} color="green" />
          <StatChip label="Portfolio Vol" value={`${portVolApprox.toFixed(1)}%`} color="blue" />
          <StatChip label="Sharpe Ratio" value={portSharpe.toFixed(2)} color="purple" />
        </div>

        <div className="space-y-2">
          {adjustedAllocs.map((a) => (
            <div key={a.asset} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{a.asset}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    a.asset === "Cat Bonds"
                      ? "bg-green-500"
                      : a.asset === "Equities"
                      ? "bg-amber-500"
                      : a.asset === "Corp Bonds IG"
                      ? "bg-primary"
                      : a.asset === "Corp Bonds HY"
                      ? "bg-primary"
                      : "bg-muted-foreground"
                  )}
                  style={{ width: `${(a.weight / 25) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-8 text-right">{a.weight.toFixed(0)}%</span>
              <span className="text-xs text-muted-foreground w-16 text-right">Ret: {a.expReturn}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Efficient frontier */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-medium text-foreground mb-3">Efficient Frontier: With vs Without Cat Bonds</div>
        <PortfolioEfficiencyChart />
        <p className="text-xs text-muted-foreground mt-2">
          Adding cat bonds shifts the efficient frontier upward-left, offering more return per unit of risk. The
          effect is most pronounced at the low-to-moderate risk portion of the frontier.
        </p>
      </div>

      {/* Liquidity & sizing considerations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Liquidity Considerations" variant="amber">
          <ul className="list-disc list-inside space-y-1">
            <li>Cat bonds trade OTC on secondary market via dealers</li>
            <li>Typical bid-ask spread: 0.5–1.5 pts in normal markets</li>
            <li>Post-event, spreads can widen to 3–5+ pts</li>
            <li>Weekly liquidity via dedicated cat bond funds</li>
            <li>Minimum investment typically $250K–$1M institutional</li>
            <li>ETF wrappers (CATBD) offer daily liquidity, lower minimums</li>
          </ul>
        </InfoBox>
        <InfoBox title="Sizing Guidelines" variant="green">
          <ul className="list-disc list-inside space-y-1">
            <li>Typical allocation: 5–15% for institutional portfolios</li>
            <li>Diversify across 8–12+ bonds (peril, region, trigger type)</li>
            <li>Avoid concentration in single peril or single season</li>
            <li>Consider correlation with reinsurance equity holdings</li>
            <li>Model loss scenario: a 1-in-100 year event should not exceed 1–2% portfolio loss</li>
            <li>Review following major event seasons — spreads reset attractively</li>
          </ul>
        </InfoBox>
      </div>
    </div>
  );
}

// ── Page Root ─────────────────────────────────────────────────────────────────

export default function CatBondsPage() {
  const [activeTab, setActiveTab] = useState("market");

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={20} className="text-primary" />
              <h1 className="text-xl font-bold text-foreground">Catastrophe Bonds & ILS</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Insurance-linked securities, catastrophe risk transfer, and alternative risk capital markets
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              <DollarSign size={10} className="mr-1" />
              $48B Market
            </Badge>
            <Badge variant="outline" className="text-xs text-green-400 border-green-500/30 bg-green-500/5">
              <TrendingUp size={10} className="mr-1" />
              Record Issuance
            </Badge>
          </div>
        </motion.div>

        {/* HERO — Summary chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-2 border-l-4 border-l-primary rounded-xl bg-card p-6"
        >
          <StatChip label="Perils Covered" value="7 Major" color="blue" />
          <StatChip label="Avg Spread" value="~590 bps" color="purple" />
          <StatChip label="Avg EL" value="~1.8%" color="red" />
          <StatChip label="Corr to Equities" value="~0.03" color="green" />
          <StatChip label="2024 Sharpe" value="1.05+" color="amber" />
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-lg">
            {[
              { value: "market", label: "ILS Market", icon: <BarChart3 size={12} /> },
              { value: "mechanics", label: "Mechanics", icon: <Layers size={12} /> },
              { value: "pricing", label: "Pricing & Returns", icon: <TrendingUp size={12} /> },
              { value: "peril", label: "Peril Analysis", icon: <AlertTriangle size={12} /> },
              { value: "portfolio", label: "Portfolio", icon: <PieChart size={12} /> },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="pt-4">
            <TabsContent value="market" className="data-[state=inactive]:hidden mt-0">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                <MarketOverviewTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="mechanics" className="data-[state=inactive]:hidden mt-0">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                <CatBondMechanicsTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="pricing" className="data-[state=inactive]:hidden mt-0">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                <PricingReturnsTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="peril" className="data-[state=inactive]:hidden mt-0">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                <PerilAnalysisTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="portfolio" className="data-[state=inactive]:hidden mt-0">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                <PortfolioConstructionTab />
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
