"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Activity,
  DollarSign,
  Percent,
  ChevronRight,
  Info,
  Zap,
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

// ── Seeded PRNG ─────────────────────────────────────────────────────────────
let s = 760;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface SpreadPoint {
  t: number;
  value: number;
}

interface ReferenceEntity {
  name: string;
  ticker: string;
  rating: string;
  industry: string;
  spread: number; // current spread in bps
  tenor: string;
  notional: number;
  color: string;
  series: SpreadPoint[];
}

interface CDSContract {
  entity: string;
  ticker: string;
  tenor: string;
  spread: number;
  rating: string;
  industry: string;
  change: number;
  annualPremium: number;
}

interface CDXIndex {
  name: string;
  series: number;
  spread: number;
  change: number;
  constituents: number;
  rating: string;
}

// ── Data Generation ───────────────────────────────────────────────────────────
function generateSpreadSeries(
  baseBps: number,
  volatility: number,
  n: number
): SpreadPoint[] {
  const points: SpreadPoint[] = [];
  let current = baseBps;
  for (let i = 0; i < n; i++) {
    const shock = (rand() - 0.5) * volatility;
    const meanReversion = (baseBps - current) * 0.05;
    current = Math.max(10, current + shock + meanReversion);
    points.push({ t: i, value: Math.round(current * 10) / 10 });
  }
  return points;
}

const ENTITIES: ReferenceEntity[] = (() => {
  // Reset deterministic seed portion for entities
  return [
    {
      name: "Apple Inc.",
      ticker: "AAPL",
      rating: "AA+",
      industry: "Technology",
      spread: 32,
      tenor: "5Y",
      notional: 10_000_000,
      color: "#3b82f6",
      series: generateSpreadSeries(32, 8, 200),
    },
    {
      name: "Ford Motor Co.",
      ticker: "F",
      rating: "BB+",
      industry: "Automotive",
      spread: 245,
      tenor: "5Y",
      notional: 5_000_000,
      color: "#f59e0b",
      series: generateSpreadSeries(245, 35, 200),
    },
    {
      name: "JPMorgan Chase",
      ticker: "JPM",
      rating: "A+",
      industry: "Banking",
      spread: 58,
      tenor: "5Y",
      notional: 20_000_000,
      color: "#10b981",
      series: generateSpreadSeries(58, 12, 200),
    },
    {
      name: "Carnival Corp.",
      ticker: "CCL",
      rating: "BB-",
      industry: "Leisure",
      spread: 380,
      tenor: "5Y",
      notional: 3_000_000,
      color: "#ef4444",
      series: generateSpreadSeries(380, 55, 200),
    },
    {
      name: "Microsoft Corp.",
      ticker: "MSFT",
      rating: "AAA",
      industry: "Technology",
      spread: 18,
      tenor: "5Y",
      notional: 15_000_000,
      color: "#8b5cf6",
      series: generateSpreadSeries(18, 5, 200),
    },
  ];
})();

const CDS_CONTRACTS: CDSContract[] = [
  { entity: "Apple Inc.", ticker: "AAPL", tenor: "5Y", spread: 32, rating: "AA+", industry: "Technology", change: -1.5, annualPremium: 32_000 },
  { entity: "Microsoft Corp.", ticker: "MSFT", tenor: "5Y", spread: 18, rating: "AAA", industry: "Technology", change: -0.8, annualPremium: 18_000 },
  { entity: "JPMorgan Chase", ticker: "JPM", tenor: "5Y", spread: 58, rating: "A+", industry: "Banking", change: 2.1, annualPremium: 58_000 },
  { entity: "Goldman Sachs", ticker: "GS", tenor: "5Y", spread: 72, rating: "A", industry: "Banking", change: 3.4, annualPremium: 72_000 },
  { entity: "AT&T Inc.", ticker: "T", tenor: "5Y", spread: 128, rating: "BBB", industry: "Telecom", change: -4.2, annualPremium: 128_000 },
  { entity: "Ford Motor Co.", ticker: "F", tenor: "5Y", spread: 245, rating: "BB+", industry: "Automotive", change: 11.5, annualPremium: 245_000 },
  { entity: "Carnival Corp.", ticker: "CCL", tenor: "5Y", spread: 380, rating: "BB-", industry: "Leisure", change: 22.0, annualPremium: 380_000 },
  { entity: "Delta Air Lines", ticker: "DAL", tenor: "5Y", spread: 295, rating: "BB", industry: "Airlines", change: 8.7, annualPremium: 295_000 },
  { entity: "Macy's Inc.", ticker: "M", tenor: "5Y", spread: 430, rating: "B+", industry: "Retail", change: 18.3, annualPremium: 430_000 },
  { entity: "Bausch Health", ticker: "BHC", tenor: "5Y", spread: 820, rating: "CCC+", industry: "Healthcare", change: 45.0, annualPremium: 820_000 },
];

