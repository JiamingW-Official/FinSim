"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  Server,
  Cpu,
  DollarSign,
  Percent,
  Activity,
  Lock,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
  ArrowUpRight,
  Clock,
  Network,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 785;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate noise to avoid mutation during render
const NOISE = Array.from({ length: 300 }, () => rand());

// ── Types ─────────────────────────────────────────────────────────────────────

interface ValidatorRow {
  client: string;
  hardwareCost: number;
  bandwidth: string;
  stakeReq: number;
  expectedAPY: number;
  breakEvenMonths: number;
  marketShare: number;
}

interface LiquidProtocol {
  name: string;
  ticker: string;
  tvl: number; // ETH
  marketShare: number;
  apy: number;
  color: string;
  description: string;
}

interface MEVSource {
  name: string;
  share: number;
  revenuePerBlock: number;
  description: string;
  color: string;
}

interface SlashingIncident {
  date: string;
  protocol: string;
  validatorsSlashed: number;
  ethLost: number;
  cause: string;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const VALIDATOR_TABLE: ValidatorRow[] = [
  {
    client: "Geth + Lighthouse",
    hardwareCost: 500,
    bandwidth: "1.5 TB/mo",
    stakeReq: 32,
    expectedAPY: 4.2,
    breakEvenMonths: 18,
    marketShare: 38,
  },
  {
    client: "Nethermind + Prysm",
    hardwareCost: 600,
    bandwidth: "2.0 TB/mo",
    stakeReq: 32,
    expectedAPY: 4.1,
    breakEvenMonths: 21,
    marketShare: 27,
  },
  {
    client: "Besu + Teku",
    hardwareCost: 650,
    bandwidth: "1.8 TB/mo",
    stakeReq: 32,
    expectedAPY: 4.0,
    breakEvenMonths: 23,
    marketShare: 15,
  },
  {
    client: "Erigon + Nimbus",
    hardwareCost: 450,
    bandwidth: "1.2 TB/mo",
    stakeReq: 32,
    expectedAPY: 4.3,
    breakEvenMonths: 15,
    marketShare: 12,
  },
  {
    client: "Reth + Grandine",
    hardwareCost: 400,
    bandwidth: "1.0 TB/mo",
    stakeReq: 32,
    expectedAPY: 4.4,
    breakEvenMonths: 13,
    marketShare: 8,
  },
];

const LIQUID_PROTOCOLS: LiquidProtocol[] = [
  {
    name: "Lido",
    ticker: "stETH",
    tvl: 9200000,
    marketShare: 31.2,
    apy: 3.9,
    color: "#00a3ff",
    description: "Largest liquid staking protocol with permissioned node operators.",
  },
  {
    name: "Rocket Pool",
    ticker: "rETH",
    tvl: 1800000,
    marketShare: 6.1,
    apy: 3.7,
    color: "#ff6b35",
    description: "Decentralized with permissionless 8 ETH mini-pools.",
  },
  {
    name: "Coinbase",
    ticker: "cbETH",
    tvl: 1200000,
    marketShare: 4.1,
    apy: 3.5,
    color: "#0052ff",
    description: "Custodial liquid staking by Coinbase exchange.",
  },
  {
    name: "Frax",
    ticker: "frxETH",
    tvl: 420000,
    marketShare: 1.4,
    apy: 4.1,
    color: "#9945ff",
    description: "Algorithmic liquid staking with dual-token model.",
  },
  {
    name: "Others",
    ticker: "—",
    tvl: 800000,
    marketShare: 2.7,
    apy: 3.8,
    color: "#6b7280",
    description: "Stader, Ankr, StakeWise, and emerging protocols.",
  },
];

const MEV_SOURCES: MEVSource[] = [
  {
    name: "Arbitrage",
    share: 52,
    revenuePerBlock: 0.062,
    description: "Price discrepancies across DEXes captured by bots.",
    color: "#22c55e",
  },
  {
    name: "Liquidations",
    share: 28,
    revenuePerBlock: 0.033,
    description: "Collateral seized from undercollateralized DeFi positions.",
    color: "#f59e0b",
  },
  {
    name: "Sandwich",
    share: 14,
    revenuePerBlock: 0.017,
    description: "Front/back-running large DEX trades to extract slippage.",
    color: "#ef4444",
  },
  {
    name: "Other",
    share: 6,
    revenuePerBlock: 0.007,
    description: "NFT sniping, time-bandit attacks, and novel strategies.",
    color: "#8b5cf6",
  },
];

const SLASHING_INCIDENTS: SlashingIncident[] = [
  {
    date: "Jan 2024",
    protocol: "Lido Node Op",
    validatorsSlashed: 11,
    ethLost: 5.5,
    cause: "Double-vote due to config migration",
  },
  {
    date: "Sep 2023",
    protocol: "Stakehound",
    validatorsSlashed: 5,
    ethLost: 2.5,
    cause: "Client bug during software upgrade",
  },
  {
    date: "Apr 2023",
    protocol: "Coinbase Inst.",
    validatorsSlashed: 8,
    ethLost: 4.0,
    cause: "Slashable equivocation on beacon chain",
  },
  {
    date: "Feb 2023",
    protocol: "InfStones",
    validatorsSlashed: 101,
    ethLost: 50.5,
    cause: "Key management failure across multiple clusters",
  },
  {
    date: "Nov 2022",
    protocol: "Rocket Pool DP",
    validatorsSlashed: 2,
    ethLost: 1.0,
    cause: "Duplicate signing from backup validator",
  },
];

// ── Helper ────────────────────────────────────────────────────────────────────

const fmt = (n: number, dec = 2) => n.toFixed(dec);
const fmtK = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  positive,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && (
              <p className={`text-xs mt-1 ${positive === undefined ? "text-muted-foreground" : positive ? "text-green-500" : "text-red-500"}`}>
                {sub}
              </p>
            )}
          </div>
          <div className="rounded-md bg-primary/10 p-2">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Reward Breakdown Bar Chart ────────────────────────────────────────────────

