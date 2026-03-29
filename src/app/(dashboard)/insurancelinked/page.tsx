"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Activity,
  Wind,
  Zap,
  Droplets,
  Globe,
  DollarSign,
  Layers,
  Info,
  Percent,
  Target,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 761;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 761;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface CatBond {
  name: string;
  sponsor: string;
  peril: "Hurricane" | "Earthquake" | "Windstorm" | "Multi-Peril" | "Flood";
  trigger: "Indemnity" | "Industry Index" | "Parametric" | "Modeled Loss";
  spread: number;
  expectedLoss: number;
  maturity: string;
  size: number;
  rating: string;
}

interface ILSFund {
  name: string;
  aum: number;
  strategy: string;
  ytdReturn: number;
  sharpe: number;
  maxDrawdown: number;
  expLoss: number;
}

interface HistoricalEvent {
  year: number;
  event: string;
  region: string;
  totalLoss: number;
  ilsLoss: number;
  peril: string;
}

// ── Static data ────────────────────────────────────────────────────────────────

const CAT_BOND_ISSUANCE: { year: number; amount: number }[] = [
  { year: 2015, amount: 8.2 },
  { year: 2016, amount: 6.9 },
  { year: 2017, amount: 10.4 },
  { year: 2018, amount: 9.7 },
  { year: 2019, amount: 11.3 },
  { year: 2020, amount: 16.4 },
  { year: 2021, amount: 19.8 },
  { year: 2022, amount: 14.2 },
  { year: 2023, amount: 16.7 },
  { year: 2024, amount: 17.1 },
];

const CAT_BONDS: CatBond[] = [
  { name: "Kilimanjaro Re 2024-1", sponsor: "Everest Re", peril: "Hurricane", trigger: "Indemnity", spread: 7.2, expectedLoss: 2.1, maturity: "Jan 2027", size: 400, rating: "BB+" },
  { name: "Tortola Re 2024-2", sponsor: "AIG", peril: "Earthquake", trigger: "Parametric", spread: 5.8, expectedLoss: 1.4, maturity: "Apr 2027", size: 250, rating: "BB" },
  { name: "Atlas Capital 2023-4", sponsor: "SCOR", peril: "Windstorm", trigger: "Industry Index", spread: 4.3, expectedLoss: 0.9, maturity: "Jun 2026", size: 175, rating: "BB+" },
  { name: "Matterhorn Re 2024-1", sponsor: "Swiss Re", peril: "Multi-Peril", trigger: "Modeled Loss", spread: 8.9, expectedLoss: 3.2, maturity: "Dec 2026", size: 500, rating: "B+" },
  { name: "Caelus Re 2024-2", sponsor: "Nationwide", peril: "Hurricane", trigger: "Indemnity", spread: 6.4, expectedLoss: 1.8, maturity: "Mar 2027", size: 300, rating: "BB" },
  { name: "Residential Re 2024", sponsor: "USAA", peril: "Hurricane", trigger: "Indemnity", spread: 5.1, expectedLoss: 1.2, maturity: "Jun 2027", size: 350, rating: "BB+" },
  { name: "Blue Halo Re 2023-2", sponsor: "Assurant", peril: "Multi-Peril", trigger: "Parametric", spread: 9.7, expectedLoss: 3.8, maturity: "Sep 2026", size: 150, rating: "B" },
  { name: "Aozora Re 2024-1", sponsor: "Tokio Marine", peril: "Earthquake", trigger: "Parametric", spread: 3.9, expectedLoss: 0.7, maturity: "Mar 2028", size: 220, rating: "BBB-" },
];

