"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { UnusualActivityItem, OptionContract, OptionChainExpiry } from "@/types/options";

// Silence unused import warning — OptionChainExpiry is re-exported for consumers
type _OptionChainExpiry = OptionChainExpiry;

// ── Props ─────────────────────────────────────────────────────────────────────

interface UnusualActivityFeedProps {
 items: UnusualActivityItem[];
 onSelectContract: (contract: OptionContract) => void;
}

// ── Helper: build a synthetic OptionContract from an activity item ────────────

function itemToContract(item: UnusualActivityItem): OptionContract {
 return {
 ticker: item.ticker,
 type: item.type,
 strike: item.strike,
 expiry: item.expiry,
 daysToExpiry: item.dte,
 style: "american",
 bid: item.bid,
 ask: item.ask,
 mid: (item.bid + item.ask) / 2,
 last: item.price,
 iv: 0.3,
 volume: item.size,
 openInterest: item.size * 3,
 greeks: {
 delta: 0,
 gamma: 0,
 theta: 0,
 vega: 0,
 rho: 0,
 vanna: 0,
 charm: 0,
 vomma: 0,
 speed: 0,
 },
 inTheMoney: false,
 };
}

// ── Format helpers ────────────────────────────────────────────────────────────

function formatPremium(n: number): string {
 if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
 if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
 return `$${n.toFixed(0)}`;
}

function relTime(ts: number): string {
 const mins = Math.floor((Date.now() - ts) / 60000);
 if (mins < 1) return "just now";
 if (mins < 60) return `${mins}m ago`;
 return `${Math.floor(mins / 60)}h ago`;
}

// ── Filter state types ────────────────────────────────────────────────────────

type ComboFilter = "all" | "calls" | "puts" | "sweeps" | "blocks" | "bullish" | "bearish";

// ── Toggle button (matches ChainFiltersBar style) ─────────────────────────────

function ToggleButton({
 active,
 onClick,
 children,
}: {
 active: boolean;
 onClick: () => void;
 children: React.ReactNode;
}) {
 return (
 <button
 onClick={onClick}
 className={cn(
 "rounded px-2 py-1 text-xs font-medium transition-colors",
 active
 ? "border border-orange-500/30 bg-orange-500/15 text-orange-400"
 : "text-muted-foreground hover:text-foreground",
 )}
 >
 {children}
 </button>
 );
}

// ── Activity icon (simple SVG, no external dep) ───────────────────────────────

function ActivityIcon({ className }: { className?: string }) {
 return (
 <svg
 xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth={2}
 strokeLinecap="round"
 strokeLinejoin="round"
 className={className}
 >
 <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
 </svg>
 );
}

// ── Copy icon ─────────────────────────────────────────────────────────────────

function CopyIcon({ className }: { className?: string }) {
 return (
 <svg
 xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth={2}
 strokeLinecap="round"
 strokeLinejoin="round"
 className={className}
 >
 <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
 <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
 </svg>
 );
}

// ── Order type badge ──────────────────────────────────────────────────────────

function OrderTypeBadge({ orderType }: { orderType: UnusualActivityItem["orderType"] }) {
 if (orderType === "floor") {
 return (
 <span className="rounded bg-amber-500/15 px-1 py-0.5 text-[11px] font-semibold text-amber-400">
 FLOOR
 </span>
 );
 }
 if (orderType === "sweep") {
 // SWEEP = split across exchanges (orange)
 return (
 <span className="rounded bg-orange-500/15 px-1 py-0.5 text-[11px] font-semibold text-orange-400">
 SWEEP
 </span>
 );
 }
 // Normal → check if large single-venue (BLOCK = purple)
 return (
 <span className="rounded bg-orange-500/15 px-1 py-0.5 text-[11px] font-semibold text-orange-400">
 BLOCK
 </span>
 );
}

// ── Row color class based on sentiment ───────────────────────────────────────

function rowColorClass(_item: UnusualActivityItem): string {
 return "border-b border-border hover:bg-muted/50";
}

// ── Main Component ────────────────────────────────────────────────────────────

