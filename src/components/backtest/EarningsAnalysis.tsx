"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

// ── Seeded PRNG ────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// ── Synthetic earnings data generation ────────────────────────────────────

interface EarningsRow {
  date: string;
  expectedEps: number;
  actualEps: number;
  surprisePct: number;
  preEarningsDrift: number;  // % gain/loss in 5 days before earnings
  postEarningsMove: number;  // % move on earnings day
  buyRumorSellNews: boolean; // large pre-move that reversed
}

function generateEarningsData(ticker: string): EarningsRow[] {
  const rng = mulberry32(strSeed(ticker + "earnings2026"));
  const rows: EarningsRow[] = [];

  // Generate 8 quarters of data
  const baseYear = 2024;
  let quarter = 0;

  for (let i = 0; i < 8; i++) {
    const year = baseYear + Math.floor((quarter) / 4);
    const q = (quarter % 4) + 1;
    quarter++;

    const month = [2, 5, 8, 11][q - 1];
    const day = 10 + Math.floor(rng() * 10);
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const expectedEps = parseFloat((0.5 + rng() * 3).toFixed(2));
    const surprisePct = parseFloat((-15 + rng() * 35).toFixed(1)); // -15% to +20%
    const actualEps = parseFloat((expectedEps * (1 + surprisePct / 100)).toFixed(2));

    // Pre-earnings drift: -3% to +8% (slight upward bias = "buy the rumor")
    const preEarningsDrift = parseFloat((-3 + rng() * 11).toFixed(1));

    // Post-earnings move: correlated with surprise but noisy
    const surpriseEffect = surprisePct * 0.3;
    const noise = (-5 + rng() * 10);
    const postEarningsMove = parseFloat((surpriseEffect + noise).toFixed(1));

    // Buy-the-rumor-sell-the-news: pre-earnings > 3% AND post-earnings < -2%
    const buyRumorSellNews = preEarningsDrift > 3 && postEarningsMove < -2;

    rows.push({
      date,
      expectedEps,
      actualEps,
      surprisePct,
      preEarningsDrift,
      postEarningsMove,
      buyRumorSellNews,
    });
  }

  return rows;
}

// ── Component ─────────────────────────────────────────────────────────────

interface EarningsAnalysisProps {
  ticker: string;
}

