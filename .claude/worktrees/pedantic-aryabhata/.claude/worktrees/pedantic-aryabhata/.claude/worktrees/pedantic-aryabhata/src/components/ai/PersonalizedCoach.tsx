"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Brain,
  BarChart2,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Lightbulb,
  Shield,
  Clock,
  Zap,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTradingStore } from "@/stores/trading-store";
import { useLearnStore } from "@/stores/learn-store";
import type { TradeRecord } from "@/types/trading";

// ─── Types ───────────────────────────────────────────────────────────────────

type PersonalityId = "drill_sergeant" | "mentor" | "quant" | "philosopher";

interface CoachPersonality {
  id: PersonalityId;
  name: string;
  subtitle: string;
  icon: string;
  emojiUsage: "heavy" | "light" | "none";
  verbosity: "terse" | "moderate" | "verbose";
  toneWords: string[];
  focusAreas: string[];
}

interface TradingDNA {
  discipline: number;       // 0–100
  riskManagement: number;
  patternRecognition: number;
  trendFollowing: number;
  timing: number;
  emotionalControl: number;
}

interface AdaptiveProfile {
  dna: TradingDNA;
  strengths: string[];
  weaknesses: string[];
  winRate: number;
  avgWin: number;
  avgLoss: number;
  totalTrades: number;
  recentTrend: "improving" | "declining" | "stable";
  overtradingRisk: boolean;
  worstCondition: string;
}

// ─── Personality Definitions ─────────────────────────────────────────────────

const PERSONALITIES: CoachPersonality[] = [
  {
    id: "drill_sergeant",
    name: "The Drill Sergeant",
    subtitle: "Strict & no-nonsense",
    icon: "",
    emojiUsage: "none",
    verbosity: "terse",
    toneWords: ["discipline", "rules", "execute", "maintain"],
    focusAreas: ["Stop losses", "Position sizing", "Trade plan adherence"],
  },
  {
    id: "mentor",
    name: "The Mentor",
    subtitle: "Supportive & educational",
    icon: "🧑‍🏫",
    emojiUsage: "light",
    verbosity: "verbose",
    toneWords: ["understand", "learn", "grow", "develop"],
    focusAreas: ["Education", "Pattern learning", "Building habits"],
  },
  {
    id: "quant",
    name: "The Quant",
    subtitle: "Data-driven & statistical",
    icon: "📐",
    emojiUsage: "none",
    verbosity: "moderate",
    toneWords: ["statistically", "probability", "expectancy", "ratio"],
    focusAreas: ["Win rate", "Risk/reward", "Expected value"],
  },
  {
    id: "philosopher",
    name: "The Philosopher",
    subtitle: "Wisdom & big picture",
    icon: "🦉",
    emojiUsage: "light",
    verbosity: "moderate",
    toneWords: ["patience", "perspective", "long-term", "wisdom"],
    focusAreas: ["Psychology", "Long-term thinking", "Process over outcome"],
  },
];

// ─── Q&A Definitions ─────────────────────────────────────────────────────────

const PRESET_QUESTIONS = [
  "Should I trade today given my recent performance?",
  "My last 3 trades were losses — what should I do?",
  "What does my win rate tell me about my strategy?",
  "How much should I be risking per trade?",
  "Is my current position size appropriate?",
  "Am I overtrading?",
  "When is my best time to trade?",
  "What's my biggest weakness right now?",
  "How can I improve my discipline?",
  "What's the market telling me I should focus on?",
];

// ─── Utility: localStorage ────────────────────────────────────────────────────

function loadPersonality(): PersonalityId {
  if (typeof window === "undefined") return "mentor";
  try {
    const v = localStorage.getItem("coach_personality");
    if (v && PERSONALITIES.find((p) => p.id === v)) return v as PersonalityId;
  } catch {
    // ignore
  }
  return "mentor";
}

function savePersonality(id: PersonalityId) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("coach_personality", id);
  } catch {
    // ignore
  }
}

// ─── Adaptive Profile Computation ────────────────────────────────────────────

