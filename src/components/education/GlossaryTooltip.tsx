"use client";

import { getGlossaryTerm } from "@/data/glossary";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const entry = getGlossaryTerm(term);
  if (!entry) {
    return <span>{children ?? term}</span>;
  }

  const categoryColors: Record<string, string> = {
    basics: "bg-blue-500/20 text-blue-400",
    orders: "bg-amber-500/20 text-amber-400",
    indicators: "bg-purple-500/20 text-purple-400",
    risk: "bg-red-500/20 text-red-400",
    fundamental: "bg-emerald-500/20 text-emerald-400",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help border-b border-dotted border-muted-foreground/50 transition-colors hover:border-primary hover:text-primary">
          {children ?? term}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={4}
        className="max-w-[280px] space-y-1.5 bg-card text-card-foreground border border-border p-3"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs">{entry.term}</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${categoryColors[entry.category] ?? ""}`}
          >
            {entry.category}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {entry.definition}
        </p>
        {entry.example && (
          <p className="text-[10px] italic text-muted-foreground/70">
            {entry.example}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
