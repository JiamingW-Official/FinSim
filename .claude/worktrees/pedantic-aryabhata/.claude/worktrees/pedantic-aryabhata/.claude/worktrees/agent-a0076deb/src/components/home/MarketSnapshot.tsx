"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  PRNG — mulberry32                                                   */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Index definitions                                                   */
/* ------------------------------------------------------------------ */

interface IndexDef {
  label: string;
  baseLevel: number;
  /** max daily swing as fraction of base */
  swing: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
}

const INDICES: IndexDef[] = [
  { label: "S&P 500",    baseLevel: 5480,   swing: 0.015,  decimals: 2 },
  { label: "NASDAQ",     baseLevel: 17300,  swing: 0.02,   decimals: 2 },
  { label: "DOW",        baseLevel: 41200,  swing: 0.012,  decimals: 2 },
  { label: "VIX",        baseLevel: 18.5,   swing: 0.08,   decimals: 2 },
  { label: "10Y YIELD",  baseLevel: 4.28,   swing: 0.015,  decimals: 3, suffix: "%" },
  { label: "GOLD",       baseLevel: 2340,   swing: 0.01,   decimals: 2, prefix: "$" },
];

/* ------------------------------------------------------------------ */
/*  Data generation                                                     */
/* ------------------------------------------------------------------ */

interface IndexSnapshot {
  label: string;
  level: number;
  change: number;
  changePct: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
}

function generateSnapshot(seed: number): IndexSnapshot[] {
  const rng = mulberry32(seed);
  return INDICES.map((idx) => {
    // directional drift: random sign with some skew toward the middle
    const raw = rng() * 2 - 1; // -1 to +1
    const changeFraction = raw * idx.swing;
    const change = idx.baseLevel * changeFraction;
    const level = idx.baseLevel + change;
    const changePct = (change / idx.baseLevel) * 100;
    return {
      label: idx.label,
      level: parseFloat(level.toFixed(idx.decimals)),
      change: parseFloat(change.toFixed(idx.decimals)),
      changePct: parseFloat(changePct.toFixed(2)),
      decimals: idx.decimals,
      prefix: idx.prefix,
      suffix: idx.suffix,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Index card                                                          */
/* ------------------------------------------------------------------ */

function IndexCard({ snap }: { snap: IndexSnapshot }) {
  const up = snap.changePct >= 0;
  const sign = up ? "+" : "";
  const formatted = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: snap.decimals,
      maximumFractionDigits: snap.decimals,
    });

  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium truncate">
        {snap.label}
      </span>
      <span className="text-[12px] font-semibold tabular-nums leading-tight">
        {snap.prefix ?? ""}{formatted(snap.level)}{snap.suffix ?? ""}
      </span>
      <span
        className={cn(
          "flex items-center gap-0.5 text-[10px] tabular-nums font-medium",
          up ? "text-green-400" : "text-red-400",
        )}
      >
        {up ? (
          <TrendingUp className="h-2.5 w-2.5 flex-shrink-0" />
        ) : (
          <TrendingDown className="h-2.5 w-2.5 flex-shrink-0" />
        )}
        {sign}{snap.changePct.toFixed(2)}%
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function MarketSnapshot() {
  const dailySeed = useMemo(() => Math.floor(Date.now() / 86400000), []);
  const [tick, setTick] = useState(0);

  // Refresh every 30 s — add tick as a minor perturbation to the seed
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const snapshots = useMemo(
    () => generateSnapshot(dailySeed + tick),
    [dailySeed, tick],
  );

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Market Overview
        </span>
        <span className="text-[9px] text-muted-foreground/60">
          Simulated · refreshes every 30s
        </span>
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-6">
        {snapshots.map((snap) => (
          <IndexCard key={snap.label} snap={snap} />
        ))}
      </div>
    </div>
  );
}
