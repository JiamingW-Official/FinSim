"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import type { PracticeStep } from "@/data/lessons/types";
import { MiniSimulator } from "./practice/MiniSimulator";

interface PracticeStepProps {
  step: PracticeStep;
  onContinue: () => void;
}

export function PracticeStepComponent({ step, onContinue }: PracticeStepProps) {
  // If challenge is defined, render the embedded mini-simulator
  if (step.challenge) {
    return (
      <MiniSimulator
        actionType={step.actionType}
        challenge={step.challenge}
        instruction={step.instruction}
        onComplete={onContinue}
      />
    );
  }

  // Legacy fallback: "Go Practice" + "I Did It!" flow
  return <LegacyPractice step={step} onContinue={onContinue} />;
}

function LegacyPractice({
  step,
  onContinue,
}: {
  step: PracticeStep;
  onContinue: () => void;
}) {
  const [done, setDone] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs font-medium text-amber-500 uppercase tracking-wide mb-1">
          Hands-On Practice
        </p>
        <h2 className="text-base font-bold">{step.instruction}</h2>
      </motion.div>

      <motion.div
        className="rounded-lg border-2 border-dashed border-amber-500/30 bg-amber-500/5 p-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
      >
        <p className="text-xs font-semibold text-amber-500 mb-1">Objective</p>
        <p className="text-sm text-foreground/90">{step.objective}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Link
          href="/trade"
          target="_blank"
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary/10 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/20 active:scale-[0.98]"
        >
          <ExternalLink className="h-4 w-4" />
          Go Practice
        </Link>
      </motion.div>

      {!done && (
        <motion.button
          type="button"
          onClick={() => setDone(true)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-muted py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-accent active:scale-[0.98]"
        >
          <CheckCircle2 className="h-4 w-4" />
          I Did It!
        </motion.button>
      )}

      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-500">Nice work!</span>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Continue
          </button>
        </motion.div>
      )}
    </div>
  );
}
