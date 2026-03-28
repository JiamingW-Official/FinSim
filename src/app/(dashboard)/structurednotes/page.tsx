"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Layers,
  RefreshCw,
  Zap,
  DollarSign,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Lock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 841;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate stable values
const stableRands = Array.from({ length: 60 }, () => rand());

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProductCard {
  id: string;
  name: string;
  shortName: string;
  description: string;
  participationRate: number;
  barrierLevel: number;
  coupon: number;
  protectionLevel: number;
  term: number;
  color: string;
  icon: React.ReactNode;
  keyFeature: string;
  risk: "Low" | "Medium" | "High";
}

interface ScenarioRow {
  label: string;
  underlyingReturn: number;
  noteReturn: number;
  description: string;
}

interface RiskFactor {
  name: string;
  score: number;
  description: string;
  color: string;
}

// ── Product Data ──────────────────────────────────────────────────────────────

const PRODUCTS: ProductCard[] = [
  {
    id: "ppn",
    name: "Principal Protected Note",
    shortName: "PPN",
    description:
      "100% capital protection at maturity with participation in underlying asset upside. Zero-coupon bond + call option structure.",
    participationRate: 80,
    barrierLevel: 0,
    coupon: 0,
    protectionLevel: 100,
    term: 5,
    color: "#22c55e",
    icon: <Shield className="w-5 h-5" />,
    keyFeature: "Full principal protection",
    risk: "Low",
  },
  {
    id: "autocall",
    name: "Auto-Callable Note",
    shortName: "Auto-Call",
    description:
      "Redeems early if underlying closes above call trigger on observation dates. Enhanced coupon compensates for call risk.",
    participationRate: 0,
    barrierLevel: 70,
    coupon: 9.5,
    protectionLevel: 70,
    term: 3,
    color: "#3b82f6",
    icon: <RefreshCw className="w-5 h-5" />,
    keyFeature: "Early redemption + enhanced yield",
    risk: "Medium",
  },
  {
    id: "rc",
    name: "Reverse Convertible",
    shortName: "Rev. Conv.",
    description:
      "High coupon in exchange for downside exposure. If underlying falls below barrier, principal converts to shares at strike.",
    participationRate: 0,
    barrierLevel: 75,
    coupon: 12.0,
    protectionLevel: 0,
    term: 1,
    color: "#f59e0b",
    icon: <TrendingDown className="w-5 h-5" />,
    keyFeature: "High coupon, barrier risk",
    risk: "High",
  },
  {
    id: "bonus",
    name: "Bonus Certificate",
    shortName: "Bonus Cert",
    description:
      "Pays bonus return if barrier is never breached. Full participation above bonus level. Capital at risk if barrier hit.",
    participationRate: 100,
    barrierLevel: 65,
    coupon: 0,
    protectionLevel: 0,
    term: 2,
    color: "#8b5cf6",
    icon: <Zap className="w-5 h-5" />,
    keyFeature: "Bonus + upside participation",
    risk: "Medium",
  },
  {
    id: "barrier",
    name: "Barrier Note",
    shortName: "Barrier",
    description:
      "Capital protection activated only if underlying stays above barrier throughout life. Attractive yield, conditional protection.",
    participationRate: 100,
    barrierLevel: 60,
    coupon: 6.5,
    protectionLevel: 100,
    term: 3,
    color: "#ec4899",
    icon: <Activity className="w-5 h-5" />,
    keyFeature: "Conditional protection + yield",
    risk: "Medium",
  },
];

// ── Structure Diagram SVG ─────────────────────────────────────────────────────

