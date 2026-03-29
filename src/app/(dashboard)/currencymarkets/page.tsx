"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  AlertTriangle,
  Activity,
  Target,
  Clock,
  Zap,
  ShieldAlert,
  BookOpen,
  ArrowUpDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 831;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface FxPair {
  symbol: string;
  base: string;
  quote: string;
  spot: number;
  bid: number;
  ask: number;
  spread: number;
  dailyLow: number;
  dailyHigh: number;
  vol30d: number;
  change1d: number;
  flag1: string;
  flag2: string;
}

interface SessionInfo {
  name: string;
  city: string;
  startHour: number;
  endHour: number;
  color: string;
  volume: number;
}

interface CarryPair {
  symbol: string;
  longCcy: string;
  shortCcy: string;
  longRate: number;
  shortRate: number;
  differential: number;
  carryReturn: number[];
  sharpe: number;
  maxDrawdown: number;
  crashRisk: "Low" | "Medium" | "High";
  flag1: string;
  flag2: string;
}

interface BigMacEntry {
  country: string;
  currency: string;
  flag: string;
  bigMacPrice: number;
  impliedRate: number;
  actualRate: number;
  valuation: number; // % over/under vs USD
}

interface CrisisEvent {
  year: number;
  name: string;
  country: string;
  currency: string;
  peakDevaluation: number;
  mechanism: string;
  outcome: string;
  color: string;
  sparkline: number[];
}

// ── Data Generation ────────────────────────────────────────────────────────────

const FX_PAIRS: FxPair[] = (() => {
  const specs = [
    { symbol: "EUR/USD", base: "EUR", quote: "USD", ref: 1.0842, flag1: "🇪🇺", flag2: "🇺🇸" },
    { symbol: "USD/JPY", base: "USD", quote: "JPY", ref: 151.32, flag1: "🇺🇸", flag2: "🇯🇵" },
    { symbol: "GBP/USD", base: "GBP", quote: "USD", ref: 1.2645, flag1: "🇬🇧", flag2: "🇺🇸" },
    { symbol: "USD/CHF", base: "USD", quote: "CHF", ref: 0.8972, flag1: "🇺🇸", flag2: "🇨🇭" },
    { symbol: "AUD/USD", base: "AUD", quote: "USD", ref: 0.6521, flag1: "🇦🇺", flag2: "🇺🇸" },
    { symbol: "USD/CAD", base: "USD", quote: "CAD", ref: 1.3612, flag1: "🇺🇸", flag2: "🇨🇦" },
  ];
  return specs.map((p) => {
    const vol = 0.004 + rand() * 0.008;
    const change = (rand() - 0.5) * 0.012;
    const spotNoise = (rand() - 0.5) * 0.002;
    const spot = parseFloat((p.ref * (1 + spotNoise)).toFixed(p.quote === "JPY" ? 2 : 4));
    const halfSpread = p.ref * (0.00004 + rand() * 0.00012);
    const bid = parseFloat((spot - halfSpread).toFixed(p.quote === "JPY" ? 2 : 4));
    const ask = parseFloat((spot + halfSpread).toFixed(p.quote === "JPY" ? 2 : 4));
    const spread = parseFloat(((ask - bid) * (p.quote === "JPY" ? 100 : 10000)).toFixed(1));
    const rangePct = 0.003 + rand() * 0.005;
    const dailyLow = parseFloat((spot * (1 - rangePct * rand())).toFixed(p.quote === "JPY" ? 2 : 4));
    const dailyHigh = parseFloat((spot * (1 + rangePct * rand())).toFixed(p.quote === "JPY" ? 2 : 4));
    return { ...p, spot, bid, ask, spread, dailyLow, dailyHigh, vol30d: parseFloat((vol * 100).toFixed(1)), change1d: parseFloat((change * 100).toFixed(2)) };
  });
})();

const SESSIONS: SessionInfo[] = [
  { name: "Sydney", city: "Sydney", startHour: 21, endHour: 6, color: "#3b82f6", volume: 4 },
  { name: "Tokyo", city: "Tokyo", startHour: 0, endHour: 9, color: "#8b5cf6", volume: 6 },
  { name: "London", city: "London", startHour: 7, endHour: 16, color: "#10b981", volume: 10 },
  { name: "New York", city: "New York", startHour: 12, endHour: 21, color: "#f59e0b", volume: 8 },
];

const SESSION_VOLUMES = (() => {
  // Volume by hour 0-23 (24 bars)
  return Array.from({ length: 24 }, (_, h) => {
    let v = 1;
    if (h >= 7 && h <= 16) v += 5; // London
    if (h >= 12 && h <= 16) v += 4; // London-NY overlap
    if (h >= 12 && h <= 21) v += 3; // NY
    if (h >= 0 && h <= 9) v += 2; // Tokyo
    if (h >= 21 || h <= 6) v += 1; // Sydney
    v += (rand() - 0.5) * 0.8;
    return Math.max(0.5, v);
  });
})();

