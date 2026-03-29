"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Building2,
  TrendingUp,
  Shield,
  Globe,
  FileText,
  Lock,
  Layers,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Percent,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Landmark,
  Scale,
  Network,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 682005;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate noise array
const NOISE = Array.from({ length: 300 }, () => rand());

// ── Interfaces ────────────────────────────────────────────────────────────────

interface AssetClass {
  name: string;
  marketSize: number; // billions
  share: number; // percent of RWA total
  color: string;
  growth: number;
}

interface TreasuryProduct {
  name: string;
  issuer: string;
  yield: number;
  aum: number; // millions
  chain: string;
  minimum: number;
  type: string;
}

interface CreditProtocol {
  name: string;
  tvl: number; // millions
  avgApy: number;
  defaultRate: number;
  mechanism: string;
  riskLevel: "Low" | "Medium" | "High";
}

interface Jurisdiction {
  name: string;
  framework: string;
  status: "Favorable" | "Developing" | "Restrictive" | "Pending";
  keyRegs: string[];
  score: number;
}

interface TimelineEvent {
  year: number;
  event: string;
  category: "Regulatory" | "Protocol" | "Institutional" | "Market";
}

// ── Static Data ───────────────────────────────────────────────────────────────

const ASSET_CLASSES: AssetClass[] = [
  { name: "US Treasuries", marketSize: 8.2, share: 38, color: "#3b82f6", growth: 340 },
  { name: "Real Estate", marketSize: 5.1, share: 24, color: "#8b5cf6", growth: 180 },
  { name: "Private Credit", marketSize: 3.8, share: 18, color: "#06b6d4", growth: 220 },
  { name: "Commodities", marketSize: 2.4, share: 11, color: "#f59e0b", growth: 95 },
  { name: "Equities", marketSize: 1.9, share: 9, color: "#10b981", growth: 140 },
];

const TOP_PROTOCOLS = [
  {
    name: "Ondo Finance",
    tvl: 620,
    type: "Tokenized Treasuries",
    chain: "Ethereum",
    description: "Institutional-grade tokenized US government securities and investment-grade bonds.",
    highlight: "OUSG: 5.2% APY",
  },
  {
    name: "Franklin Templeton",
    tvl: 410,
    type: "Money Market Fund",
    chain: "Stellar / Polygon",
    description: "FOBXX — first US-registered mutual fund to use blockchain for transaction processing.",
    highlight: "FOBXX: 5.1% APY",
  },
  {
    name: "Centrifuge",
    tvl: 280,
    type: "Private Credit",
    chain: "Centrifuge Chain",
    description: "Real-world asset financing platform connecting DeFi liquidity to private credit pools.",
    highlight: "Avg 8–12% APY",
  },
  {
    name: "Maple Finance",
    tvl: 175,
    type: "Institutional Lending",
    chain: "Ethereum / Solana",
    description: "On-chain credit marketplace for institutional borrowers and professional lenders.",
    highlight: "Pools from 7% APY",
  },
  {
    name: "Goldfinch",
    tvl: 110,
    type: "Emerging Market Credit",
    chain: "Ethereum",
    description: "Decentralized credit protocol for global emerging market lending without crypto collateral.",
    highlight: "10–15% target APY",
  },
];

const TREASURY_PRODUCTS: TreasuryProduct[] = [
  {
    name: "OUSG",
    issuer: "Ondo Finance",
    yield: 5.18,
    aum: 620,
    chain: "Ethereum",
    minimum: 100000,
    type: "Short-term Treasuries",
  },
  {
    name: "FOBXX",
    issuer: "Franklin Templeton",
    yield: 5.09,
    aum: 410,
    chain: "Stellar / Polygon",
    minimum: 20,
    type: "Money Market Fund",
  },
  {
    name: "BUIDL",
    issuer: "BlackRock / Securitize",
    yield: 5.05,
    aum: 380,
    chain: "Ethereum",
    minimum: 5000000,
    type: "USD Institutional Fund",
  },
  {
    name: "STBT",
    issuer: "MatrixDock",
    yield: 4.95,
    aum: 145,
    chain: "Ethereum",
    minimum: 100000,
    type: "T-Bill Backed",
  },
  {
    name: "TBILL",
    issuer: "OpenEden",
    yield: 5.22,
    aum: 98,
    chain: "Ethereum",
    minimum: 100000,
    type: "Treasury Vault",
  },
];

const TRADITIONAL_TBILL_YIELDS = [4.1, 4.3, 4.6, 4.8, 5.0, 5.1, 5.2, 5.15, 5.05, 4.95, 5.0, 5.1];
const TOKENIZED_YIELDS = [4.05, 4.28, 4.62, 4.85, 5.05, 5.18, 5.28, 5.22, 5.12, 5.02, 5.08, 5.18];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CREDIT_PROTOCOLS: CreditProtocol[] = [
  {
    name: "Centrifuge",
    tvl: 280,
    avgApy: 9.4,
    defaultRate: 2.1,
    mechanism: "SPV-backed pools with real asset NFTs as collateral",
    riskLevel: "Medium",
  },
  {
    name: "Goldfinch",
    tvl: 110,
    avgApy: 11.8,
    defaultRate: 3.8,
    mechanism: "Auditor-vetted borrowers, senior/junior tranche structure",
    riskLevel: "High",
  },
  {
    name: "Maple Finance",
    tvl: 175,
    avgApy: 8.2,
    defaultRate: 1.5,
    mechanism: "Pool delegates underwrite institutional borrowers",
    riskLevel: "Medium",
  },
];

