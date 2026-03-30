"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
 getChartApi,
 subscribeChartApi,
 getRangeVersion,
 getCrosshairPoint,
 subscribeCrosshairUpdate,
 subscribeChartClick,
} from "@/stores/chart-api-store";
import type { UTCTimestamp, Logical } from "lightweight-charts";

// ── Drawing types ─────────────────────────────────────────────────────────────

export type DrawingTool = "none" | "trendline" | "hline" | "vline" | "rect" | "fib" | "text" | "eraser";

/** Logical coordinate used for storage: time (epoch seconds) + price */
export interface LogicalPoint {
 time: number; // UTCTimestamp (seconds)
 price: number;
}

export type Drawing =
 | { id: string; type: "hline"; price: number; color: string }
 | { id: string; type: "vline"; time: number; color: string }
 | { id: string; type: "trendline"; p1: LogicalPoint; p2: LogicalPoint; color: string }
 | { id: string; type: "rect"; p1: LogicalPoint; p2: LogicalPoint; color: string }
 | { id: string; type: "fib"; p1: LogicalPoint; p2: LogicalPoint; color: string; levels: { ratio: number; price: number }[] }
 | { id: string; type: "text"; p: LogicalPoint; text: string; color: string };

// ── localStorage persistence ──────────────────────────────────────────────────

const STORAGE_KEY = "finsim-chart-drawings-v2";

function loadDrawings(): Drawing[] {
 if (typeof window === "undefined") return [];
 try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Drawing[];
 } catch {
  return [];
 }
}

function saveDrawings(drawings: Drawing[]) {
 if (typeof window === "undefined") return;
 try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings));
 } catch { /* quota exceeded — ignore */ }
}

// ── Global drawing state (module-level singleton) ─────────────────────────────

let _activeTool: DrawingTool = "none";
let _drawings: Drawing[] = loadDrawings();
const _listeners: Set<() => void> = new Set();

function notifyListeners() {
 _listeners.forEach((fn) => fn());
}

export function useDrawingStore() {
 const [, rerender] = useState(0);
 useEffect(() => {
  const fn = () => rerender((n) => n + 1);
  _listeners.add(fn);
  return () => { _listeners.delete(fn); };
 }, []);

 return {
  activeTool: _activeTool,
  drawings: _drawings,
  setActiveTool: (tool: DrawingTool) => { _activeTool = tool; notifyListeners(); },
  addDrawing: (d: Drawing) => {
   _drawings = [..._drawings, d];
   saveDrawings(_drawings);
   notifyListeners();
  },
  removeDrawing: (id: string) => {
   _drawings = _drawings.filter((d) => d.id !== id);
   saveDrawings(_drawings);
   notifyListeners();
  },
  clearDrawings: () => {
   _drawings = [];
   saveDrawings(_drawings);
   notifyListeners();
  },
 };
}

