"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type Leverage = 2 | 5 | 10;

const LEVERAGE_OPTIONS: { label: string; value: Leverage }[] = [
  { label: "2x", value: 2 },
  { label: "5x", value: 5 },
  { label: "10x", value: 10 },
];

const MOVE_LEVELS = [-30, -20, -10, 10, 20, 30] as const;

function InputField({
  label,
  prefix,
  suffix,
  value,
  onChange,
  min,
  max,
  step,
  isFloat,
}: {
  label: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  isFloat?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <div className="flex items-center gap-1 rounded-md border bg-background px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-[#2d9cdb]/60">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) =>
            onChange(isFloat ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)
          }
          min={min}
          max={max}
          step={step}
          aria-label={label}
          className="w-full bg-transparent text-sm font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(isFloat ? parseFloat(e.target.value) : parseInt(e.target.value))}
        min={min}
        max={max}
        step={step}
        aria-label={`${label} slider`}
        className="w-full h-1 accent-[#2d9cdb]"
      />
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
  large,
}: {
  label: string;
  value: string;
  color?: string;
  large?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-center">
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className={cn("font-bold tabular-nums", large ? "text-xl" : "text-sm", color)}>
        {value}
      </div>
    </div>
  );
}

export function MarginCalculator() {
  const [positionSize, setPositionSize] = useState(10000);
  const [leverage, setLeverage] = useState<Leverage>(2);
  const [entryPrice, setEntryPrice] = useState(100);

  const calc = useMemo(() => {
    const marginRequired = positionSize / leverage;
    // Liquidation when equity = 0 → price moves by (margin / position) against you
    // For a long: liqPrice = entry * (1 - 1/leverage)
    const liqPrice = entryPrice * (1 - 1 / leverage);
    const shares = positionSize / entryPrice;

    const scenarios = MOVE_LEVELS.map((pct) => {
      const exitPrice = entryPrice * (1 + pct / 100);
      const rawPnl = (exitPrice - entryPrice) * shares;
      // Capped at margin lost (can't lose more than your margin)
      const pnl = Math.max(rawPnl, -marginRequired);
      const pnlPct = (pnl / marginRequired) * 100;
      return { pct, exitPrice, pnl, pnlPct };
    });

    return { marginRequired, liqPrice, shares, scenarios };
  }, [positionSize, leverage, entryPrice]);

  const formatCurr = (v: number) =>
    v >= 10000
      ? `$${(v / 1000).toFixed(1)}K`
      : `$${Math.abs(v).toFixed(2)}`;

  const isHighLeverage = leverage > 5;

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      {/* Leverage selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">Leverage:</span>
        <div className="flex gap-1">
          {LEVERAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLeverage(opt.value)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors border",
                leverage === opt.value
                  ? opt.value > 5
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-[#2d9cdb] text-white border-[#2d9cdb]"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-[#2d9cdb]/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {isHighLeverage && (
          <span className="text-xs font-medium text-red-500 border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded">
            High risk — liquidation likely on small moves
          </span>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <InputField
          label="Position Size"
          prefix="$"
          value={positionSize}
          onChange={setPositionSize}
          min={100}
          max={1_000_000}
          step={500}
        />
        <InputField
          label="Entry Price"
          prefix="$"
          value={entryPrice}
          onChange={setEntryPrice}
          min={1}
          max={10000}
          step={1}
          isFloat
        />
        <div className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-center">
          <div className="text-[10px] text-muted-foreground mb-1">Shares / Units</div>
          <div className="text-sm font-bold tabular-nums">
            {calc.shares.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatChip
          label="Margin Required"
          value={`$${calc.marginRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          color="text-[#2d9cdb]"
          large
        />
        <StatChip
          label="Liquidation Price"
          value={`$${calc.liqPrice.toFixed(2)}`}
          color="text-red-500"
        />
        <StatChip
          label="Distance to Liq."
          value={`${((1 - calc.liqPrice / entryPrice) * 100).toFixed(1)}% drop`}
          color={isHighLeverage ? "text-red-500" : "text-amber-500"}
        />
      </div>

      {/* P&L scenarios table */}
      <div className="rounded-lg border bg-muted/20 overflow-hidden">
        <div className="px-4 pt-3 pb-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          P&L Scenarios (Long Position)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Price Move</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Exit Price</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">P&L ($)</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">P&L on Margin</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {calc.scenarios.map((s) => {
                const isLiq = s.pnl <= -calc.marginRequired * 0.99 && s.pct < 0;
                const barPct = Math.min(Math.abs(s.pnlPct), 200) / 2;
                return (
                  <tr key={s.pct} className="border-b border-border/20 last:border-0">
                    <td className="px-4 py-2 font-semibold tabular-nums">
                      <span className={s.pct > 0 ? "text-emerald-400" : "text-red-400"}>
                        {s.pct > 0 ? "+" : ""}{s.pct}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-foreground">
                      ${s.exitPrice.toFixed(2)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 text-right tabular-nums font-semibold",
                        s.pnl >= 0 ? "text-emerald-400" : "text-red-500"
                      )}
                    >
                      {isLiq ? "LIQUIDATED" : `${s.pnl >= 0 ? "+" : ""}$${Math.abs(s.pnl).toFixed(0)}`}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 text-right tabular-nums",
                        s.pnlPct >= 0 ? "text-emerald-400" : "text-red-500"
                      )}
                    >
                      {isLiq ? "—" : `${s.pnlPct >= 0 ? "+" : ""}${s.pnlPct.toFixed(0)}%`}
                    </td>
                    <td className="px-4 py-2 w-24">
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            s.pnl >= 0 ? "bg-emerald-500" : "bg-red-500"
                          )}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning / insight */}
      <div
        className={cn(
          "rounded-lg border px-4 py-3 text-sm",
          isHighLeverage
            ? "border-red-500/30 bg-red-500/5 text-red-400"
            : "border-border/40 bg-muted/10 text-muted-foreground"
        )}
      >
        {isHighLeverage ? (
          <>
            <span className="font-semibold text-red-500">Warning: {leverage}x leverage.</span>{" "}
            Your position liquidates after only a{" "}
            <span className="font-semibold">
              {((1 - calc.liqPrice / entryPrice) * 100).toFixed(1)}% adverse move
            </span>
            . A single bad day can wipe out your entire margin.
          </>
        ) : (
          <>
            With {leverage}x leverage, you control{" "}
            <span className="font-semibold text-foreground">${positionSize.toLocaleString()}</span>{" "}
            with only{" "}
            <span className="font-semibold text-foreground">
              ${calc.marginRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>{" "}
            of your own capital. Gains and losses are amplified {leverage}x relative to your margin.
          </>
        )}
      </div>
    </div>
  );
}
