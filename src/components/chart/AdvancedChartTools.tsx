"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdvancedChartToolsProps {
  ticker: string;
  currentPrice: number;
  priceHistory: number[]; // array of closing prices
}

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  title,
  badge,
  children,
  defaultOpen = true,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-foreground">
            {title}
          </span>
          {badge}
        </div>
        {open ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 p-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        color,
      )}
    >
      {children}
    </span>
  );
}

function StatRow({
  label,
  value,
  valueClass,
  tooltip,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-2.5 w-2.5 text-muted-foreground/50 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[160px] text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <span className={cn("text-xs font-medium tabular-nums", valueClass)}>{value}</span>
    </div>
  );
}

// ─── Section 1: Market Profile (TPO) ─────────────────────────────────────────

function MarketProfileSection({ currentPrice, seed }: { currentPrice: number; seed: number }) {
  const rand = useMemo(() => makeRng(seed), [seed]);

  const LEVELS = 26;
  const LOW_PRICE = currentPrice * 0.87;
  const HIGH_PRICE = currentPrice * 1.13;
  const priceStep = (HIGH_PRICE - LOW_PRICE) / (LEVELS - 1);

  // 26 letters = A–Z, each representing a 30-min TPO period
  const TPO_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const NUM_PERIODS = 13; // 6.5h trading day = 13 × 30min

  // Simulate time spent at each level: bell-curve around currentPrice
  const levelData = useMemo(() => {
    const r = makeRng(seed + 1);
    return Array.from({ length: LEVELS }, (_, i) => {
      const price = LOW_PRICE + i * priceStep;
      const distFromCurrent = Math.abs(price - currentPrice) / (currentPrice * 0.13);
      // Base weight: higher near current price
      const baseWeight = Math.exp(-distFromCurrent * 2.5);
      // Add randomness per period
      const letters: string[] = [];
      for (let p = 0; p < NUM_PERIODS; p++) {
        // Probability of this period hitting this price level
        const prob = baseWeight * (0.5 + r() * 0.5);
        if (r() < prob) {
          letters.push(TPO_LETTERS[p]);
        }
      }
      return { price, letters, tpoCount: letters.length };
    });
  }, [seed, currentPrice, LOW_PRICE, priceStep]);

  const maxTpo = Math.max(1, ...levelData.map((l) => l.tpoCount));
  const pocIdx = levelData.reduce((best, l, i) =>
    l.tpoCount > levelData[best].tpoCount ? i : best,
    0,
  );

  // Value Area: 70% of total TPO counts centered on POC
  const totalTpo = levelData.reduce((s, l) => s + l.tpoCount, 0);
  const vaTarget = totalTpo * 0.7;
  let vaSum = levelData[pocIdx].tpoCount;
  let vaLow = pocIdx;
  let vaHigh = pocIdx;
  while (vaSum < vaTarget && (vaLow > 0 || vaHigh < LEVELS - 1)) {
    const expandUp = vaHigh < LEVELS - 1 ? (levelData[vaHigh + 1]?.tpoCount ?? 0) : -1;
    const expandDn = vaLow > 0 ? (levelData[vaLow - 1]?.tpoCount ?? 0) : -1;
    if (expandUp >= expandDn && vaHigh < LEVELS - 1) {
      vaHigh++;
      vaSum += levelData[vaHigh].tpoCount;
    } else if (vaLow > 0) {
      vaLow--;
      vaSum += levelData[vaLow].tpoCount;
    } else {
      break;
    }
  }

  const svgW = 320;
  const svgH = 260;
  const padLeft = 56;
  const padRight = 8;
  const padTop = 8;
  const padBottom = 8;
  const rowH = (svgH - padTop - padBottom) / LEVELS;
  const maxBarW = svgW - padLeft - padRight - 60; // leave 60px for letters

  const pocPrice = levelData[pocIdx].price;
  const vaLowPrice = levelData[vaLow].price;
  const vaHighPrice = levelData[vaHigh].price;

  return (
    <Section
      title="Market Profile (TPO)"
      badge={<Badge color="bg-yellow-500/15 text-yellow-400">TPO</Badge>}
    >
      <div className="mb-2 flex flex-wrap gap-3 text-xs">
        <StatRow
          label="POC"
          value={`$${pocPrice.toFixed(2)}`}
          valueClass="text-yellow-400"
          tooltip="Point of Control — price level with most time spent"
        />
        <StatRow
          label="VAH"
          value={`$${vaHighPrice.toFixed(2)}`}
          valueClass="text-primary"
          tooltip="Value Area High — top of 70% volume zone"
        />
        <StatRow
          label="VAL"
          value={`$${vaLowPrice.toFixed(2)}`}
          valueClass="text-primary"
          tooltip="Value Area Low — bottom of 70% volume zone"
        />
      </div>

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full"
        style={{ maxHeight: 280 }}
      >
        {levelData.map((level, i) => {
          const revI = LEVELS - 1 - i; // flip so low price is at bottom
          const y = padTop + revI * rowH;
          const barW = Math.max(2, (level.tpoCount / maxTpo) * maxBarW);
          const isPoc = i === pocIdx;
          const isVA = i >= vaLow && i <= vaHigh;

          const barColor = isPoc
            ? "#facc15" // yellow-400
            : isVA
            ? "#3b82f6" // blue-500
            : "#6b7280"; // gray-500

          const isCurrentPrice =
            Math.abs(level.price - currentPrice) < priceStep * 0.5;

          return (
            <g key={i}>
              {/* Price label */}
              <text
                x={padLeft - 3}
                y={y + rowH * 0.7}
                textAnchor="end"
                fontSize={6.5}
                fill={isCurrentPrice ? "#f59e0b" : "#6b7280"}
                fontWeight={isCurrentPrice ? "bold" : "normal"}
              >
                {level.price.toFixed(1)}
              </text>

              {/* Bar */}
              <rect
                x={padLeft}
                y={y + 0.5}
                width={barW}
                height={rowH - 1}
                fill={barColor}
                fillOpacity={isPoc ? 0.9 : isVA ? 0.55 : 0.35}
                rx={1}
              />

              {/* TPO letters inside bar */}
              {level.letters.slice(0, 12).map((letter, li) => (
                <text
                  key={li}
                  x={padLeft + li * 8 + 4}
                  y={y + rowH * 0.72}
                  fontSize={6}
                  fill={isPoc ? "#78350f" : isVA ? "#1e3a5f" : "#d1d5db"}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {letter}
                </text>
              ))}

              {/* Current price arrow */}
              {isCurrentPrice && (
                <polygon
                  points={`${padLeft - 3},${y + rowH / 2} ${padLeft - 7},${y + rowH / 2 - 3} ${padLeft - 7},${y + rowH / 2 + 3}`}
                  fill="#f59e0b"
                />
              )}
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${padLeft + maxBarW + 8}, ${padTop})`}>
          <rect x={0} y={0} width={8} height={8} fill="#facc15" fillOpacity={0.9} rx={1} />
          <text x={11} y={7} fontSize={7} fill="#9ca3af">POC</text>
          <rect x={0} y={13} width={8} height={8} fill="#3b82f6" fillOpacity={0.55} rx={1} />
          <text x={11} y={20} fontSize={7} fill="#9ca3af">VA</text>
          <rect x={0} y={26} width={8} height={8} fill="#6b7280" fillOpacity={0.35} rx={1} />
          <text x={11} y={33} fontSize={7} fill="#9ca3af">Other</text>
        </g>
      </svg>

      <p className="mt-1 text-[11px] text-muted-foreground">
        Each letter A–Z represents a 30-min trading period. Wider bars indicate more time spent at
        that price. POC = price with most TPO letters.
      </p>
    </Section>
  );
}

// ─── Section 2: Volume Profile ────────────────────────────────────────────────

function VolumeProfileSection({
  currentPrice,
  priceHistory,
  seed,
}: {
  currentPrice: number;
  priceHistory: number[];
  seed: number;
}) {
  const LEVELS = 20;
  const LOW_PRICE = currentPrice * 0.90;
  const HIGH_PRICE = currentPrice * 1.10;
  const priceStep = (HIGH_PRICE - LOW_PRICE) / (LEVELS - 1);

  const { levels, vwap, vwapPctDiff } = useMemo(() => {
    const r = makeRng(seed + 10);

    // Simulate VWAP from price history
    const prices = priceHistory.length >= 5 ? priceHistory.slice(-20) : [currentPrice];
    const simulatedVwap =
      prices.reduce((s, p) => s + p * (0.8 + r() * 0.4), 0) /
      prices.reduce((s, _, i) => s + (0.8 + r() * 0.4) * (i + 1), 0) || currentPrice;
    const clampedVwap = Math.max(LOW_PRICE, Math.min(HIGH_PRICE, simulatedVwap));
    const pctDiff = ((currentPrice - clampedVwap) / clampedVwap) * 100;

    const data = Array.from({ length: LEVELS }, (_, i) => {
      const price = LOW_PRICE + i * priceStep;
      const distFromCurrent = Math.abs(price - currentPrice) / (currentPrice * 0.1);
      const baseVol = Math.exp(-distFromCurrent * 1.8) * 1_000_000;
      const vol = baseVol * (0.6 + r() * 0.8);
      return { price, volume: vol };
    });

    const maxVol = Math.max(...data.map((d) => d.volume));
    const avgVol = data.reduce((s, d) => s + d.volume, 0) / LEVELS;
    const hvnThreshold = avgVol * 1.3;
    const lvnThreshold = avgVol * 0.6;

    return {
      levels: data.map((d) => ({
        ...d,
        isHVN: d.volume >= hvnThreshold,
        isLVN: d.volume <= lvnThreshold,
        pct: d.volume / maxVol,
      })),
      vwap: clampedVwap,
      vwapPctDiff: pctDiff,
    };
  }, [seed, currentPrice, priceHistory, LOW_PRICE, priceStep]);

  const svgW = 320;
  const svgH = 220;
  const padLeft = 52;
  const padRight = 50;
  const padTop = 8;
  const padBottom = 8;
  const rowH = (svgH - padTop - padBottom) / LEVELS;
  const maxBarW = svgW - padLeft - padRight;

  const vwapY =
    padTop +
    (LEVELS - 1 - (vwap - LOW_PRICE) / priceStep) * rowH +
    rowH / 2;

  return (
    <Section
      title="Volume Profile"
      badge={<Badge color="bg-emerald-500/15 text-emerald-400">VPVR</Badge>}
    >
      <div className="mb-2 grid grid-cols-3 gap-1">
        <StatRow
          label="VWAP"
          value={`$${vwap.toFixed(2)}`}
          valueClass="text-primary"
          tooltip="Volume Weighted Average Price"
        />
        <StatRow
          label="vs VWAP"
          value={`${vwapPctDiff >= 0 ? "+" : ""}${vwapPctDiff.toFixed(2)}%`}
          valueClass={vwapPctDiff >= 0 ? "text-emerald-400" : "text-red-400"}
        />
        <StatRow
          label="HVN count"
          value={levels.filter((l) => l.isHVN).length}
          valueClass="text-amber-400"
          tooltip="High Volume Nodes — strong S/R levels"
        />
      </div>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 240 }}>
        {levels.map((level, i) => {
          const revI = LEVELS - 1 - i;
          const y = padTop + revI * rowH;
          const barW = Math.max(2, level.pct * maxBarW);

          const barColor = level.isHVN ? "#f59e0b" : level.isLVN ? "#3b82f6" : "#6b7280";
          const fillOp = level.isHVN ? 0.75 : level.isLVN ? 0.55 : 0.35;

          const isCurrentPrice =
            Math.abs(level.price - currentPrice) < priceStep * 0.5;

          return (
            <g key={i}>
              <text
                x={padLeft - 3}
                y={y + rowH * 0.72}
                textAnchor="end"
                fontSize={6.5}
                fill={isCurrentPrice ? "#f59e0b" : "#6b7280"}
                fontWeight={isCurrentPrice ? "bold" : "normal"}
              >
                {level.price.toFixed(1)}
              </text>
              <rect
                x={padLeft}
                y={y + 0.5}
                width={barW}
                height={rowH - 1}
                fill={barColor}
                fillOpacity={fillOp}
                rx={1}
              />
              {level.isHVN && (
                <text
                  x={padLeft + barW + 3}
                  y={y + rowH * 0.72}
                  fontSize={6}
                  fill="#f59e0b"
                  fontWeight="bold"
                >
                  HVN
                </text>
              )}
              {level.isLVN && (
                <text
                  x={padLeft + barW + 3}
                  y={y + rowH * 0.72}
                  fontSize={6}
                  fill="#60a5fa"
                >
                  LVN
                </text>
              )}
              {isCurrentPrice && (
                <polygon
                  points={`${padLeft - 3},${y + rowH / 2} ${padLeft - 7},${y + rowH / 2 - 3} ${padLeft - 7},${y + rowH / 2 + 3}`}
                  fill="#f59e0b"
                />
              )}
            </g>
          );
        })}

        {/* VWAP line */}
        <line
          x1={padLeft}
          y1={vwapY}
          x2={padLeft + maxBarW}
          y2={vwapY}
          stroke="#a855f7"
          strokeWidth={1.5}
          strokeDasharray="4 2"
        />
        <text
          x={padLeft + maxBarW + 3}
          y={vwapY + 3}
          fontSize={7}
          fill="#a855f7"
          fontWeight="bold"
        >
          VWAP
        </text>
      </svg>

      <div className="mt-1 flex gap-3 text-[11px]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-amber-500/75" />
          <span className="text-muted-foreground">HVN = strong S/R</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-primary/55" />
          <span className="text-muted-foreground">LVN = thin area</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-primary" style={{ borderTop: "1px dashed #a855f7" }} />
          <span className="text-muted-foreground">VWAP</span>
        </span>
      </div>
    </Section>
  );
}

// ─── Section 3: Pivot Points Calculator ──────────────────────────────────────

interface PivotSet {
  label: string;
  pp: number;
  r1: number; r2: number; r3: number;
  s1: number; s2: number; s3: number;
}

function computeClassicPivots(h: number, l: number, c: number): PivotSet {
  const pp = (h + l + c) / 3;
  return {
    label: "Classic",
    pp,
    r1: 2 * pp - l,
    r2: pp + (h - l),
    r3: h + 2 * (pp - l),
    s1: 2 * pp - h,
    s2: pp - (h - l),
    s3: l - 2 * (h - pp),
  };
}

function computeFibPivots(h: number, l: number, c: number): PivotSet {
  const pp = (h + l + c) / 3;
  const range = h - l;
  return {
    label: "Fibonacci",
    pp,
    r1: pp + range * 0.382,
    r2: pp + range * 0.618,
    r3: pp + range * 1.0,
    s1: pp - range * 0.382,
    s2: pp - range * 0.618,
    s3: pp - range * 1.0,
  };
}

function computeCamarillaPivots(h: number, l: number, c: number): PivotSet {
  const range = h - l;
  return {
    label: "Camarilla",
    pp: (h + l + c) / 3,
    r1: c + range * 1.1 / 12,
    r2: c + range * 1.1 / 6,
    r3: c + range * 1.1 / 4,
    s1: c - range * 1.1 / 12,
    s2: c - range * 1.1 / 6,
    s3: c - range * 1.1 / 4,
  };
}

function computeWoodiePivots(h: number, l: number, c: number): PivotSet {
  const pp = (h + l + 2 * c) / 4;
  return {
    label: "Woodie",
    pp,
    r1: 2 * pp - l,
    r2: pp + h - l,
    r3: h + 2 * (pp - l),
    s1: 2 * pp - h,
    s2: pp - h + l,
    s3: l - 2 * (h - pp),
  };
}

function PivotPointsSection({
  currentPrice,
  seed,
}: {
  currentPrice: number;
  seed: number;
}) {
  const [selectedType, setSelectedType] = useState<"Classic" | "Fibonacci" | "Camarilla" | "Woodie">("Classic");

  const { pivotSets, selected } = useMemo(() => {
    const r = makeRng(seed + 20);
    // Simulate prior day H/L/C
    const prevHigh = currentPrice * (1.01 + r() * 0.03);
    const prevLow = currentPrice * (0.96 + r() * 0.02);
    const prevClose = prevLow + (prevHigh - prevLow) * (0.3 + r() * 0.4);

    const sets: PivotSet[] = [
      computeClassicPivots(prevHigh, prevLow, prevClose),
      computeFibPivots(prevHigh, prevLow, prevClose),
      computeCamarillaPivots(prevHigh, prevLow, prevClose),
      computeWoodiePivots(prevHigh, prevLow, prevClose),
    ];

    const sel = sets.find((s) => s.label === selectedType) ?? sets[0];
    return { pivotSets: sets, selected: sel };
  }, [seed, currentPrice, selectedType]);

  // Mini SVG chart
  const svgW = 320;
  const svgH = 130;
  const padL = 50;
  const padR = 45;
  const padT = 8;
  const padB = 8;
  const chartH = svgH - padT - padB;

  const allLevels = [selected.s3, selected.s2, selected.s1, selected.pp, selected.r1, selected.r2, selected.r3];
  const minPrice = Math.min(...allLevels, currentPrice) * 0.998;
  const maxPrice = Math.max(...allLevels, currentPrice) * 1.002;
  const priceRange = maxPrice - minPrice;

  const toY = (price: number) =>
    padT + chartH - ((price - minPrice) / priceRange) * chartH;

  const levelColors: Record<string, string> = {
    R3: "#ef4444",
    R2: "#f87171",
    R1: "#fca5a5",
    PP: "#fbbf24",
    S1: "#86efac",
    S2: "#4ade80",
    S3: "#22c55e",
  };

  const levelDash: Record<string, string> = {
    PP: "none",
    R1: "4 2",
    R2: "4 2",
    R3: "4 2",
    S1: "4 2",
    S2: "4 2",
    S3: "4 2",
  };

  const namedLevels = [
    { key: "R3", val: selected.r3 },
    { key: "R2", val: selected.r2 },
    { key: "R1", val: selected.r1 },
    { key: "PP", val: selected.pp },
    { key: "S1", val: selected.s1 },
    { key: "S2", val: selected.s2 },
    { key: "S3", val: selected.s3 },
  ];

  return (
    <Section
      title="Pivot Points"
      badge={<Badge color="bg-amber-500/15 text-amber-400">P.P.</Badge>}
    >
      {/* Type selector */}
      <div className="mb-2 flex gap-1">
        {(["Classic", "Fibonacci", "Camarilla", "Woodie"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setSelectedType(t)}
            className={cn(
              "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
              selectedType === t
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* SVG chart */}
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 140 }}>
        {/* Price background */}
        <rect x={padL} y={padT} width={svgW - padL - padR} height={chartH} fill="currentColor" className="text-muted/10" rx={2} />

        {namedLevels.map(({ key, val }) => {
          const y = toY(val);
          const color = levelColors[key];
          const dash = levelDash[key];
          const dist = ((val - currentPrice) / currentPrice) * 100;

          return (
            <g key={key}>
              <line
                x1={padL}
                y1={y}
                x2={svgW - padR}
                y2={y}
                stroke={color}
                strokeWidth={key === "PP" ? 1.5 : 1}
                strokeDasharray={dash}
                opacity={0.9}
              />
              <text x={padL - 3} y={y + 3} textAnchor="end" fontSize={7} fill={color} fontWeight="bold">
                {key}
              </text>
              <text x={svgW - padR + 3} y={y + 3} fontSize={6.5} fill={color}>
                {val.toFixed(2)}
              </text>
              <text x={svgW - 2} y={y + 3} textAnchor="end" fontSize={6} fill="#9ca3af">
                {dist >= 0 ? "+" : ""}{dist.toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* Current price line */}
        <line
          x1={padL}
          y1={toY(currentPrice)}
          x2={svgW - padR}
          y2={toY(currentPrice)}
          stroke="#f59e0b"
          strokeWidth={1.5}
          opacity={0.8}
        />
        <text x={svgW - padR + 3} y={toY(currentPrice) + 3} fontSize={7} fill="#f59e0b" fontWeight="bold">
          {currentPrice.toFixed(2)}
        </text>
      </svg>

      {/* Table */}
      <div className="mt-2 grid grid-cols-4 gap-x-1">
        {namedLevels.map(({ key, val }) => {
          const dist = ((val - currentPrice) / currentPrice) * 100;
          return (
            <div key={key} className="flex items-center justify-between py-0.5 col-span-1">
              <span className="text-[11px] font-bold" style={{ color: levelColors[key] }}>
                {key}
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {dist >= 0 ? "+" : ""}{dist.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-1.5 text-[11px] text-muted-foreground">
        {selected.label} pivots based on prior day H/L/C. PP = primary support/resistance.
      </p>
    </Section>
  );
}

// ─── Section 4: Market Breadth ────────────────────────────────────────────────

function MarketBreadthSection({ seed }: { seed: number }) {
  const data = useMemo(() => {
    const r = makeRng(seed + 40);
    const N = 20;

    const adRaw: number[] = [];
    let advances = 0;
    let declines = 0;

    for (let i = 0; i < N; i++) {
      advances = Math.floor(1800 + r() * 800);
      declines = Math.floor(1200 + r() * 800);
      adRaw.push(advances - declines);
    }

    // A/D Line (cumulative)
    const adLine: number[] = [];
    let cumAD = 0;
    for (const v of adRaw) {
      cumAD += v;
      adLine.push(cumAD);
    }

    // New 52W Highs/Lows
    const highs = Math.floor(80 + r() * 120);
    const lows = Math.floor(20 + r() * 60);

    // EMA helpers
    const ema = (arr: number[], k: number): number[] => {
      const out: number[] = [arr[0]];
      const mult = k / (1 + 1 / (k / 100));
      // simple approximation: k% smoothing constant = 2/(n+1) where n = 100/k - 1
      // For McClellan: 10% EMA uses smoothing 0.1, 5% uses 0.05
      const sm = k / 100;
      for (let i = 1; i < arr.length; i++) {
        out.push(sm * arr[i] + (1 - sm) * out[i - 1]);
      }
      return out;
    };

    const adRatio = adRaw.map((v) => v / 3000);
    const ema10 = ema(adRatio, 10);
    const ema5 = ema(adRatio, 5);
    const mco: number[] = ema10.map((v, i) => (v - ema5[i]) * 100);

    let summation = 0;
    const summationArr: number[] = mco.map((v) => (summation += v));

    // TRIN (last period)
    const upVol = Math.floor(900_000_000 + r() * 400_000_000);
    const downVol = Math.floor(600_000_000 + r() * 400_000_000);
    const lastAdvances = Math.floor(1800 + r() * 600);
    const lastDeclines = Math.floor(1200 + r() * 600);
    const trin =
      lastAdvances / lastDeclines / (upVol / downVol);

    return {
      adLine,
      adRaw,
      highs,
      lows,
      mco,
      summation: summationArr,
      trin,
      lastAdvances,
      lastDeclines,
    };
  }, [seed]);

  const adMin = Math.min(...data.adLine);
  const adMax = Math.max(...data.adLine);
  const mcoMin = Math.min(...data.mco);
  const mcoMax = Math.max(...data.mco);

  const svgW = 320;
  const adH = 60;
  const mcoH = 50;
  const padL = 10;
  const padR = 10;
  const N = data.adLine.length;

  const toAdY = (v: number) =>
    4 + (adH - 8) - ((v - adMin) / Math.max(1, adMax - adMin)) * (adH - 8);
  const toMcoY = (v: number) =>
    4 + (mcoH - 8) - ((v - mcoMin) / Math.max(1, mcoMax - mcoMin)) * (mcoH - 8);

  const barW = (svgW - padL - padR) / N;

  const adPath = data.adLine
    .map((v, i) => `${i === 0 ? "M" : "L"} ${padL + i * barW + barW / 2},${toAdY(v)}`)
    .join(" ");

  const mcoPath = data.mco
    .map((v, i) => `${i === 0 ? "M" : "L"} ${padL + i * barW + barW / 2},${toMcoY(v)}`)
    .join(" ");

  const trinColor =
    data.trin < 0.8 ? "text-emerald-400" : data.trin > 1.2 ? "text-red-400" : "text-amber-400";
  const trinLabel =
    data.trin < 0.8 ? "Bullish" : data.trin > 1.2 ? "Bearish" : "Neutral";

  const lastMco = data.mco[data.mco.length - 1];
  const lastSum = data.summation[data.summation.length - 1];

  return (
    <Section
      title="Market Breadth"
      badge={<Badge color="bg-primary/15 text-primary">BREADTH</Badge>}
    >
      <div className="mb-2 grid grid-cols-2 gap-x-4">
        <StatRow label="52W Highs" value={data.highs} valueClass="text-emerald-400" />
        <StatRow label="52W Lows" value={data.lows} valueClass="text-red-400" />
        <StatRow
          label="McClellan Osc"
          value={lastMco.toFixed(1)}
          valueClass={lastMco >= 0 ? "text-emerald-400" : "text-red-400"}
          tooltip="10% EMA minus 5% EMA of A/D ratio × 100"
        />
        <StatRow
          label="Summation"
          value={lastSum.toFixed(0)}
          valueClass={lastSum >= 0 ? "text-emerald-400" : "text-red-400"}
          tooltip="Cumulative McClellan Oscillator"
        />
        <StatRow
          label="TRIN (Arms)"
          value={data.trin.toFixed(2)}
          valueClass={trinColor}
          tooltip="(A/D ratio) ÷ (UpVol/DnVol). <0.8 = strong buying; >1.2 = strong selling"
        />
        <StatRow label="Signal" value={trinLabel} valueClass={trinColor} />
      </div>

      {/* A/D Line */}
      <p className="mb-0.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
        A/D Line (20 periods)
      </p>
      <svg viewBox={`0 0 ${svgW} ${adH}`} className="w-full" style={{ maxHeight: 64 }}>
        <rect x={padL} y={4} width={svgW - padL - padR} height={adH - 8} fill="currentColor" className="text-muted/10" rx={2} />
        <path d={adPath} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
        {data.adLine.map((v, i) => (
          <circle key={i} cx={padL + i * barW + barW / 2} cy={toAdY(v)} r={1.5} fill="#60a5fa" />
        ))}
      </svg>

      {/* McClellan Oscillator */}
      <p className="mb-0.5 mt-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
        McClellan Oscillator
      </p>
      <svg viewBox={`0 0 ${svgW} ${mcoH}`} className="w-full" style={{ maxHeight: 54 }}>
        <rect x={padL} y={4} width={svgW - padL - padR} height={mcoH - 8} fill="currentColor" className="text-muted/10" rx={2} />
        {/* Zero line */}
        {mcoMin < 0 && mcoMax > 0 && (
          <line
            x1={padL}
            y1={toMcoY(0)}
            x2={svgW - padR}
            y2={toMcoY(0)}
            stroke="#6b7280"
            strokeWidth={0.75}
            strokeDasharray="3 2"
          />
        )}
        {/* Bars */}
        {data.mco.map((v, i) => {
          const zeroY = mcoMin >= 0 ? mcoH - 4 : mcoMax <= 0 ? 4 : toMcoY(0);
          const barTop = v >= 0 ? toMcoY(v) : zeroY;
          const barHeight = Math.abs(toMcoY(v) - zeroY);
          return (
            <rect
              key={i}
              x={padL + i * barW + 1}
              y={barTop}
              width={barW - 2}
              height={Math.max(1, barHeight)}
              fill={v >= 0 ? "#34d399" : "#f87171"}
              fillOpacity={0.7}
              rx={0.5}
            />
          );
        })}
        <path d={mcoPath} fill="none" stroke="#a78bfa" strokeWidth={1} opacity={0.7} />
      </svg>
    </Section>
  );
}

// ─── Section 5: Elliott Wave Labeler ─────────────────────────────────────────

interface WavePoint {
  x: number;
  y: number;
  label: string;
  isImpulse: boolean;
  tooltip: string;
}

function ElliottWaveSection({
  currentPrice,
  seed,
}: {
  currentPrice: number;
  seed: number;
}) {
  const { points, currentWave, fibRelationships } = useMemo(() => {
    const r = makeRng(seed + 60);

    // Generate a 5-wave impulse + 3-wave corrective (a-b-c)
    // Wave structure: 0→1 up, 1→2 down (retracement), 2→3 up (longest), 3→4 down, 4→5 up
    // Then corrective: 5→a down, a→b up, b→c down
    const basePrice = currentPrice;

    // Wave 1 magnitude
    const w1Mag = basePrice * (0.04 + r() * 0.04);
    const p0 = 0;
    const p1 = p0 + w1Mag;
    // Wave 2: 38.2%–61.8% retracement of Wave 1
    const w2Ret = 0.382 + r() * 0.236;
    const p2 = p1 - w1Mag * w2Ret;
    // Wave 3: 1.618 × Wave 1 (Fibonacci)
    const w3Mag = w1Mag * (1.5 + r() * 0.5); // ~1.618
    const p3 = p2 + w3Mag;
    // Wave 4: 23.6%–38.2% retracement of Wave 3
    const w4Ret = 0.236 + r() * 0.146;
    const p4 = p3 - w3Mag * w4Ret;
    // Wave 5: 61.8%–100% of Wave 1
    const w5Mag = w1Mag * (0.618 + r() * 0.382);
    const p5 = p4 + w5Mag;
    // Corrective a: 38.2%–50% of impulse from p0 to p5
    const impulseRange = p5 - p0;
    const waMag = impulseRange * (0.382 + r() * 0.118);
    const pa = p5 - waMag;
    // b: retrace 38.2% of a
    const wbMag = waMag * (0.382 + r() * 0.236);
    const pb = pa + wbMag;
    // c: ~equal to a
    const wcMag = waMag * (0.9 + r() * 0.2);
    const pc = pb - wcMag;

    const prices = [p0, p1, p2, p3, p4, p5, pa, pb, pc];
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP;

    // SVG dimensions
    const svgW = 300;
    const svgH = 120;
    const padL = 12;
    const padR = 12;
    const padT = 18;
    const padB = 10;
    const drawW = svgW - padL - padR;
    const drawH = svgH - padT - padB;

    const normX = (i: number) => padL + (i / 8) * drawW;
    const normY = (p: number) =>
      padT + drawH - ((p - minP) / Math.max(0.001, range)) * drawH;

    const wavePoints: WavePoint[] = [
      { x: normX(0), y: normY(p0), label: "0", isImpulse: true, tooltip: "Wave origin — starting point of the impulse" },
      { x: normX(1.2), y: normY(p1), label: "1", isImpulse: true, tooltip: "Wave 1 — initial impulsive move in trend direction" },
      { x: normX(2), y: normY(p2), label: "2", isImpulse: true, tooltip: `Wave 2 — corrective retracement (${(w2Ret * 100).toFixed(0)}% of W1)` },
      { x: normX(3.5), y: normY(p3), label: "3", isImpulse: true, tooltip: `Wave 3 — strongest wave, ${(w3Mag / w1Mag).toFixed(2)}× Wave 1. Never shortest.` },
      { x: normX(4.5), y: normY(p4), label: "4", isImpulse: true, tooltip: `Wave 4 — correction (${(w4Ret * 100).toFixed(0)}% of W3). Must not overlap Wave 1.` },
      { x: normX(5.8), y: normY(p5), label: "5", isImpulse: true, tooltip: "Wave 5 — final push, often with divergence on indicators" },
      { x: normX(6.5), y: normY(pa), label: "a", isImpulse: false, tooltip: "Wave A — first leg of corrective ABC pattern" },
      { x: normX(7.2), y: normY(pb), label: "b", isImpulse: false, tooltip: "Wave B — counter-trend bounce within correction" },
      { x: normX(8), y: normY(pc), label: "c", isImpulse: false, tooltip: "Wave C — final corrective leg, often equals Wave A" },
    ];

    // Determine current wave (simplified: based on price position)
    const pricePos = (currentPrice - (basePrice - basePrice * 0.02 + minP)) / range;
    let cw = "3"; // default: likely in strongest wave
    if (pricePos > 0.9) cw = "5";
    else if (pricePos > 0.7) cw = "4-5";
    else if (pricePos > 0.5) cw = "3";
    else cw = "1-2";

    return {
      points: wavePoints,
      currentWave: cw,
      fibRelationships: [
        { rel: "W3/W1 ratio", val: (w3Mag / w1Mag).toFixed(3), ideal: "1.618" },
        { rel: "W5/W1 ratio", val: (w5Mag / w1Mag).toFixed(3), ideal: "0.618–1.0" },
        { rel: "W2 retracement", val: `${(w2Ret * 100).toFixed(1)}%`, ideal: "38.2–61.8%" },
        { rel: "W4 retracement", val: `${(w4Ret * 100).toFixed(1)}%`, ideal: "23.6–38.2%" },
      ],
    };
  }, [seed, currentPrice]);

  // Build SVG path
  const wavePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");

  // Split into impulse (0–5) and corrective (5–c)
  const impulsePath = points
    .slice(0, 6)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");
  const correctivePath = points
    .slice(5)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");

  return (
    <Section
      title="Elliott Wave Labeler"
      badge={<Badge color="bg-primary/15 text-primary">EW</Badge>}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Likely wave in progress:</span>
        <Badge color="bg-primary/20 text-primary">{currentWave}</Badge>
      </div>

      <svg viewBox="0 0 300 120" className="w-full" style={{ maxHeight: 130 }}>
        {/* Background */}
        <rect x={12} y={0} width={276} height={120} fill="currentColor" className="text-muted/10" rx={3} />

        {/* Impulse path */}
        <path d={impulsePath} fill="none" stroke="#60a5fa" strokeWidth={1.5} />
        {/* Corrective path */}
        <path d={correctivePath} fill="none" stroke="#f87171" strokeWidth={1.5} strokeDasharray="4 2" />

        {/* Wave points */}
        {points.map((pt, i) => {
          const isCorrectiveLabel = ["a", "b", "c"].includes(pt.label);
          const color = isCorrectiveLabel ? "#f87171" : "#60a5fa";
          const labelY = i % 2 === 0 ? pt.y - 7 : pt.y + 13;

          return (
            <g key={pt.label}>
              <circle cx={pt.x} cy={pt.y} r={3} fill={color} opacity={0.9} />
              <text
                x={pt.x}
                y={labelY}
                textAnchor="middle"
                fontSize={8}
                fontWeight="bold"
                fill={color}
              >
                {isCorrectiveLabel ? `(${pt.label})` : pt.label}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <line x1={15} y1={108} x2={30} y2={108} stroke="#60a5fa" strokeWidth={1.5} />
        <text x={33} y={111} fontSize={7} fill="#9ca3af">Impulse</text>
        <line x1={68} y1={108} x2={83} y2={108} stroke="#f87171" strokeWidth={1.5} strokeDasharray="4 2" />
        <text x={86} y={111} fontSize={7} fill="#9ca3af">Corrective</text>
      </svg>

      {/* Fibonacci relationships */}
      <p className="mt-2 mb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
        Fibonacci Relationships
      </p>
      <div className="grid grid-cols-2 gap-x-3">
        {fibRelationships.map((f) => (
          <div key={f.rel} className="flex flex-col py-0.5">
            <span className="text-[11px] text-muted-foreground">{f.rel}</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-foreground tabular-nums">{f.val}</span>
              <span className="text-[11px] text-muted-foreground/60">ideal: {f.ideal}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Wave tooltips */}
      <p className="mt-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        Wave Descriptions
      </p>
      <div className="grid grid-cols-1 gap-0.5">
        {points.slice(1).map((pt) => (
          <div key={pt.label} className="flex items-start gap-1.5">
            <span
              className={cn(
                "mt-0.5 shrink-0 rounded px-1 py-0 text-[11px] font-bold",
                ["a", "b", "c"].includes(pt.label)
                  ? "bg-red-500/15 text-red-400"
                  : "bg-primary/15 text-primary",
              )}
            >
              {["a", "b", "c"].includes(pt.label) ? `(${pt.label})` : pt.label}
            </span>
            <span className="text-[11px] text-muted-foreground">{pt.tooltip}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Section 6: Wyckoff Analysis ─────────────────────────────────────────────

type WyckoffPhase = "Accumulation" | "Markup" | "Distribution" | "Markdown";
type WyckoffEvent =
  | "PS" | "SC" | "AR" | "ST" | "Spring" | "Test" | "SOS" | "LPS"
  | "PSY" | "BC" | "SOW" | "LPSY" | "UTAD";

interface WyckoffEventItem {
  key: WyckoffEvent;
  label: string;
  desc: string;
  phase: WyckoffPhase[];
  bullish: boolean;
}

const WYCKOFF_EVENTS: WyckoffEventItem[] = [
  { key: "PS", label: "Preliminary Support", desc: "First sign that buying is stepping in to halt the downtrend", phase: ["Accumulation"], bullish: true },
  { key: "SC", label: "Selling Climax", desc: "Intense selling on high volume — panic bottom", phase: ["Accumulation"], bullish: true },
  { key: "AR", label: "Automatic Rally", desc: "Sharp bounce after SC as shorts cover and bargain hunters buy", phase: ["Accumulation"], bullish: true },
  { key: "ST", label: "Secondary Test", desc: "Price re-tests SC area on lower volume to check supply", phase: ["Accumulation"], bullish: true },
  { key: "Spring", label: "Spring (Shakeout)", desc: "False breakdown below support to flush weak longs — classic trap", phase: ["Accumulation"], bullish: true },
  { key: "Test", label: "Test of Spring", desc: "Volume confirms that supply was absorbed in the Spring", phase: ["Accumulation"], bullish: true },
  { key: "SOS", label: "Sign of Strength", desc: "Price moves up on wide spread and increased volume", phase: ["Accumulation", "Markup"], bullish: true },
  { key: "LPS", label: "Last Point of Support", desc: "Final pullback before major markup — excellent entry", phase: ["Markup"], bullish: true },
  { key: "PSY", label: "Preliminary Supply", desc: "First sign of distribution — selling begins to emerge", phase: ["Distribution"], bullish: false },
  { key: "BC", label: "Buying Climax", desc: "Euphoric high on heavy volume — smart money distributing", phase: ["Distribution"], bullish: false },
  { key: "UTAD", label: "Upthrust After Distribution", desc: "False breakout above resistance to attract late buyers", phase: ["Distribution"], bullish: false },
  { key: "SOW", label: "Sign of Weakness", desc: "Price drops on wide spread and high volume — confirms distribution", phase: ["Distribution", "Markdown"], bullish: false },
  { key: "LPSY", label: "Last Point of Supply", desc: "Final weak rally before markdown — ideal short entry", phase: ["Markdown"], bullish: false },
];

function WyckoffSchematicSVG({ phase, detectedEvents }: {
  phase: WyckoffPhase;
  detectedEvents: WyckoffEvent[];
}) {
  const svgW = 300;
  const svgH = 90;

  // Define a schematic path for each phase
  interface SchematicPoint { x: number; y: number; event?: WyckoffEvent }

  const accumulationPath: SchematicPoint[] = [
    { x: 10, y: 20 },
    { x: 40, y: 60, event: "PS" },
    { x: 60, y: 78, event: "SC" },
    { x: 90, y: 40, event: "AR" },
    { x: 115, y: 68, event: "ST" },
    { x: 145, y: 82, event: "Spring" },
    { x: 165, y: 68, event: "Test" },
    { x: 195, y: 40, event: "SOS" },
    { x: 225, y: 54, event: "LPS" },
    { x: 290, y: 10 },
  ];

  const markupPath: SchematicPoint[] = [
    { x: 10, y: 70 },
    { x: 50, y: 50, event: "SOS" },
    { x: 90, y: 60, event: "LPS" },
    { x: 140, y: 30, event: "SOS" },
    { x: 170, y: 40, event: "LPS" },
    { x: 220, y: 15 },
    { x: 290, y: 5 },
  ];

  const distributionPath: SchematicPoint[] = [
    { x: 10, y: 70 },
    { x: 40, y: 30 },
    { x: 70, y: 20, event: "BC" },
    { x: 100, y: 35, event: "AR" },
    { x: 130, y: 22, event: "UTAD" },
    { x: 160, y: 40, event: "ST" },
    { x: 200, y: 55, event: "SOW" },
    { x: 240, y: 38, event: "LPSY" },
    { x: 290, y: 75 },
  ];

  const markdownPath: SchematicPoint[] = [
    { x: 10, y: 10 },
    { x: 50, y: 30, event: "SOW" },
    { x: 80, y: 20, event: "LPSY" },
    { x: 120, y: 50, event: "SOW" },
    { x: 160, y: 40, event: "LPSY" },
    { x: 200, y: 65 },
    { x: 290, y: 80 },
  ];

  const paths: Record<WyckoffPhase, SchematicPoint[]> = {
    Accumulation: accumulationPath,
    Markup: markupPath,
    Distribution: distributionPath,
    Markdown: markdownPath,
  };

  const pts = paths[phase];

  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");

  const lineColor =
    phase === "Accumulation" || phase === "Markup" ? "#34d399" : "#f87171";

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 100 }}>
      <rect x={0} y={0} width={svgW} height={svgH} fill="currentColor" className="text-muted/10" rx={4} />

      {/* Trading range box for Accum/Distrib */}
      {(phase === "Accumulation" || phase === "Distribution") && (
        <rect
          x={30}
          y={15}
          width={220}
          height={svgH - 25}
          fill="none"
          stroke="#6b7280"
          strokeWidth={0.75}
          strokeDasharray="4 3"
          opacity={0.5}
        />
      )}

      {/* Schematic price path */}
      <path d={pathD} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" />

      {/* Event markers */}
      {pts.map((p, i) => {
        if (!p.event) return null;
        const isDetected = detectedEvents.includes(p.event);
        const flip = p.y < 30;

        return (
          <g key={`${p.event}-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={3.5}
              fill={isDetected ? "#fbbf24" : "#374151"}
              stroke={isDetected ? "#f59e0b" : "#6b7280"}
              strokeWidth={1}
            />
            <text
              x={p.x}
              y={flip ? p.y + 11 : p.y - 5}
              textAnchor="middle"
              fontSize={6.5}
              fill={isDetected ? "#fbbf24" : "#9ca3af"}
              fontWeight={isDetected ? "bold" : "normal"}
            >
              {p.event}
            </text>
          </g>
        );
      })}

      {/* Phase label */}
      <text x={svgW - 4} y={svgH - 4} textAnchor="end" fontSize={7} fill="#6b7280" fontStyle="italic">
        {phase} schematic
      </text>
    </svg>
  );
}