const CARRY_PAIRS: CarryPair[] = (() => {
  const specs = [
    { symbol: "AUD/JPY", longCcy: "AUD", shortCcy: "JPY", longRate: 4.35, shortRate: 0.1, flag1: "🇦🇺", flag2: "🇯🇵" },
    { symbol: "NZD/JPY", longCcy: "NZD", shortCcy: "JPY", longRate: 5.50, shortRate: 0.1, flag1: "🇳🇿", flag2: "🇯🇵" },
    { symbol: "MXN/JPY", longCcy: "MXN", shortCcy: "JPY", longRate: 11.25, shortRate: 0.1, flag1: "🇲🇽", flag2: "🇯🇵" },
    { symbol: "BRL/USD", longCcy: "BRL", shortCcy: "USD", longRate: 10.75, shortRate: 5.25, flag1: "🇧🇷", flag2: "🇺🇸" },
    { symbol: "TRY/USD", longCcy: "TRY", shortCcy: "USD", longRate: 45.0, shortRate: 5.25, flag1: "🇹🇷", flag2: "🇺🇸" },
  ];
  return specs.map((p) => {
    const diff = p.longRate - p.shortRate;
    const returns: number[] = [];
    let cumRet = 0;
    for (let i = 0; i < 30; i++) {
      const dr = diff / 260 + (rand() - 0.48) * 0.008;
      cumRet += dr;
      returns.push(parseFloat((cumRet * 100).toFixed(2)));
    }
    const finalRet = returns[returns.length - 1];
    const drawdowns = returns.map((r, i) => {
      const peak = Math.max(...returns.slice(0, i + 1));
      return r - peak;
    });
    const maxDD = Math.min(...drawdowns);
    const sharpe = parseFloat(((finalRet / 100) / (0.08 + rand() * 0.04)).toFixed(2));
    const crashRisk: CarryPair["crashRisk"] = diff > 30 ? "High" : diff > 8 ? "Medium" : "Low";
    return { symbol: p.symbol, longCcy: p.longCcy, shortCcy: p.shortCcy, longRate: p.longRate, shortRate: p.shortRate, differential: diff, carryReturn: returns, sharpe, maxDrawdown: parseFloat(maxDD.toFixed(2)), crashRisk, flag1: p.flag1, flag2: p.flag2 };
  });
})();

const BIG_MAC_DATA: BigMacEntry[] = (() => {
  const usdPrice = 5.69;
  const specs = [
    { country: "Euro Area", currency: "EUR", flag: "🇪🇺", localPrice: 5.21, actualRate: 1.0842 },
    { country: "Japan", currency: "JPY", flag: "🇯🇵", localPrice: 450, actualRate: 151.32 },
    { country: "United Kingdom", currency: "GBP", flag: "🇬🇧", localPrice: 4.19, actualRate: 1.2645 },
    { country: "Switzerland", currency: "CHF", flag: "🇨🇭", localPrice: 6.70, actualRate: 0.8972 },
    { country: "Australia", currency: "AUD", flag: "🇦🇺", localPrice: 7.45, actualRate: 0.6521 },
    { country: "Canada", currency: "CAD", flag: "🇨🇦", localPrice: 7.83, actualRate: 1.3612 },
    { country: "Brazil", currency: "BRL", flag: "🇧🇷", localPrice: 22.90, actualRate: 4.97 },
    { country: "China", currency: "CNY", flag: "🇨🇳", localPrice: 24.40, actualRate: 7.24 },
  ];
  return specs.map((e) => {
    const impliedRate = e.localPrice / usdPrice;
    const valuation = ((impliedRate - e.actualRate) / e.actualRate) * 100;
    return { ...e, bigMacPrice: e.localPrice, impliedRate: parseFloat(impliedRate.toFixed(4)), actualRate: e.actualRate, valuation: parseFloat(valuation.toFixed(1)) };
  });
})();

const REER_DATA = (() => {
  const currencies = ["USD", "EUR", "JPY", "GBP", "CNY"];
  const colors = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];
  return currencies.map((ccy, ci) => {
    let v = 100 + (rand() - 0.5) * 10;
    const series = Array.from({ length: 40 }, () => {
      v += (rand() - 0.5) * 2.5;
      return parseFloat(v.toFixed(1));
    });
    return { ccy, color: colors[ci], series };
  });
})();

const CRISES: CrisisEvent[] = (() => {
  const specs = [
    { year: 1992, name: "ERM Crisis", country: "United Kingdom", currency: "GBP", peakDevaluation: -14.8, mechanism: "Soros broke the Bank of England: £15bn intervention failed as speculative short pressure exceeded reserves, forcing UK out of ERM.", outcome: "GBP devalued 14.8% vs DEM. UK exited ERM. Soros profit: ~$1bn.", color: "#10b981" },
    { year: 1997, name: "Asian Financial Crisis", country: "Thailand / SE Asia", currency: "THB/IDR/MYR", peakDevaluation: -55.0, mechanism: "Pegged currencies faced speculative attacks after current account deficits became unsustainable. IMF bailouts followed.", outcome: "THB lost 55%, IDR 80%. Contagion spread across SE Asia. $40bn IMF packages.", color: "#f59e0b" },
    { year: 1998, name: "Russian Ruble Crisis", country: "Russia", currency: "RUB", peakDevaluation: -71.0, mechanism: "Oil price collapse + fiscal deficit led to bond default and forced ruble devaluation. Capital flight accelerated.", outcome: "RUB lost 71%. GKO default triggered LTCM collapse. Contagion to EM.", color: "#ef4444" },
    { year: 2001, name: "Argentine Peso Crisis", country: "Argentina", currency: "ARS", peakDevaluation: -66.0, mechanism: "Currency board peg to USD became unsustainable with deflation and recession. Bank runs, dollar freeze, default.", outcome: "Peso lost 66% after convertibility ended. $93bn sovereign default. Corralito bank freeze.", color: "#8b5cf6" },
    { year: 2015, name: "CHF Floor Removal", country: "Switzerland", currency: "CHF", peakDevaluation: 30.0, mechanism: "SNB abandoned EUR/CHF 1.20 floor without warning, triggering 30% CHF appreciation. Brokers became insolvent.", outcome: "CHF surged 30% in minutes. Multiple FX brokers failed. Enormous losses on short CHF positions.", color: "#3b82f6" },
  ];
  return specs.map((c) => {
    // Generate a crisis sparkline: initially stable, then crash/surge
    const sparkline: number[] = [];
    let v = 100;
    for (let i = 0; i < 24; i++) {
      if (i < 14) {
        v += (rand() - 0.5) * 1.5;
      } else if (i < 18) {
        v += c.peakDevaluation > 0 ? rand() * 6 : -rand() * 6;
      } else {
        v += (rand() - 0.5) * 2;
      }
      sparkline.push(parseFloat(v.toFixed(1)));
    }
    return { ...c, sparkline };
  });
})();

