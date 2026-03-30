"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BEHAVIORAL_BIASES, type BehavioralBias } from "@/data/behavioral-biases";

type CategoryFilter = "all" | "cognitive" | "emotional" | "social";

const FILTERS: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Cognitive", value: "cognitive" },
  { label: "Emotional", value: "emotional" },
  { label: "Social", value: "social" },
];

function SeverityDots({ severity }: { severity: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            i < severity ? "bg-red-500" : "bg-muted/40"
          )}
        />
      ))}
    </div>
  );
}

function BiasCard({ bias }: { bias: BehavioralBias }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border/60 rounded-lg bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start justify-between gap-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{bias.name}</h3>
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0",
                bias.category === "cognitive" && "bg-blue-500/10 text-blue-500",
                bias.category === "emotional" && "bg-amber-500/10 text-amber-500",
                bias.category === "social" && "bg-purple-500/10 text-purple-500"
              )}
            >
              {bias.category}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{bias.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <SeverityDots severity={bias.severity} />
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            className={cn(
              "text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          >
            <path d="M3.5 5.5L7 9L10.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
          {/* Example */}
          <div>
            <p className="text-[11px] font-medium text-foreground mb-1">Example</p>
            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-md p-2.5">{bias.example}</p>
          </div>

          {/* Impact */}
          <div>
            <p className="text-[11px] font-medium text-foreground mb-1">Impact on Trading</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{bias.impact}</p>
          </div>

          {/* Mitigation */}
          <div>
            <p className="text-[11px] font-medium text-foreground mb-1.5">How to Mitigate</p>
            <ul className="space-y-1.5">
              {bias.mitigationTips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                  <span className="text-primary shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <path d="M2 5L4.5 7.5L8 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BehavioralBiasesPanel() {
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const filtered = filter === "all" ? BEHAVIORAL_BIASES : BEHAVIORAL_BIASES.filter((b) => b.category === filter);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Behavioral Biases</h2>
        <p className="text-xs text-muted-foreground mt-1">Cognitive and emotional traps that undermine trading decisions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-md font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bias cards */}
      <div className="space-y-2">
        {filtered.map((bias) => (
          <BiasCard key={bias.name} bias={bias} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No biases match the selected filter. Try &quot;All&quot; to see every bias.</p>
      )}
    </div>
  );
}
