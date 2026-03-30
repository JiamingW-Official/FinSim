"use client";

import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { FUNDAMENTALS } from "@/data/fundamentals";
import { MetricTooltip } from "@/components/education/MetricTooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Zap } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

function pctColor(n: number): string {
  if (n > 0) return "text-emerald-400";
  if (n < 0) return "text-red-400";
  return "text-muted-foreground";
}

function ratingColor(r: string): string {
  if (r === "Strong Buy") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (r === "Buy") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (r === "Hold") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (r === "Sell") return "bg-red-500/10 text-red-400 border-red-500/20";
  if (r === "Strong Sell") return "bg-red-500/20 text-red-400 border-red-500/30";
  return "bg-muted/30 text-muted-foreground border-border";
}

function earningsColor(r: string): string {
  if (r === "beat") return "bg-emerald-500/15 text-emerald-400";
  if (r === "miss") return "bg-red-500/15 text-red-400";
  return "bg-amber-500/15 text-amber-400";
}

// marketCap is already a formatted string like "$3.4T"
function formatMktCap(s: string): string {
  return s;
}

// ── Compact metric cell (3-col grid) ─────────────────────────────────────────

function MetricCell({
  label,
  value,
  valueClass,
  metric,
}: {
  label: string;
  value: string;
  valueClass?: string;
  metric?: string;
}) {
  return (
    <div className="flex flex-col px-2 py-1.5 border-b border-r border-border/15 last:border-r-0">
      <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/30 leading-none mb-0.5">
        {metric ? (
          <MetricTooltip metric={metric}>{label}</MetricTooltip>
        ) : (
          label
        )}
      </span>
      <span className={cn("text-[11px] font-mono tabular-nums text-foreground/75 leading-none", valueClass)}>
        {value}
      </span>
    </div>
  );
}

// Compact % bar
function MiniBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(Math.max(value, 0), max);
  return (
    <div className="h-0.5 mt-0.5 rounded-full bg-muted/40 overflow-hidden">
      <div
        className={cn("h-0.5 rounded-full", color)}
        style={{ width: `${(pct / max) * 100}%` }}
      />
    </div>
  );
}

// Compact 52-week range bar
function RangeBar({
  current,
  low,
  high,
}: {
  current: number;
  low: number;
  high: number;
}) {
  const range = high - low;
  const pos = range > 0 ? ((current - low) / range) * 100 : 50;
  return (
    <div className="px-2 py-1.5 border-b border-border/15">
      <div className="flex items-center justify-between text-[8px] font-mono text-muted-foreground/30 mb-1">
        <span>52W L ${fmt(low, 0)}</span>
        <span className="text-foreground/70 tabular-nums">${fmt(current, 2)}</span>
        <span>52W H ${fmt(high, 0)}</span>
      </div>
      <div className="relative h-0.5 rounded-full bg-muted/40">
        <div
          className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-background bg-primary shadow-sm"
          style={{ left: `${pos}%` }}
        />
      </div>
    </div>
  );
}

// Inner tab trigger class — consistent across all 4 tabs
const innerTabCls =
  "text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-none " +
  "border-b-2 border-transparent data-[state=active]:border-primary/60 " +
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
  "data-[state=active]:text-foreground/80 data-[state=inactive]:text-muted-foreground/30 " +
  "transition-colors duration-150";

// ── Main Panel ────────────────────────────────────────────────────────────────

