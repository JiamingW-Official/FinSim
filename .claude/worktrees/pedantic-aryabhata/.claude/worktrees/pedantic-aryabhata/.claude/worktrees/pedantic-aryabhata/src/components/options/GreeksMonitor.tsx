"use client";

import { useMemo } from "react";
import type { OptionsPosition, OptionChainExpiry, ChainAnalytics } from "@/types/options";
import { CONTRACT_MULTIPLIER, RISK_FREE_RATE } from "@/types/options";
import { blackScholes, normalCDF } from "@/services/options/black-scholes";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt2(n: number): string {
  return n.toFixed(2);
}

function fmtSign(n: number, dec = 2): string {
  return (n >= 0 ? "+" : "") + n.toFixed(dec);
}

function fmtDollar(n: number): string {
  const abs = Math.abs(n);
  const sign = n >= 0 ? "+" : "-";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ── Section title ──────────────────────────────────────────────────────────────

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <span className="text-[11px] font-semibold text-foreground">
        {title}
      </span>
      {subtitle && (
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      )}
    </div>
  );
}

// ── 1. Portfolio Greeks Summary ────────────────────────────────────────────────

interface PortfolioSummaryProps {
  positions: OptionsPosition[];
  spotPrice: number;
}

function PortfolioSummary({ positions, spotPrice }: PortfolioSummaryProps) {
  const totals = useMemo(() => {
    let delta = 0, gamma = 0, theta = 0, vega = 0, rho = 0;
    for (const pos of positions) {
      const g = pos.totalGreeks;
      delta += g.delta;
      gamma += g.gamma;
      theta += g.theta;
      vega  += g.vega;
      rho   += g.rho;
    }
    return { delta, gamma, theta, vega, rho };
  }, [positions]);

  if (positions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <SectionTitle title="Portfolio Greeks Summary" />
        <p className="text-[11px] text-muted-foreground">
          No open options positions. Open a position from the Chains tab to see aggregate Greeks.
        </p>
      </div>
    );
  }

  // Dollar Greeks
  const dollarDelta = totals.delta * spotPrice;          // P&L per $1 move × contracts handled separately
  const dollarVega  = totals.vega;                       // already per 1% IV (vega convention)
  const dollarTheta = totals.theta;                      // already daily $

  // P&L attribution for +1% spot move
  const dS = spotPrice * 0.01;
  const deltaPnl = totals.delta * dS * CONTRACT_MULTIPLIER;
  const gammaPnl = 0.5 * totals.gamma * dS * dS * CONTRACT_MULTIPLIER;
  const totalPnl1pct = deltaPnl + gammaPnl;

  const rows: {
    label: string;
    value: number;
    desc: string;
    color: string;
    absMax: number;
    fmt?: (n: number) => string;
  }[] = [
    {
      label: "Net Delta",
      value: totals.delta,
      desc: "P&L per $1 spot move",
      color: totals.delta >= 0 ? "#10b981" : "#ef4444",
      absMax: 2,
    },
    {
      label: "Net Gamma",
      value: totals.gamma,
      desc: "Delta change per $1 move",
      color: "#60a5fa",
      absMax: 0.1,
      fmt: (n) => n.toFixed(4),
    },
    {
      label: "Net Theta (daily)",
      value: totals.theta,
      desc: "Daily time decay $",
      color: totals.theta >= 0 ? "#10b981" : "#f97316",
      absMax: 200,
    },
    {
      label: "Net Vega",
      value: totals.vega,
      desc: "P&L per 1% IV change",
      color: "#a78bfa",
      absMax: 500,
    },
    {
      label: "Net Rho",
      value: totals.rho,
      desc: "P&L per 1% rate change",
      color: "#94a3b8",
      absMax: 200,
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
          const displayVal = row.fmt ? row.fmt(row.value) : fmtSign(row.value);
          return (
            <div key={row.label} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{row.desc}</span>
                  <span
                    className="font-mono text-xs font-semibold"
                    style={{ color: row.color }}
                  >
                    {displayVal}
                  </span>
                </div>
              </div>
              {/* Bi-directional bar */}
              <div className="flex items-center gap-1">
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted/30">
                  {isNeg && (
                    <div
                      className="absolute right-0 h-full rounded-full"
                      style={{ width: `${barW}%`, backgroundColor: row.color, opacity: 0.8 }}
                    />
                  )}
                </div>
                <div className="h-3 w-px shrink-0 bg-border" />
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted/30">
                  {!isNeg && (
                    <div
                      className="absolute left-0 h-full rounded-full"
                      style={{ width: `${barW}%`, backgroundColor: row.color, opacity: 0.8 }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dollar Greeks & P&L attribution */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-md bg-muted/20 p-2 text-center">
          <div className="text-[11px] text-muted-foreground">Δ × $1 move</div>
          <div
            className="font-mono text-[11px] font-semibold"
            style={{ color: totals.delta >= 0 ? "#10b981" : "#ef4444" }}
          >
            {fmtDollar(totals.delta * 1)}
          </div>
        </div>
        <div className="rounded-md bg-muted/20 p-2 text-center">
          <div className="text-[11px] text-muted-foreground">Vega × 1% IV</div>
          <div
            className="font-mono text-[11px] font-semibold"
            style={{ color: dollarVega >= 0 ? "#a78bfa" : "#ef4444" }}
          >
            {fmtDollar(dollarVega)}
          </div>
        </div>
        <div className="rounded-md bg-muted/20 p-2 text-center">
          <div className="text-[11px] text-muted-foreground">Theta / day</div>
          <div
            className="font-mono text-[11px] font-semibold"
            style={{ color: dollarTheta >= 0 ? "#10b981" : "#f97316" }}
          >
            {fmtDollar(dollarTheta)}
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-md border border-border bg-muted/10 p-2">
        <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
          P&L Attribution — Spot +1% ({fmtSign(dS, 2)})
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span>
            <span className="text-muted-foreground">Delta P&L: </span>
            <span
              className="font-mono font-semibold"
              style={{ color: deltaPnl >= 0 ? "#10b981" : "#ef4444" }}
            >
              {fmtDollar(deltaPnl)}
            </span>
          </span>
          <span className="text-muted-foreground">+</span>
          <span>
            <span className="text-muted-foreground">Gamma P&L: </span>
            <span
              className="font-mono font-semibold"
              style={{ color: gammaPnl >= 0 ? "#10b981" : "#ef4444" }}
            >
              {fmtDollar(gammaPnl)}
            </span>
          </span>
          <span className="text-muted-foreground">=</span>
          <span>
            <span className="text-muted-foreground">Total: </span>
            <span
              className="font-mono font-semibold"
              style={{ color: totalPnl1pct >= 0 ? "#10b981" : "#ef4444" }}
            >
              {fmtDollar(totalPnl1pct)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 2. Greeks vs Strike Chart (pure SVG) ──────────────────────────────────────

interface GreeksVsStrikeProps {
  spotPrice: number;
  iv: number; // ATM IV
  dte: number; // days to expiry
}

function GreeksVsStrikeChart({ spotPrice, iv, dte }: GreeksVsStrikeProps) {
  const WIDTH = 520;
  const HEIGHT = 140;
  const PAD = { top: 12, right: 40, bottom: 28, left: 44 };
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const T = Math.max(dte / 365, 0.002);
  const sigma = Math.max(iv, 0.05);

  // Strike range: spot ± 20 pts
  const step = Math.max(1, Math.round(spotPrice * 0.02));
  const strikes: number[] = [];
  for (let k = spotPrice - 20 * (step / step); k <= spotPrice + 20 * (step / step); k += 1) {
    strikes.push(Math.round((spotPrice - 20) + k * 0));
  }

  // Generate 41 strike points: spot-20% to spot+20% in 1% increments
  const strikePoints: number[] = [];
  for (let i = -20; i <= 20; i++) {
    strikePoints.push(spotPrice + i * (spotPrice * 0.01));
  }

  // Black-Scholes Greeks for ATM call across strikes
  const greekData = strikePoints.map((K) => {
    if (T <= 0 || sigma <= 0 || K <= 0) return { delta: 0.5, gamma: 0 };
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(spotPrice / K) + (RISK_FREE_RATE + sigma * sigma / 2) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;
    const delta = normalCDF(d1);
    const gamma = Math.exp(-d1 * d1 / 2) / (Math.sqrt(2 * Math.PI) * K * sigma * sqrtT);
    return { delta, gamma };
  });

  const maxGamma = Math.max(...greekData.map((g) => g.gamma), 0.0001);

  // Scale functions
  const xScale = (i: number) => PAD.left + (i / (strikePoints.length - 1)) * plotW;
  const yScaleDelta = (v: number) => PAD.top + (1 - clamp(v, 0, 1)) * plotH;
  const yScaleGamma = (v: number) => PAD.top + (1 - clamp(v / maxGamma, 0, 1)) * plotH;

  // Build SVG path strings
  const deltaPath = greekData
    .map((g, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScaleDelta(g.delta).toFixed(1)}`)
    .join(" ");
  const gammaPath = greekData
    .map((g, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScaleGamma(g.gamma).toFixed(1)}`)
    .join(" ");

  // Spot price x position (middle = index 20)
  const spotX = xScale(20);

  // Max gamma strike index (should be ~ATM = index 20)
  const maxGammaIdx = greekData.reduce(
    (best, g, i) => (g.gamma > greekData[best].gamma ? i : best),
    0,
  );
  const maxGammaX = xScale(maxGammaIdx);
  const maxGammaY = yScaleGamma(greekData[maxGammaIdx].gamma);

  // Y-axis ticks
  const deltaYTicks = [0, 0.25, 0.5, 0.75, 1.0];
  const gammaYTicks = [0, 0.25, 0.5, 0.75, 1.0];

  // X-axis labels (every 10 strikes)
  const xLabels = [0, 10, 20, 30, 40].map((i) => ({
    x: xScale(i),
    label: strikePoints[i].toFixed(0),
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <SectionTitle
        title="Greeks vs Strike"
        subtitle={`${dte}d to expiry · ATM IV ${(iv * 100).toFixed(0)}%`}
      />
      <div className="mb-2 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-orange-400" />
          <span className="text-muted-foreground">Delta (left axis)</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-orange-500" />
          <span className="text-muted-foreground">Gamma (right axis)</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
          <span className="text-muted-foreground">Max Gamma (ATM)</span>
        </span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        style={{ maxHeight: 160 }}
      >
        {/* Grid lines */}
        {deltaYTicks.map((t) => (
          <line
            key={`gy-${t}`}
            x1={PAD.left}
            x2={PAD.left + plotW}
            y1={yScaleDelta(t)}
            y2={yScaleDelta(t)}
            stroke="#334155"
            strokeWidth={0.5}
            strokeDasharray="3,3"
          />
        ))}

        {/* Delta left Y-axis labels */}
        {deltaYTicks.map((t) => (
          <text
            key={`dl-${t}`}
            x={PAD.left - 4}
            y={yScaleDelta(t) + 3}
            textAnchor="end"
            fontSize={8}
            fill="#64748b"
          >
            {t.toFixed(2)}
          </text>
        ))}

        {/* Gamma right Y-axis labels */}
        {gammaYTicks.map((t) => (
          <text
            key={`gr-${t}`}
            x={PAD.left + plotW + 4}
            y={yScaleGamma(t * maxGamma) + 3}
            textAnchor="start"
            fontSize={8}
            fill="#64748b"
          >
            {(t * maxGamma).toFixed(4)}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((lbl) => (
          <text
            key={`xl-${lbl.label}`}
            x={lbl.x}
            y={HEIGHT - 6}
            textAnchor="middle"
            fontSize={8}
            fill="#64748b"
          >
            {lbl.label}
          </text>
        ))}

        {/* Spot price vertical line */}
        <line
          x1={spotX}
          x2={spotX}
          y1={PAD.top}
          y2={PAD.top + plotH}
          stroke="#f97316"
          strokeWidth={1}
          strokeDasharray="4,3"
        />
        <text x={spotX + 3} y={PAD.top + 10} fontSize={8} fill="#f97316">
          Spot
        </text>

        {/* Delta curve */}
        <path d={deltaPath} fill="none" stroke="#60a5fa" strokeWidth={1.5} />

        {/* Gamma curve */}
        <path d={gammaPath} fill="none" stroke="#a78bfa" strokeWidth={1.5} />

        {/* Max Gamma highlight */}
        <circle cx={maxGammaX} cy={maxGammaY} r={4} fill="#f97316" opacity={0.9} />
        <text x={maxGammaX + 5} y={maxGammaY - 4} fontSize={8} fill="#f97316">
          Max Γ
        </text>

        {/* Left Y-axis label */}
        <text
          x={8}
          y={PAD.top + plotH / 2}
          textAnchor="middle"
          fontSize={8}
          fill="#60a5fa"
          transform={`rotate(-90, 8, ${PAD.top + plotH / 2})`}
        >
          Delta
        </text>

        {/* Right Y-axis label */}
        <text
          x={WIDTH - 6}
          y={PAD.top + plotH / 2}
          textAnchor="middle"
          fontSize={8}
          fill="#a78bfa"
          transform={`rotate(90, ${WIDTH - 6}, ${PAD.top + plotH / 2})`}
        >
          Gamma
        </text>
      </svg>
    </div>
  );
}

// ── 3. Theta Decay Calendar (pure SVG) ────────────────────────────────────────

interface ThetaCalendarProps {
  positions: OptionsPosition[];
  spotPrice: number;
}

function ThetaDecayCalendar({ positions, spotPrice }: ThetaCalendarProps) {
  const WIDTH = 520;
  const HEIGHT = 130;
  const PAD = { top: 12, right: 20, bottom: 28, left: 50 };
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  // Get portfolio-level IV and DTE from positions
  const portfolioData = useMemo(() => {
    if (positions.length === 0) return { iv: 0.25, dte: 30, totalDelta: 0 };
    let totalIv = 0, count = 0, minDte = 365;
    for (const pos of positions) {
      for (const leg of pos.legs) {
        totalIv += leg.greeks.vega > 0 ? 0.25 : 0.20; // approximate
        count++;
        const daysLeft = Math.max(
          0,
          Math.ceil((new Date(leg.expiry).getTime() - Date.now()) / 86400000),
        );
        if (daysLeft < minDte) minDte = daysLeft;
      }
    }
    return { iv: count > 0 ? totalIv / count : 0.25, dte: Math.max(minDte, 1), totalDelta: 0 };
  }, [positions]);

  // Compute theta curve: daily theta for a representative ATM option from DTE=30 to 0
  const maxDte = 30;
  const decayPoints: { dte: number; theta: number }[] = [];

  // Net position theta multiplier (use actual total theta scaled proportionally)
  let netTheta = 0;
  for (const pos of positions) {
    netTheta += pos.totalGreeks.theta;
  }

  // Compute relative theta shape using B-S formula for ATM straddle
  const sigma = Math.max(portfolioData.iv, 0.10);
  const sqrtYear = Math.sqrt(1 / 365);

  for (let d = maxDte; d >= 0; d--) {
    const T = Math.max(d / 365, 0.001);
    const sqrtT = Math.sqrt(T);
    // ATM call theta (normalized): -S * σ * N'(d1) / (2√T) / 365
    const pdfD1 = Math.exp(-0) / Math.sqrt(2 * Math.PI); // ATM: d1 ≈ σ√T/2
    const rawTheta = -(spotPrice * sigma * pdfD1) / (2 * sqrtT * 365);
    // Scale to match portfolio net theta at current DTE
    const currentDte = portfolioData.dte;
    const currentT = Math.max(currentDte / 365, 0.001);
    const currentSqrtT = Math.sqrt(currentT);
    const refTheta = -(spotPrice * sigma * pdfD1) / (2 * currentSqrtT * 365);
    const scale = refTheta !== 0 ? netTheta / refTheta : 1;
    decayPoints.push({ dte: d, theta: rawTheta * scale });
  }

  if (positions.length === 0 || decayPoints.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <SectionTitle title="Theta Decay Calendar" />
        <p className="text-[11px] text-muted-foreground">
          No open positions. Theta decay curve will appear once you have options positions.
        </p>
      </div>
    );
  }

  const minTheta = Math.min(...decayPoints.map((p) => p.theta));
  const maxTheta = Math.max(...decayPoints.map((p) => p.theta), 0);
  const thetaRange = maxTheta - minTheta || 1;

  const xScale = (dte: number) => PAD.left + ((maxDte - dte) / maxDte) * plotW;
  const yScale = (theta: number) => PAD.top + (1 - (theta - minTheta) / thetaRange) * plotH;

  const thetaPath = decayPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.dte).toFixed(1)},${yScale(p.theta).toFixed(1)}`)
    .join(" ");

  // Weekend markers (every 5 trading days ≈ 7 calendar days)
  const weekendMarkers: number[] = [];
  for (let d = maxDte; d >= 5; d -= 5) {
    weekendMarkers.push(d);
  }

  // X-axis labels
  const xLabels = [30, 20, 10, 5, 0];

  // Y-axis ticks
  const yTicks = [minTheta, (minTheta + maxTheta) / 2, maxTheta];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <SectionTitle
        title="Theta Decay Calendar"
        subtitle="Portfolio daily theta $ vs days to expiry"
      />
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        style={{ maxHeight: 150 }}
      >
        {/* Weekend gap markers */}
        {weekendMarkers.map((d) => (
          <rect
            key={`wk-${d}`}
            x={xScale(d) - 4}
            y={PAD.top}
            width={8}
            height={plotH}
            fill="#fbbf24"
            opacity={0.06}
          />
        ))}

        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <line
            key={`yt-${i}`}
            x1={PAD.left}
            x2={PAD.left + plotW}
            y1={yScale(t)}
            y2={yScale(t)}
            stroke="#334155"
            strokeWidth={0.5}
            strokeDasharray="3,3"
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((t, i) => (
          <text
            key={`yl-${i}`}
            x={PAD.left - 4}
            y={yScale(t) + 3}
            textAnchor="end"
            fontSize={8}
            fill="#64748b"
          >
            {fmtDollar(t)}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((d) => (
          <text
            key={`xl-${d}`}
            x={xScale(d)}
            y={HEIGHT - 6}
            textAnchor="middle"
            fontSize={8}
            fill="#64748b"
          >
            {d}d
          </text>
        ))}

        {/* Theta curve */}
        <path d={thetaPath} fill="none" stroke="#f97316" strokeWidth={1.5} />

        {/* Zero line if theta crosses zero */}
        {minTheta < 0 && maxTheta > 0 && (
          <line
            x1={PAD.left}
            x2={PAD.left + plotW}
            y1={yScale(0)}
            y2={yScale(0)}
            stroke="#64748b"
            strokeWidth={0.75}
          />
        )}

        {/* Current DTE marker */}
        {portfolioData.dte <= maxDte && (
          <>
            <line
              x1={xScale(portfolioData.dte)}
              x2={xScale(portfolioData.dte)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="#10b981"
              strokeWidth={1}
              strokeDasharray="3,2"
            />
            <text
              x={xScale(portfolioData.dte) + 3}
              y={PAD.top + 10}
              fontSize={8}
              fill="#10b981"
            >
              Now
            </text>
          </>
        )}

        {/* Weekend label */}
        {weekendMarkers.length > 0 && (
          <text
            x={xScale(weekendMarkers[0]) + 2}
            y={PAD.top + plotH - 4}
            fontSize={7}
            fill="#fbbf24"
            opacity={0.7}
          >
            Fri gap
          </text>
        )}

        {/* Axis labels */}
        <text
          x={PAD.left + plotW / 2}
          y={HEIGHT - 1}
          textAnchor="middle"
          fontSize={8}
          fill="#64748b"
        >
          Days to Expiry →
        </text>
      </svg>
    </div>
  );
}

// ── 4. IV Sensitivity Table ────────────────────────────────────────────────────

interface IVSensTableProps {
  positions: OptionsPosition[];
}

function IVSensTable({ positions }: IVSensTableProps) {
  const totalVega = useMemo(
    () => positions.reduce((s, p) => s + p.totalGreeks.vega, 0),
    [positions],
  );
  const totalVomma = useMemo(
    () => positions.reduce((s, p) => s + p.totalGreeks.vomma, 0),
    [positions],
  );

  if (positions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <SectionTitle title="IV Sensitivity Table" />
        <p className="text-[11px] text-muted-foreground">No open positions.</p>
      </div>
    );
  }

  const ivShocks = [-15, -10, -5, 5, 10, 15];

  // Approx P&L: Vega × ΔIV + 0.5 × Vomma × ΔIV²  (ΔIV in pp = percent points)
  const rows = ivShocks.map((pp) => {
    const pnl = totalVega * pp + 0.5 * totalVomma * pp * pp;
    return { pp, pnl };
  });

  // Vega neutral point: when d(P&L)/dIV = 0 → Vega + Vomma × ΔIV = 0 → ΔIV = -Vega/Vomma
  const vegaNeutralShift = totalVomma !== 0 ? -totalVega / totalVomma : null;

  const absMax = Math.max(...rows.map((r) => Math.abs(r.pnl)), 1);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <SectionTitle
        title="IV Sensitivity Table"
        subtitle={`Net Vega: ${fmtSign(totalVega, 1)}`}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="py-1 text-left font-semibold text-muted-foreground">IV Change</th>
              <th className="py-1 text-right font-semibold text-muted-foreground">P&L Impact</th>
              <th className="py-1 text-right font-semibold text-muted-foreground">Bar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ pp, pnl }) => {
              const barW = Math.round((Math.abs(pnl) / absMax) * 100);
              const color = pnl >= 0 ? "#10b981" : "#ef4444";
              return (
                <tr key={pp} className="border-b border-border">
                  <td className="py-1 font-mono">
                    <span
                      className="rounded px-1 text-[11px] font-semibold"
                      style={{
                        backgroundColor: pp < 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                        color: pp < 0 ? "#ef4444" : "#10b981",
                      }}
                    >
                      {pp > 0 ? "+" : ""}
                      {pp}pp
                    </span>
                  </td>
                  <td
                    className="py-1 text-right font-mono font-semibold"
                    style={{ color }}
                  >
                    {fmtDollar(pnl)}
                  </td>
                  <td className="py-1 pl-2">
                    <div className="relative h-2 w-24 overflow-hidden rounded-full bg-muted/30">
                      <div
                        className="absolute h-full rounded-full"
                        style={{
                          left: pnl >= 0 ? "0" : "auto",
                          right: pnl < 0 ? "0" : "auto",
                          width: `${barW}%`,
                          backgroundColor: color,
                          opacity: 0.75,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {vegaNeutralShift !== null && Math.abs(vegaNeutralShift) < 30 && (
        <div className="mt-2 rounded-md bg-muted/10 px-2 py-1.5 text-xs">
          <span className="text-muted-foreground">Vega neutral point: </span>
          <span className="font-mono font-semibold text-amber-400">
            IV {vegaNeutralShift >= 0 ? "+" : ""}
            {vegaNeutralShift.toFixed(1)}pp
          </span>
          <span className="ml-1 text-muted-foreground">
            (P&L flat at this IV change)
          </span>
        </div>
      )}
    </div>
  );
}

// ── 5. Delta Hedging Status ────────────────────────────────────────────────────

interface DeltaHedgingProps {
  positions: OptionsPosition[];
  spotPrice: number;
}

function DeltaHedgingStatus({ positions, spotPrice }: DeltaHedgingProps) {
  const netDelta = useMemo(
    () => positions.reduce((s, p) => s + p.totalGreeks.delta, 0),
    [positions],
  );

  if (positions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <SectionTitle title="Delta Hedging Status" />
        <p className="text-[11px] text-muted-foreground">No open positions.</p>
      </div>
    );
  }

  // Shares needed: -netDelta × 100 (per contract multiplier, aggregate)
  // Each position's delta already accounts for quantity * side
  const sharesNeeded = -Math.round(netDelta * CONTRACT_MULTIPLIER);
  const hedgeCost = Math.abs(sharesNeeded) * spotPrice;
  const isLongBias = netDelta > 0;
  const isDeltaNeutral = Math.abs(netDelta) < 0.05;

  // P&L tracking: what would happen to hedge if spot moves ±1%
  const dS = spotPrice * 0.01;
  const hedgePnl1pct = sharesNeeded * dS; // hedge P&L for +1% move
  const optionsPnl1pct = netDelta * dS * CONTRACT_MULTIPLIER;
  const netPnl1pct = optionsPnl1pct + hedgePnl1pct;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <SectionTitle title="Delta Hedging Status" />

      <div className="grid grid-cols-2 gap-3">
        {/* Net Delta gauge */}
        <div className="rounded-md bg-muted/20 p-3">
          <div className="mb-1 text-[11px] text-muted-foreground">Net Portfolio Delta</div>
          <div
            className="font-mono text-2xl font-semibold leading-none"
            style={{ color: isDeltaNeutral ? "#10b981" : isLongBias ? "#60a5fa" : "#f87171" }}
          >
            {fmtSign(netDelta, 2)}
          </div>
          <div
            className="mt-1 text-[11px] font-semibold"
            style={{ color: isDeltaNeutral ? "#10b981" : "#64748b" }}
          >
            {isDeltaNeutral ? "Delta Neutral" : isLongBias ? "Long Bias" : "Short Bias"}
          </div>
        </div>

        {/* Hedge details */}
        <div className="space-y-2">
          <div className="rounded-md bg-muted/20 p-2">
            <div className="text-[11px] text-muted-foreground">Shares to Hedge</div>
            <div
              className="font-mono text-[13px] font-semibold"
              style={{ color: sharesNeeded >= 0 ? "#10b981" : "#f87171" }}
            >
              {sharesNeeded >= 0 ? "Buy " : "Sell "}
              {Math.abs(sharesNeeded).toLocaleString()} shares
            </div>
          </div>
          <div className="rounded-md bg-muted/20 p-2">
            <div className="text-[11px] text-muted-foreground">Hedge Cost (notional)</div>
            <div className="font-mono text-[11px] font-semibold text-foreground">
              ${hedgeCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* P&L tracking */}
      <div className="mt-3 rounded-md border border-border bg-muted/10 p-2">
        <div className="mb-1.5 text-[11px] font-semibold text-muted-foreground">
          Hedged Portfolio P&L — Spot +1%
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-muted-foreground">Options</div>
            <div
              className="font-mono font-semibold"
              style={{ color: optionsPnl1pct >= 0 ? "#10b981" : "#ef4444" }}
            >
              {fmtDollar(optionsPnl1pct)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Hedge</div>
            <div
              className="font-mono font-semibold"
              style={{ color: hedgePnl1pct >= 0 ? "#10b981" : "#ef4444" }}
            >
              {fmtDollar(hedgePnl1pct)}
            </div>
          </div>
          <div>
            <div className="font-semibold text-foreground">Net P&L</div>
            <div
              className="font-mono font-semibold"
              style={{ color: netPnl1pct >= 0 ? "#10b981" : "#ef4444" }}
            >
              {fmtDollar(netPnl1pct)}
            </div>
          </div>
        </div>
      </div>

      {/* Visual delta bar */}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Short Δ −2</span>
          <span>Neutral</span>
          <span>Long Δ +2</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-muted/30">
          {/* Center line */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
          {/* Delta indicator */}
          <div
            className="absolute top-0 h-full w-3 -translate-x-1/2 rounded-full"
            style={{
              left: `${clamp(50 + (netDelta / 2) * 50, 2, 98)}%`,
              backgroundColor: isDeltaNeutral ? "#10b981" : isLongBias ? "#60a5fa" : "#f87171",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main GreeksMonitor ─────────────────────────────────────────────────────────

interface GreeksMonitorProps {
  positions: OptionsPosition[];
  spotPrice: number;
  analytics: ChainAnalytics | null;
  chain: OptionChainExpiry[];
}

export function GreeksMonitor({
  positions,
  spotPrice,
  analytics,
  chain,
}: GreeksMonitorProps) {
  // Pick ATM IV and front-month DTE from analytics / chain
  const atmIV = analytics?.atmIV ?? 0.25;
  const frontExpiry = chain[0];
  const dte = frontExpiry?.daysToExpiry ?? 30;

  return (
    <div className="space-y-4 p-4">
      {/* 1. Portfolio Greeks Summary */}
      <PortfolioSummary positions={positions} spotPrice={spotPrice} />

      {/* 2. Greeks vs Strike Chart */}
      <GreeksVsStrikeChart spotPrice={spotPrice} iv={atmIV} dte={dte} />

      {/* 3. Theta Decay Calendar */}
      <ThetaDecayCalendar positions={positions} spotPrice={spotPrice} />

      {/* 4 & 5 side-by-side on wider screens, stacked on narrow */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <IVSensTable positions={positions} />
        <DeltaHedgingStatus positions={positions} spotPrice={spotPrice} />
      </div>
    </div>
  );
}
