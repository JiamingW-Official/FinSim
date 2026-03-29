"use client";

import { useDrawingStore, type DrawingTool } from "@/components/chart/DrawingOverlay";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ToolConfig {
  tool: DrawingTool;
  label: string;
  title: string;
  /** Inline SVG icon as JSX */
  icon: React.ReactNode;
}

// Thin inline SVG icons for each tool
function TrendlineIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="13" x2="14" y2="3" />
      <circle cx="2" cy="13" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="14" cy="3" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function HLineIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 1.5">
      <line x1="1" y1="8" x2="15" y2="8" />
    </svg>
  );
}

function VLineIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 1.5">
      <line x1="8" y1="1" x2="8" y2="15" />
    </svg>
  );
}

function RectIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="12" height="8" rx="0.5" />
    </svg>
  );
}

function FibIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <line x1="1" y1="3" x2="15" y2="3" />
      <line x1="1" y1="6" x2="15" y2="6" />
      <line x1="1" y1="8" x2="15" y2="8" strokeWidth="1.5" />
      <line x1="1" y1="10" x2="15" y2="10" />
      <line x1="1" y1="13" x2="15" y2="13" />
      <text x="1" y="15.5" fontSize="4" fill="currentColor" stroke="none" fontFamily="monospace">0.618</text>
    </svg>
  );
}

function TextIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
      <text x="2" y="13" fontSize="12" fontFamily="monospace" fontWeight="bold">T</text>
    </svg>
  );
}

function EraserIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 13 L6 13 L14 5 L10 1 L3 8 Z" />
      <line x1="6" y1="13" x2="14" y2="5" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7 L3 3 L7 3" />
      <path d="M3 3 C5 1 12 1 13 7 C14 11 10 14 7 13" />
    </svg>
  );
}

const TOOLS: ToolConfig[] = [
  {
    tool: "trendline",
    label: "TL",
    title: "Trendline — click two points",
    icon: <TrendlineIcon />,
  },
  {
    tool: "hline",
    label: "HL",
    title: "Horizontal line — click to place",
    icon: <HLineIcon />,
  },
  {
    tool: "vline",
    label: "VL",
    title: "Vertical line — click to place",
    icon: <VLineIcon />,
  },
  {
    tool: "rect",
    label: "RB",
    title: "Rectangle / consolidation box — click and drag",
    icon: <RectIcon />,
  },
  {
    tool: "fib",
    label: "FIB",
    title: "Fibonacci retracement — click swing high then swing low",
    icon: <FibIcon />,
  },
  {
    tool: "text",
    label: "TXT",
    title: "Text label — click to place",
    icon: <TextIcon />,
  },
];

export function DrawingToolbar() {
  const { activeTool, drawings, setActiveTool, clearDrawings, removeDrawing } = useDrawingStore();

  const handleToolClick = (tool: DrawingTool) => {
    // Clicking the active tool deselects it
    setActiveTool(activeTool === tool ? "none" : tool);
  };

  const handleErase = () => {
    if (drawings.length > 0) {
      clearDrawings();
    }
    // If already on eraser, deactivate; otherwise activate for per-click removal
    setActiveTool(activeTool === "eraser" ? "none" : "eraser");
  };

  const handleUndo = () => {
    if (drawings.length > 0) {
      // Remove the last drawing
      const last = drawings[drawings.length - 1];
      removeDrawing(last.id);
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5 border-r border-border/20 bg-card px-1 py-1.5">
      {TOOLS.map(({ tool, title, icon }) => (
        <Tooltip key={tool}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={title}
              onClick={() => handleToolClick(tool)}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded transition-colors",
                activeTool === tool
                  ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
              )}
            >
              {icon}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={6} className="text-xs">
            {title}
          </TooltipContent>
        </Tooltip>
      ))}

      {/* Divider */}
      <div className="my-0.5 h-px w-4 bg-border/50" />

      {/* Undo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Undo last drawing"
            onClick={handleUndo}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded transition-colors",
              drawings.length > 0
                ? "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                : "text-muted-foreground/30",
            )}
            disabled={drawings.length === 0}
          >
            <UndoIcon />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={6} className="text-xs">
          Undo last drawing
        </TooltipContent>
      </Tooltip>

      {/* Eraser */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Clear all drawings"
            onClick={handleErase}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded transition-colors",
              activeTool === "eraser"
                ? "bg-destructive/20 text-destructive ring-1 ring-destructive/40"
                : drawings.length > 0
                  ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  : "text-muted-foreground/30",
            )}
          >
            <EraserIcon />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={6} className="text-xs">
          {activeTool === "eraser" ? "Click a drawing to remove it" : "Clear all drawings"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
