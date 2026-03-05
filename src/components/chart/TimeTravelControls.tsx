"use client";

import { useMemo } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
  SkipForward,
} from "lucide-react";
import { useTimeTravel } from "@/hooks/useTimeTravel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { soundEngine } from "@/services/audio/sound-engine";

const SPEEDS = [1, 2, 5, 10];

function formatTimeLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

function formatDateLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function TimeTravelControls() {
  const {
    allData,
    currentBar,
    isPlaying,
    speed,
    totalBars,
    revealedCount,
    atEnd,
    advance,
    play,
    pause,
    changeSpeed,
    jumpTo,
    skipToNextDay,
    reset,
  } = useTimeTravel();

  const handlePrev = () => {
    soundEngine.playClick();
    jumpTo(Math.max(1, revealedCount - 1));
  };

  const handleNext = () => {
    soundEngine.playClick();
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
    <div className="flex items-center gap-2 border-t border-border bg-card px-3 py-1.5">
      {/* Reset */}
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => { soundEngine.playClick(); reset(); }}
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
          disabled={revealedCount <= 1}
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
            "h-8 w-8 shrink-0 transition-all",
            isPlaying &&
              "bg-primary/15 text-primary ring-1 ring-primary/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]",
          )}
          onClick={() => {
            soundEngine.playClick();
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
          onClick={() => { soundEngine.playClick(); skipToNextDay(); }}
          disabled={atEnd}
          title="Skip to Next Day (⏭)"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </Button>
      </motion.div>

      {/* Speed selector */}
      <div className="flex items-center gap-0.5 border-l border-border/50 pl-2">
        <Zap className="mr-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { soundEngine.playClick(); changeSpeed(s); }}
            className={cn(
              "rounded px-1.5 py-0.5 text-[9px] font-bold transition-all duration-200",
              speed === s
                ? "bg-primary/20 text-primary shadow-[0_0_6px_rgba(16,185,129,0.15)]"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            {s}x
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
          <span className="font-bold text-foreground">Day {dayNum}</span>
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
          <span className="rounded bg-[#ef4444]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#ef4444]">
            END
          </span>
        )}
      </div>
    </div>
  );
}
