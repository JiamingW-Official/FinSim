"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  DollarSign,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Target,
  Layers,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 812;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ──────────────────────────────────────────────────────────────────────

type MacroRegime = "Goldilocks" | "Stagflation" | "Deflation" | "Reflation";
type GuidanceLabel = "hawkish" | "dovish" | "neutral";

interface RegimePoint {
  name: string;
  growth: number; // -3 to +3
  inflation: number; // -3 to +3
  regime: MacroRegime;
  size: number;
}

interface CentralBankRow {
  name: string;
  abbr: string;
  flag: string;
  currentRate: number;
  lastChange: number;
  lastChangeDir: "up" | "down" | "none";
  nextMeeting: string;
  guidance: GuidanceLabel;
  rateHistory: number[];
}

interface CorrelationAsset {
  label: string;
  short: string;
}

interface PositioningAsset {
  name: string;
  short: string;
  netLong: number; // -100 to +100
  speculativeNet: number;
  commercialNet: number;
  sentiment: number; // 0-100 bullish %
}

// ── Data Generation ────────────────────────────────────────────────────────────

// Regime scatter points
const REGIME_POINTS: RegimePoint[] = [
  { name: "US", growth: 0.8 + rand() * 0.6, inflation: 0.4 + rand() * 0.5, regime: "Goldilocks", size: 18 },
  { name: "EU", growth: -0.3 - rand() * 0.4, inflation: 0.2 + rand() * 0.4, regime: "Deflation", size: 14 },
  { name: "UK", growth: 0.1 + rand() * 0.3, inflation: 0.6 + rand() * 0.6, regime: "Reflation", size: 12 },
  { name: "JP", growth: -0.2 - rand() * 0.3, inflation: -0.1 - rand() * 0.3, regime: "Deflation", size: 12 },
  { name: "CN", growth: 1.0 + rand() * 0.8, inflation: -0.2 - rand() * 0.4, regime: "Goldilocks", size: 16 },
  { name: "IN", growth: 1.5 + rand() * 0.5, inflation: 0.8 + rand() * 0.5, regime: "Reflation", size: 13 },
  { name: "BR", growth: -0.5 - rand() * 0.5, inflation: 1.2 + rand() * 0.8, regime: "Stagflation", size: 10 },
  { name: "AU", growth: 0.3 + rand() * 0.4, inflation: 0.5 + rand() * 0.4, regime: "Goldilocks", size: 10 },
];

const REGIME_COLORS: Record<MacroRegime, string> = {
  Goldilocks: "#22c55e",
  Stagflation: "#ef4444",
  Deflation: "#60a5fa",
  Reflation: "#f59e0b",
};

// Central banks
const CENTRAL_BANKS: CentralBankRow[] = (() => {
  const r1 = rand(), r2 = rand(), r3 = rand(), r4 = rand(), r5 = rand();
  const mkHist = () => Array.from({ length: 12 }, () => +(rand() * 5 + 0.5).toFixed(2));
  return [
    {
      name: "Federal Reserve",
      abbr: "Fed",
      flag: "🇺🇸",
      currentRate: 5.25,
      lastChange: -0.25,
      lastChangeDir: "down",
      nextMeeting: "May 7, 2026",
      guidance: r1 > 0.5 ? "neutral" : "dovish",
      rateHistory: [5.25, 5.5, 5.5, 5.5, 5.25, 5.0, 4.75, 4.5, 4.25, 4.0, 3.75, 3.5],
    },
    {
      name: "European Central Bank",
      abbr: "ECB",
      flag: "🇪🇺",
      currentRate: 3.15,
      lastChange: -0.25,
      lastChangeDir: "down",
      nextMeeting: "Jun 5, 2026",
      guidance: r2 > 0.4 ? "dovish" : "neutral",
      rateHistory: [3.15, 3.4, 3.65, 3.9, 4.0, 4.0, 3.75, 3.5, 3.25, 3.0, 2.75, 2.5],
    },
    {
      name: "Bank of Japan",
      abbr: "BOJ",
      flag: "🇯🇵",
      currentRate: 0.5,
      lastChange: 0.25,
      lastChangeDir: "up",
      nextMeeting: "Apr 30, 2026",
      guidance: r3 > 0.5 ? "hawkish" : "neutral",
      rateHistory: [0.5, 0.25, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0, 0.0, -0.1],
    },
    {
      name: "Bank of England",
      abbr: "BOE",
      flag: "🇬🇧",
      currentRate: 4.5,
      lastChange: -0.25,
      lastChangeDir: "down",
      nextMeeting: "May 8, 2026",
      guidance: r4 > 0.5 ? "neutral" : "dovish",
      rateHistory: [4.5, 4.75, 5.0, 5.25, 5.25, 5.0, 4.75, 4.5, 4.25, 4.0, 3.75, 3.5],
    },
    {
      name: "People's Bank of China",
      abbr: "PBOC",
      flag: "🇨🇳",
      currentRate: 3.1,
      lastChange: -0.1,
      lastChangeDir: "down",
      nextMeeting: "May 20, 2026",
      guidance: r5 > 0.3 ? "dovish" : "neutral",
      rateHistory: [3.1, 3.2, 3.3, 3.45, 3.45, 3.45, 3.55, 3.65, 3.65, 3.75, 3.85, 4.0],
    },
  ];
})();

