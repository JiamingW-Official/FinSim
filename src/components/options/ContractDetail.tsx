"use client";

import { motion } from "framer-motion";
import { X, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import type { OptionContract, ChainAnalytics, StrategyLeg } from "@/types/options";
import { computeProbabilityOfProfit } from "@/services/options/analytics";

interface ContractDetailProps {
  contract: OptionContract;
  spotPrice: number;
  analytics: ChainAnalytics;
  onClose: () => void;
  onAddLeg: (leg: StrategyLeg) => void;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function ContractDetail({
  contract,
  spotPrice,
  analytics,
  onClose,
  onAddLeg,
}: ContractDetailProps) {
  const { greeks } = contract;

  // Synthetic price change
  const rand = seededRandom(contract.strike * 13 + contract.ticker.length * 7 + contract.type.length);
  const synthChg = (rand() - 0.45) * 0.3 * contract.mid;
  const synthChgPct = contract.mid > 0 ? (synthChg / contract.mid) * 100 : 0;
  const changePositive = synthChg >= 0;

  // Probability calculations
  const pop = computeProbabilityOfProfit(
    [
      {
        type: contract.type,
        side: "buy",
        strike: contract.strike,
        expiry: contract.expiry,
        quantity: 1,
        price: contract.ask,
        greeks: contract.greeks,
      },
    ],
    spotPrice,
    analytics.atmIV,
    contract.daysToExpiry,
  );
  const probITM =
    contract.type === "call"
      ? contract.greeks.delta * 100
      : -contract.greeks.delta * 100;

  // Sparkline data
  const sparkRand = seededRandom(contract.strike * 7 + contract.ticker.length * 3);
  const sparkPoints: number[] = [contract.mid];
  for (let i = 1; i < 9; i++) {
    const prev = sparkPoints[i - 1];
    sparkPoints.push(prev * (1 + (sparkRand() - 0.5) * 0.05));
  }
  sparkPoints.push(contract.mid);

  const sparkMin = Math.min(...sparkPoints);
  const sparkMax = Math.max(...sparkPoints);
  const sparkRange = sparkMax - sparkMin || 1;

  const sparkSvgPoints = sparkPoints
    .map((p, i) => {
      const x = (i / (sparkPoints.length - 1)) * 200;
      const y = 40 - ((p - sparkMin) / sparkRange) * 36 - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const sparkPositive = sparkPoints[sparkPoints.length - 1] >= sparkPoints[0];
  const sparkColor = sparkPositive ? "#10b981" : "#ef4444";

  // Expected move
  const expMovePct = spotPrice > 0 ? (analytics.expectedMove1SD / spotPrice) * 100 : 0;

  const greekRows = [
    { symbol: "Δ", label: "Delta", value: greeks.delta.toFixed(3), color: "text-orange-400" },
    { symbol: "Γ", label: "Gamma", value: greeks.gamma.toFixed(4), color: "text-orange-500" },
    { symbol: "Θ", label: "Theta", value: greeks.theta.toFixed(3), color: "text-red-500" },
    { symbol: "V", label: "Vega", value: greeks.vega.toFixed(3), color: "text-emerald-500" },
    { symbol: "ρ", label: "Rho", value: greeks.rho.toFixed(3), color: "text-muted-foreground" },
    { symbol: "Vanna", label: "Vanna", value: greeks.vanna.toFixed(4), color: "text-amber-500" },
  ];

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="flex flex-col h-full bg-card border-l border-border/40 text-sm"
    >
      {/* Section 1 - Header */}
      <div className="px-2.5 py-1.5 border-b border-border/40 flex items-center justify-between">
        <span className="font-medium text-[11px] text-foreground">
          {contract.ticker} {contract.expiry.slice(5)} ${contract.strike}
          {contract.type[0].toUpperCase()}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Section 2 - Price block */}
      <div className="px-2.5 py-1.5 border-b border-border/40 flex items-center gap-1.5">
        <span className="text-sm font-bold tabular-nums text-foreground">
          ${contract.mid.toFixed(2)}
        </span>
        <span
          className={cn(
            "text-[10px] font-medium tabular-nums",
            changePositive ? "text-emerald-400" : "text-red-400",
          )}
        >
          {changePositive ? "+" : ""}{synthChgPct.toFixed(1)}%
        </span>
        <span className={cn(
          "text-[10px] px-1 py-px rounded",
          contract.inTheMoney
            ? "bg-emerald-500/5 text-emerald-400"
            : "text-muted-foreground",
        )}>
          {contract.inTheMoney ? "ITM" : "OTM"}
        </span>
      </div>

      {/* Section 3 - Greeks 2x3 grid */}
      <div className="px-2.5 py-1.5 border-b border-border/40">
        <p className="text-[10px] text-muted-foreground/70 uppercase mb-1">Greeks</p>
        <div className="grid grid-cols-3 gap-1">
          {greekRows.map((g) => (
            <div
              key={g.label}
              className="rounded bg-background/50 border border-border/30 px-1.5 py-1 flex flex-col"
            >
              <span className={cn("text-[10px] font-medium", g.color)}>{g.symbol}</span>
              <span className="text-[10px] font-medium tabular-nums text-foreground">{g.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 - Contract stats */}
      <div className="px-2.5 py-1.5 border-b border-border/40">
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          {[
            { label: "IV", value: `${(contract.iv * 100).toFixed(1)}%` },
            { label: "Vol", value: contract.volume.toLocaleString() },
            { label: "OI", value: contract.openInterest.toLocaleString() },
            { label: "Last", value: `$${contract.last.toFixed(2)}` },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground/70">{stat.label}</span>
              <span className="text-[10px] font-medium tabular-nums text-foreground">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5 - Bid/Ask visual */}
      <div className="px-2.5 py-1.5 border-b border-border/40">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-medium text-emerald-400 tabular-nums">
            {contract.bid.toFixed(2)}
          </span>
          <div className="relative flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
            {/* Green bid fill from left */}
            <div
              className="absolute left-0 top-0 h-full bg-emerald-500/60 rounded-l-full"
              style={{
                width: `${(contract.bid / (contract.bid + contract.ask)) * 100}%`,
              }}
            />
            {/* Red ask fill from right */}
            <div
              className="absolute right-0 top-0 h-full bg-red-500/60 rounded-r-full"
              style={{
                width: `${(contract.ask / (contract.bid + contract.ask)) * 100}%`,
              }}
            />
            {/* White dot at mid position */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-foreground rounded-full border border-background shadow"
              style={{
                left: `calc(${(contract.mid / (contract.bid + contract.ask)) * 100}% - 3px)`,
              }}
            />
          </div>
          <span className="text-[10px] font-medium text-red-400 tabular-nums">
            {contract.ask.toFixed(2)}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground/60 text-center">
          mid {contract.mid.toFixed(2)}
        </p>
      </div>

      {/* Section 6 - Mini sparkline */}
      <div className="px-2.5 py-1 border-b border-border/40">
        <svg
          width="100%"
          height="28"
          viewBox="0 0 200 28"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <polyline
            points={sparkSvgPoints}
            fill="none"
            stroke={sparkColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Section 7 - Probability */}
      <div className="px-2.5 py-1.5 border-b border-border/40">
        <p className="text-[10px] text-muted-foreground/70 uppercase mb-1">Probability</p>
        <div className="flex flex-col gap-1.5">
          <div>
            <div className="flex justify-between mb-px">
              <span className="text-[10px] text-muted-foreground">PoP</span>
              <span className="text-[10px] font-medium text-emerald-400">{pop.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1 bg-muted/30 rounded overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded transition-all"
                style={{ width: `${Math.min(100, Math.max(0, pop))}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-px">
              <span className="text-[10px] text-muted-foreground">ITM</span>
              <span className="text-[10px] font-medium text-orange-400">
                {Math.max(0, probITM).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1 bg-muted/30 rounded overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded transition-all"
                style={{ width: `${Math.min(100, Math.max(0, probITM))}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          Exp &plusmn;${analytics.expectedMove1SD.toFixed(2)} ({expMovePct.toFixed(1)}%)
        </p>
      </div>

      {/* Section 8 - Action buttons */}
      <div className="px-2.5 py-2 mt-auto space-y-1">
        <Button
          variant="default"
          size="sm"
          onClick={() =>
            onAddLeg({
              type: contract.type,
              side: "buy",
              strike: contract.strike,
              expiry: contract.expiry,
              quantity: 1,
              price: contract.ask,
              greeks: contract.greeks,
            })
          }
          className="w-full h-7 text-[10px] font-medium"
        >
          Buy {contract.type.toUpperCase()} @ {contract.ask.toFixed(2)}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() =>
            onAddLeg({
              type: contract.type,
              side: "sell",
              strike: contract.strike,
              expiry: contract.expiry,
              quantity: 1,
              price: contract.bid,
              greeks: contract.greeks,
            })
          }
          className="w-full h-7 text-[10px] font-medium"
        >
          Sell {contract.type.toUpperCase()} @ {contract.bid.toFixed(2)}
        </Button>
      </div>
    </motion.div>
  );
}
