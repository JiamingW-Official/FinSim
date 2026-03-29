"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Users,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  DollarSign,
  BarChart3,
  Activity,
  Target,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  GitBranch,
  Building2,
  Scale,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ─────────────────────────────────────────────────────────────
let s = 911;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 911;
}

// ── Types ───────────────────────────────────────────────────────────────────

interface PodPM {
  id: string;
  name: string;
  strategy: string;
  aum: number; // $M
  ytdPnl: number; // %
  sharpe: number;
  drawdown: number; // current dd %
  drawdownLimit: number; // hard stop %
  status: "active" | "flat" | "stopped";
  headcount: number;
  annualCost: number; // $M
  seeding: "internal" | "external" | "co-invest";
}

interface StrategyAlloc {
  name: string;
  pct: number;
  color: string;
  avgSharpe: number;
  capacity: number; // $B
}

interface PodCorrelation {
  strategies: string[];
  matrix: number[][];
}

interface RiskMetric {
  label: string;
  value: string;
  limit: string;
  pctUsed: number;
  color: string;
}

interface FundEconomics {
  name: string;
  aum: number; // $B
  returnYtd: number;
  expenseRatio: number;
  perfFee: number;
  color: string;
}

interface ReturnDataPoint {
  year: string;
  multiStrat: number;
  singleStrat: number;
  spx: number;
}

// ── Static seeded data ───────────────────────────────────────────────────────

function buildPodPMs(): PodPM[] {
  resetSeed();
  const templates: Omit<PodPM, "sharpe" | "drawdown">[] = [
    { id: "p1", name: "Alpha Equities Pod", strategy: "Equity L/S", aum: 2400, ytdPnl: 8.2, drawdownLimit: -8, status: "active", headcount: 12, annualCost: 18, seeding: "internal" },
    { id: "p2", name: "Event Driven Pod", strategy: "Merger Arb", aum: 1100, ytdPnl: 4.7, drawdownLimit: -6, status: "active", headcount: 8, annualCost: 11, seeding: "internal" },
    { id: "p3", name: "Quant Alpha Pod", strategy: "Quant/Stat Arb", aum: 1800, ytdPnl: 11.4, drawdownLimit: -10, status: "active", headcount: 22, annualCost: 28, seeding: "co-invest" },
    { id: "p4", name: "Global Macro Pod", strategy: "Macro", aum: 900, ytdPnl: -3.1, drawdownLimit: -8, status: "flat", headcount: 6, annualCost: 9, seeding: "external" },
    { id: "p5", name: "Credit Opps Pod", strategy: "Credit", aum: 1400, ytdPnl: 6.3, drawdownLimit: -7, status: "active", headcount: 10, annualCost: 14, seeding: "internal" },
    { id: "p6", name: "Commodities Pod", strategy: "Commodities", aum: 600, ytdPnl: -5.2, drawdownLimit: -8, status: "stopped", headcount: 5, annualCost: 7, seeding: "co-invest" },
    { id: "p7", name: "Volatility Pod", strategy: "Vol Trading", aum: 700, ytdPnl: 9.1, drawdownLimit: -9, status: "active", headcount: 7, annualCost: 10, seeding: "internal" },
    { id: "p8", name: "Asia Pacific Pod", strategy: "Equity L/S", aum: 800, ytdPnl: 5.8, drawdownLimit: -8, status: "active", headcount: 9, annualCost: 12, seeding: "external" },
  ];
  return templates.map((t) => ({
    ...t,
    sharpe: +(rand() * 1.5 + 0.8).toFixed(2),
    drawdown: +(rand() * -t.drawdownLimit * 0.9).toFixed(1),
  }));
}

function buildStrategyAllocs(): StrategyAlloc[] {
  return [
    { name: "Equity L/S", pct: 35, color: "#6366f1", avgSharpe: 1.3, capacity: 80 },
    { name: "Merger Arb", pct: 12, color: "#22c55e", avgSharpe: 1.1, capacity: 20 },
    { name: "Quant/Stat Arb", pct: 18, color: "#06b6d4", avgSharpe: 1.8, capacity: 40 },
    { name: "Macro", pct: 10, color: "#f59e0b", avgSharpe: 0.9, capacity: 30 },
    { name: "Credit", pct: 13, color: "#a78bfa", avgSharpe: 1.2, capacity: 25 },
    { name: "Commodities", pct: 6, color: "#f97316", avgSharpe: 0.7, capacity: 10 },
    { name: "Vol Trading", pct: 6, color: "#ec4899", avgSharpe: 1.4, capacity: 15 },
  ];
}

function buildCorrelation(): PodCorrelation {
  resetSeed();
  rand(); rand(); rand(); rand();
  const strategies = ["Eq L/S", "Merger", "Quant", "Macro", "Credit", "Vol"];
  const base = [
    [1.00, 0.22, 0.18, 0.12, 0.35, -0.08],
    [0.22, 1.00, 0.10, 0.05, 0.28, 0.03],
    [0.18, 0.10, 1.00, 0.08, 0.14, 0.22],
    [0.12, 0.05, 0.08, 1.00, 0.31, 0.19],
    [0.35, 0.28, 0.14, 0.31, 1.00, 0.06],
    [-0.08, 0.03, 0.22, 0.19, 0.06, 1.00],
  ];
  return { strategies, matrix: base };
}

