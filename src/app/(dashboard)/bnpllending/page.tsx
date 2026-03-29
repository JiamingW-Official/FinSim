"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  BarChart3,
  DollarSign,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  XCircle,
  Info,
  Building2,
  Globe,
  Lock,
  Scale,
  Activity,
  Layers,
  ChevronRight,
  Percent,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 892;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Consume a few initial values
void rand(); void rand(); void rand();

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtUSD(n: number, decimals = 0): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

function fmtB(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return fmtUSD(n);
}

// ── Shared UI Components ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral" | "warn";
  icon?: React.ReactNode;
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : highlight === "warn"
      ? "text-amber-400"
      : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-foreground/5 p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={cn("text-xl font-bold", valClass)}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
      {children}
    </h3>
  );
}

function InfoBox({
  children,
  variant = "blue",
}: {
  children: React.ReactNode;
  variant?: "blue" | "amber" | "emerald" | "rose";
}) {
  const colors = {
    blue: "bg-primary/10 border-border text-primary",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
    rose: "bg-rose-500/10 border-rose-500/30 text-rose-200",
  };
  return (
    <div className={cn("rounded-lg border p-3 text-xs leading-relaxed", colors[variant])}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — BNPL Business Model
// ══════════════════════════════════════════════════════════════════════════════

// Pay-in-4 Mechanics SVG
function PayIn4SVG() {
  return (
    <svg viewBox="0 0 700 200" className="w-full h-auto">
      {/* Background */}
      <rect width={700} height={200} fill="transparent" />

      {/* Merchant Box */}
      <rect x={20} y={60} width={130} height={80} rx={10} fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.4)" strokeWidth={1.5} />
      <text x={85} y={88} textAnchor="middle" fill="#93c5fd" fontSize={11} fontWeight="600">MERCHANT</text>
      <text x={85} y={105} textAnchor="middle" fill="#60a5fa" fontSize={9}>Shopify / Retail</text>
      <text x={85} y={120} textAnchor="middle" fill="#60a5fa" fontSize={9}>Amazon / etc.</text>

      {/* BNPL Provider Box */}
      <rect x={285} y={40} width={130} height={120} rx={10} fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth={1.5} />
      <text x={350} y={72} textAnchor="middle" fill="#c4b5fd" fontSize={11} fontWeight="600">BNPL PROVIDER</text>
      <text x={350} y={90} textAnchor="middle" fill="#a78bfa" fontSize={9}>Affirm / Klarna</text>
      <text x={350} y={106} textAnchor="middle" fill="#a78bfa" fontSize={9}>Afterpay / PayPal</text>
      <text x={350} y={122} textAnchor="middle" fill="#a78bfa" fontSize={9}>Credit Risk Bearer</text>
      <text x={350} y={138} textAnchor="middle" fill="#a78bfa" fontSize={9}>Funds Merchant Upfront</text>

      {/* Consumer Box */}
      <rect x={550} y={60} width={130} height={80} rx={10} fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.4)" strokeWidth={1.5} />
      <text x={615} y={88} textAnchor="middle" fill="#6ee7b7" fontSize={11} fontWeight="600">CONSUMER</text>
      <text x={615} y={105} textAnchor="middle" fill="#34d399" fontSize={9}>Pay 25% today</text>
      <text x={615} y={120} textAnchor="middle" fill="#34d399" fontSize={9}>3 more in 2-wk intervals</text>

      {/* Arrows: Merchant -> BNPL */}
      <defs>
        <marker id="arrowM" markerWidth={8} markerHeight={8} refX={4} refY={3} orient="auto">
          <path d="M0,0 L0,6 L8,3 Z" fill="#9ca3af" />
        </marker>
      </defs>
      <path d="M 155 75 Q 220 50 282 70" stroke="rgba(156,163,175,0.6)" strokeWidth={1.5} fill="none" markerEnd="url(#arrowM)" />
      <text x={218} y={50} textAnchor="middle" fill="#9ca3af" fontSize={9}>MDR 2–6%</text>
      <text x={218} y={60} textAnchor="middle" fill="#6b7280" fontSize={8}>merchant discount rate</text>

      {/* Arrow: BNPL -> Merchant (full payment) */}
      <path d="M 284 100 Q 220 115 157 105" stroke="rgba(16,185,129,0.5)" strokeWidth={1.5} fill="none" markerEnd="url(#arrowM)" />
      <text x={218} y={125} textAnchor="middle" fill="#34d399" fontSize={9}>100% payout</text>
      <text x={218} y={135} textAnchor="middle" fill="#6b7280" fontSize={8}>instant settlement</text>

      {/* Arrow: Consumer -> BNPL (installments) */}
      <path d="M 548 80 Q 490 55 418 70" stroke="rgba(251,191,36,0.6)" strokeWidth={1.5} fill="none" markerEnd="url(#arrowM)" />
      <text x={488} y={50} textAnchor="middle" fill="#fbbf24" fontSize={9}>4 installments</text>
      <text x={488} y={60} textAnchor="middle" fill="#6b7280" fontSize={8}>every 2 weeks</text>

      {/* Arrow: BNPL -> Consumer (credit) */}
      <path d="M 416 115 Q 490 130 546 115" stroke="rgba(139,92,246,0.5)" strokeWidth={1.5} fill="none" markerEnd="url(#arrowM)" />
      <text x={488} y={140} textAnchor="middle" fill="#a78bfa" fontSize={9}>instant credit</text>
      <text x={488} y={150} textAnchor="middle" fill="#6b7280" fontSize={8}>soft credit check</text>

      {/* Bottom labels */}
      <text x={85} y={165} textAnchor="middle" fill="#6b7280" fontSize={8}>Gets full payment</text>
      <text x={85} y={175} textAnchor="middle" fill="#6b7280" fontSize={8}>minus MDR, same day</text>
      <text x={350} y={185} textAnchor="middle" fill="#6b7280" fontSize={8}>Earns MDR spread minus credit losses</text>
      <text x={615} y={165} textAnchor="middle" fill="#6b7280" fontSize={8}>Splits purchase into</text>
      <text x={615} y={175} textAnchor="middle" fill="#6b7280" fontSize={8}>interest-free installments</text>
    </svg>
  );
}

