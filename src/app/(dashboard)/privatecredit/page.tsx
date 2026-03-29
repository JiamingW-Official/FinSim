"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingDown,
  BarChart3,
  Layers,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 930;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const RAND_POOL: number[] = [];
for (let i = 0; i < 300; i++) RAND_POOL.push(rand());
let randIdx = 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _r = () => RAND_POOL[randIdx++ % RAND_POOL.length];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtB(n: number): string {
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}T`;
  if (Math.abs(n) >= 1) return `$${n.toFixed(1)}B`;
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
      : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-muted/30 p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-xl font-semibold", valClass)}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ── SectionHeading ────────────────────────────────────────────────────────────

function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
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
// TAB 1 — DIRECT LENDING
// ═══════════════════════════════════════════════════════════════════════════════

function DirectLendingTab() {
  const bankShare = [
    { year: 2007, pct: 72 },
    { year: 2009, pct: 61 },
    { year: 2011, pct: 52 },
    { year: 2013, pct: 44 },
    { year: 2015, pct: 39 },
    { year: 2017, pct: 34 },
    { year: 2019, pct: 30 },
    { year: 2021, pct: 26 },
    { year: 2023, pct: 22 },
  ];

  const leverageBars = [
    { label: "Senior / 1st Lien", low: 5.0, high: 7.0, color: "bg-primary" },
    { label: "Unitranche", low: 5.5, high: 7.5, color: "bg-primary" },
    { label: "Total (incl. Mezz)", low: 6.0, high: 8.0, color: "bg-amber-500" },
  ];

  const lenders = [
    { name: "Ares Capital", aum: 420, focus: "Broad middle market" },
    { name: "Blue Owl Credit", aum: 175, focus: "Software / tech-enabled" },
    { name: "HPS Investment Partners", aum: 148, focus: "Upper middle market" },
    { name: "Golub Capital", aum: 72, focus: "Sponsor-backed loans" },
    { name: "Monroe Capital", aum: 18, focus: "Lower middle market" },
  ];

  const bdcVsPrivate = [
    { attr: "Investor base", bdc: "Retail + institutional", pvt: "Institutional / QPs only" },
    { attr: "Liquidity", bdc: "Exchange-traded (daily)", pvt: "Quarterly / semi-annual" },
    { attr: "Leverage limit", bdc: "1:1 debt/equity (150%)", pvt: "No statutory limit" },
    { attr: "Reporting", bdc: "SEC public filings", pvt: "LP reporting only" },
    { attr: "Fee structure", bdc: "Mgmt 1.5% + 20% incentive", pvt: "Mgmt 1.5% + 20% carry" },
    { attr: "Diversification", bdc: "70% qualifying assets rule", pvt: "Flexible (fund docs)" },
  ];

  const unitranche = [
    { attr: "Complexity", uni: "Single lender / tranche", fl: "Two separate tranches" },
    { attr: "Spread", uni: "SOFR + 550–700bps", fl: "1L: +400–500 / 2L: +700–900" },
    { attr: "Closing speed", uni: "2–4 weeks", fl: "4–8 weeks" },
    { attr: "Covenant package", uni: "Maintenance + incurrence", fl: "Incurrence-only typical" },
    { attr: "PIK option", uni: "Yes (partial)", fl: "2L often PIK-toggle" },
    { attr: "Borrower preference", uni: "Certainty of execution", fl: "Lower all-in cost" },
  ];

  const lenderTerms = [
    { term: "MFN (Most Favored Nation)", desc: "If borrower raises cheaper debt from another lender, existing lender gets the same pricing.", color: "emerald" },
    { term: "PIK Toggle", desc: "Borrower can elect to pay interest in-kind (additional debt) rather than cash, preserving liquidity.", color: "amber" },
    { term: "Warrants", desc: "Option to purchase equity at a set price, giving the lender upside participation beyond interest income.", color: "violet" },
    { term: "Equity Kickers", desc: "Small equity stake (1–5%) provided alongside debt, boosting total IRR to lender if exit is strong.", color: "blue" },
    { term: "Maintenance Covenants", desc: "Borrower must maintain leverage and coverage ratios tested quarterly — unlike cov-lite broadly syndicated loans.", color: "rose" },
    { term: "EBITDA Definition Control", desc: "Lender negotiates limited add-backs to EBITDA, preventing artificial covenant headroom.", color: "zinc" },
  ];

  // SVG — bank share decline
  const W = 480;
  const H = 148;
  const pL = 36;
  const pR = 12;
  const pT = 14;
  const pB = 28;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const xS = (i: number) => pL + (i / (bankShare.length - 1)) * cW;
  const yS = (pct: number) => pT + cH - (pct / 100) * cH;

  const bankPath = bankShare
    .map((d, i) => `${i === 0 ? "M" : "L"}${xS(i).toFixed(1)},${yS(d.pct).toFixed(1)}`)
    .join(" ");
  const privPts = bankShare.map((d, i) => ({ x: xS(i), y: yS(100 - d.pct) }));
  const privLine = privPts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const privFill = `${privLine} L${xS(bankShare.length - 1).toFixed(1)},${(pT + cH).toFixed(1)} L${xS(0).toFixed(1)},${(pT + cH).toFixed(1)} Z`;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Global AUM" value="$1.7T" sub="Private credit 2024" highlight="pos" />
        <StatCard label="Typical Spread" value="SOFR+500–700" sub="bps all-in" />
        <StatCard label="Average Lien" value="1st Lien / Unitranche" sub="~80% of deals" />
        <StatCard label="EBITDA Leverage" value="5–8×" sub="Senior to total" />
      </div>

      {/* Financing gap */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="Middle Market Financing Gap — Bank Retreat Post-GFC"
          sub="Banks' share of middle market lending vs private credit (2007–2023)"
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 160 }}>
          {[0, 25, 50, 75, 100].map((pct) => (
            <line key={pct} x1={pL} x2={W - pR} y1={yS(pct)} y2={yS(pct)} stroke="#ffffff18" strokeWidth={1} />
          ))}
          <path d={privFill} fill="rgba(139,92,246,0.2)" />
          <path d={privLine} fill="none" stroke="#8b5cf6" strokeWidth={2.5} strokeLinejoin="round" />
          <path d={bankPath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5,3" strokeLinejoin="round" />
          {[0, 50, 100].map((pct) => (
            <text key={pct} x={pL - 4} y={yS(pct) + 4} fontSize={9} fill="#71717a" textAnchor="end">{pct}%</text>
          ))}
          {bankShare.filter((_, i) => i % 2 === 0).map((d) => {
            const idx = bankShare.findIndex((b) => b.year === d.year);
            return <text key={d.year} x={xS(idx)} y={H - 6} fontSize={9} fill="#71717a" textAnchor="middle">{d.year}</text>;
          })}
          <rect x={pL} y={pT} width={10} height={3} fill="#8b5cf6" rx={1} />
          <text x={pL + 13} y={pT + 4} fontSize={9} fill="#a78bfa">Private Credit</text>
          <line x1={pL + 90} x2={pL + 100} y1={pT + 2} y2={pT + 2} stroke="#3b82f6" strokeWidth={2} strokeDasharray="4,2" />
          <text x={pL + 103} y={pT + 4} fontSize={9} fill="#93c5fd">Banks</text>
        </svg>
      </div>

      {/* Leverage bars */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="EBITDA Leverage Multiples by Tranche Type"
          sub="Typical range for sponsor-backed middle market deals"
        />
        <div className="space-y-4">
          {leverageBars.map((bar) => {
            const leftPct = (bar.low / 10) * 100;
            const widthPct = ((bar.high - bar.low) / 10) * 100;
            return (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">{bar.label}</span>
                  <span className="text-xs text-muted-foreground">{bar.low}× – {bar.high}×</span>
                </div>
                <div className="relative h-5 rounded bg-foreground/5">
                  <div
                    className={cn("absolute h-full rounded", bar.color)}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%`, opacity: 0.8 }}
                  />
                  <div className="absolute top-0 h-full border-l border-foreground/30" style={{ left: "50%" }} />
                  <span className="absolute top-0.5 text-[11px] text-muted-foreground" style={{ left: "50.5%" }}>5×</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BDC vs Private Fund */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="BDC vs. Private Credit Fund Structure" sub="Key structural differences for investors" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left text-muted-foreground font-medium w-32">Feature</th>
                <th className="py-2 text-left text-primary font-medium">BDC (Publicly Traded)</th>
                <th className="py-2 text-left text-primary font-medium">Private Credit Fund</th>
              </tr>
            </thead>
            <tbody>
              {bdcVsPrivate.map((row, i) => (
                <tr key={row.attr} className={cn("border-b border-border/20", i % 2 === 0 ? "bg-foreground/[0.02]" : "")}>
                  <td className="py-2 pr-4 text-muted-foreground font-medium">{row.attr}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.bdc}</td>
                  <td className="py-2 text-muted-foreground">{row.pvt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unitranche vs 1L/2L */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Unitranche vs. First Lien / Second Lien Split" sub="Structural trade-offs in deal architecture" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left text-muted-foreground font-medium w-32">Attribute</th>
                <th className="py-2 text-left text-amber-400 font-medium">Unitranche</th>
                <th className="py-2 text-left text-muted-foreground font-medium">1L / 2L Split</th>
              </tr>
            </thead>
            <tbody>
              {unitranche.map((row, i) => (
                <tr key={row.attr} className={cn("border-b border-border/20", i % 2 === 0 ? "bg-foreground/[0.02]" : "")}>
                  <td className="py-2 pr-4 text-muted-foreground font-medium">{row.attr}</td>
                  <td className="py-2 pr-4 text-amber-300">{row.uni}</td>
                  <td className="py-2 text-muted-foreground">{row.fl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lender-friendly terms */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Lender-Friendly Terms & Protections" sub="Common provisions in private credit documentation" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lenderTerms.map((item) => (
            <div key={item.term} className="rounded-lg border border-border/20 bg-foreground/[0.03] p-3">
              <InfoPill text={item.term} color={item.color} />
              <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top lenders */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Leading Direct Lenders" sub="Top platforms by AUM (approximate, 2024)" />
        <div className="space-y-3">
          {lenders.map((l, i) => (
            <div key={l.name} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{l.name}</span>
                  <span className="text-xs text-muted-foreground">{fmtB(l.aum)}</span>
                </div>
                <div className="relative h-2 rounded bg-foreground/5">
                  <div className="h-full rounded bg-primary" style={{ width: `${(l.aum / 450) * 100}%`, opacity: 0.7 }} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{l.focus}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — MEZZANINE & SPECIAL SITUATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function MezzanineTab() {
  const [selected, setSelected] = useState<number | null>(null);

  const capitalLayers = [
    { label: "Senior Secured (1L)", spread: "SOFR+400–500", color: "#3b82f6", risk: "Lowest", ht: 50 },
    { label: "Senior Secured (2L)", spread: "SOFR+700–900", color: "#8b5cf6", risk: "Low-Medium", ht: 42 },
    { label: "Mezzanine Debt", spread: "SOFR+900–1100 + PIK", color: "#f59e0b", risk: "Medium-High", ht: 38 },
    { label: "Preferred Equity", spread: "12–15% fixed/PIK", color: "#f97316", risk: "High", ht: 32 },
    { label: "Common Equity", spread: "Residual / upside", color: "#10b981", risk: "Highest", ht: 48 },
  ];

  const irrTargets = [
    { strategy: "Senior Direct Lending", low: 10, high: 13, color: "#3b82f6" },
    { strategy: "Unitranche", low: 11, high: 14, color: "#8b5cf6" },
    { strategy: "Mezzanine", low: 15, high: 20, color: "#f59e0b" },
    { strategy: "Royalty / NAV Lending", low: 12, high: 16, color: "#f97316" },
    { strategy: "Preferred Equity", low: 12, high: 18, color: "#06b6d4" },
    { strategy: "Distressed / Special Sit.", low: 18, high: 25, color: "#10b981" },
  ];

  const specialSit = [
    { category: "Regulatory Catalyst", example: "Pharma spin-off; consent decree exit", returnTarget: "15–20%", timeline: "12–24m" },
    { category: "Litigation Finance", example: "Pre-settlement bridge; IP licensing dispute", returnTarget: "20–30%", timeline: "18–36m" },
    { category: "Event-Driven", example: "Merger arb; tender offer bridge", returnTarget: "12–18%", timeline: "6–12m" },
    { category: "Operational Restructuring", example: "Carve-out bridge; management buyout", returnTarget: "15–22%", timeline: "12–18m" },
    { category: "NAV Lending", example: "LP fund-level credit facility", returnTarget: "10–14%", timeline: "2–4 yrs" },
    { category: "Rescue Financing", example: "Distressed company bridge to refi", returnTarget: "20–30%", timeline: "12–24m" },
    { category: "Royalty Financing", example: "Revenue-based pharma / mining streams", returnTarget: "12–18%", timeline: "5–10 yrs" },
    { category: "Preferred Equity", example: "Family office recapitalization", returnTarget: "12–16%", timeline: "3–5 yrs" },
  ];

  // Build layer positions
  let yAcc = 4;
  const layerRects = capitalLayers.map((layer, idx) => {
    const y = yAcc;
    yAcc += layer.ht + 4;
    return { ...layer, y, idx };
  });
  const svgH = yAcc + 4;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Mezz IRR Target" value="15–20%" sub="Cash + PIK + equity" highlight="pos" />
        <StatCard label="PIK Component" value="3–6%" sub="Added to principal" />
        <StatCard label="Equity Co-invest" value="1–5%" sub="Warrants / kicker" highlight="pos" />
        <StatCard label="NAV Lending AUM" value="$130B+" sub="Fastest growing segment" highlight="pos" />
      </div>

      {/* Capital structure */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Mezzanine Position in Capital Structure" sub="Click a layer to see details" />
        <div className="flex gap-3 flex-col md:flex-row">
          <div className="flex-1">
            <svg viewBox={`0 0 260 ${svgH}`} className="w-full" style={{ maxHeight: 260 }}>
              {layerRects.map((layer) => {
                const isSel = selected === layer.idx;
                return (
                  <g key={layer.label} onClick={() => setSelected(isSel ? null : layer.idx)} style={{ cursor: "pointer" }}>
                    <rect
                      x={4} y={layer.y} width={252} height={layer.ht - 2} rx={6}
                      fill={layer.color} fillOpacity={isSel ? 0.5 : 0.3}
                      stroke={layer.color} strokeWidth={isSel ? 2 : 1}
                    />
                    <text x={130} y={layer.y + (layer.ht - 2) / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="#fff" fontWeight={isSel ? "700" : "500"}>
                      {layer.label}
                    </text>
                    <text x={246} y={layer.y + (layer.ht - 2) / 2 + 1} textAnchor="end" dominantBaseline="middle" fontSize={8} fill="#ffffff99">
                      {layer.risk}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <AnimatePresence mode="wait">
            {selected !== null && (
              <motion.div
                key={selected}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                className="flex-1 rounded-md border border-border bg-muted/30 p-4 self-start"
              >
                <p className="text-xs text-muted-foreground mb-1">Selected Layer</p>
                <p className="text-base font-semibold" style={{ color: capitalLayers[selected].color }}>
                  {capitalLayers[selected].label}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-muted-foreground">Pricing: </span>{capitalLayers[selected].spread}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="text-muted-foreground">Risk: </span>{capitalLayers[selected].risk}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PIK vs cash pay */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="PIK vs. Cash Pay Mechanics" sub="How payment-in-kind accrual works" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <InfoPill text="Cash Pay" color="emerald" />
            <p className="text-xs text-muted-foreground mt-2">
              Interest is paid in cash each quarter or semi-annually. Lower nominal rate (e.g., SOFR + 700 bps cash). Borrower must have sufficient free cash flow.
            </p>
            <div className="mt-3 rounded bg-foreground/5 p-3 text-xs font-mono text-muted-foreground">
              $100M × 11.5% = $11.5M/yr cash outflow
            </div>
          </div>
          <div>
            <InfoPill text="PIK (Payment in Kind)" color="amber" />
            <p className="text-xs text-muted-foreground mt-2">
              Interest accrues to principal rather than being paid in cash. Higher effective rate compensates lender for reinvestment risk. Common in high-growth, acquisition-heavy strategies.
            </p>
            <div className="mt-3 rounded bg-foreground/5 p-3 text-xs font-mono text-muted-foreground">
              $100M × 4% PIK → $104M after Y1<br />
              $104M × 4% PIK → $108.16M after Y2
            </div>
          </div>
        </div>
      </div>

      {/* IRR targets */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="IRR Targets by Private Credit Strategy" sub="Gross IRR before fees (typical market 2024)" />
        <div className="space-y-3">
          {irrTargets.map((t) => {
            const scale = 30;
            const left = (t.low / scale) * 100;
            const width = ((t.high - t.low) / scale) * 100;
            return (
              <div key={t.strategy}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{t.strategy}</span>
                  <span className="text-xs font-semibold" style={{ color: t.color }}>{t.low}–{t.high}%</span>
                </div>
                <div className="relative h-4 rounded bg-foreground/5">
                  <div className="absolute h-full rounded" style={{ left: `${left}%`, width: `${width}%`, background: t.color, opacity: 0.7 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special situations */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Special Situations Categories" sub="8 sub-strategies with typical return outcomes" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {specialSit.map((s) => (
            <div key={s.category} className="rounded-lg border border-border/20 bg-foreground/[0.03] p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">{s.category}</p>
                <div className="flex gap-1.5 shrink-0">
                  <InfoPill text={s.returnTarget} color="emerald" />
                  <InfoPill text={s.timeline} color="zinc" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{s.example}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — DISTRESSED & OPPORTUNISTIC
// ═══════════════════════════════════════════════════════════════════════════════

function DistressedTab() {
  const cycleStages = [
    { stage: "Normal Credit", color: "#10b981" },
    { stage: "Stress", color: "#f59e0b" },
    { stage: "Distress", color: "#f97316" },
    { stage: "Chapter 11", color: "#ef4444" },
    { stage: "Reorganization", color: "#8b5cf6" },
    { stage: "Emergence", color: "#3b82f6" },
  ];

  const definitions = [
    { term: "Stressed", spread: "300–600 bps", price: "85–95¢", color: "amber" },
    { term: "Distressed", spread: "600–1500 bps", price: "60–85¢", color: "orange" },
    { term: "Default", spread: "1500+ bps", price: "< 60¢", color: "rose" },
  ];

  const opCredit = [
    { type: "Fallen Angels", desc: "IG bonds downgraded to HY; forced institutional selling creates mispricing", irr: "12–18%" },
    { type: "Rating Migrations", desc: "B → CCC downgrades trigger CLO bucket constraints and loan selling", irr: "15–22%" },
    { type: "Secondary Purchases", desc: "Buying performing loans at discount from banks needing balance sheet relief", irr: "10–15%" },
    { type: "DIP Financing", desc: "Super-priority post-petition financing at 300–500 bps; highest recovery priority", irr: "14–20%" },
    { type: "Loan-to-Own", desc: "Accumulate debt at discount to acquire company through plan of reorg", irr: "20–35%" },
    { type: "363 Asset Sale", desc: "Credit bid existing debt to acquire assets free-and-clear of liabilities", irr: "25–40%" },
  ];

  const stageCount = cycleStages.length;
  const CW = 440;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="DIP Spread" value="300–500bps" sub="Super-priority pricing" />
        <StatCard label="Loan-to-Own IRR" value="20–35%" sub="If exit successful" highlight="pos" />
        <StatCard label="363 Sale Avg" value="45–90 days" sub="Bankruptcy to close" />
        <StatCard label="Post-Reorg Equity" value="~2–5×" sub="If thesis correct" highlight="pos" />
      </div>

      {/* Distressed cycle */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Distressed Debt Market Cycle" sub="Six phases from normal credit to post-reorganization emergence" />
        <svg viewBox={`0 0 ${CW} 110`} className="w-full" style={{ maxHeight: 130 }}>
          <text x={CW / 2} y={16} textAnchor="middle" fontSize={9} fill="#71717a">
            Opportunity grows for distressed investors as cycle progresses →
          </text>
          {cycleStages.map((stage, i) => {
            const x1 = 20 + (i / (stageCount - 1)) * (CW - 40);
            const x2 = 20 + ((i + 1) / (stageCount - 1)) * (CW - 40);
            return i < stageCount - 1 ? (
              <line key={`seg${i}`} x1={x1} y1={56} x2={x2} y2={56} stroke={stage.color} strokeWidth={6} strokeLinecap="round" />
            ) : null;
          })}
          {cycleStages.map((stage, i) => {
            const x = 20 + (i / (stageCount - 1)) * (CW - 40);
            const words = stage.stage.split(" ");
            return (
              <g key={stage.stage}>
                <circle cx={x} cy={56} r={8} fill={stage.color} />
                <text x={x} y={76} textAnchor="middle" fontSize={7.5} fill="#a1a1aa">{words[0]}</text>
                {words[1] && <text x={x} y={86} textAnchor="middle" fontSize={7.5} fill="#a1a1aa">{words[1]}</text>}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Definitions */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Stressed vs. Distressed vs. Default" sub="Market pricing thresholds" />
        <div className="grid grid-cols-3 gap-4">
          {definitions.map((d) => (
            <div key={d.term} className="rounded-lg border border-border/20 bg-foreground/[0.03] p-3 text-center">
              <InfoPill text={d.term} color={d.color} />
              <p className="text-sm font-medium text-foreground mt-2">{d.price}</p>
              <p className="text-xs text-muted-foreground">{d.spread}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fulcrum security */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Fulcrum Security Identification" sub="The tranche that converts to equity in the plan of reorganization" />
        <div className="flex gap-3 flex-col md:flex-row items-start">
          <svg viewBox="0 0 320 120" className="w-full md:w-72 shrink-0" style={{ maxHeight: 130 }}>
            <rect x={20} y={10} width={200} height={26} rx={4} fill="#3b82f6" fillOpacity={0.55} />
            <text x={24} y={27} fontSize={9} fill="#fff">Secured Debt $300M</text>
            <rect x={20} y={42} width={120} height={26} rx={4} fill="#f59e0b" fillOpacity={0.55} />
            <text x={24} y={59} fontSize={9} fill="#fff">Mezz $150M (fulcrum)</text>
            <rect x={20} y={74} width={40} height={22} rx={4} fill="#10b981" fillOpacity={0.2} />
            <text x={24} y={89} fontSize={9} fill="#6ee7b7">Equity $0</text>
            <line x1={273} y1={8} x2={273} y2={105} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,2" />
            <text x={276} y={110} fontSize={8} fill="#f59e0b">EV=$380M</text>
            <text x={271} y={8} fontSize={7} fill="#f59e0b" textAnchor="end">Fulcrum→</text>
          </svg>
          <div className="text-xs text-muted-foreground space-y-2 flex-1">
            <p>
              The <span className="text-amber-300 font-medium">fulcrum security</span> sits at the enterprise value line — it receives partial recovery and converts to equity in the reorganized company.
            </p>
            <p>
              In this example: Secured debt ($300M) is fully covered by $380M EV. The Mezz tranche ($150M) is the fulcrum — it gets ~$80M recovery (~53¢/$) and converts the remainder to equity.
            </p>
            <p className="text-muted-foreground">Common equity is wiped out (zero residual value).</p>
          </div>
        </div>
      </div>

      {/* DIP financing */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Chapter 11 DIP Financing" sub="Debtor-in-Possession financing — highest priority, highest yield" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Priority", value: "Super-priority admin claim", desc: "Paid before all pre-petition creditors", color: "emerald" },
            { label: "Pricing", value: "SOFR + 300–500 bps", desc: "Plus upfront fee 1–3%, commitment fee 50–75 bps", color: "blue" },
            { label: "Control Rights", value: "Milestones & covenants", desc: "DIP lender sets restructuring timeline and process milestones", color: "violet" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border/20 bg-foreground/[0.03] p-4">
              <InfoPill text={item.label} color={item.color} />
              <p className="text-sm font-medium text-foreground mt-2">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunistic credit */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Opportunistic Credit Strategies" sub="Fallen angels, rating migrations, secondary purchases, and more" />
        <div className="space-y-3">
          {opCredit.map((s) => (
            <div key={s.type} className="flex items-start gap-3 rounded-lg border border-border/20 bg-foreground/[0.03] p-3">
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-foreground">{s.type}</p>
                  <InfoPill text={s.irr} color="emerald" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
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
  const shareData = [
    { year: 2010, private: 8 },
    { year: 2012, private: 11 },
    { year: 2014, private: 16 },
    { year: 2016, private: 22 },
    { year: 2018, private: 30 },
    { year: 2020, private: 37 },
    { year: 2022, private: 46 },
    { year: 2024, private: 55 },
  ];

  const yieldComparison = [
    { label: "HY Bonds (public)", yield: 7.2, color: "#3b82f6" },
    { label: "Broadly Syndicated Loans", yield: 8.4, color: "#8b5cf6" },
    { label: "Private Direct Lending", yield: 10.8, color: "#10b981" },
    { label: "Mezzanine / Special Sit.", yield: 15.5, color: "#f59e0b" },
  ];

  const defaultRates = [
    { label: "Private Direct Lending", rate: 2.4, color: "#10b981" },
    { label: "HY Bonds (LTM avg)", rate: 4.1, color: "#ef4444" },
    { label: "Leveraged Loans (LTM avg)", rate: 3.6, color: "#f97316" },
  ];

  const allocations = [
    { type: "Large Pension Funds", current: 8, target: 12 },
    { type: "Endowments / Foundations", current: 11, target: 15 },
    { type: "Sovereign Wealth Funds", current: 5, target: 10 },
    { type: "Insurance Companies", current: 6, target: 9 },
    { type: "Family Offices", current: 9, target: 13 },
  ];

  const risks = [
    { risk: "Concentration Risk", detail: "Portfolios with 20–50 loans lack diversification vs. CLOs with 200+ loans", severity: "High", color: "rose" },
    { risk: "Illiquidity", detail: "No secondary market for most private loans; locked capital for 5–7 years", severity: "High", color: "rose" },
    { risk: "Valuation Opacity", detail: "Mark-to-model quarterly NAVs; may mask true losses in stress periods", severity: "Medium", color: "amber" },
    { risk: "Documentation Creep", detail: "Covenant-lite structures and wider EBITDA definitions reducing lender protections", severity: "Medium", color: "amber" },
    { risk: "Manager Dispersion", detail: "Wide range of outcomes across managers; top-quartile selection crucial", severity: "Medium", color: "amber" },
    { risk: "Rate Sensitivity", detail: "Floating-rate benefit in rising rates; but may stress borrowers at high levels", severity: "Low", color: "blue" },
  ];

  // Area chart SVG
  const W = 520;
  const H = 148;
  const pL = 36;
  const pR = 12;
  const pT = 16;
  const pB = 28;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const xSc = (i: number) => pL + (i / (shareData.length - 1)) * cW;
  const ySc = (pct: number) => pT + cH - (pct / 100) * cH;

  const pts = shareData.map((d, i) => ({ x: xSc(i), y: ySc(d.private) }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L${xSc(shareData.length - 1).toFixed(1)},${(pT + cH).toFixed(1)} L${xSc(0).toFixed(1)},${(pT + cH).toFixed(1)} Z`;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Market Share (2024)" value="~55%" sub="Private vs syndicated loans" highlight="pos" />
        <StatCard label="Illiquidity Premium" value="200–300bps" sub="Over comparable public debt" highlight="pos" />
        <StatCard label="Private Default Rate" value="~2–3%" sub="vs HY bonds 4–5%" highlight="pos" />
        <StatCard label="Institutional Target" value="5–15%" sub="Portfolio allocation range" />
      </div>

      {/* Market share area chart */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading
          title="Private Credit vs. Syndicated Loan Market Share"
          sub="Middle market sponsor-backed lending share shift (2010→2024)"
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 160 }}>
          {[0, 25, 50, 75, 100].map((pct) => (
            <line key={pct} x1={pL} x2={W - pR} y1={ySc(pct)} y2={ySc(pct)} stroke="#ffffff12" strokeWidth={1} />
          ))}
          <path d={fillPath} fill="rgba(16,185,129,0.2)" />
          <path d={linePath} fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinejoin="round" />
          {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill="#10b981" />)}
          {[0, 25, 50, 75, 100].map((pct) => (
            <text key={pct} x={pL - 4} y={ySc(pct) + 4} fontSize={9} fill="#71717a" textAnchor="end">{pct}%</text>
          ))}
          {shareData.filter((_, i) => i % 2 === 0).map((d) => {
            const idx = shareData.findIndex((sd) => sd.year === d.year);
            return <text key={d.year} x={xSc(idx)} y={H - 6} fontSize={9} fill="#71717a" textAnchor="middle">{d.year}</text>;
          })}
          <rect x={pL} y={pT - 2} width={10} height={3} fill="#10b981" rx={1} />
          <text x={pL + 13} y={pT + 2} fontSize={9} fill="#6ee7b7">Private Credit Share %</text>
        </svg>
      </div>

      {/* Yield comparison */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Yield Premium: Private vs. Public Credit" sub="Approximate all-in yields (2024 market)" />
        <div className="space-y-3">
          {yieldComparison.map((y) => (
            <div key={y.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{y.label}</span>
                <span className="text-xs font-medium" style={{ color: y.color }}>{y.yield.toFixed(1)}%</span>
              </div>
              <div className="relative h-4 rounded bg-foreground/5">
                <div className="h-full rounded" style={{ width: `${(y.yield / 18) * 100}%`, background: y.color, opacity: 0.75 }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Private direct lending commands a 200–300 bps illiquidity premium over comparable public market instruments, compensating for lock-up, concentrated exposure, and valuation opacity.
        </p>
      </div>

      {/* Default rates */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Default Rate Comparison" sub="Private credit historically lower defaults than public HY" />
        <div className="space-y-3">
          {defaultRates.map((d) => (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{d.label}</span>
                <span className="text-xs font-medium" style={{ color: d.color }}>{d.rate.toFixed(1)}%</span>
              </div>
              <div className="relative h-4 rounded bg-foreground/5">
                <div className="h-full rounded" style={{ width: `${(d.rate / 6) * 100}%`, background: d.color, opacity: 0.75 }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Lower default rates reflect private credit&apos;s focus on sponsored, covenant-protected middle market companies with active lender monitoring.
        </p>
      </div>

      {/* Institutional allocations */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Institutional Portfolio Allocations to Private Credit" sub="Current vs. target allocations (2024 survey data)" />
        <div className="space-y-4">
          {allocations.map((a) => (
            <div key={a.type}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{a.type}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-muted-foreground">Current: <span className="text-foreground">{a.current}%</span></span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-muted-foreground">Target: <span className="text-emerald-400">{a.target}%</span></span>
                </div>
              </div>
              <div className="relative h-5 rounded bg-foreground/5">
                <div className="absolute h-full rounded bg-muted" style={{ width: `${(a.current / 20) * 100}%`, opacity: 0.6 }} />
                <div className="absolute h-1 top-2 rounded bg-emerald-400" style={{ width: `${(a.target / 20) * 100}%`, opacity: 0.8 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-2 rounded bg-muted opacity-60" /> Current
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-1 rounded bg-emerald-400 opacity-80" /> Target
          </span>
        </div>
      </div>

      {/* Key risks */}
      <div className="rounded-md border border-border bg-muted/30 p-5">
        <SectionHeading title="Key Risks in Private Credit" sub="Concentration, illiquidity, valuation opacity, and documentation creep" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {risks.map((risk) => (
            <div key={risk.risk} className="rounded-lg border border-border/20 bg-foreground/[0.03] p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", risk.color === "rose" ? "text-rose-400" : risk.color === "amber" ? "text-amber-400" : "text-primary")} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-foreground">{risk.risk}</p>
                    <InfoPill text={risk.severity} color={risk.color} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{risk.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory tailwinds + vintage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border border-border bg-muted/30 p-5">
          <SectionHeading title="Regulatory Tailwinds" sub="Why banks retreat, private credit expands" />
          <div className="space-y-2 text-xs text-muted-foreground">
            {[
              "Basel III/IV raises RWA for leveraged loans, making bank lending uneconomic",
              "SEC Form PF reporting improves transparency for large advisers (>$150M AUM)",
              "Volcker Rule restricts proprietary lending by banks, opening market share",
              "CLO manager rules and risk retention requirements push volume to direct lenders",
            ].map((pt, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <p>{pt}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-muted/30 p-5">
          <SectionHeading title="Vintage Year Diversification" sub="Why spreading deployment across cycles matters" />
          <div className="space-y-2 text-xs text-muted-foreground">
            {[
              "2009–2012 vintages: exceptional returns as distressed exits occurred into recovery",
              "2014–2017 vintages: steady mid-teen IRRs in benign credit environment",
              "2020 vintage: pandemic-era pricing attractive; strong 2021–2022 performance",
              "2022–2024 vintages: higher floating rates boost current income; recession risk hedge",
            ].map((pt, i) => (
              <div key={i} className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <p>{pt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function PrivateCreditPage() {
  const tabs = [
    { id: "direct", label: "Direct Lending", icon: DollarSign },
    { id: "mezz", label: "Mezzanine & Special Sit.", icon: Layers },
    { id: "distressed", label: "Distressed & Opportunistic", icon: TrendingDown },
    { id: "dynamics", label: "Market Dynamics", icon: BarChart3 },
  ] as const;

  type TabId = (typeof tabs)[number]["id"];
  const [activeTab, setActiveTab] = useState<TabId>("direct");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border border-l-4 border-l-primary bg-card/60 backdrop-blur px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-start gap-4">
          <div className="rounded-md bg-muted/10 p-2.5 border border-border">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground/50" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-foreground">Private Credit Markets</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Direct lending, mezzanine finance, distressed debt, special situations, and the $1.7T rise of private credit as an asset class
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <InfoPill text="$1.7T AUM" color="violet" />
              <InfoPill text="SOFR+500–700bps" color="blue" />
              <InfoPill text="200–300bps Illiquidity Premium" color="emerald" />
              <InfoPill text="1st Lien / Unitranche" color="amber" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
          <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                ><span>{tab.label}</span></TabsTrigger>
              );
            })}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <TabsContent value="direct" className="data-[state=inactive]:hidden">
                {activeTab === "direct" && <DirectLendingTab />}
              </TabsContent>
              <TabsContent value="mezz" className="data-[state=inactive]:hidden">
                {activeTab === "mezz" && <MezzanineTab />}
              </TabsContent>
              <TabsContent value="distressed" className="data-[state=inactive]:hidden">
                {activeTab === "distressed" && <DistressedTab />}
              </TabsContent>
              <TabsContent value="dynamics" className="data-[state=inactive]:hidden">
                {activeTab === "dynamics" && <MarketDynamicsTab />}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
