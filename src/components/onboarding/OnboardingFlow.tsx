"use client";

import { useOnboardingStore } from "@/stores/onboarding-store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  GraduationCap,
  Brain,
  Trophy,
  Rocket,
} from "lucide-react";

const TOTAL_STEPS = 5;

function MiniCandlestickSVG() {
  return (
    <svg
      viewBox="0 0 120 60"
      className="mx-auto mt-4 h-16 w-32 text-emerald-500"
      aria-hidden
    >
      {/* Wicks */}
      <line x1="15" y1="8" x2="15" y2="52" stroke="currentColor" strokeWidth="1.5" />
      <line x1="35" y1="15" x2="35" y2="50" stroke="#ef4444" strokeWidth="1.5" />
      <line x1="55" y1="5" x2="55" y2="45" stroke="currentColor" strokeWidth="1.5" />
      <line x1="75" y1="12" x2="75" y2="48" stroke="currentColor" strokeWidth="1.5" />
      <line x1="95" y1="3" x2="95" y2="40" stroke="currentColor" strokeWidth="1.5" />
      {/* Bodies */}
      <rect x="10" y="18" width="10" height="20" rx="1" fill="currentColor" />
      <rect x="30" y="22" width="10" height="18" rx="1" fill="#ef4444" />
      <rect x="50" y="12" width="10" height="22" rx="1" fill="currentColor" />
      <rect x="70" y="18" width="10" height="16" rx="1" fill="currentColor" />
      <rect x="90" y="10" width="10" height="18" rx="1" fill="currentColor" />
    </svg>
  );
}

interface StepConfig {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  extra?: React.ReactNode;
}

const steps: StepConfig[] = [
  {
    icon: <Rocket className="h-6 w-6 text-primary" />,
    iconBg: "bg-primary/10",
    title: "Welcome to FinSim",
    description:
      "Learn to trade with $100,000 in virtual capital, AI coaching, and interactive education.",
    extra: null,
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-blue-400" />,
    iconBg: "bg-blue-500/10",
    title: "Trade Real Stocks",
    description:
      "Practice with real historical data. 10 tickers, candlestick charts, and 15 technical indicators.",
    extra: <MiniCandlestickSVG />,
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-violet-400" />,
    iconBg: "bg-violet-500/10",
    title: "Interactive Learning",
    description:
      "650+ bite-sized lessons with quizzes, flashcards, and practice simulators for hands-on skill building.",
  },
  {
    icon: <Brain className="h-6 w-6 text-amber-400" />,
    iconBg: "bg-amber-500/10",
    title: "AI Trading Coach",
    description:
      "Algorithmic market analysis, trade plans, and pattern detection from AlphaBot.",
  },
  {
    icon: <Trophy className="h-6 w-6 text-rose-400" />,
    iconBg: "bg-rose-500/10",
    title: "Track Your Progress",
    description:
      "XP, achievements, streaks, arena battles, and leaderboards.",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export function OnboardingFlow() {
  const { currentStep, nextStep, setStep, completeOnboarding } =
    useOnboardingStore();

  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const isFirstStep = currentStep === 0;
  const step = steps[currentStep];
  // direction ref for AnimatePresence
  const direction = 1; // always forward in normal flow

  function handleNext() {
    if (isLastStep) {
      completeOnboarding();
    } else {
      nextStep();
    }
  }

  function handleSkip() {
    completeOnboarding();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col items-center px-4">
        <div className="relative w-full overflow-hidden rounded-2xl border bg-card p-8 shadow-xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon circle */}
              <div
                className={cn(
                  "mb-5 flex h-16 w-16 items-center justify-center rounded-full shadow-lg",
                  step.iconBg
                )}
              >
                {step.icon}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold tracking-tight">
                {step.title}
              </h2>

              {/* Subtitle / extra content (e.g. "Your Trading Flight Simulator") */}
              {isFirstStep && step.extra}

              {/* Description */}
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>

              {/* Extra content for non-welcome steps */}
              {!isFirstStep && step.extra}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={handleNext}
              className={cn(
                "w-full rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors",
                "bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              )}
            >
              {isFirstStep
                ? "Get Started"
                : isLastStep
                  ? "Let's Go!"
                  : "Next"}
            </button>

            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Skip
              </button>
            )}
          </div>

          {/* Progress dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === currentStep
                    ? "w-6 bg-emerald-500"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
