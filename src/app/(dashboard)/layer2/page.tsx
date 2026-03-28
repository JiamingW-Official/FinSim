"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Zap,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Code2,
  Activity,
  DollarSign,
  Globe,
  Lock,
  Cpu,
  GitBranch,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 692005;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Data ───────────────────────────────────────────────────────────────────────

interface L2Protocol {
  name: string;
  color: string;
  tvlB: number;
  tps: number;
  type: "optimistic" | "zk";
  token: string;
  chains: number;
  avgFeeUSD: number;
  weeklyGrowth: number;
  protocols: number;
}

const L2_PROTOCOLS: L2Protocol[] = [
  {
    name: "Arbitrum",
    color: "#2D74DA",
    tvlB: 18.4 + rand() * 2,
    tps: 40 + rand() * 20,
    type: "optimistic",
    token: "ARB",
    chains: 1,
    avgFeeUSD: 0.05 + rand() * 0.05,
    weeklyGrowth: 3.2 + rand() * 2,
    protocols: 680,
  },
  {
    name: "Optimism",
    color: "#FF0420",
    tvlB: 7.1 + rand() * 1,
    tps: 30 + rand() * 10,
    type: "optimistic",
    token: "OP",
    chains: 8,
    avgFeeUSD: 0.04 + rand() * 0.04,
    weeklyGrowth: 5.1 + rand() * 2,
    protocols: 290,
  },
  {
    name: "Base",
    color: "#0052FF",
    tvlB: 9.2 + rand() * 1.5,
    tps: 55 + rand() * 15,
    type: "optimistic",
    token: "ETH",
    chains: 1,
    avgFeeUSD: 0.03 + rand() * 0.03,
    weeklyGrowth: 12.4 + rand() * 4,
    protocols: 420,
  },
  {
    name: "zkSync",
    color: "#8B5CF6",
    tvlB: 3.4 + rand() * 0.8,
    tps: 100 + rand() * 50,
    type: "zk",
    token: "ZK",
    chains: 2,
    avgFeeUSD: 0.02 + rand() * 0.02,
    weeklyGrowth: 7.8 + rand() * 3,
    protocols: 210,
  },
  {
    name: "Starknet",
    color: "#EC4899",
    tvlB: 1.2 + rand() * 0.3,
    tps: 80 + rand() * 40,
    type: "zk",
    token: "STRK",
    chains: 1,
    avgFeeUSD: 0.015 + rand() * 0.015,
    weeklyGrowth: 9.3 + rand() * 5,
    protocols: 130,
  },
  {
    name: "Polygon",
    color: "#7B3FE4",
    tvlB: 4.8 + rand() * 0.8,
    tps: 65 + rand() * 25,
    type: "zk",
    token: "POL",
    chains: 3,
    avgFeeUSD: 0.02 + rand() * 0.02,
    weeklyGrowth: 2.1 + rand() * 2,
    protocols: 450,
  },
];

interface FeeRow {
  network: string;
  type: string;
  avgFee: number;
  color: string;
}

const FEE_TABLE: FeeRow[] = [
  { network: "Ethereum L1", type: "Base", avgFee: 4.2, color: "#627EEA" },
  { network: "Arbitrum", type: "Optimistic", avgFee: 0.08, color: "#2D74DA" },
  { network: "Optimism", type: "Optimistic", avgFee: 0.07, color: "#FF0420" },
  { network: "Base", type: "Optimistic", avgFee: 0.05, color: "#0052FF" },
  { network: "zkSync", type: "ZK Rollup", avgFee: 0.03, color: "#8B5CF6" },
  { network: "Starknet", type: "ZK Rollup", avgFee: 0.02, color: "#EC4899" },
  { network: "Polygon zkEVM", type: "ZK Rollup", avgFee: 0.03, color: "#7B3FE4" },
];

interface EcosystemMetric {
  label: string;
  arbitrum: number | string;
  optimism: number | string;
  base: number | string;
  unit: string;
}

const ECOSYSTEM: EcosystemMetric[] = [
  { label: "Unique Wallets (M)", arbitrum: 4.8, optimism: 3.2, base: 5.1, unit: "M" },
  { label: "Daily Active Users (K)", arbitrum: 180, optimism: 120, base: 290, unit: "K" },
  { label: "Weekly Txns (M)", arbitrum: 22, optimism: 14, base: 38, unit: "M" },
  { label: "Protocols Deployed", arbitrum: 680, optimism: 290, base: 420, unit: "" },
  { label: "Bridge Volume 30d ($B)", arbitrum: 3.4, optimism: 1.8, base: 2.9, unit: "B" },
];

// Monthly user growth data (12 months) for adoption SVG chart
const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
const ADOPTION_DATA = MONTHS.map((m, i) => ({
  month: m,
  arbitrum: 1.2 + i * 0.32 + rand() * 0.2,
  optimism: 0.8 + i * 0.21 + rand() * 0.15,
  base: 0.2 + i * 0.41 + rand() * 0.25,
}));

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtB(n: number, d = 1): string {
  return `$${n.toFixed(d)}B`;
}

function fmtUSD(n: number, d = 2): string {
  return `$${n.toFixed(d)}`;
}

