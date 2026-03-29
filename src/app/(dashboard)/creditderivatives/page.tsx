"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  TrendingUp,
  Activity,
  DollarSign,
  AlertTriangle,
  BarChart2,
  Layers,
  Globe,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  Target,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 961;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const _sv = () => _vals[_vi++ % _vals.length];
void _sv;

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmtBps = (n: number) => `${n}bps`;

// ── CDS Mechanics SVG ──────────────────────────────────────────────────────────
function CDSMechanicsSVG() {
  return (
    <svg viewBox="0 0 520 180" className="w-full h-44">
      <defs>
        <marker id="cdsMk1" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" />
        </marker>
        <marker id="cdsMk2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
        </marker>
        <marker id="cdsMk3" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#f87171" />
        </marker>
      </defs>

      {/* Protection Buyer */}
      <rect x="20" y="65" width="110" height="50" rx="7" fill="#18181b" stroke="#6366f1" strokeWidth="1.5" />
      <text x="75" y="87" fill="#a5b4fc" fontSize="9.5" textAnchor="middle" fontWeight="bold">PROTECTION</text>
      <text x="75" y="100" fill="#a5b4fc" fontSize="9.5" textAnchor="middle" fontWeight="bold">BUYER</text>
      <text x="75" y="113" fill="#71717a" fontSize="8" textAnchor="middle">(Long credit risk)</text>

      {/* Protection Seller */}
      <rect x="390" y="65" width="110" height="50" rx="7" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="445" y="87" fill="#fcd34d" fontSize="9.5" textAnchor="middle" fontWeight="bold">PROTECTION</text>
      <text x="445" y="100" fill="#fcd34d" fontSize="9.5" textAnchor="middle" fontWeight="bold">SELLER</text>
      <text x="445" y="113" fill="#71717a" fontSize="8" textAnchor="middle">(Short credit risk)</text>

      {/* Reference Entity */}
      <rect x="205" y="130" width="110" height="40" rx="7" fill="#18181b" stroke="#f87171" strokeWidth="1.5" />
      <text x="260" y="148" fill="#fca5a5" fontSize="9" textAnchor="middle" fontWeight="bold">REFERENCE</text>
      <text x="260" y="161" fill="#fca5a5" fontSize="9" textAnchor="middle" fontWeight="bold">ENTITY</text>

      {/* Premium flow: Buyer to Seller */}
      <line x1="130" y1="82" x2="388" y2="82" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#cdsMk1)" />
      <text x="260" y="76" fill="#818cf8" fontSize="8.5" textAnchor="middle">Premium / CDS Spread (e.g. 100bps p.a.)</text>

      {/* Contingent payment: Seller to Buyer */}
      <line x1="388" y1="108" x2="130" y2="108" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#cdsMk2)" />
      <text x="260" y="122" fill="#fcd34d" fontSize="8" textAnchor="middle">Contingent payment on Credit Event</text>

      {/* Dashed lines to Reference Entity */}
      <line x1="75" y1="115" x2="205" y2="140" stroke="#f87171" strokeWidth="1" strokeDasharray="4,3" markerEnd="url(#cdsMk3)" />
      <line x1="445" y1="115" x2="315" y2="140" stroke="#f87171" strokeWidth="1" strokeDasharray="4,3" markerEnd="url(#cdsMk3)" />

      <text x="260" y="18" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontWeight="bold">Credit Default Swap — Cash Flow Structure</text>
      <text x="260" y="32" fill="#52525b" fontSize="8" textAnchor="middle">Notional: $10M  |  Tenor: 5Y  |  Credit Events: Bankruptcy / Failure to Pay / Restructuring</text>
    </svg>
  );
}

// ── CDS Curve Term Structure SVG ───────────────────────────────────────────────
const CDS_CURVE_DATA = [
  { tenor: "1Y", normal: 50, inverted: 280 },
  { tenor: "2Y", normal: 75, inverted: 260 },
  { tenor: "3Y", normal: 100, inverted: 240 },
  { tenor: "5Y", normal: 140, inverted: 210 },
  { tenor: "7Y", normal: 165, inverted: 190 },
  { tenor: "10Y", normal: 185, inverted: 175 },
];

