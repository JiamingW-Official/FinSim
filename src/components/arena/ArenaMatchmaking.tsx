"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Crosshair, X } from "lucide-react";
import { ArenaRankBadge } from "./ArenaRankBadge";
import { findOpponent } from "@/data/arena/arena-npcs";
import { useArenaStore } from "@/stores/arena-store";
import { soundEngine } from "@/services/audio/sound-engine";
import type { ArenaTypeConfig, ArenaNPC } from "@/types/arena";

interface ArenaMatchmakingProps {
 config: ArenaTypeConfig;
 onMatchReady: (opponent: ArenaNPC) => void;
 onCancel: () => void;
}

type Phase = "searching" | "found" | "countdown" | "error";

export function ArenaMatchmaking({ config, onMatchReady, onCancel }: ArenaMatchmakingProps) {
 const elo = useArenaStore((s) => s.elo);
 const rank = useArenaStore((s) => s.rank);
 const [phase, setPhase] = useState<Phase>("searching");
 const [opponent, setOpponent] = useState<ArenaNPC | null>(null);
 const [countdown, setCountdown] = useState(3);

 // Escape key to cancel
 useEffect(() => {
 const handler = (e: KeyboardEvent) => {
 if (e.key === "Escape") onCancel();
 };
 window.addEventListener("keydown", handler);
 return () => window.removeEventListener("keydown", handler);
 }, [onCancel]);

 // Searching → found after 1.5s
 useEffect(() => {
 const t = setTimeout(() => {
 const opp = findOpponent(elo);
 if (!opp) {
 setPhase("error");
 return;
 }
 setOpponent(opp);
 setPhase("found");
 soundEngine.playMatchFound();
 }, 1500);
 return () => clearTimeout(t);
 }, [elo]);

 // Found → countdown after 1.5s
 useEffect(() => {
 if (phase !== "found") return;
 const t = setTimeout(() => setPhase("countdown"), 1500);
 return () => clearTimeout(t);
 }, [phase]);

 // Countdown 3-2-1-GO
 useEffect(() => {
 if (phase !== "countdown") return;
 if (countdown <= 0) {
 if (opponent) onMatchReady(opponent);
 return;
 }
 const t = setTimeout(() => setCountdown((c) => c - 1), 800);
 return () => clearTimeout(t);
 }, [phase, countdown, opponent, onMatchReady]);

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
 <AnimatePresence mode="wait">
 {phase === "searching" && (
 <motion.div
 key="searching"
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 className="flex flex-col items-center gap-6"
 >
 {/* Radar animation */}
 <div className="matchmaking-radar relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-red-500/30">
 <div className="absolute inset-0 animate-ping rounded-full border border-red-500/20" />
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
 >
 <Crosshair className="h-8 w-8 text-red-400" />
 </motion.div>
 </div>

 <div className="text-center">
 <p className="text-lg font-semibold text-foreground">Finding Opponent...</p>
 <p className="text-xs text-muted-foreground mt-1">Searching near {elo} ELO</p>
 <p className="text-xs text-muted-foreground/70 mt-0.5">{config.name} · {config.timeLimitSeconds}s</p>
 </div>

 <motion.button
 type="button"
 onClick={onCancel}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/20 px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
 >
 <X className="h-3 w-3" />
 Cancel
 <span className="text-[11px] text-muted-foreground/70 ml-1">(Esc)</span>
 </motion.button>
 </motion.div>
 )}

 {phase === "error" && (
 <motion.div
 key="error"
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex flex-col items-center gap-4"
 >
 <X className="h-12 w-12 text-red-400" />
 <p className="text-sm font-semibold text-foreground">No Opponent Found</p>
 <p className="text-xs text-muted-foreground">Try again in a moment.</p>
 <motion.button
 type="button"
 onClick={onCancel}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-red-400"
 >
 Back to Lobby
 </motion.button>
 </motion.div>
 )}

 {phase === "found" && opponent && (
 <motion.div
 key="found"
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0 }}
 className="flex flex-col items-center gap-6"
 >
 <motion.p
 className="text-sm font-semibold text-red-400"
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 >
 Match Found
 </motion.p>

 <div className="flex items-center gap-8">
 {/* Player */}
 <motion.div
 className="flex flex-col items-center gap-2"
 initial={{ x: -40, opacity: 0 }}
 animate={{ x: 0, opacity: 1 }}
 transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
 >
 <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-500/30 bg-cyan-500/10 text-2xl">
 
 </div>
 <span className="text-sm font-semibold text-foreground">You</span>
 <ArenaRankBadge rank={rank} size="sm" />
 <span className="text-xs text-muted-foreground tabular-nums">{elo} ELO</span>
 </motion.div>

 {/* VS */}
 <motion.div
 initial={{ scale: 0, rotate: -30 }}
 animate={{ scale: 1, rotate: 0 }}
 transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}
 className="text-lg font-semibold text-red-500"
 >
 VS
 </motion.div>

 {/* Opponent */}
 <motion.div
 className="flex flex-col items-center gap-2"
 initial={{ x: 40, opacity: 0 }}
 animate={{ x: 0, opacity: 1 }}
 transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
 >
 <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500/30 bg-red-500/5 text-2xl">
 
 </div>
 <span className="text-sm font-semibold text-foreground">{opponent.name}</span>
 <ArenaRankBadge rank={opponent.rank} size="sm" />
 <span className="text-xs text-muted-foreground tabular-nums">{opponent.elo} ELO</span>
 </motion.div>
 </div>

 <motion.p
 className="text-xs text-muted-foreground/70"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.5 }}
 >
 {config.name} · {config.timeLimitSeconds}s
 </motion.p>
 </motion.div>
 )}

 {phase === "countdown" && (
 <motion.div
 key="countdown"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center gap-4"
 >
 <AnimatePresence mode="wait">
 <motion.div
 key={countdown}
 initial={{ scale: 2, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.5, opacity: 0 }}
 transition={{ duration: 0.3 }}
 className={cn(
 "text-7xl font-semibold",
 countdown > 0 ? "text-red-400" : "text-emerald-400",
 )}
 >
 {countdown > 0 ? countdown : "GO!"}
 </motion.div>
 </AnimatePresence>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
