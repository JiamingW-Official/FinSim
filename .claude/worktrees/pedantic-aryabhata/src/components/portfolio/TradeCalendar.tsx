"use client";

import { useMemo, useState } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKS = 12;

function getColor(pnl: number, maxAbs: number): string {
 if (maxAbs === 0) return "bg-muted/20";
 const ratio = Math.min(Math.abs(pnl) / maxAbs, 1);
 if (pnl > 0) {
 if (ratio > 0.6) return "bg-emerald-500/80";
 if (ratio > 0.3) return "bg-emerald-500/50";
 return "bg-emerald-500/25";
 }
 if (ratio > 0.6) return "bg-red-500/80";
 if (ratio > 0.3) return "bg-red-500/50";
 return "bg-red-500/25";
}

export function TradeCalendar() {
 const tradeHistory = useTradingStore((s) => s.tradeHistory);
 const [hoveredCell, setHoveredCell] = useState<string | null>(null);

 const { grid, maxAbs, tooltipData } = useMemo(() => {
 // Group sell trades by simulation date
 const sellTrades = tradeHistory.filter((t) => t.side === "sell");
 const dailyPnL = new Map<string, number>();

 for (const t of sellTrades) {
 const d = new Date(t.simulationDate);
 const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
 dailyPnL.set(key, (dailyPnL.get(key) ?? 0) + t.realizedPnL);
 }

 // Build a 7-row x WEEKS-column grid (Mon=0 through Sun=6)
 // Start from WEEKS*7 days ago
 const now = new Date();
 const startDate = new Date(now);
 startDate.setDate(startDate.getDate() - WEEKS * 7);
 // Align to Monday
 const dayOfWeek = startDate.getDay();
 const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Sun→6, 1=Mon→0, etc.
 startDate.setDate(startDate.getDate() - offset);

 const cells: { key: string; date: string; pnl: number; row: number; col: number }[] = [];
 let mAbs = 0;

 for (let col = 0; col < WEEKS; col++) {
 for (let row = 0; row < 7; row++) {
 const d = new Date(startDate);
 d.setDate(d.getDate() + col * 7 + row);
 const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
 const pnl = dailyPnL.get(key) ?? 0;
 if (Math.abs(pnl) > mAbs) mAbs = Math.abs(pnl);
 cells.push({ key, date: key, pnl, row, col });
 }
 }

 const tooltips = new Map<string, { date: string; pnl: number }>();
 for (const c of cells) {
 tooltips.set(c.key, { date: c.date, pnl: c.pnl });
 }

 return { grid: cells, maxAbs: mAbs, tooltipData: tooltips };
 }, [tradeHistory]);

 const sellCount = tradeHistory.filter((t) => t.side === "sell").length;
 if (sellCount === 0) {
 return (
 <div className="flex flex-col items-center gap-1.5 py-8 text-muted-foreground">
 <Calendar className="h-5 w-5 opacity-30" />
 <p className="text-[11px]">Complete sells to see your trading calendar</p>
 </div>
 );
 }

 const hovered = hoveredCell ? tooltipData.get(hoveredCell) : null;

 return (
 <div>
 {/* Tooltip */}
 <div className="mb-2 h-4 text-xs text-muted-foreground tabular-nums">
 {hovered ? (
 <span>
 {hovered.date}{" "}
 <span className={cn("font-semibold", hovered.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
 {hovered.pnl >= 0 ? "+" : ""}{formatCurrency(hovered.pnl)}
 </span>
 </span>
 ) : (
 <span className="opacity-40">Hover to see daily P&L</span>
 )}
 </div>

 <div className="flex gap-1">
 {/* Day labels */}
 <div className="flex flex-col gap-[3px] pr-1">
 {DAY_LABELS.map((label, i) => (
 <div key={i} className="flex h-[14px] w-3 items-center justify-center text-[11px] text-muted-foreground/50">
 {i % 2 === 0 ? label : ""}
 </div>
 ))}
 </div>

 {/* Grid */}
 <div className="flex gap-[3px]">
 {Array.from({ length: WEEKS }, (_, col) => (
 <div key={col} className="flex flex-col gap-[3px]">
 {Array.from({ length: 7 }, (_, row) => {
 const cell = grid.find((c) => c.col === col && c.row === row);
 if (!cell) return <div key={row} className="h-[14px] w-[14px]" />;
 const hasData = cell.pnl !== 0;
 return (
 <div
 key={row}
 className={cn(
 "h-[14px] w-[14px] rounded-[3px] transition-colors",
 hasData ? getColor(cell.pnl, maxAbs) : "bg-muted/10",
 hoveredCell === cell.key && "ring-1 ring-white/30",
 )}
 onMouseEnter={() => setHoveredCell(cell.key)}
 onMouseLeave={() => setHoveredCell(null)}
 />
 );
 })}
 </div>
 ))}
 </div>
 </div>

 {/* Legend */}
 <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground/50">
 <span>Loss</span>
 <div className="flex gap-[2px]">
 <div className="h-[10px] w-[10px] rounded-[2px] bg-red-500/80" />
 <div className="h-[10px] w-[10px] rounded-[2px] bg-red-500/30" />
 <div className="h-[10px] w-[10px] rounded-[2px] bg-muted/10" />
 <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-500/30" />
 <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-500/80" />
 </div>
 <span>Profit</span>
 </div>
 </div>
 );
}
