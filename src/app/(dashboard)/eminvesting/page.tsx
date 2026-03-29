"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart2,
  AlertTriangle,
  DollarSign,
  Activity,
  ShieldAlert,
  Layers,
  ArrowRight,
  ArrowUpDown,
  RefreshCw,
  Landmark,
  Percent,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 962;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const sv = () => _vals[_vi++ % _vals.length];

// ── Colour helpers ─────────────────────────────────────────────────────────────
const posColor = (v: number) => (v >= 0 ? "text-emerald-400" : "text-red-400");

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — EM Equity
// ─────────────────────────────────────────────────────────────────────────────

// MSCI EM Composition donut
const MSCI_EM: { country: string; pct: number; color: string }[] = [
  { country: "China", pct: 27, color: "#ef4444" },
  { country: "India", pct: 18, color: "#f97316" },
  { country: "Taiwan", pct: 15, color: "#eab308" },
  { country: "Korea", pct: 12, color: "#22c55e" },
  { country: "Brazil", pct: 5, color: "#06b6d4" },
  { country: "Others", pct: 23, color: "#6366f1" },
];

function MSCIDonut() {
  const cx = 100;
  const cy = 100;
  const r = 72;
  const innerR = 40;
  let cumulative = 0;
  const slices = MSCI_EM.map((d) => {
    const start = cumulative;
    cumulative += d.pct;
    const end = cumulative;
    const startAngle = (start / 100) * 2 * Math.PI - Math.PI / 2;
    const endAngle = (end / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(startAngle);
    const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);
    const large = d.pct > 50 ? 1 : 0;
    return { ...d, path: `M${ix1},${iy1} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${innerR},${innerR} 0 ${large},0 ${ix1},${iy1} Z` };
  });
  return (
    <svg viewBox="0 0 340 200" className="w-full h-44">
      {slices.map((sl, i) => (
        <path key={`em-slice-${i}`} d={sl.path} fill={sl.color} opacity="0.85" stroke="#09090b" strokeWidth="1" />
      ))}
      <text x={cx} y={cy - 6} fill="#e4e4e7" fontSize="10" textAnchor="middle" fontWeight="bold">MSCI EM</text>
      <text x={cx} y={cy + 8} fill="#a1a1aa" fontSize="8" textAnchor="middle">Index Wt.</text>
      {MSCI_EM.map((d, i) => (
        <g key={`em-leg-${i}`}>
          <rect x={215} y={18 + i * 26} width="10" height="10" rx="2" fill={d.color} opacity="0.85" />
          <text x={230} y={27 + i * 26} fill="#d4d4d8" fontSize="9">{d.country}</text>
          <text x={325} y={27 + i * 26} fill={d.color} fontSize="9" textAnchor="end" fontWeight="bold">{d.pct}%</text>
        </g>
      ))}
    </svg>
  );
}

// EM vs DM return comparison (rolling 10yr annualised)
const RETURN_DATA: { year: string; em: number; dm: number }[] = [
  { year: "2005", em: 18.5, dm: 9.2 },
  { year: "2007", em: 22.1, dm: 10.3 },
  { year: "2009", em: 8.4, dm: 5.1 },
  { year: "2011", em: 4.2, dm: 6.8 },
  { year: "2013", em: 1.1, dm: 12.4 },
  { year: "2015", em: -2.3, dm: 8.7 },
  { year: "2017", em: 5.6, dm: 9.9 },
  { year: "2019", em: 3.4, dm: 11.2 },
  { year: "2021", em: 2.1, dm: 13.5 },
  { year: "2023", em: 4.8, dm: 10.8 },
];