const CDX_INDICES: CDXIndex[] = [
  { name: "CDX.NA.IG", series: 41, spread: 68, change: 1.2, constituents: 125, rating: "IG" },
  { name: "CDX.NA.HY", series: 41, spread: 345, change: 8.5, constituents: 100, rating: "HY" },
  { name: "iTraxx Europe", series: 40, spread: 74, change: 1.8, constituents: 125, rating: "IG" },
  { name: "iTraxx Xover", series: 40, spread: 298, change: 6.2, constituents: 75, rating: "HY" },
];

// ── SVG Helpers ───────────────────────────────────────────────────────────────
function toSVGCoords(
  points: SpreadPoint[],
  width: number,
  height: number,
  padding: number
): { x: number; y: number }[] {
  if (points.length === 0) return [];
  const minV = Math.min(...points.map((p) => p.value));
  const maxV = Math.max(...points.map((p) => p.value));
  const rangeV = maxV - minV || 1;
  const w = width - padding * 2;
  const h = height - padding * 2;
  return points.map((p, i) => ({
    x: padding + (i / (points.length - 1)) * w,
    y: padding + h - ((p.value - minV) / rangeV) * h,
  }));
}

function pointsToPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-border bg-card">
        <CardContent className="p-4 flex items-start gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── CDS Spread Chart ──────────────────────────────────────────────────────────
