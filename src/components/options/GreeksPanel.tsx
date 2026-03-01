"use client";

import { motion } from "framer-motion";
import type { Greeks } from "@/types/options";

interface GreeksPanelProps {
  greeks: Greeks;
}

const GREEK_CONFIG = [
  { key: "delta" as const, label: "Delta", color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "gamma" as const, label: "Gamma", color: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "theta" as const, label: "Theta", color: "text-red-400", bg: "bg-red-500/10" },
  { key: "vega" as const, label: "Vega", color: "text-green-400", bg: "bg-green-500/10" },
  { key: "rho" as const, label: "Rho", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { key: "vanna" as const, label: "Vanna", color: "text-amber-400", bg: "bg-amber-500/10" },
];

export function GreeksPanel({ greeks }: GreeksPanelProps) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {GREEK_CONFIG.map((g) => (
        <motion.div
          key={g.key}
          className={`rounded-lg ${g.bg} p-1.5 text-center`}
          whileHover={{ scale: 1.05 }}
        >
          <div className={`text-[8px] font-bold ${g.color}`}>{g.label}</div>
          <div className="text-[10px] font-black tabular-nums">
            {greeks[g.key].toFixed(g.key === "gamma" || g.key === "vanna" ? 4 : 2)}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