function EMvsDMChart() {
  const W = 480;
  const H = 160;
  const PAD = { l: 36, r: 12, t: 16, b: 32 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const minV = -5;
  const maxV = 25;
  const range = maxV - minV;
  const toX = (i: number) => PAD.l + (i / (RETURN_DATA.length - 1)) * cW;
  const toY = (v: number) => PAD.t + cH - ((v - minV) / range) * cH;
  const emPts = RETURN_DATA.map((d, i) => `${toX(i)},${toY(d.em)}`).join(" ");
  const dmPts = RETURN_DATA.map((d, i) => `${toX(i)},${toY(d.dm)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      {[-5, 0, 5, 10, 15, 20, 25].map((v) => (
        <line key={`rgl-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke={v === 0 ? "#3f3f46" : "#27272a"} strokeWidth={v === 0 ? 1.5 : 0.8} strokeDasharray={v === 0 ? "4,3" : "none"} />
      ))}
      {[-5, 0, 10, 20].map((v) => (
        <text key={`rgy-${v}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="8" textAnchor="end">{v}%</text>
      ))}
      <polyline points={emPts} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" />
      <polyline points={dmPts} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
      {RETURN_DATA.map((d, i) => (
        <circle key={`em-d-${i}`} cx={toX(i)} cy={toY(d.em)} r="2.5" fill="#f97316" />
      ))}
      {RETURN_DATA.map((d, i) => (
        <circle key={`dm-d-${i}`} cx={toX(i)} cy={toY(d.dm)} r="2.5" fill="#6366f1" />
      ))}
      {RETURN_DATA.filter((_, i) => i % 2 === 0).map((d, i) => (
        <text key={`rxl-${i}`} x={toX(i * 2)} y={H - 4} fill="#71717a" fontSize="8" textAnchor="middle">{d.year}</text>
      ))}
      <rect x={PAD.l + 4} y={PAD.t + 4} width="52" height="14" rx="3" fill="#18181b" />
      <line x1={PAD.l + 8} y1={PAD.t + 11} x2={PAD.l + 18} y2={PAD.t + 11} stroke="#f97316" strokeWidth="2" />
      <text x={PAD.l + 22} y={PAD.t + 15} fill="#a1a1aa" fontSize="7.5">EM</text>
      <rect x={PAD.l + 32} y={PAD.t + 4} width="24" height="14" rx="3" fill="#18181b" />
      <line x1={PAD.l + 36} y1={PAD.t + 11} x2={PAD.l + 46} y2={PAD.t + 11} stroke="#6366f1" strokeWidth="2" />
      <text x={PAD.l + 50} y={PAD.t + 15} fill="#a1a1aa" fontSize="7.5">DM</text>
    </svg>
  );
}

const EM_DRIVERS: { driver: string; impact: string; note: string; dir: "pos" | "neg" | "mixed" }[] = [
  { driver: "Commodity Prices", impact: "Strong +", note: "Commodity-exporting EMs (Brazil, Russia, SA) benefit from high oil/metals prices", dir: "pos" },
  { driver: "USD Strength", impact: "Strong −", note: "Strong USD tightens financial conditions; dollar-denominated debt becomes costlier", dir: "neg" },
  { driver: "China GDP Growth", impact: "Strong +", note: "China is a demand engine for EM exports; slowdown ripples through supply chains", dir: "pos" },
  { driver: "US Fed Rates", impact: "Moderate −", note: "Higher US rates attract capital away from EM, weakening currencies", dir: "neg" },
  { driver: "EM Reform Cycle", impact: "Variable", note: "Structural reforms (India PLI, Brazil fiscal anchor) re-rate EM equities", dir: "mixed" },
  { driver: "Risk Appetite (VIX)", impact: "Moderate +", note: "Low volatility / risk-on episodes drive flows into higher-beta EM assets", dir: "pos" },
];

const EM_FACTOR_PREMIUMS: { factor: string; emAlpha: string; dmAlpha: string; why: string }[] = [
  { factor: "Value", emAlpha: "+3.8% pa", dmAlpha: "+1.2% pa", why: "Cheap governance discount + mean reversion in cyclical sectors" },
  { factor: "Momentum", emAlpha: "+2.4% pa", dmAlpha: "+3.1% pa", why: "Regime changes and crisis episodes create sharp reversals" },
  { factor: "Quality", emAlpha: "+4.1% pa", dmAlpha: "+2.8% pa", why: "Governance premium; quality screens out state-owned enterprise drag" },
  { factor: "Size (Small-cap)", emAlpha: "+1.9% pa", dmAlpha: "+0.9% pa", why: "Less covered, but liquidity and access constraints are real" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — EM Debt
// ─────────────────────────────────────────────────────────────────────────────

// EMBI+ spread history 2000–2024
const EMBI_SPREAD: { year: string; bps: number }[] = [
  { year: "2000", bps: 750 },
  { year: "2002", bps: 850 },
  { year: "2004", bps: 400 },
  { year: "2006", bps: 220 },
  { year: "2008", bps: 680 },
  { year: "2010", bps: 280 },
  { year: "2012", bps: 320 },
  { year: "2014", bps: 350 },
  { year: "2016", bps: 400 },
  { year: "2018", bps: 380 },
  { year: "2020", bps: 520 },
  { year: "2022", bps: 450 },
  { year: "2024", bps: 310 },
];

function EMBISpreadChart() {
  const W = 480;
  const H = 160;
  const PAD = { l: 44, r: 12, t: 16, b: 32 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const maxB = 950;
  const toX = (i: number) => PAD.l + (i / (EMBI_SPREAD.length - 1)) * cW;
  const toY = (v: number) => PAD.t + cH - (v / maxB) * cH;
  const pts = EMBI_SPREAD.map((d, i) => `${toX(i)},${toY(d.bps)}`).join(" ");
  const area = [
    `${toX(0)},${PAD.t + cH}`,
    ...EMBI_SPREAD.map((d, i) => `${toX(i)},${toY(d.bps)}`),
    `${toX(EMBI_SPREAD.length - 1)},${PAD.t + cH}`,
  ].join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <defs>
        <linearGradient id="embiGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 200, 400, 600, 800].map((v) => (
        <line key={`embi-gl-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="0.8" />
      ))}
      {[0, 200, 400, 600, 800].map((v) => (
        <text key={`embi-gy-${v}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="8" textAnchor="end">{v}</text>
      ))}
      <polygon points={area} fill="url(#embiGrad)" />
      <polyline points={pts} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinejoin="round" />
      {EMBI_SPREAD.map((d, i) => (
        <text key={`embi-xl-${i}`} x={toX(i)} y={H - 4} fill="#71717a" fontSize="7.5" textAnchor="middle">{d.year}</text>
      ))}
      <text x={PAD.l + cW / 2} y={PAD.t - 2} fill="#71717a" fontSize="8" textAnchor="middle">EMBI+ Spread (bps over UST)</text>
    </svg>
  );
}

// Sovereign rating distribution
const SOVEREIGN_RATINGS: { bucket: string; count: number; color: string }[] = [
  { bucket: "AAA–AA", count: 4, color: "#22c55e" },
  { bucket: "A", count: 12, color: "#84cc16" },
  { bucket: "BBB", count: 22, color: "#eab308" },
  { bucket: "BB", count: 28, color: "#f97316" },
  { bucket: "B", count: 32, color: "#ef4444" },
  { bucket: "CCC+", count: 18, color: "#9f1239" },
];

function SovereignRatingBar() {
  const W = 480;
  const H = 140;
  const PAD = { l: 52, r: 12, t: 16, b: 28 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const maxC = 35;
  const barW = cW / SOVEREIGN_RATINGS.length - 8;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36">
      {[0, 10, 20, 30].map((v) => (
        <line key={`srg-${v}`} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + cH - (v / maxC) * cH} y2={PAD.t + cH - (v / maxC) * cH} stroke="#27272a" strokeWidth="0.8" />
      ))}
      {[0, 10, 20, 30].map((v) => (
        <text key={`srgy-${v}`} x={PAD.l - 4} y={PAD.t + cH - (v / maxC) * cH + 4} fill="#71717a" fontSize="8" textAnchor="end">{v}</text>
      ))}
      {SOVEREIGN_RATINGS.map((d, i) => {
        const x = PAD.l + i * (cW / SOVEREIGN_RATINGS.length) + 4;
        const barH = (d.count / maxC) * cH;
        const y = PAD.t + cH - barH;
        return (
          <g key={`sr-bar-${i}`}>
            <rect x={x} y={y} width={barW} height={barH} rx="3" fill={d.color} opacity="0.8" />
            <text x={x + barW / 2} y={y - 3} fill={d.color} fontSize="8" textAnchor="middle" fontWeight="bold">{d.count}</text>
            <text x={x + barW / 2} y={H - 6} fill="#71717a" fontSize="7.5" textAnchor="middle">{d.bucket}</text>
          </g>
        );
      })}
      <text x={PAD.l + cW / 2} y={PAD.t - 2} fill="#71717a" fontSize="8" textAnchor="middle">EM Sovereign Rating Distribution (# of countries)</text>
    </svg>
  );
}

const EM_DEBT_FUNDS: { manager: string; flagship: string; aum: string; style: string }[] = [
  { manager: "PIMCO", flagship: "PIMCO EM Local Currency", aum: "$8.2B", style: "Local currency, active rates" },
  { manager: "TCW", flagship: "TCW EM Income", aum: "$5.1B", style: "Hard currency, value-oriented" },
  { manager: "Ashmore", flagship: "Ashmore EM Debt", aum: "$12.4B", style: "Pure EM specialist, all-blended" },
  { manager: "Franklin Templeton", flagship: "Templeton EM Bond", aum: "$6.7B", style: "Local currency, contrarian" },
  { manager: "Western Asset", flagship: "WA EM Debt", aum: "$4.3B", style: "Hard currency, investment-grade tilt" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3 — Country Risk Analysis
// ─────────────────────────────────────────────────────────────────────────────

// 5-factor radar chart for vulnerability
const RADAR_AXES = ["Fiscal", "External", "Political", "Inflation", "Reserves"];
const RADAR_COUNTRIES: { name: string; scores: number[]; color: string }[] = [
  { name: "Brazil", scores: [55, 50, 60, 65, 55], color: "#06b6d4" },
  { name: "Turkey", scores: [50, 35, 45, 90, 30], color: "#f97316" },
  { name: "India", scores: [60, 65, 70, 55, 70], color: "#f59e0b" },
  { name: "Mexico", scores: [65, 55, 60, 50, 60], color: "#22c55e" },
];

function VulnerabilityRadar() {
  const cx = 120;
  const cy = 100;
  const R = 72;
  const n = RADAR_AXES.length;
  const angle = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const pt = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });
  const rings = [20, 40, 60, 80, 100];
  return (
    <svg viewBox="0 0 420 200" className="w-full h-48">
      {rings.map((rv) => {
        const pts = RADAR_AXES.map((_, i) => {
          const p = pt(i, (rv / 100) * R);
          return `${p.x},${p.y}`;
        }).join(" ");
        return <polygon key={`radar-ring-${rv}`} points={pts} fill="none" stroke="#27272a" strokeWidth="0.8" />;
      })}
      {RADAR_AXES.map((_, i) => {
        const p = pt(i, R);
        return <line key={`radar-axis-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#3f3f46" strokeWidth="0.8" />;
      })}
      {RADAR_AXES.map((ax, i) => {
        const p = pt(i, R + 12);
        return <text key={`radar-lbl-${i}`} x={p.x} y={p.y + 4} fill="#a1a1aa" fontSize="8" textAnchor="middle">{ax}</text>;
      })}
      {RADAR_COUNTRIES.map((country, ci) => {
        const pts = country.scores.map((sc, i) => {
          const p = pt(i, (sc / 100) * R);
          return `${p.x},${p.y}`;
        }).join(" ");
        return (
          <polygon key={`radar-c-${ci}`} points={pts} fill={country.color} fillOpacity="0.15" stroke={country.color} strokeWidth="1.5" />
        );
      })}
      {/* Legend */}
      {RADAR_COUNTRIES.map((c, i) => (
        <g key={`radar-leg-${i}`}>
          <line x1={250} y1={28 + i * 22} x2={264} y2={28 + i * 22} stroke={c.color} strokeWidth="2" />
          <text x={268} y={32 + i * 22} fill="#d4d4d8" fontSize="9">{c.name}</text>
        </g>
      ))}
      <text x={330} y={160} fill="#52525b" fontSize="7.5" textAnchor="middle">Score: higher = more resilient</text>
    </svg>
  );
}

