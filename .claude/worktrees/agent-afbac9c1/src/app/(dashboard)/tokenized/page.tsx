"use client";

import { useState, useMemo, useCallback } from "react";
import { Info, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TokenizedAssetCard,
  type TokenizedAsset,
  type AssetClass,
} from "@/components/tokenized/TokenizedAssetCard";
import { TokenPortfolio, type Holding } from "@/components/tokenized/TokenPortfolio";
import { YieldCalculator } from "@/components/tokenized/YieldCalculator";

// ── Asset data ────────────────────────────────────────────────────────────────

const ASSETS: TokenizedAsset[] = [
  // Real Estate
  {
    id: "rwa-re-us-office",
    name: "Manhattan Office Fund",
    ticker: "MOFF",
    assetClass: "real-estate",
    tokenPrice: 102.45,
    apyMin: 4,
    apyMax: 8,
    apy: 6.2,
    liquidityScore: 3,
    minInvestment: 500,
    description:
      "Fractional ownership in a portfolio of Class-A office towers in Midtown Manhattan. Income derives from long-term commercial leases; distributions paid quarterly in USDC.",
    sparklineSeed: 42,
  },
  {
    id: "rwa-re-residential",
    name: "Sun Belt Residential",
    ticker: "SBRT",
    assetClass: "real-estate",
    tokenPrice: 87.30,
    apyMin: 5,
    apyMax: 7,
    apy: 5.8,
    liquidityScore: 3,
    minInvestment: 250,
    description:
      "Diversified single-family rental portfolio across Texas, Florida, and Arizona. Benefiting from population migration trends. Monthly rental income distributed on-chain.",
    sparklineSeed: 137,
  },
  // T-Bills
  {
    id: "rwa-tbill-short",
    name: "Short-Term T-Bill Token",
    ticker: "TBST",
    assetClass: "t-bills",
    tokenPrice: 100.01,
    apyMin: 4.5,
    apyMax: 5.5,
    apy: 5.1,
    liquidityScore: 5,
    minInvestment: 100,
    description:
      "Tokenized 3-month US Treasury Bills, backed 1:1 by on-chain custodied T-bills. Daily accrual, redeemable T+1. Considered one of the safest RWA instruments available.",
    sparklineSeed: 201,
  },
  {
    id: "rwa-tbill-6m",
    name: "6-Month T-Bill Token",
    ticker: "TB6M",
    assetClass: "t-bills",
    tokenPrice: 100.03,
    apyMin: 4.8,
    apyMax: 5.5,
    apy: 5.3,
    liquidityScore: 5,
    minInvestment: 100,
    description:
      "Six-month US Treasury exposure as a fully-collateralized ERC-20 token. Yield accrues daily and is claimable at any time. Ideal as a cash management alternative.",
    sparklineSeed: 309,
  },
  // Corporate Bonds
  {
    id: "rwa-corp-ig",
    name: "Investment Grade Bond Pool",
    ticker: "IGBP",
    assetClass: "corporate-bonds",
    tokenPrice: 98.70,
    apyMin: 5,
    apyMax: 7,
    apy: 5.9,
    liquidityScore: 3,
    minInvestment: 500,
    description:
      "Basket of BBB+ and above rated USD corporate bonds from S&P 500 issuers. Managed duration of 3–5 years. Coupon payments distributed semi-annually.",
    sparklineSeed: 415,
  },
  {
    id: "rwa-corp-hy",
    name: "High Yield Bond Token",
    ticker: "HYBT",
    assetClass: "corporate-bonds",
    tokenPrice: 95.20,
    apyMin: 7,
    apyMax: 9,
    apy: 8.1,
    liquidityScore: 2,
    minInvestment: 1000,
    description:
      "Exposure to BB/B-rated US corporate bonds with higher yield profiles. Carries elevated credit risk but significant yield pickup over investment grade. Quarterly distributions.",
    sparklineSeed: 522,
  },
  // Commodities
  {
    id: "rwa-gold",
    name: "Tokenized Gold",
    ticker: "TGLD",
    assetClass: "commodities",
    tokenPrice: 312.88,
    apyMin: 0,
    apyMax: 0,
    apy: 0,
    liquidityScore: 4,
    minInvestment: 100,
    description:
      "Each token represents 0.1 troy ounce of LBMA-certified gold held in Swiss vaults. No yield — price tracks spot gold. Redeemable for physical gold in 100oz lots.",
    sparklineSeed: 631,
  },
  {
    id: "rwa-oil",
    name: "Tokenized Crude Oil",
    ticker: "TOIL",
    assetClass: "commodities",
    tokenPrice: 71.40,
    apyMin: 0,
    apyMax: 0,
    apy: 0,
    liquidityScore: 3,
    minInvestment: 250,
    description:
      "Price-tracking token for WTI crude oil, cash-settled monthly to spot price. Suitable for commodity exposure without futures roll costs. Higher volatility than other RWAs.",
    sparklineSeed: 744,
  },
  // Private Equity
  {
    id: "rwa-pe-venture",
    name: "Late-Stage Venture Fund",
    ticker: "LVPF",
    assetClass: "private-equity",
    isIlliquid: true,
    tokenPrice: 1250.00,
    apyMin: 15,
    apyMax: 35,
    apy: 22.5,
    liquidityScore: 1,
    minInvestment: 5000,
    description:
      "Tokenized LP interest in a basket of Series C–E venture investments. 5-year lock-up. Returns realized via IPO/M&A events. High risk, high potential return. Not redeemable before maturity.",
    sparklineSeed: 856,
  },
  {
    id: "rwa-pe-buyout",
    name: "Mid-Market Buyout Fund",
    ticker: "MMBF",
    assetClass: "private-equity",
    isIlliquid: true,
    tokenPrice: 880.50,
    apyMin: 12,
    apyMax: 20,
    apy: 16.0,
    liquidityScore: 1,
    minInvestment: 10000,
    description:
      "Fractional access to leveraged buyouts of US mid-market companies ($100M–$500M EV). 7-year fund life. Quarterly NAV updates. Distributions post-exit only.",
    sparklineSeed: 963,
  },
  // Infrastructure
  {
    id: "rwa-infra-solar",
    name: "Solar Revenue Token",
    ticker: "SLRT",
    assetClass: "infrastructure",
    tokenPrice: 50.15,
    apyMin: 6,
    apyMax: 8,
    apy: 7.2,
    liquidityScore: 3,
    minInvestment: 250,
    description:
      "Revenue share from a portfolio of utility-scale solar farms under 15-year PPAs. Yield backed by contracted cash flows. Low correlation to equity markets. Monthly distributions.",
    sparklineSeed: 1071,
  },
  {
    id: "rwa-infra-toll",
    name: "Toll Road Infrastructure",
    ticker: "TLRD",
    assetClass: "infrastructure",
    tokenPrice: 220.75,
    apyMin: 5,
    apyMax: 7,
    apy: 6.0,
    liquidityScore: 2,
    minInvestment: 500,
    description:
      "Tokenized revenue rights from concession-backed toll road assets in the Americas. Inflation-linked tolls provide natural hedge. Quarterly yield distributions on-chain.",
    sparklineSeed: 1188,
  },
];

