"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AllocationChartProps {
  cash: number;
  equities: number;
  options: number;
  tokenized: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number): string {
  return n.toFixed(1) + "%";
}

// ─── Donut chart ──────────────────────────────────────────────────────────────

interface Segment {
  label: string;
  value: number;
  color: string;
  trackColor: string;
}

const SEGMENTS_CONFIG = [
  { key: "cash",      label: "Cash",             color: "#3b82f6", trackColor: "rgba(59,130,246,0.12)"  },
  { key: "equities",  label: "Equities",          color: "#22c55e", trackColor: "rgba(34,197,94,0.12)"   },
  { key: "options",   label: "Options",           color: "#a78bfa", trackColor: "rgba(167,139,250,0.12)" },
  { key: "tokenized", label: "Tokenized Assets",  color: "#f59e0b", trackColor: "rgba(245,158,11,0.12)"  },
] as const;

function DonutChart({ segments }: { segments: Segment[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const total = segments.reduce((s, seg) => s + seg.value, 0);

  // SVG donut parameters
  const cx = 100;
  const cy = 100;
  const R = 74;   // outer radius
  const r = 48;   // inner radius (hole)

  // Build arc paths (clockwise from top)
  let cursor = -Math.PI / 2;
  const arcs = segments.map((seg, i) => {
    const pct = total > 0 ? seg.value / total : 0;
    const angle = pct * 2 * Math.PI;
    const x1 = cx + R * Math.cos(cursor);
    const y1 = cy + R * Math.sin(cursor);
    const ix1 = cx + r * Math.cos(cursor);
    const iy1 = cy + r * Math.sin(cursor);
    cursor += angle;
    const x2 = cx + R * Math.cos(cursor);
    const y2 = cy + R * Math.sin(cursor);
    const ix2 = cx + r * Math.cos(cursor);
    const iy2 = cy + r * Math.sin(cursor);
    const largeArc = angle > Math.PI ? 1 : 0;

    // "donut slice" path: outer arc CW + inner arc CCW
    const d =
      angle < 0.001
        ? ""
        : [
            `M ${x1} ${y1}`,
            `A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${ix2} ${iy2}`,
            `A ${r} ${r} 0 ${largeArc} 0 ${ix1} ${iy1}`,
            "Z",
          ].join(" ");

    const midAngle = cursor - angle / 2;
    const labelR = (R + r) / 2;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    return { d, lx, ly, pct, i, seg };
  });

  // Center text: show hovered segment or total
  const centerLabel = hovered !== null ? segments[hovered].label : "Total";
  const centerValue = hovered !== null ? fmtCurrency(segments[hovered].value) : fmtCurrency(total);
  const centerPct   = hovered !== null ? fmtPct(total > 0 ? (segments[hovered].value / total) * 100 : 0) : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={200}
        height={200}
        viewBox="0 0 200 200"
        aria-label="Portfolio allocation donut chart"
      >
        {/* Background track rings */}
        {SEGMENTS_CONFIG.map((cfg, i) => (
          <circle
            key={`track-${i}`}
            cx={cx}
            cy={cy}
            r={(R + r) / 2}
            fill="none"
            stroke={cfg.trackColor}
            strokeWidth={R - r}
          />
        )).slice(0, 1) /* single ring track */}
        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={(R + r) / 2}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={R - r}
          opacity={0.3}
        />

        {/* Donut slices */}
        {arcs.map(({ d, lx, ly, pct, i, seg }) =>
          d ? (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "default" }}
            >
              <path
                d={d}
                fill={seg.color}
                stroke="hsl(var(--background))"
                strokeWidth={2}
                opacity={hovered === null || hovered === i ? 1 : 0.45}
                style={{ transition: "opacity 0.15s" }}
              />
              {pct > 0.05 && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={9}
                  fontWeight={700}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {fmtPct(pct * 100)}
                </text>
              )}
            </g>
          ) : null,
        )}

        {/* Center label */}
        <text
          x={cx}
          y={total === 0 ? cy : cy - 9}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize={8}
          fontWeight={500}
          style={{ userSelect: "none" }}
        >
          {centerLabel.length > 14 ? centerLabel.slice(0, 13) + "…" : centerLabel}
        </text>
        {total > 0 && (
          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="hsl(var(--foreground))"
            fontSize={11}
            fontWeight={700}
            fontFamily="monospace"
            style={{ userSelect: "none" }}
          >
            {centerValue}
          </text>
        )}
        {centerPct && (
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize={8}
            style={{ userSelect: "none" }}
          >
            {centerPct}
          </text>
        )}
        {total === 0 && (
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize={9}
            style={{ userSelect: "none" }}
          >
            No positions
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="w-full space-y-1.5">
        {segments.map((seg, i) => {
          const pct = total > 0 ? (seg.value / total) * 100 : 0;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 rounded px-2 py-1 transition-colors",
                hovered === i ? "bg-muted/50" : "hover:bg-muted/30",
              )}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: seg.color }}
              />
              <span className="flex-1 text-[11px] text-muted-foreground">{seg.label}</span>
              <span className="font-mono text-[11px] tabular-nums text-foreground">
                {fmtCurrency(seg.value)}
              </span>
              <span
                className="w-9 text-right font-mono text-[10px] tabular-nums"
                style={{ color: seg.color }}
              >
                {fmtPct(pct)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AllocationChart({ cash, equities, options, tokenized }: AllocationChartProps) {
  const total = cash + equities + options + tokenized;

  const segments: Segment[] = SEGMENTS_CONFIG.map((cfg) => ({
    label:      cfg.label,
    color:      cfg.color,
    trackColor: cfg.trackColor,
    value:
      cfg.key === "cash"      ? cash      :
      cfg.key === "equities"  ? equities  :
      cfg.key === "options"   ? options   :
      tokenized,
  })).filter((seg) => seg.value > 0);

  // If everything is zero, show all four at 0 so the legend is still visible
  const displaySegments: Segment[] =
    segments.length > 0
      ? segments
      : SEGMENTS_CONFIG.map((cfg) => ({
          label:      cfg.label,
          color:      cfg.color,
          trackColor: cfg.trackColor,
          value: 0,
        }));

  return (
    <div className="space-y-2">
      <DonutChart segments={displaySegments} />

      {total === 0 && (
        <p className="text-center text-[10px] text-muted-foreground">
          Start trading to see your allocation breakdown
        </p>
      )}
    </div>
  );
}