// Fibonacci
const FIB_LEVELS = [
 { ratio: 0, label: "0%" },
 { ratio: 0.236, label: "23.6%" },
 { ratio: 0.382, label: "38.2%" },
 { ratio: 0.5, label: "50%" },
 { ratio: 0.618, label: "61.8%" },
 { ratio: 0.786, label: "78.6%" },
 { ratio: 1, label: "100%" },
];
const FIB_COLORS = ["#ef4444", "#f97316", "#eab308", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

export interface DrawingOverlayProps {
 height: number;
 width: number;
}

function uid() {
 return Math.random().toString(36).slice(2, 9);
}

// ── Coordinate conversion helpers ─────────────────────────────────────────────

function timeToX(time: number): number | null {
 const { chart } = getChartApi();
 if (!chart) return null;
 return chart.timeScale().timeToCoordinate(time as UTCTimestamp);
}

function priceToY(price: number): number | null {
 const { series } = getChartApi();
 if (!series) return null;
 return series.priceToCoordinate(price);
}

/** Convert a logical point → screen pixel coords */
function logicalToScreen(lp: LogicalPoint): { x: number; y: number } | null {
 const x = timeToX(lp.time);
 const y = priceToY(lp.price);
 if (x == null || y == null) return null;
 return { x, y };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── DrawingOverlay Component ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export function DrawingOverlay({ height, width }: DrawingOverlayProps) {
 const svgRef = useRef<SVGSVGElement>(null);
 const { activeTool, drawings, addDrawing, removeDrawing, setActiveTool } = useDrawingStore();

 const [firstClick, setFirstClick] = useState<LogicalPoint | null>(null);
 const [ghostPoint, setGhostPoint] = useState<{ x: number; y: number } | null>(null);
 const [pendingText, setPendingText] = useState<{ p: LogicalPoint; screen: { x: number; y: number } } | null>(null);
 const [textInput, setTextInput] = useState("");
 const [hoveredId, setHoveredId] = useState<string | null>(null);

 // Subscribe to chart API changes (scroll, zoom, data) to re-render drawings
 const [, setRangeVer] = useState(0);
 useEffect(() => {
  return subscribeChartApi(() => setRangeVer(getRangeVersion()));
 }, []);

 // Reset state when tool changes
 useEffect(() => {
  setFirstClick(null);
  setGhostPoint(null);
  setPendingText(null);
  setTextInput("");
  setHoveredId(null);
 }, [activeTool]);

 // Track crosshair position for ghost preview
 useEffect(() => {
  return subscribeCrosshairUpdate(() => {
   const pt = getCrosshairPoint();
   if (!pt) { setGhostPoint(null); return; }
   const screen = logicalToScreen(pt);
   setGhostPoint(screen);
  });
 }, []); // eslint-disable-line react-hooks/exhaustive-deps

 // Handle chart clicks to place drawings
 useEffect(() => {
  if (activeTool === "none" || activeTool === "eraser") return;
  return subscribeChartClick(() => {
   const pt = getCrosshairPoint();
   if (!pt) return;

   switch (activeTool) {
    case "hline":
     addDrawing({ id: uid(), type: "hline", price: pt.price, color: "#f59e0b" });
     setActiveTool("none");
     break;

    case "vline":
     addDrawing({ id: uid(), type: "vline", time: pt.time, color: "#06b6d4" });
     setActiveTool("none");
     break;

    case "trendline":
    case "rect":
    case "fib": {
     setFirstClick((prev) => {
      if (!prev) {
       // First click — store anchor
       return pt;
      }
      // Second click — create drawing
      if (activeTool === "trendline") {
       addDrawing({ id: uid(), type: "trendline", p1: prev, p2: pt, color: "#3b82f6" });
      } else if (activeTool === "rect") {
       addDrawing({ id: uid(), type: "rect", p1: prev, p2: pt, color: "#8b5cf6" });
      } else {
       const high = Math.max(prev.price, pt.price);
       const low = Math.min(prev.price, pt.price);
       const levels = FIB_LEVELS.map(({ ratio }) => ({
        ratio,
        price: high - ratio * (high - low),
       }));
       addDrawing({ id: uid(), type: "fib", p1: prev, p2: pt, color: "#10b981", levels });
      }
      setActiveTool("none");
      return null;
     });
     break;
    }

    case "text": {
     const currentGhost = getCrosshairPoint();
     if (!currentGhost) return;
     const screen = logicalToScreen(currentGhost);
     if (!screen) return;
     setPendingText({ p: pt, screen });
     setTextInput("");
     break;
    }
   }
  });
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [activeTool, addDrawing, setActiveTool]);

 /** Click on a drawing: only eraser mode removes on click */
 const handleDrawingClick = useCallback(
  (e: React.MouseEvent, id: string) => {
   e.stopPropagation();
   if (activeTool === "eraser") {
    removeDrawing(id);
   }
  },
  [activeTool, removeDrawing],
 );

 /** Right-click on a drawing always removes it */
 const handleDrawingContextMenu = useCallback(
  (e: React.MouseEvent, id: string) => {
   e.preventDefault();
   e.stopPropagation();
   removeDrawing(id);
  },
  [removeDrawing],
 );

 const commitText = useCallback(() => {
  if (!pendingText || !textInput.trim()) {
   setPendingText(null);
   setTextInput("");
   return;
  }
  addDrawing({ id: uid(), type: "text", p: pendingText.p, text: textInput.trim(), color: "#f59e0b" });
  setPendingText(null);
  setTextInput("");
  setActiveTool("none");
 }, [pendingText, textInput, addDrawing, setActiveTool]);

 if (width === 0 || height === 0) return null;

 // Check if chart API is available
 const { chart: chartApi, series: seriesApi } = getChartApi();
 const hasApi = !!chartApi && !!seriesApi;

 return (
  <div
   className="absolute inset-0 z-10"
   style={{ pointerEvents: "none" }}
  >
   <svg
    ref={svgRef}
    width={width}
    height={height}
    style={{
     cursor: "default",
     display: "block",
     pointerEvents: "none",
    }}
   >
    {hasApi && drawings.map((d) => {
     const canInteract = activeTool === "eraser" || activeTool === "none";
     const isEraserMode = activeTool === "eraser";
     const isHovered = hoveredId === d.id;

     // ── Trendline ───────────────────────────────────────────────
     if (d.type === "trendline") {
      const s1 = logicalToScreen(d.p1);
      const s2 = logicalToScreen(d.p2);
      if (!s1 || !s2) return null;
      const midX = (s1.x + s2.x) / 2;
      const midY = (s1.y + s2.y) / 2;
      return (
       <g
        key={d.id}
        onMouseEnter={() => canInteract && setHoveredId(d.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={isEraserMode ? (e) => handleDrawingClick(e, d.id) : undefined}
        onContextMenu={(e) => handleDrawingContextMenu(e, d.id)}
        style={{ pointerEvents: canInteract ? "auto" : "none", cursor: isEraserMode ? "pointer" : undefined }}
       >
        <line x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y}
         stroke={d.color} strokeWidth={isHovered ? 2 : 1.5} strokeLinecap="round"
         opacity={isHovered ? 1 : 0.85}
        />
        {/* Hit area */}
        <line x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y}
         stroke="transparent" strokeWidth={12} className="cursor-pointer"
        />
        <circle cx={s1.x} cy={s1.y} r={isHovered ? 4 : 3} fill={d.color} />
        <circle cx={s2.x} cy={s2.y} r={isHovered ? 4 : 3} fill={d.color} />
        {/* Delete button on hover */}
        {isHovered && (
         <g onClick={(e) => handleDrawingClick(e, d.id)} className="cursor-pointer">
          <circle cx={midX} cy={midY - 12} r={8} fill="#1a1a2e" stroke="#ef4444" strokeWidth={1} />
          <line x1={midX - 3} y1={midY - 15} x2={midX + 3} y2={midY - 9} stroke="#ef4444" strokeWidth={1.5} />
          <line x1={midX + 3} y1={midY - 15} x2={midX - 3} y2={midY - 9} stroke="#ef4444" strokeWidth={1.5} />
         </g>
        )}
       </g>
      );
     }

     // ── Horizontal line ─────────────────────────────────────────
     if (d.type === "hline") {
      const y = priceToY(d.price);
      if (y == null) return null;
      const label = `$${d.price.toFixed(2)}`;
      return (
       <g
        key={d.id}
        onMouseEnter={() => canInteract && setHoveredId(d.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={isEraserMode ? (e) => handleDrawingClick(e, d.id) : undefined}
        onContextMenu={(e) => handleDrawingContextMenu(e, d.id)}
        style={{ pointerEvents: canInteract ? "auto" : "none", cursor: isEraserMode ? "pointer" : undefined }}
       >
        <line x1={0} y1={y} x2={width} y2={y}
         stroke={d.color} strokeWidth={1} strokeDasharray="4 3"
         opacity={isHovered ? 1 : 0.8}
        />
        <line x1={0} y1={y} x2={width} y2={y}
         stroke="transparent" strokeWidth={10} className="cursor-pointer"
        />
        <rect x={4} y={y - 8} width={label.length * 5.5 + 4} height={13} rx={2} fill="#0a0e17" opacity={0.8} />
        <text x={6} y={y + 2} fill={d.color} fontSize={9} fontFamily="monospace">{label}</text>
        {isHovered && (
         <>
          {/* Right-edge price tag */}
          <g>
           <rect x={width - 58} y={y - 8} width={54} height={14} rx={2} fill={d.color} opacity={0.18} />
           <text x={width - 56} y={y + 3} fill={d.color} fontSize={9} fontFamily="monospace" fontWeight="bold">{label}</text>
          </g>
          {/* Delete button */}
          <g onClick={(e) => handleDrawingClick(e, d.id)} className="cursor-pointer">
           <circle cx={width - 66} cy={y} r={7} fill="#1a1a2e" stroke="#ef4444" strokeWidth={1} />
           <line x1={width - 69} y1={y - 3} x2={width - 63} y2={y + 3} stroke="#ef4444" strokeWidth={1.5} />
           <line x1={width - 63} y1={y - 3} x2={width - 69} y2={y + 3} stroke="#ef4444" strokeWidth={1.5} />
          </g>
         </>
        )}
       </g>
      );
     }

     // ── Vertical line ───────────────────────────────────────────
     if (d.type === "vline") {
      const x = timeToX(d.time);
      if (x == null) return null;
      return (
       <g
        key={d.id}
        onMouseEnter={() => canInteract && setHoveredId(d.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={isEraserMode ? (e) => handleDrawingClick(e, d.id) : undefined}
        onContextMenu={(e) => handleDrawingContextMenu(e, d.id)}
        style={{ pointerEvents: canInteract ? "auto" : "none", cursor: isEraserMode ? "pointer" : undefined }}
       >
        <line x1={x} y1={0} x2={x} y2={height}
         stroke={d.color} strokeWidth={1} strokeDasharray="4 3"
         opacity={isHovered ? 1 : 0.8}
        />
        <line x1={x} y1={0} x2={x} y2={height}
         stroke="transparent" strokeWidth={10} className="cursor-pointer"
        />
        {isHovered && (
         <g onClick={(e) => handleDrawingClick(e, d.id)} className="cursor-pointer">
          <circle cx={x} cy={16} r={8} fill="#1a1a2e" stroke="#ef4444" strokeWidth={1} />
          <line x1={x - 3} y1={13} x2={x + 3} y2={19} stroke="#ef4444" strokeWidth={1.5} />
          <line x1={x + 3} y1={13} x2={x - 3} y2={19} stroke="#ef4444" strokeWidth={1.5} />
         </g>
        )}
       </g>
      );
     }

     // ── Rectangle ───────────────────────────────────────────────
     if (d.type === "rect") {
      const s1 = logicalToScreen(d.p1);
      const s2 = logicalToScreen(d.p2);
      if (!s1 || !s2) return null;
      const rx = Math.min(s1.x, s2.x);
      const ry = Math.min(s1.y, s2.y);
      const rw = Math.abs(s2.x - s1.x);
      const rh = Math.abs(s2.y - s1.y);
      return (
       <g
        key={d.id}
        onMouseEnter={() => canInteract && setHoveredId(d.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={isEraserMode ? (e) => handleDrawingClick(e, d.id) : undefined}
        onContextMenu={(e) => handleDrawingContextMenu(e, d.id)}
        style={{ pointerEvents: canInteract ? "auto" : "none", cursor: isEraserMode ? "pointer" : undefined }}
       >
        <rect x={rx} y={ry} width={rw} height={rh}
         fill={`${d.color}1a`} stroke={d.color} strokeWidth={isHovered ? 1.5 : 1}
        />
        {isHovered && (
         <g onClick={(e) => handleDrawingClick(e, d.id)} className="cursor-pointer">
          <circle cx={rx + rw} cy={ry} r={8} fill="#1a1a2e" stroke="#ef4444" strokeWidth={1} />
          <line x1={rx + rw - 3} y1={ry - 3} x2={rx + rw + 3} y2={ry + 3} stroke="#ef4444" strokeWidth={1.5} />
          <line x1={rx + rw + 3} y1={ry - 3} x2={rx + rw - 3} y2={ry + 3} stroke="#ef4444" strokeWidth={1.5} />
         </g>
        )}
       </g>
      );
     }

     // ── Fibonacci ────────────────────────────────────────────────
     if (d.type === "fib") {
      return (
       <g
        key={d.id}
        onMouseEnter={() => canInteract && setHoveredId(d.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={isEraserMode ? (e) => handleDrawingClick(e, d.id) : undefined}
        onContextMenu={(e) => handleDrawingContextMenu(e, d.id)}
        style={{ pointerEvents: canInteract ? "auto" : "none", cursor: isEraserMode ? "pointer" : undefined }}
       >
        {d.levels.map((lv, i) => {
         const y = priceToY(lv.price);
         if (y == null) return null;
         const color = FIB_COLORS[i % FIB_COLORS.length];
         const labelText = `${FIB_LEVELS[i]?.label ?? ""} $${lv.price.toFixed(2)}`;
         return (
          <g key={i}>
           <line x1={0} y1={y} x2={width} y2={y}
            stroke={color} strokeWidth={i === 4 ? 1.5 : 1}
            strokeDasharray={i === 0 || i === d.levels.length - 1 ? "none" : "4 3"}
            opacity={0.8}
           />
           <line x1={0} y1={y} x2={width} y2={y} stroke="transparent" strokeWidth={8} />
           <rect x={4} y={y - 8} width={labelText.length * 5 + 4} height={13} rx={2} fill="#0a0e17" opacity={0.85} />
           <text x={6} y={y + 2} fill={color} fontSize={9} fontFamily="monospace">{labelText}</text>
          </g>
         );
        })}
        {isHovered && (() => {
         const topY = priceToY(d.levels[0]?.price ?? 0);
         if (topY == null) return null;
         return (
          <g onClick={(e) => handleDrawingClick(e, d.id)} className="cursor-pointer">
           <circle cx={width - 16} cy={topY} r={8} fill="#1a1a2e" stroke="#ef4444" strokeWidth={1} />
           <line x1={width - 19} y1={topY - 3} x2={width - 13} y2={topY + 3} stroke="#ef4444" strokeWidth={1.5} />
           <line x1={width - 13} y1={topY - 3} x2={width - 19} y2={topY + 3} stroke="#ef4444" strokeWidth={1.5} />
          </g>
         );
        })()}
       </g>
      );
     }

     // ── Text ─────────────────────────────────────────────────────
     if (d.type === "text") {
      const s = logicalToScreen(d.p);
      if (!s) return null;
      return (
       <g
        key={d.id}
        onMouseEnter={() => canInteract && setHoveredId(d.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={isEraserMode ? (e) => handleDrawingClick(e, d.id) : undefined}
        onContextMenu={(e) => handleDrawingContextMenu(e, d.id)}
        style={{ pointerEvents: canInteract ? "auto" : "none", cursor: isEraserMode ? "pointer" : undefined }}
       >
        <text x={s.x} y={s.y} fill={d.color} fontSize={11} fontFamily="monospace" fontWeight="500"
         style={{ userSelect: "none" }}
        >
         {d.text}
        </text>
        {isHovered && (
         <g onClick={(e) => handleDrawingClick(e, d.id)} className="cursor-pointer">
          <circle cx={s.x - 10} cy={s.y - 4} r={7} fill="#1a1a2e" stroke="#ef4444" strokeWidth={1} />
          <line x1={s.x - 13} y1={s.y - 7} x2={s.x - 7} y2={s.y - 1} stroke="#ef4444" strokeWidth={1.5} />
          <line x1={s.x - 7} y1={s.y - 7} x2={s.x - 13} y2={s.y - 1} stroke="#ef4444" strokeWidth={1.5} />
         </g>
        )}
       </g>
      );
     }

     return null;
    })}

    {/* Ghost: first-click anchor dot */}
    {firstClick && (() => {
     const s = logicalToScreen(firstClick);
     if (!s) return null;
     return <circle cx={s.x} cy={s.y} r={4} fill="#3b82f6" opacity={0.8} />;
    })()}

    {/* Ghost: in-progress line/rect from firstClick to current crosshair */}
    {firstClick && ghostPoint && (activeTool === "trendline" || activeTool === "rect" || activeTool === "fib") && (() => {
     const s1 = logicalToScreen(firstClick);
     if (!s1) return null;
     if (activeTool === "trendline" || activeTool === "fib") {
      return (
       <line
        x1={s1.x} y1={s1.y}
        x2={ghostPoint.x} y2={ghostPoint.y}
        stroke="#3b82f6" strokeWidth={1.5} strokeLinecap="round"
        strokeDasharray="4 3" opacity={0.7}
       />
      );
     }
     // rect
     const rx = Math.min(s1.x, ghostPoint.x);
     const ry = Math.min(s1.y, ghostPoint.y);
     const rw = Math.abs(ghostPoint.x - s1.x);
     const rh = Math.abs(ghostPoint.y - s1.y);
     return (
      <rect
       x={rx} y={ry} width={rw} height={rh}
       fill="#8b5cf61a" stroke="#8b5cf6"
       strokeWidth={1} strokeDasharray="4 3" opacity={0.7}
      />
     );
    })()}

    {/* Ghost: crosshair dot when tool active */}
    {ghostPoint && activeTool !== "none" && activeTool !== "eraser" && (
     <circle cx={ghostPoint.x} cy={ghostPoint.y} r={3} fill="#3b82f6" opacity={0.5} />
    )}
   </svg>

   {/* Text input popover */}
   {pendingText && (
    <div
     className="absolute z-20 flex items-center gap-1 rounded border border-border bg-card px-1.5 py-1"
     style={{
      left: Math.min(pendingText.screen.x + 4, width - 180),
      top: pendingText.screen.y - 28,
      pointerEvents: "auto",
     }}
    >
     <input
      autoFocus
      value={textInput}
      onChange={(e) => setTextInput(e.target.value)}
      onKeyDown={(e) => {
       if (e.key === "Enter") commitText();
       if (e.key === "Escape") { setPendingText(null); setTextInput(""); }
      }}
      placeholder="Label..."
      className="w-32 bg-transparent text-[11px] text-foreground outline-none placeholder:text-muted-foreground"
     />
     <button
      type="button"
      onClick={commitText}
      className="rounded bg-primary/20 px-1.5 py-0.5 text-xs text-primary hover:bg-primary/30"
     >
      Add
     </button>
    </div>
   )}
  </div>
 );
}
