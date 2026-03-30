"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { FUNDAMENTALS } from "@/data/fundamentals";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";

interface RiskMeterProps {
  ticker: string;
  quantity: number;
  price: number;
  portfolioValue: number;
  existingPositionValue?: number;
}

type RiskLevel = "Very Low" | "Low" | "Moderate" | "High" | "Very High";

const RISK_COLORS: Record<RiskLevel, string> = {
  "Very Low": "bg-green-500",
  Low: "bg-[#34d399]",
  Moderate: "bg-[#f59e0b]",
  High: "bg-[#f97316]",
  "Very High": "bg-[#ef4444]",
};

const RISK_TEXT_COLORS: Record<RiskLevel, string> = {
  "Very Low": "text-green-500",
  Low: "text-[#34d399]",
  Moderate: "text-[#f59e0b]",
  High: "text-[#f97316]",
  "Very High": "text-[#ef4444]",
};

function calculateRiskLevel(
  ticker: string,
  quantity: number,
  price: number,
  portfolioValue: number,
  existingPositionValue: number,
): { level: RiskLevel; score: number; factors: string[] } {
  const orderValue = quantity * price;
  const factors: string[] = [];
  let score = 0;

  // Factor 1: Order size vs portfolio (0-40 points)
  const portfolioPercent = (orderValue / portfolioValue) * 100;
  if (portfolioPercent > 50) {
    score += 40;
    factors.push(`Order is ${portfolioPercent.toFixed(0)}% of portfolio (very concentrated)`);
  } else if (portfolioPercent > 25) {
    score += 30;
    factors.push(`Order is ${portfolioPercent.toFixed(0)}% of portfolio (high concentration)`);
  } else if (portfolioPercent > 10) {
    score += 15;
    factors.push(`Order is ${portfolioPercent.toFixed(0)}% of portfolio`);
  } else if (portfolioPercent > 5) {
    score += 5;
    factors.push(`Order is ${portfolioPercent.toFixed(0)}% of portfolio (moderate)`);
  }

  // Factor 2: Existing position concentration (0-30 points)
  const totalPositionValue = existingPositionValue + orderValue;
  const positionPercent = (totalPositionValue / portfolioValue) * 100;
  if (positionPercent > 40) {
    score += 30;
    factors.push(`Total ${ticker} exposure would be ${positionPercent.toFixed(0)}% of portfolio`);
  } else if (positionPercent > 25) {
    score += 20;
    factors.push(`Total ${ticker} exposure: ${positionPercent.toFixed(0)}%`);
  } else if (positionPercent > 15) {
    score += 10;
  }

  // Factor 3: Beta/Volatility (0-30 points)
  const fund = FUNDAMENTALS[ticker];
  if (fund) {
    if (fund.beta > 1.5) {
      score += 30;
      factors.push(`${ticker} has high beta (${fund.beta}) — very volatile`);
    } else if (fund.beta > 1.2) {
      score += 20;
      factors.push(`${ticker} beta ${fund.beta} — above-average volatility`);
    } else if (fund.beta > 1.0) {
      score += 10;
    }
  }

  let level: RiskLevel;
  if (score <= 10) level = "Very Low";
  else if (score <= 25) level = "Low";
  else if (score <= 45) level = "Moderate";
  else if (score <= 65) level = "High";
  else level = "Very High";

  return { level, score: Math.min(score, 100), factors };
}

export function RiskMeter({
  ticker,
  quantity,
  price,
  portfolioValue,
  existingPositionValue = 0,
}: RiskMeterProps) {
  const { level, score, factors } = useMemo(
    () =>
      calculateRiskLevel(
        ticker,
        quantity,
        price,
        portfolioValue,
        existingPositionValue,
      ),
    [ticker, quantity, price, portfolioValue, existingPositionValue],
  );

  if (quantity <= 0 || price <= 0) return null;

  const segments = ["Very Low", "Low", "Moderate", "High", "Very High"] as const;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="space-y-1 rounded-md bg-muted/50 p-2 cursor-help">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              Risk Level
            </span>
            <span className={cn("text-[10px] font-semibold", RISK_TEXT_COLORS[level])}>
              {level}
            </span>
          </div>
          <div className="flex gap-0.5">
            {segments.map((seg, i) => {
              const segIndex = segments.indexOf(level);
              return (
                <div
                  key={seg}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i <= segIndex ? RISK_COLORS[seg] : "bg-muted",
                  )}
                />
              );
            })}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="left"
        sideOffset={8}
        className="max-w-[240px] space-y-1 bg-card text-card-foreground border border-border p-2.5"
      >
        <div className="text-[10px] font-semibold">Risk Assessment</div>
        {factors.length > 0 ? (
          <ul className="space-y-0.5">
            {factors.map((f) => (
              <li key={f} className="text-[10px] text-muted-foreground">
                {f}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[10px] text-muted-foreground">
            This trade has low risk relative to your portfolio.
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
