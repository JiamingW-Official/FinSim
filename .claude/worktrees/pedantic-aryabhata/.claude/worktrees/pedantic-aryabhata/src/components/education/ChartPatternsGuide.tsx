"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CHART_PATTERNS, type ChartPattern } from "@/data/chart-patterns";

type FilterType = "all" | "reversal" | "continuation";

const FILTERS: { label: string; value: FilterType }[] = [
 { label: "All", value: "all" },
 { label: "Reversal", value: "reversal" },
 { label: "Continuation", value: "continuation" },
];

function ReliabilityStars({ rating }: { rating: number }) {
 return (
 <div className="flex gap-0.5">
 {Array.from({ length: 5 }).map((_, i) => (
 <svg key={i} width="12" height="12" viewBox="0 0 12 12" className={i < rating ? "text-amber-400" : "text-muted/40"}>
 <polygon
 points="6,1 7.5,4.2 11,4.7 8.5,7.1 9.1,10.6 6,8.9 2.9,10.6 3.5,7.1 1,4.7 4.5,4.2"
 fill="currentColor"
 />
 </svg>
 ))}
 </div>
 );
}

function DirectionBadge({ direction }: { direction: ChartPattern["direction"] }) {
 return (
 <span
 className={cn(
 "text-xs font-medium px-2 py-0.5 rounded-full",
 direction === "bullish" && "bg-green-500/10 text-green-500",
 direction === "bearish" && "bg-red-500/5 text-red-500",
 direction === "both" && "bg-primary/10 text-primary"
 )}
 >
 {direction}
 </span>
 );
}

function PatternCard({ pattern }: { pattern: ChartPattern }) {
 const [expanded, setExpanded] = useState(false);

 return (
 <div className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3">
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-semibold text-foreground leading-tight">{pattern.name}</h3>
 <div className="flex items-center gap-2 mt-1">
 <span
 className={cn(
 "text-xs font-medium px-2 py-0.5 rounded-full",
 pattern.type === "reversal" ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
 )}
 >
 {pattern.type}
 </span>
 <DirectionBadge direction={pattern.direction} />
 </div>
 </div>
 <ReliabilityStars rating={pattern.reliability} />
 </div>

 <p className="text-xs text-muted-foreground leading-relaxed">{pattern.description}</p>

 <button
 onClick={() => setExpanded(!expanded)}
 className="text-xs text-primary font-medium text-left hover:underline underline-offset-2 transition-colors"
 >
 {expanded ? "Hide details" : "How to Identify & Trade"}
 </button>

 {expanded && (
 <div className="space-y-3 pt-2 border-t border-border">
 {/* How to identify */}
 <div>
 <p className="text-[11px] font-medium text-foreground mb-1.5">How to Identify</p>
 <ol className="space-y-1">
 {pattern.howToIdentify.map((step, i) => (
 <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
 <span className="text-xs font-medium text-primary shrink-0 w-4 text-right">{i + 1}.</span>
 <span>{step}</span>
 </li>
 ))}
 </ol>
 </div>

 {/* Trade setup */}
 <div className="bg-muted/30 rounded-md p-3 space-y-1.5">
 <p className="text-[11px] font-medium text-foreground">Trade Setup</p>
 <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
 <span className="text-[11px] font-medium text-green-500">Entry</span>
 <span className="text-xs text-muted-foreground">{pattern.tradeSetup.entry}</span>
 <span className="text-[11px] font-medium text-red-500">Stop</span>
 <span className="text-xs text-muted-foreground">{pattern.tradeSetup.stopLoss}</span>
 <span className="text-[11px] font-medium text-primary">Target</span>
 <span className="text-xs text-muted-foreground">{pattern.tradeSetup.target}</span>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

export default function ChartPatternsGuide() {
 const [filter, setFilter] = useState<FilterType>("all");

 const filtered = filter === "all" ? CHART_PATTERNS : CHART_PATTERNS.filter((p) => p.type === filter);

 return (
 <div className="space-y-4">
 <div>
 <h2 className="text-base font-semibold text-foreground">Chart Patterns</h2>
 <p className="text-xs text-muted-foreground mt-1">Technical chart formations with identification steps and trade setups</p>
 </div>

 {/* Filters */}
 <div className="flex gap-1.5">
 {FILTERS.map((f) => (
 <button
 key={f.value}
 onClick={() => setFilter(f.value)}
 className={cn(
 "text-xs px-3 py-1.5 rounded-md font-medium transition-colors",
 filter === f.value
 ? "bg-primary text-primary-foreground"
 : "bg-muted/50 text-muted-foreground hover:bg-muted"
 )}
 >
 {f.label}
 </button>
 ))}
 </div>

 {/* Pattern grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {filtered.map((pattern) => (
 <PatternCard key={pattern.name} pattern={pattern} />
 ))}
 </div>

 {filtered.length === 0 && (
 <p className="text-sm text-muted-foreground text-center py-8">No patterns match the selected filter. Try &quot;All&quot; to see every pattern.</p>
 )}
 </div>
 );
}
