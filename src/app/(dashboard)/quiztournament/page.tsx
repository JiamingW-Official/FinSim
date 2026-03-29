"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Brain, Zap, Clock, Star, Shield, Swords, Flame,
  CheckCircle2, XCircle, Crown, Medal, Lock, TrendingUp,
  BarChart2, Target, ChevronRight, ChevronDown, ThumbsUp, ThumbsDown,
  Plus, Eye, Share2, AlertCircle, BookOpen, Users, Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── PRNG ──────────────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Category =
  | "Fundamentals"
  | "Technical Analysis"
  | "Options"
  | "Macro"
  | "Crypto"
  | "Risk Management"
  | "Behavioral Finance"
  | "Derivatives";

type QuestionType = "mc" | "tf" | "calc";
type Difficulty = 1 | 2 | 3;

interface Question {
  id: string;
  category: Category;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  learnLink?: string;
  workSteps?: string[];
}

interface PlayerAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timeUsed: number; // seconds
  points: number;
}

type LeagueTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

interface LeaguePlayer {
  rank: number;
  username: string;
  weeklyScore: number;
  trend: number[]; // 7 days
  tier: LeagueTier;
  isUser?: boolean;
}

interface BossChallenge {
  id: number;
  name: string;
  title: string;
  description: string;
  hp: number;
  category: string;
  winThreshold: number;
  badge: string;
  unlocked: boolean;
}

type SpeedRoundState = "idle" | "playing" | "done";

interface CommunityQuestion {
  id: string;
  author: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: Category;
  difficulty: Difficulty;
  votes: number;
  downvotes: number;
}

// ── Question Bank (30 questions) ──────────────────────────────────────────────