const CASE_STUDIES: { country: string; year: string; event: string; trigger: string; outcome: string; color: string }[] = [
  { country: "Argentina", year: "2020", event: "9th Sovereign Default", trigger: "Unsustainable debt burden, IMF program failure, capital flight", outcome: "Restructured $65B; peso depreciated 70%; GDP contracted 10%", color: "#ef4444" },
  { country: "Turkey", year: "2018", event: "Currency Crisis", trigger: "Excessive current account deficit, USD borrowing, political pressure on CBRT", outcome: "TRY lost 40% vs USD; inflation peaked at 25%; emergency rate hike to 24%", color: "#f97316" },
  { country: "Sri Lanka", year: "2022", event: "Balance of Payments Crisis", trigger: "FX reserve depletion, import dependency, pandemic, tax cuts in 2019", outcome: "First default since 1948; IMF programme $2.9B; GDP −8% in 2022", color: "#eab308" },
  { country: "Ghana", year: "2023", event: "Debt Restructuring", trigger: "High debt service vs revenues, commodity revenue decline, global rate shock", outcome: "Eurobond default; IMF $3B programme; domestic debt exchange completed", color: "#06b6d4" },
];

const RISK_FRAMEWORK: { category: string; components: string[]; color: string }[] = [
  { category: "Political Risk", components: ["Government stability", "Regime type / rule of law", "Corruption (CPI)", "Social unrest / protests", "Geopolitical exposure"], color: "#ef4444" },
  { category: "Economic Risk", components: ["GDP growth trajectory", "Inflation dynamics", "Fiscal balance & trajectory", "External current account", "Structural reform progress"], color: "#f97316" },
  { category: "Financial Risk", components: ["Banking system health", "Credit growth / leverage", "Asset quality / NPLs", "Capital adequacy", "Deposit dollarization"], color: "#eab308" },
  { category: "Sovereign Risk", components: ["Debt/GDP & trajectory", "FX reserve adequacy", "Debt maturity profile", "Rollover cliff risk", "IMF programme / access"], color: "#6366f1" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4 — Capital Flows & FX
// ─────────────────────────────────────────────────────────────────────────────

// Capital flow cycle SVG
function CapitalFlowCycleSVG() {
  return (
    <svg viewBox="0 0 480 180" className="w-full h-44">
      <defs>
        <marker id="cfA1" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e" />
        </marker>
        <marker id="cfA2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" />
        </marker>
        <marker id="cfA3" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" />
        </marker>
      </defs>
      {/* Centre: EM Assets */}
      <ellipse cx={240} cy={90} rx={52} ry={30} fill="#1e1e2e" stroke="#6366f1" strokeWidth="1.5" />
      <text x={240} y={86} fill="#a5b4fc" fontSize="9" textAnchor="middle" fontWeight="bold">EM ASSETS</text>
      <text x={240} y={99} fill="#a5b4fc" fontSize="7.5" textAnchor="middle">Equities / Bonds</text>

      {/* Risk-On sources */}
      <rect x={10} y={30} width={90} height={38} rx="6" fill="#14532d" stroke="#22c55e" strokeWidth="1.2" />
      <text x={55} y={47} fill="#86efac" fontSize="8.5" textAnchor="middle" fontWeight="bold">RISK-ON INFLOWS</text>
      <text x={55} y={59} fill="#86efac" fontSize="7.5" textAnchor="middle">Low VIX / DM QE</text>
      <line x1={100} y1={49} x2={183} y2={84} stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#cfA1)" />

      {/* Risk-Off */}
      <rect x={10} y={110} width={90} height={38} rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.2" />
      <text x={55} y={127} fill="#fca5a5" fontSize="8.5" textAnchor="middle" fontWeight="bold">RISK-OFF OUTFLOWS</text>
      <text x={55} y={139} fill="#fca5a5" fontSize="7.5" textAnchor="middle">High VIX / USD rally</text>
      <line x1={183} y1={96} x2={105} y2={118} stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#cfA2)" />

      {/* Push factors */}
      <rect x={378} y={22} width={94} height={38} rx="6" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.2" />
      <text x={425} y={38} fill="#a5b4fc" fontSize="8.5" textAnchor="middle" fontWeight="bold">PUSH FACTORS</text>
      <text x={425} y={51} fill="#a5b4fc" fontSize="7.5" textAnchor="middle">Low DM yields</text>
      <line x1={378} y1={44} x2={296} y2={78} stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#cfA3)" />

      {/* Pull factors */}
      <rect x={378} y={118} width={94} height={38} rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.2" />
      <text x={425} y={134} fill="#c7d2fe" fontSize="8.5" textAnchor="middle" fontWeight="bold">PULL FACTORS</text>
      <text x={425} y={147} fill="#c7d2fe" fontSize="7.5" textAnchor="middle">EM growth / yields</text>
      <line x1={378} y1={131} x2={296} y2={102} stroke="#818cf8" strokeWidth="1.5" markerEnd="url(#cfA3)" />

      {/* Labels */}
      <text x={240} y={158} fill="#52525b" fontSize="7.5" textAnchor="middle">EM capital flows oscillate with global risk appetite (avg cycle 3–7 yrs)</text>
    </svg>
  );
}

// Impossible Trinity
function ImpossibleTrinitySVG() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-48">
      {/* Triangle */}
      <polygon points="150,20 20,170 280,170" fill="none" stroke="#3f3f46" strokeWidth="1.5" />
      {/* Shaded sides — can only pick 2 of 3 */}
      <line x1={150} y1={20} x2={20} y2={170} stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,3" />
      <line x1={150} y1={20} x2={280} y2={170} stroke="#6366f1" strokeWidth="2.5" strokeDasharray="6,3" />
      <line x1={20} y1={170} x2={280} y2={170} stroke="#22c55e" strokeWidth="2.5" strokeDasharray="6,3" />
      {/* Nodes */}
      <circle cx={150} cy={20} r="16" fill="#1e1e2e" stroke="#f97316" strokeWidth="2" />
      <text x={150} y={14} fill="#fed7aa" fontSize="6.5" textAnchor="middle">Fixed</text>
      <text x={150} y={24} fill="#fed7aa" fontSize="6.5" textAnchor="middle">Exch. Rate</text>

      <circle cx={20} cy={170} r="16" fill="#1e1e2e" stroke="#22c55e" strokeWidth="2" />
      <text x={20} y={165} fill="#86efac" fontSize="6" textAnchor="middle">Free</text>
      <text x={20} y={175} fill="#86efac" fontSize="6" textAnchor="middle">Capital</text>

      <circle cx={280} cy={170} r="16" fill="#1e1e2e" stroke="#6366f1" strokeWidth="2" />
      <text x={280} y={165} fill="#a5b4fc" fontSize="6" textAnchor="middle">Indep.</text>
      <text x={280} y={175} fill="#a5b4fc" fontSize="6" textAnchor="middle">Mon. Pol.</text>

      <text x={150} y={115} fill="#71717a" fontSize="8.5" textAnchor="middle">Cannot achieve</text>
      <text x={150} y={127} fill="#71717a" fontSize="8.5" textAnchor="middle">all three simultaneously</text>
      <text x={150} y={145} fill="#52525b" fontSize="7.5" textAnchor="middle">(Mundell-Fleming Trilemma)</text>

      {/* X in centre */}
      <text x={150} y={82} fill="#ef4444" fontSize="28" textAnchor="middle" opacity="0.25">✕</text>
    </svg>
  );
}

