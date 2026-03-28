"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  ShieldAlert,
  Layers,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 712002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Reset seed for reproducibility
const resetSeed = () => { s = 712002; };

// ── Types ──────────────────────────────────────────────────────────────────────

interface G20Country {
  name: string;
  code: string;
  flag: string;
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  currentAccount: number;
  debtToGdp: number;
  creditRating: string;
  ratingScore: number; // 1-10 for coloring
  healthScore: number; // composite 1-100
}

interface CpiComponent {
  label: string;
  contribution: number;
  color: string;
}

interface PmiEntry {
  country: string;
  manufacturing: number;
  services: number;
  flag: string;
}

interface CapitalFlowRegion {
  region: string;
  fdi: number;
  portfolio: number;
  hotMoney: number;
  emFunds: number;
}

interface GprEvent {
  event: string;
  date: string;
  impact: "high" | "medium" | "low";
  marketEffect: number;
}

// ── Static Data Generation ──────────────────────────────────────────────────────

resetSeed();

const G20_COUNTRIES: G20Country[] = [
  {
    name: "United States", code: "US", flag: "🇺🇸",
    gdpGrowth: 2.9, inflation: 3.2, unemployment: 3.9,
    currentAccount: -3.8, debtToGdp: 122.3, creditRating: "AA+",
    ratingScore: 8, healthScore: 72,
  },
  {
    name: "China", code: "CN", flag: "🇨🇳",
    gdpGrowth: 4.6, inflation: 0.3, unemployment: 5.1,
    currentAccount: 1.5, debtToGdp: 83.4, creditRating: "A+",
    ratingScore: 6, healthScore: 61,
  },
  {
    name: "Germany", code: "DE", flag: "🇩🇪",
    gdpGrowth: -0.2, inflation: 2.4, unemployment: 3.0,
    currentAccount: 5.1, debtToGdp: 64.5, creditRating: "AAA",
    ratingScore: 10, healthScore: 67,
  },
  {
    name: "Japan", code: "JP", flag: "🇯🇵",
    gdpGrowth: 0.9, inflation: 2.8, unemployment: 2.6,
    currentAccount: 3.2, debtToGdp: 255.1, creditRating: "A+",
    ratingScore: 6, healthScore: 54,
  },
  {
    name: "India", code: "IN", flag: "🇮🇳",
    gdpGrowth: 6.8, inflation: 4.9, unemployment: 7.8,
    currentAccount: -1.8, debtToGdp: 81.9, creditRating: "BBB-",
    ratingScore: 4, healthScore: 65,
  },
  {
    name: "United Kingdom", code: "GB", flag: "🇬🇧",
    gdpGrowth: 0.7, inflation: 3.4, unemployment: 4.2,
    currentAccount: -3.1, debtToGdp: 98.7, creditRating: "AA",
    ratingScore: 7, healthScore: 58,
  },
  {
    name: "France", code: "FR", flag: "🇫🇷",
    gdpGrowth: 0.9, inflation: 2.9, unemployment: 7.4,
    currentAccount: -0.8, debtToGdp: 111.6, creditRating: "AA-",
    ratingScore: 7, healthScore: 56,
  },
  {
    name: "Brazil", code: "BR", flag: "🇧🇷",
    gdpGrowth: 2.9, inflation: 4.8, unemployment: 7.9,
    currentAccount: -2.1, debtToGdp: 88.6, creditRating: "BB",
    ratingScore: 3, healthScore: 50,
  },
  {
    name: "Italy", code: "IT", flag: "🇮🇹",
    gdpGrowth: 0.6, inflation: 1.9, unemployment: 6.7,
    currentAccount: 1.1, debtToGdp: 137.3, creditRating: "BBB",
    ratingScore: 4, healthScore: 48,
  },
  {
    name: "Canada", code: "CA", flag: "🇨🇦",
    gdpGrowth: 1.3, inflation: 2.6, unemployment: 6.1,
    currentAccount: -1.6, debtToGdp: 107.4, creditRating: "AAA",
    ratingScore: 10, healthScore: 64,
  },
  {
    name: "South Korea", code: "KR", flag: "🇰🇷",
    gdpGrowth: 2.2, inflation: 2.7, unemployment: 2.8,
    currentAccount: 3.6, debtToGdp: 54.3, creditRating: "AA",
    ratingScore: 7, healthScore: 71,
  },
  {
    name: "Russia", code: "RU", flag: "🇷🇺",
    gdpGrowth: 2.6, inflation: 8.9, unemployment: 3.2,
    currentAccount: 4.2, debtToGdp: 18.3, creditRating: "BB+",
    ratingScore: 3, healthScore: 42,
  },
  {
    name: "Australia", code: "AU", flag: "🇦🇺",
    gdpGrowth: 1.5, inflation: 3.4, unemployment: 4.0,
    currentAccount: -0.9, debtToGdp: 46.8, creditRating: "AAA",
    ratingScore: 10, healthScore: 68,
  },
  {
    name: "Mexico", code: "MX", flag: "🇲🇽",
    gdpGrowth: 2.4, inflation: 4.4, unemployment: 2.7,
    currentAccount: -0.5, debtToGdp: 47.9, creditRating: "BBB",
    ratingScore: 4, healthScore: 55,
  },
  {
    name: "Turkey", code: "TR", flag: "🇹🇷",
    gdpGrowth: 3.1, inflation: 44.2, unemployment: 9.8,
    currentAccount: -3.7, debtToGdp: 32.6, creditRating: "B+",
    ratingScore: 2, healthScore: 31,
  },
  {
    name: "Saudi Arabia", code: "SA", flag: "🇸🇦",
    gdpGrowth: 1.8, inflation: 1.7, unemployment: 4.9,
    currentAccount: 6.8, debtToGdp: 24.1, creditRating: "A",
    ratingScore: 6, healthScore: 62,
  },
  {
    name: "South Africa", code: "ZA", flag: "🇿🇦",
    gdpGrowth: 1.1, inflation: 5.3, unemployment: 32.1,
    currentAccount: -1.4, debtToGdp: 73.8, creditRating: "BB-",
    ratingScore: 3, healthScore: 28,
  },
  {
    name: "Indonesia", code: "ID", flag: "🇮🇩",
    gdpGrowth: 5.0, inflation: 2.8, unemployment: 5.2,
    currentAccount: -0.1, debtToGdp: 38.4, creditRating: "BBB",
    ratingScore: 4, healthScore: 66,
  },
  {
    name: "Argentina", code: "AR", flag: "🇦🇷",
    gdpGrowth: -2.1, inflation: 143.9, unemployment: 7.7,
    currentAccount: 0.8, debtToGdp: 89.4, creditRating: "CCC",
    ratingScore: 1, healthScore: 12,
  },
];