const JURISDICTIONS: Jurisdiction[] = [
  {
    name: "United States",
    framework: "SEC / CFTC",
    status: "Developing",
    keyRegs: ["Howey Test for securities", "No-action letters (OUSG)", "FIT21 Bill progress"],
    score: 62,
  },
  {
    name: "European Union",
    framework: "MiCA / ESMA",
    status: "Favorable",
    keyRegs: ["MiCA fully in force 2024", "DLT Pilot Regime active", "ART/EMT classifications"],
    score: 78,
  },
  {
    name: "United Kingdom",
    framework: "FCA",
    status: "Developing",
    keyRegs: ["FSMA 2023 digital assets", "FCA sandbox programs", "HMT consultation papers"],
    score: 65,
  },
  {
    name: "Singapore",
    framework: "MAS",
    status: "Favorable",
    keyRegs: ["PSA licensing for DPT", "Project Guardian (MAS)", "Variable Capital Co Act"],
    score: 85,
  },
  {
    name: "Switzerland",
    framework: "FINMA / DLT Law",
    status: "Favorable",
    keyRegs: ["DLT Act 2021 fully live", "FINMA crypto licensing", "Digital securities registry"],
    score: 88,
  },
  {
    name: "China",
    framework: "PBOC / CSRC",
    status: "Restrictive",
    keyRegs: ["Crypto trading banned", "DCEP (e-CNY) only path", "CBDC-focused approach"],
    score: 20,
  },
];

const TIMELINE_EVENTS: TimelineEvent[] = [
  { year: 2018, event: "Harbor tokenizes $100M real estate fund — first SEC-compliant tokenization", category: "Regulatory" },
  { year: 2019, event: "Santander issues $20M blockchain bond on Ethereum", category: "Institutional" },
  { year: 2021, event: "Centrifuge launches Tinlake on Ethereum mainnet for real-world assets", category: "Protocol" },
  { year: 2022, event: "MakerDAO approves $500M US Treasury investment via Monetalis Clydesdale", category: "Market" },
  { year: 2023, event: "Franklin Templeton FOBXX surpasses $250M AUM on Stellar", category: "Institutional" },
  { year: 2023, event: "BlackRock partners with Securitize to launch BUIDL tokenized fund", category: "Institutional" },
  { year: 2024, event: "EU MiCA framework fully in force covering crypto-assets", category: "Regulatory" },
  { year: 2024, event: "Tokenized RWA market crosses $10B total value locked", category: "Market" },
  { year: 2025, event: "Total tokenized RWA market exceeds $20B; 40+ institutional issuers", category: "Market" },
  { year: 2026, event: "Projected: $50B+ as DLT securities settlement goes mainstream", category: "Market" },
];

// ── Donut Chart Component ─────────────────────────────────────────────────────

