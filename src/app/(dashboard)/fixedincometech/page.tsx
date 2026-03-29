"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi,
  TrendingUp,
  ArrowRight,
  Activity,
  DollarSign,
  Zap,
  Globe,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Clock,
  Network,
  Target,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 901;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const _r: number[] = [];
for (let i = 0; i < 500; i++) _r.push(rand());
let _ri = 0;
const rnd = () => _r[_ri++ % _r.length];

// ── Static Data ───────────────────────────────────────────────────────────────

const ELECTRONIC_TREND = [
  { year: 2010, voice: 80, electronic: 20 },
  { year: 2012, voice: 72, electronic: 28 },
  { year: 2014, voice: 63, electronic: 37 },
  { year: 2016, voice: 54, electronic: 46 },
  { year: 2018, voice: 44, electronic: 56 },
  { year: 2020, voice: 33, electronic: 67 },
  { year: 2022, voice: 25, electronic: 75 },
  { year: 2024, voice: 18, electronic: 82 },
];

const PORTFOLIO_TRADING = [
  { year: 2018, pct: 4 },
  { year: 2019, pct: 7 },
  { year: 2020, pct: 14 },
  { year: 2021, pct: 21 },
  { year: 2022, pct: 28 },
  { year: 2023, pct: 36 },
  { year: 2024, pct: 43 },
];

const PLATFORMS = [
  {
    name: "MarketAxess",
    type: "All-to-All + D2C",
    adv: "$36B",
    focus: "IG Credit",
    color: "text-primary",
    bg: "bg-muted/10",
    border: "border-border",
  },
  {
    name: "Tradeweb",
    type: "D2C + D2D",
    adv: "$28B",
    focus: "Rates & Credit",
    color: "text-primary",
    bg: "bg-muted/10",
    border: "border-border",
  },
  {
    name: "Bloomberg TSOX",
    type: "D2C RFQ",
    adv: "$18B",
    focus: "All Bond Types",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
  },
  {
    name: "ICE BondPoint",
    type: "Streaming / AT",
    adv: "$8B",
    focus: "Retail & HY",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
  },
];

const ALGO_STRATEGIES = [
  {
    id: "aggressive",
    label: "Aggressive / Urgency",
    icon: Zap,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    description: "Execute quickly, minimize market timing risk",
    tactics: ["Cross bid/ask immediately", "Use multiple venues simultaneously", "Accept higher spread cost for speed"],
    bestFor: "Hard deadline trades, corporate event driven",
    spreadImpact: "High",
    timingRisk: "Low",
  },
  {
    id: "passive",
    label: "Passive / TWAP",
    icon: Clock,
    color: "text-primary",
    bg: "bg-muted/10",
    border: "border-border",
    description: "Slice over time, minimize market impact",
    tactics: ["Post at midpoint or better", "Work order over hours/days", "Pull back if adverse price move"],
    bestFor: "Large blocks, illiquid HY, patience available",
    spreadImpact: "Low",
    timingRisk: "High",
  },
  {
    id: "is",
    label: "Implementation Shortfall",
    icon: Target,
    color: "text-primary",
    bg: "bg-muted/10",
    border: "border-border",
    description: "Balance market impact vs timing risk dynamically",
    tactics: ["Dynamic child orders based on liquidity", "Adapt aggression to real-time spread", "Minimize total cost vs arrival price"],
    bestFor: "Medium-size orders, normal market conditions",
    spreadImpact: "Medium",
    timingRisk: "Medium",
  },
];

const TCA_METRICS = [
  { label: "Spread Capture", value: "-2.1 bps", positive: false, desc: "Paid above mid" },
  { label: "Market Impact", value: "-1.8 bps", positive: false, desc: "Price moved against" },
  { label: "Timing Cost", value: "+0.9 bps", positive: true, desc: "Price improved vs arrival" },
  { label: "Opportunity Cost", value: "-0.4 bps", positive: false, desc: "Unfilled partial" },
  { label: "Total TCA", value: "-3.4 bps", positive: false, desc: "vs VWAP benchmark" },
];

const LIQUIDITY_SCORES = [
  { ticker: "AAPL 3.85% 2043", score: 82, label: "Liquid", color: "bg-green-500" },
  { ticker: "JPM 4.25% 2033", score: 75, label: "Liquid", color: "bg-green-500" },
  { ticker: "T 5.15% 2050", score: 61, label: "Moderate", color: "bg-amber-500" },
  { ticker: "TSLA 5.30% 2031 HY", score: 38, label: "Illiquid", color: "bg-orange-500" },
  { ticker: "AMCX 10.5% 2029 HY", score: 19, label: "Distressed", color: "bg-red-500" },
];

// Nelson-Siegel curve parameters
const NS_PARAMS = { beta0: 4.5, beta1: -1.8, beta2: 2.2, tau: 2.5 };
function nelsonSiegel(t: number): number {
  if (t <= 0) return NS_PARAMS.beta0 + NS_PARAMS.beta1;
  const x = t / NS_PARAMS.tau;
  const term1 = NS_PARAMS.beta1 * ((1 - Math.exp(-x)) / x);
  const term2 = NS_PARAMS.beta2 * ((1 - Math.exp(-x)) / x - Math.exp(-x));
  return NS_PARAMS.beta0 + term1 + term2;
}

const NS_MATURITIES = [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30];
const NS_CURVE_POINTS = NS_MATURITIES.map((t) => ({ t, y: nelsonSiegel(t) }));

const FAIR_VALUE_SOURCES = [
  { name: "Dealer Composite", method: "Average of 3+ dealer quotes", accuracy: 88, latency: "~15 min", color: "text-primary" },
  { name: "Bloomberg BVAL", method: "Evaluated pricing engine (multi-source)", accuracy: 91, latency: "~5 min", color: "text-primary" },
  { name: "Matrix Pricing", method: "Interpolate from similar bonds", accuracy: 74, latency: "Real-time", color: "text-amber-400" },
  { name: "Model Price", method: "Theoretical from yield curve + spread", accuracy: 69, latency: "Real-time", color: "text-green-400" },
];

const CREDIT_SPREAD_COMPONENTS = [
  { label: "Risk-Free Rate", bps: 430, color: "#60a5fa", desc: "UST benchmark (5Y)" },
  { label: "Liquidity Premium", bps: 25, color: "#a78bfa", desc: "Compensates for illiquidity vs UST" },
  { label: "Default Premium", bps: 90, color: "#f87171", desc: "Expected loss from default probability" },
  { label: "Risk Premium", bps: 35, color: "#fb923c", desc: "Compensation for default uncertainty" },
];

