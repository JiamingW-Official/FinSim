"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  Layers,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── mulberry32 seeded PRNG (seed=3691) ────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface EarningsQualityCompany {
  ticker: string;
  company: string;
  sector: string;
  // Quality dimensions 0-100
  revenueQuality: number;
  marginQuality: number;
  cashQuality: number;
  guidanceQuality: number;
  overallScore: number;
  redFlags: string[];
  positives: string[];
  accrualRatio: number; // negative is better
  arGrowthVsRevenue: number; // AR growth minus revenue growth
  gmTrend: number; // gross margin 4-quarter trend in bps
  fcfVsNI: number; // FCF as % of Net Income (>100% good)
  beatRate: number; // historical EPS beat rate %
  guidanceWidth: number; // EPS guide range as % of midpoint
  credibilityScore: number; // mgmt credibility 0-100
}

interface PEADDataPoint {
  day: number;
  beatReturn: number;
  missReturn: number;
  meetReturn: number;
}

interface EstimateRevisionRow {
  ticker: string;
  company: string;
  currentEst: number;
  est4w: number;
  est8w: number;
  est12w: number;
  upgrades: number;
  downgrades: number;
  momentumScore: number; // -100 to +100
  dispersion: number; // analyst std dev / mean
}

interface SectorEarningsRow {
  sector: string;
  earningsGrowthTTM: number;
  nextQtrConsensus: number;
  beatRate: number;
  upwardRevisionRatio: number;
  pctReported: number;
  blendedGrowth: number;
  revisionBreadth: number; // (upgrades - downgrades) / total %
}

interface EarningsOptionsRow {
  ticker: string;
  company: string;
  daysToEarnings: number;
  impliedMove: number;
  historicalAvgMove: number;
  ivRank: number;
  strategy: string;
  strategyType: "sell" | "buy" | "neutral";
  expectedValue: number; // $ per contract
  ivRich: boolean;
}

// ── Data Generation ────────────────────────────────────────────────────────────

const TICKERS_DD = [
  { ticker: "AAPL", company: "Apple Inc.", sector: "Technology", price: 227.5 },
  { ticker: "MSFT", company: "Microsoft Corp.", sector: "Technology", price: 418.3 },
  { ticker: "GOOGL", company: "Alphabet Inc.", sector: "Communication", price: 176.2 },
  { ticker: "AMZN", company: "Amazon.com Inc.", sector: "Consumer Disc.", price: 203.4 },
  { ticker: "NVDA", company: "NVIDIA Corp.", sector: "Technology", price: 875.6 },
  { ticker: "META", company: "Meta Platforms Inc.", sector: "Communication", price: 564.1 },
  { ticker: "TSLA", company: "Tesla Inc.", sector: "Consumer Disc.", price: 248.9 },
  { ticker: "JPM", company: "JPMorgan Chase", sector: "Financials", price: 198.7 },
  { ticker: "JNJ", company: "Johnson & Johnson", sector: "Healthcare", price: 147.3 },
  { ticker: "XOM", company: "Exxon Mobil Corp.", sector: "Energy", price: 112.8 },
];

const SECTORS = [
  "Technology",
  "Communication",
  "Consumer Disc.",
  "Financials",
  "Healthcare",
  "Energy",
  "Industrials",
  "Materials",
];

function generateQualityData(): EarningsQualityCompany[] {
  const rng = mulberry32(3691);

  return TICKERS_DD.map(({ ticker, company, sector }) => {
    const revenueQuality = Math.round(rng() * 40 + 50);
    const marginQuality = Math.round(rng() * 40 + 45);
    const cashQuality = Math.round(rng() * 45 + 40);
    const guidanceQuality = Math.round(rng() * 40 + 50);
    const overallScore = Math.round((revenueQuality + marginQuality + cashQuality + guidanceQuality) / 4);

    const accrualRatio = Math.round((rng() * 0.16 - 0.05) * 100) / 100;
    const arGrowthVsRevenue = Math.round((rng() * 20 - 5) * 10) / 10;
    const gmTrend = Math.round((rng() * 300 - 150));
    const fcfVsNI = Math.round(rng() * 60 + 70);
    const beatRate = Math.round(rng() * 35 + 55);
    const guidanceWidth = Math.round((rng() * 8 + 2) * 10) / 10;
    const credibilityScore = Math.round(rng() * 40 + 50);

    const redFlags: string[] = [];
    const positives: string[] = [];

    if (arGrowthVsRevenue > 10)
      redFlags.push("AR growing faster than revenue");
    if (gmTrend < -50)
      redFlags.push("Gross margin declining trend");
    if (fcfVsNI < 80)
      redFlags.push("FCF consistently below net income");
    if (accrualRatio > 0.05)
      redFlags.push("High accruals — potential earnings manipulation");
    if (guidanceWidth > 8)
      redFlags.push("Wide guidance range — low management visibility");

    if (fcfVsNI >= 110)
      positives.push("FCF exceeds reported earnings — high quality");
    if (beatRate >= 75)
      positives.push("Strong beat history (75%+ beat rate)");
    if (gmTrend > 50)
      positives.push("Expanding gross margins — positive operating leverage");
    if (credibilityScore >= 80)
      positives.push("High management credibility score");
    if (accrualRatio < 0)
      positives.push("Negative accruals — conservative accounting");

    return {
      ticker,
      company,
      sector,
      revenueQuality,
      marginQuality,
      cashQuality,
      guidanceQuality,
      overallScore,
      redFlags,
      positives,
      accrualRatio,
      arGrowthVsRevenue,
      gmTrend,
      fcfVsNI,
      beatRate,
      guidanceWidth,
      credibilityScore,
    };
  });
}

