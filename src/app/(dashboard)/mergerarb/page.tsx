"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calculator,
  BarChart2,
  Shield,
  Layers,
  DollarSign,
  Info,
  ChevronRight,
  Target,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Seeded PRNG (seed 811) ────────────────────────────────────────────────────
let s = 811;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

type DealType = "Cash" | "Stock" | "Mixed";
type RegulatoryRisk = "Low" | "Medium" | "High";
type DealStatus = "Pending" | "Approved" | "At Risk";

interface Deal {
  id: string;
  acquirer: string;
  target: string;
  dealPrice: number;
  currentPrice: number;
  spreadPct: number;
  annualizedReturn: number;
  daysToClose: number;
  dealType: DealType;
  closeDate: string;
  regulatoryRisk: RegulatoryRisk;
  status: DealStatus;
  dealSize: number; // $ billions
  breakProbability: number; // 0-1
  sector: string;
  description: string;
}

interface PortfolioPosition {
  dealId: string;
  weight: number; // 0-1
  entrySpread: number;
  currentSpread: number;
  pnl: number; // $ thousands
  daysHeld: number;
}

// ── Generate Deals with PRNG ──────────────────────────────────────────────────

const DEAL_DATA: Array<{
  acquirer: string;
  target: string;
  dealType: DealType;
  sector: string;
  description: string;
}> = [
  {
    acquirer: "SkyTech Corp",
    target: "DataStream Inc",
    dealType: "Cash",
    sector: "Technology",
    description: "All-cash acquisition to expand cloud infrastructure",
  },
  {
    acquirer: "MedGiant Holdings",
    target: "BioSync Labs",
    dealType: "Cash",
    sector: "Healthcare",
    description: "Strategic buyout to acquire oncology pipeline",
  },
  {
    acquirer: "NorthStar Energy",
    target: "GreenPower Co",
    dealType: "Stock",
    sector: "Energy",
    description: "All-stock merger to combine renewable portfolios",
  },
  {
    acquirer: "FinCore Bank",
    target: "CreditPlus Corp",
    dealType: "Mixed",
    sector: "Financials",
    description: "Cash-and-stock deal pending Fed approval",
  },
  {
    acquirer: "GlobalRetail Inc",
    target: "ShopDirect Ltd",
    dealType: "Cash",
    sector: "Consumer",
    description: "Premium cash offer for e-commerce platform",
  },
  {
    acquirer: "AeroSpace Systems",
    target: "OrbitalTech",
    dealType: "Mixed",
    sector: "Defense",
    description: "Mixed consideration deal, DOJ review ongoing",
  },
];

const CLOSE_MONTHS = [2, 3, 4, 5, 6, 8];
const REGULATORY_RISKS: RegulatoryRisk[] = ["Low", "Medium", "High", "Medium", "Low", "High"];
const STATUSES: DealStatus[] = ["Pending", "Approved", "Pending", "At Risk", "Approved", "Pending"];

function generateDeals(): Deal[] {
  return DEAL_DATA.map((d, i) => {
    const dealPrice = 20 + Math.floor(rand() * 180);
    const spreadBps = 50 + Math.floor(rand() * 350); // 0.5% - 4%
    const spreadPct = spreadBps / 100;
    const currentPrice = +(dealPrice / (1 + spreadPct / 100)).toFixed(2);
    const daysToClose = CLOSE_MONTHS[i] * 30 + Math.floor(rand() * 15);
    const annualizedReturn = +((spreadPct * 365) / daysToClose).toFixed(1);
    const dealSize = +(1 + rand() * 49).toFixed(1);
    const breakProb = REGULATORY_RISKS[i] === "High"
      ? 0.1 + rand() * 0.15
      : REGULATORY_RISKS[i] === "Medium"
      ? 0.04 + rand() * 0.06
      : 0.01 + rand() * 0.03;

    const now = new Date(2026, 2, 28); // March 28, 2026
    const closeDate = new Date(now.getTime() + daysToClose * 86400000);
    const closeDateStr = closeDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return {
      id: `deal-${i}`,
      acquirer: d.acquirer,
      target: d.target,
      dealPrice,
      currentPrice,
      spreadPct: +spreadPct.toFixed(2),
      annualizedReturn,
      daysToClose,
      dealType: d.dealType,
      closeDate: closeDateStr,
      regulatoryRisk: REGULATORY_RISKS[i],
      status: STATUSES[i],
      dealSize,
      breakProbability: +breakProb.toFixed(4),
      sector: d.sector,
      description: d.description,
    };
  });
}

