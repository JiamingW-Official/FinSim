"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { soundEngine } from "@/services/audio/sound-engine";

export function ComboIndicator() {
  const lastCombo = useGameStore((s) => s.lastCombo);
  const clearCombo = useGameStore((s) => s.clearCombo);
  const [visible, setVisible] = useState(false);
  const [comboNum, setComboNum] = useState(0);

  useEffect(() => {
    if (lastCombo === null) return;
    setComboNum(lastCombo);
    setVisible(true);
    soundEngine.playCombo(lastCombo);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(clearCombo, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [lastCombo, clearCombo]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="fixed left-1/2 top-20 z-[90] -translate-x-1/2"
        >
          <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-card/95 px-5 py-2.5 shadow-sm backdrop-blur-sm">
            <span className="text-2xl font-bold tabular-nums text-amber-400">
              {comboNum}x
            </span>
            <span className="text-sm font-bold text-amber-500">
              COMBO!
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
