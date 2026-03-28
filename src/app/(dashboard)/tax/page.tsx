"use client";

import { useMemo, useState } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileText,
  AlertTriangle,
  TrendingDown,
  Download,
  Info,
  CheckCircle,
  XCircle,
  DollarSign,
  Calculator,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import type { TradeRecord, Position } from "@/types/trading";

// ── Constants ─────────────────────────────────────────────────────────────────

const SHORT_TERM_RATE = 0.22; // 22% ordinary income rate
const LONG_TERM_RATE = 0.15; // 15% preferential rate
const NIIT_RATE = 0.038; // 3.8% Net Investment Income Tax
const NIIT_THRESHOLD = 200_000; // $200k single filer threshold
// 1 simulated day = 1 bar; 252 trading days = 1 year
const BARS_PER_YEAR = 252;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function pnlColor(n: number): string {
  return n >= 0 ? "text-emerald-500" : "text-red-500";
}

function formatSimDate(ts: number): string {
  // simulationDate is a Unix timestamp in ms
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Derived tax data ──────────────────────────────────────────────────────────

interface TaxLot {
  trade: TradeRecord;
  // index used to find the matching buy that was sold
  holdingBars: number;
  isLongTerm: boolean;
  gainLoss: number;
}

interface WashSalePair {
  lossTrade: TradeRecord;
  rebuyTrade: TradeRecord;
  disallowedLoss: number;
  adjustedBasis: number;
  barsBetween: number;
}

function buildTaxLots(tradeHistory: TradeRecord[]): TaxLot[] {
  // tradeHistory is newest-first; reverse for chronological order
  const chrono = [...tradeHistory].reverse();
  // Map ticker -> FIFO queue of buy lots {price, qty, bar}
  const buyQueues: Record<
    string,
    { price: number; qty: number; bar: number; ts: number }[]
  > = {};
  const lots: TaxLot[] = [];

  for (const trade of chrono) {
    if (trade.side === "buy") {
      if (!buyQueues[trade.ticker]) buyQueues[trade.ticker] = [];
      buyQueues[trade.ticker].push({
        price: trade.price,
        qty: trade.quantity,
        bar: trade.simulationDate, // we use simulationDate as bar proxy
        ts: trade.timestamp,
      });
    } else if (trade.side === "sell") {
      // Match against oldest buy lots (FIFO)
      let remaining = trade.quantity;
      const queue = buyQueues[trade.ticker] ?? [];
      while (remaining > 0 && queue.length > 0) {
        const lot = queue[0];
        const matched = Math.min(lot.qty, remaining);
        lot.qty -= matched;
        remaining -= matched;
        if (lot.qty === 0) queue.shift();

        // Holding period in bars (use simulationDate difference as proxy)
        const holdingBars = Math.max(
          0,
          trade.simulationDate - lot.bar,
        );
        const isLongTerm = holdingBars >= BARS_PER_YEAR;
        const gainLoss = (trade.price - lot.price) * matched - trade.fees * (matched / trade.quantity);

        lots.push({
          trade,
          holdingBars,
          isLongTerm,
          gainLoss,
        });
      }
    }
  }

  return lots;
}

function detectWashSales(tradeHistory: TradeRecord[]): WashSalePair[] {
  const chrono = [...tradeHistory].reverse();
  const WASH_WINDOW_BARS = 30;
  const pairs: WashSalePair[] = [];

  for (let i = 0; i < chrono.length; i++) {
    const sell = chrono[i];
    if (sell.side !== "sell") continue;
    // Check if this sell is a loss
    if (sell.realizedPnL >= 0) continue;

    // Look for a buy of the same ticker within 30 bars after the sell
    for (let j = i + 1; j < chrono.length; j++) {
      const rebuy = chrono[j];
      if (rebuy.ticker !== sell.ticker) continue;
      if (rebuy.side !== "buy") continue;
      const barsDiff = rebuy.simulationDate - sell.simulationDate;
      if (barsDiff < 0 || barsDiff > WASH_WINDOW_BARS) continue;

      const disallowedLoss = Math.abs(sell.realizedPnL);
      const adjustedBasis = rebuy.price + disallowedLoss / rebuy.quantity;

      pairs.push({
        lossTrade: sell,
        rebuyTrade: rebuy,
        disallowedLoss,
        adjustedBasis,
        barsBetween: barsDiff,
      });
      break; // one match per loss trade
    }
  }

  return pairs;
}

// ── Shared card primitive ────────────────────────────────────────────────────

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
      {children}
    </div>
  );
}

