"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Building2,
  Users,
  Target,
  Layers,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Calculator,
  RefreshCw,
  Globe,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 814;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate deterministic pool
const RAND_POOL: number[] = [];
for (let i = 0; i < 400; i++) RAND_POOL.push(rand());
let _ri = 0;
const r = () => RAND_POOL[_ri++ % RAND_POOL.length];

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtM(n: number): string {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}B`;
  return `$${n.toFixed(0)}M`;
}
function fmtPct(n: number, d = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;
}
function fmtMult(n: number): string {
  return `${n.toFixed(2)}x`;
}
function fmtIRR(n: number): string {
  return `${n.toFixed(1)}%`;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral";
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-1">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className={cn("text-xl font-bold", valClass)}>{value}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
      {children}
    </h3>
  );
}

function InfoBox({
  children,
  variant = "blue",
}: {
  children: React.ReactNode;
  variant?: "blue" | "amber" | "emerald" | "violet";
}) {
  const colors = {
    blue: "bg-blue-500/10 border-blue-500/30 text-blue-200",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
    violet: "bg-violet-500/10 border-violet-500/30 text-violet-200",
  };
  return (
    <div className={cn("rounded-lg border p-3 text-xs leading-relaxed", colors[variant])}>
      {children}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface DealFlowItem {
  id: number;
  fundName: string;
  vintage: number;
  strategy: string;
  navM: number;
  discountPct: number;
  unfundedM: number;
  expectedIRR: number;
  geography: string;
  dpiTvpi: string;
  status: "Active" | "Negotiating" | "Closed";
}

interface PortfolioFund {
  id: number;
  name: string;
  vintage: number;
  strategy: string;
  geography: string;
  costM: number;
  navM: number;
  distributed: number;
  dpi: number;
  rvpi: number;
  tvpi: number;
  irr: number;
  unfunded: number;
  maturity: "Early" | "Mid" | "Mature";
}

// ── Data Generation ───────────────────────────────────────────────────────────

const STRATEGIES = ["Buyout", "Growth Equity", "Venture", "Infrastructure", "Credit", "Real Assets"];
const GEOGRAPHIES = ["North America", "Europe", "Asia-Pacific", "Global", "Latin America"];
const FUND_NAMES = [
  "Apex Capital Partners VI",
  "Meridian Growth Fund IV",
  "Summit Buyout VIII",
  "Sequoia Secondary Fund III",
  "Horizon Infrastructure II",
  "NovaTech Ventures IX",
  "GlobalAlpha Credit V",
  "PacificRim Growth II",
  "Ironbridge Buyout III",
  "TerraReal Assets IV",
  "BlueCrest Mezzanine VI",
  "FalconGrowth Equity V",
  "Northstar Healthcare III",
];

const DEAL_FLOW: DealFlowItem[] = Array.from({ length: 5 }, (_, i) => {
  const navM = 80 + Math.floor(r() * 320);
  const discountPct = -(5 + r() * 25);
  const unfunded = Math.floor(r() * navM * 0.3);
  const irr = 12 + r() * 14;
  const dpi = 0.4 + r() * 0.8;
  const rvpi = 0.6 + r() * 0.8;
  const statuses: DealFlowItem["status"][] = ["Active", "Negotiating", "Closed"];
  return {
    id: i,
    fundName: FUND_NAMES[i],
    vintage: 2017 + Math.floor(r() * 5),
    strategy: STRATEGIES[Math.floor(r() * STRATEGIES.length)],
    navM,
    discountPct,
    unfundedM: unfunded,
    expectedIRR: irr,
    geography: GEOGRAPHIES[Math.floor(r() * GEOGRAPHIES.length)],
    dpiTvpi: `${dpi.toFixed(2)}x / ${(dpi + rvpi).toFixed(2)}x`,
    status: statuses[Math.floor(r() * statuses.length)],
  };
});

const PORTFOLIO_FUNDS: PortfolioFund[] = Array.from({ length: 8 }, (_, i) => {
  const costM = 50 + Math.floor(r() * 200);
  const tvpi = 1.1 + r() * 1.4;
  const dpi = 0.3 + r() * 0.9;
  const rvpi = Math.max(0, tvpi - dpi);
  const navM = Math.round(costM * rvpi);
  const irr = 8 + r() * 18;
  const vintages = [2016, 2017, 2018, 2019, 2020, 2021];
  const maturityOptions: PortfolioFund["maturity"][] = ["Early", "Mid", "Mature"];
  return {
    id: i,
    name: FUND_NAMES[i + 4],
    vintage: vintages[Math.floor(r() * vintages.length)],
    strategy: STRATEGIES[Math.floor(r() * STRATEGIES.length)],
    geography: GEOGRAPHIES[Math.floor(r() * GEOGRAPHIES.length)],
    costM,
    navM,
    distributed: Math.round(costM * dpi),
    dpi,
    rvpi,
    tvpi,
    irr,
    unfunded: Math.round(costM * 0.15 * r()),
    maturity: maturityOptions[Math.floor(r() * maturityOptions.length)],
  };
});

// ── Deal Flow Tab ─────────────────────────────────────────────────────────────

function DealFlowTab() {
  const [selected, setSelected] = useState<number | null>(null);

  const selectedDeal = selected !== null ? DEAL_FLOW[selected] : null;

  const statusColor = (s: DealFlowItem["status"]) => {
    if (s === "Active") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    if (s === "Negotiating") return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    return "bg-zinc-500/20 text-zinc-400 border-zinc-500/40";
  };

  const totalNAV = DEAL_FLOW.reduce((a, d) => a + d.navM, 0);
  const avgDiscount = DEAL_FLOW.reduce((a, d) => a + d.discountPct, 0) / DEAL_FLOW.length;
  const avgIRR = DEAL_FLOW.reduce((a, d) => a + d.expectedIRR, 0) / DEAL_FLOW.length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Pipeline NAV" value={fmtM(totalNAV)} sub="5 active deals" highlight="neutral" />
        <StatCard label="Avg Discount" value={`${avgDiscount.toFixed(1)}%`} sub="to reported NAV" highlight="neg" />
        <StatCard label="Avg Expected IRR" value={fmtIRR(avgIRR)} sub="gross, unlevered" highlight="pos" />
        <StatCard label="Deal Count" value="5" sub="this quarter" highlight="neutral" />
      </div>

      <InfoBox variant="blue">
        <strong>Secondary LP Interest Transactions:</strong> Buyers acquire existing LP positions in private equity funds from sellers seeking liquidity. Pricing is typically at a discount to NAV, driven by fund maturity, strategy, market conditions, and seller motivation.
      </InfoBox>

      {/* Deal table */}
      <div>
        <SectionTitle><Briefcase className="w-4 h-4" />Deal Pipeline</SectionTitle>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["Fund Name", "Vintage", "Strategy", "NAV", "Discount", "Unfunded", "Exp. IRR", "DPI / TVPI", "Status"].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-zinc-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEAL_FLOW.map((deal, i) => (
                <tr
                  key={deal.id}
                  onClick={() => setSelected(selected === i ? null : i)}
                  className={cn(
                    "border-b border-white/5 cursor-pointer transition-colors",
                    selected === i ? "bg-blue-500/10" : "hover:bg-white/5"
                  )}
                >
                  <td className="px-3 py-2 text-white font-medium whitespace-nowrap">{deal.fundName}</td>
                  <td className="px-3 py-2 text-zinc-300">{deal.vintage}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-[10px] border-white/20 text-zinc-300">{deal.strategy}</Badge>
                  </td>
                  <td className="px-3 py-2 text-white font-medium">{fmtM(deal.navM)}</td>
                  <td className="px-3 py-2 text-rose-400 font-medium">{deal.discountPct.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-zinc-300">{fmtM(deal.unfundedM)}</td>
                  <td className="px-3 py-2 text-emerald-400 font-medium">{fmtIRR(deal.expectedIRR)}</td>
                  <td className="px-3 py-2 text-zinc-300 font-mono">{deal.dpiTvpi}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={cn("text-[10px]", statusColor(deal.status))}>{deal.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selectedDeal && (
          <motion.div
            key={selectedDeal.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-base">{selectedDeal.fundName}</h3>
                <p className="text-zinc-400 text-xs mt-0.5">{selectedDeal.vintage} Vintage · {selectedDeal.strategy} · {selectedDeal.geography}</p>
              </div>
              <Badge variant="outline" className={cn("text-xs", statusColor(selectedDeal.status))}>
                {selectedDeal.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg bg-white/5 p-3 text-center">
                <div className="text-xs text-zinc-400 mb-1">Reported NAV</div>
                <div className="text-lg font-bold text-white">{fmtM(selectedDeal.navM)}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-3 text-center">
                <div className="text-xs text-zinc-400 mb-1">Bid Price</div>
                <div className="text-lg font-bold text-amber-400">
                  {fmtM(selectedDeal.navM * (1 + selectedDeal.discountPct / 100))}
                </div>
                <div className="text-xs text-rose-400">{selectedDeal.discountPct.toFixed(1)}% discount</div>
              </div>
              <div className="rounded-lg bg-white/5 p-3 text-center">
                <div className="text-xs text-zinc-400 mb-1">Unfunded</div>
                <div className="text-lg font-bold text-white">{fmtM(selectedDeal.unfundedM)}</div>
                <div className="text-xs text-zinc-500">capital call exposure</div>
              </div>
              <div className="rounded-lg bg-white/5 p-3 text-center">
                <div className="text-xs text-zinc-400 mb-1">Expected Net IRR</div>
                <div className="text-lg font-bold text-emerald-400">{fmtIRR(selectedDeal.expectedIRR)}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-zinc-400">
              <strong className="text-zinc-300">Deal Thesis:</strong> Acquiring a seasoned {selectedDeal.vintage} vintage {selectedDeal.strategy} interest at a {Math.abs(selectedDeal.discountPct).toFixed(1)}% discount to NAV provides embedded value and near-term distribution visibility as the portfolio matures.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Market context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox variant="amber">
          <strong>Unfunded Commitment Risk:</strong> Secondary buyers assume responsibility for any remaining unfunded capital commitments. Always model the total exposure as: Bid Price + Unfunded Commitment = Total Capital at Risk.
        </InfoBox>
        <InfoBox variant="emerald">
          <strong>Discount Drivers:</strong> Key factors include fund maturity, portfolio quality, seller urgency, market liquidity conditions, strategy cyclicality, and buyer competition in the secondary market.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Pricing Tab ───────────────────────────────────────────────────────────────

interface PricingScenario {
  discount: number;
  purchasePrice: number;
  irr: number;
  tvpi: number;
  moic: number;
}

function JCurveSVG({ discount }: { discount: number }) {
  const width = 480;
  const height = 160;
  const padL = 44;
  const padR = 16;
  const padT = 12;
  const padB = 28;
  const W = width - padL - padR;
  const H = height - padT - padB;

  // J-curve: initial drawdowns then recoveries
  const basePoints = [
    [0, 0], [0.05, -8], [0.12, -18], [0.2, -22], [0.3, -20],
    [0.4, -10], [0.5, 5], [0.6, 18], [0.7, 30], [0.8, 42], [0.9, 52], [1.0, 60],
  ] as [number, number][];

  // Discount shifts the curve up (better entry)
  const shift = Math.abs(discount) * 0.6;
  const pts = basePoints.map(([x, y]) => [x, y + shift] as [number, number]);

  const minY = Math.min(...pts.map(([, y]) => y)) - 5;
  const maxY = Math.max(...pts.map(([, y]) => y)) + 5;
  const range = maxY - minY;

  const toX = (v: number) => padL + v * W;
  const toY = (v: number) => padT + H - ((v - minY) / range) * H;

  const pathD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${toX(x).toFixed(1)},${toY(y).toFixed(1)}`).join(" ");
  const zeroY = toY(0);

  // Area fill above zero
  const areaAbove = pts
    .filter(([, y]) => y >= 0)
    .map(([x, y]) => [toX(x), toY(y)] as [number, number]);

  // Axes
  const yTicks = [-20, 0, 20, 40, 60];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {/* Grid */}
      {yTicks.map(tick => (
        <g key={tick}>
          <line
            x1={padL} y1={toY(tick)} x2={width - padR} y2={toY(tick)}
            stroke="rgba(255,255,255,0.06)" strokeWidth={1}
          />
          <text x={padL - 6} y={toY(tick) + 4} textAnchor="end" fontSize={9} fill="#71717a">{tick}%</text>
        </g>
      ))}

      {/* Zero line */}
      <line x1={padL} y1={zeroY} x2={width - padR} y2={zeroY} stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4,3" />

      {/* J-curve path */}
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinejoin="round" />

      {/* X-axis labels */}
      {[0, 2, 4, 6, 8, 10].map(yr => (
        <text key={yr} x={toX(yr / 10)} y={height - 6} textAnchor="middle" fontSize={9} fill="#71717a">Yr{yr}</text>
      ))}

      {/* Discount annotation */}
      <rect x={padL + 8} y={padT + 4} width={130} height={18} rx={4} fill="rgba(59,130,246,0.12)" />
      <text x={padL + 14} y={padT + 16} fontSize={10} fill="#93c5fd">
        {Math.abs(discount).toFixed(0)}% discount → +{shift.toFixed(0)}% J-curve lift
      </text>
    </svg>
  );
}

