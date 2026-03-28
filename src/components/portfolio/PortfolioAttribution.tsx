"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Attribution {
  ticker: string;
  weight: number;
  pnl: number;
  pnlPct: number;
  contribution: number; // weight * pnl%
}

// ─── Sector / factor data ─────────────────────────────────────────────────────

const TICKER_META: Record<string, { sector: string; style: "growth" | "value" | "blend" }> = {
  AAPL: { sector: "Technology",       style: "growth" },
  MSFT: { sector: "Technology",       style: "growth" },
  GOOG: { sector: "Communication",    style: "growth" },
  AMZN: { sector: "Consumer Disc.",   style: "growth" },
  NVDA: { sector: "Technology",       style: "growth" },
  TSLA: { sector: "Consumer Disc.",   style: "growth" },
  JPM:  { sector: "Financials",       style: "value"  },
  JNJ:  { sector: "Healthcare",       style: "value"  },
  KO:   { sector: "Consumer Stapl.",  style: "value"  },
  T:    { sector: "Communication",    style: "value"  },
  META: { sector: "Communication",    style: "growth" },
  BRK:  { sector: "Financials",       style: "value"  },
  XOM:  { sector: "Energy",           style: "value"  },
  WMT:  { sector: "Consumer Stapl.",  style: "blend"  },
  SPY:  { sector: "Diversified",      style: "blend"  },
  QQQ:  { sector: "Diversified",      style: "growth" },
  BND:  { sector: "Fixed Income",     style: "blend"  },
};

function getMeta(ticker: string) {
  return TICKER_META[ticker] ?? { sector: "Other", style: "blend" as const };
}

// ─── Attribution Bar ──────────────────────────────────────────────────────────

function AttributionBar({ contribution, max }: { contribution: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (Math.abs(contribution) / max) * 100) : 0;
  const isPos = contribution >= 0;
  return (
    <div className="flex items-center gap-1">
      <div className="relative w-20 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="absolute left-1/2 top-0 w-px h-full bg-muted-foreground/20" />
        {isPos ? (
          <div
            className="absolute h-full bg-emerald-500 rounded-r-full"
            style={{ left: "50%", width: `${pct / 2}%` }}
          />
        ) : (
          <div
            className="absolute h-full bg-red-500 rounded-l-full"
            style={{ right: "50%", width: `${pct / 2}%` }}
          />
        )}
      </div>
      <span
        className={cn(
          "font-mono tabular-nums text-[10px] w-12 text-right",
          isPos ? "text-emerald-400" : "text-red-400"
        )}
      >
        {isPos ? "+" : ""}{contribution.toFixed(2)}%
      </span>
    </div>
  );
}

// ─── Sector Exposure Bar ──────────────────────────────────────────────────────

const SECTOR_COLORS: Record<string, string> = {
  "Technology":      "#3b82f6",
  "Communication":   "#8b5cf6",
  "Consumer Disc.":  "#f59e0b",
  "Consumer Stapl.": "#10b981",
  "Financials":      "#06b6d4",
  "Healthcare":      "#ec4899",
  "Energy":          "#f97316",
  "Fixed Income":    "#84cc16",
  "Diversified":     "#6366f1",
  "Other":           "#6b7280",
};