function StructureDiagramSVG({
  product,
  width = 280,
  height = 120,
}: {
  product: ProductCard;
  width?: number;
  height?: number;
}) {
  const pad = { l: 30, r: 20, t: 15, b: 25 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;

  // X axis: 0 to term years; Y axis: 0 to 140% payoff
  const xScale = (year: number) => (year / product.term) * W;
  const yScale = (pct: number) => H - ((pct - 60) / 80) * H;

  // Generate payoff path points
  const points: [number, number][] = [];
  if (product.id === "ppn") {
    // Flat at 100 then up with participation
    points.push([0, yScale(100)]);
    for (let y = 0; y <= product.term; y += 0.5) {
      const growth = 1 + (y / product.term) * 0.3 * (product.participationRate / 100);
      points.push([xScale(y), yScale(Math.max(100, 100 * growth))]);
    }
  } else if (product.id === "autocall") {
    // Stepped coupons with call trigger line
    for (let y = 0; y <= product.term; y += 0.5) {
      const val = 100 + (y / product.term) * product.coupon * product.term;
      points.push([xScale(y), yScale(val)]);
    }
  } else if (product.id === "rc") {
    // High coupon but drops below barrier
    points.push([0, yScale(100)]);
    points.push([xScale(product.term * 0.5), yScale(100 + product.coupon / 2)]);
    points.push([xScale(product.term), yScale(100 + product.coupon)]);
  } else if (product.id === "bonus") {
    // Flat until bonus, then up
    points.push([0, yScale(100)]);
    points.push([xScale(product.term * 0.6), yScale(115)]);
    points.push([xScale(product.term), yScale(120)]);
  } else {
    // Barrier note
    for (let y = 0; y <= product.term; y += 0.5) {
      const val = 100 + (y / product.term) * (product.coupon + 10);
      points.push([xScale(y), yScale(val)]);
    }
  }

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");

  // Barrier line y position
  const barrierY =
    product.barrierLevel > 0 ? yScale(product.barrierLevel) : null;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <g transform={`translate(${pad.l},${pad.t})`}>
        {/* Grid lines */}
        {[80, 100, 120].map((val) => (
          <line
            key={val}
            x1={0}
            y1={yScale(val)}
            x2={W}
            y2={yScale(val)}
            stroke="#334155"
            strokeDasharray="3,3"
            strokeWidth={0.5}
          />
        ))}
        {/* Barrier line */}
        {barrierY !== null && (
          <>
            <line
              x1={0}
              y1={barrierY}
              x2={W}
              y2={barrierY}
              stroke="#ef4444"
              strokeDasharray="4,2"
              strokeWidth={1}
            />
            <text x={W + 2} y={barrierY + 4} fill="#ef4444" fontSize={8}>
              {product.barrierLevel}%
            </text>
          </>
        )}
        {/* Principal line */}
        <line
          x1={0}
          y1={yScale(100)}
          x2={W}
          y2={yScale(100)}
          stroke="#64748b"
          strokeDasharray="2,2"
          strokeWidth={0.8}
        />
        <text x={W + 2} y={yScale(100) + 4} fill="#64748b" fontSize={8}>
          100%
        </text>
        {/* Payoff path */}
        <path
          d={pathD}
          fill="none"
          stroke={product.color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Axes */}
        <line x1={0} y1={0} x2={0} y2={H} stroke="#475569" strokeWidth={1} />
        <line x1={0} y1={H} x2={W} y2={H} stroke="#475569" strokeWidth={1} />
        {/* X labels */}
        {Array.from({ length: product.term + 1 }, (_, i) => (
          <text
            key={i}
            x={xScale(i)}
            y={H + 10}
            textAnchor="middle"
            fill="#64748b"
            fontSize={8}
          >
            Y{i}
          </text>
        ))}
        {/* Y label */}
        <text
          x={-8}
          y={yScale(100) + 4}
          textAnchor="end"
          fill="#94a3b8"
          fontSize={7}
        >
          100
        </text>
      </g>
    </svg>
  );
}

// ── Payoff Builder ────────────────────────────────────────────────────────────