const BID_ASK_DATA = [
  { segment: "IG (AAA-BBB)", bidAsk: 4, volume: "High", color: "#22c55e" },
  { segment: "HY (BB)", bidAsk: 18, volume: "Medium", color: "#eab308" },
  { segment: "HY (B/CCC)", bidAsk: 45, volume: "Low", color: "#f97316" },
  { segment: "EM Sovereign", bidAsk: 22, volume: "Medium", color: "#a78bfa" },
  { segment: "Distressed", bidAsk: 110, volume: "Very Low", color: "#ef4444" },
];

const CDS_VS_BOND_DATA = [
  { name: "AAPL IG", bondSpread: 42, cdsSpread: 38, basis: -4 },
  { name: "GE IG", bondSpread: 85, cdsSpread: 79, basis: -6 },
  { name: "F BB+", bondSpread: 185, cdsSpread: 202, basis: +17 },
  { name: "DISH B", bondSpread: 520, cdsSpread: 548, basis: +28 },
  { name: "AMC CCC", bondSpread: 890, cdsSpread: 950, basis: +60 },
];

const ALT_DATA_SOURCES = [
  {
    name: "Satellite Imagery",
    signal: "Retail foot traffic, factory utilization",
    lead: "2–4 weeks",
    icon: Globe,
    color: "text-primary",
  },
  {
    name: "Payment Processing",
    signal: "Revenue proxy from card transaction data",
    lead: "1–2 weeks",
    icon: DollarSign,
    color: "text-green-400",
  },
  {
    name: "Web Traffic Analytics",
    signal: "Consumer demand, app downloads, search trends",
    lead: "1 week",
    icon: Activity,
    color: "text-primary",
  },
  {
    name: "Job Postings",
    signal: "Expansion/contraction signal, cost forecast",
    lead: "3–6 weeks",
    icon: TrendingUp,
    color: "text-amber-400",
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 rounded-lg bg-muted/10 shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground/50" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-4", className)}>
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

// ── Tab 1: Electronic Bond Markets ────────────────────────────────────────────

