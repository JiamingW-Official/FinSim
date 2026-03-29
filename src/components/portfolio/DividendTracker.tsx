"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DividendStock {
  ticker: string;
  name: string;
  sector: string;
  annualYield: number;   // decimal e.g. 0.0052
  price: number;
  shares: number;
  quarterlyDPS: number;  // dividend per share per quarter
  exDivMonth: number;    // month of next ex-div (1-12)
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const DIVIDEND_STOCKS: DividendStock[] = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology",    annualYield: 0.0052, price: 182.50, shares: 50,  quarterlyDPS: 0.24,  exDivMonth: 2 },
  { ticker: "MSFT", name: "Microsoft",  sector: "Technology",    annualYield: 0.0080, price: 410.20, shares: 30,  quarterlyDPS: 0.82,  exDivMonth: 3 },
  { ticker: "JNJ",  name: "J&J",        sector: "Healthcare",    annualYield: 0.031,  price: 147.80, shares: 40,  quarterlyDPS: 1.19,  exDivMonth: 3 },
  { ticker: "KO",   name: "Coca-Cola",  sector: "Consumer Stapl",annualYield: 0.030,  price: 62.10,  shares: 80,  quarterlyDPS: 0.485, exDivMonth: 1 },
  { ticker: "T",    name: "AT&T",       sector: "Telecom",       annualYield: 0.062,  price: 17.30,  shares: 200, quarterlyDPS: 0.2775,exDivMonth: 4 },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Synthetic quarterly history: last 4 quarters from each stock
function buildDividendHistory(stock: DividendStock) {
  const currentMonth = 3; // March 2026 (from project date)
  return [0, 1, 2, 3].map((qBack) => {
    const totalMonthsBack = qBack * 3;
    const month = ((currentMonth - 1 - totalMonthsBack + 120) % 12) + 1;
    const year = 2026 - Math.floor((currentMonth - 1 - totalMonthsBack + 120) / 12 - 10 + 1 > 0 ? 0 : 1);
    // Slight random variation using deterministic seed
    const seed = (stock.ticker.charCodeAt(0) * 31 + qBack * 17) % 7;
    const variation = 1 + (seed - 3) * 0.003;
    return {
      quarter: `Q${4 - qBack} ${year > 2025 ? 2025 : year}`,
      dps: parseFloat((stock.quarterlyDPS * variation).toFixed(4)),
      month,
    };
  }).reverse();
}

// ─── Dividend Row ─────────────────────────────────────────────────────────────

function DividendRow({
  stock,
  reinvestPct,
}: {
  stock: DividendStock;
  reinvestPct: number;
}) {
  const annualIncome = stock.annualYield * stock.price * stock.shares;
  const quarterlyIncome = annualIncome / 4;
  const reinvestedShares = (quarterlyIncome * reinvestPct) / stock.price;
  const nextExDiv = MONTHS[stock.exDivMonth - 1];
  const marketValue = stock.price * stock.shares;
  const effectiveYield = (annualIncome / marketValue) * 100;

  return (
    <tr className="border-b border-muted/40 text-xs">
      <td className="py-2 px-1">
        <p className="font-semibold">{stock.ticker}</p>
        <p className="text-xs text-muted-foreground">{stock.sector}</p>
      </td>
      <td className="py-2 px-1 text-right font-mono tabular-nums">{stock.shares}</td>
      <td className="py-2 px-1 text-right font-mono tabular-nums">${stock.price.toFixed(2)}</td>
      <td className="py-2 px-1 text-right font-mono tabular-nums text-emerald-400">
        {effectiveYield.toFixed(2)}%
      </td>
      <td className="py-2 px-1 text-right font-mono tabular-nums text-emerald-400">
        ${annualIncome.toFixed(0)}
      </td>
      <td className="py-2 px-1 text-center">
        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
          {nextExDiv}
        </span>
      </td>
      <td className="py-2 px-1 text-right font-mono tabular-nums text-muted-foreground">
        {reinvestedShares > 0 ? `+${reinvestedShares.toFixed(2)} sh` : "--"}
      </td>
    </tr>
  );
}

// ─── Compounding Calculator ───────────────────────────────────────────────────

