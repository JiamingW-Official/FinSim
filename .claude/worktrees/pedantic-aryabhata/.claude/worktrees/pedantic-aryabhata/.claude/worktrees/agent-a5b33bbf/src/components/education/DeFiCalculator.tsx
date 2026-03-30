"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type ProtocolType = "Lending" | "Liquidity Pool" | "Staking" | "Yield Farming";
type Compounding = "daily" | "weekly" | "monthly";

const PROTOCOL_CONFIG: Record<
  ProtocolType,
  { minApy: number; maxApy: number; defaultApy: number; risk: number; description: string }
> = {
  Lending: {
    minApy: 5,
    maxApy: 15,
    defaultApy: 8,
    risk: 2,
    description: "Supply assets to a lending protocol and earn interest from borrowers.",
  },
  "Liquidity Pool": {
    minApy: 15,
    maxApy: 50,
    defaultApy: 25,
    risk: 3,
    description: "Provide two-sided liquidity to a DEX and earn trading fees.",
  },
  Staking: {
    minApy: 3,
    maxApy: 8,
    defaultApy: 5,
    risk: 1,
    description: "Lock tokens to validate a proof-of-stake network and earn staking rewards.",
  },
  "Yield Farming": {
    minApy: 20,
    maxApy: 100,
    defaultApy: 45,
    risk: 5,
    description: "Deposit LP tokens into a farm to earn additional protocol incentive tokens.",
  },
};

const COMPOUNDING_PERIODS: Record<Compounding, { label: string; n: number }> = {
  daily: { label: "Daily", n: 365 },
  weekly: { label: "Weekly", n: 52 },
  monthly: { label: "Monthly", n: 12 },
};

// Compound interest: A = P * (1 + r/n)^(n*t)
function compound(principal: number, apy: number, n: number, days: number): number {
  const r = apy / 100;
  const t = days / 365;
  return principal * Math.pow(1 + r / n, n * t);
}

function formatUSD(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function formatPct(value: number): string {
  return value.toFixed(2) + "%";
}

// IL for LP: given price ratio divergence factor k, IL = 2*sqrt(k)/(1+k) - 1
// At 50% price divergence (k=1.5): IL ≈ -5.72%
function impermanentLoss(priceDivergeFactor: number): number {
  const k = priceDivergeFactor;
  return (2 * Math.sqrt(k)) / (1 + k) - 1;
}

function RiskDots({ risk }: { risk: number }) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full",
            i < risk
              ? risk <= 2
                ? "bg-green-500"
                : risk <= 3
                ? "bg-amber-500"
                : "bg-red-500"
              : "bg-muted/40"
          )}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{risk}/5</span>
    </div>
  );
}

function EarningsRow({
  label,
  earned,
  total,
  highlight,
}: {
  label: string;
  earned: number;
  total: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 border-b border-border/20 last:border-0",
        highlight && "font-medium"
      )}
    >
      <span className={cn("text-sm", highlight ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
      <div className="text-right">
        <div className={cn("text-sm tabular-nums", highlight ? "text-[#2d9cdb]" : "text-foreground")}>
          +{formatUSD(earned)}
        </div>
        <div className="text-[11px] text-muted-foreground tabular-nums">{formatUSD(total)} total</div>
      </div>
    </div>
  );
}