function RewardBreakdownChart() {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const consensusBase = [3.1, 3.2, 3.0, 3.3, 3.15, 3.2];
  const executionBase = [0.5, 0.6, 0.55, 0.7, 0.65, 0.7];
  const mevBase = [0.3, 0.45, 0.35, 0.5, 0.4, 0.48];

  const W = 520;
  const H = 200;
  const pad = { l: 40, r: 10, t: 10, b: 30 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const barW = chartW / months.length;
  const maxVal = 5.0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Y gridlines */}
      {[0, 1, 2, 3, 4, 5].map((v) => {
        const y = pad.t + chartH - (v / maxVal) * chartH;
        return (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
            <text x={pad.l - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{v}%</text>
          </g>
        );
      })}
      {/* Stacked bars */}
      {months.map((m, i) => {
        const x = pad.l + i * barW + barW * 0.1;
        const bw = barW * 0.8;
        const c = consensusBase[i];
        const e = executionBase[i];
        const mv = mevBase[i];
        const total = c + e + mv;
        const hc = (c / maxVal) * chartH;
        const he = (e / maxVal) * chartH;
        const hmev = (mv / maxVal) * chartH;
        const yBase = pad.t + chartH;
        return (
          <g key={m}>
            {/* Consensus */}
            <rect x={x} y={yBase - hc} width={bw} height={hc} fill="#3b82f6" rx={2} />
            {/* Execution */}
            <rect x={x} y={yBase - hc - he} width={bw} height={he} fill="#22c55e" rx={2} />
            {/* MEV */}
            <rect x={x} y={yBase - hc - he - hmev} width={bw} height={hmev} fill="#f59e0b" rx={2} />
            {/* Total label */}
            <text x={x + bw / 2} y={yBase - hc - he - hmev - 3} textAnchor="middle" fontSize={8} fill="#e5e7eb">{fmt(total)}%</text>
            {/* Month label */}
            <text x={x + bw / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="#9ca3af">{m}</text>
          </g>
        );
      })}
      {/* Legend */}
      {[["#3b82f6", "Consensus"], ["#22c55e", "Execution"], ["#f59e0b", "MEV"]].map(([color, label], i) => (
        <g key={label} transform={`translate(${pad.l + i * 115}, ${H - 2})`}>
          <rect x={0} y={-8} width={8} height={8} fill={color} rx={1} />
          <text x={11} y={0} fontSize={9} fill="#9ca3af">{label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Liquid Staking Pie Chart ──────────────────────────────────────────────────

function LiquidStakingPie({ protocols }: { protocols: LiquidProtocol[] }) {
  const cx = 110;
  const cy = 110;
  const r = 80;
  const rInner = 48;

  // Build pie slices
  const total = protocols.reduce((a, p) => a + p.marketShare, 0);
  let angle = -Math.PI / 2;
  const slices = protocols.map((p) => {
    const sweep = (p.marketShare / total) * 2 * Math.PI;
    const start = angle;
    angle += sweep;
    const end = angle;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const xi1 = cx + rInner * Math.cos(start);
    const yi1 = cy + rInner * Math.sin(start);
    const xi2 = cx + rInner * Math.cos(end);
    const yi2 = cy + rInner * Math.sin(end);
    const large = sweep > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${rInner} ${rInner} 0 ${large} 0 ${xi1} ${yi1} Z`;
    const midAngle = start + sweep / 2;
    const lx = cx + (r + 14) * Math.cos(midAngle);
    const ly = cy + (r + 14) * Math.sin(midAngle);
    return { d, color: p.color, name: p.name, share: p.marketShare, lx, ly, large, sweep };
  });

  return (
    <svg viewBox="0 0 400 220" className="w-full h-auto">
      {/* Donut */}
      {slices.map((sl) => (
        <path key={sl.name} d={sl.d} fill={sl.color} stroke="#1f2937" strokeWidth={2} opacity={0.9} />
      ))}
      {/* Center label */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={11} fill="#9ca3af">Liquid</text>
      <text x={cx} y={cx + 8} textAnchor="middle" fontSize={11} fill="#9ca3af">Staking</text>
      {/* Legend */}
      {protocols.map((p, i) => (
        <g key={p.name} transform={`translate(235, ${18 + i * 36})`}>
          <rect x={0} y={0} width={10} height={10} fill={p.color} rx={2} />
          <text x={14} y={9} fontSize={11} fill="#e5e7eb" fontWeight={600}>{p.name}</text>
          <text x={14} y={21} fontSize={9} fill="#9ca3af">{p.ticker} · {p.marketShare.toFixed(1)}% · {p.apy}% APY</text>
        </g>
      ))}
    </svg>
  );
}

// ── MEV Revenue Per Block Chart ───────────────────────────────────────────────

function MEVRevenueChart({ sources }: { sources: MEVSource[] }) {
  const W = 480;
  const H = 160;
  const pad = { l: 90, r: 60, t: 14, b: 10 };
  const chartW = W - pad.l - pad.r;
  const maxVal = Math.max(...sources.map((s) => s.revenuePerBlock)) * 1.25;
  const barH = 28;
  const gap = 10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {sources.map((src, i) => {
        const y = pad.t + i * (barH + gap);
        const bw = (src.revenuePerBlock / maxVal) * chartW;
        return (
          <g key={src.name}>
            <text x={pad.l - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={10} fill="#e5e7eb">{src.name}</text>
            <rect x={pad.l} y={y} width={bw} height={barH} fill={src.color} rx={3} opacity={0.85} />
            <text x={pad.l + bw + 5} y={y + barH / 2 + 4} fontSize={9} fill="#9ca3af">{src.revenuePerBlock.toFixed(3)} ETH</text>
            {/* Share badge */}
            <text x={pad.l + bw - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={9} fill="#fff" fontWeight={700}>{src.share}%</text>
          </g>
        );
      })}
      <text x={pad.l + chartW / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="#6b7280">Average ETH revenue per block</text>
    </svg>
  );
}

// ── APY Trend Line ─────────────────────────────────────────────────────────────

function APYTrendLine() {
  const W = 480;
  const H = 120;
  const pad = { l: 38, r: 10, t: 10, b: 22 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;

  // Generate 24 months of data
  const points = useMemo(() => {
    const base = [5.8, 5.5, 5.2, 4.9, 4.7, 4.5, 4.4, 4.2, 4.1, 4.3, 4.2, 4.0, 3.9, 4.1, 4.2, 4.0, 3.8, 3.9, 4.0, 4.1, 4.2, 4.15, 4.1, 4.2];
    return base.map((v, i) => ({
      val: v + (NOISE[i + 50] - 0.5) * 0.3,
      label: i % 6 === 0 ? `M${i + 1}` : "",
    }));
  }, []);

  const minV = 3.0;
  const maxV = 6.5;
  const toX = (i: number) => pad.l + (i / (points.length - 1)) * chartW;
  const toY = (v: number) => pad.t + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.val)}`).join(" ");
  const areaD = `${pathD} L ${toX(points.length - 1)} ${pad.t + chartH} L ${pad.l} ${pad.t + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="apyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[3.5, 4.0, 4.5, 5.0, 5.5, 6.0].map((v) => {
        const y = toY(v);
        return (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
            <text x={pad.l - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#6b7280">{v}%</text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#apyGrad)" />
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />
      {/* Dot at current value */}
      <circle cx={toX(points.length - 1)} cy={toY(points[points.length - 1].val)} r={4} fill="#3b82f6" />
      {points.map((p, i) =>
        p.label ? (
          <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize={8} fill="#6b7280">{p.label}</text>
        ) : null
      )}
      <text x={W - pad.r} y={10} textAnchor="end" fontSize={8} fill="#9ca3af">24-month ETH staking APY</text>
    </svg>
  );
}

// ── Validator Cost Model ───────────────────────────────────────────────────────

function ValidatorCostModel() {
  const ETH_PRICE = 3200;
  const monthlyEthReward = (32 * 0.042) / 12;
  const monthlyUsdReward = monthlyEthReward * ETH_PRICE;

  const costs = [
    { label: "VPS / Hardware amort.", usd: 42 },
    { label: "Bandwidth", usd: 18 },
    { label: "Power (0.1 kW·h avg)", usd: 8 },
    { label: "Monitoring tools", usd: 6 },
  ];
  const totalCost = costs.reduce((a, c) => a + c.usd, 0);
  const netProfit = monthlyUsdReward - totalCost;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <p className="text-xs text-muted-foreground">Monthly ETH reward</p>
          <p className="text-lg font-bold text-foreground">{fmt(monthlyEthReward, 4)} ETH</p>
          <p className="text-xs text-muted-foreground">${fmt(monthlyUsdReward, 0)} @ ${ETH_PRICE}</p>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <p className="text-xs text-muted-foreground">Monthly net profit</p>
          <p className={`text-lg font-medium ${netProfit > 0 ? "text-green-500" : "text-red-500"}`}>${fmt(netProfit, 0)}</p>
          <p className="text-xs text-muted-foreground">After opex ~${totalCost}/mo</p>
        </div>
      </div>
      <div className="space-y-1">
        {costs.map((c) => (
          <div key={c.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{c.label}</span>
            <span className="text-foreground">${c.usd}/mo</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-xs border-t border-border pt-1 mt-1">
          <span className="text-foreground font-medium">Total opex</span>
          <span className="text-foreground font-medium">${totalCost}/mo</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CryptoStakingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedValidator, setSelectedValidator] = useState<ValidatorRow | null>(null);

  const totalEthStaked = 34_200_000;
  const validatorCount = 1_068_750;
  const lstMarketShare = 45.5;
  const stakingAPY = 4.2;

  const slashingConditions = [
    {
      name: "Double vote",
      severity: "Critical",
      description: "Signing two different blocks at the same slot height.",
      penalty: "~1 ETH + whistleblower reward",
    },
    {
      name: "Surround vote",
      severity: "Critical",
      description: "Attestation that surrounds or is surrounded by a prior attestation.",
      penalty: "~1 ETH initial + correlation penalty",
    },
    {
      name: "Proposer slashing",
      severity: "High",
      description: "Broadcasting two conflicting block proposals for the same slot.",
      penalty: "Up to 1/32 of stake",
    },
    {
      name: "Inactivity leak",
      severity: "Medium",
      description: "Offline during non-finality period — not slashing but quadratic drain.",
      penalty: "Proportional to downtime",
    },
  ];

  const mitigations = [
    "Use doppelganger protection (wait 2 epochs before attesting)",
    "Never run duplicate validator keys simultaneously",
    "Use remote signers (Web3Signer, Dirk) with slashing protection DB",
    "Set up redundant monitoring and alerting via Prometheus + PagerDuty",
    "Maintain an offline backup key in cold storage (never import twice)",
    "Use DVT (Distributed Validator Technology) like SSV or Obol for fault tolerance",
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" />
              Crypto Staking & Validator Economics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Proof-of-Stake mechanics, liquid staking protocols, MEV capture, and validator profitability.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">Post-Merge ETH</Badge>
            <Badge variant="outline" className="text-xs">PoS</Badge>
            <Badge variant="outline" className="text-xs text-green-500 border-green-500/40">Live Network</Badge>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <MetricCard
          icon={Percent}
          label="ETH Staking APY"
          value={`${stakingAPY}%`}
          sub="+0.12% vs last month"
          positive
        />
        <MetricCard
          icon={Lock}
          label="Total ETH Staked"
          value={`${(totalEthStaked / 1_000_000).toFixed(1)}M`}
          sub={`~${((totalEthStaked / 120_000_000) * 100).toFixed(0)}% of supply locked`}
        />
        <MetricCard
          icon={Server}
          label="Active Validators"
          value={fmtK(validatorCount)}
          sub="Beacon chain validators"
        />
        <MetricCard
          icon={Activity}
          label="LST Market Share"
          value={`${lstMarketShare}%`}
          sub="Of total staked ETH"
          positive
        />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Staking Overview</TabsTrigger>
            <TabsTrigger value="liquid">Liquid Staking</TabsTrigger>
            <TabsTrigger value="mev">MEV</TabsTrigger>
            <TabsTrigger value="economics">Economics</TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ── */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Reward Breakdown */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Staking Reward Breakdown (6 months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RewardBreakdownChart />
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-primary">~3.2%</div>
                      <div className="text-muted-foreground">Consensus</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-400">~0.65%</div>
                      <div className="text-muted-foreground">Execution</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-amber-400">~0.35%</div>
                      <div className="text-muted-foreground">MEV Boost</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* APY Trend */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    ETH Staking APY Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <APYTrendLine />
                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                    <p>APY declined as more validators joined, diluting rewards. Recent stability reflects validator queue saturation near the activation churn limit (8 validators/epoch).</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How PoS Works */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  How Proof-of-Stake Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {[
                    {
                      icon: Lock,
                      title: "Deposit & Activation",
                      body: "32 ETH deposited to the deposit contract. After a ~12-hour processing period and entry queue (variable), a validator is activated on the beacon chain and begins attesting.",
                    },
                    {
                      icon: CheckCircle,
                      title: "Attesting & Proposing",
                      body: "Each epoch (6.4 min), validators attest to the head of the chain. Roughly 1-in-100,000 validators is chosen to propose a block each slot (12s). Proposers earn execution + MEV fees.",
                    },
                    {
                      icon: ArrowUpRight,
                      title: "Withdrawal",
                      body: "Post-Shapella (EIP-4895), validators can exit and withdraw. Full exit takes 1–5 days depending on the exit queue. Partial withdrawals of rewards happen automatically ~every 4 days.",
                    },
                  ].map(({ icon: Icon, title, body }) => (
                    <div key={title} className="rounded-lg border border-border bg-card/40 p-3 space-y-1">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                        {title}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Validator Table */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  Validator Client Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {["Client Pair", "HW Cost", "Bandwidth", "Stake Req.", "APY", "Break-even", "Network Share"].map((h) => (
                          <th key={h} className="pb-2 pr-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {VALIDATOR_TABLE.map((v) => (
                        <tr
                          key={v.client}
                          className={`cursor-pointer transition-colors hover:bg-muted/30 ${selectedValidator?.client === v.client ? "bg-primary/5" : ""}`}
                          onClick={() => setSelectedValidator(selectedValidator?.client === v.client ? null : v)}
                        >
                          <td className="py-2 pr-3 font-medium text-foreground">{v.client}</td>
                          <td className="py-2 pr-3 text-muted-foreground">${v.hardwareCost}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{v.bandwidth}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{v.stakeReq} ETH</td>
                          <td className="py-2 pr-3 text-green-500 font-medium">{v.expectedAPY}%</td>
                          <td className="py-2 pr-3 text-muted-foreground">{v.breakEvenMonths} mo</td>
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 rounded-full bg-primary/20 w-16">
                                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${v.marketShare}%` }} />
                              </div>
                              <span className="text-muted-foreground">{v.marketShare}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Liquid Staking Tab ── */}
          <TabsContent value="liquid" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Market Share by Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LiquidStakingPie protocols={LIQUID_PROTOCOLS} />
                </CardContent>
              </Card>

              <div className="space-y-3">
                {LIQUID_PROTOCOLS.filter((p) => p.name !== "Others").map((p) => (
                  <Card key={p.name} className="border-border">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                          <span className="font-medium text-sm text-foreground">{p.name}</span>
                          <Badge variant="outline" className="text-xs py-0">{p.ticker}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-500">{p.apy}% APY</div>
                          <div className="text-xs text-muted-foreground">{fmtK(p.tvl)} ETH TVL</div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                      <div className="mt-2 h-1 rounded-full bg-border">
                        <div className="h-1 rounded-full" style={{ width: `${p.marketShare / 35 * 100}%`, backgroundColor: p.color }} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{p.marketShare}% of total staked ETH</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* LST Risks */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Liquid Staking Token (LST) Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {[
                    {
                      title: "Smart Contract Risk",
                      desc: "All LSTs are governed by upgradeable proxy contracts. A vulnerability or malicious upgrade could drain underlying ETH.",
                      sev: "High",
                    },
                    {
                      title: "Centralization Risk",
                      desc: "Lido controls ~31% of staked ETH. This concentration threatens Ethereum's consensus and censorship resistance.",
                      sev: "High",
                    },
                    {
                      title: "Depeg / Liquidity Risk",
                      desc: "In stress events, stETH/ETH rates can diverge significantly (e.g., June 2022: stETH/ETH hit 0.94).",
                      sev: "Medium",
                    },
                    {
                      title: "Oracle Risk",
                      desc: "Many LST protocols rely on oracles to report validator balances. Oracle manipulation could cause incorrect rebasing.",
                      sev: "Medium",
                    },
                    {
                      title: "Governance Risk",
                      desc: "Token holders control protocol parameters. A governance attack could modify fee structures or node operator sets.",
                      sev: "Medium",
                    },
                    {
                      title: "Regulatory Risk",
                      desc: "Securities regulators (e.g., SEC) have flagged staking services as potential unregistered securities offerings.",
                      sev: "Low",
                    },
                  ].map((r) => (
                    <div key={r.title} className="rounded-lg border border-border bg-card/40 p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{r.title}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs py-0 ${r.sev === "High" ? "text-red-500 border-red-500/40" : r.sev === "Medium" ? "text-amber-500 border-amber-500/40" : "text-green-500 border-green-500/40"}`}
                        >
                          {r.sev}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── MEV Tab ── */}
          <TabsContent value="mev" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    MEV Revenue by Source
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <MEVRevenueChart sources={MEV_SOURCES} />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {MEV_SOURCES.map((src) => (
                      <div key={src.name} className="rounded border border-border bg-card/40 p-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: src.color }} />
                          <span className="font-medium text-foreground">{src.name}</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{src.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Network className="w-4 h-4 text-primary" />
                    MEV-Boost & PBS Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <p className="text-muted-foreground">
                    Proposer-Builder Separation (PBS) via MEV-Boost allows validators to outsource block building to specialized builders, capturing MEV revenue without running complex extraction bots.
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        step: "1",
                        label: "Searchers",
                        desc: "Identify MEV opportunities (arb, liquidation) and submit transaction bundles to block builders.",
                        color: "text-primary",
                      },
                      {
                        step: "2",
                        label: "Builders",
                        desc: "Aggregate bundles into profitable blocks, bid for the right to have their block proposed.",
                        color: "text-green-400",
                      },
                      {
                        step: "3",
                        label: "Relays",
                        desc: "Trusted intermediaries (Flashbots, BloXroute) facilitate sealed-bid auctions between builders and validators.",
                        color: "text-amber-400",
                      },
                      {
                        step: "4",
                        label: "Validators",
                        desc: "Select highest bid from relay, propose winning builder's block, receive bid payment + consensus rewards.",
                        color: "text-primary",
                      },
                    ].map(({ step, label, desc, color }) => (
                      <div key={step} className="flex gap-3 rounded border border-border bg-card/40 p-2">
                        <div className={`font-medium ${color} flex-shrink-0 w-4`}>{step}</div>
                        <div>
                          <div className={`font-medium mb-0.5 ${color}`}>{label}</div>
                          <p className="text-muted-foreground leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="flex items-center gap-1.5 font-medium text-amber-400 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Centralization Concern
                    </div>
                    <p className="text-muted-foreground">
                      ~90% of blocks are built by just 5 builders, raising concerns about censorship resistance and OFAC-compliant filtering. Inclusion lists (EIP-7547) aim to address this.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* MEV Stats */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  MEV Economy at a Glance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {[
                    { label: "Total MEV extracted (all-time)", value: "$1.8B+", sub: "Since 2020" },
                    { label: "Avg MEV per block", value: "0.12 ETH", sub: "~$380 per block" },
                    { label: "MEV-Boost adoption", value: "~90%", sub: "Of validators use it" },
                    { label: "Top builder market share", value: "~35%", sub: "beaverbuild" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border bg-card/40 p-3">
                      <div className="text-xl font-medium text-foreground">{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                      <div className="text-xs text-muted-foreground/60 mt-0.5">{s.sub}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Economics Tab ── */}
          <TabsContent value="economics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Validator Economics */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Solo Validator P&amp;L Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ValidatorCostModel />
                </CardContent>
              </Card>

              {/* Slashing Risk */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    Slashing Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {slashingConditions.map((sc) => (
                    <div key={sc.name} className="rounded border border-border bg-card/40 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{sc.name}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs py-0 ${sc.severity === "Critical" ? "text-red-500 border-red-500/40" : sc.severity === "High" ? "text-orange-500 border-orange-500/40" : "text-amber-500 border-amber-500/40"}`}
                        >
                          {sc.severity}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{sc.description}</p>
                      <p className="text-muted-foreground/60 mt-0.5">Penalty: {sc.penalty}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Historical Slashing Incidents */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Historical Slashing Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {["Date", "Entity", "Validators Slashed", "ETH Lost", "Root Cause"].map((h) => (
                          <th key={h} className="pb-2 pr-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {SLASHING_INCIDENTS.map((inc) => (
                        <tr key={`${inc.date}-${inc.protocol}`} className="hover:bg-muted/20 transition-colors">
                          <td className="py-2 pr-3 text-muted-foreground">{inc.date}</td>
                          <td className="py-2 pr-3 text-foreground font-medium">{inc.protocol}</td>
                          <td className="py-2 pr-3 text-red-400">{inc.validatorsSlashed}</td>
                          <td className="py-2 pr-3 text-red-400">{inc.ethLost} ETH</td>
                          <td className="py-2 pr-3 text-muted-foreground">{inc.cause}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Risk Mitigation */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Slashing Risk Mitigation Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {mitigations.map((m, i) => (
                    <div key={i} className="flex items-start gap-2 rounded border border-border bg-card/40 p-2.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">{m}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-border bg-primary/5 p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-primary mb-1">
                    <Info className="w-3.5 h-3.5" />
                    DVT: Distributed Validator Technology
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    DVT (Obol Network, SSV Network) splits a validator key among multiple nodes using threshold signatures (e.g., 3-of-5 Shamir shares). A node can go offline without causing a slashable event, dramatically improving fault tolerance for institutional operators.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