const ILS_FUNDS: ILSFund[] = [
  { name: "Plenum Investments Cat Bond", aum: 3200, strategy: "Cat Bond Only", ytdReturn: 11.4, sharpe: 1.82, maxDrawdown: -4.1, expLoss: 1.5 },
  { name: "Securis Investment Cat Bond", aum: 2800, strategy: "Cat Bond Only", ytdReturn: 10.9, sharpe: 1.71, maxDrawdown: -3.8, expLoss: 1.4 },
  { name: "Schroders ILS Fund", aum: 4100, strategy: "Diversified ILS", ytdReturn: 9.2, sharpe: 1.45, maxDrawdown: -7.6, expLoss: 2.3 },
  { name: "Twelve Capital ILS", aum: 5600, strategy: "Diversified ILS", ytdReturn: 8.7, sharpe: 1.38, maxDrawdown: -9.2, expLoss: 2.8 },
  { name: "Leadenhall ILS Fund", aum: 3900, strategy: "Private ILS", ytdReturn: 13.1, sharpe: 1.22, maxDrawdown: -14.3, expLoss: 4.1 },
];

const HISTORICAL_EVENTS: HistoricalEvent[] = [
  { year: 2017, event: "Hurricane Harvey", region: "Texas, USA", totalLoss: 125, ilsLoss: 0.3, peril: "Hurricane" },
  { year: 2017, event: "Hurricane Irma", region: "Caribbean/Florida", totalLoss: 65, ilsLoss: 1.4, peril: "Hurricane" },
  { year: 2017, event: "Hurricane Maria", region: "Puerto Rico", totalLoss: 90, ilsLoss: 0.2, peril: "Hurricane" },
  { year: 2018, event: "California Camp Fire", region: "California, USA", totalLoss: 16, ilsLoss: 0.1, peril: "Wildfire" },
  { year: 2019, event: "Typhoon Hagibis", region: "Japan", totalLoss: 17, ilsLoss: 0.4, peril: "Windstorm" },
  { year: 2021, event: "Hurricane Ida", region: "Louisiana, USA", totalLoss: 65, ilsLoss: 1.8, peril: "Hurricane" },
  { year: 2022, event: "Hurricane Ian", region: "Florida, USA", totalLoss: 112, ilsLoss: 3.1, peril: "Hurricane" },
  { year: 2023, event: "Turkey Earthquake", region: "Turkey/Syria", totalLoss: 34, ilsLoss: 0.6, peril: "Earthquake" },
  { year: 2023, event: "Hurricane Otis", region: "Mexico", totalLoss: 12, ilsLoss: 0.2, peril: "Hurricane" },
  { year: 2024, event: "Japan New Year EQ", region: "Japan", totalLoss: 18, ilsLoss: 0.5, peril: "Earthquake" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "blue",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color?: "blue" | "green" | "amber" | "purple";
}) {
  const colors = {
    blue: "text-primary bg-primary/10",
    green: "text-green-400 bg-green-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    purple: "text-primary bg-primary/10",
  };
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={cn("p-2 rounded-lg", colors[color])}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PerilBadge({ peril }: { peril: CatBond["peril"] }) {
  const map: Record<CatBond["peril"], { icon: React.ElementType; cls: string }> = {
    Hurricane: { icon: Wind, cls: "bg-primary/10 text-primary border-border" },
    Earthquake: { icon: Zap, cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    Windstorm: { icon: Wind, cls: "bg-cyan-500/10 text-muted-foreground border-cyan-500/20" },
    "Multi-Peril": { icon: Globe, cls: "bg-primary/10 text-primary border-border" },
    Flood: { icon: Droplets, cls: "bg-teal-500/10 text-emerald-400 border-teal-500/20" },
  };
  const { icon: Icon, cls } = map[peril];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium", cls)}>
      <Icon className="w-3 h-3" />
      {peril}
    </span>
  );
}

function TriggerBadge({ trigger }: { trigger: CatBond["trigger"] }) {
  const colors: Record<CatBond["trigger"], string> = {
    Indemnity: "bg-green-500/10 text-green-400 border-green-500/20",
    "Industry Index": "bg-primary/10 text-primary border-border",
    Parametric: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "Modeled Loss": "bg-primary/10 text-primary border-border",
  };
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", colors[trigger])}>
      {trigger}
    </span>
  );
}

