"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Shield,
  AlertTriangle,
  ArrowUpDown,
  Layers,
  Target,
  RefreshCw,
  Info,
  ChevronRight,
  Sigma,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 742008;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 742008;
}

// ── Math helpers ──────────────────────────────────────────────────────────────
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * ax);
  const erf =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) *
      Math.exp(-ax * ax);
  return 0.5 * (1 + sign * erf);
}

function bsCall(S: number, K: number, T: number, r: number, sigma: number): number {
  if (T <= 0) return Math.max(S - K, 0);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
}

function bsPut(S: number, K: number, T: number, r: number, sigma: number): number {
  if (T <= 0) return Math.max(K - S, 0);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
}

function bsVega(S: number, K: number, T: number, r: number, sigma: number): number {
  if (T <= 0) return 0;
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  return S * Math.sqrt(T) * Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
}

function bsGamma(S: number, K: number, T: number, r: number, sigma: number): number {
  if (T <= 0) return 0;
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  return Math.exp(-0.5 * d1 * d1) / (S * sigma * Math.sqrt(T) * Math.sqrt(2 * Math.PI));
}

function bsTheta(S: number, K: number, T: number, r: number, sigma: number): number {
  if (T <= 0) return 0;
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return (
    -(S * Math.exp(-0.5 * d1 * d1) * sigma) / (2 * Math.sqrt(T) * Math.sqrt(2 * Math.PI)) -
    r * K * Math.exp(-r * T) * normalCDF(d2)
  );
}

// ── Interfaces ────────────────────────────────────────────────────────────────
interface VolSpreadRow {
  ticker: string;
  iv: number;
  rv20: number;
  spread: number;
  premium: number;
  opportunity: "Rich" | "Fair" | "Cheap";
  sector: string;
}

interface SpreadPoint {
  day: number;
  iv: number;
  rv: number;
  spread: number;
}

interface StockPath {
  day: number;
  price: number;
  delta: number;
  hedgePnl: number;
  thetaDrag: number;
  gammaPnl: number;
  cumPnl: number;
}

interface DispersionRow {
  ticker: string;
  iv: number;
  weight: number;
  contribution: number;
}

interface CalendarRow {
  ticker: string;
  frontIV: number;
  backIV: number;
  term: number;
  action: "Buy Back / Sell Front" | "Buy Front / Sell Back" | "Fair";
}

interface RiskReversalRow {
  ticker: string;
  call25d: number;
  put25d: number;
  rr: number;
  skew: "Call Skew" | "Put Skew" | "Neutral";
}

interface StatEdgePoint {
  year: number;
  iv: number;
  rv: number;
  vrp: number;
  cumShortVol: number;
}

// ── Data generation ───────────────────────────────────────────────────────────
function generateVolSpreadData(): { rows: VolSpreadRow[]; points: SpreadPoint[] } {
  resetSeed();
  const tickers = ["SPY", "QQQ", "AAPL", "TSLA", "NVDA", "AMZN", "GLD", "IWM"];
  const sectors = ["ETF", "ETF", "Tech", "EV", "Semis", "Cloud", "Commodity", "Small Cap"];
  const baseIVs = [0.18, 0.22, 0.28, 0.62, 0.52, 0.32, 0.16, 0.24];
  const rows: VolSpreadRow[] = tickers.map((ticker, i) => {
    const iv = baseIVs[i] * (0.85 + rand() * 0.3);
    const rv20 = iv * (0.65 + rand() * 0.55);
    const spread = iv - rv20;
    const premium = (spread / rv20) * 100;
    const opportunity: "Rich" | "Fair" | "Cheap" =
      spread > 0.04 ? "Rich" : spread < -0.02 ? "Cheap" : "Fair";
    return { ticker, iv, rv20, spread, premium, opportunity, sector: sectors[i] };
  });

  const points: SpreadPoint[] = Array.from({ length: 60 }, (_, day) => {
    const base = 0.18 + 0.04 * Math.sin((day / 60) * 2 * Math.PI);
    const iv = base + rand() * 0.03 - 0.015;
    const rv = iv * (0.7 + rand() * 0.4);
    return { day, iv, rv, spread: iv - rv };
  });
  return { rows, points };
}

function generateStockPath(): StockPath[] {
  resetSeed();
  // skip some rand calls to get different sequence
  for (let i = 0; i < 20; i++) rand();
  const S0 = 200;
  const K = 200;
  const T0 = 30 / 365;
  const r = 0.05;
  const ivSell = 0.30; // sold at this IV
  const rvActual = 0.22;
  const dt = 1 / 365;
  const paths: StockPath[] = [];
  let S = S0;
  let cumHedgePnl = 0;
  let cumTheta = 0;
  let cumGamma = 0;
  // Initial straddle premium (sold)
  const initialPremium = bsCall(S0, K, T0, r, ivSell) + bsPut(S0, K, T0, r, ivSell);
  for (let day = 0; day <= 30; day++) {
    const t = day / 365;
    const timeLeft = Math.max(T0 - t, 0.0001);
    // Black-Scholes delta of straddle = callDelta + putDelta
    const d1 = (Math.log(S / K) + (r + 0.5 * ivSell * ivSell) * timeLeft) / (ivSell * Math.sqrt(timeLeft));
    const callDelta = normalCDF(d1);
    const putDelta = -(1 - callDelta);
    const straddleDelta = callDelta + putDelta; // near 0 ATM
    if (day < 30) {
      // simulate price move
      const z = (rand() - 0.5) * 2;
      const dailyMove = rvActual * Math.sqrt(dt) * z * Math.sqrt(252);
      const dS = S * dailyMove;
      S += dS;
      // gamma P&L = 0.5 * gamma * dS^2
      const gamma = bsGamma(S, K, timeLeft, r, ivSell);
      const gPnl = 0.5 * gamma * dS * dS;
      // theta drag = theta * dt (negative)
      const theta = bsTheta(S, K, timeLeft, r, ivSell);
      const tDrag = theta * dt;
      cumHedgePnl += gPnl;
      cumTheta += tDrag;
      cumGamma += gPnl;
    }
    // total P&L: premium collected + theta drag + gamma scalp
    const totalPnl = initialPremium + cumTheta + cumHedgePnl;
    paths.push({
      day,
      price: S,
      delta: straddleDelta,
      hedgePnl: cumHedgePnl,
      thetaDrag: cumTheta,
      gammaPnl: cumGamma,
      cumPnl: totalPnl,
    });
  }
  return paths;
}

