"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, PartyPopper } from "lucide-react";
import { getDailyChallenges } from "@/data/challenges/daily-seed";
import { useChallengeStore } from "@/stores/challenge-store";
import { DailyChallengeCard } from "./DailyChallengeCard";
import type { DailyChallengeDefinition } from "@/types/challenges";

interface DailyTabProps {
  onSelectChallenge: (def: DailyChallengeDefinition) => void;
}

const DAILY_TIPS = [
  "Daily challenges reset every 24 hours — come back tomorrow for new ones!",
  "Each challenge teaches a different trading skill. Try them all!",
  "Consistent daily practice builds trading intuition over time.",
];

export function DailyTab({ onSelectChallenge }: DailyTabProps) {
  const dailyProgress = useChallengeStore((s) => s.dailyProgress);

  const challenges = useMemo(() => getDailyChallenges(), []);
  const completedCount = challenges.filter((c) => dailyProgress[c.id]?.isComplete).length;
  const allDone = completedCount === challenges.length;

  const tipIdx = useMemo(() => Math.floor(Date.now() / (1000 * 60 * 60)) % DAILY_TIPS.length, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Progress + tip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: challenges.length }, (_, i) => (
              <motion.div
                key={i}
                className={`h-2 w-8 rounded-full ${i < completedCount ? "bg-primary" : "bg-muted"}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
            {completedCount}/{challenges.length}
          </span>
        </div>
      </div>

      {/* All complete celebration */}
      {allDone && (
        <motion.div
          className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <PartyPopper className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-400">All done for today!</p>
            <p className="text-xs text-emerald-400/70">Come back tomorrow for new challenges.</p>
          </div>
        </motion.div>
      )}

      {/* Educational tip */}
      {!allDone && (
        <motion.div
          className="flex items-start gap-2 rounded-lg border border-border/50 bg-card/30 px-3 py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary/50 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">{DAILY_TIPS[tipIdx]}</p>
        </motion.div>
      )}

      <div className="flex flex-col gap-3">
        {challenges.map((def, i) => (
          <DailyChallengeCard
            key={def.id}
            definition={def}
            progress={dailyProgress[def.id]}
            index={i}
            onSelect={() => onSelectChallenge(def)}
          />
        ))}
      </div>
    </div>
  );
}
