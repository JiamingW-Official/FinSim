"use client";

import { GraduationCap, BookOpen, Flame } from "lucide-react";
import { useLearnStore } from "@/stores/learn-store";
import { HeartsDisplay } from "@/components/learn/HeartsDisplay";
import { DailyGoal } from "@/components/learn/DailyGoal";
import { SkillPath } from "@/components/learn/SkillPath";

export default function LearnPage() {
  const learningStreak = useLearnStore((s) => s.learningStreak);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h1 className="text-sm font-semibold">Trading Academy</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Learning streak */}
          {learningStreak > 0 && (
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-500">{learningStreak}</span>
            </div>
          )}
          {/* Daily goal */}
          <DailyGoal compact />
          {/* Hearts */}
          <HeartsDisplay compact />
        </div>
      </div>

      {/* Skill path content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-md">
          {/* Welcome / stats card */}
          <div className="glass mb-6 flex items-center gap-3 rounded-xl border border-border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold">Your Learning Path</h2>
              <p className="text-[10px] text-muted-foreground">
                Complete lessons to unlock new units. Master quizzes for more stars!
              </p>
            </div>
            <DailyGoal />
          </div>

          {/* Skill tree */}
          <SkillPath />
        </div>
      </div>
    </div>
  );
}
