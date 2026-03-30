"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

const CHART_W = 600;
const CHART_H = 220;
const PAD_LEFT = 64;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;
const INNER_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const INNER_H = CHART_H - PAD_TOP - PAD_BOTTOM;

type OptionType = "call" | "put";

function computePayoff(
  type: OptionType,
  strike: number,
  premium: number,
  contracts: number,
  prices: number[]
): { price: number; pnl: number }[] {
  const multiplier = contracts * 100;
  return prices.map((price) => {
    let intrinsic = 0;
    if (type === "call") intrinsic = Math.max(0, price - strike);
    else intrinsic = Math.max(0, strike - price);
    const pnl = (intrinsic - premium) * multiplier;
    return { price, pnl };
  });
}

function InputField({
  label,
  prefix,
  suffix,
  value,
  onChange,
  min,
  max,
  step,
  isFloat,
}: {
  label: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  isFloat?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <div className="flex items-center gap-1 rounded-md border bg-background px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-[#2d9cdb]/60">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) =>
            onChange(isFloat ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)
          }
          min={min}
          max={max}
          step={step}
          aria-label={label}
          className="w-full bg-transparent text-sm font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(isFloat ? parseFloat(e.target.value) : parseInt(e.target.value))}
        min={min}
        max={max}
        step={step}
        aria-label={`${label} slider`}
        className="w-full h-1 accent-[#2d9cdb]"
      />
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-center">
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className={cn("text-sm font-bold tabular-nums", color)}>{value}</div>
    </div>
  );
}