function CDSCurveSVG() {
  const W = 480;
  const H = 180;
  const PAD = { l: 48, r: 60, t: 24, b: 36 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxSpread = 320;
  const n = CDS_CURVE_DATA.length;
  const toX = (i: number) => PAD.l + (i / (n - 1)) * chartW;
  const toY = (v: number) => PAD.t + chartH - (v / maxSpread) * chartH;

  const normalPts = CDS_CURVE_DATA.map((d, i) => `${toX(i)},${toY(d.normal)}`).join(" ");
  const invertedPts = CDS_CURVE_DATA.map((d, i) => `${toX(i)},${toY(d.inverted)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      {[0, 80, 160, 240, 320].map((v) => (
        <line key={`gl-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {[0, 80, 160, 240, 320].map((v) => (
        <text key={`gy-${v}`} x={PAD.l - 5} y={toY(v) + 4} fill="#71717a" fontSize="8.5" textAnchor="end">
          {v}
        </text>
      ))}
      <text
        x={PAD.l - 28}
        y={PAD.t + chartH / 2}
        fill="#71717a"
        fontSize="8"
        textAnchor="middle"
        transform={`rotate(-90, ${PAD.l - 28}, ${PAD.t + chartH / 2})`}
      >
        CDS Spread (bps)
      </text>

      <polyline points={normalPts} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
      {CDS_CURVE_DATA.map((d, i) => (
        <circle key={`nrm-${i}`} cx={toX(i)} cy={toY(d.normal)} r="3" fill="#34d399" />
      ))}
      <text x={toX(n - 1) + 5} y={toY(CDS_CURVE_DATA[n - 1].normal) + 4} fill="#34d399" fontSize="8">Normal</text>

      <polyline points={invertedPts} fill="none" stroke="#f87171" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3" />
      {CDS_CURVE_DATA.map((d, i) => (
        <circle key={`inv-${i}`} cx={toX(i)} cy={toY(d.inverted)} r="3" fill="#f87171" />
      ))}
      <text x={toX(n - 1) + 5} y={toY(CDS_CURVE_DATA[n - 1].inverted) + 4} fill="#f87171" fontSize="8">Distress</text>

      {CDS_CURVE_DATA.map((d, i) => (
        <text key={`xl-${i}`} x={toX(i)} y={H - 4} fill="#71717a" fontSize="8.5" textAnchor="middle">{d.tenor}</text>
      ))}
      <text x={W / 2} y={H - 20} fill="#52525b" fontSize="7.5" textAnchor="middle">Tenor</text>
      <text x={W / 2} y={16} fill="#a1a1aa" fontSize="9.5" textAnchor="middle" fontWeight="bold">CDS Term Structure — Normal vs Distressed Curve</text>
    </svg>
  );
}

// ── Credit Events ─────────────────────────────────────────────────────────────
interface CreditEvent {
  name: string;
  desc: string;
  example: string;
  borderColor: string;
  textColor: string;
}
const CREDIT_EVENTS: CreditEvent[] = [
  {
    name: "Bankruptcy",
    desc: "Filing for insolvency protection or inability to pay debts as they come due",
    example: "Lehman Brothers 2008, Hertz 2020",
    borderColor: "border-red-500",
    textColor: "text-red-400",
  },
  {
    name: "Failure to Pay",
    desc: "Missed coupon or principal payment exceeding grace period on any obligation above threshold",
    example: "Argentina 2001, 2020; Ecuador 2020",
    borderColor: "border-orange-500",
    textColor: "text-orange-400",
  },
  {
    name: "Restructuring",
    desc: "Material change in debt terms: maturity extension, coupon reduction, or principal haircut",
    example: "Greece PSI 2012 (50% haircut), Zambia 2023",
    borderColor: "border-amber-500",
    textColor: "text-amber-400",
  },
  {
    name: "Repudiation / Moratorium",
    desc: "Government denies or rejects debt obligations (sovereign CDS only)",
    example: "Russia 1998, Venezuela 2017",
    borderColor: "border-primary",
    textColor: "text-primary",
  },
  {
    name: "Obligation Acceleration",
    desc: "Early maturity triggered by default cross-acceleration clauses",
    example: "Emerging market corporates",
    borderColor: "border-primary",
    textColor: "text-primary",
  },
];

// ── Upfront Payment Table ─────────────────────────────────────────────────────
interface UpfrontEntry {
  scenario: string;
  runningCoupon: string;
  fairSpread: string;
  upfront: string;
  direction: string;
}
const UPFRONT_DATA: UpfrontEntry[] = [
  { scenario: "IG — tight credit", runningCoupon: "100bps", fairSpread: "50bps", upfront: "+2.4% (receive)", direction: "Seller pays buyer upfront" },
  { scenario: "IG — at coupon", runningCoupon: "100bps", fairSpread: "100bps", upfront: "0%", direction: "No upfront exchange" },
  { scenario: "IG — wider spread", runningCoupon: "100bps", fairSpread: "150bps", upfront: "-2.3% (pay)", direction: "Buyer pays seller upfront" },
  { scenario: "HY — tight credit", runningCoupon: "500bps", fairSpread: "300bps", upfront: "+8.5% (receive)", direction: "Seller pays buyer upfront" },
  { scenario: "HY — distressed", runningCoupon: "500bps", fairSpread: "1200bps", upfront: "-26% (pay)", direction: "Buyer pays seller upfront" },
];

// ── Sovereign CDS data ────────────────────────────────────────────────────────
interface SovereignCDS {
  country: string;
  spread5Y: number;
  rating: string;
  note: string;
}
const SOVEREIGN_CDS: SovereignCDS[] = [
  { country: "Germany", spread5Y: 12, rating: "AAA", note: "Benchmark risk-free" },
  { country: "United States", spread5Y: 28, rating: "AA+", note: "Downgrade 2023" },
  { country: "Italy", spread5Y: 115, rating: "BBB", note: "Fiscal concerns" },
  { country: "Brazil", spread5Y: 195, rating: "BB", note: "Commodity exposure" },
  { country: "Turkey", spread5Y: 380, rating: "B+", note: "Currency pressure" },
  { country: "Greece", spread5Y: 98, rating: "BB+", note: "Post-restructuring" },
  { country: "Egypt", spread5Y: 620, rating: "B-", note: "FX crisis 2022-23" },
  { country: "Argentina", spread5Y: 2100, rating: "SD", note: "Selective default" },
];

function SovereignBarChart() {
  const W = 480;
  const H = 180;
  const PAD = { l: 72, r: 50, t: 24, b: 16 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxSpread = 2200;
  const n = SOVEREIGN_CDS.length;
  const barH = (chartH / n) * 0.6;
  const toX = (v: number) => PAD.l + (Math.min(v, maxSpread) / maxSpread) * chartW;
  const toY = (i: number) => PAD.t + (i / n) * chartH + (chartH / n) * 0.2;
  const barColor = (spread: number) =>
    spread < 100 ? "#34d399" : spread < 300 ? "#f59e0b" : spread < 800 ? "#f97316" : "#f87171";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      <text x={W / 2} y={16} fill="#a1a1aa" fontSize="9.5" textAnchor="middle" fontWeight="bold">5Y Sovereign CDS Spreads (bps)</text>
      {SOVEREIGN_CDS.map((d, i) => (
        <g key={`sb-${i}`}>
          <text x={PAD.l - 5} y={toY(i) + barH / 2 + 4} fill="#a1a1aa" fontSize="8.5" textAnchor="end">{d.country}</text>
          <rect x={PAD.l} y={toY(i)} width={toX(d.spread5Y) - PAD.l} height={barH} rx="3" fill={barColor(d.spread5Y)} opacity="0.8" />
          <text x={toX(d.spread5Y) + 4} y={toY(i) + barH / 2 + 4} fill={barColor(d.spread5Y)} fontSize="8">{fmtBps(d.spread5Y)}</text>
        </g>
      ))}
    </svg>
  );
}

// ── CDX Index Data ─────────────────────────────────────────────────────────────
interface CDXIndex {
  name: string;
  underlying: string;
  names: number;
  maturity: string;
  spread: number;
  series: number;
  region: string;
}
const CDX_INDICES: CDXIndex[] = [
  { name: "CDX.NA.IG", underlying: "US Inv-Grade Corporates", names: 125, maturity: "5Y", spread: 68, series: 41, region: "North America" },
  { name: "CDX.NA.HY", underlying: "US High-Yield Corporates", names: 100, maturity: "5Y", spread: 385, series: 41, region: "North America" },
  { name: "CDX.EM", underlying: "Emerging Market Sovereigns", names: 21, maturity: "5Y", spread: 205, series: 40, region: "Emerging Markets" },
  { name: "iTraxx Europe", underlying: "European Inv-Grade", names: 125, maturity: "5Y", spread: 72, series: 40, region: "Europe" },
  { name: "iTraxx Xover", underlying: "European Sub-IG/Crossover", names: 75, maturity: "5Y", spread: 320, series: 40, region: "Europe" },
  { name: "iTraxx Japan", underlying: "Japanese Corporates", names: 50, maturity: "5Y", spread: 48, series: 40, region: "Asia" },
  { name: "LCDX", underlying: "US Leveraged Loans", names: 100, maturity: "5Y", spread: 175, series: 13, region: "North America" },
  { name: "CMBX.NA", underlying: "US CMBS Tranches", names: 25, maturity: "N/A", spread: 430, series: 17, region: "Structured Credit" },
];

// ── Tranche data ──────────────────────────────────────────────────────────────
interface Tranche {
  name: string;
  attachment: string;
  detachment: string;
  spread: string;
  role: string;
  correlation: string;
  borderColor: string;
  labelColor: string;
}
const TRANCHES: Tranche[] = [
  { name: "Equity", attachment: "0%", detachment: "3%", spread: "~30% upfront + 500bps", role: "First loss — absorbs first 3% defaults", correlation: "Short correlation", borderColor: "border-red-500", labelColor: "text-red-400" },
  { name: "Junior Mezz", attachment: "3%", detachment: "7%", spread: "~250bps", role: "Second loss — high spread compensation", correlation: "Short correlation", borderColor: "border-orange-500", labelColor: "text-orange-400" },
  { name: "Senior Mezz", attachment: "7%", detachment: "10%", spread: "~100bps", role: "Mid capital structure exposure", correlation: "Long correlation", borderColor: "border-amber-500", labelColor: "text-amber-400" },
  { name: "Senior", attachment: "10%", detachment: "15%", spread: "~40bps", role: "Near-safe protection", correlation: "Long correlation", borderColor: "border-primary", labelColor: "text-primary" },
  { name: "Super Senior", attachment: "15%", detachment: "30%", spread: "~10bps", role: "Catastrophic scenario only", correlation: "Long correlation", borderColor: "border-indigo-500", labelColor: "text-indigo-400" },
];

function TrancheStackSVG() {
  const W = 400;
  const H = 200;
  const colors = ["#f87171", "#f97316", "#f59e0b", "#60a5fa", "#818cf8"];
  const labels = ["Equity 0-3%", "Jr Mezz 3-7%", "Sr Mezz 7-10%", "Senior 10-15%", "Super Sr 15-30%"];
  const heights = [40, 36, 26, 26, 36];
  const spreads = ["~30% + 500bps", "~250bps", "~100bps", "~40bps", "~10bps"];
  let yPos = 20;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
      <text x={W / 2} y={14} fill="#a1a1aa" fontSize="9.5" textAnchor="middle" fontWeight="bold">CDX Tranche Capital Structure</text>
      {labels.map((lbl, i) => {
        const y = yPos;
        yPos += heights[i] + 2;
        return (
          <g key={`tr-${i}`}>
            <rect x={60} y={y} width={200} height={heights[i]} rx="3" fill={colors[i]} opacity="0.2" stroke={colors[i]} strokeWidth="1" />
            <text x={165} y={y + heights[i] / 2 + 4} fill={colors[i]} fontSize="8.5" textAnchor="middle" fontWeight="bold">{lbl}</text>
            <text x={270} y={y + heights[i] / 2 + 4} fill="#a1a1aa" fontSize="8">{spreads[i]}</text>
          </g>
        );
      })}
      <text x={60} y={185} fill="#52525b" fontSize="7.5">Senior (low loss) above</text>
      <text x={60} y={195} fill="#52525b" fontSize="7.5">Junior (first loss) below</text>
    </svg>
  );
}

