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
  GitBranch,
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
import { Slider } from "@/components/ui/slider";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 815;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 815;
}

// ── Interfaces ────────────────────────────────────────────────────────────────
interface VixFuturesPoint {
  label: string;
  value: number;
  daysToExp: number;
}

interface EtfData {
  name: string;
  ticker: string;
  nav: number;
  dailyPnl: number;
  ytdPnl: number;
  rollCost: number;
  leverage: number;
  color: string;
}

interface VarianceSwapData {
  strike: number;
  realizedVar: number;
  impliedVar: number;
  dailyPnl: number[];
  vega: number;
  vanna: number;
  volga: number;
}

interface VolSurfaceCell {
  strike: number;
  expiry: string;
  iv: number;
  strikeLabel: string;
}

interface DispersionStock {
  ticker: string;
  impliedVol: number;
  realizedVol: number;
  weight: number;
  contribution: number;
}

interface DispersionData {
  indexVol: number;
  weightedStockVol: number;
  impliedCorr: number;
  tradePnl: number[];
  stocks: DispersionStock[];
}

// ── Data generators ───────────────────────────────────────────────────────────
function generateVixTermStructure(): VixFuturesPoint[] {
  resetSeed();
  const spot = 14 + rand() * 6; // 14–20
  const labels = ["Spot", "M1", "M2", "M3", "M4", "M5", "M6"];
  const days = [0, 30, 60, 90, 120, 150, 180];
  // Mostly contango with slight noise
  return labels.map((label, i) => ({
    label,
    value: +(spot + i * (0.8 + rand() * 0.6) + (rand() - 0.5) * 0.4).toFixed(2),
    daysToExp: days[i],
  }));
}

function generateEtfData(): EtfData[] {
  resetSeed();
  rand(); rand(); rand(); rand(); rand(); rand(); rand(); // consume some
  return [
    {
      name: "iPath VIX ST Futures",
      ticker: "VXX",
      nav: +(20 + rand() * 5).toFixed(2),
      dailyPnl: +((rand() - 0.5) * 4).toFixed(2),
      ytdPnl: +(-30 - rand() * 20).toFixed(1),
      rollCost: +(3 + rand() * 2).toFixed(2),
      leverage: 1,
      color: "#f87171",
    },
    {
      name: "Ultra VIX Short-Term",
      ticker: "UVXY",
      nav: +(8 + rand() * 3).toFixed(2),
      dailyPnl: +((rand() - 0.4) * 8).toFixed(2),
      ytdPnl: +(-55 - rand() * 20).toFixed(1),
      rollCost: +(6 + rand() * 2).toFixed(2),
      leverage: 1.5,
      color: "#fb923c",
    },
    {
      name: "Short VIX ST Futures",
      ticker: "SVXY",
      nav: +(55 + rand() * 10).toFixed(2),
      dailyPnl: +((rand() - 0.6) * 4).toFixed(2),
      ytdPnl: +(18 + rand() * 15).toFixed(1),
      rollCost: +(-3 - rand() * 2).toFixed(2),
      leverage: -0.5,
      color: "#4ade80",
    },
  ];
}

function generateVarianceSwap(): VarianceSwapData {
  const iv = 18 + rand() * 6;
  const realizedVol = 14 + rand() * 8;
  const pnls: number[] = [];
  let cumRv = 0;
  for (let i = 0; i < 20; i++) {
    const dailyRet = (rand() - 0.5) * 0.03;
    cumRv += dailyRet * dailyRet * 252;
    const dayFrac = (i + 1) / 252;
    const pnl = ((cumRv / (i + 1)) - iv * iv / 100) * dayFrac * 1_000_000 * 0.01;
    pnls.push(+pnl.toFixed(0));
  }
  return {
    strike: +iv.toFixed(2),
    realizedVar: +(realizedVol * realizedVol).toFixed(2),
    impliedVar: +(iv * iv).toFixed(2),
    dailyPnl: pnls,
    vega: +(50000 + rand() * 20000).toFixed(0),
    vanna: +((rand() - 0.5) * 8000).toFixed(0),
    volga: +(2000 + rand() * 3000).toFixed(0),
  };
}

