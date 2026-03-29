"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Info,
  DollarSign,
  Scale,
  Layers,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG (seed=904) ─────────────────────────────────────────────────────
let s = 904;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate random values
const _noise: number[] = [];
for (let i = 0; i < 200; i++) _noise.push(rand());

// ── SPIVA Data ─────────────────────────────────────────────────────────────────

interface SPIVARow {
  category: string;
  y1: number;
  y5: number;
  y10: number;
  y15: number;
  y20: number;
}

const SPIVA_DATA: SPIVARow[] = [
  { category: "US Large Cap", y1: 61, y5: 78, y10: 84, y15: 88, y20: 92 },
  { category: "US Mid Cap", y1: 57, y5: 72, y10: 80, y15: 86, y20: 90 },
  { category: "US Small Cap", y1: 54, y5: 68, y10: 76, y15: 82, y20: 87 },
  { category: "International", y1: 63, y5: 74, y10: 83, y15: 89, y20: 91 },
  { category: "Emerging Markets", y1: 55, y5: 65, y10: 72, y15: 78, y20: 83 },
  { category: "Fixed Income", y1: 58, y5: 71, y10: 79, y15: 85, y20: 89 },
];

// ── Factor Data ────────────────────────────────────────────────────────────────

interface FactorDef {
  name: string;
  color: string;
  description: string;
  historicPremium: number;
  cost: number;
  crowdingRisk: number;
  persistence: number;
}

const FACTORS: FactorDef[] = [
  {
    name: "Value",
    color: "#3b82f6",
    description: "Cheap stocks relative to fundamentals (P/E, P/B, P/CF)",
    historicPremium: 4.8,
    cost: 0.25,
    crowdingRisk: 45,
    persistence: 72,
  },
  {
    name: "Momentum",
    color: "#8b5cf6",
    description: "Recent winners tend to keep winning (12-1 month returns)",
    historicPremium: 7.2,
    cost: 0.35,
    crowdingRisk: 68,
    persistence: 65,
  },
  {
    name: "Quality",
    color: "#10b981",
    description: "High ROE, stable earnings, low debt companies",
    historicPremium: 3.9,
    cost: 0.20,
    crowdingRisk: 38,
    persistence: 80,
  },
  {
    name: "Low Volatility",
    color: "#f59e0b",
    description: "Low-beta stocks with smoother return profiles",
    historicPremium: 3.2,
    cost: 0.15,
    crowdingRisk: 42,
    persistence: 78,
  },
  {
    name: "Size",
    color: "#ef4444",
    description: "Small caps outperform large caps over long horizons",
    historicPremium: 3.5,
    cost: 0.30,
    crowdingRisk: 35,
    persistence: 68,
  },
];

// ── Compound Fee Data ──────────────────────────────────────────────────────────

interface FeeTier {
  label: string;
  fee: number;
  color: string;
  example: string;
}

const FEE_TIERS: FeeTier[] = [
  { label: "0.05%", fee: 0.0005, color: "#10b981", example: "Vanguard VOO" },
  { label: "0.50%", fee: 0.005,  color: "#3b82f6", example: "Smart Beta ETF" },
  { label: "1.00%", fee: 0.01,   color: "#f59e0b", example: "Active Mutual Fund" },
  { label: "2.00%", fee: 0.02,   color: "#ef4444", example: "Hedge Fund (2&20)" },
];

// ── Helper: compute portfolio value with annual return net of fee ──────────────

function portfolioValues(
  initial: number,
  grossReturn: number,
  fee: number,
  years: number
): number[] {
  const values: number[] = [initial];
  let v = initial;
  for (let y = 1; y <= years; y++) {
    v = v * (1 + grossReturn - fee);
    values.push(v);
  }
  return values;
}

// ── SVG utilities ──────────────────────────────────────────────────────────────