const QUESTION_BANK: Question[] = [
  // Fundamentals
  {
    id: "f1",
    category: "Fundamentals",
    type: "mc",
    difficulty: 2,
    question: "What is the Price-to-Earnings (P/E) ratio?",
    options: [
      "Share price divided by annual earnings per share",
      "Annual earnings divided by total equity",
      "Market cap divided by total revenue",
      "Book value divided by share price",
    ],
    correctIndex: 0,
    explanation:
      "The P/E ratio = Stock Price / EPS. It tells you how much investors pay per dollar of earnings. A high P/E may signal growth expectations or overvaluation.",
    learnLink: "/learn",
  },
  {
    id: "f2",
    category: "Fundamentals",
    type: "mc",
    difficulty: 2,
    question: "A bond's duration increases when…",
    options: [
      "Yield decreases or maturity increases",
      "Coupon rate increases",
      "Credit rating improves",
      "Inflation rises",
    ],
    correctIndex: 0,
    explanation:
      "Duration measures interest rate sensitivity. Lower yields and longer maturities both increase duration because the present value of future cash flows becomes more sensitive to rate changes.",
    learnLink: "/bonds",
  },
  {
    id: "f3",
    category: "Fundamentals",
    type: "tf",
    difficulty: 1,
    question:
      "True or False: A higher Price-to-Book (P/B) ratio always indicates a better investment.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "False. A high P/B could mean overvaluation. Value investors often prefer P/B < 1, though high-quality companies with strong intangibles may justify premiums.",
  },
  {
    id: "f4",
    category: "Fundamentals",
    type: "calc",
    difficulty: 3,
    question:
      "Company A has EPS of $4 and its stock trades at $60. Competitor B trades at 20× earnings with EPS of $3. Which is relatively cheaper on a P/E basis?",
    options: [
      "Company A at P/E = 15",
      "Company B at P/E = 20",
      "Both are equally valued",
      "Cannot be determined",
    ],
    correctIndex: 0,
    explanation:
      "Company A: P/E = $60 / $4 = 15. Company B: P/E = 20. Company A is cheaper on a P/E basis, paying 15× vs 20× for each dollar of earnings.",
    workSteps: ["Company A P/E = $60 / $4 = 15", "Company B P/E = 20", "15 < 20, so Company A is cheaper"],
  },
  // Technical Analysis
  {
    id: "t1",
    category: "Technical Analysis",
    type: "mc",
    difficulty: 2,
    question: "The Sharpe ratio measures…",
    options: [
      "Return per unit of total risk (standard deviation)",
      "Return per unit of systematic risk (beta)",
      "Maximum drawdown relative to peak",
      "Win rate divided by loss rate",
    ],
    correctIndex: 0,
    explanation:
      "Sharpe Ratio = (Portfolio Return - Risk-Free Rate) / Standard Deviation. It adjusts returns for volatility, allowing comparison across strategies.",
    learnLink: "/indicators",
  },
  {
    id: "t2",
    category: "Technical Analysis",
    type: "mc",
    difficulty: 2,
    question: "What does a 'Death Cross' signal in technical analysis?",
    options: [
      "50-day MA crosses below 200-day MA — bearish signal",
      "200-day MA crosses above 50-day MA — bullish signal",
      "RSI drops below 30 — oversold condition",
      "Volume spikes on a red candle — distribution",
    ],
    correctIndex: 0,
    explanation:
      "A Death Cross occurs when the 50-day moving average crosses below the 200-day MA. It is considered a bearish long-term signal and often precedes prolonged downtrends.",
  },
  {
    id: "t3",
    category: "Technical Analysis",
    type: "tf",
    difficulty: 1,
    question: "True or False: RSI above 70 always means you should sell.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "False. RSI > 70 signals overbought conditions, but strong uptrends can remain overbought for extended periods. Context, confirmation, and trend direction matter.",
  },
  {
    id: "t4",
    category: "Technical Analysis",
    type: "mc",
    difficulty: 3,
    question: "Which pattern typically signals a trend reversal from bullish to bearish?",
    options: [
      "Head and Shoulders",
      "Inverse Head and Shoulders",
      "Ascending Triangle",
      "Bullish Pennant",
    ],
    correctIndex: 0,
    explanation:
      "The Head and Shoulders pattern (with a neckline) is one of the most reliable bearish reversal patterns. A break below the neckline confirms the reversal.",
  },
  // Options
  {
    id: "o1",
    category: "Options",
    type: "mc",
    difficulty: 2,
    question: "What is the Black-Scholes assumption about stock price behavior?",
    options: [
      "Stock prices follow a log-normal distribution",
      "Stock prices follow a normal distribution",
      "Stock prices move in random walks with fat tails",
      "Stock prices are mean-reverting",
    ],
    correctIndex: 0,
    explanation:
      "Black-Scholes assumes stock prices follow geometric Brownian motion, meaning log returns are normally distributed — i.e., prices are log-normally distributed. This implies prices can't go negative.",
    learnLink: "/options",
  },
  {
    id: "o2",
    category: "Options",
    type: "mc",
    difficulty: 2,
    question: "Delta neutral means…",
    options: [
      "The portfolio is not affected by small stock price movements",
      "All options expire worthless",
      "Implied volatility equals historical volatility",
      "The position has zero gamma",
    ],
    correctIndex: 0,
    explanation:
      "A delta-neutral portfolio has net delta ≈ 0, meaning small moves in the underlying don't change portfolio value. Traders achieve this by hedging with offsetting delta positions.",
  },
  {
    id: "o3",
    category: "Options",
    type: "tf",
    difficulty: 1,
    question: "True or False: Buying a call option gives you the obligation to buy shares.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "False. Buying a call gives you the RIGHT (not obligation) to buy 100 shares at the strike price before expiration. Only option sellers have obligations.",
  },
  {
    id: "o4",
    category: "Options",
    type: "mc",
    difficulty: 3,
    question: "Which Greek measures the rate of change of delta with respect to the underlying price?",
    options: ["Gamma", "Vega", "Theta", "Rho"],
    correctIndex: 0,
    explanation:
      "Gamma measures how much delta changes for a $1 move in the underlying. High gamma means delta changes quickly, making the position more dynamic and harder to hedge.",
    learnLink: "/greeks",
  },
  // Macro
  {
    id: "m1",
    category: "Macro",
    type: "mc",
    difficulty: 1,
    question: "The Fed Funds rate is…",
    options: [
      "The overnight lending rate between banks",
      "The interest rate on 10-year Treasury bonds",
      "The discount rate charged to commercial banks",
      "The prime rate offered to best customers",
    ],
    correctIndex: 0,
    explanation:
      "The Federal Funds Rate is the interest rate at which banks lend reserve balances to each other overnight. The Fed sets a target range and uses open market operations to hit it.",
    learnLink: "/macro",
  },
  {
    id: "m2",
    category: "Macro",
    type: "mc",
    difficulty: 2,
    question: "An inverted yield curve (2yr > 10yr) historically predicts…",
    options: [
      "A recession within 12-18 months",
      "Immediate stock market crash",
      "Rising inflation",
      "Stronger economic growth",
    ],
    correctIndex: 0,
    explanation:
      "An inverted yield curve has preceded every U.S. recession since the 1960s, typically by 12-18 months. It signals that markets expect future rate cuts due to economic weakness.",
  },
  {
    id: "m3",
    category: "Macro",
    type: "tf",
    difficulty: 1,
    question: "True or False: Quantitative Easing (QE) directly increases the money supply in the economy.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "True. QE involves the Fed buying securities from banks, crediting their reserve accounts. This expands the monetary base, though it doesn't automatically reach consumers.",
  },
  {
    id: "m4",
    category: "Macro",
    type: "mc",
    difficulty: 3,
    question: "The Taylor Rule approximates the optimal Fed Funds rate based on…",
    options: [
      "Inflation gap + output gap",
      "Unemployment rate + GDP growth",
      "CPI + PPI averages",
      "M2 money supply growth",
    ],
    correctIndex: 0,
    explanation:
      "The Taylor Rule: r = r* + π + 0.5(π - π*) + 0.5(y - y*). It suggests the Fed should raise rates when inflation exceeds target or when output exceeds potential, and vice versa.",
  },
  // Crypto
  {
    id: "c1",
    category: "Crypto",
    type: "mc",
    difficulty: 2,
    question: "Impermanent loss occurs when…",
    options: [
      "Asset prices diverge from initial ratio in a liquidity pool",
      "A smart contract is hacked",
      "Gas fees exceed trading profits",
      "The protocol's governance token drops in value",
    ],
    correctIndex: 0,
    explanation:
      "Impermanent loss happens in AMM liquidity pools when token prices change from their initial deposit ratio. The LP would have been better off just holding the tokens. It's 'impermanent' if prices revert.",
    learnLink: "/crypto",
  },
  {
    id: "c2",
    category: "Crypto",
    type: "mc",
    difficulty: 2,
    question: "What is the halving event in Bitcoin?",
    options: [
      "The block reward for miners is cut in half approximately every 4 years",
      "Bitcoin's supply is reduced by 50% through coin burning",
      "Transaction fees double every halving cycle",
      "The block time doubles to reduce energy consumption",
    ],
    correctIndex: 0,
    explanation:
      "Bitcoin's halving reduces the mining reward by 50% every 210,000 blocks (~4 years). This controls inflation and historically precedes bull markets as new supply decreases.",
  },
  {
    id: "c3",
    category: "Crypto",
    type: "tf",
    difficulty: 1,
    question: "True or False: Proof of Stake uses less energy than Proof of Work.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "True. Proof of Stake validates transactions through staked collateral rather than computational work, using up to 99.9% less energy than Proof of Work (e.g., Ethereum's Merge reduced energy use by ~99.95%).",
  },
  // Risk Management
  {
    id: "r1",
    category: "Risk Management",
    type: "mc",
    difficulty: 2,
    question: "VaR (Value at Risk) at 95% confidence means…",
    options: [
      "We expect to lose more than VaR in 5% of cases",
      "Maximum possible loss is VaR",
      "We are 95% sure of making a profit",
      "The portfolio loses exactly VaR 95% of the time",
    ],
    correctIndex: 0,
    explanation:
      "95% VaR means you expect to lose MORE than the VaR amount only 5% of the time. It does NOT cap losses — tail risk (CVaR/Expected Shortfall) measures the average loss beyond VaR.",
    learnLink: "/risk",
  },
  {
    id: "r2",
    category: "Risk Management",
    type: "mc",
    difficulty: 2,
    question: "The Kelly Criterion formula for bet sizing is…",
    options: [
      "f* = (bp - q) / b",
      "f* = p / (1 + b)",
      "f* = (p - q) × b",
      "f* = p × b - (1 - p)",
    ],
    correctIndex: 0,
    explanation:
      "Kelly formula: f* = (bp - q) / b, where b = decimal odds, p = win probability, q = 1-p. It maximizes long-run growth but can be volatile — many traders use half-Kelly.",
  },
  {
    id: "r3",
    category: "Risk Management",
    type: "tf",
    difficulty: 1,
    question: "True or False: Diversification eliminates all investment risk.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "False. Diversification eliminates unsystematic (company-specific) risk but cannot eliminate systematic (market) risk, which affects all assets. That's why even a diversified portfolio falls in a crash.",
  },
  {
    id: "r4",
    category: "Risk Management",
    type: "mc",
    difficulty: 3,
    question: "Maximum Drawdown measures…",
    options: [
      "Peak-to-trough portfolio decline before a new peak is reached",
      "Average daily loss over a trading year",
      "Largest single-day percentage drop",
      "Standard deviation of monthly returns",
    ],
    correctIndex: 0,
    explanation:
      "Maximum Drawdown = (Trough Value - Peak Value) / Peak Value. It's a key risk metric for strategies: a 50% drawdown requires a 100% gain to recover.",
  },
  // Behavioral Finance
  {
    id: "b1",
    category: "Behavioral Finance",
    type: "mc",
    difficulty: 2,
    question: "Loss aversion in behavioral finance means…",
    options: [
      "Losses feel roughly twice as painful as equivalent gains feel good",
      "Investors avoid all losing positions",
      "Portfolio losses trigger automatic sell orders",
      "Traders cut winners too early",
    ],
    correctIndex: 0,
    explanation:
      "Kahneman & Tversky's Prospect Theory shows losses feel ~2× more painful than equivalent gains. This causes investors to hold losers too long (hoping to break even) and sell winners too early.",
  },
  {
    id: "b2",
    category: "Behavioral Finance",
    type: "mc",
    difficulty: 2,
    question: "Confirmation bias in investing means…",
    options: [
      "Seeking information that confirms existing beliefs while ignoring contradictory evidence",
      "Overweighting recent events in decision-making",
      "Anchoring to the first price seen",
      "Following the crowd regardless of fundamentals",
    ],
    correctIndex: 0,
    explanation:
      "Confirmation bias leads investors to cherry-pick bullish news for stocks they own and dismiss bearish signals. It's why many retail investors hold during crashes — they only read positive commentary.",
  },
  {
    id: "b3",
    category: "Behavioral Finance",
    type: "tf",
    difficulty: 1,
    question: "True or False: The disposition effect causes investors to sell winners too early and hold losers too long.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "True. The disposition effect (Shefrin & Statman, 1985) describes investors' tendency to sell winners prematurely to lock in gains, while holding losers hoping for a recovery — the opposite of optimal tax-loss harvesting.",
  },
  // Derivatives
  {
    id: "d1",
    category: "Derivatives",
    type: "mc",
    difficulty: 2,
    question: "A futures contract differs from a forward contract in that futures are…",
    options: [
      "Standardized, exchange-traded, and marked-to-market daily",
      "Custom OTC contracts with no margin requirements",
      "Always settled by physical delivery",
      "Only available for commodities, not financial assets",
    ],
    correctIndex: 0,
    explanation:
      "Futures are standardized contracts traded on exchanges with daily mark-to-market (margin calls). Forwards are customizable OTC contracts settled at maturity — with counterparty credit risk.",
    learnLink: "/futures",
  },
  {
    id: "d2",
    category: "Derivatives",
    type: "mc",
    difficulty: 3,
    question: "Put-Call Parity states that for European options…",
    options: [
      "C - P = S - PV(K), where PV(K) is the discounted strike price",
      "C + P = S + K",
      "C / P = S / K",
      "C = P when S = K",
    ],
    correctIndex: 0,
    explanation:
      "Put-Call Parity: C - P = S - Ke^(-rT). This means Call - Put = Spot - PV(Strike). If this relationship breaks down, arbitrage opportunities exist. Valid only for European options.",
  },
  {
    id: "d3",
    category: "Derivatives",
    type: "mc",
    difficulty: 2,
    question: "An interest rate swap where a company pays fixed and receives floating is beneficial when…",
    options: [
      "Interest rates are expected to fall",
      "Interest rates are expected to rise",
      "The yield curve is inverted",
      "Inflation is above target",
    ],
    correctIndex: 0,
    explanation:
      "A pay-fixed/receive-floating swap benefits when rates fall: the company pays the locked-in fixed rate but receives a higher floating rate during the period before it drops.",
  },
  {
    id: "d4",
    category: "Derivatives",
    type: "calc",
    difficulty: 3,
    question:
      "A call option has: S=$100, K=$105, T=1yr, r=5%, σ=20%. Using Black-Scholes, d1 ≈ 0.22. What does N(d1) represent?",
    options: [
      "The risk-adjusted probability the option expires in-the-money (call delta)",
      "The probability the stock finishes above $105",
      "The option's time value as a percentage",
      "The vega of the option",
    ],
    correctIndex: 0,
    explanation:
      "N(d1) is the option's delta — the risk-adjusted probability of expiring ITM (and the hedge ratio). N(d2) is the actual risk-neutral probability of expiration ITM. Both are related but different.",
    workSteps: [
      "d1 = [ln(S/K) + (r + σ²/2)T] / (σ√T)",
      "N(d1) = cumulative normal CDF at d1",
      "Represents delta: shares to hold to hedge 1 call",
    ],
  },
];

// ── Category colors ───────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<Category, string> = {
  Fundamentals: "bg-primary/20 text-primary border-border",
  "Technical Analysis": "bg-primary/20 text-primary border-border",
  Options: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Macro: "bg-green-500/20 text-green-400 border-green-500/30",
  Crypto: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Risk Management": "bg-red-500/20 text-red-400 border-red-500/30",
  "Behavioral Finance": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Derivatives: "bg-cyan-500/20 text-muted-foreground border-cyan-500/30",
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };
const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  1: "text-green-400",
  2: "text-yellow-400",
  3: "text-red-400",
};

