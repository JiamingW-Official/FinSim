"use client";

import { useChartStore } from "@/stores/chart-store";
import { INDICATOR_EXPLANATIONS } from "@/data/indicator-explanations";
import { motion, AnimatePresence } from "framer-motion";
import { Info, TrendingUp, TrendingDown, X } from "lucide-react";

export function IndicatorInfoPanel() {
  const lastToggled = useChartStore((s) => s.lastToggledIndicator);
  const clearLastToggled = useChartStore((s) => s.clearLastToggled);

  const explanation = lastToggled
    ? INDICATOR_EXPLANATIONS[lastToggled]
    : null;

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
          <div className="flex items-start gap-3 border-b border-primary/20 bg-primary/5 px-3 py-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary">
                  {explanation.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {explanation.shortDesc}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                {explanation.howToRead}
              </p>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1 text-[10px] text-[#10b981]">
                  <TrendingUp className="h-2.5 w-2.5" />
                  {explanation.bullSignal}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#ef4444]">
                  <TrendingDown className="h-2.5 w-2.5" />
                  {explanation.bearSignal}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={clearLastToggled}
              title="Dismiss"
              className="shrink-0 rounded p-0.5 text-primary/50 hover:text-primary"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
