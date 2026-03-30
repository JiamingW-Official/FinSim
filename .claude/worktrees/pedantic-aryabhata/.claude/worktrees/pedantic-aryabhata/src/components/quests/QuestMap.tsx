"use client";

import { motion } from "framer-motion";
import { Check, Lock, MapPin, Milestone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuestStore } from "@/stores/quest-store";
import { useGameStore } from "@/stores/game-store";

// ── Map nodes ───────────────────────────────────────────────────

interface MapNode {
 id: string;
 label: string;
 sublabel: string;
 /** Minimum totalQuestsCompleted to unlock this node */
 requiredQuests: number;
 /** Minimum level to unlock */
 requiredLevel?: number;
 /** Human-readable next-step hint shown for the active node */
 nextHint?: string;
 tier: "start" | "beginner" | "intermediate" | "advanced" | "legend";
}

const MAP_NODES: MapNode[] = [
 {
 id: "node_start",
 label: "Start",
 sublabel: "Your journey begins",
 requiredQuests: 0,
 tier: "start",
 nextHint: "Complete your first quest",
 },
 {
 id: "node_beginner",
 label: "Beginner Quests",
 sublabel: "1 quest completed",
 requiredQuests: 1,
 tier: "beginner",
 nextHint: "Complete 5 quests total",
 },
 {
 id: "node_intermediate",
 label: "Intermediate",
 sublabel: "5 quests completed",
 requiredQuests: 5,
 tier: "intermediate",
 nextHint: "Complete 5 options trades",
 },
 {
 id: "node_advanced",
 label: "Advanced",
 sublabel: "15 quests completed",
 requiredQuests: 15,
 tier: "advanced",
 nextHint: "Reach Level 20",
 },
 {
 id: "node_legend",
 label: "Legend",
 sublabel: "30 quests completed",
 requiredQuests: 30,
 requiredLevel: 20,
 tier: "legend",
 nextHint: "You have reached the pinnacle",
 },
];

const TIER_COLORS: Record<string, string> = {
 start: "border-border bg-muted text-muted-foreground",
 beginner: "border-green-500/60 bg-green-500/10 text-green-400",
 intermediate: "border-cyan-500/60 bg-cyan-500/10 text-muted-foreground",
 advanced: "border-primary/60 bg-primary/10 text-primary",
 legend: "border-amber-500/60 bg-amber-500/10 text-amber-400",
};

const TIER_LINE_COLORS: Record<string, string> = {
 start: "bg-muted",
 beginner: "bg-green-500/40",
 intermediate: "bg-cyan-500/40",
 advanced: "bg-primary/40",
 legend: "bg-amber-500/40",
};

// ── Component ───────────────────────────────────────────────────

export function QuestMap() {
 const totalCompleted = useQuestStore((s) => s.totalQuestsCompleted);
 const level = useGameStore((s) => s.level);

 function isNodeUnlocked(node: MapNode): boolean {
 if (totalCompleted < node.requiredQuests) return false;
 if (node.requiredLevel && level < node.requiredLevel) return false;
 return true;
 }

 // Find the current "active" node — the furthest unlocked node that hasn't been
 // superseded by the next one being unlocked.
 const currentNodeIndex = (() => {
 let idx = 0;
 for (let i = 0; i < MAP_NODES.length; i++) {
 if (isNodeUnlocked(MAP_NODES[i])) idx = i;
 }
 return idx;
 })();

 const activeNode = MAP_NODES[currentNodeIndex];
 const nextNode = MAP_NODES[currentNodeIndex + 1] ?? null;

 return (
 <div className="space-y-5">
 {/* Next milestone hint */}
 {nextNode && (
 <motion.div
 initial={{ opacity: 0, y: -6 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex items-start gap-2.5 rounded-lg border border-cyan-500/15 bg-cyan-500/5 px-3.5 py-3"
 >
 <Milestone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
 <div>
 <p className="text-xs font-semibold text-muted-foreground">Next milestone</p>
 <p className="text-[11px] text-muted-foreground mt-0.5">{activeNode.nextHint}</p>
 <p className="text-xs text-muted-foreground/70 mt-0.5">
 {nextNode.sublabel} to reach <span className="text-muted-foreground font-semibold">{nextNode.label}</span>
 </p>
 </div>
 </motion.div>
 )}

 {/* Map path — horizontal scroll on small viewports */}
 <div className="overflow-x-auto pb-2">
 <div className="flex min-w-max items-center gap-0 px-1">
 {MAP_NODES.map((node, i) => {
 const unlocked = isNodeUnlocked(node);
 const isCurrent = i === currentNodeIndex;
 const isLast = i === MAP_NODES.length - 1;

 return (
 <div key={node.id} className="flex items-center">
 {/* Connector line before each node (except first) */}
 {i > 0 && (
 <motion.div
 className={cn(
 "h-0.5 w-12",
 unlocked ? TIER_LINE_COLORS[node.tier] : "bg-muted",
 )}
 initial={{ scaleX: 0, originX: 0 }}
 animate={{ scaleX: 1 }}
 transition={{ delay: i * 0.12, duration: 0.35 }}
 />
 )}

 {/* Node */}
 <div className="relative flex flex-col items-center gap-1.5">
 <motion.div
 initial={{ scale: 0, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ delay: i * 0.12, type: "spring", stiffness: 300, damping: 20 }}
 className="relative"
 >
 {/* Pulsing ring for current node */}
 {isCurrent && (
 <motion.div
 className={cn(
 "absolute inset-0 rounded-full border-2",
 TIER_COLORS[node.tier].split(" ")[0],
 )}
 animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
 />
 )}

 <div
 className={cn(
 "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors",
 unlocked
 ? TIER_COLORS[node.tier]
 : "border-border bg-card text-muted-foreground/50",
 )}
 >
 {!unlocked ? (
 <Lock className="h-4 w-4" />
 ) : isLast || (!isCurrent && unlocked) ? (
 <Check className="h-4 w-4" />
 ) : (
 <MapPin className="h-4 w-4" />
 )}
 </div>
 </motion.div>

 {/* Label below node */}
 <motion.div
 initial={{ opacity: 0, y: 4 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.12 + 0.1 }}
 className="flex flex-col items-center gap-0.5 text-center w-20"
 >
 <span
 className={cn(
 "text-xs font-semibold leading-tight",
 unlocked
 ? isCurrent
 ? "text-foreground"
 : "text-muted-foreground"
 : "text-muted-foreground/50",
 )}
 >
 {node.label}
 </span>
 <span className="text-[11px] text-muted-foreground/50 leading-tight">
 {node.sublabel}
 </span>
 </motion.div>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Progress summary */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.5 }}
 className="flex items-center justify-between rounded-lg border border-border bg-foreground/[0.02] px-4 py-2.5"
 >
 <span className="text-xs text-muted-foreground">Total quests completed</span>
 <div className="flex items-center gap-2">
 <span className="text-sm font-semibold tabular-nums text-foreground">{totalCompleted}</span>
 {nextNode && (
 <span className="text-xs text-muted-foreground/70">
 / {nextNode.requiredQuests} for {nextNode.label}
 </span>
 )}
 </div>
 </motion.div>
 </div>
 );
}
