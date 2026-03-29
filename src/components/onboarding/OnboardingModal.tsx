"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useTradingPreferencesStore } from "@/stores/trading-preferences-store";
import type {
  TradingExperience,
  RiskTolerance,
} from "@/stores/trading-preferences-store";
import {
  Brain,
  TrendingUp,
  GraduationCap,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  BarChart2,
  Shield,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 6;

// Step 1 — feature highlights
const FEATURES = [
  {
    icon: <Brain className="h-4 w-4 text-primary" />,
    title: "AI Coach",
    desc: "AlphaBot analyses your trades and suggests setups in real time",
  },
  {
    icon: <BarChart2 className="h-4 w-4 text-blue-400" />,
    title: "Real Market Data",
    desc: "Historical candlestick data for 10 tickers across multiple timeframes",
  },
  {
    icon: <GraduationCap className="h-4 w-4 text-violet-400" />,
    title: "Gamified Learning",
    desc: "650+ bite-sized lessons, flashcards, quizzes, XP, achievements and leaderboards",
  },
] as const;

// Step 2 — experience levels
type ExperienceChoice = "complete_beginner" | "some_knowledge" | "intermediate" | "advanced";

const EXPERIENCE_OPTIONS: {
  value: ExperienceChoice;
  storeValue: TradingExperience;
  label: string;
  desc: string;
}[] = [
  {
    value: "complete_beginner",
    storeValue: "beginner",
    label: "Complete Beginner",
    desc: "Never bought a stock — I want to learn from scratch",
  },
  {
    value: "some_knowledge",
    storeValue: "beginner",
    label: "Some Knowledge",
    desc: "I know the basics but have not placed real trades",
  },
  {
    value: "intermediate",
    storeValue: "intermediate",
    label: "Intermediate",
    desc: "I read charts and have some live trading experience",
  },
  {
    value: "advanced",
    storeValue: "advanced",
    label: "Advanced",
    desc: "I trade regularly and want to refine my edge",
  },
];

// Step 3 — trading goals (multi-select chips)
type GoalKey =
  | "learn_to_trade"
  | "build_wealth"
  | "generate_income"
  | "understand_options"
  | "master_risk"
  | "trade_crypto";

const GOAL_OPTIONS: { value: GoalKey; label: string }[] = [
  { value: "learn_to_trade", label: "Learn to Trade" },
  { value: "build_wealth", label: "Build Wealth" },
  { value: "generate_income", label: "Generate Income" },
  { value: "understand_options", label: "Understand Options" },
  { value: "master_risk", label: "Master Risk" },
  { value: "trade_crypto", label: "Trade Crypto" },
];

// Step 4 — risk tolerance
const RISK_OPTIONS: {
  value: RiskTolerance;
  label: string;
  returnRange: string;
  volatility: string;
  instruments: string;
}[] = [
  {
    value: "conservative",
    label: "Conservative",
    returnRange: "5 – 10% / yr",
    volatility: "Low",
    instruments: "Blue-chip stocks, ETFs, bonds",
  },
  {
    value: "moderate",
    label: "Moderate",
    returnRange: "10 – 20% / yr",
    volatility: "Medium",
    instruments: "Growth stocks, diversified portfolios",
  },
  {
    value: "aggressive",
    label: "Aggressive",
    returnRange: "20%+ / yr",
    volatility: "High",
    instruments: "Options, leveraged positions, small-caps",
  },
];

// Step 5 — learning style
type LearningStyle = "watch" | "do" | "mix" | "jump";

const LEARNING_OPTIONS: {
  value: LearningStyle;
  label: string;
  desc: string;
}[] = [
  {
    value: "watch",
    label: "Watch & Learn",
    desc: "Step-by-step tutorials and guided walkthroughs",
  },
  {
    value: "do",
    label: "Do It Myself",
    desc: "Prefer exploring and figuring things out hands-on",
  },
  {
    value: "mix",
    label: "Mix of Both",
    desc: "Some guidance, then independent practice",
  },
  {
    value: "jump",
    label: "Jump Right In",
    desc: "No tutorials — drop me straight into the charts",
  },
];

// Labels for the summary step
const EXPERIENCE_LABELS: Record<ExperienceChoice, string> = {
  complete_beginner: "Complete Beginner",
  some_knowledge: "Some Knowledge",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const RISK_LABELS: Record<RiskTolerance, string> = {
  conservative: "Conservative",
  moderate: "Moderate",
  aggressive: "Aggressive",
};

// ---------------------------------------------------------------------------
// CSS-only confetti (Step 6)
// ---------------------------------------------------------------------------

const CONFETTI_COLORS = [
  "#3b82f6",
  "#0ea5e9",
  "#14b8a6",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
];

function ConfettiPiece({
  index,
  color,
}: {
  index: number;
  color: string;
}) {
  const left = `${5 + (index * 4.7) % 90}%`;
  const delay = `${(index * 0.13) % 1.2}s`;
  const duration = `${1.4 + (index * 0.11) % 0.8}s`;
  const width = index % 3 === 0 ? 8 : 6;
  const height = index % 3 === 0 ? 4 : 8;
  const rotate = `${(index * 37) % 360}deg`;

  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: "-10%",
        left,
        width,
        height,
        backgroundColor: color,
        borderRadius: 2,
        transform: `rotate(${rotate})`,
        animation: `confetti-fall ${duration} ${delay} linear forwards`,
      }}
    />
  );
}

