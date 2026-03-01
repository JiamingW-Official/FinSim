"use client";

import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Zap,
} from "lucide-react";
import { useTimeTravel } from "@/hooks/useTimeTravel";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SPEEDS = [1, 2, 5, 10];

export function TimeTravelControls() {
  const {
    currentBar,
    isPlaying,
    speed,
    totalBars,
    revealedCount,
    progress,
    atEnd,
    advance,
    play,
    pause,
    changeSpeed,
    jumpTo,
    reset,
  } = useTimeTravel();

  return (
    <div className="flex items-center gap-3 border-t border-border bg-card px-3 py-2">
      {/* Playback controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={reset}
          title="Reset (R)"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 transition-all",
            isPlaying &&
              "bg-primary/15 text-primary ring-1 ring-primary/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]",
          )}
          onClick={isPlaying ? pause : play}
          disabled={atEnd}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={advance}
          disabled={atEnd}
          title="Step Forward (→)"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Speed selector */}
      <div className="flex items-center gap-0.5">
        <Zap className="mr-1 h-3 w-3 text-muted-foreground" />
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => changeSpeed(s)}
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-bold transition-all duration-200",
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
      <div className="mx-2 flex-1">
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

      {/* Info */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {currentBar && (
          <span className="whitespace-nowrap font-medium text-foreground">
            {formatDate(currentBar.timestamp)}
          </span>
        )}
        <span className="whitespace-nowrap tabular-nums">
          <span className="text-foreground">{revealedCount}</span>
          <span className="text-muted-foreground">/{totalBars}</span>
        </span>
        {atEnd && (
          <span className="rounded bg-[#ef4444]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#ef4444]">
            END
          </span>
        )}
      </div>
    </div>
  );
}
