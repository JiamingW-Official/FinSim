"use client";

import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { FUNDAMENTALS } from "@/data/fundamentals";
import { MetricTooltip } from "@/components/education/MetricTooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Zap } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Sub-components ────────────────────────────────────────────────────────────

function Row({ label, metric, value, valueClass }: { label: string; metric?: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground">
        {metric ? <MetricTooltip metric={metric}>{label}</MetricTooltip> : label}
      </span>
      <span className={cn("text-[11px] font-semibold tabular-nums", valueClass)}>{value}</span>
    </div>
  );
}

function MarginBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(Math.max(value, 0), max);
  const width = `${(pct / max) * 100}%`;
  const barColor = value > 50 ? "bg-emerald-500" : value > 20 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-bold tabular-nums", value > 50 ? "text-emerald-400" : value > 20 ? "text-amber-400" : "text-red-400")}>
          {fmt(value)}%
        </span>
      </div>
      <div className="h-1 rounded-full bg-muted/40">
        <div className={cn("h-1 rounded-full transition-all", barColor)} style={{ width }} />
      </div>
    </div>
  );
}

function PriceBar({
  current,
  low,
  high,
  label,
}: {
  current: number;
  low: number;
  high: number;
  label: string;
}) {
  const range = high - low;
  const pos = range > 0 ? ((current - low) / range) * 100 : 50;
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-bold text-foreground/50">{label}</div>
      <div className="relative h-1.5 rounded-full bg-muted/40">
        <div className="absolute inset-0 rounded-full bg-muted/60" />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>${fmt(low, 0)}</span>
        <span className="font-bold text-foreground">${fmt(current, 2)} ({fmt(pos, 0)}% of range)</span>
        <span>${fmt(high, 0)}</span>
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

  // AlphaBot fundamental insight sentence
  const fundamentalInsight = (() => {
    if (isETF) return `${currentTicker} is an ETF tracking a broad market index — fundamentals are aggregate figures from underlying holdings.`;
    const valuation =
      pePremium > 25
        ? `trading at a ${pePremium}% premium to its sector avg P/E`
        : pePremium < -15
        ? `trading at a ${Math.abs(pePremium)}% discount to sector avg P/E`
        : `fairly valued near sector avg P/E`;
    const earnStr =
      data.lastEarningsResult === "beat"
        ? `beat estimates by ${data.earningsSurprisePct}%`
        : data.lastEarningsResult === "miss"
        ? `missed by ${Math.abs(data.earningsSurprisePct)}%`
        : `met estimates`;
    return `${currentTicker}: ${valuation} (${fmt(data.peRatio)}× P/E vs ${fmt(data.sectorAvgPE)}× sector); ${data.analystRating} consensus (${data.analystCount} analysts${targetUpside != null ? `, PT $${data.priceTarget} = ${targetUpside > 0 ? "+" : ""}${targetUpside}% upside` : ""}); last quarter ${earnStr}.`;
  })();

  return (
    <Tabs defaultValue="overview" className="flex h-full flex-col">
      <TabsList className="h-6 w-full justify-start rounded-none border-b border-border bg-card px-2 shrink-0">
        {["overview", "valuation", "financials", "catalyst"].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="h-5 rounded-none border-b-2 border-transparent px-2 text-xs capitalize data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* ── OVERVIEW TAB ── */}
      <TabsContent value="overview" className="flex-1 overflow-auto mt-0 p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-foreground">{currentTicker}</div>
            <div className="text-xs text-muted-foreground">{data.industry}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">{data.sector}</div>
            <div className="text-xs font-semibold text-foreground">{data.marketCap}</div>
          </div>
        </div>

        {/* Key stats chips */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "β", value: fmt(data.beta, 2) },
            { label: "Vol", value: data.avgVolume },
            { label: "Short", value: `${fmt(data.shortFloat, 1)}%` },
            { label: "Div", value: data.dividendYield > 0 ? `${fmt(data.dividendYield, 2)}%` : "N/A" },
          ].map(({ label, value }) => (
            <span key={label} className="rounded border border-border/50 bg-muted/20 px-1.5 py-0.5 text-[11px]">
              <span className="text-muted-foreground">{label} </span>
              <span className="font-bold text-foreground">{value}</span>
            </span>
          ))}
        </div>

        {/* 52-week range bar */}
        {currentPrice > 0 && (
          <PriceBar
            current={currentPrice}
            low={data.week52Low}
            high={data.week52High}
            label="52-Week Range"
          />
        )}

        {/* Analyst block */}
        {!isETF && (
          <div className="rounded-md border border-border/50 bg-background/50 p-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className={cn("rounded border px-2 py-0.5 text-xs font-bold", ratingColor(data.analystRating))}>
                {data.analystRating}
              </span>
              <span className="text-xs text-muted-foreground">{data.analystCount} analysts</span>
            </div>
            {/* Price target bar */}
            {currentPrice > 0 && data.priceTargetLow > 0 && (
              <div className="space-y-1">
                <PriceBar
                  current={currentPrice}
                  low={data.priceTargetLow}
                  high={data.priceTargetHigh}
                  label="Analyst Price Target Range"
                />
                {targetUpside != null && (
                  <div className={cn("text-right text-[11px] font-bold", pctColor(targetUpside))}>
                    Consensus PT ${data.priceTarget} → {targetUpside > 0 ? "+" : ""}{targetUpside}% upside
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* AlphaBot insight */}
        <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-2 py-2">
          <span className="shrink-0 text-xs">🤖</span>
          <p className="text-xs leading-relaxed text-muted-foreground">{fundamentalInsight}</p>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed text-muted-foreground">{data.description}</p>
      </TabsContent>

      {/* ── VALUATION TAB ── */}
      <TabsContent value="valuation" className="flex-1 overflow-auto mt-0 p-3 space-y-1.5">
        <div className="text-[11px] font-bold text-foreground/40 mb-2">Valuation Multiples</div>
        <Row label="P/E Ratio" metric="peRatio" value={data.peRatio > 0 ? `${fmt(data.peRatio)}×` : "N/A"} />
        <Row label="Forward P/E" metric="forwardPE" value={data.forwardPE > 0 ? `${fmt(data.forwardPE)}×` : "N/A"} />
        <Row label="Price / Book" metric="pbRatio" value={data.pbRatio > 0 ? `${fmt(data.pbRatio)}×` : "N/A"} />
        <Row label="Price / Sales" metric="psRatio" value={data.psRatio > 0 ? `${fmt(data.psRatio)}×` : "N/A"} />
        <Row label="EV / EBITDA" metric="evEbitda" value={data.evEbitda > 0 ? `${fmt(data.evEbitda)}×` : "N/A"} />

        {/* Vs-sector comparison */}
        {!isETF && data.sectorAvgPE > 0 && (
          <div className="rounded-md border border-border/40 bg-muted/20 p-2 space-y-1 mt-2">
            <div className="text-[11px] font-bold text-foreground/40">Vs Sector Avg P/E</div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-muted-foreground">Sector avg</span>
                  <span className="text-foreground font-bold">{fmt(data.sectorAvgPE)}×</span>
                </div>
                <div className="h-1 rounded-full bg-muted/40">
                  <div className="h-1 rounded-full bg-muted-foreground/40" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-muted-foreground">{currentTicker}</span>
                  <span className={cn("font-bold", pePremium > 10 ? "text-red-400" : pePremium < -10 ? "text-emerald-400" : "text-amber-400")}>
                    {fmt(data.peRatio)}×
                  </span>
                </div>
                <div className="h-1 rounded-full bg-muted/40">
                  <div
                    className={cn("h-1 rounded-full", pePremium > 10 ? "bg-red-500" : pePremium < -10 ? "bg-emerald-500" : "bg-amber-500")}
                    style={{ width: `${Math.min((data.peRatio / (data.sectorAvgPE * 2)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className={cn("text-[11px] font-bold pt-0.5", pePremium > 25 ? "text-red-400" : pePremium < -15 ? "text-emerald-400" : "text-amber-400")}>
              {pePremium > 25
                ? `Premium: ${pePremium}% above sector avg — needs consistent earnings beats`
                : pePremium < -15
                ? `Discount: ${Math.abs(pePremium)}% below sector avg — potential value opportunity`
                : `Fairly valued: within normal range of sector peers`}
            </div>
          </div>
        )}
      </TabsContent>

      {/* ── FINANCIALS TAB ── */}
      <TabsContent value="financials" className="flex-1 overflow-auto mt-0 p-3 space-y-3">
        {/* Growth */}
        {!isETF && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-foreground/40">Growth</div>
            <Row
              label="Revenue"
              value={data.revenue}
            />
            <Row
              label="Revenue Growth YoY"
              metric="revenueGrowthYoY"
              value={`${data.revenueGrowthYoY > 0 ? "+" : ""}${fmt(data.revenueGrowthYoY)}%`}
              valueClass={pctColor(data.revenueGrowthYoY)}
            />
            <Row
              label="EPS"
              value={`$${fmt(data.eps, 2)}`}
            />
            <Row
              label="EPS Growth YoY"
              metric="epsGrowthYoY"
              value={`${data.epsGrowthYoY > 0 ? "+" : ""}${fmt(data.epsGrowthYoY)}%`}
              valueClass={pctColor(data.epsGrowthYoY)}
            />
          </div>
        )}

        {/* Margins */}
        {!isETF && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-foreground/40">Margins</div>
            <MetricTooltip metric="grossMargin">
              <span className="text-[11px] text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/50">Gross Margin</span>
            </MetricTooltip>
            <MarginBar label="Gross Margin" value={data.grossMargin} />
            <MarginBar label="Operating Margin" value={data.operatingMargin} />
            <MarginBar label="Net Margin" value={data.netMargin} />
          </div>
        )}

        {/* Balance Sheet */}
        {!isETF && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-foreground/40">Balance Sheet</div>
            <Row label="ROE" metric="roe" value={`${fmt(data.roe)}%`} valueClass={data.roe > 20 ? "text-emerald-400" : data.roe > 10 ? "text-amber-400" : "text-red-400"} />
            <Row label="Debt / Equity" metric="debtToEquity" value={data.debtToEquity > 0 ? fmt(data.debtToEquity, 2) : "N/A"} valueClass={data.debtToEquity > 2 ? "text-red-400" : data.debtToEquity < 0.5 ? "text-emerald-400" : "text-amber-400"} />
            <Row label="Current Ratio" metric="currentRatio" value={data.currentRatio > 0 ? fmt(data.currentRatio, 2) : "N/A"} valueClass={data.currentRatio < 1 ? "text-red-400" : data.currentRatio > 1.5 ? "text-emerald-400" : "text-amber-400"} />
            <Row label="Free Cash Flow" value={data.freeCashFlow || "N/A"} valueClass="text-emerald-400" />
          </div>
        )}

        {/* Income */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-foreground/40">Income</div>
          <Row label="Dividend Yield" metric="dividendYield" value={data.dividendYield > 0 ? `${fmt(data.dividendYield, 2)}%` : "N/A"} />
          {!isETF && (
            <Row label="Payout Ratio" metric="dividendPayoutRatio" value={data.dividendPayoutRatio > 0 ? `${fmt(data.dividendPayoutRatio)}%` : "N/A"} />
          )}
        </div>
      </TabsContent>

      {/* ── CATALYST TAB ── */}
      <TabsContent value="catalyst" className="flex-1 overflow-auto mt-0 p-3 space-y-3">
        {/* Earnings */}
        {!isETF && (
          <div className="rounded-md border border-border/50 bg-background/50 p-2 space-y-1.5">
            <div className="text-[11px] font-bold text-foreground/40">Earnings</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Next earnings</span>
              <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
                {data.nextEarningsDate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Last result</span>
              <span className={cn("flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold", earningsColor(data.lastEarningsResult))}>
                {data.lastEarningsResult === "beat" ? (
                  <TrendingUp className="h-2.5 w-2.5" />
                ) : data.lastEarningsResult === "miss" ? (
                  <TrendingDown className="h-2.5 w-2.5" />
                ) : (
                  <Minus className="h-2.5 w-2.5" />
                )}
                {data.lastEarningsResult === "beat"
                  ? `Beat +${fmt(data.earningsSurprisePct, 1)}%`
                  : data.lastEarningsResult === "miss"
                  ? `Miss ${fmt(data.earningsSurprisePct, 1)}%`
                  : "In-Line"}
              </span>
            </div>
          </div>
        )}

        {/* Short interest */}
        {!isETF && (
          <div className="rounded-md border border-border/50 bg-background/50 p-2 space-y-1">
            <div className="text-[11px] font-bold text-foreground/40">Short Interest</div>
            <div className="flex items-center justify-between">
              <MetricTooltip metric="shortFloat">
                <span className="text-xs text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/50">Short Float</span>
              </MetricTooltip>
              <span className={cn("text-[11px] font-bold", data.shortFloat > 15 ? "text-red-400" : data.shortFloat > 5 ? "text-amber-400" : "text-emerald-400")}>
                {fmt(data.shortFloat, 1)}%
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              {data.shortFloat > 15
                ? "High short interest — potential for short squeeze on positive catalyst"
                : data.shortFloat > 5
                ? "Moderate short interest — bears present but not dominant"
                : "Low short interest — limited short squeeze potential"}
            </div>
          </div>
        )}

        {/* Risks */}
        {!isETF && data.risks.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-foreground/40">Key Risks</div>
            {data.risks.map((risk, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <AlertTriangle className="mt-0.5 h-2.5 w-2.5 shrink-0 text-amber-400" />
                <span className="text-xs leading-relaxed text-muted-foreground">{risk}</span>
              </div>
            ))}
          </div>
        )}

        {/* Catalysts */}
        {!isETF && data.catalysts.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-foreground/40">Key Catalysts</div>
            {data.catalysts.map((catalyst, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <Zap className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-400" />
                <span className="text-xs leading-relaxed text-muted-foreground">{catalyst}</span>
              </div>
            ))}
          </div>
        )}

        {isETF && (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            ETFs track underlying indices — no individual earnings catalysts
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
