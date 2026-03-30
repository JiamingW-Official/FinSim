"use client";

import { cn } from "@/lib/utils";
import type { OptionChainExpiry } from "@/types/options";

interface ExpirySelectorProps {
 chain: OptionChainExpiry[];
 selectedExpiry: string;
 onSelectExpiry: (expiry: string) => void;
}

export function ExpirySelector({
 chain,
 selectedExpiry,
 onSelectExpiry,
}: ExpirySelectorProps) {
 return (
 <div className="flex flex-wrap gap-1 px-3 py-1.5 border-b border-border/20">
 {chain.map((c) => {
 const isActive = c.expiry === selectedExpiry;
 const label = new Date(c.expiry + "T12:00:00").toLocaleDateString(
 "en-US",
 { month: "short", day: "numeric" },
 );
 return (
 <button
 key={c.expiry}
 onClick={() => onSelectExpiry(c.expiry)}
 className={cn(
 "rounded-full px-2 py-0.5 text-[9px] font-mono transition-colors",
 isActive
 ? "bg-primary/15 text-primary/80"
 : "text-muted-foreground/30 hover:text-muted-foreground/60",
 )}
 >
 <span>{label}</span>
 <span className="ml-1 text-[8px] font-mono text-muted-foreground/25">
 {c.daysToExpiry}d
 </span>
 </button>
 );
 })}
 </div>
 );
}
