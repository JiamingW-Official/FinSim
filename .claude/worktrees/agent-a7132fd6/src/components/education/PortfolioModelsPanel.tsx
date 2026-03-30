"use client";

import { cn } from "@/lib/utils";
import { PORTFOLIO_MODELS, type PortfolioModel, type AllocationSlice } from "@/data/portfolio-models";

function RiskBars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-2.5 h-3 rounded-sm",
            i < level
              ? level <= 2
                ? "bg-green-500"
                : level <= 3
                  ? "bg-amber-500"
                  : "bg-red-500"
              : "bg-muted/30"
          )}
        />
      ))}
    </div>
  );
}

function PieChart({ allocation }: { allocation: AllocationSlice[] }) {
  const total = allocation.reduce((s, a) => s + a.pct, 0);
  let cumulative = 0;

  const slices = allocation.map((slice) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += slice.pct;
    const endAngle = (cumulative / total) * 360;
    return { ...slice, startAngle, endAngle };
  });

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
    const s = polarToCartesian(cx, cy, r, start);
    const e = polarToCartesian(cx, cy, r, end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y} Z`;
  }

  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      {slices.map((s, i) => (
        <path
          key={i}
          d={describeArc(40, 40, 36, s.startAngle, s.endAngle - 0.5)}
          fill={s.color}
          stroke="var(--card)"
          strokeWidth="1"
        />
      ))}
      <circle cx="40" cy="40" r="18" fill="var(--card)" />
    </svg>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 28;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="text-primary">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ModelCard({ model }: { model: PortfolioModel }) {
  return (
    <div className="border border-border/60 rounded-lg bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{model.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground">Risk</span>
            <RiskBars level={model.riskLevel} />
          </div>
        </div>
      </div>

      {/* Pie chart + legend */}
      <div className="flex items-center gap-4">
        <PieChart allocation={model.allocation} />
        <div className="flex-1 space-y-1">
          {model.allocation.map((slice) => (
            <div key={slice.label} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="text-muted-foreground flex-1">{slice.label}</span>
              <span className="text-foreground font-medium">{slice.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 bg-muted/30 rounded-md p-2.5">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Exp. Return</p>
          <p className="text-xs font-semibold text-green-500">{model.expectedReturn}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Volatility</p>
          <p className="text-xs font-semibold text-foreground">{model.volatility}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Max DD</p>
          <p className="text-xs font-semibold text-red-500">{model.maxDrawdown}%</p>
        </div>
      </div>

      {/* Sparkline */}
      <div>
        <p className="text-[10px] text-muted-foreground mb-1">10-Year Growth of $100</p>
        <Sparkline data={model.sparkline} />
      </div>

      {/* Suitable for */}
      <p className="text-xs text-muted-foreground leading-relaxed">{model.suitableFor}</p>
    </div>
  );
}

export default function PortfolioModelsPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Portfolio Models</h2>
        <p className="text-xs text-muted-foreground mt-1">Classic asset allocation strategies for different risk profiles</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PORTFOLIO_MODELS.map((model) => (
          <ModelCard key={model.name} model={model} />
        ))}
      </div>
    </div>
  );
}
