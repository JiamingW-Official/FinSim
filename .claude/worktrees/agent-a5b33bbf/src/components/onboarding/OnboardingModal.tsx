"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useOnboardingStore,
  type ExperienceLevel,
  type TradingStyle,
} from "@/stores/onboarding-store";
import {
  BarChart3,
  BookOpen,
  Brain,
  Check,
  ChevronLeft,
  Clock,
  Layers,
  LineChart,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const TOTAL_STEPS = 5;

const GOAL_OPTIONS = [
  "Learn technical analysis",
  "Practice risk management",
  "Understand options strategies",
  "Build a diversified portfolio",
  "Master chart patterns",
  "Prepare for real investing",
];

/* ------------------------------------------------------------------ */
/*  Step 0 — Welcome illustration                                       */
/* ------------------------------------------------------------------ */

function WelcomeIllustration() {
  return (
    <div className="flex items-center justify-center gap-6 py-6">
      {/* Feature 1 */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
          <BarChart3 className="h-5 w-5 text-blue-400" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground leading-tight">
          Live Charts
          <br />
          &amp; Data
        </span>
      </div>

      {/* Divider */}
      <div className="h-10 w-px bg-border/50" />

      {/* Feature 2 */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
          <BookOpen className="h-5 w-5 text-violet-400" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground leading-tight">
          Interactive
          <br />
          Lessons
        </span>
      </div>

      {/* Divider */}
      <div className="h-10 w-px bg-border/50" />

      {/* Feature 3 */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <Brain className="h-5 w-5 text-amber-400" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground leading-tight">
          AI Trade
          <br />
          Coach
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Experience level                                           */
/* ------------------------------------------------------------------ */

const EXPERIENCE_OPTIONS: {
  value: ExperienceLevel;
  label: string;
  sub: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    sub: "New to trading and markets",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    sub: "Familiar with charts and orders",
  },
  {
    value: "advanced",
    label: "Advanced",
    sub: "Options, technicals, risk models",
  },
];

/* ------------------------------------------------------------------ */
/*  Step 2 — Trading style                                              */
/* ------------------------------------------------------------------ */

const STYLE_OPTIONS: {
  value: TradingStyle;
  label: string;
  sub: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "day",
    label: "Day Trading",
    sub: "Open and close within a session",
    icon: <Zap className="h-4 w-4 text-yellow-400" />,
  },
  {
    value: "swing",
    label: "Swing Trading",
    sub: "Hold positions for days or weeks",
    icon: <LineChart className="h-4 w-4 text-blue-400" />,
  },
  {
    value: "options",
    label: "Options",
    sub: "Leverage contracts and spreads",
    icon: <Layers className="h-4 w-4 text-violet-400" />,
  },
  {
    value: "longterm",
    label: "Long-Term",
    sub: "Buy-and-hold investing approach",
    icon: <Clock className="h-4 w-4 text-green-400" />,
  },
];

/* ------------------------------------------------------------------ */
/*  Step content renderers                                              */
/* ------------------------------------------------------------------ */

function StepWelcome() {
  return (
    <>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
        <TrendingUp className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">Welcome to FinSim</h2>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        Practice trading with $100,000 in virtual capital. Real market mechanics,
        zero real-money risk.
      </p>
      <WelcomeIllustration />
    </>
  );
}

function StepExperience() {
  const experienceLevel = useOnboardingStore((s) => s.experienceLevel);
  const setExperienceLevel = useOnboardingStore((s) => s.setExperienceLevel);

  return (
    <>
      <h2 className="text-xl font-semibold tracking-tight">Your experience level</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We'll tailor your starting experience to fit where you are.
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {EXPERIENCE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setExperienceLevel(opt.value)}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150",
              experienceLevel === opt.value
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border/50 bg-muted/10 text-muted-foreground hover:border-border hover:bg-muted/20 hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                experienceLevel === opt.value
                  ? "border-primary bg-primary"
                  : "border-border/60"
              )}
            >
              {experienceLevel === opt.value && (
                <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
              )}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-medium leading-snug text-foreground">
                {opt.label}
              </span>
              <span className="text-xs text-muted-foreground">{opt.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function StepTradingStyle() {
  const tradingStyle = useOnboardingStore((s) => s.tradingStyle);
  const setTradingStyle = useOnboardingStore((s) => s.setTradingStyle);

  return (
    <>
      <h2 className="text-xl font-semibold tracking-tight">Trading style</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        What kind of trader do you want to be?
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {STYLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTradingStyle(opt.value)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border px-3 py-3 text-left transition-all duration-150",
              tradingStyle === opt.value
                ? "border-primary bg-primary/5"
                : "border-border/50 bg-muted/10 hover:border-border hover:bg-muted/20"
            )}
          >
            <div className="flex w-full items-center justify-between">
              {opt.icon}
              {tradingStyle === opt.value && (
                <Check className="h-3 w-3 text-primary" strokeWidth={3} />
              )}
            </div>
            <span className="text-sm font-medium leading-snug text-foreground">
              {opt.label}
            </span>
            <span className="text-[11px] text-muted-foreground leading-snug">
              {opt.sub}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function StepGoals() {
  const goals = useOnboardingStore((s) => s.goals);
  const toggleGoal = useOnboardingStore((s) => s.toggleGoal);

  return (
    <>
      <h2 className="text-xl font-semibold tracking-tight">What are your goals?</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Select all that apply. We'll surface relevant content first.
      </p>

      <div className="mt-5 flex flex-col gap-2">
        {GOAL_OPTIONS.map((goal) => {
          const selected = goals.includes(goal);
          return (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-2.5 text-left transition-all duration-150",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border/50 bg-muted/10 hover:border-border hover:bg-muted/20"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                  selected
                    ? "border-primary bg-primary"
                    : "border-border/60"
                )}
              >
                {selected && (
                  <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
                )}
              </span>
              <span className="text-sm text-foreground">{goal}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepReady() {
  const experienceLevel = useOnboardingStore((s) => s.experienceLevel);
  const tradingStyle = useOnboardingStore((s) => s.tradingStyle);
  const goals = useOnboardingStore((s) => s.goals);

  const levelLabel =
    experienceLevel === "beginner"
      ? "Beginner"
      : experienceLevel === "intermediate"
        ? "Intermediate"
        : experienceLevel === "advanced"
          ? "Advanced"
          : "All levels";

  const styleLabel =
    tradingStyle === "day"
      ? "Day Trading"
      : tradingStyle === "swing"
        ? "Swing Trading"
        : tradingStyle === "options"
          ? "Options"
          : tradingStyle === "longterm"
            ? "Long-Term"
            : "Mixed";

  return (
    <>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 mx-auto mb-4">
        <Target className="h-7 w-7 text-green-400" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">You're all set</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Here's your personalized setup.
      </p>

      {/* Summary chips */}
      <div className="mt-5 rounded-lg border border-border/50 bg-muted/10 divide-y divide-border/30">
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-muted-foreground">Experience</span>
          <span className="text-xs font-medium text-foreground">{levelLabel}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-muted-foreground">Style</span>
          <span className="text-xs font-medium text-foreground">{styleLabel}</span>
        </div>
        {goals.length > 0 && (
          <div className="flex items-start justify-between gap-4 px-4 py-2.5">
            <span className="text-xs text-muted-foreground shrink-0">Goals</span>
            <span className="text-xs font-medium text-foreground text-right leading-relaxed">
              {goals.slice(0, 3).join(", ")}
              {goals.length > 3 && ` +${goals.length - 3} more`}
            </span>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground text-center">
        {experienceLevel === "beginner"
          ? "We'll start you on the Learn track to build core skills."
          : experienceLevel === "advanced"
            ? "AlphaBot AI Coach is open and ready. Jump straight into analysis."
            : tradingStyle === "options"
              ? "The Options desk is highlighted in your sidebar."
              : "Your trading dashboard is ready. Start by opening a position."}
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Slide variants                                                       */
/* ------------------------------------------------------------------ */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Step components map                                                  */
/* ------------------------------------------------------------------ */

const STEP_COMPONENTS = [
  StepWelcome,
  StepExperience,
  StepTradingStyle,
  StepGoals,
  StepReady,
];

/* ------------------------------------------------------------------ */
/*  Main OnboardingModal                                                 */
/* ------------------------------------------------------------------ */

export function OnboardingModal() {
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const experienceLevel = useOnboardingStore((s) => s.experienceLevel);
  const tradingStyle = useOnboardingStore((s) => s.tradingStyle);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const complete = useOnboardingStore((s) => s.complete);
  const skip = useOnboardingStore((s) => s.skip);

  // Track direction for slide animation
  const directionRef = useRef(1);
  const [animKey, setAnimKey] = useState(currentStep);

  function goNext() {
    if (currentStep === TOTAL_STEPS - 1) {
      complete();
      return;
    }
    directionRef.current = 1;
    nextStep();
    setAnimKey((k) => k + 1);
  }

  function goBack() {
    if (currentStep === 0) return;
    directionRef.current = -1;
    prevStep();
    setAnimKey((k) => k - 1);
  }

  // Determine if Next is disabled (steps 1 and 2 require a selection)
  const nextDisabled =
    (currentStep === 1 && !experienceLevel) ||
    (currentStep === 2 && !tradingStyle);

  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const isFirstStep = currentStep === 0;

  const StepContent = STEP_COMPONENTS[currentStep];

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-lg mx-4 rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden"
      >
        {/* Inner scroll area for tall steps */}
        <div className="overflow-y-auto max-h-[90dvh]">
          {/* Content area */}
          <div className="relative overflow-hidden px-8 pt-8 pb-4 min-h-[340px] flex flex-col">
            <AnimatePresence mode="wait" custom={directionRef.current}>
              <motion.div
                key={animKey}
                custom={directionRef.current}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col text-center"
              >
                <StepContent />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 pb-7 pt-3 flex flex-col items-center gap-4">
            {/* Navigation buttons */}
            <div className="flex w-full items-center gap-3">
              {/* Back button */}
              {!isFirstStep && (
                <button
                  onClick={goBack}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                  aria-label="Go back"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}

              {/* Primary CTA */}
              <button
                onClick={goNext}
                disabled={nextDisabled}
                className={cn(
                  "flex-1 h-10 rounded-lg text-sm font-semibold transition-all duration-150",
                  nextDisabled
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
              >
                {isFirstStep
                  ? "Get Started"
                  : isLastStep
                    ? "Start Trading"
                    : "Continue"}
              </button>
            </div>

            {/* Step dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-block rounded-full transition-all duration-300",
                    i === currentStep
                      ? "w-5 h-1.5 bg-primary"
                      : "w-1.5 h-1.5 bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>

            {/* Skip link */}
            {!isLastStep && (
              <button
                onClick={skip}
                className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
              >
                Skip tour
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
