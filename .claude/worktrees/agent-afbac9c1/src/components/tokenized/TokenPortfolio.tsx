"use client";

import { useMemo } from "react";
import { PieChart, TrendingUp, Percent, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TokenizedAsset, AssetClass } from "./TokenizedAssetCard";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Holding {
  assetId: string;
  tokens: number;
}

interface TokenPortfolioProps {
  assets: TokenizedAsset[];
  holdings: Holding[];
  onSell: (assetId: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CLASS_COLORS_HEX: Record<AssetClass, string> = {
  "real-estate": "#3b82f6",
  "t-bills": "#22c55e",
  "corporate-bonds": "#f59e0b",
  "commodities": "#f97316",
  "private-equity": "#a855f7",
  "infrastructure": "#14b8a6",
};

const CLASS_LABELS: Record<AssetClass, string> = {
  "real-estate": "Real Estate",
  "t-bills": "T-Bills",
  "corporate-bonds": "Corp Bonds",
  "commodities": "Commodities",
  "private-equity": "Private Equity",
  "infrastructure": "Infrastructure",
};

function formatUSD(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

// ── Mini donut SVG ────────────────────────────────────────────────────────────

function DonutChart({
  slices,
}: {
  slices: { color: string; pct: number; label: string }[];
}) {
  const cx = 50;
  const cy = 50;
  const r = 36;
  const stroke = 14;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs = slices.map((s) => {
    const dash = (s.pct / 100) * circumference;
    const gap = circumference - dash;
    const arc = { ...s, dash, gap, offset };
    offset += dash;
    return arc;
  });

  return (
    <svg viewBox="0 0 100 100" className="w-full max-w-[120px] mx-auto">
      {/* Background ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-muted/30"
      />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={-arc.offset}
          strokeLinecap="butt"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      ))}
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TokenPortfolio({
  assets,
  holdings,
  onSell,
}: TokenPortfolioProps) {
  const enriched = useMemo(() => {
    return holdings
      .map((h) => {
        const asset = assets.find((a) => a.id === h.assetId);
        if (!asset || h.tokens === 0) return null;
        const value = h.tokens * asset.tokenPrice;
        const annualYield = value * (asset.apy / 100);
        return { ...h, asset, value, annualYield };
      })
      .filter(Boolean) as {
        assetId: string;
        tokens: number;
        asset: TokenizedAsset;
        value: number;
        annualYield: number;
      }[];
  }, [assets, holdings]);

  const totalValue = useMemo(
    () => enriched.reduce((s, h) => s + h.value, 0),
    [enriched],
  );

  const totalAnnualYield = useMemo(
    () => enriched.reduce((s, h) => s + h.annualYield, 0),
    [enriched],
  );

  const weightedAPY = totalValue > 0 ? (totalAnnualYield / totalValue) * 100 : 0;

  // Diversification: unique asset classes / 6
  const uniqueClasses = useMemo(
    () => new Set(enriched.map((h) => h.asset.assetClass)).size,
    [enriched],
  );
  const diversificationScore = Math.round((uniqueClasses / 6) * 100);

  // Class breakdown for donut
  const classBreakdown = useMemo(() => {
    const map = new Map<AssetClass, number>();
    for (const h of enriched) {
      map.set(h.asset.assetClass, (map.get(h.asset.assetClass) ?? 0) + h.value);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cls, val]) => ({
        label: CLASS_LABELS[cls],
        color: CLASS_COLORS_HEX[cls],
        pct: totalValue > 0 ? (val / totalValue) * 100 : 0,
        value: val,
      }));
  }, [enriched, totalValue]);

  if (enriched.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center gap-2 text-center">
        <PieChart className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No holdings yet</p>
        <p className="text-xs text-muted-foreground max-w-[260px]">
          Purchase tokenized assets from the marketplace to build your RWA portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Token Portfolio</h2>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {enriched.length} position{enriched.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md bg-muted/30 p-2.5 text-center">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">
            Total Value
          </p>
          <p className="text-xs font-bold tabular-nums font-mono text-foreground">
            {formatUSD(totalValue)}
          </p>
        </div>
        <div className="rounded-md bg-muted/30 p-2.5 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-0.5">
            <Percent className="h-2.5 w-2.5 text-green-400" />
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
              Wtd APY
            </p>
          </div>
          <p className="text-xs font-bold tabular-nums font-mono text-green-400">
            {weightedAPY.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-md bg-muted/30 p-2.5 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-0.5">
            <LayoutGrid className="h-2.5 w-2.5 text-primary" />
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
              Divers.
            </p>
          </div>
          <p className="text-xs font-bold tabular-nums font-mono text-primary">
            {diversificationScore}%
          </p>
        </div>
      </div>

      {/* Annual yield callout */}
      <div className="rounded-md bg-green-500/8 border border-green-500/20 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-green-400" />
          <span className="text-[11px] text-muted-foreground">Est. Annual Yield</span>
        </div>
        <span className="text-sm font-bold tabular-nums font-mono text-green-400">
          +{formatUSD(totalAnnualYield)}
        </span>
      </div>

      {/* Allocation donut + legend */}
      {classBreakdown.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="w-[80px] shrink-0">
            <DonutChart slices={classBreakdown} />
          </div>
          <div className="flex-1 space-y-1.5">
            {classBreakdown.map((c) => (
              <div key={c.label} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-[10px] text-muted-foreground flex-1 truncate">
                  {c.label}
                </span>
                <span className="text-[10px] font-mono tabular-nums text-foreground shrink-0">
                  {c.pct.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holdings table */}
      <div className="border-t border-border/40 pt-3 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Positions
        </p>
        {enriched.map((h) => (
          <div
            key={h.assetId}
            className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/20 transition-colors"
          >
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: CLASS_COLORS_HEX[h.asset.assetClass] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate">
                {h.asset.name}
              </p>
              <p className="text-[9px] text-muted-foreground font-mono">
                {h.tokens} tokens · {h.asset.apy.toFixed(1)}% APY
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] font-mono tabular-nums font-semibold text-foreground">
                {formatUSD(h.value)}
              </p>
              <p className="text-[9px] text-green-400 font-mono tabular-nums">
                +{formatUSD(h.annualYield)}/yr
              </p>
            </div>
            <button
              onClick={() => onSell(h.assetId)}
              className={cn(
                "text-[10px] text-muted-foreground hover:text-red-400 transition-colors shrink-0 px-1.5 py-0.5 rounded hover:bg-red-500/10",
                h.asset.isIlliquid && "opacity-40 pointer-events-none",
              )}
              title={h.asset.isIlliquid ? "Illiquid — cannot sell" : "Sell position"}
            >
              {h.asset.isIlliquid ? "Locked" : "Sell"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
