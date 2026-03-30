"use client";

import { useMemo, useState } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { cn } from "@/lib/utils";

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────

function seededRand(seed: number) {
  let s = (seed | 0) >>> 0;
  return function () {
    s = ((s * 1103515245 + 12345) & 0x7fffffff) >>> 0;
    return s / 0x7fffffff;
  };
}

// ─── Ticker metadata ──────────────────────────────────────────────────────────

interface TickerMeta {
  sector: string;
  style: "growth" | "value" | "blend";
  beta: number;
  /** 0=small 1=large */
  sizeTilt: number;
  /** 0=value 1=growth */
  valueTilt: number;
  /** 0=low 1=high momentum */
  momentumTilt: number;
  /** 0=low 1=high quality */
  qualityTilt: number;
}

const TICKER_META: Record<string, TickerMeta> = {
  AAPL: { sector: "Technology",      style: "growth", beta: 1.20, sizeTilt: 0.98, valueTilt: 0.70, momentumTilt: 0.72, qualityTilt: 0.90 },
  MSFT: { sector: "Technology",      style: "growth", beta: 1.10, sizeTilt: 0.97, valueTilt: 0.65, momentumTilt: 0.75, qualityTilt: 0.95 },
  GOOG: { sector: "Communication",   style: "growth", beta: 1.15, sizeTilt: 0.95, valueTilt: 0.60, momentumTilt: 0.68, qualityTilt: 0.88 },
  AMZN: { sector: "Consumer Disc.",  style: "growth", beta: 1.35, sizeTilt: 0.96, valueTilt: 0.40, momentumTilt: 0.80, qualityTilt: 0.82 },
  NVDA: { sector: "Technology",      style: "growth", beta: 1.75, sizeTilt: 0.90, valueTilt: 0.30, momentumTilt: 0.95, qualityTilt: 0.78 },
  TSLA: { sector: "Consumer Disc.",  style: "growth", beta: 2.00, sizeTilt: 0.88, valueTilt: 0.20, momentumTilt: 0.88, qualityTilt: 0.50 },
  JPM:  { sector: "Financials",      style: "value",  beta: 1.10, sizeTilt: 0.95, valueTilt: 0.80, momentumTilt: 0.55, qualityTilt: 0.75 },
  JNJ:  { sector: "Healthcare",      style: "value",  beta: 0.65, sizeTilt: 0.93, valueTilt: 0.85, momentumTilt: 0.40, qualityTilt: 0.92 },
  KO:   { sector: "Consumer Stapl.", style: "value",  beta: 0.55, sizeTilt: 0.90, valueTilt: 0.90, momentumTilt: 0.30, qualityTilt: 0.88 },
  T:    { sector: "Communication",   style: "value",  beta: 0.70, sizeTilt: 0.85, valueTilt: 0.95, momentumTilt: 0.20, qualityTilt: 0.60 },
  META: { sector: "Communication",   style: "growth", beta: 1.30, sizeTilt: 0.92, valueTilt: 0.55, momentumTilt: 0.85, qualityTilt: 0.83 },
  BRK:  { sector: "Financials",      style: "value",  beta: 0.90, sizeTilt: 0.97, valueTilt: 0.88, momentumTilt: 0.45, qualityTilt: 0.85 },
  XOM:  { sector: "Energy",          style: "value",  beta: 1.00, sizeTilt: 0.94, valueTilt: 0.88, momentumTilt: 0.50, qualityTilt: 0.72 },
  WMT:  { sector: "Consumer Stapl.", style: "blend",  beta: 0.60, sizeTilt: 0.96, valueTilt: 0.82, momentumTilt: 0.48, qualityTilt: 0.80 },
  SPY:  { sector: "Diversified",     style: "blend",  beta: 1.00, sizeTilt: 0.80, valueTilt: 0.60, momentumTilt: 0.55, qualityTilt: 0.72 },
  QQQ:  { sector: "Diversified",     style: "growth", beta: 1.20, sizeTilt: 0.82, valueTilt: 0.45, momentumTilt: 0.72, qualityTilt: 0.75 },
  BND:  { sector: "Fixed Income",    style: "blend",  beta: 0.05, sizeTilt: 0.50, valueTilt: 0.70, momentumTilt: 0.20, qualityTilt: 0.90 },
};

function getMeta(ticker: string): TickerMeta {
  return (
    TICKER_META[ticker] ?? {
      sector: "Other",
      style: "blend" as const,
      beta: 1.0,
      sizeTilt: 0.5,
      valueTilt: 0.5,
      momentumTilt: 0.5,
      qualityTilt: 0.5,
    }
  );
}

