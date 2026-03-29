"use client";

import { useState } from "react";
import {
  Shield,
  Building2,
  Layers,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Zap,
  Globe,
  Info,
  ArrowRight,
  RefreshCw,
  Lock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 912;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed: number = 912) {
  s = seed;
}

// ── Shared UI helpers ──────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

function StatChip({
  label,
  value,
  color = "default",
}: {
  label: string;
  value: string;
  color?: "green" | "red" | "amber" | "blue" | "purple" | "default";
}) {
  const cls = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    default: "bg-muted text-muted-foreground border-border",
  }[color];
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-center", cls)}>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function InfoBox({
  title,
  children,
  variant = "default",
}: {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "green" | "amber" | "blue" | "purple";
}) {
  const cls = {
    default: "border-border bg-muted/30",
    green: "border-green-500/20 bg-green-500/5",
    amber: "border-amber-500/20 bg-amber-500/5",
    blue: "border-blue-500/20 bg-blue-500/5",
    purple: "border-purple-500/20 bg-purple-500/5",
  }[variant];
  return (
    <div className={cn("rounded-lg border p-4", cls)}>
      <div className="text-sm font-semibold mb-2 text-foreground">{title}</div>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

// ── Tab 1: Reinsurance Basics ──────────────────────────────────────────────────

function RiskTransferSVG() {
  return (
    <svg viewBox="0 0 600 160" className="w-full" style={{ maxHeight: 160 }}>
      {/* Cedent */}
      <rect x="20" y="50" width="130" height="60" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
      <text x="85" y="76" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="600">Primary Insurer</text>
      <text x="85" y="94" textAnchor="middle" fill="#64748b" fontSize="9">(Cedent)</text>
      <text x="85" y="108" textAnchor="middle" fill="#64748b" fontSize="8">Policies + Policyholders</text>

      {/* Arrow: premium cession */}
      <defs>
        <marker id="arrowR" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#6366f1" />
        </marker>
        <marker id="arrowL" markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto">
          <path d="M8,0 L8,6 L0,3 z" fill="#22c55e" />
        </marker>
      </defs>
      <line x1="155" y1="72" x2="235" y2="72" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#arrowR)" />
      <text x="195" y="66" textAnchor="middle" fill="#a5b4fc" fontSize="9">Ceded Premium</text>
      <line x1="235" y1="92" x2="155" y2="92" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arrowL)" />
      <text x="195" y="106" textAnchor="middle" fill="#86efac" fontSize="9">Risk Protection</text>

      {/* Reinsurer */}
      <rect x="240" y="50" width="130" height="60" rx="8" fill="#1e293b" stroke="#6366f1" strokeWidth="1.5" />
      <text x="305" y="76" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="600">Reinsurer</text>
      <text x="305" y="94" textAnchor="middle" fill="#64748b" fontSize="9">Assumes ceded risk</text>
      <text x="305" y="108" textAnchor="middle" fill="#64748b" fontSize="8">Munich Re / Swiss Re</text>

      {/* Arrow: retrocession */}
      <line x1="375" y1="72" x2="450" y2="72" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrowR)" />
      <text x="412" y="66" textAnchor="middle" fill="#fcd34d" fontSize="9">Retrocession</text>
      <line x1="450" y1="92" x2="375" y2="92" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#arrowL)" />
      <text x="412" y="106" textAnchor="middle" fill="#fca5a5" fontSize="9">Retro Cover</text>

      {/* Retrocessionaire */}
      <rect x="455" y="50" width="130" height="60" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="520" y="76" textAnchor="middle" fill="#fcd34d" fontSize="11" fontWeight="600">Retrocessionaire</text>
      <text x="520" y="94" textAnchor="middle" fill="#64748b" fontSize="9">ILS / Cat Bonds</text>
      <text x="520" y="108" textAnchor="middle" fill="#64748b" fontSize="8">Capital Markets</text>

      {/* Labels */}
      <text x="300" y="148" textAnchor="middle" fill="#475569" fontSize="9">Risk flows right → Capital flows left ←   Retrocession spreads risk to capital markets</text>
    </svg>
  );
}

function ReinsuranceTowerSVG() {
  const layers = [
    { label: "Retrocession Layer", attach: "$500M", exhaust: "Unlimited", color: "#7c3aed", bg: "#4c1d95" },
    { label: "Upper XL Layer", attach: "$250M", exhaust: "$500M", color: "#2563eb", bg: "#1e3a8a" },
    { label: "Middle XL Layer", attach: "$100M", exhaust: "$250M", color: "#0891b2", bg: "#164e63" },
    { label: "Working Layer XL", attach: "$25M", exhaust: "$100M", color: "#059669", bg: "#064e3b" },
    { label: "Quota Share / Surplus", attach: "First Loss", exhaust: "$25M", color: "#d97706", bg: "#78350f" },
    { label: "Primary Retention", attach: "$0", exhaust: "$10M", color: "#dc2626", bg: "#7f1d1d" },
  ];

  return (
    <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: 260 }}>
      <text x="250" y="16" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">Reinsurance Tower — Layers of Protection</text>
      {layers.map((l, i) => {
        const y = 28 + i * 36;
        return (
          <g key={i}>
            <rect x="100" y={y} width="260" height="30" rx="4" fill={l.bg} stroke={l.color} strokeWidth="1.2" />
            <text x="230" y={y + 13} textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="600">{l.label}</text>
            <text x="230" y={y + 24} textAnchor="middle" fill="#94a3b8" fontSize="8">{l.attach} → {l.exhaust}</text>
            <text x="90" y={y + 18} textAnchor="end" fill={l.color} fontSize="8">{l.attach}</text>
            <text x="370" y={y + 18} textAnchor="start" fill={l.color} fontSize="8">{l.exhaust}</text>
          </g>
        );
      })}
      <text x="250" y="252" textAnchor="middle" fill="#475569" fontSize="8">Losses exhaust layers from bottom (retention) upward through excess-of-loss layers</text>
    </svg>
  );
}

