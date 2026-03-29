"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  BarChart3,
  Activity,
  AlertTriangle,
  Shield,
  Zap,
  Clock,
  DollarSign,
  Info,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Network,
  Lock,
  Layers,
  Scale,
  BookOpen,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 662008;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _r: number[] = [];
for (let i = 0; i < 300; i++) _r.push(rand());
let _ri = 0;
const rnd = () => _r[_ri++ % _r.length];

// ── Types ──────────────────────────────────────────────────────────────────────
interface DarkPool {
  name: string;
  operator: string;
  volume: number; // billions per day
  share: number; // % of total dark pool volume
  type: "Broker-Dealer" | "Exchange-Owned" | "Independent";
  founded: number;
  color: string;
  description: string;
}

interface OrderType {
  name: string;
  abbr: string;
  description: string;
  useCase: string;
  fillProbability: string;
  priceImpact: "None" | "Low" | "Medium" | "High";
  complexity: "Basic" | "Intermediate" | "Advanced";
  darkPoolFriendly: boolean;
}

interface HFTEvent {
  year: number;
  title: string;
  description: string;
  type: "regulation" | "incident" | "technology" | "research";
  color: string;
}

interface ToxicityMetric {
  metric: string;
  lit: number;
  dark: number;
  unit: string;
  lowerIsBetter: boolean;
}

// ── Data ───────────────────────────────────────────────────────────────────────
const DARK_POOLS: DarkPool[] = [
  {
    name: "Virtu Matchit",
    operator: "Virtu Financial",
    volume: 4.8,
    share: 17.2,
    type: "Broker-Dealer",
    founded: 2012,
    color: "#3b82f6",
    description: "Largest ATS by volume; electronic market maker with proprietary flow.",
  },
  {
    name: "Goldman Sigma X",
    operator: "Goldman Sachs",
    volume: 3.9,
    share: 14.0,
    type: "Broker-Dealer",
    founded: 2000,
    color: "#8b5cf6",
    description: "Premier institutional dark pool with sophisticated matching algorithms.",
  },
  {
    name: "MS Pool (MSPL)",
    operator: "Morgan Stanley",
    volume: 3.2,
    share: 11.4,
    type: "Broker-Dealer",
    founded: 2001,
    color: "#06b6d4",
    description: "Focus on block trade facilitation and institutional client flow.",
  },
  {
    name: "UBS PIN / MTF",
    operator: "UBS",
    volume: 2.7,
    share: 9.7,
    type: "Broker-Dealer",
    founded: 1999,
    color: "#10b981",
    description: "Price improvement network with European and US operations.",
  },
  {
    name: "Credit Suisse Crossfinder",
    operator: "Credit Suisse / UBS",
    volume: 2.1,
    share: 7.5,
    type: "Broker-Dealer",
    founded: 2004,
    color: "#f59e0b",
    description: "Global ATS with advanced algorithmic matching; absorbed into UBS.",
  },
  {
    name: "Liquidnet",
    operator: "Liquidnet Holdings",
    volume: 1.8,
    share: 6.4,
    type: "Independent",
    founded: 2001,
    color: "#ec4899",
    description: "Buy-side only network focused on institutional block trades.",
  },
  {
    name: "IEX Dark",
    operator: "IEX Group",
    volume: 1.5,
    share: 5.4,
    type: "Exchange-Owned",
    founded: 2013,
    color: "#14b8a6",
    description: "Speed bump (350 microsecond delay) protects from latency arbitrage.",
  },
  {
    name: "CBOE BIDS",
    operator: "CBOE Global Markets",
    volume: 1.3,
    share: 4.6,
    type: "Exchange-Owned",
    founded: 2008,
    color: "#f97316",
    description: "Block discovery and negotiation platform for institutional orders.",
  },
  {
    name: "Instinet CBX",
    operator: "Instinet (Nomura)",
    volume: 1.1,
    share: 3.9,
    type: "Independent",
    founded: 2006,
    color: "#a855f7",
    description: "Agency broker ATS; no proprietary trading conflicts.",
  },
  {
    name: "ITG POSIT",
    operator: "Virtu ITG",
    volume: 0.9,
    share: 3.2,
    type: "Independent",
    founded: 1987,
    color: "#ef4444",
    description: "One of the oldest ATS; scheduled crossing sessions at midpoint.",
  },
];

const ORDER_TYPES: OrderType[] = [
  {
    name: "Immediate-Or-Cancel",
    abbr: "IOC",
    description: "Fill as much as possible immediately; cancel any unfilled remainder.",
    useCase: "Liquidity sweeps, best execution algorithms needing fast partial fills.",
    fillProbability: "30–70%",
    priceImpact: "Medium",
    complexity: "Basic",
    darkPoolFriendly: true,
  },
  {
    name: "Fill-Or-Kill",
    abbr: "FOK",
    description: "Fill the entire order immediately or cancel entirely — no partial fills.",
    useCase: "Block trades where partial execution is unacceptable or creates risk.",
    fillProbability: "10–40%",
    priceImpact: "Low",
    complexity: "Basic",
    darkPoolFriendly: true,
  },
  {
    name: "Hidden / Reserve Order",
    abbr: "HID",
    description: "Order rests in the book invisibly; only displayed quantity shown if any.",
    useCase: "Institutional orders where revealing size would move the market against you.",
    fillProbability: "40–80%",
    priceImpact: "None",
    complexity: "Intermediate",
    darkPoolFriendly: true,
  },
  {
    name: "Midpoint Peg",
    abbr: "MPO",
    description: "Order continuously pegged to NBBO midpoint; captures half the spread.",
    useCase: "Price-improvement seeking; best for liquid stocks with tight spreads.",
    fillProbability: "50–85%",
    priceImpact: "None",
    complexity: "Intermediate",
    darkPoolFriendly: true,
  },
  {
    name: "Volume-Weighted Avg Price",
    abbr: "VWAP",
    description: "Algorithm slices order throughout day, targeting the daily VWAP benchmark.",
    useCase: "Pension funds, index rebalancing; minimizes market impact over time.",
    fillProbability: "95–100%",
    priceImpact: "Low",
    complexity: "Advanced",
    darkPoolFriendly: false,
  },
  {
    name: "Time-Weighted Avg Price",
    abbr: "TWAP",
    description: "Splits order into equal time slices regardless of volume distribution.",
    useCase: "Predictable execution profile; useful when volume pattern is uncertain.",
    fillProbability: "95–100%",
    priceImpact: "Low",
    complexity: "Advanced",
    darkPoolFriendly: false,
  },
  {
    name: "Discretionary Limit",
    abbr: "DL",
    description: "Limit order with a discretionary range broker may use to improve fill.",
    useCase: "When willing to pay slightly more or accept slightly less for execution.",
    fillProbability: "60–90%",
    priceImpact: "Low",
    complexity: "Intermediate",
    darkPoolFriendly: true,
  },
  {
    name: "Post-Only Limit",
    abbr: "POST",
    description: "Cancels if it would cross the market; ensures maker fee and adds liquidity.",
    useCase: "Market-making strategies, fee-sensitive passive trading.",
    fillProbability: "20–60%",
    priceImpact: "None",
    complexity: "Intermediate",
    darkPoolFriendly: false,
  },
];

