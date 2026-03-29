"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Building2,
  Landmark,
  CreditCard,
  Package,
  Zap,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type AssetType =
  | "Real Estate"
  | "Treasury Bonds"
  | "Private Credit"
  | "Commodities"
  | "Infrastructure";

interface TokenizedAsset {
  id: string;
  name: string;
  type: AssetType;
  location: string;
  tokenPrice: number;
  change24h: number;
  apy: number;
  totalSupply: number;
  marketCap: number;
  minInvestment: number;
  description: string;
}

interface RWAHolding {
  assetId: string;
  tokensHeld: number;
  avgPrice: number;
}

type FilterType = "All" | AssetType;
type SortKey = "marketCap" | "apy" | "change24h";

// ─── Seeded PRNG (mulberry32) ─────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Synthetic Asset Data ────────────────────────────────────────────────────

function buildAssets(): TokenizedAsset[] {
  const rand = mulberry32(0xdeadbeef);

  const templates: Omit<
    TokenizedAsset,
    "tokenPrice" | "change24h" | "apy" | "totalSupply" | "marketCap" | "minInvestment"
  >[] = [
    {
      id: "re-manhattan",
      name: "Manhattan Office Tower",
      type: "Real Estate",
      location: "New York, NY",
      description:
        "Class-A commercial office building in Midtown Manhattan with 42 floors and long-term corporate tenants.",
    },
    {
      id: "re-miami",
      name: "Miami Luxury Residences",
      type: "Real Estate",
      location: "Miami, FL",
      description:
        "Upscale residential complex in Brickell with 320 units and premium amenities generating stable rental income.",
    },
    {
      id: "re-la-retail",
      name: "LA Retail Complex",
      type: "Real Estate",
      location: "Los Angeles, CA",
      description:
        "High-traffic retail hub in West Hollywood anchored by national brand tenants with 98% occupancy.",
    },
    {
      id: "re-austin",
      name: "Austin Tech Campus",
      type: "Real Estate",
      location: "Austin, TX",
      description:
        "Modern suburban office campus leased to Fortune 500 tech companies with 10-year NNN lease terms.",
    },
    {
      id: "tb-2yr",
      name: "US 2-Year Treasury",
      type: "Treasury Bonds",
      location: "United States",
      description:
        "Tokenized 2-year Treasury notes backed 1:1 by US government bonds held in regulated custody.",
    },
    {
      id: "tb-10yr",
      name: "US 10-Year Treasury",
      type: "Treasury Bonds",
      location: "United States",
      description:
        "Tokenized 10-year Treasury bonds with daily interest accrual and T+0 settlement on-chain.",
    },
    {
      id: "tb-30yr",
      name: "US 30-Year Treasury",
      type: "Treasury Bonds",
      location: "United States",
      description:
        "Long-duration Treasury bonds suitable for income-focused investors seeking low-risk fixed income.",
    },
    {
      id: "pc-corp",
      name: "Corporate Loan Portfolio",
      type: "Private Credit",
      location: "United States",
      description:
        "Senior-secured loans to mid-market companies rated BB or above with floating rate structures.",
    },
    {
      id: "pc-infra",
      name: "Infrastructure Debt Fund",
      type: "Private Credit",
      location: "Global",
      description:
        "Investment-grade debt financing for toll roads, utilities, and renewable energy infrastructure projects.",
    },
    {
      id: "co-gold",
      name: "Physical Gold Vault",
      type: "Commodities",
      location: "Zurich, Switzerland",
      description:
        "Each token represents 0.1 troy ounce of LBMA-certified gold stored in Swiss bank vaults.",
    },
    {
      id: "co-oil",
      name: "Crude Oil Barrel Units",
      type: "Commodities",
      location: "Houston, TX",
      description:
        "Tokenized WTI crude oil barrels stored in insured NYMEX-registered facilities.",
    },
    {
      id: "infra-solar",
      name: "Solar Farm Portfolio",
      type: "Infrastructure",
      location: "Southwest US",
      description:
        "Portfolio of 14 utility-scale solar farms with 20-year power purchase agreements generating predictable cash flows.",
    },
  ];

  const apyByType: Record<AssetType, [number, number]> = {
    "Real Estate": [5.5, 8.5],
    "Treasury Bonds": [4.2, 5.4],
    "Private Credit": [8.0, 12.5],
    "Commodities": [0, 0],
    "Infrastructure": [6.5, 9.0],
  };

  return templates.map((t) => {
    const price = 10 + rand() * 990;
    const supply = Math.round((50_000 + rand() * 950_000) / 100) * 100;
    const [minApy, maxApy] = apyByType[t.type];
    const apy = t.type === "Commodities" ? 0 : minApy + rand() * (maxApy - minApy);
    const change24h = (rand() - 0.48) * 6;
    const minInv =
      t.type === "Real Estate" || t.type === "Private Credit"
        ? Math.round((500 + rand() * 4500) / 100) * 100
        : Math.round((50 + rand() * 450) / 10) * 10;

    return {
      ...t,
      tokenPrice: Math.round(price * 100) / 100,
      change24h: Math.round(change24h * 100) / 100,
      apy: Math.round(apy * 100) / 100,
      totalSupply: supply,
      marketCap: Math.round(price * supply),
      minInvestment: minInv,
    };
  });
}