function generateVolSurface(): VolSurfaceCell[] {
  const expiries = ["7D", "14D", "1M", "2M", "3M"];
  const strikePcts = [80, 90, 100, 110, 120];
  const atmIv = 18 + rand() * 4;
  const cells: VolSurfaceCell[] = [];
  for (const expiry of expiries) {
    for (const sp of strikePcts) {
      const skewEffect = (100 - sp) * 0.15 + (rand() - 0.5) * 0.5;
      const termEffect = expiry === "7D" ? 3 : expiry === "14D" ? 1.5 : expiry === "1M" ? 0 : -0.5;
      const iv = Math.max(10, atmIv + skewEffect + termEffect + (rand() - 0.5) * 1.5);
      cells.push({
        strike: sp,
        expiry,
        iv: +iv.toFixed(2),
        strikeLabel: sp === 100 ? "ATM" : sp < 100 ? `${sp}%` : `${sp}%`,
      });
    }
  }
  return cells;
}

function generateDispersionData(): DispersionData {
  const stocks: DispersionStock[] = [
    { ticker: "AAPL", weight: 0.07, impliedVol: 0, realizedVol: 0, contribution: 0 },
    { ticker: "MSFT", weight: 0.065, impliedVol: 0, realizedVol: 0, contribution: 0 },
    { ticker: "NVDA", weight: 0.055, impliedVol: 0, realizedVol: 0, contribution: 0 },
    { ticker: "AMZN", weight: 0.05, impliedVol: 0, realizedVol: 0, contribution: 0 },
    { ticker: "META", weight: 0.04, impliedVol: 0, realizedVol: 0, contribution: 0 },
  ];
  for (const st of stocks) {
    st.impliedVol = +(22 + rand() * 18).toFixed(1);
    st.realizedVol = +(16 + rand() * 14).toFixed(1);
    st.contribution = +(st.weight * st.impliedVol).toFixed(2);
  }
  const weightedStockVol = +stocks.reduce((a, s) => a + s.weight * s.impliedVol, 0).toFixed(2);
  const indexVol = +(weightedStockVol * (0.55 + rand() * 0.15)).toFixed(2);
  const impliedCorr = +Math.pow(indexVol / weightedStockVol, 2).toFixed(4);

  const pnls: number[] = [];
  let cum = 0;
  for (let i = 0; i < 20; i++) {
    const dailyMove = (rand() - 0.45) * 800;
    cum += dailyMove;
    pnls.push(+cum.toFixed(0));
  }
  return { indexVol, weightedStockVol, impliedCorr, tradePnl: pnls, stocks };
}

// ── SVG helpers ───────────────────────────────────────────────────────────────
function polylinePoints(
  data: number[],
  w: number,
  h: number,
  pad = 10
): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function areaPoints(
  data: number[],
  w: number,
  h: number,
  pad = 10
): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const first = `${pad},${h - pad}`;
  const last = `${w - pad},${h - pad}`;
  return `${first} ${pts.join(" ")} ${last}`;
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  const color =
    positive === undefined
      ? "text-slate-300"
      : positive
      ? "text-emerald-400"
      : "text-red-400";
  return (
    <div className="flex flex-col items-center gap-0.5 bg-slate-800 rounded-lg px-3 py-2 min-w-[80px]">
      <span className="text-[10px] text-slate-500 uppercase tracking-wide leading-none">
        {label}
      </span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}

