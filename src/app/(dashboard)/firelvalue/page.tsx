"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Target,
  ArrowLeftRight,
  Layers,
  RefreshCw,
  Info,
  Calculator,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 813;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 813;
}

function randBetween(lo: number, hi: number): number {
  return lo + rand() * (hi - lo);
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Bond {
  cusip: string;
  label: string;
  maturity: string;
  coupon: number;
  yieldPct: number;
  dv01: number;
  duration: number;
  convexity: number;
  otr: boolean;
  spread: number;
  bidAsk: number;
  outstanding: number; // billions
}

interface SpreadTrade {
  long: Bond;
  short: Bond;
  hedgeRatio: number;
  spreadBps: number;
  pnl: number;
}

interface ButterflyTrade {
  belly: YieldPoint;
  shortWing: YieldPoint;
  longWing: YieldPoint;
  bodyWeight: number;
  netDV01: number;
  netConvexity: number;
  spreadBps: number;
  pnl: number;
}

interface SwapSpread {
  tenor: string;
  treasuryYield: number;
  swapRate: number;
  assetSwapSpread: number;
  zSpread: number;
  libSpread: number;
  carryBps: number;
}

interface YieldPoint {
  tenor: string;
  years: number;
  yield: number;
  dv01: number;
  convexity?: number;
}

interface ShiftScenario {
  label: string;
  type: "parallel" | "twist" | "butterfly";
  parallelBps: number;
  twistBps: number;
  butterflyBps: number;
}

// ── Static data generation ────────────────────────────────────────────────────

function generateYieldCurve(): YieldPoint[] {
  resetSeed();
  const base2 = 4.82 + randBetween(-0.1, 0.1);
  const base5 = 4.51 + randBetween(-0.08, 0.08);
  const base10 = 4.38 + randBetween(-0.06, 0.06);
  const base30 = 4.55 + randBetween(-0.05, 0.05);
  return [
    { tenor: "2Y", years: 2, yield: base2, dv01: 1.87 },
    { tenor: "5Y", years: 5, yield: base5, dv01: 4.45 },
    { tenor: "10Y", years: 10, yield: base10, dv01: 8.12 },
    { tenor: "30Y", years: 30, yield: base30, dv01: 19.84 },
  ];
}

function generateOTRBonds(): Bond[] {
  resetSeed();
  return [
    {
      cusip: "912828YW6",
      label: "T 4.875 02/28",
      maturity: "2028-02-28",
      coupon: 4.875,
      yieldPct: 4.512 + randBetween(-0.02, 0.02),
      dv01: 4.41,
      duration: 4.43,
      convexity: 0.224,
      otr: true,
      spread: 0,
      bidAsk: 0.5,
      outstanding: 68.4,
    },
    {
      cusip: "91282CJK8",
      label: "T 4.625 02/26",
      maturity: "2026-02-28",
      coupon: 4.625,
      yieldPct: 4.721 + randBetween(-0.02, 0.02),
      dv01: 1.84,
      duration: 1.9,
      convexity: 0.042,
      otr: true,
      spread: 0,
      bidAsk: 0.25,
      outstanding: 52.1,
    },
    {
      cusip: "912810TW8",
      label: "T 4.750 11/53",
      maturity: "2053-11-15",
      coupon: 4.75,
      yieldPct: 4.618 + randBetween(-0.015, 0.015),
      dv01: 19.72,
      duration: 19.88,
      convexity: 4.821,
      otr: true,
      spread: 0,
      bidAsk: 1.0,
      outstanding: 43.7,
    },
  ];
}

function generateOFRBonds(): Bond[] {
  resetSeed();
  rand(); rand(); rand(); rand(); rand(); rand();
  return [
    {
      cusip: "912828SY3",
      label: "T 2.875 05/28",
      maturity: "2028-05-31",
      coupon: 2.875,
      yieldPct: 4.541 + randBetween(-0.02, 0.02),
      dv01: 4.38,
      duration: 4.39,
      convexity: 0.219,
      otr: false,
      spread: 2.9 + randBetween(-0.5, 0.5),
      bidAsk: 1.0,
      outstanding: 31.2,
    },
    {
      cusip: "912828Q37",
      label: "T 2.125 02/26",
      maturity: "2026-02-15",
      coupon: 2.125,
      yieldPct: 4.748 + randBetween(-0.02, 0.02),
      dv01: 1.82,
      duration: 1.88,
      convexity: 0.039,
      otr: false,
      spread: 2.7 + randBetween(-0.4, 0.4),
      bidAsk: 0.75,
      outstanding: 28.6,
    },
    {
      cusip: "912810RZ3",
      label: "T 3.000 08/52",
      maturity: "2052-08-15",
      coupon: 3.0,
      yieldPct: 4.641 + randBetween(-0.015, 0.015),
      dv01: 19.51,
      duration: 19.64,
      convexity: 4.793,
      otr: false,
      spread: 2.3 + randBetween(-0.3, 0.3),
      bidAsk: 1.5,
      outstanding: 22.1,
    },
  ];
}

function generateSwapSpreads(): SwapSpread[] {
  resetSeed();
  for (let i = 0; i < 12; i++) rand();
  const tenors = ["2Y", "3Y", "5Y", "7Y", "10Y", "20Y", "30Y"];
  const treas = [4.72, 4.60, 4.51, 4.44, 4.38, 4.48, 4.55];
  return tenors.map((tenor, i) => {
    const asw = randBetween(18, 38) + (i > 3 ? -randBetween(5, 15) : 0);
    const zsp = asw + randBetween(-4, 4);
    const swapRate = treas[i] - asw / 100;
    return {
      tenor,
      treasuryYield: treas[i] + randBetween(-0.05, 0.05),
      swapRate,
      assetSwapSpread: asw,
      zSpread: zsp,
      libSpread: randBetween(8, 22),
      carryBps: randBetween(1.5, 6.5),
    };
  });
}

function generateHistoricalSpreads(length: number): number[] {
  resetSeed();
  for (let i = 0; i < 20; i++) rand();
  let val = 2.8 + randBetween(-0.3, 0.3);
  return Array.from({ length }, () => {
    val += randBetween(-0.4, 0.4);
    val = Math.max(0.5, Math.min(8, val));
    return val;
  });
}

// ── Utility math ──────────────────────────────────────────────────────────────

function calcPnL(dv01: number, bpsChange: number, notional: number): number {
  // DV01 is per $1M face; notional in millions
  return dv01 * bpsChange * (notional / 1000000);
}

function calcHedgeRatio(dv01Long: number, dv01Short: number): number {
  return dv01Long / dv01Short;
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

function toSVGCoords(
  value: number,
  minVal: number,
  maxVal: number,
  minPx: number,
  maxPx: number,
): number {
  const pct = (value - minVal) / (maxVal - minVal);
  return minPx + pct * (maxPx - minPx);
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatChipProps {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}
function StatChip({ label, value, color = "text-white", sub }: StatChipProps) {
  return (
    <div className="flex flex-col items-center bg-white/5 rounded-lg px-3 py-2 min-w-[80px]">
      <span className="text-[10px] text-zinc-400 uppercase tracking-wide">{label}</span>
      <span className={cn("text-sm font-semibold", color)}>{value}</span>
      {sub && <span className="text-[10px] text-zinc-500">{sub}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1: Yield Curve
// ─────────────────────────────────────────────────────────────────────────────

function YieldCurveTab() {
  const curve = useMemo(() => generateYieldCurve(), []);

  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [tradeType, setTradeType] = useState<"steepener" | "flattener">("steepener");
  const [shortLeg, setShortLeg] = useState(0); // index into curve
  const [longLeg, setLongLeg] = useState(2);
  const [notionalMM, setNotionalMM] = useState(10);
  const [showScenarios, setShowScenarios] = useState(false);

  const scenarios: ShiftScenario[] = [
    { label: "Bull Flatten", type: "twist", parallelBps: -25, twistBps: -15, butterflyBps: 0 },
    { label: "Bear Steepen", type: "twist", parallelBps: 25, twistBps: 20, butterflyBps: 0 },
    { label: "Bull Parallel", type: "parallel", parallelBps: -25, twistBps: 0, butterflyBps: 0 },
    { label: "Bear Parallel", type: "parallel", parallelBps: 25, twistBps: 0, butterflyBps: 0 },
    { label: "Positive Butterfly", type: "butterfly", parallelBps: 0, twistBps: 0, butterflyBps: 10 },
    { label: "Negative Butterfly", type: "butterfly", parallelBps: 0, twistBps: 0, butterflyBps: -10 },
  ];

  const spreadBps = useMemo(() => {
    const lo = curve[shortLeg];
    const hi = curve[longLeg];
    if (!lo || !hi) return 0;
    return Math.abs(hi.yield - lo.yield) * 100;
  }, [curve, shortLeg, longLeg]);

  const hedgeRatio = useMemo(() => {
    const lo = curve[shortLeg];
    const hi = curve[longLeg];
    if (!lo || !hi) return 1;
    return calcHedgeRatio(hi.dv01, lo.dv01);
  }, [curve, shortLeg, longLeg]);

  const calcScenarioPnL = useCallback(
    (scenario: ShiftScenario): number => {
      const lo = curve[shortLeg];
      const hi = curve[longLeg];
      if (!lo || !hi) return 0;
      const notional = notionalMM * 1e6;
      // twist: long end moves by parallelBps + twistBps, short end by parallelBps - twistBps
      let shortShift = scenario.parallelBps;
      let longShift = scenario.parallelBps;
      if (scenario.type === "twist") {
        const ratio = hi.years / (hi.years - lo.years);
        longShift += scenario.twistBps * ratio;
        shortShift -= scenario.twistBps * (1 - ratio);
      } else if (scenario.type === "butterfly") {
        const midYears = (lo.years + hi.years) / 2;
        longShift += scenario.butterflyBps * (hi.years / midYears);
        shortShift -= scenario.butterflyBps * (lo.years / midYears);
      }
      // P&L: long leg gains when yield falls; short leg gains when yield rises
      const longPnL = -hi.dv01 * longShift * (notional / 1e6);
      const shortPnL = lo.dv01 * shortShift * (notional / 1e6) * hedgeRatio;
      return longPnL + shortPnL;
    },
    [curve, shortLeg, longLeg, notionalMM, hedgeRatio],
  );

  // SVG yield curve drawing
  const svgW = 480;
  const svgH = 200;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;

  const minYield = Math.min(...curve.map((p) => p.yield)) - 0.15;
  const maxYield = Math.max(...curve.map((p) => p.yield)) + 0.15;
  const maxYears = 32;

  const pts = curve.map((p) => ({
    cx: toSVGCoords(p.years, 0, maxYears, padL, svgW - padR),
    cy: toSVGCoords(p.yield, minYield, maxYield, svgH - padB, padT),
    ...p,
  }));

  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.cx} ${p.cy}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${pts[pts.length - 1].cx} ${svgH - padB}` +
    ` L ${pts[0].cx} ${svgH - padB} Z`;

  const yLabels = [minYield, (minYield + maxYield) / 2, maxYield].map((y) => ({
    val: y.toFixed(2) + "%",
    cy: toSVGCoords(y, minYield, maxYield, svgH - padB, padT),
  }));

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {curve.map((p) => (
          <StatChip
            key={p.tenor}
            label={p.tenor}
            value={p.yield.toFixed(2) + "%"}
            color={
              p.yield < curve[0].yield ? "text-emerald-400" : "text-amber-400"
            }
            sub={`DV01 $${p.dv01.toFixed(2)}`}
          />
        ))}
        <StatChip
          label="2s10s"
          value={((curve[2].yield - curve[0].yield) * 100).toFixed(1) + " bps"}
          color={
            curve[2].yield - curve[0].yield >= 0
              ? "text-emerald-400"
              : "text-red-400"
          }
        />
        <StatChip
          label="2s30s"
          value={((curve[3].yield - curve[0].yield) * 100).toFixed(1) + " bps"}
          color="text-violet-400"
        />
      </div>

      {/* Yield Curve SVG */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            US Treasury Yield Curve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full"
            style={{ height: 200 }}
          >
            {/* Grid */}
            {yLabels.map((yl, i) => (
              <g key={i}>
                <line
                  x1={padL}
                  x2={svgW - padR}
                  y1={yl.cy}
                  y2={yl.cy}
                  stroke="#3f3f46"
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                />
                <text
                  x={padL - 4}
                  y={yl.cy + 4}
                  fontSize={9}
                  fill="#71717a"
                  textAnchor="end"
                >
                  {yl.val}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {pts.map((p) => (
              <text
                key={p.tenor}
                x={p.cx}
                y={svgH - padB + 14}
                fontSize={9}
                fill="#71717a"
                textAnchor="middle"
              >
                {p.tenor}
              </text>
            ))}

            {/* Area fill */}
            <path d={areaD} fill="url(#curveFill)" opacity={0.3} />

            {/* Curve line */}
            <path
              d={pathD}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeLinejoin="round"
            />

            {/* Nodes */}
            {pts.map((p, i) => (
              <g key={p.tenor} onClick={() => setSelectedNode(i === selectedNode ? null : i)}>
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={selectedNode === i ? 7 : 5}
                  fill={selectedNode === i ? "#60a5fa" : "#1d4ed8"}
                  stroke="#93c5fd"
                  strokeWidth={1.5}
                  className="cursor-pointer"
                />
                {selectedNode === i && (
                  <text
                    x={p.cx}
                    y={p.cy - 10}
                    fontSize={9}
                    fill="#93c5fd"
                    textAnchor="middle"
                  >
                    {p.yield.toFixed(3)}%
                  </text>
                )}
              </g>
            ))}

            <defs>
              <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>

          {selectedNode !== null && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 bg-blue-950/40 border border-blue-800/40 rounded-lg p-3 grid grid-cols-4 gap-3"
            >
              <div>
                <p className="text-[10px] text-zinc-400">Tenor</p>
                <p className="text-sm font-semibold text-white">{curve[selectedNode].tenor}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400">Yield</p>
                <p className="text-sm font-semibold text-blue-300">
                  {curve[selectedNode].yield.toFixed(3)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400">DV01 / $1M</p>
                <p className="text-sm font-semibold text-white">
                  ${curve[selectedNode].dv01.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400">Duration</p>
                <p className="text-sm font-semibold text-white">
                  {curve[selectedNode].years.toFixed(1)}y
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Trade Builder */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-violet-400" />
            Curve Trade Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {(["steepener", "flattener"] as const).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={tradeType === t ? "default" : "outline"}
                className={cn(
                  "capitalize text-xs",
                  tradeType === t
                    ? "bg-violet-600 hover:bg-violet-700 text-white"
                    : "border-zinc-700 text-zinc-400 hover:bg-zinc-800",
                )}
                onClick={() => setTradeType(t)}
              >
                {t}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Short Leg</label>
              <div className="flex flex-col gap-1">
                {curve.map((p, i) => (
                  <button
                    key={p.tenor}
                    onClick={() => setShortLeg(i)}
                    className={cn(
                      "text-left px-3 py-1.5 rounded text-xs border transition-colors",
                      shortLeg === i
                        ? "bg-red-900/40 border-red-700 text-red-300"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500",
                    )}
                  >
                    {p.tenor} — {p.yield.toFixed(3)}%
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Long Leg</label>
              <div className="flex flex-col gap-1">
                {curve.map((p, i) => (
                  <button
                    key={p.tenor}
                    onClick={() => setLongLeg(i)}
                    className={cn(
                      "text-left px-3 py-1.5 rounded text-xs border transition-colors",
                      longLeg === i
                        ? "bg-emerald-900/40 border-emerald-700 text-emerald-300"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500",
                    )}
                  >
                    {p.tenor} — {p.yield.toFixed(3)}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-2">
              Notional: <span className="text-white font-medium">${notionalMM}M</span>
            </label>
            <Slider
              value={[notionalMM]}
              onValueChange={(v) => setNotionalMM(v[0])}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 bg-zinc-800/60 rounded-lg p-3">
            <div>
              <p className="text-[10px] text-zinc-400">Spread</p>
              <p className="text-sm font-semibold text-amber-300">{spreadBps.toFixed(1)} bps</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">Hedge Ratio</p>
              <p className="text-sm font-semibold text-white">{hedgeRatio.toFixed(3)}x</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">DV01 Neutral</p>
              <p className="text-sm font-semibold text-emerald-400">
                ${(curve[longLeg]?.dv01 ?? 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Scenario P&L */}
          <button
            onClick={() => setShowScenarios(!showScenarios)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {showScenarios ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            Scenario P&amp;L Analysis
          </button>

          <AnimatePresence>
            {showScenarios && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5">
                  {scenarios.map((sc) => {
                    const pnl = calcScenarioPnL(sc);
                    return (
                      <div
                        key={sc.label}
                        className="flex items-center justify-between bg-zinc-800/50 rounded px-3 py-2"
                      >
                        <div>
                          <p className="text-xs text-zinc-300">{sc.label}</p>
                          <p className="text-[10px] text-zinc-500">
                            {sc.parallelBps !== 0 && `${sc.parallelBps > 0 ? "+" : ""}${sc.parallelBps}bps parallel`}
                            {sc.twistBps !== 0 && ` ${sc.twistBps > 0 ? "+" : ""}${sc.twistBps}bps twist`}
                            {sc.butterflyBps !== 0 && ` ${sc.butterflyBps > 0 ? "+" : ""}${sc.butterflyBps}bps fly`}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs font-semibold",
                            pnl >= 0
                              ? "bg-emerald-900/50 text-emerald-300 border-emerald-800"
                              : "bg-red-900/50 text-red-300 border-red-800",
                          )}
                        >
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(1)}k
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2: Spread Trades (OTR vs OFR)
// ─────────────────────────────────────────────────────────────────────────────

function SpreadTradesTab() {
  const otrBonds = useMemo(() => generateOTRBonds(), []);
  const ofrBonds = useMemo(() => generateOFRBonds(), []);
  const historicalSpreads = useMemo(() => generateHistoricalSpreads(60), []);

  const [selectedPair, setSelectedPair] = useState(0);
  const [tradeNotionalMM, setTradeNotionalMM] = useState(25);

  const pairs = useMemo(
    () =>
      otrBonds.map((otr, i) => {
        const ofr = ofrBonds[i];
        const spreadBps = (ofr.yieldPct - otr.yieldPct) * 100;
        const hr = calcHedgeRatio(ofr.dv01, otr.dv01);
        return {
          otr,
          ofr,
          spreadBps,
          hr,
          label: `${otr.label.split(" ")[1]} sector`,
        };
      }),
    [otrBonds, ofrBonds],
  );

  const activePair = pairs[selectedPair];

  // Historical spread chart
  const chartW = 480;
  const chartH = 130;
  const cPadL = 36;
  const cPadR = 12;
  const cPadT = 12;
  const cPadB = 20;

  const spreadMin = Math.min(...historicalSpreads) - 0.5;
  const spreadMax = Math.max(...historicalSpreads) + 0.5;

  const spreadPts = historicalSpreads.map((v, i) => ({
    x: toSVGCoords(i, 0, historicalSpreads.length - 1, cPadL, chartW - cPadR),
    y: toSVGCoords(v, spreadMin, spreadMax, chartH - cPadB, cPadT),
  }));

  const spreadPath = spreadPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const spreadArea =
    spreadPath +
    ` L ${spreadPts[spreadPts.length - 1].x} ${chartH - cPadB}` +
    ` L ${spreadPts[0].x} ${chartH - cPadB} Z`;

  const avgSpread = historicalSpreads.reduce((a, b) => a + b, 0) / historicalSpreads.length;
  const avgY = toSVGCoords(avgSpread, spreadMin, spreadMax, chartH - cPadB, cPadT);

  const currentSpread = historicalSpreads[historicalSpreads.length - 1];

  const pnlLong = calcPnL(activePair.ofr.dv01, 1, tradeNotionalMM * 1e6) * -1; // per bps spread narrowing
  const tradeSignal =
    activePair.spreadBps > avgSpread + 0.5
      ? "RICH OFR"
      : activePair.spreadBps < avgSpread - 0.5
        ? "RICH OTR"
        : "NEUTRAL";

  return (
    <div className="space-y-4">
      {/* Pair selector */}
      <div className="flex gap-2 flex-wrap">
        {pairs.map((pair, i) => (
          <Button
            key={i}
            size="sm"
            variant={selectedPair === i ? "default" : "outline"}
            className={cn(
              "text-xs",
              selectedPair === i
                ? "bg-blue-700 hover:bg-blue-800 text-white"
                : "border-zinc-700 text-zinc-400 hover:bg-zinc-800",
            )}
            onClick={() => setSelectedPair(i)}
          >
            {pair.label}
          </Button>
        ))}
      </div>

      {/* OTR vs OFR Comparison */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            On-the-Run vs Off-the-Run
            <Badge
              className={cn(
                "ml-auto text-xs",
                tradeSignal === "RICH OFR"
                  ? "bg-emerald-900/50 text-emerald-300 border-emerald-800"
                  : tradeSignal === "RICH OTR"
                    ? "bg-red-900/50 text-red-300 border-red-800"
                    : "bg-zinc-700 text-zinc-300 border-zinc-600",
              )}
            >
              {tradeSignal}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OTR Bond */}
            <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-300">ON-THE-RUN</span>
                <Badge className="bg-blue-900/50 text-blue-300 border-blue-800 text-[10px]">
                  Benchmark
                </Badge>
              </div>
              <p className="text-sm font-semibold text-white">{activePair.otr.label}</p>
              <p className="text-[10px] text-zinc-500 mb-2">{activePair.otr.cusip}</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-zinc-400">Yield</p>
                  <p className="text-white font-medium">{activePair.otr.yieldPct.toFixed(3)}%</p>
                </div>
                <div>
                  <p className="text-zinc-400">DV01/$M</p>
                  <p className="text-white font-medium">${activePair.otr.dv01.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-zinc-400">Bid/Ask</p>
                  <p className="text-white font-medium">{activePair.otr.bidAsk} ct</p>
                </div>
                <div>
                  <p className="text-zinc-400">Duration</p>
                  <p className="text-white font-medium">{activePair.otr.duration.toFixed(2)}y</p>
                </div>
                <div>
                  <p className="text-zinc-400">Convexity</p>
                  <p className="text-white font-medium">{activePair.otr.convexity.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-zinc-400">OS ($B)</p>
                  <p className="text-white font-medium">${activePair.otr.outstanding}B</p>
                </div>
              </div>
            </div>

            {/* OFR Bond */}
            <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-amber-300">OFF-THE-RUN</span>
                <Badge className="bg-amber-900/50 text-amber-300 border-amber-800 text-[10px]">
                  Cheaper
                </Badge>
              </div>
              <p className="text-sm font-semibold text-white">{activePair.ofr.label}</p>
              <p className="text-[10px] text-zinc-500 mb-2">{activePair.ofr.cusip}</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-zinc-400">Yield</p>
                  <p className="text-white font-medium">{activePair.ofr.yieldPct.toFixed(3)}%</p>
                </div>
                <div>
                  <p className="text-zinc-400">DV01/$M</p>
                  <p className="text-white font-medium">${activePair.ofr.dv01.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-zinc-400">Bid/Ask</p>
                  <p className="text-white font-medium">{activePair.ofr.bidAsk} ct</p>
                </div>
                <div>
                  <p className="text-zinc-400">Duration</p>
                  <p className="text-white font-medium">{activePair.ofr.duration.toFixed(2)}y</p>
                </div>
                <div>
                  <p className="text-zinc-400">Convexity</p>
                  <p className="text-white font-medium">{activePair.ofr.convexity.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-zinc-400">OS ($B)</p>
                  <p className="text-white font-medium">${activePair.ofr.outstanding}B</p>
                </div>
              </div>
            </div>
          </div>

          {/* Spread metrics */}
          <div className="mt-3 grid grid-cols-3 gap-3 bg-zinc-800/40 rounded-lg p-3">
            <div>
              <p className="text-[10px] text-zinc-400">OFR Spread</p>
              <p className="text-base font-bold text-amber-300">
                {activePair.spreadBps.toFixed(1)} bps
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">Hedge Ratio</p>
              <p className="text-base font-bold text-white">
                {activePair.hr.toFixed(3)}x
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">Repo Carry</p>
              <p className="text-base font-bold text-emerald-400">
                +{(activePair.spreadBps * 0.35).toFixed(1)} bps/yr
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Spread Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Historical OFR Spread (60 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full"
            style={{ height: 130 }}
          >
            {/* Mean line */}
            <line
              x1={cPadL}
              x2={chartW - cPadR}
              y1={avgY}
              y2={avgY}
              stroke="#f59e0b"
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.6}
            />
            <text x={chartW - cPadR + 2} y={avgY + 4} fontSize={8} fill="#f59e0b">
              avg
            </text>

            {/* Area */}
            <path d={spreadArea} fill="url(#spreadFill)" opacity={0.25} />

            {/* Line */}
            <path
              d={spreadPath}
              fill="none"
              stroke="#60a5fa"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />

            {/* Current dot */}
            <circle
              cx={spreadPts[spreadPts.length - 1].x}
              cy={spreadPts[spreadPts.length - 1].y}
              r={4}
              fill="#3b82f6"
              stroke="#93c5fd"
              strokeWidth={1.5}
            />
            <text
              x={spreadPts[spreadPts.length - 1].x - 2}
              y={spreadPts[spreadPts.length - 1].y - 8}
              fontSize={8}
              fill="#93c5fd"
              textAnchor="middle"
            >
              {currentSpread.toFixed(1)}
            </text>

            {/* Y-axis labels */}
            {[spreadMin + 0.5, avgSpread, spreadMax - 0.5].map((v, i) => {
              const cy = toSVGCoords(v, spreadMin, spreadMax, chartH - cPadB, cPadT);
              return (
                <text key={i} x={cPadL - 3} y={cy + 3} fontSize={8} fill="#71717a" textAnchor="end">
                  {v.toFixed(1)}
                </text>
              );
            })}

            <defs>
              <linearGradient id="spreadFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
        </CardContent>
      </Card>

      {/* Duration-Neutral Hedge Calculator */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            Duration-Neutral Hedge Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-2">
              Notional: <span className="text-white font-medium">${tradeNotionalMM}M</span>
            </label>
            <Slider
              value={[tradeNotionalMM]}
              onValueChange={(v) => setTradeNotionalMM(v[0])}
              min={10}
              max={200}
              step={10}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-400 mb-1">Long OFR</p>
              <p className="text-sm font-semibold text-amber-300">{activePair.ofr.label}</p>
              <p className="text-xs text-zinc-400">
                ${tradeNotionalMM}M face
              </p>
              <p className="text-xs text-zinc-300 mt-1">
                DV01 exposure: ${(activePair.ofr.dv01 * tradeNotionalMM).toFixed(0)}
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-400 mb-1">Short OTR (hedge)</p>
              <p className="text-sm font-semibold text-blue-300">{activePair.otr.label}</p>
              <p className="text-xs text-zinc-400">
                ${(tradeNotionalMM * activePair.hr).toFixed(1)}M face
              </p>
              <p className="text-xs text-zinc-300 mt-1">
                DV01 offset: ${(activePair.otr.dv01 * tradeNotionalMM * activePair.hr).toFixed(0)}
              </p>
            </div>
          </div>

          <div className="bg-zinc-800/40 rounded-lg p-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-zinc-400">Net DV01</p>
              <p className="text-sm font-semibold text-emerald-400">
                ${Math.abs(activePair.ofr.dv01 * tradeNotionalMM - activePair.otr.dv01 * tradeNotionalMM * activePair.hr).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">P&L / bps tightening</p>
              <p className="text-sm font-semibold text-white">
                ${(activePair.ofr.dv01 * tradeNotionalMM).toFixed(1)}k
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">Break-even (bid/ask)</p>
              <p className="text-sm font-semibold text-amber-300">
                {(activePair.ofr.bidAsk + activePair.otr.bidAsk).toFixed(1)} cts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3: Butterfly Trades
// ─────────────────────────────────────────────────────────────────────────────

function ButterflyTab() {
  const curve = useMemo(() => generateYieldCurve(), []);

  const [bellyIdx, setBellyIdx] = useState(1); // 5Y
  const [wing1Idx, setWing1Idx] = useState(0); // 2Y
  const [wing2Idx, setWing2Idx] = useState(2); // 10Y
  const [notionalMM, setNotionalMM] = useState(50);
  const [spreadShift, setSpreadShift] = useState(0); // bps

  const belly = curve[bellyIdx];
  const w1 = curve[wing1Idx];
  const w2 = curve[wing2Idx];

  const fly = useMemo((): ButterflyTrade | null => {
    if (!belly || !w1 || !w2) return null;
    // Duration-neutral butterfly weights
    // Belly short, wings long (standard butterfly)
    // w1 weight * dv01_w1 + w2 weight * dv01_w2 = dv01_belly (DV01 neutral belly vs wings)
    // Additional constraint: equal weight on wings (simplified)
    const totalWingDV01 = w1.dv01 + w2.dv01;
    const bodyWeight = belly.dv01 / totalWingDV01;

    const netDV01 =
      bodyWeight * w1.dv01 + bodyWeight * w2.dv01 - belly.dv01;
    const netConvexity =
      bodyWeight * (w1.convexity ?? 0) + bodyWeight * (w2.convexity ?? 0) - (belly.convexity ?? 0);

    const spreadBps = belly.yield - 0.5 * (w1.yield + w2.yield);
    const spreadBpsTotal = spreadBps * 100;

    // P&L for a given bps change in butterfly spread
    // Short belly (gains when belly yield rises), long wings
    const pnl =
      -spreadShift * belly.dv01 * notionalMM +
      spreadShift * bodyWeight * (w1.dv01 + w2.dv01) * notionalMM;

    return {
      belly,
      shortWing: w1,
      longWing: w2,
      bodyWeight,
      netDV01,
      netConvexity,
      spreadBps: spreadBpsTotal,
      pnl,
    };
  }, [belly, w1, w2, notionalMM, spreadShift]);

  // P&L surface data for mini chart
  const pnlSurface = useMemo(() => {
    if (!fly) return [];
    return Array.from({ length: 21 }, (_, i) => {
      const bps = -20 + i * 2;
      const p =
        -bps * (belly?.dv01 ?? 0) * notionalMM +
        bps * fly.bodyWeight * ((w1?.dv01 ?? 0) + (w2?.dv01 ?? 0)) * notionalMM;
      return { bps, pnl: p };
    });
  }, [fly, belly, w1, w2, notionalMM]);

  // SVG P&L chart
  const svgW = 460;
  const svgH = 140;
  const padL = 44;
  const padR = 12;
  const padT = 12;
  const padB = 22;

  const pnlVals = pnlSurface.map((d) => d.pnl);
  const pnlMin = Math.min(...pnlVals) - Math.abs(Math.min(...pnlVals)) * 0.1;
  const pnlMax = Math.max(...pnlVals) + Math.abs(Math.max(...pnlVals)) * 0.1;
  const bpsMin = -20;
  const bpsMax = 20;

  const surfacePts = pnlSurface.map((d) => ({
    x: toSVGCoords(d.bps, bpsMin, bpsMax, padL, svgW - padR),
    y: toSVGCoords(d.pnl, pnlMin, pnlMax, svgH - padB, padT),
    pnl: d.pnl,
    bps: d.bps,
  }));

  const surfacePath = surfacePts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const zeroY = toSVGCoords(0, pnlMin, pnlMax, svgH - padB, padT);

  // Color segments above/below zero
  const posArea =
    surfacePath +
    ` L ${surfacePts[surfacePts.length - 1].x} ${zeroY}` +
    ` L ${surfacePts[0].x} ${zeroY} Z`;

  return (
    <div className="space-y-4">
      {/* Wing/Belly selectors */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-400" />
            Butterfly Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Short wing */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Short Wing (Long)</label>
              {curve.map((p, i) => (
                <button
                  key={p.tenor}
                  onClick={() => setWing1Idx(i)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded text-xs border mb-1 transition-colors",
                    wing1Idx === i
                      ? "bg-emerald-900/40 border-emerald-700 text-emerald-300"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500",
                  )}
                >
                  {p.tenor} {p.yield.toFixed(3)}%
                </button>
              ))}
            </div>

            {/* Belly */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Belly (Short)</label>
              {curve.map((p, i) => (
                <button
                  key={p.tenor}
                  onClick={() => setBellyIdx(i)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded text-xs border mb-1 transition-colors",
                    bellyIdx === i
                      ? "bg-red-900/40 border-red-700 text-red-300"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500",
                  )}
                >
                  {p.tenor} {p.yield.toFixed(3)}%
                </button>
              ))}
            </div>

            {/* Long wing */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Long Wing (Long)</label>
              {curve.map((p, i) => (
                <button
                  key={p.tenor}
                  onClick={() => setWing2Idx(i)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded text-xs border mb-1 transition-colors",
                    wing2Idx === i
                      ? "bg-emerald-900/40 border-emerald-700 text-emerald-300"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500",
                  )}
                >
                  {p.tenor} {p.yield.toFixed(3)}%
                </button>
              ))}
            </div>
          </div>

          {fly && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-800/40 rounded-lg p-3">
              <div>
                <p className="text-[10px] text-zinc-400">Fly Spread</p>
                <p className="text-base font-bold text-violet-300">
                  {fly.spreadBps.toFixed(1)} bps
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400">Body Weight</p>
                <p className="text-base font-bold text-white">
                  {fly.bodyWeight.toFixed(3)}x
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400">Net DV01</p>
                <p
                  className={cn(
                    "text-base font-bold",
                    Math.abs(fly.netDV01) < 0.1 ? "text-emerald-400" : "text-amber-400",
                  )}
                >
                  ${fly.netDV01.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400">Net Convexity</p>
                <p
                  className={cn(
                    "text-base font-bold",
                    fly.netConvexity > 0 ? "text-emerald-400" : "text-red-400",
                  )}
                >
                  {fly.netConvexity.toFixed(4)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trade legs detail */}
      {fly && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-300">Trade Legs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { bond: fly.shortWing, dir: "LONG", weight: fly.bodyWeight, color: "text-emerald-300", bg: "bg-emerald-900/20 border-emerald-800/40" },
                { bond: fly.belly, dir: "SHORT", weight: 1, color: "text-red-300", bg: "bg-red-900/20 border-red-800/40" },
                { bond: fly.longWing, dir: "LONG", weight: fly.bodyWeight, color: "text-emerald-300", bg: "bg-emerald-900/20 border-emerald-800/40" },
              ].map(({ bond, dir, weight, color, bg }, i) => (
                <div
                  key={i}
                  className={cn("rounded-lg px-3 py-2 border flex items-center justify-between", bg)}
                >
                  <div>
                    <span className={cn("text-xs font-semibold mr-2", color)}>{dir}</span>
                    <span className="text-xs text-white">{bond.tenor} — {bond.yield.toFixed(3)}%</span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[10px] text-zinc-400">Weight</p>
                      <p className="text-xs text-white">{weight.toFixed(3)}x</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400">DV01</p>
                      <p className="text-xs text-white">${(bond.dv01 * weight * notionalMM).toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400">Convexity</p>
                      <p className="text-xs text-white">{((bond.convexity ?? 0) * weight).toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* P&L Surface */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              P&L Surface vs Fly Spread Change
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-2">
              Notional: <span className="text-white font-medium">${notionalMM}M</span>
            </label>
            <Slider
              value={[notionalMM]}
              onValueChange={(v) => setNotionalMM(v[0])}
              min={10}
              max={200}
              step={10}
              className="w-full"
            />
          </div>

          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full"
            style={{ height: 140 }}
          >
            {/* Zero line */}
            <line
              x1={padL}
              x2={svgW - padR}
              y1={zeroY}
              y2={zeroY}
              stroke="#71717a"
              strokeWidth={0.75}
              strokeDasharray="3 3"
            />

            {/* Area fill */}
            <clipPath id="posClip">
              <rect x={padL} y={padT} width={svgW - padL - padR} height={zeroY - padT} />
            </clipPath>
            <clipPath id="negClip">
              <rect x={padL} y={zeroY} width={svgW - padL - padR} height={svgH - padB - zeroY} />
            </clipPath>
            <path d={posArea} fill="#22c55e" opacity={0.2} clipPath="url(#posClip)" />
            <path d={posArea} fill="#ef4444" opacity={0.2} clipPath="url(#negClip)" />

            {/* Line */}
            <path
              d={surfacePath}
              fill="none"
              stroke="#a78bfa"
              strokeWidth={2}
              strokeLinejoin="round"
            />

            {/* Current spread marker */}
            {fly && (() => {
              const cx = toSVGCoords(0, bpsMin, bpsMax, padL, svgW - padR);
              return (
                <line
                  x1={cx}
                  x2={cx}
                  y1={padT}
                  y2={svgH - padB}
                  stroke="#a78bfa"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.6}
                />
              );
            })()}

            {/* X-axis labels */}
            {[-20, -10, 0, 10, 20].map((b) => {
              const cx = toSVGCoords(b, bpsMin, bpsMax, padL, svgW - padR);
              return (
                <text key={b} x={cx} y={svgH - padB + 14} fontSize={8} fill="#71717a" textAnchor="middle">
                  {b > 0 ? "+" : ""}{b}
                </text>
              );
            })}

            {/* Y-axis labels */}
            {[pnlMin, 0, pnlMax].map((v, i) => {
              const cy = toSVGCoords(v, pnlMin, pnlMax, svgH - padB, padT);
              return (
                <text key={i} x={padL - 3} y={cy + 3} fontSize={8} fill="#71717a" textAnchor="end">
                  {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v <= -1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}
                </text>
              );
            })}

            <text x={(padL + svgW - padR) / 2} y={svgH - 2} fontSize={8} fill="#52525b" textAnchor="middle">
              Fly Spread Change (bps)
            </text>
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4: Swap Spreads
// ─────────────────────────────────────────────────────────────────────────────

function SwapSpreadsTab() {
  const spreads = useMemo(() => generateSwapSpreads(), []);
  const [selectedTenor, setSelectedTenor] = useState(2); // 5Y default
  const [view, setView] = useState<"asw" | "z" | "lib">("asw");

  const selected = spreads[selectedTenor];

  // Curve comparison SVG
  const svgW = 480;
  const svgH = 180;
  const padL = 44;
  const padR = 20;
  const padT = 16;
  const padB = 24;

  const allRates = [...spreads.map((d) => d.treasuryYield), ...spreads.map((d) => d.swapRate)];
  const rateMin = Math.min(...allRates) - 0.1;
  const rateMax = Math.max(...allRates) + 0.1;

  const tPts = spreads.map((d, i) => ({
    x: toSVGCoords(i, 0, spreads.length - 1, padL, svgW - padR),
    y: toSVGCoords(d.treasuryYield, rateMin, rateMax, svgH - padB, padT),
  }));
  const sPts = spreads.map((d, i) => ({
    x: toSVGCoords(i, 0, spreads.length - 1, padL, svgW - padR),
    y: toSVGCoords(d.swapRate, rateMin, rateMax, svgH - padB, padT),
  }));

  const tPath = tPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const sPath = sPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const spreadViewLabel = view === "asw" ? "Asset Swap Spread" : view === "z" ? "Z-Spread" : "LIBOR Spread";

  const spreadValues = spreads.map((d) =>
    view === "asw" ? d.assetSwapSpread : view === "z" ? d.zSpread : d.libSpread,
  );
  const sSpreadMin = Math.min(...spreadValues) - 3;
  const sSpreadMax = Math.max(...spreadValues) + 3;

  const spreadBarPts = spreads.map((d, i) => ({
    x: toSVGCoords(i, 0, spreads.length - 1, padL, svgW - padR),
    val: view === "asw" ? d.assetSwapSpread : view === "z" ? d.zSpread : d.libSpread,
  }));

  return (
    <div className="space-y-4">
      {/* Spread type toggle */}
      <div className="flex gap-2">
        {([
          { key: "asw", label: "Asset Swap" },
          { key: "z", label: "Z-Spread" },
          { key: "lib", label: "LIBOR Spread" },
        ] as const).map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            variant={view === key ? "default" : "outline"}
            className={cn(
              "text-xs",
              view === key
                ? "bg-violet-600 hover:bg-violet-700 text-white"
                : "border-zinc-700 text-zinc-400 hover:bg-zinc-800",
            )}
            onClick={() => setView(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Swap curve vs Treasury */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-blue-400" />
            Swap Curve vs Treasury Curve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full"
            style={{ height: 180 }}
          >
            {/* Grid */}
            {[rateMin + 0.1, (rateMin + rateMax) / 2, rateMax - 0.1].map((v, i) => {
              const cy = toSVGCoords(v, rateMin, rateMax, svgH - padB, padT);
              return (
                <g key={i}>
                  <line
                    x1={padL}
                    x2={svgW - padR}
                    y1={cy}
                    y2={cy}
                    stroke="#3f3f46"
                    strokeWidth={0.5}
                    strokeDasharray="4 4"
                  />
                  <text x={padL - 4} y={cy + 4} fontSize={8} fill="#71717a" textAnchor="end">
                    {v.toFixed(2)}%
                  </text>
                </g>
              );
            })}

            {/* Treasury */}
            <path
              d={tPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeLinejoin="round"
            />

            {/* Swap */}
            <path
              d={sPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeDasharray="5 3"
            />

            {/* Nodes + click targets */}
            {tPts.map((p, i) => (
              <g key={i} onClick={() => setSelectedTenor(i)} className="cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={selectedTenor === i ? 5 : 3.5}
                  fill={selectedTenor === i ? "#60a5fa" : "#1d4ed8"}
                  stroke="#93c5fd"
                  strokeWidth={1}
                />
                <circle
                  cx={sPts[i].x}
                  cy={sPts[i].y}
                  r={selectedTenor === i ? 5 : 3.5}
                  fill={selectedTenor === i ? "#fbbf24" : "#92400e"}
                  stroke="#fcd34d"
                  strokeWidth={1}
                />
                {/* Vertical spread line */}
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={sPts[i].x}
                  y2={sPts[i].y}
                  stroke="#a78bfa"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  opacity={0.5}
                />
                {/* x label */}
                <text
                  x={p.x}
                  y={svgH - padB + 14}
                  fontSize={8}
                  fill="#71717a"
                  textAnchor="middle"
                >
                  {spreads[i].tenor}
                </text>
              </g>
            ))}

            {/* Legend */}
            <line x1={padL} x2={padL + 16} y1={padT} y2={padT} stroke="#3b82f6" strokeWidth={2} />
            <text x={padL + 20} y={padT + 4} fontSize={8} fill="#93c5fd">Treasury</text>
            <line x1={padL + 65} x2={padL + 81} y1={padT} y2={padT} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" />
            <text x={padL + 85} y={padT + 4} fontSize={8} fill="#fcd34d">Swap</text>
          </svg>
        </CardContent>
      </Card>

      {/* Selected tenor detail */}
      {selected && (
        <motion.div
          key={selectedTenor}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                {selected.tenor} Swap Spread Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-[10px] text-zinc-400">Treasury Yield</p>
                  <p className="text-base font-bold text-blue-300">
                    {selected.treasuryYield.toFixed(3)}%
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-[10px] text-zinc-400">Swap Rate</p>
                  <p className="text-base font-bold text-amber-300">
                    {selected.swapRate.toFixed(3)}%
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-[10px] text-zinc-400">Asset Swap Spread</p>
                  <p className="text-base font-bold text-violet-300">
                    {selected.assetSwapSpread.toFixed(1)} bps
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-[10px] text-zinc-400">Z-Spread</p>
                  <p className="text-base font-bold text-white">
                    {selected.zSpread.toFixed(1)} bps
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-[10px] text-zinc-400">LIBOR Spread</p>
                  <p className="text-base font-bold text-cyan-300">
                    {selected.libSpread.toFixed(1)} bps
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-[10px] text-zinc-400">Carry (bps/yr)</p>
                  <p className="text-base font-bold text-emerald-400">
                    +{selected.carryBps.toFixed(1)} bps
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3 col-span-2">
                  <p className="text-[10px] text-zinc-400 mb-1">ASW vs Z-Spread differential</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-violet-600"
                      style={{
                        width: `${Math.min(100, (selected.assetSwapSpread / 40) * 100)}%`,
                      }}
                    />
                    <span className="text-xs text-white">
                      {(selected.assetSwapSpread - selected.zSpread).toFixed(1)} bps differential
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {selected.assetSwapSpread > selected.zSpread
                      ? "ASW wider: bond trading cheap vs swap curve"
                      : "Z-spread wider: discount factor divergence"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Spread term structure chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            {spreadViewLabel} Term Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-36 items-end gap-1.5 px-2">
            {spreadBarPts.map((d, i) => {
              const pct = Math.max(
                4,
                ((d.val - sSpreadMin) / (sSpreadMax - sSpreadMin)) * 100,
              );
              return (
                <div
                  key={i}
                  className="flex flex-col items-center flex-1 cursor-pointer"
                  onClick={() => setSelectedTenor(i)}
                >
                  <span className="text-[9px] text-zinc-400 mb-1">{d.val.toFixed(1)}</span>
                  <div
                    className={cn(
                      "w-full rounded-t-sm transition-all",
                      selectedTenor === i
                        ? "bg-violet-500"
                        : "bg-violet-800/70 hover:bg-violet-700/70",
                    )}
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-[9px] text-zinc-500 mt-1">{spreads[i].tenor}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Carry summary table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            Carry Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Tenor", "Tsy Yield", "Swap Rate", "ASW", "Z-Sprd", "Carry", "Signal"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-2 px-2 text-[10px] text-zinc-500 font-medium uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {spreads.map((d, i) => {
                  const signal =
                    d.assetSwapSpread > 30
                      ? "BUY ASW"
                      : d.assetSwapSpread < 15
                        ? "SELL ASW"
                        : "HOLD";
                  return (
                    <tr
                      key={d.tenor}
                      className={cn(
                        "border-b border-zinc-800/50 transition-colors cursor-pointer",
                        selectedTenor === i
                          ? "bg-violet-900/20"
                          : "hover:bg-zinc-800/30",
                      )}
                      onClick={() => setSelectedTenor(i)}
                    >
                      <td className="py-2 px-2 font-medium text-white">{d.tenor}</td>
                      <td className="py-2 px-2 text-blue-300">{d.treasuryYield.toFixed(3)}%</td>
                      <td className="py-2 px-2 text-amber-300">{d.swapRate.toFixed(3)}%</td>
                      <td className="py-2 px-2 text-violet-300">{d.assetSwapSpread.toFixed(1)}</td>
                      <td className="py-2 px-2 text-zinc-300">{d.zSpread.toFixed(1)}</td>
                      <td className="py-2 px-2 text-emerald-400">+{d.carryBps.toFixed(1)}</td>
                      <td className="py-2 px-2">
                        <Badge
                          className={cn(
                            "text-[10px]",
                            signal === "BUY ASW"
                              ? "bg-emerald-900/50 text-emerald-300 border-emerald-800"
                              : signal === "SELL ASW"
                                ? "bg-red-900/50 text-red-300 border-red-800"
                                : "bg-zinc-700 text-zinc-400 border-zinc-600",
                          )}
                        >
                          {signal}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function FIRelValuePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-blue-900/40 border border-blue-800/40">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Fixed Income Relative Value</h1>
            <p className="text-sm text-zinc-400">
              Bond spread analysis, duration-neutral trades, swap spreads & butterfly strategies
            </p>
          </div>
        </div>

        {/* Quick info chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="flex items-center gap-1.5 bg-blue-900/30 border border-blue-800/40 rounded-full px-3 py-1">
            <Activity className="w-3 h-3 text-blue-400" />
            <span className="text-[11px] text-blue-300">Live Yield Curve</span>
          </div>
          <div className="flex items-center gap-1.5 bg-violet-900/30 border border-violet-800/40 rounded-full px-3 py-1">
            <Target className="w-3 h-3 text-violet-400" />
            <span className="text-[11px] text-violet-300">OTR/OFR Arb</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-900/30 border border-amber-800/40 rounded-full px-3 py-1">
            <ArrowLeftRight className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] text-amber-300">Swap Spreads</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-900/30 border border-emerald-800/40 rounded-full px-3 py-1">
            <Calculator className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] text-emerald-300">DV01 Neutral</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="yieldcurve" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 h-auto p-1 flex flex-wrap gap-1 mb-4">
          <TabsTrigger
            value="yieldcurve"
            className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-zinc-400 text-xs px-3 py-1.5"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Yield Curve
          </TabsTrigger>
          <TabsTrigger
            value="spreadtrades"
            className="data-[state=active]:bg-amber-700 data-[state=active]:text-white text-zinc-400 text-xs px-3 py-1.5"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Spread Trades
          </TabsTrigger>
          <TabsTrigger
            value="butterfly"
            className="data-[state=active]:bg-violet-700 data-[state=active]:text-white text-zinc-400 text-xs px-3 py-1.5"
          >
            <Target className="w-3.5 h-3.5 mr-1.5" />
            Butterfly
          </TabsTrigger>
          <TabsTrigger
            value="swapspreads"
            className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white text-zinc-400 text-xs px-3 py-1.5"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
            Swap Spreads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yieldcurve" className="data-[state=inactive]:hidden">
          <YieldCurveTab />
        </TabsContent>

        <TabsContent value="spreadtrades" className="data-[state=inactive]:hidden">
          <SpreadTradesTab />
        </TabsContent>

        <TabsContent value="butterfly" className="data-[state=inactive]:hidden">
          <ButterflyTab />
        </TabsContent>

        <TabsContent value="swapspreads" className="data-[state=inactive]:hidden">
          <SwapSpreadsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
