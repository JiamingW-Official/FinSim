"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { OptionChainExpiry } from "@/types/options";

interface ExpirySelectorProps {
  chain: OptionChainExpiry[];
  selectedExpiry: string;
  onSelectExpiry: (expiry: string) => void;
}

export function ExpirySelector({
  chain,
  selectedExpiry,
  onSelectExpiry,
}: ExpirySelectorProps) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <span className="text-xs font-bold text-muted-foreground mr-1">
        Expiry
      </span>
      {chain.map((c) => {
        const isActive = c.expiry === selectedExpiry;
        const label = new Date(c.expiry + "T12:00:00").toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" },
        );
        return (
          <motion.button
            key={c.expiry}
            onClick={() => onSelectExpiry(c.expiry)}
            className={cn(
              "relative rounded-md px-2.5 py-1 text-xs font-bold transition-colors",
              isActive
                ? "bg-orange-500/15 text-orange-400"
                : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{label}</span>
            <span className="ml-1 text-[11px] opacity-60">
              {c.daysToExpiry}d
            </span>
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-md border border-orange-400/40"
                layoutId="expiry-indicator"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