// ── Tab: VIX Products ─────────────────────────────────────────────────────────
function VixProductsTab() {
  const termStructure = useMemo(generateVixTermStructure, []);
  const etfs = useMemo(generateEtfData, []);
  const [position, setPosition] = useState<"long" | "short">("short");
  const [contracts, setContracts] = useState([5]);

  const isContango =
    termStructure[termStructure.length - 1].value > termStructure[0].value;
  const rollYield = +(
    ((termStructure[1].value - termStructure[0].value) / termStructure[0].value) *
    100
  ).toFixed(2);

  // P&L estimate based on roll yield and position
  const notional = contracts[0] * 1000 * termStructure[0].value;
  const dailyRollPnl = +((notional * rollYield) / 100 / 30).toFixed(0);
  const adjPnl = position === "short" ? -dailyRollPnl : dailyRollPnl;

  // SVG dimensions for term structure
  const W = 380;
  const H = 140;
  const values = termStructure.map((p) => p.value);
  const minV = Math.min(...values) - 1;
  const maxV = Math.max(...values) + 1;
  const scaleY = (v: number) =>
    H - 20 - ((v - minV) / (maxV - minV)) * (H - 40);
  const scaleX = (i: number) => 30 + (i / (termStructure.length - 1)) * (W - 50);

  const linePts = termStructure
    .map((p, i) => `${scaleX(i).toFixed(1)},${scaleY(p.value).toFixed(1)}`)
    .join(" ");

  const areaPts = [
    `30,${H - 20}`,
    ...termStructure.map((p, i) => `${scaleX(i).toFixed(1)},${scaleY(p.value).toFixed(1)}`),
    `${W - 20},${H - 20}`,
  ].join(" ");

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex flex-wrap gap-2">
        <StatChip label="VIX Spot" value={`${termStructure[0].value}`} />
        <StatChip
          label="Structure"
          value={isContango ? "Contango" : "Backwardation"}
          positive={!isContango}
        />
        <StatChip
          label="Roll Yield/Mo"
          value={`${rollYield > 0 ? "+" : ""}${rollYield}%`}
          positive={rollYield < 0}
        />
        <StatChip
          label="M1 Premium"
          value={`${(termStructure[1].value - termStructure[0].value).toFixed(2)}`}
          positive={termStructure[1].value < termStructure[0].value}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Term Structure Chart */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              VIX Futures Term Structure
              <Badge
                variant="outline"
                className={
                  isContango
                    ? "border-amber-500/50 text-amber-400 text-[10px]"
                    : "border-emerald-500/50 text-emerald-400 text-[10px]"
                }
              >
                {isContango ? "Contango" : "Backwardation"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
              {/* Grid lines */}
              {[minV + 1, minV + (maxV - minV) / 2, maxV - 1].map((v, i) => (
                <line
                  key={i}
                  x1={30}
                  y1={scaleY(v)}
                  x2={W - 10}
                  y2={scaleY(v)}
                  stroke="#334155"
                  strokeWidth={0.5}
                  strokeDasharray="4,4"
                />
              ))}
              {/* Area fill */}
              <polygon
                points={areaPts}
                fill={isContango ? "rgba(251,146,60,0.08)" : "rgba(74,222,128,0.08)"}
              />
              {/* Line */}
              <polyline
                points={linePts}
                fill="none"
                stroke={isContango ? "#fb923c" : "#4ade80"}
                strokeWidth={2}
              />
              {/* Points */}
              {termStructure.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={scaleX(i)}
                    cy={scaleY(p.value)}
                    r={4}
                    fill={isContango ? "#fb923c" : "#4ade80"}
                  />
                  <text
                    x={scaleX(i)}
                    y={H - 5}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={9}
                  >
                    {p.label}
                  </text>
                  <text
                    x={scaleX(i)}
                    y={scaleY(p.value) - 7}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize={9}
                    fontWeight={600}
                  >
                    {p.value}
                  </text>
                </g>
              ))}
              {/* Y axis labels */}
              <text x={0} y={scaleY(minV + 1) + 4} fill="#64748b" fontSize={8}>
                {(minV + 1).toFixed(0)}
              </text>
              <text x={0} y={scaleY(maxV - 1) + 4} fill="#64748b" fontSize={8}>
                {(maxV - 1).toFixed(0)}
              </text>
            </svg>
          </CardContent>
        </Card>

        {/* P&L Simulator */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Position Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {(["long", "short"] as const).map((side) => (
                <Button
                  key={side}
                  size="sm"
                  variant={position === side ? "default" : "outline"}
                  onClick={() => setPosition(side)}
                  className={
                    position === side
                      ? side === "long"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                      : "border-slate-600 text-slate-400"
                  }
                >
                  {side === "long" ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {side.charAt(0).toUpperCase() + side.slice(1)} Vol
                </Button>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Contracts (VIX futures)</span>
                <span className="text-white font-semibold">{contracts[0]}</span>
              </div>
              <Slider
                value={contracts}
                onValueChange={setContracts}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-500">Notional</div>
                <div className="text-white font-semibold">
                  ${(notional / 1000).toFixed(0)}K
                </div>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-500">Daily Roll P&L</div>
                <div
                  className={
                    adjPnl > 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"
                  }
                >
                  {adjPnl > 0 ? "+" : ""}${adjPnl.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-800 rounded p-2 col-span-2">
                <div className="text-slate-500 mb-1">Monthly Roll P&L Est.</div>
                <div
                  className={
                    adjPnl * 30 > 0
                      ? "text-emerald-400 font-semibold text-base"
                      : "text-red-400 font-semibold text-base"
                  }
                >
                  {adjPnl * 30 > 0 ? "+" : ""}${(adjPnl * 30).toLocaleString()}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              {position === "short"
                ? "Short vol collects roll yield in contango. Risk: VIX spike."
                : "Long vol pays roll cost but profits from volatility spikes."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* VIX ETF Comparison */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            VIX ETP Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="text-left pb-2">Product</th>
                  <th className="text-right pb-2">NAV</th>
                  <th className="text-right pb-2">Daily P&L</th>
                  <th className="text-right pb-2">YTD</th>
                  <th className="text-right pb-2">Roll Cost/Mo</th>
                  <th className="text-right pb-2">Leverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {etfs.map((etf) => (
                  <tr key={etf.ticker}>
                    <td className="py-2">
                      <span
                        className="font-semibold"
                        style={{ color: etf.color }}
                      >
                        {etf.ticker}
                      </span>
                      <span className="text-slate-500 ml-1">
                        {etf.name}
                      </span>
                    </td>
                    <td className="py-2 text-right text-slate-300">
                      ${etf.nav}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        etf.dailyPnl >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {etf.dailyPnl >= 0 ? "+" : ""}
                      {etf.dailyPnl}%
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        etf.ytdPnl >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {etf.ytdPnl >= 0 ? "+" : ""}
                      {etf.ytdPnl}%
                    </td>
                    <td
                      className={`py-2 text-right ${
                        etf.rollCost < 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {etf.rollCost > 0 ? "-" : "+"}
                      {Math.abs(etf.rollCost)}%
                    </td>
                    <td className="py-2 text-right text-slate-300">
                      {etf.leverage > 0 ? `${etf.leverage}x` : `${etf.leverage}x`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 p-2 bg-slate-800/60 rounded text-[10px] text-slate-400 flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-blue-400" />
            VXX and UVXY experience structural decay from rolling short-dated futures. SVXY profits
            from this roll yield but carries significant gap-up risk.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab: Variance Swaps ───────────────────────────────────────────────────────
function VarianceSwapsTab() {
  const data = useMemo(generateVarianceSwap, []);
  const [notionalMult, setNotionalMult] = useState([1]);

  const notional = 100_000 * notionalMult[0];
  const vegaNotional = (notional / (2 * data.strike)).toFixed(0);
  const currentPnl = data.dailyPnl[data.dailyPnl.length - 1];
  const scaledPnl = +(currentPnl * notionalMult[0]).toFixed(0);

  const rvVol = Math.sqrt(data.realizedVar).toFixed(2);
  const ivVol = Math.sqrt(data.impliedVar).toFixed(2);
  const varSpread = +(data.realizedVar - data.impliedVar).toFixed(2);

  const W = 500;
  const H = 100;
  const pnlPts = polylinePoints(data.dailyPnl, W, H, 8);
  const areaPts2 = areaPoints(data.dailyPnl, W, H, 8);
  const isProfit = currentPnl > 0;

  // Zero line
  const minP = Math.min(...data.dailyPnl);
  const maxP = Math.max(...data.dailyPnl);
  const rangeP = maxP - minP || 1;
  const zeroY = H - 8 - ((0 - minP) / rangeP) * (H - 16);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="flex flex-wrap gap-2">
        <StatChip label="Var Strike" value={`σ² = ${data.impliedVar}`} />
        <StatChip label="Realized Vol" value={`${rvVol}%`} positive={+rvVol < data.strike} />
        <StatChip label="Implied Vol" value={`${ivVol}%`} />
        <StatChip
          label="Var Spread"
          value={`${varSpread > 0 ? "+" : ""}${varSpread}`}
          positive={varSpread < 0}
        />
        <StatChip
          label="Cum. P&L"
          value={`$${scaledPnl.toLocaleString()}`}
          positive={scaledPnl > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Realized vs Implied variance */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <Sigma className="w-4 h-4 text-violet-400" />
              Realized vs Implied Variance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Realized Variance (σ²_R)</span>
                  <span className="text-emerald-400 font-semibold">{data.realizedVar}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (data.realizedVar / (data.impliedVar * 1.5)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Implied Variance (σ²_I)</span>
                  <span className="text-violet-400 font-semibold">{data.impliedVar}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (data.impliedVar / (data.impliedVar * 1.5)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="pt-1 border-t border-slate-700">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Variance Premium</span>
                  <span
                    className={
                      data.impliedVar > data.realizedVar
                        ? "text-amber-400 font-semibold"
                        : "text-red-400 font-semibold"
                    }
                  >
                    {data.impliedVar > data.realizedVar ? "Overpriced" : "Underpriced"} by{" "}
                    {Math.abs(varSpread).toFixed(2)} var units
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <div className="bg-slate-800 rounded p-2">
                  <div className="text-slate-500 text-[10px]">Vega ($)</div>
                  <div className="text-blue-400 font-semibold">
                    ${(data.vega / 1000).toFixed(1)}K
                  </div>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <div className="text-slate-500 text-[10px]">Vanna ($)</div>
                  <div
                    className={
                      data.vanna >= 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"
                    }
                  >
                    {data.vanna >= 0 ? "+" : ""}${(data.vanna / 1000).toFixed(1)}K
                  </div>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <div className="text-slate-500 text-[10px]">Volga ($)</div>
                  <div className="text-purple-400 font-semibold">
                    ${(data.volga / 1000).toFixed(1)}K
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notional / P&L scaler */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-cyan-400" />
              Variance Notional & P&L
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Variance Notional Multiplier</span>
                <span className="text-white font-semibold">{notionalMult[0]}x</span>
              </div>
              <Slider
                value={notionalMult}
                onValueChange={setNotionalMult}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-500">Var Notional</div>
                <div className="text-white font-semibold">
                  ${(notional / 1000).toFixed(0)}K
                </div>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-500">Vega Notional</div>
                <div className="text-blue-400 font-semibold">
                  ${(+vegaNotional / 1000).toFixed(1)}K
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded p-3">
              <div className="text-xs text-slate-500 mb-1">Daily Accrual Formula</div>
              <div className="text-[11px] text-slate-300 font-mono">
                P&L = N × (σ²_R - σ²_I) × (t/T)
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                N = var notional · σ²_R = ann. realized · σ²_I = strike²
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-800/60 rounded">
              <span className="text-xs text-slate-400">Cumulative P&L</span>
              <span
                className={`text-sm font-bold ${
                  scaledPnl > 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {scaledPnl > 0 ? "+" : ""}${scaledPnl.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily P&L chart */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Daily Cumulative P&L — Short Variance Swap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            {/* Zero line */}
            {zeroY > 8 && zeroY < H - 8 && (
              <line
                x1={8}
                y1={zeroY}
                x2={W - 8}
                y2={zeroY}
                stroke="#475569"
                strokeWidth={1}
                strokeDasharray="4,3"
              />
            )}
            {/* Area */}
            <polygon
              points={areaPts2}
              fill={isProfit ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)"}
            />
            {/* Line */}
            <polyline
              points={pnlPts}
              fill="none"
              stroke={isProfit ? "#4ade80" : "#f87171"}
              strokeWidth={2}
            />
            {/* Day labels */}
            {[0, 4, 9, 14, 19].map((i) => (
              <text
                key={i}
                x={8 + (i / 19) * (W - 16)}
                y={H - 1}
                textAnchor="middle"
                fill="#64748b"
                fontSize={8}
              >
                D{i + 1}
              </text>
            ))}
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab: Vol Surface ──────────────────────────────────────────────────────────
function VolSurfaceTab() {
  const cells = useMemo(generateVolSurface, []);
  const [hoveredCell, setHoveredCell] = useState<VolSurfaceCell | null>(null);

  const expiries = ["7D", "14D", "1M", "2M", "3M"];
  const strikePcts = [80, 90, 100, 110, 120];
  const strikeLbls = ["80%", "90%", "ATM", "110%", "120%"];

  const allIvs = cells.map((c) => c.iv);
  const minIv = Math.min(...allIvs);
  const maxIv = Math.max(...allIvs);

  function ivToColor(iv: number): string {
    const t = (iv - minIv) / (maxIv - minIv);
    // Blue (low) → green → yellow → red (high)
    if (t < 0.33) {
      const u = t / 0.33;
      const r = Math.round(59 + u * (74 - 59));
      const g = Math.round(130 + u * (222 - 130));
      const b = Math.round(246 - u * (246 - 128));
      return `rgb(${r},${g},${b})`;
    } else if (t < 0.66) {
      const u = (t - 0.33) / 0.33;
      const r = Math.round(74 + u * (250 - 74));
      const g = Math.round(222 - u * (222 - 204));
      const b = Math.round(128 - u * 128);
      return `rgb(${r},${g},${b})`;
    } else {
      const u = (t - 0.66) / 0.34;
      const r = Math.round(250 + u * 5);
      const g = Math.round(204 - u * 91);
      const b = Math.round(0);
      return `rgb(${r},${g},${b})`;
    }
  }

  const getCell = (exp: string, strike: number) =>
    cells.find((c) => c.expiry === exp && c.strike === strike);

  // Skew metric: 25D put IV - 25D call IV (approx 90% - 110%)
  const skewByExpiry = expiries.map((exp) => {
    const put25d = getCell(exp, 90)?.iv ?? 0;
    const call25d = getCell(exp, 110)?.iv ?? 0;
    return { exp, skew: +(put25d - call25d).toFixed(2) };
  });

  const atmIvs = expiries.map((exp) => getCell(exp, 100)?.iv ?? 0);
  const termSlope = +((atmIvs[4] - atmIvs[0]) / 4).toFixed(2);
  const volOfVol = +(
    (Math.max(...atmIvs) - Math.min(...atmIvs)) / ((atmIvs.reduce((a, b) => a + b) / atmIvs.length))
  * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="flex flex-wrap gap-2">
        <StatChip label="ATM IV (1M)" value={`${atmIvs[2].toFixed(2)}%`} />
        <StatChip
          label="Skew (1M)"
          value={`+${skewByExpiry[2].skew.toFixed(2)} pts`}
          positive={false}
        />
        <StatChip
          label="Term Slope"
          value={`${termSlope > 0 ? "+" : ""}${termSlope}/exp`}
          positive={termSlope < 0}
        />
        <StatChip label="Vol of Vol" value={`${volOfVol}%`} />
      </div>

      {/* Heatmap */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-pink-400" />
            Implied Volatility Surface — 5×5 Grid
            {hoveredCell && (
              <Badge variant="outline" className="border-pink-500/50 text-pink-300 text-[10px] ml-auto">
                {hoveredCell.strikeLabel} {hoveredCell.expiry}: {hoveredCell.iv}%
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-slate-500 pb-2 pr-3 text-[10px] w-12">
                    Strike ↓ / Expiry →
                  </th>
                  {expiries.map((exp) => (
                    <th
                      key={exp}
                      className="text-center text-slate-400 pb-2 px-2 font-medium text-[10px]"
                    >
                      {exp}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {strikePcts.map((sp, si) => (
                  <tr key={sp}>
                    <td className="py-1 pr-3 text-slate-400 text-[10px] font-medium">
                      {strikeLbls[si]}
                    </td>
                    {expiries.map((exp) => {
                      const cell = getCell(exp, sp);
                      const bg = cell ? ivToColor(cell.iv) : "#1e293b";
                      const isHovered =
                        hoveredCell?.expiry === exp && hoveredCell?.strike === sp;
                      return (
                        <td
                          key={exp}
                          className="py-1 px-2 text-center cursor-pointer transition-transform"
                          onMouseEnter={() => cell && setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <div
                            className={`rounded px-2 py-1 font-semibold text-xs select-none ${
                              isHovered ? "ring-2 ring-white" : ""
                            }`}
                            style={{
                              background: bg,
                              color: "#0f172a",
                            }}
                          >
                            {cell?.iv.toFixed(1)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Color scale legend */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] text-slate-500">Low IV</span>
            <div
              className="flex-1 h-2 rounded"
              style={{
                background:
                  "linear-gradient(to right, rgb(59,130,246), rgb(74,222,128), rgb(250,204,0), rgb(255,113,0))",
              }}
            />
            <span className="text-[10px] text-slate-500">High IV</span>
          </div>
        </CardContent>
      </Card>

      {/* Skew by expiry */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            Skew by Expiry (25Δ Put IV − 25Δ Call IV)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg width="100%" viewBox="0 0 500 80" className="overflow-visible">
            {skewByExpiry.map((d, i) => {
              const x = 40 + (i / (skewByExpiry.length - 1)) * 420;
              const maxSkew = Math.max(...skewByExpiry.map((s) => s.skew));
              const barH = (d.skew / maxSkew) * 50;
              return (
                <g key={d.exp}>
                  <rect
                    x={x - 20}
                    y={60 - barH}
                    width={40}
                    height={barH}
                    fill="#a78bfa"
                    opacity={0.8}
                    rx={3}
                  />
                  <text x={x} y={75} textAnchor="middle" fill="#94a3b8" fontSize={9}>
                    {d.exp}
                  </text>
                  <text
                    x={x}
                    y={60 - barH - 3}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize={8}
                    fontWeight={600}
                  >
                    {d.skew}
                  </text>
                </g>
              );
            })}
            <line x1={20} y1={60} x2={480} y2={60} stroke="#334155" strokeWidth={1} />
          </svg>
          <p className="text-[10px] text-slate-500 mt-1">
            Positive skew = puts more expensive than calls (typical equity market behavior — fear premium on downside)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab: Dispersion ───────────────────────────────────────────────────────────
function DispersionTab() {
  const data = useMemo(generateDispersionData, []);
  const [tradeOn, setTradeOn] = useState(false);

  const corrPct = (data.impliedCorr * 100).toFixed(1);
  const volSpread = +(data.weightedStockVol - data.indexVol).toFixed(2);
  const latestPnl = data.tradePnl[data.tradePnl.length - 1];

  const W = 500;
  const H = 90;
  const pnlPts = polylinePoints(data.tradePnl, W, H, 8);
  const areaPts3 = areaPoints(data.tradePnl, W, H, 8);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <StatChip label="Index IV" value={`${data.indexVol}%`} />
        <StatChip label="Wtd Stock IV" value={`${data.weightedStockVol}%`} />
        <StatChip
          label="Vol Spread"
          value={`+${volSpread.toFixed(2)}%`}
          positive={true}
        />
        <StatChip label="Implied Corr" value={`${corrPct}%`} positive={+corrPct < 50} />
        <StatChip
          label="Trade P&L"
          value={`$${latestPnl.toLocaleString()}`}
          positive={latestPnl > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Single stock vol table */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-400" />
              Component Volatilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="text-left pb-2">Stock</th>
                  <th className="text-right pb-2">Weight</th>
                  <th className="text-right pb-2">Imp. Vol</th>
                  <th className="text-right pb-2">Rlz. Vol</th>
                  <th className="text-right pb-2">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.stocks.map((st) => (
                  <tr key={st.ticker}>
                    <td className="py-2 font-semibold text-blue-400">{st.ticker}</td>
                    <td className="py-2 text-right text-slate-400">
                      {(st.weight * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 text-right text-amber-400 font-medium">
                      {st.impliedVol}%
                    </td>
                    <td className="py-2 text-right text-slate-300">{st.realizedVol}%</td>
                    <td className="py-2 text-right text-purple-400 font-medium">
                      {st.contribution.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-slate-600">
                  <td className="py-2 font-semibold text-slate-300" colSpan={2}>
                    Weighted Total
                  </td>
                  <td className="py-2 text-right text-amber-400 font-bold">
                    {data.weightedStockVol}%
                  </td>
                  <td className="py-2" />
                  <td className="py-2 text-right text-purple-400 font-bold">
                    {data.stocks.reduce((a, s) => a + s.contribution, 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-500 text-[10px]" colSpan={2}>
                    Index (SPX)
                  </td>
                  <td className="py-2 text-right text-blue-400 font-bold">
                    {data.indexVol}%
                  </td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Trade setup */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Dispersion Trade Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-slate-800 rounded-lg space-y-2 text-xs">
              <div className="text-slate-400 font-medium mb-2">
                Trade: Buy Single-Stock Vol, Sell Index Vol
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Long 5 stocks (weighted)</span>
                <span className="text-emerald-400">+{data.weightedStockVol}% IV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Short SPX index vol</span>
                <span className="text-red-400">-{data.indexVol}% IV</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between font-semibold">
                <span className="text-slate-300">Vol Spread (edge)</span>
                <span className="text-amber-400">+{volSpread.toFixed(2)}%</span>
              </div>
            </div>

            <div className="p-3 bg-slate-800 rounded-lg text-xs space-y-2">
              <div className="text-slate-400 font-medium">Implied Correlation</div>
              <div className="text-2xl font-bold text-blue-400">{corrPct}%</div>
              <div className="text-[10px] text-slate-500">
                ρ_impl = (σ_index / Σ w_i·σ_i)²
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${corrPct}%` }}
                />
              </div>
            </div>

            <Button
              className={`w-full text-xs ${
                tradeOn
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              } text-white`}
              onClick={() => setTradeOn((v) => !v)}
            >
              {tradeOn ? (
                <>
                  <Shield className="w-3 h-3 mr-1" />
                  Close Dispersion Trade
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  Enter Dispersion Trade
                </>
              )}
            </Button>

            {tradeOn && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 bg-emerald-900/30 border border-emerald-500/30 rounded text-[10px] text-emerald-300"
              >
                Trade active. P&L accrues as stock correlations diverge from index implied.
                Max profit when stocks move independently.
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historical payout chart */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            Dispersion Trade Historical P&L (20-day sim)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            {/* Zero line */}
            {(() => {
              const minP = Math.min(...data.tradePnl);
              const maxP = Math.max(...data.tradePnl);
              const rangeP = maxP - minP || 1;
              const zy = H - 8 - ((0 - minP) / rangeP) * (H - 16);
              return zy > 8 && zy < H - 8 ? (
                <line
                  x1={8}
                  y1={zy}
                  x2={W - 8}
                  y2={zy}
                  stroke="#475569"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
              ) : null;
            })()}
            <polygon
              points={areaPts3}
              fill={latestPnl > 0 ? "rgba(45,212,191,0.08)" : "rgba(248,113,113,0.08)"}
            />
            <polyline
              points={pnlPts}
              fill="none"
              stroke={latestPnl > 0 ? "#2dd4bf" : "#f87171"}
              strokeWidth={2}
            />
            {[0, 4, 9, 14, 19].map((i) => (
              <text
                key={i}
                x={8 + (i / 19) * (W - 16)}
                y={H - 1}
                textAnchor="middle"
                fill="#64748b"
                fontSize={8}
              >
                D{i + 1}
              </text>
            ))}
          </svg>
          <div className="mt-2 p-2 bg-slate-800/60 rounded text-[10px] text-slate-400 flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-teal-400" />
            Dispersion trades profit when realized correlation is lower than implied correlation.
            Risk: correlation spikes during market stress events.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VolTradingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-violet-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Volatility Trading</h1>
          <Badge variant="outline" className="border-violet-500/40 text-violet-300 text-[10px]">
            Professional
          </Badge>
        </div>
        <p className="text-sm text-slate-400 ml-14">
          VIX products, variance swaps, vol surface analysis, and dispersion trading strategies.
        </p>
      </div>

      <Tabs defaultValue="vix" className="space-y-4">
        <TabsList className="bg-slate-900 border border-slate-700 h-auto flex-wrap gap-1 p-1">
          <TabsTrigger
            value="vix"
            className="text-xs data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            <Activity className="w-3 h-3 mr-1" />
            VIX Products
          </TabsTrigger>
          <TabsTrigger
            value="variance"
            className="text-xs data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            <Sigma className="w-3 h-3 mr-1" />
            Variance Swaps
          </TabsTrigger>
          <TabsTrigger
            value="surface"
            className="text-xs data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            <Layers className="w-3 h-3 mr-1" />
            Vol Surface
          </TabsTrigger>
          <TabsTrigger
            value="dispersion"
            className="text-xs data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            <GitBranch className="w-3 h-3 mr-1" />
            Dispersion
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="vix" className="data-[state=inactive]:hidden mt-0">
            <motion.div
              key="vix"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <VixProductsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="variance" className="data-[state=inactive]:hidden mt-0">
            <motion.div
              key="variance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <VarianceSwapsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="surface" className="data-[state=inactive]:hidden mt-0">
            <motion.div
              key="surface"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <VolSurfaceTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="dispersion" className="data-[state=inactive]:hidden mt-0">
            <motion.div
              key="dispersion"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DispersionTab />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
