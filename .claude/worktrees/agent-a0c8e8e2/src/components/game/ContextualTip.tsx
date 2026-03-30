"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { useContextualTips } from "@/hooks/useContextualTips";

export function ContextualTip() {
  const tip = useContextualTips();

  return (
    <AnimatePresence>
      {tip && (
        <motion.div
          key={tip.id}
          initial={{ opacity: 0, y: 8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 border-t border-primary/20 bg-primary/5 px-3 py-1.5">
            <Lightbulb className="h-3 w-3 shrink-0 text-primary" />
            <span className="flex-1 text-[10px] text-primary/80">
              {tip.message}
            </span>
            <button
              type="button"
              onClick={tip.dismiss}
              title="Dismiss tip"
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
