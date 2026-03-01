"use client";

import { motion } from "framer-motion";

export function CandlestickDiagram() {
  return (
    <div className="flex items-center justify-center gap-8 py-4">
      {/* Green (bullish) candle */}
      <div className="flex flex-col items-center gap-2">
        <svg width="80" height="180" viewBox="0 0 80 180">
          {/* Upper wick */}
          <motion.line
            x1="40" y1="10" x2="40" y2="50"
            stroke="#10b981" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          />
          {/* Body */}
          <motion.rect
            x="20" y="50" width="40" height="80" rx="3"
            fill="#10b981" fillOpacity="0.3" stroke="#10b981" strokeWidth="2"
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            style={{ originX: "50%", originY: "50%" }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
          {/* Lower wick */}
          <motion.line
            x1="40" y1="130" x2="40" y2="170"
            stroke="#10b981" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          />
          {/* Labels */}
          <motion.text x="68" y="15" fill="#10b981" fontSize="9" fontWeight="600"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            High
          </motion.text>
          <motion.text x="68" y="135" fill="#10b981" fontSize="9" fontWeight="600"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            Open
          </motion.text>
          <motion.text x="68" y="55" fill="#10b981" fontSize="9" fontWeight="600"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            Close
          </motion.text>
          <motion.text x="68" y="175" fill="#10b981" fontSize="9" fontWeight="600"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
            Low
          </motion.text>
        </svg>
        <span className="text-xs font-semibold text-[#10b981]">Bullish</span>
      </div>

      {/* Red (bearish) candle */}
      <div className="flex flex-col items-center gap-2">
        <svg width="80" height="180" viewBox="0 0 80 180">
          {/* Upper wick */}
          <motion.line
            x1="40" y1="10" x2="40" y2="50"
            stroke="#ef4444" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          />
          {/* Body */}
          <motion.rect
            x="20" y="50" width="40" height="80" rx="3"
            fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" strokeWidth="2"
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            style={{ originX: "50%", originY: "50%" }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
          {/* Lower wick */}
          <motion.line
            x1="40" y1="130" x2="40" y2="170"
            stroke="#ef4444" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          />
          {/* Labels */}
          <motion.text x="68" y="15" fill="#ef4444" fontSize="9" fontWeight="600"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            High
          </motion.text>
          <motion.text x="68" y="55" fill="#ef4444" fontSize="9" fontWeight="600"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
            Open
          </motion.text>
          <motion.text x="68" y="135" fill="#ef4444" fontSize="9" fontWeight="600"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
            Close
          </motion.text>
          <motion.text x="68" y="175" fill="#ef4444" fontSize="9" fontWeight="600"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
            Low
          </motion.text>
        </svg>
        <span className="text-xs font-semibold text-[#ef4444]">Bearish</span>
      </div>
    </div>
  );
}
