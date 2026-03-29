"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RankRow } from "./RankRow";
import { DIMENSIONS } from "@/types/leaderboard";
import type { RankedEntry, LeaderboardDimension } from "@/types/leaderboard";

interface LeaderboardTableProps {
  ranked: RankedEntry[];
  dimension: LeaderboardDimension;
}

const INITIAL_SHOW = 20;

export function LeaderboardTable({ ranked, dimension }: LeaderboardTableProps) {
  const [expanded, setExpanded] = useState(false);
  const dimConfig = DIMENSIONS.find((d) => d.id === dimension)!;

  const userRank = ranked.find((e) => e.isUser)?.rank ?? 0;
  const showAll = expanded || ranked.length <= INITIAL_SHOW;

  // Determine what to show
  const { topRows, separator, contextRows } = useMemo(() => {
    if (showAll) {
      return { topRows: ranked, separator: false, contextRows: [] as RankedEntry[] };
    }

    const top = ranked.slice(0, INITIAL_SHOW);
    const userInTop = userRank <= INITIAL_SHOW;

    if (userInTop) {
      return { topRows: top, separator: false, contextRows: [] as RankedEntry[] };
    }

    // User is outside top 20 — show context rows around user
    const userIdx = ranked.findIndex((e) => e.isUser);
    const start = Math.max(INITIAL_SHOW, userIdx - 1);
    const end = Math.min(ranked.length, userIdx + 2);
    const ctx = ranked.slice(start, end);

    return { topRows: top, separator: true, contextRows: ctx };
  }, [ranked, showAll, userRank]);

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      {/* Column header */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border/50">
        <span className="w-7 text-center text-[11px] font-bold text-muted-foreground">#</span>
        <span className="w-8" />
        <span className="flex-1 text-[11px] font-bold text-muted-foreground">Player</span>
        <span className="text-[11px] font-bold text-muted-foreground">{dimConfig.shortLabel}</span>
      </div>

      {/* Rows */}
      <AnimatePresence mode="wait">
        <motion.div
          key={dimension}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {topRows.map((entry, i) => (
            <RankRow key={entry.id} entry={entry} dimConfig={dimConfig} index={i} />
          ))}

          {/* Separator + context rows */}
          {separator && (
            <>
              <div className="flex items-center gap-3 px-3 py-1.5">
                <div className="flex-1 divider-glow" />
                <span className="text-xs text-muted-foreground/50 font-bold">···</span>
                <div className="flex-1 divider-glow" />
              </div>
              {contextRows.map((entry, i) => (
                <RankRow
                  key={entry.id}
                  entry={entry}
                  dimConfig={dimConfig}
                  index={INITIAL_SHOW + i}
                />
              ))}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Expand/collapse button */}
      {ranked.length > INITIAL_SHOW && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-1 border-t border-border/50 py-2 text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/30"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Show all {ranked.length}
            </>
          )}
        </button>
      )}
    </div>
  );
}
