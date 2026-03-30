"use client";

import { motion } from "framer-motion";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CareerStats } from "@/components/profile/CareerStats";
import { FeaturedAchievement } from "@/components/profile/FeaturedAchievement";
import { RecentActivity } from "@/components/profile/RecentActivity";
import { StatsBreakdown } from "@/components/profile/StatsBreakdown";
import { BarChart3, TrendingUp, Zap } from "lucide-react";

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

        {/* Stats Deep-Dive */}
        <motion.div variants={fadeUp}>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-green-400" />
            Detailed Stats
          </div>
          <div className="card-hover-glow rounded-xl border border-border bg-card p-3">
            <StatsBreakdown />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeUp}>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-violet-400" />
            Recent Activity
          </div>
          <div className="card-hover-glow rounded-xl border border-border bg-card p-3">
            <RecentActivity />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
