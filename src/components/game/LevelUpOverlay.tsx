"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { getTitleForLevel } from "@/types/game";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function LevelUpOverlay() {
 const lastLevelUp = useGameStore((s) => s.lastLevelUp);
 const clearLevelUp = useGameStore((s) => s.clearLevelUp);
 const [show, setShow] = useState(false);
 const [levelNum, setLevelNum] = useState<number | null>(null);

 useEffect(() => {
 if (lastLevelUp === null) return;
 setLevelNum(lastLevelUp);
 setShow(true);
 // Clear immediately so re-mounts / navigations don't re-trigger
 clearLevelUp();

 const timer = setTimeout(() => {
 setShow(false);
 }, 3000);

 return () => clearTimeout(timer);
 }, [lastLevelUp, clearLevelUp]);

 const title = levelNum !== null ? getTitleForLevel(levelNum) : "";

 return (
 <AnimatePresence>
 {show && levelNum !== null && (
 <motion.div
 initial={{ opacity: 0, y: -12 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -12 }}
 transition={{ duration: 0.25, ease: "easeOut" }}
 className="fixed right-4 top-12 z-[100] flex items-center gap-3 rounded-md border border-border bg-card/95 px-4 py-3 backdrop-blur-sm"
 >
 <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/30 text-sm font-semibold tabular-nums text-foreground">
 {levelNum}
 </div>
 <div className="flex flex-col">
 <span className="text-xs font-medium text-foreground">
 {title}
 </span>
 <span className="text-[10px] text-muted-foreground">
 Level {levelNum} reached
 </span>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}
