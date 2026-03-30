"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
 value: number[];
 onValueChange: (value: number[]) => void;
 min?: number;
 max?: number;
 step?: number;
 className?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
 ({ value, onValueChange, min = 0, max = 100, step = 1, className }, ref) => {
 const current = value[0] ?? min;
 const pct = ((current - min) / (max - min)) * 100;

 return (
 <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
 <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
 <div
 className="absolute h-full bg-primary rounded-full"
 style={{ width: `${pct}%` }}
 />
 </div>
 <input
 ref={ref}
 type="range"
 min={min}
 max={max}
 step={step}
 value={current}
 onChange={(e) => onValueChange([Number(e.target.value)])}
 className="absolute inset-0 w-full cursor-pointer opacity-0"
 />
 <div
 className="absolute block h-4 w-4 rounded-full border border-primary/50 bg-background shadow ring-0 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
 style={{ left: `calc(${pct}% - 8px)` }}
 />
 </div>
 );
 },
);
Slider.displayName = "Slider";

export { Slider };
