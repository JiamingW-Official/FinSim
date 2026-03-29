"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, CalendarDays } from "lucide-react";
import { QuestCard } from "./QuestCard";
import { useQuestStore } from "@/stores/quest-store";
import { getWeeklyQuests } from "@/data/quests/quest-seed";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function QuestWeeklyTab() {
  const dailyDate = useQuestStore((s) => s.dailyDate);
  const weeklyProgress = useQuestStore((s) => s.weeklyProgress);
  const claimQuest = useQuestStore((s) => s.claimQuest);
  const resetWeeklyIfNeeded = useQuestStore((s) => s.resetWeeklyIfNeeded);
  const checkQuests = useQuestStore((s) => s.checkQuests);

  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    resetWeeklyIfNeeded();
    checkQuests();
  }, [resetWeeklyIfNeeded, checkQuests]);

  // Countdown to next Monday — update every 10s for better accuracy
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const day = now.getDay();
      // Monday is day 1; if today is Monday, daysUntilMonday = 7, etc.
      const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      const diff = nextMonday.getTime() - now.getTime();

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);

      if (d > 0) {
        setCountdown(`${d}d ${pad(h)}h ${pad(m)}m`);
      } else {
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`${pad(h)}:${pad(m)}:${pad(s)}`);
      }
    };

    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  const quests = getWeeklyQuests(dailyDate || undefined);
  const allClaimed = quests.length > 0 && quests.every((q) => weeklyProgress[q.id]?.claimedAt);

  return (
    <div className="space-y-4">
      {/* Timer */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-lg border border-border/50 bg-foreground/[0.02] px-4 py-2.5"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Resets Monday</span>
        </div>
        <span className="text-sm font-bold font-mono tabular-nums text-muted-foreground">
          {countdown}
        </span>
      </motion.div>

      {/* All complete banner */}
      {allClaimed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-xs font-bold text-emerald-300">All weekly quests completed!</p>
            <p className="text-xs text-emerald-400/60">New quests arrive Monday.</p>
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
            <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No weekly quests available</p>
            <p className="text-xs text-muted-foreground/70">Check back on Monday!</p>
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
                progress={weeklyProgress[quest.id]}
                onClaim={(id) => claimQuest(id, "weekly")}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
