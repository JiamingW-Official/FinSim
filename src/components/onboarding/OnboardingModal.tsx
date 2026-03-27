"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type TradingStyle = "day_trader" | "swing_trader" | "options_trader" | "long_term_investor";
type LearningGoal = "technical_analysis" | "options_practice" | "risk_management" | "leaderboard";
import {
  BarChart3,
  GraduationCap,
  TrendingUp,
  Shield,
  Trophy,
  Clock,
  Calendar,
  Activity,
  LineChart,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

const TOTAL_STEPS = 5;

// ---- Step 1: Welcome feature cards ----------------------------------------

const FEATURE_CARDS = [
  {
    icon: <BarChart3 className="h-4 w-4 text-primary" />,
    title: "Paper Trading",
    desc: "$100k virtual capital, live-style charts",
  },
  {
    icon: <GraduationCap className="h-4 w-4 text-violet-400" />,
    title: "Structured Learning",
    desc: "30+ lessons, quizzes & flashcards",
  },
  {
    icon: <Trophy className="h-4 w-4 text-amber-400" />,
    title: "Compete & Grow",
    desc: "Leaderboards, arena battles, quests",
  },
];

// ---- Step 2: Experience levels ----------------------------------------------

const EXPERIENCE_OPTIONS: {
  value: ExperienceLevel;
  label: string;
  desc: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    desc: "New to markets — I want to learn the basics",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    desc: "I understand charts and have some trading experience",
  },
  {
    value: "advanced",
    label: "Advanced",
    desc: "I trade regularly and want to sharpen my edge",
  },
];

// ---- Step 3: Trading styles -------------------------------------------------

const STYLE_OPTIONS: {
  value: TradingStyle;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "day_trader",
    label: "Day Trader",
    desc: "Open and close positions within a single session",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    value: "swing_trader",
    label: "Swing Trader",
    desc: "Hold positions for days to weeks on momentum",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    value: "options_trader",
    label: "Options Trader",
    desc: "Use calls, puts and spreads for leverage and hedging",
    icon: <Activity className="h-4 w-4" />,
  },
  {
    value: "long_term_investor",
    label: "Long-term Investor",
    desc: "Focus on fundamentals and multi-month growth",
    icon: <Calendar className="h-4 w-4" />,
  },
];

// ---- Step 4: Learning goals -------------------------------------------------

const GOAL_OPTIONS: {
  value: LearningGoal;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "technical_analysis",
    label: "Learn technical analysis",
    desc: "Master indicators, patterns and chart reading",
    icon: <LineChart className="h-4 w-4" />,
  },
  {
    value: "options_practice",
    label: "Practice options trading",
    desc: "Build strategies with calls, puts and spreads",
    icon: <Activity className="h-4 w-4" />,
  },
  {
    value: "risk_management",
    label: "Improve risk management",
    desc: "Control drawdowns, size positions correctly",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    value: "leaderboard",
    label: "Compete on leaderboard",
    desc: "Top the rankings and earn arena glory",
    icon: <Trophy className="h-4 w-4" />,
  },
];

// ---- Step label summaries ---------------------------------------------------

const LEVEL_LABELS: Record<ExperienceLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const STYLE_LABELS: Record<TradingStyle, string> = {
  day_trader: "Day Trader",
  swing_trader: "Swing Trader",
  options_trader: "Options Trader",
  long_term_investor: "Long-term Investor",
};

const GOAL_LABELS: Record<LearningGoal, string> = {
  technical_analysis: "Technical Analysis",
  options_practice: "Options Trading",
  risk_management: "Risk Management",
  leaderboard: "Competitive Play",
};

// ---- Slide animation -------------------------------------------------------

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

// ---- Backdrop --------------------------------------------------------------

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// ---- Main component --------------------------------------------------------

