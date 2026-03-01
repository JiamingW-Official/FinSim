"use client";

import { useChartStore } from "@/stores/chart-store";
import { FUNDAMENTALS } from "@/data/fundamentals";
import { GlossaryTooltip } from "@/components/education/GlossaryTooltip";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";

function MetricCard({
  label,
  glossaryTerm,
  value,
  colorClass,
}: {
  label: string;
  glossaryTerm?: string;
  value: string;
  colorClass?: string;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-background/50 px-3 py-2">
      <div className="text-[10px] text-muted-foreground">
        {glossaryTerm ? (
          <GlossaryTooltip term={glossaryTerm}>{label}</GlossaryTooltip>
        ) : (
          label
        )}
      </div>
      <div className={cn("text-sm font-semibold tabular-nums", colorClass)}>
        {value}
      </div>
    </div>
  );
}

function getPERatioColor(pe: number): string {
  if (pe <= 0) return "text-muted-foreground";
  if (pe < 20) return "text-[#10b981]";
  if (pe <= 35) return "text-[#f59e0b]";
  return "text-[#ef4444]";
}

function getBetaColor(beta: number): string {
  if (beta < 1) return "text-[#10b981]";
  if (beta <= 1.5) return "text-[#f59e0b]";
  return "text-[#ef4444]";
}

export function FundamentalsPanel() {
  const currentTicker = useChartStore((s) => s.currentTicker);
  const data = FUNDAMENTALS[currentTicker];

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        No fundamental data available for {currentTicker}
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3">
      <div className="grid grid-cols-4 gap-2">
        <MetricCard
          label="Market Cap"
          glossaryTerm="Market Cap"
          value={data.marketCap}
        />
        <MetricCard
          label="P/E Ratio"
          glossaryTerm="P/E Ratio"
          value={data.peRatio.toFixed(1)}
          colorClass={getPERatioColor(data.peRatio)}
        />
        <MetricCard
          label="EPS"
          glossaryTerm="EPS"
          value={`$${data.eps.toFixed(2)}`}
        />
        <MetricCard
          label="Dividend Yield"
          glossaryTerm="Dividend"
          value={data.dividendYield > 0 ? `${data.dividendYield.toFixed(2)}%` : "N/A"}
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <MetricCard
          label="Beta"
          glossaryTerm="Beta"
          value={data.beta.toFixed(2)}
          colorClass={getBetaColor(data.beta)}
        />
        <MetricCard
          label="52W High"
          value={`$${data.week52High.toFixed(2)}`}
        />
        <MetricCard
          label="52W Low"
          value={`$${data.week52Low.toFixed(2)}`}
        />
        <MetricCard
          label="Avg Volume"
          glossaryTerm="Volume"
          value={data.avgVolume}
        />
      </div>
      <div className="flex items-start gap-2 rounded-md border border-border/50 bg-background/50 px-3 py-2">
        <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {data.description}
        </p>
      </div>
    </div>
  );
}
