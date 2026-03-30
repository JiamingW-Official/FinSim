"use client";

import type { Greeks } from "@/types/options";

interface GreeksPanelProps {
 greeks: Greeks;
}

const GREEK_CONFIG = [
 { key: "delta" as const, label: "Delta", valueColor: (v: number) => v >= 0 ? "text-emerald-400" : "text-red-400" },
 { key: "gamma" as const, label: "Gamma", valueColor: () => "text-blue-400" },
 { key: "theta" as const, label: "Theta", valueColor: () => "text-amber-400" },
 { key: "vega" as const, label: "Vega", valueColor: () => "text-sky-400" },
 { key: "rho" as const, label: "Rho", valueColor: () => "text-muted-foreground/70" },
 { key: "vanna" as const, label: "Vanna", valueColor: () => "text-violet-400" },
];

export function GreeksPanel({ greeks }: GreeksPanelProps) {
 return (
 <div className="grid grid-cols-3 gap-2">
 {GREEK_CONFIG.map((g) => {
 const val = greeks[g.key];
 const dec = g.key === "gamma" || g.key === "vanna" ? 4 : 2;
 return (
 <div
 key={g.key}
 className="rounded-lg border border-border/20 bg-card/30 p-2 text-center"
 >
 <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
 {g.label}
 </div>
 <div className={`text-[13px] font-mono font-semibold tabular-nums ${g.valueColor(val)}`}>
 {val.toFixed(dec)}
 </div>
 </div>
 );
 })}
 </div>
 );
}