// FX reserve adequacy metrics
const FX_RESERVE_METRICS: { metric: string; threshold: string; rationale: string; color: string }[] = [
  { metric: "Months of imports covered", threshold: "≥ 3 months", rationale: "Classic BOP adequacy — covers short-term import bill during disruption", color: "#22c55e" },
  { metric: "Ratio to short-term external debt", threshold: "≥ 100%", rationale: "Greenspan–Guidotti rule: can repay 1 year of maturing external debt", color: "#6366f1" },
  { metric: "% of broad money (M2)", threshold: "≥ 10–20%", rationale: "Guards against capital flight / bank run scenarios", color: "#f59e0b" },
  { metric: "IMF ARA Composite Score", threshold: "100–150% ARA", rationale: "IMF's Assessing Reserve Adequacy blended metric for open economies", color: "#06b6d4" },
];

const PUSH_PULL: { type: string; factors: string[]; color: string }[] = [
  { type: "Push Factors (DM-origin)", factors: ["Low DM interest rates / QE", "Risk-on investor appetite", "US corporate tax regime shifts", "Slow DM growth outlook", "Excess global liquidity"], color: "#6366f1" },
  { type: "Pull Factors (EM-destination)", factors: ["Higher EM real yields", "Stronger EM growth prospects", "Commodity boom tailwinds", "Undervalued EM currencies", "Index inclusion events (MSCI/JPM)"], color: "#22c55e" },
];

