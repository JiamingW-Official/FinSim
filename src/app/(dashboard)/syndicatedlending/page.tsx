"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Users,
  FileText,
  Layers,
  ArrowRight,
  Shield,
  AlertTriangle,
  Globe,
  Building2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 944;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const RAND_POOL: number[] = [];
for (let i = 0; i < 300; i++) RAND_POOL.push(rand());
let randIdx = 0;
const _r = () => RAND_POOL[randIdx++ % RAND_POOL.length];
void _r;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtT(n: number): string {
  if (n >= 1) return `$${n.toFixed(1)}T`;
  return `$${(n * 1000).toFixed(0)}B`;
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
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className={cn("text-xl font-bold", valClass)}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── SectionHeading ────────────────────────────────────────────────────────────

function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── InfoPill ──────────────────────────────────────────────────────────────────

function InfoPill({ text, color = "zinc" }: { text: string; color?: string }) {
  const cls: Record<string, string> = {
    zinc: "bg-zinc-800 text-zinc-300",
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
// TAB 1 — DEAL STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════

function DealStructureTab() {
  const commitments = [
    { tier: "Mandated Lead Arranger (MLA)", amount: 200, color: "#6366f1", pct: 100 },
    { tier: "Co-Arranger", amount: 100, color: "#22d3ee", pct: 50 },
    { tier: "Participant (large)", amount: 75, color: "#10b981", pct: 37.5 },
    { tier: "Participant (mid)", amount: 50, color: "#f59e0b", pct: 25 },
  ];

  const loanTypes = [
    {
      name: "Revolving Credit Facility (RCF)",
      color: "blue",
      desc: "Flexible draw-down / repay; used for working capital. Commitment fee on undrawn amount.",
    },
    {
      name: "Term Loan A (TLA)",
      color: "emerald",
      desc: "Amortising term loan; held mainly by banks. Regular principal repayments, 5–7 year maturity.",
    },
    {
      name: "Term Loan B (TLB)",
      color: "violet",
      desc: "Bullet maturity (1% annual amortisation); sold to institutional investors (CLOs, funds).",
    },
    {
      name: "Bridge Loan",
      color: "amber",
      desc: "Short-term facility (12–18 months) bridging permanent financing; higher fee step-ups over time.",
    },
  ];

  const agentRoles = [
    {
      role: "Facility Agent",
      icon: Building2,
      duties: [
        "Administer drawings, repayments, and rollovers",
        "Calculate interest and send payment notices",
        "Maintain register of lenders and commitments",
        "Coordinate waivers and amendments",
      ],
      color: "text-primary",
    },
    {
      role: "Security Agent",
      icon: Shield,
      duties: [
        "Hold security interests on behalf of all lenders",
        "Enforce security on lender instruction",
        "Manage perfection of collateral",
        "Distribute enforcement proceeds",
      ],
      color: "text-emerald-400",
    },
  ];

  const igVsLev = [
    { attr: "Borrower rating", ig: "BBB-/Baa3 or above", lev: "BB+/Ba1 or below" },
    { attr: "Spread range", ig: "50–200 bps", lev: "300–600 bps" },
    { attr: "Typical leverage", ig: "1–3× Net Debt/EBITDA", lev: "4–8× Net Debt/EBITDA" },
    { attr: "Covenants", ig: "Incurrence-only / minimal", lev: "Maintenance + incurrence" },
    { attr: "OID", ig: "Rarely", lev: "Often 98–99.5 cents" },
    { attr: "Primary investors", ig: "Banks (hold), some funds", lev: "CLOs, hedge funds, banks" },
    { attr: "Documentation", ig: "Investment Grade LCMA", lev: "LMA leveraged / LSTA" },
  ];

  const economics = [
    { fee: "Arrangement Fee", range: "0.50–1.50%", payer: "Borrower → MLA", color: "violet" },
    { fee: "Participation Fee", range: "0.25–0.75%", payer: "MLA → syndicate members", color: "blue" },
    { fee: "Commitment Fee", range: "35–50% of margin", payer: "Borrower on undrawn RCF", color: "emerald" },
    { fee: "Utilisation Fee", range: "10–20 bps (if >50% drawn)", payer: "Borrower on drawn RCF", color: "amber" },
    { fee: "Agency Fee", range: "$50–200K p.a.", payer: "Borrower → Facility Agent", color: "sky" },
  ];

  const crossProv = [
    {
      name: "Cross-Default",
      desc: "If borrower defaults on any other material financial indebtedness above a threshold (e.g., $25M), this facility is also in default.",
      color: "rose",
    },
    {
      name: "Cross-Acceleration",
      desc: "Only triggers if the other debt is actually accelerated (demanded early repayment), not merely defaulted — narrower protection.",
      color: "amber",
    },
    {
      name: "Intercreditor Agreement",
      desc: "Governs priority, voting rights, and enforcement between senior and junior lenders; typically limits junior lender enforcement standstill to 120 days.",
      color: "violet",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Global Syndicated Volume" value="~$5T" sub="Annual (2024)" highlight="pos" />
        <StatCard label="Typical Syndicate Size" value="10–40 Banks" sub="Per transaction" />
        <StatCard label="MLA Hold" value="$150–300M" sub="Anchor commitment" />
        <StatCard label="Deal Timeline" value="6–12 Weeks" sub="Mandate to close" />
      </div>

      {/* Anatomy SVG — borrower flow */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading
          title="Syndicated Loan Anatomy"
          sub="How a large corporate loan is arranged and distributed"
        />
        <svg viewBox="0 0 560 180" className="w-full" style={{ maxHeight: 190 }}>
          {/* Boxes */}
          {/* Borrower */}
          <rect x={10} y={70} width={90} height={40} rx={6} fill="#1e293b" stroke="#6366f1" strokeWidth={1.5} />
          <text x={55} y={88} textAnchor="middle" fill="#a5b4fc" fontSize={9} fontWeight="bold">BORROWER</text>
          <text x={55} y={102} textAnchor="middle" fill="#94a3b8" fontSize={7}>Corp / Sponsor</text>

          {/* MLA */}
          <rect x={145} y={60} width={105} height={60} rx={6} fill="#1e293b" stroke="#22d3ee" strokeWidth={1.5} />
          <text x={197} y={82} textAnchor="middle" fill="#67e8f9" fontSize={8} fontWeight="bold">MANDATED LEAD</text>
          <text x={197} y={94} textAnchor="middle" fill="#67e8f9" fontSize={8} fontWeight="bold">ARRANGER</text>
          <text x={197} y={108} textAnchor="middle" fill="#94a3b8" fontSize={7}>Bookrunner</text>

          {/* Arrow Borrow→MLA */}
          <line x1={100} y1={90} x2={143} y2={90} stroke="#6366f1" strokeWidth={1.5} markerEnd="url(#arrowV)" />

          {/* Co-Arrangers */}
          <rect x={300} y={30} width={100} height={40} rx={6} fill="#1e293b" stroke="#10b981" strokeWidth={1} />
          <text x={350} y={48} textAnchor="middle" fill="#6ee7b7" fontSize={8} fontWeight="bold">CO-ARRANGERS</text>
          <text x={350} y={62} textAnchor="middle" fill="#94a3b8" fontSize={7}>$100M each</text>

          {/* Participants */}
          <rect x={300} y={100} width={100} height={40} rx={6} fill="#1e293b" stroke="#f59e0b" strokeWidth={1} />
          <text x={350} y={118} textAnchor="middle" fill="#fcd34d" fontSize={8} fontWeight="bold">PARTICIPANTS</text>
          <text x={350} y={132} textAnchor="middle" fill="#94a3b8" fontSize={7}>$50M each</text>

          {/* Arrows MLA→Co-Arr & MLA→Part */}
          <line x1={250} y1={80} x2={298} y2={55} stroke="#22d3ee" strokeWidth={1.2} markerEnd="url(#arrowC)" />
          <line x1={250} y1={100} x2={298} y2={118} stroke="#22d3ee" strokeWidth={1.2} markerEnd="url(#arrowC)" />

          {/* Facility / Security Agent */}
          <rect x={450} y={65} width={100} height={50} rx={6} fill="#1e293b" stroke="#f472b6" strokeWidth={1} />
          <text x={500} y={84} textAnchor="middle" fill="#f9a8d4" fontSize={8} fontWeight="bold">FACILITY &</text>
          <text x={500} y={96} textAnchor="middle" fill="#f9a8d4" fontSize={8} fontWeight="bold">SECURITY</text>
          <text x={500} y={108} textAnchor="middle" fill="#94a3b8" fontSize={7}>AGENTS</text>

          {/* Arrows Co-Arr/Part → Agent */}
          <line x1={400} y1={50} x2={448} y2={78} stroke="#10b981" strokeWidth={1} markerEnd="url(#arrowG)" />
          <line x1={400} y1={120} x2={448} y2={103} stroke="#f59e0b" strokeWidth={1} markerEnd="url(#arrowA)" />

          {/* Arrow defs */}
          <defs>
            <marker id="arrowV" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" />
            </marker>
            <marker id="arrowC" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee" />
            </marker>
            <marker id="arrowG" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#10b981" />
            </marker>
            <marker id="arrowA" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Legend */}
          <text x={10} y={168} fill="#94a3b8" fontSize={7}>MLA = Mandated Lead Arranger; typically holds largest anchor commitment; may also act as Bookrunner</text>
        </svg>
      </div>

      {/* Commitment tiers */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading title="Commitment Amounts by Bank Tier" sub="Illustrative $500M facility" />
        <div className="space-y-3">
          {commitments.map((c) => (
            <div key={c.tier} className="flex items-center gap-3">
              <div className="w-48 text-xs text-zinc-300 shrink-0">{c.tier}</div>
              <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                />
              </div>
              <div className="text-xs font-mono text-zinc-200 w-16 text-right">${c.amount}M</div>
            </div>
          ))}
        </div>
      </div>

      {/* Loan types */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading title="Facility Types" sub="Common tranches within a syndicated credit agreement" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {loanTypes.map((lt) => (
            <div key={lt.name} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <InfoPill text={lt.name} color={lt.color} />
              <p className="text-xs text-zinc-400 mt-2">{lt.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agent roles */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading title="Agent Bank Roles" sub="Operational infrastructure of a syndicated facility" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentRoles.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.role} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={16} className={a.color} />
                  <span className="text-sm font-semibold text-white">{a.role}</span>
                </div>
                <ul className="space-y-1">
                  {a.duties.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-xs text-zinc-400">
                      <ArrowRight size={10} className="mt-0.5 shrink-0 text-zinc-600" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* IG vs Leveraged */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading title="Investment Grade vs Leveraged Lending" sub="Key structural differences" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4 text-left text-zinc-400 font-medium">Attribute</th>
                <th className="py-2 pr-4 text-left text-emerald-400 font-medium">Investment Grade</th>
                <th className="py-2 text-left text-amber-400 font-medium">Leveraged</th>
              </tr>
            </thead>
            <tbody>
              {igVsLev.map((row, i) => (
                <tr key={row.attr} className={cn("border-b border-white/5", i % 2 === 0 ? "bg-white/[0.02]" : "")}>
                  <td className="py-2 pr-4 text-zinc-300">{row.attr}</td>
                  <td className="py-2 pr-4 text-emerald-300/80">{row.ig}</td>
                  <td className="py-2 text-amber-300/80">{row.lev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deal economics */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading title="Typical Deal Economics" sub="Fee waterfall from borrower to syndicate" />
        <div className="space-y-2">
          {economics.map((e) => (
            <div key={e.fee} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3">
              <InfoPill text={e.fee} color={e.color} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-mono text-white">{e.range}</span>
                  <span className="text-xs text-zinc-500">|</span>
                  <span className="text-xs text-zinc-400">{e.payer}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-provisions */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading title="Cross-Default, Cross-Acceleration & Intercreditor" sub="Contractual protection mechanisms" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {crossProv.map((cp) => (
            <div key={cp.name} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <InfoPill text={cp.name} color={cp.color} />
              <p className="text-xs text-zinc-400 mt-2">{cp.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — PRICING MECHANICS
// ═══════════════════════════════════════════════════════════════════════════════

function PricingMechanicsTab() {
  const [selectedRatchet, setSelectedRatchet] = useState(0);

  const sofr = [
    { tenor: "SOFR 1M", rate: 5.33, color: "#6366f1" },
    { tenor: "SOFR 3M", rate: 5.35, color: "#22d3ee" },
    { tenor: "SOFR 6M", rate: 5.28, color: "#10b981" },
  ];

  // Credit spread chart data
  const spreadData = [
    { label: "IG AAA", spread: 50, color: "#10b981" },
    { label: "IG AA", spread: 75, color: "#22d3ee" },
    { label: "IG A", spread: 110, color: "#6366f1" },
    { label: "IG BBB", spread: 175, color: "#a78bfa" },
    { label: "Lev BB", spread: 325, color: "#f59e0b" },
    { label: "Lev B", spread: 475, color: "#f97316" },
    { label: "Lev CCC", spread: 700, color: "#ef4444" },
  ];

  const maxSpread = 750;

  // SVG dimensions
  const W = 480;
  const H = 160;
  const pL = 56;
  const pR = 12;
  const pT = 12;
  const pB = 28;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const barW = cW / spreadData.length - 8;

  // Margin ratchet levels
  const ratchetLevels = [
    { leverage: ">5.0×", spread: 575, label: "Entry" },
    { leverage: "4.5–5.0×", spread: 525, label: "Step 1" },
    { leverage: "4.0–4.5×", spread: 475, label: "Step 2" },
    { leverage: "3.5–4.0×", spread: 425, label: "Step 3" },
    { leverage: "<3.5×", spread: 375, label: "Step 4" },
  ];

  // Covenants
  const covenants = [
    {
      name: "Leverage Ratio",
      metric: "Net Debt / EBITDA",
      threshold: "≤ 6.5× (stepping down)",
      test: "Quarterly",
      color: "violet",
    },
    {
      name: "Interest Coverage",
      metric: "EBITDA / Interest Expense",
      threshold: "≥ 2.0× (stepping up)",
      test: "Quarterly",
      color: "blue",
    },
    {
      name: "Minimum Liquidity",
      metric: "Cash + RCF availability",
      threshold: "≥ $25M at all times",
      test: "Continuous",
      color: "emerald",
    },
  ];

  // OID calculation
  const faceVal = 500;
  const oidPoints = 1.5; // 98.5 cents on dollar
  const oidDiscount = (faceVal * oidPoints) / 100;
  const oidAllInBps = Math.round((oidPoints / 5) * 100); // ~30bps on 5yr

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="SOFR (overnight)" value="5.30%" sub="Reference rate 2024" />
        <StatCard label="IG All-In" value="5.80–7.30%" sub="SOFR + 50–200bps" highlight="pos" />
        <StatCard label="Lev All-In" value="8.30–11.30%" sub="SOFR + 300–600bps" highlight="neg" />
        <StatCard label="OID Range" value="97.5–99.5¢" sub="On leveraged loans" />
      </div>

      {/* SOFR transition */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading
          title="SOFR Transition (Post-LIBOR)"
          sub="Secured Overnight Financing Rate replaced USD LIBOR on June 30, 2023"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {sofr.map((s) => (
            <div key={s.tenor} className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-xs text-zinc-400 mb-1">{s.tenor}</div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.rate.toFixed(2)}%</div>
              <div className="text-xs text-zinc-500 mt-1">CME Term SOFR</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs text-primary">
          <span className="font-semibold">Credit Sensitive Adjustment:</span> Most leveraged loans now use Term SOFR (1M or 3M) with a
          Credit Spread Adjustment (CSA) of 11–26 bps to approximate historical LIBOR economics.
          Investment grade facilities often use overnight SOFR compounded in arrears.
        </div>
      </div>

      {/* Spread chart */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading
          title="Credit Spread by Rating — SOFR Margin (bps)"
          sub="Indicative ranges; investment grade (left) vs leveraged (right)"
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
          {[0, 200, 400, 600].map((v) => (
            <line
              key={v}
              x1={pL}
              x2={W - pR}
              y1={pT + cH - (v / maxSpread) * cH}
              y2={pT + cH - (v / maxSpread) * cH}
              stroke="#ffffff12"
              strokeWidth={1}
            />
          ))}
          {[0, 200, 400, 600].map((v) => (
            <text
              key={v}
              x={pL - 4}
              y={pT + cH - (v / maxSpread) * cH + 3}
              textAnchor="end"
              fill="#71717a"
              fontSize={7}
            >
              {v}
            </text>
          ))}
          {spreadData.map((d, i) => {
            const x = pL + i * (cW / spreadData.length) + 4;
            const barH = (d.spread / maxSpread) * cH;
            return (
              <g key={d.label}>
                <rect
                  x={x}
                  y={pT + cH - barH}
                  width={barW}
                  height={barH}
                  fill={d.color}
                  opacity={0.75}
                  rx={2}
                />
                <text
                  x={x + barW / 2}
                  y={pT + cH + 12}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize={7}
                >
                  {d.label}
                </text>
                <text
                  x={x + barW / 2}
                  y={pT + cH - barH - 3}
                  textAnchor="middle"
                  fill={d.color}
                  fontSize={7}
                  fontWeight="bold"
                >
                  {d.spread}
                </text>
              </g>
            );
          })}
          {/* IG divider */}
          <line
            x1={pL + (3.85 / spreadData.length) * cW + 4 + barW}
            y1={pT}
            x2={pL + (3.85 / spreadData.length) * cW + 4 + barW}
            y2={pT + cH}
            stroke="#ffffff30"
            strokeWidth={1}
            strokeDasharray="3,2"
          />
          <text
            x={pL + (1.5 / spreadData.length) * cW + 4}
            y={pT + 10}
            fill="#6ee7b7"
            fontSize={7}
            textAnchor="middle"
          >
            Investment Grade
          </text>
          <text
            x={pL + (5.2 / spreadData.length) * cW + 4}
            y={pT + 10}
            fill="#fcd34d"
            fontSize={7}
            textAnchor="middle"
          >
            Leveraged
          </text>
        </svg>
      </div>

      {/* OID Mechanics */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading
          title="OID — Original Issue Discount"
          sub="Loan sold below par; discount increases lender's all-in yield"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-zinc-400 mb-1">Face Value</div>
            <div className="text-xl font-bold text-white">${faceVal}M</div>
            <div className="text-xs text-zinc-500">Par amount</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-zinc-400 mb-1">Issue Price</div>
            <div className="text-xl font-bold text-amber-400">98.5¢</div>
            <div className="text-xs text-zinc-500">Lender pays ${faceVal - oidDiscount}M</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-zinc-400 mb-1">OID Yield Boost</div>
            <div className="text-xl font-bold text-emerald-400">+{oidAllInBps}bps</div>
            <div className="text-xs text-zinc-500">On 5yr maturity assumption</div>
          </div>
        </div>
        <div className="text-xs text-zinc-400 space-y-1">
          <p>All-in Yield = Spread + OID amortisation + SOFR. The OID is earned over the loan&apos;s expected life.</p>
          <p>Soft call protection: 101 prepayment premium if borrower refinances within first 6 months (common in TLBs).</p>
        </div>
      </div>

      {/* Margin ratchet */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading
          title="Margin Ratchet"
          sub="Spread steps down as borrower deleverages — click a level"
        />
        <div className="space-y-2">
          {ratchetLevels.map((rl, i) => (
            <button
              key={rl.label}
              onClick={() => setSelectedRatchet(i)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                selectedRatchet === i
                  ? "border-primary/50 bg-muted/40"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              <div className="w-24 text-xs font-mono text-zinc-300">{rl.leverage}</div>
              <div className="flex-1 h-3 bg-white/5 rounded overflow-hidden">
                <div
                  className="h-full rounded bg-primary transition-all"
                  style={{ width: `${(rl.spread / 600) * 100}%` }}
                />
              </div>
              <div className="text-xs font-mono text-primary w-16 text-right">
                SOFR+{rl.spread}bps
              </div>
              <InfoPill text={rl.label} color="violet" />
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRatchet}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 rounded-lg bg-muted/40 border border-border p-3 text-xs text-primary"
          >
            <span className="font-semibold">{ratchetLevels[selectedRatchet].label}:</span>{" "}
            At {ratchetLevels[selectedRatchet].leverage} net leverage the borrower pays SOFR+
            {ratchetLevels[selectedRatchet].spread}bps. Tested each quarter based on compliance certificate.
            {selectedRatchet === ratchetLevels.length - 1 && " This is the floor — maximum benefit from deleveraging."}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Financial maintenance covenants */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading title="Financial Maintenance Covenants" sub="Quarterly tests — breach triggers event of default" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {covenants.map((c) => (
            <div key={c.name} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <InfoPill text={c.name} color={c.color} />
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Metric</span>
                  <span className="text-zinc-300">{c.metric}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Threshold</span>
                  <span className="text-zinc-300">{c.threshold}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Test</span>
                  <span className="text-zinc-300">{c.test}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-amber-900/20 border border-amber-500/20 p-3 text-xs text-amber-300">
          <span className="font-semibold">Waiver Process:</span> Borrower engages Facility Agent →
          Agent circulates waiver request to lenders → majority lender consent required (typically 66.67%
          of commitments) → waiver letter executed, often with an amendment fee of 15–50bps.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — SYNDICATION PROCESS
// ═══════════════════════════════════════════════════════════════════════════════

function SyndicationProcessTab() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const timeline = [
    {
      step: "Mandate",
      weeks: "W1",
      color: "#6366f1",
      desc: "Borrower appoints MLA; term sheet agreed. Mandate letter sets economics, flex language, and exclusivity period.",
    },
    {
      step: "Due Diligence",
      weeks: "W2–3",
      color: "#22d3ee",
      desc: "Legal, financial, and market due diligence. Model review, management meetings, site visits for large deals.",
    },
    {
      step: "Credit Approval",
      weeks: "W3–4",
      color: "#10b981",
      desc: "MLA internal credit committee approves. Sets internal hold, pricing, and structural terms.",
    },
    {
      step: "Info Memo",
      weeks: "W4–5",
      color: "#a78bfa",
      desc: "Confidential Information Memorandum (CIM) prepared — business overview, financials, structure, key risks.",
    },
    {
      step: "Lender Meeting",
      weeks: "W5–6",
      color: "#f59e0b",
      desc: "Roadshow / virtual lender call. Borrower management presents; key terms discussed with potential lenders.",
    },
    {
      step: "Commitments",
      weeks: "W6–8",
      color: "#f97316",
      desc: "Lenders submit commitments. MLA assesses demand — applies flex if oversubscribed (tightens spread) or reverse flex if under.",
    },
    {
      step: "Allocation",
      weeks: "W8–9",
      color: "#ef4444",
      desc: "MLA allocates to lenders based on commitments and relationship. DNQAB consent rights for assignments.",
    },
    {
      step: "Close & Fund",
      weeks: "W9–12",
      color: "#ec4899",
      desc: "Conditions precedent satisfied (legal opinions, security filings). Loan agreement executed. Funds drawn.",
    },
  ];

  const syndicationTypes = [
    {
      type: "Underwritten",
      color: "violet",
      risk: "Bank",
      desc: "MLA commits to provide full amount regardless of syndication outcome. Maximum certainty for borrower.",
    },
    {
      type: "Best Efforts",
      color: "blue",
      risk: "Borrower",
      desc: "MLA only syndicates what market absorbs. Borrower bears shortfall risk. Used for IG or well-known credits.",
    },
    {
      type: "Club Deal",
      color: "emerald",
      risk: "Shared",
      desc: "Small group of 3–6 banks agree upfront without broad syndication. Common for mid-market deals <$500M.",
    },
  ];

  const flexTypes = [
    {
      name: "Rate Flex",
      dir: "Up / Down",
      desc: "Spread can be adjusted ±25–75bps to clear market. Flex up = worse for borrower; flex down = reward for strong demand.",
      color: "violet",
    },
    {
      name: "OID Flex",
      dir: "Down (discount deepens)",
      desc: "Issue price reduced (e.g., 99 → 98.5) to attract investors. Borrower receives less proceeds.",
      color: "amber",
    },
    {
      name: "Size Flex",
      dir: "Down (tranche reduced)",
      desc: "Tranche size can be cut by up to 20–25% if insufficient demand. Borrower must find alternative financing.",
      color: "rose",
    },
    {
      name: "Reverse Flex",
      dir: "Rate tightened",
      desc: "If deal is oversubscribed, MLA tightens spread in borrower's favour (e.g., reduces by 25bps).",
      color: "emerald",
    },
  ];

  const secondaryMarket = [
    { category: "Par Loans", spread: "<80bps", buyers: "Banks, CLOs, prime funds", color: "emerald" },
    { category: "Near-Par / Distressed", spread: "80–500bps", buyers: "Opportunistic, distressed funds", color: "amber" },
    { category: "Distressed", spread: ">500bps or <80¢", buyers: "Distressed HFs, restructuring desks", color: "rose" },
  ];

  const lstaFeatures = [
    "Standard par/near-par and distressed trading documentation",
    "T+7 settlement standard (T+10 for distressed)",
    "Representation and warranty regime",
    "Confidentiality and MNPI protocols",
    "Assignee consent — DNQAB (Disqualified Non-Qualifying Assignee Blacklists)",
    "Agent bank transfer mechanics and register maintenance",
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Typical Timeline" value="6–12 Weeks" sub="Mandate to close" />
        <StatCard label="Info Memo Length" value="80–200 Pages" sub="CIM + model" />
        <StatCard label="Flex Bandwidth" value="±50bps" sub="Standard rate flex" />
        <StatCard label="LSTA Settlement" value="T+7 Days" sub="Secondary par loans" />
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading
          title="Syndication Process Timeline"
          sub="Click each step for detail"
        />
        <div className="flex flex-wrap gap-2 mb-4">
          {timeline.map((t, i) => (
            <button
              key={t.step}
              onClick={() => setActiveStep(activeStep === i ? null : i)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                activeStep === i
                  ? "border-opacity-80 bg-white/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              )}
              style={activeStep === i ? { borderColor: t.color, color: t.color } : { color: "#94a3b8" }}
            >
              <span className="text-zinc-500 mr-1">{t.weeks}</span>
              {t.step}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {activeStep !== null && (
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-lg border border-white/10 bg-white/5 p-4"
              style={{ borderColor: timeline[activeStep].color + "40" }}
            >
              <div className="text-sm font-semibold mb-1" style={{ color: timeline[activeStep].color }}>
                {timeline[activeStep].step} <span className="text-zinc-500 font-normal text-xs">({timeline[activeStep].weeks})</span>
              </div>
              <p className="text-xs text-zinc-300">{timeline[activeStep].desc}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Syndication types */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading title="Syndication Structures" sub="Risk allocation between MLA and borrower" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {syndicationTypes.map((st) => (
            <div key={st.type} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <InfoPill text={st.type} color={st.color} />
                <span className="text-xs text-zinc-500">Risk: <span className="text-zinc-300">{st.risk}</span></span>
              </div>
              <p className="text-xs text-zinc-400">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Flex language */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading title="Flex Language Mechanics" sub="Price discovery and market clearing tools" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {flexTypes.map((fl) => (
            <div key={fl.name} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between mb-1">
                <InfoPill text={fl.name} color={fl.color} />
                <span className="text-xs text-zinc-500">{fl.dir}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2">{fl.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary market */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading title="Secondary Loan Market" sub="Active trading market; largest in leveraged loans" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {secondaryMarket.map((sm) => (
            <div key={sm.category} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <InfoPill text={sm.category} color={sm.color} />
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Spread</span>
                  <span className="text-zinc-300">{sm.spread}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Buyers</span>
                  <span className="text-zinc-300">{sm.buyers}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-xs font-semibold text-zinc-300 mb-2">LSTA Standard Documentation</div>
          <ul className="space-y-1">
            {lstaFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-zinc-400">
                <ArrowRight size={10} className="mt-0.5 shrink-0 text-zinc-600" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — MARKET DYNAMICS
// ═══════════════════════════════════════════════════════════════════════════════

function MarketDynamicsTab() {
  const volumeData = [
    { year: 2015, vol: 4.4 },
    { year: 2016, vol: 4.6 },
    { year: 2017, vol: 5.2 },
    { year: 2018, vol: 5.0 },
    { year: 2019, vol: 4.8 },
    { year: 2020, vol: 3.6 },
    { year: 2021, vol: 5.8 },
    { year: 2022, vol: 4.2 },
    { year: 2023, vol: 4.0 },
    { year: 2024, vol: 4.9 },
  ];

  const W = 480;
  const H = 160;
  const pL = 36;
  const pR = 12;
  const pT = 14;
  const pB = 28;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const maxV = 6.5;
  const barW = cW / volumeData.length - 6;

  const proceeds = [
    { label: "M&A / LBO", pct: 38, color: "#6366f1" },
    { label: "Refinancing", pct: 35, color: "#22d3ee" },
    { label: "Capex / Growth", pct: 15, color: "#10b981" },
    { label: "Working Capital", pct: 12, color: "#f59e0b" },
  ];

  const sectors = [
    { name: "TMT", share: 24, color: "#6366f1" },
    { name: "Healthcare", share: 18, color: "#10b981" },
    { name: "Energy / Infra", share: 15, color: "#f59e0b" },
    { name: "Industrials", share: 13, color: "#22d3ee" },
    { name: "Consumer", share: 11, color: "#a78bfa" },
    { name: "Financial", share: 10, color: "#f97316" },
    { name: "Other", share: 9, color: "#71717a" },
  ];

  const covLiteData = [
    { year: 2010, pct: 20 },
    { year: 2012, pct: 35 },
    { year: 2014, pct: 55 },
    { year: 2016, pct: 65 },
    { year: 2018, pct: 75 },
    { year: 2020, pct: 78 },
    { year: 2022, pct: 82 },
    { year: 2024, pct: 85 },
  ];

  const xCL = (i: number) => pL + (i / (covLiteData.length - 1)) * cW;
  const yCL = (pct: number) => pT + cH - (pct / 100) * cH;
  const clPath = covLiteData
    .map((d, i) => `${i === 0 ? "M" : "L"}${xCL(i).toFixed(1)},${yCL(d.pct).toFixed(1)}`)
    .join(" ");
  const clFill = `${clPath} L${xCL(covLiteData.length - 1).toFixed(1)},${(pT + cH).toFixed(1)} L${xCL(0).toFixed(1)},${(pT + cH).toFixed(1)} Z`;

  const esgFeatures = [
    {
      feature: "Sustainability Linked Loans (SLL)",
      desc: "Margin steps up/down (±5–25bps) based on KPI performance (CO2 reduction, ESG rating, renewable energy %)",
      color: "emerald",
    },
    {
      feature: "Green Loans",
      desc: "Proceeds earmarked for green projects (renewable energy, green buildings). Must comply with GLP (Green Loan Principles).",
      color: "blue",
    },
    {
      feature: "Social Loans",
      desc: "Financing for affordable housing, healthcare access, education. Aligns with SLP (Social Loan Principles).",
      color: "violet",
    },
  ];

  const institutionalShift = [
    { investor: "CLOs (Collateralised Loan Obligations)", share: 65, color: "#6366f1" },
    { investor: "Loan Mutual Funds", share: 15, color: "#22d3ee" },
    { investor: "Hedge Funds", share: 10, color: "#f59e0b" },
    { investor: "Insurance / Pension", share: 7, color: "#10b981" },
    { investor: "Banks (hold)", share: 3, color: "#94a3b8" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Global Volume 2024" value="~$4.9T" sub="Syndicated loans" highlight="pos" />
        <StatCard label="CLO Share (Lev)" value="~65%" sub="Institutional buyout" />
        <StatCard label="Cov-Lite Share" value="~85%" sub="Leveraged loans 2024" highlight="neg" />
        <StatCard label="ESG-Linked Volume" value="$800B+" sub="SLLs globally 2024" highlight="pos" />
      </div>

      {/* Volume bar chart */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading
          title="Global Syndicated Loan Volume (2015–2024)"
          sub="$ Trillions; includes IG, leveraged, and investment grade revolvers"
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
          {[0, 2, 4, 6].map((v) => (
            <line
              key={v}
              x1={pL}
              x2={W - pR}
              y1={pT + cH - (v / maxV) * cH}
              y2={pT + cH - (v / maxV) * cH}
              stroke="#ffffff12"
              strokeWidth={1}
            />
          ))}
          {[0, 2, 4, 6].map((v) => (
            <text
              key={v}
              x={pL - 4}
              y={pT + cH - (v / maxV) * cH + 3}
              textAnchor="end"
              fill="#71717a"
              fontSize={7}
            >
              ${v}T
            </text>
          ))}
          {volumeData.map((d, i) => {
            const x = pL + i * (cW / volumeData.length) + 3;
            const barH = (d.vol / maxV) * cH;
            const isMax = d.vol === Math.max(...volumeData.map((v) => v.vol));
            return (
              <g key={d.year}>
                <rect
                  x={x}
                  y={pT + cH - barH}
                  width={barW}
                  height={barH}
                  fill={isMax ? "#6366f1" : "#6366f160"}
                  rx={2}
                />
                <text
                  x={x + barW / 2}
                  y={pT + cH + 12}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize={7}
                >
                  {d.year}
                </text>
                <text
                  x={x + barW / 2}
                  y={pT + cH - barH - 3}
                  textAnchor="middle"
                  fill={isMax ? "#a5b4fc" : "#71717a"}
                  fontSize={6.5}
                >
                  {fmtT(d.vol)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Proceeds breakdown & sector side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Proceeds */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <SectionHeading title="Use of Proceeds" sub="2024 mix" />
          <div className="space-y-2">
            {proceeds.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <div className="w-28 text-xs text-zinc-300 shrink-0">{p.label}</div>
                <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${p.pct}%`, backgroundColor: p.color }}
                  />
                </div>
                <div className="text-xs font-mono text-zinc-200 w-8 text-right">{p.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sectors */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <SectionHeading title="Sector Concentration" sub="Share of leveraged loan volume" />
          <div className="space-y-2">
            {sectors.map((sec) => (
              <div key={sec.name} className="flex items-center gap-3">
                <div className="w-28 text-xs text-zinc-300 shrink-0">{sec.name}</div>
                <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${sec.share * 4}%`, backgroundColor: sec.color }}
                  />
                </div>
                <div className="text-xs font-mono text-zinc-200 w-8 text-right">{sec.share}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Covenant-lite evolution */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading
          title="Covenant-Lite Evolution (2010–2024)"
          sub="% of leveraged loans with no financial maintenance covenants"
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
          {[0, 25, 50, 75, 100].map((v) => (
            <line
              key={v}
              x1={pL}
              x2={W - pR}
              y1={yCL(v)}
              y2={yCL(v)}
              stroke="#ffffff12"
              strokeWidth={1}
            />
          ))}
          {[0, 25, 50, 75, 100].map((v) => (
            <text key={v} x={pL - 4} y={yCL(v) + 3} textAnchor="end" fill="#71717a" fontSize={7}>
              {v}%
            </text>
          ))}
          <path d={clFill} fill="#f5973620" />
          <path d={clPath} stroke="#f59e0b" strokeWidth={2} fill="none" />
          {covLiteData.map((d, i) => (
            <g key={d.year}>
              <circle cx={xCL(i)} cy={yCL(d.pct)} r={3} fill="#f59e0b" />
              <text x={xCL(i)} y={pT + cH + 12} textAnchor="middle" fill="#94a3b8" fontSize={7}>
                {d.year}
              </text>
            </g>
          ))}
          <text x={xCL(covLiteData.length - 1) - 4} y={yCL(85) - 6} fill="#fcd34d" fontSize={8} textAnchor="end">
            85% cov-lite
          </text>
        </svg>
        <div className="mt-2 text-xs text-zinc-500">
          Driven by institutional investor (CLO) dominance — they prefer covenant-lite for portfolio flexibility.
          Investor shift from bank-hold to non-bank has weakened lender protections industry-wide.
        </div>
      </div>

      {/* Institutional investor takeover */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading
          title="Institutional Investor Takeover — Leveraged Loan Holders"
          sub="Non-bank institutional investors now dominate leveraged loan markets"
        />
        <div className="space-y-2 mb-4">
          {institutionalShift.map((inv) => (
            <div key={inv.investor} className="flex items-center gap-3">
              <div className="w-52 text-xs text-zinc-300 shrink-0">{inv.investor}</div>
              <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{ width: `${inv.share}%`, backgroundColor: inv.color }}
                />
              </div>
              <div className="text-xs font-mono text-zinc-200 w-8 text-right">{inv.share}%</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-amber-900/20 border border-amber-500/20 p-3 text-xs text-amber-300">
          <span className="font-semibold">Basel III Impact:</span> Higher risk-weight assets (RWA) on leveraged loans
          (100–150% vs 20–50% for IG) plus leverage ratio constraints have driven banks to originate-and-distribute
          rather than hold, accelerating the shift to non-bank holders.
        </div>
      </div>

      {/* ESG-linked loans */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading
          title="ESG-Linked Loan Mechanics"
          sub="Sustainability performance targets (SPTs) tied to margin"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {esgFeatures.map((e) => (
            <div key={e.feature} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <InfoPill text={e.feature} color={e.color} />
              <p className="text-xs text-zinc-400 mt-2">{e.desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-emerald-900/20 border border-emerald-500/20 p-3 text-xs text-emerald-300">
          <span className="font-semibold">Margin Step Mechanics:</span> If borrower meets SPT (e.g., 30% CO2 reduction by
          2026) → margin reduces by 10–25bps. Miss the SPT → margin increases by same amount. Third-party verification
          required annually. SPT must be material, ambitious, and independently verifiable per LMA/APLMA Sustainability
          Linked Loan Principles.
        </div>
      </div>

      {/* Relationship vs transaction */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <SectionHeading
          title="Relationship Banking vs Transaction Banking"
          sub="Fundamental tension in syndicated lending"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-primary" />
              <span className="text-sm font-semibold text-primary">Relationship Banking</span>
            </div>
            <ul className="space-y-1 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><ArrowRight size={10} className="mt-0.5 shrink-0 text-zinc-600" />MLA holds large slice; cross-sells advisory, FX, deposits</li>
              <li className="flex items-start gap-2"><ArrowRight size={10} className="mt-0.5 shrink-0 text-zinc-600" />Willing to accept tighter pricing for ancillary revenue</li>
              <li className="flex items-start gap-2"><ArrowRight size={10} className="mt-0.5 shrink-0 text-zinc-600" />Actively supports borrower through covenant breaches</li>
              <li className="flex items-start gap-2"><ArrowRight size={10} className="mt-0.5 shrink-0 text-zinc-600" />Repeat mandates from loyal borrower base</li>
            </ul>
          </div>
          <div className="rounded-lg border border-orange-500/20 bg-orange-900/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={14} className="text-orange-400" />
              <span className="text-sm font-semibold text-orange-300">Transaction Banking</span>
            </div>
            <ul className="space-y-1 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><ArrowRight size={10} className="mt-0.5 shrink-0 text-zinc-600" />Originate-and-distribute; minimal hold; fee-driven</li>
              <li className="flex items-start gap-2"><ArrowRight size={10} className="mt-0.5 shrink-0 text-zinc-600" />Maximises spread / OID to attract institutional buyers</li>
              <li className="flex items-start gap-2"><ArrowRight size={10} className="mt-0.5 shrink-0 text-zinc-600" />Less tolerance for covenant waivers (dispersed lender base)</li>
              <li className="flex items-start gap-2"><ArrowRight size={10} className="mt-0.5 shrink-0 text-zinc-600" />CLO and fund buyers drive terms more than banks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function SyndicatedLendingPage() {
  const tabs = [
    { value: "structure", label: "Deal Structure", icon: Layers },
    { value: "pricing", label: "Pricing Mechanics", icon: DollarSign },
    { value: "syndication", label: "Syndication Process", icon: FileText },
    { value: "market", label: "Market Dynamics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2">
            <Building2 size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Syndicated Lending</h1>
            <p className="text-xs text-zinc-400">
              How large corporate loans are arranged, priced, and distributed among multiple banks
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <InfoPill text="Multi-bank facilities" color="violet" />
          <InfoPill text="SOFR + spread" color="blue" />
          <InfoPill text="$4–6T annual volume" color="emerald" />
          <InfoPill text="CLO-dominated" color="amber" />
          <InfoPill text="Cov-lite evolution" color="orange" />
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="structure" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-zinc-900 border border-white/10 h-auto p-1 gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400 py-2 px-3"
              >
                <Icon size={13} />
                {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="structure" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DealStructureTab />
          </motion.div>
        </TabsContent>
        <TabsContent value="pricing" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PricingMechanicsTab />
          </motion.div>
        </TabsContent>
        <TabsContent value="syndication" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SyndicationProcessTab />
          </motion.div>
        </TabsContent>
        <TabsContent value="market" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MarketDynamicsTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
