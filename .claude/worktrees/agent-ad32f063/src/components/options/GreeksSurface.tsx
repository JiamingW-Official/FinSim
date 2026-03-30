"use client";

import { useMemo } from "react";
import { normalCDF, normalPDF } from "@/services/options/black-scholes";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const RISK_FREE_RATE = 0.05;

// ── Black-Scholes Greeks ──────────────────────────────────────────────────────

function computeD1D2(S: number, K: number, T: number, sigma: number): { d1: number; d2: number } {
  const d1 = (Math.log(S / K) + (RISK_FREE_RATE + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return { d1, d2 };
}

function bsDelta(S: number, K: number, T: number, sigma: number, type: "call" | "put"): number {
  if (T <= 0) return type === "call" ? (S > K ? 1 : 0) : (S < K ? -1 : 0);
  const { d1 } = computeD1D2(S, K, T, sigma);
  return type === "call" ? normalCDF(d1) : normalCDF(d1) - 1;
}

function bsGamma(S: number, K: number, T: number, sigma: number): number {
  if (T <= 0 || S <= 0 || sigma <= 0) return 0;
  const { d1 } = computeD1D2(S, K, T, sigma);
  return normalPDF(d1) / (S * sigma * Math.sqrt(T));
}

function bsTheta(S: number, K: number, T: number, sigma: number, type: "call" | "put"): number {
  if (T <= 0 || S <= 0 || sigma <= 0) return 0;
  const { d1, d2 } = computeD1D2(S, K, T, sigma);
  const r = RISK_FREE_RATE;
  const term1 = -(S * normalPDF(d1) * sigma) / (2 * Math.sqrt(T));
  if (type === "call") {
    return (term1 - r * K * Math.exp(-r * T) * normalCDF(d2)) / 365;
  } else {
    return (term1 + r * K * Math.exp(-r * T) * normalCDF(-d2)) / 365;
  }
}

function bsVega(S: number, K: number, T: number, sigma: number): number {
  if (T <= 0 || S <= 0 || sigma <= 0) return 0;
  const { d1 } = computeD1D2(S, K, T, sigma);
  return (S * normalPDF(d1) * Math.sqrt(T)) / 100; // per 1% change in IV
}

// ── Colour helpers ────────────────────────────────────────────────────────────

/** Maps value in [-1, 1] to a CSS rgba colour. */
function deltaColour(delta: number, type: "call" | "put"): string {
  // Calls: 0 (white/neutral) → 1 (strong blue)
  // Puts : 0 (white/neutral) → -1 (strong red)
  if (type === "call") {
    const intensity = Math.min(1, Math.max(0, delta));
    const r = Math.round(255 * (1 - intensity * 0.85));
    const g = Math.round(255 * (1 - intensity * 0.75));
    const b = 255;
    return `rgba(${r},${g},${b},${0.15 + intensity * 0.75})`;
  } else {
    const intensity = Math.min(1, Math.max(0, -delta));
    const r = 255;
    const g = Math.round(255 * (1 - intensity * 0.85));
    const b = Math.round(255 * (1 - intensity * 0.85));
    return `rgba(${r},${g},${b},${0.15 + intensity * 0.75})`;
  }
}

/** Maps a normalised value [0,1] to orange heat colour. */
function heatColour(norm: number): string {
  // low → slate-800, high → orange-400
  const r = Math.round(15 + norm * 234);
  const g = Math.round(23 + norm * 140);
  const b = Math.round(42 + norm * (62 - 42) * (1 - norm));
  return `rgba(${r},${g},${b},${0.2 + norm * 0.75})`;
}

/** Maps put IV premium (skew) 0→transparent, +→purple. */
function skewColour(skew: number): string {
  const norm = Math.min(1, Math.max(0, skew / 0.15)); // max 15pp skew
  const r = Math.round(120 + norm * 55);
  const g = Math.round(40 + norm * 20);
  const b = Math.round(200 + norm * 55);
  return `rgba(${r},${g},${b},${0.15 + norm * 0.7})`;
}

// ── Shared card sub-components ────────────────────────────────────────────────

function CardTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </span>
      {subtitle && (
        <span className="rounded bg-muted/30 px-1.5 py-0.5 text-[9px] text-muted-foreground">
          {subtitle}
        </span>
      )}
    </div>
  );
}

