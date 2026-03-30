"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Shield,
  Info,
  Building2,
  Layers,
  RefreshCw,
  Percent,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  ChevronRight,
  Activity,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 965;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 965;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CashInvestmentTier {
  label: string;
  yield: number;
  liquidity: "same-day" | "t+1" | "t+2" | "t+3+";
  risk: "none" | "very-low" | "low" | "moderate";
  typical: string;
  examples: string;
}

interface FXExposureRow {
  currency: string;
  flag: string;
  transactional: number;
  translational: number;
  economic: number;
  hedgeRatio: number;
  instrument: string;
}

interface DebtMaturityBar {
  year: number;
  bonds: number;
  loans: number;
  cp: number;
}

interface CapAllocItem {
  label: string;
  amount: number;
  pct: number;
  color: string;
  description: string;
}

interface BuybackMethod {
  method: string;
  description: string;
  speed: string;
  premium: string;
  useCase: string;
  icon: React.ReactNode;
}

interface CompanyCapAlloc {
  company: string;
  ticker: string;
  cashOnHand: number;
  fcfYield: number;
  dividendYield: number;
  buybackYield: number;
  capexPct: number;
  maPct: number;
  cashReturnPct: number;
  rating: string;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const CASH_TIERS: CashInvestmentTier[] = [
  {
    label: "Operating Account",
    yield: 0.1,
    liquidity: "same-day",
    risk: "none",
    typical: "$10–50M",
    examples: "Bank DDA, sweep accounts",
  },
  {
    label: "Money Market Funds",
    yield: 5.3,
    liquidity: "same-day",
    risk: "very-low",
    typical: "$100–500M",
    examples: "Prime MMF, Govt MMF, Treasury MMF",
  },
  {
    label: "Treasury Bills",
    yield: 5.25,
    liquidity: "t+1",
    risk: "none",
    typical: "$50–300M",
    examples: "4W, 13W, 26W T-Bills via TreasuryDirect",
  },
  {
    label: "Short-term Bonds",
    yield: 5.4,
    liquidity: "t+2",
    risk: "very-low",
    typical: "$50–200M",
    examples: "1–3Y Agency, GSE, IG corporates",
  },
  {
    label: "Commercial Paper",
    yield: 5.35,
    liquidity: "t+1",
    risk: "low",
    typical: "$25–100M",
    examples: "A1/P1 rated CP, ABCP programs",
  },
  {
    label: "Term Deposits",
    yield: 5.2,
    liquidity: "t+3+",
    risk: "none",
    typical: "$50–150M",
    examples: "FDIC-insured deposits, ICS, CDARS",
  },
];

const FX_EXPOSURES: FXExposureRow[] = [
  { currency: "EUR", flag: "🇪🇺", transactional: 2400, translational: 8500, economic: 12000, hedgeRatio: 75, instrument: "Forward contracts" },
  { currency: "GBP", flag: "🇬🇧", transactional: 1200, translational: 4200, economic: 6800,  hedgeRatio: 80, instrument: "Forward + FX options" },
  { currency: "JPY", flag: "🇯🇵", transactional: 900,  translational: 3100, economic: 5400,  hedgeRatio: 60, instrument: "Cross-currency swaps" },
  { currency: "CNY", flag: "🇨🇳", transactional: 1800, translational: 5800, economic: 8200,  hedgeRatio: 35, instrument: "NDF (non-deliverable fwd)" },
  { currency: "BRL", flag: "🇧🇷", transactional: 400,  translational: 1200, economic: 2100,  hedgeRatio: 20, instrument: "NDF — high cost" },
  { currency: "INR", flag: "🇮🇳", transactional: 650,  translational: 2400, economic: 3800,  hedgeRatio: 25, instrument: "NDF — limited market" },
  { currency: "CAD", flag: "🇨🇦", transactional: 550,  translational: 1800, economic: 2900,  hedgeRatio: 85, instrument: "Forward contracts" },
  { currency: "AUD", flag: "🇦🇺", transactional: 320,  translational: 950,  economic: 1600,  hedgeRatio: 70, instrument: "Forward + options" },
];

const DEBT_MATURITY: DebtMaturityBar[] = [
  { year: 2026, bonds: 2.5, loans: 1.2, cp: 3.8 },
  { year: 2027, bonds: 4.0, loans: 2.5, cp: 0.0 },
  { year: 2028, bonds: 3.5, loans: 1.8, cp: 0.0 },
  { year: 2029, bonds: 5.5, loans: 0.8, cp: 0.0 },
  { year: 2030, bonds: 3.0, loans: 3.0, cp: 0.0 },
  { year: 2031, bonds: 6.0, loans: 0.5, cp: 0.0 },
  { year: 2032, bonds: 2.5, loans: 0.0, cp: 0.0 },
  { year: 2033, bonds: 4.0, loans: 0.0, cp: 0.0 },
];

const CAP_ALLOC_WATERFALL: CapAllocItem[] = [
  { label: "EBITDA",            amount: 120, pct: 100, color: "#6366f1", description: "Starting earnings before interest, taxes, D&A" },
  { label: "Maintenance Capex", amount: -18, pct: -15, color: "#ef4444", description: "Required capital to maintain existing assets" },
  { label: "Debt Service",      amount: -12, pct: -10, color: "#f97316", description: "Interest payments + mandatory amortization" },
  { label: "Taxes (cash)",      amount: -20, pct: -17, color: "#eab308", description: "Cash taxes paid (after tax shields)" },
  { label: "= Free Cash Flow",  amount:  70, pct:  58, color: "#22c55e", description: "Available for discretionary allocation" },
  { label: "Growth Capex",      amount: -14, pct: -12, color: "#3b82f6", description: "Expansion projects with IRR > WACC" },
  { label: "M&A / Investments", amount: -10, pct:  -8, color: "#8b5cf6", description: "Acquisitions, JVs, strategic investments" },
  { label: "Dividends",         amount: -12, pct: -10, color: "#ec4899", description: "Regular dividend + any special dividends" },
  { label: "Share Buybacks",    amount: -34, pct: -28, color: "#14b8a6", description: "Open market repurchases and ASR programs" },
];

const BUYBACK_METHODS: BuybackMethod[] = [
  {
    method: "Open Market Repurchase",
    description: "Company buys shares daily in the open market under Rule 10b-18 safe harbor. Maximum 25% of avg daily volume. Most flexible and most common.",
    speed: "Months to years",
    premium: "None (market price)",
    useCase: "Steady capital return, any size",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    method: "Accelerated Share Repurchase (ASR)",
    description: "Company pays upfront to an investment bank, receives shares immediately. Bank covers short via open-market purchases over 3–6 months. EPS accretion is instant.",
    speed: "3–6 months",
    premium: "0–2% (structuring fee)",
    useCase: "Large buyback announcements, EPS timing",
    icon: <Activity className="w-4 h-4" />,
  },
  {
    method: "Fixed-Price Tender Offer",
    description: "Company offers to buy shares at a set premium to market (typically 10–20%) for a fixed period (20 days). Shareholders choose to tender or not.",
    speed: "20–40 days",
    premium: "10–20% above market",
    useCase: "Aggressive capital return, post-M&A excess cash",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    method: "Dutch Auction Tender",
    description: "Company specifies price range; shareholders submit bids at various prices. Lowest clearing price that buys the target quantity is used. More price-efficient than fixed-price.",
    speed: "20–40 days",
    premium: "5–15% above market",
    useCase: "When management uncertain about right premium",
    icon: <BarChart3 className="w-4 h-4" />,
  },
];

const COMPANY_CAP_ALLOC: CompanyCapAlloc[] = [
  { company: "Apple",     ticker: "AAPL",  cashOnHand: 162, fcfYield: 3.8, dividendYield: 0.5, buybackYield: 3.6, capexPct: 8,  maPct: 2,  cashReturnPct: 110, rating: "Aaa/AAA" },
  { company: "Microsoft", ticker: "MSFT",  cashOnHand:  78, fcfYield: 2.8, dividendYield: 0.7, buybackYield: 1.8, capexPct: 22, maPct: 18, cashReturnPct:  92, rating: "Aaa/AAA" },
  { company: "Alphabet",  ticker: "GOOGL", cashOnHand: 110, fcfYield: 4.2, dividendYield: 0.4, buybackYield: 3.1, capexPct: 18, maPct: 8,  cashReturnPct:  88, rating: "Aa2/AA+" },
  { company: "Amazon",    ticker: "AMZN",  cashOnHand:  88, fcfYield: 3.1, dividendYield: 0.0, buybackYield: 0.8, capexPct: 45, maPct: 5,  cashReturnPct:  22, rating: "A1/AA-"  },
  { company: "Meta",      ticker: "META",  cashOnHand:  58, fcfYield: 4.5, dividendYield: 0.4, buybackYield: 4.2, capexPct: 28, maPct: 4,  cashReturnPct: 104, rating: "A1/A+"   },
];

// ── Cash Pooling SVG ──────────────────────────────────────────────────────────

function CashPoolingDiagram() {
  return (
    <svg viewBox="0 0 600 260" className="w-full" style={{ maxHeight: 260 }}>
      {/* Physical Pooling */}
      <text x={130} y={18} textAnchor="middle" fontSize={11} fontWeight={700} fill="#a78bfa">PHYSICAL POOLING</text>
      {[
        { x: 30,  y: 50, label: "UK Sub", amount: "+£12M" },
        { x: 110, y: 50, label: "DE Sub", amount: "+€8M"  },
        { x: 190, y: 50, label: "FR Sub", amount: "-€5M"  },
      ].map((sub) => (
        <g key={sub.label}>
          <rect x={sub.x} y={sub.y} width={70} height={40} rx={6} fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.4)" strokeWidth={1} />
          <text x={sub.x + 35} y={sub.y + 16} textAnchor="middle" fontSize={9} fill="#a5b4fc">{sub.label}</text>
          <text x={sub.x + 35} y={sub.y + 30} textAnchor="middle" fontSize={10} fontWeight={700} fill={sub.amount.startsWith("+") ? "#4ade80" : "#f87171"}>{sub.amount}</text>
          <line x1={sub.x + 35} y1={sub.y + 40} x2={sub.x + 35} y2={120} stroke="rgba(99,102,241,0.5)" strokeWidth={1.5} strokeDasharray="4,2" />
          <line x1={sub.x + 35} y1={120} x2={130} y2={140} stroke="rgba(99,102,241,0.5)" strokeWidth={1.5} />
        </g>
      ))}
      <rect x={65} y={140} width={130} height={48} rx={8} fill="rgba(99,102,241,0.22)" stroke="#6366f1" strokeWidth={2} />
      <text x={130} y={160} textAnchor="middle" fontSize={10} fontWeight={700} fill="#c4b5fd">Master Account</text>
      <text x={130} y={177} textAnchor="middle" fontSize={11} fontWeight={700} fill="#a78bfa">+£15M net</text>
      <text x={130} y={222} textAnchor="middle" fontSize={9} fill="#6b7280">Actual cash moved nightly</text>
      <text x={130} y={234} textAnchor="middle" fontSize={9} fill="#6b7280">Full interest optimization</text>

      {/* Divider */}
      <line x1={280} y1={20} x2={280} y2={250} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

      {/* Notional Pooling */}
      <text x={450} y={18} textAnchor="middle" fontSize={11} fontWeight={700} fill="#34d399">NOTIONAL POOLING</text>
      {[
        { x: 310, y: 50, label: "US Sub", amount: "+$18M" },
        { x: 390, y: 50, label: "SG Sub", amount: "+$6M"  },
        { x: 470, y: 50, label: "BR Sub", amount: "-$9M"  },
      ].map((sub) => (
        <g key={sub.label}>
          <rect x={sub.x} y={sub.y} width={70} height={40} rx={6} fill="rgba(52,211,153,0.10)" stroke="rgba(52,211,153,0.35)" strokeWidth={1} />
          <text x={sub.x + 35} y={sub.y + 16} textAnchor="middle" fontSize={9} fill="#6ee7b7">{sub.label}</text>
          <text x={sub.x + 35} y={sub.y + 30} textAnchor="middle" fontSize={10} fontWeight={700} fill={sub.amount.startsWith("+") ? "#4ade80" : "#f87171"}>{sub.amount}</text>
          <line x1={sub.x + 35} y1={sub.y + 40} x2={sub.x + 35} y2={120} stroke="rgba(52,211,153,0.4)" strokeWidth={1.5} strokeDasharray="3,3" />
          <line x1={sub.x + 35} y1={120} x2={450} y2={140} stroke="rgba(52,211,153,0.4)" strokeWidth={1.5} strokeDasharray="3,3" />
        </g>
      ))}
      <rect x={345} y={140} width={210} height={48} rx={8} fill="rgba(52,211,153,0.15)" stroke="#34d399" strokeWidth={2} />
      <text x={450} y={160} textAnchor="middle" fontSize={10} fontWeight={700} fill="#6ee7b7">Notional Header Account</text>
      <text x={450} y={177} textAnchor="middle" fontSize={11} fontWeight={700} fill="#34d399">$15M net (virtual)</text>
      <text x={450} y={222} textAnchor="middle" fontSize={9} fill="#6b7280">Cash stays in subs</text>
      <text x={450} y={234} textAnchor="middle" fontSize={9} fill="#6b7280">Interest offset, no legal transfer</text>
    </svg>
  );
}

