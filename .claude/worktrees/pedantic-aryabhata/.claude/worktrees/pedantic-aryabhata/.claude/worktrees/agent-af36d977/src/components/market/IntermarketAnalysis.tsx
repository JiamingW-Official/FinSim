"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AssetPair {
  id: string;
  assetA: string;
  assetB: string;
  shortA: string;
  shortB: string;
  currentCorr: number;     // -1 to +1
  historicalAvg: number;   // typical long-run correlation
  regime: "normal" | "stress" | "diverging";
  direction: "positive" | "negative";
  interpretation: string;
  signal: string;
  signalBullish: boolean | null; // null = neutral
}

// Seeded PRNG
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Static intermarket pair definitions ──────────────────────────────────────

type PairDefinition = Omit<AssetPair, "currentCorr" | "regime" | "signal" | "signalBullish">;

const PAIR_DEFINITIONS: PairDefinition[] = [
  {
    id: "stocks-bonds",
    assetA: "S&P 500",
    assetB: "10Y Treasury",
    shortA: "SPX",
    shortB: "TNX",
    historicalAvg: -0.28,
    direction: "negative",
    interpretation:
      "Stocks and bonds typically move inversely as investors rotate between risk-on and safe-haven assets. A positive correlation (both falling) signals crisis-mode selling.",
  },
  {
    id: "dollar-gold",
    assetA: "US Dollar (DXY)",
    assetB: "Gold",
    shortA: "DXY",
    shortB: "GLD",
    historicalAvg: -0.42,
    direction: "negative",
    interpretation:
      "Gold is priced in dollars — a stronger dollar makes gold more expensive for foreign buyers, suppressing demand. Dollar strength is historically bearish for gold.",
  },
  {
    id: "oil-energy",
    assetA: "Crude Oil (WTI)",
    assetB: "Energy Stocks",
    shortA: "WTI",
    shortB: "XLE",
    historicalAvg: 0.71,
    direction: "positive",
    interpretation:
      "Energy companies' revenues are directly tied to commodity prices. A high correlation is the norm; divergence (oil rising, XLE lagging) can signal undervaluation in energy equities.",
  },
  {
    id: "dollar-em",
    assetA: "US Dollar (DXY)",
    assetB: "Emerging Markets",
    shortA: "DXY",
    shortB: "EEM",
    historicalAvg: -0.55,
    direction: "negative",
    interpretation:
      "Emerging market economies often carry dollar-denominated debt. A rising dollar increases their debt burden and reduces capital inflows, pressuring EM equities and currencies.",
  },
  {
    id: "vix-spx",
    assetA: "VIX",
    assetB: "S&P 500",
    shortA: "VIX",
    shortB: "SPX",
    historicalAvg: -0.75,
    direction: "negative",
    interpretation:
      "The VIX measures expected 30-day volatility implied from S&P 500 options. Fear spikes as stocks fall. A decoupling (VIX falling while SPX also falls) suggests complacency.",
  },
  {
    id: "copper-global",
    assetA: "Copper",
    assetB: "Global Equities",
    shortA: "HG",
    shortB: "ACWI",
    historicalAvg: 0.47,
    direction: "positive",
    interpretation:
      "Copper is an industrial bellwether — its demand tracks global manufacturing and construction. Rising copper prices often lead equity markets by 1-2 months.",
  },
];