function CDSSpreadChart({ entities }: { entities: ReferenceEntity[] }) {
  const [activeEntity, setActiveEntity] = useState<string | null>(null);

  const W = 680;
  const H = 260;
  const PAD = 40;

  // Global min/max across all entities
  const allValues = entities.flatMap((e) => e.series.map((p) => p.value));
  const globalMin = Math.min(...allValues);
  const globalMax = Math.max(...allValues);
  const range = globalMax - globalMin || 1;

  function toCoords(series: SpreadPoint[]): { x: number; y: number }[] {
    const w = W - PAD * 2;
    const h = H - PAD * 2;
    return series.map((p, i) => ({
      x: PAD + (i / (series.length - 1)) * w,
      y: PAD + h - ((p.value - globalMin) / range) * h,
    }));
  }

  // Y axis labels
  const yLabels = 5;
  const yTicks = Array.from({ length: yLabels }, (_, i) => {
    const val = globalMin + (range / (yLabels - 1)) * i;
    return { y: PAD + (H - PAD * 2) - ((val - globalMin) / range) * (H - PAD * 2), label: Math.round(val).toString() };
  });

  // X axis: every 40 bars
  const xTicks = [0, 40, 80, 120, 160, 199].map((i) => ({
    x: PAD + (i / 199) * (W - PAD * 2),
    label: `T-${199 - i}`,
  }));

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 mb-3">
        {entities.map((e) => (
          <button
            key={e.ticker}
            onClick={() => setActiveEntity(activeEntity === e.ticker ? null : e.ticker)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
              activeEntity === null || activeEntity === e.ticker
                ? "border-transparent opacity-100"
                : "border-transparent opacity-30"
            }`}
            style={{ backgroundColor: `${e.color}20`, color: e.color, borderColor: `${e.color}40` }}
          >
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: e.color }} />
            {e.ticker}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Grid */}
        {yTicks.map((t, i) => (
          <line key={i} x1={PAD} y1={t.y} x2={W - PAD} y2={t.y} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
        ))}
        {/* Y labels */}
        {yTicks.map((t, i) => (
          <text key={i} x={PAD - 6} y={t.y + 4} textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.45}>{t.label}</text>
        ))}
        <text x={PAD - 20} y={PAD - 12} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.45} transform={`rotate(-90, ${PAD - 20}, ${H / 2})`}>bps</text>
        {/* X labels */}
        {xTicks.map((t, i) => (
          <text key={i} x={t.x} y={H - 4} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.45}>{t.label}</text>
        ))}
        {/* Lines */}
        {entities.map((e) => {
          const coords = toCoords(e.series);
          const isActive = activeEntity === null || activeEntity === e.ticker;
          return (
            <path
              key={e.ticker}
              d={pointsToPath(coords)}
              fill="none"
              stroke={e.color}
              strokeWidth={isActive ? 2 : 1}
              opacity={isActive ? 0.9 : 0.2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
        {/* Current value dots */}
        {entities.map((e) => {
          const coords = toCoords(e.series);
          const last = coords[coords.length - 1];
          const isActive = activeEntity === null || activeEntity === e.ticker;
          return (
            <circle
              key={e.ticker}
              cx={last.x}
              cy={last.y}
              r={4}
              fill={e.color}
              opacity={isActive ? 1 : 0.2}
            />
          );
        })}
      </svg>
      <div className="flex justify-center gap-2 mt-2 flex-wrap">
        {entities.map((e) => (
          <span key={e.ticker} className="text-xs text-muted-foreground">
            <span className="font-medium" style={{ color: e.color }}>{e.ticker}</span>: {e.series[e.series.length - 1].value.toFixed(1)} bps
          </span>
        ))}
      </div>
    </div>
  );
}

// ── CDS Payoff Diagram ────────────────────────────────────────────────────────
function CDSPayoffDiagram({ recoveryRate }: { recoveryRate: number }) {
  const W = 460;
  const H = 220;
  const PAD = 44;

  // Protection buyer payoff:
  //   No default: -spread (premium paid)
  //   Default:    (1 - recoveryRate) * notional - spread_total_paid
  // Protection seller payoff: mirror
  const notional = 1_000_000;
  const spreadBps = 245;
  const annualPremium = notional * (spreadBps / 10000);
  const tenor = 5;
  const totalPremiumPaid = annualPremium * tenor; // simplified

  // Y range
  const lossGivenDefault = notional * (1 - recoveryRate / 100);
  const buyerPayoffDefault = lossGivenDefault - totalPremiumPaid;
  const sellerPayoffDefault = -(lossGivenDefault - totalPremiumPaid);
  const buyerPayoffNoDefault = -totalPremiumPaid;
  const sellerPayoffNoDefault = totalPremiumPaid;

  const allY = [buyerPayoffDefault, sellerPayoffDefault, buyerPayoffNoDefault, sellerPayoffNoDefault, 0];
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  const rangeY = maxY - minY || 1;

  function toY(val: number): number {
    return PAD + (H - PAD * 2) - ((val - minY) / rangeY) * (H - PAD * 2);
  }

  // Scenarios: 0=No Default, 1=Default
  const xNoDefault = PAD + (W - PAD * 2) * 0.2;
  const xDefault = PAD + (W - PAD * 2) * 0.7;
  const zeroY = toY(0);

  function formatM(val: number) {
    const abs = Math.abs(val);
    const prefix = val < 0 ? "-" : "+";
    if (abs >= 1_000_000) return `${prefix}$${(abs / 1_000_000).toFixed(2)}M`;
    return `${prefix}$${(abs / 1_000).toFixed(0)}K`;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Zero line */}
      <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1} strokeDasharray="4,4" />
      <text x={PAD - 6} y={zeroY + 4} textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.45}>$0</text>

      {/* Buyer bars */}
      {[
        { x: xNoDefault, val: buyerPayoffNoDefault, label: "No Default" },
        { x: xDefault, val: buyerPayoffDefault, label: "Default" },
      ].map(({ x, val, label }) => {
        const barTop = val >= 0 ? toY(val) : zeroY;
        const barH = Math.abs(toY(0) - toY(val));
        return (
          <g key={`buyer-${x}`}>
            <rect
              x={x - 22}
              y={barTop}
              width={20}
              height={Math.max(barH, 2)}
              fill={val >= 0 ? "#3b82f6" : "#ef4444"}
              opacity={0.8}
              rx={2}
            />
            <text x={x - 12} y={H - 8} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.6}>{label}</text>
            <text
              x={x - 12}
              y={val >= 0 ? barTop - 3 : barTop + barH + 11}
              textAnchor="middle"
              fontSize={9}
              fill={val >= 0 ? "#3b82f6" : "#ef4444"}
              fontWeight="600"
            >
              {formatM(val)}
            </text>
          </g>
        );
      })}

      {/* Seller bars */}
      {[
        { x: xNoDefault, val: sellerPayoffNoDefault, label: "" },
        { x: xDefault, val: sellerPayoffDefault, label: "" },
      ].map(({ x, val }) => {
        const barTop = val >= 0 ? toY(val) : zeroY;
        const barH = Math.abs(toY(0) - toY(val));
        return (
          <g key={`seller-${x}`}>
            <rect
              x={x + 2}
              y={barTop}
              width={20}
              height={Math.max(barH, 2)}
              fill={val >= 0 ? "#10b981" : "#f59e0b"}
              opacity={0.8}
              rx={2}
            />
            <text
              x={x + 12}
              y={val >= 0 ? barTop - 3 : barTop + barH + 11}
              textAnchor="middle"
              fontSize={9}
              fill={val >= 0 ? "#10b981" : "#f59e0b"}
              fontWeight="600"
            >
              {formatM(val)}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={W - 130} y={12} width={10} height={10} fill="#3b82f6" rx={2} />
      <text x={W - 116} y={21} fontSize={9} fill="currentColor" fillOpacity={0.7}>Protection Buyer</text>
      <rect x={W - 130} y={28} width={10} height={10} fill="#10b981" rx={2} />
      <text x={W - 116} y={37} fontSize={9} fill="currentColor" fillOpacity={0.7}>Protection Seller</text>

      {/* Title */}
      <text x={W / 2} y={14} textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.65} fontWeight="600">
        CDS Payoff — {spreadBps} bps spread, {(recoveryRate).toFixed(0)}% recovery, $1M notional
      </text>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CreditDerivativesPage() {
  const [recoveryRate, setRecoveryRate] = useState(40);
  const [selectedEntity, setSelectedEntity] = useState<CDSContract | null>(null);

  const notional = 10_000_000; // $10M reference notional
  const spreadBps = 245; // Ford as reference
  const lgd = useMemo(() => (1 - recoveryRate / 100) * notional, [recoveryRate, notional]);
  const annualPremium = useMemo(() => notional * (spreadBps / 10_000), [notional, spreadBps]);
  const impliedPD = useMemo(() => {
    // Simplified: spread ~ PD * LGD => PD = spread / (LGD/notional * 10000)
    return ((spreadBps / 10_000) / (1 - recoveryRate / 100)) * 100;
  }, [recoveryRate, spreadBps]);

  // Tenor curve data for CDX
  const tenorCurve = useMemo(() => {
    const tenors = [1, 2, 3, 5, 7, 10];
    const base = 68;
    return tenors.map((t, i) => ({
      tenor: `${t}Y`,
      ig: base + i * 6 + (rand() - 0.5) * 4,
      hy: 250 + i * 28 + (rand() - 0.5) * 15,
    }));
  }, []);

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Credit Derivatives &amp; CDS</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Credit Default Swaps — pricing, payoffs, credit events, and market structure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">5Y Reference</Badge>
          <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">
            $26.8T Notional Outstanding
          </Badge>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Activity}
          label="CDX IG Spread"
          value="68 bps"
          sub="+1.2 bps today"
          color="bg-blue-500"
          delay={0.05}
        />
        <MetricCard
          icon={DollarSign}
          label="Notional (Reference)"
          value="$10.0M"
          sub="Ford Motor 5Y"
          color="bg-emerald-500"
          delay={0.1}
        />
        <MetricCard
          icon={Percent}
          label="Recovery Rate"
          value="40.0%"
          sub="Senior unsecured avg."
          color="bg-violet-500"
          delay={0.15}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Implied Default Prob."
          value={`${impliedPD.toFixed(1)}%`}
          sub={`Annual, at ${recoveryRate}% recovery`}
          color="bg-rose-500"
          delay={0.2}
        />
      </div>

      {/* Tabs */}
      <motion.div {...fadeUp(0.25)}>
        <Tabs defaultValue="spreads">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="spreads">CDS Spreads</TabsTrigger>
            <TabsTrigger value="payoff">Buyer / Seller</TabsTrigger>
            <TabsTrigger value="events">Credit Events</TabsTrigger>
            <TabsTrigger value="market">Market Data</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Spreads ── */}
          <TabsContent value="spreads" className="mt-4 space-y-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  CDS Spread History — 5 Reference Entities (200 Days)
                </CardTitle>
                <p className="text-xs text-muted-foreground">Click a ticker to isolate its series. Higher spread = higher credit risk premium.</p>
              </CardHeader>
              <CardContent>
                <CDSSpreadChart entities={ENTITIES} />
              </CardContent>
            </Card>

            {/* Spread vs Rating Grid */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Current Spread vs. Credit Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Horizontal bar chart */}
                <div className="space-y-3">
                  {ENTITIES.sort((a, b) => a.spread - b.spread).map((e) => {
                    const maxSpread = 420;
                    const pct = Math.min((e.spread / maxSpread) * 100, 100);
                    const barColor =
                      e.spread < 50
                        ? "bg-emerald-500"
                        : e.spread < 150
                        ? "bg-blue-500"
                        : e.spread < 300
                        ? "bg-amber-500"
                        : "bg-rose-500";
                    return (
                      <div key={e.ticker} className="flex items-center gap-3">
                        <div className="w-12 text-right text-xs font-mono text-muted-foreground">{e.ticker}</div>
                        <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 rounded-full ${barColor} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="w-20 text-xs font-medium">{e.spread} bps</div>
                        <Badge
                          variant="outline"
                          className={`text-xs w-12 text-center ${
                            e.rating.startsWith("AA") || e.rating === "AAA"
                              ? "border-emerald-500/30 text-emerald-400"
                              : e.rating.startsWith("A")
                              ? "border-blue-500/30 text-blue-400"
                              : e.rating.startsWith("BB")
                              ? "border-amber-500/30 text-amber-400"
                              : "border-rose-500/30 text-rose-400"
                          }`}
                        >
                          {e.rating}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 2: Payoff ── */}
          <TabsContent value="payoff" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Payoff Diagram */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    CDS Payoff Diagram
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Ford Motor 5Y CDS, 245 bps, $1M notional</p>
                </CardHeader>
                <CardContent>
                  <CDSPayoffDiagram recoveryRate={recoveryRate} />
                  {/* Recovery slider */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Recovery Rate: <span className="font-medium text-foreground">{recoveryRate}%</span></span>
                      <span>Loss Given Default: <span className="font-medium text-rose-400">${((1 - recoveryRate / 100) * 1_000_000 / 1000).toFixed(0)}K</span></span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={recoveryRate}
                      onChange={(e) => setRecoveryRate(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                      <span>0% (Full Loss)</span>
                      <span>100% (No Loss)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mechanics explanation */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    CDS Mechanics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      role: "Protection Buyer",
                      color: "bg-blue-500/10 border-blue-500/30 text-blue-400",
                      badge: "Hedger / Short Credit",
                      points: [
                        `Pays ${spreadBps} bps annually ($${(notional * spreadBps / 10_000).toLocaleString()}/yr on $${(notional / 1_000_000).toFixed(0)}M)`,
                        "Receives par minus recovery on credit event",
                        `Net payoff at default = $${((1 - recoveryRate / 100) * notional / 1_000_000).toFixed(2)}M – premiums paid`,
                        "Effectively short the reference entity's credit",
                      ],
                    },
                    {
                      role: "Protection Seller",
                      color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                      badge: "Yield Enhancer / Long Credit",
                      points: [
                        `Receives ${spreadBps} bps annually, premium income`,
                        "Pays par minus recovery if credit event occurs",
                        `Maximum loss = $${((1 - recoveryRate / 100) * notional / 1_000_000).toFixed(2)}M at ${recoveryRate}% recovery`,
                        "Effectively long the reference entity's credit",
                      ],
                    },
                  ].map((item) => (
                    <div key={item.role} className={`rounded-lg border p-3 ${item.color}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{item.role}</span>
                        <Badge variant="outline" className="text-xs">{item.badge}</Badge>
                      </div>
                      <ul className="space-y-1">
                        {item.points.map((pt, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 opacity-60" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab 3: Credit Events ── */}
          <TabsContent value="events" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Credit Event Simulator */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    Credit Event Simulator
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Simulate a default event on Ford Motor 5Y CDS
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Notional", value: `$${(notional / 1_000_000).toFixed(0)}M` },
                      { label: "CDS Spread", value: `${spreadBps} bps` },
                      { label: "Annual Premium", value: `$${annualPremium.toLocaleString()}` },
                      { label: "Recovery Rate", value: `${recoveryRate}%` },
                      { label: "Loss Given Default", value: `$${(lgd / 1_000_000).toFixed(2)}M`, highlight: true },
                      { label: "Implied PD (annual)", value: `${impliedPD.toFixed(2)}%` },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-lg p-3 ${item.highlight ? "bg-rose-500/10 border border-rose-500/20" : "bg-muted/40"}`}
                      >
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                        <div className={`text-sm font-bold ${item.highlight ? "text-rose-400" : "text-foreground"}`}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recovery rate slider */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Adjust Recovery Rate</span>
                      <span className="font-medium text-foreground">{recoveryRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={80}
                      value={recoveryRate}
                      onChange={(e) => setRecoveryRate(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0% — Wipeout</span>
                      <span>40% — IG Average</span>
                      <span>80% — Secured</span>
                    </div>
                  </div>

                  {/* LGD Bar */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Loss Given Default vs. Notional</div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${recoveryRate}%` }}
                      />
                      <div
                        className="h-full bg-rose-500 transition-all"
                        style={{ width: `${100 - recoveryRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-emerald-400">Recovery: ${(notional * recoveryRate / 100 / 1_000_000).toFixed(2)}M</span>
                      <span className="text-rose-400">LGD: ${(lgd / 1_000_000).toFixed(2)}M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Event Types */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    ISDA Credit Event Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    {
                      type: "Bankruptcy",
                      desc: "Filing under Chapter 7/11, administration, or equivalent insolvency proceedings.",
                      color: "text-rose-400",
                      bg: "bg-rose-500/10 border-rose-500/20",
                      freq: "Most common",
                    },
                    {
                      type: "Failure to Pay",
                      desc: "Obligor fails to make scheduled payment on debt obligations after grace period.",
                      color: "text-amber-400",
                      bg: "bg-amber-500/10 border-amber-500/20",
                      freq: "Common",
                    },
                    {
                      type: "Restructuring",
                      desc: "Material change in debt terms (maturity extension, coupon reduction, principal haircut).",
                      color: "text-orange-400",
                      bg: "bg-orange-500/10 border-orange-500/20",
                      freq: "Moderate",
                    },
                    {
                      type: "Obligation Acceleration",
                      desc: "Debt becomes due and payable before scheduled maturity due to default clause.",
                      color: "text-yellow-400",
                      bg: "bg-yellow-500/10 border-yellow-500/20",
                      freq: "Less common",
                    },
                    {
                      type: "Repudiation / Moratorium",
                      desc: "Sovereign or obligor refuses to honor obligations (primarily sovereign CDS).",
                      color: "text-violet-400",
                      bg: "bg-violet-500/10 border-violet-500/20",
                      freq: "Sovereign only",
                    },
                  ].map((item) => (
                    <div key={item.type} className={`rounded-lg border p-3 ${item.bg}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-semibold ${item.color}`}>{item.type}</span>
                        <span className="text-xs text-muted-foreground">{item.freq}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab 4: Market Data ── */}
          <TabsContent value="market" className="mt-4 space-y-4">
            {/* CDS Contracts Table */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  CDS Market Snapshot — 10 Reference Entities
                </CardTitle>
                <p className="text-xs text-muted-foreground">Click a row to view details. All contracts are 5Y senior unsecured.</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {["Reference Entity", "Ticker", "Tenor", "Spread (bps)", "Δ bps", "Rating", "Industry", "Annual Premium"].map((h) => (
                          <th key={h} className="text-left px-3 py-2 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CDS_CONTRACTS.map((c) => {
                        const isSelected = selectedEntity?.ticker === c.ticker;
                        return (
                          <tr
                            key={c.ticker}
                            className={`border-b border-border cursor-pointer transition-colors ${
                              isSelected ? "bg-primary/10" : "hover:bg-muted/30"
                            }`}
                            onClick={() => setSelectedEntity(isSelected ? null : c)}
                          >
                            <td className="px-3 py-2 font-medium">{c.entity}</td>
                            <td className="px-3 py-2 font-mono text-primary">{c.ticker}</td>
                            <td className="px-3 py-2 text-muted-foreground">{c.tenor}</td>
                            <td className="px-3 py-2 font-mono font-semibold">{c.spread}</td>
                            <td className={`px-3 py-2 font-mono ${c.change >= 0 ? "text-rose-400" : "text-emerald-400"}`}>
                              {c.change >= 0 ? "+" : ""}{c.change.toFixed(1)}
                            </td>
                            <td className="px-3 py-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  c.rating.startsWith("AA") || c.rating === "AAA"
                                    ? "border-emerald-500/30 text-emerald-400"
                                    : c.rating.startsWith("A")
                                    ? "border-blue-500/30 text-blue-400"
                                    : c.rating.startsWith("BB")
                                    ? "border-amber-500/30 text-amber-400"
                                    : "border-rose-500/30 text-rose-400"
                                }`}
                              >
                                {c.rating}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">{c.industry}</td>
                            <td className="px-3 py-2 font-mono">${c.annualPremium.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* CDX Index Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    CDX / iTraxx Indices
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Standardised CDS index products — portfolios of single-name CDS</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {CDX_INDICES.map((idx) => (
                    <div key={idx.name} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                      <div>
                        <div className="text-sm font-semibold">{idx.name}</div>
                        <div className="text-xs text-muted-foreground">Series {idx.series} · {idx.constituents} names</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-bold">{idx.spread} bps</div>
                        <div className={`text-xs font-mono ${idx.change >= 0 ? "text-rose-400" : "text-emerald-400"}`}>
                          {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(1)} bps
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`ml-3 text-xs ${
                          idx.rating === "IG"
                            ? "border-blue-500/30 text-blue-400"
                            : "border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {idx.rating}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tenor Curve */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    CDX Spread Curve by Tenor
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">IG vs. HY index spread across maturities</p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const W2 = 380;
                    const H2 = 180;
                    const P2 = 36;
                    const igVals = tenorCurve.map((d) => d.ig);
                    const hyVals = tenorCurve.map((d) => d.hy);
                    const allV = [...igVals, ...hyVals];
                    const minV = Math.min(...allV);
                    const maxV = Math.max(...allV);
                    const rangeV2 = maxV - minV || 1;

                    function px(i: number): number {
                      return P2 + (i / (tenorCurve.length - 1)) * (W2 - P2 * 2);
                    }
                    function py(val: number): number {
                      return P2 + (H2 - P2 * 2) - ((val - minV) / rangeV2) * (H2 - P2 * 2);
                    }

                    const igPath = tenorCurve.map((d, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(d.ig).toFixed(1)}`).join(" ");
                    const hyPath = tenorCurve.map((d, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(d.hy).toFixed(1)}`).join(" ");

                    const yTick2 = [minV, (minV + maxV) / 2, maxV].map((v) => ({
                      v,
                      y: py(v),
                    }));

                    return (
                      <svg viewBox={`0 0 ${W2} ${H2}`} className="w-full h-auto">
                        {yTick2.map((t, i) => (
                          <g key={i}>
                            <line x1={P2} y1={t.y} x2={W2 - P2} y2={t.y} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
                            <text x={P2 - 4} y={t.y + 4} textAnchor="end" fontSize={8} fill="currentColor" fillOpacity={0.4}>{Math.round(t.v)}</text>
                          </g>
                        ))}
                        {tenorCurve.map((d, i) => (
                          <text key={i} x={px(i)} y={H2 - 4} textAnchor="middle" fontSize={8} fill="currentColor" fillOpacity={0.45}>{d.tenor}</text>
                        ))}
                        <path d={igPath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />
                        <path d={hyPath} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinejoin="round" />
                        {tenorCurve.map((d, i) => (
                          <g key={i}>
                            <circle cx={px(i)} cy={py(d.ig)} r={3} fill="#3b82f6" />
                            <circle cx={px(i)} cy={py(d.hy)} r={3} fill="#f59e0b" />
                          </g>
                        ))}
                        <rect x={W2 - 80} y={10} width={8} height={8} rx={2} fill="#3b82f6" />
                        <text x={W2 - 68} y={17} fontSize={8} fill="currentColor" fillOpacity={0.7}>CDX IG</text>
                        <rect x={W2 - 80} y={24} width={8} height={8} rx={2} fill="#f59e0b" />
                        <text x={W2 - 68} y={31} fontSize={8} fill="currentColor" fillOpacity={0.7}>CDX HY</text>
                      </svg>
                    );
                  })()}
                  <div className="mt-2 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Key insight:</span> Upward sloping CDS curve indicates increasing default risk over time.
                    Inverted curves signal near-term stress (distressed situations).
                    HY–IG spread differential widens during risk-off episodes.
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Index vs Single-Name comparison */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  CDX Index vs. Single-Name CDS Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {[
                    {
                      title: "CDX / iTraxx Index",
                      color: "border-blue-500/30 bg-blue-500/5",
                      badge: "Portfolio Product",
                      points: [
                        "Standardised basket of 100–125 reference entities",
                        "Highly liquid — smaller bid/ask spreads",
                        "Rolled to new series every 6 months (March/Sept)",
                        "Used for macro credit hedging and expressing sector views",
                        "Cannot target specific credits — portfolio diversification built in",
                        "IG series: ~68 bps · HY series: ~345 bps",
                      ],
                    },
                    {
                      title: "Single-Name CDS",
                      color: "border-emerald-500/30 bg-emerald-500/5",
                      badge: "Bespoke Hedge",
                      points: [
                        "Reference one specific obligor (issuer)",
                        "Less liquid — wider bid/ask, especially for non-benchmark names",
                        "Custom tenor, notional, and restructuring clauses",
                        "Ideal for precise idiosyncratic credit hedging",
                        "Used by banks to hedge loan book concentrations",
                        "Spreads range from 18 bps (MSFT) to 820+ bps (distressed)",
                      ],
                    },
                  ].map((item) => (
                    <div key={item.title} className={`rounded-lg border p-4 ${item.color}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">{item.title}</span>
                        <Badge variant="outline" className="text-xs">{item.badge}</Badge>
                      </div>
                      <ul className="space-y-1.5">
                        {item.points.map((pt, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 opacity-50" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Selected Entity Detail Panel */}
      {selectedEntity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/40 bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  {selectedEntity.entity} — CDS Detail
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setSelectedEntity(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Spread", value: `${selectedEntity.spread} bps` },
                  { label: "Annual Premium ($10M)", value: `$${(selectedEntity.annualPremium * 10).toLocaleString()}` },
                  { label: "5Y Total Premium", value: `$${(selectedEntity.annualPremium * 10 * 5).toLocaleString()}` },
                  { label: "Implied PD (40% Rec.)", value: `${((selectedEntity.spread / 10_000) / 0.6 * 100).toFixed(2)}%` },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-muted/30 p-3">
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="text-sm font-bold text-foreground mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Note:</span> Annual premium shown on $10M notional.
                Implied PD uses simplified formula: PD ≈ spread / LGD. Actual pricing requires full survival probability curve calibration.
                {selectedEntity.change > 10 && (
                  <span className="ml-1 text-amber-400 font-medium">
                    Spread widened significantly (+{selectedEntity.change.toFixed(1)} bps) — monitor for credit deterioration.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