// ── Sub-Components ────────────────────────────────────────────────────────────

function FxPairRow({ pair }: { pair: FxPair }) {
  const up = pair.change1d >= 0;
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-base">{pair.flag1}{pair.flag2}</span>
          <span className="font-mono font-semibold text-white text-sm">{pair.symbol}</span>
        </div>
      </td>
      <td className="py-3 px-4 font-mono text-white text-sm text-right">{pair.spot}</td>
      <td className="py-3 px-4 font-mono text-slate-400 text-xs text-right">{pair.bid}</td>
      <td className="py-3 px-4 font-mono text-slate-400 text-xs text-right">{pair.ask}</td>
      <td className="py-3 px-4 text-right">
        <Badge variant="outline" className="font-mono text-xs border-slate-600 text-slate-300">
          {pair.spread}
        </Badge>
      </td>
      <td className="py-3 px-4 font-mono text-slate-400 text-xs text-right whitespace-nowrap">
        {pair.dailyLow} – {pair.dailyHigh}
      </td>
      <td className="py-3 px-4 text-right">
        <span className={cn("font-mono text-sm font-semibold", up ? "text-emerald-400" : "text-red-400")}>
          {up ? "+" : ""}{pair.change1d}%
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <Badge className={cn("text-xs", pair.vol30d > 8 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-primary/20 text-primary border-border")}>
          {pair.vol30d}%
        </Badge>
      </td>
    </tr>
  );
}

function MarketHoursWheel() {
  const cx = 110;
  const cy = 110;
  const r = 85;
  const innerR = 50;

  const hourToAngle = (h: number) => (h / 24) * 360 - 90;

  const arcPath = (startH: number, endH: number, outerR: number, innerRadius: number) => {
    const s = startH > endH ? startH : startH;
    const e = startH > endH ? endH + 24 : endH;
    const sa = (s / 24) * 2 * Math.PI - Math.PI / 2;
    const ea = (e / 24) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + outerR * Math.cos(sa);
    const y1 = cy + outerR * Math.sin(sa);
    const x2 = cx + outerR * Math.cos(ea);
    const y2 = cy + outerR * Math.sin(ea);
    const x3 = cx + innerRadius * Math.cos(ea);
    const y3 = cy + innerRadius * Math.sin(ea);
    const x4 = cx + innerRadius * Math.cos(sa);
    const y4 = cy + innerRadius * Math.sin(sa);
    const large = (e - s) / 24 > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${x4} ${y4} Z`;
  };

  const hourLabels = [0, 6, 12, 18];

  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[220px] mx-auto">
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r + 10} fill="#0f172a" />
      <circle cx={cx} cy={cy} r={r} fill="#1e293b" stroke="#334155" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={innerR} fill="#0f172a" />

      {/* Hour tick marks */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * 2 * Math.PI - Math.PI / 2;
        const x1t = cx + (r - 4) * Math.cos(angle);
        const y1t = cy + (r - 4) * Math.sin(angle);
        const x2t = cx + r * Math.cos(angle);
        const y2t = cy + r * Math.sin(angle);
        return <line key={i} x1={x1t} y1={y1t} x2={x2t} y2={y2t} stroke="#475569" strokeWidth={i % 6 === 0 ? 2 : 1} />;
      })}

      {/* Sessions */}
      {SESSIONS.map((sess) => (
        <path
          key={sess.name}
          d={arcPath(sess.startHour, sess.endHour, r - 6, innerR + 6)}
          fill={sess.color}
          opacity={0.6}
        />
      ))}

      {/* Hour labels */}
      {hourLabels.map((h) => {
        const angle = (h / 24) * 2 * Math.PI - Math.PI / 2;
        const x = cx + (r + 8) * Math.cos(angle);
        const y = cy + (r + 8) * Math.sin(angle);
        return (
          <text key={h} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="9">
            {h.toString().padStart(2, "0")}:00
          </text>
        );
      })}

      {/* Center label */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">24h FX</text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="#94a3b8" fontSize="9">UTC</text>

      {/* Session legend dots */}
      {SESSIONS.map((sess, i) => (
        <g key={sess.name}>
          <circle cx={10} cy={10 + i * 16} r={4} fill={sess.color} opacity={0.8} />
          <text x={18} y={14 + i * 16} fill="#cbd5e1" fontSize="8">{sess.name}</text>
        </g>
      ))}
    </svg>
  );
}

function SessionVolumeChart() {
  const maxV = Math.max(...SESSION_VOLUMES);
  const w = 480;
  const h = 100;
  const barW = w / 24 - 2;

  return (
    <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full">
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={0} y1={h - t * h + 2} x2={w} y2={h - t * h + 2} stroke="#1e293b" strokeWidth="1" />
      ))}

      {/* Bars colored by dominant session */}
      {SESSION_VOLUMES.map((v, h_i) => {
        let color = "#475569";
        if (h_i >= 12 && h_i <= 16) color = "#f59e0b"; // Overlap
        else if (h_i >= 7 && h_i <= 16) color = "#10b981"; // London
        else if (h_i >= 12 && h_i <= 21) color = "#f59e0b"; // NY
        else if (h_i >= 0 && h_i <= 9) color = "#8b5cf6"; // Tokyo
        else color = "#3b82f6"; // Sydney

        const barH = (v / maxV) * (h - 4);
        const x = h_i * (w / 24) + 1;
        return (
          <rect
            key={h_i}
            x={x}
            y={h - barH + 2}
            width={barW}
            height={barH}
            fill={color}
            opacity={0.7}
            rx={1}
          />
        );
      })}

      {/* X-axis labels */}
      {[0, 6, 12, 18, 23].map((h_i) => (
        <text
          key={h_i}
          x={h_i * (w / 24) + barW / 2}
          y={h + 20}
          textAnchor="middle"
          fill="#64748b"
          fontSize="9"
        >
          {h_i.toString().padStart(2, "0")}h
        </text>
      ))}

      {/* Y label */}
      <text x={2} y={12} fill="#475569" fontSize="8">Vol</text>
    </svg>
  );
}

function CarryReturnChart({ data, color }: { data: number[]; color: string }) {
  const w = 200;
  const h = 60;
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - minV) / range) * (h - 8) - 4;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id={`cg-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" />
      <polygon
        points={`0,${h} ${pts.join(" ")} ${w},${h}`}
        fill={`url(#cg-${color.slice(1)})`}
      />
      {/* Zero line */}
      {minV < 0 && (
        <line
          x1={0}
          y1={h - ((0 - minV) / range) * (h - 8) - 4}
          x2={w}
          y2={h - ((0 - minV) / range) * (h - 8) - 4}
          stroke="#475569"
          strokeWidth="0.5"
          strokeDasharray="3,3"
        />
      )}
    </svg>
  );
}

function ReerChart() {
  const w = 500;
  const h = 140;
  const allVals = REER_DATA.flatMap((d) => d.series);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;
  const n = REER_DATA[0].series.length;

  return (
    <svg viewBox={`0 0 ${w} ${h + 40}`} className="w-full">
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const yp = h - t * (h - 10) - 5;
        const val = minV + t * range;
        return (
          <g key={t}>
            <line x1={30} y1={yp} x2={w} y2={yp} stroke="#1e293b" strokeWidth="1" />
            <text x={25} y={yp + 3} textAnchor="end" fill="#475569" fontSize="8">{val.toFixed(0)}</text>
          </g>
        );
      })}

      {/* Lines */}
      {REER_DATA.map((d) => {
        const pts = d.series.map((v, i) => {
          const x = 30 + (i / (n - 1)) * (w - 30);
          const y = h - ((v - minV) / range) * (h - 10) - 5;
          return `${x},${y}`;
        });
        return (
          <polyline key={d.ccy} points={pts.join(" ")} fill="none" stroke={d.color} strokeWidth="1.5" opacity={0.85} />
        );
      })}

      {/* Legend */}
      {REER_DATA.map((d, i) => (
        <g key={d.ccy}>
          <line x1={30 + i * 90} y1={h + 20} x2={50 + i * 90} y2={h + 20} stroke={d.color} strokeWidth="2" />
          <text x={54 + i * 90} y={h + 24} fill={d.color} fontSize="9">{d.ccy}</text>
        </g>
      ))}

      {/* X-axis labels */}
      {[0, 10, 20, 30, 39].map((i) => (
        <text key={i} x={30 + (i / (n - 1)) * (w - 30)} y={h + 8} textAnchor="middle" fill="#475569" fontSize="8">
          Q{(i % 4) + 1}
        </text>
      ))}
    </svg>
  );
}