function buildPairs(): AssetPair[] {
  return PAIR_DEFINITIONS.map((def, i) => {
    const rand = seededRand((i + 1) * 137 + 42);

    // Perturb around historical avg
    const noise = (rand() - 0.5) * 0.35;
    const currentCorr = Math.max(-1, Math.min(1, def.historicalAvg + noise));

    // Determine regime
    const drift = currentCorr - def.historicalAvg;
    const regime: AssetPair["regime"] =
      Math.abs(drift) > 0.25
        ? "diverging"
        : Math.abs(currentCorr) > 0.7
          ? "stress"
          : "normal";

    // Generate signal from current state
    let signal = "";
    let signalBullish: boolean | null = null;

    if (def.id === "stocks-bonds") {
      if (currentCorr > 0.1) {
        signal = "Positive correlation: both assets falling together — possible crisis-mode selling. Monitor for flight-to-quality breakdown.";
        signalBullish = false;
      } else {
        signal = "Negative correlation intact: bonds acting as portfolio hedge against equity drawdowns.";
        signalBullish = true;
      }
    } else if (def.id === "dollar-gold") {
      if (currentCorr < -0.5) {
        signal = "Dollar strengthening: typically bearish for emerging markets and gold. Watch for commodity sector pressure.";
        signalBullish = false;
      } else if (currentCorr > 0) {
        signal = "Unusual positive correlation: both rising together may signal inflation fears overwhelming currency dynamics.";
        signalBullish = null;
      } else {
        signal = "Normal inverse relationship. Dollar and gold in equilibrium — no extreme directional bias.";
        signalBullish = null;
      }
    } else if (def.id === "oil-energy") {
      if (currentCorr > 0.8) {
        signal = "Energy stocks tracking oil tightly — sector is efficiently pricing commodity moves.";
        signalBullish = null;
      } else if (drift < -0.2) {
        signal = "Energy stocks lagging oil — potential value opportunity if oil strength is sustained.";
        signalBullish = true;
      } else {
        signal = "Moderate correlation. Energy equities partially decoupled from spot oil — watch refining margins and production costs.";
        signalBullish = null;
      }
    } else if (def.id === "dollar-em") {
      if (currentCorr < -0.6) {
        signal = "Dollar strengthening: typically bearish for emerging markets and gold. EM currencies under pressure.";
        signalBullish = false;
      } else if (currentCorr > -0.2) {
        signal = "Weakening negative correlation: EM markets showing relative resilience despite dollar strength.";
        signalBullish = true;
      } else {
        signal = "Normal inverse relationship. EM equities tracking dollar weakness/strength as expected.";
        signalBullish = null;
      }
    } else if (def.id === "vix-spx") {
      if (currentCorr > -0.5) {
        signal = "VIX-SPX correlation weakening — markets may be complacent. Elevated risk of a volatility spike.";
        signalBullish = false;
      } else {
        signal = "Strong inverse relationship. Fear gauge responding normally to equity moves.";
        signalBullish = true;
      }
    } else if (def.id === "copper-global") {
      if (currentCorr > 0.6) {
        signal = "Copper leading global growth: strong industrial demand signal. Supportive for cyclical equities.";
        signalBullish = true;
      } else if (currentCorr < 0.2) {
        signal = "Copper diverging from equities — may signal slowing industrial activity ahead.";
        signalBullish = false;
      } else {
        signal = "Moderate alignment. Copper providing mild confirmation of global growth trend.";
        signalBullish = null;
      }
    }

    return { ...def, currentCorr: Math.round(currentCorr * 100) / 100, regime, signal, signalBullish };
  });
}

// ── Correlation gauge SVG ─────────────────────────────────────────────────────

function CorrelationGauge({ value, historical }: { value: number; historical: number }) {
  const W = 180;
  const H = 10;
  const mid = W / 2;

  // Map value from [-1, 1] to [0, W]
  const toX = (v: number) => ((v + 1) / 2) * W;

  const currentX = toX(value);
  const histX = toX(historical);

  const positive = value >= 0;
  const barStart = Math.min(mid, currentX);
  const barEnd = Math.max(mid, currentX);

  return (
    <svg width={W} height={H + 14} viewBox={`0 0 ${W} ${H + 14}`} aria-hidden="true">
      {/* Track */}
      <rect x={0} y={2} width={W} height={H} rx={H / 2} fill="hsl(var(--muted))" />
      {/* Colored fill from center */}
      <rect
        x={barStart}
        y={2}
        width={barEnd - barStart}
        height={H}
        rx={2}
        fill={positive ? "rgba(34,197,94,0.7)" : "rgba(239,68,68,0.7)"}
      />
      {/* Center line */}
      <rect x={mid - 0.5} y={0} width={1} height={H + 4} fill="hsl(var(--border))" />
      {/* Historical avg marker */}
      <rect
        x={histX - 1}
        y={0}
        width={2}
        height={H + 4}
        fill="hsl(var(--muted-foreground))"
        opacity={0.5}
      />
      {/* Current value indicator */}
      <circle cx={currentX} cy={2 + H / 2} r={5} fill={positive ? "#22c55e" : "#ef4444"} />
      {/* Labels */}
      <text x={2} y={H + 13} fontSize={7} fill="hsl(var(--muted-foreground))">
        -1
      </text>
      <text x={mid} y={H + 13} fontSize={7} textAnchor="middle" fill="hsl(var(--muted-foreground))">
        0
      </text>
      <text x={W - 2} y={H + 13} fontSize={7} textAnchor="end" fill="hsl(var(--muted-foreground))">
        +1
      </text>
    </svg>
  );
}

// ── Signal pill ───────────────────────────────────────────────────────────────

function RegimeBadge({ regime }: { regime: AssetPair["regime"] }) {
  const styles: Record<AssetPair["regime"], string> = {
    normal: "bg-muted text-muted-foreground",
    stress: "bg-amber-500/10 text-amber-500",
    diverging: "bg-purple-500/10 text-purple-500",
  };
  const labels: Record<AssetPair["regime"], string> = {
    normal: "Normal",
    stress: "Elevated",
    diverging: "Diverging",
  };
  return (
    <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full", styles[regime])}>
      {labels[regime]}
    </span>
  );
}

