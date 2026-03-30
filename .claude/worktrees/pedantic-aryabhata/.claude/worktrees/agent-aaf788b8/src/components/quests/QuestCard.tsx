"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check, Gift, Star, ChevronRight, ArrowRight,
  BarChart3, TrendingUp, DollarSign, GraduationCap, Brain, Eye,
  Swords, FlaskConical, Crosshair, Sparkles, Layers, Crown,
  Footprints, BookOpen, Scroll, Award, Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { soundEngine } from "@/services/audio/sound-engine";
import type { QuestDefinition, QuestProgress } from "@/types/quests";

const QUEST_ICONS: Record<string, React.ReactNode> = {
  BarChart3: <BarChart3 className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  DollarSign: <DollarSign className="h-4 w-4" />,
  GraduationCap: <GraduationCap className="h-4 w-4" />,
  Star: <Star className="h-4 w-4" />,
  Brain: <Brain className="h-4 w-4" />,
  Eye: <Eye className="h-4 w-4" />,
  Swords: <Swords className="h-4 w-4" />,
  FlaskConical: <FlaskConical className="h-4 w-4" />,
  Crosshair: <Crosshair className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  Layers: <Layers className="h-4 w-4" />,
  Crown: <Crown className="h-4 w-4" />,
  Footprints: <Footprints className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  Scroll: <Scroll className="h-4 w-4" />,
  Award: <Award className="h-4 w-4" />,
  Save: <Save className="h-4 w-4" />,
};

const ROUTE_LABELS: Record<string, string> = {
  "/trade": "Trade",
  "/learn": "Learn",
  "/challenges": "Challenges",
  "/backtest": "Backtest",
  "/arena": "Arena",
};

interface QuestCardProps {
  quest: QuestDefinition;
  progress?: QuestProgress;
  onClaim: (questId: string) => void;
}

export function QuestCard({ quest, progress, onClaim }: QuestCardProps) {
  const router = useRouter();
  const isClaimed = !!progress?.claimedAt;
  const isComplete = !!progress?.isComplete;
  const conditionsMet = progress?.conditions.filter(Boolean).length ?? 0;
  const totalConditions = quest.conditions.length;
  const progressPercent = totalConditions > 0 ? (conditionsMet / totalConditions) * 100 : 0;

  const handleClaim = () => {
    soundEngine.playQuestComplete();
    onClaim(quest.id);
  };

  const routeLabel = quest.route ? ROUTE_LABELS[quest.route] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isClaimed ? { scale: 1.01, y: -1 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative rounded-lg border p-3 transition-all",
        isClaimed
          ? "border-green-500/20 bg-green-500/5"
          : isComplete
            ? "border-violet-500/30 bg-violet-500/5 shadow-sm shadow-violet-500/5"
            : "border-border/50 bg-muted/10 hover:border-border hover:bg-muted/20",
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Icon */}
        <motion.div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base",
            isClaimed
              ? "bg-green-500/15 text-green-400"
              : isComplete
                ? "bg-violet-500/15 text-violet-400"
                : "bg-muted/30 text-muted-foreground",
          )}
          animate={isComplete && !isClaimed ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, type: "tween" }}
        >
          {isClaimed ? <Check className="h-4 w-4" /> : (QUEST_ICONS[quest.icon] ?? <Star className="h-4 w-4" />)}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "text-sm font-bold truncate",
                isClaimed ? "text-green-300" : "text-foreground",
              )}
            >
              {quest.name}
            </h3>
            {isClaimed && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-0.5 text-[10px] font-bold text-green-400 shrink-0"
              >
                <Check className="h-2.5 w-2.5" />
                CLAIMED
              </motion.span>
            )}
          </div>

          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{quest.description}</p>

          {/* Condition progress labels */}
          <div className="mt-1.5 space-y-0.5">
            {quest.conditions.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <motion.div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    progress?.conditions[i] ? "bg-green-400" : "bg-muted",
                  )}
                  animate={progress?.conditions[i] ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3, type: "tween" }}
                />
                <span
                  className={cn(
                    "text-[11px] truncate",
                    progress?.conditions[i]
                      ? "text-green-400/80 line-through"
                      : "text-muted-foreground",
                  )}
                >
                  {c.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {!isClaimed && (
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted/30">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isComplete ? "bg-violet-500" : "bg-muted/80",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          )}
        </div>

        {/* Right column: XP + Claim/Go */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {/* XP badge */}
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5",
            isClaimed ? "bg-green-500/10" : "bg-amber-500/10",
          )}>
            <Star className={cn("h-3 w-3", isClaimed ? "text-green-400" : "text-amber-400")} />
            <span className={cn("text-[10px] font-bold", isClaimed ? "text-green-400" : "text-amber-400")}>
              {isClaimed ? "" : "+"}{quest.xpReward} XP
            </span>
          </div>

          {/* Claim button */}
          {isComplete && !isClaimed && (
            <motion.button
              type="button"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClaim}
              className="quest-claim flex items-center gap-1 rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-violet-500/25 transition-colors hover:bg-violet-400"
            >
              <Gift className="h-3 w-3" />
              Claim
              <ChevronRight className="h-3 w-3" />
            </motion.button>
          )}

          {/* "Go" navigation button — when quest is incomplete and has a route */}
          {!isComplete && !isClaimed && routeLabel && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(quest.route!)}
              className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-[10px] font-bold text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
            >
              {routeLabel}
              <ArrowRight className="h-3 w-3" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
