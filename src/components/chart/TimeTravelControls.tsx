"use client";

import { useMemo, useState } from "react";
import {
 Play,
 Pause,
 ChevronLeft,
 ChevronRight,
 RotateCcw,
} from "lucide-react";
import { useTimeTravel } from "@/hooks/useTimeTravel";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function formatGameDate(timestamp: number): string {
 return new Date(timestamp).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
 });
}

// Speed options: multiplier → display label
const SPEED_OPTIONS: { value: number; label: string }[] = [
 { value: 1, label: "1×" },
 { value: 2, label: "2×" },
 { value: 6, label: "6×" },
];

export function TimeTravelControls() {
 const {
  allData,
  currentBar,
  isPlaying,
  totalBars,
  revealedCount,
  subBarStep,
  atEnd,
  advance,
  stepBack,
  play,
  pause,
  jumpTo,
  reset,
 } = useTimeTravel();

 const [speed, setSpeed] = useState(1);

 const handlePrev = () => stepBack();
 const handleNext = () => advance();

 // Compute current day number
 const dayNum = useMemo(() => {
  if (allData.length === 0 || revealedCount === 0) return 0;
  const seen = new Set<string>();
  for (let i = 0; i < revealedCount && i < allData.length; i++) {
   seen.add(new Date(allData[i].timestamp).toISOString().slice(0, 10));
  }
  return seen.size;
 }, [allData, revealedCount]);

 // Total unique trading days
 const totalDays = useMemo(() => {
  if (allData.length === 0) return 253;
  const seen = new Set<string>();
  for (const bar of allData) {
   seen.add(new Date(bar.timestamp).toISOString().slice(0, 10));
  }
  return seen.size;
 }, [allData]);

 const btnCls =
  "h-6 w-6 shrink-0 rounded flex items-center justify-center text-[10px] font-mono transition-colors hover:bg-muted/20 disabled:opacity-30 disabled:pointer-events-none text-muted-foreground/60 hover:text-foreground/80";

 return (
  <div className="flex flex-col bg-muted/5 border-b border-border/20">
   {/* Main controls row */}
   <div className="flex items-center gap-1.5 px-2 py-1">

    {/* Reset */}
    <motion.button
     whileTap={{ scale: 0.88 }}
     onClick={() => reset()}
     title="Reset (R)"
     className={btnCls}
    >
     <RotateCcw className="h-3 w-3" />
    </motion.button>

    {/* Prev bar */}
    <motion.button
     whileTap={{ scale: 0.88 }}
     onClick={handlePrev}
     disabled={revealedCount <= 1 && subBarStep === 0}
     title="Previous Bar (←)"
     className={btnCls}
    >
     <ChevronLeft className="h-3 w-3" />
    </motion.button>

    {/* Play / Pause */}
    <motion.button
     whileTap={{ scale: 0.88 }}
     onClick={() => (isPlaying ? pause() : play())}
     disabled={atEnd}
     title={isPlaying ? "Pause (Space)" : "Play (Space)"}
     className={cn(
      btnCls,
      "h-6 w-6",
      isPlaying && "bg-primary/15 text-primary ring-1 ring-primary/30",
     )}
    >
     {isPlaying ? (
      <Pause className="h-3 w-3" />
     ) : (
      <Play className="h-3 w-3" />
     )}
    </motion.button>

    {/* Next bar */}
    <motion.button
     whileTap={{ scale: 0.88 }}
     onClick={handleNext}
     disabled={atEnd}
     title="Next Bar (→)"
     className={btnCls}
    >
     <ChevronRight className="h-3 w-3" />
    </motion.button>

    {/* Separator */}
    <span className="h-3 w-px bg-border/30 mx-0.5 shrink-0" />

    {/* Speed selector */}
    <div className="flex items-center gap-px">
     {SPEED_OPTIONS.map((opt) => (
      <button
       key={opt.value}
       type="button"
       onClick={() => setSpeed(opt.value)}
       title={`${opt.label} speed`}
       className={cn(
        "h-6 min-w-6 px-1.5 rounded text-[10px] font-mono transition-colors",
        speed === opt.value
         ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/20"
         : "text-muted-foreground/35 hover:text-muted-foreground/70 hover:bg-muted/15",
       )}
      >
       {opt.label}
      </button>
     ))}
    </div>

    {/* Separator */}
    <span className="h-3 w-px bg-border/30 mx-0.5 shrink-0" />

    {/* Progress slider */}
    <div className="flex-1 mx-1 min-w-0">
     <input
      type="range"
      min={1}
      max={totalBars || 1}
      value={revealedCount}
      onChange={(e) => jumpTo(Number(e.target.value))}
      title="Time travel progress"
      aria-label="Time travel progress"
      className="time-slider h-1 w-full cursor-pointer appearance-none rounded-full bg-border/40 accent-primary"
     />
    </div>

    {/* Separator */}
    <span className="h-3 w-px bg-border/30 mx-0.5 shrink-0" />

    {/* Date */}
    {currentBar && (
     <span className="font-mono text-[10px] text-muted-foreground/60 shrink-0 tabular-nums whitespace-nowrap">
      {formatGameDate(currentBar.timestamp)}
     </span>
    )}

    {/* Separator */}
    <span className="h-3 w-px bg-border/30 mx-0.5 shrink-0" />

    {/* Day counter */}
    <span className="font-mono text-[10px] tabular-nums shrink-0 whitespace-nowrap text-muted-foreground/50">
     Day{" "}
     <span className="text-foreground/70 font-semibold">{dayNum}</span>
     <span className="text-muted-foreground/30">/{totalDays}</span>
    </span>

    {atEnd && (
     <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-mono font-medium text-destructive shrink-0">
      END
     </span>
    )}
   </div>

   {/* Keyboard hints row — only shown on xl screens */}
   <div className="hidden xl:flex items-center gap-2 border-t border-border/10 px-3 py-0.5">
    <span className="text-[8px] font-mono text-muted-foreground/20 uppercase tracking-widest">
     Shortcuts
    </span>
    {[
     { key: "Space", label: "Play" },
     { key: "←",    label: "Prev" },
     { key: "→",    label: "Next" },
     { key: "R",    label: "Reset" },
     { key: "5/1/H/D/W", label: "Timeframe" },
    ].map(({ key, label }) => (
     <span key={key} className="text-[8px] font-mono text-muted-foreground/20">
      <span className="bg-muted/40 px-0.5 rounded">{key}</span>
      {" "}{label}
     </span>
    ))}
   </div>
  </div>
 );
}
