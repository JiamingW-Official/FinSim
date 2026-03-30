"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ArrowLeftRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { OPTIONS_STRATEGIES, type OptionsStrategy } from "@/data/options-strategies";

// ─── Market scenario table ────────────────────────────────────────────────────
interface MarketScenario {
  label: string;
  description: string;
  scoreStrategy: (s: OptionsStrategy) => "good" | "neutral" | "bad";
}

const MARKET_SCENARIOS: MarketScenario[] = [
  {
    label: "High IV (>60 IVR)",
    description: "Implied volatility is elevated — options are expensive",
    scoreStrategy: (s) => {
      if (s.greeksProfile.vega === "negative") return "good";
      if (s.greeksProfile.vega === "positive") return "bad";
      return "neutral";
    },
  },
  {
    label: "Low IV (<20 IVR)",
    description: "Implied volatility is low — options are cheap",
    scoreStrategy: (s) => {
      if (s.greeksProfile.vega === "positive") return "good";
      if (s.greeksProfile.vega === "negative") return "bad";
      return "neutral";
    },
  },
  {
    label: "Strong Uptrend",
    description: "Stock is trending strongly to the upside",
    scoreStrategy: (s) => {
      const hasBullish = s.sentiment.includes("bullish");
      const hasBearish = s.sentiment.includes("bearish");
      const hasNeutral =
        s.sentiment.includes("neutral") || s.sentiment.includes("calm");
      if (hasBullish && !hasBearish) return "good";
      if (hasBearish && !hasBullish) return "bad";
      if (hasNeutral && !hasBullish) return "bad";
      return "neutral";
    },
  },
  {
    label: "Strong Downtrend",
    description: "Stock is trending strongly to the downside",
    scoreStrategy: (s) => {
      const hasBearish = s.sentiment.includes("bearish");
      const hasBullish = s.sentiment.includes("bullish");
      const hasNeutral =
        s.sentiment.includes("neutral") || s.sentiment.includes("calm");
      if (hasBearish && !hasBullish) return "good";
      if (hasBullish && !hasBearish) return "bad";
      if (hasNeutral && !hasBearish) return "bad";
      return "neutral";
    },
  },
  {
    label: "Sideways / Range-bound",
    description: "Stock oscillates in a defined range",
    scoreStrategy: (s) => {
      const isRange =
        s.sentiment.includes("neutral") || s.sentiment.includes("calm");
      const isDirectional =
        (s.sentiment.includes("bullish") || s.sentiment.includes("bearish")) &&
        !isRange;
      if (isRange && s.greeksProfile.theta === "positive") return "good";
      if (isDirectional) return "bad";
      return "neutral";
    },
  },
  {
    label: "Pre-Earnings (binary event)",
    description: "A large directional move is possible in either direction",
    scoreStrategy: (s) => {
      if (s.sentiment.includes("volatile") && s.greeksProfile.vega === "positive") return "good";
      if (s.greeksProfile.theta === "positive" && s.greeksProfile.vega === "negative")
        return "bad";
      return "neutral";
    },
  },
  {
    label: "Post-Earnings (IV Crush)",
    description: "Volatility collapses after the earnings announcement",
    scoreStrategy: (s) => {
      if (s.greeksProfile.vega === "negative" && s.greeksProfile.theta === "positive")
        return "good";
      if (s.greeksProfile.vega === "positive") return "bad";
      return "neutral";
    },
  },
  {
    label: "Small Account (<$5k)",
    description: "Limited capital available for options trading",
    scoreStrategy: (s) => {
      if (s.capitalRequired === "low") return "good";
      if (s.capitalRequired === "high") return "bad";
      return "neutral";
    },
  },
  {
    label: "Risk-Averse Trader",
    description: "Prioritizes capital preservation and defined risk",
    scoreStrategy: (s) => {
      if (s.riskLevel <= 2) return "good";
      if (s.riskLevel >= 4) return "bad";
      return "neutral";
    },
  },
  {
    label: "Theta Decay Harvesting",
    description: "Goal is to collect time premium as options expire",
    scoreStrategy: (s) => {
      if (s.greeksProfile.theta === "positive") return "good";
      if (s.greeksProfile.theta === "negative") return "bad";
      return "neutral";
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const GREEK_COLORS = {
  positive: "text-emerald-400",
  negative: "text-red-400",
  neutral: "text-muted-foreground",
  varies: "text-amber-400",
};

const RISK_COLORS = ["", "text-emerald-400", "text-emerald-400", "text-amber-400", "text-orange-400", "text-red-400"];

function greekIcon(value: string) {
  if (value === "positive") return <TrendingUp className="h-3 w-3 text-emerald-400" />;
  if (value === "negative") return <TrendingDown className="h-3 w-3 text-red-400" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

function ScoreBadge({ score }: { score: "good" | "neutral" | "bad" }) {
  if (score === "good")
    return (
      <span className="inline-flex items-center gap-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
        Good
      </span>
    );
  if (score === "bad")
    return (
      <span className="inline-flex items-center gap-0.5 rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
        Poor
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
      OK
    </span>
  );
}

// ─── Strategy selector dropdown ───────────────────────────────────────────────
function StrategySelector({
  value,
  onChange,
  placeholder,
  exclude,
}: {
  value: OptionsStrategy | null;
  onChange: (s: OptionsStrategy) => void;
  placeholder: string;
  exclude?: string;
}) {
  const [open, setOpen] = useState(false);
  const grouped = useMemo(() => {
    const cats = ["basic", "spread", "income", "complex", "synthetic"] as const;
    return cats.map((cat) => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      strategies: OPTIONS_STRATEGIES.filter(
        (s) => s.category === cat && s.id !== exclude,
      ),
    }));
  }, [exclude]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-full items-center justify-between rounded-md border border-border bg-background px-3 text-xs hover:border-primary/40"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value ? value.name : placeholder}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-9 z-50 max-h-64 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
          {grouped.map((group) =>
            group.strategies.length === 0 ? null : (
              <div key={group.label}>
                <div className="sticky top-0 bg-card/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
                  {group.label}
                </div>
                {group.strategies.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onChange(s);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-foreground hover:bg-accent"
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {s.experienceLevel}
                    </span>
                  </button>
                ))}
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

// ─── Comparison row ───────────────────────────────────────────────────────────
function CompareRow({
  label,
  a,
  b,
  highlight,
}: {
  label: string;
  a: React.ReactNode;
  b: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? "bg-accent/30" : undefined}>
      <td className="py-2 pr-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
        {label}
      </td>
      <td className="py-2 pr-4 text-xs text-foreground">{a}</td>
      <td className="py-2 text-xs text-foreground">{b}</td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function StrategyComparison() {
  const [stratA, setStratA] = useState<OptionsStrategy | null>(null);
  const [stratB, setStratB] = useState<OptionsStrategy | null>(null);

  const canCompare = stratA !== null && stratB !== null;

  const swapStrategies = () => {
    setStratA(stratB);
    setStratB(stratA);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Selector bar */}
      <div className="shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Compare Two Strategies Side-by-Side
          </span>
          {canCompare && (
            <button
              onClick={swapStrategies}
              className="flex items-center gap-1 rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftRight className="h-2.5 w-2.5" />
              Swap
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Strategy A
            </div>
            <StrategySelector
              value={stratA}
              onChange={setStratA}
              placeholder="Select strategy A…"
              exclude={stratB?.id}
            />
          </div>
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-orange-400">
              Strategy B
            </div>
            <StrategySelector
              value={stratB}
              onChange={setStratB}
              placeholder="Select strategy B…"
              exclude={stratA?.id}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {!canCompare ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <ArrowLeftRight className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">
            Select two strategies to compare
          </p>
          <p className="text-xs text-muted-foreground/60">
            Compare Greeks, risk metrics, P&L profiles, and which market conditions favor each
            strategy.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Column headers */}
          <div className="sticky top-0 z-10 grid grid-cols-[auto_1fr_1fr] gap-x-4 border-b border-border bg-background/95 py-2 backdrop-blur-sm">
            <div />
            <div className="text-xs font-bold text-primary">{stratA.name}</div>
            <div className="text-xs font-bold text-orange-400">{stratB.name}</div>
          </div>

          {/* ── Core P&L comparison ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3"
          >
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              P&L Profile
            </div>
            <table className="w-full">
              <tbody>
                <CompareRow
                  label="Max Profit"
                  a={<span className="font-medium text-emerald-400">{stratA.maxProfit}</span>}
                  b={<span className="font-medium text-emerald-400">{stratB.maxProfit}</span>}
                />
                <CompareRow
                  label="Max Loss"
                  highlight
                  a={<span className="font-medium text-red-400">{stratA.maxLoss}</span>}
                  b={<span className="font-medium text-red-400">{stratB.maxLoss}</span>}
                />
                <CompareRow
                  label="Breakeven"
                  a={stratA.breakeven}
                  b={stratB.breakeven}
                />
              </tbody>
            </table>
          </motion.div>

          {/* ── Risk & capital ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4"
          >
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Risk &amp; Capital
            </div>
            <table className="w-full">
              <tbody>
                <CompareRow
                  label="Risk Level"
                  a={
                    <span className={`font-semibold ${RISK_COLORS[stratA.riskLevel]}`}>
                      {"★".repeat(stratA.riskLevel)}{"☆".repeat(5 - stratA.riskLevel)}
                    </span>
                  }
                  b={
                    <span className={`font-semibold ${RISK_COLORS[stratB.riskLevel]}`}>
                      {"★".repeat(stratB.riskLevel)}{"☆".repeat(5 - stratB.riskLevel)}
                    </span>
                  }
                />
                <CompareRow
                  label="Capital"
                  highlight
                  a={<span className="capitalize">{stratA.capitalRequired}</span>}
                  b={<span className="capitalize">{stratB.capitalRequired}</span>}
                />
                <CompareRow
                  label="Experience"
                  a={<span className="capitalize">{stratA.experienceLevel}</span>}
                  b={<span className="capitalize">{stratB.experienceLevel}</span>}
                />
                <CompareRow
                  label="Difficulty"
                  highlight
                  a={
                    <span>
                      {"●".repeat(stratA.difficulty)}{"○".repeat(5 - stratA.difficulty)}
                    </span>
                  }
                  b={
                    <span>
                      {"●".repeat(stratB.difficulty)}{"○".repeat(5 - stratB.difficulty)}
                    </span>
                  }
                />
              </tbody>
            </table>
          </motion.div>

          {/* ── Greeks ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4"
          >
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Greeks Profile
            </div>
            <table className="w-full">
              <tbody>
                {(["delta", "gamma", "theta", "vega"] as const).map((greek, i) => (
                  <CompareRow
                    key={greek}
                    highlight={i % 2 === 1}
                    label={greek.charAt(0).toUpperCase() + greek.slice(1)}
                    a={
                      <span
                        className={`flex items-center gap-1 capitalize ${GREEK_COLORS[stratA.greeksProfile[greek] as keyof typeof GREEK_COLORS]}`}
                      >
                        {greekIcon(stratA.greeksProfile[greek])}
                        {stratA.greeksProfile[greek]}
                      </span>
                    }
                    b={
                      <span
                        className={`flex items-center gap-1 capitalize ${GREEK_COLORS[stratB.greeksProfile[greek] as keyof typeof GREEK_COLORS]}`}
                      >
                        {greekIcon(stratB.greeksProfile[greek])}
                        {stratB.greeksProfile[greek]}
                      </span>
                    }
                  />
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* ── Best conditions ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Ideal Setup
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5">
                <p className="text-xs leading-relaxed text-foreground">{stratA.setup}</p>
              </div>
              <div className="rounded-md border border-orange-500/20 bg-orange-500/5 p-2.5">
                <p className="text-xs leading-relaxed text-foreground">{stratB.setup}</p>
              </div>
            </div>
          </motion.div>

          {/* ── "Which is better when" scenario table ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-4"
          >
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Which Is Better When…
            </div>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Market Scenario
                    </th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {stratA.name}
                    </th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-orange-400">
                      {stratB.name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MARKET_SCENARIOS.map((scenario, i) => {
                    const scoreA = scenario.scoreStrategy(stratA);
                    const scoreB = scenario.scoreStrategy(stratB);
                    return (
                      <tr
                        key={scenario.label}
                        className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-accent/20"}`}
                      >
                        <td className="px-3 py-2">
                          <div className="text-xs font-medium text-foreground">
                            {scenario.label}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {scenario.description}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <ScoreBadge score={scoreA} />
                        </td>
                        <td className="px-3 py-2">
                          <ScoreBadge score={scoreB} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Example P&L ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Example P&L
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                <div className="mb-1 text-[10px] font-semibold text-primary">{stratA.name}</div>
                <p className="text-[11px] leading-relaxed text-foreground">{stratA.examplePnL}</p>
              </div>
              <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                <div className="mb-1 text-[10px] font-semibold text-orange-400">
                  {stratB.name}
                </div>
                <p className="text-[11px] leading-relaxed text-foreground">{stratB.examplePnL}</p>
              </div>
            </div>
          </motion.div>

          {/* ── Common mistakes summary ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-4"
          >
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Common Mistakes
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5">
                <div className="mb-1 text-[10px] font-semibold text-primary">{stratA.name}</div>
                <p className="text-[11px] leading-relaxed text-foreground">
                  {stratA.commonMistakes}
                </p>
              </div>
              <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5">
                <div className="mb-1 text-[10px] font-semibold text-orange-400">
                  {stratB.name}
                </div>
                <p className="text-[11px] leading-relaxed text-foreground">
                  {stratB.commonMistakes}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
