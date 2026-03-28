"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Shield,
  AlertTriangle,
  ArrowUpDown,
  Layers,
  RefreshCw,
  Info,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ──────────────────────────────────────────────────────────────
let s = 622008;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 622008;
}

// ── Interfaces ───────────────────────────────────────────────────────────────
interface VixFuturesPoint {
  label: string;
  value: number;
  daysToExp: number;
}

interface StrategyRow {
  name: string;
  maxGain: string;
  maxLoss: string;
  breakeven: string;
  idealVix: string;
  riskRating: number;
}

interface PayoffPoint {
  price: number;
  pnl: number;
}

interface EtpDataPoint {
  day: number;
  vxx: number;
  svxy: number;
  vix: number;
}

interface ArbitrageDataPoint {
  day: number;
  impliedVol: number;
  realizedVol: number;
  spread: number;
  cumPnl: number;
}

interface VolSurfaceCell {
  strike: number;
  expiry: string;
  iv: number;
}

// ── Data generation ──────────────────────────────────────────────────────────

function generateVixTermStructure(): VixFuturesPoint[] {
  resetSeed();
  const spotVix = 16.8 + rand() * 2 - 1;
  const labels = ["Spot", "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"];
  const daysToExp = [0, 22, 50, 78, 106, 134, 162, 190, 218];
  const contango = rand() > 0.3; // 70% chance contango
  return labels.map((label, i) => {
    const drift = contango ? i * 0.55 + rand() * 0.4 - 0.2 : -i * 0.4 + rand() * 0.5 - 0.25;
    return {
      label,
      value: Math.max(10, spotVix + drift),
      daysToExp: daysToExp[i],
    };
  });
}

function generateVolSurface(): VolSurfaceCell[] {
  resetSeed();
  const strikes = [80, 85, 90, 95, 100, 105, 110, 115, 120];
  const expiries = ["7d", "14d", "30d", "60d", "90d"];
  const atm = 18.5;
  const cells: VolSurfaceCell[] = [];
  expiries.forEach((expiry, ei) => {
    strikes.forEach((strike) => {
      const moneyness = (strike - 100) / 100;
      // Volatility smile: higher IV at extremes, slight skew toward puts
      const smile = 8 * moneyness * moneyness - 2 * moneyness + rand() * 0.8 - 0.4;
      const termAdj = ei * 0.6;
      cells.push({ strike, expiry, iv: Math.max(8, atm + smile + termAdj) });
    });
  });
  return cells;
}

function generateStraddlePayoff(strike: number, premium: number): PayoffPoint[] {
  const points: PayoffPoint[] = [];
  for (let price = strike * 0.7; price <= strike * 1.3; price += strike * 0.01) {
    const callPnl = Math.max(0, price - strike);
    const putPnl = Math.max(0, strike - price);
    points.push({ price, pnl: callPnl + putPnl - premium });
  }
  return points;
}

function generateStranglePayoff(lowerStrike: number, upperStrike: number, premium: number): PayoffPoint[] {
  const points: PayoffPoint[] = [];
  const mid = (lowerStrike + upperStrike) / 2;
  for (let price = mid * 0.65; price <= mid * 1.35; price += mid * 0.01) {
    const callPnl = Math.max(0, price - upperStrike);
    const putPnl = Math.max(0, lowerStrike - price);
    points.push({ price, pnl: callPnl + putPnl - premium });
  }
  return points;
}

function generateIronCondorPayoff(): PayoffPoint[] {
  const lowerPut = 90, shortPut = 95, shortCall = 105, upperCall = 110;
  const credit = 2.4;
  const points: PayoffPoint[] = [];
  for (let price = 80; price <= 120; price += 0.5) {
    let pnl = credit;
    if (price < lowerPut) pnl = credit - (shortPut - lowerPut);
    else if (price < shortPut) pnl = credit - (shortPut - price);
    else if (price > upperCall) pnl = credit - (price - upperCall);
    else if (price > shortCall) pnl = credit - (price - shortCall);
    points.push({ price, pnl });
  }
  return points;
}

function generateEtpData(): EtpDataPoint[] {
  resetSeed();
  const data: EtpDataPoint[] = [];
  let vxx = 100;
  let svxy = 100;
  let vix = 18 + rand() * 4 - 2;

  for (let day = 0; day < 120; day++) {
    const vixChange = (rand() - 0.52) * 3;
    vix = Math.max(9, vix + vixChange);

    // VXX decays due to roll yield in contango ~0.1%/day, spikes with VIX
    const rollDecay = -0.0012 * vxx;
    const vxxChange = rollDecay + (vixChange / vix) * vxx * 0.6;
    vxx = Math.max(1, vxx + vxxChange);

    // SVXY benefits from roll yield, loses in spikes
    const svxyRollGain = 0.0008 * svxy;
    const svxyChange = svxyRollGain - (vixChange / vix) * svxy * 0.5;
    svxy = Math.max(1, svxy + svxyChange);

    data.push({ day, vxx, svxy, vix });
  }
  return data;
}

function generateArbitrageData(): ArbitrageDataPoint[] {
  resetSeed();
  const data: ArbitrageDataPoint[] = [];
  let impliedVol = 22;
  let realizedVol = 16;
  let cumPnl = 0;

  for (let day = 0; day < 90; day++) {
    impliedVol += (rand() - 0.5) * 1.5;
    realizedVol += (rand() - 0.5) * 0.8;
    impliedVol = Math.max(10, Math.min(50, impliedVol));
    realizedVol = Math.max(8, Math.min(45, realizedVol));
    const spread = impliedVol - realizedVol;
    cumPnl += spread * 0.08 * (rand() * 0.5 + 0.75);
    data.push({ day, impliedVol, realizedVol, spread, cumPnl });
  }
  return data;
}