export function FundamentalsPanel() {
  const currentTicker = useChartStore((s) => s.currentTicker);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const data = FUNDAMENTALS[currentTicker];

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        No fundamental data for {currentTicker}
      </div>
    );
  }

  const currentPrice = allData[revealedCount - 1]?.close ?? 0;
  const targetUpside =
    currentPrice > 0 && data.priceTarget > 0
      ? Math.round((data.priceTarget / currentPrice - 1) * 100)
      : null;
  const pePremium =
    data.sectorAvgPE > 0
      ? Math.round(((data.peRatio - data.sectorAvgPE) / data.sectorAvgPE) * 100)
      : 0;
  const isETF = data.sector === "ETF";

  return (
    <div className="flex h-full flex-col">
      {/* ── Header row ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 shrink-0">
        <div>
          <span className="text-[12px] font-semibold">{currentTicker}</span>
          <span className="text-[10px] font-mono text-muted-foreground/40 ml-2">{data.sector}</span>
        </div>
        <div className="flex items-center gap-3">
          {!isETF && (
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-mono text-muted-foreground/30 uppercase">P/E</span>
              <span className="text-[11px] font-mono text-foreground/70">{data.peRatio > 0 ? data.peRatio.toFixed(1) : "—"}</span>
            </div>
          )}
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-muted-foreground/30 uppercase">Mkt Cap</span>
            <span className="text-[11px] font-mono text-foreground/70">{formatMktCap(data.marketCap)}</span>
          </div>
        </div>
      </div>

      {/* ── Inner tabs ── */}
      <Tabs defaultValue="overview" className="flex flex-1 flex-col overflow-hidden min-h-0">
        {/* Tab strip — horizontally scrollable */}
        <TabsList className="h-auto w-full justify-start rounded-none border-b border-border/20 bg-transparent px-0 shrink-0 overflow-x-auto gap-0 flex-nowrap">
          {(["overview", "valuation", "financials", "catalyst"] as const).map((tab) => (
            <TabsTrigger key={tab} value={tab} className={innerTabCls}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── OVERVIEW TAB ── */}
        <TabsContent value="overview" className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden">
          {/* 3-column metric grid */}
          <div className="grid grid-cols-3">
            <MetricCell
              label="Beta"
              metric="beta"
              value={fmt(data.beta, 2)}
              valueClass={data.beta > 1.5 ? "text-amber-400" : undefined}
            />
            <MetricCell
              label="Avg Vol"
              value={data.avgVolume}
            />
            <MetricCell
              label="Div Yield"
              metric="dividendYield"
              value={data.dividendYield > 0 ? `${fmt(data.dividendYield, 2)}%` : "N/A"}
              valueClass={data.dividendYield > 0 ? "text-emerald-400" : "text-muted-foreground/50"}
            />
            <MetricCell
              label="Short Float"
              metric="shortFloat"
              value={`${fmt(data.shortFloat, 1)}%`}
              valueClass={data.shortFloat > 15 ? "text-red-400" : data.shortFloat > 5 ? "text-amber-400" : undefined}
            />
            {!isETF ? (
              <MetricCell
                label="Rating"
                value={data.analystRating}
                valueClass={
                  data.analystRating === "Strong Buy" || data.analystRating === "Buy"
                    ? "text-emerald-400"
                    : data.analystRating === "Sell" || data.analystRating === "Strong Sell"
                    ? "text-red-400"
                    : "text-amber-400"
                }
              />
            ) : (
              <MetricCell label="Type" value="Index ETF" />
            )}
            {!isETF && targetUpside != null ? (
              <MetricCell
                label="PT Upside"
                value={`${targetUpside > 0 ? "+" : ""}${targetUpside}%`}
                valueClass={pctColor(targetUpside)}
              />
            ) : (
              <MetricCell label="Industry" value={data.industry} />
            )}
          </div>

          {/* 52-week range */}
          {currentPrice > 0 && (
            <RangeBar current={currentPrice} low={data.week52Low} high={data.week52High} />
          )}

          {/* AlphaBot insight + description */}
          <div className="px-2 py-1">
            {!isETF && (
              <p className="text-[9px] font-mono italic text-muted-foreground/40 leading-snug mb-1 border border-border/20 rounded px-1.5 py-1">
                {data.analystRating} · {data.analystCount} analysts
                {targetUpside != null ? ` · PT $${data.priceTarget} (${targetUpside > 0 ? "+" : ""}${targetUpside}%)` : ""}
                {pePremium !== 0 ? ` · ${pePremium > 0 ? "+" : ""}${pePremium}% vs sector P/E` : ""}
              </p>
            )}
            <p className="text-[9px] text-muted-foreground/35 leading-snug line-clamp-2">
              {data.description}
            </p>
          </div>
        </TabsContent>

        {/* ── VALUATION TAB ── */}
        <TabsContent value="valuation" className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden">
          <div className="grid grid-cols-2">
            <MetricCell
              label="P/E"
              metric="peRatio"
              value={data.peRatio > 0 ? `${fmt(data.peRatio)}×` : "N/A"}
              valueClass={
                data.peRatio > 0 && data.sectorAvgPE > 0
                  ? pePremium > 25
                    ? "text-red-400"
                    : pePremium < -15
                    ? "text-emerald-400"
                    : "text-amber-400"
                  : undefined
              }
            />
            <MetricCell
              label="Fwd P/E"
              metric="forwardPE"
              value={data.forwardPE > 0 ? `${fmt(data.forwardPE)}×` : "N/A"}
            />
            <MetricCell
              label="P/B"
              metric="pbRatio"
              value={data.pbRatio > 0 ? `${fmt(data.pbRatio)}×` : "N/A"}
            />
            <MetricCell
              label="P/S"
              metric="psRatio"
              value={data.psRatio > 0 ? `${fmt(data.psRatio)}×` : "N/A"}
            />
            <MetricCell
              label="EV/EBITDA"
              metric="evEbitda"
              value={data.evEbitda > 0 ? `${fmt(data.evEbitda)}×` : "N/A"}
            />
            <MetricCell
              label="PEG"
              value={data.pegRatio > 0 ? fmt(data.pegRatio, 2) : "N/A"}
              valueClass={
                data.pegRatio > 0
                  ? data.pegRatio < 1
                    ? "text-emerald-400"
                    : data.pegRatio > 2
                    ? "text-red-400"
                    : undefined
                  : undefined
              }
            />
            <MetricCell
              label="Sector P/E"
              value={data.sectorAvgPE > 0 ? `${fmt(data.sectorAvgPE)}×` : "N/A"}
              valueClass="text-muted-foreground/50"
            />
            {!isETF && data.sectorAvgPE > 0 ? (
              <MetricCell
                label="vs Sector"
                value={`${pePremium > 0 ? "+" : ""}${pePremium}%`}
                valueClass={
                  pePremium > 25
                    ? "text-red-400"
                    : pePremium < -15
                    ? "text-emerald-400"
                    : "text-amber-400"
                }
              />
            ) : (
              <MetricCell label="—" value="—" />
            )}
            {!isETF && data.evToRevenue > 0 && (
              <>
                <MetricCell label="EV/Rev" value={`${fmt(data.evToRevenue)}×`} />
                <MetricCell label="P/FCF" value={data.priceToFCF > 0 ? `${fmt(data.priceToFCF)}×` : "N/A"} />
              </>
            )}
            {!isETF && (
              <>
                <MetricCell
                  label="Buyback Yield"
                  value={data.buybackYield > 0 ? `${fmt(data.buybackYield, 2)}%` : "N/A"}
                  valueClass={data.buybackYield > 2 ? "text-emerald-400" : undefined}
                />
                <MetricCell
                  label="Total Yield"
                  value={data.totalYield > 0 ? `${fmt(data.totalYield, 2)}%` : "N/A"}
                  valueClass={data.totalYield > 3 ? "text-emerald-400" : undefined}
                />
              </>
            )}
          </div>
        </TabsContent>

        {/* ── FINANCIALS TAB ── */}
        <TabsContent value="financials" className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden">
          {!isETF ? (
            <>
              {/* Growth + Margins side by side */}
              <div className="grid grid-cols-2 gap-x-3 px-2 pt-1.5 mb-1">
                {/* Left: Growth */}
                <div className="space-y-[3px]">
                  <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 pb-0.5 border-b border-border/20">Growth</div>
                  {(
                    [
                      { label: "Rev YoY", value: data.revenueGrowthYoY, metric: "revenueGrowthYoY" },
                      { label: "EPS YoY", value: data.epsGrowthYoY, metric: "epsGrowthYoY" },
                      { label: "Rev 3Y", value: data.revenueGrowth3Y },
                      { label: "FCF Growth", value: data.fcfGrowth },
                    ] as Array<{ label: string; value: number; metric?: string }>
                  ).map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-muted-foreground/35">{label}</span>
                        <span className={cn("text-[10px] font-mono font-medium tabular-nums", pctColor(value))}>
                          {value > 0 ? "+" : ""}{fmt(value)}%
                        </span>
                      </div>
                      <MiniBar value={Math.abs(value)} max={50} color={value >= 0 ? "bg-emerald-500" : "bg-red-500"} />
                    </div>
                  ))}
                </div>

                {/* Right: Margins */}
                <div className="space-y-[3px]">
                  <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 pb-0.5 border-b border-border/20">Margins</div>
                  {(
                    [
                      { label: "Gross", value: data.grossMargin, metric: "grossMargin" },
                      { label: "EBITDA", value: data.ebitdaMargin },
                      { label: "Operating", value: data.operatingMargin, metric: "operatingMargin" },
                      { label: "Net", value: data.netMargin, metric: "netMargin" },
                    ] as Array<{ label: string; value: number; metric?: string }>
                  ).map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-muted-foreground/35">{label}</span>
                        <span className={cn("text-[10px] font-mono font-medium tabular-nums",
                          value > 40 ? "text-emerald-400" : value > 15 ? "text-amber-400" : value > 0 ? "text-foreground/70" : "text-red-400"
                        )}>
                          {fmt(value)}%
                        </span>
                      </div>
                      <MiniBar
                        value={value}
                        max={80}
                        color={value > 40 ? "bg-emerald-500" : value > 15 ? "bg-amber-500" : "bg-red-500"}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Balance Sheet — 3-col MetricCell grid */}
              <div className="px-0 pt-0.5">
                <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 px-2 pb-0.5 border-b border-border/20">Balance Sheet</div>
                <div className="grid grid-cols-3">
                  <MetricCell
                    label="ROE"
                    metric="roe"
                    value={`${fmt(data.roe)}%`}
                    valueClass={data.roe > 20 ? "text-emerald-400" : data.roe > 10 ? "text-amber-400" : "text-red-400"}
                  />
                  <MetricCell
                    label="D/E"
                    metric="debtToEquity"
                    value={data.debtToEquity > 0 ? fmt(data.debtToEquity, 2) : "N/A"}
                    valueClass={data.debtToEquity > 2 ? "text-red-400" : data.debtToEquity < 0.5 ? "text-emerald-400" : "text-amber-400"}
                  />
                  <MetricCell
                    label="Current"
                    metric="currentRatio"
                    value={data.currentRatio > 0 ? fmt(data.currentRatio, 2) : "N/A"}
                    valueClass={data.currentRatio < 1 ? "text-red-400" : data.currentRatio > 1.5 ? "text-emerald-400" : "text-amber-400"}
                  />
                  <MetricCell
                    label="FCF"
                    value={data.freeCashFlow || "N/A"}
                    valueClass="text-emerald-400"
                  />
                  <MetricCell
                    label="Net Cash"
                    value={data.netCash !== undefined ? `${data.netCash >= 0 ? "+" : ""}$${fmt(Math.abs(data.netCash), 1)}B` : "N/A"}
                    valueClass={data.netCash >= 0 ? "text-emerald-400" : "text-red-400"}
                  />
                  <MetricCell
                    label="Inst. Own"
                    value={`${fmt(data.institutionalOwnership, 0)}%`}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-[9px] font-mono text-muted-foreground/30">
              ETF — aggregate financials not applicable
            </div>
          )}
        </TabsContent>

        {/* ── CATALYST TAB ── */}
        <TabsContent value="catalyst" className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden">
          {isETF ? (
            <div className="flex h-full items-center justify-center text-[9px] font-mono text-muted-foreground/30">
              ETFs track underlying indices — no individual earnings catalysts
            </div>
          ) : (
            <div className="px-2 pt-1.5 space-y-1">
              {/* Earnings row */}
              <div className="grid grid-cols-2 gap-x-3">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 mb-0.5">Next Earnings</div>
                  <span className="text-[10px] font-mono text-primary">{data.nextEarningsDate}</span>
                </div>
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 mb-0.5">Last Result</div>
                  <span className={cn("inline-flex items-center gap-0.5 w-fit rounded px-1 py-0 text-[9px] font-mono font-medium leading-tight", earningsColor(data.lastEarningsResult))}>
                    {data.lastEarningsResult === "beat" ? (
                      <TrendingUp className="h-2 w-2 shrink-0" />
                    ) : data.lastEarningsResult === "miss" ? (
                      <TrendingDown className="h-2 w-2 shrink-0" />
                    ) : (
                      <Minus className="h-2 w-2 shrink-0" />
                    )}
                    {data.lastEarningsResult === "beat"
                      ? `Beat +${fmt(data.earningsSurprisePct, 1)}%`
                      : data.lastEarningsResult === "miss"
                      ? `Miss ${fmt(data.earningsSurprisePct, 1)}%`
                      : "In-Line"}
                  </span>
                </div>
              </div>

              {/* Short interest — compact 3-col metric grid */}
              <div className="grid grid-cols-3 border border-border/15 rounded overflow-hidden mt-0.5">
                <div className="flex flex-col px-2 py-1.5 border-r border-border/15">
                  <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 leading-none mb-0.5">Short %</span>
                  <span className={cn("text-[11px] font-mono tabular-nums leading-none",
                    data.shortFloat > 15 ? "text-red-400" : data.shortFloat > 5 ? "text-amber-400" : "text-foreground/70"
                  )}>
                    {fmt(data.shortFloat, 1)}%
                  </span>
                </div>
                <div className="flex flex-col px-2 py-1.5 border-r border-border/15">
                  <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 leading-none mb-0.5">Squeeze</span>
                  <span className={cn("text-[11px] font-mono leading-none",
                    data.shortFloat > 15 ? "text-red-400" : data.shortFloat > 5 ? "text-amber-400" : "text-muted-foreground/30"
                  )}>
                    {data.shortFloat > 15 ? "High" : data.shortFloat > 5 ? "Mod" : "Low"}
                  </span>
                </div>
                <div className="flex flex-col px-2 py-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 leading-none mb-0.5">Insider</span>
                  <span className={cn("text-[10px] font-mono leading-none",
                    data.insiderTransactions === "Net Buying" ? "text-emerald-400" :
                    data.insiderTransactions === "Net Selling" ? "text-red-400" :
                    "text-muted-foreground/40"
                  )}>
                    {data.insiderTransactions === "Net Buying" ? "Buying" :
                     data.insiderTransactions === "Net Selling" ? "Selling" : "Neutral"}
                  </span>
                </div>
              </div>

              {/* Bull / Bear catalysts + risks */}
              {(data.catalysts.length > 0 || data.risks.length > 0) && (
                <div className="grid grid-cols-2 gap-x-3 pt-0.5">
                  <div className="space-y-[3px]">
                    <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 pb-0.5 border-b border-border/20">Catalysts</div>
                    {data.catalysts.map((c, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <Zap className="mt-0.5 h-2 w-2 shrink-0 text-emerald-400" />
                        <span className="text-[9px] font-mono leading-snug text-muted-foreground/40">{c}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-[3px]">
                    <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 pb-0.5 border-b border-border/20">Risks</div>
                    {data.risks.map((r, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <AlertTriangle className="mt-0.5 h-2 w-2 shrink-0 text-amber-400" />
                        <span className="text-[9px] font-mono leading-snug text-muted-foreground/40">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
