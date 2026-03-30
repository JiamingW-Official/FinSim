"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
 analyzeSectorRotation,
 type BusinessCycle,
 type SectorRotationModel,
} from "@/services/market/sector-rotation";

// ─── Phase Config ────────────────────────────────────────────────────────────

const PHASE_CONFIG: {
 id: BusinessCycle;
 label: string;
 shortLabel: string;
 color: string;
 bgColor: string;
}[] = [
 {
 id: "early_expansion",
 label: "Early Expansion",
 shortLabel: "Early",
 color: "text-emerald-500",
 bgColor: "bg-emerald-500",
 },
 {
 id: "mid_expansion",
 label: "Mid Expansion",
 shortLabel: "Mid",
 color: "text-primary",
 bgColor: "bg-primary",
 },
 {
 id: "late_expansion",
 label: "Late Expansion",
 shortLabel: "Late",
 color: "text-amber-500",
 bgColor: "bg-amber-500",
 },
 {
 id: "recession",
 label: "Recession",
 shortLabel: "Recess.",
 color: "text-red-500",
 bgColor: "bg-red-500",
 },
];

// ─── Cycle Timeline ──────────────────────────────────────────────────────────

function CycleTimeline({ currentCycle }: { currentCycle: BusinessCycle }) {
 return (
 <div className="flex items-center gap-1">
 {PHASE_CONFIG.map((phase, i) => {
 const isActive = phase.id === currentCycle;
 return (
 <div key={phase.id} className="flex items-center flex-1">
 <div
 className={cn(
 "flex-1 rounded-lg px-2 py-2 text-center transition-colors duration-300 border",
 isActive
 ? `${phase.bgColor}/15 border-current ${phase.color}`
 : "bg-muted/30 border-transparent text-muted-foreground",
 )}
 >
 <p
 className={cn(
 "text-xs font-medium",
 isActive && phase.color,
 )}
 >
 {phase.shortLabel}
 </p>
 {isActive && (
 <div
 className={cn(
 "w-1.5 h-1.5 rounded-full mx-auto mt-1",
 phase.bgColor,
 )}
 />
 )}
 </div>
 {i < PHASE_CONFIG.length - 1 && (
 <svg
 className="w-3 h-3 text-muted-foreground/40 shrink-0"
 viewBox="0 0 12 12"
 fill="none"
 stroke="currentColor"
 strokeWidth={1.5}
 >
 <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 )}
 </div>
 );
 })}
 </div>
 );
}

// ─── Sector List ─────────────────────────────────────────────────────────────

function SectorList({
 title,
 sectors,
 variant,
}: {
 title: string;
 sectors: string[];
 variant: "overweight" | "underweight";
}) {
 const color =
 variant === "overweight" ? "text-emerald-500" : "text-red-500";
 const bg =
 variant === "overweight" ? "bg-emerald-500/5" : "bg-red-500/5";

 return (
 <div className="space-y-1.5">
 <p className={cn("text-xs font-medium", color)}>{title}</p>
 <div className="flex flex-wrap gap-1">
 {sectors.map((sector) => (
 <span
 key={sector}
 className={cn(
 "text-xs px-2 py-0.5 rounded font-medium",
 bg,
 color,
 )}
 >
 {sector}
 </span>
 ))}
 </div>
 </div>
 );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SectorRotationPanel() {
 const [showNote, setShowNote] = useState(false);

 // Default macro conditions (simulated current environment)
 const [gdpGrowth] = useState(2.1);
 const [inflationRate] = useState(3.2);
 const [yieldCurveSlope] = useState(15);
 const [unemploymentTrend] = useState<"rising" | "falling" | "stable">(
 "stable",
 );

 const model: SectorRotationModel = useMemo(
 () =>
 analyzeSectorRotation(
 gdpGrowth,
 inflationRate,
 yieldCurveSlope,
 unemploymentTrend,
 ),
 [gdpGrowth, inflationRate, yieldCurveSlope, unemploymentTrend],
 );

 const activePhase = PHASE_CONFIG.find((p) => p.id === model.currentCycle);

 return (
 <div className="rounded-lg border bg-card p-4 space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold">Sector Rotation</h3>
 <span className="text-xs text-muted-foreground">
 {(model.confidence * 100).toFixed(0)}% confidence
 </span>
 </div>

 {/* Business cycle timeline */}
 <CycleTimeline currentCycle={model.currentCycle} />

 {/* Current phase label */}
 <div className="flex items-center gap-2">
 <span
 className={cn(
 "text-xs font-medium px-2 py-0.5 rounded",
 activePhase?.bgColor + "/15",
 activePhase?.color,
 )}
 >
 {activePhase?.label ?? model.currentCycle}
 </span>
 </div>

 {/* Macro inputs */}
 <div className="grid grid-cols-4 gap-2">
 <div className="space-y-0.5">
 <p className="text-xs text-muted-foreground">GDP</p>
 <p className="font-mono tabular-nums text-xs font-medium">
 {gdpGrowth > 0 ? "+" : ""}
 {gdpGrowth.toFixed(1)}%
 </p>
 </div>
 <div className="space-y-0.5">
 <p className="text-xs text-muted-foreground">CPI</p>
 <p className="font-mono tabular-nums text-xs font-medium">
 {inflationRate.toFixed(1)}%
 </p>
 </div>
 <div className="space-y-0.5">
 <p className="text-xs text-muted-foreground">Yield Curve</p>
 <p
 className={cn(
 "font-mono tabular-nums text-xs font-medium",
 yieldCurveSlope < 0 ? "text-red-500" : "text-emerald-500",
 )}
 >
 {yieldCurveSlope}bps
 </p>
 </div>
 <div className="space-y-0.5">
 <p className="text-xs text-muted-foreground">Unemp.</p>
 <p className="font-mono tabular-nums text-xs font-medium capitalize">
 {unemploymentTrend}
 </p>
 </div>
 </div>

 {/* Sector recommendations */}
 <div className="space-y-3 border-t pt-3">
 <SectorList
 title="OVERWEIGHT"
 sectors={model.overweight}
 variant="overweight"
 />
 <SectorList
 title="UNDERWEIGHT"
 sectors={model.underweight}
 variant="underweight"
 />
 </div>

 {/* Rationale */}
 <p className="text-xs text-muted-foreground leading-relaxed">
 {model.rationale}
 </p>

 {/* Historical accuracy */}
 <div className="px-3 py-2 rounded-lg bg-muted/50 border">
 <p className="text-xs text-muted-foreground mb-1">
 Historical Track Record
 </p>
 <p className="text-xs leading-relaxed">
 {model.historicalAccuracy}
 </p>
 </div>

 {/* Educational note */}
 <div className="pt-2 border-t">
 <button
 onClick={() => setShowNote(!showNote)}
 className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
 >
 <svg
 className={cn(
 "w-3 h-3 transition-transform",
 showNote && "rotate-90",
 )}
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 strokeWidth={2}
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M9 5l7 7-7 7"
 />
 </svg>
 About sector rotation
 </button>
 {showNote && (
 <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
 {model.educationalNote}
 </p>
 )}
 </div>
 </div>
 );
}