const CPI_COMPONENTS: CpiComponent[] = [
  { label: "Energy", contribution: 0.41, color: "#f59e0b" },
  { label: "Food", contribution: 0.38, color: "#10b981" },
  { label: "Shelter", contribution: 1.02, color: "#6366f1" },
  { label: "Core Services", contribution: 0.87, color: "#3b82f6" },
  { label: "Core Goods", contribution: -0.12, color: "#ef4444" },
  { label: "Medical Care", contribution: 0.19, color: "#8b5cf6" },
  { label: "Transportation", contribution: 0.22, color: "#ec4899" },
];

const PMI_DATA: PmiEntry[] = [
  { country: "USA", manufacturing: 51.6, services: 54.3, flag: "🇺🇸" },
  { country: "Eurozone", manufacturing: 46.1, services: 51.2, flag: "🇪🇺" },
  { country: "UK", manufacturing: 47.5, services: 53.8, flag: "🇬🇧" },
  { country: "Japan", manufacturing: 48.2, services: 52.1, flag: "🇯🇵" },
  { country: "China", manufacturing: 49.7, services: 52.4, flag: "🇨🇳" },
  { country: "India", manufacturing: 56.9, services: 58.5, flag: "🇮🇳" },
  { country: "Brazil", manufacturing: 52.3, services: 54.6, flag: "🇧🇷" },
  { country: "Korea", manufacturing: 50.2, services: 51.7, flag: "🇰🇷" },
];

const CAPITAL_FLOWS: CapitalFlowRegion[] = [
  { region: "North America", fdi: 312.4, portfolio: 189.2, hotMoney: 45.6, emFunds: 0 },
  { region: "Europe", fdi: 198.7, portfolio: 143.5, hotMoney: -12.3, emFunds: 0 },
  { region: "Asia Pacific", fdi: 287.1, portfolio: 98.4, hotMoney: 76.2, emFunds: 34.5 },
  { region: "EM Asia", fdi: 124.8, portfolio: -23.7, hotMoney: -31.4, emFunds: -18.9 },
  { region: "Latin America", fdi: 89.3, portfolio: 12.4, hotMoney: -28.6, emFunds: -8.4 },
  { region: "Africa & ME", fdi: 67.2, portfolio: -8.9, hotMoney: -14.2, emFunds: -3.2 },
];

const GPR_EVENTS: GprEvent[] = [
  { event: "Ukraine-Russia Conflict Escalation", date: "Feb 2026", impact: "high", marketEffect: -4.2 },
  { event: "Taiwan Strait Tensions", date: "Jan 2026", impact: "high", marketEffect: -3.1 },
  { event: "Middle East Ceasefire Agreement", date: "Mar 2026", impact: "medium", marketEffect: 1.8 },
  { event: "North Korea Missile Tests", date: "Dec 2025", impact: "medium", marketEffect: -1.4 },
  { event: "US-China Trade Talks Resume", date: "Nov 2025", impact: "medium", marketEffect: 2.3 },
  { event: "India-Pakistan Border Skirmish", date: "Oct 2025", impact: "low", marketEffect: -0.7 },
  { event: "Sahel Coup Wave", date: "Sep 2025", impact: "low", marketEffect: -0.3 },
];

// Generate GPR index time series
resetSeed();
const GPR_SERIES = Array.from({ length: 24 }, (_, i) => {
  const base = 120 + Math.sin(i * 0.4) * 30;
  return Math.max(60, Math.min(220, base + (rand() - 0.5) * 40));
});

// Generate leading indicator composite series
resetSeed();
const LEADING_INDICATOR_SERIES = Array.from({ length: 36 }, (_, i) => {
  const trend = 100 + Math.sin(i * 0.25) * 8 + (rand() - 0.5) * 4;
  return Math.round(trend * 10) / 10;
});

// Generate recession probability series
resetSeed();
const RECESSION_PROB_SERIES = Array.from({ length: 36 }, (_, i) => {
  const base = 15 + Math.sin(i * 0.3 - 1) * 12 + (rand() - 0.5) * 8;
  return Math.max(2, Math.min(65, base));
});

// PMI manufacturing series for 4 economies over 24 months
resetSeed();
const PMI_SERIES_LABELS = ["USA", "Eurozone", "China", "India"];
const PMI_SERIES_COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981"];
const PMI_MULTI_SERIES = PMI_SERIES_LABELS.map((_, li) => {
  const bases = [51.5, 46.0, 49.8, 56.5];
  return Array.from({ length: 24 }, () => {
    const v = bases[li] + (rand() - 0.5) * 6;
    return Math.round(Math.max(42, Math.min(62, v)) * 10) / 10;
  });
});

// ── Helper functions ────────────────────────────────────────────────────────────

function healthColor(score: number): string {
  if (score >= 65) return "text-emerald-400";
  if (score >= 45) return "text-amber-400";
  return "text-red-400";
}

function healthBg(score: number): string {
  if (score >= 65) return "bg-emerald-500/15";
  if (score >= 45) return "bg-amber-500/15";
  return "bg-red-500/15";
}

function ratingColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 5) return "text-amber-400";
  return "text-red-400";
}

function pmiColor(v: number): string {
  if (v >= 52) return "text-emerald-400";
  if (v >= 50) return "text-amber-400";
  return "text-red-400";
}

function inflColor(v: number): string {
  if (v <= 3) return "text-emerald-400";
  if (v <= 6) return "text-amber-400";
  return "text-red-400";
}

function signedStr(v: number, decimals = 1): string {
  return (v >= 0 ? "+" : "") + v.toFixed(decimals);
}

// ── Tab 1: Economic Scorecard ──────────────────────────────────────────────────