// Correlation matrix (6x6)
const CORR_ASSETS: CorrelationAsset[] = [
  { label: "S&P 500", short: "SPX" },
  { label: "20yr Treasury", short: "TLT" },
  { label: "Gold", short: "GLD" },
  { label: "US Dollar", short: "USD" },
  { label: "Crude Oil", short: "OIL" },
  { label: "Bitcoin", short: "BTC" },
];

// Pre-computed seeded correlation matrix (symmetric, diagonal=1)
const buildCorrMatrix = (): number[][] => {
  const raw: number[][] = Array.from({ length: 6 }, () => Array(6).fill(0));
  for (let i = 0; i < 6; i++) {
    raw[i][i] = 1.0;
    for (let j = i + 1; j < 6; j++) {
      const v = +(rand() * 1.8 - 0.9).toFixed(2);
      raw[i][j] = v;
      raw[j][i] = v;
    }
  }
  return raw;
};
const CORR_MATRIX = buildCorrMatrix();

// COT-style positioning
const POSITIONING: PositioningAsset[] = (() => {
  const assets = [
    { name: "S&P 500 Futures", short: "SPX" },
    { name: "10yr Treasury", short: "TNX" },
    { name: "Gold Futures", short: "GLD" },
    { name: "EUR/USD", short: "EUR" },
    { name: "Crude Oil", short: "OIL" },
    { name: "Bitcoin", short: "BTC" },
    { name: "Yen Futures", short: "JPY" },
    { name: "Copper", short: "CPR" },
  ];
  return assets.map((a) => {
    const net = +(rand() * 200 - 100).toFixed(1);
    const spec = +(net + rand() * 40 - 20).toFixed(1);
    const comm = +(-spec * 0.6 + rand() * 20 - 10).toFixed(1);
    const sent = +(rand() * 100).toFixed(0);
    return {
      ...a,
      netLong: Math.max(-100, Math.min(100, net)),
      speculativeNet: Math.max(-150, Math.min(150, spec)),
      commercialNet: Math.max(-150, Math.min(150, comm)),
      sentiment: Math.max(0, Math.min(100, +sent)),
    };
  });
})();

// ── Helper: determine current regime from US point ─────────────────────────────
function getCurrentRegime(): { regime: MacroRegime; color: string; desc: string } {
  const us = REGIME_POINTS[0];
  if (us.growth > 0 && us.inflation > 0 && us.inflation < 1.0) {
    return { regime: "Goldilocks", color: "#22c55e", desc: "Strong growth, contained inflation — risk assets favored" };
  }
  if (us.growth > 0 && us.inflation >= 1.0) {
    return { regime: "Reflation", color: "#f59e0b", desc: "Growth accelerating with rising price pressures — commodities outperform" };
  }
  if (us.growth <= 0 && us.inflation > 0.5) {
    return { regime: "Stagflation", color: "#ef4444", desc: "Weak growth + high inflation — most challenging environment" };
  }
  return { regime: "Deflation", color: "#60a5fa", desc: "Low growth and falling prices — bonds rally, cash preferred" };
}

