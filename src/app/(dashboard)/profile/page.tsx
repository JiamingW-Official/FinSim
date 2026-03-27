"use client";

import { motion } from "framer-motion";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CareerStats } from "@/components/profile/CareerStats";
import { FeaturedAchievement } from "@/components/profile/FeaturedAchievement";
import { RecentActivity } from "@/components/profile/RecentActivity";
import { StatsBreakdown } from "@/components/profile/StatsBreakdown";
import { ReportCard } from "@/components/profile/ReportCard";
import { AchievementsGrid } from "@/components/profile/AchievementsGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Zap, Trophy, ClipboardList } from "lucide-react";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
  },
};

export default function ProfilePage() {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <motion.div
        className="mx-auto w-full max-w-2xl space-y-4 p-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Profile Header */}
        <motion.div variants={fadeUp}>
          <ProfileHeader />
        </motion.div>

        {/* Career Stats */}
        <motion.div variants={fadeUp}>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
            Career Stats
          </div>
          <CareerStats />
        </motion.div>

        {/* Featured Achievement */}
        <motion.div variants={fadeUp}>
          <FeaturedAchievement />
        </motion.div>

        {/* Tabbed sections */}
        <motion.div variants={fadeUp}>
          <Tabs defaultValue="stats">
            <TabsList className="grid w-full grid-cols-4 mb-3">
              <TabsTrigger value="stats" className="flex items-center gap-1.5 text-[11px]">
                <TrendingUp className="h-3 w-3" />
                Stats
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-1.5 text-[11px]">
                <ClipboardList className="h-3 w-3" />
                Report
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-1.5 text-[11px]">
                <Trophy className="h-3 w-3" />
                Badges
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-1.5 text-[11px]">
                <Zap className="h-3 w-3" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Stats Deep-Dive */}
            <TabsContent value="stats">
              <div className="rounded-xl border border-border bg-card p-3">
                <StatsBreakdown />
              </div>
            </TabsContent>

            {/* Report Card */}
            <TabsContent value="report">
              <div className="rounded-xl border border-border bg-card p-3">
                <ReportCard />
              </div>
            </TabsContent>

            {/* Achievements */}
            <TabsContent value="achievements">
              <div className="rounded-xl border border-border bg-card p-3">
                <AchievementsGrid />
              </div>
            </TabsContent>

            {/* Recent Activity */}
            <TabsContent value="activity">
              <div className="rounded-xl border border-border bg-card p-3">
                <RecentActivity />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
