"use client";

import type { PracticeChallenge } from "@/data/lessons/types";
import { useMiniSimulator } from "./useMiniSimulator";
import { MiniChart } from "./MiniChart";
import { MiniTradePanel } from "./MiniTradePanel";
import { ObjectiveTracker } from "./ObjectiveTracker";

interface MiniSimulatorProps {
  actionType: string;
  challenge: PracticeChallenge;
  instruction: string;
  onComplete: () => void;
}

export function MiniSimulator({
  actionType,
  challenge,
  instruction,
  onComplete,
}: MiniSimulatorProps) {
  const sim = useMiniSimulator(challenge);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-500">
          Practice
        </span>
        <span className="text-xs text-muted-foreground">{instruction}</span>
      </div>

      {/* Chart */}
      <MiniChart
        bars={challenge.priceData}
        revealedCount={sim.revealedCount}
        trades={sim.trades}
        activeIndicators={sim.activeIndicators}
        currentPrice={sim.currentPrice}
      />

      {/* Trade Controls */}
      <MiniTradePanel
        actionType={actionType}
        currentPrice={sim.currentPrice}
        cash={sim.cash}
        position={sim.position}
        unrealizedPnL={sim.unrealizedPnL}
        revealedCount={sim.revealedCount}
        totalBars={sim.totalBars}
        isPlaying={sim.isPlaying}
        activeIndicators={sim.activeIndicators}
        allComplete={sim.allComplete}
        onBuy={sim.buy}
        onSell={sim.sell}
        onAdvance={sim.advance}
        onPlay={sim.play}
        onPause={sim.pause}
        onToggleIndicator={sim.toggleIndicator}
      />

      {/* Hint */}
      {challenge.hint && !sim.allComplete && (
        <p className="text-[11px] text-muted-foreground/70 italic px-1">
          Hint: {challenge.hint}
        </p>
      )}

      {/* Objectives */}
      <ObjectiveTracker
        objectives={challenge.objectives}
        completedObjectives={sim.completedObjectives}
        allComplete={sim.allComplete}
        onContinue={onComplete}
      />
    </div>
  );
}