function buildRiskMetrics(): RiskMetric[] {
  return [
    { label: "Portfolio VaR (1-day 99%)", value: "$142M", limit: "$200M", pctUsed: 71, color: "#f59e0b" },
    { label: "Gross Exposure", value: "6.4x NAV", limit: "8.0x NAV", pctUsed: 80, color: "#f97316" },
    { label: "Net Exposure", value: "22%", limit: "40%", pctUsed: 55, color: "#22c55e" },
    { label: "Beta to SPX", value: "0.18", limit: "0.30", pctUsed: 60, color: "#06b6d4" },
    { label: "Factor Concentration (top)", value: "8.2%", limit: "15%", pctUsed: 55, color: "#6366f1" },
    { label: "Liquidity Stress Loss", value: "$380M", limit: "$600M", pctUsed: 63, color: "#a78bfa" },
    { label: "Tail Risk (CVaR 97.5%)", value: "$210M", limit: "$320M", pctUsed: 66, color: "#ec4899" },
    { label: "Correlation to HY Credit", value: "0.31", limit: "0.50", pctUsed: 62, color: "#f59e0b" },
  ];
}

function buildFundEconomics(): FundEconomics[] {
  return [
    { name: "Citadel", aum: 63, returnYtd: 15.8, expenseRatio: 7.5, perfFee: 30, color: "#6366f1" },
    { name: "Millennium", aum: 68, returnYtd: 14.2, expenseRatio: 6.8, perfFee: 25, color: "#22c55e" },
    { name: "Point72", aum: 35, returnYtd: 11.6, expenseRatio: 6.2, perfFee: 30, color: "#06b6d4" },
    { name: "Balyasny", aum: 21, returnYtd: 13.4, expenseRatio: 7.1, perfFee: 25, color: "#f59e0b" },
    { name: "ExodusPoint", aum: 13, returnYtd: 8.9, expenseRatio: 5.9, perfFee: 20, color: "#a78bfa" },
  ];
}

