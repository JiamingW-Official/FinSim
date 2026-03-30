"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Sun } from "lucide-react";
import { QuestCard } from "./QuestCard";
import { useQuestStore } from "@/stores/quest-store";
import { getDailyQuests } from "@/data/quests/quest-seed";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function QuestDailyTab() {
  const dailyDate = useQuestStore((s) => s.dailyDate);
  const dailyProgress = useQuestStore((s) => s.dailyProgress);
  const claimQuest = useQuestStore((s) => s.claimQuest);
  const resetDailyIfNeeded = useQuestStore((s) => s.resetDailyIfNeeded);
  const checkQuests = useQuestStore((s) => s.checkQuests);

  const [countdown, setCountdown] = useState("");

  // Ensure daily reset on mount
  useEffect(() => {
    resetDailyIfNeeded();
    checkQuests();
  }, [resetDailyIfNeeded, checkQuests]);

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${pad(h)}:${pad(m)}:${pad(s)}`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const quests = getDailyQuests(dailyDate || undefined);
  const allClaimed = quests.length > 0 && quests.every((q) => dailyProgress[q.id]?.claimedAt);

  return (
    <div className="space-y-4">
      {/* Timer */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5"
      >
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Clock className="h-3.5 w-3.5" />
          <span>Resets in</span>
        </div>
        <span className="text-sm font-bold font-mono tabular-nums text-zinc-300">
          {countdown}
        </span>
      </motion.div>

      {/* All complete banner */}
      {allClaimed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3"
        >
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <div>
            <p className="text-xs font-bold text-green-300">All daily quests completed!</p>
            <p className="text-[10px] text-green-400/60">Come back tomorrow for new quests.</p>
          </div>
        </motion.div>
      )}

      {/* Quest cards */}
      <div className="space-y-3">
        {quests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2 py-12 text-center"
          >
            <Sun className="h-8 w-8 text-zinc-700" />
            <p className="text-sm text-muted-foreground">No daily quests available</p>
            <p className="text-xs text-muted-foreground/60">Complete lessons and trades to unlock new quests</p>
          </motion.div>
        ) : (
          quests.map((quest, i) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <QuestCard
                quest={quest}
                progress={dailyProgress[quest.id]}
                onClaim={(id) => claimQuest(id, "daily")}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
