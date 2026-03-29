"use client";

import { useState, useMemo, useCallback } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  PieChart,
  Calendar,
  BarChart3,
  Flame,
  Shield,
  Star,
  Zap,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
}

function fmtPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

function pnlColor(n: number): string {
  return n >= 0 ? "text-emerald-500" : "text-red-500";
}

// ── Net Worth Tab ─────────────────────────────────────────────────────────────

interface AssetLiabilityState {
  cashSavings: number;
  retirementK: number;
  retirementIRA: number;
  realEstate: number;
  businessEquity: number;
  otherAssets: number;
  mortgage: number;
  studentLoans: number;
  carLoans: number;
  creditCard: number;
  otherDebt: number;
}

const DEFAULT_ALS: AssetLiabilityState = {
  cashSavings: 25000,
  retirementK: 45000,
  retirementIRA: 12000,
  realEstate: 0,
  businessEquity: 0,
  otherAssets: 5000,
  mortgage: 0,
  studentLoans: 18000,
  carLoans: 8000,
  creditCard: 3500,
  otherDebt: 0,
};

const NET_WORTH_MILESTONES = [
  { label: "$10K", value: 10_000 },
  { label: "$50K", value: 50_000 },
  { label: "$100K", value: 100_000 },
  { label: "$250K", value: 250_000 },
  { label: "$500K", value: 500_000 },
  { label: "$1M", value: 1_000_000 },
];

