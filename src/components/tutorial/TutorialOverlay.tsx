"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorial } from "@/hooks/useTutorial";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { soundEngine } from "@/services/audio/sound-engine";

export function TutorialOverlay() {
  const { isActive, currentStep, stepIndex, totalSteps, next, prev, skip } = useTutorial();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateTarget = useCallback(() => {
    if (!currentStep) return;
    const el = document.querySelector(`[data-tutorial="${currentStep.target}"]`);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    updateTarget();
    window.addEventListener("resize", updateTarget);
    return () => window.removeEventListener("resize", updateTarget);
  }, [updateTarget]);

  if (!isActive || !currentStep) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  // Position tooltip near the target or center if no target found
  const tooltipStyle: React.CSSProperties = targetRect
    ? {
        position: "fixed",
        top: targetRect.bottom + 12,
        left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 320)),
        zIndex: 1001,
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
      };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000]">
        {/* Dimmed backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={skip} />

        {/* Spotlight cutout */}
        {targetRect && (
          <div
            className="absolute rounded-md ring-2 ring-primary/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              zIndex: 1000,
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={tooltipStyle}
        >
          <div className="w-72 rounded-md border border-primary/30 bg-card p-4 shadow-sm">
            {/* Header */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-primary">
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <button
                onClick={skip}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content */}
            <h3 className="text-sm font-semibold text-foreground">{currentStep.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {currentStep.description}
            </p>

            {/* Progress dots */}
            <div className="mt-3 flex items-center justify-center gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIndex
                      ? "w-4 bg-primary"
                      : i < stepIndex
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => { soundEngine.playClick(); prev(); }}
                disabled={isFirst}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft className="h-3 w-3" />
                Back
              </button>
              <button
                onClick={skip}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>
              <button
                onClick={() => { soundEngine.playClick(); next(); }}
                className="flex items-center gap-1 rounded bg-primary/15 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/25"
              >
                {isLast ? "Finish" : "Next"}
                {!isLast && <ChevronRight className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
