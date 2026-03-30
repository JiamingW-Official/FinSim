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

function getInterpretation(key: keyof Greeks, greeks: Greeks): string {
  const val = greeks[key];
  switch (key) {
    case "delta":
      return `$${Math.abs(val).toFixed(2)} move per $1 stock`;
    case "gamma":
      return `Delta ±${Math.abs(val).toFixed(4)} per $1 move`;
    case "theta":
      return `Loses $${Math.abs(val).toFixed(2)} per day`;
    case "vega": {
      const dir = val >= 0 ? "gains" : "loses";
      return `${dir} $${Math.abs(val).toFixed(2)} per 1% IV`;
    }
    case "rho": {
      const dir = val >= 0 ? "gains" : "loses";
      return `${dir} $${Math.abs(val).toFixed(2)} per 1% rate`;
    }
    case "vanna":
      return "Delta-vega cross sensitivity";
    default:
      return "";
  }
}

/** Risk score 1–5: driven by gamma magnitude + vega magnitude */
function computeRiskLevel(greeks: Greeks): number {
  // Normalise gamma (typical range 0–0.1) and vega (typical range 0–0.5)
  const gammaNorm = Math.min(1, Math.abs(greeks.gamma) / 0.05);
  const vegaNorm = Math.min(1, Math.abs(greeks.vega) / 0.3);
  const thetaNorm = Math.min(1, Math.abs(greeks.theta) / 0.1);
  const raw = (gammaNorm * 0.45 + vegaNorm * 0.35 + thetaNorm * 0.20) * 5;
  return Math.max(1, Math.min(5, Math.round(raw)));
}

const RISK_LABELS = ["", "Very Low", "Low", "Moderate", "High", "Very High"];
const RISK_COLORS = ["", "#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];

export function GreeksPanel({ greeks }: GreeksPanelProps) {
  const riskLevel = computeRiskLevel(greeks);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1">
        {GREEK_CONFIG.map((g) => (
          <motion.div
            key={g.key}
            className={`rounded-lg ${g.bg} p-1.5 text-center`}
            whileHover={{ scale: 1.05 }}
          >
            <div className={`text-[8px] font-semibold ${g.color}`}>{g.label}</div>
            <div className="font-mono tabular-nums text-[10px] font-semibold">
              {greeks[g.key].toFixed(g.key === "gamma" || g.key === "vanna" ? 4 : 2)}
            </div>
            <div className="text-[7px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
              {getInterpretation(g.key, greeks)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Greek Risk Meter */}
      <div className="rounded-lg bg-muted/10 border border-border/30 p-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wide">
            Greek Risk Meter
          </span>
          <span
            className="text-[8px] font-bold"
            style={{ color: RISK_COLORS[riskLevel] }}
          >
            {RISK_LABELS[riskLevel]} ({riskLevel}/5)
          </span>
        </div>
        <svg width="100%" height="10" viewBox="0 0 100 10" preserveAspectRatio="none">
          {/* Background track */}
          <rect x="0" y="3" width="100" height="4" rx="2" fill="#1e293b" />
          {/* Filled portion */}
          <rect
            x="0"
            y="3"
            width={`${(riskLevel / 5) * 100}`}
            height="4"
            rx="2"
            fill={RISK_COLORS[riskLevel]}
            opacity="0.85"
          />
          {/* Segment ticks at 20/40/60/80 */}
          {[20, 40, 60, 80].map((x) => (
            <line key={x} x1={x} y1="2" x2={x} y2="8" stroke="#0f172a" strokeWidth="1" />
          ))}
        </svg>
        <div className="flex justify-between mt-0.5">
          <span className="text-[7px] text-muted-foreground">Low risk</span>
          <span className="text-[7px] text-muted-foreground">High risk</span>
        </div>
      </div>
    </div>
  );
}
