"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  Flame,
  Fish,
  BarChart2,
  Layers,
  AlertTriangle,
} from "lucide-react";

// ── PRNG ──────────────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) & 0xffffffff;
  }
  return h >>> 0;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ProtocolCategory = "Lending" | "DEX" | "Liquid Staking" | "Perps";

interface ProtocolTVL {
  name: string;
  chain: string;
  tvl: number; // billions USD
  change24h: number; // %
  change7d: number; // %
  category: ProtocolCategory;
}

interface GasPrice {
  fast: number;
  standard: number;
  slow: number;
}

type ActionType = "ETH Transfer" | "ERC-20 Transfer" | "Uniswap Swap" | "NFT Mint";

interface WhaleActivity {
  address: string;
  action: "buy" | "sell";
  token: string;
  sizeMil: number; // millions USD
  pnlEst: number; // % estimated
  hoursAgo: number;
}

interface YieldOpportunity {
  protocol: string;
  strategy: string;
  apy: number; // %
  tvlMil: number; // millions USD
  risk: "Low" | "Medium" | "High";
  asset: "ETH" | "USDC" | "BTC";
}

// ── Static protocol definitions ───────────────────────────────────────────────

const PROTOCOLS_DEF: {
  name: string;
  chain: string;
  baseTvl: number;
  category: ProtocolCategory;
}[] = [
  { name: "AAVE",     chain: "Ethereum",  baseTvl: 11.2, category: "Lending" },
  { name: "Uniswap",  chain: "Ethereum",  baseTvl: 5.8,  category: "DEX" },
  { name: "Curve",    chain: "Ethereum",  baseTvl: 4.3,  category: "DEX" },
  { name: "Compound", chain: "Ethereum",  baseTvl: 2.1,  category: "Lending" },
  { name: "MakerDAO", chain: "Ethereum",  baseTvl: 8.4,  category: "Lending" },
  { name: "Lido",     chain: "Ethereum",  baseTvl: 22.6, category: "Liquid Staking" },
  { name: "Convex",   chain: "Ethereum",  baseTvl: 3.7,  category: "DEX" },
  { name: "Balancer", chain: "Ethereum",  baseTvl: 1.6,  category: "DEX" },
  { name: "GMX",      chain: "Arbitrum",  baseTvl: 0.9,  category: "Perps" },
  { name: "dYdX",     chain: "StarkEx",   baseTvl: 0.5,  category: "Perps" },
];

const WHALE_TOKENS = ["ETH", "USDC", "WBTC", "LINK", "UNI", "AAVE", "CRV", "LDO"];

const ACTION_GAS: Record<ActionType, number> = {
  "ETH Transfer":    21000,
  "ERC-20 Transfer": 45000,
  "Uniswap Swap":    150000,
  "NFT Mint":        250000,
};

const YIELD_PROTOCOLS: {
  protocol: string;
  strategy: string;
  baseApy: number;
  baseTvl: number;
  risk: "Low" | "Medium" | "High";
  asset: "ETH" | "USDC" | "BTC";
}[] = [
  { protocol: "Lido",      strategy: "stETH Liquid Staking", baseApy: 3.8,  baseTvl: 22600, risk: "Low",    asset: "ETH"  },
  { protocol: "AAVE",      strategy: "ETH Lending",           baseApy: 2.1,  baseTvl: 4200,  risk: "Low",    asset: "ETH"  },
  { protocol: "Curve",     strategy: "ETH/stETH Pool",        baseApy: 5.2,  baseTvl: 1800,  risk: "Medium", asset: "ETH"  },
  { protocol: "Convex",    strategy: "ETH/stETH Boosted",     baseApy: 8.4,  baseTvl: 900,   risk: "Medium", asset: "ETH"  },
  { protocol: "Yearn",     strategy: "yvETH Vault",           baseApy: 6.1,  baseTvl: 320,   risk: "High",   asset: "ETH"  },
  { protocol: "AAVE",      strategy: "USDC Lending",          baseApy: 4.2,  baseTvl: 5800,  risk: "Low",    asset: "USDC" },
  { protocol: "Compound",  strategy: "USDC Supply",           baseApy: 3.5,  baseTvl: 1200,  risk: "Low",    asset: "USDC" },
  { protocol: "Curve",     strategy: "3Pool LP",              baseApy: 5.8,  baseTvl: 3400,  risk: "Medium", asset: "USDC" },
  { protocol: "Convex",    strategy: "USDC Boosted",          baseApy: 9.1,  baseTvl: 1100,  risk: "Medium", asset: "USDC" },
  { protocol: "Pendle",    strategy: "USDC PT Yield",         baseApy: 12.4, baseTvl: 280,   risk: "High",   asset: "USDC" },
  { protocol: "AAVE",      strategy: "WBTC Lending",          baseApy: 0.8,  baseTvl: 3100,  risk: "Low",    asset: "BTC"  },
  { protocol: "Compound",  strategy: "WBTC Supply",           baseApy: 0.6,  baseTvl: 780,   risk: "Low",    asset: "BTC"  },
  { protocol: "Curve",     strategy: "WBTC/renBTC Pool",      baseApy: 2.4,  baseTvl: 640,   risk: "Medium", asset: "BTC"  },
  { protocol: "GMX",       strategy: "BTC GLP",               baseApy: 14.2, baseTvl: 210,   risk: "High",   asset: "BTC"  },
  { protocol: "Convex",    strategy: "WBTC Boosted",          baseApy: 4.8,  baseTvl: 190,   risk: "High",   asset: "BTC"  },
];

