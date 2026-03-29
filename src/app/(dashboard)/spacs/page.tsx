"use client";

import { useState, useMemo } from "react";
import {
  Zap,
  X,
  Info,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Calculator,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Shield,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SpacStatus = "Pre-deal" | "Announced" | "Voting" | "Completed";
type SpacFilter = "All" | "Pre-deal" | "Announced";

interface SPAC {
  id: string;
  name: string;
  ticker: string;
  sponsor: string;
  target: string | null;
  status: SpacStatus;
  trustValue: number; // per share
  currentPrice: number;
  premiumDiscount: number; // % vs trust
  deadlineMonths: number;
  volume: number; // thousands
  raiseSize: number; // $ millions
  warrantsPerUnit: number;
  warrantStrike: number;
  targetDescription: string;
  dealTerms: string;
  sector: string;
}

interface ConvertibleBond {
  id: string;
  issuer: string;
  ticker: string;
  faceValue: number;
  coupon: number; // %
  maturityYears: number;
  conversionPrice: number;
  currentStockPrice: number;
  conversionPremium: number; // %
  bondFloor: number; // theoretical
  delta: number; // 0–1
  parityValue: number;
  callProvision: string;
  putProvision: string;
  sector: string;
}

// ── Generate SPAC data (seed=9001) ────────────────────────────────────────────

const SPAC_NAMES = [
  "Apex Acquisition Corp",
  "Horizon Strategic Partners",
  "Nova Capital SPAC",
  "Vertex Growth Acquisition",
  "Summit Ventures SPAC II",
  "Pinnacle Opportunity Corp",
  "Eclipse Capital Partners",
  "Nexus Innovation SPAC",
  "Atlas Future Acquisition",
  "Meridian Capital SPAC III",
];

const SPAC_SPONSORS = [
  "Apex Capital Partners",
  "Horizon PE Group",
  "Nova Asset Mgmt",
  "Vertex Ventures",
  "Summit Capital",
  "Pinnacle Advisors",
  "Eclipse Partners",
  "Nexus Capital",
  "Atlas PE",
  "Meridian Advisors",
];

const SPAC_TARGETS = [
  "CloudVertex AI",
  null,
  "GreenShift Energy",
  null,
  "MedTech Innovations",
  "QuantumPay Systems",
  null,
  null,
  "AeroSpace Dynamics",
  null,
];

const SPAC_TARGET_DESCRIPTIONS = [
  "CloudVertex AI is a B2B SaaS platform providing enterprise AI infrastructure solutions. The deal values the company at $2.1B with strong ARR growth of 180% YoY.",
  "No target announced yet. The SPAC is focused on technology and software sectors with $400M in trust.",
  "GreenShift Energy develops utility-scale battery storage systems. Pro-forma enterprise value of $1.5B, targeting renewable energy transition.",
  "No target announced. Sponsor has deep relationships in healthcare and biotech sectors with $300M raised.",
  "MedTech Innovations builds AI-powered surgical robotics. Deal at $1.8B EV, FDA clearance expected Q3 2026.",
  "QuantumPay Systems provides blockchain-based cross-border payment rails. Deal at $900M, processing $5B+ monthly.",
  "No target announced. SPAC focused on fintech and financial services, $250M in trust.",
  "No target announced. Thesis centers on industrial automation and Industry 4.0 companies.",
  "AeroSpace Dynamics manufactures autonomous drone delivery systems. Deal at $2.4B EV, DoD contracts in place.",
  "No target announced. Sponsor targeting late-stage consumer internet companies.",
];

const SPAC_DEAL_TERMS = [
  "PIPE: $200M at $10/share. Founders shares: 20% promote. Warrant coverage: 1/3 warrant per unit, strike $11.50. Lock-up: 1 year post-merger.",
  "Pre-deal SPAC. Trust earns T-bill rate (~5.2% annually). Redemption right at $10.20 + accrued interest.",
  "PIPE: $150M. No additional dilution from PIPE. Founders promote: 20%. Warrants: 1/2 per unit at $11.50 strike.",
  "Pre-deal. $300M trust. Sponsor committed $8M founder shares. Full redemption right before deadline.",
  "PIPE: $180M. Earnout: 25% of sponsors shares vest only above $15/share. Warrants at $11.50.",
  "PIPE: $90M at $10. Convertible note option for target. Full 20% promote to sponsor.",
  "Pre-deal. Focused on fintech M&A pipeline. Deadline: 18 months from IPO with one extension option.",
  "Pre-deal. Industrial automation focus. Sponsor has acquired 3 prior companies via SPAC successfully.",
  "PIPE: $240M at $10. Defense sector deal. CFIUS review completed. De-SPAC expected Q3 2026.",
  "Pre-deal. $500M trust. Largest SPAC in current cohort. Sponsor team from Softbank and Tiger Global.",
];

const SPAC_STATUSES: SpacStatus[] = [
  "Announced", "Pre-deal", "Announced", "Pre-deal", "Voting",
  "Announced", "Pre-deal", "Pre-deal", "Announced", "Pre-deal",
];

const SPAC_SECTORS = [
  "Technology", "Technology", "Clean Energy", "Healthcare", "MedTech",
  "Fintech", "Financial Services", "Industrials", "Defense", "Consumer",
];

function generateSPACs(): SPAC[] {
  const rng = mulberry32(9001);
  return SPAC_NAMES.map((name, i) => {
    const trustValue = 10.20;
    const status = SPAC_STATUSES[i];
    // Pre-deal trades near trust; Announced has premium; Voting near trust or small discount
    let priceMod: number;
    if (status === "Pre-deal") priceMod = -0.02 + rng() * 0.06;
    else if (status === "Announced") priceMod = 0.05 + rng() * 0.25;
    else if (status === "Voting") priceMod = -0.01 + rng() * 0.04;
    else priceMod = 0.10 + rng() * 0.40;
    const currentPrice = Math.round((trustValue * (1 + priceMod)) * 100) / 100;
    const premiumDiscount = Math.round(((currentPrice - trustValue) / trustValue) * 10000) / 100;
    const deadlineMonths = Math.floor(rng() * 14) + 4;
    const volume = Math.floor(rng() * 900 + 100);
    const raiseSize = Math.floor(rng() * 400 + 200) * 2; // $M, multiples of 2
    const warrantsPerUnit = [1/3, 1/2, 1][Math.floor(rng() * 3)];
    const warrantStrike = 11.50;

    return {
      id: `spac-${i}`,
      name,
      ticker: `${name.split(" ").map(w => w[0]).join("").slice(0, 4)}U`,
      sponsor: SPAC_SPONSORS[i],
      target: SPAC_TARGETS[i],
      status,
      trustValue,
      currentPrice,
      premiumDiscount,
      deadlineMonths,
      volume,
      raiseSize,
      warrantsPerUnit,
      warrantStrike,
      targetDescription: SPAC_TARGET_DESCRIPTIONS[i],
      dealTerms: SPAC_DEAL_TERMS[i],
      sector: SPAC_SECTORS[i],
    };
  });
}

// ── Generate Convertible Bond data (seed=9002) ────────────────────────────────

const CB_ISSUERS = [
  "Tesla Inc", "Palantir Technologies", "Block Inc", "MicroStrategy",
  "Datadog Inc", "Sea Limited", "Zillow Group", "Chegg Inc",
];
const CB_TICKERS = ["TSLA", "PLTR", "SQ", "MSTR", "DDOG", "SE", "Z", "CHGG"];
const CB_SECTORS = [
  "EV/Auto", "Software", "Fintech", "Bitcoin Treasury",
  "Cloud/SaaS", "E-commerce", "PropTech", "EdTech",
];

function normalCDF(x: number): number {
  const a = 0.2316419;
  const b = [0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429];
  const t = 1 / (1 + a * Math.abs(x));
  let poly = 0;
  let tp = t;
  for (let i = 0; i < 5; i++) { poly += b[i] * tp; tp *= t; }
  const pdf = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  const result = 1 - pdf * poly;
  return x >= 0 ? result : 1 - result;
}

function convertibleDelta(
  stockPrice: number,
  conversionPrice: number,
  timeYears: number,
  vol: number = 0.45,
): number {
  if (timeYears <= 0) return stockPrice >= conversionPrice ? 1 : 0;
  const r = 0.05;
  const d2 = (Math.log(stockPrice / conversionPrice) + (r - 0.5 * vol * vol) * timeYears) / (vol * Math.sqrt(timeYears));
  return Math.min(1, Math.max(0, normalCDF(d2)));
}

function simpleBondFloor(
  faceValue: number,
  coupon: number,
  maturityYears: number,
  yieldRate: number = 0.08,
): number {
  // Straight bond value with higher credit spread
  const periods = maturityYears * 2;
  const c = (faceValue * coupon / 100) / 2;
  const r = yieldRate / 2;
  if (r === 0) return faceValue + c * periods;
  return c * (1 - Math.pow(1 + r, -periods)) / r + faceValue / Math.pow(1 + r, periods);
}

function generateConvertibleBonds(): ConvertibleBond[] {
  const rng = mulberry32(9002);
  return CB_ISSUERS.map((issuer, i) => {
    const faceValue = 1000;
    const coupon = Math.round((rng() * 2.5 + 0.25) * 100) / 100; // 0.25–2.75%
    const maturityYears = Math.floor(rng() * 4) + 2; // 2–5 years
    const currentStockPrice = Math.round((rng() * 180 + 20) * 100) / 100;
    // Conversion premium: 20–50% above current stock
    const premiumPct = 0.20 + rng() * 0.30;
    const conversionPrice = Math.round(currentStockPrice * (1 + premiumPct) * 100) / 100;
    const conversionPremium = Math.round(premiumPct * 10000) / 100;
    const bondFloor = Math.round(simpleBondFloor(faceValue, coupon, maturityYears) * 100) / 100;
    const delta = Math.round(convertibleDelta(currentStockPrice, conversionPrice, maturityYears) * 1000) / 1000;
    // Parity = (Face / conversionPrice) × currentStockPrice
    const conversionRatio = faceValue / conversionPrice;
    const parityValue = Math.round(conversionRatio * currentStockPrice * 100) / 100;
    const hasCall = rng() > 0.4;
    const hasPut = rng() > 0.6;

    return {
      id: `cb-${i}`,
      issuer,
      ticker: CB_TICKERS[i],
      faceValue,
      coupon,
      maturityYears,
      conversionPrice,
      currentStockPrice,
      conversionPremium,
      bondFloor,
      delta,
      parityValue,
      callProvision: hasCall
        ? `Issuer callable at 130% parity after year ${Math.floor(maturityYears / 2)}`
        : "Non-callable",
      putProvision: hasPut
        ? `Holder put at par + accrued on year ${Math.floor(maturityYears / 2) + 1}`
        : "No put provision",
      sector: CB_SECTORS[i],
    };
  });
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SpacStatus }) {
  const cfg = {
    "Pre-deal": "bg-slate-500/20 text-slate-400 border-slate-500/30",
    "Announced": "bg-primary/20 text-primary border-border",
    "Voting": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "Completed": "bg-green-500/20 text-green-400 border-green-500/30",
  }[status];
  const icons = {
    "Pre-deal": Clock,
    "Announced": Info,
    "Voting": AlertTriangle,
    "Completed": CheckCircle2,
  };
  const Icon = icons[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", cfg)}>
      <Icon className="h-2.5 w-2.5" />
      {status}
    </span>
  );
}