// Generate spread history (90 days) for a deal
function generateSpreadHistory(deal: Deal): Array<{ day: number; spread: number }> {
  let localS = deal.id.charCodeAt(5) * 1000 + 811;
  const localRand = () => {
    localS = (localS * 1103515245 + 12345) & 0x7fffffff;
    return localS / 0x7fffffff;
  };
  const history: Array<{ day: number; spread: number }> = [];
  let spread = deal.spreadPct * 1.5;
  for (let i = 0; i < 90; i++) {
    spread = Math.max(0.1, spread + (localRand() - 0.52) * 0.15);
    history.push({ day: i, spread: +spread.toFixed(3) });
  }
  // Force last point to current spread
  history[89].spread = deal.spreadPct;
  return history;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const DEALS = generateDeals();

const PORTFOLIO_POSITIONS: PortfolioPosition[] = DEALS.slice(0, 5).map((deal, i) => {
  const weights = [0.25, 0.20, 0.20, 0.15, 0.20];
  const entrySpread = +(deal.spreadPct * (1 + (rand() - 0.5) * 0.3)).toFixed(2);
  const daysHeld = 10 + Math.floor(rand() * 40);
  const pnlDirection = deal.status === "Approved" ? 1 : deal.status === "At Risk" ? -1 : (rand() > 0.4 ? 1 : -1);
  const pnlMag = +(rand() * 45 + 5).toFixed(1);
  return {
    dealId: deal.id,
    weight: weights[i],
    entrySpread,
    currentSpread: deal.spreadPct,
    pnl: +(pnlMag * pnlDirection),
    daysHeld,
  };
});

// Correlation matrix (5x5 — symmetric, diagonal = 1)
function generateCorrelation(): number[][] {
  const matrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else if (i < j) {
        matrix[i][j] = +(-0.1 + rand() * 0.5).toFixed(2);
      } else {
        matrix[i][j] = matrix[j][i];
      }
    }
  }
  return matrix;
}

const CORRELATION_MATRIX = generateCorrelation();

// ── Helper components ─────────────────────────────────────────────────────────

function RegulatoryBadge({ risk }: { risk: RegulatoryRisk }) {
  const colors = {
    Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    High: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", colors[risk])}>
      {risk}
    </span>
  );
}

function StatusBadge({ status }: { status: DealStatus }) {
  const colors = {
    Pending: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "At Risk": "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", colors[status])}>
      {status}
    </span>
  );
}

function DealTypeBadge({ type }: { type: DealType }) {
  const colors = {
    Cash: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    Stock: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    Mixed: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", colors[type])}>
      {type}
    </span>
  );
}

// ── Spread History SVG Chart ──────────────────────────────────────────────────

