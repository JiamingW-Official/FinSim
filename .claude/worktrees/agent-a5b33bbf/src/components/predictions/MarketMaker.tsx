"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Trade {
  id: number;
  side: "yes" | "no";
  price: number; // price the trader accepted (our bid or ask)
  size: number;  // shares taken
  timestamp: number;
  spread: number; // spread earned on this trade
}

interface Position {
  yes: number;  // net YES inventory (positive = long YES)
  no: number;   // net NO inventory  (positive = long NO)
}

interface MarketMakerState {
  yesBid: number;    // price we buy YES at
  yesAsk: number;    // price we sell YES at
  noBid: number;     // price we buy NO at  (= 100 - yesAsk)
  noAsk: number;     // price we sell NO at (= 100 - yesBid)
  midpoint: number;  // simulated true probability
  trades: Trade[];
  position: Position;
  cashPnl: number;   // realized spread + mark-to-market
  spreadEarned: number;
  inventoryRisk: number; // abs(yes - no) * midpoint / 100
  sessionActive: boolean;
  tradeCount: number;
}

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Educational callouts ──────────────────────────────────────────────────────

const EDUCATIONAL_NOTES = [
  "Market makers earn the spread between bid and ask prices, but bear inventory risk if the market moves against their position.",
  "A tighter spread attracts more order flow but leaves less profit per trade. A wider spread earns more per fill but traders may go elsewhere.",
  "Inventory risk arises when you accumulate a large one-sided position. If the market resolves against that side, you lose despite earning spreads.",
  "Real market makers constantly adjust their quotes based on their current inventory — widening the spread on the side they are already long.",
  "The bid-ask spread is the market maker's compensation for providing liquidity and bearing the risk of adverse price moves.",
  "Skilled market makers skew their quotes: if they hold too much YES inventory they lower their YES bid to discourage buying and raise the YES ask to encourage selling.",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function formatPnl(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PriceSlider({
  label,
  value,
  min,
  max,
  step,
  color,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-mono font-semibold tabular-nums", color)}>
          {value}¢
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
    </div>
  );
}

function TradeRow({ trade }: { trade: Trade }) {
  const age = Math.floor((Date.now() - trade.timestamp) / 1000);
  return (
    <div className="flex items-center gap-2 py-1 text-[10px] font-mono tabular-nums">
      <span className="w-8 text-muted-foreground">{age}s</span>
      <span
        className={cn(
          "w-7 rounded px-1 py-0.5 text-center text-[9px] font-semibold uppercase",
          trade.side === "yes"
            ? "bg-green-500/10 text-green-400"
            : "bg-red-500/10 text-red-400",
        )}
      >
        {trade.side}
      </span>
      <span className="w-12 text-foreground">{trade.price}¢ × {trade.size}</span>
      <span className="flex-1 text-right text-green-400">+{trade.spread.toFixed(2)}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const DEFAULT_MIDPOINT = 55;

export function MarketMaker() {
  const rngRef = useRef(mulberry32(Date.now()));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [noteIndex, setNoteIndex] = useState(0);

  const [state, setState] = useState<MarketMakerState>({
    yesBid: 52,
    yesAsk: 58,
    noBid: 42,
    noAsk: 48,
    midpoint: DEFAULT_MIDPOINT,
    trades: [],
    position: { yes: 0, no: 0 },
    cashPnl: 0,
    spreadEarned: 0,
    inventoryRisk: 0,
    sessionActive: false,
    tradeCount: 0,
  });

  // ── Derived spread ─────────────────────────────────────────
  const spread = state.yesAsk - state.yesBid;

  // ── Simulated trader arrival ───────────────────────────────
  const simulateTrade = useCallback(() => {
    setState((prev) => {
      const rng = rngRef.current;
      // Random walk midpoint slightly
      const midDelta = (rng() - 0.5) * 4;
      const newMid = clamp(prev.midpoint + midDelta, 10, 90);

      // Trader decides to buy or sell based on mid vs. our prices
      // They buy YES (take our ask) if newMid > yesAsk — arbitrage logic
      // They sell YES (take our bid) if newMid < yesBid
      // Otherwise they may still trade based on random demand (liquidity seekers)
      const r = rng();
      let side: "yes" | "no" | null = null;
      let tradePrice = 0;
      let traderBuying = false;

      if (newMid > prev.yesAsk && r < 0.85) {
        // Informed buyer: mid > our ask → we under-priced, they buy YES from us
        side = "yes";
        tradePrice = prev.yesAsk;
        traderBuying = true;
      } else if (newMid < prev.yesBid && r < 0.85) {
        // Informed seller: mid < our bid → they sell YES to us
        side = "yes";
        tradePrice = prev.yesBid;
        traderBuying = false;
      } else if (r < 0.45) {
        // Liquidity-seeking trader — random side
        if (rng() > 0.5) {
          side = "yes";
          tradePrice = rng() > 0.5 ? prev.yesAsk : prev.yesBid;
          traderBuying = tradePrice === prev.yesAsk;
        } else {
          side = "no";
          tradePrice = rng() > 0.5 ? prev.noAsk : prev.noBid;
          traderBuying = tradePrice === prev.noAsk;
        }
      }

      if (side === null) {
        return { ...prev, midpoint: newMid };
      }

      const size = Math.floor(rng() * 8) + 1; // 1–8 shares
      // Spread earned on this trade
      const halfSpread = spread / 2;
      const tradeSpread = halfSpread * size;

      // Position impact: if trader buys YES from us, our inventory goes +YES short
      const positionDelta = { yes: 0, no: 0 };
      if (side === "yes") {
        positionDelta.yes += traderBuying ? -size : size; // we sold or bought YES
      } else {
        positionDelta.no += traderBuying ? -size : size;
      }

      const newPosition = {
        yes: prev.position.yes + positionDelta.yes,
        no: prev.position.no + positionDelta.no,
      };

      // Inventory mark-to-market risk: net YES exposure × price movement
      const inventoryRisk = Math.abs(newPosition.yes) * (newMid / 100) +
        Math.abs(newPosition.no) * ((100 - newMid) / 100);

      const newTrade: Trade = {
        id: prev.tradeCount + 1,
        side,
        price: tradePrice,
        size,
        timestamp: Date.now(),
        spread: tradeSpread,
      };

      // Cash PnL: spread earned minus inventory mark-to-market
      const newSpreadEarned = prev.spreadEarned + tradeSpread;
      // Simplified MTM: position change × midpoint move
      const midMove = newMid - prev.midpoint;
      const inventoryMtm = newPosition.yes * (midMove / 100) -
        newPosition.no * (midMove / 100);
      const newCashPnl = prev.cashPnl + tradeSpread + inventoryMtm;

      return {
        ...prev,
        midpoint: newMid,
        trades: [newTrade, ...prev.trades].slice(0, 30),
        position: newPosition,
        cashPnl: newCashPnl,
        spreadEarned: newSpreadEarned,
        inventoryRisk,
        tradeCount: prev.tradeCount + 1,
      };
    });
  }, [spread]);

  // Start / stop session
  const toggleSession = useCallback(() => {
    setState((prev) => {
      if (prev.sessionActive) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        return { ...prev, sessionActive: false };
      } else {
        return { ...prev, sessionActive: true };
      }
    });
  }, []);

  useEffect(() => {
    if (state.sessionActive) {
      timerRef.current = setInterval(simulateTrade, 1500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.sessionActive, simulateTrade]);

  const resetSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState({
      yesBid: 52,
      yesAsk: 58,
      noBid: 42,
      noAsk: 48,
      midpoint: DEFAULT_MIDPOINT,
      trades: [],
      position: { yes: 0, no: 0 },
      cashPnl: 0,
      spreadEarned: 0,
      inventoryRisk: 0,
      sessionActive: false,
      tradeCount: 0,
    });
    rngRef.current = mulberry32(Date.now());
  }, []);

  // Keep noBid/noAsk in sync with yes prices
  const setYesBid = useCallback((v: number) => {
    setState((prev) => {
      const bid = clamp(v, 5, prev.yesAsk - 1);
      return { ...prev, yesBid: bid, noBid: 100 - prev.yesAsk, noAsk: 100 - bid };
    });
  }, []);

  const setYesAsk = useCallback((v: number) => {
    setState((prev) => {
      const ask = clamp(v, prev.yesBid + 1, 95);
      return { ...prev, yesAsk: ask, noBid: 100 - ask, noAsk: 100 - prev.yesBid };
    });
  }, []);

  const inventoryImbalance = state.position.yes - state.position.no;
  const inventoryColor =
    Math.abs(inventoryImbalance) > 10
      ? "text-red-400"
      : Math.abs(inventoryImbalance) > 5
        ? "text-amber-400"
        : "text-green-400";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Market Maker Simulator</h2>
          <p className="text-[11px] text-muted-foreground">
            Set bid/ask prices. Simulated traders take your quotes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetSession}
            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3" />
            Reset
          </button>
          <button
            onClick={toggleSession}
            className={cn(
              "rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors",
              state.sessionActive
                ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                : "bg-primary/15 text-primary hover:bg-primary/25",
            )}
          >
            {state.sessionActive ? "Pause" : "Start Session"}
          </button>
        </div>
      </div>

      {/* Simulated market midpoint */}
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            True market midpoint (hidden from you in real markets)
          </span>
          <span className="font-mono text-sm font-bold text-foreground tabular-nums">
            {state.midpoint.toFixed(1)}¢
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
          <div
            className="h-full rounded-full bg-primary/50 transition-all"
            style={{ width: `${state.midpoint}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          In live markets this is unknown. You profit when your spread straddles the true value.
        </p>
      </div>

      {/* Quote controls */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Your Quotes
        </h3>
        <div className="mb-4 space-y-4">
          <PriceSlider
            label="YES Bid (you buy YES at)"
            value={state.yesBid}
            min={5}
            max={state.yesAsk - 1}
            step={1}
            color="text-green-400"
            onChange={setYesBid}
          />
          <PriceSlider
            label="YES Ask (you sell YES at)"
            value={state.yesAsk}
            min={state.yesBid + 1}
            max={95}
            step={1}
            color="text-green-400"
            onChange={setYesAsk}
          />
        </div>

        {/* Derived NO prices */}
        <div className="flex items-center gap-2 rounded bg-muted/30 px-3 py-2 text-[11px]">
          <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">
            Implied NO prices:
          </span>
          <span className="font-mono font-semibold text-red-400 tabular-nums">
            {state.noBid}¢ bid
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="font-mono font-semibold text-red-400 tabular-nums">
            {state.noAsk}¢ ask
          </span>
          <div className="flex-1" />
          <span className="text-muted-foreground">Spread:</span>
          <span
            className={cn(
              "font-mono font-semibold tabular-nums",
              spread <= 4 ? "text-green-400" : spread <= 8 ? "text-amber-400" : "text-red-400",
            )}
          >
            {spread}¢
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          {
            label: "Cash P&L",
            value: formatPnl(state.cashPnl),
            color: state.cashPnl >= 0 ? "text-green-400" : "text-red-400",
          },
          {
            label: "Spread Earned",
            value: `+${state.spreadEarned.toFixed(2)}`,
            color: "text-green-400",
          },
          {
            label: "Trades",
            value: String(state.tradeCount),
            color: "text-foreground",
          },
          {
            label: "Inventory Risk",
            value: state.inventoryRisk.toFixed(2),
            color: state.inventoryRisk > 5 ? "text-red-400" : "text-muted-foreground",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-3 py-2">
            <div className="text-[9px] text-muted-foreground">{label}</div>
            <div className={cn("font-mono tabular-nums text-sm font-semibold", color)}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Position */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Inventory Position
          </h3>
          <span className={cn("text-[11px] font-semibold", inventoryColor)}>
            Net: {inventoryImbalance > 0 ? "+" : ""}{inventoryImbalance} shares
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-green-400">
                <TrendingUp className="h-3 w-3" /> YES inventory
              </span>
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {state.position.yes}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  state.position.yes > 0 ? "bg-green-500/50" : "bg-red-500/50",
                )}
                style={{
                  width: `${Math.min(100, Math.abs(state.position.yes) * 5)}%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-red-400">
                <TrendingDown className="h-3 w-3" /> NO inventory
              </span>
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {state.position.no}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  state.position.no > 0 ? "bg-green-500/50" : "bg-red-500/50",
                )}
                style={{
                  width: `${Math.min(100, Math.abs(state.position.no) * 5)}%`,
                }}
              />
            </div>
          </div>
        </div>
        {Math.abs(inventoryImbalance) > 8 && (
          <div className="mt-2 flex items-start gap-1.5 rounded bg-amber-500/10 px-2.5 py-2 text-[10px] text-amber-400">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            High inventory imbalance. Consider skewing your quotes to attract the opposite side.
          </div>
        )}
      </div>

      {/* Trade feed */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Trade Feed
        </h3>
        {state.trades.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-muted-foreground">
            Start a session to see incoming trades
          </p>
        ) : (
          <div className="max-h-48 overflow-y-auto">
            <div className="mb-1 grid grid-cols-4 gap-2 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
              <span>Age</span>
              <span>Side</span>
              <span>Price × Size</span>
              <span className="text-right">Spread</span>
            </div>
            {state.trades.map((t) => (
              <TradeRow key={t.id} trade={t} />
            ))}
          </div>
        )}
      </div>

      {/* Educational note */}
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Market Making Insight
            </span>
          </div>
          <button
            onClick={() => setNoteIndex((i) => (i + 1) % EDUCATIONAL_NOTES.length)}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Next tip
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {EDUCATIONAL_NOTES[noteIndex]}
        </p>
      </div>
    </div>
  );
}
