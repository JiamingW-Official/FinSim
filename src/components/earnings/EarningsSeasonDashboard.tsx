"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  Calendar,
  Clock,
  ChevronUp,
  ChevronDown,
  Minus,
  Zap,
  AlertTriangle,
  Target,
  Eye,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 61;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function randBetween(lo: number, hi: number) {
  return lo + rand() * (hi - lo);
}
function randInt(lo: number, hi: number) {
  return Math.floor(randBetween(lo, hi + 1));
}
function randPick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuarterSummary {
  label: string;
  reportedPct: number;
  beatEpsPct: number;
  beatRevPct: number;
  epsGrowth: number;
  revGrowth: number;
  guidanceRaised: number;
  guidanceMaintained: number;
  guidanceLowered: number;
}

interface SectorScorecard {
  name: string;
  short: string;
  color: string;
  beatRate: number;
  avgEpsSurprise: number;
  avgRevSurprise: number;
  guidanceScore: number; // -100 to +100
  revisionTrend: "upgrade" | "downgrade" | "flat";
}

interface UpcomingEarning {
  ticker: string;
  company: string;
  date: string;
  time: "BMO" | "AMC";
  epsEst: number;
  revEst: number; // billions
  iv: number; // implied vol %
  impliedMove: number; // ±%
}

interface ReportedEarning {
  ticker: string;
  company: string;
  epsActual: number;
  epsEst: number;
  epsSurprise: number; // %
  revActual: number; // B
  revEst: number; // B
  revSurprise: number; // %
  reaction: number; // day-after price %
  guidanceAction: "raised" | "maintained" | "lowered" | "withdrawn";
  qualityScore: number; // 0-100
}

interface RevisionTicker {
  ticker: string;
  company: string;
  sector: string;
  revisionPct: number; // +/- %
  analystCount: number;
  whisperVsConsensus: number; // %
  direction: "up" | "down";
}

interface OptionsPositioning {
  ticker: string;
  impliedMove: number; // ±%
  historicalMove: number; // avg realized ±%
  exceedRate: number; // % times realized > implied
  callSkew: number; // 0-100, 50=neutral, >50=call heavy
  ivPreEarnings: number;
  ivPostEarnings: number;
  ivCrush: number; // %
}

// ── Static Data Generation (seeded, deterministic) ────────────────────────────

const SECTOR_DEFS = [
  { name: "Technology", short: "Tech", color: "#6366f1" },
  { name: "Healthcare", short: "HC", color: "#10b981" },
  { name: "Financials", short: "Fin", color: "#3b82f6" },
  { name: "Cons. Disc.", short: "CD", color: "#f59e0b" },
  { name: "Cons. Staples", short: "CS", color: "#84cc16" },
  { name: "Industrials", short: "Ind", color: "#8b5cf6" },
  { name: "Energy", short: "Enrg", color: "#ef4444" },
  { name: "Materials", short: "Mat", color: "#14b8a6" },
  { name: "Real Estate", short: "RE", color: "#f97316" },
  { name: "Utilities", short: "Util", color: "#06b6d4" },
  { name: "Comm. Services", short: "Comm", color: "#ec4899" },
] as const;

const TICKERS_LARGE = [
  { ticker: "AAPL", company: "Apple", sector: "Technology" },
  { ticker: "MSFT", company: "Microsoft", sector: "Technology" },
  { ticker: "NVDA", company: "NVIDIA", sector: "Technology" },
  { ticker: "GOOGL", company: "Alphabet", sector: "Comm. Services" },
  { ticker: "META", company: "Meta", sector: "Comm. Services" },
  { ticker: "AMZN", company: "Amazon", sector: "Cons. Disc." },
  { ticker: "TSLA", company: "Tesla", sector: "Cons. Disc." },
  { ticker: "JPM", company: "JPMorgan", sector: "Financials" },
  { ticker: "JNJ", company: "J&J", sector: "Healthcare" },
  { ticker: "XOM", company: "ExxonMobil", sector: "Energy" },
  { ticker: "UNH", company: "UnitedHealth", sector: "Healthcare" },
  { ticker: "HD", company: "Home Depot", sector: "Cons. Disc." },
  { ticker: "PG", company: "Procter & Gamble", sector: "Cons. Staples" },
  { ticker: "MA", company: "Mastercard", sector: "Financials" },
  { ticker: "AVGO", company: "Broadcom", sector: "Technology" },
  { ticker: "CVX", company: "Chevron", sector: "Energy" },
  { ticker: "LLY", company: "Eli Lilly", sector: "Healthcare" },
  { ticker: "ABBV", company: "AbbVie", sector: "Healthcare" },
  { ticker: "CRM", company: "Salesforce", sector: "Technology" },
  { ticker: "ACN", company: "Accenture", sector: "Technology" },
  { ticker: "BAC", company: "Bank of America", sector: "Financials" },
  { ticker: "TMO", company: "Thermo Fisher", sector: "Healthcare" },
  { ticker: "COST", company: "Costco", sector: "Cons. Staples" },
  { ticker: "AMD", company: "AMD", sector: "Technology" },
  { ticker: "NEE", company: "NextEra Energy", sector: "Utilities" },
  { ticker: "CAT", company: "Caterpillar", sector: "Industrials" },
  { ticker: "GS", company: "Goldman Sachs", sector: "Financials" },
  { ticker: "DE", company: "Deere & Co.", sector: "Industrials" },
  { ticker: "AMT", company: "American Tower", sector: "Real Estate" },
  { ticker: "FCX", company: "Freeport-McMoRan", sector: "Materials" },
  { ticker: "T", company: "AT&T", sector: "Comm. Services" },
  { ticker: "SO", company: "Southern Co", sector: "Utilities" },
  { ticker: "INTC", company: "Intel", sector: "Technology" },
  { ticker: "MU", company: "Micron", sector: "Technology" },
  { ticker: "SNAP", company: "Snap Inc.", sector: "Comm. Services" },
  { ticker: "ROKU", company: "Roku", sector: "Comm. Services" },
  { ticker: "ZM", company: "Zoom Video", sector: "Technology" },
  { ticker: "UBER", company: "Uber", sector: "Technology" },
  { ticker: "LYFT", company: "Lyft", sector: "Technology" },
  { ticker: "DASH", company: "DoorDash", sector: "Cons. Disc." },
];

