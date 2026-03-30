"use client";

import { useLearnStore } from "@/stores/learn-store";
import { ProgressRing } from "@/components/game/ProgressRing";
import { motion } from "framer-motion";

interface DailyGoalProps {
 compact?: boolean;
}

export function DailyGoal({ compact }: DailyGoalProps) {
 const dailyLessonsCompleted = useLearnStore((s) => s.dailyLessonsCompleted);
 const dailyGoal = useLearnStore((s) => s.dailyGoal);

 const progress = Math.min(100, (dailyLessonsCompleted / dailyGoal) * 100);
 const goalMet = dailyLessonsCompleted >= dailyGoal;

 if (compact) {
 return (
 <div className="flex items-center gap-1.5">
 <ProgressRing progress={progress} size={20} strokeWidth={2.5}>
 <span className="text-[7px] font-semibold">{dailyLessonsCompleted}</span>
 </ProgressRing>
 <span className="text-xs text-muted-foreground">
 {dailyLessonsCompleted}/{dailyGoal}
 </span>
 </div>
 );
 }

 return (
 <motion.div
 className="flex items-center gap-3"
 animate={goalMet ? { scale: [1, 1.05, 1] } : {}}
 transition={{ duration: 0.5, type: "tween" }}
 >
 <ProgressRing progress={progress} size={40} strokeWidth={3.5}>
 <span className="text-xs font-semibold">{dailyLessonsCompleted}</span>
 </ProgressRing>
 <div>
 <p className="text-xs font-semibold">
 {goalMet ? "Goal Complete!" : "Daily Goal"}
 </p>
 <p className="text-xs text-muted-foreground">
 {dailyLessonsCompleted}/{dailyGoal} lessons today
 </p>
 </div>
 </motion.div>
 );
}
