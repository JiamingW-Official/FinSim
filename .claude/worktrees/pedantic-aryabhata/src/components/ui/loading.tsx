import React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Primitive shimmer skeleton
// ---------------------------------------------------------------------------
function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
 return (
 <div
 className={cn(
 "animate-pulse rounded-md bg-muted/60",
 className
 )}
 style={style}
 />
 );
}

// ---------------------------------------------------------------------------
// SkeletonCard — card with header + body lines
// ---------------------------------------------------------------------------
export function SkeletonCard({ className }: { className?: string }) {
 return (
 <div className={cn("rounded-md border border-border bg-card p-4", className)}>
 <div className="flex items-center gap-3 mb-4">
 <Skeleton className="h-8 w-8 rounded-full" />
 <div className="flex flex-col gap-2 flex-1">
 <Skeleton className="h-4 w-32" />
 <Skeleton className="h-3 w-20" />
 </div>
 <Skeleton className="h-6 w-16 rounded-md" />
 </div>
 <div className="flex flex-col gap-2">
 <Skeleton className="h-3 w-full" />
 <Skeleton className="h-3 w-5/6" />
 <Skeleton className="h-3 w-3/4" />
 </div>
 </div>
 );
}

// ---------------------------------------------------------------------------
// SkeletonTable — table header + 5 data rows
// ---------------------------------------------------------------------------
export function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
 return (
 <div className={cn("rounded-md border border-border bg-card overflow-hidden", className)}>
 {/* Header row */}
 <div className="flex items-center gap-4 border-b border-border bg-muted/20 px-4 py-3">
 <Skeleton className="h-3 w-16" />
 <Skeleton className="h-3 w-24 ml-auto" />
 <Skeleton className="h-3 w-20" />
 <Skeleton className="h-3 w-16" />
 <Skeleton className="h-3 w-14" />
 </div>
 {/* Data rows */}
 {Array.from({ length: rows }).map((_, i) => (
 <div
 key={i}
 className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0"
 >
 <div className="flex items-center gap-2 flex-1">
 <Skeleton className="h-6 w-6 rounded-full" />
 <Skeleton className="h-3 w-14" />
 </div>
 <Skeleton className="h-3 w-20 ml-auto" />
 <Skeleton className="h-3 w-16" />
 <Skeleton className="h-3 w-12" />
 <Skeleton className="h-5 w-12 rounded" />
 </div>
 ))}
 </div>
 );
}

// ---------------------------------------------------------------------------
// SkeletonChart — placeholder for a chart area
// ---------------------------------------------------------------------------
export function SkeletonChart({ className }: { className?: string }) {
 return (
 <div className={cn("rounded-md border border-border bg-card p-4", className)}>
 {/* Toolbar row */}
 <div className="flex items-center gap-2 mb-4">
 <Skeleton className="h-7 w-24 rounded-md" />
 <div className="flex gap-1 ml-2">
 {[40, 32, 36, 28].map((w, i) => (
 <Skeleton key={i} className={`h-7 rounded-md`} style={{ width: w }} />
 ))}
 </div>
 <Skeleton className="h-7 w-20 rounded-md ml-auto" />
 </div>
 {/* Chart area */}
 <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted/30">
 {/* Fake y-axis labels */}
 <div className="absolute left-2 top-0 flex h-full flex-col justify-between py-2">
 {[0, 1, 2, 3, 4].map((i) => (
 <Skeleton key={i} className="h-2.5 w-10" />
 ))}
 </div>
 {/* Shimmer overlay */}
 <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-muted/40 to-transparent" />
 {/* Fake candle bars */}
 <div className="absolute inset-0 flex items-end justify-around px-16 pb-4 gap-1">
 {[60, 45, 70, 55, 80, 65, 50, 75, 40, 85, 60, 70].map((h, i) => (
 <div key={i} className="flex flex-col items-center gap-0.5" style={{ height: "100%" }}>
 <div className="flex-1" />
 <Skeleton
 className="w-3 rounded-sm"
 style={{ height: `${h}%` }}
 />
 </div>
 ))}
 </div>
 </div>
 {/* X-axis labels */}
 <div className="flex justify-around mt-2 px-4">
 {[0, 1, 2, 3, 4].map((i) => (
 <Skeleton key={i} className="h-2.5 w-10" />
 ))}
 </div>
 </div>
 );
}

// ---------------------------------------------------------------------------
// PageLoader — full-page centered spinner with "Loading..." text
// ---------------------------------------------------------------------------
export function PageLoader({ message = "Loading..." }: { message?: string }) {
 return (
 <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
 {/* Spinner */}
 <div className="relative h-10 w-10">
 <div className="absolute inset-0 rounded-full border-2 border-muted" />
 <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
 </div>
 <p className="text-sm text-muted-foreground">{message}</p>
 </div>
 );
}
