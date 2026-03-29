"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Shield,
  TrendingUp,
  PieChart,
  MapPin,
  AlertTriangle,
  Info,
  Calculator,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 980;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
// Pre-generate stable values
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const _sv = () => _vals[_vi++ % _vals.length];
void _sv;

// ── Data: 8 Muni Bonds ─────────────────────────────────────────────────────────
interface MuniBond {
  id: string;
  issuer: string;
  state: string;
  type: "GO" | "Revenue";
  rating: string;
  maturity: string;
  coupon: number;
  yield: number;
  teyAt37: number;
  duration: number;
  spreadToAAA: number;
  isAMT: boolean;
}

const BONDS: MuniBond[] = [
  {
    id: "b1",
    issuer: "NYC General Obligation",
    state: "NY",
    type: "GO",
    rating: "AA",
    maturity: "2035",
    coupon: 4.25,
    yield: 3.82,
    teyAt37: 6.06,
    duration: 7.4,
    spreadToAAA: 48,
    isAMT: false,
  },
  {
    id: "b2",
    issuer: "California Water Authority",
    state: "CA",
    type: "Revenue",
    rating: "AAA",
    maturity: "2040",
    coupon: 3.75,
    yield: 3.41,
    teyAt37: 5.41,
    duration: 10.2,
    spreadToAAA: 12,
    isAMT: false,
  },
  {
    id: "b3",
    issuer: "Texas Transportation Commission",
    state: "TX",
    type: "Revenue",
    rating: "AA+",
    maturity: "2038",
    coupon: 4.0,
    yield: 3.58,
    teyAt37: 5.68,
    duration: 9.1,
    spreadToAAA: 28,
    isAMT: false,
  },
  {
    id: "b4",
    issuer: "Chicago Board of Education",
    state: "IL",
    type: "GO",
    rating: "BBB",
    maturity: "2032",
    coupon: 5.5,
    yield: 5.12,
    teyAt37: 8.13,
    duration: 5.3,
    spreadToAAA: 172,
    isAMT: false,
  },
  {
    id: "b5",
    issuer: "Massachusetts Bay Transit",
    state: "MA",
    type: "Revenue",
    rating: "A",
    maturity: "2036",
    coupon: 4.5,
    yield: 4.08,
    teyAt37: 6.48,
    duration: 8.6,
    spreadToAAA: 78,
    isAMT: false,
  },
  {
    id: "b6",
    issuer: "Denver Airport System",
    state: "CO",
    type: "Revenue",
    rating: "A",
    maturity: "2034",
    coupon: 4.75,
    yield: 4.22,
    teyAt37: 6.70,
    duration: 7.0,
    spreadToAAA: 92,
    isAMT: true,
  },
  {
    id: "b7",
    issuer: "Florida State University",
    state: "FL",
    type: "Revenue",
    rating: "AA",
    maturity: "2037",
    coupon: 4.0,
    yield: 3.72,
    teyAt37: 5.90,
    duration: 8.8,
    spreadToAAA: 42,
    isAMT: false,
  },
  {
    id: "b8",
    issuer: "New Jersey Turnpike Authority",
    state: "NJ",
    type: "Revenue",
    rating: "A+",
    maturity: "2045",
    coupon: 5.0,
    yield: 4.55,
    teyAt37: 7.22,
    duration: 12.8,
    spreadToAAA: 105,
    isAMT: true,
  },
];

// ── Data: Sector Breakdown ────────────────────────────────────────────────────
const SECTORS = [
  { name: "Education", pct: 28, color: "#6366f1" },
  { name: "Healthcare", pct: 22, color: "#22d3ee" },
  { name: "Water/Sewer", pct: 18, color: "#34d399" },
  { name: "Transportation", pct: 15, color: "#f59e0b" },
  { name: "Housing", pct: 10, color: "#f472b6" },
  { name: "Other", pct: 7, color: "#94a3b8" },
];

// ── Data: State Fiscal Health ─────────────────────────────────────────────────
interface StateFiscal {
  state: string;
  abbr: string;
  pensionFunded: number;
  debtPerCapita: number;
  budgetBalance: number;
  outlook: "Stable" | "Positive" | "Negative";
}

