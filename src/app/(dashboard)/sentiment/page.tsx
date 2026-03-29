"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  BarChart2,
  Eye,
  Brain,
  AlertTriangle,
  Info,
  ArrowUp,
  ArrowDown,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── mulberry32 seeded PRNG ────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Fear & Greed zone helpers ─────────────────────────────────────────────────

function getFgColor(value: number): string {
  if (value <= 25) return "#ef4444";
  if (value <= 45) return "#f97316";
  if (value <= 55) return "#eab308";
  if (value <= 75) return "#22c55e";
  return "#4ade80";
}

function getFgLabel(value: number): string {
  if (value <= 25) return "Extreme Fear";
  if (value <= 45) return "Fear";
  if (value <= 55) return "Neutral";
  if (value <= 75) return "Greed";
  return "Extreme Greed";
}

// ── Synthetic data generation ─────────────────────────────────────────────────

function generateFgHistory(days: number, endValue: number) {
  const rng = mulberry32(0xdeadbeef);
  const data: number[] = [];
  let v = endValue + (rng() - 0.5) * 30;
  // walk backwards, place end value last
  const raw: number[] = [];
  for (let i = 0; i < days; i++) {
    v = Math.max(5, Math.min(95, v + (rng() - 0.5) * 8));
    raw.push(Math.round(v));
  }
  // last value = endValue
  raw[raw.length - 1] = endValue;
  return raw;
}

function generateAdLine(days: number) {
  const rng = mulberry32(0xabcdef12);
  const adLine: number[] = [];
  const sp500: number[] = [];
  let ad = 0;
  let sp = 4500;
  for (let i = 0; i < days; i++) {
    ad += (rng() - 0.48) * 120;
    sp = sp * (1 + (rng() - 0.49) * 0.012);
    adLine.push(ad);
    sp500.push(sp);
  }
  return { adLine, sp500 };
}

function generateHighsLows(days: number) {
  const rng = mulberry32(0x12345678);
  return Array.from({ length: days }, () => ({
    highs: Math.floor(rng() * 120 + 20),
    lows: Math.floor(rng() * 80 + 5),
  }));
}

function generateGoogleTrends(weeks: number) {
  const rng = mulberry32(0x99887766);
  const data: number[] = [];
  let v = 20;
  for (let i = 0; i < weeks; i++) {
    v = Math.max(5, Math.min(100, v + (rng() - 0.5) * 12));
    data.push(Math.round(v));
  }
  // spike near end for drama
  data[weeks - 8] = Math.min(100, data[weeks - 8] + 35);
  data[weeks - 7] = Math.min(100, data[weeks - 7] + 28);
  return data;
}

function generateMarginDebt(months: number) {
  const rng = mulberry32(0x55aa55aa);
  const debt: number[] = [];
  const sp500: number[] = [];
  let d = 2.1;
  let sp = 4000;
  for (let i = 0; i < months; i++) {
    d = Math.max(1.2, Math.min(3.8, d + (rng() - 0.49) * 0.09));
    sp = Math.max(3000, sp * (1 + (rng() - 0.49) * 0.018));
    debt.push(+d.toFixed(2));
    sp500.push(Math.round(sp));
  }
  return { debt, sp500 };
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

function polylinePoints(
  data: number[],
  w: number,
  h: number,
  padX = 4,
  padY = 6,
) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = padX + (i / (data.length - 1)) * (w - padX * 2);
      const y = padY + (1 - (v - min) / range) * (h - padY * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

function dualPolyline(
  a: number[],
  b: number[],
  w: number,
  h: number,
  padX = 4,
  padY = 6,
) {
  const allVals = [...a, ...b];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;
  const pts = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = padX + (i / (arr.length - 1)) * (w - padX * 2);
        const y = padY + (1 - (v - min) / range) * (h - padY * 2);
        return `${x},${y}`;
      })
      .join(" ");
  return { ptA: pts(a), ptB: pts(b) };
}

// ── Sub-Indicator mini gauge ──────────────────────────────────────────────────