function fmtPct(n: number, d = 1): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(d)}%`;
}

// ── Shared UI Components ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  highlight?: "green" | "red" | "blue";
}) {
  const colors = {
    green: "text-emerald-400",
    red: "text-red-400",
    blue: "text-blue-400",
  };
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
        {icon}
        {label}
      </div>
      <div className={cn("text-xl font-semibold", highlight ? colors[highlight] : "text-neutral-100")}>
        {value}
      </div>
      {sub && <div className="text-xs text-neutral-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
      <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>
    </div>
  );
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-900/40 bg-blue-950/20 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-300 mb-2">
        <Info size={14} />
        {title}
      </div>
      <div className="text-sm text-neutral-300 leading-relaxed">{children}</div>
    </div>
  );
}

// ── Tab 1: Scaling Landscape ──────────────────────────────────────────────────

function TVLBarChart() {
  const maxTvl = Math.max(...L2_PROTOCOLS.map((p) => p.tvlB));
  const W = 520;
  const H = 200;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 32;
  const barW = ((W - padL - padR) / L2_PROTOCOLS.length) * 0.65;
  const gap = (W - padL - padR) / L2_PROTOCOLS.length;

  const yLines = [0, 5, 10, 15, 20];

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-sm font-medium text-neutral-300 mb-3">Total Value Locked (TVL) by L2</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {yLines.map((v) => {
          const y = padT + (H - padT - padB) * (1 - v / (maxTvl * 1.1));
          return (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#262626" strokeWidth={1} />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#737373">
                ${v}B
              </text>
            </g>
          );
        })}
        {L2_PROTOCOLS.map((p, i) => {
          const x = padL + i * gap + gap * 0.175;
          const barH = ((H - padT - padB) * p.tvlB) / (maxTvl * 1.1);
          const y = padT + (H - padT - padB) - barH;
          return (
            <g key={p.name}>
              <rect x={x} y={y} width={barW} height={barH} fill={p.color} rx={3} opacity={0.85} />
              <text x={x + barW / 2} y={H - padB + 14} textAnchor="middle" fontSize={10} fill="#a3a3a3">
                {p.name}
              </text>
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fill={p.color}>
                {fmtB(p.tvlB)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TPSChart() {
  const maxTps = Math.max(...L2_PROTOCOLS.map((p) => p.tps));
  const W = 520;
  const H = 160;
  const padL = 80;
  const padR = 20;
  const padT = 16;
  const padB = 16;
  const rowH = (H - padT - padB) / L2_PROTOCOLS.length;

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-sm font-medium text-neutral-300 mb-3">Transactions Per Second (TPS) Capacity</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {L2_PROTOCOLS.map((p, i) => {
          const y = padT + i * rowH + rowH * 0.1;
          const bh = rowH * 0.7;
          const bw = ((W - padL - padR) * p.tps) / (maxTps * 1.05);
          return (
            <g key={p.name}>
              <text x={padL - 6} y={y + bh / 2 + 4} textAnchor="end" fontSize={10} fill="#a3a3a3">
                {p.name}
              </text>
              <rect x={padL} y={y} width={bw} height={bh} fill={p.color} rx={2} opacity={0.8} />
              <text x={padL + bw + 6} y={y + bh / 2 + 4} fontSize={10} fill={p.color}>
                {Math.round(p.tps)} TPS
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ScalingLandscape() {
  const totalTvl = L2_PROTOCOLS.reduce((a, b) => a + b.tvlB, 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="L2 Scaling Landscape"
        subtitle="Overview of leading Ethereum Layer 2 networks by TVL, throughput, and adoption"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total L2 TVL" value={fmtB(totalTvl)} sub="Across all L2s" icon={<Layers size={12} />} highlight="blue" />
        <StatCard label="Leading Network" value="Arbitrum" sub={fmtB(L2_PROTOCOLS[0].tvlB) + " TVL"} icon={<TrendingUp size={12} />} />
        <StatCard label="Fastest Growing" value="Base" sub="+12.4% / week" icon={<Zap size={12} />} highlight="green" />
        <StatCard label="Combined TPS" value={`${Math.round(L2_PROTOCOLS.reduce((a, b) => a + b.tps, 0))} TPS`} sub="vs Ethereum 15 TPS" icon={<Activity size={12} />} />
      </div>

      <TVLBarChart />
      <TPSChart />

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="text-sm font-medium text-neutral-300 p-4 border-b border-neutral-800">
          L2 Protocol Comparison Table
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-neutral-500 border-b border-neutral-800">
                <th className="text-left px-4 py-2">Network</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-right px-4 py-2">TVL</th>
                <th className="text-right px-4 py-2">TPS</th>
                <th className="text-right px-4 py-2">Avg Fee</th>
                <th className="text-right px-4 py-2">Protocols</th>
                <th className="text-right px-4 py-2">7d Growth</th>
              </tr>
            </thead>
            <tbody>
              {L2_PROTOCOLS.map((p) => (
                <tr key={p.name} className="border-b border-neutral-800/60 hover:bg-neutral-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="font-medium text-neutral-200">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs border",
                        p.type === "zk"
                          ? "border-purple-700 text-purple-300"
                          : "border-orange-700 text-orange-300"
                      )}
                    >
                      {p.type === "zk" ? "ZK Rollup" : "Optimistic"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-200">{fmtB(p.tvlB)}</td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-300">{Math.round(p.tps)}</td>
                  <td className="px-4 py-3 text-right font-mono text-green-400">{fmtUSD(p.avgFeeUSD, 3)}</td>
                  <td className="px-4 py-3 text-right text-neutral-300">{p.protocols}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.weeklyGrowth >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {fmtPct(p.weeklyGrowth)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InfoBox title="What is Layer 2?">
        Layer 2 networks are blockchains built on top of Ethereum (Layer 1) that process transactions off-chain
        and periodically post compressed data back to Ethereum for final settlement. They inherit Ethereum's
        security while achieving dramatically higher throughput and lower fees — enabling the next generation
        of scalable decentralized applications.
      </InfoBox>
    </div>
  );
}

// ── Tab 2: Rollup Technology ──────────────────────────────────────────────────

function RollupDiagram({ type }: { type: "optimistic" | "zk" }) {
  const isOptimistic = type === "optimistic";
  const W = 520;
  const H = 220;

  const boxes: { x: number; y: number; w: number; h: number; label: string; sub: string; color: string }[] =
    isOptimistic
      ? [
          { x: 20, y: 80, w: 110, h: 60, label: "Transactions", sub: "User batch", color: "#2D74DA" },
          { x: 160, y: 80, w: 110, h: 60, label: "Sequencer", sub: "Orders & batches", color: "#2D74DA" },
          { x: 300, y: 80, w: 110, h: 60, label: "State Root", sub: "Posted to L1", color: "#0EA5E9" },
          { x: 200, y: 170, w: 120, h: 44, label: "7-Day Window", sub: "Fraud proof challenge", color: "#F59E0B" },
        ]
      : [
          { x: 20, y: 80, w: 110, h: 60, label: "Transactions", sub: "User batch", color: "#8B5CF6" },
          { x: 160, y: 80, w: 110, h: 60, label: "Prover", sub: "Generates ZK proof", color: "#8B5CF6" },
          { x: 300, y: 80, w: 110, h: 60, label: "Verifier", sub: "L1 smart contract", color: "#EC4899" },
          { x: 200, y: 170, w: 120, h: 44, label: "Instant Finality", sub: "Validity proof verified", color: "#10B981" },
        ];

  const arrows = [
    { x1: 130, y1: 110, x2: 158, y2: 110 },
    { x1: 270, y1: 110, x2: 298, y2: 110 },
    { x1: 355, y1: 140, x2: 290, y2: 168 },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={24} textAnchor="middle" fontSize={13} fontWeight="600" fill="#e5e5e5">
        {isOptimistic ? "Optimistic Rollup Architecture" : "ZK Rollup Architecture"}
      </text>
      {arrows.map((a, i) => (
        <g key={i}>
          <line
            x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke="#525252" strokeWidth={1.5} markerEnd="url(#arrow)"
          />
        </g>
      ))}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#525252" />
        </marker>
      </defs>
      {boxes.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6} fill={b.color} fillOpacity={0.15} stroke={b.color} strokeOpacity={0.5} strokeWidth={1} />
          <text x={b.x + b.w / 2} y={b.y + b.h / 2 - 6} textAnchor="middle" fontSize={11} fontWeight="600" fill="#e5e5e5">
            {b.label}
          </text>
          <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 10} textAnchor="middle" fontSize={9} fill="#a3a3a3">
            {b.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

interface RollupFeature {
  feature: string;
  optimistic: string;
  zk: string;
  winner: "optimistic" | "zk" | "tie";
}

const ROLLUP_COMPARE: RollupFeature[] = [
  { feature: "Finality Time", optimistic: "~7 days (fraud proof)", zk: "Minutes (validity proof)", winner: "zk" },
  { feature: "EVM Compatibility", optimistic: "Full EVM equivalent", zk: "Varies (improving rapidly)", winner: "optimistic" },
  { feature: "Proof Computation", optimistic: "No proof needed", zk: "Expensive ZK computation", winner: "optimistic" },
  { feature: "Security Model", optimistic: "Fraud proof (assume valid)", zk: "Validity proof (verify math)", winner: "zk" },
  { feature: "Capital Efficiency", optimistic: "Poor (7-day lockup)", zk: "Excellent (instant withdrawal)", winner: "zk" },
  { feature: "Decentralization", optimistic: "Easier to decentralize", zk: "Complex prover networks", winner: "optimistic" },
  { feature: "Data Availability", optimistic: "All data on L1", zk: "Proof + state diff on L1", winner: "zk" },
];

function RollupTechnology() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const details: Record<string, string> = {
    "Fraud Proof": `In Optimistic Rollups, transactions are assumed valid by default. Any validator can
      challenge a suspicious state transition within the 7-day window by submitting a fraud proof.
      If the proof is valid, the invalid batch is rolled back and the submitter is slashed.`,
    "Validity Proof": `ZK Rollups use zero-knowledge proofs (SNARKs or STARKs) to mathematically prove
      every state transition is correct without revealing the underlying data. The L1 verifier contract
      checks this proof instantly — no challenge window needed.`,
    "Sequencer": `A sequencer collects transactions, orders them into batches, executes them off-chain,
      and posts compressed calldata + state root to L1. Most L2s use a centralized sequencer today,
      but decentralization via sequencer rotation or auction mechanisms is actively being developed.`,
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Rollup Technology Deep Dive"
        subtitle="How Optimistic and ZK Rollups scale Ethereum through different cryptographic approaches"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-blue-900/50 bg-neutral-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-orange-400" />
            <span className="text-sm font-medium text-orange-300">Optimistic Rollups</span>
            <Badge variant="outline" className="text-xs border-orange-700 text-orange-400 ml-auto">7-day window</Badge>
          </div>
          <RollupDiagram type="optimistic" />
          <div className="mt-3 text-xs text-neutral-400 leading-relaxed">
            Assume transactions are valid; rely on fraud proofs submitted during a 7-day challenge window
            to catch invalid state transitions. Simple but introduces withdrawal delay.
          </div>
          <div className="mt-2 space-y-1">
            {["Arbitrum (Fraud Proof via BOLD)", "Optimism (Cannon fault proofs)", "Base (OP Stack)"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-neutral-400">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-purple-900/50 bg-neutral-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-purple-400" />
            <span className="text-sm font-medium text-purple-300">ZK Rollups</span>
            <Badge variant="outline" className="text-xs border-purple-700 text-purple-400 ml-auto">Instant finality</Badge>
          </div>
          <RollupDiagram type="zk" />
          <div className="mt-3 text-xs text-neutral-400 leading-relaxed">
            Cryptographically prove every state transition is valid. No challenge window — finality is
            achieved the moment the L1 verifier contract accepts the ZK proof. Higher computation overhead.
          </div>
          <div className="mt-2 space-y-1">
            {["zkSync Era (zkEVM)", "Starknet (Cairo + STARKs)", "Polygon zkEVM"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-neutral-400">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="text-sm font-medium text-neutral-300 p-4 border-b border-neutral-800">
          Head-to-Head Comparison
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-neutral-500 border-b border-neutral-800">
              <th className="text-left px-4 py-2">Feature</th>
              <th className="text-left px-4 py-2 text-orange-400">Optimistic</th>
              <th className="text-left px-4 py-2 text-purple-400">ZK Rollup</th>
              <th className="text-center px-4 py-2">Winner</th>
            </tr>
          </thead>
          <tbody>
            {ROLLUP_COMPARE.map((row) => (
              <tr key={row.feature} className="border-b border-neutral-800/60 hover:bg-neutral-800/40">
                <td className="px-4 py-2.5 text-neutral-300 font-medium text-xs">{row.feature}</td>
                <td className="px-4 py-2.5 text-xs text-neutral-400">{row.optimistic}</td>
                <td className="px-4 py-2.5 text-xs text-neutral-400">{row.zk}</td>
                <td className="px-4 py-2.5 text-center">
                  {row.winner === "zk" ? (
                    <span className="text-xs text-purple-400 font-medium">ZK</span>
                  ) : row.winner === "optimistic" ? (
                    <span className="text-xs text-orange-400 font-medium">Opt.</span>
                  ) : (
                    <span className="text-xs text-neutral-500">Tie</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-neutral-300">Key Concepts</div>
        {Object.entries(details).map(([title, body]) => (
          <div key={title} className="rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === title ? null : title)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-800/50"
            >
              <span className="font-medium">{title}</span>
              {expanded === title ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <AnimatePresence initial={false}>
              {expanded === title && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800">
                    {body}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 3: L2 Token Economics ─────────────────────────────────────────────────

interface TokenUtility {
  name: string;
  token: string;
  color: string;
  governance: boolean;
  feePayment: boolean;
  sequencerStaking: boolean;
  seqRevenue30d: number;
  circSupply: number;
  fdv: number;
}

const TOKEN_DATA: TokenUtility[] = [
  { name: "Arbitrum", token: "ARB", color: "#2D74DA", governance: true, feePayment: false, sequencerStaking: false, seqRevenue30d: 8.2, circSupply: 3200, fdv: 9.8 },
  { name: "Optimism", token: "OP", color: "#FF0420", governance: true, feePayment: false, sequencerStaking: false, seqRevenue30d: 4.1, circSupply: 1100, fdv: 6.2 },
  { name: "zkSync", token: "ZK", color: "#8B5CF6", governance: true, feePayment: true, sequencerStaking: true, seqRevenue30d: 1.9, circSupply: 3400, fdv: 3.4 },
  { name: "Starknet", token: "STRK", color: "#EC4899", governance: true, feePayment: true, sequencerStaking: false, seqRevenue30d: 0.7, circSupply: 1800, fdv: 2.1 },
  { name: "Polygon", token: "POL", color: "#7B3FE4", governance: true, feePayment: true, sequencerStaking: true, seqRevenue30d: 2.8, circSupply: 9200, fdv: 5.1 },
];

function RevenueBarChart() {
  const max = Math.max(...TOKEN_DATA.map((t) => t.seqRevenue30d));
  const W = 520;
  const H = 140;
  const padL = 90;
  const padR = 80;
  const padT = 16;
  const padB = 16;
  const rowH = (H - padT - padB) / TOKEN_DATA.length;

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-sm font-medium text-neutral-300 mb-3">Sequencer Revenue (30-day, $M)</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {TOKEN_DATA.map((t, i) => {
          const y = padT + i * rowH + rowH * 0.1;
          const bh = rowH * 0.7;
          const bw = ((W - padL - padR) * t.seqRevenue30d) / (max * 1.05);
          return (
            <g key={t.name}>
              <text x={padL - 6} y={y + bh / 2 + 4} textAnchor="end" fontSize={10} fill="#a3a3a3">
                {t.name}
              </text>
              <rect x={padL} y={y} width={bw} height={bh} fill={t.color} rx={2} opacity={0.8} />
              <text x={padL + bw + 6} y={y + bh / 2 + 4} fontSize={10} fill={t.color}>
                ${t.seqRevenue30d.toFixed(1)}M
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function FeeComparisonChart() {
  const max = Math.max(...FEE_TABLE.map((f) => f.avgFee));
  const W = 520;
  const H = 180;
  const padL = 110;
  const padR = 60;
  const padT = 16;
  const padB = 16;
  const rowH = (H - padT - padB) / FEE_TABLE.length;

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-sm font-medium text-neutral-300 mb-3">Average Transaction Fee Comparison</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {FEE_TABLE.map((f, i) => {
          const y = padT + i * rowH + rowH * 0.1;
          const bh = rowH * 0.72;
          const bw = Math.max(4, ((W - padL - padR) * f.avgFee) / (max * 1.05));
          return (
            <g key={f.network}>
              <text x={padL - 6} y={y + bh / 2 + 4} textAnchor="end" fontSize={9.5} fill="#a3a3a3">
                {f.network}
              </text>
              <rect x={padL} y={y} width={bw} height={bh} fill={f.color} rx={2} opacity={0.8} />
              <text x={padL + bw + 5} y={y + bh / 2 + 4} fontSize={9.5} fill={f.color}>
                {f.avgFee < 1 ? `$${f.avgFee.toFixed(2)}` : `$${f.avgFee.toFixed(2)}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function L2TokenEconomics() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="L2 Token Economics"
        subtitle="Sequencer revenue models, token utility frameworks, and L2 vs L1 fee dynamics"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Avg L1 Fee" value="$4.20" sub="Per transaction" icon={<DollarSign size={12} />} highlight="red" />
        <StatCard label="Avg L2 Fee" value="$0.05" sub="98.8% cheaper" icon={<DollarSign size={12} />} highlight="green" />
        <StatCard label="L2 Seq. Revenue" value="$17.7M" sub="30-day combined" icon={<BarChart3 size={12} />} />
        <StatCard label="Fee Compression" value="99%+" sub="Post EIP-4844" icon={<TrendingDown size={12} />} highlight="green" />
      </div>

      <RevenueBarChart />
      <FeeComparisonChart />

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="text-sm font-medium text-neutral-300 p-4 border-b border-neutral-800">
          Token Utility Matrix
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-neutral-500 border-b border-neutral-800">
                <th className="text-left px-4 py-2">Token</th>
                <th className="text-center px-4 py-2">Governance</th>
                <th className="text-center px-4 py-2">Fee Payment</th>
                <th className="text-center px-4 py-2">Seq. Staking</th>
                <th className="text-right px-4 py-2">Circ. Supply (M)</th>
                <th className="text-right px-4 py-2">FDV ($B)</th>
              </tr>
            </thead>
            <tbody>
              {TOKEN_DATA.map((t) => (
                <tr key={t.token} className="border-b border-neutral-800/60 hover:bg-neutral-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="font-medium text-neutral-200">{t.name}</span>
                      <span className="text-xs text-neutral-500">{t.token}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {t.governance ? <CheckCircle size={14} className="mx-auto text-emerald-400" /> : <span className="text-neutral-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {t.feePayment ? <CheckCircle size={14} className="mx-auto text-emerald-400" /> : <span className="text-neutral-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {t.sequencerStaking ? <CheckCircle size={14} className="mx-auto text-emerald-400" /> : <span className="text-neutral-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-300">{t.circSupply.toLocaleString()}M</td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-300">${t.fdv.toFixed(1)}B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <div className="text-sm font-medium text-neutral-300 mb-3 flex items-center gap-2">
            <DollarSign size={14} className="text-emerald-400" />
            L2 Fee Economics
          </div>
          <div className="space-y-2 text-xs text-neutral-400">
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span>L2 Execution Fee</span>
              <span className="text-emerald-400">~$0.001–$0.01</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span>L1 Data Posting Cost</span>
              <span className="text-yellow-400">~$0.01–$0.05</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span>Sequencer Margin</span>
              <span className="text-blue-400">~10–30%</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span>Post EIP-4844 Savings</span>
              <span className="text-emerald-400">~90–95% reduction</span>
            </div>
            <div className="flex justify-between">
              <span>Target Long-run Fee</span>
              <span className="text-purple-400">&lt;$0.001</span>
            </div>
          </div>
        </div>

        <InfoBox title="EIP-4844 Proto-Danksharding Impact">
          Introduced in March 2024, EIP-4844 added a new "blob" transaction type allowing L2s to post
          data as cheap temporary blobs rather than expensive calldata. This reduced L2 data posting
          costs by 90–95%, passing savings directly to users. Arbitrum fees dropped from ~$0.50 to
          under $0.01 post-activation.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 4: Developer Ecosystem ────────────────────────────────────────────────

function AdoptionChart() {
  const W = 520;
  const H = 200;
  const padL = 40;
  const padR = 20;
  const padT = 24;
  const padB = 30;
  const maxVal = 6;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const lines = [
    { key: "arbitrum" as const, color: "#2D74DA", label: "Arbitrum" },
    { key: "optimism" as const, color: "#FF0420", label: "Optimism" },
    { key: "base" as const, color: "#0052FF", label: "Base" },
  ];

  function toX(i: number) {
    return padL + (i / (ADOPTION_DATA.length - 1)) * chartW;
  }
  function toY(v: number) {
    return padT + chartH * (1 - v / maxVal);
  }

  const yTicks = [0, 2, 4, 6];

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-sm font-medium text-neutral-300 mb-1">Cumulative Unique Wallet Growth (Millions)</div>
      <div className="flex gap-4 mb-3">
        {lines.map((l) => (
          <div key={l.key} className="flex items-center gap-1.5 text-xs" style={{ color: l.color }}>
            <div className="w-4 h-0.5" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {yTicks.map((v) => {
          const y = toY(v);
          return (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#262626" strokeWidth={1} />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#737373">
                {v}M
              </text>
            </g>
          );
        })}
        {ADOPTION_DATA.map((d, i) => {
          if (i % 3 === 0) {
            return (
              <text key={d.month} x={toX(i)} y={H - padB + 14} textAnchor="middle" fontSize={9} fill="#737373">
                {d.month}
              </text>
            );
          }
          return null;
        })}
        {lines.map((l) => {
          const pts = ADOPTION_DATA.map((d, i) => `${toX(i)},${toY(d[l.key])}`).join(" ");
          return (
            <polyline key={l.key} points={pts} fill="none" stroke={l.color} strokeWidth={1.5} strokeOpacity={0.9} />
          );
        })}
        {lines.map((l) =>
          ADOPTION_DATA.map((d, i) => (
            <circle key={`${l.key}-${i}`} cx={toX(i)} cy={toY(d[l.key])} r={2} fill={l.color} fillOpacity={0.7} />
          ))
        )}
      </svg>
    </div>
  );
}

function DeveloperEcosystem() {
  const evmFeatures = [
    { label: "Solidity / Vyper Support", arbitrum: true, optimism: true, zksync: true, starknet: false },
    { label: "Hardhat / Foundry", arbitrum: true, optimism: true, zksync: true, starknet: false },
    { label: "Ethers.js / Wagmi", arbitrum: true, optimism: true, zksync: true, starknet: false },
    { label: "EVM Opcodes", arbitrum: true, optimism: true, zksync: true, starknet: false },
    { label: "Cairo Lang", arbitrum: false, optimism: false, zksync: false, starknet: true },
    { label: "Account Abstraction", arbitrum: false, optimism: false, zksync: true, starknet: true },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Developer Ecosystem"
        subtitle="EVM compatibility, protocol deployments, bridge activity, and developer tooling across L2 networks"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total L2 Protocols" value="1,980+" sub="Across 6 networks" icon={<Code2 size={12} />} />
        <StatCard label="Daily Devs Active" value="12,400" sub="+34% YoY" icon={<Globe size={12} />} highlight="green" />
        <StatCard label="Bridge Volume (7d)" value="$4.2B" sub="L1 ↔ L2 flows" icon={<GitBranch size={12} />} />
        <StatCard label="EVM Compatible" value="5 / 6" sub="Starknet uses Cairo" icon={<Cpu size={12} />} />
      </div>

      <AdoptionChart />

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="text-sm font-medium text-neutral-300 p-4 border-b border-neutral-800">
          EVM Compatibility Matrix
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-neutral-500 border-b border-neutral-800">
                <th className="text-left px-4 py-2">Feature</th>
                <th className="text-center px-4 py-2 text-blue-400">Arbitrum</th>
                <th className="text-center px-4 py-2 text-red-400">Optimism</th>
                <th className="text-center px-4 py-2 text-purple-400">zkSync</th>
                <th className="text-center px-4 py-2 text-pink-400">Starknet</th>
              </tr>
            </thead>
            <tbody>
              {evmFeatures.map((f) => (
                <tr key={f.label} className="border-b border-neutral-800/60 hover:bg-neutral-800/40">
                  <td className="px-4 py-2.5 text-xs text-neutral-300">{f.label}</td>
                  {(["arbitrum", "optimism", "zksync", "starknet"] as const).map((k) => (
                    <td key={k} className="px-4 py-2.5 text-center">
                      {f[k] ? (
                        <CheckCircle size={13} className="mx-auto text-emerald-400" />
                      ) : (
                        <span className="text-neutral-700 text-xs">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="text-sm font-medium text-neutral-300 p-4 border-b border-neutral-800">
          User Growth Metrics
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-neutral-500 border-b border-neutral-800">
                <th className="text-left px-4 py-2">Metric</th>
                <th className="text-right px-4 py-2 text-blue-400">Arbitrum</th>
                <th className="text-right px-4 py-2 text-red-400">Optimism</th>
                <th className="text-right px-4 py-2 text-indigo-400">Base</th>
              </tr>
            </thead>
            <tbody>
              {ECOSYSTEM.map((row) => (
                <tr key={row.label} className="border-b border-neutral-800/60 hover:bg-neutral-800/40">
                  <td className="px-4 py-2.5 text-xs text-neutral-300">{row.label}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-neutral-200">
                    {typeof row.arbitrum === "number"
                      ? row.unit === "B"
                        ? `$${row.arbitrum.toFixed(1)}B`
                        : `${row.arbitrum.toLocaleString()}${row.unit}`
                      : row.arbitrum}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-neutral-200">
                    {typeof row.optimism === "number"
                      ? row.unit === "B"
                        ? `$${row.optimism.toFixed(1)}B`
                        : `${row.optimism.toLocaleString()}${row.unit}`
                      : row.optimism}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-neutral-200">
                    {typeof row.base === "number"
                      ? row.unit === "B"
                        ? `$${row.base.toFixed(1)}B`
                        : `${row.base.toLocaleString()}${row.unit}`
                      : row.base}
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

// ── Tab 5: Investment Thesis ──────────────────────────────────────────────────

interface ValuationMetric {
  name: string;
  color: string;
  priceToFees: number;
  priceToTvl: number;
  revGrowth: number;
  riskLevel: "Low" | "Medium" | "High";
}

const VALUATION_DATA: ValuationMetric[] = [
  { name: "Arbitrum", color: "#2D74DA", priceToFees: 28, priceToTvl: 0.53, revGrowth: 34, riskLevel: "Medium" },
  { name: "Optimism", color: "#FF0420", priceToFees: 38, priceToTvl: 0.87, revGrowth: 28, riskLevel: "Medium" },
  { name: "zkSync", color: "#8B5CF6", priceToFees: 45, priceToTvl: 1.0, revGrowth: 62, riskLevel: "High" },
  { name: "Starknet", color: "#EC4899", priceToFees: 72, priceToTvl: 1.75, revGrowth: 89, riskLevel: "High" },
  { name: "Polygon", color: "#7B3FE4", priceToFees: 22, priceToTvl: 1.06, revGrowth: 18, riskLevel: "Low" },
];

interface RoadmapItem {
  phase: string;
  title: string;
  status: "live" | "upcoming" | "research";
  description: string;
  impact: string;
}

const ETH_ROADMAP: RoadmapItem[] = [
  {
    phase: "Live",
    title: "EIP-4844 (Proto-Danksharding)",
    status: "live",
    description: "Blob transactions reduce L2 data costs by 90%. Deployed March 2024.",
    impact: "Immediate 90% fee reduction for all rollups",
  },
  {
    phase: "2025",
    title: "Verkle Trees",
    status: "upcoming",
    description: "Replace Merkle trees with Verkle trees to reduce proof size and enable statelessness.",
    impact: "Faster sync, smaller nodes, better decentralization",
  },
  {
    phase: "2026",
    title: "Full Danksharding",
    status: "upcoming",
    description: "32MB+ blob capacity per block via Data Availability Sampling (DAS). 100x blob throughput.",
    impact: "L2 fees approach zero; enables millions of TPS across L2 ecosystem",
  },
  {
    phase: "Research",
    title: "ZK-EVM on L1",
    status: "research",
    description: "Native ZK proofs for Ethereum L1 execution. Every L1 block proven by ZK proof.",
    impact: "Ethereum becomes a ZK-proven global settlement layer",
  },
];

function InvestmentThesis() {
  const statusColor = (s: RoadmapItem["status"]) =>
    s === "live" ? "text-emerald-400 border-emerald-700" : s === "upcoming" ? "text-blue-400 border-blue-700" : "text-purple-400 border-purple-700";

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Investment Thesis"
        subtitle="L2 vs L1 positioning, Ethereum roadmap catalysts, modular blockchain thesis, and valuation frameworks"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-900/40 bg-neutral-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Bull Case — L2 Tokens</span>
          </div>
          <ul className="space-y-2 text-xs text-neutral-400">
            {[
              "EIP-4844 already delivered 90% fee reduction; Full Danksharding drives fees to near-zero",
              "Sequencer revenue growing 3–5x annually as user adoption scales",
              "Superchain & OP Stack ecosystem creates network effects across Optimism, Base, and 20+ chains",
              "ZK proofs enabling privacy, cross-chain interoperability, and institutional DeFi",
              "Real-world asset (RWA) tokenization migrating trillions to L2 rails",
              "Account abstraction on ZK L2s enables consumer-grade UX eliminating seed phrase friction",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-red-900/40 bg-neutral-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={15} className="text-red-400" />
            <span className="text-sm font-medium text-red-300">Bear Case — Key Risks</span>
          </div>
          <ul className="space-y-2 text-xs text-neutral-400">
            {[
              "L2 fragmentation creates liquidity silos; cross-chain bridges remain major attack surfaces",
              "Sequencer centralization risk — most L2s run single sequencers with liveness and censorship risk",
              "Token inflation from unlocks (ARB, OP vesting schedules) creates supply pressure",
              "Solana and alternative L1s compete for developer mindshare with simpler UX",
              "Regulatory risk around sequencer operators being classified as financial intermediaries",
              "ZK proof generation remains computationally expensive; prover centralization risk",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <AlertTriangle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="text-sm font-medium text-neutral-300 mb-4 flex items-center gap-2">
          <Lock size={14} className="text-blue-400" />
          Ethereum Roadmap — L2 Catalysts
        </div>
        <div className="space-y-3">
          {ETH_ROADMAP.map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                  item.status === "live" ? "bg-emerald-400" : item.status === "upcoming" ? "bg-blue-400" : "bg-purple-400"
                )} />
                <div className="w-px flex-1 bg-neutral-800 mt-1" />
              </div>
              <div className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-neutral-200">{item.title}</span>
                  <Badge variant="outline" className={cn("text-xs border", statusColor(item.status))}>
                    {item.phase}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-400 mb-1">{item.description}</p>
                <div className="flex items-center gap-1 text-xs">
                  <ArrowRight size={11} className="text-emerald-500" />
                  <span className="text-emerald-400">{item.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="text-sm font-medium text-neutral-300 p-4 border-b border-neutral-800">
          L2 Valuation Framework
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-neutral-500 border-b border-neutral-800">
                <th className="text-left px-4 py-2">Network</th>
                <th className="text-right px-4 py-2">Price/Fees</th>
                <th className="text-right px-4 py-2">Price/TVL</th>
                <th className="text-right px-4 py-2">Rev Growth</th>
                <th className="text-center px-4 py-2">Risk</th>
              </tr>
            </thead>
            <tbody>
              {VALUATION_DATA.map((v) => (
                <tr key={v.name} className="border-b border-neutral-800/60 hover:bg-neutral-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                      <span className="font-medium text-neutral-200 text-xs">{v.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-neutral-300">{v.priceToFees}x</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-neutral-300">{v.priceToTvl.toFixed(2)}x</td>
                  <td className="px-4 py-3 text-right text-xs text-emerald-400">+{v.revGrowth}%</td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant="outline"
                      className={cn("text-xs border",
                        v.riskLevel === "Low" ? "border-emerald-700 text-emerald-400" :
                        v.riskLevel === "Medium" ? "border-yellow-700 text-yellow-400" :
                        "border-red-700 text-red-400"
                      )}
                    >
                      {v.riskLevel}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-neutral-800 text-xs text-neutral-500">
          Price/Fees = Market Cap / Annualized Sequencer Revenue. Price/TVL = Market Cap / Protocol TVL.
          Lower ratios indicate relative value vs peers.
        </div>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="text-sm font-medium text-neutral-300 mb-3 flex items-center gap-2">
          <Layers size={14} className="text-purple-400" />
          Modular Blockchain Thesis
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              title: "Settlement",
              desc: "Ethereum L1 finalizes L2 state roots. Provides maximal security guarantees backed by $400B+ in staked ETH.",
              color: "#627EEA",
            },
            {
              title: "Execution",
              desc: "L2 rollups handle computation at scale. Each L2 optimizes for its use case — DeFi, gaming, social, or enterprise.",
              color: "#2D74DA",
            },
            {
              title: "Data Availability",
              desc: "EIP-4844 blobs on Ethereum, Celestia, EigenDA, or Avail. Separation allows L2s to choose cost vs. security tradeoffs.",
              color: "#8B5CF6",
            },
          ].map((layer) => (
            <div key={layer.title} className="rounded-md border border-neutral-800 p-3">
              <div className="text-xs font-semibold mb-1" style={{ color: layer.color }}>
                {layer.title} Layer
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{layer.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <InfoBox title="L2 vs L1 Investment Framework">
        L1 investments (ETH) offer exposure to the base settlement layer — benefiting from all L2 activity
        through fee burn (EIP-1559) and staking yield. L2 token investments offer higher-beta exposure to
        specific ecosystem growth but carry sequencer centralization, token inflation, and competitive risks.
        A barbell approach holding ETH + selective L2 tokens captures both settlement layer dominance and
        execution layer upside.
      </InfoBox>
    </div>
  );
}

// ── Page Component ─────────────────────────────────────────────────────────────

export default function Layer2Page() {
  const tabs = [
    { id: "scaling", label: "Scaling Landscape", icon: <Layers size={13} /> },
    { id: "rollup", label: "Rollup Technology", icon: <Shield size={13} /> },
    { id: "tokens", label: "L2 Token Economics", icon: <DollarSign size={13} /> },
    { id: "ecosystem", label: "Developer Ecosystem", icon: <Code2 size={13} /> },
    { id: "thesis", label: "Investment Thesis", icon: <TrendingUp size={13} /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-950 border border-blue-800">
              <Layers size={18} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-100">Layer 2 Networks</h1>
              <p className="text-sm text-neutral-400">Ethereum scaling solutions and blockchain infrastructure investing</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: "L2 TVL", value: fmtB(L2_PROTOCOLS.reduce((a, b) => a + b.tvlB, 0)), color: "text-blue-400" },
              { label: "EIP-4844", value: "Live", color: "text-emerald-400" },
              { label: "Avg Fee", value: "$0.04", color: "text-green-400" },
              { label: "Networks", value: "6 major", color: "text-purple-400" },
            ].map((chip) => (
              <div key={chip.label} className="flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs">
                <span className="text-neutral-500">{chip.label}:</span>
                <span className={chip.color}>{chip.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="scaling">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-neutral-900 border border-neutral-800 p-1 rounded-lg mb-6">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-neutral-400"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="scaling" className="data-[state=inactive]:hidden">
              <motion.div key="scaling" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <ScalingLandscape />
              </motion.div>
            </TabsContent>

            <TabsContent value="rollup" className="data-[state=inactive]:hidden">
              <motion.div key="rollup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <RollupTechnology />
              </motion.div>
            </TabsContent>

            <TabsContent value="tokens" className="data-[state=inactive]:hidden">
              <motion.div key="tokens" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <L2TokenEconomics />
              </motion.div>
            </TabsContent>

            <TabsContent value="ecosystem" className="data-[state=inactive]:hidden">
              <motion.div key="ecosystem" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <DeveloperEcosystem />
              </motion.div>
            </TabsContent>

            <TabsContent value="thesis" className="data-[state=inactive]:hidden">
              <motion.div key="thesis" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <InvestmentThesis />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