function generatePEADData(): PEADDataPoint[] {
  const rng = mulberry32(3691 + 1);
  const points: PEADDataPoint[] = [];

  let beatCum = 0;
  let missCum = 0;
  let meetCum = 0;

  for (let day = 0; day <= 60; day++) {
    if (day === 0) {
      beatCum = 3.2; // initial gap
      missCum = -4.1;
      meetCum = 0.2;
    } else if (day <= 30) {
      // Drift phase
      beatCum += rng() * 0.25 - 0.05;
      missCum += -(rng() * 0.22 - 0.02);
      meetCum += rng() * 0.08 - 0.04;
    } else {
      // Fade phase
      beatCum += rng() * 0.12 - 0.07;
      missCum += -(rng() * 0.10 - 0.06);
      meetCum += rng() * 0.06 - 0.04;
    }
    points.push({
      day,
      beatReturn: Math.round(beatCum * 100) / 100,
      missReturn: Math.round(missCum * 100) / 100,
      meetReturn: Math.round(meetCum * 100) / 100,
    });
  }
  return points;
}

function generateEstimateRevisions(): EstimateRevisionRow[] {
  const rng = mulberry32(3691 + 2);

  return TICKERS_DD.map(({ ticker, company }) => {
    const currentEst = Math.round((rng() * 4 + 0.5) * 100) / 100;
    // revisions over time: add noise
    const drift12w = (rng() - 0.4) * 0.6;
    const drift8w = drift12w + (rng() - 0.4) * 0.3;
    const drift4w = drift8w + (rng() - 0.4) * 0.2;

    const est12w = Math.round((currentEst + drift12w) * 100) / 100;
    const est8w = Math.round((currentEst + drift8w) * 100) / 100;
    const est4w = Math.round((currentEst + drift4w) * 100) / 100;

    const analysts = Math.floor(rng() * 20 + 10);
    const upgrades = Math.floor(rng() * analysts * 0.6);
    const downgrades = Math.floor(rng() * (analysts - upgrades) * 0.5);

    const upRatio = analysts > 0 ? upgrades / analysts : 0;
    const momentumScore = Math.round((upRatio - 0.3) * 200);
    const dispersion = Math.round((rng() * 0.3 + 0.05) * 100) / 100;

    return {
      ticker,
      company,
      currentEst,
      est4w,
      est8w,
      est12w,
      upgrades,
      downgrades,
      momentumScore: Math.max(-100, Math.min(100, momentumScore)),
      dispersion,
    };
  });
}

function generateSectorEarnings(): SectorEarningsRow[] {
  const rng = mulberry32(3691 + 3);

  return SECTORS.map((sector) => {
    const earningsGrowthTTM = Math.round((rng() * 30 - 5) * 10) / 10;
    const nextQtrConsensus = Math.round((rng() * 20 - 2) * 10) / 10;
    const beatRate = Math.round(rng() * 25 + 55);
    const upwardRevisionRatio = Math.round((rng() * 0.6 + 0.2) * 100) / 100;
    const pctReported = Math.round(rng() * 60 + 20);
    const blendedGrowth = Math.round((earningsGrowthTTM * 0.7 + nextQtrConsensus * 0.3) * 10) / 10;
    const revisionBreadth = Math.round((upwardRevisionRatio * 2 - 1) * 50);

    return {
      sector,
      earningsGrowthTTM,
      nextQtrConsensus,
      beatRate,
      upwardRevisionRatio,
      pctReported,
      blendedGrowth,
      revisionBreadth,
    };
  });
}

function generateOptionsEarnings(): EarningsOptionsRow[] {
  const rng = mulberry32(3691 + 4);

  return TICKERS_DD.map(({ ticker, company }) => {
    const daysToEarnings = Math.floor(rng() * 30 + 5);
    const impliedMove = Math.round((rng() * 10 + 3) * 10) / 10;
    const historicalAvgMove = Math.round((rng() * 8 + 2) * 10) / 10;
    const ivRank = Math.round(rng() * 100);
    const ivRich = impliedMove > historicalAvgMove;

    let strategy: string;
    let strategyType: "sell" | "buy" | "neutral";
    let evMultiplier: number;

    if (impliedMove > historicalAvgMove * 1.3) {
      strategy = "Iron Condor / Short Straddle";
      strategyType = "sell";
      evMultiplier = 1.2;
    } else if (historicalAvgMove > impliedMove * 1.2) {
      strategy = "Long Straddle / Strangle";
      strategyType = "buy";
      evMultiplier = 0.9;
    } else {
      strategy = "Wait — IV fairly priced";
      strategyType = "neutral";
      evMultiplier = 0.5;
    }

    // Simplified EV: premium * (win_rate - 1)
    const premium = Math.round(impliedMove * 10 * (rng() * 0.5 + 0.8));
    const expectedValue = Math.round((premium * evMultiplier - premium) * (rng() * 0.3 + 0.7));

    return {
      ticker,
      company,
      daysToEarnings,
      impliedMove,
      historicalAvgMove,
      ivRank,
      strategy,
      strategyType,
      expectedValue,
      ivRich,
    };
  });
}