export function BreakevenCalculator() {
  const [optionType, setOptionType] = useState<OptionType>("call");
  const [strike, setStrike] = useState(150);
  const [premium, setPremium] = useState(5);
  const [contracts, setContracts] = useState(1);
  const [spotPrice, setSpotPrice] = useState(150);

  const { breakeven, maxProfit, maxLoss, currentPnl, payoffData, priceRange } = useMemo(() => {
    const spread = Math.max(strike * 0.4, premium * 6, 30);
    const low = Math.max(0.01, strike - spread);
    const high = strike + spread;
    const steps = 80;
    const prices = Array.from({ length: steps + 1 }, (_, i) => low + (i / steps) * (high - low));

    const payoffData = computePayoff(optionType, strike, premium, contracts, prices);
    const multiplier = contracts * 100;

    const breakeven =
      optionType === "call" ? strike + premium : strike - premium;

    const maxLoss = -premium * multiplier;
    const maxProfit =
      optionType === "call"
        ? Infinity
        : (strike - premium) * multiplier; // put max profit capped at strike going to 0

    const currentPnl = computePayoff(optionType, strike, premium, contracts, [spotPrice])[0].pnl;

    return { breakeven, maxProfit, maxLoss, currentPnl, payoffData, priceRange: { low, high } };
  }, [optionType, strike, premium, contracts, spotPrice]);

  const pnlValues = payoffData.map((d) => d.pnl);
  const minPnl = Math.min(...pnlValues);
  const maxPnlVal = Math.max(...pnlValues);
  const pnlRange = maxPnlVal - minPnl || 1;

  function toSvgX(price: number) {
    return (
      PAD_LEFT +
      ((price - priceRange.low) / (priceRange.high - priceRange.low)) * INNER_W
    );
  }
  function toSvgY(pnl: number) {
    return PAD_TOP + INNER_H - ((pnl - minPnl) / pnlRange) * INNER_H;
  }

  const polyline = payoffData.map((d) => `${toSvgX(d.price)},${toSvgY(d.pnl)}`).join(" ");
  const zeroY = toSvgY(0);
  const breakevenX = toSvgX(breakeven);
  const spotX = toSvgX(Math.max(priceRange.low, Math.min(priceRange.high, spotPrice)));

  // Y-axis labels: 5 ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const pnl = minPnl + f * pnlRange;
    return { pnl, y: toSvgY(pnl) };
  });

  const formatPnl = (v: number) => {
    const abs = Math.abs(v);
    const fmt = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}K` : `$${abs.toFixed(0)}`;
    return v >= 0 ? `+${fmt}` : `-${fmt}`;
  };

  const formatPrice = (v: number) => `$${v.toFixed(2)}`;

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      {/* Option type toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">Option Type:</span>
        <div className="flex gap-1">
          {(["call", "put"] as OptionType[]).map((t) => (
            <button
              key={t}
              onClick={() => setOptionType(t)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors border capitalize",
                optionType === t
                  ? "bg-[#2d9cdb] text-white border-[#2d9cdb]"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-[#2d9cdb]/50"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InputField
          label="Strike Price"
          prefix="$"
          value={strike}
          onChange={setStrike}
          min={1}
          max={1000}
          step={1}
          isFloat
        />
        <InputField
          label="Premium / Share"
          prefix="$"
          value={premium}
          onChange={setPremium}
          min={0.01}
          max={100}
          step={0.5}
          isFloat
        />
        <InputField
          label="Contracts"
          value={contracts}
          onChange={setContracts}
          min={1}
          max={100}
          step={1}
        />
        <InputField
          label="Spot Price (P&L)"
          prefix="$"
          value={spotPrice}
          onChange={setSpotPrice}
          min={1}
          max={2000}
          step={1}
          isFloat
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatChip
          label="Breakeven"
          value={formatPrice(breakeven)}
          color="text-[#2d9cdb]"
        />
        <StatChip
          label="Max Loss"
          value={formatPnl(maxLoss)}
          color="text-red-500"
        />
        <StatChip
          label="Max Profit"
          value={maxProfit === Infinity ? "Unlimited" : formatPnl(maxProfit)}
          color="text-emerald-400"
        />
        <StatChip
          label={`P&L @ $${spotPrice}`}
          value={formatPnl(currentPnl)}
          color={currentPnl >= 0 ? "text-emerald-400" : "text-red-500"}
        />
      </div>

      {/* SVG payoff diagram */}
      <div className="rounded-lg border bg-muted/20 overflow-hidden">
        <div className="px-4 pt-3 pb-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          Payoff Diagram at Expiry
        </div>
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full"
          style={{ height: 220 }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {yTicks.map((t, i) => (
            <line
              key={i}
              x1={PAD_LEFT}
              y1={t.y}
              x2={CHART_W - PAD_RIGHT}
              y2={t.y}
              stroke="rgba(128,128,128,0.12)"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {yTicks.map((t, i) => (
            <text
              key={i}
              x={PAD_LEFT - 6}
              y={t.y + 4}
              textAnchor="end"
              fontSize="9"
              fill="currentColor"
              opacity={0.55}
            >
              {formatPnl(t.pnl)}
            </text>
          ))}

          {/* Zero line */}
          {zeroY >= PAD_TOP && zeroY <= PAD_TOP + INNER_H && (
            <line
              x1={PAD_LEFT}
              y1={zeroY}
              x2={CHART_W - PAD_RIGHT}
              y2={zeroY}
              stroke="rgba(128,128,128,0.35)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
          )}

          {/* Fill profit area */}
          <clipPath id="bev-clip-profit">
            <rect x={PAD_LEFT} y={PAD_TOP} width={INNER_W} height={zeroY - PAD_TOP} />
          </clipPath>
          <clipPath id="bev-clip-loss">
            <rect x={PAD_LEFT} y={zeroY} width={INNER_W} height={PAD_TOP + INNER_H - zeroY} />
          </clipPath>

          <polyline
            points={polyline}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            clipPath="url(#bev-clip-profit)"
          />
          <polyline
            points={polyline}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            clipPath="url(#bev-clip-loss)"
          />

          {/* Breakeven vertical */}
          {breakevenX >= PAD_LEFT && breakevenX <= CHART_W - PAD_RIGHT && (
            <>
              <line
                x1={breakevenX}
                y1={PAD_TOP}
                x2={breakevenX}
                y2={PAD_TOP + INNER_H}
                stroke="#2d9cdb"
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity={0.7}
              />
              <text
                x={breakevenX + 4}
                y={PAD_TOP + 14}
                fontSize="9"
                fill="#2d9cdb"
                opacity={0.85}
              >
                BE {formatPrice(breakeven)}
              </text>
            </>
          )}

          {/* Spot price vertical */}
          {spotX >= PAD_LEFT && spotX <= CHART_W - PAD_RIGHT && (
            <line
              x1={spotX}
              y1={PAD_TOP}
              x2={spotX}
              y2={PAD_TOP + INNER_H}
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity={0.6}
            />
          )}

          {/* X-axis price labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
            const price = priceRange.low + f * (priceRange.high - priceRange.low);
            const x = PAD_LEFT + f * INNER_W;
            return (
              <text
                key={i}
                x={x}
                y={PAD_TOP + INNER_H + 18}
                textAnchor="middle"
                fontSize="9"
                fill="currentColor"
                opacity={0.45}
              >
                ${price.toFixed(0)}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 pb-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-4 rounded-sm bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">Profit zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-4 rounded-sm bg-red-500" />
            <span className="text-[10px] text-muted-foreground">Loss zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-4 rounded-sm bg-[#2d9cdb]" />
            <span className="text-[10px] text-muted-foreground">Breakeven</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-4 rounded-sm bg-amber-500" />
            <span className="text-[10px] text-muted-foreground">Spot price</span>
          </div>
        </div>
      </div>

      {/* Cost breakdown note */}
      <div className="rounded-lg border border-border/40 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        Total cost: <span className="font-semibold text-foreground">${(premium * contracts * 100).toFixed(2)}</span>
        {" "}({contracts} contract{contracts > 1 ? "s" : ""} x 100 shares x ${premium}/share).
        {" "}You profit when {optionType === "call" ? "the stock rises above" : "the stock falls below"}{" "}
        <span className="font-semibold text-[#2d9cdb]">${breakeven.toFixed(2)}</span> at expiry.
      </div>
    </div>
  );
}