function StatChip({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[90px]">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-bold tabular-nums", colorClass)}>
        {value}
      </span>
    </div>
  );
}

// ── Tab 1: Tax Summary ────────────────────────────────────────────────────────

function TaxSummaryTab({
  lots,
  positions,
}: {
  lots: TaxLot[];
  positions: Position[];
}) {
  const shortTermLots = lots.filter((l) => !l.isLongTerm);
  const longTermLots = lots.filter((l) => l.isLongTerm);

  const shortTermGain = shortTermLots.reduce((s, l) => s + l.gainLoss, 0);
  const longTermGain = longTermLots.reduce((s, l) => s + l.gainLoss, 0);
  const totalRealizedGain = shortTermGain + longTermGain;

  // Unrealized P&L from open positions
  const unrealizedPnL = positions.reduce((s, p) => s + p.unrealizedPnL, 0);

  // Net gains for NIIT calc (simplified: use realized gains only)
  const netGains = Math.max(0, totalRealizedGain);
  const niitApplies = netGains > NIIT_THRESHOLD;
  const niitAmount = niitApplies ? (netGains - NIIT_THRESHOLD) * NIIT_RATE : 0;

  const shortTermTax = Math.max(0, shortTermGain) * SHORT_TERM_RATE;
  const longTermTax = Math.max(0, longTermGain) * LONG_TERM_RATE;
  const totalEstimatedTax = shortTermTax + longTermTax + niitAmount;

  const effectiveRate =
    netGains > 0 ? (totalEstimatedTax / netGains) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* YTD summary chips */}
      <Card>
        <SectionLabel>Year-to-Date Overview</SectionLabel>
        <div className="flex flex-wrap gap-6">
          <StatChip
            label="Total Realized P&L"
            value={fmt(totalRealizedGain)}
            colorClass={pnlColor(totalRealizedGain)}
          />
          <StatChip
            label="Unrealized P&L"
            value={fmt(unrealizedPnL)}
            colorClass={pnlColor(unrealizedPnL)}
          />
          <StatChip
            label="Closed Trades"
            value={String(lots.length)}
          />
          <StatChip
            label="Short-Term Lots"
            value={String(shortTermLots.length)}
          />
          <StatChip
            label="Long-Term Lots"
            value={String(longTermLots.length)}
          />
        </div>
      </Card>

      {/* Capital gains breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <SectionLabel>Short-Term Capital Gains</SectionLabel>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gains / (Losses)</span>
              <span className={cn("font-bold", pnlColor(shortTermGain))}>
                {fmt(shortTermGain)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax Rate</span>
              <span className="font-semibold">
                {(SHORT_TERM_RATE * 100).toFixed(0)}% (ordinary income)
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2">
              <span className="text-muted-foreground">Estimated Tax</span>
              <span className={cn("font-bold", shortTermTax > 0 ? "text-amber-500" : "text-emerald-500")}>
                {fmt(shortTermTax)}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
            Positions held under 1 year (252 trading bars). Taxed as ordinary
            income at your marginal rate.
          </p>
        </Card>

        <Card>
          <SectionLabel>Long-Term Capital Gains</SectionLabel>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gains / (Losses)</span>
              <span className={cn("font-bold", pnlColor(longTermGain))}>
                {fmt(longTermGain)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax Rate</span>
              <span className="font-semibold">
                {(LONG_TERM_RATE * 100).toFixed(0)}% (preferential)
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2">
              <span className="text-muted-foreground">Estimated Tax</span>
              <span className={cn("font-bold", longTermTax > 0 ? "text-amber-500" : "text-emerald-500")}>
                {fmt(longTermTax)}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
            Positions held 1+ year (252+ trading bars). Taxed at 0%, 15%, or
            20% depending on income bracket.
          </p>
        </Card>
      </div>

      {/* NIIT + total tax estimate */}
      <Card>
        <SectionLabel>Federal Tax Estimate</SectionLabel>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Short-Term Tax ({(SHORT_TERM_RATE * 100).toFixed(0)}%)</span>
            <span className="font-semibold">{fmt(shortTermTax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Long-Term Tax ({(LONG_TERM_RATE * 100).toFixed(0)}%)</span>
            <span className="font-semibold">{fmt(longTermTax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">NIIT (3.8%)</span>
              {niitApplies ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 font-medium">
                  Applies
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                  Below threshold
                </span>
              )}
            </div>
            <span className={cn("font-semibold", niitApplies ? "text-amber-500" : "text-muted-foreground")}>
              {fmt(niitAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm border-t border-border pt-2 mt-1">
            <span className="font-bold text-foreground">Total Estimated Tax</span>
            <span className={cn("font-bold text-base", totalEstimatedTax > 0 ? "text-amber-500" : "text-emerald-500")}>
              {fmt(totalEstimatedTax)}
            </span>
          </div>
          {netGains > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Effective rate on gains</span>
              <span>{effectiveRate.toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/40 p-2.5">
          <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            NIIT of 3.8% applies to net investment income exceeding the $200,000
            threshold (single filer). State taxes are not included. This is a
            simulation estimate — consult a tax professional.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Wash Sale Tracker ──────────────────────────────────────────────────

function WashSaleTab({ pairs }: { pairs: WashSalePair[] }) {
  const totalDisallowed = pairs.reduce((s, p) => s + p.disallowedLoss, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <SectionLabel>Wash Sale Summary</SectionLabel>
        <div className="flex flex-wrap gap-6">
          <StatChip label="Wash Sale Events" value={String(pairs.length)} />
          <StatChip
            label="Total Disallowed Loss"
            value={fmt(totalDisallowed)}
            colorClass={totalDisallowed > 0 ? "text-red-500" : "text-muted-foreground"}
          />
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/40 p-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            A wash sale occurs when you sell a security at a loss and buy a
            substantially identical security within 30 trading days before or
            after the sale. The disallowed loss is added to the cost basis of
            the replacement shares — deferring, not eliminating, the tax
            benefit.
          </p>
        </div>
      </Card>

      {/* Detected pairs */}
      {pairs.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold">No wash sales detected</p>
              <p className="text-xs text-muted-foreground mt-1">
                No loss trades were followed by a re-purchase within 30 bars.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">
                    Ticker
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">
                    Sold
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">
                    Re-bought
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-muted-foreground">
                    Days Between
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-muted-foreground">
                    Disallowed Loss
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-muted-foreground">
                    Adj. Basis
                  </th>
                </tr>
              </thead>
              <tbody>
                {pairs.map((pair, i) => (
                  <tr
                    key={i}
                    className={cn(
                      "border-b border-border/50 last:border-0",
                      i % 2 === 0 ? "bg-card" : "bg-muted/10",
                    )}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        <span className="font-semibold">
                          {pair.lossTrade.ticker}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {formatSimDate(pair.lossTrade.timestamp)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {formatSimDate(pair.rebuyTrade.timestamp)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-medium",
                          pair.barsBetween <= 10
                            ? "bg-red-500/15 text-red-500"
                            : "bg-amber-500/15 text-amber-500",
                        )}
                      >
                        {pair.barsBetween}d
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-red-500 font-semibold">
                      {fmt(pair.disallowedLoss)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {fmt(pair.adjustedBasis)}/sh
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Rules reminder */}
      <Card>
        <SectionLabel>Wash Sale Rules</SectionLabel>
        <ul className="space-y-1.5">
          {[
            "The 61-day window covers 30 days before + sale day + 30 days after.",
            "Disallowed losses are added to the cost basis of replacement shares.",
            "The rule applies across all accounts, including IRAs and spouse accounts.",
            "Buying a call option or selling a put on the same stock can trigger a wash sale.",
            "The rule applies to stocks, bonds, options, and mutual funds.",
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
              {rule}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ── Tab 3: Form 8949 Preview ──────────────────────────────────────────────────

function Form8949Tab({ lots }: { lots: TaxLot[] }) {
  const [downloading, setDownloading] = useState(false);

  const totalGainLoss = lots.reduce((s, l) => s + l.gainLoss, 0);
  const totalProceeds = lots.reduce(
    (s, l) => s + l.trade.price * l.trade.quantity,
    0,
  );
  const totalCostBasis = totalProceeds - totalGainLoss;

  function downloadCSV() {
    setDownloading(true);
    const header = [
      "Description",
      "Date Acquired",
      "Date Sold",
      "Proceeds",
      "Cost Basis",
      "Gain / (Loss)",
      "Term",
    ].join(",");

    const rows = lots.map((l) => {
      const proceeds = l.trade.price * l.trade.quantity;
      const costBasis = proceeds - l.gainLoss;
      return [
        `${l.trade.ticker} (${l.trade.quantity} shares)`,
        "Various",
        formatSimDate(l.trade.timestamp),
        proceeds.toFixed(2),
        costBasis.toFixed(2),
        l.gainLoss.toFixed(2),
        l.isLongTerm ? "Long-Term" : "Short-Term",
      ].join(",");
    });

    const totalsRow = [
      "TOTALS",
      "",
      "",
      totalProceeds.toFixed(2),
      totalCostBasis.toFixed(2),
      totalGainLoss.toFixed(2),
      "",
    ].join(",");

    const csv = [header, ...rows, totalsRow].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form8949_finsim.csv";
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(false), 800);
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold">Form 8949 Preview</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Sales and Other Dispositions of Capital Assets (simulated)
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          onClick={downloadCSV}
          disabled={lots.length === 0}
        >
          {downloading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Export CSV
        </Button>
      </div>

      {lots.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">No closed trades yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete some trades to populate Form 8949.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">
                    (a) Description
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">
                    (b) Date Acquired
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">
                    (c) Date Sold
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-muted-foreground">
                    (d) Proceeds
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-muted-foreground">
                    (e) Cost Basis
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-muted-foreground">
                    (h) Gain/(Loss)
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-muted-foreground">
                    Term
                  </th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot, i) => {
                  const proceeds = lot.trade.price * lot.trade.quantity;
                  const costBasis = proceeds - lot.gainLoss;
                  return (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-border/50 last:border-0",
                        i % 2 === 0 ? "bg-card" : "bg-muted/10",
                      )}
                    >
                      <td className="px-3 py-2 font-medium">
                        {lot.trade.ticker}{" "}
                        <span className="text-muted-foreground font-normal">
                          {lot.trade.quantity} sh
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        Various
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {formatSimDate(lot.trade.timestamp)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {fmt(proceeds)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {fmt(costBasis)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right tabular-nums font-semibold",
                          pnlColor(lot.gainLoss),
                        )}
                      >
                        {fmt(lot.gainLoss)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-medium",
                            lot.isLongTerm
                              ? "bg-emerald-500/15 text-emerald-500"
                              : "bg-amber-500/15 text-amber-500",
                          )}
                        >
                          {lot.isLongTerm ? "LT" : "ST"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Totals row */}
                <tr className="border-t-2 border-border bg-muted/20 font-bold">
                  <td className="px-3 py-2" colSpan={3}>
                    Totals
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {fmt(totalProceeds)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {fmt(totalCostBasis)}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 text-right tabular-nums",
                      pnlColor(totalGainLoss),
                    )}
                  >
                    {fmt(totalGainLoss)}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="flex items-start gap-2 rounded-md border border-border bg-card p-3">
        <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          This is a simulated Form 8949 for educational purposes. In real
          filing, Part I covers short-term transactions and Part II covers
          long-term transactions. Your broker will provide an official 1099-B
          with cost basis information. Always provide this to your tax
          preparer.
        </p>
      </div>
    </div>
  );
}

// ── Tab 4: Tax Optimization ───────────────────────────────────────────────────

function TaxOptimizationTab({ positions }: { positions: Position[] }) {
  const harvestCandidates = positions.filter(
    (p) => p.unrealizedPnL < 0 && p.side === "long",
  );

  const totalHarvestableLoss = harvestCandidates.reduce(
    (s, p) => s + Math.abs(p.unrealizedPnL),
    0,
  );
  const estimatedTaxSavings = totalHarvestableLoss * SHORT_TERM_RATE;

  function totalHarvestablelossPct(p: Position): number {
    return (p.unrealizedPnL / (p.avgPrice * p.quantity)) * 100;
  }

  return (
    <div className="space-y-4">
      {/* Harvest opportunities */}
      <Card>
        <SectionLabel>Tax-Loss Harvesting Opportunities</SectionLabel>
        {harvestCandidates.length === 0 ? (
          <div className="flex items-center gap-2 py-4 justify-center text-center flex-col">
            <CheckCircle className="h-7 w-7 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold">No harvesting candidates</p>
              <p className="text-xs text-muted-foreground mt-1">
                All open positions are currently profitable.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-4">
              <StatChip
                label="Candidates"
                value={String(harvestCandidates.length)}
              />
              <StatChip
                label="Harvestable Loss"
                value={fmt(totalHarvestableLoss)}
                colorClass="text-red-500"
              />
              <StatChip
                label="Est. Tax Savings"
                value={fmt(estimatedTaxSavings)}
                colorClass="text-emerald-500"
              />
            </div>

            <div className="space-y-2">
              {harvestCandidates.map((pos) => {
                const lossPct = totalHarvestablelossPct(pos);
                const costBasis = pos.avgPrice * pos.quantity;
                const currentVal = pos.currentPrice * pos.quantity;
                const taxSave = Math.abs(pos.unrealizedPnL) * SHORT_TERM_RATE;
                return (
                  <div
                    key={pos.ticker}
                    className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
                      <div>
                        <span className="text-sm font-semibold">
                          {pos.ticker}
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          {pos.quantity} shares · Basis{" "}
                          {fmt(costBasis)} · Now {fmt(currentVal)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-500">
                        {fmt(pos.unrealizedPnL)} ({fmtPct(lossPct)})
                      </div>
                      <div className="text-[10px] text-emerald-500">
                        Save ~{fmt(taxSave)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Year-end harvest reminder */}
      <Card>
        <SectionLabel>Year-End Harvest Deadline</SectionLabel>
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">
              Harvest before December 31
            </span>{" "}
            — Tax-loss harvesting must be completed in the tax year you want to
            offset gains. Losses harvested after December 31 apply to the
            following tax year. Remember: wait at least 31 days before
            repurchasing to avoid wash sale disallowance.
          </div>
        </div>
      </Card>

      {/* Strategy cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Qualified Opportunity Zones */}
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-bold">Opportunity Zones</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Invest capital gains into Qualified Opportunity Zone (QOZ) funds to
            defer and reduce your capital gains tax. If held 10+ years, gains
            on the new investment are permanently excluded from tax. QOZ
            investments must be made within 180 days of realizing the gain.
          </p>
          <div className="mt-2 text-[10px] font-semibold text-primary">
            Potential: 15% basis step-up + permanent exclusion
          </div>
        </Card>

        {/* Roth Conversion */}
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10">
              <RefreshCw className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <span className="text-xs font-bold">Roth Conversion</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            In low-income years, convert Traditional IRA assets to Roth IRA.
            Pay ordinary income tax now to achieve permanent tax-free growth.
            Ideal when your marginal rate today is lower than your expected
            rate in retirement. Avoid converting in years with large capital
            gains to prevent bracket creep.
          </p>
          <div className="mt-2 text-[10px] font-semibold text-emerald-500">
            Best in: low-income years, market dips
          </div>
        </Card>

        {/* Donate Appreciated Stock */}
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
              <Lightbulb className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <span className="text-xs font-bold">Donate Appreciated Stock</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Donating long-term appreciated stock directly to a 501(c)(3) charity
            lets you deduct the full fair market value while avoiding capital
            gains tax on the appreciation entirely. A $50k donation from a
            $10k basis stock saves you ~$6,080 in avoided taxes (15% + 3.8%
            NIIT on $40k gain) vs. selling first.
          </p>
          <div className="mt-2 text-[10px] font-semibold text-blue-400">
            Avoid: donating losing positions (sell first, harvest loss)
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TaxPage() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const positions = useTradingStore((s) => s.positions);

  const lots = useMemo(() => buildTaxLots(tradeHistory), [tradeHistory]);
  const washSalePairs = useMemo(
    () => detectWashSales(tradeHistory),
    [tradeHistory],
  );

  const shortTermGain = useMemo(
    () =>
      lots
        .filter((l) => !l.isLongTerm)
        .reduce((s, l) => s + l.gainLoss, 0),
    [lots],
  );
  const longTermGain = useMemo(
    () =>
      lots
        .filter((l) => l.isLongTerm)
        .reduce((s, l) => s + l.gainLoss, 0),
    [lots],
  );
  const totalTax = useMemo(() => {
    const st = Math.max(0, shortTermGain) * SHORT_TERM_RATE;
    const lt = Math.max(0, longTermGain) * LONG_TERM_RATE;
    return st + lt;
  }, [shortTermGain, longTermGain]);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-5 p-6 max-w-5xl">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Tax Reporting</h1>
            <p className="text-[10px] text-muted-foreground">
              Simulated capital gains analysis, wash sale detection, and Form
              8949 preview
            </p>
          </div>
          <div className="flex-1" />
          {/* Quick stats in header */}
          <div className="hidden sm:flex items-center gap-4 rounded-md border border-border bg-card px-3 py-2">
            <StatChip
              label="Est. Tax Owed"
              value={fmt(totalTax)}
              colorClass={totalTax > 0 ? "text-amber-500" : "text-emerald-500"}
            />
            <div className="w-px h-6 bg-border" />
            <StatChip
              label="Wash Sales"
              value={String(washSalePairs.length)}
              colorClass={washSalePairs.length > 0 ? "text-red-500" : "text-muted-foreground"}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="summary">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="summary" className="gap-1.5 text-xs">
              <Calculator className="h-3.5 w-3.5" />
              Tax Summary
            </TabsTrigger>
            <TabsTrigger value="wash" className="gap-1.5 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              Wash Sale Tracker
              {washSalePairs.length > 0 && (
                <span className="ml-1 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                  {washSalePairs.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="form8949" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              Form 8949 Preview
            </TabsTrigger>
            <TabsTrigger value="optimization" className="gap-1.5 text-xs">
              <Lightbulb className="h-3.5 w-3.5" />
              Tax Optimization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4">
            <TaxSummaryTab lots={lots} positions={positions} />
          </TabsContent>

          <TabsContent value="wash" className="mt-4">
            <WashSaleTab pairs={washSalePairs} />
          </TabsContent>

          <TabsContent value="form8949" className="mt-4">
            <Form8949Tab lots={lots} />
          </TabsContent>

          <TabsContent value="optimization" className="mt-4">
            <TaxOptimizationTab positions={positions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
