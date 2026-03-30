"use client";

import { motion } from "framer-motion";
import type { TeachStep as TeachStepType } from "@/data/lessons/types";
import { CandlestickDiagram } from "./visuals/CandlestickDiagram";
import { OrderFlowDiagram } from "./visuals/OrderFlowDiagram";
import { IndicatorDiagram } from "./visuals/IndicatorDiagram";
import { RiskPyramid } from "./visuals/RiskPyramid";
import { PortfolioPie } from "./visuals/PortfolioPie";

const VISUAL_MAP = {
  candlestick: CandlestickDiagram,
  "order-flow": OrderFlowDiagram,
  "indicator-chart": IndicatorDiagram,
  "risk-pyramid": RiskPyramid,
  "portfolio-pie": PortfolioPie,
} as const;

function formatInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

interface Block { kind: "paragraph" | "bullets"; text?: string; items?: string[]; }

function parseBlocks(content: string): Block[] {
  return content.split("\n\n").map((para) => {
    const lines = para.split("\n");
    const hasBullet = lines.some((l) => l.trimStart().startsWith("•"));
    if (hasBullet) {
      return {
        kind: "bullets",
        items: lines.filter((l) => l.trim().length > 0).map((l) => l.replace(/^[\s•]+/, "")),
      };
    }
    return { kind: "paragraph", text: para };
  });
}

export function TeachStepComponent({ step, onContinue }: { step: TeachStepType; onContinue: () => void }) {
  const VisualComponent = step.visual ? VISUAL_MAP[step.visual] : null;
  const blocks = parseBlocks(step.content);

  return (
    <div className="flex flex-col gap-6">
      {/* Title — big serif */}
      <motion.h2
        className="font-serif text-3xl font-bold tracking-tight leading-tight text-foreground"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {step.title}
      </motion.h2>

      {/* Visual */}
      {VisualComponent && (
        <motion.div
          className="rounded-xl overflow-hidden border border-border/50"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.06 }}
        >
          <VisualComponent />
        </motion.div>
      )}

      {/* Content — editorial left-rule style */}
      <div className="flex flex-col gap-4">
        {blocks.map((block, bi) => {
          const delay = 0.1 + bi * 0.07;
          if (block.kind === "bullets" && block.items) {
            return (
              <motion.div
                key={bi}
                className="border-l-2 border-foreground/10 pl-5"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay }}
              >
                <ul className="space-y-3">
                  {block.items.map((item, ii) => (
                    <motion.li
                      key={ii}
                      className="flex items-start gap-3 text-sm leading-relaxed text-foreground/75"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: delay + ii * 0.04 }}
                    >
                      <span className="mt-[7px] h-1 w-2.5 shrink-0 rounded-full bg-foreground/20" />
                      <span>{formatInline(item)}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          }
          return (
            <motion.div
              key={bi}
              className="border-l-2 border-foreground/10 pl-5"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, delay }}
            >
              <p className="text-sm leading-relaxed text-foreground/75 whitespace-pre-line">
                {formatInline(block.text ?? "")}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Key terms */}
      {step.highlight && step.highlight.length > 0 && (
        <motion.div
          className="flex flex-wrap items-center gap-2 pt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/25 mr-1">
            Key terms
          </span>
          {step.highlight.map((term, i) => (
            <motion.span
              key={term}
              className="cursor-default rounded-full border border-foreground/[0.12] px-3 py-0.5 text-[11px] font-mono text-muted-foreground/50 transition-all hover:border-foreground/25 hover:text-foreground/80"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.38 + i * 0.04, type: "spring", stiffness: 400, damping: 15 }}
              whileHover={{ scale: 1.04, y: -1 }}
            >
              {term}
            </motion.span>
          ))}
        </motion.div>
      )}

      {/* Continue */}
      <motion.button
        type="button"
        onClick={onContinue}
        className="mt-1 w-full rounded-full bg-foreground text-background py-3 text-[11px] font-bold tracking-[0.12em] uppercase transition-all hover:bg-foreground/90"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        transition={{ delay: 0.42 }}
      >
        Continue →
      </motion.button>
    </div>
  );
}
