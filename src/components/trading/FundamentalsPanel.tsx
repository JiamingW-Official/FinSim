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

// ── Compact 2-column cell ─────────────────────────────────────────────────────

function Cell({
  label,
  metric,
  value,
  valueClass,
}: {
  label: string;
  metric?: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] text-muted-foreground truncate leading-none">
        {metric ? (
          <MetricTooltip metric={metric}>{label}</MetricTooltip>
        ) : (
          label
        )}
      </span>
      <span className={cn("text-[11px] font-mono tabular-nums font-medium leading-none truncate", valueClass ?? "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

// Two cells side-by-side filling a row
function GridRow({
  left,
  right,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-3 py-[3px] border-b border-border/40 last:border-0">
      {left}
      {right ?? <div />}
    </div>
  );
}

// Compact % bar (no label — caller provides label above via Cell)
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
    <div className="py-[3px] border-b border-border/40">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
        <span>52W L ${fmt(low, 0)}</span>
        <span className="text-foreground font-mono font-medium">${fmt(current, 2)}</span>
        <span>52W H ${fmt(high, 0)}</span>
      </div>
      <div className="relative h-1 rounded-full bg-muted/40">
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-background bg-primary shadow-sm"
          style={{ left: `${pos}%` }}
        />
      </div>
    </div>
  );
}

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

  const fundamentalInsight = (() => {
    if (isETF)
      return `${currentTicker} tracks a broad index — fundamentals are aggregate figures.`;
    const valuation =
      pePremium > 25
        ? `${pePremium}% premium to sector P/E`
        : pePremium < -15
        ? `${Math.abs(pePremium)}% discount to sector P/E`
        : `near sector avg P/E`;
    const earnStr =
      data.lastEarningsResult === "beat"
        ? `beat est. +${data.earningsSurprisePct}%`
        : data.lastEarningsResult === "miss"
        ? `missed ${data.earningsSurprisePct}%`
        : `met estimates`;
    return `${currentTicker}: ${valuation}; ${data.analystRating} (${data.analystCount}a${targetUpside != null ? `, PT $${data.priceTarget} ${targetUpside > 0 ? "+" : ""}${targetUpside}%` : ""}); last qtr ${earnStr}.`;
  })();

  return (
    <Tabs defaultValue="overview" className="flex h-full flex-col">
      {/* Tab strip */}
      <TabsList className="h-6 w-full justify-start rounded-none border-b border-border bg-transparent px-1 shrink-0 gap-0">
        {(["overview", "valuation", "financials", "catalyst"] as const).map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="h-5 rounded-none border-b-2 border-transparent px-2 text-[10px] uppercase tracking-wide capitalize data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground"
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* ── OVERVIEW TAB ── */}
      <TabsContent value="overview" className="flex-1 overflow-auto mt-0 p-2 space-y-0 data-[state=inactive]:hidden">
        {/* Header row */}
        <div className="flex items-start justify-between pb-[3px] border-b border-border/40 mb-0">
          <div className="min-w-0">
            <span className="text-[12px] font-semibold text-foreground leading-none">{currentTicker}</span>
            <span className="text-[10px] text-muted-foreground ml-1.5">{data.industry}</span>
          </div>
          <div className="text-right shrink-0 ml-2">
            <span className="text-[10px] text-muted-foreground">{data.sector}</span>
            <span className="text-[11px] font-mono font-semibold text-foreground ml-1.5">{data.marketCap}</span>
          </div>
        </div>

        {/* Key stats 2-col grid */}
        <GridRow
          left={<Cell label="Beta" metric="beta" value={fmt(data.beta, 2)} valueClass={data.beta > 1.5 ? "text-amber-400" : "text-foreground"} />}
          right={<Cell label="Avg Vol" value={data.avgVolume} />}
        />
        <GridRow
          left={<Cell label="Short Float" metric="shortFloat" value={`${fmt(data.shortFloat, 1)}%`} valueClass={data.shortFloat > 15 ? "text-red-400" : data.shortFloat > 5 ? "text-amber-400" : "text-foreground"} />}
          right={<Cell label="Div Yield" metric="dividendYield" value={data.dividendYield > 0 ? `${fmt(data.dividendYield, 2)}%` : "N/A"} valueClass={data.dividendYield > 0 ? "text-emerald-400" : "text-muted-foreground"} />}
        />

        {/* 52-week range */}
        {currentPrice > 0 && (
          <RangeBar current={currentPrice} low={data.week52Low} high={data.week52High} />
        )}

        {/* Analyst row */}
        {!isETF && (
          <div className="grid grid-cols-2 gap-x-3 py-[3px] border-b border-border/40">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] text-muted-foreground leading-none">Rating</span>
              <span className={cn("inline-flex w-fit items-center rounded border px-1 py-0 text-[10px] font-medium leading-tight mt-0.5", ratingColor(data.analystRating))}>
                {data.analystRating}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] text-muted-foreground leading-none">
                PT ({data.analystCount}a)
              </span>
              {targetUpside != null ? (
                <span className={cn("text-[11px] font-mono tabular-nums font-medium leading-none", pctColor(targetUpside))}>
                  ${data.priceTarget} ({targetUpside > 0 ? "+" : ""}{targetUpside}%)
                </span>
              ) : (
                <span className="text-[11px] font-mono text-muted-foreground leading-none">N/A</span>
              )}
            </div>
          </div>
        )}

        {/* AlphaBot insight */}
        <p className="text-[10px] italic text-muted-foreground leading-snug pt-1">
          {fundamentalInsight}
        </p>

        {/* Description */}
        <p className="text-[10px] text-muted-foreground leading-snug pt-0.5 line-clamp-2">
          {data.description}
        </p>
      </TabsContent>

      {/* ── VALUATION TAB ── */}
      <TabsContent value="valuation" className="flex-1 overflow-auto mt-0 p-2 data-[state=inactive]:hidden">
        <GridRow
          left={
            <Cell
              label="P/E"
              metric="peRatio"
              value={data.peRatio > 0 ? `${fmt(data.peRatio)}×` : "N/A"}
              valueClass={data.peRatio > 0 && data.sectorAvgPE > 0 ? (pePremium > 25 ? "text-red-400" : pePremium < -15 ? "text-emerald-400" : "text-amber-400") : "text-foreground"}
            />
          }
          right={
            <Cell
              label="Fwd P/E"
              metric="forwardPE"
              value={data.forwardPE > 0 ? `${fmt(data.forwardPE)}×` : "N/A"}
            />
          }
        />
        <GridRow
          left={<Cell label="P/B" metric="pbRatio" value={data.pbRatio > 0 ? `${fmt(data.pbRatio)}×` : "N/A"} />}
          right={<Cell label="P/S" metric="psRatio" value={data.psRatio > 0 ? `${fmt(data.psRatio)}×` : "N/A"} />}
        />
        <GridRow
          left={<Cell label="EV/EBITDA" metric="evEbitda" value={data.evEbitda > 0 ? `${fmt(data.evEbitda)}×` : "N/A"} />}
          right={<Cell label="PEG" value={data.pegRatio > 0 ? fmt(data.pegRatio, 2) : "N/A"} valueClass={data.pegRatio > 0 && data.pegRatio < 1 ? "text-emerald-400" : data.pegRatio > 2 ? "text-red-400" : "text-foreground"} />}
        />
        <GridRow
          left={<Cell label="Sector P/E" value={data.sectorAvgPE > 0 ? `${fmt(data.sectorAvgPE)}×` : "N/A"} valueClass="text-muted-foreground" />}
          right={
            !isETF && data.sectorAvgPE > 0 ? (
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] text-muted-foreground leading-none">vs Sector</span>
                <span className={cn("text-[10px] font-medium leading-none rounded px-1 py-0 w-fit",
                  pePremium > 25 ? "bg-red-500/15 text-red-400" :
                  pePremium < -15 ? "bg-emerald-500/15 text-emerald-400" :
                  "bg-amber-500/15 text-amber-400"
                )}>
                  {pePremium > 0 ? "+" : ""}{pePremium}% {pePremium > 10 ? "premium" : pePremium < -10 ? "discount" : "fair"}
                </span>
              </div>
            ) : <div />
          }
        />
        {!isETF && data.evToRevenue > 0 && (
          <GridRow
            left={<Cell label="EV/Rev" value={`${fmt(data.evToRevenue)}×`} />}
            right={<Cell label="P/FCF" value={data.priceToFCF > 0 ? `${fmt(data.priceToFCF)}×` : "N/A"} />}
          />
        )}
        {!isETF && (
          <GridRow
            left={<Cell label="Buyback Yield" value={data.buybackYield > 0 ? `${fmt(data.buybackYield, 2)}%` : "N/A"} valueClass={data.buybackYield > 2 ? "text-emerald-400" : "text-foreground"} />}
            right={<Cell label="Total Yield" value={data.totalYield > 0 ? `${fmt(data.totalYield, 2)}%` : "N/A"} valueClass={data.totalYield > 3 ? "text-emerald-400" : "text-foreground"} />}
          />
        )}
      </TabsContent>

      {/* ── FINANCIALS TAB ── */}
      <TabsContent value="financials" className="flex-1 overflow-auto mt-0 p-2 data-[state=inactive]:hidden">
        {!isETF ? (
          <>
            {/* Growth + Margins side by side */}
            <div className="grid grid-cols-2 gap-x-3 mb-1">
              {/* Left: Growth */}
              <div className="space-y-[3px]">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium pb-0.5 border-b border-border/40">Growth</div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">Rev YoY</span>
                    <span className={cn("text-[11px] font-mono font-medium tabular-nums", pctColor(data.revenueGrowthYoY))}>
                      {data.revenueGrowthYoY > 0 ? "+" : ""}{fmt(data.revenueGrowthYoY)}%
                    </span>
                  </div>
                  <MiniBar value={Math.abs(data.revenueGrowthYoY)} max={50} color={data.revenueGrowthYoY >= 0 ? "bg-emerald-500" : "bg-red-500"} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">EPS YoY</span>
                    <span className={cn("text-[11px] font-mono font-medium tabular-nums", pctColor(data.epsGrowthYoY))}>
                      {data.epsGrowthYoY > 0 ? "+" : ""}{fmt(data.epsGrowthYoY)}%
                    </span>
                  </div>
                  <MiniBar value={Math.abs(data.epsGrowthYoY)} max={50} color={data.epsGrowthYoY >= 0 ? "bg-emerald-500" : "bg-red-500"} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">Rev 3Y</span>
                    <span className={cn("text-[11px] font-mono font-medium tabular-nums", pctColor(data.revenueGrowth3Y))}>
                      {data.revenueGrowth3Y > 0 ? "+" : ""}{fmt(data.revenueGrowth3Y)}%
                    </span>
                  </div>
                  <MiniBar value={Math.abs(data.revenueGrowth3Y)} max={50} color={data.revenueGrowth3Y >= 0 ? "bg-emerald-500" : "bg-red-500"} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">FCF Growth</span>
                    <span className={cn("text-[11px] font-mono font-medium tabular-nums", pctColor(data.fcfGrowth))}>
                      {data.fcfGrowth > 0 ? "+" : ""}{fmt(data.fcfGrowth)}%
                    </span>
                  </div>
                  <MiniBar value={Math.abs(data.fcfGrowth)} max={50} color={data.fcfGrowth >= 0 ? "bg-emerald-500" : "bg-red-500"} />
                </div>
              </div>

              {/* Right: Margins */}
              <div className="space-y-[3px]">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium pb-0.5 border-b border-border/40">Margins</div>
                {(
                  [
                    { label: "Gross", value: data.grossMargin, metric: "grossMargin" },
                    { label: "EBITDA", value: data.ebitdaMargin },
                    { label: "Operating", value: data.operatingMargin, metric: "operatingMargin" },
                    { label: "Net", value: data.netMargin, metric: "netMargin" },
                  ] as Array<{ label: string; value: number; metric?: string }>
                ).map(({ label, value, metric }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground">
                        {metric ? (
                          <MetricTooltip metric={metric}>{label}</MetricTooltip>
                        ) : (
                          label
                        )}
                      </span>
                      <span className={cn("text-[11px] font-mono font-medium tabular-nums",
                        value > 40 ? "text-emerald-400" : value > 15 ? "text-amber-400" : value > 0 ? "text-foreground" : "text-red-400"
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

            {/* Balance Sheet 2-col grid */}
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium pt-1 pb-0.5 border-b border-border/40">Balance Sheet</div>
            <GridRow
              left={<Cell label="ROE" metric="roe" value={`${fmt(data.roe)}%`} valueClass={data.roe > 20 ? "text-emerald-400" : data.roe > 10 ? "text-amber-400" : "text-red-400"} />}
              right={<Cell label="D/E" metric="debtToEquity" value={data.debtToEquity > 0 ? fmt(data.debtToEquity, 2) : "N/A"} valueClass={data.debtToEquity > 2 ? "text-red-400" : data.debtToEquity < 0.5 ? "text-emerald-400" : "text-amber-400"} />}
            />
            <GridRow
              left={<Cell label="Current Ratio" metric="currentRatio" value={data.currentRatio > 0 ? fmt(data.currentRatio, 2) : "N/A"} valueClass={data.currentRatio < 1 ? "text-red-400" : data.currentRatio > 1.5 ? "text-emerald-400" : "text-amber-400"} />}
              right={<Cell label="Quick Ratio" value={data.quickRatio > 0 ? fmt(data.quickRatio, 2) : "N/A"} valueClass={data.quickRatio < 1 ? "text-red-400" : "text-foreground"} />}
            />
            <GridRow
              left={<Cell label="Free Cash Flow" value={data.freeCashFlow || "N/A"} valueClass="text-emerald-400" />}
              right={<Cell label="Net Cash" value={data.netCash !== undefined ? `${data.netCash >= 0 ? "+" : ""}$${fmt(Math.abs(data.netCash), 1)}B` : "N/A"} valueClass={data.netCash >= 0 ? "text-emerald-400" : "text-red-400"} />}
            />
            <GridRow
              left={<Cell label="Insider Own" value={data.insiderTransactions} valueClass={data.insiderTransactions === "Net Buying" ? "text-emerald-400" : data.insiderTransactions === "Net Selling" ? "text-red-400" : "text-foreground"} />}
              right={<Cell label="Inst. Own" value={`${fmt(data.institutionalOwnership, 0)}%`} />}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
            ETF — aggregate financials not applicable
          </div>
        )}
      </TabsContent>

      {/* ── CATALYST TAB ── */}
      <TabsContent value="catalyst" className="flex-1 overflow-auto mt-0 p-2 space-y-0 data-[state=inactive]:hidden">
        {isETF ? (
          <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
            ETFs track underlying indices — no individual earnings catalysts
          </div>
        ) : (
          <>
            {/* Earnings 2-col */}
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium pb-0.5 border-b border-border/40">Earnings</div>
            <GridRow
              left={
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-muted-foreground leading-none">Next Date</span>
                  <span className="text-[11px] font-mono font-medium text-primary leading-none">{data.nextEarningsDate}</span>
                </div>
              }
              right={
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-muted-foreground leading-none">Last Result</span>
                  <span className={cn("inline-flex items-center gap-0.5 w-fit rounded px-1 py-0 text-[10px] font-medium mt-0.5 leading-tight", earningsColor(data.lastEarningsResult))}>
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
              }
            />

            {/* Short squeeze 2-col */}
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium pt-1 pb-0.5 border-b border-border/40">Short Interest</div>
            <GridRow
              left={
                <Cell
                  label="Short Float"
                  metric="shortFloat"
                  value={`${fmt(data.shortFloat, 1)}%`}
                  valueClass={data.shortFloat > 15 ? "text-red-400" : data.shortFloat > 5 ? "text-amber-400" : "text-emerald-400"}
                />
              }
              right={
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-muted-foreground leading-none">Squeeze Risk</span>
                  <span className={cn("text-[10px] font-medium leading-none",
                    data.shortFloat > 15 ? "text-red-400" : data.shortFloat > 5 ? "text-amber-400" : "text-muted-foreground"
                  )}>
                    {data.shortFloat > 15 ? "High" : data.shortFloat > 5 ? "Moderate" : "Low"}
                  </span>
                </div>
              }
            />

            {/* Bull / Bear catalysts + risks in 2-col */}
            {(data.catalysts.length > 0 || data.risks.length > 0) && (
              <div className="grid grid-cols-2 gap-x-3 pt-1">
                {/* Catalysts */}
                <div className="space-y-[3px]">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium pb-0.5 border-b border-border/40">Catalysts</div>
                  {data.catalysts.map((c, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <Zap className="mt-0.5 h-2 w-2 shrink-0 text-emerald-400" />
                      <span className="text-[10px] leading-snug text-muted-foreground">{c}</span>
                    </div>
                  ))}
                </div>
                {/* Risks */}
                <div className="space-y-[3px]">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium pb-0.5 border-b border-border/40">Risks</div>
                  {data.risks.map((r, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <AlertTriangle className="mt-0.5 h-2 w-2 shrink-0 text-amber-400" />
                      <span className="text-[10px] leading-snug text-muted-foreground">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
