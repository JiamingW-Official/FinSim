"use client";

import { motion } from "framer-motion";

const SLICES = [
  { label: "Tech", pct: 35, color: "#3b82f6" },
  { label: "Finance", pct: 20, color: "#10b981" },
  { label: "Healthcare", pct: 20, color: "#8b5cf6" },
  { label: "Energy", pct: 15, color: "#f59e0b" },
  { label: "Cash", pct: 10, color: "#6b7280" },
];

export function PortfolioPie() {
  const gradientParts: string[] = [];
  let cumulative = 0;
  for (const slice of SLICES) {
    gradientParts.push(`${slice.color} ${cumulative}% ${cumulative + slice.pct}%`);
    cumulative += slice.pct;
  }
  const gradient = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative h-28 w-28 rounded-full"
        style={{ background: gradient }}
      >
        <div className="absolute inset-3 rounded-full bg-card" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-muted-foreground">Portfolio</span>
        </div>
      </motion.div>
      <div className="flex flex-col gap-1">
        {SLICES.map((slice, i) => (
          <motion.div
            key={slice.label}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-2 text-xs"
          >
            <div className="h-2.5 w-2.5 rounded-sm" style={{ background: slice.color }} />
            <span className="text-foreground font-medium">{slice.label}</span>
            <span className="text-muted-foreground">{slice.pct}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
