"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, ChevronDown } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useGameStore } from "@/stores/game-store";
import { cn } from "@/lib/utils";

export function FeaturedAchievement() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const featuredId = useProfileStore((s) => s.featuredAchievementId);
  const setFeatured = useProfileStore((s) => s.setFeaturedAchievement);
  const achievements = useGameStore((s) => s.achievements);

  const featured = achievements.find((a) => a.id === featuredId);

  return (
    <div className="card-hover-glow rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <Star className="h-3.5 w-3.5" />
          Featured Achievement
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(!pickerOpen)}
          className="flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-[10px] font-bold text-amber-400/70 hover:bg-amber-500/10"
        >
          {featured ? "Change" : "Select"}
          <ChevronDown className={cn("h-3 w-3 transition-transform", pickerOpen && "rotate-180")} />
        </button>
      </div>

      {/* Featured display */}
      {featured ? (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-300">{featured.name}</p>
            <p className="text-[10px] text-muted-foreground">{featured.description ?? "Achievement unlocked"}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-3 text-[11px] text-muted-foreground">
          {achievements.length > 0
            ? "Select an achievement to showcase"
            : "Unlock achievements to feature them here"}
        </div>
      )}

      {/* Picker */}
      <AnimatePresence>
        {pickerOpen && achievements.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-amber-500/10 pt-2">
              {achievements.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setFeatured(a.id);
                    setPickerOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2 text-left transition-colors",
                    a.id === featuredId
                      ? "border-amber-500/30 bg-amber-500/10"
                      : "border-border/50 hover:bg-accent",
                  )}
                >
                  <Trophy className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span className="text-[10px] font-bold leading-tight truncate">
                    {a.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