const CBDC_DATA: { country: string; system: string; status: string; feature: string; color: string }[] = [
  { country: "China", system: "e-CNY (DC/EP)", status: "Pilot / expanding", feature: "Programmable money; supports BRI settlement ambitions", color: "#ef4444" },
  { country: "Brazil", system: "PIX / DREX", status: "Live (PIX 2020)", feature: "Real-time P2P; DREX is wholesale CBDC layer", color: "#22c55e" },
  { country: "India", system: "UPI / Digital Rupee", status: "Live (UPI) / Pilot", feature: "2B+ UPI transactions/month; global remittance gateway", color: "#f97316" },
  { country: "Nigeria", system: "eNaira", status: "Live (2021)", feature: "First sub-Saharan CBDC; low adoption challenge", color: "#84cc16" },
  { country: "Bahamas", system: "Sand Dollar", status: "Live (2020)", feature: "World's first CBDC; financial inclusion focus", color: "#06b6d4" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function EMInvestingPage() {
  const [activeTab, setActiveTab] = useState("equity");
  const [expandedCase, setExpandedCase] = useState<number | null>(null);
  const [expandedRisk, setExpandedRisk] = useState<number | null>(null);

  // Consume sv() to keep PRNG state active (avoids tree-shaking issues)
  void sv;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Globe className="w-5 h-5 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Emerging Markets Investing</h1>
          <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-xs">Advanced</Badge>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          EM equity, EM sovereign and corporate debt, country risk frameworks, capital flow dynamics, and frontier market opportunities — from MSCI classification to impossible trinity.
        </p>
      </motion.div>

      {/* Stat chips — Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="border-l-4 border-l-primary rounded-lg bg-card p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        {[
          { label: "MSCI EM Countries", value: "24", sub: "vs 23 DM", icon: <Globe className="w-4 h-4" />, color: "text-orange-400" },
          { label: "EM vs DM P/E Discount", value: "−33%", sub: "12x vs 18x P/E", icon: <BarChart2 className="w-4 h-4" />, color: "text-emerald-400" },
          { label: "EM Debt Universe", value: "$9.4T", sub: "Hard + local currency", icon: <DollarSign className="w-4 h-4" />, color: "text-primary" },
          { label: "Global Remittances", value: "$800B+", sub: "Annual EM inflows", icon: <ArrowRight className="w-4 h-4" />, color: "text-primary" },
        ].map((chip, i) => (
          <Card key={`chip-${i}`} className="bg-card border-border">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={cn("p-1.5 rounded-md bg-muted", chip.color)}>{chip.icon}</div>
              <div>
                <div className={cn("text-lg font-bold leading-none", chip.color)}>{chip.value}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{chip.label}</div>
                <div className="text-muted-foreground text-xs">{chip.sub}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1 p-1">
          {[
            { id: "equity", label: "EM Equity", icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: "debt", label: "EM Debt", icon: <Landmark className="w-3.5 h-3.5" /> },
            { id: "risk", label: "Country Risk", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
            { id: "flows", label: "Capital Flows & FX", icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5 text-xs data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300"
            >
              {tab.icon}{tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── TAB 1: EM Equity ── */}
        <TabsContent value="equity" className="data-[state=inactive]:hidden space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* MSCI EM Composition */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-orange-400" />MSCI EM Index Composition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MSCIDonut />
                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                  <p>China + Taiwan + Korea = 54% of MSCI EM — heavy concentration risk.</p>
                  <p>MSCI reviews EM classification annually — Saudi Arabia added 2019, ongoing India ADR/GDR vs direct debate.</p>
                </div>
              </CardContent>
            </Card>

            {/* EM vs DM Returns */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />EM vs DM Rolling 10-Year Returns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EMvsDMChart />
                <p className="text-xs text-muted-foreground mt-2">
                  EM outperformed strongly in the 2000s commodity supercycle. DM dominance returned post-2013 as USD strengthened and China slowed.
                  The valuation gap (P/E 12x EM vs 18x DM) suggests long-run mean reversion potential.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* EM Valuation Discount */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />EM vs DM Valuation Discount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { metric: "P/E (Fwd)", em: "12.1x", dm: "18.4x", discount: "−34%" },
                  { metric: "P/B", em: "1.4x", dm: "2.9x", discount: "−52%" },
                  { metric: "EV/EBITDA", em: "7.8x", dm: "12.3x", discount: "−37%" },
                  { metric: "Div Yield", em: "3.2%", dm: "1.9%", discount: "+68%" },
                ].map((v, i) => (
                  <div key={`val-${i}`} className="bg-muted/60 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">{v.metric}</div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span className="text-orange-400 font-medium">EM {v.em}</span>
                      <span className="text-indigo-400 font-medium">DM {v.dm}</span>
                    </div>
                    <div className={cn("text-sm font-medium", v.discount.startsWith("+") ? "text-emerald-400" : "text-amber-400")}>{v.discount}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                The EM discount reflects: (1) governance risk premium — state-owned enterprise dominance, minority shareholder protections; (2) political risk; (3) liquidity and access restrictions (China A-share lock-ups, India T+3 settlement, Saudi Tadawul foreign ownership caps); (4) currency tail-risk. Discount narrows during risk-on cycles.
              </p>
            </CardContent>
          </Card>

          {/* EM Equity Drivers */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />EM Equity Return Drivers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {EM_DRIVERS.map((d, i) => (
                  <div key={`driver-${i}`} className="flex items-start gap-3 p-2.5 bg-muted/50 rounded-lg">
                    <div className={cn("text-xs font-medium rounded px-1.5 py-0.5 shrink-0 mt-0.5", d.dir === "pos" ? "bg-emerald-500/20 text-emerald-400" : d.dir === "neg" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400")}>
                      {d.impact}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">{d.driver}</div>
                      <div className="text-xs text-muted-foreground">{d.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Factor Premiums */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />EM Factor Premiums (vs DM)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-muted-foreground">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">Factor</th>
                      <th className="text-right py-2 text-orange-400">EM Alpha</th>
                      <th className="text-right py-2 text-indigo-400">DM Alpha</th>
                      <th className="text-left py-2 pl-4 text-muted-foreground">Why it differs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EM_FACTOR_PREMIUMS.map((f, i) => (
                      <tr key={`fac-${i}`} className="border-b border-border/50">
                        <td className="py-2 text-muted-foreground font-medium">{f.factor}</td>
                        <td className="py-2 text-right text-orange-400 font-mono">{f.emAlpha}</td>
                        <td className="py-2 text-right text-indigo-400 font-mono">{f.dmAlpha}</td>
                        <td className="py-2 pl-4 text-muted-foreground">{f.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                EM ETF structures: ADR (American Depositary Receipts), GDR (Global DRs), direct listing (India SEBI-registered, China A-shares via Stock Connect), synthetic (swap-based). MSCI EM classification criteria require market accessibility score, size/liquidity requirements, and foreign investor inclusion.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: EM Debt ── */}
        <TabsContent value="debt" className="data-[state=inactive]:hidden space-y-5">
          {/* Hard vs Local */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground/50" />Hard Currency vs Local Currency EM Debt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {[
                  {
                    type: "Hard Currency (USD)", index: "EMBI+, CEMBI", color: "#6366f1",
                    pros: ["No FX risk for USD investors", "Larger investor base / more liquid", "Benchmark-driven allocation flows", "IMF backstop supports pricing"],
                    cons: ["Original sin — issuer bears FX risk", "Sensitive to USD strength / US rates", "Dollarization creates balance sheet mismatches"],
                  },
                  {
                    type: "Local Currency (EM FX)", index: "GBI-EM, EMLE", color: "#22c55e",
                    pros: ["Higher nominal yields (carry)", "Inflation hedge for EM investors", "Diversification vs DM bonds", "Benefit from EM currency appreciation"],
                    cons: ["FX volatility — can wipe out carry", "Liquidity risk in stressed markets", "Capital controls restrict access", "Inflation volatility in frontier EM"],
                  },
                ].map((seg, i) => (
                  <div key={`hc-lc-${i}`} className="p-3 rounded-lg border" style={{ borderColor: seg.color + "40" }}>
                    <div className="text-sm font-medium mb-1" style={{ color: seg.color }}>{seg.type}</div>
                    <div className="text-xs text-muted-foreground mb-2">Index: {seg.index}</div>
                    <div className="mb-2">
                      <div className="text-xs text-emerald-400 font-medium mb-1">Pros</div>
                      {seg.pros.map((p, j) => <div key={`pro-${i}-${j}`} className="text-xs text-muted-foreground flex gap-1.5 mb-0.5"><span className="text-emerald-500">+</span>{p}</div>)}
                    </div>
                    <div>
                      <div className="text-xs text-red-400 font-medium mb-1">Cons</div>
                      {seg.cons.map((c, j) => <div key={`con-${i}-${j}`} className="text-xs text-muted-foreground flex gap-1.5 mb-0.5"><span className="text-red-500">−</span>{c}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* EMBI+ Spread History */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />EMBI+ Spread History 2000–2024
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EMBISpreadChart />
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { event: "2002 EM crisis / Argentine default", bps: "850 bps peak", color: "text-red-400" },
                  { event: "2008 GFC contagion", bps: "680 bps peak", color: "text-orange-400" },
                  { event: "2020 COVID taper tantrum", bps: "520 bps peak", color: "text-amber-400" },
                ].map((e, i) => (
                  <div key={`embi-evt-${i}`} className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                    <div className={cn("font-medium", e.color)}>{e.bps}</div>
                    <div className="text-muted-foreground mt-0.5">{e.event}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sovereign Rating Distribution */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />EM Sovereign Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SovereignRatingBar />
              <p className="text-xs text-muted-foreground mt-2">
                Most EM sovereigns are BB/B rated. High-yield EM accounts for ~60% of the EMBI+ universe. Investment-grade EM (Chile, Mexico, China, Indonesia) trades with tighter spreads and attracts pension/insurance flows.
              </p>
            </CardContent>
          </Card>

          {/* EM Inflation & Carry */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-400" />EM Inflation Dynamics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-2.5 bg-muted/50 rounded-lg">
                  <div className="text-xs font-medium text-emerald-400 mb-1">Commodity Exporters (Brazil, Russia, SA, GCC)</div>
                  <p className="text-xs text-muted-foreground">Energy/food export revenues buffer fiscal position. Inflation driven by domestic demand & currency strength. Central banks can cut rates when commodity boom supports FX.</p>
                </div>
                <div className="p-2.5 bg-muted/50 rounded-lg">
                  <div className="text-xs font-medium text-orange-400 mb-1">Commodity Importers (Turkey, India, Egypt)</div>
                  <p className="text-xs text-muted-foreground">Oil price spikes hit current account and inflation simultaneously. FX depreciation is inflationary — creating a vicious cycle. IMF programmes often required to break the cycle.</p>
                </div>
                <div className="p-2.5 bg-muted/50 rounded-lg">
                  <div className="text-xs font-medium text-primary mb-1">Carry Trade in EM Rates</div>
                  <p className="text-xs text-muted-foreground">Brazil SELIC 10.5%, Indonesia 6.25%, Mexico 11%: attractive carry. Risk: sudden stop + FX depreciation can reverse carry in days. REER overvaluation signals vulnerability.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-muted-foreground/50" />Dedicated EM Debt Managers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {EM_DEBT_FUNDS.map((f, i) => (
                    <div key={`emdf-${i}`} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground">{f.manager}</div>
                        <div className="text-xs text-muted-foreground">{f.flagship}</div>
                        <div className="text-xs text-muted-foreground italic">{f.style}</div>
                      </div>
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground shrink-0">{f.aum}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* China / BRI */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />China BRI Bonds & EM Corporate Dollarization Risks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg border border-red-500/20">
                  <div className="text-xs font-medium text-red-400 mb-1">Belt & Road Initiative (BRI) Debt Diplomacy</div>
                  <p className="text-xs text-muted-foreground">China's BRI has committed $1T+ in infrastructure loans to 140+ countries. Critics cite: opaque terms, collateral clauses (Hambantota port, Zambia copper mines), limited transparency, and debt relief conditionality. Refinancing risks concentrated in 2024–2027.</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg border border-amber-500/20">
                  <div className="text-xs font-medium text-amber-400 mb-1">EM Corporate Dollar Debt Risks</div>
                  <p className="text-xs text-muted-foreground">EM corporates issued $400B+ in USD bonds. Risks: (1) Revenue/cost FX mismatch — local revenue, USD debt service; (2) Refinancing cliff — large maturities 2025–2027; (3) Rising USD rates increase refinancing cost; (4) China property (Evergrande, Sunac) — $300B+ restructuring overhang.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: Country Risk ── */}
        <TabsContent value="risk" className="data-[state=inactive]:hidden space-y-5">
          {/* Risk Framework */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />Country Risk Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {RISK_FRAMEWORK.map((cat, i) => (
                  <div
                    key={`rf-${i}`}
                    className="rounded-lg p-3 cursor-pointer border transition-all"
                    style={{ borderColor: expandedRisk === i ? cat.color : cat.color + "30", background: expandedRisk === i ? cat.color + "15" : "#18181b" }}
                    onClick={() => setExpandedRisk(expandedRisk === i ? null : i)}
                  >
                    <div className="text-xs font-medium mb-2" style={{ color: cat.color }}>{cat.category}</div>
                    <AnimatePresence initial={false}>
                      <ul className="space-y-1">
                        {cat.components.map((c, j) => (
                          <li key={`rfc-${i}-${j}`} className="text-xs text-muted-foreground flex gap-1.5">
                            <span style={{ color: cat.color }}>•</span>{c}
                          </li>
                        ))}
                      </ul>
                    </AnimatePresence>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-muted/40 rounded-lg">
                <div className="text-xs font-medium text-muted-foreground mb-1">Key Risk Rating Providers</div>
                <div className="flex flex-wrap gap-2">
                  {["ICRG (PRS Group)", "EIU Country Risk Service", "Oxford Analytica", "S&P/Moody's/Fitch Sovereign", "World Bank CPIA Score", "IMF Article IV Consultations"].map((r, i) => (
                    <Badge key={`rp-${i}`} variant="outline" className="text-xs border-border text-muted-foreground">{r}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vulnerability Radar */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />EM Vulnerability Indicators — Radar Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VulnerabilityRadar />
              <p className="text-xs text-muted-foreground mt-2">
                Radar scores represent resilience (higher = more resilient). Turkey scores low on Reserves and External accounts; India shows balanced resilience across factors.
                Key IMF/World Bank indicators: CA/GDP, Debt/GDP, FX reserves/months imports, primary fiscal balance, real GDP growth vs debt dynamics.
              </p>
            </CardContent>
          </Card>

          {/* IMF / Debt Sustainability */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5 text-muted-foreground/50" />Debt Sustainability Analysis (DSA) & IMF Programmes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { title: "IMF DSA Methodology", items: ["Baseline + stress scenario debt path", "Gross financing needs vs GDP", "Debt-stabilising primary balance", "Fan charts for uncertainty bands", "Liquidity vs solvency distinction"] },
                  { title: "IMF Programme Dynamics", items: ["SBA (Stand-By Arrangement) — short-term BOP", "EFF (Extended Fund Facility) — medium-term structural", "Conditionality: fiscal targets, CB independence, structural reform", "Tranching: disbursements tied to programme reviews", "Signal effect: lowers spreads for other creditors"] },
                  { title: "Contagion Channels", items: ["Trade linkages — export demand shock", "Financial linkages — bank exposure, cross-holdings", "Confidence/sentiment spillover", "Commodity price channel (EM pairs)", "Reserve currency / dollar funding stress"] },
                ].map((s, i) => (
                  <div key={`dsa-${i}`} className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-2">{s.title}</div>
                    {s.items.map((item, j) => (
                      <div key={`dsa-i-${i}-${j}`} className="text-xs text-muted-foreground flex gap-1.5 mb-0.5">
                        <span className="text-primary shrink-0">•</span>{item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Case Studies */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />EM Crisis Case Studies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {CASE_STUDIES.map((cs, i) => (
                <div
                  key={`cs-${i}`}
                  className="rounded-lg border cursor-pointer transition-all"
                  style={{ borderColor: expandedCase === i ? cs.color : cs.color + "30" }}
                  onClick={() => setExpandedCase(expandedCase === i ? null : i)}
                >
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <Badge className="text-xs shrink-0" style={{ background: cs.color + "25", color: cs.color, border: `1px solid ${cs.color}40` }}>
                        {cs.country} {cs.year}
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground">{cs.event}</span>
                    </div>
                    {expandedCase === i ? <TrendingDown className="w-3.5 h-3.5 text-muted-foreground" /> : <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <AnimatePresence initial={false}>
                    {expandedCase === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="p-2 bg-muted/60 rounded">
                            <div className="text-xs font-medium text-amber-400 mb-1">Trigger</div>
                            <p className="text-xs text-muted-foreground">{cs.trigger}</p>
                          </div>
                          <div className="p-2 bg-muted/60 rounded">
                            <div className="text-xs font-medium text-red-400 mb-1">Outcome</div>
                            <p className="text-xs text-muted-foreground">{cs.outcome}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Frontier vs EM */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />Frontier vs EM Classification Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { tier: "Developed Market (DM)", examples: "US, UK, Japan, Germany, Australia", criteria: "High GDP/capita, deep liquidity, fully open capital account, T+2/T+3 settlement, no foreign ownership limits", color: "#6366f1" },
                  { tier: "Emerging Market (EM)", examples: "China, India, Brazil, Taiwan, Korea, SA, Mexico, Indonesia", criteria: "MSCI EM criteria: market accessibility, size/liquidity, stability, moderate restrictions; GNI > $4,000", color: "#f97316" },
                  { tier: "Frontier Market (FM)", examples: "Vietnam, Nigeria, Kuwait (prior), Romania, Kenya", criteria: "Smaller, less liquid markets; higher political risk; FM indices: MSCI FM, FTSE FM; often pathway to EM promotion", color: "#22c55e" },
                ].map((t, i) => (
                  <div key={`tier-${i}`} className="p-3 rounded-lg border" style={{ borderColor: t.color + "40" }}>
                    <div className="text-xs font-medium mb-1" style={{ color: t.color }}>{t.tier}</div>
                    <div className="text-xs text-muted-foreground font-medium mb-1">Examples: <span className="text-muted-foreground font-normal">{t.examples}</span></div>
                    <p className="text-xs text-muted-foreground">{t.criteria}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: Capital Flows & FX ── */}
        <TabsContent value="flows" className="data-[state=inactive]:hidden space-y-5">
          {/* Capital Flow Cycle */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />EM Capital Flow Cycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CapitalFlowCycleSVG />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                {[
                  { label: "Risk-on inflows", stat: "+$120B/yr peak", color: "text-emerald-400" },
                  { label: "Risk-off outflows", stat: "−$80B crisis week", color: "text-red-400" },
                  { label: "FDI (sticky)", stat: "$600B+ annual", color: "text-primary" },
                  { label: "Portfolio (hot money)", stat: "Most volatile", color: "text-amber-400" },
                ].map((s, i) => (
                  <div key={`cfc-${i}`} className="text-center p-2 bg-muted/50 rounded">
                    <div className={cn("text-sm font-medium", s.color)}>{s.stat}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Push vs Pull */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-indigo-400" />Push vs Pull Factors for EM Capital Flows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PUSH_PULL.map((pp, i) => (
                  <div key={`pp-${i}`} className="p-3 rounded-lg border" style={{ borderColor: pp.color + "40" }}>
                    <div className="text-xs font-medium mb-2" style={{ color: pp.color }}>{pp.type}</div>
                    {pp.factors.map((f, j) => (
                      <div key={`ppf-${i}-${j}`} className="text-xs text-muted-foreground flex gap-1.5 mb-1">
                        <span style={{ color: pp.color }}>→</span>{f}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-xs font-medium text-amber-400 mb-1">Sudden Stop Mechanics</div>
                <p className="text-xs text-muted-foreground">
                  A "sudden stop" (Calvo 1998) is an abrupt capital account reversal. Typically: foreign creditors refuse to roll over short-term debt → FX reserves drain → currency collapses → interest rates spike → growth contraction. Original Sin (EM borrowing in USD rather than local FX) amplifies the damage. Requires IMF support or debt restructuring.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Impossible Trinity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />Impossible Trinity (Trilemma)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImpossibleTrinitySVG />
                <div className="space-y-1.5 mt-2">
                  {[
                    { choice: "China pre-2015", picks: "Fixed rate + independent policy", gave: "Capital controls (still extensive)" },
                    { choice: "Brazil / Mexico", picks: "Free capital + independent policy", gave: "Floating FX (managed float)" },
                    { choice: "Hong Kong / Saudi", picks: "Fixed rate + free capital", gave: "No monetary independence (Fed-linked rates)" },
                  ].map((ex, i) => (
                    <div key={`tri-ex-${i}`} className="text-xs text-muted-foreground p-2 bg-muted/50 rounded flex gap-2">
                      <span className="text-amber-400 shrink-0 font-medium">{ex.choice}:</span>
                      <span className="text-muted-foreground">Chose <span className="text-emerald-400">{ex.picks}</span> → gave up <span className="text-red-400">{ex.gave}</span></span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FX Reserve Adequacy */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground/50" />FX Reserve Adequacy Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {FX_RESERVE_METRICS.map((m, i) => (
                  <div key={`fxr-${i}`} className="p-2.5 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">{m.metric}</span>
                      <Badge className="text-xs" style={{ background: m.color + "25", color: m.color, border: `1px solid ${m.color}40` }}>{m.threshold}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.rationale}</p>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-1">
                  FX Intervention: Sterilized (CB sells FX + issues domestic bonds — neutral money supply) vs Unsterilized (FX sale reduces money supply, tightens conditions). EM CBs intervene heavily during crises.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Deglobalization + CBDCs */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />CBDCs in Emerging Markets & Digital Finance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto mb-3">
                <table className="w-full text-xs text-muted-foreground">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">Country</th>
                      <th className="text-left py-2 text-muted-foreground">System</th>
                      <th className="text-left py-2 text-muted-foreground">Status</th>
                      <th className="text-left py-2 text-muted-foreground">Feature / Ambition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CBDC_DATA.map((c, i) => (
                      <tr key={`cbdc-${i}`} className="border-b border-border/50">
                        <td className="py-2 font-medium" style={{ color: c.color }}>{c.country}</td>
                        <td className="py-2 text-muted-foreground">{c.system}</td>
                        <td className="py-2">
                          <Badge className="text-xs border-border text-muted-foreground" variant="outline">{c.status}</Badge>
                        </td>
                        <td className="py-2 text-muted-foreground">{c.feature}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs font-medium text-emerald-400 mb-1">Remittance Flows ($800B+ annually)</div>
                  <p className="text-xs text-muted-foreground">
                    Remittances are the largest and most stable EM capital inflow — exceeding FDI in many countries (Philippines 9% of GDP, Mexico 3.5%, Egypt 7%). Digital rails (UPI, PIX, M-Pesa) are disrupting costly correspondent banking (avg cost 6.2% → target 3%). Blockchain-based corridors (Ripple, Stellar) emerging.
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs font-medium text-amber-400 mb-1">Deglobalization Impact on EM</div>
                  <p className="text-xs text-muted-foreground">
                    US-China tech/trade decoupling fragments EM supply chains. "Friend-shoring" benefits Mexico (nearshoring boom), Vietnam, India (Apple diversification). China-adjacent EMs (Cambodia, Myanmar) face headwinds. EM debt market access may narrow if sanctions risk rises for countries aligned with Russia/China.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* China capital account */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-red-400" />China Capital Account Liberalisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { title: "Completed Milestones", color: "#22c55e", items: ["Stock Connect (2014, 2016) — HK↔Shanghai/Shenzhen", "Bond Connect (2017) — Northbound foreign access to CGB", "RMB SDR inclusion (2016)", "MSCI A-share partial inclusion (2018)", "FTSE Russell China GB index (2021)"] },
                  { title: "Ongoing Restrictions", color: "#f97316", items: ["QDII/QFII quota limits on outbound/inbound funds", "Annual $50k individual FX conversion cap", "Capital gains repatriation timing constraints", "Property/offshore investment restrictions", "Cross-border data localization for financial data"] },
                  { title: "Strategic Calculus", color: "#6366f1", items: ["Internationalization without full opening = control", "e-CNY as BRI settlement / reserve alternative", "Offshore RMB (CNH) vs onshore (CNY) gap persists", "USD weaponization (sanctions) accelerates RMB push", "CIPS (SWIFT alternative) expanding EM transaction rails"] },
                ].map((sec, i) => (
                  <div key={`cca-${i}`} className="p-3 rounded-lg border" style={{ borderColor: sec.color + "40" }}>
                    <div className="text-xs font-medium mb-2" style={{ color: sec.color }}>{sec.title}</div>
                    {sec.items.map((item, j) => (
                      <div key={`ccai-${i}-${j}`} className="text-xs text-muted-foreground flex gap-1.5 mb-1">
                        <span style={{ color: sec.color }}>•</span>{item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