const confettiKeyframes = `
@keyframes confetti-fall {
  0%   { transform: translateY(0)   rotate(0deg)   opacity: 1; }
  100% { transform: translateY(360px) rotate(720deg) opacity: 0; }
}
`;

// ---------------------------------------------------------------------------
// Slide animation variants
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 64 : -64,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -64 : 64,
    opacity: 0,
    transition: { duration: 0.18, ease: "easeIn" as const },
  }),
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function OnboardingModal() {
  const { currentStep, nextStep, setStep, completeOnboarding } =
    useOnboardingStore();
  const { setTradingExperience, setRiskTolerance } =
    useTradingPreferencesStore();

  // Local state for wizard answers
  const [experience, setExperience] = useState<ExperienceChoice | null>(null);
  const [goals, setGoals] = useState<GoalKey[]>([]);
  const [riskTolerance, setLocalRiskTolerance] = useState<RiskTolerance | null>(
    null
  );
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(
    null
  );

  const dirRef = useRef<number>(1);

  const isFirst = currentStep === 0;
  const isLast = currentStep === TOTAL_STEPS - 1;

  function toggleGoal(g: GoalKey) {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  function canAdvance(): boolean {
    if (currentStep === 1) return experience !== null;
    if (currentStep === 2) return goals.length > 0;
    if (currentStep === 3) return riskTolerance !== null;
    if (currentStep === 4) return learningStyle !== null;
    return true;
  }

  function handleNext() {
    dirRef.current = 1;
    if (isLast) {
      // Persist preferences before closing
      if (experience) {
        const opt = EXPERIENCE_OPTIONS.find((o) => o.value === experience);
        if (opt) setTradingExperience(opt.storeValue);
      }
      if (riskTolerance) setRiskTolerance(riskTolerance);
      completeOnboarding();
    } else {
      nextStep();
    }
  }

  function handleBack() {
    dirRef.current = -1;
    setStep(Math.max(0, currentStep - 1));
  }

  function handleSkip() {
    completeOnboarding();
  }

  return (
    <>
      {/* Inject confetti keyframes once */}
      <style>{confettiKeyframes}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md mx-4"
        >
          <div className="rounded-lg border border-border/60 bg-card shadow-xl overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-3.5">
              <span className="text-xs font-medium text-muted-foreground">
                Step {currentStep + 1} of {TOTAL_STEPS}
              </span>
              {!isLast && (
                <button
                  onClick={handleSkip}
                  className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                >
                  Skip tour
                </button>
              )}
            </div>

            {/* Step content */}
            <div className="relative overflow-hidden" style={{ minHeight: 360 }}>
              <AnimatePresence custom={dirRef.current} mode="wait">
                <motion.div
                  key={currentStep}
                  custom={dirRef.current}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex flex-col px-5 py-6 overflow-y-auto"
                >
                  {currentStep === 0 && <StepWelcome />}
                  {currentStep === 1 && (
                    <StepExperience
                      selected={experience}
                      onSelect={setExperience}
                    />
                  )}
                  {currentStep === 2 && (
                    <StepGoals selected={goals} onToggle={toggleGoal} />
                  )}
                  {currentStep === 3 && (
                    <StepRiskTolerance
                      selected={riskTolerance}
                      onSelect={setLocalRiskTolerance}
                    />
                  )}
                  {currentStep === 4 && (
                    <StepLearningStyle
                      selected={learningStyle}
                      onSelect={setLearningStyle}
                    />
                  )}
                  {currentStep === 5 && (
                    <StepComplete
                      experience={experience}
                      goals={goals}
                      riskTolerance={riskTolerance}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 px-5 py-4 flex items-center gap-3">
              {!isFirst && !isLast && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={!canAdvance()}
                className={cn(
                  "ml-auto flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition-colors",
                  canAdvance()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {currentStep === 0
                  ? "Get Started"
                  : isLast
                    ? "Enter FinSim"
                    : "Next"}
                {currentStep === 0 && <ArrowRight className="h-3.5 w-3.5" />}
                {!isLast && currentStep !== 0 && (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 pb-4">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-300",
                    i === currentStep
                      ? "w-5 bg-primary"
                      : i < currentStep
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Welcome
// ---------------------------------------------------------------------------

function StepWelcome() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Welcome to FinSim
        </h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Learn to trade without risking real money. Practice with virtual
          capital, real data and an AI coach by your side.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 mt-1">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 px-3.5 py-3"
          >
            <div className="mt-0.5 flex-shrink-0">{f.icon}</div>
            <div>
              <p className="text-xs font-semibold">{f.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary/8 border border-primary/20 px-3.5 py-2.5">
        <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
        <p className="text-xs font-medium text-primary">
          You start with $100,000 in virtual capital — no real money involved.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Experience Level
// ---------------------------------------------------------------------------

function StepExperience({
  selected,
  onSelect,
}: {
  selected: ExperienceChoice | null;
  onSelect: (v: ExperienceChoice) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {"What's your trading experience?"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We will tailor content and tips to match where you are.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {EXPERIENCE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "flex flex-col items-start rounded-lg border px-4 py-3 text-left transition-colors",
              selected === opt.value
                ? "border-primary bg-primary/8 text-foreground"
                : "border-border/40 bg-muted/10 text-muted-foreground hover:bg-accent/30 hover:text-foreground"
            )}
          >
            <span className="text-xs font-semibold">{opt.label}</span>
            <span className="text-[11px] mt-0.5 leading-relaxed">
              {opt.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Trading Goals (multi-select chips)
// ---------------------------------------------------------------------------

function StepGoals({
  selected,
  onToggle,
}: {
  selected: GoalKey[];
  onToggle: (g: GoalKey) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          What do you want to achieve?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select all that apply — you can update these in Settings.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {GOAL_OPTIONS.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 bg-muted/10 text-muted-foreground hover:bg-accent/30 hover:text-foreground"
              )}
            >
              {active && <CheckCircle2 className="h-3 w-3 flex-shrink-0" />}
              {opt.label}
            </button>
          );
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          Select at least one goal to continue.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Risk Tolerance
// ---------------------------------------------------------------------------

function StepRiskTolerance({
  selected,
  onSelect,
}: {
  selected: RiskTolerance | null;
  onSelect: (v: RiskTolerance) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          How do you handle risk?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This shapes default position sizing and strategy recommendations.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {RISK_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "flex flex-col items-start rounded-lg border px-4 py-3 text-left transition-colors",
              selected === opt.value
                ? "border-primary bg-primary/8 text-foreground"
                : "border-border/40 bg-muted/10 text-muted-foreground hover:bg-accent/30 hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs font-semibold">{opt.label}</span>
              <span
                className={cn(
                  "ml-auto text-xs font-medium px-1.5 py-0.5 rounded",
                  opt.value === "conservative" &&
                    "bg-blue-500/10 text-blue-400",
                  opt.value === "moderate" &&
                    "bg-amber-500/10 text-amber-400",
                  opt.value === "aggressive" && "bg-rose-500/10 text-rose-400"
                )}
              >
                {opt.returnRange}
              </span>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5">
              <span className="text-xs">
                <span className="text-muted-foreground/60">Volatility: </span>
                {opt.volatility}
              </span>
              <span className="text-xs col-span-2">
                <span className="text-muted-foreground/60">Instruments: </span>
                {opt.instruments}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5 — Learning Style
// ---------------------------------------------------------------------------

function StepLearningStyle({
  selected,
  onSelect,
}: {
  selected: LearningStyle | null;
  onSelect: (v: LearningStyle) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          How do you learn best?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This affects how tutorials and hints are shown to you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {LEARNING_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "flex flex-col gap-1 rounded-lg border px-3.5 py-3 text-left transition-colors",
              selected === opt.value
                ? "border-primary bg-primary/8 text-foreground"
                : "border-border/40 bg-muted/10 text-muted-foreground hover:bg-accent/30 hover:text-foreground"
            )}
          >
            <span className="text-[11px] font-semibold">{opt.label}</span>
            <span className="text-xs leading-snug opacity-70">
              {opt.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 6 — Setup Complete
// ---------------------------------------------------------------------------

function StepComplete({
  experience,
  goals,
  riskTolerance,
}: {
  experience: ExperienceChoice | null;
  goals: GoalKey[];
  riskTolerance: RiskTolerance | null;
}) {
  const confettiPieces = Array.from({ length: 20 }, (_, i) => ({
    index: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));

  return (
    <div className="flex flex-col gap-5 relative">
      {/* Confetti overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
        style={{ height: 360 }}
      >
        {confettiPieces.map((p) => (
          <ConfettiPiece key={p.index} index={p.index} color={p.color} />
        ))}
      </div>

      {/* Heading */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">
            {"You're ready to trade!"}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your profile is set up. Here is a summary of your preferences.
        </p>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-2 relative z-10">
        {experience && (
          <SummaryRow
            label="Experience"
            value={EXPERIENCE_LABELS[experience]}
          />
        )}
        {riskTolerance && (
          <SummaryRow
            label="Risk profile"
            value={RISK_LABELS[riskTolerance]}
          />
        )}
        {goals.length > 0 && (
          <div className="rounded-lg border border-border/40 bg-muted/10 px-3.5 py-3">
            <span className="text-xs font-medium text-muted-foreground">
              Goals
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {goals.map((g) => {
                const opt = GOAL_OPTIONS.find((o) => o.value === g);
                return (
                  <span
                    key={g}
                    className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                  >
                    {opt?.label ?? g}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Portfolio */}
        <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/10 px-3.5 py-3">
          <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold">Starting portfolio</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              $100,000 virtual capital — ready to deploy
            </p>
          </div>
          <span className="ml-auto text-xs font-bold text-primary">
            $100,000
          </span>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/10 px-3.5 py-2.5">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}
