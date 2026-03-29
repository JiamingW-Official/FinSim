"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Zap,
  BarChart3,
  Layers,
  Lock,
  Unlock,
  ArrowRight,
  DollarSign,
  Percent,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Globe,
  Building2,
  Network,
  GitBranch,
  Cpu,
  Eye,
  Info,
  ChevronDown,
  ChevronRight,
  Coins,
  FileText,
  Users,
  Landmark,
  Shuffle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 950;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const NOISE = Array.from({ length: 300 }, () => rand());

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtB(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral" | "warn";
  icon?: React.ReactNode;
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : highlight === "warn"
      ? "text-amber-400"
      : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-zinc-400">{icon}</span>}
        <span className="text-xs text-zinc-400">{label}</span>
      </div>
      <span className={cn("text-xl font-bold", valClass)}>{value}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
      {children}
    </h3>
  );
}

function InfoBox({
  children,
  variant = "blue",
}: {
  children: React.ReactNode;
  variant?: "blue" | "amber" | "emerald" | "rose" | "purple";
}) {
  const colors = {
    blue: "bg-blue-500/10 border-blue-500/30 text-blue-200",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
    rose: "bg-rose-500/10 border-rose-500/30 text-rose-200",
    purple: "bg-purple-500/10 border-purple-500/30 text-purple-200",
  };
  return (
    <div className={cn("rounded-lg border p-3 text-xs leading-relaxed", colors[variant])}>
      {children}
    </div>
  );
}

function CompareRow({
  label,
  v1,
  v2,
  better,
}: {
  label: string;
  v1: string;
  v2: string;
  better: 1 | 2 | "tie";
}) {
  return (
    <tr className="border-b border-white/5">
      <td className="py-2.5 px-3 text-xs text-zinc-400">{label}</td>
      <td
        className={cn(
          "py-2.5 px-3 text-xs text-center",
          better === 1 ? "text-emerald-400 font-semibold" : "text-zinc-300"
        )}
      >
        {v1}
      </td>
      <td
        className={cn(
          "py-2.5 px-3 text-xs text-center",
          better === 2 ? "text-emerald-400 font-semibold" : "text-zinc-300"
        )}
      >
        {v2}
      </td>
    </tr>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Liquidity Innovations
// ══════════════════════════════════════════════════════════════════════════════

// Concentrated Liquidity Tick-range SVG
function TickRangeSVG() {
  const W = 600;
  const H = 160;
  const spotX = 300;
  const tickLow = 180;
  const tickHigh = 420;
  const capStart = 60;
  const capEnd = 540;

  // V3 liquidity humps
  const positions = [
    { lo: 200, hi: 380, depth: 70, color: "#818cf8" },
    { lo: 240, hi: 320, depth: 90, color: "#6366f1" },
    { lo: 260, hi: 295, depth: 110, color: "#4f46e5" },
    { lo: 290, hi: 350, depth: 55, color: "#7c3aed" },
    { lo: 180, hi: 260, depth: 45, color: "#8b5cf6" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      {/* V1/V2 uniform band */}
      <rect x={capStart} y={80} width={capEnd - capStart} height={30} rx={4} fill="#334155" opacity={0.6} />
      <text x={capStart + 4} y={96} fontSize={9} fill="#94a3b8">V2: uniform liquidity (capital spread thin)</text>

      {/* V3 concentrated positions */}
      {positions.map((p, i) => (
        <rect
          key={i}
          x={p.lo}
          y={H - 30 - p.depth}
          width={p.hi - p.lo}
          height={p.depth}
          rx={3}
          fill={p.color}
          opacity={0.75}
        />
      ))}

      {/* Current price line */}
      <line x1={spotX} y1={10} x2={spotX} y2={H - 10} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" />
      <text x={spotX + 4} y={20} fontSize={9} fill="#f59e0b">Current Price</text>

      {/* Tick range bracket */}
      <line x1={tickLow} y1={H - 15} x2={tickHigh} y2={H - 15} stroke="#10b981" strokeWidth={2} />
      <line x1={tickLow} y1={H - 20} x2={tickLow} y2={H - 10} stroke="#10b981" strokeWidth={2} />
      <line x1={tickHigh} y1={H - 20} x2={tickHigh} y2={H - 10} stroke="#10b981" strokeWidth={2} />
      <text x={tickLow + 4} y={H - 4} fontSize={9} fill="#10b981">Active Range</text>

      {/* Labels */}
      <text x={capStart} y={76} fontSize={9} fill="#64748b">V2 spread</text>
      <text x={spotX - 40} y={H - 30} fontSize={9} fill="#818cf8">V3 positions</text>
    </svg>
  );
}

// veTokenomics flow SVG
function VeTokenomicsSVG() {
  const boxes = [
    { x: 20, y: 40, w: 100, h: 40, label: "Token", sub: "CRV/BAL", color: "#6366f1" },
    { x: 160, y: 40, w: 100, h: 40, label: "Lock (1–4yr)", sub: "Time-weighted", color: "#8b5cf6" },
    { x: 300, y: 40, w: 100, h: 40, label: "veCRV/veBAL", sub: "Vote power", color: "#7c3aed" },
    { x: 440, y: 10, w: 110, h: 30, label: "Gauge Votes", sub: "Direct emissions", color: "#059669" },
    { x: 440, y: 55, w: 110, h: 30, label: "Protocol Fees", sub: "3CRV / bpt", color: "#0891b2" },
    { x: 440, y: 100, w: 110, h: 30, label: "Boost (2.5x)", sub: "LP rewards", color: "#d97706" },
  ];
  const arrows: [number, number, number, number][] = [
    [120, 60, 160, 60],
    [260, 60, 300, 60],
    [400, 50, 440, 25],
    [400, 60, 440, 70],
    [400, 70, 440, 115],
  ];

  return (
    <svg viewBox="0 0 570 150" className="w-full" style={{ height: 150 }}>
      {arrows.map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth={1.5} markerEnd="url(#arrowGray)" />
        </g>
      ))}
      <defs>
        <marker id="arrowGray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
        </marker>
      </defs>
      {boxes.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6} fill={b.color} opacity={0.25} stroke={b.color} strokeOpacity={0.6} strokeWidth={1} />
          <text x={b.x + b.w / 2} y={b.y + 14} fontSize={9} fill="white" textAnchor="middle" fontWeight="600">{b.label}</text>
          <text x={b.x + b.w / 2} y={b.y + 26} fontSize={8} fill="#94a3b8" textAnchor="middle">{b.sub}</text>
        </g>
      ))}
    </svg>
  );
}

// MEV taxonomy data
interface MevType {
  name: string;
  desc: string;
  annualRevenue: string;
  color: string;
  icon: React.ReactNode;
}

const MEV_TYPES: MevType[] = [
  {
    name: "Sandwich Attack",
    desc: "Attacker places buy before and sell after a victim's large trade, profiting from the slippage they create.",
    annualRevenue: "$680M/yr",
    color: "rose",
    icon: <Shuffle size={14} />,
  },
  {
    name: "Frontrunning",
    desc: "Bot detects pending high-value transaction in mempool and submits identical trade with higher gas to execute first.",
    annualRevenue: "$420M/yr",
    color: "amber",
    icon: <Zap size={14} />,
  },
  {
    name: "Backrunning",
    desc: "Arbitrage immediately after a large trade to profit from resulting price discrepancy across DEXes.",
    annualRevenue: "$890M/yr",
    color: "blue",
    icon: <RefreshCw size={14} />,
  },
  {
    name: "JIT Liquidity",
    desc: "Provide concentrated liquidity in the block a large swap executes, capture all fees, then withdraw. Zero IL risk.",
    annualRevenue: "$210M/yr",
    color: "purple",
    icon: <Droplets size={14} />,
  },
];

