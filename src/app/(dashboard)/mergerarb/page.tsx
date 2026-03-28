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
  PieChart,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 682001;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

type DealType = "Cash" | "Stock" | "Mixed" | "LBO";
type DealStatus = "Pending" | "Regulatory" | "Closing" | "At Risk";

interface Deal {
  id: string;
  acquirer: string;
  target: string;
  dealPrice: number;
  currentPrice: number;
  spreadDollar: number;
  spreadPct: number;
  dealType: DealType;
  expectedClose: string;
  daysToClose: number;
  annualizedReturn: number;
  regulatoryRisk: "Low" | "Medium" | "High";
  status: DealStatus;
  dealValue: number; // $B
}

interface SpecialSituation {
  type: string;
  description: string;
  typicalReturn: string;
  timeHorizon: string;
  riskLevel: "Low" | "Medium" | "High";
  complexity: "Simple" | "Moderate" | "Complex";
  example: string;
  keyRisk: string;
}

interface RiskFactor {
  name: string;
  score: number; // 0–100
  category: "Regulatory" | "Financing" | "Strategic" | "Market";
  description: string;
}

// ── Data generation ───────────────────────────────────────────────────────────

const DEAL_DATA: Deal[] = (() => {
  const acquirers = [
    "Microsoft",
    "Alphabet",
    "Exxon Mobil",
    "JPMorgan Chase",
    "Pfizer",
    "Chevron",
    "Broadcom",
    "Amazon",
    "UnitedHealth",
    "Meta Platforms",
  ];
  const targets = [
    "Activision Blizzard",
    "Wiz Inc.",
    "Pioneer Natural Resources",
    "First Republic Bank",
    "Seagen",
    "Hess Corp",
    "VMware",
    "iRobot Corp",
    "Change Healthcare",
    "Within Unlimited",
  ];
  const types: DealType[] = ["Cash", "Stock", "Mixed", "LBO", "Cash", "Cash", "Stock", "Mixed", "Cash", "Cash"];
  const statuses: DealStatus[] = [
    "Regulatory",
    "Pending",
    "Closing",
    "At Risk",
    "Closing",
    "Regulatory",
    "Closing",
    "At Risk",
    "Pending",
    "Regulatory",
  ];
  const regRisk: Array<"Low" | "Medium" | "High"> = [
    "High", "Medium", "Medium", "Low", "Medium", "Low", "High", "Medium", "High", "Low",
  ];
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];

  return acquirers.map((acq, i) => {
    const dealPrice = 20 + rand() * 180;
    const spreadPct = 0.5 + rand() * 6;
    const currentPrice = dealPrice * (1 - spreadPct / 100);
    const spreadDollar = dealPrice - currentPrice;
    const daysToClose = 30 + Math.floor(rand() * 270);
    const annualizedReturn = (spreadPct / (daysToClose / 365)) * (0.8 + rand() * 0.4);

    return {
      id: `deal-${i}`,
      acquirer: acq,
      target: targets[i],
      dealPrice: parseFloat(dealPrice.toFixed(2)),
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      spreadDollar: parseFloat(spreadDollar.toFixed(2)),
      spreadPct: parseFloat(spreadPct.toFixed(2)),
      dealType: types[i],
      expectedClose: `${months[i]} 2026`,
      daysToClose,
      annualizedReturn: parseFloat(annualizedReturn.toFixed(1)),
      regulatoryRisk: regRisk[i],
      status: statuses[i],
      dealValue: parseFloat((2 + rand() * 68).toFixed(1)),
    };
  });
})();

const SPECIAL_SITUATIONS: SpecialSituation[] = [
  {
    type: "Spin-Off",
    description: "Parent company separates a business unit into an independent publicly traded company.",
    typicalReturn: "5–15% in 6–18 months",
    timeHorizon: "6–18 months",
    riskLevel: "Low",
    complexity: "Moderate",
    example: "GE spinning off GE Vernova (energy) and GE Aerospace",
    keyRisk: "New management execution risk; forced selling by index funds",
  },
  {
    type: "Stub Trade",
    description: "Trading the residual value after stripping out known asset components from a conglomerate.",
    typicalReturn: "Variable; negative to 30%+",
    timeHorizon: "3–12 months",
    riskLevel: "Medium",
    complexity: "Complex",
    example: "Long holding company, short publicly traded subsidiary",
    keyRisk: "Holding company discount may widen; liquidity mismatch",
  },
  {
    type: "Rights Offering",
    description: "Existing shareholders receive rights to buy new shares below market price.",
    typicalReturn: "2–8% risk-adjusted",
    timeHorizon: "1–3 months",
    riskLevel: "Low",
    complexity: "Simple",
    example: "Rights issued at 10% discount to VWAP with 30-day exercise window",
    keyRisk: "Stock price decline before exercise; subscription dilution",
  },
  {
    type: "Tender Offer",
    description: "Acquirer offers to buy shares directly from shareholders at a premium above market.",
    typicalReturn: "3–12%",
    timeHorizon: "1–3 months",
    riskLevel: "Low",
    complexity: "Simple",
    example: "Cash tender at $45 when market trades at $42 (7.1% spread)",
    keyRisk: "Proration risk in oversubscribed tenders; deal withdrawal",
  },
  {
    type: "Distressed Situation",
    description: "Buying debt or equity of companies near or in bankruptcy for recovery value.",
    typicalReturn: "10–50%+",
    timeHorizon: "12–36 months",
    riskLevel: "High",
    complexity: "Complex",
    example: "Buying senior secured bonds at 55c trading to par through restructuring",
    keyRisk: "Extended bankruptcy; recovery lower than modeled; litigation",
  },
  {
    type: "Recapitalization",
    description: "Company significantly changes its capital structure via debt issuance or buyback.",
    typicalReturn: "4–12%",
    timeHorizon: "3–9 months",
    riskLevel: "Medium",
    complexity: "Moderate",
    example: "Special dividend funded by leveraged recap unlocking hidden value",
    keyRisk: "Credit deterioration; rating downgrade triggers covenant breach",
  },
];

