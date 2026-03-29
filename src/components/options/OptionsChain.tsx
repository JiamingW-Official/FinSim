"use client";

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

const CALL_COLS = ["Bid", "Ask", "Last", "%Chg", "Vol", "OI", "IV", "Δ"] as const;
const PUT_COLS = ["Δ", "IV", "OI", "Vol", "%Chg", "Last", "Ask", "Bid"] as const;

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]" role="table">
        <thead className="sticky top-0 z-10 bg-card">
          <tr className="border-b border-border/50">
            {showCalls && (
              <th
                colSpan={CALL_COLS.length}
                scope="col"
                className="px-2 py-1.5 text-center text-[11px] font-medium text-emerald-500 whitespace-nowrap"
              >
                CALLS
              </th>
            )}
            <th scope="col" className="px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground whitespace-nowrap">Strike</th>
            {showPuts && (
              <th
                colSpan={PUT_COLS.length}
                scope="col"
                className="px-2 py-1.5 text-center text-[11px] font-medium text-red-500 whitespace-nowrap"
              >
                PUTS
              </th>
            )}
          </tr>
          <tr className="border-b border-border/50">
            {showCalls &&
              CALL_COLS.map((col) => (
                <th key={`call-${col}`} scope="col" className="px-2 py-1.5 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                  {col}
                </th>
              ))}
            <th scope="col" className="px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground whitespace-nowrap">$</th>
            {showPuts &&
              PUT_COLS.map((col) => (
                <th key={`put-${col}`} scope="col" className="px-2 py-1.5 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">
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
                "px-2 py-1.5 text-right font-mono tabular-nums cursor-pointer transition-colors",
                isCallSelected && "bg-muted/50",
                extra,
              );
            const putCellCn = (extra?: string) =>
              cn(
                "px-2 py-1.5 text-right font-mono tabular-nums cursor-pointer transition-colors",
                isPutSelected && "bg-muted/50",
                extra,
              );

            return (
              <tr
                key={call.strike}
                className={cn(
                  "border-b border-border/50 transition-colors hover:bg-muted/50",
                  isAtm && "border-y border-orange-500/30",
                )}
              >
                {/* Call side */}
                {showCalls && (
                  <>
                    <td className={callCellCn()} onClick={() => onSelectContract?.(call)}>
                      {call.bid.toFixed(2)}
                    </td>
                    <td
                      className={callCellCn("font-medium")}
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
                        callChg >= 0 ? "font-medium text-emerald-500" : "font-medium text-red-500",
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
                    <td className={callCellCn()} onClick={() => onSelectContract?.(call)}>
                      {(call.iv * 100).toFixed(1)}%
                    </td>
                    <td
                      className={callCellCn("font-medium text-emerald-500")}
                      onClick={() => onSelectContract?.(call)}
                    >
                      {call.greeks.delta.toFixed(2)}
                    </td>
                  </>
                )}

                {/* Strike */}
                <td
                  className={cn(
                    "px-2 py-1.5 text-center font-mono tabular-nums font-medium",
                    isAtm && "text-orange-400",
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
                      className={putCellCn("font-medium text-red-500")}
                      onClick={() => onSelectContract?.(put)}
                    >
                      {put.greeks.delta.toFixed(2)}
                    </td>
                    <td className={putCellCn()} onClick={() => onSelectContract?.(put)}>
                      {(put.iv * 100).toFixed(1)}%
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
                        putChg >= 0 ? "font-medium text-emerald-500" : "font-medium text-red-500",
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
                      className={putCellCn("font-medium")}
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