function CrisisSparkline({ data, color, devaluation }: { data: number[]; color: string; devaluation: number }) {
  const w = 120;
  const h = 40;
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - minV) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={w} cy={parseFloat(pts[pts.length - 1].split(",")[1])} r={2} fill={color} />
      <text x={w / 2} y={h - 2} textAnchor="middle" fill={color} fontSize="8" fontWeight="bold">
        {devaluation > 0 ? "+" : ""}{devaluation}%
      </text>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CurrencyMarketsPage() {
  const [selectedCarry, setSelectedCarry] = useState(0);
  const [leverage, setLeverage] = useState([10]);
  const [selectedCrisis, setSelectedCrisis] = useState<number | null>(0);

  const selectedCarryPair = CARRY_PAIRS[selectedCarry];
  const leveragedReturn = useMemo(() => {
    const base = selectedCarryPair.carryReturn[selectedCarryPair.carryReturn.length - 1];
    return (base * leverage[0]).toFixed(1);
  }, [selectedCarry, leverage, selectedCarryPair]);

  const leveragedDD = useMemo(() => {
    return (selectedCarryPair.maxDrawdown * leverage[0]).toFixed(1);
  }, [selectedCarry, leverage, selectedCarryPair]);

  const selectedCrisisData = selectedCrisis !== null ? CRISES[selectedCrisis] : null;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Currency Markets Deep Dive</h1>
            <p className="text-slate-400 text-sm">FX structure, carry trades, PPP/UIP theory, and currency crises</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Daily FX Volume", value: "$7.5T", icon: DollarSign, color: "text-emerald-400" },
            { label: "Major Pairs", value: "28+", icon: ArrowUpDown, color: "text-primary" },
            { label: "Trading Sessions", value: "4 Zones", icon: Clock, color: "text-primary" },
            { label: "24h Market", value: "Mon–Fri", icon: Activity, color: "text-amber-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white/[0.03] border-white/10">
              <CardContent className="p-3 flex items-center gap-3">
                <stat.icon className={cn("w-5 h-5 flex-shrink-0", stat.color)} />
                <div>
                  <div className={cn("text-lg font-bold", stat.color)}>{stat.value}</div>
                  <div className="text-slate-500 text-xs">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="structure" className="space-y-4">
        <TabsList className="bg-white/[0.05] border border-white/10 p-1 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="structure" className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <Globe className="w-3 h-3 mr-1" /> FX Structure
          </TabsTrigger>
          <TabsTrigger value="carry" className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <TrendingUp className="w-3 h-3 mr-1" /> Carry Trades
          </TabsTrigger>
          <TabsTrigger value="theory" className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <BookOpen className="w-3 h-3 mr-1" /> Theory
          </TabsTrigger>
          <TabsTrigger value="crises" className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <ShieldAlert className="w-3 h-3 mr-1" /> Crises
          </TabsTrigger>
        </TabsList>

        {/* ─── FX Structure ──────────────────────────────────────────────────── */}
        <TabsContent value="structure" className="space-y-4 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Currency Pairs Table */}
            <div className="xl:col-span-2">
              <Card className="bg-white/[0.03] border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    Major Currency Pairs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-500 text-xs">
                          <th className="py-2 px-4 text-left">Pair</th>
                          <th className="py-2 px-4 text-right">Spot</th>
                          <th className="py-2 px-4 text-right">Bid</th>
                          <th className="py-2 px-4 text-right">Ask</th>
                          <th className="py-2 px-4 text-right">Spread (pip)</th>
                          <th className="py-2 px-4 text-right">Daily Range</th>
                          <th className="py-2 px-4 text-right">1D Chg</th>
                          <th className="py-2 px-4 text-right">30D Vol</th>
                        </tr>
                      </thead>
                      <tbody>
                        {FX_PAIRS.map((pair) => (
                          <FxPairRow key={pair.symbol} pair={pair} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-3 border-t border-white/5 text-xs text-slate-500">
                    Spread in pips (1 pip = 0.0001 for majors, 0.01 for JPY pairs). Prices are indicative.
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Hours Wheel */}
            <div className="space-y-4">
              <Card className="bg-white/[0.03] border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Trading Sessions (UTC)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MarketHoursWheel />
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {SESSIONS.map((sess) => (
                      <div key={sess.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sess.color }} />
                        <span className="text-slate-300">{sess.name}</span>
                        <span className="text-slate-500 ml-auto">{sess.startHour.toString().padStart(2,"0")}–{sess.endHour.toString().padStart(2,"0")}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Volume by Session */}
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Daily Volume by Hour (UTC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SessionVolumeChart />
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                <span><span className="inline-block w-3 h-2 rounded bg-primary mr-1 opacity-70" />Tokyo (00–09)</span>
                <span><span className="inline-block w-3 h-2 rounded bg-emerald-500 mr-1 opacity-70" />London (07–16)</span>
                <span><span className="inline-block w-3 h-2 rounded bg-amber-500 mr-1 opacity-70" />New York (12–21) / Overlap</span>
                <span><span className="inline-block w-3 h-2 rounded bg-primary mr-1 opacity-70" />Sydney (21–06)</span>
              </div>
            </CardContent>
          </Card>

          {/* FX Market Structure Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "OTC Decentralized",
                icon: Globe,
                color: "text-primary",
                desc: "FX is the world's largest market at $7.5T/day. Unlike exchanges, it operates via an interbank network — major banks act as market makers, providing continuous bid/ask quotes.",
                tags: ["No Central Exchange", "24/5 Market", "Interbank + Retail"],
              },
              {
                title: "Participants",
                icon: ArrowUpDown,
                color: "text-primary",
                desc: "Central banks (policy/intervention), commercial banks (market making), hedge funds (speculation), corporates (hedging), retail traders (speculation). Tier-1 banks see tightest spreads.",
                tags: ["Central Banks", "Hedge Funds", "Corporates"],
              },
              {
                title: "Pip & Lot Sizing",
                icon: Target,
                color: "text-emerald-400",
                desc: "Standard lot = 100,000 units of base currency. Mini lot = 10,000. 1 pip on EUR/USD = $10/lot. JPY pairs: 1 pip = 0.01. Leverage commonly 20:1 to 500:1 (retail).",
                tags: ["Pip = 0.0001", "Standard Lot = 100K", "Leverage Risk"],
              },
            ].map((item) => (
              <Card key={item.title} className="bg-white/[0.03] border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={cn("w-4 h-4", item.color)} />
                    <span className="text-white font-semibold text-sm">{item.title}</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed mb-3">{item.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs border-white/10 text-slate-400">{t}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Carry Trades ──────────────────────────────────────────────────── */}
        <TabsContent value="carry" className="space-y-4 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Carry pair selector */}
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Carry Trade Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {CARRY_PAIRS.map((cp, i) => (
                  <button
                    key={cp.symbol}
                    onClick={() => setSelectedCarry(i)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-sm",
                      selectedCarry === i
                        ? "border-primary/50 bg-primary/10"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{cp.flag1}{cp.flag2}</span>
                      <span className="font-mono font-semibold text-white">{cp.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-mono text-xs">+{cp.differential.toFixed(2)}%</span>
                      <Badge
                        className={cn("text-xs", cp.crashRisk === "High" ? "bg-red-500/20 text-red-300 border-red-500/30" : cp.crashRisk === "Medium" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30")}
                      >
                        {cp.crashRisk}
                      </Badge>
                    </div>
                  </button>
                ))}

                {/* Leverage slider */}
                <div className="pt-3 border-t border-white/5">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Leverage</span>
                    <span className="text-white font-mono">{leverage[0]}x</span>
                  </div>
                  <Slider
                    value={leverage}
                    onValueChange={setLeverage}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Carry metrics */}
            <div className="space-y-4">
              <Card className="bg-white/[0.03] border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">
                    {selectedCarryPair.flag1}{selectedCarryPair.flag2} {selectedCarryPair.symbol} — Rate Differential
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">Long ({selectedCarryPair.longCcy})</div>
                      <div className="text-emerald-400 font-mono font-bold text-xl">{selectedCarryPair.longRate}%</div>
                      <div className="text-slate-500 text-xs">Policy rate</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">Short ({selectedCarryPair.shortCcy})</div>
                      <div className="text-red-400 font-mono font-bold text-xl">{selectedCarryPair.shortRate}%</div>
                      <div className="text-slate-500 text-xs">Policy rate</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 border-t border-white/5">
                    <span className="text-slate-400 text-sm">Net Differential</span>
                    <span className="text-amber-400 font-mono font-bold text-lg">+{selectedCarryPair.differential.toFixed(2)}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500 text-xs">30D Carry Return</span>
                      <span className={cn("font-mono font-semibold", parseFloat(selectedCarryPair.carryReturn[selectedCarryPair.carryReturn.length - 1].toString()) >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {selectedCarryPair.carryReturn[selectedCarryPair.carryReturn.length - 1]}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500 text-xs">Max Drawdown</span>
                      <span className="text-red-400 font-mono font-semibold">{selectedCarryPair.maxDrawdown}%</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500 text-xs">Sharpe Ratio</span>
                      <span className={cn("font-mono font-semibold", selectedCarryPair.sharpe > 0.5 ? "text-emerald-400" : "text-amber-400")}>
                        {selectedCarryPair.sharpe}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500 text-xs">Crash Risk</span>
                      <span className={cn("font-semibold", selectedCarryPair.crashRisk === "High" ? "text-red-400" : selectedCarryPair.crashRisk === "Medium" ? "text-amber-400" : "text-emerald-400")}>
                        {selectedCarryPair.crashRisk}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leveraged metrics */}
              <Card className={cn("border", parseFloat(leveragedDD) < -15 ? "bg-red-500/5 border-red-500/20" : "bg-white/[0.03] border-white/10")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-400" />
                    With {leverage[0]}x Leverage
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-slate-400 text-xs mb-1">Leveraged Return</div>
                    <div className={cn("font-mono font-bold text-xl", parseFloat(leveragedReturn) >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {parseFloat(leveragedReturn) >= 0 ? "+" : ""}{leveragedReturn}%
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-1">Max Drawdown</div>
                    <div className="font-mono font-bold text-xl text-red-400">{leveragedDD}%</div>
                  </div>
                  {parseFloat(leveragedDD) < -20 && (
                    <div className="col-span-2 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg p-2">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      High leverage risk: potential margin call / account wipeout
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Carry return chart */}
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">30-Period Carry Return</CardTitle>
              </CardHeader>
              <CardContent>
                <CarryReturnChart data={selectedCarryPair.carryReturn} color="#10b981" />
                <p className="text-slate-500 text-xs mt-2">Cumulative carry P&L (spot + rollover, unlevered)</p>
              </CardContent>
            </Card>
          </div>

          {/* Carry crash risk explainer */}
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Carry Crash Risk: How Carry Trades Unwind
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { phase: "Phase 1: Build-up", color: "emerald", desc: "Low volatility environment. Carry traders borrow cheap funding currencies (JPY, CHF) and invest in high-yielding EM currencies. Positions accumulate over months to years. Carry income is predictable." },
                  { phase: "Phase 2: Risk-off Shock", color: "amber", desc: "Global shock triggers risk aversion (crisis, recession, policy shift). Volatility spikes (VIX >25). Carry traders simultaneously exit positions — funding currencies surge, EM currencies collapse." },
                  { phase: "Phase 3: Crash", color: "red", desc: "Feedback loop: falling prices trigger stop-losses → more selling → prices fall further. Weeks of carry income erased in hours. Highly leveraged positions face margin calls. Carry crash is nonlinear and rapid." },
                ].map((p) => (
                  <div key={p.phase} className={cn("rounded-lg p-4 border", p.color === "emerald" ? "border-emerald-500/20 bg-emerald-500/5" : p.color === "amber" ? "border-amber-500/20 bg-amber-500/5" : "border-red-500/20 bg-red-500/5")}>
                    <div className={cn("font-semibold text-sm mb-2", p.color === "emerald" ? "text-emerald-400" : p.color === "amber" ? "text-amber-400" : "text-red-400")}>{p.phase}</div>
                    <p className="text-slate-400 text-xs leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-primary/10 border border-border rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong className="text-primary">Carry Crash Correlation:</strong> Carry returns exhibit negative skewness and excess kurtosis — they show small consistent gains interspersed with large sudden losses. The Sharpe ratio overstates risk-adjusted returns because it assumes normality. Position sizing and stop-losses are critical.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Theory ────────────────────────────────────────────────────────── */}
        <TabsContent value="theory" className="space-y-4 data-[state=inactive]:hidden">
          {/* Big Mac Index */}
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Purchasing Power Parity — Big Mac Index
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-xs mb-4">
                PPP states that exchange rates should equalize the price of identical goods across countries. The Big Mac Index (The Economist) uses McDonald's burger price as a real-world PPP indicator. A positive % means the currency is <strong className="text-amber-400">overvalued</strong> vs USD; negative means <strong className="text-primary">undervalued</strong>.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500 text-xs">
                      <th className="py-2 px-3 text-left">Country</th>
                      <th className="py-2 px-3 text-right">Big Mac Price</th>
                      <th className="py-2 px-3 text-right">PPP Rate</th>
                      <th className="py-2 px-3 text-right">Actual Rate</th>
                      <th className="py-2 px-3 text-right">Valuation vs USD</th>
                      <th className="py-2 px-3 text-left min-w-[120px]">Indicator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BIG_MAC_DATA.map((row) => {
                      const over = row.valuation > 0;
                      const pct = Math.abs(row.valuation);
                      const barWidth = Math.min(100, pct * 2);
                      return (
                        <tr key={row.country} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3">
                            <span className="mr-2">{row.flag}</span>
                            <span className="text-slate-200 text-xs">{row.country}</span>
                            <span className="text-slate-500 text-xs ml-1">({row.currency})</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-300 text-xs text-right">{row.currency} {row.bigMacPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-300 text-xs text-right">{row.impliedRate}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-300 text-xs text-right">{row.actualRate}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={cn("font-mono font-semibold text-sm", over ? "text-amber-400" : "text-primary")}>
                              {over ? "+" : ""}{row.valuation}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1">
                              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full", over ? "bg-amber-500" : "bg-primary")}
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                              <span className={cn("text-xs", over ? "text-amber-400" : "text-primary")}>
                                {over ? "Over" : "Under"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-slate-500">
                <span>US Big Mac: $5.69 (reference)</span>
                <span className="text-amber-400">Amber = overvalued vs USD</span>
                <span className="text-primary">Blue = undervalued vs USD</span>
              </div>
            </CardContent>
          </Card>

          {/* UIP and Taylor Rule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Uncovered Interest Parity (UIP) — Why It Fails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-primary/10 border border-border rounded-lg p-3">
                  <div className="font-mono text-primary text-xs text-center mb-1">UIP Theory:</div>
                  <div className="font-mono text-white text-sm text-center">E[ΔS] = i_d − i_f</div>
                  <div className="text-slate-400 text-xs text-center mt-1">High-rate currency should depreciate by the rate differential</div>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  UIP is one of the most empirically violated theories in international finance. In practice, high-interest-rate currencies tend to <strong className="text-white">appreciate</strong>, not depreciate — the "forward premium puzzle" or "carry trade profitability."
                </p>
                <div className="space-y-2">
                  {[
                    { reason: "Risk Premium", desc: "Investors demand compensation for currency crash risk, creating systematic excess returns." },
                    { reason: "Capital Flows", desc: "High rates attract capital inflows, appreciating the currency — opposite to UIP prediction." },
                    { reason: "Peso Problem", desc: "Rare crash events are not reflected in sample means — historical data underweights tail risk." },
                    { reason: "Behavioral Bias", desc: "Momentum and trend-following by institutional investors create persistent deviations." },
                  ].map((item) => (
                    <div key={item.reason} className="flex gap-2 text-xs">
                      <span className="text-primary font-semibold whitespace-nowrap">{item.reason}:</span>
                      <span className="text-slate-400">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Taylor Rule — Implied FX Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <div className="font-mono text-emerald-300 text-xs text-center mb-1">Taylor Rule:</div>
                  <div className="font-mono text-white text-xs text-center">r = r* + π + 0.5(π−π*) + 0.5·output_gap</div>
                  <div className="text-slate-400 text-xs text-center mt-1">Central bank rate setting framework</div>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  The Taylor Rule provides a framework for expected central bank rate paths, which in turn imply FX rate movements. When a country's Taylor rate exceeds its actual policy rate, the currency tends to appreciate (accommodative → tightening expected).
                </p>
                <div className="space-y-1.5">
                  {[
                    { pair: "EUR/USD", taylorGap: -0.8, dir: "USD stronger" },
                    { pair: "USD/JPY", taylorGap: 3.2, dir: "USD stronger vs JPY" },
                    { pair: "GBP/USD", taylorGap: 0.3, dir: "GBP slightly favored" },
                    { pair: "AUD/USD", taylorGap: -0.5, dir: "USD favored" },
                  ].map((item) => (
                    <div key={item.pair} className="flex items-center justify-between text-xs bg-white/[0.02] rounded px-2 py-1.5">
                      <span className="font-mono text-white">{item.pair}</span>
                      <span className={cn("font-mono", item.taylorGap > 0 ? "text-amber-400" : "text-primary")}>
                        {item.taylorGap > 0 ? "+" : ""}{item.taylorGap}%
                      </span>
                      <span className="text-slate-400">{item.dir}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* REER Chart */}
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                Real Effective Exchange Rate (REER) — Major Currencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-xs mb-4">
                REER adjusts nominal exchange rates for inflation differentials, providing a measure of a currency's true international competitiveness. Index = 100 at base period. Rising REER = appreciation (possible competitiveness loss).
              </p>
              <ReerChart />
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
                <div><span className="text-amber-400 font-semibold">USD REER:</span> Driven by Fed tightening, dollar dominance in trade invoicing.</div>
                <div><span className="text-primary font-semibold">EUR REER:</span> ECB policy normalization after years of negative rates.</div>
                <div><span className="text-primary font-semibold">JPY REER:</span> Multi-decade low reflects BOJ yield curve control and inflation gap.</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Crises ────────────────────────────────────────────────────────── */}
        <TabsContent value="crises" className="space-y-4 data-[state=inactive]:hidden">
          {/* Crisis Timeline */}
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Historical Currency Crises Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-16 top-4 bottom-4 w-px bg-white/10" />

                <div className="space-y-3">
                  {CRISES.map((crisis, i) => (
                    <motion.button
                      key={crisis.year}
                      onClick={() => setSelectedCrisis(selectedCrisis === i ? null : i)}
                      className={cn(
                        "w-full flex items-start gap-4 p-3 rounded-lg border text-left transition-colors",
                        selectedCrisis === i
                          ? "border-opacity-50 bg-opacity-10"
                          : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
                      )}
                      style={selectedCrisis === i ? { borderColor: crisis.color + "80", backgroundColor: crisis.color + "0a" } : {}}
                      whileHover={{ x: 2 }}
                    >
                      {/* Year badge */}
                      <div className="w-12 flex-shrink-0 text-right">
                        <Badge className="text-xs font-bold" style={{ backgroundColor: crisis.color + "30", color: crisis.color, borderColor: crisis.color + "50" }}>
                          {crisis.year}
                        </Badge>
                      </div>

                      {/* Timeline dot */}
                      <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1 border-2 border-slate-800" style={{ backgroundColor: crisis.color }} />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold text-sm">{crisis.name}</span>
                          <span className="text-slate-500 text-xs">{crisis.country}</span>
                          <Badge variant="outline" className="text-xs border-white/10 text-slate-400">{crisis.currency}</Badge>
                        </div>
                        <div className={cn("text-sm font-mono font-bold mt-0.5", crisis.peakDevaluation < 0 ? "text-red-400" : "text-emerald-400")}>
                          {crisis.peakDevaluation > 0 ? "+" : ""}{crisis.peakDevaluation}% peak move
                        </div>
                      </div>

                      {/* Sparkline */}
                      <div className="w-28 flex-shrink-0">
                        <CrisisSparkline data={crisis.sparkline} color={crisis.color} devaluation={crisis.peakDevaluation} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected crisis detail */}
          {selectedCrisisData && (
            <motion.div
              key={selectedCrisis}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border" style={{ borderColor: selectedCrisisData.color + "40", backgroundColor: selectedCrisisData.color + "08" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" style={{ color: selectedCrisisData.color }} />
                    {selectedCrisisData.year} — {selectedCrisisData.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-400 text-xs font-semibold mb-2">Attack Mechanics</div>
                      <p className="text-slate-300 text-sm leading-relaxed">{selectedCrisisData.mechanism}</p>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs font-semibold mb-2">Outcome</div>
                      <p className="text-slate-300 text-sm leading-relaxed">{selectedCrisisData.outcome}</p>
                    </div>
                  </div>

                  {/* Speculative pressure indicators */}
                  <div>
                    <div className="text-slate-400 text-xs font-semibold mb-2">Speculative Pressure Indicators</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Reserve Depletion", value: selectedCrisis === 0 ? 72 : selectedCrisis === 1 ? 85 : selectedCrisis === 2 ? 91 : selectedCrisis === 3 ? 88 : 20, unit: "%" },
                        { label: "Current Acct Deficit", value: selectedCrisis === 0 ? 2.1 : selectedCrisis === 1 ? 8.4 : selectedCrisis === 2 ? -4.2 : selectedCrisis === 3 ? -3.1 : 8.5, unit: "% GDP" },
                        { label: "Speculative Short", value: selectedCrisis === 0 ? 4.2 : selectedCrisis === 1 ? 12.8 : selectedCrisis === 2 ? 5.6 : selectedCrisis === 3 ? 7.3 : 31, unit: "$Bn" },
                        { label: "FX Vol Spike", value: selectedCrisis === 0 ? 18 : selectedCrisis === 1 ? 35 : selectedCrisis === 2 ? 28 : selectedCrisis === 3 ? 22 : 42, unit: "%" },
                      ].map((ind) => (
                        <div key={ind.label} className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                          <div className="text-slate-500 text-xs mb-1">{ind.label}</div>
                          <div className="font-mono font-bold text-white text-lg">{ind.value}{ind.unit}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Crisis Anatomy */}
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Anatomy of a Currency Crisis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-slate-400 text-xs font-semibold">First-Generation Model (Krugman 1979)</div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Fiscal deficits monetized by central banks create inflation, depleting foreign exchange reserves. When reserves approach zero, a speculative attack forces the abandonment of the peg. The attack is rational — speculators anticipate the inevitable. <strong className="text-white">Fundamentals-driven.</strong>
                  </p>
                  <div className="space-y-1">
                    {["Fiscal imbalance → money printing", "Inflation differential vs peg anchor", "Reserve depletion over time", "Speculative attack when reserves critical", "Peg collapses → sharp devaluation"].map((step, i) => (
                      <div key={step} className="flex items-center gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <span className="text-slate-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-slate-400 text-xs font-semibold">Second-Generation Model (Obstfeld 1994)</div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Multiple equilibria: a peg can be sustainable if everyone believes it will hold, but self-fulfilling attacks can force abandonment even with strong fundamentals. The cost of defending the peg depends on market expectations — creating a coordination game. <strong className="text-white">Expectations-driven.</strong>
                  </p>
                  <div className="space-y-1">
                    {["Peg sustainable at current beliefs", "Speculative pressure increases hedging cost", "Defense requires painful rate hikes", "Government weighs defense cost vs credibility", "Self-fulfilling exit if confidence breaks"].map((step, i) => (
                      <div key={step} className="flex items-center gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <span className="text-slate-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { title: "Early Warning Signals", items: ["Reserve/M2 ratio declining", "Real exchange rate overvaluation", "Current account deficit > 5% GDP", "Short-term debt / reserves > 1", "High dollarization of liabilities"] },
                  { title: "Central Bank Defense Tools", items: ["FX intervention (sell USD, buy local)", "Emergency rate hikes (100–1000bps)", "Capital controls on outflows", "IMF emergency credit lines", "Coordinated CB swap lines"] },
                  { title: "Post-Crisis Recovery", items: ["IMF conditionality programs", "Structural reform packages", "Debt restructuring / haircuts", "Gradual reserve rebuilding", "New monetary framework (inflation target)"] },
                ].map((section) => (
                  <div key={section.title} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <div className="text-slate-300 text-xs font-semibold mb-2">{section.title}</div>
                    {section.items.map((item) => (
                      <div key={item} className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <div className="w-1 h-1 rounded-full bg-slate-600 flex-shrink-0" />
                        {item}
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
