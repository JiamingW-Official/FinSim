"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Star, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

// ── mulberry32 PRNG (same seed pattern as codebase) ──────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSparkline(seed: number, length = 30): number[] {
  const rand = mulberry32(seed);
  const values: number[] = [100];
  for (let i = 1; i < length; i++) {
    const delta = (rand() - 0.48) * 3;
    values.push(Math.max(80, Math.min(130, values[i - 1] + delta)));
  }
  return values;
}

// ── Types ────────────────────────────────────────────────────────────────────

export type AssetClass =
  | "real-estate"
  | "t-bills"
  | "corporate-bonds"
  | "commodities"
  | "private-equity"
  | "infrastructure";

export interface TokenizedAsset {
  id: string;
  name: string;
  ticker: string;
  assetClass: AssetClass;
  tokenPrice: number;
  apyMin: number;
  apyMax: number;
  apy: number;          // current
  liquidityScore: number; // 1-5
  minInvestment: number;
  isIlliquid?: boolean;
  description: string;
  sparklineSeed: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CLASS_LABELS: Record<AssetClass, string> = {
  "real-estate": "Real Estate",
  "t-bills": "T-Bills",
  "corporate-bonds": "Corp Bonds",
  "commodities": "Commodities",
  "private-equity": "Private Equity",
  "infrastructure": "Infrastructure",
};

const CLASS_COLORS: Record<AssetClass, string> = {
  "real-estate": "bg-blue-500/10 text-blue-400",
  "t-bills": "bg-green-500/10 text-green-400",
  "corporate-bonds": "bg-amber-500/10 text-amber-400",
  "commodities": "bg-orange-500/10 text-orange-400",
  "private-equity": "bg-purple-500/10 text-purple-400",
  "infrastructure": "bg-teal-500/10 text-teal-400",
};

// ── Mini SVG sparkline ────────────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
  const w = 72;
  const h = 24;
  const pad = 1;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
      const y = pad + (1 - (v - min) / range) * (h - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const trend = data[data.length - 1] - data[0];
  const stroke = trend >= 0 ? "#22c55e" : "#ef4444";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Liquidity stars ───────────────────────────────────────────────────────────

function LiquidityStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-2.5 w-2.5",
            i < score ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TokenizedAssetCardProps {
  asset: TokenizedAsset;
  holding?: number; // tokens held
  onBuy: (asset: TokenizedAsset) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TokenizedAssetCard({
  asset,
  holding = 0,
  onBuy,
}: TokenizedAssetCardProps) {
  const [expanded, setExpanded] = useState(false);

  const sparklineData = useMemo(
    () => generateSparkline(asset.sparklineSeed),
    [asset.sparklineSeed],
  );

  const trend30d = useMemo(() => {
    const d = sparklineData;
    return ((d[d.length - 1] - d[0]) / d[0]) * 100;
  }, [sparklineData]);

  const holdingValue = holding * asset.tokenPrice;

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/70 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-medium",
                CLASS_COLORS[asset.assetClass],
              )}
            >
              {CLASS_LABELS[asset.assetClass]}
            </span>
            {asset.isIlliquid && (
              <span className="flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                <Lock className="h-2.5 w-2.5" />
                Illiquid
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold leading-tight text-foreground truncate">
            {asset.name}
          </h3>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {asset.ticker}
          </p>
        </div>
        <Sparkline data={sparklineData} />
      </div>

      {/* Price + APY row */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">
            Token Price
          </p>
          <p className="text-xs font-bold tabular-nums font-mono text-foreground">
            ${asset.tokenPrice.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">
            APY
          </p>
          <p className="text-xs font-bold tabular-nums font-mono text-green-400">
            {asset.apy.toFixed(1)}%
          </p>
          <p className="text-[9px] text-muted-foreground">
            {asset.apyMin}–{asset.apyMax}% range
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">
            30d Return
          </p>
          <p
            className={cn(
              "text-xs font-bold tabular-nums font-mono",
              trend30d >= 0 ? "text-green-400" : "text-red-400",
            )}
          >
            {trend30d >= 0 ? "+" : ""}
            {trend30d.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Liquidity + Min Investment */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[9px] text-muted-foreground">Liquidity</p>
          <LiquidityStars score={asset.liquidityScore} />
        </div>
        <div className="text-right">
          <p className="text-[9px] text-muted-foreground">Min. Investment</p>
          <p className="text-[11px] font-semibold tabular-nums font-mono">
            ${asset.minInvestment.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Holding badge (if any) */}
      {holding > 0 && (
        <div className="rounded-md bg-primary/8 border border-primary/20 px-2.5 py-1.5 flex items-center justify-between">
          <span className="text-[10px] text-primary font-medium">Your position</span>
          <span className="text-[10px] font-mono tabular-nums text-foreground">
            {holding} tokens · ${holdingValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      )}

      {/* Expandable description */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors -mt-1"
      >
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        Details
      </button>

      {expanded && (
        <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 pt-2 -mt-1">
          {asset.description}
        </p>
      )}

      {/* Buy button */}
      <button
        onClick={() => onBuy(asset)}
        className="mt-auto w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        Buy {asset.ticker}
      </button>
    </div>
  );
}
