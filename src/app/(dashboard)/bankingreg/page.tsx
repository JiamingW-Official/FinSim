"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Building2,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  DollarSign,
  Lock,
  FileText,
  TrendingDown,
  BarChart2,
  Users,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 952;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const _sv = () => _vals[_vi++ % _vals.length];
void _sv;

// ── Helpers ────────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ── Tab 1: Capital Hierarchy SVG ───────────────────────────────────────────────
function CapitalStackSVG() {
  const W = 480;
  const H = 220;
  const layers = [
    { label: "CET1 — Common Equity Tier 1", pct: "4.5%", color: "#22c55e", h: 60, note: "Retained earnings, common shares" },
    { label: "Additional Tier 1 (AT1)", pct: "1.5%", color: "#f59e0b", h: 40, note: "Contingent convertibles (CoCos)" },
    { label: "Tier 2 Capital", pct: "2.0%", color: "#6366f1", h: 40, note: "Sub debt, general provisions" },
    { label: "Conservation Buffer", pct: "2.5%", color: "#0ea5e9", h: 40, note: "Builds resilience over cycle" },
    { label: "CCyB — Countercyclical Buffer", pct: "0–2.5%", color: "#ec4899", h: 40, note: "Activated by national regulators" },
  ];
  let y = 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56">
      {layers.map((l, i) => {
        const curY = y;
        y += l.h + 4;
        const barW = W * 0.44;
        return (
          <g key={i}>
            <rect x={8} y={curY} width={barW} height={l.h - 2} rx={4} fill={l.color} fillOpacity={0.18} stroke={l.color} strokeOpacity={0.55} strokeWidth={1.2} />
            <text x={16} y={curY + 16} fill={l.color} fontSize={10} fontWeight="600">{l.label}</text>
            <text x={16} y={curY + 30} fill="#a1a1aa" fontSize={9}>{l.note}</text>
            <rect x={barW + 14} y={curY + 8} width={44} height={l.h - 18} rx={3} fill={l.color} fillOpacity={0.25} />
            <text x={barW + 36} y={curY + l.h / 2 + 4} fill={l.color} fontSize={11} fontWeight="700" textAnchor="middle">{l.pct}</text>
            {i < layers.length - 1 && (
              <line x1={8} x2={barW + 58} y1={curY + l.h + 1} y2={curY + l.h + 1} stroke="#3f3f46" strokeWidth={1} strokeDasharray="3 3" />
            )}
          </g>
        );
      })}
      <text x={W - 12} y={20} fill="#71717a" fontSize={9} textAnchor="end">Minimum ratios (Basel III)</text>
    </svg>
  );
}

// ── Tab 1: RWA Approaches Bar ──────────────────────────────────────────────────
function RwaApproachChart() {
  const approaches = [
    { name: "Standardised (SA)", rwa: 100, color: "#6366f1" },
    { name: "Foundation IRB", rwa: 85, color: "#0ea5e9" },
    { name: "Advanced IRB", rwa: 72, color: "#22c55e" },
    { name: "Basel IV Floor (72.5%)", rwa: 72.5, color: "#f59e0b" },
  ];
  const W = 440;
  const H = 140;
  const barH = 22;
  const gap = 10;
  const labelW = 148;
  const maxW = W - labelW - 50;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36">
      {approaches.map((a, i) => {
        const y = 12 + i * (barH + gap);
        const bw = (a.rwa / 100) * maxW;
        return (
          <g key={i}>
            <text x={0} y={y + barH / 2 + 4} fill="#a1a1aa" fontSize={9.5}>{a.name}</text>
            <rect x={labelW} y={y} width={bw} height={barH} rx={3} fill={a.color} fillOpacity={0.25} stroke={a.color} strokeOpacity={0.5} strokeWidth={1} />
            <text x={labelW + bw + 5} y={y + barH / 2 + 4} fill={a.color} fontSize={10} fontWeight="600">{a.rwa}%</text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 2} fill="#52525b" fontSize={8} textAnchor="middle">RWA as % of Standardised (higher = more conservative)</text>
    </svg>
  );
}

// ── Tab 2: DFAST/CCAR Flow SVG ─────────────────────────────────────────────────
function DfastFlowSVG() {
  const W = 500;
  const H = 120;
  const boxes = [
    { label: "Fed Macro\nScenarios", sub: "Baseline / Adverse\nSeverely Adverse", x: 10, color: "#6366f1" },
    { label: "Bank\nProjections", sub: "9-quarter forecast\nrevenue & losses", x: 160, color: "#0ea5e9" },
    { label: "Capital\nPlan", sub: "Dividends, buybacks\nbuffer maintenance", x: 310, color: "#22c55e" },
    { label: "Fed\nDecision", sub: "Objection: qualitative\nor quantitative", x: 420, color: "#f59e0b" },
  ];
  const BW = 120;
  const BH = 80;
  const arrowY = BH / 2 + 20;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
      {boxes.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={20} width={BW} height={BH} rx={6} fill={b.color} fillOpacity={0.12} stroke={b.color} strokeOpacity={0.45} strokeWidth={1.2} />
          {b.label.split("\n").map((line, j) => (
            <text key={j} x={b.x + BW / 2} y={36 + j * 13} fill={b.color} fontSize={10} fontWeight="600" textAnchor="middle">{line}</text>
          ))}
          {b.sub.split("\n").map((line, j) => (
            <text key={j} x={b.x + BW / 2} y={64 + j * 11} fill="#71717a" fontSize={8} textAnchor="middle">{line}</text>
          ))}
          {i < boxes.length - 1 && (
            <line x1={b.x + BW + 2} x2={b.x + BW + 28} y1={arrowY} y2={arrowY} stroke="#52525b" strokeWidth={1.5} markerEnd="url(#arr)" />
          )}
        </g>
      ))}
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill="#52525b" />
        </marker>
      </defs>
    </svg>
  );
}

