"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Zap,
  Layers,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  ChevronRight,
  Info,
  RefreshCw,
  Target,
  Eye,
  EyeOff,
  Gauge,
  ArrowUpDown,
  Lock,
  Unlock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ─────────────────────────────────────────────────────────────

let s = 900;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed: number = 900) {
  s = seed;
}

// ── Utility ──────────────────────────────────────────────────────────────────

function fmt2(n: number) {
  return n.toFixed(2);
}
function fmt4(n: number) {
  return n.toFixed(4);
}
function fmtPct(n: number) {
  return (n * 100).toFixed(1) + "%";
}
function fmtDollar(n: number) {
  return "$" + Math.abs(n).toFixed(2);
}

// ── Types ────────────────────────────────────────────────────────────────────

interface OptionQuote {
  strike: number;
  type: "call" | "put";
  bid: number;
  ask: number;
  spread: number;
  iv: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  oi: number;
  volume: number;
  moneyness: "ITM" | "ATM" | "OTM";
}

interface InventorySnapshot {
  t: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  hedgeCost: number;
  pnl: number;
}

interface FlowDataPoint {
  t: number;
  vpin: number;
  toxicity: "low" | "medium" | "high";
  informed: number;
  uninformed: number;
}

interface ProfitBar {
  month: string;
  spreadIncome: number;
  hedgeCosts: number;
  adverseSelection: number;
  net: number;
}

// ── Tab 1: Quoting & Spreads ─────────────────────────────────────────────────

function generateChain(spot: number, tick: number): OptionQuote[] {
  resetSeed(900);
  const strikes = [-20, -15, -10, -5, 0, 5, 10, 15, 20].map((d) => spot + d);
  const quotes: OptionQuote[] = [];

  for (const strike of strikes) {
    const moneynessPct = (strike - spot) / spot;
    const atm = Math.abs(moneynessPct) < 0.03;
    const itm = moneynessPct < -0.03;
    const otm = moneynessPct > 0.03;

    const baseIV = 0.28 + Math.abs(moneynessPct) * 0.4 + rand() * 0.03;
    const liquidity = atm ? 1.0 : 0.4 + rand() * 0.4;
    const baseSpread = (0.15 + (1 - liquidity) * 0.40) / spot;

    const intrinsic = Math.max(0, spot - strike);
    const timePremium = baseIV * spot * 0.15 * (rand() * 0.2 + 0.9);
    const callMid = intrinsic + timePremium;
    const roundedBid = Math.floor(callMid / tick) * tick;
    const roundedAsk = roundedBid + tick * Math.ceil((callMid * baseSpread * 2) / tick + 1);

    const callDelta = itm ? 0.75 + rand() * 0.2 : atm ? 0.45 + rand() * 0.1 : 0.15 + rand() * 0.2;
    const gamma = atm ? 0.04 + rand() * 0.02 : 0.01 + rand() * 0.015;
    const vega = baseIV * 100 * (0.8 + rand() * 0.4);
    const theta = -(timePremium / 30) * (0.9 + rand() * 0.2);

    quotes.push({
      strike,
      type: "call",
      bid: roundedBid,
      ask: roundedAsk,
      spread: roundedAsk - roundedBid,
      iv: baseIV,
      delta: callDelta,
      gamma,
      theta,
      vega,
      oi: Math.floor(500 + rand() * 4500),
      volume: Math.floor(50 + rand() * 1500),
      moneyness: atm ? "ATM" : itm ? "ITM" : "OTM",
    });

    const putIntrinsic = Math.max(0, strike - spot);
    const putMid = putIntrinsic + timePremium;
    const putBid = Math.floor(putMid / tick) * tick;
    const putAsk = putBid + tick * Math.ceil((putMid * baseSpread * 2) / tick + 1);
    const putDelta = -(1 - callDelta) * (0.9 + rand() * 0.1);

    quotes.push({
      strike,
      type: "put",
      bid: putBid,
      ask: putAsk,
      spread: putAsk - putBid,
      iv: baseIV + 0.02 + rand() * 0.02,
      delta: putDelta,
      gamma,
      theta: theta * 0.95,
      vega: vega * 0.95,
      oi: Math.floor(300 + rand() * 3500),
      volume: Math.floor(30 + rand() * 1200),
      moneyness: atm ? "ATM" : otm ? "OTM" : "ITM",
    });
  }

  return quotes;
}

