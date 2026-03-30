"use client";

import { X, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingHintProps {
  title: string;
  description: string;
  visible: boolean;
  onDismiss: () => void;
  position?: "top" | "bottom";
  className?: string;
}

export function OnboardingHint({
  title,
  description,
  visible,
  onDismiss,
  position = "bottom",
  className,
}: OnboardingHintProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "absolute z-50 w-56 rounded-lg border border-primary/30 bg-card p-3 shadow-sm shadow-primary/5",
        position === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
        className,
      )}
    >
      {/* Arrow */}
      <div
        className={cn(
          "absolute left-4 h-2 w-2 rotate-45 border-primary/30 bg-card",
          position === "bottom"
            ? "-top-1 border-l border-t"
            : "-bottom-1 border-b border-r",
        )}
      />

      <div className="flex items-start gap-2">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <div className="flex-1">
          <div className="text-xs font-semibold text-foreground">{title}</div>
          <div className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
            {description}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-1.5 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20"
          >
            Got it
          </button>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
