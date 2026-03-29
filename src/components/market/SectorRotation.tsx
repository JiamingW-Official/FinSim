"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const GICS_SECTORS = [
  { id: "tech", name: "Technology", abbr: "Tech", seed: 2001, color: "#6366f1", tickers: ["AAPL", "MSFT", "NVDA", "AMD", "META"] },
  { id: "health", name: "Healthcare", abbr: "Health", seed: 2002, color: "#10b981", tickers: ["JNJ", "UNH", "PFE", "ABBV", "MRK"] },
  { id: "fin", name: "Financials", abbr: "Fin", seed: 2003, color: "#3b82f6", tickers: ["JPM", "BAC", "GS", "WFC", "MS"] },
  { id: "energy", name: "Energy", abbr: "Energy", seed: 2004, color: "#f59e0b", tickers: ["XOM", "CVX", "COP", "SLB", "EOG"] },
  { id: "ind", name: "Industrials", abbr: "Indus", seed: 2005, color: "#8b5cf6", tickers: ["CAT", "HON", "UPS", "GE", "RTX"] },
  { id: "disc", name: "Consumer Disc.", abbr: "Disc", seed: 2006, color: "#ec4899", tickers: ["AMZN", "TSLA", "HD", "NKE", "MCD"] },
  { id: "staples", name: "Consumer Staples", abbr: "Staples", seed: 2007, color: "#14b8a6", tickers: ["PG", "KO", "PEP", "WMT", "COST"] },
  { id: "util", name: "Utilities", abbr: "Utils", seed: 2008, color: "#64748b", tickers: ["NEE", "DUK", "SO", "D", "AEP"] },
  { id: "mat", name: "Materials", abbr: "Mats", seed: 2009, color: "#84cc16", tickers: ["LIN", "APD", "SHW", "FCX", "NEM"] },
  { id: "reit", name: "Real Estate", abbr: "REIT", seed: 2010, color: "#f97316", tickers: ["PLD", "AMT", "EQIX", "SPG", "PSA"] },
  { id: "comm", name: "Comm. Services", abbr: "Comm", seed: 2011, color: "#06b6d4", tickers: ["GOOG", "NFLX", "DIS", "T", "VZ"] },
] as const;

type SectorId = (typeof GICS_SECTORS)[number]["id"];

type CycleStage = "Early Cycle" | "Mid Cycle" | "Late Cycle" | "Recession";

interface SectorData {
  id: SectorId;
  name: string;
  abbr: string;
  color: string;
  tickers: readonly string[];
  seed: number;
  perf1W: number;
  perf1M: number;
  perf3M: number;
  perf6M: number;
  perf1Y: number;
  rsVsSpy: number;       // Relative Strength vs SPY
  rsMomentum: number;    // RS Momentum (rate of change of RS)
}

type SortCol = "name" | "perf1W" | "perf1M" | "perf3M" | "perf6M" | "perf1Y";

const CYCLE_OUTPERFORMERS: Record<CycleStage, { over: SectorId[]; under: SectorId[] }> = {
  "Early Cycle": {
    over: ["fin", "disc", "ind", "mat"],
    under: ["util", "staples", "health"],
  },
  "Mid Cycle": {
    over: ["tech", "ind", "energy", "comm"],
    under: ["util", "staples", "reit"],
  },
  "Late Cycle": {
    over: ["energy", "mat", "staples", "health"],
    under: ["tech", "disc", "fin"],
  },
  Recession: {
    over: ["util", "staples", "health", "reit"],
    under: ["energy", "fin", "disc", "ind"],
  },
};

const CYCLE_DESCRIPTION: Record<CycleStage, string> = {
  "Early Cycle": "Economic recovery phase — credit expanding, rates low, cyclical sectors lead",
  "Mid Cycle": "Sustained expansion — strong earnings, tech and growth outperform, broadening rally",
  "Late Cycle": "Slowing growth — inflation elevated, commodity plays and defensives favored",
  Recession: "Contraction — risk-off rotation, defensive sectors and bonds outperform",
};

const CYCLE_COLOR: Record<CycleStage, string> = {
  "Early Cycle": "text-emerald-500",
  "Mid Cycle": "text-primary",
  "Late Cycle": "text-amber-500",
  Recession: "text-red-500",
};

// ─── Data generation ──────────────────────────────────────────────────────────

