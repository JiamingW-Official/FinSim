"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Kelly Criterion Calculator ─────────────────────────────────────────────────
// K = (b*p - q) / b
// where b = decimal odds - 1, p = win rate (0-1), q = 1 - p

function computeKelly(winRate: number, odds: number): number | null {
  const p = winRate / 100;
  const q = 1 - p;
  const b = odds - 1;
  if (b <= 0) return null;
  const k = (b * p - q) / b;
  return k;
}

// ── Bankroll bar ──────────────────────────────────────────────────────────────

function BankrollBar({
  fraction,
  label,
  color,
  danger,
}: {
  fraction: number; // 0-1
  label: string;
  color: string;
  danger?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, fraction * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[9px] font-mono text-muted-foreground/35">{label}</span>
        <span
          className={cn(
            "text-[10px] font-mono font-semibold tabular-nums",
            danger ? "text-rose-400" : color,
          )}
        >
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            danger
              ? "bg-rose-500/50"
              : color === "text-emerald-400"
              ? "bg-emerald-500/50"
              : color === "text-primary"
              ? "bg-primary/50"
              : "bg-amber-500/50",
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function KellyCalculator() {
  const [edge, setEdge] = useState<string>("10");
  const [winRate, setWinRate] = useState<string>("55");
  const [odds, setOdds] = useState<string>("2.0");

  const edgeNum = parseFloat(edge) || 0;
  const winRateNum = parseFloat(winRate) || 0;
  const oddsNum = parseFloat(odds) || 0;

  const kelly = useMemo(() => {
    if (winRateNum <= 0 || winRateNum >= 100 || oddsNum <= 1) return null;
    return computeKelly(winRateNum, oddsNum);
  }, [winRateNum, oddsNum]);

  const fullKelly = kelly !== null ? Math.max(0, kelly) : null;
  const halfKelly = fullKelly !== null ? fullKelly / 2 : null;
  const quarterKelly = fullKelly !== null ? fullKelly / 4 : null;

  const isOverbetting = fullKelly !== null && fullKelly > 0.25;
  const isNegativeEdge = fullKelly !== null && fullKelly <= 0;

  const ev = useMemo(() => {
    if (winRateNum <= 0 || oddsNum <= 1) return null;
    const p = winRateNum / 100;
    const q = 1 - p;
    const b = oddsNum - 1;
    return p * b - q;
  }, [winRateNum, oddsNum]);

  // suppress unused warning
  void edgeNum;

  return (
    <div className="space-y-3">
      {/* Input grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {/* Win Rate */}
        <div className="rounded-xl border border-border/20 bg-card/30 p-3">
          <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/35">
            Win Rate (%)
          </label>
          <input
            type="number"
            min={1}
            max={99}
            step={1}
            value={winRate}
            onChange={(e) => setWinRate(e.target.value)}
            placeholder="55"
            className="w-full rounded border border-border/20 bg-transparent px-2 py-1 text-[11px] font-mono text-foreground/80 placeholder-muted-foreground/30 outline-none focus:border-primary/30"
          />
          <div className="mt-1 text-[9px] font-mono text-muted-foreground/30">
            Probability 1–99
          </div>
        </div>

        {/* Decimal Odds */}
        <div className="rounded-xl border border-border/20 bg-card/30 p-3">
          <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/35">
            Decimal Odds
          </label>
          <input
            type="number"
            min={1.01}
            step={0.1}
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
            placeholder="2.0"
            className="w-full rounded border border-border/20 bg-transparent px-2 py-1 text-[11px] font-mono text-foreground/80 placeholder-muted-foreground/30 outline-none focus:border-primary/30"
          />
          <div className="mt-1 text-[9px] font-mono text-muted-foreground/30">
            2.0 = even, 3.0 = 2:1
          </div>
        </div>

        {/* Edge */}
        <div className="rounded-xl border border-border/20 bg-card/30 p-3">
          <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/35">
            Edge (%)
          </label>
          <input
            type="number"
            min={-100}
            max={100}
            step={0.5}
            value={edge}
            onChange={(e) => setEdge(e.target.value)}
            placeholder="10"
            className="w-full rounded border border-border/20 bg-transparent px-2 py-1 text-[11px] font-mono text-foreground/80 placeholder-muted-foreground/30 outline-none focus:border-primary/30"
          />
          <div className="mt-1 text-[9px] font-mono text-muted-foreground/30">
            Estimated advantage
          </div>
        </div>
      </div>

      {/* Formula reminder */}
      <div className="rounded-lg border border-border/20 bg-card/30 px-3 py-2">
        <div className="flex items-center gap-1.5 text-muted-foreground/35">
          <Info className="h-3 w-3 shrink-0" />
          <span className="text-[9px] font-mono">
            K = (b&times;p &minus; q) / b &nbsp;|&nbsp; b = odds&minus;1,
            p = win rate, q = 1&minus;p
          </span>
        </div>
      </div>

      {/* No result state */}
      {fullKelly === null && (
        <div className="flex h-20 items-center justify-center rounded-xl border border-border/20 bg-card/30 text-[9px] font-mono text-muted-foreground/35">
          Enter valid win rate (1–99) and decimal odds (&gt;1) to calculate.
        </div>
      )}

      {/* Results */}
      {fullKelly !== null && (
        <div className="space-y-3">
          {/* Negative edge warning */}
          {isNegativeEdge && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-[9px] font-mono text-rose-400/70">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>
                Negative edge. Kelly says bet 0% — no mathematical advantage.
              </span>
            </div>
          )}

          {/* Overbetting warning */}
          {isOverbetting && !isNegativeEdge && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[9px] font-mono text-amber-400/70">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>
                Full Kelly &gt;25% — high variance. Cap at Half or Quarter Kelly.
              </span>
            </div>
          )}

          {/* Kelly result — large display */}
          <div className="rounded-xl border border-border/20 bg-card/30 p-3">
            <div className="mb-0.5 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
              Full Kelly Fraction
            </div>
            <div
              className={cn(
                "text-[20px] font-mono font-bold tabular-nums",
                isNegativeEdge
                  ? "text-rose-400"
                  : isOverbetting
                  ? "text-amber-400"
                  : "text-emerald-400",
              )}
            >
              {fullKelly > 0
                ? `${(fullKelly * 100).toFixed(1)}%`
                : "0%"}
            </div>
            <div className="mt-2.5 space-y-2">
              <BankrollBar
                fraction={fullKelly}
                label="Full Kelly"
                color="text-emerald-400"
                danger={isOverbetting}
              />
              {halfKelly !== null && (
                <BankrollBar
                  fraction={halfKelly}
                  label="Half Kelly (recommended)"
                  color="text-primary"
                  danger={false}
                />
              )}
              {quarterKelly !== null && (
                <BankrollBar
                  fraction={quarterKelly}
                  label="Quarter Kelly (conservative)"
                  color="text-amber-400"
                  danger={false}
                />
              )}
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetricChip
              label="Full Kelly"
              value={
                fullKelly > 0
                  ? `${(fullKelly * 100).toFixed(1)}%`
                  : "0%"
              }
              highlight={!isNegativeEdge && !isOverbetting}
            />
            <MetricChip
              label="Half Kelly"
              value={
                halfKelly !== null && halfKelly > 0
                  ? `${(halfKelly * 100).toFixed(1)}%`
                  : "0%"
              }
            />
            <MetricChip
              label="Quarter Kelly"
              value={
                quarterKelly !== null && quarterKelly > 0
                  ? `${(quarterKelly * 100).toFixed(1)}%`
                  : "0%"
              }
            />
            <MetricChip
              label="EV / unit"
              value={
                ev !== null
                  ? `${ev >= 0 ? "+" : ""}${(ev * 100).toFixed(1)}%`
                  : "--"
              }
              positive={ev !== null && ev > 0}
              negative={ev !== null && ev < 0}
            />
          </div>

          {/* Educational note */}
          <div className="rounded-xl border border-border/20 bg-card/30 px-3 py-2.5 text-[9px] font-mono leading-relaxed text-muted-foreground/40">
            <span className="font-semibold text-foreground/60">Kelly Criterion</span>{" "}
            maximizes log-growth of wealth over time. Full Kelly is theoretically
            optimal but causes high variance. Half Kelly retains ~75% of growth
            with smoother results. Quarter Kelly suits uncertain edge estimates.
          </div>
        </div>
      )}
    </div>
  );
}

// ── MetricChip ────────────────────────────────────────────────────────────────

function MetricChip({
  label,
  value,
  highlight,
  positive,
  negative,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-2",
        highlight
          ? "border-primary/20 bg-primary/5"
          : "border-border/20 bg-card/30",
      )}
    >
      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 mb-1">
        {label}
      </div>
      <div
        className={cn(
          "text-[13px] font-mono font-semibold tabular-nums",
          positive
            ? "text-emerald-400"
            : negative
            ? "text-rose-400"
            : highlight
            ? "text-primary"
            : "text-foreground/80",
        )}
      >
        {value}
      </div>
    </div>
  );
}
