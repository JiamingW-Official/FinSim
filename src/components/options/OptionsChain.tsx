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

const TH_RIGHT =
 "text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 px-2 py-3 text-right font-medium border-b border-border/60 whitespace-nowrap";
const TH_LEFT =
 "text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 px-2 py-3 text-left font-medium border-b border-border/60 whitespace-nowrap";

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
 <div className="overflow-auto">
 <table className="w-full text-xs border-collapse" role="table">
 <thead className="sticky top-0 z-10 bg-card">
 {/* Section headers: CALLS / (strike spacer) / PUTS */}
 <tr>
 {showCalls && (
 <th
 colSpan={CALL_COLS.length}
 scope="col"
 className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/30 py-2 text-center border-b border-border/40 bg-emerald-500/[0.03]"
 >
 CALLS
 </th>
 )}
 <th
 scope="col"
 className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/50 font-semibold text-center py-2 border-b border-border/40"
 />
 {showPuts && (
 <th
 colSpan={PUT_COLS.length}
 scope="col"
 className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/30 py-2 text-center border-b border-border/40 bg-red-500/[0.03]"
 >
 PUTS
 </th>
 )}
 </tr>
 {/* Column headers */}
 <tr>
 {showCalls &&
 CALL_COLS.map((col) => (
 <th key={`call-${col}`} scope="col" className={TH_RIGHT}>
 {col}
 </th>
 ))}
 <th
 scope="col"
 className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/50 font-semibold text-center px-3 py-3 border-b border-border/60 whitespace-nowrap"
 >
 Strike
 </th>
 {showPuts &&
 PUT_COLS.map((col) => (
 <th key={`put-${col}`} scope="col" className={TH_LEFT}>
 {col}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-border/40">
 {visibleRows.map(({ call, put }) => {
 const isAtm = call.strike === atmStrike;
 // ITM: calls below ATM, puts above ATM
 const isCallItm = call.strike < atmStrike;
 const isPutItm = call.strike > atmStrike;

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

 const callCellCn = (...extra: string[]) =>
 cn(
 "px-2 py-2.5 text-right font-mono tabular-nums text-xs text-foreground/80 cursor-pointer transition-colors",
 isCallItm && "bg-muted/10",
 isCallSelected && "bg-primary/10",
 ...extra,
 );
 const putCellCn = (...extra: string[]) =>
 cn(
 "px-2 py-2.5 text-right font-mono tabular-nums text-xs text-foreground/80 cursor-pointer transition-colors",
 isPutItm && "bg-muted/10",
 isPutSelected && "bg-primary/10",
 ...extra,
 );

 return (
 <tr
 key={call.strike}
 className={cn(
 "hover:bg-foreground/[0.03] cursor-pointer transition-colors",
 isAtm && "border-y border-primary/20",
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
 className={callCellCn("text-muted-foreground/60")}
 onClick={() => onSelectContract?.(call)}
 >
 {call.last.toFixed(2)}
 </td>
 <td
 className={callCellCn(
 callChg >= 0 ? "text-emerald-400" : "text-red-400",
 )}
 onClick={() => onSelectContract?.(call)}
 >
 {callChg >= 0 ? "+" : ""}
 {callChg.toFixed(1)}%
 </td>
 <td
 className={callCellCn("text-muted-foreground/60")}
 onClick={() => onSelectContract?.(call)}
 >
 {call.volume}
 </td>
 <td
 className={callCellCn("text-muted-foreground/60")}
 onClick={() => onSelectContract?.(call)}
 >
 {call.openInterest}
 </td>
 <td
 className={callCellCn("text-amber-400/80")}
 onClick={() => onSelectContract?.(call)}
 >
 {(call.iv * 100).toFixed(1)}%
 </td>
 <td
 className={callCellCn("text-emerald-400/80")}
 onClick={() => onSelectContract?.(call)}
 >
 {call.greeks.delta.toFixed(2)}
 </td>
 </>
 )}

 {/* Strike — center axis, visually dominant */}
 <td
 className={cn(
 "px-3 py-2.5 text-center font-mono font-bold text-sm border-x border-border/30 transition-colors",
 isAtm
 ? "text-primary bg-primary/5 border-l-2 border-l-primary/60"
 : "text-foreground/70 bg-muted/10",
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
 className={putCellCn("text-red-400/80")}
 onClick={() => onSelectContract?.(put)}
 >
 {put.greeks.delta.toFixed(2)}
 </td>
 <td
 className={putCellCn("text-amber-400/80")}
 onClick={() => onSelectContract?.(put)}
 >
 {(put.iv * 100).toFixed(1)}%
 </td>
 <td
 className={putCellCn("text-muted-foreground/60")}
 onClick={() => onSelectContract?.(put)}
 >
 {put.openInterest}
 </td>
 <td
 className={putCellCn("text-muted-foreground/60")}
 onClick={() => onSelectContract?.(put)}
 >
 {put.volume}
 </td>
 <td
 className={putCellCn(
 putChg >= 0 ? "text-emerald-400" : "text-red-400",
 )}
 onClick={() => onSelectContract?.(put)}
 >
 {putChg >= 0 ? "+" : ""}
 {putChg.toFixed(1)}%
 </td>
 <td
 className={putCellCn("text-muted-foreground/60")}
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