const RISK_FACTORS: RiskFactor[] = [
  { name: "FTC Challenge", score: 72, category: "Regulatory", description: "Federal Trade Commission antitrust review probability" },
  { name: "DOJ Review", score: 58, category: "Regulatory", description: "Department of Justice second request probability" },
  { name: "EC Phase II", score: 45, category: "Regulatory", description: "European Commission in-depth investigation likelihood" },
  { name: "HSR Filing", score: 88, category: "Regulatory", description: "Hart-Scott-Rodino filing required above threshold" },
  { name: "Debt Financing", score: 34, category: "Financing", description: "Risk that acquisition debt cannot be placed at terms" },
  { name: "Market Disruption", score: 28, category: "Financing", description: "Credit market dislocation preventing deal financing" },
  { name: "Shareholder Vote", score: 41, category: "Strategic", description: "Target shareholder rejection probability" },
  { name: "Board Opposition", score: 22, category: "Strategic", description: "Board withdrawing support for the transaction" },
  { name: "Macro Shock", score: 35, category: "Market", description: "Economic downturn causing deal repricing or withdrawal" },
  { name: "Competing Bid", score: 18, category: "Strategic", description: "Third-party competing acquisition offer likelihood" },
];

// ── Helper functions ──────────────────────────────────────────────────────────

function pct(n: number, decimals = 2) {
  return `${n.toFixed(decimals)}%`;
}

function usd(n: number, decimals = 2) {
  return `$${n.toFixed(decimals)}`;
}

function statusColor(status: DealStatus) {
  switch (status) {
    case "Closing": return "text-emerald-400 bg-emerald-400/10";
    case "Pending": return "text-blue-400 bg-blue-400/10";
    case "Regulatory": return "text-amber-400 bg-amber-400/10";
    case "At Risk": return "text-red-400 bg-red-400/10";
  }
}

function riskColor(risk: "Low" | "Medium" | "High") {
  switch (risk) {
    case "Low": return "text-emerald-400";
    case "Medium": return "text-amber-400";
    case "High": return "text-red-400";
  }
}

function dealTypeColor(type: DealType) {
  switch (type) {
    case "Cash": return "text-blue-400 bg-blue-400/10";
    case "Stock": return "text-purple-400 bg-purple-400/10";
    case "Mixed": return "text-teal-400 bg-teal-400/10";
    case "LBO": return "text-orange-400 bg-orange-400/10";
  }
}

function categoryColor(cat: RiskFactor["category"]) {
  switch (cat) {
    case "Regulatory": return "#f59e0b";
    case "Financing": return "#3b82f6";
    case "Strategic": return "#8b5cf6";
    case "Market": return "#10b981";
  }
}

// ── SVG: Spread Distribution Chart ───────────────────────────────────────────

function SpreadDistributionChart() {
  const W = 480, H = 160, PAD = { t: 16, r: 16, b: 32, l: 40 };
  const cw = W - PAD.l - PAD.r;
  const ch = H - PAD.t - PAD.b;

  // Histogram of spread %
  const bins = [0, 1, 2, 3, 4, 5, 6, 7];
  const counts = bins.map((lo, i) => {
    const hi = bins[i + 1] ?? 8;
    return DEAL_DATA.filter((d) => d.spreadPct >= lo && d.spreadPct < hi).length;
  }).slice(0, bins.length - 1);

  const maxCount = Math.max(...counts, 1);
  const barW = cw / counts.length - 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Y gridlines */}
      {[0, 0.5, 1].map((frac) => {
        const y = PAD.t + ch * (1 - frac);
        return (
          <g key={frac}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#6b7280">
              {Math.round(frac * maxCount)}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {counts.map((count, i) => {
        const bh = (count / maxCount) * ch;
        const x = PAD.l + i * (cw / counts.length) + 2;
        const y = PAD.t + ch - bh;
        const spreadMid = bins[i] + 0.5;
        const fillColor = spreadMid < 2 ? "#3b82f6" : spreadMid < 4 ? "#8b5cf6" : "#f59e0b";
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={2} fill={fillColor} opacity={0.8} />
            <text x={x + barW / 2} textAnchor="middle" y={H - PAD.b + 14} fontSize={9} fill="#9ca3af">
              {bins[i]}–{bins[i + 1]}%
            </text>
          </g>
        );
      })}
      {/* Axis */}
      <line x1={PAD.l} x2={W - PAD.r} y1={PAD.t + ch} y2={PAD.t + ch} stroke="#4b5563" strokeWidth={1} />
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="#6b7280">
        Gross Spread %
      </text>
    </svg>
  );
}

// ── SVG: Risk Factor Heatmap ──────────────────────────────────────────────────

function RiskHeatmap() {
  const W = 520, H = 260, PAD = { t: 16, r: 16, b: 24, l: 140 };
  const cw = W - PAD.l - PAD.r;
  const ch = H - PAD.t - PAD.b;
  const rowH = ch / RISK_FACTORS.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* X gridlines */}
      {[0, 25, 50, 75, 100].map((val) => {
        const x = PAD.l + (val / 100) * cw;
        return (
          <g key={val}>
            <line x1={x} x2={x} y1={PAD.t} y2={PAD.t + ch} stroke="#374151" strokeWidth={0.5} />
            <text x={x} y={H - 8} textAnchor="middle" fontSize={8} fill="#6b7280">{val}</text>
          </g>
        );
      })}
      {/* Rows */}
      {RISK_FACTORS.map((rf, i) => {
        const y = PAD.t + i * rowH;
        const barW = (rf.score / 100) * cw;
        const col = categoryColor(rf.category);
        return (
          <g key={rf.name}>
            <text x={PAD.l - 6} y={y + rowH * 0.62} textAnchor="end" fontSize={9} fill="#d1d5db">
              {rf.name}
            </text>
            <rect
              x={PAD.l}
              y={y + 3}
              width={barW}
              height={rowH - 6}
              rx={2}
              fill={col}
              opacity={0.15 + (rf.score / 100) * 0.6}
            />
            <rect x={PAD.l + barW - 3} y={y + 3} width={3} height={rowH - 6} rx={1} fill={col} />
            <text x={PAD.l + barW + 4} y={y + rowH * 0.62} fontSize={9} fill="#9ca3af">
              {rf.score}
            </text>
          </g>
        );
      })}
      {/* Legend */}
      {(["Regulatory", "Financing", "Strategic", "Market"] as const).map((cat, i) => (
        <g key={cat} transform={`translate(${PAD.l + i * 95}, ${H - 4})`}>
          <rect width={8} height={8} rx={1} fill={categoryColor(cat)} y={-8} />
          <text x={11} y={0} fontSize={8} fill="#9ca3af">{cat}</text>
        </g>
      ))}
    </svg>
  );
}

