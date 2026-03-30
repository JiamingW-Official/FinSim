"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription, type SubscriptionTier } from "@/hooks/useSubscription";
import { PricingModal } from "@/components/subscription/PricingModal";

const TIER_LABEL: Record<SubscriptionTier, string> = {
  free: "Free",
  pro: "Captain",
  alpha: "Alpha",
};

interface PaywallGateProps {
  requiredTier: SubscriptionTier;
  featureName: string;
  children: React.ReactNode;
  /** Optional extra description shown on the locked overlay */
  description?: string;
  className?: string;
}

export function PaywallGate({
  requiredTier,
  featureName,
  children,
  description,
  className,
}: PaywallGateProps) {
  const { hasAccess } = useSubscription();
  const [modalOpen, setModalOpen] = useState(false);

  const unlocked = hasAccess(requiredTier);

  return (
    <>
      <div className={cn("relative", className)}>
        {/* Content — always rendered so layout is stable */}
        <AnimatePresence>
          {unlocked ? (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Blurred preview of content */}
              <div
                aria-hidden="true"
                className="pointer-events-none select-none blur-[6px] saturate-50"
              >
                {children}
              </div>

              {/* Lock overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/70 backdrop-blur-[2px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                  <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {featureName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {description ?? `Requires ${TIER_LABEL[requiredTier]} plan`}
                  </p>
                </div>

                <button
                  onClick={() => setModalOpen(true)}
                  className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Upgrade to {TIER_LABEL[requiredTier]}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PricingModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
