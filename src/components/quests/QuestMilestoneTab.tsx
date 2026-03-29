"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Lock, Star, BarChart3, GraduationCap, Swords, FlaskConical, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MILESTONE_CHAINS } from "@/types/quests";
import { MILESTONE_QUESTS } from "@/data/quests/quest-pool";
import { useQuestStore } from "@/stores/quest-store";
import { soundEngine } from "@/services/audio/sound-engine";

const CHAIN_ICONS: Record<string, React.ReactNode> = {
  BarChart3: <BarChart3 className="h-4 w-4" />,
  GraduationCap: <GraduationCap className="h-4 w-4" />,
  Swords: <Swords className="h-4 w-4" />,
  FlaskConical: <FlaskConical className="h-4 w-4" />,
  Crown: <Crown className="h-4 w-4" />,
};

export function QuestMilestoneTab() {
  const milestoneProgress = useQuestStore((s) => s.milestoneProgress);
  const claimQuest = useQuestStore((s) => s.claimQuest);
  const checkQuests = useQuestStore((s) => s.checkQuests);

  useEffect(() => {
    checkQuests();
  }, [checkQuests]);

  const handleClaim = (questId: string) => {
    soundEngine.playQuestComplete();
    claimQuest(questId, "milestone");
  };

  return (
    <div className="space-y-4">
      {MILESTONE_CHAINS.map((chain, chainIdx) => {
        const chainQuests = MILESTONE_QUESTS.filter((q) => q.chainId === chain.id).sort(
          (a, b) => (a.chainIndex ?? 0) - (b.chainIndex ?? 0),
        );

        const claimedCount = chainQuests.filter((q) => milestoneProgress[q.id]?.claimedAt).length;
        const isChainComplete = claimedCount === chainQuests.length;

        return (
          <motion.div
            key={chain.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: chainIdx * 0.06 }}
            className={cn(
              "rounded-md border p-4 transition-colors",
              isChainComplete
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-border/20 bg-foreground/[0.02]",
            )}
          >
            {/* Chain header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                isChainComplete ? "bg-emerald-500/15 text-emerald-400" : "bg-foreground/5",
                chain.color,
              )}>
                {CHAIN_ICONS[chain.icon] ?? <Star className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn("text-sm font-semibold", chain.color)}>{chain.name}</h3>
                {/* Progress bar for the chain */}
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-foreground/5">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      isChainComplete ? "bg-emerald-500" : "bg-muted",
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${(claimedCount / chainQuests.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
              <span className={cn(
                "text-xs font-semibold tabular-nums",
                isChainComplete ? "text-emerald-400" : "text-muted-foreground/70",
              )}>
                {claimedCount}/{chainQuests.length}
              </span>
            </div>

            {/* Chain nodes */}
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide pb-1">
              {chainQuests.map((quest, i) => {
                const progress = milestoneProgress[quest.id];
                const isClaimed = !!progress?.claimedAt;
                const isComplete = !!progress?.isComplete;
                const isPrevClaimed = i === 0 || !!milestoneProgress[chainQuests[i - 1].id]?.claimedAt;
                const isLocked = !isPrevClaimed && !isClaimed;

                return (
                  <div key={quest.id} className="flex items-center">
                    {/* Connector line */}
                    {i > 0 && (
                      <motion.div
                        className={cn(
                          "h-0.5 w-6 shrink-0",
                          isClaimed
                            ? "bg-emerald-500/50"
                            : isComplete
                              ? "bg-primary/30"
                              : "bg-muted",
                        )}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: i * 0.08, duration: 0.3 }}
                      />
                    )}

                    {/* Node */}
                    <div className="relative group">
                      <motion.button
                        type="button"
                        disabled={!isComplete || isClaimed}
                        onClick={() => isComplete && !isClaimed && handleClaim(quest.id)}
                        whileHover={isComplete && !isClaimed ? { scale: 1.15 } : {}}
                        whileTap={isComplete && !isClaimed ? { scale: 0.9 } : {}}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 20 }}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                          isClaimed
                            ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                            : isComplete
                              ? "border-primary bg-primary/20 text-primary"
                              : isLocked
                                ? "border-border bg-card text-muted-foreground/50 cursor-not-allowed"
                                : "border-border bg-card text-muted-foreground",
                        )}
                      >
                        {isClaimed ? (
                          <Check className="h-4 w-4" />
                        ) : isLocked ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <Star className="h-3.5 w-3.5" />
                        )}
                      </motion.button>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm whitespace-nowrap">
                          <p className="text-xs font-semibold text-foreground">{quest.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{quest.description}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-2.5 w-2.5 text-amber-400" />
                            <span className="text-xs font-semibold text-amber-400">+{quest.xpReward} XP</span>
                          </div>
                          {isClaimed && (
                            <span className="text-[11px] text-emerald-400 mt-0.5 block">Claimed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