export function DeFiCalculator() {
  const [protocol, setProtocol] = useState<ProtocolType>("Lending");
  const [amount, setAmount] = useState(10000);
  const [apy, setApy] = useState(PROTOCOL_CONFIG["Lending"].defaultApy);
  const [compounding, setCompounding] = useState<Compounding>("daily");
  const [rawAmount, setRawAmount] = useState("10000");
  const [rawApy, setRawApy] = useState(String(PROTOCOL_CONFIG["Lending"].defaultApy));

  const config = PROTOCOL_CONFIG[protocol];
  const n = COMPOUNDING_PERIODS[compounding].n;

  const results = useMemo(() => {
    const p = Math.max(0, amount);
    const daily = compound(p, apy, n, 1) - p;
    const weekly = compound(p, apy, n, 7) - p;
    const monthly = compound(p, apy, n, 30) - p;
    const annual = compound(p, apy, n, 365) - p;
    const ilPct = protocol === "Liquidity Pool" ? impermanentLoss(1.5) * 100 : null; // 50% divergence
    const ilDollar = ilPct !== null ? (p * Math.abs(ilPct)) / 100 : null;
    return { daily, weekly, monthly, annual, ilPct, ilDollar };
  }, [amount, apy, n, protocol]);

  function handleProtocolChange(p: ProtocolType) {
    setProtocol(p);
    const newApy = PROTOCOL_CONFIG[p].defaultApy;
    setApy(newApy);
    setRawApy(String(newApy));
  }

  function handleAmountChange(val: string) {
    setRawAmount(val);
    const parsed = parseFloat(val.replace(/,/g, ""));
    if (!isNaN(parsed) && parsed >= 0) setAmount(parsed);
  }

  function handleApyChange(val: string) {
    setRawApy(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 10000) setApy(parsed);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-foreground">DeFi Yield Calculator</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Estimate earnings across DeFi protocol types with compound interest
        </p>
      </div>

      {/* Protocol selector */}
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium block mb-2">
          Protocol Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(PROTOCOL_CONFIG) as ProtocolType[]).map((p) => (
            <button
              key={p}
              onClick={() => handleProtocolChange(p)}
              className={cn(
                "text-xs py-2 px-3 rounded-lg border text-left transition-colors",
                protocol === p
                  ? "border-[#2d9cdb] bg-[#2d9cdb]/10 text-[#2d9cdb]"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* Inputs row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium block mb-1.5">
            Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <input
              type="number"
              min={0}
              value={rawAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full bg-muted/30 border border-border/60 rounded-lg pl-7 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#2d9cdb] transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium block mb-1.5">
            APY ({config.minApy}–{config.maxApy}%)
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={10000}
              step={0.1}
              value={rawApy}
              onChange={(e) => handleApyChange(e.target.value)}
              className="w-full bg-muted/30 border border-border/60 rounded-lg pl-3 pr-7 py-2 text-sm text-foreground focus:outline-none focus:border-[#2d9cdb] transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      {/* APY range hint */}
      <div className="w-full h-1.5 rounded-full bg-muted/40 relative overflow-hidden">
        <div
          className="h-full rounded-full bg-[#2d9cdb] transition-all"
          style={{
            width: `${Math.min(100, ((apy - config.minApy) / (config.maxApy - config.minApy)) * 100)}%`,
          }}
        />
      </div>

      {/* Compounding selector */}
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium block mb-2">
          Compounding Frequency
        </label>
        <div className="flex gap-2">
          {(Object.entries(COMPOUNDING_PERIODS) as [Compounding, { label: string; n: number }][]).map(
            ([key, val]) => (
              <button
                key={key}
                onClick={() => setCompounding(key)}
                className={cn(
                  "flex-1 py-1.5 text-xs rounded border font-medium transition-colors",
                  compounding === key
                    ? "border-[#2d9cdb] bg-[#2d9cdb]/10 text-[#2d9cdb]"
                    : "border-border/60 text-muted-foreground hover:border-border"
                )}
              >
                {val.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Results */}
      <div className="border border-border/60 rounded-lg bg-card p-4 space-y-1">
        <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">
          Projected Earnings
        </div>
        <EarningsRow
          label="Daily"
          earned={results.daily}
          total={amount + results.daily}
        />
        <EarningsRow
          label="Weekly"
          earned={results.weekly}
          total={amount + results.weekly}
        />
        <EarningsRow
          label="Monthly"
          earned={results.monthly}
          total={amount + results.monthly}
        />
        <EarningsRow
          label="Annual"
          earned={results.annual}
          total={amount + results.annual}
          highlight
        />
      </div>

      {/* IL warning for LP */}
      {protocol === "Liquidity Pool" && results.ilPct !== null && results.ilDollar !== null && (
        <div className="border border-amber-500/30 rounded-lg bg-amber-500/5 p-4 space-y-2">
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
            Impermanent Loss Risk
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If one token in your LP pair moves <span className="text-foreground font-medium">50% against the other</span>,
            you would experience impermanent loss of approximately{" "}
            <span className="text-amber-500 font-medium">{formatPct(Math.abs(results.ilPct))}</span>
            {" "}({formatUSD(results.ilDollar)} on {formatUSD(amount)} deposited).
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-muted/20 rounded-lg p-2 text-center">
              <div className="text-xs text-muted-foreground">IL at 50% divergence</div>
              <div className="text-sm font-semibold text-amber-500 mt-1">
                -{formatPct(Math.abs(results.ilPct))}
              </div>
            </div>
            <div className="bg-muted/20 rounded-lg p-2 text-center">
              <div className="text-xs text-muted-foreground">Net annual (after IL)</div>
              <div
                className={cn(
                  "text-sm font-semibold mt-1",
                  results.annual - results.ilDollar > 0 ? "text-green-500" : "text-red-500"
                )}
              >
                {formatUSD(results.annual - results.ilDollar)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk score */}
      <div className="border border-border/60 rounded-lg bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1.5">
              Protocol Risk Score
            </div>
            <RiskDots risk={config.risk} />
          </div>
          <div className="text-right">
            <div
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full",
                config.risk <= 1
                  ? "bg-green-500/10 text-green-500"
                  : config.risk <= 2
                  ? "bg-green-500/10 text-green-500"
                  : config.risk === 3
                  ? "bg-amber-500/10 text-amber-500"
                  : config.risk === 4
                  ? "bg-orange-500/10 text-orange-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {config.risk <= 2 ? "Lower Risk" : config.risk === 3 ? "Medium Risk" : config.risk === 4 ? "High Risk" : "Very High Risk"}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          {config.risk <= 2
            ? "Smart contract risk and depeg risk are the primary concerns. Protocol audits and track record matter."
            : config.risk === 3
            ? "Impermanent loss can erode returns. Concentrated liquidity positions amplify both gains and IL."
            : "Token incentive APYs often decline rapidly. High yields frequently reflect high dilution or unsustainable emissions."}
        </p>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        These projections assume constant APY and no protocol fees beyond what is reflected in APY.
        DeFi yields are highly variable and not guaranteed. Smart contract exploits can result in total loss of principal.
      </p>
    </div>
  );
}