function QuotingTab() {
  const [spot] = useState(450);
  const [tick, setTick] = useState(0.05);
  const [showCalls, setShowCalls] = useState(true);
  const [showPuts, setShowPuts] = useState(true);
  const [animKey, setAnimKey] = useState(0);

  const chain = useMemo(() => generateChain(spot, tick), [spot, tick]);
  const calls = chain.filter((q) => q.type === "call");
  const puts = chain.filter((q) => q.type === "put");

  const spreadComponents = [
    { label: "Order Processing", pct: 0.22, color: "bg-primary", desc: "System/clearing overhead" },
    { label: "Inventory Risk", pct: 0.31, color: "bg-amber-500", desc: "Price risk while holding position" },
    { label: "Adverse Selection", pct: 0.29, color: "bg-rose-500", desc: "Trading against informed flow" },
    { label: "Realized Spread", pct: 0.18, color: "bg-emerald-500", desc: "Net profit to MM" },
  ];

  const tickTable = [
    { program: "Penny Pilot", eligible: "Top 500 ETFs + popular equities", minTick: "$0.01", note: "Below $3 strike" },
    { program: "Penny Pilot", eligible: "Top 500 ETFs + popular equities", minTick: "$0.05", note: "At/above $3 strike" },
    { program: "Standard", eligible: "Most equity options", minTick: "$0.10", note: "Below $3 strike" },
    { program: "Standard", eligible: "Most equity options", minTick: "$0.05", note: "At/above $3 strike" },
    { program: "Index (SPX/NDX)", eligible: "Broad index options", minTick: "$0.05", note: "CBOE rules" },
    { program: "VIX", eligible: "Volatility index", minTick: "$0.05", note: "Special rules" },
  ];

  const determinants = [
    { factor: "Moneyness (ATM)", impact: "Tighter", reason: "High liquidity, easy delta hedge" },
    { factor: "Deep ITM/OTM", impact: "Wider", reason: "Low liquidity, delta hedge uncertain" },
    { factor: "Short DTE (<7d)", impact: "Wider", reason: "Gamma risk explodes near expiry" },
    { factor: "High IV", impact: "Wider", reason: "Larger expected moves = more inventory risk" },
    { factor: "Earnings pending", impact: "Much wider", reason: "IV crush risk, informed trader risk" },
    { factor: "High volume/OI", impact: "Tighter", reason: "More two-sided flow, less inventory buildup" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <ArrowUpDown className="text-primary" size={16} />
          </div>
          <h2 className="text-lg font-semibold text-zinc-100">Options Bid-Ask Spread Decomposition</h2>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          An options market maker simultaneously posts bid and ask quotes, earning the spread on each trade. But the spread
          is not pure profit — it compensates for four distinct cost components.
        </p>
      </div>

      {/* Spread Components */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Spread Component Waterfall</h3>
        <div className="space-y-3">
          {spreadComponents.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className="w-36 text-xs text-zinc-300 font-medium">{c.label}</div>
              <div className="flex-1 h-7 bg-zinc-800 rounded overflow-hidden">
                <div
                  className={cn("h-full rounded", c.color, "opacity-80")}
                  style={{ width: `${c.pct * 100}%` }}
                />
              </div>
              <div className="w-10 text-xs text-zinc-400 text-right">{Math.round(c.pct * 100)}%</div>
              <div className="w-48 text-xs text-zinc-500 hidden xl:block">{c.desc}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-zinc-800/60 rounded-lg text-xs text-zinc-400">
          <span className="text-emerald-400 font-semibold">Key insight: </span>
          Only ~18% of the bid-ask spread represents net profit. The majority compensates for risk. A wider spread is not
          greed — it&apos;s pricing for uncertainty.
        </div>
      </div>

      {/* Live Chain SVG */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-200">Live Options Chain — SPY (Spot: ${spot})</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-500">Tick:</span>
              {[0.01, 0.05, 0.10].map((t) => (
                <button
                  key={t}
                  onClick={() => setTick(t)}
                  className={cn(
                    "px-2 py-1 text-xs rounded border transition-colors",
                    tick === t
                      ? "bg-primary/20 border-primary text-primary"
                      : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                  )}
                >
                  ${t.toFixed(2)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAnimKey((k) => k + 1)}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          {(
            [
              { label: "Calls", active: showCalls, set: setShowCalls, color: "text-emerald-400" },
              { label: "Puts", active: showPuts, set: setShowPuts, color: "text-rose-400" },
            ] as const
          ).map((btn) => (
            <button
              key={btn.label}
              onClick={() => btn.set(!btn.active)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors",
                btn.active ? "border-zinc-600 bg-zinc-800" : "border-zinc-800 text-zinc-600"
              )}
            >
              {btn.active ? <Eye size={12} className={btn.color} /> : <EyeOff size={12} />}
              {btn.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={animKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {showCalls && (
                      <>
                        <th className="text-left py-2 px-2 text-emerald-500 font-medium">Bid</th>
                        <th className="text-left py-2 px-2 text-emerald-500 font-medium">Ask</th>
                        <th className="text-left py-2 px-2 text-zinc-500">Spread</th>
                        <th className="text-left py-2 px-2 text-zinc-500">IV</th>
                        <th className="text-left py-2 px-2 text-zinc-500">Δ</th>
                      </>
                    )}
                    <th className="text-center py-2 px-3 text-zinc-300 font-semibold">Strike</th>
                    {showPuts && (
                      <>
                        <th className="text-right py-2 px-2 text-zinc-500">Δ</th>
                        <th className="text-right py-2 px-2 text-zinc-500">IV</th>
                        <th className="text-right py-2 px-2 text-zinc-500">Spread</th>
                        <th className="text-right py-2 px-2 text-rose-500 font-medium">Bid</th>
                        <th className="text-right py-2 px-2 text-rose-500 font-medium">Ask</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {calls.map((call, i) => {
                    const put = puts[i];
                    const isAtm = call.moneyness === "ATM";
                    return (
                      <motion.tr
                        key={call.strike}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={cn(
                          "border-b border-zinc-800/50",
                          isAtm && "bg-zinc-800/60"
                        )}
                      >
                        {showCalls && (
                          <>
                            <td className="py-1.5 px-2 text-emerald-400 font-mono">{fmt2(call.bid)}</td>
                            <td className="py-1.5 px-2 text-emerald-300 font-mono">{fmt2(call.ask)}</td>
                            <td className="py-1.5 px-2 text-zinc-500 font-mono">{fmt2(call.spread)}</td>
                            <td className="py-1.5 px-2 text-primary font-mono">{fmtPct(call.iv)}</td>
                            <td className="py-1.5 px-2 text-primary font-mono">{fmt2(call.delta)}</td>
                          </>
                        )}
                        <td className="py-1.5 px-3 text-center">
                          <span
                            className={cn(
                              "font-semibold font-mono",
                              isAtm ? "text-amber-400" : "text-zinc-300"
                            )}
                          >
                            {call.strike}
                            {isAtm && (
                              <span className="ml-1 text-xs text-amber-500">ATM</span>
                            )}
                          </span>
                        </td>
                        {showPuts && put && (
                          <>
                            <td className="py-1.5 px-2 text-right text-rose-400 font-mono">{fmt2(put.delta)}</td>
                            <td className="py-1.5 px-2 text-right text-primary font-mono">{fmtPct(put.iv)}</td>
                            <td className="py-1.5 px-2 text-right text-zinc-500 font-mono">{fmt2(put.spread)}</td>
                            <td className="py-1.5 px-2 text-right text-rose-400 font-mono">{fmt2(put.bid)}</td>
                            <td className="py-1.5 px-2 text-right text-rose-300 font-mono">{fmt2(put.ask)}</td>
                          </>
                        )}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Spread Determinants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Spread Determinants</h3>
          <div className="space-y-2">
            {determinants.map((d) => (
              <div key={d.factor} className="flex items-start gap-3 p-2 bg-zinc-800/40 rounded-lg">
                <div className="w-36 text-xs text-zinc-300 font-medium mt-0.5">{d.factor}</div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs shrink-0",
                    d.impact.includes("Tighter") ? "border-emerald-700 text-emerald-400" : "border-rose-700 text-rose-400"
                  )}
                >
                  {d.impact}
                </Badge>
                <div className="text-xs text-zinc-500">{d.reason}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Minimum Tick Sizes (US Options)</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400">Program</th>
                <th className="text-left py-2 text-zinc-400">Min Tick</th>
                <th className="text-left py-2 text-zinc-400">Note</th>
              </tr>
            </thead>
            <tbody>
              {tickTable.map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/40">
                  <td className="py-1.5 text-zinc-300">{row.program}</td>
                  <td className="py-1.5 text-amber-400 font-mono font-semibold">{row.minTick}</td>
                  <td className="py-1.5 text-zinc-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 p-3 bg-amber-900/20 border border-amber-800/30 rounded-lg text-xs text-amber-300">
            <span className="font-semibold">Penny Pilot Program: </span>
            Allows tighter quotes for highly liquid options. Tighter spreads mean MMs must trade larger size to maintain profitability.
          </div>
        </div>
      </div>

      {/* Quote Stuffing Protection */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="text-primary" size={16} />
          <h3 className="text-sm font-semibold text-zinc-200">Quote Stuffing Protection & Market Rules</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {[
            {
              title: "Quote-to-Trade Ratio (QTR)",
              desc: "FINRA monitors QTR. Excessive cancellations relative to trades can trigger investigations. Options MMs are held to lower standards than equity MMs due to hedging needs.",
              color: "text-primary",
            },
            {
              title: "Market Access Rule (SEC 15c3-5)",
              desc: "Broker-dealers must have pre-trade risk checks. Automated kill switches halt quoting when position limits or loss thresholds are breached.",
              color: "text-emerald-400",
            },
            {
              title: "Reg NMS & Best Execution",
              desc: "NBBO must be honored. Options quotes must meet or beat the National Best Bid and Offer. Failure to quote at competitive prices risks loss of order flow.",
              color: "text-amber-400",
            },
          ].map((item) => (
            <div key={item.title} className="p-3 bg-zinc-800/50 rounded-lg">
              <div className={cn("font-semibold mb-2", item.color)}>{item.title}</div>
              <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Inventory Management ───────────────────────────────────────────────

function generateInventory(): InventorySnapshot[] {
  resetSeed(900);
  const bars: InventorySnapshot[] = [];
  let delta = 0;
  let gamma = 0;
  let vega = 0;
  let theta = 0;
  let pnl = 0;
  let cumHedge = 0;

  for (let t = 0; t < 40; t++) {
    const tradeType = rand();
    if (tradeType < 0.3) {
      delta += (rand() - 0.5) * 200;
      gamma += (rand() - 0.5) * 50;
      vega += (rand() - 0.5) * 300;
    } else if (tradeType < 0.6) {
      delta -= (rand() - 0.5) * 180;
      gamma -= (rand() - 0.5) * 40;
      vega -= (rand() - 0.5) * 250;
    }

    // Mean reversion pressure
    delta *= 0.88;
    gamma *= 0.90;
    vega *= 0.92;
    theta = -Math.abs(gamma) * 0.4 - Math.abs(vega) * 0.01;

    const hedgeCost = Math.abs(delta) * 0.02 + Math.abs(gamma) * 0.05;
    cumHedge += hedgeCost;
    pnl += Math.abs(gamma) * 0.15 + Math.abs(vega) * 0.005 - hedgeCost * 0.8;

    bars.push({ t, delta, gamma, vega, theta, hedgeCost, pnl });
  }
  return bars;
}

function InventoryTab() {
  const data = useMemo(() => generateInventory(), []);

  const maxDelta = Math.max(...data.map((d) => Math.abs(d.delta)));
  const maxGamma = Math.max(...data.map((d) => Math.abs(d.gamma)));
  const maxVega = Math.max(...data.map((d) => Math.abs(d.vega)));
  const minPnl = Math.min(...data.map((d) => d.pnl));
  const maxPnl = Math.max(...data.map((d) => d.pnl));

  const W = 600;
  const H = 120;

  const toX = (t: number) => (t / (data.length - 1)) * W;
  const toYDelta = (v: number) => H / 2 - (v / maxDelta) * (H / 2 - 8);
  const toYPnl = (v: number) =>
    H - 8 - ((v - minPnl) / (maxPnl - minPnl)) * (H - 16);

  const deltaPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.t)} ${toYDelta(d.delta)}`).join(" ");
  const gammaNorm = data.map((d) => ({ ...d, gNorm: (d.gamma / maxGamma) * (H / 2 - 8) }));
  const pnlPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.t)} ${toYPnl(d.pnl)}`).join(" ");

  const correlationData = [
    ["SPY", "QQQ", "IWM", "GLD", "TLT"],
    [1.0, 0.92, 0.87, -0.12, -0.68],
    [0.92, 1.0, 0.81, -0.08, -0.71],
    [0.87, 0.81, 1.0, -0.18, -0.58],
    [-0.12, -0.08, -0.18, 1.0, 0.34],
    [-0.68, -0.71, -0.58, 0.34, 1.0],
  ];

  const tickers = correlationData[0] as string[];
  const corrMatrix = correlationData.slice(1) as number[][];

  function corrColor(v: number): string {
    if (v >= 0.8) return "bg-emerald-500";
    if (v >= 0.5) return "bg-emerald-800";
    if (v >= 0.1) return "bg-zinc-700";
    if (v >= -0.3) return "bg-amber-900";
    return "bg-rose-800";
  }

  const pinRiskData = [
    { strike: 445, daysOut: 1, pinRisk: "Low", note: "Far from spot" },
    { strike: 448, daysOut: 1, pinRisk: "Medium", note: "Approaching spot" },
    { strike: 450, daysOut: 1, pinRisk: "Extreme", note: "Spot = strike, gamma explosion" },
    { strike: 452, daysOut: 1, pinRisk: "Medium", note: "Near spot" },
    { strike: 455, daysOut: 1, pinRisk: "Low", note: "Away from spot" },
  ];

  const last = data[data.length - 1];

  return (
    <div className="space-y-6">
      {/* Greeks Dashboard */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Greeks Inventory Dashboard</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Net Delta", value: fmt2(last.delta), unit: "Δ", color: "text-primary", bgColor: "bg-primary/10 border-border" },
            { label: "Net Gamma", value: fmt2(last.gamma), unit: "Γ", color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-800" },
            { label: "Net Vega", value: fmt2(last.vega), unit: "ν", color: "text-primary", bgColor: "bg-primary/10 border-border" },
            { label: "Net Theta", value: fmt2(last.theta), unit: "Θ", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-800" },
          ].map((g) => (
            <div key={g.label} className={cn("rounded-xl border p-3", g.bgColor)}>
              <div className="text-xs text-zinc-500 mb-1">{g.label}</div>
              <div className={cn("text-xl font-bold font-mono", g.color)}>
                {g.value}
                <span className="text-sm ml-1 opacity-60">{g.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Delta over time */}
        <div className="mb-4">
          <div className="text-xs text-zinc-500 mb-2">Delta inventory over time (target: 0)</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28" preserveAspectRatio="none">
            <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#52525b" strokeWidth={1} strokeDasharray="4,4" />
            {data.map((d, i) => {
              const height = Math.abs(gammaNorm[i].gNorm);
              const isPos = d.gamma >= 0;
              return (
                <rect
                  key={i}
                  x={toX(d.t) - 5}
                  y={isPos ? H / 2 - height : H / 2}
                  width={10}
                  height={height}
                  fill={isPos ? "#f59e0b33" : "#f59e0b22"}
                  rx={1}
                />
              );
            })}
            <path d={deltaPath} fill="none" stroke="#60a5fa" strokeWidth={2} />
            {data.map((d, i) =>
              i % 5 === 0 ? (
                <circle key={i} cx={toX(d.t)} cy={toYDelta(d.delta)} r={3} fill="#60a5fa" />
              ) : null
            )}
            <text x={4} y={12} fill="#60a5fa" fontSize={10}>
              Delta
            </text>
            <text x={4} y={H - 4} fill="#f59e0b" fontSize={10}>
              Gamma bars
            </text>
          </svg>
        </div>

        {/* PnL */}
        <div>
          <div className="text-xs text-zinc-500 mb-2">Cumulative P&amp;L (spread income minus hedge costs)</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path
              d={pnlPath + ` L ${W} ${H} L 0 ${H} Z`}
              fill="url(#pnlGrad)"
            />
            <path d={pnlPath} fill="none" stroke="#34d399" strokeWidth={2} />
            <text x={4} y={12} fill="#34d399" fontSize={10}>
              Cumulative P&L
            </text>
          </svg>
        </div>
      </div>

      {/* Dynamic Hedging */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="text-primary" size={15} />
            <h3 className="text-sm font-semibold text-zinc-200">Dynamic Hedging Frequency</h3>
          </div>
          <div className="space-y-3 text-xs">
            {[
              { regime: "Low vol (VIX < 15)", freq: "End of day", cost: "Low", note: "Delta stable, hedge less" },
              { regime: "Normal (VIX 15-25)", freq: "Hourly", cost: "Moderate", note: "Balanced gamma/cost tradeoff" },
              { regime: "High vol (VIX 25-40)", freq: "Every 15-30m", cost: "High", note: "Gamma spikes, risk of large moves" },
              { regime: "Extreme (VIX > 40)", freq: "Quote-by-quote", cost: "Very High", note: "Crisis mode, widen spreads or pull" },
            ].map((r) => (
              <div key={r.regime} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded">
                <div className="w-36 text-zinc-300 font-medium">{r.regime}</div>
                <div className="flex-1">
                  <span className="text-amber-400 font-semibold">{r.freq}</span>
                </div>
                <div className="text-zinc-500">{r.note}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-zinc-800/60 rounded text-xs text-zinc-400">
            Hedging cost = Γ × (ΔS)² × 0.5. Higher gamma positions require more frequent rebalancing. Transaction costs
            limit how often hedges can be placed.
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="text-rose-400" size={15} />
            <h3 className="text-sm font-semibold text-zinc-200">Position &amp; Risk Limits</h3>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { limit: "Delta limit", value: "±5,000 shares equiv.", color: "text-primary" },
              { limit: "Gamma limit", value: "±500 per $1 move", color: "text-amber-400" },
              { limit: "Vega limit", value: "±$50,000 per vol point", color: "text-primary" },
              { limit: "Single-name conc.", value: "20% of book per ticker", color: "text-zinc-300" },
              { limit: "Loss stop (daily)", value: "$250,000 hard stop", color: "text-rose-400" },
              { limit: "Loss stop (weekly)", value: "$800,000 review trigger", color: "text-rose-500" },
            ].map((l) => (
              <div key={l.limit} className="flex items-center justify-between p-2 bg-zinc-800/40 rounded">
                <span className="text-zinc-400">{l.limit}</span>
                <span className={cn("font-mono font-semibold", l.color)}>{l.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Correlation Heatmap */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Cross-Asset Correlation Heatmap</h3>
        <p className="text-xs text-zinc-500 mb-4">
          MMs with positions across multiple underlyings can use correlation to net exposures. High correlation between
          SPY/QQQ means a long vega in SPY partially offsets a short vega in QQQ.
        </p>
        <div className="overflow-x-auto">
          <table className="text-xs text-center">
            <thead>
              <tr>
                <th className="w-12" />
                {tickers.map((t) => (
                  <th key={t} className="w-14 py-1 text-zinc-400 font-medium">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corrMatrix.map((row, ri) => (
                <tr key={tickers[ri]}>
                  <td className="text-zinc-400 font-medium pr-2 text-right">{tickers[ri]}</td>
                  {row.map((val, ci) => (
                    <td key={ci} className="p-0.5">
                      <div
                        className={cn(
                          "w-12 h-9 rounded flex items-center justify-center font-mono font-semibold",
                          corrColor(val),
                          ri === ci ? "opacity-100" : "opacity-90"
                        )}
                      >
                        <span className="text-white text-[11px]">{val.toFixed(2)}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>High positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-zinc-700" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-800" />
            <span>Negative</span>
          </div>
        </div>
      </div>

      {/* Pin Risk */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="text-amber-400" size={15} />
          <h3 className="text-sm font-semibold text-zinc-200">Pin Risk Management Near Expiry</h3>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          When spot price &quot;pins&quot; near a strike at expiry, the delta of the option swings violently between 0 and 1.
          A market maker with short gamma at that strike faces extreme hedging costs or unhedgeable gaps.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400">Strike</th>
                <th className="text-left py-2 text-zinc-400">Days to Expiry</th>
                <th className="text-left py-2 text-zinc-400">Pin Risk Level</th>
                <th className="text-left py-2 text-zinc-400">Notes</th>
              </tr>
            </thead>
            <tbody>
              {pinRiskData.map((row) => (
                <tr key={row.strike} className="border-b border-zinc-800/40">
                  <td className="py-2 font-mono text-zinc-200">${row.strike}</td>
                  <td className="py-2 text-zinc-400">{row.daysOut}d</td>
                  <td className="py-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        row.pinRisk === "Extreme"
                          ? "border-rose-600 text-rose-400"
                          : row.pinRisk === "Medium"
                          ? "border-amber-600 text-amber-400"
                          : "border-zinc-600 text-zinc-400"
                      )}
                    >
                      {row.pinRisk}
                    </Badge>
                  </td>
                  <td className="py-2 text-zinc-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 bg-rose-900/20 border border-rose-800/30 rounded text-xs text-rose-300">
          <span className="font-semibold">Defense: </span>
          MMs reduce or close positions near pinned strikes before expiry Friday. Some firms use automated systems to
          detect pinning behavior and adjust quotes dynamically.
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Adverse Selection ──────────────────────────────────────────────────

function generateVPIN(): FlowDataPoint[] {
  resetSeed(900);
  const pts: FlowDataPoint[] = [];
  let vpin = 0.3 + rand() * 0.15;

  for (let t = 0; t < 50; t++) {
    const shock = (rand() - 0.48) * 0.06;
    vpin = Math.max(0.1, Math.min(0.95, vpin + shock));
    const toxicity: FlowDataPoint["toxicity"] =
      vpin > 0.65 ? "high" : vpin > 0.45 ? "medium" : "low";
    const informedRatio = vpin * 0.8;
    pts.push({
      t,
      vpin,
      toxicity,
      informed: informedRatio,
      uninformed: 1 - informedRatio,
    });
  }
  return pts;
}

function AdverseSelectionTab() {
  const vpinData = useMemo(() => generateVPIN(), []);
  const W = 600;
  const H = 140;

  const vpinPath = vpinData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${(i / (vpinData.length - 1)) * W} ${H - 8 - d.vpin * (H - 16)}`)
    .join(" ");

  const toxicityColor = (t: FlowDataPoint["toxicity"]) =>
    t === "high" ? "text-rose-400" : t === "medium" ? "text-amber-400" : "text-emerald-400";

  const orderTypes = [
    {
      type: "Small retail order",
      size: "1-5 contracts",
      inference: "Uninformed",
      action: "Quote normally, full size",
      color: "text-emerald-400",
    },
    {
      type: "Medium institutional",
      size: "50-200 contracts",
      inference: "Likely informed",
      action: "Widen spread 20-40%",
      color: "text-amber-400",
    },
    {
      type: "Large sweep (unusual)",
      size: "500+ contracts, multi-leg",
      inference: "Highly informed",
      action: "Partial fill, escalate",
      color: "text-rose-400",
    },
    {
      type: "OTM call near earnings",
      size: "Any size",
      inference: "Possibly informed",
      action: "Widen spreads pre-event",
      color: "text-amber-400",
    },
    {
      type: "Dark pool crossing",
      size: "Block (>10k contracts)",
      inference: "Institutional rebalance",
      action: "Risk manage post-fill",
      color: "text-primary",
    },
  ];

  const informationExamples = [
    {
      scenario: "Earnings insider buying calls",
      detection: "Unusual OTM call volume spikes 3-5 days before earnings",
      impact: "MM sells calls to informed, buys expensive hedges",
      realCase: "SAC Capital, Raj Rajaratnam (Galleon Group)",
    },
    {
      scenario: "M&A leak (merger arbitrage)",
      detection: "Deep ITM calls or OTM call spreads in target company",
      impact: "MM short calls, stock gaps up, catastrophic loss",
      realCase: "Multiple SEC enforcement actions 2011-2022",
    },
    {
      scenario: "Fed decision flow",
      detection: "Options on rate-sensitive sectors (TLT, XLF) surge pre-FOMC",
      impact: "Wider spreads in rates/vol complex pre-announcement",
      realCase: "Common pattern, not necessarily illegal",
    },
  ];

  return (
    <div className="space-y-6">
      {/* VPIN Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <Gauge className="text-rose-400" size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">VPIN — Flow Toxicity Metric</h3>
            <p className="text-xs text-zinc-500">Volume-synchronized Probability of Informed Trading (Easley, Lopez de Prado, O&apos;Hara 2012)</p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          VPIN estimates the fraction of order flow from informed traders. High VPIN (≥0.65) signals toxic flow — the MM
          is likely trading against someone who knows more. This leads to widened spreads, reduced quote size, or complete
          withdrawal from the market.
        </p>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36 mb-2" preserveAspectRatio="none">
          <defs>
            <linearGradient id="vpinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* Threshold zones */}
          <rect x={0} y={H - 8 - 0.65 * (H - 16)} width={W} height={0.65 * (H - 16)} fill="#ef444408" />
          <line
            x1={0} y1={H - 8 - 0.65 * (H - 16)}
            x2={W} y2={H - 8 - 0.65 * (H - 16)}
            stroke="#ef4444" strokeWidth={1} strokeDasharray="4,4"
          />
          <line
            x1={0} y1={H - 8 - 0.45 * (H - 16)}
            x2={W} y2={H - 8 - 0.45 * (H - 16)}
            stroke="#f59e0b" strokeWidth={1} strokeDasharray="4,4"
          />
          <path
            d={vpinPath + ` L ${W} ${H} L 0 ${H} Z`}
            fill="url(#vpinGrad)"
          />
          <path d={vpinPath} fill="none" stroke="#f87171" strokeWidth={2} />
          <text x={W - 60} y={H - 8 - 0.65 * (H - 16) - 3} fill="#ef4444" fontSize={9}>
            HIGH TOXIC
          </text>
          <text x={W - 60} y={H - 8 - 0.45 * (H - 16) - 3} fill="#f59e0b" fontSize={9}>
            MEDIUM
          </text>
          <text x={4} y={12} fill="#f87171" fontSize={10}>
            VPIN
          </text>
        </svg>

        <div className="flex gap-4 text-xs mt-2">
          {(["low", "medium", "high"] as const).map((t) => {
            const count = vpinData.filter((d) => d.toxicity === t).length;
            return (
              <div key={t} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    t === "high" ? "bg-rose-500" : t === "medium" ? "bg-amber-500" : "bg-emerald-500"
                  )}
                />
                <span className={toxicityColor(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}: {count} bars
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Flow Intelligence */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Options Order Flow Intelligence</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400">Order Type</th>
                <th className="text-left py-2 text-zinc-400">Size</th>
                <th className="text-left py-2 text-zinc-400">Inference</th>
                <th className="text-left py-2 text-zinc-400">MM Response</th>
              </tr>
            </thead>
            <tbody>
              {orderTypes.map((o) => (
                <tr key={o.type} className="border-b border-zinc-800/40">
                  <td className="py-2 text-zinc-300 font-medium">{o.type}</td>
                  <td className="py-2 text-zinc-500 font-mono">{o.size}</td>
                  <td className={cn("py-2 font-semibold", o.color)}>{o.inference}</td>
                  <td className="py-2 text-zinc-400">{o.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block Trades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="text-primary" size={15} />
            <h3 className="text-sm font-semibold text-zinc-200">Block Trade Mechanics</h3>
          </div>
          <div className="space-y-3 text-xs text-zinc-400">
            <p>
              Block trades (large institutional orders) bypass the open market and are negotiated directly with a market
              maker. This protects the institution from market impact but exposes the MM to more adverse selection.
            </p>
            <div className="space-y-2">
              {[
                { step: "1", desc: "Broker approaches MM with block inquiry (price + size)", color: "text-zinc-300" },
                { step: "2", desc: "MM prices in adverse selection premium (typically 5-20%)", color: "text-amber-400" },
                { step: "3", desc: "Trade executed at negotiated price, off-exchange", color: "text-zinc-300" },
                { step: "4", desc: "MM immediately begins delta hedging to flatten exposure", color: "text-primary" },
                { step: "5", desc: "MM unwinds position over time across multiple venues", color: "text-zinc-300" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-400 shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <span className={s.color}>{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="text-primary" size={15} />
            <h3 className="text-sm font-semibold text-zinc-200">Dark Pool Interplay</h3>
          </div>
          <div className="space-y-3 text-xs text-zinc-400">
            <p>
              Dark pools allow large orders to execute without revealing size to the market. Options MMs interact with
              dark pools primarily through their equity hedging activity.
            </p>
            <div className="space-y-2">
              {[
                { label: "Dark pool equity share", value: "~38% of US equity volume", color: "text-zinc-200" },
                { label: "Options MM dark activity", value: "Primarily for delta hedges", color: "text-primary" },
                { label: "Information leakage", value: "Dark prints reveal institutional flow", color: "text-amber-400" },
                { label: "Latency advantage", value: "HFT firms monitor dark prints for alpha", color: "text-rose-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2 bg-zinc-800/40 rounded">
                  <span>{item.label}</span>
                  <span className={cn("font-medium", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Information Asymmetry */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-amber-400" size={15} />
          <h3 className="text-sm font-semibold text-zinc-200">Information Asymmetry Examples</h3>
        </div>
        <div className="space-y-3">
          {informationExamples.map((ex) => (
            <div key={ex.scenario} className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
              <div className="text-sm font-semibold text-zinc-200 mb-2">{ex.scenario}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-zinc-500 mb-1">Detection signal</div>
                  <div className="text-primary">{ex.detection}</div>
                </div>
                <div>
                  <div className="text-zinc-500 mb-1">MM impact</div>
                  <div className="text-rose-400">{ex.impact}</div>
                </div>
                <div>
                  <div className="text-zinc-500 mb-1">Real-world case</div>
                  <div className="text-zinc-300">{ex.realCase}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Halts */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="text-rose-400" size={15} />
          <h3 className="text-sm font-semibold text-zinc-200">Trading Halt Triggers</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { trigger: "LULD Circuit Breaker", desc: "5% move in underlying in 5 minutes → 5 min halt", severity: "Automatic" },
            { trigger: "Market-wide circuit breaker", desc: "S&P 500 drops 7%, 13%, or 20%", severity: "Automatic" },
            { trigger: "Regulatory halt", desc: "Exchange or SEC-ordered halt for news pending", severity: "Regulatory" },
            { trigger: "MM internal kill switch", desc: "Firm-level loss limit or risk limit breached", severity: "Voluntary" },
            { trigger: "Erroneous trade rule", desc: "Trades at prices significantly away from market", severity: "Exchange" },
          ].map((h) => (
            <div key={h.trigger} className="p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-zinc-200">{h.trigger}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    h.severity === "Automatic"
                      ? "border-rose-700 text-rose-400"
                      : h.severity === "Voluntary"
                      ? "border-emerald-700 text-emerald-400"
                      : "border-zinc-600 text-zinc-400"
                  )}
                >
                  {h.severity}
                </Badge>
              </div>
              <p className="text-zinc-500">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Economics ──────────────────────────────────────────────────────────

function generateProfitBars(): ProfitBar[] {
  resetSeed(900);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month) => {
    const vol = rand();
    const spreadIncome = 800 + vol * 600 + rand() * 200;
    const hedgeCosts = -(300 + rand() * 200);
    const adverseSelection = -(150 + rand() * 150);
    const net = spreadIncome + hedgeCosts + adverseSelection;
    return { month, spreadIncome, hedgeCosts, adverseSelection, net };
  });
}

function EconomicsTab() {
  const profitData = useMemo(() => generateProfitBars(), []);
  const maxProfit = Math.max(...profitData.map((d) => d.spreadIncome));
  const minNet = Math.min(...profitData.map((d) => d.net));

  const marketPlayers = [
    { name: "Citadel Securities", share: 0.28, specialty: "Equity & options, PFOF dominant", color: "bg-primary" },
    { name: "Susquehanna (SIG)", share: 0.18, specialty: "Options specialist, vol arbitrage", color: "bg-primary" },
    { name: "Virtu Financial", share: 0.15, specialty: "Multi-asset HFT", color: "bg-emerald-500" },
    { name: "IMC Trading", share: 0.12, specialty: "Options & ETFs, European roots", color: "bg-amber-500" },
    { name: "Wolverine Trading", share: 0.08, specialty: "Options, complex spreads", color: "bg-rose-500" },
    { name: "Other / Regional", share: 0.19, specialty: "Exchange specialists, boutiques", color: "bg-zinc-600" },
  ];

  const pfofData = [
    { broker: "Robinhood", pfof2022: "$0.0034", model: "PFOF dominant", profitSource: "Options flow" },
    { broker: "Schwab", pfof2022: "$0.0019", model: "Hybrid PFOF", profitSource: "Equity + options" },
    { broker: "TD Ameritrade", pfof2022: "$0.0036", model: "PFOF dominant", profitSource: "Options premium" },
    { broker: "E*TRADE", pfof2022: "$0.0021", model: "Hybrid", profitSource: "Mixed" },
    { broker: "Interactive Brokers", pfof2022: "$0.0000", model: "IEX / no PFOF", profitSource: "Commissions" },
  ];

  const W = 600;
  const H = 160;
  const barW = W / profitData.length - 2;

  const latencyTimeline = [
    { year: "2000s", latency: "Milliseconds", tech: "Co-location begins", key: false },
    { year: "2010", latency: "100 microseconds", tech: "FPGA processing", key: true },
    { year: "2015", latency: "10 microseconds", tech: "Custom NICs, kernel bypass", key: false },
    { year: "2020", latency: "1 microsecond", tech: "ASIC acceleration", key: true },
    { year: "2024", latency: "~200 nanoseconds", tech: "Optical & photonics R&D", key: false },
  ];

  return (
    <div className="space-y-6">
      {/* Profitability Model */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <DollarSign className="text-emerald-400" size={16} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">MM Profitability Model</h3>
        </div>
        <div className="p-4 bg-zinc-800/50 rounded-xl font-mono text-xs mb-5">
          <div className="text-zinc-400 mb-2">// Annual P&amp;L formula</div>
          <div className="text-emerald-400">Net P&amp;L =</div>
          <div className="text-zinc-300 ml-4">+ Spread Income (bid-ask × volume)</div>
          <div className="text-rose-400 ml-4">- Hedge Costs (delta rebalancing txn costs)</div>
          <div className="text-rose-500 ml-4">- Adverse Selection Losses</div>
          <div className="text-zinc-500 ml-4">- Infrastructure &amp; Technology</div>
          <div className="text-zinc-500 ml-4">- Regulatory Capital Costs</div>
        </div>

        {/* Monthly bars */}
        <div className="text-xs text-zinc-500 mb-2">Monthly P&amp;L breakdown ($000s)</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40 mb-2" preserveAspectRatio="none">
          {profitData.map((d, i) => {
            const x = i * (barW + 2);
            const spreadH = (d.spreadIncome / maxProfit) * (H - 30);
            const hedgeH = (Math.abs(d.hedgeCosts) / maxProfit) * (H - 30);
            const advH = (Math.abs(d.adverseSelection) / maxProfit) * (H - 30);
            return (
              <g key={d.month}>
                <rect x={x} y={H - 20 - spreadH} width={barW} height={spreadH} fill="#34d39966" rx={1} />
                <rect x={x} y={H - 20 - spreadH + hedgeH} width={barW / 2} height={hedgeH} fill="#f8717166" rx={1} />
                <rect x={x + barW / 2} y={H - 20 - spreadH + hedgeH + advH} width={barW / 2} height={advH} fill="#fb923c66" rx={1} />
                <text x={x + barW / 2} y={H - 6} textAnchor="middle" fill="#71717a" fontSize={9}>
                  {d.month}
                </text>
                <text
                  x={x + barW / 2}
                  y={H - 20 - spreadH - 3}
                  textAnchor="middle"
                  fill={d.net > 400 ? "#34d399" : d.net > 200 ? "#f59e0b" : "#f87171"}
                  fontSize={8}
                >
                  {Math.round(d.net)}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/60" />
            <span className="text-zinc-500">Spread income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-500/60" />
            <span className="text-zinc-500">Hedge costs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-500/60" />
            <span className="text-zinc-500">Adverse selection</span>
          </div>
        </div>
        <div className="text-xs text-zinc-500 mt-1">Values in $000s. Net shown above bars.</div>
      </div>

      {/* Market Share */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Options MM Market Share (US)</h3>
        <div className="space-y-3">
          {marketPlayers.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <div className="w-36 text-xs text-zinc-300 font-medium truncate">{p.name}</div>
              <div className="flex-1 h-5 bg-zinc-800 rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.share * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className={cn("h-full rounded", p.color, "opacity-70")}
                />
              </div>
              <div className="w-10 text-xs text-zinc-400 text-right">{Math.round(p.share * 100)}%</div>
              <div className="w-48 text-xs text-zinc-500 hidden xl:block">{p.specialty}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PFOF vs Maker-Taker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Payment for Order Flow (PFOF)</h3>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            MMs pay brokers for retail order flow because retail is typically uninformed (low VPIN). This &quot;payment&quot;
            is the expected profit from trading against uninformed flow, shared with the broker.
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400">Broker</th>
                <th className="text-left py-2 text-zinc-400">PFOF/share</th>
                <th className="text-left py-2 text-zinc-400">Model</th>
              </tr>
            </thead>
            <tbody>
              {pfofData.map((r) => (
                <tr key={r.broker} className="border-b border-zinc-800/40">
                  <td className="py-1.5 text-zinc-300">{r.broker}</td>
                  <td className={cn("py-1.5 font-mono font-semibold", r.pfof2022 === "$0.0000" ? "text-zinc-500" : "text-emerald-400")}>
                    {r.pfof2022}
                  </td>
                  <td className="py-1.5 text-zinc-500">{r.model}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Maker-Taker vs PFOF Comparison</h3>
          <div className="space-y-3 text-xs">
            {[
              {
                model: "Maker-Taker (exchange)",
                pro: "Transparent pricing, competitive quotes",
                con: "Rebate races can reduce quote quality",
                color: "text-primary",
              },
              {
                model: "PFOF (internalization)",
                pro: "Free commissions for retail, price improvement",
                con: "Conflict of interest, opacity, regulatory risk",
                color: "text-amber-400",
              },
              {
                model: "Auction/RFQ models",
                pro: "Best execution guarantees, transparent",
                con: "Higher latency, not suitable for all sizes",
                color: "text-emerald-400",
              },
            ].map((m) => (
              <div key={m.model} className="p-3 bg-zinc-800/50 rounded-lg">
                <div className={cn("font-semibold mb-2", m.color)}>{m.model}</div>
                <div className="flex gap-2">
                  <div>
                    <div className="text-zinc-500">Pro:</div>
                    <div className="text-emerald-300">{m.pro}</div>
                  </div>
                  <div className="w-px bg-zinc-700 mx-1" />
                  <div>
                    <div className="text-zinc-500">Con:</div>
                    <div className="text-rose-300">{m.con}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latency Arms Race SVG */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="text-amber-400" size={15} />
          <h3 className="text-sm font-semibold text-zinc-200">Latency Arms Race</h3>
        </div>
        <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
          Options MMs compete on speed. Being first to update quotes when the underlying moves avoids adverse selection
          from faster competitors. Each generation of speed improvement requires hundreds of millions in infrastructure.
        </p>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-700" />
          <div className="space-y-4 pl-10">
            {latencyTimeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-start gap-4"
              >
                <div
                  className={cn(
                    "absolute -left-6 mt-1 w-3 h-3 rounded-full border-2",
                    item.key
                      ? "border-amber-400 bg-amber-400/20"
                      : "border-zinc-600 bg-zinc-800"
                  )}
                />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-zinc-200">{item.year}</span>
                    <span className="text-xs font-mono text-amber-400">{item.latency}</span>
                    {item.key && (
                      <Badge variant="outline" className="text-[11px] border-amber-700 text-amber-400">
                        Milestone
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">{item.tech}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 2020 Vol Spike Case Study */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-rose-400" size={15} />
          <h3 className="text-sm font-semibold text-zinc-200">Case Study: March 2020 Vol Spike</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <div className="text-zinc-400 font-semibold mb-3">Timeline of Events</div>
            <div className="space-y-2">
              {[
                { date: "Feb 20, 2020", event: "S&P 500 peaks, VIX at 17", type: "neutral" },
                { date: "Feb 24, 2020", event: "European COVID cases surge, SPX -3.4%", type: "warning" },
                { date: "Mar 9, 2020", event: "Oil war + COVID panic, SPX -7.6%. VIX 55", type: "danger" },
                { date: "Mar 16, 2020", event: "Circuit breakers. VIX peaks at 85.47", type: "danger" },
                { date: "Mar 17-19", event: "MMs widen spreads 3-10x, reduced size", type: "danger" },
                { date: "Mar 23, 2020", event: "Fed unlimited QE. VIX starts declining", type: "neutral" },
              ].map((e) => (
                <div key={e.date} className="flex gap-2">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                      e.type === "danger"
                        ? "bg-rose-500"
                        : e.type === "warning"
                        ? "bg-amber-500"
                        : "bg-zinc-500"
                    )}
                  />
                  <div>
                    <span className="text-zinc-500">{e.date}: </span>
                    <span className="text-zinc-300">{e.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-zinc-400 font-semibold mb-3">MM Behavior During Crisis</div>
            <div className="space-y-2">
              {[
                { behavior: "Spread widening", detail: "SPX options spreads widened 5-15x. Bid-ask on 1-month ATM calls went from $0.50 to $5+", color: "text-rose-400" },
                { behavior: "Quote pulling", detail: "Some MMs withdrew quotes entirely in extreme names. Exchange rule 2104 does not require MMs to quote during halts", color: "text-amber-400" },
                { behavior: "Delta hedging panic", detail: "Massive gamma from short-dated options forced constant equity sales, amplifying the sell-off", color: "text-rose-400" },
                { behavior: "Skew explosion", detail: "Put skew hit multi-decade extremes. 25-delta put IV exceeded ATM IV by 15+ vol points", color: "text-primary" },
              ].map((b) => (
                <div key={b.behavior} className="p-2.5 bg-zinc-800/50 rounded">
                  <div className={cn("font-semibold mb-1", b.color)}>{b.behavior}</div>
                  <div className="text-zinc-500 leading-relaxed">{b.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-rose-900/20 border border-rose-800/30 rounded text-xs text-rose-300">
          <span className="font-semibold">Lesson: </span>
          During the 2020 crisis, options market makers that survived had (1) strong balance sheets to absorb losses, (2)
          automated risk systems that widened spreads gradually rather than shutting down entirely, and (3) diversified
          books not concentrated in a single direction.
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OptionsMmPage() {
  const [activeTab, setActiveTab] = useState("quoting");

  const tabs = [
    { id: "quoting", label: "Quoting & Spreads", icon: <ArrowUpDown size={14} /> },
    { id: "inventory", label: "Inventory Mgmt", icon: <BarChart3 size={14} /> },
    { id: "adverse", label: "Adverse Selection", icon: <Eye size={14} /> },
    { id: "economics", label: "Economics", icon: <DollarSign size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Activity className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-50">Options Market Making</h1>
              <p className="text-sm text-zinc-500">
                How market makers quote, manage inventory, detect adverse selection, and generate profits
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Bid-Ask Mechanics", color: "border-border text-primary" },
              { label: "Greeks Risk", color: "border-amber-800 text-amber-400" },
              { label: "VPIN / Flow Toxicity", color: "border-rose-800 text-rose-400" },
              { label: "PFOF & Rebates", color: "border-border text-primary" },
            ].map((tag) => (
              <Badge key={tag.label} variant="outline" className={cn("text-xs", tag.color)}>
                {tag.label}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 w-full justify-start overflow-x-auto h-auto p-1 gap-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-all",
                  "data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100",
                  "data-[state=inactive]:text-zinc-500 data-[state=inactive]:hover:text-zinc-300"
                )}
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="quoting" className="data-[state=inactive]:hidden">
            <QuotingTab />
          </TabsContent>
          <TabsContent value="inventory" className="data-[state=inactive]:hidden">
            <InventoryTab />
          </TabsContent>
          <TabsContent value="adverse" className="data-[state=inactive]:hidden">
            <AdverseSelectionTab />
          </TabsContent>
          <TabsContent value="economics" className="data-[state=inactive]:hidden">
            <EconomicsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
