"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  BarChart3,
  Globe,
  Home,
  Briefcase,
  DollarSign,
  Activity,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── mulberry32 seeded PRNG (seed=2468) ────────────────────────────────────────

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

const rng = mulberry32(2468);

// ── Shared helpers ────────────────────────────────────────────────────────────

function genSeries(n: number, base: number, vol: number, drift = 0): number[] {
  const out: number[] = [base];
  for (let i = 1; i < n; i++) {
    out.push(Math.round((out[i - 1] + (rng() - 0.5) * vol + drift) * 100) / 100);
  }
  return out;
}

function polyline(xs: number[], ys: number[], W: number, H: number, pad = 8): string {
  if (xs.length === 0) return "";
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rngX = maxX - minX || 1;
  const rngY = maxY - minY || 1;
  return xs
    .map((x, i) => {
      const px = pad + ((x - minX) / rngX) * (W - pad * 2);
      const py = H - pad - ((ys[i] - minY) / rngY) * (H - pad * 2);
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(" ");
}

function scaleY(val: number, minY: number, maxY: number, H: number, pad: number) {
  return H - pad - ((val - minY) / (maxY - minY || 1)) * (H - pad * 2);
}
function scaleX(i: number, n: number, W: number, pad: number) {
  return pad + (i / (n - 1)) * (W - pad * 2);
}

const QUARTERS = ["Q4'20","Q1'21","Q2'21","Q3'21","Q4'21","Q1'22","Q2'22","Q3'22","Q4'22","Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24","Q1'25","Q2'25","Q3'25"] as const;
const MONTHS_12 = ["Mar'25","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'26","Feb","Mar"];
const MONTHS_24 = Array.from({ length: 24 }, (_, i) => {
  const d = new Date(2024, i - 12, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
});

// ── GDP data ──────────────────────────────────────────────────────────────────

const GDP_GROWTH = [2.1, 6.4, 6.7, 2.3, 6.9, -1.6, -0.6, 3.2, 2.6, 2.2, 2.1, 4.9, 3.4, 1.4, 3.0, 2.8, 2.4, 2.4, 2.7, 2.6];
const RECESSION_QUARTERS = [5, 6]; // Q1'22, Q2'22

const GDP_COMPONENTS = [
  { label: "Consumption (C)", pct: 69, color: "#6366f1" },
  { label: "Investment (I)",  pct: 18, color: "#10b981" },
  { label: "Government (G)", pct: 17, color: "#f59e0b" },
  { label: "Net Exports (NX)", pct: -4, color: "#ef4444" },
];

const INTL_GDP = [
  { country: "United States",  gdp: 27360 },
  { country: "China",          gdp: 19370 },
  { country: "Germany",        gdp: 4460  },
  { country: "Japan",          gdp: 4210  },
  { country: "India",          gdp: 3730  },
  { country: "UK",             gdp: 3090  },
  { country: "France",         gdp: 3010  },
  { country: "Brazil",         gdp: 2330  },
  { country: "Italy",          gdp: 2190  },
  { country: "Canada",         gdp: 2140  },
];

const LEADING_INDICATORS = [
  { name: "ISM PMI",         value: 52.4, signal: "expansion", desc: "Manufacturing activity expanding — reading above 50 indicates growth" },
  { name: "Housing Permits", value: 1.52, unit: "M", signal: "neutral", desc: "Monthly annualized; below 1.6M suggests moderation in construction" },
  { name: "Yield Curve",     value: 0.18, unit: "%", signal: "expansion", desc: "10Y−2Y spread; positive after inversion — historically precedes recovery" },
  { name: "Consumer Conf.",  value: 104.7, signal: "neutral", desc: "Conference Board index; readings above 100 reflect above-average optimism" },
];

// ── Inflation data ────────────────────────────────────────────────────────────

const INFLATION_GAUGES = [
  { label: "CPI",      value: 3.2, prev: 3.5, color: "#6366f1", target: 2.0 },
  { label: "Core CPI", value: 2.8, prev: 3.1, color: "#10b981", target: 2.0 },
  { label: "PCE",      value: 2.5, prev: 2.7, color: "#f59e0b", target: 2.0 },
  { label: "PPI",      value: 1.9, prev: 2.3, color: "#ef4444", target: 2.0 },
];

const CPI_COMPONENTS = [
  { label: "Housing",        pct: 34, color: "#6366f1" },
  { label: "Transportation", pct: 16, color: "#10b981" },
  { label: "Food",           pct: 14, color: "#f59e0b" },
  { label: "Medical",        pct: 7,  color: "#3b82f6" },
  { label: "Energy",         pct: 6,  color: "#ef4444" },
  { label: "Other",          pct: 23, color: "#8b5cf6" },
];

// Historical CPI: 10 years monthly → 120 pts, we use 60 quarterly approx
const HIST_CPI = [1.8,2.0,1.9,2.1,2.3,1.7,1.4,1.3,1.2,1.6,2.6,4.2,5.4,7.0,8.3,9.1,8.0,6.5,5.0,4.0,3.2,3.7,3.2,2.8,2.5];
const HIST_CPI_LABELS = HIST_CPI.map((_, i) => {
  const d = new Date(2021, i * 2, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
});

const BREAKEVEN_5Y  = 2.31;
const BREAKEVEN_10Y = 2.18;
const FED_RATE      = 4.25;

// ── Labor market data ─────────────────────────────────────────────────────────

const PAYROLLS_6M = [256, 189, 303, 147, 212, 228]; // last 6 months
const PAYROLLS_LABELS = ["Oct","Nov","Dec","Jan","Feb","Mar"];

const JOLTS_DATA = [
  { label: "Job Openings", value: 8.76, unit: "M", series: genSeries(12, 8.5, 0.4, 0.02) },
  { label: "Hires",        value: 5.62, unit: "M", series: genSeries(12, 5.8, 0.3, -0.01) },
  { label: "Quits Rate",   value: 2.2,  unit: "%", series: genSeries(12, 2.4, 0.15, -0.02) },
  { label: "Layoffs",      value: 1.78, unit: "M", series: genSeries(12, 1.6, 0.2, 0.01) },
];

// Beveridge curve: [unemployment%, job_openings_rate%]
const BEVERIDGE = [
  [3.5, 7.2],[3.6, 6.9],[3.7, 6.5],[3.8, 6.1],[3.9, 5.8],[4.0, 5.5],
  [4.2, 5.2],[4.5, 4.9],[4.1, 5.1],[3.8, 5.7],[3.9, 5.6],
];

// Sahm rule: 3m avg unemployment vs 12m low
const SAHM_SERIES = genSeries(24, 0.1, 0.08, 0.005).map(v => Math.max(0, v));
const SAHM_CURRENT = SAHM_SERIES[SAHM_SERIES.length - 1];

// ── Housing & Credit data ─────────────────────────────────────────────────────

const HOUSING_STATS = [
  { label: "Case-Shiller HPI",    value: "324.2",  chg: "+5.2%", up: true  },
  { label: "30Y Mortgage Rate",   value: "6.82%",  chg: "-0.14%", up: false },
  { label: "Housing Starts",      value: "1.48M",  chg: "+2.1%", up: true  },
  { label: "Building Permits",    value: "1.52M",  chg: "+1.4%", up: true  },
  { label: "Existing Home Sales", value: "4.26M",  chg: "+3.8%", up: true  },
  { label: "New Home Sales",      value: "672K",   chg: "+4.2%", up: true  },
];

const MORTGAGE_RATE = genSeries(60, 3.0, 0.3, 0.06).map((v, i) => Math.min(8.0, v + (i > 20 ? (i - 20) * 0.05 : 0)));
const HPI_INDEX     = genSeries(60, 240, 8, 1.4);

const CREDIT_STATS = [
  { label: "Consumer Credit Growth",    value: "4.2%",  color: "#6366f1" },
  { label: "Auto Loan Delinquencies",   value: "2.8%",  color: "#f59e0b" },
  { label: "CC Delinquencies",          value: "3.1%",  color: "#ef4444" },
  { label: "Charge-Off Rates",          value: "3.6%",  color: "#ec4899" },
];

// Senior Loan Officer survey: % tightening (last 8 quarters)
const SLOS_DATA = [12, 28, 41, 55, 62, 48, 34, 21];
const SLOS_LABELS = ["Q3'24","Q4'24","Q1'25","Q2'25","Q3'25","Q4'25","Q1'26","Q2'26"];

// ── Global indicators data ────────────────────────────────────────────────────

const PMI_COUNTRIES = [
  "United States","Germany","France","Japan","China","UK","India",
  "Canada","Australia","South Korea","Brazil","Italy","Mexico","Spain","Taiwan",
];

// Generate PMI values seeded deterministically
const PMI_VALUES: Record<string, { composite: number; manufacturing: number; services: number }> = {};
PMI_COUNTRIES.forEach((c) => {
  PMI_VALUES[c] = {
    composite:     Math.round((46 + rng() * 12) * 10) / 10,
    manufacturing: Math.round((44 + rng() * 14) * 10) / 10,
    services:      Math.round((47 + rng() * 12) * 10) / 10,
  };
});
// Fix US to look reasonable
PMI_VALUES["United States"] = { composite: 52.4, manufacturing: 50.9, services: 53.5 };
PMI_VALUES["India"]         = { composite: 58.2, manufacturing: 56.4, services: 59.1 };
PMI_VALUES["Germany"]       = { composite: 47.3, manufacturing: 44.1, services: 49.2 };

const TRADE_PARTNERS = [
  { name: "China",  deficit: -295, color: "#ef4444" },
  { name: "EU",     deficit: -212, color: "#f59e0b" },
  { name: "Mexico", deficit: -171, color: "#6366f1" },
  { name: "Canada", deficit:  -63, color: "#10b981" },
  { name: "Japan",  deficit:  -68, color: "#3b82f6" },
];

const DXY_SERIES  = genSeries(60, 98, 1.5, 0.04);
const COMMODITY_SERIES = genSeries(60, 115, 3.0, -0.03);

const CYCLE_REGIONS = [
  { region: "United States", status: "Expansion",   color: "#10b981" },
  { region: "Eurozone",      status: "Contraction",  color: "#ef4444" },
  { region: "China",         status: "Recovery",     color: "#f59e0b" },
  { region: "Japan",         status: "Stagnation",   color: "#8b5cf6" },
  { region: "UK",            status: "Expansion",    color: "#10b981" },
  { region: "India",         status: "Expansion",    color: "#10b981" },
  { region: "Brazil",        status: "Recovery",     color: "#f59e0b" },
  { region: "Canada",        status: "Neutral",      color: "#6366f1" },
];

// ── SVG Chart Components ──────────────────────────────────────────────────────

function LineChart({
  data,
  labels,
  color = "#6366f1",
  W = 600,
  H = 140,
  pad = 28,
  targetLine,
  annotations,
  recessionBars,
  secondSeries,
  secondColor = "#f59e0b",
}: {
  data: number[];
  labels?: string[];
  color?: string;
  W?: number;
  H?: number;
  pad?: number;
  targetLine?: number;
  annotations?: { idx: number; label: string; color?: string }[];
  recessionBars?: number[];
  secondSeries?: number[];
  secondColor?: string;
}) {
  const n = data.length;
  const allVals = secondSeries ? [...data, ...secondSeries] : data;
  if (targetLine !== undefined) allVals.push(targetLine);
  const minY = Math.min(...allVals) - Math.abs(Math.min(...allVals)) * 0.05 - 0.5;
  const maxY = Math.max(...allVals) + Math.abs(Math.max(...allVals)) * 0.05 + 0.5;

  const pts = data.map((v, i) => ({
    x: scaleX(i, n, W, pad),
    y: scaleY(v, minY, maxY, H, pad),
  }));

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillPath = `${path} L${pts[pts.length - 1].x.toFixed(1)},${(H - pad).toFixed(1)} L${pts[0].x.toFixed(1)},${(H - pad).toFixed(1)} Z`;

  const pts2 = secondSeries?.map((v, i) => ({
    x: scaleX(i, secondSeries.length, W, pad),
    y: scaleY(v, minY, maxY, H, pad),
  }));
  const path2 = pts2?.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const targetY = targetLine !== undefined ? scaleY(targetLine, minY, maxY, H, pad) : null;

  // Y axis labels
  const yTicks = [minY, (minY + maxY) / 2, maxY].map(v => Math.round(v * 10) / 10);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      {/* Recession shading */}
      {recessionBars?.map((qi) => {
        const x1 = scaleX(qi, n, W, pad);
        const x2 = scaleX(qi + 1, n, W, pad);
        return (
          <rect key={qi} x={x1} y={pad} width={x2 - x1} height={H - pad * 2}
            fill="#ef4444" fillOpacity={0.08} />
        );
      })}
      {/* Grid lines */}
      {yTicks.map((v, i) => {
        const y = scaleY(v, minY, maxY, H, pad);
        return (
          <g key={i}>
            <line x1={pad} y1={y} x2={W - pad} y2={y} stroke="#ffffff10" strokeWidth={1} />
            <text x={pad - 4} y={y + 4} fontSize={9} fill="#6b7280" textAnchor="end">{v}</text>
          </g>
        );
      })}
      {/* Target line */}
      {targetY !== null && (
        <line x1={pad} y1={targetY!} x2={W - pad} y2={targetY!}
          stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" />
      )}
      {/* Area fill */}
      <path d={fillPath} fill={color} fillOpacity={0.08} />
      {/* Line */}
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Second series */}
      {path2 && (
        <path d={path2} fill="none" stroke={secondColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3" />
      )}
      {/* Annotations */}
      {annotations?.map((a) => {
        const x = scaleX(a.idx, n, W, pad);
        const y = scaleY(data[a.idx], minY, maxY, H, pad);
        return (
          <g key={a.idx}>
            <line x1={x} y1={pad} x2={x} y2={H - pad} stroke={a.color ?? "#6b7280"} strokeWidth={1} strokeDasharray="3 2" />
            <text x={x + 3} y={pad + 10} fontSize={8} fill={a.color ?? "#9ca3af"}>{a.label}</text>
            <circle cx={x} cy={y} r={3} fill={a.color ?? color} />
          </g>
        );
      })}
      {/* X labels */}
      {labels && labels.map((l, i) => {
        if (i % Math.max(1, Math.floor(n / 6)) !== 0) return null;
        return (
          <text key={i} x={scaleX(i, n, W, pad)} y={H - 2} fontSize={8} fill="#6b7280" textAnchor="middle">{l}</text>
        );
      })}
    </svg>
  );
}

function BarChartSVG({
  data,
  labels,
  color = "#6366f1",
  W = 400,
  H = 120,
  pad = 20,
  horizontal = false,
  showValues = false,
  targetLine,
}: {
  data: number[];
  labels?: string[];
  color?: string | string[];
  W?: number;
  H?: number;
  pad?: number;
  horizontal?: boolean;
  showValues?: boolean;
  targetLine?: number;
}) {
  const n = data.length;
  const absData = data.map(Math.abs);
  const maxV = Math.max(...absData);
  const colors = Array.isArray(color) ? color : Array(n).fill(color);

  if (horizontal) {
    const barH = (H - pad * 2) / n - 4;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
        {data.map((v, i) => {
          const barW = (Math.abs(v) / maxV) * (W - pad * 2 - 60);
          const y = pad + i * ((H - pad * 2) / n);
          return (
            <g key={i}>
              <rect x={pad + 60} y={y + 1} width={barW} height={barH} rx={3} fill={colors[i]} fillOpacity={0.85} />
              {labels && <text x={pad + 56} y={y + barH / 2 + 4} fontSize={9} fill="#9ca3af" textAnchor="end">{labels[i]}</text>}
              {showValues && <text x={pad + 60 + barW + 4} y={y + barH / 2 + 4} fontSize={9} fill="#e5e7eb">{v}B</text>}
            </g>
          );
        })}
      </svg>
    );
  }

  const barW = (W - pad * 2) / n - 4;
  const minV = Math.min(...data);
  const maxV2 = Math.max(...data);
  const range = maxV2 - minV || 1;
  const zeroY = H - pad - ((0 - minV) / range) * (H - pad * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      {targetLine !== undefined && (
        <line x1={pad} y1={scaleY(targetLine, minV, maxV2, H, pad)} x2={W - pad} y2={scaleY(targetLine, minV, maxV2, H, pad)}
          stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" />
      )}
      <line x1={pad} y1={zeroY} x2={W - pad} y2={zeroY} stroke="#ffffff20" strokeWidth={1} />
      {data.map((v, i) => {
        const x = pad + i * ((W - pad * 2) / n) + 2;
        const barH = Math.abs(((v - 0) / range) * (H - pad * 2));
        const y = v >= 0 ? zeroY - barH : zeroY;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={2} fill={colors[i]} fillOpacity={0.85} />
            {showValues && (
              <text x={x + barW / 2} y={v >= 0 ? y - 3 : y + barH + 10} fontSize={9} fill="#e5e7eb" textAnchor="middle">{v}</text>
            )}
            {labels && (
              <text x={x + barW / 2} y={H - 2} fontSize={8} fill="#6b7280" textAnchor="middle">{labels[i]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({
  segments,
  size = 160,
}: {
  segments: { label: string; pct: number; color: string }[];
  size?: number;
}) {
  const posSegs = segments.filter(s => s.pct > 0);
  const total = posSegs.reduce((s, seg) => s + seg.pct, 0);
  const cx = size / 2, cy = size / 2, r = size * 0.38, ir = size * 0.24;
  let angle = -90;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      {posSegs.map((seg) => {
        const sweep = (seg.pct / total) * 360;
        const startAngle = (angle * Math.PI) / 180;
        const endAngle = ((angle + sweep) * Math.PI) / 180;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const ix1 = cx + ir * Math.cos(startAngle);
        const iy1 = cy + ir * Math.sin(startAngle);
        const ix2 = cx + ir * Math.cos(endAngle);
        const iy2 = cy + ir * Math.sin(endAngle);
        const large = sweep > 180 ? 1 : 0;
        const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${ix2.toFixed(2)} ${iy2.toFixed(2)} A ${ir} ${ir} 0 ${large} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`;
        const midAngle = ((angle + sweep / 2) * Math.PI) / 180;
        angle += sweep;
        return (
          <g key={seg.label}>
            <path d={d} fill={seg.color} fillOpacity={0.85} stroke="#111827" strokeWidth={1.5} />
            {sweep > 20 && (
              <text
                x={(cx + (r + ir) / 2 * Math.cos(midAngle)).toFixed(1)}
                y={(cy + (r + ir) / 2 * Math.sin(midAngle) + 3).toFixed(1)}
                fontSize={10} fill="#fff" textAnchor="middle" fontWeight="600">
                {seg.pct}%
              </text>
            )}
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={ir - 2} fill="#111827" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fill="#9ca3af">GDP</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill="#6b7280">Mix</text>
    </svg>
  );
}

function ArcGauge({
  value,
  min = 0,
  max = 10,
  color = "#6366f1",
  label,
  unit = "%",
  target,
}: {
  value: number;
  min?: number;
  max?: number;
  color: string;
  label: string;
  unit?: string;
  target?: number;
}) {
  const W = 120, H = 80;
  const cx = W / 2, cy = H - 10;
  const r = 50;
  const startAngle = Math.PI;
  const endAngle = 0;
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const sweepAngle = Math.PI * pct;
  const angle = startAngle - sweepAngle;
  const ex = cx + r * Math.cos(angle);
  const ey = cy + r * Math.sin(angle);
  const bgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const fgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;

  let targetX: number | null = null, targetY: number | null = null;
  if (target !== undefined) {
    const tp = (target - min) / (max - min);
    const ta = startAngle - Math.PI * tp;
    targetX = cx + r * Math.cos(ta);
    targetY = cy + r * Math.sin(ta);
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <path d={bgPath} fill="none" stroke="#1f2937" strokeWidth={10} strokeLinecap="round" />
        <path d={fgPath} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
        {targetX !== null && (
          <circle cx={targetX!} cy={targetY!} r={4} fill="#ef4444" />
        )}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize={18} fontWeight="bold" fill="#f9fafb">{value}{unit}</text>
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fill="#9ca3af">{label}</text>
      </svg>
    </div>
  );
}

function Sparkline({ data, color = "#6366f1", W = 80, H = 30 }: { data: number[]; color?: string; W?: number; H?: number }) {
  const n = data.length;
  const minY = Math.min(...data), maxY = Math.max(...data);
  const pts = data.map((v, i) => ({
    x: (i / (n - 1)) * W,
    y: H - ((v - minY) / (maxY - minY || 1)) * H,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const up = data[data.length - 1] >= data[0];
  const c = color === "auto" ? (up ? "#10b981" : "#ef4444") : color;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <path d={path} fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function ScatterPlot({
  points,
  W = 300,
  H = 200,
  pad = 28,
  xLabel,
  yLabel,
  color = "#6366f1",
  highlightLast = true,
}: {
  points: [number, number][];
  W?: number;
  H?: number;
  pad?: number;
  xLabel?: string;
  yLabel?: string;
  color?: string;
  highlightLast?: boolean;
}) {
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const sx = (v: number) => pad + ((v - minX) / (maxX - minX || 1)) * (W - pad * 2);
  const sy = (v: number) => H - pad - ((v - minY) / (maxY - minY || 1)) * (H - pad * 2);

  // Simple regression line
  const n = points.length;
  const meanX = xs.reduce((a, b) => a + b) / n;
  const meanY = ys.reduce((a, b) => a + b) / n;
  const slope = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0) /
                xs.reduce((s, x) => s + (x - meanX) ** 2, 0);
  const intercept = meanY - slope * meanX;
  const regX1 = minX, regY1 = slope * regX1 + intercept;
  const regX2 = maxX, regY2 = slope * regX2 + intercept;

  const xTicks = [minX, (minX + maxX) / 2, maxX].map(v => Math.round(v * 10) / 10);
  const yTicks = [minY, (minY + maxY) / 2, maxY].map(v => Math.round(v * 10) / 10);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={pad} y1={sy(v)} x2={W - pad} y2={sy(v)} stroke="#ffffff08" strokeWidth={1} />
          <text x={pad - 3} y={sy(v) + 3} fontSize={8} fill="#6b7280" textAnchor="end">{v}</text>
        </g>
      ))}
      {xTicks.map((v, i) => (
        <text key={i} x={sx(v)} y={H - 2} fontSize={8} fill="#6b7280" textAnchor="middle">{v}</text>
      ))}
      {/* Regression line */}
      <line x1={sx(regX1)} y1={sy(regY1)} x2={sx(regX2)} y2={sy(regY2)}
        stroke={color} strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.5} />
      {/* Points */}
      {points.map(([x, y], i) => (
        <circle key={i} cx={sx(x)} cy={sy(y)} r={highlightLast && i === points.length - 1 ? 6 : 4}
          fill={highlightLast && i === points.length - 1 ? "#f59e0b" : color}
          fillOpacity={0.8} stroke="#111827" strokeWidth={1} />
      ))}
      {xLabel && <text x={W / 2} y={H} fontSize={9} fill="#9ca3af" textAnchor="middle">{xLabel}</text>}
      {yLabel && <text x={8} y={H / 2} fontSize={9} fill="#9ca3af" textAnchor="middle"
        transform={`rotate(-90,8,${H / 2})`}>{yLabel}</text>}
    </svg>
  );
}

// ── Small reusable widgets ────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  chg,
  up,
}: {
  label: string;
  value: string;
  chg?: string;
  up?: boolean;
}) {
  return (
    <div className="bg-gray-900 border border-white/8 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-100">{value}</p>
      {chg !== undefined && (
        <div className={cn("flex items-center gap-1 text-xs font-medium", up ? "text-emerald-400" : "text-red-400")}>
          {up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {chg}
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("bg-gray-900/60 border border-white/8 rounded-2xl p-5", className)}
    >
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

function TrendArrow({ value, prev }: { value: number; prev: number }) {
  const up = value < prev;
  if (value === prev) return <Minus className="w-3.5 h-3.5 text-gray-500" />;
  return up
    ? <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
    : <TrendingUp className="w-3.5 h-3.5 text-red-400" />;
}

function PmiBadge({ val }: { val: number }) {
  const color = val >= 52 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    : val >= 50 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : val >= 48 ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
    : "bg-red-500/15 text-red-400 border-red-500/25";
  return (
    <span className={cn("inline-block px-1.5 py-0.5 rounded text-xs font-mono border", color)}>
      {val.toFixed(1)}
    </span>
  );
}

// ── TAB 1: GDP & Growth ───────────────────────────────────────────────────────

function GdpTab() {
  const [showNominal, setShowNominal] = useState(true);
  const inflationAdj = GDP_GROWTH.map((v, i) => Math.round((v - 2.1 + (rng() - 0.5) * 0.3) * 10) / 10);

  return (
    <div className="space-y-5">
      {/* GDP Nowcast widget */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3 sm:col-span-1 bg-gradient-to-br from-indigo-600/20 to-indigo-900/10 border border-indigo-500/20 rounded-2xl p-5">
          <p className="text-xs text-indigo-400 font-medium mb-1">GDP Nowcast — Q1 2026</p>
          <p className="text-4xl font-bold text-indigo-300">2.4%</p>
          <p className="text-xs text-gray-400 mt-1">Annualized real growth rate</p>
          <div className="mt-3 bg-gray-800/60 rounded-lg p-3 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Confidence band</span>
              <span className="text-gray-300">±0.8pp</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 relative">
              <div className="absolute left-[30%] right-[30%] h-2 bg-indigo-500/40 rounded-full" />
              <div className="absolute left-[49%] w-0.5 h-2 bg-indigo-400" />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>1.6%</span><span>2.4%</span><span>3.2%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Composite of Atlanta Fed, NY Fed, St. Louis Fed nowcasts</p>
        </div>

        <div className="col-span-3 sm:col-span-2 grid grid-cols-2 gap-3">
          {[
            { l: "Real GDP (2025)", v: "$23.7T", d: "+2.4% YoY", u: true },
            { l: "Nominal GDP",     v: "$28.8T", d: "+5.1% YoY", u: true },
            { l: "GDP per Capita",  v: "$68,400", d: "+1.8% YoY", u: true },
            { l: "Debt / GDP",      v: "122%",   d: "+3.2pp YoY", u: false },
          ].map(({ l, v, d, u }) => (
            <StatChip key={l} label={l} value={v} chg={d} up={u} />
          ))}
        </div>
      </div>

      {/* GDP Components Donut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard title="GDP Components Breakdown">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-36 h-36 flex-shrink-0">
              <DonutChart segments={GDP_COMPONENTS} size={144} />
            </div>
            <div className="flex flex-col gap-2 flex-1 w-full">
              {GDP_COMPONENTS.map(c => (
                <div key={c.label} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-gray-400 flex-1">{c.label}</span>
                  <span className={cn("font-mono font-semibold text-xs", c.pct < 0 ? "text-red-400" : "text-gray-200")}>
                    {c.pct > 0 ? "+" : ""}{c.pct}%
                  </span>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-1 pt-2 border-t border-white/5">
                Note: NX is negative — the US runs a trade deficit, effectively reducing GDP relative to a balanced trade scenario.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Real vs Nominal GDP toggle */}
        <SectionCard title="Real vs Nominal GDP Growth">
          <div className="flex gap-2 mb-3">
            {["Real", "Nominal"].map(lbl => (
              <button key={lbl}
                onClick={() => setShowNominal(lbl === "Nominal")}
                className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  (lbl === "Nominal") === showNominal
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-gray-200"
                )}>
                {lbl}
              </button>
            ))}
          </div>
          <div className="h-[120px]">
            <LineChart
              data={showNominal ? GDP_GROWTH.map(v => v + 2.5) : inflationAdj}
              labels={QUARTERS as unknown as string[]}
              color={showNominal ? "#f59e0b" : "#6366f1"}
              H={120}
              pad={24}
              targetLine={2.0}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {showNominal
              ? "Nominal GDP includes inflation. Real GDP = Nominal − GDP Deflator."
              : "Real GDP removes the effect of price changes, showing true economic output growth."}
          </p>
        </SectionCard>
      </div>

      {/* Historical GDP growth line chart */}
      <SectionCard title="Historical GDP Growth Rate — Quarterly (20Q)">
        <div className="h-[150px]">
          <LineChart
            data={GDP_GROWTH}
            labels={QUARTERS as unknown as string[]}
            color="#6366f1"
            H={150}
            pad={28}
            recessionBars={RECESSION_QUARTERS}
            targetLine={0}
            annotations={[
              { idx: 1,  label: "Reopening",  color: "#10b981" },
              { idx: 4,  label: "Omicron",    color: "#f59e0b" },
              { idx: 5,  label: "Neg",        color: "#ef4444" },
              { idx: 13, label: "Rate pause", color: "#8b5cf6" },
            ]}
          />
        </div>
        <div className="flex gap-3 mt-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-6 h-2 rounded bg-red-500/20 inline-block" /> Recession period
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-6 h-0.5 rounded bg-red-500 inline-block border-dashed" /> Zero line
          </div>
        </div>
      </SectionCard>

      {/* International GDP comparison */}
      <SectionCard title="International GDP Comparison — Top 10 Economies (PPP, $B)">
        <div className="space-y-2">
          {INTL_GDP.map((c, i) => (
            <div key={c.country} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-5 text-right">{i + 1}</span>
              <span className="text-sm text-gray-300 w-36 truncate">{c.country}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${(c.gdp / INTL_GDP[0].gdp) * 100}%`,
                    background: i === 0 ? "#6366f1" : "#374151",
                  }}
                />
              </div>
              <span className="text-xs font-mono text-gray-400 w-16 text-right">${c.gdp.toLocaleString()}B</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Leading indicators */}
      <SectionCard title="Leading Indicators for GDP">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LEADING_INDICATORS.map(li => (
            <div key={li.name} className="bg-gray-800/60 border border-white/5 rounded-xl p-3.5">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-semibold text-gray-200">{li.name}</span>
                <Badge className={cn("text-xs",
                  li.signal === "expansion" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                  li.signal === "neutral"   ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                                              "bg-red-500/20 text-red-300 border-red-500/30")}>
                  {li.signal}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-100">{li.value}{li.unit ?? ""}</p>
              <p className="text-xs text-gray-500 mt-1">{li.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ── TAB 2: Inflation ──────────────────────────────────────────────────────────

function InflationTab() {
  return (
    <div className="space-y-5">
      {/* 4 arc gauges */}
      <SectionCard title="Inflation Gauges — Current Reading vs Fed 2% Target">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {INFLATION_GAUGES.map(g => (
            <div key={g.label} className="flex flex-col items-center bg-gray-800/40 rounded-xl py-4">
              <ArcGauge value={g.value} min={0} max={10} color={g.color} label={g.label} unit="%" target={g.target} />
              <div className="flex items-center gap-1.5 mt-1">
                <TrendArrow value={g.value} prev={g.prev} />
                <span className={cn("text-xs font-medium",
                  g.value < g.prev ? "text-emerald-400" : "text-red-400")}>
                  {g.value < g.prev ? "↓" : "↑"} from {g.prev}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          Red dot on gauge = Fed 2% target
        </div>
      </SectionCard>

      {/* CPI component stacked bar */}
      <SectionCard title="CPI Component Breakdown — % Weight in Basket">
        <div className="flex h-8 rounded-lg overflow-hidden w-full mb-3">
          {CPI_COMPONENTS.map(c => (
            <div
              key={c.label}
              style={{ width: `${c.pct}%`, background: c.color }}
              className="flex items-center justify-center"
            >
              {c.pct >= 10 && (
                <span className="text-white text-xs font-bold">{c.pct}%</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {CPI_COMPONENTS.map(c => (
            <div key={c.label} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0" style={{ background: c.color }} />
              {c.label} ({c.pct}%)
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Housing (Owners&apos; Equivalent Rent) is the largest component. Its lagged nature means CPI tends to overstate inflation during rapid rate cycles.
        </p>
      </SectionCard>

      {/* Historical inflation line chart */}
      <SectionCard title="Historical CPI Inflation — 2021–2026 (with key events)">
        <div className="h-[160px]">
          <LineChart
            data={HIST_CPI}
            labels={HIST_CPI_LABELS}
            color="#ef4444"
            H={160}
            pad={28}
            targetLine={2.0}
            annotations={[
              { idx: 5,  label: "2021 Spike", color: "#f59e0b" },
              { idx: 11, label: "2022 Peak",  color: "#ef4444" },
              { idx: 18, label: "2023 Decline", color: "#10b981" },
            ]}
          />
        </div>
        <div className="flex gap-4 mt-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-5 h-0.5 bg-red-500 border-dashed inline-block" />
            Fed 2% target
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            Peak: <span className="text-red-400 font-semibold ml-1">9.1% (Jun 2022)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            Current: <span className="text-indigo-400 font-semibold ml-1">3.2% (Mar 2026)</span>
          </div>
        </div>
      </SectionCard>

      {/* Inflation expectations & Real rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard title="Inflation Expectations (TIPS Breakevens)">
          <div className="space-y-4">
            {[{ label: "5-Year Breakeven", val: BREAKEVEN_5Y }, { label: "10-Year Breakeven", val: BREAKEVEN_10Y }].map(b => (
              <div key={b.label} className="bg-gray-800/50 rounded-xl p-3.5">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm text-gray-300">{b.label}</span>
                  <span className="text-xl font-bold text-indigo-300">{b.val}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 relative">
                  <div className="absolute left-0 h-1.5 bg-indigo-500 rounded-full" style={{ width: `${(b.val / 5) * 100}%` }} />
                  <div className="absolute h-3 w-0.5 bg-red-400 top-[-3px]" style={{ left: `${(2.0 / 5) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span><span className="text-red-400">Fed target 2%</span><span>5%</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Real Interest Rate">
          <div className="bg-gray-800/50 rounded-xl p-4 mb-3">
            <p className="text-xs text-gray-500 mb-2 font-mono">Real Rate = Nominal Rate − Inflation Expectation</p>
            <div className="flex items-center gap-3 text-sm">
              <div className="text-center">
                <p className="text-gray-500 text-xs">Fed Funds</p>
                <p className="text-lg font-bold text-amber-300">{FED_RATE}%</p>
              </div>
              <span className="text-gray-600 text-xl">−</span>
              <div className="text-center">
                <p className="text-gray-500 text-xs">10Y Breakeven</p>
                <p className="text-lg font-bold text-indigo-300">{BREAKEVEN_10Y}%</p>
              </div>
              <span className="text-gray-600 text-xl">=</span>
              <div className="text-center bg-emerald-500/10 rounded-lg p-2">
                <p className="text-gray-500 text-xs">Real Rate</p>
                <p className="text-lg font-bold text-emerald-300">{(FED_RATE - BREAKEVEN_10Y).toFixed(2)}%</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-gray-400">
            <div className="flex items-start gap-2"><span className="text-emerald-400 font-bold mt-0.5">▸</span> Positive real rates restrict borrowing and reduce inflation</div>
            <div className="flex items-start gap-2"><span className="text-red-400 font-bold mt-0.5">▸</span> Negative real rates stimulate economy but risk inflation persistence</div>
            <div className="flex items-start gap-2"><span className="text-indigo-400 font-bold mt-0.5">▸</span> Current real rate is historically high — restrictive territory</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ── TAB 3: Labor Market ───────────────────────────────────────────────────────

function LaborTab() {
  const sahmTriggered = SAHM_CURRENT >= 0.5;

  return (
    <div className="space-y-5">
      {/* Employment dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatChip label="Unemployment Rate" value="3.9%" chg="+0.1pp MoM" up={false} />
        <StatChip label="LF Participation Rate" value="62.7%" chg="-0.1pp MoM" up={false} />
        <StatChip label="Emp-Pop Ratio" value="60.3%" chg="Flat" />
        <StatChip label="U-6 (Broad Unemployment)" value="7.4%" chg="+0.2pp MoM" up={false} />
      </div>

      {/* NFP bar chart */}
      <SectionCard title="Non-Farm Payrolls — Last 6 Months (thousands)">
        <div className="h-[130px]">
          <BarChartSVG
            data={PAYROLLS_6M}
            labels={PAYROLLS_LABELS}
            color={PAYROLLS_6M.map(v => v > 200 ? "#10b981" : v > 100 ? "#6366f1" : "#f59e0b")}
            H={130}
            pad={24}
            showValues
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Average: <span className="text-gray-300 font-semibold">{Math.round(PAYROLLS_6M.reduce((a, b) => a + b) / PAYROLLS_6M.length)}K</span></span>
          <span>Break-even: ~100K–120K (keeps unemployment stable)</span>
        </div>
      </SectionCard>

      {/* Wage growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard title="Wage Growth Tracker">
          <div className="space-y-3">
            {[
              { label: "Avg Hourly Earnings YoY", val: 4.1, color: "#6366f1", benchmark: 3.5 },
              { label: "Employment Cost Index",   val: 3.8, color: "#10b981", benchmark: 3.0 },
              { label: "Real Wage Growth",        val: 0.9, color: "#f59e0b", benchmark: 1.5 },
            ].map(w => (
              <div key={w.label} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-400 text-xs">{w.label}</span>
                  <span className="font-bold font-mono" style={{ color: w.color }}>{w.val}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 relative">
                  <div className="absolute left-0 h-1.5 rounded-full" style={{ width: `${(w.val / 8) * 100}%`, background: w.color }} />
                  <div className="absolute h-3 w-0.5 bg-white/30 top-[-3px]" style={{ left: `${(w.benchmark / 8) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-600 mt-1">Benchmark: {w.benchmark}% | White line = sustainable growth</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Sahm Rule — Recession Early Warning">
          <div className={cn("rounded-xl p-4 mb-3 border", sahmTriggered
            ? "bg-red-500/10 border-red-500/30"
            : "bg-emerald-500/10 border-emerald-500/30")}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={cn("w-4 h-4", sahmTriggered ? "text-red-400" : "text-emerald-400")} />
              <span className={cn("text-sm font-semibold", sahmTriggered ? "text-red-300" : "text-emerald-300")}>
                {sahmTriggered ? "RECESSION SIGNAL TRIGGERED" : "No Recession Signal"}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-100 mb-1">{SAHM_CURRENT.toFixed(2)} pp</p>
            <p className="text-xs text-gray-400">Current Sahm Rule Reading (trigger: ≥0.50pp)</p>
          </div>
          <div className="h-[80px]">
            <LineChart data={SAHM_SERIES} color={sahmTriggered ? "#ef4444" : "#10b981"} H={80} pad={16} targetLine={0.5} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Sahm Rule: When 3-month avg U-rate rises ≥0.5pp above prior 12-month low → recession historically follows within months.
          </p>
        </SectionCard>
      </div>

      {/* JOLTS sparkline tiles */}
      <SectionCard title="JOLTS Data — Job Openings, Hires, Quits, Layoffs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {JOLTS_DATA.map(j => {
            const up = j.series[j.series.length - 1] > j.series[0];
            return (
              <div key={j.label} className="bg-gray-800/60 border border-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{j.label}</p>
                <p className="text-lg font-bold text-gray-100">{j.value}{j.unit}</p>
                <div className="mt-2">
                  <Sparkline data={j.series} color="auto" W={100} H={32} />
                </div>
                <div className={cn("flex items-center gap-1 text-xs mt-1", up ? "text-emerald-400" : "text-red-400")}>
                  {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {up ? "Rising" : "Falling"} trend
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Beveridge Curve scatter */}
      <SectionCard title="Beveridge Curve — Unemployment vs Job Openings Rate">
        <div className="h-[200px]">
          <ScatterPlot
            points={BEVERIDGE as [number, number][]}
            W={500}
            H={200}
            pad={32}
            xLabel="Unemployment Rate (%)"
            yLabel="Job Openings Rate (%)"
            color="#6366f1"
          />
        </div>
        <div className="flex gap-4 mt-2 flex-wrap text-xs text-gray-500">
          <span><span className="text-amber-400 font-semibold">● Latest point</span> — current labor market position</span>
          <span>Curve shifting right = structural mismatch (skills gap, geographic barriers)</span>
          <span>Tight labor market: low unemployment + high openings (top-left)</span>
        </div>
      </SectionCard>
    </div>
  );
}

// ── TAB 4: Housing & Credit ───────────────────────────────────────────────────

function HousingTab() {
  return (
    <div className="space-y-5">
      {/* Housing dashboard chips */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {HOUSING_STATS.map(s => (
          <StatChip key={s.label} label={s.label} value={s.value} chg={s.chg} up={s.up} />
        ))}
      </div>

      {/* Mortgage rate vs HPI chart */}
      <SectionCard title="30Y Mortgage Rate vs Home Price Index — 5 Years">
        <div className="flex gap-4 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-4 h-0.5 bg-indigo-400 inline-block" /> Mortgage Rate (%)
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-4 h-0.5 bg-amber-400 inline-block border-dashed" style={{ borderTop: "2px dashed #f59e0b" }} /> Case-Shiller HPI
          </div>
        </div>
        <div className="h-[150px]">
          <LineChart
            data={MORTGAGE_RATE}
            secondSeries={HPI_INDEX.map(v => v / 40)} // normalize for dual axis
            color="#6366f1"
            secondColor="#f59e0b"
            H={150}
            pad={28}
            annotations={[
              { idx: 24, label: "Rate spike", color: "#ef4444" },
              { idx: 48, label: "Stabilize",  color: "#10b981" },
            ]}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          HPI normalized to same scale. Rate spike → affordability crush. Rates stabilizing → price support returning.
        </p>
      </SectionCard>

      {/* Affordability index */}
      <SectionCard title="Housing Affordability Index">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Median Home Price",     val: "$412,000", neutral: true },
            { label: "Median HH Income",      val: "$78,200",  neutral: true },
            { label: "Monthly PITI Payment",  val: "$2,840",   neutral: true },
            { label: "Payment % of Income",   val: "43.6%",    warn: true    },
            { label: "Historical Average",    val: "~28%",     neutral: true },
            { label: "Affordability Index",   val: "64.2",     warn: true    },
          ].map(({ label, val, warn, neutral }) => (
            <div key={label} className={cn("rounded-xl p-3.5 border",
              warn ? "bg-red-500/10 border-red-500/20" : "bg-gray-800/50 border-white/5")}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={cn("text-xl font-bold mt-1", warn ? "text-red-300" : "text-gray-200")}>{val}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Affordability Index &lt;100 means a family earning median income cannot afford a median-priced home (30% income threshold). At 64.2, homes are at historically low affordability.
        </p>
      </SectionCard>

      {/* Credit conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard title="Consumer Credit Conditions">
          <div className="space-y-3">
            {CREDIT_STATS.map(c => (
              <div key={c.label} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2.5">
                <span className="text-sm text-gray-300">{c.label}</span>
                <span className="font-mono font-bold text-sm" style={{ color: c.color }}>{c.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
            Credit card delinquencies rising — consumer stress building in lower-income cohorts.
          </div>
        </SectionCard>

        {/* Senior Loan Officer Survey */}
        <SectionCard title="Senior Loan Officer Survey — % Banks Tightening Standards">
          <div className="h-[130px]">
            <BarChartSVG
              data={SLOS_DATA}
              labels={SLOS_LABELS}
              color={SLOS_DATA.map(v => v > 50 ? "#ef4444" : v > 30 ? "#f59e0b" : "#10b981")}
              H={130}
              pad={20}
              targetLine={50}
              showValues
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Red dashed line = 50% threshold. When majority of banks tighten, credit availability contracts → slower growth.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}

// ── TAB 5: Global Indicators ──────────────────────────────────────────────────

function GlobalTab() {
  const [pmiView, setPmiView] = useState<"composite" | "manufacturing" | "services">("composite");

  return (
    <div className="space-y-5">
      {/* PMI Heatmap */}
      <SectionCard title="Global PMI Heatmap — 15 Countries">
        <div className="flex gap-2 mb-4">
          {(["composite", "manufacturing", "services"] as const).map(v => (
            <button key={v}
              onClick={() => setPmiView(v)}
              className={cn("px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors",
                pmiView === v ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-gray-200")}>
              {v}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-500 pb-2 pr-4 font-medium">Country</th>
                <th className="text-center text-gray-500 pb-2 px-2 font-medium">PMI</th>
                <th className="text-left text-gray-500 pb-2 pl-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {PMI_COUNTRIES.map(c => {
                const val = PMI_VALUES[c][pmiView];
                const status = val >= 52 ? "Strong Expansion" : val >= 50 ? "Expansion" : val >= 48 ? "Mild Contraction" : "Contraction";
                return (
                  <tr key={c} className="hover:bg-white/3 transition-colors">
                    <td className="py-1.5 pr-4 text-gray-300">{c}</td>
                    <td className="py-1.5 px-2 text-center"><PmiBadge val={val} /></td>
                    <td className="py-1.5 pl-2 text-gray-500">{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {[
            { label: "52+  Strong expansion", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
            { label: "50–52  Expansion",       cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
            { label: "48–50  Mild contraction",cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
            { label: "<48  Contraction",        cls: "bg-red-500/15 text-red-400 border-red-500/25" },
          ].map(({ label, cls }) => (
            <span key={label} className={cn("text-xs px-2 py-0.5 rounded border", cls)}>{label}</span>
          ))}
        </div>
      </SectionCard>

      {/* Trade balance */}
      <SectionCard title="US Trade Balance by Major Partner — Goods ($B, annual)">
        <div className="h-[120px]">
          <BarChartSVG
            data={TRADE_PARTNERS.map(t => t.deficit)}
            labels={TRADE_PARTNERS.map(t => t.name)}
            color={TRADE_PARTNERS.map(t => t.color)}
            H={120}
            pad={20}
            showValues
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Negative values = trade deficits (US imports more than it exports). China runs the largest goods deficit at ~$295B.
        </p>
      </SectionCard>

      {/* DXY vs commodities chart */}
      <SectionCard title="Dollar Index (DXY) vs Commodities — 5-Year Correlation">
        <div className="flex gap-4 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-4 h-0.5 bg-indigo-400 inline-block" /> DXY
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="inline-block w-4" style={{ borderTop: "2px dashed #f59e0b" }} /> Commodity Index
          </div>
        </div>
        <div className="h-[140px]">
          <LineChart
            data={DXY_SERIES}
            secondSeries={COMMODITY_SERIES}
            color="#6366f1"
            secondColor="#f59e0b"
            H={140}
            pad={28}
          />
        </div>
        <div className="mt-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 text-xs text-indigo-300">
          <Info className="w-3.5 h-3.5 inline mr-1.5" />
          Strong negative correlation: Rising DXY typically pressures commodity prices (oil, gold, copper priced in USD) and Emerging Market equities.
        </div>
      </SectionCard>

      {/* Capital flows */}
      <SectionCard title="Capital Flows — Foreign Holdings of US Treasuries">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {[
              { country: "Japan",        amt: 1.08, trend: "down" },
              { country: "China",        amt: 0.76, trend: "down" },
              { country: "UK",           amt: 0.71, trend: "up"   },
              { country: "Luxembourg",   amt: 0.38, trend: "up"   },
              { country: "Cayman Isl.",  amt: 0.31, trend: "up"   },
            ].map(({ country, amt, trend }) => (
              <div key={country} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24">{country}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(amt / 1.1) * 100}%` }} />
                </div>
                <span className="text-xs font-mono text-gray-300 w-12 text-right">${amt}T</span>
                {trend === "up"
                  ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
              </div>
            ))}
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-3">Cross-Border Equity Flows (12M cumulative)</p>
            {[
              { label: "Foreign → US Equities",   val: "+$312B", pos: true  },
              { label: "US → Foreign Equities",   val: "+$148B", pos: true  },
              { label: "EM Net Inflows",           val: "-$42B",  pos: false },
              { label: "Europe Net Outflows",      val: "-$18B",  pos: false },
            ].map(({ label, val, pos }) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-xs text-gray-400">{label}</span>
                <span className={cn("text-xs font-semibold font-mono", pos ? "text-emerald-400" : "text-red-400")}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Global cycle indicator */}
      <SectionCard title="Synchronized Global Business Cycle — Regional Status">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CYCLE_REGIONS.map(r => (
            <div key={r.region} className="bg-gray-800/50 rounded-xl p-3 border border-white/5">
              <Globe className="w-4 h-4 mb-2" style={{ color: r.color }} />
              <p className="text-sm font-semibold text-gray-200">{r.region}</p>
              <Badge className="mt-1.5 text-xs" style={{
                background: `${r.color}20`,
                color: r.color,
                borderColor: `${r.color}40`,
              }}>
                {r.status}
              </Badge>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { label: "Expansion",  color: "#10b981" },
            { label: "Recovery",   color: "#f59e0b" },
            { label: "Stagnation", color: "#8b5cf6" },
            { label: "Contraction",color: "#ef4444" },
            { label: "Neutral",    color: "#6366f1" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Divergent cycles create FX opportunities. US expansion + Eurozone contraction → USD strength vs EUR. India outperformance supports EM tech.
        </p>
      </SectionCard>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "gdp",      label: "GDP & Growth",     icon: TrendingUp   },
  { id: "inflation",label: "Inflation",         icon: Activity     },
  { id: "labor",    label: "Labor Market",      icon: Briefcase    },
  { id: "housing",  label: "Housing & Credit",  icon: Home         },
  { id: "global",   label: "Global",            icon: Globe        },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function EconomicIndicatorsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("gdp");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <BarChart3 className="w-6 h-6 text-indigo-400" />
                <h1 className="text-2xl font-bold text-gray-100">Economic Indicators</h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">Live</Badge>
              </div>
              <p className="text-sm text-gray-500">
                Comprehensive macro dashboard — GDP, inflation, labor, housing, and global cycle data
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-600">Last updated</p>
              <p className="text-sm font-mono text-gray-400">Mar 27, 2026</p>
            </div>
          </div>

          {/* Key macro summary bar */}
          <div className="flex flex-wrap gap-4 mt-4">
            {[
              { label: "GDP Growth",   val: "2.4%",  color: "text-emerald-400" },
              { label: "CPI",         val: "3.2%",  color: "text-amber-400"   },
              { label: "Fed Funds",   val: "4.25%", color: "text-indigo-400"  },
              { label: "Unemployment",val: "3.9%",  color: "text-blue-400"    },
              { label: "10Y Yield",   val: "4.43%", color: "text-purple-400"  },
              { label: "DXY",         val: "104.2", color: "text-gray-300"    },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-sm">
                <span className="text-gray-600">{label}:</span>
                <span className={cn("font-semibold font-mono", color)}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as TabId)}>
          <TabsList className="bg-gray-900/80 border border-white/8 rounded-xl p-1 mb-6 flex flex-wrap gap-1 h-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-200 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent key={activeTab} value="gdp"      className="data-[state=inactive]:hidden mt-0"><GdpTab /></TabsContent>
            <TabsContent key={activeTab + "i"} value="inflation" className="data-[state=inactive]:hidden mt-0"><InflationTab /></TabsContent>
            <TabsContent key={activeTab + "l"} value="labor"     className="data-[state=inactive]:hidden mt-0"><LaborTab /></TabsContent>
            <TabsContent key={activeTab + "h"} value="housing"   className="data-[state=inactive]:hidden mt-0"><HousingTab /></TabsContent>
            <TabsContent key={activeTab + "g"} value="global"    className="data-[state=inactive]:hidden mt-0"><GlobalTab /></TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
