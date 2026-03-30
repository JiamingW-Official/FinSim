"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

// ── PRNG ───────────────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Types ──────────────────────────────────────────────────────────────────────

type VolRegime = "calm" | "moderate" | "elevated" | "crisis";

interface TermPoint {
  label: string;
  vix: number;
}

interface IVPercentile {
  ticker: string;
  ivPct: number;    // 0–100
  ivCurrent: number; // %
}

interface VolData {
  vix: number;
  vvix: number;
  termStructure: TermPoint[];
  regime: VolRegime;
  ivPercentiles: IVPercentile[];
  vixHistory: number[]; // 30 days for sparkline
}

// ── Regime config ──────────────────────────────────────────────────────────────

const REGIME_CONFIG: Record<VolRegime, { label: string; color: string; colorClass: string; badgeClass: string; description: string }> = {
  calm: {
    label: "Calm",
    color: "#22c55e",
    colorClass: "text-green-500",
    badgeClass: "bg-green-500/10 text-green-500 border-green-500/20",
    description: "VIX below 15 — low volatility, complacency risk.",
  },
  moderate: {
    label: "Moderate",
    color: "#eab308",
    colorClass: "text-yellow-500",
    badgeClass: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    description: "VIX 15–25 — normal market conditions.",
  },
  elevated: {
    label: "Elevated",
    color: "#f97316",
    colorClass: "text-orange-500",
    badgeClass: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    description: "VIX 25–35 — heightened uncertainty, wider option spreads.",
  },
  crisis: {
    label: "Crisis",
    color: "#ef4444",
    colorClass: "text-red-500",
    badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
    description: "VIX above 35 — extreme fear, potential tail risk.",
  },
};

function getRegime(vix: number): VolRegime {
  if (vix < 15) return "calm";
  if (vix < 25) return "moderate";
  if (vix < 35) return "elevated";
  return "crisis";
}

// ── Data generation ────────────────────────────────────────────────────────────

const TOP_TICKERS = ["AAPL", "TSLA", "NVDA", "AMZN", "MSFT"];

function generateVolData(): VolData {
  const daySeed = Math.floor(Date.now() / 86400000) + 9001;
  const rng = mulberry32(daySeed);

  // VIX: 11–42 range
  const vix = 11 + rng() * 31;
  const regime = getRegime(vix);

  // VVIX: typically 80–140, correlated with VIX
  const vvix = 80 + rng() * 60 + (vix - 20) * 1.2;

  // VIX term structure: contango (normal) vs backwardation (stressed)
  const isBackwardation = vix > 25;
  const term1m = vix;
  const term3m = isBackwardation
    ? term1m - rng() * 3
    : term1m + rng() * 2;
  const term6m = isBackwardation
    ? term3m - rng() * 2
    : term3m + rng() * 1.5;
  const term1y = isBackwardation
    ? term6m - rng() * 1.5
    : term6m + rng() * 1;

  const termStructure: TermPoint[] = [
    { label: "VIX", vix: Math.max(10, term1m) },
    { label: "3M",  vix: Math.max(10, term3m) },
    { label: "6M",  vix: Math.max(10, term6m) },
    { label: "1Y",  vix: Math.max(10, term1y) },
  ];

  // IV percentiles per ticker
  const ivPercentiles: IVPercentile[] = TOP_TICKERS.map((ticker) => {
    const ivPct = Math.round(rng() * 100);
    const baseIV = ticker === "TSLA" || ticker === "NVDA" ? 0.50 : 0.28;
    const ivCurrent = Math.max(0.15, baseIV * (0.5 + rng()));
    return { ticker, ivPct, ivCurrent };
  });

  // 30-day VIX history — random walk backward from current
  const vixHistory: number[] = new Array(30);
  vixHistory[29] = vix;
  for (let i = 28; i >= 0; i--) {
    vixHistory[i] = Math.max(10, vixHistory[i + 1] + (rng() - 0.5) * 2.5);
  }

  return {
    vix,
    vvix: Math.max(80, Math.min(160, vvix)),
    termStructure,
    regime,
    ivPercentiles,
    vixHistory,
  };
}