function computeAdaptiveProfile(trades: TradeRecord[]): AdaptiveProfile {
  const sells = trades.filter((t) => t.side === "sell");
  const totalTrades = sells.length;

  if (totalTrades === 0) {
    return {
      dna: {
        discipline: 50,
        riskManagement: 50,
        patternRecognition: 50,
        trendFollowing: 50,
        timing: 50,
        emotionalControl: 50,
      },
      strengths: ["Getting started"],
      weaknesses: ["Need more trade data"],
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      totalTrades: 0,
      recentTrend: "stable",
      overtradingRisk: false,
      worstCondition: "Unknown — need more data",
    };
  }

  const wins = sells.filter((t) => t.realizedPnL > 0);
  const losses = sells.filter((t) => t.realizedPnL <= 0);
  const winRate = wins.length / totalTrades;

  const avgWin =
    wins.length > 0 ? wins.reduce((s, t) => s + t.realizedPnL, 0) / wins.length : 0;
  const avgLoss =
    losses.length > 0
      ? Math.abs(losses.reduce((s, t) => s + t.realizedPnL, 0) / losses.length)
      : 0;

  // Discipline: based on whether trades follow stop-loss discipline (approximate via loss size)
  const maxLoss = losses.length > 0 ? Math.max(...losses.map((t) => Math.abs(t.realizedPnL))) : 0;
  const discipline = maxLoss > 5000 ? 25 : maxLoss > 2000 ? 50 : maxLoss > 500 ? 70 : 85;

  // Risk management: based on reward/risk ratio
  const rrRatio = avgLoss > 0 ? avgWin / avgLoss : 1;
  const riskManagement = Math.min(100, Math.round(rrRatio * 40 + 10));

  // Pattern recognition: based on win rate
  const patternRecognition = Math.min(100, Math.round(winRate * 100 + 10));

  // Trend following: based on consecutive wins
  let consecutiveWins = 0;
  let maxConsec = 0;
  for (const t of [...sells].reverse()) {
    if (t.realizedPnL > 0) {
      consecutiveWins++;
      maxConsec = Math.max(maxConsec, consecutiveWins);
    } else {
      consecutiveWins = 0;
    }
  }
  const trendFollowing = Math.min(100, maxConsec * 15 + 20);

  // Timing: use bar index modulo 24 to find peak performance hour
  const byBarMod = new Map<number, number[]>();
  for (const t of sells) {
    const slot = (t.simulationDate ?? 0) % 24;
    if (!byBarMod.has(slot)) byBarMod.set(slot, []);
    byBarMod.get(slot)!.push(t.realizedPnL);
  }
  // Find worst time slot
  let worstSlot = -1;
  let worstAvg = Infinity;
  byBarMod.forEach((pnls, slot) => {
    const avg = pnls.reduce((a, b) => a + b, 0) / pnls.length;
    if (avg < worstAvg) { worstAvg = avg; worstSlot = slot; }
  });
  const timingScore = winRate > 0.55 ? 75 : winRate > 0.45 ? 55 : 35;
  const timing = timingScore;

  // Emotional control: based on drawdown behavior and loss streaks
  let maxLossStreak = 0;
  let lossStreak = 0;
  for (const t of [...sells].reverse()) {
    if (t.realizedPnL <= 0) {
      lossStreak++;
      maxLossStreak = Math.max(maxLossStreak, lossStreak);
    } else {
      lossStreak = 0;
    }
  }
  const emotionalControl = maxLossStreak >= 5 ? 20 : maxLossStreak >= 3 ? 45 : maxLossStreak >= 2 ? 65 : 82;

  // Recent trend: compare last 5 vs prior 5
  const last5 = sells.slice(0, 5);
  const prior5 = sells.slice(5, 10);
  const last5Win = last5.filter((t) => t.realizedPnL > 0).length;
  const prior5Win = prior5.filter((t) => t.realizedPnL > 0).length;
  const recentTrend: "improving" | "declining" | "stable" =
    last5.length < 2
      ? "stable"
      : last5Win > prior5Win
      ? "improving"
      : last5Win < prior5Win
      ? "declining"
      : "stable";

  // Overtrading: >5 sells in recent session (simulated by first 100 records)
  const recentTrades = sells.slice(0, 20);
  const overtradingRisk = recentTrades.length >= 8;

  const dna: TradingDNA = {
    discipline,
    riskManagement,
    patternRecognition,
    trendFollowing,
    timing,
    emotionalControl,
  };

  // Strengths & weaknesses
  const axes = Object.entries(dna) as [keyof TradingDNA, number][];
  const sorted = [...axes].sort((a, b) => b[1] - a[1]);
  const AXIS_LABELS: Record<keyof TradingDNA, string> = {
    discipline: "Discipline",
    riskManagement: "Risk Management",
    patternRecognition: "Pattern Recognition",
    trendFollowing: "Trend Following",
    timing: "Timing",
    emotionalControl: "Emotional Control",
  };
  const strengths = sorted.slice(0, 3).map(([k]) => AXIS_LABELS[k]);
  const weaknesses = sorted.slice(-3).reverse().map(([k]) => AXIS_LABELS[k]);

  const worstCondition =
    worstSlot >= 0
      ? `Bar group ${worstSlot} (worst avg P&L: $${worstAvg.toFixed(0)})`
      : "Data insufficient";

  return {
    dna,
    strengths,
    weaknesses,
    winRate,
    avgWin,
    avgLoss,
    totalTrades,
    recentTrend,
    overtradingRisk,
    worstCondition,
  };
}

// ─── Personality Text Generators ─────────────────────────────────────────────