// ── Roll Mechanics SVG ────────────────────────────────────────────────────────
function RollMechanicsSVG() {
  const items = [
    { label: "Series 40\n(Off-the-run)", color: "#52525b", x: 20 },
    { label: "6-Month\nRoll Window", color: "#f59e0b", x: 165 },
    { label: "Series 41\n(On-the-run)", color: "#34d399", x: 305 },
  ];
  return (
    <svg viewBox="0 0 460 120" className="w-full h-28">
      <defs>
        <marker id="rollArrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
        </marker>
      </defs>
      <text x={230} y={14} fill="#a1a1aa" fontSize="9.5" textAnchor="middle" fontWeight="bold">CDX Index Roll — Every 6 Months</text>
      {items.map((it, i) => (
        <g key={`rm-${i}`}>
          <rect x={it.x} y={35} width={130} height={52} rx="6" fill="#18181b" stroke={it.color} strokeWidth="1.5" />
          {it.label.split("\n").map((line, j) => (
            <text key={`rmt-${i}-${j}`} x={it.x + 65} y={55 + j * 16} fill={it.color} fontSize="9" textAnchor="middle" fontWeight={j === 0 ? "bold" : "normal"}>{line}</text>
          ))}
        </g>
      ))}
      <line x1="150" y1="61" x2="163" y2="61" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#rollArrow)" />
      <line x1="295" y1="61" x2="303" y2="61" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#rollArrow)" />
      <text x={230} y={105} fill="#71717a" fontSize="8" textAnchor="middle">New reference entities added; defaulted names removed; basket rebalanced to equal weight</text>
    </svg>
  );
}

// ── CLN Structure SVG ─────────────────────────────────────────────────────────
function CLNStructureSVG() {
  return (
    <svg viewBox="0 0 540 190" className="w-full h-48">
      <defs>
        <marker id="clnMk1" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" />
        </marker>
        <marker id="clnMk2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#34d399" />
        </marker>
        <marker id="clnMk3" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
        </marker>
        <marker id="clnMk4" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#f87171" />
        </marker>
      </defs>

      <rect x="10" y="70" width="100" height="50" rx="6" fill="#18181b" stroke="#6366f1" strokeWidth="1.5" />
      <text x="60" y="91" fill="#a5b4fc" fontSize="9" textAnchor="middle" fontWeight="bold">INVESTOR</text>
      <text x="60" y="104" fill="#a5b4fc" fontSize="8" textAnchor="middle">Buys CLN</text>
      <text x="60" y="114" fill="#71717a" fontSize="7.5" textAnchor="middle">(funded exposure)</text>

      <rect x="185" y="60" width="110" height="70" rx="6" fill="#18181b" stroke="#8b5cf6" strokeWidth="1.5" />
      <text x="240" y="81" fill="#c4b5fd" fontSize="9" textAnchor="middle" fontWeight="bold">CLN ISSUER</text>
      <text x="240" y="94" fill="#c4b5fd" fontSize="8" textAnchor="middle">(Bank / SPV)</text>
      <text x="240" y="108" fill="#71717a" fontSize="7.5" textAnchor="middle">Embeds CDS on</text>
      <text x="240" y="118" fill="#71717a" fontSize="7.5" textAnchor="middle">Reference Entity</text>

      <rect x="400" y="70" width="110" height="50" rx="6" fill="#18181b" stroke="#f87171" strokeWidth="1.5" />
      <text x="455" y="91" fill="#fca5a5" fontSize="9" textAnchor="middle" fontWeight="bold">REFERENCE</text>
      <text x="455" y="104" fill="#fca5a5" fontSize="9" textAnchor="middle" fontWeight="bold">ENTITY</text>

      <line x1="110" y1="82" x2="183" y2="82" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#clnMk1)" />
      <text x="147" y="76" fill="#818cf8" fontSize="7.5" textAnchor="middle">Principal $</text>

      <line x1="183" y1="108" x2="110" y2="108" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#clnMk2)" />
      <text x="147" y="122" fill="#6ee7b7" fontSize="7.5" textAnchor="middle">LIBOR + spread</text>
      <text x="147" y="132" fill="#6ee7b7" fontSize="7.5" textAnchor="middle">(or par if no event)</text>

      <line x1="295" y1="82" x2="398" y2="82" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#clnMk3)" strokeDasharray="4,3" />
      <text x="347" y="76" fill="#fcd34d" fontSize="7.5" textAnchor="middle">CDS premium</text>

      <line x1="398" y1="108" x2="295" y2="108" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#clnMk4)" strokeDasharray="4,3" />
      <text x="347" y="122" fill="#fca5a5" fontSize="7.5" textAnchor="middle">Credit event</text>
      <text x="347" y="132" fill="#fca5a5" fontSize="7.5" textAnchor="middle">payment</text>

      <text x="270" y="16" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontWeight="bold">Credit-Linked Note (CLN) Structure</text>
      <text x="270" y="30" fill="#52525b" fontSize="7.5" textAnchor="middle">Funded instrument: investor provides principal which can be lost on credit event</text>
      <text x="270" y="175" fill="#71717a" fontSize="7.5" textAnchor="middle">CLN = Bond + Embedded CDS | Investor bears credit risk of Reference Entity via funded structure</text>
    </svg>
  );
}

// ── TRS vs Repo rows ──────────────────────────────────────────────────────────
interface TRSRow {
  aspect: string;
  trs: string;
  repo: string;
}
const TRS_VS_REPO: TRSRow[] = [
  { aspect: "Legal title transfer", trs: "No — referencing asset", repo: "Yes — sold and repurchased" },
  { aspect: "Credit exposure", trs: "Buyer retains economic risk", repo: "Counterparty credit on collateral" },
  { aspect: "Balance sheet impact", trs: "Off-balance (unfunded)", repo: "On-balance for seller" },
  { aspect: "Regulatory capital", trs: "Lower (synthetic)", repo: "Higher (repo book)" },
  { aspect: "Funding cost", trs: "SOFR + TRS spread", repo: "SOFR + haircut cost" },
  { aspect: "Dividend / coupon", trs: "Passed through to TR receiver", repo: "Stays with seller" },
  { aspect: "Use case", trs: "Synthetic long / leverage", repo: "Secured financing / short" },
];

