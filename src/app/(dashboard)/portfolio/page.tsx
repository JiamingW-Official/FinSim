"use client";

import dynamic from "next/dynamic";
import { PerformanceMetrics } from "@/components/portfolio/PerformanceMetrics";
import { TradeJournal } from "@/components/portfolio/TradeJournal";
import { useGameStore } from "@/stores/game-store";
import { Shield, BarChart3, BookOpen } from "lucide-react";

const EquityCurve = dynamic(
  () =>
    import("@/components/portfolio/EquityCurve").then(
      (mod) => mod.EquityCurve,
    ),
  { ssr: false },
);

export default function PortfolioPage() {
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const achievements = useGameStore((s) => s.achievements);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Portfolio Analytics</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">
                Lv.{level} {title}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/5 px-2.5 py-1">
              <span className="text-xs text-amber-500">
                {achievements.length} Achievements
              </span>
            </div>
          </div>
        </div>

        {/* Equity Curve */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            Equity Curve
          </div>
          <EquityCurve />
        </div>

        {/* Performance Metrics */}
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Performance Metrics
          </div>
          <PerformanceMetrics />
        </div>

        {/* Trade Journal */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            Trade Journal
          </div>
          <TradeJournal />
        </div>
      </div>
    </div>
  );
}
