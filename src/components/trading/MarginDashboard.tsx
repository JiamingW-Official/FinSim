"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency, cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const MARGIN_APR = 0.08; // 8% APR on borrowed amount

const HARDCODED_RATES: Record<string, number> = {
  AAPL: 0.5,
  TSLA: 2.1,
  MSFT: 0.3,
  GOOGL: 0.4,
  AMZN: 0.6,
  META: 0.8,
  NVDA: 1.2,
  SPY: 0.25,
  QQQ: 0.3,
  BTC: 3.5,
};

// ─── MetricRow ────────────────────────────────────────────────────────────────

function MetricRow({
  label,
  value,
  warn,
  danger,
}: {
  label: string;
  value: string;
  warn?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col py-0.5">
      <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/35">
        {label}
      </span>
      <span
        className={cn(
          "text-[11px] font-mono tabular-nums font-medium",
          danger
            ? "text-red-400"
            : warn
            ? "text-amber-400"
            : "text-foreground/80",
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function MarginDashboard() {
  const cash = useTradingStore((s) => s.cash);
  const positions = useTradingStore((s) => s.positions);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const marginUsed = useTradingStore((s) => s.marginUsed);
  const borrowRates = useTradingStore((s) => s.borrowRates);
  const accrueMarginInterest = useTradingStore((s) => s.accrueMarginInterest);

  const shortPositions = useMemo(
    () => positions.filter((p) => p.side === "short"),
    [positions],
  );
  const longPositions = useMemo(
    () => positions.filter((p) => p.side === "long"),
    [positions],
  );

  const equity = portfolioValue;

  // Reg-T 2:1 buying power
  const buyingPowerRegT = equity * 2;
  const totalExposure =
    longPositions.reduce((s, p) => s + p.quantity * p.currentPrice, 0) +
    shortPositions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const buyingPowerRemaining = Math.max(0, buyingPowerRegT - totalExposure);

  const shortNotional = shortPositions.reduce(
    (s, p) => s + p.quantity * p.currentPrice,
    0,
  );
  const maintenanceReq = shortNotional * 0.25;
  const isMarginCall = equity < maintenanceReq && shortNotional > 0;

  const borrowedAmount = shortNotional;
  const dailyInterest = borrowedAmount * (MARGIN_APR / 365);

  // Margin ratio: used margin as % of buying power
  const marginRatioPct =
    buyingPowerRegT > 0 ? (marginUsed / buyingPowerRegT) * 100 : 0;

  // Per-position borrow rates for short positions
  const perPositionInterest = useMemo(
    () =>
      shortPositions.map((p) => {
        const rate = borrowRates[p.ticker] ?? HARDCODED_RATES[p.ticker] ?? 1.0;
        const notional = p.quantity * p.currentPrice;
        const daily = notional * (rate / 100 / 365);
        return { ...p, rate, daily };
      }),
    [shortPositions, borrowRates],
  );

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 border-b border-border/40",
          isMarginCall ? "bg-red-500/5" : "bg-muted/10",
        )}
      >
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
          Margin
        </span>
        <div className="flex items-center gap-2">
          {isMarginCall && (
            <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-red-400 uppercase tracking-wide">
              Margin Call
            </span>
          )}
          <span className="text-[9px] font-mono text-muted-foreground/40">
            {(equity > 0 ? totalExposure / equity : 1).toFixed(2)}x lev
          </span>
        </div>
      </div>

      {/* Section 1: Account Overview */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 px-3 py-2 border-b border-border/20">
        <MetricRow label="Equity" value={formatCurrency(equity)} danger={equity < 0} />
        <MetricRow
          label="Buying Power"
          value={formatCurrency(buyingPowerRemaining)}
        />
        <MetricRow
          label="Used Margin"
          value={formatCurrency(marginUsed)}
          warn={marginRatioPct > 30}
          danger={marginRatioPct > 50}
        />
        <MetricRow
          label="Margin Ratio"
          value={`${marginRatioPct.toFixed(1)}%`}
          warn={marginRatioPct > 30}
          danger={marginRatioPct > 50}
        />
        <MetricRow label="Cash" value={formatCurrency(cash)} />
        {dailyInterest > 0 && (
          <MetricRow
            label="Daily Interest"
            value={`${formatCurrency(dailyInterest)}/d`}
            warn
          />
        )}
      </div>

      {/* Section 2: Short Positions — only if any */}
      {perPositionInterest.length > 0 && (
        <div className="px-3 py-2 border-b border-border/20">
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30 block mb-1.5">
            Short Borrow Rates
          </span>
          <div className="space-y-0.5">
            {perPositionInterest.map((p) => (
              <div
                key={p.ticker}
                className="flex items-center justify-between"
              >
                <span className="text-[10px] font-mono text-muted-foreground/60">
                  {p.ticker}
                </span>
                <span className="text-[10px] font-mono tabular-nums text-amber-400/80">
                  {p.rate.toFixed(2)}% APR
                </span>
              </div>
            ))}
          </div>

          {/* Accrue interest button */}
          {shortNotional > 0 && (
            <button
              type="button"
              onClick={accrueMarginInterest}
              className="mt-2 w-full rounded border border-border/30 py-1 text-[10px] font-mono text-muted-foreground/50 hover:text-muted-foreground hover:border-border/60 transition-colors"
            >
              Accrue 1-day ({formatCurrency(dailyInterest)})
            </button>
          )}
        </div>
      )}

      {/* Maintenance warning — only when short positions exist */}
      {maintenanceReq > 0 && (
        <div className="px-3 py-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/30">
              Maint. Req
            </span>
            <span
              className={cn(
                "text-[10px] font-mono tabular-nums",
                isMarginCall ? "text-red-400" : "text-muted-foreground/50",
              )}
            >
              {formatCurrency(maintenanceReq)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
