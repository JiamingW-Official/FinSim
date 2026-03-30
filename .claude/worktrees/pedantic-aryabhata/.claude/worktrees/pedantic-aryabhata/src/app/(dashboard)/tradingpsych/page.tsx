"use client";

import { useState, useMemo, useCallback } from "react";
import {
 Brain,
 CheckCircle2,
 Circle,
 TrendingUp,
 TrendingDown,
 AlertTriangle,
 Lightbulb,
 Target,
 BookOpen,
 Activity,
 Heart,
 RefreshCw,
 ChevronRight,
 Star,
 Clock,
 Zap,
 Shield,
 Eye,
 BarChart2,
 Award,
 Flame,
 Wind,
 Sun,
 Moon,
 Coffee,
 Dumbbell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 752006;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

type BiasType =
 | "overconfidence"
 | "loss_aversion"
 | "confirmation"
 | "recency"
 | "fomo";

interface QuizQuestion {
 id: number;
 scenario: string;
 choices: { text: string; bias: BiasType; weight: number }[];
}

interface BiasScore {
 bias: BiasType;
 label: string;
 score: number;
 color: string;
 description: string;
 strategies: string[];
}

type EmotionalState =
 | "euphoria"
 | "excitement"
 | "optimism"
 | "neutral"
 | "anxiety"
 | "fear"
 | "panic"
 | "despair"
 | "relief"
 | "hope";

interface EmotionalPhase {
 state: EmotionalState;
 label: string;
 tradeQuality: number; // 0–100
 angle: number; // degrees on cycle
 description: string;
 strategies: string[];
 color: string;
}

interface ChecklistItem {
 id: string;
 text: string;
 category: string;
}

interface ReviewCriteria {
 category: string;
 label: string;
 questions: string[];
 weight: number;
}

interface PeakTechnique {
 id: string;
 title: string;
 duration: string;
 difficulty: "Easy" | "Medium" | "Hard";
 description: string;
 steps: string[];
 icon: React.ReactNode;
}

// ── Quiz Data ─────────────────────────────────────────────────────────────────

const QUIZ_QUESTIONS: QuizQuestion[] = [
 {
 id: 1,
 scenario:
 "You've had 5 winning trades in a row. A new setup appears that's slightly below your usual criteria. You:",
 choices: [
 {
 text: "Take the trade — your current read on the market is excellent",
 bias: "overconfidence",
 weight: 3,
 },
 {
 text: "Skip it — doesn't meet your full criteria",
 bias: "loss_aversion",
 weight: 1,
 },
 {
 text: "Check if recent winners confirm this pattern",
 bias: "confirmation",
 weight: 2,
 },
 {
 text: "Take it because 5-win streaks don't last",
 bias: "recency",
 weight: 2,
 },
 ],
 },
 {
 id: 2,
 scenario:
 "A stock you watch has surged 12% while you were away from the desk. You:",
 choices: [
 {
 text: "Chase it — fear of missing more gains",
 bias: "fomo",
 weight: 3,
 },
 {
 text: "Buy because it confirms your earlier thesis",
 bias: "confirmation",
 weight: 2,
 },
 {
 text: "Wait for a pullback — 12% moves always retrace",
 bias: "recency",
 weight: 2,
 },
 {
 text: "Pass — high risk at extended levels",
 bias: "loss_aversion",
 weight: 1,
 },
 ],
 },
 {
 id: 3,
 scenario:
 "Your position is down 8% and at your stop level. You see a bullish tweet from an analyst you trust. You:",
 choices: [
 {
 text: "Hold — the analyst sees something you missed",
 bias: "confirmation",
 weight: 3,
 },
 {
 text: "Add to average down — conviction is still high",
 bias: "overconfidence",
 weight: 3,
 },
 {
 text: "Close — stick to the plan, the stop is there for a reason",
 bias: "loss_aversion",
 weight: 1,
 },
 {
 text: "Move stop lower to avoid locking in a loss",
 bias: "loss_aversion",
 weight: 3,
 },
 ],
 },
 {
 id: 4,
 scenario:
 "Last month was brutal — every breakout failed. A classic breakout setup appears today. You:",
 choices: [
 {
 text: "Skip it — breakouts have been failing lately",
 bias: "recency",
 weight: 3,
 },
 {
 text: "Take half size — recency bias is a real concern",
 bias: "recency",
 weight: 1,
 },
 {
 text: "Only enter if it hits your full confirmation checklist",
 bias: "confirmation",
 weight: 1,
 },
 {
 text: "Take full size — your analysis says this is the one",
 bias: "overconfidence",
 weight: 2,
 },
 ],
 },
 {
 id: 5,
 scenario:
 "A friend brags about making 40% on a crypto trade you passed on. You:",
 choices: [
 {
 text: "Immediately research similar coins to catch the next wave",
 bias: "fomo",
 weight: 3,
 },
 {
 text: "Feel relieved you avoided the risk — crypto is too volatile",
 bias: "loss_aversion",
 weight: 2,
 },
 {
 text: "Analyze why you missed it and adjust your watchlist",
 bias: "confirmation",
 weight: 1,
 },
 {
 text: "Assume your friend got lucky — fundamentals don't support it",
 bias: "confirmation",
 weight: 2,
 },
 ],
 },
 {
 id: 6,
 scenario:
 "You're researching a company and find one bearish article amid 10 bullish ones. You:",
 choices: [
 {
 text: "Discard the bearish article — consensus is bullish",
 bias: "confirmation",
 weight: 3,
 },
 {
 text: "Dig deeper into the bearish article to find flaws in it",
 bias: "confirmation",
 weight: 2,
 },
 {
 text: "Give both equal weight in your analysis",
 bias: "recency",
 weight: 1,
 },
 {
 text: "Avoid the trade — the risk of being wrong is too high",
 bias: "loss_aversion",
 weight: 2,
 },
 ],
 },
 {
 id: 7,
 scenario:
 "You've been flat for 3 weeks. A high-risk, high-reward setup emerges. You:",
 choices: [
 {
 text: "Take it with double your normal size to make up lost ground",
 bias: "overconfidence",
 weight: 3,
 },
 {
 text: "Take it at normal size — it fits your criteria",
 bias: "fomo",
 weight: 1,
 },
 {
 text: "Skip it — you've been wrong a lot lately",
 bias: "recency",
 weight: 2,
 },
 {
 text: "Take it but set a tighter stop to protect capital",
 bias: "loss_aversion",
 weight: 2,
 },
 ],
 },
 {
 id: 8,
 scenario:
 "Market opens gap-up 3%, well above your planned entry. You:",
 choices: [
 {
 text: "Buy immediately — you'll miss the whole move otherwise",
 bias: "fomo",
 weight: 3,
 },
 {
 text: "Wait — your plan said entry at X, not X+3%",
 bias: "loss_aversion",
 weight: 1,
 },
 {
 text: "Buy because gap-ups have been running all week",
 bias: "recency",
 weight: 2,
 },
 {
 text: "Buy because you're confident in the direction",
 bias: "overconfidence",
 weight: 2,
 },
 ],
 },
 {
 id: 9,
 scenario:
 "You have a 20% profit on a trade. Your target is 30%. The stock starts to pull back slightly. You:",
 choices: [
 {
 text: "Sell everything — 20% is great and pullbacks hurt",
 bias: "loss_aversion",
 weight: 3,
 },
 {
 text: "Hold — your analysis still says 30% is achievable",
 bias: "overconfidence",
 weight: 2,
 },
 {
 text: "Trail your stop but let it run to target",
 bias: "recency",
 weight: 1,
 },
 {
 text: "Add to the position — pullbacks near highs are buying opportunities",
 bias: "confirmation",
 weight: 2,
 },
 ],
 },
 {
 id: 10,
 scenario:
 "A sector you've never traded is on fire — every stock up 10%+ for two weeks. You:",
 choices: [
 {
 text: "Jump in — the momentum is undeniable",
 bias: "fomo",
 weight: 3,
 },
 {
 text: "Avoid it — you don't know this sector well enough",
 bias: "loss_aversion",
 weight: 2,
 },
 {
 text: "Research quickly and enter your top pick",
 bias: "overconfidence",
 weight: 2,
 },
 {
 text: "Assume the trend will continue since it has for two weeks",
 bias: "recency",
 weight: 3,
 },
 ],
 },
];

const BIAS_META: Record<
 BiasType,
 { label: string; color: string; description: string; strategies: string[] }
> = {
 overconfidence: {
 label: "Overconfidence",
 color: "#f97316",
 description:
 "You tend to overestimate your abilities and the accuracy of your analysis. This leads to oversizing, ignoring stop-losses, and taking substandard setups after winning streaks.",
 strategies: [
 "Keep a detailed trade journal and review win rates objectively",
 "Use fixed position sizing — never size up because of a hot streak",
 "Set hard rules before entering a trade and never adjust them mid-trade",
 "Ask yourself: 'What would have to be true for me to be wrong here?'",
 ],
 },
 loss_aversion: {
 label: "Loss Aversion",
 color: "#3b82f6",
 description:
 "Losses feel approximately 2× more painful than equivalent gains feel pleasurable. You cut winners early, move stops to avoid realizing losses, and may avoid good trades due to fear of being wrong.",
 strategies: [
 "Reframe risk in terms of R-multiples, not dollar amounts",
 "Pre-commit to stops before entry — treat them as non-negotiable",
 "Review past trades where holding to target outperformed early exits",
 "Practice accepting small losses as the cost of doing business",
 ],
 },
 confirmation: {
 label: "Confirmation Bias",
 color: "#8b5cf6",
 description:
 "You seek information that supports your existing view and dismiss contradictory evidence. This creates blind spots, leads to averaging into losers, and prevents objective re-evaluation.",
 strategies: [
 "Actively seek the strongest bear case for any position you hold",
 "Have a pre-defined list of conditions that would invalidate your thesis",
 "Read analysis from traders with opposing views",
 "Do a 'pre-mortem': assume the trade fails and identify why",
 ],
 },
 recency: {
 label: "Recency Bias",
 color: "#10b981",
 description:
 "You overweight recent events and assume current conditions will persist. This leads to abandoning good strategies after drawdowns and over-trading in favorable conditions.",
 strategies: [
 "Review strategy performance over 100+ trade samples, not recent weeks",
 "Maintain a 'base rate' document for each setup based on historical data",
 "Implement mandatory cooling-off periods after both wins and losses",
 "Ask: 'Would this decision look the same if last week were reversed?'",
 ],
 },
 fomo: {
 label: "FOMO",
 color: "#ef4444",
 description:
 "Fear of missing out drives impulsive entries at extended prices, chasing moves, and abandoning disciplined entry criteria. It's especially triggered by social media and peer comparisons.",
 strategies: [
 "Write your entry criteria before the market opens and stick to them",
 "Keep a 'missed trades' log — review how many would have been losers",
 "Remind yourself: there is always another trade; capital preservation first",
 "Mute social media and chat rooms during trading hours",
 ],
 },
};

// ── Emotional Cycle Data ──────────────────────────────────────────────────────

const EMOTIONAL_PHASES: EmotionalPhase[] = [
 {
 state: "euphoria",
 label: "Euphoria",
 tradeQuality: 15,
 angle: 0,
 description: "Maximum financial risk. Feeling invincible after a winning run.",
 strategies: [
 "Force a size reduction to 50% of normal",
 "Take a planned break from trading",
 "Review your last 5 trades for any luck vs. skill factors",
 ],
 color: "#f97316",
 },
 {
 state: "excitement",
 label: "Excitement",
 tradeQuality: 30,
 angle: 36,
 description: "High confidence, starting to bend rules slightly.",
 strategies: [
 "Double-check position sizing rules",
 "Review your trading plan before each entry",
 ],
 color: "#fb923c",
 },
 {
 state: "optimism",
 label: "Optimism",
 tradeQuality: 65,
 angle: 72,
 description: "Positive outlook, generally following the process.",
 strategies: [
 "Good zone — maintain discipline and stick to your plan",
 "Log what's working to reinforce positive patterns",
 ],
 color: "#22c55e",
 },
 {
 state: "neutral",
 label: "Neutral",
 tradeQuality: 80,
 angle: 108,
 description: "Optimal trading state. Objective, process-focused.",
 strategies: [
 "Peak zone — this is where best decisions happen",
 "Notice what conditions created this state and recreate them",
 ],
 color: "#10b981",
 },
 {
 state: "anxiety",
 label: "Anxiety",
 tradeQuality: 55,
 angle: 180,
 description: "Worry about current positions or recent losses creeping in.",
 strategies: [
 "Reduce size by 25% until anxiety subsides",
 "Box breathing: 4 counts in, hold 4, out 4, hold 4",
 ],
 color: "#eab308",
 },
 {
 state: "fear",
 label: "Fear",
 tradeQuality: 35,
 angle: 216,
 description: "Avoiding good setups, second-guessing signals.",
 strategies: [
 "Step away from the screen for 15 minutes",
 "Review your edge — remind yourself why it works",
 ],
 color: "#f97316",
 },
 {
 state: "panic",
 label: "Panic",
 tradeQuality: 10,
 angle: 252,
 description: "Irrational decisions, impulsive closes, maximum risk.",
 strategies: [
 "Close all positions and step away immediately",
 "Do not re-enter until you've journaled what happened",
 ],
 color: "#ef4444",
 },
 {
 state: "despair",
 label: "Despair",
 tradeQuality: 20,
 angle: 288,
 description: "Loss of confidence, questioning your entire approach.",
 strategies: [
 "Paper trade only until confidence rebuilds",
 "Talk to a trading mentor or peer",
 ],
 color: "#dc2626",
 },
 {
 state: "relief",
 label: "Relief",
 tradeQuality: 50,
 angle: 324,
 description: "Recovery after a loss — still vulnerable to revenge trading.",
 strategies: [
 "Maintain reduced size — relief can mask ongoing impairment",
 "Ensure your next trade has A+ criteria only",
 ],
 color: "#60a5fa",
 },
];

// ── Checklist Data ────────────────────────────────────────────────────────────

const PROCESS_CHECKLISTS: Record<string, ChecklistItem[]> = {
 "Pre-Market Routine": [
 { id: "pm1", text: "Review overnight news and gap analysis", category: "Pre-Market Routine" },
 { id: "pm2", text: "Check economic calendar for scheduled events", category: "Pre-Market Routine" },
 { id: "pm3", text: "Update watchlist with key levels marked", category: "Pre-Market Routine" },
 { id: "pm4", text: "Review open positions and adjust stops if needed", category: "Pre-Market Routine" },
 { id: "pm5", text: "Set max daily loss limit before first trade", category: "Pre-Market Routine" },
 { id: "pm6", text: "Brief physical warm-up or 5-min meditation", category: "Pre-Market Routine" },
 { id: "pm7", text: "Review yesterday's journal entry and key lesson", category: "Pre-Market Routine" },
 ],
 "Trade Planning": [
 { id: "tp1", text: "Define the setup type (breakout / pullback / reversal)", category: "Trade Planning" },
 { id: "tp2", text: "Identify precise entry trigger (not zone — exact condition)", category: "Trade Planning" },
 { id: "tp3", text: "Set stop loss before entry — based on structure, not dollars", category: "Trade Planning" },
 { id: "tp4", text: "Identify T1 (partial profit) and T2 (full target) levels", category: "Trade Planning" },
 { id: "tp5", text: "Calculate R:R — must be ≥ 2:1 before entry", category: "Trade Planning" },
 { id: "tp6", text: "Write the invalidation condition explicitly", category: "Trade Planning" },
 { id: "tp7", text: "Consider catalyst risk (earnings / news) timing", category: "Trade Planning" },
 ],
 "Position Sizing": [
 { id: "ps1", text: "Risk no more than 1–2% of account per trade", category: "Position Sizing" },
 { id: "ps2", text: "Never size up after wins — use fixed risk rules", category: "Position Sizing" },
 { id: "ps3", text: "Reduce size by 50% after 3 consecutive losses", category: "Position Sizing" },
 { id: "ps4", text: "Maximum 3 open positions at any time", category: "Position Sizing" },
 { id: "ps5", text: "Check correlated exposure before adding new position", category: "Position Sizing" },
 { id: "ps6", text: "Account for spread and commissions in R calculation", category: "Position Sizing" },
 ],
 "Stop Discipline": [
 { id: "sd1", text: "Stop is set at trade entry — not after entry", category: "Stop Discipline" },
 { id: "sd2", text: "Stop is based on price structure, not personal tolerance", category: "Stop Discipline" },
 { id: "sd3", text: "Never widen a stop to 'give it more room'", category: "Stop Discipline" },
 { id: "sd4", text: "Trail stop only in the direction of the trade", category: "Stop Discipline" },
 { id: "sd5", text: "If stop is hit: close first, analyze later", category: "Stop Discipline" },
 { id: "sd6", text: "Move stop to break-even once trade reaches 1R profit", category: "Stop Discipline" },
 ],
};

// ── Post-Trade Review ─────────────────────────────────────────────────────────

const REVIEW_CRITERIA: ReviewCriteria[] = [
 {
 category: "Setup",
 label: "Setup Quality",
 questions: [
 "Did the setup meet all of my entry criteria?",
 "Was the risk/reward ratio at least 2:1?",
 "Was the entry point well-defined before I entered?",
 "Was there a clear catalyst or edge identified?",
 ],
 weight: 25,
 },
 {
 category: "Execution",
 label: "Execution Quality",
 questions: [
 "Did I enter at the planned level (within acceptable slippage)?",
 "Did I size correctly per my position sizing rules?",
 "Was the stop placed at the pre-defined level?",
 "Did I act on the signal, not emotion?",
 ],
 weight: 25,
 },
 {
 category: "Management",
 label: "Trade Management",
 questions: [
 "Did I take partial profits at T1 if planned?",
 "Did I trail the stop appropriately as the trade moved?",
 "Did I stay within my plan, or improvise?",
 "Did I avoid adding to a losing position?",
 ],
 weight: 25,
 },
 {
 category: "Outcome",
 label: "Outcome Analysis",
 questions: [
 "Was the P&L result consistent with my process quality?",
 "What would I do differently next time?",
 "Is there a pattern or lesson to extract?",
 "Did emotion influence any decision during this trade?",
 ],
 weight: 25,
 },
];

// ── Peak Performance Techniques ───────────────────────────────────────────────

const PEAK_TECHNIQUES: PeakTechnique[] = [
 {
 id: "visualization",
 title: "Mental Rehearsal",
 duration: "10 min",
 difficulty: "Medium",
 description:
 "Visualize your ideal trading session in vivid detail before the market opens. Rehearse both winning and losing scenarios with calm, process-focused responses.",
 steps: [
 "Sit comfortably, close eyes, take 3 deep breaths",
 "Visualize your workspace and charts loading",
 "See yourself identifying a setup — methodically, without rushing",
 "Visualize executing the entry exactly as planned",
 "Rehearse the stop being hit — see yourself closing calmly and recording the trade",
 "Visualize a winning trade — see yourself taking profits at target, not early",
 "Open eyes and begin your pre-market routine",
 ],
 icon: <Eye className="w-5 h-5" />,
 },
 {
 id: "breathing",
 title: "Box Breathing",
 duration: "4 min",
 difficulty: "Easy",
 description:
 "Used by Navy SEALs and elite athletes to activate the parasympathetic nervous system. Proven to reduce cortisol and restore prefrontal cortex function when you're in fight-or-flight.",
 steps: [
 "Inhale slowly for 4 counts",
 "Hold breath for 4 counts",
 "Exhale slowly for 4 counts",
 "Hold empty for 4 counts",
 "Repeat 4–6 cycles",
 "Use before trading, after a loss, or whenever anxiety spikes",
 ],
 icon: <Wind className="w-5 h-5" />,
 },
 {
 id: "mindfulness",
 title: "Mindfulness Check-In",
 duration: "2 min",
 difficulty: "Easy",
 description:
 "A brief body scan and awareness exercise to identify emotional states before they influence decisions. Research shows traders who check in before each trade improve decision quality by up to 31%.",
 steps: [
 "Pause before clicking 'Buy' or 'Sell'",
 "Notice your physical state: tense? Heart racing? Shoulders tight?",
 "Name the emotion if present: fear, greed, excitement, frustration",
 "Ask: 'Am I trading my plan or my emotion right now?'",
 "Only proceed if you can answer honestly: 'My plan'",
 ],
 icon: <Brain className="w-5 h-5" />,
 },
 {
 id: "flow",
 title: "Flow State Triggers",
 duration: "15 min",
 difficulty: "Hard",
 description:
 "Flow state — where performance peaks — requires challenge slightly exceeding skill level, clear goals, and immediate feedback. Deliberately structure your trading environment to invite flow.",
 steps: [
 "Remove all distractions: close browser tabs, silence phone",
 "Set a specific, process-focused goal (not P&L) for the session",
 "Trade only your best 1–2 setups — complexity breaks flow",
 "Use the same music/environment routine that preceded past good sessions",
 "Review your edge stats before starting to reinforce self-efficacy",
 "Start with smaller size until you feel 'in the zone'",
 ],
 icon: <Zap className="w-5 h-5" />,
 },
 {
 id: "physical",
 title: "Physical Performance Protocol",
 duration: "Daily",
 difficulty: "Medium",
 description:
 "Cognitive performance, risk tolerance, and emotional regulation are all directly impacted by sleep quality, exercise, and nutrition. The best traders treat their body as a trading instrument.",
 steps: [
 "Sleep 7–9 hours — sleep deprivation increases risk tolerance dangerously",
 "Morning exercise (30+ min) increases BDNF and prefrontal activation",
 "Avoid heavy meals before trading — blood glucose spikes impair focus",
 "Stay hydrated — even 2% dehydration reduces cognitive performance",
 "Limit caffeine after noon to protect sleep quality",
 "Take screen breaks every 90 minutes — cognitive stamina follows ultradian rhythms",
 ],
 icon: <Dumbbell className="w-5 h-5" />,
 },
];

// ── Radar Chart Component ─────────────────────────────────────────────────────

function BiasRadarChart({ scores }: { scores: BiasScore[] }) {
 const cx = 150;
 const cy = 150;
 const r = 110;
 const n = scores.length;

 const getPoint = (index: number, value: number) => {
 const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
 const radius = (value / 100) * r;
 return {
 x: cx + radius * Math.cos(angle),
 y: cy + radius * Math.sin(angle),
 };
 };

 const getLabelPoint = (index: number) => {
 const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
 const radius = r + 22;
 return {
 x: cx + radius * Math.cos(angle),
 y: cy + radius * Math.sin(angle),
 };
 };

 const gridLevels = [20, 40, 60, 80, 100];

 const polygonPoints = scores
 .map((s, i) => {
 const pt = getPoint(i, s.score);
 return `${pt.x},${pt.y}`;
 })
 .join(" ");

 return (
 <svg viewBox="0 0 300 300" className="w-full max-w-xs mx-auto">
 {/* Grid rings */}
 {gridLevels.map((level) => {
 const points = scores
 .map((_, i) => {
 const pt = getPoint(i, level);
 return `${pt.x},${pt.y}`;
 })
 .join(" ");
 return (
 <polygon
 key={level}
 points={points}
 fill="none"
 stroke="rgb(255,255,255,0.08)"
 strokeWidth="1"
 />
 );
 })}

 {/* Axis lines */}
 {scores.map((_, i) => {
 const outer = getPoint(i, 100);
 return (
 <line
 key={i}
 x1={cx}
 y1={cy}
 x2={outer.x}
 y2={outer.y}
 stroke="rgb(255,255,255,0.1)"
 strokeWidth="1"
 />
 );
 })}

 {/* Data polygon */}
 <polygon
 points={polygonPoints}
 fill="rgba(99,102,241,0.25)"
 stroke="#6366f1"
 strokeWidth="2"
 />

 {/* Data points */}
 {scores.map((score, i) => {
 const pt = getPoint(i, score.score);
 return (
 <circle key={i} cx={pt.x} cy={pt.y} r={4} fill={score.color} />
 );
 })}

 {/* Labels */}
 {scores.map((score, i) => {
 const lp = getLabelPoint(i);
 return (
 <text
 key={i}
 x={lp.x}
 y={lp.y}
 textAnchor="middle"
 dominantBaseline="middle"
 fontSize="9"
 fill={score.color}
 fontWeight="600"
 >
 {score.label.split(" ")[0]}
 </text>
 );
 })}
 </svg>
 );
}

// ── Emotional Cycle SVG ───────────────────────────────────────────────────────

function EmotionalCycleChart({
 selectedState,
 onSelect,
}: {
 selectedState: EmotionalState | null;
 onSelect: (state: EmotionalState) => void;
}) {
 const cx = 160;
 const cy = 160;
 const r = 110;

 const getPoint = (angleDeg: number, radius = r) => {
 const angle = ((angleDeg - 90) * Math.PI) / 180;
 return {
 x: cx + radius * Math.cos(angle),
 y: cy + radius * Math.sin(angle),
 };
 };

 return (
 <svg viewBox="0 0 320 320" className="w-full max-w-sm mx-auto">
 {/* Background circle */}
 <circle
 cx={cx}
 cy={cy}
 r={r + 8}
 fill="none"
 stroke="rgb(255,255,255,0.06)"
 strokeWidth="16"
 />

 {/* Quality arc indicator */}
 {EMOTIONAL_PHASES.map((phase, i) => {
 const next = EMOTIONAL_PHASES[(i + 1) % EMOTIONAL_PHASES.length];
 const p1 = getPoint(phase.angle);
 const p2 = getPoint(next.angle);
 return (
 <line
 key={phase.state}
 x1={p1.x}
 y1={p1.y}
 x2={p2.x}
 y2={p2.y}
 stroke={phase.color}
 strokeWidth="2"
 strokeOpacity="0.4"
 />
 );
 })}

 {/* Phase dots */}
 {EMOTIONAL_PHASES.map((phase) => {
 const pt = getPoint(phase.angle);
 const isSelected = selectedState === phase.state;
 return (
 <g
 key={phase.state}
 onClick={() => onSelect(phase.state)}
 style={{ cursor: "pointer" }}
 >
 <circle
 cx={pt.x}
 cy={pt.y}
 r={isSelected ? 12 : 8}
 fill={phase.color}
 fillOpacity={isSelected ? 1 : 0.7}
 stroke={isSelected ? "#fff" : "transparent"}
 strokeWidth="2"
 />
 {/* Trade quality bar indicator */}
 <circle
 cx={pt.x}
 cy={pt.y}
 r={isSelected ? 12 : 8}
 fill="transparent"
 stroke={phase.color}
 strokeWidth={isSelected ? 3 : 0}
 strokeOpacity="0.5"
 />
 </g>
 );
 })}

 {/* Labels */}
 {EMOTIONAL_PHASES.map((phase) => {
 const labelPt = getPoint(phase.angle, r + 30);
 return (
 <text
 key={`label-${phase.state}`}
 x={labelPt.x}
 y={labelPt.y}
 textAnchor="middle"
 dominantBaseline="middle"
 fontSize="8.5"
 fill={selectedState === phase.state ? phase.color : "rgb(156,163,175)"}
 fontWeight={selectedState === phase.state ? "700" : "400"}
 >
 {phase.label}
 </text>
 );
 })}

 {/* Center label */}
 <text
 x={cx}
 y={cy - 10}
 textAnchor="middle"
 fontSize="11"
 fill="rgb(156,163,175)"
 >
 Emotional
 </text>
 <text
 x={cx}
 y={cy + 8}
 textAnchor="middle"
 fontSize="11"
 fill="rgb(156,163,175)"
 >
 Cycle
 </text>
 </svg>
 );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function TradingPsychPage() {
 // Bias Assessment state
 const [quizStep, setQuizStep] = useState(0);
 const [answers, setAnswers] = useState<
 { questionId: number; bias: BiasType; weight: number }[]
 >([]);
 const [quizComplete, setQuizComplete] = useState(false);

 // Emotional Cycle state
 const [selectedState, setSelectedState] = useState<EmotionalState | null>(null);

 // Process checklist state
 const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
 const [activeCategory, setActiveCategory] = useState<string>("Pre-Market Routine");

 // Post-trade review state
 const [reviewScores, setReviewScores] = useState<Record<string, number>>({});
 const [reviewSaved, setReviewSaved] = useState(false);

 // Peak performance state
 const [activeTechnique, setActiveTechnique] = useState<string | null>(null);

 // ── Bias calculation ────────────────────────────────────────────────────────

 const biasScores: BiasScore[] = useMemo(() => {
 const totals: Record<BiasType, number> = {
 overconfidence: 0,
 loss_aversion: 0,
 confirmation: 0,
 recency: 0,
 fomo: 0,
 };

 answers.forEach(({ bias, weight }) => {
 totals[bias] += weight;
 });

 const maxPossible = 30; // 10 questions × max weight 3

 return (Object.keys(totals) as BiasType[]).map((bias) => ({
 bias,
 label: BIAS_META[bias].label,
 score: Math.min(100, Math.round((totals[bias] / maxPossible) * 100)),
 color: BIAS_META[bias].color,
 description: BIAS_META[bias].description,
 strategies: BIAS_META[bias].strategies,
 }));
 }, [answers]);

 const dominantBias = useMemo(() => {
 if (!quizComplete || biasScores.length === 0) return null;
 return biasScores.reduce((max, b) => (b.score > max.score ? b : max));
 }, [biasScores, quizComplete]);

 const handleAnswer = useCallback(
 (bias: BiasType, weight: number) => {
 const newAnswer = {
 questionId: QUIZ_QUESTIONS[quizStep].id,
 bias,
 weight,
 };
 const newAnswers = [...answers, newAnswer];
 setAnswers(newAnswers);

 if (quizStep + 1 >= QUIZ_QUESTIONS.length) {
 setQuizComplete(true);
 } else {
 setQuizStep(quizStep + 1);
 }
 },
 [quizStep, answers]
 );

 const resetQuiz = useCallback(() => {
 setQuizStep(0);
 setAnswers([]);
 setQuizComplete(false);
 }, []);

 // ── Checklist handlers ──────────────────────────────────────────────────────

 const toggleChecked = useCallback((id: string) => {
 setCheckedItems((prev) => {
 const next = new Set(prev);
 if (next.has(id)) {
 next.delete(id);
 } else {
 next.add(id);
 }
 return next;
 });
 }, []);

 const categoryProgress = useMemo(() => {
 const items = PROCESS_CHECKLISTS[activeCategory] ?? [];
 const done = items.filter((i) => checkedItems.has(i.id)).length;
 return items.length > 0 ? Math.round((done / items.length) * 100) : 0;
 }, [activeCategory, checkedItems]);

 // ── Review score calculation ────────────────────────────────────────────────

 const overallReviewScore = useMemo(() => {
 const scores = REVIEW_CRITERIA.map((c) => reviewScores[c.category] ?? 0);
 const filled = scores.filter((s) => s > 0);
 if (filled.length === 0) return 0;
 return Math.round(filled.reduce((a, b) => a + b, 0) / filled.length);
 }, [reviewScores]);

 const reviewGrade = useMemo(() => {
 if (overallReviewScore >= 90) return { grade: "A+", color: "#22c55e" };
 if (overallReviewScore >= 80) return { grade: "A", color: "#22c55e" };
 if (overallReviewScore >= 70) return { grade: "B", color: "#10b981" };
 if (overallReviewScore >= 60) return { grade: "C", color: "#eab308" };
 if (overallReviewScore >= 50) return { grade: "D", color: "#f97316" };
 return { grade: "F", color: "#ef4444" };
 }, [overallReviewScore]);

 const selectedEmotionalPhase = useMemo(
 () =>
 selectedState
 ? EMOTIONAL_PHASES.find((p) => p.state === selectedState) ?? null
 : null,
 [selectedState]
 );

 // Pre-generate seeded sparklines for use in SVG decorations
 const _ = useMemo(() => {
 // Consume some random values for decorative purposes
 const vals: number[] = [];
 for (let i = 0; i < 20; i++) vals.push(rand());
 return vals;
 }, []);

 return (
 <div className="min-h-screen bg-background text-foreground p-4 md:p-4 space-y-4">
 {/* Header */}
 <div className="space-y-1 border-l-4 border-l-primary p-6 rounded-lg bg-card/40">
 <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
 <Brain className="w-6 h-6 text-primary" />
 Trading Psychology
 </h1>
 <p className="text-sm text-muted-foreground">
 Mental performance, bias detection, and peak mindset for consistent
 trading.
 </p>
 </div>

 <Tabs defaultValue="bias" className="mt-8">
 <TabsList className="flex flex-wrap gap-1 h-auto">
 <TabsTrigger value="bias" className="text-xs text-muted-foreground">
 Bias Assessment
 </TabsTrigger>
 <TabsTrigger value="emotional" className="text-xs text-muted-foreground">
 Emotional Cycle
 </TabsTrigger>
 <TabsTrigger value="process" className="text-xs text-muted-foreground">
 Process Development
 </TabsTrigger>
 <TabsTrigger value="review" className="text-xs text-muted-foreground">
 Post-Trade Review
 </TabsTrigger>
 <TabsTrigger value="peak" className="text-xs text-muted-foreground">
 Peak Performance
 </TabsTrigger>
 </TabsList>

 {/* ── TAB 1: Bias Assessment ──────────────────────────────────────────── */}
 <TabsContent value="bias" className="mt-4 space-y-4">
 <AnimatePresence mode="wait">
 {!quizComplete ? (
 <motion.div
 key={`question-${quizStep}`}
 initial={{ opacity: 0, x: 32 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -32 }}
 transition={{ duration: 0.2 }}
 >
 <Card className="bg-card border-border">
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="text-base">
 Bias Assessment Quiz
 </CardTitle>
 <Badge variant="outline" className="text-xs text-muted-foreground">
 {quizStep + 1} / {QUIZ_QUESTIONS.length}
 </Badge>
 </div>
 <Progress
 value={((quizStep) / QUIZ_QUESTIONS.length) * 100}
 className="h-1.5"
 />
 </CardHeader>
 <CardContent className="space-y-4">
 <p className="text-sm text-muted-foreground leading-relaxed">
 {QUIZ_QUESTIONS[quizStep].scenario}
 </p>
 <div className="grid gap-2">
 {QUIZ_QUESTIONS[quizStep].choices.map((choice, i) => (
 <button
 key={i}
 onClick={() => handleAnswer(choice.bias, choice.weight)}
 className="w-full text-left px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/20 hover:text-foreground transition-colors text-sm"
 >
 <span className="text-muted-foreground mr-2 font-mono text-xs">
 {String.fromCharCode(65 + i)}.
 </span>
 {choice.text}
 </button>
 ))}
 </div>
 </CardContent>
 </Card>
 </motion.div>
 ) : (
 <motion.div
 key="results"
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 className="space-y-4"
 >
 <div className="grid md:grid-cols-2 gap-4">
 {/* Radar Chart */}
 <Card className="bg-card border-border">
 <CardHeader>
 <CardTitle className="text-sm">Bias Profile</CardTitle>
 </CardHeader>
 <CardContent>
 <BiasRadarChart scores={biasScores} />
 </CardContent>
 </Card>

 {/* Dominant Bias */}
 <Card className="bg-card border-border">
 <CardHeader>
 <CardTitle className="text-sm">
 Dominant Bias: {dominantBias?.label}
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <p className="text-xs text-muted-foreground leading-relaxed">
 {dominantBias?.description}
 </p>
 <div className="space-y-1.5">
 <p className="text-xs font-semibold text-foreground">
 Mitigation Strategies:
 </p>
 {dominantBias?.strategies.map((s, i) => (
 <div key={i} className="flex items-start gap-2">
 <ChevronRight
 className="w-3 h-3 mt-0.5 flex-shrink-0"
 style={{ color: dominantBias.color }}
 />
 <p className="text-xs text-muted-foreground">{s}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* All bias scores */}
 <Card className="bg-card border-border">
 <CardHeader>
 <CardTitle className="text-sm">All Bias Scores</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {biasScores
 .sort((a, b) => b.score - a.score)
 .map((bs) => (
 <div key={bs.bias} className="space-y-1">
 <div className="flex items-center justify-between text-xs text-muted-foreground">
 <span className="font-medium" style={{ color: bs.color }}>
 {bs.label}
 </span>
 <span className="text-muted-foreground">
 {bs.score}%
 </span>
 </div>
 <div className="h-1.5 rounded-full bg-muted overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${bs.score}%` }}
 transition={{ duration: 0.6, delay: 0.1 }}
 className="h-full rounded-full"
 style={{ backgroundColor: bs.color }}
 />
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 <Button
 variant="outline"
 size="sm"
 onClick={resetQuiz}
 className="gap-2"
 >
 <RefreshCw className="w-3 h-3" />
 Retake Assessment
 </Button>
 </motion.div>
 )}
 </AnimatePresence>
 </TabsContent>

 {/* ── TAB 2: Emotional Cycle ──────────────────────────────────────────── */}
 <TabsContent value="emotional" className="mt-4 space-y-4">
 <div className="grid md:grid-cols-2 gap-4">
 {/* Cycle Diagram */}
 <Card className="bg-card border-border">
 <CardHeader>
 <CardTitle className="text-sm">Emotional Cycle of Trading</CardTitle>
 <p className="text-xs text-muted-foreground">
 Click a phase to see trade quality and coping strategies.
 </p>
 </CardHeader>
 <CardContent>
 <EmotionalCycleChart
 selectedState={selectedState}
 onSelect={setSelectedState}
 />

 {/* Trade quality legend */}
 <div className="mt-3 flex items-center gap-3 justify-center">
 <span className="text-xs text-muted-foreground">Poor Quality</span>
 <div className="flex gap-1">
 {["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"].map(
 (c, i) => (
 <div
 key={i}
 className="w-4 h-2 rounded-sm"
 style={{ backgroundColor: c }}
 />
 )
 )}
 </div>
 <span className="text-xs text-muted-foreground">Peak Quality</span>
 </div>
 </CardContent>
 </Card>

 {/* Phase Detail */}
 <div className="space-y-3">
 <AnimatePresence mode="wait">
 {selectedEmotionalPhase ? (
 <motion.div
 key={selectedEmotionalPhase.state}
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 transition={{ duration: 0.2 }}
 className="space-y-3"
 >
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between">
 <CardTitle
 className="text-sm"
 style={{ color: selectedEmotionalPhase.color }}
 >
 {selectedEmotionalPhase.label}
 </CardTitle>
 <Badge
 variant="outline"
 className="text-xs text-muted-foreground"
 style={{ borderColor: selectedEmotionalPhase.color, color: selectedEmotionalPhase.color }}
 >
 Trade Quality: {selectedEmotionalPhase.tradeQuality}%
 </Badge>
 </div>
 </CardHeader>
 <CardContent className="space-y-3">
 <Progress
 value={selectedEmotionalPhase.tradeQuality}
 className="h-2"
 />
 <p className="text-xs text-muted-foreground">
 {selectedEmotionalPhase.description}
 </p>
 <div className="space-y-1.5">
 <p className="text-xs text-muted-foreground font-semibold">Coping Strategies:</p>
 {selectedEmotionalPhase.strategies.map((s, i) => (
 <div key={i} className="flex items-start gap-2">
 <Shield
 className="w-3 h-3 mt-0.5 flex-shrink-0"
 style={{ color: selectedEmotionalPhase.color }}
 />
 <p className="text-xs text-muted-foreground">{s}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </motion.div>
 ) : (
 <motion.div
 key="empty"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 >
 <Card className="bg-card border-border">
 <CardContent className="flex flex-col items-center justify-center py-12 text-center">
 <Activity className="w-8 h-8 text-muted-foreground mb-3" />
 <p className="text-sm text-muted-foreground">
 Select a phase on the cycle to view its trade quality
 impact and coping strategies.
 </p>
 </CardContent>
 </Card>
 </motion.div>
 )}
 </AnimatePresence>

 {/* All phases list */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
 All Phases — Quality Ranking
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {[...EMOTIONAL_PHASES]
 .sort((a, b) => b.tradeQuality - a.tradeQuality)
 .map((phase) => (
 <button
 key={phase.state}
 onClick={() =>
 setSelectedState(
 selectedState === phase.state ? null : phase.state
 )
 }
 className={cn(
 "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-muted-foreground transition-colors",
 selectedState === phase.state
 ? "bg-accent"
 : "hover:bg-muted/20"
 )}
 >
 <span
 className="font-medium"
 style={{ color: phase.color }}
 >
 {phase.label}
 </span>
 <div className="flex items-center gap-2">
 <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
 <div
 className="h-full rounded-full"
 style={{
 width: `${phase.tradeQuality}%`,
 backgroundColor: phase.color,
 }}
 />
 </div>
 <span className="text-muted-foreground w-8 text-right">
 {phase.tradeQuality}%
 </span>
 </div>
 </button>
 ))}
 </CardContent>
 </Card>
 </div>
 </div>
 </TabsContent>

 {/* ── TAB 3: Process Development ─────────────────────────────────────── */}
 <TabsContent value="process" className="mt-4 space-y-4">
 {/* Category selector */}
 <div className="flex flex-wrap gap-2">
 {Object.keys(PROCESS_CHECKLISTS).map((cat) => (
 <button
 key={cat}
 onClick={() => setActiveCategory(cat)}
 className={cn(
 "px-3 py-1.5 rounded-md text-xs text-muted-foreground font-medium transition-colors border",
 activeCategory === cat
 ? "bg-primary text-primary-foreground border-primary"
 : "border-border text-muted-foreground hover:text-foreground hover:border-border"
 )}
 >
 {cat}
 </button>
 ))}
 </div>

 <AnimatePresence mode="wait">
 <motion.div
 key={activeCategory}
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 transition={{ duration: 0.15 }}
 >
 <Card className="bg-card border-border">
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm">{activeCategory}</CardTitle>
 <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
 <CheckCircle2 className="w-3 h-3" />
 {categoryProgress}%
 </Badge>
 </div>
 <Progress value={categoryProgress} className="h-1.5" />
 </CardHeader>
 <CardContent className="space-y-2">
 {(PROCESS_CHECKLISTS[activeCategory] ?? []).map((item) => {
 const checked = checkedItems.has(item.id);
 return (
 <motion.button
 key={item.id}
 onClick={() => toggleChecked(item.id)}
 className={cn(
 "w-full flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-colors",
 checked
 ? "border-primary/30 bg-primary/5"
 : "border-border bg-background hover:bg-muted/20"
 )}
 whileTap={{ scale: 0.99 }}
 >
 {checked ? (
 <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
 ) : (
 <Circle className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
 )}
 <span
 className={cn(
 "text-sm",
 checked
 ? "line-through text-muted-foreground"
 : "text-foreground"
 )}
 >
 {item.text}
 </span>
 </motion.button>
 );
 })}
 </CardContent>
 </Card>
 </motion.div>
 </AnimatePresence>

 {/* Progress summary across all categories */}
 <Card className="bg-card border-border">
 <CardHeader>
 <CardTitle className="text-sm">Process Completion Overview</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {Object.entries(PROCESS_CHECKLISTS).map(([cat, items]) => {
 const done = items.filter((i) => checkedItems.has(i.id)).length;
 const pct = Math.round((done / items.length) * 100);
 return (
 <div key={cat} className="space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{cat}</span>
 <span className="text-foreground font-medium">
 {done}/{items.length}
 </span>
 </div>
 <Progress value={pct} className="h-1" />
 </div>
 );
 })}
 </CardContent>
 </Card>
 </TabsContent>

 {/* ── TAB 4: Post-Trade Review ────────────────────────────────────────── */}
 <TabsContent value="review" className="mt-4 space-y-4">
 <div className="grid md:grid-cols-3 gap-4">
 {/* Score card */}
 <Card className="bg-card border-border md:col-span-1">
 <CardHeader>
 <CardTitle className="text-sm">Process Grade</CardTitle>
 <p className="text-xs text-muted-foreground">
 Score your process — independent of P&L outcome.
 </p>
 </CardHeader>
 <CardContent className="flex flex-col items-center gap-3">
 <div
 className="text-6xl font-bold"
 style={{ color: reviewGrade.color }}
 >
 {overallReviewScore > 0 ? reviewGrade.grade : "—"}
 </div>
 {overallReviewScore > 0 && (
 <p className="text-xs text-muted-foreground text-center">
 Process Score: {overallReviewScore}/100
 </p>
 )}

 {/* Grade scale */}
 <div className="w-full space-y-1 mt-2">
 {[
 { range: "90–100", grade: "A+", color: "#22c55e", label: "Elite Process" },
 { range: "80–89", grade: "A", color: "#22c55e", label: "Strong Process" },
 { range: "70–79", grade: "B", color: "#10b981", label: "Good Process" },
 { range: "60–69", grade: "C", color: "#eab308", label: "Average" },
 { range: "50–59", grade: "D", color: "#f97316", label: "Needs Work" },
 { range: "0–49", grade: "F", color: "#ef4444", label: "Broke Rules" },
 ].map((row) => (
 <div
 key={row.grade}
 className="flex items-center justify-between text-xs text-muted-foreground px-2 py-0.5 rounded"
 style={{
 backgroundColor:
 reviewGrade.grade === row.grade && overallReviewScore > 0
 ? `${row.color}20`
 : "transparent",
 }}
 >
 <span style={{ color: row.color }} className="font-medium w-6">
 {row.grade}
 </span>
 <span className="text-muted-foreground">{row.range}</span>
 <span className="text-muted-foreground">{row.label}</span>
 </div>
 ))}
 </div>

 {reviewSaved && (
 <Badge variant="outline" className="text-xs text-muted-foreground gap-1 mt-2">
 <CheckCircle2 className="w-3 h-3 text-green-500" />
 Review Saved
 </Badge>
 )}
 </CardContent>
 </Card>

 {/* Review criteria */}
 <div className="md:col-span-2 space-y-3">
 {REVIEW_CRITERIA.map((criterion) => {
 const score = reviewScores[criterion.category] ?? 0;
 return (
 <Card key={criterion.category} className="bg-card border-border">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm">{criterion.label}</CardTitle>
 <span className="text-xs text-muted-foreground">
 {score > 0 ? `${score}/100` : "Not rated"}
 </span>
 </div>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="space-y-1.5">
 {criterion.questions.map((q, i) => (
 <div key={i} className="flex items-start gap-2">
 <BookOpen className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
 <p className="text-xs text-muted-foreground">{q}</p>
 </div>
 ))}
 </div>
 {/* Slider */}
 <div className="space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>0 — Violated rules</span>
 <span>100 — Perfect execution</span>
 </div>
 <input
 type="range"
 min={0}
 max={100}
 step={5}
 value={score}
 onChange={(e) =>
 setReviewScores((prev) => ({
 ...prev,
 [criterion.category]: parseInt(e.target.value),
 }))
 }
 className="w-full h-1.5 rounded-full accent-primary cursor-pointer"
 />
 <div className="h-1.5 rounded-full bg-muted overflow-hidden">
 <motion.div
 animate={{ width: `${score}%` }}
 transition={{ duration: 0.2 }}
 className="h-full rounded-full bg-primary"
 />
 </div>
 </div>
 </CardContent>
 </Card>
 );
 })}

 <Button
 className="w-full gap-2"
 size="sm"
 onClick={() => setReviewSaved(true)}
 disabled={Object.keys(reviewScores).length === 0}
 >
 <Award className="w-4 h-4" />
 Save Review
 </Button>

 {/* Process vs Outcome insight */}
 <Card className="bg-card border-border">
 <CardContent className="py-4">
 <div className="flex items-start gap-3">
 <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
 <div className="space-y-1">
 <p className="text-xs text-muted-foreground font-semibold">
 Separating Process from Outcome
 </p>
 <p className="text-xs text-muted-foreground leading-relaxed">
 A trade can have a perfect process and lose money (variance). A
 trade can have a terrible process and win (luck). Over hundreds
 of trades, good process compounds. Never judge a trade by its
 P&L alone — judge it by whether you followed your rules.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </TabsContent>

 {/* ── TAB 5: Peak Performance ─────────────────────────────────────────── */}
 <TabsContent value="peak" className="mt-4 space-y-4">
 {/* Stats row */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { icon: <Sun className="w-4 h-4" />, label: "Pre-Session Prep", value: "10 min", color: "#f97316" },
 { icon: <Wind className="w-4 h-4" />, label: "Box Breathing", value: "4 min", color: "#3b82f6" },
 { icon: <Moon className="w-4 h-4" />, label: "Sleep Target", value: "8 hrs", color: "#8b5cf6" },
 { icon: <Coffee className="w-4 h-4" />, label: "Last Caffeine", value: "12:00 PM", color: "#eab308" },
 ].map((stat) => (
 <Card key={stat.label} className="bg-card border-border">
 <CardContent className="py-3 px-4">
 <div className="flex items-center gap-2 mb-1">
 <span style={{ color: stat.color }}>{stat.icon}</span>
 <span className="text-xs text-muted-foreground">{stat.label}</span>
 </div>
 <p className="text-lg font-medium">{stat.value}</p>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Technique cards */}
 <div className="space-y-3">
 {PEAK_TECHNIQUES.map((technique) => {
 const isActive = activeTechnique === technique.id;
 return (
 <Card key={technique.id} className="bg-card border-border">
 <button
 className="w-full text-left"
 onClick={() =>
 setActiveTechnique(isActive ? null : technique.id)
 }
 >
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
 {technique.icon}
 </div>
 <div>
 <CardTitle className="text-sm">{technique.title}</CardTitle>
 <div className="flex items-center gap-2 mt-0.5">
 <span className="text-xs text-muted-foreground flex items-center gap-1">
 <Clock className="w-3 h-3" />
 {technique.duration}
 </span>
 <Badge
 variant="outline"
 className={cn(
 "text-xs text-muted-foreground",
 technique.difficulty === "Easy" && "border-green-500/50 text-green-500",
 technique.difficulty === "Medium" && "border-yellow-500/50 text-yellow-500",
 technique.difficulty === "Hard" && "border-red-500/50 text-red-500"
 )}
 >
 {technique.difficulty}
 </Badge>
 </div>
 </div>
 </div>
 <ChevronRight
 className={cn(
 "w-4 h-4 text-muted-foreground transition-transform",
 isActive && "rotate-90"
 )}
 />
 </div>
 </CardHeader>
 </button>

 <AnimatePresence>
 {isActive && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden"
 >
 <CardContent className="pt-0 space-y-4">
 <p className="text-xs text-muted-foreground leading-relaxed">
 {technique.description}
 </p>
 <div className="space-y-2">
 <p className="text-xs text-muted-foreground font-medium">Step-by-Step:</p>
 {technique.steps.map((step, i) => (
 <div key={i} className="flex items-start gap-3">
 <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 font-medium">
 {i + 1}
 </div>
 <p className="text-xs text-muted-foreground pt-0.5">
 {step}
 </p>
 </div>
 ))}
 </div>
 </CardContent>
 </motion.div>
 )}
 </AnimatePresence>
 </Card>
 );
 })}
 </div>

 {/* Flow state insight */}
 <Card className="bg-card border-border">
 <CardContent className="py-4">
 <div className="flex items-start gap-3">
 <Flame className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
 <div className="space-y-2">
 <p className="text-xs text-muted-foreground font-medium">Physical Health → Decision Quality</p>
 <div className="grid grid-cols-2 gap-2">
 {[
 { factor: "7–9 hrs sleep", impact: "+23% cognitive performance", positive: true },
 { factor: "Sleep deprived", impact: "+30% risk-seeking behavior", positive: false },
 { factor: "Morning exercise", impact: "+40% BDNF, focus boost", positive: true },
 { factor: "Dehydrated 2%", impact: "-14% cognitive accuracy", positive: false },
 ].map((item) => (
 <div
 key={item.factor}
 className={cn(
 "text-xs text-muted-foreground p-2 rounded-md",
 item.positive ? "bg-green-500/10" : "bg-red-500/5"
 )}
 >
 <p
 className={cn(
 "font-medium",
 item.positive ? "text-green-400" : "text-red-400"
 )}
 >
 {item.factor}
 </p>
 <p className="text-muted-foreground">{item.impact}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Mindfulness prompt */}
 <Card className="bg-card border-border">
 <CardContent className="py-4">
 <div className="flex items-start gap-3">
 <Star className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
 <div className="space-y-1">
 <p className="text-xs text-muted-foreground font-medium">The One Question That Changes Everything</p>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Before every trade entry, ask yourself:{" "}
 <span className="text-foreground font-medium italic">
 "Am I trading my plan, or am I trading my emotions?"
 </span>{" "}
 Consistent traders answer this question honestly. They act only
 when the answer is "my plan." This single habit, applied
 consistently, eliminates the majority of trading errors that stem
 from psychological interference.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 );
}