// ── Helper: correlation color ──────────────────────────────────────────────────
function corrColor(v: number): string {
  if (v === 1) return "#1d4ed8";
  if (v > 0.6) return "#2563eb";
  if (v > 0.3) return "#3b82f6";
  if (v > 0) return "#93c5fd";
  if (v > -0.3) return "#fca5a5";
  if (v > -0.6) return "#ef4444";
  return "#b91c1c";
}

function corrTextColor(v: number): string {
  return Math.abs(v) > 0.3 ? "#fff" : "#d1d5db";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function RegimeGauge({ regime, color }: { regime: MacroRegime; color: string }) {
  // Map regime to angle: Goldilocks=45°, Reflation=135°, Stagflation=225°, Deflation=315°
  const angleMap: Record<MacroRegime, number> = {
    Goldilocks: 45,
    Reflation: 135,
    Stagflation: 225,
    Deflation: 315,
  };
  const deg = angleMap[regime];
  const rad = ((deg - 90) * Math.PI) / 180;
  const cx = 80, cy = 80, r = 55;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);

  return (
    <svg viewBox="0 0 160 160" className="w-40 h-40 mx-auto">
      {/* Quadrant arcs */}
      {[
        { label: "Goldilocks", start: -90, end: 0, col: "#166534" },
        { label: "Reflation", start: 0, end: 90, col: "#78350f" },
        { label: "Stagflation", start: 90, end: 180, col: "#7f1d1d" },
        { label: "Deflation", start: 180, end: 270, col: "#1e3a5f" },
      ].map(({ start, end, col }, i) => {
        const s1 = ((start - 90) * Math.PI) / 180;
        const e1 = ((end - 90) * Math.PI) / 180;
        const x1 = cx + r * Math.cos(s1);
        const y1 = cy + r * Math.sin(s1);
        const x2 = cx + r * Math.cos(e1);
        const y2 = cy + r * Math.sin(e1);
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
            fill={col}
            opacity={0.7}
          />
        );
      })}
      {/* Crosshairs */}
      <line x1={cx} y1={cy - r - 8} x2={cx} y2={cy + r + 8} stroke="#374151" strokeWidth={1} />
      <line x1={cx - r - 8} y1={cy} x2={cx + r + 8} y2={cy} stroke="#374151" strokeWidth={1} />
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#374151" strokeWidth={1.5} />
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      {/* Quadrant labels */}
      <text x={cx + 22} y={cy - 22} fontSize={7} fill="#86efac" textAnchor="middle">Gold.</text>
      <text x={cx + 22} y={cy + 28} fontSize={7} fill="#fde68a" textAnchor="middle">Refl.</text>
      <text x={cx - 22} y={cy + 28} fontSize={7} fill="#fca5a5" textAnchor="middle">Stag.</text>
      <text x={cx - 22} y={cy - 22} fontSize={7} fill="#bfdbfe" textAnchor="middle">Defl.</text>
    </svg>
  );
}

function RateSparkline({ data }: { data: number[] }) {
  const w = 80, h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.01;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-7">
      <polyline points={pts.join(" ")} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
      <circle
        cx={+pts[pts.length - 1].split(",")[0]}
        cy={+pts[pts.length - 1].split(",")[1]}
        r={2}
        fill="#60a5fa"
      />
    </svg>
  );
}

