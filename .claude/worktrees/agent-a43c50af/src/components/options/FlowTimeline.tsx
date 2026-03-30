"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { UnusualActivityItem } from "@/types/options";

// ── Props ─────────────────────────────────────────────────────────────────────

interface FlowTimelineProps {
  items: UnusualActivityItem[];
}

// ── PRNG (mulberry32) ─────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Market session constants ──────────────────────────────────────────────────

const SESSION_START_MIN = 9 * 60 + 30;  // 9:30 in minutes from midnight
const SESSION_END_MIN   = 16 * 60;       // 16:00 in minutes from midnight
const SESSION_DURATION  = SESSION_END_MIN - SESSION_START_MIN; // 390 min

// ── Format helpers ────────────────────────────────────────────────────────────

function formatPremium(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ── Timeline item with PRNG-seeded time ──────────────────────────────────────

interface PlottedItem {
  item: UnusualActivityItem;
  minuteFromOpen: number; // 0–390
  xPct: number;           // 0–1
  r: number;              // bubble radius
}

function buildPlottedItems(items: UnusualActivityItem[]): PlottedItem[] {
  return items.map((item) => {
    // Seed from ticker char code so same ticker always gets same spread
    const seed = item.ticker.charCodeAt(0) * 100 + item.strike;
    const rand = mulberry32(seed);
    const minuteFromOpen = Math.floor(rand() * SESSION_DURATION);
    const xPct = minuteFromOpen / SESSION_DURATION;

    // Bubble radius: log-scale of premium, clamped to [4, 18]
    const r = Math.min(18, Math.max(4, Math.log10(Math.max(item.premium, 10)) * 3));

    return { item, minuteFromOpen, xPct, r };
  });
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

interface TooltipData {
  item: UnusualActivityItem;
  x: number;
  y: number;
}

function Tooltip({ data }: { data: TooltipData }) {
  const { item, x, y } = data;
  const isBullish = item.sentiment === "bullish";
  const isBearish = item.sentiment === "bearish";

  return (
    <foreignObject
      x={Math.min(x - 80, 600 - 175)}
      y={Math.max(y - 110, 2)}
      width={170}
      height={100}
      style={{ pointerEvents: "none" }}
    >
      <div
        className="rounded-md border border-border/60 bg-card p-2 shadow-lg"
        style={{ fontSize: 10 }}
      >
        <div className="mb-1 flex items-center gap-1.5">
          <span
            className={cn(
              "font-semibold",
              isBullish ? "text-green-400" : isBearish ? "text-red-400" : "text-muted-foreground",
            )}
          >
            {item.ticker}
          </span>
          <span
            className={cn(
              "rounded px-1 py-px text-[9px] font-medium",
              item.type === "call"
                ? "bg-green-500/15 text-green-400"
                : "bg-red-500/15 text-red-400",
            )}
          >
            {item.type === "call" ? "CALL" : "PUT"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px]">
          <span className="text-muted-foreground">Strike</span>
          <span className="font-medium tabular-nums">${item.strike}</span>
          <span className="text-muted-foreground">Premium</span>
          <span className="font-medium tabular-nums text-orange-400">
            {formatPremium(item.premium)}
          </span>
          <span className="text-muted-foreground">Type</span>
          <span className="font-medium">
            {item.orderType === "floor"
              ? "Floor"
              : item.orderType === "sweep"
              ? "Sweep"
              : "Normal"}
          </span>
          <span className="text-muted-foreground">Sentiment</span>
          <span
            className={cn(
              "font-medium capitalize",
              isBullish ? "text-green-400" : isBearish ? "text-red-400" : "",
            )}
          >
            {item.sentiment}
          </span>
        </div>
      </div>
    </foreignObject>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const SVG_W = 600;
const SVG_H = 120;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 24;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const PLOT_H = SVG_H - PAD_T - PAD_B;

// X-axis tick marks: every hour from 9:30 to 4:00
const X_TICKS = [0, 30, 90, 150, 210, 270, 330, 390].map((min) => ({
  min,
  label: minutesToLabel(SESSION_START_MIN + min),
  xPct: min / SESSION_DURATION,
}));

export function FlowTimeline({ items }: FlowTimelineProps) {
  const [hovered, setHovered] = useState<TooltipData | null>(null);

  const plotted = buildPlottedItems(items);

  // Y position: scatter vertically within plot area based on premium magnitude
  // so larger trades appear higher (more prominent)
  const maxPremium = Math.max(...items.map((i) => i.premium), 1);

  return (
    <div className="shrink-0 border-b border-border/50 bg-card/30 px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground">
          Flow Timeline — Today&apos;s Session
        </p>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400/80" />
            Calls
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-400/80" />
            Puts
          </span>
          <span className="text-muted-foreground/60">Bubble size = premium</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxHeight: SVG_H, display: "block", overflow: "visible" }}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Background grid */}
        {X_TICKS.map(({ xPct, label }) => {
          const x = PAD_L + xPct * PLOT_W;
          return (
            <g key={label}>
              <line
                x1={x}
                y1={PAD_T}
                x2={x}
                y2={PAD_T + PLOT_H}
                stroke="currentColor"
                strokeWidth={0.5}
                strokeDasharray="2,3"
                className="text-border/40"
              />
              <text
                x={x}
                y={PAD_T + PLOT_H + 10}
                textAnchor="middle"
                fontSize={7}
                className="fill-muted-foreground/50"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Y-axis label */}
        <text
          x={PAD_L - 4}
          y={PAD_T + PLOT_H / 2}
          textAnchor="middle"
          fontSize={7}
          transform={`rotate(-90, ${PAD_L - 10}, ${PAD_T + PLOT_H / 2})`}
          className="fill-muted-foreground/40"
        >
          Size
        </text>

        {/* Plot area border */}
        <rect
          x={PAD_L}
          y={PAD_T}
          width={PLOT_W}
          height={PLOT_H}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.5}
          className="text-border/30"
        />

        {/* Bubbles */}
        {plotted.map(({ item, xPct, r }) => {
          const x = PAD_L + xPct * PLOT_W;
          // Y: larger premium = higher (lower y value in SVG)
          const yPct = 1 - item.premium / maxPremium;
          const y = PAD_T + yPct * PLOT_H * 0.85 + PLOT_H * 0.075;
          const isCall = item.type === "call";
          const isHighlighted =
            hovered?.item.id === item.id;

          return (
            <g key={item.id}>
              {/* Outer glow ring for large trades */}
              {item.premium >= 500_000 && (
                <circle
                  cx={x}
                  cy={y}
                  r={r + 4}
                  fill="none"
                  stroke={isCall ? "#4ade80" : "#f87171"}
                  strokeWidth={0.8}
                  opacity={0.3}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={isCall ? "#4ade80" : "#f87171"}
                fillOpacity={isHighlighted ? 0.9 : 0.55}
                stroke={isCall ? "#4ade80" : "#f87171"}
                strokeWidth={isHighlighted ? 1.5 : 0.8}
                strokeOpacity={isHighlighted ? 1 : 0.7}
                style={{ cursor: "pointer", transition: "fill-opacity 0.15s" }}
                onMouseEnter={(e) => {
                  const svgEl = (e.currentTarget as SVGCircleElement).ownerSVGElement;
                  if (!svgEl) return;
                  const rect = svgEl.getBoundingClientRect();
                  const svgX = ((e.clientX - rect.left) / rect.width) * SVG_W;
                  const svgY = ((e.clientY - rect.top) / rect.height) * SVG_H;
                  setHovered({ item, x: svgX, y: svgY });
                }}
              />
            </g>
          );
        })}

        {/* Tooltip */}
        {hovered && <Tooltip data={hovered} />}
      </svg>
    </div>
  );
}