// ── Data generators ───────────────────────────────────────────────────────────

const SEED = 6789;

function generateProtocols(): ProtocolTVL[] {
  return PROTOCOLS_DEF.map((p) => {
    const rng = mulberry32(hashStr(p.name) ^ SEED);
    const change24h = (rng() - 0.5) * 10;
    const change7d  = (rng() - 0.48) * 18;
    const tvlMult   = 1 + change24h / 100;
    return {
      name:      p.name,
      chain:     p.chain,
      tvl:       p.baseTvl * tvlMult,
      change24h,
      change7d,
      category:  p.category,
    };
  });
}

function generateGasPrice(): GasPrice {
  const hourBucket = Math.floor(Date.now() / (1000 * 60 * 60));
  const rng = mulberry32(SEED ^ hourBucket);
  const base = 12 + rng() * 60;
  return { slow: base * 0.75, standard: base, fast: base * 1.5 };
}

function generateGasHeatmap(): number[][] {
  // 7 days × 24 hours — rows = day, cols = hour
  const rows: number[][] = [];
  for (let d = 0; d < 7; d++) {
    const row: number[] = [];
    for (let h = 0; h < 24; h++) {
      const rng = mulberry32(SEED ^ (d * 100 + h));
      // Rush hours: 9-11 UTC and 15-17 UTC are high
      const rushMultiplier = (h >= 9 && h <= 11) || (h >= 15 && h <= 17) ? 1.8 : 1;
      const gas = (10 + rng() * 50) * rushMultiplier;
      row.push(Math.round(gas));
    }
    rows.push(row);
  }
  return rows;
}

function generateWhaleActivities(): WhaleActivity[] {
  const timeBucket = Math.floor(Date.now() / (1000 * 60 * 30)); // 30-min bucket
  return Array.from({ length: 10 }, (_, i) => {
    const rng = mulberry32(SEED ^ timeBucket ^ (i * 0x1337));
    const walletNum = Math.floor(rng() * 0xffffffffffff);
    const address = `0x${walletNum.toString(16).padStart(12, "0").slice(0, 4)}...${walletNum.toString(16).slice(-4)}`;
    const token = WHALE_TOKENS[Math.floor(rng() * WHALE_TOKENS.length)];
    const action: "buy" | "sell" = rng() > 0.5 ? "buy" : "sell";
    const sizeMil = 0.5 + rng() * 49.5;
    const pnlEst  = action === "buy" ? (rng() - 0.3) * 20 : (rng() - 0.4) * 30;
    const hoursAgo = Math.floor(rng() * 23) + 1;
    return { address, action, token, sizeMil, pnlEst, hoursAgo };
  });
}

function generateYieldOpportunities(baseSeed: number): YieldOpportunity[] {
  return YIELD_PROTOCOLS.map((y) => {
    const rng = mulberry32(hashStr(y.protocol + y.strategy) ^ baseSeed);
    return {
      protocol: y.protocol,
      strategy: y.strategy,
      apy:      Math.max(0.1, y.baseApy * (0.85 + rng() * 0.3)),
      tvlMil:   y.baseTvl * (0.9 + rng() * 0.2),
      risk:     y.risk,
      asset:    y.asset,
    };
  });
}

// ── Risk discount constants ───────────────────────────────────────────────────

const RISK_DISCOUNT: Record<"Low" | "Medium" | "High", number> = {
  Low:    0.05,
  Medium: 0.15,
  High:   0.30,
};

function riskAdjustedReturn(apy: number, risk: "Low" | "Medium" | "High"): number {
  return apy * (1 - RISK_DISCOUNT[risk]);
}

// ── Impermanent loss formula ──────────────────────────────────────────────────

