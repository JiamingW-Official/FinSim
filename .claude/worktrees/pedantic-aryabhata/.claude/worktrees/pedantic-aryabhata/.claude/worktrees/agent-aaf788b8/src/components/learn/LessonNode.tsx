"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/data/lessons/types";

interface LessonNodeProps {
  lesson: Lesson;
  isUnlocked: boolean;
  isCompleted: boolean;
  stars: number; // 0-3
  unitColor: string;
  delay: number;
}

function gradeToStars(grade: "S" | "A" | "B" | "C"): number {
  if (grade === "S") return 3;
  if (grade === "A") return 3;
  if (grade === "B") return 2;
  return 1;
}

export function LessonNode({
  lesson,
  isUnlocked,
  isCompleted,
  stars,
  unitColor,
  delay,
}: LessonNodeProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!isUnlocked) return;
    router.push(`/learn/${lesson.id}`);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={!isUnlocked}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={isUnlocked ? { y: -2, transition: { duration: 0.15 } } : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all w-full max-w-[280px]",
        isCompleted
          ? "border-[var(--unit-color)]/30 bg-[var(--unit-color)]/5"
          : isUnlocked
            ? "border-border hover:border-[var(--unit-color)]/50 hover:bg-accent/50 hover:shadow-sm cursor-pointer"
            : "border-border/30 opacity-50 cursor-not-allowed",
      )}
      style={{ "--unit-color": unitColor } as React.CSSProperties}
    >
      {/* Circle */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          isCompleted
            ? "border-[var(--unit-color)] bg-[var(--unit-color)]/20"
            : isUnlocked
              ? "border-[var(--unit-color)]/50 bg-card"
              : "border-muted bg-muted/30",
        )}
      >
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 12, delay: delay + 0.1 }}
          >
            <Check className="h-4 w-4" style={{ color: unitColor }} />
          </motion.div>
        ) : !isUnlocked ? (
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <div className="h-2 w-2 rounded-full" style={{ background: unitColor }} />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-semibold truncate",
          !isUnlocked && "text-muted-foreground",
        )}>
          {lesson.title}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          {lesson.description}
        </p>
        {/* Stars with shimmer */}
        {isCompleted && stars > 0 && (
          <div className="flex gap-0.5 mt-0.5">
            {[1, 2, 3].map((s) => (
              <motion.svg
                key={s}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 12,
                  delay: delay + 0.15 + s * 0.08,
                }}
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={s <= stars ? "#f59e0b" : "none"}
                  stroke={s <= stars ? "#f59e0b" : "currentColor"}
                  strokeWidth="2"
                  className={cn(
                    s > stars && "text-muted-foreground/30",
                    s <= stars && "shimmer-gold",
                  )}
                />
              </motion.svg>
            ))}
          </div>
        )}
      </div>

      {/* XP badge */}
      {isUnlocked && !isCompleted && (
        <span className="text-[10px] font-bold text-muted-foreground">
          +{lesson.xpReward} XP
        </span>
      )}

      {/* Active glow ring */}
      {isUnlocked && !isCompleted && (
        <div
          className="absolute -inset-0.5 rounded-lg pointer-events-none"
          style={{
            boxShadow: `0 0 8px ${unitColor}30, 0 0 20px ${unitColor}15`,
          }}
        />
      )}
    </motion.button>
  );
}

export { gradeToStars };
