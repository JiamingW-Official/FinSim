"use client";

import { motion } from "framer-motion";
import { BookOpen, Trophy } from "lucide-react";
import { SCENARIO_MISSIONS } from "@/data/challenges/scenario-missions";
import { useChallengeStore } from "@/stores/challenge-store";
import { useGameStore } from "@/stores/game-store";
import { ScenarioCard } from "./ScenarioCard";
import type { ScenarioDefinition } from "@/types/challenges";

interface ScenariosTabProps {
  onSelectScenario: (scenario: ScenarioDefinition) => void;
}

export function ScenariosTab({ onSelectScenario }: ScenariosTabProps) {
  const scenarioResults = useChallengeStore((s) => s.scenarioResults);
  const playerLevel = useGameStore((s) => s.level);

  const completedCount = Object.keys(scenarioResults).length;
  const sRankCount = Object.values(scenarioResults).filter((r) => r.grade === "S").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Info banner */}
      <motion.div
        className="flex items-start gap-2.5 rounded-lg border border-amber-500/15 bg-amber-500/5 px-3.5 py-2.5"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <BookOpen className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-[11px] font-bold text-amber-400">Historical Missions</p>
          <p className="text-[10px] text-amber-400/70 leading-relaxed">
            Replay iconic market events. Learn how professionals navigated crashes, squeezes, and rallies.
          </p>
        </div>
      </motion.div>

      {/* Progress stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2 flex-1 min-w-[80px] rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / SCENARIO_MISSIONS.length) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
            {completedCount}/{SCENARIO_MISSIONS.length}
          </span>
        </div>
        {sRankCount > 0 && (
          <motion.div
            className="flex items-center gap-1 text-[10px] font-bold text-amber-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Trophy className="h-3 w-3" />
            {sRankCount} S-rank{sRankCount > 1 ? "s" : ""}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SCENARIO_MISSIONS.map((scenario, i) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            bestResult={scenarioResults[scenario.id]}
            playerLevel={playerLevel}
            index={i}
            onSelect={() => onSelectScenario(scenario)}
          />
        ))}
      </div>
    </div>
  );
}
