"use client";

import { motion } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";
import type { StrategyRecommendation } from "@/types/options";

interface StrategyRecommendationCardProps {
  rec: StrategyRecommendation;
  spotPrice: number;
  onSelect: (rec: StrategyRecommendation) => void;
}

const SENTIMENT_STYLES = {
  bullish: "bg-emerald-500/10 text-emerald-400",
  bearish: "bg-red-500/10 text-red-400",
  neutral: "bg-muted-foreground/10 text-muted-foreground",
  volatile: "bg-orange-500/10 text-orange-400",
} as const;

function formatPnlLabel(value: number | "unlimited"): string {
  if (value === "unlimited") return "Unlimited";
  return formatCurrency(value);
}

export function StrategyRecommendationCard({
  rec,
  spotPrice,
  onSelect,
}: StrategyRecommendationCardProps) {
  const { preset, miniPayoff, probabilityOfProfit, returnOnRisk, maxProfit, maxLoss, breakevens } =
    rec;

  // SVG payoff chart calculations
  const hasMiniPayoff = miniPayoff.length >= 2;

  let svgPath = "";
  let fillAbove = "";
  let fillBelow = "";
  let zeroY = 25; // fallback midpoint

  if (hasMiniPayoff) {
    const xValues = miniPayoff.map((p) => p.x);
    const yValues = miniPayoff.map((p) => p.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const yRange = maxY - minY || 1;
    const xRange = maxX - minX || 1;

    const toSvgX = (x: number) => ((x - minX) / xRange) * 200;
    const toSvgY = (y: number) => 45 - ((y - minY) / yRange) * 40;

    zeroY = toSvgY(0);

    const pts = miniPayoff.map((p) => ({ sx: toSvgX(p.x), sy: toSvgY(p.y) }));

    // Build polyline points string
    const polyPts = pts.map((p) => `${p.sx},${p.sy}`).join(" ");
    svgPath = polyPts;

    // Fill polygons: above zero = green, below zero = red
    // Above-zero fill: clip to y <= zeroY region
    const abovePts: string[] = [];
    const belowPts: string[] = [];

    // Build a closed polygon for the area under the payoff line
    // We'll create two separate polygons for above and below zero
    abovePts.push(`0,${zeroY}`);
    belowPts.push(`0,${zeroY}`);

    for (const p of pts) {
      abovePts.push(`${p.sx},${p.sy}`);
      belowPts.push(`${p.sx},${p.sy}`);
    }

    abovePts.push(`200,${zeroY}`);
    belowPts.push(`200,${zeroY}`);

    fillAbove = abovePts.join(" ");
    fillBelow = belowPts.join(" ");
  }

  // PnL color for Prob of Profit
  const popColor =
    probabilityOfProfit > 50
      ? "text-emerald-400"
      : probabilityOfProfit < 40
        ? "text-red-400"
        : "text-amber-400";

  // Return on risk display
  const rorDisplay =
    maxProfit === "unlimited" || maxLoss === "unlimited"
      ? "∞:1"
      : `${returnOnRisk.toFixed(1)}:1`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(rec)}
      className="rounded-lg border border-border/50 bg-card p-2.5 flex flex-col gap-2 cursor-pointer hover:border-primary/30 hover:bg-accent/50 transition-colors"
    >
      {/* Row 1: Name + Sentiment badge */}
      <div className="flex justify-between items-start gap-1">
        <span className="text-[11px] font-bold text-foreground leading-tight">{preset.name}</span>
        <span
          className={cn(
            "text-[11px] font-semibold px-1.5 py-0.5 rounded shrink-0",
            SENTIMENT_STYLES[preset.sentiment] ?? "bg-muted-foreground/10 text-muted-foreground",
          )}
        >
          {preset.sentiment.charAt(0).toUpperCase() + preset.sentiment.slice(1)}
        </span>
      </div>

      {/* Row 2: Mini SVG payoff chart */}
      <div className="w-full" style={{ height: 50 }}>
        <svg
          width="100%"
          height="50"
          viewBox="0 0 200 50"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {hasMiniPayoff ? (
            <>
              {/* Defs for clipping above/below zero */}
              <defs>
                <clipPath id={`clip-above-${preset.id}`}>
                  <rect x="0" y="0" width="200" height={zeroY} />
                </clipPath>
                <clipPath id={`clip-below-${preset.id}`}>
                  <rect x="0" y={zeroY} width="200" height={50 - zeroY} />
                </clipPath>
              </defs>

              {/* Above-zero fill (green) */}
              <polygon
                points={fillAbove}
                fill="#10b981"
                fillOpacity="0.08"
                clipPath={`url(#clip-above-${preset.id})`}
              />

              {/* Below-zero fill (red) */}
              <polygon
                points={fillBelow}
                fill="#ef4444"
                fillOpacity="0.08"
                clipPath={`url(#clip-below-${preset.id})`}
              />

              {/* Zero reference dashed line */}
              <line
                x1="0"
                y1={zeroY}
                x2="200"
                y2={zeroY}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="4,3"
              />

              {/* Orange payoff line */}
              <polyline
                points={svgPath}
                fill="none"
                stroke="#f97316"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </>
          ) : (
            /* Fallback empty chart */
            <line
              x1="0"
              y1="25"
              x2="200"
              y2="25"
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
          )}
        </svg>
      </div>

      {/* Row 3: Stats grid */}
      <div className="grid grid-cols-2 gap-1 text-[11px]">
        <div className="flex gap-1 items-baseline">
          <span className="text-muted-foreground">P/P:</span>
          <span className={cn("font-bold", popColor)}>{probabilityOfProfit.toFixed(0)}%</span>
        </div>
        <div className="flex gap-1 items-baseline">
          <span className="text-muted-foreground">RoR:</span>
          <span className="font-bold text-foreground">{rorDisplay}</span>
        </div>
        <div className="flex gap-1 items-baseline">
          <span className="text-muted-foreground">Max P:</span>
          <span className="font-bold text-emerald-400">{formatPnlLabel(maxProfit)}</span>
        </div>
        <div className="flex gap-1 items-baseline">
          <span className="text-muted-foreground">Max L:</span>
          <span className="font-bold text-red-400">{formatPnlLabel(maxLoss)}</span>
        </div>
      </div>

      {/* Row 4: Breakevens */}
      {breakevens.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          BE: {breakevens.map((be) => `$${be.toFixed(2)}`).join(", ")}
        </p>
      )}

      {/* Row 5: Select button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(rec);
        }}
        className="w-full rounded bg-primary/10 border border-primary/20 text-primary text-xs font-bold py-1 hover:bg-primary/20 transition-colors"
      >
        Select Strategy &rarr;
      </button>
    </motion.div>
  );
}