function ElectronicMarketsTab() {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  // SVG dimensions
  const W = 480;
  const H = 160;
  const PAD = { l: 40, r: 10, t: 10, b: 30 };
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;

  const xMin = 2010;
  const xMax = 2024;
  const yMin = 0;
  const yMax = 100;

  const toSvgX = (year: number) => PAD.l + ((year - xMin) / (xMax - xMin)) * iw;
  const toSvgY = (pct: number) => PAD.t + ih - ((pct - yMin) / (yMax - yMin)) * ih;

  const voicePts = ELECTRONIC_TREND.map((d) => `${toSvgX(d.year).toFixed(1)},${toSvgY(d.voice).toFixed(1)}`).join(" ");
  const elecPts = ELECTRONIC_TREND.map((d) => `${toSvgX(d.year).toFixed(1)},${toSvgY(d.electronic).toFixed(1)}`).join(" ");

  // Portfolio trading area chart
  const ptW = 360;
  const ptH = 120;
  const ptPad = { l: 32, r: 8, t: 8, b: 28 };
  const ptIw = ptW - ptPad.l - ptPad.r;
  const ptIh = ptH - ptPad.t - ptPad.b;
  const ptXmin = 2018;
  const ptXmax = 2024;
  const ptYmin = 0;
  const ptYmax = 50;
  const ptX = (y: number) => ptPad.l + ((y - ptXmin) / (ptXmax - ptXmin)) * ptIw;
  const ptY = (v: number) => ptPad.t + ptIh - ((v - ptYmin) / (ptYmax - ptYmin)) * ptIh;
  const ptAreaPath =
    `M${ptX(2018).toFixed(1)},${ptY(0).toFixed(1)} ` +
    PORTFOLIO_TRADING.map((d) => `L${ptX(d.year).toFixed(1)},${ptY(d.pct).toFixed(1)}`).join(" ") +
    ` L${ptX(2024).toFixed(1)},${ptY(0).toFixed(1)} Z`;
  const ptLinePath = PORTFOLIO_TRADING.map((d, i) => `${i === 0 ? "M" : "L"}${ptX(d.year).toFixed(1)},${ptY(d.pct).toFixed(1)}`).join(" ");

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Wifi}
        title="Electronic Bond Markets"
        subtitle="How bond trading shifted from voice to electronic venues over 15 years"
      />

      {/* Voice vs Electronic trend */}
      <InfoCard title="Voice vs Electronic Execution (2010–2024, % of IG credit volume)">
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl h-auto">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((v) => (
              <line
                key={v}
                x1={PAD.l}
                x2={W - PAD.r}
                y1={toSvgY(v)}
                y2={toSvgY(v)}
                stroke="#374151"
                strokeWidth="0.5"
                strokeDasharray="3,3"
              />
            ))}
            {/* Y labels */}
            {[0, 25, 50, 75, 100].map((v) => (
              <text key={v} x={PAD.l - 4} y={toSvgY(v) + 4} textAnchor="end" fontSize="9" fill="#6b7280">
                {v}%
              </text>
            ))}
            {/* X labels */}
            {ELECTRONIC_TREND.filter((_, i) => i % 2 === 0).map((d) => (
              <text key={d.year} x={toSvgX(d.year)} y={H - 4} textAnchor="middle" fontSize="9" fill="#6b7280">
                {d.year}
              </text>
            ))}
            {/* Voice line */}
            <polyline points={voicePts} fill="none" stroke="#f87171" strokeWidth="2" strokeLinejoin="round" />
            {/* Electronic line */}
            <polyline points={elecPts} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
            {/* Dots */}
            {ELECTRONIC_TREND.map((d) => (
              <g key={d.year}>
                <circle cx={toSvgX(d.year)} cy={toSvgY(d.voice)} r="3" fill="#f87171" />
                <circle cx={toSvgX(d.year)} cy={toSvgY(d.electronic)} r="3" fill="#34d399" />
              </g>
            ))}
            {/* Legend */}
            <rect x={PAD.l + 4} y={PAD.t + 4} width="8" height="3" fill="#f87171" rx="1" />
            <text x={PAD.l + 16} y={PAD.t + 8} fontSize="9" fill="#f87171">Voice / Phone</text>
            <rect x={PAD.l + 80} y={PAD.t + 4} width="8" height="3" fill="#34d399" rx="1" />
            <text x={PAD.l + 92} y={PAD.t + 8} fontSize="9" fill="#34d399">Electronic</text>
          </svg>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Electronic trading now represents ~82% of IG credit volume. High-yield and emerging market bonds remain less electronic due to fragmented liquidity.
        </p>
      </InfoCard>

      {/* Platforms */}
      <InfoCard title="All-to-All Trading Platforms">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PLATFORMS.map((p) => (
            <motion.div
              key={p.name}
              className={cn(
                "rounded-lg border p-3 cursor-pointer transition-colors",
                p.bg,
                p.border,
                hoveredPlatform === p.name ? "scale-[1.02]" : ""
              )}
              onHoverStart={() => setHoveredPlatform(p.name)}
              onHoverEnd={() => setHoveredPlatform(null)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn("font-semibold text-sm", p.color)}>{p.name}</span>
                <Badge variant="outline" className="text-xs text-muted-foreground">{p.adv} ADV</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{p.type}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Focus: {p.focus}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">All-to-All:</span> Any participant (buy-side, sell-side, hedge fund) can trade with any other — no dealer intermediary required. Increases competition and often tightens spreads vs D2C (dealer-to-client) model.
          </p>
        </div>
      </InfoCard>

      {/* RFQ Workflow SVG */}
      <InfoCard title="RFQ (Request for Quote) Workflow">
        <svg viewBox="0 0 500 110" className="w-full max-w-lg h-auto">
          {/* Nodes */}
          {[
            { x: 30, label: "Buy Side", sub: "Asset Mgr", color: "#60a5fa" },
            { x: 145, label: "Platform", sub: "MarketAxess", color: "#a78bfa" },
            { x: 260, label: "Dealers", sub: "3-5 Banks", color: "#34d399" },
            { x: 375, label: "Platform", sub: "Aggregates", color: "#a78bfa" },
            { x: 470, label: "Trade", sub: "Executed", color: "#fb923c" },
          ].map((n, i) => (
            <g key={i}>
              <rect
                x={n.x - 28}
                y={28}
                width={56}
                height={36}
                rx="6"
                fill={n.color + "22"}
                stroke={n.color + "66"}
                strokeWidth="1"
              />
              <text x={n.x} y={44} textAnchor="middle" fontSize="8.5" fill={n.color} fontWeight="600">
                {n.label}
              </text>
              <text x={n.x} y={56} textAnchor="middle" fontSize="7.5" fill="#9ca3af">
                {n.sub}
              </text>
            </g>
          ))}
          {/* Arrows */}
          {[
            { x1: 58, x2: 117, label: "RFQ sent" },
            { x1: 173, x2: 232, label: "Request" },
            { x1: 288, x2: 347, label: "Quotes" },
            { x1: 403, x2: 442, label: "Best" },
          ].map((a, i) => (
            <g key={i}>
              <line x1={a.x1} y1={46} x2={a.x2} y2={46} stroke="#4b5563" strokeWidth="1.2" markerEnd="url(#arr)" />
              <text x={(a.x1 + a.x2) / 2} y={40} textAnchor="middle" fontSize="7" fill="#6b7280">
                {a.label}
              </text>
            </g>
          ))}
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#4b5563" />
            </marker>
          </defs>
          {/* Time label */}
          <text x={250} y={95} textAnchor="middle" fontSize="8" fill="#6b7280">
            Typical RFQ response window: 30 seconds — 3 minutes
          </text>
        </svg>
        <p className="text-xs text-muted-foreground mt-2">
          The buy-side initiates an RFQ to multiple dealers simultaneously. Dealers compete on price, and the platform shows the best quote. Winner-takes-all execution model.
        </p>
      </InfoCard>

      {/* Portfolio trading + ETF arb */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Portfolio Trading Growth (% of IG flows)">
          <svg viewBox={`0 0 ${ptW} ${ptH}`} className="w-full max-w-xs h-auto">
            {/* Area */}
            <path d={ptAreaPath} fill="#a78bfa33" />
            <path d={ptLinePath} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
            {/* Y gridlines */}
            {[0, 10, 20, 30, 40, 50].map((v) => (
              <line key={v} x1={ptPad.l} x2={ptW - ptPad.r} y1={ptY(v)} y2={ptY(v)} stroke="#374151" strokeWidth="0.5" strokeDasharray="3,3" />
            ))}
            {/* Y labels */}
            {[0, 20, 40].map((v) => (
              <text key={v} x={ptPad.l - 4} y={ptY(v) + 3} textAnchor="end" fontSize="8" fill="#6b7280">{v}%</text>
            ))}
            {/* X labels */}
            {PORTFOLIO_TRADING.filter((_, i) => i % 2 === 0).map((d) => (
              <text key={d.year} x={ptX(d.year)} y={ptH - 4} textAnchor="middle" fontSize="8" fill="#6b7280">{d.year}</text>
            ))}
            {/* Dots */}
            {PORTFOLIO_TRADING.map((d) => (
              <circle key={d.year} cx={ptX(d.year)} cy={ptY(d.pct)} r="3" fill="#a78bfa" />
            ))}
          </svg>
          <p className="text-xs text-muted-foreground mt-2">
            Portfolio trading lets buy-side execute hundreds of bonds in one transaction with a single spread, reducing implementation risk.
          </p>
        </InfoCard>

        <InfoCard title="Bond ETF Arbitrage Mechanism">
          <div className="space-y-2">
            {[
              { step: "1", text: "ETF trades at premium to NAV", color: "text-green-400" },
              { step: "2", text: "Authorized Participant (AP) buys underlying bonds", color: "text-primary" },
              { step: "3", text: "AP delivers bond basket to ETF issuer", color: "text-primary" },
              { step: "4", text: "AP receives new ETF shares at NAV", color: "text-primary" },
              { step: "5", text: "AP sells ETF shares at premium → profit", color: "text-amber-400" },
              { step: "6", text: "Premium collapses back to NAV", color: "text-green-400" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-2">
                <span className={cn("text-xs text-muted-foreground font-semibold shrink-0 w-4", s.color)}>{s.step}.</span>
                <span className="text-xs text-muted-foreground">{s.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 rounded-lg bg-amber-400/10 border border-amber-400/30">
            <p className="text-xs text-amber-300">
              Bond ETF arbitrage improves price discovery in credit markets — especially during stress when individual bonds trade at wider spreads than the ETF.
            </p>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

// ── Tab 2: Algo Bond Execution ─────────────────────────────────────────────────

function AlgoExecutionTab() {
  const [selectedAlgo, setSelectedAlgo] = useState("is");

  const selected = ALGO_STRATEGIES.find((a) => a.id === selectedAlgo)!;

  // Pre-trade analytics SVG
  const ptaW = 380;
  const ptaH = 130;
  const bars = [
    { label: "1D", value: 65, color: "#22c55e" },
    { label: "5D", value: 48, color: "#84cc16" },
    { label: "10D", value: 35, color: "#eab308" },
    { label: "20D", value: 22, color: "#f97316" },
    { label: "30D", value: 15, color: "#ef4444" },
  ];
  const barW = 44;
  const barGap = 16;
  const startX = 40;
  const maxH = 80;

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Zap}
        title="Algo Bond Execution"
        subtitle="Algorithmic strategies for bond trading — balancing speed, cost, and market impact"
      />

      {/* VWAP/TWAP challenges */}
      <InfoCard title="VWAP / TWAP for Bonds — Unique Challenges vs Equities">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Equity VWAP</p>
            <div className="space-y-1.5">
              {[
                { text: "Continuous price feed", ok: true },
                { text: "Deep, centralized liquidity", ok: true },
                { text: "Millisecond execution", ok: true },
                { text: "Historical volume profile", ok: true },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span className="text-xs text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Bond VWAP Challenges</p>
            <div className="space-y-1.5">
              {[
                { text: "No centralized exchange — fragmented OTC", ok: false },
                { text: "Many bonds trade <5x per day", ok: false },
                { text: "Wide bid-ask spreads (esp. HY)", ok: false },
                { text: "No real-time consolidated tape", ok: false },
                { text: "Dealer inventory varies by firm", ok: false },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 p-2 rounded-lg bg-muted/10 border border-border">
          <p className="text-xs text-primary">
            Bond algos must use <strong>AI-driven liquidity scoring</strong> and <strong>venue fragmentation maps</strong> to approximate VWAP — no single source provides complete market data.
          </p>
        </div>
      </InfoCard>

      {/* Strategy selector */}
      <InfoCard title="Algo Strategy Selector">
        <div className="flex gap-2 mb-4 flex-wrap">
          {ALGO_STRATEGIES.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAlgo(a.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs text-muted-foreground font-medium border transition-colors",
                selectedAlgo === a.id ? cn(a.bg, a.border, a.color) : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={cn("rounded-lg border p-4", selected.bg, selected.border)}
          >
            <div className="flex items-center gap-2 mb-2">
              <selected.icon className={cn("w-4 h-4", selected.color)} />
              <span className={cn("font-medium text-sm", selected.color)}>{selected.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{selected.description}</p>
            <div className="space-y-1 mb-3">
              {selected.tactics.map((t) => (
                <div key={t} className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-xs text-muted-foreground">{t}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="text-muted-foreground">Best for: <span className="text-foreground">{selected.bestFor}</span></span>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="text-muted-foreground">Spread Impact: <span className={cn("font-medium", selected.spreadImpact === "Low" ? "text-green-400" : selected.spreadImpact === "High" ? "text-red-400" : "text-amber-400")}>{selected.spreadImpact}</span></span>
              <span className="text-muted-foreground">Timing Risk: <span className={cn("font-medium", selected.timingRisk === "Low" ? "text-green-400" : selected.timingRisk === "High" ? "text-red-400" : "text-amber-400")}>{selected.timingRisk}</span></span>
            </div>
          </motion.div>
        </AnimatePresence>
      </InfoCard>

      {/* TCA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Transaction Cost Analysis (TCA) Breakdown">
          <div className="space-y-2">
            {TCA_METRICS.map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
                <span className={cn("text-sm font-mono font-medium", m.positive ? "text-green-400" : "text-red-400")}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              TCA measures actual execution cost vs a benchmark (VWAP, arrival price, or midpoint). Regulators increasingly require buy-side firms to demonstrate best execution via TCA reporting.
            </p>
          </div>
        </InfoCard>

        <InfoCard title="Pre-Trade Liquidity Analytics">
          <svg viewBox={`0 0 ${ptaW} ${ptaH}`} className="w-full max-w-sm h-auto">
            {bars.map((b, i) => {
              const bh = (b.value / 100) * maxH;
              const bx = startX + i * (barW + barGap);
              const by = 20 + maxH - bh;
              return (
                <g key={b.label}>
                  <rect x={bx} y={by} width={barW} height={bh} fill={b.color + "99"} stroke={b.color} strokeWidth="1" rx="3" />
                  <text x={bx + barW / 2} y={by - 4} textAnchor="middle" fontSize="8.5" fill={b.color} fontWeight="600">
                    {b.value}%
                  </text>
                  <text x={bx + barW / 2} y={ptaH - 14} textAnchor="middle" fontSize="8" fill="#6b7280">
                    {b.label}
                  </text>
                </g>
              );
            })}
            <text x={15} y={60} textAnchor="middle" fontSize="7.5" fill="#6b7280" transform={`rotate(-90, 15, 60)`}>
              Completion %
            </text>
            <text x={ptaW / 2} y={ptaH} textAnchor="middle" fontSize="7.5" fill="#6b7280">
              Days to complete execution (given 2% ADV limit)
            </text>
          </svg>
          <p className="text-xs text-muted-foreground mt-2">
            Pre-trade analytics estimate how many days are needed to complete an order without moving the market. Key input: bond's average daily volume (ADV).
          </p>
        </InfoCard>
      </div>

      {/* Liquidity scoring */}
      <InfoCard title="AI-Powered Liquidity Scoring (0–100)">
        <div className="space-y-2">
          {LIQUIDITY_SCORES.map((ls) => (
            <div key={ls.ticker} className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground w-44 shrink-0">{ls.ticker}</span>
              <div className="flex-1 rounded-full bg-muted/30 h-2 overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", ls.color)}
                  initial={{ width: 0 }}
                  animate={{ width: `${ls.score}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs w-8 text-right font-mono text-foreground">{ls.score}</span>
              <Badge variant="outline" className={cn("text-xs w-20 justify-center", ls.score >= 60 ? "border-green-500/40 text-green-400" : ls.score >= 30 ? "border-amber-500/40 text-amber-400" : "border-red-500/40 text-red-400")}>
                {ls.label}
              </Badge>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Liquidity score aggregates: TRACE volume, age of last print, bid-ask spread, number of dealers quoting, and ETF inclusion. Scores below 40 require manual execution.
        </p>
      </InfoCard>
    </div>
  );
}

// ── Tab 3: Bond Pricing Models ─────────────────────────────────────────────────

function BondPricingTab() {
  const [selectedFV, setSelectedFV] = useState("Bloomberg BVAL");

  // Nelson-Siegel SVG
  const nsW = 460;
  const nsH = 160;
  const nsPad = { l: 40, r: 10, t: 20, b: 28 };
  const nsIw = nsW - nsPad.l - nsPad.r;
  const nsIh = nsH - nsPad.t - nsPad.b;

  const nsXmin = 0;
  const nsXmax = 30;
  const nsYmin = 1;
  const nsYmax = 5.5;

  const nsX = (t: number) => nsPad.l + ((t - nsXmin) / (nsXmax - nsXmin)) * nsIw;
  const nsY = (y: number) => nsPad.t + nsIh - ((y - nsYmin) / (nsYmax - nsYmin)) * nsIh;

  const nsCurvePath = NS_CURVE_POINTS.map((p, i) => `${i === 0 ? "M" : "L"}${nsX(p.t).toFixed(1)},${nsY(p.y).toFixed(1)}`).join(" ");

  // Level only (horizontal)
  const levelY = NS_PARAMS.beta0;
  // Slope component
  const slopePts = NS_MATURITIES.map((t) => {
    const x2 = t / NS_PARAMS.tau;
    return { t, y: NS_PARAMS.beta0 + NS_PARAMS.beta1 * ((1 - Math.exp(-x2)) / x2) };
  });
  const slopePath = slopePts.map((p, i) => `${i === 0 ? "M" : "L"}${nsX(p.t).toFixed(1)},${nsY(p.y).toFixed(1)}`).join(" ");

  // Bond pricing formula visualization — price vs yield
  const pvW = 340;
  const pvH = 130;
  const pvPad = { l: 44, r: 10, t: 12, b: 28 };
  const pvIw = pvW - pvPad.l - pvPad.r;
  const pvIh = pvH - pvPad.t - pvPad.b;
  const coupon = 4.5;
  const maturity = 10;
  const yieldRange = Array.from({ length: 40 }, (_, i) => 1 + i * 0.2);
  const priceData = yieldRange.map((ytm) => {
    const periods = maturity * 2;
    const c = (1000 * (coupon / 100)) / 2;
    const r = ytm / 100 / 2;
    const price = (c * (1 - Math.pow(1 + r, -periods))) / r + 1000 / Math.pow(1 + r, periods);
    return { ytm, price };
  });
  const pvXmin = 1;
  const pvXmax = 9;
  const pvYmin = 700;
  const pvYmax = 1300;
  const pvX = (ytm: number) => pvPad.l + ((ytm - pvXmin) / (pvXmax - pvXmin)) * pvIw;
  const pvY = (price: number) => pvPad.t + pvIh - ((price - pvYmin) / (pvYmax - pvYmin)) * pvIh;
  const pvPath = priceData
    .filter((d) => d.ytm >= pvXmin && d.ytm <= pvXmax)
    .map((d, i) => `${i === 0 ? "M" : "L"}${pvX(d.ytm).toFixed(1)},${pvY(d.price).toFixed(1)}`)
    .join(" ");

  // OAS flow
  const oasSteps = [
    { label: "Market Price", color: "#60a5fa" },
    { label: "Cash Flow\nProjection", color: "#a78bfa" },
    { label: "Monte Carlo\nRate Paths", color: "#f97316" },
    { label: "Discount at\nRisk-Free + Z", color: "#34d399" },
    { label: "OAS where\nModel = Market", color: "#fb923c" },
  ];

  const selFV = FAIR_VALUE_SOURCES.find((f) => f.name === selectedFV)!;

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Calculator}
        title="Bond Pricing Models"
        subtitle="From yield curve construction to option-adjusted spreads and fair value methodologies"
      />

      {/* Nelson-Siegel */}
      <InfoCard title="Nelson-Siegel Yield Curve (Level / Slope / Curvature)">
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${nsW} ${nsH}`} className="w-full max-w-lg h-auto">
            {/* Grid */}
            {[2, 3, 4, 5].map((v) => (
              <line key={v} x1={nsPad.l} x2={nsW - nsPad.r} y1={nsY(v)} y2={nsY(v)} stroke="#374151" strokeWidth="0.5" strokeDasharray="3,3" />
            ))}
            {[0, 5, 10, 20, 30].map((v) => (
              <line key={v} x1={nsX(v)} x2={nsX(v)} y1={nsPad.t} y2={nsPad.t + nsIh} stroke="#374151" strokeWidth="0.5" strokeDasharray="3,3" />
            ))}
            {/* Y labels */}
            {[2, 3, 4, 5].map((v) => (
              <text key={v} x={nsPad.l - 4} y={nsY(v) + 3} textAnchor="end" fontSize="8.5" fill="#6b7280">{v}%</text>
            ))}
            {/* X labels */}
            {[0, 5, 10, 20, 30].map((v) => (
              <text key={v} x={nsX(v)} y={nsH - 4} textAnchor="middle" fontSize="8.5" fill="#6b7280">{v}Y</text>
            ))}
            {/* Level line */}
            <line x1={nsPad.l} x2={nsW - nsPad.r} y1={nsY(levelY)} y2={nsY(levelY)} stroke="#60a5fa44" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x={nsW - nsPad.r - 2} y={nsY(levelY) - 4} textAnchor="end" fontSize="7.5" fill="#60a5fa88">Level (β₀)</text>
            {/* Slope curve */}
            <path d={slopePath} fill="none" stroke="#34d39966" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x={nsX(3)} y={nsY(slopePts[2].y) - 5} textAnchor="middle" fontSize="7.5" fill="#34d39988">Level+Slope</text>
            {/* Full curve */}
            <path d={nsCurvePath} fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Factor labels */}
            <text x={nsW - nsPad.r - 2} y={nsY(NS_CURVE_POINTS[NS_CURVE_POINTS.length - 1].y) - 4} textAnchor="end" fontSize="7.5" fill="#a78bfa">Full Curve</text>
            {/* Dots at key maturities */}
            {NS_CURVE_POINTS.filter((_, i) => [0, 2, 4, 5, 7, 9].includes(i)).map((p) => (
              <circle key={p.t} cx={nsX(p.t)} cy={nsY(p.y)} r="3" fill="#a78bfa" />
            ))}
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { factor: "Level (β₀)", desc: "Long-run yield level (~30Y rate)", color: "text-primary" },
            { factor: "Slope (β₁)", desc: "Short-run deviation (2Y–30Y spread)", color: "text-green-400" },
            { factor: "Curvature (β₂)", desc: "Hump shape at medium maturities", color: "text-primary" },
          ].map((f) => (
            <div key={f.factor} className="p-2 rounded-lg bg-muted/30 border border-border">
              <p className={cn("text-xs text-muted-foreground font-medium", f.color)}>{f.factor}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </InfoCard>

      {/* Bond pricing convexity */}
      <InfoCard title="Bond Price vs Yield (4.5% coupon, 10Y maturity — convex relationship)">
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${pvW} ${pvH}`} className="w-full max-w-xs h-auto">
            {/* Grid */}
            {[800, 900, 1000, 1100, 1200].map((v) => (
              <line key={v} x1={pvPad.l} x2={pvW - pvPad.r} y1={pvY(v)} y2={pvY(v)} stroke="#374151" strokeWidth="0.5" strokeDasharray="3,3" />
            ))}
            {/* Y labels */}
            {[800, 1000, 1200].map((v) => (
              <text key={v} x={pvPad.l - 4} y={pvY(v) + 3} textAnchor="end" fontSize="8" fill="#6b7280">${v}</text>
            ))}
            {/* X labels */}
            {[2, 4, 6, 8].map((v) => (
              <text key={v} x={pvX(v)} y={pvH - 4} textAnchor="middle" fontSize="8" fill="#6b7280">{v}%</text>
            ))}
            {/* Par line */}
            <line x1={pvPad.l} x2={pvW - pvPad.r} y1={pvY(1000)} y2={pvY(1000)} stroke="#4b556366" strokeWidth="1" strokeDasharray="4,4" />
            <text x={pvPad.l + 4} y={pvY(1000) - 3} fontSize="7.5" fill="#6b7280">Par $1,000</text>
            {/* Price curve */}
            <path d={pvPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
            {/* Coupon yield marker */}
            <circle cx={pvX(coupon)} cy={pvY(1000)} r="4" fill="#f59e0b" stroke="#1f2937" strokeWidth="1.5" />
            <text x={pvX(coupon)} y={pvY(1000) - 8} textAnchor="middle" fontSize="7.5" fill="#f59e0b">Coupon {coupon}%</text>
            {/* X axis label */}
            <text x={(pvPad.l + pvW - pvPad.r) / 2} y={pvH - 0} textAnchor="middle" fontSize="7.5" fill="#6b7280">Yield to Maturity</text>
          </svg>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          The price-yield relationship is convex — price falls less when yields rise than it rises when yields fall by the same amount. This positive convexity benefits bondholders.
        </p>
      </InfoCard>

      {/* OAS flow */}
      <InfoCard title="OAS (Option-Adjusted Spread) Calculation Flow">
        <div className="flex items-center gap-1 flex-wrap">
          {oasSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className="px-2 py-1.5 rounded-lg text-center min-w-[72px]"
                style={{ backgroundColor: step.color + "22", border: `1px solid ${step.color}55` }}
              >
                {step.label.split("\n").map((line, j) => (
                  <p key={j} className="text-xs font-medium" style={{ color: step.color }}>
                    {line}
                  </p>
                ))}
              </div>
              {i < oasSteps.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          OAS strips out the value of embedded options (call/put) from the bond spread — giving a pure credit/liquidity spread comparable across optionable and bullet bonds.
        </p>
      </InfoCard>

      {/* Fair value comparison */}
      <InfoCard title="Fair Value Methodology Comparison">
        <div className="flex gap-2 mb-4 flex-wrap">
          {FAIR_VALUE_SOURCES.map((f) => (
            <button
              key={f.name}
              onClick={() => setSelectedFV(f.name)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs text-muted-foreground font-medium border transition-colors",
                selectedFV === f.name ? "bg-muted/10 border-primary/40 text-primary" : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={selFV.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="rounded-lg border border-border bg-muted/20 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={cn("font-medium text-sm", selFV.color)}>{selFV.name}</span>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>Latency: <span className="text-foreground">{selFV.latency}</span></span>
                <span>Accuracy: <span className="text-foreground">{selFV.accuracy}%</span></span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{selFV.method}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-full bg-muted/30 h-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${selFV.accuracy}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <span className="text-xs font-mono text-foreground w-10 text-right">{selFV.accuracy}%</span>
            </div>
          </motion.div>
        </AnimatePresence>
        <p className="text-xs text-muted-foreground mt-3">
          Matrix pricing is used for bonds that rarely trade — interpolating from a universe of similar bonds by duration, credit rating, and sector.
        </p>
      </InfoCard>
    </div>
  );
}

// ── Tab 4: Credit Market Structure ────────────────────────────────────────────

function CreditStructureTab() {
  // Stacked bar SVG for spread decomposition
  const sbW = 280;
  const sbH = 200;
  const sbPad = { l: 10, r: 80, t: 12, b: 24 };
  const sbIh = sbH - sbPad.t - sbPad.b;
  const total = CREDIT_SPREAD_COMPONENTS.reduce((s, c) => s + c.bps, 0);
  let cumY = sbPad.t;
  const stackedBars = CREDIT_SPREAD_COMPONENTS.map((c) => {
    const h = (c.bps / total) * sbIh;
    const y = cumY;
    cumY += h;
    return { ...c, y, h };
  });

  // Bid-ask comparison bar chart
  const baW = 380;
  const baH = 140;
  const baPad = { l: 100, r: 16, t: 12, b: 28 };
  const baIw = baW - baPad.l - baPad.r;
  const baMaxVal = 120;
  const baH2 = baH - baPad.t - baPad.b;
  const baBarH = baH2 / BID_ASK_DATA.length - 4;

  // CDS vs Bond SVG
  const cdsW = 380;
  const cdsH = 150;
  const cdsPad = { l: 70, r: 16, t: 16, b: 32 };
  const cdsIw = cdsW - cdsPad.l - cdsPad.r;
  const cdsIh = cdsH - cdsPad.t - cdsPad.b;
  const cdsXmin = 0;
  const cdsXmax = CDS_VS_BOND_DATA.length - 1;
  const cdsYmin = 0;
  const cdsYmax = 1000;
  const cdsX = (i: number) => cdsPad.l + (i / cdsXmax) * cdsIw;
  const cdsY = (v: number) => cdsPad.t + cdsIh - ((v - cdsYmin) / (cdsYmax - cdsYmin)) * cdsIh;
  const bondPath = CDS_VS_BOND_DATA.map((d, i) => `${i === 0 ? "M" : "L"}${cdsX(i).toFixed(1)},${cdsY(d.bondSpread).toFixed(1)}`).join(" ");
  const cdsPath = CDS_VS_BOND_DATA.map((d, i) => `${i === 0 ? "M" : "L"}${cdsX(i).toFixed(1)},${cdsY(d.cdsSpread).toFixed(1)}`).join(" ");

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Network}
        title="Credit Market Structure"
        subtitle="How credit markets are structured, priced, and regulated — and what drives trading dynamics"
      />

      {/* Spread decomposition */}
      <InfoCard title="Credit Spread Decomposition (IG Corporate Bond ~580 bps total yield)">
        <div className="flex gap-3 items-start">
          <div className="flex-shrink-0">
            <svg viewBox={`0 0 ${sbW} ${sbH}`} className="h-48 w-auto">
              <rect x={sbPad.l + 40} y={sbPad.t} width={60} height={sbIh} fill="#1f2937" rx="4" />
              {stackedBars.map((b) => (
                <g key={b.label}>
                  <rect
                    x={sbPad.l + 40}
                    y={b.y}
                    width={60}
                    height={b.h}
                    fill={b.color + "cc"}
                    stroke={b.color}
                    strokeWidth="0.5"
                  />
                  <line x1={sbPad.l + 104} y1={b.y + b.h / 2} x2={sbPad.l + 110} y2={b.y + b.h / 2} stroke={b.color} strokeWidth="0.8" />
                  <text x={sbPad.l + 113} y={b.y + b.h / 2 + 3} fontSize="8" fill={b.color} fontWeight="500">
                    {b.label} ({b.bps} bps)
                  </text>
                </g>
              ))}
              <text x={sbPad.l + 70} y={sbH - 4} textAnchor="middle" fontSize="8" fill="#6b7280">
                Total: {total} bps
              </text>
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            {CREDIT_SPREAD_COMPONENTS.map((c) => (
              <div key={c.label} className="rounded-lg p-2" style={{ backgroundColor: c.color + "11", border: `1px solid ${c.color}33` }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium" style={{ color: c.color }}>{c.label}</span>
                  <span className="text-xs font-mono" style={{ color: c.color }}>{c.bps} bps</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </InfoCard>

      {/* Bid-ask comparison */}
      <InfoCard title="Bid-Ask Spread by Credit Segment (bps)">
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${baW} ${baH}`} className="w-full max-w-md h-auto">
            {BID_ASK_DATA.map((d, i) => {
              const bw = (d.bidAsk / baMaxVal) * baIw;
              const by = baPad.t + i * (baBarH + 4);
              return (
                <g key={d.segment}>
                  <text x={baPad.l - 6} y={by + baBarH / 2 + 3} textAnchor="end" fontSize="8" fill="#9ca3af">
                    {d.segment}
                  </text>
                  <rect x={baPad.l} y={by} width={baIw} height={baBarH} fill="#1f2937" rx="3" />
                  <rect x={baPad.l} y={by} width={bw} height={baBarH} fill={d.color + "cc"} stroke={d.color} strokeWidth="0.5" rx="3" />
                  <text x={baPad.l + bw + 4} y={by + baBarH / 2 + 3} fontSize="8" fill={d.color} fontWeight="600">
                    {d.bidAsk} bps
                  </text>
                </g>
              );
            })}
            <text x={(baPad.l + baW - baPad.r) / 2} y={baH} textAnchor="middle" fontSize="7.5" fill="#6b7280">
              Typical bid-ask spread (basis points of price)
            </text>
          </svg>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Distressed bonds can have bid-ask spreads exceeding 200–500 bps during stress. IG bonds trade much tighter due to dealer market-making and electronic platforms.
        </p>
      </InfoCard>

      {/* CDS vs Bond basis */}
      <InfoCard title="CDS vs Bond Spread Basis">
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${cdsW} ${cdsH}`} className="w-full max-w-md h-auto">
            {/* Grid */}
            {[0, 250, 500, 750, 1000].map((v) => (
              <line key={v} x1={cdsPad.l} x2={cdsW - cdsPad.r} y1={cdsY(v)} y2={cdsY(v)} stroke="#374151" strokeWidth="0.5" strokeDasharray="3,3" />
            ))}
            {/* Y labels */}
            {[0, 500, 1000].map((v) => (
              <text key={v} x={cdsPad.l - 4} y={cdsY(v) + 3} textAnchor="end" fontSize="8" fill="#6b7280">{v}</text>
            ))}
            {/* X labels */}
            {CDS_VS_BOND_DATA.map((d, i) => (
              <text key={d.name} x={cdsX(i)} y={cdsH - 4} textAnchor="middle" fontSize="7.5" fill="#9ca3af">
                {d.name}
              </text>
            ))}
            {/* Bond spread line */}
            <path d={bondPath} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinejoin="round" />
            {/* CDS line */}
            <path d={cdsPath} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3" />
            {/* Dots */}
            {CDS_VS_BOND_DATA.map((d, i) => (
              <g key={d.name}>
                <circle cx={cdsX(i)} cy={cdsY(d.bondSpread)} r="3" fill="#60a5fa" />
                <circle cx={cdsX(i)} cy={cdsY(d.cdsSpread)} r="3" fill="#f97316" />
              </g>
            ))}
            {/* Basis annotations */}
            {CDS_VS_BOND_DATA.map((d, i) => (
              <text key={`basis-${i}`} x={cdsX(i)} y={Math.min(cdsY(d.bondSpread), cdsY(d.cdsSpread)) - 6} textAnchor="middle" fontSize="7" fill={d.basis > 0 ? "#f97316" : "#60a5fa"}>
                {d.basis > 0 ? "+" : ""}{d.basis}
              </text>
            ))}
            {/* Legend */}
            <line x1={cdsPad.l + 4} x2={cdsPad.l + 20} y1={cdsPad.t + 4} y2={cdsPad.t + 4} stroke="#60a5fa" strokeWidth="2" />
            <text x={cdsPad.l + 24} y={cdsPad.t + 7} fontSize="8" fill="#60a5fa">Bond Spread</text>
            <line x1={cdsPad.l + 90} x2={cdsPad.l + 106} y1={cdsPad.t + 4} y2={cdsPad.t + 4} stroke="#f97316" strokeWidth="2" strokeDasharray="5,3" />
            <text x={cdsPad.l + 110} y={cdsPad.t + 7} fontSize="8" fill="#f97316">CDS Spread</text>
            {/* Y label */}
            <text x={10} y={cdsPad.t + cdsIh / 2} textAnchor="middle" fontSize="7.5" fill="#6b7280" transform={`rotate(-90, 10, ${cdsPad.t + cdsIh / 2})`}>
              Spread (bps)
            </text>
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="p-2 rounded-lg bg-muted/10 border border-border">
            <p className="text-xs font-medium text-primary">Negative Basis (IG)</p>
            <p className="text-xs text-muted-foreground mt-1">CDS tighter than bond — bond is "cheap" vs CDS. Dealers short CDS and buy bonds to capture the basis (negative basis trade).</p>
          </div>
          <div className="p-2 rounded-lg bg-orange-400/10 border border-orange-400/30">
            <p className="text-xs font-medium text-orange-400">Positive Basis (HY)</p>
            <p className="text-xs text-muted-foreground mt-1">CDS wider than bond — protection is expensive. Typical in stressed credits where buying bond is difficult (liquidity) vs CDS.</p>
          </div>
        </div>
      </InfoCard>

      {/* Regulation impact + Alternative data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Regulatory Impact on Dealer Inventory">
          <div className="space-y-3">
            {[
              {
                reg: "Dodd-Frank / Volcker Rule",
                impact: "Banned proprietary trading at banks",
                result: "Dealer inventory -60% since 2010",
                color: "text-red-400",
                bg: "bg-red-400/10",
                border: "border-red-400/30",
              },
              {
                reg: "Basel III / IV Capital Rules",
                impact: "Higher capital charges on credit assets",
                result: "Dealers hold shorter duration, less HY",
                color: "text-amber-400",
                bg: "bg-amber-400/10",
                border: "border-amber-400/30",
              },
              {
                reg: "MiFID II (Europe)",
                impact: "Pre/post-trade transparency mandates",
                result: "Increased electronic adoption in EUR credit",
                color: "text-primary",
                bg: "bg-muted/10",
                border: "border-border",
              },
            ].map((r) => (
              <div key={r.reg} className={cn("rounded-lg border p-2.5", r.bg, r.border)}>
                <p className={cn("text-xs text-muted-foreground font-medium", r.color)}>{r.reg}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.impact}</p>
                <p className="text-xs text-foreground/70 mt-0.5 font-medium">{r.result}</p>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Alternative Data for Credit Analysis">
          <div className="space-y-3">
            {ALT_DATA_SOURCES.map((src) => (
              <div key={src.name} className="flex items-start gap-3 p-2 rounded-lg bg-muted/20 border border-border">
                <src.icon className={cn("w-4 h-4 shrink-0 mt-0.5", src.color)} />
                <div>
                  <p className={cn("text-xs text-muted-foreground font-medium", src.color)}>{src.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{src.signal}</p>
                  <p className="text-xs text-muted-foreground">Lead time: <span className="text-foreground">{src.lead}</span></p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 rounded-lg bg-muted/10 border border-border">
            <p className="text-xs text-primary">
              Alt data provides an edge in early detection of credit deterioration before it appears in quarterly financials — especially valuable for high-yield and leveraged loan analysis.
            </p>
          </div>
        </InfoCard>
      </div>

      {/* IG vs HY dynamics */}
      <InfoCard title="Investment Grade vs High Yield Trading Dynamics">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              grade: "Investment Grade (BBB- and above)",
              color: "text-green-400",
              bg: "bg-green-400/10",
              border: "border-green-400/30",
              traits: [
                "Trades primarily on spread vs UST",
                "High electronic adoption (80%+)",
                "Portfolio trading widely used",
                "Deep ETF market (LQD, VCIT)",
                "Mainly rate-sensitive vs equity-correlated",
                "Average ticket: $5M–$50M",
              ],
            },
            {
              grade: "High Yield (BB and below)",
              color: "text-orange-400",
              bg: "bg-orange-400/10",
              border: "border-orange-400/30",
              traits: [
                "Trades more like equity — credit spread dominant",
                "Still mostly voice / dealer-driven",
                "Smaller ticket sizes, wider spreads",
                "CDS market more liquid than cash for single names",
                "Strong ETF influence (HYG, JNK)",
                "Stress periods: electronic execution collapses",
              ],
            },
          ].map((g) => (
            <div key={g.grade} className={cn("rounded-lg border p-3", g.bg, g.border)}>
              <p className={cn("text-xs text-muted-foreground font-medium mb-2", g.color)}>{g.grade}</p>
              <div className="space-y-1">
                {g.traits.map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function FixedIncomeTechPage() {
  // Consume rnd to avoid unused variable warning
  void rnd;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 border-l-4 border-l-primary rounded-lg bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-md bg-muted/10">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Fixed Income Technology &amp; Electronic Trading</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                How technology transformed bond markets — from voice to algo, from opaque to transparent
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge variant="outline" className="text-xs border-primary/40 text-primary">Electronic Trading</Badge>
            <Badge variant="outline" className="text-xs border-primary/40 text-primary">Algo Execution</Badge>
            <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400">Pricing Models</Badge>
            <Badge variant="outline" className="text-xs border-green-500/40 text-green-400">Credit Structure</Badge>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="electronic" className="mt-8">
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="electronic" className="text-xs text-muted-foreground">
              <Wifi className="w-3.5 h-3.5 mr-1.5" />
              Electronic Markets
            </TabsTrigger>
            <TabsTrigger value="algo" className="text-xs text-muted-foreground">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Algo Execution
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs text-muted-foreground">
              <Calculator className="w-3.5 h-3.5 mr-1.5" />
              Pricing Models
            </TabsTrigger>
            <TabsTrigger value="credit" className="text-xs text-muted-foreground">
              <Network className="w-3.5 h-3.5 mr-1.5" />
              Credit Structure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="electronic" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ElectronicMarketsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="algo" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlgoExecutionTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="pricing" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BondPricingTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="credit" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CreditStructureTab />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