const GUIDANCE_ACTIONS: Array<"raised" | "maintained" | "lowered" | "withdrawn"> = [
  "raised",
  "maintained",
  "lowered",
  "withdrawn",
];

// Generate all static data once
function generateData() {
  // Reset seed side-effects by using local copies
  // Quarter summaries
  const quarters: QuarterSummary[] = [
    { label: "Q4 2024", reportedPct: 100, beatEpsPct: 74, beatRevPct: 61, epsGrowth: 12.4, revGrowth: 5.8, guidanceRaised: 42, guidanceMaintained: 38, guidanceLowered: 20 },
    { label: "Q3 2024", reportedPct: 100, beatEpsPct: 71, beatRevPct: 59, epsGrowth: 9.1, revGrowth: 4.7, guidanceRaised: 38, guidanceMaintained: 40, guidanceLowered: 22 },
    { label: "Q2 2024", reportedPct: 100, beatEpsPct: 79, beatRevPct: 63, epsGrowth: 11.2, revGrowth: 5.2, guidanceRaised: 45, guidanceMaintained: 36, guidanceLowered: 19 },
    { label: "Q1 2024", reportedPct: 100, beatEpsPct: 77, beatRevPct: 65, epsGrowth: 8.5, revGrowth: 3.9, guidanceRaised: 40, guidanceMaintained: 39, guidanceLowered: 21 },
    { label: "Q1 2025 (live)", reportedPct: 67, beatEpsPct: 76, beatRevPct: 62, epsGrowth: 13.8, revGrowth: 6.1, guidanceRaised: 44, guidanceMaintained: 37, guidanceLowered: 19 },
  ];
  const currentQ = quarters[4];

  // Sector scorecards
  const sectors: SectorScorecard[] = SECTOR_DEFS.map((def) => ({
    name: def.name,
    short: def.short,
    color: def.color,
    beatRate: Math.round(randBetween(55, 90)),
    avgEpsSurprise: parseFloat(randBetween(1, 12).toFixed(1)),
    avgRevSurprise: parseFloat(randBetween(-2, 8).toFixed(1)),
    guidanceScore: Math.round(randBetween(-40, 60)),
    revisionTrend: randPick(["upgrade", "downgrade", "flat"] as const),
  }));

  // Upcoming earnings (20)
  const upcoming: UpcomingEarning[] = TICKERS_LARGE.slice(0, 20).map((t) => ({
    ticker: t.ticker,
    company: t.company,
    date: `Apr ${randInt(1, 30)}`,
    time: randPick(["BMO", "AMC"] as const),
    epsEst: parseFloat(randBetween(0.5, 12).toFixed(2)),
    revEst: parseFloat(randBetween(1.5, 120).toFixed(1)),
    iv: Math.round(randBetween(25, 95)),
    impliedMove: parseFloat(randBetween(3, 18).toFixed(1)),
  }));

  // Reported earnings (20)
  const reported: ReportedEarning[] = TICKERS_LARGE.slice(20, 40).map((t) => {
    const epsEst = parseFloat(randBetween(0.8, 10).toFixed(2));
    const epsSurprise = parseFloat(randBetween(-15, 25).toFixed(1));
    const epsActual = parseFloat((epsEst * (1 + epsSurprise / 100)).toFixed(2));
    const revEst = parseFloat(randBetween(2, 80).toFixed(1));
    const revSurprise = parseFloat(randBetween(-8, 12).toFixed(1));
    const revActual = parseFloat((revEst * (1 + revSurprise / 100)).toFixed(1));
    const reaction = parseFloat(randBetween(-12, 18).toFixed(1));
    const guidanceAction = randPick(GUIDANCE_ACTIONS);
    const beatBoth = epsSurprise > 0 && revSurprise > 0;
    const guidanceBonus = guidanceAction === "raised" ? 20 : guidanceAction === "lowered" ? -20 : 0;
    const qualityScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(50 + epsSurprise * 1.5 + revSurprise * 2 + guidanceBonus + (beatBoth ? 10 : 0))
      )
    );
    return {
      ticker: t.ticker,
      company: t.company,
      epsActual,
      epsEst,
      epsSurprise,
      revActual,
      revEst,
      revSurprise,
      reaction,
      guidanceAction,
      qualityScore,
    };
  });

  // Revision tickers
  const revisionUp: RevisionTicker[] = [
    { ticker: "NVDA", company: "NVIDIA", sector: "Technology", revisionPct: 18.4, analystCount: 52, whisperVsConsensus: 3.2, direction: "up" },
    { ticker: "LLY", company: "Eli Lilly", sector: "Healthcare", revisionPct: 14.7, analystCount: 28, whisperVsConsensus: 5.1, direction: "up" },
    { ticker: "META", company: "Meta", sector: "Comm. Services", revisionPct: 11.2, analystCount: 44, whisperVsConsensus: 2.8, direction: "up" },
    { ticker: "AVGO", company: "Broadcom", sector: "Technology", revisionPct: 9.8, analystCount: 30, whisperVsConsensus: 1.9, direction: "up" },
    { ticker: "MA", company: "Mastercard", sector: "Financials", revisionPct: 7.3, analystCount: 36, whisperVsConsensus: 0.9, direction: "up" },
    { ticker: "UNH", company: "UnitedHealth", sector: "Healthcare", revisionPct: 6.5, analystCount: 25, whisperVsConsensus: 2.3, direction: "up" },
    { ticker: "CAT", company: "Caterpillar", sector: "Industrials", revisionPct: 5.9, analystCount: 20, whisperVsConsensus: 1.1, direction: "up" },
    { ticker: "GS", company: "Goldman Sachs", sector: "Financials", revisionPct: 5.2, analystCount: 22, whisperVsConsensus: 0.4, direction: "up" },
    { ticker: "AMZN", company: "Amazon", sector: "Cons. Disc.", revisionPct: 4.8, analystCount: 48, whisperVsConsensus: 3.7, direction: "up" },
    { ticker: "CRM", company: "Salesforce", sector: "Technology", revisionPct: 4.1, analystCount: 38, whisperVsConsensus: -0.3, direction: "up" },
  ];

  const revisionDown: RevisionTicker[] = [
    { ticker: "INTC", company: "Intel", sector: "Technology", revisionPct: -22.1, analystCount: 40, whisperVsConsensus: -4.2, direction: "down" },
    { ticker: "ZM", company: "Zoom Video", sector: "Technology", revisionPct: -16.8, analystCount: 28, whisperVsConsensus: -2.9, direction: "down" },
    { ticker: "SNAP", company: "Snap Inc.", sector: "Comm. Services", revisionPct: -14.3, analystCount: 32, whisperVsConsensus: -3.8, direction: "down" },
    { ticker: "LYFT", company: "Lyft", sector: "Technology", revisionPct: -11.5, analystCount: 24, whisperVsConsensus: -1.6, direction: "down" },
    { ticker: "ROKU", company: "Roku", sector: "Comm. Services", revisionPct: -9.7, analystCount: 20, whisperVsConsensus: -2.1, direction: "down" },
    { ticker: "XOM", company: "ExxonMobil", sector: "Energy", revisionPct: -7.2, analystCount: 26, whisperVsConsensus: -1.0, direction: "down" },
    { ticker: "CVX", company: "Chevron", sector: "Energy", revisionPct: -6.4, analystCount: 22, whisperVsConsensus: -0.8, direction: "down" },
    { ticker: "T", company: "AT&T", sector: "Comm. Services", revisionPct: -5.8, analystCount: 18, whisperVsConsensus: -0.5, direction: "down" },
    { ticker: "SO", company: "Southern Co", sector: "Utilities", revisionPct: -4.2, analystCount: 14, whisperVsConsensus: -0.2, direction: "down" },
    { ticker: "AMT", company: "American Tower", sector: "Real Estate", revisionPct: -3.7, analystCount: 16, whisperVsConsensus: 0.1, direction: "down" },
  ];

  // Options positioning
  const optionsTickers = [
    { ticker: "AAPL", impliedMove: 5.2, historicalMove: 4.8, exceedRate: 44, callSkew: 52, ivPreEarnings: 42, ivPostEarnings: 26 },
    { ticker: "NVDA", impliedMove: 12.4, historicalMove: 11.9, exceedRate: 48, callSkew: 61, ivPreEarnings: 88, ivPostEarnings: 52 },
    { ticker: "META", impliedMove: 9.1, historicalMove: 10.3, exceedRate: 57, callSkew: 55, ivPreEarnings: 74, ivPostEarnings: 44 },
    { ticker: "TSLA", impliedMove: 14.8, historicalMove: 17.2, exceedRate: 62, callSkew: 48, ivPreEarnings: 96, ivPostEarnings: 58 },
    { ticker: "AMZN", impliedMove: 7.3, historicalMove: 6.9, exceedRate: 46, callSkew: 57, ivPreEarnings: 58, ivPostEarnings: 34 },
    { ticker: "GOOGL", impliedMove: 6.8, historicalMove: 7.1, exceedRate: 52, callSkew: 50, ivPreEarnings: 52, ivPostEarnings: 31 },
    { ticker: "MSFT", impliedMove: 4.9, historicalMove: 4.2, exceedRate: 40, callSkew: 54, ivPreEarnings: 38, ivPostEarnings: 23 },
    { ticker: "SNAP", impliedMove: 18.6, historicalMove: 22.4, exceedRate: 65, callSkew: 39, ivPreEarnings: 112, ivPostEarnings: 68 },
  ].map((o) => ({
    ...o,
    ivCrush: Math.round(((o.ivPreEarnings - o.ivPostEarnings) / o.ivPreEarnings) * 100),
  }));

  // Revision breadth by sector
  const revisionBreadth = SECTOR_DEFS.map((def) => ({
    name: def.short,
    color: def.color,
    raisingPct: Math.round(randBetween(25, 75)),
  }));

  return {
    quarters,
    currentQ,
    sectors,
    upcoming,
    reported,
    revisionUp,
    revisionDown,
    optionsTickers,
    revisionBreadth,
  };
}