function generateDailyBrief(
  personality: CoachPersonality,
  profile: AdaptiveProfile,
  completedLessons: number,
): { heading: string; body: string; focus: string } {
  const { winRate, totalTrades, recentTrend, weaknesses, overtradingRisk, avgWin, avgLoss } = profile;

  const wr = (winRate * 100).toFixed(0);
  const rr = avgLoss > 0 ? (avgWin / avgLoss).toFixed(1) : "N/A";

  if (personality.id === "drill_sergeant") {
    const heading = "Daily Debrief";
    const body = totalTrades === 0
      ? "No trades logged yet. Get in there and execute. Your job is to follow the plan."
      : `Win rate: ${wr}%. R:R: ${rr}:1. ${recentTrend === "declining" ? "Performance is DECLINING. Tighten up NOW." : recentTrend === "improving" ? "Numbers improving. Stay the course." : "Holding steady. No excuses."} ${overtradingRisk ? "You are OVERTRADING. Step back." : ""}`;
    const focus = weaknesses[0] ? `FIX: ${weaknesses[0]}` : "Execute the plan. Every. Single. Time.";
    return { heading, body, focus };
  }

  if (personality.id === "mentor") {
    const heading = "Good Morning, Trader";
    const body = totalTrades === 0
      ? "Welcome! Every expert was once a beginner. Today is about learning the fundamentals — take your time and don't rush into trades."
      : `You've made ${totalTrades} trades with a ${wr}% win rate. ${recentTrend === "improving" ? "You're trending upward — that's wonderful progress!" : recentTrend === "declining" ? "Recent performance has dipped, but don't worry — this is where we learn the most." : "Things are stable, which is a solid foundation to build on."} ${completedLessons > 0 ? `Your ${completedLessons} completed lessons are clearly paying off.` : "Try completing a lesson today to sharpen your skills."}`;
    const focus = weaknesses[0] ? `Today's focus area: strengthen your ${weaknesses[0]}` : "Focus on understanding why each trade worked or didn't.";
    return { heading, body, focus };
  }

  if (personality.id === "quant") {
    const heading = "Performance Metrics";
    const body = totalTrades === 0
      ? "Dataset: 0 trades. Insufficient data for statistical analysis. Generate trades to compute expectancy, win rate, and R:R metrics."
      : `n=${totalTrades} trades. Win rate: ${wr}%. Avg win: $${avgWin.toFixed(2)}. Avg loss: $${avgLoss.toFixed(2)}. R:R ratio: ${rr}:1. Expectancy: $${(winRate * avgWin - (1 - winRate) * avgLoss).toFixed(2)}/trade. ${recentTrend === "declining" ? "Recent subsample shows negative drift." : recentTrend === "improving" ? "Recent subsample outperforms baseline." : "Recent subsample consistent with baseline."} ${overtradingRisk ? "Trade frequency elevated — statistical noise risk increases." : ""}`;
    const focus = weaknesses[0] ? `Priority improvement: ${weaknesses[0]} (lowest axis score)` : "Optimize position sizing using Kelly Criterion principles.";
    return { heading, body, focus };
  }

  // philosopher
  const heading = "Market Wisdom";
  const body = totalTrades === 0
    ? "\"The stock market is a device for transferring money from the impatient to the patient.\" — Buffett. Begin with patience. Your first trades are not about profit — they are about learning the language of markets."
    : `${totalTrades} trades, each one a lesson. Win rate of ${wr}% reflects your current understanding — neither good nor bad, simply where you are on the journey. ${recentTrend === "declining" ? "\"Every setback is a setup for a comeback.\" The market is teaching you something right now." : recentTrend === "improving" ? "\"Success is not final; failure is not fatal.\" Keep your perspective broad." : "Consistency itself is a virtue. \"Slow and steady wins the race.\""} `;
  const focus = weaknesses[0] ? `Contemplate: how does ${weaknesses[0]} connect to your wider life habits?` : "Ask yourself: am I trading my plan, or trading my emotions?";
  return { heading, body, focus };
}