function ProportionalStructureSVG() {
  return (
    <svg viewBox="0 0 560 140" className="w-full" style={{ maxHeight: 140 }}>
      {/* Quota Share */}
      <rect x="10" y="20" width="240" height="90" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
      <text x="130" y="38" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="600">Quota Share (Proportional)</text>
      <rect x="20" y="45" width="80" height="28" rx="3" fill="#1e3a8a" />
      <text x="60" y="58" textAnchor="middle" fill="#bfdbfe" fontSize="8">Cedent</text>
      <text x="60" y="68" textAnchor="middle" fill="#93c5fd" fontSize="8">40% of all risks</text>
      <rect x="150" y="45" width="90" height="28" rx="3" fill="#164e63" />
      <text x="195" y="58" textAnchor="middle" fill="#a5f3fc" fontSize="8">Reinsurer</text>
      <text x="195" y="68" textAnchor="middle" fill="#67e8f9" fontSize="8">60% of all risks</text>
      <text x="130" y="102" textAnchor="middle" fill="#64748b" fontSize="8">Fixed % of every risk ceded; premium + losses split proportionally</text>

      {/* XL */}
      <rect x="310" y="20" width="240" height="90" rx="6" fill="#0f172a" stroke="#6366f1" strokeWidth="1" />
      <text x="430" y="38" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="600">Excess of Loss (Non-Proportional)</text>
      <rect x="320" y="45" width="80" height="28" rx="3" fill="#7f1d1d" />
      <text x="360" y="58" textAnchor="middle" fill="#fca5a5" fontSize="8">Cedent</text>
      <text x="360" y="68" textAnchor="middle" fill="#f87171" fontSize="8">Retains first $10M</text>
      <rect x="440" y="45" width="100" height="28" rx="3" fill="#064e3b" />
      <text x="490" y="58" textAnchor="middle" fill="#86efac" fontSize="8">Reinsurer</text>
      <text x="490" y="68" textAnchor="middle" fill="#4ade80" fontSize="8">$10M xs $10M layer</text>
      <text x="430" y="102" textAnchor="middle" fill="#64748b" fontSize="8">Reinsurer only pays when loss exceeds retention threshold</text>
    </svg>
  );
}

const MAJOR_REINSURERS = [
  { name: "Munich Re", country: "Germany", premiums: "$44B", rating: "AA-", specialty: "P&C, Life, Health" },
  { name: "Swiss Re", country: "Switzerland", premiums: "$42B", rating: "AA-", specialty: "P&C, Life, Cat" },
  { name: "Hannover Re", country: "Germany", premiums: "$26B", rating: "AA-", specialty: "P&C, Life" },
  { name: "Gen Re (Berkshire)", country: "USA", premiums: "$10B", rating: "AA+", specialty: "P&C, Life" },
  { name: "Lloyd's of London", country: "UK", premiums: "$55B", rating: "A+", specialty: "Specialty, Marine, Cat" },
  { name: "SCOR", country: "France", premiums: "$18B", rating: "A+", specialty: "Life, P&C" },
];

