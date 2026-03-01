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
    <div className="flex items-center justify-center gap-1 overflow-x-auto py-4">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.2 }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 text-sm font-bold"
              style={{ borderColor: step.color, color: step.color, background: `${step.color}15` }}
            >
              {i + 1}
            </div>
            <span className="text-[10px] font-semibold" style={{ color: step.color }}>
              {step.label}
            </span>
            <span className="max-w-[70px] text-center text-[9px] text-muted-foreground">
              {step.sub}
            </span>
          </motion.div>
          {i < STEPS.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: i * 0.2 + 0.15 }}
              className="mx-1 flex items-center"
              style={{ originX: 0 }}
            >
              <div className="h-0.5 w-6 bg-border" />
              <div className="h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-border" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
