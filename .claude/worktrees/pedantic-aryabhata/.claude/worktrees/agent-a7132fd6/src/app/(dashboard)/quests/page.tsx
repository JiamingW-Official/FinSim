"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollText, Calendar, CalendarDays, Trophy, Flame, Zap } from "lucide-react";
import { QuestDailyTab } from "@/components/quests/QuestDailyTab";
import { QuestWeeklyTab } from "@/components/quests/QuestWeeklyTab";
import { QuestMilestoneTab } from "@/components/quests/QuestMilestoneTab";
import { useQuestStore } from "@/stores/quest-store";

type Tab = "daily" | "weekly" | "milestones";

export default function QuestsPage() {
  const [tab, setTab] = useState<Tab>("daily");
  const totalCompleted = useQuestStore((s) => s.totalQuestsCompleted);
  const dailyStreak = useQuestStore((s) => s.dailyStreakCount);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <ScrollText className="h-5 w-5 text-cyan-400" />
          </motion.div>
          <div>
            <h1 className="text-lg font-black">Quest Board</h1>
            <p className="text-[11px] text-muted-foreground">
              Complete quests across all game modes
            </p>
          </div>
          <div className="flex-1" />
          <motion.div
            className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 15 }}
          >
            <Zap className="h-3 w-3 text-cyan-400" />
            <span className="text-[10px] font-black text-cyan-400">
              {totalCompleted} completed
            </span>
          </motion.div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-2 mt-3">
          <motion.div
            className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-black tabular-nums text-amber-400">{totalCompleted}</span>
            <span className="text-[10px] text-muted-foreground">total</span>
          </motion.div>

          {dailyStreak > 0 && (
            <motion.div
              className="flex items-center gap-1.5 rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-1.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-[11px] font-black tabular-nums text-orange-400">{dailyStreak}</span>
              <span className="text-[10px] text-muted-foreground">day streak</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border px-4">
        <div className="flex gap-0">
          <TabButton
            label="Daily"
            icon={<Calendar className="h-3.5 w-3.5" />}
            active={tab === "daily"}
            onClick={() => setTab("daily")}
          />
          <TabButton
            label="Weekly"
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            active={tab === "weekly"}
            onClick={() => setTab("weekly")}
          />
          <TabButton
            label="Milestones"
            icon={<Trophy className="h-3.5 w-3.5" />}
            active={tab === "milestones"}
            onClick={() => setTab("milestones")}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl">
          {tab === "daily" && <QuestDailyTab />}
          {tab === "weekly" && <QuestWeeklyTab />}
          {tab === "milestones" && <QuestMilestoneTab />}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
      {active && (
        <motion.span
          layoutId="quest-tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </button>
  );
}