// Unit Economics Waterfall SVG
function UnitEconomicsWaterfallSVG() {
  const bars = [
    { label: "Revenue\n(MDR 3.5%)", value: 3.5, color: "#3b82f6", type: "add" as const },
    { label: "Late Fees\n(0.4%)", value: 0.4, color: "#8b5cf6", type: "add" as const },
    { label: "Credit Losses\n(-1.8%)", value: -1.8, color: "#ef4444", type: "sub" as const },
    { label: "Funding Cost\n(-0.9%)", value: -0.9, color: "#f97316", type: "sub" as const },
    { label: "CAC / Ops\n(-0.7%)", value: -0.7, color: "#eab308", type: "sub" as const },
    { label: "Net Margin\n(0.5%)", value: 0.5, color: "#10b981", type: "net" as const },
  ];

  const W = 640;
  const H = 220;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 50;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barW = Math.floor(chartW / bars.length) - 8;
  const maxVal = 4.5;

  let runningBase = 0;
  const computedBars = bars.map((b) => {
    const base = b.type === "sub" ? runningBase + b.value : runningBase;
    const height = Math.abs(b.value);
    if (b.type !== "net") runningBase += b.value;
    return { ...b, base, height };
  });

  function toY(v: number) {
    return padT + chartH - (v / maxVal) * chartH;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {[0, 1, 2, 3, 4].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={toY(v)} y2={toY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          <text x={padL - 6} y={toY(v) + 4} textAnchor="end" fill="#6b7280" fontSize={9}>{v}%</text>
        </g>
      ))}
      {/* Zero line */}
      <line x1={padL} x2={W - padR} y1={toY(0)} y2={toY(0)} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

      {/* Bars */}
      {computedBars.map((b, i) => {
        const x = padL + i * (barW + 8) + 4;
        const y = toY(b.base + b.height);
        const h = (b.height / maxVal) * chartH;
        const isNet = b.type === "net";
        const label = b.label.split("\n");
        return (
          <g key={b.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={3}
              fill={b.color}
              fillOpacity={isNet ? 1 : 0.7}
              stroke={b.color}
              strokeWidth={isNet ? 2 : 0}
            />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill={b.color} fontSize={10} fontWeight="600">
              {b.value > 0 ? "+" : ""}{b.value}%
            </text>
            {label.map((line, li) => (
              <text key={li} x={x + barW / 2} y={H - padB + 14 + li * 11} textAnchor="middle" fill="#9ca3af" fontSize={8}>
                {line}
              </text>
            ))}
            {/* Connector line */}
            {i < computedBars.length - 1 && b.type !== "net" && (
              <line
                x1={x + barW}
                x2={x + barW + 8}
                y1={toY(b.base + b.height)}
                y2={toY(b.base + b.height)}
                stroke="rgba(255,255,255,0.2)"
                strokeDasharray="2,2"
              />
            )}
          </g>
        );
      })}

      {/* Title */}
      <text x={W / 2} y={12} textAnchor="middle" fill="#d1d5db" fontSize={10} fontWeight="600">Unit Economics Waterfall — % of GMV</text>
    </svg>
  );
}

interface BNPLPlayer {
  name: string;
  gmv: string;
  takeRate: string;
  creditLoss: string;
  positioning: string;
  model: string;
  profitable: boolean;
}

const BNPL_PLAYERS: BNPLPlayer[] = [
  { name: "Affirm", gmv: "$20.4B", takeRate: "7.2%", creditLoss: "3.8%", positioning: "Long-term 0%APR + high-APR loans", model: "Risk-based pricing / bank partner", profitable: false },
  { name: "Klarna", gmv: "$87B", takeRate: "2.8%", creditLoss: "1.9%", positioning: "Pay-in-4 + shopping app", model: "Swedish bank license / MDR focus", profitable: true },
  { name: "Afterpay (Block)", gmv: "$27.3B", takeRate: "4.1%", creditLoss: "2.2%", positioning: "No interest ever — late fees only", model: "Merchant-fee pure play", profitable: false },
  { name: "PayPal BNPL", gmv: "$34B", takeRate: "2.1%", creditLoss: "1.4%", positioning: "Checkout button incumbency", model: "Balance-sheet funded", profitable: true },
  { name: "Apple Pay Later", gmv: "~$2B", takeRate: "1.8%", creditLoss: "0.9%", positioning: "Native iOS wallet integration", model: "Apple Financing LLC (licensed)", profitable: false },
];