// ── Filter types ──────────────────────────────────────────────────────────────

type FilterClass = AssetClass | "all";

const CLASS_FILTER_OPTIONS: { value: FilterClass; label: string }[] = [
  { value: "all", label: "All" },
  { value: "real-estate", label: "Real Estate" },
  { value: "t-bills", label: "T-Bills" },
  { value: "corporate-bonds", label: "Corp Bonds" },
  { value: "commodities", label: "Commodities" },
  { value: "private-equity", label: "Private Equity" },
  { value: "infrastructure", label: "Infrastructure" },
];

type SortKey = "apy-desc" | "apy-asc" | "price-asc" | "liquidity-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "apy-desc", label: "Highest APY" },
  { value: "apy-asc", label: "Lowest APY" },
  { value: "price-asc", label: "Lowest Price" },
  { value: "liquidity-desc", label: "Most Liquid" },
];

// ── Buy modal ─────────────────────────────────────────────────────────────────

function BuyModal({
  asset,
  cash,
  onConfirm,
  onCancel,
}: {
  asset: TokenizedAsset;
  cash: number;
  onConfirm: (tokens: number) => void;
  onCancel: () => void;
}) {
  const [tokens, setTokens] = useState(1);
  const cost = tokens * asset.tokenPrice;
  const annualYield = cost * (asset.apy / 100);

  const maxAffordable = Math.floor(cash / asset.tokenPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 space-y-4 shadow-xl">
        <div>
          <h3 className="text-sm font-semibold">Buy {asset.name}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {asset.ticker} · ${asset.tokenPrice.toFixed(2)} per token
          </p>
        </div>

        {/* Token amount */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">Tokens</span>
            <span className="text-xs font-bold tabular-nums font-mono">{tokens}</span>
          </div>
          <input
            type="range"
            min={1}
            max={Math.max(1, maxAffordable)}
            step={1}
            value={tokens}
            onChange={(e) => setTokens(Number(e.target.value))}
            className="w-full h-1.5 accent-primary cursor-pointer"
          />
          <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
            <span>1</span>
            <span>{maxAffordable} max</span>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Total Cost</span>
            <span className="font-mono tabular-nums font-semibold text-foreground">
              ${cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Available Cash</span>
            <span className="font-mono tabular-nums text-muted-foreground">
              ${cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          {asset.apy > 0 && (
            <div className="flex justify-between text-[11px] pt-1 border-t border-border/40">
              <span className="text-muted-foreground">Est. Annual Yield</span>
              <span className="font-mono tabular-nums text-green-400 font-semibold">
                +${annualYield.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Illiquid warning */}
        {asset.isIlliquid && (
          <div className="flex gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 p-2.5">
            <Info className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-300 leading-relaxed">
              This asset has a lock-up period and cannot be sold until maturity.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(tokens)}
            disabled={cost > cash || tokens < 1}
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            Confirm Purchase
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page tabs ─────────────────────────────────────────────────────────────────

type Tab = "marketplace" | "portfolio" | "calculator";

const TABS: { value: Tab; label: string }[] = [
  { value: "marketplace", label: "Marketplace" },
  { value: "portfolio", label: "My Portfolio" },
  { value: "calculator", label: "Yield Calculator" },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TokenizedPage() {
  const [tab, setTab] = useState<Tab>("marketplace");
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState<FilterClass>("all");
  const [sortKey, setSortKey] = useState<SortKey>("apy-desc");
  const [showSort, setShowSort] = useState(false);
  const [buyTarget, setBuyTarget] = useState<TokenizedAsset | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [cash, setCash] = useState(50000); // simulated cash balance

  const filteredAssets = useMemo(() => {
    let list = ASSETS.filter((a) => {
      if (filterClass !== "all" && a.assetClass !== filterClass) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) || a.ticker.toLowerCase().includes(q)
        );
      }
      return true;
    });

    list = list.slice().sort((a, b) => {
      switch (sortKey) {
        case "apy-desc":
          return b.apy - a.apy;
        case "apy-asc":
          return a.apy - b.apy;
        case "price-asc":
          return a.tokenPrice - b.tokenPrice;
        case "liquidity-desc":
          return b.liquidityScore - a.liquidityScore;
        default:
          return 0;
      }
    });

    return list;
  }, [filterClass, search, sortKey]);

  const getHolding = useCallback(
    (assetId: string) => holdings.find((h) => h.assetId === assetId)?.tokens ?? 0,
    [holdings],
  );

  const handleBuy = useCallback((asset: TokenizedAsset) => {
    setBuyTarget(asset);
  }, []);

  const handleConfirmBuy = useCallback(
    (tokens: number) => {
      if (!buyTarget) return;
      const cost = tokens * buyTarget.tokenPrice;
      if (cost > cash) return;
      setCash((c) => c - cost);
      setHoldings((prev) => {
        const existing = prev.find((h) => h.assetId === buyTarget.id);
        if (existing) {
          return prev.map((h) =>
            h.assetId === buyTarget.id
              ? { ...h, tokens: h.tokens + tokens }
              : h,
          );
        }
        return [...prev, { assetId: buyTarget.id, tokens }];
      });
      setBuyTarget(null);
    },
    [buyTarget, cash],
  );

  const handleSell = useCallback(
    (assetId: string) => {
      const holding = holdings.find((h) => h.assetId === assetId);
      if (!holding) return;
      const asset = ASSETS.find((a) => a.id === assetId);
      if (!asset || asset.isIlliquid) return;
      const proceeds = holding.tokens * asset.tokenPrice;
      setCash((c) => c + proceeds);
      setHoldings((prev) => prev.filter((h) => h.assetId !== assetId));
    },
    [holdings],
  );

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Tokenized Assets</h1>
          <p className="text-xs text-muted-foreground">
            Real World Assets (RWA) — simulated fractional ownership on-chain
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>Sim Cash:</span>
          <span className="font-mono tabular-nums font-semibold text-foreground">
            ${cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Educational callout */}
      <div className="flex gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[11px] text-foreground/70 leading-relaxed">
          <span className="font-semibold text-primary">What are RWA Tokens?</span>{" "}
          RWA tokens represent fractional ownership in real-world assets — real estate,
          treasuries, private credit, commodities, and infrastructure — brought on-chain
          as ERC-20 tokens. This enables 24/7 trading, programmable yield distribution,
          and access to previously illiquid asset classes starting from as little as $100.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto whitespace-nowrap">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors -mb-px shrink-0",
              tab === t.value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Marketplace tab ── */}
      {tab === "marketplace" && (
        <div className="flex flex-col gap-4">
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search assets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-card pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Class filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {CLASS_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterClass(opt.value)}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors",
                    filterClass === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSort((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <SlidersHorizontal className="h-3 w-3" />
                {SORT_OPTIONS.find((s) => s.value === sortKey)?.label}
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 z-20 rounded-lg border border-border bg-card shadow-lg py-1 min-w-[140px]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortKey(opt.value);
                        setShowSort(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-[10px] transition-colors",
                        sortKey === opt.value
                          ? "text-foreground bg-muted/50"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Asset grid */}
          {filteredAssets.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              No assets match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredAssets.map((asset) => (
                <TokenizedAssetCard
                  key={asset.id}
                  asset={asset}
                  holding={getHolding(asset.id)}
                  onBuy={handleBuy}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Portfolio tab ── */}
      {tab === "portfolio" && (
        <TokenPortfolio
          assets={ASSETS}
          holdings={holdings}
          onSell={handleSell}
        />
      )}

      {/* ── Calculator tab ── */}
      {tab === "calculator" && <YieldCalculator />}

      {/* Buy modal */}
      {buyTarget && (
        <BuyModal
          asset={buyTarget}
          cash={cash}
          onConfirm={handleConfirmBuy}
          onCancel={() => setBuyTarget(null)}
        />
      )}
    </div>
  );
}
