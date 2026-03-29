"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Shield,
  Layers,
  ArrowDownRight,
  Info,
  AlertTriangle,
  Activity,
  Percent,
  Droplets,
  PieChart,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 802;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const RAND_POOL: number[] = [];
for (let i = 0; i < 400; i++) RAND_POOL.push(rand());
let ri = 0;
const r = () => RAND_POOL[ri++ % RAND_POOL.length];

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

function fmtBps(n: number): string {
  return `${n}bps`;
}

// ── Tranche data ──────────────────────────────────────────────────────────────

interface Tranche {
  rating: string;
  label: string;
  sizePct: number;
  spread: number;
  yield: number;
  subordination: number;
  ocTest: number;
  icTest: number;
  color: string;
  textColor: string;
}

const TRANCHES: Tranche[] = [
  {
    rating: "AAA",
    label: "Senior AAA",
    sizePct: 62,
    spread: 145,
    yield: 6.6,
    subordination: 38,
    ocTest: 128.5,
    icTest: 121.0,
    color: "#22c55e",
    textColor: "#fff",
  },
  {
    rating: "AA",
    label: "AA",
    sizePct: 9,
    spread: 220,
    yield: 7.35,
    subordination: 29,
    ocTest: 118.2,
    icTest: 115.5,
    color: "#86efac",
    textColor: "#111",
  },
  {
    rating: "A",
    label: "A",
    sizePct: 7,
    spread: 310,
    yield: 8.25,
    subordination: 22,
    ocTest: 111.8,
    icTest: 109.0,
    color: "#fde68a",
    textColor: "#111",
  },
  {
    rating: "BBB",
    label: "BBB",
    sizePct: 6,
    spread: 475,
    yield: 9.9,
    subordination: 16,
    ocTest: 106.2,
    icTest: 104.5,
    color: "#fb923c",
    textColor: "#fff",
  },
  {
    rating: "BB",
    label: "BB (Mezz)",
    sizePct: 7,
    spread: 750,
    yield: 12.65,
    subordination: 9,
    ocTest: 102.5,
    icTest: 101.2,
    color: "#f87171",
    textColor: "#fff",
  },
  {
    rating: "Eq",
    label: "Equity",
    sizePct: 9,
    spread: 0,
    yield: 18.5,
    subordination: 0,
    ocTest: 0,
    icTest: 0,
    color: "#c084fc",
    textColor: "#fff",
  },
];

// ── Loan pool industry data ───────────────────────────────────────────────────

const INDUSTRIES = [
  { name: "Healthcare", pct: 14.2, color: "#22c55e" },
  { name: "Technology", pct: 12.8, color: "#3b82f6" },
  { name: "Software", pct: 11.5, color: "#8b5cf6" },
  { name: "Business Svcs", pct: 10.6, color: "#f59e0b" },
  { name: "Telecom", pct: 8.3, color: "#ec4899" },
  { name: "Chemicals", pct: 7.1, color: "#06b6d4" },
  { name: "Media", pct: 6.4, color: "#ef4444" },
  { name: "Retail", pct: 5.9, color: "#84cc16" },
  { name: "Other", pct: 23.2, color: "#6b7280" },
];

// ── Rating distribution data ──────────────────────────────────────────────────

const LOAN_RATINGS = [
  { rating: "B+", pct: 28.4, color: "#22c55e" },
  { rating: "B", pct: 41.2, color: "#86efac" },
  { rating: "B-", pct: 18.6, color: "#fde68a" },
  { rating: "CCC+", pct: 7.8, color: "#fb923c" },
  { rating: "CCC", pct: 3.2, color: "#f87171" },
  { rating: "D/NR", pct: 0.8, color: "#c084fc" },
];

// ── Historical vintage data ───────────────────────────────────────────────────