export function UnusualActivityFeed({
 items,
 onSelectContract,
}: UnusualActivityFeedProps) {
 const [comboFilter, setComboFilter] = useState<ComboFilter>("all");
 const [copiedId, setCopiedId] = useState<string | null>(null);

 // Apply combined filter
 const filtered = items.filter((item) => {
 if (comboFilter === "calls") return item.type === "call";
 if (comboFilter === "puts") return item.type === "put";
 if (comboFilter === "sweeps") return item.orderType === "sweep";
 if (comboFilter === "blocks") return item.orderType === "normal"; // normal = block (large single-venue)
 if (comboFilter === "bullish") return item.sentiment === "bullish";
 if (comboFilter === "bearish") return item.sentiment === "bearish";
 return true;
 });

 const handleCopyAlert = useCallback(
 (e: React.MouseEvent, item: UnusualActivityItem) => {
 e.stopPropagation();
 const text = `${item.ticker} $${item.strike}${item.type === "call" ? "C" : "P"} ${item.expiry} — ${formatPremium(item.premium)} ${item.sentiment.toUpperCase()} ${item.orderType.toUpperCase()}`;
 navigator.clipboard.writeText(text).then(() => {
 setCopiedId(item.id);
 setTimeout(() => setCopiedId(null), 1500);
 });
 },
 [],
 );

 const filterOptions: { value: ComboFilter; label: string }[] = [
 { value: "all", label: "All" },
 { value: "calls", label: "Calls" },
 { value: "puts", label: "Puts" },
 { value: "sweeps", label: "Sweeps" },
 { value: "blocks", label: "Blocks" },
 { value: "bullish", label: "Bullish" },
 { value: "bearish", label: "Bearish" },
 ];

 return (
 <div className="flex h-full flex-col">
 {/* Filter bar */}
 <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border px-3 py-1.5">
 <div className="flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
 {filterOptions.map(({ value, label }) => (
 <ToggleButton
 key={value}
 active={comboFilter === value}
 onClick={() => setComboFilter(value)}
 >
 {label}
 </ToggleButton>
 ))}
 </div>
 <span className="ml-auto text-xs text-muted-foreground">
 {filtered.length} alerts
 </span>
 </div>

 {/* Table */}
 <div className="flex-1 overflow-auto">
 {filtered.length === 0 ? (
 <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
 <ActivityIcon className="h-8 w-8 opacity-30" />
 <span className="text-[11px]">No unusual activity detected</span>
 </div>
 ) : (
 <table className="w-full border-collapse text-[11px]">
 <thead className="sticky top-0 z-10 bg-card">
 <tr className="border-b border-border">
 {[
 { col: "Time", align: "text-left" },
 { col: "Ticker", align: "text-left" },
 { col: "Exp", align: "text-right" },
 { col: "DTE", align: "text-right" },
 { col: "Strike", align: "text-right" },
 { col: "C/P", align: "text-left" },
 { col: "Side", align: "text-left" },
 { col: "Sentiment", align: "text-left" },
 { col: "Type", align: "text-left" },
 { col: "Size", align: "text-right" },
 { col: "Price", align: "text-right" },
 { col: "Premium", align: "text-right" },
 { col: "Prem/OI", align: "text-right" },
 { col: "Bid", align: "text-right" },
 { col: "Ask", align: "text-right" },
 { col: "", align: "text-left" },
 ].map(({ col, align }, i) => (
 <th
 key={`${col}-${i}`}
 className={cn("px-3 py-2 text-[11px] font-medium text-muted-foreground", align)}
 >
 {col}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {filtered.map((item) => {
 const isBullish = item.sentiment === "bullish";
 const isBearish = item.sentiment === "bearish";
 // Prem/OI ratio: total premium / (openInterest * contract_size * price)
 const openInterest = item.size * 3; // synthetic OI matches itemToContract
 const oiValue = openInterest * 100 * item.price;
 const premOIRatio = oiValue > 0 ? item.premium / oiValue : 0;
 const premOIHigh = premOIRatio > 0.5;

 return (
 <tr
 key={item.id}
 onClick={() => onSelectContract(itemToContract(item))}
 className={cn(
 "cursor-pointer transition-colors",
 rowColorClass(item),
 )}
 >
 {/* Time */}
 <td className="px-3 py-2 text-muted-foreground">
 {relTime(item.timestamp)}
 </td>

 {/* Ticker */}
 <td className="px-3 py-2 font-medium">
 {item.ticker}
 </td>

 {/* Exp */}
 <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
 {item.expiry.slice(5)}
 </td>

 {/* DTE */}
 <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
 {item.dte}D
 </td>

 {/* Strike */}
 <td className="px-3 py-2 text-right font-mono tabular-nums">
 ${item.strike}
 </td>

 {/* C/P */}
 <td className="px-3 py-2 font-mono tabular-nums">
 <span
 className={
 item.type === "call" ? "text-emerald-500" : "text-red-500"
 }
 >
 {item.type === "call" ? "C" : "P"}
 </span>
 </td>

 {/* Side */}
 <td className="px-3 py-2 font-medium">
 {item.side === "ask" ? (
 <span className="text-orange-400">Ask</span>
 ) : (
 <span className="text-muted-foreground">Bid</span>
 )}
 </td>

 {/* Sentiment badge */}
 <td className="px-3 py-2">
 {isBullish ? (
 <span className="text-emerald-500">
 <span className="mr-0.5 text-[11px]">●</span>Bullish
 </span>
 ) : isBearish ? (
 <span className="text-red-500">
 <span className="mr-0.5 text-[11px]">●</span>Bearish
 </span>
 ) : (
 <span className="text-muted-foreground">
 <span className="mr-0.5 text-[11px]">●</span>Neutral
 </span>
 )}
 </td>

 {/* Order type badge (SWEEP / BLOCK / FLOOR) */}
 <td className="px-3 py-2">
 <OrderTypeBadge orderType={item.orderType} />
 </td>

 {/* Size */}
 <td className="px-3 py-2 text-right font-mono tabular-nums">
 {item.size.toLocaleString()}
 </td>

 {/* Price */}
 <td className="px-3 py-2 text-right font-mono tabular-nums">
 ${item.price.toFixed(2)}
 </td>

 {/* Premium */}
 <td className="px-3 py-2 text-right font-mono tabular-nums font-medium text-orange-400">
 {formatPremium(item.premium)}
 </td>

 {/* Prem/OI ratio */}
 <td className="px-3 py-2 text-right font-mono tabular-nums">
 <span
 className={cn(
 "font-medium",
 premOIHigh ? "text-amber-400" : "text-muted-foreground",
 )}
 >
 {premOIRatio.toFixed(2)}
 {premOIHigh && (
 <span className="ml-0.5 text-[11px]">!</span>
 )}
 </span>
 </td>

 {/* Bid */}
 <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
 {item.bid.toFixed(2)}
 </td>

 {/* Ask */}
 <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
 {item.ask.toFixed(2)}
 </td>

 {/* Copy Alert button */}
 <td className="px-3 py-2">
 <button
 onClick={(e) => handleCopyAlert(e, item)}
 title="Copy alert to clipboard"
 className={cn(
 "flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
 copiedId === item.id
 ? "bg-emerald-500/20 text-emerald-400"
 : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
 )}
 >
 <CopyIcon className="h-2.5 w-2.5" />
 {copiedId === item.id ? "Copied" : "Copy"}
 </button>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 )}
 </div>
 </div>
 );
}
