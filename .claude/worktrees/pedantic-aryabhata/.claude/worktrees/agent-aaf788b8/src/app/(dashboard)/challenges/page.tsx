"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Swords, Calendar, Scroll, Sparkles, Zap } from "lucide-react";
import { DailyTab } from "@/components/challenges/DailyTab";
import { ScenariosTab } from "@/components/challenges/ScenariosTab";
import { ChallengePlayer } from "@/components/challenges/ChallengePlayer";
import { useChallengeStore } from "@/stores/challenge-store";
import type { DailyChallengeDefinition, ScenarioDefinition } from "@/types/challenges";

type Tab = "daily" | "scenarios";

interface ActiveChallenge {
  mode: "daily" | "scenario";
  id: string;
  name: string;
  description: string;
  difficulty: string | number;
  xpReward: number;
  challenge: DailyChallengeDefinition["challenge"] | ScenarioDefinition["challenge"];
  gradingThresholds?: { S: number; A: number; B: number };
}

export default function ChallengesPage() {
  const [tab, setTab] = useState<Tab>("daily");
  const [active, setActive] = useState<ActiveChallenge | null>(null);

  const totalDailyCompleted = useChallengeStore((s) => s.totalDailyChallengesCompleted);
  const scenarioResults = useChallengeStore((s) => s.scenarioResults);
  const scenariosCompleted = Object.keys(scenarioResults).length;

  const handleSelectDaily = useCallback((def: DailyChallengeDefinition) => {
    setActive({
      mode: "daily",
      id: def.id,
      name: def.name,
      description: def.description,
      difficulty: def.difficulty,
      xpReward: def.xpReward,
      challenge: def.challenge,
    });
  }, []);

  const handleSelectScenario = useCallback((scenario: ScenarioDefinition) => {
    setActive({
      mode: "scenario",
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      difficulty: scenario.difficulty,
      xpReward: scenario.xpReward,
      challenge: scenario.challenge,
      gradingThresholds: scenario.gradingThresholds,
    });
  }, []);

  const handleClose = useCallback(() => {
    setActive(null);
  }, []);

  // Full-screen challenge player overlay
  if (active) {
    return (
      <div className="fixed inset-0 z-40 bg-background">
        <ChallengePlayer
          key={active.id}
          mode={active.mode}
          id={active.id}
          name={active.name}
          description={active.description}
          difficulty={active.difficulty}
          xpReward={active.xpReward}
          challenge={active.challenge}
          gradingThresholds={active.gradingThresholds}
          onClose={handleClose}
        />
      </div>
    );
  }

  const sRankCount = Object.values(scenarioResults).filter((r) => r.grade === "S").length;

  return (
    <div className="flex h-full flex-col">
      {/* ===== HEADER — gamified stats ===== */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Swords className="h-5 w-5 text-rose-400" />
          </motion.div>
          <div>
            <h1 className="text-lg font-black">Challenges</h1>
            <p className="text-[11px] text-muted-foreground">
              Test your skills & earn rewards
            </p>
          </div>
          <div className="flex-1" />
          <motion.div
            className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 15 }}
          >
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-black text-primary">
              {totalDailyCompleted + scenariosCompleted} total
            </span>
          </motion.div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-2 mt-3">
          <motion.div
            className="badge-premium flex items-center gap-1.5 rounded-lg px-3 py-1.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-black tabular-nums text-primary">{totalDailyCompleted}</span>
            <span className="text-[10px] text-muted-foreground">daily</span>
          </motion.div>

          <motion.div
            className="badge-gold flex items-center gap-1.5 rounded-lg px-3 py-1.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.05 }}
          >
            <Scroll className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-black tabular-nums text-amber-400">{scenariosCompleted}/8</span>
            <span className="text-[10px] text-muted-foreground">missions</span>
          </motion.div>

          {/* S-Rank count */}
          {sRankCount > 0 && (
            <motion.div
              className="flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-1.5 shimmer-gold"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
            >
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span className="text-amber-400 text-[11px] font-black">S x{sRankCount}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* ===== TABS — animated indicator ===== */}
      <div className="border-b border-border px-4">
        <div className="flex gap-0">
          <TabButton
            label="Daily"
            icon={<Calendar className="h-3.5 w-3.5" />}
            active={tab === "daily"}
            onClick={() => setTab("daily")}
          />
          <TabButton
            label="Scenarios"
            icon={<Scroll className="h-3.5 w-3.5" />}
            active={tab === "scenarios"}
            onClick={() => setTab("scenarios")}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {tab === "daily" ? (
          <DailyTab onSelectChallenge={handleSelectDaily} />
        ) : (
          <ScenariosTab onSelectScenario={handleSelectScenario} />
        )}
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
          layoutId="challenge-tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </button>
  );
}