function generateAnswer(
  question: string,
  personality: CoachPersonality,
  profile: AdaptiveProfile,
  customInput?: string,
): string {
  const q = (customInput || question).toLowerCase();
  const { winRate, totalTrades, avgWin, avgLoss, recentTrend, overtradingRisk, weaknesses } = profile;
  const wr = (winRate * 100).toFixed(0);
  const rr = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : "N/A";

  // Keyword matching for custom input
  if (customInput) {
    if (q.includes("stop loss") || q.includes("stoploss") || q.includes("stop-loss")) {
      return genStopLossAnswer(personality, profile);
    }
    if (q.includes("entry") || q.includes("enter") || q.includes("buy") || q.includes("when to")) {
      return genEntryAnswer(personality, profile);
    }
    if (q.includes("position size") || q.includes("sizing") || q.includes("how many shares") || q.includes("how much")) {
      return genPositionSizeAnswer(personality, profile);
    }
    if (q.includes("trend") || q.includes("direction") || q.includes("market")) {
      return genTrendAnswer(personality, profile);
    }
    if (q.includes("fomo") || q.includes("fear") || q.includes("emotion") || q.includes("psychology")) {
      return genFomoAnswer(personality, profile);
    }
    // Default fallback for unmatched input
    return genDefaultAnswer(personality, profile);
  }

  // Preset question matching
  if (question.includes("Should I trade today")) {
    if (personality.id === "drill_sergeant") {
      return recentTrend === "declining"
        ? `Win rate: ${wr}%. Performance declining. Reduce size by 50% today. Discipline over impulse.`
        : `Performance stable at ${wr}%. Execute your plan. No excuses.`;
    }
    if (personality.id === "mentor") {
      return recentTrend === "improving"
        ? `Yes! You're on an upswing with a ${wr}% win rate. Trade with confidence but keep your stops in place.`
        : `I'd suggest being selective today. Your ${wr}% win rate shows room for improvement — quality over quantity.`;
    }
    if (personality.id === "quant") {
      return `Statistical expectancy: $${(winRate * avgWin - (1 - winRate) * avgLoss).toFixed(2)}/trade. ${winRate > 0.5 ? "Positive EV system — trade your plan." : "Negative EV detected. Reduce frequency until system is corrected."}`;
    }
    return `"The market will be there tomorrow." Is today's opportunity aligned with your edge? Win rate: ${wr}%. If the setup isn't perfect, patience is the trade.`;
  }

  if (question.includes("last 3 trades were losses")) {
    if (personality.id === "drill_sergeant") {
      return "3 losses in a row — STOP. Review your rules. Are you following your plan? Reduce size 50% for next 3 trades. No revenge trading.";
    }
    if (personality.id === "mentor") {
      return "Losing streaks happen to every trader — even the best. Step back, review what the trades had in common, and look for what you can learn. It's not about the losses; it's about what you do next.";
    }
    if (personality.id === "quant") {
      return `3 consecutive losses has a probability of ${((1 - winRate) ** 3 * 100).toFixed(1)}% given your ${wr}% win rate. This is statistically expected. However, check if loss size exceeded 1.5x average — if so, investigate discipline issues.`;
    }
    return `"An investment in knowledge pays the best interest." — Franklin. Three losses is the market's way of offering you a lesson. What pattern do those trades share? The answer is your growth.`;
  }

  if (question.includes("win rate")) {
    if (personality.id === "drill_sergeant") {
      return `Win rate ${wr}%. A 40% win rate with 2:1 R:R is profitable. A 60% win rate with 0.5:1 R:R is not. Know your numbers and follow the system.`;
    }
    if (personality.id === "mentor") {
      return `Your ${wr}% win rate means you're right about ${wr} times in 100. But win rate alone doesn't tell the whole story — what matters is win rate × avg win vs loss rate × avg loss. Combined with your ${rr}:1 R:R, you ${winRate * avgWin > (1 - winRate) * avgLoss ? "have positive expectancy — keep it up!" : "need to adjust your strategy."}`;
    }
    if (personality.id === "quant") {
      const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;
      return `Win rate: ${wr}%. Avg win: $${avgWin.toFixed(2)}. Avg loss: $${avgLoss.toFixed(2)}. Expectancy: $${expectancy.toFixed(2)}/trade. ${expectancy > 0 ? "Positive expectancy system confirmed." : "Negative expectancy — modify win rate, avg win, or avg loss."} Minimum viable win rate at ${rr}:1 R:R = ${(1 / (1 + parseFloat(rr || "1")) * 100).toFixed(0)}%.`;
    }
    return `"It's not whether you're right or wrong that's important, but how much money you make when you're right." — Soros. A ${wr}% win rate tells you something, but not everything. Focus on the quality of your decisions, not just their frequency of success.`;
  }

  if (question.includes("risking per trade")) {
    return genPositionSizeAnswer(personality, profile);
  }

  if (question.includes("position size")) {
    return genPositionSizeAnswer(personality, profile);
  }

  if (question.includes("overtrading")) {
    if (personality.id === "drill_sergeant") {
      return overtradingRisk
        ? "YES — you are overtrading. Stand down. 3 trades per session maximum. Quality over frequency."
        : `Trade frequency acceptable. ${totalTrades} total trades. Maintain discipline.`;
    }
    if (personality.id === "mentor") {
      return overtradingRisk
        ? "It looks like you may be trading too frequently. Overtrading often comes from boredom or FOMO — it's very common! Try setting a rule: only 3-4 high-quality setups per session."
        : `Your trade frequency looks reasonable so far. Keep waiting for high-quality setups rather than forcing trades.`;
    }
    if (personality.id === "quant") {
      return `Trade count: ${totalTrades}. ${overtradingRisk ? "Elevated trade frequency detected. Statistical noise increases with frequency, reducing edge reliability. Optimal frequency = number of setups meeting full criteria." : "Trade frequency within normal parameters."}`;
    }
    return overtradingRisk
      ? `"The desire to trade all the time is one of the costliest mistakes." Less is often more. Seek the perfect pitch, not every pitch.`
      : `"Patience is not the ability to wait, but the ability to keep a good attitude while waiting." Your trade count suggests good patience.`;
  }

  if (question.includes("best time")) {
    if (personality.id === "drill_sergeant") {
      return `Analyze your P&L by time slot. Trade during your best-performing windows. Cut trading in losing windows. Data-driven discipline.`;
    }
    if (personality.id === "mentor") {
      return `Great question! Your best trading performance appears in certain market conditions. Look at your winning trades — what did they have in common? Time of day, market conditions, volatility? Use those patterns to guide when you trade.`;
    }
    if (personality.id === "quant") {
      return `Performance data by bar-mod-24 bucket available in your trade history. Calculate average P&L per time bucket to identify statistically significant performance differentials. Trade in positive-EV windows only.`;
    }
    return `"Know yourself and you will win all battles." — Sun Tzu. Your best time to trade is when your mind is calm, your plan is clear, and the market speaks clearly to you. Morning, after news settles, often has clarity.`;
  }

  if (question.includes("biggest weakness")) {
    const w = weaknesses[0] || "consistency";
    if (personality.id === "drill_sergeant") {
      return `Weakness: ${w}. Address it immediately. Make a rule for it. Follow the rule. No excuses.`;
    }
    if (personality.id === "mentor") {
      return `Based on your trading patterns, ${w} appears to be your current development area. This is great self-awareness! Focus one lesson on this topic and apply it consciously in your next 5 trades.`;
    }
    if (personality.id === "quant") {
      return `Lowest DNA axis: ${w} (score: ${profile.dna[weaknesses[0]?.toLowerCase().replace(" ", "") as keyof TradingDNA] ?? "N/A"}). Targeted improvement protocol: track this metric on every trade, identify systematic causes, implement countermeasure rules.`;
    }
    return `"Knowing your enemy means knowing yourself." Your ${w} is your teacher right now. It reveals the gap between where you are and where you want to go. Embrace it — it is the door to your next level.`;
  }

  if (question.includes("discipline")) {
    if (personality.id === "drill_sergeant") {
      return "Rules → Plan → Execute → Repeat. Discipline is not a feeling — it is a habit built through reps. Write down your rules. Review them before every trade.";
    }
    if (personality.id === "mentor") {
      return "Discipline comes from clarity. When you know exactly what your setup looks like, when to enter, where your stop is, and when to take profit — discipline follows naturally. Let's work on building that clarity together.";
    }
    if (personality.id === "quant") {
      return `Discipline = systematic rule adherence rate. Track your planned vs actual entries, stops, and exits. Measure the % deviation from plan. Target <5% deviation. Implement pre-trade checklists.`;
    }
    return `"Discipline is the bridge between goals and accomplishment." — Jim Rohn. True discipline in trading is not about force — it is about aligning your actions with your values and your system. When the plan is trusted, discipline becomes natural.`;
  }

  if (question.includes("focus")) {
    if (personality.id === "drill_sergeant") {
      return `Focus: ${weaknesses[0] || "execution quality"}. No distractions. One thing. Master it.`;
    }
    if (personality.id === "mentor") {
      return `Based on your profile, I'd suggest focusing on ${weaknesses[0] || "trade quality"}. Work on this consistently and you'll see meaningful improvement over the next 20 trades.`;
    }
    if (personality.id === "quant") {
      return `Optimal focus area: lowest-scoring DNA metric = ${weaknesses[0] || "unknown"}. Marginal improvement in your weakest area yields highest overall system improvement.`;
    }
    return `"The man who chases two rabbits catches neither." — Confucius. One focus. One improvement. Your ${weaknesses[0] || "trading process"} awaits your full attention.`;
  }

  return genDefaultAnswer(personality, profile);
}