// ── FTD Correlation SVG ───────────────────────────────────────────────────────
function FTDCorrelationSVG() {
  const W = 480;
  const H = 160;
  const PAD = { l: 50, r: 20, t: 28, b: 36 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const corrs = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const ftdSpreads = corrs.map((c) => 500 - 400 * c);
  const maxSpread = 520;
  const toX = (c: number) => PAD.l + c * chartW;
  const toY = (v: number) => PAD.t + chartH - (v / maxSpread) * chartH;
  const pts = corrs.map((c, i) => `${toX(c)},${toY(ftdSpreads[i])}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <text x={W / 2} y={18} fill="#a1a1aa" fontSize="9.5" textAnchor="middle" fontWeight="bold">FTD Basket Spread vs Correlation (5 names x 100bps each)</text>
      {[0, 100, 200, 300, 400, 500].map((v) => (
        <line key={`fg-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {[0, 100, 200, 300, 400, 500].map((v) => (
        <text key={`fgy-${v}`} x={PAD.l - 5} y={toY(v) + 4} fill="#71717a" fontSize="8" textAnchor="end">{v}</text>
      ))}
      <polyline points={pts} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" />
      {corrs.map((c, i) => (
        <circle key={`fdc-${i}`} cx={toX(c)} cy={toY(ftdSpreads[i])} r="3" fill="#f59e0b" />
      ))}
      {[0, 0.25, 0.5, 0.75, 1.0].map((c) => (
        <text key={`fxl-${c}`} x={toX(c)} y={H - 6} fill="#71717a" fontSize="8" textAnchor="middle">{c}</text>
      ))}
      <text x={W / 2} y={H - 20} fill="#52525b" fontSize="7.5" textAnchor="middle">Pairwise Correlation</text>
      <text
        x={PAD.l - 28}
        y={PAD.t + chartH / 2}
        fill="#71717a"
        fontSize="8"
        textAnchor="middle"
        transform={`rotate(-90, ${PAD.l - 28}, ${PAD.t + chartH / 2})`}
      >
        FTD Spread (bps)
      </text>
      <text x={toX(0.1)} y={toY(480) - 8} fill="#f59e0b" fontSize="7.5">Low corr = high FTD risk</text>
      <text x={toX(0.72)} y={toY(130) - 8} fill="#34d399" fontSize="7.5">High corr = lower risk</text>
    </svg>
  );
}

// ── Market stats ──────────────────────────────────────────────────────────────
interface MarketStat {
  label: string;
  value: string;
  sub: string;
  color: string;
}
const MARKET_STATS: MarketStat[] = [
  { label: "Global CDS Gross Notional", value: "$10.3T", sub: "DTCC TIW 2024 estimate", color: "text-indigo-400" },
  { label: "Global CDS Net Notional", value: "$1.8T", sub: "~17% of gross (netting benefit)", color: "text-emerald-400" },
  { label: "Cleared CDS (LCH/ICE)", value: "~75%", sub: "Post Dodd-Frank clearing mandate", color: "text-primary" },
  { label: "Index vs Single Name", value: "60% / 40%", sub: "Index products dominate by volume", color: "text-amber-400" },
  { label: "IG / HY Split", value: "70% / 30%", sub: "IG single-name more liquid", color: "text-primary" },
  { label: "Avg Bid-Ask (IG CDX)", value: "0.25-0.5bps", sub: "Highly liquid benchmark index", color: "text-muted-foreground" },
];

// ── XVA data ──────────────────────────────────────────────────────────────────
interface XVARow {
  xva: string;
  fullName: string;
  desc: string;
  impact: string;
}
const XVA_DATA: XVARow[] = [
  { xva: "CVA", fullName: "Credit Valuation Adjustment", desc: "Cost of counterparty default risk — reduces mark-to-market", impact: "-0.5% to -3% on uncollateralized swaps" },
  { xva: "DVA", fullName: "Debit Valuation Adjustment", desc: "Own credit risk benefit — controversial accounting gain", impact: "Positive to bank when own CDS widens" },
  { xva: "FVA", fullName: "Funding Valuation Adjustment", desc: "Cost of funding collateral posted to OTC derivatives", impact: "-0.1% to -0.5% depending on tenor" },
  { xva: "MVA", fullName: "Margin Valuation Adjustment", desc: "Initial margin cost on cleared derivatives", impact: "Growing post-SIMM implementation" },
  { xva: "KVA", fullName: "Capital Valuation Adjustment", desc: "Regulatory capital cost (SA-CCR framework)", impact: "Significant under Basel III/IV" },
];

// ── CDS Distress indicators ───────────────────────────────────────────────────
interface DistressCase {
  entity: string;
  date: string;
  cdsWidening: string;
  leadTime: string;
  outcome: string;
}
const DISTRESS_CASES: DistressCase[] = [
  { entity: "Evergrande", date: "Aug-Sep 2021", cdsWidening: "200bps to 2000bps", leadTime: "3-4 weeks before headlines", outcome: "Default Dec 2021" },
  { entity: "SVB Financial", date: "Mar 2023", cdsWidening: "80bps to 800bps+", leadTime: "48 hours before closure", outcome: "FDIC seizure Mar 10" },
  { entity: "Credit Suisse", date: "Mar 2023", cdsWidening: "200bps to 1000bps", leadTime: "1 week ahead of rescue", outcome: "UBS acquisition" },
  { entity: "Bed Bath & Beyond", date: "Q1 2023", cdsWidening: "Tripled in 2 weeks", leadTime: "6 weeks before filing", outcome: "Chapter 11 Apr 2023" },
];

// ── Basis trade ───────────────────────────────────────────────────────────────
interface BasisEntry {
  basis: string;
  setup: string;
  pnlSource: string;
  risk: string;
}
const BASIS_DATA: BasisEntry[] = [
  { basis: "Negative Basis", setup: "Buy CDS + Buy Bond (same reference)", pnlSource: "Earn bond yield > CDS cost; convergence profit", risk: "Carry cost; liquidity mismatch" },
  { basis: "Positive Basis", setup: "Sell CDS + Short Bond (same reference)", pnlSource: "Collect CDS premium > cost to short bond", risk: "Short squeeze; repo scarcity" },
  { basis: "Cash-CDS Spread", setup: "Monitor bond spread vs CDS spread", pnlSource: "Arbitrage when gap widens beyond funding cost", risk: "Model risk; basis can persist" },
];

// ── Collapsible section ───────────────────────────────────────────────────────
function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted transition-colors text-left"
      >
        <span className="text-foreground text-sm font-semibold">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CreditDerivativesPage() {
  const [activeTab, setActiveTab] = useState("cds-fundamentals");

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4">
      {/* HERO Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 border-l-4 border-l-primary rounded-md bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Credit Derivatives</h1>
            <p className="text-muted-foreground text-sm">CDS mechanics, CDX indices, credit-linked notes, TRS, and structured credit</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "CDX.NA.IG S41", value: "68bps", color: "text-emerald-400" },
            { label: "CDX.NA.HY S41", value: "385bps", color: "text-amber-400" },
            { label: "iTraxx Europe", value: "72bps", color: "text-primary" },
            { label: "iTraxx Xover", value: "320bps", color: "text-orange-400" },
            { label: "CDS Market Notional", value: "$10.3T", color: "text-indigo-400" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-1.5 px-3 py-1 bg-card border border-border rounded-full">
              <span className="text-muted-foreground text-xs">{stat.label}</span>
              <span className={cn("text-xs text-muted-foreground font-semibold", stat.color)}>{stat.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6 bg-card border border-border">
          <TabsTrigger value="cds-fundamentals" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
            <Shield className="w-3.5 h-3.5 mr-1.5" />CDS Fundamentals
          </TabsTrigger>
          <TabsTrigger value="credit-indices" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
            <BarChart2 className="w-3.5 h-3.5 mr-1.5" />Credit Indices
          </TabsTrigger>
          <TabsTrigger value="cln-trs" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
            <Layers className="w-3.5 h-3.5 mr-1.5" />CLN &amp; TRS
          </TabsTrigger>
          <TabsTrigger value="market-regulation" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground">
            <Globe className="w-3.5 h-3.5 mr-1.5" />Market &amp; Regulation
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: CDS Fundamentals ── */}
        <TabsContent value="cds-fundamentals" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  CDS Cash Flow Mechanics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CDSMechanicsSVG />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs font-semibold text-indigo-300 mb-2">Protection Buyer (Long Protection / Short Credit)</p>
                    <ul className="space-y-1">
                      {[
                        "Pays quarterly premium = notional x spread / 4",
                        "Receives face value (or loss) on credit event",
                        "Hedges credit risk on bond portfolio",
                        "Can short credit without bond market access",
                        "Premium obligation ceases after credit event",
                      ].map((t, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-indigo-400 mt-0.5">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs font-medium text-amber-300 mb-2">Protection Seller (Short Protection / Long Credit)</p>
                    <ul className="space-y-1">
                      {[
                        "Receives quarterly premium — income stream",
                        "Pays notional minus recovery on credit event",
                        "Earns spread as compensation for credit risk",
                        "Economic equivalent to writing an insurance policy",
                        "Mark-to-market gain when spreads tighten",
                      ].map((t, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-amber-400 mt-0.5">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  ISDA Credit Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CREDIT_EVENTS.map((ev) => (
                    <div key={ev.name} className={cn("rounded-lg p-3 bg-background border", ev.borderColor)}>
                      <p className={cn("text-xs text-muted-foreground font-semibold mb-1", ev.textColor)}>{ev.name}</p>
                      <p className="text-xs text-muted-foreground mb-1">{ev.desc}</p>
                      <p className="text-xs text-muted-foreground italic">e.g. {ev.example}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Settlement Mechanics: Physical vs Cash</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-primary mb-1">Physical Settlement</p>
                      <ul className="space-y-1">
                        {[
                          "Protection buyer delivers defaulted bond to seller",
                          "Receives par (100%) in exchange",
                          "Buyer must source deliverable obligations",
                          "Multiple deliverable bonds creates cheapest-to-deliver option",
                          "Risk of short squeeze in bond market",
                        ].map((t, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-primary">•</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-emerald-300 mb-1">Cash Settlement (Auction)</p>
                      <ul className="space-y-1">
                        {[
                          "ISDA credit event auction determines recovery rate",
                          "Dealers submit bid/offer on defaulted bonds",
                          "Final price set by supply-demand in auction",
                          "Seller pays: Notional x (1 - Recovery Rate)",
                          "Lehman 2008 auction: 8.625 cents = 91.375% payout",
                        ].map((t, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-emerald-400">•</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Post-Big Bang: Standardized Coupons &amp; Upfront Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background rounded-lg p-3 border border-border mb-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    Since April 2009 (ISDA Big Bang protocol), CDS run with{" "}
                    <span className="text-emerald-300 font-medium">standardized running coupons</span>: 100bps for
                    Investment Grade and 500bps for High Yield. The difference between the running coupon and the
                    par-equivalent spread is exchanged as an{" "}
                    <span className="text-amber-300 font-medium">upfront payment</span> at trade inception.
                  </p>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-card rounded p-2 text-center border border-indigo-800/40">
                      <p className="text-xs text-muted-foreground mb-0.5">IG Running Coupon</p>
                      <p className="text-lg font-medium text-indigo-300">100bps</p>
                    </div>
                    <div className="flex-1 bg-card rounded p-2 text-center border border-amber-800/40">
                      <p className="text-xs text-muted-foreground mb-0.5">HY Running Coupon</p>
                      <p className="text-lg font-medium text-amber-300">500bps</p>
                    </div>
                    <div className="flex-1 bg-card rounded p-2 text-center border border-emerald-800/40">
                      <p className="text-xs text-muted-foreground mb-0.5">Benefit</p>
                      <p className="text-sm font-medium text-emerald-300">Clearable</p>
                      <p className="text-xs text-muted-foreground">fungible</p>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border">
                        {["Scenario", "Running Coupon", "Fair Spread", "Upfront", "Direction"].map((h) => (
                          <th key={h} className="text-left py-2 pr-4 text-muted-foreground font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {UPFRONT_DATA.map((row, i) => (
                        <tr key={i} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                          <td className="py-2 pr-4 text-muted-foreground">{row.scenario}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{row.runningCoupon}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{row.fairSpread}</td>
                          <td className={cn(
                            "py-2 pr-4 font-medium",
                            row.upfront.includes("receive") ? "text-emerald-400" : row.upfront === "0%" ? "text-muted-foreground" : "text-red-400"
                          )}>
                            {row.upfront}
                          </td>
                          <td className="py-2 text-muted-foreground">{row.direction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/50" />
                  CDS Term Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CDSCurveSVG />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="bg-background rounded-lg p-3 border border-emerald-800/30">
                    <p className="text-xs font-medium text-emerald-300 mb-1">Normal (Upward Sloping)</p>
                    <p className="text-xs text-muted-foreground">Short-term CDS spreads below long-term — market views near-term credit as stable. Common in IG names. Longer tenors compensate for greater uncertainty.</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-red-800/30">
                    <p className="text-xs font-medium text-red-300 mb-1">Inverted (Distress Signal)</p>
                    <p className="text-xs text-muted-foreground">Short-term spreads exceed long-term — market fears near-term default. Classic pre-default pattern seen in Argentina, FTX, and SVB prior to their respective failures.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Sovereign CDS — ISDA 2014 Definitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SovereignBarChart />
                <div className="mt-4 bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs font-medium text-primary mb-2">Greece 2012 Restructuring — The CAC Trigger</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    In March 2012, Greece restructuring triggered CDS credit events after ISDA ruled that collective action
                    clauses (CACs) constituted a restructuring event. The CDS auction settled at 21.5 cents on the dollar
                    (78.5% payout to protection buyers). This reinforced that sovereign CDS provide genuine default insurance.
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { label: "Recovery Rate", value: "21.5%", color: "text-red-400" },
                      { label: "Protection Payout", value: "78.5%", color: "text-emerald-400" },
                      { label: "Net CDS Notional", value: "~$2.5B", color: "text-primary" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center bg-card rounded p-2 border border-border">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={cn("text-sm font-medium", stat.color)}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">CDS as Pure Credit Signal vs Bonds</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-primary mb-1">Bond Yield Spread Contamination</p>
                      <ul className="space-y-1">
                        {[
                          "Interest rate duration risk embedded",
                          "Liquidity premium varies by issue",
                          "Funding / repo market conditions",
                          "Supply-demand from issuance calendar",
                          "Coupon and maturity-specific effects",
                        ].map((t, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-red-400">x</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-emerald-300 mb-1">CDS Spread Isolates Credit Risk</p>
                      <ul className="space-y-1">
                        {[
                          "Pure credit default probability signal",
                          "No interest rate / duration exposure",
                          "Consistent term structure across entities",
                          "Real-time market-implied default probability",
                          "Leading indicator — often moves before bonds",
                        ].map((t, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-emerald-400">v</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  CDS Mark-to-Market P&amp;L
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background rounded-lg p-3 border border-border mb-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Approximate P&amp;L for a CDS position (protection buyer) when spreads move:{" "}
                    <span className="text-muted-foreground font-medium">DeltaPV approx -Duration x DeltaSpread x Notional</span>
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-muted-foreground">
                      <thead>
                        <tr className="border-b border-border">
                          {["Entry Spread", "Current Spread", "Spread Delta", "DV01 (5Y, $10M)", "Approx P&L"].map((h) => (
                            <th key={h} className="text-left py-2 pr-4 text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { entry: "150bps", current: "250bps", delta: "+100bps", dv01: "$4,750", pnl: "+$47,500", up: true },
                          { entry: "150bps", current: "100bps", delta: "-50bps", dv01: "$4,750", pnl: "-$23,750", up: false },
                          { entry: "300bps", current: "500bps", delta: "+200bps", dv01: "$4,400", pnl: "+$88,000", up: true },
                          { entry: "500bps", current: "800bps", delta: "+300bps", dv01: "$3,800", pnl: "+$114,000", up: true },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                            <td className="py-2 pr-4 text-muted-foreground">{row.entry}</td>
                            <td className="py-2 pr-4 text-muted-foreground">{row.current}</td>
                            <td className={cn("py-2 pr-4 font-medium", row.up ? "text-emerald-400" : "text-red-400")}>{row.delta}</td>
                            <td className="py-2 pr-4 text-muted-foreground">{row.dv01}</td>
                            <td className={cn("py-2 font-medium", row.up ? "text-emerald-400" : "text-red-400")}>{row.pnl}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">DV01 = dollar value of 1bp spread change; declines at higher spreads due to shorter risky duration.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── TAB 2: Credit Indices ── */}
        <TabsContent value="credit-indices" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Major Credit Indices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {CDX_INDICES.map((idx) => (
                    <div
                      key={idx.name}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-border transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs text-muted-foreground border font-mono",
                            idx.spread > 300 ? "border-orange-500/50 text-orange-300" : "border-primary/50 text-primary"
                          )}
                        >
                          {idx.name}
                        </Badge>
                        <div>
                          <p className="text-xs text-muted-foreground">{idx.underlying}</p>
                          <p className="text-xs text-muted-foreground">
                            {idx.names} names · {idx.maturity} · Series {idx.series} · {idx.region}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-medium",
                          idx.spread > 300 ? "text-orange-400" : idx.spread > 150 ? "text-amber-400" : "text-emerald-400"
                        )}>
                          {idx.spread}bps
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  Index Construction &amp; Roll Mechanics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RollMechanicsSVG />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs font-medium text-foreground mb-2">Construction Rules (CDX.NA.IG)</p>
                    <div className="space-y-1">
                      {[
                        ["Constituents", "125 investment-grade North American corporate CDS"],
                        ["Weighting", "Equal weight (0.8% per name)"],
                        ["Eligibility", "Liquid single-name CDS market; IG rated"],
                        ["Selection", "Dealer consortium vote + liquidity screen"],
                        ["Maturity", "Standard: 5Y (also 1Y, 2Y, 3Y, 7Y, 10Y)"],
                        ["Roll Date", "March 20 and September 20 each year"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs text-muted-foreground">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="text-muted-foreground text-right ml-2 max-w-[60%]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs font-medium text-foreground mb-2">On-the-Run vs Off-the-Run</p>
                    <ul className="space-y-1.5">
                      {[
                        "On-the-run = most recent series; tightest bid/ask; highest volume",
                        "Off-the-run = previous series; wider spreads; less liquid",
                        "Roll creates basis: new series typically 2-5bps wide of old",
                        "Dealers roll positions around roll date for continuity",
                        "Series can persist in off-the-run form for years (bespoke hedges)",
                        "CDS indenture survives default: defaulted names removed at next roll",
                      ].map((t, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2 list-none">
                          <span className="text-amber-400 mt-0.5">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-muted-foreground/50" />
                  CDX Options — Payer &amp; Receiver Swaptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs font-medium text-primary mb-2">Payer Swaption (Long Protection Option)</p>
                    <ul className="space-y-1">
                      {[
                        "Right to buy protection (pay premium) at strike spread",
                        "Profits if CDX spreads widen beyond strike",
                        "Analogous to a put option on credit quality",
                        "Used to hedge credit tail risk cheaply vs outright CDS",
                        "Greek: delta to spread, positive convexity",
                        "Typical strikes: 10-30bps OTM on CDX IG",
                      ].map((t, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2 list-none">
                          <span className="text-primary">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-cyan-800/30">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Receiver Swaption (Long No-Defaults Option)</p>
                    <ul className="space-y-1">
                      {[
                        "Right to sell protection (receive premium) at strike spread",
                        "Profits if CDX spreads tighten below strike",
                        "Analogous to a call option on credit quality",
                        "Income strategy: sell when credit volatility elevated",
                        "Knockout feature: option dies on credit event",
                        "Straddles used to trade credit spread volatility",
                      ].map((t, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2 list-none">
                          <span className="text-muted-foreground">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-3 bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Index vs Single-Name Basis &amp; Skew Trading</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    The CDX index spread should theoretically equal the equal-weighted average of its constituent single-name
                    CDS spreads. In practice a <span className="text-amber-300">basis</span> exists due to liquidity,
                    supply/demand and correlation effects.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Index Tighter Than Names", desc: "Liquidity premium: buy index / sell basket", color: "text-emerald-400" },
                      { label: "Index Wider Than Names", desc: "Macro fear bid on index: sell index / buy basket", color: "text-red-400" },
                      { label: "Skew Trade", desc: "Long equity tranche + short index = correlation bet", color: "text-primary" },
                    ].map((item) => (
                      <div key={item.label} className="bg-card rounded p-2 border border-border">
                        <p className={cn("text-xs text-muted-foreground font-medium mb-1", item.color)}>{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-400" />
                  CDX Tranche Trading &amp; Implied Correlation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TrancheStackSVG />
                  <div className="space-y-2">
                    {TRANCHES.map((tr) => (
                      <div key={tr.name} className={cn("rounded-lg p-2.5 bg-background border", tr.borderColor)}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn("text-xs text-muted-foreground font-medium", tr.labelColor)}>
                            {tr.name} ({tr.attachment}–{tr.detachment})
                          </span>
                          <Badge variant="outline" className="text-xs text-muted-foreground border-border">{tr.correlation}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{tr.role}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tr.spread}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs font-medium text-foreground mb-2">Implied Correlation — Correlation Smile</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Like implied volatility in options, each tranche trades at a different{" "}
                    <span className="text-amber-300">implied correlation</span> (the pairwise default correlation that makes
                    the tranche model price equal market price). Equity tranches trade at low implied correlation; senior tranches
                    at high implied correlation — creating a correlation smile. The{" "}
                    <span className="text-primary">compound correlation</span> treats all names as correlated equally;{" "}
                    <span className="text-primary">base correlation</span> (industry standard) decomposes using 0-K structure.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-card rounded p-2 border border-border">
                      <p className="text-xs font-medium text-red-300 mb-1">Equity Tranche Seller</p>
                      <p className="text-xs text-muted-foreground">Short correlation — profits when names default independently (low co-movement). High spread, high risk.</p>
                    </div>
                    <div className="bg-card rounded p-2 border border-border">
                      <p className="text-xs font-medium text-indigo-300 mb-1">Senior Tranche Seller</p>
                      <p className="text-xs text-muted-foreground">Long correlation — profits when all names move together but no catastrophic event. Low spread, tail risk.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── TAB 3: CLN & TRS ── */}
        <TabsContent value="cln-trs" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Credit-Linked Note (CLN) Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CLNStructureSVG />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs font-medium text-primary mb-2">CLN = Bond + Embedded CDS</p>
                    <ul className="space-y-1">
                      {[
                        "Investor buys a note (funded) — provides principal upfront",
                        "Note pays enhanced coupon = LIBOR/SOFR + CDS spread",
                        "On credit event: principal reduced by loss (1 - recovery)",
                        "No credit event: investor redeems at par at maturity",
                        "Issuer effectively transfers credit risk to bond investor",
                        "CLN is tradeable in secondary market like any bond",
                      ].map((t, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2 list-none">
                          <span className="text-primary">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs font-medium text-foreground mb-2">CLN Use Cases</p>
                    <ul className="space-y-1">
                      {[
                        "Balance sheet optimization: bank removes credit from books",
                        "Regulatory capital relief (risk transfer to investors)",
                        "Investor accesses credit not available in bond market",
                        "Yield enhancement for insurance/pension investors",
                        "Synthetic exposure without actual loan/bond holdings",
                        "Multi-name CLN on basket = simplified CDO structure",
                      ].map((t, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2 list-none">
                          <span className="text-emerald-400">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                  Total Return Swap (TRS) on Credit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background rounded-lg p-3 border border-cyan-800/30 mb-4">
                  <p className="text-xs text-muted-foreground mb-3">
                    In a TRS, the <span className="text-muted-foreground font-medium">TR Receiver</span> receives the total economic
                    return of a reference bond (coupons + price appreciation/depreciation) and pays a floating rate
                    (SOFR + spread) to the <span className="text-amber-300 font-medium">TR Payer</span>. The TR Payer holds
                    the bond but transfers all economic exposure — a synthetic, off-balance-sheet long position.
                  </p>
                  <svg viewBox="0 0 480 120" className="w-full h-28">
                    <defs>
                      <marker id="trsMk1" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#06b6d4" />
                      </marker>
                      <marker id="trsMk2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
                      </marker>
                    </defs>
                    <rect x="20" y="40" width="130" height="50" rx="6" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="85" y="62" fill="#fcd34d" fontSize="9" textAnchor="middle" fontWeight="bold">TR PAYER</text>
                    <text x="85" y="75" fill="#fcd34d" fontSize="8" textAnchor="middle">(Owns bond)</text>
                    <text x="85" y="85" fill="#71717a" fontSize="7.5" textAnchor="middle">Bank / Broker-dealer</text>
                    <rect x="330" y="40" width="130" height="50" rx="6" fill="#18181b" stroke="#06b6d4" strokeWidth="1.5" />
                    <text x="395" y="62" fill="#67e8f9" fontSize="9" textAnchor="middle" fontWeight="bold">TR RECEIVER</text>
                    <text x="395" y="75" fill="#67e8f9" fontSize="8" textAnchor="middle">(Synthetic long)</text>
                    <text x="395" y="85" fill="#71717a" fontSize="7.5" textAnchor="middle">Hedge fund / Asset mgr</text>
                    <line x1="150" y1="57" x2="328" y2="57" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#trsMk2)" />
                    <text x="240" y="51" fill="#fcd34d" fontSize="8" textAnchor="middle">Total Return (coupon + P&amp;L)</text>
                    <line x1="328" y1="73" x2="150" y2="73" stroke="#06b6d4" strokeWidth="1.5" markerEnd="url(#trsMk1)" />
                    <text x="240" y="87" fill="#67e8f9" fontSize="8" textAnchor="middle">SOFR + TRS Spread</text>
                    <text x="240" y="16" fill="#a1a1aa" fontSize="9.5" textAnchor="middle" fontWeight="bold">Total Return Swap on Credit Asset</text>
                  </svg>
                </div>
                <div className="overflow-x-auto">
                  <p className="text-xs font-medium text-muted-foreground mb-2">TRS vs Repo — Financing Comparison</p>
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-muted-foreground">Aspect</th>
                        <th className="text-left py-2 pr-4 text-muted-foreground">TRS</th>
                        <th className="text-left py-2 text-amber-400">Repo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TRS_VS_REPO.map((row, i) => (
                        <tr key={i} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                          <td className="py-2 pr-4 text-muted-foreground">{row.aspect}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{row.trs}</td>
                          <td className="py-2 text-muted-foreground">{row.repo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-400" />
                  Basket Credit Derivatives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FTDCorrelationSVG />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="bg-background rounded-lg p-3 border border-amber-800/30">
                    <p className="text-xs font-medium text-amber-300 mb-2">First-to-Default (FTD) Basket</p>
                    <ul className="space-y-1">
                      {[
                        "Pays on the first credit event in a basket of N names",
                        "Spread approx sum of individual CDS spreads (low correlation)",
                        "Low correlation: names default independently = high FTD risk",
                        "High correlation: names move together = lower FTD spread",
                        "Investor earns diversified yield but has concentrated first-loss",
                        "Correlation is the key risk driver — not individual spreads",
                      ].map((t, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2 list-none">
                          <span className="text-amber-400">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs font-medium text-primary mb-2">Nth-to-Default &amp; Digital Default Swap</p>
                    <ul className="space-y-1">
                      {[
                        "2nd-to-default: pays on second credit event in basket",
                        "Nth-to-default: progressively safer; lower spread",
                        "Full basket of NtD = CDO tranche decomposition",
                        "Digital default swap: fixed payout (not par minus recovery)",
                        "Digital useful for hedging specific binary credit event risk",
                        "BTO (Bespoke Tranche Opportunity): custom basket + tranche",
                      ].map((t, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2 list-none">
                          <span className="text-primary">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-3 bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs font-medium text-foreground mb-2">Synthetic CDO — CDS Portfolio Approach</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    A synthetic CDO uses a portfolio of CDS (rather than physical bonds) as the reference portfolio. Tranches
                    are sold to investors who bear sequential credit losses. No funding needed at portfolio level — only the
                    protection seller (tranche investor) funds their tranche.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: "Reference Portfolio", value: "100-150 CDS", color: "text-muted-foreground" },
                      { label: "Total Notional", value: "$1-10B typical", color: "text-muted-foreground" },
                      { label: "Manager Role", value: "Static or managed", color: "text-muted-foreground" },
                      { label: "Key Risk", value: "Correlation + defaults", color: "text-red-400" },
                    ].map((item) => (
                      <div key={item.label} className="bg-card rounded p-2 border border-border text-center">
                        <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                        <p className={cn("text-xs text-muted-foreground font-medium", item.color)}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── TAB 4: Market & Regulation ── */}
        <TabsContent value="market-regulation" className="data-[state=inactive]:hidden space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Global CDS Market Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {MARKET_STATS.map((stat) => (
                    <div key={stat.label} className="bg-background rounded-lg p-3 border border-border text-center">
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className={cn("text-lg font-medium", stat.color)}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs font-medium text-foreground mb-2">Gross vs Net Notional — Why Net Is What Matters</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-300">Gross notional</span> ($10.3T) counts every trade independently — the same
                    reference entity appears in both buying and selling positions.{" "}
                    <span className="text-emerald-300">Net notional</span> ($1.8T) offsets long vs short positions on the same
                    reference entity, representing the true economic exposure. The ~83% reduction demonstrates the massive
                    netting benefit of bilateral offsetting in the CDS market. Regulatory focus rightly targets net notional
                    for systemic risk assessment.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground/50" />
                  Post-Dodd Frank CDS Market Reform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {[
                    {
                      title: "SEF Trading",
                      icon: <Activity className="w-4 h-4" />,
                      borderColor: "border-border",
                      labelColor: "text-primary",
                      desc: "Swap Execution Facility mandate: liquid CDS must be traded on SEF platforms (MarketAxess, Bloomberg SEF). Replaces bilateral phone trading with electronic order books for standardized instruments.",
                    },
                    {
                      title: "Mandatory Clearing",
                      icon: <Shield className="w-4 h-4" />,
                      borderColor: "border-emerald-800/30",
                      labelColor: "text-emerald-400",
                      desc: "Standard CDS indices and single names must be centrally cleared through LCH.Clearnet or ICE Clear Credit. Eliminates bilateral counterparty credit risk; replaces with CCP as counterparty to both sides.",
                    },
                    {
                      title: "Trade Reporting",
                      icon: <BarChart2 className="w-4 h-4" />,
                      borderColor: "border-border",
                      labelColor: "text-primary",
                      desc: "All CDS trades reported to DTCC Trade Information Warehouse (TIW) and swap data repositories (SDR). Creates full audit trail; CFTC/SEC have position-level visibility for systemic risk monitoring.",
                    },
                  ].map((item) => (
                    <div key={item.title} className={cn("bg-background rounded-lg p-3 border", item.borderColor)}>
                      <div className={cn("flex items-center gap-2 mb-2", item.labelColor)}>
                        {item.icon}
                        <p className="text-xs text-muted-foreground font-medium">{item.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs font-medium text-foreground mb-2">ISDA Master Agreement &amp; CSA</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">ISDA Master Agreement</p>
                      <ul className="space-y-1">
                        {[
                          "Industry-standard governing framework for OTC derivatives",
                          "Single agreement netting: all trades netted on default",
                          "Events of default and termination events defined",
                          "Governing law: NY or English law (1992 or 2002 ISDA)",
                          "Credit support annex (CSA) attached for collateral",
                        ].map((t, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2 list-none">
                            <span className="text-primary">•</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Credit Support Annex (CSA)</p>
                      <ul className="space-y-1">
                        {[
                          "Daily variation margin on mark-to-market moves",
                          "Initial margin: SIMM (Sensitivity IM) or schedule-based",
                          "Eligible collateral: cash, govts, IG bonds (with haircuts)",
                          "Threshold and minimum transfer amount negotiated bilaterally",
                          "Two-way vs one-way CSA depending on counterparty rating",
                        ].map((t, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2 list-none">
                            <span className="text-emerald-400">•</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  XVA — Valuation Adjustments on CDS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {XVA_DATA.map((xva) => (
                    <div key={xva.xva} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                      <div className="min-w-[44px]">
                        <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-300 font-mono">{xva.xva}</Badge>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground mb-0.5">{xva.fullName}</p>
                        <p className="text-xs text-muted-foreground">{xva.desc}</p>
                        <p className="text-xs text-amber-400/80 mt-0.5">{xva.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Sovereign CDS Controversy &amp; EU Naked Short Ban
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background rounded-lg p-3 border border-red-800/30 mb-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    During the European sovereign debt crisis (2010-12), politicians argued that{" "}
                    <span className="text-red-300">naked CDS</span> (buying protection without owning the underlying bond)
                    allowed speculators to amplify sovereign funding costs. The EU imposed a{" "}
                    <span className="text-amber-300">ban on naked sovereign CDS</span> (EU Short Selling Regulation, effective
                    Nov 2012), restricting purchases to those with legitimate hedging needs.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-red-300 mb-1">Arguments For the Ban</p>
                      <ul className="space-y-1">
                        {[
                          "Naked CDS creates amplified selling pressure on sovereign bonds",
                          "Speculators profit from government distress without economic stake",
                          "Self-fulfilling crises: CDS widening raises funding costs",
                          "Political economy: taxpayers bear costs, hedge funds earn profits",
                        ].map((t, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2 list-none">
                            <span className="text-red-400">•</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-emerald-300 mb-1">Arguments Against (Market View)</p>
                      <ul className="space-y-1">
                        {[
                          "Naked CDS provides liquidity and enables price discovery",
                          "Restricting shorts increases mispricing and misallocation",
                          "Evidence of CDS causing crises is weak empirically",
                          "Ban reduced liquidity, widened bid-ask spreads significantly",
                        ].map((t, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2 list-none">
                            <span className="text-emerald-400">•</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  CDS as Early Warning System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 mb-4">
                  {DISTRESS_CASES.map((c) => (
                    <div key={c.entity} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                      <div className="min-w-[120px]">
                        <p className="text-xs font-medium text-foreground">{c.entity}</p>
                        <p className="text-xs text-muted-foreground">{c.date}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-red-400 font-medium mb-0.5">{c.cdsWidening}</p>
                        <p className="text-xs text-amber-400/80">{c.leadTime}</p>
                      </div>
                      <Badge variant="outline" className="text-xs border-red-500/50 text-red-300 whitespace-nowrap">
                        {c.outcome}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs font-medium text-foreground mb-2">Basis Trade &amp; Short Squeeze Dynamics</p>
                  <div className="space-y-2">
                    {BASIS_DATA.map((b, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 bg-card rounded border border-border">
                        <div className="min-w-[120px]">
                          <p className="text-xs font-medium text-primary">{b.basis}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">{b.setup}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-400">P&L: </span>{b.pnlSource}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="text-red-400">Risk: </span>{b.risk}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 bg-card rounded-lg p-3 border border-amber-800/30">
                    <p className="text-xs font-medium text-amber-300 mb-1">CDS Short Squeeze Dynamics</p>
                    <p className="text-xs text-muted-foreground">
                      When many investors seek protection simultaneously (e.g., on a rumored default), protection sellers
                      may withdraw, causing spreads to gap dramatically. Unlike equity short squeezes, CDS squeezes are
                      driven by <span className="text-amber-300">demand for protection</span> — not short covering. The
                      non-linear relationship between spread and DV01 (duration shortens as spreads widen) means P&amp;L
                      on short credit positions becomes{" "}
                      <span className="text-emerald-300">super-linear</span> as names approach distressed territory.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Collapsible title="Key CDS Formulas &amp; Relationships" defaultOpen={false}>
              <div className="space-y-3">
                {[
                  { label: "CDS Premium (Quarterly)", formula: "P = Notional x Spread x (90/360)", desc: "Accrual convention: Actual/360 for USD CDS" },
                  { label: "Upfront Payment", formula: "UF approx (FairSpread - RunningCoupon) x RPV01", desc: "RPV01 = Risky PV of 1bp annuity over CDS tenor" },
                  { label: "CDS-Bond Basis", formula: "Basis = CDS Spread - (Bond Yield - Risk-Free)", desc: "Negative basis: CDS < bond spread = buy bond + CDS" },
                  { label: "Implied Default Probability (1Y)", formula: "PD approx Spread / (1 - Recovery Rate)", desc: "e.g. 200bps spread, 40% recovery = ~3.3% annual PD" },
                  { label: "Mark-to-Market (Approx)", formula: "DeltaPV approx -Duration_Risky x DeltaSpread x Notional", desc: "Duration_Risky shortens as spread widens (discounting effect)" },
                  { label: "FTD Spread (Zero Correlation)", formula: "Spread_FTD approx Sum of Spread_i", desc: "Upper bound; actual FTD spread < sum due to positive correlation" },
                ].map((f) => (
                  <div key={f.label} className="bg-background rounded p-3 border border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{f.label}</p>
                    <p className="text-sm font-mono text-indigo-300 mb-1">{f.formula}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
            </Collapsible>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
