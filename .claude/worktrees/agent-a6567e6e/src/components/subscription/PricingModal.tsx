"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, Shield, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSubscription, type SubscriptionTier } from "@/hooks/useSubscription";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface Feature {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  alpha: string | boolean;
}

const FEATURES: Feature[] = [
  { label: "Trades per day",          free: "5",          pro: "Unlimited",  alpha: "Unlimited" },
  { label: "AI Copilot detail",       free: "Basic",      pro: "Advanced",   alpha: "Full analysis" },
  { label: "Trader DNA report",       free: false,        pro: "Summary",    alpha: "Full report" },
  { label: "Weekly challenges",       free: false,        pro: true,         alpha: true },
  { label: "Beat Black-Scholes mode", free: false,        pro: false,        alpha: true },
  { label: "Counterparty agents",     free: false,        pro: false,        alpha: true },
  { label: "Tokenized assets",        free: false,        pro: false,        alpha: true },
  { label: "Custom scenarios",        free: false,        pro: "5/mo",       alpha: "Unlimited" },
  { label: "Priority AI coaching",    free: false,        pro: false,        alpha: true },
];

interface Tier {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  annualSavings: number | null;
  cta: string;
  ctaVariant: "outline" | "primary" | "alpha";
  badge?: string;
  icon: React.ReactNode;
}

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Cadet",
    tagline: "Start your trading journey",
    monthlyPrice: null,
    annualPrice: null,
    annualSavings: null,
    cta: "Get Started Free",
    ctaVariant: "outline",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: "pro",
    name: "Captain",
    tagline: "For serious learners",
    monthlyPrice: 14.99,
    annualPrice: 119,
    annualSavings: 61,
    cta: "Upgrade to Captain",
    ctaVariant: "primary",
    badge: "Most Popular",
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: "alpha",
    name: "Alpha",
    tagline: "Professional-grade simulation",
    monthlyPrice: 29.99,
    annualPrice: 239,
    annualSavings: 121,
    cta: "Unlock Alpha Access",
    ctaVariant: "alpha",
    icon: <Star className="h-4 w-4" />,
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === false) {
    return (
      <span className="flex items-center justify-center">
        <X className="h-3.5 w-3.5 text-muted-foreground/40" aria-label="Not included" />
      </span>
    );
  }
  if (value === true) {
    return (
      <span className="flex items-center justify-center">
        <Check className="h-3.5 w-3.5 text-green-500" aria-label="Included" />
      </span>
    );
  }
  return (
    <span className="text-xs font-medium tabular-nums text-foreground">
      {value}
    </span>
  );
}

function BillingToggle({
  annual,
  onChange,
}: {
  annual: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        onClick={() => onChange(false)}
        className={cn(
          "transition-colors",
          !annual ? "text-foreground font-medium" : "text-muted-foreground"
        )}
      >
        Monthly
      </button>

      {/* Animated pill toggle */}
      <button
        role="switch"
        aria-checked={annual}
        onClick={() => onChange(!annual)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          annual ? "border-primary bg-primary" : "border-input bg-input"
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "block h-3.5 w-3.5 rounded-full bg-white shadow-sm",
            annual ? "ml-[18px]" : "ml-0.5"
          )}
        />
      </button>

      <button
        onClick={() => onChange(true)}
        className={cn(
          "flex items-center gap-1.5 transition-colors",
          annual ? "text-foreground font-medium" : "text-muted-foreground"
        )}
      >
        Annual
        <span className="rounded-sm bg-green-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
          Save up to 33%
        </span>
      </button>
    </div>
  );
}

function TierCard({
  tier,
  annual,
  isCurrentTier,
  onSelect,
}: {
  tier: Tier;
  annual: boolean;
  isCurrentTier: boolean;
  onSelect: () => void;
}) {
  const price = annual ? tier.annualPrice : tier.monthlyPrice;
  const period = annual ? "/yr" : "/mo";
  const isPro = tier.ctaVariant === "primary";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border p-5 transition-colors",
        isPro
          ? "border-primary/60 bg-primary/5"
          : "border-border bg-card"
      )}
    >
      {/* Most Popular badge */}
      {tier.badge && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full border border-primary/30 bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
            {tier.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md",
            isPro ? "bg-primary/15 text-primary" : "bg-accent text-muted-foreground"
          )}
        >
          {tier.icon}
        </span>
        <div>
          <div className="text-sm font-semibold">{tier.name}</div>
          <div className="text-[11px] text-muted-foreground">{tier.tagline}</div>
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4 min-h-[3rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={annual ? "annual" : "monthly"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {price === null ? (
              <div className="text-2xl font-bold tabular-nums">Free</div>
            ) : (
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold tabular-nums">
                  ${price.toLocaleString("en-US", { minimumFractionDigits: annual ? 0 : 2, maximumFractionDigits: 2 })}
                </span>
                <span className="mb-0.5 text-xs text-muted-foreground">{period}</span>
              </div>
            )}
            {annual && tier.annualSavings !== null && (
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                Save ${tier.annualSavings}/yr vs monthly
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <button
        onClick={onSelect}
        disabled={isCurrentTier}
        className={cn(
          "w-full rounded-md px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none",
          isCurrentTier
            ? "border border-border bg-transparent text-muted-foreground opacity-60"
            : tier.ctaVariant === "primary"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : tier.ctaVariant === "alpha"
                ? "border border-border bg-card text-foreground hover:border-primary/60 hover:bg-primary/5"
                : "border border-border bg-transparent text-foreground hover:bg-accent"
        )}
      >
        {isCurrentTier ? "Current Plan" : tier.cta}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  const [annual, setAnnual] = useState(false);
  const { currentTier, setTier } = useSubscription();

  function handleSelect(tier: Tier) {
    // In production this would open a Stripe checkout.
    // For now, just update mock subscription state.
    setTier(tier.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto p-0"
        showCloseButton
      >
        {/* Header */}
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-xl font-semibold">
            Choose your plan
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            All plans include $100,000 virtual capital and real market data.
          </DialogDescription>
          <div className="mt-3">
            <BillingToggle annual={annual} onChange={setAnnual} />
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 pt-5">
          {/* Tier cards */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                annual={annual}
                isCurrentTier={currentTier === tier.id}
                onSelect={() => handleSelect(tier)}
              />
            ))}
          </div>

          {/* Feature comparison table */}
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      Features
                    </th>
                    {TIERS.map((t) => (
                      <th
                        key={t.id}
                        className={cn(
                          "px-3 py-2.5 text-center text-xs font-medium",
                          t.ctaVariant === "primary" ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {t.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((feature, i) => (
                    <tr
                      key={feature.label}
                      className={cn(
                        "border-b last:border-0",
                        i % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                      )}
                    >
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {feature.label}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <FeatureCell value={feature.free} />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <FeatureCell value={feature.pro} />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <FeatureCell value={feature.alpha} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer notes */}
          <div className="mt-4 flex flex-col items-center gap-1 text-center">
            <p className="text-xs text-muted-foreground">
              14-day free trial on Pro &amp; Alpha. Cancel anytime. No credit card required to start.
            </p>
            <a
              href="mailto:institutions@finsim.io"
              className="text-xs text-primary underline-offset-2 hover:underline"
            >
              Contact for University &amp; Institutional Pricing
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