function calcIL(priceDeltaPct: number): number {
  const r = 1 + priceDeltaPct / 100;
  if (r <= 0) return -100;
  return (2 * Math.sqrt(r) / (1 + r) - 1) * 100;
}

// ── SVG: Horizontal Bar Chart ─────────────────────────────────────────────────

function HorizontalBars({ items }: { items: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...items.map((i) => i.value));
  const W = 420, BAR_H = 20, GAP = 8, PAD_L = 72, PAD_R = 50;
  const totalH = items.length * (BAR_H + GAP);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${totalH}`} className="block">
      {items.map((item, idx) => {
        const y = idx * (BAR_H + GAP);
        const barW = Math.max(2, ((item.value / max) * (W - PAD_L - PAD_R)));
        return (
          <g key={item.label}>
            <text x={PAD_L - 4} y={y + BAR_H / 2 + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
              {item.label}
            </text>
            <rect x={PAD_L} y={y} width={barW} height={BAR_H} fill={item.color} rx={3} opacity={0.85} />
            <text x={PAD_L + barW + 4} y={y + BAR_H / 2 + 4} fontSize={9} fill="#e5e7eb">
              ${item.value.toFixed(1)}B
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── SVG: Donut Chart ──────────────────────────────────────────────────────────

function DonutChart({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  const CX = 70, CY = 70, R = 58, R_INNER = 36;
  let angle = -Math.PI / 2;

  const arcs = slices.map((sl) => {
    const sweep = (sl.value / total) * 2 * Math.PI;
    const startAngle = angle;
    angle += sweep;
    const endAngle = angle;
    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle);
    const y2 = CY + R * Math.sin(endAngle);
    const xi1 = CX + R_INNER * Math.cos(endAngle);
    const yi1 = CY + R_INNER * Math.sin(endAngle);
    const xi2 = CX + R_INNER * Math.cos(startAngle);
    const yi2 = CY + R_INNER * Math.sin(startAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    const d = [
      `M ${x1} ${y1}`,
      `A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${xi1} ${yi1}`,
      `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${xi2} ${yi2}`,
      "Z",
    ].join(" ");
    return { ...sl, d, pct: (sl.value / total) * 100 };
  });

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg width={140} height={140} className="shrink-0">
        {arcs.map((a) => (
          <path key={a.label} d={a.d} fill={a.color} opacity={0.85} />
        ))}
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize={10} fill="#9ca3af">Lido</text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize={10} fill="#e5e7eb" fontWeight="700">
          {arcs.find((a) => a.label === "Lido")?.pct.toFixed(0) ?? "0"}%
        </text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {arcs.map((a) => (
          <div key={a.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: a.color }} />
            <span className="text-muted-foreground w-20 truncate">{a.label}</span>
            <span className="tabular-nums font-semibold">{a.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SVG: Gas Heatmap ──────────────────────────────────────────────────────────

function GasHeatmap({ data }: { data: number[][] }) {
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const allVals = data.flat();
  const minG = Math.min(...allVals);
  const maxG = Math.max(...allVals);

  function gasColor(val: number): string {
    const t = (val - minG) / (maxG - minG);
    // interpolate green (#22c55e) → yellow (#eab308) → red (#ef4444)
    if (t < 0.5) {
      const u = t / 0.5;
      const r = Math.round(34 + u * (234 - 34));
      const g = Math.round(197 + u * (179 - 197));
      const b = Math.round(94 + u * (8 - 94));
      return `rgb(${r},${g},${b})`;
    } else {
      const u = (t - 0.5) / 0.5;
      const r = Math.round(234 + u * (239 - 234));
      const g = Math.round(179 + u * (68 - 179));
      const b = Math.round(8 + u * (68 - 8));
      return `rgb(${r},${g},${b})`;
    }
  }

  const CELL_W = 14, CELL_H = 18, GAP = 2;
  const PAD_L = 32, PAD_T = 20;
  const totalW = PAD_L + 24 * (CELL_W + GAP);
  const totalH = PAD_T + 7 * (CELL_H + GAP) + 16;

  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${totalH}`} className="block">
      {/* Hour labels */}
      {[0, 4, 8, 12, 16, 20].map((h) => (
        <text
          key={h}
          x={PAD_L + h * (CELL_W + GAP) + CELL_W / 2}
          y={PAD_T - 6}
          textAnchor="middle"
          fontSize={7}
          fill="#6b7280"
        >
          {h}:00
        </text>
      ))}
      {/* Day labels + cells */}
      {data.map((row, d) => (
        <g key={d}>
          <text
            x={PAD_L - 4}
            y={PAD_T + d * (CELL_H + GAP) + CELL_H / 2 + 3}
            textAnchor="end"
            fontSize={8}
            fill="#6b7280"
          >
            {DAY_LABELS[d]}
          </text>
          {row.map((val, h) => (
            <rect
              key={h}
              x={PAD_L + h * (CELL_W + GAP)}
              y={PAD_T + d * (CELL_H + GAP)}
              width={CELL_W}
              height={CELL_H}
              fill={gasColor(val)}
              rx={2}
              opacity={0.85}
            >
              <title>{`${DAY_LABELS[d]} ${h}:00 — ${val} Gwei`}</title>
            </rect>
          ))}
        </g>
      ))}
      {/* Legend */}
      <text x={PAD_L} y={totalH - 2} fontSize={7} fill="#6b7280">Low</text>
      <text x={totalW - 30} y={totalH - 2} fontSize={7} fill="#6b7280">High</text>
      {Array.from({ length: 20 }, (_, i) => {
        const t = i / 19;
        const x = PAD_L + 20 + i * 8;
        const c = gasColor(minG + t * (maxG - minG));
        return <rect key={i} x={x} y={totalH - 10} width={8} height={6} fill={c} />;
      })}
    </svg>
  );
}