const HFT_TIMELINE: HFTEvent[] = [
  {
    year: 1998,
    title: "Reg ATS Enacted",
    description: "SEC Regulation ATS creates legal framework for alternative trading systems.",
    type: "regulation",
    color: "#3b82f6",
  },
  {
    year: 2005,
    title: "Reg NMS Passed",
    description: "National Market System rules mandate best execution; fuels ATS growth.",
    type: "regulation",
    color: "#3b82f6",
  },
  {
    year: 2007,
    title: "Flash Trading Emerges",
    description: "HFT firms exploit 30-millisecond flash order preview window on exchanges.",
    type: "incident",
    color: "#ef4444",
  },
  {
    year: 2009,
    title: "Quote Stuffing Documented",
    description: "Researchers document thousands of orders/second designed to delay competitors.",
    type: "research",
    color: "#f59e0b",
  },
  {
    year: 2010,
    title: "Flash Crash",
    description: "Dow drops 1,000 points in minutes; HFT liquidity withdrawal blamed.",
    type: "incident",
    color: "#ef4444",
  },
  {
    year: 2013,
    title: "IEX Founded",
    description: "Brad Katsuyama launches IEX with 350-microsecond speed bump to blunt HFT.",
    type: "technology",
    color: "#10b981",
  },
  {
    year: 2014,
    title: "Flash Boys Published",
    description: "Michael Lewis book triggers congressional scrutiny of dark pools and HFT.",
    type: "research",
    color: "#f59e0b",
  },
  {
    year: 2015,
    title: "Dark Pool Fines",
    description: "Barclays fined $70M for misrepresenting Sigma X dark pool to investors.",
    type: "incident",
    color: "#ef4444",
  },
  {
    year: 2016,
    title: "Reg ATS Amendments",
    description: "SEC proposes enhanced disclosure requirements for ATS operators.",
    type: "regulation",
    color: "#3b82f6",
  },
  {
    year: 2021,
    title: "Meme Stock Volatility",
    description: "GameStop episode exposes internalization and payment for order flow concerns.",
    type: "incident",
    color: "#ef4444",
  },
  {
    year: 2022,
    title: "SEC Best Execution Proposal",
    description: "SEC proposes sweeping reforms to order routing and best execution standards.",
    type: "regulation",
    color: "#3b82f6",
  },
  {
    year: 2024,
    title: "AI Market Surveillance",
    description: "Exchanges deploy ML systems to detect manipulative order patterns in real time.",
    type: "technology",
    color: "#10b981",
  },
];

const TOXICITY_METRICS: ToxicityMetric[] = [
  { metric: "Bid-Ask Spread (bps)", lit: 8.4, dark: 0, unit: "bps", lowerIsBetter: true },
  { metric: "Market Impact (bps per $1M)", lit: 12.1, dark: 4.8, unit: "bps", lowerIsBetter: true },
  { metric: "Price Reversion (5-min)", lit: 3.2, dark: 1.4, unit: "bps", lowerIsBetter: true },
  { metric: "Information Leakage Score", lit: 72, dark: 28, unit: "/100", lowerIsBetter: true },
  { metric: "Fill Rate for Block Orders", lit: 43, dark: 81, unit: "%", lowerIsBetter: false },
  { metric: "Price Improvement Rate", lit: 22, dark: 58, unit: "%", lowerIsBetter: false },
  { metric: "Implementation Shortfall", lit: 18.5, dark: 7.2, unit: "bps", lowerIsBetter: true },
  { metric: "Adverse Selection Rate", lit: 31, dark: 19, unit: "%", lowerIsBetter: true },
];

const PRICE_IMPROVEMENT_DATA = [
  { pool: "IEX Dark", improvementBps: 2.1, fillRate: 68, avgSize: 420 },
  { pool: "Sigma X", improvementBps: 1.8, fillRate: 74, avgSize: 1240 },
  { pool: "Liquidnet", improvementBps: 1.4, fillRate: 81, avgSize: 8600 },
  { pool: "MS Pool", improvementBps: 1.6, fillRate: 71, avgSize: 950 },
  { pool: "Virtu Matchit", improvementBps: 0.9, fillRate: 63, avgSize: 310 },
  { pool: "POSIT", improvementBps: 1.2, fillRate: 77, avgSize: 2100 },
];

// ── Component helpers ──────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center bg-neutral-800/60 rounded-lg px-4 py-3 border border-neutral-700/50">
      <span className={cn("text-xl font-bold tabular-nums", color ?? "text-white")}>
        {value}
      </span>
      <span className="text-xs text-neutral-400 mt-0.5 text-center">{label}</span>
    </div>
  );
}

