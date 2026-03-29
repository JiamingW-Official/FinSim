"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Clock,
  Globe,
  Layers,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 943;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const RAND_POOL: number[] = [];
for (let i = 0; i < 400; i++) RAND_POOL.push(rand());
let _ri = 0;
const _r = () => RAND_POOL[_ri++ % RAND_POOL.length];
void _r;

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtB(n: number): string {
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}T`;
  if (Math.abs(n) >= 1) return `$${n.toFixed(1)}B`;
  return `$${(n * 1_000).toFixed(0)}M`;
}
void fmtB;

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
      : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-muted/30 p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-xl font-bold", valClass)}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

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
        "inline-block rounded-full px-2 py-0.5 text-xs text-muted-foreground font-medium",
        cls[color] ?? cls.zinc
      )}
    >
      {text}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — VALUATION METHODS
// ═══════════════════════════════════════════════════════════════════════════════

function ValuationMethodsTab() {
  const [expandedMethod, setExpandedMethod] = useState<string | null>("dcf");

  const methods = [
    {
      id: "dcf",
      name: "Discounted Cash Flow (DCF)",
      color: "blue",
      colorClass: "text-primary",
      borderClass: "border-primary/40",
      bgClass: "bg-muted/40",
      badge: "Intrinsic Value",
      summary: "Project free cash flows 5–10 years, discount at WACC, add terminal value.",
      details: [
        "Terminal value via Gordon Growth Model: TV = FCF × (1+g) / (WACC − g)",
        "Typical WACC range for growth tech: 10–15%; mature industrials: 7–10%",
        "Terminal value often 70–80% of enterprise value — highly sensitive to assumptions",
        "Pre-revenue companies: discount revenue milestones, not FCF",
        "Scenario weighting: bull / base / bear with probability weights",
      ],
      bestFor: "Capital-intensive businesses with visible long-term cash flows",
    },
    {
      id: "comparable",
      name: "Comparable Company Analysis (Comps)",
      color: "violet",
      colorClass: "text-primary",
      borderClass: "border-primary/40",
      bgClass: "bg-muted/40",
      badge: "Market-Based",
      summary: "Apply peer EV/Revenue, EV/EBITDA, or P/E multiples to target metrics.",
      details: [
        "Select 8–12 comparable public companies by sector, size, and growth profile",
        "EV/Revenue preferred for high-growth pre-profit companies",
        "EV/EBITDA preferred for mature profitable businesses (7–15× typical range)",
        "Apply IPO discount of 10–20% vs fully-traded comparable (illiquidity adjustment)",
        "NTM (next twelve months) multiples preferred over LTM for growing companies",
      ],
      bestFor: "Most companies; requires liquid public comparables",
    },
    {
      id: "precedent",
      name: "Precedent Transaction Analysis",
      color: "amber",
      colorClass: "text-amber-400",
      borderClass: "border-amber-500/40",
      bgClass: "bg-amber-900/20",
      badge: "Control Premium",
      summary: "Analyze multiples paid in comparable M&A transactions (includes control premium).",
      details: [
        "Typically 20–30% higher than trading comps due to acquisition control premium",
        "Searches: past 3–5 years, same sector, similar deal size and strategic rationale",
        "Helpful upper bound for IPO range; less applicable for minority-stake IPOs",
        "LBO buyer floor: minimum price private equity would pay (10–12% target IRR)",
        "Banker may use as cross-check but rarely sole basis for IPO pricing",
      ],
      bestFor: "Setting a valuation ceiling; cross-check vs comps",
    },
    {
      id: "evrev",
      name: "EV/Revenue & Rule of 40",
      color: "emerald",
      colorClass: "text-emerald-400",
      borderClass: "border-emerald-500/40",
      bgClass: "bg-emerald-900/20",
      badge: "SaaS / Growth",
      summary: "For SaaS/tech: multiple of ARR. Rule of 40 = revenue growth % + EBITDA margin.",
      details: [
        "ARR multiple ranges: Rule of 40 <40 = 5–10×; Rule of 40 50+ = 15–25×",
        "Net Revenue Retention (NRR) >120% commands premium: 10–20% valuation uplift",
        "Gross margin matters: 80%+ software vs 40% hardware/services gets higher multiple",
        "Public SaaS median: ~7× NTM Revenue (2024); peak 2021 was ~20×",
        "CAC payback period and LTV/CAC ratio drive growth sustainability thesis",
      ],
      bestFor: "Pre-profit SaaS, fintech, and high-growth subscription businesses",
    },
  ];

  const equityBridge = [
    { label: "Enterprise Value (EV)", value: "$4,200M", color: "blue" },
    { label: "Less: Total Debt", value: "($800M)", color: "rose" },
    { label: "Plus: Cash & Equivalents", value: "$150M", color: "emerald" },
    { label: "Less: Minority Interest", value: "($50M)", color: "rose" },
    { label: "= Equity Value (Pre-Money)", value: "$3,500M", color: "amber", bold: true },
    { label: "Plus: IPO Proceeds (New Shares)", value: "$500M", color: "emerald" },
    { label: "= Equity Value (Post-Money)", value: "$4,000M", color: "white", bold: true },
  ];

  const dilutionTable = [
    { type: "Founders & Existing Shareholders", shares: 70_000_000, pct: 58.3 },
    { type: "IPO New Shares (Primary)", shares: 12_500_000, pct: 10.4 },
    { type: "Secondary Shares (Selling SHs)", shares: 5_000_000, pct: 4.2 },
    { type: "Employee Stock Options (ESOs)", shares: 15_000_000, pct: 12.5 },
    { type: "Restricted Stock Units (RSUs)", shares: 8_000_000, pct: 6.7 },
    { type: "Warrants (existing investors)", shares: 3_000_000, pct: 2.5 },
    { type: "Option Pool Reserve (unissued)", shares: 6_500_000, pct: 5.4 },
  ];
  const totalShares = dilutionTable.reduce((a, r) => a + r.shares, 0);

  const ipoDiscountFactors = [
    {
      title: "Information Asymmetry (Winner's Curse)",
      icon: AlertTriangle,
      color: "amber",
      desc: "Uninformed investors face adverse selection: they get full allocation in cold IPOs and are crowded out in hot IPOs. Discount compensates for this systematic disadvantage.",
    },
    {
      title: "Marketing & Investor Attraction",
      icon: Globe,
      color: "blue",
      desc: "Intentional underpricing creates first-day 'pop' media attention, broadens investor base, and builds positive sentiment for future secondary offerings.",
    },
    {
      title: "Lawsuit Risk Avoidance",
      icon: CheckCircle,
      color: "emerald",
      desc: "Overpriced IPOs that decline attract securities class action lawsuits. Underpricing creates buffer against post-IPO price drops triggering litigation.",
    },
    {
      title: "Analyst Coverage Incentive",
      icon: BarChart2,
      color: "violet",
      desc: "Underwriters implicitly underprice to reward institutional clients with quick profits, securing future banking relationships and analyst initiation coverage.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Valuation Methods" value="4 Core" sub="DCF / Comps / Precedent / EV Rev" />
        <StatCard label="IPO Discount" value="10–20%" sub="vs comparable co. trading value" highlight="neutral" />
        <StatCard label="Option Pool Shuffle" value="~10–15%" sub="Dilution from unissued pool" highlight="neg" />
        <StatCard label="JOBS Act (2012)" value="Confidential Filing" sub="EGC companies ≤$1.07B revenue" highlight="pos" />
      </div>

      {/* Valuation Method Cards */}
      <div className="space-y-3">
        <SectionHeading title="Four Core IPO Valuation Methods" sub="Bankers use all four as cross-checks to build a defensible price range" />
        {methods.map((m) => {
          const isOpen = expandedMethod === m.id;
          return (
            <div
              key={m.id}
              className={cn("rounded-md border p-4 cursor-pointer transition-colors", m.borderClass, m.bgClass)}
              onClick={() => setExpandedMethod(isOpen ? null : m.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn("text-sm font-semibold", m.colorClass)}>{m.name}</span>
                  <InfoPill text={m.badge} color={m.color} />
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{m.summary}</p>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                      {m.details.map((d, i) => (
                        <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <span>{d}</span>
                        </div>
                      ))}
                      <div className="mt-2 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-xs text-emerald-300">Best for: {m.bestFor}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Growth vs Mature */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Growth Company vs. Mature Company Valuation" sub="Different metrics dominate depending on company stage" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-primary mb-3">High-Growth Tech / SaaS</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {[
                "Primary metric: EV/NTM Revenue (5–25× range)",
                "Revenue growth rate > profitability (Rule of 40)",
                "TAM size and market penetration thesis",
                "Cohort economics: CAC, LTV, NRR",
                "Path to profitability (breakeven year)",
                "Multiple compression risk if growth slows",
              ].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/10 p-4">
            <p className="text-xs font-medium text-emerald-300 mb-3">Mature / Industrial / Consumer</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {[
                "Primary metrics: EV/EBITDA (8–15×), P/E (15–25×)",
                "FCF yield and dividend capacity",
                "Margin stability and competitive moat",
                "Capital structure and debt capacity",
                "Comparable company peer set (12–15 comps)",
                "Cyclicality discount in down-cycle IPOs",
              ].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Equity Bridge */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="Pre-Money vs. Post-Money Equity Bridge"
          sub="How enterprise value translates to per-share IPO price"
        />
        <div className="space-y-1.5">
          {equityBridge.map((row, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-xs text-muted-foreground",
                row.bold ? "border border-border bg-foreground/10" : "bg-foreground/[0.03]"
              )}
            >
              <span className={cn("text-muted-foreground", row.bold && "font-medium text-sm")}>{row.label}</span>
              <span
                className={cn(
                  "font-mono font-medium",
                  row.color === "emerald" && "text-emerald-400",
                  row.color === "rose" && "text-rose-400",
                  row.color === "amber" && "text-amber-400",
                  row.color === "blue" && "text-primary",
                  row.color === "white" && "text-foreground text-sm"
                )}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          IPO Price per share = Post-money Equity Value ÷ Fully Diluted Shares Outstanding
        </p>
      </div>

      {/* Dilution Table */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="Fully Diluted Share Count — Option Pool Shuffle"
          sub="All share classes included to compute true per-share value (illustrative example)"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left text-muted-foreground font-medium">Share Class</th>
                <th className="py-2 text-right text-muted-foreground font-medium">Shares</th>
                <th className="py-2 text-right text-muted-foreground font-medium">% Fully Diluted</th>
              </tr>
            </thead>
            <tbody>
              {dilutionTable.map((row, i) => (
                <tr key={row.type} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-foreground/[0.02]" : "")}>
                  <td className="py-2 pr-4 text-muted-foreground">{row.type}</td>
                  <td className="py-2 text-right font-mono text-muted-foreground">{row.shares.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono text-muted-foreground">{row.pct.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="border-t border-border bg-foreground/5">
                <td className="py-2 pr-4 text-foreground font-medium">Total Fully Diluted</td>
                <td className="py-2 text-right font-mono text-foreground font-medium">{totalShares.toLocaleString()}</td>
                <td className="py-2 text-right font-mono text-foreground font-medium">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-900/10 p-3">
          <p className="text-xs text-amber-300 font-medium mb-1">Option Pool Shuffle Mechanic</p>
          <p className="text-xs text-muted-foreground">
            VCs require an unissued option pool (typically 10–15% post-financing) to be created{" "}
            <em>before</em> valuation is set. This dilutes founders on a pre-money basis. A{" "}
            $100M pre-money with 10% option pool = founders give up 10% of value before any VC
            dilution. Founders should negotiate pool sizing: only allocate what is genuinely needed
            for the next 12–18 months of hiring.
          </p>
        </div>
      </div>

      {/* IPO Discount Rationale */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="IPO Discount Rationale — Four Theories"
          sub="Why is the IPO price set below intrinsic value? Four competing explanations"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ipoDiscountFactors.map((f) => {
            const Icon = f.icon;
            const colorMap: Record<string, string> = {
              amber: "text-amber-400",
              blue: "text-primary",
              emerald: "text-emerald-400",
              violet: "text-primary",
            };
            return (
              <div key={f.title} className="rounded-lg border border-border bg-foreground/[0.03] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("w-4 h-4", colorMap[f.color])} />
                  <span className="text-xs font-medium text-foreground">{f.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filing Process */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="SEC S-1 Registration & JOBS Act Confidential Filing" sub="IPO regulatory process overview" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Traditional S-1 Filing Timeline</p>
            <div className="space-y-2">
              {[
                { step: "1", label: "Draft S-1 preparation", time: "8–16 weeks", note: "Audited financials, risk factors, MD&A" },
                { step: "2", label: "File S-1 with SEC", time: "Public filing day", note: "Immediately public; analysts can begin research" },
                { step: "3", label: "SEC review / comments", time: "4–6 weeks", note: "Back-and-forth comment letters (EDGAR)" },
                { step: "4", label: "Roadshow begins", time: "2 weeks", note: "Amended S-1 with price range filed" },
                { step: "5", label: "Pricing night", time: "Day before trading", note: "Final S-1 (424B4) filed" },
                { step: "6", label: "Trading commences", time: "IPO day", note: "Stabilization period begins" },
              ].map((s) => (
                <div key={s.step} className="flex gap-3 text-xs text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <span className="text-foreground font-medium">{s.label}</span>
                    <span className="text-muted-foreground ml-2">({s.time})</span>
                    <p className="text-muted-foreground">{s.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">JOBS Act (2012) — Confidential Filing</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Emerging Growth Companies (EGCs) with &lt;$1.07B revenue may file a draft S-1 confidentially with the SEC.</p>
              <div className="space-y-2 mt-3">
                {[
                  { icon: CheckCircle, color: "emerald", text: "Not publicly visible until 15 days before roadshow" },
                  { icon: CheckCircle, color: "emerald", text: "Allows SEC comment resolution before competitor awareness" },
                  { icon: CheckCircle, color: "emerald", text: "Company can withdraw if market conditions deteriorate" },
                  { icon: CheckCircle, color: "emerald", text: "Test-the-waters meetings with QIBs allowed pre-filing" },
                  { icon: AlertTriangle, color: "amber", text: "EGC status ends after 5 fiscal years post-IPO or when revenue exceeds $1.07B" },
                  { icon: Info, color: "blue", text: "Valuation filing range disclosed in roadshow amendment (Amendment No. 1 to S-1)" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  const colorMap: Record<string, string> = {
                    emerald: "text-emerald-400",
                    amber: "text-amber-400",
                    blue: "text-primary",
                  };
                  return (
                    <div key={i} className="flex gap-2">
                      <Icon className={cn("w-3 h-3 mt-0.5 flex-shrink-0", colorMap[item.color])} />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — BOOKBUILDING & PRICING
// ═══════════════════════════════════════════════════════════════════════════════

function BookbuildingTab() {
  // Roadshow cities with x,y for SVG timeline
  const roadshowStops = [
    { city: "HQ\n(Kickoff)", day: "Day 1", x: 60, y: 70, color: "#3b82f6" },
    { city: "New York", day: "Day 2–4", x: 160, y: 40, color: "#8b5cf6" },
    { city: "Boston", day: "Day 5–6", x: 240, y: 70, color: "#8b5cf6" },
    { city: "San Francisco", day: "Day 7–9", x: 320, y: 40, color: "#8b5cf6" },
    { city: "London", day: "Day 10–12", x: 410, y: 70, color: "#f59e0b" },
    { city: "Pricing\nNight", day: "Day 13–14", x: 500, y: 40, color: "#10b981" },
  ];

  const orderTypes = [
    {
      type: "Strike Bid",
      investor: "Aggressive institutional",
      desc: "Will buy at any price up to the final IPO price. Gets highest allocation priority.",
      color: "emerald",
    },
    {
      type: "Limit Order (Price Sensitive)",
      investor: "Value-oriented institution",
      desc: "Buy only up to specified price. Dropped from book if IPO prices above limit.",
      color: "blue",
    },
    {
      type: "Indication of Interest (IOI)",
      investor: "Early-stage signal",
      desc: "Non-binding expression of interest. Helps underwriter gauge demand levels during roadshow.",
      color: "violet",
    },
    {
      type: "Pass / No Order",
      investor: "Uninterested account",
      desc: "No participation. Often price-sensitive investors or those with sector restrictions.",
      color: "zinc",
    },
  ];

  const allocationPriority = [
    { rank: 1, type: "Long-only institutional (strike bids)", alloc: "60–70%", note: "Sovereign, pension, mutual fund" },
    { rank: 2, type: "Hedge funds (long bias)", alloc: "15–25%", note: "Less preferred: more flipping risk" },
    { rank: 3, type: "Retail / HNW via brokerage", alloc: "5–10%", note: "Typically sub-scale, last priority" },
    { rank: 4, type: "Crossover / growth equity funds", alloc: "5–10%", note: "Often already pre-IPO holders" },
  ];

  const greenshoeSteps = [
    { step: "Underwriter sells 115% of target IPO shares to investors" },
    { step: "15% over-allotment creates a 'short position' on the syndicate desk" },
    { step: "If stock trades below IPO price: buy in open market to support price (cover short)" },
    { step: "If stock trades above IPO price: exercise greenshoe option to issue 15% more shares" },
    { step: "Net effect: price stabilized below; additional proceeds captured above" },
  ];

  const listingReqs = [
    {
      exchange: "NYSE",
      minMktCap: "$200M",
      minFloat: "$100M",
      minShareholders: "400 round-lot",
      earningsTest: "$10M pretax income (last 2 of 3 yrs)",
      color: "blue",
    },
    {
      exchange: "NASDAQ Global Select",
      minMktCap: "$550M",
      minFloat: "$110M",
      minShareholders: "450 round-lot",
      earningsTest: "$11M aggregate last 3 yrs",
      color: "violet",
    },
  ];

  const dualClassExamples = [
    { company: "Alphabet (Google)", classA: "1 vote", classB: "10 votes (founders)", classC: "0 votes (public)" },
    { company: "Meta Platforms", classA: "1 vote", classB: "10 votes (Zuckerberg)", classC: "N/A" },
    { company: "Snap Inc.", classA: "1 vote", classB: "10 votes", classC: "0 votes (public only)" },
  ];

  const W = 580;
  const H = 130;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Roadshow Duration" value="2 Weeks" sub="Typical; up to 3 for mega-IPOs" />
        <StatCard label="Hot IPO Oversubscription" value="10–30×" sub="Oversubscription multiple" highlight="pos" />
        <StatCard label="Gross Spread" value="7%" sub="Underwriter fee on IPO proceeds" highlight="neutral" />
        <StatCard label="Greenshoe Option" value="15%" sub="Over-allotment of IPO shares" highlight="pos" />
      </div>

      {/* Roadshow Timeline SVG */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="IPO Roadshow Timeline — 2-Week Global Marketing Tour"
          sub="Management presents to 60–100 institutional investors across major financial centers"
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 130 }}>
          {/* Connecting line */}
          <path
            d={roadshowStops.map((s, i) => `${i === 0 ? "M" : "L"}${s.x},${s.y}`).join(" ")}
            fill="none"
            stroke="#3f3f46"
            strokeWidth={2}
            strokeDasharray="5,3"
          />
          {/* Dots and labels */}
          {roadshowStops.map((stop, i) => {
            const lines = stop.city.split("\n");
            return (
              <g key={i}>
                <circle cx={stop.x} cy={stop.y} r={8} fill={stop.color} opacity={0.9} />
                <circle cx={stop.x} cy={stop.y} r={12} fill={stop.color} opacity={0.15} />
                {lines.map((line, li) => (
                  <text
                    key={li}
                    x={stop.x}
                    y={stop.y + 22 + li * 11}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#d4d4d8"
                  >
                    {line}
                  </text>
                ))}
                <text x={stop.x} y={stop.y - 16} textAnchor="middle" fontSize={8} fill="#71717a">
                  {stop.day}
                </text>
              </g>
            );
          })}
          {/* Arrow indicator */}
          <polygon
            points={`${W - 8},${roadshowStops[roadshowStops.length - 1].y} ${W - 16},${roadshowStops[roadshowStops.length - 1].y - 5} ${W - 16},${roadshowStops[roadshowStops.length - 1].y + 5}`}
            fill="#10b981"
          />
        </svg>
      </div>

      {/* Order types */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="Investor Order Types & Price Discovery"
          sub="How underwriters build the book and discover the clearing price"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {orderTypes.map((o) => (
            <div key={o.type} className="rounded-lg border border-border bg-foreground/[0.03] p-3">
              <div className="flex items-center gap-2 mb-1">
                <InfoPill text={o.type} color={o.color} />
              </div>
              <p className="text-xs text-muted-foreground mb-0.5">{o.investor}</p>
              <p className="text-xs text-muted-foreground">{o.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-900/10 p-3">
          <p className="text-xs text-amber-300 font-medium mb-1">Oversubscription Mechanics</p>
          <p className="text-xs text-muted-foreground">
            A hot IPO 10–30× oversubscribed means $10–30 of demand for every $1 of shares available.
            The underwriter "clears" the book at a price where supply equals demand, usually the top
            of or above the filing range. Excess demand is rationed — long-only institutional accounts
            with strong relationships receive priority allocations.
          </p>
        </div>
      </div>

      {/* Allocation priority */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="IPO Allocation Priority — Institutional vs. Retail"
          sub="Underwriters allocate strategically to maximize long-term investor relations"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left text-muted-foreground font-medium w-8">Rank</th>
                <th className="py-2 text-left text-muted-foreground font-medium">Investor Type</th>
                <th className="py-2 text-right text-muted-foreground font-medium">Typical Alloc.</th>
                <th className="py-2 text-left text-muted-foreground font-medium pl-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {allocationPriority.map((row) => (
                <tr key={row.rank} className="border-b border-border/50">
                  <td className="py-2 text-muted-foreground">{row.rank}</td>
                  <td className="py-2 pr-4 text-foreground">{row.type}</td>
                  <td className="py-2 text-right font-mono text-emerald-400">{row.alloc}</td>
                  <td className="py-2 pl-4 text-muted-foreground">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Greenshoe */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="Greenshoe / Over-Allotment Option — Price Stabilization"
          sub="30-day option allowing underwriters to buy or issue up to 15% additional shares"
        />
        <div className="space-y-2">
          {greenshoeSteps.map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-medium text-foreground flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-xs text-muted-foreground">{s.step}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-900/10 p-3">
          <p className="text-xs text-rose-300 font-medium mb-1">Penalty Bid for Flippers</p>
          <p className="text-xs text-muted-foreground">
            If IPO allocatees sell within a short period after listing (flipping), the syndicate
            manager can claw back the selling concession (typically 1–2% of proceeds) from the
            broker who placed that order. This disincentivizes flipping and rewards stable holders.
          </p>
        </div>
      </div>

      {/* Underwriter economics */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="IPO Underwriter Economics — The 7% Club" sub="Typical gross spread breakdown for US IPOs" />
        <div className="space-y-3">
          {[
            { label: "Management Fee", pct: 20, desc: "Lead left bookrunner; for S-1 drafting, valuation, SEC process", color: "bg-primary" },
            { label: "Underwriting Fee", pct: 20, desc: "Risk compensation; shared pro-rata among syndicate members", color: "bg-primary" },
            { label: "Selling Concession", pct: 60, desc: "Distributed to brokers who place allocations; can be clawed back (penalty bid)", color: "bg-amber-500" },
          ].map((row) => (
            <div key={row.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground font-medium">{row.label}</span>
                <span className="text-xs font-mono text-muted-foreground">{row.pct}% of gross spread</span>
              </div>
              <div className="h-4 rounded bg-foreground/5 overflow-hidden mb-1">
                <div className={cn("h-full rounded", row.color)} style={{ width: `${row.pct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{row.desc}</p>
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-2">
            Example: $1B IPO at 7% gross spread = $70M in underwriter fees. Lead bank takes ~$28M (management + underwriting portion).
          </p>
        </div>
      </div>

      {/* Exchange listing reqs */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="NYSE vs. NASDAQ Listing Requirements" sub="Minimum standards to list on US exchanges" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left text-muted-foreground font-medium">Requirement</th>
                <th className="py-2 text-left text-primary font-medium">NYSE</th>
                <th className="py-2 text-left text-primary font-medium">NASDAQ Global Select</th>
              </tr>
            </thead>
            <tbody>
              {(["Min. Market Cap", "Min. Float", "Min. Shareholders", "Earnings Test"] as const).map((req, i) => {
                const keys: Record<string, keyof typeof listingReqs[0]> = {
                  "Min. Market Cap": "minMktCap",
                  "Min. Float": "minFloat",
                  "Min. Shareholders": "minShareholders",
                  "Earnings Test": "earningsTest",
                };
                const k = keys[req];
                return (
                  <tr key={req} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-foreground/[0.02]" : "")}>
                    <td className="py-2 pr-4 text-muted-foreground">{req}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{listingReqs[0][k]}</td>
                    <td className="py-2 text-muted-foreground">{listingReqs[1][k]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dual-class */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Dual-Class Share Structures" sub="Founders retain voting control while selling economic interest" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left text-muted-foreground font-medium">Company</th>
                <th className="py-2 text-left text-muted-foreground font-medium">Class A (Public)</th>
                <th className="py-2 text-left text-muted-foreground font-medium">Class B (Founder)</th>
                <th className="py-2 text-left text-muted-foreground font-medium">Class C</th>
              </tr>
            </thead>
            <tbody>
              {dualClassExamples.map((row, i) => (
                <tr key={row.company} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-foreground/[0.02]" : "")}>
                  <td className="py-2 pr-4 text-foreground font-medium">{row.company}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.classA}</td>
                  <td className="py-2 pr-4 text-amber-300">{row.classB}</td>
                  <td className="py-2 text-muted-foreground">{row.classC}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          S&P 500 excludes dual-class companies from index eligibility. ISS and major institutional proxy advisors often vote against dual-class structures.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — UNDERPRICING & FIRST-DAY POP
// ═══════════════════════════════════════════════════════════════════════════════

function UnderpricingTab() {
  const [activeTheory, setActiveTheory] = useState<number | null>(null);

  // First-day return distribution (bar chart data)
  const returnBuckets = [
    { range: "< -20%", count: 4, color: "#ef4444" },
    { range: "-20 to -10%", count: 7, color: "#f97316" },
    { range: "-10 to 0%", count: 11, color: "#eab308" },
    { range: "0 to 10%", count: 19, color: "#84cc16" },
    { range: "10 to 20%", count: 23, color: "#22c55e" },
    { range: "20 to 30%", count: 18, color: "#10b981" },
    { range: "30 to 50%", count: 12, color: "#06b6d4" },
    { range: "50 to 100%", count: 7, color: "#3b82f6" },
    { range: "> 100%", count: 4, color: "#8b5cf6" },
  ];
  const maxCount = Math.max(...returnBuckets.map((b) => b.count));

  // Long-run performance data
  const longRunData = [
    { label: "1Y", ipoReturn: -8, benchReturn: 12 },
    { label: "2Y", ipoReturn: -14, benchReturn: 24 },
    { label: "3Y", ipoReturn: -20, benchReturn: 38 },
  ];

  const hotColdCycles = [
    { period: "1999–2000 (Dot-com)", type: "Hot", avgPop: "+65%", vol: "High", sector: "Internet/Tech", color: "emerald" },
    { period: "2001–2003", type: "Cold", avgPop: "+8%", vol: "Very Low", sector: "Drought", color: "rose" },
    { period: "2004–2007 (Growth)", type: "Warm", avgPop: "+12%", vol: "Moderate", sector: "Financial/Energy", color: "amber" },
    { period: "2008–2009 (GFC)", type: "Cold", avgPop: "+5%", vol: "Near Zero", sector: "Drought", color: "rose" },
    { period: "2012–2015", type: "Warm", avgPop: "+16%", vol: "Steady", sector: "Tech/Healthcare", color: "amber" },
    { period: "2020–2021 (Peak)", type: "Hot", avgPop: "+48%", vol: "Record High", sector: "EV/Crypto/SaaS", color: "emerald" },
    { period: "2022–2023", type: "Cold", avgPop: "+9%", vol: "Low", sector: "Rate hike impact", color: "rose" },
    { period: "2024–2025", type: "Recovering", avgPop: "+22%", vol: "Improving", sector: "AI/Infrastructure", color: "blue" },
  ];

  const theories = [
    {
      name: "Winner's Curse (Rock 1986)",
      color: "rose",
      icon: AlertTriangle,
      explanation:
        "In a book-built IPO, informed investors bid only on good IPOs and step back from bad ones. Uninformed investors receive disproportionately more shares in overpriced deals. To attract uninformed capital, IPOs must be underpriced on average to guarantee positive expected returns.",
      evidence: "Rock's model predicts underpricing increases with information asymmetry. Empirically confirmed: smaller IPOs with fewer analyst followers show larger first-day pops.",
    },
    {
      name: "Signaling Hypothesis (Allen & Faulhaber 1989)",
      color: "blue",
      icon: TrendingUp,
      explanation:
        "High-quality firms deliberately underprice to 'leave a good taste' — signaling quality so investors will participate in subsequent seasoned equity offerings at higher prices. Low-quality firms cannot afford to mimic this strategy.",
      evidence: "Firms that underprice more are more likely to conduct follow-on offerings within 3 years. 'Money left on table' is viewed as advertising expenditure.",
    },
    {
      name: "Lawsuit Avoidance (Tinic 1988)",
      color: "amber",
      icon: CheckCircle,
      explanation:
        "US securities laws create plaintiff-friendly class action standards. Overpriced IPOs that decline invite lawsuits under Section 11 of the Securities Act. Underpricing provides insurance against legal liability — consistent with larger discounts post-1933 Act.",
      evidence: "Non-US IPOs (less litigious jurisdictions) show systematically lower underpricing. Post-PSLRA (1995) US underpricing partially declined.",
    },
    {
      name: "Analyst Coverage (Loughran & Ritter 2004)",
      color: "violet",
      icon: BarChart3,
      explanation:
        "IPO underwriting is bundled with sell-side research coverage and trading commissions. Underwriters underprice to reward institutional clients who pay for research via soft-dollar arrangements, creating quid pro quo allocation systems.",
      evidence: "Firms with more analyst coverage post-IPO cluster around lead underwriter banks. Research initiation within 25 days (quiet period expiry) often triggers 5–15% price moves.",
    },
  ];

  // SVG chart dims
  const CW = 500;
  const CH = 160;
  const barW = 40;
  const gap = 16;
  const padL = 36;
  const padB = 36;
  const padT = 16;
  const chartH = CH - padT - padB;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Money Left on Table" value="$280B" sub="US IPOs 1980–2024" highlight="neg" />
        <StatCard label="Mean First-Day Return" value="+20%" sub="Equal-weighted average" highlight="pos" />
        <StatCard label="Median First-Day Return" value="+12%" sub="Median less skewed" highlight="pos" />
        <StatCard label="Long-Run 3-Year Return" value="−20%" sub="vs benchmark (Ritter DB)" highlight="neg" />
      </div>

      {/* First-day return distribution SVG */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="First-Day Return Distribution"
          sub="Frequency distribution of IPO first-day returns (stylized, 1980–2024 US data)"
        />
        <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full" style={{ maxHeight: 180 }}>
          {/* Gridlines */}
          {[0, 10, 20, 30].map((v) => {
            const yv = padT + chartH - (v / maxCount) * chartH;
            return (
              <g key={v}>
                <line x1={padL} x2={CW - 8} y1={yv} y2={yv} stroke="#ffffff10" strokeWidth={1} />
                <text x={padL - 4} y={yv + 4} fontSize={8} fill="#71717a" textAnchor="end">{v}</text>
              </g>
            );
          })}
          {/* Bars */}
          {returnBuckets.map((b, i) => {
            const bh = (b.count / maxCount) * chartH;
            const bx = padL + i * (barW + gap);
            const by = padT + chartH - bh;
            return (
              <g key={b.range}>
                <rect x={bx} y={by} width={barW} height={bh} fill={b.color} opacity={0.85} rx={2} />
                <text x={bx + barW / 2} y={padT + chartH + 12} textAnchor="middle" fontSize={7.5} fill="#71717a">
                  {b.range.split(" ").map((word, wi) => (
                    <tspan key={wi} x={bx + barW / 2} dy={wi === 0 ? 0 : 9}>{word}</tspan>
                  ))}
                </text>
                <text x={bx + barW / 2} y={by - 3} textAnchor="middle" fontSize={8} fill="#d4d4d8">{b.count}</text>
              </g>
            );
          })}
          {/* Mean line */}
          {(() => {
            const meanBucket = 4; // "10 to 20%" bucket (mean ~+20%)
            const mx = padL + meanBucket * (barW + gap) + barW / 2;
            return (
              <g>
                <line x1={mx} x2={mx} y1={padT} y2={padT + chartH} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3" />
                <text x={mx + 3} y={padT + 10} fontSize={8} fill="#f59e0b">mean +20%</text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Theories accordion */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="Four Theories of IPO Underpricing"
          sub="Academic literature documents $280B+ in systematic money left on table 1980–2024"
        />
        <div className="space-y-3">
          {theories.map((t, i) => {
            const Icon = t.icon;
            const isOpen = activeTheory === i;
            const colorMap: Record<string, string> = {
              rose: "text-rose-400 border-rose-500/40 bg-rose-900/10",
              blue: "text-primary border-primary/40 bg-muted/30",
              amber: "text-amber-400 border-amber-500/40 bg-amber-900/10",
              violet: "text-primary border-primary/40 bg-muted/30",
            };
            return (
              <div
                key={t.name}
                className={cn("rounded-md border p-4 cursor-pointer", colorMap[t.color])}
                onClick={() => setActiveTheory(isOpen ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", colorMap[t.color].split(" ")[0])} />
                    <span className="text-xs font-medium text-foreground">{t.name}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2 border-t border-border pt-3">
                        <p className="text-xs text-muted-foreground">{t.explanation}</p>
                        <div className="flex gap-2 mt-2">
                          <Activity className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-emerald-300">{t.evidence}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Long-run underperformance */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="Long-Run IPO Underperformance (Ritter Database)"
          sub="IPOs underperform comparable non-issuing firms by ~20% over 3 years post-listing"
        />
        <div className="grid grid-cols-3 gap-4 mb-4">
          {longRunData.map((d) => (
            <div key={d.label} className="rounded-lg border border-border bg-foreground/[0.03] p-3 text-center">
              <p className="text-xs text-muted-foreground mb-2">{d.label} Post-IPO</p>
              <div className="flex items-center justify-center gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">IPO</p>
                  <p className={cn("text-lg font-medium", d.ipoReturn < 0 ? "text-rose-400" : "text-emerald-400")}>
                    {d.ipoReturn > 0 ? "+" : ""}{d.ipoReturn}%
                  </p>
                </div>
                <span className="text-muted-foreground text-xs">vs</span>
                <div>
                  <p className="text-xs text-muted-foreground">Bench</p>
                  <p className="text-lg font-medium text-emerald-400">+{d.benchReturn}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Jay Ritter (University of Florida) documents that firms going public in hot markets show
            the worst long-run performance. Explanations: windows-of-opportunity hypothesis (firms
            issue when overvalued), managerial hubris, earnings management pre-IPO, and winner&apos;s
            curse in reverse (retail holds while institutions flip).
          </p>
        </div>
      </div>

      {/* Institutional flipping */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Institutional Flipping vs. Retail Holding" sub="Asymmetric behavior between investor types on IPO day" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium text-primary mb-2">Institutional Investors — Early Flip</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {[
                "Receive outsized IPO allocations (50–70% of deal)",
                "Often flip 25–50% of position in first few days of trading",
                "Lock in guaranteed first-day pop profit immediately",
                "Face 'penalty bid' risk: broker claw-back if caught",
                "Sophisticated: track IPO price performance vs expectations",
              ].map((t, i) => (
                <li key={i} className="flex gap-2"><ArrowRight className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-900/10 p-4">
            <p className="text-xs font-medium text-amber-300 mb-2">Retail Investors — Long Hold</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {[
                "Receive minimal allocation (5–10% of deal total)",
                "Often buy in aftermarket at inflated first-day prices",
                "Behavioral: excitement bias, anchoring to IPO price",
                "Less information: less equipped to assess fair value",
                "Disproportionate holders of 3-year underperformers",
              ].map((t, i) => (
                <li key={i} className="flex gap-2"><ArrowRight className="w-3 h-3 mt-0.5 text-amber-400 flex-shrink-0" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Hot vs cold cycles */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="Hot vs. Cold IPO Market Cycles"
          sub="IPO activity is highly cyclical; sector-specific underpricing varies significantly"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left text-muted-foreground font-medium">Period</th>
                <th className="py-2 text-left text-muted-foreground font-medium">Market</th>
                <th className="py-2 text-right text-muted-foreground font-medium">Avg. 1st Day</th>
                <th className="py-2 text-left text-muted-foreground font-medium pl-4">Volume</th>
                <th className="py-2 text-left text-muted-foreground font-medium">Notable</th>
              </tr>
            </thead>
            <tbody>
              {hotColdCycles.map((row, i) => (
                <tr key={row.period} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-foreground/[0.02]" : "")}>
                  <td className="py-2 pr-3 text-muted-foreground">{row.period}</td>
                  <td className="py-2 pr-3">
                    <InfoPill
                      text={row.type}
                      color={row.color === "emerald" ? "emerald" : row.color === "rose" ? "rose" : row.color === "amber" ? "amber" : "blue"}
                    />
                  </td>
                  <td className={cn("py-2 text-right font-mono", row.type === "Cold" ? "text-rose-400" : "text-emerald-400")}>{row.avgPop}</td>
                  <td className="py-2 pl-4 text-muted-foreground">{row.vol}</td>
                  <td className="py-2 text-muted-foreground">{row.sector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-lg border border-sky-500/30 bg-sky-900/10 p-3">
          <p className="text-xs text-sky-300 font-medium mb-1">Sector Underpricing Hierarchy</p>
          <p className="text-xs text-muted-foreground">
            Technology IPOs historically show the highest average underpricing (~30–35%), followed by
            biotech/healthcare (~25%), fintech (~20%), and consumer/industrial (~10–15%). High
            information asymmetry and growth optionality explain tech&apos;s premium discount.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — POST-IPO DYNAMICS
// ═══════════════════════════════════════════════════════════════════════════════

function PostIPOTab() {
  const lockupTimeline = [
    { day: 0, event: "IPO Day", desc: "Shares begin trading; only float shares tradeable", color: "#3b82f6" },
    { day: 25, event: "Quiet Period Ends", desc: "Underwriter analysts initiate coverage (typically with Buy rating)", color: "#8b5cf6" },
    { day: 40, event: "40-Day Lockup (Some)", desc: "Shorter lockup for certain selling shareholders (negotiated)", color: "#f59e0b" },
    { day: 90, event: "90-Day Stabilization", desc: "Greenshoe option expires; stabilization activities cease", color: "#22c55e" },
    { day: 180, event: "180-Day Lockup Expiry", desc: "Primary lockup expires; insiders/VCs may sell freely", color: "#ef4444" },
    { day: 270, event: "Secondary Offering Window", desc: "Follow-on offering often priced 6–12 months post-IPO", color: "#10b981" },
  ];

  const directListingVsIPO = [
    { attr: "Primary capital raised", traditional: "Yes (new shares)", direct: "No (existing shares only)", spac: "Via PIPE / trust" },
    { attr: "Underwriter role", traditional: "Bookbuilder + stabilizer", direct: "Financial advisor only", spac: "Sponsor + target team" },
    { attr: "Underwriting fee", traditional: "5–7% of proceeds", direct: "0–1% advisory", spac: "Founder shares (20%)" },
    { attr: "Lockup period", traditional: "180 days", direct: "Negotiated (shorter)", spac: "180 days post-merger" },
    { attr: "First-day price mechanism", traditional: "IPO fixed price", direct: "Opening auction (market)", spac: "Redemption at $10" },
    { attr: "Notable examples", traditional: "Most IPOs", direct: "Spotify, Palantir, Coinbase", spac: "DraftKings, Opendoor" },
    { attr: "Best for", traditional: "Capital needs + marketing", direct: "Brand recognition + no dilution", spac: "Speed + certainty" },
  ];

  const analystTargets = [
    { company: "Rivian (RIVN)", ipoPrice: 78, initTarget: 135, actual12m: 19, beat: false },
    { company: "Coinbase (COIN)", ipoPrice: 381, initTarget: 420, actual12m: 52, beat: false },
    { company: "Snowflake (SNOW)", ipoPrice: 120, initTarget: 185, actual12m: 290, beat: true },
    { company: "Duolingo (DUOL)", ipoPrice: 102, initTarget: 155, actual12m: 143, beat: false },
    { company: "Robinhood (HOOD)", ipoPrice: 38, initTarget: 65, actual12m: 11, beat: false },
  ];

  const dutchAuctionLesson = {
    title: "Google's Dutch Auction IPO (2004) — A Cautionary Tale",
    points: [
      "Google filed for IPO using a modified Dutch auction to democratize access and avoid underpricing",
      "Bidders submitted price/quantity pairs; clearing price set where supply met demand",
      "Target range: $108–$135 per share; final price set at $85 (uncertainty + bidder caution)",
      "First-day close: $100.34 (+18%) — still underpriced despite 'scientific' mechanism",
      "Lesson: Dutch auctions reduce but do not eliminate underpricing; information problems persist",
      "No major US IPO has used Dutch auction since; banks prefer bookbuilding control",
    ],
  };

  const LW = 560;
  const LH = 100;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Standard Lockup" value="180 Days" sub="Primary insider lockup period" />
        <StatCard label="Quiet Period" value="25 Days" sub="Until analyst coverage initiates" />
        <StatCard label="Follow-on Window" value="6–12 Months" sub="Typical secondary offering timing" highlight="neutral" />
        <StatCard label="Lockup Selling Pressure" value="−5 to −15%" sub="Avg. return around lockup expiry" highlight="neg" />
      </div>

      {/* Lockup Timeline SVG */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="Post-IPO Event Timeline — 180-Day Lockup Cliff"
          sub="Key milestones in the first year of trading"
        />
        <svg viewBox={`0 0 ${LW} ${LH}`} className="w-full" style={{ maxHeight: 110 }}>
          {/* Base line */}
          <line x1={30} x2={LW - 10} y1={50} y2={50} stroke="#3f3f46" strokeWidth={2} />
          {lockupTimeline.map((ev, i) => {
            const maxDay = 270;
            const x = 30 + (ev.day / maxDay) * (LW - 40);
            const isTop = i % 2 === 0;
            return (
              <g key={ev.day}>
                <circle cx={x} cy={50} r={6} fill={ev.color} />
                <line x1={x} x2={x} y1={isTop ? 44 : 56} y2={isTop ? 20 : 80} stroke={ev.color} strokeWidth={1} strokeDasharray="3,2" />
                <text x={x} y={isTop ? 15 : 90} textAnchor="middle" fontSize={8} fill={ev.color}>
                  {ev.event}
                </text>
                <text x={x} y={isTop ? 8 : 98} textAnchor="middle" fontSize={7} fill="#52525b">
                  Day {ev.day}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {lockupTimeline.map((ev) => (
            <div key={ev.day} className="flex gap-3 text-xs text-muted-foreground">
              <div className="w-12 flex-shrink-0 font-mono text-muted-foreground">D+{ev.day}</div>
              <div>
                <span className="text-foreground font-medium">{ev.event}</span>
                <p className="text-muted-foreground">{ev.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lockup waiver & short interest */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Lockup Mechanics, Waivers & Short Interest Buildup" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border/50 bg-foreground/[0.03] p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Lockup Waiver Triggers</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {[
                "Underwriter discretion: waive for strategic secondary",
                "Stock price performance milestones",
                "M&A transaction requirement (stock consideration)",
                "Hardship cases: medical, estate, divorce",
              ].map((t, i) => <li key={i} className="flex gap-1.5"><span className="text-muted-foreground mt-0.5">•</span>{t}</li>)}
            </ul>
          </div>
          <div className="rounded-lg border border-rose-700/40 bg-rose-900/10 p-3">
            <p className="text-xs font-medium text-rose-300 mb-2">Short Interest Dynamics</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {[
                "Short float often 5–15% pre-lockup expiry",
                "Shorts anticipate lockup selling pressure",
                "Short squeeze risk if lockup selling disappoints",
                "CTB (cost-to-borrow) spikes near expiry date",
              ].map((t, i) => <li key={i} className="flex gap-1.5"><span className="text-rose-600 mt-0.5">•</span>{t}</li>)}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-primary mb-2">Block Trade Mechanics</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {[
                "Large insider sales via block trades (not open market)",
                "Underwriter acts as principal buyer, resells to institutions",
                "Discount: 3–7% to last sale price; overnight risk borne by bank",
                "VWAP accelerated bookbuild: 1–4 hours to place",
              ].map((t, i) => <li key={i} className="flex gap-1.5"><span className="text-primary mt-0.5">•</span>{t}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Direct listing vs IPO vs SPAC comparison */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="Traditional IPO vs. Direct Listing vs. SPAC — Comparison"
          sub="Three routes to public market liquidity; each with distinct trade-offs"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left text-muted-foreground font-medium">Feature</th>
                <th className="py-2 text-left text-primary font-medium">Traditional IPO</th>
                <th className="py-2 text-left text-emerald-400 font-medium">Direct Listing</th>
                <th className="py-2 text-left text-amber-400 font-medium">SPAC Merger</th>
              </tr>
            </thead>
            <tbody>
              {directListingVsIPO.map((row, i) => (
                <tr key={row.attr} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-foreground/[0.02]" : "")}>
                  <td className="py-2 pr-4 text-muted-foreground font-medium">{row.attr}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.traditional}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.direct}</td>
                  <td className="py-2 text-muted-foreground">{row.spac}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Dutch Auction */}
      <div className="rounded-md border border-amber-500/30 bg-amber-900/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-medium text-amber-300">{dutchAuctionLesson.title}</h3>
        </div>
        <div className="space-y-1.5">
          {dutchAuctionLesson.points.map((p, i) => (
            <div key={i} className="flex gap-2 text-xs text-muted-foreground">
              <span className="text-amber-600 flex-shrink-0 mt-0.5">{i + 1}.</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analyst coverage */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="Research Initiation & Analyst Target vs. IPO Price"
          sub="Quiet period ends Day 25; MiFID II unbundling has reduced sell-side initiation in Europe"
        />
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left text-muted-foreground font-medium">Company</th>
                <th className="py-2 text-right text-muted-foreground font-medium">IPO Price</th>
                <th className="py-2 text-right text-muted-foreground font-medium">Init. Target</th>
                <th className="py-2 text-right text-muted-foreground font-medium">12M Actual</th>
                <th className="py-2 text-right text-muted-foreground font-medium">Beat Target?</th>
              </tr>
            </thead>
            <tbody>
              {analystTargets.map((row, i) => (
                <tr key={row.company} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-foreground/[0.02]" : "")}>
                  <td className="py-2 pr-4 text-foreground font-medium">{row.company}</td>
                  <td className="py-2 pr-4 text-right font-mono text-muted-foreground">${row.ipoPrice}</td>
                  <td className="py-2 pr-4 text-right font-mono text-primary">${row.initTarget}</td>
                  <td className={cn("py-2 pr-4 text-right font-mono", row.actual12m < row.ipoPrice ? "text-rose-400" : "text-emerald-400")}>
                    ${row.actual12m}
                  </td>
                  <td className="py-2 text-right">
                    {row.beat ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-primary font-medium mb-1">MiFID II Impact on Research (Europe)</p>
          <p className="text-xs text-muted-foreground">
            EU MiFID II (2018) required asset managers to pay explicitly for research (unbundling from
            trading commissions). Result: 30–40% decline in small-cap analyst coverage in Europe.
            US SEC issued relief letters but debate continues. Reduced analyst coverage = higher
            information asymmetry = potentially more IPO underpricing for less-covered issuers.
          </p>
        </div>
      </div>

      {/* Secondary offering */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Secondary Offerings & Follow-On Mechanics" sub="Post-IPO capital raises and insider liquidity events" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Types of Follow-On Offerings</p>
            <div className="space-y-2">
              {[
                {
                  type: "Primary (Dilutive)",
                  color: "rose",
                  desc: "Company issues new shares. Proceeds go to company. Dilutes existing holders.",
                },
                {
                  type: "Secondary (Non-Dilutive)",
                  color: "blue",
                  desc: "Existing shareholders sell. Proceeds go to sellers. No dilution to company.",
                },
                {
                  type: "Mixed Offering",
                  color: "violet",
                  desc: "Combination of primary and secondary. Common in 6–12 month follow-ons.",
                },
                {
                  type: "ATM (At-the-Market)",
                  color: "emerald",
                  desc: "Continuous offering at market price. No roadshow; lower fees (~2%).",
                },
              ].map((o) => (
                <div key={o.type} className="flex gap-2">
                  <InfoPill text={o.type} color={o.color} />
                  <p className="text-xs text-muted-foreground">{o.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Shelf Registration (S-3 / F-3)</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {[
                "File once, sell repeatedly over 3-year window without new registration",
                "Eligibility: must be public for 12+ months with timely reporting history",
                "WKSI (Well-Known Seasoned Issuers): $700M+ public float — automatic effectiveness",
                "Accelerated bookbuild: 4–24 hours from announcement to pricing",
                "Typical follow-on discount: 3–5% to last close price",
                "Lock-up agreements for new follow-on: 30–60 days for remaining insiders",
              ].map((t, i) => (
                <div key={i} className="flex gap-2">
                  <ArrowRight className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function IPOPricingPage() {
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
            <div className="w-10 h-10 rounded-md bg-primary/20 border border-border flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">IPO Pricing & Aftermarket</h1>
              <p className="text-sm text-muted-foreground">
                Valuation, bookbuilding, underpricing, lockup dynamics, and alternative listing mechanisms
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: "DCF & Comps", icon: BarChart2, color: "text-primary" },
              { label: "Bookbuilding", icon: Layers, color: "text-primary" },
              { label: "First-Day Pop", icon: TrendingUp, color: "text-emerald-400" },
              { label: "Lockup Expiry", icon: Clock, color: "text-amber-400" },
              { label: "Direct Listings", icon: Activity, color: "text-sky-400" },
              { label: "S-1 Filing", icon: Calendar, color: "text-rose-400" },
            ].map(({ label, icon: Icon, color }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1"
              >
                <Icon className={cn("w-3 h-3", color)} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero */}
        <div className="rounded-md border border-border bg-card border-l-4 border-l-primary p-6">
          <h2 className="text-lg font-medium text-foreground mb-1">IPO Pricing Deep Dive</h2>
          <p className="text-sm text-muted-foreground">Valuation methods, bookbuilding mechanics, underpricing dynamics, and post-IPO lockup analysis.</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="valuation" className="mt-8">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-card border border-border">
            <TabsTrigger value="valuation" className="text-xs text-muted-foreground">
              Valuation Methods
            </TabsTrigger>
            <TabsTrigger value="bookbuilding" className="text-xs text-muted-foreground">
              Bookbuilding
            </TabsTrigger>
            <TabsTrigger value="underpricing" className="text-xs text-muted-foreground">
              Underpricing
            </TabsTrigger>
            <TabsTrigger value="postipo" className="text-xs text-muted-foreground">
              Post-IPO
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="valuation" className="data-[state=inactive]:hidden">
              <motion.div
                key="valuation"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <ValuationMethodsTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="bookbuilding" className="data-[state=inactive]:hidden">
              <motion.div
                key="bookbuilding"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <BookbuildingTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="underpricing" className="data-[state=inactive]:hidden">
              <motion.div
                key="underpricing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <UnderpricingTab />
              </motion.div>
            </TabsContent>

            <TabsContent value="postipo" className="data-[state=inactive]:hidden">
              <motion.div
                key="postipo"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <PostIPOTab />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