// ── SVG: Protocol Flow Sankey (simplified) ────────────────────────────────────

function FlowChart({ activities }: { activities: WhaleActivity[] }) {
  const PROTOCOLS = ["AAVE", "Uniswap", "Curve", "Lido", "GMX"];
  const W = 420, H = 160;
  const nodeW = 60, nodeH = 24;

  // Count flows
  const flows: { from: string; to: string; value: number }[] = [];
  const rng = mulberry32(SEED ^ 0xf10a);
  PROTOCOLS.forEach((src) => {
    PROTOCOLS.forEach((dst) => {
      if (src === dst) return;
      if (rng() > 0.7) {
        flows.push({ from: src, to: dst, value: 0.5 + rng() * 9.5 });
      }
    });
  });

  const nodeX: Record<string, number> = {};
  PROTOCOLS.forEach((p, i) => {
    nodeX[p] = 10 + i * ((W - nodeW - 10) / (PROTOCOLS.length - 1));
  });
  const nodeY = (H - nodeH) / 2;

  // void activities to suppress unused warning
  void activities;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
      {/* Flow lines */}
      {flows.slice(0, 8).map((f, i) => {
        const x1 = nodeX[f.from] + nodeW;
        const x2 = nodeX[f.to];
        const y1 = nodeY + nodeH / 2;
        const y2 = nodeY + nodeH / 2;
        const mx = (x1 + x2) / 2;
        const strokeW = Math.max(1, Math.min(8, f.value));
        const color = x1 < x2 ? "#22c55e" : "#ef4444";
        return (
          <path
            key={i}
            d={`M${x1},${y1} C${mx},${y1 - 40} ${mx},${y2 - 40} ${x2},${y2}`}
            stroke={color}
            strokeWidth={strokeW}
            fill="none"
            opacity={0.4}
          />
        );
      })}
      {/* Protocol nodes */}
      {PROTOCOLS.map((p) => (
        <g key={p}>
          <rect
            x={nodeX[p]}
            y={nodeY}
            width={nodeW}
            height={nodeH}
            rx={4}
            fill="#1e293b"
            stroke="#6366f1"
            strokeWidth={1.5}
          />
          <text
            x={nodeX[p] + nodeW / 2}
            y={nodeY + nodeH / 2 + 4}
            textAnchor="middle"
            fontSize={9}
            fill="#e5e7eb"
            fontWeight="600"
          >
            {p}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Section 1: Protocol TVL Dashboard ────────────────────────────────────────

const CATEGORY_COLORS: Record<ProtocolCategory, string> = {
  Lending:         "#6366f1",
  DEX:             "#22c55e",
  "Liquid Staking": "#f59e0b",
  Perps:           "#ec4899",
};

const ALL_CATEGORIES: ProtocolCategory[] = ["Lending", "DEX", "Liquid Staking", "Perps"];

function TVLDashboard({ protocols }: { protocols: ProtocolTVL[] }) {
  const [catFilter, setCatFilter] = useState<ProtocolCategory | "All">("All");

  const filtered = catFilter === "All" ? protocols : protocols.filter((p) => p.category === catFilter);

  const totalTVL = protocols.reduce((s, p) => s + p.tvl, 0);
  const lidoTVL  = protocols.find((p) => p.name === "Lido")?.tvl ?? 0;

  // Liquid staking dominance donut
  const lidoShare = lidoTVL;
  const otherLSSlice = protocols
    .filter((p) => p.category === "Liquid Staking" && p.name !== "Lido")
    .reduce((s, p) => s + p.tvl, 0) + 4; // synthetic Rocket Pool + etc
  const restDeFi = totalTVL - lidoTVL - otherLSSlice;

  const dominanceSlices = [
    { label: "Lido",    value: lidoShare,   color: "#f59e0b" },
    { label: "Other LS", value: otherLSSlice, color: "#84cc16" },
    { label: "Other DeFi", value: restDeFi, color: "#475569" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total TVL",      value: `$${totalTVL.toFixed(1)}B` },
          { label: "Protocols",      value: `${protocols.length}` },
          { label: "Lido TVL",       value: `$${lidoTVL.toFixed(1)}B` },
          { label: "Lido LS Share",  value: `${((lidoTVL / (lidoTVL + otherLSSlice)) * 100).toFixed(0)}%` },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-border/50 bg-card p-3">
            <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
            <div className="text-lg font-bold tabular-nums">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCatFilter("All")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            catFilter === "All"
              ? "bg-primary text-primary-foreground"
              : "border border-border/50 text-muted-foreground hover:bg-accent/50",
          )}
        >
          All
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCatFilter(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              catFilter === cat
                ? "text-white border-transparent"
                : "border-border/50 text-muted-foreground hover:bg-accent/50",
            )}
            style={catFilter === cat ? { background: CATEGORY_COLORS[cat] } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Protocol table */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground uppercase tracking-wide">Protocol</th>
                <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Chain</th>
                <th className="py-2.5 px-3 text-right font-semibold text-muted-foreground uppercase tracking-wide">TVL ($B)</th>
                <th className="py-2.5 px-3 text-right font-semibold text-muted-foreground uppercase tracking-wide">24h</th>
                <th className="py-2.5 px-3 text-right font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">7d</th>
                <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Category</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.name} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-primary">{p.name}</td>
                  <td className="py-2.5 px-3 text-muted-foreground hidden sm:table-cell">{p.chain}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{p.tvl.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={cn("tabular-nums font-medium", p.change24h >= 0 ? "text-green-500" : "text-red-500")}>
                      {p.change24h >= 0 ? "+" : ""}{p.change24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right hidden md:table-cell">
                    <span className={cn("tabular-nums", p.change7d >= 0 ? "text-green-500" : "text-red-500")}>
                      {p.change7d >= 0 ? "+" : ""}{p.change7d.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 hidden lg:table-cell">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ background: CATEGORY_COLORS[p.category] }}
                    >
                      {p.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* TVL bar chart */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            TVL by Protocol (horizontal)
          </div>
          <HorizontalBars
            items={protocols
              .slice()
              .sort((a, b) => b.tvl - a.tvl)
              .map((p) => ({
                label: p.name,
                value: p.tvl,
                color: CATEGORY_COLORS[p.category],
              }))}
          />
        </div>

        {/* Lido dominance donut */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Liquid Staking Dominance
          </div>
          <DonutChart slices={dominanceSlices} />
          <div className="mt-3 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-muted-foreground">
            Lido controls the majority of the liquid staking market.
            Rocket Pool, Frax, and others compete for the remainder.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section 2: Gas Tracker ────────────────────────────────────────────────────

const ACTION_TYPES: ActionType[] = [
  "ETH Transfer",
  "ERC-20 Transfer",
  "Uniswap Swap",
  "NFT Mint",
];

const ETH_PRICE_USD = 3580; // proxy

function GasTracker({ gasPrice }: { gasPrice: GasPrice }) {
  const [alertThreshold, setAlertThreshold] = useState("25");
  const [savedAlert, setSavedAlert] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionType>("Uniswap Swap");
  const heatmap = useMemo(() => generateGasHeatmap(), []);

  const gasLimit = ACTION_GAS[selectedAction];
  const costGwei  = gasPrice.standard * gasLimit;
  const costEth   = costGwei / 1e9;
  const costUSD   = costEth * ETH_PRICE_USD;

  function saveAlert() {
    const val = parseFloat(alertThreshold);
    if (!isNaN(val) && val > 0) setSavedAlert(val);
  }

  const alertActive = savedAlert !== null && gasPrice.standard <= savedAlert;

  return (
    <div className="flex flex-col gap-4">
      {/* Gas price tiers */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Ethereum Gas Prices (Gwei)
        </div>
        <div className="grid grid-cols-3 gap-3">
          {([
            { label: "Slow",     value: gasPrice.slow,     color: "text-green-500",  time: "~3 min" },
            { label: "Standard", value: gasPrice.standard, color: "text-amber-400",  time: "~30 sec" },
            { label: "Fast",     value: gasPrice.fast,     color: "text-red-500",    time: "~10 sec" },
          ] as const).map((tier) => (
            <div key={tier.label} className="rounded-md border border-border/40 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">{tier.label}</div>
              <div className={cn("text-xl font-bold tabular-nums", tier.color)}>
                {tier.value.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{tier.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 24h gas heatmap */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          24-Hour Gas Price Heatmap (7-Day)
        </div>
        <div className="overflow-x-auto">
          <GasHeatmap data={heatmap} />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Green = low gas · Red = high gas. UTC hours. Peak hours: 09:00–11:00 and 15:00–17:00.
        </div>
      </div>

      {/* Gas Alert + Tx Cost Calculator */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Gas alert */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5" />
            Gas Alert Threshold
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              placeholder="Gwei threshold"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="flex-1 rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={saveAlert}
              className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </div>
          {savedAlert !== null && (
            <div className={cn(
              "mt-2 rounded-md px-3 py-2 text-xs font-medium",
              alertActive ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-muted/30 text-muted-foreground",
            )}>
              {alertActive
                ? `Gas is at or below ${savedAlert} Gwei — good time to transact!`
                : `Alert set at ${savedAlert} Gwei. Current: ${gasPrice.standard.toFixed(1)} Gwei.`}
            </div>
          )}
        </div>

        {/* Tx cost calculator */}
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Transaction Cost Calculator
          </div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value as ActionType)}
            className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-3"
          >
            {ACTION_TYPES.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between rounded-md bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Gas Limit</span>
              <span className="tabular-nums font-medium">{gasLimit.toLocaleString()} units</span>
            </div>
            <div className="flex justify-between rounded-md bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Cost (Gwei)</span>
              <span className="tabular-nums font-medium">{costGwei.toLocaleString()}</span>
            </div>
            <div className="flex justify-between rounded-md bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Cost (ETH)</span>
              <span className="tabular-nums font-medium">{costEth.toFixed(6)} ETH</span>
            </div>
            <div className="flex justify-between rounded-md bg-primary/10 border border-primary/20 px-3 py-2">
              <span className="font-semibold">Cost (USD)</span>
              <span className="tabular-nums font-bold text-primary">${costUSD.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section 3: Whale Tracker ──────────────────────────────────────────────────

function WhaleTracker({
  activities,
}: {
  activities: WhaleActivity[];
}) {
  // Smart money consensus
  const tokenCounts: Record<string, { buys: number; sells: number }> = {};
  activities.forEach((a) => {
    if (!tokenCounts[a.token]) tokenCounts[a.token] = { buys: 0, sells: 0 };
    if (a.action === "buy") tokenCounts[a.token].buys++;
    else tokenCounts[a.token].sells++;
  });

  const consensus = Object.entries(tokenCounts)
    .map(([token, c]) => {
      const total = c.buys + c.sells;
      const bullPct = (c.buys / total) * 100;
      let signal: "BULLISH" | "BEARISH" | "MIXED" = "MIXED";
      if (bullPct >= 70) signal = "BULLISH";
      else if (bullPct <= 30) signal = "BEARISH";
      return { token, buys: c.buys, sells: c.sells, bullPct, signal };
    })
    .filter((c) => c.buys + c.sells >= 2)
    .sort((a, b) => Math.abs(b.bullPct - 50) - Math.abs(a.bullPct - 50));

  const topConsensus = consensus[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Smart money banner */}
      {topConsensus && (
        <div className={cn(
          "rounded-lg border p-4",
          topConsensus.signal === "BULLISH"
            ? "border-green-500/30 bg-green-500/5"
            : topConsensus.signal === "BEARISH"
            ? "border-red-500/30 bg-red-500/5"
            : "border-amber-500/30 bg-amber-500/5",
        )}>
          <div className="flex items-center gap-2">
            <Fish className="h-4 w-4 shrink-0" style={{
              color: topConsensus.signal === "BULLISH" ? "#22c55e" : topConsensus.signal === "BEARISH" ? "#ef4444" : "#f59e0b",
            }} />
            <span className="text-sm font-semibold">
              Smart Money:{" "}
              <span style={{
                color: topConsensus.signal === "BULLISH" ? "#22c55e" : topConsensus.signal === "BEARISH" ? "#ef4444" : "#f59e0b",
              }}>
                {topConsensus.signal}
              </span>{" "}
              on {topConsensus.token}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {topConsensus.buys} buys vs {topConsensus.sells} sells in last 24h —{" "}
            {topConsensus.bullPct.toFixed(0)}% bullish flow.
          </div>
        </div>
      )}

      {/* Whale table */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Whale Wallet Activity (Last 24h)
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Trades &gt; $500K by smart money wallets</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30 bg-muted/20">
                <th className="py-2 px-3 text-left font-semibold text-muted-foreground">Wallet</th>
                <th className="py-2 px-3 text-center font-semibold text-muted-foreground">Action</th>
                <th className="py-2 px-3 text-left font-semibold text-muted-foreground">Token</th>
                <th className="py-2 px-3 text-right font-semibold text-muted-foreground">Size ($M)</th>
                <th className="py-2 px-3 text-right font-semibold text-muted-foreground hidden sm:table-cell">Est. PnL</th>
                <th className="py-2 px-3 text-right font-semibold text-muted-foreground hidden md:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a, i) => (
                <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">{a.address}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      a.action === "buy"
                        ? "bg-green-500/15 text-green-500"
                        : "bg-red-500/15 text-red-500",
                    )}>
                      {a.action.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold">{a.token}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-medium">
                    ${a.sizeMil.toFixed(1)}M
                  </td>
                  <td className="py-2.5 px-3 text-right hidden sm:table-cell">
                    <span className={cn("tabular-nums font-medium", a.pnlEst >= 0 ? "text-green-500" : "text-red-500")}>
                      {a.pnlEst >= 0 ? "+" : ""}{a.pnlEst.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground hidden md:table-cell">
                    {a.hoursAgo}h ago
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consensus summary */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Token Consensus Summary
        </div>
        <div className="flex flex-col gap-2">
          {consensus.slice(0, 5).map((c) => (
            <div key={c.token} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-semibold">{c.token}</span>
              <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${c.bullPct}%` }}
                />
              </div>
              <span className={cn(
                "w-14 text-right font-medium",
                c.signal === "BULLISH" ? "text-green-500" : c.signal === "BEARISH" ? "text-red-500" : "text-amber-400",
              )}>
                {c.signal}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Flow chart */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Protocol Money Flow (Synthetic)
        </div>
        <div className="overflow-x-auto">
          <FlowChart activities={activities} />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Green = inflow · Red = outflow. Line thickness proportional to volume.
        </div>
      </div>
    </div>
  );
}

// ── Section 4: Yield Aggregator ───────────────────────────────────────────────

const ASSET_TABS: ("ETH" | "USDC" | "BTC")[] = ["ETH", "USDC", "BTC"];

const RISK_COLORS: Record<"Low" | "Medium" | "High", string> = {
  Low:    "text-green-500",
  Medium: "text-amber-400",
  High:   "text-red-500",
};

const RISK_BG: Record<"Low" | "Medium" | "High", string> = {
  Low:    "bg-green-500/15",
  Medium: "bg-amber-400/15",
  High:   "bg-red-500/15",
};

function YieldAggregator({ yields }: { yields: YieldOpportunity[] }) {
  const [assetFilter, setAssetFilter] = useState<"ETH" | "USDC" | "BTC">("ETH");
  const [sortBy, setSortBy] = useState<"apy" | "riskAdj">("riskAdj");
  const [ilToken0Amount, setIlToken0Amount] = useState("1");
  const [ilToken1Amount, setIlToken1Amount] = useState("3580");
  const [ilPriceChange, setIlPriceChange] = useState("50");

  const filtered = useMemo(() => {
    const list = yields.filter((y) => y.asset === assetFilter);
    const enriched = list.map((y) => ({
      ...y,
      riskAdj: riskAdjustedReturn(y.apy, y.risk),
    }));
    if (sortBy === "apy") return enriched.sort((a, b) => b.apy - a.apy);
    return enriched.sort((a, b) => b.riskAdj - a.riskAdj);
  }, [yields, assetFilter, sortBy]);

  const ilValue = calcIL(parseFloat(ilPriceChange) || 0);
  const t0 = parseFloat(ilToken0Amount) || 0;
  const t1 = parseFloat(ilToken1Amount) || 0;
  const poolValue = (t0 + t1) * 0.5 + (t0 + t1) * 0.5; // simplified
  const ilDollarLoss = poolValue * (Math.abs(ilValue) / 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Asset selector + sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {ASSET_TABS.map((asset) => (
            <button
              key={asset}
              type="button"
              onClick={() => setAssetFilter(asset)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                assetFilter === asset
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/50 text-muted-foreground hover:bg-accent/50",
              )}
            >
              {asset}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          <span className="text-xs text-muted-foreground self-center mr-1">Sort:</span>
          {([["riskAdj", "Risk-Adj"], ["apy", "APY"]] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setSortBy(val)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                sortBy === val
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/50 text-muted-foreground hover:bg-accent/50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Yield table */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground uppercase tracking-wide">Protocol</th>
                <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Strategy</th>
                <th className="py-2.5 px-3 text-right font-semibold text-muted-foreground uppercase tracking-wide">APY</th>
                <th className="py-2.5 px-3 text-right font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">TVL</th>
                <th className="py-2.5 px-3 text-center font-semibold text-muted-foreground uppercase tracking-wide">Risk</th>
                <th className="py-2.5 px-3 text-right font-semibold text-muted-foreground uppercase tracking-wide">Risk-Adj</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((y, i) => (
                <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-primary">{y.protocol}</td>
                  <td className="py-2.5 px-3 text-muted-foreground hidden sm:table-cell">{y.strategy}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-green-500">
                    {y.apy.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground hidden md:table-cell">
                    ${y.tvlMil >= 1000 ? `${(y.tvlMil / 1000).toFixed(1)}B` : `${y.tvlMil.toFixed(0)}M`}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={cn("rounded-full px-2 py-0.5 font-medium text-xs", RISK_COLORS[y.risk], RISK_BG[y.risk])}>
                      {y.risk}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-primary">
                    {y.riskAdj.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-border/30 bg-muted/10">
          <div className="text-xs text-muted-foreground">
            Risk-Adj = APY × (1 − discount): Low 5% · Medium 15% · High 30%
          </div>
        </div>
      </div>

      {/* Impermanent Loss Calculator */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Impermanent Loss Calculator
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-muted-foreground">Token A Amount</label>
            <input
              type="number"
              min="0"
              value={ilToken0Amount}
              onChange={(e) => setIlToken0Amount(e.target.value)}
              className="mt-1 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Token B Amount ($)</label>
            <input
              type="number"
              min="0"
              value={ilToken1Amount}
              onChange={(e) => setIlToken1Amount(e.target.value)}
              className="mt-1 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Price Change (%)</label>
            <input
              type="number"
              min="-99"
              max="1000"
              value={ilPriceChange}
              onChange={(e) => setIlPriceChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 text-xs">
          <div className="flex justify-between rounded-md bg-muted/30 px-3 py-2.5">
            <span className="text-muted-foreground">Impermanent Loss</span>
            <span className={cn("tabular-nums font-bold", ilValue < -1 ? "text-red-500" : "text-green-500")}>
              {ilValue.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between rounded-md bg-muted/30 px-3 py-2.5">
            <span className="text-muted-foreground">Est. Dollar Loss</span>
            <span className={cn("tabular-nums font-semibold", ilDollarLoss > 0.01 ? "text-red-500" : "text-muted-foreground")}>
              ${ilDollarLoss.toFixed(2)}
            </span>
          </div>
          <div className="rounded-md bg-muted/20 border border-border/30 px-3 py-2.5 text-muted-foreground leading-relaxed">
            Formula: IL = 2·√r/(1+r) − 1, where r is the price ratio change.
            A 50% price move causes ~5.7% IL; 300% causes ~25% IL.
            This is realized only when you withdraw from the pool.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main DeFiAnalytics Component ─────────────────────────────────────────────

type Section = "tvl" | "gas" | "whales" | "yield";

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "tvl",    label: "Protocol TVL",   icon: <BarChart2 className="h-3.5 w-3.5" /> },
  { id: "gas",    label: "Gas Tracker",    icon: <Flame className="h-3.5 w-3.5" />    },
  { id: "whales", label: "Whale Tracker",  icon: <Fish className="h-3.5 w-3.5" />     },
  { id: "yield",  label: "Yield Aggregator", icon: <Layers className="h-3.5 w-3.5" /> },
];

export function DeFiAnalytics() {
  const [section, setSection] = useState<Section>("tvl");

  const protocols   = useMemo(() => generateProtocols(), []);
  const gasPrice    = useMemo(() => generateGasPrice(), []);
  const whales      = useMemo(() => generateWhaleActivities(), []);
  const yieldOpps   = useMemo(() => generateYieldOpportunities(SEED), []);

  return (
    <div className="flex flex-col gap-4">
      {/* Section nav */}
      <div className="flex flex-wrap gap-1.5">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              section === s.id
                ? "bg-primary text-primary-foreground"
                : "border border-border/50 text-muted-foreground hover:bg-accent/50",
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      {section === "tvl"    && <TVLDashboard protocols={protocols} />}
      {section === "gas"    && <GasTracker gasPrice={gasPrice} />}
      {section === "whales" && <WhaleTracker activities={whales} />}
      {section === "yield"  && <YieldAggregator yields={yieldOpps} />}
    </div>
  );
}

export default DeFiAnalytics;