function PayoffDiagramSVG({
  participationRate,
  barrierLevel,
  capitalProtection,
  width = 520,
  height = 260,
}: {
  participationRate: number;
  barrierLevel: number;
  capitalProtection: number;
  width?: number;
  height?: number;
}) {
  const pad = { l: 48, r: 20, t: 20, b: 40 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;

  // X: underlying -60% to +80%; Y: note return -60% to +80%
  const xMin = -0.6;
  const xMax = 0.8;
  const yMin = -0.6;
  const yMax = 0.8;

  const xScale = (v: number) => ((v - xMin) / (xMax - xMin)) * W;
  const yScale = (v: number) => H - ((v - yMin) / (yMax - yMin)) * H;
  const pr = participationRate / 100;
  const bl = barrierLevel / 100;
  const cp = capitalProtection / 100;

  const noteReturn = (underlyingReturn: number): number => {
    if (underlyingReturn < -(1 - bl)) {
      // Barrier breached
      return Math.max(underlyingReturn, cp - 1);
    }
    if (underlyingReturn < 0) {
      return Math.max(cp - 1, 0);
    }
    return underlyingReturn * pr;
  };

  // Build path
  const steps = 120;
  const pathPoints: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    const y = noteReturn(x);
    const px = xScale(x);
    const py = yScale(Math.max(yMin, Math.min(yMax, y)));
    pathPoints.push(`${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }

  // Diagonal reference (underlying 1:1)
  const refPath = `M ${xScale(xMin).toFixed(1)} ${yScale(xMin).toFixed(1)} L ${xScale(xMax).toFixed(1)} ${yScale(xMax).toFixed(1)}`;

  const xGridVals = [-0.4, -0.2, 0, 0.2, 0.4, 0.6];
  const yGridVals = [-0.4, -0.2, 0, 0.2, 0.4, 0.6];

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${pad.l},${pad.t})`}>
        {/* Grid */}
        {xGridVals.map((v) => (
          <line
            key={`xg-${v}`}
            x1={xScale(v)}
            y1={0}
            x2={xScale(v)}
            y2={H}
            stroke="#1e293b"
            strokeWidth={1}
          />
        ))}
        {yGridVals.map((v) => (
          <line
            key={`yg-${v}`}
            x1={0}
            y1={yScale(v)}
            x2={W}
            y2={yScale(v)}
            stroke="#1e293b"
            strokeWidth={1}
          />
        ))}
        {/* Reference diagonal */}
        <path
          d={refPath}
          fill="none"
          stroke="#475569"
          strokeWidth={1}
          strokeDasharray="5,3"
        />
        {/* Barrier vertical */}
        {barrierLevel < 100 && (
          <line
            x1={xScale(-(1 - bl))}
            y1={0}
            x2={xScale(-(1 - bl))}
            y2={H}
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="4,2"
          />
        )}
        {/* Zero lines */}
        <line
          x1={xScale(0)}
          y1={0}
          x2={xScale(0)}
          y2={H}
          stroke="#64748b"
          strokeWidth={0.8}
        />
        <line
          x1={0}
          y1={yScale(0)}
          x2={W}
          y2={yScale(0)}
          stroke="#64748b"
          strokeWidth={0.8}
        />
        {/* Payoff path */}
        <path
          d={pathPoints.join(" ")}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Fill above zero */}
        <clipPath id="above-zero">
          <rect x={0} y={0} width={W} height={yScale(0)} />
        </clipPath>
        <path
          d={pathPoints.join(" ")}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2.5}
          strokeLinecap="round"
          clipPath="url(#above-zero)"
        />
        {/* Fill below zero */}
        <clipPath id="below-zero">
          <rect x={0} y={yScale(0)} width={W} height={H - yScale(0)} />
        </clipPath>
        <path
          d={pathPoints.join(" ")}
          fill="none"
          stroke="#ef4444"
          strokeWidth={2.5}
          strokeLinecap="round"
          clipPath="url(#below-zero)"
        />
        {/* Axes */}
        <line x1={0} y1={0} x2={0} y2={H} stroke="#475569" strokeWidth={1} />
        <line x1={0} y1={H} x2={W} y2={H} stroke="#475569" strokeWidth={1} />
        {/* X axis labels */}
        {xGridVals.map((v) => (
          <text
            key={`xl-${v}`}
            x={xScale(v)}
            y={H + 14}
            textAnchor="middle"
            fill="#64748b"
            fontSize={10}
          >
            {v > 0 ? `+${(v * 100).toFixed(0)}%` : `${(v * 100).toFixed(0)}%`}
          </text>
        ))}
        {/* Y axis labels */}
        {yGridVals.map((v) => (
          <text
            key={`yl-${v}`}
            x={-6}
            y={yScale(v) + 4}
            textAnchor="end"
            fill="#64748b"
            fontSize={10}
          >
            {v > 0 ? `+${(v * 100).toFixed(0)}` : `${(v * 100).toFixed(0)}`}
          </text>
        ))}
        {/* Axis titles */}
        <text
          x={W / 2}
          y={H + 32}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={11}
        >
          Underlying Return
        </text>
        <text
          x={-34}
          y={H / 2}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={11}
          transform={`rotate(-90, -34, ${H / 2})`}
        >
          Note Return (%)
        </text>
        {/* Legend */}
        <g transform={`translate(${W - 130}, 8)`}>
          <rect x={0} y={0} width={125} height={50} rx={4} fill="#0f172a" opacity={0.9} />
          <line x1={8} y1={13} x2={22} y2={13} stroke="#475569" strokeDasharray="5,3" strokeWidth={1.5} />
          <text x={26} y={17} fill="#94a3b8" fontSize={9}>Underlying 1:1</text>
          <line x1={8} y1={27} x2={22} y2={27} stroke="#22c55e" strokeWidth={2} />
          <text x={26} y={31} fill="#94a3b8" fontSize={9}>Note (gain)</text>
          <line x1={8} y1={41} x2={22} y2={41} stroke="#ef4444" strokeWidth={2} />
          <text x={26} y={45} fill="#94a3b8" fontSize={9}>Note (loss)</text>
        </g>
      </g>
    </svg>
  );
}

// ── Pricing Waterfall SVG ─────────────────────────────────────────────────────

