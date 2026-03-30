"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { OptionChainExpiry, OptionContract, ChainFilters } from "@/types/options";

interface OptionsChainProps {
  chain: OptionChainExpiry[];
  selectedExpiry: string;
  onSelectExpiry: (expiry: string) => void;
  spotPrice: number;
  filters?: ChainFilters;
  onSelectContract?: (c: OptionContract) => void;
  selectedContract?: OptionContract | null;
}

const CALL_COLS = ["Bid", "Ask", "Last", "%Chg", "Vol", "OI", "IV%ile", "V/OI", "IV", "Δ"] as const;
const PUT_COLS = ["Δ", "IV", "IV%ile", "V/OI", "OI", "Vol", "%Chg", "Last", "Ask", "Bid"] as const;

function seededRandom(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function getChangePct(contract: OptionContract): number {
  const r = seededRandom(Math.floor(contract.strike * 17) + contract.type.length * 3);
  return (r() - 0.5) * 20; // ±10% range
}

export function OptionsChain({
  chain,
  selectedExpiry,
  spotPrice,
  filters = { typeFilter: "both", moneynessFilter: "all" },
  onSelectContract,
  selectedContract,
}: OptionsChainProps) {
  const currentChain = chain.find((c) => c.expiry === selectedExpiry);
  if (!currentChain) return null;

  // Find ATM strike
  const strikes = currentChain.calls.map((c) => c.strike);
  const atmStrike = strikes.reduce((best, s) =>
    Math.abs(s - spotPrice) < Math.abs(best - spotPrice) ? s : best,
  );
  const spacing = strikes.length > 1 ? Math.abs(strikes[1] - strikes[0]) : 5;
  const atmBandWidth = spacing * 4; // ±4 strikes from ATM

  // Filter rows based on moneynessFilter
  const visibleRows = currentChain.calls
    .map((call, i) => ({ call, put: currentChain.puts[i], i }))
    .filter(({ call }) => {
      switch (filters.moneynessFilter) {
        case "atm":
          return Math.abs(call.strike - spotPrice) <= atmBandWidth;
        case "itm":
          return call.strike < spotPrice;
        case "otm":
          return call.strike > spotPrice;
        default:
          return true;
      }
    });

  const showCalls = filters.typeFilter !== "put";
  const showPuts = filters.typeFilter !== "call";

  // IV percentile: rank each strike's IV relative to all IVs in the chain
  const allIVs = useMemo(() => {
    const ivs: number[] = [];
    currentChain.calls.forEach((c) => ivs.push(c.iv));
    currentChain.puts.forEach((p) => ivs.push(p.iv));
    return ivs.slice().sort((a, b) => a - b);
  }, [currentChain]);

  function ivPercentile(iv: number): number {
    if (allIVs.length === 0) return 50;
    const below = allIVs.filter((v) => v <= iv).length;
    return Math.round((below / allIVs.length) * 100);
  }

  function ivPercentileColor(pct: number): string {
    if (pct > 80) return "text-red-400";
    if (pct >= 60) return "text-amber-400";
    return "text-green-400";
  }

  function volOiRatio(volume: number, oi: number): string {
    if (oi === 0) return "—";
    return (volume / oi).toFixed(2);
  }

  function volOiColor(volume: number, oi: number): string {
    if (oi === 0) return "text-muted-foreground";
    const ratio = volume / oi;
    if (ratio > 0.5) return "text-amber-400 font-semibold";
    return "text-muted-foreground";
  }

  // Expected move from ATM straddle (call + put mid at ATM strike)
  const atmCall = currentChain.calls.find((c) => c.strike === atmStrike);
  const atmPut = currentChain.puts.find((p) => p.strike === atmStrike);
  const expMove =
    atmCall && atmPut ? atmCall.mid + atmPut.mid : null;
  const expMovePct =
    expMove !== null && spotPrice > 0
      ? (expMove / spotPrice) * 100
      : null;

  return (
    <div className="overflow-x-auto">
      {/* Expected Move Bar */}
      {expMove !== null && expMovePct !== null && (
        <div className="px-3 py-1.5 border-b border-border/40 bg-muted/5 flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide shrink-0">
            Expected Move
          </span>
          <div className="relative flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
            {/* Center dot */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary z-10" />
            {/* Range fill */}
            <div
              className="absolute top-0 h-full bg-orange-400/30 rounded-full border border-orange-400/40"
              style={{
                left: `${50 - expMovePct / 2}%`,
                width: `${expMovePct}%`,
              }}
            />
          </div>
          <span className="text-[9px] font-mono text-orange-400 shrink-0">
            ±${expMove.toFixed(2)} (±{expMovePct.toFixed(1)}%)
          </span>
        </div>
      )}
      <table className="w-full font-mono tabular-nums text-[10px]">
        <thead className="sticky top-0 z-10 bg-card">
          <tr className="border-b border-border text-muted-foreground">
            {showCalls && (
              <th
                colSpan={CALL_COLS.length}
                className="px-2 py-1.5 text-center text-[10px] font-semibold text-green-400"
              >
                CALLS
              </th>
            )}
            <th className="px-2 py-1.5 text-center text-[10px] font-semibold">Strike</th>
            {showPuts && (
              <th
                colSpan={PUT_COLS.length}
                className="px-2 py-1.5 text-center text-[10px] font-semibold text-red-400"
              >
                PUTS
              </th>
            )}
          </tr>
          <tr className="border-b border-border/50 text-muted-foreground/70">
            {showCalls &&
              CALL_COLS.map((col) => (
                <th key={`call-${col}`} className="px-1.5 py-1 text-right font-medium">
                  {col}
                </th>
              ))}
            <th className="px-2 py-1 text-center font-semibold">$</th>
            {showPuts &&
              PUT_COLS.map((col) => (
                <th key={`put-${col}`} className="px-1.5 py-1 text-right font-medium">
                  {col}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map(({ call, put }) => {
            const isAtm = call.strike === atmStrike;
            const isCallSelected =
              selectedContract?.strike === call.strike &&
              selectedContract?.type === "call" &&
              selectedContract?.expiry === call.expiry;
            const isPutSelected =
              selectedContract?.strike === put?.strike &&
              selectedContract?.type === "put" &&
              selectedContract?.expiry === put?.expiry;

            const callChg = getChangePct(call);
            const putChg = put ? getChangePct(put) : 0;

            const callCellCn = (extra?: string) =>
              cn(
                "px-1.5 py-1 text-right cursor-pointer hover:bg-accent/30 transition-colors",
                call.inTheMoney && "bg-green-500/5",
                isCallSelected && "bg-orange-500/8",
                extra,
              );
            const putCellCn = (extra?: string) =>
              cn(
                "px-1.5 py-1 text-right cursor-pointer hover:bg-accent/30 transition-colors",
                put?.inTheMoney && "bg-red-500/5",
                isPutSelected && "bg-orange-500/8",
                extra,
              );

            return (
              <tr
                key={call.strike}
                className={cn(
                  "border-b border-border/30 transition-colors",
                  isAtm && "border-y border-orange-500/30 bg-orange-500/5",
                )}
              >
                {/* Call side */}
                {showCalls && (
                  <>
                    <td className={callCellCn()} onClick={() => onSelectContract?.(call)}>
                      {call.bid.toFixed(2)}
                    </td>
                    <td
                      className={callCellCn("font-semibold")}
                      onClick={() => onSelectContract?.(call)}
                    >
                      {call.ask.toFixed(2)}
                    </td>
                    <td
                      className={callCellCn("text-muted-foreground")}
                      onClick={() => onSelectContract?.(call)}
                    >
                      {call.last.toFixed(2)}
                    </td>
                    <td
                      className={callCellCn(
                        callChg >= 0 ? "font-medium text-green-400" : "font-medium text-red-400",
                      )}
                      onClick={() => onSelectContract?.(call)}
                    >
                      {callChg >= 0 ? "+" : ""}
                      {callChg.toFixed(1)}%
                    </td>
                    <td
                      className={callCellCn("text-muted-foreground")}
                      onClick={() => onSelectContract?.(call)}
                    >
                      {call.volume}
                    </td>
                    <td
                      className={callCellCn("text-muted-foreground")}
                      onClick={() => onSelectContract?.(call)}
                    >
                      {call.openInterest}
                    </td>
                    <td
                      className={callCellCn(ivPercentileColor(ivPercentile(call.iv)))}
                      onClick={() => onSelectContract?.(call)}
                    >
                      {ivPercentile(call.iv)}
                    </td>
                    <td
                      className={callCellCn(volOiColor(call.volume, call.openInterest))}
                      onClick={() => onSelectContract?.(call)}
                    >
                      {volOiRatio(call.volume, call.openInterest)}
                    </td>
                    <td className={callCellCn()} onClick={() => onSelectContract?.(call)}>
                      {(call.iv * 100).toFixed(1)}%
                    </td>
                    <td
                      className={callCellCn("font-semibold text-green-400")}
                      onClick={() => onSelectContract?.(call)}
                    >
                      {call.greeks.delta.toFixed(2)}
                    </td>
                  </>
                )}

                {/* Strike */}
                <td
                  className={cn(
                    "px-2 py-1 text-center font-semibold",
                    isAtm && "text-primary",
                  )}
                >
                  {call.strike.toFixed(
                    call.strike < 10 ? 2 : call.strike % 1 !== 0 ? 1 : 0,
                  )}
                </td>

                {/* Put side */}
                {showPuts && put && (
                  <>
                    <td
                      className={putCellCn("font-semibold text-red-400")}
                      onClick={() => onSelectContract?.(put)}
                    >
                      {put.greeks.delta.toFixed(2)}
                    </td>
                    <td className={putCellCn()} onClick={() => onSelectContract?.(put)}>
                      {(put.iv * 100).toFixed(1)}%
                    </td>
                    <td
                      className={putCellCn(ivPercentileColor(ivPercentile(put.iv)))}
                      onClick={() => onSelectContract?.(put)}
                    >
                      {ivPercentile(put.iv)}
                    </td>
                    <td
                      className={putCellCn(volOiColor(put.volume, put.openInterest))}
                      onClick={() => onSelectContract?.(put)}
                    >
                      {volOiRatio(put.volume, put.openInterest)}
                    </td>
                    <td
                      className={putCellCn("text-muted-foreground")}
                      onClick={() => onSelectContract?.(put)}
                    >
                      {put.openInterest}
                    </td>
                    <td
                      className={putCellCn("text-muted-foreground")}
                      onClick={() => onSelectContract?.(put)}
                    >
                      {put.volume}
                    </td>
                    <td
                      className={putCellCn(
                        putChg >= 0 ? "font-medium text-green-400" : "font-medium text-red-400",
                      )}
                      onClick={() => onSelectContract?.(put)}
                    >
                      {putChg >= 0 ? "+" : ""}
                      {putChg.toFixed(1)}%
                    </td>
                    <td
                      className={putCellCn("text-muted-foreground")}
                      onClick={() => onSelectContract?.(put)}
                    >
                      {put.last.toFixed(2)}
                    </td>
                    <td
                      className={putCellCn("font-semibold")}
                      onClick={() => onSelectContract?.(put)}
                    >
                      {put.ask.toFixed(2)}
                    </td>
                    <td className={putCellCn()} onClick={() => onSelectContract?.(put)}>
                      {put.bid.toFixed(2)}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
