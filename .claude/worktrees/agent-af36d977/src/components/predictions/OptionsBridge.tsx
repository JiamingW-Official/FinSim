"use client";

import { useState, useMemo, useCallback } from "react";
import { Info, ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { PREDICTION_MARKETS } from "@/data/prediction-markets";

// ── Black-Scholes binary call (cash-or-nothing) ──────────────────────────────
// Value = e^(-rT) * N(d2)
// d2   = [ ln(S/K) + (r - 0.5*σ²)*T ] / (σ*√T)
function normalCDF(x: number): number {
  // Abramowitz & Stegun approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1.0 / (1.0 + p * ax);
  const poly = t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))));
  const erfc = poly * Math.exp(-ax * ax);
  return 0.5 * (1.0 + sign * (1.0 - erfc));
}

interface BSBinaryResult {
  price: number;    // 0–1
  d2: number;
  probRN: number;   // risk-neutral prob = N(d2)
}

function bsBinaryCall(
  S: number,   // spot (normalized to 1.0 for event contracts)
  K: number,   // strike = 1.0 (binary: pays 1 if event happens)
  sigma: number, // implied vol (annual)
  T: number,   // time to expiry in years
  r: number,   // risk-free rate
): BSBinaryResult {
  if (T <= 0 || sigma <= 0) return { price: 0, d2: 0, probRN: 0 };
  const d2 = (Math.log(S / K) + (r - 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const probRN = normalCDF(d2);
  const price = Math.exp(-r * T) * probRN;
  return { price, d2, probRN };
}

// ── P&L curve data ──────────────────────────────────────────────────────────
function buildPnLPoints(
  contractPrice: number, // 0–1
  maxPayoff: number,
  isYesSide: boolean,
  nPoints = 60,
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= nPoints; i++) {
    const finalProb = i / nPoints; // 0 → 1
    // At expiry: YES pays maxPayoff if event resolves YES (prob→1)
    // contract value = finalProb * maxPayoff
    const finalValue = isYesSide
      ? finalProb * maxPayoff
      : (1 - finalProb) * maxPayoff;
    const cost = contractPrice * maxPayoff;
    const pnl = finalValue - cost;
    pts.push({ x: finalProb, y: pnl });
  }
  return pts;
}

// ── Binary option payoff ────────────────────────────────────────────────────
function buildBinaryPayoffPoints(
  optionPrice: number, // 0–1 (BS price)
  maxPayoff: number,
  nPoints = 60,
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= nPoints; i++) {
    const finalProb = i / nPoints;
    // Binary call: pays maxPayoff if event (S>K), nothing otherwise
    // At expiry: piecewise — 0 profit below threshold, +maxPayoff above
    const threshold = 0.5;
    const payout = finalProb >= threshold ? maxPayoff : 0;
    const cost = optionPrice * maxPayoff;
    const pnl = payout - cost;
    pts.push({ x: finalProb, y: pnl });
  }
  return pts;
}