function generateDispersionData(): {
  rows: DispersionRow[];
  indexIV: number;
  basketIV: number;
  impliedCorr: number;
} {
  resetSeed();
  for (let i = 0; i < 40; i++) rand();
  const tickers = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "NFLX"];
  const weights = [0.20, 0.18, 0.15, 0.12, 0.12, 0.10, 0.08, 0.05];
  const baseIVs = [0.28, 0.26, 0.52, 0.32, 0.27, 0.35, 0.62, 0.42];
  const rows: DispersionRow[] = tickers.map((ticker, i) => {
    const iv = baseIVs[i] * (0.9 + rand() * 0.2);
    const contribution = weights[i] * iv;
    return { ticker, iv, weight: weights[i], contribution };
  });
  const basketIV = rows.reduce((acc, r) => acc + r.contribution, 0);
  const indexIV = 0.20 + rand() * 0.04;
  const impliedCorr = Math.pow(indexIV / basketIV, 2);
  return { rows, indexIV, basketIV, impliedCorr };
}

function generateCalendarData(): CalendarRow[] {
  resetSeed();
  for (let i = 0; i < 60; i++) rand();
  const tickers = ["SPY", "QQQ", "AAPL", "TSLA", "NVDA", "GLD"];
  const baseFront = [0.18, 0.22, 0.28, 0.60, 0.50, 0.16];
  return tickers.map((ticker, i) => {
    const frontIV = baseFront[i] * (0.85 + rand() * 0.3);
    const backIV = frontIV * (0.85 + rand() * 0.35);
    const term = backIV - frontIV;
    const action: CalendarRow["action"] =
      term > 0.02
        ? "Buy Back / Sell Front"
        : term < -0.02
        ? "Buy Front / Sell Back"
        : "Fair";
    return { ticker, frontIV, backIV, term, action };
  });
}

function generateRiskReversalData(): RiskReversalRow[] {
  resetSeed();
  for (let i = 0; i < 80; i++) rand();
  const tickers = ["SPY", "QQQ", "AAPL", "TSLA", "NVDA", "GLD", "AMZN", "IWM"];
  return tickers.map((ticker) => {
    const atm = 0.15 + rand() * 0.35;
    const skewAdj = (rand() - 0.5) * 0.08;
    const call25d = atm + skewAdj;
    const put25d = atm - skewAdj + rand() * 0.03;
    const rr = call25d - put25d;
    const skew: RiskReversalRow["skew"] =
      rr > 0.015 ? "Call Skew" : rr < -0.015 ? "Put Skew" : "Neutral";
    return { ticker, call25d, put25d, rr, skew };
  });
}

function generateStatEdgeData(): StatEdgePoint[] {
  resetSeed();
  for (let i = 0; i < 100; i++) rand();
  let cumShortVol = 0;
  return Array.from({ length: 20 }, (_, i) => {
    const year = 2005 + i;
    const baseIV = 0.18 + rand() * 0.12;
    const rv = baseIV * (0.65 + rand() * 0.5);
    const vrp = baseIV - rv;
    cumShortVol += vrp * 100; // pnl proxy
    return { year, iv: baseIV, rv, vrp, cumShortVol };
  });
}

// ── SVG helpers ───────────────────────────────────────────────────────────────
function toSvgX(val: number, min: number, max: number, width: number): number {
  return ((val - min) / (max - min)) * width;
}
function toSvgY(val: number, min: number, max: number, height: number): number {
  return height - ((val - min) / (max - min)) * height;
}

// ── Color helpers ─────────────────────────────────────────────────────────────
function volColor(iv: number): string {
  if (iv > 0.4) return "#ef4444";
  if (iv > 0.25) return "#f59e0b";
  return "#22c55e";
}
function spreadColor(spread: number): string {
  if (spread > 0.04) return "#ef4444";
  if (spread < -0.02) return "#22c55e";
  return "#94a3b8";
}

