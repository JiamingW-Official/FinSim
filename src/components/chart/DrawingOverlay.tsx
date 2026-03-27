"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// ── Local drawing types (not stored in chart-store) ──────────────────────────

export type DrawingTool = "none" | "trendline" | "hline" | "rect" | "fib" | "text" | "eraser";

export interface DrawingPoint {
  x: number;
  y: number;
  price: number;
}

export type Drawing =
  | { id: string; type: "hline"; price: number; color: string }
  | { id: string; type: "trendline"; p1: DrawingPoint; p2: DrawingPoint; color: string }
  | { id: string; type: "rect"; p1: DrawingPoint; p2: DrawingPoint; color: string }
  | { id: string; type: "fib"; p1: DrawingPoint; p2: DrawingPoint; color: string; levels: { ratio: number; price: number }[] }
  | { id: string; type: "text"; p: DrawingPoint; text: string; color: string };

// ── Global drawing state (module-level singleton for cross-component sharing) ─

let _activeTool: DrawingTool = "none";
let _drawings: Drawing[] = [];
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
    addDrawing: (d: Drawing) => { _drawings = [..._drawings, d]; notifyListeners(); },
    removeDrawing: (id: string) => { _drawings = _drawings.filter((d) => d.id !== id); notifyListeners(); },
    clearDrawings: () => { _drawings = []; notifyListeners(); },
  };
}

// Fibonacci ratios and display labels
const FIB_LEVELS = [
  { ratio: 0, label: "0%" },
  { ratio: 0.236, label: "23.6%" },
  { ratio: 0.382, label: "38.2%" },
  { ratio: 0.5, label: "50%" },
  { ratio: 0.618, label: "61.8%" },
  { ratio: 0.786, label: "78.6%" },
  { ratio: 1, label: "100%" },
];

const FIB_COLORS = [
  "#ef4444", // 0%
  "#f97316", // 23.6%
  "#eab308", // 38.2%
  "#10b981", // 50%
  "#3b82f6", // 61.8%
  "#8b5cf6", // 78.6%
  "#ec4899", // 100%
];