// ── SVG P&L curve ────────────────────────────────────────────────────────────
function PnLChart({
  points,
  maxPayoff,
  label,
  color,
  showVerticalAt,
}: {
  points: { x: number; y: number }[];
  maxPayoff: number;
  label: string;
  color: string;
  showVerticalAt?: number;
}) {
  const W = 280;
  const H = 120;
  const pad = { top: 12, right: 12, bottom: 20, left: 40 };
  const pw = W - pad.left - pad.right;
  const ph = H - pad.top - pad.bottom;

  const maxLoss = -maxPayoff * 0.5;
  const maxGain = maxPayoff * 0.7;
  const yRange = maxGain - maxLoss;
  const zeroY = pad.top + ph * (maxGain / yRange);

  const toSvg = (p: { x: number; y: number }) => ({
    sx: pad.left + p.x * pw,
    sy: pad.top + ((maxGain - p.y) / yRange) * ph,
  });

  const svgPts = points.map(toSvg);
  const pathD =
    svgPts
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`)
      .join(" ");

  // Fill area above zero = gain, below = loss
  const gainD = `M${toSvg(points[0]).sx.toFixed(1)},${zeroY.toFixed(1)} ` +
    svgPts
      .map((p, i) => `${i === 0 ? "L" : "L"}${p.sx.toFixed(1)},${Math.min(p.sy, zeroY).toFixed(1)}`)
      .join(" ") +
    ` L${toSvg(points[points.length - 1]).sx.toFixed(1)},${zeroY.toFixed(1)} Z`;

  const lossD = `M${toSvg(points[0]).sx.toFixed(1)},${zeroY.toFixed(1)} ` +
    svgPts
      .map((p, i) => `${i === 0 ? "L" : "L"}${p.sx.toFixed(1)},${Math.max(p.sy, zeroY).toFixed(1)}`)
      .join(" ") +
    ` L${toSvg(points[points.length - 1]).sx.toFixed(1)},${zeroY.toFixed(1)} Z`;

  const vertX = showVerticalAt !== undefined
    ? pad.left + showVerticalAt * pw
    : null;

  return (
    <div>
      <div className="mb-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        aria-hidden="true"
      >
        {/* Zero line */}
        <line
          x1={pad.left}
          x2={pad.left + pw}
          y1={zeroY}
          y2={zeroY}
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeDasharray="3 3"
        />

        {/* Gain fill */}
        <path d={gainD} fill="#22c55e" fillOpacity={0.12} />
        {/* Loss fill */}
        <path d={lossD} fill="#ef4444" fillOpacity={0.12} />

        {/* P&L line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current probability vertical */}
        {vertX !== null && (
          <line
            x1={vertX}
            x2={vertX}
            y1={pad.top}
            y2={pad.top + ph}
            stroke="hsl(var(--primary))"
            strokeOpacity={0.6}
            strokeDasharray="4 2"
            strokeWidth="1"
          />
        )}

        {/* Y axis labels */}
        {[maxGain, 0, maxLoss].map((v, i) => (
          <text
            key={i}
            x={pad.left - 4}
            y={pad.top + ((maxGain - v) / yRange) * ph + 3}
            textAnchor="end"
            fontSize="8"
            fill="currentColor"
            fillOpacity={0.5}
          >
            {v >= 0 ? "+" : ""}
            {Math.round(v)}
          </text>
        ))}

        {/* X axis labels */}
        {[0, 0.5, 1].map((v) => (
          <text
            key={v}
            x={pad.left + v * pw}
            y={H - 4}
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
            fillOpacity={0.5}
          >
            {Math.round(v * 100)}%
          </text>
        ))}

        {/* X axis label */}
        <text
          x={pad.left + pw / 2}
          y={H - 2}
          textAnchor="middle"
          fontSize="7"
          fill="currentColor"
          fillOpacity={0.35}
        >
          Outcome probability at expiry
        </text>
      </svg>
    </div>
  );
}

// ── Volume bars ──────────────────────────────────────────────────────────────
function VolumeBars({
  history,
  probability,
}: {
  history: number[];
  probability: number;
}) {
  const W = 280;
  const H = 40;
  const pad = { left: 4, right: 4, top: 4, bottom: 4 };
  const pw = W - pad.left - pad.right;
  const ph = H - pad.top - pad.bottom;
  const n = history.length;
  const barW = (pw / n) * 0.7;

  // Synthetic volume: higher where price moved more
  const volumes = history.map((p, i) => {
    if (i === 0) return 0.3;
    const move = Math.abs(p - history[i - 1]);
    return 0.2 + Math.min(1, move / 15);
  });
  const maxVol = Math.max(...volumes);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
      {history.map((p, i) => {
        const x = pad.left + (i / n) * pw;
        const volH = (volumes[i] / maxVol) * ph;
        const isAbove = p > probability;
        return (
          <rect
            key={i}
            x={x}
            y={pad.top + ph - volH}
            width={barW}
            height={volH}
            fill={isAbove ? "#22c55e" : "#ef4444"}
            fillOpacity={0.4}
            rx={0.5}
          />
        );
      })}
    </svg>
  );
}

// ── Bridge arrow animation (CSS-based) ──────────────────────────────────────
function BridgeArrow({ gap }: { gap: number }) {
  const isArbitrage = Math.abs(gap) > 5;
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-2">
      <div className="flex items-center gap-1">
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <ArrowRight
          className={cn(
            "h-4 w-4 transition-colors",
            isArbitrage ? "text-amber-400" : "text-primary",
          )}
          style={{
            opacity: isArbitrage ? 1 : 0.5,
            animation: isArbitrage ? "pulse 1.5s infinite" : "none",
          }}
        />
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="text-center">
        <div className={cn(
          "text-[10px] font-semibold tabular-nums",
          isArbitrage ? "text-amber-400" : "text-muted-foreground",
        )}>
          {gap > 0 ? "+" : ""}{gap.toFixed(2)}c gap
        </div>
        <div className="text-[9px] text-muted-foreground mt-0.5">
          {isArbitrage ? "arb window" : "efficient"}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function OptionsBridge() {
  // Pick a default market — one with decent probability
  const defaultMarket = PREDICTION_MARKETS.find((m) => m.probability >= 55 && m.probability <= 75)
    ?? PREDICTION_MARKETS[0];

  const [selectedMarketId, setSelectedMarketId] = useState(defaultMarket.id);
  const [probability, setProbability] = useState(defaultMarket.probability);
  const [impliedVol, setImpliedVol] = useState(45); // % annualized
  const [riskFreeRate] = useState(5.25); // % — current Fed funds rate
  const [showFormulas, setShowFormulas] = useState(false);

  const market = useMemo(
    () => PREDICTION_MARKETS.find((m) => m.id === selectedMarketId) ?? defaultMarket,
    [selectedMarketId, defaultMarket],
  );

  // Time to expiry in years
  const T = useMemo(() => {
    const now = new Date();
    const expiry = new Date(market.resolvesAt);
    const days = Math.max(1, (expiry.getTime() - now.getTime()) / 86400000);
    return days / 365;
  }, [market.resolvesAt]);

  // Contract price from market probability
  const contractPrice = probability / 100; // e.g. 0.65

  // BS binary call: treat S = market_prob, K = 0.5 threshold, σ = impliedVol
  // We normalize: S = probability/100, K = 0.50, event binary pays $1
  const bs = useMemo(() => {
    const S = probability / 100;
    const K = 0.50; // ATM by convention (event binary)
    const sigma = impliedVol / 100;
    const r = riskFreeRate / 100;
    return bsBinaryCall(S, K, sigma, T, r);
  }, [probability, impliedVol, T, riskFreeRate]);

  const MAX_PAYOFF = 100; // normalized to 100 pts

  const gap = contractPrice - bs.price; // prediction market premium over BS
  const gapCents = gap * 100;

  const pnlPoints = useMemo(
    () => buildPnLPoints(contractPrice, MAX_PAYOFF, true, 60),
    [contractPrice],
  );

  const binaryPoints = useMemo(
    () => buildBinaryPayoffPoints(bs.price, MAX_PAYOFF, 60),
    [bs.price],
  );

  const handleProbChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProbability(Number(e.target.value));
  }, []);

  const handleVolChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImpliedVol(Number(e.target.value));
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">
            Prediction Market — Options Bridge
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-72 text-xs">
              A prediction market contract is mathematically equivalent to a
              binary (cash-or-nothing) call option. The left panel shows the
              event contract; the right shows the Black-Scholes binary equivalent.
              The gap between them reveals the risk premium the market charges
              for path-dependent event uncertainty.
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-xs text-muted-foreground">
          Every event contract IS a binary option. Drag the slider to see both
          valuations update in real time.
        </p>
      </div>

      {/* Market selector */}
      <div>
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
          Select Contract
        </label>
        <select
          value={selectedMarketId}
          onChange={(e) => {
            setSelectedMarketId(e.target.value);
            const m = PREDICTION_MARKETS.find((x) => x.id === e.target.value);
            if (m) setProbability(m.probability);
          }}
          className="w-full appearance-none rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-colors cursor-pointer"
        >
          {PREDICTION_MARKETS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.question.slice(0, 75)}{m.question.length > 75 ? "…" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Interactive sliders */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="font-medium uppercase tracking-wider">Market Probability</span>
            <span className="font-mono font-semibold text-foreground tabular-nums">
              {probability}% / {(contractPrice * 100).toFixed(0)}c
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={99}
            step={1}
            value={probability}
            onChange={handleProbChange}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
          <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
            <span>1%</span>
            <span>99%</span>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="font-medium uppercase tracking-wider">Implied Volatility</span>
            <span className="font-mono font-semibold text-foreground tabular-nums">
              {impliedVol}% ann.
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={150}
            step={5}
            value={impliedVol}
            onChange={handleVolChange}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
          <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
            <span>5% (calm)</span>
            <span>150% (chaotic)</span>
          </div>
        </div>
      </div>

      {/* Dual panel */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr]">
        {/* LEFT: Event Contract */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Event Contract
            </span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
              Prediction Market
            </span>
          </div>

          {/* Price row */}
          <div className="mb-3 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
              ${contractPrice.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">per share (max $1.00)</span>
          </div>

          {/* Key stats */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <StatBox label="Implied Prob." value={`${probability}%`} />
            <StatBox label="Max Payout" value="$1.00" />
            <StatBox
              label="Resolves"
              value={new Date(market.resolvesAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
            />
            <StatBox label="Volume" value={`$${(market.volume / 1000).toFixed(0)}K`} />
          </div>

          {/* P&L Curve */}
          <PnLChart
            points={pnlPoints}
            maxPayoff={MAX_PAYOFF}
            label="P&L at Expiry (YES position)"
            color="#22c55e"
            showVerticalAt={probability / 100}
          />

          {/* Volume bars */}
          <div className="mt-2">
            <div className="mb-1 text-[9px] text-muted-foreground uppercase tracking-wider">
              Volume by price level
            </div>
            <VolumeBars history={market.priceHistory} probability={probability} />
          </div>

          {/* My Position section */}
          <div className="mt-3 rounded-md bg-muted/30 p-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              My Position
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry price</span>
                <span className="font-mono tabular-nums text-foreground">${contractPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max profit (if YES)</span>
                <span className="font-mono tabular-nums text-green-400">
                  +${(1 - contractPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max loss (if NO)</span>
                <span className="font-mono tabular-nums text-red-400">
                  -${contractPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Break-even prob.</span>
                <span className="font-mono tabular-nums text-foreground">
                  {probability}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Bridge */}
        <div className="flex items-center justify-center lg:flex-col">
          <BridgeArrow gap={gapCents} />
        </div>

        {/* RIGHT: Binary Call Option */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Binary Call Option
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              Black-Scholes
            </span>
          </div>

          {/* BS Price row */}
          <div className="mb-3 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
              ${bs.price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">BS fair value</span>
          </div>

          {/* Key stats */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <StatBox label="N(d2)" value={`${(bs.probRN * 100).toFixed(1)}%`} />
            <StatBox label="d2" value={bs.d2.toFixed(3)} mono />
            <StatBox label="IV" value={`${impliedVol}%`} />
            <StatBox
              label="T (years)"
              value={T.toFixed(3)}
              mono
            />
          </div>

          {/* BS Payoff Curve */}
          <PnLChart
            points={binaryPoints}
            maxPayoff={MAX_PAYOFF}
            label="BS Binary Payoff at Expiry"
            color="hsl(var(--primary))"
            showVerticalAt={0.5}
          />

          {/* BS explanation */}
          <div className="mt-2 rounded-md bg-muted/30 p-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Model Inputs
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spot (S)</span>
                <span className="font-mono tabular-nums text-foreground">
                  {(probability / 100).toFixed(2)} (prob)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Strike (K)</span>
                <span className="font-mono tabular-nums text-foreground">0.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risk-free rate (r)</span>
                <span className="font-mono tabular-nums text-foreground">
                  {riskFreeRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount factor</span>
                <span className="font-mono tabular-nums text-foreground">
                  {Math.exp(-riskFreeRate / 100 * T).toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gap Analysis */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Gap Analysis
          </span>
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-mono font-semibold tabular-nums",
              Math.abs(gapCents) > 5
                ? "bg-amber-500/10 text-amber-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            {gapCents > 0 ? "+" : ""}{gapCents.toFixed(2)}c
          </span>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <div className="flex-1 rounded-md bg-muted/40 p-3">
            <div className="mb-0.5 text-[9px] text-muted-foreground uppercase tracking-wider">
              Market Price
            </div>
            <div className="font-mono text-lg font-bold tabular-nums text-foreground">
              ${contractPrice.toFixed(2)}
            </div>
          </div>
          <span className="text-sm text-muted-foreground">vs</span>
          <div className="flex-1 rounded-md bg-muted/40 p-3">
            <div className="mb-0.5 text-[9px] text-muted-foreground uppercase tracking-wider">
              BS Fair Value
            </div>
            <div className="font-mono text-lg font-bold tabular-nums text-foreground">
              ${bs.price.toFixed(2)}
            </div>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {Math.abs(gapCents) <= 2
            ? `The ${Math.abs(gapCents).toFixed(2)}-cent gap is within normal transaction costs, suggesting these two instruments are efficiently priced relative to each other.`
            : Math.abs(gapCents) <= 8
            ? `The ${Math.abs(gapCents).toFixed(2)}-cent difference reflects the market's risk premium for event uncertainty that Black-Scholes cannot fully capture — BS assumes continuous price paths, while real events are discrete jump processes.`
            : `The ${Math.abs(gapCents).toFixed(2)}-cent gap is unusually large. ${gapCents > 0 ? "The prediction market is pricing in an event premium that BS cannot model — consider whether crowd wisdom is capturing tail risks." : "The BS model thinks the market is underpricing volatility. Could signal a liquidity gap or information asymmetry."}`
          }
        </p>
      </div>

      {/* Educational callout */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            The Core Equivalence
          </span>
        </div>

        {/* Formula display */}
        <div className="mb-3 rounded-md bg-background/60 px-4 py-3 font-mono text-xs text-foreground border border-border/50">
          <div className="mb-1">
            <span className="text-muted-foreground">P(outcome) = </span>
            <span className="text-primary font-bold">Binary Call Price</span>
            <span className="text-muted-foreground"> / Max Payoff</span>
          </div>
          <div className="mb-1">
            <span className="text-muted-foreground">Binary Call = </span>
            <span className="text-foreground">e</span>
            <sup className="text-[9px] text-muted-foreground">-rT</sup>
            <span className="text-muted-foreground"> · N(d₂)</span>
          </div>
          <div className="mb-1">
            <span className="text-muted-foreground">d₂ = </span>
            <span className="text-foreground">
              [ln(S/K) + (r − ½σ²)T] / (σ√T)
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 border-t border-border/30 pt-2">
            Currently: d₂ = {bs.d2.toFixed(4)} | N(d₂) = {(bs.probRN * 100).toFixed(2)}% | Price = ${bs.price.toFixed(4)}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          A prediction market YES share paying $1 on event resolution is
          mathematically identical to a cash-or-nothing binary call option.
          N(d₂) gives the risk-neutral probability that the option expires in the
          money — which is exactly what the market probability represents.
        </p>

        <button
          type="button"
          onClick={() => setShowFormulas(!showFormulas)}
          className="mt-2 text-[11px] text-primary hover:underline focus-visible:outline-none"
        >
          {showFormulas ? "Hide" : "Show"} Black-Scholes derivation
        </button>

        {showFormulas && (
          <div className="mt-2 rounded-md bg-background/60 p-3 text-[11px] leading-relaxed text-muted-foreground border border-border/50 space-y-1.5">
            <p>
              <strong className="text-foreground">Standard BS call</strong> pays max(S−K, 0) at expiry.
              A <strong className="text-foreground">binary (cash-or-nothing) call</strong> pays a fixed $1
              if S &gt; K, $0 otherwise.
            </p>
            <p>
              In the BS framework the value of this binary call is the
              discounted risk-neutral probability of the event: V = e<sup>−rT</sup> · N(d₂).
            </p>
            <p>
              For event contracts we normalize: S = current market probability
              (0–1), K = 0.50 (event either happens or doesn&apos;t), σ = implied
              volatility of the probability path, T = years to resolution.
            </p>
            <p>
              The gap between market price and BS value arises because:
              (1) BS assumes log-normal diffusion — events are jump processes;
              (2) Prediction markets embed crowd wisdom and news flow;
              (3) Liquidity premium affects event contracts differentially.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helper sub-component ─────────────────────────────────────────────────────
function StatBox({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-md bg-muted/30 px-2 py-1.5">
      <div className="text-[9px] text-muted-foreground">{label}</div>
      <div className={cn("text-xs font-semibold text-foreground", mono && "font-mono tabular-nums")}>
        {value}
      </div>
    </div>
  );
}