// ── SVG Charts ─────────────────────────────────────────────────────────────────

function IssuanceBarChart() {
  const W = 560, H = 220, padL = 48, padR = 16, padT = 16, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(...CAT_BOND_ISSUANCE.map((d) => d.amount));
  const barW = innerW / CAT_BOND_ISSUANCE.length;
  const BAR_GAP = 6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      {/* Y-axis gridlines */}
      {[0, 5, 10, 15, 20].map((v) => {
        const y = padT + innerH - (v / max) * innerH;
        return (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3 3" />
            <text x={padL - 6} y={y + 4} fontSize={9} fill="hsl(var(--muted-foreground))" textAnchor="end">${v}B</text>
          </g>
        );
      })}
      {/* Bars */}
      {CAT_BOND_ISSUANCE.map((d, i) => {
        const bh = (d.amount / max) * innerH;
        const x = padL + i * barW + BAR_GAP / 2;
        const y = padT + innerH - bh;
        const fill = d.year === 2021 ? "hsl(217 91% 60%)" : d.year === 2024 ? "hsl(142 72% 50%)" : "hsl(217 91% 60% / 0.6)";
        return (
          <g key={d.year}>
            <rect x={x} y={y} width={barW - BAR_GAP} height={bh} rx={2} fill={fill} />
            <text x={x + (barW - BAR_GAP) / 2} y={H - padB + 14} fontSize={9} fill="hsl(var(--muted-foreground))" textAnchor="middle">
              {d.year}
            </text>
            <text x={x + (barW - BAR_GAP) / 2} y={y - 3} fontSize={8} fill="hsl(var(--muted-foreground))" textAnchor="middle">
              {d.amount}
            </text>
          </g>
        );
      })}
      {/* X-axis */}
      <line x1={padL} x2={W - padR} y1={padT + innerH} y2={padT + innerH} stroke="hsl(var(--border))" strokeWidth={1} />
      {/* Y-axis */}
      <line x1={padL} x2={padL} y1={padT} y2={padT + innerH} stroke="hsl(var(--border))" strokeWidth={1} />
    </svg>
  );
}