export default function EarningsAnalysis({ ticker }: EarningsAnalysisProps) {
  const data = useMemo(() => generateEarningsData(ticker), [ticker]);

  const avgPreDrift = (data.reduce((s, r) => s + r.preEarningsDrift, 0) / data.length).toFixed(1);
  const avgPostMove = (data.reduce((s, r) => s + r.postEarningsMove, 0) / data.length).toFixed(1);
  const buyRumorCount = data.filter((r) => r.buyRumorSellNews).length;
  const beatCount = data.filter((r) => r.surprisePct > 0).length;

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="grid grid-cols-4 gap-2">
        <SummaryChip label="Beat Rate" value={`${beatCount}/${data.length}`} positive={beatCount > data.length / 2} />
        <SummaryChip label="Avg Pre-Drift" value={`${Number(avgPreDrift) >= 0 ? "+" : ""}${avgPreDrift}%`} positive={Number(avgPreDrift) > 0} />
        <SummaryChip label="Avg Post-Move" value={`${Number(avgPostMove) >= 0 ? "+" : ""}${avgPostMove}%`} positive={Number(avgPostMove) > 0} />
        <SummaryChip label="Buy Rumor / Sell News" value={`${buyRumorCount}x detected`} positive={false} neutral={buyRumorCount === 0} />
      </div>

      {/* Pattern explanation */}
      {buyRumorCount > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
          <div className="text-xs text-amber-200">
            <span className="font-semibold">Buy-the-Rumor, Sell-the-News</span> detected {buyRumorCount} time{buyRumorCount !== 1 ? "s" : ""}.
            These are cases where the stock rallied {">"}3% before earnings but fell {">"}2% on the actual report day,
            suggesting traders sold into the expected good news.
          </div>
        </div>
      )}

      {/* Bar chart of post-earnings moves */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Post-Earnings Day Moves
        </h3>
        <PostMoveChart rows={data} />
      </div>

      {/* Full table */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Earnings History
        </h3>
        <div className="overflow-x-auto rounded-lg border border-border/30">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30 bg-muted/10">
                <th className="px-3 py-2 text-left text-muted-foreground font-medium">Date</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Est. EPS</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Actual EPS</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Surprise</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Pre-Drift (5d)</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Post-Day Move</th>
                <th className="px-3 py-2 text-center text-muted-foreground font-medium">Pattern</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-border/30 transition-colors hover:bg-muted/30 ${
                    row.buyRumorSellNews ? "bg-amber-500/5" : ""
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-muted-foreground">{row.date}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">${row.expectedEps.toFixed(2)}</td>
                  <td className={`px-3 py-2 text-right font-mono font-semibold ${
                    row.actualEps >= row.expectedEps ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    ${row.actualEps.toFixed(2)}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono font-semibold ${
                    row.surprisePct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {row.surprisePct >= 0 ? "+" : ""}{row.surprisePct}%
                  </td>
                  <td className={`px-3 py-2 text-right font-mono ${
                    row.preEarningsDrift >= 0 ? "text-emerald-300/70" : "text-rose-300/70"
                  }`}>
                    {row.preEarningsDrift >= 0 ? "+" : ""}{row.preEarningsDrift}%
                  </td>
                  <td className={`px-3 py-2 text-right font-mono font-semibold ${
                    row.postEarningsMove >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {row.postEarningsMove >= 0 ? "+" : ""}{row.postEarningsMove}%
                  </td>
                  <td className="px-3 py-2 text-center">
                    {row.buyRumorSellNews ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                        BRSN
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Summary Chip ──────────────────────────────────────────────────────────

function SummaryChip({ label, value, positive, neutral }: {
  label: string;
  value: string;
  positive?: boolean;
  neutral?: boolean;
}) {
  const color = neutral
    ? "text-muted-foreground"
    : positive
    ? "text-emerald-400"
    : "text-rose-400";
  return (
    <div className="rounded-lg border border-border/30 bg-muted/15 px-3 py-2">
      <div className="text-[11px] text-muted-foreground/70">{label}</div>
      <div className={`mt-0.5 text-xs font-bold ${color}`}>{value}</div>
    </div>
  );
}

// ── Post-Move Bar Chart (pure SVG) ────────────────────────────────────────

function PostMoveChart({ rows }: { rows: EarningsRow[] }) {
  const W = 480;
  const H = 100;
  const PAD_L = 32;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = 20;

  const moves = rows.map((r) => r.postEarningsMove);
  const maxAbs = Math.max(Math.abs(Math.min(...moves)), Math.abs(Math.max(...moves)), 1);

  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const zeroY = PAD_T + chartH / 2;
  const barW = (chartW / rows.length) * 0.7;
  const spacing = chartW / rows.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg" style={{ height: H }}>
      {/* Zero line */}
      <line x1={PAD_L} y1={zeroY} x2={W - PAD_R} y2={zeroY} stroke="#27272a" strokeWidth={1} />

      {/* Y-axis labels */}
      <text x={PAD_L - 4} y={PAD_T + 4} textAnchor="end" fontSize={8} fill="#52525b">
        +{maxAbs.toFixed(0)}%
      </text>
      <text x={PAD_L - 4} y={H - PAD_B} textAnchor="end" fontSize={8} fill="#52525b">
        -{maxAbs.toFixed(0)}%
      </text>

      {/* Bars */}
      {rows.map((row, i) => {
        const cx = PAD_L + i * spacing + spacing / 2;
        const pct = row.postEarningsMove / maxAbs;
        const barH = Math.abs(pct) * (chartH / 2);
        const y = pct >= 0 ? zeroY - barH : zeroY;
        const color = row.buyRumorSellNews
          ? "#f59e0b"
          : row.postEarningsMove >= 0
          ? "#10b981"
          : "#ef4444";
        return (
          <g key={i}>
            <rect
              x={cx - barW / 2}
              y={y}
              width={barW}
              height={Math.max(barH, 1)}
              fill={color}
              opacity={0.7}
              rx={1}
            />
            {/* Date label — show abbreviated year/quarter */}
            <text
              x={cx}
              y={H - 4}
              textAnchor="middle"
              fontSize={7}
              fill="#52525b"
            >
              {row.date.slice(0, 7)}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={PAD_L} y={H - PAD_B - 2} width={6} height={6} fill="#f59e0b" opacity={0.7} rx={1} />
      <text x={PAD_L + 9} y={H - PAD_B + 4} fontSize={7} fill="#a1a1aa">BRSN pattern</text>
    </svg>
  );
}
