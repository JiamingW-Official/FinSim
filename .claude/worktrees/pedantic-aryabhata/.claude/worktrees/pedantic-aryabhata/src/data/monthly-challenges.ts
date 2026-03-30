// ── Monthly Challenge data ─────────────────────────────────────
// Three mega-challenges per month, resetting on the 1st.

export interface MonthlyChallenge {
 id: string;
 title: string;
 description: string;
 xpReward: number;
 /** Which stat to track progress against */
 metric: string;
 /** Absolute target value (progress is computed externally) */
 target: number;
 /** Short label shown on the progress bar, e.g. "20% return" */
 unit: string;
 /** Lucide icon name */
 icon: string;
}

export const MONTHLY_CHALLENGES: MonthlyChallenge[] = [
 {
 id: "mc_bull_mastery",
 title: "Bull Market Mastery",
 description:
 "Achieve a 20% monthly return in the simulation. Grow your portfolio through disciplined trading over the whole month.",
 xpReward: 5000,
 metric: "monthlyReturnPct",
 target: 20,
 unit: "% return",
 icon: "TrendingUp",
 },
 {
 id: "mc_options_expert",
 title: "Options Expert",
 description:
 "Execute 10 options strategies that each close with a positive P&L. Master spreads, condors, and straddles.",
 xpReward: 3000,
 metric: "optionsProfitableCount",
 target: 10,
 unit: "profitable options trades",
 icon: "FlaskConical",
 },
 {
 id: "mc_the_scholar",
 title: "The Scholar",
 description:
 "Complete 5 lessons and achieve an A grade or better on each one. Prove that you truly understand the material.",
 xpReward: 2000,
 metric: "aGradeLessons",
 target: 5,
 unit: "A-grade lessons",
 icon: "GraduationCap",
 },
];