function genStopLossAnswer(personality: CoachPersonality, profile: AdaptiveProfile): string {
  if (personality.id === "drill_sergeant") {
    return "Stop loss = non-negotiable. Place it before the trade. Honor it without exception. Traders who move stops are traders who blow accounts.";
  }
  if (personality.id === "mentor") {
    return "A stop loss is your safety net — it protects your capital so you can trade another day. Place it at a level that invalidates your trade thesis, not where it hurts. Typically 1-2 ATR below support for longs.";
  }
  if (personality.id === "quant") {
    return `Stop placement optimization: set stop at 1.5–2x ATR from entry. This maximizes probability of not being stopped by noise while keeping loss within ${((1 - profile.winRate) * 100).toFixed(0)}% expected outcomes. Never move stops against your position.`;
  }
  return `"The first rule of holes: when you're in one, stop digging." Stop losses are the embodiment of accepting impermanence. The market was wrong about this trade — and that is perfectly fine.`;
}

function genEntryAnswer(personality: CoachPersonality, profile: AdaptiveProfile): string {
  if (personality.id === "drill_sergeant") {
    return `Entry conditions must be pre-defined. No plan = no trade. Check: trend direction, volume confirmation, S/R level, indicator alignment. All 4 met? Execute. Less than 4? Stand down.`;
  }
  if (personality.id === "mentor") {
    return `Great entries come from patience. Wait for your setup to fully develop — all your conditions should be met before you press buy. Remember: missing a trade is far less costly than forcing a bad one.`;
  }
  if (personality.id === "quant") {
    return `Entry timing optimization: enter on confirmation, not anticipation. Statistical edge increases when 3+ independent signals align. Your ${(profile.winRate * 100).toFixed(0)}% win rate suggests ${profile.winRate > 0.5 ? "adequate" : "insufficient"} entry criteria — tighten conditions if win rate < 50%.`;
  }
  return `"The wise man does not wait for opportunities — he creates them." But in trading, patience IS the creation. Wait for the market to come to your price, not the other way around.`;
}

function genPositionSizeAnswer(personality: CoachPersonality, profile: AdaptiveProfile): string {
  const rr = profile.avgLoss > 0 ? profile.avgWin / profile.avgLoss : 1;
  if (personality.id === "drill_sergeant") {
    return `2% rule: max 2% of account per trade. $100k account = $2,000 max risk. Calculate shares: risk amount / (entry - stop). No exceptions. Overleveraged positions blow accounts.`;
  }
  if (personality.id === "mentor") {
    return `Position sizing is one of the most important skills you'll develop. The standard starting point is risking 1-2% of your account per trade. With a $100k account, that's $1,000-$2,000 max loss per trade. Start with 1% until your win rate is consistently above 50%.`;
  }
  if (personality.id === "quant") {
    return `Kelly Criterion: optimal f = (winRate * (rr+1) - 1) / rr = ${((profile.winRate * (rr + 1) - 1) / rr * 100).toFixed(1)}%. Recommended: use half-Kelly = ${((profile.winRate * (rr + 1) - 1) / rr * 50).toFixed(1)}% to account for estimation error. Maximum 2% without Kelly calculation.`;
  }
  return `"Risk comes from not knowing what you're doing." — Buffett. Size your position so that if you're wrong, you can still trade tomorrow. The goal is longevity in the game, not maximum return on this single trade.`;
}

function genTrendAnswer(personality: CoachPersonality, _profile: AdaptiveProfile): string {
  if (personality.id === "drill_sergeant") {
    return "Trade WITH the trend. Period. Counter-trend trades require mastery. You don't have mastery yet. Higher timeframe trend = your bias. Don't fight it.";
  }
  if (personality.id === "mentor") {
    return "Trends are your friend! Look at the big picture first — what is the daily chart showing? Then align your trades with that direction. Trading against the trend is like swimming upstream — much harder and less reliable.";
  }
  if (personality.id === "quant") {
    return "Trend-following has the highest Sharpe ratio of any systematic strategy over 30-year backtests. Verify trend: price above/below 50-day SMA, ADX > 25 for strength. Enter in direction of trend only. Exit when trend structure breaks.";
  }
  return `"The trend is your friend until the end when it bends." — Martin Zweig. The market moves in waves, like the ocean. Rather than fighting the current, learn to read it. The greatest trades ride the largest waves.`;
}

