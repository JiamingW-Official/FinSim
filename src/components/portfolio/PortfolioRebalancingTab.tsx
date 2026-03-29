"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTradingStore } from "@/stores/trading-store";
import {
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Scissors,
  History,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const AVAILABLE_TICKERS = ["AAPL", "MSFT", "GOOG", "AMZN", "NVDA", "SPY", "QQQ"];

const TAX_RATE = 0.22; // short-term

const CHART_COLORS: Record<string, string> = {
  AAPL: "#10b981",
  MSFT: "#3b82f6",
  GOOG: "#f59e0b",
  AMZN: "#ef4444",
  NVDA: "#8b5cf6",
  SPY: "#06b6d4",
  QQQ: "#ec4899",
};

function colorFor(ticker: string) {
  return CHART_COLORS[ticker] ?? "#6366f1";
}

// ─── Demo positions (used when real portfolio is empty) ───────────────────────

const DEMO_POSITIONS = [
  { ticker: "AAPL", quantity: 50, avgPrice: 178, currentPrice: 182.5, side: "long" as const },
  { ticker: "MSFT", quantity: 30, avgPrice: 390, currentPrice: 410.2, side: "long" as const },
  { ticker: "GOOG", quantity: 25, avgPrice: 160, currentPrice: 148.3, side: "long" as const },
  { ticker: "AMZN", quantity: 20, avgPrice: 195, currentPrice: 190.7, side: "long" as const },
  { ticker: "NVDA", quantity: 15, avgPrice: 820, currentPrice: 780.0, side: "long" as const },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt$(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${Math.abs(v).toFixed(2)}`;
}

interface PositionRow {
  ticker: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  side: "long" | "short";
}

// ─── Section 1: Target Allocation Setup ──────────────────────────────────────

interface TargetRow {
  ticker: string;
  weight: number; // raw input (pre-normalise)
}

function TargetAllocationSetup({
  targets,
  setTargets,
}: {
  targets: TargetRow[];
  setTargets: (t: TargetRow[]) => void;
}) {
  const totalRaw = targets.reduce((s, r) => s + r.weight, 0);

  function addRow() {
    const used = targets.map((t) => t.ticker);
    const next = AVAILABLE_TICKERS.find((t) => !used.includes(t));
    if (!next) return;
    setTargets([...targets, { ticker: next, weight: 10 }]);
  }

  function removeRow(i: number) {
    setTargets(targets.filter((_, idx) => idx !== i));
  }

  function updateTicker(i: number, ticker: string) {
    setTargets(targets.map((r, idx) => (idx === i ? { ...r, ticker } : r)));
  }

  function updateWeight(i: number, raw: string) {
    const v = Math.max(0, Math.min(100, parseFloat(raw) || 0));
    setTargets(targets.map((r, idx) => (idx === i ? { ...r, weight: v } : r)));
  }

  const availableForRow = (i: number) => {
    const usedElsewhere = targets.filter((_, idx) => idx !== i).map((t) => t.ticker);
    return AVAILABLE_TICKERS.filter((t) => !usedElsewhere.includes(t));
  };

  return (
    <div className="rounded-lg border border-border/20 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold">Target Allocation</h4>
        <span
          className={cn(
            "text-xs px-1.5 py-0.5 rounded font-medium",
            Math.abs(totalRaw - 100) < 0.5
              ? "bg-emerald-500/5 text-emerald-500"
              : "bg-amber-500/10 text-amber-500",
          )}
        >
          {totalRaw.toFixed(1)}% total → auto-normalised to 100%
        </span>
      </div>

      <div className="space-y-2">
        {targets.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            {/* Ticker select */}
            <select
              value={row.ticker}
              onChange={(e) => updateTicker(i, e.target.value)}
              className="h-7 w-20 rounded border border-border/20 bg-background px-1.5 text-[11px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {availableForRow(i).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Weight input */}
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={row.weight}
              onChange={(e) => updateWeight(i, e.target.value)}
              className="h-7 w-20 rounded border border-border/20 bg-background px-2 text-[11px] tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-xs text-muted-foreground">%</span>

            {/* Normalised preview */}
            <span className="text-xs text-muted-foreground tabular-nums w-16 text-right">
              {totalRaw > 0 ? ((row.weight / totalRaw) * 100).toFixed(1) : "0.0"}% norm.
            </span>

            {/* Color dot */}
            <span
              className="h-2.5 w-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: colorFor(row.ticker) }}
            />

            {/* Remove */}
            <button
              onClick={() => removeRow(i)}
              className="ml-auto text-muted-foreground/50 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {targets.length < AVAILABLE_TICKERS.length && (
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 text-[11px] text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add asset
        </button>
      )}
    </div>
  );
}

// ─── Section 2: Drift Analysis (SVG grouped bar chart) ───────────────────────

interface DriftEntry {
  ticker: string;
  currentPct: number;
  targetPct: number;
  drift: number; // currentPct - targetPct
}

function DriftChart({ entries }: { entries: DriftEntry[] }) {
  if (entries.length === 0) return null;

  const maxPct = Math.max(...entries.flatMap((e) => [e.currentPct, e.targetPct]), 1);
  const chartH = 120;
  const chartW = 400;
  const barGroupW = chartW / entries.length;
  const barW = Math.min(18, barGroupW * 0.35);
  const gap = 3;
  const padTop = 12;
  const padBottom = 20;
  const innerH = chartH - padTop - padBottom;

  return (
    <svg
      viewBox={`0 0 ${chartW} ${chartH}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Y-axis gridlines */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const y = padTop + innerH - (Math.min(pct, maxPct) / maxPct) * innerH;
        if (pct > maxPct * 1.05) return null;
        return (
          <g key={pct}>
            <line
              x1={0}
              x2={chartW}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeWidth={0.5}
            />
            <text x={2} y={y - 2} fontSize={6} fill="currentColor" fillOpacity={0.4}>
              {pct}%
            </text>
          </g>
        );
      })}

      {entries.map((entry, i) => {
        const cx = barGroupW * i + barGroupW / 2;
        const xCurrent = cx - barW - gap / 2;
        const xTarget = cx + gap / 2;

        const hCurrent = (entry.currentPct / maxPct) * innerH;
        const hTarget = (entry.targetPct / maxPct) * innerH;

        const yCurrent = padTop + innerH - hCurrent;
        const yTarget = padTop + innerH - hTarget;

        const baseY = padTop + innerH;

        return (
          <g key={entry.ticker}>
            {/* Current bar */}
            <rect
              x={xCurrent}
              y={yCurrent}
              width={barW}
              height={hCurrent}
              fill={colorFor(entry.ticker)}
              fillOpacity={0.85}
              rx={1.5}
            />
            {/* Target bar (outlined) */}
            <rect
              x={xTarget}
              y={yTarget}
              width={barW}
              height={hTarget}
              fill="transparent"
              stroke={colorFor(entry.ticker)}
              strokeWidth={1.5}
              strokeDasharray="3,2"
              rx={1.5}
            />
            {/* X label */}
            <text
              x={cx}
              y={baseY + 10}
              textAnchor="middle"
              fontSize={7}
              fill="currentColor"
              fillOpacity={0.6}
            >
              {entry.ticker}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${chartW - 90}, 4)`}>
        <rect x={0} y={0} width={8} height={8} fill="#6366f1" fillOpacity={0.85} rx={1} />
        <text x={11} y={7} fontSize={6} fill="currentColor" fillOpacity={0.6}>
          Current
        </text>
        <rect x={30} y={0} width={8} height={8} fill="transparent" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="3,2" rx={1} />
        <text x={41} y={7} fontSize={6} fill="currentColor" fillOpacity={0.6}>
          Target
        </text>
      </g>
    </svg>
  );
}

function DriftBadge({ drift }: { drift: number }) {
  const abs = Math.abs(drift);
  if (abs < 1)
    return (
      <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold bg-emerald-500/5 text-emerald-500">
        On target
      </span>
    );
  if (drift > 0)
    return (
      <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold bg-red-500/5 text-red-500">
        +{drift.toFixed(1)}% over
      </span>
    );
  return (
    <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary">
      {drift.toFixed(1)}% under
    </span>
  );
}

function DriftAnalysis({ entries }: { entries: DriftEntry[] }) {
  return (
    <div className="rounded-lg border border-border/20 bg-card p-4 space-y-3">
      <h4 className="text-xs font-semibold">Drift Analysis</h4>

      {entries.length === 0 ? (
        <p className="text-[11px] text-muted-foreground py-4 text-center">
          Set target allocations above to see drift.
        </p>
      ) : (
        <>
          <DriftChart entries={entries} />

          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border/20 text-muted-foreground">
                  <th className="text-left py-1 px-1 font-medium">Asset</th>
                  <th className="text-right py-1 px-1 font-medium">Current</th>
                  <th className="text-right py-1 px-1 font-medium">Target</th>
                  <th className="text-right py-1 px-1 font-medium">Drift</th>
                  <th className="text-left py-1 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.ticker} className="border-b border-border/20">
                    <td className="py-1.5 px-1 font-medium flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-sm shrink-0"
                        style={{ backgroundColor: colorFor(e.ticker) }}
                      />
                      {e.ticker}
                    </td>
                    <td className="py-1.5 px-1 text-right tabular-nums">
                      {e.currentPct.toFixed(1)}%
                    </td>
                    <td className="py-1.5 px-1 text-right tabular-nums">
                      {e.targetPct.toFixed(1)}%
                    </td>
                    <td
                      className={cn(
                        "py-1.5 px-1 text-right tabular-nums font-medium",
                        e.drift > 1
                          ? "text-red-400"
                          : e.drift < -1
                            ? "text-primary"
                            : "text-emerald-400",
                      )}
                    >
                      {e.drift >= 0 ? "+" : ""}
                      {e.drift.toFixed(1)}%
                    </td>
                    <td className="py-1.5 px-2">
                      <DriftBadge drift={e.drift} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Section 3: Rebalancing Orders ───────────────────────────────────────────

interface RebalOrder {
  ticker: string;
  currentValue: number;
  targetValue: number;
  action: "Buy" | "Sell" | "Hold";
  amount: number; // dollar amount
  shares: number;
}

function RebalancingOrders({
  orders,
  portfolioValue,
}: {
  orders: RebalOrder[];
  portfolioValue: number;
}) {
  const [executed, setExecuted] = useState(false);

  function handleExecute() {
    setExecuted(true);
    toast.success("Rebalance executed (demo)", {
      description: `${orders.filter((o) => o.action !== "Hold").length} orders placed · portfolio value $${(portfolioValue / 1000).toFixed(1)}K`,
      duration: 4000,
    });
  }

  const actionOrders = orders.filter((o) => o.action !== "Hold");

  return (
    <div className="rounded-lg border border-border/20 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold">Rebalancing Orders</h4>
        {actionOrders.length > 0 && (
          <button
            onClick={handleExecute}
            disabled={executed}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
              executed
                ? "bg-emerald-500/5 text-emerald-500 cursor-default"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {executed ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Executed
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Execute Rebalance
              </>
            )}
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="text-[11px] text-muted-foreground py-4 text-center">
          Set target allocations to calculate orders.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border/20 text-muted-foreground">
                <th className="text-left py-1 px-1 font-medium">Asset</th>
                <th className="text-right py-1 px-1 font-medium">Current $</th>
                <th className="text-right py-1 px-1 font-medium">Target $</th>
                <th className="text-center py-1 px-1 font-medium">Action</th>
                <th className="text-right py-1 px-1 font-medium">Amount</th>
                <th className="text-right py-1 px-1 font-medium">Shares</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.ticker} className="border-b border-border/20">
                  <td className="py-1.5 px-1 font-medium">{o.ticker}</td>
                  <td className="py-1.5 px-1 text-right tabular-nums">{fmt$(o.currentValue)}</td>
                  <td className="py-1.5 px-1 text-right tabular-nums">{fmt$(o.targetValue)}</td>
                  <td className="py-1.5 px-1 text-center">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                        o.action === "Buy"
                          ? "bg-emerald-500/5 text-emerald-500"
                          : o.action === "Sell"
                            ? "bg-red-500/5 text-red-500"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {o.action}
                    </span>
                  </td>
                  <td className="py-1.5 px-1 text-right tabular-nums">
                    {o.action !== "Hold" ? fmt$(o.amount) : "—"}
                  </td>
                  <td className="py-1.5 px-1 text-right tabular-nums">
                    {o.action !== "Hold" ? o.shares.toFixed(2) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Section 4: Tax Loss Harvesting Scanner ───────────────────────────────────

interface LossPosition {
  ticker: string;
  costBasis: number; // total
  currentPrice: number;
  quantity: number;
  unrealizedLoss: number;
  taxSavings: number;
  washSaleRisk: boolean;
}

function TaxLossHarvestingScanner({ positions }: { positions: PositionRow[] }) {
  const [harvested, setHarvested] = useState<Set<string>>(new Set());

  const lossPositions = useMemo<LossPosition[]>(() => {
    const rows = positions.filter((p) => p.side === "long");
    return rows
      .filter((p) => p.currentPrice < p.avgPrice)
      .map((p) => {
        const costBasis = p.avgPrice * p.quantity;
        const currentTotal = p.currentPrice * p.quantity;
        const unrealizedLoss = costBasis - currentTotal;
        const taxSavings = unrealizedLoss * TAX_RATE;
        // Simple wash-sale heuristic: loss < 5% → mark as borderline risk
        const lossPercent = (unrealizedLoss / costBasis) * 100;
        const washSaleRisk = lossPercent < 8;
        return {
          ticker: p.ticker,
          costBasis,
          currentPrice: p.currentPrice,
          quantity: p.quantity,
          unrealizedLoss,
          taxSavings,
          washSaleRisk,
        };
      })
      .sort((a, b) => b.unrealizedLoss - a.unrealizedLoss);
  }, [positions]);

  const totalSavings = lossPositions.reduce((s, p) => s + p.taxSavings, 0);
  const totalLosses = lossPositions.reduce((s, p) => s + p.unrealizedLoss, 0);

  function harvest(ticker: string) {
    setHarvested((prev) => new Set([...prev, ticker]));
    toast.success(`Tax loss harvest queued: ${ticker}`, {
      description: `Unrealized loss locked in. Avoid repurchasing within 30 days (wash-sale rule).`,
      duration: 5000,
    });
  }

  return (
    <div className="rounded-lg border border-border/20 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold">Tax Loss Harvesting Scanner</h4>
        <span className="text-xs text-muted-foreground">22% short-term rate</span>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md bg-muted/40 p-2 space-y-0.5">
          <p className="text-[11px] text-muted-foreground">Opportunities</p>
          <p className="text-sm font-semibold tabular-nums">{lossPositions.length}</p>
        </div>
        <div className="rounded-md bg-muted/40 p-2 space-y-0.5">
          <p className="text-[11px] text-muted-foreground">Harvestable Losses</p>
          <p className="text-sm font-semibold tabular-nums text-red-400">-{fmt$(totalLosses)}</p>
        </div>
        <div className="rounded-md bg-muted/40 p-2 space-y-0.5">
          <p className="text-[11px] text-muted-foreground">Est. Tax Savings</p>
          <p className="text-sm font-semibold tabular-nums text-emerald-400">{fmt$(totalSavings)}</p>
        </div>
      </div>

      {lossPositions.length === 0 ? (
        <div className="flex items-center gap-2 py-3 text-emerald-500">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <p className="text-[11px] font-medium">All positions are profitable — no losses to harvest.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lossPositions.map((p) => (
            <div key={p.ticker} className="rounded-md border border-border/60 bg-background/50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{p.ticker}</span>
                    {p.washSaleRisk && (
                      <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-500">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Wash-sale risk
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Cost Basis</p>
                      <p className="tabular-nums font-medium">{fmt$(p.costBasis)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current</p>
                      <p className="tabular-nums font-medium">${p.currentPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unreal. Loss</p>
                      <p className="tabular-nums font-medium text-red-400">-{fmt$(p.unrealizedLoss)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tax Savings</p>
                      <p className="tabular-nums font-medium text-emerald-400">{fmt$(p.taxSavings)}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => harvest(p.ticker)}
                  disabled={harvested.has(p.ticker)}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    harvested.has(p.ticker)
                      ? "bg-muted text-muted-foreground cursor-default"
                      : "bg-red-500/5 text-red-400 hover:bg-red-500/20",
                  )}
                >
                  {harvested.has(p.ticker) ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Harvested
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Scissors className="h-3 w-3" /> Harvest
                    </span>
                  )}
                </button>
              </div>

              {/* Loss magnitude bar */}
              <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500 transition-colors duration-300"
                  style={{
                    width: `${Math.min(100, (p.unrealizedLoss / (p.costBasis + 1)) * 300)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wash-sale note */}
      {lossPositions.some((p) => p.washSaleRisk) && (
        <div className="flex items-start gap-2 rounded-md bg-amber-500/6 border border-amber-500/20 p-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-500/90 leading-relaxed">
            <strong>Wash-sale rule (30-day):</strong> If you repurchase substantially identical
            securities within 30 days before or after the sale, the IRS disallows the loss
            deduction. Consider waiting 31 days or swapping into a similar-but-not-identical ETF.
          </p>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Estimates assume a 22% short-term capital gains tax rate. Consult a tax professional before
        taking action. Actual savings depend on your filing status and total income.
      </p>
    </div>
  );
}

// ─── Section 5: Rebalancing History ──────────────────────────────────────────

const REBALANCE_HISTORY = [
  {
    id: "rb5",
    date: "Mar 10, 2026",
    trades: 4,
    totalCost: 28.5,
    result: "+0.6% drift reduction",
  },
  {
    id: "rb4",
    date: "Feb 14, 2026",
    trades: 3,
    totalCost: 19.0,
    result: "Rebalanced after NVDA surge",
  },
  {
    id: "rb3",
    date: "Jan 22, 2026",
    trades: 5,
    totalCost: 44.0,
    result: "+1.1% drift reduction",
  },
  {
    id: "rb2",
    date: "Dec 18, 2025",
    trades: 2,
    totalCost: 11.5,
    result: "Minor trim — AAPL overweight",
  },
  {
    id: "rb1",
    date: "Nov 30, 2025",
    trades: 6,
    totalCost: 58.0,
    result: "Full rebalance — Q4 reset",
  },
];

function RebalancingHistory() {
  return (
    <div className="rounded-lg border border-border/20 bg-card p-4 space-y-3">
      <div className="flex items-center gap-1.5">
        <History className="h-3.5 w-3.5 text-muted-foreground" />
        <h4 className="text-xs font-semibold">Rebalancing History</h4>
        <span className="ml-auto text-xs text-muted-foreground">Last 5 events</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border/20 text-muted-foreground">
              <th className="text-left py-1 px-1 font-medium">Date</th>
              <th className="text-center py-1 px-1 font-medium">Trades</th>
              <th className="text-right py-1 px-1 font-medium">Total Cost</th>
              <th className="text-left py-1 px-2 font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            {REBALANCE_HISTORY.map((ev) => (
              <tr key={ev.id} className="border-b border-border/20">
                <td className="py-1.5 px-1 text-muted-foreground">{ev.date}</td>
                <td className="py-1.5 px-1 text-center tabular-nums font-medium">
                  {ev.trades}
                </td>
                <td className="py-1.5 px-1 text-right tabular-nums">${ev.totalCost.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-muted-foreground">{ev.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Transaction costs estimated at $0.005 per share (demo). Real costs vary by broker.
      </p>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function PortfolioRebalancingTab() {
  // Use real positions if available, else demo
  const storePositions = useTradingStore((s) => s.positions);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const cash = useTradingStore((s) => s.cash);

  const positions: PositionRow[] = useMemo(() => {
    if (storePositions.length > 0) {
      return storePositions.map((p) => ({
        ticker: p.ticker,
        quantity: p.quantity,
        avgPrice: p.avgPrice,
        currentPrice: p.currentPrice,
        side: p.side,
      }));
    }
    return DEMO_POSITIONS;
  }, [storePositions]);

  // Effective portfolio value (positions + cash for demo)
  const effectiveValue = useMemo(() => {
    if (storePositions.length > 0) return portfolioValue;
    return DEMO_POSITIONS.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
  }, [storePositions, portfolioValue]);

  // Current allocation %
  const currentAllocation = useMemo<Record<string, number>>(() => {
    const posValue = positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
    const total = storePositions.length > 0 ? effectiveValue : posValue;
    if (total === 0) return {};
    const out: Record<string, number> = {};
    for (const p of positions) {
      out[p.ticker] = ((p.currentPrice * p.quantity) / total) * 100;
    }
    // Add cash if using real store
    if (storePositions.length > 0 && effectiveValue > 0) {
      // cash already in effectiveValue (portfolioValue = positions + cash)
    }
    return out;
  }, [positions, effectiveValue, storePositions]);

  // Target rows state (default = equal weight across first 3 positions)
  const [targets, setTargets] = useState<TargetRow[]>(() => {
    const initial = positions.slice(0, 3).map((p, i) => ({
      ticker: p.ticker,
      weight: [40, 35, 25][i] ?? 20,
    }));
    return initial.length > 0
      ? initial
      : [{ ticker: AVAILABLE_TICKERS[0], weight: 100 }];
  });

  // Normalised target weights
  const normTargets = useMemo(() => {
    const total = targets.reduce((s, t) => s + t.weight, 0);
    if (total === 0) return {} as Record<string, number>;
    const out: Record<string, number> = {};
    for (const t of targets) {
      out[t.ticker] = (t.weight / total) * 100;
    }
    return out;
  }, [targets]);

  // Drift entries (union of current positions + targets)
  const driftEntries = useMemo<DriftEntry[]>(() => {
    const tickers = new Set([
      ...Object.keys(currentAllocation),
      ...Object.keys(normTargets),
    ]);
    return [...tickers].map((ticker) => {
      const cur = currentAllocation[ticker] ?? 0;
      const tgt = normTargets[ticker] ?? 0;
      return { ticker, currentPct: cur, targetPct: tgt, drift: cur - tgt };
    });
  }, [currentAllocation, normTargets]);

  // Rebalancing orders
  const rebalOrders = useMemo<RebalOrder[]>(() => {
    const posValue = positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
    const base = storePositions.length > 0 ? posValue : posValue; // just positions
    if (base === 0) return [];

    const allTickers = new Set([
      ...positions.map((p) => p.ticker),
      ...Object.keys(normTargets),
    ]);

    return [...allTickers].map((ticker) => {
      const pos = positions.find((p) => p.ticker === ticker);
      const currentValue = pos ? pos.currentPrice * pos.quantity : 0;
      const targetPct = (normTargets[ticker] ?? 0) / 100;
      const targetValue = base * targetPct;
      const diff = targetValue - currentValue;
      const price = pos ? pos.currentPrice : 100;
      const action: "Buy" | "Sell" | "Hold" =
        diff > 50 ? "Buy" : diff < -50 ? "Sell" : "Hold";
      const amount = Math.abs(diff);
      const shares = price > 0 ? amount / price : 0;

      return { ticker, currentValue, targetValue, action, amount, shares };
    });
  }, [positions, normTargets, storePositions]);

  const isDemoMode = storePositions.length === 0;

  return (
    <div className="space-y-4">
      {isDemoMode && (
        <div className="flex items-center gap-2 rounded-md bg-primary/8 border border-border px-3 py-2">
          <TrendingDown className="h-3.5 w-3.5 text-primary shrink-0" />
          <p className="text-[11px] text-primary">
            Demo mode — showing synthetic portfolio. Make trades to see your real positions.
          </p>
        </div>
      )}

      <TargetAllocationSetup targets={targets} setTargets={setTargets} />

      <DriftAnalysis entries={driftEntries} />

      <RebalancingOrders orders={rebalOrders} portfolioValue={effectiveValue} />

      <TaxLossHarvestingScanner positions={positions} />

      <RebalancingHistory />
    </div>
  );
}
