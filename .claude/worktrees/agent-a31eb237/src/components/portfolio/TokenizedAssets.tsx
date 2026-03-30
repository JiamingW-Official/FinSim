"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TOKENIZED_ASSETS,
  ASSET_CATEGORIES,
  LIQUIDITY_COLORS,
  RISK_COLORS,
  type AssetCategory,
  type TokenizedAsset,
} from "@/data/tokenized-assets";
import { cn } from "@/lib/utils";
import { Info, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtCurrency(n: number): string {
  return "$" + fmt(n);
}

// ─── Pie chart (pure SVG) ─────────────────────────────────────────────────────

const PIE_COLORS = [
  "#2d9cdb",
  "#22c55e",
  "#f59e0b",
  "#a78bfa",
  "#fb923c",
  "#34d399",
  "#f87171",
  "#60a5fa",
];

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

function AllocationPie({ slices }: { slices: PieSlice[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  const R = 60;
  const cx = 80;
  const cy = 72;

  // Build arc paths
  let cursor = -Math.PI / 2; // start at top
  const arcs = slices.map((sl, i) => {
    const angle = (sl.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(cursor);
    const y1 = cy + R * Math.sin(cursor);
    cursor += angle;
    const x2 = cx + R * Math.cos(cursor);
    const y2 = cy + R * Math.sin(cursor);
    const largeArc = angle > Math.PI ? 1 : 0;
    const midAngle = cursor - angle / 2;
    const labelR = R * 0.68;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    return { d: `M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${largeArc},1 ${x2},${y2} Z`, lx, ly, i, sl };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={160} height={144} viewBox="0 0 160 144">
        {arcs.map(({ d, lx, ly, i, sl }) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <path
              d={d}
              fill={sl.color}
              stroke="hsl(var(--background))"
              strokeWidth={2}
              opacity={hovered === null || hovered === i ? 1 : 0.55}
              style={{ transition: "opacity 0.15s" }}
            />
            {(sl.value / total) > 0.07 && (
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize={8}
                fontWeight={600}
                style={{ pointerEvents: "none" }}
              >
                {Math.round((sl.value / total) * 100)}%
              </text>
            )}
          </g>
        ))}
        {hovered !== null && (
          <>
            <text x={cx} y={cy - 6} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={8} fontWeight={600}>
              {slices[hovered].label.length > 12 ? slices[hovered].label.slice(0, 11) + "…" : slices[hovered].label}
            </text>
            <text x={cx} y={cy + 6} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={9} fontWeight={700} fontFamily="monospace">
              {fmtCurrency(slices[hovered].value)}
            </text>
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {slices.map((sl, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: sl.color }} />
            <span className="truncate text-[10px] text-muted-foreground">{sl.label}</span>
            <span className="ml-auto font-mono text-[10px] tabular-nums text-foreground">{Math.round((sl.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settlement comparison timeline ──────────────────────────────────────────

function SettlementTimeline() {
  const traditional = [
    { label: "Order placed", time: "0h" },
    { label: "Clearing house", time: "24h" },
    { label: "Custodian", time: "48h" },
    { label: "Owner record", time: "72h" },
  ];
  const tokenized = [
    { label: "Transaction signed", time: "0s" },
    { label: "Smart contract", time: "1s" },
    { label: "On-chain record", time: "3s" },
  ];

  return (
    <div className="space-y-4">
      {/* Traditional path */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Traditional Settlement — 72 hours
        </p>
        <div className="flex items-center gap-0">
          {traditional.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.12 }}
                >
                  <span className="text-[8px] font-bold text-amber-400">{i + 1}</span>
                </motion.div>
                <span className="mt-1 max-w-[56px] text-center text-[8px] leading-tight text-muted-foreground">
                  {step.label}
                </span>
                <span className="mt-0.5 text-[8px] font-mono text-amber-400">{step.time}</span>
              </div>
              {i < traditional.length - 1 && (
                <ArrowRight className="mx-1 h-3 w-3 shrink-0 text-muted-foreground/50" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tokenized path */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tokenized Settlement — 3 seconds
        </p>
        <div className="flex items-center gap-0">
          {tokenized.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2d9cdb]/40 bg-[#2d9cdb]/10"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.12 }}
                >
                  <span className="text-[8px] font-bold text-[#2d9cdb]">{i + 1}</span>
                </motion.div>
                <span className="mt-1 max-w-[56px] text-center text-[8px] leading-tight text-muted-foreground">
                  {step.label}
                </span>
                <span className="mt-0.5 text-[8px] font-mono text-[#2d9cdb]">{step.time}</span>
              </div>
              {i < tokenized.length - 1 && (
                <ArrowRight className="mx-1 h-3 w-3 shrink-0 text-muted-foreground/50" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Asset card ───────────────────────────────────────────────────────────────

interface AssetCardProps {
  asset: TokenizedAsset;
  holding: number; // dollar value held
  onBuy: (asset: TokenizedAsset, amount: number) => void;
}

function AssetCard({ asset, holding, onBuy }: AssetCardProps) {
  const [amount, setAmount] = useState<string>("10");
  const [showNote, setShowNote] = useState(false);

  const parsed = parseFloat(amount) || 0;
  const isValid = parsed >= asset.minimumInvestment;

  const liquidityClass = LIQUIDITY_COLORS[asset.liquidity];
  const riskClass = RISK_COLORS[asset.riskLevel];

  return (
    <div className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-border/60">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{asset.name}</p>
          <p className="text-[10px] text-muted-foreground">{asset.category}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="font-mono text-xs tabular-nums font-semibold">
            {fmtCurrency(asset.currentPrice)}
          </span>
          {asset.yield > 0 && (
            <span className="rounded bg-green-500/10 px-1 py-0.5 text-[10px] font-semibold text-green-400">
              {asset.yield.toFixed(2)}% yield
            </span>
          )}
        </div>
      </div>

      {/* Meta badges */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={cn("text-[10px] font-medium", liquidityClass)}>
          {asset.liquidity}
        </span>
        <span className="text-[10px] text-muted-foreground">/</span>
        <span className={cn("text-[10px] font-medium", riskClass)}>
          {asset.riskLevel} risk
        </span>
        <span className="text-[10px] text-muted-foreground">/</span>
        <span className="text-[10px] text-muted-foreground">
          Min {fmtCurrency(asset.minimumInvestment)}
        </span>
        {holding > 0 && (
          <>
            <span className="text-[10px] text-muted-foreground">/</span>
            <span className="text-[10px] font-semibold text-[#2d9cdb]">
              Held {fmtCurrency(holding)}
            </span>
          </>
        )}
      </div>

      {/* Buy fractional row */}
      <div className="mt-2.5 flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">$</span>
        <input
          type="number"
          min={asset.minimumInvestment}
          step={10}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-7 w-20 rounded-md border border-border bg-background px-2 font-mono text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="button"
          disabled={!isValid}
          onClick={() => {
            if (isValid) {
              onBuy(asset, parsed);
              setAmount(String(asset.minimumInvestment));
            }
          }}
          className={cn(
            "h-7 rounded-md px-2.5 text-[10px] font-semibold transition-colors",
            isValid
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          Buy Fractional
        </button>

        {/* Educational note toggle */}
        <button
          type="button"
          aria-label="Toggle educational note"
          onClick={() => setShowNote((v) => !v)}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </div>

      {!isValid && parsed > 0 && (
        <p className="mt-1 text-[10px] text-red-400">
          Minimum investment is {fmtCurrency(asset.minimumInvestment)}
        </p>
      )}

      {/* Educational note */}
      <AnimatePresence>
        {showNote && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="mt-2 rounded-md border border-border/60 bg-muted/30 p-2 text-[10px] leading-relaxed text-muted-foreground">
              {asset.educationalNote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type CategoryFilter = "All" | AssetCategory;

const FILTER_LABELS: CategoryFilter[] = ["All", ...ASSET_CATEGORIES];

interface HoldingMap {
  [id: string]: number; // dollar value
}

export function TokenizedAssets() {
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const [holdings, setHoldings] = useState<HoldingMap>({});
  const [showSettlement, setShowSettlement] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? TOKENIZED_ASSETS
        : TOKENIZED_ASSETS.filter((a) => a.category === filter),
    [filter],
  );

  const totalInvested = useMemo(
    () => Object.values(holdings).reduce((s, v) => s + v, 0),
    [holdings],
  );

  const pieSlices: { label: string; value: number; color: string }[] = useMemo(() => {
    return Object.entries(holdings)
      .filter(([, v]) => v > 0)
      .map(([id, value], i) => {
        const asset = TOKENIZED_ASSETS.find((a) => a.id === id);
        return {
          label: asset?.name ?? id,
          value,
          color: PIE_COLORS[i % PIE_COLORS.length],
        };
      });
  }, [holdings]);

  function handleBuy(asset: TokenizedAsset, amount: number) {
    setHoldings((prev) => ({
      ...prev,
      [asset.id]: (prev[asset.id] ?? 0) + amount,
    }));
    setToast(`Purchased ${fmtCurrency(amount)} of ${asset.name}`);
    setTimeout(() => setToast(null), 2800);
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed right-4 top-16 z-50 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400 shadow-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portfolio summary + pie */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Summary */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Digital Asset Allocation
          </p>
          <p className="mt-1 font-mono text-xl tabular-nums font-bold">
            {fmtCurrency(totalInvested)}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {Object.keys(holdings).filter((k) => holdings[k] > 0).length} positions
          </p>

          {totalInvested > 0 ? (
            <div className="mt-4">
              <AllocationPie slices={pieSlices} />
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
              <p className="text-xs text-muted-foreground">No positions yet</p>
              <p className="text-[10px] text-muted-foreground">
                Buy fractional assets below to see your allocation
              </p>
            </div>
          )}
        </div>

        {/* Educational sidebar */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Why tokenization matters
          </p>
          <ul className="mt-3 space-y-3">
            {[
              {
                title: "Fractional ownership",
                body: "Blockchain tokens divide previously indivisible assets — a Manhattan office building or a barrel of oil — into $10 increments, democratizing access to asset classes historically reserved for institutions.",
              },
              {
                title: "Instant settlement",
                body: "Traditional securities clear in T+2 through layers of custodians and clearing houses. Smart contracts execute settlement atomically on-chain in seconds, eliminating counterparty credit risk during the settlement window.",
              },
              {
                title: "Programmable income",
                body: "Yield distributions, voting rights, and redemption rules are encoded directly in the token contract. Coupon payments can be streamed block-by-block rather than paid semi-annually.",
              },
            ].map((item, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2d9cdb]/15 text-[9px] font-bold text-[#2d9cdb]">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[11px] font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Settlement comparison */}
      <div className="rounded-lg border border-border bg-card">
        <button
          type="button"
          onClick={() => setShowSettlement((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-left"
        >
          <span className="text-xs font-semibold">Settlement Comparison</span>
          {showSettlement ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
        <AnimatePresence>
          {showSettlement && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border px-4 pb-4 pt-3">
                <SettlementTimeline />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {FILTER_LABELS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={cn(
              "h-7 shrink-0 rounded-md px-2.5 text-[11px] font-medium transition-colors",
              filter === cat
                ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            holding={holdings[asset.id] ?? 0}
            onBuy={handleBuy}
          />
        ))}
      </div>
    </div>
  );
}