function genFomoAnswer(personality: CoachPersonality, profile: AdaptiveProfile): string {
  if (personality.id === "drill_sergeant") {
    return "FOMO is a weakness. Every missed trade is irrelevant. The next setup is always coming. Chasing is forbidden. Wait. Patience. Execute only on plan.";
  }
  if (personality.id === "mentor") {
    return "Fear of missing out is one of the most common trading challenges — every trader faces it! When you feel FOMO, take a breath and ask: 'Is this my setup?' If it doesn't meet all your criteria, let it go. Another opportunity is always around the corner.";
  }
  if (personality.id === "quant") {
    return `FOMO-driven trades statistically underperform planned entries by average of 30-40% on R:R. Your ${(profile.winRate * 100).toFixed(0)}% win rate would likely drop significantly on FOMO entries. Track entry vs plan adherence to quantify FOMO impact.`;
  }
  return `"The most important quality for an investor is temperament, not intellect." — Buffett. FOMO is the ego's fear of being left behind. But in markets, there is always another opportunity. The trade that passes is replaced by one that fits — if you are patient enough to wait.`;
}

function genDefaultAnswer(personality: CoachPersonality, profile: AdaptiveProfile): string {
  const wr = (profile.winRate * 100).toFixed(0);
  if (personality.id === "drill_sergeant") {
    return `Status check: ${profile.totalTrades} trades, ${wr}% win rate. Focus on your weakest area: ${profile.weaknesses[0] || "execution"}. Follow your plan.`;
  }
  if (personality.id === "mentor") {
    return `I see you're curious about improving your trading! With ${profile.totalTrades} trades and a ${wr}% win rate, you're building a foundation. Keep learning, stay consistent, and the results will follow.`;
  }
  if (personality.id === "quant") {
    return `Query processed. Current metrics: n=${profile.totalTrades}, win%=${wr}, expected edge=${(profile.winRate * profile.avgWin - (1 - profile.winRate) * profile.avgLoss).toFixed(2)}/trade. Refine question for specific statistical analysis.`;
  }
  return `"In investing, what is comfortable is rarely profitable." Trust the process, stay humble, and let the data guide your next steps. What specific pattern would you like to explore?`;
}

// ─── Radar Chart (SVG hexagon) ────────────────────────────────────────────────