function MiniGauge({ value, size = 48 }: { value: number; size?: number }) {
  const color = getFgColor(value);
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.58;
  const startAngle = -Math.PI;
  const endAngle = 0;
  const totalAngle = endAngle - startAngle;
  const angle = startAngle + (value / 100) * totalAngle;
  const needleLen = r * 0.82;
  const nx = cx + needleLen * Math.cos(angle);
  const ny = cy + needleLen * Math.sin(angle);
  // Arc path
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
      <path d={arcPath} fill="none" stroke="#374151" strokeWidth={size * 0.09} />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + (Math.cos(angle) * r)} ${cy + (Math.sin(angle) * r)}`}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.09}
      />
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke="#f1f5f9"
        strokeWidth={size * 0.04}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={size * 0.04} fill="#f1f5f9" />
    </svg>
  );
}

// ── Large Fear & Greed Gauge ──────────────────────────────────────────────────

function FearGreedGauge({ value }: { value: number }) {
  const w = 320;
  const h = 200;
  const cx = w / 2;
  const cy = h * 0.78;
  const r = 110;

  const zones = [
    { start: 0, end: 25, color: "#ef4444", label: "Extreme Fear" },
    { start: 25, end: 45, color: "#f97316", label: "Fear" },
    { start: 45, end: 55, color: "#eab308", label: "Neutral" },
    { start: 55, end: 75, color: "#22c55e", label: "Greed" },
    { start: 75, end: 100, color: "#4ade80", label: "Extreme Greed" },
  ];

  function arcSegment(
    startVal: number,
    endVal: number,
    innerR: number,
    outerR: number,
  ) {
    const toAngle = (v: number) => Math.PI + (v / 100) * Math.PI;
    const s = toAngle(startVal);
    const e = toAngle(endVal);
    const x1i = cx + innerR * Math.cos(s);
    const y1i = cy + innerR * Math.sin(s);
    const x2i = cx + innerR * Math.cos(e);
    const y2i = cy + innerR * Math.sin(e);
    const x1o = cx + outerR * Math.cos(s);
    const y1o = cy + outerR * Math.sin(s);
    const x2o = cx + outerR * Math.cos(e);
    const y2o = cy + outerR * Math.sin(e);
    return `M ${x1i} ${y1i} A ${innerR} ${innerR} 0 0 1 ${x2i} ${y2i} L ${x2o} ${y2o} A ${outerR} ${outerR} 0 0 0 ${x1o} ${y1o} Z`;
  }

  const needleAngle = Math.PI + (value / 100) * Math.PI;
  const needleLen = r * 0.82;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy + needleLen * Math.sin(needleAngle);

  const color = getFgColor(value);

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mx-auto">
      {/* Zone arcs */}
      {zones.map((z) => (
        <path
          key={z.label}
          d={arcSegment(z.start, z.end, r * 0.68, r)}
          fill={z.color}
          opacity={0.85}
        />
      ))}
      {/* Gap lines between zones */}
      {zones.map((z) => {
        const angle = Math.PI + (z.start / 100) * Math.PI;
        const ix = cx + r * 0.68 * Math.cos(angle);
        const iy = cy + r * 0.68 * Math.sin(angle);
        const ox = cx + r * Math.cos(angle);
        const oy = cy + r * Math.sin(angle);
        return (
          <line
            key={`gap-${z.start}`}
            x1={ix} y1={iy} x2={ox} y2={oy}
            stroke="#0f172a" strokeWidth={1.5}
          />
        );
      })}
      {/* Needle */}
      <line
        x1={cx} y1={cy}
        x2={nx} y2={ny}
        stroke="#f8fafc"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={8} fill="#1e293b" stroke={color} strokeWidth={2.5} />
      {/* Value text */}
      <text
        x={cx} y={cy - 16}
        textAnchor="middle"
        fill={color}
        fontSize={30}
        fontWeight="bold"
        fontFamily="monospace"
      >
        {value}
      </text>
      <text x={cx} y={cy - 2} textAnchor="middle" fill="#94a3b8" fontSize={10}>
        {getFgLabel(value)}
      </text>
      {/* Zone labels */}
      {[
        { v: 12, label: "Extreme\nFear" },
        { v: 35, label: "Fear" },
        { v: 50, label: "Neutral" },
        { v: 65, label: "Greed" },
        { v: 87, label: "Extreme\nGreed" },
      ].map(({ v, label }) => {
        const angle = Math.PI + (v / 100) * Math.PI;
        const lr = r * 1.12;
        const lx = cx + lr * Math.cos(angle);
        const ly = cy + lr * Math.sin(angle);
        return (
          <text
            key={v}
            x={lx} y={ly}
            textAnchor="middle"
            fill="#64748b"
            fontSize={7.5}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Historical FG line chart ──────────────────────────────────────────────────

function FgHistoryChart({ data }: { data: number[] }) {
  const w = 560;
  const h = 100;
  const pts = polylinePoints(data, w, h, 6, 8);
  const color = getFgColor(data[data.length - 1]);

  // gradient fill path
  const ptArr = data.map((v, i) => {
    const x = 6 + (i / (data.length - 1)) * (w - 12);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const y = 8 + (1 - (v - min) / range) * (h - 16);
    return [x, y] as [number, number];
  });
  const fillPath =
    `M ${ptArr[0][0]},${h} ` +
    ptArr.map(([x, y]) => `L ${x},${y}`).join(" ") +
    ` L ${ptArr[ptArr.length - 1][0]},${h} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id="fg-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
        {/* zone background bands */}
      </defs>
      {/* Zone bands */}
      {[
        { min: 0, max: 25, color: "#ef4444" },
        { min: 25, max: 45, color: "#f97316" },
        { min: 45, max: 55, color: "#eab308" },
        { min: 55, max: 75, color: "#22c55e" },
        { min: 75, max: 100, color: "#4ade80" },
      ].map((zone) => {
        const dataMin = Math.min(...data);
        const dataMax = Math.max(...data);
        const range = dataMax - dataMin || 1;
        const yTop = 8 + (1 - (Math.min(zone.max, dataMax) - dataMin) / range) * (h - 16);
        const yBot = 8 + (1 - (Math.max(zone.min, dataMin) - dataMin) / range) * (h - 16);
        if (yTop >= yBot) return null;
        return (
          <rect
            key={zone.min}
            x={0} y={yTop}
            width={w} height={yBot - yTop}
            fill={zone.color} opacity={0.05}
          />
        );
      })}
      <path d={fillPath} fill="url(#fg-grad)" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      {/* Current dot */}
      <circle
        cx={ptArr[ptArr.length - 1][0]}
        cy={ptArr[ptArr.length - 1][1]}
        r={3.5}
        fill={color}
      />
    </svg>
  );
}

// ── COT Stacked Bar ───────────────────────────────────────────────────────────

interface CotEntry {
  label: string;
  commercial: number;
  nonCommercial: number;
  smallSpecs: number;
}