function SpreadHistoryChart({ deal }: { deal: Deal }) {
  const history = useMemo(() => generateSpreadHistory(deal), [deal]);

  const W = 520;
  const H = 160;
  const PAD = { top: 16, right: 24, bottom: 32, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const spreads = history.map((h) => h.spread);
  const minS = Math.min(...spreads) * 0.9;
  const maxS = Math.max(...spreads) * 1.1;

  const xScale = (day: number) => PAD.left + (day / 89) * chartW;
  const yScale = (v: number) => PAD.top + chartH - ((v - minS) / (maxS - minS)) * chartH;

  const linePath = history
    .map((h, i) => `${i === 0 ? "M" : "L"} ${xScale(h.day).toFixed(1)} ${yScale(h.spread).toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${xScale(89).toFixed(1)} ${(PAD.top + chartH).toFixed(1)} L ${xScale(0).toFixed(1)} ${(PAD.top + chartH).toFixed(1)} Z`;

  // Y-axis ticks
  const yTicks = [minS, (minS + maxS) / 2, maxS].map((v) => ({ v: +v.toFixed(2), y: yScale(v) }));
  // X-axis ticks
  const xTicks = [0, 30, 60, 89].map((d) => ({ d, x: xScale(d), label: d === 89 ? "Now" : `-${89 - d}d` }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <line
          key={i}
          x1={PAD.left}
          y1={t.y}
          x2={PAD.left + chartW}
          y2={t.y}
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="1"
        />
      ))}
      {/* Area */}
      <path d={areaPath} fill="url(#spreadGrad)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Y-axis labels */}
      {yTicks.map((t, i) => (
        <text
          key={i}
          x={PAD.left - 6}
          y={t.y + 4}
          textAnchor="end"
          fontSize="10"
          fill="currentColor"
          opacity="0.5"
        >
          {t.v.toFixed(2)}%
        </text>
      ))}
      {/* X-axis labels */}
      {xTicks.map((t, i) => (
        <text
          key={i}
          x={t.x}
          y={H - 6}
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
          opacity="0.5"
        >
          {t.label}
        </text>
      ))}
      {/* Current spread marker */}
      <circle cx={xScale(89)} cy={yScale(deal.spreadPct)} r="4" fill="#6366f1" />
      <line
        x1={xScale(89)}
        y1={PAD.top}
        x2={xScale(89)}
        y2={PAD.top + chartH}
        stroke="#6366f1"
        strokeWidth="1"
        strokeDasharray="3,3"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

// ── Scenario Tree SVG ─────────────────────────────────────────────────────────

function ScenarioTree({
  deal,
  breakProb,
}: {
  deal: Deal;
  breakProb: number;
}) {
  const closeProb = 1 - breakProb;
  const revisedProb = breakProb * 0.4; // subset — revised terms
  const trueBreakProb = breakProb * 0.6;

  const closeReturn = deal.spreadPct;
  const breakReturn = -((deal.dealPrice - deal.currentPrice) / deal.currentPrice) * 100 * 0.6; // typically falls 60% of premium
  const revisedReturn = deal.spreadPct * 0.4;

  const ev =
    closeProb * closeReturn +
    trueBreakProb * breakReturn +
    revisedProb * revisedReturn;

  const W = 400;
  const H = 160;

  const rootX = 60;
  const rootY = H / 2;
  const midX = 190;
  const rightX = 340;

  const branches = [
    { x: midX, y: 30, label: "Closes", prob: closeProb, ret: closeReturn, color: "#10b981" },
    { x: midX, y: rootY, label: "Revised", prob: revisedProb, ret: revisedReturn, color: "#f59e0b" },
    { x: midX, y: H - 30, label: "Breaks", prob: trueBreakProb, ret: breakReturn, color: "#ef4444" },
  ];

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {/* Root node */}
        <circle cx={rootX} cy={rootY} r="22" fill="#1e1e2e" stroke="#4f46e5" strokeWidth="2" />
        <text x={rootX} y={rootY - 5} textAnchor="middle" fontSize="9" fill="#a5b4fc">
          Current
        </text>
        <text x={rootX} y={rootY + 7} textAnchor="middle" fontSize="9" fill="#a5b4fc">
          Position
        </text>

        {branches.map((b, i) => (
          <g key={i}>
            {/* Lines */}
            <line
              x1={rootX + 22}
              y1={rootY}
              x2={b.x - 22}
              y2={b.y}
              stroke={b.color}
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />
            {/* Mid node */}
            <circle cx={b.x} cy={b.y} r="22" fill="#1e1e2e" stroke={b.color} strokeWidth="1.5" />
            <text x={b.x} y={b.y - 6} textAnchor="middle" fontSize="9" fill={b.color}>
              {b.label}
            </text>
            <text x={b.x} y={b.y + 5} textAnchor="middle" fontSize="9" fill={b.color}>
              {(b.prob * 100).toFixed(0)}%
            </text>
            {/* Right: return */}
            <line
              x1={b.x + 22}
              y1={b.y}
              x2={rightX - 4}
              y2={b.y}
              stroke={b.color}
              strokeWidth="1"
              strokeOpacity="0.4"
              strokeDasharray="3,2"
            />
            <text x={rightX} y={b.y + 4} textAnchor="middle" fontSize="10" fill={b.color} fontWeight="600">
              {b.ret > 0 ? "+" : ""}
              {b.ret.toFixed(1)}%
            </text>
          </g>
        ))}
      </svg>
      <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-muted/30 border border-border">
        <span className="text-sm text-muted-foreground">Expected Value (EV)</span>
        <span className={cn("text-lg font-bold", ev >= 0 ? "text-emerald-400" : "text-red-400")}>
          {ev >= 0 ? "+" : ""}
          {ev.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

// ── Correlation Heatmap SVG ───────────────────────────────────────────────────

function CorrelationHeatmap({ matrix, labels }: { matrix: number[][]; labels: string[] }) {
  const N = matrix.length;
  const CELL = 52;
  const LABEL_W = 80;
  const LABEL_H = 60;
  const W = LABEL_W + N * CELL;
  const H = LABEL_H + N * CELL;

  const colorForCorr = (v: number): string => {
    if (v >= 0.8) return "#6366f1";
    if (v >= 0.5) return "#818cf8";
    if (v >= 0.2) return "#a5b4fc";
    if (v >= 0) return "#c7d2fe";
    if (v >= -0.2) return "#fca5a5";
    if (v >= -0.5) return "#f87171";
    return "#ef4444";
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 320 }}>
      {/* Column labels */}
      {labels.map((label, j) => (
        <text
          key={j}
          x={LABEL_W + j * CELL + CELL / 2}
          y={LABEL_H - 8}
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
          opacity="0.7"
        >
          {label}
        </text>
      ))}
      {/* Row labels */}
      {labels.map((label, i) => (
        <text
          key={i}
          x={LABEL_W - 6}
          y={LABEL_H + i * CELL + CELL / 2 + 4}
          textAnchor="end"
          fontSize="10"
          fill="currentColor"
          opacity="0.7"
        >
          {label}
        </text>
      ))}
      {/* Cells */}
      {matrix.map((row, i) =>
        row.map((val, j) => {
          const x = LABEL_W + j * CELL;
          const y = LABEL_H + i * CELL;
          const bg = colorForCorr(val);
          return (
            <g key={`${i}-${j}`}>
              <rect
                x={x + 2}
                y={y + 2}
                width={CELL - 4}
                height={CELL - 4}
                rx="4"
                fill={bg}
                opacity={i === j ? 1 : 0.75}
              />
              <text
                x={x + CELL / 2}
                y={y + CELL / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={val > 0.3 || i === j ? "#fff" : "#1e1e2e"}
              >
                {val.toFixed(2)}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}

// ── Tab: Deal Monitor ─────────────────────────────────────────────────────────

function DealMonitor({
  deals,
  selectedDealId,
  onSelectDeal,
}: {
  deals: Deal[];
  selectedDealId: string | null;
  onSelectDeal: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Deals", value: deals.length, icon: Layers, color: "text-violet-400" },
          {
            label: "Avg Spread",
            value: `${(deals.reduce((a, d) => a + d.spreadPct, 0) / deals.length).toFixed(2)}%`,
            icon: Activity,
            color: "text-sky-400",
          },
          {
            label: "Avg Ann. Return",
            value: `${(deals.reduce((a, d) => a + d.annualizedReturn, 0) / deals.length).toFixed(1)}%`,
            icon: TrendingUp,
            color: "text-emerald-400",
          },
          {
            label: "Total Deal Size",
            value: `$${deals.reduce((a, d) => a + d.dealSize, 0).toFixed(0)}B`,
            icon: DollarSign,
            color: "text-amber-400",
          },
        ].map((item) => (
          <Card key={item.label} className="border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <item.icon className={cn("w-5 h-5 flex-shrink-0", item.color)} />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={cn("text-lg font-bold", item.color)}>{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deals table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Live M&amp;A Deal Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-4 py-2 text-left">Acquirer → Target</th>
                  <th className="px-4 py-2 text-right">Deal Price</th>
                  <th className="px-4 py-2 text-right">Current</th>
                  <th className="px-4 py-2 text-right">Spread</th>
                  <th className="px-4 py-2 text-right">Ann. Return</th>
                  <th className="px-4 py-2 text-center">Type</th>
                  <th className="px-4 py-2 text-center">Close</th>
                  <th className="px-4 py-2 text-center">Reg. Risk</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr
                    key={deal.id}
                    className={cn(
                      "border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors",
                      selectedDealId === deal.id && "bg-violet-500/10"
                    )}
                    onClick={() => onSelectDeal(deal.id)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{deal.acquirer}</p>
                        <p className="text-xs text-muted-foreground">→ {deal.target}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">${deal.dealPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono">${deal.currentPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-400 font-semibold">{deal.spreadPct.toFixed(2)}%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sky-400 font-semibold">{deal.annualizedReturn.toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DealTypeBadge type={deal.dealType} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-medium">{deal.closeDate}</span>
                        <span className="text-xs text-muted-foreground">{deal.daysToClose}d</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <RegulatoryBadge risk={deal.regulatoryRisk} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={deal.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ChevronRight className="w-4 h-4 text-muted-foreground mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Selected deal detail */}
      <AnimatePresence>
        {selectedDealId && (() => {
          const deal = deals.find((d) => d.id === selectedDealId);
          if (!deal) return null;
          return (
            <motion.div
              key={selectedDealId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-border bg-card border-violet-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Info className="w-4 h-4 text-violet-400" />
                    {deal.acquirer} / {deal.target} — Deal Detail
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Transaction</p>
                    <p>{deal.description}</p>
                    <p className="text-xs text-muted-foreground">Sector: {deal.sector} · Size: ${deal.dealSize}B</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Economics</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className="text-muted-foreground">Gross Spread</span>
                      <span className="text-right font-medium">{deal.spreadPct.toFixed(2)}%</span>
                      <span className="text-muted-foreground">Ann. Return</span>
                      <span className="text-right font-medium text-sky-400">{deal.annualizedReturn.toFixed(1)}%</span>
                      <span className="text-muted-foreground">Days to Close</span>
                      <span className="text-right font-medium">{deal.daysToClose}</span>
                      <span className="text-muted-foreground">Break Prob.</span>
                      <span className="text-right font-medium text-red-400">{(deal.breakProbability * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Risk</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Regulatory</span>
                        <RegulatoryBadge risk={deal.regulatoryRisk} />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Status</span>
                        <StatusBadge status={deal.status} />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Deal Type</span>
                        <DealTypeBadge type={deal.dealType} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

// ── Tab: Spread Analysis ──────────────────────────────────────────────────────

function SpreadAnalysis({ deals }: { deals: Deal[] }) {
  const [activeDealIndex, setActiveDealIndex] = useState(0);
  const deal = deals[activeDealIndex];

  const progressToClose = Math.max(0, Math.min(100, ((180 - deal.daysToClose) / 180) * 100));

  return (
    <div className="space-y-4">
      {/* Deal selector pills */}
      <div className="flex flex-wrap gap-2">
        {deals.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActiveDealIndex(i)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              activeDealIndex === i
                ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
            )}
          >
            {d.target}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Spread chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              90-Day Spread History — {deal.target}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpreadHistoryChart deal={deal} />
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="space-y-3">
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Spread</span>
                <span className="text-2xl font-bold text-emerald-400">{deal.spreadPct.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Annualized Return</span>
                <span className="text-xl font-bold text-sky-400">{deal.annualizedReturn.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days to Close</span>
                <span className="font-semibold">{deal.daysToClose} days</span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress to Close</span>
                  <span>{progressToClose.toFixed(0)}%</span>
                </div>
                <Progress value={progressToClose} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Ann. return formula breakdown */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" />
                Annualized Return Formula
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1 text-xs font-mono">
              <p className="text-muted-foreground">
                Spread = (${deal.dealPrice.toFixed(2)} - ${deal.currentPrice.toFixed(2)}) / ${deal.currentPrice.toFixed(2)}
              </p>
              <p className="text-foreground">= {deal.spreadPct.toFixed(4)}%</p>
              <p className="text-muted-foreground mt-1">
                Ann. = Spread × (365 / {deal.daysToClose})
              </p>
              <p className="text-sky-400 font-bold">= {deal.annualizedReturn.toFixed(2)}%</p>
            </CardContent>
          </Card>

          {/* Countdown */}
          <Card className="border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Expected Close</p>
                <p className="font-semibold">{deal.closeDate}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-foreground">Countdown</p>
                <p className="font-bold text-amber-400">{deal.daysToClose}d remaining</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Risk Model ───────────────────────────────────────────────────────────

function RiskModel({ deals }: { deals: Deal[] }) {
  const [activeDealIndex, setActiveDealIndex] = useState(0);
  const [breakProbPct, setBreakProbPct] = useState<number>(
    Math.round(deals[0].breakProbability * 1000) / 10
  );

  const deal = deals[activeDealIndex];

  // Update slider when deal changes
  const handleDealChange = (i: number) => {
    setActiveDealIndex(i);
    setBreakProbPct(Math.round(deals[i].breakProbability * 1000) / 10);
  };

  const breakProb = breakProbPct / 100;
  const closeProb = 1 - breakProb;

  // Kelly criterion: f* = (p*b - q) / b where b = R/R ratio
  const winReturn = deal.spreadPct / 100;
  const lossReturn = Math.abs(
    ((deal.dealPrice - deal.currentPrice) / deal.currentPrice) * 0.6
  );
  const kellyFraction = Math.max(
    0,
    (closeProb * winReturn - breakProb * lossReturn) / winReturn
  );
  const halfKelly = kellyFraction * 0.5;

  const ev =
    closeProb * deal.spreadPct +
    breakProb * 0.4 * (deal.spreadPct * 0.4) +
    breakProb * 0.6 * (-(deal.dealPrice - deal.currentPrice) / deal.currentPrice) * 100 * 0.6;

  return (
    <div className="space-y-4">
      {/* Deal pills */}
      <div className="flex flex-wrap gap-2">
        {deals.map((d, i) => (
          <button
            key={d.id}
            onClick={() => handleDealChange(i)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              activeDealIndex === i
                ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
            )}
          >
            {d.target}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Break probability slider + EV */}
        <div className="space-y-3">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                Deal Break Probability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Break Probability</span>
                <span className="text-2xl font-bold text-red-400">{breakProbPct.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={0.5}
                value={breakProbPct}
                onChange={(e) => setBreakProbPct(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0% (Certain Close)</span>
                <span>30% (High Risk)</span>
              </div>
              {/* Risk bands */}
              <div className="space-y-1 text-xs">
                {[
                  { label: "Safe", range: "0–3%", color: "bg-emerald-500" },
                  { label: "Normal", range: "3–8%", color: "bg-amber-500" },
                  { label: "Elevated", range: "8–15%", color: "bg-orange-500" },
                  { label: "High Risk", range: "15–30%", color: "bg-red-500" },
                ].map((band) => (
                  <div key={band.label} className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", band.color)} />
                    <span className="text-muted-foreground">{band.label}</span>
                    <span className="ml-auto text-muted-foreground">{band.range}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expected Value */}
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Value</p>
              <div className={cn("text-3xl font-bold", ev >= 0 ? "text-emerald-400" : "text-red-400")}>
                {ev >= 0 ? "+" : ""}
                {ev.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Close ({closeProb.toFixed(0)}%) × {deal.spreadPct.toFixed(2)}% + Break ({(breakProb * 100).toFixed(0)}%) × loss
              </p>
            </CardContent>
          </Card>

          {/* Kelly Criterion */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                Kelly Criterion Sizing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Kelly</span>
                <span className="font-bold text-amber-400">{(kellyFraction * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Half Kelly (recommended)</span>
                <span className="font-bold text-emerald-400">{(halfKelly * 100).toFixed(1)}%</span>
              </div>
              <Progress value={halfKelly * 100} className="h-2 mt-1" />
              <p className="text-xs text-muted-foreground">
                W/L ratio: {(winReturn / lossReturn).toFixed(2)}x · Half Kelly caps downside risk
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scenario tree */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-400" />
              Scenario Outcome Tree — {deal.target}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScenarioTree deal={deal} breakProb={breakProb} />
            <div className="mt-4 space-y-2 text-xs text-muted-foreground border-t border-border pt-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-emerald-400">Closes:</strong> Earn full spread ({deal.spreadPct.toFixed(2)}%) at deal close
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-amber-400">Revised:</strong> Lower consideration or extended timeline
                </p>
              </div>
              <div className="flex items-start gap-2">
                <TrendingDown className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-red-400">Breaks:</strong> Target typically falls 60% of premium
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab: Portfolio ─────────────────────────────────────────────────────────────

function Portfolio({ deals, positions }: { deals: Deal[]; positions: PortfolioPosition[] }) {
  const totalPnl = positions.reduce((a, p) => a + p.pnl, 0);
  const weightedAnnReturn = positions.reduce((acc, pos) => {
    const deal = deals.find((d) => d.id === pos.dealId);
    return deal ? acc + pos.weight * deal.annualizedReturn : acc;
  }, 0);

  const labels = positions.map((p) => {
    const deal = deals.find((d) => d.id === p.dealId);
    return deal ? deal.target.split(" ")[0] : p.dealId;
  });

  // Simulated drawdown history (30 bars)
  const drawdownData: Array<{ x: number; dd: number }> = [];
  let cumPnl = 0;
  let peak = 0;
  for (let i = 0; i < 30; i++) {
    const dailyPnl = (Math.random() - 0.45) * 0.15;
    cumPnl += dailyPnl;
    peak = Math.max(peak, cumPnl);
    drawdownData.push({ x: i, dd: cumPnl - peak });
  }
  const maxDD = Math.min(...drawdownData.map((d) => d.dd));

  const DDW = 400;
  const DDH = 100;
  const ddPad = { top: 10, right: 16, bottom: 24, left: 40 };
  const ddChartW = DDW - ddPad.left - ddPad.right;
  const ddChartH = DDH - ddPad.top - ddPad.bottom;
  const ddMin = Math.min(maxDD * 1.2, -0.01);
  const xS = (i: number) => ddPad.left + (i / 29) * ddChartW;
  const yS = (v: number) => ddPad.top + ((v - 0) / (ddMin - 0)) * ddChartH;
  const ddPath = drawdownData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xS(d.x).toFixed(1)} ${yS(d.dd).toFixed(1)}`)
    .join(" ");
  const ddArea =
    ddPath +
    ` L ${xS(29).toFixed(1)} ${(ddPad.top).toFixed(1)} L ${xS(0).toFixed(1)} ${(ddPad.top).toFixed(1)} Z`;

  return (
    <div className="space-y-4">
      {/* Portfolio summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Portfolio P&L",
            value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(1)}K`,
            color: totalPnl >= 0 ? "text-emerald-400" : "text-red-400",
            icon: DollarSign,
          },
          {
            label: "Wtd Ann. Return",
            value: `${weightedAnnReturn.toFixed(1)}%`,
            color: "text-sky-400",
            icon: TrendingUp,
          },
          {
            label: "Max Drawdown",
            value: `${(maxDD * 100).toFixed(2)}%`,
            color: "text-red-400",
            icon: TrendingDown,
          },
          {
            label: "# Positions",
            value: positions.length.toString(),
            color: "text-violet-400",
            icon: Layers,
          },
        ].map((item) => (
          <Card key={item.label} className="border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <item.icon className={cn("w-5 h-5 flex-shrink-0", item.color)} />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={cn("text-lg font-bold", item.color)}>{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Position table */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-violet-400" />
              Portfolio Positions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-2 text-left">Target</th>
                  <th className="px-3 py-2 text-right">Weight</th>
                  <th className="px-3 py-2 text-right">Entry Spd</th>
                  <th className="px-3 py-2 text-right">Curr Spd</th>
                  <th className="px-3 py-2 text-right">P&L</th>
                  <th className="px-3 py-2 text-right">Days</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => {
                  const deal = deals.find((d) => d.id === pos.dealId);
                  if (!deal) return null;
                  const spreadChange = pos.entrySpread - pos.currentSpread;
                  return (
                    <tr key={pos.dealId} className="border-b border-border/40 hover:bg-muted/10">
                      <td className="px-3 py-2 font-medium">{deal.target}</td>
                      <td className="px-3 py-2 text-right">{(pos.weight * 100).toFixed(0)}%</td>
                      <td className="px-3 py-2 text-right">{pos.entrySpread.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-right">{pos.currentSpread.toFixed(2)}%</td>
                      <td className={cn("px-3 py-2 text-right font-semibold", pos.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(1)}K
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{pos.daysHeld}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Correlation heatmap */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Position Correlation Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CorrelationHeatmap matrix={CORRELATION_MATRIX} labels={labels} />
            <p className="text-xs text-muted-foreground mt-2">
              Low cross-position correlations support portfolio diversification. Higher correlations indicate correlated deal risk (e.g. sector-wide regulatory action).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Drawdown chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            Portfolio Drawdown (30-Day Simulated)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${DDW} ${DDH}`} className="w-full" style={{ height: DDH }}>
            <defs>
              <linearGradient id="ddGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <line
              x1={ddPad.left}
              y1={ddPad.top}
              x2={ddPad.left + ddChartW}
              y2={ddPad.top}
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <path d={ddArea} fill="url(#ddGrad)" />
            <path d={ddPath} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
            <text x={ddPad.left - 4} y={ddPad.top + 4} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.5">0%</text>
            <text x={ddPad.left - 4} y={ddPad.top + ddChartH} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.5">
              {(maxDD * 100).toFixed(1)}%
            </text>
            <text x={ddPad.left} y={DDH - 4} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">Day 1</text>
            <text x={ddPad.left + ddChartW} y={DDH - 4} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">Day 30</text>
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MergerArbPage() {
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Merger Arbitrage Simulator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deal spread analysis · Risk/reward · Probability estimation · Portfolio construction
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-xs">
            6 Live Deals
          </Badge>
          <Badge variant="outline" className="text-violet-400 border-violet-500/30 bg-violet-500/10 text-xs">
            Event-Driven
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="monitor" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
          <TabsTrigger value="monitor" className="flex items-center gap-1.5 text-xs md:text-sm">
            <Layers className="w-3.5 h-3.5" />
            Deal Monitor
          </TabsTrigger>
          <TabsTrigger value="spread" className="flex items-center gap-1.5 text-xs md:text-sm">
            <Activity className="w-3.5 h-3.5" />
            Spread Analysis
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-1.5 text-xs md:text-sm">
            <Shield className="w-3.5 h-3.5" />
            Risk Model
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-1.5 text-xs md:text-sm">
            <BarChart2 className="w-3.5 h-3.5" />
            Portfolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="data-[state=inactive]:hidden">
          <DealMonitor
            deals={DEALS}
            selectedDealId={selectedDealId}
            onSelectDeal={(id) => setSelectedDealId((prev) => (prev === id ? null : id))}
          />
        </TabsContent>

        <TabsContent value="spread" className="data-[state=inactive]:hidden">
          <SpreadAnalysis deals={DEALS} />
        </TabsContent>

        <TabsContent value="risk" className="data-[state=inactive]:hidden">
          <RiskModel deals={DEALS} />
        </TabsContent>

        <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
          <Portfolio deals={DEALS} positions={PORTFOLIO_POSITIONS} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