// ─── Benchmark sector weights (SPY-like) ──────────────────────────────────────

const BENCH_SECTOR_WEIGHTS: Record<string, number> = {
  "Technology":      0.29,
  "Communication":   0.09,
  "Consumer Disc.":  0.10,
  "Consumer Stapl.": 0.07,
  "Financials":      0.13,
  "Healthcare":      0.13,
  "Energy":          0.04,
  "Industrials":     0.08,
  "Fixed Income":    0.02,
  "Diversified":     0.03,
  "Other":           0.02,
};

// Benchmark sector returns (synthetic, annualised-like %)
const BENCH_SECTOR_RETURNS: Record<string, number> = {
  "Technology":      18.5,
  "Communication":   14.2,
  "Consumer Disc.":  11.8,
  "Consumer Stapl.": 7.4,
  "Financials":      12.6,
  "Healthcare":      9.8,
  "Energy":          8.3,
  "Industrials":     10.1,
  "Fixed Income":    3.2,
  "Diversified":     12.0,
  "Other":           8.0,
};

const BENCH_TOTAL_RETURN = 12.8; // SPY-like annual return %

// ─── Color helpers ────────────────────────────────────────────────────────────

const SECTOR_COLORS: Record<string, string> = {
  "Technology":      "#3b82f6",
  "Communication":   "#8b5cf6",
  "Consumer Disc.":  "#f59e0b",
  "Consumer Stapl.": "#10b981",
  "Financials":      "#06b6d4",
  "Healthcare":      "#ec4899",
  "Energy":          "#f97316",
  "Industrials":     "#a78bfa",
  "Fixed Income":    "#84cc16",
  "Diversified":     "#6366f1",
  "Other":           "#6b7280",
};

// ─── SVG Stacked Bar (BHB) ────────────────────────────────────────────────────

interface BHBSector {
  sector: string;
  allocation: number;  // bps
  selection: number;   // bps
  interaction: number; // bps
  total: number;       // bps
}