// ── Helper functions ──────────────────────────────────────────────────────────

function pctColor(n: number): string {
  if (n > 0) return "text-emerald-400";
  if (n < 0) return "text-red-400";
  return "text-muted-foreground";
}

function pctBg(n: number): string {
  if (n > 0) return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  if (n < 0) return "bg-red-500/20 text-red-400 border border-red-500/30";
  return "bg-muted-foreground/20 text-muted-foreground border border-muted-foreground/30";
}

function qualityColor(score: number): string {
  if (score >= 70) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function guidanceColor(action: string): string {
  if (action === "raised") return "text-emerald-400 bg-emerald-500/5";
  if (action === "lowered") return "text-red-400 bg-red-500/5";
  if (action === "withdrawn") return "text-orange-400 bg-orange-500/10";
  return "text-muted-foreground bg-muted-foreground/10";
}

function guidanceBadge(action: string): string {
  if (action === "raised") return "▲ Raised";
  if (action === "lowered") return "▼ Lowered";
  if (action === "withdrawn") return "— Withdrawn";
  return "= Maintained";
}

// ── Micro SVG charts ──────────────────────────────────────────────────────────

function BarChartSVG({
  values,
  colors,
  width = 200,
  height = 60,
  labels,
}: {
  values: number[];
  colors: string[];
  width?: number;
  height?: number;
  labels?: string[];
}) {
  const max = Math.max(...values.map(Math.abs), 1);
  const barW = Math.floor((width - (values.length - 1) * 4) / values.length);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {values.map((v, i) => {
        const barH = Math.max(2, (Math.abs(v) / max) * (height - 16));
        const x = i * (barW + 4);
        const y = height - 12 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={2} fill={colors[i] ?? "#6366f1"} opacity={0.85} />
            {labels && (
              <text x={x + barW / 2} y={height - 1} textAnchor="middle" fontSize={7} fill="#94a3b8">
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function MiniLineChart({
  values,
  color,
  width = 80,
  height = 28,
}: {
  values: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

function SectorHeatmap({ sectors }: { sectors: SectorScorecard[] }) {
  const W = 380;
  const H = 120;
  const cols = 4;
  const rows = Math.ceil(sectors.length / cols);
  const cw = Math.floor(W / cols) - 4;
  const ch = Math.floor(H / rows) - 4;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {sectors.map((sec, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * (cw + 4);
        const y = row * (ch + 4);
        // Color: beat>70 emerald, beat>60 teal, beat>50 amber, below red
        const fill =
          sec.beatRate >= 75
            ? "#059669"
            : sec.beatRate >= 65
            ? "#0d9488"
            : sec.beatRate >= 55
            ? "#d97706"
            : "#dc2626";
        const opacity = 0.65 + (sec.beatRate / 100) * 0.35;
        return (
          <g key={sec.name}>
            <rect x={x} y={y} width={cw} height={ch} rx={4} fill={fill} opacity={opacity} />
            <text x={x + cw / 2} y={y + ch / 2 - 5} textAnchor="middle" fontSize={9} fontWeight="600" fill="#fff">
              {sec.short}
            </text>
            <text x={x + cw / 2} y={y + ch / 2 + 7} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.8)">
              {sec.beatRate}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function IVCrushBar({ pre, post, ticker }: { pre: number; post: number; ticker: string }) {
  const maxW = 140;
  const preW = Math.round((pre / 130) * maxW);
  const postW = Math.round((post / 130) * maxW);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-10 text-right font-mono text-muted-foreground">{ticker}</span>
      <div className="flex flex-col gap-[2px]">
        <div className="flex items-center gap-1">
          <div style={{ width: preW }} className="h-[5px] bg-amber-400/70 rounded-full" />
          <span className="text-amber-400">{pre}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div style={{ width: postW }} className="h-[5px] bg-muted-foreground/50 rounded-full" />
          <span className="text-muted-foreground">{post}%</span>
        </div>
      </div>
    </div>
  );
}

function RevisionBreadthChart({ data }: { data: { name: string; color: string; raisingPct: number }[] }) {
  const W = 360;
  const barH = 10;
  const gap = 6;
  const H = data.length * (barH + gap);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {data.map((d, i) => {
        const y = i * (barH + gap);
        const fillW = Math.round((d.raisingPct / 100) * (W - 60));
        const emptyW = (W - 60) - fillW;
        return (
          <g key={d.name}>
            <text x={0} y={y + barH - 1} fontSize={8} fill="#94a3b8" fontFamily="monospace">
              {d.name.padEnd(5)}
            </text>
            <rect x={40} y={y} width={fillW} height={barH} rx={2} fill="#10b981" opacity={0.75} />
            <rect x={40 + fillW} y={y} width={emptyW} height={barH} rx={2} fill="#ef4444" opacity={0.45} />
            <text x={W - 1} y={y + barH - 1} textAnchor="end" fontSize={8} fill={d.raisingPct >= 50 ? "#10b981" : "#ef4444"}>
              {d.raisingPct}%↑
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ImpliedVsHistoricalChart({ data }: { data: { ticker: string; impliedMove: number; historicalMove: number }[] }) {
  const W = 360;
  const barH = 12;
  const gap = 8;
  const H = data.length * (barH + gap) + 16;
  const maxVal = Math.max(...data.map((d) => Math.max(d.impliedMove, d.historicalMove))) * 1.1;
  const barsW = W - 60;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <text x={40} y={10} fontSize={8} fill="#94a3b8">
        Implied
      </text>
      <text x={200} y={10} fontSize={8} fill="#6366f1">
        Historical
      </text>
      {data.map((d, i) => {
        const y = 16 + i * (barH + gap);
        const iw = Math.round((d.impliedMove / maxVal) * barsW);
        const hw = Math.round((d.historicalMove / maxVal) * barsW);
        const exceeded = d.historicalMove > d.impliedMove;
        return (
          <g key={d.ticker}>
            <text x={0} y={y + barH - 2} fontSize={8} fill="#cbd5e1" fontFamily="monospace">
              {d.ticker.slice(0, 4).padEnd(4)}
            </text>
            <rect x={42} y={y} width={iw} height={barH / 2 - 1} rx={2} fill="#f59e0b" opacity={0.7} />
            <rect x={42} y={y + barH / 2} width={hw} height={barH / 2 - 1} rx={2} fill={exceeded ? "#6366f1" : "#6366f180"} opacity={0.7} />
          </g>
        );
      })}
    </svg>
  );
}

// ── Section 1: S&P 500 Tracker ─────────────────────────────────────────────

function SP500Tracker({ quarters, currentQ }: { quarters: QuarterSummary[]; currentQ: QuarterSummary }) {
  return (
    <div className="space-y-4">
      {/* Current quarter headline */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Reported", value: `${currentQ.reportedPct}%`, sublabel: "of S&P 500", color: "text-primary" },
          { label: "EPS Beat Rate", value: `${currentQ.beatEpsPct}%`, sublabel: "above est.", color: pctColor(currentQ.beatEpsPct - 50) },
          { label: "Revenue Beat", value: `${currentQ.beatRevPct}%`, sublabel: "above est.", color: pctColor(currentQ.beatRevPct - 50) },
          { label: "Blended EPS Growth", value: `+${currentQ.epsGrowth}%`, sublabel: "YoY blended", color: "text-emerald-400" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border/20 bg-card/60 p-3"
          >
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={cn("text-xl font-semibold tabular-nums", stat.color)}>{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sublabel}</p>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="rounded-lg border border-border/20 bg-card/60 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Q1 2025 Reporting Progress</span>
          <span className="text-xs text-primary font-semibold">{currentQ.reportedPct}% complete</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentQ.reportedPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { label: "Guidance Raised", value: currentQ.guidanceRaised, color: "text-emerald-400" },
            { label: "Maintained", value: currentQ.guidanceMaintained, color: "text-muted-foreground" },
            { label: "Lowered", value: currentQ.guidanceLowered, color: "text-red-400" },
          ].map((g) => (
            <div key={g.label} className="text-center">
              <p className={cn("text-base font-semibold", g.color)}>{g.value}%</p>
              <p className="text-[11px] text-muted-foreground">{g.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-quarter comparison */}
      <div className="rounded-lg border border-border/20 bg-card/60 p-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">5-Quarter Comparison</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-muted-foreground border-b border-border/20">
                <th className="text-left pb-1 font-medium">Quarter</th>
                <th className="text-center pb-1 font-medium">EPS Beat%</th>
                <th className="text-center pb-1 font-medium">Rev Beat%</th>
                <th className="text-center pb-1 font-medium">EPS Growth</th>
                <th className="text-center pb-1 font-medium">Rev Growth</th>
                <th className="text-center pb-1 font-medium">Guidance↑</th>
              </tr>
            </thead>
            <tbody>
              {quarters.map((q, i) => (
                <tr
                  key={q.label}
                  className={cn(
                    "border-b border-border/20 last:border-0",
                    i === quarters.length - 1 && "bg-primary/5 font-semibold"
                  )}
                >
                  <td className="py-1 text-muted-foreground">{q.label}</td>
                  <td className={cn("py-1 text-center", pctColor(q.beatEpsPct - 65))}>{q.beatEpsPct}%</td>
                  <td className={cn("py-1 text-center", pctColor(q.beatRevPct - 55))}>{q.beatRevPct}%</td>
                  <td className={cn("py-1 text-center", pctColor(q.epsGrowth))}>+{q.epsGrowth}%</td>
                  <td className={cn("py-1 text-center", pctColor(q.revGrowth))}>+{q.revGrowth}%</td>
                  <td className={cn("py-1 text-center", pctColor(q.guidanceRaised - 40))}>{q.guidanceRaised}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pt-1">
          <BarChartSVG
            values={quarters.map((q) => q.beatEpsPct)}
            colors={quarters.map((_, i) => (i === quarters.length - 1 ? "#6366f1" : "#334155"))}
            labels={quarters.map((q) => q.label.split(" ")[0])}
            width={380}
            height={56}
          />
        </div>
      </div>
    </div>
  );
}

// ── Section 2: Sector Scorecard ────────────────────────────────────────────

function SectorScoreCardSection({ sectors }: { sectors: SectorScorecard[] }) {
  const [sortKey, setSortKey] = useState<"beatRate" | "avgEpsSurprise" | "guidanceScore">("beatRate");
  const sorted = useMemo(
    () => [...sectors].sort((a, b) => b[sortKey] - a[sortKey]),
    [sectors, sortKey]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Heatmap */}
        <div className="rounded-lg border border-border/20 bg-card/60 p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Beat Rate Heatmap</p>
          <div className="overflow-x-auto">
            <SectorHeatmap sectors={sectors} />
          </div>
          <div className="flex gap-3 text-[11px] text-muted-foreground pt-1">
            {[
              { color: "#059669", label: "≥75% beat" },
              { color: "#0d9488", label: "65–74%" },
              { color: "#d97706", label: "55–64%" },
              { color: "#dc2626", label: "<55%" },
            ].map((leg) => (
              <div key={leg.label} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: leg.color }} />
                {leg.label}
              </div>
            ))}
          </div>
        </div>

        {/* Revision trend */}
        <div className="rounded-lg border border-border/20 bg-card/60 p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Estimate Revision Trend</p>
          <div className="space-y-1.5">
            {sectors.map((sec) => (
              <div key={sec.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sec.color }} />
                  <span className="text-xs text-muted-foreground">{sec.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {sec.revisionTrend === "upgrade" ? (
                    <span className="flex items-center gap-0.5 text-xs text-emerald-400">
                      Upgrade
                    </span>
                  ) : sec.revisionTrend === "downgrade" ? (
                    <span className="flex items-center gap-0.5 text-xs text-red-400">
                      Downgrade
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      Flat
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/20 bg-card/60 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Sector Scorecard</p>
          <div className="flex gap-1">
            {(["beatRate", "avgEpsSurprise", "guidanceScore"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSortKey(k)}
                className={cn(
                  "text-[11px] px-2 py-0.5 rounded transition-colors",
                  sortKey === k
                    ? "bg-indigo-500/30 text-indigo-300"
                    : "text-muted-foreground hover:text-muted-foreground"
                )}
              >
                {k === "beatRate" ? "Beat%" : k === "avgEpsSurprise" ? "EPS Surp" : "Guidance"}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-muted-foreground border-b border-border/20">
                <th className="text-left pb-1 font-medium">Sector</th>
                <th className="text-center pb-1 font-medium">Beat%</th>
                <th className="text-center pb-1 font-medium">EPS Surp%</th>
                <th className="text-center pb-1 font-medium">Rev Surp%</th>
                <th className="text-center pb-1 font-medium">Guide Score</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((sec) => (
                <motion.tr
                  key={sec.name}
                  layout
                  className="border-b border-border/20 last:border-0"
                >
                  <td className="py-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sec.color }} />
                      <span className="text-muted-foreground">{sec.name}</span>
                    </div>
                  </td>
                  <td className={cn("py-1 text-center font-semibold", pctColor(sec.beatRate - 65))}>{sec.beatRate}%</td>
                  <td className={cn("py-1 text-center", pctColor(sec.avgEpsSurprise))}>
                    {sec.avgEpsSurprise > 0 ? "+" : ""}{sec.avgEpsSurprise}%
                  </td>
                  <td className={cn("py-1 text-center", pctColor(sec.avgRevSurprise))}>
                    {sec.avgRevSurprise > 0 ? "+" : ""}{sec.avgRevSurprise}%
                  </td>
                  <td className="py-1 text-center">
                    <span className={cn("px-1.5 py-0.5 rounded text-[11px] font-semibold", sec.guidanceScore > 0 ? "bg-emerald-500/15 text-emerald-400" : sec.guidanceScore < 0 ? "bg-red-500/15 text-red-400" : "bg-muted-foreground/15 text-muted-foreground")}>
                      {sec.guidanceScore > 0 ? "+" : ""}{sec.guidanceScore}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Section 3: Earnings Feed ───────────────────────────────────────────────

function EarningsFeedSection({
  upcoming,
  reported,
}: {
  upcoming: UpcomingEarning[];
  reported: ReportedEarning[];
}) {
  const [view, setView] = useState<"upcoming" | "reported">("upcoming");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["upcoming", "reported"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-colors",
              view === v ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40" : "text-muted-foreground border border-border/20 hover:border-border/60"
            )}
          >
            {v === "upcoming" ? "Upcoming (20)" : "Reported (20)"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === "upcoming" ? (
          <motion.div key="upcoming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-lg border border-border/20 bg-card/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead className="bg-card/60">
                    <tr className="text-muted-foreground border-b border-border/20">
                      <th className="text-left px-3 py-2 font-medium">Ticker</th>
                      <th className="text-center px-3 py-2 font-medium">Date</th>
                      <th className="text-center px-3 py-2 font-medium">Time</th>
                      <th className="text-center px-3 py-2 font-medium">EPS Est</th>
                      <th className="text-center px-3 py-2 font-medium">Rev Est (B)</th>
                      <th className="text-center px-3 py-2 font-medium">IV%</th>
                      <th className="text-center px-3 py-2 font-medium">Impl. Move</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcoming.map((row) => (
                      <tr key={row.ticker} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-1.5">
                          <div>
                            <span className="font-semibold text-foreground">{row.ticker}</span>
                            <span className="block text-[11px] text-muted-foreground">{row.company}</span>
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-center text-muted-foreground">{row.date}</td>
                        <td className="px-3 py-1.5 text-center">
                          <span className={cn("px-1.5 py-0.5 rounded text-[11px] font-medium", row.time === "BMO" ? "bg-primary/15 text-primary" : "bg-primary/15 text-primary")}>
                            {row.time}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-center font-mono text-muted-foreground">${row.epsEst}</td>
                        <td className="px-3 py-1.5 text-center font-mono text-muted-foreground">${row.revEst}B</td>
                        <td className="px-3 py-1.5 text-center">
                          <span className={cn("font-semibold", row.iv > 70 ? "text-red-400" : row.iv > 50 ? "text-amber-400" : "text-muted-foreground")}>
                            {row.iv}%
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          <span className="text-amber-400 font-semibold">±{row.impliedMove}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="reported" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-lg border border-border/20 bg-card/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead className="bg-card/60">
                    <tr className="text-muted-foreground border-b border-border/20">
                      <th className="text-left px-3 py-2 font-medium">Ticker</th>
                      <th className="text-center px-2 py-2 font-medium">EPS Act/Est</th>
                      <th className="text-center px-2 py-2 font-medium">EPS Surp</th>
                      <th className="text-center px-2 py-2 font-medium">Rev Surp</th>
                      <th className="text-center px-2 py-2 font-medium">Reaction</th>
                      <th className="text-center px-2 py-2 font-medium">Guidance</th>
                      <th className="text-center px-2 py-2 font-medium">Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reported.map((row) => (
                      <tr key={row.ticker} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-1.5">
                          <div>
                            <span className="font-semibold text-foreground">{row.ticker}</span>
                            <span className="block text-[11px] text-muted-foreground">{row.company}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-center font-mono">
                          <span className={pctColor(row.epsSurprise)}>${row.epsActual}</span>
                          <span className="text-muted-foreground"> / ${row.epsEst}</span>
                        </td>
                        <td className={cn("px-2 py-1.5 text-center font-semibold", pctColor(row.epsSurprise))}>
                          {row.epsSurprise > 0 ? "+" : ""}{row.epsSurprise}%
                        </td>
                        <td className={cn("px-2 py-1.5 text-center font-semibold", pctColor(row.revSurprise))}>
                          {row.revSurprise > 0 ? "+" : ""}{row.revSurprise}%
                        </td>
                        <td className={cn("px-2 py-1.5 text-center font-semibold", pctColor(row.reaction))}>
                          {row.reaction > 0 ? "+" : ""}{row.reaction}%
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <span className={cn("px-1 py-0.5 rounded text-[11px] font-medium", guidanceColor(row.guidanceAction))}>
                            {guidanceBadge(row.guidanceAction)}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <svg width={28} height={8} viewBox="0 0 28 8">
                              <rect x={0} y={0} width={28} height={8} rx={4} fill="#1e293b" />
                              <rect x={0} y={0} width={Math.round((row.qualityScore / 100) * 28)} height={8} rx={4} fill={qualityColor(row.qualityScore)} opacity={0.8} />
                            </svg>
                            <span className="text-[11px] font-mono" style={{ color: qualityColor(row.qualityScore) }}>
                              {row.qualityScore}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Section 4: Revision Momentum ──────────────────────────────────────────

function RevisionMomentumSection({
  revisionUp,
  revisionDown,
  revisionBreadth,
}: {
  revisionUp: RevisionTicker[];
  revisionDown: RevisionTicker[];
  revisionBreadth: { name: string; color: string; raisingPct: number }[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Biggest upward */}
        <div className="rounded-lg border border-border/20 bg-card/60 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-emerald-400">Biggest Upward Revisions (30d)</p>
          </div>
          <div className="space-y-1.5">
            {revisionUp.map((t) => (
              <div key={t.ticker} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-semibold text-foreground w-12 flex-shrink-0">{t.ticker}</span>
                  <span className="text-xs text-muted-foreground truncate">{t.sector}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t.analystCount} analysts</span>
                  {t.whisperVsConsensus !== 0 && (
                    <span className={cn("text-[11px] px-1 py-0.5 rounded", pctBg(t.whisperVsConsensus))}>
                      whisper {t.whisperVsConsensus > 0 ? "+" : ""}{t.whisperVsConsensus}%
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-emerald-400">+{t.revisionPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biggest downward */}
        <div className="rounded-lg border border-border/20 bg-card/60 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-red-400">Biggest Downward Revisions (30d)</p>
          </div>
          <div className="space-y-1.5">
            {revisionDown.map((t) => (
              <div key={t.ticker} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-semibold text-foreground w-12 flex-shrink-0">{t.ticker}</span>
                  <span className="text-xs text-muted-foreground truncate">{t.sector}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t.analystCount} analysts</span>
                  {t.whisperVsConsensus < -0.5 && (
                    <span className="text-[11px] px-1 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      whisper {t.whisperVsConsensus.toFixed(1)}%
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-red-400">{t.revisionPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Whisper number explainer */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
        <div className="flex items-start gap-2">
          <div>
            <p className="text-xs font-semibold text-amber-400">Whisper Number vs. Consensus</p>
            <p className="text-xs text-muted-foreground mt-1">
              The <span className="text-amber-300 font-medium">whisper number</span> is the unofficial EPS expectation circulating among buy-side traders — often above consensus.
              When whisper exceeds consensus by &gt;3%, the stock is more likely to disappoint even on a technical beat. Watch for negative surprises in high-revision names.
            </p>
          </div>
        </div>
      </div>

      {/* Revision breadth by sector */}
      <div className="rounded-lg border border-border/20 bg-card/60 p-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Revision Breadth by Sector (% analysts raising)</p>
        <div className="overflow-x-auto">
          <RevisionBreadthChart data={revisionBreadth} />
        </div>
        <div className="flex gap-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-emerald-500/75" /> Raising estimates</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-500/45" /> Lowering estimates</div>
        </div>
      </div>
    </div>
  );
}

// ── Section 5: Options Positioning ─────────────────────────────────────────

function OptionsPositioningSection({ data }: { data: OptionsPositioning[] }) {
  return (
    <div className="space-y-4">
      {/* Implied vs Historical Move */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/20 bg-card/60 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold">Implied vs Historical Move</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Top bar = implied ±move (options pricing), bottom bar = historical avg realized move. Purple = realized exceeded implied.
          </p>
          <ImpliedVsHistoricalChart data={data} />
          <div className="flex gap-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1"><div className="w-2.5 h-1.5 rounded-sm bg-amber-400/70" />Implied</div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-1.5 rounded-sm bg-indigo-500/70" />Historical</div>
          </div>
        </div>

        {/* IV Crush */}
        <div className="rounded-lg border border-border/20 bg-card/60 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold">Post-Earnings IV Crush</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Amber = pre-earnings IV, gray = post-earnings IV. Shorter bar = IV crush.
          </p>
          <div className="space-y-2.5">
            {data.map((d) => (
              <IVCrushBar key={d.ticker} pre={d.ivPreEarnings} post={d.ivPostEarnings} ticker={d.ticker} />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground italic">Avg IV crush: {Math.round(data.reduce((s, d) => s + d.ivCrush, 0) / data.length)}% decline post-earnings</p>
        </div>
      </div>

      {/* Per-ticker details */}
      <div className="rounded-lg border border-border/20 bg-card/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="bg-card/60">
              <tr className="text-muted-foreground border-b border-border/20">
                <th className="text-left px-3 py-2 font-medium">Ticker</th>
                <th className="text-center px-2 py-2 font-medium">Impl ±Move</th>
                <th className="text-center px-2 py-2 font-medium">Hist ±Move</th>
                <th className="text-center px-2 py-2 font-medium">Exceed Rate</th>
                <th className="text-center px-2 py-2 font-medium">P/C Skew</th>
                <th className="text-center px-2 py-2 font-medium">IV Pre→Post</th>
                <th className="text-center px-2 py-2 font-medium">IV Crush</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const skewLabel = row.callSkew > 60 ? "Call Heavy" : row.callSkew < 40 ? "Put Heavy" : "Neutral";
                const skewColor = row.callSkew > 60 ? "text-emerald-400" : row.callSkew < 40 ? "text-red-400" : "text-muted-foreground";
                const exceeded = row.historicalMove > row.impliedMove;
                return (
                  <tr key={row.ticker} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-1.5 font-semibold text-foreground">{row.ticker}</td>
                    <td className="px-2 py-1.5 text-center text-amber-400 font-semibold">±{row.impliedMove}%</td>
                    <td className={cn("px-2 py-1.5 text-center font-semibold", exceeded ? "text-indigo-400" : "text-muted-foreground")}>
                      ±{row.historicalMove}%
                    </td>
                    <td className={cn("px-2 py-1.5 text-center", row.exceedRate > 55 ? "text-red-400" : "text-muted-foreground")}>
                      {row.exceedRate}%
                    </td>
                    <td className={cn("px-2 py-1.5 text-center text-xs font-medium", skewColor)}>
                      {skewLabel}
                    </td>
                    <td className="px-2 py-1.5 text-center text-muted-foreground">
                      <span className="text-amber-400">{row.ivPreEarnings}%</span>
                      <span className="text-muted-foreground mx-1">→</span>
                      <span className="text-muted-foreground">{row.ivPostEarnings}%</span>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <span className={cn("font-semibold", row.ivCrush > 45 ? "text-emerald-400" : "text-amber-400")}>
                        -{row.ivCrush}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Straddle explainer */}
      <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-indigo-300">Implied Move Calculator</p>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="text-indigo-300 font-medium">Implied move = Straddle price ÷ Stock price.</span>{" "}
          Buy the ATM call + ATM put expiring right after earnings. If the straddle costs $8 on a $100 stock, the implied move is ±8%.
          Profitable if the stock moves more than ±8% in either direction. IV crush destroys time value after results.
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { label: "Average implied move (8 tickers)", value: `±${(data.reduce((s, d) => s + d.impliedMove, 0) / data.length).toFixed(1)}%`, color: "text-amber-400" },
            { label: "Avg realized move", value: `±${(data.reduce((s, d) => s + d.historicalMove, 0) / data.length).toFixed(1)}%`, color: "text-indigo-400" },
            { label: "Avg IV crush", value: `-${Math.round(data.reduce((s, d) => s + d.ivCrush, 0) / data.length)}%`, color: "text-emerald-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card/40 rounded p-2 text-center">
              <p className={cn("text-base font-semibold", stat.color)}>{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Put/Call skew explainer */}
      <div className="rounded-lg border border-border/20 bg-card/60 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold">Put/Call Skew Interpretation</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { range: "Put Heavy (<40)", desc: "Protective puts dominate — market pricing in downside risk. Often seen before uncertain prints or in macro headwinds.", color: "text-red-400", bg: "bg-red-500/5 border-red-500/20" },
            { range: "Neutral (40–60)", desc: "Balanced positioning. No strong directional bias from the options market. Two-sided earnings risk.", color: "text-muted-foreground", bg: "bg-muted-foreground/5 border-muted-foreground/20" },
            { range: "Call Heavy (>60)", desc: "Upside calls dominate — bullish positioning or buywrite programs. Stock may face 'buy the rumor, sell the news' after results.", color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/20" },
          ].map((item) => (
            <div key={item.range} className={cn("rounded p-2 border text-xs space-y-1", item.bg)}>
              <p className={cn("font-semibold text-[11px]", item.color)}>{item.range}</p>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function EarningsSeasonDashboard() {
  const data = useMemo(() => generateData(), []);

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Earnings Season Dashboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Q1 2025 · Simulated estimates and reporting analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Season Active
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            Q1 2025
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            67% reported
          </span>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="tracker">
        <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto">
          {[
            { value: "tracker", label: "S&P 500 Tracker" },
            { value: "sectors", label: "Sector Scorecard" },
            { value: "feed", label: "Earnings Feed" },
            { value: "revisions", label: "Revision Momentum" },
            { value: "options", label: "Options Positioning" },
          ].map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="tracker" className="mt-4 data-[state=inactive]:hidden">
          <SP500Tracker quarters={data.quarters} currentQ={data.currentQ} />
        </TabsContent>

        <TabsContent value="sectors" className="mt-4 data-[state=inactive]:hidden">
          <SectorScoreCardSection sectors={data.sectors} />
        </TabsContent>

        <TabsContent value="feed" className="mt-4 data-[state=inactive]:hidden">
          <EarningsFeedSection upcoming={data.upcoming} reported={data.reported} />
        </TabsContent>

        <TabsContent value="revisions" className="mt-4 data-[state=inactive]:hidden">
          <RevisionMomentumSection
            revisionUp={data.revisionUp}
            revisionDown={data.revisionDown}
            revisionBreadth={data.revisionBreadth}
          />
        </TabsContent>

        <TabsContent value="options" className="mt-4 data-[state=inactive]:hidden">
          <OptionsPositioningSection data={data.optionsTickers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
