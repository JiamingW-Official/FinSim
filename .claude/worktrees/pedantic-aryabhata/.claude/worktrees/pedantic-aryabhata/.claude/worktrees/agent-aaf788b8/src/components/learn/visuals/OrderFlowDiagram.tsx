"use client";

import { motion } from "framer-motion";

const STEPS = [
  { label: "You", sub: "Decide to trade", color: "#3b82f6" },
  { label: "Order", sub: "Market / Limit", color: "#8b5cf6" },
  { label: "Broker", sub: "Routes order", color: "#f59e0b" },
  { label: "Exchange", sub: "Matches buyer & seller", color: "#10b981" },
];

export function OrderFlowDiagram() {
  return (
    <div className="flex flex-col items-center gap-3 overflow-x-auto py-4">
      {/* Row 1: Boxes + arrows — fixed height, vertically centered */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.2 }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 text-lg font-black"
              style={{ borderColor: step.color, color: step.color, background: `${step.color}15` }}
            >
              {i + 1}
            </motion.div>
            {i < STEPS.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: i * 0.2 + 0.15 }}
                className="mx-1.5 flex items-center"
                style={{ originX: 0 }}
              >
                <div className="h-0.5 w-6 bg-border" />
                <div className="h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-border" />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Row 2: Labels — separate row so text doesn't affect box alignment */}
      <div className="flex items-start gap-1">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-start">
            <div className="flex w-16 shrink-0 flex-col items-center gap-0.5">
              <span className="text-[10px] font-bold" style={{ color: step.color }}>
                {step.label}
              </span>
              <span className="max-w-[72px] text-center text-[9px] leading-tight text-muted-foreground">
                {step.sub}
              </span>
            </div>
            {/* Spacer matching the arrow width */}
            {i < STEPS.length - 1 && <div className="mx-1.5 w-[30px] shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
