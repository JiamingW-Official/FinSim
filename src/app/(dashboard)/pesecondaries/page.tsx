"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Repeat,
  ShieldCheck,
  ArrowRight,
  Info,
  Users,
  Layers,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 960;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const RAND_POOL: number[] = [];
for (let i = 0; i < 400; i++) RAND_POOL.push(rand());
let randIdx = 0;
const _r = () => RAND_POOL[randIdx++ % RAND_POOL.length];
void _r;

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtB(n: number): string {
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}T`;
  if (Math.abs(n) >= 1) return `$${n.toFixed(0)}B`;
  return `$${(n * 1_000).toFixed(0)}M`;
}

// ── StatCard ──────────────────────────────────────────────────────────────────
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
    <div className="rounded-xl border border-border bg-foreground/5 p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-xl font-bold", valClass)}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ── SectionHeading ────────────────────────────────────────────────────────────
function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ── InfoPill ──────────────────────────────────────────────────────────────────
function InfoPill({ text, color = "zinc" }: { text: string; color?: string }) {
  const cls: Record<string, string> = {
    zinc: "bg-muted text-muted-foreground",
    emerald: "bg-emerald-900/50 text-emerald-300",
    amber: "bg-amber-900/50 text-amber-300",
    rose: "bg-rose-900/50 text-rose-300",
    blue: "bg-muted/70 text-primary",
    violet: "bg-muted/70 text-primary",
    orange: "bg-orange-900/50 text-orange-300",
    sky: "bg-sky-900/50 text-sky-300",
  };
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
        cls[color] ?? cls.zinc
      )}
    >
      {text}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — LP-LED SECONDARIES
// ═══════════════════════════════════════════════════════════════════════════════

function LPLedTab() {
  const [expandedSeller, setExpandedSeller] = useState<number | null>(null);

  // Discount/premium data 2018-2024
  const discountData = [
    { year: 2018, discount: -12 },
    { year: 2019, discount: -8 },
    { year: 2020, discount: -22 }, // COVID crisis
    { year: 2021, discount: -4 },
    { year: 2022, discount: -18 }, // rate shock
    { year: 2023, discount: -14 },
    { year: 2024, discount: -6 },
  ];

  // Bid-ask spread by vintage
  const vintageSpread = [
    { vintage: "2014", bid: 78, ask: 82 },
    { vintage: "2016", bid: 83, ask: 87 },
    { vintage: "2018", bid: 86, ask: 90 },
    { vintage: "2020", bid: 80, ask: 85 },
    { vintage: "2022", bid: 88, ask: 92 },
  ];

  const sellerReasons = [
    {
      icon: <TrendingDown className="w-4 h-4" />,
      title: "Denominator Effect",
      color: "rose",
      desc: "Public equity falls causing PE share of portfolio to exceed target allocation. LPs sell PE stakes to rebalance, often at discounts.",
      example: "2022: S&P fell 19%, causing PE overweight for many pensions.",
    },
    {
      icon: <Layers className="w-4 h-4" />,
      title: "Liquidity Needs",
      color: "amber",
      desc: "Endowments, family offices, or pension funds need cash for operations, beneficiary payments, or new commitments.",
      example: "University endowments sold $8B+ in 2020 for COVID relief budgets.",
    },
    {
      icon: <BarChart3 className="w-4 h-4" />,
      title: "Manager Concentration",
      color: "blue",
      desc: "LP has too many GP relationships; secondary sale trims tail managers without waiting for fund wind-down.",
      example: "Typical LP with 80+ GP relationships seeks to reduce to 40.",
    },
    {
      icon: <Repeat className="w-4 h-4" />,
      title: "Strategic Rebalancing",
      color: "violet",
      desc: "LP shifts from PE to infrastructure or private credit; sells mature PE stakes to redeploy capital.",
      example: "CalPERS sold $6.5B portfolio in 2021 to fund infrastructure allocation.",
    },
  ];

  const buyers = [
    { name: "Lexington Partners", type: "Pure-play secondary", aum: "~$75B" },
    { name: "Ardian", type: "European leader", aum: "~$170B" },
    { name: "HarbourVest Partners", type: "Global platform", aum: "~$115B" },
    { name: "Blackstone Strategic Partners", type: "Mega-fund secondary", aum: "~$50B" },
    { name: "Partners Group", type: "Swiss multi-asset", aum: "~$135B" },
    { name: "Goldman Sachs Alternatives", type: "Bank platform", aum: "~$50B" },
    { name: "Coller Capital", type: "Pure-play secondary", aum: "~$30B" },
    { name: "Pantheon", type: "Global secondary", aum: "~$65B" },
  ];

  // SVG: Discount bar chart
  const W = 480;
  const H = 160;
  const pL = 40;
  const pR = 12;
  const pT = 14;
  const pB = 28;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const barW = (cW / discountData.length) * 0.6;
  const minDisc = -25;
  const maxDisc = 5;
  const discRange = maxDisc - minDisc;
  const zeroY = pT + cH * (maxDisc / discRange);
  const xD = (i: number) =>
    pL + ((i + 0.5) / discountData.length) * cW - barW / 2;
  const barH = (d: number) => (Math.abs(d) / discRange) * cH;
  const barY = (d: number) => (d >= 0 ? zeroY - barH(d) : zeroY);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="2024 Volume" value="$130B+" sub="Annual secondary transactions" highlight="pos" />
        <StatCard label="Avg Discount" value="6–12%" sub="To NAV in 2024" />
        <StatCard label="Market CAGR" value="~18%" sub="2015–2024 growth" highlight="pos" />
        <StatCard label="Typical Hold" value="3–5 years" sub="Residual life at purchase" />
      </div>

      {/* Discount Chart */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading
          title="Secondary Market Discount to NAV (2018–2024)"
          sub="Discount (%) to reported NAV — crisis years see deeper discounts"
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
          {/* Zero line */}
          <line x1={pL} x2={W - pR} y1={zeroY} y2={zeroY} stroke="#ffffff40" strokeWidth={1} />
          {/* Grid lines */}
          {[-5, -10, -15, -20].map((d) => {
            const y = pT + cH * ((maxDisc - d) / discRange);
            return (
              <g key={d}>
                <line x1={pL} x2={W - pR} y1={y} y2={y} stroke="#ffffff12" strokeWidth={1} />
                <text x={pL - 4} y={y + 4} fontSize={8} fill="#71717a" textAnchor="end">
                  {d}%
                </text>
              </g>
            );
          })}
          {/* Bars */}
          {discountData.map((d, i) => {
            const crisis = d.discount <= -15;
            return (
              <g key={d.year}>
                <rect
                  x={xD(i)}
                  y={barY(d.discount)}
                  width={barW}
                  height={barH(d.discount)}
                  fill={crisis ? "#f43f5e" : d.discount <= -8 ? "#f59e0b" : "#10b981"}
                  opacity={0.8}
                  rx={2}
                />
                <text
                  x={xD(i) + barW / 2}
                  y={barY(d.discount) - 3}
                  fontSize={8}
                  fill={crisis ? "#f43f5e" : d.discount <= -8 ? "#f59e0b" : "#10b981"}
                  textAnchor="middle"
                >
                  {d.discount}%
                </text>
                <text x={xD(i) + barW / 2} y={H - 6} fontSize={8} fill="#71717a" textAnchor="middle">
                  {d.year}
                </text>
              </g>
            );
          })}
          {/* Label */}
          <text x={pL + cW / 2} y={12} fontSize={9} fill="#71717a" textAnchor="middle">
            COVID (2020) and Rate Shock (2022) drove deepest discounts
          </text>
        </svg>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" /> Crisis (&lt;-15%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Elevated (-8 to -15%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Moderate (&lt;-8%)
          </span>
        </div>
      </div>

      {/* Seller motivations */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading title="Why LPs Sell" sub="Click to expand each motivation" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sellerReasons.map((r, i) => (
            <button
              key={i}
              className="text-left rounded-lg border border-border bg-black/20 p-3 hover:border-border transition-all"
              onClick={() => setExpandedSeller(expandedSeller === i ? null : i)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-muted-foreground">{r.icon}</span>
                <span className="text-sm font-semibold text-white">{r.title}</span>
                <InfoPill
                  text={
                    r.color === "rose"
                      ? "Common"
                      : r.color === "amber"
                      ? "Frequent"
                      : "Strategic"
                  }
                  color={r.color}
                />
              </div>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
              <AnimatePresence>
                {expandedSeller === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-xs text-emerald-300 border-t border-border pt-2">
                      Example: {r.example}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing methodology */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading title="Secondary Pricing Methodology" sub="How buyers value LP interests" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              title: "NAV Baseline",
              desc: "Start with GP's most recent quarterly NAV report. Apply haircut for potential overstatement (0–10%).",
              color: "blue",
            },
            {
              step: "2",
              title: "DCF of Residual Value",
              desc: "Model remaining portfolio cash flows: projected exits, distributions, unrealized writedowns. Discount at 15–20% IRR target.",
              color: "violet",
            },
            {
              step: "3",
              title: "Discount / Premium",
              desc: "Apply market discount for fund vintage, quality, remaining life. Trophy assets may trade at NAV or slight premium.",
              color: "emerald",
            },
          ].map((step) => (
            <div key={step.step} className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center",
                    step.color === "blue"
                      ? "bg-primary text-white"
                      : step.color === "violet"
                      ? "bg-primary text-white"
                      : "bg-emerald-600 text-white"
                  )}
                >
                  {step.step}
                </span>
                <span className="text-sm font-semibold text-white">{step.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bid-Ask by Vintage */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading
          title="Bid-Ask Spread by Vintage Year"
          sub="% of NAV — wider spreads for older/uncertain vintages"
        />
        <div className="space-y-2">
          {vintageSpread.map((v) => (
            <div key={v.vintage} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12">{v.vintage}</span>
              <div className="flex-1 h-5 bg-muted rounded relative">
                <div
                  className="absolute h-5 bg-primary/40 rounded"
                  style={{
                    left: `${(v.bid - 70) * 10}%`,
                    width: `${(v.ask - v.bid) * 10}%`,
                  }}
                />
                <div
                  className="absolute h-5 bg-primary rounded-l"
                  style={{ left: `${(v.bid - 70) * 10}%`, width: "2px" }}
                />
                <div
                  className="absolute h-5 bg-primary rounded-r"
                  style={{ left: `${(v.ask - 70) * 10}%`, width: "2px" }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-20">
                {v.bid}–{v.ask}% NAV
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Newer vintages with more unrealized value command tighter spreads; 2016 range represents typical mid-life secondary trade.
        </p>
      </div>

      {/* Trade Types */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading title="Portfolio vs Single Fund vs Stapled" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Single Fund",
              pill: "Common",
              pillColor: "blue",
              desc: "LP sells interest in one fund. Simplest execution but buyer concentration risk. Suitable for trophy manager stakes.",
              pros: ["Simple DD", "Clean pricing", "Known manager"],
              cons: ["Concentration", "Less price certainty"],
            },
            {
              title: "Portfolio Trade",
              pill: "Large Volume",
              pillColor: "violet",
              desc: "LP sells basket of fund interests across multiple GPs. Lower per-unit pricing but diversified; buyers compete on blended discount.",
              pros: ["Diversification", "Larger deal size", "LP simplicity"],
              cons: ["Complex valuation", "Longer process"],
            },
            {
              title: "Stapled Secondary",
              pill: "LP Incentive",
              pillColor: "emerald",
              desc: "Secondary purchase linked to primary commitment in GP's new fund. Buyer gets secondary assets at discount plus allocation to new fund.",
              pros: ["Primary access", "Better pricing", "GP alignment"],
              cons: ["New capital required", "Longer lock-up"],
            },
          ].map((t) => (
            <div key={t.title} className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-white">{t.title}</span>
                <InfoPill text={t.pill} color={t.pillColor} />
              </div>
              <p className="text-xs text-muted-foreground mb-3">{t.desc}</p>
              <div className="space-y-1">
                {t.pros.map((p) => (
                  <div key={p} className="flex items-center gap-1 text-xs text-emerald-400">
                    <span>+</span>
                    <span>{p}</span>
                  </div>
                ))}
                {t.cons.map((c) => (
                  <div key={c} className="flex items-center gap-1 text-xs text-rose-400">
                    <span>-</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Buyers */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading title="Top Secondary Buyers" sub="Leading institutional secondary market participants" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {buyers.map((b) => (
            <div
              key={b.name}
              className="flex items-center justify-between rounded-lg bg-black/20 border border-border/50 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-white">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.type}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400">{b.aum} AUM</span>
            </div>
          ))}
        </div>
      </div>

      {/* Due Diligence */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading title="Secondary Buyer Due Diligence Process" />
        <div className="space-y-3">
          {[
            {
              phase: "Phase 1",
              title: "NDA + Data Room",
              detail:
                "Sign NDA; receive fund financial statements, capital account statements, LP agreements, GP reports, portfolio company list.",
              duration: "Days 1–5",
            },
            {
              phase: "Phase 2",
              title: "NAV Analysis",
              detail:
                "Reconstruct portfolio valuation from GP marks; apply haircuts by company/industry; model remaining distribution waterfall.",
              duration: "Days 5–15",
            },
            {
              phase: "Phase 3",
              title: "Legal Review",
              detail:
                "Review LP agreement transfer restrictions, ROFR provisions, consent requirements, management fee offsets, carry terms.",
              duration: "Days 10–20",
            },
            {
              phase: "Phase 4",
              title: "Bid Submission",
              detail:
                "Submit indicative bid as % of NAV; negotiate exclusivity; finalize LOI with price, reps and warranties, closing conditions.",
              duration: "Days 15–25",
            },
            {
              phase: "Phase 5",
              title: "GP Consent & Closing",
              detail:
                "Obtain GP consent (typically required per LP agreement); complete transfer documentation; fund updated cap table.",
              duration: "Days 25–45",
            },
          ].map((p) => (
            <div
              key={p.phase}
              className="flex gap-4 rounded-lg border border-border/50 bg-black/20 p-3"
            >
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-primary">{p.phase}</span>
                <div className="flex-1 w-0.5 bg-foreground/10 mt-1" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{p.title}</span>
                  <span className="text-xs text-muted-foreground">{p.duration}</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — GP-LED SECONDARIES
// ═══════════════════════════════════════════════════════════════════════════════

function GPLedTab() {
  const [selectedCV, setSelectedCV] = useState<"single" | "multi">("single");

  // GP-led market share data 2015–2023
  const gpLedShare = [
    { year: "2015", pct: 12 },
    { year: "2016", pct: 16 },
    { year: "2017", pct: 22 },
    { year: "2018", pct: 28 },
    { year: "2019", pct: 35 },
    { year: "2020", pct: 42 },
    { year: "2021", pct: 50 },
    { year: "2022", pct: 46 },
    { year: "2023", pct: 48 },
  ];

  const W2 = 480;
  const H2 = 200;
  const pL2 = 40;
  const pR2 = 12;
  const pT2 = 20;
  const pB2 = 30;
  const cW2 = W2 - pL2 - pR2;
  const cH2 = H2 - pT2 - pB2;
  const barW2 = (cW2 / gpLedShare.length) * 0.65;
  const xG = (i: number) =>
    pL2 + ((i + 0.5) / gpLedShare.length) * cW2 - barW2 / 2;
  const yG = (pct: number) => pT2 + cH2 - (pct / 60) * cH2;

  const advisors = [
    { name: "Evercore", role: "GP-led advisory leader" },
    { name: "Lazard", role: "Global restructuring & secondaries" },
    { name: "Campbell Lutyens", role: "Dedicated secondary advisory" },
    { name: "Jefferies", role: "Mid-market GP solutions" },
    { name: "PJT Partners", role: "Park Hill secondary advisory" },
    { name: "Greenhill", role: "Independent GP advisory" },
  ];

  // suppress unused var lint
  void pB2;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="GP-Led Volume (2023)" value="$50–60B" sub="~48% of secondary market" highlight="pos" />
        <StatCard label="CV Pricing" value="~NAV" sub="vs. LP secondary discounts" highlight="pos" />
        <StatCard label="Tender Offer" value="Cash or Roll" sub="LP choice in GP-led process" />
        <StatCard label="ILPA Requirement" value="Fairness Opinion" sub="For GP-led transactions" />
      </div>

      {/* CV Mechanics SVG Diagram */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading
          title="Continuation Vehicle (CV) Mechanics"
          sub="How GP transfers best assets from maturing fund to new vehicle"
        />
        <svg viewBox="0 0 500 220" className="w-full" style={{ maxHeight: 220 }}>
          <defs>
            <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#10b981" />
            </marker>
            <marker id="arrowGray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#6b7280" />
            </marker>
            <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
            </marker>
          </defs>
          {/* Old Fund Box */}
          <rect x={10} y={50} width={120} height={130} rx={8} fill="#27272a" stroke="#3f3f46" strokeWidth={1.5} />
          <text x={70} y={70} fontSize={10} fill="#a1a1aa" textAnchor="middle">Old Fund</text>
          <text x={70} y={86} fontSize={8} fill="#71717a" textAnchor="middle">(Year 8–12)</text>
          {/* Assets in old fund */}
          <rect x={20} y={95} width={100} height={22} rx={4} fill="#064e3b" stroke="#059669" strokeWidth={1} />
          <text x={70} y={110} fontSize={9} fill="#34d399" textAnchor="middle">Asset A (Trophy)</text>
          <rect x={20} y={122} width={100} height={22} rx={4} fill="#1e1b4b" stroke="#6d28d9" strokeWidth={1} />
          <text x={70} y={137} fontSize={9} fill="#a78bfa" textAnchor="middle">Asset B (Growth)</text>
          <rect x={20} y={149} width={100} height={22} rx={4} fill="#451a03" stroke="#d97706" strokeWidth={1} />
          <text x={70} y={164} fontSize={9} fill="#fcd34d" textAnchor="middle">Asset C (Other)</text>
          {/* Arrow from old fund to CV */}
          <path d="M 130 115 L 200 115" stroke="#10b981" strokeWidth={2} markerEnd="url(#arrowGreen)" />
          <text x={165} y={108} fontSize={8} fill="#10b981" textAnchor="middle">Transfer</text>
          <text x={165} y={130} fontSize={8} fill="#6b7280" textAnchor="middle">A + B</text>
          {/* Arrow from old fund down */}
          <path d="M 70 180 L 70 210" stroke="#6b7280" strokeWidth={1.5} markerEnd="url(#arrowGray)" />
          <text x={70} y={222} fontSize={8} fill="#6b7280" textAnchor="middle">C stays / winds down</text>
          {/* Continuation Vehicle Box */}
          <rect x={205} y={30} width={140} height={170} rx={8} fill="#1c1917" stroke="#10b981" strokeWidth={2} />
          <text x={275} y={52} fontSize={11} fill="#10b981" textAnchor="middle" fontWeight="bold">Continuation</text>
          <text x={275} y={66} fontSize={11} fill="#10b981" textAnchor="middle" fontWeight="bold">Vehicle</text>
          <rect x={215} y={75} width={120} height={22} rx={4} fill="#064e3b" stroke="#059669" strokeWidth={1} />
          <text x={275} y={90} fontSize={9} fill="#34d399" textAnchor="middle">Asset A (Trophy)</text>
          <rect x={215} y={102} width={120} height={22} rx={4} fill="#1e1b4b" stroke="#6d28d9" strokeWidth={1} />
          <text x={275} y={117} fontSize={9} fill="#a78bfa" textAnchor="middle">Asset B (Growth)</text>
          <text x={275} y={145} fontSize={9} fill="#71717a" textAnchor="middle">New 3–5yr hold period</text>
          <text x={275} y={158} fontSize={9} fill="#71717a" textAnchor="middle">Fresh carry clock</text>
          <text x={275} y={171} fontSize={9} fill="#71717a" textAnchor="middle">Secondary buyers fund CV</text>
          <text x={275} y={184} fontSize={9} fill="#71717a" textAnchor="middle">at ~NAV</text>
          {/* Tender offer to old LPs */}
          <path d="M 205 100 L 380 100" stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#arrowAmber)" strokeDasharray="4 2" />
          <rect x={345} y={75} width={80} height={45} rx={6} fill="none" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 2" />
          <text x={385} y={89} fontSize={9} fill="#f59e0b" textAnchor="middle">Old LPs:</text>
          <text x={385} y={101} fontSize={9} fill="#f59e0b" textAnchor="middle">Cash out</text>
          <text x={385} y={113} fontSize={9} fill="#f59e0b" textAnchor="middle">or Roll</text>
        </svg>
      </div>

      {/* GP-Led Market Growth */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading
          title="GP-Led Share of Secondary Market (2015–2023)"
          sub="GP-led transactions grew from ~12% to ~50% of total secondary volume"
        />
        <svg viewBox={`0 0 ${W2} ${H2}`} className="w-full" style={{ maxHeight: 220 }}>
          {[0, 20, 40, 60].map((pct) => {
            const y = yG(pct);
            return (
              <g key={pct}>
                <line x1={pL2} x2={W2 - pR2} y1={y} y2={y} stroke="#ffffff12" strokeWidth={1} />
                <text x={pL2 - 4} y={y + 4} fontSize={8} fill="#71717a" textAnchor="end">
                  {pct}%
                </text>
              </g>
            );
          })}
          {gpLedShare.map((d, i) => (
            <g key={d.year}>
              <rect
                x={xG(i)}
                y={yG(d.pct)}
                width={barW2}
                height={cH2 - cH2 * (1 - d.pct / 60)}
                fill={d.pct >= 45 ? "#10b981" : d.pct >= 30 ? "#6366f1" : "#3b82f6"}
                opacity={0.8}
                rx={2}
              />
              <text
                x={xG(i) + barW2 / 2}
                y={yG(d.pct) - 3}
                fontSize={8}
                fill="#a1a1aa"
                textAnchor="middle"
              >
                {d.pct}%
              </text>
              <text
                x={xG(i) + barW2 / 2}
                y={H2 - 6}
                fontSize={8}
                fill="#71717a"
                textAnchor="middle"
              >
                {d.year}
              </text>
            </g>
          ))}
          <text x={pL2 + cW2 / 2} y={14} fontSize={9} fill="#71717a" textAnchor="middle">
            GP-led now represents nearly half of all secondary market volume
          </text>
        </svg>
      </div>

      {/* CV Types Comparison */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading title="Single-Asset vs Multi-Asset Continuation Vehicles" />
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedCV("single")}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              selectedCV === "single"
                ? "bg-emerald-600 text-white"
                : "bg-muted text-muted-foreground hover:text-white"
            )}
          >
            Single Asset
          </button>
          <button
            onClick={() => setSelectedCV("multi")}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              selectedCV === "multi"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:text-white"
            )}
          >
            Multi Asset
          </button>
        </div>
        <AnimatePresence mode="wait">
          {selectedCV === "single" ? (
            <motion.div
              key="single"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-3">
                    GP concentrates CV on its single best portfolio company — the "crown jewel" transaction. High conviction; LP scrutiny intense. ILPA fairness opinion mandatory.
                  </p>
                  <div className="space-y-2">
                    {[
                      { k: "Typical size", v: "$200M–$2B" },
                      { k: "Pricing", v: "~100% of last NAV mark" },
                      { k: "LP scrutiny", v: "Very high — single concentration" },
                      { k: "Fairness opinion", v: "Required by ILPA guidelines" },
                      { k: "GP economics", v: "Fresh 20% carry on new vehicle" },
                      { k: "Example", v: "Vista Equity CV for single SaaS asset" },
                    ].map((r) => (
                      <div key={r.k} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{r.k}</span>
                        <span className="text-foreground">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-amber-900/20 border border-amber-700/30 p-3">
                  <p className="text-xs font-semibold text-amber-300 mb-2">Key Alignment Concern</p>
                  <p className="text-xs text-muted-foreground">
                    GP acts on both sides: as seller (from old fund) and buyer/manager (of new CV). Independent fairness opinion required to verify that CV pricing reflects fair market value, protecting rolling and exiting LPs alike.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="multi"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-3">
                    GP moves 2–10 portfolio companies into CV, providing diversification for secondary buyers and GP optionality across multiple assets. More complex valuation but more LP support.
                  </p>
                  <div className="space-y-2">
                    {[
                      { k: "Typical size", v: "$500M–$5B" },
                      { k: "Asset count", v: "2–10 companies" },
                      { k: "Pricing", v: "Blended NAV, often slight discount" },
                      { k: "LP scrutiny", v: "Moderate — diversification helps" },
                      { k: "Transaction time", v: "4–8 months" },
                      { k: "Example", v: "Advent International multi-company strip sale" },
                    ].map((r) => (
                      <div key={r.k} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{r.k}</span>
                        <span className="text-foreground">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 border border-border p-3">
                  <p className="text-xs font-semibold text-primary mb-2">Strip Sale vs Full Roll</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong className="text-muted-foreground">Strip Sale:</strong> Subset of portfolio moves to CV; rest winds down in old fund. Allows GP to select best performers.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-muted-foreground">Full Roll:</strong> Entire portfolio moves; old fund effectively converts. Simpler but LP consent more difficult to obtain.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preferred Equity */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading
          title="Preferred Equity in GP-Led Context"
          sub="Hybrid solution for GPs needing partial liquidity"
        />
        <p className="text-xs text-muted-foreground mb-4">
          Preferred equity sits between full secondary sale and continuation vehicle. GP raises preferred equity from secondary buyers against the fund portfolio — providing LP distributions without full asset transfer.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              title: "Structure",
              desc: "Preferred return (8–12%) plus participation in upside above hurdle; GP retains control of portfolio companies.",
              color: "blue",
            },
            {
              title: "LP Benefit",
              desc: "Existing LPs receive distributions from preferred proceeds; GP gets runway to optimize exits on remaining assets.",
              color: "emerald",
            },
            {
              title: "Providers",
              desc: "17Capital, Whitehorse Liquidity Partners, Investcorp; focused on GP-led preferred equity strategies.",
              color: "violet",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-lg border border-border p-3">
              <p
                className={cn(
                  "text-sm font-semibold mb-2",
                  c.color === "blue"
                    ? "text-primary"
                    : c.color === "emerald"
                    ? "text-emerald-300"
                    : "text-primary"
                )}
              >
                {c.title}
              </p>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Advisors */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading
          title="GP-Led Secondary Advisors"
          sub="Investment banks managing GP-led auction processes"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {advisors.map((a) => (
            <div key={a.name} className="rounded-lg bg-black/20 border border-border/50 px-3 py-2">
              <p className="text-sm font-semibold text-white">{a.name}</p>
              <p className="text-xs text-muted-foreground">{a.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — NAV FINANCING
// ═══════════════════════════════════════════════════════════════════════════════

function NAVFinancingTab() {
  const [expandedUseCase, setExpandedUseCase] = useState<number | null>(null);

  const useCases = [
    {
      title: "LP Distributions",
      icon: <DollarSign className="w-4 h-4" />,
      color: "emerald",
      desc: "GP borrows against portfolio NAV to distribute capital to LPs before exits occur. Allows distributions without forced asset sales at inopportune times.",
      risk: "If portfolio deteriorates post-distribution, remaining LPs bear full risk with less NAV coverage.",
    },
    {
      title: "Follow-On Investments",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "blue",
      desc: "Deploy NAV loan proceeds into existing portfolio companies needing capital (growth, restructuring, add-on acquisitions). Avoids raising new fund.",
      risk: "Leverages existing portfolio to fund new investments — amplifies both returns and losses.",
    },
    {
      title: "Fund-Level Diversification",
      icon: <BarChart3 className="w-4 h-4" />,
      color: "violet",
      desc: "Use NAV facility to acquire new positions or fund stapled secondary commitments, diversifying concentrated portfolio.",
      risk: "New positions funded with debt increase overall fund leverage beyond initial LP expectations.",
    },
    {
      title: "Bridge to Exit",
      icon: <ArrowRight className="w-4 h-4" />,
      color: "amber",
      desc: "Short-term NAV facility bridges gap between portfolio maturity and optimal exit window (IPO market, strategic buyer).",
      risk: "Timing risk — if exit window does not open, facility must be refinanced or assets sold at discount.",
    },
  ];

  const providers = [
    { name: "Blackstone Credit", approach: "In-house facility for Blackstone funds; also third-party", size: "Large" },
    { name: "17Capital", approach: "Dedicated NAV financing; preferred equity specialist", size: "Mid" },
    { name: "Ares Management", approach: "Broad credit platform; NAV and preferred equity", size: "Large" },
    { name: "Goldman Sachs", approach: "Bank-driven NAV lending; balance sheet capacity", size: "Large" },
    { name: "Investcorp", approach: "Boutique preferred equity and NAV specialist", size: "Mid" },
    { name: "Pemberton Asset Management", approach: "European NAV lending focus", size: "Mid" },
  ];

  const navGrowth = [
    { year: "2016", vol: 8 },
    { year: "2017", vol: 12 },
    { year: "2018", vol: 18 },
    { year: "2019", vol: 28 },
    { year: "2020", vol: 35 },
    { year: "2021", vol: 55 },
    { year: "2022", vol: 75 },
    { year: "2023", vol: 95 },
    { year: "2024", vol: 120 },
  ];

  const W3 = 480;
  const H3 = 160;
  const pL3 = 38;
  const pR3 = 12;
  const pT3 = 14;
  const pB3 = 28;
  const cW3 = W3 - pL3 - pR3;
  const cH3 = H3 - pT3 - pB3;
  const maxVol = 140;
  const xN = (i: number) => pL3 + (i / (navGrowth.length - 1)) * cW3;
  const yN = (v: number) => pT3 + cH3 - (v / maxVol) * cH3;

  const navPath = navGrowth
    .map((d, i) => `${i === 0 ? "M" : "L"}${xN(i).toFixed(1)},${yN(d.vol).toFixed(1)}`)
    .join(" ");
  const navFill =
    `${navPath} L${xN(navGrowth.length - 1).toFixed(1)},${(pT3 + cH3).toFixed(1)} L${xN(0).toFixed(1)},${(pT3 + cH3).toFixed(1)} Z`;

  // suppress unused var lint
  void pB3;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="NAV Loan LTV" value="15–25%" sub="Loan as % of portfolio NAV" />
        <StatCard label="Typical Spread" value="SOFR+600–900bps" sub="All-in pricing 2024" />
        <StatCard label="Market Size (2024)" value="~$120B" sub="Outstanding NAV facilities" highlight="pos" />
        <StatCard label="Loan Term" value="2–4 years" sub="Typical NAV facility tenor" />
      </div>

      {/* Market Growth */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading
          title="NAV Financing Market Growth ($B Outstanding)"
          sub="Rapid expansion driven by rate environment and LP demand for liquidity"
        />
        <svg viewBox={`0 0 ${W3} ${H3}`} className="w-full" style={{ maxHeight: 180 }}>
          {[0, 40, 80, 120].map((v) => {
            const y = yN(v);
            return (
              <g key={v}>
                <line x1={pL3} x2={W3 - pR3} y1={y} y2={y} stroke="#ffffff12" strokeWidth={1} />
                <text x={pL3 - 4} y={y + 4} fontSize={8} fill="#71717a" textAnchor="end">
                  {fmtB(v)}
                </text>
              </g>
            );
          })}
          <path d={navFill} fill="#6366f1" opacity={0.15} />
          <path d={navPath} fill="none" stroke="#6366f1" strokeWidth={2.5} />
          {navGrowth.map((d, i) => (
            <g key={d.year}>
              <circle cx={xN(i)} cy={yN(d.vol)} r={3.5} fill="#6366f1" />
              <text x={xN(i)} y={H3 - 6} fontSize={8} fill="#71717a" textAnchor="middle">
                {d.year}
              </text>
            </g>
          ))}
          <text
            x={xN(navGrowth.length - 1)}
            y={yN(navGrowth[navGrowth.length - 1].vol) - 8}
            fontSize={9}
            fill="#818cf8"
            textAnchor="middle"
          >
            ~$120B
          </text>
        </svg>
      </div>

      {/* Use Cases */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading title="NAV Loan Use Cases + Risks" sub="Click to expand risk details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {useCases.map((u, i) => (
            <button
              key={i}
              className="text-left rounded-lg border border-border bg-black/20 p-3 hover:border-border transition-all"
              onClick={() => setExpandedUseCase(expandedUseCase === i ? null : i)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-muted-foreground">{u.icon}</span>
                <span className="text-sm font-semibold text-white">{u.title}</span>
                <InfoPill text="Use case" color={u.color} />
              </div>
              <p className="text-xs text-muted-foreground">{u.desc}</p>
              <AnimatePresence>
                {expandedUseCase === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 rounded bg-rose-900/20 border border-rose-700/30 p-2">
                      <p className="text-xs text-rose-300 font-semibold mb-1">Key Risk</p>
                      <p className="text-xs text-muted-foreground">{u.risk}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      </div>

      {/* Structure Details */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading title="NAV Facility Structure vs Subscription Line" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground py-2 pr-4">Attribute</th>
                <th className="text-left text-primary py-2 pr-4">NAV Facility</th>
                <th className="text-left text-emerald-300 py-2">Subscription Line</th>
              </tr>
            </thead>
            <tbody>
              {[
                { attr: "Collateral", nav: "Portfolio company NAV", sub: "LP unfunded commitments" },
                { attr: "Risk profile", nav: "Portfolio performance risk", sub: "LP credit quality risk" },
                { attr: "LTV / advance rate", nav: "15–25% of NAV", sub: "60–90% of unfunded capital" },
                { attr: "Typical spread", nav: "SOFR + 600–900bps", sub: "SOFR + 150–250bps" },
                { attr: "Maturity", nav: "2–4 years", sub: "1–3 years (renewable)" },
                { attr: "Stage in fund life", nav: "Mid to late (harvest)", sub: "Early (investment period)" },
                { attr: "Primary use", nav: "Distributions / follow-ons", sub: "Bridge capital calls" },
                { attr: "LP disclosure", nav: "Increasingly required", sub: "Standard disclosure" },
              ].map((r) => (
                <tr key={r.attr} className="border-b border-border/50">
                  <td className="text-muted-foreground py-2 pr-4">{r.attr}</td>
                  <td className="text-foreground py-2 pr-4">{r.nav}</td>
                  <td className="text-foreground py-2">{r.sub}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Covenant Structure */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading title="NAV Loan Covenant Structure" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Financial Covenants</p>
            {[
              {
                cov: "LTV Covenant",
                detail: "Loan balance must not exceed 25% of tested portfolio NAV; tested quarterly.",
              },
              {
                cov: "Minimum NAV Floor",
                detail: "Portfolio NAV cannot fall below 2x outstanding loan balance ($200M floor on $100M loan).",
              },
              {
                cov: "Liquidity Reserve",
                detail: "GP must maintain minimum cash / liquid assets to cover 6–12 months of interest payments.",
              },
              {
                cov: "Concentration Limit",
                detail: "Single company NAV cannot represent more than 35% of total collateral pool.",
              },
            ].map((c) => (
              <div key={c.cov} className="rounded-lg bg-black/20 p-2">
                <p className="text-xs font-semibold text-primary">{c.cov}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.detail}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Structural Protections</p>
            {[
              {
                cov: "Cure Period",
                detail: "If LTV covenant breached, GP has 30–60 days to cure via asset sales, paydown, or equity injection.",
              },
              {
                cov: "Cash Sweep",
                detail: "Lender can sweep portfolio distributions to repay outstanding balance upon covenant breach.",
              },
              {
                cov: "No Additional Debt",
                detail: "Prohibition on portfolio companies taking additional debt without lender consent above basket threshold.",
              },
              {
                cov: "LP Disclosure",
                detail: "ILPA recommends GPs disclose NAV facility terms to LPs including sizing, pricing, covenants, use of proceeds.",
              },
            ].map((c) => (
              <div key={c.cov} className="rounded-lg bg-black/20 p-2">
                <p className="text-xs font-semibold text-amber-300">{c.cov}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Providers */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading title="NAV Loan Providers" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {providers.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between rounded-lg bg-black/20 border border-border/50 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-white">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.approach}</p>
              </div>
              <InfoPill text={p.size} color={p.size === "Large" ? "blue" : "violet"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — MARKET DYNAMICS
// ═══════════════════════════════════════════════════════════════════════════════

function MarketDynamicsTab() {
  const marketGrowth = [
    { year: "2000", vol: 5 },
    { year: "2002", vol: 4 },
    { year: "2004", vol: 8 },
    { year: "2006", vol: 16 },
    { year: "2008", vol: 10 },
    { year: "2010", vol: 22 },
    { year: "2012", vol: 26 },
    { year: "2014", vol: 42 },
    { year: "2016", vol: 58 },
    { year: "2018", vol: 74 },
    { year: "2020", vol: 60 },
    { year: "2021", vol: 130 },
    { year: "2022", vol: 108 },
    { year: "2023", vol: 114 },
    { year: "2024", vol: 132 },
  ];

  const pricingCycle = [
    { period: "2020 Q1", pct: 88 },
    { period: "2020 Q3", pct: 80 },
    { period: "2021 Q1", pct: 98 },
    { period: "2021 Q3", pct: 101 },
    { period: "2022 Q1", pct: 95 },
    { period: "2022 Q3", pct: 84 },
    { period: "2023 Q1", pct: 82 },
    { period: "2023 Q3", pct: 86 },
    { period: "2024 Q1", pct: 91 },
    { period: "2024 Q3", pct: 94 },
  ];

  // Market Growth SVG
  const W4 = 480;
  const H4 = 160;
  const pL4 = 38;
  const pR4 = 12;
  const pT4 = 14;
  const pB4 = 28;
  const cW4 = W4 - pL4 - pR4;
  const cH4 = H4 - pT4 - pB4;
  const maxG = 150;
  const xMG = (i: number) => pL4 + (i / (marketGrowth.length - 1)) * cW4;
  const yMG = (v: number) => pT4 + cH4 - (v / maxG) * cH4;
  const growthPath = marketGrowth
    .map((d, i) => `${i === 0 ? "M" : "L"}${xMG(i).toFixed(1)},${yMG(d.vol).toFixed(1)}`)
    .join(" ");
  const growthFill =
    `${growthPath} L${xMG(marketGrowth.length - 1).toFixed(1)},${(pT4 + cH4).toFixed(1)} L${xMG(0).toFixed(1)},${(pT4 + cH4).toFixed(1)} Z`;

  // Pricing Cycle SVG
  const W5 = 480;
  const H5 = 160;
  const pL5 = 38;
  const pR5 = 12;
  const pT5 = 14;
  const pB5 = 28;
  const cW5 = W5 - pL5 - pR5;
  const cH5 = H5 - pT5 - pB5;
  const minP = 75;
  const maxP = 110;
  const pRange = maxP - minP;
  const xPC = (i: number) => pL5 + (i / (pricingCycle.length - 1)) * cW5;
  const yPC = (v: number) => pT5 + cH5 - ((v - minP) / pRange) * cH5;
  const pricePath = pricingCycle
    .map((d, i) => `${i === 0 ? "M" : "L"}${xPC(i).toFixed(1)},${yPC(d.pct).toFixed(1)}`)
    .join(" ");
  const priceParLine = pT5 + cH5 - ((100 - minP) / pRange) * cH5;

  // J-curve
  const jCurve = [
    { yr: 0, primary: 0, secondary: 0 },
    { yr: 1, primary: -8, secondary: 2 },
    { yr: 2, primary: -12, secondary: 5 },
    { yr: 3, primary: -6, secondary: 9 },
    { yr: 4, primary: 5, secondary: 14 },
    { yr: 5, primary: 18, secondary: 20 },
    { yr: 6, primary: 32, secondary: 28 },
    { yr: 7, primary: 44, secondary: 36 },
    { yr: 8, primary: 52, secondary: 42 },
  ];

  const W6 = 480;
  const H6 = 160;
  const pL6 = 40;
  const pT6 = 14;
  const pB6 = 28;
  const cH6 = H6 - pT6 - pB6;
  const jMin = -15;
  const jMax = 55;
  const jRange = jMax - jMin;
  const xJ = (yr: number) => pL6 + (yr / 8) * (W6 - pL6 - 12);
  const yJ = (v: number) => pT6 + cH6 - ((v - jMin) / jRange) * cH6;
  const zeroJY = yJ(0);
  const primaryPath = jCurve
    .map((d, i) => `${i === 0 ? "M" : "L"}${xJ(d.yr).toFixed(1)},${yJ(d.primary).toFixed(1)}`)
    .join(" ");
  const secondaryPath = jCurve
    .map((d, i) => `${i === 0 ? "M" : "L"}${xJ(d.yr).toFixed(1)},${yJ(d.secondary).toFixed(1)}`)
    .join(" ");

  const assetClassSpreads = [
    { cls: "PE (Buyout)", bid: 88, ask: 94, color: "bg-primary" },
    { cls: "PE (Venture)", bid: 65, ask: 78, color: "bg-rose-500" },
    { cls: "Real Estate", bid: 75, ask: 85, color: "bg-amber-500" },
    { cls: "Infrastructure", bid: 90, ask: 96, color: "bg-emerald-500" },
    { cls: "Private Credit", bid: 92, ask: 97, color: "bg-primary" },
  ];

  // suppress unused var lint
  void pB4;
  void cW4;
  void pB5;
  void cW5;
  void pB6;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="2024 Volume" value="$132B" sub="Up from $5B in 2000" highlight="pos" />
        <StatCard label="Outperformance" value="+200bps" sub="Secondary vs primary (net IRR)" highlight="pos" />
        <StatCard label="J-Curve Mitigation" value="2–3 yrs" sub="Faster positive returns" highlight="pos" />
        <StatCard label="Vintage Diversification" value="3–6 vintages" sub="Typical secondary fund" />
      </div>

      {/* Market Growth */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading
          title="Secondary Market Volume Growth ($B, 2000–2024)"
          sub="26x growth in two decades; 2020 COVID dip quickly recovered"
        />
        <svg viewBox={`0 0 ${W4} ${H4}`} className="w-full" style={{ maxHeight: 180 }}>
          {[0, 50, 100, 150].map((v) => {
            const y = yMG(v);
            return (
              <g key={v}>
                <line x1={pL4} x2={W4 - pR4} y1={y} y2={y} stroke="#ffffff12" strokeWidth={1} />
                <text x={pL4 - 4} y={y + 4} fontSize={8} fill="#71717a" textAnchor="end">
                  {fmtB(v)}
                </text>
              </g>
            );
          })}
          <path d={growthFill} fill="#10b981" opacity={0.12} />
          <path d={growthPath} fill="none" stroke="#10b981" strokeWidth={2.5} />
          {marketGrowth
            .filter((_, i) => i % 2 === 0)
            .map((d, idx) => {
              const i = idx * 2;
              return (
                <g key={d.year}>
                  <circle cx={xMG(i)} cy={yMG(d.vol)} r={3} fill="#10b981" />
                  <text x={xMG(i)} y={H4 - 6} fontSize={7} fill="#71717a" textAnchor="middle">
                    {d.year}
                  </text>
                </g>
              );
            })}
          <text
            x={xMG(marketGrowth.length - 1)}
            y={yMG(marketGrowth[marketGrowth.length - 1].vol) - 8}
            fontSize={9}
            fill="#34d399"
            textAnchor="end"
          >
            $132B
          </text>
          <text x={xMG(4)} y={yMG(10) - 8} fontSize={8} fill="#f59e0b" textAnchor="middle">
            GFC
          </text>
          <text x={xMG(10)} y={yMG(60) - 8} fontSize={8} fill="#f59e0b" textAnchor="middle">
            COVID
          </text>
        </svg>
      </div>

      {/* Pricing Cycle */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading
          title="Secondary Market Pricing Cycle (% of NAV)"
          sub="2021 peak premium, 2022–23 discount, 2024 recovery"
        />
        <svg viewBox={`0 0 ${W5} ${H5}`} className="w-full" style={{ maxHeight: 180 }}>
          {[80, 90, 100].map((v) => {
            const y = yPC(v);
            return (
              <g key={v}>
                <line x1={pL5} x2={W5 - pR5} y1={y} y2={y} stroke="#ffffff12" strokeWidth={1} />
                <text x={pL5 - 4} y={y + 4} fontSize={8} fill="#71717a" textAnchor="end">
                  {v}%
                </text>
              </g>
            );
          })}
          <line
            x1={pL5}
            x2={W5 - pR5}
            y1={priceParLine}
            y2={priceParLine}
            stroke="#ffffff30"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          {pricingCycle.slice(0, -1).map((d, i) => {
            const x1 = xPC(i);
            const x2 = xPC(i + 1);
            const y1 = yPC(d.pct);
            const y2 = yPC(pricingCycle[i + 1].pct);
            const isPremium = d.pct >= 100;
            return (
              <polygon
                key={i}
                points={`${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${x2.toFixed(1)},${priceParLine.toFixed(1)} ${x1.toFixed(1)},${priceParLine.toFixed(1)}`}
                fill={isPremium ? "#10b981" : "#f43f5e"}
                opacity={0.15}
              />
            );
          })}
          <path d={pricePath} fill="none" stroke="#6366f1" strokeWidth={2.5} />
          {pricingCycle.map((d, i) => (
            <g key={d.period}>
              <circle cx={xPC(i)} cy={yPC(d.pct)} r={3} fill={d.pct >= 100 ? "#10b981" : "#6366f1"} />
              {i % 2 === 0 && (
                <text x={xPC(i)} y={H5 - 6} fontSize={7} fill="#71717a" textAnchor="middle">
                  {d.period}
                </text>
              )}
            </g>
          ))}
          <text x={xPC(3)} y={yPC(101) - 8} fontSize={8} fill="#10b981" textAnchor="middle">
            Peak Premium
          </text>
          <text x={xPC(6)} y={yPC(82) + 12} fontSize={8} fill="#f87171" textAnchor="middle">
            Rate Shock
          </text>
        </svg>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-emerald-500/40 inline-block" /> Premium (above PAR)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-rose-500/40 inline-block" /> Discount (below PAR)
          </span>
        </div>
      </div>

      {/* Bid-Ask by Asset Class */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading
          title="Secondary Pricing by Asset Class (% of NAV)"
          sub="Infrastructure and private credit trade closest to NAV; VC widest discount"
        />
        <div className="space-y-3">
          {assetClassSpreads.map((a) => (
            <div key={a.cls} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-28">{a.cls}</span>
              <div className="flex-1 bg-muted rounded h-6 relative">
                <div
                  className={cn("absolute h-6 rounded opacity-40", a.color)}
                  style={{
                    left: `${(a.bid - 60) * 2.5}%`,
                    width: `${(a.ask - a.bid) * 2.5}%`,
                  }}
                />
                <div
                  className={cn("absolute h-6 rounded opacity-15", a.color)}
                  style={{ left: "0%", width: `${(a.ask - 60) * 2.5}%` }}
                />
                <div
                  className="absolute h-6 bg-foreground/20 w-px"
                  style={{ left: `${(100 - 60) * 2.5}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-20 text-right">
                {a.bid}–{a.ask}%
              </span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-1">Vertical line = 100% NAV (par)</p>
        </div>
      </div>

      {/* J-Curve Mitigation */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading
          title="J-Curve: Primary vs Secondary Fund Returns"
          sub="Secondaries skip early negative years — buying seasoned portfolios already past J-curve trough"
        />
        <svg viewBox={`0 0 ${W6} ${H6}`} className="w-full" style={{ maxHeight: 180 }}>
          {[-10, 0, 20, 40].map((v) => {
            const y = yJ(v);
            return (
              <g key={v}>
                <line x1={pL6} x2={W6 - 12} y1={y} y2={y} stroke="#ffffff12" strokeWidth={1} />
                <text x={pL6 - 4} y={y + 4} fontSize={8} fill="#71717a" textAnchor="end">
                  {v}%
                </text>
              </g>
            );
          })}
          <line x1={pL6} x2={W6 - 12} y1={zeroJY} y2={zeroJY} stroke="#ffffff25" strokeWidth={1} />
          {jCurve.slice(0, -1).map((d, i) => {
            const x1 = xJ(d.yr);
            const x2 = xJ(jCurve[i + 1].yr);
            const y1p = yJ(d.primary);
            const y2p = yJ(jCurve[i + 1].primary);
            if (d.primary < 0 || jCurve[i + 1].primary < 0) {
              return (
                <polygon
                  key={i}
                  points={`${x1.toFixed(1)},${y1p.toFixed(1)} ${x2.toFixed(1)},${y2p.toFixed(1)} ${x2.toFixed(1)},${zeroJY.toFixed(1)} ${x1.toFixed(1)},${zeroJY.toFixed(1)}`}
                  fill="#f43f5e"
                  opacity={0.15}
                />
              );
            }
            return null;
          })}
          <path d={primaryPath} fill="none" stroke="#f43f5e" strokeWidth={2} />
          <path d={secondaryPath} fill="none" stroke="#10b981" strokeWidth={2.5} />
          {jCurve.map((d) => (
            <text key={d.yr} x={xJ(d.yr)} y={H6 - 6} fontSize={8} fill="#71717a" textAnchor="middle">
              Yr{d.yr}
            </text>
          ))}
          <line x1={pL6} x2={pL6 + 20} y1={pT6 + 4} y2={pT6 + 4} stroke="#f43f5e" strokeWidth={2} />
          <text x={pL6 + 24} y={pT6 + 8} fontSize={9} fill="#f87171">
            Primary
          </text>
          <line x1={pL6 + 72} x2={pL6 + 92} y1={pT6 + 4} y2={pT6 + 4} stroke="#10b981" strokeWidth={2.5} />
          <text x={pL6 + 96} y={pT6 + 8} fontSize={9} fill="#34d399">
            Secondary
          </text>
          <text x={xJ(1.5)} y={yJ(-14)} fontSize={8} fill="#f87171" textAnchor="middle">
            J-Curve trough
          </text>
        </svg>
        <p className="text-xs text-muted-foreground mt-2">
          Secondary buyers typically purchase funds in years 4–7 at discount, entering a portfolio already past the trough. Positive cash-on-cash from day one, avoiding early management fee drag.
        </p>
      </div>

      {/* Fund Construction */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading title="Secondary Fund Portfolio Construction" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">Diversification Axes</p>
            <div className="space-y-2">
              {[
                { axis: "Vintage Years", target: "3–5 different vintages", detail: "Spreads entry pricing across cycles" },
                { axis: "Geography", target: "NA / Europe / Asia", detail: "Typically 60/30/10 allocation" },
                { axis: "Strategy", target: "Buyout / Growth / VC / RE", detail: "Buyout dominant; VC at discount" },
                { axis: "GP Count", target: "30–80 underlying GPs", detail: "Concentration limit per GP ~5%" },
                { axis: "Company Count", target: "300–1,000+ companies", detail: "Extreme diversification via layering" },
                { axis: "Deal Size", target: "Mix of large/mid/small", detail: "Large for pricing; small for yield" },
              ].map((d) => (
                <div key={d.axis} className="flex gap-2 rounded bg-black/20 border border-border/50 p-2">
                  <div className="w-28 flex-shrink-0">
                    <p className="text-xs font-medium text-muted-foreground">{d.axis}</p>
                    <p className="text-xs text-primary">{d.target}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">Secondary vs Primary Performance</p>
            <div className="rounded-lg border border-border bg-black/20 p-4 mb-3">
              <p className="text-xs text-muted-foreground mb-3">
                Secondaries historically outperform primaries by ~200bps net IRR, driven by:
              </p>
              <div className="space-y-2">
                {[
                  { factor: "Purchase Discount", impact: "+200–400bps", note: "Buying below NAV creates immediate return cushion" },
                  { factor: "J-Curve Skip", impact: "+150–300bps", note: "No early loss years; faster positive cash-on-cash" },
                  { factor: "Fee Drag Reduction", impact: "+50–100bps", note: "Avoid early mgmt fees on committed not deployed capital" },
                  { factor: "Selection Bias", impact: "+100bps", note: "Secondary buyers cherry-pick best managers" },
                ].map((f) => (
                  <div key={f.factor} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{f.factor}</p>
                      <p className="text-xs text-muted-foreground">{f.note}</p>
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold whitespace-nowrap">{f.impact}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-muted/40 border border-border p-3">
              <p className="text-xs font-semibold text-primary mb-1">Denominator Effect Mechanics</p>
              <p className="text-xs text-muted-foreground">
                When public markets fall 30%, LP portfolio PE allocation (which marks quarterly) stays elevated as % of total portfolio. LP target 15% PE but now shows 22%. Must sell PE secondary interests to rebalance — creating forced selling pressure that drives secondary discounts during public market drawdowns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liquidity Comparison */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading
          title="Secondary Market Liquidity vs Other Asset Classes"
          sub="Relative liquidity spectrum"
        />
        <div className="space-y-2">
          {[
            { asset: "Public Equities", liquidity: 100, note: "T+2 settlement; exchange-traded", color: "bg-emerald-500" },
            { asset: "Investment Grade Bonds", liquidity: 85, note: "OTC dealer market; daily", color: "bg-emerald-400" },
            { asset: "High Yield Bonds", liquidity: 65, note: "OTC; wider bid-ask; days", color: "bg-amber-400" },
            { asset: "PE Secondaries", liquidity: 30, note: "Secondary market; 30–90 day process", color: "bg-amber-500" },
            { asset: "PE Primary Funds", liquidity: 8, note: "Lock-up 10–12 years; GP consent", color: "bg-rose-500" },
            { asset: "Direct PE Co-Invest", liquidity: 5, note: "No secondary market; full hold", color: "bg-rose-600" },
          ].map((a) => (
            <div key={a.asset} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-44">{a.asset}</span>
              <div className="flex-1 bg-muted rounded h-5">
                <div
                  className={cn("h-5 rounded", a.color)}
                  style={{ width: `${a.liquidity}%`, opacity: 0.75 }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-44 text-right">{a.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LP Portfolio Management */}
      <div className="rounded-xl border border-border bg-foreground/5 p-5">
        <SectionHeading title="Using Secondaries for LP Portfolio Management" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Tail Management",
              icon: <Users className="w-4 h-4" />,
              points: [
                "Sell end-of-life fund stakes (years 9–12) to dedicated secondary buyers",
                "Eliminate administrative burden of 20+ small, aging fund positions",
                "Free GP relationship team capacity for new commitments",
              ],
            },
            {
              title: "New GP Access",
              icon: <TrendingUp className="w-4 h-4" />,
              points: [
                "Acquire stakes in oversubscribed managers via secondary market",
                "Build relationship before committing to primary fund",
                "Stapled secondary provides both secondary exposure + new fund access",
              ],
            },
            {
              title: "Rebalancing Tool",
              icon: <BarChart3 className="w-4 h-4" />,
              points: [
                "Use secondary sales to reduce PE allocation toward target without waiting for wind-downs",
                "Buy secondaries in underrepresented strategies (VC/growth) to fill gaps",
                "Manage vintage year concentration across portfolio",
              ],
            },
          ].map((section) => (
            <div key={section.title} className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-muted-foreground">{section.icon}</span>
                <span className="text-sm font-semibold text-white">{section.title}</span>
              </div>
              <ul className="space-y-1.5">
                {section.points.map((p) => (
                  <li key={p} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 text-muted-foreground mt-0.5" />
                    {p}
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

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function PESecondariesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-muted/60 border border-border">
            <Repeat className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Private Equity Secondaries</h1>
            <p className="text-sm text-muted-foreground">
              LP-led transactions, GP-led continuation vehicles, NAV financing &amp; market dynamics
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <InfoPill text="$130B+ Annual Volume" color="violet" />
          <InfoPill text="LP-Led & GP-Led" color="blue" />
          <InfoPill text="NAV Financing" color="emerald" />
          <InfoPill text="Liquidity Solution" color="amber" />
        </div>
      </motion.div>

      {/* Overview strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-muted/30 p-4 mb-6"
      >
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              The <strong className="text-white">private equity secondary market</strong> allows investors to buy and sell existing PE fund interests before the fund lifecycle ends. Originally a niche liquidity solution, the market has grown to $130B+ annually and now includes LP-led sales, GP-led continuation vehicles, NAV financing, and preferred equity structures.
            </p>
            <p className="text-muted-foreground">
              Secondary buyers earn returns through: (1) purchasing at a discount to NAV, (2) skipping the J-curve, and (3) diversification across multiple vintage years, GPs, and geographies — historically generating ~200bps net IRR outperformance vs primary funds.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="lpled">
        <TabsList className="mb-6 flex flex-wrap gap-1 h-auto bg-card p-1 rounded-xl">
          {[
            { value: "lpled", label: "LP-Led Secondaries", icon: <DollarSign className="w-3.5 h-3.5" /> },
            { value: "gpled", label: "GP-Led Secondaries", icon: <Layers className="w-3.5 h-3.5" /> },
            { value: "nav", label: "NAV Financing", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { value: "market", label: "Market Dynamics", icon: <BarChart3 className="w-3.5 h-3.5" /> },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {t.icon}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="lpled" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LPLedTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="gpled" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GPLedTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="nav" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <NAVFinancingTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="market" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MarketDynamicsTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