function LiquidityTab() {
  const [expandedMev, setExpandedMev] = useState<number | null>(null);

  // Capital efficiency bars (seeded)
  const efficiencyData = [
    { label: "Uniswap V2", efficiency: 1, color: "#6366f1" },
    { label: "Uniswap V3 (wide)", efficiency: 40, color: "#8b5cf6" },
    { label: "Uniswap V3 (medium)", efficiency: 400, color: "#7c3aed" },
    { label: "Uniswap V3 (tight)", efficiency: 4000, color: "#4f46e5" },
    { label: "Curve Stableswap", efficiency: 300, color: "#0891b2" },
  ];
  const maxEff = 4000;

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="DEX Total Volume (2025)" value="$4.2T" sub="Annualized" highlight="pos" icon={<BarChart3 size={14} />} />
        <StatCard label="Uniswap V3 TVL" value="$5.8B" sub="Concentrated ranges" highlight="neutral" icon={<Droplets size={14} />} />
        <StatCard label="MEV Extracted (2025)" value="$2.2B" sub="Annualized est." highlight="neg" icon={<AlertTriangle size={14} />} />
        <StatCard label="veCRV Locked" value="72%" sub="Of CRV supply" highlight="warn" icon={<Lock size={14} />} />
      </div>

      {/* DeFi 1.0 limitations */}
      <div>
        <SectionTitle><AlertTriangle size={14} className="text-amber-400" />DeFi 1.0 AMM Limitations</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoBox variant="amber">
            <div className="font-semibold mb-1">Impermanent Loss (IL)</div>
            When pool asset prices diverge, LPs hold more of the depreciating asset and less of the appreciating one. At 2x price ratio, IL = ~5.7%; at 5x = ~25.5%. For volatile pairs, IL frequently exceeds fee income.
          </InfoBox>
          <InfoBox variant="amber">
            <div className="font-semibold mb-1">Capital Inefficiency</div>
            Uniswap V2 spreads liquidity uniformly from 0 to ∞. For ETH/USDC, 99%+ of capital sits unused outside the ±5% price range. A $100M pool effectively provides only ~$500K of useful liquidity at any moment.
          </InfoBox>
          <InfoBox variant="rose">
            <div className="font-semibold mb-1">Mercenary Liquidity</div>
            Token emissions attract LPs who farm and dump rewards, creating sell pressure that erodes protocol value. Sustainable protocols need real fee revenue to replace inflation-based incentives.
          </InfoBox>
          <InfoBox variant="rose">
            <div className="font-semibold mb-1">Governance Token Dilution</div>
            Perpetual token inflation for liquidity mining dilutes governance value. Protocols with high inflation and low fee capture experience persistent governance token devaluation.
          </InfoBox>
        </div>
      </div>

      {/* Concentrated Liquidity */}
      <div>
        <SectionTitle><Layers size={14} className="text-purple-400" />Uniswap V3 Concentrated Liquidity</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-zinc-400 mb-4">
            V3 allows LPs to provide liquidity within custom price ranges (ticks). Capital concentrates at the current price, achieving up to <span className="text-purple-300 font-semibold">4000x capital efficiency</span> vs V2. Positions become NFTs representing unique tick ranges.
          </p>
          <TickRangeSVG />
          <div className="mt-4 text-xs text-zinc-500 italic">
            Multiple V3 positions overlapping near current price (dashed line). Active range bracket marks where fees are earned.
          </div>
        </div>

        {/* Capital efficiency comparison */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-semibold text-zinc-300 mb-3">Capital Efficiency vs V2 Baseline</div>
          <div className="space-y-2">
            {efficiencyData.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-36 text-xs text-zinc-400 truncate">{d.label}</div>
                <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden relative">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${(d.efficiency / maxEff) * 100}%`,
                      background: d.color,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div className="w-16 text-xs text-right" style={{ color: d.color }}>
                  {d.efficiency === 1 ? "1x (base)" : `${d.efficiency.toLocaleString()}x`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CLMM vs AMM Comparison */}
      <div>
        <SectionTitle><BarChart3 size={14} className="text-blue-400" />CLMM vs Classic AMM Comparison</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-zinc-300">Feature</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-indigo-400">Classic AMM (V2)</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-purple-400">CLMM (V3)</th>
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Liquidity Distribution" v1="Uniform (0→∞)" v2="Concentrated ranges" better={2} />
              <CompareRow label="Capital Efficiency" v1="1x baseline" v2="Up to 4,000x" better={2} />
              <CompareRow label="LP Complexity" v1="Simple (1-click)" v2="Requires range mgmt" better={1} />
              <CompareRow label="Impermanent Loss" v1="Lower (spread risk)" v2="Higher in range" better={1} />
              <CompareRow label="LP Position Type" v1="Fungible ERC-20" v2="NFT (unique)" better="tie" />
              <CompareRow label="Fee Tiers" v1="0.3% fixed" v2="0.01/0.05/0.3/1%" better={2} />
              <CompareRow label="Stablecoin Suitability" v1="Poor" v2="Excellent (tight range)" better={2} />
              <CompareRow label="Active Management Need" v1="None" v2="Rebalancing required" better={1} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Curve Stableswap + Balancer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionTitle><Droplets size={14} className="text-cyan-400" />Curve Stableswap Invariant</SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="text-xs text-zinc-400">
              Curve blends the constant-product formula (x·y=k) with constant-sum (x+y=k) via amplification parameter A. Near the price peg, behavior is nearly constant-sum (minimal slippage). Far from peg, it reverts to constant-product to prevent drain.
            </p>
            <div className="bg-zinc-900/50 rounded p-2 font-mono text-xs text-cyan-300">
              An^n·Σxi + D = An^n·D + D^(n+1)/(n^n·Πxi)
            </div>
            <ul className="space-y-1 text-xs text-zinc-400">
              <li className="flex gap-2"><span className="text-cyan-400">A</span><span>Amplification factor (50–2000). Higher A = tighter peg adherence.</span></li>
              <li className="flex gap-2"><span className="text-cyan-400">D</span><span>Invariant representing total pool value when balanced.</span></li>
              <li className="flex gap-2"><span className="text-cyan-400">n</span><span>Number of assets in pool (typically 2–4).</span></li>
            </ul>
          </div>
        </div>
        <div>
          <SectionTitle><Layers size={14} className="text-emerald-400" />Balancer Weighted Pools</SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="text-xs text-zinc-400">
              Balancer generalizes AMMs to N assets with arbitrary weights. A pool can be 80% ETH / 20% DAI, functioning as an auto-rebalancing index. Managed Pools allow dynamic weight changes (used for liquidity bootstrapping launches).
            </p>
            <div className="space-y-2">
              {[
                { label: "Weighted Pool", desc: "Fixed weights, like index. 2–8 assets." },
                { label: "Stable Pool", desc: "Curve-style for correlated assets." },
                { label: "Managed Pool", desc: "Owner adjusts weights + fees dynamically." },
                { label: "Boosted Pool", desc: "Idle capital earns yield in Aave while in pool." },
              ].map((row) => (
                <div key={row.label} className="flex gap-2 text-xs">
                  <span className="text-emerald-400 font-semibold w-28 shrink-0">{row.label}</span>
                  <span className="text-zinc-400">{row.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* veTokenomics */}
      <div>
        <SectionTitle><Lock size={14} className="text-violet-400" />veTokenomics (Vote-Escrowed Model)</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-zinc-400 mb-4">
            Pioneered by Curve (veCRV), veTokenomics aligns long-term holders with protocol governance. Tokens locked longer receive more voting power and higher yield boosts — creating supply sink mechanics and reducing mercenary farming.
          </p>
          <VeTokenomicsSVG />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {[
              { label: "Max Lock", value: "4 years", note: "Full voting power" },
              { label: "veCRV Boost", value: "2.5x", note: "LP reward multiplier" },
              { label: "Protocol Revenue Share", value: "50%", note: "To veCRV holders" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                <div className="text-xs text-zinc-400">{s.label}</div>
                <div className="text-base font-bold text-violet-300">{s.value}</div>
                <div className="text-xs text-zinc-500">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Protocol Owned Liquidity + MEV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionTitle><Coins size={14} className="text-amber-400" />Protocol-Owned Liquidity (POL)</SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="text-xs text-zinc-400">
              Olympus DAO introduced <span className="text-amber-300">bonding</span>: users sell LP tokens to the protocol at a discount for vested OHM. Protocol accumulates its own liquidity permanently — removing dependence on mercenary LPs. The model failed due to hyperinflation (7000% APY) — but POL as a concept remains influential.
            </p>
            <div className="space-y-1.5">
              {[
                { step: "1. Bond", desc: "User deposits LP token → receives discounted OHM vested over 5 days" },
                { step: "2. Accumulate", desc: "Protocol treasury owns LP permanently — earns swap fees" },
                { step: "3. Backs OHM", desc: "Each OHM backed by treasury assets ($1+ floor value enforced)" },
                { step: "Failed", desc: "3,3 Ponzi dynamic: 7000% APY only works while new buyers enter" },
              ].map((r) => (
                <div key={r.step} className={cn("flex gap-2 text-xs", r.step === "Failed" ? "text-rose-400" : "text-zinc-400")}>
                  <span className="font-semibold w-16 shrink-0">{r.step}</span>
                  <span>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <SectionTitle><AlertTriangle size={14} className="text-rose-400" />MEV Extraction Taxonomy</SectionTitle>
          <div className="space-y-2">
            {MEV_TYPES.map((m, i) => (
              <motion.div
                key={m.name}
                className={cn(
                  "rounded-lg border p-3 cursor-pointer",
                  m.color === "rose" && "border-rose-500/30 bg-rose-500/5",
                  m.color === "amber" && "border-amber-500/30 bg-amber-500/5",
                  m.color === "blue" && "border-blue-500/30 bg-blue-500/5",
                  m.color === "purple" && "border-purple-500/30 bg-purple-500/5"
                )}
                onClick={() => setExpandedMev(expandedMev === i ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      m.color === "rose" && "text-rose-400",
                      m.color === "amber" && "text-amber-400",
                      m.color === "blue" && "text-blue-400",
                      m.color === "purple" && "text-purple-400"
                    )}>{m.icon}</span>
                    <span className="text-xs font-semibold text-zinc-200">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/5 text-zinc-300 border-white/10 text-xs">{m.annualRevenue}</Badge>
                    <ChevronDown size={12} className={cn("text-zinc-500 transition-transform", expandedMev === i && "rotate-180")} />
                  </div>
                </div>
                <AnimatePresence>
                  {expandedMev === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-zinc-400 mt-2 pt-2 border-t border-white/10">{m.desc}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Real-World Assets On-Chain
// ══════════════════════════════════════════════════════════════════════════════

// RWA tokenization pipeline SVG
function RWAPipelineSVG() {
  const steps = [
    { label: "Originator", sub: "Asset owner / issuer", color: "#6366f1", x: 30 },
    { label: "SPV", sub: "Special Purpose Vehicle", color: "#7c3aed", x: 160 },
    { label: "Smart Contract", sub: "Token issuance + rules", color: "#0891b2", x: 300 },
    { label: "Secondary Market", sub: "DEX / OTC / exchange", color: "#059669", x: 440 },
    { label: "Investor", sub: "On-chain wallet holds token", color: "#d97706", x: 540 },
  ];

  return (
    <svg viewBox="0 0 620 120" className="w-full" style={{ height: 120 }}>
      <defs>
        <marker id="arrowRwa" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
        </marker>
      </defs>
      {steps.slice(0, -1).map((step, i) => {
        const next = steps[i + 1];
        return (
          <line
            key={i}
            x1={step.x + 85}
            y1={55}
            x2={next.x - 5}
            y2={55}
            stroke="#475569"
            strokeWidth={1.5}
            markerEnd="url(#arrowRwa)"
          />
        );
      })}
      {steps.map((step) => (
        <g key={step.label}>
          <rect x={step.x} y={30} width={80} height={50} rx={8} fill={step.color} opacity={0.2} stroke={step.color} strokeOpacity={0.5} strokeWidth={1} />
          <text x={step.x + 40} y={52} fontSize={8.5} fill="white" textAnchor="middle" fontWeight="600">{step.label}</text>
          <text x={step.x + 40} y={64} fontSize={7} fill="#94a3b8" textAnchor="middle">{step.sub}</text>
        </g>
      ))}
      {/* Legal wrappers */}
      <text x={75} y={98} fontSize={8} fill="#94a3b8" textAnchor="middle">Legal title</text>
      <text x={215} y={98} fontSize={8} fill="#94a3b8" textAnchor="middle">Segregated assets</text>
      <text x={355} y={98} fontSize={8} fill="#94a3b8" textAnchor="middle">Programmable rules</text>
      <text x={490} y={98} fontSize={8} fill="#94a3b8" textAnchor="middle">24/7 liquidity</text>
    </svg>
  );
}

// RWA market growth chart
function RWAGrowthChart() {
  const data = [
    { year: "2021", value: 0.3 },
    { year: "2022", value: 0.7 },
    { year: "2023", value: 2.1 },
    { year: "2024", value: 6.8 },
    { year: "2025E", value: 15.2 },
    { year: "2026E", value: 32.0 },
  ];
  const W = 500;
  const H = 120;
  const pad = { l: 40, r: 20, t: 16, b: 30 };
  const maxV = 35;
  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r));
  const ys = data.map((d) => pad.t + (1 - d.value / maxV) * (H - pad.t - pad.b));
  const pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const areaD = `${pathD} L${xs[xs.length - 1]},${H - pad.b} L${xs[0]},${H - pad.b} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 130 }}>
      <defs>
        <linearGradient id="rwaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 10, 20, 30].map((v) => {
        const y = pad.t + (1 - v / maxV) * (H - pad.t - pad.b);
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="#1e293b" strokeWidth={1} />
            <text x={pad.l - 4} y={y + 3.5} fontSize={8} fill="#475569" textAnchor="end">{`$${v}B`}</text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#rwaGrad)" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2} />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r={3.5} fill={i >= 4 ? "#818cf8" : "#6366f1"} opacity={i >= 4 ? 0.6 : 1} />
          <text x={x} y={H - pad.b + 12} fontSize={8} fill="#64748b" textAnchor="middle">{data[i].year}</text>
        </g>
      ))}
      <text x={W / 2} y={H - pad.b + 24} fontSize={8} fill="#475569" textAnchor="middle">RWA On-Chain Market Size ($B)</text>
    </svg>
  );
}

interface RWAProtocol {
  name: string;
  focus: string;
  tvl: string;
  collateral: "Over" | "Under" | "Full";
  kyc: boolean;
  yield: string;
}

const RWA_PROTOCOLS: RWAProtocol[] = [
  { name: "Ondo Finance", focus: "US Treasuries (OUSG/USDY)", tvl: "$790M", collateral: "Full", kyc: true, yield: "4.8–5.1%" },
  { name: "Centrifuge", focus: "Trade finance, real estate", tvl: "$250M", collateral: "Over", kyc: true, yield: "6–12%" },
  { name: "Maple Finance", focus: "Corporate credit / undercollat.", tvl: "$180M", collateral: "Under", kyc: true, yield: "8–15%" },
  { name: "Goldfinch", focus: "EM business loans", tvl: "$110M", collateral: "Under", kyc: true, yield: "10–18%" },
  { name: "BlackRock BUIDL", focus: "Tokenized US Treasuries", tvl: "$510M", collateral: "Full", kyc: true, yield: "~5.0%" },
  { name: "Backed Finance", focus: "EU equities / bonds", tvl: "$65M", collateral: "Full", kyc: true, yield: "Market" },
];

function RWATab() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total RWA On-Chain" value="$15.2B" sub="2025 estimate" highlight="pos" icon={<Globe size={14} />} />
        <StatCard label="Treasury Tokens" value="$3.8B" sub="BUIDL + OUSG + others" highlight="pos" icon={<FileText size={14} />} />
        <StatCard label="Credit Protocols TVL" value="$540M" sub="Active loans" highlight="neutral" icon={<Building2 size={14} />} />
        <StatCard label="Defaults (2022–2025)" value="$36M" sub="Maple/Goldfinch losses" highlight="neg" icon={<AlertTriangle size={14} />} />
      </div>

      {/* Pipeline */}
      <div>
        <SectionTitle><ArrowRight size={14} className="text-indigo-400" />RWA Tokenization Pipeline</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <RWAPipelineSVG />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <InfoBox variant="blue">
              <div className="font-semibold mb-1">Legal Wrapper (SPV)</div>
              A Special Purpose Vehicle holds the real-world asset legally. Token holders have beneficial interest via the SPV — enforced by jurisdiction-specific law, not just code. Typical structures: Cayman Islands exempted company or Delaware LLC.
            </InfoBox>
            <InfoBox variant="emerald">
              <div className="font-semibold mb-1">Smart Contract Layer</div>
              Enforces transfer restrictions (KYC whitelist), distributes cash flows (coupons/rent), handles redemptions, and records ownership. ERC-1400 and ERC-3643 are security token standards used for permissioned transfers.
            </InfoBox>
          </div>
        </div>
      </div>

      {/* Growth chart */}
      <div>
        <SectionTitle><TrendingUp size={14} className="text-indigo-400" />RWA Market Growth</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <RWAGrowthChart />
        </div>
      </div>

      {/* Protocol table */}
      <div>
        <SectionTitle><Building2 size={14} className="text-emerald-400" />Major RWA Protocols</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-zinc-300">Protocol</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-zinc-300">Focus</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-300">TVL</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-300">Collateral</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-300">KYC</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-300">Yield</th>
              </tr>
            </thead>
            <tbody>
              {RWA_PROTOCOLS.map((p) => (
                <tr key={p.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 text-xs font-semibold text-zinc-200">{p.name}</td>
                  <td className="py-2.5 px-3 text-xs text-zinc-400">{p.focus}</td>
                  <td className="py-2.5 px-3 text-xs text-center text-emerald-400">{p.tvl}</td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge className={cn("text-xs",
                      p.collateral === "Full" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                      p.collateral === "Over" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                      "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    )}>
                      {p.collateral}collat.
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.kyc ? <CheckCircle size={12} className="text-emerald-400 mx-auto" /> : <XCircle size={12} className="text-rose-400 mx-auto" />}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-center text-indigo-300">{p.yield}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USDM/stUSDT and BUIDL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionTitle><DollarSign size={14} className="text-emerald-400" />On-Chain Treasury Yield Capture</SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="text-xs text-zinc-400">
              Protocols like USDM (Mountain Protocol) and stUSDT (Justin Sun) hold short-dated US Treasury bills and rebate yield to token holders. Unlike Tether/USDC which capture yield entirely, these pass-through products let DeFi users earn risk-free rates on-chain.
            </p>
            <div className="space-y-2">
              {[
                { label: "USDM", apy: "5.0%", asset: "US T-bills", chain: "Multi-chain" },
                { label: "stUSDT", apy: "4.8%", asset: "T-bills + repo", chain: "TRON + ETH" },
                { label: "OUSG (Ondo)", apy: "5.1%", asset: "BlackRock SHV ETF", chain: "Ethereum" },
                { label: "BUIDL (BlackRock)", apy: "~5.0%", asset: "Direct T-bills + repo", chain: "Ethereum" },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between bg-white/5 rounded p-2">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200">{t.label}</span>
                    <span className="text-xs text-zinc-500 ml-2">{t.asset}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">{t.apy}</Badge>
                    <span className="text-xs text-zinc-500">{t.chain}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <SectionTitle><Shield size={14} className="text-amber-400" />Regulatory & Risk Considerations</SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            {[
              { title: "Securities Laws", desc: "Most tokenized assets qualify as securities under Howey Test. Require broker-dealer license or Reg D/S exemption.", color: "rose" },
              { title: "SPV Legal Risk", desc: "Token value depends on courts upholding SPV ownership claims in borrower jurisdiction — tested in Maple default cases.", color: "amber" },
              { title: "Oracle Dependency", desc: "RWA pricing relies on off-chain data feeds. Oracle manipulation or delay can create arbitrage or liquidation failures.", color: "amber" },
              { title: "Liquidity Mismatch", desc: "On-chain tokens trade 24/7 but underlying assets (real estate, private credit) may take months to liquidate.", color: "rose" },
              { title: "KYC/AML Compliance", desc: "ERC-1400 / ERC-3643 standards enforce transfer restrictions. Non-compliant wallets blocked at smart contract level.", color: "blue" },
            ].map((r) => (
              <InfoBox key={r.title} variant={r.color as "blue" | "amber" | "rose"}>
                <span className="font-semibold">{r.title}:</span> {r.desc}
              </InfoBox>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Intent-Based & Advanced Trading
// ══════════════════════════════════════════════════════════════════════════════

// Intent vs Transaction paradigm SVG
function IntentParadigmSVG() {
  const W = 580;
  const H = 130;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 130 }}>
      {/* Transaction side */}
      <rect x={10} y={10} width={260} height={110} rx={10} fill="#1e1b4b" stroke="#6366f1" strokeOpacity={0.4} strokeWidth={1} />
      <text x={140} y={30} fontSize={10} fill="#818cf8" textAnchor="middle" fontWeight="600">TRADITIONAL TRANSACTION</text>
      {[
        "User specifies: exact path",
        "Exact tokens in/out",
        "Exact DEX/pool route",
        "Exact gas price",
        "Susceptible to MEV",
      ].map((line, i) => (
        <text key={i} x={25} y={50 + i * 16} fontSize={8.5} fill="#94a3b8">{line}</text>
      ))}

      {/* Arrow */}
      <text x={W / 2} y={62} fontSize={18} fill="#475569" textAnchor="middle">→</text>
      <text x={W / 2} y={78} fontSize={8} fill="#475569" textAnchor="middle">PARADIGM</text>
      <text x={W / 2} y={90} fontSize={8} fill="#475569" textAnchor="middle">SHIFT</text>

      {/* Intent side */}
      <rect x={310} y={10} width={260} height={110} rx={10} fill="#0c1a0c" stroke="#10b981" strokeOpacity={0.4} strokeWidth={1} />
      <text x={440} y={30} fontSize={10} fill="#34d399" textAnchor="middle" fontWeight="600">INTENT-BASED ORDER</text>
      {[
        'User specifies: "I want..."',
        "Best execution outcome",
        "Solver competition fills",
        "MEV protected by design",
        "Gasless (paymaster covers)",
      ].map((line, i) => (
        <text key={i} x={325} y={50 + i * 16} fontSize={8.5} fill="#94a3b8">{line}</text>
      ))}
    </svg>
  );
}

// CoW Protocol batch auction SVG
function CowBatchSVG() {
  const orders = [
    { label: "User A: ETH→USDC", x: 30, y: 30, color: "#6366f1" },
    { label: "User B: USDC→ETH", x: 30, y: 70, color: "#7c3aed" },
    { label: "User C: WBTC→DAI", x: 30, y: 110, color: "#8b5cf6" },
  ];

  return (
    <svg viewBox="0 0 520 150" className="w-full" style={{ height: 150 }}>
      <defs>
        <marker id="arrowCow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
        </marker>
      </defs>
      {/* Orders */}
      {orders.map((o) => (
        <g key={o.label}>
          <rect x={o.x} y={o.y - 12} width={130} height={22} rx={5} fill={o.color} opacity={0.25} stroke={o.color} strokeOpacity={0.5} strokeWidth={1} />
          <text x={o.x + 65} y={o.y + 3} fontSize={8} fill="white" textAnchor="middle">{o.label}</text>
          <line x1={160} y1={o.y} x2={185} y2={75} stroke="#475569" strokeWidth={1} markerEnd="url(#arrowCow)" />
        </g>
      ))}
      {/* Batch */}
      <rect x={185} y={52} width={100} height={46} rx={8} fill="#0891b2" opacity={0.25} stroke="#0891b2" strokeOpacity={0.6} strokeWidth={1} />
      <text x={235} y={72} fontSize={9} fill="#7dd3fc" textAnchor="middle" fontWeight="600">CoW Batch</text>
      <text x={235} y={85} fontSize={7.5} fill="#94a3b8" textAnchor="middle">Solver competition</text>
      {/* Settlement */}
      <line x1={285} y1={75} x2={315} y2={40} stroke="#475569" strokeWidth={1} markerEnd="url(#arrowCow)" />
      <line x1={285} y1={75} x2={315} y2={75} stroke="#475569" strokeWidth={1} markerEnd="url(#arrowCow)" />
      <line x1={285} y1={75} x2={315} y2={110} stroke="#475569" strokeWidth={1} markerEnd="url(#arrowCow)" />
      {/* Solvers */}
      {[
        { y: 30, label: "Solver A: UniV3 route" },
        { y: 68, label: "Solver B: P2P CoW" },
        { y: 106, label: "Solver C: 1inch route" },
      ].map((sv) => (
        <g key={sv.label}>
          <rect x={315} y={sv.y - 10} width={120} height={20} rx={4} fill="#059669" opacity={0.2} stroke="#059669" strokeOpacity={0.4} strokeWidth={1} />
          <text x={375} y={sv.y + 4} fontSize={8} fill="#86efac" textAnchor="middle">{sv.label}</text>
        </g>
      ))}
      {/* Best result */}
      <line x1={435} y1={75} x2={460} y2={75} stroke="#10b981" strokeWidth={2} markerEnd="url(#arrowCow)" />
      <rect x={460} y={62} width={55} height={26} rx={5} fill="#10b981" opacity={0.3} stroke="#10b981" strokeOpacity={0.6} strokeWidth={1} />
      <text x={487} y={77} fontSize={8.5} fill="#6ee7b7" textAnchor="middle" fontWeight="600">Best Fill</text>
    </svg>
  );
}

// ERC-4337 Account Abstraction SVG
function AA4337SVG() {
  const components = [
    { label: "User Op", sub: "Intent bundle", x: 20, y: 45, color: "#6366f1" },
    { label: "Bundler", sub: "Batches ops", x: 140, y: 45, color: "#7c3aed" },
    { label: "EntryPoint", sub: "ERC-4337 contract", x: 270, y: 45, color: "#0891b2" },
    { label: "Paymaster", sub: "Sponsors gas", x: 400, y: 10, color: "#d97706" },
    { label: "Smart Wallet", sub: "User's contract", x: 400, y: 80, color: "#059669" },
  ];

  return (
    <svg viewBox="0 0 520 140" className="w-full" style={{ height: 140 }}>
      <defs>
        <marker id="arrowAA" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
        </marker>
      </defs>
      {/* Main flow arrows */}
      <line x1={100} y1={65} x2={140} y2={65} stroke="#475569" strokeWidth={1.5} markerEnd="url(#arrowAA)" />
      <line x1={215} y1={65} x2={270} y2={65} stroke="#475569" strokeWidth={1.5} markerEnd="url(#arrowAA)" />
      <line x1={350} y1={55} x2={400} y2={30} stroke="#d97706" strokeWidth={1.5} strokeDasharray="3 2" markerEnd="url(#arrowAA)" />
      <line x1={350} y1={75} x2={400} y2={95} stroke="#059669" strokeWidth={1.5} markerEnd="url(#arrowAA)" />
      {components.map((c) => (
        <g key={c.label}>
          <rect x={c.x} y={c.y} width={90} height={40} rx={7} fill={c.color} opacity={0.2} stroke={c.color} strokeOpacity={0.5} strokeWidth={1} />
          <text x={c.x + 45} y={c.y + 16} fontSize={9} fill="white" textAnchor="middle" fontWeight="600">{c.label}</text>
          <text x={c.x + 45} y={c.y + 28} fontSize={7.5} fill="#94a3b8" textAnchor="middle">{c.sub}</text>
        </g>
      ))}
      <text x={260} y={135} fontSize={8} fill="#475569" textAnchor="middle">ERC-4337: No EOA required — full account abstraction via smart contracts</text>
    </svg>
  );
}

interface IntentProtocol {
  name: string;
  mechanism: string;
  protection: string;
  crossChain: boolean;
  gasless: boolean;
}

const INTENT_PROTOCOLS: IntentProtocol[] = [
  { name: "CoW Protocol", mechanism: "Batch auction, solver competition", protection: "Full MEV protection", crossChain: false, gasless: false },
  { name: "UniswapX", mechanism: "Dutch auction, fillers compete", protection: "MEV protected", crossChain: true, gasless: true },
  { name: "1inch Fusion", mechanism: "Dutch auction with Resolvers", protection: "MEV protected", crossChain: false, gasless: true },
  { name: "Paraswap Delta", mechanism: "Intent RFQ + market makers", protection: "Partial protection", crossChain: false, gasless: true },
  { name: "Across + Intents", mechanism: "Cross-chain intent relay", protection: "Bridge MEV protected", crossChain: true, gasless: true },
];

function IntentTab() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="CoW Protocol Volume" value="$82B" sub="Cumulative 2024–25" highlight="pos" icon={<Shuffle size={14} />} />
        <StatCard label="MEV Savings (Intents)" value="$340M" sub="vs naive execution" highlight="pos" icon={<Shield size={14} />} />
        <StatCard label="ERC-4337 Wallets" value="12.4M" sub="Deployed smart accounts" highlight="neutral" icon={<Cpu size={14} />} />
        <StatCard label="Cross-Chain Intent Ops" value="$18B" sub="UniswapX + Across" highlight="neutral" icon={<Network size={14} />} />
      </div>

      {/* Intent paradigm */}
      <div>
        <SectionTitle><Zap size={14} className="text-emerald-400" />Intent vs Transaction Paradigm</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <IntentParadigmSVG />
          <InfoBox variant="emerald">
            Intents separate <span className="font-semibold">what</span> the user wants (outcome) from <span className="font-semibold">how</span> it is achieved (execution path). Specialized solvers/fillers compete to provide best execution, capturing a small profit while giving users better prices than they could achieve independently.
          </InfoBox>
        </div>
      </div>

      {/* CoW Protocol */}
      <div>
        <SectionTitle><RefreshCw size={14} className="text-blue-400" />CoW Protocol: Batch Auction Architecture</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <CowBatchSVG />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <InfoBox variant="blue">
              <div className="font-semibold mb-1">Coincidence of Wants (CoW)</div>
              When User A sells ETH for USDC and User B sells USDC for ETH, they are matched directly P2P — no AMM fee charged, zero slippage. Protocol captures surplus and shares it.
            </InfoBox>
            <InfoBox variant="purple">
              <div className="font-semibold mb-1">Solver Competition</div>
              Solvers submit competing settlement solutions. The winning solver gets a rebate but must prove their route provides the best execution. On-chain verification enforces honesty.
            </InfoBox>
            <InfoBox variant="emerald">
              <div className="font-semibold mb-1">MEV Immunity</div>
              Batch clearing at uniform prices removes sandwich attack opportunity. All trades in a batch execute at the same clearing price — frontrunning a batch has no advantage.
            </InfoBox>
          </div>
        </div>
      </div>

      {/* Intent protocols table */}
      <div>
        <SectionTitle><BarChart3 size={14} className="text-indigo-400" />Intent-Based Protocol Comparison</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-zinc-300">Protocol</th>
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-zinc-300">Mechanism</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-300">MEV</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-300">Cross-Chain</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-300">Gasless</th>
              </tr>
            </thead>
            <tbody>
              {INTENT_PROTOCOLS.map((p) => (
                <tr key={p.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 text-xs font-semibold text-zinc-200">{p.name}</td>
                  <td className="py-2.5 px-3 text-xs text-zinc-400">{p.mechanism}</td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge className={cn("text-xs", p.protection.includes("Full") ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30")}>
                      {p.protection.includes("Full") ? "Full" : "Partial"}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.crossChain ? <CheckCircle size={12} className="text-emerald-400 mx-auto" /> : <XCircle size={12} className="text-zinc-600 mx-auto" />}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.gasless ? <CheckCircle size={12} className="text-emerald-400 mx-auto" /> : <XCircle size={12} className="text-zinc-600 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ERC-4337 + Bridges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionTitle><Cpu size={14} className="text-amber-400" />Account Abstraction (ERC-4337)</SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <AA4337SVG />
            <div className="mt-3 space-y-2">
              {[
                { label: "User Operations", desc: "Pseudo-transactions that can batch multiple actions, enable social recovery, and set spending limits." },
                { label: "Bundler", desc: "Aggregates user ops into a single Ethereum transaction. Earns priority fees." },
                { label: "Paymaster", desc: "Third party that pays gas on behalf of user — enabling sponsored/gasless UX or gas payment in ERC-20 tokens." },
                { label: "Smart Wallet", desc: "User's on-chain account: programmable, upgradeable, supports multi-sig and session keys." },
              ].map((row) => (
                <div key={row.label} className="flex gap-2 text-xs">
                  <span className="text-amber-400 font-semibold w-28 shrink-0 mt-0.5">{row.label}</span>
                  <span className="text-zinc-400">{row.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <SectionTitle><Network size={14} className="text-purple-400" />Cross-Chain Bridge Security Taxonomy</SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="text-xs text-zinc-400 mb-2">Over $2.8B lost to bridge hacks 2021–2024. Security models differ fundamentally:</p>
            {[
              {
                type: "Optimistic Bridges",
                color: "blue",
                desc: "Assume messages are valid; allow fraud proofs within 7-day window (Optimism, Arbitrum native). Long latency but cryptographically sound.",
                risk: "Low",
              },
              {
                type: "ZK-Proof Bridges",
                color: "emerald",
                desc: "Cryptographic validity proofs generated off-chain, verified on-chain. Near-trustless but computationally expensive (zkBridge, Polyhedra).",
                risk: "Very Low",
              },
              {
                type: "Multi-Sig / MPC",
                color: "amber",
                desc: "M-of-N validator signatures relay messages (Wormhole, older Multichain). Single point of failure if validators compromised.",
                risk: "High",
              },
              {
                type: "CCIP (Chainlink)",
                color: "purple",
                desc: "Risk Management Network with separate validation layer monitors for anomalies. Defense-in-depth approach with rate limiting.",
                risk: "Medium",
              },
              {
                type: "LayerZero",
                color: "blue",
                desc: "Immutable Endpoints + configurable Oracle + Executor. Ultra Light Node (ULN) reads block headers rather than full state.",
                risk: "Medium",
              },
            ].map((b) => (
              <div key={b.type} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-zinc-200">{b.type}</span>
                  <Badge className={cn("text-xs",
                    b.risk === "Very Low" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                    b.risk === "Low" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                    b.risk === "Medium" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                    "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  )}>
                    {b.risk} Risk
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Flow Auctions */}
      <div>
        <SectionTitle><DollarSign size={14} className="text-emerald-400" />Order Flow Auctions (OFA) Economics</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-zinc-400 mb-3">
            OFAs create markets for order flow — wallets (MetaMask, Rabby) sell exclusive right to fill user trades to market makers via auction. Market makers bid for flow and return <span className="text-emerald-300">price improvement</span> to users rather than extracting MEV.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-semibold text-zinc-200 mb-1.5">Flow Auction Participants</div>
              <ul className="space-y-1 text-xs text-zinc-400">
                <li><span className="text-indigo-400">Wallet</span> — routes orders to auction house</li>
                <li><span className="text-indigo-400">Auction House</span> — Flashbots/CoW/MEV Blocker</li>
                <li><span className="text-indigo-400">Market Maker</span> — bids for exclusive fill right</li>
                <li><span className="text-indigo-400">User</span> — receives price improvement rebate</li>
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-semibold text-zinc-200 mb-1.5">Value Distribution</div>
              <ul className="space-y-1 text-xs text-zinc-400">
                <li>User: <span className="text-emerald-400">60–80%</span> of MEV recovered</li>
                <li>Wallet: <span className="text-blue-400">10–20%</span> kickback</li>
                <li>Market Maker: <span className="text-amber-400">10–30%</span> profit</li>
                <li>Total MEV redirected: ~$400M/yr</li>
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-semibold text-zinc-200 mb-1.5">Active OFA Systems</div>
              <ul className="space-y-1 text-xs text-zinc-400">
                <li><span className="text-purple-400">MEV Blocker</span> — CoW Protocol</li>
                <li><span className="text-purple-400">Flashbots Protect</span> — builders/searchers</li>
                <li><span className="text-purple-400">1inch Fusion+</span> — resolvers pay user</li>
                <li><span className="text-purple-400">Cowswap Surplus</span> — P2P matching</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Restaking & Institutional DeFi
// ══════════════════════════════════════════════════════════════════════════════

// EigenLayer restaking mechanics SVG
function RestakingSVG() {
  const layers = [
    { label: "ETH", sub: "Native asset", y: 10, color: "#6366f1", width: 520 },
    { label: "Liquid Staking Token", sub: "stETH / rETH / cbETH (5% APY)", y: 55, color: "#7c3aed", width: 440 },
    { label: "EigenLayer Restaking", sub: "Delegate to EigenLayer contracts", y: 100, color: "#0891b2", width: 360 },
    { label: "Liquid Restaking Token", sub: "eETH / ezETH / rsETH (add. 2–4%)", y: 145, color: "#059669", width: 280 },
  ];
  const avs = [
    { label: "EigenDA", x: 10 },
    { label: "Witness Chain", x: 110 },
    { label: "AltLayer", x: 210 },
    { label: "EigenCert", x: 310 },
    { label: "Lagrange", x: 410 },
  ];

  return (
    <svg viewBox="0 0 560 240" className="w-full" style={{ height: 240 }}>
      {layers.map((l, i) => (
        <g key={l.label}>
          <rect x={(560 - l.width) / 2} y={l.y} width={l.width} height={36} rx={7} fill={l.color} opacity={0.2} stroke={l.color} strokeOpacity={0.5} strokeWidth={1} />
          <text x={280} y={l.y + 14} fontSize={9.5} fill="white" textAnchor="middle" fontWeight="600">{l.label}</text>
          <text x={280} y={l.y + 27} fontSize={8} fill="#94a3b8" textAnchor="middle">{l.sub}</text>
          {i < layers.length - 1 && (
            <line x1={280} y1={l.y + 36} x2={280} y2={l.y + 55} stroke="#475569" strokeWidth={1.5} strokeDasharray="3 2" />
          )}
        </g>
      ))}
      {/* AVS row */}
      <text x={280} y={202} fontSize={9} fill="#94a3b8" textAnchor="middle">Actively Validated Services (AVS) — secured by restaked ETH</text>
      {avs.map((a) => (
        <g key={a.label}>
          <line x1={280} y1={181} x2={a.x + 45} y2={218} stroke="#0891b2" strokeWidth={1} strokeOpacity={0.5} />
          <rect x={a.x} y={218} width={90} height={18} rx={4} fill="#0891b2" opacity={0.15} stroke="#0891b2" strokeOpacity={0.4} strokeWidth={1} />
          <text x={a.x + 45} y={230} fontSize={7.5} fill="#7dd3fc" textAnchor="middle">{a.label}</text>
        </g>
      ))}
    </svg>
  );
}

// Yield composition bar
function YieldCompositionBar() {
  const segments = [
    { label: "ETH Staking", pct: 42, color: "#6366f1" },
    { label: "LST Yield", pct: 28, color: "#7c3aed" },
    { label: "AVS Fees", pct: 20, color: "#0891b2" },
    { label: "LRT Bonus", pct: 10, color: "#059669" },
  ];
  let cumulative = 0;

  return (
    <div className="space-y-3">
      <div className="h-8 rounded-lg overflow-hidden flex">
        {segments.map((seg) => {
          const left = cumulative;
          cumulative += seg.pct;
          return (
            <div
              key={seg.label}
              className="h-full flex items-center justify-center text-xs font-bold text-white"
              style={{ width: `${seg.pct}%`, background: seg.color, opacity: 0.85 }}
            >
              {seg.pct}%
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5 text-xs text-zinc-400">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: seg.color }} />
            {seg.label}
          </div>
        ))}
      </div>
    </div>
  );
}

interface LRT {
  name: string;
  token: string;
  protocol: string;
  tvl: string;
  baseYield: string;
  avsYield: string;
  slashRisk: "Low" | "Medium" | "High";
}

const LRTS: LRT[] = [
  { name: "ether.fi", token: "eETH", protocol: "ether.fi", tvl: "$7.2B", baseYield: "4.8%", avsYield: "+2.1%", slashRisk: "Low" },
  { name: "Renzo", token: "ezETH", protocol: "Renzo", tvl: "$3.1B", baseYield: "4.9%", avsYield: "+2.8%", slashRisk: "Medium" },
  { name: "Kelp DAO", token: "rsETH", protocol: "Kelp DAO", tvl: "$1.8B", baseYield: "4.8%", avsYield: "+2.4%", slashRisk: "Low" },
  { name: "Puffer Finance", token: "pufETH", protocol: "Puffer", tvl: "$1.3B", baseYield: "4.7%", avsYield: "+1.9%", slashRisk: "Low" },
  { name: "Swell", token: "rswETH", protocol: "Swell Network", tvl: "$0.9B", baseYield: "4.8%", avsYield: "+2.2%", slashRisk: "Medium" },
];

function RestakingTab() {
  const [expandedInst, setExpandedInst] = useState<number | null>(null);

  const institutionalBarriers = [
    {
      title: "KYC / AML Compliance",
      desc: "DeFi's pseudonymous nature conflicts with institutional requirements. Permissioned pools (Aave Arc, Compound Treasury) use on-chain whitelisting by licensed custodians (Fireblocks). Each participant must complete traditional onboarding.",
      icon: <FileText size={14} />,
      severity: "High",
    },
    {
      title: "Smart Contract Risk",
      desc: "Institutions require audit trails, insurance coverage, and audited codebases. Protocol bugs can result in total loss of funds — uncovered by any traditional insurance. Nexus Mutual and Sherlock provide partial on-chain coverage.",
      icon: <Shield size={14} />,
      severity: "High",
    },
    {
      title: "Counterparty Risk (Undercollat.)",
      desc: "Undercollateralized lending (Maple, Goldfinch) requires institutional credit analysis of on-chain borrowers. Multiple defaults in 2022 bear market (Orthogonal Trading, Alameda) caused losses to institutional LPs.",
      icon: <Users size={14} />,
      severity: "High",
    },
    {
      title: "Oracle & Liquidation Risk",
      desc: "Price oracle manipulation can trigger unjust liquidations. Flash loan attacks that moved oracle prices caused $200M+ in losses. Institutions require oracle diversity (Chainlink + Pyth + TWAP).",
      icon: <Activity size={14} />,
      severity: "Medium",
    },
    {
      title: "Regulatory Uncertainty",
      desc: "SEC / CFTC classification of DeFi tokens, liability of smart contract deployers, and AML obligations of liquidity providers remain unresolved in most jurisdictions. EU MiCA provides partial clarity for CeFi.",
      icon: <Landmark size={14} />,
      severity: "High",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="EigenLayer TVL" value="$18.2B" sub="Restaked ETH" highlight="pos" icon={<Layers size={14} />} />
        <StatCard label="Total LRT TVL" value="$14.5B" sub="All liquid restaking" highlight="pos" icon={<Coins size={14} />} />
        <StatCard label="Active AVS Count" value="23" sub="Services secured" highlight="neutral" icon={<Cpu size={14} />} />
        <StatCard label="Slashing Events" value="0" sub="Through 2025 (so far)" highlight="warn" icon={<AlertTriangle size={14} />} />
      </div>

      {/* EigenLayer mechanics */}
      <div>
        <SectionTitle><Layers size={14} className="text-blue-400" />EigenLayer Restaking Architecture</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <RestakingSVG />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoBox variant="blue">
              <div className="font-semibold mb-1">How Restaking Works</div>
              ETH stakers delegate their already-staked ETH (or LSTs) to EigenLayer contracts, opting into slashing conditions for AVS services. In return, they earn additional yield from AVS fees on top of base staking rewards. Security is pooled — AVS services inherit Ethereum-level economic security.
            </InfoBox>
            <InfoBox variant="rose">
              <div className="font-semibold mb-1">Slashing Risk Stacking</div>
              Restakers face correlated slashing: Ethereum consensus slashing + AVS-specific slashing conditions. If a validator is slashed by both simultaneously, losses compound. Multi-AVS restaking multiplies slash exposure. This systemic risk is largely untested.
            </InfoBox>
          </div>
        </div>
      </div>

      {/* Yield composition */}
      <div>
        <SectionTitle><Percent size={14} className="text-emerald-400" />Restaking Yield Composition</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-zinc-400 mb-3">Estimated breakdown of total LRT yield (~9.5% gross APY for diversified restaking)</p>
          <YieldCompositionBar />
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "ETH Staking", value: "~4.2%", note: "Validator rewards" },
              { label: "LST Premium", value: "~1.4%", note: "Liquid staking yield" },
              { label: "AVS Fees", value: "~2.3%", note: "Service fees" },
              { label: "LRT Incentives", value: "~1.6%", note: "Protocol tokens" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                <div className="text-xs text-zinc-400">{item.label}</div>
                <div className="text-sm font-bold text-emerald-400">{item.value}</div>
                <div className="text-xs text-zinc-500">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LRT table */}
      <div>
        <SectionTitle><Coins size={14} className="text-violet-400" />Liquid Restaking Tokens (LRTs)</SectionTitle>
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-2.5 px-3 text-left text-xs font-semibold text-zinc-300">Protocol</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-300">Token</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-300">TVL</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-300">Base Yield</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-300">AVS Add.</th>
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-zinc-300">Slash Risk</th>
              </tr>
            </thead>
            <tbody>
              {LRTS.map((l) => (
                <tr key={l.token} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 text-xs font-semibold text-zinc-200">{l.name}</td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">{l.token}</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-center text-emerald-400">{l.tvl}</td>
                  <td className="py-2.5 px-3 text-xs text-center text-blue-300">{l.baseYield}</td>
                  <td className="py-2.5 px-3 text-xs text-center text-indigo-300">{l.avsYield}</td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge className={cn("text-xs",
                      l.slashRisk === "Low" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                      l.slashRisk === "Medium" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                      "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    )}>
                      {l.slashRisk}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institutional DeFi barriers */}
      <div>
        <SectionTitle><Building2 size={14} className="text-amber-400" />Institutional DeFi Entry Barriers</SectionTitle>
        <div className="space-y-2">
          {institutionalBarriers.map((barrier, i) => (
            <motion.div
              key={barrier.title}
              className="rounded-xl border border-white/10 bg-white/5 cursor-pointer"
              onClick={() => setExpandedInst(expandedInst === i ? null : i)}
            >
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">{barrier.icon}</span>
                  <span className="text-xs font-semibold text-zinc-200">{barrier.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs",
                    barrier.severity === "High" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  )}>
                    {barrier.severity}
                  </Badge>
                  <ChevronRight size={12} className={cn("text-zinc-500 transition-transform", expandedInst === i && "rotate-90")} />
                </div>
              </div>
              <AnimatePresence>
                {expandedInst === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 text-xs text-zinc-400 border-t border-white/5 pt-2">
                      {barrier.desc}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Permissioned pools + Insurance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionTitle><Lock size={14} className="text-blue-400" />Permissioned DeFi Pools</SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="text-xs text-zinc-400">
              Permissioned pools offer DeFi yield mechanics within a KYC/AML framework — bridging institutional compliance with on-chain efficiency.
            </p>
            {[
              {
                name: "Aave Arc",
                desc: "Institutional lending pool with whitelisted participants via Fireblocks KYC. Separate liquidity from public Aave. Currently paused pending V4 migration.",
                status: "Paused",
              },
              {
                name: "Compound Treasury",
                desc: "Fixed-rate product for institutional depositors. Compound handles on-chain management; institutions interact via TradFi interfaces.",
                status: "Active",
              },
              {
                name: "Morpho Vaults",
                desc: "Curated lending vaults with risk managers controlling parameters. Institutions can deploy to vaults meeting their risk/compliance criteria.",
                status: "Active",
              },
              {
                name: "On-Chain Prime Brokerage",
                desc: "Protocols like Deribit + Fireblocks Prime combine custody, lending, execution, and reporting for institutional DeFi desks.",
                status: "Emerging",
              },
            ].map((pool) => (
              <div key={pool.name} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-zinc-200">{pool.name}</span>
                  <Badge className={cn("text-xs",
                    pool.status === "Active" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                    pool.status === "Paused" ? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" :
                    "bg-blue-500/20 text-blue-300 border-blue-500/30"
                  )}>
                    {pool.status}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">{pool.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle><Shield size={14} className="text-emerald-400" />DeFi Insurance Protocols</SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="text-xs text-zinc-400 mb-2">
              On-chain insurance provides partial coverage for smart contract exploits, oracle failures, and stablecoin depegs. Coverage is limited relative to total DeFi TVL.
            </p>
            {[
              {
                name: "Nexus Mutual",
                model: "Mutual risk pooling — members stake NXM to underwrite coverage. Claims assessed by token-weighted governance vote.",
                cover: "$820M",
                notable: "Covered Euler hack ($197M), paid claims",
              },
              {
                name: "Sherlock",
                model: "Smart contract auditors stake USDC to underwrite protocols they audit. Misaligned incentives addressed via auditor skin-in-the-game.",
                cover: "$115M",
                notable: "Euler, Olympus, AAVE v3 audits",
              },
              {
                name: "Neptune Mutual",
                model: "Parametric coverage — payouts triggered automatically on-chain without claims adjudication when parameters are met.",
                cover: "$45M",
                notable: "Automated payout, no discretion",
              },
              {
                name: "InsurAce",
                model: "Cross-chain portfolio coverage with diversified underwriters. Covers bridge risk, stablecoin depeg, exchange hack.",
                cover: "$35M",
                notable: "Luna/UST depeg payout 2022",
              },
            ].map((ins) => (
              <div key={ins.name} className="rounded-lg border border-white/10 bg-white/5 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">{ins.name}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">Cover: {ins.cover}</Badge>
                </div>
                <p className="text-xs text-zinc-400">{ins.model}</p>
                <p className="text-xs text-zinc-500 italic">{ins.notable}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key insight */}
      <InfoBox variant="purple">
        <div className="font-semibold mb-1">The Institutional DeFi Convergence Thesis</div>
        The trend line is clear: TradFi infrastructure (Blackrock, Franklin Templeton, JPMorgan) is tokenizing assets on-chain while DeFi protocols add compliance layers. By 2027, the distinction between permissioned DeFi and regulated digital securities markets may be largely semantic — differentiated primarily by degree of on-chain settlement finality.
      </InfoBox>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════════════════════

// Suppress the NOISE variable warning — it ensures PRNG is consumed consistently
void NOISE;

export default function DeFi2Page() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-xl bg-indigo-500/15 border border-indigo-500/30 p-2.5">
            <GitBranch size={22} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">DeFi 2.0 & Advanced Protocols</h1>
            <p className="text-sm text-zinc-400">Liquidity optimization, real-world assets on-chain, intent-based trading, restaking, and institutional DeFi</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {["Concentrated Liquidity", "veTokenomics", "RWA", "Intent Orders", "EigenLayer", "Institutional DeFi"].map((tag) => (
            <Badge key={tag} className="bg-white/5 text-zinc-400 border-white/10 text-xs">{tag}</Badge>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="liquidity">
        <TabsList className="bg-white/5 border border-white/10 mb-6 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="liquidity" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 text-xs">
            <Droplets size={13} className="mr-1.5" />Liquidity Innovations
          </TabsTrigger>
          <TabsTrigger value="rwa" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 text-xs">
            <Globe size={13} className="mr-1.5" />Real-World Assets
          </TabsTrigger>
          <TabsTrigger value="intent" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 text-xs">
            <Zap size={13} className="mr-1.5" />Intent-Based Trading
          </TabsTrigger>
          <TabsTrigger value="restaking" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 text-xs">
            <Layers size={13} className="mr-1.5" />Restaking & Institutional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liquidity" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <LiquidityTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="rwa" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <RWATab />
          </motion.div>
        </TabsContent>

        <TabsContent value="intent" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <IntentTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="restaking" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <RestakingTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
