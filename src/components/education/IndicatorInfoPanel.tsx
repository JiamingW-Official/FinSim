"use client";

import { useState } from "react";
import { useChartStore } from "@/stores/chart-store";
import { INDICATOR_EXPLANATIONS } from "@/data/indicator-explanations";
import { motion, AnimatePresence } from "framer-motion";
import { Info, TrendingUp, TrendingDown, X, ChevronDown, ChevronUp, AlertTriangle, Star } from "lucide-react";

export function IndicatorInfoPanel() {
  const lastToggled = useChartStore((s) => s.lastToggledIndicator);
  const clearLastToggled = useChartStore((s) => s.clearLastToggled);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const explanation = lastToggled
    ? INDICATOR_EXPLANATIONS[lastToggled]
    : null;

  // Reset advanced section when indicator changes
  const handleDismiss = () => {
    setShowAdvanced(false);
    clearLastToggled();
  };

  return (
    <AnimatePresence>
      {explanation && (
        <motion.div
          key={lastToggled}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="border-b border-primary/20 bg-primary/5">
            {/* Main info row */}
            <div className="flex items-start gap-3 px-3 py-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary">
                    {explanation.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {explanation.shortDesc}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {explanation.howToRead}
                </p>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1 text-xs text-profit">
                    <TrendingUp className="h-2.5 w-2.5" />
                    {explanation.bullSignal}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-loss">
                    <TrendingDown className="h-2.5 w-2.5" />
                    {explanation.bearSignal}
                  </span>
                </div>

                {/* Pro tips toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors pt-0.5"
                >
                  {showAdvanced ? (
                    <ChevronUp className="h-2.5 w-2.5" />
                  ) : (
                    <ChevronDown className="h-2.5 w-2.5" />
                  )}
                  {showAdvanced ? "Hide" : "Pro tips & examples"}
                </button>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                title="Dismiss"
                className="shrink-0 rounded p-0.5 text-primary/50 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Expandable advanced section */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-2 border-t border-primary/10 pt-2">
                    {/* Common mistake */}
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                      <div>
                        <span className="text-[11px] font-bold text-amber-400">
                          Common mistake
                        </span>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {explanation.commonMistakes}
                        </p>
                      </div>
                    </div>

                    {/* Pro tip */}
                    <div className="flex items-start gap-2">
                      <Star className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      <div>
                        <span className="text-[11px] font-bold text-primary">
                          Pro tip
                        </span>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {explanation.proTip}
                        </p>
                      </div>
                    </div>

                    {/* Example scenario */}
                    <div className="rounded-md bg-muted/30 border border-border/40 px-2 py-1.5">
                      <span className="text-[11px] font-bold text-foreground/50">
                        Example
                      </span>
                      <p className="text-xs leading-relaxed text-muted-foreground mt-0.5">
                        {explanation.exampleScenario}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