// ── Delta badge ───────────────────────────────────────────────────────────────

function DeltaBadge({ delta }: { delta: number }) {
  const color =
    delta >= 0.7 ? "bg-green-500/20 text-green-400 border-green-500/30" :
    delta >= 0.4 ? "bg-primary/20 text-primary border-border" :
    delta >= 0.2 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
    "bg-slate-500/20 text-slate-400 border-slate-500/30";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums", color)}>
      Δ {delta.toFixed(2)}
    </span>
  );
}

// ── SPAC detail panel ─────────────────────────────────────────────────────────

function SpacDetailPanel({ spac, onClose }: { spac: SPAC; onClose: () => void }) {
  const warrantsLabel = spac.warrantsPerUnit === 1/3 ? "1/3" : spac.warrantsPerUnit === 1/2 ? "1/2" : "1";
  const downside = spac.trustValue - spac.currentPrice;
  const downsidePct = (downside / spac.currentPrice) * 100;
  const warrantsEstimate = Math.max(0, spac.currentPrice - spac.warrantStrike) * 0.3;

  return (
    <div className="flex h-full flex-col overflow-y-auto border-l border-border/50 bg-card/40 p-4">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{spac.name}</h3>
          <p className="text-xs text-muted-foreground">{spac.ticker} · {spac.sector}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Trust floor indicator */}
      <div className="mb-3 rounded-lg border border-border/50 bg-background/50 p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Trust Floor Safety</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Trust Value</p>
            <p className="text-sm font-bold text-green-400">${spac.trustValue.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Current Price</p>
            <p className="text-sm font-bold text-foreground">${spac.currentPrice.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Downside</p>
            <p className={cn("text-sm font-bold", downside <= 0 ? "text-green-400" : "text-red-400")}>
              {downside <= 0 ? `$${Math.abs(downside).toFixed(2)}` : `-$${Math.abs(downside).toFixed(2)}`}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground/70">
          {downsidePct <= 0
            ? `Buying below trust value — ${Math.abs(downsidePct).toFixed(1)}% margin of safety`
            : `Trading ${downsidePct.toFixed(1)}% above trust — premium reflects deal upside`}
        </p>
      </div>

      {/* Target description */}
      <div className="mb-3">
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground/60">
          Target
        </p>
        <p className="text-xs leading-relaxed text-foreground/80">
          {spac.targetDescription}
        </p>
      </div>

      {/* Deal terms */}
      <div className="mb-3 rounded-lg border border-border/50 bg-background/50 p-3">
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground/60">
          Deal Terms
        </p>
        <p className="text-xs leading-relaxed text-foreground/80">{spac.dealTerms}</p>
      </div>

      {/* Warrant value */}
      <div className="mb-3 rounded-lg border border-border/50 bg-background/50 p-3">
        <p className="mb-2 text-xs font-semibold text-muted-foreground/60">
          Warrant Details
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Per unit:</span>{" "}
            <span className="font-semibold text-foreground">{warrantsLabel} warrant</span>
          </div>
          <div>
            <span className="text-muted-foreground">Strike:</span>{" "}
            <span className="font-semibold text-foreground">${spac.warrantStrike.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Est. value:</span>{" "}
            <span className="font-semibold text-foreground">${warrantsEstimate.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Deadline:</span>{" "}
            <span className="font-semibold text-amber-400">{spac.deadlineMonths}mo</span>
          </div>
        </div>
      </div>

      {/* Redemption option */}
      <div className="rounded-lg border border-border bg-primary/5 p-3">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Shield className="h-3 w-3" /> Redemption Right
        </p>
        <p className="text-xs leading-relaxed text-foreground/70">
          Shareholders may redeem at the trust value (${spac.trustValue.toFixed(2)} + accrued interest) before
          the vote regardless of the deal outcome. This provides a floor on losses.
        </p>
      </div>
    </div>
  );
}

// ── Convertible bond detail panel ─────────────────────────────────────────────

function BondDetailPanel({ bond, onClose }: { bond: ConvertibleBond; onClose: () => void }) {
  const conversionRatio = bond.faceValue / bond.conversionPrice;
  const inTheMoney = bond.currentStockPrice > bond.conversionPrice;

  return (
    <div className="flex h-full flex-col overflow-y-auto border-l border-border/50 bg-card/40 p-4">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{bond.issuer}</h3>
          <p className="text-xs text-muted-foreground">{bond.ticker} · {bond.sector}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Status */}
      <div className={cn(
        "mb-3 rounded-lg border p-3",
        inTheMoney ? "border-green-500/30 bg-green-500/10" : "border-slate-500/20 bg-slate-500/5",
      )}>
        <div className="flex items-center gap-2">
          {inTheMoney
            ? <TrendingUp className="h-4 w-4 text-green-400" />
            : <TrendingDown className="h-4 w-4 text-slate-400" />}
          <span className={cn("text-xs font-semibold", inTheMoney ? "text-green-400" : "text-slate-400")}>
            {inTheMoney ? "In-the-Money — Conversion favorable" : "Out-of-the-Money — Bond floor dominant"}
          </span>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground/70">
          Stock at ${bond.currentStockPrice.toFixed(2)} vs. conversion price ${bond.conversionPrice.toFixed(2)}
          ({bond.conversionPremium.toFixed(1)}% premium)
        </p>
      </div>

      {/* Term sheet */}
      <div className="mb-3 rounded-lg border border-border/50 bg-background/50 p-3">
        <p className="mb-2 text-xs font-semibold text-muted-foreground/60">
          Term Sheet
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Face Value:</span>{" "}
            <span className="font-semibold text-foreground">${bond.faceValue.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Coupon:</span>{" "}
            <span className="font-semibold text-foreground">{bond.coupon.toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Maturity:</span>{" "}
            <span className="font-semibold text-foreground">{bond.maturityYears}yr</span>
          </div>
          <div>
            <span className="text-muted-foreground">Conv. Ratio:</span>{" "}
            <span className="font-semibold text-foreground">{conversionRatio.toFixed(2)}x</span>
          </div>
          <div>
            <span className="text-muted-foreground">Bond Floor:</span>{" "}
            <span className="font-semibold text-foreground">${bond.bondFloor.toFixed(0)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Parity Value:</span>{" "}
            <span className={cn("font-semibold", inTheMoney ? "text-green-400" : "text-foreground")}>
              ${bond.parityValue.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Provisions */}
      <div className="mb-3 rounded-lg border border-border/50 bg-background/50 p-3">
        <p className="mb-2 text-xs font-semibold text-muted-foreground/60">
          Call / Put Provisions
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-1.5">
            <span className="mt-0.5 text-amber-400">Call:</span>
            <span className="text-foreground/80">{bond.callProvision}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="mt-0.5 text-primary">Put:</span>
            <span className="text-foreground/80">{bond.putProvision}</span>
          </div>
        </div>
      </div>

      {/* Delta gauge */}
      <div className="rounded-lg border border-border/50 bg-background/50 p-3">
        <p className="mb-2 text-xs font-semibold text-muted-foreground/60">
          Conversion Delta (Equity Sensitivity)
        </p>
        <div className="mb-1.5 h-2 w-full rounded-full bg-slate-700">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${bond.delta * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 (Pure Bond)</span>
          <span className="font-semibold text-primary">{bond.delta.toFixed(2)}</span>
          <span>1 (Equity-like)</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground/70">
          Delta {bond.delta.toFixed(2)} means the convertible moves ~${(bond.delta * 100).toFixed(0)} for every $100 move in the stock.
        </p>
      </div>
    </div>
  );
}

// ── SPAC Arb payoff SVG ───────────────────────────────────────────────────────

function ArbPayoffChart({
  currentPrice,
  trustValue,
}: {
  currentPrice: number;
  trustValue: number;
}) {
  const W = 380;
  const H = 200;
  const pad = { l: 50, r: 20, t: 16, b: 36 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;

  const minX = trustValue * 0.88;
  const maxX = trustValue * 1.60;
  const minY = -3;
  const maxY = 9;

  function xPx(v: number) {
    return pad.l + ((v - minX) / (maxX - minX)) * chartW;
  }
  function yPx(v: number) {
    return pad.t + (1 - (v - minY) / (maxY - minY)) * chartH;
  }

  // Payoff: if stock < trust, you get trust (floor), gain = trustValue - currentPrice
  // If stock > trust, you get stock, gain = stock - currentPrice
  // So payoff in $ = max(trustValue, stockPrice) - currentPrice
  const nPoints = 60;
  const pts: [number, number][] = [];
  for (let i = 0; i <= nPoints; i++) {
    const s = minX + (i / nPoints) * (maxX - minX);
    const payoff = Math.max(trustValue, s) - currentPrice;
    pts.push([xPx(s), yPx(payoff)]);
  }
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const xLabels = [minX, trustValue, maxX * 0.85, maxX];
  const yLabels = [-2, 0, 2, 4, 6, 8];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      {/* Grid */}
      {yLabels.map(v => (
        <line
          key={v}
          x1={pad.l} y1={yPx(v)} x2={W - pad.r} y2={yPx(v)}
          stroke="#334155" strokeWidth="0.5" strokeDasharray={v === 0 ? "none" : "3,3"}
        />
      ))}
      {/* Zero line */}
      <line x1={pad.l} y1={yPx(0)} x2={W - pad.r} y2={yPx(0)} stroke="#64748b" strokeWidth="1" />

      {/* Trust floor vertical */}
      <line
        x1={xPx(trustValue)} y1={pad.t}
        x2={xPx(trustValue)} y2={pad.t + chartH}
        stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,3"
      />
      <text x={xPx(trustValue) + 3} y={pad.t + 10} fontSize="8" fill="#3b82f6">Trust ${trustValue}</text>

      {/* Current price vertical */}
      <line
        x1={xPx(currentPrice)} y1={pad.t}
        x2={xPx(currentPrice)} y2={pad.t + chartH}
        stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2"
      />
      <text x={xPx(currentPrice) + 3} y={pad.t + 22} fontSize="8" fill="#f59e0b">Price ${currentPrice}</text>

      {/* Payoff fill */}
      <path
        d={`${pathD} L${xPx(maxX)},${yPx(0)} L${xPx(minX)},${yPx(0)} Z`}
        fill="#22c55e" fillOpacity="0.12"
      />
      {/* Payoff line */}
      <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="2" />

      {/* Y axis labels */}
      {yLabels.map(v => (
        <text key={v} x={pad.l - 4} y={yPx(v) + 3.5} fontSize="8" fill="#64748b" textAnchor="end">
          ${v}
        </text>
      ))}
      {/* X axis labels */}
      {[minX, trustValue, maxX].map((v, i) => (
        <text key={i} x={xPx(v)} y={H - 4} fontSize="8" fill="#64748b" textAnchor="middle">
          ${v.toFixed(1)}
        </text>
      ))}
      <text x={pad.l - 6} y={pad.t - 4} fontSize="8" fill="#64748b">P&L ($)</text>
    </svg>
  );
}

// ── SPAC Tracker tab ──────────────────────────────────────────────────────────

function SpacTrackerTab({ spacs }: { spacs: SPAC[] }) {
  const [filter, setFilter] = useState<SpacFilter>("All");
  const [selectedSpac, setSelectedSpac] = useState<SPAC | null>(null);

  const filtered = useMemo(() => {
    if (filter === "All") return spacs;
    return spacs.filter(s => s.status === filter);
  }, [spacs, filter]);

  return (
    <div className="flex h-full gap-0">
      {/* Left: table */}
      <div className={cn("flex flex-col", selectedSpac ? "flex-1 min-w-0" : "w-full")}>
        {/* Filter bar */}
        <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2.5">
          {(["All", "Pre-deal", "Announced"] as SpacFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} SPACs</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[700px] text-xs">
            <thead className="sticky top-0 bg-background/95 backdrop-blur-sm">
              <tr className="border-b border-border/50">
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground/70">SPAC</th>
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground/70">Target</th>
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground/70">Status</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground/70">Trust ($)</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground/70">Prem/Disc</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground/70">Deadline</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground/70">Volume (K)</th>
                <th className="px-2 py-2.5 text-center font-medium text-muted-foreground/70"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(spac => (
                <tr
                  key={spac.id}
                  onClick={() => setSelectedSpac(prev => prev?.id === spac.id ? null : spac)}
                  className={cn(
                    "cursor-pointer border-b border-border/30 transition-colors hover:bg-accent/30",
                    selectedSpac?.id === spac.id ? "bg-accent/50" : "",
                  )}
                >
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-foreground">{spac.name.split(" ").slice(0, 2).join(" ")}</div>
                    <div className="text-xs text-muted-foreground">{spac.ticker}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    {spac.target ? (
                      <span className="font-medium text-foreground">{spac.target}</span>
                    ) : (
                      <span className="text-muted-foreground/50 italic">TBA</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={spac.status} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-medium text-foreground">
                    ${spac.trustValue.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    <span className={cn(
                      "font-semibold",
                      spac.premiumDiscount > 0 ? "text-green-400" : "text-red-400",
                    )}>
                      {spac.premiumDiscount > 0 ? "+" : ""}{spac.premiumDiscount.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={cn(
                      "font-medium",
                      spac.deadlineMonths <= 6 ? "text-amber-400" : "text-foreground",
                    )}>
                      {spac.deadlineMonths}mo
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-foreground">{spac.volume}K</td>
                  <td className="px-2 py-2.5 text-center">
                    <ChevronRight className={cn(
                      "h-3.5 w-3.5 text-muted-foreground/50 transition-transform",
                      selectedSpac?.id === spac.id ? "rotate-90" : "",
                    )} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: detail panel */}
      {selectedSpac && (
        <div className="w-[320px] shrink-0">
          <SpacDetailPanel spac={selectedSpac} onClose={() => setSelectedSpac(null)} />
        </div>
      )}
    </div>
  );
}

// ── SPAC Arb Calculator tab ───────────────────────────────────────────────────

function SpacArbCalculatorTab() {
  const [price, setPrice] = useState("10.35");
  const [trust, setTrust] = useState("10.20");
  const [rfRate, setRfRate] = useState("5.2");
  const [months, setMonths] = useState("12");

  const results = useMemo(() => {
    const p = parseFloat(price) || 0;
    const t = parseFloat(trust) || 0;
    const rf = parseFloat(rfRate) / 100 || 0;
    const m = parseFloat(months) || 1;
    const years = m / 12;

    // Trust redemption value (grows at rf)
    const redemptionValue = t * Math.pow(1 + rf, years);
    // Annual return if bought at p and redeemed
    const annReturn = (Math.pow(redemptionValue / p, 1 / years) - 1) * 100;
    // Downside: if miss deadline → worst case
    const downside = ((t - p) / p) * 100;
    // Warrant upside: rough estimate
    const warrantUpside = ((p * 1.3 - 11.5) / p) * 100 * 0.33; // 1/3 warrant
    // Risk-adjusted (discount by 15% deal failure rate)
    const riskAdj = annReturn * 0.85 + warrantUpside * 0.25;

    return { redemptionValue, annReturn, downside, warrantUpside, riskAdj };
  }, [price, trust, rfRate, months]);

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      {/* Educational callout */}
      <div className="rounded-lg border border-border bg-primary/10 p-4">
        <div className="mb-2 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">SPAC Arb Thesis</span>
        </div>
        <p className="text-xs leading-relaxed text-foreground/80">
          SPAC arbitrage exploits the asymmetric return profile: <strong className="text-primary">downside is protected by the trust value</strong> (you can redeem at NAV),
          while upside comes from a successful deal announcement. Investors buy SPACs trading near trust value,
          collect the T-bill rate while waiting, and profit if a deal is announced above NAV. The warrant sweetener
          provides additional free upside optionality.
        </p>
      </div>

      {/* Inputs */}
      <div className="rounded-lg border border-border/50 bg-card/60 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Inputs</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Current SPAC Price ($)", value: price, set: setPrice, step: "0.01" },
            { label: "Trust Value ($)", value: trust, set: setTrust, step: "0.01" },
            { label: "Annualized Risk-Free Rate (%)", value: rfRate, set: setRfRate, step: "0.1" },
            { label: "Time to Deadline (months)", value: months, set: setMonths, step: "1" },
          ].map(({ label, value, set, step }) => (
            <div key={label}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground/70">{label}</label>
              <input
                type="number"
                value={value}
                step={step}
                onChange={e => set(e.target.value)}
                className="w-full rounded border border-border/50 bg-background px-2.5 py-1.5 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Outputs */}
      <div className="rounded-lg border border-border/50 bg-card/60 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Analysis</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Annualized Return (to Redemption)",
              value: `${results.annReturn.toFixed(2)}%`,
              color: results.annReturn >= 0 ? "text-green-400" : "text-red-400",
              icon: TrendingUp,
            },
            {
              label: "Downside from Trust",
              value: `${results.downside.toFixed(2)}%`,
              color: results.downside >= 0 ? "text-green-400" : "text-red-400",
              icon: Shield,
            },
            {
              label: "Warrant Upside Estimate",
              value: `${results.warrantUpside.toFixed(2)}%`,
              color: "text-primary",
              icon: TrendingUp,
            },
            {
              label: "Risk-Adjusted Return",
              value: `${results.riskAdj.toFixed(2)}%`,
              color: results.riskAdj >= 0 ? "text-amber-400" : "text-red-400",
              icon: Calculator,
            },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="rounded-md border border-border/40 bg-background/50 p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground/70">{label}</p>
              </div>
              <p className={cn("text-xl font-bold tabular-nums", color)}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payoff diagram */}
      <div className="rounded-lg border border-border/50 bg-card/60 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Payoff Diagram</h3>
        <p className="mb-2 text-xs text-muted-foreground/70">
          P&L per share vs. final stock price. Floor is guaranteed by trust redemption.
        </p>
        <ArbPayoffChart
          currentPrice={parseFloat(price) || 10.35}
          trustValue={parseFloat(trust) || 10.20}
        />
        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-green-500" /> Payoff</span>
          <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-4 border-t border-dashed border-primary" /> Trust Floor</span>
          <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-4 border-t border-dashed border-amber-400" /> Entry Price</span>
        </div>
      </div>
    </div>
  );
}

// ── Convertible Bonds tab ─────────────────────────────────────────────────────

function ConvertibleBondsTab({ bonds }: { bonds: ConvertibleBond[] }) {
  const [selectedBond, setSelectedBond] = useState<ConvertibleBond | null>(null);

  return (
    <div className="flex h-full gap-0">
      {/* Left: table */}
      <div className={cn("flex flex-col", selectedBond ? "flex-1 min-w-0" : "w-full")}>
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[780px] text-xs">
            <thead className="sticky top-0 bg-background/95 backdrop-blur-sm">
              <tr className="border-b border-border/50">
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground/70">Issuer</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground/70">Coupon</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground/70">Conv. Price</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground/70">Stock Price</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground/70">Conv. Prem.</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground/70">Bond Floor</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground/70">Parity</th>
                <th className="px-3 py-2.5 text-center font-medium text-muted-foreground/70">Delta</th>
                <th className="px-2 py-2.5 text-center font-medium text-muted-foreground/70">ITM</th>
                <th className="px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {bonds.map(bond => {
                const itm = bond.currentStockPrice > bond.conversionPrice;
                return (
                  <tr
                    key={bond.id}
                    onClick={() => setSelectedBond(prev => prev?.id === bond.id ? null : bond)}
                    className={cn(
                      "cursor-pointer border-b border-border/30 transition-colors hover:bg-accent/30",
                      selectedBond?.id === bond.id ? "bg-accent/50" : "",
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-foreground">{bond.issuer}</div>
                      <div className="text-xs text-muted-foreground">{bond.ticker} · {bond.maturityYears}yr</div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground">{bond.coupon.toFixed(2)}%</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground">${bond.conversionPrice.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground">${bond.currentStockPrice.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      <span className={cn(itm ? "text-green-400" : "text-foreground")}>
                        +{bond.conversionPremium.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground">${bond.bondFloor.toFixed(0)}</td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      <span className={cn(itm ? "text-green-400 font-semibold" : "text-muted-foreground")}>
                        ${bond.parityValue.toFixed(0)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <DeltaBadge delta={bond.delta} />
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      {itm ? (
                        <TrendingUp className="mx-auto h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <TrendingDown className="mx-auto h-3.5 w-3.5 text-slate-500" />
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <ChevronRight className={cn(
                        "h-3.5 w-3.5 text-muted-foreground/50 transition-transform",
                        selectedBond?.id === bond.id ? "rotate-90" : "",
                      )} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 border-t border-border/50 px-4 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-400" /> In-the-money (stock &gt; conv. price)
          </span>
          <span className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-slate-500" /> Out-of-the-money
          </span>
          <span className="ml-auto">Parity = (Face ÷ Conv. Price) × Stock Price</span>
        </div>
      </div>

      {/* Right: detail */}
      {selectedBond && (
        <div className="w-[320px] shrink-0">
          <BondDetailPanel bond={selectedBond} onClose={() => setSelectedBond(null)} />
        </div>
      )}
    </div>
  );
}

// ── Education tab ─────────────────────────────────────────────────────────────

const EDU_SECTIONS = [
  {
    emoji: "🏗️",
    title: "What is a SPAC?",
    content: [
      "A Special Purpose Acquisition Company (SPAC) is a 'blank check' shell company that raises money via IPO with the sole purpose of acquiring a private company.",
      "Lifecycle: IPO → Funds held in trust → Target identified → Shareholder vote → Merger (De-SPAC) or dissolution.",
      "Investors receive units (shares + warrants) at $10/share. The trust earns T-bill returns while searching for a target.",
      "Shareholders can vote YES and stay invested, vote YES and redeem at trust NAV, or vote NO — protecting their downside.",
    ],
  },
  {
    emoji: "⚠️",
    title: "SPAC Risks",
    content: [
      "Dilution: Sponsor promote (typically 20% of shares) is free — existing shareholders bear this cost via share price dilution.",
      "Warrant overhang: Millions of warrants at $11.50 can suppress the stock price post-merger if exercised.",
      "Miss deadline risk: If no deal closes within 18–24 months, the SPAC dissolves and cash is returned — opportunity cost.",
      "Bubble valuations: SPAC mergers often use overly optimistic projections; post-merger returns have historically underperformed.",
    ],
  },
  {
    emoji: "🔄",
    title: "Convertible Bond Basics",
    content: [
      "A convertible bond is a hybrid security: it pays a coupon like a bond but can be converted into shares at a preset conversion price.",
      "Conversion Premium: The percentage above the current stock price at which conversion occurs. Higher premium = more bond-like behavior.",
      "Bond Floor: The value of the bond if the conversion option is worthless — acts as a price floor for the convertible.",
      "As the stock rises above the conversion price, the convertible behaves more like equity (delta → 1). Below, it acts like a bond (delta → 0).",
    ],
  },
  {
    emoji: "⚖️",
    title: "Convertible Arbitrage",
    content: [
      "Strategy: Buy the convertible bond and short the underlying stock in a delta-neutral ratio to isolate the embedded option value.",
      "As stock prices move, the arbitrageur dynamically rehedges (delta hedging), capturing gamma (convexity) profits.",
      "The bond floor provides downside protection: even if the equity crashes, the convertible retains straight bond value.",
      "Risk: Credit events (issuer default) collapse both legs simultaneously, eliminating the assumed hedge.",
    ],
  },
];

function EducationTab() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      {EDU_SECTIONS.map(({ emoji, title, content }) => (
        <div key={title} className="rounded-lg border border-border/50 bg-card/60 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="text-xl" role="img" aria-label={title}>{emoji}</span>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          <ul className="space-y-2">
            {content.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-foreground/80">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SPACS = generateSPACs();
const BONDS = generateConvertibleBonds();

export default function SPACsPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">SPACs &amp; Convertible Bonds</h1>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            Simulator
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          SPAC arbitrage tracker, convertible bond analytics, and structured finance education
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tracker" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="shrink-0 justify-start gap-0 rounded-none border-b border-border/50 bg-transparent px-4 h-9">
          {[
            { value: "tracker", label: "SPAC Tracker" },
            { value: "arb", label: "Arb Calculator" },
            { value: "convertibles", label: "Convertible Bonds" },
            { value: "education", label: "Education" },
          ].map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-none border-b-2 border-transparent px-4 py-1.5 text-xs font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="tracker" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
          <SpacTrackerTab spacs={SPACS} />
        </TabsContent>

        <TabsContent value="arb" className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden">
          <SpacArbCalculatorTab />
        </TabsContent>

        <TabsContent value="convertibles" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
          <ConvertibleBondsTab bonds={BONDS} />
        </TabsContent>

        <TabsContent value="education" className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden">
          <EducationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