const STATE_FISCAL: StateFiscal[] = [
  { state: "California", abbr: "CA", pensionFunded: 73, debtPerCapita: 4821, budgetBalance: 1.2, outlook: "Stable" },
  { state: "New York", abbr: "NY", pensionFunded: 89, debtPerCapita: 6103, budgetBalance: -0.4, outlook: "Stable" },
  { state: "Texas", abbr: "TX", pensionFunded: 77, debtPerCapita: 2154, budgetBalance: 3.8, outlook: "Positive" },
  { state: "Illinois", abbr: "IL", pensionFunded: 44, debtPerCapita: 7689, budgetBalance: -2.1, outlook: "Negative" },
  { state: "Florida", abbr: "FL", pensionFunded: 82, debtPerCapita: 1876, budgetBalance: 2.9, outlook: "Positive" },
  { state: "New Jersey", abbr: "NJ", pensionFunded: 38, debtPerCapita: 8240, budgetBalance: -1.7, outlook: "Negative" },
];

// ── Credit Spread Data by Rating & Duration ───────────────────────────────────
const SPREAD_DATA: { duration: number; AAA: number; AA: number; A: number; BBB: number }[] = [
  { duration: 1, AAA: 5, AA: 20, A: 45, BBB: 110 },
  { duration: 3, AAA: 8, AA: 28, A: 62, BBB: 135 },
  { duration: 5, AAA: 12, AA: 38, A: 78, BBB: 155 },
  { duration: 7, AAA: 16, AA: 48, A: 92, BBB: 172 },
  { duration: 10, AAA: 20, AA: 58, A: 108, BBB: 190 },
  { duration: 15, AAA: 25, AA: 70, A: 125, BBB: 215 },
  { duration: 20, AAA: 30, AA: 82, A: 142, BBB: 240 },
];

// ── Utility ───────────────────────────────────────────────────────────────────
function calcTEY(muniYield: number, bracketPct: number): number {
  return muniYield / (1 - bracketPct / 100);
}

function ratingColor(rating: string): string {
  if (rating.startsWith("AAA")) return "text-emerald-400";
  if (rating.startsWith("AA")) return "text-green-400";
  if (rating === "A+" || rating === "A") return "text-yellow-400";
  if (rating.startsWith("BBB")) return "text-orange-400";
  return "text-red-400";
}

function OutlookBadge({ outlook }: { outlook: StateFiscal["outlook"] }) {
  if (outlook === "Positive")
    return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Positive</Badge>;
  if (outlook === "Negative")
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Negative</Badge>;
  return <Badge className="bg-muted text-muted-foreground border-border">Stable</Badge>;
}

// ── SVG: Donut Chart ──────────────────────────────────────────────────────────
function DonutChart() {
  const cx = 120;
  const cy = 120;
  const R = 80;
  const r = 52;
  let angle = -Math.PI / 2;

  const slices = SECTORS.map((sec) => {
    const sweep = (sec.pct / 100) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle);
    const y1 = cy + R * Math.sin(angle);
    const x2 = cx + R * Math.cos(angle + sweep);
    const y2 = cy + R * Math.sin(angle + sweep);
    const ix1 = cx + r * Math.cos(angle);
    const iy1 = cy + r * Math.sin(angle);
    const ix2 = cx + r * Math.cos(angle + sweep);
    const iy2 = cy + r * Math.sin(angle + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const path = [
      `M ${ix1} ${iy1}`,
      `L ${x1} ${y1}`,
      `A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${r} ${r} 0 ${large} 0 ${ix1} ${iy1}`,
      "Z",
    ].join(" ");
    angle += sweep;
    return { path, color: sec.color };
  });

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[240px] mx-auto">
      {slices.map((sl, i) => (
        <path key={`sl-${i}`} d={sl.path} fill={sl.color} opacity="0.85" stroke="#18181b" strokeWidth="1.5" />
      ))}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#a1a1aa" fontSize="11">Muni</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#a1a1aa" fontSize="11">Sectors</text>
    </svg>
  );
}