// ── Animated Countdown Ring ───────────────────────────────────────────────────

function CountdownRing({ timeLeft, total }: { timeLeft: number; total: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const progress = timeLeft / total;
  const strokeDashoffset = circ * (1 - progress);
  const color = timeLeft > 15 ? "#22c55e" : timeLeft > 7 ? "#eab308" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-14 h-14">
      <svg width={56} height={56} className="-rotate-90">
        <circle cx={28} cy={28} r={r} fill="none" stroke="#1e293b" strokeWidth={4} />
        <circle
          cx={28}
          cy={28}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={circ}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <span
        className="absolute text-sm font-bold tabular-nums"
        style={{ color }}
      >
        {timeLeft}
      </span>
    </div>
  );
}

// ── Mini Sparkline ─────────────────────────────────────────────────────────────

function Sparkline({ data, color = "#22c55e" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 56, h = 20;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Grade helper ──────────────────────────────────────────────────────────────

function calcGrade(pct: number): { grade: string; color: string } {
  if (pct >= 0.9) return { grade: "S", color: "text-yellow-400" };
  if (pct >= 0.75) return { grade: "A", color: "text-green-400" };
  if (pct >= 0.6) return { grade: "B", color: "text-primary" };
  if (pct >= 0.45) return { grade: "C", color: "text-orange-400" };
  return { grade: "D", color: "text-red-400" };
}

// ── League tier helpers ───────────────────────────────────────────────────────

const TIER_ORDER: LeagueTier[] = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const TIER_COLOR: Record<LeagueTier, string> = {
  Bronze: "text-amber-700",
  Silver: "text-muted-foreground",
  Gold: "text-yellow-400",
  Platinum: "text-muted-foreground",
  Diamond: "text-primary",
};
const TIER_BG: Record<LeagueTier, string> = {
  Bronze: "bg-amber-700/20 border-amber-700/40",
  Silver: "bg-muted-foreground/20 border-muted-foreground/40",
  Gold: "bg-yellow-500/20 border-yellow-500/40",
  Platinum: "bg-cyan-400/20 border-cyan-400/40",
  Diamond: "bg-primary/20 border-border",
};

// ── Boss Challenges data ──────────────────────────────────────────────────────

const BOSSES: BossChallenge[] = [
  {
    id: 1,
    name: "The Analyst",
    title: "Financial Statement Expert",
    description: "10 deep-dive questions on income statements, balance sheets, ratios, and valuation.",
    hp: 100,
    category: "Fundamentals",
    winThreshold: 8,
    badge: "CFA Candidate",
    unlocked: true,
  },
  {
    id: 2,
    name: "The Trader",
    title: "Market Technician",
    description: "10 questions spanning technical patterns, options greeks, and order flow.",
    hp: 100,
    category: "Technical Analysis + Options",
    winThreshold: 8,
    badge: "Chart Master",
    unlocked: false,
  },
  {
    id: 3,
    name: "The Quant",
    title: "Statistical Arbitrageur",
    description: "10 questions on statistics, probability, derivatives pricing, and risk models.",
    hp: 100,
    category: "Derivatives + Risk",
    winThreshold: 8,
    badge: "Quant Elite",
    unlocked: false,
  },
  {
    id: 4,
    name: "The Macro Master",
    title: "Global Macro Strategist",
    description: "10 questions on central banks, geopolitics, yield curves, and FX dynamics.",
    hp: 100,
    category: "Macro + Crypto",
    winThreshold: 8,
    badge: "Macro Oracle",
    unlocked: false,
  },
  {
    id: 5,
    name: "The Legend",
    title: "Omniscient Investor",
    description: "10 hardest questions from every category. Only the elite survive.",
    hp: 100,
    category: "All Categories",
    winThreshold: 8,
    badge: "Wall Street Legend",
    unlocked: false,
  },
];

// ── Synthetic league data ─────────────────────────────────────────────────────

function buildLeague(seed: number): LeaguePlayer[] {
  const rng = mulberry32(seed);
  const names = [
    "QuantKing", "MomentumMike", "ValueVince", "AlphaSeeking",
    "TechTrader", "DivYieldDave", "CryptoCarl", "MarginMia",
    "ArbitrageAce", "VolVolume", "DeepValue99", "SwingKing",
    "ScalpMaster", "RiskParity", "GrowthGuru", "MaestroFX",
    "BondBaron", "OptionOliver", "SectorSam", "MacroMeg",
  ];
  const tiers: LeagueTier[] = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
  const userRank = Math.floor(rng() * 15) + 3; // user between rank 3-17

  return names.map((name, i) => {
    const rank = i + 1;
    const tierIdx = Math.min(4, Math.floor((20 - rank) / 4));
    const baseScore = 2000 - rank * 80 + Math.floor(rng() * 120);
    const trend = Array.from({ length: 7 }, () => Math.floor(rng() * 300) + 50);
    return {
      rank,
      username: rank === userRank ? "You" : name,
      weeklyScore: baseScore,
      trend,
      tier: tiers[tierIdx],
      isUser: rank === userRank,
    };
  });
}

// ── Community questions (seeded) ──────────────────────────────────────────────

function buildCommunityQuestions(seed: number): CommunityQuestion[] {
  const rng = mulberry32(seed);
  const authors = ["QuizMaster99", "FinanceNerd", "WallStreetWiz", "ValueHunter", "OptionSage"];
  const categories: Category[] = ["Fundamentals", "Technical Analysis", "Options", "Macro", "Risk Management"];
  return [
    {
      id: "cq1",
      author: authors[Math.floor(rng() * authors.length)],
      question: "What is the difference between gross margin and net margin?",
      options: [
        "Gross margin excludes operating/interest expenses; net margin includes all expenses",
        "Gross margin is always higher than net margin because it excludes taxes",
        "They are the same metric expressed differently",
        "Net margin excludes COGS while gross margin includes it",
      ],
      correctIndex: 0,
      explanation: "Gross Margin = (Revenue - COGS) / Revenue. Net Margin = Net Income / Revenue. Net margin accounts for ALL expenses including operating, interest, and taxes.",
      category: "Fundamentals",
      difficulty: 2,
      votes: Math.floor(rng() * 200) + 50,
      downvotes: Math.floor(rng() * 20),
    },
    {
      id: "cq2",
      author: authors[Math.floor(rng() * authors.length)],
      question: "Which indicator measures trend strength without direction?",
      options: [
        "ADX (Average Directional Index)",
        "MACD (Moving Average Convergence Divergence)",
        "RSI (Relative Strength Index)",
        "Bollinger Bands",
      ],
      correctIndex: 0,
      explanation: "ADX measures trend strength on a 0-100 scale: >25 = trending, >50 = strong trend. It does not indicate direction — use +DI and -DI for that.",
      category: "Technical Analysis",
      difficulty: 2,
      votes: Math.floor(rng() * 180) + 40,
      downvotes: Math.floor(rng() * 15),
    },
    {
      id: "cq3",
      author: authors[Math.floor(rng() * authors.length)],
      question: "What does 'Theta decay' mean for an options buyer?",
      options: [
        "Time value erodes, reducing the option's price each day",
        "The option gains value as expiration approaches",
        "Delta decreases as time passes",
        "Implied volatility decays toward historical volatility",
      ],
      correctIndex: 0,
      explanation: "Theta is the rate of time value decay. Options buyers lose Theta each day — even if the stock doesn't move, the option becomes less valuable. Sellers collect Theta.",
      category: "Options",
      difficulty: 1,
      votes: Math.floor(rng() * 250) + 80,
      downvotes: Math.floor(rng() * 10),
    },
    {
      id: "cq4",
      author: authors[Math.floor(rng() * authors.length)],
      question: "In an inflationary environment, which asset class typically suffers most?",
      options: [
        "Long-duration bonds",
        "Commodities",
        "Real estate",
        "Value stocks",
      ],
      correctIndex: 0,
      explanation: "Long-duration bonds suffer most from inflation because rising rates discount future cash flows more heavily. Duration amplifies price sensitivity to rate changes.",
      category: "Macro",
      difficulty: 2,
      votes: Math.floor(rng() * 160) + 30,
      downvotes: Math.floor(rng() * 25),
    },
    {
      id: "cq5",
      author: authors[Math.floor(rng() * authors.length)],
      question: "The Sortino ratio improves on the Sharpe ratio by…",
      options: [
        "Only penalizing downside volatility, not upside volatility",
        "Using geometric mean instead of arithmetic mean",
        "Accounting for leverage in the denominator",
        "Adjusting for skewness and kurtosis",
      ],
      correctIndex: 0,
      explanation: "Sortino Ratio = (Return - Target) / Downside Deviation. It penalizes only harmful volatility (downside), unlike Sharpe which penalizes both up and down moves equally.",
      category: "Risk Management",
      difficulty: 3,
      votes: Math.floor(rng() * 140) + 60,
      downvotes: Math.floor(rng() * 12),
    },
  ];
}

// ── Shared quiz logic hook ────────────────────────────────────────────────────

type QuizMode = "daily" | "speed";

interface QuizState {
  questions: Question[];
  current: number;
  answers: PlayerAnswer[];
  timeLeft: number;
  phase: "idle" | "playing" | "answered" | "done";
  streak: number;
  totalPoints: number;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  onAnswer,
  selectedIndex,
  answered,
  timeLeft,
  totalTime,
  currentIdx,
  totalQuestions,
  streak,
  mode = "daily",
}: {
  question: Question;
  onAnswer: (idx: number) => void;
  selectedIndex: number | null;
  answered: boolean;
  timeLeft: number;
  totalTime: number;
  currentIdx: number;
  totalQuestions: number;
  streak: number;
  mode?: QuizMode;
}) {
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="space-y-4"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Q{currentIdx + 1}/{totalQuestions}
          </span>
          <span className={cn("text-xs border rounded px-1.5 py-0.5", CATEGORY_COLORS[question.category])}>
            {question.category}
          </span>
          <span className={cn("text-xs font-medium", DIFFICULTY_COLOR[question.difficulty])}>
            {DIFFICULTY_LABEL[question.difficulty]}
          </span>
          {question.type === "calc" && (
            <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded px-1.5 py-0.5">
              Calculation
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1 text-orange-400 text-xs">
              <Flame className="h-3.5 w-3.5" />
              <span className="font-bold">{streak}×</span>
            </div>
          )}
          <CountdownRing timeLeft={timeLeft} total={totalTime} />
        </div>
      </div>

      {/* Progress bar */}
      <Progress
        value={((currentIdx) / totalQuestions) * 100}
        className="h-1 bg-muted"
      />

      {/* Question */}
      <Card className="bg-card/70 border-border/50 p-5">
        <p className="text-sm leading-relaxed text-foreground font-medium">{question.question}</p>
        {question.type === "calc" && question.workSteps && (
          <div className="mt-3 p-3 rounded-md bg-muted/60 border border-border/40">
            <p className="text-xs text-muted-foreground mb-1">Working:</p>
            {question.workSteps.map((step, i) => (
              <p key={i} className="text-xs text-muted-foreground font-mono">{step}</p>
            ))}
          </div>
        )}
      </Card>

      {/* Options */}
      <div className="grid gap-2">
        {question.options.map((opt, idx) => {
          let variantClass = "bg-card/60 border-border/50 hover:border-muted-foreground hover:bg-muted/60";
          if (answered) {
            if (idx === question.correctIndex) {
              variantClass = "bg-green-500/20 border-green-500/60";
            } else if (idx === selectedIndex && idx !== question.correctIndex) {
              variantClass = "bg-red-500/20 border-red-500/60";
            } else {
              variantClass = "bg-card/40 border-border/50 opacity-50";
            }
          } else if (selectedIndex === idx) {
            variantClass = "bg-primary/20 border-primary/60";
          }

          return (
            <button
              key={idx}
              onClick={() => !answered && onAnswer(idx)}
              disabled={answered}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center gap-3",
                variantClass
              )}
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted border border-border text-xs flex items-center justify-center font-bold text-muted-foreground">
                {optionLetters[idx]}
              </span>
              <span className="text-sm text-foreground">{opt}</span>
              {answered && idx === question.correctIndex && (
                <CheckCircle2 className="h-4 w-4 text-green-400 ml-auto flex-shrink-0" />
              )}
              {answered && idx === selectedIndex && idx !== question.correctIndex && (
                <XCircle className="h-4 w-4 text-red-400 ml-auto flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Explanation popup ─────────────────────────────────────────────────────────

function ExplanationPanel({
  question,
  wasCorrect,
  points,
  onNext,
  isLast,
}: {
  question: Question;
  wasCorrect: boolean;
  points: number;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-3"
    >
      <Card className={cn(
        "border p-4",
        wasCorrect
          ? "bg-green-500/10 border-green-500/40"
          : "bg-red-500/10 border-red-500/40"
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {wasCorrect ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <span className={cn("text-sm font-semibold", wasCorrect ? "text-green-400" : "text-red-400")}>
              {wasCorrect ? "Correct!" : "Incorrect"}
            </span>
          </div>
          {wasCorrect && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
              +{points} pts
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{question.explanation}</p>
        {question.learnLink && (
          <a
            href={question.learnLink}
            className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary transition-colors"
          >
            <BookOpen className="h-3 w-3" />
            Learn More
          </a>
        )}
      </Card>
      <Button onClick={onNext} className="w-full bg-primary hover:bg-primary text-foreground">
        {isLast ? "See Results" : "Next Question"}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </motion.div>
  );
}

// ── Final Score Screen ────────────────────────────────────────────────────────

function FinalScoreScreen({
  answers,
  questions,
  totalPoints,
  onRestart,
  label,
}: {
  answers: PlayerAnswer[];
  questions: Question[];
  totalPoints: number;
  onRestart: () => void;
  label: string;
}) {
  const correct = answers.filter((a) => a.correct).length;
  const pct = answers.length > 0 ? correct / answers.length : 0;
  const { grade, color } = calcGrade(pct);
  const xpGained = Math.floor(totalPoints * 0.5);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className={cn("text-7xl font-bold mb-2", color)}
        >
          {grade}
        </motion.div>
        <p className="text-muted-foreground text-sm">{label}</p>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{correct}/{answers.length}</div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{totalPoints}</div>
            <div className="text-xs text-muted-foreground">Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">+{xpGained}</div>
            <div className="text-xs text-muted-foreground">XP</div>
          </div>
        </div>
        {pct >= 0.9 && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full px-3 py-1">
            <Crown className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Top 10% — Badge Earned!</span>
          </div>
        )}
      </div>

      {/* Question review */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {answers.map((ans, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            {ans.correct ? (
              <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            )}
            <span className="text-xs text-muted-foreground flex-1 line-clamp-1">
              {questions[i]?.question}
            </span>
            <span className={cn("text-xs font-medium", ans.correct ? "text-green-400" : "text-red-400")}>
              {ans.correct ? `+${ans.points}` : "0"}
            </span>
          </div>
        ))}
      </div>

      <Button onClick={onRestart} className="w-full bg-muted hover:bg-muted text-foreground">
        <BarChart2 className="h-4 w-4 mr-2" />
        Play Again
      </Button>
    </motion.div>
  );
}

// ── Tab 1: Daily Challenge ────────────────────────────────────────────────────

function DailyChallengeTab() {
  const today = new Date();
  const dateSeed =
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const dailyQuestions = useMemo(() => {
    const rng = mulberry32(dateSeed);
    return shuffle(QUESTION_BANK, rng).slice(0, 10);
  }, [dateSeed]);

  const TIMER_TOTAL = 30;
  const [phase, setPhase] = useState<"idle" | "playing" | "answered" | "done">("idle");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_TOTAL);
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          // Time up — auto-submit wrong
          handleAnswer(-1, 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [clearTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback(
    (idx: number, tUsed?: number) => {
      clearTimer();
      const q = dailyQuestions[current];
      if (!q) return;
      const timeUsed = tUsed !== undefined ? tUsed : TIMER_TOTAL - timeLeft;
      const correct = idx === q.correctIndex;
      const timeBonus = correct ? Math.round((1 - timeUsed / TIMER_TOTAL) * 5) : 0;
      const newStreak = correct ? streak + 1 : 0;
      const streakBonus = correct && newStreak > 2 ? Math.floor(newStreak / 2) : 0;
      const pts = correct ? 10 + timeBonus + streakBonus : 0;

      setSelectedIndex(idx);
      setAnswers((prev) => [...prev, { questionId: q.id, selectedIndex: idx, correct, timeUsed, points: pts }]);
      setStreak(newStreak);
      setTotalPoints((p) => p + pts);
      setPhase("answered");
    },
    [current, dailyQuestions, streak, timeLeft, clearTimer]
  );

  const handleNext = useCallback(() => {
    if (current + 1 >= dailyQuestions.length) {
      setPhase("done");
      return;
    }
    setCurrent((c) => c + 1);
    setSelectedIndex(null);
    setTimeLeft(TIMER_TOTAL);
    setPhase("playing");
  }, [current, dailyQuestions.length]);

  useEffect(() => {
    if (phase === "playing") {
      startTimer();
    }
    return clearTimer;
  }, [phase, current, startTimer, clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-center">
          <div className="text-2xl mb-3">
            <Brain className="h-12 w-12 text-primary mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Daily Challenge</h2>
          <p className="text-muted-foreground text-sm mt-1">
            10 questions · 30 seconds each · New questions every day
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            {(["Fundamentals", "Options", "Macro"] as Category[]).map((cat) => (
              <span key={cat} className={cn("text-xs border rounded px-2 py-1", CATEGORY_COLORS[cat])}>
                {cat}
              </span>
            ))}
            <span className="text-xs text-muted-foreground">+5 more</span>
          </div>
        </div>
        <Card className="bg-muted/50 border-border/40 p-4 w-full max-w-sm">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-foreground">10</div>
              <div className="text-xs text-muted-foreground">Questions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">30s</div>
              <div className="text-xs text-muted-foreground">Per Question</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">150</div>
              <div className="text-xs text-muted-foreground">Max Points</div>
            </div>
          </div>
        </Card>
        <Button
          onClick={() => setPhase("playing")}
          className="bg-primary hover:bg-primary text-foreground px-8"
        >
          <Zap className="h-4 w-4 mr-2" />
          Start Daily Challenge
        </Button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <FinalScoreScreen
        answers={answers}
        questions={dailyQuestions}
        totalPoints={totalPoints}
        label="Daily Challenge Complete"
        onRestart={() => {
          setCurrent(0);
          setAnswers([]);
          setSelectedIndex(null);
          setTimeLeft(TIMER_TOTAL);
          setStreak(0);
          setTotalPoints(0);
          setPhase("idle");
        }}
      />
    );
  }

  const q = dailyQuestions[current];
  const lastAnswer = answers[answers.length - 1];

  return (
    <div>
      <AnimatePresence mode="wait">
        {phase === "playing" || phase === "answered" ? (
          <QuestionCard
            key={q.id}
            question={q}
            onAnswer={handleAnswer}
            selectedIndex={selectedIndex}
            answered={phase === "answered"}
            timeLeft={timeLeft}
            totalTime={TIMER_TOTAL}
            currentIdx={current}
            totalQuestions={dailyQuestions.length}
            streak={streak}
          />
        ) : null}
      </AnimatePresence>

      {phase === "answered" && lastAnswer && (
        <ExplanationPanel
          question={q}
          wasCorrect={lastAnswer.correct}
          points={lastAnswer.points}
          onNext={handleNext}
          isLast={current + 1 >= dailyQuestions.length}
        />
      )}
    </div>
  );
}

// ── Tab 2: Weekly League ──────────────────────────────────────────────────────

function WeeklyLeagueTab() {
  const seed = 20260327;
  const league = useMemo(() => buildLeague(seed), []);
  const [selectedTier, setSelectedTier] = useState<LeagueTier | "all">("all");

  const filtered = selectedTier === "all" ? league : league.filter((p) => p.tier === selectedTier);
  const userPlayer = league.find((p) => p.isUser);

  const schedule = [
    { day: "Mon", type: "Daily Quiz", status: "done" },
    { day: "Tue", type: "Daily Quiz", status: "done" },
    { day: "Wed", type: "Daily Quiz", status: "done" },
    { day: "Thu", type: "Daily Quiz", status: "today" },
    { day: "Fri", type: "Daily Quiz", status: "upcoming" },
    { day: "Sat", type: "Speed Round", status: "upcoming" },
    { day: "Sun", type: "Boss Quiz", status: "upcoming" },
  ];

  const prizes = [
    { rank: "1st", xp: 500, label: "Diamond Reward" },
    { rank: "2-3", xp: 300, label: "Platinum Reward" },
    { rank: "4-10", xp: 150, label: "Gold Reward" },
    { rank: "11-17", xp: 75, label: "Silver Reward" },
    { rank: "18-20", xp: 25, label: "Bronze Reward" },
  ];

  return (
    <div className="space-y-4">
      {/* User's standing */}
      {userPlayer && (
        <Card className="bg-primary/10 border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Your Standing</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">#{userPlayer.rank}</span>
                <span className={cn("text-sm font-semibold", TIER_COLOR[userPlayer.tier])}>
                  {userPlayer.tier}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-0.5">Weekly Score</div>
              <div className="text-xl font-bold text-yellow-400">{userPlayer.weeklyScore.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-0.5">7-Day Trend</div>
              <Sparkline data={userPlayer.trend} color="#60a5fa" />
            </div>
          </div>
          {userPlayer.rank <= 3 && (
            <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              Promotion zone — advance to next tier!
            </div>
          )}
          {userPlayer.rank >= 18 && (
            <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Relegation zone — play more to stay safe!
            </div>
          )}
        </Card>
      )}

      {/* Weekly schedule */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2">This Week's Schedule</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {schedule.map((s) => (
            <div
              key={s.day}
              className={cn(
                "flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg border text-center min-w-[60px]",
                s.status === "done" && "bg-green-500/10 border-green-500/30",
                s.status === "today" && "bg-primary/10 border-primary/50 ring-1 ring-blue-500",
                s.status === "upcoming" && "bg-muted/50 border-border/40"
              )}
            >
              <span className="text-xs font-bold text-muted-foreground">{s.day}</span>
              <span className={cn("text-xs",
                s.status === "done" ? "text-green-400" :
                s.status === "today" ? "text-primary" : "text-muted-foreground"
              )}>
                {s.type}
              </span>
              {s.status === "done" && <CheckCircle2 className="h-3 w-3 text-green-400" />}
              {s.status === "today" && <Zap className="h-3 w-3 text-primary" />}
              {s.status === "upcoming" && <Clock className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>

      {/* Tier filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedTier("all")}
          className={cn("text-xs px-2 py-1 rounded border transition-colors", selectedTier === "all" ? "bg-muted border-muted-foreground text-foreground" : "border-border text-muted-foreground hover:border-border")}
        >
          All
        </button>
        {TIER_ORDER.map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={cn("text-xs px-2 py-1 rounded border transition-colors", selectedTier === tier ? TIER_BG[tier] + " " + TIER_COLOR[tier] : "border-border text-muted-foreground hover:border-border")}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-1">
        {filtered.map((player) => (
          <div
            key={player.rank}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-colors",
              player.isUser ? "bg-primary/10 border-border" : "bg-card/50 border-border/50"
            )}
          >
            <div className="w-7 text-center">
              {player.rank === 1 ? (
                <Crown className="h-4 w-4 text-yellow-400 mx-auto" />
              ) : player.rank === 2 ? (
                <Medal className="h-4 w-4 text-muted-foreground mx-auto" />
              ) : player.rank === 3 ? (
                <Medal className="h-4 w-4 text-amber-700 mx-auto" />
              ) : (
                <span className="text-xs text-muted-foreground">#{player.rank}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={cn("text-sm font-semibold", player.isUser ? "text-primary" : "text-foreground")}>
                  {player.username}
                </span>
                <span className={cn("text-xs font-medium", TIER_COLOR[player.tier])}>
                  {player.tier}
                </span>
              </div>
            </div>
            <Sparkline
              data={player.trend}
              color={player.trend[player.trend.length - 1] > player.trend[0] ? "#22c55e" : "#ef4444"}
            />
            <div className="text-sm font-bold text-yellow-400 tabular-nums w-16 text-right">
              {player.weeklyScore.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Prize structure */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2">Weekly Prizes</div>
        <div className="grid grid-cols-5 gap-2">
          {prizes.map((p) => (
            <div key={p.rank} className="bg-muted/50 border border-border/40 rounded-lg p-2 text-center">
              <div className="text-xs font-bold text-muted-foreground">{p.rank}</div>
              <div className="text-sm font-bold text-primary">+{p.xp}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Speed Round ────────────────────────────────────────────────────────

function SpeedRoundTab() {
  const SPEED_TIMER = 15;
  const SPEED_QUESTIONS = 20;
  const MAX_LIVES = 3;

  const [mode, setMode] = useState<"normal" | "survival">("normal");
  const [state, setState] = useState<SpeedRoundState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(SPEED_TIMER);
  const [multiplier, setMultiplier] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [totalPoints, setTotalPoints] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const MULTIPLIER_STEPS = [1, 1, 2, 3, 5];

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const endRound = useCallback((finalPoints: number) => {
    clearTimer();
    setState("done");
    setPersonalBest((pb) => Math.max(pb, finalPoints));
  }, [clearTimer]);

  const advanceQuestion = useCallback((currIdx: number, pts: number, currLives: number) => {
    if (currIdx + 1 >= SPEED_QUESTIONS || (mode === "survival" && currLives <= 0)) {
      endRound(pts);
      return;
    }
    setCurrent(currIdx + 1);
    setTimeLeft(SPEED_TIMER);
  }, [endRound, mode]);

  const handleSpeedAnswer = useCallback((idx: number, autoFail?: boolean) => {
    clearTimer();
    const q = questions[current];
    if (!q) return;
    const correct = !autoFail && idx === q.correctIndex;
    const newConsec = correct ? consecutiveCorrect + 1 : 0;
    const newMultiplier = MULTIPLIER_STEPS[Math.min(newConsec, MULTIPLIER_STEPS.length - 1)];
    const pts = correct ? 10 * newMultiplier : 0;
    const newTotal = totalPoints + pts;
    const newLives = (!correct && mode === "survival") ? lives - 1 : lives;

    setConsecutiveCorrect(newConsec);
    setMultiplier(newMultiplier);
    setTotalPoints(newTotal);
    setLives(newLives);
    setAnswers((prev) => [...prev, { questionId: q.id, selectedIndex: idx, correct, timeUsed: SPEED_TIMER - timeLeft, points: pts }]);

    if (mode === "survival" && newLives <= 0) {
      endRound(newTotal);
      return;
    }

    setTimeout(() => advanceQuestion(current, newTotal, newLives), 600);
  }, [current, questions, consecutiveCorrect, totalPoints, lives, mode, timeLeft, clearTimer, advanceQuestion]);

  useEffect(() => {
    if (state !== "playing") return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          handleSpeedAnswer(-1, true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  }, [state, current]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimer(), [clearTimer]);

  const startRound = useCallback(() => {
    const rng = mulberry32(Date.now() & 0xffffffff);
    const qs = shuffle(QUESTION_BANK, rng).slice(0, SPEED_QUESTIONS);
    setQuestions(qs);
    setCurrent(0);
    setAnswers([]);
    setTimeLeft(SPEED_TIMER);
    setMultiplier(1);
    setConsecutiveCorrect(0);
    setLives(MAX_LIVES);
    setTotalPoints(0);
    setState("playing");
  }, []);

  if (state === "idle") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-center">
          <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-foreground">Speed Round</h2>
          <p className="text-muted-foreground text-sm mt-1">20 questions · 15 seconds each · No pauses</p>
          {personalBest > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 text-yellow-400 text-sm">
              <Star className="h-3.5 w-3.5" />
              Personal Best: {personalBest} pts
            </div>
          )}
        </div>
        <div className="flex gap-3">
          {(["normal", "survival"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                mode === m ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400" : "border-border text-muted-foreground hover:border-border"
              )}
            >
              {m === "normal" ? "Normal" : "Survival (3 lives)"}
            </button>
          ))}
        </div>
        <Card className="bg-muted/50 border-border/40 p-4 w-full max-w-sm">
          <div className="text-xs text-muted-foreground font-semibold uppercase mb-2">Multiplier Ladder</div>
          <div className="flex gap-2">
            {[1, 2, 3, 5].map((m) => (
              <div key={m} className="flex-1 text-center p-2 rounded bg-muted/50 border border-border/40">
                <div className="text-sm font-bold text-yellow-400">{m}×</div>
                <div className="text-xs text-muted-foreground">{m === 1 ? "Start" : m === 2 ? "2-in-a-row" : m === 3 ? "4-in-a-row" : "8+"}</div>
              </div>
            ))}
          </div>
        </Card>
        <Button onClick={startRound} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8">
          <Zap className="h-4 w-4 mr-2" />
          Start Speed Round
        </Button>
      </div>
    );
  }

  if (state === "done") {
    const correct = answers.filter((a) => a.correct).length;
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <div className="text-2xl font-bold text-yellow-400 mb-1">{totalPoints}</div>
          <div className="text-muted-foreground text-sm">Points Scored</div>
          {totalPoints >= personalBest && personalBest > 0 && (
            <div className="mt-2 text-xs text-yellow-400 flex items-center justify-center gap-1">
              <Star className="h-3 w-3" /> New Personal Best!
            </div>
          )}
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{correct}/{answers.length}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">{Math.max(...answers.map((_, i) => {
                let streak = 0;
                for (let j = i; j < answers.length && answers[j].correct; j++) streak++;
                return streak;
              }))}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
            {mode === "survival" && (
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{MAX_LIVES - lives}</div>
                <div className="text-xs text-muted-foreground">Lives Lost</div>
              </div>
            )}
          </div>
        </div>

        {/* Post-round replay */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">Question Replay</div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {answers.map((ans, i) => {
              const q = questions[i];
              return (
                <div key={i} className={cn("p-2.5 rounded-lg border", ans.correct ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20")}>
                  <div className="flex items-start gap-2">
                    {ans.correct ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground line-clamp-1">{q?.question}</p>
                      {!ans.correct && q && (
                        <p className="text-xs text-green-400 mt-0.5">
                          Correct: {q.options[q.correctIndex]}
                        </p>
                      )}
                    </div>
                    <span className={cn("text-xs font-bold flex-shrink-0", ans.correct ? "text-green-400" : "text-red-400")}>
                      {ans.correct ? `+${ans.points}` : "0"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Button onClick={startRound} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
          <Zap className="h-4 w-4 mr-2" />
          Play Again
        </Button>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="space-y-4">
      {/* Speed HUD */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            {current + 1}/{SPEED_QUESTIONS}
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
            multiplier === 1 ? "bg-muted text-muted-foreground" :
            multiplier === 2 ? "bg-primary/20 text-primary" :
            multiplier === 3 ? "bg-primary/20 text-primary" :
            "bg-yellow-500/20 text-yellow-400"
          )}>
            <Zap className="h-3 w-3" />
            {multiplier}× Multiplier
          </div>
          {mode === "survival" && (
            <div className="flex gap-0.5">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span key={i} className={cn("text-base", i < lives ? "text-red-500" : "text-muted-foreground/50")}>
                  ♥
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-yellow-400 font-bold">{totalPoints} pts</span>
          <CountdownRing timeLeft={timeLeft} total={SPEED_TIMER} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-card/70 border-border/50 p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-xs border rounded px-1.5 py-0.5", CATEGORY_COLORS[q.category])}>
                {q.category}
              </span>
            </div>
            <p className="text-sm text-foreground font-medium">{q.question}</p>
          </Card>

          <div className="grid gap-2">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSpeedAnswer(idx)}
                className="w-full text-left p-3 rounded-lg border border-border/50 bg-card/60 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all text-sm text-foreground flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded bg-muted border border-border text-xs flex items-center justify-center font-bold text-muted-foreground flex-shrink-0">
                  {["A", "B", "C", "D"][idx]}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Tab 4: Boss Challenges ────────────────────────────────────────────────────

function BossChallengesTab() {
  const [defeatedBosses, setDefeatedBosses] = useState<Set<number>>(new Set());
  const [activeBoss, setActiveBoss] = useState<BossChallenge | null>(null);
  const [bossPhase, setBossPhase] = useState<"idle" | "playing" | "answered" | "done">("idle");
  const [bossQuestions, setBossQuestions] = useState<Question[]>([]);
  const [bossCurrent, setBossCurrent] = useState(0);
  const [bossAnswers, setBossAnswers] = useState<PlayerAnswer[]>([]);
  const [bossSelected, setBossSelected] = useState<number | null>(null);
  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(100);
  const [bossTimeLeft, setBossTimeLeft] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const bossList: BossChallenge[] = BOSSES.map((b, i) => ({
    ...b,
    unlocked: i === 0 || defeatedBosses.has(i),
  }));

  const handleBossAnswer = useCallback((idx: number) => {
    clearTimer();
    if (!activeBoss) return;
    const q = bossQuestions[bossCurrent];
    if (!q) return;
    const correct = idx === q.correctIndex;
    const damage = correct ? 0 : 15;
    const bossDamage = correct ? 12 : 0;
    const newPlayerHP = Math.max(0, playerHP - damage);
    const newBossHP = Math.max(0, bossHP - bossDamage);

    setBossSelected(idx);
    setPlayerHP(newPlayerHP);
    setBossHP(newBossHP);
    setBossAnswers((prev) => [...prev, { questionId: q.id, selectedIndex: idx, correct, timeUsed: 30 - bossTimeLeft, points: correct ? 10 : 0 }]);
    setBossPhase("answered");
  }, [activeBoss, bossQuestions, bossCurrent, playerHP, bossHP, bossTimeLeft, clearTimer]);

  const handleBossNext = useCallback(() => {
    if (!activeBoss) return;
    const nextIdx = bossCurrent + 1;
    if (nextIdx >= bossQuestions.length || playerHP <= 0) {
      setBossPhase("done");
      return;
    }
    setBossCurrent(nextIdx);
    setBossSelected(null);
    setBossTimeLeft(30);
    setBossPhase("playing");
  }, [activeBoss, bossCurrent, bossQuestions.length, playerHP]);

  useEffect(() => {
    if (bossPhase !== "playing") return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setBossTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          handleBossAnswer(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  }, [bossPhase, bossCurrent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimer(), [clearTimer]);

  const startBoss = useCallback((boss: BossChallenge) => {
    const rng = mulberry32(boss.id * 9999);
    const qs = shuffle(QUESTION_BANK, rng).slice(0, 10);
    setActiveBoss(boss);
    setBossQuestions(qs);
    setBossCurrent(0);
    setBossAnswers([]);
    setBossSelected(null);
    setPlayerHP(100);
    setBossHP(100);
    setBossTimeLeft(30);
    setBossPhase("playing");
  }, []);

  if (activeBoss && bossPhase !== "idle") {
    const correctCount = bossAnswers.filter((a) => a.correct).length;
    const won = bossPhase === "done" && correctCount >= activeBoss.winThreshold && playerHP > 0;

    if (bossPhase === "done") {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="text-center py-6">
            {won ? (
              <>
                <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-yellow-400">Victory!</h3>
                <p className="text-muted-foreground text-sm mt-1">{activeBoss.name} defeated!</p>
                <div className="mt-3 inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-1.5">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-medium">{activeBoss.badge} Badge Earned</span>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-red-400">Defeated!</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {playerHP <= 0 ? "Your HP reached zero." : `Need ${activeBoss.winThreshold}/10 correct — you got ${correctCount}.`}
                </p>
              </>
            )}
            <div className="flex justify-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{correctCount}/10</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{playerHP}</div>
                <div className="text-xs text-muted-foreground">HP Remaining</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {won && (
              <Button
                onClick={() => {
                  setDefeatedBosses((s) => new Set([...s, activeBoss.id]));
                  setBossPhase("idle");
                  setActiveBoss(null);
                }}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
              >
                <ChevronRight className="h-4 w-4 mr-1" />
                Next Boss
              </Button>
            )}
            <Button
              onClick={() => startBoss(activeBoss)}
              variant="outline"
              className="flex-1 border-border text-muted-foreground"
            >
              Try Again
            </Button>
            <Button
              onClick={() => { setBossPhase("idle"); setActiveBoss(null); }}
              variant="outline"
              className="border-border text-muted-foreground"
            >
              Exit
            </Button>
          </div>
        </motion.div>
      );
    }

    const q = bossQuestions[bossCurrent];
    const lastAns = bossAnswers[bossAnswers.length - 1];

    return (
      <div className="space-y-3">
        {/* Boss HP bars */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">You</span>
              <span className={cn("font-bold", playerHP > 50 ? "text-green-400" : playerHP > 25 ? "text-yellow-400" : "text-red-400")}>
                {playerHP} HP
              </span>
            </div>
            <Progress value={playerHP} className="h-2 bg-muted" />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{activeBoss.name}</span>
              <span className="text-red-400 font-bold">{bossHP} HP</span>
            </div>
            <Progress value={bossHP} className="h-2 bg-muted" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {q && (
            <QuestionCard
              key={q.id}
              question={q}
              onAnswer={handleBossAnswer}
              selectedIndex={bossSelected}
              answered={bossPhase === "answered"}
              timeLeft={bossTimeLeft}
              totalTime={30}
              currentIdx={bossCurrent}
              totalQuestions={bossQuestions.length}
              streak={0}
            />
          )}
        </AnimatePresence>

        {bossPhase === "answered" && lastAns && q && (
          <ExplanationPanel
            question={q}
            wasCorrect={lastAns.correct}
            points={lastAns.points}
            onNext={handleBossNext}
            isLast={bossCurrent + 1 >= bossQuestions.length}
          />
        )}
      </div>
    );
  }

  // Boss selection grid
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground leading-relaxed">
        Defeat bosses in order. Answer 8/10 correctly to win. Wrong answers deal damage — reach 0 HP and you lose.
      </div>
      {bossList.map((boss, i) => (
        <motion.div
          key={boss.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <Card className={cn(
            "border p-4",
            boss.unlocked
              ? defeatedBosses.has(boss.id)
                ? "bg-green-500/10 border-green-500/30"
                : "bg-card/70 border-border/50 hover:border-border/70 cursor-pointer"
              : "bg-card/30 border-border/40 opacity-50"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                defeatedBosses.has(boss.id) ? "bg-green-500/20" : boss.unlocked ? "bg-red-500/20" : "bg-muted"
              )}>
                {defeatedBosses.has(boss.id) ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : boss.unlocked ? (
                  <Swords className="h-5 w-5 text-red-400" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{boss.name}</span>
                  <span className="text-xs text-muted-foreground">{boss.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{boss.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{boss.category}</span>
                  <span className="text-xs text-yellow-400">
                    {defeatedBosses.has(boss.id) ? `Badge: ${boss.badge}` : `Win reward: ${boss.badge}`}
                  </span>
                </div>
              </div>
              <div>
                {boss.unlocked && !defeatedBosses.has(boss.id) && (
                  <Button
                    size="sm"
                    onClick={() => startBoss(boss)}
                    className="bg-red-600 hover:bg-red-500 text-foreground text-xs"
                  >
                    Fight
                  </Button>
                )}
                {defeatedBosses.has(boss.id) && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    Defeated
                  </Badge>
                )}
                {!boss.unlocked && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ── Tab 5: Question Builder ───────────────────────────────────────────────────

function QuestionBuilderTab() {
  const [formData, setFormData] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctIndex: 0,
    explanation: "",
    category: "Fundamentals" as Category,
    difficulty: 2 as Difficulty,
  });
  const [preview, setPreview] = useState(false);
  const [shareCode] = useState(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const rng = mulberry32(Date.now() & 0xffffffff);
    return Array.from({ length: 6 }, () => chars[Math.floor(rng() * chars.length)]).join("");
  });
  const [copied, setCopied] = useState(false);
  const [votes, setVotes] = useState<Record<string, "up" | "down" | null>>({});

  const communityQs = useMemo(() => buildCommunityQuestions(20260327), []);

  const handleVote = (id: string, dir: "up" | "down") => {
    setVotes((prev) => ({ ...prev, [id]: prev[id] === dir ? null : dir }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories: Category[] = [
    "Fundamentals", "Technical Analysis", "Options", "Macro",
    "Crypto", "Risk Management", "Behavioral Finance", "Derivatives",
  ];

  const previewQuestion: Question = {
    id: "preview",
    category: formData.category,
    type: "mc",
    difficulty: formData.difficulty,
    question: formData.question || "Your question will appear here...",
    options: [formData.optionA || "Option A", formData.optionB || "Option B", formData.optionC || "Option C", formData.optionD || "Option D"],
    correctIndex: formData.correctIndex,
    explanation: formData.explanation || "Your explanation will appear here...",
  };

  return (
    <div className="space-y-5">
      {/* Builder form */}
      <Card className="bg-card/70 border-border/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Create a Question
          </div>
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-muted-foreground"
          >
            <Eye className="h-3.5 w-3.5" />
            {preview ? "Hide" : "Preview"}
          </button>
        </div>

        <textarea
          value={formData.question}
          onChange={(e) => setFormData((f) => ({ ...f, question: e.target.value }))}
          placeholder="Enter your question..."
          rows={2}
          className="w-full bg-muted/60 border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
        />

        <div className="grid grid-cols-2 gap-2">
          {(["optionA", "optionB", "optionC", "optionD"] as const).map((key, idx) => (
            <div key={key} className="relative">
              <span className="absolute left-2.5 top-2.5 text-xs font-bold text-muted-foreground">
                {["A", "B", "C", "D"][idx]}
              </span>
              <input
                value={formData[key]}
                onChange={(e) => setFormData((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={`Option ${["A", "B", "C", "D"][idx]}`}
                className={cn(
                  "w-full pl-7 pr-2 py-2 bg-muted/60 border rounded-lg text-xs text-foreground placeholder-muted-foreground focus:outline-none",
                  formData.correctIndex === idx ? "border-green-500/50" : "border-border/60 focus:border-primary/40"
                )}
              />
              <button
                onClick={() => setFormData((f) => ({ ...f, correctIndex: idx }))}
                className={cn("absolute right-2 top-2.5 w-4 h-4 rounded-full border flex items-center justify-center",
                  formData.correctIndex === idx ? "bg-green-500 border-green-500" : "border-border"
                )}
              >
                {formData.correctIndex === idx && <CheckCircle2 className="h-2.5 w-2.5 text-foreground" />}
              </button>
            </div>
          ))}
        </div>

        <textarea
          value={formData.explanation}
          onChange={(e) => setFormData((f) => ({ ...f, explanation: e.target.value }))}
          placeholder="Explanation (shown after answering)..."
          rows={2}
          className="w-full bg-muted/60 border border-border/60 rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
        />

        <div className="flex gap-2 flex-wrap">
          <select
            value={formData.category}
            onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value as Category }))}
            className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-muted-foreground focus:outline-none"
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData((f) => ({ ...f, difficulty: Number(e.target.value) as Difficulty }))}
            className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-muted-foreground focus:outline-none"
          >
            <option value={1}>Easy</option>
            <option value={2}>Medium</option>
            <option value={3}>Hard</option>
          </select>
        </div>

        {/* Share code */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/40">
          <div>
            <div className="text-xs text-muted-foreground">Share Code</div>
            <div className="text-lg font-mono font-bold text-primary tracking-widest">{shareCode}</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="ml-auto border-border text-muted-foreground text-xs"
          >
            <Share2 className="h-3 w-3 mr-1" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </Card>

      {/* Preview */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-card/50 border-border/40 p-4">
              <div className="text-xs text-muted-foreground font-semibold uppercase mb-3">Preview</div>
              <QuestionCard
                question={previewQuestion}
                onAnswer={() => {}}
                selectedIndex={null}
                answered={false}
                timeLeft={30}
                totalTime={30}
                currentIdx={0}
                totalQuestions={1}
                streak={0}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Community questions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Top Community Questions</span>
        </div>
        <div className="space-y-3">
          {communityQs.map((cq) => (
            <Card key={cq.id} className="bg-card/60 border-border/40 p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs border rounded px-1.5 py-0.5", CATEGORY_COLORS[cq.category])}>
                      {cq.category}
                    </span>
                    <span className={cn("text-xs font-medium", DIFFICULTY_COLOR[cq.difficulty])}>
                      {DIFFICULTY_LABEL[cq.difficulty]}
                    </span>
                    <span className="text-xs text-muted-foreground">by {cq.author}</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{cq.question}</p>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleVote(cq.id, "up")}
                    className={cn("p-1 rounded transition-colors", votes[cq.id] === "up" ? "text-green-400" : "text-muted-foreground hover:text-muted-foreground")}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-bold text-muted-foreground">
                    {cq.votes + (votes[cq.id] === "up" ? 1 : votes[cq.id] === "down" ? -1 : 0)}
                  </span>
                  <button
                    onClick={() => handleVote(cq.id, "down")}
                    className={cn("p-1 rounded transition-colors", votes[cq.id] === "down" ? "text-red-400" : "text-muted-foreground hover:text-muted-foreground")}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "daily",    label: "Daily",   icon: <Brain className="h-3.5 w-3.5" /> },
  { id: "league",   label: "League",  icon: <Trophy className="h-3.5 w-3.5" /> },
  { id: "speed",    label: "Speed",   icon: <Zap className="h-3.5 w-3.5" /> },
  { id: "bosses",   label: "Bosses",  icon: <Swords className="h-3.5 w-3.5" /> },
  { id: "builder",  label: "Builder", icon: <Plus className="h-3.5 w-3.5" /> },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function QuizTournamentPage() {
  const [activeTab, setActiveTab] = useState<TabId>("daily");

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
            <Trophy className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Quiz Tournament</h1>
            <p className="text-xs text-muted-foreground">Test your financial knowledge across 8 categories</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Season Active</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Streak", value: "3d", icon: <Flame className="h-3.5 w-3.5 text-orange-400" />, color: "text-orange-400" },
            { label: "Rank", value: "#8", icon: <Target className="h-3.5 w-3.5 text-primary" />, color: "text-primary" },
            { label: "Accuracy", value: "72%", icon: <TrendingUp className="h-3.5 w-3.5 text-green-400" />, color: "text-green-400" },
            { label: "Badges", value: "4", icon: <Star className="h-3.5 w-3.5 text-yellow-400" />, color: "text-yellow-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card/60 border-border/50 p-3 text-center">
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <div className={cn("text-base font-bold", stat.color)}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
          <TabsList className="w-full bg-card/80 border border-border/60 p-1 h-auto flex">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="daily" className="mt-4 data-[state=inactive]:hidden">
            <Card className="bg-card/40 border-border/40 p-4">
              <DailyChallengeTab />
            </Card>
          </TabsContent>

          <TabsContent value="league" className="mt-4 data-[state=inactive]:hidden">
            <Card className="bg-card/40 border-border/40 p-4">
              <WeeklyLeagueTab />
            </Card>
          </TabsContent>

          <TabsContent value="speed" className="mt-4 data-[state=inactive]:hidden">
            <Card className="bg-card/40 border-border/40 p-4">
              <SpeedRoundTab />
            </Card>
          </TabsContent>

          <TabsContent value="bosses" className="mt-4 data-[state=inactive]:hidden">
            <Card className="bg-card/40 border-border/40 p-4">
              <BossChallengesTab />
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="mt-4 data-[state=inactive]:hidden">
            <QuestionBuilderTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