function EconomicScorecard() {
  const [sortKey, setSortKey] = useState<keyof G20Country>("healthScore");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...G20_COUNTRIES].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortAsc ? av - bv : bv - av;
    });
  }, [sortKey, sortAsc]);

  const handleSort = (key: keyof G20Country) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const top10 = [...G20_COUNTRIES].sort((a, b) => b.healthScore - a.healthScore).slice(0, 10);

  const colHeader = (label: string, key: keyof G20Country) => (
    <th
      className="px-3 py-2 text-left text-xs font-medium text-neutral-400 cursor-pointer hover:text-white whitespace-nowrap select-none"
      onClick={() => handleSort(key)}
    >
      {label} {sortKey === key ? (sortAsc ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Avg GDP Growth", value: (G20_COUNTRIES.reduce((a, c) => a + c.gdpGrowth, 0) / G20_COUNTRIES.length).toFixed(1) + "%", icon: TrendingUp, color: "text-emerald-400" },
          { label: "Avg Inflation", value: (G20_COUNTRIES.reduce((a, c) => a + c.inflation, 0) / G20_COUNTRIES.length).toFixed(1) + "%", icon: Activity, color: "text-amber-400" },
          { label: "Avg Unemployment", value: (G20_COUNTRIES.reduce((a, c) => a + c.unemployment, 0) / G20_COUNTRIES.length).toFixed(1) + "%", icon: BarChart2, color: "text-blue-400" },
          { label: "Economies Expanding", value: G20_COUNTRIES.filter(c => c.gdpGrowth > 0).length + "/19", icon: Globe, color: "text-indigo-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-3 flex items-center gap-3">
              <Icon className={cn("w-5 h-5 shrink-0", color)} />
              <div>
                <div className="text-xs text-neutral-400">{label}</div>
                <div className={cn("text-lg font-bold", color)}>{value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Country ranking SVG bar chart */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">Health Score Ranking (Top 10)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <svg width="100%" viewBox="0 0 600 220" className="overflow-visible">
            {top10.map((c, i) => {
              const barW = (c.healthScore / 100) * 380;
              const y = i * 20 + 10;
              const color = c.healthScore >= 65 ? "#10b981" : c.healthScore >= 45 ? "#f59e0b" : "#ef4444";
              return (
                <g key={c.code}>
                  <text x={88} y={y + 12} textAnchor="end" fontSize={10} fill="#a3a3a3">{c.flag} {c.name.slice(0, 12)}</text>
                  <rect x={92} y={y + 2} width={barW} height={14} rx={3} fill={color} opacity={0.8} />
                  <text x={92 + barW + 4} y={y + 12} fontSize={10} fill={color}>{c.healthScore}</text>
                </g>
              );
            })}
            <line x1={92} y1={0} x2={92} y2={210} stroke="#404040" strokeWidth={1} />
            {[0, 25, 50, 75, 100].map(v => (
              <g key={v}>
                <line x1={92 + v * 3.8} y1={205} x2={92 + v * 3.8} y2={210} stroke="#404040" strokeWidth={1} />
                <text x={92 + v * 3.8} y={218} textAnchor="middle" fontSize={9} fill="#525252">{v}</text>
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>

      {/* Scorecard table */}
      <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">G20 Economic Scorecard</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-neutral-800/50 border-b border-neutral-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400">Country</th>
                {colHeader("GDP Growth", "gdpGrowth")}
                {colHeader("Inflation", "inflation")}
                {colHeader("Unemployment", "unemployment")}
                {colHeader("Current Acc %", "currentAccount")}
                {colHeader("Debt/GDP %", "debtToGdp")}
                {colHeader("Rating", "ratingScore")}
                {colHeader("Health Score", "healthScore")}
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr
                  key={c.code}
                  className={cn(
                    "border-b border-neutral-800/50 transition-colors hover:bg-neutral-800/30",
                    i % 2 === 0 ? "" : "bg-neutral-800/10"
                  )}
                >
                  <td className="px-3 py-2 font-medium text-neutral-200">{c.flag} {c.name}</td>
                  <td className={cn("px-3 py-2 tabular-nums", c.gdpGrowth >= 2 ? "text-emerald-400" : c.gdpGrowth >= 0 ? "text-amber-400" : "text-red-400")}>
                    {signedStr(c.gdpGrowth)}%
                  </td>
                  <td className={cn("px-3 py-2 tabular-nums", inflColor(c.inflation))}>{c.inflation.toFixed(1)}%</td>
                  <td className={cn("px-3 py-2 tabular-nums", c.unemployment <= 5 ? "text-emerald-400" : c.unemployment <= 8 ? "text-amber-400" : "text-red-400")}>
                    {c.unemployment.toFixed(1)}%
                  </td>
                  <td className={cn("px-3 py-2 tabular-nums", c.currentAccount >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {signedStr(c.currentAccount)}%
                  </td>
                  <td className={cn("px-3 py-2 tabular-nums", c.debtToGdp <= 60 ? "text-emerald-400" : c.debtToGdp <= 100 ? "text-amber-400" : "text-red-400")}>
                    {c.debtToGdp.toFixed(1)}%
                  </td>
                  <td className={cn("px-3 py-2 font-mono font-bold", ratingColor(c.ratingScore))}>{c.creditRating}</td>
                  <td className="px-3 py-2">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-bold", healthBg(c.healthScore), healthColor(c.healthScore))}>
                      {c.healthScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Investment implications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { title: "Outperform", badge: "BUY", color: "emerald", countries: ["India", "Indonesia", "USA"], note: "Strong growth momentum, manageable debt" },
          { title: "Neutral", badge: "HOLD", color: "amber", countries: ["Canada", "South Korea", "Mexico"], note: "Balanced risk/reward, watch inflation" },
          { title: "Underweight", badge: "SELL", color: "red", countries: ["Argentina", "Turkey", "South Africa"], note: "Elevated inflation, weak credit profiles" },
        ].map(({ title, badge, color, countries, note }) => (
          <Card key={title} className={cn("border", color === "emerald" ? "bg-emerald-950/20 border-emerald-800/30" : color === "amber" ? "bg-amber-950/20 border-amber-800/30" : "bg-red-950/20 border-red-800/30")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-200">{title}</span>
                <Badge className={cn("text-xs", color === "emerald" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : color === "amber" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-red-500/20 text-red-400 border-red-500/30")}>
                  {badge}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {countries.map(c => {
                  const found = G20_COUNTRIES.find(x => x.name === c);
                  return <span key={c} className="text-xs text-neutral-300">{found?.flag} {c}</span>;
                })}
              </div>
              <p className="text-xs text-neutral-500">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Inflation Dashboard ─────────────────────────────────────────────────

function InflationDashboard() {
  const totalCpi = CPI_COMPONENTS.reduce((a, c) => a + c.contribution, 0);

  // Wage vs CPI data (12 months)
  const wageData = [3.8, 3.9, 4.1, 4.2, 4.0, 3.9, 4.1, 4.3, 4.2, 4.1, 4.0, 3.9];
  const cpiData = [3.7, 3.8, 3.6, 3.4, 3.2, 3.1, 3.0, 3.2, 3.3, 3.2, 3.1, 3.2];
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

  const minV = 2.5;
  const maxV = 4.8;
  const toY = (v: number, h: number) => h - ((v - minV) / (maxV - minV)) * (h - 20) - 10;

  const svgW = 600;
  const svgH = 160;

  const linePoints = (data: number[]) =>
    data.map((v, i) => `${(i / (data.length - 1)) * (svgW - 60) + 30},${toY(v, svgH)}`).join(" ");

  return (
    <div className="space-y-6">
      {/* CPI headline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Headline CPI YoY", value: "3.2%", sub: "vs 3.1% prev", color: "text-amber-400" },
          { label: "Core CPI YoY", value: "3.7%", sub: "vs 3.8% prev", color: "text-amber-400" },
          { label: "PCE Deflator", value: "2.8%", sub: "Fed target: 2.0%", color: "text-yellow-400" },
          { label: "Wage Growth", value: "4.1%", sub: "Real wages: +0.9%", color: "text-emerald-400" },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-3">
              <div className="text-xs text-neutral-400 mb-1">{label}</div>
              <div className={cn("text-2xl font-bold", color)}>{value}</div>
              <div className="text-xs text-neutral-500 mt-1">{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CPI waterfall chart */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">CPI Component Contributions (MoM ppt)</CardTitle>
        </CardHeader>
        <CardContent>
          <svg width="100%" viewBox="0 0 600 200" className="overflow-visible">
            {/* zero line */}
            <line x1={20} y1={100} x2={580} y2={100} stroke="#404040" strokeWidth={1} strokeDasharray="4 4" />
            <text x={10} y={104} fontSize={9} fill="#737373" textAnchor="middle">0</text>
            {/* bars */}
            {CPI_COMPONENTS.map((comp, i) => {
              const barW = 62;
              const x = i * 78 + 30;
              const barH = Math.abs(comp.contribution) * 60;
              const y = comp.contribution >= 0 ? 100 - barH : 100;
              return (
                <g key={comp.label}>
                  <rect x={x} y={y} width={barW} height={barH} rx={3} fill={comp.color} opacity={0.85} />
                  <text x={x + barW / 2} y={comp.contribution >= 0 ? y - 4 : y + barH + 12} textAnchor="middle" fontSize={10} fill={comp.color}>
                    {signedStr(comp.contribution, 2)}
                  </text>
                  <text x={x + barW / 2} y={175} textAnchor="middle" fontSize={9} fill="#a3a3a3">{comp.label}</text>
                </g>
              );
            })}
            {/* total line */}
            <line x1={20} y1={100 - totalCpi * 60} x2={580} y2={100 - totalCpi * 60} stroke="#ffffff" strokeWidth={1.5} strokeDasharray="6 3" opacity={0.5} />
            <text x={585} y={100 - totalCpi * 60 + 4} fontSize={9} fill="#a3a3a3">Total: {signedStr(totalCpi, 2)}</text>
          </svg>
        </CardContent>
      </Card>

      {/* Wage vs CPI line chart */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">Wage Growth vs CPI (YoY %)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-3">
            {[{ label: "Wage Growth", color: "#10b981" }, { label: "CPI", color: "#f59e0b" }].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
          <svg width="100%" viewBox={`0 0 ${svgW} ${svgH + 30}`} className="overflow-visible">
            {/* Grid lines */}
            {[3.0, 3.5, 4.0, 4.5].map(v => (
              <g key={v}>
                <line x1={30} y1={toY(v, svgH)} x2={svgW - 30} y2={toY(v, svgH)} stroke="#262626" strokeWidth={1} />
                <text x={24} y={toY(v, svgH) + 4} fontSize={9} fill="#525252" textAnchor="end">{v.toFixed(1)}</text>
              </g>
            ))}
            {/* Wage line */}
            <polyline points={linePoints(wageData)} fill="none" stroke="#10b981" strokeWidth={2} strokeLinejoin="round" />
            {/* CPI line */}
            <polyline points={linePoints(cpiData)} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinejoin="round" />
            {/* X axis labels */}
            {months.map((m, i) => (
              <text key={m} x={(i / (months.length - 1)) * (svgW - 60) + 30} y={svgH + 20} fontSize={9} fill="#525252" textAnchor="middle">{m}</text>
            ))}
            {/* Dots */}
            {wageData.map((v, i) => (
              <circle key={`w${i}`} cx={(i / (wageData.length - 1)) * (svgW - 60) + 30} cy={toY(v, svgH)} r={3} fill="#10b981" />
            ))}
            {cpiData.map((v, i) => (
              <circle key={`c${i}`} cx={(i / (cpiData.length - 1)) * (svgW - 60) + 30} cy={toY(v, svgH)} r={3} fill="#f59e0b" />
            ))}
          </svg>
        </CardContent>
      </Card>

      {/* Regional inflation comparison */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">Regional Inflation Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {[
            { region: "United States", cpi: 3.2, core: 3.7, target: 2.0, flag: "🇺🇸" },
            { region: "Eurozone", cpi: 2.6, core: 2.9, target: 2.0, flag: "🇪🇺" },
            { region: "United Kingdom", cpi: 3.4, core: 4.5, target: 2.0, flag: "🇬🇧" },
            { region: "Japan", cpi: 2.8, core: 2.4, target: 2.0, flag: "🇯🇵" },
            { region: "Emerging Markets", cpi: 6.8, core: 5.9, target: 4.0, flag: "🌏" },
          ].map(({ region, cpi, core, target, flag }) => (
            <div key={region} className="flex items-center gap-3 py-2 border-b border-neutral-800/50 last:border-0">
              <span className="text-base w-8">{flag}</span>
              <span className="text-sm text-neutral-300 w-36 shrink-0">{region}</span>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-neutral-500 w-10">CPI</span>
                  <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(cpi / 10 * 100, 100)}%`, backgroundColor: cpi <= 3 ? "#10b981" : cpi <= 6 ? "#f59e0b" : "#ef4444" }} />
                  </div>
                  <span className={cn("text-xs w-10 text-right tabular-nums", inflColor(cpi))}>{cpi.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-500 w-10">Core</span>
                  <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(core / 10 * 100, 100)}%`, backgroundColor: core <= 3 ? "#10b981" : core <= 6 ? "#f59e0b" : "#ef4444" }} />
                  </div>
                  <span className={cn("text-xs w-10 text-right tabular-nums", inflColor(core))}>{core.toFixed(1)}%</span>
                </div>
              </div>
              <div className="text-xs text-neutral-500 w-20 text-right">Target: {target.toFixed(1)}%</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: Growth Indicators ────────────────────────────────────────────────────

function GrowthIndicators() {
  const svgW = 600;
  const svgH = 200;
  const n = 24;

  const toYPmi = (v: number) => svgH - ((v - 42) / (62 - 42)) * (svgH - 30) - 15;
  const toYLi = (v: number) => svgH - ((v - 92) / (110 - 92)) * (svgH - 30) - 15;
  const toYRec = (v: number) => svgH - ((v - 0) / (70 - 0)) * (svgH - 30) - 15;

  const linePoints = (data: number[], toY: (v: number) => number) =>
    data.map((v, i) => `${(i / (n - 1)) * (svgW - 60) + 30},${toY(v)}`).join(" ");

  const xLabels = ["Apr 24", "", "", "Jul 24", "", "", "Oct 24", "", "", "Jan 25", "", "", "Apr 25", "", "", "Jul 25", "", "", "Oct 25", "", "", "Jan 26", "", "Mar 26"];

  return (
    <div className="space-y-6">
      {/* PMI table */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">Latest PMI Readings — Manufacturing vs Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-3 py-2 text-xs font-medium text-neutral-400">Economy</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-neutral-400">Manufacturing</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-neutral-400">Services</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-neutral-400">Composite</th>
                  <th className="px-3 py-2 text-xs font-medium text-neutral-400">Signal</th>
                </tr>
              </thead>
              <tbody>
                {PMI_DATA.map(row => {
                  const composite = (row.manufacturing + row.services) / 2;
                  const signal = composite >= 52 ? "Expanding" : composite >= 50 ? "Mild Growth" : "Contracting";
                  const signalColor = composite >= 52 ? "text-emerald-400" : composite >= 50 ? "text-amber-400" : "text-red-400";
                  return (
                    <tr key={row.country} className="border-b border-neutral-800/50 hover:bg-neutral-800/20">
                      <td className="px-3 py-2 text-neutral-200">{row.flag} {row.country}</td>
                      <td className={cn("px-3 py-2 text-right tabular-nums font-mono", pmiColor(row.manufacturing))}>{row.manufacturing.toFixed(1)}</td>
                      <td className={cn("px-3 py-2 text-right tabular-nums font-mono", pmiColor(row.services))}>{row.services.toFixed(1)}</td>
                      <td className={cn("px-3 py-2 text-right tabular-nums font-mono font-bold", pmiColor(composite))}>{composite.toFixed(1)}</td>
                      <td className={cn("px-3 py-2 text-xs", signalColor)}>{signal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Multi-line PMI chart */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">Manufacturing PMI — 24-Month Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-3">
            {PMI_SERIES_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: PMI_SERIES_COLORS[i] }} />
                {label}
              </div>
            ))}
          </div>
          <svg width="100%" viewBox={`0 0 ${svgW} ${svgH + 30}`} className="overflow-visible">
            {/* Grid */}
            {[44, 48, 50, 52, 56, 60].map(v => (
              <g key={v}>
                <line x1={30} y1={toYPmi(v)} x2={svgW - 30} y2={toYPmi(v)}
                  stroke={v === 50 ? "#4b5563" : "#262626"}
                  strokeWidth={v === 50 ? 1.5 : 1}
                  strokeDasharray={v === 50 ? "none" : "3 3"}
                />
                <text x={24} y={toYPmi(v) + 4} fontSize={9} fill="#525252" textAnchor="end">{v}</text>
              </g>
            ))}
            {/* 50 expansion/contraction label */}
            <text x={svgW - 30} y={toYPmi(50) - 4} fontSize={8} fill="#6b7280" textAnchor="end">Expansion threshold</text>
            {/* Lines */}
            {PMI_MULTI_SERIES.map((series, li) => (
              <polyline key={PMI_SERIES_LABELS[li]} points={linePoints(series, toYPmi)} fill="none" stroke={PMI_SERIES_COLORS[li]} strokeWidth={2} strokeLinejoin="round" />
            ))}
            {/* X axis */}
            {xLabels.map((label, i) => label ? (
              <text key={i} x={(i / (n - 1)) * (svgW - 60) + 30} y={svgH + 24} fontSize={8} fill="#525252" textAnchor="middle">{label}</text>
            ) : null)}
          </svg>
        </CardContent>
      </Card>

      {/* Leading indicators + recession probability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">OECD Leading Indicator Composite</CardTitle>
          </CardHeader>
          <CardContent>
            <svg width="100%" viewBox="0 0 400 140" className="overflow-visible">
              {[95, 100, 105].map(v => (
                <g key={v}>
                  <line x1={30} y1={toYLi(v)} x2={370} y2={toYLi(v)} stroke={v === 100 ? "#4b5563" : "#262626"} strokeWidth={v === 100 ? 1.5 : 1} strokeDasharray="3 3" />
                  <text x={24} y={toYLi(v) + 4} fontSize={9} fill="#525252" textAnchor="end">{v}</text>
                </g>
              ))}
              <polyline
                points={LEADING_INDICATOR_SERIES.map((v, i) => `${(i / (LEADING_INDICATOR_SERIES.length - 1)) * 340 + 30},${toYLi(v)}`).join(" ")}
                fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round"
              />
              <text x={370} y={toYLi(100) - 4} fontSize={8} fill="#6b7280" textAnchor="end">Trend=100</text>
            </svg>
            <div className="text-xs text-neutral-500 mt-1">Current: {LEADING_INDICATOR_SERIES[LEADING_INDICATOR_SERIES.length - 1].toFixed(1)} — {LEADING_INDICATOR_SERIES[LEADING_INDICATOR_SERIES.length - 1] >= 100 ? "Above trend (positive momentum)" : "Below trend (slowing)"}</div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Recession Probability Model (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <svg width="100%" viewBox="0 0 400 140" className="overflow-visible">
              {[0, 20, 40, 60].map(v => (
                <g key={v}>
                  <line x1={30} y1={toYRec(v)} x2={370} y2={toYRec(v)} stroke="#262626" strokeWidth={1} strokeDasharray="3 3" />
                  <text x={24} y={toYRec(v) + 4} fontSize={9} fill="#525252" textAnchor="end">{v}%</text>
                </g>
              ))}
              {/* Danger zone */}
              <rect x={30} y={toYRec(70)} width={340} height={toYRec(30) - toYRec(70)} fill="#ef4444" opacity={0.06} />
              <text x={370} y={toYRec(50) + 4} fontSize={8} fill="#ef444466" textAnchor="end">Danger zone</text>
              <polyline
                points={RECESSION_PROB_SERIES.map((v, i) => `${(i / (RECESSION_PROB_SERIES.length - 1)) * 340 + 30},${toYRec(v)}`).join(" ")}
                fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinejoin="round"
              />
            </svg>
            <div className="text-xs text-neutral-500 mt-1">
              Current: {RECESSION_PROB_SERIES[RECESSION_PROB_SERIES.length - 1].toFixed(1)}% — {RECESSION_PROB_SERIES[RECESSION_PROB_SERIES.length - 1] < 25 ? "Low risk" : RECESSION_PROB_SERIES[RECESSION_PROB_SERIES.length - 1] < 45 ? "Moderate risk" : "Elevated risk"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment implications */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">Growth Cycle — Investment Implications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              { phase: "Expansion (USA, India, EM Asia)", icon: TrendingUp, color: "emerald", implication: "Overweight equities; favor cyclicals, tech, industrials. Reduce duration." },
              { phase: "Slowdown (Eurozone, Japan)", icon: Minus, color: "amber", implication: "Shift to quality growth; add defensive exposure. Neutral duration." },
              { phase: "Contraction (Germany, UK)", icon: TrendingDown, color: "red", implication: "Overweight bonds; add gold and cash. Avoid small caps." },
              { phase: "Recovery signals emerging", icon: Activity, color: "blue", implication: "Early-cycle positioning: small-cap value, EM equities, HY credit." },
            ].map(({ phase, icon: Icon, color, implication }) => (
              <div key={phase} className={cn("p-3 rounded-lg border", color === "emerald" ? "bg-emerald-950/20 border-emerald-800/30" : color === "amber" ? "bg-amber-950/20 border-amber-800/30" : color === "red" ? "bg-red-950/20 border-red-800/30" : "bg-blue-950/20 border-blue-800/30")}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("w-4 h-4", color === "emerald" ? "text-emerald-400" : color === "amber" ? "text-amber-400" : color === "red" ? "text-red-400" : "text-blue-400")} />
                  <span className="font-medium text-neutral-200 text-xs">{phase}</span>
                </div>
                <p className="text-xs text-neutral-500">{implication}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 4: Capital Flows ────────────────────────────────────────────────────────

function CapitalFlows() {
  const maxAbs = Math.max(...CAPITAL_FLOWS.flatMap(r => [Math.abs(r.fdi), Math.abs(r.portfolio), Math.abs(r.hotMoney)]));

  const barColor = (v: number) => v >= 0 ? "#10b981" : "#ef4444";

  // Flow map SVG — stylized bar chart by region
  const regions = CAPITAL_FLOWS;
  const svgW = 600;
  const svgH = 220;
  const barH = 20;
  const gap = 30;
  const labelW = 110;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Global FDI (YTD)", value: "$1.08T", sub: "+8.2% YoY", color: "text-emerald-400" },
          { label: "Portfolio Flows", value: "$412B", sub: "DM: +$441B / EM: -$29B", color: "text-blue-400" },
          { label: "EM Fund Flows", value: "-$30B", sub: "3rd month outflow", color: "text-red-400" },
          { label: "Hot Money Flows", value: "+$36B", sub: "Concentrated in US/Asia", color: "text-amber-400" },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-3">
              <div className="text-xs text-neutral-400 mb-1">{label}</div>
              <div className={cn("text-xl font-bold", color)}>{value}</div>
              <div className="text-xs text-neutral-500 mt-1">{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Flow map SVG */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">Capital Flow Map by Region (USD Billions)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-3 flex-wrap">
            {[
              { label: "FDI", color: "#6366f1" },
              { label: "Portfolio", color: "#3b82f6" },
              { label: "Hot Money", color: "#f59e0b" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="w-3 h-2 inline-block rounded" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
          <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
            {/* Zero line */}
            <line x1={labelW + svgW / 2 - labelW} y1={0} x2={labelW + svgW / 2 - labelW} y2={svgH - 10} stroke="#404040" strokeWidth={1} />
            {regions.map((r, ri) => {
              const yBase = ri * (barH * 3 + gap) + 10;
              const scale = (svgW / 2 - labelW - 20) / maxAbs;
              const fdiW = r.fdi * scale;
              const portW = r.portfolio * scale;
              const hotW = r.hotMoney * scale;
              const zeroX = labelW + svgW / 2 - labelW;
              return (
                <g key={r.region}>
                  <text x={labelW - 4} y={yBase + barH} textAnchor="end" fontSize={9} fill="#a3a3a3">{r.region}</text>
                  {/* FDI */}
                  <rect x={fdiW >= 0 ? zeroX : zeroX + fdiW} y={yBase} width={Math.abs(fdiW)} height={barH - 3} rx={2} fill="#6366f1" opacity={0.8} />
                  <text x={fdiW >= 0 ? zeroX + fdiW + 3 : zeroX + fdiW - 3} y={yBase + barH - 6} fontSize={8} fill="#6366f1" textAnchor={fdiW >= 0 ? "start" : "end"}>${Math.abs(r.fdi).toFixed(0)}B</text>
                  {/* Portfolio */}
                  <rect x={portW >= 0 ? zeroX : zeroX + portW} y={yBase + barH} width={Math.abs(portW)} height={barH - 3} rx={2} fill="#3b82f6" opacity={0.8} />
                  <text x={portW >= 0 ? zeroX + portW + 3 : zeroX + portW - 3} y={yBase + barH * 2 - 6} fontSize={8} fill="#3b82f6" textAnchor={portW >= 0 ? "start" : "end"}>${Math.abs(r.portfolio).toFixed(0)}B</text>
                  {/* Hot money */}
                  <rect x={hotW >= 0 ? zeroX : zeroX + hotW} y={yBase + barH * 2} width={Math.abs(hotW)} height={barH - 3} rx={2} fill="#f59e0b" opacity={0.8} />
                  <text x={hotW >= 0 ? zeroX + hotW + 3 : zeroX + hotW - 3} y={yBase + barH * 3 - 6} fontSize={8} fill="#f59e0b" textAnchor={hotW >= 0 ? "start" : "end"}>{r.hotMoney >= 0 ? "+" : ""}${r.hotMoney.toFixed(0)}B</text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* EM fund flows detail */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">Emerging Market Fund Flows — Regional Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {[
            { region: "EM Asia (ex China)", equity: -12.4, debt: 8.2, flag: "🌏" },
            { region: "China", equity: -18.7, debt: -4.1, flag: "🇨🇳" },
            { region: "Latin America", equity: -6.2, debt: 2.8, flag: "🌎" },
            { region: "EMEA", equity: -3.8, debt: 1.9, flag: "🌍" },
            { region: "Frontier Markets", equity: -2.1, debt: -0.7, flag: "🗺️" },
          ].map(({ region, equity, debt, flag }) => (
            <div key={region} className="flex items-center gap-3 py-2 border-b border-neutral-800/50 last:border-0">
              <span className="text-base w-7">{flag}</span>
              <span className="text-sm text-neutral-300 w-40 shrink-0">{region}</span>
              <div className="flex gap-4 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-500">EQ</span>
                  <span className={cn("text-xs tabular-nums font-mono", equity >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {equity >= 0 ? "+" : ""}{equity.toFixed(1)}B
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-500">DT</span>
                  <span className={cn("text-xs tabular-nums font-mono", debt >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {debt >= 0 ? "+" : ""}{debt.toFixed(1)}B
                  </span>
                </div>
                <div className="flex-1 h-4 flex items-center">
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(Math.abs(equity + debt) / 30 * 100, 100)}%`,
                        backgroundColor: (equity + debt) >= 0 ? "#10b981" : "#ef4444",
                        marginLeft: (equity + debt) >= 0 ? undefined : "auto",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className={cn("text-xs tabular-nums font-bold w-16 text-right", (equity + debt) >= 0 ? "text-emerald-400" : "text-red-400")}>
                {(equity + debt) >= 0 ? "+" : ""}{(equity + debt).toFixed(1)}B
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Currency & carry trade */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">Carry Trade Attractiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { pair: "USD/JPY", rate: 5.25, carry: 4.75, signal: "Strong", color: "emerald" },
              { pair: "USD/CHF", rate: 5.25, carry: 2.25, signal: "Moderate", color: "amber" },
              { pair: "BRL/USD", rate: 10.50, carry: 5.25, signal: "High Risk", color: "red" },
              { pair: "MXN/USD", rate: 11.00, carry: 5.25, signal: "Moderate", color: "amber" },
              { pair: "AUD/JPY", rate: 4.35, carry: -0.10, signal: "Attractive", color: "emerald" },
              { pair: "TRY/USD", rate: 45.00, carry: 5.25, signal: "Very High Risk", color: "red" },
            ].map(({ pair, rate, carry, signal, color }) => (
              <div key={pair} className={cn("p-3 rounded-lg border", color === "emerald" ? "bg-emerald-950/20 border-emerald-800/30" : color === "amber" ? "bg-amber-950/20 border-amber-800/30" : "bg-red-950/20 border-red-800/30")}>
                <div className="text-sm font-mono font-bold text-neutral-200 mb-1">{pair}</div>
                <div className="text-xs text-neutral-500">Carry: {(rate - carry).toFixed(2)}%</div>
                <div className={cn("text-xs mt-1 font-medium", color === "emerald" ? "text-emerald-400" : color === "amber" ? "text-amber-400" : "text-red-400")}>{signal}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 5: Geopolitical Risk ───────────────────────────────────────────────────

function GeopoliticalRisk() {
  const currentGpr = GPR_SERIES[GPR_SERIES.length - 1];
  const gprChange = currentGpr - GPR_SERIES[GPR_SERIES.length - 2];

  const svgW = 600;
  const svgH = 180;
  const minGpr = 60;
  const maxGpr = 220;
  const toY = (v: number) => svgH - ((v - minGpr) / (maxGpr - minGpr)) * (svgH - 30) - 15;

  // Risk gauge SVG
  const gaugeAngle = (v: number) => -135 + (v / 200) * 270;
  const polarToXY = (angleDeg: number, r: number, cx: number, cy: number) => {
    const a = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const gaugeVal = Math.min(200, Math.round(currentGpr));
  const needleAngle = gaugeAngle(gaugeVal);
  const needleTip = polarToXY(needleAngle, 55, 90, 90);
  const needleBase1 = polarToXY(needleAngle + 90, 6, 90, 90);
  const needleBase2 = polarToXY(needleAngle - 90, 6, 90, 90);

  return (
    <div className="space-y-6">
      {/* GPR summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "GPR Index", value: currentGpr.toFixed(0), sub: `${gprChange >= 0 ? "+" : ""}${gprChange.toFixed(1)} vs prev`, color: currentGpr > 140 ? "text-red-400" : currentGpr > 110 ? "text-amber-400" : "text-emerald-400" },
          { label: "Risk Level", value: currentGpr > 160 ? "Critical" : currentGpr > 140 ? "High" : currentGpr > 110 ? "Elevated" : "Moderate", sub: "Geopolitical Risk Index", color: currentGpr > 140 ? "text-red-400" : "text-amber-400" },
          { label: "Safe Haven Demand", value: "High", sub: "Gold +8.4%, CHF +2.1%", color: "text-amber-400" },
          { label: "Risk-Off Score", value: "62/100", sub: "VIX elevated at 21.4", color: "text-amber-400" },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-3">
              <div className="text-xs text-neutral-400 mb-1">{label}</div>
              <div className={cn("text-2xl font-bold", color)}>{value}</div>
              <div className="text-xs text-neutral-500 mt-1">{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk gauge */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Geopolitical Risk Gauge</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <svg width={180} height={110} viewBox="0 0 180 110">
              {/* Gauge arcs */}
              {[
                { start: -135, end: -45, color: "#10b981" },
                { start: -45, end: 45, color: "#f59e0b" },
                { start: 45, end: 135, color: "#ef4444" },
              ].map(({ start, end, color }, idx) => {
                const startRad = (start * Math.PI) / 180;
                const endRad = (end * Math.PI) / 180;
                const r = 65;
                const cx = 90;
                const cy = 90;
                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);
                const largeArc = Math.abs(end - start) > 180 ? 1 : 0;
                return (
                  <path
                    key={idx}
                    d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                    fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" opacity={0.5}
                  />
                );
              })}
              {/* Needle */}
              <polygon
                points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
                fill="#ffffff" opacity={0.9}
              />
              <circle cx={90} cy={90} r={5} fill="#ffffff" />
              {/* Labels */}
              <text x={32} y={98} fontSize={8} fill="#10b981" textAnchor="middle">Low</text>
              <text x={90} y={28} fontSize={8} fill="#f59e0b" textAnchor="middle">Medium</text>
              <text x={148} y={98} fontSize={8} fill="#ef4444" textAnchor="middle">High</text>
              <text x={90} y={106} fontSize={11} fontWeight="bold" fill="#ffffff" textAnchor="middle">{gaugeVal}</text>
            </svg>
            <div className="text-xs text-neutral-500 mt-1">Historical avg: 100 | 2022 peak: 196</div>
          </CardContent>
        </Card>

        {/* GPR trend chart */}
        <Card className="bg-neutral-900 border-neutral-800 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">GPR Index — 24-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <svg width="100%" viewBox={`0 0 ${svgW} ${svgH + 30}`} className="overflow-visible">
              {[80, 100, 120, 140, 160, 180].map(v => (
                <g key={v}>
                  <line x1={30} y1={toY(v)} x2={svgW - 30} y2={toY(v)} stroke={v === 100 ? "#4b5563" : "#262626"} strokeWidth={1} strokeDasharray="3 3" />
                  <text x={24} y={toY(v) + 4} fontSize={9} fill="#525252" textAnchor="end">{v}</text>
                </g>
              ))}
              {/* Fill area under curve */}
              <defs>
                <linearGradient id="gprGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <polygon
                points={`30,${svgH - 15} ${GPR_SERIES.map((v, i) => `${(i / (GPR_SERIES.length - 1)) * (svgW - 60) + 30},${toY(v)}`).join(" ")} ${svgW - 30},${svgH - 15}`}
                fill="url(#gprGrad)"
              />
              <polyline
                points={GPR_SERIES.map((v, i) => `${(i / (GPR_SERIES.length - 1)) * (svgW - 60) + 30},${toY(v)}`).join(" ")}
                fill="none" stroke="#ef4444" strokeWidth={2} strokeLinejoin="round"
              />
              {/* Average line */}
              <line x1={30} y1={toY(100)} x2={svgW - 30} y2={toY(100)} stroke="#a3a3a3" strokeWidth={1} strokeDasharray="6 3" opacity={0.4} />
              <text x={svgW - 30} y={toY(100) - 4} fontSize={8} fill="#a3a3a366" textAnchor="end">Long-run avg</text>
              <text x={svgW - 30} y={svgH + 22} fontSize={8} fill="#525252" textAnchor="end">Mar 2026</text>
              <text x={30} y={svgH + 22} fontSize={8} fill="#525252" textAnchor="start">Apr 2024</text>
            </svg>
          </CardContent>
        </Card>
      </div>

      {/* Geopolitical events table */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">Key Geopolitical Events & Market Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {GPR_EVENTS.map(ev => {
              const impactColor = ev.impact === "high" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                ev.impact === "medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                  "bg-blue-500/20 text-blue-400 border-blue-500/30";
              return (
                <div key={ev.event} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors">
                  <div className="shrink-0">
                    <Badge className={cn("text-xs", impactColor)}>{ev.impact.toUpperCase()}</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-neutral-200 truncate">{ev.event}</div>
                    <div className="text-xs text-neutral-500">{ev.date}</div>
                  </div>
                  <div className={cn("text-sm font-mono font-bold shrink-0", ev.marketEffect >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {ev.marketEffect >= 0 ? "+" : ""}{ev.marketEffect.toFixed(1)}%
                  </div>
                  <div className="shrink-0">
                    {ev.marketEffect >= 0
                      ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      : <ArrowDownRight className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Safe haven flows + risk-off indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Safe Haven Asset Performance (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            {[
              { asset: "Gold (XAU/USD)", perf: 8.4, note: "30-year high breached" },
              { asset: "CHF vs EUR", perf: 2.1, note: "SNB intervention risk" },
              { asset: "JPY vs USD", perf: -1.8, note: "BoJ normalization weighing" },
              { asset: "US Treasuries (10y)", perf: -0.9, note: "Rate uncertainty persists" },
              { asset: "VIX (implied vol)", perf: 18.3, note: "Elevated vs 52w avg" },
              { asset: "Bitcoin (risk-off?)", perf: 12.7, note: "Institutional safe haven thesis" },
            ].map(({ asset, perf, note }) => (
              <div key={asset} className="flex items-center gap-2 py-1.5 border-b border-neutral-800/50 last:border-0">
                <div className="flex-1">
                  <div className="text-sm text-neutral-200">{asset}</div>
                  <div className="text-xs text-neutral-500">{note}</div>
                </div>
                <div className={cn("text-sm font-mono font-bold", perf >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {perf >= 0 ? "+" : ""}{perf.toFixed(1)}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Risk-Off Indicators Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            {[
              { label: "VIX", value: 21.4, max: 50, threshold: 20, unit: "" },
              { label: "Credit Spreads (HY)", value: 342, max: 800, threshold: 400, unit: "bps" },
              { label: "EM Sovereign Spreads", value: 287, max: 700, threshold: 350, unit: "bps" },
              { label: "USD Index (DXY)", value: 104.2, max: 115, threshold: 105, unit: "" },
              { label: "Gold/S&P Ratio", value: 0.42, max: 0.6, threshold: 0.45, unit: "x" },
              { label: "Put/Call Ratio", value: 1.08, max: 2.0, threshold: 1.2, unit: "x" },
            ].map(({ label, value, max, threshold, unit }) => {
              const pct = (value / max) * 100;
              const isElevated = value >= threshold;
              return (
                <div key={label} className="flex items-center gap-2 py-1.5">
                  <span className="text-xs text-neutral-400 w-36 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: isElevated ? "#ef4444" : "#10b981" }}
                    />
                  </div>
                  <span className={cn("text-xs tabular-nums w-14 text-right", isElevated ? "text-red-400" : "text-emerald-400")}>
                    {value}{unit}
                  </span>
                </div>
              );
            })}
            <div className="mt-3 p-2 rounded bg-amber-950/20 border border-amber-800/30">
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>3 of 6 indicators above risk threshold — risk-off posture recommended</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio positioning */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">Geopolitical Risk — Portfolio Positioning Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            {[
              {
                scenario: "Risk Escalation",
                probability: "35%",
                color: "red",
                actions: ["Add gold +3-5% allocation", "Reduce EM equity to underweight", "Extend duration in US Treasuries", "Long CHF vs EUR, AUD"],
              },
              {
                scenario: "Status Quo",
                probability: "45%",
                color: "amber",
                actions: ["Maintain diversified allocation", "Selective EM exposure (India, Indonesia)", "Neutral duration", "Monitor carry trades"],
              },
              {
                scenario: "De-escalation",
                probability: "20%",
                color: "emerald",
                actions: ["Add risk assets aggressively", "Rotate to EM equities", "Reduce gold, add cyclicals", "Short volatility positions"],
              },
            ].map(({ scenario, probability, color, actions }) => (
              <div key={scenario} className={cn("p-3 rounded-lg border", color === "emerald" ? "bg-emerald-950/20 border-emerald-800/30" : color === "amber" ? "bg-amber-950/20 border-amber-800/30" : "bg-red-950/20 border-red-800/30")}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-neutral-200 text-xs">{scenario}</span>
                  <Badge className={cn("text-xs", color === "emerald" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : color === "amber" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-red-500/20 text-red-400 border-red-500/30")}>
                    {probability}
                  </Badge>
                </div>
                <ul className="space-y-1">
                  {actions.map(a => (
                    <li key={a} className="text-xs text-neutral-500 flex gap-1.5">
                      <span className={color === "emerald" ? "text-emerald-600" : color === "amber" ? "text-amber-600" : "text-red-600"}>•</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function GlobalMacroDashPage() {
  const [activeTab, setActiveTab] = useState("scorecard");

  const tabs = [
    { id: "scorecard", label: "Economic Scorecard", icon: Globe },
    { id: "inflation", label: "Inflation", icon: TrendingUp },
    { id: "growth", label: "Growth Indicators", icon: BarChart2 },
    { id: "flows", label: "Capital Flows", icon: DollarSign },
    { id: "geopolitical", label: "Geopolitical Risk", icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Global Macro Dashboard</h1>
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">LIVE</Badge>
        </div>
        <p className="text-sm text-neutral-400">G20 economic indicators, capital flows, and geopolitical risk monitor — updated Mar 2026</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-neutral-900 border border-neutral-800 h-auto p-1 flex-wrap gap-1 mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-neutral-400 text-xs sm:text-sm px-3 py-1.5 flex items-center gap-1.5"
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <TabsContent value="scorecard" className="data-[state=inactive]:hidden">
              <EconomicScorecard />
            </TabsContent>
            <TabsContent value="inflation" className="data-[state=inactive]:hidden">
              <InflationDashboard />
            </TabsContent>
            <TabsContent value="growth" className="data-[state=inactive]:hidden">
              <GrowthIndicators />
            </TabsContent>
            <TabsContent value="flows" className="data-[state=inactive]:hidden">
              <CapitalFlows />
            </TabsContent>
            <TabsContent value="geopolitical" className="data-[state=inactive]:hidden">
              <GeopoliticalRisk />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
