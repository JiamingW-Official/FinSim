"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

// ── Sector definitions ────────────────────────────────────────────────────────

interface SectorData {
  name: string;
  shortName: string;
  etf: string;
  returns: {
    "1M": number;
    "3M": number;
    "6M": number;
    "12M": number;
  };
}

// Seeded PRNG for deterministic synthetic data
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate realistic sector return profiles seeded by name
function generateSectorReturns(name: string): SectorData["returns"] {
  const rand = mulberry32(
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 9301,
  );

  // 12M base return in range [-15, +35]
  const base12 = rand() * 50 - 15;
  // 6M is roughly half of 12M with noise
  const base6 = base12 * 0.52 + (rand() * 10 - 5);
  // 3M has more noise
  const base3 = base6 * 0.48 + (rand() * 8 - 4);
  // 1M is very noisy
  const base1 = base3 * 0.3 + (rand() * 6 - 3);

  return {
    "1M": Math.round(base1 * 10) / 10,
    "3M": Math.round(base3 * 10) / 10,
    "6M": Math.round(base6 * 10) / 10,
    "12M": Math.round(base12 * 10) / 10,
  };
}

const ALL_SECTORS: Omit<SectorData, "returns">[] = [
  { name: "Technology", shortName: "Tech", etf: "XLK" },
  { name: "Health Care", shortName: "Health", etf: "XLV" },
  { name: "Financials", shortName: "Fin.", etf: "XLF" },
  { name: "Consumer Disc.", shortName: "Cons. D.", etf: "XLY" },
  { name: "Industrials", shortName: "Ind.", etf: "XLI" },
  { name: "Communication Svcs", shortName: "Comm.", etf: "XLC" },
  { name: "Energy", shortName: "Energy", etf: "XLE" },
  { name: "Consumer Staples", shortName: "Staples", etf: "XLP" },
  { name: "Utilities", shortName: "Util.", etf: "XLU" },
  { name: "Real Estate", shortName: "RE", etf: "XLRE" },
  { name: "Materials", shortName: "Mat.", etf: "XLB" },
];

// ── Return cell ───────────────────────────────────────────────────────────────

function ReturnCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "font-mono tabular-nums text-[11px] font-medium",
        positive ? "text-green-500" : "text-red-500",
      )}
    >
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

// ── Momentum bar ─────────────────────────────────────────────────────────────

function MomentumBar({ value, max }: { value: number; max: number }) {
  const pct = Math.abs(value) / max;
  const positive = value >= 0;
  return (
    <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          positive ? "bg-green-500" : "bg-red-500",
        )}
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}

// ── Flow signal banner ────────────────────────────────────────────────────────

function FlowSignal({ sectors }: { sectors: SectorData[] }) {
  const sorted3M = [...sectors].sort((a, b) => b.returns["3M"] - a.returns["3M"]);
  const top2 = sorted3M.slice(0, 2).map((s) => s.shortName);
  const bot2 = sorted3M.slice(-2).map((s) => s.shortName);

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-2 text-[11px]">
      <span className="text-muted-foreground font-medium">Rotation signal:</span>
      <span className="text-muted-foreground">Money flowing</span>
      <span className="text-green-500 font-medium">INTO {top2.join(", ")}</span>
      <span className="text-muted-foreground">and</span>
      <span className="text-red-500 font-medium">OUT OF {bot2.join(", ")}</span>
      <span className="text-muted-foreground">based on 3-month momentum.</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SectorMomentum() {
  const sectors: SectorData[] = useMemo(
    () =>
      ALL_SECTORS.map((s) => ({
        ...s,
        returns: generateSectorReturns(s.name),
      })),
    [],
  );

  // Sort by 3M momentum descending
  const sorted = useMemo(
    () => [...sectors].sort((a, b) => b.returns["3M"] - a.returns["3M"]),
    [sectors],
  );

  const max3M = useMemo(
    () => Math.max(...sectors.map((s) => Math.abs(s.returns["3M"]))),
    [sectors],
  );

  const TIMEFRAMES = ["1M", "3M", "6M", "12M"] as const;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4 hover:border-border/60 transition-colors">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold">Sector Momentum</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          1M / 3M / 6M / 12M total returns, sorted by 3-month performance
        </p>
      </div>

      {/* Flow signal */}
      <FlowSignal sectors={sectors} />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 pr-3 text-[10px] font-medium text-muted-foreground w-36">
                Sector
              </th>
              <th className="pb-2 pr-3 text-[10px] font-medium text-muted-foreground text-right">
                ETF
              </th>
              {TIMEFRAMES.map((tf) => (
                <th
                  key={tf}
                  className={cn(
                    "pb-2 px-2 text-[10px] font-medium text-muted-foreground text-right",
                    tf === "3M" && "text-foreground",
                  )}
                >
                  {tf}
                </th>
              ))}
              <th className="pb-2 pl-2 text-[10px] font-medium text-muted-foreground">
                3M trend
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((sector, i) => {
              const isTop = i < 3;
              const isBot = i >= sorted.length - 3;
              return (
                <tr
                  key={sector.name}
                  className={cn(
                    "border-b border-border/40 transition-colors hover:bg-muted/30",
                    isTop && "bg-green-500/3",
                    isBot && "bg-red-500/3",
                  )}
                >
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-1.5">
                      {/* rank badge for top/bot */}
                      {isTop && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      )}
                      {isBot && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      )}
                      {!isTop && !isBot && (
                        <span className="w-1.5 h-1.5 shrink-0" />
                      )}
                      <span className="text-[11px] font-medium truncate">
                        {sector.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {sector.etf}
                    </span>
                  </td>
                  {TIMEFRAMES.map((tf) => (
                    <td key={tf} className={cn("py-2 px-2 text-right", tf === "3M" && "font-semibold")}>
                      <ReturnCell value={sector.returns[tf]} />
                    </td>
                  ))}
                  <td className="py-2 pl-2">
                    <MomentumBar value={sector.returns["3M"]} max={max3M} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Top 3 by 3M momentum
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Bottom 3 by 3M momentum
        </div>
        <span className="ml-auto">Synthetic data for educational purposes</span>
      </div>
    </div>
  );
}