// ── SVG Helpers ──────────────────────────────────────────────────────────────

function scaleX(val: number, min: number, max: number, width: number, padding: number): number {
  return padding + ((val - min) / (max - min)) * (width - 2 * padding);
}

function scaleY(val: number, min: number, max: number, height: number, padding: number): number {
  return height - padding - ((val - min) / (max - min)) * (height - 2 * padding);
}

// ── Sub-components ───────────────────────────────────────────────────────────

function VixTermStructureChart({ data }: { data: VixFuturesPoint[] }) {
  const W = 560, H = 220, PAD = 40;
  const minV = Math.min(...data.map((d) => d.value)) - 1;
  const maxV = Math.max(...data.map((d) => d.value)) + 1;
  const isContango = data[data.length - 1].value > data[0].value;

  const pts = data.map((d, i) =>
    `${scaleX(i, 0, data.length - 1, W, PAD)},${scaleY(d.value, minV, maxV, H, PAD)}`
  );

  const areaPath = `M ${pts[0]} ${pts.slice(1).map((p) => `L ${p}`).join(" ")} L ${scaleX(data.length - 1, 0, data.length - 1, W, PAD)},${H - PAD} L ${PAD},${H - PAD} Z`;
  const linePath = `M ${pts.join(" L ")}`;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={isContango ? "secondary" : "destructive"} className="text-xs">
          {isContango ? "CONTANGO" : "BACKWARDATION"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {isContango ? "Futures premium → VXX roll-yield drag" : "Futures discount → SVXY headwind"}
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((frac) => {
          const y = PAD + frac * (H - 2 * PAD);
          const v = maxV - frac * (maxV - minV);
          return (
            <g key={frac}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">{v.toFixed(1)}</text>
            </g>
          );
        })}
        {/* Area fill */}
        <path d={areaPath} fill={isContango ? "rgba(99,102,241,0.15)" : "rgba(239,68,68,0.15)"} />
        {/* Line */}
        <path d={linePath} fill="none" stroke={isContango ? "#818cf8" : "#f87171"} strokeWidth="2.5" />
        {/* Points */}
        {data.map((d, i) => {
          const cx = scaleX(i, 0, data.length - 1, W, PAD);
          const cy = scaleY(d.value, minV, maxV, H, PAD);
          return (
            <g key={d.label}>
              <circle cx={cx} cy={cy} r="5" fill={isContango ? "#818cf8" : "#f87171"} />
              <text x={cx} y={H - PAD + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.label}</text>
              <text x={cx} y={cy - 8} textAnchor="middle" fontSize="10" fill="#e2e8f0" fontWeight="600">{d.value.toFixed(1)}</text>
            </g>
          );
        })}
        {/* Axes */}
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#475569" strokeWidth="1" />
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#475569" strokeWidth="1" />
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="#64748b">Futures Expiry</text>
        <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="#64748b" transform={`rotate(-90,12,${H / 2})`}>VIX Level</text>
      </svg>
    </div>
  );
}