const ASSETS = buildAssets();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

const TYPE_ICON: Record<AssetType, React.ReactNode> = {
  "Real Estate": <Building2 className="h-3.5 w-3.5" />,
  "Treasury Bonds": <Landmark className="h-3.5 w-3.5" />,
  "Private Credit": <CreditCard className="h-3.5 w-3.5" />,
  "Commodities": <Package className="h-3.5 w-3.5" />,
  "Infrastructure": <Zap className="h-3.5 w-3.5" />,
};

const TYPE_COLOR: Record<AssetType, string> = {
  "Real Estate": "bg-primary/10 text-primary border-border",
  "Treasury Bonds": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Private Credit": "bg-primary/10 text-primary border-border",
  "Commodities": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Infrastructure": "bg-teal-500/10 text-emerald-400 border-teal-500/20",
};

const FILTER_OPTIONS: FilterType[] = [
  "All",
  "Real Estate",
  "Treasury Bonds",
  "Private Credit",
  "Commodities",
  "Infrastructure",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: AssetType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium",
        TYPE_COLOR[type],
      )}
    >
      {TYPE_ICON[type]}
      {type}
    </span>
  );
}

function ChangeChip({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        positive ? "text-emerald-400" : "text-red-400",
      )}
    >
      {positive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {positive ? "+" : ""}
      {fmt(value)}%
    </span>
  );
}

