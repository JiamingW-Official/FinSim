"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  BarChart2,
  DollarSign,
  Shield,
  Activity,
  Zap,
  Leaf,
  Gem,
  Flame,
  Calculator,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG (seed 832) ────────────────────────────────────────────────────
let s = 832;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate stable data values upfront
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const sv = () => _vals[_vi++ % _vals.length];

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmt(n: number, d = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtPct(n: number): string {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}
function pos(v: number) {
  return v >= 0 ? "text-emerald-400" : "text-red-400";
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface FuturesContract {
  month: string;
  price: number;
  oi: number; // open interest thousands
  vol: number; // volume thousands
}

interface CommodityCurve {
  name: string;
  ticker: string;
  spot: number;
  unit: string;
  contracts: FuturesContract[];
  rollYield: number;
  convenienceYield: number;
  storageCost: number;
  riskFreeRate: number;
  curveType: "contango" | "backwardation";
}

interface SeasonalData {
  name: string;
  ticker: string;
  color: string;
  monthlyIndex: number[]; // 12 values, 100 = average
  patternStrength: number; // 0-100
  bestMonth: number; // 0-indexed
  worstMonth: number;
}

interface HedgeScenario {
  name: string;
  description: string;
  company: string;
  commodity: string;
  exposure: number; // USD
  hedgeRatio: number; // 0-1
  spotPrice: number;
  contractSize: number;
  unit: string;
  monthsAhead: number;
  basisRisk: number; // USD per unit
  color: string;
}

interface SectorCommodity {
  name: string;
  ticker: string;
  price: number;
  change1d: number;
  change1w: number;
  change1m: number;
  ytd: number;
  unit: string;
}

interface SupplyDemandRow {
  commodity: string;
  supply: number; // million units
  demand: number;
  stocksUse: number; // %
  trend: "tightening" | "loosening" | "balanced";
  keyDriver: string;
}

// ── DATA GENERATION ────────────────────────────────────────────────────────────

const MONTHS = ["Spot", "Mar", "Jun", "Sep", "Dec", "Mar+1", "Jun+1"];

function genCurve(
  name: string,
  ticker: string,
  spot: number,
  unit: string,
  type: "contango" | "backwardation",
  storageBase: number,
  convBase: number
): CommodityCurve {
  const contracts: FuturesContract[] = [];
  let price = spot;
  for (let i = 0; i < 6; i++) {
    if (type === "contango") {
      price = price * (1 + (storageBase + sv() * 0.004) / 12);
    } else {
      price = price * (1 - (convBase * 0.5 + sv() * 0.006) / 12);
    }
    contracts.push({
      month: MONTHS[i + 1],
      price: parseFloat(price.toFixed(2)),
      oi: Math.round(100 + sv() * 900),
      vol: Math.round(50 + sv() * 400),
    });
  }
  const frontPrice = contracts[0].price;
  const backPrice = contracts[5].price;
  const annualRollYield = ((frontPrice - backPrice) / backPrice) * 100;
  const storageCost = storageBase * 100;
  const riskFreeRate = 4.5 + sv() * 0.5;
  const convenienceYield =
    type === "backwardation"
      ? riskFreeRate + storageCost + annualRollYield
      : convBase * 100;

  return {
    name,
    ticker,
    spot,
    unit,
    contracts,
    rollYield: parseFloat(annualRollYield.toFixed(2)),
    convenienceYield: parseFloat(convenienceYield.toFixed(2)),
    storageCost: parseFloat(storageCost.toFixed(2)),
    riskFreeRate: parseFloat(riskFreeRate.toFixed(2)),
    curveType: type,
  };
}

const CURVES: CommodityCurve[] = [
  genCurve("Crude Oil", "CL", 78.42 + sv() * 4, "/bbl", "contango", 0.008, 0.02),
  genCurve("Gold", "GC", 2340 + sv() * 80, "/oz", "contango", 0.003, 0.01),
  genCurve("Natural Gas", "NG", 2.18 + sv() * 0.3, "/MMBtu", "backwardation", 0.015, 0.06),
];

const SEASONAL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function genSeasonalIndex(
  basePattern: number[],
  noise: number
): number[] {
  return basePattern.map((v) => parseFloat((v + (sv() - 0.5) * noise).toFixed(1)));
}

const SEASONAL_COMMODITIES: SeasonalData[] = [
  {
    name: "Natural Gas",
    ticker: "NG",
    color: "#f97316",
    monthlyIndex: genSeasonalIndex(
      [125, 115, 95, 80, 75, 80, 88, 90, 98, 108, 120, 128],
      8
    ),
    patternStrength: 78,
    bestMonth: 11,
    worstMonth: 4,
  },
  {
    name: "Wheat",
    ticker: "ZW",
    color: "#eab308",
    monthlyIndex: genSeasonalIndex(
      [100, 98, 95, 90, 88, 92, 105, 110, 108, 104, 100, 102],
      6
    ),
    patternStrength: 62,
    bestMonth: 7,
    worstMonth: 5,
  },
  {
    name: "Heating Oil",
    ticker: "HO",
    color: "#ef4444",
    monthlyIndex: genSeasonalIndex(
      [120, 118, 105, 88, 80, 78, 82, 90, 100, 112, 118, 122],
      7
    ),
    patternStrength: 71,
    bestMonth: 11,
    worstMonth: 5,
  },
  {
    name: "Corn",
    ticker: "ZC",
    color: "#84cc16",
    monthlyIndex: genSeasonalIndex(
      [102, 100, 98, 95, 92, 90, 95, 100, 108, 112, 108, 104],
      5
    ),
    patternStrength: 55,
    bestMonth: 9,
    worstMonth: 6,
  },
];

const BASE_HEDGE_SCENARIOS: HedgeScenario[] = [
  {
    name: "Airline Fuel Hedge",
    description: "Airline hedging jet fuel exposure using crude oil futures",
    company: "SkyLine Airways",
    commodity: "Crude Oil",
    exposure: 50_000_000,
    hedgeRatio: 0.75,
    spotPrice: CURVES[0].spot,
    contractSize: 1000,
    unit: "barrels",
    monthsAhead: 6,
    basisRisk: 1.2 + sv() * 0.8,
    color: "#3b82f6",
  },
  {
    name: "Gold Miner Hedge",
    description: "Gold mining company hedging production using gold futures",
    company: "Apex Mining Corp",
    commodity: "Gold",
    exposure: 30_000_000,
    hedgeRatio: 0.5,
    spotPrice: CURVES[1].spot,
    contractSize: 100,
    unit: "oz",
    monthsAhead: 12,
    basisRisk: 0.8 + sv() * 0.5,
    color: "#f59e0b",
  },
  {
    name: "Farmer Wheat Hedge",
    description: "Wheat farmer hedging harvest using CBOT wheat futures",
    company: "Heartland Farms",
    commodity: "Wheat",
    exposure: 2_000_000,
    hedgeRatio: 0.8,
    spotPrice: 580 + sv() * 40,
    contractSize: 5000,
    unit: "bushels",
    monthsAhead: 4,
    basisRisk: 8 + sv() * 5,
    color: "#10b981",
  },
];

function genSectorCommodity(
  name: string,
  ticker: string,
  price: number,
  unit: string
): SectorCommodity {
  const c1d = (sv() - 0.5) * 4;
  const c1w = (sv() - 0.5) * 8;
  const c1m = (sv() - 0.5) * 15;
  const ytd = (sv() - 0.45) * 30;
  return {
    name,
    ticker,
    price: parseFloat((price * (1 + (sv() - 0.5) * 0.02)).toFixed(2)),
    change1d: parseFloat(c1d.toFixed(2)),
    change1w: parseFloat(c1w.toFixed(2)),
    change1m: parseFloat(c1m.toFixed(2)),
    ytd: parseFloat(ytd.toFixed(2)),
    unit,
  };
}

const ENERGY_COMMODITIES: SectorCommodity[] = [
  genSectorCommodity("Crude Oil (WTI)", "CL", 78.5, "/bbl"),
  genSectorCommodity("Natural Gas", "NG", 2.2, "/MMBtu"),
  genSectorCommodity("RBOB Gasoline", "RB", 2.45, "/gal"),
];

const METALS_COMMODITIES: SectorCommodity[] = [
  genSectorCommodity("Gold", "GC", 2340, "/oz"),
  genSectorCommodity("Silver", "SI", 27.5, "/oz"),
  genSectorCommodity("Copper", "HG", 4.12, "/lb"),
];

const AGRI_COMMODITIES: SectorCommodity[] = [
  genSectorCommodity("Corn", "ZC", 450, "/bu"),
  genSectorCommodity("Wheat", "ZW", 585, "/bu"),
  genSectorCommodity("Soybeans", "ZS", 1180, "/bu"),
  genSectorCommodity("Sugar #11", "SB", 19.5, "/lb"),
];

const SUPPLY_DEMAND: SupplyDemandRow[] = [
  {
    commodity: "Crude Oil",
    supply: parseFloat((102 + sv() * 2).toFixed(1)),
    demand: parseFloat((101 + sv() * 2).toFixed(1)),
    stocksUse: parseFloat((26 + sv() * 4).toFixed(1)),
    trend: "balanced",
    keyDriver: "OPEC+ production cuts vs US shale growth",
  },
  {
    commodity: "Gold",
    supply: parseFloat((4950 + sv() * 200).toFixed(0)),
    demand: parseFloat((4800 + sv() * 200).toFixed(0)),
    stocksUse: parseFloat((90 + sv() * 10).toFixed(1)),
    trend: "tightening",
    keyDriver: "Central bank buying + ETF inflows",
  },
  {
    commodity: "Natural Gas",
    supply: parseFloat((108 + sv() * 4).toFixed(1)),
    demand: parseFloat((105 + sv() * 4).toFixed(1)),
    stocksUse: parseFloat((15 + sv() * 5).toFixed(1)),
    trend: "loosening",
    keyDriver: "Warm weather / record US LNG exports",
  },
  {
    commodity: "Wheat",
    supply: parseFloat((793 + sv() * 20).toFixed(0)),
    demand: parseFloat((800 + sv() * 20).toFixed(0)),
    stocksUse: parseFloat((33 + sv() * 5).toFixed(1)),
    trend: "tightening",
    keyDriver: "Black Sea disruptions, drought in Australia",
  },
  {
    commodity: "Corn",
    supply: parseFloat((1220 + sv() * 30).toFixed(0)),
    demand: parseFloat((1210 + sv() * 30).toFixed(0)),
    stocksUse: parseFloat((28 + sv() * 5).toFixed(1)),
    trend: "balanced",
    keyDriver: "South America record harvest vs China demand",
  },
];

const KEY_DRIVERS: Record<string, string[]> = {
  Energy: [
    "OPEC+ quota decisions & compliance",
    "US crude inventories (EIA weekly)",
    "China economic recovery pace",
    "Geopolitical risk premium (Middle East/Russia)",
    "Renewable energy substitution long-term",
  ],
  Metals: [
    "Fed rate path (real yields vs gold)",
    "USD strength / DXY index",
    "China infrastructure stimulus",
    "EV battery demand for copper & lithium",
    "Central bank gold reserve diversification",
  ],
  Agriculture: [
    "La Niña / El Niño weather patterns",
    "USDA WASDE report (monthly supply/demand)",
    "Ukraine/Russia grain export corridors",
    "Ethanol blending mandates (corn)",
    "USD strength affects export competitiveness",
  ],
};

// ── SVG Helpers ────────────────────────────────────────────────────────────────

function toSVGPath(points: [number, number][]): string {
  if (points.length === 0) return "";
  return points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
}

// ── Sub-components ─────────────────────────────────────────────────────────────

// ---- Futures Curve Tab -------------------------------------------------------

function FuturesCurveTab() {
  const [selectedCurve, setSelectedCurve] = useState(0);
  const curve = CURVES[selectedCurve];

  const allPrices = [curve.spot, ...curve.contracts.map((c) => c.price)];
  const minP = Math.min(...allPrices) * 0.985;
  const maxP = Math.max(...allPrices) * 1.015;
  const W = 480;
  const H = 200;
  const PAD = { l: 60, r: 20, t: 16, b: 36 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const toX = (i: number) => PAD.l + (i / 6) * innerW;
  const toY = (p: number) => PAD.t + ((maxP - p) / (maxP - minP)) * innerH;

  const points: [number, number][] = [[toX(0), toY(curve.spot)]];
  curve.contracts.forEach((c, i) => points.push([toX(i + 1), toY(c.price)]));

  const lineColor = curve.curveType === "contango" ? "#f97316" : "#10b981";

  const xLabels = [MONTHS[0], ...curve.contracts.map((c) => c.month)];

  // Forward yield lines
  const frontFwd = curve.contracts[0].price;
  const backFwd = curve.contracts[5].price;
  const rollYield = ((frontFwd - backFwd) / backFwd) * 100;

  return (
    <div className="space-y-4">
      {/* Curve selector */}
      <div className="flex gap-2">
        {CURVES.map((c, i) => (
          <Button
            key={c.ticker}
            variant={selectedCurve === i ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCurve(i)}
            className={selectedCurve === i ? "bg-primary text-primary-foreground" : ""}
          >
            {c.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Term Structure Chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              {curve.name} Forward Curve
              <Badge
                variant="outline"
                className={
                  curve.curveType === "contango"
                    ? "border-orange-500 text-orange-400"
                    : "border-emerald-500 text-emerald-400"
                }
              >
                {curve.curveType === "contango" ? "Contango" : "Backwardation"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ maxHeight: 220 }}
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                const y = PAD.t + f * innerH;
                const price = maxP - f * (maxP - minP);
                return (
                  <g key={f}>
                    <line
                      x1={PAD.l}
                      y1={y}
                      x2={W - PAD.r}
                      y2={y}
                      stroke="#27272a"
                      strokeWidth={1}
                    />
                    <text
                      x={PAD.l - 4}
                      y={y + 4}
                      textAnchor="end"
                      fontSize={10}
                      fill="#71717a"
                    >
                      {price > 100 ? price.toFixed(0) : price.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Filled area */}
              <defs>
                <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <path
                d={
                  toSVGPath(points) +
                  ` L${toX(6)},${PAD.t + innerH} L${toX(0)},${PAD.t + innerH} Z`
                }
                fill="url(#curveGrad)"
              />

              {/* Line */}
              <path
                d={toSVGPath(points)}
                fill="none"
                stroke={lineColor}
                strokeWidth={2.5}
                strokeLinejoin="round"
              />

              {/* Dots */}
              {points.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={4} fill={lineColor} stroke="#09090b" strokeWidth={2} />
              ))}

              {/* Price labels on dots */}
              {points.map(([x, y], i) => (
                <text
                  key={`lbl-${i}`}
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#e4e4e7"
                >
                  {allPrices[i] > 100
                    ? allPrices[i].toFixed(0)
                    : allPrices[i].toFixed(3)}
                </text>
              ))}

              {/* X-axis labels */}
              {xLabels.map((lbl, i) => (
                <text
                  key={`x-${i}`}
                  x={toX(i)}
                  y={H - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#71717a"
                >
                  {lbl}
                </text>
              ))}

              {/* Contango/Backwardation arrow annotation */}
              <text
                x={W / 2}
                y={PAD.t - 2}
                textAnchor="middle"
                fontSize={10}
                fill={lineColor}
                opacity={0.8}
              >
                {curve.curveType === "contango"
                  ? "↗ Upward slope: storage costs exceed convenience yield"
                  : "↘ Downward slope: high convenience yield (supply tightness)"}
              </text>
            </svg>

            {/* Contract table */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left py-1">Contract</th>
                    <th className="text-right py-1">Price</th>
                    <th className="text-right py-1">vs Spot</th>
                    <th className="text-right py-1">OI (K)</th>
                    <th className="text-right py-1">Vol (K)</th>
                  </tr>
                </thead>
                <tbody>
                  {curve.contracts.map((c) => {
                    const vsSpot = ((c.price - curve.spot) / curve.spot) * 100;
                    return (
                      <tr key={c.month} className="border-t border-border">
                        <td className="py-1 text-muted-foreground">{c.month}</td>
                        <td className="py-1 text-right font-mono text-foreground">
                          {c.price > 100 ? fmt(c.price, 2) : fmt(c.price, 3)}
                        </td>
                        <td className={`py-1 text-right font-mono ${pos(vsSpot)}`}>
                          {fmtPct(vsSpot)}
                        </td>
                        <td className="py-1 text-right text-muted-foreground">{c.oi}</td>
                        <td className="py-1 text-right text-muted-foreground">{c.vol}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Analytics panel */}
        <div className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                Roll & Yield Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Spot Price</span>
                <span className="text-sm font-mono font-semibold text-foreground">
                  ${curve.spot > 100 ? fmt(curve.spot, 2) : fmt(curve.spot, 3)}{" "}
                  <span className="text-xs text-muted-foreground">{curve.unit}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Roll Yield (ann.)</span>
                <span className={`text-sm font-mono font-semibold ${pos(rollYield)}`}>
                  {fmtPct(rollYield)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Convenience Yield</span>
                <span className="text-sm font-mono font-semibold text-amber-400">
                  {curve.convenienceYield.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Storage Cost (ann.)</span>
                <span className="text-sm font-mono text-muted-foreground">
                  {curve.storageCost.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Risk-Free Rate</span>
                <span className="text-sm font-mono text-muted-foreground">
                  {curve.riskFreeRate.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                Cost-of-Carry Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="font-mono bg-muted rounded p-2 text-center text-foreground">
                F = S × e<sup>(r+u-y)T</sup>
              </div>
              <p>Where:</p>
              <ul className="space-y-1 pl-2">
                <li>
                  <span className="text-muted-foreground">r</span> = risk-free rate (
                  {curve.riskFreeRate.toFixed(1)}%)
                </li>
                <li>
                  <span className="text-muted-foreground">u</span> = storage cost (
                  {curve.storageCost.toFixed(1)}%)
                </li>
                <li>
                  <span className="text-muted-foreground">y</span> = convenience yield (
                  {curve.convenienceYield.toFixed(1)}%)
                </li>
              </ul>
              <div className="mt-2 p-2 rounded bg-muted/50 text-muted-foreground">
                {curve.curveType === "contango" ? (
                  <span>
                    <span className="text-orange-400">Contango:</span> r+u &gt; y — holders
                    are compensated for storage
                  </span>
                ) : (
                  <span>
                    <span className="text-emerald-400">Backwardation:</span> y &gt; r+u —
                    immediate delivery commands premium
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---- Seasonality Tab ---------------------------------------------------------

function SeasonalityTab() {
  const [selectedComm, setSelectedComm] = useState(0);
  const comm = SEASONAL_COMMODITIES[selectedComm];

  const W = 480;
  const H = 200;
  const PAD = { l: 44, r: 16, t: 20, b: 36 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const minIdx = Math.min(...comm.monthlyIndex);
  const maxIdx = Math.max(...comm.monthlyIndex);
  const range = maxIdx - minIdx || 1;
  const barW = innerW / 12 - 4;

  const toBarX = (i: number) => PAD.l + (i / 12) * innerW + 2;
  const toBarH = (v: number) => ((v - 90) / (maxIdx - 90 + 5)) * innerH * 0.85;
  const baseY = PAD.t + innerH;

  return (
    <div className="space-y-4">
      {/* Selector */}
      <div className="flex flex-wrap gap-2">
        {SEASONAL_COMMODITIES.map((c, i) => (
          <Button
            key={c.ticker}
            variant={selectedComm === i ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedComm(i)}
            className={selectedComm === i ? "" : "border-border text-muted-foreground"}
          >
            {c.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              {comm.name} — Monthly Seasonal Index (avg = 100)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
              {/* Baseline 100 */}
              {(() => {
                const y100 = baseY - toBarH(100);
                return (
                  <line
                    x1={PAD.l}
                    y1={y100}
                    x2={W - PAD.r}
                    y2={y100}
                    stroke="#52525b"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                  />
                );
              })()}

              {/* Y label */}
              {[90, 100, 110, 120].map((v) => {
                const y = baseY - toBarH(v);
                if (y < PAD.t || y > PAD.t + innerH) return null;
                return (
                  <text key={v} x={PAD.l - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#71717a">
                    {v}
                  </text>
                );
              })}

              {/* Bars */}
              {comm.monthlyIndex.map((v, i) => {
                const x = toBarX(i);
                const bh = Math.max(toBarH(v), 2);
                const y = baseY - bh;
                const isBest = i === comm.bestMonth;
                const isWorst = i === comm.worstMonth;
                const fill = isBest
                  ? "#10b981"
                  : isWorst
                  ? "#ef4444"
                  : comm.color;
                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={bh}
                      fill={fill}
                      opacity={isBest || isWorst ? 1 : 0.65}
                      rx={2}
                    />
                    <text
                      x={x + barW / 2}
                      y={y - 3}
                      textAnchor="middle"
                      fontSize={8}
                      fill={isBest ? "#10b981" : isWorst ? "#ef4444" : "#a1a1aa"}
                    >
                      {v.toFixed(0)}
                    </text>
                    <text
                      x={x + barW / 2}
                      y={H - 4}
                      textAnchor="middle"
                      fontSize={9}
                      fill="#71717a"
                    >
                      {SEASONAL_MONTHS[i]}
                    </text>
                    {isBest && (
                      <text
                        x={x + barW / 2}
                        y={y - 13}
                        textAnchor="middle"
                        fontSize={9}
                        fill="#10b981"
                      >
                        BEST
                      </text>
                    )}
                    {isWorst && (
                      <text
                        x={x + barW / 2}
                        y={y - 13}
                        textAnchor="middle"
                        fontSize={9}
                        fill="#ef4444"
                      >
                        WORST
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </CardContent>
        </Card>

        {/* Stats panel */}
        <div className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                Pattern Strength
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Seasonal Strength</span>
                <span className="text-foreground font-medium">{comm.patternStrength}%</span>
              </div>
              <Progress value={comm.patternStrength} className="h-2" />

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-emerald-950/40 border border-emerald-800 rounded p-2">
                  <p className="text-xs text-muted-foreground">Best Month</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {SEASONAL_MONTHS[comm.bestMonth]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Index: {comm.monthlyIndex[comm.bestMonth].toFixed(1)}
                  </p>
                </div>
                <div className="bg-red-950/40 border border-red-800 rounded p-2">
                  <p className="text-xs text-muted-foreground">Worst Month</p>
                  <p className="text-sm font-bold text-red-400">
                    {SEASONAL_MONTHS[comm.worstMonth]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Index: {comm.monthlyIndex[comm.worstMonth].toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak-to-Trough</span>
                  <span className="text-foreground">
                    {(maxIdx - minIdx).toFixed(1)} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Range</span>
                  <span className="text-foreground">
                    {((range / 100) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                All Commodities Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {SEASONAL_COMMODITIES.map((c) => (
                <div key={c.ticker} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: c.color }}
                  />
                  <span className="text-xs text-muted-foreground flex-1">{c.name}</span>
                  <div className="flex items-center gap-1">
                    <Progress value={c.patternStrength} className="h-1 w-16" />
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {c.patternStrength}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---- Hedging Tab -------------------------------------------------------------

function HedgingTab() {
  const [selectedHedge, setSelectedHedge] = useState(0);
  const [hedgeRatio, setHedgeRatio] = useState(
    BASE_HEDGE_SCENARIOS[0].hedgeRatio * 100
  );
  const [priceMove, setPriceMove] = useState(0); // percent

  const scenario = BASE_HEDGE_SCENARIOS[selectedHedge];

  const effectiveHedgeRatio = hedgeRatio / 100;

  // Derived calculations
  const unitsExposed = scenario.exposure / scenario.spotPrice;
  const contractsNeeded = Math.round(
    (unitsExposed * effectiveHedgeRatio) / scenario.contractSize
  );

  const futurePriceChange = scenario.spotPrice * (1 + priceMove / 100);
  const spotPnL = (futurePriceChange - scenario.spotPrice) * unitsExposed;

  // Hedged PnL: futures position offsets, minus basis risk
  const hedgedFuturesPnL =
    -(futurePriceChange - scenario.spotPrice) *
    contractsNeeded *
    scenario.contractSize;
  const basisLoss =
    scenario.basisRisk * contractsNeeded * scenario.contractSize * 0.01;

  const totalUnhedgedPnL = spotPnL;
  const totalHedgedPnL = spotPnL + hedgedFuturesPnL - basisLoss;

  // SVG comparison chart
  const W = 380;
  const H = 180;
  const PAD = { l: 60, r: 20, t: 20, b: 36 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const moves = [-20, -15, -10, -5, 0, 5, 10, 15, 20];
  const unhedgedLine: [number, number][] = moves.map((m, i) => {
    const pnl = (scenario.spotPrice * (m / 100)) * unitsExposed;
    return [i, pnl];
  });
  const hedgedLine: [number, number][] = moves.map((m, i) => {
    const sp = scenario.spotPrice * (1 + m / 100);
    const sPnL = (sp - scenario.spotPrice) * unitsExposed;
    const fPnL =
      -(sp - scenario.spotPrice) * contractsNeeded * scenario.contractSize;
    return [i, sPnL + fPnL - basisLoss];
  });

  const allPnLs = [...unhedgedLine.map(([, y]) => y), ...hedgedLine.map(([, y]) => y)];
  const minPnL = Math.min(...allPnLs);
  const maxPnL = Math.max(...allPnLs);
  const pnlRange = maxPnL - minPnL || 1;

  const toSX = (i: number) => PAD.l + (i / (moves.length - 1)) * innerW;
  const toSY = (pnl: number) =>
    PAD.t + ((maxPnL - pnl) / pnlRange) * innerH;

  const uPoints: [number, number][] = unhedgedLine.map(([i, pnl]) => [toSX(i), toSY(pnl)]);
  const hPoints: [number, number][] = hedgedLine.map(([i, pnl]) => [toSX(i), toSY(pnl)]);

  // Zero line
  const zeroY = toSY(0);

  const fmtMoney = (n: number) => {
    const abs = Math.abs(n);
    const sign = n < 0 ? "-" : "+";
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
    return `${sign}$${abs.toFixed(0)}`;
  };

  return (
    <div className="space-y-4">
      {/* Scenario selector */}
      <div className="flex flex-wrap gap-2">
        {BASE_HEDGE_SCENARIOS.map((sc, i) => (
          <Button
            key={i}
            variant={selectedHedge === i ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedHedge(i);
              setHedgeRatio(sc.hedgeRatio * 100);
              setPriceMove(0);
            }}
            className={selectedHedge === i ? "" : "border-border text-muted-foreground"}
          >
            {sc.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Controls + Chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              {scenario.name}
              <span className="text-xs text-muted-foreground font-normal">
                — {scenario.company}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">{scenario.description}</p>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Hedge Ratio</span>
                  <span className="text-foreground font-medium">
                    {hedgeRatio.toFixed(0)}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[hedgeRatio]}
                  onValueChange={([v]) => setHedgeRatio(v)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Price Move</span>
                  <span className={`font-medium text-xs ${pos(priceMove)}`}>
                    {fmtPct(priceMove)}
                  </span>
                </div>
                <Slider
                  min={-20}
                  max={20}
                  step={1}
                  value={[priceMove]}
                  onValueChange={([v]) => setPriceMove(v)}
                />
              </div>
            </div>

            {/* P&L Comparison SVG */}
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
              {/* Grid */}
              <line
                x1={PAD.l}
                y1={zeroY}
                x2={W - PAD.r}
                y2={zeroY}
                stroke="#52525b"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              {[-20, -10, 0, 10, 20].map((pct, i) => {
                const x = toSX(moves.indexOf(pct));
                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={PAD.t}
                      x2={x}
                      y2={PAD.t + innerH}
                      stroke="#27272a"
                      strokeWidth={1}
                    />
                    <text x={x} y={H - 4} textAnchor="middle" fontSize={9} fill="#71717a">
                      {pct > 0 ? `+${pct}%` : `${pct}%`}
                    </text>
                  </g>
                );
              })}

              {/* Y labels */}
              {[minPnL, 0, maxPnL].map((pnl) => (
                <text
                  key={pnl}
                  x={PAD.l - 4}
                  y={toSY(pnl) + 4}
                  textAnchor="end"
                  fontSize={8}
                  fill="#71717a"
                >
                  {fmtMoney(pnl)}
                </text>
              ))}

              {/* Unhedged line */}
              <path
                d={toSVGPath(uPoints)}
                fill="none"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 3"
              />
              {/* Hedged line */}
              <path
                d={toSVGPath(hPoints)}
                fill="none"
                stroke="#10b981"
                strokeWidth={2.5}
              />

              {/* Current price move dot */}
              {(() => {
                const moveIdx = moves.indexOf(Math.round(priceMove / 5) * 5);
                if (moveIdx < 0) return null;
                return (
                  <g>
                    <circle cx={uPoints[moveIdx][0]} cy={uPoints[moveIdx][1]} r={5} fill="#ef4444" />
                    <circle cx={hPoints[moveIdx][0]} cy={hPoints[moveIdx][1]} r={5} fill="#10b981" />
                  </g>
                );
              })()}

              {/* Legend */}
              <g>
                <line x1={PAD.l + 5} y1={PAD.t + 8} x2={PAD.l + 20} y2={PAD.t + 8} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 3" />
                <text x={PAD.l + 24} y={PAD.t + 12} fontSize={9} fill="#ef4444">Unhedged</text>
                <line x1={PAD.l + 80} y1={PAD.t + 8} x2={PAD.l + 95} y2={PAD.t + 8} stroke="#10b981" strokeWidth={2.5} />
                <text x={PAD.l + 99} y={PAD.t + 12} fontSize={9} fill="#10b981">Hedged</text>
              </g>
            </svg>

            {/* Current scenario P&L */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-950/30 border border-red-800/50 rounded p-3">
                <p className="text-xs text-muted-foreground">Unhedged P&amp;L</p>
                <p className={`text-lg font-medium font-mono ${pos(totalUnhedgedPnL)}`}>
                  {fmtMoney(totalUnhedgedPnL)}
                </p>
                <p className="text-xs text-muted-foreground">at {fmtPct(priceMove)} price move</p>
              </div>
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded p-3">
                <p className="text-xs text-muted-foreground">Hedged P&amp;L</p>
                <p className={`text-lg font-medium font-mono ${pos(totalHedgedPnL)}`}>
                  {fmtMoney(totalHedgedPnL)}
                </p>
                <p className="text-xs text-muted-foreground">incl. basis risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hedge details */}
        <div className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Calculator className="w-3 h-3" />
                Hedge Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commodity Exposure</span>
                <span className="text-foreground font-mono">
                  ${(scenario.exposure / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Units Exposed</span>
                <span className="text-foreground font-mono">
                  {unitsExposed.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hedge Ratio</span>
                <span className="text-amber-400 font-medium">
                  {(effectiveHedgeRatio * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contract Size</span>
                <span className="text-foreground font-mono">
                  {scenario.contractSize.toLocaleString()} {scenario.unit}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-1">
                <span className="text-muted-foreground font-medium">Contracts Needed</span>
                <span className="text-primary font-medium">{contractsNeeded}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Basis Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-muted-foreground">
                Basis = Spot Price − Futures Price. Imperfect hedge creates residual
                risk.
              </p>
              <div className="flex justify-between mt-2">
                <span className="text-muted-foreground">Basis Risk / Unit</span>
                <span className="text-amber-400 font-mono">
                  ${scenario.basisRisk.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Basis Cost</span>
                <span className="text-amber-400 font-mono">
                  {fmtMoney(basisLoss)}
                </span>
              </div>
              <div className="mt-2 p-2 bg-amber-950/30 border border-amber-800/40 rounded text-muted-foreground">
                Basis risk remains even with a perfect hedge ratio — arises from
                location, quality, and timing differences.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---- Sectors Tab -------------------------------------------------------------

function SectorsTab() {
  const [activeSector, setActiveSector] = useState<"Energy" | "Metals" | "Agriculture">(
    "Energy"
  );

  const sectorMap: Record<string, SectorCommodity[]> = {
    Energy: ENERGY_COMMODITIES,
    Metals: METALS_COMMODITIES,
    Agriculture: AGRI_COMMODITIES,
  };

  const sectorIcons: Record<string, React.ReactNode> = {
    Energy: <Flame className="w-4 h-4 text-orange-400" />,
    Metals: <Gem className="w-4 h-4 text-yellow-400" />,
    Agriculture: <Leaf className="w-4 h-4 text-green-400" />,
  };

  const commodities = sectorMap[activeSector];

  // Performance bar chart SVG
  const W = 480;
  const H = 180;
  const PAD = { l: 100, r: 60, t: 20, b: 16 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const barH = Math.floor(innerH / commodities.length) - 6;

  const ytds = commodities.map((c) => c.ytd);
  const maxAbs = Math.max(...ytds.map(Math.abs), 5);
  const zeroX = PAD.l + (innerW / 2);

  const toBarW = (v: number) => (Math.abs(v) / maxAbs) * (innerW / 2);
  const toBarX = (v: number) => (v >= 0 ? zeroX : zeroX - toBarW(v));

  return (
    <div className="space-y-4">
      {/* Sector tabs */}
      <div className="flex gap-2">
        {(["Energy", "Metals", "Agriculture"] as const).map((sec) => (
          <Button
            key={sec}
            variant={activeSector === sec ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSector(sec)}
            className={
              activeSector === sec ? "" : "border-border text-muted-foreground"
            }
          >
            {sectorIcons[sec]}
            <span className="ml-1">{sec}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* YTD Performance SVG */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {activeSector} — YTD Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
              {/* Zero line */}
              <line
                x1={zeroX}
                y1={PAD.t}
                x2={zeroX}
                y2={PAD.t + innerH}
                stroke="#52525b"
                strokeWidth={1}
              />

              {commodities.map((c, i) => {
                const rowY =
                  PAD.t + i * ((innerH) / commodities.length) + 4;
                const bw = toBarW(c.ytd);
                const bx = toBarX(c.ytd);
                const fill = c.ytd >= 0 ? "#10b981" : "#ef4444";

                return (
                  <g key={c.ticker}>
                    <text
                      x={PAD.l - 4}
                      y={rowY + barH / 2 + 4}
                      textAnchor="end"
                      fontSize={11}
                      fill="#d4d4d8"
                    >
                      {c.ticker}
                    </text>
                    <rect
                      x={bx}
                      y={rowY}
                      width={Math.max(bw, 2)}
                      height={barH}
                      fill={fill}
                      opacity={0.8}
                      rx={2}
                    />
                    <text
                      x={c.ytd >= 0 ? bx + bw + 4 : bx - 4}
                      y={rowY + barH / 2 + 4}
                      textAnchor={c.ytd >= 0 ? "start" : "end"}
                      fontSize={10}
                      fill={fill}
                    >
                      {fmtPct(c.ytd)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </CardContent>
        </Card>

        {/* Price table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Price Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left py-1">Commodity</th>
                  <th className="text-right py-1">Price</th>
                  <th className="text-right py-1">1D</th>
                  <th className="text-right py-1">1W</th>
                  <th className="text-right py-1">1M</th>
                  <th className="text-right py-1">YTD</th>
                </tr>
              </thead>
              <tbody>
                {commodities.map((c) => (
                  <tr key={c.ticker} className="border-t border-border">
                    <td className="py-1.5">
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">{c.name}</span>
                        <span className="text-muted-foreground text-xs">{c.ticker}</span>
                      </div>
                    </td>
                    <td className="py-1.5 text-right font-mono text-foreground">
                      ${c.price > 100 ? fmt(c.price, 2) : fmt(c.price, 2)}
                      <div className="text-xs text-muted-foreground">{c.unit}</div>
                    </td>
                    <td className={`py-1.5 text-right font-mono ${pos(c.change1d)}`}>
                      {fmtPct(c.change1d)}
                    </td>
                    <td className={`py-1.5 text-right font-mono ${pos(c.change1w)}`}>
                      {fmtPct(c.change1w)}
                    </td>
                    <td className={`py-1.5 text-right font-mono ${pos(c.change1m)}`}>
                      {fmtPct(c.change1m)}
                    </td>
                    <td className={`py-1.5 text-right font-mono ${pos(c.ytd)}`}>
                      {fmtPct(c.ytd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Supply/Demand table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Supply / Demand Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left py-1">Commodity</th>
                  <th className="text-right py-1">Supply</th>
                  <th className="text-right py-1">Demand</th>
                  <th className="text-right py-1">Stks/Use</th>
                  <th className="text-right py-1">Trend</th>
                </tr>
              </thead>
              <tbody>
                {SUPPLY_DEMAND.map((row) => (
                  <tr key={row.commodity} className="border-t border-border">
                    <td className="py-1.5 text-foreground font-medium">{row.commodity}</td>
                    <td className="py-1.5 text-right font-mono text-muted-foreground">
                      {row.supply.toLocaleString()}
                    </td>
                    <td className="py-1.5 text-right font-mono text-muted-foreground">
                      {row.demand.toLocaleString()}
                    </td>
                    <td className="py-1.5 text-right font-mono text-muted-foreground">
                      {row.stocksUse}%
                    </td>
                    <td className="py-1.5 text-right">
                      <Badge
                        variant="outline"
                        className={
                          row.trend === "tightening"
                            ? "border-red-500 text-red-400 text-xs"
                            : row.trend === "loosening"
                            ? "border-emerald-500 text-emerald-400 text-xs"
                            : "border-muted-foreground text-muted-foreground text-xs"
                        }
                      >
                        {row.trend}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Key price drivers */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Key Price Drivers — {activeSector}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {KEY_DRIVERS[activeSector].map((driver, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-medium mt-0.5">{i + 1}.</span>
                  <span className="text-muted-foreground">{driver}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Stocks-to-Use Interpretation
              </p>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-muted-foreground">&lt;15% = Tight</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-muted-foreground">15–25% = Normal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-muted-foreground">&gt;25% = Ample</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CommoditiesFuturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      {/* HERO Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-primary rounded-md bg-card p-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary" />
            Commodities Futures
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Energy · Metals · Agriculture — term structure, seasonality, hedging
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CURVES.map((c) => (
            <Badge
              key={c.ticker}
              variant="outline"
              className={
                c.curveType === "contango"
                  ? "border-orange-500/60 text-orange-300"
                  : "border-emerald-500/60 text-emerald-300"
              }
            >
              {c.ticker}{" "}
              <span className="ml-1 font-mono">
                ${c.spot > 100 ? c.spot.toFixed(2) : c.spot.toFixed(3)}
              </span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="curve" className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="curve" className="data-[state=active]:bg-muted">
            Futures Curve
          </TabsTrigger>
          <TabsTrigger value="seasonality" className="data-[state=active]:bg-muted">
            Seasonality
          </TabsTrigger>
          <TabsTrigger value="hedging" className="data-[state=active]:bg-muted">
            Hedging
          </TabsTrigger>
          <TabsTrigger value="sectors" className="data-[state=active]:bg-muted">
            Sectors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curve" className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key="curve"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <FuturesCurveTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="seasonality" className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key="seasonality"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SeasonalityTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="hedging" className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key="hedging"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <HedgingTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="sectors" className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key="sectors"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SectorsTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