function WyckoffSection({
  currentPrice,
  priceHistory,
  seed,
}: {
  currentPrice: number;
  priceHistory: number[];
  seed: number;
}) {
  const { phase, confidence, detectedEvents, phaseDesc } = useMemo(() => {
    const r = makeRng(seed + 80);

    // Detect phase from price history slope + volatility
    const prices = priceHistory.length >= 10 ? priceHistory : Array.from({ length: 20 }, (_, i) => currentPrice * (0.9 + r() * 0.2));
    const recentSlice = prices.slice(-10);
    const slope = (recentSlice[recentSlice.length - 1] - recentSlice[0]) / recentSlice[0];
    const variance =
      recentSlice.reduce((s, p) => {
        const dev = (p - currentPrice) / currentPrice;
        return s + dev * dev;
      }, 0) / recentSlice.length;

    let detectedPhase: WyckoffPhase;
    let conf: number;

    if (slope > 0.04) {
      detectedPhase = "Markup";
      conf = 60 + r() * 30;
    } else if (slope < -0.04) {
      detectedPhase = "Markdown";
      conf = 55 + r() * 30;
    } else if (variance > 0.001) {
      detectedPhase = slope >= 0 ? "Distribution" : "Accumulation";
      conf = 45 + r() * 35;
    } else {
      detectedPhase = slope >= 0 ? "Accumulation" : "Distribution";
      conf = 40 + r() * 30;
    }

    // Detect events based on phase
    const phaseEvents = WYCKOFF_EVENTS.filter((e) => e.phase.includes(detectedPhase));
    const detected: WyckoffEvent[] = [];
    for (const evt of phaseEvents) {
      if (r() < 0.55) detected.push(evt.key);
    }
    // Always include at least 2
    while (detected.length < 2 && phaseEvents.length > 0) {
      const candidate = phaseEvents[Math.floor(r() * phaseEvents.length)];
      if (!detected.includes(candidate.key)) detected.push(candidate.key);
    }

    const descMap: Record<WyckoffPhase, string> = {
      Accumulation: "Large operators are quietly absorbing supply. Price moves sideways with periodic shakeouts (Springs) to flush weak holders. Ideal for building long positions.",
      Markup: "Institutional demand exceeds supply. Price trends up with pullbacks to Last Points of Support — prime entries for continuation.",
      Distribution: "Smart money is offloading large positions to eager retail buyers near market tops. Watch for the Buying Climax and UTAD traps.",
      Markdown: "Supply overwhelms demand. Price trends down with weak counter-rallies (LPSY). Avoid longs; short bounces near Last Points of Supply.",
    };

    return {
      phase: detectedPhase,
      confidence: conf,
      detectedEvents: detected,
      phaseDesc: descMap[detectedPhase],
    };
  }, [seed, currentPrice, priceHistory]);

  const phaseColor: Record<WyckoffPhase, string> = {
    Accumulation: "text-emerald-400",
    Markup: "text-primary",
    Distribution: "text-amber-400",
    Markdown: "text-red-400",
  };

  const phaseBadgeColor: Record<WyckoffPhase, string> = {
    Accumulation: "bg-emerald-500/15 text-emerald-400",
    Markup: "bg-primary/15 text-primary",
    Distribution: "bg-amber-500/15 text-amber-400",
    Markdown: "bg-red-500/15 text-red-400",
  };

  const confColor =
    confidence >= 70 ? "text-emerald-400" : confidence >= 50 ? "text-amber-400" : "text-red-400";

  const relevantEvents = WYCKOFF_EVENTS.filter((e) => e.phase.includes(phase));

  return (
    <Section
      title="Wyckoff Analysis"
      badge={<Badge color={phaseBadgeColor[phase]}>{phase}</Badge>}
    >
      {/* Phase + confidence */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Detected Phase</p>
          <p className={cn("text-[13px] font-bold", phaseColor[phase])}>{phase}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Confidence</p>
          <p className={cn("text-[13px] font-bold tabular-nums", confColor)}>
            {confidence.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-3 h-1.5 w-full rounded-full bg-muted/30">
        <motion.div
          className={cn(
            "h-full rounded-full",
            confidence >= 70 ? "bg-emerald-500" : confidence >= 50 ? "bg-amber-500" : "bg-red-500",
          )}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Schematic SVG */}
      <WyckoffSchematicSVG phase={phase} detectedEvents={detectedEvents} />

      {/* Phase description */}
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{phaseDesc}</p>

      {/* Detected events */}
      <p className="mt-2 mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Detected Events
      </p>
      <div className="grid grid-cols-1 gap-1">
        {relevantEvents.map((evt) => {
          const isDetected = detectedEvents.includes(evt.key);
          return (
            <div
              key={evt.key}
              className={cn(
                "flex items-start gap-2 rounded p-1.5 transition-colors",
                isDetected ? "bg-accent/50" : "opacity-40",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 shrink-0 rounded px-1 py-0 text-[11px] font-bold tabular-nums",
                  isDetected
                    ? evt.bullish
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                    : "bg-muted/20 text-muted-foreground",
                )}
              >
                {evt.key}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-foreground">{evt.label}</p>
                <p className="text-[11px] text-muted-foreground">{evt.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function AdvancedChartTools({
  ticker,
  currentPrice,
  priceHistory,
}: AdvancedChartToolsProps) {
  // Derive a stable numeric seed from the ticker string
  const seed = useMemo(
    () =>
      ticker.split("").reduce((acc, ch) => ((acc * 31 + ch.charCodeAt(0)) | 0), 33),
    [ticker],
  );

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Advanced Chart Tools</h2>
          <p className="text-xs text-muted-foreground">
            Professional analysis for{" "}
            <span className="font-semibold text-primary">{ticker}</span> ·{" "}
            <span className="tabular-nums">${currentPrice.toFixed(2)}</span>
          </p>
        </div>
        <Badge color="bg-primary/10 text-primary">Pro</Badge>
      </div>

      {/* Sections */}
      <MarketProfileSection currentPrice={currentPrice} seed={seed} />
      <VolumeProfileSection
        currentPrice={currentPrice}
        priceHistory={priceHistory}
        seed={seed}
      />
      <PivotPointsSection currentPrice={currentPrice} seed={seed} />
      <MarketBreadthSection seed={seed} />
      <ElliottWaveSection currentPrice={currentPrice} seed={seed} />
      <WyckoffSection
        currentPrice={currentPrice}
        priceHistory={priceHistory}
        seed={seed}
      />
    </div>
  );
}