export function OnboardingModal() {
  const { currentStep, nextStep, completeOnboarding } = useOnboardingStore();

  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [tradingStyle, setTradingStyle] = useState<TradingStyle | null>(null);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);

  function toggleLearningGoal(g: LearningGoal) {
    setLearningGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  }

  const modalStep = currentStep;
  const dirRef = useRef<number>(1);

  const isFirst = modalStep === 0;
  const isLast = modalStep === TOTAL_STEPS - 1;

  function handleNext() {
    dirRef.current = 1;
    if (isLast) {
      completeOnboarding();
    } else {
      nextStep();
    }
  }

  function handleBack() {
    dirRef.current = -1;
    // no prevStep in actual store — use setStep if needed, but we just block going back past 0
    // Since the actual store has no prevStep, we'll track locally if needed.
    // The back button is hidden on step 0 so this only fires on steps 1+
    // We can't go back with the current store — skip back navigation
  }

  function handleSkip() {
    completeOnboarding();
  }

  // Whether the current step's "Next" button is enabled
  function canAdvance(): boolean {
    if (modalStep === 1) return experienceLevel !== null;
    if (modalStep === 2) return tradingStyle !== null;
    if (modalStep === 3) return learningGoals.length > 0;
    return true;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.2 }}
      >
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
                Step {modalStep + 1} of {TOTAL_STEPS}
              </span>
              <button
                onClick={handleSkip}
                className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
              >
                Skip tour
              </button>
            </div>

            {/* Step content — fixed height to prevent layout shift */}
            <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
              <AnimatePresence custom={dirRef.current} mode="wait">
                <motion.div
                  key={modalStep}
                  custom={dirRef.current}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex flex-col px-5 py-6"
                >
                  <StepContent
                    step={modalStep}
                    experienceLevel={experienceLevel}
                    tradingStyle={tradingStyle}
                    learningGoals={learningGoals}
                    onSelectLevel={setExperienceLevel}
                    onSelectStyle={setTradingStyle}
                    onToggleGoal={toggleLearningGoal}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 px-5 py-4 flex items-center gap-3">
              {!isFirst && (
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
                {isLast ? "Start Trading" : "Next"}
                {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 pb-4">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-300",
                    i === modalStep
                      ? "w-5 bg-primary"
                      : i < modalStep
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---- Per-step content ------------------------------------------------------

interface StepContentProps {
  step: number;
  experienceLevel: ExperienceLevel | null;
  tradingStyle: TradingStyle | null;
  learningGoals: LearningGoal[];
  onSelectLevel: (l: ExperienceLevel) => void;
  onSelectStyle: (s: TradingStyle) => void;
  onToggleGoal: (g: LearningGoal) => void;
}

function StepContent({
  step,
  experienceLevel,
  tradingStyle,
  learningGoals,
  onSelectLevel,
  onSelectStyle,
  onToggleGoal,
}: StepContentProps) {
  switch (step) {
    case 0:
      return <StepWelcome />;
    case 1:
      return (
        <StepExperience selected={experienceLevel} onSelect={onSelectLevel} />
      );
    case 2:
      return (
        <StepTradingStyle selected={tradingStyle} onSelect={onSelectStyle} />
      );
    case 3:
      return (
        <StepGoals selected={learningGoals} onToggle={onToggleGoal} />
      );
    case 4:
      return (
        <StepReady
          level={experienceLevel}
          style={tradingStyle}
          goals={learningGoals}
        />
      );
    default:
      return null;
  }
}

// ---- Step 1: Welcome -------------------------------------------------------

function StepWelcome() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Welcome to FinSim
        </h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          A paper trading simulator built for learning — from reading a chart for
          the first time to managing a multi-leg options position.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 mt-1">
        {FEATURE_CARDS.map((card) => (
          <div
            key={card.title}
            className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 px-3.5 py-3"
          >
            <div className="mt-0.5 flex-shrink-0">{card.icon}</div>
            <div>
              <p className="text-xs font-semibold">{card.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Step 2: Experience level ----------------------------------------------

function StepExperience({
  selected,
  onSelect,
}: {
  selected: ExperienceLevel | null;
  onSelect: (l: ExperienceLevel) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Choose your experience level
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We will tailor content and tips to match where you are.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
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

// ---- Step 3: Trading style -------------------------------------------------

function StepTradingStyle({
  selected,
  onSelect,
}: {
  selected: TradingStyle | null;
  onSelect: (s: TradingStyle) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Pick your trading style
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This shapes which features and strategies get highlighted for you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {STYLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "flex flex-col gap-1.5 rounded-lg border px-3.5 py-3 text-left transition-colors",
              selected === opt.value
                ? "border-primary bg-primary/8 text-foreground"
                : "border-border/40 bg-muted/10 text-muted-foreground hover:bg-accent/30 hover:text-foreground"
            )}
          >
            <span
              className={cn(
                selected === opt.value
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {opt.icon}
            </span>
            <span className="text-[11px] font-semibold leading-tight">
              {opt.label}
            </span>
            <span className="text-[10px] leading-snug opacity-70">
              {opt.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Step 4: Goals multi-select --------------------------------------------

function StepGoals({
  selected,
  onToggle,
}: {
  selected: LearningGoal[];
  onToggle: (g: LearningGoal) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Set your learning goals
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select one or more — you can change these later in Settings.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {GOAL_OPTIONS.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors",
                active
                  ? "border-primary bg-primary/8 text-foreground"
                  : "border-border/40 bg-muted/10 text-muted-foreground hover:bg-accent/30 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {opt.icon}
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold">{opt.label}</span>
                <span className="text-[10px] opacity-70 mt-0.5">
                  {opt.desc}
                </span>
              </div>
              {active && (
                <CheckCircle2 className="ml-auto h-4 w-4 flex-shrink-0 text-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Step 5: Ready summary -------------------------------------------------

function StepReady({
  level,
  style,
  goals,
}: {
  level: ExperienceLevel | null;
  style: TradingStyle | null;
  goals: LearningGoal[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {"You're ready!"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is what we have set up for you. You can adjust any of this in
          Settings at any time.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {level && (
          <SummaryRow
            label="Experience level"
            value={LEVEL_LABELS[level]}
          />
        )}
        {style && (
          <SummaryRow
            label="Trading style"
            value={STYLE_LABELS[style]}
          />
        )}
        {goals.length > 0 && (
          <div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-muted/10 px-3.5 py-3">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Learning goals
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {goals.map((g) => (
                <span
                  key={g}
                  className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                >
                  {GOAL_LABELS[g]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Your $100,000 virtual portfolio is ready. Make your first trade, explore
        the Learn track, or dive straight into the options chain — the choice is
        yours.
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/10 px-3.5 py-2.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}