// ══════════════════════════════════════════════════════════════════════════════
export default function VolatilityArbPage() {
  const [activeTab, setActiveTab] = useState("vol-spread");

  const { rows: volRows, points: spreadPoints } = useMemo(generateVolSpreadData, []);
  const stockPath = useMemo(generateStockPath, []);
  const { rows: dispRows, indexIV, basketIV, impliedCorr } = useMemo(generateDispersionData, []);
  const calendarRows = useMemo(generateCalendarData, []);
  const rrRows = useMemo(generateRiskReversalData, []);
  const statPoints = useMemo(generateStatEdgeData, []);

  // ── Derived stats ────────────────────────────────────────────────────────
  const avgSpread = volRows.reduce((a, r) => a + r.spread, 0) / volRows.length;
  const richCount = volRows.filter((r) => r.opportunity === "Rich").length;
  const cheapCount = volRows.filter((r) => r.opportunity === "Cheap").length;
  const avgVRP = statPoints.reduce((a, p) => a + p.vrp, 0) / statPoints.length;
  const positiveVRPYears = statPoints.filter((p) => p.vrp > 0).length;

  const lastPath = stockPath[stockPath.length - 1];
  const dispersionSpread = basketIV - indexIV;

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sigma className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Volatility Arbitrage</h1>
            <p className="text-muted-foreground text-sm">
              Realized vs implied vol trading · Delta-neutral strategies · Dispersion & surface arb
            </p>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="gap-1">
            <Activity className="w-3 h-3 text-primary" />
            Avg IV-RV Spread: <span className="text-primary ml-1">{(avgSpread * 100).toFixed(1)} vols</span>
          </Badge>
          <Badge variant="outline" className="gap-1">
            <TrendingDown className="w-3 h-3 text-red-400" />
            Rich IV Tickers: <span className="text-red-400 ml-1">{richCount}</span>
          </Badge>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            Cheap IV Tickers: <span className="text-green-400 ml-1">{cheapCount}</span>
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Layers className="w-3 h-3 text-amber-400" />
            Dispersion Spread: <span className="text-amber-400 ml-1">{(dispersionSpread * 100).toFixed(1)} vols</span>
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Shield className="w-3 h-3 text-primary" />
            VRP Win Rate: <span className="text-primary ml-1">{positiveVRPYears}/20 years</span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="vol-spread" className="gap-1 text-xs">
            <BarChart3 className="w-3 h-3" /> Vol Spread Dashboard
          </TabsTrigger>
          <TabsTrigger value="delta-neutral" className="gap-1 text-xs">
            <ArrowUpDown className="w-3 h-3" /> Delta-Neutral P&L
          </TabsTrigger>
          <TabsTrigger value="dispersion" className="gap-1 text-xs">
            <Layers className="w-3 h-3" /> Dispersion Trading
          </TabsTrigger>
          <TabsTrigger value="vol-surface" className="gap-1 text-xs">
            <Activity className="w-3 h-3" /> Vol Surface Arb
          </TabsTrigger>
          <TabsTrigger value="stat-edge" className="gap-1 text-xs">
            <Sigma className="w-3 h-3" /> Statistical Edge
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Vol Spread Dashboard ───────────────────────────────────── */}
        <TabsContent value="vol-spread" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key="vol-spread"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Spread Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    SPY 60-Day IV vs Realized Vol (20-day HV) Spread
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 800 200" className="w-full h-48">
                    {/* grid */}
                    {[0, 0.05, 0.10, 0.15, 0.20, 0.25].map((v) => (
                      <line
                        key={v}
                        x1={40} y1={toSvgY(v, 0, 0.30, 180) + 10}
                        x2={780} y2={toSvgY(v, 0, 0.30, 180) + 10}
                        stroke="#1e293b" strokeWidth="1"
                      />
                    ))}
                    {/* IV line */}
                    <polyline
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="2"
                      points={spreadPoints.map((p) =>
                        `${toSvgX(p.day, 0, 59, 740) + 40},${toSvgY(p.iv, 0, 0.30, 180) + 10}`
                      ).join(" ")}
                    />
                    {/* RV line */}
                    <polyline
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      points={spreadPoints.map((p) =>
                        `${toSvgX(p.day, 0, 59, 740) + 40},${toSvgY(p.rv, 0, 0.30, 180) + 10}`
                      ).join(" ")}
                    />
                    {/* Spread fill */}
                    <polygon
                      fill="rgba(167,139,250,0.15)"
                      points={[
                        ...spreadPoints.map((p) => `${toSvgX(p.day, 0, 59, 740) + 40},${toSvgY(p.iv, 0, 0.30, 180) + 10}`),
                        ...spreadPoints.slice().reverse().map((p) => `${toSvgX(p.day, 0, 59, 740) + 40},${toSvgY(p.rv, 0, 0.30, 180) + 10}`),
                      ].join(" ")}
                    />
                    {/* Labels */}
                    <text x={42} y={toSvgY(spreadPoints[30]?.iv ?? 0.18, 0, 0.30, 180) + 8} fill="#a78bfa" fontSize="10">IV</text>
                    <text x={42} y={toSvgY(spreadPoints[30]?.rv ?? 0.14, 0, 0.30, 180) + 8} fill="#22c55e" fontSize="10">RV</text>
                    {/* Y axis labels */}
                    {[0, 0.10, 0.20, 0.30].map((v) => (
                      <text key={v} x={0} y={toSvgY(v, 0, 0.30, 180) + 14} fill="#64748b" fontSize="9">
                        {(v * 100).toFixed(0)}
                      </text>
                    ))}
                  </svg>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-primary inline-block rounded" /> Implied Vol (IV)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-green-400 inline-block rounded" /> Realized Vol (20d HV)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-primary/30 inline-block rounded" /> Vol Premium (IV - RV)</span>
                  </div>
                </CardContent>
              </Card>

              {/* Opportunity Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    Vol Premium Tracker — 8 Tickers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground text-xs border-b border-border">
                          <th className="text-left py-2 pr-4">Ticker</th>
                          <th className="text-right pr-4">IV (30d)</th>
                          <th className="text-right pr-4">RV (20d)</th>
                          <th className="text-right pr-4">Spread</th>
                          <th className="text-right pr-4">Premium %</th>
                          <th className="text-right pr-4">Sector</th>
                          <th className="text-right">Signal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {volRows.map((row) => (
                          <tr key={row.ticker} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                            <td className="py-2 pr-4 font-mono font-semibold">{row.ticker}</td>
                            <td className="text-right pr-4 font-mono" style={{ color: volColor(row.iv) }}>
                              {(row.iv * 100).toFixed(1)}
                            </td>
                            <td className="text-right pr-4 font-mono text-muted-foreground">
                              {(row.rv20 * 100).toFixed(1)}
                            </td>
                            <td className="text-right pr-4 font-mono" style={{ color: spreadColor(row.spread) }}>
                              {row.spread >= 0 ? "+" : ""}{(row.spread * 100).toFixed(1)}
                            </td>
                            <td className="text-right pr-4 font-mono text-muted-foreground">
                              {row.premium >= 0 ? "+" : ""}{row.premium.toFixed(1)}%
                            </td>
                            <td className="text-right pr-4 text-muted-foreground text-xs">{row.sector}</td>
                            <td className="text-right">
                              <Badge
                                variant="outline"
                                className={
                                  row.opportunity === "Rich"
                                    ? "text-red-400 border-red-400/40 text-xs"
                                    : row.opportunity === "Cheap"
                                    ? "text-green-400 border-green-400/40 text-xs"
                                    : "text-slate-400 border-slate-400/40 text-xs"
                                }
                              >
                                {row.opportunity === "Rich"
                                  ? "Sell Vol"
                                  : row.opportunity === "Cheap"
                                  ? "Buy Vol"
                                  : "Fair"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Current Opportunity Indicator */}
                  <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/60">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium">Current Opportunity Assessment</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center">
                        <div className="text-red-400 text-lg font-bold">{richCount}</div>
                        <div className="text-muted-foreground">Rich — Short Vol</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400 text-lg font-bold">{volRows.length - richCount - cheapCount}</div>
                        <div className="text-muted-foreground">Fair — Neutral</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 text-lg font-bold">{cheapCount}</div>
                        <div className="text-muted-foreground">Cheap — Long Vol</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Vol Market Richness Meter</span>
                        <span>{((richCount / volRows.length) * 100).toFixed(0)}% Rich</span>
                      </div>
                      <Progress value={(richCount / volRows.length) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ── Tab 2: Delta-Neutral P&L ───────────────────────────────────────── */}
        <TabsContent value="delta-neutral" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key="delta-neutral"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Setup explanation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-border">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground mb-1">Strategy</div>
                    <div className="text-sm font-semibold">Short Straddle + Daily Delta Hedge</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Sell ATM call + put at IV=30%, hedge delta daily. Profit from IV{">"} RV spread (theta decay {">"} gamma cost).
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/5 border-green-500/20">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground mb-1">Vol Sold at</div>
                    <div className="text-2xl font-bold text-green-400">30%</div>
                    <div className="text-xs text-muted-foreground">vs 22% realized → 8 vol pts premium</div>
                  </CardContent>
                </Card>
                <Card className={lastPath.cumPnl >= 0 ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}>
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground mb-1">Cumulative P&L (30 days)</div>
                    <div className={`text-2xl font-bold ${lastPath.cumPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                      ${lastPath.cumPnl.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">on $200 spot (1 straddle unit)</div>
                  </CardContent>
                </Card>
              </div>

              {/* Stock Price Path */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Simulated Stock Path (30 days) — Seed 742008
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 800 160" className="w-full h-40">
                    {(() => {
                      const prices = stockPath.map((p) => p.price);
                      const minP = Math.min(...prices) * 0.995;
                      const maxP = Math.max(...prices) * 1.005;
                      return (
                        <>
                          {[195, 200, 205].map((v) => (
                            <line
                              key={v}
                              x1={40} y1={toSvgY(v, minP, maxP, 140) + 10}
                              x2={780} y2={toSvgY(v, minP, maxP, 140) + 10}
                              stroke={v === 200 ? "#334155" : "#1e293b"}
                              strokeWidth={v === 200 ? 1.5 : 1}
                              strokeDasharray={v === 200 ? "4 4" : undefined}
                            />
                          ))}
                          {/* Strike line label */}
                          <text x={42} y={toSvgY(200, minP, maxP, 140) + 8} fill="#64748b" fontSize="9">K=200</text>
                          <polyline
                            fill="none"
                            stroke="#60a5fa"
                            strokeWidth="2"
                            points={stockPath.map((p) =>
                              `${toSvgX(p.day, 0, 30, 740) + 40},${toSvgY(p.price, minP, maxP, 140) + 10}`
                            ).join(" ")}
                          />
                          {[minP, 200, maxP].map((v) => (
                            <text key={v} x={0} y={toSvgY(v, minP, maxP, 140) + 14} fill="#64748b" fontSize="8">
                              {v.toFixed(0)}
                            </text>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </CardContent>
              </Card>

              {/* Cumulative P&L decomposition */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    P&L Decomposition: Gamma Scalp vs Theta Drag vs Net
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 800 180" className="w-full h-44">
                    {(() => {
                      const allVals = stockPath.flatMap((p) => [p.gammaPnl, p.thetaDrag, p.cumPnl]);
                      const minV = Math.min(...allVals, -1) * 1.1;
                      const maxV = Math.max(...allVals, 1) * 1.1;
                      const zero = toSvgY(0, minV, maxV, 160) + 10;
                      return (
                        <>
                          {/* zero line */}
                          <line x1={40} y1={zero} x2={780} y2={zero} stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
                          <text x={42} y={zero - 3} fill="#64748b" fontSize="9">0</text>
                          {/* gamma pnl */}
                          <polyline
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="1.5"
                            points={stockPath.map((p) =>
                              `${toSvgX(p.day, 0, 30, 740) + 40},${toSvgY(p.gammaPnl, minV, maxV, 160) + 10}`
                            ).join(" ")}
                          />
                          {/* theta drag */}
                          <polyline
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="1.5"
                            points={stockPath.map((p) =>
                              `${toSvgX(p.day, 0, 30, 740) + 40},${toSvgY(p.thetaDrag, minV, maxV, 160) + 10}`
                            ).join(" ")}
                          />
                          {/* net cumPnl */}
                          <polyline
                            fill="none"
                            stroke="#a78bfa"
                            strokeWidth="2.5"
                            points={stockPath.map((p) =>
                              `${toSvgX(p.day, 0, 30, 740) + 40},${toSvgY(p.cumPnl, minV, maxV, 160) + 10}`
                            ).join(" ")}
                          />
                          {[minV, 0, maxV].map((v, i) => (
                            <text key={i} x={0} y={toSvgY(v, minV, maxV, 160) + 14} fill="#64748b" fontSize="8">
                              ${v.toFixed(1)}
                            </text>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-green-400 inline-block rounded" /> Gamma Scalp P&L</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-red-400 inline-block rounded" /> Theta Drag (short option premium decay received)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-primary inline-block rounded" /> Net Cumulative P&L</span>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {[
                      { label: "Gamma Scalp", value: `$${lastPath.gammaPnl.toFixed(2)}`, color: "text-green-400" },
                      { label: "Theta Collected", value: `$${lastPath.thetaDrag.toFixed(2)}`, color: "text-red-400" },
                      { label: "Net P&L", value: `$${lastPath.cumPnl.toFixed(2)}`, color: lastPath.cumPnl >= 0 ? "text-green-400" : "text-red-400" },
                      { label: "Vol Arb Edge", value: "8 vol pts", color: "text-primary" },
                    ].map((s) => (
                      <div key={s.label} className="text-center p-2 bg-muted/30 rounded-lg">
                        <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-muted-foreground">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Educational callout */}
              <Card className="bg-primary/5 border-border">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><span className="text-foreground font-medium">Gamma Scalping Mechanics:</span> When you sell a straddle, you are short gamma. Each day the stock moves, you re-hedge your delta — this costs money (gamma drag). However, you collect theta (time decay) every day. If IV{">"} realized vol, theta income exceeds gamma drag and you profit.</p>
                      <p><span className="text-foreground font-medium">Key formula:</span> Daily P&L ≈ Theta×dt − ½×Gamma×(ΔS)². The arb edge is positive when IV−RV{">"} 0.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ── Tab 3: Dispersion Trading ──────────────────────────────────────── */}
        <TabsContent value="dispersion" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key="dispersion"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Summary metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-border">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">Index IV (QQQ)</div>
                    <div className="text-2xl font-bold text-primary">{(indexIV * 100).toFixed(1)}%</div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-border">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">Basket IV (weighted)</div>
                    <div className="text-2xl font-bold text-primary">{(basketIV * 100).toFixed(1)}%</div>
                  </CardContent>
                </Card>
                <Card className={dispersionSpread > 0 ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}>
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">Dispersion Spread</div>
                    <div className={`text-2xl font-bold ${dispersionSpread > 0 ? "text-green-400" : "text-red-400"}`}>
                      {dispersionSpread >= 0 ? "+" : ""}{(dispersionSpread * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">Implied Correlation</div>
                    <div className="text-2xl font-bold text-amber-400">{(impliedCorr * 100).toFixed(0)}%</div>
                  </CardContent>
                </Card>
              </div>

              {/* Concept explanation */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    Dispersion Trade Construction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs font-semibold text-primary mb-1">SELL</div>
                      <div className="text-sm font-medium">Index Straddle (QQQ)</div>
                      <div className="text-xs text-muted-foreground mt-1">Profit from index IV being rich relative to realized correlation of components</div>
                      <div className="text-xs text-primary mt-2">IV: {(indexIV * 100).toFixed(1)}%</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs font-semibold text-green-400 mb-1">BUY</div>
                      <div className="text-sm font-medium">Single-Stock Straddles</div>
                      <div className="text-xs text-muted-foreground mt-1">Long vol on individual components, weighted by index weights</div>
                      <div className="text-xs text-green-400 mt-2">Basket IV: {(basketIV * 100).toFixed(1)}%</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs font-semibold text-amber-400 mb-1">EDGE</div>
                      <div className="text-sm font-medium">Correlation Premium</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Index IV typically overstates realized correlation. Implied corr: {(impliedCorr * 100).toFixed(0)}% — historically realized is ~{Math.max(0, (impliedCorr * 100 - 15)).toFixed(0)}%
                      </div>
                      <div className="text-xs text-amber-400 mt-2">Expected edge: {(dispersionSpread * 100).toFixed(1)} vols</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Composition table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    Index vs Single-Stock Vol — Component Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground text-xs border-b border-border">
                          <th className="text-left py-2 pr-4">Ticker</th>
                          <th className="text-right pr-4">Weight</th>
                          <th className="text-right pr-4">Stock IV</th>
                          <th className="text-right pr-4">Contribution</th>
                          <th className="text-right">vs Index IV</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dispRows.map((row) => (
                          <tr key={row.ticker} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                            <td className="py-2 pr-4 font-mono font-semibold">{row.ticker}</td>
                            <td className="text-right pr-4 text-muted-foreground">{(row.weight * 100).toFixed(0)}%</td>
                            <td className="text-right pr-4 font-mono" style={{ color: volColor(row.iv) }}>
                              {(row.iv * 100).toFixed(1)}%
                            </td>
                            <td className="text-right pr-4 font-mono text-primary">
                              {(row.contribution * 100).toFixed(2)}%
                            </td>
                            <td className="text-right">
                              <span className={row.iv > indexIV ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
                                {row.iv > indexIV ? "+" : ""}{((row.iv - indexIV) * 100).toFixed(1)} vols
                              </span>
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-border font-semibold">
                          <td className="py-2 pr-4 text-sm">BASKET</td>
                          <td className="text-right pr-4">100%</td>
                          <td className="text-right pr-4 font-mono text-primary">{(basketIV * 100).toFixed(1)}%</td>
                          <td className="text-right pr-4 font-mono text-primary">{(basketIV * 100).toFixed(2)}%</td>
                          <td className="text-right text-amber-400 text-xs">+{(dispersionSpread * 100).toFixed(1)} vs Index</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Index vs Basket vol bar */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Index IV: {(indexIV * 100).toFixed(1)}%</span>
                      <span>Basket IV: {(basketIV * 100).toFixed(1)}%</span>
                    </div>
                    <div className="relative h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-primary rounded-full"
                        style={{ width: `${(indexIV / 0.35) * 100}%` }}
                      />
                    </div>
                    <div className="relative h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((basketIV / 0.35) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ── Tab 4: Vol Surface Arb ─────────────────────────────────────────── */}
        <TabsContent value="vol-surface" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key="vol-surface"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Calendar Spreads */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-primary" />
                    Calendar Spread Opportunities — Buy Cheap / Sell Rich Expiry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 p-3 bg-primary/5 border border-border rounded-lg text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">Strategy:</span> Calendar spreads exploit term structure mispricings. When back-month IV {">"} front-month IV by {">"} 2 vols, sell back/buy front. When inverted by {">"} 2 vols, buy back/sell front.
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground text-xs border-b border-border">
                          <th className="text-left py-2 pr-4">Ticker</th>
                          <th className="text-right pr-4">Front (30d) IV</th>
                          <th className="text-right pr-4">Back (60d) IV</th>
                          <th className="text-right pr-4">Term Slope</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calendarRows.map((row) => (
                          <tr key={row.ticker} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                            <td className="py-2 pr-4 font-mono font-semibold">{row.ticker}</td>
                            <td className="text-right pr-4 font-mono text-muted-foreground">
                              {(row.frontIV * 100).toFixed(1)}%
                            </td>
                            <td className="text-right pr-4 font-mono text-muted-foreground">
                              {(row.backIV * 100).toFixed(1)}%
                            </td>
                            <td className="text-right pr-4 font-mono" style={{ color: spreadColor(row.term) }}>
                              {row.term >= 0 ? "+" : ""}{(row.term * 100).toFixed(1)} vols
                            </td>
                            <td className="text-right">
                              <Badge
                                variant="outline"
                                className={
                                  row.action !== "Fair"
                                    ? "text-amber-400 border-amber-400/40 text-xs"
                                    : "text-slate-400 border-slate-400/40 text-xs"
                                }
                              >
                                {row.action}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* 25-Delta Risk Reversal / Skew */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    25-Delta Risk Reversal — Skew Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 p-3 bg-primary/5 border border-border rounded-lg text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">Risk Reversal = Call(25Δ) IV − Put(25Δ) IV.</span> Positive = call skew (bullish sentiment / low demand for downside puts). Negative = put skew (fear / crash protection demanded). Trade by selling the rich side and buying the cheap side.
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground text-xs border-b border-border">
                          <th className="text-left py-2 pr-4">Ticker</th>
                          <th className="text-right pr-4">25Δ Call IV</th>
                          <th className="text-right pr-4">25Δ Put IV</th>
                          <th className="text-right pr-4">Risk Reversal</th>
                          <th className="text-right">Skew</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rrRows.map((row) => (
                          <tr key={row.ticker} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                            <td className="py-2 pr-4 font-mono font-semibold">{row.ticker}</td>
                            <td className="text-right pr-4 font-mono text-green-400">
                              {(row.call25d * 100).toFixed(1)}%
                            </td>
                            <td className="text-right pr-4 font-mono text-red-400">
                              {(row.put25d * 100).toFixed(1)}%
                            </td>
                            <td className="text-right pr-4 font-mono" style={{ color: spreadColor(row.rr) }}>
                              {row.rr >= 0 ? "+" : ""}{(row.rr * 100).toFixed(1)} vols
                            </td>
                            <td className="text-right">
                              <Badge
                                variant="outline"
                                className={
                                  row.skew === "Call Skew"
                                    ? "text-green-400 border-green-400/40 text-xs"
                                    : row.skew === "Put Skew"
                                    ? "text-red-400 border-red-400/40 text-xs"
                                    : "text-slate-400 border-slate-400/40 text-xs"
                                }
                              >
                                {row.skew}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Skew chart — simplified bar chart */}
                  <div className="mt-4">
                    <div className="text-xs text-muted-foreground mb-2">Risk Reversal by Ticker (vols)</div>
                    <svg viewBox="0 0 800 100" className="w-full h-24">
                      {rrRows.map((row, i) => {
                        const x = (i / rrRows.length) * 720 + 40;
                        const barW = 720 / rrRows.length - 6;
                        const zero = 60;
                        const scale = 300;
                        const barH = row.rr * scale;
                        return (
                          <g key={row.ticker}>
                            <rect
                              x={x}
                              y={barH >= 0 ? zero - barH : zero}
                              width={barW}
                              height={Math.abs(barH)}
                              fill={row.rr > 0.015 ? "#22c55e" : row.rr < -0.015 ? "#ef4444" : "#64748b"}
                              rx={2}
                            />
                            <text x={x + barW / 2} y={90} textAnchor="middle" fill="#64748b" fontSize="9">
                              {row.ticker}
                            </text>
                          </g>
                        );
                      })}
                      <line x1={40} y1={60} x2={760} y2={60} stroke="#334155" strokeWidth="1" />
                    </svg>
                  </div>
                </CardContent>
              </Card>

              {/* Vol of Vol / VVix strategy note */}
              <Card className="bg-amber-500/5 border-amber-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Vol-of-Vol (VVIX) Trades
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p><span className="text-foreground font-medium">Concept:</span> VVIX measures the implied volatility of VIX options — vol of vol. When VVIX is elevated ({">"} 100), VIX options are expensive and mean-reversion sellers benefit.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="p-2 bg-muted/30 rounded">
                      <div className="font-medium text-foreground mb-1">Long Vol-of-Vol (VVIX High)</div>
                      <div>Buy VIX calls when VVIX{"<"}80. Benefits from vol regime shifts. Tail hedge for short-vol books.</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <div className="font-medium text-foreground mb-1">Short Vol-of-Vol (VVIX Low)</div>
                      <div>Sell VIX iron condors when VVIX is compressed. Collect premium from calm regimes. Stop if VIX spikes {">"} 35.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ── Tab 5: Statistical Edge ────────────────────────────────────────── */}
        <TabsContent value="stat-edge" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key="stat-edge"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* VRP Evidence */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-green-500/5 border-green-500/20">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">VRP Win Rate (2005–2024)</div>
                    <div className="text-2xl font-bold text-green-400">{positiveVRPYears}/20</div>
                    <div className="text-xs text-muted-foreground">{((positiveVRPYears / 20) * 100).toFixed(0)}% years IV{">"} RV</div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-border">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">Avg Annual VRP</div>
                    <div className="text-2xl font-bold text-primary">{(avgVRP * 100).toFixed(1)} vols</div>
                    <div className="text-xs text-muted-foreground">IV consistently overstates RV</div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-border">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">Short Vol Sharpe (est.)</div>
                    <div className="text-2xl font-bold text-primary">0.8–1.2</div>
                    <div className="text-xs text-muted-foreground">pre-tail-event; skewed left</div>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/5 border-red-500/20">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">VIX Spike Risk</div>
                    <div className="text-2xl font-bold text-red-400">~65%</div>
                    <div className="text-xs text-muted-foreground">loss in a VIX 2x event</div>
                  </CardContent>
                </Card>
              </div>

              {/* VRP Time Series */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    20-Year VRP Evidence — IV vs RV Annual Average
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 800 200" className="w-full h-48">
                    {(() => {
                      const allVals = statPoints.flatMap((p) => [p.iv, p.rv]);
                      const minV = 0;
                      const maxV = Math.max(...allVals) * 1.1;
                      return (
                        <>
                          {[0, 0.1, 0.2, 0.3].map((v) => (
                            <line
                              key={v}
                              x1={50} y1={toSvgY(v, minV, maxV, 170) + 15}
                              x2={780} y2={toSvgY(v, minV, maxV, 170) + 15}
                              stroke="#1e293b" strokeWidth="1"
                            />
                          ))}
                          {/* IV bars */}
                          {statPoints.map((p, i) => {
                            const x = toSvgX(i, 0, statPoints.length - 1, 730) + 50;
                            const barW = 730 / statPoints.length * 0.4;
                            const barH = (p.iv / maxV) * 170;
                            return (
                              <rect key={`iv-${p.year}`} x={x - barW} y={185 - barH} width={barW} height={barH} fill="#a78bfa" opacity={0.7} rx={1} />
                            );
                          })}
                          {/* RV bars */}
                          {statPoints.map((p, i) => {
                            const x = toSvgX(i, 0, statPoints.length - 1, 730) + 50;
                            const barW = 730 / statPoints.length * 0.4;
                            const barH = (p.rv / maxV) * 170;
                            return (
                              <rect key={`rv-${p.year}`} x={x + 1} y={185 - barH} width={barW} height={barH} fill="#22c55e" opacity={0.7} rx={1} />
                            );
                          })}
                          {/* X-axis year labels */}
                          {statPoints.filter((_, i) => i % 4 === 0).map((p, i) => (
                            <text key={`lbl-${i}`} x={toSvgX(i * 4, 0, statPoints.length - 1, 730) + 50} y={198} textAnchor="middle" fill="#64748b" fontSize="9">
                              {p.year}
                            </text>
                          ))}
                          {/* Y axis */}
                          {[0, 0.10, 0.20, 0.30].map((v) => (
                            <text key={`y-${v}`} x={0} y={toSvgY(v, minV, maxV, 170) + 19} fill="#64748b" fontSize="9">
                              {(v * 100).toFixed(0)}
                            </text>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-primary/70 inline-block rounded-sm" /> Implied Vol (IV)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400/70 inline-block rounded-sm" /> Realized Vol (RV)</span>
                    <span className="text-amber-400">IV {">"} RV in {positiveVRPYears}/20 years — the Vol Risk Premium</span>
                  </div>
                </CardContent>
              </Card>

              {/* Cumulative Short Vol P&L */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Cumulative Short-Vol Strategy P&L (VRP × 100 proxy, normalized)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 800 160" className="w-full h-40">
                    {(() => {
                      const vals = statPoints.map((p) => p.cumShortVol);
                      const minV = Math.min(...vals, 0) * 1.1;
                      const maxV = Math.max(...vals) * 1.1;
                      const zero = toSvgY(0, minV, maxV, 140) + 10;
                      return (
                        <>
                          <line x1={50} y1={zero} x2={780} y2={zero} stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
                          <polyline
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2.5"
                            points={statPoints.map((p, i) =>
                              `${toSvgX(i, 0, statPoints.length - 1, 730) + 50},${toSvgY(p.cumShortVol, minV, maxV, 140) + 10}`
                            ).join(" ")}
                          />
                          {/* shade under curve */}
                          <polygon
                            fill="rgba(34,197,94,0.1)"
                            points={[
                              `50,${zero}`,
                              ...statPoints.map((p, i) =>
                                `${toSvgX(i, 0, statPoints.length - 1, 730) + 50},${toSvgY(p.cumShortVol, minV, maxV, 140) + 10}`
                              ),
                              `780,${zero}`,
                            ].join(" ")}
                          />
                          {statPoints.filter((_, i) => i % 4 === 0).map((p, i) => (
                            <text key={`xl-${i}`} x={toSvgX(i * 4, 0, statPoints.length - 1, 730) + 50} y={158} textAnchor="middle" fill="#64748b" fontSize="9">
                              {p.year}
                            </text>
                          ))}
                          {[minV, 0, maxV].map((v, i) => (
                            <text key={`yl-${i}`} x={0} y={toSvgY(v, minV, maxV, 140) + 14} fill="#64748b" fontSize="9">
                              {v.toFixed(0)}
                            </text>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                  <div className="text-xs text-muted-foreground mt-2 text-center">
                    Steady compounding with drawdown risk during VIX spikes (2008, 2020, 2022)
                  </div>
                </CardContent>
              </Card>

              {/* Tail Risk Management */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-400" />
                    Tail Risk Management for Short-Vol Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Risk Sources</div>
                      {[
                        { label: "VIX Gap Spike", desc: "Overnight VIX jump on macro shock. Short vega books can lose 50–100% in days.", severity: "Critical" },
                        { label: "Correlation Breakdown", desc: "Dispersion trades lose if single-stock correlations spike to 1 (crisis regime).", severity: "High" },
                        { label: "Liquidity Risk", desc: "Wide bid/ask spreads in stressed markets make delta hedging expensive.", severity: "Medium" },
                        { label: "Model Risk", desc: "BS assumptions break down: fat tails, jumps, non-constant vol.", severity: "Medium" },
                      ].map((r) => (
                        <div key={r.label} className="flex gap-2 p-2 bg-muted/30 rounded-lg">
                          <AlertTriangle className={`w-3 h-3 mt-0.5 shrink-0 ${r.severity === "Critical" ? "text-red-400" : r.severity === "High" ? "text-amber-400" : "text-yellow-400"}`} />
                          <div>
                            <div className="text-xs font-medium">{r.label}</div>
                            <div className="text-xs text-muted-foreground">{r.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mitigation Strategies</div>
                      {[
                        { label: "VIX Call Hedge", desc: "Allocate 2–5% of premium collected to buying OTM VIX calls as tail hedge." },
                        { label: "Position Sizing", desc: "Never exceed 1% account risk per vol trade. Scale inversely with VIX level." },
                        { label: "Stop-Loss Rules", desc: "Exit position if mark-to-market loss exceeds 3× premium collected. No averaging in." },
                        { label: "Regime Filter", desc: "Reduce short-vol exposure when VIX{">"} 25 or term structure inverts (VIX futures backwardation)." },
                      ].map((m) => (
                        <div key={m.label} className="flex gap-2 p-2 bg-muted/30 rounded-lg">
                          <ChevronRight className="w-3 h-3 mt-0.5 text-green-400 shrink-0" />
                          <div>
                            <div className="text-xs font-medium">{m.label}</div>
                            <div className="text-xs text-muted-foreground">{m.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sharpe attribution */}
              <Card className="bg-primary/5 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    Short-Vol Sharpe Decomposition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-green-400 mb-1">Gross Return Source</div>
                      <div className="text-muted-foreground">Vol Risk Premium: IV − RV = avg {(avgVRP * 100).toFixed(1)} vols/year. Short delta-hedged straddles capture this as P&L ≈ Θ − ½ΓΔS².</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-amber-400 mb-1">Sharpe Reality</div>
                      <div className="text-muted-foreground">Raw Sharpe ~1.0–1.5, but negatively skewed. Rare tail events can wipe out years of gains. Kelly-optimal fraction: 20–30% of edge.</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-red-400 mb-1">After Tail Hedge Cost</div>
                      <div className="text-muted-foreground">Hedged Sharpe drops to ~0.6–0.8 but returns become more normally distributed. Drawdowns limited to 15–25% vs 50–100% unhedged.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
