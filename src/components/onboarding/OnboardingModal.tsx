"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useTradingPreferencesStore } from "@/stores/trading-preferences-store";
import {
  TrendingUp,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 3;

type ExperiencePath = "new" | "experienced";

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
  const { setTradingExperience } = useTradingPreferencesStore();
  const router = useRouter();

  const [selectedPath, setSelectedPath] = useState<ExperiencePath | null>(null);
  const dirRef = useRef<number>(1);

  const isFirst = currentStep === 0;
  const isLast = currentStep === TOTAL_STEPS - 1;

  function canAdvance(): boolean {
    if (currentStep === 1) return selectedPath !== null;
    return true;
  }

  function handleNext() {
    dirRef.current = 1;
    if (isLast) {
      // Persist experience before closing
      if (selectedPath === "new") {
        setTradingExperience("beginner");
      } else {
        setTradingExperience("intermediate");
      }
      completeOnboarding();
      // Redirect based on chosen path
      if (selectedPath === "new") {
        router.push("/learn");
      } else {
        router.push("/trade");
      }
    } else {
      nextStep();
    }
  }

  function handleSkip() {
    completeOnboarding();
  }

  return (
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
            {isFirst && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleSkip}
                className="text-muted-foreground/60 hover:text-muted-foreground"
              >
                Skip
              </Button>
            )}
          </div>

          {/* Step content */}
          <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
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
                  <StepChoosePath
                    selected={selectedPath}
                    onSelect={setSelectedPath}
                  />
                )}
                {currentStep === 2 && (
                  <StepReady selectedPath={selectedPath} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t border-border/40 px-5 py-4 flex items-center gap-3">
            {currentStep === 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  dirRef.current = -1;
                  setStep(0);
                }}
              >
                Back
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              disabled={!canAdvance()}
              className="ml-auto"
            >
              {currentStep === 0 && "Get Started"}
              {currentStep === 1 && "Next"}
              {currentStep === 2 &&
                (selectedPath === "new"
                  ? "Start Learning"
                  : "Start Trading")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
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
          Practice trading with $100k in virtual capital. Real market data, no
          real risk.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 mt-1">
        <FeatureRow
          icon={<BarChart3 className="h-4 w-4 text-primary" />}
          title="Real market data"
          desc="Historical candlestick charts for 10 tickers with 15 indicators"
        />
        <FeatureRow
          icon={<GraduationCap className="h-4 w-4 text-primary" />}
          title="Learn as you go"
          desc="650+ bite-sized lessons, quizzes, and flashcards"
        />
        <FeatureRow
          icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
          title="Track your progress"
          desc="XP, achievements, streaks, and leaderboards"
        />
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 px-3.5 py-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-semibold">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Choose your path
// ---------------------------------------------------------------------------

function StepChoosePath({
  selected,
  onSelect,
}: {
  selected: ExperiencePath | null;
  onSelect: (v: ExperiencePath) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Choose your path
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick whichever fits. You can explore everything either way.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-1">
        <PathCard
          active={selected === "new"}
          onClick={() => onSelect("new")}
          icon={<GraduationCap className="h-5 w-5" />}
          title="I'm new to trading"
          desc="Start with guided lessons that build your knowledge step by step"
        />
        <PathCard
          active={selected === "experienced"}
          onClick={() => onSelect("experienced")}
          icon={<BarChart3 className="h-5 w-5" />}
          title="I have experience"
          desc="Jump straight into the trading simulator with real market data"
        />
      </div>
    </div>
  );
}

function PathCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3.5 rounded-lg border px-4 py-4 text-left transition-colors",
        active
          ? "border-primary bg-primary/8 text-foreground"
          : "border-border/40 bg-muted/10 text-muted-foreground hover:bg-accent/30 hover:text-foreground"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md transition-colors",
          active ? "bg-primary/15 text-primary" : "bg-muted/40 text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs leading-relaxed opacity-70">{desc}</span>
      </div>
      {active && (
        <CheckCircle2 className="ml-auto mt-1 h-4 w-4 flex-shrink-0 text-primary" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — You're all set
// ---------------------------------------------------------------------------

function StepReady({
  selectedPath,
}: {
  selectedPath: ExperiencePath | null;
}) {
  const isNew = selectedPath === "new";

  return (
    <div className="flex flex-col items-center text-center gap-4 pt-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="h-7 w-7 text-primary" />
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {"You're all set"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
          {isNew
            ? "We'll start you off with the fundamentals. Your $100k virtual portfolio will be waiting when you're ready to trade."
            : "Your $100k virtual portfolio is ready. Open a chart, pick a ticker, and place your first trade."}
        </p>
      </div>
    </div>
  );
}