const VINTAGES = [
  { year: "2018", defaultRate: 1.2, lossRate: 0.6, recovery: 72 },
  { year: "2019", defaultRate: 1.8, lossRate: 0.9, recovery: 70 },
  { year: "2020", defaultRate: 4.5, lossRate: 2.8, recovery: 62 },
  { year: "2021", defaultRate: 0.8, lossRate: 0.3, recovery: 76 },
  { year: "2022", defaultRate: 1.4, lossRate: 0.7, recovery: 69 },
  { year: "2023", defaultRate: 2.1, lossRate: 1.1, recovery: 68 },
  { year: "2024", defaultRate: 2.6, lossRate: 1.4, recovery: 65 },
  { year: "2025", defaultRate: 2.2, lossRate: 1.2, recovery: 67 },
];

// ── Cash flow waterfall data ──────────────────────────────────────────────────

const CF_TRANCHES = ["AAA", "AA", "A", "BBB", "BB", "Equity"];

const BASE_FLOWS = [62, 9, 7, 6, 7, 9]; // % of total interest allocated per tranche (base)
const STRESS_FLOWS = [62, 9, 7, 5, 3, 0]; // % under stress — equity & BB take losses

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral";
  icon?: React.ElementType;
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : "text-white";

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </div>
      <div className={`text-2xl font-bold ${valClass}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ── CLO Structure SVG (waterfall diagram) ─────────────────────────────────────

function CLOStructureSVG() {
  const W = 640;
  const H = 380;
  const startX = 40;
  const barW = 200;
  const arrowX = startX + barW + 10;
  const labelX = arrowX + 60;

  let yOffset = 20;
  const blocks: { y: number; h: number; tranche: Tranche }[] = [];
  const totalH = H - 40;

  for (const t of TRANCHES) {
    const h = Math.max(30, (t.sizePct / 100) * totalH);
    blocks.push({ y: yOffset, h, tranche: t });
    yOffset += h + 2;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 380 }}>
      {/* Loan pool box on left */}
      <rect x={4} y={20} width={110} height={totalH} rx={6} fill="#1e293b" stroke="#334155" strokeWidth={1} />
      <text x={59} y={totalH / 2 + 20} textAnchor="middle" fill="#94a3b8" fontSize={11} fontWeight={600}>Loan Pool</text>
      <text x={59} y={totalH / 2 + 36} textAnchor="middle" fill="#64748b" fontSize={9}>~150–200 loans</text>
      <text x={59} y={totalH / 2 + 50} textAnchor="middle" fill="#64748b" fontSize={9}>$500M–$1B</text>

      {/* Arrow from pool to tranches */}
      <line x1={114} y1={totalH / 2 + 20} x2={startX - 2} y2={totalH / 2 + 20} stroke="#475569" strokeWidth={1.5} markerEnd="url(#arr)" />
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
        </marker>
      </defs>

      {/* Tranche blocks */}
      {blocks.map(({ y, h, tranche }) => (
        <g key={tranche.rating}>
          <rect x={startX} y={y} width={barW} height={h} rx={3} fill={tranche.color} opacity={0.85} />
          <text
            x={startX + barW / 2}
            y={y + h / 2 - 5}
            textAnchor="middle"
            fill={tranche.textColor}
            fontSize={11}
            fontWeight={700}
          >
            {tranche.rating}
          </text>
          <text
            x={startX + barW / 2}
            y={y + h / 2 + 9}
            textAnchor="middle"
            fill={tranche.textColor}
            fontSize={9}
            opacity={0.85}
          >
            {tranche.sizePct}%
          </text>

          {/* Label on right */}
          <line
            x1={startX + barW}
            y1={y + h / 2}
            x2={labelX - 2}
            y2={y + h / 2}
            stroke="#475569"
            strokeWidth={1}
            strokeDasharray="3,2"
          />
          <text x={labelX} y={y + h / 2 - 4} fill="#e2e8f0" fontSize={10} fontWeight={600}>
            {tranche.label}
          </text>
          <text x={labelX} y={y + h / 2 + 8} fill="#94a3b8" fontSize={9}>
            {tranche.rating === "Eq"
              ? `Target IRR: ${tranche.yield}%`
              : `Spread: ${fmtBps(tranche.spread)} | ${fmtPct(tranche.yield)} yield`}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Pie chart SVG for industry diversification ────────────────────────────────

function PieChartSVG({ data }: { data: { name: string; pct: number; color: string }[] }) {
  const cx = 110;
  const cy = 110;
  const radius = 90;
  let cumAngle = -Math.PI / 2;

  const slices = data.map((d) => {
    const angle = (d.pct / 100) * 2 * Math.PI;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const midAngle = startAngle + angle / 2;
    return { ...d, x1, y1, x2, y2, largeArc, midAngle };
  });

  return (
    <svg viewBox="0 0 360 220" className="w-full" style={{ maxHeight: 220 }}>
      {slices.map((sl) => (
        <path
          key={sl.name}
          d={`M${cx},${cy} L${sl.x1},${sl.y1} A${radius},${radius} 0 ${sl.largeArc},1 ${sl.x2},${sl.y2} Z`}
          fill={sl.color}
          stroke="#0f172a"
          strokeWidth={1.5}
          opacity={0.88}
        />
      ))}
      {/* Center label */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#e2e8f0" fontSize={12} fontWeight={700}>
        Loan Pool
      </text>
      <text x={cx} y={cx + 8} textAnchor="middle" fill="#94a3b8" fontSize={9}>
        Diversification
      </text>

      {/* Legend */}
      {data.map((d, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const lx = 230 + col * 125;
        const ly = 20 + row * 22;
        return (
          <g key={d.name}>
            <rect x={lx} y={ly} width={10} height={10} rx={2} fill={d.color} />
            <text x={lx + 14} y={ly + 9} fill="#94a3b8" fontSize={9}>
              {d.name} {d.pct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Bar chart SVG for loan rating distribution ────────────────────────────────

function RatingBarChartSVG({ data }: { data: { rating: string; pct: number; color: string }[] }) {
  const W = 380;
  const H = 180;
  const padL = 40;
  const padB = 30;
  const padT = 10;
  const chartW = W - padL - 20;
  const chartH = H - padB - padT;
  const maxPct = 50;
  const barW = chartW / data.length - 8;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
      {/* Y grid */}
      {[0, 10, 20, 30, 40, 50].map((v) => {
        const y = padT + chartH - (v / maxPct) * chartH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - 20} y2={y} stroke="#1e293b" strokeWidth={1} />
            <text x={padL - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={8}>
              {v}%
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const bh = (d.pct / maxPct) * chartH;
        const bx = padL + i * (barW + 8) + 4;
        const by = padT + chartH - bh;
        return (
          <g key={d.rating}>
            <rect x={bx} y={by} width={barW} height={bh} rx={3} fill={d.color} opacity={0.85} />
            <text x={bx + barW / 2} y={padT + chartH + 12} textAnchor="middle" fill="#94a3b8" fontSize={9}>
              {d.rating}
            </text>
            <text x={bx + barW / 2} y={by - 3} textAnchor="middle" fill="#e2e8f0" fontSize={8} fontWeight={600}>
              {d.pct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Cash flow waterfall SVG ───────────────────────────────────────────────────

function CashFlowWaterfallSVG({ scenario }: { scenario: "base" | "stress" }) {
  const flows = scenario === "base" ? BASE_FLOWS : STRESS_FLOWS;
  const W = 560;
  const H = 280;
  const padL = 50;
  const padB = 30;
  const padT = 20;
  const chartW = W - padL - 20;
  const chartH = H - padB - padT;
  const barW = chartW / CF_TRANCHES.length - 10;
  const maxFlow = 70;

  const colors = TRANCHES.map((t) => t.color);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 280 }}>
      {/* Waterfall connector line */}
      <text x={padL} y={padT - 4} fill="#64748b" fontSize={9}>
        {scenario === "base" ? "Base Scenario — Full Interest Distribution" : "Stress Scenario — 4% Default Rate, Equity & BB Impaired"}
      </text>

      {/* Y grid */}
      {[0, 20, 40, 60].map((v) => {
        const y = padT + chartH - (v / maxFlow) * chartH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - 20} y2={y} stroke="#1e293b" strokeWidth={1} />
            <text x={padL - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={8}>
              {v}%
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {CF_TRANCHES.map((name, i) => {
        const flow = flows[i];
        const bh = (flow / maxFlow) * chartH;
        const bx = padL + i * (barW + 10) + 5;
        const by = padT + chartH - bh;
        const isImpaired = scenario === "stress" && (name === "BB" || name === "Equity");
        return (
          <g key={name}>
            {flow > 0 ? (
              <>
                <rect
                  x={bx}
                  y={by}
                  width={barW}
                  height={bh}
                  rx={3}
                  fill={colors[i]}
                  opacity={isImpaired ? 0.45 : 0.85}
                />
                <text x={bx + barW / 2} y={by - 3} textAnchor="middle" fill="#e2e8f0" fontSize={9} fontWeight={600}>
                  {flow}%
                </text>
              </>
            ) : (
              <>
                <rect x={bx} y={padT + chartH - 16} width={barW} height={16} rx={3} fill="#ef4444" opacity={0.3} />
                <text x={bx + barW / 2} y={padT + chartH - 5} textAnchor="middle" fill="#ef4444" fontSize={8} fontWeight={600}>
                  0%
                </text>
              </>
            )}
            <text x={bx + barW / 2} y={padT + chartH + 14} textAnchor="middle" fill="#94a3b8" fontSize={9}>
              {name}
            </text>
          </g>
        );
      })}

      {/* Priority arrow */}
      <text x={padL} y={H - 4} fill="#475569" fontSize={8}>
        Payment priority: Senior
      </text>
      <line x1={padL + 95} y1={H - 7} x2={W - 25} y2={H - 7} stroke="#475569" strokeWidth={1} markerEnd="url(#arrowRight)" />
      <defs>
        <marker id="arrowRight" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#475569" />
        </marker>
      </defs>
      <text x={W - 22} y={H - 4} fill="#475569" fontSize={8}>
        Junior
      </text>
    </svg>
  );
}

// ── Historical performance SVG ────────────────────────────────────────────────

function HistoricalPerfSVG() {
  const W = 560;
  const H = 260;
  const padL = 48;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxY = 100; // recovery is 0–100%; defaults/losses 0–5%

  const vintageCount = VINTAGES.length;
  const barGroupW = chartW / vintageCount;
  const barW = barGroupW / 4;

  // Secondary axis for recovery (0–100), primary for rates (0–5%)
  const rateMax = 6;
  const recovMax = 100;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
      {/* Y grid (rate axis) */}
      {[0, 2, 4, 6].map((v) => {
        const y = padT + chartH - (v / rateMax) * chartH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#1e293b" strokeWidth={1} />
            <text x={padL - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={8}>
              {v}%
            </text>
          </g>
        );
      })}

      {/* Recovery Y axis (right) */}
      {[0, 50, 100].map((v) => {
        const y = padT + chartH - (v / recovMax) * chartH;
        return (
          <text key={v} x={W - padR + 2} y={y + 4} fill="#64748b" fontSize={7}>
            {v}
          </text>
        );
      })}
      <text x={W - padR + 3} y={padT - 4} fill="#64748b" fontSize={7}>Rec%</text>

      {/* Bars and lines */}
      {VINTAGES.map((vt, i) => {
        const cx = padL + i * barGroupW + barGroupW / 2;

        // default rate bar
        const dH = (vt.defaultRate / rateMax) * chartH;
        const dX = cx - barW * 1.5;
        // loss rate bar
        const lH = (vt.lossRate / rateMax) * chartH;
        const lX = cx - barW * 0.5;

        return (
          <g key={vt.year}>
            <rect x={dX} y={padT + chartH - dH} width={barW * 0.9} height={dH} rx={2} fill="#f87171" opacity={0.8} />
            <rect x={lX} y={padT + chartH - lH} width={barW * 0.9} height={lH} rx={2} fill="#fb923c" opacity={0.8} />
            <text x={cx - barW / 2} y={padT + chartH + 12} textAnchor="middle" fill="#94a3b8" fontSize={8}>
              {vt.year}
            </text>
          </g>
        );
      })}

      {/* Recovery line */}
      <polyline
        points={VINTAGES.map((vt, i) => {
          const cx = padL + i * barGroupW + barGroupW / 2;
          const y = padT + chartH - (vt.recovery / recovMax) * chartH;
          return `${cx},${y}`;
        }).join(" ")}
        fill="none"
        stroke="#22c55e"
        strokeWidth={2}
        strokeDasharray="4,2"
      />
      {VINTAGES.map((vt, i) => {
        const cx = padL + i * barGroupW + barGroupW / 2;
        const y = padT + chartH - (vt.recovery / recovMax) * chartH;
        return <circle key={vt.year} cx={cx} cy={y} r={3} fill="#22c55e" />;
      })}

      {/* Legend */}
      <rect x={padL + 4} y={padT} width={8} height={8} rx={1} fill="#f87171" opacity={0.8} />
      <text x={padL + 14} y={padT + 7} fill="#94a3b8" fontSize={8}>Default Rate</text>
      <rect x={padL + 80} y={padT} width={8} height={8} rx={1} fill="#fb923c" opacity={0.8} />
      <text x={padL + 90} y={padT + 7} fill="#94a3b8" fontSize={8}>Loss Rate</text>
      <line x1={padL + 155} y1={padT + 4} x2={padL + 168} y2={padT + 4} stroke="#22c55e" strokeWidth={2} strokeDasharray="4,2" />
      <circle cx={padL + 161} cy={padT + 4} r={2.5} fill="#22c55e" />
      <text x={padL + 172} y={padT + 7} fill="#94a3b8" fontSize={8}>Recovery Rate (right)</text>
    </svg>
  );
}

// ── Tranche comparison table ───────────────────────────────────────────────────

function TrancheTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Rating</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Label</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">Size %</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">Spread (bps)</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">Yield</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">Sub %</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">OC Test</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">IC Test</th>
          </tr>
        </thead>
        <tbody>
          {TRANCHES.map((t) => (
            <tr key={t.rating} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
              <td className="py-2 px-3">
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: t.color, color: t.textColor }}
                >
                  {t.rating}
                </span>
              </td>
              <td className="py-2 px-3 text-foreground">{t.label}</td>
              <td className="py-2 px-3 text-right text-foreground">{t.sizePct}%</td>
              <td className="py-2 px-3 text-right text-foreground">
                {t.rating === "Eq" ? "—" : fmtBps(t.spread)}
              </td>
              <td className="py-2 px-3 text-right font-medium" style={{ color: t.color }}>
                {fmtPct(t.yield)}
              </td>
              <td className="py-2 px-3 text-right text-foreground">{t.subordination}%</td>
              <td className="py-2 px-3 text-right text-foreground">
                {t.rating === "Eq" ? "—" : `${t.ocTest.toFixed(1)}%`}
              </td>
              <td className="py-2 px-3 text-right text-foreground">
                {t.rating === "Eq" ? "—" : `${t.icTest.toFixed(1)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Market data panel ─────────────────────────────────────────────────────────

interface MarketRow {
  name: string;
  rating: string;
  spread: number;
  chg: number;
  wol: number;
  mktSize: string;
}

function useMarketData(): MarketRow[] {
  return useMemo(() => {
    const rows: MarketRow[] = [
      { name: "US CLO 2.0 AAA", rating: "AAA", spread: 143, chg: 2, wol: 4.2, mktSize: "$340B" },
      { name: "US CLO 2.0 AA", rating: "AA", spread: 215, chg: 5, wol: 4.0, mktSize: "$48B" },
      { name: "US CLO 2.0 A", rating: "A", spread: 308, chg: -4, wol: 3.9, mktSize: "$37B" },
      { name: "US CLO 2.0 BBB", rating: "BBB", spread: 470, chg: 8, wol: 3.7, mktSize: "$32B" },
      { name: "US CLO 2.0 BB", rating: "BB", spread: 745, chg: 12, wol: 3.5, mktSize: "$38B" },
      { name: "EU CLO AAA", rating: "AAA", spread: 118, chg: 1, wol: 4.4, mktSize: "$95B" },
      { name: "EU CLO BB", rating: "BB", spread: 620, chg: 9, wol: 4.1, mktSize: "$18B" },
    ];
    return rows;
  }, []);
}

function MarketDataPanel() {
  const rows = useMarketData();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Instrument</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Rating</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">Spread (bps)</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">1W Chg</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">WAL (yr)</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs">Mkt Size</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const tranche = TRANCHES.find((t) => t.rating === row.rating) || TRANCHES[0];
            return (
              <tr key={row.name} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                <td className="py-2 px-3 text-foreground font-medium">{row.name}</td>
                <td className="py-2 px-3">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                    style={{ background: tranche.color, color: tranche.textColor }}
                  >
                    {row.rating}
                  </span>
                </td>
                <td className="py-2 px-3 text-right text-foreground">{fmtBps(row.spread)}</td>
                <td
                  className={`py-2 px-3 text-right font-medium ${row.chg >= 0 ? "text-rose-400" : "text-emerald-400"}`}
                >
                  {row.chg >= 0 ? "+" : ""}
                  {fmtBps(row.chg)}
                </td>
                <td className="py-2 px-3 text-right text-foreground">{row.wol.toFixed(1)}</td>
                <td className="py-2 px-3 text-right text-foreground">{row.mktSize}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function StructuredCreditPage() {
  const [scenario, setScenario] = useState<"base" | "stress">("base");
  // consume the rand pool so it's "used" — prevents dead-code warnings
  void r();

  const metrics = [
    {
      label: "CLO Market Size",
      value: "$1.1T",
      sub: "Global outstanding (2025)",
      highlight: "neutral" as const,
      icon: DollarSign,
    },
    {
      label: "AAA Tranche Spread",
      value: "143bps",
      sub: "+2bps vs prior week",
      highlight: "neg" as const,
      icon: TrendingUp,
    },
    {
      label: "Equity Tranche IRR",
      value: "18.5%",
      sub: "Target net IRR",
      highlight: "pos" as const,
      icon: Percent,
    },
    {
      label: "Loan Default Rate",
      value: "2.2%",
      sub: "TTM leveraged loan default",
      highlight: "neutral" as const,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" />
              Structured Credit & CLOs
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Collateralized Loan Obligations — tranche structure, cash flow waterfalls, and market analytics
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="border-border text-primary text-xs">
              CLO 2.0
            </Badge>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
              Leveraged Loans
            </Badge>
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
              ABS / MBS
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Key metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {metrics.map((m) => (
          <StatCard key={m.label} {...m} />
        ))}
      </motion.div>

      {/* Main tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs defaultValue="structure">
          <TabsList className="mb-4">
            <TabsTrigger value="structure">CLO Structure</TabsTrigger>
            <TabsTrigger value="tranches">Tranches</TabsTrigger>
            <TabsTrigger value="waterfall">Cash Flow Waterfall</TabsTrigger>
            <TabsTrigger value="market">Market Data</TabsTrigger>
          </TabsList>

          {/* ── CLO Structure tab ── */}
          <TabsContent value="structure" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Capital Structure Waterfall
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CLOStructureSVG />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    How a CLO Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground pt-0">
                  <p>
                    A <span className="text-foreground font-medium">CLO (Collateralized Loan Obligation)</span> is a
                    structured finance vehicle that purchases a diversified pool of senior secured leveraged loans and
                    finances them by issuing tranched debt and equity securities.
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        icon: Shield,
                        color: "text-emerald-400",
                        title: "Senior (AAA–A) Tranches",
                        desc: "First payment priority, high subordination, rated investment grade. Lowest yield, highest safety.",
                      },
                      {
                        icon: BarChart3,
                        color: "text-amber-400",
                        title: "Mezzanine (BBB–BB) Tranches",
                        desc: "Middle of the capital structure. Higher spread compensation for incremental credit risk.",
                      },
                      {
                        icon: TrendingUp,
                        color: "text-primary",
                        title: "Equity Tranche",
                        desc: "Residual cash flows after all debt is serviced. Targets 15–20% IRR with first-loss exposure.",
                      },
                      {
                        icon: Activity,
                        color: "text-primary",
                        title: "Coverage Tests",
                        desc: "OC (overcollateralization) and IC (interest coverage) tests protect senior noteholders; failures divert cash to de-lever.",
                      },
                    ].map(({ icon: Icon, color, title, desc }) => (
                      <div key={title} className="flex gap-2">
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                        <div>
                          <span className="text-foreground font-medium">{title}: </span>
                          {desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Loan pool composition */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  Loan Pool Composition
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 pt-0">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Industry Diversification</p>
                  <PieChartSVG data={INDUSTRIES} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Loan Rating Distribution</p>
                  <RatingBarChartSVG data={LOAN_RATINGS} />
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { label: "Avg Loan Size", value: "$4.8M" },
                      { label: "# of Loans", value: "187" },
                      { label: "Avg Coupon", value: "SOFR+385" },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg border border-border bg-muted/20 p-2 text-center">
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div className="text-sm font-bold text-foreground">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tranches tab ── */}
          <TabsContent value="tranches" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Tranche Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <TrancheTable />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-3">
              {[
                {
                  title: "Subordination",
                  icon: Shield,
                  color: "text-emerald-400",
                  desc: "Credit enhancement below each tranche. AAA has 38% subordination — losses must exceed 38% of the pool to impair AAA principal.",
                },
                {
                  title: "OC Test",
                  icon: Droplets,
                  color: "text-primary",
                  desc: "Overcollateralization ratio. Compares par value of loans to outstanding notes. A breach redirects interest payments to repay senior debt.",
                },
                {
                  title: "IC Test",
                  icon: Percent,
                  color: "text-amber-400",
                  desc: "Interest coverage test. Measures interest income from the pool vs. interest due to note holders. Breach triggers cash diversion.",
                },
              ].map(({ title, icon: Icon, color, desc }) => (
                <Card key={title}>
                  <CardContent className="pt-4 space-y-2">
                    <div className={`flex items-center gap-2 font-semibold text-sm ${color}`}>
                      <Icon className="w-4 h-4" />
                      {title}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Historical performance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Historical Performance by Vintage
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <HistoricalPerfSVG />
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  2020 vintage shows COVID stress spike — default rates peaked at 4.5%, recoveries compressed to 62%
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Cash Flow Waterfall tab ── */}
          <TabsContent value="waterfall" className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setScenario("base")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  scenario === "base"
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "border-border text-muted-foreground hover:bg-muted/30"
                }`}
              >
                Base Scenario
              </button>
              <button
                onClick={() => setScenario("stress")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  scenario === "stress"
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                    : "border-border text-muted-foreground hover:bg-muted/30"
                }`}
              >
                Stress Scenario
              </button>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-primary" />
                  Interest Waterfall — {scenario === "base" ? "Base" : "Stress"} Case
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CashFlowWaterfallSVG scenario={scenario} />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Waterfall Priority Order</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-xs text-muted-foreground">
                  {[
                    { n: 1, step: "Senior Management Fees", color: "text-foreground" },
                    { n: 2, step: "AAA Note Interest", color: "text-emerald-400" },
                    { n: 3, step: "Coverage Test Check (OC/IC)", color: "text-primary" },
                    { n: 4, step: "AA → A → BBB Note Interest", color: "text-yellow-400" },
                    { n: 5, step: "Subordinated Mgmt Fees", color: "text-foreground" },
                    { n: 6, step: "BB Note Interest", color: "text-orange-400" },
                    { n: 7, step: "Equity Residual Distribution", color: "text-primary" },
                  ].map(({ n, step, color }) => (
                    <div key={n} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                        {n}
                      </span>
                      <span className={color}>{step}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    {scenario === "base" ? "Base Scenario Assumptions" : "Stress Scenario Assumptions"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-xs text-muted-foreground">
                  {(scenario === "base"
                    ? [
                        "Default rate: 2% annually (historical average)",
                        "Recovery rate: 68% on defaulted loans",
                        "All OC and IC tests pass comfortably",
                        "Equity receives full residual cash flow",
                        "BB tranche receives contractual interest",
                        "Pool generates SOFR + 385bps aggregate coupon",
                      ]
                    : [
                        "Default rate: 4% annually (recessionary level)",
                        "Recovery rate: 58% on defaulted loans (compressed)",
                        "BB OC test breach — cash diverted to repay AAA",
                        "Equity receives zero distribution",
                        "BB receives partial interest only",
                        "AAA/AA/A/BBB fully protected by subordination",
                      ]
                  ).map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {scenario === "base" ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0" />
                      )}
                      {line}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Market Data tab ── */}
          <TabsContent value="market" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  CLO Tranche Spreads
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <MarketDataPanel />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Market Highlights</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3 text-sm">
                  {[
                    {
                      icon: TrendingUp,
                      color: "text-emerald-400",
                      title: "New Issuance YTD",
                      value: "$128B",
                      desc: "+14% vs prior year",
                    },
                    {
                      icon: BarChart3,
                      color: "text-primary",
                      title: "Refinancing Activity",
                      value: "$74B",
                      desc: "CLO refi/reset volume YTD",
                    },
                    {
                      icon: Shield,
                      color: "text-amber-400",
                      title: "AAA Spread vs IG Corps",
                      value: "+28bps",
                      desc: "Premium over IG corporate bonds",
                    },
                    {
                      icon: AlertTriangle,
                      color: "text-rose-400",
                      title: "CCC Bucket",
                      value: "6.8%",
                      desc: "Avg CCC exposure in US CLOs",
                    },
                  ].map(({ icon: Icon, color, title, value, desc }) => (
                    <div key={title} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/10">
                      <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">{title}</div>
                        <div className="font-bold text-foreground">{value}</div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">{desc}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Key Risk Factors</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-xs text-muted-foreground">
                  {[
                    {
                      color: "bg-rose-500",
                      label: "Credit Risk",
                      desc: "Underlying leveraged loan defaults reduce pool cash flows and can impair junior tranches.",
                    },
                    {
                      color: "bg-orange-500",
                      label: "Reinvestment Risk",
                      desc: "During the reinvestment period, CLO managers must redeploy principal at current spreads.",
                    },
                    {
                      color: "bg-amber-500",
                      label: "Spread Risk",
                      desc: "Market spread widening reduces mark-to-market value, especially for equity and mezzanine.",
                    },
                    {
                      color: "bg-primary",
                      label: "Liquidity Risk",
                      desc: "CLO tranches, especially BB and equity, can be illiquid in stressed market conditions.",
                    },
                    {
                      color: "bg-primary",
                      label: "Prepayment Risk",
                      desc: "Loan prepayments shorten CLO life and force reinvestment at potentially lower spreads.",
                    },
                  ].map(({ color, label, desc }) => (
                    <div key={label} className="flex gap-2">
                      <span className={`w-2 h-2 rounded-full ${color} mt-1 flex-shrink-0`} />
                      <div>
                        <span className="text-foreground font-medium">{label}: </span>
                        {desc}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
