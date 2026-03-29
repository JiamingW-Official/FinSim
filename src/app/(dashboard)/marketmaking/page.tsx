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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 59;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed: number = 59) {
  s = seed;
}

// ── Utility ────────────────────────────────────────────────────────────────────

function fmt2(n: number) {
  return n.toFixed(2);
}
function fmtPct(n: number) {
  return (n * 100).toFixed(2) + "%";
}
function fmtDollar(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface InventoryBar {
  t: number;
  inventory: number;
  spreadIncome: number;
  cumulativePnl: number;
  bid: number;
  ask: number;
  price: number;
}

interface AmmState {
  x: number; // token A reserves
  y: number; // token B reserves
}

// ── Inventory Simulation ───────────────────────────────────────────────────────

function simulateInventory(riskAversion: number): InventoryBar[] {
  resetSeed(59);
  const bars: InventoryBar[] = [];
  let inventory = 0;
  let cumulativePnl = 0;
  let spreadIncome = 0;
  const basePrice = 100;
  const sigma = 0.005;
  const maxInv = 1000;

  for (let t = 0; t < 30; t++) {
    const priceShock = (rand() - 0.5) * 2 * sigma * basePrice;
    const price = basePrice + (t > 0 ? (bars[t - 1]?.price ?? basePrice) - basePrice : 0) + priceShock;

    // Skew quotes based on inventory
    const skew = -(inventory / maxInv) * 0.05;
    const baseSpread = 0.10 + riskAversion * 0.08;
    const bid = price * (1 - baseSpread / 2 + skew);
    const ask = price * (1 + baseSpread / 2 + skew);

    // Simulate fills (random buy/sell)
    const r = rand();
    let tradeQty = 0;
    if (r < 0.35 && Math.abs(inventory + 100) <= maxInv) {
      tradeQty = 100; // we sell (inventory increases)
      inventory += 100;
      spreadIncome += (ask - price) * 100;
    } else if (r > 0.65 && Math.abs(inventory - 100) <= maxInv) {
      tradeQty = -100; // we buy (inventory decreases)
      inventory -= 100;
      spreadIncome += (price - bid) * 100;
    }

    // Inventory risk P&L from price moves
    const invRisk = inventory * priceShock;
    cumulativePnl += spreadIncome - Math.abs(invRisk) * 0.3;

    bars.push({ t, inventory, spreadIncome, cumulativePnl, bid, ask, price: price });
  }
  return bars;
}

// ── Tab 1: Market Making 101 ──────────────────────────────────────────────────

function Tab101() {
  const [expandedSection, setExpandedSection] = useState<string | null>("how");

  const sections = [
    {
      id: "how",
      icon: <BookOpen size={16} />,
      title: "How Market Makers Work",
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Market makers simultaneously post <span className="text-emerald-400 font-semibold">bid</span> (buy) and{" "}
            <span className="text-rose-400 font-semibold">ask</span> (sell) quotes, earning the{" "}
            <span className="text-amber-400 font-semibold">spread</span> — the difference between the two prices.
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-1">
            <div className="text-muted-foreground">Example: AAPL</div>
            <div className="flex justify-between">
              <span className="text-emerald-400">Bid: $189.45</span>
              <span className="text-muted-foreground">← Buy from public</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rose-400">Ask: $189.47</span>
              <span className="text-muted-foreground">← Sell to public</span>
            </div>
            <div className="border-t border-border pt-1 mt-1">
              <span className="text-amber-400">Spread: $0.02 = 1.06 bps</span>
            </div>
          </div>
          <p>
            With high volume, even a 1 cent spread on 10 million shares/day = <span className="text-amber-400 font-bold">$100,000/day</span>.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { name: "Citadel Securities", share: "~25%", note: "US equities volume" },
              { name: "Virtu Financial", share: "~20%", note: "Multi-asset HFT MM" },
              { name: "NYSE Specialists", share: "Historic", note: "Obligated quoters" },
            ].map((e) => (
              <div key={e.name} className="bg-muted rounded p-2 text-center">
                <div className="font-semibold text-foreground text-xs">{e.name}</div>
                <div className="text-amber-400 text-xs">{e.share}</div>
                <div className="text-muted-foreground text-xs">{e.note}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "decomp",
      icon: <Layers size={16} />,
      title: "Spread Decomposition",
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>The quoted spread has three components:</p>
          <div className="space-y-2">
            {[
              {
                label: "Inventory Risk",
                pct: 35,
                color: "bg-amber-500",
                desc: "Compensation for holding risky position while waiting to offset",
              },
              {
                label: "Adverse Selection",
                pct: 40,
                color: "bg-rose-500",
                desc: "Protection against informed traders who know more than the MM",
              },
              {
                label: "Operational Cost",
                pct: 25,
                color: "bg-primary",
                desc: "Technology, co-location, exchange fees, compliance",
              },
            ].map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground">{c.label}</span>
                  <span className="text-muted-foreground">{c.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                  <div className={cn("h-full rounded-full", c.color)} style={{ width: `${c.pct}%` }} />
                </div>
                <div className="text-muted-foreground text-xs">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "pnl",
      icon: <DollarSign size={16} />,
      title: "Market Maker P&L",
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-2">
            <div className="text-muted-foreground font-sans font-semibold mb-2">P&L Formula</div>
            <div className="text-emerald-400">Gross P&L = ½ × spread × volume_filled</div>
            <div className="text-rose-400">− Inventory Risk = σ² × |position| × T</div>
            <div className="text-amber-400">− Adverse Selection = α × |informed_flow|</div>
            <div className="border-t border-border pt-2 text-foreground">
              Net P&L = Gross − Inventory − Adverse
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { metric: "Fill Rate", val: "85-95%", good: true },
              { metric: "Inventory Turn", val: "10-30×/day", good: true },
              { metric: "Gross Spread", val: "0.5-5 bps", good: true },
              { metric: "Net Spread", val: "0.1-2 bps", good: true },
              { metric: "Sharpe Ratio", val: "3-8×", good: true },
              { metric: "Max Drawdown", val: "<2%/day", good: true },
            ].map((m) => (
              <div key={m.metric} className="bg-muted rounded p-2">
                <div className="text-muted-foreground text-xs">{m.metric}</div>
                <div className="text-amber-400 font-mono text-xs font-bold">{m.val}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "as",
      icon: <Target size={16} />,
      title: "Avellaneda-Stoikov Model",
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>The A-S model gives the theoretically optimal bid-ask spread for a risk-averse market maker:</p>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-muted-foreground text-xs mb-2">Optimal Spread (δ)</div>
            <div className="font-mono text-amber-400 text-sm">
              δ* = q · σ² · γ · T + (2/γ) · ln(1 + γ/k)
            </div>
          </div>
          <div className="space-y-1 text-xs">
            {[
              { sym: "q", desc: "inventory position (shares held)" },
              { sym: "σ²", desc: "variance of asset price" },
              { sym: "γ", desc: "risk-aversion parameter (higher → wider spread)" },
              { sym: "T", desc: "time horizon (e.g. time remaining until close)" },
              { sym: "k", desc: "order arrival intensity (liquidity of stock)" },
            ].map((v) => (
              <div key={v.sym} className="flex gap-2">
                <span className="font-mono text-emerald-400 w-6 shrink-0">{v.sym}</span>
                <span className="text-muted-foreground">{v.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            Key insight: as inventory grows, the first term dominates — you widen spreads on the side that would increase exposure.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {sections.map((sec) => (
        <motion.div
          key={sec.id}
          className="bg-card border border-border rounded-xl overflow-hidden"
          layout
        >
          <button
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            onClick={() => setExpandedSection(expandedSection === sec.id ? null : sec.id)}
          >
            <div className="flex items-center gap-2 text-foreground font-medium text-sm">
              <span className="text-primary">{sec.icon}</span>
              {sec.title}
            </div>
            <motion.span
              animate={{ rotate: expandedSection === sec.id ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} className="text-muted-foreground" />
            </motion.span>
          </button>
          <AnimatePresence>
            {expandedSection === sec.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">{sec.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// ── Tab 2: Spread Modeling ─────────────────────────────────────────────────────

function TabSpread() {
  const [volatility, setVolatility] = useState(20); // annualized vol %
  const [adv, setAdv] = useState(5); // ADV in millions
  const [invLimit, setInvLimit] = useState(500); // shares
  const [riskAversion, setRiskAversion] = useState(0.5); // 0-1

  const model = useMemo(() => {
    const sigma = volatility / 100 / Math.sqrt(252); // daily vol
    const gamma = riskAversion * 0.002;
    const k = adv / 5; // order arrival proxy
    const T = 0.5; // half day

    // A-S model
    const inventoryTerm = invLimit * sigma * sigma * gamma * T;
    const orderTerm = k > 0 ? (2 / gamma) * Math.log(1 + gamma / k) : 0;
    const optimalSpread = Math.max(0.001, inventoryTerm + orderTerm);

    // Decomposition
    const inventoryRiskComp = inventoryTerm / Math.max(optimalSpread, 0.001);
    const adverseSelComp = 0.35; // fixed fraction
    const opCostComp = 1 - Math.min(0.95, inventoryRiskComp + adverseSelComp);

    const quotedSpreadBps = optimalSpread * 10000;
    const realizedSpreadBps = quotedSpreadBps * 0.65; // typical haircut

    return {
      optimalSpread,
      quotedSpreadBps,
      realizedSpreadBps,
      inventoryRiskComp: Math.min(0.6, inventoryRiskComp),
      adverseSelComp,
      opCostComp: Math.max(0.05, opCostComp),
      dailyPnlPerMM: (realizedSpreadBps / 10000) * adv * 1e6 * 0.5,
    };
  }, [volatility, adv, invLimit, riskAversion]);

  // SVG decomposition chart
  const chartW = 340;
  const chartH = 140;
  const barW = 80;
  const comps = [
    { label: "Order Cost", val: model.opCostComp, color: "#3b82f6" },
    { label: "Inventory Risk", val: model.inventoryRiskComp, color: "#f59e0b" },
    { label: "Adverse Selection", val: model.adverseSelComp, color: "#ef4444" },
  ];
  const total = comps.reduce((a, c) => a + c.val, 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground">Market Parameters</div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Annual Volatility</span>
              <span className="text-amber-400 font-mono">{volatility}%</span>
            </div>
            <Slider
              value={[volatility]}
              onValueChange={([v]) => setVolatility(v)}
              min={5}
              max={80}
              step={1}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">ADV (M shares)</span>
              <span className="text-amber-400 font-mono">{adv}M</span>
            </div>
            <Slider
              value={[adv]}
              onValueChange={([v]) => setAdv(v)}
              min={0.5}
              max={50}
              step={0.5}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Inventory Limit</span>
              <span className="text-amber-400 font-mono">{invLimit} sh</span>
            </div>
            <Slider
              value={[invLimit]}
              onValueChange={([v]) => setInvLimit(v)}
              min={100}
              max={5000}
              step={100}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Risk Aversion (γ)</span>
              <span className="text-amber-400 font-mono">{fmt2(riskAversion)}</span>
            </div>
            <Slider
              value={[riskAversion]}
              onValueChange={([v]) => setRiskAversion(v)}
              min={0.1}
              max={1.0}
              step={0.05}
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground">Optimal Quotes</div>
          <div className="space-y-2">
            {[
              {
                label: "Optimal (A-S) Spread",
                val: fmt2(model.quotedSpreadBps) + " bps",
                color: "text-amber-400",
              },
              {
                label: "Realized Spread",
                val: fmt2(model.realizedSpreadBps) + " bps",
                color: "text-emerald-400",
              },
              {
                label: "Daily P&L (est.)",
                val: fmtDollar(model.dailyPnlPerMM),
                color: "text-primary",
              },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center bg-muted rounded p-2">
                <span className="text-muted-foreground text-xs">{r.label}</span>
                <span className={cn("font-mono text-sm font-bold", r.color)}>{r.val}</span>
              </div>
            ))}
          </div>

          {/* Spread decomposition SVG */}
          <div className="text-xs text-muted-foreground mb-1">Spread Decomposition</div>
          <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
            {comps.map((c, i) => {
              const barH = (c.val / total) * (chartH - 20);
              const x = 30 + i * (barW + 20);
              const y = chartH - 20 - barH;
              return (
                <g key={c.label}>
                  <rect x={x} y={y} width={barW} height={barH} fill={c.color} opacity={0.85} rx={3} />
                  <text x={x + barW / 2} y={chartH - 5} textAnchor="middle" fill="#71717a" fontSize={9}>
                    {c.label}
                  </text>
                  <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill={c.color} fontSize={10} fontWeight="600">
                    {(c.val * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Info panel */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3">Key Insight</div>
        <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="bg-muted rounded p-3">
            <div className="text-amber-400 font-semibold mb-1">Quoted vs Realized</div>
            <p>Realized spread ≈ 65% of quoted due to adverse selection and market impact. A high-quality MM minimizes this gap.</p>
          </div>
          <div className="bg-muted rounded p-3">
            <div className="text-primary font-semibold mb-1">Risk-Aversion Effect</div>
            <p>Higher γ → wider spreads but lower fill rate. The optimal γ maximizes risk-adjusted P&L given your inventory constraints.</p>
          </div>
          <div className="bg-muted rounded p-3">
            <div className="text-rose-400 font-semibold mb-1">Adverse Selection</div>
            <p>Informed traders systematically trade against MMs. The AS component compensates for being on the wrong side of informed flow.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Inventory Management ────────────────────────────────────────────────

function TabInventory() {
  const [riskAversion, setRiskAversion] = useState(0.3);
  const [key, setKey] = useState(0);

  const bars = useMemo(() => simulateInventory(riskAversion), [riskAversion, key]);

  const maxInv = 1000;
  const svgW = 560;
  const svgH = 160;
  const pad = { l: 45, r: 10, t: 10, b: 25 };
  const iw = svgW - pad.l - pad.r;
  const ih = svgH - pad.t - pad.b;

  const invColor = (inv: number) => {
    const frac = Math.abs(inv) / maxInv;
    if (frac > 0.8) return "#ef4444";
    if (frac > 0.5) return "#f59e0b";
    return "#22c55e";
  };

  const maxPnl = Math.max(...bars.map((b) => Math.abs(b.cumulativePnl)), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">30-Period Market Making Simulation</div>
          <div className="text-xs text-muted-foreground">Seeded trades, ±1000 share inventory limit</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Risk Aversion</span>
            <div className="w-28">
              <Slider
                value={[riskAversion]}
                onValueChange={([v]) => setRiskAversion(v)}
                min={0.1}
                max={1.0}
                step={0.05}
              />
            </div>
            <span className="text-amber-400 font-mono text-xs w-8">{fmt2(riskAversion)}</span>
          </div>
          <button
            onClick={() => setKey((k) => k + 1)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted rounded px-2 py-1"
          >
            <RefreshCw size={12} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Final Inventory",
            val: bars[bars.length - 1]?.inventory ?? 0,
            suffix: " sh",
            color: Math.abs(bars[bars.length - 1]?.inventory ?? 0) > 500 ? "text-rose-400" : "text-emerald-400",
          },
          {
            label: "Spread Income",
            val: fmtDollar(bars[bars.length - 1]?.spreadIncome ?? 0),
            suffix: "",
            color: "text-emerald-400",
          },
          {
            label: "Net P&L",
            val: fmtDollar(bars[bars.length - 1]?.cumulativePnl ?? 0),
            suffix: "",
            color: (bars[bars.length - 1]?.cumulativePnl ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400",
          },
          {
            label: "Max |Inventory|",
            val: Math.max(...bars.map((b) => Math.abs(b.inventory))),
            suffix: " sh",
            color: "text-amber-400",
          },
        ].map((m) => (
          <div key={m.label} className="bg-card border border-border rounded-xl p-3">
            <div className="text-muted-foreground text-xs">{m.label}</div>
            <div className={cn("font-mono font-bold text-lg", m.color)}>
              {typeof m.val === "number" ? m.val + m.suffix : m.val}
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3">Inventory Position</div>
        <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          {/* Grid lines */}
          {[-1000, -500, 0, 500, 1000].map((v) => {
            const y = pad.t + ih / 2 - (v / maxInv) * (ih / 2);
            return (
              <g key={v}>
                <line x1={pad.l} x2={svgW - pad.r} y1={y} y2={y} stroke="#27272a" strokeWidth={v === 0 ? 1.5 : 0.5} />
                <text x={pad.l - 3} y={y + 3} textAnchor="end" fill="#71717a" fontSize={9}>
                  {v}
                </text>
              </g>
            );
          })}
          {/* Limit lines */}
          {[-maxInv, maxInv].map((v) => {
            const y = pad.t + ih / 2 - (v / maxInv) * (ih / 2);
            return (
              <line key={v} x1={pad.l} x2={svgW - pad.r} y1={y} y2={y} stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" />
            );
          })}
          {/* Bars */}
          {bars.map((b, i) => {
            const x = pad.l + (i / (bars.length - 1)) * iw;
            const midY = pad.t + ih / 2;
            const barH = (b.inventory / maxInv) * (ih / 2);
            const y = barH >= 0 ? midY - barH : midY;
            const color = invColor(b.inventory);
            return (
              <rect
                key={i}
                x={x - 6}
                y={barH >= 0 ? midY - Math.abs(barH) : midY}
                width={12}
                height={Math.abs(barH)}
                fill={color}
                opacity={0.8}
                rx={1}
              />
            );
          })}
        </svg>
      </div>

      {/* P&L Chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3">Cumulative P&L</div>
        <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          {[0, 0.5, 1].map((frac) => {
            const v = -maxPnl + frac * 2 * maxPnl;
            const y = pad.t + ih - (frac * ih);
            return (
              <g key={frac}>
                <line x1={pad.l} x2={svgW - pad.r} y1={y} y2={y} stroke="#27272a" strokeWidth={0.5} />
                <text x={pad.l - 3} y={y + 3} textAnchor="end" fill="#71717a" fontSize={9}>
                  {v >= 0 ? "$" + v.toFixed(0) : "-$" + Math.abs(v).toFixed(0)}
                </text>
              </g>
            );
          })}
          {/* Zero line */}
          {(() => {
            const y = pad.t + ih / 2;
            return <line x1={pad.l} x2={svgW - pad.r} y1={y} y2={y} stroke="#52525b" strokeWidth={1} />;
          })()}
          {/* P&L line */}
          <polyline
            points={bars
              .map((b, i) => {
                const x = pad.l + (i / (bars.length - 1)) * iw;
                const y = pad.t + ih / 2 - (b.cumulativePnl / maxPnl) * (ih / 2);
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#22c55e"
            strokeWidth={2}
          />
          {/* Spread income line */}
          <polyline
            points={bars
              .map((b, i) => {
                const x = pad.l + (i / (bars.length - 1)) * iw;
                const y = pad.t + ih - (b.spreadIncome / (maxPnl * 2)) * ih;
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
          {/* Legend */}
          <g>
            <line x1={pad.l + 10} x2={pad.l + 28} y1={14} y2={14} stroke="#22c55e" strokeWidth={2} />
            <text x={pad.l + 32} y={18} fill="#22c55e" fontSize={9}>Net P&L</text>
            <line x1={pad.l + 85} x2={pad.l + 103} y1={14} y2={14} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 2" />
            <text x={pad.l + 107} y={18} fill="#3b82f6" fontSize={9}>Spread Income</text>
          </g>
        </svg>
      </div>

      {/* Quote skewing info */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3">Quote Skewing Logic</div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-muted rounded p-3">
            <div className="text-emerald-400 font-semibold mb-1">Long Inventory → Skew Down</div>
            <p className="text-muted-foreground">Lower bid AND ask to attract sell orders. Accept worse prices to reduce position.</p>
          </div>
          <div className="bg-muted rounded p-3">
            <div className="text-rose-400 font-semibold mb-1">Short Inventory → Skew Up</div>
            <p className="text-muted-foreground">Raise bid AND ask to attract buy orders. Restore flat inventory at cost of spread.</p>
          </div>
          <div className="bg-muted rounded p-3">
            <div className="text-amber-400 font-semibold mb-1">EOD Close-Out</div>
            <p className="text-muted-foreground">Use market sweeps at close. Accept full adverse impact to avoid overnight inventory risk.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: AMM vs CLOB ─────────────────────────────────────────────────────────

function TabAMM() {
  const [priceMove, setPriceMove] = useState(20); // % price move
  const [feeTier, setFeeTier] = useState(0.3); // fee tier %

  const ammCalc = useMemo(() => {
    const priceMoveDecimal = priceMove / 100;
    const k = 1; // normalized x*y=k
    // Start: x=1, y=1, price=1
    const x0 = 1;
    const y0 = 1;
    const newPrice = 1 + priceMoveDecimal;
    // At new price: x1*y1=k and y1/x1 = newPrice => x1 = sqrt(k/newPrice), y1 = sqrt(k*newPrice)
    const x1 = Math.sqrt(k / newPrice);
    const y1 = Math.sqrt(k * newPrice);

    // Value if held: x0 * newPrice + y0 = newPrice + 1
    const holdValue = x0 * newPrice + y0;
    // Value in AMM: x1 * newPrice + y1 = 2*sqrt(newPrice)
    const ammValue = x1 * newPrice + y1;

    const il = (ammValue - holdValue) / holdValue;

    // Fee income per period (assume LP earns on volume)
    const volumePerPeriod = 0.5; // fraction of pool traded
    const feeIncome = volumePerPeriod * feeTier / 100;

    // Breakeven (days until fee income covers IL)
    const absIL = Math.abs(il);
    const breakeven = absIL > 0 ? Math.ceil(absIL / feeIncome) : 0;

    return { il, holdValue, ammValue, feeIncome, breakeven, x1, y1 };
  }, [priceMove, feeTier]);

  const comparisons = [
    { metric: "Execution Latency", amm: "~12 sec (block time)", clob: "< 1 microsecond", winner: "clob" },
    { metric: "Gas / Fees", amm: "High on L1 Ethereum", clob: "Exchange fees only", winner: "clob" },
    { metric: "Price Discovery", amm: "Arbitrage-driven", clob: "Real-time order flow", winner: "clob" },
    { metric: "Accessibility", amm: "Permissionless", clob: "Membership/approval", winner: "amm" },
    { metric: "Capital Efficiency", amm: "v3: High in range", clob: "Full order book depth", winner: "tie" },
    { metric: "MEV Risk", amm: "Sandwich attacks", clob: "Front-running orders", winner: "tie" },
    { metric: "Liquidity Depth", amm: "Constant product curve", clob: "Discreet price levels", winner: "tie" },
    { metric: "Transparency", amm: "On-chain, fully public", clob: "Exchange-dependent", winner: "amm" },
  ];

  const feeTiers = [0.05, 0.3, 1.0];

  // IL curve SVG
  const svgW = 340;
  const svgH = 120;
  const pad = { l: 40, r: 10, t: 10, b: 25 };
  const iw = svgW - pad.l - pad.r;
  const ih = svgH - pad.t - pad.b;
  const maxIL = 0.3;

  return (
    <div className="space-y-4">
      {/* Comparison table */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3">AMM vs CLOB Comparison</div>
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-muted-foreground pb-1 border-b border-border">
            <span>Metric</span>
            <span className="text-primary">AMM (Uniswap v2/v3)</span>
            <span className="text-primary">CLOB (NYSE / Binance)</span>
          </div>
          {comparisons.map((c) => (
            <div
              key={c.metric}
              className="grid grid-cols-3 gap-2 text-xs py-1.5 border-b border-border/50 hover:bg-muted/30 rounded px-1"
            >
              <span className="text-muted-foreground font-medium">{c.metric}</span>
              <span
                className={cn(
                  "text-muted-foreground",
                  c.winner === "amm" && "text-emerald-400 font-semibold",
                  c.winner === "tie" && "text-muted-foreground"
                )}
              >
                {c.amm}
              </span>
              <span
                className={cn(
                  "text-muted-foreground",
                  c.winner === "clob" && "text-emerald-400 font-semibold",
                  c.winner === "tie" && "text-muted-foreground"
                )}
              >
                {c.clob}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* IL Calculator */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground">Impermanent Loss Calculator</div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Price Move</span>
              <span className="text-amber-400 font-mono">+{priceMove}%</span>
            </div>
            <Slider
              value={[priceMove]}
              onValueChange={([v]) => setPriceMove(v)}
              min={1}
              max={100}
              step={1}
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Fee Tier</span>
              <span className="text-amber-400 font-mono">{feeTier}%</span>
            </div>
            <div className="flex gap-2">
              {feeTiers.map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFeeTier(ft)}
                  className={cn(
                    "flex-1 text-xs py-1 rounded border transition-colors",
                    feeTier === ft
                      ? "border-amber-500 text-amber-400 bg-amber-500/10"
                      : "border-border text-muted-foreground hover:border-zinc-500"
                  )}
                >
                  {ft}%
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 pt-1">
            {[
              { label: "Impermanent Loss", val: fmtPct(ammCalc.il), color: "text-rose-400" },
              { label: "Fee Income/Period", val: fmtPct(ammCalc.feeIncome), color: "text-emerald-400" },
              {
                label: "Breakeven (periods)",
                val: ammCalc.breakeven === 0 ? "∞" : ammCalc.breakeven.toString(),
                color: "text-primary",
              },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center bg-muted rounded px-3 py-2">
                <span className="text-muted-foreground text-xs">{r.label}</span>
                <span className={cn("font-mono text-sm font-bold", r.color)}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* IL Curve SVG */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs font-semibold text-muted-foreground mb-3">IL Curve (x×y=k)</div>
          <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
            {[0, 0.1, 0.2, 0.3].map((v) => {
              const y = pad.t + ih - (v / maxIL) * ih;
              return (
                <g key={v}>
                  <line x1={pad.l} x2={svgW - pad.r} y1={y} y2={y} stroke="#27272a" strokeWidth={0.5} />
                  <text x={pad.l - 3} y={y + 3} textAnchor="end" fill="#71717a" fontSize={9}>
                    -{(v * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
            {/* IL curve */}
            <path
              d={(() => {
                const pts = Array.from({ length: 60 }, (_, idx) => {
                  const move = (idx / 59) * 1; // 0 to 100% price move
                  const p = 1 + move;
                  const ammV = 2 * Math.sqrt(p);
                  const holdV = p + 1;
                  const il = Math.abs((ammV - holdV) / holdV);
                  const x = pad.l + (idx / 59) * iw;
                  const y = pad.t + ih - Math.min((il / maxIL) * ih, ih);
                  return `${x},${y}`;
                });
                return "M " + pts.join(" L ");
              })()}
              fill="none"
              stroke="#ef4444"
              strokeWidth={2}
            />
            {/* Current point */}
            {(() => {
              const move = priceMove / 100;
              const p = 1 + move;
              const ammV = 2 * Math.sqrt(p);
              const holdV = p + 1;
              const ilAbs = Math.abs((ammV - holdV) / holdV);
              const x = pad.l + (move / 1) * iw;
              const y = pad.t + ih - Math.min((ilAbs / maxIL) * ih, ih);
              return <circle cx={x} cy={y} r={4} fill="#f59e0b" stroke="#1c1917" strokeWidth={1.5} />;
            })()}
            <text x={pad.l + iw / 2} y={svgH - 2} textAnchor="middle" fill="#71717a" fontSize={9}>
              Price Move (0 → 100%)
            </text>
          </svg>
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="text-rose-400">Red curve:</span> IL grows with price move.{" "}
            <span className="text-amber-400">Dot:</span> current {priceMove}% scenario.
          </div>

          <div className="mt-3 bg-muted rounded p-3 text-xs space-y-1">
            <div className="text-muted-foreground font-semibold">Uniswap v3: Concentrated Liquidity</div>
            <p className="text-muted-foreground">
              LPs set a price range [pMin, pMax]. Capital efficiency = full-range LP multiplied by price_range_factor.
              Higher efficiency → higher IL if price exits range (position becomes all one token).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: HFT & Latency ───────────────────────────────────────────────────────

function TabHFT() {
  const [tradesPerDay, setTradesPerDay] = useState(100000);
  const [edgeMicros, setEdgeMicros] = useState(1);

  // Edge calculation: 1 microsecond at 100k trades/day
  const dailyEdge = useMemo(() => {
    // Each trade: latency advantage means ~50% chance of getting favorable fill vs competitor
    // Statistical edge: assume $0.0001 per share advantage, 100 shares avg
    const edgePerTrade = 0.0001 * 100 * (edgeMicros / 1); // scale with microsecond advantage
    return tradesPerDay * edgePerTrade;
  }, [tradesPerDay, edgeMicros]);

  const orderTypes = [
    {
      name: "IOC",
      full: "Immediate-or-Cancel",
      color: "text-primary",
      desc: "Fill immediately at the stated price or better; cancel any unfilled portion. Used to trade aggressively without leaving resting orders.",
    },
    {
      name: "FOK",
      full: "Fill-or-Kill",
      color: "text-amber-400",
      desc: "Fill the entire order immediately or cancel entirely. Prevents partial fills that would require further risk management.",
    },
    {
      name: "GTX",
      full: "Post-Only (Good-Till-Crossing)",
      color: "text-emerald-400",
      desc: "Adds liquidity only — if the order would cross the spread, it is cancelled instead. Earns maker rebates, avoids taker fees.",
    },
    {
      name: "MOO/MOC",
      full: "Market-On-Open / Close",
      color: "text-primary",
      desc: "Execute at the opening or closing auction price. Used for index arbitrage and EOD inventory management.",
    },
  ];

  const regulatoryRules = [
    {
      rule: "SEC Rule 15c3-5",
      jurisdiction: "US",
      summary: "Market Access Rule — brokers must have pre-trade risk controls before providing market access to clients (including HFTs).",
    },
    {
      rule: "FINRA Oversight",
      jurisdiction: "US",
      summary: "HFT firms registered as broker-dealers subject to FINRA examination of trading algorithms, risk management, and market manipulation rules.",
    },
    {
      rule: "MiFID II HFT Rules",
      jurisdiction: "EU",
      summary: "Firms doing HFT must be authorized, keep algorithmic trading records for 5 years, and have kill switches. Market makers must quote in all conditions.",
    },
    {
      rule: "SEC Market Maker Rules",
      jurisdiction: "US",
      summary: "Registered MMs must maintain continuous two-sided quotes within NBBO; exemptions allow wider spreads in stressed conditions.",
    },
  ];

  const svgW = 500;
  const svgH = 100;

  return (
    <div className="space-y-4">
      {/* Latency edge calculator */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground">Latency Edge Calculator</div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Trades Per Day</span>
              <span className="text-amber-400 font-mono">{tradesPerDay.toLocaleString()}</span>
            </div>
            <Slider
              value={[tradesPerDay]}
              onValueChange={([v]) => setTradesPerDay(v)}
              min={10000}
              max={500000}
              step={10000}
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Latency Advantage (μs)</span>
              <span className="text-amber-400 font-mono">{edgeMicros} μs</span>
            </div>
            <Slider
              value={[edgeMicros]}
              onValueChange={([v]) => setEdgeMicros(v)}
              min={0.1}
              max={10}
              step={0.1}
            />
          </div>
          <div className="bg-muted rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">Est. Daily Edge</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">{fmtDollar(dailyEdge)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">Annual Edge</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">{fmtDollar(dailyEdge * 252)}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Co-location at NYSE costs ~$5,000/month per server. Most HFT firms run multiple racks.
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs font-semibold text-muted-foreground mb-3">Latency Comparison</div>
          <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
            {[
              { label: "Co-located HFT", micros: 0.5, color: "#22c55e" },
              { label: "Fiber HFT", micros: 10, color: "#3b82f6" },
              { label: "Cloud Algo", micros: 1000, color: "#f59e0b" },
              { label: "Retail API", micros: 50000, color: "#ef4444" },
            ].map((item, i) => {
              const logScale = Math.log10(item.micros + 0.1);
              const maxLog = Math.log10(50000);
              const barW = (logScale / maxLog) * 380;
              const y = 8 + i * 22;
              return (
                <g key={item.label}>
                  <text x={0} y={y + 12} fill="#a1a1aa" fontSize={9}>{item.label}</text>
                  <rect x={115} y={y} width={barW} height={14} fill={item.color} opacity={0.8} rx={2} />
                  <text x={115 + barW + 4} y={y + 10} fill={item.color} fontSize={9}>
                    {item.micros < 1000 ? item.micros + " μs" : (item.micros / 1000).toFixed(0) + " ms"}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-2 text-xs text-muted-foreground">
            Log scale. Co-located servers have 100,000× latency advantage over retail APIs.
          </div>
        </div>
      </div>

      {/* Order types */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3">HFT Order Types</div>
        <div className="grid grid-cols-2 gap-3">
          {orderTypes.map((ot) => (
            <div key={ot.name} className="bg-muted rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("font-mono font-bold text-sm", ot.color)}>{ot.name}</span>
                <span className="text-muted-foreground text-xs">{ot.full}</span>
              </div>
              <p className="text-muted-foreground text-xs">{ot.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HFT vs Stat Arb */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3">Market Making vs Statistical Arbitrage</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3">
            <div className="text-primary font-semibold text-sm mb-2">HFT Market Making</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex gap-2"><CheckCircle size={10} className="text-emerald-400 mt-0.5 shrink-0" /><span>Consistent small profits on spread</span></div>
              <div className="flex gap-2"><CheckCircle size={10} className="text-emerald-400 mt-0.5 shrink-0" /><span>High volume = law of large numbers</span></div>
              <div className="flex gap-2"><CheckCircle size={10} className="text-emerald-400 mt-0.5 shrink-0" /><span>Earns maker rebates on exchanges</span></div>
              <div className="flex gap-2"><AlertTriangle size={10} className="text-amber-400 mt-0.5 shrink-0" /><span>Inventory risk in volatile markets</span></div>
              <div className="flex gap-2"><AlertTriangle size={10} className="text-amber-400 mt-0.5 shrink-0" /><span>Adverse selection from informed traders</span></div>
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-primary font-semibold text-sm mb-2">Statistical Arbitrage</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex gap-2"><CheckCircle size={10} className="text-emerald-400 mt-0.5 shrink-0" /><span>Directional alpha from mispricings</span></div>
              <div className="flex gap-2"><CheckCircle size={10} className="text-emerald-400 mt-0.5 shrink-0" /><span>Lower turnover needed</span></div>
              <div className="flex gap-2"><CheckCircle size={10} className="text-emerald-400 mt-0.5 shrink-0" /><span>Pairs/baskets reduce market risk</span></div>
              <div className="flex gap-2"><AlertTriangle size={10} className="text-amber-400 mt-0.5 shrink-0" /><span>Signal decay as markets adapt</span></div>
              <div className="flex gap-2"><AlertTriangle size={10} className="text-amber-400 mt-0.5 shrink-0" /><span>Correlation breakdown in crises</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Regulatory landscape */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3">Regulatory Landscape</div>
        <div className="space-y-2">
          {regulatoryRules.map((r) => (
            <div key={r.rule} className="flex gap-3 bg-muted rounded-lg p-3">
              <div className="shrink-0">
                <Badge variant="outline" className="text-muted-foreground border-border text-xs">
                  {r.jurisdiction}
                </Badge>
              </div>
              <div>
                <div className="text-foreground font-semibold text-xs">{r.rule}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{r.summary}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market impact */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3">HFT Market Impact: Debate</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-emerald-400 font-semibold mb-2">Positive Contributions</div>
            <div className="space-y-1 text-muted-foreground">
              {[
                "Tighter bid-ask spreads for all participants",
                "Faster price discovery from new information",
                "Higher market depth and quoted volume",
                "Lower transaction costs for institutional investors",
                "Arbitrage keeps prices consistent across venues",
              ].map((pt) => (
                <div key={pt} className="flex gap-2">
                  <CheckCircle size={10} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-rose-400 font-semibold mb-2">Concerns & Criticisms</div>
            <div className="space-y-1 text-muted-foreground">
              {[
                "Liquidity evaporates in market stress (Flash Crash 2010)",
                "Adverse selection against slower market makers",
                "Arms race: infrastructure costs crowd out entrants",
                "Spoofing and layering manipulation risk",
                "Systemic risk from correlated algorithmic behavior",
              ].map((pt) => (
                <div key={pt} className="flex gap-2">
                  <AlertTriangle size={10} className="text-rose-400 mt-0.5 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MarketMakingPage() {
  const [tab, setTab] = useState("101");

  const tabs = [
    { id: "101", label: "MM 101", icon: <BookOpen size={13} /> },
    { id: "spread", label: "Spread Modeling", icon: <BarChart3 size={13} /> },
    { id: "inventory", label: "Inventory Mgmt", icon: <Activity size={13} /> },
    { id: "amm", label: "AMM vs CLOB", icon: <Layers size={13} /> },
    { id: "hft", label: "HFT & Latency", icon: <Zap size={13} /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg border border-border">
              <Activity size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Market Making Simulator</h1>
              <p className="text-muted-foreground text-sm">
                Spread modeling, inventory management, AMM mechanics, and HFT dynamics
              </p>
            </div>
          </div>

          {/* Key metrics strip */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {[
              { label: "Citadel MM Volume", val: "~25%", sub: "US equities", color: "text-primary" },
              { label: "Typical Spread", val: "1–5 bps", sub: "liquid stocks", color: "text-amber-400" },
              { label: "HFT Trades/Day", val: "100M+", sub: "US markets total", color: "text-emerald-400" },
              { label: "Co-lo Latency", val: "< 1 μs", sub: "NYSE data center", color: "text-primary" },
              { label: "Flash Crash 2010", val: "−9.2%", sub: "intraday Dow drop", color: "text-rose-400" },
            ].map((m) => (
              <div key={m.label} className="bg-card border border-border rounded-lg px-3 py-2">
                <div className="text-muted-foreground text-xs">{m.label}</div>
                <div className={cn("font-mono font-bold", m.color)}>{m.val}</div>
                <div className="text-muted-foreground text-xs">{m.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-5 w-full bg-card border border-border mb-4 h-auto p-1">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground py-2"
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="101">
                <Tab101 />
              </TabsContent>
              <TabsContent value="spread">
                <TabSpread />
              </TabsContent>
              <TabsContent value="inventory">
                <TabInventory />
              </TabsContent>
              <TabsContent value="amm">
                <TabAMM />
              </TabsContent>
              <TabsContent value="hft">
                <TabHFT />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
