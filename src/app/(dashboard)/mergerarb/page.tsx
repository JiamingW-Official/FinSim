"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  Calculator,
  BarChart2,
  Shield,
  DollarSign,
  Percent,
  Activity,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 972;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function randBetween(min: number, max: number): number {
  return min + rand() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(randBetween(min, max + 1));
}

// ── Types ─────────────────────────────────────────────────────────────────────

type DealStatus = "Pending" | "Announced" | "Voted" | "Regulatory";

interface Deal {
  id: string;
  acquirer: string;
  acquirerTicker: string;
  target: string;
  targetTicker: string;
  dealPrice: number;
  currentPrice: number;
  spread: number;
  spreadPct: number;
  impliedProbability: number;
  closeDate: string;
  dealSize: number;
  status: DealStatus;
  dealType: "Cash" | "Stock" | "Mixed";
  annualizedReturn: number;
  daysToClose: number;
}

interface SpreadBreakdown {
  dealRiskPremium: number;
  timeValue: number;
  financingCost: number;
  total: number;
}

interface PortfolioPoint {
  month: string;
  arbReturn: number;
  sp500Return: number;
}

interface CalcState {
  entryPrice: number;
  dealPrice: number;
  shares: number;
  leverage: number;
  daysToClose: number;
  breakProbability: number;
  breakPrice: number;
}

// ── Data Generation ───────────────────────────────────────────────────────────

const ACQUIRERS = [
  { name: "Microsoft Corp", ticker: "MSFT" },
  { name: "Alphabet Inc", ticker: "GOOGL" },
  { name: "Amazon.com Inc", ticker: "AMZN" },
  { name: "Berkshire Hathaway", ticker: "BRK.B" },
  { name: "JPMorgan Chase", ticker: "JPM" },
  { name: "Pfizer Inc", ticker: "PFE" },
];

const TARGETS = [
  { name: "Activision Blizzard", ticker: "ATVI" },
  { name: "Pioneer Natural Res", ticker: "PXD" },
  { name: "iRobot Corp", ticker: "IRBT" },
  { name: "Albertsons Cos", ticker: "ACI" },
  { name: "Horizon Therapeutics", ticker: "HZNP" },
  { name: "Seagen Inc", ticker: "SGEN" },
];

const STATUSES: DealStatus[] = ["Pending", "Announced", "Voted", "Regulatory"];
const DEAL_TYPES: Array<"Cash" | "Stock" | "Mixed"> = ["Cash", "Stock", "Mixed"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function generateDeals(): Deal[] {
  return ACQUIRERS.map((acq, i) => {
    const tgt = TARGETS[i];
    const dealPrice = Math.round(randBetween(40, 320) * 100) / 100;
    const spreadPct = randBetween(1.5, 8.5);
    const currentPrice = Math.round(dealPrice * (1 - spreadPct / 100) * 100) / 100;
    const spread = Math.round((dealPrice - currentPrice) * 100) / 100;
    const impliedProbability = Math.round(randBetween(55, 97));
    const daysToClose = randInt(30, 280);
    const annualizedReturn = Math.round(((spread / currentPrice) * (365 / daysToClose)) * 10000) / 100;
    const closeMonthIdx = randInt(0, 11);
    const closeYear = daysToClose > 180 ? 2027 : 2026;

    return {
      id: `deal-${i}`,
      acquirer: acq.name,
      acquirerTicker: acq.ticker,
      target: tgt.name,
      targetTicker: tgt.ticker,
      dealPrice,
      currentPrice,
      spread,
      spreadPct: Math.round(spreadPct * 100) / 100,
      impliedProbability,
      closeDate: `${MONTH_NAMES[closeMonthIdx]} ${closeYear}`,
      dealSize: Math.round(randBetween(2, 75) * 10) / 10,
      status: STATUSES[randInt(0, 3)],
      dealType: DEAL_TYPES[randInt(0, 2)],
      annualizedReturn,
      daysToClose,
    };
  });
}

function getSpreadBreakdown(deal: Deal): SpreadBreakdown {
  // Deterministic per-deal breakdown using deal-specific local seed
  let ls = Math.round(deal.spreadPct * 1000 + deal.daysToClose * 7 + 972);
  const lr = () => {
    ls = (ls * 1103515245 + 12345) & 0x7fffffff;
    return ls / 0x7fffffff;
  };
  const total = deal.spreadPct;
  const financingCost = Math.round((0.3 + lr() * 0.6) * 100) / 100;
  const timeValue = Math.round((0.2 + lr() * 0.6) * 100) / 100;
  const raw = total - financingCost - timeValue;
  const dealRiskPremium = Math.round(Math.max(0.1, raw) * 100) / 100;
  return { dealRiskPremium, timeValue, financingCost, total };
}

function generatePortfolioHistory(): PortfolioPoint[] {
  const histMonths = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  let arbCum = 0;
  let sp500Cum = 0;
  return histMonths.map((month) => {
    arbCum += randBetween(-0.5, 1.8);
    sp500Cum += randBetween(-3.5, 4.5);
    return {
      month,
      arbReturn: Math.round(arbCum * 100) / 100,
      sp500Return: Math.round(sp500Cum * 100) / 100,
    };
  });
}

const DEALS = generateDeals();
const PORTFOLIO_HISTORY = generatePortfolioHistory();

// ── Helper Components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DealStatus }) {
  const config: Record<DealStatus, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
    Pending: { variant: "secondary" },
    Announced: { variant: "default" },
    Voted: { variant: "outline" },
    Regulatory: { variant: "destructive" },
  };
  return <Badge variant={config[status].variant}>{status}</Badge>;
}

function ProbabilityBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-emerald-500" : value >= 65 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-foreground/10">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{value}%</span>
    </div>
  );
}

// ── Deal Dashboard ────────────────────────────────────────────────────────────

function DealDashboard({
  deals,
  selectedId,
  onSelect,
}: {
  deals: Deal[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
            <th className="text-left py-3 px-3 font-medium">Target</th>
            <th className="text-left py-3 px-3 font-medium">Acquirer</th>
            <th className="text-right py-3 px-3 font-medium">Deal $</th>
            <th className="text-right py-3 px-3 font-medium">Current $</th>
            <th className="text-right py-3 px-3 font-medium">Spread</th>
            <th className="text-right py-3 px-3 font-medium">Ann. Return</th>
            <th className="py-3 px-3 font-medium">Prob.</th>
            <th className="text-left py-3 px-3 font-medium">Close</th>
            <th className="text-left py-3 px-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr
              key={deal.id}
              onClick={() => onSelect(deal.id)}
              className={cn(
                "border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/30",
                selectedId === deal.id && "bg-primary/10 hover:bg-primary/15"
              )}
            >
              <td className="py-3 px-3">
                <div className="font-medium text-foreground">{deal.target}</div>
                <div className="text-xs text-muted-foreground">{deal.targetTicker}</div>
              </td>
              <td className="py-3 px-3">
                <div className="text-muted-foreground">{deal.acquirer}</div>
                <div className="text-xs text-muted-foreground">{deal.dealType}</div>
              </td>
              <td className="py-3 px-3 text-right font-mono text-foreground">${deal.dealPrice.toFixed(2)}</td>
              <td className="py-3 px-3 text-right font-mono text-muted-foreground">${deal.currentPrice.toFixed(2)}</td>
              <td className="py-3 px-3 text-right">
                <span className="text-emerald-400 font-mono">+{deal.spreadPct}%</span>
              </td>
              <td className="py-3 px-3 text-right">
                <span
                  className={cn(
                    "font-mono font-medium",
                    deal.annualizedReturn > 10
                      ? "text-emerald-400"
                      : deal.annualizedReturn > 5
                      ? "text-amber-400"
                      : "text-muted-foreground"
                  )}
                >
                  {deal.annualizedReturn.toFixed(1)}%
                </span>
              </td>
              <td className="py-3 px-3 min-w-[120px]">
                <ProbabilityBar value={deal.impliedProbability} />
              </td>
              <td className="py-3 px-3 text-muted-foreground text-xs whitespace-nowrap">{deal.closeDate}</td>
              <td className="py-3 px-3">
                <StatusBadge status={deal.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Spread Decomposition ──────────────────────────────────────────────────────

function SpreadDecomposition({ deal }: { deal: Deal }) {
  const breakdown = useMemo(() => getSpreadBreakdown(deal), [deal]);

  const bars: Array<{ label: string; value: number; color: string; desc: string }> = [
    {
      label: "Deal Risk Premium",
      value: breakdown.dealRiskPremium,
      color: "bg-primary",
      desc: "Compensation for the risk the deal fails to close",
    },
    {
      label: "Time Value",
      value: breakdown.timeValue,
      color: "bg-primary",
      desc: "Opportunity cost of capital locked until close date",
    },
    {
      label: "Financing Cost",
      value: breakdown.financingCost,
      color: "bg-amber-500",
      desc: "Cost of borrowing or margin to fund the position",
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />
          Spread Decomposition — {deal.targetTicker}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-2xl font-bold text-foreground tabular-nums">
          +{breakdown.total.toFixed(2)}%
          <span className="text-sm font-normal text-muted-foreground ml-2">total spread</span>
        </div>

        {bars.map((bar) => (
          <div key={bar.label} className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-muted-foreground">{bar.label}</span>
              <span className="text-foreground font-mono">{bar.value.toFixed(2)}%</span>
            </div>
            <div className="h-2 rounded-full bg-foreground/10">
              <div
                className={cn("h-full rounded-full", bar.color)}
                style={{ width: `${Math.min(100, (bar.value / breakdown.total) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">{bar.desc}</div>
          </div>
        ))}

        <div className="pt-2 border-t border-border grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Days to Close</div>
            <div className="text-foreground font-mono">{deal.daysToClose}d</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Ann. Return</div>
            <div className="text-emerald-400 font-mono">{deal.annualizedReturn.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Deal Size</div>
            <div className="text-foreground font-mono">${deal.dealSize}B</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Structure</div>
            <div className="text-muted-foreground">{deal.dealType}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Deal Risk Matrix SVG ──────────────────────────────────────────────────────

function DealRiskMatrix({ deals }: { deals: Deal[] }) {
  const W = 480;
  const H = 320;
  const PAD = { top: 20, right: 20, bottom: 50, left: 55 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const minX = 50;
  const maxX = 100;
  const minY = 0;
  const rawMaxY = Math.max(...deals.map((d) => d.annualizedReturn));
  const maxY = rawMaxY + 5;
  const minSize = 4;
  const maxSize = 24;
  const minDeal = Math.min(...deals.map((d) => d.dealSize));
  const maxDeal = Math.max(...deals.map((d) => d.dealSize));

  function toX(prob: number): number {
    return PAD.left + ((prob - minX) / (maxX - minX)) * plotW;
  }
  function toY(ret: number): number {
    return PAD.top + plotH - ((ret - minY) / (maxY - minY)) * plotH;
  }
  function toR(size: number): number {
    if (maxDeal === minDeal) return (minSize + maxSize) / 2;
    return minSize + ((size - minDeal) / (maxDeal - minDeal)) * (maxSize - minSize);
  }

  const xTicks = [55, 65, 75, 85, 95];
  const yTicks = [0, 5, 10, 15, 20, 25].filter((t) => t <= maxY + 2);
  const BUBBLE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
          Deal Risk Matrix
          <span className="text-xs text-muted-foreground font-normal ml-1">(bubble size = deal size $B)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 280 }}>
          {yTicks.map((t) => (
            <line
              key={`gy-${t}`}
              x1={PAD.left}
              y1={toY(t)}
              x2={PAD.left + plotW}
              y2={toY(t)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}
          {xTicks.map((t) => (
            <line
              key={`gx-${t}`}
              x1={toX(t)}
              y1={PAD.top}
              x2={toX(t)}
              y2={PAD.top + plotH}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}
          <line
            x1={PAD.left}
            y1={PAD.top}
            x2={PAD.left}
            y2={PAD.top + plotH}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
          />
          <line
            x1={PAD.left}
            y1={PAD.top + plotH}
            x2={PAD.left + plotW}
            y2={PAD.top + plotH}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
          />
          {yTicks.map((t) => (
            <text key={`yt-${t}`} x={PAD.left - 8} y={toY(t) + 4} textAnchor="end" fill="#71717a" fontSize={10}>
              {t}%
            </text>
          ))}
          {xTicks.map((t) => (
            <text key={`xt-${t}`} x={toX(t)} y={PAD.top + plotH + 16} textAnchor="middle" fill="#71717a" fontSize={10}>
              {t}%
            </text>
          ))}
          <text x={PAD.left + plotW / 2} y={H - 4} textAnchor="middle" fill="#a1a1aa" fontSize={11}>
            Probability of Completion
          </text>
          <text
            x={14}
            y={PAD.top + plotH / 2}
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize={11}
            transform={`rotate(-90, 14, ${PAD.top + plotH / 2})`}
          >
            Ann. Return (%)
          </text>
          {deals.map((deal, i) => {
            const cx = toX(deal.impliedProbability);
            const cy = toY(deal.annualizedReturn);
            const r = toR(deal.dealSize);
            const color = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
            return (
              <g key={deal.id}>
                <circle cx={cx} cy={cy} r={r + 4} fill={color} opacity={0.12} />
                <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.85} />
                <text x={cx} y={cy - r - 4} textAnchor="middle" fill="#e4e4e7" fontSize={9}>
                  {deal.targetTicker}
                </text>
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}

// ── Historical Performance SVG ────────────────────────────────────────────────

function HistoricalPerformance({ history }: { history: PortfolioPoint[] }) {
  const W = 560;
  const H = 280;
  const PAD = { top: 20, right: 20, bottom: 44, left: 55 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const allVals = history.flatMap((p) => [p.arbReturn, p.sp500Return]);
  const minY = Math.min(...allVals) - 2;
  const maxY = Math.max(...allVals) + 2;
  const n = history.length;

  function toX(i: number): number {
    return PAD.left + (i / (n - 1)) * plotW;
  }
  function toY(v: number): number {
    return PAD.top + plotH - ((v - minY) / (maxY - minY)) * plotH;
  }
  function makePath(vals: number[]): string {
    return vals.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  }

  const yTicks = [-10, -5, 0, 5, 10, 15, 20].filter((t) => t >= minY && t <= maxY);
  const arbPath = makePath(history.map((p) => p.arbReturn));
  const spPath = makePath(history.map((p) => p.sp500Return));
  const lastArb = history[history.length - 1].arbReturn;
  const lastSp = history[history.length - 1].sp500Return;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Historical Performance — Last 12 Months
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-5 h-0.5 bg-emerald-500 rounded" />
            Merger Arb Portfolio
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-5 h-0.5 bg-primary rounded" />
            S&amp;P 500
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 240 }}>
          {yTicks.map((t) => (
            <line
              key={`gy-${t}`}
              x1={PAD.left}
              y1={toY(t)}
              x2={PAD.left + plotW}
              y2={toY(t)}
              stroke={t === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"}
              strokeWidth={t === 0 ? 1.5 : 1}
            />
          ))}
          {yTicks.map((t) => (
            <text key={`yt-${t}`} x={PAD.left - 8} y={toY(t) + 4} textAnchor="end" fill="#71717a" fontSize={10}>
              {t}%
            </text>
          ))}
          {history.map((p, i) =>
            i % 2 === 0 ? (
              <text key={`xt-${i}`} x={toX(i)} y={PAD.top + plotH + 16} textAnchor="middle" fill="#71717a" fontSize={10}>
                {p.month}
              </text>
            ) : null
          )}
          <path
            d={`${spPath} L${toX(n - 1).toFixed(1)},${toY(minY).toFixed(1)} L${toX(0).toFixed(1)},${toY(minY).toFixed(1)} Z`}
            fill="#3b82f6"
            opacity={0.05}
          />
          <path
            d={`${arbPath} L${toX(n - 1).toFixed(1)},${toY(minY).toFixed(1)} L${toX(0).toFixed(1)},${toY(minY).toFixed(1)} Z`}
            fill="#10b981"
            opacity={0.07}
          />
          <path d={spPath} fill="none" stroke="#3b82f6" strokeWidth={1.5} opacity={0.7} />
          <path d={arbPath} fill="none" stroke="#10b981" strokeWidth={2} />
          {history.map((p, i) => (
            <circle key={`dot-${i}`} cx={toX(i)} cy={toY(p.arbReturn)} r={3} fill="#10b981" />
          ))}
        </svg>
        <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border text-center">
          <div>
            <div className="text-xs text-muted-foreground">Arb YTD Return</div>
            <div className="text-emerald-400 font-mono font-bold">
              {lastArb > 0 ? "+" : ""}{lastArb.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">S&amp;P 500 YTD</div>
            <div className={cn("font-mono font-medium", lastSp >= 0 ? "text-primary" : "text-red-400")}>
              {lastSp > 0 ? "+" : ""}{lastSp.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
            <div className="text-foreground font-mono font-medium">1.42</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Risk Factors Panel ────────────────────────────────────────────────────────

interface RiskFactorData {
  id: string;
  label: string;
  description: string;
  severity: "Low" | "Medium" | "High";
}

const RISK_FACTORS: RiskFactorData[] = [
  {
    id: "regulatory",
    label: "Regulatory Risk",
    severity: "High",
    description:
      "Government agencies (FTC, DOJ, EU Commission) may block deals on antitrust grounds. Large tech and healthcare mergers face heightened scrutiny. In 2023, ~8% of announced deals were blocked or abandoned due to regulatory opposition.",
  },
  {
    id: "antitrust",
    label: "Antitrust / Competition",
    severity: "High",
    description:
      "Horizontal mergers between direct competitors face the highest scrutiny. Regulators assess market concentration via the Herfindahl–Hirschman Index (HHI). A post-merger HHI above 2500 with a delta of 200+ triggers detailed review.",
  },
  {
    id: "financing",
    label: "Financing Risk",
    severity: "Medium",
    description:
      "Leveraged buyouts and large cash deals rely on debt financing. Rising rates or credit market stress can cause acquirers to invoke Material Adverse Change (MAC) clauses. Commitment letters typically expire after 12–18 months.",
  },
  {
    id: "shareholder",
    label: "Shareholder Vote Risk",
    severity: "Medium",
    description:
      "Both boards must approve; target shareholders vote on the deal. Activist investors may oppose, demanding a higher premium. Proxy advisory firms (ISS, Glass Lewis) carry significant influence over institutional votes.",
  },
  {
    id: "market",
    label: "Market / Break Risk",
    severity: "Medium",
    description:
      "A deal break causes the target stock to fall 20–40% to pre-announcement levels. Historically ~5% of announced M&A deals break. Break risk is the primary driver of the spread and the arb return.",
  },
  {
    id: "timeline",
    label: "Timeline Extension",
    severity: "Low",
    description:
      "Deals frequently take longer than announced due to regulatory review, data room issues, or integration planning delays. Extended timelines reduce annualized returns. Arb desks monitor SEC filings for amendment notices.",
  },
];

const SEVERITY_CONFIG: Record<"Low" | "Medium" | "High", { bg: string; text: string }> = {
  High: { bg: "bg-red-500/15", text: "text-red-400" },
  Medium: { bg: "bg-amber-500/15", text: "text-amber-400" },
  Low: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
};

function RiskFactorsPanel() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          Risk Factors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {RISK_FACTORS.map((rf) => {
          const isOpen = openId === rf.id;
          const sc = SEVERITY_CONFIG[rf.severity];
          return (
            <div key={rf.id} className="rounded-lg border border-border/50 overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : rf.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {rf.severity === "High" ? (
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  ) : rf.severity === "Medium" ? (
                    <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                  <span className="text-sm text-foreground">{rf.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs text-muted-foreground px-2 py-0.5 rounded-full font-medium", sc.bg, sc.text)}>
                    {rf.severity}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pb-3"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">{rf.description}</p>
                </motion.div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ── Arbitrage Calculator ──────────────────────────────────────────────────────

function ArbitrageCalculator() {
  const [calc, setCalc] = useState<CalcState>({
    entryPrice: 95.5,
    dealPrice: 100.0,
    shares: 1000,
    leverage: 1.0,
    daysToClose: 90,
    breakProbability: 10,
    breakPrice: 72.0,
  });

  function update(key: keyof CalcState, value: string): void {
    const num = parseFloat(value);
    if (!isNaN(num)) setCalc((prev) => ({ ...prev, [key]: num }));
  }

  const spreadPerShare = calc.dealPrice - calc.entryPrice;
  const capitalDeployed = calc.entryPrice * calc.shares * calc.leverage;
  const grossPnL = spreadPerShare * calc.shares * calc.leverage;
  const spreadPct = (spreadPerShare / calc.entryPrice) * 100;
  const annualizedReturn = spreadPct * (365 / calc.daysToClose);
  const breakLoss = (calc.breakPrice - calc.entryPrice) * calc.shares * calc.leverage;
  const probSuccess = (100 - calc.breakProbability) / 100;
  const probBreak = calc.breakProbability / 100;
  const expectedValue = probSuccess * grossPnL + probBreak * breakLoss;
  const rrRatio = Math.abs(grossPnL) / Math.max(0.01, Math.abs(breakLoss));

  const inputClass =
    "w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50 transition-colors";
  const labelClass = "text-xs text-muted-foreground mb-1 block";

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Calculator className="w-3.5 h-3.5 text-muted-foreground/50" />
          Arbitrage Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div>
            <label className={labelClass}>Entry Price ($)</label>
            <input
              type="number"
              value={calc.entryPrice}
              onChange={(e) => update("entryPrice", e.target.value)}
              className={inputClass}
              step={0.01}
            />
          </div>
          <div>
            <label className={labelClass}>Deal Price ($)</label>
            <input
              type="number"
              value={calc.dealPrice}
              onChange={(e) => update("dealPrice", e.target.value)}
              className={inputClass}
              step={0.01}
            />
          </div>
          <div>
            <label className={labelClass}>Shares</label>
            <input
              type="number"
              value={calc.shares}
              onChange={(e) => update("shares", e.target.value)}
              className={inputClass}
              step={100}
            />
          </div>
          <div>
            <label className={labelClass}>Leverage (x)</label>
            <input
              type="number"
              value={calc.leverage}
              onChange={(e) => update("leverage", e.target.value)}
              className={inputClass}
              step={0.1}
              min={1}
              max={5}
            />
          </div>
          <div>
            <label className={labelClass}>Days to Close</label>
            <input
              type="number"
              value={calc.daysToClose}
              onChange={(e) => update("daysToClose", e.target.value)}
              className={inputClass}
              step={1}
            />
          </div>
          <div>
            <label className={labelClass}>Break Probability (%)</label>
            <input
              type="number"
              value={calc.breakProbability}
              onChange={(e) => update("breakProbability", e.target.value)}
              className={inputClass}
              step={1}
              min={0}
              max={100}
            />
          </div>
          <div>
            <label className={labelClass}>Break-Down Price ($)</label>
            <input
              type="number"
              value={calc.breakPrice}
              onChange={(e) => update("breakPrice", e.target.value)}
              className={inputClass}
              step={0.5}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-muted/60 rounded-md p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Gross P&amp;L</div>
            <div className={cn("text-xl font-medium font-mono", grossPnL >= 0 ? "text-emerald-400" : "text-red-400")}>
              {grossPnL >= 0 ? "+" : ""}${grossPnL.toFixed(0)}
            </div>
          </div>
          <div className="bg-muted/60 rounded-md p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Ann. Return</div>
            <div className="text-xl font-medium font-mono text-primary">{annualizedReturn.toFixed(1)}%</div>
          </div>
          <div className="bg-muted/60 rounded-md p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Expected Value</div>
            <div className={cn("text-xl font-medium font-mono", expectedValue >= 0 ? "text-foreground" : "text-red-400")}>
              {expectedValue >= 0 ? "+" : ""}${expectedValue.toFixed(0)}
            </div>
          </div>
          <div className="bg-muted/60 rounded-md p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Reward / Risk</div>
            <div className={cn("text-xl font-medium font-mono", rrRatio >= 1 ? "text-emerald-400" : "text-amber-400")}>
              {rrRatio.toFixed(2)}x
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm border-t border-border pt-4">
          <div>
            <div className="text-xs text-muted-foreground">Capital Deployed</div>
            <div className="text-muted-foreground font-mono">${capitalDeployed.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Spread</div>
            <div className="text-emerald-400 font-mono">
              ${spreadPerShare.toFixed(2)} ({spreadPct.toFixed(2)}%)
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Max Break Loss</div>
            <div className="text-red-400 font-mono">${breakLoss.toFixed(0)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Summary Stats Bar ─────────────────────────────────────────────────────────

function SummaryStats({ deals }: { deals: Deal[] }) {
  const avgSpread = deals.reduce((a, d) => a + d.spreadPct, 0) / deals.length;
  const avgProb = deals.reduce((a, d) => a + d.impliedProbability, 0) / deals.length;
  const totalSize = deals.reduce((a, d) => a + d.dealSize, 0);
  const avgAnn = deals.reduce((a, d) => a + d.annualizedReturn, 0) / deals.length;

  const stats: Array<{ label: string; value: string; icon: React.ReactNode; color: string }> = [
    {
      label: "Active Deals",
      value: String(deals.length),
      icon: <Activity className="w-4 h-4" />,
      color: "text-primary",
    },
    {
      label: "Avg Spread",
      value: `${avgSpread.toFixed(2)}%`,
      icon: <Percent className="w-4 h-4" />,
      color: "text-emerald-400",
    },
    {
      label: "Avg Probability",
      value: `${avgProb.toFixed(0)}%`,
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "text-primary",
    },
    {
      label: "Total Deal Value",
      value: `$${totalSize.toFixed(0)}B`,
      icon: <DollarSign className="w-4 h-4" />,
      color: "text-amber-400",
    },
    {
      label: "Avg Ann. Return",
      value: `${avgAnn.toFixed(1)}%`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="pt-4 pb-3">
            <div className={cn("mb-1", stat.color)}>{stat.icon}</div>
            <div className={cn("text-xl font-medium font-mono", stat.color)}>{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MergerArbPage() {
  const [selectedDealId, setSelectedDealId] = useState<string | null>(DEALS[0].id);

  const selectedDeal = useMemo(
    () => DEALS.find((d) => d.id === selectedDealId) ?? DEALS[0],
    [selectedDealId]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground p-4 md:p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium text-foreground flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-primary" />
            Merger Arbitrage
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Exploit acquisition spreads — earn returns by positioning in announced M&amp;A deals
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-xs border-emerald-500/40 text-emerald-400 self-start sm:self-auto"
        >
          <Clock className="w-3 h-3 mr-1" />
          Live Data Simulation
        </Badge>
      </div>

      {/* Summary stats — Hero */}
      <div className="rounded-md border border-border bg-card border-l-4 border-l-primary p-6">
        <SummaryStats deals={DEALS} />
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="dashboard" className="mt-8">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-muted text-xs text-muted-foreground sm:text-sm">
            Deal Dashboard
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-muted text-xs text-muted-foreground sm:text-sm">
            Analysis
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-muted text-xs text-muted-foreground sm:text-sm">
            Risk Factors
          </TabsTrigger>
          <TabsTrigger value="calculator" className="data-[state=active]:bg-muted text-xs text-muted-foreground sm:text-sm">
            Calculator
          </TabsTrigger>
        </TabsList>

        {/* Tab: Dashboard */}
        <TabsContent value="dashboard" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
                Active Deals
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  — click a row to analyze spread
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DealDashboard
                deals={DEALS}
                selectedId={selectedDealId}
                onSelect={setSelectedDealId}
              />
            </CardContent>
          </Card>

          {selectedDeal && (
            <motion.div
              key={selectedDeal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SpreadDecomposition deal={selectedDeal} />
            </motion.div>
          )}
        </TabsContent>

        {/* Tab: Analysis */}
        <TabsContent value="analysis" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DealRiskMatrix deals={DEALS} />
            <HistoricalPerformance history={PORTFOLIO_HISTORY} />
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />
                Deal Metrics Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-muted-foreground">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border text-left">
                      <th className="py-2 pr-4 font-medium">Target</th>
                      <th className="py-2 pr-4 font-medium text-right">Spread</th>
                      <th className="py-2 pr-4 font-medium text-right">Ann. Ret.</th>
                      <th className="py-2 pr-4 font-medium text-right">Impl. Prob.</th>
                      <th className="py-2 pr-4 font-medium text-right">Deal Size</th>
                      <th className="py-2 pr-4 font-medium text-right">Days Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEALS.map((d) => (
                      <tr key={d.id} className="border-b border-border/50">
                        <td className="py-2 pr-4 text-foreground font-medium">{d.targetTicker}</td>
                        <td className="py-2 pr-4 text-right text-emerald-400 font-mono">
                          +{d.spreadPct}%
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-primary">
                          {d.annualizedReturn.toFixed(1)}%
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-muted-foreground">
                          {d.impliedProbability}%
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-muted-foreground">
                          ${d.dealSize}B
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-muted-foreground">
                          {d.daysToClose}d
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Risk Factors */}
        <TabsContent value="risk" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <RiskFactorsPanel />

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
                Merger Arbitrage Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div>
                <div className="text-foreground font-medium mb-1">What is Merger Arbitrage?</div>
                <p>
                  Merger arbitrage (risk arbitrage) is an event-driven strategy that profits from the
                  spread between a target company&apos;s current trading price and the announced acquisition
                  price. When a deal is announced, the target stock trades at a discount to the deal price
                  — the &quot;spread&quot; — representing the market&apos;s assessment of completion risk.
                </p>
              </div>
              <div>
                <div className="text-foreground font-medium mb-1">The Spread Formula</div>
                <p>
                  <span className="text-emerald-400 font-mono">
                    Spread = Deal Price - Current Price
                  </span>
                  . Annualized return is computed as{" "}
                  <span className="text-primary font-mono">
                    (Spread / Current Price) * (365 / Days to Close)
                  </span>
                  . A wider spread signals higher market-perceived risk.
                </p>
              </div>
              <div>
                <div className="text-foreground font-medium mb-1">Implied Probability</div>
                <p>
                  Assuming a deal closes at deal price or breaks to a pre-announcement level, implied
                  probability is back-solved:{" "}
                  <span className="text-primary font-mono">
                    P = (Current - Break) / (Deal - Break)
                  </span>
                  .
                </p>
              </div>
              <div>
                <div className="text-foreground font-medium mb-1">Portfolio Construction</div>
                <p>
                  Arb desks diversify across 15–25 deals simultaneously to reduce single-deal break risk.
                  Position sizing is driven by conviction (spread width, regulatory clarity) and
                  correlation between deals in the same sector — regulatory waves can affect multiple
                  deals simultaneously.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Calculator */}
        <TabsContent value="calculator" className="data-[state=inactive]:hidden mt-4">
          <ArbitrageCalculator />
        </TabsContent>
      </Tabs>

      {/* Quick-select deal buttons */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4">
          <div className="text-xs text-muted-foreground mb-3">Quick Select Deal for Spread Analysis:</div>
          <div className="flex flex-wrap gap-2">
            {DEALS.map((deal) => (
              <Button
                key={deal.id}
                variant={selectedDealId === deal.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDealId(deal.id)}
                className="text-xs text-muted-foreground"
              >
                {deal.targetTicker}
                <span
                  className={cn(
                    "ml-1.5 text-xs text-muted-foreground",
                    selectedDealId === deal.id ? "text-foreground/80" : "text-emerald-400"
                  )}
                >
                  +{deal.spreadPct}%
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