function ScatterChart() {
  const w = 360, h = 280;
  const pad = 40;
  const cw = w - pad * 2;
  const ch = h - pad * 2;
  // domain: growth -3 to +3, inflation -3 to +3
  const toX = (g: number) => pad + ((g + 3) / 6) * cw;
  const toY = (inf: number) => pad + ch - ((inf + 3) / 6) * ch;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {/* Quadrant backgrounds */}
      <rect x={pad + cw / 2} y={pad} width={cw / 2} height={ch / 2} fill="#166534" opacity={0.15} rx={2} />
      <rect x={pad + cw / 2} y={pad + ch / 2} width={cw / 2} height={ch / 2} fill="#78350f" opacity={0.15} rx={2} />
      <rect x={pad} y={pad + ch / 2} width={cw / 2} height={ch / 2} fill="#7f1d1d" opacity={0.15} rx={2} />
      <rect x={pad} y={pad} width={cw / 2} height={ch / 2} fill="#1e3a5f" opacity={0.15} rx={2} />

      {/* Axes */}
      <line x1={pad} y1={pad + ch / 2} x2={pad + cw} y2={pad + ch / 2} stroke="#4b5563" strokeWidth={1} strokeDasharray="4,4" />
      <line x1={pad + cw / 2} y1={pad} x2={pad + cw / 2} y2={pad + ch} stroke="#4b5563" strokeWidth={1} strokeDasharray="4,4" />

      {/* Axis labels */}
      <text x={pad + cw / 2} y={h - 6} textAnchor="middle" fill="#9ca3af" fontSize={9}>Growth →</text>
      <text x={10} y={pad + ch / 2} textAnchor="middle" fill="#9ca3af" fontSize={9} transform={`rotate(-90, 10, ${pad + ch / 2})`}>Inflation →</text>

      {/* Quadrant labels */}
      <text x={pad + cw * 0.75} y={pad + ch * 0.22} textAnchor="middle" fill="#86efac" fontSize={9} opacity={0.8}>Goldilocks</text>
      <text x={pad + cw * 0.75} y={pad + ch * 0.78} textAnchor="middle" fill="#fde68a" fontSize={9} opacity={0.8}>Reflation</text>
      <text x={pad + cw * 0.25} y={pad + ch * 0.78} textAnchor="middle" fill="#fca5a5" fontSize={9} opacity={0.8}>Stagflation</text>
      <text x={pad + cw * 0.25} y={pad + ch * 0.22} textAnchor="middle" fill="#bfdbfe" fontSize={9} opacity={0.8}>Deflation</text>

      {/* Data points */}
      {REGIME_POINTS.map((pt, i) => {
        const cx = toX(pt.growth);
        const cy = toY(pt.inflation);
        const col = REGIME_COLORS[pt.regime];
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={pt.size / 2} fill={col} opacity={0.75} />
            <text x={cx} y={cy - pt.size / 2 - 3} textAnchor="middle" fill="#f9fafb" fontSize={8} fontWeight="bold">{pt.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

function GuidanceBadge({ g }: { g: GuidanceLabel }) {
  const map: Record<GuidanceLabel, { label: string; cls: string }> = {
    hawkish: { label: "Hawkish", cls: "bg-red-900/60 text-red-300 border-red-700" },
    dovish: { label: "Dovish", cls: "bg-green-900/60 text-green-300 border-green-700" },
    neutral: { label: "Neutral", cls: "bg-muted text-muted-foreground border-border" },
  };
  const { label, cls } = map[g];
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs border font-medium", cls)}>{label}</span>
  );
}

function CorrelationMatrix() {
  const cellSize = 52;
  const labelW = 44;
  const n = 6;
  const w = labelW + n * cellSize + 2;
  const h = labelW + n * cellSize + 2;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 380 }}>
      {/* Column headers */}
      {CORR_ASSETS.map((a, j) => (
        <text
          key={j}
          x={labelW + j * cellSize + cellSize / 2}
          y={labelW - 6}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize={10}
          fontWeight="bold"
        >
          {a.short}
        </text>
      ))}
      {/* Row headers */}
      {CORR_ASSETS.map((a, i) => (
        <text
          key={i}
          x={labelW - 4}
          y={labelW + i * cellSize + cellSize / 2 + 4}
          textAnchor="end"
          fill="#9ca3af"
          fontSize={10}
          fontWeight="bold"
        >
          {a.short}
        </text>
      ))}
      {/* Cells */}
      {CORR_MATRIX.map((row, i) =>
        row.map((v, j) => {
          const x = labelW + j * cellSize;
          const y = labelW + i * cellSize;
          const bg = corrColor(v);
          const fg = corrTextColor(v);
          return (
            <g key={`${i}-${j}`}>
              <rect x={x + 1} y={y + 1} width={cellSize - 2} height={cellSize - 2} fill={bg} rx={3} />
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2 + 4}
                textAnchor="middle"
                fill={fg}
                fontSize={11}
                fontWeight={v === 1 ? "bold" : "normal"}
              >
                {v.toFixed(2)}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}

function PositioningBar({ value, max = 150 }: { value: number; max?: number }) {
  const w = 120, h = 14;
  const mid = w / 2;
  const pct = Math.abs(value) / max;
  const barW = Math.min(pct * mid, mid);
  const isPos = value >= 0;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-28 h-3.5">
      <rect x={0} y={4} width={w} height={6} fill="#1f2937" rx={3} />
      <line x1={mid} y1={0} x2={mid} y2={h} stroke="#374151" strokeWidth={1} />
      {isPos ? (
        <rect x={mid} y={4} width={barW} height={6} fill="#22c55e" rx={2} />
      ) : (
        <rect x={mid - barW} y={4} width={barW} height={6} fill="#ef4444" rx={2} />
      )}
    </svg>
  );
}

function SentimentDot({ value }: { value: number }) {
  const color = value >= 60 ? "#22c55e" : value <= 40 ? "#ef4444" : "#f59e0b";
  return (
    <span className="inline-flex items-center gap-1 text-xs font-mono" style={{ color }}>
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: color }}
      />
      {value}%
    </span>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────────

function MacroRegimeTab() {
  const current = useMemo(() => getCurrentRegime(), []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">Global Growth/Inflation Matrix</span>
        </div>
        <Badge
          className="ml-auto text-xs font-bold px-3 py-1"
          style={{ background: current.color + "33", color: current.color, borderColor: current.color + "66" }}
        >
          {current.regime}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Scatter chart */}
        <Card className="lg:col-span-2 bg-card/60 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Country Positioning (Growth vs Inflation)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ScatterChart />
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2">
              {(Object.entries(REGIME_COLORS) as [MacroRegime, string][]).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: v }} />
                  {k}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regime gauge + info */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Regime Indicator</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <RegimeGauge regime={current.regime} color={current.color} />
            <div
              className="w-full rounded-lg p-3 text-center"
              style={{ background: current.color + "18", borderColor: current.color + "44", border: "1px solid" }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: current.color }}>
                {current.regime}
              </p>
              <p className="text-xs text-muted-foreground leading-snug">{current.desc}</p>
            </div>

            {/* Regime scores */}
            <div className="w-full space-y-2">
              {(["Goldilocks", "Stagflation", "Deflation", "Reflation"] as MacroRegime[]).map((r) => {
                const count = REGIME_POINTS.filter((p) => p.regime === r).length;
                const pct = (count / REGIME_POINTS.length) * 100;
                return (
                  <div key={r} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">{r}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: REGIME_COLORS[r] }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{count}/8</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Macro regime indicators summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Global PMI Composite", value: "51.3", sub: "Expansion", icon: <Activity className="w-4 h-4 text-green-400" />, up: true },
          { label: "Global CPI (avg)", value: "3.8%", sub: "Above target", icon: <TrendingUp className="w-4 h-4 text-red-400" />, up: false },
          { label: "G7 GDP Growth", value: "2.1%", sub: "Steady", icon: <BarChart2 className="w-4 h-4 text-primary" />, up: true },
          { label: "USD Index (DXY)", value: "104.6", sub: "-0.3% MTD", icon: <DollarSign className="w-4 h-4 text-yellow-400" />, up: false },
        ].map((m, i) => (
          <Card key={i} className="bg-card/60 border-border">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between mb-1">
                {m.icon}
                {m.up ? (
                  <ArrowUpRight className="w-3 h-3 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-400" />
                )}
              </div>
              <p className="text-lg font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CentralBanksTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        <span className="text-sm font-semibold text-foreground">Central Bank Policy Tracker</span>
      </div>

      <Card className="bg-card/60 border-border overflow-x-auto">
        <CardContent className="pt-4 pb-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="pb-2 pr-3">Bank</th>
                <th className="pb-2 pr-3 text-right">Rate</th>
                <th className="pb-2 pr-3 text-right">Last Chg</th>
                <th className="pb-2 pr-4">Next Meeting</th>
                <th className="pb-2 pr-4">Guidance</th>
                <th className="pb-2">12m History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {CENTRAL_BANKS.map((cb, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cb.flag}</span>
                      <div>
                        <p className="font-semibold text-foreground text-xs">{cb.abbr}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">{cb.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <span className="font-mono font-bold text-foreground">{cb.currentRate.toFixed(2)}%</span>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    {cb.lastChangeDir === "up" ? (
                      <span className="flex items-center justify-end gap-0.5 text-red-400 font-mono text-xs">
                        <ArrowUpRight className="w-3 h-3" />+{Math.abs(cb.lastChange).toFixed(2)}%
                      </span>
                    ) : cb.lastChangeDir === "down" ? (
                      <span className="flex items-center justify-end gap-0.5 text-green-400 font-mono text-xs">
                        <ArrowDownRight className="w-3 h-3" />{cb.lastChange.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="flex items-center justify-end gap-0.5 text-muted-foreground font-mono text-xs">
                        <Minus className="w-3 h-3" />0.00%
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {cb.nextMeeting}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <GuidanceBadge g={cb.guidance} />
                  </td>
                  <td className="py-3">
                    <RateSparkline data={cb.rateHistory} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Policy divergence note */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Policy Divergence Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: "Fed vs ECB Spread",
                value: "+2.10%",
                note: "USD carry advantage persists",
                color: "text-primary",
              },
              {
                title: "BOJ Divergence",
                value: "−4.75%",
                note: "Yen carry unwind risk elevated",
                color: "text-red-400",
              },
              {
                title: "EM Rate Premium",
                value: "+3.40%",
                note: "Attractive vs DM on risk-adj basis",
                color: "text-green-400",
              },
            ].map((d, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">{d.title}</p>
                <p className={cn("text-xl font-bold font-mono", d.color)}>{d.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{d.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Currency Wars indicator */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Currency Wars Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { currency: "USD", ytd: "+2.3%", interv: "None", risk: "low" },
              { currency: "JPY", ytd: "-8.1%", interv: "Verbal", risk: "high" },
              { currency: "CNY", ytd: "-1.4%", interv: "Active", risk: "medium" },
              { currency: "EUR", ytd: "-3.2%", interv: "None", risk: "low" },
            ].map((c, i) => {
              const riskColor =
                c.risk === "high" ? "text-red-400" : c.risk === "medium" ? "text-yellow-400" : "text-green-400";
              const ytdColor = c.ytd.startsWith("+") ? "text-green-400" : "text-red-400";
              return (
                <div key={i} className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="font-bold text-foreground text-sm">{c.currency}</p>
                  <p className={cn("text-lg font-mono font-bold", ytdColor)}>{c.ytd}</p>
                  <p className="text-xs text-muted-foreground">YTD vs basket</p>
                  <p className="text-xs text-muted-foreground mt-1">Intervention: {c.interv}</p>
                  <p className={cn("text-xs font-semibold mt-0.5", riskColor)}>Risk: {c.risk}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CrossAssetTab() {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Cross-Asset Correlation Matrix (30-day rolling)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Heatmap */}
        <Card className="lg:col-span-2 bg-card/60 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Correlation Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <CorrelationMatrix />
            </div>
            {/* Color scale legend */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">−1.0</span>
              <div
                className="flex-1 h-2 rounded"
                style={{
                  background:
                    "linear-gradient(to right, #b91c1c, #ef4444, #fca5a5, #f9fafb, #93c5fd, #3b82f6, #1d4ed8)",
                }}
              />
              <span className="text-xs text-muted-foreground">+1.0</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Negative = inverse relationship &nbsp;·&nbsp; Positive = move together</p>
          </CardContent>
        </Card>

        {/* Notable correlations */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Notable Correlations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { pair: "SPX/TLT", corr: CORR_MATRIX[0][1], note: "Stocks-Bond" },
              { pair: "SPX/GLD", corr: CORR_MATRIX[0][2], note: "Stocks-Gold" },
              { pair: "SPX/BTC", corr: CORR_MATRIX[0][5], note: "Stocks-Crypto" },
              { pair: "GLD/USD", corr: CORR_MATRIX[2][3], note: "Gold-Dollar" },
              { pair: "OIL/USD", corr: CORR_MATRIX[4][3], note: "Oil-Dollar" },
              { pair: "TLT/USD", corr: CORR_MATRIX[1][3], note: "Bond-Dollar" },
            ].map((c, i) => {
              const pos = c.corr >= 0;
              const color = pos ? "#22c55e" : "#ef4444";
              const barPct = Math.abs(c.corr) * 100;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-16">{c.pair}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: color }} />
                  </div>
                  <span className="text-xs font-mono w-12 text-right" style={{ color }}>
                    {c.corr >= 0 ? "+" : ""}{c.corr.toFixed(2)}
                  </span>
                </div>
              );
            })}

            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground font-semibold mb-1">Regime Insight</p>
              <p className="text-xs text-muted-foreground leading-snug">
                SPX/TLT correlation shift signals key regime transition. Positive correlation indicates
                risk-off dynamics; negative suggests inflation-driven repricing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset performance summary */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">30-Day Asset Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { short: "SPX", ret: +3.2, vol: 14.1 },
              { short: "TLT", ret: -1.8, vol: 11.3 },
              { short: "GLD", ret: +5.1, vol: 9.8 },
              { short: "USD", ret: -0.4, vol: 6.2 },
              { short: "OIL", ret: +7.3, vol: 28.5 },
              { short: "BTC", ret: +12.6, vol: 62.4 },
            ].map((a, i) => {
              const pos = a.ret >= 0;
              return (
                <div key={i} className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="font-bold text-muted-foreground text-sm">{a.short}</p>
                  <p className={cn("text-xl font-bold font-mono", pos ? "text-green-400" : "text-red-400")}>
                    {pos ? "+" : ""}{a.ret.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Vol {a.vol.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PositioningTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-orange-400" />
        <span className="text-sm font-semibold text-foreground">Global Portfolio Positioning (COT-Style)</span>
      </div>

      <Card className="bg-card/60 border-border overflow-x-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Net Speculative Positioning by Asset Class</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="pb-2 pr-3">Asset</th>
                <th className="pb-2 pr-4">Net Long/Short</th>
                <th className="pb-2 pr-4">Spec Net</th>
                <th className="pb-2 pr-4">Comm Net</th>
                <th className="pb-2">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {POSITIONING.map((p, i) => {
                const nlPos = p.netLong >= 0;
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2.5 pr-3">
                      <div>
                        <p className="font-semibold text-foreground text-xs">{p.short}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">{p.name}</p>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <PositioningBar value={p.netLong} max={100} />
                        <span className={cn("text-xs font-mono", nlPos ? "text-green-400" : "text-red-400")}>
                          {nlPos ? "+" : ""}{p.netLong.toFixed(0)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <PositioningBar value={p.speculativeNet} />
                        <span className={cn("text-xs font-mono", p.speculativeNet >= 0 ? "text-green-400" : "text-red-400")}>
                          {p.speculativeNet >= 0 ? "+" : ""}{p.speculativeNet.toFixed(0)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <PositioningBar value={p.commercialNet} />
                        <span className={cn("text-xs font-mono", p.commercialNet >= 0 ? "text-green-400" : "text-red-400")}>
                          {p.commercialNet >= 0 ? "+" : ""}{p.commercialNet.toFixed(0)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <SentimentDot value={p.sentiment} />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Sentiment summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Fear & Greed Index", value: 62, desc: "Greed zone", color: "#22c55e" },
          { label: "Global Risk Appetite", value: 54, desc: "Mild risk-on", color: "#f59e0b" },
          { label: "EM Fund Flows", value: 38, desc: "Slight outflows", color: "#ef4444" },
          { label: "Hedge Fund Beta", value: 71, desc: "High market exposure", color: "#22c55e" },
        ].map((s, i) => {
          const angle = (s.value / 100) * 180 - 90;
          const rad = (angle * Math.PI) / 180;
          const cx = 50, cy = 45, r = 32;
          const nx = cx + r * Math.cos(rad);
          const ny = cy + r * Math.sin(rad);
          return (
            <Card key={i} className="bg-card/60 border-border">
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
                {/* Mini arc gauge */}
                <svg viewBox="0 0 100 55" className="w-full h-12">
                  <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none"
                    stroke="#1f2937"
                    strokeWidth={6}
                  />
                  <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${nx} ${ny}`}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={6}
                    strokeLinecap="round"
                  />
                  <line
                    x1={cx}
                    y1={cy}
                    x2={nx}
                    y2={ny}
                    stroke={s.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    opacity={0.6}
                  />
                  <text x={cx} y={cy - 10} textAnchor="middle" fill="#f9fafb" fontSize={13} fontWeight="bold">
                    {s.value}
                  </text>
                </svg>
                <p className="text-xs text-center mt-1" style={{ color: s.color }}>{s.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Crowded trades alert */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Crowded Trade Risk Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                trade: "Long US Tech / Short Bonds",
                crowding: 82,
                risk: "high",
                note: "Multi-year high positioning; reversal risk elevated",
              },
              {
                trade: "Long USD / Short JPY",
                crowding: 74,
                risk: "high",
                note: "BOJ pivot could trigger rapid unwind",
              },
              {
                trade: "Long Gold / Short DXY",
                crowding: 55,
                risk: "medium",
                note: "Moderate crowding; geopolitical premium supports",
              },
            ].map((t, i) => {
              const riskColor = t.risk === "high" ? "#ef4444" : "#f59e0b";
              return (
                <div key={i} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">{t.trade}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${t.crowding}%`, background: riskColor }}
                      />
                    </div>
                    <span className="text-xs font-mono" style={{ color: riskColor }}>{t.crowding}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{t.note}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function GlobalMacroDashPage() {
  const [activeTab, setActiveTab] = useState("regime");

  const tabs = [
    { value: "regime", label: "Macro Regime", icon: <Globe className="w-3.5 h-3.5" /> },
    { value: "centralbanks", label: "Central Banks", icon: <Target className="w-3.5 h-3.5" /> },
    { value: "crossasset", label: "Cross-Asset", icon: <Layers className="w-3.5 h-3.5" /> },
    { value: "positioning", label: "Positioning", icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Global Macro Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Cross-asset correlations · Central bank policy · Macro regimes · Positioning intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-muted/60 text-primary border-border text-xs">
            <Activity className="w-3 h-3 mr-1" />
            Live Feed
          </Badge>
          <span className="text-xs text-muted-foreground">Updated Mar 28, 2026</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card/70 border border-border h-auto p-1 flex flex-wrap gap-1">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="flex items-center gap-1.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground"
            >
              {t.icon}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="regime" className="data-[state=inactive]:hidden mt-0">
            <AnimatePresence mode="wait">
              {activeTab === "regime" && (
                <motion.div
                  key="regime"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <MacroRegimeTab />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="centralbanks" className="data-[state=inactive]:hidden mt-0">
            <AnimatePresence mode="wait">
              {activeTab === "centralbanks" && (
                <motion.div
                  key="centralbanks"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <CentralBanksTab />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="crossasset" className="data-[state=inactive]:hidden mt-0">
            <AnimatePresence mode="wait">
              {activeTab === "crossasset" && (
                <motion.div
                  key="crossasset"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <CrossAssetTab />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="positioning" className="data-[state=inactive]:hidden mt-0">
            <AnimatePresence mode="wait">
              {activeTab === "positioning" && (
                <motion.div
                  key="positioning"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <PositioningTab />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
