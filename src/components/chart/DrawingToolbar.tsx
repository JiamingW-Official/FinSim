"use client";

import { useDrawingStore, type DrawingTool } from "@/components/chart/DrawingOverlay";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  TrendingUp,
  Minus,
  GripVertical,
  Square,
  GitBranch,
  Type,
  Eraser,
  Trash2,
  Undo2,
  MousePointer2,
} from "lucide-react";

interface ToolConfig {
  tool: DrawingTool;
  title: string;
  icon: React.ReactNode;
}

const SELECTION_TOOLS: ToolConfig[] = [
  {
    tool: "none",
    title: "Pointer — exit drawing mode",
    icon: <MousePointer2 className="h-3.5 w-3.5" />,
  },
  {
    tool: "eraser",
    title: "Eraser — click a drawing to remove it",
    icon: <Eraser className="h-3.5 w-3.5" />,
  },
];

const LINE_TOOLS: ToolConfig[] = [
  {
    tool: "trendline",
    title: "Trendline — click two points",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
  },
  {
    tool: "hline",
    title: "Horizontal line — click to place",
    icon: <Minus className="h-3.5 w-3.5" />,
  },
  {
    tool: "vline",
    title: "Vertical line — click to place",
    icon: <GripVertical className="h-3.5 w-3.5" />,
  },
];

const SHAPE_TOOLS: ToolConfig[] = [
  {
    tool: "rect",
    title: "Rectangle / consolidation box — click and drag",
    icon: <Square className="h-3.5 w-3.5" />,
  },
  {
    tool: "fib",
    title: "Fibonacci retracement — click swing high then swing low",
    icon: <GitBranch className="h-3.5 w-3.5" />,
  },
];

const TEXT_TOOLS: ToolConfig[] = [
  {
    tool: "text",
    title: "Text label — click to place",
    icon: <Type className="h-3.5 w-3.5" />,
  },
];

function ToolButton({
  tool,
  title,
  icon,
  activeTool,
  onClick,
}: ToolConfig & { activeTool: DrawingTool; onClick: () => void }) {
  const isActive = activeTool === tool;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={title}
          onClick={onClick}
          className={cn(
            "h-7 w-7 flex items-center justify-center rounded-none transition-colors",
            isActive
              ? "bg-primary/10 text-primary/70 border-r-2 border-primary/50"
              : "text-muted-foreground/25 hover:text-muted-foreground/60 hover:bg-foreground/[0.03]",
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={6} className="text-[10px]">
        {title}
      </TooltipContent>
    </Tooltip>
  );
}

function ToolSep() {
  return <div className="h-px bg-border/20 mx-1.5 my-0.5" />;
}

export function DrawingToolbar() {
  const { activeTool, drawings, setActiveTool, clearDrawings, removeDrawing } = useDrawingStore();

  const handleToolClick = (tool: DrawingTool) => {
    // "none" (pointer) always resets; all other tools toggle off on re-click
    setActiveTool(tool === "none" || activeTool === tool ? "none" : tool);
  };

  const handleUndo = () => {
    if (drawings.length > 0) {
      const last = drawings[drawings.length - 1];
      removeDrawing(last.id);
    }
  };

  return (
    <div className="flex flex-col items-center w-7 bg-background border-r border-border/20 py-1">

      {/* Group 1: Selection / Eraser */}
      {SELECTION_TOOLS.map((cfg) => (
        <ToolButton
          key={cfg.tool}
          {...cfg}
          activeTool={activeTool}
          onClick={() => handleToolClick(cfg.tool)}
        />
      ))}

      <ToolSep />

      {/* Group 2: Lines */}
      {LINE_TOOLS.map((cfg) => (
        <ToolButton
          key={cfg.tool}
          {...cfg}
          activeTool={activeTool}
          onClick={() => handleToolClick(cfg.tool)}
        />
      ))}

      <ToolSep />

      {/* Group 3: Shapes */}
      {SHAPE_TOOLS.map((cfg) => (
        <ToolButton
          key={cfg.tool}
          {...cfg}
          activeTool={activeTool}
          onClick={() => handleToolClick(cfg.tool)}
        />
      ))}

      <ToolSep />

      {/* Group 4: Text */}
      {TEXT_TOOLS.map((cfg) => (
        <ToolButton
          key={cfg.tool}
          {...cfg}
          activeTool={activeTool}
          onClick={() => handleToolClick(cfg.tool)}
        />
      ))}

      <ToolSep />

      {/* Group 5: Undo + Clear all */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Undo last drawing"
            onClick={handleUndo}
            disabled={drawings.length === 0}
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-none transition-colors",
              drawings.length > 0
                ? "text-muted-foreground/25 hover:text-muted-foreground/60 hover:bg-foreground/[0.03]"
                : "text-muted-foreground/10 cursor-not-allowed",
            )}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={6} className="text-[10px]">
          Undo last drawing
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Clear all drawings"
            onClick={clearDrawings}
            disabled={drawings.length === 0}
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-none transition-colors",
              drawings.length > 0
                ? "text-muted-foreground/25 hover:text-destructive/50 hover:bg-destructive/[0.04]"
                : "text-muted-foreground/10 cursor-not-allowed",
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={6} className="text-[10px]">
          Clear all drawings
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