function NumInput({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full rounded-md border border-border bg-background py-1.5 pl-6 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
}

// SVG Donut Chart
function DonutChart({
  segments,
  size = 160,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total <= 0) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-full border-2 border-border text-xs text-muted-foreground"
      >
        No data
      </div>
    );
  }
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;
  const innerR = r * 0.55;

  let cumAngle = -Math.PI / 2;
  const arcs = segments.map((seg) => {
    const angle = (seg.value / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    return { ...seg, d, pct: ((seg.value / total) * 100).toFixed(1) };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill={arc.color} opacity={0.85} />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="currentColor" fontSize={10} className="fill-muted-foreground">
        Total
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="currentColor" fontSize={11} fontWeight="600">
        {segments.length > 0 ? fmtK(total) : "-"}
      </text>
    </svg>
  );
}

function NetWorthTab({ brokerageValue }: { brokerageValue: number }) {
  const [als, setAls] = useState<AssetLiabilityState>({
    ...DEFAULT_ALS,
    cashSavings: DEFAULT_ALS.cashSavings,
  });

  const set = useCallback(
    (key: keyof AssetLiabilityState) => (v: number) =>
      setAls((prev) => ({ ...prev, [key]: v })),
    [],
  );

  const totalAssets = useMemo(
    () =>
      als.cashSavings +
      brokerageValue +
      als.retirementK +
      als.retirementIRA +
      als.realEstate +
      als.businessEquity +
      als.otherAssets,
    [als, brokerageValue],
  );

  const totalLiabilities = useMemo(
    () =>
      als.mortgage +
      als.studentLoans +
      als.carLoans +
      als.creditCard +
      als.otherDebt,
    [als],
  );

  const netWorth = totalAssets - totalLiabilities;
  const yoyChange = netWorth * 0.14; // illustrative

  const donutSegments = useMemo(() => {
    const items = [
      { label: "Cash", value: als.cashSavings, color: "#22c55e" },
      { label: "Brokerage", value: brokerageValue, color: "#3b82f6" },
      { label: "401(k)", value: als.retirementK, color: "#8b5cf6" },
      { label: "IRA", value: als.retirementIRA, color: "#a78bfa" },
      { label: "Real Estate", value: als.realEstate, color: "#f59e0b" },
      { label: "Business", value: als.businessEquity, color: "#f97316" },
      { label: "Other", value: als.otherAssets, color: "#6b7280" },
    ];
    return items.filter((x) => x.value > 0);
  }, [als, brokerageValue]);

  const nextMilestone = NET_WORTH_MILESTONES.find((m) => m.value > netWorth);
  const prevMilestone = [...NET_WORTH_MILESTONES].reverse().find((m) => m.value <= netWorth);

  return (
    <div className="space-y-6">
      {/* Hero net worth */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Net Worth</p>
            <p
              className={cn(
                "text-2xl font-bold tracking-tight",
                netWorth >= 0 ? "text-foreground" : "text-red-500",
              )}
            >
              {fmtK(netWorth)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {yoyChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={cn("text-sm font-semibold", pnlColor(yoyChange))}>
              {yoyChange >= 0 ? "+" : ""}
              {fmtK(yoyChange)} YoY (est.)
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Assets</p>
            <p className="text-lg font-bold text-emerald-500">{fmt(totalAssets)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Liabilities</p>
            <p className="text-lg font-bold text-red-500">{fmt(totalLiabilities)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Debt-to-Asset</p>
            <p className="text-lg font-bold">
              {totalAssets > 0 ? fmtPct((totalLiabilities / totalAssets) * 100) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Brokerage (live)</p>
            <p className="text-lg font-bold text-primary">{fmt(brokerageValue)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Asset / Liability inputs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Assets */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-emerald-500">Assets</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <NumInput label="Cash / Savings" value={als.cashSavings} onChange={set("cashSavings")} />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Brokerage (auto)</label>
                <div className="flex items-center rounded-md border border-primary/30 bg-primary/5 px-2 py-1.5">
                  <span className="text-sm font-semibold text-primary">{fmt(brokerageValue)}</span>
                </div>
              </div>
              <NumInput label="401(k)" value={als.retirementK} onChange={set("retirementK")} />
              <NumInput label="IRA" value={als.retirementIRA} onChange={set("retirementIRA")} />
              <NumInput label="Real Estate" value={als.realEstate} onChange={set("realEstate")} />
              <NumInput label="Business Equity" value={als.businessEquity} onChange={set("businessEquity")} />
              <NumInput label="Other Assets" value={als.otherAssets} onChange={set("otherAssets")} />
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold">Total Assets</span>
              <span className="text-sm font-bold text-emerald-500">{fmt(totalAssets)}</span>
            </div>
          </div>

          {/* Liabilities */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-red-500">Liabilities</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <NumInput label="Mortgage" value={als.mortgage} onChange={set("mortgage")} />
              <NumInput label="Student Loans" value={als.studentLoans} onChange={set("studentLoans")} />
              <NumInput label="Car Loans" value={als.carLoans} onChange={set("carLoans")} />
              <NumInput label="Credit Card Debt" value={als.creditCard} onChange={set("creditCard")} />
              <NumInput label="Other Debt" value={als.otherDebt} onChange={set("otherDebt")} />
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold">Total Liabilities</span>
              <span className="text-sm font-bold text-red-500">{fmt(totalLiabilities)}</span>
            </div>
          </div>
        </div>

        {/* Donut + milestones */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Asset Allocation</h3>
            <div className="flex justify-center">
              <DonutChart segments={donutSegments} size={160} />
            </div>
            <div className="mt-3 space-y-1">
              {donutSegments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ background: seg.color }} />
                    <span className="text-muted-foreground">{seg.label}</span>
                  </div>
                  <span className="font-medium">
                    {totalAssets > 0 ? fmtPct((seg.value / totalAssets) * 100) : "0%"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Net Worth Milestones</h3>
            <div className="space-y-2">
              {NET_WORTH_MILESTONES.map((m) => {
                const achieved = netWorth >= m.value;
                const isCurrent = m === nextMilestone && prevMilestone;
                const progress = isCurrent
                  ? Math.min(
                      100,
                      ((netWorth - (prevMilestone?.value ?? 0)) /
                        (m.value - (prevMilestone?.value ?? 0))) *
                        100,
                    )
                  : achieved
                  ? 100
                  : 0;
                return (
                  <div key={m.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        {achieved ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-border" />
                        )}
                        <span className={achieved ? "font-semibold text-foreground" : "text-muted-foreground"}>
                          {m.label}
                        </span>
                      </div>
                      {achieved && (
                        <Badge variant="outline" className="h-4 border-emerald-500/40 text-[11px] text-emerald-500">
                          Achieved
                        </Badge>
                      )}
                    </div>
                    {isCurrent && (
                      <div className="ml-5 h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Balance sheet table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Net Worth Statement</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Item</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            {[
              { cat: "Assets", item: "Cash / Savings", val: als.cashSavings, positive: true },
              { cat: "Assets", item: "Brokerage Account", val: brokerageValue, positive: true },
              { cat: "Assets", item: "401(k)", val: als.retirementK, positive: true },
              { cat: "Assets", item: "IRA", val: als.retirementIRA, positive: true },
              { cat: "Assets", item: "Real Estate", val: als.realEstate, positive: true },
              { cat: "Assets", item: "Business Equity", val: als.businessEquity, positive: true },
              { cat: "Assets", item: "Other Assets", val: als.otherAssets, positive: true },
              { cat: "Liabilities", item: "Mortgage", val: als.mortgage, positive: false },
              { cat: "Liabilities", item: "Student Loans", val: als.studentLoans, positive: false },
              { cat: "Liabilities", item: "Car Loans", val: als.carLoans, positive: false },
              { cat: "Liabilities", item: "Credit Card Debt", val: als.creditCard, positive: false },
              { cat: "Liabilities", item: "Other Debt", val: als.otherDebt, positive: false },
            ]
              .filter((r) => r.val > 0)
              .map((r, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-1.5">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        r.positive ? "text-emerald-500" : "text-red-500",
                      )}
                    >
                      {r.cat}
                    </span>
                  </td>
                  <td className="px-4 py-1.5 text-sm text-muted-foreground">{r.item}</td>
                  <td
                    className={cn(
                      "px-4 py-1.5 text-right text-sm font-semibold",
                      r.positive ? "text-foreground" : "text-red-500",
                    )}
                  >
                    {r.positive ? "" : "−"}
                    {fmt(r.val)}
                  </td>
                </tr>
              ))}
            <tr className="bg-muted/30 font-bold">
              <td className="px-4 py-2 text-sm" colSpan={2}>
                Net Worth
              </td>
              <td className={cn("px-4 py-2 text-right text-sm", pnlColor(netWorth))}>{fmt(netWorth)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Goals Tab ─────────────────────────────────────────────────────────────────

interface FinancialGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  monthlyContrib: number;
}

const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: "g1",
    name: "Emergency Fund",
    target: 30000,
    current: 18500,
    deadline: "2026-12-31",
    monthlyContrib: 500,
  },
  {
    id: "g2",
    name: "Down Payment",
    target: 80000,
    current: 22000,
    deadline: "2028-06-30",
    monthlyContrib: 1500,
  },
  {
    id: "g3",
    name: "Vacation Fund",
    target: 5000,
    current: 3200,
    deadline: "2026-08-01",
    monthlyContrib: 200,
  },
];

// SVG Fan Chart for FIRE
function FireFanChart({
  currentSavings,
  monthlyContrib,
  target,
}: {
  currentSavings: number;
  monthlyContrib: number;
  target: number;
}) {
  const W = 400;
  const H = 200;
  const pad = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const years = 35;

  const scenarios = useMemo(() => {
    const rates = [0.06, 0.08, 0.10];
    return rates.map((r) => {
      const points: { x: number; y: number }[] = [];
      for (let y = 0; y <= years; y++) {
        const growth = currentSavings * Math.pow(1 + r, y);
        const contribs = monthlyContrib > 0
          ? (monthlyContrib * 12 * (Math.pow(1 + r, y) - 1)) / r
          : 0;
        points.push({ x: y, y: growth + contribs });
      }
      return points;
    });
  }, [currentSavings, monthlyContrib]);

  const maxVal = Math.max(target * 1.2, scenarios[2][years].y);

  const toSvgX = (y: number) => pad.left + (y / years) * chartW;
  const toSvgY = (v: number) => pad.top + chartH - Math.min(1, v / maxVal) * chartH;

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.x)} ${toSvgY(p.y)}`).join(" ");

  const areaPath =
    `${toPath(scenarios[2])} L ${toSvgX(years)} ${toSvgY(0)} L ${toSvgX(0)} ${toSvgY(0)} Z`;

  const targetY = toSvgY(target);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      {/* Area */}
      <path d={areaPath} fill="hsl(var(--primary)/0.08)" />
      {/* Scenarios */}
      {scenarios.map((pts, i) => (
        <path
          key={i}
          d={toPath(pts)}
          fill="none"
          stroke={i === 0 ? "hsl(var(--muted-foreground)/0.4)" : i === 1 ? "hsl(var(--primary)/0.7)" : "hsl(var(--primary))"}
          strokeWidth={i === 1 ? 2 : 1.5}
          strokeDasharray={i === 0 ? "4 4" : undefined}
        />
      ))}
      {/* Target line */}
      <line x1={pad.left} y1={targetY} x2={W - pad.right} y2={targetY} stroke="hsl(var(--destructive)/0.6)" strokeWidth={1} strokeDasharray="6 3" />
      <text x={W - pad.right - 2} y={targetY - 4} textAnchor="end" fontSize={9} fill="hsl(var(--destructive))">{fmtK(target)} FIRE</text>
      {/* Y axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <text key={i} x={pad.left - 4} y={pad.top + chartH - f * chartH + 4} textAnchor="end" fontSize={8} fill="hsl(var(--muted-foreground))">{fmtK(f * maxVal)}</text>
      ))}
      {/* X axis labels */}
      {[0, 5, 10, 15, 20, 25, 30, 35].map((y) => (
        <text key={y} x={toSvgX(y)} y={H - pad.bottom + 14} textAnchor="middle" fontSize={8} fill="hsl(var(--muted-foreground))">{y}y</text>
      ))}
      {/* Legend */}
      <line x1={pad.left} y1={H - 8} x2={pad.left + 20} y2={H - 8} stroke="hsl(var(--muted-foreground)/0.4)" strokeWidth={1.5} strokeDasharray="4 4" />
      <text x={pad.left + 24} y={H - 4} fontSize={8} fill="hsl(var(--muted-foreground))">6% / Bear</text>
      <line x1={pad.left + 80} y1={H - 8} x2={pad.left + 100} y2={H - 8} stroke="hsl(var(--primary)/0.7)" strokeWidth={2} />
      <text x={pad.left + 104} y={H - 4} fontSize={8} fill="hsl(var(--muted-foreground))">8% / Base</text>
      <line x1={pad.left + 160} y1={H - 8} x2={pad.left + 180} y2={H - 8} stroke="hsl(var(--primary))" strokeWidth={1.5} />
      <text x={pad.left + 184} y={H - 4} fontSize={8} fill="hsl(var(--muted-foreground))">10% / Bull</text>
    </svg>
  );
}

// SVG Goals Timeline
function GoalsTimeline({ goals }: { goals: FinancialGoal[] }) {
  const W = 600;
  const H = 80;
  const padX = 40;
  const midY = 40;

  const now = new Date();
  const sorted = [...goals].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  );
  if (sorted.length === 0) return null;

  const minDate = now.getTime();
  const maxDate = new Date(sorted[sorted.length - 1].deadline).getTime() + 60 * 24 * 3600 * 1000;
  const span = maxDate - minDate;

  const toX = (d: string) => padX + ((new Date(d).getTime() - minDate) / span) * (W - padX * 2);

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#f97316"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 80 }}>
      {/* Baseline */}
      <line x1={padX} y1={midY} x2={W - padX} y2={midY} stroke="hsl(var(--border))" strokeWidth={2} />
      {/* Now marker */}
      <line x1={padX} y1={midY - 10} x2={padX} y2={midY + 10} stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} />
      <text x={padX} y={midY + 22} textAnchor="middle" fontSize={8} fill="hsl(var(--muted-foreground))">Now</text>
      {sorted.map((g, i) => {
        const x = toX(g.deadline);
        const color = COLORS[i % COLORS.length];
        const pct = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
        const above = i % 2 === 0;
        return (
          <g key={g.id}>
            <line x1={x} y1={midY - 8} x2={x} y2={midY + 8} stroke={color} strokeWidth={2} />
            <circle cx={x} cy={above ? midY - 20 : midY + 20} r={14} fill={color} opacity={0.15} />
            <circle cx={x} cy={above ? midY - 20 : midY + 20} r={14 * (pct / 100)} fill={color} opacity={0.5} />
            <text x={x} y={above ? midY - 16 : midY + 24} textAnchor="middle" fontSize={7} fontWeight="600" fill={color}>
              {g.name.slice(0, 8)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function GoalsTab() {
  const [goals, setGoals] = useState<FinancialGoal[]>(INITIAL_GOALS);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState<Omit<FinancialGoal, "id">>({
    name: "",
    target: 10000,
    current: 0,
    deadline: "2027-12-31",
    monthlyContrib: 200,
  });

  // Emergency fund state
  const [efMonthlyExpenses, setEfMonthlyExpenses] = useState(3500);
  const [efCurrent, setEfCurrent] = useState(10500);
  const efMonths = efMonthlyExpenses > 0 ? efCurrent / efMonthlyExpenses : 0;
  const efTarget = efMonthlyExpenses * 6;

  // FIRE state
  const [fireAnnualExpenses, setFireAnnualExpenses] = useState(60000);
  const [fireCurrentSavings, setFireCurrentSavings] = useState(85000);
  const [fireMonthlyContrib, setFireMonthlyContrib] = useState(2000);
  const [fireSavingsRate, setFireSavingsRate] = useState(25);
  const fireTarget = fireAnnualExpenses * 25;

  const now = new Date();

  const addGoal = () => {
    if (!newGoal.name) return;
    setGoals((prev) => [...prev, { ...newGoal, id: `g${Date.now()}` }]);
    setShowAdd(false);
    setNewGoal({ name: "", target: 10000, current: 0, deadline: "2027-12-31", monthlyContrib: 200 });
  };

  function goalStatus(g: FinancialGoal): "ahead" | "on-track" | "behind" {
    const remaining = g.target - g.current;
    const daysLeft = Math.max(0, (new Date(g.deadline).getTime() - now.getTime()) / 86400000);
    const monthsLeft = daysLeft / 30;
    if (monthsLeft <= 0) return remaining <= 0 ? "ahead" : "behind";
    const neededMonthly = remaining / monthsLeft;
    if (g.monthlyContrib >= neededMonthly * 1.05) return "ahead";
    if (g.monthlyContrib >= neededMonthly * 0.9) return "on-track";
    return "behind";
  }

  return (
    <div className="space-y-6">
      {/* Goals list */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Financial Goals</h3>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {showAdd ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showAdd ? "Cancel" : "Add Goal"}
          </button>
        </div>

        {showAdd && (
          <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-muted-foreground">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. New Car"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <NumInput label="Target Amount" value={newGoal.target} onChange={(v) => setNewGoal((p) => ({ ...p, target: v }))} />
              <NumInput label="Current Saved" value={newGoal.current} onChange={(v) => setNewGoal((p) => ({ ...p, current: v }))} />
              <div>
                <label className="text-xs text-muted-foreground">Deadline</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal((p) => ({ ...p, deadline: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <NumInput label="Monthly Contrib" value={newGoal.monthlyContrib} onChange={(v) => setNewGoal((p) => ({ ...p, monthlyContrib: v }))} />
            </div>
            <button
              onClick={addGoal}
              className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Add Goal
            </button>
          </div>
        )}

        <div className="space-y-3">
          {goals.map((g) => {
            const pct = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
            const daysLeft = Math.max(0, Math.floor((new Date(g.deadline).getTime() - now.getTime()) / 86400000));
            const status = goalStatus(g);
            return (
              <div key={g.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{g.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmt(g.current)} / {fmt(g.target)} · {fmt(g.monthlyContrib)}/mo
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {daysLeft}d
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px]",
                        status === "ahead"
                          ? "border-emerald-500/40 text-emerald-500"
                          : status === "on-track"
                          ? "border-primary/40 text-primary"
                          : "border-red-500/40 text-red-500",
                      )}
                    >
                      {status === "ahead" ? "Ahead" : status === "on-track" ? "On Track" : "Behind"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      status === "behind" ? "bg-red-500" : "bg-primary",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-muted-foreground">{pct.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      {goals.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Goal Timeline</h3>
          <GoalsTimeline goals={goals} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Emergency Fund */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Emergency Fund</h3>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <NumInput label="Monthly Expenses" value={efMonthlyExpenses} onChange={setEfMonthlyExpenses} />
            <NumInput label="Current Emergency Fund" value={efCurrent} onChange={setEfCurrent} />
          </div>
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold">{efMonths.toFixed(1)}x</p>
            <p className="text-xs text-muted-foreground">months of expenses covered</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                efMonths >= 6 ? "bg-emerald-500" : efMonths >= 3 ? "bg-amber-500" : "bg-red-500",
              )}
              style={{ width: `${Math.min(100, (efMonths / 6) * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>0 mo</span>
            <span className={efMonths >= 3 ? "text-emerald-500" : "text-red-500"}>3 mo min</span>
            <span className={efMonths >= 6 ? "text-emerald-500" : "text-muted-foreground"}>6 mo goal</span>
          </div>
          {efMonths < 3 && (
            <div className="mt-2 flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/5 p-2 text-xs text-red-500">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              Under-funded emergency fund is your biggest financial risk.
            </div>
          )}
        </div>

        {/* FIRE Calculator */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-semibold">FIRE Calculator</h3>
            <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-orange-500">
              4% Rule
            </span>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <NumInput label="Annual Expenses" value={fireAnnualExpenses} onChange={setFireAnnualExpenses} />
            <NumInput label="Current Savings" value={fireCurrentSavings} onChange={setFireCurrentSavings} />
            <NumInput label="Monthly Contribution" value={fireMonthlyContrib} onChange={setFireMonthlyContrib} />
            <div>
              <label className="text-xs text-muted-foreground">Savings Rate: {fireSavingsRate}%</label>
              <Slider
                value={[fireSavingsRate]}
                onValueChange={([v]) => setFireSavingsRate(v)}
                min={0}
                max={80}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3">
            <div>
              <p className="text-xs text-muted-foreground">FIRE Target (25×)</p>
              <p className="text-lg font-bold text-orange-500">{fmtK(fireTarget)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gap</p>
              <p className="text-lg font-bold">{fmtK(Math.max(0, fireTarget - fireCurrentSavings))}</p>
            </div>
          </div>
          <FireFanChart currentSavings={fireCurrentSavings} monthlyContrib={fireMonthlyContrib} target={fireTarget} />
        </div>
      </div>
    </div>
  );
}

// ── Tax Planning Tab ──────────────────────────────────────────────────────────

const TAX_BRACKETS_SINGLE = [
  { rate: 10, from: 0, to: 11925 },
  { rate: 12, from: 11925, to: 48475 },
  { rate: 22, from: 48475, to: 103350 },
  { rate: 24, from: 103350, to: 197300 },
  { rate: 32, from: 197300, to: 250525 },
  { rate: 35, from: 250525, to: 626350 },
  { rate: 37, from: 626350, to: Infinity },
];

const TAX_BRACKETS_MFJ = [
  { rate: 10, from: 0, to: 23850 },
  { rate: 12, from: 23850, to: 96950 },
  { rate: 22, from: 96950, to: 206700 },
  { rate: 24, from: 206700, to: 394600 },
  { rate: 32, from: 394600, to: 501050 },
  { rate: 35, from: 501050, to: 751600 },
  { rate: 37, from: 751600, to: Infinity },
];

const STANDARD_DEDUCTION = { single: 15000, mfj: 30000 };

const BRACKET_COLORS = [
  "#22c55e",
  "#84cc16",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#dc2626",
  "#991b1b",
];

function computeTax(taxableIncome: number, brackets: typeof TAX_BRACKETS_SINGLE): number {
  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome <= 0) break;
    const chunk = Math.min(taxableIncome, b.to - b.from);
    tax += chunk * (b.rate / 100);
    taxableIncome -= chunk;
  }
  return tax;
}

function TaxBracketBar({
  grossIncome,
  taxableIncome,
  brackets,
}: {
  grossIncome: number;
  taxableIncome: number;
  brackets: typeof TAX_BRACKETS_SINGLE;
}) {
  const W = 500;
  const H = 60;
  const pad = { left: 10, right: 10, top: 4, bottom: 20 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  if (taxableIncome <= 0) return null;

  const filled = Math.min(taxableIncome, brackets[brackets.length - 2].to);

  const segments: { x: number; w: number; rate: number; color: string; idx: number }[] = [];
  let remaining = taxableIncome;
  let xAcc = 0;
  for (let i = 0; i < brackets.length - 1; i++) {
    const b = brackets[i];
    const chunk = Math.min(remaining, b.to - b.from);
    if (chunk <= 0) break;
    const x = (xAcc / filled) * chartW;
    const w = (chunk / filled) * chartW;
    segments.push({ x, w, rate: b.rate, color: BRACKET_COLORS[i], idx: i });
    xAcc += chunk;
    remaining -= chunk;
  }

  const displayMax = Math.min(taxableIncome * 1.05, brackets[brackets.length - 2].to);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 60 }}>
      {segments.map((seg, i) => (
        <g key={i}>
          <rect
            x={pad.left + seg.x}
            y={pad.top}
            width={Math.max(1, seg.w)}
            height={chartH}
            fill={seg.color}
            opacity={0.8}
            rx={i === 0 ? 4 : 0}
          />
          {seg.w > 30 && (
            <text
              x={pad.left + seg.x + seg.w / 2}
              y={pad.top + chartH / 2 + 4}
              textAnchor="middle"
              fontSize={9}
              fontWeight="600"
              fill="white"
            >
              {seg.rate}%
            </text>
          )}
        </g>
      ))}
      {/* Marginal marker */}
      <line
        x1={pad.left + (Math.min(taxableIncome, filled) / Math.max(1, displayMax)) * chartW}
        y1={pad.top - 2}
        x2={pad.left + (Math.min(taxableIncome, filled) / Math.max(1, displayMax)) * chartW}
        y2={pad.top + chartH + 2}
        stroke="white"
        strokeWidth={1.5}
        opacity={0.7}
      />
    </svg>
  );
}

function TaxTab() {
  const [grossIncome, setGrossIncome] = useState(85000);
  const [filingStatus, setFilingStatus] = useState<"single" | "mfj">("single");
  const [deductionType, setDeductionType] = useState<"standard" | "itemized">("standard");
  const [itemizedDeduction, setItemizedDeduction] = useState(20000);
  const [contrib401k, setContrib401k] = useState(6000);
  const [contribHSA, setContribHSA] = useState(0);

  const brackets = filingStatus === "single" ? TAX_BRACKETS_SINGLE : TAX_BRACKETS_MFJ;
  const standardDed = filingStatus === "single" ? STANDARD_DEDUCTION.single : STANDARD_DEDUCTION.mfj;
  const deduction = deductionType === "standard" ? standardDed : itemizedDeduction;
  const taxableIncome = Math.max(0, grossIncome - deduction - contrib401k - contribHSA);
  const federalTax = computeTax(taxableIncome, brackets);
  const effectiveRate = grossIncome > 0 ? (federalTax / grossIncome) * 100 : 0;
  const afterTax = grossIncome - federalTax;

  // Marginal rate
  let marginalRate = 0;
  for (const b of brackets) {
    if (taxableIncome > b.from) marginalRate = b.rate;
  }

  // Tax savings from 401k
  const taxWithout401k = computeTax(Math.max(0, grossIncome - deduction - contribHSA), brackets);
  const savings401k = taxWithout401k - federalTax;

  // Capital gains rates
  let ltcgRate = 0;
  if (filingStatus === "single") {
    if (taxableIncome > 583750) ltcgRate = 20;
    else if (taxableIncome > 47025) ltcgRate = 15;
  } else {
    if (taxableIncome > 583750) ltcgRate = 20;
    else if (taxableIncome > 94050) ltcgRate = 15;
  }

  // Roth conversion opportunity
  const isLowBracket = marginalRate <= 22;

  // Tax optimization score
  const score = Math.round(
    Math.min(100,
      (deductionType === "standard" && deduction < itemizedDeduction ? 50 : 70) +
      (contrib401k >= 23500 ? 15 : contrib401k >= 6000 ? 8 : 0) +
      (contribHSA > 0 ? 10 : 0) +
      (effectiveRate < 20 ? 5 : 0),
    ),
  );

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Tax Inputs</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumInput label="Gross Income" value={grossIncome} onChange={setGrossIncome} />
          <div>
            <label className="text-xs text-muted-foreground">Filing Status</label>
            <div className="mt-1 flex gap-2">
              {(["single", "mfj"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilingStatus(s)}
                  className={cn(
                    "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                    filingStatus === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {s === "single" ? "Single" : "Married (MFJ)"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Deduction Type</label>
            <div className="mt-1 flex gap-2">
              {(["standard", "itemized"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDeductionType(d)}
                  className={cn(
                    "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                    deductionType === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {d === "standard" ? "Standard" : "Itemized"}
                </button>
              ))}
            </div>
          </div>
          {deductionType === "itemized" ? (
            <NumInput label="Itemized Deduction" value={itemizedDeduction} onChange={setItemizedDeduction} />
          ) : (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Standard Deduction</label>
              <div className="flex items-center rounded-md border border-border/50 bg-muted/30 px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                {fmt(standardDed)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tax summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Federal Tax Owed", value: fmt(federalTax), sub: "", color: "text-red-500" },
          { label: "Effective Rate", value: fmtPct(effectiveRate), sub: `Marginal: ${marginalRate}%`, color: "text-amber-500" },
          { label: "Taxable Income", value: fmt(taxableIncome), sub: `Deduction: ${fmt(deduction)}`, color: "text-foreground" },
          { label: "After-Tax Income", value: fmtK(afterTax), sub: `vs gross ${fmtK(grossIncome)}`, color: "text-emerald-500" },
        ].map((card, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className={cn("text-2xl font-bold", card.color)}>{card.value}</p>
            {card.sub && <p className="text-xs text-muted-foreground">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Bracket visualizer */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Tax Bracket Visualizer</h3>
        <TaxBracketBar grossIncome={grossIncome} taxableIncome={taxableIncome} brackets={brackets} />
        <div className="mt-3 flex flex-wrap gap-2">
          {BRACKET_COLORS.map((c, i) => {
            const b = brackets[i];
            if (!b) return null;
            return (
              <div key={i} className="flex items-center gap-1 text-xs">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
                <span className="text-muted-foreground">{b.rate}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimization opportunities */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Tax Reduction Opportunities</h3>
          <div className="space-y-4">
            {/* 401k */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">401(k) Contribution</label>
                <span className="text-xs text-emerald-500">Saves {fmt(savings401k)}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={contrib401k}
                  onChange={(e) => setContrib401k(Math.min(23500, Number(e.target.value) || 0))}
                  className="w-24 rounded-md border border-border bg-background px-2 py-1 text-xs"
                />
                <Slider
                  value={[contrib401k]}
                  onValueChange={([v]) => setContrib401k(v)}
                  min={0}
                  max={23500}
                  step={500}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">/ $23,500</span>
              </div>
            </div>
            {/* HSA */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">HSA Contribution</label>
                <Badge variant="outline" className="text-[11px] text-emerald-500 border-emerald-500/40">Triple Tax Benefit</Badge>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={contribHSA}
                  onChange={(e) => setContribHSA(Math.min(4300, Number(e.target.value) || 0))}
                  className="w-24 rounded-md border border-border bg-background px-2 py-1 text-xs"
                />
                <Slider
                  value={[contribHSA]}
                  onValueChange={([v]) => setContribHSA(v)}
                  min={0}
                  max={4300}
                  step={100}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">/ $4,300</span>
              </div>
            </div>
            {/* Capital gains */}
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Short-term cap gains rate</span>
                <span className="font-bold text-red-500">{marginalRate}%</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="font-medium">Long-term cap gains rate</span>
                <span className="font-bold text-emerald-500">{ltcgRate}%</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Hold positions &gt;1 year to qualify for LTCG rates — saves{" "}
                {marginalRate - ltcgRate}% on gains.
              </p>
            </div>
            {/* Roth conversion */}
            {isLowBracket && (
              <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
                <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-primary">Roth Conversion Opportunity</p>
                  <p className="text-muted-foreground mt-0.5">
                    You are in the {marginalRate}% bracket — a historically low rate. Consider converting
                    traditional IRA funds to Roth now to lock in low taxes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tax optimization score */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Tax Optimization Score</h3>
          <div className="flex flex-col items-center gap-4">
            {/* Gauge SVG */}
            <svg viewBox="0 0 120 70" className="w-40">
              {/* Background arc */}
              <path
                d="M 15 60 A 45 45 0 0 1 105 60"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={10}
                strokeLinecap="round"
              />
              {/* Score arc */}
              <path
                d="M 15 60 A 45 45 0 0 1 105 60"
                fill="none"
                stroke={score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444"}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 141} 141`}
              />
              <text x="60" y="58" textAnchor="middle" fontSize={22} fontWeight="800" fill="currentColor">
                {score}
              </text>
              <text x="60" y="68" textAnchor="middle" fontSize={7} fill="hsl(var(--muted-foreground))">
                / 100
              </text>
            </svg>
            <div className="w-full space-y-2">
              {[
                { label: "401(k) maximized", achieved: contrib401k >= 23500, tip: "Contribute $23,500/yr max" },
                { label: "HSA contributing", achieved: contribHSA > 0, tip: "Max $4,300/yr (single)" },
                { label: "Optimal deduction", achieved: deduction >= standardDed, tip: "Use whichever is larger" },
                { label: "Low effective rate", achieved: effectiveRate < 20, tip: "Effective rate below 20%" },
                { label: "LTCG advantage", achieved: ltcgRate < marginalRate, tip: "Hold positions over 1 year" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {item.achieved ? (
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-muted-foreground/40" />
                  )}
                  <span className={item.achieved ? "text-foreground" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                  {!item.achieved && (
                    <span className="ml-auto text-[11px] text-muted-foreground/60">{item.tip}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Roadmap Tab ───────────────────────────────────────────────────────────────

// SVG Projection Chart
function ProjectionChart({
  currentAge,
  currentSavings,
  monthlySavings,
  expectedReturn,
}: {
  currentAge: number;
  currentSavings: number;
  monthlySavings: number;
  expectedReturn: number;
}) {
  const W = 500;
  const H = 220;
  const pad = { top: 20, right: 20, bottom: 40, left: 70 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const retirementAge = 65;
  const yearsLeft = Math.max(1, retirementAge - currentAge);
  const r = expectedReturn / 100;

  const dataPoints: { age: number; value: number }[] = [];
  for (let y = 0; y <= yearsLeft; y++) {
    const growth = currentSavings * Math.pow(1 + r, y);
    const contrib = r > 0
      ? (monthlySavings * 12 * (Math.pow(1 + r, y) - 1)) / r
      : monthlySavings * 12 * y;
    dataPoints.push({ age: currentAge + y, value: growth + contrib });
  }

  const maxVal = dataPoints[dataPoints.length - 1].value * 1.05;

  const toX = (age: number) => pad.left + ((age - currentAge) / yearsLeft) * chartW;
  const toY = (v: number) => pad.top + chartH - Math.min(1, v / maxVal) * chartH;

  const linePath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.age)} ${toY(p.value)}`).join(" ");
  const areaPath = `${linePath} L ${toX(retirementAge)} ${pad.top + chartH} L ${toX(currentAge)} ${pad.top + chartH} Z`;

  // Age milestones
  const milestoneAges = [30, 40, 50, 60, 65].filter((a) => a > currentAge && a <= retirementAge);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      <defs>
        <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#projGrad)" />
      <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
      {/* Milestone markers */}
      {milestoneAges.map((age) => {
        const pt = dataPoints.find((p) => p.age === age);
        if (!pt) return null;
        return (
          <g key={age}>
            <line x1={toX(age)} y1={pad.top} x2={toX(age)} y2={pad.top + chartH} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="4 4" />
            <circle cx={toX(age)} cy={toY(pt.value)} r={4} fill="hsl(var(--primary))" />
            <text x={toX(age)} y={toY(pt.value) - 8} textAnchor="middle" fontSize={8} fill="hsl(var(--primary))">{fmtK(pt.value)}</text>
          </g>
        );
      })}
      {/* Y axis */}
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <text key={i} x={pad.left - 5} y={pad.top + chartH - f * chartH + 4} textAnchor="end" fontSize={8} fill="hsl(var(--muted-foreground))">{fmtK(f * maxVal)}</text>
      ))}
      {/* X axis */}
      {[currentAge, ...milestoneAges].map((age) => (
        <text key={age} x={toX(age)} y={H - pad.bottom + 14} textAnchor="middle" fontSize={8} fill="hsl(var(--muted-foreground))">Age {age}</text>
      ))}
    </svg>
  );
}

// Compound interest infographic
function CompoundInfographic() {
  const W = 500;
  const H = 200;
  const pad = { top: 20, right: 20, bottom: 40, left: 70 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const monthly = 1000;
  const rate = 0.07;
  const toAge65 = (startAge: number) => {
    const years = 65 - startAge;
    const r = rate;
    return (monthly * 12 * (Math.pow(1 + r, years) - 1)) / r;
  };

  const scenarios = [
    { startAge: 22, color: "#22c55e", label: "Start at 22" },
    { startAge: 32, color: "#3b82f6", label: "Start at 32" },
    { startAge: 42, color: "#f97316", label: "Start at 42" },
  ];

  const maxVal = toAge65(22) * 1.05;

  const series = scenarios.map((sc) => {
    const years = 65 - sc.startAge;
    const pts: { age: number; value: number }[] = [];
    for (let y = 0; y <= years; y++) {
      const v = (monthly * 12 * (Math.pow(1 + rate, y) - 1)) / rate;
      pts.push({ age: sc.startAge + y, value: v });
    }
    return { ...sc, pts };
  });

  const toX = (age: number) => pad.left + ((age - 22) / (65 - 22)) * chartW;
  const toY = (v: number) => pad.top + chartH - Math.min(1, v / maxVal) * chartH;

  return (
    <div>
      <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Star className="h-3 w-3 text-amber-500" />
        <span>$1,000/month at 7% return to age 65 — starting earlier matters enormously</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
        {series.map((sc) => {
          const path = sc.pts.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.age)} ${toY(p.value)}`).join(" ");
          return <path key={sc.startAge} d={path} fill="none" stroke={sc.color} strokeWidth={2} />;
        })}
        {/* End labels */}
        {series.map((sc) => {
          const endV = toAge65(sc.startAge);
          return (
            <text key={sc.startAge} x={toX(65) + 2} y={toY(endV) + 4} fontSize={8} fill={sc.color} fontWeight="600">
              {fmtK(endV)}
            </text>
          );
        })}
        {/* Y axis */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
          <text key={i} x={pad.left - 5} y={pad.top + chartH - f * chartH + 4} textAnchor="end" fontSize={8} fill="hsl(var(--muted-foreground))">{fmtK(f * maxVal)}</text>
        ))}
        {/* X axis */}
        {[22, 30, 40, 50, 60, 65].map((age) => (
          <text key={age} x={toX(age)} y={H - pad.bottom + 14} textAnchor="middle" fontSize={8} fill="hsl(var(--muted-foreground))">Age {age}</text>
        ))}
        {/* Legend */}
        {series.map((sc, i) => (
          <g key={sc.startAge}>
            <line x1={pad.left + i * 100} y1={H - 6} x2={pad.left + i * 100 + 16} y2={H - 6} stroke={sc.color} strokeWidth={2} />
            <text x={pad.left + i * 100 + 20} y={H - 2} fontSize={8} fill="hsl(var(--muted-foreground))">{sc.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

const MILLIONAIRE_TABLE = [500, 1000, 2000, 5000];
function yearsToMillion(monthly: number, rate: number): number {
  if (monthly <= 0) return Infinity;
  const r = rate / 12;
  // FV = PMT * ((1+r)^n - 1) / r => solve for n
  // (1+r)^n = 1 + FV*r/PMT => n = log(1 + FV*r/PMT) / log(1+r)
  const n = Math.log(1 + (1_000_000 * r) / monthly) / Math.log(1 + r);
  return n / 12;
}

function RoadmapTab() {
  const [currentAge, setCurrentAge] = useState(28);
  const [currentSavings, setCurrentSavings] = useState(45000);
  const [annualSavingsRate, setAnnualSavingsRate] = useState(15);
  const [annualIncome, setAnnualIncome] = useState(80000);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [allocationAge, setAllocationAge] = useState(30);

  const monthlySavings = (annualIncome * annualSavingsRate) / 100 / 12;
  const retirementProjection = useMemo(() => {
    const r = expectedReturn / 100;
    const years = Math.max(1, 65 - currentAge);
    const growth = currentSavings * Math.pow(1 + r, years);
    const contrib = r > 0
      ? (monthlySavings * 12 * (Math.pow(1 + r, years) - 1)) / r
      : monthlySavings * 12 * years;
    return growth + contrib;
  }, [currentAge, currentSavings, monthlySavings, expectedReturn]);

  // Age-based milestones
  const salaryMilestones = [
    { age: 30, multiplier: 1 },
    { age: 40, multiplier: 3 },
    { age: 50, multiplier: 6 },
    { age: 60, multiplier: 8 },
    { age: 65, multiplier: 10 },
  ];

  // Asset allocation recommendations
  const allocationRecs = [
    { label: "100 - Age Rule", stocks: Math.max(0, 100 - allocationAge), bonds: Math.min(100, allocationAge) },
    { label: "110 - Age Rule (Modern)", stocks: Math.max(0, 110 - allocationAge), bonds: Math.max(0, allocationAge - 10) },
    { label: "All-Equity (Young)", stocks: 100, bonds: 0, note: allocationAge <= 35 ? "Suitable for long horizon" : undefined },
  ];

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Your Financial Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs text-muted-foreground">Current Age: {currentAge}</label>
            <Slider value={[currentAge]} onValueChange={([v]) => setCurrentAge(v)} min={18} max={64} step={1} className="mt-2" />
          </div>
          <NumInput label="Current Savings" value={currentSavings} onChange={setCurrentSavings} />
          <NumInput label="Annual Income" value={annualIncome} onChange={setAnnualIncome} />
          <div>
            <label className="text-xs text-muted-foreground">Savings Rate: {annualSavingsRate}%</label>
            <Slider value={[annualSavingsRate]} onValueChange={([v]) => setAnnualSavingsRate(v)} min={0} max={80} step={1} className="mt-2" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Expected Return: {expectedReturn}%/yr</label>
            <Slider value={[expectedReturn]} onValueChange={([v]) => setExpectedReturn(v)} min={1} max={15} step={0.5} className="mt-2" />
          </div>
        </div>
      </div>

      {/* Retirement projection summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Monthly Savings</p>
          <p className="text-2xl font-bold text-primary">{fmt(monthlySavings)}</p>
          <p className="text-xs text-muted-foreground">{annualSavingsRate}% of income</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Projected at Retirement (65)</p>
          <p className="text-2xl font-bold text-emerald-500">{fmtK(retirementProjection)}</p>
          <p className="text-xs text-muted-foreground">{Math.max(0, 65 - currentAge)} years at {expectedReturn}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Annual Retirement Income (4%)</p>
          <p className="text-2xl font-bold text-amber-500">{fmtK(retirementProjection * 0.04)}</p>
          <p className="text-xs text-muted-foreground">Safe withdrawal rate</p>
        </div>
      </div>

      {/* Projection chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Portfolio Growth Projection</h3>
        <ProjectionChart
          currentAge={currentAge}
          currentSavings={currentSavings}
          monthlySavings={monthlySavings}
          expectedReturn={expectedReturn}
        />
      </div>

      {/* Age-based milestones */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Fidelity Savings Benchmarks</h3>
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="grid gap-3 sm:grid-cols-5">
          {salaryMilestones.map((m) => {
            const target = annualIncome * m.multiplier;
            const achieved = currentAge > m.age || (currentAge === m.age && currentSavings >= target);
            const isCurrent = currentAge <= m.age;
            return (
              <div
                key={m.age}
                className={cn(
                  "rounded-lg border p-3 text-center",
                  achieved
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : isCurrent
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-muted/20",
                )}
              >
                <p className="text-xs font-semibold text-muted-foreground">By Age {m.age}</p>
                <p className={cn("text-lg font-bold", achieved ? "text-emerald-500" : isCurrent ? "text-primary" : "text-muted-foreground")}>
                  {m.multiplier}× salary
                </p>
                <p className="text-xs text-muted-foreground">{fmtK(target)}</p>
                {achieved && <CheckCircle className="mx-auto mt-1 h-4 w-4 text-emerald-500" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Millionaire timeline table */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Time to $1 Million</h3>
          <p className="mb-3 text-xs text-muted-foreground">At {expectedReturn}% annual return</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Monthly Contrib</th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Years to $1M</th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Total Invested</th>
              </tr>
            </thead>
            <tbody>
              {MILLIONAIRE_TABLE.map((monthly) => {
                const years = yearsToMillion(monthly, expectedReturn);
                const totalInvested = monthly * 12 * years;
                return (
                  <tr key={monthly} className="border-b border-border/50">
                    <td className="py-2 font-semibold text-primary">{fmt(monthly)}/mo</td>
                    <td className="py-2 text-right">
                      {isFinite(years) ? `${years.toFixed(1)} yrs` : "—"}
                    </td>
                    <td className="py-2 text-right text-muted-foreground">
                      {isFinite(totalInvested) ? fmtK(totalInvested) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Asset allocation by age */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Asset Allocation by Age</h3>
          <div className="mb-3">
            <label className="text-xs text-muted-foreground">Age for allocation: {allocationAge}</label>
            <Slider value={[allocationAge]} onValueChange={([v]) => setAllocationAge(v)} min={20} max={75} step={1} className="mt-2" />
          </div>
          <div className="space-y-3">
            {allocationRecs.map((rec, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{rec.label}</span>
                  <div className="flex gap-2 text-muted-foreground">
                    <span className="text-primary font-semibold">{rec.stocks}% stocks</span>
                    <span>{rec.bonds}% bonds</span>
                  </div>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${rec.stocks}%` }} />
                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${rec.bonds}%` }} />
                  <div className="flex-1 bg-emerald-500/40" />
                </div>
                {rec.note && <p className="text-xs text-emerald-500">{rec.note}</p>}
              </div>
            ))}
            <div className="flex gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-sm bg-primary" /> Stocks</div>
              <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-sm bg-amber-500" /> Bonds</div>
              <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-sm bg-emerald-500/40" /> Other/Cash</div>
            </div>
          </div>
        </div>
      </div>

      {/* Compound interest infographic */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Compound Interest — The 8th Wonder</h3>
        </div>
        <CompoundInfographic />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function WealthPage() {
  const portfolioValue = useTradingStore((s) => s.portfolioValue);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex-1 space-y-4 p-4 md:p-6">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Landmark className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Wealth Management</h1>
            <p className="text-xs text-muted-foreground">
              Track your net worth, plan goals, optimize taxes, and build long-term wealth.
            </p>
          </div>
        </div>

        <Tabs defaultValue="networth" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-grid">
            <TabsTrigger value="networth" className="flex items-center gap-1.5 text-xs">
              <PieChart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Net Worth</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1.5 text-xs">
              <Target className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="tax" className="flex items-center gap-1.5 text-xs">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tax Planning</span>
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Roadmap</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="networth" className="mt-0">
            <NetWorthTab brokerageValue={portfolioValue} />
          </TabsContent>

          <TabsContent value="goals" className="mt-0">
            <GoalsTab />
          </TabsContent>

          <TabsContent value="tax" className="mt-0">
            <TaxTab />
          </TabsContent>

          <TabsContent value="roadmap" className="mt-0">
            <RoadmapTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