function RadarChart({ dna }: { dna: TradingDNA }) {
  const axes: { key: keyof TradingDNA; label: string }[] = [
    { key: "discipline", label: "Discipline" },
    { key: "riskManagement", label: "Risk Mgmt" },
    { key: "patternRecognition", label: "Patterns" },
    { key: "trendFollowing", label: "Trend" },
    { key: "timing", label: "Timing" },
    { key: "emotionalControl", label: "Emotion" },
  ];

  const CX = 70;
  const CY = 70;
  const R = 52;
  const n = axes.length;

  function polarToXY(angle: number, r: number) {
    const rad = (angle * Math.PI) / 180;
    return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
  }

  const angleStep = 360 / n;

  // Web rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0];

  const ringPaths = rings.map((frac) =>
    axes
      .map((_, i) => {
        const pt = polarToXY(i * angleStep, R * frac);
        return `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      })
      .join(" ") + " Z",
  );

  // Axis lines
  const axisLines = axes.map((_, i) => {
    const outer = polarToXY(i * angleStep, R);
    return { x1: CX, y1: CY, x2: outer.x, y2: outer.y };
  });

  // Data polygon
  const dataPath =
    axes
      .map((axis, i) => {
        const val = dna[axis.key] / 100;
        const pt = polarToXY(i * angleStep, R * val);
        return `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  // Labels
  const labelPositions = axes.map((axis, i) => {
    const angle = i * angleStep;
    const pt = polarToXY(angle, R + 16);
    return { ...pt, label: axis.label, value: dna[axis.key] };
  });

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="mx-auto">
      {/* Background rings */}
      {ringPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#3f3f46" strokeWidth="0.7" />
      ))}
      {/* Axis lines */}
      {axisLines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#3f3f46" strokeWidth="0.7" />
      ))}
      {/* Data polygon */}
      <path d={dataPath} fill="#6366f1" fillOpacity="0.25" stroke="#6366f1" strokeWidth="1.5" />
      {/* Data points */}
      {axes.map((axis, i) => {
        const val = dna[axis.key] / 100;
        const pt = polarToXY(i * angleStep, R * val);
        return <circle key={i} cx={pt.x} cy={pt.y} r="2.5" fill="#6366f1" />;
      })}
      {/* Labels */}
      {labelPositions.map((l, i) => {
        const score = l.value;
        const color = score >= 70 ? "#34d399" : score >= 45 ? "#fbbf24" : "#f87171";
        return (
          <g key={i}>
            <text
              x={l.x}
              y={l.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7.5"
              fill="#a1a1aa"
              fontFamily="sans-serif"
            >
              {l.label}
            </text>
            <text
              x={l.x}
              y={l.y + 9}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fill={color}
              fontWeight="bold"
              fontFamily="monospace"
            >
              {score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Personality Card ─────────────────────────────────────────────────────────

function PersonalityCard({
  personality,
  selected,
  onSelect,
}: {
  personality: CoachPersonality;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full rounded-md border px-2 py-2 text-left transition-colors",
        selected
          ? "border-primary/50 bg-primary/10"
          : "border-border bg-background/30 hover:bg-muted/10",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none shrink-0">{personality.icon}</span>
        <div className="min-w-0">
          <div className={cn("text-xs font-semibold leading-none", selected ? "text-primary" : "text-foreground")}>
            {personality.name}
          </div>
          <div className="text-[8.5px] text-muted-foreground mt-0.5">{personality.subtitle}</div>
        </div>
        {selected && (
          <div className="ml-auto shrink-0 h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
    </motion.button>
  );
}

// ─── Section Accordion ────────────────────────────────────────────────────────

function SectionAccordion({
  title,
  icon: Icon,
  defaultOpen,
  children,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="rounded-md border border-border bg-background/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-2.5 py-2 text-left hover:bg-muted/10 transition-colors rounded-md"
      >
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-primary/70 shrink-0" />
          <span className="text-[9.5px] font-semibold text-foreground/70">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-2.5 pb-2.5 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function PersonalizedCoach() {
  const [personalityId, setPersonalityId] = useState<PersonalityId>(() => loadPersonality());
  const [qaQuestion, setQaQuestion] = useState<string | null>(null);
  const [qaAnswer, setQaAnswer] = useState<string>("");
  const [customInput, setCustomInput] = useState<string>("");
  const [displayedAnswer, setDisplayedAnswer] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const completedLessons = useLearnStore((s) => s.completedLessons);

  const personality = PERSONALITIES.find((p) => p.id === personalityId) ?? PERSONALITIES[1];
  const profile = computeAdaptiveProfile(tradeHistory);
  const brief = generateDailyBrief(personality, profile, completedLessons.length);

  const handleSelectPersonality = useCallback(
    (id: PersonalityId) => {
      setPersonalityId(id);
      savePersonality(id);
      setQaAnswer("");
      setDisplayedAnswer("");
      setQaQuestion(null);
    },
    [],
  );

  const startTypingText = useCallback((text: string) => {
    if (typingRef.current) clearInterval(typingRef.current);
    setDisplayedAnswer("");
    setIsTyping(true);
    const chars = text.split("");
    let i = 0;
    typingRef.current = setInterval(() => {
      if (i < chars.length) {
        setDisplayedAnswer((prev) => prev + chars[i]);
        i++;
      } else {
        if (typingRef.current) clearInterval(typingRef.current);
        typingRef.current = null;
        setIsTyping(false);
      }
    }, 14);
  }, []);

  const handleAskQuestion = useCallback(
    (question: string, custom?: string) => {
      setQaQuestion(question);
      const answer = generateAnswer(question, personality, profile, custom);
      setQaAnswer(answer);
      startTypingText(answer);
    },
    [personality, profile, startTypingText],
  );

  const handleCustomSubmit = useCallback(() => {
    if (!customInput.trim()) return;
    const q = customInput.trim();
    setCustomInput("");
    handleAskQuestion(q, q);
  }, [customInput, handleAskQuestion]);

  useEffect(() => {
    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
    };
  }, []);

  // Recompute brief answer when personality changes if a question is selected
  useEffect(() => {
    if (qaQuestion) {
      const answer = generateAnswer(qaQuestion, personality, profile);
      setQaAnswer(answer);
      startTypingText(answer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalityId]);

  const dnaAxes: { key: keyof TradingDNA; label: string; icon: React.ElementType }[] = [
    { key: "discipline", label: "Discipline", icon: Shield },
    { key: "riskManagement", label: "Risk Mgmt", icon: AlertTriangle },
    { key: "patternRecognition", label: "Patterns", icon: Brain },
    { key: "trendFollowing", label: "Trend", icon: TrendingUp },
    { key: "timing", label: "Timing", icon: Clock },
    { key: "emotionalControl", label: "Emotion", icon: Zap },
  ];

  return (
    <div className="space-y-2">
      {/* ── Section 1: Personality Selector ──────────────────────────────── */}
      <SectionAccordion title="Coach Personality" icon={Target} defaultOpen>
        <div className="grid grid-cols-2 gap-1.5">
          {PERSONALITIES.map((p) => (
            <PersonalityCard
              key={p.id}
              personality={p}
              selected={personalityId === p.id}
              onSelect={() => handleSelectPersonality(p.id)}
            />
          ))}
        </div>
        <div className="text-[8.5px] text-muted-foreground/70 text-center pt-1">
          Active: <span className="text-primary font-semibold">{personality.name}</span>
        </div>
      </SectionAccordion>

      {/* ── Section 2: Adaptive Learning Profile ─────────────────────────── */}
      <SectionAccordion title="Your Trading DNA" icon={Brain} defaultOpen>
        {profile.totalTrades === 0 ? (
          <div className="text-[11px] text-muted-foreground text-center py-2">
            Make trades to build your profile
          </div>
        ) : (
          <>
            {/* Radar chart */}
            <div className="flex justify-center">
              <RadarChart dna={profile.dna} />
            </div>

            {/* Axis bars */}
            <div className="space-y-1">
              {dnaAxes.map(({ key, label, icon: IconComp }) => {
                const value = profile.dna[key];
                const color =
                  value >= 70 ? "bg-emerald-400" : value >= 45 ? "bg-amber-400" : "bg-red-400";
                const textColor =
                  value >= 70 ? "text-emerald-400" : value >= 45 ? "text-amber-400" : "text-red-400";
                return (
                  <div key={key} className="flex items-center gap-1.5 text-[8.5px]">
                    <IconComp className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                    <span className="w-16 text-muted-foreground shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-border/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={cn("h-full rounded-full", color)}
                      />
                    </div>
                    <span className={cn("w-6 text-right font-mono text-[11px] font-semibold shrink-0", textColor)}>
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="rounded border border-border bg-background/30 py-1">
                <div className="text-[11px] text-muted-foreground">Win Rate</div>
                <div className={cn("text-xs font-semibold font-mono", profile.winRate >= 0.5 ? "text-emerald-400" : "text-amber-400")}>
                  {(profile.winRate * 100).toFixed(0)}%
                </div>
              </div>
              <div className="rounded border border-border bg-background/30 py-1">
                <div className="text-[11px] text-muted-foreground">Avg Win</div>
                <div className="text-xs font-semibold font-mono text-emerald-400">
                  ${profile.avgWin.toFixed(0)}
                </div>
              </div>
              <div className="rounded border border-border bg-background/30 py-1">
                <div className="text-[11px] text-muted-foreground">Avg Loss</div>
                <div className="text-xs font-semibold font-mono text-red-400">
                  ${profile.avgLoss.toFixed(0)}
                </div>
              </div>
            </div>

            {/* Strengths / Weaknesses */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded border border-emerald-500/20 bg-emerald-500/5 px-2 py-1.5">
                <div className="text-[11px] font-semibold text-emerald-400/70 mb-1">
                  Top Strengths
                </div>
                {profile.strengths.map((s) => (
                  <div key={s} className="flex items-center gap-1 text-[8.5px] text-emerald-400">
                    <span>✓</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <div className="rounded border border-red-500/20 bg-red-500/5 px-2 py-1.5">
                <div className="text-[11px] font-semibold text-red-400/70 mb-1">
                  Work On
                </div>
                {profile.weaknesses.map((w) => (
                  <div key={w} className="flex items-center gap-1 text-[8.5px] text-red-400">
                    <span>↑</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flags */}
            <div className="space-y-1">
              {profile.overtradingRisk && (
                <div className="flex items-center gap-1.5 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[8.5px] text-amber-400">
                  <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                  Overtrading detected — consider slowing down
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[8.5px] text-muted-foreground">
                <BarChart2 className="h-2.5 w-2.5 shrink-0" />
                Trend: <span className={cn("font-semibold ml-0.5", profile.recentTrend === "improving" ? "text-emerald-400" : profile.recentTrend === "declining" ? "text-red-400" : "text-amber-400")}>
                  {profile.recentTrend}
                </span>
              </div>
            </div>
          </>
        )}
      </SectionAccordion>

      {/* ── Section 3: Personalized Daily Brief ──────────────────────────── */}
      <SectionAccordion title="Daily Brief" icon={Lightbulb} defaultOpen>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none shrink-0">{personality.icon}</span>
            <div>
              <div className="text-xs font-semibold text-foreground">{brief.heading}</div>
              <div className="text-[11px] text-muted-foreground">{personality.name} mode</div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{brief.body}</p>
          <div className="rounded border border-primary/30 bg-primary/10 px-2 py-1.5">
            <div className="text-[11px] font-semibold text-primary/70 mb-0.5">
              Today&apos;s Focus
            </div>
            <p className="text-[11px] text-foreground/80 leading-tight">{brief.focus}</p>
          </div>
          {completedLessons.length > 0 && (
            <div className="flex items-center gap-1.5 text-[8.5px] text-muted-foreground">
              <BookOpen className="h-2.5 w-2.5 shrink-0 text-primary/70" />
              {completedLessons.length} lessons completed
              {profile.totalTrades === 0 && " — start trading to apply your knowledge"}
            </div>
          )}
        </div>
      </SectionAccordion>

      {/* ── Section 4: Interactive Q&A ────────────────────────────────────── */}
      <SectionAccordion title="Ask Your Coach" icon={MessageSquare} defaultOpen>
        <div className="space-y-2">
          {/* Preset questions */}
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-foreground/40">
              Quick Questions
            </div>
            <div className="flex flex-wrap gap-1">
              {PRESET_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleAskQuestion(q)}
                  className={cn(
                    "rounded border px-1.5 py-0.5 text-[7.5px] leading-none transition-colors whitespace-nowrap",
                    qaQuestion === q
                      ? "border-primary/50 bg-primary/15 text-primary font-semibold"
                      : "border-border bg-background/20 text-muted-foreground hover:bg-muted/10 hover:text-foreground",
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Answer display */}
          <AnimatePresence>
            {(displayedAnswer || isTyping) && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-md border border-border bg-background/40 px-2.5 py-2"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm leading-none">{personality.icon}</span>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {personality.name}
                  </span>
                  {isTyping && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse ml-auto" />
                  )}
                  {!isTyping && qaAnswer && (
                    <button
                      type="button"
                      onClick={() => startTypingText(qaAnswer)}
                      className="ml-auto text-muted-foreground hover:text-foreground"
                      title="Replay"
                    >
                      <RefreshCw className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-foreground/80 leading-relaxed">
                  {displayedAnswer}
                  {isTyping && (
                    <span className="inline-block h-2 w-0.5 bg-primary ml-0.5 animate-pulse" />
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom input */}
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-foreground/40">
              Ask Anything
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCustomSubmit();
                }}
                placeholder={`Ask ${personality.name.split(" ").pop()}...`}
                className="flex-1 rounded border border-border bg-background/30 px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-background/50 transition-colors"
              />
              <button
                type="button"
                onClick={handleCustomSubmit}
                disabled={!customInput.trim()}
                className={cn(
                  "rounded border px-2 py-1 transition-colors shrink-0",
                  customInput.trim()
                    ? "border-primary/40 bg-primary/15 text-primary hover:bg-primary/25"
                    : "border-border bg-transparent text-muted-foreground/30 cursor-not-allowed",
                )}
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
            <div className="text-[7.5px] text-muted-foreground/50">
              Topics: stop loss, entry, position size, trend, FOMO, discipline
            </div>
          </div>
        </div>
      </SectionAccordion>
    </div>
  );
}