function VolSurfaceHeatmap({ cells }: { cells: VolSurfaceCell[] }) {
  const expiries = ["7d", "14d", "30d", "60d", "90d"];
  const strikes = [80, 85, 90, 95, 100, 105, 110, 115, 120];
  const allIvs = cells.map((c) => c.iv);
  const minIv = Math.min(...allIvs);
  const maxIv = Math.max(...allIvs);

  function getColor(iv: number): string {
    const t = (iv - minIv) / (maxIv - minIv);
    if (t < 0.25) return `rgba(99,102,241,${0.4 + t * 0.6})`;
    if (t < 0.5) return `rgba(99,102,241,${0.7 + t * 0.2})`;
    if (t < 0.75) return `rgba(249,115,22,${0.5 + t * 0.3})`;
    return `rgba(239,68,68,${0.6 + t * 0.4})`;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left text-muted-foreground py-1 pr-2 font-normal">Strike ↓ / Expiry →</th>
            {expiries.map((e) => (
              <th key={e} className="text-center text-muted-foreground py-1 px-2 font-normal">{e}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {strikes.map((strike) => (
            <tr key={strike}>
              <td className="text-muted-foreground py-0.5 pr-2 font-medium">{strike}</td>
              {expiries.map((expiry) => {
                const cell = cells.find((c) => c.strike === strike && c.expiry === expiry);
                return (
                  <td
                    key={expiry}
                    className="text-center py-1 px-2 rounded text-white font-mono text-[11px]"
                    style={{ backgroundColor: cell ? getColor(cell.iv) : "transparent" }}
                  >
                    {cell ? cell.iv.toFixed(1) : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PayoffChart({ points, title, color = "#818cf8", height = 180 }: {
  points: PayoffPoint[];
  title: string;
  color?: string;
  height?: number;
}) {
  const W = 460, H = height, PAD = 36;
  const prices = points.map((p) => p.price);
  const pnls = points.map((p) => p.pnl);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const minPnl = Math.min(...pnls) - 1;
  const maxPnl = Math.max(...pnls) + 1;
  const zeroY = scaleY(0, minPnl, maxPnl, H, PAD);

  const posPoints = points.map((p) => ({
    x: scaleX(p.price, minP, maxP, W, PAD),
    y: scaleY(Math.max(0, p.pnl), minPnl, maxPnl, H, PAD),
    pnl: p.pnl,
  }));

  const lineD = points
    .map((p, i) =>
      `${i === 0 ? "M" : "L"} ${scaleX(p.price, minP, maxP, W, PAD)},${scaleY(p.pnl, minPnl, maxPnl, H, PAD)}`
    )
    .join(" ");

  // profit area
  const profitSegments: string[] = [];
  let currentProfit = false;
  let segStart = "";
  points.forEach((p, i) => {
    const x = scaleX(p.price, minP, maxP, W, PAD);
    const y = scaleY(p.pnl, minPnl, maxPnl, H, PAD);
    if (p.pnl > 0 && !currentProfit) {
      currentProfit = true;
      segStart = `M ${x},${zeroY} L ${x},${y}`;
    } else if (p.pnl > 0) {
      segStart += ` L ${x},${y}`;
    } else if (currentProfit) {
      segStart += ` L ${x},${zeroY} Z`;
      profitSegments.push(segStart);
      currentProfit = false;
      segStart = "";
    }
    if (i === points.length - 1 && currentProfit) {
      segStart += ` L ${x},${zeroY} Z`;
      profitSegments.push(segStart);
    }
  });

  void posPoints;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1 font-medium">{title}</p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {/* Zero line */}
        <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="#475569" strokeWidth="1.5" strokeDasharray="6 3" />
        {/* Profit fill */}
        {profitSegments.map((d, i) => (
          <path key={i} d={d} fill="rgba(34,197,94,0.18)" />
        ))}
        {/* Loss fill above zero line */}
        <clipPath id={`loss-clip-${title.replace(/\s/g, "")}`}>
          <rect x={PAD} y={zeroY} width={W - 2 * PAD} height={H - PAD - zeroY} />
        </clipPath>
        <path
          d={lineD + ` L ${scaleX(maxP, minP, maxP, W, PAD)},${zeroY} L ${PAD},${zeroY} Z`}
          fill="rgba(239,68,68,0.15)"
          clipPath={`url(#loss-clip-${title.replace(/\s/g, "")})`}
        />
        {/* Main line */}
        <path d={lineD} fill="none" stroke={color} strokeWidth="2.5" />
        {/* Axes */}
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#334155" strokeWidth="1" />
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#334155" strokeWidth="1" />
        {/* Labels */}
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="#64748b">Underlying Price at Expiry</text>
        <text x={12} y={H / 2} textAnchor="middle" fontSize="10" fill="#64748b" transform={`rotate(-90,12,${H / 2})`}>P&L ($)</text>
        {/* Y axis ticks */}
        {[minPnl, 0, maxPnl].map((v) => {
          const y = scaleY(v, minPnl, maxPnl, H, PAD);
          return (
            <g key={v}>
              <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#64748b">
                {v > 0 ? `+${v.toFixed(0)}` : v.toFixed(0)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function EtpDecayChart({ data }: { data: EtpDataPoint[] }) {
  const W = 560, H = 240, PAD = 44;
  const days = data.map((d) => d.day);
  const minDay = Math.min(...days);
  const maxDay = Math.max(...days);

  const allVals = [...data.map((d) => d.vxx), ...data.map((d) => d.svxy)];
  const minV = Math.max(0, Math.min(...allVals) - 5);
  const maxV = Math.max(...allVals) + 5;

  const vxxPath = data
    .map((d, i) =>
      `${i === 0 ? "M" : "L"} ${scaleX(d.day, minDay, maxDay, W, PAD)},${scaleY(d.vxx, minV, maxV, H, PAD)}`
    )
    .join(" ");

  const svxyPath = data
    .map((d, i) =>
      `${i === 0 ? "M" : "L"} ${scaleX(d.day, minDay, maxDay, W, PAD)},${scaleY(d.svxy, minV, maxV, H, PAD)}`
    )
    .join(" ");

  const gridVals = [25, 50, 75, 100];

  return (
    <div>
      <div className="flex gap-4 mb-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="inline-block w-6 h-0.5 bg-orange-400" /> VXX (Long Vol)
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="inline-block w-6 h-0.5 bg-emerald-400" /> SVXY (Short Vol)
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {gridVals.map((v) => {
          const y = scaleY(v, minV, maxV, H, PAD);
          if (y < PAD || y > H - PAD) return null;
          return (
            <g key={v}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">{v}</text>
            </g>
          );
        })}
        <path d={vxxPath} fill="none" stroke="#fb923c" strokeWidth="2" />
        <path d={svxyPath} fill="none" stroke="#34d399" strokeWidth="2" />
        {/* 100 baseline */}
        <line
          x1={PAD}
          y1={scaleY(100, minV, maxV, H, PAD)}
          x2={W - PAD}
          y2={scaleY(100, minV, maxV, H, PAD)}
          stroke="#475569"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#475569" strokeWidth="1" />
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#475569" strokeWidth="1" />
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="#64748b">Trading Day</text>
        <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="#64748b" transform={`rotate(-90,12,${H / 2})`}>NAV ($)</text>
        {/* Day labels */}
        {[0, 30, 60, 90, 120].map((d) => {
          if (d > maxDay) return null;
          return (
            <text key={d} x={scaleX(d, minDay, maxDay, W, PAD)} y={H - PAD + 14} textAnchor="middle" fontSize="10" fill="#64748b">{d}</text>
          );
        })}
      </svg>
    </div>
  );
}

function ArbitrageChart({ data }: { data: ArbitrageDataPoint[] }) {
  const W = 560, H = 260, PAD = 44;
  const minDay = 0, maxDay = data.length - 1;
  const allIvs = [...data.map((d) => d.impliedVol), ...data.map((d) => d.realizedVol)];
  const minIv = Math.min(...allIvs) - 2;
  const maxIv = Math.max(...allIvs) + 2;
  const minPnl = Math.min(...data.map((d) => d.cumPnl)) - 2;
  const maxPnl = Math.max(...data.map((d) => d.cumPnl)) + 5;

  const ivPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(d.day, minDay, maxDay, W, PAD)},${scaleY(d.impliedVol, minIv, maxIv, H, PAD)}`).join(" ");
  const rvPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(d.day, minDay, maxDay, W, PAD)},${scaleY(d.realizedVol, minIv, maxIv, H, PAD)}`).join(" ");
  const pnlPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(d.day, minDay, maxDay, W, PAD)},${scaleY(d.cumPnl, minPnl, maxPnl, H, PAD + (H / 2))}`).join(" ");

  void pnlPath;
  void maxPnl;
  void minPnl;

  return (
    <div>
      <div className="flex gap-4 mb-2">
        <span className="flex items-center gap-1 text-xs"><span className="inline-block w-4 h-0.5 bg-indigo-400" /> Implied Vol</span>
        <span className="flex items-center gap-1 text-xs"><span className="inline-block w-4 h-0.5 bg-amber-400" /> Realized Vol</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {[0.25, 0.5, 0.75].map((frac) => {
          const y = PAD + frac * (H - 2 * PAD);
          const v = maxIv - frac * (maxIv - minIv);
          return (
            <g key={frac}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">{v.toFixed(0)}%</text>
            </g>
          );
        })}
        {/* Spread fill */}
        {data.map((d, i) => {
          if (i === 0) return null;
          const x1 = scaleX(data[i - 1].day, minDay, maxDay, W, PAD);
          const x2 = scaleX(d.day, minDay, maxDay, W, PAD);
          const y1iv = scaleY(data[i - 1].impliedVol, minIv, maxIv, H, PAD);
          const y1rv = scaleY(data[i - 1].realizedVol, minIv, maxIv, H, PAD);
          const y2iv = scaleY(d.impliedVol, minIv, maxIv, H, PAD);
          const y2rv = scaleY(d.realizedVol, minIv, maxIv, H, PAD);
          const profit = d.spread > 0;
          return (
            <polygon
              key={i}
              points={`${x1},${y1iv} ${x1},${y1rv} ${x2},${y2rv} ${x2},${y2iv}`}
              fill={profit ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)"}
            />
          );
        })}
        <path d={ivPath} fill="none" stroke="#818cf8" strokeWidth="2" />
        <path d={rvPath} fill="none" stroke="#fbbf24" strokeWidth="2" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#475569" strokeWidth="1" />
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#475569" strokeWidth="1" />
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="#64748b">Day</text>
        <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="#64748b" transform={`rotate(-90,12,${H / 2})`}>Volatility (%)</text>
        {[0, 30, 60, 90].map((d) => (
          <text key={d} x={scaleX(d, minDay, maxDay, W, PAD)} y={H - PAD + 14} textAnchor="middle" fontSize="10" fill="#64748b">{d}</text>
        ))}
      </svg>
    </div>
  );
}

// ── Tab: VIX & Vol Surface ───────────────────────────────────────────────────

function VixTab() {
  const termStructure = useMemo(() => generateVixTermStructure(), []);
  const surface = useMemo(() => generateVolSurface(), []);
  const spot = termStructure[0].value;
  const vvix = 85.4 + Math.sin(spot) * 8;
  const isContango = termStructure[termStructure.length - 1].value > spot;

  const stats = [
    { label: "VIX Spot", value: spot.toFixed(2), color: spot < 20 ? "text-emerald-400" : spot < 30 ? "text-amber-400" : "text-red-400" },
    { label: "VVIX", value: vvix.toFixed(1), color: "text-indigo-400" },
    { label: "1M Future", value: termStructure[1].value.toFixed(2), color: "text-blue-400" },
    { label: "3M Future", value: termStructure[3].value.toFixed(2), color: "text-blue-400" },
    { label: "Curve Shape", value: isContango ? "Contango" : "Backwardation", color: isContango ? "text-emerald-400" : "text-red-400" },
    { label: "Roll Yield", value: isContango ? `-${((termStructure[1].value - spot) / spot * 100).toFixed(1)}%/mo` : `+${((spot - termStructure[1].value) / spot * 100).toFixed(1)}%/mo`, color: isContango ? "text-red-400" : "text-emerald-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="bg-slate-800/60 border-slate-700/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* VIX Term Structure */}
      <Card className="bg-slate-800/60 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            VIX Futures Term Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VixTermStructureChart data={termStructure} />
        </CardContent>
      </Card>

      {/* Vol Surface */}
      <Card className="bg-slate-800/60 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-violet-400" />
            Implied Volatility Surface (SPX)
            <Badge variant="outline" className="text-xs ml-auto">IV %</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VolSurfaceHeatmap cells={surface} />
          <div className="mt-3 flex gap-2 flex-wrap">
            {[
              { label: "Volatility Smile", desc: "Higher IV at OTM strikes — market prices tail risk" },
              { label: "Vol Skew", desc: "Puts carry higher IV than calls at same delta — put demand" },
              { label: "Term Structure", desc: "IV typically rises with expiry in normal markets" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-1.5 text-xs bg-slate-700/40 rounded p-2 flex-1 min-w-[180px]">
                <Info className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-slate-200">{item.label}: </span>
                  <span className="text-muted-foreground">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* VVIX explanation */}
      <Card className="bg-slate-800/60 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            VVIX — Volatility of Volatility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold font-mono text-yellow-400">{vvix.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Current VVIX</p>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Low (calm)</span>
                <span className="text-muted-foreground">High (stressed)</span>
              </div>
              <Progress value={((vvix - 60) / 80) * 100} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>60</span><span>80</span><span>100</span><span>120</span><span>140</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            VVIX measures implied volatility of VIX options — essentially the &quot;vol of vol.&quot; A high VVIX (&gt;100) signals that
            VIX options are expensive, often preceding a volatility regime change. Traders use VVIX to size vol trades
            and detect whether current volatility levels are likely to persist or revert.
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { range: "60–80", state: "Calm", action: "Vol selling attractive" },
              { range: "80–100", state: "Elevated", action: "Neutral; wait for edge" },
              { range: ">100", state: "Stressed", action: "Tail hedging cheap" },
            ].map((r) => (
              <div key={r.range} className="bg-slate-700/40 rounded p-2">
                <p className="font-mono font-bold text-slate-200">{r.range}</p>
                <p className="text-muted-foreground">{r.state}</p>
                <p className="text-indigo-300">{r.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab: Long Vol Strategies ─────────────────────────────────────────────────

function LongVolTab() {
  const [activeStrategy, setActiveStrategy] = useState<"straddle" | "strangle" | "tailhedge">("straddle");

  const straddlePoints = useMemo(() => generateStraddlePayoff(100, 8.5), []);
  const stranglePoints = useMemo(() => generateStranglePayoff(95, 105, 5.2), []);

  const strategies = [
    {
      id: "straddle" as const,
      name: "Long Straddle",
      desc: "Buy ATM call + ATM put. Profits from large moves in either direction. Ideal when expecting a big event but unsure of direction.",
      cost: "$8.50 (debit)",
      breakeven: "$91.50 / $108.50",
      maxGain: "Unlimited (upside) / $91.50 (downside)",
      maxLoss: "$8.50 (both expire OTM)",
      idealVix: "< 20 (buy before vol expansion)",
      greeks: { delta: "~0", gamma: "High", vega: "Positive", theta: "Negative" },
    },
    {
      id: "strangle" as const,
      name: "Long Strangle",
      desc: "Buy OTM call (105) + OTM put (95). Cheaper than straddle, requires bigger move to profit.",
      cost: "$5.20 (debit)",
      breakeven: "$89.80 / $110.20",
      maxGain: "Unlimited",
      maxLoss: "$5.20",
      idealVix: "< 18 (low vol environment)",
      greeks: { delta: "~0", gamma: "Moderate", vega: "Positive", theta: "Negative" },
    },
    {
      id: "tailhedge" as const,
      name: "Tail Risk Hedge",
      desc: "Buy far OTM puts (80 strike, 90d expiry). Cheap protection against 20%+ market crashes. Think LTCM 1998 or COVID 2020.",
      cost: "$1.20 (debit, ~0.5% of portfolio)",
      breakeven: "$78.80 at expiry",
      maxGain: "Up to 50× in a crash",
      maxLoss: "Full premium ($1.20)",
      idealVix: "Any — buy when VIX < 15",
      greeks: { delta: "-0.05", gamma: "Low initially, spikes in crash", vega: "High positive", theta: "Slow decay" },
    },
  ];

  const active = strategies.find((s) => s.id === activeStrategy)!;

  const tailPoints: PayoffPoint[] = useMemo(() => {
    const pts: PayoffPoint[] = [];
    for (let price = 60; price <= 100; price += 0.5) {
      pts.push({ price, pnl: Math.max(0, 80 - price) - 1.2 });
    }
    return pts;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex gap-2 flex-wrap">
        {strategies.map((s) => (
          <Button
            key={s.id}
            variant={activeStrategy === s.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveStrategy(s.id)}
          >
            {s.name}
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStrategy}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card className="bg-slate-800/60 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                {active.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">{active.desc}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Cost", value: active.cost },
                  { label: "Ideal VIX", value: active.idealVix },
                  { label: "Max Loss", value: active.maxLoss, negative: true },
                  { label: "Max Gain", value: active.maxGain, positive: true },
                  { label: "Breakeven", value: active.breakeven },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-700/40 rounded p-2">
                    <p className="text-muted-foreground">{item.label}</p>
                    <p className={`font-mono font-medium ${item.positive ? "text-emerald-400" : item.negative ? "text-red-400" : "text-slate-200"}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-700/30 rounded p-2">
                <p className="text-xs font-medium text-slate-300 mb-1">Greeks Profile</p>
                <div className="grid grid-cols-4 gap-1 text-xs">
                  {Object.entries(active.greeks).map(([g, v]) => (
                    <div key={g} className="text-center">
                      <p className="text-muted-foreground capitalize">{g}</p>
                      <p className="font-mono text-indigo-300">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Payoff Diagram at Expiry</CardTitle>
            </CardHeader>
            <CardContent>
              {activeStrategy === "straddle" && (
                <PayoffChart points={straddlePoints} title="Long Straddle — Strike $100, Premium $8.50" color="#818cf8" />
              )}
              {activeStrategy === "strangle" && (
                <PayoffChart points={stranglePoints} title="Long Strangle — Puts 95/Calls 105, Premium $5.20" color="#34d399" />
              )}
              {activeStrategy === "tailhedge" && (
                <PayoffChart points={tailPoints} title="Tail Hedge — 80 Put, Cost $1.20" color="#f87171" />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Educational note */}
      <Card className="bg-amber-950/30 border-amber-700/40">
        <CardContent className="p-3 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-200/80 leading-relaxed">
            <span className="font-semibold text-amber-300">Theta Decay Risk: </span>
            Long vol strategies lose value every day due to time decay (negative theta). VIX must increase enough
            to overcome daily theta bleed. Historical data shows that ~70% of options expire worthless — timing matters.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab: Short Vol Strategies ────────────────────────────────────────────────

function ShortVolTab() {
  const ironCondorPoints = useMemo(() => generateIronCondorPayoff(), []);

  const shortStraddlePoints = useMemo(() => {
    const pts: PayoffPoint[] = [];
    for (let price = 70; price <= 130; price += 0.5) {
      const callPnl = -Math.max(0, price - 100);
      const putPnl = -Math.max(0, 100 - price);
      pts.push({ price, pnl: callPnl + putPnl + 9.0 });
    }
    return pts;
  }, []);

  const strategies: StrategyRow[] = [
    {
      name: "Iron Condor",
      maxGain: "$2.40 (credit)",
      maxLoss: "$2.60 (at wings)",
      breakeven: "$92.60 / $107.40",
      idealVix: "15–25, contango",
      riskRating: 40,
    },
    {
      name: "Short Straddle",
      maxGain: "$9.00 (credit)",
      maxLoss: "Unlimited",
      breakeven: "$91.00 / $109.00",
      idealVix: "> 25 (elevated IV rank)",
      riskRating: 85,
    },
    {
      name: "Variance Swap (Short)",
      maxGain: "Vega-notional × (IV² − RV²)",
      maxLoss: "Unlimited (convex payoff)",
      breakeven: "RV = Implied Vol at entry",
      idealVix: "IV rank > 60%",
      riskRating: 75,
    },
    {
      name: "Short VIX Futures",
      maxGain: "Roll yield in contango",
      maxLoss: "Unlimited if VIX spikes",
      breakeven: "Entry price",
      idealVix: "VIX > 20, steep contango",
      riskRating: 90,
    },
  ];

  const [selectedStrategy, setSelectedStrategy] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Strategy table */}
        <div className="lg:col-span-1 space-y-2">
          {strategies.map((row, i) => (
            <button
              key={row.name}
              onClick={() => setSelectedStrategy(i)}
              className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                selectedStrategy === i
                  ? "bg-indigo-900/50 border-indigo-600/60"
                  : "bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-200">{row.name}</span>
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${selectedStrategy === i ? "text-indigo-400 rotate-90" : "text-slate-500"}`} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Risk:</span>
                <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${row.riskRating}%`,
                      backgroundColor: row.riskRating < 50 ? "#34d399" : row.riskRating < 75 ? "#fbbf24" : "#f87171",
                    }}
                  />
                </div>
                <span className={row.riskRating < 50 ? "text-emerald-400" : row.riskRating < 75 ? "text-amber-400" : "text-red-400"}>
                  {row.riskRating}%
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected strategy detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStrategy}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-2 space-y-3"
          >
            <Card className="bg-slate-800/60 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-orange-400" />
                  {strategies[selectedStrategy].name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Max Gain", value: strategies[selectedStrategy].maxGain, cls: "text-emerald-400" },
                    { label: "Max Loss", value: strategies[selectedStrategy].maxLoss, cls: "text-red-400" },
                    { label: "Breakeven", value: strategies[selectedStrategy].breakeven, cls: "text-slate-200" },
                    { label: "Ideal VIX", value: strategies[selectedStrategy].idealVix, cls: "text-indigo-300" },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-700/40 rounded p-2">
                      <p className="text-muted-foreground mb-0.5">{item.label}</p>
                      <p className={`font-mono font-medium ${item.cls}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {selectedStrategy === 0 && (
                  <PayoffChart points={ironCondorPoints} title="Iron Condor: Short 95P/105C, Long 90P/110C, $2.40 credit" color="#fb923c" height={160} />
                )}
                {selectedStrategy === 1 && (
                  <PayoffChart points={shortStraddlePoints} title="Short Straddle: Strike $100, $9.00 credit" color="#f87171" height={160} />
                )}
                {selectedStrategy === 2 && (
                  <div className="bg-slate-700/30 rounded p-3 text-xs space-y-2">
                    <p className="font-medium text-slate-200">Variance Swap Payoff Formula</p>
                    <div className="font-mono text-indigo-300 bg-slate-900/50 rounded p-2 text-center">
                      P&L = (Vega Notional / 2K) × (RV² − IV²)
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Where K = strike (= implied vol), RV = realized vol over period. Short variance profits when
                      actual moves are smaller than the implied vol priced in. This is the classic vol premium trade.
                      Convex payoff: losses accelerate as RV exceeds IV.
                    </p>
                  </div>
                )}
                {selectedStrategy === 3 && (
                  <div className="bg-slate-700/30 rounded p-3 text-xs space-y-2">
                    <p className="font-medium text-slate-200">VIX Futures Roll Yield</p>
                    <p className="text-muted-foreground leading-relaxed">
                      In contango, M1 futures trade above spot VIX. As M1 rolls down toward spot at expiry,
                      short holders profit from the roll. Average annualized roll yield: ~15–20% in calm markets.
                      Risk: instantaneous spike (2008, 2020 COVID). Always size small — VIX can triple in 1 day.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <Card className="bg-red-950/30 border-red-700/40">
        <CardContent className="p-3 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <div className="text-xs text-red-200/80 leading-relaxed">
            <span className="font-semibold text-red-300">XIV Lesson: </span>
            On February 5, 2018, VIX doubled in a single day wiping out XIV (inverse VIX ETP) by 93% overnight.
            Short vol strategies can deliver consistent positive carry for years — then lose everything in a single session.
            Never allocate more than 1–3% of portfolio to short volatility.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab: Vol Arbitrage ───────────────────────────────────────────────────────

function VolArbitrageTab() {
  const arbData = useMemo(() => generateArbitrageData(), []);
  const lastPoint = arbData[arbData.length - 1];
  const avgSpread = arbData.reduce((sum, d) => sum + d.spread, 0) / arbData.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Current IV", value: `${lastPoint.impliedVol.toFixed(1)}%`, color: "text-indigo-400" },
          { label: "Current RV", value: `${lastPoint.realizedVol.toFixed(1)}%`, color: "text-amber-400" },
          { label: "IV−RV Spread", value: `+${lastPoint.spread.toFixed(1)}%`, color: "text-emerald-400" },
          { label: "Cum. P&L", value: `$${lastPoint.cumPnl.toFixed(0)}`, color: "text-emerald-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-slate-800/60 border-slate-700/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800/60 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            Realized vs Implied Volatility — 90-Day Window
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ArbitrageChart data={arbData} />
          <div className="mt-2 flex gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500/50" />
              <span className="text-muted-foreground">IV &gt; RV (short vol profitable)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-500/30 border border-red-500/50" />
              <span className="text-muted-foreground">RV &gt; IV (long vol profitable)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-violet-400" />
              Dispersion Trading
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p className="text-muted-foreground leading-relaxed">
              Dispersion trading exploits the spread between index IV and constituent stock IVs.
              Correlation risk premium: index IV typically exceeds weighted average of component IVs
              because investors buy index puts as portfolio hedges.
            </p>
            <div className="bg-slate-700/30 rounded p-2 font-mono text-indigo-300 text-center">
              Short Index Vol + Long Stock Vols
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { name: "SPX IV", val: "18.5%", src: "Index" },
                { name: "AAPL IV", val: "23.1%", src: "Stock" },
                { name: "MSFT IV", val: "22.4%", src: "Stock" },
                { name: "GOOGL IV", val: "24.8%", src: "Stock" },
                { name: "Avg Wgtd", val: "16.2%", src: "Calc" },
                { name: "Spread", val: "+2.3%", src: "Edge" },
              ].map((item) => (
                <div key={item.name} className="bg-slate-700/40 rounded p-1.5 text-center">
                  <p className="text-muted-foreground text-[10px]">{item.name}</p>
                  <p className="font-mono text-slate-200 font-medium">{item.val}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              Variance Swap Mechanics
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p className="text-muted-foreground leading-relaxed">
              Variance swaps pay (RV² − K²) × vega notional at expiry. Unlike options, they have
              linear exposure to variance (not vol), making them the cleanest vehicle for pure
              vol views. Used by hedge funds for the &quot;variance risk premium&quot; trade.
            </p>
            <div className="space-y-1">
              {[
                { label: "K (Var Strike)", value: `${(lastPoint.impliedVol).toFixed(1)}%` },
                { label: "Vega Notional", value: "$1,000/vol pt" },
                { label: "Var Notional", value: `$${(1000 / (2 * lastPoint.impliedVol)).toFixed(0)}/var pt` },
                { label: "Avg IV−RV Spread", value: `+${avgSpread.toFixed(1)}% (90d)` },
                { label: "Expected P&L", value: `$${(avgSpread * avgSpread * 1000 / (2 * lastPoint.impliedVol)).toFixed(0)} est.` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between bg-slate-700/30 rounded px-2 py-1">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-mono text-slate-200">{row.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// ── Tab: Vol ETPs ────────────────────────────────────────────────────────────

function VolEtpsTab() {
  const etpData = useMemo(() => generateEtpData(), []);
  const lastVxx = etpData[etpData.length - 1].vxx;
  const lastSvxy = etpData[etpData.length - 1].svxy;
  const vxxDecay = ((lastVxx - 100) / 100 * 100).toFixed(1);
  const svxyGain = ((lastSvxy - 100) / 100 * 100).toFixed(1);

  const crashScenario = useMemo(() => {
    // Simulate VIX spike from 18 to 50 over 5 days
    const days: Array<{ day: number; vix: number; vxx: number; svxy: number }> = [];
    let vix = 18, vxx = 100, svxy = 100;
    for (let d = 0; d <= 20; d++) {
      if (d <= 5) vix = 18 + (50 - 18) * (d / 5);
      else vix = 50 - (50 - 22) * ((d - 5) / 15);
      const vixChg = d === 0 ? 0 : vix - days[d - 1].vix;
      vxx = Math.max(1, vxx + (vixChg / (d === 0 ? 18 : days[d - 1].vix)) * vxx * 1.1);
      svxy = Math.max(0.1, svxy - (vixChg / (d === 0 ? 18 : days[d - 1].vix)) * svxy * 0.9);
      days.push({ day: d, vix, vxx, svxy });
    }
    return days;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "VXX (120d)", value: `${lastVxx.toFixed(1)}`, sub: `${vxxDecay}% vs cost`, color: "text-orange-400" },
          { label: "SVXY (120d)", value: `${lastSvxy.toFixed(1)}`, sub: `+${svxyGain}% vs cost`, color: "text-emerald-400" },
          { label: "Avg Roll Yield", value: "-0.12%/day", sub: "VXX drag", color: "text-red-400" },
          { label: "Annualized Drag", value: "~30%/yr", sub: "VXX expected decay", color: "text-red-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-slate-800/60 border-slate-700/50">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800/60 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-400" />
            120-Day VXX vs SVXY Simulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EtpDecayChart data={etpData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-400" />
              Crash Scenario: VIX 18 → 50
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-muted-foreground pb-1 font-normal">Day</th>
                    <th className="text-right text-muted-foreground pb-1 font-normal">VIX</th>
                    <th className="text-right text-muted-foreground pb-1 font-normal">VXX NAV</th>
                    <th className="text-right text-muted-foreground pb-1 font-normal">SVXY NAV</th>
                    <th className="text-right text-muted-foreground pb-1 font-normal">SVXY Chg</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 3, 5, 10, 15, 20].map((d) => {
                    const row = crashScenario[d];
                    const prev = crashScenario[Math.max(0, d - 1)];
                    const svxyChg = d === 0 ? 0 : ((row.svxy - 100) / 100 * 100);
                    return (
                      <tr key={d} className="border-b border-slate-700/40">
                        <td className="py-1 text-slate-400">{row.day}</td>
                        <td className="py-1 text-right font-mono text-amber-400">{row.vix.toFixed(1)}</td>
                        <td className={`py-1 text-right font-mono ${row.vxx > prev.vxx ? "text-emerald-400" : "text-red-400"}`}>{row.vxx.toFixed(1)}</td>
                        <td className={`py-1 text-right font-mono ${row.svxy < 80 ? "text-red-400" : "text-slate-200"}`}>{row.svxy.toFixed(1)}</td>
                        <td className={`py-1 text-right font-mono ${svxyChg < 0 ? "text-red-400" : "text-emerald-400"}`}>
                          {svxyChg === 0 ? "—" : `${svxyChg.toFixed(1)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-400" />
              Roll Yield Mathematics
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p className="text-muted-foreground">
              VXX holds a rolling long position in M1 and M2 VIX futures, rebalanced daily.
            </p>
            <div className="space-y-1.5">
              {[
                { formula: "Daily Roll = (M2 - M1) / (days to M1 exp)", desc: "Raw roll cost" },
                { formula: "VXX Daily Return ≈ ΔVIX% − Roll Cost", desc: "Approximate NAV change" },
                { formula: "Roll Cost = +0.10–0.15%/day in contango", desc: "Typical calm market" },
                { formula: "Annual Drag ≈ e^(−0.0012 × 252) − 1 ≈ −26%", desc: "Compounded decay" },
              ].map((row) => (
                <div key={row.formula} className="bg-slate-700/30 rounded p-2">
                  <p className="font-mono text-indigo-300 text-[11px]">{row.formula}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">{row.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-950/30 border border-amber-700/40 rounded p-2">
              <p className="text-amber-300 font-medium mb-0.5">Key Insight</p>
              <p className="text-amber-200/80 leading-relaxed">
                VXX is designed as a short-term hedge, not a buy-and-hold investment. Since inception in 2009,
                VXX has lost over 99% of its value through roll-yield decay alone, despite multiple VIX spikes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function VolTradingPage() {
  const [activeTab, setActiveTab] = useState("vix");

  const tabConfig = [
    { id: "vix", label: "VIX & Surface", icon: Activity },
    { id: "longvol", label: "Long Vol", icon: TrendingUp },
    { id: "shortvol", label: "Short Vol", icon: TrendingDown },
    { id: "arb", label: "Vol Arb", icon: BarChart3 },
    { id: "etps", label: "Vol ETPs", icon: Layers },
  ];

  const vixTermStructure = useMemo(() => generateVixTermStructure(), []);
  const currentVix = vixTermStructure[0].value;
  const vixRegime =
    currentVix < 15 ? { label: "Low Vol", color: "text-emerald-400", bg: "bg-emerald-950/30 border-emerald-700/40" }
    : currentVix < 25 ? { label: "Normal Vol", color: "text-amber-400", bg: "bg-amber-950/30 border-amber-700/40" }
    : currentVix < 35 ? { label: "Elevated Vol", color: "text-orange-400", bg: "bg-orange-950/30 border-orange-700/40" }
    : { label: "Crisis", color: "text-red-400", bg: "bg-red-950/30 border-red-700/40" };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-400" />
            Volatility Trading
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            VIX strategies, vol surface, long/short vol, arbitrage, and ETP mechanics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${vixRegime.bg}`}>
            <span className="text-muted-foreground">VIX Regime:</span>
            <span className={`font-bold ${vixRegime.color}`}>{vixRegime.label}</span>
            <span className={`font-mono font-bold text-sm ${vixRegime.color}`}>{currentVix.toFixed(2)}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1 text-yellow-400" />
            Live Sim
          </Badge>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/80 border border-slate-700/50 h-auto p-1 flex-wrap gap-1">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="vix" className="mt-4 data-[state=inactive]:hidden">
          <VixTab />
        </TabsContent>
        <TabsContent value="longvol" className="mt-4 data-[state=inactive]:hidden">
          <LongVolTab />
        </TabsContent>
        <TabsContent value="shortvol" className="mt-4 data-[state=inactive]:hidden">
          <ShortVolTab />
        </TabsContent>
        <TabsContent value="arb" className="mt-4 data-[state=inactive]:hidden">
          <VolArbitrageTab />
        </TabsContent>
        <TabsContent value="etps" className="mt-4 data-[state=inactive]:hidden">
          <VolEtpsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
