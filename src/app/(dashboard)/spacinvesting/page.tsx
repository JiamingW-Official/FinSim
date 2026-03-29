"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  BarChart2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Target,
  Layers,
  PieChart,
  Lock,
  Unlock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ──────────────────────────────────────────────────────────────
let s = 662002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Reset seed helper
function resetSeed() {
  s = 662002;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface SpacDeal {
  name: string;
  ticker: string;
  sponsor: string;
  target: string;
  sector: string;
  raiseSizeMn: number;
  trustPerShare: number;
  currentPrice: number;
  pipeAmountMn: number;
  warrantsPerUnit: number;
  warrantStrike: number;
  daysToDeadline: number;
  status: "Pre-deal" | "Announced" | "Completed" | "Liquidated";
  preMergerReturn: number;
  postMergerReturn: number;
}

interface HistoricalDataPoint {
  label: string;
  preMerger: number;
  postMerger6m: number;
  postMerger12m: number;
}

interface SectorBreakdown {
  sector: string;
  count: number;
  avgPostReturn: number;
  color: string;
}

// ── Data Generation ──────────────────────────────────────────────────────────

function generateDeals(): SpacDeal[] {
  resetSeed();
  const names = [
    "Apex Acquisition Corp",
    "Horizon Strategic Partners II",
    "Nova Capital SPAC IV",
    "Vertex Growth Acquisition",
    "Summit Ventures SPAC III",
    "Pinnacle Opportunity Corp",
    "Eclipse Capital Partners",
    "Nexus Innovation SPAC",
  ];
  const sponsors = [
    "Apex PE Group",
    "Horizon Capital Mgmt",
    "Nova Asset Advisors",
    "Vertex Ventures LLC",
    "Summit Capital Partners",
    "Pinnacle Advisors LP",
    "Eclipse Partners LP",
    "Nexus Capital Mgmt",
  ];
  const targets = [
    "TechFlow AI Inc.",
    "GreenCore Energy",
    "MedTech Solutions",
    "FinEdge Payments",
    "SpaceLogic Corp",
    "AgriSmart Holdings",
    "CloudNine SaaS",
    "BioGen Therapeutics",
  ];
  const sectors = ["Technology", "Energy", "Healthcare", "Fintech", "Aerospace", "Agriculture", "SaaS", "Biotech"];
  const tickers = ["APXU", "HRZN", "NOVA", "VRTX", "SUMM", "PNCL", "ECLP", "NEXS"];
  const statuses: SpacDeal["status"][] = ["Pre-deal", "Announced", "Completed", "Liquidated"];

  return names.map((name, i) => {
    const raiseSizeMn = 200 + Math.floor(rand() * 800);
    const trustPerShare = 10;
    const premium = (rand() - 0.4) * 0.15;
    const currentPrice = parseFloat((trustPerShare * (1 + premium)).toFixed(2));
    const pipeRatio = 0.1 + rand() * 0.4;
    const pipeAmountMn = Math.floor(raiseSizeMn * pipeRatio);
    const warrantsPerUnit = rand() > 0.5 ? 1 : 0.5;
    const warrantStrike = 11.5;
    const daysToDeadline = 30 + Math.floor(rand() * 700);
    const statusIdx = Math.floor(rand() * 4);
    const status = statuses[statusIdx];
    const preMergerReturn = -0.02 + rand() * 0.06;
    const postMergerReturn = -0.65 + rand() * 1.1;

    return {
      name,
      ticker: tickers[i],
      sponsor: sponsors[i],
      target: status === "Pre-deal" ? "TBD" : targets[i],
      sector: sectors[i],
      raiseSizeMn,
      trustPerShare,
      currentPrice,
      pipeAmountMn,
      warrantsPerUnit,
      warrantStrike,
      daysToDeadline,
      status,
      preMergerReturn,
      postMergerReturn,
    };
  });
}

function generateHistoricalData(): HistoricalDataPoint[] {
  resetSeed();
  const years = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"];
  return years.map((label) => ({
    label,
    preMerger: 0.5 + rand() * 4.0,
    postMerger6m: -50 + rand() * 80,
    postMerger12m: -60 + rand() * 90,
  }));
}

function generateSectorBreakdown(): SectorBreakdown[] {
  resetSeed();
  const sectorData = [
    { sector: "Technology", color: "#3b82f6" },
    { sector: "Healthcare", color: "#10b981" },
    { sector: "Fintech", color: "#f59e0b" },
    { sector: "Energy", color: "#ef4444" },
    { sector: "Consumer", color: "#8b5cf6" },
    { sector: "Industrials", color: "#64748b" },
  ];
  return sectorData.map((s2) => ({
    ...s2,
    count: 20 + Math.floor(rand() * 80),
    avgPostReturn: -40 + rand() * 60,
  }));
}

// ── Static reference data ─────────────────────────────────────────────────────

const LIFECYCLE_STEPS = [
  { label: "SPAC IPO", sub: "Blank check company raises capital at $10/share", icon: Building2, color: "#3b82f6" },
  { label: "Trust Account", sub: "$10/share placed in T-Bill trust, earns ~5% p.a.", icon: Lock, color: "#10b981" },
  { label: "Deal Search", sub: "Sponsor has 18–24 months to find acquisition target", icon: Target, color: "#f59e0b" },
  { label: "Target Announced", sub: "Merger agreement signed, PIPE investors committed", icon: Zap, color: "#f97316" },
  { label: "Shareholder Vote", sub: "Shareholders vote to approve; can redeem at ~$10 NAV", icon: CheckCircle2, color: "#8b5cf6" },
  { label: "De-SPAC Close", sub: "Merger completes, company lists as new public entity", icon: Unlock, color: "#22c55e" },
];

const COMPARISON_ROWS = [
  {
    metric: "Price discovery",
    spac: "Negotiated (often at premium)",
    ipo: "Book-building via roadshow",
    winner: "ipo",
  },
  {
    metric: "Time to market",
    spac: "3–6 months post-SPAC IPO",
    ipo: "6–18 months",
    winner: "spac",
  },
  {
    metric: "Certainty of proceeds",
    spac: "High (PIPE + trust locked)",
    ipo: "Market-dependent",
    winner: "spac",
  },
  {
    metric: "Dilution",
    spac: "20% sponsor promote + warrants",
    ipo: "Standard underwriter discount ~7%",
    winner: "ipo",
  },
  {
    metric: "Regulatory burden",
    spac: "Lower at merger stage",
    ipo: "Full SEC S-1 review",
    winner: "spac",
  },
  {
    metric: "Forward projections",
    spac: "Allowed under safe harbor",
    ipo: "Heavily restricted",
    winner: "spac",
  },
  {
    metric: "Investor protection",
    spac: "NAV floor + redemption right",
    ipo: "Lock-up + market pricing",
    winner: "tie",
  },
];

const STRATEGY_ROWS = [
  {
    strategy: "Pre-Announcement Arb",
    mechanism: "Buy SPAC units near NAV, earn trust yield",
    return: "+1–4%",
    risk: "Low",
    horizon: "6–18 mo",
  },
  {
    strategy: "Redemption Play",
    mechanism: "Buy below NAV, redeem at $10 on vote",
    return: "+2–5%",
    risk: "Very Low",
    horizon: "Until vote",
  },
  {
    strategy: "Warrant Speculation",
    mechanism: "Buy warrants cheap pre-deal for leverage",
    return: "-80% to +500%",
    risk: "Very High",
    horizon: "0–24 mo",
  },
  {
    strategy: "PIPE Investment",
    mechanism: "Institutional co-investment at deal price",
    return: "+5–30%",
    risk: "Medium",
    horizon: "12–36 mo",
  },
  {
    strategy: "Short Post-Merger",
    mechanism: "Short once lock-up expires, price declines typical",
    return: "+20–60%",
    risk: "High",
    horizon: "3–12 mo",
  },
];

// ── Tab 1: SPAC Mechanics ─────────────────────────────────────────────────────

function MechanicsTab() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const sponsorPromoteInfo = {
    sponsorShares: "5,000,000",
    publicShares: "20,000,000",
    totalShares: "25,000,000",
    sponsorCost: "$25,000",
    promotePercent: "20%",
    dilutionToPublic: "25%",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">SPAC Mechanics</h2>
        <p className="text-sm text-muted-foreground">
          How Special Purpose Acquisition Companies work from IPO to merger completion.
        </p>
      </div>

      {/* Lifecycle SVG Timeline */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-5">SPAC Lifecycle</h3>
        <div className="overflow-x-auto">
          <svg width="720" height="180" viewBox="0 0 720 180" className="w-full">
            {/* Connector line */}
            <line x1="60" y1="80" x2="660" y2="80" stroke="#3f3f46" strokeWidth="2" />
            {LIFECYCLE_STEPS.map((step, i) => {
              const x = 60 + i * 120;
              const isActive = activeStep === i;
              return (
                <g key={i} onClick={() => setActiveStep(isActive ? null : i)} style={{ cursor: "pointer" }}>
                  {/* Connector segment highlight */}
                  {i < LIFECYCLE_STEPS.length - 1 && (
                    <line
                      x1={x}
                      y1={80}
                      x2={x + 120}
                      y2={80}
                      stroke={isActive ? step.color : "#3f3f46"}
                      strokeWidth="2"
                    />
                  )}
                  {/* Circle */}
                  <circle
                    cx={x}
                    cy={80}
                    r={isActive ? 22 : 18}
                    fill={isActive ? step.color : "#18181b"}
                    stroke={step.color}
                    strokeWidth="2"
                  />
                  {/* Step number */}
                  <text
                    x={x}
                    y={85}
                    textAnchor="middle"
                    fill={isActive ? "#fff" : step.color}
                    fontSize="13"
                    fontWeight="600"
                  >
                    {i + 1}
                  </text>
                  {/* Label */}
                  <text x={x} y={118} textAnchor="middle" fill="#e4e4e7" fontSize="9.5" fontWeight="500">
                    {step.label}
                  </text>
                  {/* Sub-text */}
                  {isActive && (
                    <foreignObject x={x - 80} y={128} width={160} height={50}>
                      <div
                        style={{
                          fontSize: "8px",
                          color: "#a1a1aa",
                          textAlign: "center",
                          lineHeight: "1.3",
                        }}
                      >
                        {step.sub}
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">Click a step to learn more</p>
      </div>

      {/* Key Structure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trust Account */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">Trust Account</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            100% of IPO proceeds are held in a segregated trust invested in U.S. T-Bills. The sponsor cannot touch this
            money unless a deal is approved.
          </p>
          <div className="space-y-1.5">
            {[
              { label: "NAV per share", value: "$10.00" },
              { label: "Typical trust yield", value: "~4–5% p.a." },
              { label: "Redemption right", value: "Full NAV + interest" },
              { label: "If no deal found", value: "Trust returned to shareholders" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-emerald-400 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsor Promote */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">Sponsor Promote (20%)</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Sponsors receive 20% of post-IPO shares for nominal consideration (~$25K). This &quot;promote&quot; is the
            primary incentive for sponsors.
          </p>
          <div className="space-y-1.5">
            {Object.entries(sponsorPromoteInfo).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{k.replace(/([A-Z])/g, " $1").trim()}</span>
                <span className="text-amber-400 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warrants */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white">Warrants</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Each SPAC unit includes fractional warrants — typically ½ or 1 warrant per unit — exercisable at $11.50 per
            share after deal close.
          </p>
          <div className="space-y-1.5">
            {[
              { label: "Exercise price", value: "$11.50" },
              { label: "Expiry", value: "5 years post-merger" },
              { label: "Cashless exercise", value: "Available" },
              { label: "Redemption trigger", value: "$18/share 20-day VWAP" },
              { label: "Black-Scholes value", value: "$1.50–$3.00" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-primary font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Redemption Rights Explainer */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-white">Redemption Rights — The NAV Floor</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          SPAC shareholders who vote against a deal (or choose not to vote) can redeem their shares at approximately
          $10.00 plus accrued trust interest. This creates an effective downside floor unique to SPACs.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Max downside (pre-deal)",
              value: "~0%",
              color: "text-emerald-400",
              desc: "Can always redeem at ~$10",
            },
            { label: "Upside participation", value: "Unlimited", color: "text-primary", desc: "Via warrants + shares" },
            { label: "Redemption window", value: "10 days before vote", color: "text-amber-400", desc: "Must elect by deadline" },
            { label: "Warrants after redemption", value: "Retained", color: "text-primary", desc: "Keep optionality" },
          ].map((item) => (
            <div key={item.label} className="bg-muted rounded-lg p-3">
              <div className={`text-base font-bold ${item.color}`}>{item.value}</div>
              <div className="text-xs font-medium text-muted-foreground mt-0.5">{item.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Deal Analysis ──────────────────────────────────────────────────────

function DealAnalysisTab() {
  const deals = useMemo(() => generateDeals(), []);
  const [selectedDeal, setSelectedDeal] = useState<SpacDeal | null>(null);

  function calcDilution(deal: SpacDeal) {
    const totalSharesMn = deal.raiseSizeMn / deal.trustPerShare;
    const sponsorSharesMn = totalSharesMn * 0.25;
    const pipSharesMn = deal.pipeAmountMn / deal.trustPerShare;
    const totalPostMergerMn = totalSharesMn + sponsorSharesMn + pipSharesMn;
    const dilutionPct = ((totalPostMergerMn - totalSharesMn) / totalPostMergerMn) * 100;
    return { totalSharesMn, sponsorSharesMn, pipSharesMn, totalPostMergerMn, dilutionPct };
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Deal Analysis</h2>
        <p className="text-sm text-muted-foreground">
          SPAC vs. traditional IPO mechanics, dilution calculations, and de-SPAC deal metrics.
        </p>
      </div>

      {/* SPAC vs IPO comparison table */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">SPAC vs. Traditional IPO</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground">Metric</th>
                <th className="text-left py-2 pr-4 text-xs font-medium text-primary">SPAC Route</th>
                <th className="text-left py-2 pr-4 text-xs font-medium text-emerald-400">Traditional IPO</th>
                <th className="text-left py-2 text-xs font-medium text-muted-foreground">Edge</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 pr-4 text-muted-foreground text-xs font-medium">{row.metric}</td>
                  <td className="py-2.5 pr-4 text-xs text-muted-foreground">{row.spac}</td>
                  <td className="py-2.5 pr-4 text-xs text-muted-foreground">{row.ipo}</td>
                  <td className="py-2.5 text-xs">
                    {row.winner === "spac" ? (
                      <span className="text-primary font-medium">SPAC</span>
                    ) : row.winner === "ipo" ? (
                      <span className="text-emerald-400 font-medium">IPO</span>
                    ) : (
                      <span className="text-muted-foreground">Tie</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deal list */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-muted-foreground">Active SPAC Deals — Click to Analyze</h3>
        </div>
        <div className="divide-y divide-border">
          {deals.map((deal) => {
            const disc = deal.currentPrice - deal.trustPerShare;
            const discPct = (disc / deal.trustPerShare) * 100;
            return (
              <div
                key={deal.ticker}
                onClick={() => setSelectedDeal(selectedDeal?.ticker === deal.ticker ? null : deal)}
                className={cn(
                  "px-5 py-3 cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedDeal?.ticker === deal.ticker && "bg-muted/70"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white font-mono">{deal.ticker}</span>
                    <span className="text-xs text-muted-foreground hidden sm:block">{deal.name}</span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        deal.status === "Completed"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : deal.status === "Announced"
                          ? "bg-amber-500/15 text-amber-400"
                          : deal.status === "Liquidated"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-primary/15 text-primary"
                      )}
                    >
                      {deal.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <div className="text-xs text-muted-foreground">Target</div>
                      <div className="text-xs text-muted-foreground">{deal.target}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Price</div>
                      <div className="text-xs text-white font-medium">${deal.currentPrice.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">vs NAV</div>
                      <div className={cn("text-xs font-medium", discPct >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {discPct >= 0 ? "+" : ""}
                        {discPct.toFixed(1)}%
                      </div>
                    </div>
                    {selectedDeal?.ticker === deal.ticker ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded dilution analysis */}
                <AnimatePresence>
                  {selectedDeal?.ticker === deal.ticker && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(() => {
                          const d = calcDilution(deal);
                          return [
                            { label: "Raise Size", value: `$${deal.raiseSizeMn}M`, color: "text-primary" },
                            { label: "PIPE Size", value: `$${deal.pipeAmountMn}M`, color: "text-amber-400" },
                            { label: "Sponsor Shares", value: `${d.sponsorSharesMn.toFixed(1)}M`, color: "text-orange-400" },
                            { label: "Total Dilution", value: `${d.dilutionPct.toFixed(1)}%`, color: "text-red-400" },
                          ].map((item) => (
                            <div key={item.label} className="bg-card border border-border rounded-lg p-3">
                              <div className="text-xs text-muted-foreground">{item.label}</div>
                              <div className={`text-sm font-bold mt-0.5 ${item.color}`}>{item.value}</div>
                            </div>
                          ));
                        })()}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>
                          {deal.daysToDeadline} days until deadline &bull; {deal.sector} sector &bull; Warrant strike $
                          {deal.warrantStrike}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Warrant Valuation ──────────────────────────────────────────────────

function WarrantValuationTab() {
  const [stockPrice, setStockPrice] = useState(12);
  const [vol, setVol] = useState(60);

  // Simplified Black-Scholes call for warrants
  function normalCDF(x: number) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d =
      0.3989423 *
      Math.exp(-0.5 * x * x) *
      t *
      (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
    return x >= 0 ? 1 - d : d;
  }

  function bsCall(S: number, K: number, T: number, r: number, sigma: number) {
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;
    return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  }

  const K = 11.5;
  const T = 5;
  const r = 0.05;
  const sigma = vol / 100;
  const warrantPrice = bsCall(stockPrice, K, T, r, sigma);
  const intrinsicValue = Math.max(0, stockPrice - K);
  const timeValue = warrantPrice - intrinsicValue;

  // Payoff diagram data
  const pricePoints = Array.from({ length: 31 }, (_, i) => 5 + i * 1);
  const payoffData = pricePoints.map((p) => ({
    price: p,
    warrant: bsCall(p, K, T, r, sigma),
    intrinsic: Math.max(0, p - K),
    commonPnL: p - 10,
  }));

  const svgW = 480;
  const svgH = 220;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const maxVal = 25;
  const minVal = -15;
  const range = maxVal - minVal;

  const toX = (price: number) => padL + ((price - 5) / 30) * chartW;
  const toY = (val: number) => padT + chartH - ((val - minVal) / range) * chartH;

  const warrantPath = payoffData.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.price)} ${toY(d.warrant)}`).join(" ");
  const intrinsicPath = payoffData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.price)} ${toY(d.intrinsic)}`)
    .join(" ");
  const commonPath = payoffData.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.price)} ${toY(d.commonPnL)}`).join(" ");

  const zeroY = toY(0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Warrant Valuation</h2>
        <p className="text-sm text-muted-foreground">
          SPAC warrants are embedded call options. Understand their pricing, behavior, and trading strategies.
        </p>
      </div>

      {/* Interactive Warrant Pricer */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-5">Black-Scholes Warrant Pricer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-5">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">
                Stock Price: <span className="text-white font-medium">${stockPrice.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={5}
                max={35}
                step={0.5}
                value={stockPrice}
                onChange={(e) => setStockPrice(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$5</span>
                <span>$35</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">
                Implied Volatility: <span className="text-white font-medium">{vol}%</span>
              </label>
              <input
                type="range"
                min={20}
                max={120}
                step={5}
                value={vol}
                onChange={(e) => setVol(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>20%</span>
                <span>120%</span>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              {[
                { label: "Warrant (BS) Value", value: `$${warrantPrice.toFixed(2)}`, color: "text-primary" },
                { label: "Intrinsic Value", value: `$${intrinsicValue.toFixed(2)}`, color: "text-emerald-400" },
                { label: "Time / Extrinsic Value", value: `$${timeValue.toFixed(2)}`, color: "text-amber-400" },
                { label: "Strike Price", value: `$${K}`, color: "text-muted-foreground" },
                { label: "Time to Expiry", value: `${T} years`, color: "text-muted-foreground" },
                {
                  label: "Moneyness",
                  value: stockPrice > K ? "ITM" : stockPrice < K ? "OTM" : "ATM",
                  color: stockPrice > K ? "text-emerald-400" : "text-red-400",
                },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-medium ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payoff Diagram */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">Payoff at Expiry (vs. Stock Price)</div>
            <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
              {/* Grid lines */}
              {[-10, -5, 0, 5, 10, 15, 20].map((val) => (
                <g key={val}>
                  <line
                    x1={padL}
                    y1={toY(val)}
                    x2={svgW - padR}
                    y2={toY(val)}
                    stroke={val === 0 ? "#52525b" : "#27272a"}
                    strokeWidth={val === 0 ? 1.5 : 1}
                    strokeDasharray={val === 0 ? "none" : "3,3"}
                  />
                  <text x={padL - 5} y={toY(val) + 4} textAnchor="end" fill="#52525b" fontSize="9">
                    {val > 0 ? `+${val}` : val}
                  </text>
                </g>
              ))}
              {/* X-axis labels */}
              {[5, 10, 15, 20, 25, 30, 35].map((p) => (
                <text key={p} x={toX(p)} y={svgH - 8} textAnchor="middle" fill="#52525b" fontSize="9">
                  ${p}
                </text>
              ))}
              {/* Zero line */}
              <line x1={padL} y1={zeroY} x2={svgW - padR} y2={zeroY} stroke="#3f3f46" strokeWidth="1" />
              {/* Strike line */}
              <line
                x1={toX(K)}
                y1={padT}
                x2={toX(K)}
                y2={svgH - padB}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text x={toX(K)} y={padT - 5} textAnchor="middle" fill="#f59e0b" fontSize="8">
                Strike $11.50
              </text>
              {/* Current price line */}
              <line
                x1={toX(stockPrice)}
                y1={padT}
                x2={toX(stockPrice)}
                y2={svgH - padB}
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
              {/* Paths */}
              <path d={commonPath} fill="none" stroke="#52525b" strokeWidth="1.5" />
              <path d={intrinsicPath} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />
              <path d={warrantPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
              {/* Legend */}
              <g>
                <line x1={padL} y1={svgH - 2} x2={padL + 20} y2={svgH - 2} stroke="#3b82f6" strokeWidth="2" />
                <text x={padL + 24} y={svgH - 0} fill="#a1a1aa" fontSize="8">
                  Warrant (BS)
                </text>
                <line x1={padL + 90} y1={svgH - 2} x2={padL + 110} y2={svgH - 2} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />
                <text x={padL + 114} y={svgH - 0} fill="#a1a1aa" fontSize="8">
                  Intrinsic
                </text>
                <line x1={padL + 170} y1={svgH - 2} x2={padL + 190} y2={svgH - 2} stroke="#52525b" strokeWidth="1.5" />
                <text x={padL + 194} y={svgH - 0} fill="#a1a1aa" fontSize="8">
                  Stock P&L
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Post-merger warrant behavior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">Warrant vs Common Trade</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Pre-announcement, warrants trade at implied volatility of the deal. Post-announcement, correlation to common
            stock increases dramatically.
          </p>
          <div className="space-y-2">
            {[
              { phase: "Pre-IPO (units)", warrantVal: "~$1.00", leverage: "N/A", risk: "Low" },
              { phase: "Pre-deal (warrants listed)", warrantVal: "$0.50–$2.00", leverage: "~5–8x", risk: "Medium" },
              { phase: "Deal announced", warrantVal: "$1.50–$4.00", leverage: "~3–5x", risk: "High" },
              { phase: "Post-merger", warrantVal: "Market price", leverage: "~2–4x", risk: "Very High" },
            ].map((row, i) => (
              <div key={i} className="bg-muted rounded p-2.5 text-xs">
                <div className="text-muted-foreground font-medium mb-1">{row.phase}</div>
                <div className="flex gap-4 text-muted-foreground">
                  <span>
                    Value: <span className="text-primary">{row.warrantVal}</span>
                  </span>
                  <span>
                    Leverage: <span className="text-amber-400">{row.leverage}</span>
                  </span>
                  <span>
                    Risk: <span className="text-red-400">{row.risk}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">Key Warrant Risks</span>
          </div>
          <div className="space-y-2.5">
            {[
              {
                risk: "Cashless Exercise Dilution",
                desc: "If redeemed cashlessly, warrants convert at below-market ratios, hurting holders.",
              },
              {
                risk: "Company Redemption at $0.01",
                desc: "Once VWAP ≥ $18 for 20 days, company can force exercise or call warrants at $0.01.",
              },
              {
                risk: "Deal Failure = Near Zero",
                desc: "If SPAC liquidates without a deal, warrants expire worthless.",
              },
              {
                risk: "Illiquidity",
                desc: "SPAC warrants often trade with wide bid-ask spreads and low volume.",
              },
              {
                risk: "Post-Merger Decay",
                desc: "High implied vol at deal close often collapses post-merger, crushing warrant prices even if stock holds.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-muted-foreground">{item.risk}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Historical Performance ─────────────────────────────────────────────

function HistoricalPerformanceTab() {
  const historicalData = useMemo(() => generateHistoricalData(), []);
  const sectorData = useMemo(() => generateSectorBreakdown(), []);

  const svgW = 560;
  const svgH = 240;
  const padL = 55;
  const padR = 20;
  const padT = 20;
  const padB = 35;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;
  const n = historicalData.length;

  const minPost = Math.min(...historicalData.flatMap((d) => [d.postMerger6m, d.postMerger12m]));
  const maxPost = Math.max(...historicalData.map((d) => d.preMerger * 10));
  const yMin = -70;
  const yMax = 80;

  const toX = (i: number) => padL + (i / (n - 1)) * chartW;
  const toY = (val: number) => padT + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

  const barW = chartW / n - 8;

  const path6m = historicalData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.postMerger6m)}`)
    .join(" ");
  const path12m = historicalData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.postMerger12m)}`)
    .join(" ");

  const zeroY = toY(0);

  // Pie chart for sector breakdown
  const pieData = sectorData;
  const total = pieData.reduce((s2, d) => s2 + d.count, 0);
  let cumAngle = -Math.PI / 2;
  const pieRadius = 70;
  const pieCx = 90;
  const pieCy = 90;

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  const slices = pieData.map((d) => {
    const angle = (d.count / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;
    return { ...d, startAngle, endAngle, midAngle: (startAngle + endAngle) / 2 };
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Historical Performance</h2>
        <p className="text-sm text-muted-foreground">
          Pre-merger vs. post-merger returns, the SPAC bubble cycle, and sector analysis.
        </p>
      </div>

      {/* Performance Chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">SPAC Returns by Year — Pre-Merger vs. Post-Merger</h3>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 inline-block bg-primary/60 rounded-sm" />
              Pre-Merger
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 inline-block bg-amber-400" />
              Post 6M
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 inline-block bg-red-400" />
              Post 12M
            </span>
          </div>
        </div>
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
          {/* Y gridlines */}
          {[-60, -40, -20, 0, 20, 40, 60].map((val) => (
            <g key={val}>
              <line
                x1={padL}
                y1={toY(val)}
                x2={svgW - padR}
                y2={toY(val)}
                stroke={val === 0 ? "#52525b" : "#1f1f1f"}
                strokeWidth={val === 0 ? 1.5 : 1}
              />
              <text x={padL - 5} y={toY(val) + 4} textAnchor="end" fill="#52525b" fontSize="9">
                {val > 0 ? `+${val}%` : `${val}%`}
              </text>
            </g>
          ))}
          {/* Bars for pre-merger return (scaled x10 to show on same axis) */}
          {historicalData.map((d, i) => {
            const x = toX(i) - barW / 2;
            const barVal = d.preMerger;
            const barH = (barVal / (yMax - yMin)) * chartH;
            const barY = zeroY - barH;
            return (
              <rect
                key={i}
                x={x}
                y={barY}
                width={barW}
                height={barH}
                fill="#3b82f6"
                opacity={0.5}
                rx={2}
              />
            );
          })}
          {/* Lines for post-merger */}
          <path d={path6m} fill="none" stroke="#f59e0b" strokeWidth="2" />
          <path d={path12m} fill="none" stroke="#ef4444" strokeWidth="2" />
          {/* X labels */}
          {historicalData.map((d, i) => (
            <text key={i} x={toX(i)} y={svgH - 8} textAnchor="middle" fill="#52525b" fontSize="9">
              {d.label}
            </text>
          ))}
          {/* Annotation: SPAC Bubble */}
          <rect x={toX(1) - 10} y={padT} width={toX(2) - toX(1) + 20} height={chartH} fill="#f59e0b" opacity={0.04} />
          <text x={(toX(1) + toX(2)) / 2} y={padT + 12} textAnchor="middle" fill="#f59e0b" fontSize="8" opacity={0.7}>
            SPAC Bubble
          </text>
        </svg>
        <p className="text-xs text-muted-foreground mt-2">
          * Pre-merger returns shown as bars (annualized). Post-merger returns are median de-SPAC performance.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Pre-Merger Return", value: "+2.8%", sub: "Annualized, 2019–2025", color: "text-primary" },
          { label: "Avg Post-Merger (12M)", value: "-34%", sub: "Median de-SPAC performance", color: "text-red-400" },
          { label: "SPAC Peak Year", value: "2021", sub: "$162B raised in SPACs", color: "text-amber-400" },
          { label: "Beat Traditional IPO", value: "22%", sub: "% of de-SPACs that outperformed", color: "text-emerald-400" },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-xs font-medium text-muted-foreground mt-0.5">{item.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Sector Breakdown */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">SPAC Volume by Sector (2019–2025)</h3>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Pie Chart */}
          <svg width={200} height={190} viewBox="0 0 200 190" className="shrink-0">
            {slices.map((slice, i) => (
              <path
                key={i}
                d={describeArc(pieCx, pieCy, pieRadius, slice.startAngle, slice.endAngle)}
                fill={slice.color}
                stroke="#18181b"
                strokeWidth="2"
              />
            ))}
            <circle cx={pieCx} cy={pieCy} r={28} fill="#18181b" />
            <text x={pieCx} y={pieCy + 4} textAnchor="middle" fill="#e4e4e7" fontSize="10" fontWeight="600">
              {total}
            </text>
            <text x={pieCx} y={pieCy + 14} textAnchor="middle" fill="#71717a" fontSize="7">
              total
            </text>
          </svg>

          {/* Legend + Bar chart */}
          <div className="flex-1 space-y-2 w-full">
            {sectorData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-muted-foreground w-24 shrink-0">{d.sector}</span>
                <div className="flex-1 bg-muted rounded-full h-1.5 relative">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(d.count / total) * 100}%`, backgroundColor: d.color }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">{d.count} deals</span>
                <span
                  className={cn(
                    "text-xs font-medium w-16 text-right",
                    d.avgPostReturn >= 0 ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {d.avgPostReturn >= 0 ? "+" : ""}
                  {d.avgPostReturn.toFixed(1)}%
                </span>
              </div>
            ))}
            <div className="text-xs text-muted-foreground pt-1">Last column: avg 12-month post-merger return by sector</div>
          </div>
        </div>
      </div>

      {/* Bubble / Bust narrative */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-white">The SPAC Bubble & Bust Cycle (2020–2022)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {[
            {
              phase: "Bubble (2020–2021)",
              color: "border-amber-500/40",
              desc: "Zero-rate environment + retail FOMO drove SPAC issuance to record highs. 613 SPACs raised $162B in 2021 alone. Warrants traded at extreme premiums.",
              metrics: ["$162B raised (2021)", "613 SPACs", "Avg premium to NAV: +15%"],
            },
            {
              phase: "Correction (2022)",
              color: "border-red-500/40",
              desc: "Rising rates made T-bill trust yield less attractive vs risk. SEC increased scrutiny. PIPE investors withdrew. Redemption rates surged to 90%+.",
              metrics: ["Redemptions: 90%+", "SPAC failures: 200+", "Warrant avg: -75%"],
            },
            {
              phase: "Normalization (2023–2025)",
              color: "border-emerald-500/40",
              desc: "Market recalibrated with stronger sponsor quality requirements, smaller deal sizes, and higher NAV trust interest providing a more attractive floor.",
              metrics: ["Smaller SPACs ($200–400M)", "Higher trust yield (4–5%)", "Fewer but higher quality deals"],
            },
          ].map((phase, i) => (
            <div key={i} className={`bg-muted border ${phase.color} rounded-lg p-3`}>
              <div className="font-medium text-foreground mb-1.5">{phase.phase}</div>
              <p className="text-muted-foreground mb-2 leading-relaxed">{phase.desc}</p>
              <ul className="space-y-0.5">
                {phase.metrics.map((m, j) => (
                  <li key={j} className="flex items-center gap-1.5 text-muted-foreground">
                    <ArrowRight className="w-3 h-3" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: Investor Strategy ──────────────────────────────────────────────────

function InvestorStrategyTab() {
  const [activeStrategy, setActiveStrategy] = useState<number | null>(null);

  const strategyDetails = [
    {
      title: "Pre-Announcement Arbitrage",
      icon: Lock,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      risk: "Low",
      return: "+1–4% annualized",
      horizon: "6–18 months",
      how: "Buy SPAC units at or slightly below $10 NAV. Collect trust account interest (~4–5% p.a. in current rate environment). Redeem if deal is unfavorable.",
      pros: ["Capital preservation via NAV floor", "T-bill yield during waiting period", "Warrant optionality retained if units purchased"],
      cons: ["Opportunity cost vs other investments", "Small chance SPAC extends (extra uncertainty)", "Warrants may decay if no deal enthusiasm"],
      keyMetrics: ["Trust NAV per share", "Days to deadline", "Trust yield rate"],
    },
    {
      title: "Redemption Strategy",
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-border",
      risk: "Very Low",
      return: "+2–5% per redemption cycle",
      horizon: "Until shareholder vote",
      how: "Purchase SPAC shares below NAV in the open market. Vote against (or abstain) the deal. Redeem shares at trust value plus accrued interest.",
      pros: ["Near risk-free return if bought below NAV", "No exposure to deal quality", "Can hold warrants post-redemption"],
      cons: ["Warrants separate from common after unit splits", "Requires active monitoring of vote dates", "May miss upside if deal is exceptional"],
      keyMetrics: ["Current price vs NAV", "Vote date", "Redemption deadline"],
    },
    {
      title: "Warrant Speculation",
      icon: Zap,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      risk: "Very High",
      return: "-80% to +500%",
      horizon: "0–24 months",
      how: "Buy warrants pre-announcement at $0.50–$2.00. If a high-quality deal is announced, warrants often surge 3–10x as the implied call option value explodes.",
      pros: ["Asymmetric upside (low cost, high leverage)", "Can size small for high R:R exposure", "Retained after redeeming common"],
      cons: ["Zero if SPAC liquidates or deal fails", "Illiquid with wide spreads", "Post-merger IV crush destroys value"],
      keyMetrics: ["Warrant price", "Strike ($11.50)", "Deal announcement probability"],
    },
    {
      title: "PIPE Co-Investment",
      icon: Layers,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-border",
      risk: "Medium",
      return: "+5–30% over 1–3 years",
      horizon: "12–36 months",
      how: "Institutional investors commit capital at deal price (typically $10/share) with lock-up periods. Provides deal certainty but requires accredited investor status.",
      pros: ["Price certainty at negotiated value", "Usually includes registration rights", "Signals institutional confidence"],
      cons: ["6–12 month lock-up", "Accredited investors only (typically)", "PIPE discount often materializes post-lock-up"],
      keyMetrics: ["PIPE discount to market", "Lock-up expiry", "Company quality"],
    },
    {
      title: "Post-Merger Short",
      icon: TrendingDown,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      risk: "High",
      return: "+20–60% over 3–12 months",
      horizon: "3–12 months",
      how: "Short the de-SPAC'd company after merger close. High redemption rates + sponsor/PIPE lock-up expiries create persistent selling pressure, averaging -34% in year 1.",
      pros: ["Strong historical statistical edge", "Shorting overvalued promoted targets", "Lock-up expirations create predictable supply"],
      cons: ["Borrow costs can be high", "Short squeeze risk on thin floats", "Requires margin account"],
      keyMetrics: ["Days until lock-up expiry", "Short interest ratio", "Borrow cost"],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Investor Strategy</h2>
        <p className="text-sm text-muted-foreground">
          Five proven SPAC investment approaches — from conservative arbitrage to aggressive warrant speculation.
        </p>
      </div>

      {/* Quick Strategy Comparison Table */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Strategy Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Strategy</th>
                <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Mechanism</th>
                <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Return Range</th>
                <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Risk</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Horizon</th>
              </tr>
            </thead>
            <tbody>
              {STRATEGY_ROWS.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => setActiveStrategy(activeStrategy === i ? null : i)}
                >
                  <td className="py-2.5 pr-3 text-white font-medium">{row.strategy}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{row.mechanism}</td>
                  <td
                    className={cn(
                      "py-2.5 pr-3 font-medium",
                      row.return.startsWith("+") ? "text-emerald-400" : "text-amber-400"
                    )}
                  >
                    {row.return}
                  </td>
                  <td
                    className={cn(
                      "py-2.5 pr-3",
                      row.risk === "Very Low" || row.risk === "Low"
                        ? "text-emerald-400"
                        : row.risk === "Medium"
                        ? "text-amber-400"
                        : "text-red-400"
                    )}
                  >
                    {row.risk}
                  </td>
                  <td className="py-2.5 text-muted-foreground">{row.horizon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategy Deep Dives */}
      <div className="space-y-3">
        {strategyDetails.map((strat, i) => {
          const Icon = strat.icon;
          const isOpen = activeStrategy === i;
          return (
            <div
              key={i}
              className={cn("bg-card border rounded-xl overflow-hidden", isOpen ? strat.borderColor : "border-border")}
            >
              <button
                onClick={() => setActiveStrategy(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", strat.bgColor)}>
                    <Icon className={cn("w-4 h-4", strat.color)} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{strat.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Risk: <span className={strat.color}>{strat.risk}</span> &bull; Return: {strat.return}
                    </div>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-border">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                        {/* How it works */}
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Info className="w-3 h-3" /> How it works
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{strat.how}</p>
                          <div className="mt-3">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Key metrics to track:</div>
                            <ul className="space-y-0.5">
                              {strat.keyMetrics.map((m, j) => (
                                <li key={j} className="text-xs text-muted-foreground flex items-center gap-1">
                                  <ArrowRight className="w-3 h-3 shrink-0" />
                                  {m}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {/* Pros */}
                        <div>
                          <div className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" /> Advantages
                          </div>
                          <ul className="space-y-1.5">
                            {strat.pros.map((pro, j) => (
                              <li key={j} className="flex gap-2 text-xs text-muted-foreground">
                                <span className="text-emerald-400 mt-0.5 shrink-0">+</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* Cons */}
                        <div>
                          <div className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" /> Risks
                          </div>
                          <ul className="space-y-1.5">
                            {strat.cons.map((con, j) => (
                              <li key={j} className="flex gap-2 text-xs text-muted-foreground">
                                <span className="text-red-400 mt-0.5 shrink-0">−</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom disclaimer */}
      <div className="flex items-start gap-2.5 bg-card border border-border rounded-xl p-4 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <span>
          All strategies carry risk. SPAC investing requires careful due diligence. Historical SPAC returns have been
          negative for most post-merger investors. Pre-merger arbitrage strategies depend on trust account integrity and
          redemption rights. Warrant speculation can result in total loss.
        </span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SpacInvestingPage() {
  const tabs = [
    { id: "mechanics", label: "SPAC Mechanics", icon: Building2 },
    { id: "deals", label: "Deal Analysis", icon: BarChart2 },
    { id: "warrants", label: "Warrant Valuation", icon: Zap },
    { id: "history", label: "Historical Performance", icon: TrendingUp },
    { id: "strategy", label: "Investor Strategy", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SPAC Investing</h1>
              <p className="text-sm text-muted-foreground">Special Purpose Acquisition Companies — mechanics, analysis & strategy</p>
            </div>
          </div>
          {/* Quick stats bar */}
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { label: "2025 SPAC IPOs", value: "87", color: "text-primary" },
              { label: "Avg Trust NAV", value: "$10.22", color: "text-emerald-400" },
              { label: "Median Post-Merger Return", value: "-34%", color: "text-red-400" },
              { label: "Avg Deal Size", value: "$312M", color: "text-amber-400" },
              { label: "Typical Warrant Strike", value: "$11.50", color: "text-primary" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-lg px-3 py-1.5">
                <span className="text-xs text-muted-foreground">{stat.label}: </span>
                <span className={cn("text-xs font-semibold", stat.color)}>{stat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="mechanics">
          <TabsList className="bg-card border border-border p-1 mb-6 flex flex-wrap gap-1 h-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-white text-muted-foreground"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="mechanics" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <MechanicsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="deals" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <DealAnalysisTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="warrants" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <WarrantValuationTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="history" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <HistoricalPerformanceTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="strategy" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <InvestorStrategyTab />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
