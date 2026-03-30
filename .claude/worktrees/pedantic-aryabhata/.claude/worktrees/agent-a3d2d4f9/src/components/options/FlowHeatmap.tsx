"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { OptionChainExpiry } from "@/types/options";

// ── Props ─────────────────────────────────────────────────────────────────────

interface FlowHeatmapProps {
  chain: OptionChainExpiry[];
  spotPrice: number;
}

// ── Format helpers ────────────────────────────────────────────────────────────

function formatPremium(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatVol(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function shortExpiry(expiry: string): string {
  // "2026-03-21" → "Mar 21"
  const date = new Date(expiry + "T12:00:00Z");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

// ── Heatmap data ──────────────────────────────────────────────────────────────

interface CellData {
  strike: number;
  expiry: string;
  callVol: number;
  putVol: number;
  callOI: number;
  putOI: number;
  callPremium: number; // approximate: vol * mid * 100
  putPremium: number;
  netVol: number;  // callVol - putVol (positive = net call)
}

function buildHeatmapData(
  chain: OptionChainExpiry[],
  spotPrice: number,
  atmRadius: number,
): { expiries: OptionChainExpiry[]; strikes: number[]; cells: Map<string, CellData> } {
  // Take up to 6 expiries
  const expiries = chain.slice(0, 6);

  // Determine ATM-center strike set from front month, ±atmRadius strikes
  const frontMonth = chain[0];
  if (!frontMonth) return { expiries: [], strikes: [], cells: new Map() };

  const atmCall = frontMonth.calls.reduce((best, c) =>
    Math.abs(c.strike - spotPrice) < Math.abs(best.strike - spotPrice) ? c : best,
  );
  const atmStrike = atmCall.strike;
  const atmIdx = frontMonth.calls.findIndex((c) => c.strike === atmStrike);

  // Build strike list from front-month, centered on ATM
  const lo = Math.max(0, atmIdx - atmRadius);
  const hi = Math.min(frontMonth.calls.length - 1, atmIdx + atmRadius);
  const strikes = frontMonth.calls.slice(lo, hi + 1).map((c) => c.strike);

  // Build cell map keyed "strike-expiry"
  const cells = new Map<string, CellData>();

  for (const exp of expiries) {
    for (const call of exp.calls) {
      if (!strikes.includes(call.strike)) continue;
      const put = exp.puts.find((p) => p.strike === call.strike);
      const callPremium = call.volume * call.mid * 100;
      const putPremium = (put?.volume ?? 0) * (put?.mid ?? 0) * 100;
      const key = `${call.strike}-${exp.expiry}`;
      cells.set(key, {
        strike: call.strike,
        expiry: exp.expiry,
        callVol: call.volume,
        putVol: put?.volume ?? 0,
        callOI: call.openInterest,
        putOI: put?.openInterest ?? 0,
        callPremium,
        putPremium,
        netVol: call.volume - (put?.volume ?? 0),
      });
    }
  }

  return { expiries, strikes: [...strikes].reverse(), cells }; // reverse so higher strikes are at top
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

interface TooltipState {
  cell: CellData;
  svgX: number;
  svgY: number;
}

function HeatmapTooltip({ tip, svgW, svgH }: { tip: TooltipState; svgW: number; svgH: number }) {
  const { cell, svgX, svgY } = tip;
  const TT_W = 160;
  const TT_H = 92;
  const x = Math.min(svgX + 8, svgW - TT_W - 4);
  const y = Math.max(svgY - TT_H - 4, 2);

  return (
    <foreignObject x={x} y={y} width={TT_W} height={TT_H} style={{ pointerEvents: "none" }}>
      <div
        className="rounded-md border border-border/70 bg-card p-2 shadow-xl"
        style={{ fontSize: 10 }}
      >
        <div className="mb-1.5 flex items-center gap-2 font-semibold">
          <span className="tabular-nums">${cell.strike}</span>
          <span className="text-muted-foreground font-normal">{shortExpiry(cell.expiry)}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5" style={{ fontSize: 9.5 }}>
          <span className="text-green-400">Call vol</span>
          <span className="tabular-nums font-medium">{formatVol(cell.callVol)}</span>
          <span className="text-red-400">Put vol</span>
          <span className="tabular-nums font-medium">{formatVol(cell.putVol)}</span>
          <span className="text-muted-foreground">Net vol</span>
          <span
            className={cn(
              "tabular-nums font-semibold",
              cell.netVol > 0 ? "text-green-400" : cell.netVol < 0 ? "text-red-400" : "text-muted-foreground",
            )}
          >
            {cell.netVol > 0 ? "+" : ""}{formatVol(cell.netVol)}
          </span>
          <span className="text-muted-foreground">Premium</span>
          <span className="tabular-nums font-medium text-orange-400">
            {formatPremium(cell.callPremium + cell.putPremium)}
          </span>
        </div>
      </div>
    </foreignObject>
  );
}

// ── SVG layout constants ──────────────────────────────────────────────────────

const SVG_W = 500;
const SVG_H = 300;
const PAD_L = 44;   // left margin for strike labels
const PAD_R = 8;
const PAD_T = 28;   // top margin for expiry labels
const PAD_B = 8;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const PLOT_H = SVG_H - PAD_T - PAD_B;
const ATM_RADIUS = 10; // ±10 strikes from ATM

// ── Color mapping ─────────────────────────────────────────────────────────────
// netVol > 0 → green, < 0 → red; intensity from 0..maxAbs

function cellColor(netVol: number, maxAbs: number): { fill: string; fillOpacity: number } {
  if (maxAbs === 0 || netVol === 0) return { fill: "#6b7280", fillOpacity: 0.08 };
  const intensity = Math.min(1, Math.abs(netVol) / maxAbs);
  const opacity = 0.1 + intensity * 0.75;
  return {
    fill: netVol > 0 ? "#4ade80" : "#f87171",
    fillOpacity: opacity,
  };
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
      <span className="flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-400 opacity-70" />
        Net call flow
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400 opacity-70" />
        Net put flow
      </span>
      <span className="text-muted-foreground/50">Intensity = volume</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function FlowHeatmap({ chain, spotPrice }: FlowHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const { expiries, strikes, cells } = useMemo(
    () => buildHeatmapData(chain, spotPrice, ATM_RADIUS),
    [chain, spotPrice],
  );

  const maxAbsNetVol = useMemo(() => {
    let max = 0;
    cells.forEach((c) => { if (Math.abs(c.netVol) > max) max = Math.abs(c.netVol); });
    return max;
  }, [cells]);

  if (expiries.length === 0 || strikes.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-[11px] text-muted-foreground">
        No chain data available
      </div>
    );
  }

  const nExp = expiries.length;
  const nStrike = strikes.length;
  const cellW = PLOT_W / nExp;
  const cellH = PLOT_H / nStrike;

  return (
    <div className="px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground">
          Flow Heatmap — Strike x Expiry (ATM ± {ATM_RADIUS} strikes)
        </p>
        <Legend />
      </div>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxHeight: SVG_H, display: "block", overflow: "visible" }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Expiry column headers */}
        {expiries.map((exp, eIdx) => {
          const x = PAD_L + eIdx * cellW + cellW / 2;
          return (
            <text
              key={exp.expiry}
              x={x}
              y={PAD_T - 6}
              textAnchor="middle"
              fontSize={7.5}
              className="fill-muted-foreground/70"
            >
              {shortExpiry(exp.expiry)}
            </text>
          );
        })}

        {/* Strike row labels */}
        {strikes.map((strike, sIdx) => {
          const y = PAD_T + sIdx * cellH + cellH / 2 + 3;
          const isAtm = Math.abs(strike - spotPrice) < 0.5 * (strikes[0] - strikes[1] || 5);
          return (
            <text
              key={strike}
              x={PAD_L - 4}
              y={y}
              textAnchor="end"
              fontSize={7}
              className={cn(
                isAtm ? "fill-orange-400/80 font-semibold" : "fill-muted-foreground/60",
              )}
            >
              {strike}
            </text>
          );
        })}

        {/* Cells */}
        {strikes.map((strike, sIdx) =>
          expiries.map((exp, eIdx) => {
            const key = `${strike}-${exp.expiry}`;
            const cell = cells.get(key);
            const x = PAD_L + eIdx * cellW;
            const y = PAD_T + sIdx * cellH;

            const { fill, fillOpacity } = cell
              ? cellColor(cell.netVol, maxAbsNetVol)
              : { fill: "#6b7280", fillOpacity: 0.05 };

            const netVol = cell?.netVol ?? 0;
            const label =
              Math.abs(netVol) >= 1000
                ? `${netVol > 0 ? "+" : ""}${Math.round(netVol / 1000)}K`
                : netVol !== 0
                ? `${netVol > 0 ? "+" : ""}${netVol}`
                : "";

            return (
              <g
                key={key}
                onMouseEnter={(e) => {
                  if (!cell) return;
                  const svgEl = (e.currentTarget as SVGGElement).ownerSVGElement;
                  if (!svgEl) return;
                  const rect = svgEl.getBoundingClientRect();
                  const svgX = ((e.clientX - rect.left) / rect.width) * SVG_W;
                  const svgY = ((e.clientY - rect.top) / rect.height) * SVG_H;
                  setTooltip({ cell, svgX, svgY });
                }}
                style={{ cursor: cell ? "pointer" : "default" }}
              >
                {/* Cell background */}
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={cellW - 2}
                  height={cellH - 2}
                  rx={2}
                  fill={fill}
                  fillOpacity={fillOpacity}
                  stroke={fill}
                  strokeOpacity={fillOpacity * 0.5}
                  strokeWidth={0.5}
                />

                {/* Net vol label (only if cell is wide enough) */}
                {cellW > 40 && cellH > 14 && label && (
                  <text
                    x={x + cellW / 2}
                    y={y + cellH / 2 + 3}
                    textAnchor="middle"
                    fontSize={Math.min(8, cellH * 0.45)}
                    fill={netVol > 0 ? "#4ade80" : "#f87171"}
                    fillOpacity={0.9}
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          }),
        )}

        {/* ATM horizontal indicator line */}
        {(() => {
          const atmStrikeIdx = strikes.findIndex(
            (s) => Math.abs(s - spotPrice) === Math.min(...strikes.map((s2) => Math.abs(s2 - spotPrice))),
          );
          if (atmStrikeIdx < 0) return null;
          const y = PAD_T + atmStrikeIdx * cellH;
          return (
            <rect
              x={PAD_L - 2}
              y={y}
              width={PLOT_W + 2}
              height={cellH}
              fill="none"
              stroke="#f97316"
              strokeWidth={1}
              strokeOpacity={0.4}
              strokeDasharray="3,3"
              rx={2}
              style={{ pointerEvents: "none" }}
            />
          );
        })()}

        {/* Tooltip */}
        {tooltip && (
          <HeatmapTooltip tip={tooltip} svgW={SVG_W} svgH={SVG_H} />
        )}
      </svg>
    </div>
  );
}