// ─── Donut Chart (pure SVG) ────────────────────────────────────────────────────

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ slices }: { slices: DonutSlice[] }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const cx = 80;
  const cy = 80;
  const r = 60;
  const innerR = 36;
  const gap = 0.02; // radians gap between slices

  let cumAngle = -Math.PI / 2;

  const paths = slices.map((slice) => {
    const fraction = slice.value / total;
    const angle = fraction * 2 * Math.PI - gap;
    const startAngle = cumAngle + gap / 2;
    const endAngle = startAngle + angle;
    cumAngle += fraction * 2 * Math.PI;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(startAngle);
    const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const midAngle = startAngle + angle / 2;
    const labelR = r + 16;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    return { slice, path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`, lx, ly, pct: Math.round(fraction * 100) };
  });

  return (
    <svg viewBox="0 0 160 160" className="w-full max-w-[200px]">
      {paths.map(({ slice, path, lx, ly, pct }) => (
        <g key={slice.label}>
          <path d={path} fill={slice.color} opacity={0.85} />
          {pct >= 8 && (
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fill="currentColor"
              className="text-muted-foreground"
            >
              {pct}%
            </text>
          )}
        </g>
      ))}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize="8"
        fill="currentColor"
        className="text-muted-foreground"
      >
        Allocation
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="9" fontWeight="600" fill="currentColor">
        {slices.length} Assets
      </text>
    </svg>
  );
}

// ─── Bar Chart (pure SVG) ──────────────────────────────────────────────────────

interface BarSeries {
  label: string;
  color: string;
  values: number[]; // one per year
}

function ComparisonBarChart({
  series,
  years,
}: {
  series: BarSeries[];
  years: number[];
}) {
  const allValues = series.flatMap((s) => s.values);
  const maxVal = Math.max(...allValues, 1);

  const chartW = 400;
  const chartH = 160;
  const padL = 48;
  const padB = 24;
  const padT = 12;
  const innerW = chartW - padL - 16;
  const innerH = chartH - padT - padB;

  const groupW = innerW / years.length;
  const barW = (groupW * 0.7) / series.length;
  const barGap = barW * 0.1;

  const yTicks = [0, 25, 50, 75, 100].filter((v) => v <= maxVal + 5);

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
      {/* Y grid lines + labels */}
      {yTicks.map((tick) => {
        const y = padT + innerH - (tick / maxVal) * innerH;
        return (
          <g key={tick}>
            <line
              x1={padL}
              y1={y}
              x2={chartW - 8}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
            <text
              x={padL - 4}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="7"
              fill="currentColor"
              opacity={0.5}
            >
              {tick}%
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {years.map((yr, gi) => {
        const groupX = padL + gi * groupW + groupW * 0.15;
        return (
          <g key={yr}>
            {series.map((s, si) => {
              const val = s.values[gi] ?? 0;
              const barH = (val / maxVal) * innerH;
              const x = groupX + si * (barW + barGap);
              const y = padT + innerH - barH;
              return (
                <rect
                  key={s.label}
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={1}
                  fill={s.color}
                  opacity={0.8}
                />
              );
            })}
            {/* X label */}
            <text
              x={groupX + ((barW + barGap) * series.length) / 2}
              y={chartH - padB + 10}
              textAnchor="middle"
              fontSize="7"
              fill="currentColor"
              opacity={0.5}
            >
              Yr {yr}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Tab: Markets ─────────────────────────────────────────────────────────────

function MarketsTab({
  onSimulatePurchase,
}: {
  onSimulatePurchase: (asset: TokenizedAsset) => void;
}) {
  const [filter, setFilter] = useState<FilterType>("All");
  const [sort, setSort] = useState<SortKey>("marketCap");
  const [sortAsc, setSortAsc] = useState(false);

  const displayed = useMemo(() => {
    let list = filter === "All" ? ASSETS : ASSETS.filter((a) => a.type === filter);
    list = [...list].sort((a, b) => {
      const diff = a[sort] - b[sort];
      return sortAsc ? diff : -diff;
    });
    return list;
  }, [filter, sort, sortAsc]);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sort === key) setSortAsc((v) => !v);
      else {
        setSort(key);
        setSortAsc(false);
      }
    },
    [sort],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Filters + Sort row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                filter === f
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span className="shrink-0">Sort:</span>
          {(
            [
              { key: "marketCap" as SortKey, label: "Market Cap" },
              { key: "apy" as SortKey, label: "APY" },
              { key: "change24h" as SortKey, label: "24h Change" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={cn(
                "flex items-center gap-0.5 rounded px-2 py-0.5 transition-colors",
                sort === key
                  ? "bg-accent text-foreground"
                  : "hover:bg-accent/50 hover:text-foreground",
              )}
            >
              {label}
              {sort === key &&
                (sortAsc ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                ))}
            </button>
          ))}
        </div>
      </div>

      {/* Asset grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {displayed.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onSimulatePurchase={onSimulatePurchase}
          />
        ))}
      </div>
    </div>
  );
}

function AssetCard({
  asset,
  onSimulatePurchase,
}: {
  asset: TokenizedAsset;
  onSimulatePurchase: (a: TokenizedAsset) => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight truncate">{asset.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{asset.location}</p>
        </div>
        <TypeBadge type={asset.type} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <div>
          <p className="text-xs text-muted-foreground">Token Price</p>
          <p className="font-mono text-sm font-semibold">${fmt(asset.tokenPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">24h Change</p>
          <ChangeChip value={asset.change24h} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {asset.type === "Commodities" ? "Yield" : "APY"}
          </p>
          <p className="text-sm font-medium text-emerald-400">
            {asset.apy > 0 ? `${fmt(asset.apy)}%` : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Market Cap</p>
          <p className="text-sm font-medium">{fmtCompact(asset.marketCap)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total Supply</p>
          <p className="font-mono text-xs">{asset.totalSupply.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Min. Investment</p>
          <p className="font-mono text-xs">${asset.minInvestment.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-auto pt-1">
        <button
          onClick={() => onSimulatePurchase(asset)}
          className="w-full rounded-md bg-primary/10 border border-primary/20 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

// ─── Purchase Modal ────────────────────────────────────────────────────────────

function PurchaseModal({
  asset,
  onConfirm,
  onClose,
}: {
  asset: TokenizedAsset;
  onConfirm: (tokens: number) => void;
  onClose: () => void;
}) {
  const [tokens, setTokens] = useState(1);
  const totalCost = tokens * asset.tokenPrice;
  const annualYield = asset.apy > 0 ? (totalCost * asset.apy) / 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl space-y-4 mx-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold">Simulate Purchase</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{asset.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-lg leading-none"
          >
            &times;
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Number of Tokens</label>
          <input
            type="number"
            min={1}
            max={10000}
            value={tokens}
            onChange={(e) => setTokens(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-md border bg-muted px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Token Price</span>
            <span className="font-mono font-medium">${fmt(asset.tokenPrice)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Tokens</span>
            <span className="font-mono font-medium">{tokens.toLocaleString()}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Total Cost</span>
            <span className="font-mono font-semibold">${fmt(totalCost)}</span>
          </div>
          {annualYield > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Est. Annual Yield</span>
              <span className="font-mono font-medium text-emerald-400">
                ${fmt(annualYield)} ({fmt(asset.apy)}%)
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border py-1.5 text-xs font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(tokens)}
            className="flex-1 rounded-md bg-primary py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Add to Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: My Portfolio ────────────────────────────────────────────────────────

const DONUT_COLORS: Record<AssetType, string> = {
  "Real Estate": "#3b82f6",
  "Treasury Bonds": "#10b981",
  "Private Credit": "#a855f7",
  "Commodities": "#f59e0b",
  "Infrastructure": "#14b8a6",
};

function PortfolioTab({
  holdings,
  onOpenPurchase,
}: {
  holdings: RWAHolding[];
  onOpenPurchase: () => void;
}) {
  const enriched = useMemo(() => {
    return holdings.map((h) => {
      const asset = ASSETS.find((a) => a.id === h.assetId)!;
      const currentValue = h.tokensHeld * asset.tokenPrice;
      const costBasis = h.tokensHeld * h.avgPrice;
      const pnl = currentValue - costBasis;
      const annualYield = asset.apy > 0 ? (currentValue * asset.apy) / 100 : 0;
      return { ...h, asset, currentValue, costBasis, pnl, annualYield };
    });
  }, [holdings]);

  const totalValue = useMemo(
    () => enriched.reduce((s, h) => s + h.currentValue, 0),
    [enriched],
  );
  const totalYield = useMemo(
    () => enriched.reduce((s, h) => s + h.annualYield, 0),
    [enriched],
  );
  const totalPnl = useMemo(
    () => enriched.reduce((s, h) => s + h.pnl, 0),
    [enriched],
  );

  // Compute diversification score (0-100) based on unique asset types
  const uniqueTypes = new Set(enriched.map((h) => h.asset.type)).size;
  const divScore = Math.round((uniqueTypes / 5) * 100);

  // Donut slices by asset type
  const slices = useMemo(() => {
    const byType: Partial<Record<AssetType, number>> = {};
    for (const h of enriched) {
      byType[h.asset.type] = (byType[h.asset.type] ?? 0) + h.currentValue;
    }
    return (Object.entries(byType) as [AssetType, number][]).map(
      ([type, value]) => ({
        label: type,
        value,
        color: DONUT_COLORS[type],
      }),
    );
  }, [enriched]);

  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">
          Your portfolio is empty. Browse the Markets tab and simulate a purchase.
        </p>
        <button
          onClick={onOpenPurchase}
          className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Browse Markets
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryChip label="Total Value" value={fmtCompact(totalValue)} />
        <SummaryChip
          label="Annual Yield"
          value={`${fmtCompact(totalYield)}/yr`}
          className="text-emerald-400"
        />
        <SummaryChip
          label="Unrealized P&L"
          value={`${totalPnl >= 0 ? "+" : ""}${fmtCompact(Math.abs(totalPnl))}`}
          className={totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}
        />
        <SummaryChip label="Diversification" value={`${divScore}/100`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Holdings table */}
        <div className="lg:col-span-2 overflow-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Asset", "Tokens", "Avg Price", "Value", "APY", "P&L"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {enriched.map((h, i) => (
                <tr
                  key={h.assetId}
                  className={cn(
                    "border-b last:border-0 transition-colors hover:bg-muted/20",
                    i % 2 === 0 ? "" : "bg-muted/10",
                  )}
                >
                  <td className="px-3 py-2">
                    <p className="font-medium truncate max-w-[140px]">
                      {h.asset.name}
                    </p>
                    <TypeBadge type={h.asset.type} />
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums">
                    {h.tokensHeld.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums">
                    ${fmt(h.avgPrice)}
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums font-medium">
                    ${fmt(h.currentValue)}
                  </td>
                  <td className="px-3 py-2 font-medium text-emerald-400">
                    {h.asset.apy > 0 ? `${fmt(h.asset.apy)}%` : "—"}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 font-mono tabular-nums",
                      h.pnl >= 0 ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {h.pnl >= 0 ? "+" : ""}${fmt(h.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Donut chart */}
        <div className="rounded-lg border bg-card p-4 flex flex-col items-center gap-4">
          <h3 className="text-sm font-medium">Allocation</h3>
          <DonutChart slices={slices} />
          <div className="w-full space-y-1">
            {slices.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ background: s.color }}
                />
                <span className="flex-1 text-muted-foreground">{s.label}</span>
                <span className="font-medium font-mono">
                  {fmtCompact(s.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryChip({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-semibold font-mono", className)}>{value}</p>
    </div>
  );
}

// ─── Tab: Yield Calculator ────────────────────────────────────────────────────

const HOLDING_PERIODS = [1, 3, 5, 10] as const;
type HoldingPeriod = (typeof HOLDING_PERIODS)[number];

const SP500_ANNUAL = 10.5;
const TREASURY_ANNUAL = 4.8;
const CASH_ANNUAL = 2.0;

function YieldCalculatorTab() {
  const [selectedAssetId, setSelectedAssetId] = useState(ASSETS[0].id);
  const [investmentAmount, setInvestmentAmount] = useState(50_000);
  const [holdingPeriod, setHoldingPeriod] = useState<HoldingPeriod>(5);

  const asset = useMemo(
    () => ASSETS.find((a) => a.id === selectedAssetId)!,
    [selectedAssetId],
  );

  const compoundReturn = useCallback(
    (rate: number, years: number) =>
      investmentAmount * (Math.pow(1 + rate / 100, years) - 1),
    [investmentAmount],
  );

  // Year-by-year table
  const rows = useMemo(() => {
    const yrs = Array.from({ length: holdingPeriod }, (_, i) => i + 1);
    return yrs.map((yr) => ({
      year: yr,
      rwa: compoundReturn(asset.apy, yr),
      sp500: compoundReturn(SP500_ANNUAL, yr),
      treasury: compoundReturn(TREASURY_ANNUAL, yr),
      cash: compoundReturn(CASH_ANNUAL, yr),
    }));
  }, [asset, holdingPeriod, compoundReturn]);

  const annualIncome = (investmentAmount * asset.apy) / 100;

  const chartSeries: BarSeries[] = [
    { label: asset.type, color: DONUT_COLORS[asset.type], values: rows.map((r) => (r.rwa / investmentAmount) * 100) },
    { label: "S&P 500", color: "#6366f1", values: rows.map((r) => (r.sp500 / investmentAmount) * 100) },
    { label: "Treasury", color: "#10b981", values: rows.map((r) => (r.treasury / investmentAmount) * 100) },
    { label: "Cash", color: "#6b7280", values: rows.map((r) => (r.cash / investmentAmount) * 100) },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Inputs */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Parameters</h3>

        {/* Asset selector */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Select Asset</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full rounded-md border bg-muted px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          >
            {ASSETS.filter((a) => a.apy > 0).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({fmt(a.apy)}% APY)
              </option>
            ))}
          </select>
        </div>

        {/* Investment slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <label className="text-muted-foreground">Investment Amount</label>
            <span className="font-mono font-semibold">
              ${investmentAmount.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={1_000}
            max={1_000_000}
            step={1_000}
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$1,000</span>
            <span>$1,000,000</span>
          </div>
        </div>

        {/* Holding period */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Holding Period</label>
          <div className="flex gap-1">
            {HOLDING_PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setHoldingPeriod(p)}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                  holdingPeriod === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {p}yr
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      {asset.apy > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <SummaryChip
            label="Annual Income"
            value={`$${fmt(annualIncome)}`}
            className="text-emerald-400"
          />
          <SummaryChip
            label={`${holdingPeriod}yr Total Gain (RWA)`}
            value={`$${fmt(compoundReturn(asset.apy, holdingPeriod))}`}
          />
          <SummaryChip
            label="vs S&P 500 Gap"
            value={`${compoundReturn(asset.apy, holdingPeriod) > compoundReturn(SP500_ANNUAL, holdingPeriod) ? "+" : ""}$${fmt(compoundReturn(asset.apy, holdingPeriod) - compoundReturn(SP500_ANNUAL, holdingPeriod))}`}
            className={
              compoundReturn(asset.apy, holdingPeriod) >=
              compoundReturn(SP500_ANNUAL, holdingPeriod)
                ? "text-emerald-400"
                : "text-amber-400"
            }
          />
        </div>
      )}

      {/* Bar chart */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium">Cumulative Return Comparison</h3>
        <ComparisonBarChart
          series={chartSeries}
          years={rows.map((r) => r.year)}
        />
        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {chartSeries.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Year-by-year table */}
      <div className="rounded-lg border overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/30">
              {["Year", "RWA Gain", "S&P 500 Gain", "Treasury Gain", "Cash Gain"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.year}
                className="border-b last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-3 py-2 font-medium">Year {row.year}</td>
                <td className="px-3 py-2 font-mono tabular-nums text-emerald-400">
                  +${fmt(row.rwa)}
                </td>
                <td className="px-3 py-2 font-mono tabular-nums text-indigo-400">
                  +${fmt(row.sp500)}
                </td>
                <td className="px-3 py-2 font-mono tabular-nums text-emerald-400">
                  +${fmt(row.treasury)}
                </td>
                <td className="px-3 py-2 font-mono tabular-nums text-muted-foreground">
                  +${fmt(row.cash)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Education ───────────────────────────────────────────────────────────

const BENEFITS = [
  {
    title: "Fractional Ownership",
    description:
      "Invest in high-value assets like Manhattan skyscrapers or private credit funds with as little as $50, removing traditional barriers to entry.",
  },
  {
    title: "24/7 Trading",
    description:
      "Unlike traditional real estate or bond markets constrained to business hours, tokenized assets trade continuously on blockchain rails.",
  },
  {
    title: "Global Access",
    description:
      "Anyone with an internet connection can participate in asset classes historically reserved for institutional investors or ultra-high-net-worth individuals.",
  },
  {
    title: "Transparency",
    description:
      "Ownership records, transaction history, and asset details are immutably recorded on-chain, reducing fraud risk and increasing auditability.",
  },
  {
    title: "Faster Settlement",
    description:
      "Traditional real estate closes in 30-60 days. Tokenized assets settle in minutes with atomic, programmable transactions.",
  },
];

const RISKS = [
  {
    title: "Regulatory Risk",
    description:
      "The legal classification of tokenized assets varies by jurisdiction. Regulatory changes could affect token liquidity or legality.",
  },
  {
    title: "Liquidity Risk",
    description:
      "Secondary markets for RWA tokens may be thin. Selling positions quickly can be difficult, especially in market dislocations.",
  },
  {
    title: "Smart Contract Risk",
    description:
      "Bugs or exploits in the underlying smart contracts could freeze or lose funds. Code audits reduce but do not eliminate this risk.",
  },
  {
    title: "Custody Risk",
    description:
      "The underlying physical asset (gold, property, bonds) must be held by a trusted custodian. Custodian insolvency is a tail risk.",
  },
  {
    title: "Valuation Uncertainty",
    description:
      "Unlike stocks with real-time price discovery, real assets may be illiquid and require periodic independent appraisals.",
  },
];

const GLOSSARY = [
  {
    term: "APY",
    definition:
      "Annual Percentage Yield — the effective annual rate of return, including compounding. A 7% APY means $10,000 grows to $10,700 after one year.",
  },
  {
    term: "Market Cap",
    definition:
      "Total market capitalization of the token. Calculated as Token Price × Total Supply. Represents the aggregate market value of the asset.",
  },
  {
    term: "Token Supply",
    definition:
      "The fixed number of tokens issued representing fractional ownership of the underlying asset. Dividends and income are distributed pro-rata.",
  },
  {
    term: "Minimum Investment",
    definition:
      "The smallest purchase allowed. Issuers set this to manage administrative costs and regulatory compliance thresholds.",
  },
  {
    term: "NNN Lease",
    definition:
      "Triple Net Lease — tenant pays property taxes, insurance, and maintenance in addition to rent. Common in commercial real estate, providing stable landlord income.",
  },
  {
    term: "NAV",
    definition:
      "Net Asset Value — the fair market value of the underlying asset minus liabilities, divided by outstanding tokens. Tokens may trade at a premium or discount to NAV.",
  },
];

const REAL_EXAMPLES = [
  {
    name: "Blackstone BREIT",
    type: "Real Estate",
    detail:
      "Blackstone Real Estate Income Trust — $60B+ fund tokenizing institutional real estate. Retail investors access Class B shares via blockchain rails.",
  },
  {
    name: "Hamilton Lane SCOPE",
    type: "Private Credit",
    detail:
      "First tokenized private credit fund on a public blockchain. Reduced minimum from $20M to $20,000, democratizing private debt access.",
  },
  {
    name: "Franklin OnChain US Gov Money Fund",
    type: "Treasury Bonds",
    detail:
      "Franklin Templeton's BENJI token on Polygon represents shares in a money market fund holding US Treasuries, offering T+0 settlement.",
  },
  {
    name: "Paxos Gold (PAXG)",
    type: "Commodities",
    detail:
      "Each PAXG token represents one troy ounce of London Good Delivery gold stored in Brink's vaults. Redeemable for physical gold.",
  },
];

function EducationTab() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Explainer */}
      <div className="rounded-lg border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold">What is RWA Tokenization?</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Real World Asset (RWA) tokenization is the process of representing
          ownership rights in physical or off-chain financial assets as digital
          tokens on a blockchain. These tokens function like fractional shares of
          the underlying asset, entitling holders to a pro-rata share of income,
          appreciation, and liquidation proceeds.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The tokenized asset market surpassed $10 billion in 2024 and is projected
          to reach $16 trillion by 2030 according to Boston Consulting Group
          estimates. Asset classes being tokenized include commercial real estate,
          US Treasury bills, private credit, commodities, infrastructure, and even
          art and royalties.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Each token is typically backed 1:1 by the underlying asset held in legal
          trust or regulated custody. Smart contracts automate dividend distributions,
          transfer restrictions, and compliance checks — reducing intermediary costs
          and settlement times from weeks to seconds.
        </p>
      </div>

      {/* Benefits */}
      <div className="rounded-lg border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold">Key Benefits</h3>
        <div className="space-y-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium">{b.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risks */}
      <div className="rounded-lg border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold">Key Risks</h3>
        <div className="space-y-3">
          {RISKS.map((r) => (
            <div key={r.title} className="flex gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              </div>
              <div>
                <p className="text-xs font-medium">{r.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {r.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Glossary */}
      <div className="rounded-lg border bg-card p-5 space-y-3">
        <div className="flex items-center gap-1.5">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Key Metrics Glossary</h3>
        </div>
        <div className="space-y-2">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="rounded-md bg-muted/30 px-3 py-2 space-y-0.5">
              <p className="text-xs font-semibold text-primary">{g.term}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {g.definition}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Real examples */}
      <div className="rounded-lg border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold">Real-World Examples</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {REAL_EXAMPLES.map((ex) => (
            <div key={ex.name} className="rounded-md border p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold leading-tight">{ex.name}</p>
                <TypeBadge type={ex.type as AssetType} />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {ex.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabId = "markets" | "portfolio" | "calculator" | "education";

const TABS: { id: TabId; label: string }[] = [
  { id: "markets", label: "Markets" },
  { id: "portfolio", label: "My Portfolio" },
  { id: "calculator", label: "Yield Calculator" },
  { id: "education", label: "Education" },
];

export default function TokenizedPage() {
  const [activeTab, setActiveTab] = useState<TabId>("markets");
  const [holdings, setHoldings] = useState<RWAHolding[]>([]);
  const [purchaseTarget, setPurchaseTarget] = useState<TokenizedAsset | null>(null);

  const handleSimulatePurchase = useCallback((asset: TokenizedAsset) => {
    setPurchaseTarget(asset);
  }, []);

  const handleConfirmPurchase = useCallback(
    (tokens: number) => {
      if (!purchaseTarget) return;
      setHoldings((prev) => {
        const existing = prev.find((h) => h.assetId === purchaseTarget.id);
        if (existing) {
          const totalTokens = existing.tokensHeld + tokens;
          const newAvg =
            (existing.tokensHeld * existing.avgPrice +
              tokens * purchaseTarget.tokenPrice) /
            totalTokens;
          return prev.map((h) =>
            h.assetId === purchaseTarget.id
              ? { ...h, tokensHeld: totalTokens, avgPrice: newAvg }
              : h,
          );
        }
        return [
          ...prev,
          {
            assetId: purchaseTarget.id,
            tokensHeld: tokens,
            avgPrice: purchaseTarget.tokenPrice,
          },
        ];
      });
      setPurchaseTarget(null);
    },
    [purchaseTarget],
  );

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Tokenized Real World Assets</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Simulate fractional ownership of real-world assets
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded border bg-emerald-500/10 border-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
              {holdings.length} positions
            </span>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="border-b border-border px-4">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-xs font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "markets" && (
          <MarketsTab onSimulatePurchase={handleSimulatePurchase} />
        )}
        {activeTab === "portfolio" && (
          <PortfolioTab
            holdings={holdings}
            onOpenPurchase={() => setActiveTab("markets")}
          />
        )}
        {activeTab === "calculator" && <YieldCalculatorTab />}
        {activeTab === "education" && <EducationTab />}
      </div>

      {/* Purchase modal */}
      {purchaseTarget && (
        <PurchaseModal
          asset={purchaseTarget}
          onConfirm={handleConfirmPurchase}
          onClose={() => setPurchaseTarget(null)}
        />
      )}
    </div>
  );
}
