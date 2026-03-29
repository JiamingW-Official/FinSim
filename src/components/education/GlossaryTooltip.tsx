"use client";

import { useRouter } from "next/navigation";
import { getGlossaryTerm } from "@/data/glossary";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";

interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const entry = getGlossaryTerm(term);
  const router = useRouter();

  if (!entry) {
    return <span>{children ?? term}</span>;
  }

  const categoryColors: Record<string, string> = {
    basics: "bg-blue-500/20 text-blue-400",
    orders: "bg-amber-500/20 text-amber-400",
    indicators: "bg-purple-500/20 text-purple-400",
    risk: "bg-red-500/20 text-red-400",
    fundamental: "bg-emerald-500/20 text-emerald-400",
    "personal-finance": "bg-cyan-500/20 text-cyan-400",
    crypto: "bg-orange-500/20 text-orange-400",
    macro: "bg-yellow-500/20 text-yellow-400",
    "options-advanced": "bg-violet-500/20 text-violet-400",
    technical: "bg-sky-500/20 text-sky-400",
  };

  function handleLearnMore(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    router.push(
      `/learn?glossary=${encodeURIComponent(entry!.term)}`,
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          className="cursor-help border-b border-dotted border-muted-foreground/50 transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              // Tooltip opens via Radix on focus automatically; Enter navigates
              handleLearnMore(e);
            }
          }}
        >
          {children ?? term}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={4}
        className="max-w-[300px] space-y-1.5 bg-card text-card-foreground border border-border p-3"
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs">{entry.term}</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[11px] font-medium ${categoryColors[entry.category] ?? ""}`}
          >
            {entry.category}
          </span>
        </div>

        {/* Definition */}
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {entry.definition}
        </p>

        {/* Formula (if present) */}
        {entry.formula && (
          <code className="block rounded bg-muted/40 border border-border/40 px-2 py-1 text-xs leading-relaxed font-mono text-foreground/80 whitespace-pre-wrap">
            {entry.formula}
          </code>
        )}

        {/* Example (if present) */}
        {entry.example && (
          <p className="text-xs italic text-muted-foreground/70">
            {entry.example}
          </p>
        )}

        {/* Learn more link */}
        <button
          type="button"
          onClick={handleLearnMore}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
        >
          <ExternalLink className="h-2.5 w-2.5" />
          Learn more in Glossary
        </button>
      </TooltipContent>
    </Tooltip>
  );
}