// ── Cash Conversion Cycle SVG ─────────────────────────────────────────────────

function CashConversionCycleSVG() {
  const cx = 300;
  const cy = 112;
  const r  = 78;
  const items = [
    { label: "Order\nRaw Materials", angle: -120, metricLabel: "DIO: 45d", color: "#6366f1" },
    { label: "Sell\nGoods/Services", angle:    0, metricLabel: "DSO: 38d", color: "#22c55e" },
    { label: "Pay\nSuppliers",       angle:  120, metricLabel: "DPO: 52d", color: "#f97316" },
  ];
  function polarToXY(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }
  return (
    <svg viewBox="0 0 600 240" className="w-full" style={{ maxHeight: 240 }}>
      <circle cx={cx} cy={cy} r={r + 18} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={24} />
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0">Cash Conversion</text>
      <text x={cx} y={cy + 6}  textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0">Cycle</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize={14} fontWeight={800} fill="#6366f1">31 days</text>
      <text x={cx} y={cy + 38} textAnchor="middle" fontSize={9} fill="#6b7280">DIO + DSO − DPO</text>

      {items.map((item) => {
        const pos       = polarToXY(item.angle, r + 52);
        const nodePos   = polarToXY(item.angle, r);
        const arrowFrom = polarToXY(item.angle - 38, r + 18);
        const arrowTo   = polarToXY(item.angle + 38, r + 18);
        const markerId  = `arrow-ccc-${item.angle < 0 ? "neg" : item.angle}`;
        return (
          <g key={item.label}>
            <defs>
              <marker id={markerId} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={item.color} opacity={0.7} />
              </marker>
            </defs>
            <circle cx={nodePos.x} cy={nodePos.y} r={10} fill={item.color} opacity={0.85} />
            <text x={pos.x} y={pos.y - 8} textAnchor="middle" fontSize={9} fill="#cbd5e1">
              {item.label.split("\n").map((line, lineIdx) => (
                <tspan key={lineIdx} x={pos.x} dy={lineIdx === 0 ? 0 : 12}>{line}</tspan>
              ))}
            </text>
            <text x={pos.x} y={pos.y + 18} textAnchor="middle" fontSize={10} fontWeight={700} fill={item.color}>
              {item.metricLabel}
            </text>
            <path
              d={`M ${arrowFrom.x} ${arrowFrom.y} A ${r + 18} ${r + 18} 0 0 1 ${arrowTo.x} ${arrowTo.y}`}
              fill="none"
              stroke={item.color}
              strokeWidth={2}
              opacity={0.5}
              markerEnd={`url(#${markerId})`}
            />
          </g>
        );
      })}

      {[
        { label: "DIO = Days Inventory Outstanding", color: "#6366f1", y: 50  },
        { label: "DSO = Days Sales Outstanding",     color: "#22c55e", y: 72  },
        { label: "DPO = Days Payable Outstanding",   color: "#f97316", y: 94  },
        { label: "CCC = DIO + DSO − DPO",            color: "#a78bfa", y: 122 },
      ].map((item) => (
        <g key={item.label}>
          <circle cx={440} cy={item.y - 3} r={4} fill={item.color} />
          <text x={450} y={item.y} fontSize={9} fill="#94a3b8">{item.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Debt Maturity Profile SVG ─────────────────────────────────────────────────

function DebtMaturityChart() {
  const h      = 180;
  const padL   = 40;
  const padB   = 30;
  const padT   = 20;
  const maxVal = 10;
  const barW   = 50;
  const gap    = 22;
  const totalW = padL + DEBT_MATURITY.length * (barW + gap);
  const toY    = (v: number) => padT + ((maxVal - v) / maxVal) * (h - padT - padB);

  return (
    <svg viewBox={`0 0 ${totalW} ${h}`} className="w-full" style={{ maxHeight: h }}>
      {[0, 2.5, 5, 7.5, 10].map((v) => (
        <g key={v}>
          <line x1={padL - 4} y1={toY(v)} x2={totalW - 10} y2={toY(v)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          <text x={padL - 6} y={toY(v) + 4} textAnchor="end" fontSize={8} fill="#6b7280">${v}B</text>
        </g>
      ))}
      {DEBT_MATURITY.map((d, i) => {
        const x     = padL + i * (barW + gap);
        const base  = h - padB;
        const cpH   = (d.cp    / maxVal) * (h - padT - padB);
        const bnH   = (d.bonds / maxVal) * (h - padT - padB);
        const lnH   = (d.loans / maxVal) * (h - padT - padB);
        const total = d.bonds + d.loans + d.cp;
        return (
          <g key={d.year}>
            <rect x={x} y={base - cpH - bnH - lnH} width={barW} height={bnH} fill="#6366f1" rx={2} opacity={0.85} />
            <rect x={x} y={base - cpH - lnH}        width={barW} height={lnH} fill="#22c55e" rx={2} opacity={0.85} />
            {d.cp > 0 && (
              <rect x={x} y={base - cpH} width={barW} height={cpH} fill="#f97316" rx={2} opacity={0.85} />
            )}
            <text x={x + barW / 2} y={base + 16} textAnchor="middle" fontSize={9} fill="#9ca3af">{d.year}</text>
            <text x={x + barW / 2} y={base - cpH - bnH - lnH - 4} textAnchor="middle" fontSize={8} fill="#cbd5e1">
              ${total.toFixed(1)}B
            </text>
          </g>
        );
      })}
      {[
        { label: "Bonds", color: "#6366f1" },
        { label: "Loans", color: "#22c55e" },
        { label: "CP",    color: "#f97316" },
      ].map((l, i) => (
        <g key={l.label}>
          <rect x={padL + i * 70} y={h - 12} width={10} height={8} rx={2} fill={l.color} />
          <text x={padL + i * 70 + 13} y={h - 4} fontSize={8} fill="#9ca3af">{l.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Capital Allocation Waterfall SVG ─────────────────────────────────────────

function CapAllocWaterfall() {
  const w      = 580;
  const h      = 200;
  const padL   = 100;
  const padR   = 20;
  const padT   = 20;
  const padB   = 30;
  const barW   = 36;
  const gap    = 10;
  const maxVal = 130;
  const minVal = -40;
  const range  = maxVal - minVal;
  const toY    = (v: number) => padT + ((maxVal - v) / range) * (h - padT - padB);
  const zeroY  = toY(0);

  let running = 0;
  const bars = CAP_ALLOC_WATERFALL.map((item) => {
    const isTotal = item.label.startsWith("=");
    const start   = isTotal ? 0 : running;
    const end     = isTotal ? item.amount : running + item.amount;
    if (!isTotal) running += item.amount;
    return { ...item, start, end, isTotal };
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: h }}>
      <line x1={padL} y1={zeroY} x2={w - padR} y2={zeroY} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      {[-40, 0, 40, 80, 120].map((v) => (
        <g key={v}>
          <line x1={padL - 4} y1={toY(v)} x2={w - padR} y2={toY(v)} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          <text x={padL - 6} y={toY(v) + 4} textAnchor="end" fontSize={8} fill="#6b7280">${v}B</text>
        </g>
      ))}
      {bars.map((bar, i) => {
        const x    = padL + i * (barW + gap);
        const y1   = toY(Math.max(bar.start, bar.end));
        const y2   = toY(Math.min(bar.start, bar.end));
        const barH = Math.max(y2 - y1, 2);
        const isPos = bar.end >= bar.start;
        return (
          <g key={bar.label}>
            <rect
              x={x}
              y={y1}
              width={barW}
              height={barH}
              fill={bar.color}
              opacity={bar.isTotal ? 1 : 0.8}
              rx={bar.isTotal ? 4 : 2}
              stroke={bar.isTotal ? "white" : "none"}
              strokeWidth={bar.isTotal ? 1 : 0}
              strokeOpacity={0.3}
            />
            <text
              x={x + barW / 2}
              y={isPos ? y1 - 4 : y2 + barH + 10}
              textAnchor="middle"
              fontSize={8}
              fontWeight={bar.isTotal ? 700 : 400}
              fill="#e2e8f0"
            >
              {bar.amount > 0 ? `+$${bar.amount}B` : `-$${Math.abs(bar.amount)}B`}
            </text>
            <text
              x={x + barW / 2}
              y={h - padB + 14}
              textAnchor="middle"
              fontSize={7}
              fill="#9ca3af"
              transform={`rotate(-35, ${x + barW / 2}, ${h - padB + 14})`}
            >
              {bar.label.replace("= ", "")}
            </text>
            {i < bars.length - 1 && !bar.isTotal && (
              <line
                x1={x + barW}
                y1={toY(bar.end)}
                x2={x + barW + gap}
                y2={toY(bar.end)}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={1}
                strokeDasharray="3,2"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Hedge Accounting Diagram ──────────────────────────────────────────────────

function HedgeAccountingDiagram() {
  const items = [
    {
      type: "Fair Value Hedge",
      color: "#6366f1",
      hedgedItem: "Fixed-rate debt / AFS securities",
      hedgingInstrument: "Interest rate swap (pay float / receive fixed)",
      accountingEffect: "Both hedged item and derivative marked to market through P&L — offsetting",
      requirement: "Changes in fair value of item and derivative must be highly correlated (80–125% effectiveness test)",
    },
    {
      type: "Cash Flow Hedge",
      color: "#22c55e",
      hedgedItem: "Forecasted FX sales / floating-rate debt",
      hedgingInstrument: "FX forward / FX option / interest rate swap",
      accountingEffect: "Effective portion of derivative gain/loss deferred in OCI; reclassified to P&L when hedged item affects earnings",
      requirement: "Hedged item must be probable; effectiveness tested prospectively and retrospectively",
    },
    {
      type: "Net Investment Hedge",
      color: "#f97316",
      hedgedItem: "Net assets of foreign subsidiary",
      hedgingInstrument: "FX forward / cross-currency swap / foreign-currency debt",
      accountingEffect: "Effective portion of gain/loss reported in CTA within OCI — protects equity from FX translation risk",
      requirement: "Hedge ratio = % of net assets designated; released to P&L only on disposal of subsidiary",
    },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.type}
          className="rounded-lg border border-border bg-card/50 p-4"
          style={{ borderLeftWidth: 3, borderLeftColor: item.color }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold" style={{ color: item.color }}>{item.type}</span>
            <span className="text-xs text-muted-foreground">(IFRS 9 / ASC 815)</span>
          </div>
          <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground/70 text-xs uppercase tracking-wide mb-0.5">Hedged Item</p>
              <p className="text-foreground/80">{item.hedgedItem}</p>
            </div>
            <div>
              <p className="text-muted-foreground/70 text-xs uppercase tracking-wide mb-0.5">Hedging Instrument</p>
              <p className="text-foreground/80">{item.hedgingInstrument}</p>
            </div>
            <div>
              <p className="text-muted-foreground/70 text-xs uppercase tracking-wide mb-0.5">P&L Effect</p>
              <p className="text-foreground/80">{item.accountingEffect}</p>
            </div>
          </div>
          <div className="mt-2 flex items-start gap-1.5">
            <Info className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground/70">{item.requirement}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── WACC Breakdown ────────────────────────────────────────────────────────────

function WaccBreakdown() {
  const components = useMemo(() => {
    resetSeed();
    void rand();
    return [
      { label: "Cost of Equity (Ke)",         value: 9.8, contribution: 6.08, color: "#6366f1", note: "Rf 4.3% + β1.05 × ERP 5.2%" },
      { label: "After-tax Cost of Debt (Kd)", value: 3.8, contribution: 1.44, color: "#22c55e", note: "Pre-tax 5.1% × (1 − 25% tax)" },
    ];
  }, []);

  const wacc    = components.reduce((sum, c) => sum + c.contribution, 0);
  const maxContr = 7;
  const svgW    = 420;
  const svgH    = 120;
  const padL    = 190;
  const padT    = 16;
  const barH    = 28;
  const gap     = 12;
  const toX     = (v: number) => padL + (v / maxContr) * (svgW - padL - 20);

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: svgH }}>
        {components.map((c, i) => {
          const y        = padT + i * (barH + gap);
          const barWidth = toX(c.contribution) - padL;
          return (
            <g key={c.label}>
              <text x={padL - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{c.label}</text>
              <rect x={padL} y={y} width={barWidth} height={barH} rx={4} fill={c.color} opacity={0.8} />
              <text x={padL + barWidth + 5} y={y + barH / 2 + 4} fontSize={10} fontWeight={700} fill={c.color}>{c.contribution.toFixed(2)}%</text>
              <text x={padL} y={y + barH + 11} fontSize={8} fill="#6b7280">{c.note}</text>
            </g>
          );
        })}
        <line x1={padL} y1={svgH - 8} x2={svgW - 20} y2={svgH - 8} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        <text x={padL - 8} y={svgH - 4} textAnchor="end" fontSize={10} fontWeight={700} fill="#e2e8f0">WACC =</text>
        <text x={padL + 6} y={svgH - 4} fontSize={10} fontWeight={800} fill="#a78bfa">{wacc.toFixed(2)}%</text>
      </svg>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Hurdle Rate",    value: "7.5%",  note: "WACC + 0.5–1% buffer",  color: "text-primary" },
          { label: "Risk-free Rate", value: "4.3%",  note: "10Y UST yield",          color: "text-foreground" },
          { label: "Equity Beta",    value: "1.05×", note: "5-year monthly vs S&P",  color: "text-foreground" },
          { label: "ERP Estimate",   value: "5.2%",  note: "Damodaran Jan 2026",     color: "text-amber-400" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={cn("text-xl font-semibold tabular-nums mt-0.5", item.color)}>{item.value}</p>
            <p className="text-xs text-muted-foreground/60">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 1: Cash & Liquidity Management ───────────────────────────────────────

function CashLiquidityTab() {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Avg Corporate Cash", value: "$142B", sub: "S&P 500 non-fin median", color: "text-primary" },
          { label: "MMF Industry AUM",   value: "$6.8T", sub: "All-time high Mar 2026", color: "text-emerald-400" },
          { label: "Target Cash Ratio",  value: "2–5%",  sub: "% of annual revenue",   color: "text-foreground" },
          { label: "T-Bill Yield",       value: "5.25%", sub: "3-month as of today",   color: "text-amber-400" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={cn("mt-0.5 text-xl font-medium tabular-nums", item.color)}>{item.value}</p>
            <p className="text-xs text-muted-foreground/60">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold">Cash Pooling Structures</h3>
        </div>
        <CashPoolingDiagram />
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="rounded-lg bg-muted/5 border border-border p-2.5">
            <p className="font-semibold text-primary mb-1">Physical Pooling — Pros</p>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>• Full interest optimization on net position</li>
              <li>• Regulatory simplicity in most jurisdictions</li>
              <li>• No counterparty credit exposure to pooling bank</li>
            </ul>
          </div>
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2.5">
            <p className="font-semibold text-emerald-400 mb-1">Notional Pooling — Pros</p>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>• Cash stays in subs (no intercompany loans)</li>
              <li>• No FX conversion costs for cross-currency pools</li>
              <li>• Available in Netherlands, UK, Singapore</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">Cash Investment Policy Spectrum</h3>
          <span className="text-xs text-muted-foreground ml-auto">Click a tier for details</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CASH_TIERS.map((tier, i) => (
            <button
              key={tier.label}
              onClick={() => setSelectedTier(selectedTier === i ? null : i)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                selectedTier === i
                  ? "border-primary/60 bg-muted/10"
                  : "border-border bg-card/40 hover:border-border hover:bg-card/80",
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-foreground">{tier.label}</span>
                <span className={cn(
                  "text-xs text-muted-foreground rounded px-1.5 py-0.5 font-medium",
                  tier.risk === "none"     ? "bg-emerald-500/15 text-emerald-400" :
                  tier.risk === "very-low" ? "bg-muted/10 text-primary"       :
                  tier.risk === "low"      ? "bg-yellow-500/15 text-yellow-400"   :
                  "bg-orange-500/15 text-orange-400",
                )}>
                  {tier.risk === "none" ? "No risk" : tier.risk}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-emerald-400 font-medium">{tier.yield.toFixed(2)}%</span>
                <span className="text-muted-foreground">{tier.liquidity}</span>
                <span className="text-muted-foreground ml-auto">{tier.typical}</span>
              </div>
              {selectedTier === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 pt-2 border-t border-border"
                >
                  <p className="text-xs text-muted-foreground">{tier.examples}</p>
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">Cash Conversion Cycle (CCC)</h3>
        </div>
        <CashConversionCycleSVG />
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          {[
            { label: "Reduce DIO",   action: "Just-in-time inventory, faster fulfillment, vendor-managed inventory",         icon: <TrendingDown className="w-3 h-3 text-indigo-400" /> },
            { label: "Reduce DSO",   action: "Faster invoicing, early payment discounts (2/10 net 30), dynamic discounting", icon: <TrendingDown className="w-3 h-3 text-emerald-400" /> },
            { label: "Increase DPO", action: "Extended payment terms with suppliers, supply chain finance, reverse factoring", icon: <TrendingUp className="w-3 h-3 text-orange-400" /> },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-card/40 p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                {item.icon}
                <span className="font-medium text-[11px]">{item.label}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.action}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">Treasury Technology Stack</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs text-muted-foreground">
          {[
            { label: "TMS",             full: "Treasury Mgmt System",      examples: "Kyriba, GTreasury, FIS Quantum",     desc: "Central hub for cash positions, deals, and reporting" },
            { label: "ERP",             full: "Enterprise Resource Planning", examples: "SAP S/4HANA, Oracle Fusion",      desc: "Source of AR/AP data for cash forecasting" },
            { label: "Payment Factory", full: "Centralized Payments",      examples: "SAP Payment Engine, Bottomline",    desc: "Single gateway for all entity payments — reduces fraud risk" },
            { label: "Bank Portals",    full: "Banking Connectivity",      examples: "SWIFT gpi, Citi TTS, JPM Access",   desc: "Real-time balance reporting and account management" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-card/40 p-2.5">
              <div className="text-primary font-medium text-sm mb-0.5">{item.label}</div>
              <div className="text-xs text-muted-foreground/70 mb-1">{item.full}</div>
              <div className="text-xs text-foreground/80 mb-1">{item.examples}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: FX Risk Management ─────────────────────────────────────────────────

function FXRiskTab() {
  const [activeRow, setActiveRow] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total FX Exposure",  value: "$42B",   sub: "Enterprise-wide (8 currencies)", color: "text-primary" },
          { label: "FX Headwind (LTM)",  value: "-$1.8B", sub: "Impact on reported revenue",     color: "text-red-400" },
          { label: "Avg Hedge Tenor",    value: "12 mo",  sub: "Rolling forward program",        color: "text-foreground" },
          { label: "Hedging Cost (avg)", value: "0.65%",  sub: "% of notional hedged",           color: "text-amber-400" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={cn("mt-0.5 text-xl font-medium tabular-nums", item.color)}>{item.value}</p>
            <p className="text-xs text-muted-foreground/60">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">Three Types of FX Exposure</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              type: "Transaction",
              color: "#6366f1",
              desc: "Known future cash flows in a foreign currency — receivables, payables, debt service",
              example: "US company has €50M accounts receivable from German customer due in 90 days",
              hedge: "Forward contracts, FX options — hedge 75–100%",
            },
            {
              type: "Translation",
              color: "#22c55e",
              desc: "Consolidating foreign subsidiaries creates FX gains/losses in OCI on the balance sheet",
              example: "US parent consolidates €2B of European assets; EUR/USD movement flows through equity",
              hedge: "FX forwards / cross-currency swaps — net investment hedge designation",
            },
            {
              type: "Economic",
              color: "#f97316",
              desc: "Long-term competitive impact — FX affects relative pricing power vs foreign competitors",
              example: "Boeing vs Airbus: strong USD reduces Boeing competitiveness vs EUR-cost Airbus",
              hedge: "Natural hedge via local manufacturing; difficult to hedge with derivatives directly",
            },
          ].map((item) => (
            <div
              key={item.type}
              className="rounded-lg border border-border bg-card/40 p-3"
              style={{ borderLeftWidth: 3, borderLeftColor: item.color }}
            >
              <p className="font-medium text-sm mb-1" style={{ color: item.color }}>{item.type} Exposure</p>
              <p className="text-[11px] text-muted-foreground mb-2">{item.desc}</p>
              <div className="space-y-1.5">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60 mb-0.5">Example</p>
                  <p className="text-xs text-foreground/80">{item.example}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60 mb-0.5">Hedging Approach</p>
                  <p className="text-xs text-emerald-400">{item.hedge}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">Enterprise FX Exposure Dashboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                {["Currency", "Transaction ($M)", "Translation ($M)", "Economic ($M)", "Hedge Ratio", "Instrument"].map((h) => (
                  <th key={h} className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FX_EXPOSURES.map((row, i) => (
                <tr
                  key={row.currency}
                  className={cn(
                    "border-b border-border cursor-pointer transition-colors",
                    activeRow === i ? "bg-muted/10" : "hover:bg-card/80",
                  )}
                  onClick={() => setActiveRow(activeRow === i ? null : i)}
                >
                  <td className="py-2 pr-4 font-medium">
                    <span className="mr-1.5">{row.flag}</span>{row.currency}
                  </td>
                  <td className="py-2 pr-4 tabular-nums text-primary">${row.transactional.toLocaleString()}</td>
                  <td className="py-2 pr-4 tabular-nums text-primary">${row.translational.toLocaleString()}</td>
                  <td className="py-2 pr-4 tabular-nums text-orange-400">${row.economic.toLocaleString()}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${row.hedgeRatio}%`,
                            backgroundColor: row.hedgeRatio >= 70 ? "#22c55e" : row.hedgeRatio >= 40 ? "#eab308" : "#ef4444",
                          }}
                        />
                      </div>
                      <span className={cn(
                        "font-medium",
                        row.hedgeRatio >= 70 ? "text-emerald-400" :
                        row.hedgeRatio >= 40 ? "text-yellow-400"  : "text-red-400",
                      )}>{row.hedgeRatio}%</span>
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.instrument}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">Hedge Accounting — IFRS 9 / ASC 815</h3>
        </div>
        <HedgeAccountingDiagram />
      </div>

      <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-amber-400 mb-1">Emerging Market FX Hedging Challenges</p>
            <p className="text-muted-foreground mb-2">
              In markets like BRL, INR, CNY, and NGN, hedging is expensive (wide bid/ask, NDF structure) or outright restricted. Companies must weigh hedging cost vs FX risk reduction benefit carefully.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { currency: "BRL", cost: "3–5%/yr",   note: "High carry differential" },
                { currency: "INR", cost: "2–4%/yr",   note: "RBI controls" },
                { currency: "CNY", cost: "1.5–3%/yr", note: "Partially liberalized" },
                { currency: "NGN", cost: "8–15%/yr",  note: "Capital controls risk" },
              ].map((em) => (
                <div key={em.currency} className="rounded bg-card/60 p-2">
                  <p className="font-medium text-amber-400">{em.currency}</p>
                  <p className="text-red-400 text-[11px]">{em.cost}</p>
                  <p className="text-muted-foreground text-xs">{em.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Corporate Debt Markets ─────────────────────────────────────────────

function DebtMarketsTab() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const bondSteps = [
    { step: 1, label: "Mandate & Underwriter Selection", desc: "CFO/Board approves bond program. Invite 4–6 investment banks to pitch (bake-off). Select lead left bookrunner + 2–4 co-managers based on distribution reach, balance sheet, and research coverage." },
    { step: 2, label: "Rating Agency Process",           desc: "Meet with S&P, Moody's, Fitch. Provide 3-year financial projections, business strategy, and existing credit metrics. Rating letters received 3–6 weeks later. Critical for spread determination." },
    { step: 3, label: "Prospectus / 144A Preparation",  desc: "Legal counsel drafts prospectus (SEC-registered) or offering memo (144A/Reg S for private placement). Due diligence, disclosure of material risks, 3 years audited financials." },
    { step: 4, label: "Investor Roadshow",               desc: "CEO/CFO present to 20–40 institutional investors over 2–3 days. Reverse inquiry (interest before roadshow) typically 20–40% of deal. Price guidance issued after roadshow." },
    { step: 5, label: "Book Building",                   desc: "Order book opens. Investors submit orders (price + size). Strong demand allows tighter pricing (lower spread). Book typically 3–10× oversubscribed for IG issuers." },
    { step: 6, label: "Pricing",                         desc: "Bookrunner and company agree on final spread (e.g., T+85bps). New issue concession = premium vs secondary curve, typically 5–15bps for IG, 25–50bps for HY." },
    { step: 7, label: "Settlement (T+3)",                desc: "DTC / Euroclear settlement. Proceeds wired to company. Bonds begin trading in secondary market. Reporting obligation under SEC Rule 15c2-12 for public deals." },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "US IG Issuance YTD",  value: "$620B",  sub: "vs $540B prior year",       color: "text-primary" },
          { label: "IG Avg Spread",        value: "T+92",   sub: "bps vs 10Y UST",            color: "text-emerald-400" },
          { label: "HY Avg Spread",        value: "T+285",  sub: "OAS over Treasury",         color: "text-amber-400" },
          { label: "Avg New Issue Conc.",  value: "8bps",   sub: "IG NIC — tight conditions", color: "text-foreground" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={cn("mt-0.5 text-xl font-medium tabular-nums", item.color)}>{item.value}</p>
            <p className="text-xs text-muted-foreground/60">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">Investment Grade Bond Issuance Process</h3>
          <span className="text-xs text-muted-foreground ml-auto">Click steps for detail</span>
        </div>
        <div className="space-y-2">
          {bondSteps.map((step, i) => (
            <button
              key={step.step}
              onClick={() => setActiveStep(activeStep === i ? null : i)}
              className="w-full text-left rounded-lg border border-border bg-card/40 px-3 py-2.5 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-muted/10 text-primary flex items-center justify-center text-xs font-medium">
                  {step.step}
                </span>
                <span className="text-sm font-medium text-foreground">{step.label}</span>
                <ChevronRight className={cn("w-3 h-3 text-muted-foreground ml-auto transition-transform", activeStep === i && "rotate-90")} />
              </div>
              {activeStep === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 ml-8 text-xs text-muted-foreground leading-relaxed"
                >
                  {step.desc}
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">Debt Maturity Profile — Managing Refinancing Risk</h3>
        </div>
        <DebtMaturityChart />
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          {[
            { label: "Refinancing Cliff Risk",    desc: "Too much debt maturing in a single year — dangerous in rising rate environments. Best practice: spread maturities 2–3 years apart.",               icon: <AlertTriangle className="w-3 h-3 text-red-400" /> },
            { label: "Revolving Credit Facility", desc: "Committed backup liquidity ($1–5B typical for large IG). Revolver itself has 3–5Y tenor. Acts as bridge to bond markets when needed.",             icon: <RefreshCw className="w-3 h-3 text-primary" /> },
            { label: "Commercial Paper Program",  desc: "Issued at discount to face, maturities up to 270 days. Requires A1/P1 rating. Must be backstopped by undrawn revolver. Cheapest short-term funding.", icon: <Lock className="w-3 h-3 text-emerald-400" /> },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-card/40 p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                {item.icon}
                <span className="font-medium text-[11px]">{item.label}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">IG Corporate vs LBO Debt Structure</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                {["Feature", "Investment Grade Corp", "LBO / Leveraged Buyout"].map((h) => (
                  <th key={h} className="text-left py-2 pr-6 text-muted-foreground font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Leverage (Net Debt/EBITDA)", "0.5–2.5×",                  "4–7×"],
                ["Typical Rating",             "BBB to AAA",                "B to BB"],
                ["Primary Debt Types",         "Bonds, Revolver, CP",       "TLB, Senior Notes, PIK"],
                ["Covenant Package",           "Incurrence-only (bond)",    "Maintenance + incurrence"],
                ["Interest Coverage",          "8–20×",                     "1.5–3.5×"],
                ["Bond Market Access",         "24/7, any rate environment","Windows only; rate sensitive"],
                ["Refinancing Risk",           "Low — can issue any time",  "High — window-dependent"],
                ["Equity Cushion",             "60–80% of cap structure",   "20–35% of cap structure"],
              ].map(([feature, ig, lbo]) => (
                <tr key={feature} className="border-b border-border">
                  <td className="py-2 pr-6 font-medium text-foreground/80">{feature}</td>
                  <td className="py-2 pr-6 text-emerald-400">{ig}</td>
                  <td className="py-2 pr-6 text-orange-400">{lbo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Capital Allocation Framework ──────────────────────────────────────

function CapitalAllocationTab() {
  const [activeMethod, setActiveMethod] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "S&P 500 Buybacks (LTM)",  value: "$940B",  sub: "All-time record run rate",    color: "text-primary" },
          { label: "S&P 500 Dividends (LTM)", value: "$560B",  sub: "Div. + buyback total: $1.5T", color: "text-emerald-400" },
          { label: "Avg S&P 500 WACC",        value: "9.1%",   sub: "Damodaran Jan 2026",          color: "text-foreground" },
          { label: "M&A Deal Volume YTD",     value: "$1.2T",  sub: "Global announced deals",      color: "text-amber-400" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={cn("mt-0.5 text-xl font-medium tabular-nums", item.color)}>{item.value}</p>
            <p className="text-xs text-muted-foreground/60">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">Capital Allocation Waterfall</h3>
          <span className="text-xs text-muted-foreground ml-1">(Illustrative $120B EBITDA company)</span>
        </div>
        <CapAllocWaterfall />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 text-xs text-muted-foreground">
          {CAP_ALLOC_WATERFALL.filter((item) => !item.label.startsWith("=")).map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-sm mt-0.5 shrink-0" style={{ backgroundColor: item.color }} />
              <div>
                <span className="font-medium text-foreground/80">{item.label}:</span>
                <span className="text-muted-foreground ml-1">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Percent className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">WACC Calculation &amp; Hurdle Rate</h3>
        </div>
        <WaccBreakdown />
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          {[
            { metric: "NPV",     desc: "Net present value of future cash flows discounted at WACC. Accept if NPV > 0. Best for comparing projects of different scale.", pro: "Time-value correct",  con: "Terminal value sensitive" },
            { metric: "IRR",     desc: "Discount rate that makes NPV = 0. Accept if IRR > hurdle rate. Easy to communicate to non-finance managers.",                  pro: "Intuitive %",          con: "Multiple IRR problem" },
            { metric: "Payback", desc: "Years to recover initial investment. Ignores time value of money. Used as secondary screen for liquidity concerns.",            pro: "Liquidity lens",       con: "Ignores post-payback value" },
          ].map((item) => (
            <div key={item.metric} className="rounded-lg border border-border bg-card/40 p-2.5">
              <p className="font-medium text-primary text-sm mb-1">{item.metric}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.desc}</p>
              <p className="text-[11px] text-emerald-400">+ {item.pro}</p>
              <p className="text-[11px] text-red-400">- {item.con}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">Share Buyback Mechanics</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {BUYBACK_METHODS.map((method, i) => (
            <button
              key={method.method}
              onClick={() => setActiveMethod(activeMethod === i ? null : i)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                activeMethod === i ? "border-primary/60 bg-muted/10" : "border-border bg-card/40 hover:bg-card/80",
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-primary">{method.icon}</span>
                <span className="text-sm font-medium text-foreground">{method.method}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{method.description}</p>
              {activeMethod === i && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pt-2 border-t border-border"
                >
                  <div>
                    <p className="text-muted-foreground/60 uppercase text-[11px] mb-0.5">Speed</p>
                    <p className="text-foreground">{method.speed}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground/60 uppercase text-[11px] mb-0.5">Premium</p>
                    <p className="text-orange-400">{method.premium}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground/60 uppercase text-[11px] mb-0.5">Best For</p>
                    <p className="text-foreground">{method.useCase}</p>
                  </div>
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">Big Tech Capital Allocation Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                {["Company", "Cash ($B)", "FCF Yield", "Div Yield", "Buyback Yield", "Capex %FCF", "M&A %FCF", "Cash Return %FCF", "Rating"].map((h) => (
                  <th key={h} className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPANY_CAP_ALLOC.map((co) => (
                <tr key={co.ticker} className="border-b border-border hover:bg-card/80 transition-colors">
                  <td className="py-2 pr-4">
                    <div className="font-medium text-foreground">{co.company}</div>
                    <div className="text-muted-foreground/60 text-xs">{co.ticker}</div>
                  </td>
                  <td className="py-2 pr-4 tabular-nums text-emerald-400 font-medium">${co.cashOnHand}</td>
                  <td className="py-2 pr-4 tabular-nums text-primary font-medium">{co.fcfYield.toFixed(1)}%</td>
                  <td className="py-2 pr-4 tabular-nums text-primary">{co.dividendYield.toFixed(1)}%</td>
                  <td className="py-2 pr-4 tabular-nums text-primary font-medium">{co.buybackYield.toFixed(1)}%</td>
                  <td className="py-2 pr-4 tabular-nums text-muted-foreground">{co.capexPct}%</td>
                  <td className="py-2 pr-4 tabular-nums text-muted-foreground">{co.maPct}%</td>
                  <td className="py-2 pr-4">
                    <span className={cn(
                      "text-xs text-muted-foreground font-medium rounded px-1.5 py-0.5",
                      co.cashReturnPct >= 100 ? "bg-emerald-500/15 text-emerald-400" :
                      co.cashReturnPct >= 80  ? "bg-muted/10 text-primary"       :
                      "bg-orange-500/15 text-orange-400",
                    )}>
                      {co.cashReturnPct}%
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">{co.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
          {[
            { company: "Apple",     insight: "Cash return > 100% FCF — funded by issuing debt at low rates; highly efficient capital structure leveraged by AAA balance sheet.",  color: "#22c55e" },
            { company: "Microsoft", insight: "Significant M&A capex (Activision $69B); excluding that, return profile is similar to Apple. AI capex now accelerating.",          color: "#6366f1" },
            { company: "Alphabet",  insight: "No dividend until 2024; now slowly introducing. Buybacks dominate. Increasing capex for AI infrastructure ($50B+ annually).",     color: "#f97316" },
            { company: "Amazon",    insight: "Historically capex-intensive (AWS, logistics). Lowest cash return ratio — reinvestment model over shareholder return model.",      color: "#ec4899" },
          ].map((item) => (
            <div key={item.company} className="rounded-lg border border-border bg-card/40 p-2">
              <p className="font-medium mb-1" style={{ color: item.color }}>{item.company}</p>
              <p className="text-muted-foreground leading-relaxed">{item.insight}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card/50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-sm font-medium">Dividend vs Buyback Signaling Theory</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs text-muted-foreground">
          {[
            {
              title: "Dividend Signaling",
              color: "#22c55e",
              points: [
                "Lintner (1956): managers smooth dividends, reluctant to cut",
                "Dividend cut signals weak earnings — stock drops 8–12% on cut announcement",
                "Initiating a dividend signals management confidence in sustainable earnings",
                "Preferred by income investors (pension funds, retirees) — creates stable demand",
              ],
            },
            {
              title: "Buyback Signaling",
              color: "#6366f1",
              points: [
                "Ikenberry (1995): buyback announcements average +12% abnormal return over 4 years",
                "Buyback signals management believes stock is undervalued vs intrinsic value",
                "More flexible than dividends — can pause without penalty (no 'dividend cut' stigma)",
                "Tax-advantaged vs dividends for US taxable investors (capital gains vs ordinary income)",
              ],
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-card/40 p-3">
              <p className="font-medium mb-2" style={{ color: item.color }}>{item.title}</p>
              <ul className="space-y-1">
                {item.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" style={{ color: item.color }} />
                    <span className="text-muted-foreground leading-relaxed">{pt}</span>
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CorpTreasuryPage() {
  useMemo(() => {
    void rand(); void rand(); void rand();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-l-4 border-l-primary rounded-md bg-card p-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground/50" />
              <h1 className="text-xl font-semibold tracking-tight">Corporate Treasury Management</h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Cash management, FX hedging, debt capital markets, share buybacks, and capital allocation frameworks — the full CFO toolkit.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              IFRS 9 / ASC 815
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/10 px-3 py-1 text-xs font-medium text-primary">
              <Shield className="w-3 h-3" />
              Investment Grade Focus
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue="cash">
          <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
            <TabsTrigger value="cash" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Cash &amp; Liquidity</TabsTrigger>
            <TabsTrigger value="fx" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">FX Risk Management</TabsTrigger>
            <TabsTrigger value="debt" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Corporate Debt Markets</TabsTrigger>
            <TabsTrigger value="capalloc" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Capital Allocation</TabsTrigger>
          </TabsList>

          <TabsContent value="cash">
            <CashLiquidityTab />
          </TabsContent>
          <TabsContent value="fx">
            <FXRiskTab />
          </TabsContent>
          <TabsContent value="debt">
            <DebtMarketsTab />
          </TabsContent>
          <TabsContent value="capalloc">
            <CapitalAllocationTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