function NAVProgressionSVG({ discountPct }: { discountPct: number }) {
  const width = 480;
  const height = 130;
  const padL = 44;
  const padR = 16;
  const padT = 10;
  const padB = 24;
  const W = width - padL - padR;
  const H = height - padT - padB;

  // Simulate NAV over 10 years
  const years = Array.from({ length: 11 }, (_, i) => i);
  const baseNAV = 100;
  const entryPrice = baseNAV * (1 + discountPct / 100);

  const navPoints = years.map(yr => {
    // NAV grows, peaks around yr 6, then declines as distributions return capital
    const growth = yr <= 6
      ? baseNAV * (1 + (0.12 * yr - 0.005 * yr * yr))
      : baseNAV * (1.5 - 0.08 * (yr - 6));
    return growth;
  });

  const maxNAV = Math.max(...navPoints, entryPrice + 10);
  const minNAV = 0;

  const toX = (yr: number) => padL + (yr / 10) * W;
  const toY = (v: number) => padT + H - ((v - minNAV) / (maxNAV - minNAV)) * H;

  const navPath = navPoints.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");

  // Area under NAV curve
  const areaD = navPath + ` L${toX(10)},${toY(0)} L${toX(0)},${toY(0)} Z`;

  const entryY = toY(entryPrice);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {/* Grid lines */}
      {[0, 50, 100, 150, 200].map(v => (
        <g key={v}>
          <line x1={padL} y1={toY(v)} x2={width - padR} y2={toY(v)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          <text x={padL - 5} y={toY(v) + 4} textAnchor="end" fontSize={9} fill="#52525b">{v}</text>
        </g>
      ))}

      {/* NAV area */}
      <path d={areaD} fill="rgba(59,130,246,0.08)" />
      <path d={navPath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />

      {/* Entry price line */}
      <line x1={padL} y1={entryY} x2={width - padR} y2={entryY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5,3" />
      <text x={width - padR - 2} y={entryY - 4} textAnchor="end" fontSize={9} fill="#fbbf24">Entry: {entryPrice.toFixed(0)}</text>

      {/* X-axis */}
      {years.map(yr => (
        <text key={yr} x={toX(yr)} y={height - 4} textAnchor="middle" fontSize={9} fill="#52525b">Yr{yr}</text>
      ))}

      {/* NAV label */}
      <circle cx={toX(6)} cy={toY(navPoints[6])} r={4} fill="#3b82f6" />
      <text x={toX(6) + 6} y={toY(navPoints[6]) - 4} fontSize={9} fill="#93c5fd">NAV peak</text>
    </svg>
  );
}

function PricingTab() {
  const [discountPct, setDiscountPct] = useState(-15);
  const [navM, setNavM] = useState(100);
  const [growthRate, setGrowthRate] = useState(12);
  const [holdYears, setHoldYears] = useState(5);

  const scenarios: PricingScenario[] = useMemo(() => {
    return [-5, -10, -15, -20, -25, -30].map(disc => {
      const purchasePrice = navM * (1 + disc / 100);
      const finalNav = navM * Math.pow(1 + growthRate / 100, holdYears);
      const tvpi = finalNav / purchasePrice;
      const irr = (Math.pow(tvpi, 1 / holdYears) - 1) * 100;
      const moic = tvpi;
      return { discount: disc, purchasePrice, irr, tvpi, moic };
    });
  }, [navM, growthRate, holdYears]);

  const selectedScenario = scenarios.find(s => s.discount === discountPct) ?? scenarios[2];

  const bidPrice = navM * (1 + discountPct / 100);
  const askPrice = navM * (1 + (discountPct + 3) / 100);
  const spread = Math.abs(askPrice - bidPrice);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="NAV" value={fmtM(navM)} sub="reported" highlight="neutral" />
        <StatCard label="Bid Price" value={fmtM(bidPrice)} sub={`${discountPct.toFixed(0)}% discount`} highlight="neg" />
        <StatCard label="Expected IRR" value={fmtIRR(selectedScenario.irr)} sub={`${holdYears}yr hold`} highlight="pos" />
        <StatCard label="Expected TVPI" value={fmtMult(selectedScenario.tvpi)} sub="gross" highlight="pos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <SectionTitle><Calculator className="w-4 h-4" />Pricing Calculator</SectionTitle>

          <div className="space-y-3">
            {[
              { label: "Reported NAV ($M)", value: navM, min: 50, max: 500, step: 10, set: setNavM, fmt: (v: number) => `$${v}M` },
              { label: "Discount to NAV", value: discountPct, min: -35, max: -2, step: 1, set: setDiscountPct, fmt: (v: number) => `${v.toFixed(0)}%` },
              { label: "Portfolio Growth Rate", value: growthRate, min: 6, max: 25, step: 1, set: setGrowthRate, fmt: (v: number) => `${v.toFixed(0)}%` },
              { label: "Hold Period (years)", value: holdYears, min: 2, max: 8, step: 1, set: setHoldYears, fmt: (v: number) => `${v}yr` },
            ].map(({ label, value, min, max, step, set, fmt }) => (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">{label}</span>
                  <span className="text-white font-medium">{fmt(value)}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={e => set(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            ))}
          </div>

          {/* Bid/Ask spread mechanic */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <SectionTitle><BarChart3 className="w-4 h-4" />Bid / Ask Spread</SectionTitle>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-1 text-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 py-2">
                <div className="text-xs text-zinc-400 mb-1">Seller Ask</div>
                <div className="text-base font-bold text-emerald-400">{fmtM(askPrice)}</div>
                <div className="text-xs text-zinc-500">{(discountPct + 3).toFixed(0)}% disc.</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              <div className="flex-1 text-center rounded-lg bg-blue-500/10 border border-blue-500/20 py-2">
                <div className="text-xs text-zinc-400 mb-1">Buyer Bid</div>
                <div className="text-base font-bold text-blue-400">{fmtM(bidPrice)}</div>
                <div className="text-xs text-zinc-500">{discountPct.toFixed(0)}% disc.</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-400 text-center">
              Spread: {fmtM(spread)} ({(Math.abs(spread / navM) * 100).toFixed(1)}% of NAV)
            </div>
          </div>
        </div>

        {/* J-curve chart */}
        <div className="space-y-4">
          <SectionTitle><TrendingUp className="w-4 h-4" />J-Curve Visualization</SectionTitle>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-zinc-400 mb-2">IRR profile over fund life (adjusted for entry discount)</div>
            <JCurveSVG discount={discountPct} />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-zinc-400 mb-2">NAV progression vs entry price</div>
            <NAVProgressionSVG discountPct={discountPct} />
          </div>
        </div>
      </div>

      {/* Scenario table */}
      <div>
        <SectionTitle><Layers className="w-4 h-4" />TVPI / IRR at Various Discounts</SectionTitle>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["Discount", "Purchase Price", "TVPI", "Net IRR", "MOIC", "vs Par"].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-zinc-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarios.map(sc => (
                <tr
                  key={sc.discount}
                  className={cn(
                    "border-b border-white/5 transition-colors",
                    sc.discount === discountPct ? "bg-blue-500/10" : "hover:bg-white/5"
                  )}
                >
                  <td className="px-4 py-2 text-rose-400 font-medium">{sc.discount.toFixed(0)}%</td>
                  <td className="px-4 py-2 text-white">{fmtM(sc.purchasePrice)}</td>
                  <td className="px-4 py-2 text-emerald-400 font-medium">{fmtMult(sc.tvpi)}</td>
                  <td className="px-4 py-2 text-emerald-400 font-medium">{fmtIRR(sc.irr)}</td>
                  <td className="px-4 py-2 text-zinc-300 font-mono">{fmtMult(sc.moic)}</td>
                  <td className="px-4 py-2 text-amber-400">+{Math.abs(sc.discount).toFixed(0)} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InfoBox variant="violet">
        <strong>Discount Mechanics:</strong> Secondary discounts embed immediate margin of safety. A 15% discount to NAV means you effectively "buy $1 of assets for $0.85". Combined with underlying fund appreciation, this creates an IRR enhancement versus holding the primary position from inception.
      </InfoBox>
    </div>
  );
}

// ── Portfolio Tab ─────────────────────────────────────────────────────────────

function CashFlowSVG({ funds }: { funds: PortfolioFund[] }) {
  const width = 600;
  const height = 160;
  const padL = 48;
  const padR = 16;
  const padT = 10;
  const padB = 28;
  const W = width - padL - padR;
  const H = height - padT - padB;

  const years = Array.from({ length: 11 }, (_, i) => i);

  // Aggregate contributions and distributions
  const contributions = years.map(yr => {
    return -funds.reduce((sum, f) => {
      const callSchedule = yr <= 3 ? f.costM * [0.2, 0.35, 0.3, 0.15][yr] ?? 0 : 0;
      return sum + callSchedule;
    }, 0);
  });

  const distributions = years.map(yr => {
    return funds.reduce((sum, f) => {
      if (yr < 3) return sum;
      const distSchedule = yr <= 8
        ? f.distributed * [0, 0, 0, 0.05, 0.12, 0.22, 0.25, 0.22, 0.14][yr] ?? 0
        : f.distributed * 0;
      return sum + distSchedule;
    }, 0);
  });

  const maxAbs = Math.max(...contributions.map(Math.abs), ...distributions);

  const toX = (yr: number) => padL + (yr / 10) * W;
  const barW = W / 10 * 0.35;
  const zeroY = padT + H / 2;
  const toBarH = (v: number) => (Math.abs(v) / maxAbs) * (H / 2 - 4);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {/* Zero line */}
      <line x1={padL} y1={zeroY} x2={width - padR} y2={zeroY} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

      {years.map(yr => {
        const cx = toX(yr);
        const cH = toBarH(contributions[yr]);
        const dH = toBarH(distributions[yr]);
        return (
          <g key={yr}>
            {/* Contributions (below zero) */}
            <rect x={cx - barW - 1} y={zeroY} width={barW} height={cH} fill="rgba(239,68,68,0.6)" rx={2} />
            {/* Distributions (above zero) */}
            <rect x={cx + 1} y={zeroY - dH} width={barW} height={dH} fill="rgba(52,211,153,0.6)" rx={2} />
            <text x={cx} y={height - 6} textAnchor="middle" fontSize={9} fill="#52525b">Yr{yr}</text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={padL + 4} y={padT + 4} width={8} height={8} fill="rgba(52,211,153,0.6)" rx={1} />
      <text x={padL + 16} y={padT + 12} fontSize={9} fill="#71717a">Distributions</text>
      <rect x={padL + 90} y={padT + 4} width={8} height={8} fill="rgba(239,68,68,0.6)" rx={1} />
      <text x={padL + 102} y={padT + 12} fontSize={9} fill="#71717a">Contributions</text>
    </svg>
  );
}

function PortfolioTab() {
  const [sortKey, setSortKey] = useState<keyof PortfolioFund>("irr");

  const sorted = useMemo(() => {
    return [...PORTFOLIO_FUNDS].sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));
  }, [sortKey]);

  const totalCost = PORTFOLIO_FUNDS.reduce((a, f) => a + f.costM, 0);
  const totalNAV = PORTFOLIO_FUNDS.reduce((a, f) => a + f.navM, 0);
  const totalDist = PORTFOLIO_FUNDS.reduce((a, f) => a + f.distributed, 0);
  const avgIRR = PORTFOLIO_FUNDS.reduce((a, f) => a + f.irr, 0) / PORTFOLIO_FUNDS.length;
  const portTVPI = (totalNAV + totalDist) / totalCost;
  const portDPI = totalDist / totalCost;
  const portRVPI = totalNAV / totalCost;

  // Diversification by strategy
  const strategyMap: Record<string, number> = {};
  PORTFOLIO_FUNDS.forEach(f => {
    strategyMap[f.strategy] = (strategyMap[f.strategy] ?? 0) + f.costM;
  });

  // Diversification by vintage
  const vintageMap: Record<number, number> = {};
  PORTFOLIO_FUNDS.forEach(f => {
    vintageMap[f.vintage] = (vintageMap[f.vintage] ?? 0) + f.costM;
  });

  // Geography
  const geoMap: Record<string, number> = {};
  PORTFOLIO_FUNDS.forEach(f => {
    geoMap[f.geography] = (geoMap[f.geography] ?? 0) + f.costM;
  });

  const maturityColor = (m: PortfolioFund["maturity"]) => {
    if (m === "Early") return "text-amber-400";
    if (m === "Mid") return "text-blue-400";
    return "text-emerald-400";
  };

  return (
    <div className="space-y-6">
      {/* Portfolio metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Cost" value={fmtM(totalCost)} sub="8 funds" highlight="neutral" />
        <StatCard label="Portfolio TVPI" value={fmtMult(portTVPI)} sub={`DPI: ${portDPI.toFixed(2)}x`} highlight="pos" />
        <StatCard label="RVPI (Remaining)" value={fmtMult(portRVPI)} sub="unrealized" highlight="neutral" />
        <StatCard label="Blended IRR" value={fmtIRR(avgIRR)} sub="gross" highlight="pos" />
      </div>

      {/* Cash flow model */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle><BarChart3 className="w-4 h-4" />Portfolio Cash Flow Model</SectionTitle>
        <CashFlowSVG funds={PORTFOLIO_FUNDS} />
        <div className="flex gap-4 mt-2 text-xs text-zinc-400 justify-end">
          <span>Total Distributed: <span className="text-emerald-400 font-medium">{fmtM(totalDist)}</span></span>
          <span>Remaining NAV: <span className="text-blue-400 font-medium">{fmtM(totalNAV)}</span></span>
        </div>
      </div>

      {/* Diversification */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "By Strategy", map: strategyMap },
          { title: "By Geography", map: geoMap },
          { title: "By Vintage", map: Object.fromEntries(Object.entries(vintageMap).map(([k, v]) => [k.toString(), v])) },
        ].map(({ title, map }) => (
          <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-medium text-zinc-300 mb-3">{title}</div>
            <div className="space-y-2">
              {Object.entries(map)
                .sort((a, b) => b[1] - a[1])
                .map(([key, val]) => {
                  const pct = (val / totalCost) * 100;
                  return (
                    <div key={key} className="space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400 truncate">{key}</span>
                        <span className="text-zinc-300 ml-2">{pct.toFixed(0)}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Fund table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionTitle><Briefcase className="w-4 h-4" />Fund Holdings</SectionTitle>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            Sort by:
            {(["irr", "tvpi", "costM"] as const).map(k => (
              <button
                key={k}
                onClick={() => setSortKey(k)}
                className={cn(
                  "px-2 py-0.5 rounded border text-xs transition-colors",
                  sortKey === k
                    ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                    : "border-white/10 text-zinc-400 hover:border-white/20"
                )}
              >
                {k === "irr" ? "IRR" : k === "tvpi" ? "TVPI" : "Size"}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["Fund", "Vintage", "Strategy", "Cost", "NAV", "DPI", "RVPI", "TVPI", "IRR", "Maturity"].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-zinc-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(f => (
                <tr key={f.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-3 py-2 text-white font-medium whitespace-nowrap">{f.name}</td>
                  <td className="px-3 py-2 text-zinc-300">{f.vintage}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-[10px] border-white/20 text-zinc-300">{f.strategy}</Badge>
                  </td>
                  <td className="px-3 py-2 text-white">{fmtM(f.costM)}</td>
                  <td className="px-3 py-2 text-blue-300">{fmtM(f.navM)}</td>
                  <td className="px-3 py-2 text-emerald-400 font-mono">{f.dpi.toFixed(2)}x</td>
                  <td className="px-3 py-2 text-zinc-300 font-mono">{f.rvpi.toFixed(2)}x</td>
                  <td className="px-3 py-2 text-emerald-400 font-medium font-mono">{fmtMult(f.tvpi)}</td>
                  <td className="px-3 py-2 text-emerald-400 font-medium">{fmtIRR(f.irr)}</td>
                  <td className={cn("px-3 py-2 font-medium", maturityColor(f.maturity))}>{f.maturity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InfoBox variant="emerald">
        <strong>DPI / RVPI / TVPI:</strong> DPI (Distributed to Paid-In) measures cash-on-cash return. RVPI (Residual Value to Paid-In) represents remaining unrealized value. TVPI (Total Value to Paid-In) = DPI + RVPI. Secondary buyers prefer higher DPI as it de-risks the position.
      </InfoBox>
    </div>
  );
}

// ── GP-Led Tab ────────────────────────────────────────────────────────────────

interface GPLedScenario {
  name: string;
  description: string;
  rolloverPct: number;
  cashOutPct: number;
  gpCarry: number;
  mgmtFee: number;
  preferredReturn: number;
  irrExpected: number;
  alignment: "High" | "Medium" | "Low";
}

const GP_LED_SCENARIOS: GPLedScenario[] = [
  {
    name: "Single-Asset Continuation Fund",
    description: "GP carves out top performer into new vehicle. Existing LPs choose cash-out or roll.",
    rolloverPct: 65,
    cashOutPct: 35,
    gpCarry: 20,
    mgmtFee: 1.5,
    preferredReturn: 8,
    irrExpected: 18 + r() * 6,
    alignment: "High",
  },
  {
    name: "Multi-Asset Strip Sale",
    description: "Several portfolio companies packaged into continuation vehicle.",
    rolloverPct: 55,
    cashOutPct: 45,
    gpCarry: 20,
    mgmtFee: 1.75,
    preferredReturn: 7,
    irrExpected: 14 + r() * 5,
    alignment: "Medium",
  },
  {
    name: "Tender Offer Process",
    description: "GP offers existing LPs liquidity via structured tender at near-NAV pricing.",
    rolloverPct: 40,
    cashOutPct: 60,
    gpCarry: 15,
    mgmtFee: 1.25,
    preferredReturn: 8,
    irrExpected: 12 + r() * 4,
    alignment: "Medium",
  },
];

function ContinuationFundDiagram() {
  const nodeStyle = "rounded-xl border p-3 text-center text-xs flex flex-col items-center gap-1";
  return (
    <svg viewBox="0 0 560 220" className="w-full" style={{ height: 220 }}>
      {/* Existing Fund box */}
      <rect x={10} y={80} width={130} height={60} rx={10} fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.4)" strokeWidth={1.5} />
      <text x={75} y={106} textAnchor="middle" fontSize={11} fill="#93c5fd" fontWeight="600">Existing Fund</text>
      <text x={75} y={122} textAnchor="middle" fontSize={9} fill="#71717a">Fund X (2018)</text>
      <text x={75} y={134} textAnchor="middle" fontSize={9} fill="#71717a">3 portfolio cos.</text>

      {/* Arrow: existing → decision */}
      <line x1={140} y1={110} x2={180} y2={110} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} markerEnd="url(#arr)" />

      {/* Decision diamond */}
      <polygon points="210,90 250,110 210,130 170,110" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.4)" strokeWidth={1.5} />
      <text x={210} y={107} textAnchor="middle" fontSize={9} fill="#fbbf24" fontWeight="600">LP</text>
      <text x={210} y={119} textAnchor="middle" fontSize={9} fill="#fbbf24">Decision</text>

      {/* Arrow: cash out */}
      <line x1={210} y1={130} x2={210} y2={175} stroke="rgba(239,68,68,0.5)" strokeWidth={1.5} markerEnd="url(#arr2)" />
      <rect x={155} y={175} width={110} height={36} rx={8} fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.35)" strokeWidth={1.5} />
      <text x={210} y={191} textAnchor="middle" fontSize={10} fill="#fca5a5" fontWeight="600">Cash Out</text>
      <text x={210} y={204} textAnchor="middle" fontSize={9} fill="#71717a">Receive NAV - disc.</text>

      {/* Arrow: roll over */}
      <line x1={250} y1={110} x2={290} y2={110} stroke="rgba(52,211,153,0.5)" strokeWidth={1.5} markerEnd="url(#arr3)" />
      <rect x={290} y={80} width={130} height={60} rx={10} fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.35)" strokeWidth={1.5} />
      <text x={355} y={106} textAnchor="middle" fontSize={11} fill="#6ee7b7" fontWeight="600">Continuation Fund</text>
      <text x={355} y={120} textAnchor="middle" fontSize={9} fill="#71717a">New 5-7yr vehicle</text>
      <text x={355} y={132} textAnchor="middle" fontSize={9} fill="#71717a">Fresh carry reset</text>

      {/* Arrow: new LP capital */}
      <line x1={420} y1={95} x2={460} y2={70} stroke="rgba(139,92,246,0.5)" strokeWidth={1.5} markerEnd="url(#arr4)" />
      <text x={475} y={68} textAnchor="start" fontSize={9} fill="#c4b5fd">New LP</text>
      <text x={475} y={80} textAnchor="start" fontSize={9} fill="#c4b5fd">Capital</text>

      {/* GP box */}
      <rect x={10} y={175} width={110} height={36} rx={8} fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.35)" strokeWidth={1.5} />
      <text x={65} y={191} textAnchor="middle" fontSize={10} fill="#c4b5fd" fontWeight="600">GP / Manager</text>
      <text x={65} y={204} textAnchor="middle" fontSize={9} fill="#71717a">Earns fresh carry</text>

      {/* Arrow markers */}
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.25)" />
        </marker>
        <marker id="arr2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="rgba(239,68,68,0.5)" />
        </marker>
        <marker id="arr3" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="rgba(52,211,153,0.5)" />
        </marker>
        <marker id="arr4" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="rgba(139,92,246,0.5)" />
        </marker>
      </defs>
    </svg>
  );
}

function GPLedTab() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const scenario = GP_LED_SCENARIOS[selectedScenario];

  const alignmentColor = (a: GPLedScenario["alignment"]) => {
    if (a === "High") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (a === "Medium") return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-rose-400 bg-rose-500/10 border-rose-500/30";
  };

  const feeComparison = [
    { label: "Primary (typical)", carry: 20, mgmt: 2.0, pref: 8 },
    { label: "Selected Scenario", carry: scenario.gpCarry, mgmt: scenario.mgmtFee, pref: scenario.preferredReturn },
    { label: "Market Best Terms", carry: 15, mgmt: 1.25, pref: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Rollover %" value={`${scenario.rolloverPct}%`} sub="LP re-up rate" highlight="pos" />
        <StatCard label="Cash-Out %" value={`${scenario.cashOutPct}%`} sub="liquidity seekers" highlight="neutral" />
        <StatCard label="GP Carry" value={`${scenario.gpCarry}%`} sub="on continuation fund" highlight="neg" />
        <StatCard label="Exp. Net IRR" value={fmtIRR(scenario.irrExpected)} sub="continuation vehicle" highlight="pos" />
      </div>

      {/* Scenario selector */}
      <div className="flex flex-wrap gap-2">
        {GP_LED_SCENARIOS.map((sc, i) => (
          <button
            key={i}
            onClick={() => setSelectedScenario(i)}
            className={cn(
              "px-3 py-1.5 rounded-lg border text-xs transition-colors",
              selectedScenario === i
                ? "bg-blue-500/20 border-blue-500/40 text-blue-200"
                : "border-white/10 text-zinc-400 hover:border-white/20"
            )}
          >
            {sc.name}
          </button>
        ))}
      </div>

      {/* Selected scenario card */}
      <motion.div
        key={selectedScenario}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 bg-white/5 p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-white font-semibold text-sm">{scenario.name}</h3>
            <p className="text-zinc-400 text-xs mt-1">{scenario.description}</p>
          </div>
          <Badge variant="outline" className={cn("text-xs ml-3 flex-shrink-0", alignmentColor(scenario.alignment))}>
            {scenario.alignment} Alignment
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
          {[
            { label: "LP Rollover", value: `${scenario.rolloverPct}%`, color: "text-emerald-400" },
            { label: "LP Cash Out", value: `${scenario.cashOutPct}%`, color: "text-zinc-300" },
            { label: "Mgmt Fee", value: `${scenario.mgmtFee}%`, color: "text-amber-400" },
            { label: "Carry", value: `${scenario.gpCarry}%`, color: "text-amber-400" },
            { label: "Pref. Return", value: `${scenario.preferredReturn}%`, color: "text-blue-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg bg-white/5 p-2 text-center">
              <div className="text-xs text-zinc-400 mb-1">{label}</div>
              <div className={cn("text-sm font-bold", color)}>{value}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Structure diagram */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <SectionTitle><Building2 className="w-4 h-4" />Continuation Fund Structure</SectionTitle>
        <ContinuationFundDiagram />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-500/50 mt-0.5 flex-shrink-0" />
            <div><span className="text-zinc-300 font-medium">Roll Over:</span> <span className="text-zinc-400">Existing LPs reinvest at fair-market NAV into new continuation vehicle with reset waterfall.</span></div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-sm bg-rose-500/50 mt-0.5 flex-shrink-0" />
            <div><span className="text-zinc-300 font-medium">Cash Out:</span> <span className="text-zinc-400">Selling LPs receive liquidity via proceeds from new investors or secondary buyers at negotiated price.</span></div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-sm bg-violet-500/50 mt-0.5 flex-shrink-0" />
            <div><span className="text-zinc-300 font-medium">New Capital:</span> <span className="text-zinc-400">Institutional secondaries buyers or new LPs provide fresh capital to fund the cash-out pool.</span></div>
          </div>
        </div>
      </div>

      {/* Fee comparison */}
      <div>
        <SectionTitle><Calculator className="w-4 h-4" />Fee Structure Comparison</SectionTitle>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["Structure", "Mgmt Fee", "Carry", "Pref. Return", "Net IRR Impact"].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-zinc-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {feeComparison.map((fc, i) => (
                <tr key={i} className={cn("border-b border-white/5", i === 1 ? "bg-blue-500/5" : "hover:bg-white/5")}>
                  <td className="px-4 py-2 text-zinc-300 font-medium">{fc.label}</td>
                  <td className="px-4 py-2 text-amber-400">{fc.mgmt.toFixed(2)}%</td>
                  <td className="px-4 py-2 text-amber-400">{fc.carry}%</td>
                  <td className="px-4 py-2 text-blue-400">{fc.pref}%</td>
                  <td className="px-4 py-2">
                    <span className={cn(
                      "font-medium",
                      fc.mgmt + fc.carry / 10 < 4 ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {fc.mgmt + fc.carry / 10 < 4 ? "Low drag" : "Moderate drag"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alignment analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <SectionTitle><ShieldCheck className="w-4 h-4" />Alignment of Interest</SectionTitle>
          <div className="space-y-3">
            {[
              { factor: "GP co-investment", aligned: true, note: "GP commits own capital alongside LPs" },
              { factor: "Fresh carry reset", aligned: false, note: "Resets waterfall — potential LP dilution" },
              { factor: "Independent valuation", aligned: true, note: "Third-party NAV assessment required" },
              { factor: "LPAC consent", aligned: true, note: "LP Advisory Committee must approve terms" },
              { factor: "No-fault divorce clause", aligned: true, note: "LPs retain GP removal rights" },
              { factor: "Hurdle rate", aligned: scenario.preferredReturn >= 8, note: `${scenario.preferredReturn}% preferred return threshold` },
            ].map(({ factor, aligned, note }) => (
              <div key={factor} className="flex items-start gap-2">
                {aligned
                  ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                }
                <div>
                  <div className="text-xs text-zinc-300 font-medium">{factor}</div>
                  <div className="text-xs text-zinc-500">{note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <InfoBox variant="violet">
            <strong>GP-Led Secondary Rationale:</strong> GPs use continuation funds to extend ownership of high-conviction assets beyond the fund's contractual life, accessing more upside while giving existing LPs a liquidity option — avoiding a forced sale at an inopportune time.
          </InfoBox>
          <InfoBox variant="amber">
            <strong>Key Due Diligence Items:</strong> Scrutinize the independent valuation process, GP co-investment commitment size, LPAC composition and independence, carry reset mechanics, and the strategic rationale for the chosen assets in the continuation vehicle.
          </InfoBox>
          <InfoBox variant="blue">
            <strong>Market Size:</strong> GP-led secondaries now represent ~45% of secondary transaction volume ($120B+ annually), driven by longer hold periods, challenging exit markets, and increased LP demand for liquidity solutions.
          </InfoBox>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PESecondariesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-400" />
            PE Secondaries Simulator
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            LP interest purchases · GP-led continuation funds · NAV discount mechanics · Portfolio construction
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs border-blue-500/40 text-blue-300 bg-blue-500/10">
            <DollarSign className="w-3 h-3 mr-1" /> $120B+ Annual Volume
          </Badge>
          <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-300 bg-emerald-500/10">
            <TrendingUp className="w-3 h-3 mr-1" /> Liquidity Solutions
          </Badge>
          <Badge variant="outline" className="text-xs border-violet-500/40 text-violet-300 bg-violet-500/10">
            <Globe className="w-3 h-3 mr-1" /> Global Markets
          </Badge>
        </div>
      </motion.div>

      {/* Market context */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <StatCard label="Secondary Market Size" value="$134B" sub="2025 estimated" highlight="neutral" />
        <StatCard label="Avg LP Discount" value="-11.4%" sub="to NAV (Q4 2025)" highlight="neg" />
        <StatCard label="GP-Led Share" value="45%" sub="of total volume" highlight="neutral" />
        <StatCard label="Avg Secondary IRR" value="+14.2%" sub="net, 10yr median" highlight="pos" />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Tabs defaultValue="dealflow" className="w-full">
          <TabsList className="bg-zinc-900 border border-white/10 mb-4 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="dealflow" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-200 text-zinc-400 text-xs">
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />Deal Flow
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-200 text-zinc-400 text-xs">
              <Calculator className="w-3.5 h-3.5 mr-1.5" />Pricing
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-200 text-zinc-400 text-xs">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />Portfolio
            </TabsTrigger>
            <TabsTrigger value="gpled" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-200 text-zinc-400 text-xs">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />GP-Led
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dealflow" className="data-[state=inactive]:hidden">
            <DealFlowTab />
          </TabsContent>
          <TabsContent value="pricing" className="data-[state=inactive]:hidden">
            <PricingTab />
          </TabsContent>
          <TabsContent value="portfolio" className="data-[state=inactive]:hidden">
            <PortfolioTab />
          </TabsContent>
          <TabsContent value="gpled" className="data-[state=inactive]:hidden">
            <GPLedTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