// ── SVG: Credit Spread Chart ──────────────────────────────────────────────────
function CreditSpreadChart() {
  const W = 480;
  const H = 200;
  const PAD = { l: 48, r: 32, t: 16, b: 36 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const maxSpread = 260;
  const maxDur = 20;

  const toX = (d: number) => PAD.l + (d / maxDur) * cW;
  const toY = (sp: number) => PAD.t + cH - (sp / maxSpread) * cH;

  const lines: { dataKey: "AAA" | "AA" | "A" | "BBB"; color: string; label: string }[] = [
    { dataKey: "AAA", color: "#34d399", label: "AAA" },
    { dataKey: "AA", color: "#6366f1", label: "AA" },
    { dataKey: "A", color: "#f59e0b", label: "A" },
    { dataKey: "BBB", color: "#f87171", label: "BBB" },
  ];

  const gridYVals = [0, 50, 100, 150, 200, 250];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
      {gridYVals.map((v) => (
        <g key={`gy-${v}`}>
          <line x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
          <text x={PAD.l - 6} y={toY(v) + 4} textAnchor="end" fill="#71717a" fontSize="9">{v}</text>
        </g>
      ))}
      {[0, 5, 10, 15, 20].map((d) => (
        <g key={`gx-${d}`}>
          <line x1={toX(d)} x2={toX(d)} y1={PAD.t} y2={PAD.t + cH} stroke="#27272a" strokeWidth="1" />
          <text x={toX(d)} y={PAD.t + cH + 14} textAnchor="middle" fill="#71717a" fontSize="9">{d}yr</text>
        </g>
      ))}
      {lines.map(({ dataKey, color, label }) => {
        const pts = SPREAD_DATA.map((d) => `${toX(d.duration)},${toY(d[dataKey])}`).join(" ");
        const lastD = SPREAD_DATA[SPREAD_DATA.length - 1];
        return (
          <g key={`line-${dataKey}`}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            {SPREAD_DATA.map((d, i) => (
              <circle key={`dot-${dataKey}-${i}`} cx={toX(d.duration)} cy={toY(d[dataKey])} r="3" fill={color} />
            ))}
            <text x={toX(lastD.duration) + 5} y={toY(lastD[dataKey]) + 4} fill={color} fontSize="9" fontWeight="600">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── SVG: TEY Comparison Bar Chart ─────────────────────────────────────────────
function TEYBarChart({ muniYield, bracket }: { muniYield: number; bracket: number }) {
  const tey = calcTEY(muniYield, bracket);
  const maxV = Math.max(muniYield, tey) * 1.2;
  const W = 360;
  const H = 140;
  const barH = 32;
  const gap = 18;
  const PAD = { l: 120, r: 48, t: 20, b: 20 };
  const cW = W - PAD.l - PAD.r;
  const toW = (v: number) => (v / maxV) * cW;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36">
      <rect x={PAD.l} y={PAD.t} width={toW(muniYield)} height={barH} rx="4" fill="#6366f1" opacity="0.8" />
      <text x={PAD.l - 8} y={PAD.t + barH / 2 + 4} textAnchor="end" fill="#a1a1aa" fontSize="11">Muni Yield</text>
      <text x={PAD.l + toW(muniYield) + 6} y={PAD.t + barH / 2 + 4} fill="#e4e4e7" fontSize="11" fontWeight="600">
        {muniYield.toFixed(2)}%
      </text>
      <rect x={PAD.l} y={PAD.t + barH + gap} width={toW(tey)} height={barH} rx="4" fill="#34d399" opacity="0.8" />
      <text x={PAD.l - 8} y={PAD.t + barH + gap + barH / 2 + 4} textAnchor="end" fill="#a1a1aa" fontSize="11">
        TEY ({bracket}%)
      </text>
      <text x={PAD.l + toW(tey) + 6} y={PAD.t + barH + gap + barH / 2 + 4} fill="#34d399" fontSize="11" fontWeight="700">
        {tey.toFixed(2)}%
      </text>
    </svg>
  );
}

// ── Component: Bond Screener Tab ──────────────────────────────────────────────
type SortableKey = keyof MuniBond;

function ScreenerTab() {
  const [sortKey, setSortKey] = useState<SortableKey>("yield");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = [...BONDS].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
    if (typeof av === "boolean" && typeof bv === "boolean") return sortAsc ? (av ? 1 : -1) : av ? -1 : 1;
    return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  function toggleSort(key: SortableKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  function SortIcon({ col }: { col: SortableKey }) {
    if (sortKey !== col) return <span className="text-muted-foreground ml-1 text-xs">↕</span>;
    return sortAsc
      ? <ChevronUp className="inline w-3 h-3 ml-1 text-indigo-400" />
      : <ChevronDown className="inline w-3 h-3 ml-1 text-indigo-400" />;
  }

  const selected = BONDS.find((b) => b.id === selectedId) ?? null;

  const cols: { key: SortableKey; label: string }[] = [
    { key: "issuer", label: "Issuer" },
    { key: "state", label: "State" },
    { key: "type", label: "Type" },
    { key: "rating", label: "Rating" },
    { key: "maturity", label: "Maturity" },
    { key: "coupon", label: "Coupon" },
    { key: "yield", label: "Yield" },
    { key: "teyAt37", label: "TEY (37%)" },
    { key: "duration", label: "Duration" },
    { key: "spreadToAAA", label: "Spread (bps)" },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              {cols.map(({ key, label }) => (
                <th
                  key={key}
                  className="py-2 px-3 text-left cursor-pointer hover:text-foreground whitespace-nowrap"
                  onClick={() => toggleSort(key)}
                >
                  {label}<SortIcon col={key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((bond) => (
              <tr
                key={bond.id}
                className={cn(
                  "border-b border-border/60 cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedId === bond.id && "bg-muted/80"
                )}
                onClick={() => setSelectedId(selectedId === bond.id ? null : bond.id)}
              >
                <td className="py-2 px-3 font-medium text-foreground">
                  {bond.issuer}
                  {bond.isAMT && (
                    <Badge className="ml-2 text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">AMT</Badge>
                  )}
                </td>
                <td className="py-2 px-3 text-muted-foreground">{bond.state}</td>
                <td className="py-2 px-3">
                  <Badge className={cn("text-xs",
                    bond.type === "GO"
                      ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                      : "bg-cyan-500/20 text-muted-foreground border-cyan-500/30"
                  )}>
                    {bond.type}
                  </Badge>
                </td>
                <td className={cn("py-2 px-3 font-semibold", ratingColor(bond.rating))}>{bond.rating}</td>
                <td className="py-2 px-3 text-muted-foreground">{bond.maturity}</td>
                <td className="py-2 px-3 text-muted-foreground">{bond.coupon.toFixed(2)}%</td>
                <td className="py-2 px-3 text-emerald-400 font-semibold">{bond.yield.toFixed(2)}%</td>
                <td className="py-2 px-3 text-indigo-400 font-semibold">{bond.teyAt37.toFixed(2)}%</td>
                <td className="py-2 px-3 text-muted-foreground">{bond.duration.toFixed(1)}</td>
                <td className="py-2 px-3 text-muted-foreground">{bond.spreadToAAA}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-lg bg-muted/50 border border-border"
        >
          <div>
            <p className="text-xs text-muted-foreground mb-1">Tax-Equiv Yield (37%)</p>
            <p className="text-xl font-bold text-indigo-400">{selected.teyAt37.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <p className="text-xl font-bold text-foreground">{selected.duration.toFixed(1)} yrs</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Spread to AAA</p>
            <p className="text-xl font-medium text-amber-400">{selected.spreadToAAA} bps</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">AMT Status</p>
            <p className="text-sm font-medium mt-1">
              {selected.isAMT
                ? <span className="text-amber-400">Subject to AMT</span>
                : <span className="text-emerald-400">AMT-Free</span>
              }
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Info className="w-4 h-4" /> GO vs Revenue Bonds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="text-indigo-400 font-medium">General Obligation (GO)</span> bonds are
              backed by the full taxing power of the issuer. Generally lower risk and lower yield.
            </p>
            <p>
              <span className="text-muted-foreground font-medium">Revenue bonds</span> are backed solely by
              cash flows from a specific project — tolls, utility fees, tuition. Higher yield, but
              dependent on project performance.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calculator className="w-4 h-4" /> TEY Formula
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Tax-Equivalent Yield tells high-bracket investors what taxable yield they need to match a tax-free muni:</p>
            <div className="bg-muted rounded p-2 font-mono text-xs text-emerald-400">
              TEY = Muni Yield / (1 - Tax Bracket)
            </div>
            <p className="text-xs">
              Example: 3.82% muni at 37% bracket: TEY = 3.82 / 0.63 = <span className="text-indigo-400 font-medium">6.06%</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Component: TEY Calculator Tab ─────────────────────────────────────────────
const BRACKETS = [10, 12, 22, 24, 32, 35, 37];

function CalculatorTab() {
  const [muniYield, setMuniYield] = useState(3.5);
  const [targetBracket, setTargetBracket] = useState(37);
  const tey = calcTEY(muniYield, targetBracket);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" /> TEY Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                Muni Bond Yield: <span className="text-emerald-400 font-medium">{muniYield.toFixed(2)}%</span>
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.1"
                value={muniYield}
                onChange={(e) => setMuniYield(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1%</span><span>8%</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-2">Federal Tax Bracket</label>
              <div className="flex flex-wrap gap-2">
                {BRACKETS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setTargetBracket(b)}
                    className={cn(
                      "px-3 py-1 rounded text-sm font-medium border transition-colors",
                      targetBracket === b
                        ? "bg-indigo-600 border-indigo-500 text-foreground"
                        : "bg-muted border-border text-muted-foreground hover:border-muted-foreground"
                    )}
                  >
                    {b}%
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-muted/60 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Muni yield</span>
                <span className="text-emerald-400 font-medium">{muniYield.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax bracket</span>
                <span className="text-muted-foreground">{targetBracket}%</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-muted-foreground font-medium">Tax-Equiv Yield</span>
                <span className="text-indigo-400 font-medium text-lg">{tey.toFixed(2)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Visual Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <TEYBarChart muniYield={muniYield} bracket={targetBracket} />
            <p className="text-xs text-muted-foreground mt-3">
              At the <span className="text-indigo-400">{targetBracket}%</span> bracket, a muni yielding{" "}
              <span className="text-emerald-400">{muniYield.toFixed(2)}%</span> is equivalent to a{" "}
              <span className="text-indigo-400 font-medium">{tey.toFixed(2)}%</span> taxable bond.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">
            TEY Across All Brackets — {muniYield.toFixed(2)}% muni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 px-3 text-left">Tax Bracket</th>
                  <th className="py-2 px-3 text-left">Keep Rate</th>
                  <th className="py-2 px-3 text-left">Tax-Equiv Yield</th>
                  <th className="py-2 px-3 text-left">vs 22% Bracket</th>
                </tr>
              </thead>
              <tbody>
                {BRACKETS.map((b) => {
                  const t = calcTEY(muniYield, b);
                  const base = calcTEY(muniYield, 22);
                  const diff = t - base;
                  return (
                    <tr key={b} className={cn("border-b border-border/60", b === targetBracket && "bg-indigo-500/10")}>
                      <td className="py-2 px-3 text-muted-foreground font-medium">{b}%</td>
                      <td className="py-2 px-3 text-muted-foreground">{(100 - b)}%</td>
                      <td className="py-2 px-3 text-indigo-400 font-medium">{t.toFixed(2)}%</td>
                      <td className={cn("py-2 px-3 font-medium",
                        diff > 0.001 ? "text-emerald-400" : diff < -0.001 ? "text-red-400" : "text-muted-foreground"
                      )}>
                        {Math.abs(diff) < 0.001 ? "—" : (diff > 0 ? "+" : "") + diff.toFixed(2) + "%"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Component: Credit Analysis Tab ───────────────────────────────────────────
function AnalysisTab() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Credit Spread by Rating and Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreditSpreadChart />
          <p className="text-xs text-muted-foreground mt-2">
            Spread in basis points over AAA benchmark. Lower-rated issuers pay significantly more at
            longer durations due to increased credit and liquidity risk.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <PieChart className="w-4 h-4 text-muted-foreground" /> Sector Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <DonutChart />
              </div>
              <div className="space-y-2 flex-1">
                {SECTORS.map((sec, i) => (
                  <div key={`sec-${i}`} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: sec.color }} />
                      <span className="text-muted-foreground">{sec.name}</span>
                    </div>
                    <span className="text-muted-foreground font-medium">{sec.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Rating Tier Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { rating: "AAA", spread: "5–30 bps", color: "text-emerald-400", note: "Benchmark tier — state GOs, major water utilities, top revenue bonds" },
                { rating: "AA", spread: "20–82 bps", color: "text-green-400", note: "Large city GOs, well-funded state agencies, top-tier transit systems" },
                { rating: "A", spread: "45–142 bps", color: "text-yellow-400", note: "Smaller cities, regional hospitals, airports with stable traffic" },
                { rating: "BBB", spread: "110–240 bps", color: "text-orange-400", note: "Weakest investment grade — distressed municipalities, project risk" },
              ].map((r, i) => (
                <div key={`rs-${i}`} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex justify-between mb-1">
                    <span className={cn("font-medium", r.color)}>{r.rating}</span>
                    <span className="text-muted-foreground text-sm">{r.spread}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Component: State Fiscal Health Tab ────────────────────────────────────────
function StateFiscalTab() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" /> State Fiscal Health Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 px-3 text-left">State</th>
                  <th className="py-2 px-3 text-left">Pension Funded</th>
                  <th className="py-2 px-3 text-left">Debt / Capita</th>
                  <th className="py-2 px-3 text-left">Budget Balance</th>
                  <th className="py-2 px-3 text-left">Outlook</th>
                </tr>
              </thead>
              <tbody>
                {STATE_FISCAL.map((st, i) => (
                  <tr key={`sf-${i}`} className="border-b border-border/60">
                    <td className="py-3 px-3">
                      <div className="font-medium text-foreground">{st.state}</div>
                      <div className="text-xs text-muted-foreground">{st.abbr}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[60px]">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${st.pensionFunded}%`,
                              backgroundColor: st.pensionFunded >= 80 ? "#34d399" : st.pensionFunded >= 60 ? "#f59e0b" : "#f87171",
                            }}
                          />
                        </div>
                        <span className={cn("text-sm font-medium w-10 text-right",
                          st.pensionFunded >= 80 ? "text-emerald-400" : st.pensionFunded >= 60 ? "text-amber-400" : "text-red-400"
                        )}>
                          {st.pensionFunded}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">${st.debtPerCapita.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={cn("font-medium", st.budgetBalance >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {st.budgetBalance >= 0 ? "+" : ""}{st.budgetBalance.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3"><OutlookBadge outlook={st.outlook} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { state: "Texas", color: "text-emerald-400", note: "Strongest fiscal position: no state income tax, robust surplus, fast-growing tax base." },
          { state: "California", color: "text-amber-400", note: "Large economy provides cushion but pension liabilities and recent deficits require monitoring." },
          { state: "New Jersey", color: "text-red-400", note: "Worst pension funded ratio (38%) and highest per-capita debt — watch credit spreads carefully." },
        ].map((item, i) => (
          <Card key={`outlook-${i}`} className="bg-card border-border">
            <CardContent className="pt-4">
              <div className={cn("text-xl font-medium mb-1", item.color)}>{item.state}</div>
              <p className="text-xs text-muted-foreground">{item.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Info className="w-4 h-4" /> Key Fiscal Metrics Explained
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-muted-foreground mb-1">Pension Funded Ratio</p>
            <p>Assets vs. obligations. Below 60% signals structural stress — the state must divert general revenues to cover shortfalls.</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground mb-1">Debt Per Capita</p>
            <p>Total outstanding GO and moral-obligation debt divided by population. Higher values mean each resident bears more burden.</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground mb-1">Budget Balance</p>
            <p>Surplus or deficit as % of revenues. Persistent deficits pressure ratings; surpluses indicate fiscal flexibility.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Component: AMT Risk Tab ───────────────────────────────────────────────────
function AMTTab() {
  const amtBonds = BONDS.filter((b) => b.isAMT);
  const nonAmtBonds = BONDS.filter((b) => !b.isAMT);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Alternative Minimum Tax (AMT) Risk
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Most municipal bonds are exempt from federal income tax. However,{" "}
            <span className="text-amber-400 font-medium">Private Activity Bonds (PABs)</span> — issued
            for airports, private university projects, and housing programs — may trigger AMT liability
            for certain investors.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Regular Munis — AMT-Free</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>General obligation bonds (cities, counties, states)</li>
                <li>Essential service revenue bonds (water, sewer)</li>
                <li>Public university and school district bonds</li>
                <li>Interest excluded from AMT calculation</li>
                <li>Safe for all investors including AMT-liable</li>
              </ul>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Private Activity Bonds — AMT Risk</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>Airport revenue bonds (Denver, LAX, ORD)</li>
                <li>Private toll road and turnpike revenue bonds</li>
                <li>Stadium and convention center bonds</li>
                <li>Certain student loan and housing bonds</li>
                <li>Interest is an AMT preference item</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">AMT Bonds in This Screener</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {amtBonds.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div>
                  <p className="text-sm font-medium text-foreground">{b.issuer}</p>
                  <p className="text-xs text-muted-foreground">{b.state} · {b.type} · {b.rating}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-400">{b.yield.toFixed(2)}% yield</p>
                  <p className="text-xs text-muted-foreground">TEY {b.teyAt37.toFixed(2)}% (37%)</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              AMT bonds typically offer a yield premium of 15–40 bps over comparable AMT-free munis as compensation for the tax risk.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Who Should Avoid AMT Bonds?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { who: "High-income individuals", why: "Most likely AMT-liable. The yield premium is wiped out if AMT applies at 26–28%.", avoid: true },
              { who: "C-Corporations", why: "Corporate AMT applies at 15%. Interest on PABs is a preference item raising AMTI.", avoid: true },
              { who: "IRA / 401(k) accounts", why: "Tax exemption is irrelevant inside tax-deferred accounts — AMT is a non-issue, but so is the muni benefit.", avoid: false },
              { who: "Lower-bracket investors", why: "Not subject to AMT. The yield premium on PABs is pure upside — potentially very attractive.", avoid: false },
            ].map((item, i) => (
              <div
                key={`amt-who-${i}`}
                className={cn("p-3 rounded-lg border",
                  item.avoid ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded",
                    item.avoid ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                  )}>
                    {item.avoid ? "AVOID" : "OK"}
                  </span>
                  <span className="text-sm font-medium text-foreground">{item.who}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.why}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">AMT-Free Bonds for Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nonAmtBonds.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <div>
                  <p className="text-sm font-medium text-foreground">{b.issuer}</p>
                  <p className="text-xs text-muted-foreground">{b.state} · {b.rating}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-400">{b.yield.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">TEY {b.teyAt37.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page Root ─────────────────────────────────────────────────────────────────
export default function MuniBondsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-foreground">Municipal Bonds</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Tax-advantaged debt issued by states, cities, and public agencies. Interest is typically
            exempt from federal — and often state — income tax, making munis particularly attractive
            for high-bracket investors.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">Tax-Free</Badge>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Investment Grade</Badge>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Avg Muni Yield", value: "3.94%", sub: "across 8 bonds", icon: TrendingUp, color: "text-emerald-400" },
          { label: "Avg TEY (37%)", value: "6.45%", sub: "vs equivalent taxable", icon: Calculator, color: "text-indigo-400" },
          { label: "Avg Duration", value: "8.8 yrs", sub: "interest rate sensitivity", icon: Shield, color: "text-muted-foreground" },
          { label: "AMT Bonds", value: "2 / 8", sub: "private activity bonds", icon: AlertTriangle, color: "text-amber-400" },
        ].map((stat, i) => (
          <Card key={`stat-${i}`} className="bg-card border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className={cn("text-xl font-medium", stat.color)}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="screener">
        <TabsList className="bg-muted/60 border border-border flex-wrap h-auto">
          <TabsTrigger value="screener">Bond Screener</TabsTrigger>
          <TabsTrigger value="calculator">TEY Calculator</TabsTrigger>
          <TabsTrigger value="analysis">Credit Analysis</TabsTrigger>
          <TabsTrigger value="fiscal">State Fiscal Health</TabsTrigger>
          <TabsTrigger value="amt">AMT Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="screener" className="data-[state=inactive]:hidden mt-4">
          <ScreenerTab />
        </TabsContent>
        <TabsContent value="calculator" className="data-[state=inactive]:hidden mt-4">
          <CalculatorTab />
        </TabsContent>
        <TabsContent value="analysis" className="data-[state=inactive]:hidden mt-4">
          <AnalysisTab />
        </TabsContent>
        <TabsContent value="fiscal" className="data-[state=inactive]:hidden mt-4">
          <StateFiscalTab />
        </TabsContent>
        <TabsContent value="amt" className="data-[state=inactive]:hidden mt-4">
          <AMTTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