// ── Helper components ─────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : score >= 55
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-red-400 bg-red-500/10 border-red-500/30";
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-bold border", color)}>
      {score}
    </span>
  );
}

function MomentumBadge({ score }: { score: number }) {
  const color =
    score >= 30
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : score <= -30
      ? "text-red-400 bg-red-500/10 border-red-500/30"
      : "text-amber-400 bg-amber-500/10 border-amber-500/30";
  const label = score >= 30 ? "Strong Up" : score <= -30 ? "Strong Down" : "Neutral";
  return (
    <span className={cn("px-1.5 py-0.5 rounded text-xs font-semibold border", color)}>
      {label}
    </span>
  );
}

// ── Radar SVG chart ────────────────────────────────────────────────────────────

function RadarChart({
  values,
  labels,
  size = 100,
}: {
  values: number[]; // 0-100 each
  labels: string[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.72;
  const n = values.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  function polarToXY(i: number, radius: number) {
    const angle = startAngle + i * angleStep;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  // Grid rings at 25, 50, 75, 100
  const rings = [0.25, 0.5, 0.75, 1.0];

  const polygonPoints = values
    .map((v, i) => {
      const pt = polarToXY(i, (v / 100) * r);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {rings.map((ring, ri) => {
        const pts = Array.from({ length: n }, (_, i) => {
          const pt = polarToXY(i, ring * r);
          return `${pt.x},${pt.y}`;
        }).join(" ");
        return (
          <polygon
            key={ri}
            points={pts}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Axes */}
      {Array.from({ length: n }, (_, i) => {
        const pt = polarToXY(i, r);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={pt.x}
            y2={pt.y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="rgba(59,130,246,0.2)"
        stroke="rgb(59,130,246)"
        strokeWidth={1.2}
      />

      {/* Data points */}
      {values.map((v, i) => {
        const pt = polarToXY(i, (v / 100) * r);
        return <circle key={i} cx={pt.x} cy={pt.y} r={1.8} fill="rgb(59,130,246)" />;
      })}

      {/* Labels */}
      {labels.map((label, i) => {
        const pt = polarToXY(i, r * 1.22);
        return (
          <text
            key={i}
            x={pt.x}
            y={pt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={6}
            fill="rgba(255,255,255,0.55)"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Section 1: Earnings Quality Analyzer ─────────────────────────────────────

function EarningsQualitySection() {
  const [selected, setSelected] = useState<string>("AAPL");
  const data = useMemo(() => generateQualityData(), []);

  const company = data.find((d) => d.ticker === selected) ?? data[0];

  const scoreColor = (s: number) =>
    s >= 75 ? "text-emerald-400" : s >= 55 ? "text-amber-400" : "text-red-400";

  const barColor = (s: number) =>
    s >= 75 ? "bg-emerald-500" : s >= 55 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Earnings Quality Analyzer</h2>
        <div className="group relative">
          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          <div className="absolute left-5 top-0 z-10 hidden group-hover:block bg-popover border border-border rounded p-2 text-[11px] text-muted-foreground w-56 shadow-sm">
            Scores rate earnings quality across Revenue, Margin, Cash, and Guidance dimensions. Higher scores indicate more reliable, sustainable earnings.
          </div>
        </div>
      </div>

      {/* Ticker selector */}
      <div className="flex flex-wrap gap-1.5">
        {data.map((d) => (
          <button
            key={d.ticker}
            onClick={() => setSelected(d.ticker)}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-semibold transition-colors border",
              selected === d.ticker
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            {d.ticker}
          </button>
        ))}
      </div>

      {/* Selected company panel */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">{company.company}</div>
            <div className="text-xs text-muted-foreground">{company.sector}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">Overall Score</div>
            <div className={cn("text-2xl font-bold", scoreColor(company.overallScore))}>
              {company.overallScore}
            </div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Radar chart */}
          <div className="flex flex-col items-center justify-center">
            <RadarChart
              values={[
                company.revenueQuality,
                company.marginQuality,
                company.cashQuality,
                company.guidanceQuality,
                company.credibilityScore,
              ]}
              labels={["Rev", "Margin", "Cash", "Guide", "Cred"]}
              size={120}
            />
          </div>

          {/* Quality bars */}
          <div className="space-y-2.5">
            {[
              { label: "Revenue Quality", value: company.revenueQuality },
              { label: "Margin Quality", value: company.marginQuality },
              { label: "Cash Quality", value: company.cashQuality },
              { label: "Guidance Quality", value: company.guidanceQuality },
              { label: "Mgmt Credibility", value: company.credibilityScore },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("font-semibold", scoreColor(value))}>{value}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", barColor(value))}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
          {[
            {
              label: "Accrual Ratio",
              value: company.accrualRatio.toFixed(2),
              good: company.accrualRatio < 0,
              suffix: "",
            },
            {
              label: "AR vs Rev Growth",
              value: `+${company.arGrowthVsRevenue.toFixed(1)}`,
              good: company.arGrowthVsRevenue <= 5,
              suffix: "pp",
            },
            {
              label: "FCF / Net Income",
              value: company.fcfVsNI.toFixed(0),
              good: company.fcfVsNI >= 100,
              suffix: "%",
            },
            {
              label: "Beat Rate",
              value: company.beatRate.toFixed(0),
              good: company.beatRate >= 70,
              suffix: "%",
            },
          ].map(({ label, value, good, suffix }) => (
            <div key={label} className="text-center">
              <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
              <div className={cn("text-sm font-bold font-mono", good ? "text-emerald-400" : "text-red-400")}>
                {value}{suffix}
              </div>
            </div>
          ))}
        </div>

        {/* Red flags + positives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {company.redFlags.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                <span className="text-xs font-semibold text-red-400">Red Flags</span>
              </div>
              <ul className="space-y-1">
                {company.redFlags.map((f) => (
                  <li key={f} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {company.positives.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">Positives</span>
              </div>
              <ul className="space-y-1">
                {company.positives.map((p) => (
                  <li key={p} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-xs font-semibold text-foreground">All Companies — Quality Scores</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-muted-foreground font-medium">Ticker</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Rev</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Margin</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Cash</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Guide</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Overall</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Flags</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr
                  key={d.ticker}
                  className={cn(
                    "border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors",
                    selected === d.ticker && "bg-muted/40"
                  )}
                  onClick={() => setSelected(d.ticker)}
                >
                  <td className="px-3 py-2 font-semibold text-foreground">{d.ticker}</td>
                  <td className="px-3 py-2 text-right">
                    <ScoreBadge score={d.revenueQuality} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <ScoreBadge score={d.marginQuality} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <ScoreBadge score={d.cashQuality} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <ScoreBadge score={d.guidanceQuality} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <ScoreBadge score={d.overallScore} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    {d.redFlags.length > 0 ? (
                      <span className="text-red-400 font-semibold">{d.redFlags.length}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Section 2: PEAD Chart ─────────────────────────────────────────────────────

function PEADSection() {
  const data = useMemo(() => generatePEADData(), []);
  const [expanded, setExpanded] = useState(false);

  const W = 520;
  const H = 200;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const allY = data.flatMap((d) => [d.beatReturn, d.missReturn, d.meetReturn]);
  const minY = Math.min(...allY) - 0.5;
  const maxY = Math.max(...allY) + 0.5;
  const maxDay = 60;

  function xScale(day: number) {
    return padL + (day / maxDay) * chartW;
  }
  function yScale(val: number) {
    return padT + chartH - ((val - minY) / (maxY - minY)) * chartH;
  }

  function makePath(key: "beatReturn" | "missReturn" | "meetReturn") {
    return data
      .map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.day).toFixed(1)},${yScale(d[key]).toFixed(1)}`)
      .join(" ");
  }

  const yZero = yScale(0);
  const yTicks = [-4, -2, 0, 2, 4, 6];
  const xTicks = [0, 10, 20, 30, 40, 50, 60];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Post-Earnings Announcement Drift (PEAD)</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        {[
          { label: "PEAD Win Rate", value: "58%", color: "text-emerald-400", sub: "buy beats day 2" },
          { label: "Sharpe Ratio", value: "0.60", color: "text-primary", sub: "synthetic backtest" },
          { label: "Avg Drift Day", value: "~30", color: "text-amber-400", sub: "days of drift" },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            <div className={cn("text-xl font-bold", color)}>{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-xs text-muted-foreground mb-3">
          Avg. Cumulative Abnormal Return (%) after Earnings Release — 60 Trading Days
        </div>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-full" style={{ minWidth: 320 }}>
            {/* Grid lines */}
            {yTicks.map((t) => {
              const y = yScale(t);
              if (y < padT || y > padT + chartH) return null;
              return (
                <g key={t}>
                  <line x1={padL} y1={y} x2={padL + chartW} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={0.8} />
                  <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize={8} fill="rgba(255,255,255,0.35)">
                    {t > 0 ? `+${t}` : t}%
                  </text>
                </g>
              );
            })}
            {xTicks.map((t) => (
              <g key={t}>
                <line x1={xScale(t)} y1={padT} x2={xScale(t)} y2={padT + chartH} stroke="rgba(255,255,255,0.04)" strokeWidth={0.8} />
                <text x={xScale(t)} y={padT + chartH + 10} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.35)">
                  {t}d
                </text>
              </g>
            ))}

            {/* Zero line */}
            <line x1={padL} y1={yZero} x2={padL + chartW} y2={yZero} stroke="rgba(255,255,255,0.18)" strokeWidth={0.8} strokeDasharray="4,3" />

            {/* Data lines */}
            <path d={makePath("meetReturn")} fill="none" stroke="rgba(100,116,139,0.7)" strokeWidth={1.2} strokeDasharray="3,2" />
            <path d={makePath("missReturn")} fill="none" stroke="rgb(239,68,68)" strokeWidth={1.8} />
            <path d={makePath("beatReturn")} fill="none" stroke="rgb(52,211,153)" strokeWidth={1.8} />

            {/* Strategy annotation arrow at day 2 */}
            <line x1={xScale(2)} y1={padT + 6} x2={xScale(2)} y2={yScale(data[2]?.beatReturn ?? 3.5) - 4} stroke="rgba(52,211,153,0.5)" strokeWidth={0.8} strokeDasharray="2,2" />
            <text x={xScale(2) + 3} y={padT + 14} fontSize={7} fill="rgba(52,211,153,0.8)">Entry</text>

            <line x1={xScale(20)} y1={padT + 6} x2={xScale(20)} y2={yScale(data[20]?.beatReturn ?? 5.5) - 4} stroke="rgba(251,191,36,0.5)" strokeWidth={0.8} strokeDasharray="2,2" />
            <text x={xScale(20) + 3} y={padT + 14} fontSize={7} fill="rgba(251,191,36,0.8)">Exit</text>

            {/* Legend */}
            <g>
              <rect x={padL + chartW - 130} y={padT + 4} width={126} height={42} rx={3} fill="rgba(0,0,0,0.35)" />
              <line x1={padL + chartW - 124} y1={padT + 14} x2={padL + chartW - 110} y2={padT + 14} stroke="rgb(52,211,153)" strokeWidth={1.5} />
              <text x={padL + chartW - 107} y={padT + 14} dominantBaseline="middle" fontSize={8} fill="rgba(255,255,255,0.7)">Earnings Beat</text>
              <line x1={padL + chartW - 124} y1={padT + 26} x2={padL + chartW - 110} y2={padT + 26} stroke="rgb(239,68,68)" strokeWidth={1.5} />
              <text x={padL + chartW - 107} y={padT + 26} dominantBaseline="middle" fontSize={8} fill="rgba(255,255,255,0.7)">Earnings Miss</text>
              <line x1={padL + chartW - 124} y1={padT + 38} x2={padL + chartW - 110} y2={padT + 38} stroke="rgba(100,116,139,0.7)" strokeWidth={1.2} strokeDasharray="3,2" />
              <text x={padL + chartW - 107} y={padT + 38} dominantBaseline="middle" fontSize={8} fill="rgba(255,255,255,0.7)">In-Line / Meet</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Explanation */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? "Hide explanation" : "Why does PEAD persist?"}
      </button>

      {expanded && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3 text-xs text-muted-foreground leading-relaxed">
          <div>
            <span className="font-semibold text-foreground">Under-reaction hypothesis:</span> Investors and analysts initially under-react to earnings surprises, causing prices to continue drifting toward fair value over 30–60 days.
          </div>
          <div>
            <span className="font-semibold text-foreground">Analyst slow-to-update:</span> Sell-side analysts revise models gradually. Each upward revision from "beat" quarters attracts incremental buying pressure.
          </div>
          <div>
            <span className="font-semibold text-foreground">Institutional constraints:</span> Large funds must build positions slowly to avoid market impact, creating sustained buying pressure after confirmed beats.
          </div>
          <div>
            <span className="font-semibold text-foreground">Strategy — PEAD Long:</span> Buy on Day 2 after confirmed EPS beat with positive guidance. Hold 20 trading days, exit regardless. Avoid momentum crowding in mega-caps.
          </div>
          <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded p-2 mt-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>PEAD has been partially arbitraged away in liquid large-caps. Works best in small/mid-caps. Transaction costs matter significantly. Past drift patterns are not predictive of future returns.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section 3: Estimate Revisions ─────────────────────────────────────────────

function EstimateRevisionsSection() {
  const data = useMemo(() => generateEstimateRevisions(), []);
  const [selected, setSelected] = useState<string>("AAPL");

  const company = data.find((d) => d.ticker === selected) ?? data[0];

  const W = 400;
  const H = 120;
  const padL = 48;
  const padR = 16;
  const padT = 12;
  const padB = 24;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const timePoints = [
    { label: "12w ago", value: company.est12w },
    { label: "8w ago", value: company.est8w },
    { label: "4w ago", value: company.est4w },
    { label: "Now", value: company.currentEst },
  ];

  const allVals = timePoints.map((p) => p.value);
  const minV = Math.min(...allVals) * 0.97;
  const maxV = Math.max(...allVals) * 1.03;

  function xS(i: number) {
    return padL + (i / (timePoints.length - 1)) * chartW;
  }
  function yS(v: number) {
    return padT + chartH - ((v - minV) / (maxV - minV)) * chartH;
  }

  const pathD = timePoints.map((p, i) => `${i === 0 ? "M" : "L"}${xS(i).toFixed(1)},${yS(p.value).toFixed(1)}`).join(" ");
  const isUpward = company.currentEst >= company.est12w;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Earnings Estimate Revisions</h2>
      </div>

      {/* Ticker selector */}
      <div className="flex flex-wrap gap-1.5">
        {data.map((d) => (
          <button
            key={d.ticker}
            onClick={() => setSelected(d.ticker)}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-semibold transition-colors border",
              selected === d.ticker
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            {d.ticker}
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">{company.company}</div>
            <div className="flex items-center gap-2 mt-1">
              <MomentumBadge score={company.momentumScore} />
              <span className="text-[11px] text-muted-foreground">
                {company.upgrades} upgrades / {company.downgrades} downgrades
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Current Est.</div>
            <div className="text-lg font-bold font-mono text-foreground">${company.currentEst.toFixed(2)}</div>
            <div className={cn("text-xs font-semibold", isUpward ? "text-emerald-400" : "text-red-400")}>
              {isUpward ? "+" : ""}{((company.currentEst - company.est12w) / company.est12w * 100).toFixed(1)}% vs 12w ago
            </div>
          </div>
        </div>

        {/* Revision timeline chart */}
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-full" style={{ minWidth: 280 }}>
            <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="rgba(255,255,255,0.1)" strokeWidth={0.8} />
            <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} stroke="rgba(255,255,255,0.1)" strokeWidth={0.8} />

            {/* Gradient area */}
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isUpward ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"} />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </linearGradient>
            </defs>
            <path
              d={`${pathD} L${xS(timePoints.length - 1)},${padT + chartH} L${xS(0)},${padT + chartH} Z`}
              fill="url(#revGrad)"
            />

            {/* Line */}
            <path d={pathD} fill="none" stroke={isUpward ? "rgb(52,211,153)" : "rgb(239,68,68)"} strokeWidth={2} />

            {/* Points + labels */}
            {timePoints.map((p, i) => (
              <g key={i}>
                <circle cx={xS(i)} cy={yS(p.value)} r={3} fill={isUpward ? "rgb(52,211,153)" : "rgb(239,68,68)"} />
                <text x={xS(i)} y={padT + chartH + 12} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.4)">
                  {p.label}
                </text>
                <text x={xS(i)} y={yS(p.value) - 6} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.7)">
                  ${p.value.toFixed(2)}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Analyst dispersion */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Analyst dispersion:</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-24">
            <div
              className={cn("h-full rounded-full", company.dispersion > 0.2 ? "bg-red-500" : company.dispersion > 0.1 ? "bg-amber-500" : "bg-emerald-500")}
              style={{ width: `${Math.min(company.dispersion * 400, 100)}%` }}
            />
          </div>
          <span className={cn("font-mono font-semibold", company.dispersion > 0.2 ? "text-red-400" : company.dispersion > 0.1 ? "text-amber-400" : "text-emerald-400")}>
            {(company.dispersion * 100).toFixed(0)}%
          </span>
          <span className="text-muted-foreground text-xs">
            {company.dispersion > 0.2 ? "High uncertainty" : company.dispersion > 0.1 ? "Moderate" : "Low disagreement"}
          </span>
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-xs font-semibold text-foreground">Revision Momentum — All Tickers</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-muted-foreground font-medium">Ticker</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Est.</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">12w Δ</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Up/Down</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Momentum</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Dispersion</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => {
                const chg = ((d.currentEst - d.est12w) / d.est12w) * 100;
                const up = d.currentEst >= d.est12w;
                return (
                  <tr
                    key={d.ticker}
                    className={cn(
                      "border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors",
                      selected === d.ticker && "bg-muted/40"
                    )}
                    onClick={() => setSelected(d.ticker)}
                  >
                    <td className="px-3 py-2 font-semibold text-foreground">{d.ticker}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">${d.currentEst.toFixed(2)}</td>
                    <td className={cn("px-3 py-2 text-right font-mono font-semibold", up ? "text-emerald-400" : "text-red-400")}>
                      {up ? "+" : ""}{chg.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      <span className="text-emerald-400">{d.upgrades}</span>
                      <span className="mx-1">/</span>
                      <span className="text-red-400">{d.downgrades}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <MomentumBadge score={d.momentumScore} />
                    </td>
                    <td className={cn("px-3 py-2 text-right font-mono", d.dispersion > 0.2 ? "text-red-400" : d.dispersion > 0.1 ? "text-amber-400" : "text-emerald-400")}>
                      {(d.dispersion * 100).toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-muted/20 border border-border/50 rounded-lg p-3 text-[11px] text-muted-foreground space-y-1.5">
        <div className="font-semibold text-foreground text-xs mb-1">Revision Strategies</div>
        <div><span className="text-emerald-400 font-medium">Accelerating upgrades:</span> Look for stocks where both 4-week and 8-week momentum are positive. Often leads the price by 2–4 weeks.</div>
        <div><span className="text-red-400 font-medium">Negative revisions:</span> Downward estimate revisions frequently precede earnings misses. Consider reducing exposure early.</div>
        <div><span className="text-amber-400 font-medium">High dispersion:</span> Wide analyst disagreement = binary outcomes. Options are often under-priced relative to actual move risk.</div>
      </div>
    </div>
  );
}

// ── Section 4: Sector Earnings Dashboard ─────────────────────────────────────

function SectorEarningsSection() {
  const data = useMemo(() => generateSectorEarnings(), []);

  const W = 520;
  const H = 180;
  const padL = 100;
  const padR = 40;
  const padT = 12;
  const padB = 16;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxGrowth = Math.max(...data.map((d) => Math.abs(d.earningsGrowthTTM))) * 1.15;

  const barHeight = (chartH / data.length) * 0.65;
  const barGap = chartH / data.length;

  function xScale(val: number) {
    return (val / maxGrowth) * (chartW / 2);
  }
  const zeroX = padL + chartW / 2;

  const totalReported = Math.round(data.reduce((a, b) => a + b.pctReported, 0) / data.length);
  const blendedAvg = Math.round((data.reduce((a, b) => a + b.blendedGrowth, 0) / data.length) * 10) / 10;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Sector Earnings Dashboard</h2>
      </div>

      {/* Season tracker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {[
          { label: "Avg Reported", value: `${totalReported}%`, color: "text-primary", sub: "of S&P 500" },
          { label: "Blended Growth", value: `${blendedAvg > 0 ? "+" : ""}${blendedAvg}%`, color: blendedAvg > 0 ? "text-emerald-400" : "text-red-400", sub: "TTM EPS" },
          { label: "Avg Beat Rate", value: `${Math.round(data.reduce((a, b) => a + b.beatRate, 0) / data.length)}%`, color: "text-amber-400", sub: "across sectors" },
          { label: "Revision Breadth", value: `${Math.round(data.reduce((a, b) => a + b.revisionBreadth, 0) / data.length) > 0 ? "+" : ""}${Math.round(data.reduce((a, b) => a + b.revisionBreadth, 0) / data.length)}`, color: "text-primary", sub: "upgrades vs downgrades" },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            <div className={cn("text-xl font-bold", color)}>{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Horizontal bar chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-xs text-muted-foreground mb-3">Sector Earnings Growth TTM (%)</div>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-full" style={{ minWidth: 320 }}>
            {/* Zero line */}
            <line x1={zeroX} y1={padT} x2={zeroX} y2={padT + chartH} stroke="rgba(255,255,255,0.2)" strokeWidth={0.8} />

            {data.map((sector, i) => {
              const y = padT + i * barGap + (barGap - barHeight) / 2;
              const growth = sector.earningsGrowthTTM;
              const barW = Math.abs(xScale(growth));
              const barX = growth >= 0 ? zeroX : zeroX - barW;
              const barColor = growth >= 0 ? "rgb(52,211,153)" : "rgb(239,68,68)";

              return (
                <g key={sector.sector}>
                  {/* Sector label */}
                  <text
                    x={padL - 6}
                    y={y + barHeight / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={8.5}
                    fill="rgba(255,255,255,0.6)"
                  >
                    {sector.sector}
                  </text>

                  {/* Bar */}
                  <rect
                    x={barX}
                    y={y}
                    width={Math.max(barW, 1)}
                    height={barHeight}
                    fill={barColor}
                    fillOpacity={0.75}
                    rx={1.5}
                  />

                  {/* Value label */}
                  <text
                    x={growth >= 0 ? barX + barW + 4 : barX - 4}
                    y={y + barHeight / 2}
                    textAnchor={growth >= 0 ? "start" : "end"}
                    dominantBaseline="middle"
                    fontSize={8}
                    fill={barColor}
                    fontWeight="600"
                  >
                    {growth > 0 ? "+" : ""}{growth.toFixed(1)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-xs font-semibold text-foreground">Sector Detail</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-muted-foreground font-medium">Sector</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">TTM Growth</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Next Qtr Est</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Beat Rate</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Up Rev Ratio</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">% Reported</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Breadth</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.sector} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 font-medium text-foreground">{d.sector}</td>
                  <td className={cn("px-3 py-2 text-right font-mono font-semibold", d.earningsGrowthTTM >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {d.earningsGrowthTTM > 0 ? "+" : ""}{d.earningsGrowthTTM.toFixed(1)}%
                  </td>
                  <td className={cn("px-3 py-2 text-right font-mono", d.nextQtrConsensus >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {d.nextQtrConsensus > 0 ? "+" : ""}{d.nextQtrConsensus.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={cn("font-semibold", d.beatRate >= 70 ? "text-emerald-400" : d.beatRate >= 55 ? "text-amber-400" : "text-red-400")}>
                      {d.beatRate}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">
                    {(d.upwardRevisionRatio * 100).toFixed(0)}%
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${d.pctReported}%` }} />
                      </div>
                      <span className="font-mono text-muted-foreground">{d.pctReported}%</span>
                    </div>
                  </td>
                  <td className={cn("px-3 py-2 text-right font-mono font-semibold", d.revisionBreadth >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {d.revisionBreadth > 0 ? "+" : ""}{d.revisionBreadth}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Section 5: Options Plays for Earnings ─────────────────────────────────────

function EarningsOptionsSection() {
  const data = useMemo(() => generateOptionsEarnings(), []);
  const [selected, setSelected] = useState<string | null>(null);

  const company = selected ? data.find((d) => d.ticker === selected) : null;

  const strategyColor = (type: "sell" | "buy" | "neutral") =>
    type === "sell"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : type === "buy"
      ? "text-primary bg-primary/10 border-border"
      : "text-muted-foreground bg-muted/20 border-border";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Options Plays for Earnings</h2>
      </div>

      {/* Implied move explainer */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="text-xs font-semibold text-foreground mb-1">Implied Move Calculator</div>
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          The <span className="text-foreground font-medium">implied move</span> is estimated as: <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">Straddle Price / Stock Price</span>. If the ATM straddle costs $10 on a $200 stock, the implied move is ±5%. Compare this to the historical average move to determine if IV is rich or cheap.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded p-2.5">
            <div className="text-xs font-semibold text-amber-400 mb-1">IV Rich (Sell Strategies)</div>
            <div className="text-[11px] text-muted-foreground">Implied move &gt; historical. IV will likely crush after earnings. Sell straddle or iron condor to collect premium.</div>
          </div>
          <div className="bg-primary/5 border border-border rounded p-2.5">
            <div className="text-xs font-semibold text-primary mb-1">IV Cheap (Buy Strategies)</div>
            <div className="text-[11px] text-muted-foreground">Implied move &lt; historical. Market under-pricing volatility. Buy straddle or strangle to benefit from larger-than-expected move.</div>
          </div>
        </div>
      </div>

      {/* Options table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Upcoming Earnings — Options Analysis</span>
          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear selection
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-muted-foreground font-medium">Ticker</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Days to Earn.</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Impl. Move</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Hist. Avg</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">IV/Hist Ratio</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">IV Rank</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Strategy</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Exp. Val.</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => {
                const ratio = (d.impliedMove / d.historicalAvgMove);
                const ratioColor = ratio > 1.2 ? "text-amber-400" : ratio < 0.85 ? "text-primary" : "text-muted-foreground";
                return (
                  <tr
                    key={d.ticker}
                    className={cn(
                      "border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors",
                      selected === d.ticker && "bg-muted/40"
                    )}
                    onClick={() => setSelected(selected === d.ticker ? null : d.ticker)}
                  >
                    <td className="px-3 py-2 font-semibold text-foreground">{d.ticker}</td>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground">{d.daysToEarnings}d</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-foreground">±{d.impliedMove}%</td>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground">±{d.historicalAvgMove}%</td>
                    <td className={cn("px-3 py-2 text-right font-mono font-semibold", ratioColor)}>
                      {ratio.toFixed(2)}x
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", d.ivRank >= 70 ? "bg-red-500" : d.ivRank >= 40 ? "bg-amber-500" : "bg-emerald-500")}
                            style={{ width: `${d.ivRank}%` }}
                          />
                        </div>
                        <span className="font-mono text-muted-foreground">{d.ivRank}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={cn("px-1.5 py-0.5 rounded border text-xs font-semibold", strategyColor(d.strategyType))}>
                        {d.strategyType === "sell" ? "Sell Vol" : d.strategyType === "buy" ? "Buy Vol" : "Neutral"}
                      </span>
                    </td>
                    <td className={cn("px-3 py-2 text-right font-mono font-semibold", d.expectedValue > 0 ? "text-emerald-400" : "text-red-400")}>
                      {d.expectedValue > 0 ? "+" : ""}${d.expectedValue}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {company && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="text-sm font-semibold text-foreground">{company.ticker} — {company.company}</div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: "Implied Move", value: `±${company.impliedMove}%`, color: "text-foreground" },
              { label: "Historical Avg", value: `±${company.historicalAvgMove}%`, color: "text-muted-foreground" },
              { label: "IV/Hist Ratio", value: `${(company.impliedMove / company.historicalAvgMove).toFixed(2)}x`, color: company.ivRich ? "text-amber-400" : "text-primary" },
              { label: "IV Rank", value: `${company.ivRank}`, color: company.ivRank >= 70 ? "text-red-400" : company.ivRank >= 40 ? "text-amber-400" : "text-emerald-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-muted/30 rounded-lg p-2">
                <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                <div className={cn("text-base font-bold font-mono", color)}>{value}</div>
              </div>
            ))}
          </div>

          <div className={cn("border rounded-lg p-3", company.ivRich ? "bg-amber-500/5 border-amber-500/20" : "bg-primary/5 border-border")}>
            <div className={cn("text-xs font-semibold mb-1.5", company.ivRich ? "text-amber-400" : "text-primary")}>
              {company.ivRich ? "IV Rich — Volatility Selling Setup" : "IV Cheap — Volatility Buying Setup"}
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed mb-2">
              {company.ivRich
                ? `IV is ${((company.impliedMove / company.historicalAvgMove - 1) * 100).toFixed(0)}% above historical average. The market is pricing in a larger-than-typical move. Selling strategies like iron condors or short straddles benefit if the stock stays within the implied range.`
                : `IV is ${((1 - company.impliedMove / company.historicalAvgMove) * 100).toFixed(0)}% below historical average. The market is under-pricing expected volatility. Buying straddles or strangles could profit if the move exceeds the implied range.`}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground">Recommended:</span>
              <span className={cn("px-2 py-0.5 rounded border text-xs font-semibold", strategyColor(company.strategyType))}>
                {company.strategy}
              </span>
              <span className="text-xs text-muted-foreground ml-2">Exp. Value:</span>
              <span className={cn("text-xs font-bold font-mono", company.expectedValue > 0 ? "text-emerald-400" : "text-red-400")}>
                {company.expectedValue > 0 ? "+" : ""}${company.expectedValue} / contract
              </span>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded p-2.5">
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-muted-foreground leading-relaxed">
                Expected value estimates are based on simplified models and synthetic historical data. Real options trading requires accurate volatility modeling, precise strike selection, liquidity assessment, and risk management. Never trade options around earnings without fully understanding the risks.
              </div>
            </div>
          </div>
        </div>
      )}

      {!selected && (
        <div className="text-center text-[11px] text-muted-foreground py-2">
          Click a row above to see detailed options analysis
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function EarningsDeepDive() {
  return (
    <div className="space-y-10">
      {/* Section 1 */}
      <EarningsQualitySection />

      <div className="border-t border-border" />

      {/* Section 2 */}
      <PEADSection />

      <div className="border-t border-border" />

      {/* Section 3 */}
      <EstimateRevisionsSection />

      <div className="border-t border-border" />

      {/* Section 4 */}
      <SectorEarningsSection />

      <div className="border-t border-border" />

      {/* Section 5 */}
      <EarningsOptionsSection />

      {/* Footer disclaimer */}
      <div className="bg-muted/20 border border-border/50 rounded-lg p-4 text-[11px] text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">Educational Disclaimer: </span>
        All data on this page is synthetically generated using seeded random number generation for educational purposes only. Earnings quality scores, PEAD drift projections, estimate revisions, and options expected value calculations do not represent real securities or trading recommendations. Past earnings patterns do not predict future results.
      </div>
    </div>
  );
}