// ── 1. Delta Surface (heat table) ─────────────────────────────────────────────

const DELTA_DTES = [7, 14, 30, 60, 90];

interface DeltaSurfaceProps {
  spotPrice: number;
  baseIV: number;
  type: "call" | "put";
}

function DeltaSurface({ spotPrice, baseIV, type }: DeltaSurfaceProps) {
  const sigma = Math.max(0.05, baseIV);

  // 5 strikes centred on ATM (±2 increments of ~2.5%)
  const strikeStep = Math.round(spotPrice * 0.025 / 1) * 1 || 1;
  const strikes = [-2, -1, 0, 1, 2].map((o) => Math.round((spotPrice + o * strikeStep) / 1) * 1);

  const cells = useMemo(() => {
    return strikes.map((K) =>
      DELTA_DTES.map((dte) => {
        const T = Math.max(0.001, dte / 365);
        const d = bsDelta(spotPrice, K, T, sigma, type);
        return d;
      }),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotPrice, sigma, type]);

  const moneyLabels = ["OTM-2", "OTM-1", "ATM", "ITM+1", "ITM+2"];

  return (
    <div className="flex flex-col rounded-lg border border-border/50 bg-card hover:border-border/60 transition-colors">
      <CardTitle
        title={`Delta Surface — ${type === "call" ? "Calls" : "Puts"}`}
        subtitle={`IV ${(sigma * 100).toFixed(0)}%`}
      />
      <div className="overflow-auto px-2 py-2">
        <table className="w-full text-[9px] border-separate border-spacing-0.5">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground font-medium px-1 py-0.5 w-16">
                Strike
              </th>
              {DELTA_DTES.map((dte) => (
                <th
                  key={dte}
                  className="text-center text-muted-foreground font-medium px-1 py-0.5"
                >
                  {dte}D
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {strikes.map((K, si) => {
              const moneyLabel = moneyLabels[si];
              const isATM = si === 2;
              return (
                <tr key={K}>
                  <td
                    className={cn(
                      "px-1 py-1 rounded text-left",
                      isATM ? "font-bold text-orange-400" : "text-muted-foreground",
                    )}
                  >
                    ${K}&nbsp;
                    <span className="opacity-60 font-normal">({moneyLabel})</span>
                  </td>
                  {DELTA_DTES.map((dte, di) => {
                    const delta = cells[si][di];
                    const bg = deltaColour(delta, type);
                    return (
                      <td
                        key={dte}
                        className="text-center px-1 py-1 rounded font-mono tabular-nums font-semibold"
                        style={{ backgroundColor: bg, color: "#e2e8f0" }}
                      >
                        {delta >= 0 ? "+" : ""}
                        {delta.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-[8px] text-muted-foreground/60 mt-1.5 px-1">
          {type === "call"
            ? "Call delta: 0 (deep OTM) → +1 (deep ITM). Blue intensity = higher delta."
            : "Put delta: 0 (deep OTM) → −1 (deep ITM). Red intensity = more negative delta."}
        </p>
      </div>
    </div>
  );
}

// ── 2. Gamma Profile (SVG line chart) ────────────────────────────────────────

interface GammaProfileProps {
  spotPrice: number;
  baseIV: number;
  dte: number;
}

function GammaProfile({ spotPrice, baseIV, dte }: GammaProfileProps) {
  const sigma = Math.max(0.05, baseIV);
  const T = Math.max(0.001, dte / 365);

  // 40 strikes spanning ±20% from spot
  const N = 40;
  const points = useMemo(() => {
    return Array.from({ length: N }, (_, i) => {
      const frac = 0.8 + (i / (N - 1)) * 0.4; // 80%–120% of spot
      const K = spotPrice * frac;
      const gamma = bsGamma(spotPrice, K, T, sigma);
      return { K, gamma, frac };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotPrice, sigma, T]);

  const maxGamma = Math.max(...points.map((p) => p.gamma), 0.0001);

  const padTop = 18;
  const padBottom = 28;
  const padLeft = 44;
  const padRight = 14;
  const svgW = 300;
  const svgH = 130;
  const chartW = svgW - padLeft - padRight;
  const chartH = svgH - padTop - padBottom;

  const toX = (i: number) => padLeft + (i / (N - 1)) * chartW;
  const toY = (g: number) => padTop + chartH - (g / maxGamma) * chartH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(p.gamma).toFixed(1)}`)
    .join(" ");

  // Area fill path
  const areaPath =
    `M${toX(0).toFixed(1)},${(padTop + chartH).toFixed(1)} ` +
    points.map((p, i) => `L${toX(i).toFixed(1)},${toY(p.gamma).toFixed(1)}`).join(" ") +
    ` L${toX(N - 1).toFixed(1)},${(padTop + chartH).toFixed(1)} Z`;

  // ATM vertical line at centre (spot = 100% => i ~ N/2)
  const atmI = Math.round((N - 1) / 2); // spot itself is at the midpoint
  const atmX = toX(atmI);

  // Y ticks
  const yTicks = [0, 0.5, 1].map((f) => ({ val: f * maxGamma, y: toY(f * maxGamma) }));

  // X ticks: show 3 prices
  const xTicks = [0, Math.round((N - 1) / 2), N - 1];

  return (
    <div className="flex flex-col rounded-lg border border-border/50 bg-card hover:border-border/60 transition-colors">
      <CardTitle
        title="Gamma Profile"
        subtitle={`${dte}D to expiry · ATM peak`}
      />
      <div className="flex-1">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" aria-hidden="true">
          <defs>
            <linearGradient id="gammaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {yTicks.map(({ val, y }, i) => (
            <g key={i}>
              <line
                x1={padLeft} y1={y}
                x2={svgW - padRight} y2={y}
                stroke="currentColor" strokeOpacity={0.1}
                strokeWidth={0.5} strokeDasharray="3 2"
                className="text-muted-foreground"
              />
              <text
                x={padLeft - 3} y={y + 3}
                textAnchor="end" fontSize={6.5}
                fill="currentColor" className="text-muted-foreground" opacity={0.55}
              >
                {val.toFixed(4)}
              </text>
            </g>
          ))}

          {/* ATM vertical */}
          <line
            x1={atmX} y1={padTop}
            x2={atmX} y2={padTop + chartH}
            stroke="#f97316" strokeOpacity={0.35}
            strokeWidth={1} strokeDasharray="3 2"
          />
          <text
            x={atmX + 3} y={padTop + 8}
            fontSize={6.5} fill="#f97316" opacity={0.8}
          >
            ATM
          </text>

          {/* Area fill */}
          <path d={areaPath} fill="url(#gammaGrad)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#a855f7"
            strokeWidth={1.5}
            strokeOpacity={0.9}
          />

          {/* X axis labels */}
          {xTicks.map((i) => {
            const p = points[i];
            return (
              <text
                key={i}
                x={toX(i)}
                y={svgH - padBottom + 12}
                textAnchor="middle"
                fontSize={7}
                fill="currentColor"
                className="text-muted-foreground"
                opacity={0.6}
              >
                ${Math.round(p.K)}
              </text>
            );
          })}

          {/* Y axis label */}
          <text
            x={padLeft - 3} y={padTop - 4}
            textAnchor="end" fontSize={6.5}
            fill="currentColor" className="text-muted-foreground" opacity={0.5}
          >
            Gamma
          </text>
        </svg>
      </div>
    </div>
  );
}

// ── 3. Theta Decay Chart ──────────────────────────────────────────────────────

interface ThetaDecayProps {
  spotPrice: number;
  baseIV: number;
}

function ThetaDecay({ spotPrice, baseIV }: ThetaDecayProps) {
  const sigma = Math.max(0.05, baseIV);
  const maxDTE = 60;

  // Time value of ATM call at each DTE
  const points = useMemo(() => {
    return Array.from({ length: maxDTE + 1 }, (_, i) => {
      const dte = maxDTE - i; // 60 → 0
      const T = Math.max(0.0001, dte / 365);
      // ATM call BS price = intrinsic (0 for ATM) + time value ≈ S*sigma*sqrt(T)*N'(0)
      // But use exact BS: K = S for ATM
      const K = spotPrice;
      // Full BS: intrinsic is 0 at ATM; time value dominates
      const d1 = (RISK_FREE_RATE + 0.5 * sigma * sigma) * T / (sigma * Math.sqrt(T));
      const d2 = d1 - sigma * Math.sqrt(T);
      const callPrice =
        dte === 0
          ? 0
          : spotPrice * normalCDF(d1) - K * Math.exp(-RISK_FREE_RATE * T) * normalCDF(d2);
      const theta = bsTheta(spotPrice, K, T, sigma, "call");
      return { dte, callPrice: Math.max(0, callPrice), theta };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotPrice, sigma]);

  const maxPrice = Math.max(...points.map((p) => p.callPrice), 0.01);
  const cliffDTE = 30; // annotation line

  const padTop = 18;
  const padBottom = 28;
  const padLeft = 44;
  const padRight = 14;
  const svgW = 300;
  const svgH = 130;
  const chartW = svgW - padLeft - padRight;
  const chartH = svgH - padTop - padBottom;

  // x goes from DTE=60 (left) to DTE=0 (right)
  const toX = (dte: number) => padLeft + ((maxDTE - dte) / maxDTE) * chartW;
  const toY = (v: number) => padTop + chartH - (v / maxPrice) * chartH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.dte).toFixed(1)},${toY(p.callPrice).toFixed(1)}`)
    .join(" ");

  const areaPath =
    `M${toX(maxDTE).toFixed(1)},${(padTop + chartH).toFixed(1)} ` +
    points.map((p) => `L${toX(p.dte).toFixed(1)},${toY(p.callPrice).toFixed(1)}`).join(" ") +
    ` L${toX(0).toFixed(1)},${(padTop + chartH).toFixed(1)} Z`;

  const cliffX = toX(cliffDTE);
  const yTicks = [0, 0.5, 1].map((f) => ({ val: f * maxPrice, y: toY(f * maxPrice) }));

  return (
    <div className="flex flex-col rounded-lg border border-border/50 bg-card hover:border-border/60 transition-colors">
      <CardTitle
        title="Theta Decay"
        subtitle="ATM call · 60D → 0D"
      />
      <div className="flex-1">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" aria-hidden="true">
          <defs>
            <linearGradient id="thetaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {yTicks.map(({ val, y }, i) => (
            <g key={i}>
              <line
                x1={padLeft} y1={y}
                x2={svgW - padRight} y2={y}
                stroke="currentColor" strokeOpacity={0.1}
                strokeWidth={0.5} strokeDasharray="3 2"
                className="text-muted-foreground"
              />
              <text
                x={padLeft - 3} y={y + 3}
                textAnchor="end" fontSize={6.5}
                fill="currentColor" className="text-muted-foreground" opacity={0.55}
              >
                ${val.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Theta cliff annotation */}
          <line
            x1={cliffX} y1={padTop}
            x2={cliffX} y2={padTop + chartH}
            stroke="#f97316" strokeOpacity={0.4}
            strokeWidth={1} strokeDasharray="3 2"
          />
          <text x={cliffX + 3} y={padTop + 8} fontSize={6.5} fill="#f97316" opacity={0.85}>
            Theta cliff
          </text>
          <text x={cliffX + 3} y={padTop + 16} fontSize={6} fill="#f97316" opacity={0.6}>
            (30 DTE)
          </text>

          {/* Area */}
          <path d={areaPath} fill="url(#thetaGrad)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeOpacity={0.85}
          />

          {/* X axis labels */}
          {[60, 45, 30, 15, 0].map((dte) => (
            <text
              key={dte}
              x={toX(dte)}
              y={svgH - padBottom + 12}
              textAnchor="middle"
              fontSize={7}
              fill="currentColor"
              className="text-muted-foreground"
              opacity={0.6}
            >
              {dte}D
            </text>
          ))}

          {/* Y axis label */}
          <text
            x={padLeft - 3} y={padTop - 4}
            textAnchor="end" fontSize={6.5}
            fill="currentColor" className="text-muted-foreground" opacity={0.5}
          >
            Price
          </text>
        </svg>
        <p className="text-[8px] text-muted-foreground/60 px-3 pb-1.5">
          Time value erodes slowly at first, then accelerates sharply inside 30 DTE.
        </p>
      </div>
    </div>
  );
}

// ── 4. Vega Surface (heat table) ─────────────────────────────────────────────

const VEGA_DTES = [7, 14, 30, 60, 90];

interface VegaSurfaceProps {
  spotPrice: number;
  baseIV: number;
}

function VegaSurface({ spotPrice, baseIV }: VegaSurfaceProps) {
  const sigma = Math.max(0.05, baseIV);

  const strikeStep = Math.round(spotPrice * 0.025 / 1) * 1 || 1;
  const strikes = [-2, -1, 0, 1, 2].map((o) => Math.round((spotPrice + o * strikeStep) / 1) * 1);
  const moneyLabels = ["OTM-2", "OTM-1", "ATM", "ITM+1", "ITM+2"];

  const cells = useMemo(() => {
    return strikes.map((K) =>
      VEGA_DTES.map((dte) => {
        const T = Math.max(0.001, dte / 365);
        return bsVega(spotPrice, K, T, sigma);
      }),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotPrice, sigma]);

  // Normalise for colour
  const allVegas = cells.flat();
  const maxVega = Math.max(...allVegas, 0.001);

  return (
    <div className="flex flex-col rounded-lg border border-border/50 bg-card hover:border-border/60 transition-colors">
      <CardTitle
        title="Vega Surface"
        subtitle="Per 1% IV change"
      />
      <div className="overflow-auto px-2 py-2">
        <table className="w-full text-[9px] border-separate border-spacing-0.5">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground font-medium px-1 py-0.5 w-16">
                Strike
              </th>
              {VEGA_DTES.map((dte) => (
                <th
                  key={dte}
                  className="text-center text-muted-foreground font-medium px-1 py-0.5"
                >
                  {dte}D
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {strikes.map((K, si) => {
              const isATM = si === 2;
              return (
                <tr key={K}>
                  <td
                    className={cn(
                      "px-1 py-1 rounded text-left",
                      isATM ? "font-bold text-orange-400" : "text-muted-foreground",
                    )}
                  >
                    ${K}&nbsp;
                    <span className="opacity-60 font-normal">({moneyLabels[si]})</span>
                  </td>
                  {VEGA_DTES.map((dte, di) => {
                    const vega = cells[si][di];
                    const norm = vega / maxVega;
                    const bg = heatColour(norm);
                    return (
                      <td
                        key={dte}
                        className="text-center px-1 py-1 rounded font-mono tabular-nums font-semibold"
                        style={{ backgroundColor: bg, color: "#e2e8f0" }}
                      >
                        {vega.toFixed(3)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-[8px] text-muted-foreground/60 mt-1.5 px-1">
          Orange = higher vega (more sensitive to IV). ATM and longer-dated options have highest vega.
        </p>
      </div>
    </div>
  );
}

// ── 5. IV Skew Visualisation ─────────────────────────────────────────────────

interface IVSkewProps {
  spotPrice: number;
  baseIV: number;
  smile: { strike: number; callIV: number; putIV: number }[];
}

function IVSkew({ spotPrice, baseIV, smile }: IVSkewProps) {
  const sigma = Math.max(0.05, baseIV);

  // Build synthetic skew if smile is empty (put IV = call IV + put-skew premium)
  const skewData = useMemo(() => {
    if (smile.length >= 4) {
      return smile.map((s) => ({
        strike: s.strike,
        callIV: s.callIV,
        putIV: s.putIV,
        skew: s.putIV - s.callIV,
      }));
    }

    // Synthetic: 9 strikes ±20%, put IV premium grows for OTM puts
    const step = Math.round(spotPrice * 0.025 / 1) * 1 || 1;
    return Array.from({ length: 9 }, (_, i) => {
      const offset = (i - 4) * step;
      const K = Math.round(spotPrice + offset);
      const moneyness = (K - spotPrice) / spotPrice; // negative = put OTM
      const callIV = sigma + moneyness * 0.04; // slight call skew
      // Puts have higher IV for OTM strikes (volatility skew / smirk)
      const putSkewPremium = moneyness < 0 ? -moneyness * 0.12 : moneyness * 0.02;
      const putIV = sigma + putSkewPremium;
      return { strike: K, callIV: Math.max(0.01, callIV), putIV: Math.max(0.01, putIV), skew: putIV - callIV };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smile, spotPrice, sigma]);

  const strikes = skewData.map((d) => d.strike);
  const allIV = skewData.flatMap((d) => [d.callIV, d.putIV]);
  const minStrike = Math.min(...strikes);
  const maxStrike = Math.max(...strikes);
  const minIV = Math.max(0, Math.min(...allIV) * 0.85);
  const maxIV = Math.max(...allIV) * 1.15;

  const padTop = 18;
  const padBottom = 28;
  const padLeft = 44;
  const padRight = 14;
  const svgW = 300;
  const svgH = 130;
  const chartW = svgW - padLeft - padRight;
  const chartH = svgH - padTop - padBottom;

  const toX = (s: number) =>
    padLeft + ((s - minStrike) / Math.max(1, maxStrike - minStrike)) * chartW;
  const toY = (iv: number) =>
    padTop + chartH - ((iv - minIV) / Math.max(0.001, maxIV - minIV)) * chartH;

  const callPath = skewData
    .map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.strike).toFixed(1)},${toY(d.callIV).toFixed(1)}`)
    .join(" ");

  const putPath = skewData
    .map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.strike).toFixed(1)},${toY(d.putIV).toFixed(1)}`)
    .join(" ");

  // Skew bars (put IV - call IV) at each strike
  const maxSkew = Math.max(...skewData.map((d) => Math.abs(d.skew)), 0.001);

  const yTicks = [minIV, minIV + (maxIV - minIV) * 0.5, maxIV];

  const atmX = toX(spotPrice);

  // X tick positions
  const xTickIndices = [0, Math.floor(skewData.length / 2), skewData.length - 1];

  return (
    <div className="flex flex-col rounded-lg border border-border/50 bg-card hover:border-border/60 transition-colors">
      <CardTitle
        title="IV Skew (Put Premium)"
        subtitle={`Spot $${Math.round(spotPrice)}`}
      />
      <div className="flex-1">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" aria-hidden="true">
          {/* Gridlines */}
          {yTicks.map((iv, i) => (
            <g key={i}>
              <line
                x1={padLeft} y1={toY(iv)}
                x2={svgW - padRight} y2={toY(iv)}
                stroke="currentColor" strokeOpacity={0.1}
                strokeWidth={0.5} strokeDasharray="3 2"
                className="text-muted-foreground"
              />
              <text
                x={padLeft - 3} y={toY(iv) + 3}
                textAnchor="end" fontSize={6.5}
                fill="currentColor" className="text-muted-foreground" opacity={0.55}
              >
                {(iv * 100).toFixed(0)}%
              </text>
            </g>
          ))}

          {/* Skew shading between call and put lines */}
          {skewData.slice(0, -1).map((d, i) => {
            const d2 = skewData[i + 1];
            const x1 = toX(d.strike);
            const x2 = toX(d2.strike);
            const callY1 = toY(d.callIV);
            const callY2 = toY(d2.callIV);
            const putY1 = toY(d.putIV);
            const putY2 = toY(d2.putIV);
            const avgSkew = ((d.skew + d2.skew) / 2);
            const fillColor = avgSkew > 0 ? `rgba(168,85,247,0.2)` : `rgba(96,165,250,0.2)`;
            return (
              <polygon
                key={i}
                points={`${x1},${callY1} ${x2},${callY2} ${x2},${putY2} ${x1},${putY1}`}
                fill={fillColor}
              />
            );
          })}

          {/* Spot vertical */}
          {atmX >= padLeft && atmX <= svgW - padRight && (
            <>
              <line
                x1={atmX} y1={padTop}
                x2={atmX} y2={padTop + chartH}
                stroke="#6b7280" strokeOpacity={0.35}
                strokeWidth={1} strokeDasharray="3 2"
              />
              <text x={atmX + 2} y={padTop + 8} fontSize={6} fill="#6b7280" opacity={0.7}>
                Spot
              </text>
            </>
          )}

          {/* Call IV — solid blue */}
          <path
            d={callPath}
            fill="none"
            stroke="#60a5fa"
            strokeWidth={1.5}
            strokeOpacity={0.9}
          />

          {/* Put IV — dashed orange */}
          <path
            d={putPath}
            fill="none"
            stroke="#f97316"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            strokeOpacity={0.85}
          />

          {/* X axis labels */}
          {xTickIndices.map((idx) => {
            const d = skewData[idx];
            return (
              <text
                key={idx}
                x={toX(d.strike)}
                y={svgH - padBottom + 12}
                textAnchor="middle"
                fontSize={7}
                fill="currentColor"
                className="text-muted-foreground"
                opacity={0.6}
              >
                ${d.strike}
              </text>
            );
          })}

          {/* Legend */}
          <rect x={padLeft} y={padTop - 10} width={6} height={6} fill="#60a5fa" fillOpacity={0.9} rx={1} />
          <text x={padLeft + 8} y={padTop - 4} fontSize={7} fill="#60a5fa" opacity={0.9}>
            Call IV
          </text>
          <rect x={padLeft + 46} y={padTop - 10} width={6} height={6} fill="#f97316" fillOpacity={0.9} rx={1} />
          <text x={padLeft + 54} y={padTop - 4} fontSize={7} fill="#f97316" opacity={0.9}>
            Put IV
          </text>
          <rect x={padLeft + 96} y={padTop - 10} width={6} height={6} fill="rgba(168,85,247,0.5)" rx={1} />
          <text x={padLeft + 104} y={padTop - 4} fontSize={7} fill="#c084fc" opacity={0.9}>
            Skew
          </text>
        </svg>
        <p className="text-[8px] text-muted-foreground/60 px-3 pb-1.5">
          Puts typically carry higher IV than calls (fear premium). Purple band = skew magnitude.
        </p>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export interface GreeksSurfaceProps {
  spotPrice: number;
  baseIV: number;
  dte?: number;
  smile?: { strike: number; callIV: number; putIV: number }[];
}

export function GreeksSurface({
  spotPrice,
  baseIV,
  dte = 30,
  smile = [],
}: GreeksSurfaceProps) {
  const safeSpot = spotPrice > 0 ? spotPrice : 100;
  const safeIV = baseIV > 0 ? baseIV : 0.3;

  return (
    <div className="overflow-auto p-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Delta surface — calls */}
        <DeltaSurface spotPrice={safeSpot} baseIV={safeIV} type="call" />

        {/* 2. Delta surface — puts */}
        <DeltaSurface spotPrice={safeSpot} baseIV={safeIV} type="put" />

        {/* 3. Gamma profile */}
        <GammaProfile spotPrice={safeSpot} baseIV={safeIV} dte={dte} />

        {/* 4. Theta decay */}
        <ThetaDecay spotPrice={safeSpot} baseIV={safeIV} />

        {/* 5. Vega surface — full width */}
        <div className="sm:col-span-2">
          <VegaSurface spotPrice={safeSpot} baseIV={safeIV} />
        </div>

        {/* 6. IV Skew — full width */}
        <div className="sm:col-span-2">
          <IVSkew spotPrice={safeSpot} baseIV={safeIV} smile={smile} />
        </div>
      </div>
    </div>
  );
}