interface DrawingOverlayProps {
  /** Current price at the top of the visible price range */
  priceHigh: number;
  /** Current price at the bottom of the visible price range */
  priceLow: number;
  /** Height of the SVG in pixels (matches chart container) */
  height: number;
  /** Width of the SVG in pixels */
  width: number;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/** Map a price value → a pixel Y coordinate within [0, height] */
function priceToY(price: number, high: number, low: number, height: number): number {
  if (high === low) return height / 2;
  return ((high - price) / (high - low)) * height;
}

/** Map a pixel Y coordinate → price */
function yToPrice(y: number, high: number, low: number, height: number): number {
  if (height === 0) return (high + low) / 2;
  return high - (y / height) * (high - low);
}

interface InProgressState {
  type: "trendline" | "rect" | "fib";
  p1: DrawingPoint;
  currentX: number;
  currentY: number;
}

export function DrawingOverlay({ priceHigh, priceLow, height, width }: DrawingOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { activeTool, drawings, addDrawing, removeDrawing, setActiveTool } = useDrawingStore();

  // Pending first-click point for two-click tools
  const [firstClick, setFirstClick] = useState<DrawingPoint | null>(null);
  // In-progress ghost while dragging
  const [inProgress, setInProgress] = useState<InProgressState | null>(null);
  // Pending text label input
  const [pendingText, setPendingText] = useState<{ p: DrawingPoint } | null>(null);
  const [textInput, setTextInput] = useState("");

  // Reset first-click state when tool changes
  useEffect(() => {
    setFirstClick(null);
    setInProgress(null);
    setPendingText(null);
    setTextInput("");
  }, [activeTool]);

  const getPoint = useCallback(
    (clientX: number, clientY: number): DrawingPoint | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const price = yToPrice(y, priceHigh, priceLow, height);
      return { x, y, price };
    },
    [priceHigh, priceLow, height],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!firstClick) return;
      if (activeTool !== "trendline" && activeTool !== "rect" && activeTool !== "fib") return;
      const pt = getPoint(e.clientX, e.clientY);
      if (!pt) return;
      setInProgress({
        type: activeTool as "trendline" | "rect" | "fib",
        p1: firstClick,
        currentX: pt.x,
        currentY: pt.y,
      });
    },
    [firstClick, activeTool, getPoint],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (activeTool === "none") return;

      const pt = getPoint(e.clientX, e.clientY);
      if (!pt) return;

      switch (activeTool) {
        case "hline": {
          const drawing: Drawing = {
            id: uid(),
            type: "hline",
            price: pt.price,
            color: "#f59e0b",
          };
          addDrawing(drawing);
          break;
        }

        case "trendline":
        case "rect":
        case "fib": {
          if (!firstClick) {
            setFirstClick(pt);
          } else {
            if (activeTool === "trendline") {
              addDrawing({
                id: uid(),
                type: "trendline",
                p1: firstClick,
                p2: pt,
                color: "#3b82f6",
              });
            } else if (activeTool === "rect") {
              addDrawing({
                id: uid(),
                type: "rect",
                p1: firstClick,
                p2: pt,
                color: "#8b5cf6",
              });
            } else if (activeTool === "fib") {
              const high = Math.max(firstClick.price, pt.price);
              const low = Math.min(firstClick.price, pt.price);
              const levels = FIB_LEVELS.map(({ ratio }) => ({
                ratio,
                price: high - ratio * (high - low),
              }));
              addDrawing({
                id: uid(),
                type: "fib",
                p1: firstClick,
                p2: pt,
                color: "#10b981",
                levels,
              });
            }
            setFirstClick(null);
            setInProgress(null);
          }
          break;
        }

        case "text": {
          setPendingText({ p: pt });
          setTextInput("");
          break;
        }

        case "eraser":
          // Eraser mode: clicking on a drawing removes it (handled in per-element onClick)
          break;
      }
    },
    [activeTool, firstClick, getPoint, addDrawing],
  );

  const handleDrawingClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (activeTool !== "eraser") return;
      e.stopPropagation();
      removeDrawing(id);
    },
    [activeTool, removeDrawing],
  );

  const commitText = useCallback(() => {
    if (!pendingText || !textInput.trim()) {
      setPendingText(null);
      setTextInput("");
      return;
    }
    addDrawing({
      id: uid(),
      type: "text",
      p: pendingText.p,
      text: textInput.trim(),
      color: "#f59e0b",
    });
    setPendingText(null);
    setTextInput("");
    setActiveTool("none");
  }, [pendingText, textInput, addDrawing, setActiveTool]);

  // Cursor style
  const cursorStyle =
    activeTool === "eraser"
      ? "crosshair"
      : activeTool !== "none"
        ? "crosshair"
        : "default";

  if (width === 0 || height === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10" style={{ pointerEvents: activeTool !== "none" ? "auto" : "none" }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ cursor: cursorStyle, display: "block" }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          if (!firstClick) setInProgress(null);
        }}
      >
        {/* Render committed drawings */}
        {drawings.map((d) => {
          const isEraser = activeTool === "eraser";
          const hoverClass = isEraser ? "opacity-60 cursor-pointer" : "";

          if (d.type === "trendline") {
            return (
              <g
                key={d.id}
                onClick={(e) => handleDrawingClick(e, d.id)}
                className={hoverClass}
              >
                <line
                  x1={d.p1.x}
                  y1={d.p1.y}
                  x2={d.p2.x}
                  y2={d.p2.y}
                  stroke={d.color}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                {/* Extended hit area */}
                <line
                  x1={d.p1.x}
                  y1={d.p1.y}
                  x2={d.p2.x}
                  y2={d.p2.y}
                  stroke="transparent"
                  strokeWidth={10}
                />
                <circle cx={d.p1.x} cy={d.p1.y} r={3} fill={d.color} />
                <circle cx={d.p2.x} cy={d.p2.y} r={3} fill={d.color} />
              </g>
            );
          }

          if (d.type === "hline") {
            const y = priceToY(d.price, priceHigh, priceLow, height);
            const label = `$${d.price.toFixed(2)}`;
            return (
              <g
                key={d.id}
                onClick={(e) => handleDrawingClick(e, d.id)}
                className={hoverClass}
              >
                <line
                  x1={0}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke={d.color}
                  strokeWidth={1}
                  strokeDasharray="4 3"
                />
                {/* Hit area */}
                <line
                  x1={0}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke="transparent"
                  strokeWidth={10}
                />
                <rect x={4} y={y - 8} width={label.length * 5.5 + 4} height={13} rx={2} fill="#0a0e17" opacity={0.8} />
                <text x={6} y={y + 2} fill={d.color} fontSize={9} fontFamily="monospace">
                  {label}
                </text>
              </g>
            );
          }

          if (d.type === "rect") {
            const x = Math.min(d.p1.x, d.p2.x);
            const y = Math.min(d.p1.y, d.p2.y);
            const w = Math.abs(d.p2.x - d.p1.x);
            const h = Math.abs(d.p2.y - d.p1.y);
            return (
              <g
                key={d.id}
                onClick={(e) => handleDrawingClick(e, d.id)}
                className={hoverClass}
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={`${d.color}1a`}
                  stroke={d.color}
                  strokeWidth={1}
                />
              </g>
            );
          }

          if (d.type === "fib") {
            return (
              <g
                key={d.id}
                onClick={(e) => handleDrawingClick(e, d.id)}
                className={hoverClass}
              >
                {d.levels.map((lv, i) => {
                  const y = priceToY(lv.price, priceHigh, priceLow, height);
                  const color = FIB_COLORS[i % FIB_COLORS.length];
                  const labelText = `${FIB_LEVELS[i]?.label ?? ""} $${lv.price.toFixed(2)}`;
                  return (
                    <g key={i}>
                      <line
                        x1={0}
                        y1={y}
                        x2={width}
                        y2={y}
                        stroke={color}
                        strokeWidth={i === 4 ? 1.5 : 1} // 61.8% slightly thicker
                        strokeDasharray={i === 0 || i === d.levels.length - 1 ? "none" : "4 3"}
                        opacity={0.8}
                      />
                      <rect
                        x={4}
                        y={y - 8}
                        width={labelText.length * 5 + 4}
                        height={13}
                        rx={2}
                        fill="#0a0e17"
                        opacity={0.85}
                      />
                      <text x={6} y={y + 2} fill={color} fontSize={9} fontFamily="monospace">
                        {labelText}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          }

          if (d.type === "text") {
            return (
              <g
                key={d.id}
                onClick={(e) => handleDrawingClick(e, d.id)}
                className={hoverClass}
              >
                <text
                  x={d.p.x}
                  y={d.p.y}
                  fill={d.color}
                  fontSize={11}
                  fontFamily="monospace"
                  fontWeight="500"
                  style={{ userSelect: "none" }}
                >
                  {d.text}
                </text>
              </g>
            );
          }

          return null;
        })}

        {/* Ghost: first-click dot */}
        {firstClick && (
          <circle
            cx={firstClick.x}
            cy={firstClick.y}
            r={4}
            fill="#3b82f6"
            opacity={0.8}
          />
        )}

        {/* Ghost: in-progress trendline */}
        {inProgress?.type === "trendline" && (
          <line
            x1={inProgress.p1.x}
            y1={inProgress.p1.y}
            x2={inProgress.currentX}
            y2={inProgress.currentY}
            stroke="#3b82f6"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="4 3"
            opacity={0.7}
          />
        )}

        {/* Ghost: in-progress rect */}
        {inProgress?.type === "rect" && (() => {
          const x = Math.min(inProgress.p1.x, inProgress.currentX);
          const y = Math.min(inProgress.p1.y, inProgress.currentY);
          const w = Math.abs(inProgress.currentX - inProgress.p1.x);
          const h = Math.abs(inProgress.currentY - inProgress.p1.y);
          return (
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill="#8b5cf61a"
              stroke="#8b5cf6"
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.7}
            />
          );
        })()}

        {/* Ghost: in-progress fib (show a line) */}
        {inProgress?.type === "fib" && (
          <line
            x1={inProgress.p1.x}
            y1={inProgress.p1.y}
            x2={inProgress.currentX}
            y2={inProgress.currentY}
            stroke="#10b981"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.7}
          />
        )}
      </svg>

      {/* Text input popover */}
      {pendingText && (
        <div
          className="absolute z-20 flex items-center gap-1 rounded border border-border bg-card px-1.5 py-1 shadow-lg"
          style={{
            left: Math.min(pendingText.p.x + 4, width - 180),
            top: pendingText.p.y - 28,
            pointerEvents: "auto",
          }}
        >
          <input
            autoFocus
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitText();
              if (e.key === "Escape") {
                setPendingText(null);
                setTextInput("");
              }
            }}
            placeholder="Label text…"
            className="w-32 bg-transparent text-[11px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={commitText}
            className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/30"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