function CotBar({ entry }: { entry: CotEntry }) {
  const total =
    Math.abs(entry.commercial) +
    Math.abs(entry.nonCommercial) +
    Math.abs(entry.smallSpecs);
  const pct = (v: number) => Math.abs((v / total) * 100);
  const commPct = pct(entry.commercial);
  const ncPct = pct(entry.nonCommercial);
  const ssPct = pct(entry.smallSpecs);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-300 font-medium">{entry.label}</span>
        <div className="flex gap-3 text-[11px]">
          <span className={entry.commercial > 0 ? "text-emerald-400" : "text-red-400"}>
            Comm: {entry.commercial > 0 ? "+" : ""}{entry.commercial.toLocaleString()}
          </span>
          <span className={entry.nonCommercial > 0 ? "text-blue-400" : "text-amber-400"}>
            NonComm: {entry.nonCommercial > 0 ? "+" : ""}{entry.nonCommercial.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="flex h-5 rounded overflow-hidden gap-0.5">
        <div
          className="flex items-center justify-center text-[11px] font-bold text-white"
          style={{
            width: `${commPct}%`,
            background: entry.commercial > 0 ? "#10b981" : "#ef4444",
          }}
        >
          {commPct > 12 ? `${commPct.toFixed(0)}%` : ""}
        </div>
        <div
          className="flex items-center justify-center text-[11px] font-bold text-white"
          style={{
            width: `${ncPct}%`,
            background: entry.nonCommercial > 0 ? "#3b82f6" : "#f59e0b",
          }}
        >
          {ncPct > 12 ? `${ncPct.toFixed(0)}%` : ""}
        </div>
        <div
          className="flex items-center justify-center text-[11px] font-bold text-white"
          style={{
            width: `${ssPct}%`,
            background: "#8b5cf6",
          }}
        >
          {ssPct > 12 ? `${ssPct.toFixed(0)}%` : ""}
        </div>
      </div>
    </div>
  );
}

// ── Breadth Gauge ─────────────────────────────────────────────────────────────

function BreadthGauge({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <MiniGauge value={value} size={64} />
      <div className="text-center">
        <div className="text-sm font-bold" style={{ color }}>
          {value}%
        </div>
        <div className="text-xs text-slate-500 leading-tight">{label}</div>
      </div>
    </div>
  );
}

// ── Psychological Cycle Clock ─────────────────────────────────────────────────