function generateSectorData(): { sectors: SectorData[]; cycleStage: CycleStage } {
  const dailySeed = Math.floor(Date.now() / 86400000);

  const sectors: SectorData[] = GICS_SECTORS.map((s) => {
    const rand = seededRandom(s.seed + dailySeed);
    const perf1M = (rand() - 0.45) * 10; // -4.5% to +5.5%
    const perf1W = perf1M * 0.22 + (rand() - 0.5) * 3;
    const perf3M = perf1M * 2.8 + (rand() - 0.5) * 8;
    const perf6M = perf1M * 5.2 + (rand() - 0.5) * 12;
    const perf1Y = perf1M * 9.5 + (rand() - 0.5) * 20;
    const rsVsSpy = perf1M - 1.8; // vs SPY ~2% avg
    const rsMomentum = rsVsSpy * 0.6 + (rand() - 0.5) * 4;
    return {
      id: s.id,
      name: s.name,
      abbr: s.abbr,
      color: s.color,
      tickers: s.tickers,
      seed: s.seed,
      perf1W,
      perf1M,
      perf3M,
      perf6M,
      perf1Y,
      rsVsSpy,
      rsMomentum,
    };
  });

  // Determine cycle from macro signals
  const macroRand = seededRandom(dailySeed * 7 + 42);
  const stages: CycleStage[] = ["Early Cycle", "Mid Cycle", "Late Cycle", "Recession"];
  // Weight toward Mid Cycle for realism
  const weights = [0.2, 0.4, 0.3, 0.1];
  let r = macroRand();
  let cycleStage: CycleStage = "Mid Cycle";
  let cumulative = 0;
  for (let i = 0; i < stages.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) {
      cycleStage = stages[i];
      break;
    }
  }

  return { sectors, cycleStage };
}

// ─── Sector Rotation Wheel ────────────────────────────────────────────────────

function SectorWheel({
  sectors,
  cycleStage,
  selectedId,
  onSelect,
}: {
  sectors: SectorData[];
  cycleStage: CycleStage;
  selectedId: SectorId | null;
  onSelect: (id: SectorId) => void;
}) {
  const cx = 200;
  const cy = 200;
  const outerR = 170;
  const innerR = 95;
  const labelR = (outerR + innerR) / 2;
  const rsRingOuter = 88;
  const rsRingInner = 60;
  const n = sectors.length;
  const arcAngle = (2 * Math.PI) / n;

  function polarXY(r: number, angle: number) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function arcPath(r1: number, r2: number, startA: number, endA: number): string {
    const s1 = polarXY(r1, startA);
    const e1 = polarXY(r1, endA);
    const s2 = polarXY(r2, endA);
    const e2 = polarXY(r2, startA);
    const large = endA - startA > Math.PI ? 1 : 0;
    return [
      `M ${s1.x} ${s1.y}`,
      `A ${r1} ${r1} 0 ${large} 1 ${e1.x} ${e1.y}`,
      `L ${s2.x} ${s2.y}`,
      `A ${r2} ${r2} 0 ${large} 0 ${e2.x} ${e2.y}`,
      "Z",
    ].join(" ");
  }

  const maxAbs1M = Math.max(...sectors.map((s) => Math.abs(s.perf1M)), 0.01);

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-[400px] mx-auto">
      {sectors.map((sector, i) => {
        const startA = -Math.PI / 2 + i * arcAngle;
        const endA = startA + arcAngle - 0.02; // small gap
        const midA = startA + arcAngle / 2;
        const isPos = sector.perf1M >= 0;
        const intensity = Math.min(Math.abs(sector.perf1M) / maxAbs1M, 1);
        const baseFill = isPos
          ? `rgba(16,185,129,${0.12 + intensity * 0.55})`
          : `rgba(239,68,68,${0.12 + intensity * 0.55})`;
        const selectedFill = isPos ? "rgba(16,185,129,0.85)" : "rgba(239,68,68,0.85)";
        const isSelected = selectedId === sector.id;

        // RS inner ring: green if rs > 0
        const rsIsPos = sector.rsVsSpy >= 0;
        const rsIntensity = Math.min(Math.abs(sector.rsVsSpy) / 5, 1);
        const rsFill = rsIsPos
          ? `rgba(16,185,129,${0.2 + rsIntensity * 0.6})`
          : `rgba(239,68,68,${0.2 + rsIntensity * 0.6})`;

        // Label position
        const lx = cx + labelR * Math.cos(midA);
        const ly = cy + labelR * Math.sin(midA);

        return (
          <g
            key={sector.id}
            onClick={() => onSelect(sector.id)}
            style={{ cursor: "pointer" }}
          >
            {/* Outer performance arc */}
            <path
              d={arcPath(outerR, innerR, startA, endA)}
              fill={isSelected ? selectedFill : baseFill}
              stroke="hsl(var(--background))"
              strokeWidth={isSelected ? 2 : 1}
            />
            {/* RS inner ring arc */}
            <path
              d={arcPath(rsRingOuter, rsRingInner, startA, endA)}
              fill={rsFill}
              stroke="hsl(var(--background))"
              strokeWidth="0.5"
            />
            {/* Sector label */}
            <text
              x={lx}
              y={ly - 6}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8.5"
              fontWeight={isSelected ? "700" : "600"}
              fill={isSelected ? "white" : "hsl(var(--foreground))"}
            >
              {sector.abbr}
            </text>
            <text
              x={lx}
              y={ly + 7}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7.5"
              fill={isPos ? "rgb(16,185,129)" : "rgb(239,68,68)"}
              fontWeight="600"
            >
              {isPos ? "+" : ""}
              {sector.perf1M.toFixed(1)}%
            </text>
          </g>
        );
      })}

      {/* Center circle */}
      <circle cx={cx} cy={cy} r={rsRingInner - 2} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />

      {/* Center text: cycle stage */}
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))" fontWeight="500">
        Rotation Stage
      </text>
      {(() => {
        const words = cycleStage.split(" ");
        return words.map((word, i) => (
          <text
            key={i}
            x={cx}
            y={cy + 3 + i * 13}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="hsl(var(--foreground))"
          >
            {word}
          </text>
        ));
      })()}

      {/* Legend labels */}
      <text x={cx} y={cy - 42} textAnchor="middle" fontSize="6.5" fill="hsl(var(--muted-foreground))">
        RS vs SPY
      </text>
    </svg>
  );
}