// ── Pair card ─────────────────────────────────────────────────────────────────

function PairCard({ pair }: { pair: AssetPair }) {
  const corrColor =
    pair.currentCorr >= 0.3
      ? "text-green-500"
      : pair.currentCorr <= -0.3
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <div className="rounded-lg border bg-card p-3 space-y-2.5 hover:border-border/60 transition-colors">
      {/* Title row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold truncate">
            {pair.shortA}
          </span>
          <span className="text-[10px] text-muted-foreground">vs</span>
          <span className="text-xs font-semibold truncate">
            {pair.shortB}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <RegimeBadge regime={pair.regime} />
          <span className={cn("font-mono tabular-nums text-xs font-bold", corrColor)}>
            {pair.currentCorr >= 0 ? "+" : ""}
            {pair.currentCorr.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Asset names */}
      <div className="text-[10px] text-muted-foreground">
        {pair.assetA} / {pair.assetB}
      </div>

      {/* Gauge */}
      <CorrelationGauge value={pair.currentCorr} historical={pair.historicalAvg} />

      {/* Historical context */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>
          Historical avg:{" "}
          <span className="font-mono tabular-nums font-medium text-foreground">
            {pair.historicalAvg >= 0 ? "+" : ""}
            {pair.historicalAvg.toFixed(2)}
          </span>
        </span>
        <span className="text-border">|</span>
        <span>
          Drift:{" "}
          <span
            className={cn(
              "font-mono tabular-nums font-medium",
              Math.abs(pair.currentCorr - pair.historicalAvg) > 0.2
                ? "text-amber-500"
                : "text-foreground",
            )}
          >
            {pair.currentCorr - pair.historicalAvg >= 0 ? "+" : ""}
            {(pair.currentCorr - pair.historicalAvg).toFixed(2)}
          </span>
        </span>
      </div>

      {/* Signal */}
      {pair.signal && (
        <div
          className={cn(
            "text-[10px] leading-snug px-2 py-1.5 rounded border-l-2",
            pair.signalBullish === true
              ? "border-green-500 bg-green-500/5 text-green-700 dark:text-green-400"
              : pair.signalBullish === false
                ? "border-red-500 bg-red-500/5 text-red-700 dark:text-red-400"
                : "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
          )}
        >
          {pair.signal}
        </div>
      )}

      {/* Interpretation toggle */}
      <details className="group">
        <summary className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer list-none flex items-center gap-1 transition-colors">
          <svg
            className="w-3 h-3 transition-transform group-open:rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Why this relationship matters
        </summary>
        <p className="mt-1.5 text-[10px] text-muted-foreground leading-relaxed pl-4">
          {pair.interpretation}
        </p>
      </details>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function IntermarketAnalysis() {
  const pairs = useMemo(() => buildPairs(), []);

  // Derive a top-level headline signal
  const dollarGold = pairs.find((p) => p.id === "dollar-gold")!;
  const stocksBonds = pairs.find((p) => p.id === "stocks-bonds")!;
  const copperGlobal = pairs.find((p) => p.id === "copper-global")!;

  const riskOn =
    stocksBonds.currentCorr < -0.3 &&
    copperGlobal.currentCorr > 0.4;
  const riskOff =
    stocksBonds.currentCorr > 0 || copperGlobal.currentCorr < 0.1;

  const headline = riskOn
    ? "Cross-asset relationships signal risk-on environment: bonds hedging equities, copper confirming global growth."
    : riskOff
      ? "Cross-asset breakdown detected: correlation shifts suggest defensive positioning may be warranted."
      : "Mixed cross-asset signals. Intermarket relationships near historical norms — no strong directional bias.";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Intermarket Analysis</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Cross-asset correlations vs historical averages. Gray marker = long-run avg.
          </p>
        </div>
      </div>

      {/* Headline signal banner */}
      <div
        className={cn(
          "rounded-lg border px-3 py-2 text-[11px] leading-relaxed",
          riskOn
            ? "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400"
            : riskOff
              ? "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400"
              : "border-border bg-muted/30 text-muted-foreground",
        )}
      >
        <span className="font-medium">Market regime: </span>
        {headline}
      </div>

      {/* Grid of pair cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {pairs.map((pair) => (
          <PairCard key={pair.id} pair={pair} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-muted-foreground/50 rounded" />
          Historical avg marker
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Positive correlation
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Negative correlation
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
            Diverging
          </span>
          Correlation shifted more than 0.25 from historical avg
        </div>
        <span className="ml-auto">Synthetic data for educational purposes</span>
      </div>
    </div>
  );
}