function MarketCycleClock({ currentStage }: { currentStage: number }) {
  const stages = [
    { label: "Hope", color: "#22c55e" },
    { label: "Optimism", color: "#4ade80" },
    { label: "Belief", color: "#84cc16" },
    { label: "Thrill", color: "#eab308" },
    { label: "Euphoria", color: "#f59e0b" },
    { label: "Anxiety", color: "#f97316" },
    { label: "Denial", color: "#ef4444" },
    { label: "Panic", color: "#dc2626" },
    { label: "Depression", color: "#7f1d1d" },
    { label: "Disbelief", color: "#991b1b" },
    { label: "Fear", color: "#b91c1c" },
    { label: "Despair", color: "#92400e" },
  ];

  const cx = 100;
  const cy = 100;
  const r = 70;
  const n = stages.length;

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
      {stages.map((stage, i) => {
        const angle = ((i - n / 4) / n) * 2 * Math.PI;
        const nextAngle = (((i + 1) - n / 4) / n) * 2 * Math.PI;
        const innerR = r * 0.52;
        const outerR = r;
        const gap = 0.06;
        const sa = angle + gap;
        const ea = nextAngle - gap;
        const x1 = cx + innerR * Math.cos(sa);
        const y1 = cy + innerR * Math.sin(sa);
        const x2 = cx + outerR * Math.cos(sa);
        const y2 = cy + outerR * Math.sin(sa);
        const x3 = cx + outerR * Math.cos(ea);
        const y3 = cy + outerR * Math.sin(ea);
        const x4 = cx + innerR * Math.cos(ea);
        const y4 = cy + innerR * Math.sin(ea);
        const isActive = i === currentStage;
        const midAngle = (sa + ea) / 2;
        const labelR = r * 1.18;
        const lx = cx + labelR * Math.cos(midAngle);
        const ly = cy + labelR * Math.sin(midAngle);

        return (
          <g key={stage.label}>
            <path
              d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`}
              fill={isActive ? stage.color : stage.color + "40"}
              stroke={isActive ? stage.color : "transparent"}
              strokeWidth={isActive ? 1.5 : 0}
            />
            <text
              x={lx} y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isActive ? stage.color : "#475569"}
              fontSize={isActive ? 7 : 6}
              fontWeight={isActive ? "bold" : "normal"}
            >
              {stage.label}
            </text>
          </g>
        );
      })}
      {/* center */}
      <circle cx={cx} cy={cy} r={r * 0.48} fill="#0f172a" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#94a3b8" fontSize={8}>
        Current
      </text>
      <text
        x={cx} y={cy + 8}
        textAnchor="middle"
        fill={stages[currentStage].color}
        fontSize={9}
        fontWeight="bold"
      >
        {stages[currentStage].label}
      </text>
    </svg>
  );
}

// ── Sector Breadth Heatmap ────────────────────────────────────────────────────

interface SectorBreadth {
  sector: string;
  above50ma: number;
  above200ma: number;
  rsiAvg: number;
}

function heatColor(v: number, min = 0, max = 100): string {
  const t = (v - min) / (max - min);
  if (t < 0.3) return "#ef4444";
  if (t < 0.45) return "#f97316";
  if (t < 0.55) return "#eab308";
  if (t < 0.7) return "#22c55e";
  return "#4ade80";
}

// ── VIX Term Structure ────────────────────────────────────────────────────────

function VixTermChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const w = 300;
  const h = 90;
  const padX = 36;
  const padY = 12;
  const min = Math.min(...data.map((d) => d.value)) - 1;
  const max = Math.max(...data.map((d) => d.value)) + 1;
  const range = max - min;
  const pts = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (w - padX * 2);
    const y = padY + (1 - (d.value - min) / range) * (h - padY * 2);
    return { x, y, ...d };
  });
  const polyPts = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={polyPts}
        fill="none"
        stroke="#6366f1"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {pts.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r={4} fill="#6366f1" />
          <text x={p.x} y={h - 2} textAnchor="middle" fill="#64748b" fontSize={8}>
            {p.label}
          </text>
          <text x={p.x} y={p.y - 7} textAnchor="middle" fill="#e2e8f0" fontSize={8} fontWeight="bold">
            {p.value.toFixed(1)}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Advance/Decline Chart ─────────────────────────────────────────────────────

function AdLineChart({
  adLine,
  sp500,
}: {
  adLine: number[];
  sp500: number[];
}) {
  const w = 560;
  const h = 120;
  const { ptA, ptB } = dualPolyline(adLine, sp500, w, h, 6, 10);
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={ptA} fill="none" stroke="#3b82f6" strokeWidth={1.6} strokeLinejoin="round" />
      <polyline points={ptB} fill="none" stroke="#22c55e" strokeWidth={1.6} strokeLinejoin="round" strokeDasharray="4 2" />
    </svg>
  );
}

// ── Highs/Lows Bar Chart ──────────────────────────────────────────────────────

function HighsLowsChart({ data }: { data: { highs: number; lows: number }[] }) {
  const w = 560;
  const h = 90;
  const maxVal = Math.max(...data.map((d) => Math.max(d.highs, d.lows)));
  const barW = (w / data.length) * 0.4;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {data.map((d, i) => {
        const x = (i / data.length) * w + barW * 0.5;
        const highH = (d.highs / maxVal) * (h - 8);
        const lowH = (d.lows / maxVal) * (h - 8);
        return (
          <g key={i}>
            <rect
              x={x} y={h - 4 - highH}
              width={barW} height={highH}
              fill="#22c55e" opacity={0.8}
            />
            <rect
              x={x + barW + 1} y={h - 4 - lowH}
              width={barW} height={lowH}
              fill="#ef4444" opacity={0.8}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SentimentPage() {
  const [activeTab, setActiveTab] = useState("feargreed");

  // ── Seeded synthetic data ──────────────────────────────────────────────────
  const rng = useMemo(() => mulberry32(0x1a2b3c4d), []);

  const FG_VALUE = 58;
  const fgHistory = useMemo(() => generateFgHistory(90, FG_VALUE), []);

  const subIndicators = useMemo(() => {
    const r = mulberry32(0xf1e2d3c4);
    return [
      {
        name: "Market Momentum",
        desc: "S&P 500 vs 125-day MA",
        value: Math.round(r() * 30 + 55),
        dir: 1,
      },
      {
        name: "Stock Price Strength",
        desc: "NYSE 52-week highs vs lows",
        value: Math.round(r() * 25 + 50),
        dir: 1,
      },
      {
        name: "Price Breadth",
        desc: "McClellan Vol Summation",
        value: Math.round(r() * 20 + 48),
        dir: 0,
      },
      {
        name: "Put/Call Ratio",
        desc: "Inverse — low ratio = bullish",
        value: Math.round(r() * 20 + 55),
        dir: 1,
      },
      {
        name: "Market Volatility",
        desc: "VIX vs 50-day MA",
        value: Math.round(r() * 25 + 45),
        dir: -1,
      },
      {
        name: "Safe Haven Demand",
        desc: "Bond vs stock returns",
        value: Math.round(r() * 20 + 52),
        dir: 1,
      },
      {
        name: "Junk Bond Demand",
        desc: "High yield spread",
        value: Math.round(r() * 22 + 53),
        dir: 1,
      },
    ];
  }, []);

  const aaiiData = useMemo(() => ({
    bulls: 42,
    bears: 28,
    neutral: 30,
    hist52wBulls: { min: 22, max: 65 },
    hist52wBears: { min: 17, max: 52 },
  }), []);

  const vixTermStructure = useMemo(
    () => [
      { label: "Spot", value: 17.4 },
      { label: "1M", value: 18.9 },
      { label: "3M", value: 20.2 },
      { label: "6M", value: 21.8 },
    ],
    [],
  );

  const shortInterest = useMemo(() => {
    const r = mulberry32(0xabcd1234);
    return [
      "TSLA", "GME", "AMC", "RIVN", "PLTR",
      "SOFI", "LCID", "BYND", "BBBY", "SPCE",
    ].map((ticker) => ({
      ticker,
      floatShorted: +(r() * 25 + 5).toFixed(1),
      daysToCover: +(r() * 6 + 1).toFixed(1),
      chg1d: +((r() - 0.5) * 4).toFixed(2),
    }));
  }, []);

  const { adLine, sp500: adSp500 } = useMemo(() => generateAdLine(90), []);
  const hlData = useMemo(() => generateHighsLows(60), []);

  const sectorBreadth = useMemo<SectorBreadth[]>(() => {
    const r = mulberry32(0xbeefdead);
    return [
      "Technology", "Healthcare", "Financials", "Cons. Disc.",
      "Cons. Staples", "Industrials", "Energy", "Materials",
      "Real Estate", "Utilities", "Comm. Services",
    ].map((sector) => ({
      sector,
      above50ma: Math.round(r() * 60 + 30),
      above200ma: Math.round(r() * 50 + 25),
      rsiAvg: Math.round(r() * 30 + 40),
    }));
  }, []);

  const mclellanOscillator = useMemo(() => {
    const r = mulberry32(0x77665544);
    return Math.round((r() - 0.5) * 200);
  }, []);

  const breadthAbove50 = 61;
  const breadthAbove200 = 54;

  const cotData = useMemo<CotEntry[]>(
    () => [
      {
        label: "S&P 500 Futures",
        commercial: -42500,
        nonCommercial: 38200,
        smallSpecs: 4300,
      },
      {
        label: "Gold Futures",
        commercial: -187000,
        nonCommercial: 165000,
        smallSpecs: 22000,
      },
      {
        label: "Crude Oil Futures",
        commercial: -280000,
        nonCommercial: 245000,
        smallSpecs: 35000,
      },
    ],
    [],
  );

  const darkPoolData = useMemo(() => {
    const r = mulberry32(0x11223344);
    return [
      "AAPL", "MSFT", "TSLA", "NVDA", "SPY",
      "AMZN", "META", "GOOGL", "JPM", "QQQ",
    ].map((ticker) => ({
      ticker,
      darkPct: +(r() * 30 + 25).toFixed(1),
      volume: Math.round(r() * 50 + 10),
    }));
  }, []);

  const insiderRatio = useMemo(() => {
    const r = mulberry32(0x55667788);
    return {
      buying: +(r() * 30 + 10).toFixed(1),
      selling: +(r() * 60 + 30).toFixed(1),
    };
  }, []);

  const hedgeFundMoves = useMemo(() => {
    const r = mulberry32(0xaabbccdd);
    const funds = ["Bridgewater", "Renaissance", "Citadel", "Two Sigma", "D.E. Shaw"];
    const tickers = ["NVDA", "MSFT", "META", "AMZN", "GOOGL"];
    return funds.map((fund, i) => ({
      fund,
      ticker: tickers[i],
      action: r() > 0.45 ? "Added" : "Reduced",
      sharesK: Math.round(r() * 900 + 100),
      pctChg: +((r() - 0.3) * 60).toFixed(1),
    }));
  }, []);

  const googleTrends = useMemo(() => generateGoogleTrends(52), []);
  const { debt: marginDebt, sp500: marginSp } = useMemo(
    () => generateMarginDebt(36),
    [],
  );

  const socialTickers = useMemo(() => {
    const r = mulberry32(0x99aabbcc);
    return [
      "TSLA", "NVDA", "AMD", "AAPL", "GME",
      "AMC", "SPY", "PLTR", "COIN", "RIVN",
    ].map((ticker) => ({
      ticker,
      bull: Math.round(r() * 60 + 20),
      bear: 0,
      mentions: Math.round(r() * 9000 + 500),
    })).map((d) => ({ ...d, bear: 100 - d.bull }));
  }, []);

  const surveyQuestions = useMemo(() => {
    const r = mulberry32(0xfedcba98);
    return [
      "Market will be higher in 6 months",
      "Fed will cut rates this year",
      "Recession likely in 2026",
      "AI stocks are overvalued",
      "Now is a good time to buy equities",
    ].map((q) => {
      const agree = Math.round(r() * 50 + 25);
      const disagree = Math.round(r() * 40 + 10);
      const neutral = 100 - agree - disagree;
      return { question: q, agree, disagree, neutral: Math.max(0, neutral) };
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100 p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="p-2 rounded-lg bg-violet-500/15">
          <Brain className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">
            Market Psychology & Sentiment
          </h1>
          <p className="text-xs text-slate-500">
            Behavioral analytics, fear/greed metrics, institutional flows
          </p>
        </div>
        <Badge className="ml-auto bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-xs">
          Live Synthetic
        </Badge>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900/80 border border-slate-800 flex flex-wrap gap-1 h-auto p-1">
          {[
            { value: "feargreed", label: "Fear & Greed", icon: Activity },
            { value: "sentiment", label: "Sentiment", icon: BarChart2 },
            { value: "breadth", label: "Breadth", icon: TrendingUp },
            { value: "institutional", label: "Institutional", icon: Eye },
            { value: "behavioral", label: "Behavioral", icon: Brain },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="text-xs data-[state=active]:bg-violet-600 data-[state=active]:text-white flex items-center gap-1.5 px-3 py-1.5"
            >
              <Icon className="h-3 w-3" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1: Fear & Greed ──────────────────────────────────────────── */}
        <TabsContent value="feargreed" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main gauge */}
            <Card className="lg:col-span-1 bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-violet-400" />
                  Fear & Greed Index
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FearGreedGauge value={FG_VALUE} />
                <div className="text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: getFgColor(FG_VALUE) }}
                  >
                    {getFgLabel(FG_VALUE)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Previous close: 54 &nbsp;|&nbsp; 1 week ago: 48
                  </div>
                </div>
                {/* zone legend */}
                <div className="space-y-1">
                  {[
                    { range: "0–25", label: "Extreme Fear", color: "#ef4444" },
                    { range: "25–45", label: "Fear", color: "#f97316" },
                    { range: "45–55", label: "Neutral", color: "#eab308" },
                    { range: "55–75", label: "Greed", color: "#22c55e" },
                    { range: "75–100", label: "Extreme Greed", color: "#4ade80" },
                  ].map((z) => (
                    <div key={z.label} className="flex items-center gap-2 text-[11px]">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: z.color }}
                      />
                      <span className="text-slate-500 w-12">{z.range}</span>
                      <span className="text-slate-400">{z.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sub-indicators */}
            <Card className="lg:col-span-2 bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">
                  Sub-Indicator Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {subIndicators.map((ind) => (
                    <div
                      key={ind.name}
                      className="bg-slate-800/60 rounded-lg p-2.5 flex flex-col items-center gap-1"
                    >
                      <MiniGauge value={ind.value} size={52} />
                      <div className="text-center">
                        <div
                          className="text-sm font-bold"
                          style={{ color: getFgColor(ind.value) }}
                        >
                          {ind.value}
                        </div>
                        <div className="flex items-center justify-center gap-0.5">
                          {ind.dir > 0 ? (
                            <ArrowUp className="h-2.5 w-2.5 text-emerald-400" />
                          ) : ind.dir < 0 ? (
                            <ArrowDown className="h-2.5 w-2.5 text-red-400" />
                          ) : (
                            <Minus className="h-2.5 w-2.5 text-slate-500" />
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-medium leading-tight">
                          {ind.name}
                        </div>
                        <div className="text-[11px] text-slate-600 leading-tight">
                          {ind.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical chart */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300 flex items-center justify-between">
                <span>Historical Fear & Greed (90 days)</span>
                <div className="flex gap-2 text-xs">
                  {[
                    { color: "#ef4444", label: "Extreme Fear" },
                    { color: "#f97316", label: "Fear" },
                    { color: "#eab308", label: "Neutral" },
                    { color: "#22c55e", label: "Greed" },
                    { color: "#4ade80", label: "Extreme Greed" },
                  ].map((z) => (
                    <span key={z.label} className="flex items-center gap-1">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: z.color }}
                      />
                      <span className="text-slate-600">{z.label}</span>
                    </span>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FgHistoryChart data={fgHistory} />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Sentiment Indicators ──────────────────────────────────── */}
        <TabsContent value="sentiment" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* AAII Survey */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  AAII Sentiment Survey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Bullish", value: aaiiData.bulls, color: "#22c55e" },
                    { label: "Neutral", value: aaiiData.neutral, color: "#eab308" },
                    { label: "Bearish", value: aaiiData.bears, color: "#ef4444" },
                  ].map((d) => (
                    <div
                      key={d.label}
                      className="bg-slate-800/60 rounded-lg p-2"
                    >
                      <div
                        className="text-xl font-bold"
                        style={{ color: d.color }}
                      >
                        {d.value}%
                      </div>
                      <div className="text-xs text-slate-500">{d.label}</div>
                    </div>
                  ))}
                </div>
                {/* 3-segment bar */}
                <div className="flex h-6 rounded overflow-hidden">
                  <div
                    className="flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      width: `${aaiiData.bulls}%`,
                      background: "#22c55e",
                    }}
                  >
                    {aaiiData.bulls}%
                  </div>
                  <div
                    className="flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      width: `${aaiiData.neutral}%`,
                      background: "#eab308",
                    }}
                  >
                    {aaiiData.neutral}%
                  </div>
                  <div
                    className="flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      width: `${aaiiData.bears}%`,
                      background: "#ef4444",
                    }}
                  >
                    {aaiiData.bears}%
                  </div>
                </div>
                {/* 52-week range */}
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Bulls 52W range</span>
                      <span>
                        {aaiiData.hist52wBulls.min}% – {aaiiData.hist52wBulls.max}%
                      </span>
                    </div>
                    <div className="relative h-2 bg-slate-800 rounded">
                      <div
                        className="absolute h-full bg-emerald-500/30 rounded"
                        style={{
                          left: `${aaiiData.hist52wBulls.min}%`,
                          width: `${aaiiData.hist52wBulls.max - aaiiData.hist52wBulls.min}%`,
                        }}
                      />
                      <div
                        className="absolute w-1 h-full bg-emerald-400 rounded"
                        style={{ left: `${aaiiData.bulls}%` }}
                      />
                    </div>
                  </div>
                </div>
                {/* Contrarian signal */}
                {aaiiData.bulls < 60 ? (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 rounded p-2">
                    <Info className="h-3 w-3 flex-shrink-0" />
                    Bulls at {aaiiData.bulls}% — below 60% contrarian threshold, no warning
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[11px] text-red-400 bg-red-500/10 rounded p-2">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                    Bulls above 60% — contrarian bearish signal
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Put/Call Ratio */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">
                  Put/Call Ratio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-400">0.82</div>
                    <div className="text-xs text-slate-500">Current</div>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-slate-300">0.78</div>
                    <div className="text-xs text-slate-500">10-day MA</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "P/C > 1.2", meaning: "Extreme fear — contrarian bullish", color: "text-emerald-400" },
                    { label: "P/C 0.8–1.2", meaning: "Moderate caution", color: "text-amber-400" },
                    { label: "P/C < 0.7", meaning: "Extreme complacency — bearish signal", color: "text-red-400" },
                  ].map((r) => (
                    <div key={r.label} className="flex gap-2 items-start text-[11px]">
                      <span className={cn("font-mono font-bold flex-shrink-0 w-20", r.color)}>
                        {r.label}
                      </span>
                      <span className="text-slate-500">{r.meaning}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 bg-amber-500/10 border border-amber-500/20 rounded p-2">
                  Current P/C of 0.82 is slightly above MA — moderate put buying, mild anxiety in market
                </div>
              </CardContent>
            </Card>

            {/* VIX Term Structure */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-400" />
                  VIX Term Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <VixTermChart data={vixTermStructure} />
                <div className="text-[11px] text-slate-500">
                  Contango (upward sloping) = normal. Backwardation = fear/stress event.
                </div>
                <div className="flex items-center gap-2 text-[11px] text-blue-400 bg-blue-500/10 rounded p-2">
                  <Info className="h-3 w-3" />
                  Current structure shows normal contango — markets pricing low near-term stress
                </div>
              </CardContent>
            </Card>

            {/* Short Interest Table */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">
                  Most Shorted Stocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="grid grid-cols-4 text-xs text-slate-600 pb-1 border-b border-slate-800">
                    <span>Ticker</span>
                    <span className="text-right">Float Short</span>
                    <span className="text-right">Days Cover</span>
                    <span className="text-right">1D Chg</span>
                  </div>
                  {shortInterest.map((s) => (
                    <div
                      key={s.ticker}
                      className="grid grid-cols-4 text-xs py-0.5"
                    >
                      <span className="font-mono font-bold text-slate-200">
                        {s.ticker}
                      </span>
                      <span className="text-right text-amber-400">
                        {s.floatShorted}%
                      </span>
                      <span className="text-right text-slate-400">
                        {s.daysToCover}d
                      </span>
                      <span
                        className={cn(
                          "text-right",
                          s.chg1d >= 0 ? "text-emerald-400" : "text-red-400",
                        )}
                      >
                        {s.chg1d >= 0 ? "+" : ""}
                        {s.chg1d}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 3: Market Breadth ─────────────────────────────────────────── */}
        <TabsContent value="breadth" className="data-[state=inactive]:hidden mt-4 space-y-4">
          {/* A/D Line */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Advance/Decline Line vs S&P 500 (90 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdLineChart adLine={adLine} sp500={adSp500} />
              <div className="flex gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-blue-400 inline-block" />
                  A/D Line
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-emerald-400 inline-block border-dashed" style={{ borderTopStyle: "dashed", borderTopWidth: 1 }} />
                  S&P 500
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Highs/Lows */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">
                  NYSE New Highs vs New Lows (60 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HighsLowsChart data={hlData} />
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-emerald-500/80 inline-block" />
                    New Highs
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-red-500/80 inline-block" />
                    New Lows
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* % above MA gauges */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">
                  Stocks Above Moving Averages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around py-2">
                  <BreadthGauge
                    value={breadthAbove50}
                    label="Above 50-day MA"
                    color={getFgColor(breadthAbove50)}
                  />
                  <BreadthGauge
                    value={breadthAbove200}
                    label="Above 200-day MA"
                    color={getFgColor(breadthAbove200)}
                  />
                </div>
                {/* McClellan */}
                <div className="mt-3 bg-slate-800/60 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-400">
                        McClellan Oscillator
                      </div>
                      <div
                        className={cn(
                          "text-xl font-bold mt-0.5",
                          mclellanOscillator > 0
                            ? "text-emerald-400"
                            : "text-red-400",
                        )}
                      >
                        {mclellanOscillator > 0 ? "+" : ""}
                        {mclellanOscillator}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs",
                        mclellanOscillator > 60
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                          : mclellanOscillator > 0
                            ? "bg-blue-500/15 text-blue-400 border-blue-500/25"
                            : mclellanOscillator > -60
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                              : "bg-red-500/15 text-red-400 border-red-500/25",
                      )}
                    >
                      {mclellanOscillator > 60
                        ? "Overbought"
                        : mclellanOscillator > 0
                          ? "Bullish"
                          : mclellanOscillator > -60
                            ? "Bearish"
                            : "Oversold"}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Range: -200 (oversold) to +200 (overbought). Signal line crossovers indicate trend changes.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sector breadth heatmap */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300">
                Sector Breadth Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-slate-600 border-b border-slate-800">
                      <th className="text-left py-1.5 font-normal pr-4">Sector</th>
                      <th className="text-center py-1.5 font-normal px-2">Above 50MA</th>
                      <th className="text-center py-1.5 font-normal px-2">Above 200MA</th>
                      <th className="text-center py-1.5 font-normal px-2">Avg RSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectorBreadth.map((s) => (
                      <tr key={s.sector} className="border-b border-slate-800/50">
                        <td className="py-1.5 text-slate-400 pr-4">{s.sector}</td>
                        <td className="text-center py-1.5 px-2">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                            style={{
                              background: heatColor(s.above50ma) + "28",
                              color: heatColor(s.above50ma),
                            }}
                          >
                            {s.above50ma}%
                          </span>
                        </td>
                        <td className="text-center py-1.5 px-2">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                            style={{
                              background: heatColor(s.above200ma) + "28",
                              color: heatColor(s.above200ma),
                            }}
                          >
                            {s.above200ma}%
                          </span>
                        </td>
                        <td className="text-center py-1.5 px-2">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                            style={{
                              background: heatColor(s.rsiAvg, 30, 70) + "28",
                              color: heatColor(s.rsiAvg, 30, 70),
                            }}
                          >
                            {s.rsiAvg}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Legend */}
              <div className="flex gap-3 mt-3 text-xs">
                {[
                  { color: "#ef4444", label: "Weak (<30%)" },
                  { color: "#f97316", label: "Below avg" },
                  { color: "#eab308", label: "Neutral" },
                  { color: "#22c55e", label: "Above avg" },
                  { color: "#4ade80", label: "Strong (>70%)" },
                ].map((z) => (
                  <span key={z.label} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: z.color }}
                    />
                    <span className="text-slate-600">{z.label}</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Institutional Positioning ─────────────────────────────── */}
        <TabsContent value="institutional" className="data-[state=inactive]:hidden mt-4 space-y-4">
          {/* COT Report */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                COT Report — Commitment of Traders (Net Positions)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Legend */}
              <div className="flex gap-4 text-xs">
                {[
                  { color: "#10b981", label: "Commercial (long)" },
                  { color: "#ef4444", label: "Commercial (short)" },
                  { color: "#3b82f6", label: "Non-Comm (long)" },
                  { color: "#f59e0b", label: "Non-Comm (short)" },
                  { color: "#8b5cf6", label: "Small Specs" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ background: l.color }} />
                    <span className="text-slate-600">{l.label}</span>
                  </span>
                ))}
              </div>
              {cotData.map((entry) => (
                <CotBar key={entry.label} entry={entry} />
              ))}
              <div className="text-[11px] text-slate-600 mt-2">
                Commercial hedgers (smart money) are typically contrarian. Non-commercial speculators
                follow trends. Small specs are often wrong at extremes.
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Dark Pool */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">
                  Simulated Institutional Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="grid grid-cols-3 text-xs text-slate-600 pb-1 border-b border-slate-800">
                    <span>Ticker</span>
                    <span className="text-right">Dark Pool %</span>
                    <span className="text-right">Vol (M)</span>
                  </div>
                  {darkPoolData.map((d) => (
                    <div key={d.ticker} className="grid grid-cols-3 text-xs py-0.5 items-center">
                      <span className="font-mono font-bold text-slate-200">{d.ticker}</span>
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded overflow-hidden">
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${d.darkPct}%`,
                              background: d.darkPct > 45 ? "#ef4444" : d.darkPct > 35 ? "#f97316" : "#3b82f6",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            color: d.darkPct > 45 ? "#f97316" : "#94a3b8",
                          }}
                        >
                          {d.darkPct}%
                        </span>
                      </div>
                      <span className="text-right text-slate-500">{d.volume}M</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-slate-600 mt-2">
                  Dark pool % {">"} 45% may indicate large institutional accumulation/distribution
                </div>
              </CardContent>
            </Card>

            {/* Insider + 13F */}
            <div className="space-y-4">
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300">
                    Insider Buying/Selling (30-day)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex h-6 rounded overflow-hidden">
                    <div
                      className="flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        width: `${(insiderRatio.buying / (insiderRatio.buying + insiderRatio.selling)) * 100}%`,
                        background: "#22c55e",
                      }}
                    >
                      Buy {insiderRatio.buying}%
                    </div>
                    <div
                      className="flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        width: `${(insiderRatio.selling / (insiderRatio.buying + insiderRatio.selling)) * 100}%`,
                        background: "#ef4444",
                      }}
                    >
                      Sell {insiderRatio.selling}%
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Buy/Sell ratio: {(insiderRatio.buying / insiderRatio.selling).toFixed(2)}x — insiders selling more than buying
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300">
                    13F Positioning Changes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {hedgeFundMoves.map((m) => (
                      <div key={m.fund} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 w-28 flex-shrink-0">{m.fund}</span>
                        <span className="font-mono font-bold text-slate-200">{m.ticker}</span>
                        <Badge
                          className={cn(
                            "text-[11px] py-0",
                            m.action === "Added"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                              : "bg-red-500/15 text-red-400 border-red-500/25",
                          )}
                        >
                          {m.action}
                        </Badge>
                        <span
                          className={cn(
                            "font-mono text-right w-16",
                            m.pctChg >= 0 ? "text-emerald-400" : "text-red-400",
                          )}
                        >
                          {m.pctChg >= 0 ? "+" : ""}
                          {m.pctChg}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 5: Behavioral Signals ─────────────────────────────────────── */}
        <TabsContent value="behavioral" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Google Trends proxy */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-400" />
                  Search Interest: "stock market crash" (52 weeks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <svg width="100%" viewBox="0 0 400 90" className="overflow-visible">
                  <defs>
                    <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const w = 400;
                    const h = 90;
                    const padX = 6;
                    const padY = 8;
                    const min = Math.min(...googleTrends);
                    const max = Math.max(...googleTrends);
                    const range = max - min || 1;
                    const pts = googleTrends.map((v, i) => {
                      const x = padX + (i / (googleTrends.length - 1)) * (w - padX * 2);
                      const y = padY + (1 - (v - min) / range) * (h - padY * 2);
                      return { x, y };
                    });
                    const polyStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
                    const fillStr =
                      `M ${pts[0].x},${h} ` +
                      pts.map((p) => `L ${p.x},${p.y}`).join(" ") +
                      ` L ${pts[pts.length - 1].x},${h} Z`;
                    return (
                      <>
                        <path d={fillStr} fill="url(#trend-grad)" />
                        <polyline points={polyStr} fill="none" stroke="#ef4444" strokeWidth={1.6} strokeLinejoin="round" />
                      </>
                    );
                  })()}
                </svg>
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>52 weeks ago</span>
                  <span>Today</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Spikes in "stock market crash" searches correlate with panic bottoms — contrarian bullish signal
                </div>
              </CardContent>
            </Card>

            {/* Market Cycle Clock */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-violet-400" />
                  Psychological Market Cycle
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-2">
                <MarketCycleClock currentStage={5} />
                <div className="text-[11px] text-slate-500 text-center">
                  Market currently in{" "}
                  <span className="text-amber-400 font-semibold">Anxiety</span>{" "}
                  phase — early signs of complacency eroding, smart money distributing
                </div>
              </CardContent>
            </Card>

            {/* Social media sentiment */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  Social Sentiment Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {socialTickers.map((s) => (
                  <div key={s.ticker} className="space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono font-bold text-slate-300 w-12">{s.ticker}</span>
                      <span className="text-slate-600">{s.mentions.toLocaleString()} mentions</span>
                      <div className="flex gap-2">
                        <span className="text-emerald-400">{s.bull}% bull</span>
                        <span className="text-red-400">{s.bear}% bear</span>
                      </div>
                    </div>
                    <div className="flex h-2 rounded overflow-hidden">
                      <div
                        className="bg-emerald-500 rounded-l"
                        style={{ width: `${s.bull}%` }}
                      />
                      <div
                        className="bg-red-500 rounded-r"
                        style={{ width: `${s.bear}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Margin Debt */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">
                  Margin Debt vs S&P 500 (36 months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <svg width="100%" viewBox="0 0 400 100" className="overflow-visible">
                  {(() => {
                    const w = 400;
                    const h = 100;
                    const padX = 8;
                    const padY = 10;
                    const { ptA, ptB } = dualPolyline(marginDebt, marginSp, w, h, padX, padY);
                    return (
                      <>
                        <polyline points={ptA} fill="none" stroke="#f97316" strokeWidth={2} strokeLinejoin="round" />
                        <polyline points={ptB} fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeLinejoin="round" strokeDasharray="4 2" />
                      </>
                    );
                  })()}
                </svg>
                <div className="flex gap-4 mt-1 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-orange-400 inline-block" />
                    Margin Debt (% mkt cap)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-blue-400 inline-block" style={{ borderTopStyle: "dashed", borderTopWidth: 1 }} />
                    S&P 500
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Elevated margin debt amplifies both upside and downside volatility. Watch for rapid deleveraging events.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investor Survey */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-emerald-400" />
                Investor Survey Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {surveyQuestions.map((q) => (
                <div key={q.question} className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] text-slate-400">{q.question}</span>
                    <div className="flex gap-2 text-xs flex-shrink-0 ml-4">
                      <span className="text-emerald-400">{q.agree}% agree</span>
                      <span className="text-red-400">{q.disagree}% disagree</span>
                    </div>
                  </div>
                  <div className="flex h-3 rounded overflow-hidden gap-0.5">
                    <div
                      className="bg-emerald-500 rounded-l flex items-center justify-center text-[8px] text-white font-bold"
                      style={{ width: `${q.agree}%` }}
                    >
                      {q.agree > 15 ? `${q.agree}%` : ""}
                    </div>
                    <div
                      className="bg-slate-600 flex items-center justify-center text-[8px] text-white"
                      style={{ width: `${q.neutral}%` }}
                    >
                      {q.neutral > 10 ? `${q.neutral}%` : ""}
                    </div>
                    <div
                      className="bg-red-500 rounded-r flex items-center justify-center text-[8px] text-white font-bold"
                      style={{ width: `${q.disagree}%` }}
                    >
                      {q.disagree > 15 ? `${q.disagree}%` : ""}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 text-xs pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />
                  Agree
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-slate-600 inline-block" />
                  Neutral
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />
                  Disagree
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