// ── Tab 1: Dark Pool Landscape ─────────────────────────────────────────────────
function DarkPoolLandscapeTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedPool = DARK_POOLS.find((d) => d.name === selected);

  // Pre-generate sparkline data for each pool
  const sparklines = useMemo(() => {
    return DARK_POOLS.map((pool) => {
      const base = pool.volume;
      return Array.from({ length: 20 }, (_, i) => {
        const v = base + (rnd() - 0.5) * base * 0.4;
        return { x: i, y: v };
      });
    });
  }, []);

  const totalVolume = DARK_POOLS.reduce((a, b) => a + b.volume, 0);

  // Donut chart
  const DONUT_R = 90;
  const DONUT_CX = 160;
  const DONUT_CY = 160;
  let cumAngle = -Math.PI / 2;
  const donutSlices = DARK_POOLS.map((p) => {
    const angle = (p.share / 100) * 2 * Math.PI;
    const x1 = DONUT_CX + DONUT_R * Math.cos(cumAngle);
    const y1 = DONUT_CY + DONUT_R * Math.sin(cumAngle);
    const x2 = DONUT_CX + DONUT_R * Math.cos(cumAngle + angle);
    const y2 = DONUT_CY + DONUT_R * Math.sin(cumAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const midAngle = cumAngle + angle / 2;
    const lx = DONUT_CX + (DONUT_R + 20) * Math.cos(midAngle);
    const ly = DONUT_CY + (DONUT_R + 20) * Math.sin(midAngle);
    const slice = {
      pool: p,
      path: `M ${DONUT_CX} ${DONUT_CY} L ${x1} ${y1} A ${DONUT_R} ${DONUT_R} 0 ${large} 1 ${x2} ${y2} Z`,
      lx,
      ly,
      midAngle,
    };
    cumAngle += angle;
    return slice;
  });

  // ATS vs Exchange comparison bars
  const comparisons = [
    { label: "Dark Pools & ATS", share: 38.2, color: "#6366f1" },
    { label: "NYSE Group", share: 23.4, color: "#3b82f6" },
    { label: "NASDAQ Group", share: 19.8, color: "#8b5cf6" },
    { label: "CBOE Group", share: 14.1, color: "#06b6d4" },
    { label: "IEX & Other Lit", share: 4.5, color: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="ATS Registered" value="~60" color="text-blue-400" />
        <StatChip label="Daily Dark Volume" value="$27.8B" color="text-purple-400" />
        <StatChip label="% of US Equity Vol" value="~38%" color="text-cyan-400" />
        <StatChip label="Avg Block Size" value="$1.4M" color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Dark Pool Market Share
          </h3>
          <svg viewBox="0 0 320 320" className="w-full max-h-64">
            {donutSlices.map((slice) => (
              <path
                key={slice.pool.name}
                d={slice.path}
                fill={slice.pool.name === selected ? slice.pool.color : slice.pool.color + "cc"}
                stroke="#1a1a2e"
                strokeWidth={2}
                className="cursor-pointer transition-all"
                onClick={() => setSelected(slice.pool.name === selected ? null : slice.pool.name)}
              />
            ))}
            {/* Inner circle */}
            <circle cx={DONUT_CX} cy={DONUT_CY} r={52} fill="#171717" />
            <text
              x={DONUT_CX}
              y={DONUT_CY - 8}
              textAnchor="middle"
              className="fill-white text-xs font-bold"
              fontSize={11}
              fontWeight="bold"
              fill="white"
            >
              Total
            </text>
            <text
              x={DONUT_CX}
              y={DONUT_CY + 10}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fill="#93c5fd"
            >
              ${totalVolume.toFixed(1)}B
            </text>
            <text
              x={DONUT_CX}
              y={DONUT_CY + 26}
              textAnchor="middle"
              fontSize={9}
              fill="#6b7280"
            >
              daily avg
            </text>
          </svg>
        </div>

        {/* Rankings table */}
        <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Top 10 Dark Pools by Volume
          </h3>
          <div className="space-y-1.5 overflow-y-auto max-h-64 pr-1">
            {DARK_POOLS.map((pool, i) => (
              <motion.div
                key={pool.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors",
                  selected === pool.name
                    ? "bg-neutral-700/70 border border-neutral-600"
                    : "hover:bg-neutral-700/40 border border-transparent"
                )}
                onClick={() => setSelected(selected === pool.name ? null : pool.name)}
              >
                <span className="text-xs text-neutral-500 w-4 tabular-nums">{i + 1}</span>
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: pool.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{pool.name}</div>
                  <div className="text-xs text-neutral-500">{pool.operator}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-white tabular-nums">
                    ${pool.volume}B
                  </div>
                  <div className="text-xs text-neutral-400">{pool.share}%</div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[11px] px-1.5 py-0 border-neutral-600 text-neutral-400 shrink-0"
                >
                  {pool.type === "Broker-Dealer" ? "BD" : pool.type === "Exchange-Owned" ? "EX" : "IND"}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected pool detail */}
      <AnimatePresence>
        {selectedPool && (
          <motion.div
            key={selectedPool.name}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl p-4 border"
              style={{ borderColor: selectedPool.color + "44", background: selectedPool.color + "11" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: selectedPool.color + "33" }}
                >
                  <EyeOff className="w-4 h-4" style={{ color: selectedPool.color }} />
                </div>
                <div>
                  <div className="font-semibold text-white">{selectedPool.name}</div>
                  <div className="text-xs text-neutral-400">
                    {selectedPool.operator} · Founded {selectedPool.founded} · {selectedPool.type}
                  </div>
                </div>
              </div>
              <p className="text-sm text-neutral-300">{selectedPool.description}</p>
              {/* Sparkline */}
              <div className="mt-3">
                {(() => {
                  const idx = DARK_POOLS.findIndex((d) => d.name === selectedPool.name);
                  const data = sparklines[idx];
                  const maxY = Math.max(...data.map((d) => d.y));
                  const minY = Math.min(...data.map((d) => d.y));
                  const scaleY = (v: number) => 40 - ((v - minY) / (maxY - minY + 0.001)) * 36;
                  const pts = data.map((d, i) => `${(i / 19) * 280},${scaleY(d.y)}`).join(" ");
                  return (
                    <svg viewBox="0 0 280 44" className="w-full h-12">
                      <polyline
                        points={pts}
                        fill="none"
                        stroke={selectedPool.color}
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  );
                })()}
                <div className="text-xs text-neutral-500 text-center">
                  Simulated 20-day volume trend · ${selectedPool.volume}B avg/day
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ATS vs Exchange comparison */}
      <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          US Equity Volume Distribution (ATS vs Lit Exchanges)
        </h3>
        <div className="space-y-3">
          {comparisons.map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <div className="w-32 text-xs text-neutral-300 shrink-0">{c.label}</div>
              <div className="flex-1 bg-neutral-700/40 rounded-full h-5 relative overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: c.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${c.share}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div className="text-xs font-semibold text-white w-10 text-right tabular-nums">
                {c.share}%
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-neutral-500 mt-3">
          Source: FINRA ATS Transparency Data, CBOE Market Statistics (2024 estimates).
        </p>
      </div>
    </div>
  );
}

// ── Tab 2: Why Dark Pools Exist ────────────────────────────────────────────────
function WhyDarkPoolsTab() {
  const [activeReason, setActiveReason] = useState<number>(0);

  const reasons = [
    {
      icon: <EyeOff className="w-5 h-5" />,
      title: "Information Leakage",
      color: "#ef4444",
      content: `When a large order appears on a lit exchange, other market participants — including HFT firms — immediately see it. This information leakage causes prices to move adversely before the full order is filled. A $50M buy order on Nasdaq might cause the stock to rise 0.5–1.0% before completion, costing the institution $250K–$500K in slippage alone. Dark pools hide order size and intent until after execution.`,
      stats: [
        { label: "Avg slippage on lit markets", value: "18 bps" },
        { label: "Dark pool reduction", value: "~60%" },
        { label: "Block order threshold", value: ">$200K" },
      ],
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: "Market Impact",
      color: "#f59e0b",
      content: `Market impact is the price movement caused by a large order itself. The larger the order relative to daily volume, the greater the impact. For a $100M trade in a stock with $500M daily volume (20% participation rate), lit market impact can exceed 100 basis points. Dark pools allow participation without broadcasting, reducing permanent price impact by routing against resting liquidity at the midpoint.`,
      stats: [
        { label: "20% participation impact", value: "~85 bps" },
        { label: "Dark pool participation rate", value: "5–15%" },
        { label: "Avg implementation shortfall reduction", value: "11 bps" },
      ],
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "Block Trade Mechanics",
      color: "#10b981",
      content: `Institutional block trades (typically > 10,000 shares or $200K+) require specialized handling. In dark pools, buy and sell orders are crossed anonymously, often at the NBBO midpoint capturing full spread for both sides. Liquidnet's network connects buy-side firms directly, while broker dark pools internalize client order flow. Block discovery algorithms scan for natural counterparties before routing to exchange.`,
      stats: [
        { label: "Reg NMS block threshold", value: "10,000 shares" },
        { label: "Avg Liquidnet block size", value: "$8.6M" },
        { label: "Midpoint execution savings", value: "50% spread" },
      ],
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Regulatory Context",
      color: "#6366f1",
      content: `Reg NMS (2005) inadvertently encouraged dark pool growth by requiring best execution across venues. Reg ATS (1998, amended 2018) requires registration, disclosure of material aspects, and fair access for ATSs crossing 5%+ of volume in a security. SEC Disclosure Form ATS-N mandates transparency about operations, conflicts of interest, and subscriber tiers — addressing opacity concerns without eliminating benefits.`,
      stats: [
        { label: "ATS 5% threshold disclosure", value: "Form ATS-N" },
        { label: "Reg NMS enacted", value: "2005" },
        { label: "Dark pool fines (2015)", value: "$70M" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Reason selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {reasons.map((r, i) => (
          <motion.button
            key={r.title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveReason(i)}
            className={cn(
              "rounded-xl p-3 text-left border transition-colors",
              activeReason === i
                ? "border-opacity-60 bg-opacity-20"
                : "border-neutral-700/50 bg-neutral-800/40 hover:bg-neutral-700/40"
            )}
            style={
              activeReason === i
                ? { borderColor: r.color + "88", background: r.color + "18" }
                : {}
            }
          >
            <div className="mb-2" style={{ color: r.color }}>
              {r.icon}
            </div>
            <div className="text-xs font-semibold text-white">{r.title}</div>
          </motion.button>
        ))}
      </div>

      {/* Active reason content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeReason}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl p-5 border"
          style={{
            borderColor: reasons[activeReason].color + "44",
            background: reasons[activeReason].color + "0d",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: reasons[activeReason].color + "28" }}
            >
              <span style={{ color: reasons[activeReason].color }}>
                {reasons[activeReason].icon}
              </span>
            </div>
            <h3 className="text-base font-semibold text-white">
              {reasons[activeReason].title}
            </h3>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed mb-4">
            {reasons[activeReason].content}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {reasons[activeReason].stats.map((st) => (
              <div
                key={st.label}
                className="bg-neutral-900/60 rounded-lg p-3 border border-neutral-700/40"
              >
                <div
                  className="text-sm font-bold tabular-nums"
                  style={{ color: reasons[activeReason].color }}
                >
                  {st.value}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">{st.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Price improvement table */}
      <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Price Improvement Statistics by Pool
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-neutral-500 border-b border-neutral-700/50">
                <th className="text-left pb-2 font-medium">Dark Pool</th>
                <th className="text-right pb-2 font-medium">Improvement (bps)</th>
                <th className="text-right pb-2 font-medium">Fill Rate</th>
                <th className="text-right pb-2 font-medium">Avg Size ($K)</th>
                <th className="text-right pb-2 font-medium">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/30">
              {PRICE_IMPROVEMENT_DATA.map((row) => {
                const quality =
                  row.improvementBps > 1.8 ? "Excellent" : row.improvementBps > 1.3 ? "Good" : "Fair";
                const qualColor =
                  quality === "Excellent"
                    ? "text-emerald-400"
                    : quality === "Good"
                    ? "text-blue-400"
                    : "text-amber-400";
                return (
                  <tr key={row.pool} className="hover:bg-neutral-700/20">
                    <td className="py-2 text-white font-medium">{row.pool}</td>
                    <td className="py-2 text-right tabular-nums text-emerald-400 font-semibold">
                      +{row.improvementBps.toFixed(1)}
                    </td>
                    <td className="py-2 text-right tabular-nums text-neutral-300">
                      {row.fillRate}%
                    </td>
                    <td className="py-2 text-right tabular-nums text-neutral-300">
                      ${row.avgSize.toLocaleString()}
                    </td>
                    <td className={cn("py-2 text-right font-medium", qualColor)}>{quality}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-500 mt-3">
          Price improvement measured against NBBO midpoint at time of order submission.
        </p>
      </div>

      {/* Info leakage visual */}
      <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />
          Information Leakage: Lit vs Dark Order Flow
        </h3>
        <svg viewBox="0 0 600 120" className="w-full h-24">
          {/* Lit market side */}
          <rect x={10} y={10} width={260} height={100} rx={8} fill="#1f1f2e" stroke="#374151" strokeWidth={1} />
          <text x={140} y={30} textAnchor="middle" fontSize={10} fill="#9ca3af">LIT MARKET (Exchange)</text>
          {/* Order book visible bars */}
          {[50, 40, 30].map((h, i) => (
            <rect
              key={`bid-${i}`}
              x={30 + i * 50}
              y={110 - h - 20}
              width={30}
              height={h}
              fill="#3b82f688"
              rx={2}
            />
          ))}
          {[35, 45, 55].map((h, i) => (
            <rect
              key={`ask-${i}`}
              x={165 - i * 50}
              y={110 - h - 20}
              width={30}
              height={h}
              fill="#ef444488"
              rx={2}
            />
          ))}
          <text x={80} y={105} textAnchor="middle" fontSize={8} fill="#60a5fa">BIDS (visible)</text>
          <text x={180} y={105} textAnchor="middle" fontSize={8} fill="#f87171">ASKS (visible)</text>
          {/* Arrow pointing HFT reads it */}
          <text x={140} y={62} textAnchor="middle" fontSize={9} fill="#fbbf24">ALL VISIBLE TO HFT</text>

          {/* Arrow */}
          <line x1={280} y1={60} x2={320} y2={60} stroke="#6b7280" strokeWidth={1.5} markerEnd="url(#arr)" />
          <text x={300} y={55} textAnchor="middle" fontSize={8} fill="#6b7280">vs</text>

          {/* Dark pool side */}
          <rect x={330} y={10} width={260} height={100} rx={8} fill="#1a1a1a" stroke="#4b5563" strokeWidth={1} strokeDasharray="4 2" />
          <text x={460} y={30} textAnchor="middle" fontSize={10} fill="#9ca3af">DARK POOL (ATS)</text>
          {/* Hidden orders represented as question marks */}
          {[60, 50, 70, 45, 55].map((y, i) => (
            <text key={`q-${i}`} x={370 + i * 42} y={y + 20} textAnchor="middle" fontSize={18} fill="#374151">
              ?
            </text>
          ))}
          <text x={460} y={105} textAnchor="middle" fontSize={8} fill="#10b981">ORDERS HIDDEN UNTIL MATCHED</text>

          <defs>
            <marker id="arr" markerWidth={6} markerHeight={6} refX={3} refY={3} orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="#6b7280" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// ── Tab 3: Order Types ─────────────────────────────────────────────────────────
function OrderTypesTab() {
  const [selected, setSelected] = useState<string>(ORDER_TYPES[0].name);
  const order = ORDER_TYPES.find((o) => o.name === selected)!;

  const impactColor = {
    None: "text-emerald-400",
    Low: "text-blue-400",
    Medium: "text-amber-400",
    High: "text-red-400",
  };

  const complexityColor = {
    Basic: "text-emerald-400",
    Intermediate: "text-amber-400",
    Advanced: "text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Order type pills */}
      <div className="flex flex-wrap gap-2">
        {ORDER_TYPES.map((o) => (
          <button
            key={o.name}
            onClick={() => setSelected(o.name)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
              selected === o.name
                ? "bg-blue-600/30 border-blue-500/60 text-blue-300"
                : "bg-neutral-800/60 border-neutral-700/50 text-neutral-400 hover:text-white hover:border-neutral-600"
            )}
          >
            {o.abbr} — {o.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Order detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">{order.name}</h3>
              <Badge
                variant="outline"
                className="text-xs font-bold border-neutral-600 text-neutral-300"
              >
                {order.abbr}
              </Badge>
            </div>
            <p className="text-sm text-neutral-300 mb-4">{order.description}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Price Impact</span>
                <span className={cn("font-semibold", impactColor[order.priceImpact])}>
                  {order.priceImpact}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Complexity</span>
                <span className={cn("font-semibold", complexityColor[order.complexity])}>
                  {order.complexity}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Fill Probability</span>
                <span className="font-semibold text-white">{order.fillProbability}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Dark Pool Friendly</span>
                {order.darkPoolFriendly ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          </div>
          <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
              Best Use Case
            </h4>
            <p className="text-sm text-neutral-300 mb-4">{order.useCase}</p>
            <div className="bg-neutral-900/60 rounded-lg p-3 border border-neutral-700/30">
              <div className="text-xs text-neutral-500 mb-1">Fill probability range</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-neutral-700/40 rounded-full h-3 overflow-hidden">
                  {(() => {
                    const parts = order.fillProbability.replace("%", "").split("–");
                    const lo = parseInt(parts[0]) / 100;
                    const hi = parseInt(parts[1]) / 100;
                    return (
                      <>
                        <div
                          className="h-full bg-blue-600/40 rounded-full relative"
                          style={{ width: `${hi * 100}%` }}
                        >
                          <div
                            className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                            style={{ width: `${(lo / hi) * 100}%` }}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
                <span className="text-xs text-blue-400 font-semibold w-20 text-right">
                  {order.fillProbability}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Order routing decision tree SVG */}
      <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-purple-400" />
          Order Routing Decision Tree
        </h3>
        <svg viewBox="0 0 640 300" className="w-full">
          {/* Root */}
          <rect x={245} y={10} width={150} height={36} rx={6} fill="#3b82f633" stroke="#3b82f6" strokeWidth={1.5} />
          <text x={320} y={32} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#93c5fd">New Order Received</text>

          {/* Branch lines from root */}
          <line x1={320} y1={46} x2={320} y2={70} stroke="#4b5563" strokeWidth={1.5} />
          <line x1={150} y1={70} x2={490} y2={70} stroke="#4b5563" strokeWidth={1.5} />
          <line x1={150} y1={70} x2={150} y2={94} stroke="#4b5563" strokeWidth={1.5} />
          <line x1={320} y1={70} x2={320} y2={94} stroke="#4b5563" strokeWidth={1.5} />
          <line x1={490} y1={70} x2={490} y2={94} stroke="#4b5563" strokeWidth={1.5} />

          {/* Level 2 nodes */}
          <rect x={70} y={94} width={160} height={34} rx={5} fill="#8b5cf633" stroke="#8b5cf6" strokeWidth={1} />
          <text x={150} y={113} textAnchor="middle" fontSize={10} fill="#c4b5fd">Block? (&gt;$200K)</text>

          <rect x={245} y={94} width={150} height={34} rx={5} fill="#8b5cf633" stroke="#8b5cf6" strokeWidth={1} />
          <text x={320} y={113} textAnchor="middle" fontSize={10} fill="#c4b5fd">Time-sensitive?</text>

          <rect x={415} y={94} width={150} height={34} rx={5} fill="#8b5cf633" stroke="#8b5cf6" strokeWidth={1} />
          <text x={490} y={113} textAnchor="middle" fontSize={10} fill="#c4b5fd">Price-sensitive?</text>

          {/* Level 2 Yes/No branches */}
          {/* Block Yes -> Dark Pool */}
          <line x1={110} y1={128} x2={80} y2={175} stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={75} y={160} fontSize={8} fill="#10b981">Yes</text>
          <rect x={20} y={175} width={120} height={30} rx={5} fill="#10b98122" stroke="#10b981" strokeWidth={1} />
          <text x={80} y={193} textAnchor="middle" fontSize={9} fill="#6ee7b7">Dark Pool / ATS</text>

          {/* Block No -> Exchange */}
          <line x1={190} y1={128} x2={210} y2={175} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={205} y={160} fontSize={8} fill="#ef4444">No</text>
          <rect x={160} y={175} width={120} height={30} rx={5} fill="#ef444422" stroke="#ef4444" strokeWidth={1} />
          <text x={220} y={193} textAnchor="middle" fontSize={9} fill="#fca5a5">Lit Exchange</text>

          {/* Time-sensitive Yes -> IOC/FOK */}
          <line x1={295} y1={128} x2={270} y2={175} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={263} y={160} fontSize={8} fill="#f59e0b">Yes</text>
          <rect x={225} y={175} width={95} height={30} rx={5} fill="#f59e0b22" stroke="#f59e0b" strokeWidth={1} />
          <text x={272} y={190} textAnchor="middle" fontSize={9} fill="#fde68a">IOC / FOK</text>

          {/* Time No -> VWAP/TWAP */}
          <line x1={345} y1={128} x2={370} y2={175} stroke="#6b7280" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={363} y={160} fontSize={8} fill="#6b7280">No</text>
          <rect x={330} y={175} width={100} height={30} rx={5} fill="#6b728022" stroke="#6b7280" strokeWidth={1} />
          <text x={380} y={190} textAnchor="middle" fontSize={9} fill="#d1d5db">VWAP / TWAP</text>

          {/* Price Yes -> Midpoint peg */}
          <line x1={460} y1={128} x2={450} y2={175} stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={443} y={160} fontSize={8} fill="#06b6d4">Yes</text>
          <rect x={420} y={175} width={120} height={30} rx={5} fill="#06b6d422" stroke="#06b6d4" strokeWidth={1} />
          <text x={480} y={190} textAnchor="middle" fontSize={9} fill="#67e8f9">Midpoint Peg</text>

          {/* Price No -> Market order */}
          <line x1={520} y1={128} x2={560} y2={175} stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={545} y={160} fontSize={8} fill="#a855f7">No</text>
          <rect x={520} y={175} width={110} height={30} rx={5} fill="#a855f722" stroke="#a855f7" strokeWidth={1} />
          <text x={575} y={190} textAnchor="middle" fontSize={9} fill="#d8b4fe">Market Order</text>

          {/* Legend */}
          <text x={20} y={250} fontSize={9} fill="#6b7280">Decision nodes in violet · Outcomes in color · Dashed = conditional path</text>
        </svg>
      </div>

      {/* Quick reference grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Spread Capture (Midpoint)", value: "50%", color: "text-emerald-400" },
          { label: "Avg IOC Cancel Rate", value: "42%", color: "text-amber-400" },
          { label: "FOK Block Fill Rate", value: "28%", color: "text-red-400" },
          { label: "VWAP Tracking Error", value: "~3 bps", color: "text-blue-400" },
        ].map((s) => (
          <StatChip key={s.label} label={s.label} value={s.value} color={s.color} />
        ))}
      </div>
    </div>
  );
}

// ── Tab 4: HFT Interaction ─────────────────────────────────────────────────────
function HFTInteractionTab() {
  const [activeEvent, setActiveEvent] = useState<number | null>(null);

  const typeColor = {
    regulation: "#3b82f6",
    incident: "#ef4444",
    technology: "#10b981",
    research: "#f59e0b",
  };

  const typeLabel = {
    regulation: "Regulation",
    incident: "Incident",
    technology: "Technology",
    research: "Research",
  };

  const hftConcerns = [
    {
      title: "Latency Arbitrage",
      icon: <Zap className="w-4 h-4" />,
      color: "#f59e0b",
      description:
        "HFT firms co-locate at exchange data centers to receive market data microseconds before others. They use this edge to detect stale quotes in dark pools and trade against them before the pool updates its reference price.",
    },
    {
      title: "Quote Stuffing",
      icon: <Activity className="w-4 h-4" />,
      color: "#ef4444",
      description:
        "Submission of thousands of orders per second that are immediately cancelled, overloading competitor systems and creating artificial delays. FINRA monitors for abnormal order-to-trade ratios exceeding 100:1.",
    },
    {
      title: "Front-Running",
      icon: <ArrowRight className="w-4 h-4" />,
      color: "#a855f7",
      description:
        "Trading ahead of a known pending order to profit from the anticipated price move. Illegal when based on non-public information; legal when inferred from market signals. Dark pools reduce information leakage that enables this.",
    },
    {
      title: "Spoofing",
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "#ec4899",
      description:
        "Placing large visible orders with no intent to execute to create false price impressions, then cancelling before fill. Illegal under the Dodd-Frank Act; prosecuted criminally since 2015 (US v. Coscia).",
    },
  ];

  return (
    <div className="space-y-6">
      {/* HFT concerns grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {hftConcerns.map((c) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 border"
            style={{ borderColor: c.color + "44", background: c.color + "0d" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: c.color + "28" }}
              >
                <span style={{ color: c.color }}>{c.icon}</span>
              </div>
              <h3 className="text-sm font-semibold text-white">{c.title}</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">{c.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Regulatory responses stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="IEX Speed Bump" value="350 µs" color="text-cyan-400" />
        <StatChip label="SEC Reg ATS-N Forms" value="~60" color="text-blue-400" />
        <StatChip label="FINRA Manipulation Cases (2023)" value="48" color="text-red-400" />
        <StatChip label="Max Spoofing Sentence" value="10 yrs" color="text-amber-400" />
      </div>

      {/* Timeline */}
      <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          HFT & Dark Pool Regulatory Timeline — click an event to expand
        </h3>

        {/* SVG timeline axis */}
        <svg viewBox="0 0 640 60" className="w-full h-14 mb-2">
          <line x1={20} y1={30} x2={620} y2={30} stroke="#374151" strokeWidth={2} />
          {HFT_TIMELINE.map((ev, i) => {
            const x = 20 + (i / (HFT_TIMELINE.length - 1)) * 600;
            return (
              <g key={ev.year}>
                <circle
                  cx={x}
                  cy={30}
                  r={6}
                  fill={ev.color}
                  className="cursor-pointer"
                  onClick={() => setActiveEvent(activeEvent === i ? null : i)}
                />
                <text
                  x={x}
                  y={52}
                  textAnchor="middle"
                  fontSize={7}
                  fill={activeEvent === i ? ev.color : "#6b7280"}
                >
                  {ev.year}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-3">
          {(["regulation", "incident", "technology", "research"] as const).map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: typeColor[t] }} />
              <span className="text-xs text-neutral-400">{typeLabel[t]}</span>
            </div>
          ))}
        </div>

        {/* Events list */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {HFT_TIMELINE.map((ev, i) => (
            <motion.div
              key={ev.year + ev.title}
              className={cn(
                "rounded-lg px-3 py-2.5 cursor-pointer border transition-colors",
                activeEvent === i
                  ? "border-opacity-50"
                  : "border-neutral-700/30 bg-neutral-900/30 hover:bg-neutral-700/20"
              )}
              style={
                activeEvent === i
                  ? { borderColor: ev.color + "60", background: ev.color + "12" }
                  : {}
              }
              onClick={() => setActiveEvent(activeEvent === i ? null : i)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: ev.color }}
                />
                <span className="text-xs text-neutral-500 w-8 shrink-0 tabular-nums">
                  {ev.year}
                </span>
                <span className="text-xs font-semibold text-white">{ev.title}</span>
                <Badge
                  variant="outline"
                  className="ml-auto text-[11px] px-1.5 py-0 border-neutral-600"
                  style={{ color: ev.color, borderColor: ev.color + "44" }}
                >
                  {typeLabel[ev.type]}
                </Badge>
              </div>
              <AnimatePresence>
                {activeEvent === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-neutral-300 mt-2 pl-8 leading-relaxed">
                      {ev.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: Lit vs Dark ─────────────────────────────────────────────────────────
function LitVsDarkTab() {
  const maxVal = Math.max(...TOXICITY_METRICS.flatMap((m) => [m.lit, m.dark]));

  return (
    <div className="space-y-6">
      {/* Header callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: "Price Discovery",
            icon: <Eye className="w-5 h-5" />,
            color: "#3b82f6",
            text: "Lit markets provide continuous, transparent price discovery through public order books. Dark pool trades are reported post-execution, contributing less to real-time price formation.",
          },
          {
            title: "Toxicity Flow",
            icon: <AlertTriangle className="w-5 h-5" />,
            color: "#ef4444",
            text: 'Toxic order flow is informed trading that consistently moves against market makers. Dark pools attract both block institutional flow (low toxicity) and alpha-seeking flow (high toxicity), creating adverse selection risk.',
          },
          {
            title: "Implementation Shortfall",
            icon: <TrendingDown className="w-5 h-5" />,
            color: "#10b981",
            text: "IS measures the difference between decision price and actual execution. Dark pools reduce IS by ~11 bps on average for block orders through reduced market impact and price improvement.",
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-xl p-4 border"
            style={{ borderColor: c.color + "44", background: c.color + "0d" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: c.color }}>{c.icon}</span>
              <h3 className="text-sm font-semibold text-white">{c.title}</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>

      {/* Toxicity metrics comparison */}
      <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          Lit vs Dark: Key Microstructure Metrics
        </h3>
        <div className="flex gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-500/70" />
            <span className="text-neutral-400">Lit Market</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-purple-500/70" />
            <span className="text-neutral-400">Dark Pool</span>
          </div>
        </div>
        <div className="space-y-4">
          {TOXICITY_METRICS.map((m) => {
            const litW = (m.lit / maxVal) * 100;
            const darkW = (m.dark / maxVal) * 100;
            const litBetter = m.lowerIsBetter ? m.lit < m.dark : m.lit > m.dark;
            const darkBetter = !litBetter;
            return (
              <div key={m.metric}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-neutral-300">{m.metric}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={cn("tabular-nums", litBetter ? "text-emerald-400" : "text-neutral-400")}>
                      Lit: {m.lit}{m.unit}
                    </span>
                    <span className="text-neutral-600">·</span>
                    <span className={cn("tabular-nums", darkBetter ? "text-emerald-400" : "text-neutral-400")}>
                      Dark: {m.dark}{m.unit}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 w-6">Lit</span>
                    <div className="flex-1 bg-neutral-700/40 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-blue-500/70"
                        initial={{ width: 0 }}
                        animate={{ width: `${litW}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 w-6">Dark</span>
                    <div className="flex-1 bg-neutral-700/40 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-purple-500/70"
                        initial={{ width: 0 }}
                        animate={{ width: `${darkW}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-neutral-500 mt-4">
          Lower is better for impact/reversion/leakage metrics · Higher is better for fill rate/improvement.
        </p>
      </div>

      {/* Implementation shortfall breakdown SVG */}
      <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          Implementation Shortfall Decomposition
        </h3>
        <svg viewBox="0 0 640 200" className="w-full">
          {/* Stacked bar for Lit market */}
          <text x={10} y={30} fontSize={10} fill="#9ca3af">Lit Market (total ~18.5 bps)</text>
          {[
            { label: "Market Impact", bps: 9.2, color: "#ef4444" },
            { label: "Spread Cost", bps: 4.1, color: "#f59e0b" },
            { label: "Timing Risk", bps: 3.2, color: "#8b5cf6" },
            { label: "Opportunity Cost", bps: 2.0, color: "#6b7280" },
          ].map((seg, i) => {
            const offset = [0, 9.2, 13.3, 16.5][i];
            const x = 10 + (offset / 20) * 400;
            const w = (seg.bps / 20) * 400;
            return (
              <g key={seg.label}>
                <rect x={x} y={40} width={w} height={28} fill={seg.color} rx={i === 0 ? 4 : 0} />
                {w > 40 && (
                  <text x={x + w / 2} y={58} textAnchor="middle" fontSize={8} fill="white">
                    {seg.bps} bps
                  </text>
                )}
              </g>
            );
          })}

          {/* Stacked bar for Dark pool */}
          <text x={10} y={100} fontSize={10} fill="#9ca3af">Dark Pool (total ~7.2 bps)</text>
          {[
            { label: "Market Impact", bps: 2.8, color: "#ef444488" },
            { label: "Spread Cost", bps: 0, color: "#f59e0b88" },
            { label: "Timing Risk", bps: 2.9, color: "#8b5cf688" },
            { label: "Opportunity Cost", bps: 1.5, color: "#6b728088" },
          ].map((seg, i) => {
            const offset = [0, 2.8, 2.8, 5.7][i];
            const x = 10 + (offset / 20) * 400;
            const w = (seg.bps / 20) * 400;
            if (w === 0) return null;
            return (
              <g key={seg.label}>
                <rect x={x} y={110} width={w} height={28} fill={seg.color} rx={i === 0 ? 4 : 0} />
                {w > 35 && (
                  <text x={x + w / 2} y={128} textAnchor="middle" fontSize={8} fill="white">
                    {seg.bps} bps
                  </text>
                )}
              </g>
            );
          })}

          {/* Savings annotation */}
          <line x1={420} y1={54} x2={420} y2={124} stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 2" />
          <line x1={10 + (7.2 / 20) * 400} y1={124} x2={420} y2={124} stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={440} y={90} fontSize={9} fill="#10b981">Savings:</text>
          <text x={440} y={103} fontSize={10} fontWeight="bold" fill="#10b981">~11.3 bps</text>

          {/* Legend */}
          {[
            { label: "Market Impact", color: "#ef4444" },
            { label: "Spread Cost", color: "#f59e0b" },
            { label: "Timing Risk", color: "#8b5cf6" },
            { label: "Opportunity Cost", color: "#6b7280" },
          ].map((l, i) => (
            <g key={l.label}>
              <rect x={10 + i * 155} y={168} width={10} height={10} fill={l.color} rx={2} />
              <text x={24 + i * 155} y={177} fontSize={8} fill="#9ca3af">{l.label}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Key takeaways */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            icon: <Lock className="w-4 h-4" />,
            color: "#6366f1",
            title: "When Dark Pools Win",
            points: [
              "Block trades > $500K in liquid stocks",
              "When market impact is primary concern",
              "Natural institutional counterparty exists",
              "Midpoint pegging captures full spread savings",
            ],
          },
          {
            icon: <Eye className="w-4 h-4" />,
            color: "#3b82f6",
            title: "When Lit Markets Win",
            points: [
              "Small retail-sized orders (< $25K)",
              "Price discovery is needed immediately",
              "Illiquid stocks with no dark liquidity",
              "Urgency requires guaranteed execution",
            ],
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl p-4 border"
            style={{ borderColor: card.color + "44", background: card.color + "0d" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: card.color }}>{card.icon}</span>
              <h3 className="text-sm font-semibold text-white">{card.title}</h3>
            </div>
            <ul className="space-y-1.5">
              {card.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: card.color }} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function DarkPoolsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <EyeOff className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Dark Pools & Market Microstructure
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Alternative Trading Systems, HFT dynamics, order routing, and the hidden plumbing of equity markets.
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="landscape" className="space-y-4">
          <TabsList className="bg-neutral-900/80 border border-neutral-800 flex flex-wrap h-auto gap-1 p-1">
            {[
              { value: "landscape", label: "Dark Pool Landscape", icon: <Layers className="w-3.5 h-3.5" /> },
              { value: "why", label: "Why They Exist", icon: <Info className="w-3.5 h-3.5" /> },
              { value: "orders", label: "Order Types", icon: <BookOpen className="w-3.5 h-3.5" /> },
              { value: "hft", label: "HFT Interaction", icon: <Zap className="w-3.5 h-3.5" /> },
              { value: "litvsdark", label: "Lit vs Dark", icon: <Scale className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-neutral-400 px-3 py-1.5 rounded-md"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="landscape" className="data-[state=inactive]:hidden">
            <DarkPoolLandscapeTab />
          </TabsContent>
          <TabsContent value="why" className="data-[state=inactive]:hidden">
            <WhyDarkPoolsTab />
          </TabsContent>
          <TabsContent value="orders" className="data-[state=inactive]:hidden">
            <OrderTypesTab />
          </TabsContent>
          <TabsContent value="hft" className="data-[state=inactive]:hidden">
            <HFTInteractionTab />
          </TabsContent>
          <TabsContent value="litvsdark" className="data-[state=inactive]:hidden">
            <LitVsDarkTab />
          </TabsContent>
        </Tabs>

        {/* Footer disclaimer */}
        <div className="text-xs text-neutral-600 border-t border-neutral-800 pt-4">
          Educational simulation only. Dark pool volume figures, price improvement statistics, and regulatory details are illustrative approximations based on publicly available research.
        </div>
      </div>
    </div>
  );
}
