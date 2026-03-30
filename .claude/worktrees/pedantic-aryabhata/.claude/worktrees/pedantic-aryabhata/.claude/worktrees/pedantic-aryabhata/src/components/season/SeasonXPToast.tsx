"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useSeasonStore } from "@/stores/season-store";

export function SeasonXPToast() {
  const lastGain = useSeasonStore((s) => s.lastSeasonXPGain);
  const clearGain = useSeasonStore((s) => s.clearSeasonXPGain);

  useEffect(() => {
    if (!lastGain) return;
    const t = setTimeout(clearGain, 2500);
    return () => clearTimeout(t);
  }, [lastGain, clearGain]);

  return (
    <AnimatePresence>
      {lastGain && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 rounded-full border border-amber-500/20 bg-card/90 px-4 py-2 backdrop-blur"
        >
          <Star className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">
            +{lastGain.amount} Season pts
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