function RiskReturnScatter() {
  const W = 480, H = 260, padL = 52, padR = 20, padT = 16, padB = 44;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // x = expected loss (risk), y = expected return (coupon spread)
  const assets = [
    { label: "Cat Bonds", x: 1.8, y: 7.2, r: 7, color: "hsl(217 91% 60%)" },
    { label: "ILS Private", x: 3.5, y: 11.2, r: 7, color: "hsl(270 60% 60%)" },
    { label: "US HY Bonds", x: 2.4, y: 5.1, r: 7, color: "hsl(35 90% 55%)" },
    { label: "US IG Bonds", x: 0.3, y: 1.9, r: 7, color: "hsl(160 60% 50%)" },
    { label: "US Equities", x: 4.1, y: 9.8, r: 7, color: "hsl(0 72% 60%)" },
    { label: "EM Bonds", x: 3.0, y: 6.3, r: 7, color: "hsl(198 80% 55%)" },
    { label: "Real Estate", x: 2.8, y: 7.8, r: 7, color: "hsl(55 80% 55%)" },
  ];

  const xMax = 5, yMax = 13;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
      {/* Grid */}
      {[0, 2, 4, 6, 8, 10, 12].map((v) => {
        const y = padT + innerH - (v / yMax) * innerH;
        return (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3 3" />
            <text x={padL - 6} y={y + 4} fontSize={9} fill="hsl(var(--muted-foreground))" textAnchor="end">{v}%</text>
          </g>
        );
      })}
      {[0, 1, 2, 3, 4, 5].map((v) => {
        const x = padL + (v / xMax) * innerW;
        return (
          <g key={v}>
            <line x1={x} x2={x} y1={padT} y2={padT + innerH} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3 3" />
            <text x={x} y={padT + innerH + 14} fontSize={9} fill="hsl(var(--muted-foreground))" textAnchor="middle">{v}%</text>
          </g>
        );
      })}
      {/* Axes */}
      <line x1={padL} x2={W - padR} y1={padT + innerH} y2={padT + innerH} stroke="hsl(var(--border))" strokeWidth={1} />
      <line x1={padL} x2={padL} y1={padT} y2={padT + innerH} stroke="hsl(var(--border))" strokeWidth={1} />
      {/* Axis labels */}
      <text x={padL + innerW / 2} y={H - 4} fontSize={9} fill="hsl(var(--muted-foreground))" textAnchor="middle">Expected Loss / Volatility (%)</text>
      <text x={10} y={padT + innerH / 2} fontSize={9} fill="hsl(var(--muted-foreground))" textAnchor="middle" transform={`rotate(-90, 10, ${padT + innerH / 2})`}>Expected Return (%)</text>
      {/* Points */}
      {assets.map((a) => {
        const cx = padL + (a.x / xMax) * innerW;
        const cy = padT + innerH - (a.y / yMax) * innerH;
        const labelAbove = a.label === "US Equities" || a.label === "ILS Private";
        return (
          <g key={a.label}>
            <circle cx={cx} cy={cy} r={a.r} fill={a.color} fillOpacity={0.8} />
            <text
              x={cx}
              y={labelAbove ? cy - a.r - 3 : cy + a.r + 10}
              fontSize={8}
              fill="hsl(var(--foreground))"
              textAnchor="middle"
              fontWeight="500"
            >
              {a.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LossHistogram() {
  resetSeed();
  // Simple Monte Carlo — generate loss distribution
  const bins = Array.from({ length: 20 }, (_, i) => ({ lo: i * 0.5, count: 0 }));
  for (let i = 0; i < 10000; i++) {
    // Fat-tailed loss: mostly small, rare large
    const u = rand();
    let loss: number;
    if (u < 0.7) {
      loss = rand() * 2; // 0-2%
    } else if (u < 0.92) {
      loss = 2 + rand() * 4; // 2-6%
    } else if (u < 0.98) {
      loss = 6 + rand() * 4; // 6-10%
    } else {
      loss = Math.min(10 + rand() * 8, 9.9); // 10%+
    }
    const bi = Math.min(Math.floor(loss / 0.5), 19);
    bins[bi].count++;
  }

  const W = 520, H = 200, padL = 44, padR = 16, padT = 16, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxCount = Math.max(...bins.map((b) => b.count));
  const barW = innerW / bins.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      {/* Y gridlines */}
      {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
        const y = padT + innerH - frac * innerH;
        return (
          <line key={frac} x1={padL} x2={W - padR} y1={y} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="3 3" />
        );
      })}
      {/* Bars */}
      {bins.map((b, i) => {
        const bh = (b.count / maxCount) * innerH;
        const x = padL + i * barW + 1;
        const y = padT + innerH - bh;
        // Color: green for low loss, red for high loss
        const pct = i / bins.length;
        const fill = pct < 0.3
          ? "hsl(142 72% 50% / 0.7)"
          : pct < 0.65
          ? "hsl(38 90% 55% / 0.7)"
          : "hsl(0 72% 55% / 0.7)";
        return (
          <rect key={i} x={x} y={y} width={barW - 2} height={bh} rx={1} fill={fill} />
        );
      })}
      {/* VaR 95% line at ~6% loss (bin 12) */}
      {(() => {
        const varX = padL + 12 * barW;
        return (
          <g>
            <line x1={varX} x2={varX} y1={padT} y2={padT + innerH} stroke="hsl(0 72% 60%)" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={varX + 3} y={padT + 12} fontSize={8} fill="hsl(0 72% 60%)">VaR 95%</text>
          </g>
        );
      })()}
      {/* X labels */}
      {[0, 2.5, 5, 7.5, 10].map((v) => {
        const bi = v / 0.5;
        const x = padL + bi * barW;
        return (
          <text key={v} x={x} y={H - padB + 14} fontSize={8} fill="hsl(var(--muted-foreground))" textAnchor="middle">{v}%</text>
        );
      })}
      <text x={padL + innerW / 2} y={H - 4} fontSize={9} fill="hsl(var(--muted-foreground))" textAnchor="middle">Simulated Annual Loss (%)</text>
      {/* Axes */}
      <line x1={padL} x2={W - padR} y1={padT + innerH} y2={padT + innerH} stroke="hsl(var(--border))" strokeWidth={1} />
      <line x1={padL} x2={padL} y1={padT} y2={padT + innerH} stroke="hsl(var(--border))" strokeWidth={1} />
    </svg>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function InsuranceLinkedPage() {
  const [activeTab, setActiveTab] = useState("catbonds");

  const totalMarketSize = useMemo(() => {
    return CAT_BOND_ISSUANCE[CAT_BOND_ISSUANCE.length - 1].amount * 1.9; // outstanding > new issuance
  }, []);

  const avgSpread = useMemo(() => {
    const spreads = CAT_BONDS.map((b) => b.spread);
    return spreads.reduce((a, b) => a + b, 0) / spreads.length;
  }, []);

  const avgExpLoss = useMemo(() => {
    const els = CAT_BONDS.map((b) => b.expectedLoss);
    return els.reduce((a, b) => a + b, 0) / els.length;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Insurance-Linked Securities</h1>
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Cat bonds and ILS offer institutional-grade uncorrelated returns — payoffs driven by natural catastrophe events, not financial markets. Zero beta to equity cycles.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-border text-primary">Alternative Asset</Badge>
              <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">Low Correlation</Badge>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics — Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-md border border-border bg-card border-l-4 border-l-primary p-6"
        >
          <MetricCard
            label="ILS Market Size"
            value={`$${totalMarketSize.toFixed(0)}B`}
            sub="Outstanding notional"
            icon={DollarSign}
            color="blue"
          />
          <MetricCard
            label="Avg Coupon Spread"
            value={`${avgSpread.toFixed(1)}%`}
            sub="Above risk-free rate"
            icon={Percent}
            color="green"
          />
          <MetricCard
            label="Avg Expected Loss"
            value={`${avgExpLoss.toFixed(1)}%`}
            sub="Modeled annual loss"
            icon={AlertTriangle}
            color="amber"
          />
          <MetricCard
            label="ILS Sharpe Ratio"
            value="1.65"
            sub="5-yr trailing avg"
            icon={Target}
            color="purple"
          />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted border border-border h-9 mb-4">
              <TabsTrigger value="catbonds" className="text-xs data-[state=active]:bg-background">
                <Shield className="w-3 h-3 mr-1" />Cat Bonds
              </TabsTrigger>
              <TabsTrigger value="ilsfunds" className="text-xs data-[state=active]:bg-background">
                <Layers className="w-3 h-3 mr-1" />ILS Funds
              </TabsTrigger>
              <TabsTrigger value="riskmodel" className="text-xs data-[state=active]:bg-background">
                <Activity className="w-3 h-3 mr-1" />Risk Modeling
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs data-[state=active]:bg-background">
                <BarChart3 className="w-3 h-3 mr-1" />Historical Events
              </TabsTrigger>
            </TabsList>

            {/* ── Cat Bonds Tab ── */}
            <TabsContent value="catbonds" className="space-y-6 data-[state=inactive]:hidden">
              {/* Issuance Chart */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Annual Cat Bond Issuance 2015–2024
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">USD billions; record $19.8B issued in 2021</p>
                </CardHeader>
                <CardContent>
                  <IssuanceBarChart />
                </CardContent>
              </Card>

              {/* Bond Table */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Active Cat Bond Listings
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Representative transactions — 2023/2024 vintage</p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {["Bond", "Sponsor", "Peril", "Trigger", "Spread", "Exp. Loss", "Size ($M)", "Maturity", "Rating"].map((h) => (
                            <th key={h} className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {CAT_BONDS.map((b, i) => (
                          <tr key={b.name} className={cn("border-b border-border/50 hover:bg-muted/30 transition-colors", i % 2 === 0 ? "" : "bg-muted/10")}>
                            <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">{b.name}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{b.sponsor}</td>
                            <td className="px-4 py-2.5"><PerilBadge peril={b.peril} /></td>
                            <td className="px-4 py-2.5"><TriggerBadge trigger={b.trigger} /></td>
                            <td className="px-4 py-2.5 text-green-400 font-semibold">{b.spread.toFixed(1)}%</td>
                            <td className="px-4 py-2.5 text-amber-400">{b.expectedLoss.toFixed(1)}%</td>
                            <td className="px-4 py-2.5 text-foreground">{b.size}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{b.maturity}</td>
                            <td className="px-4 py-2.5">
                              <Badge variant="outline" className="text-xs border-border">{b.rating}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Info boxes */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: Info, color: "text-primary", title: "Trigger Types", body: "Indemnity triggers pay on actual insurer losses, reducing basis risk. Parametric triggers pay on measured physical parameters (wind speed, magnitude). Industry index and modeled loss triggers sit between these extremes." },
                  { icon: TrendingUp, color: "text-green-400", title: "Return Drivers", body: "Cat bond returns = risk-free rate + spread. The spread compensates for low-probability catastrophe risk. In non-loss years, investors earn full coupon. Spreads widened significantly post-Ian (2022) as capacity contracted." },
                  { icon: Globe, color: "text-primary", title: "Diversification Value", body: "ILS has near-zero correlation to equity and credit markets. Natural catastrophe frequency is independent of economic cycles. This makes ILS a powerful portfolio diversifier and return enhancer in multi-asset portfolios." },
                ].map(({ icon: Icon, color, title, body }) => (
                  <Card key={title} className="bg-card border-border">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={cn("w-4 h-4", color)} />
                        <span className="text-sm font-medium text-foreground">{title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ── ILS Funds Tab ── */}
            <TabsContent value="ilsfunds" className="space-y-6 data-[state=inactive]:hidden">
              {/* Risk-Return Scatter */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Risk-Return: ILS vs Other Asset Classes
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">X-axis: expected loss / volatility | Y-axis: expected annual return</p>
                </CardHeader>
                <CardContent>
                  <RiskReturnScatter />
                  <div className="mt-3 flex flex-wrap gap-3">
                    {[
                      { label: "Cat Bonds", color: "bg-primary" },
                      { label: "ILS Private", color: "bg-primary" },
                      { label: "US HY Bonds", color: "bg-amber-400" },
                      { label: "US Equities", color: "bg-red-400" },
                      { label: "US IG Bonds", color: "bg-green-400" },
                    ].map(({ label, color }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Fund Table */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    ILS Fund Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {["Fund", "Strategy", "AUM ($M)", "YTD Return", "Sharpe", "Max DD", "Exp. Loss"].map((h) => (
                            <th key={h} className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ILS_FUNDS.map((f, i) => (
                          <tr key={f.name} className={cn("border-b border-border/50 hover:bg-muted/30 transition-colors", i % 2 === 0 ? "" : "bg-muted/10")}>
                            <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">{f.name}</td>
                            <td className="px-4 py-2.5">
                              <Badge variant="outline" className="text-xs">{f.strategy}</Badge>
                            </td>
                            <td className="px-4 py-2.5 text-foreground">{f.aum.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-green-400 font-medium">+{f.ytdReturn.toFixed(1)}%</td>
                            <td className="px-4 py-2.5 text-primary">{f.sharpe.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-red-400">{f.maxDrawdown.toFixed(1)}%</td>
                            <td className="px-4 py-2.5 text-amber-400">{f.expLoss.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Access note */}
              <Card className="bg-primary/5 border-border">
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">Investor Access</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        ILS funds are primarily available to institutional and qualified investors. Minimum investments typically range from $1M (fund of funds) to $10M+ (direct sidecars). Cat bond ETFs (e.g., SRSKX, JHILS) provide retail exposure but with higher fees and broader mandates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Risk Modeling Tab ── */}
            <TabsContent value="riskmodel" className="space-y-6 data-[state=inactive]:hidden">
              {/* Loss histogram */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Monte Carlo Loss Distribution (10,000 Simulations)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Simulated annual portfolio loss — cat bond portfolio</p>
                </CardHeader>
                <CardContent>
                  <LossHistogram />
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {[
                      { label: "Mean Loss", value: "1.8%", color: "text-green-400" },
                      { label: "VaR 95%", value: "6.0%", color: "text-amber-400" },
                      { label: "CVaR 99%", value: "9.2%", color: "text-red-400" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-muted/30 rounded-lg p-3 text-center border border-border/50">
                        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                        <div className={cn("text-base font-medium", color)}>{value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Model types */}
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    icon: Zap,
                    color: "text-amber-400",
                    title: "Catastrophe Models",
                    items: [
                      "RMS RiskLink — industry-standard cat model",
                      "AIR Touchstone — stochastic event sets",
                      "CoreLogic — property exposure data",
                      "Probabilistic loss exceedance curves",
                      "Uncertainty bands: model, parameter, data",
                    ],
                  },
                  {
                    icon: Target,
                    color: "text-primary",
                    title: "Key Risk Metrics",
                    items: [
                      "Expected Loss (EL): average annual loss %",
                      "Attachment Probability: trigger likelihood",
                      "Exhaustion Probability: full loss probability",
                      "Multiple at Risk (MAR): spread / EL ratio",
                      "PML 200/250yr: Probable Maximum Loss",
                    ],
                  },
                ].map(({ icon: Icon, color, title, items }) => (
                  <Card key={title} className="bg-card border-border">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={cn("w-4 h-4", color)} />
                        <span className="text-sm font-medium text-foreground">{title}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-border shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Correlation matrix mini */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Correlation Matrix: ILS vs Major Asset Classes</CardTitle>
                  <p className="text-xs text-muted-foreground">5-year monthly return correlations</p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const labels = ["Cat Bonds", "US Equities", "US HY", "US IG", "Commodities", "Real Estate"];
                    const matrix = [
                      [1.00, 0.03, 0.06, 0.04, 0.02, 0.07],
                      [0.03, 1.00, 0.73, 0.18, 0.41, 0.65],
                      [0.06, 0.73, 1.00, 0.34, 0.38, 0.51],
                      [0.04, 0.18, 0.34, 1.00, 0.11, 0.24],
                      [0.02, 0.41, 0.38, 0.11, 1.00, 0.36],
                      [0.07, 0.65, 0.51, 0.24, 0.36, 1.00],
                    ];
                    return (
                      <div className="overflow-x-auto">
                        <table className="text-xs w-full">
                          <thead>
                            <tr>
                              <th className="text-left py-1 pr-3 text-muted-foreground font-medium w-28" />
                              {labels.map((l) => (
                                <th key={l} className="py-1 px-2 text-muted-foreground font-medium text-center whitespace-nowrap">{l}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {matrix.map((row, ri) => (
                              <tr key={labels[ri]} className="border-t border-border/30">
                                <td className="py-1.5 pr-3 text-muted-foreground font-medium whitespace-nowrap">{labels[ri]}</td>
                                {row.map((v, ci) => {
                                  const isHigh = v > 0.5 && ri !== ci;
                                  const isMed = v > 0.2 && v <= 0.5 && ri !== ci;
                                  const isLow = v <= 0.1 && ri !== ci;
                                  const cellCls = ri === ci
                                    ? "bg-primary/20 text-primary"
                                    : isHigh
                                    ? "bg-red-500/15 text-red-400"
                                    : isMed
                                    ? "bg-amber-500/10 text-amber-400"
                                    : isLow
                                    ? "bg-green-500/10 text-green-400"
                                    : "text-muted-foreground";
                                  return (
                                    <td key={ci} className={cn("py-1.5 px-2 text-center rounded", cellCls)}>
                                      {v.toFixed(2)}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Historical Events Tab ── */}
            <TabsContent value="history" className="space-y-6 data-[state=inactive]:hidden">
              {/* Events table */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Major Nat-Cat Events and ILS Impact
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">ILS market estimated losses; total economic loss in USD billions</p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {["Year", "Event", "Region", "Total Loss", "ILS Loss", "Peril", "ILS Impact"].map((h) => (
                            <th key={h} className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {HISTORICAL_EVENTS.map((e, i) => {
                          const pct = (e.ilsLoss / e.totalLoss) * 100;
                          const impact = pct < 1 ? { label: "Minimal", cls: "bg-green-500/10 text-green-400 border-green-500/20" }
                            : pct < 3 ? { label: "Moderate", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
                            : { label: "Significant", cls: "bg-red-500/10 text-red-400 border-red-500/20" };
                          return (
                            <tr key={`${e.year}-${e.event}`} className={cn("border-b border-border/50 hover:bg-muted/30 transition-colors", i % 2 === 0 ? "" : "bg-muted/10")}>
                              <td className="px-4 py-2.5 text-muted-foreground">{e.year}</td>
                              <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">{e.event}</td>
                              <td className="px-4 py-2.5 text-muted-foreground">{e.region}</td>
                              <td className="px-4 py-2.5 text-amber-400 font-medium">${e.totalLoss}B</td>
                              <td className="px-4 py-2.5 text-red-400">${e.ilsLoss.toFixed(1)}B</td>
                              <td className="px-4 py-2.5">
                                <PerilBadge peril={e.peril as CatBond["peril"]} />
                              </td>
                              <td className="px-4 py-2.5">
                                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", impact.cls)}>{impact.label}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Insight cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-400">2017 Season: Stress Test</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Harvey, Irma, and Maria collectively caused $280B+ in insured losses. The ILS market paid claims, spreads spiked 200–400bps at 2018 renewals, but the asset class recovered within 18 months. Demonstrated the market&apos;s resilience and capital adequacy.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/5 border-red-500/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400">Hurricane Ian (2022): Largest ILS Loss</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ian was the costliest single ILS loss event at ~$3.1B. Multiple Florida cat bonds triggered, including Safepoint and Heritage Insurance vehicles. The event accelerated market-wide repricing and led to the tightest supply of capacity since Katrina.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Key takeaways */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Historical Return Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Years with 0 Loss", value: "~70%", sub: "Of all annual periods", color: "text-green-400" },
                      { label: "Worst Annual Return", value: "-8.1%", sub: "2022 (Ian year)", color: "text-red-400" },
                      { label: "Best Annual Return", value: "+16.4%", sub: "2023 (post-Ian rebound)", color: "text-green-400" },
                      { label: "Avg Equity Corr.", value: "0.04", sub: "Near-zero beta", color: "text-primary" },
                    ].map(({ label, value, sub, color }) => (
                      <div key={label} className="bg-muted/30 rounded-lg p-3 border border-border/50">
                        <div className="text-xs text-muted-foreground mb-1">{label}</div>
                        <div className={cn("text-lg font-medium", color)}>{value}</div>
                        <div className="text-xs text-muted-foreground">{sub}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

      </div>
    </div>
  );
}