const W = 600;
const H = 280;
const PAD = { top: 20, right: 20, bottom: 40, left: 60 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

function scaleX(x: number, minX: number, maxX: number) {
  return PAD.left + ((x - minX) / (maxX - minX)) * INNER_W;
}
function scaleY(y: number, minY: number, maxY: number) {
  return PAD.top + INNER_H - ((y - minY) / (maxY - minY)) * INNER_H;
}

// ── Tab 1: The Evidence ────────────────────────────────────────────────────────

function SPIVAChart() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const years: (keyof SPIVARow)[] = ["y1", "y5", "y10", "y15", "y20"];
  const yearLabels = ["1Y", "5Y", "10Y", "15Y", "20Y"];

  const colors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        % of active funds underperforming their benchmark (SPIVA Scorecard, S&P Global)
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Category</th>
              {yearLabels.map((y) => (
                <th key={y} className="text-right py-2 px-3 text-muted-foreground font-medium">{y}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPIVA_DATA.map((row, i) => (
              <tr
                key={row.category}
                className={cn(
                  "border-b border-border/50 cursor-default transition-colors",
                  hoveredRow === i ? "bg-muted/40" : "hover:bg-muted/20"
                )}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="py-2 pr-4 text-muted-foreground font-medium">{row.category}</td>
                {years.map((yr) => {
                  const val = row[yr] as number;
                  return (
                    <td key={yr} className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${val * 0.5}px`,
                            backgroundColor: colors[i],
                            opacity: 0.7,
                          }}
                        />
                        <span
                          className="font-mono font-semibold"
                          style={{ color: val >= 80 ? "#ef4444" : val >= 60 ? "#f59e0b" : "#10b981" }}
                        >
                          {val}%
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar chart visualization */}
      <div className="mt-4">
        <p className="text-xs text-muted-foreground mb-2">US Large Cap — % underperforming over time</p>
        <svg viewBox={`0 0 ${W} 180`} className="w-full">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => (
            <g key={pct}>
              <line
                x1={PAD.left} y1={scaleY(pct, 0, 100) - 60}
                x2={W - PAD.right} y2={scaleY(pct, 0, 100) - 60}
                stroke="#27272a" strokeWidth={1}
              />
              <text
                x={PAD.left - 8} y={scaleY(pct, 0, 100) - 56}
                textAnchor="end" fill="#71717a" fontSize={10}
              >{pct}%</text>
            </g>
          ))}

          {/* Bars */}
          {yearLabels.map((label, i) => {
            const yr = years[i];
            const val = SPIVA_DATA[0][yr] as number;
            const barW = 60;
            const bx = PAD.left + i * (INNER_W / 5) + (INNER_W / 5 - barW) / 2;
            const barH = (val / 100) * (H - PAD.top - PAD.bottom - 60);
            const by = PAD.top - 60 + (H - PAD.top - PAD.bottom - 60) - barH;
            const fillColor = val >= 80 ? "#ef4444" : val >= 60 ? "#f59e0b" : "#10b981";
            return (
              <g key={label}>
                <rect
                  x={bx} y={by} width={barW} height={barH}
                  rx={3} fill={fillColor} opacity={0.8}
                />
                <text
                  x={bx + barW / 2} y={by - 4}
                  textAnchor="middle" fill={fillColor} fontSize={11} fontWeight="600"
                >{val}%</text>
                <text
                  x={bx + barW / 2} y={H - 10}
                  textAnchor="middle" fill="#71717a" fontSize={11}
                >{label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function EvidenceTab() {
  const reasons = [
    { icon: DollarSign, label: "Fees & Expenses", desc: "Average active fund charges 0.75–1.5% annually vs 0.03–0.10% for index funds. In a 7% return market, fees consume 10–20% of gross returns." },
    { icon: Target, label: "Tax Drag", desc: "Active funds generate more capital gains distributions. Turnover averaging 80–100% vs 5–10% for index funds creates annual taxable events." },
    { icon: BarChart2, label: "Trading Costs", desc: "Market impact, bid-ask spreads, and brokerage commissions. Large funds moving $500M+ affect prices against themselves." },
    { icon: Layers, label: "Benchmark Hugging", desc: "Career risk pushes managers toward closet indexing. Average active fund holds 80–90% of index constituents — charging active fees for passive exposure." },
    { icon: AlertTriangle, label: "Survivorship Bias", desc: "Funds that underperform close or merge. S&P eliminates ~25% of funds per 5-year period. Published records overstate average performance by ~1.5% annually." },
  ];

  const brightSpots = [
    { category: "Micro/Nano Cap", evidence: "Market cap below $300M is under-researched. Active managers with edge in primary research can exploit mispricing before institutional flows." },
    { category: "Emerging Markets", evidence: "Political risk, currency dynamics, and corporate governance issues require local expertise that models struggle to capture fully." },
    { category: "Private Credit", evidence: "Illiquid loans don't have public quotes. Skilled underwriting and relationship sourcing create alpha not replicable passively." },
    { category: "Distressed Debt", evidence: "Bankruptcy proceedings require active legal/restructuring expertise. Process knowledge is the edge — not just price signals." },
    { category: "Merger Arbitrage", evidence: "Deal-specific information, legal analysis, and timing precision can generate 4–8% annualized with low market correlation." },
  ];

  return (
    <div className="space-y-6">
      {/* SPIVA Scorecard */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">SPIVA Scorecard — The Long Game</h3>
        </div>
        <SPIVAChart />
      </div>

      {/* EMH */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Efficient Market Hypothesis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              form: "Weak Form",
              desc: "Past prices don't predict future returns. Technical analysis has no edge.",
              color: "border-green-800/50 bg-green-900/10",
              badge: "Broadly Accepted",
            },
            {
              form: "Semi-Strong",
              desc: "Public information is instantly priced in. Fundamental analysis can't generate consistent alpha.",
              color: "border-yellow-800/50 bg-yellow-900/10",
              badge: "Debated",
            },
            {
              form: "Strong Form",
              desc: "Even insider information is priced in. No one can beat the market — including insiders.",
              color: "border-red-800/50 bg-red-900/10",
              badge: "Rejected",
            },
          ].map((item) => (
            <div key={item.form} className={cn("rounded-lg border p-3", item.color)}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground text-sm">{item.form}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{item.badge}</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Fama won the 2013 Nobel Prize for EMH. The practical conclusion: markets are hard to beat consistently, especially after costs. Gross returns can exist; net-of-fee returns rarely persist.
        </p>
      </div>

      {/* Why Active Managers Struggle */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="w-4 h-4 text-red-400" />
          <h3 className="font-medium text-foreground">Why Active Managers Struggle</h3>
        </div>
        <div className="space-y-3">
          {reasons.map((item) => (
            <div key={item.label} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <item.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bright Spots */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <h3 className="font-medium text-foreground">Bright Spots for Active Management</h3>
        </div>
        <div className="space-y-2">
          {brightSpots.map((item) => (
            <div key={item.category} className="flex gap-3 items-start py-2 border-b border-border/50 last:border-0">
              <ChevronRight className="w-3 h-3 text-green-400 mt-1 shrink-0" />
              <div>
                <span className="text-sm font-medium text-foreground">{item.category}:</span>
                <span className="text-xs text-muted-foreground ml-1">{item.evidence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Index Fund Mechanics ────────────────────────────────────────────────

function ETFCreationRedemptionSVG() {
  return (
    <svg viewBox="0 0 600 220" className="w-full">
      {/* AP Box */}
      <rect x={20} y={80} width={130} height={60} rx={8} fill="#1e1e2e" stroke="#6366f1" strokeWidth={1.5} />
      <text x={85} y={108} textAnchor="middle" fill="#a5b4fc" fontSize={12} fontWeight="600">Authorized</text>
      <text x={85} y={124} textAnchor="middle" fill="#a5b4fc" fontSize={12} fontWeight="600">Participant (AP)</text>

      {/* ETF Sponsor Box */}
      <rect x={235} y={80} width={130} height={60} rx={8} fill="#1e1e2e" stroke="#10b981" strokeWidth={1.5} />
      <text x={300} y={108} textAnchor="middle" fill="#6ee7b7" fontSize={12} fontWeight="600">ETF Sponsor</text>
      <text x={300} y={124} textAnchor="middle" fill="#6ee7b7" fontSize={12} fontWeight="600">(Custodian)</text>

      {/* Market Box */}
      <rect x={450} y={80} width={130} height={60} rx={8} fill="#1e1e2e" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={515} y={108} textAnchor="middle" fill="#fcd34d" fontSize={12} fontWeight="600">Secondary</text>
      <text x={515} y={124} textAnchor="middle" fill="#fcd34d" fontSize={12} fontWeight="600">Market</text>

      {/* Creation arrow: AP → Sponsor */}
      <path d="M 155 100 L 230 100" stroke="#6366f1" strokeWidth={1.5} fill="none" markerEnd="url(#arrow1)" strokeDasharray="4 2" />
      <text x={192} y={92} textAnchor="middle" fill="#818cf8" fontSize={9}>Basket of stocks</text>

      {/* ETF shares back: Sponsor → AP */}
      <path d="M 230 120 L 155 120" stroke="#10b981" strokeWidth={1.5} fill="none" markerEnd="url(#arrow2)" />
      <text x={192} y={134} textAnchor="middle" fill="#6ee7b7" fontSize={9}>ETF shares</text>

      {/* AP sells to market */}
      <path d="M 370 100 L 445 100" stroke="#f59e0b" strokeWidth={1.5} fill="none" markerEnd="url(#arrow3)" />
      <text x={407} y={92} textAnchor="middle" fill="#fbbf24" fontSize={9}>ETF shares</text>

      {/* Market pays AP */}
      <path d="M 445 120 L 370 120" stroke="#ef4444" strokeWidth={1.5} fill="none" markerEnd="url(#arrow4)" />
      <text x={407} y={134} textAnchor="middle" fill="#f87171" fontSize={9}>Cash</text>

      {/* Labels */}
      <text x={300} y={20} textAnchor="middle" fill="#71717a" fontSize={11} fontWeight="600">ETF CREATION MECHANISM</text>
      <text x={192} y={180} textAnchor="middle" fill="#4b5563" fontSize={9}>Primary market (in-kind exchange)</text>
      <text x={407} y={180} textAnchor="middle" fill="#4b5563" fontSize={9}>Secondary market (cash trading)</text>

      {/* Arbitrage label */}
      <text x={300} y={200} textAnchor="middle" fill="#71717a" fontSize={10}>
        NAV premium/discount &gt; AP costs triggers arbitrage → price convergence
      </text>

      {/* Arrow markers */}
      <defs>
        <marker id="arrow1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" />
        </marker>
        <marker id="arrow2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#10b981" />
        </marker>
        <marker id="arrow3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
        </marker>
        <marker id="arrow4" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" />
        </marker>
      </defs>
    </svg>
  );
}

function IndexMechanicsTab() {
  const trackingErrorSources = [
    { source: "Sampling / Optimization", bps: 3, desc: "Index may have 5,000 stocks; fund holds 800 representative sample" },
    { source: "Cash Drag", bps: 2, desc: "Dividends held briefly as cash before reinvestment; cash earns less" },
    { source: "Management Fee", bps: 3, desc: "0.03% basis point fee compounds against gross index return" },
    { source: "Reconstitution Costs", bps: 4, desc: "Forced buys/sells at announcement; front-running adds ~0.1–0.3% cost" },
    { source: "Securities Lending Income", bps: -3, desc: "Lending shares to short-sellers offsets costs; can exceed expense ratio" },
    { source: "Withholding Tax", bps: 5, desc: "Foreign dividends withheld at source; varies by domicile treaty" },
  ];

  const indexProviders = [
    { name: "MSCI",          aum: "$15.6T", products: "ACWI, EM, EAFE, factor indices", share: 42 },
    { name: "S&P Dow Jones", aum: "$11.2T", products: "S&P 500, 400, 600, DJIA, GSCI", share: 31 },
    { name: "FTSE Russell",  aum: "$8.1T",  products: "Russell 2000, FTSE 100, WGBI", share: 22 },
    { name: "Bloomberg",     aum: "$3.8T",  products: "Aggregate Bond, EM Local", share: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Market Cap Weighting */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-foreground">Market Cap Weighting Mechanics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Float-Adjusted Market Cap</p>
            <p className="text-xs text-muted-foreground">
              Weight = (Free Float Shares × Price) / Total Index Market Cap
            </p>
            <p className="text-xs text-muted-foreground">
              Free float excludes insider holdings, government stakes (&gt;10%), and cross-holdings.
              NVDA&apos;s float-adjusted weight differs from total market cap weight by ~2–4%.
            </p>
            <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground font-medium mb-1">S&P 500 Top 5 Concentration (2025)</p>
              {[
                { name: "NVDA", w: 6.8 },
                { name: "MSFT", w: 6.5 },
                { name: "AAPL", w: 7.1 },
                { name: "AMZN", w: 4.0 },
                { name: "META", w: 2.9 },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground w-10">{s.name}</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(s.w / 8) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{s.w}%</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2">Top 10 = ~35% of index — concentration risk often overlooked</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">Index Reconstitution Events</p>
            <div className="space-y-2">
              {[
                { event: "S&P 500 Addition", impact: "Average +7% price jump on announcement day; adds at elevated price" },
                { event: "S&P 500 Deletion", impact: "Average -13% sell-off; fund forced to sell at depressed price" },
                { event: "Quarterly Rebalance", impact: "Front-runners buy additions before index close; index pays premium" },
                { event: "Goodhart's Law", impact: "When a measure becomes a target, it ceases to be a good measure — index inclusion changes security behavior" },
              ].map((item) => (
                <div key={item.event} className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <p className="text-xs font-medium text-foreground">{item.event}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ETF Creation/Redemption */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h3 className="font-medium text-foreground">ETF Creation / Redemption Arbitrage</h3>
        </div>
        <ETFCreationRedemptionSVG />
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-green-900/10 border border-green-800/30">
            <p className="text-xs font-medium text-green-400 mb-1">Tax Efficiency Advantage</p>
            <p className="text-xs text-muted-foreground">In-kind creations/redemptions avoid capital gains distributions. Mutual funds must sell securities (triggering gains) when investors redeem for cash.</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs font-medium text-primary mb-1">Securities Lending Revenue</p>
            <p className="text-xs text-muted-foreground">Large ETF custodians earn 0.01–0.25% lending shares to short-sellers. VOO earns ~0.02% in securities lending, effectively reducing net cost below headline fee.</p>
          </div>
        </div>
      </div>

      {/* Tracking Error Sources */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-foreground">Tracking Error Sources (basis points per year)</h3>
        </div>
        <div className="space-y-2">
          {trackingErrorSources.map((item) => (
            <div key={item.source} className="flex items-center gap-3">
              <div className="w-40 text-xs text-muted-foreground shrink-0">{item.source}</div>
              <div className="flex-1 flex items-center gap-2">
                <div
                  className="h-5 rounded flex items-center px-1.5 text-xs font-mono font-medium"
                  style={{
                    width: `${Math.abs(item.bps) * 12 + 30}px`,
                    backgroundColor: item.bps < 0 ? "#10b98133" : "#6366f133",
                    color: item.bps < 0 ? "#6ee7b7" : "#a5b4fc",
                  }}
                >
                  {item.bps > 0 ? "+" : ""}{item.bps} bps
                </div>
              </div>
              <p className="text-xs text-muted-foreground hidden md:block flex-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Index Provider Concentration */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="font-medium text-foreground">Index Provider Concentration Risk</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {indexProviders.map((p) => (
            <div key={p.name} className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground text-sm">{p.name}</span>
                <span className="text-xs text-muted-foreground">{p.aum} AUM</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                <div
                  className="h-1.5 rounded-full bg-amber-500"
                  style={{ width: `${p.share}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{p.products}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          3 private firms control methodology for $35T+ in passive AUM. Index committee decisions (inclusions, exclusions, rule changes) can move markets — a power with minimal regulatory oversight.
        </p>
      </div>
    </div>
  );
}

// ── Tab 3: Factor Investing ────────────────────────────────────────────────────

function FactorCrowdingSVG({ factors }: { factors: FactorDef[] }) {
  const maxCrowding = 100;
  return (
    <svg viewBox="0 0 580 200" className="w-full">
      <text x={290} y={16} textAnchor="middle" fill="#71717a" fontSize={11} fontWeight="600">FACTOR CROWDING RISK vs PERSISTENCE SCORE</text>
      {/* Axes */}
      <line x1={60} y1={30} x2={60} y2={170} stroke="#3f3f46" strokeWidth={1} />
      <line x1={60} y1={170} x2={560} y2={170} stroke="#3f3f46" strokeWidth={1} />
      <text x={30} y={105} textAnchor="middle" fill="#52525b" fontSize={9} transform="rotate(-90,30,105)">Persistence (%)</text>
      <text x={310} y={192} textAnchor="middle" fill="#52525b" fontSize={9}>Crowding Risk (0–100)</text>

      {/* Grid */}
      {[25, 50, 75].map((v) => (
        <g key={v}>
          <line x1={60} y1={170 - (v / 100) * 140} x2={560} y2={170 - (v / 100) * 140} stroke="#27272a" strokeWidth={1} />
          <text x={54} y={174 - (v / 100) * 140} textAnchor="end" fill="#52525b" fontSize={8}>{v}</text>
        </g>
      ))}
      {[25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={60 + (v / 100) * 500} y1={30} x2={60 + (v / 100) * 500} y2={170} stroke="#27272a" strokeWidth={1} />
          <text x={60 + (v / 100) * 500} y={182} textAnchor="middle" fill="#52525b" fontSize={8}>{v}</text>
        </g>
      ))}

      {/* Data points */}
      {factors.map((f) => {
        const cx = 60 + (f.crowdingRisk / maxCrowding) * 500;
        const cy = 170 - (f.persistence / 100) * 140;
        return (
          <g key={f.name}>
            <circle cx={cx} cy={cy} r={10} fill={f.color} opacity={0.8} />
            <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize={7} fontWeight="700">
              {f.name.slice(0, 3)}
            </text>
          </g>
        );
      })}

      {/* Quadrant labels */}
      <text x={100} y={50} fill="#27272a" fontSize={9}>High Persist / Low Crowd</text>
      <text x={400} y={50} fill="#27272a" fontSize={9}>High Persist / High Crowd</text>
      <text x={100} y={160} fill="#27272a" fontSize={9}>Low Persist / Low Crowd</text>
      <text x={400} y={160} fill="#27272a" fontSize={9}>Danger Zone</text>
    </svg>
  );
}

function FactorDecaySVG() {
  // Simulate published vs live factor premiums decaying after publication
  const years = 20;
  const publishedW = 520;
  const publishedH = 160;
  const pPad = { l: 55, r: 20, t: 30, b: 30 };
  const iW = publishedW - pPad.l - pPad.r;
  const iH = publishedH - pPad.t - pPad.b;

  // Pre-publication: random but upward-biased premium (~7%)
  // Post-publication: premium decays from 7% toward 3%
  const prePoints: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const y = 7 + (_noise[50 + i] * 6 - 3);
    prePoints.push([i, y]);
  }
  const postPoints: [number, number][] = [];
  for (let i = 10; i <= years; i++) {
    const decay = 7 - ((i - 10) / 10) * 3.5 + (_noise[60 + (i - 10)] * 3 - 1.5);
    postPoints.push([i, Math.max(1, decay)]);
  }

  const allYValues = [...prePoints, ...postPoints].map((p) => p[1]);
  const minY = 0;
  const maxY = 12;

  const sx = (x: number) => pPad.l + (x / years) * iW;
  const sy = (y: number) => pPad.t + iH - ((y - minY) / (maxY - minY)) * iH;

  const prePath = prePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p[0])} ${sy(p[1])}`).join(" ");
  const postPath = postPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p[0])} ${sy(p[1])}`).join(" ");

  return (
    <svg viewBox={`0 0 ${publishedW} ${publishedH}`} className="w-full">
      {/* Title */}
      <text x={publishedW / 2} y={14} textAnchor="middle" fill="#71717a" fontSize={10} fontWeight="600">FACTOR DECAY: PRE-PUBLICATION vs LIVE PERFORMANCE</text>

      {/* Grid */}
      {[0, 3, 6, 9, 12].map((v) => (
        <g key={v}>
          <line x1={pPad.l} y1={sy(v)} x2={publishedW - pPad.r} y2={sy(v)} stroke="#27272a" strokeWidth={1} />
          <text x={pPad.l - 6} y={sy(v) + 4} textAnchor="end" fill="#52525b" fontSize={8}>{v}%</text>
        </g>
      ))}

      {/* Publication line */}
      <line x1={sx(10)} y1={pPad.t} x2={sx(10)} y2={pPad.t + iH} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" />
      <text x={sx(10)} y={pPad.t + 8} textAnchor="middle" fill="#f59e0b" fontSize={9}>Published</text>

      {/* Series */}
      <path d={prePath} stroke="#10b981" strokeWidth={2} fill="none" />
      <path d={postPath} stroke="#ef4444" strokeWidth={2} fill="none" />

      {/* Legend */}
      <line x1={pPad.l + 5} y1={pPad.t + iH + 18} x2={pPad.l + 25} y2={pPad.t + iH + 18} stroke="#10b981" strokeWidth={2} />
      <text x={pPad.l + 30} y={pPad.t + iH + 22} fill="#6ee7b7" fontSize={9}>Pre-publication (in-sample)</text>
      <line x1={publishedW / 2 + 20} y1={pPad.t + iH + 18} x2={publishedW / 2 + 40} y2={pPad.t + iH + 18} stroke="#ef4444" strokeWidth={2} />
      <text x={publishedW / 2 + 45} y={pPad.t + iH + 22} fill="#f87171" fontSize={9}>Live (out-of-sample)</text>
    </svg>
  );
}

function FactorTab() {
  const [selectedFactor, setSelectedFactor] = useState<FactorDef | null>(null);

  const costComparison = [
    { type: "Passive Index", fee: 0.03, color: "#10b981", examples: "VOO, IVV, SCHB" },
    { type: "Factor / Smart Beta", fee: 0.25, color: "#3b82f6", examples: "VLUE, MTUM, QUAL, USMV" },
    { type: "Multi-Factor ETF", fee: 0.35, color: "#8b5cf6", examples: "DFSV, AVUV, IQLT" },
    { type: "Active Mutual Fund", fee: 1.00, color: "#f59e0b", examples: "Typical large-cap active" },
    { type: "Hedge Fund", fee: 2.00, color: "#ef4444", examples: "2% mgmt + 20% performance" },
  ];

  return (
    <div className="space-y-6">
      {/* Factor Overview */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-foreground">Factor Investing — The Middle Ground</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Factor investing (smart beta) sits between pure passive and active management. It systematically tilts toward characteristics — value, quality, momentum — that have historically earned excess returns. Click a factor for details.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {FACTORS.map((f) => (
            <button
              key={f.name}
              onClick={() => setSelectedFactor(selectedFactor?.name === f.name ? null : f)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                selectedFactor?.name === f.name
                  ? "border-current bg-muted"
                  : "border-border bg-muted/50 hover:border-border"
              )}
              style={{ borderColor: selectedFactor?.name === f.name ? f.color : undefined }}
            >
              <p className="text-sm font-medium" style={{ color: f.color }}>{f.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">+{f.historicPremium}% hist.</p>
              <p className="text-xs text-muted-foreground">{f.cost}% fee</p>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {selectedFactor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="mt-4 p-4 rounded-xl border"
                style={{ borderColor: selectedFactor.color + "44", backgroundColor: selectedFactor.color + "11" }}
              >
                <p className="text-sm font-medium text-foreground mb-1">{selectedFactor.name} Factor</p>
                <p className="text-sm text-muted-foreground mb-3">{selectedFactor.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Historic Premium", value: `+${selectedFactor.historicPremium}%/yr`, color: "#10b981" },
                    { label: "Typical ETF Fee", value: `${selectedFactor.cost}%`, color: "#3b82f6" },
                    { label: "Crowding Risk", value: `${selectedFactor.crowdingRisk}/100`, color: "#f59e0b" },
                    { label: "Persistence Score", value: `${selectedFactor.persistence}%`, color: "#a855f7" },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Crowding vs Persistence */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="font-medium text-foreground">Factor Crowding vs Persistence</h3>
        </div>
        <FactorCrowdingSVG factors={FACTORS} />
        <p className="text-xs text-muted-foreground mt-2">
          Quality and Low-Vol show high persistence with moderate crowding — more robust factors. Momentum has high premium but also highest crowding risk (sudden reversals in risk-off events).
        </p>
      </div>

      {/* Factor Decay */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <h3 className="font-medium text-foreground">Factor Decay After Publication</h3>
        </div>
        <FactorDecaySVG />
        <p className="text-xs text-muted-foreground mt-2">
          McLean &amp; Pontiff (2016) studied 97 factors — live returns averaged 58% below in-sample returns. Publication attracts capital, arbitrage erodes the premium. The best factors retain 60–80% of their premium long-term.
        </p>
      </div>

      {/* Cost Comparison */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-green-400" />
          <h3 className="font-medium text-foreground">Cost Spectrum: Passive → Active</h3>
        </div>
        <div className="space-y-2">
          {costComparison.map((c) => (
            <div key={c.type} className="flex items-center gap-3">
              <div className="w-36 text-xs text-muted-foreground shrink-0">{c.type}</div>
              <div
                className="h-7 rounded-lg flex items-center px-2"
                style={{
                  width: `${(c.fee / 2) * 300 + 30}px`,
                  backgroundColor: c.color + "25",
                  border: `1px solid ${c.color}44`,
                }}
              >
                <span className="text-xs font-mono font-medium" style={{ color: c.color }}>{c.fee}%</span>
              </div>
              <span className="text-xs text-muted-foreground hidden md:block">{c.examples}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Equal Weight vs Cap Weight */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-foreground">Equal Weight vs Cap Weight</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium text-foreground mb-2">Equal Weight (RSP)</p>
            <ul className="space-y-1">
              {[
                { pro: true, text: "Implicit value/size tilt — buys losers, sells winners" },
                { pro: true, text: "Lower concentration in mega-cap tech" },
                { pro: false, text: "Higher turnover (25–30% vs 5%)" },
                { pro: false, text: "Higher fee (0.20% vs 0.03%)" },
                { pro: false, text: "Poor liquidity in small constituents" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  {item.pro
                    ? <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                    : <XCircle className="w-3 h-3 text-red-400 shrink-0" />}
                  <span className="text-muted-foreground">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium text-foreground mb-2">Cap Weight (SPY)</p>
            <ul className="space-y-1">
              {[
                { pro: true, text: "Lowest cost (0.03–0.09%)" },
                { pro: true, text: "Lowest turnover and tax drag" },
                { pro: true, text: "Maximum liquidity, zero implementation shortfall" },
                { pro: false, text: "Momentum bias: buys high, trims low" },
                { pro: false, text: "Concentration: top 10 stocks = 35%+" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  {item.pro
                    ? <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                    : <XCircle className="w-3 h-3 text-red-400 shrink-0" />}
                  <span className="text-muted-foreground">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Fee Impact & Decision ───────────────────────────────────────────────

function CompoundFeeDragSVG() {
  const GROSS_RETURN = 0.08;
  const YEARS = 40;
  const INITIAL = 100000;
  const svgW = 600;
  const svgH = 300;
  const pad = { l: 72, r: 20, t: 30, b: 50 };
  const iW = svgW - pad.l - pad.r;
  const iH = svgH - pad.t - pad.b;

  const series = FEE_TIERS.map((ft) => ({
    ...ft,
    values: portfolioValues(INITIAL, GROSS_RETURN, ft.fee, YEARS),
  }));

  const maxValue = Math.max(...series[0].values);
  const minValue = INITIAL;

  const sx = (yr: number) => pad.l + (yr / YEARS) * iW;
  const sy = (v: number) => pad.t + iH - ((v - minValue) / (maxValue - minValue)) * iH;

  const fmt = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    return `$${Math.round(v / 1000)}K`;
  };

  const gridValues = [100000, 500000, 1000000, 1500000, 2000000];

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
      <text x={svgW / 2} y={16} textAnchor="middle" fill="#71717a" fontSize={11} fontWeight="600">
        $100,000 INVESTED FOR 40 YEARS (8% GROSS RETURN)
      </text>

      {/* Grid */}
      {gridValues.map((v) => (
        <g key={v}>
          <line x1={pad.l} y1={sy(v)} x2={svgW - pad.r} y2={sy(v)} stroke="#27272a" strokeWidth={1} />
          <text x={pad.l - 6} y={sy(v) + 4} textAnchor="end" fill="#52525b" fontSize={9}>{fmt(v)}</text>
        </g>
      ))}

      {/* Series lines */}
      {series.map((s) => {
        const pathD = s.values.map((v, yr) => `${yr === 0 ? "M" : "L"} ${sx(yr)} ${sy(v)}`).join(" ");
        return <path key={s.label} d={pathD} stroke={s.color} strokeWidth={2.5} fill="none" />;
      })}

      {/* X-axis labels */}
      {[0, 10, 20, 30, 40].map((yr) => (
        <text key={yr} x={sx(yr)} y={svgH - 10} textAnchor="middle" fill="#52525b" fontSize={9}>
          Yr {yr}
        </text>
      ))}

      {/* End labels */}
      {series.map((s) => {
        const finalVal = s.values[YEARS];
        return (
          <text
            key={s.label}
            x={svgW - pad.r + 2}
            y={sy(finalVal) + 4}
            fill={s.color}
            fontSize={8}
            textAnchor="start"
          >
            {s.label}
          </text>
        );
      })}

      {/* Axes */}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + iH} stroke="#3f3f46" strokeWidth={1} />
      <line x1={pad.l} y1={pad.t + iH} x2={svgW - pad.r} y2={pad.t + iH} stroke="#3f3f46" strokeWidth={1} />
    </svg>
  );
}

function CoreSatelliteSVG() {
  const cx = 200;
  const cy = 120;
  const outerR = 100;
  const innerR = 65;

  // Core (80%): big blue slice
  const coreAngle = 0.8 * 2 * Math.PI;
  // Satellite segments (20% total): 4 segments of 5%
  const satellites = [
    { label: "Value ETF", pct: 0.05, color: "#3b82f6" },
    { label: "Momentum", pct: 0.05, color: "#8b5cf6" },
    { label: "Small Cap", pct: 0.05, color: "#ef4444" },
    { label: "Intl Active", pct: 0.05, color: "#f59e0b" },
  ];

  function arc(startAngle: number, endAngle: number, r: number) {
    const x1 = cx + r * Math.cos(startAngle - Math.PI / 2);
    const y1 = cy + r * Math.sin(startAngle - Math.PI / 2);
    const x2 = cx + r * Math.cos(endAngle - Math.PI / 2);
    const y2 = cy + r * Math.sin(endAngle - Math.PI / 2);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  let offset = 0;
  const satPaths = satellites.map((s) => {
    const start = coreAngle + offset;
    const end = start + s.pct * 2 * Math.PI;
    const path = arc(start, end, outerR);
    offset += s.pct * 2 * Math.PI;
    const midAngle = start + (end - start) / 2;
    const lx = cx + (outerR + 20) * Math.cos(midAngle - Math.PI / 2);
    const ly = cy + (outerR + 20) * Math.sin(midAngle - Math.PI / 2);
    return { ...s, path, lx, ly, midAngle };
  });

  return (
    <svg viewBox="0 0 560 240" className="w-full">
      <text x={280} y={16} textAnchor="middle" fill="#71717a" fontSize={11} fontWeight="600">CORE-SATELLITE PORTFOLIO CONSTRUCTION</text>

      {/* Core slice */}
      <path d={arc(0, coreAngle, outerR)} fill="#10b981" opacity={0.75} />
      {/* Donut hole */}
      <circle cx={cx} cy={cy} r={innerR} fill="#18181b" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#6ee7b7" fontSize={16} fontWeight="700">80%</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6ee7b7" fontSize={10}>Passive</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill="#6ee7b7" fontSize={9}>Core</text>

      {/* Satellite slices */}
      {satPaths.map((s) => (
        <path key={s.label} d={s.path} fill={s.color} opacity={0.8} />
      ))}

      {/* Legend on the right */}
      <text x={320} y={55} fill="#10b981" fontSize={12} fontWeight="600">Passive Core (80%)</text>
      <text x={320} y={72} fill="#52525b" fontSize={9}>— Total market / S&P 500 index fund</text>
      <text x={320} y={85} fill="#52525b" fontSize={9}>— Broad bond ETF</text>
      <text x={320} y={98} fill="#52525b" fontSize={9}>— International index</text>

      <text x={320} y={120} fill="#a5b4fc" fontSize={12} fontWeight="600">Active Satellite (20%)</text>
      {satellites.map((s, i) => (
        <g key={s.label}>
          <circle cx={326} cy={138 + i * 18} r={5} fill={s.color} />
          <text x={336} y={143 + i * 18} fill="#9ca3af" fontSize={9}>{s.label} (5%)</text>
        </g>
      ))}

      <text x={320} y={215} fill="#52525b" fontSize={9}>Satellite = higher-conviction bets</text>
      <text x={320} y={228} fill="#52525b" fontSize={9}>where you have research edge</text>
    </svg>
  );
}

function FeeImpactTab() {
  const GROSS_RETURN = 0.08;
  const YEARS = 40;
  const INITIAL = 100000;

  const feeImpact = FEE_TIERS.map((ft) => {
    const finalValues = portfolioValues(INITIAL, GROSS_RETURN, ft.fee, YEARS);
    const finalValue = finalValues[YEARS];
    const lost = portfolioValues(INITIAL, GROSS_RETURN, 0.0005, YEARS)[YEARS] - finalValue;
    return { ...ft, finalValue, lost };
  });

  const whenActive = [
    { situation: "Illiquid / Private Markets", reason: "No passive index available. Active underwriting and sourcing is the only option for private credit, PE, real estate debt.", icon: "🏗️" },
    { situation: "Micro-Cap & Deep Value", reason: "Index funds can't efficiently hold $50M market cap stocks. Small active managers can exploit mispricing before institutional flows arrive.", icon: "🔬" },
    { situation: "Closed-End Funds at Discount", reason: "CEFs occasionally trade 15–25% below NAV. Buying at discount with mean-reversion thesis is an active strategy with clear edge.", icon: "📉" },
    { situation: "Tax-Loss Harvesting", reason: "Active direct indexing harvests individual stock losses to offset gains. Robo-advisors offer this at sub-0.30% cost now.", icon: "🧮" },
    { situation: "Alternatives / Real Assets", reason: "Infrastructure, timber, farmland, litigation finance — no passive exposure exists. Active manager selection is unavoidable.", icon: "🌲" },
  ];

  const behavioral = [
    "Passive investors can't sell the 'wrong stock' — they sell the index, which mechanically rebalances",
    "Preset allocation rules (e.g., 60/40) remove decision fatigue in volatile markets",
    "Index fund investors have lower turnover (avg 4 years hold vs 11 months for active)",
    "Emotional decisions cost average investor 1.5–2% annually (DALBAR study)",
    "Passive structure encourages long-term compounding mindset — the true wealth driver",
  ];

  return (
    <div className="space-y-6">
      {/* Fee Drag Chart */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <h3 className="font-medium text-foreground">The Compound Fee Drag Over 40 Years</h3>
        </div>
        <CompoundFeeDragSVG />

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {feeImpact.map((ft) => (
            <div
              key={ft.label}
              className="p-3 rounded-xl border text-center"
              style={{ borderColor: ft.color + "44", backgroundColor: ft.color + "11" }}
            >
              <p className="text-xs text-muted-foreground mb-1">{ft.example}</p>
              <p className="text-lg font-bold" style={{ color: ft.color }}>
                {ft.finalValue >= 1_000_000
                  ? `$${(ft.finalValue / 1_000_000).toFixed(1)}M`
                  : `$${Math.round(ft.finalValue / 1000)}K`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{ft.label}/yr fee</p>
              {ft.lost > 0 && (
                <p className="text-xs text-red-400 mt-1">
                  -{(ft.lost >= 1_000_000 ? `$${(ft.lost / 1_000_000).toFixed(1)}M` : `$${Math.round(ft.lost / 1000)}K`)} vs 0.05%
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          At 8% gross return: the 2% fee fund yields $458K, the 0.05% fund yields $2.17M. The fee difference alone costs $1.7M over 40 years on a $100K investment — a 3.75× wealth gap.
        </p>
      </div>

      {/* Tax Efficiency */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-green-400" />
          <h3 className="font-medium text-foreground">Tax Efficiency Comparison</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              type: "Index ETF",
              turnover: "5–10%",
              capitalGainsDist: "Rare",
              taxDrag: "~0%",
              color: "border-green-800/50",
              badge: "Most Tax Efficient",
              badgeColor: "text-green-400",
              notes: "In-kind creation/redemption sidesteps embedded gains. IRS allows ETF structure to defer capital gains indefinitely.",
            },
            {
              type: "Active Mutual Fund",
              turnover: "80–120%",
              capitalGainsDist: "Annual",
              taxDrag: "1.0–1.5%",
              color: "border-yellow-800/50",
              badge: "Tax Inefficient",
              badgeColor: "text-yellow-400",
              notes: "Redemptions force cash sales → capital gain distributions passed to ALL shareholders, including those who didn't sell.",
            },
            {
              type: "Direct Indexing",
              turnover: "20–30%",
              capitalGainsDist: "Managed",
              taxDrag: "-0.5 to +0.5%",
              color: "border-border",
              badge: "Best After-Tax",
              badgeColor: "text-primary",
              notes: "Hold individual stocks. Harvest losses daily to offset gains elsewhere. Available at $250K+ minimums via Parametric, Aperio.",
            },
          ].map((item) => (
            <div key={item.type} className={cn("p-4 rounded-xl border bg-card/50", item.color)}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-foreground text-sm">{item.type}</p>
                <span className={cn("text-xs font-medium", item.badgeColor)}>{item.badge}</span>
              </div>
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Turnover</span>
                  <span className="text-muted-foreground">{item.turnover}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Cap Gains Dist.</span>
                  <span className="text-muted-foreground">{item.capitalGainsDist}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Annual Tax Drag</span>
                  <span className="text-muted-foreground">{item.taxDrag}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{item.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* When to Use Active */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-amber-400" />
          <h3 className="font-medium text-foreground">When Active Management Makes Sense</h3>
        </div>
        <div className="space-y-2">
          {whenActive.map((item) => (
            <div key={item.situation} className="flex gap-3 items-start p-3 rounded-lg bg-muted/40">
              <span className="text-base shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{item.situation}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core-Satellite Construction */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-foreground">Core-Satellite Portfolio Construction</h3>
        </div>
        <CoreSatelliteSVG />
        <p className="text-xs text-muted-foreground mt-2">
          The core-satellite approach captures most of the index&apos;s risk premium at minimal cost, while reserving 15–25% for higher-conviction active positions. It limits career risk for advisors and satisfies investor desire to &quot;do something&quot; without compromising long-term outcomes.
        </p>
      </div>

      {/* Behavioral Benefits */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <h3 className="font-medium text-foreground">Behavioral Benefits of Passive Investing</h3>
        </div>
        <ul className="space-y-2">
          {behavioral.map((item, i) => (
            <li key={i} className="flex gap-2 items-start text-sm">
              <div className="w-5 h-5 rounded-full bg-green-900/30 border border-green-800/50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-medium">{i + 1}</span>
              </div>
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-sm font-medium text-primary mb-1">The Verdict</p>
          <p className="text-sm text-muted-foreground">
            For most investors, a low-cost passive core (70–85%) combined with selective factor tilts (10–20%) and minimal active satellite positions (5–10%) delivers the best risk-adjusted, after-tax, long-term outcome. The key insight: <strong className="text-foreground">the cost of &quot;doing nothing&quot; is often lower than the cost of &quot;doing something.&quot;</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page Component ─────────────────────────────────────────────────────────────

export default function ActivePassivePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Active vs Passive Investing</h1>
              <p className="text-sm text-muted-foreground">The evidence, mechanics, factors, and true cost of your investment approach</p>
            </div>
          </div>

          {/* Key stats strip — HERO */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 border-l-4 border-l-primary rounded-xl bg-card p-6">
            {[
              { label: "Active funds underperform (20Y)", value: "92%", color: "text-red-400", sub: "US Large Cap SPIVA" },
              { label: "Vanguard VOO expense ratio", value: "0.03%", color: "text-green-400", sub: "vs 1%+ active avg" },
              { label: "Factor premiums post-publish", value: "−58%", color: "text-amber-400", sub: "vs in-sample (McLean)" },
              { label: "Fee gap over 40 years", value: "$1.7M", color: "text-primary", sub: "$100K at 0.05% vs 2%" },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-xl bg-muted/30 border border-border">
                <p className={cn("text-xl font-medium", stat.color)}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-8" />

        {/* Tabs */}
        <Tabs defaultValue="evidence">
          <TabsList className="bg-card border border-border mb-6 w-full grid grid-cols-4 h-auto">
            {[
              { value: "evidence", label: "The Evidence", icon: BarChart2 },
              { value: "mechanics", label: "Index Mechanics", icon: Layers },
              { value: "factors", label: "Factor Investing", icon: Zap },
              { value: "fees", label: "Fee Impact", icon: DollarSign },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 py-2.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="evidence" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <EvidenceTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="mechanics" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <IndexMechanicsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="factors" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FactorTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="fees" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FeeImpactTab />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