// ── SVG: Return Distribution (Portfolio) ─────────────────────────────────────

function ReturnDistributionChart() {
  const W = 480, H = 160, PAD = { t: 16, r: 16, b: 32, l: 40 };
  const cw = W - PAD.l - PAD.r;
  const ch = H - PAD.t - PAD.b;

  // Synthetic historical monthly arb spread returns (normal-ish, slightly positive skew)
  const returns = Array.from({ length: 40 }, (_, i) => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const r1 = s / 0x7fffffff;
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const r2 = s / 0x7fffffff;
    return parseFloat((0.6 + Math.sqrt(-2 * Math.log(r1)) * Math.cos(2 * Math.PI * r2) * 0.8).toFixed(2));
  });

  const bins = [-1, 0, 0.5, 1, 1.5, 2, 2.5, 3, 4];
  const counts = bins.slice(0, -1).map((lo, i) => {
    const hi = bins[i + 1];
    return returns.filter((r) => r >= lo && r < hi).length;
  });
  const maxCount = Math.max(...counts, 1);
  const barW = cw / counts.length - 3;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[0, 0.5, 1].map((frac) => {
        const y = PAD.t + ch * (1 - frac);
        return (
          <g key={frac}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#6b7280">
              {Math.round(frac * maxCount)}
            </text>
          </g>
        );
      })}
      {counts.map((count, i) => {
        const bh = (count / maxCount) * ch;
        const x = PAD.l + i * (cw / counts.length) + 1.5;
        const y = PAD.t + ch - bh;
        const isNeg = bins[i] < 0;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={2} fill={isNeg ? "#ef4444" : "#10b981"} opacity={0.75} />
            <text x={x + barW / 2} textAnchor="middle" y={H - PAD.b + 14} fontSize={8} fill="#9ca3af">
              {bins[i]}%
            </text>
          </g>
        );
      })}
      <line x1={PAD.l} x2={W - PAD.r} y1={PAD.t + ch} y2={PAD.t + ch} stroke="#4b5563" strokeWidth={1} />
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="#6b7280">
        Monthly Return %
      </text>
    </svg>
  );
}

// ── SVG: Annualized Return vs Spread (scatter) ────────────────────────────────

function SpreadReturnScatter() {
  const W = 420, H = 180, PAD = { t: 16, r: 16, b: 32, l: 44 };
  const cw = W - PAD.l - PAD.r;
  const ch = H - PAD.t - PAD.b;

  const maxSpread = 7, maxReturn = 35;

  const points = DEAL_DATA.map((d) => ({
    x: PAD.l + (d.spreadPct / maxSpread) * cw,
    y: PAD.t + ch - (d.annualizedReturn / maxReturn) * ch,
    spread: d.spreadPct,
    ret: d.annualizedReturn,
    risk: d.regulatoryRisk,
    name: d.target.split(" ")[0],
  }));

  const dotColor = (r: string) => r === "Low" ? "#10b981" : r === "Medium" ? "#f59e0b" : "#ef4444";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[0, 25, 50, 75, 100].map((pctVal) => {
        const y = PAD.t + ch * (1 - pctVal / 100);
        const label = ((pctVal / 100) * maxReturn).toFixed(0);
        return (
          <g key={pctVal}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#6b7280">{label}%</text>
          </g>
        );
      })}
      {[0, 25, 50, 75, 100].map((pctVal) => {
        const x = PAD.l + (pctVal / 100) * cw;
        const label = ((pctVal / 100) * maxSpread).toFixed(1);
        return (
          <g key={pctVal}>
            <line x1={x} x2={x} y1={PAD.t} y2={PAD.t + ch} stroke="#374151" strokeWidth={0.5} />
            <text x={x} y={H - PAD.b + 13} textAnchor="middle" fontSize={9} fill="#6b7280">{label}%</text>
          </g>
        );
      })}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={5} fill={dotColor(p.risk)} opacity={0.85} />
          <text x={p.x + 7} y={p.y + 4} fontSize={8} fill="#9ca3af">{p.name}</text>
        </g>
      ))}
      {/* Axis labels */}
      <line x1={PAD.l} x2={W - PAD.r} y1={PAD.t + ch} y2={PAD.t + ch} stroke="#4b5563" />
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="#6b7280">Gross Spread %</text>
      <text
        transform={`rotate(-90)`}
        x={-(PAD.t + ch / 2)}
        y={12}
        textAnchor="middle"
        fontSize={9}
        fill="#6b7280"
      >
        Annualized Return %
      </text>
    </svg>
  );
}

