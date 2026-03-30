"use client";

import { useMemo, useState } from "react";
import {
 Play,
 Pause,
 ChevronLeft,
 ChevronRight,
 RotateCcw,
 SkipForward,
} from "lucide-react";
import { useTimeTravel } from "@/hooks/useTimeTravel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function formatTimeLabel(timestamp: number): string {
 return new Date(timestamp).toLocaleTimeString("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/New_York",
 });
}

function formatDateLabel(timestamp: number): string {
 return new Date(timestamp).toLocaleDateString("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
 });
}

// Speed config: multiplier → Chinese label
const SPEED_OPTIONS: { value: number; label: string; cn: string }[] = [
 { value: 1, label: "1x", cn: "慢速" },
 { value: 2, label: "2x", cn: "正常" },
 { value: 4, label: "4x", cn: "快速" },
 { value: 8, label: "8x", cn: "极速" },
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
  skipToNextDay,
  reset,
 } = useTimeTravel();

 const [speed, setSpeed] = useState(1);

 const handlePrev = () => {
  stepBack();
 };

 const handleNext = () => {
  advance();
 };

 // Compute current day number
 const dayNum = useMemo(() => {
  if (allData.length === 0 || revealedCount === 0) return 0;
  const seen = new Set<string>();
  for (let i = 0; i < revealedCount && i < allData.length; i++) {
   seen.add(new Date(allData[i].timestamp).toISOString().slice(0, 10));
  }
  return seen.size;
 }, [allData, revealedCount]);

 return (
  <div className="flex flex-col border-t border-border bg-card">
   {/* Main controls row */}
   <div className="flex items-center gap-2 px-3 py-1.5">
    {/* Reset */}
    <motion.div whileTap={{ scale: 0.9 }}>
     <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={() => reset()}
      title="Reset (R)"
     >
      <RotateCcw className="h-3.5 w-3.5" />
     </Button>
    </motion.div>

    {/* Prev bar */}
    <motion.div whileTap={{ scale: 0.9 }}>
     <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={handlePrev}
      disabled={revealedCount <= 1 && subBarStep === 0}
      title="Previous Bar (←)"
     >
      <ChevronLeft className="h-4 w-4" />
     </Button>
    </motion.div>

    {/* Play / Pause */}
    <motion.div whileTap={{ scale: 0.92 }}>
     <Button
      variant="ghost"
      size="icon"
      className={cn(
       "h-8 w-8 shrink-0 transition-colors",
       isPlaying &&
        "bg-primary/15 text-primary ring-1 ring-primary/30",
      )}
      onClick={() => {
       isPlaying ? pause() : play();
      }}
      disabled={atEnd}
      title={isPlaying ? "Pause (Space)" : "Play (Space)"}
     >
      {isPlaying ? (
       <Pause className="h-4 w-4" />
      ) : (
       <Play className="h-4 w-4" />
      )}
     </Button>
    </motion.div>

    {/* Next bar */}
    <motion.div whileTap={{ scale: 0.9 }}>
     <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={handleNext}
      disabled={atEnd}
      title="Next Bar (→)"
     >
      <ChevronRight className="h-4 w-4" />
     </Button>
    </motion.div>

    {/* Skip to next day */}
    <motion.div whileTap={{ scale: 0.9 }}>
     <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={() => skipToNextDay()}
      disabled={atEnd}
      title="Skip to Next Day (⏭)"
     >
      <SkipForward className="h-3.5 w-3.5" />
     </Button>
    </motion.div>

    {/* Speed selector */}
    <div className="flex items-center gap-0.5">
     {SPEED_OPTIONS.map((opt) => (
      <button
       key={opt.value}
       onClick={() => setSpeed(opt.value)}
       title={opt.cn}
       className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors",
        speed === opt.value
         ? "bg-primary/15 text-primary"
         : "text-muted-foreground/40 hover:text-muted-foreground/70",
       )}
      >
       {opt.label}
      </button>
     ))}
    </div>

    {/* Progress slider */}
    <div className="mx-1 flex-1">
     <input
      type="range"
      min={1}
      max={totalBars || 1}
      value={revealedCount}
      onChange={(e) => jumpTo(Number(e.target.value))}
      title="Time travel progress"
      aria-label="Time travel progress"
      className="time-slider h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
     />
    </div>

    {/* Day counter + time + date */}
    <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
     <span className="tabular-nums">
      <span className="font-medium text-foreground">Day {dayNum}</span>
     </span>
     {currentBar && (
      <>
       <span className="text-muted-foreground/40">·</span>
       <span className="tabular-nums font-medium text-primary">
        {formatTimeLabel(currentBar.timestamp)}
       </span>
       <span className="hidden whitespace-nowrap font-medium text-foreground sm:block">
        {formatDateLabel(currentBar.timestamp)}
       </span>
      </>
     )}
     {atEnd && (
      <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
       END
      </span>
     )}
    </div>
   </div>

   {/* Keyboard hints row */}
   <div className="flex items-center gap-3 border-t border-border/20 px-3 pb-1 pt-0.5">
    <span className="text-[9px] font-mono text-muted-foreground/25 uppercase tracking-wider">
     快捷键
    </span>
    <div className="flex items-center gap-2.5">
     <span className="text-[9px] text-muted-foreground/30">
      <kbd className="font-mono">Space</kbd>
      {" "}= 播放/暂停
     </span>
     <span className="text-[9px] text-muted-foreground/30">
      <kbd className="font-mono">←</kbd>
      {" "}= 上一根
     </span>
     <span className="text-[9px] text-muted-foreground/30">
      <kbd className="font-mono">→</kbd>
      {" "}= 下一根
     </span>
    </div>
    <div className="ml-auto flex items-center gap-1.5">
     {SPEED_OPTIONS.map((opt) => (
      <span key={opt.value} className="text-[9px] text-muted-foreground/25">
       {opt.label}
       <span className="ml-0.5 text-muted-foreground/20">{opt.cn}</span>
      </span>
     ))}
    </div>
   </div>
  </div>
 );
}
