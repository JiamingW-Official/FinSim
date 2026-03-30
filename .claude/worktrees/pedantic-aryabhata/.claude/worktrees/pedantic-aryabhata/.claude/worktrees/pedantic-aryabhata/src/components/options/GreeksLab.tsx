"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ChainAnalytics, OptionsPosition, OptionChainExpiry } from "@/types/options";
import { CONTRACT_MULTIPLIER } from "@/types/options";
import { blackScholes, normalCDF, normalPDF } from "@/services/options/black-scholes";
import { RISK_FREE_RATE } from "@/types/options";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt2(n: number): string {
  return n.toFixed(2);
}

function fmtSign(n: number): string {
  return (n >= 0 ? "+" : "") + n.toFixed(4);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ── Section title ─────────────────────────────────────────────────────────────

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-2 flex items-baseline gap-2">
      <span className="text-[11px] font-semibold text-foreground">
        {title}
      </span>
      {subtitle && (
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      )}
    </div>
  );
}

// ── 1. Portfolio Greeks Summary ───────────────────────────────────────────────

interface PortfolioGreeksSummaryProps {
  positions: OptionsPosition[];
}

function PortfolioGreeksSummary({ positions }: PortfolioGreeksSummaryProps) {
  if (positions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <SectionTitle title="Portfolio Greeks Summary" />
        <p className="text-[11px] text-muted-foreground">
          No open options positions. Open a position from the Chains tab to see
          aggregate Greeks.
        </p>
      </div>
    );
  }

  // Aggregate across all positions and legs
  let totalDelta = 0;
  let totalGamma = 0;
  let totalTheta = 0;
  let totalVega = 0;
  let totalRho = 0;

  for (const pos of positions) {
    const g = pos.totalGreeks;
    totalDelta += g.delta;
    totalGamma += g.gamma;
    totalTheta += g.theta;
    totalVega += g.vega;
    totalRho += g.rho;
  }

  const rows: { label: string; value: number; desc: string; color: string; absMax: number }[] = [
    {
      label: "Delta",
      value: totalDelta,
      desc: "P&L change per $1 move",
      color: totalDelta >= 0 ? "#10b981" : "#ef4444",
      absMax: 1,
    },
    {
      label: "Gamma",
      value: totalGamma,
      desc: "Delta change per $1 move",
      color: "#60a5fa",
      absMax: 0.05,
    },
    {
      label: "Theta (daily)",
      value: totalTheta,
      desc: "Daily time decay",
      color: totalTheta >= 0 ? "#10b981" : "#f97316",
      absMax: 50,
    },
    {
      label: "Vega",
      value: totalVega,
      desc: "P&L per 1% IV change",
      color: "#a78bfa",
      absMax: 100,
    },
    {
      label: "Rho",
      value: totalRho,
      desc: "P&L per 1% rate change",
      color: "#94a3b8",
      absMax: 50,
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <SectionTitle
        title="Portfolio Greeks Summary"
        subtitle={`${positions.length} position${positions.length > 1 ? "s" : ""}`}
      />
      <div className="space-y-3">
        {rows.map((row) => {
          const pct = clamp(Math.abs(row.value) / row.absMax, 0, 1);
          const isNeg = row.value < 0;
          const barW = Math.round(pct * 100);
          return (
            <div key={row.label} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {row.label}
                </span>
                <span
                  className="font-mono text-xs font-semibold"
                  style={{ color: row.color }}
                >
                  {fmtSign(row.value)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {/* Negative side bar (left-anchored) */}
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted/30">
                  {isNeg ? (
                    <div
                      className="absolute right-0 h-full rounded-full"
                      style={{
                        width: `${barW}%`,
                        backgroundColor: row.color,
                        opacity: 0.75,
                      }}
                    />
                  ) : null}
                </div>
                {/* Center divider */}
                <div className="h-3 w-px shrink-0 bg-border" />
                {/* Positive side bar */}
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted/30">
                  {!isNeg ? (
                    <div
                      className="absolute left-0 h-full rounded-full"
                      style={{
                        width: `${barW}%`,
                        backgroundColor: row.color,
                        opacity: 0.75,
                      }}
                    />
                  ) : null}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">{row.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 2. Delta Hedging Calculator ───────────────────────────────────────────────

interface HedgeInputs {
  optionType: "call" | "put";
  strike: number;
  quantity: number;
  delta: number;
  spotPrice: number;
}

interface HedgeScenario {
  pctMove: number;
  newSpot: number;
  optionPnL: number;
  stockPnL: number;
  netPnL: number;
}

function DeltaHedgingCalculator({ spotPrice, analytics }: { spotPrice: number; analytics: ChainAnalytics }) {
  const [inputs, setInputs] = useState<HedgeInputs>({
    optionType: "call",
    strike: Math.round(spotPrice),
    quantity: 1,
    delta: 0.5,
    spotPrice,
  });
  const [showSim, setShowSim] = useState(false);

  const sharesNeeded = Math.round(Math.abs(inputs.delta) * inputs.quantity * CONTRACT_MULTIPLIER);
  const hedgeRatio = Math.abs(inputs.delta);
  const hedgeCost = sharesNeeded * spotPrice;

  // Compute BS option price for simulation
  const dte = analytics.expectedMove1SD > 0 ? 30 : 30; // default 30d
  const T = dte / 365;
  const sigma = Math.max(analytics.atmIV, 0.05);
  const optionPrice = blackScholes(spotPrice, inputs.strike, T, RISK_FREE_RATE, sigma, inputs.optionType);
  const costBasis = optionPrice * inputs.quantity * CONTRACT_MULTIPLIER;

  const scenarios: HedgeScenario[] = useMemo(() => {
    const moves = [-0.20, -0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15, 0.20];
    return moves.map((pct) => {
      const newSpot = spotPrice * (1 + pct);
      const newOptionPrice = blackScholes(newSpot, inputs.strike, Math.max(T - 1 / 252, 0.001), RISK_FREE_RATE, sigma, inputs.optionType);
      const sign = inputs.delta >= 0 ? 1 : -1;
      const optionPnL = sign * (newOptionPrice - optionPrice) * inputs.quantity * CONTRACT_MULTIPLIER;
      // Hedge: if option is long call (delta positive), we short shares
      const stockPnL = -sign * (newSpot - spotPrice) * sharesNeeded;
      return {
        pctMove: pct,
        newSpot,
        optionPnL: +optionPnL.toFixed(2),
        stockPnL: +stockPnL.toFixed(2),
        netPnL: +(optionPnL + stockPnL).toFixed(2),
      };
    });
  }, [inputs.strike, inputs.quantity, inputs.delta, inputs.optionType, spotPrice, T, sigma, optionPrice, sharesNeeded]);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <SectionTitle title="Delta Hedging Calculator" />

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
            Option Type
          </label>
          <div className="flex gap-1">
            {(["call", "put"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setInputs((p) => ({ ...p, optionType: t }))}
                className={cn(
                  "flex-1 rounded px-2 py-1 text-xs font-semibold transition-colors",
                  inputs.optionType === t
                    ? "bg-primary/20 text-primary"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
            Strike
          </label>
          <input
            type="number"
            value={inputs.strike}
            onChange={(e) => setInputs((p) => ({ ...p, strike: Number(e.target.value) }))}
            className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] text-foreground outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
            Contracts
          </label>
          <input
            type="number"
            min={1}
            value={inputs.quantity}
            onChange={(e) => setInputs((p) => ({ ...p, quantity: Math.max(1, Number(e.target.value)) }))}
            className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] text-foreground outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
            Delta
          </label>
          <input
            type="number"
            step={0.01}
            min={-1}
            max={1}
            value={inputs.delta}
            onChange={(e) => setInputs((p) => ({ ...p, delta: Number(e.target.value) }))}
            className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Summary chips */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          { label: "Shares to Hedge", value: sharesNeeded.toLocaleString() },
          { label: "Hedge Ratio", value: (hedgeRatio * 100).toFixed(1) + "%" },
          { label: "Hedge Cost", value: "$" + hedgeCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
        ].map((chip) => (
          <div key={chip.label} className="rounded-lg border border-border bg-muted/20 p-2 text-center">
            <div className="font-mono text-[11px] font-semibold text-foreground">{chip.value}</div>
            <div className="text-[11px] text-muted-foreground">{chip.label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowSim((v) => !v)}
        className="mb-2 w-full rounded bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
      >
        {showSim ? "Hide" : "Simulate Hedge"} — P&L Scenarios
      </button>

      {showSim && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="py-1 text-left font-semibold text-muted-foreground">Move</th>
                <th className="py-1 text-right font-semibold text-muted-foreground">Spot</th>
                <th className="py-1 text-right font-semibold text-muted-foreground">Option</th>
                <th className="py-1 text-right font-semibold text-muted-foreground">Hedge</th>
                <th className="py-1 text-right font-semibold text-muted-foreground">Net</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr
                  key={s.pctMove}
                  className={cn(
                    "border-b border-border",
                    s.pctMove === 0 && "bg-muted/20"
                  )}
                >
                  <td className={cn("py-1 font-mono", s.pctMove >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {s.pctMove >= 0 ? "+" : ""}{(s.pctMove * 100).toFixed(0)}%
                  </td>
                  <td className="py-1 text-right font-mono text-foreground">${s.newSpot.toFixed(2)}</td>
                  <td className={cn("py-1 text-right font-mono", s.optionPnL >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {s.optionPnL >= 0 ? "+" : ""}${Math.abs(s.optionPnL).toFixed(0)}
                  </td>
                  <td className={cn("py-1 text-right font-mono", s.stockPnL >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {s.stockPnL >= 0 ? "+" : ""}${Math.abs(s.stockPnL).toFixed(0)}
                  </td>
                  <td className={cn("py-1 text-right font-mono font-semibold", s.netPnL >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {s.netPnL >= 0 ? "+" : ""}${Math.abs(s.netPnL).toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Hedge assumes {sharesNeeded} shares short (for long call) using BS pricing at T=30d, IV={( analytics.atmIV * 100).toFixed(0)}%.
          </p>
        </div>
      )}
    </div>
  );
}

// ── 3. P&L Attribution ────────────────────────────────────────────────────────

function PnLAttribution({
  positions,
  spotPrice,
  analytics,
}: {
  positions: OptionsPosition[];
  spotPrice: number;
  analytics: ChainAnalytics;
}) {
  if (positions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <SectionTitle title="P&L Attribution" />
        <p className="text-[11px] text-muted-foreground">
          Open a position to see P&L attribution.
        </p>
      </div>
    );
  }

  // Compute portfolio-level Greeks and estimate P&L attribution
  let delta = 0, gamma = 0, theta = 0, vega = 0;
  for (const pos of positions) {
    delta += pos.totalGreeks.delta;
    gamma += pos.totalGreeks.gamma;
    theta += pos.totalGreeks.theta;
    vega += pos.totalGreeks.vega;
  }

  // Assume today's move: IV change from ivVsHvSpread for vega, 1-day for theta
  const dS = spotPrice * 0.01; // hypothetical 1% move
  const dIV = 0.01; // hypothetical 1pp IV change

  const deltaPnL = delta * dS * CONTRACT_MULTIPLIER;
  const gammaPnL = 0.5 * gamma * dS * dS * CONTRACT_MULTIPLIER;
  const thetaPnL = theta; // already per-day
  const vegaPnL = vega * dIV * CONTRACT_MULTIPLIER;

  const components = [
    { label: "Delta P&L", value: deltaPnL, color: "#10b981", desc: "1% spot move" },
    { label: "Gamma P&L", value: gammaPnL, color: "#60a5fa", desc: "2nd-order (1% move)" },
    { label: "Theta P&L", value: thetaPnL, color: "#f97316", desc: "1 day decay" },
    { label: "Vega P&L", value: vegaPnL, color: "#a78bfa", desc: "1pp IV change" },
  ];

  const maxAbs = Math.max(1, ...components.map((c) => Math.abs(c.value)));

  // SVG bar chart
  const svgW = 320;
  const svgH = 120;
  const padLeft = 80;
  const padRight = 10;
  const padTop = 10;
  const padBottom = 10;
  const barAreaW = svgW - padLeft - padRight;
  const rowH = (svgH - padTop - padBottom) / components.length;
  const barH = Math.max(6, rowH - 6);
  const centerX = padLeft + barAreaW / 2;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <SectionTitle
        title="P&L Attribution"
        subtitle="per 1% price move, 1pp IV change, 1 day"
      />
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
        {/* Center line */}
        <line
          x1={centerX}
          y1={padTop}
          x2={centerX}
          y2={svgH - padBottom}
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeWidth={0.5}
          className="text-muted-foreground"
        />
        {components.map((c, i) => {
          const y = padTop + i * rowH + rowH / 2;
          const barW = (Math.abs(c.value) / maxAbs) * (barAreaW / 2 - 2);
          const x = c.value >= 0 ? centerX : centerX - barW;
          return (
            <g key={c.label}>
              <text
                x={padLeft - 4}
                y={y + 3}
                textAnchor="end"
                fontSize={7.5}
                fill="currentColor"
                className="text-muted-foreground"
              >
                {c.label}
              </text>
              <rect
                x={x}
                y={y - barH / 2}
                width={Math.max(1, barW)}
                height={barH}
                fill={c.color}
                fillOpacity={0.8}
                rx={2}
              />
              <text
                x={c.value >= 0 ? x + barW + 3 : x - 3}
                y={y + 3}
                textAnchor={c.value >= 0 ? "start" : "end"}
                fontSize={7}
                fill={c.color}
              >
                {c.value >= 0 ? "+" : ""}${c.value.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-2">
        {components.map((c) => (
          <span key={c.label} className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: c.color }} />
            {c.desc}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── 4. Gamma Scalping Simulator ───────────────────────────────────────────────

function GammaScalpingSimulator({
  spotPrice,
  analytics,
}: {
  spotPrice: number;
  analytics: ChainAnalytics;
}) {
  const iv = analytics.atmIV;
  const hv = analytics.historicalVolatility;
  const dte = 30;
  const T = dte / 365;

  // ATM straddle price (BS)
  const callPrice = blackScholes(spotPrice, spotPrice, T, RISK_FREE_RATE, iv, "call");
  const putPrice = blackScholes(spotPrice, spotPrice, T, RISK_FREE_RATE, iv, "put");
  const straddlePrice = callPrice + putPrice;

  // Gamma of ATM straddle (call + put gamma ~ same, so × 2)
  // Γ = N'(d1) / (S * σ * √T)
  const d1 = (Math.log(1) + (RISK_FREE_RATE + (iv * iv) / 2) * T) / (iv * Math.sqrt(T));
  const gammaPerShare = normalPDF(d1) / (spotPrice * iv * Math.sqrt(T));
  const totalGamma = 2 * gammaPerShare; // call + put

  // Theta of straddle per day
  const callD1 = d1;
  const callD2 = callD1 - iv * Math.sqrt(T);
  const thetaCall =
    -(spotPrice * normalPDF(callD1) * iv) / (2 * Math.sqrt(T)) -
    RISK_FREE_RATE * spotPrice * Math.exp(-RISK_FREE_RATE * T) * normalCDF(callD2);
  const thetaPut =
    -(spotPrice * normalPDF(callD1) * iv) / (2 * Math.sqrt(T)) +
    RISK_FREE_RATE * spotPrice * Math.exp(-RISK_FREE_RATE * T) * normalCDF(-callD2);
  const dailyTheta = (thetaCall + thetaPut) / 365;

  // Breakeven daily move: |theta| = 0.5 * gamma * move²
  // move = sqrt(2 * |theta| / gamma)
  const breakevenMoveAbs = totalGamma > 0 ? Math.sqrt((2 * Math.abs(dailyTheta)) / totalGamma) : 0;
  const breakevenMovePct = (breakevenMoveAbs / spotPrice) * 100;

  // Realized vs implied vol comparison
  const rvMinus = hv * 100;
  const ivPct = iv * 100;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <SectionTitle title="Gamma Scalping Simulator" subtitle="ATM Straddle" />

      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: "Straddle Price", value: `$${fmt2(straddlePrice)}`, sub: "per share" },
          { label: "Straddle Cost", value: `$${(straddlePrice * CONTRACT_MULTIPLIER).toFixed(0)}`, sub: "per contract" },
          { label: "Gamma", value: totalGamma.toFixed(5), sub: "per $1 move" },
          { label: "Daily Theta", value: `$${(dailyTheta * CONTRACT_MULTIPLIER).toFixed(2)}`, sub: "time decay / day" },
          { label: "Breakeven Move", value: `$${breakevenMoveAbs.toFixed(2)}`, sub: `${breakevenMovePct.toFixed(2)}% daily` },
          {
            label: "Vol Edge",
            value: `${(rvMinus - ivPct).toFixed(1)}pp`,
            sub: hv > iv ? "RV > IV (favorable)" : "IV > RV (unfavorable)",
          },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-muted/20 p-2">
            <div className="font-mono text-[11px] font-semibold text-foreground">{c.value}</div>
            <div className="text-[11px] font-semibold text-foreground/70">{c.label}</div>
            <div className="text-[11px] text-muted-foreground">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-muted/10 p-3">
        <p className="text-xs font-semibold text-foreground mb-1">
          How Gamma Scalping Works
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Buy a delta-neutral straddle, then re-hedge delta frequently as the
          underlying moves. Each hedge locks in a small profit proportional to
          the move squared (Gamma P&L). You break even when realized volatility
          equals implied volatility. Profit when RV {">"} IV; lose to theta
          when RV {"<"} IV.
        </p>
        <div className="mt-2 flex gap-4">
          <div className="text-xs">
            <span className="text-muted-foreground">IV: </span>
            <span className="font-mono font-semibold text-orange-400">{ivPct.toFixed(1)}%</span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">HV (RV): </span>
            <span className={cn("font-mono font-semibold", hv > iv ? "text-emerald-400" : "text-red-400")}>
              {rvMinus.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Edge: </span>
            <span className={cn("font-mono font-semibold", hv > iv ? "text-emerald-400" : "text-red-400")}>
              {hv > iv ? "+" : ""}{(rvMinus - ivPct).toFixed(1)}pp
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 5. Vol Skew Explanation ───────────────────────────────────────────────────

function VolSkewExplanation({
  smile,
  spotPrice,
}: {
  smile: { strike: number; callIV: number; putIV: number }[];
  spotPrice: number;
}) {
  if (smile.length < 3) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <SectionTitle title="Vol Skew Explanation" />
        <p className="text-[11px] text-muted-foreground">No smile data available.</p>
      </div>
    );
  }

  // Find ATM index
  const atmIdx = smile.reduce(
    (best, s, i) =>
      Math.abs(s.strike - spotPrice) < Math.abs(smile[best].strike - spotPrice) ? i : best,
    0
  );

  const atmCallIV = smile[atmIdx].callIV;
  const atmPutIV = smile[atmIdx].putIV;

  // OTM put skew: average put IV for lower strikes vs ATM
  const lowerStrikes = smile.slice(0, atmIdx);
  const otmPutIV =
    lowerStrikes.length > 0
      ? lowerStrikes.reduce((s, d) => s + d.putIV, 0) / lowerStrikes.length
      : atmPutIV;

  const upperStrikes = smile.slice(atmIdx + 1);
  const otmCallIV =
    upperStrikes.length > 0
      ? upperStrikes.reduce((s, d) => s + d.callIV, 0) / upperStrikes.length
      : atmCallIV;

  const skew = otmPutIV - otmCallIV;
  const skewLabel =
    skew > 0.02
      ? "Bearish skew — puts more expensive than calls"
      : skew < -0.02
      ? "Bullish skew — calls more expensive than puts"
      : "Balanced skew — puts and calls roughly equal";
  const skewColor = skew > 0.02 ? "#ef4444" : skew < -0.02 ? "#10b981" : "#94a3b8";

  // Reuse the smile SVG from AnalysisPanel's VolSmileChart logic
  const strikes = smile.map((s) => s.strike);
  const allIV = smile.flatMap((s) => [s.callIV, s.putIV]);
  const minStrike = Math.min(...strikes);
  const maxStrike = Math.max(...strikes);
  const minIV = Math.max(0, Math.min(...allIV) * 0.85);
  const maxIV = Math.max(...allIV) * 1.15;

  const padTop = 15;
  const padBottom = 25;
  const padLeft = 40;
  const padRight = 15;
  const svgW = 320;
  const svgH = 110;
  const chartW = svgW - padLeft - padRight;
  const chartH = svgH - padTop - padBottom;

  const toX = (strike: number) =>
    padLeft + ((strike - minStrike) / Math.max(1, maxStrike - minStrike)) * chartW;
  const toY = (iv: number) =>
    padTop + chartH - ((iv - minIV) / Math.max(0.001, maxIV - minIV)) * chartH;

  const callPath = smile
    .map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.strike).toFixed(1)},${toY(d.callIV).toFixed(1)}`)
    .join(" ");

  const putPath = smile
    .map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.strike).toFixed(1)},${toY(d.putIV).toFixed(1)}`)
    .join(" ");

  const spotX = toX(spotPrice);
  const tickStrides = Math.max(1, Math.floor(smile.length / 4));
  const xTicks = smile.filter((_, i) => i % tickStrides === 0 || i === smile.length - 1);
  const yTicks = [minIV, minIV + (maxIV - minIV) * 0.5, maxIV];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <SectionTitle title="Vol Skew Explanation" />

      {/* Skew reading */}
      <div
        className="mb-3 rounded-lg border px-3 py-2"
        style={{ borderColor: skewColor + "40", backgroundColor: skewColor + "10" }}
      >
        <span className="text-[11px] font-semibold" style={{ color: skewColor }}>
          {skewLabel}
        </span>
        <div className="mt-1 flex gap-4 text-xs">
          <span>
            <span className="text-muted-foreground">OTM Put IV: </span>
            <span className="font-mono font-semibold text-orange-400">
              {(otmPutIV * 100).toFixed(1)}%
            </span>
          </span>
          <span>
            <span className="text-muted-foreground">ATM IV: </span>
            <span className="font-mono font-semibold text-foreground">
              {(atmCallIV * 100).toFixed(1)}%
            </span>
          </span>
          <span>
            <span className="text-muted-foreground">OTM Call IV: </span>
            <span className="font-mono font-semibold text-orange-400">
              {(otmCallIV * 100).toFixed(1)}%
            </span>
          </span>
        </div>
      </div>

      {/* Mini smile chart */}
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="mb-3 w-full">
        {yTicks.map((iv, i) => {
          const y = toY(iv);
          return (
            <g key={i}>
              <line
                x1={padLeft} y1={y} x2={svgW - padRight} y2={y}
                stroke="currentColor" strokeOpacity={0.1} strokeWidth={0.5}
                strokeDasharray="3 2" className="text-muted-foreground"
              />
              <text x={padLeft - 3} y={y + 3} textAnchor="end" fontSize={7}
                fill="currentColor" className="text-muted-foreground" opacity={0.6}>
                {(iv * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
        <line x1={spotX} y1={padTop} x2={spotX} y2={padTop + chartH}
          stroke="#6b7280" strokeOpacity={0.4} strokeWidth={1} strokeDasharray="3 2" />
        <path d={putPath} fill="none" stroke="#f97316" strokeWidth={1.5}
          strokeDasharray="4 2" strokeOpacity={0.85} />
        <path d={callPath} fill="none" stroke="#60a5fa" strokeWidth={1.5} strokeOpacity={0.9} />
        {xTicks.map((d) => (
          <text key={d.strike} x={toX(d.strike)} y={svgH - padBottom + 12}
            textAnchor="middle" fontSize={7} fill="currentColor"
            className="text-muted-foreground" opacity={0.6}>
            {d.strike}
          </text>
        ))}
        <rect x={padLeft} y={padTop - 10} width={6} height={6} fill="#60a5fa" fillOpacity={0.9} rx={1} />
        <text x={padLeft + 8} y={padTop - 4} fontSize={7} fill="#60a5fa" opacity={0.9}>Call IV</text>
        <rect x={padLeft + 44} y={padTop - 10} width={6} height={6} fill="#f97316" fillOpacity={0.9} rx={1} />
        <text x={padLeft + 52} y={padTop - 4} fontSize={7} fill="#f97316" opacity={0.9}>Put IV</text>
        <text x={spotX} y={padTop - 3} textAnchor="middle" fontSize={6.5}
          fill="#6b7280" opacity={0.7}>Spot</text>
      </svg>

      {/* Educational panels */}
      <div className="space-y-2">
        <div className="rounded-lg border border-border bg-muted/10 p-3">
          <p className="mb-1 text-xs font-semibold text-foreground">Why Skew Exists</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Equity markets have historically crashed down faster than they rally.
            Institutional investors buy OTM puts as portfolio insurance, driving
            up demand and thus implied volatility for downside strikes. This
            persistent put demand creates the characteristic downward slope —
            "volatility skew" or "smirk" — in equity options.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/10 p-3">
          <p className="mb-1 text-xs font-semibold text-foreground">How to Trade Skew</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground/80">Risk Reversals:</span>{" "}
              Sell expensive OTM put, buy cheaper OTM call — monetize the skew when you expect
              upside.
            </li>
            <li>
              <span className="font-semibold text-foreground/80">Put Spreads:</span>{" "}
              Buy ATM put, sell OTM put — you sell the expensive skew while keeping protection.
            </li>
            <li>
              <span className="font-semibold text-foreground/80">Call Spreads:</span>{" "}
              Spreads are cheaper than naked calls because you sell relatively expensive
              higher-strike calls.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Main GreeksLab Component ──────────────────────────────────────────────────

interface GreeksLabProps {
  positions: OptionsPosition[];
  spotPrice: number;
  analytics: ChainAnalytics;
  smile: { strike: number; callIV: number; putIV: number }[];
  chain: OptionChainExpiry[];
}

export function GreeksLab({
  positions,
  spotPrice,
  analytics,
  smile,
}: GreeksLabProps) {
  return (
    <div className="overflow-auto p-3 space-y-3">
      {/* 1. Portfolio Greeks Summary */}
      <PortfolioGreeksSummary positions={positions} />

      {/* 2. Delta Hedging Calculator */}
      <DeltaHedgingCalculator spotPrice={spotPrice} analytics={analytics} />

      {/* 3. P&L Attribution */}
      <PnLAttribution positions={positions} spotPrice={spotPrice} analytics={analytics} />

      {/* 4. Gamma Scalping Simulator */}
      <GammaScalpingSimulator spotPrice={spotPrice} analytics={analytics} />

      {/* 5. Vol Skew Explanation */}
      <VolSkewExplanation smile={smile} spotPrice={spotPrice} />
    </div>
  );
}
