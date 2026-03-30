"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useJournalStore } from "@/stores/journal-store";
import { AVAILABLE_TAGS, EMOTION_OPTIONS } from "@/services/trading/journal";
import type { JournalEntry } from "@/services/trading/journal";
import {
 BookOpen,
 ChevronDown,
 ChevronUp,
 Filter,
 Tag,
 Trash2,
 TrendingUp,
 TrendingDown,
 X,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────

const EMOTION_STYLES: Record<
 JournalEntry["emotion"],
 { label: string; className: string }
> = {
 confident: {
 label: "Confident",
 className: "bg-emerald-500/15 text-emerald-400",
 },
 neutral: {
 label: "Neutral",
 className: "bg-muted/50 text-muted-foreground",
 },
 anxious: {
 label: "Anxious",
 className: "bg-amber-500/15 text-amber-400",
 },
 fomo: {
 label: "FOMO",
 className: "bg-orange-500/15 text-orange-400",
 },
 revenge: {
 label: "Revenge",
 className: "bg-red-500/15 text-red-400",
 },
};

function formatDate(ts: number): string {
 return new Date(ts).toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 year: "numeric",
 });
}

function formatTime(ts: number): string {
 return new Date(ts).toLocaleTimeString("en-US", {
 hour: "2-digit",
 minute: "2-digit",
 });
}

// ── Component ──────────────────────────────────────────────────────────────────

