"use client";

import type { Greeks } from "@/types/options";

interface GreeksPanelProps {
  greeks: Greeks;
}

const GREEK_CONFIG = [
  { key: "delta" as const, label: "Delta", color: "text-orange-400", bg: "bg-orange-500/10" },
  { key: "gamma" as const, label: "Gamma", color: "text-orange-500", bg: "bg-orange-500/10" },
  { key: "theta" as const, label: "Theta", color: "text-red-500", bg: "bg-red-500/5" },
  { key: "vega" as const, label: "Vega", color: "text-emerald-500", bg: "bg-emerald-500/5" },
  { key: "rho" as const, label: "Rho", color: "text-muted-foreground", bg: "bg-muted" },
  { key: "vanna" as const, label: "Vanna", color: "text-amber-500", bg: "bg-amber-500/10" },
];

export function GreeksPanel({ greeks }: GreeksPanelProps) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {GREEK_CONFIG.map((g) => (
        <div
          key={g.key}
          className={`rounded-lg ${g.bg} p-1.5 text-center`}
        >
          <div className={`text-[11px] font-medium ${g.color}`}>{g.label}</div>
          <div className="text-xs font-medium tabular-nums">
            {greeks[g.key].toFixed(g.key === "gamma" || g.key === "vanna" ? 4 : 2)}
          </div>
        </div>
      ))}
    </div>
  );
}