// ── Tab 2: Stress Capital Ratio Chart ─────────────────────────────────────────
function StressCapitalChart() {
  const W = 460;
  const H = 160;
  const PAD = { l: 36, r: 16, t: 16, b: 28 };
  const quarters = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9"];
  const base = [13.2, 13.5, 13.8, 14.0, 14.2, 14.5, 14.8, 15.0, 15.2];
  const adverse = [13.2, 12.1, 11.4, 10.9, 10.6, 10.5, 10.8, 11.2, 11.8];
  const severe = [13.2, 11.0, 9.5, 8.4, 7.8, 7.5, 7.9, 8.6, 9.4];
  const min = 4.5;
  const maxV = 16;
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const toX = (i: number) => PAD.l + (i / (quarters.length - 1)) * cW;
  const toY = (v: number) => PAD.t + cH - ((clamp(v, min, maxV) - min) / (maxV - min)) * cH;
  const line = (arr: number[]) => arr.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      {[min, 6, 8, 10, 12, 14, maxV].map((v) => (
        <g key={v}>
          <line x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth={1} />
          <text x={PAD.l - 4} y={toY(v) + 3} fill="#52525b" fontSize={8} textAnchor="end">{v}%</text>
        </g>
      ))}
      {/* Minimum CET1 reference line */}
      <line x1={PAD.l} x2={W - PAD.r} y1={toY(4.5)} y2={toY(4.5)} stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" />
      <text x={W - PAD.r - 2} y={toY(4.5) - 4} fill="#ef4444" fontSize={8} textAnchor="end">Min 4.5%</text>
      <polyline points={line(base)} fill="none" stroke="#22c55e" strokeWidth={1.8} strokeLinejoin="round" />
      <polyline points={line(adverse)} fill="none" stroke="#f59e0b" strokeWidth={1.8} strokeLinejoin="round" />
      <polyline points={line(severe)} fill="none" stroke="#ef4444" strokeWidth={1.8} strokeLinejoin="round" />
      {quarters.map((q, i) => (
        <text key={i} x={toX(i)} y={H - 4} fill="#52525b" fontSize={8} textAnchor="middle">{q}</text>
      ))}
      {/* Legend */}
      {[{ label: "Baseline", color: "#22c55e" }, { label: "Adverse", color: "#f59e0b" }, { label: "Severely Adverse", color: "#ef4444" }].map((l, i) => (
        <g key={i}>
          <line x1={PAD.l + i * 110} x2={PAD.l + i * 110 + 16} y1={PAD.t + 6} y2={PAD.t + 6} stroke={l.color} strokeWidth={2} />
          <text x={PAD.l + i * 110 + 20} y={PAD.t + 10} fill={l.color} fontSize={8.5}>{l.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Tab 3: SPOE vs MPOE SVG ────────────────────────────────────────────────────
function ResolutionStrategySVG() {
  const W = 480;
  const H = 160;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      {/* SPOE side */}
      <text x={110} y={14} fill="#6366f1" fontSize={10} fontWeight="700" textAnchor="middle">SPOE — Single Point of Entry</text>
      <rect x={60} y={20} width={100} height={32} rx={5} fill="#6366f1" fillOpacity={0.15} stroke="#6366f1" strokeOpacity={0.5} strokeWidth={1.2} />
      <text x={110} y={40} fill="#a5b4fc" fontSize={9} textAnchor="middle">Holding Company</text>
      <text x={110} y={51} fill="#71717a" fontSize={8} textAnchor="middle">Bail-in at HoldCo level</text>
      {[60, 90, 120].map((x, i) => (
        <g key={i}>
          <line x1={110} x2={x + 15} y1={52} y2={72} stroke="#52525b" strokeWidth={1} />
          <rect x={x} y={72} width={30} height={22} rx={3} fill="#3f3f46" stroke="#52525b" strokeWidth={1} />
          <text x={x + 15} y={87} fill="#71717a" fontSize={7.5} textAnchor="middle">{["OpCo", "OpCo", "OpCo"][i]}</text>
        </g>
      ))}
      <text x={110} y={112} fill="#6366f1" fontSize={8} textAnchor="middle">Subsidiaries remain solvent</text>
      <text x={110} y={122} fill="#52525b" fontSize={7.5} textAnchor="middle">Losses absorbed at top</text>

      {/* Divider */}
      <line x1={240} x2={240} y1={10} y2={H - 10} stroke="#3f3f46" strokeWidth={1} strokeDasharray="4 3" />

      {/* MPOE side */}
      <text x={370} y={14} fill="#0ea5e9" fontSize={10} fontWeight="700" textAnchor="middle">MPOE — Multiple Points of Entry</text>
      {[280, 330, 380, 430].map((x, i) => (
        <g key={i}>
          <rect x={x} y={20} width={40} height={28} rx={4} fill="#0ea5e9" fillOpacity={0.12} stroke="#0ea5e9" strokeOpacity={0.45} strokeWidth={1} />
          <text x={x + 20} y={36} fill="#7dd3fc" fontSize={8} textAnchor="middle">OpCo</text>
          <text x={x + 20} y={46} fill="#52525b" fontSize={7} textAnchor="middle">{["US", "EU", "UK", "APAC"][i]}</text>
          <rect x={x + 5} y={55} width={30} height={18} rx={3} fill="#3f3f46" stroke="#52525b" strokeWidth={1} />
          <text x={x + 20} y={67} fill="#71717a" fontSize={7} textAnchor="middle">Subs</text>
          <line x1={x + 20} x2={x + 20} y1={48} y2={55} stroke="#52525b" strokeWidth={1} />
        </g>
      ))}
      <text x={370} y={88} fill="#0ea5e9" fontSize={8} textAnchor="middle">Each entity resolved locally</text>
      <text x={370} y={98} fill="#52525b" fontSize={7.5} textAnchor="middle">Host regulators maintain control</text>

      {/* TLAC note */}
      <rect x={10} y={H - 36} width={460} height={28} rx={4} fill="#1c1c1e" />
      <text x={240} y={H - 22} fill="#f59e0b" fontSize={9} textAnchor="middle" fontWeight="600">TLAC: 16% of RWA by 2019 → 18% by 2022 | Bail-in: converts debt to equity during resolution</text>
      <text x={240} y={H - 11} fill="#52525b" fontSize={7.5} textAnchor="middle">G-SIBs must pre-position TLAC at material sub-groups; SPOE preferred by US / MPOE preferred by EU</text>
    </svg>
  );
}

// ── Tab 3: 2023 Bank Failures Timeline ────────────────────────────────────────
interface FailureEvent {
  date: string;
  bank: string;
  assets: string;
  cause: string;
  color: string;
}
const FAILURES: FailureEvent[] = [
  { date: "Mar 8", bank: "Silvergate", assets: "$11B", cause: "Crypto deposit flight", color: "#f59e0b" },
  { date: "Mar 10", bank: "SVB", assets: "$209B", cause: "Duration mismatch + uninsured deposits", color: "#ef4444" },
  { date: "Mar 12", bank: "Signature", assets: "$110B", cause: "Contagion + crypto exposure", color: "#f97316" },
  { date: "Mar 16", bank: "Fed Rescue", assets: "BTFP", cause: "Bank Term Funding Program launched", color: "#22c55e" },
  { date: "May 1", bank: "First Republic", assets: "$229B", cause: "Deposit outflow → JPMorgan acquires", color: "#ef4444" },
];

// ── Tab 4: Deposit Insurance Global Comparison SVG ────────────────────────────
function DepositInsuranceSVG() {
  const W = 460;
  const H = 130;
  const countries = [
    { name: "USA", limit: "$250K", dif: "FDIC", color: "#6366f1", pct: 100 },
    { name: "EU", limit: "€100K", dif: "DGS", color: "#0ea5e9", pct: 40 },
    { name: "UK", limit: "£85K", dif: "FSCS", color: "#22c55e", pct: 34 },
    { name: "Japan", limit: "¥10M", dif: "DIC", color: "#f59e0b", pct: 65 },
    { name: "Canada", limit: "C$100K", dif: "CDIC", color: "#ec4899", pct: 40 },
  ];
  const barH = 18;
  const gap = 6;
  const labelW = 52;
  const maxBarW = W - labelW - 80;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
      {countries.map((c, i) => {
        const y = 8 + i * (barH + gap);
        const bw = (c.pct / 100) * maxBarW;
        return (
          <g key={i}>
            <text x={0} y={y + barH - 4} fill="#a1a1aa" fontSize={9.5}>{c.name}</text>
            <rect x={labelW} y={y} width={bw} height={barH} rx={3} fill={c.color} fillOpacity={0.2} stroke={c.color} strokeOpacity={0.5} strokeWidth={1} />
            <text x={labelW + bw + 6} y={y + barH - 4} fill={c.color} fontSize={9.5} fontWeight="600">{c.limit}</text>
            <text x={labelW + bw + 6 + 42} y={y + barH - 4} fill="#52525b" fontSize={8.5}>({c.dif})</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Expandable Row ─────────────────────────────────────────────────────────────
interface ExpandableRowProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accent?: string;
}
function ExpandableRow({ title, children, defaultOpen = false, accent = "text-muted-foreground" }: ExpandableRowProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden mb-2">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-card/60 hover:bg-muted/60 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <span className={cn("text-sm font-medium", accent)}>{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-background/40 text-sm text-muted-foreground space-y-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Stat Chip ──────────────────────────────────────────────────────────────────
interface StatChipProps {
  label: string;
  value: string;
  color?: string;
}
function StatChip({ label, value, color = "text-foreground" }: StatChipProps) {
  return (
    <div className="flex flex-col items-center bg-card border border-border rounded-lg px-3 py-2 min-w-[90px]">
      <span className={cn("text-base font-bold tabular-nums", color)}>{value}</span>
      <span className="text-xs text-muted-foreground mt-0.5 text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function BankingRegPage() {
  const [gsibBucket, setGsibBucket] = useState(2);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight">Banking Regulation &amp; Capital</h1>
          <Badge variant="outline" className="text-xs border-indigo-500/40 text-indigo-400">Basel III/IV</Badge>
        </div>
        <p className="text-sm text-muted-foreground ml-9">
          Capital adequacy frameworks, stress testing, resolution planning, deposit insurance, and the 2023 banking crisis.
        </p>
      </motion.div>

      <Tabs defaultValue="capital" className="space-y-4">
        <TabsList className="bg-card border border-border h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="capital" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Layers className="w-3.5 h-3.5 mr-1" />Basel III/IV Capital
          </TabsTrigger>
          <TabsTrigger value="stress" className="text-xs data-[state=active]:bg-sky-600 data-[state=active]:text-white">
            <Activity className="w-3.5 h-3.5 mr-1" />Stress Testing
          </TabsTrigger>
          <TabsTrigger value="resolution" className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <FileText className="w-3.5 h-3.5 mr-1" />Resolution Planning
          </TabsTrigger>
          <TabsTrigger value="deposit" className="text-xs data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <Lock className="w-3.5 h-3.5 mr-1" />Deposit Insurance
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Basel III/IV Capital ────────────────────────────────────────── */}
        <TabsContent value="capital" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Capital stack */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Capital Hierarchy — Basel III Minimum Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CapitalStackSVG />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  <StatChip label="CET1 Min" value="4.5%" color="text-emerald-400" />
                  <StatChip label="Tier 1 Min" value="6.0%" color="text-sky-400" />
                  <StatChip label="Total Cap" value="8.0%" color="text-indigo-400" />
                  <StatChip label="Conservation" value="+2.5%" color="text-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Minimum ratios + buffers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-sky-400" />
                    RWA Calculation Approaches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RwaApproachChart />
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p><span className="text-muted-foreground font-medium">Standardised (SA):</span> Fixed regulatory risk weights per asset class. Simple but conservative.</p>
                    <p><span className="text-muted-foreground font-medium">Foundation IRB:</span> Banks estimate PD; LGD/EAD set by regulator. Requires supervisory approval.</p>
                    <p><span className="text-muted-foreground font-medium">Advanced IRB:</span> Banks estimate PD, LGD, EAD. Most risk-sensitive; most model risk.</p>
                    <p><span className="text-muted-foreground font-medium">Basel IV Output Floor:</span> IRB-derived RWA cannot fall below 72.5% of SA-based RWA. Phased in 2025–2030.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    Liquidity Standards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sky-400">LCR — Liquidity Coverage Ratio</span>
                      <Badge className="bg-sky-900/40 text-sky-300 text-xs">≥ 100%</Badge>
                    </div>
                    <p>HQLA / Net cash outflows over 30-day stress. Ensures short-term liquidity. Level 1 (cash, sovereign) and Level 2 (corporate bonds) assets.</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-amber-400">NSFR — Net Stable Funding Ratio</span>
                      <Badge className="bg-amber-900/40 text-amber-300 text-xs">≥ 100%</Badge>
                    </div>
                    <p>Available stable funding / Required stable funding over 1-year horizon. Discourages over-reliance on short-term wholesale funding.</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-emerald-400">SLR — Supplementary Leverage Ratio</span>
                      <Badge className="bg-emerald-900/40 text-emerald-300 text-xs">≥ 3%</Badge>
                    </div>
                    <p>Tier 1 capital / Total leverage exposure. Non-risk-based backstop. G-SIBs face enhanced SLR (eSLR) of 5% at holding company, 6% at bank sub.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* G-SIB surcharge + Basel IV timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    G-SIB Surcharge by Bucket
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {[1, 2, 3, 4, 5].map((b) => (
                      <button
                        key={b}
                        onClick={() => setGsibBucket(b)}
                        className={cn(
                          "px-3 py-1 text-xs rounded-md border transition-colors",
                          gsibBucket === b
                            ? "bg-primary border-primary text-white"
                            : "bg-muted border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        Bucket {b}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={gsibBucket}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {(() => {
                        const info = [
                          { surcharge: "1.0%", banks: "Agricultural Bank of China, BPCE, Credit Agricole, ING, Mizuho, Morgan Stanley, Royal Bank of Canada, Santander, Standard Chartered, UBS, UniCredit, Wells Fargo", cet1: "5.5%" },
                          { surcharge: "1.5%", banks: "Bank of America, Bank of China, Bank of NY Mellon, ICBC, Mitsubishi UFJ, Société Générale", cet1: "6.0%" },
                          { surcharge: "2.0%", banks: "Barclays, BNP Paribas, Deutsche Bank, Goldman Sachs, Industrial & Commercial Bank, Citigroup, HSBC", cet1: "6.5%" },
                          { surcharge: "2.5%", banks: "JPMorgan Chase (historically in Bucket 4)", cet1: "7.0%" },
                          { surcharge: "3.5%", banks: "Empty — reserve bucket for future systemic institutions", cet1: "8.0%" },
                        ][gsibBucket - 1];
                        return (
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">CET1 Surcharge:</span>
                              <Badge className="bg-muted/60 text-primary text-sm font-bold">{info.surcharge}</Badge>
                              <span className="text-muted-foreground">Effective CET1 min:</span>
                              <Badge className="bg-indigo-900/40 text-indigo-300 text-sm font-bold">{info.cet1}</Badge>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{info.banks}</p>
                          </div>
                        );
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    US Basel III Endgame &amp; Capital Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <div>
                    <p className="text-muted-foreground font-medium mb-1">US Implementation Timeline</p>
                    <div className="space-y-1">
                      {[
                        { year: "2013–2015", event: "Basel III phased in: LCR, SLR, capital minimums" },
                        { year: "2018", event: "NSFR final rule proposed (finalized 2021)" },
                        { year: "2023", event: "Basel III Endgame NPR — expanded IRB floor, operational risk SA-OR" },
                        { year: "2025–2030", event: "Phased implementation of Basel IV output floor (72.5%)" },
                      ].map((e, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-emerald-400 font-mono shrink-0">{e.year}</span>
                          <span>{e.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border pt-2">
                    <p className="text-muted-foreground font-medium mb-1">Capital Distribution Restrictions</p>
                    <p>When CET1 falls below the Combined Buffer Requirement (CBR = conservation + CCyB + G-SIB surcharge), Maximum Distributable Amount (MDA) limits dividends, buybacks, and discretionary bonuses as a % of eligible profits.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── TAB 2: Stress Testing ──────────────────────────────────────────────── */}
        <TabsContent value="stress" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* DFAST/CCAR flow */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  DFAST / CCAR Framework — Fed Supervisory Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DfastFlowSVG />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  <StatChip label="Forecast Horizon" value="9 Qtrs" color="text-sky-400" />
                  <StatChip label="Scenarios" value="3" color="text-indigo-400" />
                  <StatChip label="Asset Threshold" value="$100B+" color="text-amber-400" />
                  <StatChip label="SCB Min" value="2.5%" color="text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            {/* Capital ratio under stress */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-amber-400" />
                  CET1 Ratio Projection Under Three Scenarios (illustrative)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StressCapitalChart />
                <p className="text-[11px] text-muted-foreground mt-1">Severely Adverse: severe global recession, 40% equity decline, +5% unemployment, commercial real estate stress.</p>
              </CardContent>
            </Card>

            {/* Stress test details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <ExpandableRow title="Stress Capital Buffer (SCB)" defaultOpen accent="text-sky-300">
                  <p>Post-2019 framework replaced CCAR capital plan with the SCB. The SCB equals the projected peak-to-trough CET1 decline under the severely adverse scenario, plus 4 quarters of planned dividends. Minimum SCB is 2.5%.</p>
                  <p className="mt-1">SCB is bank-specific and recalibrated annually each August. Higher-risk banks receive higher SCB requirements automatically.</p>
                </ExpandableRow>
                <ExpandableRow title="Qualitative vs. Quantitative Objection" accent="text-indigo-300">
                  <p><span className="text-indigo-300 font-medium">Quantitative:</span> capital ratios fall below minimums under stress. Objection restricts capital distributions.</p>
                  <p className="mt-1"><span className="text-indigo-300 font-medium">Qualitative:</span> Fed objects to capital plan if internal risk management, models, or governance are inadequate — even if ratios pass.</p>
                  <p className="mt-1">Fed removed automatic qualitative objection for large BHCs in 2019; now addressed via supervisory feedback.</p>
                </ExpandableRow>
                <ExpandableRow title="Stress Test Evolution" accent="text-amber-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li><span className="text-amber-300">2009 SCAP:</span> First US supervisory stress test; revealed $75B capital gap at 10 banks.</li>
                    <li><span className="text-amber-300">2012 DFAST:</span> Annual regulatory exercise legislated by Dodd-Frank for banks &gt;$10B.</li>
                    <li><span className="text-amber-300">2012 CCAR:</span> Capital plan review; qualitative objection possible.</li>
                    <li><span className="text-amber-300">2019:</span> SCB rule merges CCAR into DFAST capital requirements.</li>
                    <li><span className="text-amber-300">2023:</span> Stress test transparency increased; exploratory scenarios added.</li>
                  </ul>
                </ExpandableRow>
              </div>
              <div className="space-y-2">
                <ExpandableRow title="ICAAP / ILAAP — Internal Stress Testing" defaultOpen accent="text-emerald-300">
                  <p><span className="text-emerald-300 font-medium">ICAAP (Internal Capital Adequacy Assessment Process):</span> Banks self-assess capital adequacy vs. all material risks over a 3-year planning horizon. Fed and ECB review outputs as part of SREP.</p>
                  <p className="mt-1"><span className="text-emerald-300 font-medium">ILAAP:</span> Equivalent process for liquidity. Tests institution-specific funding stress. Feeds Pillar 2 capital add-ons.</p>
                </ExpandableRow>
                <ExpandableRow title="Climate Stress Testing" accent="text-emerald-300">
                  <p>Fed launched pilot Climate Scenario Analysis (CSA) in 2023 for 6 largest US banks. Covers physical risk (hurricane, wildfire) and transition risk (carbon pricing trajectory) over 10-year horizon.</p>
                  <p className="mt-1">ECB conducts annual climate stress tests since 2022. Findings informing Pillar 2 guidance and supervisory expectations for climate risk integration.</p>
                </ExpandableRow>
                <ExpandableRow title="Reverse Stress Testing" accent="text-pink-300">
                  <p>Instead of projecting outcomes from scenarios, reverse stress testing asks: "What scenario would cause us to fail?" Forces banks to identify idiosyncratic vulnerabilities (concentration risk, model dependency) not captured by standard scenarios.</p>
                  <p className="mt-1">Required under EBA guidelines since 2010; increasingly adopted by US supervisors post-2023 failures.</p>
                </ExpandableRow>
                <ExpandableRow title="Model Validation Governance" accent="text-primary">
                  <p>SR 11-7 (OCC/Fed) requires independent model validation: conceptual soundness review, outcome analysis, benchmarking. Three lines of defense model: front office, model risk management, internal audit.</p>
                  <p className="mt-1">Stress models receive enhanced scrutiny — challenger models and sensitivity analysis required for high-risk models used in DFAST/CCAR submissions.</p>
                </ExpandableRow>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── TAB 3: Resolution Planning ────────────────────────────────────────── */}
        <TabsContent value="resolution" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* SPOE vs MPOE */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Resolution Strategies — SPOE vs. MPOE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResolutionStrategySVG />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  <StatChip label="TLAC Phase 1" value="16%" color="text-indigo-400" />
                  <StatChip label="TLAC Phase 2" value="18%" color="text-primary" />
                  <StatChip label="TLAC of Lev" value="6%" color="text-sky-400" />
                  <StatChip label="Title I" value="Dodd-Frank" color="text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            {/* Living wills + bail-in */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <ExpandableRow title="Living Will Requirements (Title I Dodd-Frank)" defaultOpen accent="text-emerald-300">
                  <p>G-SIBs and large foreign banking organizations must submit resolution plans to FDIC and Fed annually. Plans must demonstrate how the firm can be resolved under the US Bankruptcy Code without extraordinary government support.</p>
                  <p className="mt-1">Key components: critical operations, material legal entities, separability of business lines, liquidity and capital during resolution, cross-border cooperation agreements.</p>
                </ExpandableRow>
                <ExpandableRow title="Bail-In Mechanics" accent="text-indigo-300">
                  <p>Bail-in converts TLAC-eligible debt (holding company senior unsecured, subordinated debt) to equity during resolution to recapitalize the firm. Unlike bail-out (taxpayer support), losses fall on creditors in strict waterfall order.</p>
                  <p className="mt-1">Sequence: equity → AT1 CoCos → Tier 2 sub debt → TLAC-eligible senior holding company debt → operating company creditors (partially protected).</p>
                </ExpandableRow>
                <ExpandableRow title="FDIC vs. OFR Resolution Authority" accent="text-amber-300">
                  <p><span className="text-amber-300 font-medium">Title II OLA:</span> FDIC-administered Orderly Liquidation Authority can be invoked if bankruptcy would cause systemic risk. Funded by assessment on financial companies post-resolution.</p>
                  <p className="mt-1"><span className="text-amber-300 font-medium">Preferred path:</span> FDIC/Fed prefer Title I bankruptcy resolution. OLA remains backstop. No public taxpayer funds in either mechanism.</p>
                </ExpandableRow>
              </div>
              <div className="space-y-2">
                {/* 2023 failures timeline */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      2023 Banking Crisis Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {FAILURES.map((f, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-2 text-xs"
                        >
                          <span className={cn("font-mono text-xs shrink-0 mt-0.5 w-12", `text-[${f.color}]`)} style={{ color: f.color }}>{f.date}</span>
                          <div className="flex-1 bg-muted/50 rounded-md px-2 py-1.5 border border-border/40">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-semibold text-foreground">{f.bank}</span>
                              <span style={{ color: f.color }} className="text-xs font-mono">{f.assets}</span>
                            </div>
                            <span className="text-muted-foreground">{f.cause}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-3 bg-amber-950/30 border border-amber-800/40 rounded-md px-3 py-2 text-xs text-amber-300">
                      <span className="font-semibold">Systemic Risk Exception:</span> FDIC invoked SRE to guarantee all deposits at SVB &amp; Signature beyond $250K limit, preventing broader contagion. Required Treasury/Fed/FDIC joint determination.
                    </div>
                  </CardContent>
                </Card>
                <ExpandableRow title="Root Causes: Duration Mismatch + Uninsured Deposits" accent="text-red-300">
                  <p><span className="text-red-300 font-medium">SVB:</span> Held 55% of assets in long-duration HTM securities (avg. 10yr). Rising rates → unrealized losses of $15B vs. $16B equity. Concentrated VC/startup depositor base: 94% of deposits uninsured at year-end 2022. Social media accelerated the run to &lt;48 hours.</p>
                  <p className="mt-1"><span className="text-red-300 font-medium">Regulatory gap:</span> 2018 rollback (S.2155) raised SIFI threshold from $50B to $250B. SVB escaped enhanced prudential standards, LCR, NSFR, and annual DFAST requirements.</p>
                </ExpandableRow>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── TAB 4: Deposit Insurance & Consumer Protection ───────────────────── */}
        <TabsContent value="deposit" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* FDIC mechanics */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Deposit Insurance — Global Coverage Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DepositInsuranceSVG />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  <StatChip label="FDIC Limit" value="$250K" color="text-amber-400" />
                  <StatChip label="Joint Acct" value="$500K" color="text-indigo-400" />
                  <StatChip label="Retirement" value="$250K" color="text-emerald-400" />
                  <StatChip label="DIF Reserve" value="~1.35%" color="text-sky-400" />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <ExpandableRow title="FDIC Insurance Mechanics" defaultOpen accent="text-amber-300">
                  <p>Coverage is per depositor, per institution, per ownership category. Single accounts: $250K. Joint: $500K ($250K per co-owner). IRAs: $250K separate from other accounts.</p>
                  <p className="mt-1">Deposit Insurance Fund (DIF) funded by quarterly premiums from banks. Risk-based assessment: riskier banks pay higher premiums (Scorecard method for large banks).</p>
                  <p className="mt-1">FDIC target DIF reserve ratio: 1.35% of insured deposits. Post-GFC depleted to negative; recovered by 2018 via special assessments.</p>
                </ExpandableRow>
                <ExpandableRow title="Bank Run Dynamics" accent="text-red-300">
                  <p><span className="text-red-300 font-medium">Diamond-Dybvig model (1983):</span> Banks perform maturity transformation (short-term deposits → long-term loans). This creates inherent fragility: if depositors believe others will run, rational to run first.</p>
                  <p className="mt-1"><span className="text-red-300 font-medium">Panic vs. fundamental runs:</span> Panic runs driven by coordination failure (deposit insurance solves). Fundamental runs occur when bank is genuinely insolvent — insurance doesn't prevent, only pays out.</p>
                  <p className="mt-1">Social media dramatically compressed run dynamics: SVB lost $42B in deposits in one day, with $100B more queued next morning.</p>
                </ExpandableRow>
                <ExpandableRow title="Fintech Bank Charter Options" accent="text-primary">
                  <p><span className="text-primary font-medium">National Bank Charter (OCC):</span> Full banking powers, federal preemption of state consumer laws. Requires CRA compliance, capital standards.</p>
                  <p className="mt-1"><span className="text-primary font-medium">Industrial Loan Company (ILC):</span> State-chartered, FDIC-insured, not subject to BHC Act. Allows commercial firms (e.g., Square/Block) to own a bank.</p>
                  <p className="mt-1"><span className="text-primary font-medium">Special Purpose Charter:</span> OCC proposed fintech charter in 2016; repeatedly challenged in courts. As of 2025, no approved fintech-specific national charter exists.</p>
                  <p className="mt-1"><span className="text-primary font-medium">BaaS (Banking-as-a-Service):</span> Most fintechs partner with FDIC-insured banks (sponsor banks) rather than obtaining their own charter.</p>
                </ExpandableRow>
              </div>
              <div className="space-y-2">
                <ExpandableRow title="CFPB Jurisdiction & Enforcement" defaultOpen accent="text-sky-300">
                  <p>Created by Dodd-Frank (2010), CFPB supervises banks &gt;$10B and nonbank financial companies (mortgage servicers, payday lenders, debt collectors).</p>
                  <p className="mt-1">Key powers: rulemaking under consumer financial laws, supervisory examination authority, enforcement actions (civil money penalties up to $1M/day for knowing violations), consumer complaint database.</p>
                </ExpandableRow>
                <ExpandableRow title="Consumer Regulations (Reg E / Reg Z / Reg DD)" accent="text-emerald-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li><span className="text-emerald-300 font-medium">Reg E (EFTA):</span> Electronic fund transfer protections — unauthorized transfers, error resolution, overdraft opt-in.</li>
                    <li><span className="text-emerald-300 font-medium">Reg Z (TILA):</span> Truth in lending — APR disclosure, right of rescission, ability to repay for mortgages.</li>
                    <li><span className="text-emerald-300 font-medium">Reg DD (TISA):</span> Truth in savings — APY disclosure, fee transparency for deposit accounts.</li>
                    <li><span className="text-emerald-300 font-medium">UDAAP:</span> Unfair, Deceptive, or Abusive Acts or Practices — broad authority used by CFPB for enforcement beyond specific regulations.</li>
                  </ul>
                </ExpandableRow>
                <ExpandableRow title="Fair Lending: CRA / ECOA / HMDA" accent="text-pink-300">
                  <p><span className="text-pink-300 font-medium">Community Reinvestment Act (CRA):</span> Banks must meet credit needs of communities where they take deposits, including low- and moderate-income areas. Evaluated via examination; ratings affect merger approvals. 2023 CRA overhaul expanded to include digital banking activity.</p>
                  <p className="mt-1"><span className="text-pink-300 font-medium">ECOA / Reg B:</span> Equal Credit Opportunity Act prohibits credit discrimination based on protected characteristics. Adverse action notices required.</p>
                  <p className="mt-1"><span className="text-pink-300 font-medium">HMDA:</span> Home Mortgage Disclosure Act requires lenders to report loan-level data enabling fair lending analysis and geographic redlining detection.</p>
                </ExpandableRow>
              </div>
            </div>

            {/* Quick reference grid */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Regulatory Agency Quick Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    { agency: "Federal Reserve", role: "BHC supervision, monetary policy, DFAST/CCAR, Reg Z/E", color: "#6366f1" },
                    { agency: "OCC", role: "National bank charter, examination of national banks and FSAs", color: "#0ea5e9" },
                    { agency: "FDIC", role: "Deposit insurance, state non-member bank supervision, resolution", color: "#22c55e" },
                    { agency: "CFPB", role: "Consumer financial protection, rulemaking, enforcement for banks >$10B", color: "#f59e0b" },
                    { agency: "NCUA", role: "Credit union supervision and deposit insurance (NCUSIF)", color: "#ec4899" },
                    { agency: "FinCEN", role: "BSA/AML compliance, suspicious activity reports (SARs)", color: "#a78bfa" },
                  ].map((a, i) => (
                    <div key={i} className="bg-muted/40 rounded-lg px-3 py-2 border border-border/40">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                        <span className="text-xs font-semibold text-foreground">{a.agency}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">{a.role}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