export function JournalPanel() {
 const { entries, deleteEntry } = useJournalStore();
 const [expandedId, setExpandedId] = useState<string | null>(null);
 const [filterTag, setFilterTag] = useState<string | null>(null);
 const [showFilters, setShowFilters] = useState(false);

 const filteredEntries = filterTag
 ? entries.filter((e) => e.tags.includes(filterTag))
 : entries;

 // Collect all tags used across entries
 const usedTags = Array.from(
 new Set(entries.flatMap((e) => e.tags)),
 ).sort();

 return (
 <div className="flex flex-col gap-3">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <BookOpen className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm font-semibold">Trade Journal</span>
 <span className="text-xs font-mono tabular-nums bg-muted/50 px-1.5 py-0.5 rounded">
 {filteredEntries.length}
 </span>
 </div>
 <button
 onClick={() => setShowFilters(!showFilters)}
 className={cn(
 "flex items-center gap-1 text-xs font-medium transition-colors",
 filterTag
 ? "text-primary"
 : "text-muted-foreground hover:text-foreground",
 )}
 >
 <Filter className="h-3 w-3" />
 Filter
 </button>
 </div>

 {/* Filters */}
 {showFilters && (
 <div className="flex flex-wrap gap-1 border border-border rounded-lg p-2 bg-muted/20">
 <button
 onClick={() => setFilterTag(null)}
 className={cn(
 "text-xs font-medium px-2 py-0.5 rounded transition-colors",
 filterTag === null
 ? "bg-primary text-primary-foreground"
 : "bg-muted/50 text-muted-foreground hover:text-foreground",
 )}
 >
 All
 </button>
 {usedTags.map((tag) => (
 <button
 key={tag}
 onClick={() => setFilterTag(filterTag === tag ? null : tag)}
 className={cn(
 "text-xs font-medium px-2 py-0.5 rounded transition-colors",
 filterTag === tag
 ? "bg-primary text-primary-foreground"
 : "bg-muted/50 text-muted-foreground hover:text-foreground",
 )}
 >
 {tag}
 </button>
 ))}
 {usedTags.length === 0 && (
 <span className="text-xs text-muted-foreground">
 No tags yet
 </span>
 )}
 </div>
 )}

 {/* Empty State */}
 {filteredEntries.length === 0 && (
 <p className="text-[11px] text-muted-foreground text-center py-6">
 {filterTag
 ? `No entries tagged "${filterTag}".`
 : "No journal entries yet. Entries are created when you trade."}
 </p>
 )}

 {/* Entries List */}
 <div className="space-y-1.5">
 {filteredEntries.map((entry) => {
 const isExpanded = expandedId === entry.id;
 const emotionStyle = EMOTION_STYLES[entry.emotion];

 return (
 <div
 key={entry.id}
 className="border border-border rounded-lg bg-muted/10 overflow-hidden"
 >
 {/* Summary Row */}
 <button
 onClick={() =>
 setExpandedId(isExpanded ? null : entry.id)
 }
 className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/20 transition-colors"
 >
 {/* Side indicator */}
 <span
 className={cn(
 "shrink-0",
 entry.side === "buy"
 ? "text-emerald-400"
 : "text-red-400",
 )}
 >
 {entry.side === "buy" ? (
 <TrendingUp className="h-3 w-3" />
 ) : (
 <TrendingDown className="h-3 w-3" />
 )}
 </span>

 {/* Ticker */}
 <span className="text-[11px] font-semibold w-12 shrink-0">
 {entry.ticker}
 </span>

 {/* P&L */}
 {entry.pnl !== undefined && (
 <span
 className={cn(
 "text-[11px] font-mono tabular-nums font-medium shrink-0",
 entry.pnl >= 0 ? "text-emerald-400" : "text-red-400",
 )}
 >
 {entry.pnl >= 0 ? "+" : ""}
 ${entry.pnl.toFixed(2)}
 </span>
 )}

 {/* Emotion badge */}
 <span
 className={cn(
 "text-[11px] font-medium px-1.5 py-0.5 rounded shrink-0",
 emotionStyle.className,
 )}
 >
 {emotionStyle.label}
 </span>

 {/* Spacer */}
 <span className="flex-1" />

 {/* Date */}
 <span className="text-[11px] text-muted-foreground font-mono tabular-nums shrink-0">
 {formatDate(entry.createdAt)}
 </span>

 {/* Expand */}
 {isExpanded ? (
 <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" />
 ) : (
 <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
 )}
 </button>

 {/* Expanded Content */}
 {isExpanded && (
 <div className="px-3 pb-3 space-y-2 border-t border-border">
 {/* Price Info */}
 <div className="flex items-center gap-4 pt-2">
 <div>
 <span className="text-[11px] text-muted-foreground block">
 Entry
 </span>
 <span className="text-[11px] font-mono tabular-nums font-medium">
 ${entry.entryPrice.toFixed(2)}
 </span>
 </div>
 {entry.exitPrice !== undefined && (
 <div>
 <span className="text-[11px] text-muted-foreground block">
 Exit
 </span>
 <span className="text-[11px] font-mono tabular-nums font-medium">
 ${entry.exitPrice.toFixed(2)}
 </span>
 </div>
 )}
 <div className="ml-auto text-[11px] text-muted-foreground">
 {formatTime(entry.createdAt)}
 </div>
 </div>

 {/* Notes */}
 {entry.notes && (
 <p className="text-[11px] text-muted-foreground leading-relaxed">
 {entry.notes}
 </p>
 )}

 {/* Lesson Learned */}
 {entry.lessonLearned && (
 <div className="bg-primary/5 border border-primary/10 rounded px-2 py-1.5">
 <span className="text-[11px] font-medium text-primary block mb-0.5">
 Lesson Learned
 </span>
 <p className="text-xs text-muted-foreground leading-relaxed">
 {entry.lessonLearned}
 </p>
 </div>
 )}

 {/* Tags */}
 {entry.tags.length > 0 && (
 <div className="flex items-center gap-1 flex-wrap">
 <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
 {entry.tags.map((tag) => (
 <span
 key={tag}
 className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground"
 >
 {tag}
 </span>
 ))}
 </div>
 )}

 {/* Delete */}
 <div className="flex justify-end pt-1">
 <button
 onClick={() => deleteEntry(entry.id)}
 className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
 >
 <Trash2 className="h-3 w-3" />
 Remove
 </button>
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 );
}