function CompoundingCalc({
  annualIncome,
  totalMarketValue,
  reinvestPct,
}: {
  annualIncome: number;
  totalMarketValue: number;
  reinvestPct: number;
}) {
  const years = 10;
  const avgYield = totalMarketValue > 0 ? annualIncome / totalMarketValue : 0;
  const annualGrowthRate = 0.07; // assumed price appreciation

  // Year-by-year projection
  const data: { year: number; value: number }[] = [];
  let value = totalMarketValue;
  for (let y = 0; y <= years; y++) {
    data.push({ year: y, value });
    const dividendIncome = value * avgYield;
    const reinvestedAmount = dividendIncome * reinvestPct;
    value = value * (1 + annualGrowthRate) + reinvestedAmount;
  }

  const finalValue = data[years].value;
  const totalReturn = ((finalValue - totalMarketValue) / totalMarketValue) * 100;

  // SVG line chart
  const W = 280;
  const H = 90;
  const PAD = { top: 8, right: 8, bottom: 20, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = data[0].value;

  const toX = (y: number) => PAD.left + (y / years) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - minVal) / (maxVal - minVal + 1)) * chartH;

  const pathD = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.year).toFixed(1)},${toY(d.value).toFixed(1)}`)
    .join(" ");

  const areaD = `${pathD} L${toX(years)},${PAD.top + chartH} L${toX(0)},${PAD.top + chartH} Z`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">10-Year Projection</p>
        <div className="text-right">
          <p className="text-sm font-semibold text-emerald-400">
            ${(finalValue / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-muted-foreground">+{totalReturn.toFixed(0)}% total</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        <defs>
          <linearGradient id="divGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#divGrad)" />
        <path d={pathD} fill="none" stroke="#10b981" strokeWidth={1.5} />

        {/* X ticks */}
        {[0, 2, 4, 6, 8, 10].map((y) => (
          <text
            key={y}
            x={toX(y)}
            y={H - 4}
            textAnchor="middle"
            fontSize={7}
            fill="currentColor"
            fillOpacity={0.4}
          >
            Yr{y}
          </text>
        ))}

        {/* Y ticks */}
        {[minVal, (minVal + maxVal) / 2, maxVal].map((v, i) => (
          <text
            key={i}
            x={PAD.left - 4}
            y={toY(v) + 3}
            textAnchor="end"
            fontSize={7}
            fill="currentColor"
            fillOpacity={0.4}
          >
            ${(v / 1000).toFixed(0)}K
          </text>
        ))}
      </svg>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Assumes {(avgYield * 100).toFixed(2)}% avg dividend yield, 7% annual price appreciation,
        {(reinvestPct * 100).toFixed(0)}% dividends reinvested (DRIP).
      </p>
    </div>
  );
}

// ─── Quarterly History Table ──────────────────────────────────────────────────

function QuarterlyHistory({ stock }: { stock: DividendStock }) {
  const history = useMemo(() => buildDividendHistory(stock), [stock]);
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5">{stock.ticker} — Historical Dividends</p>
      <div className="grid grid-cols-4 gap-1">
        {history.map((h) => (
          <div key={h.quarter} className="rounded bg-muted/40 p-1.5 text-center">
            <p className="text-[11px] text-muted-foreground">{h.quarter}</p>
            <p className="text-xs font-mono font-semibold">${h.dps.toFixed(3)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Annual Income Bar ────────────────────────────────────────────────────────

function IncomeBar({ stocks }: { stocks: DividendStock[] }) {
  const MONTH_LABELS = MONTHS;
  // distribute income across 12 months based on ex-div months
  const monthlyIncome = Array(12).fill(0) as number[];
  stocks.forEach((s) => {
    const income = (s.annualYield * s.price * s.shares) / 4;
    // pays dividend in ex-div month +1, +4, +7, +10 (quarterly)
    [0, 3, 6, 9].forEach((offset) => {
      const month = (s.exDivMonth + offset - 1) % 12;
      monthlyIncome[month] += income;
    });
  });
  const maxIncome = Math.max(...monthlyIncome);
  const currentMonth = 2; // March = index 2

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Monthly Income Distribution</p>
      <div className="flex items-end gap-1 h-12">
        {monthlyIncome.map((inc, m) => {
          const height = maxIncome > 0 ? (inc / maxIncome) * 100 : 0;
          return (
            <div key={m} className="flex flex-col items-center flex-1 gap-0.5">
              <div className="w-full flex items-end justify-center" style={{ height: 40 }}>
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-all duration-300",
                    m === currentMonth ? "bg-primary" : "bg-muted-foreground/30",
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground">{MONTH_LABELS[m].slice(0, 1)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DividendTracker() {
  const [reinvestPct, setReinvestPct] = useState(0.5);
  const [selectedTicker, setSelectedTicker] = useState<string>("AAPL");

  const totalAnnualIncome = DIVIDEND_STOCKS.reduce(
    (s, st) => s + st.annualYield * st.price * st.shares,
    0
  );
  const totalMarketValue = DIVIDEND_STOCKS.reduce(
    (s, st) => s + st.price * st.shares,
    0
  );
  const portfolioYield = totalMarketValue > 0 ? (totalAnnualIncome / totalMarketValue) * 100 : 0;
  const monthlyIncome = totalAnnualIncome / 12;
  const quarterlyIncome = totalAnnualIncome / 4;

  const selectedStock = DIVIDEND_STOCKS.find((s) => s.ticker === selectedTicker) ?? DIVIDEND_STOCKS[0];

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Dividend Tracker</h3>
        <span className="text-xs text-muted-foreground">Income Portfolio</span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Annual Income", value: `$${totalAnnualIncome.toFixed(0)}`, color: "text-emerald-400" },
          { label: "Monthly Income", value: `$${monthlyIncome.toFixed(0)}`, color: "text-foreground" },
          { label: "Portfolio Yield", value: `${portfolioYield.toFixed(2)}%`, color: "text-primary" },
          { label: "Quarterly", value: `$${quarterlyIncome.toFixed(0)}`, color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("font-mono tabular-nums text-sm font-semibold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Income bar chart */}
      <IncomeBar stocks={DIVIDEND_STOCKS} />

      {/* Holdings table */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Holdings</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="text-left py-1 px-1 font-medium">Stock</th>
                <th className="text-right py-1 px-1 font-medium">Shares</th>
                <th className="text-right py-1 px-1 font-medium">Price</th>
                <th className="text-right py-1 px-1 font-medium">Yield</th>
                <th className="text-right py-1 px-1 font-medium">Ann. Income</th>
                <th className="text-center py-1 px-1 font-medium">Ex-Div</th>
                <th className="text-right py-1 px-1 font-medium">DRIP/Qtr</th>
              </tr>
            </thead>
            <tbody>
              {DIVIDEND_STOCKS.map((stock) => (
                <DividendRow key={stock.ticker} stock={stock} reinvestPct={reinvestPct} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reinvestment slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground whitespace-nowrap">DRIP Rate:</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={reinvestPct}
          onChange={(e) => setReinvestPct(Number(e.target.value))}
          className="flex-1 h-1 accent-primary"
        />
        <span className="font-mono tabular-nums text-xs font-medium w-10 text-right">
          {(reinvestPct * 100).toFixed(0)}%
        </span>
      </div>

      {/* Compounding calculator */}
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <CompoundingCalc
          annualIncome={totalAnnualIncome}
          totalMarketValue={totalMarketValue}
          reinvestPct={reinvestPct}
        />
      </div>

      {/* Historical dividends per stock */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Historical Dividends (Last 4 Quarters)</p>
        <div className="flex gap-1 mb-3 flex-wrap">
          {DIVIDEND_STOCKS.map((s) => (
            <button
              key={s.ticker}
              onClick={() => setSelectedTicker(s.ticker)}
              className={cn(
                "text-xs px-2 py-0.5 rounded transition-colors",
                selectedTicker === s.ticker
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {s.ticker}
            </button>
          ))}
        </div>
        <QuarterlyHistory stock={selectedStock} />
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Dividend yields and ex-dividend dates are illustrative. DRIP (Dividend Reinvestment Plan) automatically uses dividend payments to purchase additional shares. Over time, compounding can significantly amplify total returns.
      </p>
    </div>
  );
}
