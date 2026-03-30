"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { computeRebalanceTrades } from "@/services/portfolio/optimizer";
import type { RebalanceTrade } from "@/services/portfolio/optimizer";

// ─── Constants ────────────────────────────────────────────────────────────────

const COMMISSION_RATE = 0.0005; // 0.05% estimated commission on trade value
const DRIFT_THRESHOLD = 0.02;   // 2% — below this, show as "in range"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt$(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(2)}`;
}

function fmtPct(v: number, showSign = false): string {
  const s = showSign && v > 0 ? "+" : "";
  return `${s}${(v * 100).toFixed(1)}%`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RebalanceAdvisorProps {
  /** Tickers in the portfolio */
  tickers: string[];
  /** Current dollar values per ticker */
  currentValues: number[];
  /** Total portfolio value in dollars */
  portfolioValueDollar: number;
  /** Optional: target weights 0..1 (default: equal weight) */
  targetWeights?: number[];
  /** Optional: custom target label (default: "Equal Weight") */
  targetLabel?: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RebalanceAdvisor({
  tickers,
  currentValues,
  portfolioValueDollar,
  targetWeights,
  targetLabel = "Equal Weight",
}: RebalanceAdvisorProps) {
  const [showAll, setShowAll] = useState(false);
  const [commissionMode, setCommissionMode] = useState<"free" | "standard">("free");

  const commissionPerTrade = commissionMode === "standard"
    ? portfolioValueDollar * COMMISSION_RATE
    : 0;

  const { currentWeights, target, result } = useMemo(() => {
    const total = currentValues.reduce((s, v) => s + v, 0);
    const cw = currentValues.map((v) => (total > 0 ? v / total : 0));

    const n = tickers.length;
    const tw = targetWeights ?? new Array(n).fill(1 / n);

    const r = computeRebalanceTrades(tickers, cw, tw, portfolioValueDollar, commissionPerTrade);
    return { currentWeights: cw, target: tw, result: r };
  }, [tickers, currentValues, portfolioValueDollar, targetWeights, commissionPerTrade]);

  const { trades, totalCommission, totalTurnover } = result;

  // Sort: buys first, then sells, then holds; within each group by |drift| desc
  const sorted = useMemo(
    () =>
      [...trades].sort((a, b) => {
        const order = (t: RebalanceTrade) => (t.action === "buy" ? 0 : t.action === "sell" ? 1 : 2);
        const diff = order(a) - order(b);
        return diff !== 0 ? diff : Math.abs(b.drift) - Math.abs(a.drift);
      }),
    [trades],
  );

  const visible = showAll ? sorted : sorted.slice(0, 6);

  const drifted = trades.filter((t) => Math.abs(t.drift) >= DRIFT_THRESHOLD);
  const inRange = trades.filter((t) => Math.abs(t.drift) < DRIFT_THRESHOLD);

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryChip
          label="Target Strategy"
          value={targetLabel}
        />
        <SummaryChip
          label="Assets to Rebalance"
          value={`${drifted.length} / ${trades.length}`}
          valueColor={drifted.length > 0 ? "text-amber-400" : "text-green-400"}
        />
        <SummaryChip
          label="Est. Turnover"
          value={fmt$(totalTurnover)}
        />
        <SummaryChip
          label="Est. Commission"
          value={fmt$(totalCommission)}
          valueColor={totalCommission > 0 ? "text-red-400" : "text-muted-foreground"}
        />
      </div>

      {/* Commission toggle */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-muted-foreground">Commission:</span>
        {(["free", "standard"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setCommissionMode(mode)}
            className={cn(
              "rounded px-2 py-0.5 transition-colors capitalize",
              commissionMode === mode
                ? "bg-primary/15 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {mode === "free" ? "Commission-free" : `Standard (${(COMMISSION_RATE * 100).toFixed(2)}%)`}
          </button>
        ))}
      </div>

      {/* Drift table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Asset", "Current", "Target", "Drift", "Action", "Trade Size"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left font-medium text-muted-foreground first:pl-4 last:pr-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {visible.map((t) => {
              const driftPct = t.currentWeight - t.targetWeight;
              const overweight = driftPct > DRIFT_THRESHOLD;
              const underweight = driftPct < -DRIFT_THRESHOLD;
              const inBand = !overweight && !underweight;

              return (
                <tr
                  key={t.ticker}
                  className={cn(
                    "transition-colors hover:bg-muted/20",
                    t.action === "buy" && "bg-green-500/3",
                    t.action === "sell" && "bg-red-500/3",
                  )}
                >
                  {/* Asset */}
                  <td className="px-3 py-2.5 pl-4 font-mono font-semibold">{t.ticker}</td>

                  {/* Current */}
                  <td className="px-3 py-2.5 tabular-nums">
                    <div className="font-mono">{fmtPct(t.currentWeight)}</div>
                    <WeightBar value={t.currentWeight} color="bg-blue-400" />
                  </td>

                  {/* Target */}
                  <td className="px-3 py-2.5 tabular-nums">
                    <div className="font-mono text-muted-foreground">{fmtPct(t.targetWeight)}</div>
                    <WeightBar value={t.targetWeight} color="bg-muted-foreground/40" />
                  </td>

                  {/* Drift */}
                  <td className="px-3 py-2.5 tabular-nums">
                    <span
                      className={cn(
                        "font-mono font-medium",
                        overweight && "text-red-400",
                        underweight && "text-green-400",
                        inBand && "text-muted-foreground",
                      )}
                    >
                      {fmtPct(driftPct, true)}
                    </span>
                    {inBand && (
                      <span className="ml-1 text-[9px] text-muted-foreground/60">in range</span>
                    )}
                  </td>

                  {/* Action badge */}
                  <td className="px-3 py-2.5">
                    <ActionBadge action={t.action} />
                  </td>

                  {/* Trade size */}
                  <td className="px-3 py-2.5 pr-4 tabular-nums">
                    {t.action !== "hold" ? (
                      <span
                        className={cn(
                          "font-mono font-semibold",
                          t.action === "buy" ? "text-green-400" : "text-red-400",
                        )}
                      >
                        {t.action === "buy" ? "+" : ""}{fmt$(t.tradeValueDollar)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length > 6 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="w-full py-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors border-t border-border"
          >
            {showAll ? "Show less" : `Show all ${sorted.length} positions`}
          </button>
        )}
      </div>

      {/* Cost estimate note */}
      <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-[11px] text-muted-foreground space-y-1">
        <p>
          <span className="font-medium text-foreground">Rebalance summary:</span>{" "}
          {drifted.length === 0
            ? "Portfolio is within target bands. No rebalancing required."
            : `${drifted.length} position${drifted.length !== 1 ? "s" : ""} have drifted beyond the ${(DRIFT_THRESHOLD * 100).toFixed(0)}% threshold.`}
        </p>
        {drifted.length > 0 && (
          <p>
            Estimated total turnover: <span className="font-mono text-foreground">{fmt$(totalTurnover)}</span>
            {totalCommission > 0 && (
              <> with <span className="font-mono text-red-400">{fmt$(totalCommission)}</span> in estimated commissions.</>
            )}
            {totalCommission === 0 && <> (commission-free).</>}
          </p>
        )}
        {inRange.length > 0 && (
          <p>
            {inRange.length} position{inRange.length !== 1 ? "s are" : " is"} within the target band and require no action.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryChip({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={cn("mt-1 text-sm font-semibold font-mono tabular-nums", valueColor ?? "text-foreground")}>
        {value}
      </div>
    </div>
  );
}

function WeightBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="mt-1 h-1 w-20 rounded-full bg-muted overflow-hidden">
      <div
        className={cn("h-full rounded-full", color)}
        style={{ width: `${Math.min(value * 100, 100).toFixed(1)}%` }}
      />
    </div>
  );
}

function ActionBadge({ action }: { action: "buy" | "sell" | "hold" }) {
  return (
    <span
      className={cn(
        "inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        action === "buy" && "bg-green-500/12 text-green-400",
        action === "sell" && "bg-red-500/12 text-red-400",
        action === "hold" && "bg-muted text-muted-foreground",
      )}
    >
      {action}
    </span>
  );
}
