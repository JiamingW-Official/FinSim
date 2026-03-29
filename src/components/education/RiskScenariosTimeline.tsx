"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RISK_SCENARIOS, type RiskScenario } from "@/data/risk-scenarios";

function severityColor(severity: RiskScenario["severity"]) {
  switch (severity) {
    case "moderate":
      return "bg-amber-500";
    case "severe":
      return "bg-orange-500";
    case "extreme":
      return "bg-red-500";
  }
}

function severityBorderColor(severity: RiskScenario["severity"]) {
  switch (severity) {
    case "moderate":
      return "border-amber-500/30";
    case "severe":
      return "border-orange-500/30";
    case "extreme":
      return "border-red-500/30";
  }
}

function CrisisCard({ scenario }: { scenario: RiskScenario }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative flex gap-4">
      {/* Timeline node */}
      <div className="flex flex-col items-center shrink-0">
        <div className={cn("w-3 h-3 rounded-full mt-1", severityColor(scenario.severity))} />
        <div className="w-px flex-1 bg-border/60" />
      </div>

      {/* Content */}
      <div className={cn("flex-1 border rounded-lg bg-card mb-4 overflow-hidden", severityBorderColor(scenario.severity))}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{scenario.name}</h3>
                <span className="text-[11px] text-muted-foreground">{scenario.year}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">{scenario.summary}</p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              className={cn(
                "text-muted-foreground transition-transform shrink-0 mt-0.5",
                expanded && "rotate-180"
              )}
            >
              <path d="M3.5 5.5L7 9L10.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>

          {/* Key metrics */}
          <div className="flex gap-4 mt-3">
            <div>
              <p className="text-xs text-muted-foreground">S&P Drawdown</p>
              <p className="text-sm font-semibold text-red-500">{scenario.spDrawdown}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">VIX Peak</p>
              <p className="text-sm font-semibold text-foreground">{scenario.vixPeak}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recovery</p>
              <p className="text-sm font-semibold text-foreground">{scenario.recoveryMonths}mo</p>
            </div>
          </div>
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
            {/* Timeline of events */}
            <div>
              <p className="text-[11px] font-medium text-foreground mb-2">Timeline of Events</p>
              <div className="space-y-2">
                {scenario.timeline.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-[11px] font-medium text-primary shrink-0 w-14">{event.date}</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{event.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lessons */}
            <div>
              <p className="text-[11px] font-medium text-foreground mb-1.5">Lessons Learned</p>
              <ul className="space-y-1.5">
                {scenario.lessons.map((lesson, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                    <span className="text-muted-foreground/60 shrink-0">&mdash;</span>
                    <span>{lesson}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RiskScenariosTimeline() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Historical Market Crises</h2>
        <p className="text-xs text-muted-foreground mt-1">Major drawdowns, their causes, and the lessons they teach</p>
      </div>

      <div>
        {RISK_SCENARIOS.map((scenario) => (
          <CrisisCard key={scenario.name} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