// ── Tab 1: Deal Tracker ───────────────────────────────────────────────────────

function DealTracker() {
  const [sortKey, setSortKey] = useState<keyof Deal>("spreadPct");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<DealStatus | "All">("All");

  const sorted = useMemo(() => {
    const filtered = filter === "All" ? DEAL_DATA : DEAL_DATA.filter((d) => d.status === filter);
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === "string" ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [sortKey, sortDir, filter]);

  const toggle = (key: keyof Deal) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: keyof Deal }) =>
    sortKey === k ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null;

  const summaryStats = useMemo(() => ({
    avgSpread: DEAL_DATA.reduce((a, d) => a + d.spreadPct, 0) / DEAL_DATA.length,
    avgAnnualized: DEAL_DATA.reduce((a, d) => a + d.annualizedReturn, 0) / DEAL_DATA.length,
    totalDealValue: DEAL_DATA.reduce((a, d) => a + d.dealValue, 0),
    atRisk: DEAL_DATA.filter((d) => d.status === "At Risk").length,
  }), []);

  return (
    <div className="space-y-6">
      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Avg Gross Spread", value: pct(summaryStats.avgSpread), icon: TrendingUp, color: "text-blue-400" },
          { label: "Avg Ann. Return", value: pct(summaryStats.avgAnnualized, 1), icon: BarChart2, color: "text-emerald-400" },
          { label: "Total Deal Value", value: `$${summaryStats.totalDealValue.toFixed(0)}B`, icon: Layers, color: "text-purple-400" },
          { label: "At-Risk Deals", value: summaryStats.atRisk.toString(), icon: AlertTriangle, color: "text-red-400" },
        ].map((chip) => (
          <div key={chip.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <chip.icon className={cn("w-4 h-4", chip.color)} />
              <span className="text-xs text-zinc-500">{chip.label}</span>
            </div>
            <div className={cn("text-xl font-semibold", chip.color)}>{chip.value}</div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(["All", "Pending", "Regulatory", "Closing", "At Risk"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              filter === f
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Spread distribution chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Spread Distribution</h3>
        <SpreadDistributionChart />
      </div>

      {/* Deal table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {[
                { label: "Acquirer", key: "acquirer" as keyof Deal },
                { label: "Target", key: "target" as keyof Deal },
                { label: "Deal Price", key: "dealPrice" as keyof Deal },
                { label: "Current", key: "currentPrice" as keyof Deal },
                { label: "Spread $", key: "spreadDollar" as keyof Deal },
                { label: "Spread %", key: "spreadPct" as keyof Deal },
                { label: "Ann. Ret.", key: "annualizedReturn" as keyof Deal },
                { label: "Type", key: "dealType" as keyof Deal },
                { label: "Close", key: "expectedClose" as keyof Deal },
                { label: "Reg Risk", key: "regulatoryRisk" as keyof Deal },
                { label: "Status", key: "status" as keyof Deal },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggle(col.key)}
                  className="text-left px-3 py-3 text-xs text-zinc-500 font-medium cursor-pointer hover:text-zinc-300 select-none whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon k={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((deal) => (
              <tr key={deal.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-3 py-2.5 text-zinc-200 whitespace-nowrap font-medium">{deal.acquirer}</td>
                <td className="px-3 py-2.5 text-zinc-300 whitespace-nowrap">{deal.target}</td>
                <td className="px-3 py-2.5 text-zinc-200 font-mono">{usd(deal.dealPrice)}</td>
                <td className="px-3 py-2.5 text-zinc-200 font-mono">{usd(deal.currentPrice)}</td>
                <td className="px-3 py-2.5 text-emerald-400 font-mono">{usd(deal.spreadDollar)}</td>
                <td className="px-3 py-2.5 text-emerald-400 font-mono font-semibold">{pct(deal.spreadPct)}</td>
                <td className="px-3 py-2.5 text-blue-400 font-mono">{pct(deal.annualizedReturn, 1)}</td>
                <td className="px-3 py-2.5">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", dealTypeColor(deal.dealType))}>
                    {deal.dealType}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-zinc-400 whitespace-nowrap">{deal.expectedClose}</td>
                <td className={cn("px-3 py-2.5 font-medium", riskColor(deal.regulatoryRisk))}>{deal.regulatoryRisk}</td>
                <td className="px-3 py-2.5">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColor(deal.status))}>
                    {deal.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 2: Arb Mechanics ──────────────────────────────────────────────────────

function ArbMechanics() {
  const [dealPrice, setDealPrice] = useState(100);
  const [currentPrice, setCurrentPrice] = useState(97);
  const [daysToClose, setDaysToClose] = useState(120);
  const [breakProb, setBreakProb] = useState(5);
  const [breakdownPrice, setBreakdownPrice] = useState(80);

  const grossSpread = dealPrice - currentPrice;
  const grossSpreadPct = (grossSpread / currentPrice) * 100;
  const annualizedReturn = (grossSpreadPct / (daysToClose / 365));
  const expectedValue = (1 - breakProb / 100) * grossSpread + (breakProb / 100) * (breakdownPrice - currentPrice);
  const evPct = (expectedValue / currentPrice) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-400" />
            Arb Return Calculator
          </h3>
          {[
            { label: "Deal Price ($)", value: dealPrice, setter: setDealPrice, min: 10, max: 500, step: 0.5 },
            { label: "Current Market Price ($)", value: currentPrice, setter: setCurrentPrice, min: 5, max: 499, step: 0.5 },
            { label: "Days to Close", value: daysToClose, setter: setDaysToClose, min: 7, max: 365, step: 1 },
            { label: "Break Probability (%)", value: breakProb, setter: setBreakProb, min: 0, max: 50, step: 0.5 },
            { label: "Price on Break ($)", value: breakdownPrice, setter: setBreakdownPrice, min: 1, max: 200, step: 0.5 },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-zinc-400">{item.label}</label>
                <span className="text-xs font-mono text-zinc-200">{item.value}</span>
              </div>
              <input
                type="range"
                min={item.min}
                max={item.max}
                step={item.step}
                value={item.value}
                onChange={(e) => item.setter(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Return Metrics
            </h3>
            <div className="space-y-3">
              {[
                { label: "Gross Spread ($)", value: `$${grossSpread.toFixed(2)}`, color: grossSpread > 0 ? "text-emerald-400" : "text-red-400" },
                { label: "Gross Spread (%)", value: pct(grossSpreadPct), color: "text-emerald-400" },
                { label: "Annualized Return", value: pct(annualizedReturn, 1), color: "text-blue-400" },
                { label: "Expected Value ($)", value: `$${expectedValue.toFixed(2)}`, color: expectedValue > 0 ? "text-emerald-400" : "text-red-400" },
                { label: "Expected Value (%)", value: pct(evPct), color: evPct > 0 ? "text-emerald-400" : "text-red-400" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-zinc-800">
                  <span className="text-sm text-zinc-400">{row.label}</span>
                  <span className={cn("text-sm font-mono font-semibold", row.color)}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scatter chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Spread vs Annualized Return</h3>
            <SpreadReturnScatter />
            <div className="flex gap-3 mt-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Low Risk</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Medium Risk</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />High Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* EV Formula explainer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-200 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />
          Expected Value Formula
        </h3>
        <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm text-zinc-300 mb-4">
          EV = P(close) × (Deal Price − Current Price) + P(break) × (Break Price − Current Price)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {[
            {
              title: "Gross Spread",
              desc: "The difference between the announced deal price and where the target trades in the market. Reflects deal risk and time value.",
            },
            {
              title: "Annualized Return",
              desc: "Gross spread scaled to an annual rate: (Spread% / Days) × 365. Allows comparison across deals with different timelines.",
            },
            {
              title: "Deal Break Risk",
              desc: "Probability-weighted downside if the deal fails. Stocks often trade 20–40% below deal price when a transaction collapses.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-blue-400 font-medium mb-1">{item.title}</div>
              <div className="text-zinc-400 text-xs leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Risk Analysis ──────────────────────────────────────────────────────

function RiskAnalysis() {
  const [selectedDeal, setSelectedDeal] = useState(DEAL_DATA[0]);

  const scenarios = [
    { name: "Deal Closes On Time", prob: 65, outcome: "+Spread", pnl: selectedDeal.spreadPct, color: "emerald" },
    { name: "Deal Closes Late (+60d)", prob: 15, outcome: "+Reduced Annualized", pnl: selectedDeal.spreadPct * 0.7, color: "blue" },
    { name: "Deal Renegotiated", prob: 8, outcome: "+Partial Spread", pnl: selectedDeal.spreadPct * 0.4, color: "amber" },
    { name: "Regulatory Block", prob: 7, outcome: "−20–40% from deal px", pnl: -25, color: "orange" },
    { name: "Deal Break", prob: 5, outcome: "−30–50% from deal px", pnl: -35, color: "red" },
  ];

  const regulatorySteps = [
    { agency: "HSR Filing", threshold: "$119.5M deal value", timing: "30-day initial review", risk: "Required" },
    { agency: "FTC", body: "Federal Trade Commission", focus: "Consumer harm, market concentration", timing: "Second request: +30 days" },
    { agency: "DOJ", body: "Department of Justice", focus: "Vertical integration, platform monopoly", timing: "Second request: +30 days" },
    { agency: "EC", body: "European Commission", focus: "EU market competition", timing: "Phase II: 90 working days" },
    { agency: "CFIUS", body: "Committee on Foreign Investment", focus: "National security (foreign acquirer)", timing: "45-day review + 45-day investigation" },
  ];

  return (
    <div className="space-y-6">
      {/* Deal selector */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <label className="text-xs text-zinc-500 block mb-2">Select Deal for Scenario Analysis</label>
        <div className="flex gap-2 flex-wrap">
          {DEAL_DATA.slice(0, 5).map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDeal(d)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs border transition-colors",
                selectedDeal.id === d.id
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
              )}
            >
              {d.target.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Risk heatmap */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-200 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          Risk Factor Heatmap
        </h3>
        <RiskHeatmap />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario analysis */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-200 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-400" />
            Deal Break Scenarios — {selectedDeal.target.split(" ")[0]}
          </h3>
          <div className="space-y-3">
            {scenarios.map((sc) => (
              <div key={sc.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">{sc.name}</span>
                  <div className="flex gap-3">
                    <span className="text-zinc-500">{sc.prob}%</span>
                    <span
                      className={cn(
                        "font-mono font-semibold",
                        sc.pnl > 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {sc.pnl > 0 ? "+" : ""}{sc.pnl.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      sc.color === "emerald" ? "bg-emerald-500" :
                        sc.color === "blue" ? "bg-blue-500" :
                          sc.color === "amber" ? "bg-amber-500" :
                            sc.color === "orange" ? "bg-orange-500" : "bg-red-500"
                    )}
                    style={{ width: `${sc.prob * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Probability-Weighted EV</span>
              <span className={cn(
                "font-mono font-semibold",
                scenarios.reduce((a, sc) => a + sc.pnl * sc.prob / 100, 0) > 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {scenarios.reduce((a, sc) => a + sc.pnl * sc.prob / 100, 0).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Regulatory process */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-200 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Regulatory Review Process
          </h3>
          <div className="space-y-3">
            {regulatorySteps.map((step, i) => (
              <div key={step.agency} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  {i < regulatorySteps.length - 1 && <div className="w-px flex-1 bg-zinc-800 mt-1" />}
                </div>
                <div className="pb-3 min-w-0">
                  <div className="text-sm font-medium text-zinc-200">{step.agency}</div>
                  {step.focus && <div className="text-xs text-zinc-400">{step.focus}</div>}
                  <div className="text-xs text-zinc-500 mt-0.5">{step.timing}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hostile vs Friendly */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-200 mb-4">Hostile vs Friendly Acquisitions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              type: "Friendly",
              icon: CheckCircle2,
              color: "text-emerald-400",
              bg: "bg-emerald-400/5 border-emerald-400/20",
              points: [
                "Board approval already obtained",
                "Management cooperation reduces friction",
                "Faster regulatory timeline",
                "Lower deal break probability (8–12%)",
                "Typical spread: 2–5%",
              ],
            },
            {
              type: "Hostile",
              icon: AlertTriangle,
              color: "text-red-400",
              bg: "bg-red-400/5 border-red-400/20",
              points: [
                "Tender offer directly to shareholders",
                "Board resistance may trigger poison pill",
                "Higher litigation risk",
                "Higher break probability (15–30%)",
                "Typical spread: 6–15% (reflects risk premium)",
              ],
            },
          ].map((item) => (
            <div key={item.type} className={cn("rounded-xl border p-4", item.bg)}>
              <div className={cn("flex items-center gap-2 mb-3 font-semibold", item.color)}>
                <item.icon className="w-4 h-4" />
                {item.type} Acquisition
              </div>
              <ul className="space-y-1.5">
                {item.points.map((p) => (
                  <li key={p} className="text-xs text-zinc-400 flex gap-2">
                    <span className="text-zinc-600">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Special Situations ─────────────────────────────────────────────────

function SpecialSituations() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const returnProfileData: Array<{ type: string; low: number; high: number; color: string }> = [
    { type: "Tender Offer", low: 3, high: 12, color: "#3b82f6" },
    { type: "Rights Offering", low: 2, high: 8, color: "#8b5cf6" },
    { type: "Spin-Off", low: 5, high: 25, color: "#10b981" },
    { type: "Stub Trade", low: -10, high: 30, color: "#f59e0b" },
    { type: "Recap", low: 4, high: 12, color: "#06b6d4" },
    { type: "Distressed", low: -20, high: 50, color: "#ef4444" },
  ];

  const W = 480, H = 160, PAD = { t: 16, r: 16, b: 36, l: 100 };
  const cw = W - PAD.l - PAD.r;
  const ch = H - PAD.t - PAD.b;
  const minVal = -25, maxVal = 55, range = maxVal - minVal;

  const toX = (v: number) => PAD.l + ((v - minVal) / range) * cw;

  return (
    <div className="space-y-6">
      {/* Return profile SVG */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-200 mb-3">Return Profiles by Situation Type</h3>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* Zero line */}
          <line x1={toX(0)} x2={toX(0)} y1={PAD.t} y2={PAD.t + ch} stroke="#4b5563" strokeWidth={1.5} />
          {[-20, -10, 0, 10, 20, 30, 40, 50].map((v) => (
            <g key={v}>
              <line x1={toX(v)} x2={toX(v)} y1={PAD.t} y2={PAD.t + ch} stroke="#374151" strokeWidth={0.5} />
              <text x={toX(v)} y={PAD.t + ch + 14} textAnchor="middle" fontSize={8} fill="#6b7280">{v}%</text>
            </g>
          ))}
          {returnProfileData.map((item, i) => {
            const rowH = ch / returnProfileData.length;
            const y = PAD.t + i * rowH + rowH * 0.2;
            const barH = rowH * 0.6;
            return (
              <g key={item.type}>
                <text x={PAD.l - 6} y={y + barH * 0.7} textAnchor="end" fontSize={9} fill="#d1d5db">{item.type}</text>
                <rect
                  x={toX(Math.min(item.low, 0))}
                  y={y}
                  width={Math.abs(toX(item.high) - toX(item.low))}
                  height={barH}
                  rx={3}
                  fill={item.color}
                  opacity={0.25}
                />
                <rect x={toX(item.low) - 2} y={y} width={4} height={barH} rx={1} fill={item.color} opacity={0.8} />
                <rect x={toX(item.high) - 2} y={y} width={4} height={barH} rx={1} fill={item.color} opacity={0.8} />
                <text x={toX(item.low) - 4} y={y + barH * 0.75} textAnchor="end" fontSize={8} fill={item.color}>{item.low}%</text>
                <text x={toX(item.high) + 4} y={y + barH * 0.75} fontSize={8} fill={item.color}>{item.high}%</text>
              </g>
            );
          })}
          <line x1={PAD.l} x2={W - PAD.r} y1={PAD.t + ch} y2={PAD.t + ch} stroke="#4b5563" />
        </svg>
      </div>

      {/* Situation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SPECIAL_SITUATIONS.map((sit) => (
          <motion.div
            key={sit.type}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
            layout
          >
            <button
              className="w-full p-4 text-left hover:bg-zinc-800/30 transition-colors"
              onClick={() => setExpanded(expanded === sit.type ? null : sit.type)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-zinc-200">{sit.type}</div>
                  <div className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{sit.description}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={cn("text-xs font-medium", riskColor(sit.riskLevel))}>
                    {sit.riskLevel} Risk
                  </span>
                  {expanded === sit.type ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </div>
              </div>
            </button>
            <AnimatePresence>
              {expanded === sit.type && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-zinc-500">Typical Return</span>
                        <div className="text-emerald-400 font-medium mt-0.5">{sit.typicalReturn}</div>
                      </div>
                      <div>
                        <span className="text-zinc-500">Time Horizon</span>
                        <div className="text-blue-400 font-medium mt-0.5">{sit.timeHorizon}</div>
                      </div>
                      <div>
                        <span className="text-zinc-500">Complexity</span>
                        <div className="text-zinc-300 font-medium mt-0.5">{sit.complexity}</div>
                      </div>
                      <div>
                        <span className="text-zinc-500">Risk Level</span>
                        <div className={cn("font-medium mt-0.5", riskColor(sit.riskLevel))}>{sit.riskLevel}</div>
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="text-xs text-zinc-500 mb-1">Example</div>
                      <div className="text-xs text-zinc-300">{sit.example}</div>
                    </div>
                    <div className="bg-red-400/5 border border-red-400/20 rounded-lg p-3">
                      <div className="text-xs text-red-400 mb-1 font-medium">Key Risk</div>
                      <div className="text-xs text-zinc-400">{sit.keyRisk}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {["Situation", "Typical Return", "Time Horizon", "Risk", "Complexity"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPECIAL_SITUATIONS.map((sit) => (
              <tr key={sit.type} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="px-4 py-3 text-zinc-200 font-medium">{sit.type}</td>
                <td className="px-4 py-3 text-emerald-400 font-mono text-xs">{sit.typicalReturn}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{sit.timeHorizon}</td>
                <td className={cn("px-4 py-3 text-xs font-medium", riskColor(sit.riskLevel))}>{sit.riskLevel}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{sit.complexity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 5: Portfolio Construction ─────────────────────────────────────────────

function PortfolioConstruction() {
  const [accountSize, setAccountSize] = useState(1000000);
  const [maxSinglePosition, setMaxSinglePosition] = useState(10);
  const [targetDeals, setTargetDeals] = useState(8);
  const [highConviction, setHighConviction] = useState(3);

  const positionSizes = useMemo(() => {
    const base = accountSize / targetDeals;
    const highConvBase = (accountSize * (maxSinglePosition / 100));
    const lowConvBase = (accountSize - highConviction * highConvBase) / (targetDeals - highConviction);

    return DEAL_DATA.slice(0, targetDeals).map((d, i) => {
      const isHigh = i < highConviction;
      const size = isHigh ? highConvBase : Math.min(lowConvBase, base);
      const pct_ = (size / accountSize) * 100;
      return { deal: d, size, pct: pct_, conviction: isHigh ? "High" : "Normal" };
    });
  }, [accountSize, maxSinglePosition, targetDeals, highConviction]);

  const totalAllocated = positionSizes.reduce((a, p) => a + p.size, 0);
  const cash = accountSize - totalAllocated;
  const expReturn = positionSizes.reduce((a, p) => a + p.size * (p.deal.spreadPct / 100) * (p.deal.daysToClose / 365), 0);

  // Correlation heatmap data (synthetic)
  const corrMatrix = useMemo(() => {
    const n = Math.min(6, targetDeals);
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => {
        if (i === j) return 1;
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        const base = s / 0x7fffffff;
        return parseFloat((base * 0.6 - 0.1).toFixed(2));
      })
    );
  }, [targetDeals]);

  const cellSize = 52;
  const matN = corrMatrix.length;
  const matW = matN * cellSize + 80;
  const matH = matN * cellSize + 60;

  const corrColor = (v: number) => {
    if (v >= 0.5) return "#ef4444";
    if (v >= 0.2) return "#f59e0b";
    if (v >= 0) return "#6b7280";
    return "#10b981";
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-400" />
          Portfolio Parameters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              label: "Account Size",
              value: accountSize,
              setter: setAccountSize,
              min: 100000,
              max: 10000000,
              step: 100000,
              display: `$${(accountSize / 1000000).toFixed(2)}M`,
            },
            {
              label: "Max Single Position %",
              value: maxSinglePosition,
              setter: setMaxSinglePosition,
              min: 5,
              max: 25,
              step: 1,
              display: `${maxSinglePosition}%`,
            },
            {
              label: "Target Number of Deals",
              value: targetDeals,
              setter: setTargetDeals,
              min: 3,
              max: 10,
              step: 1,
              display: `${targetDeals} deals`,
            },
            {
              label: "High Conviction Positions",
              value: highConviction,
              setter: setHighConviction,
              min: 1,
              max: Math.min(5, targetDeals - 1),
              step: 1,
              display: `${highConviction} deals`,
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-zinc-400">{item.label}</label>
                <span className="text-xs font-mono text-zinc-200">{item.display}</span>
              </div>
              <input
                type="range"
                min={item.min}
                max={item.max}
                step={item.step}
                value={item.value}
                onChange={(e) => item.setter(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-200 text-sm">Position Sizing</h3>
            <div className="text-xs text-zinc-500">
              Cash: <span className="text-amber-400 font-mono">${(cash / 1000).toFixed(0)}K</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-3 py-2 text-zinc-500 font-medium">Target</th>
                  <th className="text-left px-3 py-2 text-zinc-500 font-medium">Size $</th>
                  <th className="text-left px-3 py-2 text-zinc-500 font-medium">Size %</th>
                  <th className="text-left px-3 py-2 text-zinc-500 font-medium">Spread</th>
                  <th className="text-left px-3 py-2 text-zinc-500 font-medium">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {positionSizes.map((pos) => (
                  <tr key={pos.deal.id} className="border-b border-zinc-800/50">
                    <td className="px-3 py-2 text-zinc-300">{pos.deal.target.split(" ")[0]}</td>
                    <td className="px-3 py-2 text-zinc-200 font-mono">${(pos.size / 1000).toFixed(0)}K</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={pos.conviction === "High" ? "h-full bg-blue-500 rounded-full" : "h-full bg-zinc-600 rounded-full"}
                            style={{ width: `${Math.min(pos.pct * 4, 100)}%` }}
                          />
                        </div>
                        <span className={pos.conviction === "High" ? "text-blue-400" : "text-zinc-400"}>
                          {pos.pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-emerald-400 font-mono">{pos.deal.spreadPct.toFixed(1)}%</td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-xs",
                        pos.conviction === "High" ? "bg-blue-400/10 text-blue-400" : "bg-zinc-700 text-zinc-400"
                      )}>
                        {pos.conviction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-zinc-800 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-zinc-500">Total Allocated</span>
              <div className="text-zinc-200 font-mono font-semibold">${(totalAllocated / 1000000).toFixed(2)}M</div>
            </div>
            <div>
              <span className="text-zinc-500">Expected Annual Return</span>
              <div className="text-emerald-400 font-mono font-semibold">${(expReturn / 1000).toFixed(0)}K ({(expReturn / accountSize * 100).toFixed(1)}%)</div>
            </div>
          </div>
        </div>

        {/* Correlation matrix */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="font-semibold text-zinc-200 mb-3 flex items-center gap-2 text-sm">
            <PieChart className="w-4 h-4 text-purple-400" />
            Deal Correlation Matrix
          </h3>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${matW} ${matH}`} className="w-full h-auto">
              {corrMatrix.map((row, i) =>
                row.map((val, j) => {
                  const x = 70 + j * cellSize;
                  const y = 30 + i * cellSize;
                  const col = corrColor(val);
                  return (
                    <g key={`${i}-${j}`}>
                      <rect
                        x={x + 2}
                        y={y + 2}
                        width={cellSize - 4}
                        height={cellSize - 4}
                        rx={3}
                        fill={col}
                        opacity={i === j ? 0.5 : Math.abs(val) * 0.6 + 0.1}
                      />
                      <text
                        x={x + cellSize / 2}
                        y={y + cellSize / 2 + 4}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight="600"
                        fill="white"
                      >
                        {val.toFixed(2)}
                      </text>
                    </g>
                  );
                })
              )}
              {corrMatrix.map((_, i) => {
                const label = positionSizes[i]?.deal.target.split(" ")[0] ?? `D${i + 1}`;
                return (
                  <g key={i}>
                    <text x={65} y={30 + i * cellSize + cellSize / 2 + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{label}</text>
                    <text x={70 + i * cellSize + cellSize / 2} y={22} textAnchor="middle" fontSize={9} fill="#9ca3af">{label}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex gap-4 text-xs text-zinc-500 mt-2">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block opacity-60" />Negative</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-zinc-500 inline-block opacity-60" />Neutral</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block opacity-60" />Moderate</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block opacity-60" />High</span>
          </div>
        </div>
      </div>

      {/* Return distribution */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-200 mb-3 flex items-center gap-2 text-sm">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          Historical Arb Spread Monthly Return Distribution
        </h3>
        <ReturnDistributionChart />
        <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
          {[
            { label: "Avg Monthly Return", value: "0.61%", color: "text-emerald-400" },
            { label: "Annualized (est.)", value: "7.5%", color: "text-blue-400" },
            { label: "Max Drawdown", value: "−4.2%", color: "text-red-400" },
          ].map((m) => (
            <div key={m.label} className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <div className="text-zinc-500 mb-1">{m.label}</div>
              <div className={cn("font-mono font-semibold text-sm", m.color)}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk limits */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-200 mb-4">Risk Limits Framework</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { rule: "Single Position Max", limit: `${maxSinglePosition}% of NAV`, status: "Active" },
            { rule: "Max Gross Exposure", limit: "150% of NAV", status: "Active" },
            { rule: "Max Cash Deals", limit: "60% of portfolio", status: "Active" },
            { rule: "Sector Concentration", limit: "30% per sector", status: "Active" },
            { rule: "Regulatory Risk Cap", limit: "25% in 'High' risk deals", status: "Active" },
            { rule: "Stop-Loss Trigger", limit: "5% portfolio drawdown → reduce 50%", status: "Active" },
          ].map((r) => (
            <div key={r.rule} className="flex items-start justify-between gap-3 bg-zinc-800/40 rounded-lg p-3">
              <div>
                <div className="text-xs font-medium text-zinc-300">{r.rule}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{r.limit}</div>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full flex-shrink-0">{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MergerArbPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Merger Arbitrage</h1>
        </div>
        <p className="text-sm text-zinc-400 ml-11">
          Event-driven investing — capture deal spreads, manage break risk, construct diversified arb portfolios.
        </p>
      </div>

      <Tabs defaultValue="deals" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800 flex-wrap h-auto gap-1 p-1">
          {[
            { value: "deals", label: "Deal Tracker", icon: BarChart2 },
            { value: "mechanics", label: "Arb Mechanics", icon: Calculator },
            { value: "risk", label: "Risk Analysis", icon: Shield },
            { value: "special", label: "Special Situations", icon: Layers },
            { value: "portfolio", label: "Portfolio Construction", icon: PieChart },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-zinc-400 text-xs sm:text-sm flex items-center gap-1.5"
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="deals" className="data-[state=inactive]:hidden">
          <DealTracker />
        </TabsContent>
        <TabsContent value="mechanics" className="data-[state=inactive]:hidden">
          <ArbMechanics />
        </TabsContent>
        <TabsContent value="risk" className="data-[state=inactive]:hidden">
          <RiskAnalysis />
        </TabsContent>
        <TabsContent value="special" className="data-[state=inactive]:hidden">
          <SpecialSituations />
        </TabsContent>
        <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
          <PortfolioConstruction />
        </TabsContent>
      </Tabs>
    </div>
  );
}