function DonutChart({ data }: { data: AssetClass[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const cx = 140;
  const cy = 140;
  const outerR = 110;
  const innerR = 60;
  const total = data.reduce((s, d) => s + d.share, 0);

  let startAngle = -Math.PI / 2;
  const slices = data.map((d) => {
    const sweep = (d.share / total) * 2 * Math.PI;
    const endAngle = startAngle + sweep;
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    const path = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");
    const midAngle = startAngle + sweep / 2;
    const labelR = (outerR + innerR) / 2;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    const result = { ...d, path, lx, ly, midAngle };
    startAngle = endAngle;
    return result;
  });

  const hoveredSlice = hovered ? slices.find((s) => s.name === hovered) : null;

  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      <svg width={280} height={280}>
        {slices.map((slice) => (
          <path
            key={slice.name}
            d={slice.path}
            fill={slice.color}
            opacity={hovered && hovered !== slice.name ? 0.4 : 1}
            className="cursor-pointer transition-opacity duration-200"
            onMouseEnter={() => setHovered(slice.name)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {hoveredSlice ? (
          <>
            <text x={cx} y={cy - 10} textAnchor="middle" className="fill-white font-semibold" style={{ fontSize: 13 }}>
              {hoveredSlice.name}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 12 }}>
              ${hoveredSlice.marketSize}B
            </text>
            <text x={cx} y={cy + 26} textAnchor="middle" style={{ fontSize: 11, fill: "#94a3b8" }}>
              {hoveredSlice.share}%
            </text>
          </>
        ) : (
          <>
            <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontSize: 14, fill: "#f1f5f9", fontWeight: 600 }}>
              $21.4B
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 10, fill: "#94a3b8" }}>
              Total RWA
            </text>
          </>
        )}
      </svg>
      <div className="space-y-2">
        {data.map((d) => (
          <div
            key={d.name}
            className={`flex items-center gap-2 cursor-pointer transition-opacity duration-150 ${
              hovered && hovered !== d.name ? "opacity-40" : "opacity-100"
            }`}
            onMouseEnter={() => setHovered(d.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-muted-foreground w-36">{d.name}</span>
            <span className="text-sm font-mono text-foreground">${d.marketSize}B</span>
            <span className="text-xs text-emerald-400 font-mono">+{d.growth}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Yield Comparison Chart ────────────────────────────────────────────────────

function YieldComparisonChart() {
  const W = 480;
  const H = 200;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const allVals = [...TRADITIONAL_TBILL_YIELDS, ...TOKENIZED_YIELDS];
  const minY = Math.min(...allVals) - 0.3;
  const maxY = Math.max(...allVals) + 0.3;

  const xOf = (i: number) => padL + (i / (MONTHS.length - 1)) * chartW;
  const yOf = (v: number) => padT + chartH - ((v - minY) / (maxY - minY)) * chartH;

  const pathOf = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i)} ${yOf(v)}`).join(" ");

  const areaOf = (vals: number[]) => {
    const line = pathOf(vals);
    const last = xOf(vals.length - 1);
    const first = xOf(0);
    const bottom = padT + chartH;
    return `${line} L ${last} ${bottom} L ${first} ${bottom} Z`;
  };

  const gridYs = [4.5, 5.0, 5.5];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-lg">
      {gridYs.map((yv) => (
        <g key={yv}>
          <line x1={padL} y1={yOf(yv)} x2={W - padR} y2={yOf(yv)} stroke="#334155" strokeWidth={1} strokeDasharray="4 3" />
          <text x={padL - 6} y={yOf(yv) + 4} textAnchor="end" style={{ fontSize: 9, fill: "#64748b" }}>
            {yv.toFixed(1)}%
          </text>
        </g>
      ))}
      <path d={areaOf(TRADITIONAL_TBILL_YIELDS)} fill="#3b82f6" fillOpacity={0.1} />
      <path d={pathOf(TRADITIONAL_TBILL_YIELDS)} fill="none" stroke="#3b82f6" strokeWidth={2} />
      <path d={areaOf(TOKENIZED_YIELDS)} fill="#8b5cf6" fillOpacity={0.1} />
      <path d={pathOf(TOKENIZED_YIELDS)} fill="none" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 3" />
      {MONTHS.map((m, i) => (
        <text key={m} x={xOf(i)} y={H - 6} textAnchor="middle" style={{ fontSize: 8, fill: "#64748b" }}>
          {m}
        </text>
      ))}
      {/* Legend */}
      <rect x={padL + 2} y={padT + 4} width={10} height={3} fill="#3b82f6" />
      <text x={padL + 16} y={padT + 9} style={{ fontSize: 9, fill: "#94a3b8" }}>Traditional T-Bill</text>
      <rect x={padL + 110} y={padT + 4} width={10} height={3} fill="#8b5cf6" />
      <text x={padL + 124} y={padT + 9} style={{ fontSize: 9, fill: "#94a3b8" }}>Tokenized (avg)</text>
    </svg>
  );
}

// ── Liquidity Comparison Chart ────────────────────────────────────────────────

function LiquidityComparisonChart() {
  const categories = ["Settlement", "Min Investment", "Trading Hours", "Transparency", "Composability", "Fractionalization"];
  const reit = [60, 50, 55, 45, 20, 30];
  const tokenized = [95, 90, 98, 88, 95, 92];

  const W = 420;
  const H = 220;
  const barH = 20;
  const gap = 12;
  const padL = 120;
  const padR = 40;
  const chartW = W - padL - padR;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-lg">
      {categories.map((cat, i) => {
        const y = 16 + i * (barH * 2 + gap);
        const rVal = (reit[i] / 100) * chartW;
        const tVal = (tokenized[i] / 100) * chartW;
        return (
          <g key={cat}>
            <text x={padL - 8} y={y + barH * 1 - 2} textAnchor="end" style={{ fontSize: 9, fill: "#94a3b8" }}>
              {cat}
            </text>
            {/* REIT bar */}
            <rect x={padL} y={y} width={rVal} height={barH - 3} rx={3} fill="#64748b" fillOpacity={0.7} />
            <text x={padL + rVal + 4} y={y + barH - 6} style={{ fontSize: 8, fill: "#64748b" }}>
              {reit[i]}
            </text>
            {/* Tokenized bar */}
            <rect x={padL} y={y + barH} width={tVal} height={barH - 3} rx={3} fill="#8b5cf6" fillOpacity={0.85} />
            <text x={padL + tVal + 4} y={y + barH * 2 - 6} style={{ fontSize: 8, fill: "#8b5cf6" }}>
              {tokenized[i]}
            </text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x={padL} y={H - 18} width={12} height={6} rx={2} fill="#64748b" fillOpacity={0.7} />
      <text x={padL + 16} y={H - 12} style={{ fontSize: 9, fill: "#94a3b8" }}>Traditional REIT</text>
      <rect x={padL + 110} y={H - 18} width={12} height={6} rx={2} fill="#8b5cf6" />
      <text x={padL + 126} y={H - 12} style={{ fontSize: 9, fill: "#94a3b8" }}>Tokenized RE</text>
    </svg>
  );
}

// ── Adoption Roadmap SVG ──────────────────────────────────────────────────────

function AdoptionRoadmap({ events }: { events: TimelineEvent[] }) {
  const W = 560;
  const H = 320;
  const padL = 48;
  const padR = 24;
  const padT = 20;
  const years = [...new Set(events.map((e) => e.year))].sort((a, b) => a - b);
  const yearX = (y: number) => padL + ((y - years[0]) / (years[years.length - 1] - years[0])) * (W - padL - padR);

  const catColors: Record<TimelineEvent["category"], string> = {
    Regulatory: "#f59e0b",
    Protocol: "#8b5cf6",
    Institutional: "#3b82f6",
    Market: "#10b981",
  };

  const rows: TimelineEvent[][] = [[], [], [], []];
  events.forEach((ev, idx) => {
    rows[idx % 4].push(ev);
  });

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Timeline axis */}
        <line x1={padL - 8} y1={H / 2} x2={W - padR} y2={H / 2} stroke="#334155" strokeWidth={1.5} />
        {years.map((y) => (
          <g key={y}>
            <line x1={yearX(y)} y1={H / 2 - 6} x2={yearX(y)} y2={H / 2 + 6} stroke="#475569" strokeWidth={1.5} />
            <text x={yearX(y)} y={H / 2 + 18} textAnchor="middle" style={{ fontSize: 9, fill: "#64748b" }}>
              {y}
            </text>
          </g>
        ))}
        {events.map((ev, idx) => {
          const x = yearX(ev.year);
          const isAbove = idx % 2 === 0;
          const yOff = isAbove ? H / 2 - 14 - (idx % 4) * 20 : H / 2 + 20 + (idx % 4) * 20;
          const color = catColors[ev.category];
          return (
            <g key={`${ev.year}-${idx}`}>
              <circle cx={x} cy={H / 2} r={5} fill={color} />
              <line x1={x} y1={H / 2} x2={x} y2={yOff + (isAbove ? 12 : -12)} stroke={color} strokeWidth={0.8} strokeDasharray="3 2" />
              <rect
                x={x - 70}
                y={isAbove ? yOff - 12 : yOff - 4}
                width={140}
                height={22}
                rx={4}
                fill="#1e293b"
                stroke={color}
                strokeWidth={0.8}
              />
              <text x={x} y={isAbove ? yOff + 3 : yOff + 11} textAnchor="middle" style={{ fontSize: 7.5, fill: "#e2e8f0" }}>
                {ev.event.length > 42 ? ev.event.slice(0, 42) + "…" : ev.event}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex gap-4 flex-wrap mt-2">
        {(Object.entries(catColors) as [TimelineEvent["category"], string][]).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Expandable Row ────────────────────────────────────────────────────────────

function ExpandableRow({ protocol }: { protocol: (typeof TOP_PROTOCOLS)[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-3 hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Network className="w-3.5 h-3.5 text-muted-foreground/50" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">{protocol.name}</p>
            <p className="text-xs text-muted-foreground">{protocol.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono text-emerald-400">${protocol.tvl}M TVL</span>
          <span className="text-xs text-muted-foreground">{protocol.chain}</span>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 border-t border-border/60 bg-card/40">
              <p className="text-xs text-muted-foreground leading-relaxed">{protocol.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs bg-emerald-900/30 text-emerald-400 border-emerald-800">
                  {protocol.highlight}
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Default Waterfall ─────────────────────────────────────────────────────────

function DefaultWaterfallDiagram() {
  const tiers = [
    { name: "Senior Tranche", protection: "First loss protection", percent: 70, color: "#3b82f6", status: "AAA-rated" },
    { name: "Mezzanine", protection: "Buffer layer", percent: 20, color: "#8b5cf6", status: "BB-rated" },
    { name: "Junior / Equity", protection: "First loss", percent: 10, color: "#ef4444", status: "Unrated" },
  ];

  return (
    <div className="space-y-2">
      {tiers.map((tier, i) => (
        <div key={tier.name} className="relative">
          <div
            className="rounded-lg p-3 border"
            style={{
              borderColor: tier.color + "44",
              backgroundColor: tier.color + "11",
              marginLeft: `${i * 16}px`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: tier.color }}>
                  {tier.name}
                </p>
                <p className="text-xs text-muted-foreground">{tier.protection}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-foreground">{tier.percent}%</p>
                <p className="text-xs" style={{ color: tier.color }}>
                  {tier.status}
                </p>
              </div>
            </div>
          </div>
          {i < tiers.length - 1 && (
            <div className="flex justify-center my-1">
              <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
            </div>
          )}
        </div>
      ))}
      <p className="text-xs text-muted-foreground mt-2">
        In default: losses absorbed bottom-up. Junior holders lose first; senior holders last.
      </p>
    </div>
  );
}

// ── Jurisdiction Status Badge ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: Jurisdiction["status"] }) {
  const map: Record<Jurisdiction["status"], string> = {
    Favorable: "bg-emerald-900/30 text-emerald-400 border-emerald-800",
    Developing: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    Restrictive: "bg-red-900/30 text-red-400 border-red-800",
    Pending: "bg-muted text-muted-foreground border-border",
  };
  return <Badge variant="secondary" className={`text-xs text-muted-foreground border ${map[status]}`}>{status}</Badge>;
}

// ── SPV Structure Diagram ─────────────────────────────────────────────────────

function SPVStructureDiagram() {
  const boxes = [
    { id: "originator", label: "Asset Originator", sub: "e.g. lender, developer", x: 10, y: 10, color: "#3b82f6" },
    { id: "spv", label: "Special Purpose Vehicle", sub: "Legal entity, isolated", x: 200, y: 10, color: "#8b5cf6" },
    { id: "token", label: "Token Contract", sub: "ERC-20 / ERC-1400", x: 390, y: 10, color: "#06b6d4" },
    { id: "pool", label: "DeFi Liquidity Pool", sub: "Aave / MakerDAO / native", x: 200, y: 130, color: "#10b981" },
    { id: "investor", label: "Investor", sub: "KYC/AML gated wallet", x: 390, y: 130, color: "#f59e0b" },
  ];

  const arrows = [
    { from: [160, 35], to: [200, 35], label: "transfers assets" },
    { from: [330, 35], to: [390, 35], label: "mints tokens" },
    { from: [250, 68], to: [250, 130], label: "deposit collateral" },
    { from: [450, 68], to: [450, 130], label: "purchase / trade" },
    { from: [330, 155], to: [390, 155], label: "liquidity flow" },
  ];

  return (
    <svg viewBox="0 0 560 200" className="w-full">
      {boxes.map((b) => (
        <g key={b.id}>
          <rect x={b.x} y={b.y} width={160} height={50} rx={6} fill={b.color + "18"} stroke={b.color + "55"} strokeWidth={1.2} />
          <text x={b.x + 80} y={b.y + 20} textAnchor="middle" style={{ fontSize: 10, fill: "#e2e8f0", fontWeight: 600 }}>
            {b.label}
          </text>
          <text x={b.x + 80} y={b.y + 34} textAnchor="middle" style={{ fontSize: 8.5, fill: "#64748b" }}>
            {b.sub}
          </text>
        </g>
      ))}
      {/* Arrows - simplified horizontal */}
      <defs>
        <marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#475569" />
        </marker>
      </defs>
      <line x1={175} y1={35} x2={196} y2={35} stroke="#475569" strokeWidth={1} markerEnd="url(#ah)" />
      <text x={187} y={30} textAnchor="middle" style={{ fontSize: 7.5, fill: "#475569" }}>assets</text>
      <line x1={366} y1={35} x2={386} y2={35} stroke="#475569" strokeWidth={1} markerEnd="url(#ah)" />
      <text x={376} y={30} textAnchor="middle" style={{ fontSize: 7.5, fill: "#475569" }}>mints</text>
      <line x1={255} y1={65} x2={255} y2={128} stroke="#475569" strokeWidth={1} markerEnd="url(#ah)" />
      <line x1={455} y1={65} x2={455} y2={128} stroke="#475569" strokeWidth={1} markerEnd="url(#ah)" />
      <line x1={366} y1={155} x2={386} y2={155} stroke="#475569" strokeWidth={1} markerEnd="url(#ah)" />
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TokenizationPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sortCol, setSortCol] = useState<keyof TreasuryProduct>("aum");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedTreasuries = useMemo(() => {
    return [...TREASURY_PRODUCTS].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "desc" ? bv - av : av - bv;
      }
      return sortDir === "desc"
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
  }, [sortCol, sortDir]);

  const handleSort = (col: keyof TreasuryProduct) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
  };

  // Synthetic noise for subtle variation (uses NOISE array)
  const noiseAt = (i: number) => NOISE[i % NOISE.length];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="border-l-4 border-l-primary p-6 rounded-lg bg-card/40">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Tokenization of Real-World Assets</h1>
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Blockchain-based tokenization is digitizing trillions in real-world assets — from US Treasuries and
                real estate to private credit. Explore protocols, mechanics, yields, and the evolving regulatory landscape.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-muted/50 text-primary border border-border text-xs">$21.4B Market</Badge>
              <Badge className="bg-emerald-900/30 text-emerald-400 border border-emerald-800 text-xs">+340% YoY</Badge>
              <Badge className="bg-muted/50 text-primary border border-border text-xs">40+ Issuers</Badge>
            </div>
          </div>
        </motion.div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: DollarSign, label: "Total RWA TVL", value: "$21.4B", sub: "+340% YoY", color: "text-primary" },
            { icon: Percent, label: "Avg Tokenized Yield", value: "5.18%", sub: "vs 5.0% T-Bill", color: "text-emerald-400" },
            { icon: Building2, label: "Real Estate On-chain", value: "$5.1B", sub: "24% of RWA", color: "text-primary" },
            { icon: Globe, label: "Jurisdictions Active", value: "15+", sub: "MiCA, MAS, FCA", color: "text-amber-400" },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                    <span className="text-xs text-muted-foreground">{kpi.label}</span>
                  </div>
                  <p className={`text-xl font-semibold ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
              RWA Overview
            </TabsTrigger>
            <TabsTrigger value="treasuries" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
              Tokenized Treasuries
            </TabsTrigger>
            <TabsTrigger value="realestate" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
              Real Estate
            </TabsTrigger>
            <TabsTrigger value="credit" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
              Private Credit
            </TabsTrigger>
            <TabsTrigger value="regulatory" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
              Regulatory
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: RWA Overview ─────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-5 mt-4 data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
                    Market Share by Asset Class
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={ASSET_CLASSES} />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Growth by Asset Class
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-1">
                  {ASSET_CLASSES.map((ac) => (
                    <div key={ac.name}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="text-muted-foreground">{ac.name}</span>
                        <span className="text-emerald-400 font-mono">+{ac.growth}% YoY</span>
                      </div>
                      <Progress value={Math.min((ac.growth / 350) * 100, 100)} className="h-1.5 bg-muted" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Top Protocols */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Top Protocols by TVL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TOP_PROTOCOLS.map((p) => (
                  <ExpandableRow key={p.name} protocol={p} />
                ))}
              </CardContent>
            </Card>

            {/* What is RWA Tokenization */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  How RWA Tokenization Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      step: "1",
                      title: "Asset Identification",
                      desc: "A real-world asset (property, bond, fund) is identified and legally isolated in an SPV or trust structure.",
                      color: "text-primary",
                    },
                    {
                      step: "2",
                      title: "Legal Wrapper",
                      desc: "Lawyers structure the token as a security (regulated under local law). KYC/AML requirements defined. Smart contract terms set.",
                      color: "text-primary",
                    },
                    {
                      step: "3",
                      title: "Token Issuance",
                      desc: "ERC-20 or ERC-1400 tokens minted on-chain. Investors hold fractional ownership with dividend rights encoded in smart contract.",
                      color: "text-emerald-400",
                    },
                  ].map((item) => (
                    <div key={item.step} className="p-3 rounded-lg bg-muted/50 border border-border/20">
                      <div className={`text-2xl font-semibold ${item.color} mb-1`}>{item.step}</div>
                      <p className="text-sm font-medium text-foreground mb-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 2: Tokenized Treasuries ─────────────────────────────────── */}
          <TabsContent value="treasuries" className="space-y-5 mt-4 data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
                    Yield: Tokenized vs Traditional T-Bills (2025)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <YieldComparisonChart />
                  <p className="text-xs text-muted-foreground mt-2">
                    Tokenized products tend to slightly outperform T-bills due to yield-optimization strategies (e.g., repo overlays).
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Why Tokenized Treasuries?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Clock, title: "24/7 Settlement", desc: "Traditional T-bills settle T+1. Tokenized settle in minutes, any day, any time." },
                    { icon: DollarSign, title: "Composability", desc: "Use as collateral in DeFi, earn yield while posting margin, chain with other protocols." },
                    { icon: Globe, title: "Global Access", desc: "Non-US investors access USD yield without opening a US brokerage account." },
                    { icon: Layers, title: "Fractionalization", desc: "FOBXX min investment: $20. Traditional T-bills require $1,000+." },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-2">
                      <item.icon className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Comparison Table */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Product Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border">
                        {(["name", "issuer", "yield", "aum", "chain", "minimum"] as (keyof TreasuryProduct)[]).map((col) => (
                          <th
                            key={col}
                            className="text-left py-2 px-2 text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => handleSort(col)}
                          >
                            {col === "yield" ? "Yield" :
                             col === "aum" ? "AUM ($M)" :
                             col === "minimum" ? "Min ($)" :
                             col.charAt(0).toUpperCase() + col.slice(1)}
                            {sortCol === col && (
                              <span className="ml-1 text-primary">{sortDir === "desc" ? "↓" : "↑"}</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTreasuries.map((prod, i) => (
                        <motion.tr
                          key={prod.name}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-2 px-2 font-medium text-foreground">{prod.name}</td>
                          <td className="py-2 px-2 text-muted-foreground">{prod.issuer}</td>
                          <td className="py-2 px-2 font-mono text-emerald-400">{prod.yield.toFixed(2)}%</td>
                          <td className="py-2 px-2 font-mono text-primary">{prod.aum}</td>
                          <td className="py-2 px-2 text-muted-foreground">{prod.chain}</td>
                          <td className="py-2 px-2 font-mono text-muted-foreground">
                            {prod.minimum >= 1000000
                              ? `$${(prod.minimum / 1000000).toFixed(0)}M`
                              : prod.minimum >= 1000
                              ? `$${(prod.minimum / 1000).toFixed(0)}K`
                              : `$${prod.minimum}`}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Risk Considerations */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Key Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { title: "Smart Contract Risk", desc: "Bugs in token or custody contracts could freeze or lose funds. Look for audits by top firms.", severity: "High" },
                    { title: "Custodian Risk", desc: "Underlying T-bills held by off-chain custodian. Counterparty failure could impair redemption.", severity: "Medium" },
                    { title: "Liquidity Risk", desc: "Secondary market depth is limited. Large redemptions may not settle instantly on-chain.", severity: "Medium" },
                  ].map((r) => (
                    <div key={r.title} className="p-3 rounded-lg bg-muted/40 border border-border/20">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-medium text-foreground">{r.title}</p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${r.severity === "High" ? "bg-red-900/30 text-red-400" : "bg-yellow-900/30 text-yellow-400"}`}
                        >
                          {r.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 3: Real Estate Tokenization ─────────────────────────────── */}
          <TabsContent value="realestate" className="space-y-5 mt-4 data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
                    Tokenized RE vs Traditional REIT (Score 0–100)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LiquidityComparisonChart />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground/50" />
                    Fractional Ownership Mechanics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A $10M commercial property is wrapped in an LLC. The LLC issues 10,000,000 tokens at $1 each.
                    Investors purchase tokens representing fractional ownership, proportional to token holdings.
                    Rental income is distributed via smart contract — no fund manager needed.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Min Investment", value: "~$100", note: "vs $50K+ REIT fund" },
                      { label: "Settlement", value: "T+0", note: "vs T+2 REIT" },
                      { label: "Dividends", value: "Auto", note: "Smart contract" },
                      { label: "Global Trading", value: "24/7", note: "DEX / ATS" },
                    ].map((item) => (
                      <div key={item.label} className="p-2 rounded bg-muted/50 border border-border/20">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium text-primary">{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Smart Contract Escrow */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Smart Contract Escrow Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {[
                    { step: "Buyer deposits USDC", color: "bg-muted/50 text-primary border-border" },
                    { step: "→", color: "" },
                    { step: "Escrow contract locks funds", color: "bg-muted text-muted-foreground border-border" },
                    { step: "→", color: "" },
                    { step: "Title verification oracle", color: "bg-amber-900/30 text-amber-400 border-amber-800" },
                    { step: "→", color: "" },
                    { step: "Token transfer on success", color: "bg-muted/50 text-primary border-border" },
                    { step: "→", color: "" },
                    { step: "Funds released to seller", color: "bg-emerald-900/30 text-emerald-400 border-emerald-800" },
                  ].map((item, i) =>
                    item.step === "→" ? (
                      <ArrowRight key={i} className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Badge key={i} variant="secondary" className={`border ${item.color} text-xs text-muted-foreground`}>
                        {item.step}
                      </Badge>
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  If title verification fails or deadline expires, escrow automatically refunds buyer.
                  No intermediary needed — gas costs replace closing attorneys.
                </p>
              </CardContent>
            </Card>

            {/* Property Token Economics */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Property Token Economics — Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Asset: Manhattan Office Block</p>
                    {[
                      { label: "Property Value", value: "$25,000,000" },
                      { label: "Tokens Issued", value: "25,000,000 PROP" },
                      { label: "Token Price", value: "$1.00 per PROP" },
                      { label: "Annual Rental Income", value: "$1,750,000 (7% cap rate)" },
                      { label: "Income per Token/Year", value: "$0.07 (7% yield)" },
                      { label: "Mgmt Fee", value: "0.5% / year (on-chain)" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-xs text-muted-foreground border-b border-border/20 py-1">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="text-foreground font-mono">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground font-medium">Secondary Market Liquidity</p>
                    <div className="space-y-2">
                      {[
                        { exchange: "tZERO ATS", volume: "$2.1M/day", spread: "0.3%" },
                        { exchange: "INX Exchange", volume: "$890K/day", spread: "0.5%" },
                        { exchange: "Archax (UK)", volume: "$450K/day", spread: "0.8%" },
                        { exchange: "DeFi DEX", volume: "$320K/day", spread: "0.6%" },
                      ].map((ex) => (
                        <div key={ex.exchange} className="flex justify-between items-center text-xs text-muted-foreground p-2 rounded bg-muted/40">
                          <span className="text-muted-foreground">{ex.exchange}</span>
                          <span className="text-primary font-mono">{ex.volume}</span>
                          <span className="text-muted-foreground">Spread: {ex.spread}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 4: Private Credit On-Chain ──────────────────────────────── */}
          <TabsContent value="credit" className="space-y-5 mt-4 data-[state=inactive]:hidden">
            {/* SPV Structure */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Network className="w-4 h-4 text-muted-foreground" />
                  On-Chain Credit Structure (SPV Flow)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SPVStructureDiagram />
                <p className="text-xs text-muted-foreground mt-3">
                  Assets flow from originator into an SPV. The SPV mints tokens representing debt claims.
                  Tokens serve as collateral in DeFi pools, unlocking liquidity for the originator.
                  Investors earn yield from real-world borrower interest payments.
                </p>
              </CardContent>
            </Card>

            {/* Protocol Comparison */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Protocol Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {CREDIT_PROTOCOLS.map((proto) => (
                    <div key={proto.name} className="p-3 rounded-lg bg-muted/40 border border-border/20 space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-foreground">{proto.name}</p>
                        <Badge
                          variant="secondary"
                          className={`text-xs text-muted-foreground border ${
                            proto.riskLevel === "Low"
                              ? "bg-emerald-900/30 text-emerald-400 border-emerald-800"
                              : proto.riskLevel === "Medium"
                              ? "bg-yellow-900/30 text-yellow-400 border-yellow-800"
                              : "bg-red-900/30 text-red-400 border-red-800"
                          }`}
                        >
                          {proto.riskLevel}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">TVL</span>
                          <span className="text-primary font-mono">${proto.tvl}M</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg APY</span>
                          <span className="text-emerald-400 font-mono">{proto.avgApy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Historical Default</span>
                          <span className="text-amber-400 font-mono">{proto.defaultRate}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{proto.mechanism}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Default Waterfall */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4 text-red-400" />
                    Default Waterfall Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DefaultWaterfallDiagram />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Originator Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { risk: "Geographic Concentration", detail: "Emerging market pools (e.g., Africa, SEA) face FX + political risk." },
                    { risk: "Underwriting Quality", detail: "On-chain borrowers underwritten by pool delegates — human error factor." },
                    { risk: "Oracle Manipulation", detail: "Off-chain collateral valuations fed on-chain via oracles — potential manipulation." },
                    { risk: "Regulatory Clawback", detail: "Cross-border transactions may face retroactive legal challenge." },
                    { risk: "Liquidity Mismatch", detail: "Loan terms (1–3 years) vs LP withdrawal expectations (30 days)." },
                  ].map((item) => (
                    <div key={item.risk} className="flex items-start gap-2 p-2 rounded bg-muted/30 border border-border">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.risk}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB 5: Regulatory Landscape ─────────────────────────────────── */}
          <TabsContent value="regulatory" className="space-y-5 mt-4 data-[state=inactive]:hidden">
            {/* Jurisdiction Table */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Jurisdictional Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {JURISDICTIONS.map((jur) => (
                    <div key={jur.name} className="p-3 rounded-lg bg-muted/40 border border-border/20">
                      <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{jur.name}</p>
                          <p className="text-xs text-muted-foreground">{jur.framework}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={jur.status} />
                          <span className="text-xs text-muted-foreground font-mono">Score: {jur.score}/100</span>
                        </div>
                      </div>
                      <Progress value={jur.score} className="h-1 bg-muted mb-2" />
                      <div className="flex flex-wrap gap-1">
                        {jur.keyRegs.map((reg) => (
                          <Badge key={reg} variant="secondary" className="text-xs bg-muted text-muted-foreground border-border">
                            {reg}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SEC No-Action & MiCA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-muted-foreground/50" />
                    SEC No-Action Letters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The SEC issues no-action letters confirming it will not pursue enforcement against specific tokenized
                    security structures — providing regulatory certainty without formal rulemaking.
                  </p>
                  <div className="space-y-2">
                    {[
                      { entity: "Ondo Finance (OUSG)", year: "2023", note: "Staff no-action for tokenized T-bill fund via whitelisted wallets" },
                      { entity: "Prometheum", year: "2023", note: "First SEC-approved special purpose broker-dealer for digital assets" },
                      { entity: "tZERO ATS", year: "2019", note: "No-action for security token secondary trading on ATS platform" },
                    ].map((item) => (
                      <div key={item.entity} className="p-2 rounded bg-muted/40 border border-border/20 text-xs text-muted-foreground">
                        <div className="flex justify-between mb-0.5">
                          <span className="font-medium text-foreground">{item.entity}</span>
                          <span className="text-muted-foreground">{item.year}</span>
                        </div>
                        <p className="text-muted-foreground">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    MiCA Framework (EU)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Markets in Crypto-Assets (MiCA) — the world's most comprehensive crypto regulatory framework —
                    fully in force December 2024. It categorizes tokens as ART (Asset-Referenced Tokens),
                    EMT (E-Money Tokens), or other crypto-assets.
                  </p>
                  <div className="space-y-2">
                    {[
                      { cat: "ART (Asset-Referenced)", rule: "Backed by basket of assets. White paper required. ESMA supervision.", color: "text-primary" },
                      { cat: "EMT (E-Money Token)", rule: "Backed 1:1 by fiat. Only credit institutions / e-money firms may issue.", color: "text-primary" },
                      { cat: "Security Tokens", rule: "Existing MiFID II rules apply. DLT Pilot Regime for trading & settlement.", color: "text-muted-foreground" },
                    ].map((item) => (
                      <div key={item.cat} className="p-2 rounded bg-muted/40 border border-border/20 text-xs text-muted-foreground">
                        <p className={`font-medium mb-0.5 ${item.color}`}>{item.cat}</p>
                        <p className="text-muted-foreground">{item.rule}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Institutional Adoption Roadmap */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Institutional Adoption Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdoptionRoadmap events={TIMELINE_EVENTS} />
              </CardContent>
            </Card>

            {/* Institutional Players */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Key Institutional Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { name: "BlackRock", role: "BUIDL fund ($380M AUM)", status: "Active", via: "Securitize" },
                    { name: "Franklin Templeton", role: "FOBXX money market", status: "Active", via: "Stellar / Polygon" },
                    { name: "JPMorgan", role: "Onyx Digital Assets repo", status: "Active", via: "Private blockchain" },
                    { name: "Goldman Sachs", role: "Digital Asset Platform (DAP)", status: "Active", via: "GS DAP" },
                    { name: "Citi", role: "Citi Token Services", status: "Pilot", via: "Permissioned DLT" },
                    { name: "UBS", role: "Tokenized money market fund", status: "Active", via: "Ethereum / Canton" },
                  ].map((inst) => (
                    <div key={inst.name} className="p-3 rounded-lg bg-muted/40 border border-border/20">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-foreground">{inst.name}</p>
                        <Badge
                          variant="secondary"
                          className={`text-xs text-muted-foreground border ${
                            inst.status === "Active"
                              ? "bg-emerald-900/30 text-emerald-400 border-emerald-800"
                              : "bg-yellow-900/30 text-yellow-400 border-yellow-800"
                          }`}
                        >
                          {inst.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{inst.role}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Via: {inst.via}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Looking Forward */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  What to Watch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      title: "US FIT21 / Digital Asset Clarity",
                      desc: "Congress advancing framework to clarify commodity vs security for digital assets. Could unlock $100B+ institutional capital.",
                      icon: Landmark,
                      color: "text-primary",
                    },
                    {
                      title: "CBDC Integration",
                      desc: "If wholesale CBDCs launch (e-CNY, digital euro, FedNow 2.0), tokenized RWAs may settle natively in central bank money.",
                      icon: Globe,
                      color: "text-emerald-400",
                    },
                    {
                      title: "DLT Securities Settlement",
                      desc: "DTCC Project Ion + EU DLT Pilot could make T-bill / equity delivery vs. payment fully on-chain by 2027.",
                      icon: Activity,
                      color: "text-primary",
                    },
                    {
                      title: "Interoperability Standards",
                      desc: "ERC-3643 (T-REX) and ERC-1400 competing as security token standards. Convergence = cross-chain secondary markets.",
                      icon: Network,
                      color: "text-muted-foreground",
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border/20">
                      <item.icon className={`w-4 h-4 ${item.color} mt-0.5 flex-shrink-0`} />
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