// ── VIX Sparkline ──────────────────────────────────────────────────────────────

function VixSparkline({ data, regimeColor }: { data: number[]; regimeColor: string }) {
  const W = 200;
  const H = 48;
  const pad = { t: 4, r: 4, b: 4, l: 4 };

  const min = Math.min(...data) * 0.95;
  const max = Math.max(...data) * 1.05;
  const range = max - min || 1;

  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const pts = data.map((v, i) => {
    const x = pad.l + (i / (data.length - 1)) * innerW;
    const y = pad.t + innerH - ((v - min) / range) * innerH;
    return [x, y] as [number, number];
  });

  const linePts = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  // Area path
  const fillPts = [
    `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`,
    ...pts.slice(1).map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`),
    `L ${pts[pts.length - 1][0].toFixed(1)} ${(pad.t + innerH).toFixed(1)}`,
    `L ${pts[0][0].toFixed(1)} ${(pad.t + innerH).toFixed(1)}`,
    "Z",
  ].join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label="30-day VIX history" className="w-full">
      <defs>
        <linearGradient id="vix-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={regimeColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={regimeColor} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={fillPts} fill="url(#vix-area-grad)" />
      <polyline
        points={linePts}
        fill="none"
        stroke={regimeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Term structure bar chart ───────────────────────────────────────────────────

function TermStructureChart({ points }: { points: TermPoint[] }) {
  const maxVix = Math.max(...points.map((p) => p.vix)) * 1.1;
  const W = 240;
  const H = 80;
  const padL = 8;
  const padR = 8;
  const padT = 8;
  const padB = 20;

  const barW = ((W - padL - padR) / points.length) * 0.5;
  const gap = (W - padL - padR) / points.length;

  const isBackwardation = points[0].vix > points[points.length - 1].vix;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="VIX term structure">
      {points.map((pt, i) => {
        const barH = ((pt.vix / maxVix) * (H - padT - padB));
        const x = padL + i * gap + (gap - barW) / 2;
        const y = padT + (H - padT - padB) - barH;
        const color = isBackwardation ? "#ef4444" : "#3b82f6";
        return (
          <g key={pt.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={color}
              opacity={0.7 + i * 0.05}
              rx={2}
            />
            <text
              x={x + barW / 2}
              y={H - padB + 12}
              textAnchor="middle"
              fontSize={9}
              className="fill-muted-foreground"
            >
              {pt.label}
            </text>
            <text
              x={x + barW / 2}
              y={y - 2}
              textAnchor="middle"
              fontSize={8}
              fill={color}
              fontWeight={600}
            >
              {pt.vix.toFixed(1)}
            </text>
          </g>
        );
      })}
      {/* Axis line */}
      <line
        x1={padL}
        y1={H - padB}
        x2={W - padR}
        y2={H - padB}
        stroke="currentColor"
        strokeWidth={0.5}
        className="text-muted-foreground/30"
      />
    </svg>
  );
}

// ── IV Percentile bar ──────────────────────────────────────────────────────────

function IVPercentileRow({ item }: { item: IVPercentile }) {
  const pct = item.ivPct;
  const color =
    pct >= 80 ? "#ef4444" :
    pct >= 60 ? "#f97316" :
    pct >= 40 ? "#eab308" :
    "#22c55e";

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[11px] font-semibold w-12 shrink-0">{item.ticker}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-[11px] tabular-nums w-8 text-right" style={{ color }}>
        {pct}%
      </span>
      <span className="font-mono text-[10px] tabular-nums text-muted-foreground w-12 text-right shrink-0">
        {(item.ivCurrent * 100).toFixed(1)}% IV
      </span>
    </div>
  );
}

// ── Regime meter ───────────────────────────────────────────────────────────────

const REGIME_LEVELS: { label: VolRegime; min: number; max: number }[] = [
  { label: "calm",     min: 0,  max: 15 },
  { label: "moderate", min: 15, max: 25 },
  { label: "elevated", min: 25, max: 35 },
  { label: "crisis",   min: 35, max: 50 },
];

function RegimeMeter({ vix }: { vix: number }) {
  const displayVix = Math.min(50, vix);
  const pct = (displayVix / 50) * 100;
  const regime = getRegime(vix);
  const cfg = REGIME_CONFIG[regime];

  return (
    <div className="space-y-1">
      {/* Bar */}
      <div className="relative h-3 rounded-full overflow-hidden bg-muted">
        {/* Zone fills */}
        <div className="absolute inset-0 flex">
          <div className="flex-[15] bg-green-500/20" />
          <div className="flex-[10] bg-yellow-500/20" />
          <div className="flex-[10] bg-orange-500/20" />
          <div className="flex-[15] bg-red-500/20" />
        </div>
        {/* Needle */}
        <div
          className="absolute top-0 h-full w-0.5 shadow"
          style={{ left: `${pct}%`, backgroundColor: cfg.color }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>0</span>
        <span>15</span>
        <span>25</span>
        <span>35</span>
        <span>50+</span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function VolatilityDashboard() {
  const data = useMemo(generateVolData, []);
  const regime = getRegime(data.vix);
  const cfg = REGIME_CONFIG[regime];
  const isBackwardation = data.termStructure[0].vix > data.termStructure[data.termStructure.length - 1].vix;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Volatility Dashboard</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">VIX, VVIX, term structure, IV percentiles</p>
        </div>
        <span className={cn("text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded border", cfg.badgeClass)}>
          {cfg.label}
        </span>
      </div>

      {/* VIX headline + VVIX */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded border border-border/50 bg-muted/20 px-3 py-2.5 space-y-0.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">VIX</p>
          <p className={cn("font-mono text-2xl font-bold tabular-nums", cfg.colorClass)}>
            {data.vix.toFixed(2)}
          </p>
          <p className="text-[9px] text-muted-foreground">CBOE Volatility Index</p>
        </div>
        <div className="rounded border border-border/50 bg-muted/20 px-3 py-2.5 space-y-0.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">VVIX</p>
          <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {data.vvix.toFixed(2)}
          </p>
          <p className="text-[9px] text-muted-foreground">Volatility of VIX</p>
        </div>
      </div>

      {/* Regime meter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Regime</p>
          <span className={cn("text-[10px] font-medium", cfg.colorClass)}>VIX {data.vix.toFixed(1)}</span>
        </div>
        <RegimeMeter vix={data.vix} />
        <p className="text-[10px] text-muted-foreground">{cfg.description}</p>
      </div>

      {/* 30-day VIX history */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">30-Day VIX History</p>
        <VixSparkline data={data.vixHistory} regimeColor={cfg.color} />
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>30d ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* VIX term structure */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">VIX Term Structure</p>
          <span className={cn("text-[10px] font-medium", isBackwardation ? "text-red-500" : "text-blue-500")}>
            {isBackwardation ? "Backwardation" : "Contango"}
          </span>
        </div>
        <TermStructureChart points={data.termStructure} />
        <p className="text-[9px] text-muted-foreground">
          {isBackwardation
            ? "Short-dated vol elevated vs long-dated — market pricing near-term stress."
            : "Long-dated vol above spot — normal market structure, calm near-term."}
        </p>
      </div>

      {/* IV percentiles */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">IV Percentile — Top Tickers</p>
        <div className="space-y-2">
          {data.ivPercentiles.map((item) => (
            <IVPercentileRow key={item.ticker} item={item} />
          ))}
        </div>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground pt-1">
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green-500/50" /> Low (&lt;40th)</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-yellow-500/50" /> Mid</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-red-500/50" /> High (&gt;80th)</span>
        </div>
      </div>
    </div>
  );
}