function BasicsTab() {
  return (
    <div className="space-y-6">
      <div>
        <SectionHeader
          title="Risk Transfer: Cedent to Reinsurer"
          subtitle="Reinsurance allows primary insurers to offload risk to specialist capital — stabilizing balance sheets and enabling more underwriting capacity."
        />
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <RiskTransferSVG />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Treaty Reinsurance" variant="blue">
          Covers an entire portfolio or book of business automatically. The reinsurer must accept all risks ceded within the agreed terms — efficient for standardized, high-volume books. Examples: property quota share treaties, casualty XL treaties.
        </InfoBox>
        <InfoBox title="Facultative Reinsurance" variant="purple">
          Covers individual risks negotiated case-by-case. The cedent and reinsurer each have the option to cede or accept. Used for large, complex, or unusual risks not fitting treaty terms. More expensive but flexible.
        </InfoBox>
      </div>

      <div>
        <SectionHeader
          title="Proportional vs Non-Proportional Structures"
          subtitle="Proportional: premium and losses split by ratio. Non-proportional: reinsurer pays only when losses exceed a threshold."
        />
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <ProportionalStructureSVG />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {[
            { label: "Quota Share", desc: "Fixed % of every risk", color: "blue" },
            { label: "Surplus Share", desc: "Cedes amounts above line size", color: "blue" },
            { label: "Excess of Loss", desc: "Pays above retention layer", color: "purple" },
            { label: "Stop Loss / Agg XL", desc: "Caps aggregate annual losses", color: "purple" },
          ].map((item) => (
            <div key={item.label} className={cn(
              "rounded-lg border p-3",
              item.color === "blue" ? "border-blue-500/20 bg-blue-500/5" : "border-purple-500/20 bg-purple-500/5"
            )}>
              <div className="text-xs font-semibold text-foreground mb-1">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader
          title="Reinsurance Tower"
          subtitle="Losses exhaust layers sequentially. Attachment and exhaustion points define each layer's risk window."
        />
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <ReinsuranceTowerSVG />
        </div>
      </div>

      <div>
        <SectionHeader title="Major Global Reinsurers" subtitle="Top reinsurers by gross written premium (2024 estimates)" />
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Company", "Country", "GWP", "S&P Rating", "Specialty"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MAJOR_REINSURERS.map((r, i) => (
                <tr key={r.name} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-muted/10" : "")}>
                  <td className="px-4 py-2.5 font-medium text-foreground">{r.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.country}</td>
                  <td className="px-4 py-2.5 text-blue-400 font-mono">{r.premiums}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className="text-green-400 border-green-500/30 text-xs">{r.rating}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{r.specialty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Retention vs Cession" variant="amber">
          <strong className="text-amber-300">Retention</strong> is the portion of risk the cedent keeps on its own balance sheet. <strong className="text-amber-300">Cession</strong> is what is transferred to the reinsurer. Optimal retention balances capital efficiency against the cost of reinsurance protection.
        </InfoBox>
        <InfoBox title="Why Reinsurance Exists" variant="green">
          Primary insurers face catastrophic loss concentration (earthquakes, hurricanes). Reinsurance smooths earnings volatility, satisfies regulatory capital requirements, enables competitive pricing, and transfers peak risk to global capital markets where it can be diversified away.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 2: Catastrophe Bonds ───────────────────────────────────────────────────

function CatBondStructureSVG() {
  return (
    <svg viewBox="0 0 600 200" className="w-full" style={{ maxHeight: 200 }}>
      <text x="300" y="16" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">Cat Bond Structure (144A / Reg S)</text>

      {/* Sponsor */}
      <rect x="20" y="40" width="110" height="50" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
      <text x="75" y="62" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="600">Sponsor</text>
      <text x="75" y="75" textAnchor="middle" fill="#64748b" fontSize="8">(Cedent / Insurer)</text>
      <text x="75" y="86" textAnchor="middle" fill="#64748b" fontSize="7">Munich Re / USAA</text>

      {/* SPV */}
      <rect x="240" y="30" width="120" height="70" rx="6" fill="#1e293b" stroke="#6366f1" strokeWidth="1.5" />
      <text x="300" y="54" textAnchor="middle" fill="#a5b4fc" fontSize="9" fontWeight="600">Special Purpose</text>
      <text x="300" y="66" textAnchor="middle" fill="#a5b4fc" fontSize="9" fontWeight="600">Vehicle (SPV)</text>
      <text x="300" y="80" textAnchor="middle" fill="#64748b" fontSize="8">Cayman / Bermuda</text>
      <text x="300" y="92" textAnchor="middle" fill="#64748b" fontSize="7">Issues notes to investors</text>

      {/* Collateral Trust */}
      <rect x="240" y="130" width="120" height="45" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="300" y="150" textAnchor="middle" fill="#fcd34d" fontSize="9" fontWeight="600">Collateral Trust</text>
      <text x="300" y="163" textAnchor="middle" fill="#64748b" fontSize="8">US Treasuries / MMF</text>
      <text x="300" y="174" textAnchor="middle" fill="#64748b" fontSize="7">100% principal secured</text>

      {/* Investors */}
      <rect x="460" y="40" width="120" height="50" rx="6" fill="#1e293b" stroke="#22c55e" strokeWidth="1.5" />
      <text x="520" y="62" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="600">Cat Bond</text>
      <text x="520" y="74" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="600">Investors</text>
      <text x="520" y="86" textAnchor="middle" fill="#64748b" fontSize="7">Pension / ILS Funds / HF</text>

      {/* Arrows */}
      <defs>
        <marker id="a1" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill="#6366f1" />
        </marker>
        <marker id="a2" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill="#22c55e" />
        </marker>
        <marker id="a3" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill="#f59e0b" />
        </marker>
        <marker id="a4" markerWidth="7" markerHeight="7" refX="2" refY="3" orient="auto">
          <path d="M7,0 L7,6 L0,3 z" fill="#f87171" />
        </marker>
      </defs>

      {/* Sponsor → SPV: reinsurance premium */}
      <line x1="133" y1="58" x2="237" y2="58" stroke="#6366f1" strokeWidth="1.2" markerEnd="url(#a1)" />
      <text x="185" y="52" textAnchor="middle" fill="#a5b4fc" fontSize="8">Re Premium</text>

      {/* SPV → Sponsor: loss coverage on trigger */}
      <line x1="237" y1="72" x2="133" y2="72" stroke="#f87171" strokeWidth="1.2" markerEnd="url(#a4)" />
      <text x="185" y="84" textAnchor="middle" fill="#fca5a5" fontSize="8">Loss on Trigger</text>

      {/* Investors → SPV: principal */}
      <line x1="457" y1="58" x2="363" y2="58" stroke="#22c55e" strokeWidth="1.2" markerEnd="url(#a2)" />
      <text x="410" y="52" textAnchor="middle" fill="#86efac" fontSize="8">Principal</text>

      {/* SPV → Investors: LIBOR + spread coupon */}
      <line x1="363" y1="72" x2="457" y2="72" stroke="#f59e0b" strokeWidth="1.2" markerEnd="url(#a3)" />
      <text x="410" y="84" textAnchor="middle" fill="#fcd34d" fontSize="8">SOFR + Spread</text>

      {/* SPV ↔ Trust */}
      <line x1="300" y1="103" x2="300" y2="127" stroke="#f59e0b" strokeWidth="1.2" markerEnd="url(#a3)" />
      <text x="315" y="118" fill="#fcd34d" fontSize="8">Invests</text>
    </svg>
  );
}

function ExpectedLossSpreadSVG() {
  resetSeed(912);
  const points: { el: number; spread: number; label: string }[] = [
    { el: 0.5, spread: 3.2, label: "Wind (FL)" },
    { el: 0.8, spread: 4.5, label: "Earthquake (CA)" },
    { el: 1.2, spread: 5.8, label: "Multi-peril" },
    { el: 1.8, spread: 7.2, label: "US Hurricane" },
    { el: 2.5, spread: 9.1, label: "Named Storm" },
    { el: 3.5, spread: 11.8, label: "Southeast Wind" },
    { el: 4.2, spread: 14.2, label: "High EL Bond" },
  ];

  const W = 500, H = 160;
  const pad = { l: 50, r: 20, t: 20, b: 30 };
  const maxEl = 5, maxSpr = 16;

  const toX = (el: number) => pad.l + (el / maxEl) * (W - pad.l - pad.r);
  const toY = (spr: number) => pad.t + (1 - spr / maxSpr) * (H - pad.t - pad.b);

  // Draw regression line
  const lineX1 = toX(0), lineY1 = toY(1.8);
  const lineX2 = toX(4.5), lineY2 = toY(15);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
      <text x={W / 2} y="13" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Expected Loss (%) vs Cat Bond Spread (%) — Multiple of EL ≈ 2.5–3.5×</text>

      {/* Axes */}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="#334155" strokeWidth="1" />
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="#334155" strokeWidth="1" />

      {/* Y labels */}
      {[0, 4, 8, 12, 16].map((v) => (
        <g key={v}>
          <line x1={pad.l - 3} y1={toY(v)} x2={pad.l} y2={toY(v)} stroke="#334155" strokeWidth="1" />
          <text x={pad.l - 6} y={toY(v) + 3} textAnchor="end" fill="#64748b" fontSize="8">{v}%</text>
        </g>
      ))}

      {/* X labels */}
      {[0, 1, 2, 3, 4, 5].map((v) => (
        <g key={v}>
          <line x1={toX(v)} y1={H - pad.b} x2={toX(v)} y2={H - pad.b + 3} stroke="#334155" strokeWidth="1" />
          <text x={toX(v)} y={H - pad.b + 12} textAnchor="middle" fill="#64748b" fontSize="8">{v}%</text>
        </g>
      ))}

      <text x={pad.l - 30} y={H / 2} textAnchor="middle" fill="#64748b" fontSize="8" transform={`rotate(-90,${pad.l - 30},${H / 2})`}>Spread</text>
      <text x={W / 2} y={H - 2} textAnchor="middle" fill="#64748b" fontSize="8">Expected Loss</text>

      {/* Regression line */}
      <line x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2} stroke="#475569" strokeWidth="1" strokeDasharray="4,3" />

      {/* Points */}
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={toX(p.el)} cy={toY(p.spread)} r="4" fill="#6366f1" opacity="0.85" />
          <text x={toX(p.el) + 6} y={toY(p.spread) + 3} fill="#a5b4fc" fontSize="7">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

function CatBondGrowthSVG() {
  // Historical cat bond market outstanding ($B) 2000–2024
  const data: [number, number][] = [
    [2000, 2.5], [2001, 3.1], [2002, 4.0], [2003, 5.2], [2004, 6.8],
    [2005, 8.9], [2006, 14.0], [2007, 18.5], [2008, 20.0], [2009, 16.8],
    [2010, 18.0], [2011, 14.5], [2012, 17.8], [2013, 20.0], [2014, 23.5],
    [2015, 25.0], [2016, 26.0], [2017, 31.0], [2018, 35.0], [2019, 40.0],
    [2020, 38.5], [2021, 41.0], [2022, 37.0], [2023, 42.0], [2024, 44.0],
  ];

  const W = 520, H = 160;
  const pad = { l: 42, r: 20, t: 20, b: 28 };
  const years = data.map(([y]) => y);
  const vals = data.map(([, v]) => v);
  const minY = 0, maxY = 50;

  const toX = (yr: number) => pad.l + ((yr - years[0]) / (years[years.length - 1] - years[0])) * (W - pad.l - pad.r);
  const toY = (v: number) => pad.t + (1 - (v - minY) / (maxY - minY)) * (H - pad.t - pad.b);

  const pathD = data.map(([yr, v], i) => `${i === 0 ? "M" : "L"}${toX(yr)},${toY(v)}`).join(" ");
  const areaD = pathD + ` L${toX(2024)},${toY(0)} L${toX(2000)},${toY(0)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
      <text x={W / 2} y="13" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Cat Bond Market Outstanding ($B) — 2000–2024</text>

      <defs>
        <linearGradient id="catGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <path d={areaD} fill="url(#catGrad)" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" />

      {/* Y grid */}
      {[0, 10, 20, 30, 40, 50].map((v) => (
        <g key={v}>
          <line x1={pad.l} y1={toY(v)} x2={W - pad.r} y2={toY(v)} stroke="#1e293b" strokeWidth="1" />
          <text x={pad.l - 5} y={toY(v) + 3} textAnchor="end" fill="#64748b" fontSize="8">${v}B</text>
        </g>
      ))}

      {/* X axis */}
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="#334155" strokeWidth="1" />
      {[2000, 2005, 2010, 2015, 2020, 2024].map((yr) => (
        <g key={yr}>
          <line x1={toX(yr)} y1={H - pad.b} x2={toX(yr)} y2={H - pad.b + 3} stroke="#334155" strokeWidth="1" />
          <text x={toX(yr)} y={H - pad.b + 12} textAnchor="middle" fill="#64748b" fontSize="8">{yr}</text>
        </g>
      ))}

      {/* Annotations */}
      <line x1={toX(2017)} y1={toY(31)} x2={toX(2017)} y2={toY(31) - 22} stroke="#f87171" strokeWidth="1" strokeDasharray="3,2" />
      <text x={toX(2017)} y={toY(31) - 26} textAnchor="middle" fill="#f87171" fontSize="7">Harvey/Irma/Maria</text>

      <circle cx={toX(2024)} cy={toY(44)} r="4" fill="#22c55e" />
      <text x={toX(2024) - 5} y={toY(44) - 7} textAnchor="end" fill="#86efac" fontSize="8">$44B</text>
    </svg>
  );
}

const TRIGGER_TYPES = [
  {
    type: "Indemnity",
    desc: "Pays based on sponsor's actual losses. Most precise coverage but slowest payout; requires loss development.",
    pro: "No basis risk",
    con: "Slow settlement; moral hazard",
    color: "blue",
  },
  {
    type: "Industry Index",
    desc: "Triggered by industry-wide loss estimates (PCS index). Faster than indemnity; some basis risk vs sponsor book.",
    pro: "Fast, transparent",
    con: "Basis risk",
    color: "green",
  },
  {
    type: "Parametric",
    desc: "Triggered by physical parameters (wind speed, Richter magnitude). Fastest payout — often within 30 days.",
    pro: "Instant payout",
    con: "High basis risk",
    color: "amber",
  },
  {
    type: "Modeled Loss",
    desc: "Third-party model (RMS/AIR) runs sponsor's portfolio against event parameters. Middle ground.",
    pro: "Transparent",
    con: "Model error risk",
    color: "purple",
  },
];

function CatBondsTab() {
  return (
    <div className="space-y-6">
      <div>
        <SectionHeader
          title="Cat Bond Structure"
          subtitle="A Special Purpose Vehicle issues notes to investors. Collateral is held in trust (US Treasuries). The sponsor pays a reinsurance premium; investors receive SOFR + spread."
        />
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <CatBondStructureSVG />
        </div>
      </div>

      <div>
        <SectionHeader title="Trigger Types" subtitle="How and when the SPV releases collateral to the sponsor" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TRIGGER_TYPES.map((t) => {
            const colorCls = {
              blue: { border: "border-blue-500/20", bg: "bg-blue-500/5", title: "text-blue-400", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
              green: { border: "border-green-500/20", bg: "bg-green-500/5", title: "text-green-400", badge: "bg-green-500/10 text-green-400 border-green-500/20" },
              amber: { border: "border-amber-500/20", bg: "bg-amber-500/5", title: "text-amber-400", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
              purple: { border: "border-purple-500/20", bg: "bg-purple-500/5", title: "text-purple-400", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
            }[t.color];
            return (
              <div key={t.type} className={cn("rounded-lg border p-4", colorCls?.border, colorCls?.bg)}>
                <div className={cn("text-sm font-semibold mb-1.5", colorCls?.title)}>{t.type} Trigger</div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{t.desc}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className={cn("rounded px-2 py-0.5 text-xs border", colorCls?.badge)}>+ {t.pro}</span>
                  <span className="rounded px-2 py-0.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20">- {t.con}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeader title="Expected Loss vs Spread" subtitle="Investors require a multiple of expected loss — typically 2.5–3.5× EL — as compensation for illiquidity and model uncertainty." />
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <ExpectedLossSpreadSVG />
        </div>
      </div>

      <div>
        <SectionHeader title="Cat Bond Market Growth (2000–2024)" subtitle="Market grew from $2.5B to $44B outstanding — driven by post-catastrophe demand surges and pension fund ILS allocations." />
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <CatBondGrowthSVG />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Cat Bond vs Traditional Reinsurance" variant="blue">
          Cat bonds offer fully collateralized coverage (no counterparty credit risk), multi-year terms (3-year typical), and capital markets efficiency. Traditional reinsurance relies on reinsurer credit; pricing is annual; relationships matter more than price transparency.
        </InfoBox>
        <InfoBox title="Cat Bond Returns vs Corp Bonds" variant="green">
          Cat bonds historically have low correlation to equity and credit markets (correlation &lt; 0.1 vs S&amp;P 500). Returns are driven by catastrophe risk, not economic cycles. During 2008 financial crisis, cat bonds outperformed — but 2017 and 2022 hurricane seasons caused significant losses.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 3: ILS & Capital Markets ───────────────────────────────────────────────

const ILS_TAXONOMY = [
  {
    name: "Catastrophe Bonds",
    size: "$44B",
    liquidity: "Secondary (TRACE)",
    collateral: "100% US Treasuries",
    tenor: "3–5 years",
    color: "blue",
  },
  {
    name: "Sidecars",
    size: "$3–5B",
    liquidity: "Illiquid",
    collateral: "100% trust",
    tenor: "1 year (seasonal)",
    color: "purple",
  },
  {
    name: "Collateralized Re",
    size: "$50B+",
    liquidity: "Illiquid",
    collateral: "100% trust",
    tenor: "1–3 years",
    color: "green",
  },
  {
    name: "ILS Funds / CLO-style",
    size: "$100B+",
    liquidity: "Quarterly redemptions",
    collateral: "Diversified portfolio",
    tenor: "Open-ended",
    color: "amber",
  },
];

function SecondaryLiquiditySVG() {
  resetSeed(912);
  // Simulate bid-ask spread over time post-issuance
  const weeks = Array.from({ length: 24 }, (_, i) => i);
  const bids = weeks.map((w) => {
    const base = 98 - Math.max(0, 3 - w * 0.2);
    return base + (rand() - 0.5) * 0.6;
  });
  const asks = bids.map((b) => b + 0.5 + rand() * 0.6);

  const W = 500, H = 150;
  const pad = { l: 40, r: 20, t: 24, b: 28 };
  const minV = 93, maxV = 101;

  const toX = (w: number) => pad.l + (w / 23) * (W - pad.l - pad.r);
  const toY = (v: number) => pad.t + (1 - (v - minV) / (maxV - minV)) * (H - pad.t - pad.b);

  const bidPath = bids.map((b, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(b)}`).join(" ");
  const askPath = asks.map((a, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(a)}`).join(" ");
  const areaPath = bids.map((b, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(b)}`).join(" ")
    + " " + asks.map((a, i) => `${i === 23 ? "M" : "L"}${toX(23 - i)},${toY(asks[23 - i])}`).join(" ") + " Z";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
      <text x={W / 2} y="14" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Cat Bond Secondary Market — Bid/Ask Price over 24 Weeks Post-Issuance</text>

      <defs>
        <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill="url(#spreadGrad)" />
      <path d={bidPath} fill="none" stroke="#22c55e" strokeWidth="1.5" />
      <path d={askPath} fill="none" stroke="#f87171" strokeWidth="1.5" />

      {/* Axes */}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="#334155" strokeWidth="1" />
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="#334155" strokeWidth="1" />

      {[94, 96, 98, 100].map((v) => (
        <g key={v}>
          <line x1={pad.l} y1={toY(v)} x2={W - pad.r} y2={toY(v)} stroke="#1e293b" strokeWidth="1" />
          <text x={pad.l - 5} y={toY(v) + 3} textAnchor="end" fill="#64748b" fontSize="8">{v}</text>
        </g>
      ))}

      {[0, 6, 12, 18, 23].map((w) => (
        <g key={w}>
          <line x1={toX(w)} y1={H - pad.b} x2={toX(w)} y2={H - pad.b + 3} stroke="#334155" strokeWidth="1" />
          <text x={toX(w)} y={H - pad.b + 12} textAnchor="middle" fill="#64748b" fontSize="8">Wk {w}</text>
        </g>
      ))}

      <text x={W - 80} y={toY(bids[20]) - 5} fill="#86efac" fontSize="8">Bid</text>
      <text x={W - 80} y={toY(asks[20]) + 12} fill="#f87171" fontSize="8">Ask</text>
      <text x={W / 2} y={H - 4} textAnchor="middle" fill="#475569" fontSize="7">Spread typically 0.5–1.5 pts; widens near renewal season or cat events</text>
    </svg>
  );
}

function BasicsRiskSVG() {
  return (
    <svg viewBox="0 0 520 130" className="w-full" style={{ maxHeight: 130 }}>
      <text x="260" y="14" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Basis Risk in Parametric Triggers — Gap Between Trigger and Actual Loss</text>

      {/* Actual loss bar */}
      <rect x="60" y="30" width="180" height="28" rx="4" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
      <text x="150" y="49" textAnchor="middle" fill="#fca5a5" fontSize="9">Sponsor Actual Loss: $120M</text>

      {/* Parametric payout bar */}
      <rect x="60" y="70" width="100" height="28" rx="4" fill="#064e3b" stroke="#22c55e" strokeWidth="1" />
      <text x="110" y="89" textAnchor="middle" fill="#86efac" fontSize="9">Parametric Payout: $65M</text>

      {/* Basis risk gap */}
      <rect x="164" y="70" width="76" height="28" rx="4" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
      <text x="202" y="89" textAnchor="middle" fill="#fcd34d" fontSize="9">Basis Risk Gap</text>
      <text x="202" y="100" textAnchor="middle" fill="#f59e0b" fontSize="8">$55M unrecovered</text>

      <line x1="240" y1="44" x2="240" y2="70" stroke="#475569" strokeWidth="1" strokeDasharray="3,2" />

      {/* Industry index */}
      <rect x="310" y="30" width="180" height="28" rx="4" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
      <text x="400" y="49" textAnchor="middle" fill="#fca5a5" fontSize="9">Industry Loss: $8.5B (PCS)</text>

      <rect x="310" y="70" width="150" height="28" rx="4" fill="#064e3b" stroke="#22c55e" strokeWidth="1" />
      <text x="385" y="89" textAnchor="middle" fill="#86efac" fontSize="9">Index Trigger Payout: ~$100M</text>

      <rect x="460" y="70" width="30" height="28" rx="4" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
      <text x="475" y="89" textAnchor="middle" fill="#fcd34d" fontSize="8">Gap</text>

      <text x="160" y="122" textAnchor="middle" fill="#64748b" fontSize="8">Parametric: largest basis risk</text>
      <text x="400" y="122" textAnchor="middle" fill="#64748b" fontSize="8">Industry index: moderate basis risk</text>
    </svg>
  );
}

function ILSTab() {
  return (
    <div className="space-y-6">
      <div>
        <SectionHeader
          title="Insurance-Linked Securities Taxonomy"
          subtitle="ILS encompasses multiple instruments that transfer insurance risk to capital markets — from liquid cat bonds to bespoke collateralized reinsurance."
        />
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Instrument", "Market Size", "Liquidity", "Collateral", "Tenor"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ILS_TAXONOMY.map((item, i) => {
                const colorMap = {
                  blue: "text-blue-400",
                  purple: "text-purple-400",
                  green: "text-green-400",
                  amber: "text-amber-400",
                };
                return (
                  <tr key={item.name} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-muted/10" : "")}>
                    <td className={cn("px-4 py-2.5 font-medium", colorMap[item.color as keyof typeof colorMap])}>{item.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{item.size}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{item.liquidity}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{item.collateral}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{item.tenor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <SectionHeader title="Collateral Mechanics" subtitle="All ILS instruments require 100% collateralization — eliminating counterparty credit risk that plagues traditional reinsurance." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              icon: Lock,
              title: "Trust Structure",
              desc: "Investor principal held in a Cayman or Bermuda trust in US Treasuries or money market funds. Released only on a qualifying trigger event or bond maturity.",
              color: "blue",
            },
            {
              icon: RefreshCw,
              title: "Collateral Return",
              desc: "At maturity, if no trigger occurs, 100% of principal is returned to investors plus all accrued coupons. Treasury yield adds to cat bond total return.",
              color: "green",
            },
            {
              icon: AlertTriangle,
              title: "Extension Risk",
              desc: "Indemnity bonds may face 'extension periods' — 12–24 months after maturity date — while actual losses are still developing. Capital is locked during this period.",
              color: "amber",
            },
          ].map((item) => {
            const Icon = item.icon;
            const cls = {
              blue: { border: "border-blue-500/20", bg: "bg-blue-500/5", icon: "text-blue-400" },
              green: { border: "border-green-500/20", bg: "bg-green-500/5", icon: "text-green-400" },
              amber: { border: "border-amber-500/20", bg: "bg-amber-500/5", icon: "text-amber-400" },
            }[item.color];
            return (
              <div key={item.title} className={cn("rounded-lg border p-4", cls?.border, cls?.bg)}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className={cls?.icon} />
                  <span className="text-sm font-semibold text-foreground">{item.title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeader title="Basis Risk in Parametric Triggers" subtitle="When the trigger parameter does not match the sponsor's actual loss, basis risk creates a recovery gap." />
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <BasicsRiskSVG />
        </div>
      </div>

      <div>
        <SectionHeader title="Secondary Market Liquidity" subtitle="Cat bonds trade OTC via broker-dealers; TRACE reporting since 2018 has improved price discovery." />
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <SecondaryLiquiditySVG />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InfoBox title="Leading ILS Fund Managers" variant="blue">
          <ul className="space-y-1 text-xs">
            {[
              "Fermat Capital Management — pioneer, ~$9B AUM",
              "Nephila Capital (Markel) — ~$12B AUM",
              "Schroder Secquaero — European, multi-strategy",
              "Leadenhall Capital — London-based",
              "Elementum Advisors — multi-peril",
            ].map((item) => (
              <li key={item} className="flex items-start gap-1"><span className="text-blue-400 mt-0.5">•</span>{item}</li>
            ))}
          </ul>
        </InfoBox>
        <InfoBox title="Pension Fund ILS Rationale" variant="green">
          ILS returns are driven by natural catastrophe risk — fundamentally uncorrelated with equity market cycles or credit spreads. A $100B pension fund allocating 2–5% to ILS gains uncorrelated carry (~7–12% historical) that improves portfolio Sharpe ratio without adding market beta.
        </InfoBox>
        <InfoBox title="Collateralized Re vs Cat Bonds" variant="purple">
          Collateralized reinsurance ($50B+ market) is private, negotiated directly between cedent and ILS funds. No public offering, no TRACE reporting, higher illiquidity premium (~200–300bps vs comparable cat bonds) but also higher execution risk and less price transparency.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 4: Underwriting Cycles ─────────────────────────────────────────────────

function UnderwritingCycleSVG() {
  resetSeed(912);
  // Simulated rate-on-line (ROL) index and combined ratio cycle
  const years = Array.from({ length: 30 }, (_, i) => 1994 + i);

  // Rate-on-line index (normalized, 100 = 2002)
  const rol: number[] = [
    85, 82, 78, 74, 72, 80, 78, 100, 130, 145,
    140, 132, 115, 108, 100, 98, 96, 95, 94, 115,
    140, 145, 110, 105, 100, 120, 160, 175, 165, 158,
  ];

  // Combined ratio
  const cr: number[] = [
    105, 102, 99, 98, 97, 110, 115, 130, 100, 92,
    95, 97, 100, 103, 105, 102, 103, 105, 115, 102,
    98, 120, 130, 110, 102, 100, 95, 92, 94, 96,
  ];

  const W = 560, H = 180;
  const pad = { l: 46, r: 20, t: 24, b: 30 };
  const minRol = 60, maxRol = 190;
  const minCr = 85, maxCr = 140;

  const toX = (i: number) => pad.l + (i / 29) * (W - pad.l - pad.r);
  const toYRol = (v: number) => pad.t + (1 - (v - minRol) / (maxRol - minRol)) * (H - pad.t - pad.b);
  const toYCr = (v: number) => pad.t + (1 - (v - minCr) / (maxCr - minCr)) * (H - pad.t - pad.b);

  const rolPath = rol.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toYRol(v)}`).join(" ");
  const crPath = cr.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toYCr(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
      <text x={W / 2} y="14" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Reinsurance Rate-on-Line Index vs Combined Ratio (1994–2023)</text>

      {/* Grid */}
      {[90, 110, 130, 150, 170].map((v) => (
        <line key={v} x1={pad.l} y1={toYRol(v)} x2={W - pad.r} y2={toYRol(v)} stroke="#1e293b" strokeWidth="1" />
      ))}

      {/* Combined ratio 100% line */}
      <line x1={pad.l} y1={toYCr(100)} x2={W - pad.r} y2={toYCr(100)} stroke="#374151" strokeWidth="1" strokeDasharray="4,3" />
      <text x={pad.l + 2} y={toYCr(100) - 3} fill="#6b7280" fontSize="7">CR=100%</text>

      {/* Axes */}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="#334155" strokeWidth="1" />
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="#334155" strokeWidth="1" />

      {/* Y labels */}
      {[80, 100, 120, 140, 160, 180].map((v) => (
        <text key={v} x={pad.l - 5} y={toYRol(v) + 3} textAnchor="end" fill="#64748b" fontSize="7">{v}</text>
      ))}

      {/* X labels */}
      {[1994, 1999, 2001, 2005, 2011, 2017, 2022, 2023].map((yr) => {
        const idx = yr - 1994;
        return (
          <g key={yr}>
            <line x1={toX(idx)} y1={H - pad.b} x2={toX(idx)} y2={H - pad.b + 3} stroke="#334155" strokeWidth="1" />
            <text x={toX(idx)} y={H - pad.b + 12} textAnchor="middle" fill="#64748b" fontSize="7">{yr}</text>
          </g>
        );
      })}

      {/* Lines */}
      <path d={rolPath} fill="none" stroke="#6366f1" strokeWidth="2" />
      <path d={crPath} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3" />

      {/* Annotations */}
      {[
        { yr: 2001, label: "9/11 + WTC", color: "#f87171" },
        { yr: 2005, label: "Katrina/Rita", color: "#f87171" },
        { yr: 2017, label: "Harvey/Irma/Maria", color: "#f87171" },
        { yr: 2022, label: "Ian + Inflation", color: "#f87171" },
      ].map(({ yr, label, color }) => {
        const idx = yr - 1994;
        return (
          <g key={yr}>
            <line x1={toX(idx)} y1={toYRol(rol[idx]) - 2} x2={toX(idx)} y2={toYRol(rol[idx]) - 18} stroke={color} strokeWidth="1" strokeDasharray="2,2" />
            <text x={toX(idx)} y={toYRol(rol[idx]) - 22} textAnchor="middle" fill={color} fontSize="7">{label}</text>
          </g>
        );
      })}

      {/* Legend */}
      <line x1={W - 160} y1={H - 22} x2={W - 140} y2={H - 22} stroke="#6366f1" strokeWidth="2" />
      <text x={W - 136} y={H - 19} fill="#a5b4fc" fontSize="8">ROL Index</text>
      <line x1={W - 80} y1={H - 22} x2={W - 60} y2={H - 22} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,2" />
      <text x={W - 56} y={H - 19} fill="#fcd34d" fontSize="8">Comb. Ratio</text>
    </svg>
  );
}

function CombinedRatioSVG() {
  const components = [
    { label: "Loss Ratio", value: 62, color: "#ef4444", desc: "Losses incurred / premiums earned" },
    { label: "Expense Ratio", value: 30, color: "#f59e0b", desc: "Operating expenses / premiums written" },
    { label: "Combined Ratio", value: 92, color: "#22c55e", desc: "Loss + Expense ratio (below 100 = underwriting profit)" },
  ];

  return (
    <svg viewBox="0 0 480 120" className="w-full" style={{ maxHeight: 120 }}>
      <text x="240" y="14" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Combined Ratio Decomposition</text>

      {components.map((c, i) => {
        const y = 28 + i * 28;
        const barW = (c.value / 120) * 300;
        return (
          <g key={c.label}>
            <text x="95" y={y + 13} textAnchor="end" fill="#94a3b8" fontSize="9">{c.label}</text>
            <rect x="100" y={y} width={barW} height="20" rx="3" fill={c.color} opacity="0.7" />
            <text x={100 + barW + 5} y={y + 13} fill={c.color} fontSize="9" fontWeight="600">{c.value}%</text>
            <text x={100 + barW + 35} y={y + 13} fill="#64748b" fontSize="8">{c.desc}</text>
          </g>
        );
      })}

      <line x1="100" y1="108" x2="400" y2="108" stroke="#334155" strokeWidth="1" />
      <text x="250" y="118" textAnchor="middle" fill="#475569" fontSize="8">Combined ratio below 100% = underwriting profit; above 100% = underwriting loss (offset by investment income)</text>
    </svg>
  );
}

const UNDERWRITING_PHASES = [
  {
    phase: "Hard Market",
    icon: TrendingUp,
    color: "green",
    signs: ["Rates rising 20–40%+ YoY", "Capacity withdrawn", "Stricter terms/exclusions", "High combined ratios preceding"],
    cause: "Post-catastrophe losses, reserve shortfalls, capital depletion",
  },
  {
    phase: "Soft Market",
    icon: TrendingDown,
    color: "red",
    signs: ["Rates flat or declining", "New entrants / ILS capital", "Broad coverage, low deductibles", "Combined ratios near 95–100"],
    cause: "Capital surplus, absence of major losses, competition",
  },
];

function CyclesTab() {
  return (
    <div className="space-y-6">
      <div>
        <SectionHeader
          title="Hard vs Soft Market Cycle"
          subtitle="Reinsurance pricing oscillates between hard (high rates) and soft (low rates) markets driven by capital flows and catastrophe losses."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UNDERWRITING_PHASES.map((phase) => {
            const Icon = phase.icon;
            const cls = {
              green: { border: "border-green-500/20", bg: "bg-green-500/5", icon: "text-green-400", title: "text-green-400", badge: "bg-green-500/10 text-green-400 border-green-500/20" },
              red: { border: "border-red-500/20", bg: "bg-red-500/5", icon: "text-red-400", title: "text-red-400", badge: "bg-red-500/10 text-red-400 border-red-500/20" },
            }[phase.color];
            return (
              <div key={phase.phase} className={cn("rounded-lg border p-4", cls?.border, cls?.bg)}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={16} className={cls?.icon} />
                  <span className={cn("text-sm font-semibold", cls?.title)}>{phase.phase}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 italic">{phase.cause}</p>
                <ul className="space-y-1">
                  {phase.signs.map((s) => (
                    <li key={s} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className={cn("mt-0.5", cls?.icon)}>•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeader title="Rate-on-Line Index vs Combined Ratio (1994–2023)" subtitle="Rate spikes follow catastrophe loss years. Hard market conditions persist 2–4 years post-event before softening." />
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <UnderwritingCycleSVG />
        </div>
      </div>

      <div>
        <SectionHeader title="Combined Ratio Components" subtitle="Below 100% = underwriting profit. Most reinsurers target CR of 90–97% over the cycle." />
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <CombinedRatioSVG />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Post-2017 Harvey/Irma/Maria Hardening" variant="amber">
          2017 was the costliest year in reinsurance history (~$135B insured losses). Rates spiked 20–50% in affected lines (Florida wind, Caribbean, US hurricane). ILS funds saw major losses; sidecars wound down. Market hardened through 2019 before softening on absence of major 2018–2020 events.
        </InfoBox>
        <InfoBox title="Post-2022 Ian + Inflation Hardening" variant="amber">
          Hurricane Ian ($60B insured loss) combined with social inflation, litigation funding, and construction cost inflation drove the sharpest global rate hardening in 20 years. January 2023 reinsurance renewals saw 40–60% rate increases on Florida property risk; some cedents struggled to place coverage.
        </InfoBox>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox title="Florida Market Crisis" variant="amber">
          Florida's Citizens Property Insurance (state insurer of last resort) grew to 1.4M policies by 2023 as private insurers exited. Six Florida-domiciled insurers became insolvent 2021–2022. Root causes: assignment of benefits (AOB) abuse, litigation costs, and reinsurance unavailability. Depopulation of Citizens became a key policy priority.
        </InfoBox>
        <InfoBox title="Climate Change &amp; Model Divergence" variant="amber">
          Cat models (RMS/AIR/Verisk) are calibrated on historical data that may understate future losses from climate-driven intensification of hurricanes, wildfires, and flood. Reinsurers increasingly apply "climate load" factors (+10–30%) to model outputs. Secondary perils (floods, hail, convective storms) now account for 50%+ of industry losses, outpacing model predictions.
        </InfoBox>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatChip label="2022–23 ROL Increase (FL Wind)" value="+60%" color="red" />
        <StatChip label="Citizens Policies Peak (2023)" value="1.4M" color="amber" />
        <StatChip label="2017 Season Insured Losses" value="$135B" color="red" />
        <StatChip label="Climate Load Premium" value="+10–30%" color="amber" />
        <StatChip label="Secondary Peril Loss Share" value="50%+" color="purple" />
        <StatChip label="Target Combined Ratio" value="90–97%" color="green" />
      </div>

      <InfoBox title="Retrocession Market" variant="purple">
        Reinsurers themselves buy protection — called <strong className="text-purple-300">retrocession</strong> — from the broader market including other reinsurers, ILS funds, and Lloyd's syndicates. The retrocession market is notoriously thin and expensive; in hard markets, retro capacity disappears first, forcing reinsurers to either retain more risk or reduce capacity to cedents. The "spiral" risk — where losses recycle through the retro market repeatedly — was a significant issue in the 1990s Lloyd's market.
      </InfoBox>
    </div>
  );
}

// ── Page Root ──────────────────────────────────────────────────────────────────

const TABS = [
  { value: "basics", label: "Reinsurance Basics", icon: Shield },
  { value: "catbonds", label: "Catastrophe Bonds", icon: Zap },
  { value: "ils", label: "ILS & Capital Markets", icon: Globe },
  { value: "cycles", label: "Underwriting Cycles", icon: Activity },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function ReinsurancePage() {
  const [activeTab, setActiveTab] = useState<TabValue>("basics");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg p-2 bg-blue-500/10 border border-blue-500/20">
              <Shield size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Reinsurance Markets</h1>
              <p className="text-sm text-muted-foreground">
                Insurance of insurers — cat bonds, ILS, and underwriting cycles
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: "Global Reinsurance Premium", value: "$340B", color: "blue" as const },
              { label: "Cat Bond Outstanding", value: "$44B", color: "green" as const },
              { label: "ILS Market Total", value: "$100B+", color: "purple" as const },
              { label: "2023 Jan Renewal ROL", value: "+40–60%", color: "red" as const },
            ].map((chip) => (
              <StatChip key={chip.label} label={chip.label} value={chip.value} color={chip.color} />
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="mb-6 flex flex-wrap gap-1 h-auto bg-muted/40 p-1 rounded-lg">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
              >
                <Icon size={12} />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basics" className="data-[state=inactive]:hidden">
            <motion.div
              key="basics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BasicsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="catbonds" className="data-[state=inactive]:hidden">
            <motion.div
              key="catbonds"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CatBondsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="ils" className="data-[state=inactive]:hidden">
            <motion.div
              key="ils"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ILSTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="cycles" className="data-[state=inactive]:hidden">
            <motion.div
              key="cycles"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CyclesTab />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