function buildReturnHistory(): ReturnDataPoint[] {
  resetSeed();
  rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand();
  return [
    { year: "2019", multiStrat: 19.4, singleStrat: 16.2, spx: 31.5 },
    { year: "2020", multiStrat: 26.3, singleStrat: 18.8, spx: 18.4 },
    { year: "2021", multiStrat: 26.1, singleStrat: 22.4, spx: 28.7 },
    { year: "2022", multiStrat: 28.9, singleStrat: -4.1, spx: -18.1 },
    { year: "2023", multiStrat: 15.3, singleStrat: 12.6, spx: 26.3 },
    { year: "2024", multiStrat: 13.7, singleStrat: 14.1, spx: 23.3 },
    { year: "2025", multiStrat: 10.2, singleStrat: 9.4, spx: 6.8 },
  ];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function correlColor(v: number): string {
  if (v >= 0.8) return "rgba(239,68,68,0.85)";
  if (v >= 0.5) return "rgba(249,115,22,0.75)";
  if (v >= 0.3) return "rgba(245,158,11,0.65)";
  if (v >= 0.1) return "rgba(34,197,94,0.40)";
  if (v > -0.1) return "rgba(100,116,139,0.30)";
  return "rgba(99,102,241,0.55)";
}

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

// ── Pod Structure Tab ───────────────────────────────────────────────────────

function PodStructureTab() {
  const pods = useMemo(() => buildPodPMs(), []);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedPod = pods.find((p) => p.id === selected) ?? null;

  const totalAum = pods.reduce((a, b) => a + b.aum, 0);
  const totalCost = pods.reduce((a, b) => a + b.annualCost, 0);
  const avgSharpe = pods.reduce((a, b) => a + b.sharpe, 0) / pods.length;

  return (
    <div className="space-y-6">
      {/* Architecture SVG */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-indigo-400" />
            Pod Architecture — Centralized Risk → PM Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 720 260" className="w-full" style={{ height: 200 }}>
            {/* Central risk box */}
            <rect x="290" y="10" width="140" height="48" rx="6" fill="#312e81" stroke="#6366f1" strokeWidth="1.5" />
            <text x="360" y="30" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="600">Central Risk Desk</text>
            <text x="360" y="46" textAnchor="middle" fill="#818cf8" fontSize="9">VaR / Exposure / Stress</text>

            {/* Lines from central → pods */}
            {pods.map((pod, i) => {
              const total = pods.length;
              const x = 40 + (i / (total - 1)) * 640;
              return (
                <line key={pod.id} x1="360" y1="58" x2={x} y2="130" stroke="#6366f150" strokeWidth="1" />
              );
            })}

            {/* PM pod boxes */}
            {pods.map((pod, i) => {
              const total = pods.length;
              const x = 40 + (i / (total - 1)) * 640;
              const isSelected = selected === pod.id;
              const statusColor = pod.status === "active" ? "#22c55e" : pod.status === "flat" ? "#f59e0b" : "#ef4444";
              return (
                <g key={pod.id} style={{ cursor: "pointer" }} onClick={() => setSelected(isSelected ? null : pod.id)}>
                  <rect x={x - 42} y="130" width="84" height="52" rx="5"
                    fill={isSelected ? "#1e1b4b" : "#18181b"}
                    stroke={isSelected ? "#6366f1" : "#3f3f46"}
                    strokeWidth={isSelected ? 2 : 1} />
                  <circle cx={x - 28} cy="142" r="4" fill={statusColor} />
                  <text x={x} y="145" textAnchor="middle" fill="#e4e4e7" fontSize="8" fontWeight="600">{pod.strategy}</text>
                  <text x={x} y="158" textAnchor="middle" fill="#a1a1aa" fontSize="8">${(pod.aum / 1000).toFixed(1)}B</text>
                  <text x={x} y="170" textAnchor="middle"
                    fill={pod.ytdPnl >= 0 ? "#22c55e" : "#ef4444"}
                    fontSize="8" fontWeight="600">
                    {pod.ytdPnl >= 0 ? "+" : ""}{pod.ytdPnl}%
                  </text>

                  {/* PM book sub-lines */}
                  {[0, 1, 2].map((b) => {
                    const bx = x - 26 + b * 26;
                    return (
                      <g key={b}>
                        <line x1={x} y1="182" x2={bx} y2="210" stroke="#3f3f4650" strokeWidth="1" />
                        <rect x={bx - 14} y="210" width="28" height="20" rx="3"
                          fill="#09090b" stroke="#27272a" strokeWidth="1" />
                        <text x={bx} y="224" textAnchor="middle" fill="#71717a" fontSize="7">Analyst</text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Legend */}
            <circle cx="24" cy="250" r="4" fill="#22c55e" />
            <text x="32" y="254" fill="#71717a" fontSize="8">Active</text>
            <circle cx="70" cy="250" r="4" fill="#f59e0b" />
            <text x="78" y="254" fill="#71717a" fontSize="8">Flat</text>
            <circle cx="108" cy="250" r="4" fill="#ef4444" />
            <text x="116" y="254" fill="#71717a" fontSize="8">Stopped</text>
          </svg>
        </CardContent>
      </Card>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500">Total AUM</p>
            <p className="text-2xl font-bold text-zinc-100">${(totalAum / 1000).toFixed(1)}B</p>
            <p className="text-xs text-zinc-500">{pods.length} active pods</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500">Annual Pod Cost</p>
            <p className="text-2xl font-bold text-zinc-100">${totalCost}M</p>
            <p className="text-xs text-zinc-500">{((totalCost / totalAum) * 100).toFixed(2)}% of AUM</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500">Avg Pod Sharpe</p>
            <p className="text-2xl font-bold text-zinc-100">{fmt(avgSharpe)}</p>
            <p className="text-xs text-zinc-500">Portfolio Sharpe ~1.8</p>
          </CardContent>
        </Card>
      </div>

      {/* PM P&L attribution table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            PM P&amp;L Attribution &amp; Draw-Down Triggers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 pr-3 text-zinc-500 font-medium">Pod</th>
                  <th className="text-right py-2 px-2 text-zinc-500 font-medium">AUM</th>
                  <th className="text-right py-2 px-2 text-zinc-500 font-medium">YTD P&amp;L</th>
                  <th className="text-right py-2 px-2 text-zinc-500 font-medium">Sharpe</th>
                  <th className="text-right py-2 px-2 text-zinc-500 font-medium">DD Now</th>
                  <th className="text-right py-2 px-2 text-zinc-500 font-medium">Hard Stop</th>
                  <th className="text-right py-2 px-2 text-zinc-500 font-medium">Status</th>
                  <th className="text-right py-2 px-2 text-zinc-500 font-medium">Staff</th>
                  <th className="text-right py-2 px-2 text-zinc-500 font-medium">Cost/yr</th>
                  <th className="text-right py-2 px-2 text-zinc-500 font-medium">Seed</th>
                </tr>
              </thead>
              <tbody>
                {pods.map((pod) => {
                  const ddPct = Math.abs(pod.drawdown / pod.drawdownLimit) * 100;
                  const statusColor = pod.status === "active" ? "text-emerald-400" : pod.status === "flat" ? "text-amber-400" : "text-red-400";
                  const statusBg = pod.status === "active" ? "bg-emerald-900/30 border-emerald-800" : pod.status === "flat" ? "bg-amber-900/30 border-amber-800" : "bg-red-900/30 border-red-800";
                  const seedColor = pod.seeding === "internal" ? "bg-indigo-900/40 text-indigo-300 border-indigo-800" : pod.seeding === "external" ? "bg-cyan-900/40 text-cyan-300 border-cyan-800" : "bg-purple-900/40 text-purple-300 border-purple-800";
                  return (
                    <tr key={pod.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-2 pr-3">
                        <p className="font-medium text-zinc-200">{pod.name}</p>
                        <p className="text-zinc-500">{pod.strategy}</p>
                      </td>
                      <td className="text-right px-2 text-zinc-300">${(pod.aum / 1000).toFixed(1)}B</td>
                      <td className={`text-right px-2 font-medium ${pod.ytdPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {pod.ytdPnl >= 0 ? "+" : ""}{pod.ytdPnl}%
                      </td>
                      <td className="text-right px-2 text-zinc-300">{fmt(pod.sharpe)}</td>
                      <td className="text-right px-2">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-zinc-300">{fmt(pod.drawdown)}%</span>
                          <div className="w-12 bg-zinc-800 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${Math.min(ddPct, 100)}%`, background: ddPct > 75 ? "#ef4444" : ddPct > 50 ? "#f59e0b" : "#22c55e" }} />
                          </div>
                        </div>
                      </td>
                      <td className="text-right px-2 text-zinc-500">{pod.drawdownLimit}%</td>
                      <td className="text-right px-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${statusBg} ${statusColor}`}>
                          {pod.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right px-2 text-zinc-300">{pod.headcount}</td>
                      <td className="text-right px-2 text-zinc-300">${pod.annualCost}M</td>
                      <td className="text-right px-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${seedColor}`}>
                          {pod.seeding}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Capital allocation process */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" />
            Capital Allocation Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-xs font-semibold text-indigo-400 mb-2">Sharpe-Based Sizing</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Pods with Sharpe &gt; 1.5 receive additional capital allocation. Capital is proportional to risk-adjusted returns over trailing 12 months. New pods receive minimum $250M seed regardless of track record.</p>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-xs font-semibold text-cyan-400 mb-2">Risk Budget / Kelly</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Each pod receives a VaR budget (e.g. $X per $1B AUM). Kelly fraction applied at half-Kelly to avoid over-sizing. Correlated pods share a combined VaR bucket — reducing capital when correlation spikes.</p>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-xs font-semibold text-amber-400 mb-2">Onboarding New PMs</p>
              <p className="text-xs text-zinc-400 leading-relaxed">PM typically brings team of 2–5 analysts. 3–6 month ramp period with $100–250M initial capital. After 12 months of live performance, reviewed for full allocation. Seeding arrangements: internal (no co-invest) vs. co-invest (PM contributes 5% of managed capital).</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { trigger: "Flat Trigger", level: "-3% to -5%", action: "PM must reduce gross by 50%; new trades need risk desk approval", color: "amber" },
              { trigger: "Stop-Out", level: "-5% to -7%", action: "All positions liquidated within 5 trading days; PM on leave", color: "orange" },
              { trigger: "Hard Stop", level: "≥ Limit (e.g. -8%)", action: "Immediate full liquidation; PM contract terminated; capital reallocated", color: "red" },
            ].map((t) => {
              const bg = t.color === "amber" ? "bg-amber-900/20 border-amber-800" : t.color === "orange" ? "bg-orange-900/20 border-orange-800" : "bg-red-900/20 border-red-800";
              const tc = t.color === "amber" ? "text-amber-400" : t.color === "orange" ? "text-orange-400" : "text-red-400";
              return (
                <div key={t.trigger} className={`p-3 rounded-lg border ${bg}`}>
                  <p className={`text-xs font-semibold ${tc} mb-1`}>{t.trigger}</p>
                  <p className="text-xs font-mono text-zinc-300 mb-1">{t.level}</p>
                  <p className="text-xs text-zinc-500">{t.action}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Strategy Allocation Tab ─────────────────────────────────────────────────

function StrategyAllocationTab() {
  const allocs = useMemo(() => buildStrategyAllocs(), []);
  const corr = useMemo(() => buildCorrelation(), []);
  const [hoveredStrat, setHoveredStrat] = useState<string | null>(null);

  const totalPct = allocs.reduce((a, b) => a + b.pct, 0);

  // Stacked bar cumulative positions
  const cumPct: number[] = [];
  let acc = 0;
  for (const a of allocs) {
    cumPct.push(acc);
    acc += a.pct;
  }

  const portfolioSharpe = 1.82;
  const avgPodSharpe = allocs.reduce((a, b) => a + b.avgSharpe, 0) / allocs.length;

  return (
    <div className="space-y-6">
      {/* Stacked allocation bar */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            Capital Allocation Across Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 720 120" className="w-full" style={{ height: 120 }}>
            {allocs.map((a, i) => {
              const x = (cumPct[i] / totalPct) * 680 + 20;
              const w = (a.pct / totalPct) * 680;
              const isHov = hoveredStrat === a.name;
              return (
                <g key={a.name} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredStrat(a.name)}
                  onMouseLeave={() => setHoveredStrat(null)}>
                  <rect x={x} y={isHov ? 28 : 32} width={w - 2} height={isHov ? 44 : 36} rx="3"
                    fill={a.color} opacity={isHov ? 0.95 : 0.75}
                    style={{ transition: "all 0.15s" }} />
                  {w > 50 && (
                    <>
                      <text x={x + w / 2} y={isHov ? 47 : 48} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">{a.name}</text>
                      <text x={x + w / 2} y={isHov ? 60 : 60} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9">{a.pct}%</text>
                    </>
                  )}
                  {w <= 50 && (
                    <text x={x + w / 2} y={isHov ? 47 : 48} textAnchor="middle" fill="#fff" fontSize="8">{a.pct}%</text>
                  )}
                </g>
              );
            })}
            {/* Labels below */}
            {allocs.map((a, i) => {
              const x = (cumPct[i] / totalPct) * 680 + 20;
              const w = (a.pct / totalPct) * 680;
              return (
                <text key={`lbl-${a.name}`} x={x + w / 2} y="90" textAnchor="middle" fill="#71717a" fontSize="8">
                  Sharpe {fmt(a.avgSharpe)}
                </text>
              );
            })}
          </svg>
          {/* Legend chips */}
          <div className="flex flex-wrap gap-2 mt-2">
            {allocs.map((a) => (
              <div key={a.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: a.color }} />
                <span className="text-xs text-zinc-400">{a.name} ({a.pct}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diversification benefit */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500 mb-2">Diversification Benefit</p>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-xs text-zinc-500">Portfolio Sharpe</p>
                <p className="text-2xl font-bold text-emerald-400">{fmt(portfolioSharpe)}</p>
              </div>
              <div className="text-zinc-600 text-xl mb-1">vs</div>
              <div>
                <p className="text-xs text-zinc-500">Avg Pod Sharpe</p>
                <p className="text-2xl font-bold text-zinc-400">{fmt(avgPodSharpe)}</p>
              </div>
            </div>
            <p className="text-xs text-emerald-500 mt-2">+{fmt(portfolioSharpe - avgPodSharpe)} Sharpe lift from diversification</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500 mb-2">Capacity Management</p>
            <div className="space-y-1.5 mt-1">
              {allocs.slice(0, 4).map((a) => (
                <div key={a.name} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 w-24 shrink-0">{a.name}</span>
                  <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${Math.min((a.pct / 35) * 100, 100)}%`, background: a.color }} />
                  </div>
                  <span className="text-xs text-zinc-500 w-10 text-right">Cap ${a.capacity}B</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Correlation heatmap */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Pod Cross-Correlation Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 460 240" className="w-full max-w-lg mx-auto" style={{ height: 240 }}>
            {/* Row labels */}
            {corr.strategies.map((s, i) => (
              <text key={`rl-${s}`} x="68" y={60 + i * 30 + 10} textAnchor="end" fill="#a1a1aa" fontSize="9">{s}</text>
            ))}
            {/* Col labels */}
            {corr.strategies.map((s, j) => (
              <text key={`cl-${s}`} x={76 + j * 58 + 24} y="50" textAnchor="middle" fill="#a1a1aa" fontSize="9">{s}</text>
            ))}
            {/* Cells */}
            {corr.matrix.map((row, i) =>
              row.map((val, j) => (
                <g key={`cell-${i}-${j}`}>
                  <rect x={76 + j * 58} y={54 + i * 30} width="48" height="24" rx="3"
                    fill={correlColor(val)} />
                  <text x={76 + j * 58 + 24} y={54 + i * 30 + 15} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">
                    {fmt(val, 2)}
                  </text>
                </g>
              ))
            )}
          </svg>
          <div className="flex items-center gap-3 justify-center mt-2 text-xs text-zinc-500">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: correlColor(0.9) }} /><span>High (&gt;0.5)</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: correlColor(0.2) }} /><span>Low (0.1–0.3)</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: correlColor(-0.2) }} /><span>Negative</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic reallocation & flight to quality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Dynamic Reallocation Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { rule: "Drawdown Breach", action: "Capital pulled within 48h; redistributed to best Sharpe pods" },
              { rule: "Correlation Spike (&gt;0.6)", action: "Reduce combined exposure until correlation normalizes" },
              { rule: "Market Stress", action: "Increase quant/arb; cut directional equity L/S gross by 30%" },
              { rule: "Capacity Reached", action: "New investor capital directed to under-capacity strategies first" },
              { rule: "PM Departure", action: "Book wound down over 10 days; replacement PM onboarded within 60 days" },
            ].map((r) => (
              <div key={r.rule} className="flex gap-2 text-xs">
                <Badge variant="outline" className="shrink-0 text-indigo-300 border-indigo-800 bg-indigo-900/20 h-5 text-[10px]">{r.rule}</Badge>
                <span className="text-zinc-400">{r.action}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Flight-to-Quality Capital Rotation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-zinc-400">
            <p>During drawdowns or volatility spikes, capital rotates from directional strategies toward:</p>
            <ul className="space-y-1 ml-3">
              <li className="flex gap-2"><span className="text-cyan-400">•</span> Merger arb (event-driven, low beta, defined catalysts)</li>
              <li className="flex gap-2"><span className="text-cyan-400">•</span> Stat arb / quant (market-neutral, factor-diversified)</li>
              <li className="flex gap-2"><span className="text-cyan-400">•</span> Vol selling pods (elevated VIX = higher premium income)</li>
              <li className="flex gap-2"><span className="text-cyan-400">•</span> Cash reserves — undeployed capital earns T-bill rate (3–5%)</li>
            </ul>
            <p className="text-zinc-500 mt-2">Multi-strat advantage: capital can be redeployed in days vs. months for single-strat funds. Explains outperformance in 2022 market stress year.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Risk Management Tab ─────────────────────────────────────────────────────

function RiskManagementTab() {
  const metrics = useMemo(() => buildRiskMetrics(), []);

  const factorExposures = [
    { factor: "Market Beta", value: 0.18, limit: 0.30, color: "#6366f1" },
    { factor: "Size (SMB)", value: 0.12, limit: 0.25, color: "#22c55e" },
    { factor: "Value (HML)", value: -0.08, limit: 0.20, color: "#f59e0b" },
    { factor: "Momentum", value: 0.22, limit: 0.30, color: "#06b6d4" },
    { factor: "Quality", value: 0.15, limit: 0.25, color: "#a78bfa" },
    { factor: "Low Vol", value: 0.09, limit: 0.20, color: "#ec4899" },
  ];

  const stressScenarios = [
    { name: "COVID Crash (Mar 2020)", portfolioLoss: "-4.2%", hedgeLoss: "-12.1%", podWorst: "Macro −18%" },
    { name: "2022 Rate Shock", portfolioLoss: "+2.8%", hedgeLoss: "-14.3%", podWorst: "Eq L/S −11%" },
    { name: "GFC Redux (2008-style)", portfolioLoss: "-18.4%", hedgeLoss: "-38.5%", podWorst: "Credit −31%" },
    { name: "Flash Crash (Equity -20%)", portfolioLoss: "-6.1%", hedgeLoss: "-20.0%", podWorst: "Vol −14%" },
    { name: "EM Contagion (FX -15%)", portfolioLoss: "-3.3%", hedgeLoss: "-8.7%", podWorst: "Macro −9%" },
  ];

  return (
    <div className="space-y-6">
      {/* Centralized risk desk SVG */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            Centralized Risk Desk Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 720 200" className="w-full" style={{ height: 180 }}>
            {/* Central desk */}
            <rect x="270" y="20" width="180" height="50" rx="6" fill="#1c1917" stroke="#ef4444" strokeWidth="1.5" />
            <text x="360" y="40" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="700">Central Risk Desk</text>
            <text x="360" y="56" textAnchor="middle" fill="#9ca3af" fontSize="9">CRO + 4 Risk Analysts</text>

            {/* Five pillars below */}
            {[
              { label: "VaR Engine", sub: "Monte Carlo\n10k scenarios/night", x: 60, color: "#6366f1" },
              { label: "Factor Monitor", sub: "Barra + PCA\nreal-time updates", x: 200, color: "#22c55e" },
              { label: "Exposure Desk", sub: "Gross/Net\nper pod limits", x: 340, color: "#06b6d4" },
              { label: "Tail Overlay", sub: "SPX puts +\ncorrelation swaps", x: 480, color: "#f59e0b" },
              { label: "Stress Testing", sub: "Daily scenarios\nacross all books", x: 620, color: "#ec4899" },
            ].map((p) => (
              <g key={p.label}>
                <line x1="360" y1="70" x2={p.x} y2="115" stroke="#3f3f4650" strokeWidth="1" />
                <rect x={p.x - 55} y="115" width="110" height="50" rx="5" fill="#18181b" stroke={p.color} strokeWidth="1.2" strokeOpacity="0.6" />
                <text x={p.x} y="132" textAnchor="middle" fill="#e4e4e7" fontSize="9" fontWeight="600">{p.label}</text>
                {p.sub.split("\n").map((ln, li) => (
                  <text key={li} x={p.x} y={145 + li * 11} textAnchor="middle" fill="#71717a" fontSize="8">{ln}</text>
                ))}
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>

      {/* Risk metrics */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            Portfolio Risk Metrics vs Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metrics.map((m) => (
              <div key={m.label} className="flex items-center gap-3 p-2 bg-zinc-800/40 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400">{m.label}</span>
                    <span className="text-xs font-mono text-zinc-200">{m.value}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${m.pctUsed}%`, background: m.pctUsed > 80 ? "#ef4444" : m.pctUsed > 65 ? "#f59e0b" : "#22c55e" }} />
                    </div>
                    <span className="text-xs text-zinc-600 shrink-0">Limit: {m.limit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Factor exposures */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Scale className="h-4 w-4 text-amber-400" />
            Aggregated Factor Exposures Across All Pods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 700 120" className="w-full" style={{ height: 120 }}>
            {factorExposures.map((f, i) => {
              const barW = 680 / factorExposures.length - 8;
              const x = 20 + i * (680 / factorExposures.length);
              const maxH = 70;
              const absV = Math.abs(f.value);
              const barH = (absV / f.limit) * maxH;
              const limitH = maxH;
              const isNeg = f.value < 0;
              return (
                <g key={f.factor}>
                  {/* Limit line */}
                  <line x1={x} y1={20} x2={x + barW} y2={20} stroke={f.color} strokeWidth="1" strokeDasharray="3,2" opacity="0.4" />
                  {/* Bar */}
                  <rect x={x} y={20 + limitH - barH} width={barW} height={barH} rx="2"
                    fill={f.color} opacity={isNeg ? 0.4 : 0.7} />
                  {/* Negative indicator */}
                  {isNeg && <text x={x + barW / 2} y={20 + limitH - barH - 4} textAnchor="middle" fill={f.color} fontSize="9">−</text>}
                  <text x={x + barW / 2} y={104} textAnchor="middle" fill="#a1a1aa" fontSize="8">{f.factor}</text>
                  <text x={x + barW / 2} y={115} textAnchor="middle" fill="#71717a" fontSize="8">{f.value}</text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Stress test results */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            Stress Testing — All Books Simultaneously
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 pr-4 text-zinc-500 font-medium">Scenario</th>
                <th className="text-right py-2 px-3 text-zinc-500 font-medium">Multi-Strat P&amp;L</th>
                <th className="text-right py-2 px-3 text-zinc-500 font-medium">Hedge Fund Index</th>
                <th className="text-right py-2 px-3 text-zinc-500 font-medium">Worst Pod</th>
              </tr>
            </thead>
            <tbody>
              {stressScenarios.map((sc) => {
                const pnlColor = sc.portfolioLoss.startsWith("+") ? "text-emerald-400" : "text-red-400";
                return (
                  <tr key={sc.name} className="border-b border-zinc-800/40 hover:bg-zinc-800/20">
                    <td className="py-2 pr-4 text-zinc-300">{sc.name}</td>
                    <td className={`text-right px-3 font-mono font-medium ${pnlColor}`}>{sc.portfolioLoss}</td>
                    <td className="text-right px-3 font-mono text-red-500">{sc.hedgeLoss}</td>
                    <td className="text-right px-3 font-mono text-amber-400">{sc.podWorst}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-800/40 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-zinc-300">Leverage Limits</p>
              <p className="text-zinc-400">Gross: typically 5–8x NAV across portfolio. Quant pods may run 10–15x intra-pod but offset across books. Portfolio net exposure target: 15–30% long bias.</p>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-zinc-300">Tail Risk Overlay</p>
              <p className="text-zinc-400">Portfolio-level SPX puts (3–5% OTM, 3-month tenor). Tail risk cost ~40–80bps/year. Correlation swaps when cross-pod correlations spike above 0.5 threshold.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Economics Tab ───────────────────────────────────────────────────────────

function EconomicsTab() {
  const funds = useMemo(() => buildFundEconomics(), []);
  const returns = useMemo(() => buildReturnHistory(), []);

  const maxAum = Math.max(...funds.map((f) => f.aum));

  const svgW = 680;
  const svgH = 160;
  const barW = svgW / (funds.length + 1);

  const minRet = Math.min(...returns.flatMap((r) => [r.multiStrat, r.singleStrat, r.spx]));
  const maxRet = Math.max(...returns.flatMap((r) => [r.multiStrat, r.singleStrat, r.spx]));
  const retRange = maxRet - minRet;

  function retY(v: number) {
    return 20 + ((maxRet - v) / retRange) * 120;
  }

  const linePoints = (key: keyof ReturnDataPoint) =>
    returns
      .map((r, i) => `${30 + i * (680 / (returns.length - 1))},${retY(r[key] as number)}`)
      .join(" ");

  return (
    <div className="space-y-6">
      {/* AUM bar chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            AUM — Top Multi-Strategy Hedge Funds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${svgW + 40} ${svgH + 40}`} className="w-full" style={{ height: 180 }}>
            {funds.map((f, i) => {
              const bh = (f.aum / maxAum) * (svgH - 30);
              const bx = 40 + i * barW + barW * 0.1;
              const bw = barW * 0.8;
              const by = svgH - bh;
              return (
                <g key={f.name}>
                  <rect x={bx} y={by} width={bw} height={bh} rx="3"
                    fill={f.color} opacity="0.75" />
                  <text x={bx + bw / 2} y={by - 6} textAnchor="middle" fill="#e4e4e7" fontSize="10" fontWeight="600">${f.aum}B</text>
                  <text x={bx + bw / 2} y={svgH + 12} textAnchor="middle" fill="#a1a1aa" fontSize="9">{f.name}</text>
                  <text x={bx + bw / 2} y={svgH + 24} textAnchor="middle" fill={f.returnYtd >= 0 ? "#22c55e" : "#ef4444"} fontSize="9">+{f.returnYtd}% YTD</text>
                </g>
              );
            })}
            {/* Y axis */}
            {[0, 25, 50, 75].map((v) => {
              const y = svgH - (v / maxAum) * (svgH - 30);
              return (
                <g key={v}>
                  <line x1="34" y1={y} x2={svgW + 40} y2={y} stroke="#27272a" strokeWidth="1" />
                  <text x="30" y={y + 4} textAnchor="end" fill="#52525b" fontSize="8">${v}B</text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Return comparison line chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            Annual Returns: Multi-Strat vs Single-Strat vs S&amp;P 500
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 720 160" className="w-full" style={{ height: 160 }}>
            {/* Zero line */}
            <line x1="20" y1={retY(0)} x2="700" y2={retY(0)} stroke="#3f3f46" strokeWidth="1" strokeDasharray="4,3" />
            <text x="14" y={retY(0) + 4} textAnchor="end" fill="#52525b" fontSize="8">0%</text>

            {/* Grid */}
            {[-20, -10, 10, 20, 30].map((v) => (
              <g key={v}>
                <line x1="20" y1={retY(v)} x2="700" y2={retY(v)} stroke="#1f1f23" strokeWidth="1" />
                <text x="14" y={retY(v) + 4} textAnchor="end" fill="#3f3f46" fontSize="8">{v}%</text>
              </g>
            ))}

            {/* Lines */}
            <polyline points={linePoints("multiStrat")} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />
            <polyline points={linePoints("singleStrat")} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3" />
            <polyline points={linePoints("spx")} fill="none" stroke="#71717a" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="2,4" />

            {/* Data points + year labels */}
            {returns.map((r, i) => {
              const x = 30 + i * (680 / (returns.length - 1));
              return (
                <g key={r.year}>
                  <circle cx={x} cy={retY(r.multiStrat)} r="3.5" fill="#6366f1" />
                  <text x={x} y="155" textAnchor="middle" fill="#71717a" fontSize="8">{r.year}</text>
                </g>
              );
            })}

            {/* Legend */}
            <line x1="420" y1="14" x2="440" y2="14" stroke="#6366f1" strokeWidth="2.5" />
            <text x="444" y="18" fill="#a1a1aa" fontSize="9">Multi-Strat</text>
            <line x1="510" y1="14" x2="530" y2="14" stroke="#22c55e" strokeWidth="2" strokeDasharray="4,2" />
            <text x="534" y="18" fill="#a1a1aa" fontSize="9">Single-Strat</text>
            <line x1="605" y1="14" x2="625" y2="14" stroke="#71717a" strokeWidth="1.5" strokeDasharray="2,3" />
            <text x="629" y="18" fill="#a1a1aa" fontSize="9">S&amp;P 500</text>
          </svg>
        </CardContent>
      </Card>

      {/* Expense model */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Percent className="h-4 w-4 text-amber-400" />
            Pass-Through Expense Model — The Multi-Strat Difference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-amber-900/20 border border-amber-800 rounded-lg">
              <p className="text-xs font-semibold text-amber-400 mb-2">What Investors Pay</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-300">
                  <span>Management Fee</span><span className="font-mono">0%–1%</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Pass-Through Expenses</span><span className="font-mono text-amber-400">4–7%</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Performance Fee</span><span className="font-mono">20–30%</span>
                </div>
                <div className="flex justify-between font-semibold text-zinc-200 pt-1 border-t border-amber-800">
                  <span>Total Cost on Gross</span><span className="font-mono text-amber-400">5–8%/yr</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-xs font-semibold text-zinc-300 mb-2">Pass-Through Includes</p>
              <ul className="space-y-1 text-xs text-zinc-400">
                <li className="flex gap-1.5"><CircleDot className="h-2.5 w-2.5 mt-0.5 text-indigo-400 shrink-0" />PM compensation (salary + bonus)</li>
                <li className="flex gap-1.5"><CircleDot className="h-2.5 w-2.5 mt-0.5 text-indigo-400 shrink-0" />Research data (Bloomberg, FactSet, alt data)</li>
                <li className="flex gap-1.5"><CircleDot className="h-2.5 w-2.5 mt-0.5 text-indigo-400 shrink-0" />Technology infrastructure</li>
                <li className="flex gap-1.5"><CircleDot className="h-2.5 w-2.5 mt-0.5 text-indigo-400 shrink-0" />Prime brokerage fees</li>
                <li className="flex gap-1.5"><CircleDot className="h-2.5 w-2.5 mt-0.5 text-indigo-400 shrink-0" />Risk management software</li>
                <li className="flex gap-1.5"><CircleDot className="h-2.5 w-2.5 mt-0.5 text-indigo-400 shrink-0" />Compliance + legal</li>
                <li className="flex gap-1.5"><CircleDot className="h-2.5 w-2.5 mt-0.5 text-indigo-400 shrink-0" />Office space + travel</li>
              </ul>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-xs font-semibold text-zinc-300 mb-2">Why Investors Still Pay</p>
              <ul className="space-y-1 text-xs text-zinc-400">
                <li className="flex gap-1.5"><span className="text-emerald-400">+</span> Consistent 10–25% annual net returns</li>
                <li className="flex gap-1.5"><span className="text-emerald-400">+</span> Low correlation to public markets</li>
                <li className="flex gap-1.5"><span className="text-emerald-400">+</span> Positive in down years (2022: +28%)</li>
                <li className="flex gap-1.5"><span className="text-emerald-400">+</span> Institutional-grade risk management</li>
                <li className="flex gap-1.5"><span className="text-emerald-400">+</span> Access to top-tier talent globally</li>
                <li className="flex gap-1.5"><span className="text-red-400">−</span> Minimum investment $5–25M</li>
                <li className="flex gap-1.5"><span className="text-red-400">−</span> 1-year lock-up + 90-day notice</li>
              </ul>
            </div>
          </div>

          {/* Capacity & talent war */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-700 text-xs">
              <p className="font-semibold text-zinc-300 mb-2 flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-indigo-400" /> Capacity Constraints at $50B+</p>
              <p className="text-zinc-400 leading-relaxed">When AUM exceeds ~$50B, alpha generation becomes harder. More capital chasing the same opportunities compresses spreads. Funds either: (1) return capital to investors, (2) expand into new strategies, or (3) grow headcount — with diminishing returns on each additional pod. Citadel ($63B) and Millennium ($68B) have reached this threshold, pushing into more exotic/niche strategies to maintain edge.</p>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-700 text-xs">
              <p className="font-semibold text-zinc-300 mb-2 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-400" /> Talent War &amp; Compensation Inflation</p>
              <p className="text-zinc-400 leading-relaxed">Top PMs earn $5–50M+/year via pass-through model. Multi-strats are in constant competition for talent — a proven PM with $2B+ AUM and 15%+ returns commands $10–30M guaranteed. Non-compete clauses (typically 1 year) drive bidding wars. Analyst salaries at multi-strats 2–3× investment banking peers. Compensation is the #1 expense, making the pass-through model essential for firm economics.</p>
            </div>
          </div>

          {/* Fund comparison chips */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
            {funds.map((f) => (
              <div key={f.name} className="p-2.5 bg-zinc-800/50 rounded-lg border border-zinc-700 text-center">
                <p className="text-xs font-semibold text-zinc-200 mb-1">{f.name}</p>
                <p className="text-lg font-bold" style={{ color: f.color }}>${f.aum}B</p>
                <p className="text-xs text-zinc-500 mt-0.5">Exp: {f.expenseRatio}%</p>
                <p className="text-xs text-zinc-500">Perf: {f.perfFee}%</p>
                <p className={`text-xs font-medium mt-1 ${f.returnYtd >= 10 ? "text-emerald-400" : "text-amber-400"}`}>+{f.returnYtd}% YTD</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function MultiStrategyPage() {
  const [activeTab, setActiveTab] = useState("pods");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-900/40 border border-indigo-800">
              <Layers className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Multi-Strategy Hedge Funds</h1>
              <p className="text-sm text-zinc-500">Millennium / Point72 / Citadel model — pod architecture, risk, and economics</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: "Pod Model", color: "indigo" },
              { label: "Pass-Through Expenses", color: "amber" },
              { label: "Centralized Risk", color: "red" },
              { label: "Capital Allocation", color: "cyan" },
              { label: "~$200B+ Combined AUM", color: "emerald" },
            ].map((chip) => {
              const colors: Record<string, string> = {
                indigo: "bg-indigo-900/30 text-indigo-300 border-indigo-800",
                amber: "bg-amber-900/30 text-amber-300 border-amber-800",
                red: "bg-red-900/30 text-red-300 border-red-800",
                cyan: "bg-cyan-900/30 text-cyan-300 border-cyan-800",
                emerald: "bg-emerald-900/30 text-emerald-300 border-emerald-800",
              };
              return (
                <span key={chip.label} className={`text-xs px-2 py-0.5 rounded border ${colors[chip.color]}`}>
                  {chip.label}
                </span>
              );
            })}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-6">
            <TabsTrigger value="pods" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400 text-xs">
              <Users className="h-3.5 w-3.5 mr-1.5" />Pod Structure
            </TabsTrigger>
            <TabsTrigger value="allocation" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400 text-xs">
              <Layers className="h-3.5 w-3.5 mr-1.5" />Strategy Allocation
            </TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400 text-xs">
              <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />Risk Management
            </TabsTrigger>
            <TabsTrigger value="economics" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400 text-xs">
              <DollarSign className="h-3.5 w-3.5 mr-1.5" />Economics
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="pods" className="data-[state=inactive]:hidden">
                <PodStructureTab />
              </TabsContent>
              <TabsContent value="allocation" className="data-[state=inactive]:hidden">
                <StrategyAllocationTab />
              </TabsContent>
              <TabsContent value="risk" className="data-[state=inactive]:hidden">
                <RiskManagementTab />
              </TabsContent>
              <TabsContent value="economics" className="data-[state=inactive]:hidden">
                <EconomicsTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
