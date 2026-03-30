"use client";

import { cn } from "@/lib/utils";
import type { ChainFilters, OptionChainExpiry } from "@/types/options";

interface ChainFiltersBarProps {
 filters: ChainFilters;
 setFilters: (f: ChainFilters) => void;
 chain: OptionChainExpiry[];
 selectedExpiry: string;
 onSelectExpiry: (expiry: string) => void;
}

type TypeFilter = ChainFilters["typeFilter"];
type MoneynessFilter = ChainFilters["moneynessFilter"];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
 { value: "both", label: "Both" },
 { value: "call", label: "Calls" },
 { value: "put", label: "Puts" },
];

const MONEYNESS_OPTIONS: { value: MoneynessFilter; label: string }[] = [
 { value: "all", label: "All Strikes" },
 { value: "atm", label: "Near ATM" },
 { value: "itm", label: "ITM" },
 { value: "otm", label: "OTM" },
];

function formatDTE(dte: number): string {
 if (dte <= 14) return `${dte}D`;
 if (dte <= 45) return `${Math.round(dte / 7)}W`;
 return `${Math.round(dte / 30)}M`;
}

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
 "rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wide transition-colors",
 active
 ? "bg-primary/15 text-primary/80"
 : "text-muted-foreground/30 hover:text-muted-foreground/60",
 )}
 >
 {children}
 </button>
 );
}

export function ChainFiltersBar({
 filters,
 setFilters,
 chain,
 selectedExpiry,
 onSelectExpiry,
}: ChainFiltersBarProps) {
 return (
 <div className="h-8 flex shrink-0 items-center gap-2 overflow-x-auto border-b border-border/20 px-3">
 {/* Type filter */}
 <div className="flex items-center gap-0.5">
 {TYPE_OPTIONS.map((opt) => (
 <ToggleButton
 key={opt.value}
 active={filters.typeFilter === opt.value}
 onClick={() => setFilters({ ...filters, typeFilter: opt.value })}
 >
 {opt.label}
 </ToggleButton>
 ))}
 </div>

 <span className="h-3 w-px bg-border/30 shrink-0" />

 {/* Moneyness filter */}
 <div className="flex items-center gap-0.5">
 {MONEYNESS_OPTIONS.map((opt) => (
 <ToggleButton
 key={opt.value}
 active={filters.moneynessFilter === opt.value}
 onClick={() => setFilters({ ...filters, moneynessFilter: opt.value })}
 >
 {opt.label}
 </ToggleButton>
 ))}
 </div>

 <span className="h-3 w-px bg-border/30 shrink-0" />

 {/* Expiry pills */}
 <div className="flex items-center gap-1">
 {chain.map((exp) => (
 <button
 key={exp.expiry}
 onClick={() => onSelectExpiry(exp.expiry)}
 className={cn(
 "rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wide transition-colors",
 selectedExpiry === exp.expiry
 ? "bg-primary/15 text-primary/80"
 : "text-muted-foreground/30 hover:text-muted-foreground/60",
 )}
 >
 {formatDTE(exp.daysToExpiry)}
 <span className="ml-0.5 opacity-50">{exp.daysToExpiry}d</span>
 </button>
 ))}
 </div>
 </div>
 );
}
