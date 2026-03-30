"use client";

import { motion } from "framer-motion";

const ZONES = [
  { label: "HIGH RISK", sub: "Options, Leverage, Crypto", color: "#ef4444", y: 0 },
  { label: "MEDIUM RISK", sub: "Individual Stocks, Sector ETFs", color: "#f59e0b", y: 50 },
  { label: "LOW RISK", sub: "Index Funds, Bonds, Savings", color: "#10b981", y: 100 },
];

export function RiskPyramid() {
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="260" height="190" viewBox="0 0 260 190">
        {ZONES.map((zone, i) => {
          const topLeft = 130 - (i + 1) * 40;
          const topRight = 130 + (i + 1) * 40;
          const bottomLeft = 130 - (i + 2) * 40;
          const bottomRight = 130 + (i + 2) * 40;
          const topY = i * 55 + 10;
          const bottomY = (i + 1) * 55 + 10;

          return (
            <motion.g
              key={zone.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.25 }}
            >
              <polygon
                points={`${topLeft},${topY} ${topRight},${topY} ${bottomRight},${bottomY} ${bottomLeft},${bottomY}`}
                fill={zone.color}
                fillOpacity="0.15"
                stroke={zone.color}
                strokeWidth="1.5"
              />
              <text
                x="130"
                y={topY + (bottomY - topY) / 2 - 4}
                textAnchor="middle"
                fill={zone.color}
                fontSize="10"
                fontWeight="700"
              >
                {zone.label}
              </text>
              <text
                x="130"
                y={topY + (bottomY - topY) / 2 + 10}
                textAnchor="middle"
                fill={zone.color}
                fontSize="8"
                fillOpacity="0.8"
              >
                {zone.sub}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