function Tab1BNPLModel() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Global BNPL GMV (2024)" value="$450B" sub="↑ 22% YoY" highlight="pos" icon={<DollarSign size={13} />} />
        <StatCard label="Avg Merchant Discount" value="3.8%" sub="vs 1.5-2.5% credit card" highlight="warn" icon={<Percent size={13} />} />
        <StatCard label="US BNPL Users" value="79M" sub="~30% of adults" highlight="neutral" icon={<Users size={13} />} />
        <StatCard label="Avg BNPL Order Size" value="$285" sub="vs $92 debit card AOV" highlight="neutral" icon={<ShoppingCart size={13} />} />
      </div>

      {/* Pay-in-4 Mechanics SVG */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <CreditCard size={14} />
          Pay-in-4 Flow Mechanics
        </SectionTitle>
        <PayIn4SVG />
      </div>

      {/* Revenue Model */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <SectionTitle>
            <DollarSign size={14} />
            Revenue Streams
          </SectionTitle>
          <div className="space-y-3">
            {[
              { label: "Merchant Discount Rate (MDR)", desc: "2–6% of transaction value paid by merchant for driving incremental sales and handling credit risk", pct: 72, color: "bg-primary" },
              { label: "Consumer Late Fees", desc: "Flat fees ($5–$15) when payment missed; capped by state law. 15–25% of consumers incur at least one", pct: 16, color: "bg-primary" },
              { label: "0% APR Loan Interest (Affirm)", desc: "Higher-ticket items (>$500) carry 10–36% APR financing — consumer paid interest", pct: 8, color: "bg-amber-500" },
              { label: "Interchange / Bank Fees", desc: "Virtual card-based BNPL earns Visa/MC interchange (~1.5%) at point of sale", pct: 4, color: "bg-emerald-500" },
            ].map((r) => (
              <div key={r.label} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">{r.label}</span>
                  <span className="text-xs text-muted-foreground">{r.pct}% of revenue</span>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/10">
                  <div className={cn("h-1.5 rounded-full", r.color)} style={{ width: `${r.pct}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <SectionTitle>
            <BarChart3 size={14} />
            Unit Economics — % of GMV
          </SectionTitle>
          <UnitEconomicsWaterfallSVG />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <InfoBox variant="blue">
              <strong>CAC Recovery:</strong> Avg BNPL CAC is $30–50 per user. With LTV of ~$120 over 24 months, payback requires ~8 transactions.
            </InfoBox>
            <InfoBox variant="amber">
              <strong>LTV Risk:</strong> High delinquency cohorts (sub-620 FICO) can flip unit economics negative. 90-day delinquency rate: ~2.3%.
            </InfoBox>
          </div>
        </div>
      </div>

      {/* Major Players Table */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Globe size={14} />
          Major Players Comparison
        </SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Provider", "GMV (2024)", "Take Rate", "Credit Loss", "Model", "Positioning", "Profitable"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BNPL_PLAYERS.map((p, i) => (
                <tr key={p.name} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-foreground/[0.02]" : "")}>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{p.name}</td>
                  <td className="py-2.5 px-3 text-primary">{p.gmv}</td>
                  <td className="py-2.5 px-3 text-emerald-300">{p.takeRate}</td>
                  <td className="py-2.5 px-3 text-rose-300">{p.creditLoss}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{p.model}</td>
                  <td className="py-2.5 px-3 text-muted-foreground max-w-[180px]">{p.positioning}</td>
                  <td className="py-2.5 px-3">
                    {p.profitable ? (
                      <CheckCircle size={14} className="text-emerald-400" />
                    ) : (
                      <XCircle size={14} className="text-rose-400" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <InfoBox variant="amber" >
          <strong>Profitability challenge:</strong> Most BNPL players operate at a loss due to heavy CAC spend and adverse credit selection (BNPL attracts subprime consumers priced out of credit cards). Funding costs have risen sharply since 2022 rate hikes, squeezing the spread between MDR income and cost of capital.
        </InfoBox>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Digital Credit Scoring
// ══════════════════════════════════════════════════════════════════════════════

// Real-time Decisioning Pipeline SVG
function DecisioningPipelineSVG() {
  const steps = [
    { label: "Application\nSubmit", sub: "Email / Device / IP", color: "#3b82f6", icon: "📱" },
    { label: "Identity\nVerify", sub: "KYC / AML check", color: "#8b5cf6", icon: "🔍" },
    { label: "Alt Data\nIngest", sub: "1,500+ features", color: "#f59e0b", icon: "⚡" },
    { label: "ML Model\nScore", sub: "XGBoost ensemble", color: "#06b6d4", icon: "🤖" },
    { label: "Rules\nEngine", sub: "Policy overlays", color: "#ec4899", icon: "⚖️" },
    { label: "Instant\nDecision", sub: "< 200ms", color: "#10b981", icon: "✓" },
  ];

  const W = 680;
  const H = 120;
  const itemW = Math.floor(W / steps.length);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {steps.map((step, i) => {
        const cx = i * itemW + itemW / 2;
        const isLast = i === steps.length - 1;
        const label = step.label.split("\n");
        return (
          <g key={step.label}>
            {/* Connector */}
            {!isLast && (
              <g>
                <line
                  x1={cx + itemW / 2 - 10}
                  x2={cx + itemW / 2 + 10}
                  y1={50}
                  y2={50}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={2}
                />
                <polygon
                  points={`${cx + itemW / 2 + 10},46 ${cx + itemW / 2 + 16},50 ${cx + itemW / 2 + 10},54`}
                  fill="rgba(255,255,255,0.3)"
                />
              </g>
            )}
            {/* Node */}
            <rect
              x={cx - 42}
              y={20}
              width={84}
              height={60}
              rx={8}
              fill={step.color + "22"}
              stroke={step.color + "66"}
              strokeWidth={1.5}
            />
            <text x={cx} y={42} textAnchor="middle" fontSize={16}>{step.icon}</text>
            {label.map((line, li) => (
              <text key={li} x={cx} y={58 + li * 11} textAnchor="middle" fill="white" fontSize={9} fontWeight="600">
                {line}
              </text>
            ))}
            <text x={cx} y={93} textAnchor="middle" fill="#6b7280" fontSize={8}>{step.sub}</text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 2} textAnchor="middle" fill="#6b7280" fontSize={9}>Total decisioning latency: 150–250ms from application submit to approve/decline</text>
    </svg>
  );
}

// Approval Rate vs Default Rate Curves SVG
function ApprovalDefaultCurvesSVG() {
  const W = 560;
  const H = 220;
  const padL = 50;
  const padB = 40;
  const padT = 20;
  const padR = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // X axis: credit score 500-800
  // Y axis: rate 0-100%
  const scoreRange = [500, 800];
  function toX(score: number) {
    return padL + ((score - scoreRange[0]) / (scoreRange[1] - scoreRange[0])) * chartW;
  }
  function toY(rate: number) {
    return padT + chartH - (rate / 100) * chartH;
  }

  // Traditional approval rate: starts low for poor credit, rises steeply
  function tradApproval(score: number) {
    if (score < 580) return 5;
    if (score < 670) return 20 + (score - 580) * 0.4;
    return Math.min(95, 56 + (score - 670) * 0.65);
  }
  // ML approval rate: higher across the board especially for thin-file
  function mlApproval(score: number) {
    if (score < 580) return 25 + (score - 500) * 0.3;
    if (score < 670) return 49 + (score - 580) * 0.45;
    return Math.min(97, 89 + (score - 670) * 0.06);
  }
  // Traditional default rate
  function tradDefault(score: number) {
    return Math.max(1, 55 - (score - 500) * 0.18);
  }
  // ML default rate (better calibrated)
  function mlDefault(score: number) {
    return Math.max(0.5, 40 - (score - 500) * 0.13);
  }

  const scores = Array.from({ length: 31 }, (_, i) => 500 + i * 10);

  function buildPath(fn: (score: number) => number) {
    return scores.map((score, i) => `${i === 0 ? "M" : "L"} ${toX(score)} ${toY(fn(score))}`).join(" ");
  }

  const xTicks = [500, 550, 600, 650, 700, 750, 800];
  const yTicks = [0, 20, 40, 60, 80, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={toY(v)} y2={toY(v)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          <text x={padL - 6} y={toY(v) + 4} textAnchor="end" fill="#6b7280" fontSize={8}>{v}%</text>
        </g>
      ))}
      {xTicks.map((v) => (
        <g key={v}>
          <line x1={toX(v)} x2={toX(v)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          <text x={toX(v)} y={H - padB + 12} textAnchor="middle" fill="#6b7280" fontSize={8}>{v}</text>
        </g>
      ))}

      {/* Axes */}
      <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

      {/* Curves */}
      {/* Traditional approval */}
      <path d={buildPath(tradApproval)} fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4,3" />
      {/* ML approval */}
      <path d={buildPath(mlApproval)} fill="none" stroke="#3b82f6" strokeWidth={2.5} />
      {/* Traditional default */}
      <path d={buildPath(tradDefault)} fill="none" stroke="#ef4444" strokeWidth={2} strokeDasharray="4,3" />
      {/* ML default */}
      <path d={buildPath(mlDefault)} fill="none" stroke="#ef4444" strokeWidth={2.5} />

      {/* Legend */}
      <line x1={padL + 8} x2={padL + 28} y1={padT + 8} y2={padT + 8} stroke="#3b82f6" strokeWidth={2.5} />
      <text x={padL + 32} y={padT + 12} fill="#93c5fd" fontSize={9}>ML Approval Rate</text>
      <line x1={padL + 8} x2={padL + 28} y1={padT + 22} y2={padT + 22} stroke="#3b82f6" strokeWidth={2} strokeDasharray="4,3" />
      <text x={padL + 32} y={padT + 26} fill="#93c5fd" fontSize={9}>Trad. Approval Rate</text>
      <line x1={padL + 160} x2={padL + 180} y1={padT + 8} y2={padT + 8} stroke="#ef4444" strokeWidth={2.5} />
      <text x={padL + 184} y={padT + 12} fill="#fca5a5" fontSize={9}>ML Default Rate</text>
      <line x1={padL + 160} x2={padL + 180} y1={padT + 22} y2={padT + 22} stroke="#ef4444" strokeWidth={2} strokeDasharray="4,3" />
      <text x={padL + 184} y={padT + 26} fill="#fca5a5" fontSize={9}>Trad. Default Rate</text>

      {/* Axis labels */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fill="#9ca3af" fontSize={9}>Credit Score (FICO)</text>
      <text x={10} y={padT + chartH / 2} textAnchor="middle" fill="#9ca3af" fontSize={9} transform={`rotate(-90, 10, ${padT + chartH / 2})`}>Rate (%)</text>
    </svg>
  );
}

// Alternative data features list
const ALT_DATA_FEATURES = [
  { category: "Banking Behavior", features: ["Cash flow patterns", "Avg daily balance", "Overdraft frequency", "Direct deposit regularity", "Paycheck timing/variability"], icon: <Building2 size={12} /> },
  { category: "Device & Digital", features: ["Device type & OS age", "App install patterns", "Location consistency", "Browser history signals", "Email domain quality"], icon: <Zap size={12} /> },
  { category: "Rent & Utilities", features: ["On-time rent payment history", "Utility bill regularity", "Telecom payment data", "Subscription services", "Insurance premium payments"], icon: <Shield size={12} /> },
  { category: "Employment & Income", features: ["Employer verification", "Income volatility", "Job tenure signals", "Gig income detection", "Tax return data (with consent)"], icon: <TrendingUp size={12} /> },
];

function Tab2DigitalScoring() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Thin-File Americans" value="45M" sub="No scoreable credit history" highlight="warn" icon={<Users size={13} />} />
        <StatCard label="ML Model Features" value="1,500+" sub="vs 3 bureau scores (traditional)" highlight="pos" icon={<BarChart3 size={13} />} />
        <StatCard label="Decisioning Speed" value="<200ms" sub="Real-time credit decisions" highlight="pos" icon={<Zap size={13} />} />
        <StatCard label="ML Approval Lift" value="+35%" sub="vs bureau-only at same loss rate" highlight="pos" icon={<TrendingUp size={13} />} />
      </div>

      {/* Traditional vs Alt Data Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <SectionTitle>
            <Scale size={14} />
            Traditional Credit Scoring
          </SectionTitle>
          <div className="space-y-2 mb-3">
            {[
              { factor: "Payment History", weight: 35, color: "bg-primary" },
              { factor: "Credit Utilization", weight: 30, color: "bg-primary" },
              { factor: "Credit History Length", weight: 15, color: "bg-primary/30" },
              { factor: "Credit Mix", weight: 10, color: "bg-primary/20" },
              { factor: "New Credit Inquiries", weight: 10, color: "bg-primary/10" },
            ].map((f) => (
              <div key={f.factor} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{f.factor}</span>
                  <span className="text-muted-foreground">{f.weight}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/10">
                  <div className={cn("h-1.5 rounded-full", f.color)} style={{ width: `${f.weight * 2}%` }} />
                </div>
              </div>
            ))}
          </div>
          <InfoBox variant="amber">
            <strong>Limitations:</strong> Penalizes thin-file consumers (immigrants, young adults, unbanked). Cannot capture real-time financial behavior. ~3-month lag from bureaus. Only 3 data sources.
          </InfoBox>
        </div>

        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <SectionTitle>
            <Activity size={14} />
            Alternative Data Features
          </SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {ALT_DATA_FEATURES.map((cat) => (
              <div key={cat.category} className="rounded-lg border border-border bg-foreground/5 p-3">
                <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
                  {cat.icon}
                  <span className="text-xs font-semibold">{cat.category}</span>
                </div>
                <ul className="space-y-0.5">
                  {cat.features.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                      <ChevronRight size={9} className="text-muted-foreground" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ML Pipeline */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Zap size={14} />
          Real-Time ML Decisioning Pipeline
        </SectionTitle>
        <DecisioningPipelineSVG />
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <InfoBox variant="blue">
            <strong>Model Architecture:</strong> Gradient boosting (XGBoost/LightGBM) ensembled with neural networks for non-linear interactions. Retrained weekly on fresh cohort data.
          </InfoBox>
          <InfoBox variant="emerald">
            <strong>Fairness Testing:</strong> Models tested for disparate impact under ECOA. Adverse action notices must cite specific reasons — problematic with black-box ML.
          </InfoBox>
          <InfoBox variant="rose">
            <strong>FCRA Challenge:</strong> Alt data sources must comply with FCRA accuracy/dispute rights. Using location data or social media for credit decisions raises regulatory flags.
          </InfoBox>
        </div>
      </div>

      {/* Approval/Default Curves */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <BarChart3 size={14} />
          ML vs Traditional: Approval Rate &amp; Default Rate by Credit Score
        </SectionTitle>
        <ApprovalDefaultCurvesSVG />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          ML models approve significantly more thin-file consumers at equivalent or lower default rates — the core value proposition of fintech underwriting.
        </p>
      </div>

      {/* Thin File Problem */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <AlertTriangle size={14} />
          The Thin-File Problem — 45M Unscoreable Americans
        </SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { segment: "Recent Immigrants", size: "~15M", barrier: "No US credit history despite foreign creditworthiness", solution: "Bank transaction data, remittance patterns, employment verification" },
            { segment: "Young Adults (18-25)", size: "~18M", barrier: "Never used credit; responsible cash users invisible to bureaus", solution: "Debit card spending patterns, subscription payments, rental history" },
            { segment: "Unbanked / Underbanked", size: "~12M", barrier: "Cash economy participants; pay bills but no digital trail", solution: "Rent-to-own data, utility payments, telco records, payday repayment" },
          ].map((seg) => (
            <div key={seg.segment} className="rounded-lg border border-border bg-foreground/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{seg.segment}</span>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">{seg.size}</Badge>
              </div>
              <p className="text-xs text-muted-foreground"><span className="text-rose-400 font-medium">Barrier: </span>{seg.barrier}</p>
              <p className="text-xs text-muted-foreground"><span className="text-emerald-400 font-medium">Alt Data: </span>{seg.solution}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Embedded Finance
// ══════════════════════════════════════════════════════════════════════════════

// Embedded Lending Architecture SVG
function EmbeddedLendingSVG() {
  return (
    <svg viewBox="0 0 700 240" className="w-full h-auto">
      {/* Background layers */}

      {/* Layer 1: Retailer / Platform */}
      <rect x={10} y={10} width={160} height={220} rx={10} fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.3)" strokeWidth={1.5} />
      <text x={90} y={32} textAnchor="middle" fill="#6ee7b7" fontSize={10} fontWeight="700">RETAILER / PLATFORM</text>
      {["Shopify", "Amazon", "Stripe", "Square", "Walmart"].map((name, i) => (
        <g key={name}>
          <rect x={22} y={45 + i * 36} width={136} height={28} rx={6} fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.2)" strokeWidth={1} />
          <text x={90} y={64 + i * 36} textAnchor="middle" fill="#34d399" fontSize={10}>{name}</text>
        </g>
      ))}

      {/* Middle: API / BaaS Layer */}
      <rect x={260} y={50} width={180} height={140} rx={10} fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.35)" strokeWidth={1.5} />
      <text x={350} y={74} textAnchor="middle" fill="#c4b5fd" fontSize={10} fontWeight="700">BANKING-AS-A-SERVICE</text>
      <text x={350} y={90} textAnchor="middle" fill="#a78bfa" fontSize={9}>API Infrastructure Layer</text>
      {["Credit Underwriting API", "Loan Origination", "Servicing & Collections", "Compliance / KYC"].map((item, i) => (
        <g key={item}>
          <rect x={272} y={100 + i * 22} width={156} height={18} rx={4} fill="rgba(139,92,246,0.15)" />
          <text x={350} y={113 + i * 22} textAnchor="middle" fill="#c4b5fd" fontSize={8}>{item}</text>
        </g>
      ))}

      {/* Right: Bank Charter / Capital */}
      <rect x={530} y={30} width={160} height={180} rx={10} fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" strokeWidth={1.5} />
      <text x={610} y={55} textAnchor="middle" fill="#93c5fd" fontSize={10} fontWeight="700">LICENSED BANK</text>
      <text x={610} y={70} textAnchor="middle" fill="#60a5fa" fontSize={9}>Balance Sheet &amp; Charter</text>
      {["Cross River Bank", "Celtic Bank", "WebBank", "Blue Ridge Bank"].map((bank, i) => (
        <g key={bank}>
          <rect x={542} y={80 + i * 32} width={136} height={24} rx={5} fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.2)" strokeWidth={1} />
          <text x={610} y={96 + i * 32} textAnchor="middle" fill="#93c5fd" fontSize={9}>{bank}</text>
        </g>
      ))}

      {/* Arrows: Retailer -> BaaS */}
      <defs>
        <marker id="arr2" markerWidth={7} markerHeight={7} refX={3.5} refY={3.5} orient="auto">
          <path d="M0,0 L0,7 L7,3.5 Z" fill="#9ca3af" />
        </marker>
      </defs>
      <path d="M 172 100 L 258 100" stroke="rgba(156,163,175,0.5)" strokeWidth={1.5} fill="none" markerEnd="url(#arr2)" />
      <text x={215} y={93} textAnchor="middle" fill="#9ca3af" fontSize={8}>merchant data</text>
      <path d="M 258 140 L 172 140" stroke="rgba(16,185,129,0.5)" strokeWidth={1.5} fill="none" markerEnd="url(#arr2)" />
      <text x={215} y={153} textAnchor="middle" fill="#34d399" fontSize={8}>credit product</text>

      {/* Arrows: BaaS -> Bank */}
      <path d="M 442 100 L 528 100" stroke="rgba(156,163,175,0.5)" strokeWidth={1.5} fill="none" markerEnd="url(#arr2)" />
      <text x={485} y={93} textAnchor="middle" fill="#9ca3af" fontSize={8}>loan origination</text>
      <path d="M 528 140 L 442 140" stroke="rgba(59,130,246,0.5)" strokeWidth={1.5} fill="none" markerEnd="url(#arr2)" />
      <text x={485} y={153} textAnchor="middle" fill="#60a5fa" fontSize={8}>capital / charter</text>

      {/* Bottom text */}
      <text x={350} y={228} textAnchor="middle" fill="#6b7280" fontSize={9}>Platform-native credit products powered by API-first banking infrastructure</text>
    </svg>
  );
}

// Embedded Finance Market Growth SVG
function EmbeddedFinanceGrowthSVG() {
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028];
  const marketSize = [22, 43, 65, 92, 124, 166, 218, 278, 348]; // $B

  const W = 560;
  const H = 200;
  const padL = 55;
  const padB = 38;
  const padT = 24;
  const padR = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = 380;

  function toX(i: number) {
    return padL + (i / (years.length - 1)) * chartW;
  }
  function toY(v: number) {
    return padT + chartH - (v / maxVal) * chartH;
  }

  const linePath = years.map((_, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(marketSize[i])}`).join(" ");
  const areaPath = `${linePath} L ${toX(years.length - 1)} ${padT + chartH} L ${toX(0)} ${padT + chartH} Z`;

  // Mark actual vs projected
  const actualEnd = 3; // 2023 is last actual

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {[0, 100, 200, 300].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={toY(v)} y2={toY(v)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          <text x={padL - 6} y={toY(v) + 4} textAnchor="end" fill="#6b7280" fontSize={9}>${v}B</text>
        </g>
      ))}

      {/* Area */}
      <path d={areaPath} fill="rgba(139,92,246,0.15)" />

      {/* Projected area */}
      <path
        d={years.slice(actualEnd).map((_, i) => `${i === 0 ? "M" : "L"} ${toX(i + actualEnd)} ${toY(marketSize[i + actualEnd])}`).join(" ") +
          ` L ${toX(years.length - 1)} ${padT + chartH} L ${toX(actualEnd)} ${padT + chartH} Z`}
        fill="rgba(139,92,246,0.08)"
        stroke="none"
      />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth={2.5} strokeLinejoin="round" />

      {/* Projected portion dashed */}
      <path
        d={years.slice(actualEnd).map((_, i) => `${i === 0 ? "M" : "L"} ${toX(i + actualEnd)} ${toY(marketSize[i + actualEnd])}`).join(" ")}
        fill="none"
        stroke="#a78bfa"
        strokeWidth={2}
        strokeDasharray="5,3"
      />

      {/* Data points */}
      {years.map((y, i) => (
        <g key={y}>
          <circle cx={toX(i)} cy={toY(marketSize[i])} r={4} fill={i <= actualEnd ? "#8b5cf6" : "#6d28d9"} stroke="white" strokeWidth={1} />
          <text x={toX(i)} y={toY(marketSize[i]) - 8} textAnchor="middle" fill={i <= actualEnd ? "#c4b5fd" : "#7c3aed"} fontSize={9}>${marketSize[i]}B</text>
          <text x={toX(i)} y={H - padB + 12} textAnchor="middle" fill="#6b7280" fontSize={8}>{y}</text>
        </g>
      ))}

      {/* Projected label */}
      <line x1={toX(actualEnd)} x2={toX(actualEnd)} y1={padT} y2={padT + chartH} stroke="rgba(255,255,255,0.2)" strokeDasharray="3,2" strokeWidth={1} />
      <text x={toX(actualEnd) + 4} y={padT + 10} fill="#9ca3af" fontSize={8}>▸ Projected</text>

      {/* Legend */}
      <line x1={padL + 8} x2={padL + 24} y1={padT + 10} y2={padT + 10} stroke="#8b5cf6" strokeWidth={2.5} />
      <text x={padL + 28} y={padT + 14} fill="#c4b5fd" fontSize={9}>Embedded Finance Market ($B)</text>

      <text x={W / 2} y={H - 4} textAnchor="middle" fill="#9ca3af" fontSize={9}>Global Embedded Finance Market Size 2020–2028</text>
    </svg>
  );
}

interface CaseStudy {
  company: string;
  product: string;
  advantage: string;
  volume: string;
  model: string;
  color: string;
}

const CASE_STUDIES: CaseStudy[] = [
  { company: "Shopify Capital", product: "Merchant Cash Advances", advantage: "Real-time GMV data: knows merchant's daily sales, seasonality, and customer LTV before lending", volume: "$5.2B originated (2024)", model: "Daily repayment as % of sales; no fixed payment schedule", color: "#10b981" },
  { company: "Amazon Lending", product: "Seller Loans (invite-only)", advantage: "Deep inventory, sales velocity, return rate, and buyer review data determines creditworthiness", volume: "$4.8B loan book", model: "Term loans 3-12 months; deducted from seller disbursements", color: "#f59e0b" },
  { company: "Stripe Capital", product: "Business Financing", advantage: "Payment processing data gives real-time P&L proxy. Approval in minutes for existing merchants", volume: "$2.9B originated (2024)", model: "Flat fee financing; remit fixed % of daily Stripe volume", color: "#6366f1" },
];

function Tab3EmbeddedFinance() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Embedded Finance Market (2024)" value="$124B" sub="↑ 34% CAGR 2020-2028" highlight="pos" icon={<Layers size={13} />} />
        <StatCard label="Shopify Capital GMV" value="$5.2B" sub="Merchant cash advances 2024" highlight="pos" icon={<DollarSign size={13} />} />
        <StatCard label="Approval Rate Lift" value="3-5x" sub="Platform data vs bureau" highlight="pos" icon={<TrendingUp size={13} />} />
        <StatCard label="Default Rate (Embedded)" value="0.8–1.2%" sub="vs 3-5% traditional SMB loans" highlight="pos" icon={<Shield size={13} />} />
      </div>

      {/* Architecture SVG */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Layers size={14} />
          Embedded Lending Architecture
        </SectionTitle>
        <EmbeddedLendingSVG />
        <div className="mt-3 grid md:grid-cols-2 gap-3">
          <InfoBox variant="blue">
            <strong>Banking-as-a-Service (BaaS):</strong> Middleware platforms (Unit, Synapse, Treasury Prime) provide API access to bank charters, allowing any company to embed financial products without a banking license.
          </InfoBox>
          <InfoBox variant="emerald">
            <strong>Merchant Data Advantage:</strong> Platform operators see all transaction data before lending, enabling underwriting with 10-100x more signal than traditional credit bureaus.
          </InfoBox>
        </div>
      </div>

      {/* Case Studies */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Building2 size={14} />
          Platform Lending Case Studies
        </SectionTitle>
        <div className="space-y-4">
          {CASE_STUDIES.map((cs) => (
            <div key={cs.company} className="rounded-lg border border-border bg-foreground/5 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm font-bold text-foreground">{cs.company}</span>
                  <span className="text-xs text-muted-foreground ml-2">— {cs.product}</span>
                </div>
                <Badge className="text-xs" style={{ backgroundColor: cs.color + "22", color: cs.color, borderColor: cs.color + "44" }}>
                  {cs.volume}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                <span className="text-amber-400 font-medium">Data advantage: </span>
                {cs.advantage}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-medium">Model: </span>
                {cs.model}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-sell Economics */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <SectionTitle>
            <DollarSign size={14} />
            Cross-Sell Economics
          </SectionTitle>
          <div className="space-y-3">
            {[
              { metric: "Embedded lending LTV", value: "$420", base: "$280", lift: "+50%", note: "vs standalone fintech LTV" },
              { metric: "CAC (platform-native)", value: "$8", base: "$45", lift: "-82%", note: "vs standalone BNPL CAC" },
              { metric: "Default rate reduction", value: "1.1%", base: "3.2%", lift: "-66%", note: "platform data advantage" },
              { metric: "Cross-sell conversion", value: "31%", base: "8%", lift: "+3.9x", note: "existing customer vs cold outreach" },
            ].map((row) => (
              <div key={row.metric} className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{row.metric}</p>
                  <p className="text-xs text-muted-foreground">{row.note}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{row.value}</p>
                  <p className="text-xs text-emerald-400">{row.lift} vs {row.base}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <SectionTitle>
            <TrendingUp size={14} />
            Embedded Finance Market Growth 2020–2028
          </SectionTitle>
          <EmbeddedFinanceGrowthSVG />
        </div>
      </div>

      <InfoBox variant="blue">
        <strong>The Winner-Take-Most Dynamic:</strong> Platforms with the largest merchant/consumer data moats (Amazon, Shopify, Square) can underwrite credit at structurally lower cost and default rates than banks. This creates a flywheel: better underwriting → lower rates → more adoption → more data → better underwriting. Traditional banks struggle to compete without equivalent behavioral data.
      </InfoBox>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Risk & Regulation
// ══════════════════════════════════════════════════════════════════════════════

// Debt Stacking SVG
function DebtStackingSVG() {
  const W = 600;
  const H = 220;

  // Consumer uses multiple BNPL providers simultaneously
  const providers = [
    { name: "Affirm", amount: 420, monthly: 105, color: "#3b82f6" },
    { name: "Klarna", amount: 280, monthly: 70, color: "#8b5cf6" },
    { name: "Afterpay", amount: 160, monthly: 40, color: "#10b981" },
    { name: "PayPal BNPL", amount: 340, monthly: 85, color: "#f59e0b" },
    { name: "Apple Pay Later", amount: 120, monthly: 30, color: "#6b7280" },
  ];

  const totalDebt = providers.reduce((a, b) => a + b.amount, 0);
  const totalMonthly = providers.reduce((a, b) => a + b.monthly, 0);

  const barH = 28;
  const barGap = 8;
  const maxAmount = 500;
  const chartStartX = 130;
  const chartW = W - chartStartX - 80;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Title */}
      <text x={W / 2} y={16} textAnchor="middle" fill="#d1d5db" fontSize={10} fontWeight="600">Debt Stacking: One Consumer, 5 BNPL Providers (No Visibility Between Them)</text>

      {providers.map((p, i) => {
        const y = 28 + i * (barH + barGap);
        const barW = (p.amount / maxAmount) * chartW;
        return (
          <g key={p.name}>
            <text x={chartStartX - 8} y={y + barH / 2 + 4} textAnchor="end" fill="#d1d5db" fontSize={9} fontWeight="600">{p.name}</text>
            <rect x={chartStartX} y={y} width={barW} height={barH} rx={4} fill={p.color} fillOpacity={0.7} />
            <text x={chartStartX + barW + 6} y={y + barH / 2 + 4} textAnchor="start" fill={p.color} fontSize={9}>${p.amount} debt • ${p.monthly}/mo</text>
          </g>
        );
      })}

      {/* Total line */}
      <line x1={chartStartX} x2={W - 20} y1={28 + providers.length * (barH + barGap) + 4} y2={28 + providers.length * (barH + barGap) + 4} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      <text x={chartStartX} y={28 + providers.length * (barH + barGap) + 18} fill="#ef4444" fontSize={10} fontWeight="700">
        Total: ${totalDebt} outstanding • ${totalMonthly}/mo payments
      </text>

      {/* Problem callout */}
      <rect x={chartStartX + 220} y={28 + providers.length * (barH + barGap) + 6} width={200} height={32} rx={6} fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" strokeWidth={1} />
      <text x={chartStartX + 320} y={28 + providers.length * (barH + barGap) + 20} textAnchor="middle" fill="#fca5a5" fontSize={8}>No data sharing between providers</text>
      <text x={chartStartX + 320} y={28 + providers.length * (barH + barGap) + 31} textAnchor="middle" fill="#fca5a5" fontSize={8}>Each approves without knowing total debt</text>
    </svg>
  );
}

// Credit Quality Distribution SVG
function CreditQualityDistributionSVG() {
  const W = 560;
  const H = 200;
  const padL = 40;
  const padB = 40;
  const padT = 24;
  const padR = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // Score buckets: <580, 580-619, 620-659, 660-699, 700-749, 750+
  const buckets = ["<580\n(Deep Sub)", "580–619\n(Sub)", "620–659\n(Near-Prime)", "660–699\n(Prime)", "700–749\n(Prime+)", "750+\n(Super-Prime)"];

  // BNPL user distribution (over-indexed on sub-prime)
  const bnplPct = [18, 22, 24, 17, 12, 7];
  // Prime borrower distribution (traditional credit card)
  const primePct = [3, 6, 11, 19, 26, 35];
  const maxPct = 40;

  const barGroupW = chartW / buckets.length;
  const singleBarW = (barGroupW - 12) / 2;

  function toY(pct: number) {
    return padT + chartH - (pct / maxPct) * chartH;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {[0, 10, 20, 30, 40].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={toY(v)} y2={toY(v)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          <text x={padL - 4} y={toY(v) + 4} textAnchor="end" fill="#6b7280" fontSize={8}>{v}%</text>
        </g>
      ))}

      {buckets.map((bucket, i) => {
        const xGroup = padL + i * barGroupW + 6;
        const bLabel = bucket.split("\n");
        const bnplBarH = (bnplPct[i] / maxPct) * chartH;
        const primeBarH = (primePct[i] / maxPct) * chartH;

        return (
          <g key={bucket}>
            {/* BNPL bar */}
            <rect
              x={xGroup}
              y={toY(bnplPct[i])}
              width={singleBarW}
              height={bnplBarH}
              rx={2}
              fill="#ef4444"
              fillOpacity={0.7}
            />
            <text x={xGroup + singleBarW / 2} y={toY(bnplPct[i]) - 3} textAnchor="middle" fill="#fca5a5" fontSize={8}>{bnplPct[i]}%</text>

            {/* Credit card prime bar */}
            <rect
              x={xGroup + singleBarW + 3}
              y={toY(primePct[i])}
              width={singleBarW}
              height={primeBarH}
              rx={2}
              fill="#3b82f6"
              fillOpacity={0.7}
            />
            <text x={xGroup + singleBarW + 3 + singleBarW / 2} y={toY(primePct[i]) - 3} textAnchor="middle" fill="#93c5fd" fontSize={8}>{primePct[i]}%</text>

            {/* Bucket labels */}
            {bLabel.map((line, li) => (
              <text key={li} x={xGroup + barGroupW / 2 - 3} y={H - padB + 12 + li * 11} textAnchor="middle" fill="#9ca3af" fontSize={7.5}>{line}</text>
            ))}
          </g>
        );
      })}

      {/* Axes */}
      <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

      {/* Legend */}
      <rect x={padL + 8} y={padT + 4} width={10} height={8} rx={2} fill="#ef4444" fillOpacity={0.7} />
      <text x={padL + 22} y={padT + 12} fill="#fca5a5" fontSize={9}>BNPL Users</text>
      <rect x={padL + 100} y={padT + 4} width={10} height={8} rx={2} fill="#3b82f6" fillOpacity={0.7} />
      <text x={padL + 114} y={padT + 12} fill="#93c5fd" fontSize={9}>Credit Card Prime</text>

      <text x={W / 2} y={H - 2} textAnchor="middle" fill="#9ca3af" fontSize={9}>BNPL Users vs Prime Borrowers: Credit Score Distribution</text>
    </svg>
  );
}

// Default Rate Comparison SVG
function DefaultRateComparisonSVG() {
  const W = 480;
  const H = 180;
  const products = [
    { name: "BNPL (2021)", rate: 1.8, color: "#f59e0b" },
    { name: "BNPL (2022)", rate: 2.4, color: "#f97316" },
    { name: "BNPL (2023)", rate: 3.1, color: "#ef4444" },
    { name: "Credit Card\n(avg)", rate: 2.9, color: "#3b82f6" },
    { name: "Credit Card\n(subprime)", rate: 7.2, color: "#6366f1" },
    { name: "Auto Loan", rate: 1.4, color: "#10b981" },
    { name: "Personal\nLoan", rate: 3.8, color: "#8b5cf6" },
  ];
  const maxRate = 9;
  const padL = 60;
  const padB = 42;
  const padT = 20;
  const padR = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barW = Math.floor(chartW / products.length) - 6;

  function toY(v: number) {
    return padT + chartH - (v / maxRate) * chartH;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[0, 2, 4, 6, 8].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={toY(v)} y2={toY(v)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          <text x={padL - 4} y={toY(v) + 4} textAnchor="end" fill="#6b7280" fontSize={8}>{v}%</text>
        </g>
      ))}
      {products.map((p, i) => {
        const x = padL + i * (barW + 6) + 3;
        const barH = (p.rate / maxRate) * chartH;
        const label = p.name.split("\n");
        return (
          <g key={p.name}>
            <rect x={x} y={toY(p.rate)} width={barW} height={barH} rx={3} fill={p.color} fillOpacity={0.75} />
            <text x={x + barW / 2} y={toY(p.rate) - 3} textAnchor="middle" fill={p.color} fontSize={9} fontWeight="600">{p.rate}%</text>
            {label.map((line, li) => (
              <text key={li} x={x + barW / 2} y={H - padB + 12 + li * 11} textAnchor="middle" fill="#9ca3af" fontSize={8}>{line}</text>
            ))}
          </g>
        );
      })}
      <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      <text x={W / 2} y={H - 2} textAnchor="middle" fill="#9ca3af" fontSize={9}>90-Day Delinquency / Default Rate by Product Type</text>
    </svg>
  );
}

function Tab4RiskRegulation() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="BNPL Users w/ 3+ Providers" value="28%" sub="Up from 12% in 2020" highlight="neg" icon={<AlertTriangle size={13} />} />
        <StatCard label="BNPL Default Rate (2023)" value="3.1%" sub="vs 2.9% credit card avg" highlight="neg" icon={<TrendingDown size={13} />} />
        <StatCard label="CFPB 2024 Ruling" value="Credit Card Rules Apply" sub="Adverse action, billing rights" highlight="warn" icon={<Scale size={13} />} />
        <StatCard label="Avg BNPL Debt Stacking" value="$1,320" sub="Per multi-BNPL-user outstanding" highlight="neg" icon={<CreditCard size={13} />} />
      </div>

      {/* Debt Stacking SVG */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Layers size={14} />
          Consumer Debt Stacking Problem
        </SectionTitle>
        <DebtStackingSVG />
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <InfoBox variant="rose">
            <strong>No Credit Bureau Reporting:</strong> Most BNPL loans are NOT reported to Experian/Equifax/TransUnion. This means each new BNPL lender cannot see a consumer's existing BNPL obligations — creating invisible debt stacking.
          </InfoBox>
          <InfoBox variant="amber">
            <strong>Income Ratio Blindness:</strong> Traditional underwriting computes Debt-to-Income ratios. BNPL underwriting typically skips this step, approving installments without knowing total monthly payment obligations.
          </InfoBox>
          <InfoBox variant="blue">
            <strong>2024 CFPB Rule Response:</strong> CFPB now requires BNPL lenders to report to credit bureaus if they apply credit card-like consumer protections. Still in transition — full bureau reporting not yet universal.
          </InfoBox>
        </div>
      </div>

      {/* Default Rate Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <SectionTitle>
            <BarChart3 size={14} />
            Default Rate: BNPL vs Other Products
          </SectionTitle>
          <DefaultRateComparisonSVG />
        </div>

        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <SectionTitle>
            <Lock size={14} />
            CFPB Regulatory Developments
          </SectionTitle>
          <div className="space-y-3">
            {[
              {
                date: "May 2024",
                event: "CFPB Interpretive Rule",
                detail: "BNPL products that issue a digital user account constitute credit cards under Truth in Lending Act (TILA). Must provide: adverse action notices, billing rights, refund credits.",
                severity: "high",
              },
              {
                date: "Jan 2023",
                event: "Market Monitoring Report",
                detail: "CFPB found BNPL borrowers were more likely to have overdraft fees, carry revolving balances, and have higher delinquency rates on other credit.",
                severity: "medium",
              },
              {
                date: "Sep 2022",
                event: "Market Practice Order",
                detail: "CFPB ordered Affirm, Klarna, Afterpay, PayPal, Zip to provide data on business practices, consumer usage, and default rates.",
                severity: "low",
              },
              {
                date: "2025 (pending)",
                event: "Bureau Reporting Mandate",
                detail: "Proposed rule to require all BNPL loans to be reported to consumer reporting agencies — would eliminate debt stacking blindness.",
                severity: "high",
              },
            ].map((item) => {
              const severityColor = item.severity === "high" ? "text-rose-400 border-rose-500/30 bg-rose-500/10" : item.severity === "medium" ? "text-amber-400 border-amber-500/30 bg-amber-500/10" : "text-primary border-border bg-primary/10";
              return (
                <div key={item.event} className="rounded-lg border border-border bg-foreground/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={cn("text-xs", severityColor)}>{item.date}</Badge>
                    <span className="text-xs font-medium text-foreground">{item.event}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Credit Quality Distribution */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <Users size={14} />
          Credit Quality: BNPL Users vs Prime Borrowers
        </SectionTitle>
        <CreditQualityDistributionSVG />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          BNPL users are heavily over-indexed in sub-prime buckets (&lt;620) vs traditional credit card prime borrowers — explaining higher structural default rates.
        </p>
      </div>

      {/* Debt Spiral Mechanics */}
      <div className="rounded-xl border border-border bg-foreground/5 p-4">
        <SectionTitle>
          <AlertTriangle size={14} />
          Debt Spiral Mechanics
        </SectionTitle>
        <div className="grid md:grid-cols-4 gap-3">
          {[
            { step: "1", title: "Checkout Impulse", desc: "Consumer buys $400 item via BNPL because it appears 'only $100 today'", icon: <ShoppingCart size={14} /> },
            { step: "2", title: "Payment Miss", desc: "Two weeks later, $100 payment auto-charges — insufficient funds trigger overdraft fee ($35)", icon: <AlertTriangle size={14} /> },
            { step: "3", title: "Late Fee Cascade", desc: "BNPL charges $15 late fee. Consumer opens new BNPL account to cover groceries, compounding monthly obligations", icon: <TrendingDown size={14} /> },
            { step: "4", title: "Delinquency Spiral", desc: "Multiple missed payments, collections, credit damage — but none visible across BNPL lenders until too late", icon: <XCircle size={14} /> },
          ].map((item) => (
            <div key={item.step} className="rounded-lg border border-border bg-foreground/5 p-3 text-center space-y-2">
              <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 text-xs font-medium">
                {item.step}
              </div>
              <div className="text-rose-400">{item.icon}</div>
              <p className="text-xs font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <InfoBox variant="rose">
            <strong>Interest Rate Disclosure Gap:</strong> Pre-CFPB 2024, BNPL companies were not required to disclose APR for pay-in-4 products (since they were technically 0% interest). A $15 late fee on a $150 purchase is equivalent to a 157% APR penalty — not disclosed to consumers.
          </InfoBox>
          <InfoBox variant="amber">
            <strong>Behavioral Economics Exploit:</strong> BNPL leverages present-bias — paying $100 today is psychologically less painful than $400. Merchants report 30-50% higher average order values for BNPL customers, many of whom later experience payment distress.
          </InfoBox>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT PAGE
// ══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: "model", label: "BNPL Business Model", icon: <CreditCard size={14} /> },
  { id: "scoring", label: "Digital Credit Scoring", icon: <Activity size={14} /> },
  { id: "embedded", label: "Embedded Finance", icon: <Layers size={14} /> },
  { id: "risk", label: "Risk & Regulation", icon: <Shield size={14} /> },
];

export default function BNPLLendingPage() {
  const [activeTab, setActiveTab] = useState("model");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* HERO Header */}
        <div className="mb-8 border-l-4 border-l-primary rounded-xl bg-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-border flex items-center justify-center">
              <CreditCard size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">BNPL &amp; Digital Lending</h1>
              <p className="text-xs text-muted-foreground">Buy Now Pay Later business models, digital credit scoring, embedded finance &amp; consumer lending disruption</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: "Global BNPL Market", val: "$450B GMV", color: "bg-primary/20 text-primary border-border" },
              { label: "Market CAGR", val: "22% YoY", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
              { label: "Thin-File Problem", val: "45M Americans", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
              { label: "Embedded Finance", val: "$124B Market", color: "bg-primary/20 text-primary border-border" },
            ].map((chip) => (
              <Badge key={chip.label} className={cn("text-xs", chip.color)}>
                {chip.label}: {chip.val}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-foreground/5 border border-border mb-6 flex-wrap h-auto gap-1 p-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <TabsContent value="model" className="mt-0 data-[state=inactive]:hidden">
                <Tab1BNPLModel />
              </TabsContent>
              <TabsContent value="scoring" className="mt-0 data-[state=inactive]:hidden">
                <Tab2DigitalScoring />
              </TabsContent>
              <TabsContent value="embedded" className="mt-0 data-[state=inactive]:hidden">
                <Tab3EmbeddedFinance />
              </TabsContent>
              <TabsContent value="risk" className="mt-0 data-[state=inactive]:hidden">
                <Tab4RiskRegulation />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
