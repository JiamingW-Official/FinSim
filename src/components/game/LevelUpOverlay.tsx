"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { getTitleForLevel } from "@/types/game";
import { Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { soundEngine } from "@/services/audio/sound-engine";

export function LevelUpOverlay() {
  const lastLevelUp = useGameStore((s) => s.lastLevelUp);
  const clearLevelUp = useGameStore((s) => s.clearLevelUp);
  const [show, setShow] = useState(false);
  const [levelNum, setLevelNum] = useState<number | null>(null);

  useEffect(() => {
    if (lastLevelUp === null) return;
    setLevelNum(lastLevelUp);
    setShow(true);
    soundEngine.playLevelUp();

    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(clearLevelUp, 400);
    }, 3000);

    return () => clearTimeout(timer);
  }, [lastLevelUp, clearLevelUp]);

  const title = levelNum !== null ? getTitleForLevel(levelNum) : "";

  return (
    <AnimatePresence>
      {show && levelNum !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative flex flex-col items-center gap-3 rounded-md border border-primary/30 bg-card px-10 py-8 shadow-sm"
          >
            <span className="text-xs font-semibold text-primary">
              Level Up!
            </span>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.15 }}
              className="flex items-center gap-2"
            >
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {levelNum}
              </span>
            </motion.div>

            <span className={cn(
              "text-sm font-semibold",
              "text-primary",
            )}>
              {title}
            </span>

            <p className="text-xs text-muted-foreground">
              Keep trading to unlock new titles!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
