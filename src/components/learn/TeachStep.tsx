"use client";

import { motion } from "framer-motion";
import type { TeachStep as TeachStepType } from "@/data/lessons/types";
import { CandlestickDiagram } from "./visuals/CandlestickDiagram";
import { OrderFlowDiagram } from "./visuals/OrderFlowDiagram";
import { IndicatorDiagram } from "./visuals/IndicatorDiagram";
import { RiskPyramid } from "./visuals/RiskPyramid";
import { PortfolioPie } from "./visuals/PortfolioPie";

interface TeachStepProps {
  step: TeachStepType;
  onContinue: () => void;
}

const VISUAL_MAP = {
  candlestick: CandlestickDiagram,
  "order-flow": OrderFlowDiagram,
  "indicator-chart": IndicatorDiagram,
  "risk-pyramid": RiskPyramid,
  "portfolio-pie": PortfolioPie,
} as const;

function formatContent(content: string): React.ReactNode[] {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-primary font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function TeachStepComponent({ step, onContinue }: TeachStepProps) {
  const VisualComponent = step.visual ? VISUAL_MAP[step.visual] : null;

  return (
    <div className="flex flex-col gap-4">
      <motion.h2
        className="text-lg font-bold"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {step.title}
      </motion.h2>

      {VisualComponent && (
        <motion.div
          className="glass rounded-lg border border-border overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <VisualComponent />
        </motion.div>
      )}

      <motion.div
        className="rounded-lg bg-muted/30 border border-border/50 p-4 space-y-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {step.content.split("\n\n").map((paragraph, i) => (
          <p key={i} className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {formatContent(paragraph)}
          </p>
        ))}
      </motion.div>

      {step.highlight && step.highlight.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {step.highlight.map((term) => (
            <span
              key={term}
              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary"
            >
              {term}
            </span>
          ))}
        </motion.div>
      )}

      <motion.button
        type="button"
        onClick={onContinue}
        className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] active:scale-[0.98]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Continue
      </motion.button>
    </div>
  );
}