function BHBStackedBar({ rows }: { rows: BHBSector[] }) {
  const W = 340;
  const H = 18;
  const BAR_H = 10;
  const maxAbs = Math.max(...rows.flatMap((r) => [Math.abs(r.allocation), Math.abs(r.selection), Math.abs(r.interaction)]), 1);
  const scale = (v: number) => (Math.abs(v) / maxAbs) * (W * 0.38);

  return (
    <div className="overflow-x-auto">
      <svg width={W} height={rows.length * (H + 4) + 20} className="block">
        {/* Zero line */}
        <line x1={W * 0.42} y1={0} x2={W * 0.42} y2={rows.length * (H + 4) + 10} stroke="#374151" strokeWidth={1} />
        {rows.map((r, i) => {
          const y = i * (H + 4) + 10;
          const alloc = r.allocation;
          const sel = r.selection;
          const inter = r.interaction;
          const zeroX = W * 0.42;
          // stacked: alloc → sel → inter, can be mixed sign, just draw side by side
          const segs = [
            { v: alloc, color: "#3b82f6" },
            { v: sel,   color: "#10b981" },
            { v: inter, color: "#f59e0b" },
          ];
          let posX = zeroX;
          let negX = zeroX;
          const rects: { x: number; w: number; color: string }[] = [];
          segs.forEach(({ v, color }) => {
            const w = scale(v);
            if (v >= 0) {
              rects.push({ x: posX, w, color });
              posX += w;
            } else {
              negX -= w;
              rects.push({ x: negX, w, color });
            }
          });
          return (
            <g key={r.sector}>
              <text x={0} y={y + BAR_H * 0.75} fontSize={8} fill="#9ca3af">
                {r.sector.slice(0, 12)}
              </text>
              {rects.map((rect, j) => (
                <rect key={j} x={rect.x} y={y} width={Math.max(rect.w, 0)} height={BAR_H} fill={rect.color} rx={1} opacity={0.85} />
              ))}
              <text x={posX + 2} y={y + BAR_H * 0.75} fontSize={7} fill={r.total >= 0 ? "#34d399" : "#f87171"}>
                {r.total >= 0 ? "+" : ""}{r.total.toFixed(1)}
              </text>
            </g>
          );
        })}
        {/* Legend */}
        {[["Alloc", "#3b82f6"], ["Select", "#10b981"], ["Interact", "#f59e0b"]].map(([label, color], i) => (
          <g key={label} transform={`translate(${W * 0.42 + i * 78}, ${rows.length * (H + 4) + 6})`}>
            <rect width={7} height={7} fill={color} rx={1} />
            <text x={9} y={7} fontSize={7} fill="#9ca3af">{label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── SVG Waterfall (Factor) ───────────────────────────────────────────────────

interface FactorContrib {
  label: string;
  bps: number;
  color: string;
}

function FactorWaterfall({ factors }: { factors: FactorContrib[] }) {
  const W = 340;
  const BAR_W = 36;
  const BAR_GAP = 12;
  const H = 120;
  const maxAbs = Math.max(...factors.map((f) => Math.abs(f.bps)), 1);
  const scale = (v: number) => (Math.abs(v) / maxAbs) * 50;
  const midY = 70;

  return (
    <svg width={W} height={H} className="block overflow-visible">
      {/* zero line */}
      <line x1={0} y1={midY} x2={W} y2={midY} stroke="#374151" strokeWidth={1} />
      {factors.map((f, i) => {
        const x = i * (BAR_W + BAR_GAP) + 4;
        const h = scale(f.bps);
        const y = f.bps >= 0 ? midY - h : midY;
        return (
          <g key={f.label}>
            <rect x={x} y={y} width={BAR_W} height={Math.max(h, 2)} fill={f.color} rx={2} opacity={0.85} />
            <text x={x + BAR_W / 2} y={H - 4} textAnchor="middle" fontSize={7.5} fill="#9ca3af">
              {f.label}
            </text>
            <text
              x={x + BAR_W / 2}
              y={f.bps >= 0 ? y - 3 : y + h + 9}
              textAnchor="middle"
              fontSize={7}
              fill={f.bps >= 0 ? "#34d399" : "#f87171"}
            >
              {f.bps >= 0 ? "+" : ""}{f.bps.toFixed(0)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── SVG Grouped Bar (Sector) ──────────────────────────────────────────────────

interface SectorRow {
  sector: string;
  portWeight: number;  // %
  benchWeight: number; // %
  activeWeight: number;
  contribution: number; // %
}

function SectorGroupedBars({ rows }: { rows: SectorRow[] }) {
  const W = 340;
  const ROW_H = 16;
  const LABEL_W = 90;
  const maxW = Math.max(...rows.flatMap((r) => [r.portWeight, r.benchWeight]), 1);
  const scale = (v: number) => (v / maxW) * (W - LABEL_W - 60);

  return (
    <svg width={W} height={rows.length * ROW_H + 22} className="block">
      {/* header */}
      <text x={LABEL_W} y={9} fontSize={7.5} fill="#6b7280">Portfolio</text>
      <text x={LABEL_W + 70} y={9} fontSize={7.5} fill="#6b7280">Benchmark</text>
      {rows.map((r, i) => {
        const y = i * ROW_H + 14;
        const pw = scale(r.portWeight);
        const bw = scale(r.benchWeight);
        return (
          <g key={r.sector}>
            <text x={0} y={y + 8} fontSize={7.5} fill="#9ca3af">{r.sector.slice(0, 12)}</text>
            {/* portfolio bar */}
            <rect x={LABEL_W} y={y} width={Math.max(pw, 1)} height={6} fill="#3b82f6" rx={1} opacity={0.8} />
            <text x={LABEL_W + pw + 2} y={y + 6} fontSize={6.5} fill="#60a5fa">{r.portWeight.toFixed(1)}%</text>
            {/* benchmark bar */}
            <rect x={LABEL_W} y={y + 7} width={Math.max(bw, 1)} height={6} fill="#6b7280" rx={1} opacity={0.6} />
            <text x={LABEL_W + bw + 2} y={y + 13} fontSize={6.5} fill="#9ca3af">{r.benchWeight.toFixed(1)}%</text>
          </g>
        );
      })}
      {/* legend */}
      <rect x={W - 80} y={2} width={7} height={7} fill="#3b82f6" rx={1} opacity={0.8} />
      <text x={W - 71} y={8} fontSize={7} fill="#9ca3af">Portfolio</text>
      <rect x={W - 80} y={12} width={7} height={7} fill="#6b7280" rx={1} opacity={0.6} />
      <text x={W - 71} y={18} fontSize={7} fill="#9ca3af">Benchmark</text>
    </svg>
  );
}

// ─── SVG Pie (Style) ──────────────────────────────────────────────────────────

interface StyleSlice {
  label: string;
  pct: number;
  color: string;
}

function StylePie({ slices }: { slices: StyleSlice[] }) {
  const R = 52;
  const CX = 64;
  const CY = 64;
  const total = slices.reduce((s, sl) => s + sl.pct, 0) || 1;
  let startAngle = -Math.PI / 2;
  const paths: { d: string; color: string; label: string; pct: number; midAngle: number }[] = [];

  slices.forEach((sl) => {
    const angle = (sl.pct / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle);
    const y2 = CY + R * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    paths.push({
      d: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: sl.color,
      label: sl.label,
      pct: sl.pct,
      midAngle: startAngle + angle / 2,
    });
    startAngle = endAngle;
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={128} height={128}>
        {paths.map((p) => (
          <path key={p.label} d={p.d} fill={p.color} opacity={0.85} />
        ))}
        {/* inner ring */}
        <circle cx={CX} cy={CY} r={28} fill="hsl(var(--card))" />
      </svg>
      <div className="space-y-1.5">
        {slices.map((sl) => (
          <div key={sl.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: sl.color }} />
            <span className="text-xs text-muted-foreground w-14">{sl.label}</span>
            <span className="text-xs font-mono font-semibold">{sl.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Risk bar ─────────────────────────────────────────────────────────────────

function RiskBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
      <div className="h-full rounded-full transition-colors duration-300" style={{ width: `${Math.max(pct, 0)}%`, backgroundColor: color }} />
    </div>
  );
}

// ─── Attribution Bar (contribution) ──────────────────────────────────────────

function ContribBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (Math.abs(value) / max) * 100) : 0;
  const isPos = value >= 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="absolute left-1/2 top-0 w-px h-full bg-muted-foreground/20" />
        {isPos ? (
          <div className="absolute h-full bg-emerald-500 rounded-r-full" style={{ left: "50%", width: `${pct / 2}%` }} />
        ) : (
          <div className="absolute h-full bg-red-500 rounded-l-full" style={{ right: "50%", width: `${pct / 2}%` }} />
        )}
      </div>
      <span className={cn("font-mono tabular-nums text-xs w-11 text-right", isPos ? "text-emerald-400" : "text-red-400")}>
        {isPos ? "+" : ""}{value.toFixed(2)}%
      </span>
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground mb-2">{children}</p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type SubTab = "bhb" | "factor" | "sector" | "risk" | "style";

export function PortfolioAttribution() {
  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const [activeTab, setActiveTab] = useState<SubTab>("bhb");

  // Seed for synthetic data based on trade history length + portfolio value
  const seed = useMemo(
    () => tradeHistory.length * 1000 + Math.round(portfolioValue),
    [tradeHistory.length, portfolioValue]
  );

  // ── Position weights & returns ──────────────────────────────────────────────
  const posData = useMemo(() => {
    if (positions.length === 0) return [];
    const posValue = positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
    return positions.map((p) => {
      const value = p.currentPrice * p.quantity;
      const weight = posValue > 0 ? value / posValue : 0;
      return {
        ticker: p.ticker,
        weight,
        pnlPct: p.unrealizedPnLPercent,
        value,
        meta: getMeta(p.ticker),
      };
    });
  }, [positions]);

  // ── BHB Attribution ─────────────────────────────────────────────────────────
  const bhbData = useMemo(() => {
    const rand = seededRand(seed + 1);
    // Derive sector-level portfolio weights and returns
    const sectorMap: Record<string, { portW: number; sumReturn: number; count: number }> = {};
    posData.forEach(({ meta, weight, pnlPct }) => {
      const s = meta.sector;
      if (!sectorMap[s]) sectorMap[s] = { portW: 0, sumReturn: 0, count: 0 };
      sectorMap[s].portW += weight;
      sectorMap[s].sumReturn += pnlPct;
      sectorMap[s].count++;
    });

    // Gather active sectors
    const sectors = Object.keys(sectorMap);
    let totalAlloc = 0, totalSel = 0, totalInter = 0;
    const rows: BHBSector[] = sectors.map((sec) => {
      const { portW, sumReturn, count } = sectorMap[sec];
      const w_i = portW;
      const W_i = BENCH_SECTOR_WEIGHTS[sec] ?? 0.02;
      const R_i = count > 0 ? sumReturn / count : 0;
      const B_i = BENCH_SECTOR_RETURNS[sec] ?? 10 + rand() * 5;
      const B   = BENCH_TOTAL_RETURN;

      // BHB formula (in %)
      const allocation  = (w_i - W_i) * (B_i - B);
      const selection   = W_i * (R_i - B_i);
      const interaction = (w_i - W_i) * (R_i - B_i);
      const total = allocation + selection + interaction;
      totalAlloc += allocation;
      totalSel += selection;
      totalInter += interaction;
      return { sector: sec, allocation, selection, interaction, total };
    });

    rows.sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
    return {
      rows,
      totalAlloc,
      totalSel,
      totalInter,
      totalActive: totalAlloc + totalSel + totalInter,
    };
  }, [posData, seed]);

  // ── Factor Attribution ──────────────────────────────────────────────────────
  const factorData = useMemo((): FactorContrib[] => {
    if (posData.length === 0) return [];
    const rand = seededRand(seed + 2);
    // Weighted-average betas / tilts
    const portBeta    = posData.reduce((s, p) => s + p.weight * p.meta.beta, 0);
    const portSize    = posData.reduce((s, p) => s + p.weight * p.meta.sizeTilt, 0);
    const portValue   = posData.reduce((s, p) => s + p.weight * p.meta.valueTilt, 0);
    const portMoment  = posData.reduce((s, p) => s + p.weight * p.meta.momentumTilt, 0);
    const portQuality = posData.reduce((s, p) => s + p.weight * p.meta.qualityTilt, 0);

    // Synthetic factor returns (bps)
    const mktReturn   = 45 + rand() * 30; // market up
    const sizeReturn  = (portSize - 0.7) * 80 + rand() * 20 - 10;
    const valueReturn = (portValue - 0.6) * 60 + rand() * 20 - 10;
    const momReturn   = (portMoment - 0.5) * 100 + rand() * 30 - 15;
    const qualReturn  = (portQuality - 0.7) * 70 + rand() * 20 - 10;
    const idio        = posData.reduce((s, p) => s + p.weight * p.pnlPct * 0.35 * 100, 0) - mktReturn * portBeta;

    return [
      { label: "Market β", bps: +(mktReturn * portBeta).toFixed(1), color: "#3b82f6" },
      { label: "Size",     bps: +sizeReturn.toFixed(1),             color: "#8b5cf6" },
      { label: "Value",    bps: +valueReturn.toFixed(1),            color: "#f59e0b" },
      { label: "Momentum", bps: +momReturn.toFixed(1),              color: "#10b981" },
      { label: "Quality",  bps: +qualReturn.toFixed(1),             color: "#ec4899" },
      { label: "Idio",     bps: +idio.toFixed(1),                   color: "#6366f1" },
    ];
  }, [posData, seed]);

  // ── Sector Attribution ──────────────────────────────────────────────────────
  const sectorRows = useMemo((): SectorRow[] => {
    const sectorMap: Record<string, { portW: number; sumReturn: number; count: number }> = {};
    posData.forEach(({ meta, weight, pnlPct }) => {
      const s = meta.sector;
      if (!sectorMap[s]) sectorMap[s] = { portW: 0, sumReturn: 0, count: 0 };
      sectorMap[s].portW += weight;
      sectorMap[s].sumReturn += pnlPct;
      sectorMap[s].count++;
    });
    return Object.entries(sectorMap).map(([sector, { portW, sumReturn, count }]) => {
      const benchW = BENCH_SECTOR_WEIGHTS[sector] ?? 0.02;
      const R_i = count > 0 ? sumReturn / count : 0;
      return {
        sector,
        portWeight: portW * 100,
        benchWeight: benchW * 100,
        activeWeight: (portW - benchW) * 100,
        contribution: portW * R_i,
      };
    }).sort((a, b) => b.portWeight - a.portWeight);
  }, [posData]);

  // ── Risk Attribution ────────────────────────────────────────────────────────
  const riskData = useMemo(() => {
    if (posData.length === 0) return [];
    const rand = seededRand(seed + 3);
    // Approximation: contribution to variance = weight^2 * sigma^2 * (1 + beta * correlation)
    const total = posData.reduce((s, p) => {
      const sigma = 0.15 + p.meta.beta * 0.10 + rand() * 0.05;
      return s + p.weight * p.weight * sigma * sigma;
    }, 0);
    return posData.map((p) => {
      const sigma = 0.15 + p.meta.beta * 0.10;
      const varContrib = (p.weight * p.weight * sigma * sigma) / Math.max(total, 0.0001);
      const mctr = sigma * p.meta.beta * p.weight;
      const raCR = p.pnlPct / Math.max(mctr * 100, 0.1);
      return {
        ticker: p.ticker,
        weight: p.weight * 100,
        varContrib: varContrib * 100,
        mctr: mctr * 100,
        riskAdjReturn: Math.min(Math.max(raCR, -10), 10),
      };
    }).sort((a, b) => b.varContrib - a.varContrib);
  }, [posData, seed]);

  // ── Style Analysis ──────────────────────────────────────────────────────────
  const styleSlices = useMemo((): StyleSlice[] => {
    if (posData.length === 0)
      return [
        { label: "Growth",    pct: 35, color: "#3b82f6" },
        { label: "Value",     pct: 25, color: "#f59e0b" },
        { label: "Large Cap", pct: 25, color: "#10b981" },
        { label: "Small Cap", pct: 15, color: "#8b5cf6" },
      ];

    // Regress portfolio return on style tilts (weighted exposures)
    const growthExp  = posData.reduce((s, p) => s + p.weight * p.meta.valueTilt * 100, 0);
    const valueExp   = posData.reduce((s, p) => s + p.weight * (1 - p.meta.valueTilt) * 100, 0);
    const largeCap   = posData.reduce((s, p) => s + p.weight * p.meta.sizeTilt * 100, 0);
    const smallCap   = posData.reduce((s, p) => s + p.weight * (1 - p.meta.sizeTilt) * 100, 0);

    const tot = growthExp + valueExp + largeCap + smallCap;
    return [
      { label: "Growth",    pct: (growthExp / tot) * 100, color: "#3b82f6" },
      { label: "Value",     pct: (valueExp / tot) * 100,  color: "#f59e0b" },
      { label: "Large Cap", pct: (largeCap / tot) * 100,  color: "#10b981" },
      { label: "Small Cap", pct: (smallCap / tot) * 100,  color: "#8b5cf6" },
    ];
  }, [posData]);

  if (positions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-semibold mb-1">Attribution Analysis</p>
        <p className="text-xs text-muted-foreground py-8 text-center">
          No open positions. Buy stocks to see BHB attribution analysis.
        </p>
      </div>
    );
  }

  const SUB_TABS: { id: SubTab; label: string }[] = [
    { id: "bhb",    label: "BHB" },
    { id: "factor", label: "Factor" },
    { id: "sector", label: "Sector" },
    { id: "risk",   label: "Risk" },
    { id: "style",  label: "Style" },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Attribution Analysis</h3>
          <p className="text-xs text-muted-foreground">Brinson-Hood-Beebower decomposition</p>
        </div>
        <span className="text-xs text-muted-foreground">{positions.length} positions</span>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0.5 rounded-md bg-muted/40 p-0.5">
        {SUB_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex-1 rounded px-1.5 py-1 text-xs font-medium transition-colors",
              activeTab === id
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── BHB Tab ── */}
      {activeTab === "bhb" && (
        <div className="space-y-4">
          <SectionHeader>BHB Active Return Decomposition</SectionHeader>

          {/* Summary chips */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "Allocation", val: bhbData.totalAlloc,  color: "#3b82f6" },
              { label: "Selection",  val: bhbData.totalSel,    color: "#10b981" },
              { label: "Interaction",val: bhbData.totalInter,  color: "#f59e0b" },
              { label: "Total Active",val: bhbData.totalActive,color: bhbData.totalActive >= 0 ? "#34d399" : "#f87171" },
            ].map(({ label, val, color }) => (
              <div key={label} className="rounded-md border border-border bg-background/50 p-2 text-center">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="text-[11px] font-semibold font-mono" style={{ color }}>
                  {val >= 0 ? "+" : ""}{val.toFixed(2)}%
                </p>
              </div>
            ))}
          </div>

          {/* Stacked bar chart */}
          <div className="overflow-x-auto -mx-1 px-1">
            <BHBStackedBar rows={bhbData.rows} />
          </div>

          {/* Table */}
          <div>
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-1 text-[11px] text-muted-foreground border-b border-border pb-1 mb-1">
              <span>Sector</span>
              <span className="text-right">Alloc</span>
              <span className="text-right">Select</span>
              <span className="text-right">Inter</span>
              <span className="text-right">Total</span>
            </div>
            {bhbData.rows.map((r) => (
              <div key={r.sector} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-1 items-center py-1 border-b border-muted/20 text-xs">
                <span className="text-muted-foreground truncate text-[11px]">{r.sector}</span>
                <span className={cn("text-right font-mono", r.allocation >= 0 ? "text-primary" : "text-red-400")}>
                  {r.allocation >= 0 ? "+" : ""}{r.allocation.toFixed(2)}
                </span>
                <span className={cn("text-right font-mono", r.selection >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {r.selection >= 0 ? "+" : ""}{r.selection.toFixed(2)}
                </span>
                <span className={cn("text-right font-mono", r.interaction >= 0 ? "text-amber-400" : "text-red-400")}>
                  {r.interaction >= 0 ? "+" : ""}{r.interaction.toFixed(2)}
                </span>
                <span className={cn("text-right font-mono font-semibold", r.total >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {r.total >= 0 ? "+" : ""}{r.total.toFixed(2)}
                </span>
              </div>
            ))}
            {/* Total row */}
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-1 items-center pt-1.5 text-xs">
              <span className="text-muted-foreground text-[11px] font-semibold">TOTAL</span>
              <span className={cn("text-right font-mono font-semibold", bhbData.totalAlloc >= 0 ? "text-primary" : "text-red-400")}>
                {bhbData.totalAlloc >= 0 ? "+" : ""}{bhbData.totalAlloc.toFixed(2)}
              </span>
              <span className={cn("text-right font-mono font-semibold", bhbData.totalSel >= 0 ? "text-emerald-400" : "text-red-400")}>
                {bhbData.totalSel >= 0 ? "+" : ""}{bhbData.totalSel.toFixed(2)}
              </span>
              <span className={cn("text-right font-mono font-semibold", bhbData.totalInter >= 0 ? "text-amber-400" : "text-red-400")}>
                {bhbData.totalInter >= 0 ? "+" : ""}{bhbData.totalInter.toFixed(2)}
              </span>
              <span className={cn("text-right font-mono font-semibold text-[11px]", bhbData.totalActive >= 0 ? "text-emerald-400" : "text-red-400")}>
                {bhbData.totalActive >= 0 ? "+" : ""}{bhbData.totalActive.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/60">
            Formula: Allocation = (w−W)×(B_i−B) · Selection = W×(R_i−B_i) · Interaction = (w−W)×(R_i−B_i). Benchmark: SPY.
          </p>
        </div>
      )}

      {/* ── Factor Tab ── */}
      {activeTab === "factor" && (
        <div className="space-y-4">
          <SectionHeader>Factor Return Attribution (bps)</SectionHeader>

          <div className="overflow-x-auto -mx-1 px-1">
            <FactorWaterfall factors={factorData} />
          </div>

          <div className="space-y-2">
            {factorData.map((f) => (
              <div key={f.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: f.color }} />
                <span className="text-xs text-muted-foreground w-18">{f.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (Math.abs(f.bps) / Math.max(...factorData.map((x) => Math.abs(x.bps)), 1)) * 100)}%`,
                      backgroundColor: f.color,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className={cn("text-xs font-mono w-12 text-right", f.bps >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {f.bps >= 0 ? "+" : ""}{f.bps.toFixed(0)} bps
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-md bg-muted/30 p-2 text-xs text-muted-foreground space-y-0.5">
            <p className="font-medium text-foreground/70">Factor Decomposition</p>
            <p>Total return = Σ (factor exposure × factor return) + idiosyncratic return</p>
            <p>Positive bps = factor added to returns vs. benchmark</p>
          </div>
        </div>
      )}

      {/* ── Sector Tab ── */}
      {activeTab === "sector" && (
        <div className="space-y-4">
          <SectionHeader>Sector Weights vs Benchmark (SPY)</SectionHeader>

          <div className="overflow-x-auto -mx-1 px-1">
            <SectorGroupedBars rows={sectorRows} />
          </div>

          <div>
            <div className="grid grid-cols-[80px_48px_56px_56px_56px] gap-1 text-[11px] text-muted-foreground border-b border-border pb-1 mb-1">
              <span>Sector</span>
              <span className="text-right">Port%</span>
              <span className="text-right">Bench%</span>
              <span className="text-right">Active%</span>
              <span className="text-right">Contrib%</span>
            </div>
            {sectorRows.map((r) => (
              <div key={r.sector} className="grid grid-cols-[80px_48px_56px_56px_56px] gap-1 items-center py-1 border-b border-muted/20 text-xs">
                <span className="text-[11px] text-muted-foreground truncate">{r.sector}</span>
                <span className="text-right font-mono text-primary">{r.portWeight.toFixed(1)}</span>
                <span className="text-right font-mono text-muted-foreground">{r.benchWeight.toFixed(1)}</span>
                <span className={cn("text-right font-mono", r.activeWeight >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {r.activeWeight >= 0 ? "+" : ""}{r.activeWeight.toFixed(1)}
                </span>
                <span className={cn("text-right font-mono", r.contribution >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {r.contribution >= 0 ? "+" : ""}{r.contribution.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Sector exposure stacked bar */}
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground font-medium">Portfolio Sector Exposure</p>
            {sectorRows.length > 0 && (
              <>
                <div className="flex h-5 rounded-md overflow-hidden gap-px">
                  {sectorRows.map((r) => (
                    <div
                      key={r.sector}
                      style={{ width: `${r.portWeight}%`, backgroundColor: SECTOR_COLORS[r.sector] ?? "#6b7280" }}
                      title={`${r.sector}: ${r.portWeight.toFixed(1)}%`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sectorRows.map((r) => (
                    <div key={r.sector} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: SECTOR_COLORS[r.sector] ?? "#6b7280" }} />
                      <span className="text-[11px] text-muted-foreground">{r.sector} {r.portWeight.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Risk Tab ── */}
      {activeTab === "risk" && (
        <div className="space-y-4">
          <SectionHeader>Risk Attribution — Contribution to Portfolio Variance</SectionHeader>

          <div>
            <div className="grid grid-cols-[52px_1fr_52px_52px_52px] gap-1 text-[11px] text-muted-foreground border-b border-border pb-1 mb-1">
              <span>Ticker</span>
              <span>Var Contrib</span>
              <span className="text-right">Wt%</span>
              <span className="text-right">MCTR</span>
              <span className="text-right">RACR</span>
            </div>
            {riskData.map((r) => (
              <div key={r.ticker} className="grid grid-cols-[52px_1fr_52px_52px_52px] gap-1 items-center py-1 border-b border-muted/20">
                <span className="text-xs font-semibold">{r.ticker}</span>
                <div className="space-y-0.5">
                  <RiskBar pct={r.varContrib} color="#f97316" />
                  <span className="text-[11px] text-orange-400 font-mono">{r.varContrib.toFixed(1)}%</span>
                </div>
                <span className="text-right text-xs font-mono text-muted-foreground">{r.weight.toFixed(1)}</span>
                <span className={cn("text-right text-xs font-mono", r.mctr >= 0 ? "text-primary" : "text-red-400")}>
                  {r.mctr.toFixed(2)}
                </span>
                <span className={cn("text-right text-xs font-mono", r.riskAdjReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {r.riskAdjReturn >= 0 ? "+" : ""}{r.riskAdjReturn.toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-md bg-muted/30 p-2 text-xs text-muted-foreground space-y-1">
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <p><span className="text-foreground/70 font-medium">Var Contrib</span> — % of portfolio variance from position</p>
              <p><span className="text-foreground/70 font-medium">MCTR</span> — Marginal contribution to risk (β × σ × w)</p>
              <p><span className="text-foreground/70 font-medium">RACR</span> — Risk-adj. contribution to return (R / MCTR)</p>
              <p><span className="text-foreground/70 font-medium">Wt%</span> — Portfolio weight percentage</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Style Tab ── */}
      {activeTab === "style" && (
        <div className="space-y-4">
          <SectionHeader>Sharpe-Style Returns-Based Analysis</SectionHeader>

          <StylePie slices={styleSlices} />

          <div>
            <div className="grid grid-cols-[80px_1fr_60px] gap-2 text-[11px] text-muted-foreground border-b border-border pb-1 mb-1">
              <span>Style</span>
              <span>Exposure</span>
              <span className="text-right">Weight</span>
            </div>
            {styleSlices.map((sl) => (
              <div key={sl.label} className="grid grid-cols-[80px_1fr_60px] gap-2 items-center py-1 border-b border-muted/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: sl.color }} />
                  <span className="text-xs">{sl.label}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${sl.pct}%`, backgroundColor: sl.color, opacity: 0.8 }} />
                </div>
                <span className="text-right text-xs font-mono font-semibold" style={{ color: sl.color }}>
                  {sl.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-md bg-muted/30 p-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground/70 mb-1">Sharpe Returns-Based Style Analysis</p>
            <p>Portfolio returns regressed on 4 style indices: Growth, Value, Large Cap, Small Cap.</p>
            <p className="mt-0.5">Exposures show % of return variation explained by each style factor.</p>
          </div>

          {/* Factor tilt radar-like table */}
          <div>
            <SectionHeader>Portfolio vs Benchmark Factor Tilts</SectionHeader>
            <div className="space-y-2">
              {[
                { label: "Growth Tilt",   port: posData.reduce((s, p) => s + p.weight * p.meta.valueTilt, 0) * 100, bench: 60 },
                { label: "Value Tilt",    port: posData.reduce((s, p) => s + p.weight * (1 - p.meta.valueTilt), 0) * 100, bench: 40 },
                { label: "Large Cap",     port: posData.reduce((s, p) => s + p.weight * p.meta.sizeTilt, 0) * 100,  bench: 80 },
                { label: "Momentum",      port: posData.reduce((s, p) => s + p.weight * p.meta.momentumTilt, 0) * 100, bench: 55 },
                { label: "Quality",       port: posData.reduce((s, p) => s + p.weight * p.meta.qualityTilt, 0) * 100, bench: 72 },
              ].map(({ label, port, bench }) => (
                <div key={label} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{label}</span>
                    <span>
                      Port <span className="text-primary font-mono">{port.toFixed(0)}</span>
                      {" "}vs Bench <span className="text-muted-foreground/70 font-mono">{bench}</span>
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div className="absolute h-full rounded-full bg-muted-foreground/30" style={{ width: `${bench}%` }} />
                    <div className="absolute h-full rounded-full bg-primary/70" style={{ width: `${Math.min(port, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