// ─── RRG Chart ────────────────────────────────────────────────────────────────

function RRGChart({ sectors }: { sectors: SectorData[] }) {
  const dailySeed = Math.floor(Date.now() / 86400000);

  // Generate 4-week trail for each sector
  const sectorTrails = useMemo(() => {
    return sectors.map((sector) => {
      const rand = seededRandom(sector.seed + dailySeed * 13);
      // 4 historical points + current
      const trail: { rs: number; mom: number }[] = [];
      let rs = sector.rsVsSpy - (rand() - 0.5) * 4;
      let mom = sector.rsMomentum - (rand() - 0.5) * 3;
      for (let i = 0; i < 4; i++) {
        trail.push({ rs, mom });
        rs += (rand() - 0.5) * 1.5;
        mom += (rand() - 0.5) * 1.5;
      }
      trail.push({ rs: sector.rsVsSpy, mom: sector.rsMomentum });
      return { ...sector, trail };
    });
  }, [sectors, dailySeed]);

  const svgW = 480;
  const svgH = 380;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 40;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  // Scale: x = RS [-8, 8], y = Momentum [-8, 8]
  const xMin = -8;
  const xMax = 8;
  const yMin = -8;
  const yMax = 8;

  function toSvg(rs: number, mom: number) {
    const x = padL + ((rs - xMin) / (xMax - xMin)) * plotW;
    const y = padT + plotH - ((mom - yMin) / (yMax - yMin)) * plotH;
    return { x, y };
  }

  const origin = toSvg(0, 0);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Relative Rotation Graph (RRG)</h3>
        <span className="text-xs text-muted-foreground">4-week trail | vs SPY</span>
      </div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
        {/* Quadrant backgrounds */}
        {/* Leading: top-right (green) */}
        <rect x={origin.x} y={padT} width={svgW - padR - origin.x} height={origin.y - padT} fill="rgba(16,185,129,0.07)" />
        {/* Weakening: bottom-right (yellow) */}
        <rect x={origin.x} y={origin.y} width={svgW - padR - origin.x} height={padT + plotH - origin.y} fill="rgba(234,179,8,0.07)" />
        {/* Lagging: bottom-left (red) */}
        <rect x={padL} y={origin.y} width={origin.x - padL} height={padT + plotH - origin.y} fill="rgba(239,68,68,0.07)" />
        {/* Improving: top-left (blue) */}
        <rect x={padL} y={padT} width={origin.x - padL} height={origin.y - padT} fill="rgba(59,130,246,0.07)" />

        {/* Axes */}
        <line x1={padL} y1={origin.y} x2={svgW - padR} y2={origin.y} stroke="hsl(var(--border))" strokeWidth="1" />
        <line x1={origin.x} y1={padT} x2={origin.x} y2={padT + plotH} stroke="hsl(var(--border))" strokeWidth="1" />

        {/* Grid lines */}
        {[-4, 4].map((v) => {
          const pt = toSvg(v, v);
          return (
            <g key={v}>
              <line x1={pt.x} y1={padT} x2={pt.x} y2={padT + plotH} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3,3" />
              <line x1={padL} y1={pt.y} x2={svgW - padR} y2={pt.y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3,3" />
            </g>
          );
        })}

        {/* Quadrant labels */}
        <text x={svgW - padR - 6} y={padT + 14} textAnchor="end" fontSize="9" fontWeight="600" fill="rgb(16,185,129)" opacity="0.8">Leading</text>
        <text x={svgW - padR - 6} y={padT + plotH - 6} textAnchor="end" fontSize="9" fontWeight="600" fill="rgb(234,179,8)" opacity="0.8">Weakening</text>
        <text x={padL + 6} y={padT + plotH - 6} textAnchor="start" fontSize="9" fontWeight="600" fill="rgb(239,68,68)" opacity="0.8">Lagging</text>
        <text x={padL + 6} y={padT + 14} textAnchor="start" fontSize="9" fontWeight="600" fill="rgb(59,130,246)" opacity="0.8">Improving</text>

        {/* Axis labels */}
        <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">Relative Strength vs SPY →</text>
        <text x={10} y={svgH / 2} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))" transform={`rotate(-90, 10, ${svgH / 2})`}>RS Momentum →</text>

        {/* Sector trails + dots */}
        {sectorTrails.map((sector) => {
          const points = sector.trail.map((p) => toSvg(p.rs, p.mom));
          const current = points[points.length - 1];

          // Trail path
          const d = points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ");

          // Arrow direction (from penultimate to current)
          const prev = points[points.length - 2];
          const dx = current.x - prev.x;
          const dy = current.y - prev.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const arrowLen = 8;
          const ax = current.x - (dx / len) * arrowLen * 0.5;
          const ay = current.y - (dy / len) * arrowLen * 0.5;

          return (
            <g key={sector.id}>
              {/* Trail */}
              <path d={d} fill="none" stroke={sector.color} strokeWidth="1.2" strokeOpacity="0.45" strokeDasharray="2,2" />
              {/* Arrow */}
              <line
                x1={ax}
                y1={ay}
                x2={current.x}
                y2={current.y}
                stroke={sector.color}
                strokeWidth="1.5"
                markerEnd="none"
              />
              {/* Dot */}
              <circle cx={current.x} cy={current.y} r="7" fill={sector.color} fillOpacity="0.85" />
              {/* Label */}
              <text
                x={current.x}
                y={current.y + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="5.5"
                fontWeight="700"
                fill="white"
              >
                {sector.abbr.slice(0, 4)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Performance Table ────────────────────────────────────────────────────────

function PerformanceTable({ sectors }: { sectors: SectorData[] }) {
  const [sortCol, setSortCol] = useState<SortCol>("perf1M");
  const [sortAsc, setSortAsc] = useState(false);

  const cols: { id: SortCol; label: string }[] = [
    { id: "name", label: "Sector" },
    { id: "perf1W", label: "1W" },
    { id: "perf1M", label: "1M" },
    { id: "perf3M", label: "3M" },
    { id: "perf6M", label: "6M" },
    { id: "perf1Y", label: "1Y" },
  ];

  const sorted = useMemo(() => {
    return [...sectors].sort((a, b) => {
      const av = sortCol === "name" ? a.name : a[sortCol];
      const bv = sortCol === "name" ? b.name : b[sortCol];
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [sectors, sortCol, sortAsc]);

  const perfCols: (keyof SectorData)[] = ["perf1W", "perf1M", "perf3M", "perf6M", "perf1Y"];

  // Best/worst per column
  const bestWorst = useMemo(() => {
    const result: Record<string, { best: number; worst: number }> = {};
    for (const col of perfCols) {
      const vals = sectors.map((s) => s[col] as number);
      result[col] = { best: Math.max(...vals), worst: Math.min(...vals) };
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectors]);

  function cellStyle(val: number, col: keyof SectorData): string {
    const bw = bestWorst[col as string];
    if (!bw) return "";
    if (val === bw.best) return "bg-emerald-500/20 text-emerald-400 font-bold";
    if (val === bw.worst) return "bg-red-500/20 text-red-400 font-bold";
    const maxAbs = Math.max(Math.abs(bw.best), Math.abs(bw.worst), 0.01);
    const intensity = Math.min(Math.abs(val) / maxAbs, 1);
    if (val >= 0) return `text-emerald-500`;
    return `text-red-500`;
    // intensity is available if we ever want to add background opacity
    void intensity;
  }

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortAsc((p) => !p);
    else { setSortCol(col); setSortAsc(false); }
  }

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Sector Performance Matrix</h3>
        <span className="text-xs text-muted-foreground">Click column to sort | Green/Red = best/worst</span>
      </div>
      <table className="w-full text-xs min-w-[500px]">
        <thead>
          <tr className="border-b border-border/40 text-xs text-muted-foreground">
            {cols.map((col) => (
              <th
                key={col.id}
                onClick={() => handleSort(col.id)}
                className={cn(
                  "py-2 px-3 font-medium cursor-pointer hover:text-foreground select-none transition-colors",
                  col.id === "name" ? "text-left" : "text-right",
                  sortCol === col.id && "text-foreground",
                )}
              >
                {col.label}
                {sortCol === col.id && (sortAsc ? " ↑" : " ↓")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((sector) => (
            <tr key={sector.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
              <td className="py-2 px-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: sector.color }}
                  />
                  <span className="font-medium">{sector.name}</span>
                </div>
              </td>
              {perfCols.map((col) => {
                const val = sector[col] as number;
                return (
                  <td
                    key={col as string}
                    className={cn(
                      "py-2 px-3 text-right font-mono tabular-nums",
                      cellStyle(val, col),
                    )}
                  >
                    {val >= 0 ? "+" : ""}
                    {val.toFixed(2)}%
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

// ─── Economic Cycle Panel ─────────────────────────────────────────────────────

function EconomicCyclePanel({
  cycleStage,
  sectors,
}: {
  cycleStage: CycleStage;
  sectors: SectorData[];
}) {
  const stages: CycleStage[] = ["Early Cycle", "Mid Cycle", "Late Cycle", "Recession"];
  const currentIdx = stages.indexOf(cycleStage);

  const { over, under } = CYCLE_OUTPERFORMERS[cycleStage];

  function getSector(id: SectorId) {
    return sectors.find((s) => s.id === id)!;
  }

  // Synthetic macro signals for display
  const dailySeed = Math.floor(Date.now() / 86400000);
  const macroRand = seededRandom(dailySeed * 11 + 77);

  const macroSignals = [
    { label: "ISM Manufacturing PMI", value: cycleStage === "Recession" ? 44 + macroRand() * 5 : cycleStage === "Late Cycle" ? 48 + macroRand() * 4 : 52 + macroRand() * 6, threshold: 50, higherBetter: true },
    { label: "Yield Curve (10Y–2Y)", value: cycleStage === "Recession" ? -(macroRand() * 0.8) : cycleStage === "Late Cycle" ? -(macroRand() * 0.3) : macroRand() * 1.2, threshold: 0, higherBetter: true, suffix: "%" },
    { label: "Initial Jobless Claims", value: cycleStage === "Recession" ? 300 + macroRand() * 100 : cycleStage === "Late Cycle" ? 220 + macroRand() * 40 : 200 + macroRand() * 20, threshold: 250, higherBetter: false, suffix: "K" },
    { label: "CPI YoY Inflation", value: cycleStage === "Recession" ? 1.5 + macroRand() * 1.5 : cycleStage === "Early Cycle" ? 2 + macroRand() * 1.5 : cycleStage === "Mid Cycle" ? 3 + macroRand() * 1.5 : 4 + macroRand() * 2, threshold: 3, higherBetter: false, suffix: "%" },
    { label: "Credit Spreads (HY–IG)", value: cycleStage === "Recession" ? 4 + macroRand() * 3 : cycleStage === "Late Cycle" ? 2.5 + macroRand() * 1.5 : 1.5 + macroRand() * 1, threshold: 3, higherBetter: false, suffix: "%" },
  ];

  return (
    <div className="space-y-4">
      {/* Cycle stage indicator */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-semibold">Economic Cycle Stage</h3>

        {/* Stage timeline */}
        <div className="flex items-center gap-0">
          {stages.map((stage, i) => {
            const isActive = i === currentIdx;
            const isPast = i < currentIdx;
            return (
              <div key={stage} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all",
                      isActive
                        ? "border-primary bg-primary scale-125"
                        : isPast
                          ? "border-primary/40 bg-primary/40"
                          : "border-border bg-background",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[11px] mt-1 text-center leading-tight font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {stage.replace(" Cycle", "").replace("Recession", "Recession")}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 -mt-4",
                      i < currentIdx ? "bg-primary/40" : "bg-border",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Current stage details */}
        <div className="rounded-md bg-muted/40 p-3 space-y-1">
          <p className={cn("text-sm font-bold", CYCLE_COLOR[cycleStage])}>{cycleStage}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {CYCLE_DESCRIPTION[cycleStage]}
          </p>
        </div>

        {/* Macro signals */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Macro Signals</p>
          {macroSignals.map((signal) => {
            const isGood = signal.higherBetter
              ? signal.value > signal.threshold
              : signal.value < signal.threshold;
            return (
              <div key={signal.label} className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{signal.label}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isGood ? "bg-emerald-500" : "bg-red-500",
                    )}
                  />
                  <span className={cn("font-mono tabular-nums text-[11px] font-semibold", isGood ? "text-emerald-500" : "text-red-500")}>
                    {signal.value.toFixed(signal.suffix === "K" ? 0 : 1)}
                    {signal.suffix ?? ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sector positioning */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold">Cycle Positioning</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-500">Overweight</p>
            {over.map((id) => {
              const s = getSector(id);
              return (
                <div key={id} className="flex items-center justify-between rounded-md bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-[11px] font-medium">{s.name}</span>
                  </div>
                  <span className={cn("text-xs font-mono font-semibold", s.perf1M >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {s.perf1M >= 0 ? "+" : ""}{s.perf1M.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-red-500">Underweight</p>
            {under.map((id) => {
              const s = getSector(id);
              return (
                <div key={id} className="flex items-center justify-between rounded-md bg-red-500/5 border border-red-500/20 px-2.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-[11px] font-medium">{s.name}</span>
                  </div>
                  <span className={cn("text-xs font-mono font-semibold", s.perf1M >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {s.perf1M >= 0 ? "+" : ""}{s.perf1M.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sector Detail Panel ──────────────────────────────────────────────────────

function SectorDetailPanel({ sector, onClose }: { sector: SectorData; onClose: () => void }) {
  const dailySeed = Math.floor(Date.now() / 86400000);

  // Generate ticker data for this sector
  const tickerData = useMemo(() => {
    return sector.tickers.map((ticker, i) => {
      const rand = seededRandom(sector.seed * 100 + i * 37 + dailySeed);
      const perf1M = sector.perf1M + (rand() - 0.5) * 8;
      const price = 50 + rand() * 400;
      return { ticker, perf1M, price };
    });
  }, [sector, dailySeed]);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
          <h3 className="text-sm font-semibold">{sector.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-xs px-2 py-1 rounded hover:bg-muted/50 transition-colors"
        >
          ✕ Close
        </button>
      </div>

      {/* Perf summary */}
      <div className="grid grid-cols-5 gap-2">
        {(["perf1W", "perf1M", "perf3M", "perf6M", "perf1Y"] as const).map((col, i) => {
          const labels = ["1W", "1M", "3M", "6M", "1Y"];
          const val = sector[col];
          return (
            <div key={col} className="text-center rounded-md bg-muted/30 p-2">
              <p className="text-[11px] text-muted-foreground">{labels[i]}</p>
              <p className={cn("text-[11px] font-mono font-semibold mt-0.5", val >= 0 ? "text-emerald-500" : "text-red-500")}>
                {val >= 0 ? "+" : ""}{val.toFixed(1)}%
              </p>
            </div>
          );
        })}
      </div>

      {/* Top tickers */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground font-semibold">Top Holdings</p>
        {tickerData.map(({ ticker, perf1M, price }) => (
          <div key={ticker} className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold">{ticker}</span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground font-mono">${price.toFixed(2)}</span>
              <span className={cn("text-[11px] font-mono font-semibold w-14 text-right", perf1M >= 0 ? "text-emerald-500" : "text-red-500")}>
                {perf1M >= 0 ? "+" : ""}{perf1M.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SectorRotation() {
  const { sectors, cycleStage } = useMemo(() => generateSectorData(), []);
  const [selectedId, setSelectedId] = useState<SectorId | null>(null);
  const [subTab, setSubTab] = useState<"wheel" | "rrg" | "table" | "cycle">("wheel");

  const selectedSector = selectedId ? sectors.find((s) => s.id === selectedId) ?? null : null;

  const subTabs: { id: typeof subTab; label: string }[] = [
    { id: "wheel", label: "Rotation Wheel" },
    { id: "rrg", label: "RRG Chart" },
    { id: "table", label: "Performance Matrix" },
    { id: "cycle", label: "Economic Cycle" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Sector Rotation Analysis</h2>
          <p className="text-[11px] text-muted-foreground">GICS sectors vs SPY benchmark | Current stage: <span className={cn("font-semibold", CYCLE_COLOR[cycleStage])}>{cycleStage}</span></p>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="flex items-center gap-0 border-b border-border/40 overflow-x-auto shrink-0">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={cn(
              "relative px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors shrink-0",
              subTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {subTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Wheel tab */}
      {subTab === "wheel" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            {/* Legend */}
            <div className="rounded-lg border bg-card p-3 space-y-3 mb-4">
              <h3 className="text-xs font-semibold">Legend</h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-3 rounded-sm" style={{ background: "rgba(16,185,129,0.5)" }} />
                  <span className="text-[11px] text-muted-foreground">Outer ring: 1M performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-3 rounded-sm" style={{ background: "rgba(59,130,246,0.5)" }} />
                  <span className="text-[11px] text-muted-foreground">Inner ring: RS vs SPY</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Click any sector to expand details</p>
            </div>

            {/* Sector list */}
            <div className="rounded-lg border bg-card overflow-hidden">
              {sectors.map((s) => {
                const isOver = CYCLE_OUTPERFORMERS[cycleStage].over.includes(s.id);
                const isUnder = CYCLE_OUTPERFORMERS[cycleStage].under.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-left border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors",
                      selectedId === s.id && "bg-muted/50",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-[11px] font-medium">{s.name}</span>
                      {isOver && <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">OW</span>}
                      {isUnder && <span className="text-[8px] font-bold text-red-500 bg-red-500/10 px-1 py-0.5 rounded">UW</span>}
                    </div>
                    <span className={cn("text-[11px] font-mono font-semibold", s.perf1M >= 0 ? "text-emerald-500" : "text-red-500")}>
                      {s.perf1M >= 0 ? "+" : ""}{s.perf1M.toFixed(2)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <SectorWheel
                sectors={sectors}
                cycleStage={cycleStage}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
              />
            </div>

            {selectedSector && (
              <SectorDetailPanel
                sector={selectedSector}
                onClose={() => setSelectedId(null)}
              />
            )}
          </div>
        </div>
      )}

      {/* RRG tab */}
      {subTab === "rrg" && (
        <div className="space-y-4">
          <RRGChart sectors={sectors} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["Leading", "Weakening", "Lagging", "Improving"] as const).map((q) => {
              const colors: Record<string, string> = {
                Leading: "border-emerald-500/30 bg-emerald-500/5 text-emerald-500",
                Weakening: "border-amber-500/30 bg-amber-500/5 text-amber-500",
                Lagging: "border-red-500/30 bg-red-500/5 text-red-500",
                Improving: "border-border bg-primary/5 text-primary",
              };
              const descs: Record<string, string> = {
                Leading: "High RS + Rising momentum — top picks",
                Weakening: "High RS + Falling momentum — rotate out",
                Lagging: "Low RS + Falling momentum — avoid",
                Improving: "Low RS + Rising momentum — early entry",
              };
              return (
                <div key={q} className={cn("rounded-lg border p-3 space-y-1", colors[q])}>
                  <p className="text-[11px] font-bold">{q}</p>
                  <p className="text-xs opacity-80 leading-relaxed">{descs[q]}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table tab */}
      {subTab === "table" && <PerformanceTable sectors={sectors} />}

      {/* Cycle tab */}
      {subTab === "cycle" && (
        <EconomicCyclePanel cycleStage={cycleStage} sectors={sectors} />
      )}
    </div>
  );
}