function PricingWaterfallSVG({
  zcbValue,
  optionPremium,
  creditSpread,
  distributionCost,
  width = 480,
  height = 240,
}: {
  zcbValue: number;
  optionPremium: number;
  creditSpread: number;
  distributionCost: number;
  width?: number;
  height?: number;
}) {
  const pad = { l: 60, r: 20, t: 20, b: 50 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;

  const bars = [
    { label: "Zero Coupon\nBond", value: zcbValue, color: "#22c55e" },
    { label: "Option\nPremium", value: optionPremium, color: "#3b82f6" },
    { label: "Credit\nSpread", value: -creditSpread, color: "#ef4444" },
    { label: "Distribution\nCost", value: -distributionCost, color: "#f59e0b" },
    {
      label: "Fair\nValue",
      value: zcbValue + optionPremium - creditSpread - distributionCost,
      color: "#8b5cf6",
    },
  ];

  const maxVal = 100;
  const yScale = (v: number) => H - (v / maxVal) * H;
  const barW = (W - (bars.length - 1) * 10) / bars.length;

  let runningY = 0;
  const barPositions = bars.map((b, i) => {
    const isFinal = i === bars.length - 1;
    const start = isFinal ? 0 : runningY;
    const height = Math.abs(b.value);
    const isNeg = b.value < 0;
    const barY = isNeg ? yScale(start) : yScale(start + b.value);
    if (!isFinal) {
      runningY += b.value;
    }
    return { ...b, barY, barH: (height / maxVal) * H, start, isNeg };
  });

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${pad.l},${pad.t})`}>
        {/* Grid */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={0}
              y1={yScale(v)}
              x2={W}
              y2={yScale(v)}
              stroke="#1e293b"
              strokeWidth={1}
            />
            <text x={-6} y={yScale(v) + 4} textAnchor="end" fill="#64748b" fontSize={10}>
              {v}
            </text>
          </g>
        ))}
        {/* Connector lines */}
        {barPositions.slice(0, -2).map((b, i) => {
          const nextBar = barPositions[i + 1];
          const lineY = b.isNeg ? b.barY + b.barH : b.barY;
          const nextStart = nextBar.isNeg ? nextBar.barY + nextBar.barH : nextBar.barY;
          const x1 = i * (barW + 10) + barW;
          const x2 = (i + 1) * (barW + 10);
          return (
            <line
              key={`conn-${i}`}
              x1={x1}
              y1={lineY}
              x2={x2}
              y2={nextStart}
              stroke="#475569"
              strokeDasharray="3,2"
              strokeWidth={0.8}
            />
          );
        })}
        {/* Bars */}
        {barPositions.map((b, i) => (
          <g key={i}>
            <rect
              x={i * (barW + 10)}
              y={b.barY}
              width={barW}
              height={b.barH}
              fill={b.color}
              opacity={0.85}
              rx={3}
            />
            <text
              x={i * (barW + 10) + barW / 2}
              y={b.barY - 4}
              textAnchor="middle"
              fill="#f1f5f9"
              fontSize={10}
              fontWeight="600"
            >
              {b.value > 0 ? `+${b.value.toFixed(1)}` : b.value.toFixed(1)}
            </text>
            {b.label.split("\n").map((line, li) => (
              <text
                key={li}
                x={i * (barW + 10) + barW / 2}
                y={H + 16 + li * 12}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize={9}
              >
                {line}
              </text>
            ))}
          </g>
        ))}
        {/* Axes */}
        <line x1={0} y1={0} x2={0} y2={H} stroke="#475569" strokeWidth={1} />
        <line x1={0} y1={H} x2={W} y2={H} stroke="#475569" strokeWidth={1} />
        {/* Y label */}
        <text
          x={-42}
          y={H / 2}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={10}
          transform={`rotate(-90, -42, ${H / 2})`}
        >
          % of Face Value
        </text>
      </g>
    </svg>
  );
}

// ── Risk Progress Bar ─────────────────────────────────────────────────────────

function RiskBar({
  label,
  score,
  description,
  color,
}: RiskFactor) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{score}/100</span>
          {open ? (
            <ChevronUp className="w-3 h-3 text-slate-400" />
          ) : (
            <ChevronDown className="w-3 h-3 text-slate-400" />
          )}
        </div>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-slate-400 leading-relaxed overflow-hidden"
          >
            {description}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Scenario Table ────────────────────────────────────────────────────────────

function ScenarioTable({
  participationRate,
  barrierLevel,
  capitalProtection,
}: {
  participationRate: number;
  barrierLevel: number;
  capitalProtection: number;
}) {
  const pr = participationRate / 100;
  const bl = barrierLevel / 100;
  const cp = capitalProtection / 100;

  const noteReturn = (u: number): number => {
    if (u < -(1 - bl)) return Math.max(u, cp - 1);
    if (u < 0) return Math.max(cp - 1, 0);
    return u * pr;
  };

  const scenarios: ScenarioRow[] = [
    {
      label: "Strong Bull",
      underlyingReturn: 0.35,
      noteReturn: noteReturn(0.35),
      description: "Underlying +35%",
    },
    {
      label: "Moderate Bull",
      underlyingReturn: 0.15,
      noteReturn: noteReturn(0.15),
      description: "Underlying +15%",
    },
    {
      label: "Flat / Base",
      underlyingReturn: 0.02,
      noteReturn: noteReturn(0.02),
      description: "Underlying +2%",
    },
    {
      label: "Mild Bear",
      underlyingReturn: -0.12,
      noteReturn: noteReturn(-0.12),
      description: "Underlying −12%",
    },
    {
      label: "Deep Bear",
      underlyingReturn: -0.35,
      noteReturn: noteReturn(-0.35),
      description: "Underlying −35%",
    },
    {
      label: "Crash",
      underlyingReturn: -0.55,
      noteReturn: noteReturn(-0.55),
      description: "Underlying −55%",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-2 px-3 text-slate-400 font-medium">
              Scenario
            </th>
            <th className="text-right py-2 px-3 text-slate-400 font-medium">
              Underlying
            </th>
            <th className="text-right py-2 px-3 text-slate-400 font-medium">
              Note Return
            </th>
            <th className="text-right py-2 px-3 text-slate-400 font-medium">
              Outperforms?
            </th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((row) => {
            const outperforms = row.noteReturn > row.underlyingReturn;
            const noteRetPct = (row.noteReturn * 100).toFixed(1);
            const undRetPct = (row.underlyingReturn * 100).toFixed(1);
            const isPositive = row.noteReturn >= 0;
            return (
              <tr
                key={row.label}
                className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-2 px-3 text-slate-200 font-medium">
                  {row.label}
                </td>
                <td className="py-2 px-3 text-right font-mono">
                  <span
                    className={
                      row.underlyingReturn >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }
                  >
                    {row.underlyingReturn >= 0
                      ? `+${undRetPct}%`
                      : `${undRetPct}%`}
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-mono">
                  <span
                    className={isPositive ? "text-emerald-400" : "text-red-400"}
                  >
                    {isPositive ? `+${noteRetPct}%` : `${noteRetPct}%`}
                  </span>
                </td>
                <td className="py-2 px-3 text-right">
                  {outperforms ? (
                    <span className="text-emerald-400 text-xs font-semibold">
                      Yes
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs">No</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Suitability Matrix ────────────────────────────────────────────────────────

const SUITABILITY_MATRIX = [
  {
    investor: "Conservative",
    ppn: true,
    autocall: false,
    rc: false,
    bonus: false,
    barrier: false,
  },
  {
    investor: "Moderate",
    ppn: true,
    autocall: true,
    rc: false,
    bonus: true,
    barrier: true,
  },
  {
    investor: "Balanced",
    ppn: true,
    autocall: true,
    rc: true,
    bonus: true,
    barrier: true,
  },
  {
    investor: "Aggressive",
    ppn: false,
    autocall: true,
    rc: true,
    bonus: true,
    barrier: true,
  },
  {
    investor: "Sophisticated",
    ppn: false,
    autocall: true,
    rc: true,
    bonus: true,
    barrier: true,
  },
];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StructuredNotesPage() {
  const [selectedProduct, setSelectedProduct] = useState<string>("ppn");
  const [participationRate, setParticipationRate] = useState(75);
  const [barrierLevel, setBarrierLevel] = useState(70);
  const [capitalProtection, setCapitalProtection] = useState(100);
  const [pricingYield, setPricingYield] = useState(4.5);
  const [creditSpreadBps, setCreditSpreadBps] = useState(120);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  // Pricing decomposition
  const zcbValue = useMemo(() => {
    const r = pricingYield / 100;
    const t = 5;
    return (100 / Math.pow(1 + r, t)) * (1 - creditSpreadBps / 10000 * t * 0.5);
  }, [pricingYield, creditSpreadBps]);

  const optionPremium = useMemo(() => {
    const r = pricingYield / 100;
    return (100 - zcbValue) * (participationRate / 100) * 0.85;
  }, [zcbValue, participationRate, pricingYield]);

  const creditSpreadCost = useMemo(
    () => (creditSpreadBps / 10000) * 100 * 2.5,
    [creditSpreadBps]
  );

  const distributionCost = 2.5;

  const fairValue = useMemo(
    () => zcbValue + optionPremium - creditSpreadCost - distributionCost,
    [zcbValue, optionPremium, creditSpreadCost]
  );

  const offerPrice = 100;
  const discount = offerPrice - fairValue;

  const riskFactors: RiskFactor[] = useMemo(() => [
    {
      name: "Market Risk",
      label: "Market Risk",
      score: Math.round(70 - (capitalProtection / 100) * 30 + (1 - barrierLevel / 100) * 20),
      description:
        "Exposure to underlying asset price movements. Higher capital protection reduces but does not eliminate market risk, especially for gap-down events.",
      color: "#3b82f6",
    },
    {
      name: "Credit Risk",
      label: "Credit Risk",
      score: Math.round(30 + creditSpreadBps / 20),
      description:
        "Issuer default risk — structured notes are unsecured obligations. Even principal-protected notes offer no protection if the issuer defaults before maturity.",
      color: "#ef4444",
    },
    {
      name: "Liquidity Risk",
      label: "Liquidity Risk",
      score: 62,
      description:
        "Secondary market liquidity is limited. Most structured notes trade at a discount if sold before maturity, and bid-ask spreads can be 2–5% of face value.",
      color: "#f59e0b",
    },
    {
      name: "Complexity Risk",
      label: "Complexity Risk",
      score: Math.round(50 + (100 - participationRate) / 5),
      description:
        "Structured products involve complex payoff profiles that are difficult to model accurately. Investors may misunderstand their true risk/return tradeoff.",
      color: "#8b5cf6",
    },
    {
      name: "Early Redemption",
      label: "Early Redemption Risk",
      score: Math.round(40 + (100 - capitalProtection) / 4),
      description:
        "Auto-callable and other early redemption features mean the note may terminate before the full term, forcing reinvestment at potentially unfavorable rates.",
      color: "#ec4899",
    },
  ], [capitalProtection, barrierLevel, creditSpreadBps, participationRate]);

  // Break-even analysis
  const breakEvenUnderlying = useMemo(() => {
    if (capitalProtection >= 100) return 0;
    const loss = 1 - capitalProtection / 100;
    return -loss;
  }, [capitalProtection]);

  const selectedProductData = PRODUCTS.find((p) => p.id === selectedProduct) ?? PRODUCTS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">
              Structured Notes
            </h1>
            <p className="text-sm text-slate-400">
              Principal-protected notes, auto-callables, reverse convertibles,
              and structured product payoff analysis
            </p>
          </div>
        </div>
        {/* Key metrics strip */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Market Size",
              value: "$3.2T",
              sub: "Global structured products",
              icon: <BarChart3 className="w-4 h-4" />,
              color: "text-blue-400",
            },
            {
              label: "Avg Term",
              value: "3–5 yr",
              sub: "Typical note maturity",
              icon: <Activity className="w-4 h-4" />,
              color: "text-emerald-400",
            },
            {
              label: "Typical Spread",
              value: "1–3%",
              sub: "Issuer margin over fair value",
              icon: <DollarSign className="w-4 h-4" />,
              color: "text-amber-400",
            },
            {
              label: "Protection Types",
              value: "3",
              sub: "Hard / soft / conditional",
              icon: <Lock className="w-4 h-4" />,
              color: "text-purple-400",
            },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-start gap-2"
            >
              <div className={cn("mt-0.5", m.color)}>{m.icon}</div>
              <div>
                <div className={cn("text-lg font-bold", m.color)}>{m.value}</div>
                <div className="text-xs text-slate-400 font-medium">{m.label}</div>
                <div className="text-xs text-slate-500">{m.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="bg-slate-900 border border-slate-800 h-auto flex-wrap gap-1 p-1">
          <TabsTrigger
            value="products"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Product Types
          </TabsTrigger>
          <TabsTrigger
            value="payoff"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Payoff Builder
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
          >
            <DollarSign className="w-3.5 h-3.5 mr-1.5" />
            Pricing
          </TabsTrigger>
          <TabsTrigger
            value="risk"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            Risk Analysis
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Product Types ── */}
        <TabsContent value="products" className="data-[state=inactive]:hidden">
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Structured notes combine a fixed-income component (typically a
              zero-coupon bond) with one or more derivative instruments to create
              customized risk/return profiles. Click a product to explore its
              structure.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {PRODUCTS.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() =>
                    setSelectedProduct(
                      selectedProduct === product.id ? "" : product.id
                    )
                  }
                  className={cn(
                    "bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all",
                    selectedProduct === product.id
                      ? "border-slate-500 ring-1 ring-slate-500/40"
                      : "border-slate-800 hover:border-slate-700"
                  )}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-1.5 rounded-lg"
                        style={{
                          backgroundColor: product.color + "20",
                          color: product.color,
                        }}
                      >
                        {product.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-100">
                          {product.shortName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {product.name}
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        product.risk === "Low"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : product.risk === "Medium"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-red-500/15 text-red-400"
                      )}
                    >
                      {product.risk}
                    </span>
                  </div>

                  {/* Structure diagram */}
                  <div className="flex justify-center mb-3 bg-slate-950/50 rounded-lg py-2">
                    <StructureDiagramSVG product={product} width={260} height={110} />
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {product.description}
                  </p>

                  {/* Key metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                      <div
                        className="text-sm font-bold"
                        style={{ color: product.color }}
                      >
                        {product.participationRate > 0
                          ? `${product.participationRate}%`
                          : "N/A"}
                      </div>
                      <div className="text-xs text-slate-500">Participation</div>
                    </div>
                    <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                      <div
                        className="text-sm font-bold"
                        style={{ color: product.color }}
                      >
                        {product.barrierLevel > 0
                          ? `${product.barrierLevel}%`
                          : "None"}
                      </div>
                      <div className="text-xs text-slate-500">Barrier</div>
                    </div>
                    <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                      <div
                        className="text-sm font-bold"
                        style={{ color: product.color }}
                      >
                        {product.coupon > 0 ? `${product.coupon}%` : "0%"}
                      </div>
                      <div className="text-xs text-slate-500">Coupon</div>
                    </div>
                  </div>

                  {/* Key feature badge */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-400 italic">
                      {product.keyFeature}
                    </span>
                  </div>

                  {/* Term */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-400">
                      Term: {product.term} year{product.term > 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      Protection: {product.protectionLevel}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Explainer info boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[
                {
                  id: "hard-protection",
                  title: "Hard vs Soft Barrier",
                  icon: <Shield className="w-4 h-4 text-emerald-400" />,
                  content:
                    "A hard barrier is breached on any intraday touch (continuous observation). A soft/European barrier only checks at maturity. Hard barriers are more easily triggered and provide less protection than they appear.",
                },
                {
                  id: "autocall-mechanism",
                  title: "Auto-Call Mechanism",
                  icon: <RefreshCw className="w-4 h-4 text-blue-400" />,
                  content:
                    "On each observation date (typically quarterly or annually), if the underlying closes above the call trigger (often 100% of initial), the note redeems at face value plus accrued coupon. Memory coupons pay all previously missed coupons on redemption.",
                },
              ].map((box) => (
                <div
                  key={box.id}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-4"
                >
                  <div
                    className="flex items-center gap-2 mb-2 cursor-pointer"
                    onClick={() =>
                      setExpandedInfo(
                        expandedInfo === box.id ? null : box.id
                      )
                    }
                  >
                    {box.icon}
                    <span className="text-sm font-medium text-slate-200">
                      {box.title}
                    </span>
                    {expandedInfo === box.id ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                    )}
                  </div>
                  <AnimatePresence>
                    {expandedInfo === box.id && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-slate-400 leading-relaxed overflow-hidden"
                      >
                        {box.content}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Payoff Builder ── */}
        <TabsContent value="payoff" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <div className="space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-5">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Payoff Parameters
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Participation Rate</span>
                    <span className="font-mono text-blue-400">
                      {participationRate}%
                    </span>
                  </div>
                  <Slider
                    value={[participationRate]}
                    onValueChange={([v]) => setParticipationRate(v)}
                    min={20}
                    max={150}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">
                    % of upside you capture. &gt;100% = leveraged note.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Barrier Level</span>
                    <span className="font-mono text-amber-400">
                      {barrierLevel}%
                    </span>
                  </div>
                  <Slider
                    value={[barrierLevel]}
                    onValueChange={([v]) => setBarrierLevel(v)}
                    min={50}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">
                    Protection kicks in down to this level. Below = capital at
                    risk.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Capital Protection</span>
                    <span className="font-mono text-emerald-400">
                      {capitalProtection}%
                    </span>
                  </div>
                  <Slider
                    value={[capitalProtection]}
                    onValueChange={([v]) => setCapitalProtection(v)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">
                    Minimum return of principal at maturity if barrier is
                    breached.
                  </p>
                </div>
              </div>

              {/* Key metrics */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">
                  Payoff Summary
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      label: "Upside at +30%",
                      value: `+${((participationRate / 100) * 30).toFixed(1)}%`,
                      color: "text-emerald-400",
                    },
                    {
                      label: "Upside at +50%",
                      value: `+${((participationRate / 100) * 50).toFixed(1)}%`,
                      color: "text-emerald-400",
                    },
                    {
                      label: "At barrier breach",
                      value:
                        capitalProtection >= 100
                          ? "100% returned"
                          : `${capitalProtection}% returned`,
                      color:
                        capitalProtection >= 100
                          ? "text-emerald-400"
                          : "text-amber-400",
                    },
                    {
                      label: "Worst case",
                      value:
                        capitalProtection === 0
                          ? "Full loss possible"
                          : `−${(100 - capitalProtection).toFixed(0)}% max loss`,
                      color:
                        capitalProtection === 0
                          ? "text-red-400"
                          : "text-amber-400",
                    },
                    {
                      label: "Break-even",
                      value:
                        breakEvenUnderlying === 0
                          ? "Any positive return"
                          : `Underlying ≥ ${(breakEvenUnderlying * 100).toFixed(0)}%`,
                      color: "text-slate-300",
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="flex justify-between text-xs"
                    >
                      <span className="text-slate-400">{m.label}</span>
                      <span className={cn("font-mono font-medium", m.color)}>
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payoff diagram */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Payoff Diagram — Underlying vs Note Return
                </h3>
                <div className="overflow-x-auto">
                  <PayoffDiagramSVG
                    participationRate={participationRate}
                    barrierLevel={barrierLevel}
                    capitalProtection={capitalProtection}
                    width={520}
                    height={280}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Green line = note outperforms; Red line = note underperforms.
                  Dashed vertical = barrier level. Dashed diagonal = 1:1 reference.
                </p>
              </div>

              {/* Scenarios */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  Scenario Analysis
                </h3>
                <ScenarioTable
                  participationRate={participationRate}
                  barrierLevel={barrierLevel}
                  capitalProtection={capitalProtection}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Pricing ── */}
        <TabsContent value="pricing" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-5">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Pricing Inputs
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Risk-Free Rate</span>
                    <span className="font-mono text-emerald-400">
                      {pricingYield.toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    value={[pricingYield * 10]}
                    onValueChange={([v]) => setPricingYield(v / 10)}
                    min={5}
                    max={80}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">
                    Higher rates = cheaper zero coupon bond = more budget for
                    options.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Credit Spread</span>
                    <span className="font-mono text-red-400">
                      {creditSpreadBps} bps
                    </span>
                  </div>
                  <Slider
                    value={[creditSpreadBps]}
                    onValueChange={([v]) => setCreditSpreadBps(v)}
                    min={20}
                    max={400}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">
                    Issuer credit risk. Wider spreads reduce the ZCB value and
                    fair value.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Participation Rate</span>
                    <span className="font-mono text-blue-400">
                      {participationRate}%
                    </span>
                  </div>
                  <Slider
                    value={[participationRate]}
                    onValueChange={([v]) => setParticipationRate(v)}
                    min={20}
                    max={150}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Fair value vs offer */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">
                  Valuation Summary
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: "ZCB Component",
                      value: zcbValue,
                      color: "#22c55e",
                      sign: "+",
                    },
                    {
                      label: "Option Premium",
                      value: optionPremium,
                      color: "#3b82f6",
                      sign: "+",
                    },
                    {
                      label: "Credit Spread Cost",
                      value: -creditSpreadCost,
                      color: "#ef4444",
                      sign: "−",
                    },
                    {
                      label: "Distribution Cost",
                      value: -distributionCost,
                      color: "#f59e0b",
                      sign: "−",
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-xs">
                      <span className="text-slate-400">{item.label}</span>
                      <span
                        className="font-mono font-semibold"
                        style={{ color: item.color }}
                      >
                        {item.sign}
                        {Math.abs(item.value).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-semibold">
                    <span className="text-slate-200">Fair Value</span>
                    <span className="font-mono text-purple-400">
                      {fairValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Offer Price</span>
                    <span className="font-mono text-slate-200">
                      {offerPrice.toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex justify-between text-xs font-semibold",
                      discount > 0 ? "text-red-400" : "text-emerald-400"
                    )}
                  >
                    <span>
                      {discount > 0 ? "Investor Discount" : "Investor Premium"}
                    </span>
                    <span className="font-mono">
                      {discount > 0 ? "−" : "+"}
                      {Math.abs(discount).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Waterfall chart + secondary market */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Component Decomposition — % of Face Value
                </h3>
                <div className="overflow-x-auto">
                  <PricingWaterfallSVG
                    zcbValue={zcbValue}
                    optionPremium={optionPremium}
                    creditSpread={creditSpreadCost}
                    distributionCost={distributionCost}
                    width={480}
                    height={240}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Each bar shows the contribution to total note value. Credit spread and
                  distribution costs are subtracted from fair value.
                </p>
              </div>

              {/* Secondary market + liquidity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Secondary Market Dynamics
                  </h3>
                  <div className="space-y-3 text-xs text-slate-400">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>
                        Secondary markets are OTC and illiquid. Dealer marks
                        can differ by 3–8% from theoretical value.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>
                        Bid-ask spreads widen in volatile markets and near
                        barrier levels due to elevated gamma.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendingDown className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span>
                        Early exit typically at 92–97¢ on the dollar depending
                        on time to maturity and market conditions.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-400" />
                    Issuer Credit Impact
                  </h3>
                  <div className="space-y-2">
                    {[
                      { rating: "AAA / AA", spread: "20–50", impact: "Low" },
                      { rating: "A", spread: "60–120", impact: "Moderate" },
                      { rating: "BBB", spread: "130–250", impact: "High" },
                      { rating: "BB / B", spread: "300–600+", impact: "Very High" },
                    ].map((row) => (
                      <div
                        key={row.rating}
                        className="flex justify-between text-xs text-slate-400"
                      >
                        <span className="text-slate-300 font-medium">
                          {row.rating}
                        </span>
                        <span className="font-mono">{row.spread} bps</span>
                        <span
                          className={cn(
                            "font-medium",
                            row.impact === "Low"
                              ? "text-emerald-400"
                              : row.impact === "Moderate"
                              ? "text-amber-400"
                              : "text-red-400"
                          )}
                        >
                          {row.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 4: Risk Analysis ── */}
        <TabsContent value="risk" className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Risk factors */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Risk Factor Scores (click to expand)
              </h3>
              <div className="space-y-4">
                {riskFactors.map((rf) => (
                  <RiskBar key={rf.name} {...rf} />
                ))}
              </div>
              <p className="text-xs text-slate-500 border-t border-slate-800 pt-3">
                Risk scores adjust dynamically based on Payoff Builder parameters.
                Try increasing participation rate or reducing capital protection.
              </p>
            </div>

            {/* Suitability matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Investor Suitability Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-2 text-slate-400 font-medium">
                        Investor Type
                      </th>
                      {PRODUCTS.map((p) => (
                        <th
                          key={p.id}
                          className="text-center py-2 px-1 text-slate-400 font-medium"
                        >
                          {p.shortName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SUITABILITY_MATRIX.map((row) => (
                      <tr
                        key={row.investor}
                        className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="py-2 px-2 text-slate-200 font-medium">
                          {row.investor}
                        </td>
                        {(
                          ["ppn", "autocall", "rc", "bonus", "barrier"] as const
                        ).map((key) => (
                          <td key={key} className="py-2 px-1 text-center">
                            {row[key] ? (
                              <span className="text-emerald-400 text-base">
                                ✓
                              </span>
                            ) : (
                              <span className="text-slate-700 text-base">
                                ✗
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Break-even analysis */}
              <div className="mt-4 p-3 bg-slate-800/40 rounded-lg">
                <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  Break-Even Analysis (current settings)
                </h4>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Participation Rate</span>
                    <span className="font-mono text-blue-400">
                      {participationRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capital Protection</span>
                    <span className="font-mono text-emerald-400">
                      {capitalProtection}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Barrier Level</span>
                    <span className="font-mono text-amber-400">
                      {barrierLevel}%
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700 pt-1.5">
                    <span>Break-even underlying</span>
                    <span
                      className={cn(
                        "font-mono font-semibold",
                        breakEvenUnderlying === 0
                          ? "text-emerald-400"
                          : "text-amber-400"
                      )}
                    >
                      {breakEvenUnderlying === 0
                        ? "Any ≥ 0%"
                        : `≥ ${(breakEvenUnderlying * 100).toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max loss at crash (−60%)</span>
                    <span
                      className={cn(
                        "font-mono font-semibold",
                        capitalProtection >= 100
                          ? "text-emerald-400"
                          : "text-red-400"
                      )}
                    >
                      {capitalProtection >= 100
                        ? "0% (fully protected)"
                        : `−${(100 - capitalProtection).toFixed(0)}%`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Full Scenario Table — Current Payoff Parameters
              </h3>
              <ScenarioTable
                participationRate={participationRate}
                barrierLevel={barrierLevel}
                capitalProtection={capitalProtection}
              />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    icon: <Shield className="w-4 h-4 text-emerald-400" />,
                    title: "Regulatory Caveat",
                    text: "Structured notes are complex instruments. MiFID II and SEC regulations require suitability assessments and enhanced disclosures for retail investors.",
                    color: "border-emerald-500/20",
                  },
                  {
                    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
                    title: "Liquidity Warning",
                    text: "Most structured notes have no active secondary market. Plan to hold to maturity or accept a potentially significant exit penalty.",
                    color: "border-amber-500/20",
                  },
                  {
                    icon: <Info className="w-4 h-4 text-blue-400" />,
                    title: "Tax Consideration",
                    text: "Returns may be taxed as ordinary income rather than capital gains. Consult a tax advisor for jurisdiction-specific treatment of contingent payment instruments.",
                    color: "border-blue-500/20",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className={cn(
                      "bg-slate-800/30 border rounded-lg p-3",
                      card.color
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {card.icon}
                      <span className="text-xs font-semibold text-slate-200">
                        {card.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {card.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