function SectorExposureBar({ sectors }: { sectors: Record<string, number> }) {
  const total = Object.values(sectors).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const entries = Object.entries(sectors)
    .map(([name, value]) => ({ name, pct: (value / total) * 100 }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="space-y-2">
      <div className="flex h-5 rounded-md overflow-hidden gap-px">
        {entries.map((e) => (
          <div
            key={e.name}
            style={{ width: `${e.pct}%`, backgroundColor: SECTOR_COLORS[e.name] ?? "#6b7280" }}
            title={`${e.name}: ${e.pct.toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {entries.map((e) => (
          <div key={e.name} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ backgroundColor: SECTOR_COLORS[e.name] ?? "#6b7280" }}
            />
            <span className="text-[10px] text-muted-foreground">
              {e.name} {e.pct.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Factor Exposure Gauges ───────────────────────────────────────────────────

function FactorGauge({ label, value }: { label: string; value: number }) {
  // value 0-100 representing the factor tilt
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary/70 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PortfolioAttribution() {
  const positions = useTradingStore((s) => s.positions);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);

  const attributions = useMemo<Attribution[]>(() => {
    if (positions.length === 0) return [];
    const posValue = positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
    return positions
      .map((p) => {
        const value = p.currentPrice * p.quantity;
        const weight = posValue > 0 ? value / posValue : 0;
        return {
          ticker: p.ticker,
          weight,
          pnl: p.unrealizedPnL,
          pnlPct: p.unrealizedPnLPercent,
          contribution: weight * p.unrealizedPnLPercent,
        };
      })
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  }, [positions]);

  const maxContrib = useMemo(
    () => Math.max(...attributions.map((a) => Math.abs(a.contribution)), 0.01),
    [attributions]
  );

  // Sector exposure
  const sectorMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    positions.forEach((p) => {
      const sector = getMeta(p.ticker).sector;
      const value = p.currentPrice * p.quantity;
      map[sector] = (map[sector] ?? 0) + value;
    });
    return map;
  }, [positions]);

  // Factor exposure
  const factorExposure = useMemo(() => {
    if (positions.length === 0) return { growth: 0, value: 0, blend: 0 };
    const counts = { growth: 0, value: 0, blend: 0 };
    positions.forEach((p) => {
      counts[getMeta(p.ticker).style]++;
    });
    const total = positions.length;
    return {
      growth: (counts.growth / total) * 100,
      value: (counts.value / total) * 100,
      blend: (counts.blend / total) * 100,
    };
  }, [positions]);

  if (positions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-semibold mb-3">Portfolio Attribution</p>
        <p className="text-xs text-muted-foreground py-8 text-center">
          No open positions. Buy stocks to see attribution analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Portfolio Attribution</h3>
        <span className="text-[10px] text-muted-foreground">{positions.length} positions</span>
      </div>

      {/* Return contribution table */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">Return Contribution</p>
        <div className="space-y-0">
          <div className="grid grid-cols-[56px_1fr_48px_80px] gap-1 text-[10px] text-muted-foreground border-b pb-1 mb-1">
            <span>Ticker</span>
            <span className="text-right pr-2">Weight</span>
            <span className="text-right">P&L%</span>
            <span className="text-right pr-0">Contribution</span>
          </div>
          {attributions.map((a) => (
            <div
              key={a.ticker}
              className="grid grid-cols-[56px_1fr_48px_80px] gap-1 items-center py-1 border-b border-muted/30"
            >
              <span className="text-xs font-semibold">{a.ticker}</span>
              <div className="pr-2">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500/60"
                    style={{ width: `${(a.weight * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">{(a.weight * 100).toFixed(1)}%</span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono text-right",
                  a.pnlPct >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {a.pnlPct >= 0 ? "+" : ""}{a.pnlPct.toFixed(1)}%
              </span>
              <div className="flex justify-end">
                <AttributionBar contribution={a.contribution} max={maxContrib} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector exposure */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">Sector Exposure</p>
        {Object.keys(sectorMap).length > 0 ? (
          <SectorExposureBar sectors={sectorMap} />
        ) : (
          <p className="text-xs text-muted-foreground">No sector data available.</p>
        )}
      </div>

      {/* Geographic exposure */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">Geographic Exposure</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-muted">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }} />
          </div>
          <div className="flex gap-3 text-[10px]">
            <span className="text-blue-400 font-medium">US 100%</span>
            <span className="text-muted-foreground">Intl 0%</span>
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground mt-1">All holdings are US-listed equities.</p>
      </div>

      {/* Factor exposure */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">Factor Exposure</p>
        <div className="space-y-2">
          <FactorGauge label="Growth" value={factorExposure.growth} />
          <FactorGauge label="Value" value={factorExposure.value} />
          <FactorGauge label="Blend" value={factorExposure.blend} />
        </div>
        <p className="text-[9px] text-muted-foreground mt-1">
          Based on style classification of held tickers.
        </p>
      </div>
    </div>
  );
}
