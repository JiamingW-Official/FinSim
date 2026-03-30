"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComparisonPair {
  id: string;
  label: string;
  a: ConceptData;
  b: ConceptData;
}

interface ConceptData {
  name: string;
  definition: string;
  whenToUse: string;
  advantages: string;
  disadvantages: string;
  example: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPARISON_PAIRS: ComparisonPair[] = [
  {
    id: "rsi-vs-macd",
    label: "RSI vs MACD",
    a: {
      name: "RSI",
      definition: "Momentum oscillator (0-100) measuring speed of price changes. Above 70 = overbought, below 30 = oversold.",
      whenToUse: "Ranging, sideways markets. Best for spotting potential reversals at extremes.",
      advantages: "Simple to read. Clear overbought/oversold zones. Good divergence signal.",
      disadvantages: "Can stay overbought/oversold for long periods in strong trends. Gives false signals in trending markets.",
      example: "RSI hits 28 as price touches a known support — potential long entry.",
    },
    b: {
      name: "MACD",
      definition: "Trend-following momentum indicator using two EMAs (12/26) and a signal line (9-period EMA of MACD).",
      whenToUse: "Trending markets. Confirms direction of trend and spots momentum shifts.",
      advantages: "Works well in trends. Shows both direction and momentum. Histogram visualizes acceleration.",
      disadvantages: "Lags price (it is EMA-based). Poor in choppy markets. Signal line crossovers can whipsaw.",
      example: "MACD crosses above signal line as price breaks above 50-day MA — bullish confirmation.",
    },
  },
  {
    id: "call-vs-put",
    label: "Call vs Put",
    a: {
      name: "Call Option",
      definition: "The right (not obligation) to BUY 100 shares at the strike price before expiration.",
      whenToUse: "Bullish outlook. Expecting the underlying to rise above the strike.",
      advantages: "Defined risk (only lose the premium paid). Leveraged upside on bullish moves.",
      disadvantages: "Time decay (theta) works against you. Worth $0 if stock stays below strike at expiry.",
      example: "Buy AAPL $180 call for $3.50 premium. Profit if AAPL rises above $183.50 before expiry.",
    },
    b: {
      name: "Put Option",
      definition: "The right (not obligation) to SELL 100 shares at the strike price before expiration.",
      whenToUse: "Bearish outlook or as portfolio insurance against a long stock position.",
      advantages: "Defined risk. Profits from stock decline. Can hedge an existing long position.",
      disadvantages: "Time decay erodes value. Stock can grind sideways and put expires worthless.",
      example: "Buy TSLA $200 put for $4.00. Profit if TSLA falls below $196 before expiry.",
    },
  },
  {
    id: "market-vs-limit",
    label: "Market Order vs Limit Order",
    a: {
      name: "Market Order",
      definition: "An order to buy or sell immediately at the best available current price.",
      whenToUse: "When you need immediate execution and liquidity is high (large cap stocks).",
      advantages: "Guaranteed fill. Simple — no price to specify. Essential for urgent exits.",
      disadvantages: "Pays the bid-ask spread. In illiquid stocks, can cause significant slippage.",
      example: "Market buy on SPY during regular hours fills instantly at the ask price.",
    },
    b: {
      name: "Limit Order",
      definition: "An order to buy or sell only at a specified price or better.",
      whenToUse: "When exact entry/exit price matters. Use for illiquid assets or precise levels.",
      advantages: "Control over fill price. No slippage. Can improve on the bid-ask spread.",
      disadvantages: "Not guaranteed to fill if price never reaches your limit. May miss fast moves.",
      example: "Limit buy at $49.90 on a stock quoted at $50.05 bid/ask. You improve vs market order.",
    },
  },
  {
    id: "fundamental-vs-technical",
    label: "Fundamental vs Technical Analysis",
    a: {
      name: "Fundamental Analysis",
      definition: "Evaluating a company's intrinsic value using financial statements, earnings, growth, and industry position.",
      whenToUse: "Long-term investing. Determining whether a stock is undervalued or overvalued.",
      advantages: "Based on real business value. Less affected by short-term noise. Suits long-term investors.",
      disadvantages: "Slow to react to market price moves. Financial statements are backward-looking.",
      example: "P/E ratio of 12 vs sector average of 20 — stock may be undervalued. Buy for long-term.",
    },
    b: {
      name: "Technical Analysis",
      definition: "Analyzing price action, volume, and chart patterns to predict future price movements.",
      whenToUse: "Short to medium-term trading. Timing entries and exits on any liquid instrument.",
      advantages: "Works on any timeframe. Captures market psychology and momentum directly.",
      disadvantages: "Can be self-fulfilling. Subject to interpretation. Ignores business fundamentals.",
      example: "Stock breaks above 200-day MA on high volume — technical breakout buy signal.",
    },
  },
  {
    id: "sma-vs-ema",
    label: "SMA vs EMA",
    a: {
      name: "Simple Moving Average (SMA)",
      definition: "Average of closing prices over N periods, each period weighted equally.",
      whenToUse: "Identifying long-term support/resistance levels. Less reactive to short-term spikes.",
      advantages: "Smoother — less noise. More reliable support/resistance levels. Widely watched (50/200 SMA).",
      disadvantages: "Slower to react — lags price more than EMA. Can miss early trend changes.",
      example: "Price holding above 200-day SMA = long-term uptrend. A break below is a bearish signal.",
    },
    b: {
      name: "Exponential Moving Average (EMA)",
      definition: "Weighted average where recent prices have exponentially more influence than older prices.",
      whenToUse: "Short-term trading. Faster trend following. MACD uses EMAs (12/26-period).",
      advantages: "Reacts faster to recent price changes. Better for short-term signals.",
      disadvantages: "More noise — prone to whipsaws. Can give false signals in choppy markets.",
      example: "12-day EMA crosses above 26-day EMA — the MACD bullish crossover signal.",
    },
  },
  {
    id: "long-vs-short",
    label: "Long vs Short",
    a: {
      name: "Going Long",
      definition: "Buying an asset with the expectation that it will increase in value.",
      whenToUse: "Bullish outlook. Expecting price appreciation over your holding period.",
      advantages: "Theoretically unlimited profit potential. No borrowing required. Works in bull markets.",
      disadvantages: "Max loss = 100% of capital if stock goes to zero. Requires upside price move.",
      example: "Buy 100 shares of NVDA at $500. Profit if NVDA rises above $500.",
    },
    b: {
      name: "Going Short",
      definition: "Borrowing shares to sell them, hoping to buy them back cheaper later for profit.",
      whenToUse: "Bearish outlook. Hedging a portfolio against market declines.",
      advantages: "Profits from falling prices. Can hedge long positions. Reveals market inefficiencies.",
      disadvantages: "Theoretically unlimited loss (stock can keep rising). Requires margin. Borrow costs.",
      example: "Short 100 NVDA shares at $500. Profit if NVDA falls below $500. Loss if it rises.",
    },
  },
  {
    id: "stop-loss-vs-trailing",
    label: "Fixed Stop vs Trailing Stop",
    a: {
      name: "Fixed Stop-Loss",
      definition: "A predetermined exit price that does not move, set below your entry price.",
      whenToUse: "When you have a specific level (support, key price) that invalidates your thesis.",
      advantages: "Simple. Protects against worst-case loss. No adjustment needed. Predictable max loss.",
      disadvantages: "Does not lock in profits as trade moves in your favor.",
      example: "Buy at $50, fixed stop at $47. Max loss $3/share, regardless of where price goes after.",
    },
    b: {
      name: "Trailing Stop",
      definition: "A dynamic stop that follows price upward (for longs), locking in profits as price rises.",
      whenToUse: "Trending positions where you want to ride momentum and lock in gains.",
      advantages: "Automatically locks in profits. Rides big trends without manual adjustment.",
      disadvantages: "Can get stopped out on normal pullbacks in volatile stocks. More complex to size.",
      example: "Buy at $50, 10% trailing stop. If price hits $60, stop moves to $54. Protects $4 of profit.",
    },
  },
  {
    id: "iv-vs-hv",
    label: "Implied Volatility vs Historical Volatility",
    a: {
      name: "Implied Volatility (IV)",
      definition: "The market's expectation of future price volatility, extracted from current option prices.",
      whenToUse: "Assessing whether options are cheap or expensive. Trading volatility as an asset.",
      advantages: "Forward-looking. Reflects collective market expectation. Drives option premiums.",
      disadvantages: "Not a directional forecast. Can stay elevated for extended periods during uncertainty.",
      example: "IV Rank of 90 = options in top 10% of their 52-week IV range — expensive, favor selling.",
    },
    b: {
      name: "Historical Volatility (HV)",
      definition: "The actual realized standard deviation of price returns over a past period (typically 30 days).",
      whenToUse: "Comparing against IV to assess whether options are over or underpriced.",
      advantages: "Based on actual price data. Objective and quantifiable. Benchmark for IV comparison.",
      disadvantages: "Backward-looking — says nothing about future moves. Can differ widely from IV.",
      example: "If 30-day HV = 20% but IV = 35%, options are rich — market expects more volatility than realized.",
    },
  },
  {
    id: "covered-call-vs-cash-secured-put",
    label: "Covered Call vs Cash-Secured Put",
    a: {
      name: "Covered Call",
      definition: "Selling a call option against 100 shares you already own, collecting premium as income.",
      whenToUse: "You own the stock and are neutral-to-mildly bullish. Want income from your position.",
      advantages: "Immediate premium income. Reduces effective cost basis. Defined downside cushion.",
      disadvantages: "Caps your upside at the strike price. Stock can still fall — premium only partially offsets.",
      example: "Own 100 AAPL shares at $180. Sell the $190 call for $2.50. Premium collected = $250.",
    },
    b: {
      name: "Cash-Secured Put",
      definition: "Selling a put option while holding enough cash to buy the shares if assigned.",
      whenToUse: "Willing to own the stock at a lower price. Want to earn premium while waiting to buy.",
      advantages: "Get paid to wait for a pullback. If not assigned, keep the premium as pure profit.",
      disadvantages: "Stock can fall far below strike — large unrealized loss if assigned at bad price.",
      example: "Sell AAPL $170 put for $2.00 with $17,000 cash set aside. Earn $200 if AAPL stays above $170.",
    },
  },
  {
    id: "growth-vs-value",
    label: "Growth vs Value Investing",
    a: {
      name: "Growth Investing",
      definition: "Buying companies expected to grow revenue and earnings faster than the market average.",
      whenToUse: "Bull markets with low interest rates. Long time horizons with high risk tolerance.",
      advantages: "Massive compounding potential. Ride secular megatrends (AI, cloud, biotech).",
      disadvantages: "High valuation (expensive P/E). Sensitive to rising rates. Can fall 50-80% in bear markets.",
      example: "Buy NVDA at 50x revenue because AI demand is growing 40% annually.",
    },
    b: {
      name: "Value Investing",
      definition: "Buying stocks that appear undervalued relative to their intrinsic value (low P/E, P/B, etc.).",
      whenToUse: "Bear markets or rising rate environments. When seeking margin of safety.",
      advantages: "Built-in margin of safety. Less downside risk. Works when growth stocks are out of favor.",
      disadvantages: "Value traps — cheap stocks can stay cheap. Requires patience (months to years).",
      example: "Buy bank stock at 0.8x book value during a financial panic when fundamentals are solid.",
    },
  },
];

// ─── Table Row ────────────────────────────────────────────────────────────────

const ROWS: Array<{ key: keyof ConceptData; label: string }> = [
  { key: "definition", label: "Definition" },
  { key: "whenToUse", label: "When to use" },
  { key: "advantages", label: "Advantages" },
  { key: "disadvantages", label: "Disadvantages" },
  { key: "example", label: "Example" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function ConceptComparison() {
  const [selectedId, setSelectedId] = useState<string>(COMPARISON_PAIRS[0].id);
  const [isOpen, setIsOpen] = useState(false);

  const selected = COMPARISON_PAIRS.find((p) => p.id === selectedId) ?? COMPARISON_PAIRS[0];

  return (
    <div className="rounded-lg border border-border/50 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <h3 className="text-xs font-semibold">Concept Comparison</h3>
        <span className="text-[10px] text-muted-foreground">
          {COMPARISON_PAIRS.length} pairs
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-left transition-colors hover:bg-accent/30"
          >
            <span className="text-xs font-medium">{selected.label}</span>
            <ChevronDown
              className={[
                "h-3.5 w-3.5 text-muted-foreground transition-transform",
                isOpen ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>

          {isOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-border/50 bg-popover shadow-md">
              {COMPARISON_PAIRS.map((pair) => (
                <button
                  key={pair.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(pair.id);
                    setIsOpen(false);
                  }}
                  className={[
                    "w-full px-3 py-2 text-left text-xs transition-colors first:rounded-t-lg last:rounded-b-lg",
                    pair.id === selectedId
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent/30 text-foreground",
                  ].join(" ")}
                >
                  {pair.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 text-[10px] font-semibold">
          <div className="text-muted-foreground uppercase tracking-wider">Attribute</div>
          <div className="rounded-md bg-blue-500/10 px-2 py-1 text-center text-blue-400">
            {selected.a.name}
          </div>
          <div className="rounded-md bg-violet-500/10 px-2 py-1 text-center text-violet-400">
            {selected.b.name}
          </div>
        </div>

        {/* Comparison rows */}
        <div className="space-y-2">
          {ROWS.map(({ key, label }, i) => (
            <div
              key={key}
              className={[
                "grid grid-cols-[1fr_1fr_1fr] gap-2 rounded-lg p-2",
                i % 2 === 0 ? "bg-muted/10" : "",
              ].join(" ")}
            >
              <div className="text-[10px] font-medium text-muted-foreground self-start pt-0.5">
                {label}
              </div>
              <div className="text-[10px] leading-relaxed text-foreground border-l border-blue-500/20 pl-2">
                {selected.a[key]}
              </div>
              <div className="text-[10px] leading-relaxed text-foreground border-l border-violet-500/20 pl-2">
                {selected.b[key]}
              </div>
            </div>
          ))}
        </div>

        {/* Nav pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {COMPARISON_PAIRS.map((pair) => (
            <button
              key={pair.id}
              type="button"
              onClick={() => setSelectedId(pair.id)}
              className={[
                "rounded-full px-2 py-0.5 text-[9px] font-medium transition-colors",
                pair.id === selectedId
                  ? "bg-primary/15 text-primary"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50",
              ].join(" ")}
            >
              {pair.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
